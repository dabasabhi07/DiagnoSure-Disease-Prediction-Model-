// handle profile form save into MongoDB via backend and redirect to chat
document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('profile-form');
  const skipBtn = document.getElementById('skip');
  const toChat = document.getElementById('to-chat');

  // If not authenticated, warn user (still allow guest)
  if (!localStorage.getItem('diagnosure_user_authenticated')) {
    // optional: allow guest
    // console.log('Not authenticated — guest mode');
  }

  // ------------------------------
  // FORM SUBMISSION → SAVE PROFILE
  // ------------------------------
  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const profile = {
      name: document.getElementById('name').value.trim(),
      age: Number(document.getElementById('age').value),
      gender: document.getElementById('gender').value,
      height: Number(document.getElementById('height').value) || null,
      weight: Number(document.getElementById('weight').value) || null,
      conditions: document.getElementById('conditions').value
        .split(',')
        .map(s => s.trim())
        .filter(Boolean),
      allergies: document.getElementById('allergies').value
        .split(',')
        .map(s => s.trim())
        .filter(Boolean)
    };

    try {
      const res = await fetch('http://127.0.0.1:5000/save_profile', {  // 🔹 backend endpoint
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profile)
      });

      const data = await res.json();

      if (res.ok && data.success) {
        alert('Profile saved to server. Redirecting to chat...');
        // Optional: still keep a local copy
        localStorage.setItem('diagnosure_profile', JSON.stringify(profile));
        window.location.href = 'chat.html';
      } else {
        alert('Error saving profile: ' + (data.error || 'Unknown error'));
      }
    } catch (err) {
      alert('Could not reach server: ' + err.message);
    }
  });

  // ------------------------------
  // SKIP PROFILE BUTTON
  // ------------------------------
  skipBtn.addEventListener('click', () => {
    if (confirm('Skip profile? You can fill it later.')) {
      window.location.href = 'chat.html';
    }
  });

  // ------------------------------
  // GO TO CHAT BUTTON
  // ------------------------------
  toChat.addEventListener('click', () => {
    window.location.href = 'chat.html';
  });
});
