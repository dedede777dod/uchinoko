const grid=document.getElementById('galleryGrid'),box=document.getElementById('lightbox'),img=document.getElementById('lightboxImage'),title=document.getElementById('lightboxTitle'),meta=document.getElementById('lightboxMeta'),counter=document.getElementById('lightboxCounter'),characterFilter=document.getElementById('characterFilter');
const pairFilter=document.getElementById('pairFilter');let pair=new URLSearchParams(location.search).get('pair')||'',social={posts:[]};
const params=new URLSearchParams(location.search);
let worlds=[],assets=[],visible=[],index=0,filter=params.get('world')||'all',character=params.get('character')||'';
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function tagLinks(item){return ArchiveMedia.charactersFor(worlds,item).map(c=>`<a href="${esc(ArchiveMedia.profileHref(item.worldId,c.id))}" aria-label="${esc(c.name)}のプロフィール">#${esc(c.name)}</a>`).join('')}
function syncURL(item){const p=new URLSearchParams();if(filter!=='all')p.set('world',filter);if(character)p.set('character',character);if(pair)p.set('pair',pair);if(item)p.set('item',item);history.replaceState(null,'','gallery.html'+(p.size?'?'+p.toString():''))}
function updateCharacters(){
 characterFilter.replaceChildren();const all=document.createElement('option');all.value='';all.textContent='すべてのキャラクター';characterFilter.append(all);
 for(const w of worlds.filter(w=>filter==='all'||w.id===filter)){const group=document.createElement('optgroup');group.label=w.shortTitle;for(const c of w.characters){const option=document.createElement('option');option.value=w.id+':'+c.id;const count=assets.filter(a=>a.worldId===w.id&&ArchiveMedia.relatedIds(a).includes(c.id)).length;option.textContent=c.name+'（'+count+'枚）';group.append(option)}characterFilter.append(group)}
 if(character&&!worlds.some(w=>(filter==='all'||w.id===filter)&&w.characters.some(c=>w.id+':'+c.id===character)))character='';
 characterFilter.value=character;
 pairFilter.innerHTML='<option value="">指定なし</option>';pairFilter.disabled=!character;
 const selectedWorld=worlds.find(w=>w.id===character.split(':')[0]);
 for(const c of selectedWorld?.characters||[]){if(c.id===character.split(':')[1])continue;const o=document.createElement('option');o.value=c.id;o.textContent=c.name;pairFilter.append(o)}
 if(![...pairFilter.options].some(o=>o.value===pair))pair='';pairFilter.value=pair;
}
function draw(){
 visible=assets.filter(a=>(filter==='all'||a.worldId===filter)&&(!character||(a.worldId===character.split(':')[0]&&ArchiveMedia.relatedIds(a).includes(character.split(':')[1])))).filter(a=>!pair||((a.characterIds||[]).includes(pair)&&(a.characterIds||[]).includes(character.split(':')[1])));grid.replaceChildren();
 for(const a of visible){const card=document.createElement('article');card.className='gallery-item '+a.type;const button=document.createElement('button');button.className='gallery-open';button.type='button';button.setAttribute('aria-label',a.title+'を拡大');button.innerHTML=`<div class="gallery-picture"><img src="${esc(ArchiveImages.src(a.src))}" alt="${esc(a.title)}" loading="lazy"></div><div class="gallery-caption"><strong>${esc(a.title)}</strong><span>${esc(a.kind)}</span></div>`;button.addEventListener('click',()=>open(visible.indexOf(a)));const tags=document.createElement('div');tags.className='character-tags';tags.setAttribute('aria-label','登場キャラクター');tags.innerHTML=tagLinks(a);card.append(button,tags);grid.append(card)}
 if(!visible.length){const p=document.createElement('p');p.className='gallery-empty';p.textContent='この子の日常は、これから少しずつ。';grid.append(p)}
 document.getElementById('galleryCount').textContent=`VISUAL ARCHIVE / ${String(visible.length).padStart(2,'0')} WORKS`;
 document.querySelectorAll('[data-filter]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.filter===filter)));
 const link=document.getElementById('selectedProfile');link.hidden=!character;if(character){const [w,c]=character.split(':');link.href=ArchiveMedia.profileHref(w,c)}
 const chosen=worlds.filter(w=>filter==='all'||w.id===filter);document.querySelector('.gallery-footnote').textContent=chosen.map(w=>w.title).join(' / ');
 const worldLink=document.querySelector('[data-world-link]');worldLink.href=filter==='all'?'index.html?filter=world':'world.html?id='+encodeURIComponent(filter);worldLink.textContent=chosen.length===1?chosen[0].shortTitle+'の世界':'世界の一覧';
}
function open(i){if(!visible.length)return;index=(i+visible.length)%visible.length;const a=visible[index];img.src=a.src;img.alt=a.title;title.textContent=a.title;meta.textContent=a.kind+(a.photographerId?' · 撮影：'+(worlds.find(w=>w.id===a.worldId)?.characters.find(c=>c.id===a.photographerId)?.name||''):'');document.getElementById('relatedPosts').innerHTML=social.posts.filter(p=>p.mediaId===a.id).length?`<a class="related-social" href="sns/?world=${encodeURIComponent(a.worldId)}&media=${encodeURIComponent(a.id)}">この写真の投稿と会話を読む ↗</a>`:'';document.getElementById('lightboxTags').innerHTML=tagLinks(a);counter.textContent=`${String(index+1).padStart(2,'0')} / ${String(visible.length).padStart(2,'0')}`;if(!box.open)box.showModal();syncURL(a.id)}
document.querySelectorAll('[data-filter]').forEach(b=>b.addEventListener('click',()=>{filter=b.dataset.filter;character='';pair='';updateCharacters();draw();syncURL()}));
characterFilter.addEventListener('change',()=>{character=characterFilter.value;pair='';updateCharacters();draw();syncURL()});
pairFilter.addEventListener('change',()=>{pair=pairFilter.value;draw();syncURL()});
document.querySelector('.lightbox-close').addEventListener('click',()=>box.close());box.addEventListener('close',()=>syncURL());document.querySelector('.prev').addEventListener('click',()=>open(index-1));document.querySelector('.next').addEventListener('click',()=>open(index+1));box.addEventListener('keydown',e=>{if(e.key==='ArrowLeft'){e.preventDefault();open(index-1)}if(e.key==='ArrowRight'){e.preventDefault();open(index+1)}});box.addEventListener('click',e=>{if(e.target===box){const r=box.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)box.close()}});
Promise.all([fetch('data-worlds.json',{cache:'no-store'}).then(r=>{if(!r.ok)throw Error();return r.json()}),ArchiveMedia.load(),fetch('data-social.json').then(r=>{if(!r.ok)throw Error();return r.json()})]).then(([data,media,s])=>{
 social=s;worlds=data;const filterBar=document.querySelector('.gallery-filters');for(const w of worlds){if(!filterBar.querySelector('[data-filter="'+w.id+'"]')){const b=document.createElement('button');b.dataset.filter=w.id;b.textContent=w.shortTitle;b.setAttribute('aria-pressed','false');b.addEventListener('click',()=>{filter=w.id;character='';pair='';updateCharacters();draw();syncURL()});filterBar.append(b)}}assets=ArchiveMedia.galleryItems(worlds,media);
 if(filter!=='all'&&!worlds.some(w=>w.id===filter))filter='all';
 if(character&&!character.includes(':')&&filter!=='all')character=filter+':'+character;
 updateCharacters();draw();const selected=visible.findIndex(a=>a.id===params.get('item'));if(selected>=0)open(selected);
}).catch(()=>{grid.innerHTML='<p>画像を読み込めませんでした。</p>'});
