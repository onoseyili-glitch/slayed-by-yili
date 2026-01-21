const sgMail = require('@sendgrid/mail');

// Initialize SendGrid
if (process.env.SENDGRID_API_KEY) {
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);
}

async function sendConfirmationEmail(booking) {
    if (!process.env.SENDGRID_API_KEY) {
        console.log('⚠️ SENDGRID_API_KEY not set - email not sent');
        console.log('📧 Booking details:', JSON.stringify(booking, null, 2));
        return;
    }

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

    const msg = {
        to: process.env.EMAIL_TO,
        from: process.env.EMAIL_USER,
        subject: `New Booking: ${booking.fullName} - ${booking.hairstyle}`,
        html: emailContent
    };

    await sgMail.send(msg);
}

async function sendCustomerConfirmationEmail(booking) {
    if (!process.env.SENDGRID_API_KEY) {
        console.log('⚠️ SENDGRID_API_KEY not set - customer email not sent');
        return;
    }

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
        <p><strong>Total Price:</strong> £${booking.totalPrice}.00</p>
        <p><strong>Deposit Paid:</strong> £${booking.depositPaid}.00</p>
        <hr>
        <p>You'll receive a confirmation message from Yili to confirm your appointment.</p>
        <p>Thank you for choosing Slayed by Yili!</p>
        <hr>
        <h3>Need to Cancel?</h3>
        <p><a href="${cancellationLink}" style="background-color: #d4af37; color: #0a0a0a; padding: 10px 20px; text-decoration: none; border-radius: 4px; display: inline-block; font-weight: bold;">Cancel Booking</a></p>
        <p><small>You can cancel for free if you do so more than 24 hours before your appointment.</small></p>
    `;

    const msg = {
        to: booking.email,
        from: process.env.EMAIL_USER,
        subject: 'Booking Confirmation - Slayed by Yili',
        html: emailContent
    };

    await sgMail.send(msg);
}

module.exports = {
    sendConfirmationEmail,
    sendCustomerConfirmationEmail
};
