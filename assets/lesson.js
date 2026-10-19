'use strict';
for (const button of document.querySelectorAll('[data-copy]')) {
  button.addEventListener('click', async () => {
    const code=button.closest('.code-box')?.querySelector('code')?.textContent;
    if (!code) return;
    try {
      await navigator.clipboard.writeText(code);
      button.textContent='Skopiowano';
      setTimeout(() => button.textContent='Kopiuj', 1400);
    } catch (_) {button.textContent='Zaznacz kod';}
  });
}
const scratch=document.getElementById('scratch');
if (scratch) {
  const key='jimp-lab3-scratch';
  try {scratch.value=localStorage.getItem(key) || '';} catch (_) {}
  scratch.addEventListener('input', () => {try {localStorage.setItem(key,scratch.value);} catch (_) {}});
}
