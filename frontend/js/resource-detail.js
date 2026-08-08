const token = localStorage.getItem('campusDeskToken');
if (!token) window.location.href = 'login.html';

const urlParams = new URLSearchParams(window.location.search);
const resourceId = urlParams.get('id');
if (!resourceId) window.location.href = 'resources.html';
const resourceName = urlParams.get('name') || 'Resource Details';
document.getElementById('resource-name').innerText = resourceName;

const API_BASE = 'http://localhost:5000/api';

const dateSelect = document.getElementById('date-select');
const timelineGrid = document.getElementById('timeline-grid');
const loadingTimeline = document.getElementById('loading-timeline');
const bookingForm = document.getElementById('booking-form');
const startTimeInput = document.getElementById('start-time');
const endTimeInput = document.getElementById('end-time');
const purposeInput = document.getElementById('purpose');
const errorDisplay = document.getElementById('booking-error');
const successDisplay = document.getElementById('booking-success');
const submitBtn = document.getElementById('submit-booking-btn');

const today = new Date().toISOString().split('T')[0];
dateSelect.value = today;

async function fetchTimeline() {
  const selectedDate = dateSelect.value;
  if (!selectedDate) return;

  timelineGrid.innerHTML = '';
  loadingTimeline.classList.remove('hidden');
  errorDisplay.classList.add('hidden');
  successDisplay.classList.add('hidden');

  try {
    const response = await fetch(`${API_BASE}/resources/${resourceId}/bookings?date=${selectedDate}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await response.json();

    if (!response.ok) throw new Error(data.error || 'Failed to load timeline');

    renderTimelineGrid(data.data);
  } catch (error) {
    timelineGrid.innerHTML = `<p class="text-error">${error.message}</p>`;
  } finally {
    loadingTimeline.classList.add('hidden');
  }
}

function renderTimelineGrid(bookings) {
  const startHour = 8;
  const endHour = 22;

  for (let i = startHour; i < endHour; i++) {
    createSlot(i, 0, bookings);
    createSlot(i, 30, bookings);
  }
}

function createSlot(hour, minute, bookings) {
  const slotDate = new Date(dateSelect.value);
  slotDate.setHours(hour, minute, 0, 0);

  const isBooked = bookings.some(booking => {
    const bStart = new Date(booking.startTime);
    const bEnd = new Date(booking.endTime);
    return slotDate >= bStart && slotDate < bEnd;
  });

  const slotDiv = document.createElement('div');
  const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
  
  slotDiv.className = `time-slot ${isBooked ? 'booked' : 'free'}`;
  slotDiv.innerText = timeString;

  if (!isBooked) {
    slotDiv.addEventListener('click', () => {
      startTimeInput.value = timeString;
      const endHour = (hour + 1).toString().padStart(2, '0');
      endTimeInput.value = `${endHour}:${minute.toString().padStart(2, '0')}`;
    });
  }

  timelineGrid.appendChild(slotDiv);
}

dateSelect.addEventListener('change', fetchTimeline);

bookingForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  errorDisplay.classList.add('hidden');
  successDisplay.classList.add('hidden');
  
  submitBtn.disabled = true;
  submitBtn.innerText = 'Confirming...';

  const selectedDate = dateSelect.value;
  const startDateTime = new Date(`${selectedDate}T${startTimeInput.value}:00`).toISOString();
  const endDateTime = new Date(`${selectedDate}T${endTimeInput.value}:00`).toISOString();

  try {
    const response = await fetch(`${API_BASE}/bookings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        resourceId,
        startTime: startDateTime,
        endTime: endDateTime,
        purpose: purposeInput.value.trim()
      })
    });

    const data = await response.json();

    if (!response.ok) {
      if (response.status === 409) {
        throw new Error(data.error); 
      }
      throw new Error(data.error || 'Failed to create booking.');
    }

    successDisplay.innerText = 'Booking confirmed!';
    successDisplay.classList.remove('hidden');
    bookingForm.reset();
    fetchTimeline();

  } catch (error) {
    errorDisplay.innerText = error.message;
    errorDisplay.classList.remove('hidden');
  } finally {
    submitBtn.disabled = false;
    submitBtn.innerText = 'Confirm Booking';
  }
});

fetchTimeline();