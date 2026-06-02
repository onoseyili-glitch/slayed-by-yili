// Service Categories and Pricing Data
const services = {
    braids: {
        name: 'Braids',
        description: 'Professional braiding styles',
        hairstyles: [
            { name: 'Knotless', pricing: { short: 40, medium: 50, long: 60, extra: 70 } },
            { name: 'Box', pricing: { short: 35, medium: 45, long: 55, extra: 65 } },
            { name: 'Fulani', pricing: { short: 45, medium: 55, long: 65, extra: 75 } },
            { name: 'Jumbo', pricing: { short: 25, medium: 30, long: 35, extra: 40 } },
            { name: 'Boho', pricing: { short: 40, medium: 45, long: 55, extra: 60 } },
        ]
    },
    twists: {
        name: 'Twists',
        description: 'Stylish twist variations',
        hairstyles: [
            { name: 'Passion', pricing: { short: 35, medium: 45, long: 55, extra: 70 } },
            { name: 'Spring', pricing: { short: 35, medium: 45, long: 55, extra: 70 } },
            { name: 'Mini', pricing: { short: 50, medium: 60, long: 70, extra: 80 } },
            { name: 'Rope', pricing: { fixed: 40 } },
            { name: 'Island Twists', pricing: { short: 45, medium: 55, long: 65, extra: 75 } },
            { name: 'Kinky Twists', pricing: { short: 35, medium: 40, long: 50 } },
            { name: 'Two-Strand (Natural Hair)', pricing: { fixed: 30 } }
        ]
    },
    locstyles: {
        name: 'Loc Styles (Install Only)',
        description: 'Beautiful locs and loc variations',
        hairstyles: [
            { name: 'Butterfly', pricing: { fixed: 50 } },
            { name: 'Soft', pricing: { fixed: 50 } },
            { name: 'Faux', pricing: { fixed: 50 } },
            { name: 'Goddess', pricing: { fixed: 50 } },
            { name: 'Invisible', pricing: { fixed: 50 } }
        ]
    },
    cornrows: {
        name: 'Cornrows',
        description: 'Classic and creative cornrow designs',
        hairstyles: [
            { name: 'Straight-back', pricing: { short: 15, medium: 20, long: 25 } },
            { name: 'Fulani Cornrows', pricing: { fixed: 40 } },
            { name: 'Curved / Simple Designs', pricing: { fixed: 35 } }
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
            { name: 'Kids Braids', pricing: { short: 20, medium: 25, long: 30 } },
            { name: 'Beaded Braids', pricing: { short: 25, medium: 30, long: 35 } },
            { name: 'Kids Cornrows', pricing: { short: 20, medium: 25, long: 30 } },
            { name: 'Kids Natural Styles', pricing: { fixed: 15 } }
        ]
    },
    preparting: {
        name: 'Pre Parting',
        description: 'Professional pre-parting preparation',
        hairstyles: [
            { name: 'Pre Parting', pricing: { fixed: 20 } }
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

// Built-in discount codes for customers
const DISCOUNT_CODES = {
    YILI10: {
        type: 'percent',
        value: 10,
        label: '10% off'
    },
    BDAY10: {
        type: 'percent',
        value: 30,
        label: '30% off'
    },
    FRIEND15: {
        type: 'percent',
        value: 15,
        label: '15% off'
    }
};

// State Management
let currentState = {
    selectedCategory: null,
    selectedHairstyle: null,
    selectedLength: null,
    price: null,
    addons: [],
    addonTotal: 0,
    discountCode: null,
    discountAmount: 0,
    paymentIntentId: null,
    selectedDate: null,
    selectedTime: null
};

// Initialize Stripe
let stripe, cardElement;

function getLocalDateString(date = new Date()) {
    const localDate = new Date(date.getTime() - (date.getTimezoneOffset() * 60000));
    return localDate.toISOString().split('T')[0];
}

function getTomorrowLocalDateString() {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return getLocalDateString(tomorrow);
}

document.addEventListener('DOMContentLoaded', function() {
    renderServiceCategories();
    setupEventListeners();
    setupAnchorScroll();
    loadBlockedDates();
    handleInitialHash();

    // Check if this is a reschedule request
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('reschedule') === 'true') {
        handleRescheduleFlow();
    }
});

function handleInitialHash() {
    if (window.location.hash) {
        const targetId = window.location.hash.slice(1);
        // Delay slightly to allow page to render before scrolling
        setTimeout(() => scrollToSection(targetId), 50);
    }
}

window.addEventListener('hashchange', () => {
    const targetId = window.location.hash.slice(1);
    scrollToSection(targetId);
});

function setupAnchorScroll() {
    const navLinks = document.querySelectorAll('.nav-links a[href^="#"]');
    navLinks.forEach(link => {
        link.addEventListener('click', (event) => {
            event.preventDefault();
            const targetId = link.getAttribute('href').slice(1);
            scrollToSection(targetId);
        });
    });
}

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
    
    // Quantity button controls for both add-on inputs and standalone extension inputs
    document.querySelectorAll('.qty-btn').forEach(button => {
        const targetSelector = button.dataset.target;
        if (!targetSelector) return;

        const quantityInput = document.querySelector(targetSelector);
        if (!quantityInput) return;

        button.addEventListener('click', () => {
            let quantity = parseInt(quantityInput.value, 10) || 0;
            if (button.dataset.action === 'decrease') {
                quantity = Math.max(0, quantity - 1);
            } else {
                quantity += 1;
            }
            quantityInput.value = quantity;
            if (quantityInput.classList.contains('ext-qty-input')) {
                updateAddonPrice();
                return;
            }
            const relatedCheckbox = document.querySelector(quantityInput.dataset.relatedCheckbox);
            if (relatedCheckbox) {
                relatedCheckbox.dataset.addonQuantity = quantity.toString();
                if (relatedCheckbox.checked) updateAddonPrice();
            }
        });
    });

    document.querySelectorAll('.ext-qty-input').forEach(input => {
        input.addEventListener('change', () => {
            let quantity = parseInt(input.value, 10);
            if (isNaN(quantity) || quantity < 0) quantity = 0;
            input.value = quantity;
            updateAddonPrice();
        });
    });

    // Close modal when clicking policies link in checkbox
    const policyLinks = document.querySelectorAll('a[href="#policies"]');
    policyLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            // Close any open modals
            const modals = document.querySelectorAll('.modal');
            modals.forEach(modal => modal.classList.add('hidden'));
            unlockBodyScroll();
        });
    });
}

function unlockBodyScroll() {
    document.body.style.overflow = '';
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

    document.body.style.overflow = 'hidden';
    modal.classList.remove('hidden');
}

function closeServiceModal() {
    document.getElementById('serviceModal').classList.add('hidden');
    unlockBodyScroll();
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
    
    document.body.style.overflow = 'hidden';
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
    unlockBodyScroll();
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
    document.body.style.overflow = 'hidden';
    document.getElementById('summaryHairstyle').textContent = currentState.selectedHairstyle;
    document.getElementById('summaryLength').textContent = currentState.selectedLength;
    document.getElementById('summaryPrice').textContent = currentState.price;
    
    // Reset add-ons
    currentState.addons = [];
    currentState.addonTotal = 0;
    currentState.discountCode = null;
    currentState.discountAmount = 0;

    const discountInput = document.getElementById('discountCodeInput');
    const discountMessage = document.getElementById('discountMessage');
    const discountLine = document.getElementById('discountLine');
    const addonsTotal = document.getElementById('addonsTotal');

    discountInput.value = '';
    discountMessage.textContent = 'Have a promo code? Enter it below and tap Apply.';
    discountLine.style.display = 'none';
    addonsTotal.style.display = 'none';
    
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
        // clear any previous color selection or quantity stored on the checkbox
        delete checkbox.dataset.addonColor;
        checkbox.dataset.addonQuantity = '1';

        const quantityInput = document.querySelector(`.addon-qty-input[data-related-checkbox="#${checkbox.id}"]`);
        if (quantityInput) {
            quantityInput.value = '1';
            quantityInput.disabled = true;
            quantityInput.addEventListener('change', () => {
                let quantity = parseInt(quantityInput.value, 10);
                if (isNaN(quantity) || quantity < 1) quantity = 1;
                quantityInput.value = quantity;
                checkbox.dataset.addonQuantity = quantity.toString();
                if (checkbox.checked) updateAddonPrice();
            });
        }

        checkbox.addEventListener('change', () => {
            if (quantityInput) {
                if (checkbox.checked) {
                    quantityInput.disabled = false;
                    checkbox.dataset.addonQuantity = parseInt(quantityInput.value, 10) || 1;
                } else {
                    quantityInput.disabled = true;
                    quantityInput.value = '1';
                    checkbox.dataset.addonQuantity = '1';
                }
            }
            updateAddonPrice();
        });
    });

    // Setup extension color pickers (buttons under the Bone Straight Extensions addon)
    document.querySelectorAll('.extension-color-picker').forEach(picker => {
        const relatedSelector = picker.dataset.relatedCheckbox;
        const relatedCheckbox = relatedSelector ? document.querySelector(relatedSelector) : null;
        picker.querySelectorAll('.color-option').forEach(btn => {
            btn.addEventListener('click', () => {
                // mark selected button
                picker.querySelectorAll('.color-option').forEach(b => b.classList.remove('selected'));
                btn.classList.add('selected');

                const color = btn.dataset.addonColor;
                if (relatedCheckbox) {
                    relatedCheckbox.dataset.addonColor = color;
                }
                // if the addon is already checked, update the addon list/prices to include color
                if (relatedCheckbox && relatedCheckbox.checked) updateAddonPrice();
            });
        });
    });

    updateAddonPrice();
    
    const modal = document.getElementById('pricingModal');
    modal.classList.remove('hidden');
}

function collectStandaloneExtensionSelections() {
    const selections = [];
    document.querySelectorAll('.ext-qty-input').forEach(input => {
        const quantity = parseInt(input.value, 10) || 0;
        if (quantity <= 0) return;
        const color = input.dataset.extensionColor || '';
        selections.push({
            name: `Bone Straight Extensions (${color}) x${quantity}`,
            price: 5 * quantity,
            color: color,
            quantity: quantity
        });
    });
    return selections;
}

function getSubtotalPrice() {
    return (Number(currentState.price) || 0) + (Number(currentState.addonTotal) || 0);
}

function getDiscountAmount(subtotal) {
    if (!currentState.discountCode) return 0;
    const rule = DISCOUNT_CODES[currentState.discountCode];
    if (!rule) return 0;

    let discount = 0;
    if (rule.type === 'percent') {
        discount = subtotal * (rule.value / 100);
    } else if (rule.type === 'fixed') {
        discount = rule.value;
    }

    return Math.min(subtotal, Number(discount.toFixed(2)));
}

function getFinalTotalPrice() {
    const subtotal = getSubtotalPrice();
    const discount = getDiscountAmount(subtotal);
    return Number((subtotal - discount).toFixed(2));
}

function updateTotalPriceDisplay() {
    const subtotal = getSubtotalPrice();
    const discount = getDiscountAmount(subtotal);
    const finalTotal = Number((subtotal - discount).toFixed(2));

    currentState.discountAmount = discount;

    document.getElementById('totalPrice').textContent = finalTotal;

    const discountLine = document.getElementById('discountLine');
    if (discount > 0) {
        discountLine.style.display = 'block';
        document.getElementById('discountAmount').textContent = discount;
    } else {
        discountLine.style.display = 'none';
    }
}

function applyDiscountCode() {
    const input = document.getElementById('discountCodeInput');
    const discountMessage = document.getElementById('discountMessage');
    const code = (input.value || '').trim().toUpperCase();

    if (!code) {
        currentState.discountCode = null;
        currentState.discountAmount = 0;
        discountMessage.textContent = 'Please enter a discount code.';
        updateTotalPriceDisplay();
        return;
    }

    if (!DISCOUNT_CODES[code]) {
        currentState.discountCode = null;
        currentState.discountAmount = 0;
        discountMessage.textContent = 'Code not valid. Try again.';
        updateTotalPriceDisplay();
        return;
    }

    currentState.discountCode = code;
    updateTotalPriceDisplay();

    const rule = DISCOUNT_CODES[code];
    discountMessage.textContent = `Code applied: ${code} (${rule.label})`;
}

function updateAddonPrice() {
    currentState.addons = [];
    currentState.addonTotal = 0;

    document.querySelectorAll('.addon-checkbox:checked').forEach(checkbox => {
        const color = checkbox.dataset.addonColor || '';
        const quantity = parseInt(checkbox.dataset.addonQuantity || '1', 10) || 1;
        const unitPrice = parseInt(checkbox.dataset.addonPrice, 10) || 0;
        const price = unitPrice * quantity;
        let addonName = color ? `${checkbox.dataset.addonName} (${color})` : checkbox.dataset.addonName;
        if (quantity > 1) {
            addonName = `${addonName} x${quantity}`;
        }

        currentState.addons.push({
            name: addonName,
            price: price,
            color: color,
            quantity: quantity
        });
        currentState.addonTotal += price;
    });

    const extensionSelections = collectStandaloneExtensionSelections();
    extensionSelections.forEach(selection => {
        currentState.addons.push(selection);
        currentState.addonTotal += selection.price;
    });

    // Deduplicate/merge addons by color/name to avoid duplicate entries (e.g. from both addon checkbox and standalone selectors)
    const merged = {};
    currentState.addons.forEach(a => {
        const key = (a.color && a.color.toString()) || a.name;
        if (!merged[key]) {
            merged[key] = Object.assign({}, a);
        } else {
            // merge quantities and prices
            merged[key].quantity = (Number(merged[key].quantity) || 0) + (Number(a.quantity) || 0);
            merged[key].price = (Number(merged[key].price) || 0) + (Number(a.price) || 0);
            // update display name to reflect quantity
            merged[key].name = `${merged[key].name.replace(/ x\d+$/, '')} x${merged[key].quantity}`;
        }
    });

    currentState.addons = Object.values(merged);
    // Recompute addonTotal to be safe
    currentState.addonTotal = currentState.addons.reduce((s, a) => s + (Number(a.price) || 0), 0);

    // Update total price display
    updateTotalPriceDisplay();

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
    unlockBodyScroll();
}

function proceedToPayment() {
    closePricingModal();
    // Go straight to time slot selection (payment handled via bank transfer after booking)
    openTimeSlotModal();
}

function goBackToPricing() {
    closeTimeSlotModal();
    openPricingModal();
}

function openTimeSlotModal() {
    const modal = document.getElementById('timeSlotModal');
    document.body.style.overflow = 'hidden';
    modal.classList.remove('hidden');
    
    // Set minimum date to today
    const minDate = getLocalDateString();
    
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
    unlockBodyScroll();
}

function generateTimeSlots() {
    const dateInput = document.getElementById('appointmentDate').value;
    if (!dateInput) return;
    
    const todayLocal = getLocalDateString();
    if (dateInput < todayLocal) {
        document.getElementById('bookingMessage').textContent = '❌ You cannot select a past date.';
        document.getElementById('timeSlotsContainer').innerHTML = '';
        document.getElementById('appointmentDate').value = '';
        return;
    }
    
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

// --- Site search overlay functionality ---
function openSiteSearch() {
    document.getElementById('siteSearchOverlay').classList.remove('hidden');
    document.getElementById('siteSearchInput').value = '';
    document.getElementById('siteSearchResults').innerHTML = '';
    document.getElementById('siteSearchInput').focus();
    document.body.style.overflow = 'hidden';
}

function closeSiteSearch() {
    document.getElementById('siteSearchOverlay').classList.add('hidden');
    document.body.style.overflow = '';
}

function performSiteSearch(query) {
    const resultsContainer = document.getElementById('siteSearchResults');
    resultsContainer.innerHTML = '';
    if (!query || query.trim().length < 1) return;
    const q = query.trim().toLowerCase();
    // search within headings, paragraphs, links
    const nodes = Array.from(document.querySelectorAll('h1,h2,h3,h4,p,a,li'));
    const matches = [];
    nodes.forEach(node => {
        const text = (node.textContent || '').trim();
        if (!text) return;
        if (text.toLowerCase().includes(q)) {
            matches.push({ node, text });
        }
    });

    if (matches.length === 0) {
        resultsContainer.innerHTML = '<p style="padding:12px;color:#666">No results found.</p>';
        return;
    }

    matches.slice(0,50).forEach(match => {
        const el = document.createElement('div');
        el.className = 'search-result-item';
        const title = document.createElement('h4');
        // show first 60 chars as title
        title.textContent = match.text.length > 60 ? match.text.slice(0,60) + '…' : match.text;
        const snippet = document.createElement('p');
        snippet.textContent = (match.node.parentElement && match.node.parentElement.id) ? `In section: #${match.node.parentElement.id}` : '';
        el.appendChild(title);
        el.appendChild(snippet);
        el.addEventListener('click', () => {
            // scroll to the node
            match.node.scrollIntoView({ behavior: 'smooth', block: 'center' });
            closeSiteSearch();
        });
        resultsContainer.appendChild(el);
    });
}

// Wire search UI
document.addEventListener('DOMContentLoaded', () => {
    const searchBtn = document.getElementById('siteSearchButton');
    const overlay = document.getElementById('siteSearchOverlay');
    const closeBtn = overlay ? overlay.querySelector('.close-search') : null;
    const input = document.getElementById('siteSearchInput');

    const checkoutBtn = document.getElementById('siteCheckoutButton');

    if (checkoutBtn) checkoutBtn.addEventListener('click', openCheckoutModal);
    if (searchBtn) searchBtn.addEventListener('click', openSiteSearch);
    if (closeBtn) closeBtn.addEventListener('click', closeSiteSearch);
    if (overlay) overlay.addEventListener('click', (e) => { if (e.target === overlay) closeSiteSearch(); });
    if (input) {
        input.addEventListener('input', (e) => performSiteSearch(e.target.value));
        input.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeSiteSearch(); });
    }

    // keyboard shortcut Ctrl+K or Cmd+K to open
    document.addEventListener('keydown', (e) => {
        if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
            e.preventDefault();
            openSiteSearch();
        }
    });
});

function selectTimeSlot(time) {
    const dateInput = document.getElementById('appointmentDate').value;
    currentState.selectedDate = dateInput;
    currentState.selectedTime = time;
    
    closeTimeSlotModal();
    openBookingModal();
}

function openBookingModal() {
    // Pre-fill with selected date and time from time slot
    const preferredDateInput = document.getElementById('preferredDate');
    const todayLocal = getLocalDateString();
    preferredDateInput.min = todayLocal;
    preferredDateInput.setAttribute('required', 'true');

    if (currentState.selectedDate && currentState.selectedTime) {
        preferredDateInput.value = currentState.selectedDate;
        document.getElementById('preferredTime').value = currentState.selectedTime;
    }
    
    // Prevent manual date entry of past dates
    preferredDateInput.addEventListener('change', () => {
        if (preferredDateInput.value && preferredDateInput.value < todayLocal) {
            preferredDateInput.value = '';
            alert('You cannot select a past date.');
        }
    });
    
    document.getElementById('bookingModal').classList.remove('hidden');
}

function closeBookingModal() {
    document.getElementById('bookingModal').classList.add('hidden');
    unlockBodyScroll();
}

async function handleBookingSubmit(e) {
    e.preventDefault();
    
    // Check if policy agreement checkbox is checked
    const policyCheckbox = document.getElementById('policyAgreement');
    if (!policyCheckbox.checked) {
        alert('Please confirm that you have read and agree to all booking policies before proceeding.');
        return;
    }
    
    const submitBtn = e.target.querySelector('button[type="submit"]');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Processing...';

    const selectedDate = document.getElementById('preferredDate').value;
    const todayLocal = getLocalDateString();
    if (selectedDate < todayLocal) {
        alert('You cannot book a past date. Please select today or a future date.');
        submitBtn.disabled = false;
        submitBtn.textContent = 'Confirm Booking';
        return;
    }
    
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
        discountCode: currentState.discountCode,
        discountAmount: currentState.discountAmount,
        totalPrice: getFinalTotalPrice(),
        paymentIntentId: currentState.paymentIntentId
    };
    
    console.log('Sending booking data:', bookingData);
    
    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 60000);
        
        const response = await fetch('/submit-booking', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(bookingData),
            signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        
        console.log('Response status:', response.status);
        
        let responseData;
        try {
            responseData = await response.json();
        } catch (parseError) {
            console.error('Failed to parse response:', parseError);
            throw new Error('Server returned invalid response');
        }
        
        console.log('Response data:', responseData);
        
        if (!response.ok) {
            throw new Error(responseData.error || `Server error: ${response.status}`);
        }
        
        closeBookingModal();

        if (responseData.whatsappLink) {
            window.open(responseData.whatsappLink, '_blank');
        }

        openConfirmationModal(responseData.whatsappLink);

        submitBtn.disabled = false;
        submitBtn.textContent = 'Confirm Booking';
    } catch (error) {
        console.error('Booking error:', error);
        let errorMsg = 'Booking failed: ';
        if (error.name === 'AbortError') {
            errorMsg += 'Request timed out. Server may be slow. Please try again.';
        } else {
            errorMsg += error.message + '\n\nPlease check your internet connection or try again later.';
        }
        alert(errorMsg);
        submitBtn.disabled = false;
        submitBtn.textContent = 'Confirm Booking';
    }
}

function openConfirmationModal(whatsappLink) {
    const whatsappButton = document.getElementById('openWhatsAppButton');

    if (whatsappButton && whatsappLink) {
        whatsappButton.href = whatsappLink;
        whatsappButton.classList.remove('hidden');
    }

    document.getElementById('confirmationModal').classList.remove('hidden');
}

function returnHome() {
    document.getElementById('confirmationModal').classList.add('hidden');
    unlockBodyScroll();
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
        discountCode: null,
        discountAmount: 0,
        paymentIntentId: null,
        selectedDate: null,
        selectedTime: null
    };
    document.getElementById('bookingForm').reset();

    const whatsappButton = document.getElementById('openWhatsAppButton');
    if (whatsappButton) {
        whatsappButton.href = '#';
        whatsappButton.classList.add('hidden');
    }
}

function scrollToSection(id) {
    const element = document.getElementById(id);
    if (!element) return;

    const header = document.querySelector('.navbar');
    const headerHeight = header ? header.offsetHeight : 0;

    const elementTop = element.getBoundingClientRect().top + window.pageYOffset;
    const offsetTop = elementTop - headerHeight - 10; // small gap

    window.scrollTo({ top: offsetTop, behavior: 'smooth' });
}

function scrollToServices() {
    scrollToSection('services');
}

function openCheckoutModal() {
    populateCheckoutModal();
    const modal = document.getElementById('checkoutModal');
    if (modal) {
        modal.classList.remove('hidden');
        document.body.style.overflow = 'hidden';
    }
}

function closeCheckoutModal() {
    const modal = document.getElementById('checkoutModal');
    if (modal) {
        modal.classList.add('hidden');
        unlockBodyScroll();
    }
}

function populateCheckoutModal() {
    const itemsContainer = document.getElementById('checkoutItems');
    itemsContainer.innerHTML = '';

    // Include main selection
    if (currentState.selectedHairstyle) {
        const div = document.createElement('div');
        div.className = 'item';
        div.innerHTML = `<span>${currentState.selectedHairstyle} (${currentState.selectedLength || 'Standard'})</span><strong>£${Number(currentState.price || 0).toFixed(2)}</strong>`;
        itemsContainer.appendChild(div);
    }

    // Add addons / extensions
    if (currentState.addons && currentState.addons.length > 0) {
        currentState.addons.forEach(addon => {
            const div = document.createElement('div');
            div.className = 'item';

            const label = addon.color ? 'Bone Straight Extension' : addon.name;
            const subtitle = addon.color ? `<div class="item-meta">• ${addon.color} × ${addon.quantity || 1}</div>` : '';
            const price = Number(addon.price || 0).toFixed(2);

            div.innerHTML = `<div><strong>${label}</strong>${subtitle}</div><strong>£${price}</strong>`;
            itemsContainer.appendChild(div);
        });
    }

    const subtotal = getSubtotalPrice();
    const totalEl = document.getElementById('checkoutTotal');
    totalEl.textContent = `Subtotal: £${Number(subtotal).toFixed(2)}`;

    // Wire modal buttons
    const closeBtn = document.getElementById('closeCheckoutModal');
    const cancelBtn = document.getElementById('cancelCheckoutBtn');
    const confirmBtn = document.getElementById('confirmCheckoutBtn');

    if (closeBtn) closeBtn.onclick = closeCheckoutModal;
    if (cancelBtn) cancelBtn.onclick = closeCheckoutModal;
    if (confirmBtn) confirmBtn.onclick = confirmCheckoutAndSend;
}

function confirmCheckoutAndSend() {
    // Gather form values
    const name = (document.getElementById('checkoutName') || {}).value || '';
    const address = (document.getElementById('checkoutAddress') || {}).value || '';
    const phone = (document.getElementById('checkoutPhone') || {}).value || '';
    const delivery = document.querySelector('input[name="deliveryOption"]:checked') ? document.querySelector('input[name="deliveryOption"]:checked').value : 'standard';

    let deliveryLabel = 'Standard UK Delivery (£4.99)';
    let deliveryCost = 4.99;
    if (delivery === 'express') { deliveryLabel = 'Express UK Delivery (£7.99)'; deliveryCost = 7.99; }
    if (delivery === 'collection') { deliveryLabel = 'Collection (Pickup)'; deliveryCost = 0; }

    const subtotal = getSubtotalPrice();
    const total = Number(subtotal) + Number(deliveryCost);

    // Build message
    const lines = [];
    lines.push('Hi 👋🏾💖');
    lines.push('');
    lines.push('I’d like to place an order with Slayed by Yili ✨💇🏾‍♀️');
    lines.push('');
    lines.push('🛍️ Order Details');

    if (currentState.selectedHairstyle) {
        lines.push(`• Hair: ${currentState.selectedHairstyle}`);
    }
    if (currentState.selectedLength) {
        lines.push(`• Length: ${currentState.selectedLength}`);
    }

    // include specific extensions from addons with clear colour variants
    if (currentState.addons && currentState.addons.length > 0) {
        lines.push('');
        lines.push('🧩 Add-ons & Extensions');
        currentState.addons.forEach(addon => {
            if (addon.color) {
                lines.push(`• Bone Straight Extension - ${addon.color} × ${addon.quantity || 1}`);
            } else {
                lines.push(`• ${addon.name}${addon.quantity ? ' × ' + addon.quantity : ''}`);
            }
        });
    }

    lines.push('');
    lines.push('🚚 Delivery Method');
    lines.push(`• ${deliveryLabel}`);
    lines.push('');
    lines.push('💷 Order Total');
    lines.push(`• £${Number(total).toFixed(2)}`);
    lines.push('');
    lines.push('📍 Customer Details');
    lines.push(`• Name: ${name}`);
    lines.push(`• Delivery Address: ${address}`);
    lines.push(`• Contact Number: ${phone}`);
    lines.push('');
    lines.push('Thank you 💕 I look forward to hearing from you');

    const checkoutUrl = `https://wa.me/447500039928?text=${encodeURIComponent(lines.join('\n'))}`;
    window.open(checkoutUrl, '_blank');
    closeCheckoutModal();
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
    const minDate = getTomorrowLocalDateString();
    
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
