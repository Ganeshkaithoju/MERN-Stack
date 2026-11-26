/* ============================================================
   script.js  —  FreshWash Laundry Services
   Written in a beginner-friendly way with clear comments.

   What this file does:
   1. Initialises AOS (scroll animations)
   2. Builds the services list from a data array
   3. Handles Add / Remove item (cart logic)
   4. Handles Book Now (form validation + EmailJS)
   5. Mobile menu toggle
   6. Newsletter subscribe
   ============================================================ */


/* ============================================================
   1. START AOS (Animate On Scroll) library
   ============================================================ */
AOS.init({
  once: true,
  offset: 80,
});

const emailJsEnvUrl = new URL('.env', document.currentScript.src);
let emailJsConfigPromise;

function loadEmailJsConfig() {
  if (!emailJsConfigPromise) {
    emailJsConfigPromise = fetch(emailJsEnvUrl)
      .then(function(response) {
        if (!response.ok) {
          throw new Error('Unable to load EmailJS configuration from .env');
        }
        return response.text();
      })
      .then(function(envText) {
        const config = {};

        envText.split(/\r?\n/).forEach(function(line) {
          const separatorIndex = line.indexOf('=');
          if (separatorIndex === -1) return;

          const key = line.slice(0, separatorIndex).trim();
          const value = line.slice(separatorIndex + 1).trim().replace(/^(['"])(.*)\1$/, '$2');
          config[key] = value;
        });

        const serviceId = config.EMAILJS_SERVICE_ID;
        const templateId = config.EMAILJS_TEMPLATE_ID;
        const publicKey = config.EMAILJS_PUBLIC_KEY;

        if (!serviceId || !templateId || !publicKey) {
          throw new Error('EmailJS configuration is incomplete in .env');
        }

        emailjs.init(publicKey);
        return { serviceId, templateId };
      });
  }

  return emailJsConfigPromise;
}


/* ============================================================
   2. SERVICES DATA
   ============================================================ */
const allServices = [
  { id: 1, icon: 'fa-solid fa-vest',               name: 'Dry Cleaning',           price: 200  },
  { id: 2, icon: 'fa-solid fa-hands-holding',       name: 'Wash & Fold',            price: 100  },
  { id: 3, icon: 'fa-solid fa-temperature-high',    name: 'Ironing',                price: 30   },
  { id: 4, icon: 'fa-solid fa-spray-can-sparkles',  name: 'Stain Removal',          price: 500  },
  { id: 5, icon: 'fa-solid fa-hat-cowboy',          name: 'Leather & Suede Cleaning', price: 999 },
  { id: 6, icon: 'fa-solid fa-person-dress',        name: 'Wedding Dress Cleaning', price: 2800 },
];


/* ============================================================
   3. CART STATE
   ============================================================ */
let cartItems = [];   /* starts empty */


/* ============================================================
   4. BUILD THE SERVICES LIST IN HTML
   ============================================================ */
function buildServicesList() {

  const servicesList = document.getElementById('servicesList');
  servicesList.innerHTML = '';

  allServices.forEach(function(service) {

    const isInCart = cartItems.some(function(item) { return item.id === service.id; });

    const row = document.createElement('div');
    row.classList.add('service-row');
    row.id = 'service-row-' + service.id;

    row.innerHTML = `
      <div class="service-info">
        <i class="${service.icon} service-icon"></i>
        <span class="service-name">${service.name}</span>
        <span class="service-price">₹${service.price.toFixed(2)}</span>
      </div>
      ${isInCart
        ? `<button class="btn-remove-item" onclick="removeFromCart(${service.id})">
             Remove Item <i class="fa-solid fa-circle-minus"></i>
           </button>`
        : `<button class="btn-add-item" onclick="addToCart(${service.id})">
             Add Item <i class="fa-solid fa-circle-plus"></i>
           </button>`
      }
    `;

    servicesList.appendChild(row);
  });
}


/* ============================================================
   5. ADD ITEM TO CART
   ============================================================ */
function addToCart(serviceId) {
  const service = allServices.find(function(s) { return s.id === serviceId; });
  cartItems.push(service);
  buildServicesList();
  updateCartDisplay();
}


/* ============================================================
   6. REMOVE ITEM FROM CART
   ============================================================ */
function removeFromCart(serviceId) {
  cartItems = cartItems.filter(function(item) { return item.id !== serviceId; });
  buildServicesList();
  updateCartDisplay();
}


/* ============================================================
   7. UPDATE CART DISPLAY
   ============================================================ */
function updateCartDisplay() {
  const cartItemsList = document.getElementById('cartItemsList');
  const totalAmountEl = document.getElementById('totalAmount');

  cartItemsList.innerHTML = '';

  if (cartItems.length === 0) {
    cartItemsList.innerHTML = `
      <div class="cart-empty-state" id="cartEmptyState">
        <i class="fa-solid fa-circle-info cart-empty-icon"></i>
        <p class="cart-empty-text">No Items Added</p>
        <p class="cart-empty-hint">Add items to the cart from the services bar</p>
      </div>
    `;
    totalAmountEl.textContent = '₹ 0';

  } else {
    cartItems.forEach(function(item, index) {
      const row = document.createElement('div');
      row.classList.add('cart-row');
      row.innerHTML = `
        <span class="cart-row-serial">${index + 1}</span>
        <span class="cart-row-name">${item.name}</span>
        <span class="cart-row-price">₹${item.price.toFixed(2)}</span>
      `;
      cartItemsList.appendChild(row);
    });

    const total = cartItems.reduce(function(sum, item) { return sum + item.price; }, 0);
    totalAmountEl.textContent = '₹ ' + total.toFixed(2);
  }
}


/* ============================================================
   8. HANDLE BOOK NOW BUTTON
   ============================================================ */
async function handleBookNow() {

  /* Get form values */
  const fullName    = document.getElementById('fullName').value.trim();
  const emailId     = document.getElementById('emailId').value.trim();
  const phoneNumber = document.getElementById('phoneNumber').value.trim();

  /* --- Validation checks --- */
  if (cartItems.length === 0) {
    showFormMessage('error', 'fa-circle-exclamation', 'Add the items to the cart to book');
    return;
  }

  if (!fullName || !emailId || !phoneNumber) {
    showFormMessage('error', 'fa-circle-exclamation', 'Please fill in all the fields');
    return;
  }

  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailPattern.test(emailId)) {
    showFormMessage('error', 'fa-circle-exclamation', 'Please enter a valid email address');
    return;
  }

  /* --- Prepare order summary --- */
  const orderSummary = cartItems.map(function(item, i) {
    return (i + 1) + '. ' + item.name + ' — ₹' + item.price.toFixed(2);
  }).join('\n');

  const totalAmount = cartItems.reduce(function(sum, item) { return sum + item.price; }, 0);

  /* --- Show loading state on button --- */
  const bookBtn = document.getElementById('bookNowBtn');
  bookBtn.textContent = 'Sending...';
  bookBtn.disabled = true;

  /* --- Send email via EmailJS --- */
  try {
    const config = await loadEmailJsConfig();
    await emailjs.send(config.serviceId, config.templateId, {
      customer_name:  fullName,
      customer_email: emailId,
      customer_phone: phoneNumber,
      order_items:    orderSummary,
      total_amount:   '₹ ' + totalAmount.toFixed(2),
    });

    /* SUCCESS */
    showFormMessage('success', 'fa-circle-check', 'Email Has Been Sent Successfully');
    bookBtn.innerHTML = 'Book now';
    bookBtn.disabled = false;
    clearFormAfterBooking();

  } catch (error) {
    /* FAILED */
    showFormMessage('error', 'fa-circle-exclamation', 'Failed to send email. Try again.');
    bookBtn.innerHTML = 'Book now';
    bookBtn.disabled = false;
    console.error('EmailJS error:', error);
  }

} /* <-- THIS closing brace ends handleBookNow() */


/* ============================================================
   9. HELPER: Show a message below the Book Now button
   ============================================================ */
function showFormMessage(type, icon, text) {
  const msgEl = document.getElementById('formMessage');

  msgEl.className = 'form-message';
  msgEl.classList.add(type);
  msgEl.innerHTML = `<i class="fa-solid ${icon}"></i> ${text}`;

  setTimeout(function() {
    msgEl.className = 'form-message';
    msgEl.innerHTML = '';
  }, 4000);
}


/* ============================================================
   10. HELPER: Clear form + cart after successful booking
   ============================================================ */
function clearFormAfterBooking() {
  document.getElementById('fullName').value    = '';
  document.getElementById('emailId').value     = '';
  document.getElementById('phoneNumber').value = '';

  cartItems = [];
  buildServicesList();
  updateCartDisplay();
}


/* ============================================================
   11. MOBILE MENU TOGGLE
   ============================================================ */
function toggleMobileMenu() {
  const navLinks = document.getElementById('navLinks');
  navLinks.classList.toggle('mobile-open');
}

document.querySelectorAll('.nav-link').forEach(function(link) {
  link.addEventListener('click', function() {
    document.getElementById('navLinks').classList.remove('mobile-open');
  });
});


/* ============================================================
   12. NEWSLETTER SUBSCRIBE
   ============================================================ */
function handleSubscribe() {
  const name  = document.getElementById('newsletterName').value.trim();
  const email = document.getElementById('newsletterEmail').value.trim();

  if (!name || !email) {
    alert('Please fill in your name and email to subscribe.');
    return;
  }

  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailPattern.test(email)) {
    alert('Please enter a valid email address.');
    return;
  }

  document.getElementById('newsletterName').value  = '';
  document.getElementById('newsletterEmail').value = '';

  alert('Thank you, ' + name + '! You have subscribed successfully. 🎉');
}


/* ============================================================
   13. NAVBAR: Add shadow when page is scrolled
   ============================================================ */
window.addEventListener('scroll', function() {
  const navbar = document.getElementById('navbar');
  if (window.scrollY > 10) {
    navbar.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.12)';
  } else {
    navbar.style.boxShadow = '0 2px 12px rgba(0, 0, 0, 0.08)';
  }
});


/* ============================================================
   14. INITIALISE ON PAGE LOAD
   ============================================================ */
document.addEventListener('DOMContentLoaded', function() {
  buildServicesList();
  updateCartDisplay();
});