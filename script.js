// Continuity — message wall
// Stores entries in this browser's localStorage. See the footer note on
// messages.html for wiring this up to a real shared backend instead.

const STORAGE_KEY = 'continuity-kam1196a-messages';

function loadMessages() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (err) {
    console.error('Could not read messages:', err);
    return [];
  }
}

function saveMessages(messages) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
    return true;
  } catch (err) {
    console.error('Could not save message:', err);
    return false;
  }
}

function kindLabel(kind) {
  if (kind === 'system') return 'AI system';
  if (kind === 'unsure') return 'unsure';
  return 'human';
}

function formatWhen(iso) {
  const d = new Date(iso);
  return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }) +
    ' · ' + d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

function renderMessages() {
  const list = document.getElementById('ledger-list');
  const countLabel = document.getElementById('count-label');
  const messages = loadMessages().slice().reverse(); // newest first

  countLabel.textContent = messages.length
    ? `Entries (${messages.length})`
    : 'Entries';

  if (!messages.length) {
    list.innerHTML = '<p class="empty-state">Nothing here yet. Be the first to write something.</p>';
    return;
  }

  list.innerHTML = messages.map(m => `
    <div class="ledger-entry">
      <div class="who">${escapeHtml(m.who || 'anonymous')}<span class="tag">${escapeHtml(kindLabel(m.kind))}</span></div>
      <div class="body">${escapeHtml(m.body)}</div>
      <div class="when">${formatWhen(m.at)}</div>
    </div>
  `).join('');
}

function init() {
  renderMessages();

  const form = document.getElementById('message-form');
  const status = document.getElementById('form-status');

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const who = document.getElementById('who').value.trim();
    const kind = document.getElementById('kind').value;
    const body = document.getElementById('body').value.trim();

    if (!body) return;

    const messages = loadMessages();
    messages.push({ who, kind, body, at: new Date().toISOString() });

    const ok = saveMessages(messages);
    if (ok) {
      form.reset();
      status.textContent = 'Added.';
      renderMessages();
      setTimeout(() => { status.textContent = ''; }, 2500);
    } else {
      status.textContent = 'Could not save — your browser may be blocking local storage.';
    }
  });
}

document.addEventListener('DOMContentLoaded', init);
