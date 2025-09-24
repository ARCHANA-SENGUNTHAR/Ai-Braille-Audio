
const appRoot = document.getElementById('app');

const state = {
  route: 'splash', // splash | signup | home | camera | convert | result | braille | settings | help
  user: null,
  lastText: '',
  lastBraille: '',
  lastImageBlob: null,
  ocrLang: 'eng',
  ttsLang: 'auto',
  readSpeed: 0.95,
  screenReader: true
};

/* ========================
   SPA: Core render
   ======================== */
function render() {
  appRoot.innerHTML = '';
  const topbar = createTopbar();
  appRoot.appendChild(topbar);

  if (state.route === 'splash') renderSplash();
  else if (state.route === 'signup') renderSignup();
  else if (state.route === 'home') renderHome();
  else if (state.route === 'camera') renderCamera();
  else if (state.route === 'convert') renderConvert();
  else if (state.route === 'result') renderResult();
  else if (state.route === 'braille') renderBraille();
  else if (state.route === 'settings') renderSettings();
  else if (state.route === 'help') renderHelp();

  const nav = createBottomNav();
  appRoot.appendChild(nav);
}

/* -----------------------
   Topbar
   ----------------------- */
function createTopbar() {
  const box = document.createElement('div');
  box.className = 'topbar';

  const left = document.createElement('div');
  left.className = 'logo';
  left.innerHTML = `<div class="icon-circle">⣿</div><div><div class="brand">AI Braille</div><div class="small-muted">Inclusive Reader</div></div>`;
  box.appendChild(left);

  const right = document.createElement('div');
  if (state.user) right.innerHTML = `<div class="small-muted">Hi, ${state.user.name}</div>`;
  else right.innerHTML = `<button class="btn ghost" id="signupBtnTop">Sign Up</button>`;
  box.appendChild(right);

  setTimeout(() => {
    const su = document.getElementById('signupBtnTop');
    if (su) su.addEventListener('click', () => navigate('signup'));
  }, 0);

  return box;
}

/* -----------------------
   Bottom nav
   ----------------------- */
function createBottomNav() {
  const nav = document.createElement('div');
  nav.className = 'bottom-nav';

  const items = [
    { k: 'home', label: 'Home' },
    { k: 'camera', label: 'Camera' },
    { k: 'convert', label: 'Convert' },
    { k: 'braille', label: 'Braille' },
    { k: 'settings', label: 'Settings' }
  ];

  items.forEach(it => {
    const b = document.createElement('div');
    b.className = 'nav-btn' + (state.route === it.k ? ' active' : '');
    b.textContent = it.label;
    b.addEventListener('click', () => navigate(it.k));
    nav.appendChild(b);
  });

  return nav;
}

/* -----------------------
   Navigation helper
   ----------------------- */
function navigate(route) {
  state.route = route;
  render();
}

/* ========================
   Splash
   ======================== */
function renderSplash() {
  const c = document.createElement('div');
  c.className = 'card processing-screen';
  c.innerHTML = `
    <div class="loader"></div>
    <div style="text-align:center">
      <h2 style="margin:6px 0">Processing</h2>
      <p class="small-muted">Scanning document... Please wait.</p>
    </div>
  `;
  appRoot.appendChild(c);

  setTimeout(() => {
    const saved = localStorage.getItem('ai_braille_user');
    if (saved) {
      state.user = JSON.parse(saved);
      navigate('home');
    } else navigate('signup');
  }, 1100);
}

/* ========================
   Sign Up
   ======================== */
function renderSignup() {
  const box = document.createElement('div');
  box.className = 'card';
  box.innerHTML = `
    <h2>Sign Up</h2>
    <div class="form-group">
      <input id="su_name" class="input" placeholder="Enter name" />
      <input id="su_email" class="input" placeholder="Enter email" />
      <input id="su_pass" type="password" class="input" placeholder="Enter password" />
      <div style="display:flex;gap:8px">
        <button class="btn" id="su_btn">Sign Up</button>
        <button class="btn ghost" id="skip_btn">Skip</button>
      </div>
      <div class="small-muted" style="margin-top:8px">You can skip sign-up for demo mode.</div>
    </div>
  `;
  appRoot.appendChild(box);

  setTimeout(() => {
    document.getElementById('su_btn').addEventListener('click', () => {
      const name = document.getElementById('su_name').value.trim();
      const email = document.getElementById('su_email').value.trim();
      if (!name || !email) { alert('Enter name and email'); return; }
      const user = { name, email };
      localStorage.setItem('ai_braille_user', JSON.stringify(user));
      state.user = user;
      navigate('home');
    });
    document.getElementById('skip_btn').addEventListener('click', () => {
      state.user = { name: 'Guest' };
      navigate('home');
    });
  }, 0);
}

/* ========================
   Home
   ======================== */
function renderHome() {
  const box = document.createElement('div');
  box.className = 'card';
  box.innerHTML = `
    <h2>Welcome ${state.user ? state.user.name : ''}</h2>
    <p class="small-muted">Convert printed pages to spoken words & braille-like display.</p>
    <div class="cam-wrap" style="margin-top:12px">
      <div class="cam-circle">📷</div>
      <div class="small">Take a photo or upload a printed page</div>
      <div style="display:flex;gap:8px;margin-top:10px">
        <button class="btn" id="go_camera">Open Camera</button>
        <button class="btn ghost" id="go_upload">Upload Image</button>
      </div>
    </div>
  `;
  appRoot.appendChild(box);

  setTimeout(() => {
    document.getElementById('go_camera').addEventListener('click', () => navigate('camera'));
    document.getElementById('go_upload').addEventListener('click', () => navigate('convert'));
  }, 0);
}

/* ========================
   Camera
   ======================== */
function renderCamera() {
  const box = document.createElement('div');
  box.className = 'card';
  box.innerHTML = `
    <h3>Camera</h3>
    <p class="small-muted">Align page inside the frame and capture.</p>
    <div class="preview-canvas" id="cam_container">
      <video id="cam_video" autoplay playsinline style="width:100%;height:100%;object-fit:cover"></video>
    </div>
    <div style="display:flex;gap:8px;margin-top:10px">
      <button class="btn" id="capture_btn">Capture</button>
      <button class="btn ghost" id="cam_back">Back</button>
    </div>
  `;
  appRoot.appendChild(box);

  setTimeout(async () => {
    const vid = document.getElementById('cam_video');
    const back = document.getElementById('cam_back');
    const cap = document.getElementById('capture_btn');

    back.addEventListener('click', () => { stopCamera(vid); navigate('home'); });

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' }, audio: false });
      vid.srcObject = stream;
      vid.play();
      vid._stream = stream;
    } catch (e) {
      alert('Camera access denied or not available. You can upload image instead.');
      navigate('convert');
      return;
    }

    cap.addEventListener('click', () => {
      const canvas = document.createElement('canvas');
      canvas.width = vid.videoWidth;
      canvas.height = vid.videoHeight;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(vid, 0, 0, canvas.width, canvas.height);
      canvas.toBlob((blob) => {
        stopCamera(vid);
        state.lastImageBlob = blob;
        navigate('result');
      }, 'image/jpeg', 0.95);
    });
  }, 0);
}

function stopCamera(vid) {
  try {
    if (vid && vid.srcObject) {
      vid.srcObject.getTracks().forEach(t => t.stop());
      vid.srcObject = null;
    }
  } catch (e) {}
}

/* ========================
   Convert (Upload)
   ======================== */
function renderConvert() {
  const box = document.createElement('div');
  box.className = 'card';
  box.innerHTML = `
    <h3>Upload Image</h3>
    <p class="small-muted">Choose a photo of a printed page (or use camera). Best results: clear text, high contrast.</p>
    <input type="file" accept="image/*" id="file_input" style="margin-top:8px" />
    <div style="display:flex;gap:8px;margin-top:10px">
      <button class="btn" id="run_ocr_btn">Start OCR & Convert</button>
      <button class="btn ghost" id="conv_back">Back</button>
    </div>
    <div id="conv_preview" style="margin-top:10px"></div>
  `;
  appRoot.appendChild(box);

  setTimeout(() => {
    document.getElementById('conv_back').addEventListener('click', () => navigate('home'));
    document.getElementById('run_ocr_btn').addEventListener('click', async () => {
      const input = document.getElementById('file_input');
      if (!input.files || input.files.length === 0) { alert('Select an image'); return; }
      state.lastImageBlob = input.files[0];
      navigate('result');
    });
  }, 0);
}

/* ========================
   Result page
   ======================== */
function renderResult() {
  const box = document.createElement('div');
  box.className = 'card';
  box.innerHTML = `
    <h3>Result</h3>
    <div id="result_preview" class="preview-canvas" style="height:200px">Preview</div>
    <div style="display:flex;gap:8px;margin-top:10px">
      <button class="btn" id="listen_again">Listen Again</button>
      <button class="btn ghost" id="to_braille">Convert to Braille</button>
      <button class="btn ghost" id="save_btn">Save</button>
    </div>
    <div style="margin-top:10px">
      <strong>Extracted Text</strong>
      <textarea id="extractedText" readonly></textarea>
    </div>
  `;
  appRoot.appendChild(box);

  setTimeout(async () => {
    const prev = document.getElementById('result_preview');
    const ta = document.getElementById('extractedText');
    const listenAgain = document.getElementById('listen_again');
    const toBraille = document.getElementById('to_braille');
    const saveBtn = document.getElementById('save_btn');

    if (state.lastImageBlob) {
      const imgURL = URL.createObjectURL(state.lastImageBlob);
      prev.innerHTML = `<img src="${imgURL}" style="width:100%;height:100%;object-fit:cover;border-radius:8px" />`;
    }

    if (!state.lastText) {
      ta.value = 'Processing OCR...';
      try {
        const text = await performOCR(state.lastImageBlob, state.ocrLang);
        state.lastText = text.trim();
        ta.value = state.lastText || '[No text found]';
        autoSpeak(state.lastText);
      } catch (e) {
        ta.value = 'Error during OCR: ' + (e.message || e);
      }
    } else ta.value = state.lastText;

    listenAgain.addEventListener('click', () => autoSpeak(state.lastText));
    toBraille.addEventListener('click', () => {
      state.lastBraille = textToBraille(state.lastText || '');
      navigate('braille');
    });
    saveBtn.addEventListener('click', () => saveResult(state.lastText));
  }, 0);
}

/* ========================
   Braille page
   ======================== */
function renderBraille() {
  const box = document.createElement('div');
  box.className = 'card results-area';
  box.innerHTML = `
    <h3>Braille</h3>
    <div class="small-muted">Tap any word to hear it and feel haptic feedback.</div>
    <div class="braille-box" id="brailleBox"></div>
    <div style="display:flex;gap:8px;margin-top:8px">
      <button class="btn" id="bra_back">Back</button>
      <button class="btn ghost" id="play_all">Play Word-by-Word</button>
    </div>
  `;
  appRoot.appendChild(box);

  setTimeout(() => {
    document.getElementById('bra_back').addEventListener('click', () => navigate('result'));
    document.getElementById('play_all').addEventListener('click', () => playWordByWord(state.lastText));

    const bb = document.getElementById('brailleBox');
    bb.innerHTML = '';
    if (!state.lastText) { bb.innerHTML = '<div class="small-muted">No text available. Convert a page first.</div>'; return; }

    const words = (state.lastText || '').split(/\s+/);
    const brailleWords = (state.lastBraille || textToBraille(state.lastText || '')).split(/\s{2}/);

    words.forEach((w, i) => {
      const wr = document.createElement('div');
      wr.className = 'braille-word';
      const br = brailleWords[i] || textToBraille(w);
      wr.innerHTML = `<div style="font-size:28px;line-height:1.1">${br}</div><div style="font-size:13px;color:var(--muted)">${w}</div>`;
      wr.addEventListener('click', () => {
        window.speechSynthesis.cancel();
        speak(w, state.ttsLang);
        const firstCell = (br || '').trim().split(/\s+/)[0] || '';
        if (firstCell) vibrateBrailleCell(firstCell);
      });
      bb.appendChild(wr);
    });
  }, 0);
}

/* ========================
   Settings
   ======================== */
function renderSettings() {
  const box = document.createElement('div');
  box.className = 'card';
  box.innerHTML = `
    <h3>Settings</h3>
    <div class="list-item">
      <div>Screen Reader</div>
      <div class="switch"><label><input type="checkbox" id="screenReaderSwitch"> Enable</label></div>
    </div>
    <div class="list-item">
      <div>Preferred TTS Language</div>
      <select id="tts_select" style="margin-top:8px;padding:8px;border-radius:8px">
        <option value="auto">Auto</option>
        <option value="en-US">English</option>
        <option value="hi-IN">Hindi</option>
        <option value="ta-IN">Tamil</option>
      </select>
    </div>
    <div class="list-item">
      <div>Reading Speed</div>
      <input id="speed_range" type="range" min="0.6" max="1.4" step="0.05" value="${state.readSpeed}" />
      <div class="small-muted">Adjust speech rate</div>
    </div>
    <div style="display:flex;gap:8px;margin-top:8px">
      <button class="btn" id="save_settings">Save</button>
      <button class="btn ghost" id="reset_settings">Reset</button>
    </div>
  `;
  appRoot.appendChild(box);

  setTimeout(() => {
    document.getElementById('screenReaderSwitch').checked = state.screenReader;
    document.getElementById('tts_select').value = state.ttsLang;
    document.getElementById('speed_range').value = state.readSpeed;

    document.getElementById('save_settings').addEventListener('click', () => {
      state.screenReader = document.getElementById('screenReaderSwitch').checked;
      state.ttsLang = document.getElementById('tts_select').value;
      state.readSpeed = parseFloat(document.getElementById('speed_range').value);
      alert('Settings saved');
    });
    document.getElementById('reset_settings').addEventListener('click', () => {
      state.screenReader = true; state.ttsLang = 'auto'; state.readSpeed = 0.95;
      render();
    });
  }, 0);
}

/* ========================
   Help
   ======================== */
function renderHelp() {
  const box = document.createElement('div');
  box.className = 'card';
  box.innerHTML = `
    <h3>Help</h3>
    <div class="list-item"><strong>How to use</strong><div class="small-muted">Open Camera → Capture or Upload → Start OCR → App reads text & shows braille.</div></div>
    <div class="list-item"><strong>What languages</strong><div class="small-muted">Tesseract supports many languages; add traineddata to support offline languages.</div></div>
    <div class="list-item"><strong>Accessibility</strong><div class="small-muted">Tap braille words to hear and feel haptic feedback.</div></div>
  `;
  appRoot.appendChild(box);
}

/* ========================
   OCR Function
   ======================== */
async function performOCR(blob, lang='eng') {
  if (!blob) throw new Error('No image provided');
  const { createWorker } = Tesseract;
  const worker = await createWorker({ logger: null }); // ✅ fix DataCloneError
  await worker.load();
  await worker.loadLanguage(lang);
  await worker.initialize(lang);
  const result = await worker.recognize(blob);
  await worker.destroy();
  return result?.data?.text || '';
}

/* ========================
   Braille / TTS Helpers
   ======================== */
function textToBraille(text) {
  // Simple Braille Unicode converter (placeholder)
  return text.replace(/[a-zA-Z]/g, ch => String.fromCharCode(0x2800 + (ch.toLowerCase().charCodeAt(0)-97)));
}

function vibrateBrailleCell(cell) {
  if (navigator.vibrate) navigator.vibrate(100);
}

function autoSpeak(text) {
  if (!state.screenReader || !text) return;
  speak(text, state.ttsLang);
}

function speak(text, lang='auto') {
  const u = new SpeechSynthesisUtterance(text);
  u.lang = lang;
  u.rate = state.readSpeed;
  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(u);
}

function playWordByWord(text) {
  if (!text) return;
  const words = text.split(/\s+/);
  let i = 0;
  function nextWord() {
    if (i >= words.length) return;
    speak(words[i]);
    i++;
    setTimeout(nextWord, 500);
  }
  nextWord();
}

function saveResult(text) {
  if (!text) return alert('Nothing to save');
  const a = document.createElement('a');
  const blob = new Blob([text], { type: 'text/plain' });
  a.href = URL.createObjectURL(blob);
  a.download = 'extracted_text.txt';
  a.click();
}

/* ========================
   Initial Render
   ======================== */
render();
