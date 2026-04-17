// -------------------------------------------
// CHAT FRONTEND: Collect Symptoms + Call Backend
// -------------------------------------------
document.addEventListener('DOMContentLoaded', () => {

  // UI elements
  const profileNameEl = document.getElementById('user-name');
  const userMetaEl = document.getElementById('user-meta');
  const symptomSelect = document.getElementById('symptom-select');
  const symptomFree = document.getElementById('symptom-free');
  const sendBtn = document.getElementById('send-symptoms');
  const clearBtn = document.getElementById('clear-symptoms');
  const chatLog = document.getElementById('chat-log');
  const logoutBtn = document.getElementById('logout');

  // Load profile
  const profile = JSON.parse(localStorage.getItem('diagnosure_profile') || '{}');
  if (profile?.name) {
    profileNameEl.textContent = `Hi, ${profile.name.split(' ')[0]}`;
    userMetaEl.textContent = `${profile.age || ''} • ${profile.gender || ''}`;
  }

  // UI Message Helpers
  function appendUserMessage(text) {
    const d = document.createElement('div');
    d.className = 'user-msg';
    d.textContent = text;
    chatLog.appendChild(d);
    chatLog.scrollTop = chatLog.scrollHeight;
  }

  function appendBotMessage(text) {
    const d = document.createElement('div');
    d.className = 'bot-msg';
    d.textContent = text;
    chatLog.appendChild(d);
    chatLog.scrollTop = chatLog.scrollHeight;
  }

  // Send button → send symptoms to backend
  sendBtn.addEventListener('click', async () => {
    const selected = Array.from(symptomSelect.selectedOptions).map(o => o.value);
    const typed = symptomFree.value.split(',').map(s => s.trim()).filter(Boolean);
    const symptoms = [...new Set([...selected, ...typed])];

    if (!symptoms.length) return alert('Please select or type at least one symptom.');

    appendUserMessage('Symptoms: ' + symptoms.join(', '));
    appendBotMessage('Sending to backend...');

    const payload = {
      symptoms,
      age: profile.age || null,
      gender: profile.gender || null
    };

    try {
      const res = await fetch('http://127.0.0.1:5000/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!res.ok) throw new Error('Backend not reachable');

      const data = await res.json();

      // Remove temporary "sending..." message
      const sending = chatLog.querySelector('.bot-msg:last-child');
      if (sending) sending.remove();

      // Display prediction
     

      // Display detailed info card
      if (data.details) {

        const d = data.details;
        const detailsHTML = `
          <div class="result-card">
            <h3>🩺 Diagnosis Suggestion</h3>
            <p><b>Matched Symptom Count:</b> ${d.matched_symptom_count}</p>
            <p><b>Received Symptoms:</b> ${d.received_symptoms.join(', ')}</p>
            <p><b>Possible Conditions:</b></p>
            <ul>${d.possible_conditions.map(c => `<li>${c}</li>`).join('')}</ul>
          </div>
        `;

        const container = document.createElement('div');
        container.className = 'bot-msg';
        container.innerHTML = detailsHTML;

        chatLog.appendChild(container);
        chatLog.scrollTop = chatLog.scrollHeight;
      }

    } catch (err) {
      appendBotMessage('Could not reach backend: ' + err.message);
      appendBotMessage('Tip: Start Flask backend and ensure CORS is enabled.');
    }
  });

  // Clear button
  clearBtn.addEventListener('click', () => {
    symptomFree.value = '';
    Array.from(symptomSelect.options).forEach(opt => opt.selected = false);
  });

  // Logout button
  logoutBtn.addEventListener('click', () => {
    localStorage.removeItem('diagnosure_user_authenticated');
    alert('Logged out. Redirecting...');
    window.location.href = 'index.html';
  });

  // Quick actions
  document.getElementById('btn-health-tips').addEventListener('click', () => {
    appendBotMessage('General health tip: Stay hydrated, rest, and seek immediate care for severe symptoms');
  });

  document.getElementById('btn-emergency').addEventListener('click', () => {
    appendBotMessage('If you are experiencing severe symptoms call emergency services immediately.');
  });

});


// -----------------------------------------------------
// AUTOLOAD SYMPTOMS FROM BACKEND AND BUILD ACCORDION UI
// -----------------------------------------------------
document.addEventListener('DOMContentLoaded', () => {

  const accordionContainer = document.getElementById('symptom-accordion');
  const searchBox = document.getElementById('symptom-search');
  const hiddenSelect = document.getElementById('symptom-select');

  async function loadSymptoms() {
    try {
      const res = await fetch('http://127.0.0.1:5000/symptoms');
      const data = await res.json();
      const symptoms = data.symptoms || [];

      // --------------------------
      // AUTO-CATEGORIZE SYMPTOMS
      // --------------------------
      const categories = {
        "General": [],
        "Respiratory": [],
        "Cardiovascular": [],
        "Digestive": [],
        "Neurological": [],
        "Musculoskeletal": [],
        "Dermatological": [],
        "Urinary": [],
        "ENT": [],
        "Mental Health": [],
        "Other": []
      };

      const keywordMap = {
        "cough": "Respiratory", "breath": "Respiratory", "throat": "Respiratory",
        "chest": "Cardiovascular", "heart": "Cardiovascular", "pulse": "Cardiovascular",
        "abdominal": "Digestive", "stomach": "Digestive", "vomit": "Digestive",
        "nausea": "Digestive", "diarrhea": "Digestive",
        "pain": "Musculoskeletal", "joint": "Musculoskeletal", "back": "Musculoskeletal",
        "rash": "Dermatological", "itch": "Dermatological", "skin": "Dermatological",
        "urine": "Urinary", "urination": "Urinary",
        "ear": "ENT", "nose": "ENT", "hearing": "ENT",
        "depress": "Mental Health", "anxiety": "Mental Health", "insomnia": "Mental Health",
        "fever": "General", "headache": "General", "fatigue": "General", "weakness": "General",
        "confusion": "Neurological", "memory": "Neurological", "seizure": "Neurological",
        "tremor": "Neurological"
      };

      symptoms.forEach(raw => {
        const name = raw.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
        const lower = name.toLowerCase();
        const key = Object.keys(keywordMap).find(k => lower.includes(k));

        if (key) categories[keywordMap[key]].push(name);
        else categories["Other"].push(name);
      });

      // --------------------------------
      // RENDER ACCORDION GROUPS IN UI
      // --------------------------------
      for (const [category, list] of Object.entries(categories)) {

        if (!list.length) continue;

        const item = document.createElement('div');
        item.className = 'accordion-item';

        const header = document.createElement('div');
        header.className = 'accordion-header';
        header.textContent = `${category} (${list.length})`;

        const body = document.createElement('div');
        body.className = 'accordion-body';

        list.sort().forEach(sym => {
          const rawValue = sym.toLowerCase().replace(/ /g, '_');

          const label = document.createElement('label');
          label.className = 'symptom-checkbox';

          const checkbox = document.createElement('input');
          checkbox.type = 'checkbox';
          checkbox.value = rawValue;

          checkbox.addEventListener('change', e => {
            if (e.target.checked) {
              hiddenSelect.add(new Option(sym, rawValue, true, true));
            } else {
              Array.from(hiddenSelect.options)
                .filter(o => o.value === rawValue)
                .forEach(o => o.remove());
            }
          });

          label.appendChild(checkbox);
          label.append(' ' + sym);
          body.appendChild(label);
        });

        header.addEventListener('click', () => {
          body.classList.toggle('active');
        });

        item.appendChild(header);
        item.appendChild(body);
        accordionContainer.appendChild(item);
      }

      // SEARCH FILTER
      searchBox.addEventListener('input', e => {
        const term = e.target.value.toLowerCase();
        document.querySelectorAll('.symptom-checkbox').forEach(cb => {
          cb.style.display = cb.textContent.toLowerCase().includes(term) ? 'block' : 'none';
        });
      });

    } catch (err) {
      console.error('Error loading symptoms:', err);
    }
  }

  loadSymptoms();
});
