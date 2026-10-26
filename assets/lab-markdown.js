
/* JIMP laboratory Markdown renderer.
 * No external libraries, build step, or HTML in Markdown required.
 * Text is inserted with textContent; unsafe links are rejected.
 */
'use strict';
(() => {
  const main = document.getElementById('lab-content');
  const toc = document.getElementById('lab-toc');
  const heading = document.getElementById('lab-title');
  const number = document.getElementById('lab-number');
  const intro = document.getElementById('lab-intro');
  const id = new URLSearchParams(window.location.search).get('id');

  if (!/^\d+$/.test(id || '')) {
    showError('Nieprawidłowy numer laboratorium.');
    return;
  }

  function showError(message) {
    main.replaceChildren();
    const p = document.createElement('p');
    p.className = 'load-error';
    p.textContent = message;
    main.append(p);
  }

  function el(tag, cls, text) {
    const node = document.createElement(tag);
    if (cls) node.className = cls;
    if (text !== undefined) node.textContent = text;
    return node;
  }

  // URLs are relative to the website root, not to content/labN.md.
  function safeUrl(raw) {
    const value = raw.trim();
    if (!value || /[\x00-\x1f\\]/.test(value)) return null;
    if (value.startsWith('#')) return value;
    if (/^https?:\/\//i.test(value) || /^mailto:/i.test(value)) return value;
    if (/^[a-z][\w+.-]*:/i.test(value) || value.startsWith('//')) return null;

    return new URL(
      '../' + value.replace(/^\/?(?:\.\/)?/, ''),
      location.href
    ).href;
  }

  // Deliberately small, safe subset of Markdown for inline formatting.
  function inline(parent, source) {
    let text = source;

    while (text.length) {
      const code = text.match(/^`([^`]+)`/);
      if (code) {
        parent.append(el('code', '', code[1]));
        text = text.slice(code[0].length);
        continue;
      }

      const strong = text.match(/^\*\*([^*]+(?:\*(?!\*)[^*]+)*)\*\*/);
      if (strong) {
        const node = el('strong');
        inline(node, strong[1]);
        parent.append(node);
        text = text.slice(strong[0].length);
        continue;
      }

      const italic = text.match(/^\*([^*]+)\*/);
      if (italic) {
        const node = el('em');
        inline(node, italic[1]);
        parent.append(node);
        text = text.slice(italic[0].length);
        continue;
      }

      const image = text.match(/^!\[([^\]]*)\]\(([^)]+)\)/);
      if (image) {
        const src = safeUrl(image[2]);
        if (src && !src.startsWith('#')) {
          const img = el('img', 'markdown-image');
          img.src = src;
          img.alt = image[1];
          img.loading = 'lazy';
          parent.append(img);
        } else {
          parent.append(document.createTextNode(image[0]));
        }
        text = text.slice(image[0].length);
        continue;
      }

      const link = text.match(/^\[([^\]]+)\]\(([^)]+)\)/);
      if (link) {
        const href = safeUrl(link[2]);
        if (href) {
          const a = el('a');
          a.href = href;
          inline(a, link[1]);

          if (
            /^https?:\/\//i.test(href) &&
            new URL(href).origin !== location.origin
          ) {
            a.target = '_blank';
            a.rel = 'noopener noreferrer';
          }

          parent.append(a);
        } else {
          parent.append(document.createTextNode(link[0]));
        }
        text = text.slice(link[0].length);
        continue;
      }

      const next = text.slice(1).search(/[`*\[]|!\[/);
      const n = next === -1 ? text.length : next + 1;
      parent.append(document.createTextNode(text.slice(0, n)));
      text = text.slice(n);
    }
  }

  function paragraph(parent, text, cls) {
    const p = el('p', cls);
    inline(p, text.trim());
    parent.append(p);
    return p;
  }

  function renderCode(parent, language, title, code) {
    const box = el('div', 'code-box');
    const header = el('div', 'code-header');

    header.append(el(
      'span',
      '',
      title || (language === 'bash'
        ? 'Terminal'
        : language.toUpperCase() || 'Kod')
    ));

    const button = el('button', 'copy-btn', 'Kopiuj');
    button.type = 'button';
    button.setAttribute('data-copy', '');
    header.append(button);

    const pre = el('pre');
    const node = el('code', language ? 'language-' + language : '', code);

    pre.append(node);
    box.append(header, pre);
    parent.append(box);
  }

  // Markdown tables: header row, separator row, then data rows.
  function tableCells(line) {
    return line.trim()
      .replace(/^\|/, '')
      .replace(/\|$/, '')
      .split('|')
      .map(cell => cell.trim());
  }

  function isTableStart(lines, i) {
    if (i + 1 >= lines.length || !lines[i].includes('|')) {
      return false;
    }

    const headers = tableCells(lines[i]);
    const dividers = tableCells(lines[i + 1]);

    return (
      headers.length >= 2 &&
      headers.length === dividers.length &&
      dividers.every(cell => /^:?-{3,}:?$/.test(cell))
    );
  }

  function renderTable(parent, lines, start) {
    const headers = tableCells(lines[start]);
    const dividers = tableCells(lines[start + 1]);

    const scroll = el('div', 'table-scroll');
    const table = el('table', 'md-table');

    const thead = el('thead');
    const headerRow = el('tr');

    const aligns = dividers.map(cell =>
      cell.endsWith(':')
        ? (cell.startsWith(':') ? 'center' : 'right')
        : 'left'
    );

    headers.forEach((cell, index) => {
      const th = el('th');
      th.scope = 'col';

      if (aligns[index] !== 'left') {
        th.className = 'align-' + aligns[index];
      }

      inline(th, cell);
      headerRow.append(th);
    });

    thead.append(headerRow);
    table.append(thead);

    const tbody = el('tbody');
    let i = start + 2;

    while (
      i < lines.length &&
      lines[i].trim() &&
      lines[i].includes('|')
    ) {
      const cells = tableCells(lines[i]);

      if (cells.length !== headers.length) break;

      const tr = el('tr');

      cells.forEach((cell, index) => {
        const td = el('td');

        if (aligns[index] !== 'left') {
          td.className = 'align-' + aligns[index];
        }

        inline(td, cell);
        tr.append(td);
      });

      tbody.append(tr);
      i++;
    }

    table.append(tbody);
    scroll.append(table);
    parent.append(scroll);

    return i;
  }

  function renderScratch(parent) {
    const count = document.querySelectorAll('.scratch').length + 1;

    const label = el(
      'label',
      'muted',
      'Miejsce na własne notatki i fragmenty kodu — bez uruchamiania.'
    );

    const area = el('textarea', 'scratch');
    area.id = `scratch-lab-${id}-${count}`;
    area.setAttribute('spellcheck', 'false');
    area.setAttribute('aria-label', 'Notatki i kod');
    label.htmlFor = area.id;

    const key = `jimp-lab${id}-scratch${count === 1 ? '' : '-' + count}`;

    try {
      area.value = localStorage.getItem(key) || '';
    } catch (_) {}

    area.addEventListener('input', () => {
      try {
        localStorage.setItem(key, area.value);
      } catch (_) {}
    });

    const status = el(
      'p',
      'muted smallprint',
      'Notatki są przechowywane tylko w tej przeglądarce.'
    );

    parent.append(label, area, status);
  }

  function renderDirective(parent, type, title, lines) {
    const content = lines.join('\n').trim();

    if (type === 'label') {
      parent.append(el('div', 'section-kicker', title));
      return;
    }

    if (type === 'scratchpad') {
      renderScratch(parent);
      return;
    }

    if (type === 'note' || type === 'warning') {
      const box = el('div', type === 'warning' ? 'note warning' : 'note');

      if (title) box.append(el('strong', '', title));

      renderBlocks(lines, box);
      parent.append(box);
      return;
    }

    if (type === 'download' || type === 'download-primary') {
      const fileLine = lines.find(line => /^file:\s*/i.test(line));
      const buttonLine = lines.find(line => /^button:\s*/i.test(line));

      const url = fileLine
        ? safeUrl(fileLine.replace(/^file:\s*/i, ''))
        : null;

      const wrap = el(
        'div',
        type === 'download-primary'
          ? 'download-strip primary'
          : 'download-strip'
      );

      const left = el('div');
      left.append(el('strong', '', title || 'Plik do pobrania'));

      renderBlocks(
        lines.filter(line => !/^(?:file|button):\s*/i.test(line)),
        left
      );

      wrap.append(left);

      if (url && !url.startsWith('#')) {
        const a = el(
          'a',
          'button' + (type === 'download' ? ' small' : ''),
          buttonLine
            ? buttonLine.replace(/^button:\s*/i, '')
            : 'Pobierz plik ↓'
        );

        a.href = url;
        a.download = '';
        wrap.append(a);
      } else {
        wrap.append(el('p', 'load-error', 'Brak poprawnej ścieżki file:'));
      }

      parent.append(wrap);
      return;
    }

    if (type === 'formulas') {
      const grid = el('div', 'formula-grid');

      for (const line of lines.filter(line => line.trim())) {
        const index = line.indexOf('|');
        if (index < 0) continue;

        const box = el('div', 'formula');

        box.append(
          el('span', '', line.slice(0, index).trim()),
          el('strong', '', line.slice(index + 1).trim())
        );

        grid.append(box);
      }

      parent.append(grid);
      return;
    }

    // Unknown directives are shown as content.
    paragraph(parent, `:::${type} ${title}`);

    if (content) renderBlocks(lines, parent);
  }

  function beginsBlock(line) {
    return (
      /^\s*$/.test(line) ||
      /^```/.test(line) ||
      /^:::[\w-]+/.test(line) ||
      /^#{1,3}\s/.test(line) ||
      /^\s*(?:[-*+]\s|\d+\.\s|>\s)/.test(line)
    );
  }

  function renderBlocks(lines, parent) {
    for (let i = 0; i < lines.length;) {
      const line = lines[i];

      if (!line.trim()) {
        i++;
        continue;
      }

      const directive = line.match(/^:::([\w-]+)(?:\s+(.+))?\s*$/);

      if (directive) {
        const type = directive[1];
        const title = directive[2] || '';
        i++;

        if (type === 'label') {
          renderDirective(parent, type, title, []);
          continue;
        }

        const inner = [];

        while (i < lines.length && lines[i].trim() !== ':::') {
          inner.push(lines[i++]);
        }

        if (i < lines.length) i++;

        renderDirective(parent, type, title, inner);
        continue;
      }

      const fence = line.match(/^```([^\s`]*)\s*(.*)$/);

      if (fence) {
        const language = fence[1] || '';
        const title = fence[2].trim();
        const code = [];
        i++;

        while (i < lines.length && !/^```\s*$/.test(lines[i])) {
          code.push(lines[i++]);
        }

        if (i < lines.length) i++;

        renderCode(parent, language, title, code.join('\n'));
        continue;
      }

      const h3 = line.match(/^###\s+(.+)$/);

      if (h3) {
        const h = el('h3');
        inline(h, h3[1]);
        parent.append(h);
        i++;
        continue;
      }

      if (/^>\s?/.test(line)) {
        const quote = [];

        while (i < lines.length && /^>\s?/.test(lines[i])) {
          quote.push(lines[i++].replace(/^>\s?/, ''));
        }

        const block = el('blockquote', 'md-quote');
        renderBlocks(quote, block);
        parent.append(block);
        continue;
      }

      // Tables are separate blocks, even without a blank line.
      if (isTableStart(lines, i)) {
        i = renderTable(parent, lines, i);
        continue;
      }

      const li = line.match(/^\s*(?:([-*+])|(\d+)\.)\s+(.+)$/);

      if (li) {
        const ordered = !!li[2];
        const list = el(ordered ? 'ol' : 'ul', ordered ? 'steps' : '');

        if (ordered && Number(li[2]) !== 1) {
          list.start = Number(li[2]);
        }

        while (i < lines.length) {
          const item = lines[i].match(
            /^\s*(?:([-*+])|(\d+)\.)\s+(.+)$/
          );

          if (!item || ordered !== !!item[2]) break;

          const node = el('li');
          inline(node, item[3]);
          list.append(node);
          i++;
        }

        parent.append(list);
        continue;
      }

      const para = [line];
      i++;

      while (
        i < lines.length &&
        !beginsBlock(lines[i]) &&
        !isTableStart(lines, i)
      ) {
        para.push(lines[i++]);
      }

      paragraph(parent, para.join(' '));
    }
  }

  function slug(value, used) {
    let result = value.toLowerCase()
      .normalize('NFKD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/ł/g, 'l')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '') || 'sekcja';

    let suffix = 2;

    while (used.has(result)) {
      result = result.replace(/-\d+$/, '') + '-' + suffix++;
    }

    used.add(result);
    return result;
  }

  function renderMarkdown(source, title) {
    const lines = source.replace(/\r\n?/g, '\n').split('\n');
    const sections = [];
    const head = [];

    let current = head;
    let inCode = false;
    let inDirective = false;
    let docTitle = '';

    for (const line of lines) {
      if (/^```/.test(line)) inCode = !inCode;

      if (
        !inCode &&
        /^:::(?!\s*$)/.test(line) &&
        !/^:::label\b/.test(line)
      ) {
        inDirective = true;
      } else if (!inCode && /^:::\s*$/.test(line)) {
        inDirective = false;
      }

      if (
        !inCode &&
        !inDirective &&
        /^#\s+/.test(line) &&
        !docTitle
      ) {
        docTitle = line.replace(/^#\s+/, '').trim();
        continue;
      }

      if (
        !inCode &&
        !inDirective &&
        /^##\s+/.test(line)
      ) {
        const section = {
          heading: line.replace(/^##\s+/, '').trim(),
          lines: []
        };

        sections.push(section);
        current = section.lines;
        continue;
      }

      current.push(line);
    }

    heading.textContent = docTitle || title;
    number.textContent = `Laboratorium ${id.padStart(2, '0')}`;
    document.title = `Laboratorium ${id} — JIMP`;

    intro.replaceChildren();
    renderBlocks(head, intro);

    main.replaceChildren();
    toc.replaceChildren();

    const label = el('div', 'toc-label', 'Na tej stronie');
    toc.append(label);

    const used = new Set();

    for (const section of sections) {
      const key = slug(section.heading, used);
      const box = el('section', 'section-block');
      box.id = key;

      const bodyLines = [...section.lines];
      const first = bodyLines.findIndex(line => line.trim());

      if (
        first !== -1 &&
        /^:::label\s+/.test(bodyLines[first])
      ) {
        box.append(el(
          'div',
          'section-kicker',
          bodyLines[first].replace(/^:::label\s+/, '').trim()
        ));

        bodyLines.splice(first, 1);
      }

      box.append(el('h2', '', section.heading));

      renderBlocks(bodyLines, box);
      main.append(box);

      const a = el('a', '', section.heading);
      a.href = '#' + key;
      toc.append(a);
    }

    if (!sections.length) {
      showError('Instrukcja nie zawiera sekcji (nagłówków ##).');
    }
  }

  Promise.all([
    fetch('../labs.json', {cache: 'no-store'}).then(r => {
      if (!r.ok) throw Error('Nie udało się wczytać labs.json');
      return r.json();
    }),

    fetch(`../content/lab${id}.md`, {cache: 'no-store'}).then(r => {
      if (!r.ok) {
        throw Error(`Nie znaleziono content/lab${id}.md`);
      }
      return r.text();
    })
  ]).then(([labs, md]) => {
    const lab = labs.find(item => String(item.id) === id);

    if (!lab) {
      throw Error(`Laboratorium ${id} nie jest wpisane w labs.json.`);
    }

    renderMarkdown(md, lab.title);
  }).catch(err => {
    showError(
      err.message +
      ' Sprawdź pliki i uruchom stronę przez GitHub Pages lub lokalny serwer HTTP.'
    );
  });

  document.addEventListener('click', async event => {
    const button = event.target.closest('[data-copy]');
    if (!button) return;

    const code = button.closest('.code-box')
      ?.querySelector('code')
      ?.textContent;

    if (!code) return;

    try {
      await navigator.clipboard.writeText(code);
      button.textContent = 'Skopiowano';

      setTimeout(() => button.textContent = 'Kopiuj', 1400);
    } catch (_) {
      button.textContent = 'Zaznacz kod';
    }
  });
})();
