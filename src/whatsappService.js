// WhatsApp Service - Send booking notifications via WhatsApp links
// Uses wa.me links for free sending (no subscriptions needed)

function normalizePhoneNumber(phone) {
    if (!phone) return '';

    const digitsOnly = String(phone).replace(/\D/g, '');
    if (!digitsOnly) return '';

    // Convert UK local format (07...) to international format (447...)
    if (digitsOnly.startsWith('0')) {
        return `44${digitsOnly.slice(1)}`;
    }

    return digitsOnly;
}

function generateYiliBookingNotification(booking) {
    // Message to send to Yili (owner) about new booking
    const message = `🎫 NEW BOOKING RECEIVED!\n\n👤 Name: ${booking.fullName}\n📱 Phone: ${booking.phone}\n📧 Email: ${booking.email}\n\n💇 Hairstyle: ${booking.hairstyle}\n📏 Length: ${booking.length}\n💷 Price: £${booking.totalPrice}.00\n💳 Deposit: £10.00\n\n📅 Date: ${booking.preferredDate}\n🕐 Time: ${booking.preferredTime}\n\n📝 Notes: ${booking.notes || 'None'}\n\n⏳ Status: Awaiting £10 deposit payment`;
    return message;
}

function generateCustomerConfirmationMessage(booking) {
    // Message to send to customer confirming booking
    const message = `Hi lovely 💕 thank you for booking with Slayed by Yili.\n\nYour appointment details:\n\nStyle: ${booking.hairstyle}\nLength: ${booking.length}\nDate: ${booking.preferredDate}\nTime: ${booking.preferredTime}\n\n📍 Location: No 2 Aln Street, Hebburn NE31 1XS\n💰 Deposit required to secure slot: £10\n\nBank details:\nName: Onoseyili Peculiar Lugard-Sadoh\nSort code: 233272\nAccount number: 11282972\n\nYour slot is only confirmed after deposit is sent.\n\nThank you 💕`;
    
    return message;
}

function generateCancellationMessage(booking, hoursUntilAppointment, awaitingPayment) {
    let message = `❌ CANCELLATION REQUEST RECEIVED\n\nHi ${booking.fullName},\n\nWe've received your cancellation for:\n📅 ${booking.preferredDate} at ${booking.preferredTime}\n💇 ${booking.hairstyle}\n\n`;
    
    if (awaitingPayment) {
        message += `⚠️ CANCELLATION FEE: £5.00 applies\n(You cancelled less than 24 hours before appointment)\n\n📌 Your £10 deposit is NON-REFUNDABLE.\n\nPlease pay the £5 fee to complete the cancellation.\n\n`;
    } else {
        message += `✅ Cancellation processed.\n\n📌 Your £10 deposit is NON-REFUNDABLE.\n\n`;
    }
    
    message += `Questions? Reply to this chat.\n\nBest,\nSlayed by Yili ✨`;
    
    return message;
}

function generateRescheduleMessage(oldBooking, newBooking) {
    const message = `📅 RESCHEDULE CONFIRMATION\n\nHi ${newBooking.fullName},\n\n✅ Your appointment has been rescheduled!\n\n❌ OLD APPOINTMENT:\n📅 ${oldBooking.preferredDate} at ${oldBooking.preferredTime}\n\n✅ NEW APPOINTMENT:\n📅 ${newBooking.preferredDate} at ${newBooking.preferredTime}\n💇 ${newBooking.hairstyle}\n📏 Length: ${newBooking.length}\n💷 Price: £${newBooking.totalPrice}.00\n\n💳 Deposit: £10.00 (same as before)\n\nNo new payment needed - your original deposit covers this appointment.\n\n📞 Any changes? Reply here or call 07500 039928\n\nBest,\nSlayed by Yili ✨`;
    
    return message;
}

function generatePaymentConfirmationMessage(booking) {
    const message = `✅ DEPOSIT RECEIVED!\n\nThank you ${booking.fullName}! 🎉\n\nWe've received your £10 deposit for:\n💇 ${booking.hairstyle}\n📅 ${booking.preferredDate} at ${booking.preferredTime}\n💷 Total: £${booking.totalPrice}.00\n\n✨ Your appointment is now CONFIRMED!\n\nYili will contact you shortly with any final details.\n\n📍 Location:\nNo 2 Aln Street\nHebburn\nNE31 1XS\n\nSee you soon! 💇‍♀️\n\nBest,\nSlayed by Yili ✨`;
    
    return message;
}

// Generate WhatsApp link URLs
function getYiliWhatsAppLink(message) {
    const yiliNumber = normalizePhoneNumber(process.env.YILI_WHATSAPP || '447500039928');
    const encodedMessage = encodeURIComponent(message);
    return `https://wa.me/${yiliNumber}?text=${encodedMessage}`;
}

function getCustomerWhatsAppLink(customerPhone, message) {
    const normalizedPhone = normalizePhoneNumber(customerPhone);
    const encodedMessage = encodeURIComponent(message);
    return `https://wa.me/${normalizedPhone}?text=${encodedMessage}`;
}

async function sendWhatsAppMessage(phone, message) {
    const recipient = normalizePhoneNumber(phone);
    const token = process.env.WHATSAPP_API_TOKEN;
    const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;

    if (!recipient) {
        return { sent: false, error: 'Invalid recipient phone number' };
    }

    if (!token || !phoneNumberId) {
        return {
            sent: false,
            error: 'WhatsApp Cloud API not configured'
        };
    }

    try {
        const response = await fetch(`https://graph.facebook.com/v20.0/${phoneNumberId}/messages`, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                messaging_product: 'whatsapp',
                to: recipient,
                type: 'text',
                text: {
                    body: message
                }
            })
        });

        const data = await response.json();

        if (!response.ok) {
            return {
                sent: false,
                error: data?.error?.message || 'WhatsApp API request failed',
                data
            };
        }

        return { sent: true, data };
    } catch (error) {
        return { sent: false, error: error.message };
    }
}

module.exports = {
    generateYiliBookingNotification,
    generateCustomerConfirmationMessage,
    generateCancellationMessage,
    generateRescheduleMessage,
    generatePaymentConfirmationMessage,
    normalizePhoneNumber,
    getYiliWhatsAppLink,
    getCustomerWhatsAppLink,
    sendWhatsAppMessage
};
