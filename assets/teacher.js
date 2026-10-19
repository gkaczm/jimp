'use strict';
const $=id=>document.getElementById(id);
let question=null;
const encoder=new TextEncoder();
const GROUP_LABELS={'08':'08:00','10':'10:00','12':'12:00'};
function b64(s) { return Uint8Array.from(atob(s), char=>char.charCodeAt(0)); }
async function decrypt(data,password) {
  const base=await crypto.subtle.importKey('raw',encoder.encode(password),'PBKDF2',false,['deriveKey']);
  const key=await crypto.subtle.deriveKey({name:'PBKDF2',salt:b64(data.salt),iterations:data.iterations,hash:'SHA-256'},base,{name:'AES-GCM',length:256},false,['decrypt']);
  const plain=await crypto.subtle.decrypt({name:'AES-GCM',iv:b64(data.nonce)},key,b64(data.ciphertext));
  return JSON.parse(new TextDecoder().decode(plain));
}
function elem(tag,text,className) {
  const el=document.createElement(tag);el.textContent=text;
  if (className) el.className=className;
  return el;
}
function render() {
  const slide=$('slide');slide.replaceChildren();
  slide.append(elem('h1',question.title));
  slide.append(elem('p',question.text,'task-text'));
  if (question.requirements?.length) {
    slide.append(elem('h2','Wymagania'));
    const ul=document.createElement('ul');
    for (const item of question.requirements) ul.append(elem('li',item));
    slide.append(ul);
  }
  if (question.example) {
    slide.append(elem('h2','Przykład'));
    slide.append(elem('p',`Przed: ${question.example.before}`,'example'));
    slide.append(elem('p',`Po:      ${question.example.after}`,'example'));
  }
}
function setError(message) {$('error').textContent=message;}
async function loadLabs() {
  try {
    const response=await fetch('labs.json',{cache:'no-store'});
    if(!response.ok) throw Error('HTTP '+response.status);
    const labs=await response.json();
    if (!Array.isArray(labs)||labs.length===0) throw Error('Brak laboratoriów');
    for (const lab of labs) {
      if(!/^\d+$/.test(String(lab.id))) continue;
      const option=document.createElement('option');option.value=String(lab.id);
      option.textContent=`Laboratorium ${lab.id} — ${lab.title}`;
      $('lab').append(option);
    }
    if (!$('lab').options.length) throw Error('Niepoprawna lista laboratoriów');
    $('unlock').disabled=false;
  } catch (_) {setError('Nie udało się załadować listy laboratoriów (labs.json).');}
}
$('unlock').disabled=true;
loadLabs();
$('unlock').addEventListener('click', async()=>{
  setError('');$('unlock').disabled=true;
  const group=$('group').value, lab=$('lab').value;
  try {
    const response=await fetch(`data/group-${group}-${lab}.enc.json`,{cache:'no-store'});
    if (!response.ok) throw new Error(response.status===404 ? 'Nie znaleziono zaszyfrowanego pliku pytań dla tej grupy i laboratorium.' : 'Nie udało się pobrać pliku pytań (HTTP '+response.status+').');
    let data;
    try {data=await response.json();}catch (_) {throw Error('Plik pytań nie jest poprawnym JSON-em.');}
    let deck;
    try {deck=await decrypt(data,$('password').value);}catch (err) {
      if (err?.name==='OperationError') throw Error('Hasło nie pasuje do tego pliku lub plik jest uszkodzony.');
      throw Error('Nie udało się odszyfrować pliku: '+err.message);
    }
    const item=deck.question;
    if(!item||!item.title||!item.text||!Array.isArray(item.requirements)) throw Error('Niepoprawny format odszyfrowanego zadania.');
    question=item;
    $('group-label').textContent=`Laboratorium ${lab} · grupa ${GROUP_LABELS[group]||group}`;
    $('password').value='';$('login').hidden=true;$('presentation').hidden=false;
    render();
  } catch(err) {
    setError(err.message || 'Nieznany błąd.');
  } finally {$('unlock').disabled=false;}
});
$('password').addEventListener('keydown',event=>{if(event.key==='Enter')$('unlock').click();});
$('fullscreen').addEventListener('click',()=>{$('presentation').requestFullscreen?.();});
$('lock').addEventListener('click',()=>{
  question=null;$('slide').replaceChildren();$('presentation').hidden=true;$('login').hidden=false;
  if(document.fullscreenElement) document.exitFullscreen();
});
document.addEventListener('keydown',event=>{
  if ($('presentation').hidden || ['INPUT','SELECT','TEXTAREA'].includes(document.activeElement?.tagName)) return;
  if (event.key.toLowerCase()==='f') $('fullscreen').click();
});
