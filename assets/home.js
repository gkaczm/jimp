'use strict';
const list = document.getElementById('lab-list');
fetch('labs.json', {cache: 'no-store'})
  .then(response => {if (!response.ok) throw new Error('HTTP ' + response.status); return response.json();})
  .then(labs => {
    list.replaceChildren();
    if (!Array.isArray(labs) || labs.length === 0) {
      const p=document.createElement('p'); p.textContent='Brak opublikowanych laboratoriów.'; list.append(p); return;
    }
    for (const lab of labs) {
      const link=document.createElement('a'); link.className='lab-card'; link.href=lab.url;
      const badge=document.createElement('span'); badge.className='lab-number'; badge.textContent='LAB '+lab.id;
      const title=document.createElement('strong'); title.textContent=lab.title;
      const arrow=document.createElement('span'); arrow.className='card-arrow'; arrow.textContent='→'; arrow.setAttribute('aria-hidden','true');
      link.append(badge,title,arrow); list.append(link);
    }
  }).catch(() => { /* Keep the static Lab 3 link if JSON loading fails locally. */ });
