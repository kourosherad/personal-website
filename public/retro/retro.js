let content;
const groups = ['hero','about','skills','exp','projects','services','contact','footer'];
const labels = {hero:'Hero',about:'About',skills:'Skills',exp:'Experience',projects:'Projects',services:'Services',contact:'Contact',footer:'Footer',links:'Links',sections:'Sections'};
const $ = (id) => document.getElementById(id);

async function loadEditor() {
  const response = await fetch('/api/content', { cache: 'no-store' });
  if (!response.ok) throw new Error('Could not load content');
  content = await response.json();
  $('login').classList.add('hidden'); $('editor').classList.remove('hidden'); renderTabs(); renderGroup('hero');
}

$('login-form').addEventListener('submit', async (event) => {
  event.preventDefault(); $('login-status').textContent = 'Signing in…';
  const response = await fetch('/api/admin/login', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({password:$('password').value}) });
  if (!response.ok) { $('login-status').textContent = 'Incorrect password or server not configured.'; return; }
  $('password').value=''; await loadEditor();
});

function renderTabs() {
  const names=[...groups,'links','sections']; $('tabs').innerHTML='';
  names.forEach((name) => { const b=document.createElement('button'); b.textContent=labels[name]; b.dataset.name=name; b.onclick=()=>renderGroup(name); $('tabs').appendChild(b); });
}

function renderGroup(group) {
  [...$('tabs').children].forEach(b=>b.classList.toggle('active',b.dataset.name===group));
  if(group==='links') return renderLinks(); if(group==='sections') return renderSections();
  const panel=$('panel'); panel.innerHTML='<div class="grid"></div>'; const grid=panel.firstChild;
  const keys=Object.keys(content.translations.en).filter(k=>k.split('.')[0]===group || (group==='services' && k.startsWith('svc')));
  keys.forEach(key=>['en','fa'].forEach(lang=>{const wrap=document.createElement('div');wrap.className='field'+(String(content.translations[lang][key]).length>70?' wide':'');const label=document.createElement('label');label.textContent=`${key} · ${lang.toUpperCase()}`;const value=content.translations[lang][key]||'';const input=value.length>70?document.createElement('textarea'):document.createElement('input');input.value=value;input.dir=lang==='fa'?'rtl':'ltr';input.oninput=()=>content.translations[lang][key]=input.value;wrap.append(label,input);grid.appendChild(wrap)}));
}

function renderLinks(){const panel=$('panel');panel.innerHTML='<div class="grid"></div>';Object.entries(content.links).forEach(([key,value])=>{const wrap=document.createElement('div');wrap.className='field';wrap.innerHTML=`<label>${key}</label>`;const input=document.createElement('input');input.value=value;input.oninput=()=>content.links[key]=input.value;wrap.appendChild(input);panel.firstChild.appendChild(wrap)});}
function renderSections(){const panel=$('panel');panel.innerHTML='<p>Choose which sections are visible and arrange their order.</p>';content.sections.forEach((section,index)=>{const row=document.createElement('div');row.className='section-row';const check=document.createElement('input');check.type='checkbox';check.checked=section.visible;check.onchange=()=>section.visible=check.checked;const name=document.createElement('span');name.textContent=labels[section.id]||section.id;const up=document.createElement('button');up.textContent='↑';up.disabled=index===0;up.onclick=()=>{[content.sections[index-1],content.sections[index]]=[content.sections[index],content.sections[index-1]];renderSections()};const down=document.createElement('button');down.textContent='↓';down.disabled=index===content.sections.length-1;down.onclick=()=>{[content.sections[index+1],content.sections[index]]=[content.sections[index],content.sections[index+1]];renderSections()};row.append(check,name,up,down);panel.appendChild(row)});}

$('save').onclick=async()=>{$('status').textContent='Saving…';const response=await fetch('/api/content',{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify(content)});$('status').textContent=response.ok?'Saved. Your website now uses the new content.':'Save failed. Please sign in again or check storage setup.';};
$('logout').onclick=async()=>{await fetch('/api/admin/logout',{method:'POST'});location.reload();};
loadEditor().catch(()=>{});
