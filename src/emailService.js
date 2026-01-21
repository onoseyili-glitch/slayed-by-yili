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
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #d4af37;">📧 New Booking Received</h2>
            
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
                <p><strong>Deposit Paid:</strong> £${booking.depositPaid}.00 (Non-refundable)</p>
                <p style="color: #4caf50;"><strong>Remaining Balance:</strong> £${booking.totalPrice - booking.depositPaid}.00</p>
            </div>

            <p style="margin: 20px 0;">Please contact the client to confirm the appointment time. You can reply to this email or call them at ${booking.phone}.</p>

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
        html: emailContent
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
            <h2 style="color: #d4af37;">Booking Confirmed! ✨</h2>
            <p>Hi ${booking.fullName},</p>
            <p>Thank you for booking with <strong>Slayed by Yili</strong>! Your appointment is confirmed.</p>
            
            <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3 style="color: #0a0a0a; margin-top: 0;">Your Appointment Details</h3>
                <p><strong>📅 Date:</strong> ${booking.preferredDate}</p>
                <p><strong>🕐 Time:</strong> ${booking.preferredTime}</p>
                <p><strong>💇 Hairstyle:</strong> ${booking.hairstyle}</p>
                <p><strong>📏 Length:</strong> ${booking.length}</p>
                <p><strong>💷 Total Price:</strong> £${booking.totalPrice}.00</p>
                <p><strong>✅ Deposit Paid:</strong> £${booking.depositPaid}.00 (deducted from final price)</p>
            </div>

            <p style="margin: 20px 0;">Yili will send you a confirmation message shortly to confirm the appointment time. If you have any special requests, please reply to this email or contact us directly.</p>

            <div style="margin: 30px 0; padding: 20px; border-top: 2px solid #d4af37; border-bottom: 2px solid #d4af37;">
                <h3 style="color: #0a0a0a;">What's Next?</h3>
                <p style="margin: 15px 0;">
                    <a href="${rescheduleLink}" style="background-color: #d4af37; color: #0a0a0a; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block; font-weight: bold; margin-right: 10px;">Reschedule Appointment</a>
                    <a href="${cancelLink}" style="background-color: #ff6b6b; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block; font-weight: bold;">Cancel Booking</a>
                </p>
            </div>

            <p style="font-size: 12px; color: #666;">
                <strong>Cancellation Policy:</strong> You can cancel free of charge more than 24 hours before your appointment. Cancellations within 24 hours may incur a £5 fee.
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
        subject: '✨ Your Booking is Confirmed - Slayed by Yili',
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
        `;
    } else {
        emailContent += `
                <p style="color: #4caf50;"><strong>✅ Status:</strong> Cancellation Confirmed (FREE)</p>
                <p>You cancelled more than 24 hours before your appointment. No cancellation fee applies. Your deposit of £${booking.depositPaid}.00 will be refunded within 5-7 business days.</p>
        `;
    }
    
    emailContent += `
            </div>

            <p style="margin: 20px 0;">Yili will confirm your cancellation and process your refund accordingly. If you have any questions, please contact us.</p>

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
