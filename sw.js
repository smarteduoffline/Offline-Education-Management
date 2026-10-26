// অফলাইন সাপোর্ট: আগে ইন্টারনেট থেকে নতুন ফাইল নেয়, না পেলে সেভ করা কপি দেখায়
const CACHE = "smart-edu-v3";
const CORE = ["./", "./index.html", "./manifest.webmanifest", "./icon-192.png", "./icon-512.png", "./icon-maskable-192.png", "./icon-maskable-512.png"];
self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(CORE)).then(() => self.skipWaiting()));
});
self.addEventListener("activate", e => {
  e.waitUntil(
    caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});
self.addEventListener("fetch", e => {
  const r = e.request;
  if (r.method !== "GET") return;
  e.respondWith(
    fetch(r).then(res => {
      if (res && (res.ok || res.type === "opaque")) {
        const copy = res.clone();
        caches.open(CACHE).then(c => c.put(r, copy)).catch(() => {});
      }
      return res;
    }).catch(() => caches.match(r).then(m => m || (r.mode === "navigate" ? caches.match("./index.html") : Response.error())))
  );
});

// ---- অ্যাপ থেকে পাঠানো বার্তা: নতুন সংস্করণ সঙ্গে সঙ্গে চালু করা ----
self.addEventListener("message", e => {
  if (e.data && e.data.type === "SKIP_WAITING") self.skipWaiting();
});

// ---- ব্যাকগ্রাউন্ড সিঙ্ক (অ্যাপ IndexedDB-তে যে কাজ রেখে যায় তা পাঠায়) ----
function swDb() {
  return new Promise((res, rej) => {
    const r = indexedDB.open("smartEduSW", 1);
    r.onupgradeneeded = () => { if (!r.result.objectStoreNames.contains("jobs")) r.result.createObjectStore("jobs", { keyPath: "id" }); };
    r.onsuccess = () => res(r.result);
    r.onerror = () => rej(r.error);
  });
}
async function runSyncJob() {
  const db = await swDb();
  const job = await new Promise((res, rej) => {
    const q = db.transaction("jobs", "readonly").objectStore("jobs").get("current");
    q.onsuccess = () => res(q.result);
    q.onerror = () => rej(q.error);
  });
  if (!job || !job.url) return;
  const headers = { "Content-Type": "application/json" };
  if (job.jwt) headers.Authorization = "Bearer " + job.jwt;
  else if (job.apiKey) headers["x-api-key"] = job.apiKey;
  const r = await fetch(job.url, { method: "POST", headers, body: JSON.stringify(job.payload), cache: "no-store" });
  if (!r.ok) throw new Error("sync " + r.status);
  await new Promise((ok, no) => {
    const tx = db.transaction("jobs", "readwrite");
    tx.objectStore("jobs").delete("current");
    tx.oncomplete = ok; tx.onerror = () => no(tx.error);
  });
  const cs = await self.clients.matchAll({ includeUncontrolled: true });
  cs.forEach(c => c.postMessage({ type: "SYNC_COMPLETE" }));
}
self.addEventListener("sync", e => {
  if (e.tag === "smart-edu-sync") e.waitUntil(runSyncJob());
});
