require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const crypto = require('crypto');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const nodemailer = require('nodemailer');

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '../public')));

// Email Transporter Configuration
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
    }
});

// In-memory storage for bookings (replace with database in production)
const bookings = [];

// Availability configuration (stored in memory - use database for persistence)
let blockedDates = [];

// Routes

// Serve the main HTML file
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../views/index.html'));
});

// Get Stripe public key
app.get('/config', (req, res) => {
    res.json({
        publicKey: process.env.STRIPE_PUBLIC_KEY
    });
});

// Create Payment Intent
app.post('/create-payment-intent', async (req, res) => {
    try {
        const { amount, hairstyle, length } = req.body;

        // Validate amount
        if (!amount || amount < 1000) {
            return res.status(400).json({ error: 'Invalid amount' });
        }

        const paymentIntent = await stripe.paymentIntents.create({
            amount: amount,
            currency: 'gbp',
            metadata: {
                hairstyle: hairstyle,
                length: length
            }
        });

        res.json({
            clientSecret: paymentIntent.client_secret,
            paymentIntentId: paymentIntent.id
        });
    } catch (error) {
        console.error('Payment intent error:', error);
        res.status(500).json({ error: error.message });
    }
});

// Submit Booking
app.post('/submit-booking', async (req, res) => {
    try {
        const {
            fullName,
            phone,
            email,
            preferredDate,
            preferredTime,
            notes,
            hairstyle,
            length,
            price,
            addons,
            addonTotal,
            totalPrice,
            paymentIntentId
        } = req.body;

        // Validate required fields
        if (!fullName || !phone || !preferredDate || !preferredTime) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        // Create booking object
        const booking = {
            id: Date.now(),
            fullName,
            phone,
            email: email || 'Not provided',
            preferredDate,
            preferredTime,
            notes: notes || 'None',
            hairstyle,
            length,
            price,
            addons: addons || [],
            addonTotal: addonTotal || 0,
            totalPrice: totalPrice || price,
            depositPaid: hairstyle === 'Add-Ons' ? 0 : 10,
            paymentIntentId,
            bookedAt: new Date().toISOString(),
            status: 'confirmed',
            cancellationToken: crypto.randomBytes(32).toString('hex'),
            cancelled: false,
            cancelledAt: null,
            cancellationReason: null
        };

        // Store booking
        bookings.push(booking);

        // Send response immediately
        res.json({
            success: true,
            bookingId: booking.id,
            message: 'Booking confirmed successfully'
        });

        // Send emails asynchronously without blocking
        setImmediate(async () => {
            console.log('Starting email send for booking:', booking.id);
            try {
                await sendConfirmationEmail(booking);
                console.log('Owner confirmation email sent successfully');
            } catch (emailError) {
                console.error('Failed to send confirmation email:', emailError.message);
            }

            if (email) {
                try {
                    await sendCustomerConfirmationEmail(booking);
                    console.log('Customer confirmation email sent successfully');
                } catch (emailError) {
                    console.error('Failed to send customer email:', emailError.message);
                }
            } else {
                console.log('No customer email provided, skipping customer notification');
            }
        });
    } catch (error) {
        console.error('Booking submission error:', error);
        res.status(500).json({ error: error.message });
    }
});

// Send confirmation email to business owner
async function sendConfirmationEmail(booking) {
    let addonsHTML = '';
    if (booking.addons && booking.addons.length > 0) {
        addonsHTML = '<p><strong>Add-ons:</strong></p><ul>';
        booking.addons.forEach(addon => {
            addonsHTML += `<li>${addon.name} — £${addon.price}.00</li>`;
        });
        addonsHTML += '</ul>';
    }
    
    const emailContent = `
        <h2>New Booking Confirmation</h2>
        <p><strong>Client Name:</strong> ${booking.fullName}</p>
        <p><strong>Phone Number:</strong> ${booking.phone}</p>
        <p><strong>Email Address:</strong> ${booking.email}</p>
        <hr>
        <p><strong>Hairstyle:</strong> ${booking.hairstyle}</p>
        <p><strong>Length:</strong> ${booking.length}</p>
        <p><strong>Base Price:</strong> £${booking.price}.00</p>
        ${addonsHTML}
        ${booking.addonTotal > 0 ? `<p><strong>Add-ons Total:</strong> £${booking.addonTotal}.00</p>` : ''}
        <p><strong>Total Price:</strong> £${booking.totalPrice}.00</p>
        ${booking.depositPaid > 0 ? `<p><strong>Deposit Paid:</strong> £${booking.depositPaid}.00 (Non-refundable) — Deducted from final price</p>` : '<p><strong>No Deposit Required</strong> (Add-ons only)</p>'}
        <hr>
        <p><strong>Preferred Date:</strong> ${booking.preferredDate}</p>
        <p><strong>Preferred Time:</strong> ${booking.preferredTime}</p>
        <p><strong>Additional Notes:</strong> ${booking.notes}</p>
        <hr>
        <p><strong>Payment Intent ID:</strong> ${booking.paymentIntentId || 'N/A'}</p>
        <p><strong>Booked At:</strong> ${booking.bookedAt}</p>
        <p>Please contact the client to confirm the appointment time.</p>
    `;

    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: process.env.EMAIL_TO,
        subject: `New Booking: ${booking.fullName} - ${booking.hairstyle}`,
        html: emailContent
    };

    return new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
            reject(new Error('Email send timeout'));
        }, 10000);
        
        transporter.sendMail(mailOptions, (error, info) => {
            clearTimeout(timeout);
            if (error) {
                console.error('Email sending error:', error);
                reject(error);
            } else {
                console.log('Email sent:', info.response);
                resolve(info);
            }
        });
    });
}

// Send confirmation email to customer
async function sendCustomerConfirmationEmail(booking) {
    const cancellationLink = `${process.env.APP_URL || 'http://localhost:5000'}/cancel-booking?id=${booking.id}&token=${booking.cancellationToken}`;
    
    const emailContent = `
        <h2>Your Booking is Confirmed!</h2>
        <p>Hi ${booking.fullName},</p>
        <p>Thank you for booking with Slayed by Yili!</p>
        <hr>
        <h3>Booking Details</h3>
        <p><strong>Hairstyle:</strong> ${booking.hairstyle}</p>
        <p><strong>Length:</strong> ${booking.length}</p>
        <p><strong>Date:</strong> ${booking.preferredDate}</p>
        <p><strong>Time:</strong> ${booking.preferredTime}</p>
        <p><strong>Total Price:</strong> £${booking.price}.00</p>
        <p><strong>Deposit Paid:</strong> £${booking.depositPaid}.00</p>
        <hr>
        <p>You'll receive a confirmation message from Yili to confirm your appointment.</p>
        <p>Thank you for choosing Slayed by Yili!</p>
        <hr>
        <h3>Need to Cancel?</h3>
        <p><a href="${cancellationLink}" style="background-color: #d4af37; color: #0a0a0a; padding: 10px 20px; text-decoration: none; border-radius: 4px; display: inline-block; font-weight: bold;">Cancel Booking</a></p>
        <p><small>You can cancel for free if you do so more than 24 hours before your appointment.</small></p>
    `;

    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: booking.email,
        subject: 'Booking Confirmation - Slayed by Yili',
        html: emailContent
    };

    return new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
            reject(new Error('Email send timeout'));
        }, 10000);
        
        transporter.sendMail(mailOptions, (error, info) => {
            clearTimeout(timeout);
            if (error) {
                console.error('Customer email error:', error);
                reject(error);
            } else {
                console.log('Customer email sent:', info.response);
                resolve(info);
            }
        });
    });
}

// Get all bookings (for admin dashboard - protect this in production)
app.get('/api/bookings', (req, res) => {
    res.json(bookings);
});

// Get availability configuration (blocked dates)
app.get('/api/availability', (req, res) => {
    res.json({
        blockedDates: blockedDates
    });
});

// Add blocked date (for holidays, etc.)
app.post('/api/blocked-dates', (req, res) => {
    try {
        const { date } = req.body;
        
        if (!date) {
            return res.status(400).json({ error: 'Date is required' });
        }
        
        if (!blockedDates.includes(date)) {
            blockedDates.push(date);
        }
        
        res.json({
            success: true,
            message: `Date ${date} has been blocked`,
            blockedDates: blockedDates
        });
    } catch (error) {
        console.error('Error adding blocked date:', error);
        res.status(500).json({ error: error.message });
    }
});

// Remove blocked date
app.delete('/api/blocked-dates/:date', (req, res) => {
    try {
        const { date } = req.params;
        
        blockedDates = blockedDates.filter(d => d !== date);
        
        res.json({
            success: true,
            message: `Date ${date} has been unblocked`,
            blockedDates: blockedDates
        });
    } catch (error) {
        console.error('Error removing blocked date:', error);
        res.status(500).json({ error: error.message });
    }
});

// Get all blocked dates
app.get('/api/blocked-dates', (req, res) => {
    res.json(blockedDates);
});

// Get booking details for cancellation page
app.get('/api/booking/:id/:token', (req, res) => {
    try {
        const { id, token } = req.params;
        const booking = bookings.find(b => b.id == id && b.cancellationToken === token);
        
        if (!booking) {
            return res.status(404).json({ error: 'Booking not found' });
        }
        
        if (booking.cancelled) {
            return res.status(400).json({ error: 'This booking has already been cancelled' });
        }
        
        // Calculate hours until appointment
        const appointmentDateTime = new Date(`${booking.preferredDate}T${booking.preferredTime}`);
        const now = new Date();
        const hoursUntilAppointment = (appointmentDateTime - now) / (1000 * 60 * 60);
        
        res.json({
            id: booking.id,
            fullName: booking.fullName,
            hairstyle: booking.hairstyle,
            length: booking.length,
            preferredDate: booking.preferredDate,
            preferredTime: booking.preferredTime,
            totalPrice: booking.totalPrice,
            hoursUntilAppointment: Math.ceil(hoursUntilAppointment),
            requiresPayment: hoursUntilAppointment < 24,
            cancellationFee: hoursUntilAppointment < 24 ? 5 : 0
        });
    } catch (error) {
        console.error('Error fetching booking:', error);
        res.status(500).json({ error: error.message });
    }
});

// Serve cancellation page
app.get('/cancel-booking', (req, res) => {
    const { id, token } = req.query;
    
    if (!id || !token) {
        return res.status(400).send('Invalid cancellation link');
    }
    
    const cancellationPage = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Cancel Booking - Slayed by Yili</title>
        <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body {
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                background: linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%);
                color: #1a1a1a;
                line-height: 1.6;
                padding: 20px;
                min-height: 100vh;
                display: flex;
                align-items: center;
                justify-content: center;
            }
            .container {
                max-width: 600px;
                background: white;
                padding: 2rem;
                border-radius: 8px;
                box-shadow: 0 8px 32px rgba(0,0,0,0.2);
                border-top: 4px solid #d4af37;
            }
            h1 {
                color: #d4af37;
                margin-bottom: 1.5rem;
                text-align: center;
            }
            .booking-details {
                background: #f9f9f9;
                padding: 1.5rem;
                border-radius: 4px;
                margin-bottom: 1.5rem;
                border-left: 4px solid #d4af37;
            }
            .booking-details p {
                margin-bottom: 0.75rem;
                display: flex;
                justify-content: space-between;
            }
            .booking-details strong {
                color: #0a0a0a;
            }
            .warning-box {
                background: #fff3cd;
                border: 2px solid #ffc107;
                padding: 1.5rem;
                border-radius: 4px;
                margin-bottom: 1.5rem;
            }
            .warning-box h3 {
                color: #ff6b6b;
                margin-bottom: 0.75rem;
            }
            .warning-box p {
                color: #333;
                margin-bottom: 0.5rem;
            }
            .fee-info {
                background: #e3f2fd;
                border: 2px solid #2196F3;
                padding: 1.5rem;
                border-radius: 4px;
                margin-bottom: 1.5rem;
                display: none;
            }
            .fee-info h3 {
                color: #1976D2;
                margin-bottom: 0.75rem;
            }
            .fee-info p {
                color: #555;
                margin-bottom: 0.5rem;
            }
            .form-group {
                margin-bottom: 1.5rem;
            }
            label {
                display: block;
                margin-bottom: 0.5rem;
                color: #d4af37;
                font-weight: 600;
            }
            textarea {
                width: 100%;
                padding: 0.75rem;
                border: 2px solid #d4af37;
                border-radius: 4px;
                font-family: inherit;
                font-size: 1rem;
                resize: vertical;
                min-height: 100px;
            }
            textarea:focus {
                outline: none;
                box-shadow: 0 0 0 3px rgba(212, 175, 55, 0.1);
            }
            .buttons {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 1rem;
            }
            .btn {
                padding: 0.75rem 1.5rem;
                border: none;
                border-radius: 4px;
                font-size: 1rem;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.3s ease;
            }
            .btn-cancel {
                background-color: #ff6b6b;
                color: white;
            }
            .btn-cancel:hover {
                background-color: #ff5252;
            }
            .btn-reschedule {
                background-color: #d4af37;
                color: #0a0a0a;
            }
            .btn-reschedule:hover {
                background-color: #c99a2d;
            }
            .btn-back {
                background-color: #ccc;
                color: #333;
            }
            .btn-back:hover {
                background-color: #bbb;
            }
            .loading {
                text-align: center;
                padding: 2rem;
            }
            .spinner {
                border: 4px solid #f3f3f3;
                border-top: 4px solid #d4af37;
                border-radius: 50%;
                width: 40px;
                height: 40px;
                animation: spin 1s linear infinite;
                margin: 0 auto 1rem;
            }
            @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }
            .error {
                background: #ffebee;
                border: 2px solid #ff5252;
                color: #c62828;
                padding: 1.5rem;
                border-radius: 4px;
                margin-bottom: 1rem;
            }
            .success {
                background: #e8f5e9;
                border: 2px solid #4caf50;
                color: #2e7d32;
                padding: 1.5rem;
                border-radius: 4px;
                margin-bottom: 1rem;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <h1>Cancel Booking</h1>
            <div id="content">
                <div class="loading">
                    <div class="spinner"></div>
                    <p>Loading booking details...</p>
                </div>
            </div>
        </div>

        <script>
            const bookingId = '${id}';
            const token = '${token}';

            async function loadBooking() {
                try {
                    const response = await fetch(\`/api/booking/\${bookingId}/\${token}\`);
                    const data = await response.json();

                    if (!response.ok) {
                        showError(data.error);
                        return;
                    }

                    showCancellationForm(data);
                } catch (error) {
                    showError('Failed to load booking details. Please try again.');
                    console.error('Error:', error);
                }
            }

            function showError(message) {
                document.getElementById('content').innerHTML = \`
                    <div class="error">
                        <strong>Error:</strong> \${message}
                    </div>
                \`;
            }

            function showCancellationForm(booking) {
                const hoursLeft = booking.hoursUntilAppointment;
                const requiresFee = booking.requiresPayment;
                const fee = booking.cancellationFee;

                let content = \`
                    <div class="booking-details">
                        <h3>Your Booking</h3>
                        <p><strong>Hairstyle:</strong> <span>\${booking.hairstyle}</span></p>
                        <p><strong>Length:</strong> <span>\${booking.length}</span></p>
                        <p><strong>Date:</strong> <span>\${booking.preferredDate}</span></p>
                        <p><strong>Time:</strong> <span>\${booking.preferredTime}</span></p>
                        <p><strong>Total Price:</strong> <span>£\${booking.totalPrice}.00</span></p>
                    </div>
                \`;

                if (hoursLeft <= 0) {
                    content += \`
                        <div class="error">
                            <strong>Appointment Time Passed:</strong><br>
                            Your appointment time has already passed. If you did not attend, please contact Yili directly at 07500 039928 or pecusadoh@gmail.com.
                        </div>
                    \`;
                } else if (requiresFee && hoursLeft < 24) {
                    content += \`
                        <div class="warning-box">
                            <h3>⚠️ Cancellation Fee Required</h3>
                            <p><strong>Hours until appointment:</strong> \${hoursLeft}h</p>
                            <p>You are cancelling less than 24 hours before your appointment.</p>
                            <p><strong>A £5 cancellation fee applies.</strong></p>
                            <p>You will need to pay this fee before your cancellation is confirmed.</p>
                        </div>
                        <div class="fee-info" style="display: block;">
                            <h3>Valid Reason Exception</h3>
                            <p>If you have a valid reason (emergency, illness, etc.), you can provide details below and Yili may waive the fee manually.</p>
                        </div>
                    \`;
                } else {
                    content += \`
                        <div style="background: #e8f5e9; border: 2px solid #4caf50; padding: 1.5rem; border-radius: 4px; margin-bottom: 1.5rem;">
                            <h3 style="color: #2e7d32; margin-bottom: 0.5rem;">✓ Free Cancellation</h3>
                            <p style="color: #555;"><strong>Hours until appointment:</strong> \${hoursLeft}h</p>
                            <p style="color: #555;">You are cancelling more than 24 hours before your appointment.</p>
                            <p style="color: #2e7d32;"><strong>No cancellation fee required!</strong></p>
                        </div>
                    \`;
                }

                content += \`
                    <form id="cancellationForm">
                        <div class="form-group">
                            <label>Reason for Cancellation (Optional)</label>
                            <textarea id="cancellationReason" placeholder="If cancelling within 24 hours with a valid reason, explain here and Yili may waive the fee..."></textarea>
                        </div>
                        <div class="buttons">
                            <button type="button" class="btn btn-back" onclick="window.history.back()">Back</button>
                            <button type="button" class="btn btn-reschedule" onclick="handleRescheduleClick()">Reschedule</button>
                            <button type="submit" class="btn btn-cancel">Cancel</button>
                        </div>
                    </form>
                \`;

                document.getElementById('content').innerHTML = content;
                
                // Store booking globally for reschedule access
                window.currentBooking = booking;

                document.getElementById('cancellationForm').addEventListener('submit', async (e) => {
                    e.preventDefault();
                    await submitCancellation(booking, requiresFee, fee);
                });
            }

            function handleRescheduleClick() {
                if (!window.currentBooking) return;
                const booking = window.currentBooking;
                
                // Store booking data and redirect to reschedule page
                sessionStorage.setItem('rescheduleBookingId', booking.id);
                sessionStorage.setItem('rescheduleToken', token);
                sessionStorage.setItem('rescheduleHairstyle', booking.hairstyle);
                sessionStorage.setItem('rescheduleLength', booking.length);
                sessionStorage.setItem('reschedulePrice', booking.totalPrice);
                sessionStorage.setItem('rescheduleAddons', JSON.stringify(booking.addons || []));
                sessionStorage.setItem('rescheduleOldDate', booking.preferredDate);
                
                window.location.href = '/?reschedule=true&id=' + booking.id + '&token=' + token;
            }

            async function submitCancellation(booking, requiresFee, fee) {
                const reason = document.getElementById('cancellationReason').value;

                if (requiresFee && fee > 0) {
                    // Redirect to Square payment
                    const message = reason ? \`Cancellation reason: \${reason}\` : 'Client cancellation';
                    window.location.href = 'https://square.link/u/v9sOhayT?restock=true';
                    
                    // Store cancellation request (will be confirmed after payment)
                    setTimeout(() => {
                        confirmCancellation(booking.id, reason, true);
                    }, 500);
                } else {
                    // Free cancellation
                    confirmCancellation(booking.id, reason, false);
                }
            }

            async function confirmCancellation(bookingId, reason, awaitingPayment) {
                try {
                    const response = await fetch('/api/cancel-booking', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            id: bookingId,
                            token: token,
                            cancellationReason: reason || 'No reason provided',
                            awaitingPayment: awaitingPayment
                        })
                    });

                    const data = await response.json();

                    if (response.ok) {
                        document.getElementById('content').innerHTML = \`
                            <div class="success">
                                <h3>✓ Cancellation Submitted</h3>
                                <p>\${data.message}</p>
                                <p style="margin-top: 1rem; font-size: 0.95rem;">Yili will confirm your cancellation. A confirmation email has been sent to the address on file.</p>
                            </div>
                        \`;
                    } else {
                        showError(data.error);
                    }
                } catch (error) {
                    showError('Failed to process cancellation. Please try again.');
                    console.error('Error:', error);
                }
            }

            // Load booking on page load
            loadBooking();
        </script>
    </body>
    </html>
    `;
    
    res.send(cancellationPage);
});

// Cancel booking API endpoint
app.post('/api/cancel-booking', (req, res) => {
    try {
        const { id, token, cancellationReason, awaitingPayment } = req.body;
        
        if (!id || !token) {
            return res.status(400).json({ error: 'Invalid cancellation request' });
        }
        
        const bookingIndex = bookings.findIndex(b => b.id == id && b.cancellationToken === token);
        
        if (bookingIndex === -1) {
            return res.status(404).json({ error: 'Booking not found' });
        }
        
        const booking = bookings[bookingIndex];
        
        if (booking.cancelled) {
            return res.status(400).json({ error: 'This booking has already been cancelled' });
        }
        
        // Calculate hours until appointment
        const appointmentDateTime = new Date(`${booking.preferredDate}T${booking.preferredTime}`);
        const now = new Date();
        const hoursUntilAppointment = (appointmentDateTime - now) / (1000 * 60 * 60);
        
        if (hoursUntilAppointment <= 0) {
            return res.status(400).json({ error: 'Appointment time has passed. Cannot cancel.' });
        }
        
        // Update booking
        booking.cancelled = true;
        booking.cancelledAt = new Date().toISOString();
        booking.cancellationReason = cancellationReason;
        booking.status = 'cancelled';
        
        // Remove from blocked dates
        const dateIndex = blockedDates.indexOf(booking.preferredDate);
        if (dateIndex > -1) {
            blockedDates.splice(dateIndex, 1);
        }
        
        // Send cancellation confirmation email
        sendCancellationConfirmationEmail(booking, hoursUntilAppointment, awaitingPayment);
        
        // Send notification to stylist
        sendCancellationNotificationToStylist(booking, hoursUntilAppointment, awaitingPayment);
        
        const message = awaitingPayment 
            ? 'Cancellation request submitted. You will need to complete the £5 payment before cancellation is confirmed.' 
            : 'Booking cancelled successfully. Your deposit will be refunded according to our cancellation policy.';
        
        res.json({
            success: true,
            message: message,
            bookingId: booking.id
        });
    } catch (error) {
        console.error('Cancellation error:', error);
        res.status(500).json({ error: error.message });
    }
});

// Send cancellation confirmation email to customer
async function sendCancellationConfirmationEmail(booking, hoursUntilAppointment, awaitingPayment) {
    let emailContent = `
        <h2>Booking Cancellation Request Received</h2>
        <p>Hi ${booking.fullName},</p>
        <p>We have received your cancellation request for your appointment on <strong>${booking.preferredDate} at ${booking.preferredTime}</strong>.</p>
        <hr>
        <h3>Cancellation Details</h3>
        <p><strong>Hairstyle:</strong> ${booking.hairstyle}</p>
        <p><strong>Original Deposit:</strong> £${booking.depositPaid}.00</p>
    `;
    
    if (awaitingPayment) {
        emailContent += `
            <p><strong>Cancellation Fee:</strong> £5.00</p>
            <p style="color: #ff6b6b;"><strong>Status:</strong> Awaiting payment confirmation</p>
            <p>You cancelled less than 24 hours before your appointment. A £5 cancellation fee applies. Your cancellation will be confirmed after payment is processed.</p>
        `;
    } else {
        emailContent += `
            <p style="color: #4caf50;"><strong>Status:</strong> Free Cancellation Confirmed</p>
            <p>You cancelled more than 24 hours before your appointment. No cancellation fee applies. Your deposit will be refunded.</p>
        `;
    }
    
    emailContent += `
        <hr>
        <p><strong>What happens next?</strong></p>
        <p>Yili will confirm your cancellation and process your refund accordingly. You will receive a confirmation email shortly.</p>
        <p>If you have any questions, please contact us:</p>
        <p>Email: pecusadoh@gmail.com<br>Phone: 07500 039928</p>
    `;

    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: booking.email,
        subject: 'Booking Cancellation Request - Slayed by Yili',
        html: emailContent
    };

    return new Promise((resolve, reject) => {
        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.error('Cancellation email error:', error);
                reject(error);
            } else {
                console.log('Cancellation email sent:', info.response);
                resolve(info);
            }
        });
    });
}

// Send cancellation notification to stylist
async function sendCancellationNotificationToStylist(booking, hoursUntilAppointment, awaitingPayment) {
    let emailContent = `
        <h2>Booking Cancellation Notification</h2>
        <p><strong>${booking.fullName}</strong> has requested to cancel their booking.</p>
        <hr>
        <h3>Booking Details</h3>
        <p><strong>Hairstyle:</strong> ${booking.hairstyle}</p>
        <p><strong>Length:</strong> ${booking.length}</p>
        <p><strong>Scheduled Date:</strong> ${booking.preferredDate}</p>
        <p><strong>Scheduled Time:</strong> ${booking.preferredTime}</p>
        <p><strong>Cancellation Reason:</strong> ${booking.cancellationReason}</p>
        <hr>
        <h3>Refund Policy</h3>
        <p><strong>Hours before appointment:</strong> ${Math.ceil(hoursUntilAppointment)}h</p>
    `;
    
    if (awaitingPayment) {
        emailContent += `
            <p><strong>Status:</strong> Awaiting £5 cancellation fee payment</p>
            <p>Client cancelled less than 24 hours before appointment. They need to pay £5 before cancellation is confirmed.</p>
            <p style="color: #ff6b6b;"><strong>Action required:</strong> Review cancellation reason - fee may be waivable if valid reason provided.</p>
        `;
    } else {
        emailContent += `
            <p><strong>Status:</strong> Free cancellation confirmed</p>
            <p>Client cancelled more than 24 hours before appointment. Process refund of £${booking.depositPaid}.00.</p>
        `;
    }
    
    emailContent += `
        <hr>
        <p><strong>Client Contact:</strong></p>
        <p>Name: ${booking.fullName}<br>Phone: ${booking.phone}<br>Email: ${booking.email}</p>
    `;

    const subject = `Cancellation Request: ${booking.fullName} - ${booking.preferredDate}`;

    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: process.env.EMAIL_TO,
        subject: subject,
        html: emailContent
    };

    return new Promise((resolve, reject) => {
        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.error('Stylist notification error:', error);
                reject(error);
            } else {
                console.log('Stylist notification sent:', info.response);
                resolve(info);
            }
        });
    });
}

// Get available time slots (for reschedule)
app.get('/api/available-slots', (req, res) => {
    try {
        // Define availability config (same as frontend)
        const availabilityConfig = {
            termTime: {
                Monday: { startTime: '15:30', endTime: '23:59', maxClients: 1 },
                Tuesday: { startTime: '15:30', endTime: '23:59', maxClients: 1 },
                Wednesday: { startTime: '15:30', endTime: '23:59', maxClients: 1 },
                Thursday: { startTime: '06:00', endTime: '23:59', maxClients: 1 },
                Friday: { startTime: '06:00', endTime: '23:59', maxClients: 1 },
                Saturday: { startTime: '06:00', endTime: '23:59', maxClients: 1 },
                Sunday: { startTime: '15:30', endTime: '23:59', maxClients: 1 }
            }
        };
        
        const slots = [];
        const now = new Date();
        
        // Generate slots for the next 90 days
        for (let i = 1; i <= 90; i++) {
            const date = new Date();
            date.setDate(date.getDate() + i);
            
            const dateStr = date.toISOString().split('T')[0];
            const dayName = date.toLocaleDateString('en-US', { weekday: 'long' });
            
            // Skip if date is blocked
            if (blockedDates.includes(dateStr)) continue;
            
            // Get availability for this day
            const dayAvailability = availabilityConfig.termTime[dayName];
            if (!dayAvailability) continue;
            
            // Parse times
            const [startHour, startMin] = dayAvailability.startTime.split(':').map(Number);
            const [endHour, endMin] = dayAvailability.endTime.split(':').map(Number);
            
            // Generate 30-minute slots
            for (let hour = startHour; hour <= endHour; hour++) {
                for (let min = 0; min < 60; min += 30) {
                    if (hour === endHour && min > 0) break;
                    
                    const timeStr = `${String(hour).padStart(2, '0')}:${String(min).padStart(2, '0')}`;
                    
                    // Check if slot is already booked
                    const isBooked = bookings.some(b => 
                        b.preferredDate === dateStr && 
                        b.preferredTime === timeStr && 
                        !b.cancelled
                    );
                    
                    if (!isBooked) {
                        slots.push({
                            date: dateStr,
                            time: timeStr,
                            dayName: dayName
                        });
                    }
                }
            }
        }
        
        console.log('Available slots generated:', slots.length, 'total slots');
        res.json(slots); // Return ALL available slots
    } catch (error) {
        console.error('Error fetching available slots:', error);
        res.status(500).json({ error: error.message });
    }
});

// Get blocked dates
app.get('/api/blocked-dates', (req, res) => {
    res.json(blockedDates);
});

// Block date
app.post('/api/blocked-dates', (req, res) => {
    try {
        const { date } = req.body;
        if (!date) {
            return res.status(400).json({ error: 'Date required' });
        }
        if (!blockedDates.includes(date)) {
            blockedDates.push(date);
        }
        res.json({ message: 'Date blocked', blockedDates });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Unblock date
app.delete('/api/blocked-dates/:date', (req, res) => {
    try {
        const { date } = req.params;
        const index = blockedDates.indexOf(date);
        if (index > -1) {
            blockedDates.splice(index, 1);
        }
        res.json({ message: 'Date unblocked', blockedDates });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Reschedule booking API endpoint
app.post('/api/reschedule-booking', (req, res) => {
    try {
        const { id, token, newDate, newTime } = req.body;
        
        if (!id || !token || !newDate || !newTime) {
            return res.status(400).json({ error: 'Invalid reschedule request' });
        }
        
        const bookingIndex = bookings.findIndex(b => b.id == id && b.cancellationToken === token);
        
        if (bookingIndex === -1) {
            return res.status(404).json({ error: 'Booking not found' });
        }
        
        const booking = bookings[bookingIndex];
        
        if (booking.cancelled) {
            return res.status(400).json({ error: 'Cannot reschedule a cancelled booking' });
        }
        
        const oldDate = booking.preferredDate;
        const oldTime = booking.preferredTime;
        
        // Check if new date is available
        if (blockedDates.includes(newDate)) {
            return res.status(400).json({ error: 'Selected date is no longer available' });
        }
        
        // Update booking with new date/time
        booking.preferredDate = newDate;
        booking.preferredTime = newTime;
        booking.rescheduledFrom = oldDate + ' ' + oldTime;
        booking.rescheduledAt = new Date().toISOString();
        booking.rescheduled = true;
        
        // Add new date to blocked dates
        blockedDates.push(newDate);
        
        // Remove old date from blocked dates if not needed anymore
        const oldDateIndex = blockedDates.indexOf(oldDate);
        if (oldDateIndex > -1) {
            // Check if there are any other bookings on this date
            const bookingsOnOldDate = bookings.filter(b => b.preferredDate === oldDate && b.id !== id && !b.cancelled);
            if (bookingsOnOldDate.length === 0) {
                blockedDates.splice(oldDateIndex, 1);
            }
        }
        
        // Send reschedule confirmation email
        sendRescheduleConfirmationEmail(booking, oldDate, oldTime);
        
        // Send reschedule notification to stylist
        sendRescheduleNotificationToStylist(booking, oldDate, oldTime);
        
        res.json({
            success: true,
            message: 'Booking rescheduled successfully',
            bookingId: booking.id,
            newDate: newDate,
            newTime: newTime
        });
    } catch (error) {
        console.error('Reschedule error:', error);
        res.status(500).json({ error: error.message });
    }
});

// Send reschedule confirmation email to customer
async function sendRescheduleConfirmationEmail(booking, oldDate, oldTime) {
    const emailContent = `
        <h2>Booking Rescheduled Successfully</h2>
        <p>Hi ${booking.fullName},</p>
        <p>Your appointment has been rescheduled successfully!</p>
        <hr>
        <h3>Original Booking</h3>
        <p><strong>Date:</strong> ${oldDate}</p>
        <p><strong>Time:</strong> ${oldTime}</p>
        <hr>
        <h3>New Booking Details</h3>
        <p><strong>Hairstyle:</strong> ${booking.hairstyle}</p>
        <p><strong>Length:</strong> ${booking.length}</p>
        <p><strong>Date:</strong> ${booking.preferredDate}</p>
        <p><strong>Time:</strong> ${booking.preferredTime}</p>
        <p><strong>Total Price:</strong> £${booking.totalPrice}.00</p>
        <p><strong>Deposit (already paid):</strong> £${booking.depositPaid}.00</p>
        <hr>
        <p>Your original deposit is still valid and will be deducted from the total payment on your new appointment date.</p>
        <p>If you need to reschedule or cancel again, you can contact Yili directly at:</p>
        <p>Email: pecusadoh@gmail.com<br>Phone: 07500 039928</p>
    `;

    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: booking.email,
        subject: 'Booking Rescheduled - Slayed by Yili',
        html: emailContent
    };

    return new Promise((resolve, reject) => {
        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.error('Reschedule email error:', error);
                reject(error);
            } else {
                console.log('Reschedule email sent:', info.response);
                resolve(info);
            }
        });
    });
}

// Send reschedule notification to stylist
async function sendRescheduleNotificationToStylist(booking, oldDate, oldTime) {
    const emailContent = `
        <h2>Booking Rescheduled Notification</h2>
        <p><strong>${booking.fullName}</strong> has rescheduled their booking.</p>
        <hr>
        <h3>Old Booking</h3>
        <p><strong>Date:</strong> ${oldDate}</p>
        <p><strong>Time:</strong> ${oldTime}</p>
        <hr>
        <h3>New Booking</h3>
        <p><strong>Hairstyle:</strong> ${booking.hairstyle}</p>
        <p><strong>Length:</strong> ${booking.length}</p>
        <p><strong>Date:</strong> ${booking.preferredDate}</p>
        <p><strong>Time:</strong> ${booking.preferredTime}</p>
        <p><strong>Price:</strong> £${booking.totalPrice}.00</p>
        <hr>
        <p><strong>Client Contact:</strong></p>
        <p>Name: ${booking.fullName}<br>Phone: ${booking.phone}<br>Email: ${booking.email}</p>
    `;

    const subject = `Booking Rescheduled: ${booking.fullName} - New Date: ${booking.preferredDate}`;

    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: process.env.EMAIL_TO,
        subject: subject,
        html: emailContent
    };

    return new Promise((resolve, reject) => {
        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.error('Stylist reschedule notification error:', error);
                reject(error);
            } else {
                console.log('Stylist reschedule notification sent:', info.response);
                resolve(info);
            }
        });
    });
}

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Internal server error' });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Slayed by Yili server running on http://localhost:${PORT}`);
});
