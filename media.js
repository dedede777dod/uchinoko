/* Shared media catalog. Register images and songs in data-media.json only. */
window.ArchiveMedia = (() => {
  let pending;
  function load() {
    if (!pending) pending = fetch('data-media.json', {cache:'no-store'})
      .then(r => { if (!r.ok) throw Error('Media catalog unavailable'); return r.json(); })
      .then(data => { if (!Array.isArray(data.gallery) || !Array.isArray(data.music)) throw Error('Invalid media catalog'); return data; })
      .catch(error => { pending = null; throw error; });
    return pending;
  }
  function select(data, kind, {worldId, tag} = {}) {
    return data[kind].filter(item => (!worldId || item.worldId === worldId) && (!tag || (item.tags || []).includes(tag)));
  }
  function galleryItems(worlds, data, {worldId, characterId} = {}) {
    const knownWorlds = new Set(worlds.map(w => w.id));
    return select(data, 'gallery', {worldId, tag:'daily'})
      .filter(item => item.type === 'scene' && knownWorlds.has(item.worldId) && (!characterId || relatedIds(item).includes(characterId)));
  }
  function relatedIds(item) {return [...(item.characterIds||[]),item.photographerId].filter(Boolean);}
  function charactersFor(worlds, item) {
    const world = worlds.find(w => w.id === item.worldId);
    return (world?.characters || []).filter(c => (item.characterIds || []).includes(c.id));
  }
  function profileHref(worldId, characterId) {
    return 'world.html?id=' + encodeURIComponent(worldId) + '#char-' + encodeURIComponent(characterId);
  }
  return {relatedIds, load, select, galleryItems, charactersFor, profileHref};
})();
