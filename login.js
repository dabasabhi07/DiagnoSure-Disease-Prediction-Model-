document.addEventListener('DOMContentLoaded', () => {
  const sendSmsBtn = document.getElementById('send-sms-otp');
  const gmailBtn = document.getElementById('gmail-otp');
  const otpSection = document.getElementById('otp-section');
  const otpInput = document.getElementById('otp-input');
  const verifyOtpBtn = document.getElementById('verify-otp');

  let lastMethod = null; // "sms" or "gmail"
  let currentUserPhoneOrEmail = null; // track for backend verification

  // Show OTP section
  function showOtpSection() {
    otpSection.classList.remove('hidden');
    otpInput.value = '';
  }

  // ----------------------------
  // SEND OTP TO BACKEND
  // ----------------------------
  sendSmsBtn.addEventListener('click', async () => {
    const phone = document.getElementById('phone').value.trim();
    if (!phone) { alert('Enter a phone number'); return; }

    lastMethod = 'sms';
    currentUserPhoneOrEmail = phone;

    try {
      const res = await fetch('http://127.0.0.1:5000/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ method: 'sms', phone })
      });

      const data = await res.json();
      if (data.success) {
        alert('OTP sent via SMS!');
        showOtpSection();
      } else {
        alert('Failed to send OTP: ' + data.message);
      }
    } catch (err) {
      alert('Error sending OTP: ' + err.message);
    }
  });

  gmailBtn.addEventListener('click', async () => {
    const email = document.getElementById('gmail').value.trim();
    if (!email) { alert('Enter an email'); return; }

    lastMethod = 'gmail';
    currentUserPhoneOrEmail = email;

    try {
      const res = await fetch('http://127.0.0.1:5000/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ method: 'gmail', email })
      });

      const data = await res.json();
      if (data.success) {
        alert('OTP sent via Gmail!');
        showOtpSection();
      } else {
        alert('Failed to send OTP: ' + data.message);
      }
    } catch (err) {
      alert('Error sending OTP: ' + err.message);
    }
  });

  // ----------------------------
  // VERIFY OTP WITH BACKEND
  // ----------------------------
  verifyOtpBtn.addEventListener('click', async () => {
    const enteredOtp = otpInput.value.trim();
    if (!enteredOtp) { alert('Enter OTP'); return; }

    try {
      const res = await fetch('http://127.0.0.1:5000/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          method: lastMethod,
          contact: currentUserPhoneOrEmail,
          otp: enteredOtp
        })
      });

      const data = await res.json();
      if (data.success) {
        // Mark user as authenticated
        localStorage.setItem('diagnosure_user_authenticated', 'true');
        localStorage.setItem('diagnosure_user_id', data.user_id);
        alert('OTP verified! Redirecting to profile...');
        window.location.href = 'profile.html';
      } else {
        alert('Incorrect OTP. Try again.');
      }
    } catch (err) {
      alert('Error verifying OTP: ' + err.message);
    }
  });
});
