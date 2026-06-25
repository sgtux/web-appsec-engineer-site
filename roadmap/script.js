function toggleNode(id) {
  const panel = document.getElementById(id);
  const arrow = document.getElementById('arrow-' + id);
  const isOpen = panel.classList.contains('open');

  // Close all main panels
  document.querySelectorAll('.node-panel').forEach(p => p.classList.remove('open'));
  document.querySelectorAll('.arrow').forEach(a => a.classList.remove('open'));

  // Close all sub-panels when closing a main node
  if (isOpen) return;

  panel.classList.add('open');
  arrow.classList.add('open');
}

function toggleSub(id) {
  const panel = document.getElementById(id);
  const btn = panel.previousElementSibling;
  const isOpen = panel.classList.contains('open');

  // Close sibling sub-panels within the same sub-nodes container
  const siblings = panel.parentElement.parentElement.querySelectorAll('.sub-panel');
  const siblingBtns = panel.parentElement.parentElement.querySelectorAll('.sub-btn');
  siblings.forEach(s => s.classList.remove('open'));
  siblingBtns.forEach(b => b.classList.remove('active'));

  if (!isOpen) {
    panel.classList.add('open');
    btn.classList.add('active');
    // Smooth scroll into view
    setTimeout(() => {
      panel.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }, 50);
  }
}

// Keyboard accessibility: open with Enter/Space
document.addEventListener('keydown', e => {
  if ((e.key === 'Enter' || e.key === ' ') && e.target.classList.contains('node-main')) {
    e.preventDefault();
    e.target.click();
  }
  if ((e.key === 'Enter' || e.key === ' ') && e.target.classList.contains('sub-btn')) {
    e.preventDefault();
    e.target.click();
  }
});
