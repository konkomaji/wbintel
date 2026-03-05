/* ============================================================
   WBIntel · resize.js — Draggable column resizer
   ============================================================ */

const Resize = (() => {
  function init() {
    const grid = document.getElementById('mainGrid');
    const colLeft = document.getElementById('colLeft');
    const colCentre = document.getElementById('colCentre');
    const colRight = document.getElementById('colRight');
    const div1 = document.getElementById('divider1');
    const div2 = document.getElementById('divider2');

    if (!grid || !div1 || !div2) return;

    // Restore saved widths
    const cfg = Config.get();
    if (cfg.columnWidths) {
      colLeft.style.width = cfg.columnWidths[0] + '%';
      colCentre.style.width = cfg.columnWidths[1] + '%';
      colRight.style.width = cfg.columnWidths[2] + '%';
    }

    setupDivider(div1, colLeft, colCentre, 0);
    setupDivider(div2, colCentre, colRight, 1);
  }

  function setupDivider(divider, leftCol, rightCol, idx) {
    let startX, startLeftW, startRightW, gridW;

    divider.addEventListener('mousedown', (e) => {
      e.preventDefault();
      startX = e.clientX;
      const grid = document.getElementById('mainGrid');
      gridW = grid.getBoundingClientRect().width - 8; // minus divider widths
      startLeftW = leftCol.getBoundingClientRect().width;
      startRightW = rightCol.getBoundingClientRect().width;
      divider.classList.add('dragging');
      document.addEventListener('mousemove', onMove);
      document.addEventListener('mouseup', onUp);
    });

    function onMove(e) {
      const delta = e.clientX - startX;
      const newLeft = Math.max(160, startLeftW + delta);
      const newRight = Math.max(160, startRightW - delta);
      leftCol.style.width = newLeft + 'px';
      rightCol.style.width = newRight + 'px';
    }

    function onUp() {
      divider.classList.remove('dragging');
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
      saveLayout();
    }
  }

  function saveLayout() {
    const grid = document.getElementById('mainGrid');
    const gw = grid.getBoundingClientRect().width;
    const lw = document.getElementById('colLeft').getBoundingClientRect().width;
    const cw = document.getElementById('colCentre').getBoundingClientRect().width;
    const rw = document.getElementById('colRight').getBoundingClientRect().width;
    const total = lw + cw + rw;
    Config.update('columnWidths', [
      Math.round(lw / total * 100),
      Math.round(cw / total * 100),
      Math.round(rw / total * 100),
    ]);
  }

  return { init };
})();
