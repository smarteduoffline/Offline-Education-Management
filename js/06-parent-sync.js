/* ================= Parent (অভিভাবক) view ================= */
var pExAll=false,pNtAll=false,pNtOpen="",pq="",pSelId=null;
try{pq=localStorage.getItem("smartEduPq")||""}catch(e){}
function homeHero(){
  const sc=S.school,d=new Date(),nt=S.notices.slice().reverse();
  return `<div class="hero"><button class="hmenu" onclick="go('more')" aria-label="আরও মেনু">${ico("menu",24)}</button><div style="display:flex;gap:8px;padding-right:34px"><div class="lg">${sc.logo?`<img src="${safeDataImage(sc.logo)}">`:"🕌"}</div><div style="min-width:0;flex:1;text-align:center"><h1>${esc(LANG=="en"&&sc.nameEn?sc.nameEn:sc.name)}</h1><small>📍 ${esc(sc.addr)}</small>${sc.est||sc.year?`<small>${sc.est?"স্থাপিত: "+esc(sc.est)+" ":""}${sc.year?" শিক্ষাবর্ষ: "+esc(sc.year):""}</small>`:""}${sc.director?`<small>পরিচালক: ${esc(sc.director)}</small>`:""}${sc.phone?`<small>ফোন: ${esc(sc.phone)}</small>`:""}</div></div>
 <div style="display:flex;justify-content:space-between;margin-top:12px;gap:8px"><div><small>এখন সময়</small><div class="clk" id="clk" style="margin-top:2px">${clockHtml(d)}</div><small>📅 ${bn(fdt(d))} ইং</small></div>${S.set.dates?`<div style="text-align:right"><small>🌙 ${hijri(d).split(", ")[0]}</small><small>${hijri(d).split(", ").slice(1).join(", ")}</small><small>প্রাঃ ${bnDate(d)}</small></div>`:""}</div>
 <div class="tick"><span class="live">● লাইভ</span><div style="flex:1;min-width:0;overflow:hidden">${(t=>`<span class="mq" style="animation-duration:${Math.max(8,Math.round(t.length*.15+6))}s">${esc(t)}</span>`)(S.set.bar||(nt.length?nt[0].title:"কোনো নোটিশ নেই!"))}</div></div></div>`;
}
function parentHome(){
  const T=today(),tex=S.exams.filter(e=>e.date==T),upc=S.exams.filter(e=>e.date>T).sort((a,b)=>a.date>b.date?1:-1);
  const hw=S.hw.filter(h=>h.date==T&&(!homeCls||h.cls==homeCls));
  const nt=S.notices.filter(n=>!n.aud||n.aud==="সকল"||n.aud==="অভিভাবক").slice().reverse();
  const nl=pNtAll?nt:nt.slice(0,3);
  const exl=S.exams.slice().sort((a,b)=>String(b.date).localeCompare(String(a.date))).slice(0,30);
  return homeHero()+`<div class="g2" style="margin-bottom:6px"><div class="card" style="margin:0;background:#e0f2fe;border-left:3px solid #0ea5e9;padding:10px"><small style="color:#0369a1">📖 আজকের পরীক্ষা</small><div style="font-size:13px;margin-top:6px;text-align:center;color:#0369a1">${tex.length?tex.map(e=>esc(e.name)+" — "+esc(e.subject||"")+" ("+esc(e.cls)+")").join(", "):"আজ কোনো পরীক্ষা নেই"}</div></div><div class="card" style="margin:0;background:#e0e7ff;border-left:3px solid #4f46e5;padding:10px"><small style="color:#3730a3">আসন্ন পরীক্ষা</small><div style="font-size:13px;margin-top:6px;text-align:center;color:#3730a3">${upc.length?esc(upc[0].name)+" — "+esc(upc[0].subject||"")+" · "+bn(upc[0].date):"কোনো আসন্ন পরীক্ষা নেই"}</div></div></div>
<div style="text-align:center;margin-bottom:12px"><span class="lk" onclick="pExAll=!pExAll;render()">${pExAll?"কম দেখুন":"সব পরীক্ষা দেখুন"}</span></div>
${pExAll?`<div class="card">${exl.map(e=>`<div class="row"><div class="f"><b>${esc(e.name)}</b> <span class="tag">${esc(e.cls||"")}</span><small>${esc(e.subject||"")} · ${bn(e.date||"")}</small></div></div>`).join("")||'<div class="em">কোনো পরীক্ষা নেই</div>'}</div>`:""}
<div class="card"><div class="ch"><h2>🔔 নোটিশ</h2>${nt.length>3?`<span class="lk" onclick="pNtAll=!pNtAll;render()">${pNtAll?"কম দেখুন":"সব দেখুন →"}</span>`:""}</div>${nl.map(n=>`<div class="row" onclick="pNtOpen=pNtOpen=='${n.id}'?'':'${n.id}';render()"><div class="f">${esc(n.title)}<small>${bn(n.date)}</small>${pNtOpen==n.id&&n.body?`<div style="margin-top:6px;font-size:13px;white-space:pre-wrap">${esc(n.body)}</div>`:""}</div></div>`).join("")||'<div class="em">কোনো নোটিশ নেই</div>'}</div>
<div class="card"><div class="ch"><h2>📗 আজকের পড়া ও বাড়ির কাজ</h2><select style="width:110px;margin:0" onchange="homeCls=this.value;render()"><option value="">শ্রেণি</option>${classes().map(c=>`<option ${homeCls==c?"selected":""}>${esc(c)}</option>`).join("")}</select></div>${hw.map(h=>`<div class="row"><div class="f"><b>${esc(h.subject)}</b> <span class="tag">${esc(h.cls)}</span><small>${esc(h.text)}</small></div></div>`).join("")||'<div class="em">📖<br>আজকের পড়া এখনো আপডেট হয়নি</div>'}</div>
${homeEvChart()}
<div class="hb" onclick="nav('more','cp')"><div class="ic2">📘</div><div class="f"><b>শ্রেণী ও পাঠ্য</b><small style="color:var(--mu);font-size:12px">ক্লাস রুটিন, ইভেন্ট, পড়া ও পাঠ্যবই দেখুন</small></div><span class="pl b">দেখুন</span></div>
<div class="card" onclick="go('portal')" style="display:flex;align-items:center;gap:12px;background:linear-gradient(135deg,#2563eb,#3b82f6);color:#fff;cursor:pointer"><div style="width:48px;height:48px;border-radius:14px;background:rgba(255,255,255,.2);display:flex;align-items:center;justify-content:center;font-size:24px">👪</div><div style="flex:1"><b style="font-size:16px">অভিভাবক পোর্টাল</b><div style="font-size:12px;opacity:.9">সন্তানের ফি, ফলাফল ও উপস্থিতি দেখুন</div></div><span style="font-size:20px">›</span></div>`;
}
function nd(v){let d=String(v==null?"":v).replace(/[০-৯]/g,c=>"০১২৩৪৫৬৭৮৯".indexOf(c)).replace(/\D/g,"");if(d.startsWith("880"))d=d.slice(2);if(d.length===10&&d[0]==="1")d="0"+d;return d}
function pFind(q){
  const d=nd(q);if(d.length<10)return{by:"bad",m:[]};
  const t=d.slice(-10);
  return{by:"ph",m:S.students.filter(s=>s.status!=="নিষ্ক্রিয়"&&Object.keys(s).some(k=>/phone|mobile/i.test(k)&&nd(s[k]).slice(-10)===t))};
}
let pRem=null;
function pErr(e){
  const m=String((e&&(e.message||e.details))||e||""),c=String((e&&e.code)||"");
  if(/not allowed/i.test(m))return "আপনার অ্যাকাউন্টে প্রতিষ্ঠান যুক্ত নেই বা অনুমোদন হয়নি। অ্যাডমিনের সাথে যোগাযোগ করুন।";
  if(c==="PGRST202"||/could not find the function|schema cache/i.test(m))return "সার্ভারে অভিভাবক পোর্টাল সেটআপ করা হয়নি। অ্যাডমিন parent-portal.sql Supabase-এ চালালে কাজ করবে।";
  if(/jwt|session|auth/i.test(m))return "লগইন সেশন শেষ হয়েছে। লগআউট করে আবার লগইন করুন।";
  return "তথ্য লোড করতে সমস্যা হয়েছে। ইন্টারনেট দেখে আবার চেষ্টা করুন।";
}
async function pRemote(){
  const q0=pq,r=pFind(q0);
  if(r.by==="bad"||r.m.length)return;
  if(!sb||!navigator.onLine){pRem={q:q0,err:"ইন্টারনেট সংযোগ নেই। সংযোগ চালু করে আবার খুঁজুন।"};render();return}
  pRem={q:q0,busy:1};render();
  try{
    const {data:{session}}=await sb.auth.getSession();
    if(!session)throw Error("session");
    const {data,error}=await sb.rpc("smartedu_parent_lookup",{p_phone:nd(q0)});
    if(error)throw error;
    if(pq!==q0)return;
    pRem={q:q0,list:(Array.isArray(data)?data:[]).map(x=>Object.assign({},x,{_r:1}))};
  }catch(e){if(pq!==q0)return;pRem={q:q0,err:pErr(e)}}
  render();
}
function pGo(){pq=String($("pq")?.value||"").trim();pSelId=null;pRem=null;try{localStorage.setItem("smartEduPq",pq)}catch(e){}render()}
let _pubT=null,_pubSig="";
function pubParentSoon(){clearTimeout(_pubT);_pubT=setTimeout(pubParents,6000)}
function pThumb(src){return new Promise(res=>{try{const k=src.length+":"+src.slice(-48),C=window._thC=window._thC||{};if(C[k]!==undefined)return res(C[k]);const im=new Image();im.onload=()=>{try{const c=document.createElement("canvas");c.width=96;c.height=112;const x=c.getContext("2d"),f=Math.max(96/im.width,112/im.height),w=im.width*f,h=im.height*f;x.drawImage(im,(96-w)/2,(112-h)/2,w,h);C[k]=c.toDataURL("image/jpeg",.6);res(C[k])}catch(e){res("")}};im.onerror=()=>res("");im.src=src}catch(e){res("")}})}
async function pubParents(){
  try{
    if(!sb||!navigator.onLine||!activeUser||!unlocked||isParent()||isSuper())return;
    if(!(activeUser.role==="admin"||hasPerm("students")))return;
    const {data:{session}}=await sb.auth.getSession();if(!session)return;
    const rows=[];
    for(const s of S.students){
      if(s.status==="নিষ্ক্রিয়")continue;
      const ks=[...new Set(Object.keys(s).filter(k=>/phone|mobile/i.test(k)).map(k=>nd(s[k])).filter(d=>d.length>=10).map(d=>d.slice(-10)))];
      if(!ks.length)continue;
      const b=pBundle(s);let ph="";
      if(s.photo){const src=safeDataImage(s.photo);if(src)ph=await pThumb(src)}
      rows.push({id:String(s.id),k:ks,d:{id:String(s.id),name:s.name||"",roll:s.roll||"",cls:s.cls||"",branch:s.branch||"",gender:s.gender||"",guardian:s.guardian||"",photo:ph,f:b.fs,ft:b.ft,fp:b.fp,m:b.rs,a:b.c,pc:b.pc}});
    }
    let sig=JSON.stringify(rows);
    if(sig===_pubSig)return;
    if(sig.length>6e6){rows.forEach(r=>r.d.photo="");sig=JSON.stringify(rows)}
    const {error}=await sb.rpc("smartedu_publish_parents",{p_rows:rows});
    if(!error)_pubSig=sig;else console.warn("parent publish:",error.message||error);
  }catch(e){console.warn("parent publish failed",e)}
}
addEventListener("online",pubParentSoon);setTimeout(pubParentSoon,5000);
// ===== ☁️ Supabase ক্লাউড সিঙ্ক (স্ন্যাপশট) =====
// অ্যাপ আগের মতোই লোকাল স্টোরেজে চলে। অনলাইনে এলে প্রতিষ্ঠানের ডেটা Supabase-এ জমা হয় এবং নতুন ফোনে লগইন করলে নেমে আসে।
// একাধিক ডিভাইসের পরিবর্তন 3-way merge দিয়ে মেশানো হয় (রেকর্ড আইডি ধরে)।
const SNAP_EXCL=["sync","syncQueue","audit","users","invUsers","schools","updatedAt","schemaVersion","smslog"];
const SNAP_SET_EXCL=["pin","theme","lang","lastBk"];
let _snapBusy=false,_snapT=null;
const _snapMetaKey=()=>KEY+":snapmeta",_snapBaseKey=()=>KEY+":snapbase";
function snapStable(v){
  if(v===null||v===undefined)return "null";
  if(typeof v!=="object")return JSON.stringify(v);
  if(Array.isArray(v))return "["+v.map(snapStable).join(",")+"]";
  return "{"+Object.keys(v).sort().filter(k=>v[k]!==undefined).map(k=>JSON.stringify(k)+":"+snapStable(v[k])).join(",")+"}";
}
const snapEq=(a,b)=>snapStable(a)===snapStable(b);
const _snIsObj=v=>!!v&&typeof v==="object"&&!Array.isArray(v);
const _snId=x=>x.id!==undefined&&x.id!==null?x.id:x.tid; // রিসাইকেল বিনের এন্ট্রির আইডি tid
function _snIdArr(a){
  if(!Array.isArray(a)||!a.every(x=>_snIsObj(x)&&_snId(x)!==undefined&&_snId(x)!==null))return false;
  return new Set(a.map(x=>String(_snId(x)))).size===a.length;
}
function snapM3(b,l,s){
  if(snapEq(l,s))return l;
  if(b!==undefined&&snapEq(b,l))return s;
  if(b!==undefined&&snapEq(b,s))return l;
  if(Array.isArray(l)&&Array.isArray(s)&&_snIdArr(l)&&_snIdArr(s)){
    const bm=new Map((Array.isArray(b)?b:[]).filter(x=>_snIsObj(x)&&_snId(x)!=null).map(x=>[String(_snId(x)),x]));
    const lm=new Map(l.map(x=>[String(_snId(x)),x])),sm=new Map(s.map(x=>[String(_snId(x)),x]));
    const out=[],seen=new Set();
    const take=id=>{
      if(seen.has(id))return;seen.add(id);
      const bi=bm.get(id),li=lm.get(id),si=sm.get(id);
      if(li!==undefined&&si!==undefined)out.push(snapM3(bi,li,si));
      else if(li!==undefined){if(bi!==undefined&&snapEq(bi,li))return;out.push(li)}
      else if(si!==undefined){if(bi!==undefined&&snapEq(bi,si))return;out.push(si)}
    };
    l.forEach(x=>take(String(_snId(x))));s.forEach(x=>take(String(_snId(x))));
    return out;
  }
  if(_snIsObj(l)&&_snIsObj(s)){
    const bo=_snIsObj(b)?b:{},out={};
    for(const k of new Set([...Object.keys(l),...Object.keys(s)])){
      const lv=l[k],sv=s[k],bv=bo[k];
      if(lv!==undefined&&sv!==undefined)out[k]=snapM3(bv,lv,sv);
      else if(lv!==undefined){if(bv!==undefined&&snapEq(bv,lv))continue;out[k]=lv}
      else if(sv!==undefined){if(bv!==undefined&&snapEq(bv,sv))continue;out[k]=sv}
    }
    return out;
  }
  return l; // দুই পক্ষ একই মান বদলালে এই ফোনের মানই থাকে
}
function snapPayload(){
  const o={};
  for(const k of Object.keys(S)){if(!SNAP_EXCL.includes(k))o[k]=S[k]}
  o.set={};for(const k of Object.keys(S.set||{})){if(!SNAP_SET_EXCL.includes(k))o.set[k]=S.set[k]}
  return JSON.parse(JSON.stringify(o));
}
function snapFresh(d){
  return !(d.students&&d.students.length)&&!(d.teachers&&d.teachers.length)&&!(d.fees&&d.fees.length)&&!(d.txns&&d.txns.length)&&!Object.keys(d.att||{}).length;
}
function snapApply(m){
  for(const k of Object.keys(m)){
    if(k==="set"){for(const a of Object.keys(m.set||{}))S.set[a]=m.set[a]}
    else S[k]=m[k];
  }
  Object.assign(S,migrateState(S));
  S.updatedAt=Date.now();
  try{localStorage.setItem(KEY,JSON.stringify(S))}catch(e){console.warn("snap apply save",e)}
}
function snapStatusText(){
  const st=window._snapStatus||{};let m={};try{m=JSON.parse(localStorage.getItem(_snapMetaKey())||"{}")}catch(e){}
  if(st.busy)return "সিঙ্ক চলছে...";
  if(st.err)return "⚠ "+esc(st.err)+(m.ts?" (সর্বশেষ সফল: "+new Date(m.ts).toLocaleString(LC())+")":"");
  return m.ts?"সর্বশেষ সিঙ্ক: "+new Date(m.ts).toLocaleString(LC()):"এখনও সিঙ্ক হয়নি";
}
function snapCfgMain(){return {sid:String(ACT_SID||"main"),mk:_snapMetaKey(),bk:_snapBaseKey(),payload:snapPayload,fresh:snapFresh,apply:snapApply}}
// সুপার এডমিনের নিজস্ব তালিকা (প্রতিষ্ঠান ও আমন্ত্রণ) আলাদা স্ন্যাপশটে ('__super') সংরক্ষিত হয়; শুধু সুপার এডমিন ইমেইল এটি পড়তে/লিখতে পারে
function snapCfgSuper(){return {sid:"__super",mk:KEY+":snapmeta:super",bk:KEY+":snapbase:super",
  payload:()=>JSON.parse(JSON.stringify({schools:S.schools||[],invUsers:S.invUsers||[]})),
  fresh:d=>!(d.schools&&d.schools.length)&&!(d.invUsers&&d.invUsers.length),
  apply:m=>{
    if(Array.isArray(m.schools))S.schools=m.schools;
    if(Array.isArray(m.invUsers))S.invUsers=m.invUsers;
    S.updatedAt=Date.now();
    try{localStorage.setItem(KEY,JSON.stringify(S))}catch(e){console.warn("snap apply super",e)}
    try{writeSchIdx()}catch(e){}
  }}}
async function snapRun(cfg){
  const sid=cfg.sid;
  let meta={},base=null;
  try{meta=JSON.parse(localStorage.getItem(cfg.mk)||"{}")}catch(e){}
  try{base=JSON.parse(localStorage.getItem(cfg.bk)||"null")}catch(e){}
  let changedLocal=false,done=false;
  for(let attempt=0;attempt<4&&!done;attempt++){
    const g=await _wt(sb.rpc("smartedu_snap_get",{p_school:sid}),25000);
    if(g.error)throw g.error;
    const info=g.data||{},local=cfg.payload();
    let merged,sdata=null,serverVer=0;
    if(info.exists){
      serverVer=+info.version;sdata=info.data||{};
      if(meta.ver===serverVer)merged=local;
      else if(!base&&cfg.fresh(local))merged=sdata;
      else merged=snapM3(base||{},local,sdata);
    }else{
      if(cfg.fresh(local)){done=true;break}
      merged=local;
    }
    if(!snapEq(merged,local)){cfg.apply(merged);changedLocal=true}
    if(info.exists&&snapEq(merged,sdata)){
      meta={ver:serverVer,ts:Date.now()};base=merged;done=true;
    }else{
      if(JSON.stringify(merged).length>8*1024*1024)throw new Error("ডেটা ৮ MB-এর বেশি; ছবি বা পুরোনো তথ্য কমান");
      const r=await _wt(sb.rpc("smartedu_snap_put",{p_school:sid,p_data:merged,p_base:serverVer,p_device:String(S.sync&&S.sync.deviceId||"")}),40000);
      if(r.error)throw r.error;
      if(r.data&&r.data.ok){meta={ver:+r.data.version,ts:Date.now()};base=merged;done=true}
    }
  }
  if(done){
    try{localStorage.setItem(cfg.mk,JSON.stringify(meta));if(base)localStorage.setItem(cfg.bk,JSON.stringify(base))}catch(e){console.warn("snap base save",e)}
  }
  return {done,changedLocal};
}
async function snapSync(manual){
  if(_snapBusy)return;
  try{
    if(!sb||!activeUser||!unlocked)return;
  if(isParent()){await feedPull(manual);return}
    if(!navigator.onLine){if(manual)toast("ইন্টারনেট সংযোগ নেই");return}
    _snapBusy=true;window._snapStatus={busy:1};
    const {data:{session}}=await sb.auth.getSession();if(!session){_snapBusy=false;window._snapStatus={};return}
    const r1=await snapRun(snapCfgMain());
    let changed=r1.changedLocal,ok=r1.done;
    if(isSuper()&&ACT_SID==="main"){
      try{const r2=await snapRun(snapCfgSuper());changed=changed||r2.changedLocal;ok=ok&&r2.done}
      catch(e){console.warn("super registry sync failed",e)}
    }
    if(ok){window._snapStatus={};if(manual)toast("✅ ক্লাউডে সিঙ্ক সম্পন্ন");try{syncMySchool()}catch(e){}try{feedPubSoon()}catch(e){}}
    else window._snapStatus={err:"অন্যদের সাথে মেলানো যায়নি, একটু পরে আবার চেষ্টা হবে"};
    if(changed){
      const ae=document.activeElement,tg=ae&&ae.tagName||"";
      if(/INPUT|TEXTAREA|SELECT/.test(tg))toast("অন্য ডিভাইসের নতুন তথ্য এসেছে, ফর্ম শেষ করার পর দেখা যাবে");
      else render();
    }
  }catch(e){
    console.warn("snapshot sync failed",e);
    const m=String(e&&e.message||e);
    window._snapStatus={err:/PGRST202|could not find the function/i.test(m)?"সার্ভারে ক্লাউড সিঙ্ক সেটআপ হয়নি (SQL চালান)":/not allowed/i.test(m)?"এই প্রতিষ্ঠানে সিঙ্কের অনুমতি নেই":m.slice(0,120)};
    if(manual)toast("সিঙ্ক ব্যর্থ: "+window._snapStatus.err);
  }finally{_snapBusy=false}
}
// ম্যানিফেস্ট শর্টকাট: অ্যাপ আইকন চেপে ধরলে সরাসরি অংশ খোলে (?go=att | stu | fee | dues)
let _go="";
try{const _u=new URL(location.href);_go=_u.searchParams.get("go")||"";if(_go){_u.searchParams.delete("go");history.replaceState(null,"",_u.pathname+_u.search+_u.hash)}}catch(e){}
function runGo(){
  if(!_go||!unlocked||!activeUser)return;
  const g=_go;_go="";
  try{
    if(g==="dues"){nav("fee");setTimeout(()=>{try{fbOpen()}catch(e){}},200)}
    else if(g==="att"||g==="stu"||g==="fee")nav(g);
  }catch(e){}
}
setInterval(runGo,700);
// তারিখের ঘর (input type=date) দিন/মাস/বছর ফরম্যাটে দেখানো
function dfFmt(v){return v?bn(fdt(v)):(LANG=="en"?"dd/mm/yyyy":"দিন/মাস/বছর")}
function fitHeroH(){
  try{document.querySelectorAll(".hero h1").forEach(h=>{
    h.style.fontSize="";let fs=19;
    while(fs>11&&h.scrollHeight>h.clientHeight+1){fs-=.5;h.style.fontSize=fs+"px"}
  })}catch(e){}
}
addEventListener("resize",()=>setTimeout(fitHeroH,60));
addEventListener("load",()=>setTimeout(fitHeroH,200));
try{if(document.fonts&&document.fonts.ready)document.fonts.ready.then(()=>setTimeout(fitHeroH,50))}catch(e){}
function dfEnh(){document.querySelectorAll('input[type="date"]').forEach(i=>{const t=dfFmt(i.value);if(i.getAttribute("data-fmt")!==t)i.setAttribute("data-fmt",t);if(i.hasAttribute("data-empty")===!!i.value){if(i.value)i.removeAttribute("data-empty");else i.setAttribute("data-empty","")}if(!i.hasAttribute("data-df"))i.setAttribute("data-df","1")})}
["input","change"].forEach(ev=>document.addEventListener(ev,e=>{if(e.target&&e.target.type==="date")dfEnh()},true));
try{new MutationObserver(()=>{clearTimeout(window._dfT);window._dfT=setTimeout(()=>{dfEnh();fitHeroH()},30)}).observe(document.documentElement,{childList:true,subtree:true})}catch(e){}
setInterval(dfEnh,1500);
// ===== 📢 অভিভাবকদের জন্য প্রকাশ্য ফিড (স্ক্রল বার, নোটিশ, ইভেন্ট, রুটিন, পড়া, পাঠ্যবই) =====
// অ্যাডমিনের অ্যাপ এই তথ্য সার্ভারে প্রকাশ করে; অভিভাবকের অ্যাপ শুধু এটুকু নামায়। ফি/বেতন/শিক্ষার্থীর তথ্য এতে যায় না। (school-feed.sql চালাতে হবে)
let _feedPubT=null,_feedSigP="",_feedSigG="";
function feedPubSoon(){clearTimeout(_feedPubT);_feedPubT=setTimeout(feedPub,5000)}
async function feedPub(){
  try{
    if(!sb||!navigator.onLine||!activeUser||!unlocked||isParent()||isSuper()||activeUser.role!=="admin")return;
    const {data:{session}}=await sb.auth.getSession();if(!session)return;
    const cut=new Date(Date.now()-31*864e5).toISOString().slice(0,10);
    const patch={
      bar:String(S.set.bar||""),
      notices:S.notices.filter(n=>!n.aud||n.aud==="সকল"||n.aud==="অভিভাবক").slice(-30).map(n=>({id:n.id,title:n.title||"",date:n.date||"",body:n.body||"",aud:n.aud||"সকল"})),
      events:S.events.map(e=>({id:e.id,name:e.name||"",type:e.type||"ইভেন্ট",start:e.start||"",end:e.end||"",place:e.place||"",desc:e.desc||""})),
      exams:S.exams.filter(x=>x.date).map(x=>({id:x.id,name:x.name||"",subject:x.subject||"",cls:x.cls||"",date:x.date})),
      routine:S.routine,
      hw:S.hw.filter(h=>(h.date||"")>=cut).map(h=>({id:h.id,cls:h.cls||"",date:h.date||"",subject:h.subject||"",title:h.title||"",lesson:h.lesson||"",homework:h.homework||"",text:h.text||"",teacher:h.teacher||""})),
      tbooks:S.tbooks.map(b=>({id:b.id,name:b.name||"",cls:b.cls||"",subject:b.subject||"",author:b.author||"",code:b.code||"",syllabus:b.syllabus||""}))
    };
    const sig=JSON.stringify(patch);if(sig===_feedSigP)return;
    if(sig.length>1.8e6){console.warn("feed too large");return}
    const r=await sb.rpc("smartedu_publish_feed",{p_patch:patch});
    if(!r.error&&r.data===true)_feedSigP=sig;else console.warn("feed publish:",r.error&&r.error.message||r.data);
  }catch(e){console.warn("feed publish failed",e)}
}
async function feedPull(manual){
  try{
    if(!sb||!navigator.onLine)return;
    const {data:{session}}=await sb.auth.getSession();if(!session)return;
    const r=await sb.rpc("smartedu_get_feed");
    if(r.error){console.warn("feed pull:",r.error.message||r.error);return}
    const f=r.data;if(!f||typeof f!=="object")return;
    const sig=JSON.stringify(f);if(sig===_feedSigG)return;_feedSigG=sig;
    const d=f.data||{};S.set=S.set||{};S.set.bar=String(f.bar||"");
    ["notices","events","exams","routine","hw","tbooks"].forEach(k=>{if(Array.isArray(d[k]))S[k]=d[k]});
    try{localStorage.setItem(KEY,JSON.stringify(S))}catch(e){}
    const ae=document.activeElement,tg=ae&&ae.tagName||"";
    if(!/INPUT|TEXTAREA|SELECT/.test(tg))render();
  }catch(e){console.warn("feed pull failed",e)}
}
addEventListener("online",feedPubSoon);setTimeout(feedPubSoon,6000);
function snapNow(){snapSync(true);setTimeout(()=>{try{render()}catch(e){}},400)}
function snapSoon(){clearTimeout(_snapT);_snapT=setTimeout(()=>snapSync(),8000)}
addEventListener("online",()=>setTimeout(()=>snapSync(),1500));
document.addEventListener("visibilitychange",()=>{if(document.visibilityState==="visible")setTimeout(()=>snapSync(),1200)});
setInterval(()=>{if(document.visibilityState==="visible")snapSync()},120000);

function pPick(id){pSelId=id;render()}
function pBundle(s){
  const all=S.fees.filter(f=>f.sid==s.id).sort((a,b)=>String(b.date||"").localeCompare(String(a.date||"")));
  const ft=all.reduce((a,f)=>a+(+f.amt||0),0),fp=all.reduce((a,f)=>a+(+f.paid||0),0);
  const fs=all.slice(0,60).map(f=>({title:f.title||"",type:f.type||"",date:f.date||"",amt:+f.amt||0,paid:+f.paid||0}));
  const rs=S.exams.filter(e=>e.cls===s.cls&&e.marks&&e.marks[s.id]!==undefined&&e.marks[s.id]!==null&&e.marks[s.id]!=="").sort((a,b)=>String(b.date||"").localeCompare(String(a.date||""))).slice(0,60).map(e=>({name:e.name||"",subject:e.subject||"",date:e.date||"",total:e.total||"",pass:+e.pass||0,m:+e.marks[s.id]}));
  return {fs,ft,fp,rs,c:cnt(s.id,""),pc:pctOf([s.id],"")};
}
function pCard(s){
  const B=s._r?{fs:s.f||[],ft:+s.ft||0,fp:+s.fp||0,rs:s.m||[],c:s.a||{p:0,a:0,l:0,h:0},pc:s.pc}:pBundle(s);
  const fs=B.fs,tot=B.ft,paid=B.fp,dueT=Math.max(0,tot-paid),c=B.c,pc=B.pc,rs=B.rs;
  const f1=(l,v)=>`<div style="min-width:0"><div style="font-size:12px;color:var(--mu)">${l}</div><div style="font-size:15px;font-weight:600;word-break:break-word">${v?esc(v):"—"}</div></div>`;
  const tile=(v,l,bg,col)=>`<div style="background:${bg};border:1px solid ${col}33;border-radius:16px;padding:18px 8px;text-align:center"><div style="font-size:26px;font-weight:700;color:${col}">${v}</div><div style="font-size:13px;color:${col};margin-top:2px">${l}</div></div>`;
  const hd=(ic,t,col)=>`<div style="display:flex;align-items:center;gap:8px;margin-bottom:12px"><span style="font-size:20px">${ic}</span><b style="font-size:17px;color:${col||"var(--tx)"}">${t}</b></div>`;
  const at=(v,l)=>`<div style="background:var(--bg);border-radius:14px;padding:14px 6px;text-align:center"><div style="font-size:24px;font-weight:700">${bn(v)}</div><div style="font-size:13px;color:var(--mu)">${l}</div></div>`;
  return `<div class="card" style="padding:18px">${hd("👤","শিক্ষার্থীর তথ্য","#2563eb")}<div style="display:flex;gap:14px;align-items:flex-start"><div style="width:96px;height:112px;border-radius:14px;overflow:hidden;background:#eef2ff;display:flex;align-items:center;justify-content:center;font-size:40px;flex:none">${s.photo?`<img src="${safeDataImage(s.photo)}" style="width:100%;height:100%;object-fit:cover">`:"👤"}</div><div style="flex:1;display:grid;grid-template-columns:1fr 1fr;gap:12px 10px">${f1("নাম",s.name)}${f1("রোল নম্বর",s.roll)}${f1("শ্রেণি",s.cls)}${f1("শাখা",s.branch)}${f1("লিঙ্গ",s.gender)}${f1("অভিভাবক",s.guardian)}</div></div></div>
<div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin:0 0 12px">${tile(money(tot),"মোট ফি","#eff6ff","#2563eb")}${tile(money(paid),"পরিশোধিত","#f0fdf4","#15803d")}${tile(money(dueT),"বকেয়া","#fef2f2","#b91c1c")}${tile(bn(pc||0)+"%","উপস্থিতি","#faf5ff","#7e22ce")}</div>
<div class="card" style="padding:18px">${hd("💳","ফি বিবরণ")}${fs.length?fs.slice(0,40).map(f=>{const d=(+f.amt||0)-(+f.paid||0);return `<div class="row" style="align-items:center"><div class="f"><b>${esc(f.title||f.type||"ফি")}</b><small>${bn(f.date||"")} · মোট ${money(f.amt)} · পরিশোধিত ${money(f.paid)}</small></div>${d>0?`<span class="pl" style="background:#ffe4e9;color:#be123c">বকেয়া ${money(d)}</span>`:`<span class="pl" style="background:#dcfce7;color:#15803d">পরিশোধিত</span>`}</div>`}).join(""):'<div style="color:var(--mu)">কোনো ফি রেকর্ড নেই।</div>'}</div>
<div class="card" style="padding:18px">${hd("📖","পরীক্ষার ফলাফল","#16a34a")}${rs.length?rs.map(e=>{const m=+e.m,ok=m>=(+e.pass||0);return `<div class="row" style="align-items:center"><div class="f"><b>${esc(e.name)}</b> <span class="tag">${esc(e.subject||"")}</span><small>${bn(e.date||"")}</small></div><div style="text-align:right"><b>${bn(m)}/${bn(e.total||"")}</b><div style="font-size:11px;color:${ok?"#15803d":"#be123c"}">${ok?"উত্তীর্ণ":"অনুত্তীর্ণ"}</div></div></div>`}).join(""):'<div style="color:var(--mu)">কোনো ফলাফল নেই।</div>'}</div>
<div class="card" style="padding:18px">${hd("📋","উপস্থিতির সারসংক্ষেপ","#7e22ce")}<div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">${at(c.p,"উপস্থিত")}${at(c.a,"অনুপস্থিত")}${at(c.l,"বিলম্বে")}${at(c.h,"ছুটি")}</div></div>`;
}
function portal(){
  let r=pq?pFind(pq):null;let res="";
  if(r&&r.by==="ph"&&!r.m.length){
    if(!pRem||pRem.q!==pq){if(sb&&navigator.onLine){setTimeout(pRemote,0);res=`<div class="card" style="text-align:center;color:var(--mu)">⏳ তথ্য খোঁজা হচ্ছে...</div>`}}
    else if(pRem.busy)res=`<div class="card" style="text-align:center;color:var(--mu)">⏳ তথ্য খোঁজা হচ্ছে...</div>`;
    else if(pRem.err)res=`<div class="card" style="color:var(--rd)">${esc(pRem.err)}</div>`;
    else r={by:"ph",m:pRem.list};
  }
  if(r&&!res){
    if(r.by==="bad")res=`<div class="card" style="color:var(--rd)">সঠিক মোবাইল নম্বর লিখুন (যেমন: 01XXXXXXXXX)।</div>`;
    else if(!r.m.length)res=`<div class="card" style="color:var(--rd)">এই ফোন নম্বরে কোনো শিক্ষার্থী পাওয়া যায়নি। বিদ্যালয়ে দেওয়া অভিভাবকের নম্বরটি আবার দেখুন।</div>`;
    else{
      let l=r.m;if(l.length>1&&pSelId&&l.some(x=>x.id==pSelId))l=[l.find(x=>x.id==pSelId)];
      if(l.length>1)res=`<div class="card"><b>একাধিক শিক্ষার্থী পাওয়া গেছে — নির্বাচন করুন</b>${l.map(x=>`<div class="row" onclick="pPick('${x.id}')"><div class="f">${esc(x.name)}<small>শ্রেণি: ${esc(x.cls||"")}${x.branch?" ("+esc(x.branch)+")":""} · রোল: ${esc(x.roll||"—")}</small></div><span style="color:var(--mu)">›</span></div>`).join("")}</div>`;
      else res=(r.m.length>1?`<div style="margin:0 0 8px"><span class="lk" onclick="pSelId=null;render()">← অন্য শিক্ষার্থী নির্বাচন</span></div>`:"")+pCard(l[0]);
    }
  }
  const url=/^https?:/.test(location.href)?location.href.split("#")[0]:"",msg="অভিভাবক পোর্টাল — "+S.school.name+": "+url;
  return `<div style="text-align:center;padding:6px 0 14px"><div style="width:84px;height:84px;border-radius:24px;background:#2563eb;color:#fff;display:inline-flex;align-items:center;justify-content:center;font-size:40px;box-shadow:0 8px 20px #2563eb44">👤</div><h1 style="font-size:28px;margin:12px 0 6px">অভিভাবক পোর্টাল</h1><div style="color:var(--mu);font-size:14px">সন্তানের তথ্য দেখতে বিদ্যালয়ে দেওয়া আপনার ফোন নম্বর লিখুন</div></div>
<div class="card" style="padding:18px"><div style="text-align:center;color:#2563eb;font-weight:700;margin-bottom:10px">📋 কীভাবে ব্যবহার করবেন</div><div style="display:grid;grid-template-columns:22px 1fr;gap:8px 8px;font-size:14px;line-height:1.7"><b style="color:#2563eb">১.</b><div>নিচের বক্সে বিদ্যালয়ে দেওয়া আপনার <b>মোবাইল নম্বর</b> লিখুন।</div><b style="color:#2563eb">২.</b><div><b>খুঁজুন</b> বাটনে ক্লিক করুন।</div><b style="color:#2563eb">৩.</b><div>শিক্ষার্থীর <b>উপস্থিতি, ফলাফল, ফি বিবরণ</b> ও সাম্প্রতিক নোটিশ দেখতে পাবেন।</div></div><div style="background:#eff6ff;color:#1d4ed8;border-radius:12px;padding:10px 12px;font-size:13px;margin-top:12px">💡 ফোন নম্বর মিলছে না বা জানা না থাকলে বিদ্যালয় কর্তৃপক্ষের সাথে যোগাযোগ করুন।</div>${url&&!isParent()?`<div style="border-top:1px solid var(--ln);margin-top:14px;padding-top:12px;text-align:center;color:var(--mu);font-size:13px">এই পেজের লিংক শেয়ার করুন<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:10px"><button class="btn g" onclick="openExt('https://wa.me/?text='+encodeURIComponent(${JSON.stringify(msg).replace(/"/g,"&quot;")}))">💬 WhatsApp</button><button class="btn" onclick="location.href='sms:?body='+encodeURIComponent(${JSON.stringify(msg).replace(/"/g,"&quot;")})">✉ SMS</button></div></div>`:""}</div>
<div class="card" style="padding:18px"><div style="display:flex;gap:10px"><input id="pq" type="tel" inputmode="tel" value="${esc(pq)}" placeholder="অভিভাবকের ফোন নম্বর" style="margin:0;flex:1;min-width:0" onkeydown="if(event.key==='Enter')pGo()"><button class="btn" style="margin:0;flex:none;padding:0 18px" onclick="pGo()">🔍 খুঁজুন</button></div></div>${res}`;
}
function bkForm(id){if(isParent())return;bkId=id||null;const o=S.tbooks.find(x=>x.id==id);bkD=o?{...o}:{cls:bkCls||"",copies:1};drawBk()}
function bkGrab(){["name","cls","subject","author","code","shelf","copies","price","syllabus","note"].forEach(k=>{const e=$("bk_"+k);if(e)bkD[k]=e.value.trim()})}
function drawBk(){
 modal(HND+`<h2 style="text-align:center;font-size:16px;margin-bottom:6px">${bkId?"পাঠ্যবই সম্পাদনা":"নতুন পাঠ্যবই যোগ"}</h2>${fi("বইয়ের নাম","bk_name",bkD.name,"text",1,"বইয়ের নাম লিখুন")}<datalist id="bkcl">${allCls().map(c=>`<option value="${esc(c)}">`).join("")}</datalist><div class="g2" style="margin:0"><div>${fi("শ্রেণী","bk_cls",bkD.cls,"text",1,"যেমন: প্রথম","list=\"bkcl\"")}</div><div>${fi("বিষয়","bk_subject",bkD.subject,"text",0,"বিষয়")}</div></div>${fi("লেখক","bk_author",bkD.author,"text",0,"লেখকের নাম")}<div class="g2" style="margin:0"><div>${fi("বই নম্বর","bk_code",bkD.code,"text",0,"যেমন: TX-001")}</div><div>${fi("তাক নম্বর","bk_shelf",bkD.shelf,"text",0,"যেমন: A-3")}</div><div>${fi("কপি সংখ্যা","bk_copies",bkD.copies,"number",0,"1")}</div><div>${fi("মূল্য (৳)","bk_price",bkD.price,"number",0,"মূল্য")}</div></div>
 <label class="lb">বইয়ের PDF</label><div class="row" style="border:0;padding:2px 0"><button class="btn o s" onclick="bkPick()">⬆ PDF আপলোড করুন</button>${bkD.pdf?`<span style="font-size:12px">✓ ${esc(bkD.pdfName||"PDF")}</span><span onclick="bkGrab();bkD.pdf='';drawBk()" style="color:var(--rd);font-size:13px">✕</span>`:""}</div><input id="pdfin" type="file" accept="application/pdf" style="position:absolute;left:-9999px;opacity:0;width:1px;height:1px" onchange="pdfFile(this.files[0]);this.value=''"><div class="hint">সর্বোচ্চ ১ MB</div>
 <label class="lb">বিবরণ / সিলেবাস (ঐচ্ছিক)</label><textarea id="bk_syllabus" rows="2" placeholder="বিবরণ / সিলেবাস">${esc(bkD.syllabus)}</textarea>${fi("নোট","bk_note",bkD.note,"text",0,"অতিরিক্ত তথ্য (ঐচ্ছিক)")}
 <div class="bt"><button class="btn o" onclick="closeM()">বাতিল</button><button class="btn" onclick="bkSave()">সংরক্ষণ করুন</button></div>${bkId?`<button class="btn r" style="width:100%;margin-top:8px" onclick="bkDel('${bkId}')">মুছে ফেলুন</button>`:""}`);$("mt").onclick=null;
}
function bkPick(){bkGrab();pickPdf((d,n)=>{bkD.pdf=d;bkD.pdfName=n;drawBk()})}
function bkSave(){
 bkGrab();if(!bkD.name||!bkD.cls){alert("বইয়ের নাম ও শ্রেণী দিন");return}
 bkD.copies=+bkD.copies||1;bkD.price=+bkD.price||0;
 try{if(bkId)Object.assign(S.tbooks.find(x=>x.id==bkId),bkD);else S.tbooks.push({id:uid(),...bkD});logA(bkId?"edit":"add","পাঠ্যবই",bkD.name+" ("+bkD.cls+")");save();closeM();render()}catch(e){alert("সংরক্ষণ করা যায়নি: "+e.message)}
}
function bkDel(id){if(!confirm("বইটি মুছবেন?"))return;S.tbooks=S.tbooks.filter(x=>x.id!=id);save();closeM();render()}
async function bkOpen(id){
 const b=S.tbooks.find(x=>x.id==id);if(!b||!b.pdf)return;const P=window.Capacitor&&Capacitor.Plugins,d64=b.pdf.split("base64,")[1];
 if(P&&P.Filesystem&&P.Share){try{const r=await P.Filesystem.writeFile({path:"textbook-"+id+".pdf",data:d64,directory:"CACHE"});await P.Share.share({url:r.uri,title:b.name});return}catch(e){if(e&&/cancel/i.test(e.message||""))return}}
 const bin=atob(d64),u8=new Uint8Array(bin.length);for(let i=0;i<bin.length;i++)u8[i]=bin.charCodeAt(i);openExt(URL.createObjectURL(new Blob([u8],{type:"application/pdf"})));
}
function bkPdf(){
 const l=S.tbooks.filter(b=>!bkCls||b.cls==bkCls);
 printDoc("textbooks",sch()+`<style>.ptb td,.ptb th{border:1px solid #b9e6cd;font-size:12px;padding:6px 7px}</style><div style="text-align:center;margin-bottom:10px">শ্রেণী ও পাঠ্যবই${bkCls?" — "+esc(bkCls):""}</div><table class="ptb" style="border:1px solid #1d4ed8"><tr><th>শ্রেণি</th><th>বইয়ের নাম</th><th>বিষয়</th><th>লেখক</th><th>বই নং</th><th>তাক</th><th>সংখ্যা</th></tr>${l.map(b=>`<tr><td>${esc(b.cls)}</td><td>${esc(b.name)}</td><td>${esc(b.subject||"")}</td><td>${esc(b.author||"")}</td><td>${esc(b.code||"")}</td><td>${esc(b.shelf||"")}</td><td>${bn(b.copies||1)}</td></tr>`).join("")||'<tr><td colspan="7">কোনো বই নেই</td></tr>'}</table>`);
}
