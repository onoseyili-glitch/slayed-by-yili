// Service Categories and Pricing Data
const services = {
    braids: {
        name: 'Braids',
        description: 'Professional braiding styles',
        hairstyles: [
            { name: 'Knotless', pricing: { short: 45, medium: 55, long: 65, extra: 75 } },
            { name: 'Box', pricing: { short: 45, medium: 55, long: 65, extra: 75 } },
            { name: 'Fulani', pricing: { short: 45, medium: 55, long: 65, extra: 75 } },
            { name: 'Feed-in', pricing: { short: 45, medium: 55, long: 65, extra: 75 } },
            { name: 'Jumbo', pricing: { short: 45, medium: 55, long: 65, extra: 75 } },
            { name: 'Boho', pricing: { short: 45, medium: 55, long: 65, extra: 75 } },
            { name: 'Invisible', pricing: { short: 45, medium: 55, long: 65, extra: 75 } }
        ]
    },
    twists: {
        name: 'Twists',
        description: 'Stylish twist variations',
        hairstyles: [
            { name: 'Passion', pricing: { short: 40, medium: 50, long: 60, extra: 70 } },
            { name: 'Spring', pricing: { short: 40, medium: 50, long: 60, extra: 70 } },
            { name: 'Mini', pricing: { short: 40, medium: 50, long: 60, extra: 70 } },
            { name: 'Rope', pricing: { short: 40, medium: 50, long: 60, extra: 70 } },
            { name: 'Two-Strand', pricing: { short: 40, medium: 50, long: 60, extra: 70 } },
            { name: 'Patching', pricing: { short: 40, medium: 50, long: 60, extra: 70 } }
        ]
    },
    locstyles: {
        name: 'Loc Styles (Pre-made / Install Only)',
        description: 'Beautiful locs and loc variations - Pre-made hair',
        hairstyles: [
            { name: 'Butterfly', pricing: { short: 35, medium: 45, long: 55, extra: 65 } },
            { name: 'Soft', pricing: { short: 35, medium: 45, long: 55, extra: 65 } },
            { name: 'Faux', pricing: { short: 35, medium: 45, long: 55, extra: 65 } },
            { name: 'Goddess', pricing: { short: 35, medium: 45, long: 55, extra: 65 } },
            { name: 'Sister Locs', pricing: { short: 35, medium: 45, long: 55, extra: 65 } }
        ]
    },
    cornrows: {
        name: 'Cornrows',
        description: 'Classic and creative cornrow designs',
        hairstyles: [
            { name: 'Straight-back', pricing: { short: 25, medium: 30, long: 35 } },
            { name: 'Fulani', pricing: { short: 25, medium: 30, long: 35 } },
            { name: 'Curved', pricing: { short: 25, medium: 30, long: 35 } }
        ]
    },
    naturalhair: {
        name: 'Natural Hair',
        description: 'Styling for natural hair textures',
        hairstyles: [
            { name: 'Wash & Go', pricing: { fixed: 15 } },
            { name: 'Finger Coils', pricing: { fixed: 20 } },
            { name: 'Two-Strand Twists', pricing: { fixed: 30 } }
        ]
    },
    sewins: {
        name: 'Sew-In',
        description: 'Professional sew-in installations',
        hairstyles: [
            { name: 'Sew-In', pricing: { fixed: 35 } }
        ]
    },
    kidsstyles: {
        name: 'Kids Styles (Under 12)',
        description: 'Fun and protective styles for kids',
        hairstyles: [
            { name: 'Braids', pricing: { short: 20, medium: 25, long: 30 } },
            { name: 'Beaded Braids', pricing: { short: 20, medium: 25, long: 30 } },
            { name: 'Natural Styles', pricing: { short: 20, medium: 25, long: 30 } },
            { name: 'Cornrows', pricing: { short: 20, medium: 25, long: 30 } }
        ]
    }
};

// Availability Configuration
const availabilityConfig = {
    // Term time availability
    termTime: {
        Monday: { startTime: '15:30', endTime: '23:59', maxClients: 1 },
        Tuesday: { startTime: '15:30', endTime: '23:59', maxClients: 1 },
        Wednesday: { startTime: '15:30', endTime: '23:59', maxClients: 1 },
        Thursday: { startTime: '06:00', endTime: '23:59', maxClients: 2 },
        Friday: { startTime: '06:00', endTime: '23:59', maxClients: 2 },
        Saturday: { startTime: '06:00', endTime: '23:59', maxClients: 2 },
        Sunday: { startTime: '15:30', endTime: '23:59', maxClients: 1 }
    },
    // Manually blocked dates (holidays, etc.)
    blockedDates: []
};

// State Management
let currentState = {
    selectedCategory: null,
    selectedHairstyle: null,
    selectedLength: null,
    price: null,
    addons: [],
    addonTotal: 0,
    paymentIntentId: null,
    selectedDate: null,
    selectedTime: null
};

// Initialize Stripe
let stripe, cardElement;

document.addEventListener('DOMContentLoaded', function() {
    renderServiceCategories();
    setupEventListeners();
    loadBlockedDates();
    
    // Check if this is a reschedule request
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('reschedule') === 'true') {
        handleRescheduleFlow();
    }
});

async function loadBlockedDates() {
    try {
        const response = await fetch('/api/blocked-dates');
        const dates = await response.json();
        availabilityConfig.blockedDates = dates;
        console.log('Blocked dates loaded:', availabilityConfig.blockedDates);
    } catch (error) {
        console.error('Error loading blocked dates:', error);
    }
}

function setupEventListeners() {
    const bookingForm = document.getElementById('bookingForm');
    if (bookingForm) {
        bookingForm.addEventListener('submit', handleBookingSubmit);
    }
}

function renderServiceCategories() {
    const container = document.getElementById('serviceCategories');
    container.innerHTML = '';
    
    Object.entries(services).forEach(([key, service]) => {
        const categoryEl = document.createElement('div');
        categoryEl.className = 'service-category';
        categoryEl.innerHTML = `
            <h3>${service.name}</h3>
            <p>${service.description}</p>
        `;
        categoryEl.onclick = () => openServiceModal(key, service);
        container.appendChild(categoryEl);
    });
}

function openServiceModal(categoryKey, categoryData) {
    currentState.selectedCategory = categoryKey;
    const modal = document.getElementById('serviceModal');
    document.getElementById('modalTitle').textContent = `Select ${categoryData.name}`;
    
    const optionsContainer = document.getElementById('hairstyleOptions');
    optionsContainer.innerHTML = '';
    
    categoryData.hairstyles.forEach(hairstyle => {
        const btn = document.createElement('button');
        btn.className = 'option-btn';
        btn.textContent = hairstyle.name;
        btn.onclick = (e) => {
            e.preventDefault();
            selectHairstyle(hairstyle.name, hairstyle.pricing);
        };
        optionsContainer.appendChild(btn);
    });
    
    modal.classList.remove('hidden');
}

function closeServiceModal() {
    document.getElementById('serviceModal').classList.add('hidden');
}

function selectHairstyle(hairstyleName, pricing) {
    currentState.selectedHairstyle = hairstyleName;
    currentState.pricing = pricing;
    closeServiceModal();
    openLengthModal();
}

function openLengthModal() {
    const modal = document.getElementById('lengthModal');
    
    // Check if this service has fixed pricing (no length selection needed)
    if (currentState.pricing.fixed !== undefined) {
        currentState.selectedLength = 'Standard';
        currentState.price = currentState.pricing.fixed;
        openPricingModal();
        return;
    }
    
    modal.classList.remove('hidden');
    
    // Get available lengths from pricing data
    const availableLengths = Object.keys(currentState.pricing);
    
    // Map keys to display names
    const lengthMap = {
        'short': 'Short',
        'medium': 'Medium',
        'long': 'Long',
        'extra': 'Extra Long'
    };
    
    const lengthOptionsContainer = document.querySelector('.length-options');
    lengthOptionsContainer.innerHTML = '';
    
    // Create buttons only for available lengths
    availableLengths.forEach(key => {
        const displayName = lengthMap[key];
        const btn = document.createElement('button');
        btn.className = 'length-btn';
        btn.dataset.length = displayName;
        btn.textContent = `${displayName} — £${currentState.pricing[key]}`;
        btn.onclick = (e) => {
            e.preventDefault();
            selectLength(displayName);
        };
        lengthOptionsContainer.appendChild(btn);
    });
}

function closeLengthModal() {
    document.getElementById('lengthModal').classList.add('hidden');
}

function selectLength(length) {
    currentState.selectedLength = length;
    
    // Map length to pricing key
    let lengthKey;
    if (length === 'Extra Long') {
        lengthKey = 'extra';
    } else {
        lengthKey = length.toLowerCase();
    }
    
    const price = currentState.pricing[lengthKey] || currentState.pricing.fixed || 0;
    currentState.price = price;
    
    closeLengthModal();
    openPricingModal();
}

function openPricingModal() {
    document.getElementById('summaryHairstyle').textContent = currentState.selectedHairstyle;
    document.getElementById('summaryLength').textContent = currentState.selectedLength;
    document.getElementById('summaryPrice').textContent = currentState.price;
    document.getElementById('totalPrice').textContent = currentState.price;
    
    // Reset add-ons
    currentState.addons = [];
    currentState.addonTotal = 0;
    
    // Show/hide deposit info based on category
    const depositLine = document.getElementById('depositLine');
    const depositNote = document.getElementById('depositNote');
    const addonsSection = document.getElementById('addonsSection');
    
    if (currentState.selectedCategory === 'addons') {
        depositLine.style.display = 'none';
        depositNote.style.display = 'none';
        addonsSection.style.display = 'none';
    } else {
        depositLine.style.display = 'block';
        depositNote.style.display = 'block';
        addonsSection.style.display = 'block';
    }
    
    // Setup add-ons checkboxes
    document.querySelectorAll('.addon-checkbox').forEach(checkbox => {
        checkbox.checked = false;
        checkbox.addEventListener('change', updateAddonPrice);
    });
    
    const modal = document.getElementById('pricingModal');
    modal.classList.remove('hidden');
}

function updateAddonPrice() {
    currentState.addons = [];
    currentState.addonTotal = 0;
    
    document.querySelectorAll('.addon-checkbox:checked').forEach(checkbox => {
        currentState.addons.push({
            name: checkbox.dataset.addonName,
            price: parseInt(checkbox.dataset.addonPrice)
        });
        currentState.addonTotal += parseInt(checkbox.dataset.addonPrice);
    });
    
    // Update total price display
    const totalPrice = currentState.price + currentState.addonTotal;
    document.getElementById('totalPrice').textContent = totalPrice;
    
    // Show/hide add-ons total
    const addonsTotal = document.getElementById('addonsTotal');
    if (currentState.addonTotal > 0) {
        addonsTotal.style.display = 'block';
        document.getElementById('addonsTotalPrice').textContent = currentState.addonTotal;
    } else {
        addonsTotal.style.display = 'none';
    }
}

function closePricingModal() {
    document.getElementById('pricingModal').classList.add('hidden');
}

function proceedToPayment() {
    closePricingModal();
    
    // Add-ons don't require deposit payment - go straight to time slot
    if (currentState.selectedCategory === 'addons') {
        openTimeSlotModal();
        return;
    }
    
    // All other services require Square deposit payment
    window.open('https://square.link/u/0f0lHs5y', '_blank');
    // Show time slot selection after a brief delay to allow user to complete payment
    setTimeout(() => {
        openTimeSlotModal();
    }, 500);
}

function openTimeSlotModal() {
    const modal = document.getElementById('timeSlotModal');
    modal.classList.remove('hidden');
    
    // Set minimum date to today
    const today = new Date();
    today.setDate(today.getDate());
    const minDate = today.toISOString().split('T')[0];
    
    const dateInput = document.getElementById('appointmentDate');
    dateInput.min = minDate;
    dateInput.value = '';
    
    // Clear time slots
    document.getElementById('timeSlotsContainer').innerHTML = '';
    
    // Add listener for date changes
    dateInput.addEventListener('change', generateTimeSlots);
}

function closeTimeSlotModal() {
    document.getElementById('timeSlotModal').classList.add('hidden');
}

function generateTimeSlots() {
    const dateInput = document.getElementById('appointmentDate').value;
    if (!dateInput) return;
    
    const selectedDate = new Date(dateInput);
    const dayName = selectedDate.toLocaleDateString('en-US', { weekday: 'long' });
    
    // Check if date is blocked
    if (availabilityConfig.blockedDates.includes(dateInput)) {
        document.getElementById('bookingMessage').textContent = '❌ This date is not available. Please select another date.';
        document.getElementById('timeSlotsContainer').innerHTML = '';
        return;
    }
    
    // Get availability for this day
    const dayAvailability = availabilityConfig.termTime[dayName];
    if (!dayAvailability) {
        document.getElementById('bookingMessage').textContent = '❌ No availability on this day.';
        document.getElementById('timeSlotsContainer').innerHTML = '';
        return;
    }
    
    const [startHour, startMin] = dayAvailability.startTime.split(':').map(Number);
    const [endHour, endMin] = dayAvailability.endTime.split(':').map(Number);
    
    // Generate 30-minute time slots
    const slots = [];
    for (let hour = startHour; hour <= endHour; hour++) {
        for (let min = 0; min < 60; min += 30) {
            if (hour === endHour && min > 0) break;
            const timeStr = `${String(hour).padStart(2, '0')}:${String(min).padStart(2, '0')}`;
            slots.push(timeStr);
        }
    }
    
    const container = document.getElementById('timeSlotsContainer');
    container.innerHTML = '';
    
    if (slots.length === 0) {
        document.getElementById('bookingMessage').textContent = '❌ No available slots for this date.';
        return;
    }
    
    document.getElementById('bookingMessage').textContent = `Available slots on ${dayName}:`;
    
    const slotsGrid = document.createElement('div');
    slotsGrid.className = 'time-slots-grid';
    slotsGrid.style.display = 'grid';
    slotsGrid.style.gridTemplateColumns = 'repeat(auto-fit, minmax(100px, 1fr))';
    slotsGrid.style.gap = '0.5rem';
    slotsGrid.style.marginTop = '1rem';
    
    slots.forEach(time => {
        const btn = document.createElement('button');
        btn.className = 'time-slot-btn';
        btn.textContent = time;
        btn.type = 'button';
        btn.style.padding = '0.75rem';
        btn.style.border = '2px solid #d4af37';
        btn.style.backgroundColor = '#0a0a0a';
        btn.style.color = '#d4af37';
        btn.style.borderRadius = '4px';
        btn.style.cursor = 'pointer';
        btn.style.fontSize = '0.9rem';
        btn.style.fontWeight = 'bold';
        btn.style.transition = 'all 0.3s ease';
        
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            selectTimeSlot(time);
        });
        
        btn.addEventListener('mouseover', () => {
            btn.style.backgroundColor = '#d4af37';
            btn.style.color = '#0a0a0a';
        });
        
        btn.addEventListener('mouseout', () => {
            btn.style.backgroundColor = '#0a0a0a';
            btn.style.color = '#d4af37';
        });
        
        slotsGrid.appendChild(btn);
    });
    
    container.appendChild(slotsGrid);
}

function selectTimeSlot(time) {
    const dateInput = document.getElementById('appointmentDate').value;
    currentState.selectedDate = dateInput;
    currentState.selectedTime = time;
    
    closeTimeSlotModal();
    openBookingModal();
}

function openBookingModal() {
    // Pre-fill with selected date and time from time slot
    if (currentState.selectedDate && currentState.selectedTime) {
        document.getElementById('preferredDate').value = currentState.selectedDate;
        document.getElementById('preferredTime').value = currentState.selectedTime;
    }
    document.getElementById('bookingModal').classList.remove('hidden');
}

function closeBookingModal() {
    document.getElementById('bookingModal').classList.add('hidden');
}

async function handleBookingSubmit(e) {
    e.preventDefault();
    
    const bookingData = {
        fullName: document.getElementById('fullName').value,
        phone: document.getElementById('phone').value,
        email: document.getElementById('email').value,
        preferredDate: document.getElementById('preferredDate').value,
        preferredTime: document.getElementById('preferredTime').value,
        notes: document.getElementById('notes').value,
        hairstyle: currentState.selectedHairstyle,
        length: currentState.selectedLength,
        price: currentState.price,
        addons: currentState.addons,
        addonTotal: currentState.addonTotal,
        totalPrice: currentState.price + currentState.addonTotal,
        paymentIntentId: currentState.paymentIntentId
    };
    
    console.log('Sending booking data:', bookingData);
    
    try {
        const response = await fetch('/submit-booking', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(bookingData)
        });
        
        console.log('Response status:', response.status);
        const responseData = await response.json();
        console.log('Response data:', responseData);
        
        if (!response.ok) {
            throw new Error(responseData.error || 'Failed to submit booking');
        }
        
        closeBookingModal();
        openConfirmationModal();
    } catch (error) {
        console.error('Booking error:', error);
        alert('Booking error: ' + error.message);
    }
}

function openConfirmationModal() {
    document.getElementById('confirmationModal').classList.remove('hidden');
}

function returnHome() {
    document.getElementById('confirmationModal').classList.add('hidden');
    resetBookingFlow();
    window.scrollTo(0, 0);
}

function resetBookingFlow() {
    currentState = {
        selectedCategory: null,
        selectedHairstyle: null,
        selectedLength: null,
        price: null,
        addons: [],
        addonTotal: 0,
        paymentIntentId: null,
        selectedDate: null,
        selectedTime: null
    };
    document.getElementById('bookingForm').reset();
}

function scrollToServices() {
    document.getElementById('services').scrollIntoView({ behavior: 'smooth' });
}

// Reschedule booking flow
function handleRescheduleFlow() {
    const bookingId = sessionStorage.getItem('rescheduleBookingId');
    const token = sessionStorage.getItem('rescheduleToken');
    const hairstyle = sessionStorage.getItem('rescheduleHairstyle');
    const length = sessionStorage.getItem('rescheduleLength');
    const price = sessionStorage.getItem('reschedulePrice');
    const addons = JSON.parse(sessionStorage.getItem('rescheduleAddons') || '[]');
    const oldDate = sessionStorage.getItem('rescheduleOldDate');
    
    if (!bookingId || !token) {
        console.error('Reschedule data missing');
        sessionStorage.clear();
        return;
    }
    
    // Set current state for reschedule
    currentState.selectedHairstyle = hairstyle;
    currentState.selectedLength = length;
    currentState.price = parseFloat(price);
    currentState.addons = addons;
    currentState.addonTotal = addons.reduce((sum, addon) => sum + (addon.price || 0), 0);
    
    // Store reschedule info
    window.rescheduleData = {
        bookingId: bookingId,
        token: token,
        oldDate: oldDate
    };
    
    // Show reschedule modal
    showRescheduleModal(hairstyle, length, price, oldDate);
    
    // Clear session storage
    sessionStorage.clear();
}

function showRescheduleModal(hairstyle, length, price, oldDate) {
    const modal = document.createElement('div');
    modal.id = 'rescheduleModal';
    modal.className = 'modal';
    
    // Calculate min date (tomorrow) and max date (90 days from now)
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const minDate = tomorrow.toISOString().split('T')[0];
    
    const maxDate = new Date();
    maxDate.setDate(maxDate.getDate() + 90);
    const maxDateStr = maxDate.toISOString().split('T')[0];
    
    modal.innerHTML = `
        <div class="modal-content" style="max-width: 500px;">
            <button class="close-btn" onclick="closeRescheduleModal()">&times;</button>
            <h2>Reschedule Your Booking</h2>
            <div style="background: #f0e8d8; padding: 1rem; border-radius: 4px; margin-bottom: 1.5rem;">
                <p><strong>Current Appointment:</strong> ${oldDate}</p>
                <p><strong>Hairstyle:</strong> ${hairstyle}</p>
                <p><strong>Length:</strong> ${length}</p>
                <p><strong>Price:</strong> £${price}</p>
            </div>
            
            <div style="margin-bottom: 1.5rem;">
                <label style="display: block; margin-bottom: 0.5rem; color: #d4af37; font-weight: 600;">Select New Date</label>
                <input type="date" id="rescheduleDate" min="${minDate}" max="${maxDateStr}" style="width: 100%; padding: 0.75rem; border: 2px solid #d4af37; border-radius: 4px; font-size: 1rem;">
            </div>
            
            <div id="rescheduleTimeSlots" style="margin-bottom: 1.5rem; min-height: 100px;">
                <p style="text-align: center; color: #999;">Select a date to see available times</p>
            </div>
            
            <div style="display: flex; gap: 1rem;">
                <button type="button" class="btn btn-back" onclick="closeRescheduleModal()" style="flex: 1; padding: 0.75rem; border: none; background-color: #ccc; color: #333; border-radius: 4px; cursor: pointer; font-weight: 600;">Back</button>
                <button type="button" id="confirmRescheduleBtn" class="btn btn-primary" onclick="confirmRescheduleSelection()" style="flex: 1; padding: 0.75rem; border: none; background-color: #d4af37; color: #0a0a0a; border-radius: 4px; cursor: pointer; font-weight: 600; display: none;">Confirm</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    modal.style.display = 'block';
    
    // Add event listener to date input
    document.getElementById('rescheduleDate').addEventListener('change', function() {
        loadRescheduleTimeSlots(this.value);
    });
}

function closeRescheduleModal() {
    const modal = document.getElementById('rescheduleModal');
    if (modal) {
        modal.remove();
    }
    window.rescheduleData = null;
    window.selectedRescheduleSlot = null;
    // Redirect back to home
    window.location.href = '/';
}

async function loadRescheduleTimeSlots(date) {
    if (!date) {
        document.getElementById('rescheduleTimeSlots').innerHTML = '<p style="text-align: center; color: #999;">Select a date to see available times</p>';
        document.getElementById('confirmRescheduleBtn').style.display = 'none';
        return;
    }
    
    try {
        // Get all available slots
        const response = await fetch('/api/available-slots');
        const allSlots = await response.json();
        
        console.log('All available slots:', allSlots.length);
        console.log('Selected date:', date);
        
        // Filter slots for the selected date
        const dateSlots = allSlots.filter(slot => slot.date === date);
        
        console.log('Slots for', date, ':', dateSlots.length);
        
        if (!dateSlots || dateSlots.length === 0) {
            // Show what dates ARE available for debugging
            const availableDates = [...new Set(allSlots.map(s => s.date))];
            console.log('Available dates:', availableDates.slice(0, 10));
            
            document.getElementById('rescheduleTimeSlots').innerHTML = '<p style="color: #ff6b6b; text-align: center;">No available times on this date. Try another date.</p>';
            document.getElementById('confirmRescheduleBtn').style.display = 'none';
            return;
        }
        
        let html = '<label style="display: block; margin-bottom: 0.75rem; color: #d4af37; font-weight: 600;">Select Time</label>';
        html += '<div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(80px, 1fr)); gap: 0.5rem;">';
        
        dateSlots.forEach(slot => {
            html += `
                <button type="button" class="time-slot-btn" onclick="selectRescheduleTime('${slot.date}', '${slot.time}')" 
                    style="padding: 0.75rem; border: 2px solid #d4af37; background-color: #0a0a0a; color: #d4af37; border-radius: 4px; cursor: pointer; font-weight: 600; font-size: 0.9rem;">
                    ${slot.time}
                </button>
            `;
        });
        html += '</div>';
        
        document.getElementById('rescheduleTimeSlots').innerHTML = html;
        document.getElementById('confirmRescheduleBtn').style.display = 'none';
    } catch (error) {
        console.error('Error loading reschedule slots:', error);
        document.getElementById('rescheduleTimeSlots').innerHTML = '<p style="color: #ff6b6b; text-align: center;">Error loading available times</p>';
    }
}

function selectRescheduleTime(date, time) {
    // Store selected slot
    window.selectedRescheduleSlot = { date, time };
    
    // Show confirm button
    document.getElementById('confirmRescheduleBtn').style.display = 'block';
    
    // Highlight selected button
    document.querySelectorAll('.time-slot-btn').forEach(btn => {
        btn.style.backgroundColor = '#0a0a0a';
        btn.style.color = '#d4af37';
    });
    event.target.style.backgroundColor = '#d4af37';
    event.target.style.color = '#0a0a0a';
}

async function confirmRescheduleSelection() {
    if (!window.selectedRescheduleSlot || !window.rescheduleData) {
        alert('Please select a date and time');
        return;
    }
    
    const { date, time } = window.selectedRescheduleSlot;
    const { bookingId, token } = window.rescheduleData;
    
    try {
        const response = await fetch('/api/reschedule-booking', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                id: bookingId,
                token: token,
                newDate: date,
                newTime: time
            })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            // Show success message
            const modal = document.getElementById('rescheduleModal');
            modal.innerHTML = `
                <div class="modal-content">
                    <div style="background: #e8f5e9; border: 2px solid #4caf50; padding: 2rem; border-radius: 8px; text-align: center;">
                        <h2 style="color: #2e7d32; margin-bottom: 1rem;">✓ Booking Rescheduled!</h2>
                        <p><strong>New Date:</strong> ${date}</p>
                        <p><strong>New Time:</strong> ${time}</p>
                        <p style="margin-top: 1.5rem; color: #555;">A confirmation email has been sent to you.</p>
                        <button class="btn-primary" onclick="window.location.href = '/';" style="margin-top: 1.5rem; padding: 0.75rem 1.5rem; border: none; background-color: #4caf50; color: white; border-radius: 4px; cursor: pointer; font-weight: 600;">Return Home</button>
                    </div>
                </div>
            `;
        } else {
            alert('Error: ' + data.error);
        }
    } catch (error) {
        console.error('Reschedule error:', error);
        alert('Failed to reschedule booking');
    }
}
