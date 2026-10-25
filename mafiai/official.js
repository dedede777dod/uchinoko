(() => {
'use strict';
const $=s=>document.querySelector(s),esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const asset=s=>'../'+s;
const menu=$('.menu');menu.addEventListener('click',()=>{const open=menu.getAttribute('aria-expanded')!=='true';menu.setAttribute('aria-expanded',String(open));$('#nav').classList.toggle('open',open)});
$('#nav').addEventListener('click',e=>{if(e.target.closest('a')){menu.setAttribute('aria-expanded','false');$('#nav').classList.remove('open')}});
document.addEventListener('keydown',e=>{if(e.key==='Escape'){menu.setAttribute('aria-expanded','false');$('#nav').classList.remove('open')}});
Promise.all(['../data-worlds.json','../data-media.json'].map(url=>fetch(url,{cache:'no-store'}).then(r=>{if(!r.ok)throw Error(r.status);return r.json()}))).then(([worlds,media])=>{
 const w=worlds.find(x=>x.id==='tenketsu');if(!w)throw Error('World missing');
 $('#intro').textContent=w.ui.intro;$('#prologue').textContent=w.prologue;
 $('#settings').innerHTML=w.setting.map((s,i)=>`<article><span>0${i+1}</span><h3>${esc(s.title)}</h3><p>${esc(s.text)}</p></article>`).join('');
 $('#rules').innerHTML=w.rules.map(s=>`<li>${esc(s)}</li>`).join('');
 $('#character-tabs').innerHTML=w.characters.map(c=>`<button data-character="${esc(c.id)}" aria-pressed="false">${esc(c.name)}</button>`).join('');
 function showCharacter(id){const c=w.characters.find(c=>c.id===id)||w.characters[0];$('#character-tabs').querySelectorAll('button').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.character===c.id)));
 $('#character-detail').innerHTML=`<div class="portrait" style="--character:${esc(c.color)}"><img src="${esc(ArchiveImages.src(asset(c.image)))}" alt="${esc(c.name)}の公式キャラクター画像"><span>${esc(c.id.toUpperCase())}</span></div><article class="profile"><p class="eyebrow">TENKETSU / ${esc(c.role)}</p><h3>${esc(c.name)}</h3><p class="stats">${esc(c.age)}歳 <span>/</span> ${esc(c.height)}cm</p><blockquote>${esc(c.quotes[0])}</blockquote><p>${esc(c.duty)}</p><p>${esc(c.personality)}</p><a class="button" href="../${ArchiveMedia.profileHref(w.id,c.id)}">プロフィール・衣装差分を見る ↗</a><a class="text-link" href="../gallery.html?world=tenketsu&character=${esc(c.id)}">${esc(c.name)}の日常へ ↗</a></article>`;
 }
 $('#character-tabs').addEventListener('click',e=>{const b=e.target.closest('[data-character]');if(b)showCharacter(b.dataset.character)});showCharacter('haoran');
 $('#gallery-filter').innerHTML=`<button data-filter="all" aria-pressed="true">すべて</button>`+w.characters.map(c=>`<button data-filter="${esc(c.id)}" aria-pressed="false">${esc(c.name)}</button>`).join('');
 function showGallery(id){const items=ArchiveMedia.galleryItems(worlds,media,{worldId:w.id,characterId:id==='all'?undefined:id});$('#gallery-grid').innerHTML=items.map(i=>`<a class="scene" href="../gallery.html?world=tenketsu&item=${encodeURIComponent(i.id)}"><img src="${esc(ArchiveImages.src(asset(i.src)))}" alt="${esc(i.title)}" loading="lazy"><div><span>${ArchiveMedia.charactersFor(worlds,i).map(c=>esc(c.name)).join(' / ')}</span><h3>${esc(i.title)} <b>↗</b></h3></div></a>`).join('')||'<p>このキャラクターの日常画像はまだありません。</p>'}
 $('#gallery-filter').addEventListener('click',e=>{const b=e.target.closest('[data-filter]');if(!b)return;$('#gallery-filter').querySelectorAll('button').forEach(x=>x.setAttribute('aria-pressed',String(x===b)));showGallery(b.dataset.filter)});showGallery('all');
 $('#tracks').innerHTML=ArchiveMedia.select(media,'music',{worldId:w.id}).map((m,i)=>`<article class="track"><img src="${esc(ArchiveImages.src(asset(m.cover)))}" alt="${esc(m.title)} ジャケット" loading="lazy"><div><p class="eyebrow">ORIGINAL MUSIC / ${String(i+1).padStart(2,'0')}</p><h3>${esc(m.title)}</h3>${m.artist?`<p>${esc(m.artist)}</p>`:''}<audio controls preload="none" aria-label="${esc(m.title)}"><source src="${esc(asset(m.audio))}" type="audio/mpeg">音声再生に対応していないブラウザーです。</audio></div></article>`).join('');
 document.querySelectorAll('audio').forEach(a=>a.addEventListener('play',()=>document.querySelectorAll('audio').forEach(b=>{if(a!==b)b.pause()})));
 $('#status').hidden=true;
}).catch(()=>{$('#status').innerHTML='データを読み込めませんでした。再読み込みするか、<a href="../world.html?id=tenketsu">アーカイブへ戻る</a>をお試しください。'});
})();
