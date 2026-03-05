/* ============================================================
   WBIntel v7.0 · resize.js — Draggable column resizer
   ============================================================ */
const Resize = (() => {
  function init() {
    const colLeft = document.getElementById('colLeft');
    const colCentre = document.getElementById('colCentre');
    const colRight = document.getElementById('colRight');
    const div1 = document.getElementById('divider1');
    const div2 = document.getElementById('divider2');
    if (!div1 || !div2) return;
    const widths = Settings.getColumnWidths();
    colLeft.style.width = widths[0] + '%';
    colCentre.style.width = widths[1] + '%';
    colRight.style.width = widths[2] + '%';
    setup(div1, colLeft, colCentre);
    setup(div2, colCentre, colRight);
  }
  function setup(divider, leftCol, rightCol) {
    let startX, startLW, startRW;
    divider.addEventListener('mousedown', e => {
      e.preventDefault();
      startX = e.clientX;
      startLW = leftCol.getBoundingClientRect().width;
      startRW = rightCol.getBoundingClientRect().width;
      divider.classList.add('dragging');
      document.addEventListener('mousemove', move);
      document.addEventListener('mouseup', up);
    });
    function move(e) {
      const delta = e.clientX - startX;
      leftCol.style.width = Math.max(180, startLW + delta) + 'px';
      rightCol.style.width = Math.max(180, startRW - delta) + 'px';
    }
    function up() {
      divider.classList.remove('dragging');
      document.removeEventListener('mousemove', move);
      document.removeEventListener('mouseup', up);
      saveLayout();
    }
  }
  function saveLayout() {
    const lw = document.getElementById('colLeft').getBoundingClientRect().width;
    const cw = document.getElementById('colCentre').getBoundingClientRect().width;
    const rw = document.getElementById('colRight').getBoundingClientRect().width;
    const total = lw + cw + rw;
    Settings.setColumnWidths([
      Math.round(lw / total * 100), Math.round(cw / total * 100), Math.round(rw / total * 100)
    ]);
  }
  return { init };
})();
