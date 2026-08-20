const token = localStorage.getItem('campusDeskToken');
const role = localStorage.getItem('campusDeskRole');

if (!token || role !== 'admin') {
  window.location.href = 'login.html';
}

const IS_LOCAL = window.location.hostname === '127.0.0.1' || window.location.hostname === 'localhost';
const API_BASE = IS_LOCAL ? 'http://localhost:5000/api' : 'https://campus-desk.onrender.com/api';

const addResForm = document.getElementById('add-resource-form');
const resMsg = document.getElementById('res-msg');
const addResBtn = document.getElementById('add-res-btn');

addResForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  resMsg.classList.add('hidden');
  addResBtn.disabled = true;
  addResBtn.innerText = 'Creating...';

  const newResource = {
    name: document.getElementById('res-name').value.trim(),
    location: document.getElementById('res-location').value.trim(),
    category: document.getElementById('res-category').value,
    openTime: document.getElementById('res-open').value,
    closeTime: document.getElementById('res-close').value,
    description: document.getElementById('res-desc').value.trim()
  };

  try {
    const response = await fetch(`${API_BASE}/resources`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(newResource)
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Failed to create resource');

    resMsg.innerText = 'Resource created successfully!';
    resMsg.classList.add('text-success');
    resMsg.classList.remove('text-error');
    resMsg.classList.remove('hidden');
    addResForm.reset();

  } catch (error) {
    resMsg.innerText = error.message;
    resMsg.classList.add('text-error');
    resMsg.classList.remove('text-success');
    resMsg.classList.remove('hidden');
  } finally {
    addResBtn.disabled = false;
    addResBtn.innerText = 'Create Resource';
  }
});

const bookingsBody = document.getElementById('bookings-body');
const filterDate = document.getElementById('filter-date');
const clearFilterBtn = document.getElementById('clear-filter-btn');

async function fetchSystemBookings(date = '') {
  bookingsBody.innerHTML = '<tr><td colspan="5" class="text-center">Loading...</td></tr>';
  
  try {
    let url = `${API_BASE}/bookings/admin/all`;
    if (date) url += `?date=${date}`;

    const response = await fetch(url, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    const data = await response.json();
    if (!response.ok) throw new Error(data.error);

    renderBookingsTable(data.data);
  } catch (error) {
    bookingsBody.innerHTML = `<tr><td colspan="5" class="text-center text-error">${error.message}</td></tr>`;
  }
}

function renderBookingsTable(bookings) {
  if (bookings.length === 0) {
    bookingsBody.innerHTML = '<tr><td colspan="5" class="text-center">No bookings found.</td></tr>';
    return;
  }

  bookingsBody.innerHTML = '';
  bookings.forEach(b => {
    const userStr = b.userId ? `${b.userId.name} <br> <span class="font-xs text-muted">${b.userId.name}</span>` : 'Unknown User';
    const resStr = b.resourceId ? b.resourceId.name : 'Deleted Resource';
    const start = new Date(b.startTime).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' });
    const end = new Date(b.endTime).toLocaleTimeString([], { timeStyle: 'short' });

    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${userStr}</td>
      <td>${resStr}</td>
      <td>${start}</td>
      <td>${end}</td>
      <td><span class="status-badge status-${b.status}">${b.status}</span></td>
    `;
    bookingsBody.appendChild(tr);
  });
}

filterDate.addEventListener('change', (e) => fetchSystemBookings(e.target.value));
clearFilterBtn.addEventListener('click', () => {
  filterDate.value = '';
  fetchSystemBookings();
});

document.getElementById('logout-btn').addEventListener('click', () => {
  localStorage.clear();
  window.location.href = 'login.html';
});

fetchSystemBookings();