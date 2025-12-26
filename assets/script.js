// Minimal, purely static password gate.
// NOTE: This is for friendly use only. Anyone can view client JS.
// If you need stronger protection, see README advanced section.

(function () {
  // Pirate map: clicking the X reveals a number
  const mapXText = document.querySelector('.map-x-text');
  const mapRevealFooter = document.getElementById('map-reveal-footer');
  if (mapXText && mapRevealFooter) {
    mapXText.addEventListener('click', function () {
      const hidden = mapRevealFooter.classList.toggle('hint-hidden');
      this.setAttribute('aria-expanded', String(!hidden));
    });
  }

  // Tip toggle
  document.querySelectorAll('.tip-toggle').forEach(btn => {
    btn.addEventListener('click', function(e) {
      e.preventDefault();
      const tip = this.nextElementSibling;
      const isHidden = tip.classList.toggle('tip-hidden');
      this.textContent = isHidden ? '💭 Tipp anzeigen' : '💭 Tipp verbergen';
    });
  });

  // Hint reveal toggle
  document.querySelectorAll('.hint-toggle').forEach(btn => {
    btn.addEventListener('click', function(e) {
      e.preventDefault();
      const hint = this.nextElementSibling;
      const isHidden = hint.classList.toggle('hint-hidden');
      this.textContent = isHidden ? '💡 Hinweis anzeigen' : '💡 Hinweis verbergen';
    });
  });

  // Password check via SHA-256 hash (trimmed, lowercased input)
  const EXPECTED_PASSWORD_HASH = 'f85451eb1d20adaf24cc6473814b679e4119230c95e6588083dae4c6b5e5ce7f';
  const STORAGE_KEY = 'xmas25-unlocked';

  const form = document.getElementById('pwForm');
  const input = document.getElementById('password');
  const statusEl = document.getElementById('status');
  const letter = document.getElementById('letter');

  function normalizeForHash(s) {
    return (s || '').trim().toLowerCase();
  }

  async function sha256Hex(str) {
    if (!window.crypto || !window.crypto.subtle) {
      throw new Error('Web Crypto nicht verfügbar');
    }
    const data = new TextEncoder().encode(normalizeForHash(str));
    const hashBuf = await crypto.subtle.digest('SHA-256', data);
    return Array.from(new Uint8Array(hashBuf)).map(b => b.toString(16).padStart(2, '0')).join('');
  }

  function showStatus(msg, ok) {
    statusEl.textContent = msg || '';
    statusEl.className = 'status ' + (ok ? 'ok' : 'error');
  }

  function unlock() {
    letter.hidden = false;
    showStatus('Supii! 🎁', true);
  }

  function lock() {
    letter.hidden = true;
    showStatus('', false);
  }

  // Lock on every refresh (clear any stored unlock state)
  lock();
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (_) {}

  form.addEventListener('submit', async function (e) {
    e.preventDefault();
    const raw = input.value || '';

    if (!raw.trim()) {
      showStatus('Bitte Passwort eingeben.', false);
      input.focus();
      return;
    }

    try {
      const inputHash = await sha256Hex(raw);
      if (inputHash === EXPECTED_PASSWORD_HASH) {
        unlock();
        try { localStorage.setItem(STORAGE_KEY, '1'); } catch (_) {}
      } else {
        showStatus('Nope — das Passwort stimmt nicht.', false);
        input.select();
      }
    } catch (err) {
      showStatus('Web Crypto nicht verfügbar – probier einen modernen Browser.', false);
    }
  });
})();
