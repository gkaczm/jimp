'use strict';

const $ = id => document.getElementById(id);
const encoder = new TextEncoder();
const GROUP_LABELS = { '08': '08:00', '10': '10:00', '12': '12:00' };
let question = null;

function b64(s) {
  return Uint8Array.from(atob(s), character => character.charCodeAt(0));
}

async function decrypt(data, password) {
  const baseKey = await crypto.subtle.importKey(
    'raw', encoder.encode(password), 'PBKDF2', false, ['deriveKey']
  );
  const key = await crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: b64(data.salt),
      iterations: data.iterations,
      hash: 'SHA-256'
    },
    baseKey,
    { name: 'AES-GCM', length: 256 },
    false,
    ['decrypt']
  );
  const plaintext = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv: b64(data.nonce) }, key, b64(data.ciphertext)
  );
  return JSON.parse(new TextDecoder().decode(plaintext));
}

function elem(tag, text, className) {
  const node = document.createElement(tag);
  node.textContent = text;
  if (className) node.className = className;
  return node;
}

function addCodeSection(parent, label, code) {
  if (typeof code !== 'string' || !code.trim()) return;
  const section = elem('section', '', 'question-code-section');
  section.append(elem('div', label, 'question-code-label'));
  const pre = document.createElement('pre');
  const codeNode = document.createElement('code');
  codeNode.textContent = code;
  pre.append(codeNode);
  section.append(pre);
  parent.append(section);
}

function render() {
  const slide = $('slide');
  slide.replaceChildren();
  if (!question) return;

  slide.append(elem('h1', question.title));
  slide.append(elem('p', question.text, 'task-text'));

  const layout = elem('div', '', 'question-layout');
  const hasCode = (typeof question.code === 'string' && question.code.trim()) ||
                  (typeof question.call === 'string' && question.call.trim());

  if (hasCode) {
    const codePanel = elem('section', '', 'question-panel code-panel');
    codePanel.append(elem('h2', 'Dane funkcje i wywołanie'));
    const codeBox = elem('div', '', 'question-code-box');
    addCodeSection(codeBox, 'Dane funkcje', question.code);
    addCodeSection(codeBox, 'Przykładowe wywołanie', question.call);
    codePanel.append(codeBox);
    layout.append(codePanel);
  }

  if (Array.isArray(question.requirements) && question.requirements.length) {
    const reqPanel = elem('section', '', 'question-panel requirements-panel');
    reqPanel.append(elem('h2', 'Wymagania'));
    const list = document.createElement('ul');
    for (const requirement of question.requirements) {
      list.append(elem('li', requirement));
    }
    reqPanel.append(list);
    layout.append(reqPanel);
  }

  // If no code is provided, don't leave a blank column.
  if (layout.children.length === 1) layout.classList.add('one-panel');
  if (layout.children.length) slide.append(layout);

  if (question.example && question.example.before != null && question.example.after != null) {
    const example = elem('section', '', 'question-example');
    example.append(elem('h2', 'Przykład'));
    const row = elem('div', '', 'question-example-grid');
    const before = elem('div', '', 'question-example-value');
    const after = elem('div', '', 'question-example-value');
    before.append(elem('strong', 'Przed:'));
    before.append(elem('code', String(question.example.before)));
    after.append(elem('strong', 'Po:'));
    after.append(elem('code', String(question.example.after)));
    row.append(before, after);
    example.append(row);
    slide.append(example);
  }
}

function setError(message) {
  $('error').textContent = message;
}

async function loadLabs() {
  try {
    const response = await fetch('labs.json', { cache: 'no-store' });
    if (!response.ok) throw Error('HTTP ' + response.status);
    const labs = await response.json();
    if (!Array.isArray(labs) || labs.length === 0) throw Error('Brak laboratoriów');
    for (const lab of labs) {
      if (!/^\d+$/.test(String(lab.id))) continue;
      const option = document.createElement('option');
      option.value = String(lab.id);
      option.textContent = `Laboratorium ${lab.id} — ${lab.title}`;
      $('lab').append(option);
    }
    if (!$('lab').options.length) throw Error('Niepoprawna lista laboratoriów');
    $('unlock').disabled = false;
  } catch (_) {
    setError('Nie udało się załadować listy laboratoriów (labs.json).');
  }
}

$('unlock').disabled = true;
loadLabs();

$('unlock').addEventListener('click', async () => {
  setError('');
  $('unlock').disabled = true;
  const group = $('group').value;
  const lab = $('lab').value;
  try {
    const response = await fetch(`data/group-${group}-${lab}.enc.json`, { cache: 'no-store' });
    if (!response.ok) {
      throw Error(response.status === 404
        ? 'Nie znaleziono zaszyfrowanego pliku pytań dla tej grupy i laboratorium.'
        : `Nie udało się pobrać pliku pytań (HTTP ${response.status}).`);
    }

    let encrypted;
    try { encrypted = await response.json(); }
    catch (_) { throw Error('Plik pytań nie jest poprawnym JSON-em.'); }

    let deck;
    try { deck = await decrypt(encrypted, $('password').value); }
    catch (error) {
      if (error?.name === 'OperationError') {
        throw Error('Hasło nie pasuje do tego pliku lub plik jest uszkodzony.');
      }
      throw Error('Nie udało się odszyfrować pliku: ' + error.message);
    }

    const item = deck.question;
    if (!item || !item.title || !item.text || !Array.isArray(item.requirements)) {
      throw Error('Niepoprawny format odszyfrowanego zadania.');
    }

    question = item;
    $('group-label').textContent = `Laboratorium ${lab} · grupa ${GROUP_LABELS[group] || group}`;
    $('password').value = '';
    $('login').hidden = true;
    $('presentation').hidden = false;
    render();
  } catch (error) {
    setError(error.message || 'Nieznany błąd.');
  } finally {
    $('unlock').disabled = false;
  }
});

$('password').addEventListener('keydown', event => {
  if (event.key === 'Enter') $('unlock').click();
});

$('fullscreen').addEventListener('click', () => {
  $('presentation').requestFullscreen?.();
});

$('lock').addEventListener('click', () => {
  question = null;
  $('slide').replaceChildren();
  $('presentation').hidden = true;
  $('login').hidden = false;
  if (document.fullscreenElement) document.exitFullscreen();
});

document.addEventListener('keydown', event => {
  if ($('presentation').hidden || ['INPUT', 'SELECT', 'TEXTAREA'].includes(document.activeElement?.tagName)) return;
  if (event.key.toLowerCase() === 'f') $('fullscreen').click();
});
