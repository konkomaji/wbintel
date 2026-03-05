/* ============================================================
   WBIntel v7.0 · alerts.js — Breaking news alert system
   ============================================================ */
const Alerts = (() => {
  let _dismissTimer = null;

  function show(item) {
    if (!Settings.getToggle('breakingAlerts', true)) return;

    const bar = document.getElementById('breakingAlert');
    const text = document.getElementById('breakingAlertText');
    if (!bar || !text) return;

    text.innerHTML = `<strong>${esc(item.source)}</strong>: ${esc(truncate(item.title, 120))}`;
    bar.style.display = 'flex';

    // Play alarm sound
    Sound.alert();

    // Auto-dismiss after 15 seconds
    if (_dismissTimer) clearTimeout(_dismissTimer);
    _dismissTimer = setTimeout(dismiss, 15000);
  }

  function dismiss() {
    const bar = document.getElementById('breakingAlert');
    if (bar) bar.style.display = 'none';
    if (_dismissTimer) { clearTimeout(_dismissTimer); _dismissTimer = null; }
  }

  return { show, dismiss };
})();
