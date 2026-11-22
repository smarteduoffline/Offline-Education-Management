const D=()=>({schemaVersion:SCHEMA_VERSION,school:{name:"আল-উম্মাহ মডেল মাদ্রাসা",addr:"স্টেশন বাজার, নেত্রকোনা"},students:[],teachers:[],att:{},fees:[],notices:[],exams:[],txns:[],books:[],hw:[],staff:[],log:[],smslog:[],sal:[],routine:[],events:[],tbooks:[],exg:{},certs:[],libSales:[],libGoods:[],schools:[],invUsers:[],users:[],sync:{apiUrl:"",apiKey:"",deviceId:"",backoffMs:0,nextRetryAt:0},syncQueue:[],audit:[],updatedAt:0,guides:[],feedback:[],attT:{},set:{theme:"auto",lang:"bn",dates:1,greet:1,bell:1,tbtn:1,bism:1,bar:"",pin:"",stype:"মাদ্রাসা"}});
// SMS/WhatsApp লগ ছোট রাখা: শুধু t,sid,ch,ty,tx(প্রথম ১২০ অক্ষর); সর্বশেষ ৩০০টি
const SMS_TX_MAX=120,SMS_KEEP=300;
function smsTx(t){t=String(t==null?"":t);return t.length>SMS_TX_MAX?t.slice(0,SMS_TX_MAX)+"…":t}
function smsSlim(l){
  if(!l||typeof l!=="object")return null;
  const full=String(l.tx!=null?l.tx:(l.message||""));
  let t=+l.t;if(!t){t=Date.parse(l.created_date||l.updated_date||"")||0}
  const sv=String(l.sent_via||"").toLowerCase();
  return {t,sid:l.sid!=null?l.sid:(l.student_id||""),ch:l.ch||(sv.indexOf("whatsapp")>=0?"wa":"sms"),ty:l.ty||l.type||(/বকেয়া/.test(full)?"বকেয়া":""),tx:smsTx(full)};
}
function smsClean(arr){
  return (Array.isArray(arr)?arr:[]).map(smsSlim).filter(Boolean).sort((a,b)=>(b.t||0)-(a.t||0)).slice(0,SMS_KEEP);
}
function migrateState(raw){
  const base=D(), x=raw&&typeof raw==="object"?raw:{};
  const out={...base,...x,school:{...base.school,...(x.school||{})},set:{...base.set,...(x.set||{})},sync:{...base.sync,...(x.sync||{})}};
  for(const k of ["students","teachers","fees","notices","exams","txns","books","hw","staff","log","smslog","sal","routine","events","tbooks","certs","libSales","libGoods","schools","invUsers","users","syncQueue","audit","guides","feedback"]) if(!Array.isArray(out[k])) out[k]=[];
  if(!out.sync.deviceId) out.sync.deviceId=Date.now().toString(36)+Math.random().toString(36).slice(2,6);
  out.smslog=smsClean(out.smslog);
  delete out._source; // আমদানির পর থেকে যাওয়া ডুপ্লিকেট কপি
  out.schemaVersion=SCHEMA_VERSION;
  return out;
}
let S;try{S=migrateState(JSON.parse(localStorage.getItem(KEY)))}catch(e){S=D()}LANG=(S.set&&S.set.lang)||"bn";
if(ACT_SID!=="main"&&!(S.school&&S.school._init)){try{const r=JSON.parse(localStorage.getItem("smartEduSchIdx")||"[]").find(x=>String(x.id)===ACT_SID);if(r)S.school={name:r.name,addr:r.addr,phone:r.phone,email:r.email,est:r.est,_init:1}}catch(e){}}
/* ---- রিসাইকেল বিন: মুছে যাওয়া রেকর্ড ৩০ দিন জমা থাকে ---- */
const TRC={students:"শিক্ষার্থী",fees:"ফি",staff:"কর্মী",teachers:"শিক্ষক",events:"ইভেন্ট",hw:"বাড়ির কাজ",tbFiles:"পাঠ্য ফাইল",tbooks:"পাঠ্যবই",exams:"পরীক্ষা",certs:"নথি",txns:"আয়-ব্যয়",sal:"বেতন",notices:"নোটিশ",books:"লাইব্রেরি বই",routine:"রুটিন"};
const trKey=(c,x)=>String(c=="routine"?x.cls:x.id);
let _trOwn=null,_trPrev={};
function trMaps(){const m={};for(const c in TRC){const a=Array.isArray(S[c])?S[c]:[];m[c]=new Map(a.filter(x=>x&&trKey(c,x)!="undefined").map(x=>[trKey(c,x),x]))}return m}
function trLabel(c,x){
 if(c=="fees"){const st=(_trPrev.students&&_trPrev.students.get(String(x.sid)))||{};return "ফি"+(st.name?" — "+st.name:"")+(x.amt?" ৳"+x.amt:"")}
 if(c=="routine")return "রুটিন — "+x.cls;
 if(c=="students")return (x.name||"")+(x.cls?" ("+x.cls+(x.roll?", রোল "+x.roll:"")+")":"");
 return x.name||x.title||x.subject||x.cls||String(x.id||"");
}
function trashScan(){
 if(_trOwn!==S){_trOwn=S;_trPrev=trMaps();return}
 const now=Date.now(),cur=trMaps();let add=[];
 for(const c in TRC){_trPrev[c]&&_trPrev[c].forEach((x,k)=>{if(!cur[c].has(k))add.push({tid:uid(),c,item:x,label:trLabel(c,x),at:now})})}
 _trPrev=cur;
 if(!Array.isArray(S.trash))S.trash=[];
 if(add.length){S.trash=S.trash.filter(t=>!add.some(a=>a.c==t.c&&trKey(a.c,a.item)==trKey(t.c,t.item))).concat(add)}
 const lim=now-30*864e5;S.trash=S.trash.filter(t=>t.at>lim).slice(-300);
}
function trRestore(tid){
 if(!isAdm())return;const t=(S.trash||[]).find(x=>x.tid==tid);if(!t)return;
 if(t.c=="fees"&&!S.students.some(x=>String(x.id)==String(t.item.sid))){alert("আগে এই ফি-এর শিক্ষার্থীকে ফেরত আনুন");return}
 const arr=S[t.c]=Array.isArray(S[t.c])?S[t.c]:[];
 if(!arr.some(x=>trKey(t.c,x)==trKey(t.c,t.item)))arr.push(t.item);
 let extra=0;
 if(t.c=="students")S.trash.forEach(f=>{if(f.c=="fees"&&String(f.item.sid)==String(t.item.id)&&Math.abs(f.at-t.at)<5000){if(!S.fees.some(z=>z.id==f.item.id)){S.fees.push(f.item);extra++}f.rm=1}});
 S.trash=S.trash.filter(x=>x.tid!=tid&&!x.rm);
 logA("edit",TRC[t.c]||"রিসাইকেল বিন","ফেরত আনা হয়েছে: "+t.label);
 save();render();toast("↩ ফেরত আনা হয়েছে"+(extra?" ("+bn(extra)+"টি ফি রেকর্ডসহ)":""));
}
function trPurge(tid){if(!isAdm()||!confirm("স্থায়ীভাবে মুছবেন? এটি আর ফেরত আনা যাবে না।"))return;S.trash=(S.trash||[]).filter(x=>x.tid!=tid);save();render()}
function trEmpty(){if(!isAdm()||!confirm("রিসাইকেল বিনের সব তথ্য স্থায়ীভাবে মুছবেন?"))return;S.trash=[];save();render()}
function stBin(){
 if(!isAdm())return `<div class="card"><div class="em">শুধু অ্যাডমিন রিসাইকেল বিন দেখতে পারবেন</div></div>`;
 const l=(S.trash||[]).slice().sort((a,b)=>b.at-a.at),now=Date.now();
 const dt=t=>{const d=new Date(t);return bn(p2(d.getDate())+"/"+p2(d.getMonth()+1)+"/"+d.getFullYear()+" "+p2(d.getHours())+":"+p2(d.getMinutes()))};
 return `<div class="card"><h2>🗑 রিসাইকেল বিন</h2><p class="hint">মুছে ফেলা তথ্য ৩০ দিন পর্যন্ত এখানে থাকে। ফেরত আনলে আগের মতো ফিরে আসবে। শিক্ষার্থী ফেরত আনলে তার ফি রেকর্ডও ফেরত আসে।</p>${l.length?`<button class="ob" style="width:100%;margin-top:6px" onclick="trEmpty()">সব স্থায়ীভাবে মুছুন (${bn(l.length)}টি)</button>`:""}</div>`+
 (l.length?l.map(t=>`<div class="card"><b>${esc(t.label)}</b><div style="font-size:12px;color:var(--mu);margin:2px 0 8px">${esc(TRC[t.c]||t.c)} · মোছা হয়েছে ${dt(t.at)} · ${bn(Math.max(0,30-Math.floor((now-t.at)/864e5)))} দিন বাকি</div><div class="g2" style="margin:0"><button class="btn" onclick="trRestore('${t.tid}')">↩ ফেরত আনুন</button><button class="btn o" onclick="trPurge('${t.tid}')">স্থায়ী মুছুন</button></div></div>`).join(""):`<div class="card"><div class="em">রিসাইকেল বিন খালি</div></div>`);
}
const save=()=>{try{trashScan()}catch(e){console.error("trash",e)}S.updatedAt=Date.now();S.schemaVersion=SCHEMA_VERSION;if(ACT_SID==="main")writeSchIdx();try{let serialized=JSON.stringify(S);if(serialized.length>4.5*1024*1024&&S.trash&&S.trash.length){S.trash=[];serialized=JSON.stringify(S)}if(serialized.length>4.5*1024*1024)throw new Error("storage quota risk");localStorage.setItem(KEY,serialized);if(typeof queueSync==="function")queueSync();if(typeof pubParentSoon==="function")pubParentSoon();if(typeof snapSoon==="function")snapSoon();if(typeof feedPubSoon==="function")feedPubSoon();}catch(e){console.error("Save failed",e);if(typeof toast==="function")toast("ডেটা সংরক্ষণ করা যায়নি—ব্যাকআপ নিন বা ছবির আকার কমান");}};
const uid=()=>Date.now().toString(36)+Math.random().toString(36).slice(2,6);
S.sync={apiUrl:"",apiKey:"",deviceId:"",backoffMs:0,nextRetryAt:0,...(S.sync||{})};if(S.sync.apiKey){sessionStorage.setItem("smartEduApiKey",S.sync.apiKey);S.sync.apiKey=""}S.syncQueue=S.syncQueue||[];S.audit=S.audit||[];
if(!S.sync.deviceId)S.sync.deviceId=uid();
const AUTH_KEY="smart-edu-auth-v2";
let activeUser=null;try{activeUser=JSON.parse(sessionStorage.getItem("smartEduUser")||localStorage.getItem("smartEduRemember")||"null")}catch(_){activeUser=null}
let unlocked=!!activeUser;
if(Array.isArray(S.users)&&S.users.some(u=>Array.isArray(u.roles))){S.invUsers=(S.invUsers||[]).concat(S.users.filter(u=>Array.isArray(u.roles)));S.users=S.users.filter(u=>!Array.isArray(u.roles))}
const fdt=d=>{if(!d)return "";if(d instanceof Date)return String(d.getDate()).padStart(2,"0")+"/"+String(d.getMonth()+1).padStart(2,"0")+"/"+d.getFullYear();const m=/^(\d{4})-(\d{2})-(\d{2})/.exec(String(d));return m?m[3]+"/"+m[2]+"/"+m[1]:String(d)}; // দিন/মাস/বছর
const bn=n=>{let t=String(n);if(/^\d{4}-\d{2}-\d{2}$/.test(t))t=fdt(t);return LANG=="en"?t:t.replace(/\d/g,d=>"০১২৩৪৫৬৭৮৯"[d])};
const today=()=>{const d=new Date();return d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0")};
const esc=s=>String(s??"").replace(/[&<>"'`]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;","`":"&#96;"}[c]));
/* XSS safety net: innerHTML-এ বসানোর আগে বিপজ্জনক ট্যাগ ও javascript:/data: URL সরায় */
const safeHtml=h=>{const t=document.createElement("template");t.innerHTML=String(h??"");
 t.content.querySelectorAll("script,iframe,object,embed,base,meta,link").forEach(n=>n.remove());
 t.content.querySelectorAll("*").forEach(n=>{[...n.attributes].forEach(a=>{const v=a.value.replace(/[\s\u0000-\u001f]/g,"").toLowerCase();
  if(/^(href|src|xlink:href|action|formaction)$/i.test(a.name)&&(v.startsWith("javascript:")||(v.startsWith("data:")&&!/^data:image\/(png|jpe?g|gif|webp);base64,/.test(v))))n.removeAttribute(a.name)})});
 return t.innerHTML};
const jsq=s=>esc(String(s??"").replace(/\\/g,"\\\\").replace(/'/g,"\\'").replace(/\r?\n/g,"\\n"));
const safeUrl=(v,types=["http:","https:","mailto:","tel:","sms:","data:"])=>{try{const u=new URL(String(v||""),location.href);return types.includes(u.protocol)?u.href:""}catch(_){return ""}};
const safeDataImage=v=>{const x=String(v||"");return /^data:image\/(png|jpe?g|gif|webp);base64,[A-Za-z0-9+/=]+$/i.test(x)&&x.length<=8*1024*1024?x:""};
const safeImageSrc=v=>safeDataImage(v);
const sigImg=h=>{const x=S.school&&S.school.sig?safeDataImage(S.school.sig):"";return x?`<img src="${x}" style="max-height:${h||44}px;max-width:150px;object-fit:contain;mix-blend-mode:multiply">`:""};
const safeText=s=>String(s??"").replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g,"");
const safeDataPdf=v=>/^data:application\/pdf;base64,[A-Za-z0-9+/=]+$/i.test(String(v||""))?String(v):"";
const money=n=>"৳"+bn(Number(n||0).toLocaleString("en-US"));
const $=id=>document.getElementById(id);
let tab="home",q="",cls="",adate=today();

const _IP={
home:'<path d="M3 10.5 12 3l9 7.5"/><path d="M5 9.5V21h14V9.5"/><path d="M10 21v-6h4v6"/>',
att:'<rect x="3" y="4.5" width="18" height="16.5" rx="3"/><path d="M8 2.5v4M16 2.5v4M3 10h18"/><path d="m9 15.5 2 2 4-4"/>',
stu:'<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20c0-3.6 2.9-6 6.5-6s6.5 2.4 6.5 6"/><circle cx="17.5" cy="9" r="2.5"/><path d="M17 14.2c2.6.2 4.5 2.1 4.5 5.3"/>',
fee:'<path d="M3 7.5A2.5 2.5 0 0 1 5.5 5H18v3"/><path d="M3 7.5V18a2 2 0 0 0 2 2h14a1 1 0 0 0 1-1v-9a1 1 0 0 0-1-1H5.5A2.5 2.5 0 0 1 3 7.5Z"/><circle cx="16.5" cy="14.5" r="1.2"/>',
bell:'<path d="M6 9a6 6 0 1 1 12 0c0 6 2.5 7.5 2.5 7.5h-17S6 15 6 9Z"/><path d="M10 20a2.2 2.2 0 0 0 4 0"/>',
menu:'<path d="M4 7h16M4 12h16M4 17h10"/>',
moon:'<path d="M20 14.5A8.5 8.5 0 0 1 9.5 4a8.5 8.5 0 1 0 10.5 10.5Z"/>',
sun:'<circle cx="12" cy="12" r="4"/><path d="M12 2.5v2M12 19.5v2M2.5 12h2M19.5 12h2M5.3 5.3l1.4 1.4M17.3 17.3l1.4 1.4M5.3 18.7l1.4-1.4M17.3 6.7l1.4-1.4"/>',
teach:'<path d="m2 9 10-5 10 5-10 5Z"/><path d="M6 11.5V16c0 1.5 3 3 6 3s6-1.5 6-3v-4.5"/>',
staff:'<rect x="3" y="7" width="18" height="13" rx="2.5"/><path d="M9 7V5.5A1.5 1.5 0 0 1 10.5 4h3A1.5 1.5 0 0 1 15 5.5V7M3 13h18"/>',
book:'<path d="M3 5.5C5.5 4 9 4 12 6c3-2 6.5-2 9-.5V19c-2.5-1.5-6-1.5-9 .5-3-2-6.5-2-9-.5Z"/><path d="M12 6v13.5"/>',
exam:'<path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8Z"/><path d="M14 3v5h5M9 13h6M9 17h6"/>',
report:'<path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/>',
lib:'<path d="M5 4h4v16H5zM11 4h4v16h-4z"/><path d="m17 6 3.5 1-3.5 13-3.5-1"/>',
sms:'<path d="M21 12a8 8 0 0 1-11.7 7L4 20.5l1.5-4.8A8 8 0 1 1 21 12Z"/>',
fin:'<path d="m3 17 6-6 4 4 8-8"/><path d="M15 7h6v6"/>',
set:'<path d="M4 6h10M18 6h2M4 12h4M12 12h8M4 18h12M20 18h0"/><circle cx="16" cy="6" r="2"/><circle cx="10" cy="12" r="2"/><circle cx="18" cy="18" r="2"/>',
crown:'<path d="m3 7 4.5 4L12 4l4.5 7L21 7l-2 12H5Z"/>',
info:'<circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8h.01"/>',
video:'<rect x="3" y="6" width="13" height="12" rx="2.5"/><path d="m16 10 5-3v10l-5-3"/>',
out:'<path d="M9 4H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h3M16 8l4 4-4 4M20 12H9"/>',
x:'<path d="M6 6l12 12M18 6 6 18"/>',
chev:'<path d="m6 9 6 6 6-6"/>',
help:'<circle cx="12" cy="12" r="9"/><path d="M9.5 9.5a2.5 2.5 0 1 1 3.5 2.3c-.7.4-1 1-1 1.7M12 17h.01"/>'
};
const ico=(n,z)=>`<svg class="ico" viewBox="0 0 24 24" width="${z||22}" height="${z||22}" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${_IP[n]||""}</svg>`;
const TABS=[["home",ico("home"),"হোম"],["att",ico("att"),"উপস্থিতি"],["stu",ico("stu"),"শিক্ষার্থী"],["fee",ico("fee"),"ফি"],["back","←","ফিরে যান"]];
const stuName=id=>(S.students.find(s=>s.id==id)||{}).name||"—";
const due=f=>f.amt-f.paid;
function loginId(){return String($("loginIdentifier")?.value||"").trim().toLowerCase()}
function validId(v){return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)||/^[A-Za-z0-9_.-]{3,30}$/.test(v)}
function updateNet(){
  const e=$("net");
  if(e){e.className="net"+(navigator.onLine?"":" off");e.textContent=netTxt()}
  document.querySelectorAll(".netIn").forEach(x=>{x.className="netIn"+(navigator.onLine?"":" off");x.textContent=netTxt()});
}
function syncSnapshot(){
 const snap=JSON.parse(JSON.stringify({...S,syncQueue:[],audit:[]}));
 snap.sync={...(snap.sync||{}),apiKey:"",backoffMs:0,nextRetryAt:0};
 return snap;
}
function openSwDb(){return new Promise((resolve,reject)=>{const r=indexedDB.open("smartEduSW",1);r.onupgradeneeded=()=>{if(!r.result.objectStoreNames.contains("jobs"))r.result.createObjectStore("jobs",{keyPath:"id"})};r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error)})}
async function mirrorQueueToSw(){
 if(!S.sync?.apiUrl||!(S.syncQueue||[]).length||!("serviceWorker" in navigator))return;
 try{
  const db=await openSwDb(),tx=db.transaction("jobs","readwrite");
  tx.objectStore("jobs").put({id:"current",url:S.sync.apiUrl,apiKey:sessionStorage.getItem("smartEduApiKey")||"",jwt:sessionStorage.getItem("smartEduJwt")||"",payload:{schoolId:S.school.syncId||"default-school",deviceId:S.sync.deviceId,updatedAt:S.updatedAt,changes:S.syncQueue,data:syncSnapshot()}});
  await new Promise((ok,no)=>{tx.oncomplete=ok;tx.onerror=()=>no(tx.error)});
  const reg=await navigator.serviceWorker.ready;
  if(reg.sync)await reg.sync.register("smart-edu-sync");
 }catch(e){/* IndexedDB/Background Sync unavailable; page sync remains active. */}
}
async function clearSwQueue(){try{const db=await openSwDb(),tx=db.transaction("jobs","readwrite");tx.objectStore("jobs").delete("current")}catch(e){}}
function queueSync(){
 if(!S.sync?.apiUrl)return;
 const snap=syncSnapshot(),signature=JSON.stringify([S.updatedAt,snap]);
 const last=S.syncQueue?.[S.syncQueue.length-1];
 if(last&&last.signature===signature)return;
 S.syncQueue=(S.syncQueue||[]).concat([{id:uid(),deviceId:S.sync.deviceId,updatedAt:S.updatedAt,signature,data:snap}]).slice(-50);
 localStorage.setItem(KEY,JSON.stringify(S));
 updateNet();mirrorQueueToSw();
}
function getSyncToken(){return sessionStorage.getItem("smartEduJwt")||""}
function getSyncApiKey(){return sessionStorage.getItem("smartEduApiKey")||""}
function syncAuthUrl(){return String(S.sync?.apiUrl||"").replace(/\/api\/sync\/?$/i,"")}
function saveSyncSettings(){
 const u=$("syncUrl")?.value.trim()||"",k=$("syncKey")?.value.trim()||"";
 S.sync.apiUrl=u;S.sync.apiKey="";sessionStorage.setItem("smartEduApiKey",k);S.sync.backoffMs=0;S.sync.nextRetryAt=0;
 save();toast(u?"Sync settings সংরক্ষিত":"Sync বন্ধ করা হয়েছে");
}
async function serverLogin(){
 const id=$("serverUser")?.value.trim().toLowerCase()||"",pw=$("serverPass")?.value||"";
 if(!id||!pw)return alert("Server username ও password দিন");
 try{const r=await fetch(syncAuthUrl()+"/api/auth/login",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({identifier:id,password:pw,tenantSlug:$("serverTenant")?.value.trim().toLowerCase()||""})});const out=await r.json().catch(()=>({}));if(!r.ok||!out.token)throw Error(out.error||"login failed");sessionStorage.setItem("smartEduJwt",out.token);sessionStorage.setItem("smartEduServerUser",out.user?.identifier||id);sessionStorage.setItem("smartEduRole",out.user?.role||"");if(out.tenant)sessionStorage.setItem("smartEduTenant",JSON.stringify(out.tenant));activeUser={id:out.user?.id,identifier:out.user?.identifier||id,role:out.user?.role||"teacher",tenantId:out.tenant?.id||null,tenant:out.tenant||null,permissions:out.user?.permissions||[]};sessionStorage.setItem("smartEduUser",JSON.stringify(activeUser));unlocked=true;$("serverPass").value="";toast("JWT login সফল");render()}catch(e){alert("Server login ব্যর্থ: "+e.message)}}
function serverLogout(){sessionStorage.removeItem("smartEduJwt");sessionStorage.removeItem("smartEduServerUser");toast("Server logout সম্পন্ন");render()}
async function vaultEncryptText(text,password){const enc=new TextEncoder(),salt=crypto.getRandomValues(new Uint8Array(16)),iv=crypto.getRandomValues(new Uint8Array(12)),base=await crypto.subtle.importKey("raw",enc.encode(password),"PBKDF2",false,["deriveKey"]),key=await crypto.subtle.deriveKey({name:"PBKDF2",salt,iterations:210000,hash:"SHA-256"},base,{name:"AES-GCM",length:256},false,["encrypt"]),data=await crypto.subtle.encrypt({name:"AES-GCM",iv},key,enc.encode(text)),b=x=>btoa(String.fromCharCode(...x));return {v:1,alg:"AES-GCM",kdf:"PBKDF2-SHA-256",iterations:210000,salt:b(salt),iv:b(iv),data:b(new Uint8Array(data))}}
async function secureBackup(){const pw=prompt("Encrypted backup password (কমপক্ষে ৮ অক্ষর):");if(!pw||pw.length<8)return alert("কমপক্ষে ৮ অক্ষরের password দিন");try{const d={...S,sync:{...S.sync,apiKey:""},syncQueue:[],audit:[]},box=await vaultEncryptText(JSON.stringify(d),pw);shareFile("smart-edu-encrypted-backup.json",JSON.stringify(box),"Encrypted backup")}catch(e){alert("Encrypted backup তৈরি করা যায়নি")}}
let syncBusy=false;
async function syncNow(force=false){
 if(syncBusy||!S.sync?.apiUrl)return;
 if(!navigator.onLine){updateNet();return}
 if(!force&&Number(S.sync.nextRetryAt||0)>Date.now())return;
 syncBusy=true;updateNet();
 const payload={schoolId:S.school.syncId||"default-school",deviceId:S.sync.deviceId,updatedAt:S.updatedAt,changes:S.syncQueue||[],data:syncSnapshot()};
 try{
  const headers={"Content-Type":"application/json"},jwt=getSyncToken(),key=getSyncApiKey();
  if(jwt)headers.Authorization="Bearer "+jwt;else if(key)headers["x-api-key"]=key;
  const r=await fetch(S.sync.apiUrl,{method:"POST",headers,body:JSON.stringify(payload),cache:"no-store"});
  if(!r.ok){if(r.status===401){sessionStorage.removeItem("smartEduJwt");throw Error("JWT expired বা login প্রয়োজন")}throw Error("HTTP "+r.status)}
  const out=await r.json();
  if(out.data&&Number(out.updatedAt||0)>Number(S.updatedAt||0)){
   const localSync={...S.sync,backoffMs:0,nextRetryAt:0};
   S={...D(),...out.data};S.sync={...S.sync,...localSync,apiKey:localSync.apiKey,apiUrl:localSync.apiUrl,deviceId:localSync.deviceId};
  }
  S.syncQueue=[];S.sync.backoffMs=0;S.sync.nextRetryAt=0;
  localStorage.setItem(KEY,JSON.stringify(S));clearSwQueue();
  toast(out.conflict?"সার্ভারের নতুন data নেওয়া হয়েছে":"সিঙ্ক সম্পন্ন");
 }catch(e){
  const old=Number(S.sync.backoffMs||1000),next=Math.min(Math.max(old*2,1000),300000);
  S.sync.backoffMs=next;S.sync.nextRetryAt=Date.now()+next;
  localStorage.setItem(KEY,JSON.stringify(S));
  toast("সিঙ্ক ব্যর্থ — "+Math.ceil(next/1000)+" সেকেন্ড পর আবার চেষ্টা হবে");
 }finally{syncBusy=false;updateNet();if(unlocked)render()}
}
function scheduleSync(){if(navigator.onLine&&S.sync?.apiUrl)setTimeout(()=>syncNow(),300)}
window.addEventListener("online",()=>{updateNet();scheduleSync()});
window.addEventListener("offline",updateNet);
window.addEventListener("visibilitychange",()=>{if(document.visibilityState==="visible")scheduleSync()});
async function vaultDecryptText(box,password){const enc=new TextEncoder(),u=s=>Uint8Array.from(atob(s),c=>c.charCodeAt(0)),base=await crypto.subtle.importKey("raw",enc.encode(password),"PBKDF2",false,["deriveKey"]),key=await crypto.subtle.deriveKey({name:"PBKDF2",salt:u(box.salt),iterations:box.iterations||210000,hash:"SHA-256"},base,{name:"AES-GCM",length:256},false,["decrypt"]),buf=await crypto.subtle.decrypt({name:"AES-GCM",iv:u(box.iv)},key,u(box.data));return new TextDecoder().decode(buf)}
async function vaultOpen(box){
 if(!box||box.alg!=="AES-GCM"||box.kdf!=="PBKDF2-SHA-256"||!/^([A-Za-z0-9+/]+={0,2})$/.test(box.salt||"")||!/^([A-Za-z0-9+/]+={0,2})$/.test(box.iv||"")||!/^([A-Za-z0-9+/]+={0,2})$/.test(box.data||"")||String(box.iv).length<12||String(box.iv).length>32||String(box.salt).length<20||String(box.salt).length>64||String(box.data).length>35000000)throw Error("invalid encrypted backup");
 const iterations=Number(box.iterations||210000);if(!Number.isInteger(iterations)||iterations<100000||iterations>1000000)throw Error("invalid KDF settings");
 const pw=prompt("Encrypted backup password:");if(!pw)throw 0;return JSON.parse(await vaultDecryptText({...box,iterations},pw))
}
async function pasteGo(){try{let d=JSON.parse($("bk").value);if(d&&d.alg==="AES-GCM")d=await vaultOpen(d);if(!validBackup(d))throw 0;if(!restoreBackupData(d))return;closeM();render();alert("রিস্টোর সম্পন্ন")}catch(e){alert("টেক্সটটি সঠিক ব্যাকআপ নয়")}}
const RBAC={
 admin:{label:"অ্যাডমিন",all:true},
 teacher:{label:"শিক্ষক",permissions:["dashboard","attendance","students","classes","exams","reports","messages","notices"]}
};
const PERM_LABEL={dashboard:"ড্যাশবোর্ড",attendance:"উপস্থিতি",students:"শিক্ষার্থী",fees:"ফি",reports:"রিপোর্ট",exams:"পরীক্ষা ও ফলাফল",accounting:"আয় ও ব্যয়",classes:"শ্রেণী ও পাঠ্য/বাড়ির কাজ",library:"লাইব্রেরি",messages:"SMS/WhatsApp",teachers:"শিক্ষক ব্যবস্থাপনা",staff:"কর্মী ব্যবস্থাপনা",notices:"নোটিশ",settings:"সেটিংস",backup:"ব্যাকআপ ও রিসাইকেল বিন"};
function initRBAC(){
 S.users=Array.isArray(S.users)?S.users:[];
 if(!S.users.length&&ACT_SID==="main"){
  let old=null;try{old=JSON.parse(localStorage.getItem(AUTH_KEY)||"null")}catch(e){}
  if(old&&old.identifier&&old.pin)S.users=[{id:uid(),identifier:old.identifier,pin:old.pin,role:old.role||"admin",active:true,permissions:old.permissions||[],createdAt:old.createdAt||Date.now()}];
 }
 if(activeUser){const u=S.users.find(x=>x.id===activeUser.id||x.identifier===activeUser.identifier);if(!u||u.active===false){activeUser=null;unlocked=false;sessionStorage.removeItem("smartEduUser")}else activeUser={id:u.id,identifier:u.identifier,role:u.role}}
}
function userPerms(u=activeUser){if(!u)return[];if(u.role==="admin")return Object.keys(PERM_LABEL);const x=S.users.find(v=>v.id===u.id||v.identifier===u.identifier)||u;return Array.isArray(x.permissions)?x.permissions:RBAC.teacher.permissions}
const SUPER_ADMIN_EMAILS=["tofsirahmedparvez@gmail.com","tofsirahmedparvez1@gmail.com"];
const isSupEmail=e=>SUPER_ADMIN_EMAILS.includes(String(e||"").toLowerCase());
// Super Admin = শুধু উপরের দুই ইমেইল; সাধারণ অ্যাডমিন নয়
/* সুপার অ্যাডমিন: শুধু সুপার-ইমেইল তালিকা থেকে; লোকাল role লেখা দিয়ে নয়।
   _supOk === false মানে সার্ভার/লগইন-সেশন যাচাইয়ে সুপার প্রমাণিত হয়নি (03i-super-verify.js) */
const isSuper=()=>isSupEmail(activeUser?.identifier)&&window._supOk!==false;
const isAdm=()=>activeUser?.role==="admin"||isSuper();
function roleTxt(rs){rs=Array.isArray(rs)?rs:[];const a=UROLES.filter(r=>rs.includes(r));return a.length?a.join(" · "):"শিক্ষক"}
function myRoleText(){if(isSuper())return "Super Admin";const u=S.users.find(v=>v.id===activeUser?.id||v.identifier===activeUser?.identifier);if(u&&u.roleLabel)return u.roleLabel;return activeUser?.role==="admin"?"অ্যাডমিন":"শিক্ষক"}
function hasPerm(p){return activeUser?.role==="admin"||userPerms().includes(p)}
function allow(p){if(hasPerm(p))return true;alert("এই কাজের জন্য আপনার permission নেই");return false}
function myRoleList(){const u=S.users.find(v=>v.id===activeUser?.id||v.identifier===activeUser?.identifier);return String(u&&u.roleLabel||"").split(" · ").map(x=>x.trim()).filter(Boolean)}
function isParent(){if(!activeUser||isSuper()||activeUser.role==="admin")return false;const r=myRoleList();return r.includes("অভিভাবক")&&!r.some(x=>["অ্যাডমিন","সহ-অ্যাডমিন","শিক্ষক","হিসাবরক্ষক"].includes(x))}
const PTABS=[["home",ico("home"),"হোম"],["portal",ico("stu"),"অভিভাবক পোর্টাল"],["back","←","ফিরে যান"]];
function canTab(t){if(isParent())return t==="home"||t==="portal"||t==="more"||t==="back";return t==="more"||t==="back"||hasPerm({home:"dashboard",att:"attendance",stu:"students",fee:"fees"}[t]||"dashboard")}
const MENU_PERM={fh:"accounting",saas:"saas",reports:"reports",xh:"exams",acc:"accounting",cp:"classes",lib:"library",sms:"messages",teach:"teachers",staff:"staff",notice:"notices",set:"settings",bkp:"backup"};
function canMenu(k){if(isParent())return k==="cp";if(k==="bkp")return !!activeUser;if(k==="sat")return isSuper();return hasPerm(MENU_PERM[k]||"dashboard")}
