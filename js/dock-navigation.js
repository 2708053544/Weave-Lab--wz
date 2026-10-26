/* Keep route navigation independent from expanding a submenu. */
(function () {
  const nav = document.getElementById('site-nav');
  if (!nav) return;
  const buttons = [...nav.querySelectorAll('.dock-dropdown-toggle')];
  function close(except) {
    buttons.forEach(button => {
      if (button === except) return;
      button.setAttribute('aria-expanded', 'false');
      button.parentElement.classList.remove('dock-open');
    });
  }
  buttons.forEach(button => button.addEventListener('click', () => {
    const open = button.getAttribute('aria-expanded') !== 'true';
    close();
    button.setAttribute('aria-expanded', String(open));
    button.parentElement.classList.toggle('dock-open', open);
  }));
  document.addEventListener('click', event => { if (!nav.contains(event.target)) close(); });
  document.addEventListener('keydown', event => {
    if (event.key !== 'Escape') return;
    const active = buttons.find(button => button.getAttribute('aria-expanded') === 'true');
    close();
    if (active) active.focus();
  });
})();
