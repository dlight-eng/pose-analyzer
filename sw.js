/* Offline support: small files are cached at install, model files on first use. */
const V="pose-v1";
const CORE=["./","index.html","manifest.json","icon-192.png","icon-512.png","mp/pose.js","mp/pose_solution_packed_assets_loader.js","mp/pose_solution_simd_wasm_bin.js","mp/pose_solution_wasm_bin.js","mp/pose_web.binarypb.json"];
self.addEventListener("install",e=>{e.waitUntil(caches.open(V).then(c=>c.addAll(CORE)).then(()=>self.skipWaiting()))});
self.addEventListener("activate",e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==V).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
self.addEventListener("fetch",e=>{
  const r=e.request;if(r.method!=="GET")return;
  const u=new URL(r.url),same=u.origin===self.location.origin,font=/fonts\.(googleapis|gstatic)\.com$/.test(u.hostname);
  if(!same&&!font)return;
  if((same&&u.pathname.indexOf("/mp/")>=0)||font){
    e.respondWith(caches.open(V).then(c=>c.match(r).then(hit=>hit||fetch(r).then(res=>{if(res.ok||res.type==="opaque")c.put(r,res.clone());return res}))));
    return;
  }
  e.respondWith(fetch(r).then(res=>{if(res.ok){const cp=res.clone();caches.open(V).then(c=>c.put(r,cp))}return res}).catch(()=>caches.match(r,{ignoreSearch:true}).then(hit=>hit||caches.match("index.html"))));
});
