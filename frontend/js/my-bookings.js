const token = localStorage.getItem('campusDeskToken');
if (!token) window.location.href = 'login.html';

const API_BASE = 'http://localhost:5000/api';
let currentStatus = 'confirmed';

const bookingsList = document.getElementById('bookings-list');
const loadingState = document.getElementById('loading-state');
const errorState = document.getElementById('error-state');
const tabButtons = document.querySelectorAll('.tab-btn');

tabButtons.forEach(btn => {
  btn.addEventListener('click', (e) => {
    tabButtons.forEach(b => b.classList.remove('active'));
    e.target.classList.add('active');
    
    currentStatus = e.target.getAttribute('data-status');
    fetchMyBookings();
  });
});

async function fetchMyBookings() {
  bookingsList.innerHTML = '';
  loadingState.classList.remove('hidden');
  errorState.classList.add('hidden');

  try {
    const response = await fetch(`${API_BASE}/bookings/me?status=${currentStatus}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await response.json();

    if (!response.ok) throw new Error(data.error || 'Failed to load bookings.');

    renderBookings(data.data);
  } catch (error) {
    errorState.innerText = error.message;
    errorState.classList.remove('hidden');
  } finally {
    loadingState.classList.add('hidden');
  }
}

function renderBookings(bookings) {
  if (bookings.length === 0) {
    bookingsList.innerHTML = '<p class="text-center text-muted">No bookings found in this category.</p>';
    return;
  }

  bookings.forEach(booking => {
    const start = new Date(booking.startTime).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' });
    const end = new Date(booking.endTime).toLocaleTimeString([], { timeStyle: 'short' });

    const card = document.createElement('div');
    card.className = 'booking-card';
    card.id = `booking-${booking._id}`;
    
    const canCancel = currentStatus === 'confirmed' && new Date(booking.startTime) > new Date();

    card.innerHTML = `
      <div class="booking-info">
        <h3>${booking.resourceId.name}</h3>
        <p><strong>Time:</strong> ${start} - ${end}</p>
        <p><strong>Purpose:</strong> ${booking.purpose}</p>
        <span class="status-badge status-${booking.status}">${booking.status}</span>
      </div>
      ${canCancel ? `<button class="cancel-btn" onclick="cancelBooking('${booking._id}')">Cancel</button>` : ''}
    `;
    
    bookingsList.appendChild(card);
  });
}

async function cancelBooking(bookingId) {
  const card = document.getElementById(`booking-${bookingId}`);
  const originalHTML = card.innerHTML;
  
  card.classList.add('opacity-50');
  card.innerHTML = '<div class="p-4">Cancelling...</div>';

  try {
    const response = await fetch(`${API_BASE}/bookings/${bookingId}/cancel`, {
      method: 'PATCH',
      headers: { 'Authorization': `Bearer ${token}` }
    });

    const data = await response.json();

    if (!response.ok) throw new Error(data.error || 'Failed to cancel.');

    card.remove(); 
    
    if (bookingsList.children.length === 0) {
      bookingsList.innerHTML = '<p class="text-center text-muted">No bookings found in this category.</p>';
    }

  } catch (error) {
    alert(`Could not cancel: ${error.message}`);
    card.classList.remove('opacity-50');
    card.innerHTML = originalHTML; 
  }
}

fetchMyBookings();