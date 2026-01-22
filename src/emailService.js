const sgMail = require('@sendgrid/mail');

// Initialize SendGrid
if (process.env.SENDGRID_API_KEY) {
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);
}

// Helper function to generate .ics calendar file content
function generateCalendarInvite(booking) {
    const startDate = new Date(`${booking.preferredDate}T${booking.preferredTime}:00`);
    
    // Format dates for iCalendar (YYYYMMDDTHHMMSS in local time)
    const formatDate = (date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        const seconds = String(date.getSeconds()).padStart(2, '0');
        return `${year}${month}${day}T${hours}${minutes}${seconds}`;
    };
    
    const now = new Date();
    const description = `Client: ${booking.fullName}\\nPhone: ${booking.phone}\\nEmail: ${booking.email}\\nStyle: ${booking.hairstyle} (${booking.length})\\nPrice: £${booking.totalPrice}\\nDeposit: £10 (awaiting)\\nBalance due: £${booking.totalPrice - 10}`;
    
    const icsContent = [
        'BEGIN:VCALENDAR',
        'VERSION:2.0',
        'PRODID:-//Slayed by Yili//Booking System//EN',
        'CALSCALE:GREGORIAN',
        'METHOD:PUBLISH',
        'BEGIN:VEVENT',
        `UID:booking-${booking.id}-${Date.now()}@slayedbyyili.com`,
        `DTSTAMP:${formatDate(now)}`,
        `DTSTART:${formatDate(startDate)}`,
        `SUMMARY:${booking.hairstyle} - ${booking.fullName}`,
        `DESCRIPTION:${description}`,
        'LOCATION:Slayed by Yili Salon',
        'STATUS:CONFIRMED',
        'SEQUENCE:0',
        'PRIORITY:5',
        'BEGIN:VALARM',
        'TRIGGER:-PT1H',
        'DESCRIPTION:Appointment in 1 hour',
        'ACTION:DISPLAY',
        'END:VALARM',
        'END:VEVENT',
        'END:VCALENDAR'
    ].join('\r\n');
    
    return Buffer.from(icsContent).toString('base64');
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
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #d4af37;">📧 New Booking Request (Pending Deposit)</h2>
            
            <div style="background-color: #fff3cd; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ff9800;">
                <p style="margin: 0; font-weight: bold; color: #856404;">⏳ Awaiting £10 deposit via bank transfer</p>
                <p style="margin: 8px 0 0 0; color: #856404; font-size: 14px;">Confirm booking once deposit received</p>
            </div>
            
            <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3 style="color: #0a0a0a; margin-top: 0;">Client Information</h3>
                <p><strong>Name:</strong> ${booking.fullName}</p>
                <p><strong>Email:</strong> ${booking.email}</p>
                <p><strong>Phone:</strong> ${booking.phone}</p>
                <p><strong>Notes:</strong> ${booking.notes || 'None'}</p>
            </div>

            <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3 style="color: #0a0a0a; margin-top: 0;">Appointment Details</h3>
                <p><strong>📅 Date:</strong> ${booking.preferredDate}</p>
                <p><strong>🕐 Time:</strong> ${booking.preferredTime}</p>
                <p><strong>💇 Hairstyle:</strong> ${booking.hairstyle}</p>
                <p><strong>📏 Length:</strong> ${booking.length}</p>
            </div>

            <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3 style="color: #0a0a0a; margin-top: 0;">Pricing</h3>
                <p><strong>Base Price:</strong> £${booking.price}.00</p>
                ${addonsHTML}
                ${booking.addonTotal > 0 ? `<p><strong>Add-ons Total:</strong> £${booking.addonTotal}.00</p>` : ''}
                <p style="border-top: 1px solid #ddd; padding-top: 10px; margin-top: 10px;"><strong>Total Price:</strong> £${booking.totalPrice}.00</p>
                <p style="color: #ff9800;"><strong>Deposit Status:</strong> Awaiting £10.00 bank transfer</p>
                <p style="color: #4caf50;"><strong>Remaining Balance:</strong> £${booking.totalPrice - 10}.00 (to collect at appointment)</p>
            </div>

            <div style="background-color: #e3f2fd; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #2196f3;">
                <p style="margin: 0; font-weight: bold; color: #0d47a1;">📋 Next Steps:</p>
                <p style="margin: 8px 0 0 0; color: #0d47a1; font-size: 14px;">
                    1. Check for £10 bank transfer with reference: ${booking.fullName.split(' ')[0]}-${booking.preferredDate}<br>
                    2. Once received, contact client to confirm appointment<br>
                    3. Client contact: ${booking.phone} / ${booking.email}
                </p>
            </div>

            <div style="background-color: #dcfce7; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #16a34a;">
                <p style="margin: 0; font-weight: bold; color: #15803d;">📅 Calendar Attached</p>
                <p style="margin: 8px 0 0 0; color: #15803d; font-size: 14px;">
                    Tap the calendar file attached to this email to add the appointment to your phone calendar automatically!
                </p>
            </div>

            <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">

            <p style="font-size: 12px; color: #666;">
                <strong>Booking ID:</strong> ${booking.id}<br>
                <strong>Booked:</strong> ${booking.bookedAt}
            </p>
        </div>
    `;

    const msg = {
        to: process.env.EMAIL_TO,
        from: process.env.EMAIL_USER,
        subject: `New Booking: ${booking.fullName} - ${booking.hairstyle} on ${booking.preferredDate}`,
        html: emailContent,
        attachments: [
            {
                content: generateCalendarInvite(booking),
                filename: `booking-${booking.fullName.replace(/\s+/g, '-')}-${booking.preferredDate}.ics`,
                type: 'text/calendar',
                disposition: 'attachment'
            }
        ]
    };

    await sgMail.send(msg);
}

async function sendCustomerConfirmationEmail(booking) {
    if (!process.env.SENDGRID_API_KEY) {
        console.log('⚠️ SENDGRID_API_KEY not set - customer email not sent');
        return;
    }

    const baseURL = process.env.APP_URL || 'https://slayed-by-yili.onrender.com';
    const cancelLink = `${baseURL}/cancel-booking?id=${booking.id}&token=${booking.cancellationToken}`;
    const rescheduleLink = `${baseURL}/reschedule-booking?id=${booking.id}&token=${booking.cancellationToken}`;
    
    const emailContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #d4af37;">Booking Request Received! ✨</h2>
            <p>Hi ${booking.fullName},</p>
            <p>Thank you for booking with <strong>Slayed by Yili</strong>!</p>
            
            <div style="background-color: #fff3cd; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #d4af37;">
                <h3 style="color: #856404; margin-top: 0;">⏳ Booking Pending Deposit</h3>
                <p style="margin: 0;">Your booking will be confirmed once we receive your £10 deposit via bank transfer.</p>
            </div>
            
            <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3 style="color: #0a0a0a; margin-top: 0;">Your Appointment Details</h3>
                <p><strong>📅 Date:</strong> ${booking.preferredDate}</p>
                <p><strong>🕐 Time:</strong> ${booking.preferredTime}</p>
                <p><strong>💇 Hairstyle:</strong> ${booking.hairstyle}</p>
                <p><strong>📏 Length:</strong> ${booking.length}</p>
                <p><strong>💷 Total Price:</strong> £${booking.totalPrice}.00</p>
                <p><strong>💳 Deposit Required:</strong> £10.00</p>
            </div>

            <div style="background-color: #e8f5e9; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #4caf50;">
                <h3 style="color: #2e7d32; margin-top: 0;">💰 Bank Transfer Details</h3>
                <p style="margin: 8px 0;"><strong>Account Name:</strong> Onoseyili Peculiar Lugard-Sadoh</p>
                <p style="margin: 8px 0;"><strong>Sort Code:</strong> 23-32-72</p>
                <p style="margin: 8px 0;"><strong>Account Number:</strong> 11282972</p>
                <p style="margin: 8px 0;"><strong>Amount:</strong> £10.00</p>
                <p style="margin: 8px 0;"><strong>Reference:</strong> ${booking.fullName.split(' ')[0]}-${booking.preferredDate}</p>
            </div>

            <div style="background-color: #fff; padding: 15px; border: 2px solid #d4af37; border-radius: 8px; margin: 20px 0;">
                <p style="margin: 0; font-weight: bold; color: #0a0a0a;">📌 Important:</p>
                <p style="margin: 10px 0 0 0;">Please send the £10 deposit within 24 hours to secure your appointment. Once received, you'll get a confirmation email and Yili will contact you directly.</p>
            </div>

            <div style="margin: 30px 0; padding: 20px; border-top: 2px solid #d4af37; border-bottom: 2px solid #d4af37;">
                <h3 style="color: #0a0a0a;">Need to Cancel or Reschedule?</h3>
                <p style="margin: 15px 0;">
                    <a href="${cancelLink}" style="background-color: #ff6b6b; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block; font-weight: bold;">Cancel or Reschedule Booking</a>
                </p>
            </div>

            <p style="font-size: 12px; color: #666;">
                <strong>Cancellation Policy:</strong> £10 deposit is non-refundable. Cancellations within 24 hours of appointment may incur an additional £5 fee.
            </p>

            <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">

            <p>Best regards,<br><strong>Slayed by Yili</strong></p>
            <p style="font-size: 12px; color: #666;">
                📧 pecusadoh@gmail.com | 📱 07500 039928
            </p>
        </div>
    `;

    const msg = {
        to: booking.email,
        from: process.env.EMAIL_USER,
        subject: `Appointment ${booking.preferredDate} - Payment Details`,
        html: emailContent
    };

    await sgMail.send(msg);
}

// Cancellation: customer confirmation
async function sendCancellationConfirmationEmail(booking, hoursUntilAppointment, awaitingPayment) {
    if (!process.env.SENDGRID_API_KEY) {
        console.log('⚠️ SENDGRID_API_KEY not set - cancellation email not sent');
        return;
    }

    let emailContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #d4af37;">Cancellation Request Received</h2>
            <p>Hi ${booking.fullName},</p>
            <p>We have received your cancellation request for your appointment on <strong>${booking.preferredDate} at ${booking.preferredTime}</strong>.</p>
            
            <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3 style="color: #0a0a0a; margin-top: 0;">Cancellation Details</h3>
                <p><strong>💇 Hairstyle:</strong> ${booking.hairstyle}</p>
                <p><strong>📏 Length:</strong> ${booking.length}</p>
                <p><strong>💷 Original Deposit:</strong> £${booking.depositPaid}.00</p>
    `;
    
    if (awaitingPayment) {
        emailContent += `
                <p><strong>⚠️ Cancellation Fee:</strong> £5.00</p>
                <p style="color: #ff6b6b;"><strong>Status:</strong> Awaiting fee payment</p>
                <p>You cancelled less than 24 hours before your appointment. A £5 cancellation fee applies. Your cancellation will be confirmed after payment is processed.</p>
                <p><strong>Important:</strong> The original £10 deposit is non-refundable.</p>
        `;
    } else {
        emailContent += `
                <p style="color: #4caf50;"><strong>✅ Status:</strong> Cancellation Confirmed</p>
                <p>You cancelled more than 24 hours before your appointment. No additional cancellation fee applies.</p>
                <p><strong>Important:</strong> The £10 deposit is non-refundable as per our cancellation policy.</p>
        `;
    }
    
    emailContent += `
            </div>

            <p style="margin: 20px 0;">Yili will confirm your cancellation. If you have any questions, please contact us.</p>

            <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">

            <p style="font-size: 12px; color: #666;">
                📧 pecusadoh@gmail.com | 📱 07500 039928
            </p>
        </div>
    `;

    const msg = {
        to: booking.email,
        from: process.env.EMAIL_USER,
        subject: '✂️ Cancellation Request Received - Slayed by Yili',
        html: emailContent
    };

    await sgMail.send(msg);
}

// Cancellation: stylist notification
async function sendCancellationNotificationToStylist(booking, hoursUntilAppointment, awaitingPayment) {
    if (!process.env.SENDGRID_API_KEY) {
        console.log('⚠️ SENDGRID_API_KEY not set - stylist cancellation email not sent');
        return;
    }

    let emailContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #ff6b6b;">⚠️ Booking Cancellation Request</h2>
            <p><strong>${booking.fullName}</strong> has requested to cancel their appointment.</p>
            
            <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3 style="color: #0a0a0a; margin-top: 0;">Booking Details</h3>
                <p><strong>📅 Appointment Date:</strong> ${booking.preferredDate}</p>
                <p><strong>🕐 Appointment Time:</strong> ${booking.preferredTime}</p>
                <p><strong>💇 Hairstyle:</strong> ${booking.hairstyle}</p>
                <p><strong>📏 Length:</strong> ${booking.length}</p>
                <p><strong>⏰ Hours until appointment:</strong> ${Math.ceil(hoursUntilAppointment)}h</p>
                <p><strong>💷 Deposit Received:</strong> £${booking.depositPaid}.00</p>
            </div>

            <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3 style="color: #0a0a0a; margin-top: 0;">Refund Status</h3>
    `;
    
    if (awaitingPayment) {
        emailContent += `
                <p style="color: #ff6b6b;"><strong>⚠️ Status:</strong> Awaiting £5 cancellation fee payment</p>
                <p>Client cancelled less than 24 hours before appointment. A £5 cancellation fee applies.</p>
                <p><strong>Action:</strong> Client needs to pay £5 to confirm cancellation.</p>
        `;
    } else {
        emailContent += `
                <p style="color: #4caf50;"><strong>✅ Status:</strong> Free Cancellation Approved</p>
                <p>Client cancelled more than 24 hours before appointment. Process refund of £${booking.depositPaid}.00.</p>
        `;
    }
    
    emailContent += `
            </div>

            <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3 style="color: #0a0a0a; margin-top: 0;">Client Contact</h3>
                <p><strong>Name:</strong> ${booking.fullName}</p>
                <p><strong>Phone:</strong> ${booking.phone}</p>
                <p><strong>Email:</strong> ${booking.email}</p>
            </div>

            <p style="margin: 20px 0;">Please review the cancellation reason and determine if the £5 fee should be waived.</p>
        </div>
    `;

    const msg = {
        to: process.env.EMAIL_TO,
        from: process.env.EMAIL_USER,
        subject: `Cancellation Request: ${booking.fullName} - ${booking.preferredDate}`,
        html: emailContent
    };

    await sgMail.send(msg);
}

// Reschedule: customer confirmation
async function sendRescheduleConfirmationEmail(booking, oldDate, oldTime) {
    if (!process.env.SENDGRID_API_KEY) {
        console.log('⚠️ SENDGRID_API_KEY not set - reschedule email not sent');
        return;
    }

    const baseURL = process.env.APP_URL || 'https://slayed-by-yili.onrender.com';
    const cancelLink = `${baseURL}/cancel-booking?id=${booking.id}&token=${booking.cancellationToken}`;

    const emailContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #d4af37;">✅ Appointment Rescheduled!</h2>
            <p>Hi ${booking.fullName},</p>
            <p>Your appointment has been successfully rescheduled!</p>
            
            <div style="background-color: #fff3cd; padding: 15px; border-radius: 4px; margin: 20px 0; border-left: 4px solid #d4af37;">
                <h3 style="color: #856404; margin-top: 0;">Previous Appointment</h3>
                <p><strong>📅 Date:</strong> ${oldDate}</p>
                <p><strong>🕐 Time:</strong> ${oldTime}</p>
            </div>

            <div style="background-color: #d4f1d4; padding: 15px; border-radius: 4px; margin: 20px 0; border-left: 4px solid #4caf50;">
                <h3 style="color: #2d5016; margin-top: 0;">New Appointment</h3>
                <p><strong>📅 Date:</strong> ${booking.preferredDate}</p>
                <p><strong>🕐 Time:</strong> ${booking.preferredTime}</p>
                <p><strong>💇 Hairstyle:</strong> ${booking.hairstyle}</p>
                <p><strong>📏 Length:</strong> ${booking.length}</p>
                <p><strong>💷 Total Price:</strong> £${booking.totalPrice}.00</p>
                <p><strong>✅ Deposit (already paid):</strong> £${booking.depositPaid}.00 (applies to new appointment)</p>
            </div>

            <p style="margin: 20px 0;">Your original deposit of £${booking.depositPaid}.00 remains valid and will be deducted from the total payment on your new appointment date.</p>

            <div style="margin: 20px 0; padding: 20px; border: 2px solid #d4af37; border-radius: 4px;">
                <p style="margin: 10px 0;">
                    <a href="${cancelLink}" style="background-color: #ff6b6b; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block; font-weight: bold;">Cancel This Appointment</a>
                </p>
            </div>

            <p style="font-size: 12px; color: #666;">
                <strong>Questions?</strong> Contact us anytime at pecusadoh@gmail.com or 07500 039928
            </p>
        </div>
    `;

    const msg = {
        to: booking.email,
        from: process.env.EMAIL_USER,
        subject: '✅ Your Appointment Has Been Rescheduled - Slayed by Yili',
        html: emailContent
    };

    await sgMail.send(msg);
}

// Reschedule: stylist notification
async function sendRescheduleNotificationToStylist(booking, oldDate, oldTime) {
    if (!process.env.SENDGRID_API_KEY) {
        console.log('⚠️ SENDGRID_API_KEY not set - stylist reschedule email not sent');
        return;
    }

    const emailContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #d4af37;">📅 Appointment Rescheduled</h2>
            <p><strong>${booking.fullName}</strong> has rescheduled their appointment.</p>
            
            <div style="background-color: #fff3cd; padding: 15px; border-radius: 4px; margin: 20px 0; border-left: 4px solid #d4af37;">
                <h3 style="color: #856404; margin-top: 0;">Previous Appointment</h3>
                <p><strong>📅 Date:</strong> ${oldDate}</p>
                <p><strong>🕐 Time:</strong> ${oldTime}</p>
            </div>

            <div style="background-color: #d4f1d4; padding: 15px; border-radius: 4px; margin: 20px 0; border-left: 4px solid #4caf50;">
                <h3 style="color: #2d5016; margin-top: 0;">New Appointment</h3>
                <p><strong>📅 Date:</strong> ${booking.preferredDate}</p>
                <p><strong>🕐 Time:</strong> ${booking.preferredTime}</p>
                <p><strong>💇 Hairstyle:</strong> ${booking.hairstyle}</p>
                <p><strong>📏 Length:</strong> ${booking.length}</p>
                <p><strong>💷 Total Price:</strong> £${booking.totalPrice}.00</p>
                <p><strong>Deposit:</strong> £${booking.depositPaid}.00</p>
            </div>

            <div style="background-color: #f5f5f5; padding: 15px; border-radius: 4px; margin: 20px 0;">
                <h3 style="color: #0a0a0a; margin-top: 0;">Client Details</h3>
                <p><strong>Name:</strong> ${booking.fullName}</p>
                <p><strong>Phone:</strong> ${booking.phone}</p>
                <p><strong>Email:</strong> ${booking.email}</p>
            </div>

            <p style="margin: 20px 0;">Please note the new appointment time in your calendar.</p>
        </div>
    `;

    const msg = {
        to: process.env.EMAIL_TO,
        from: process.env.EMAIL_USER,
        subject: `Reschedule Confirmation: ${booking.fullName} - ${booking.preferredDate}`,
        html: emailContent
    };

    await sgMail.send(msg);
}

module.exports = {
    sendConfirmationEmail,
    sendCustomerConfirmationEmail,
    sendCancellationConfirmationEmail,
    sendCancellationNotificationToStylist,
    sendRescheduleConfirmationEmail,
    sendRescheduleNotificationToStylist
};
