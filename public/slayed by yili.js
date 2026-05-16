function scrollToCart() {
	const el = document.getElementById('order');
	if (el) el.scrollIntoView({ behavior: 'smooth' });
}

function scrollToMenu() {
	const el = document.getElementById('menu');
	if (el) el.scrollIntoView({ behavior: 'smooth' });
}

// Initialize minimal cart display
// Cart state
let cart = [];


// Show delivery form when customizing
function showDeliveryForm() {
const deliverySection = document.getElementById('deliverySection');
if (deliverySection && cart.length > 0) {
deliverySection.classList.remove('hidden');
}
}

// Show delivery form when item is selected
function toggleItem(checkbox) {
const itemName = checkbox.dataset.name;
const itemPrice = parseFloat(checkbox.dataset.price);

if (checkbox.checked) {
// Add to cart
const existingItem = cart.find(item => item.name === itemName);
if (existingItem) {
existingItem.quantity++;
} else {
cart.push({ name: itemName, price: itemPrice, quantity: 1 });
}
} else {
// Remove from cart
cart = cart.filter(item => item.name !== itemName);
}

updateCartDisplay();

// Show delivery section if items selected
if (cart.length > 0) {
const deliverySection = document.getElementById('deliverySection');
if (deliverySection) {
deliverySection.classList.remove('hidden');
}
}
});
	} else {
		cart = cart.filter(i => i.name !== name);
	}
	updateCartDisplay();
}

function addCombo(name, price) {
	const existing = cart.find(i => i.name === name);
	if (existing) {
		existing.quantity += 1;
	} else {
		cart.push({ name, price, quantity: 1 });
	}
	updateCartDisplay();
	scrollToCart();
}



	// Badge shows sum of quantities
	const totalQty = cart.reduce((s, it) => s + it.quantity, 0);
	const cartBadge = document.getElementById("cartBadge"); if (cartBadge) cartBadge.textContent = String(totalQty);
	floatingCartCount.classList.remove('hidden');

	// Items list with qty controls
	cartItems.innerHTML = cart.map(item => `
		<div class="cart-item">
			<div class="cart-item-name">✓ ${item.name}</div>
			<div class="cart-item-controls">
				<button class="qty-btn" data-name="${item.name}" data-delta="-1" aria-label="Decrease">−</button>
				<span class="qty-display">${item.quantity}</span>
				<button class="qty-btn" data-name="${item.name}" data-delta="1" aria-label="Increase">+</button>
			</div>
			<div class="cart-item-price">£${(item.price * item.quantity).toFixed(2)}</div>
		</div>
	`).join('');

	// Totals
	const total = cart.reduce((sum, it) => sum + it.price * it.quantity, 0);
	totalAmount.textContent = total.toFixed(2);
	cartTotal.classList.remove('hidden');
	if (deliverySection) deliverySection.classList.remove('hidden');
}

function changeQuantity(itemName, delta) {
	const item = cart.find(i => i.name === itemName);
	if (!item) return;
	item.quantity += delta;
	if (item.quantity <= 0) {
		cart = cart.filter(i => i.name !== itemName);
		const checkbox = document.querySelector(`.item-checkbox[data-name="${itemName.replace(/\"/g, '\\"')}"]`);
		if (checkbox) checkbox.checked = false;
	}
	updateCartDisplay();
}

async function sendOrderToWhatsApp() {
const customerName = document.getElementById('customerName').value;
const customerEmail = document.getElementById('customerEmail').value;
const customerPhone = document.getElementById('customerPhone').value;
const orderDate = document.getElementById('orderDate').value;
const orderTime = document.getElementById('orderTime').value;
const deliveryType = document.getElementById('deliveryType').value;
const deliveryAddress = document.getElementById('deliveryAddress').value;
const customMessage = document.getElementById('comboCustomMessage').value;
const allergies = document.getElementById('allergies').value;
const specialInstructions = document.getElementById('specialInstructions').value;

if (!customerName || !customerEmail || !orderDate || !orderTime || !deliveryType) {
alert('Please fill in all required delivery details (Name, Email, Date, Time, Delivery Type)');
return;
}

if (cart.length === 0) {
alert('Please select items for your order');
return;
}

// Build cart items list
let cartList = 'ORDER DETAILS:\n\n';
let total = 0;
cart.forEach(item => {
const itemTotal = item.price * item.quantity;
total += itemTotal;
cartList += \� \ x\ = �\\n\;
});

// Build customization message
let customizationMsg = '';
if (customMessage) {
customizationMsg = \\nCUSTOMIZATION REQUEST:\n\\n\;
}

// Build contact info
let contactInfo = \\nCUSTOMER CONTACT DETAILS:\n\;
contactInfo += \Name: \\n\;
contactInfo += \Email: \\n\;
if (customerPhone) contactInfo += \Phone: \\n\;
contactInfo += \\nDELIVERY INFORMATION:\n\;
contactInfo += \Date Needed: \\n\;
contactInfo += \Time: \\n\;
contactInfo += \Type: \\n\;
if (deliveryAddress && deliveryType === 'delivery') {
contactInfo += \Address: \\n\;
}

// Build special requests
let specialMsg = '';
if (allergies || specialInstructions) {
specialMsg += \\nSPECIAL REQUESTS:\n\;
if (allergies) specialMsg += \Allergies: \\n\;
if (specialInstructions) specialMsg += \Special Instructions: \\n\;
}

// Build final message
const fullMessage = \Hi Food Embassy! ??\n\nI'd like to place an order:\n\n\\n\\\\nPlease confirm availability and provide final cost. Thanks! ??\;

const encodedMessage = encodeURIComponent(fullMessage);
window.open(\https://wa.me/447776517899?text=\\, '_blank');
}
	const customerName = (document.getElementById('customerName')?.value || '').trim();
	const customerEmail = (document.getElementById('customerEmail')?.value || '').trim();
	const customerPhone = (document.getElementById('customerPhone')?.value || '').trim();
	const orderDate = document.getElementById('orderDate')?.value;
	const orderTime = document.getElementById('orderTime')?.value;
	const deliveryType = document.getElementById('deliveryType')?.value;
	const deliveryAddress = document.getElementById('deliveryAddress')?.value || '';
	const allergies = document.getElementById('allergies')?.value || '';
	const specialInstructions = document.getElementById('specialInstructions')?.value || '';

	if (!customerName || !customerEmail || !orderDate || !orderTime || !deliveryType) {
		alert('Please fill in name, email, date, time and delivery type.');
		return;
	}
	if (deliveryType === 'delivery' && !deliveryAddress) {
		alert('Please enter delivery address.');
		return;
	}

	const dateObj = new Date(orderDate);
	const formattedDate = dateObj.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
	const formattedTime = orderTime; // 24-hour
	const total = cart.reduce((sum, it) => sum + it.price * it.quantity, 0);

	let message = '*🍽️ New Order from Food Embassy*%0A%0A';
	message += '*📋 Order Details:*%0A';
	cart.forEach(it => { message += `${it.quantity}x ${it.name} - £${(it.price * it.quantity).toFixed(2)}%0A`; });

	// Add global combo custom note if provided
	const comboCustomMessage = (document.getElementById('comboCustomMessage')?.value || '').trim();
	if (comboCustomMessage) {
		message += `%0A*🛠️ Combo Custom Request:*%0A${encodeURIComponent(comboCustomMessage)}%0A`;
	}
	message += `%0A*💰 Total: £${total.toFixed(2)}*%0A%0A`;
	message += `*📅 Date:* ${formattedDate}%0A`;
	message += `*🕐 Time:* ${formattedTime}%0A`;
	message += `*🚗 Delivery Type:* ${deliveryType === 'delivery' ? 'Delivery' : 'Pickup'}%0A`;
	if (customerPhone) message += `*📞 Phone:* ${customerPhone}%0A`;
	if (deliveryAddress) message += `*📍 Address:* ${deliveryAddress}%0A`;
	if (allergies) message += `*🚫 Allergies:* ${allergies}%0A`;
	if (specialInstructions) message += `*📝 Special Instructions:* ${specialInstructions}%0A`;
	message += '%0AThank you!';

	const whatsappNumber = '447776517899';
	const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${message}`;
	const opened = window.open(whatsappUrl, '_blank');
	if (!opened) window.location.href = whatsappUrl;
}

document.addEventListener('DOMContentLoaded', () => {
	updateCartDisplay();

	// Delegated handler for qty buttons
	const cartItems = document.getElementById('cartItems');
	if (cartItems) {
		cartItems.addEventListener('click', (e) => {
			const btn = e.target.closest('.qty-btn');
			if (!btn) return;
			const name = btn.dataset.name;
			const delta = parseInt(btn.dataset.delta, 10);
			if (name && !isNaN(delta)) changeQuantity(name, delta);
		});
	}

	// Show/hide address for delivery type
	const deliveryTypeEl = document.getElementById('deliveryType');
	const addressInput = document.getElementById('deliveryAddress');
	const addressGroup = document.getElementById('addressGroup');
	const toggleAddress = () => {
		if (!deliveryTypeEl || !addressGroup || !addressInput) return;
		if (deliveryTypeEl.value === 'delivery') {
			addressGroup.style.display = '';
			addressInput.required = true;
		} else {
			addressGroup.style.display = 'none';
			addressInput.required = false;
			addressInput.value = '';
		}
	};
	if (deliveryTypeEl) {
		deliveryTypeEl.addEventListener('change', toggleAddress);
		toggleAddress();
	}

	// No per-combo toggle; using global message section

});

function sendContactMessage() {
	const name = (document.getElementById('contactName')?.value || '').trim();
	const email = (document.getElementById('contactEmail')?.value || '').trim();
	const phone = (document.getElementById('contactPhone')?.value || '').trim();
	const message = (document.getElementById('contactMessage')?.value || '').trim();

	if (!name || !email || !message) {
		alert('Please fill in your name, email, and message.');
		return;
	}

	let whatsappMsg = '*💬 New Message from Food Embassy Website*%0A%0A';
	whatsappMsg += `*👤 Name:* ${encodeURIComponent(name)}%0A`;
	whatsappMsg += `*📧 Email:* ${encodeURIComponent(email)}%0A`;
	if (phone) whatsappMsg += `*📞 Phone:* ${encodeURIComponent(phone)}%0A`;
	whatsappMsg += `%0A*📝 Message:*%0A${encodeURIComponent(message)}`;

	const whatsappNumber = '447776517899';
	const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${whatsappMsg}`;
	const opened = window.open(whatsappUrl, '_blank');
	if (!opened) window.location.href = whatsappUrl;
}


// Floating cart click handler
document.addEventListener('DOMContentLoaded', () => {
const floatingCart = document.getElementById('floatingCartCount');
if (floatingCart) {
floatingCart.addEventListener('click', () => {
const orderSection = document.getElementById('order');
if (orderSection) {
orderSection.scrollIntoView({ behavior: 'smooth' });
}
});
}
});


// Event Booking
function sendEventQuoteRequest() {
const eventName = document.getElementById('eventName').value;
const eventType = document.getElementById('eventType').value;
const eventDate = document.getElementById('eventDate').value;
const guestCount = document.getElementById('guestCount').value;
const eventPhone = document.getElementById('eventPhone').value;

if (!eventName || !eventType || !eventDate || !guestCount || !eventPhone) {
alert('Please fill in all required fields');
return;
}

const message = Hi Food Embassy! I'd like a quote for my event:

Event: \
Type: \
Date: \
Guests: \
Phone: \

Looking forward to hearing from you!;

const encodedMessage = encodeURIComponent(message);
window.open(\https://wa.me/447776517899?text=\\, '_blank');
}

// Show cart and order section when items selected
function showOrderSection() {
const cartSummary = document.getElementById('cartSummary');
const orderSection = document.getElementById('order');
if (cartSummary) cartSummary.classList.remove('hidden');
if (orderSection) orderSection.style.display = 'block';
}

// Update cart display - ensure visibility
function updateCartDisplay() {
const cartItems = document.getElementById('cartItems');
const cartTotal = document.getElementById('cartTotal');
const floatingCartCount = document.getElementById('floatingCartCount');
const cartBadge = document.getElementById('cartBadge');

if (cart.length === 0) {
if (cartItems) {
cartItems.innerHTML = '<p class="empty-cart">No items selected yet. Tick items in the menu above.</p>';
}
if (cartTotal) cartTotal.classList.add('hidden');
if (floatingCartCount) floatingCartCount.classList.add('hidden');
} else {
// Show everything
showOrderSection();
if (floatingCartCount) floatingCartCount.classList.remove('hidden');
if (cartTotal) cartTotal.classList.remove('hidden');

// Render cart items
let cartHTML = '';
let totalQty = 0;
let total = 0;

cart.forEach(item => {
const itemTotal = item.price * item.quantity;
total += itemTotal;
totalQty += item.quantity;
cartHTML += \<div class="cart-item">
<div class="cart-item-name">? \</div>
<div class="cart-item-controls">
<button class="qty-btn" data-name="\" data-delta="-1">-</button>
<span class="qty-display">\</span>
<button class="qty-btn" data-name="\" data-delta="1">+</button>
</div>
<div class="cart-item-price">�\</div>
</div>\;
});

if (cartItems) cartItems.innerHTML = cartHTML;
if (cartTotal) cartTotal.innerHTML = \<strong>Total: �<span id="totalAmount">\</span></strong>\;
if (cartBadge) cartBadge.textContent = String(totalQty);
}
}
