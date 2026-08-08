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
let userEmail = '';
let countdownInterval;

emailForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  userEmail = emailInput.value.trim();
  
  emailError.classList.add('hidden');
  requestBtn.disabled = true;
  requestBtn.innerText = 'Sending...';

  try {
    const response = await fetch(`${API_URL}/request-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: userEmail })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to send OTP');
    }

    emailForm.classList.add('hidden');
    otpForm.classList.remove('hidden');
    formSubtitle.innerText = `We sent a code to ${userEmail}`;
    startCooldown();

  } catch (error) {
    emailError.innerText = error.message;
    emailError.classList.remove('hidden');
  } finally {
    requestBtn.disabled = false;
    requestBtn.innerText = 'Request OTP';
  }
});

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
      body: JSON.stringify({ email: userEmail, otp: otpValue })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Invalid OTP');
    }

    localStorage.setItem('campusDeskToken', data.token);
    localStorage.setItem('campusDeskRole', data.user.role);
    
    if (data.user.role === 'admin') {
      window.location.href = 'admin.html';
    } else {
      window.location.href = 'resources.html';
    }

  } catch (error) {
    otpError.innerText = error.message;
    otpError.classList.remove('hidden');
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