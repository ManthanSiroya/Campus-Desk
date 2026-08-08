const emailForm = document.getElementById('email-form');
const otpForm = document.getElementById('otp-form');
const emailInput = document.getElementById('email');
const otpInput = document.getElementById('otp');
const emailError = document.getElementById('email-error');
const otpError = document.getElementById('otp-error');
const requestBtn = document.getElementById('request-btn');
const verifyBtn = document.getElementById('verify-btn');
const formSubtitle = document.getElementById('form-subtitle');
const resendBtn = document.getElementById('resend-btn');
const timerText = document.getElementById('timer-text');
const timeLeftSpan = document.getElementById('time-left');

const API_URL = 'http://localhost:5000/api/auth';
let countdownInterval;
let currentUserName = '';
let currentUserEmail = '';

emailForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const nameElement = document.getElementById('user-name');
  const emailElement = document.getElementById('email');

  if (!nameElement || !emailElement) {
    console.error('[System Error]: Missing input fields in the HTML.');
    return;
  }

  currentUserName = nameElement.value.trim();
  currentUserEmail = emailElement.value.trim();

  if (!currentUserName || !currentUserEmail) {
    emailError.innerText = 'Please enter both your name and email.';
    emailError.classList.remove('hidden');
    return;
  }

  emailError.classList.add('hidden');
  requestBtn.disabled = true;
  requestBtn.innerText = 'Sending...';

  try {
    const response = await fetch(`${API_URL}/request-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: currentUserName, email: currentUserEmail })
    });

    let data;
    try {
      data = await response.json();
    } catch (e) {
      // If JSON parsing fails, it's a System Error (e.g. 502 Bad Gateway HTML page)
      throw new Error('SYSTEM_ERROR: Invalid JSON response from server');
    }

    if (!response.ok) {
      // Backend returned a proper JSON error response (User Error)
      const err = new Error(data.error || 'Failed to send OTP');
      err.isUserError = true;
      throw err;
    }

    emailForm.classList.add('hidden');
    otpForm.classList.remove('hidden');
    formSubtitle.innerText = `We sent a code to ${currentUserEmail}`;
    startCooldown();

  } catch (error) {
    if (error.isUserError) {
      // Show User Errors in the UI
      emailError.innerText = error.message;
      emailError.classList.remove('hidden');
    } else {
      // Hide System Errors from the UI and log them to the console
      console.error('[System Error]:', error);
    }
  } finally {
    requestBtn.disabled = false;
    requestBtn.innerText = 'Request OTP';
  }
});

// FIX: Combined into a single, clean OTP form listener
otpForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const otpValue = otpInput.value.trim();

  otpError.classList.add('hidden');
  verifyBtn.disabled = true;
  verifyBtn.innerText = 'Verifying...';

  try {
    const response = await fetch(`${API_URL}/verify-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: currentUserEmail, otp: otpValue })
    });

    let data;
    try {
      data = await response.json();
    } catch (e) {
      throw new Error('SYSTEM_ERROR: Invalid JSON response from server');
    }

    if (!response.ok) {
      const err = new Error(data.error || 'Invalid OTP');
      err.isUserError = true;
      throw err;
    }

    localStorage.setItem('campusDeskToken', data.token);
    localStorage.setItem('campusDeskRole', data.user.role);
    
    if (data.user.role === 'admin') {
      window.location.href = 'admin.html';
    } else {
      window.location.href = 'resources.html';
    }

  } catch (error) {
    if (error.isUserError) {
      otpError.innerText = error.message;
      otpError.classList.remove('hidden');
    } else {
      console.error('[System Error]:', error);
    }
  } finally {
    verifyBtn.disabled = false;
    verifyBtn.innerText = 'Login';
  }
});

function startCooldown() {
  let timeLeft = 60;
  resendBtn.disabled = true;
  timerText.classList.remove('hidden');
  timeLeftSpan.innerText = timeLeft;

  countdownInterval = setInterval(() => {
    timeLeft--;
    timeLeftSpan.innerText = timeLeft;

    if (timeLeft <= 0) {
      clearInterval(countdownInterval);
      resendBtn.disabled = false;
      timerText.classList.add('hidden');
    }
  }, 1000);
}

resendBtn.addEventListener('click', () => {
  emailForm.dispatchEvent(new Event('submit'));
});