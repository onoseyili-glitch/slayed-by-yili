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

// Cancellation: customer confirmation
async function sendCancellationConfirmationEmail(booking, hoursUntilAppointment, awaitingPayment) {
    if (!process.env.SENDGRID_API_KEY) {
        console.log('⚠️ SENDGRID_API_KEY not set - cancellation email not sent');
        return;
    }

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

    const msg = {
        to: booking.email,
        from: process.env.EMAIL_USER,
        subject: 'Booking Cancellation Request - Slayed by Yili',
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

    const msg = {
        to: process.env.EMAIL_TO,
        from: process.env.EMAIL_USER,
        subject: subject,
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

    const msg = {
        to: booking.email,
        from: process.env.EMAIL_USER,
        subject: 'Booking Rescheduled - Slayed by Yili',
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
        <h2>Booking Rescheduled</h2>
        <p><strong>${booking.fullName}</strong> has rescheduled their booking.</p>
        <hr>
        <h3>Original Booking</h3>
        <p><strong>Date:</strong> ${oldDate}</p>
        <p><strong>Time:</strong> ${oldTime}</p>
        <hr>
        <h3>New Booking Details</h3>
        <p><strong>Date:</strong> ${booking.preferredDate}</p>
        <p><strong>Time:</strong> ${booking.preferredTime}</p>
        <p><strong>Hairstyle:</strong> ${booking.hairstyle}</p>
        <p><strong>Length:</strong> ${booking.length}</p>
        <p><strong>Total Price:</strong> £${booking.totalPrice}.00</p>
        <p><strong>Deposit:</strong> £${booking.depositPaid}.00</p>
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
