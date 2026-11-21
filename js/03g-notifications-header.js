/* রং/contrast সহায়ক — নিচের লোড-টাইম কলের আগে দরকার */
function _lum(c){
  const m=c.match(/[\d.]+/g);if(!m||m.length<3)return null;
  const a=m.slice(0,3).map(x=>{x=+x/255;return x<=.03928?x/12.92:Math.pow((x+.055)/1.055,2.4)});
  return .2126*a[0]+.7152*a[1]+.0722*a[2];
}
function _bgLum(el){
  for(;el&&el.nodeType===1;el=el.parentElement){
    const bg=getComputedStyle(el).backgroundColor,m=bg.match(/[\d.]+/g);
    if(m&&m.length>=3&&(m.length<4||+m[3]>.6))return _lum(bg);
  }
  return _lum(getComputedStyle(document.body).backgroundColor)||.01;
}
function fixContrast(){
  if(document.documentElement.dataset.theme!=="dark"){
    if(window._cxOn){
      window._cxOn=false;
      document.querySelectorAll("[data-cx]").forEach(e=>{
        if(e.dataset.cx==="2"){if(e.dataset.ocx)e.style.setProperty("color",e.dataset.ocx);else e.style.removeProperty("color")}
        delete e.dataset.cx;delete e.dataset.ocx;
      });
    }
    return;
  }
  window._cxOn=true;
  document.querySelectorAll("#v *,#mt *,#nv *").forEach(el=>{
    if(el.dataset.cx||/^(SVG|PATH|IMG|CANVAS|SCRIPT|STYLE|BR)$/i.test(el.tagName))return;
    const own=[...el.childNodes].some(n=>n.nodeType===3&&n.textContent.trim())||/^(INPUT|SELECT|TEXTAREA|BUTTON)$/.test(el.tagName);
    if(!own)return;
    el.dataset.cx="1";
    const l1=_lum(getComputedStyle(el).color),l2=_bgLum(el);
    if(l1==null||l2==null)return;
    if((Math.max(l1,l2)+.05)/(Math.min(l1,l2)+.05)<3){
      el.dataset.cx="2";el.dataset.ocx=el.style.getPropertyValue("color")||"";
      el.style.setProperty("color",l2<.4?"#e8ecf5":"#13281d","important");
    }
  });
}
new MutationObserver(()=>{if(!_bkQ){_bkQ=true;requestAnimationFrame(()=>{fixBackBtns();fixContrast()})}}).observe(document.body,{childList:true,subtree:true});
fixBackBtns();fixContrast();
window._pendCnt=0;window._renPend=[];window._renAll=[];
const dayOff=n=>{const d=new Date();d.setDate(d.getDate()+n);return d.getFullYear()+"-"+p2(d.getMonth()+1)+"-"+p2(d.getDate())};
function notifItems(){
  const L=[],T=today(),set=hasPerm("settings");
  const add=(sev,ic,t,sub,act,k)=>L.push({sev,ic,t,sub,act,k});
  const SUBGO="stT=4;nav('more','set')";
  const se=subEffEnd();
  if(set&&se){
    const dl=Math.ceil((new Date(se)-new Date(T))/864e5);
    if(dl<0)add(2,"💳","সাবস্ক্রিপশনের মেয়াদ শেষ হয়েছে",se+" তারিখে মেয়াদ শেষ হয়েছে",SUBGO,"sub|exp|"+se);
    else if(dl<=7)add(1,"💳","সাবস্ক্রিপশনের মেয়াদ শেষ হচ্ছে",bn(dl)+" দিন বাকি ("+se+")",SUBGO,"sub|soon|"+se);
  }
  if(set)((S.sub&&S.sub.reqs)||[]).forEach(r=>{
    if(r.status==="pending")add(1,"⏳","নবায়ন অনুরোধ পেন্ডিং",bn(r.months)+" মাস · TXN "+r.txn+" — Super Admin-এর অনুমোদনের অপেক্ষায়",SUBGO,"rq|p|"+r.id);
    else if(r.status==="approved"&&r.approvedOn&&r.approvedOn>=dayOff(-7))add(0,"✅","সাবস্ক্রিপশন নবায়ন অনুমোদিত হয়েছে","মেয়াদ বেড়েছে "+bn(r.months)+" মাস",SUBGO,"rq|a|"+r.id);
    else if(r.status==="rejected"&&r.decidedOn&&r.decidedOn>=dayOff(-14))add(1,"❌","নবায়ন অনুরোধ বাতিল হয়েছে","TXN "+r.txn+" — Super Admin-এর সঙ্গে যোগাযোগ করুন",SUBGO,"rq|r|"+r.id);
  });
  const rp=window._renPend||[];
  if(isSuper()&&rp.length)add(2,"📩",bn(rp.length)+"টি নবায়নের অনুরোধ এসেছে",[...new Set(rp.map(x=>x.inst_name||"প্রতিষ্ঠান"))].join(", "),"satT=5;nav('more','sat')","rn|"+rp.map(x=>x.id).join(","));
  if(isSuper()&&window._pendCnt>0)add(2,"👤",bn(window._pendCnt)+" জন নতুন ইউজার অনুমোদনের অপেক্ষায়","অনুমোদন দিন এবং ভূমিকা/পারমিশন নির্ধারণ করুন","loadApprovalPanel()","pu|"+window._pendCnt);
  const dues=S.fees.filter(f=>due(f)>0);
  if(dues.length){
    const tot=dues.reduce((a,f)=>a+due(f),0),n=new Set(dues.map(f=>f.sid)).size;
    add(2,"💰","বকেয়া ফি: "+bn(n)+" জন শিক্ষার্থী","মোট বকেয়া "+money(tot),"nav('fee')","du|"+n+"|"+tot);
  }
  let od=0;
  S.books.forEach(b=>(b.issues||[]).forEach(i=>{if(!i.ret&&i.due&&i.due<T)od++}));
  if(od)add(1,"📚",bn(od)+"টি বই ফেরতের সময় পার হয়েছে","লাইব্রেরি দেখুন","nav('more','lib')","lb|"+od);
  const lim=dayOff(3),ex=S.exams.filter(e=>e.date==T),ux=S.exams.filter(e=>e.date>T&&e.date<=lim);
  if(ex.length)add(1,"📝","আজ "+bn(ex.length)+"টি পরীক্ষা আছে",ex.map(e=>e.name||e.title||"পরীক্ষা").join(", "),"nav('more','xh')","ex|"+T+"|"+ex.map(e=>e.id).join(","));
  if(ux.length)add(0,"📅","আগামী ৩ দিনে "+bn(ux.length)+"টি পরীক্ষা",ux.map(e=>(e.name||e.title||"পরীক্ষা")+" ("+e.date+")").join(", "),"nav('more','xh')","ux|"+ux.map(e=>e.id+e.date).join(","));
  const lb=S.set&&S.set.lastBk;
  if(hasPerm("backup")&&S.students.length&&(!lb||Date.now()-new Date(lb).getTime()>7*864e5))add(1,"🗄","ব্যাকআপ নেওয়া হয়নি",lb?"শেষ ব্যাকআপ ৭ দিনের বেশি আগে":"এখনও কোনো ব্যাকআপ নেওয়া হয়নি","bkT=0;nav('more','bkp')","bk|"+(lb||"none"));
  const cs=dayOff(-14);
  S.notices.slice().reverse().filter(n=>!n.date||n.date>=cs).slice(0,3).forEach(n=>add(0,"🔔",n.title||n.t||"নোটিশ",n.date||"","nav('more','notice')","nt|"+n.id));
  return L.sort((a,b)=>b.sev-a.sev);
}
const readStore=()=>"smartEduRead:"+ACT_SID+":"+((activeUser&&activeUser.identifier)||"");
function readMap(){try{return JSON.parse(localStorage.getItem(readStore())||"{}")}catch(e){return{}}}
function markNotifRead(L){const m={};L.forEach(x=>m[x.k]=1);try{localStorage.setItem(readStore(),JSON.stringify(m))}catch(e){}}
function notifUnread(){
  if(isSuper()&&(!window._pendT||Date.now()-window._pendT>60000)){window._pendT=Date.now();setTimeout(refreshPending,0)}
  const rm=readMap();
  return notifItems().filter(x=>!rm[x.k]).length;
}
async function refreshPending(){
  try{
    if(!isSuper()||!sb||!navigator.onLine)return;
    const {data:{session}}=await sb.auth.getSession();
    if(!session)return;
    let ch=false;
    const a=await sb.rpc("smartedu_list_user_access");
    if(!a.error){const n=(a.data||[]).filter(u=>u.status==="pending"&&!isSupEmail(u.email)).length;if(n!==window._pendCnt){window._pendCnt=n;ch=true}}
    const b=await sb.rpc("smartedu_list_renewals");
    if(!b.error){
      window._renAll=b.data||[];
      const p=window._renAll.filter(x=>x.status==="pending");
      if(p.map(x=>x.id).join()!==(window._renPend||[]).map(x=>x.id).join())ch=true;
      window._renPend=p;
    }
    if(ch)render();
  }catch(e){}
}
function notifCenter(){
  const L=notifItems(),col=["#3b82f6","#f59e0b","#ef4444"],rm=readMap();
  modal(`<div class="ch"><h2>🔔 নোটিফিকেশন</h2><button class="ob s" onclick="closeM();render()">বন্ধ</button></div>${L.length?L.map(x=>{const nw=!rm[x.k];return `<div class="row" style="border-left:4px solid ${col[x.sev]};padding-left:10px;${nw?"background:#3b82f610":"opacity:.75"}" onclick="closeM();${x.act}"><span style="font-size:22px">${x.ic}</span><div class="f"><b>${esc(x.t)}</b>${nw?' <span class="pl" style="background:#ef4444;color:#fff;font-size:10px">নতুন</span>':""}<small style="display:block;color:var(--mu)">${esc(x.sub||"")}</small></div><span style="color:var(--mu)">›</span></div>`}).join(""):'<div class="em">কোনো নোটিফিকেশন নেই 🎉</div>'}`);
  markNotifRead(L);
  const b=$("bellBd");if(b)b.remove();
}
async function notifOpen(){
  if(isSuper())await Promise.race([refreshPending(),new Promise(r=>setTimeout(r,1500))]);
  notifCenter();
}
setInterval(refreshPending,300000);

const BISM="بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ";
function netTxt(){const n=(S.syncQueue||[]).length;return (navigator.onLine?"● অনলাইন":"● অফলাইন")+(n?" · queue "+bn(n):"")}
function annText(){try{return (JSON.parse(localStorage.getItem("smartEduAnn")||"{}").t)||""}catch(e){return ""}}
function annBarHtml(){
  const t=annText();
  return t?`<div class="annbar"><span class="mq" style="animation-duration:${Math.max(8,Math.round(t.length*.15+6))}s">${esc(t)}</span></div>`:`<div style="flex:1"></div>`;
}
function annApply(){const e=$("annSlot");if(e)e.innerHTML=annBarHtml()}
async function annFetch(){
  try{
    if(!sb||!navigator.onLine)return;
    const {data,error}=await sb.rpc("smartedu_get_broadcast");
    if(error)return;
    const t=String(data||"").trim();
    if(t!==annText()){localStorage.setItem("smartEduAnn",JSON.stringify({t}));annApply()}
  }catch(e){}
}
setTimeout(annFetch,2000);setInterval(annFetch,300000);addEventListener("online",annFetch);
function appHeader(){
  const bell=S.set.bell?`<span class="ib" style="position:relative" onclick="notifOpen()">${ico("bell",21)}${notifUnread()?`<b class="bd" id="bellBd">${bn(notifUnread())}</b>`:""}</span>`:"";
  const tb=S.set.tbtn?`<span class="ib" onclick="themeTog()">${ico(isDark()?"sun":"moon",21)}</span>`:"";
  const row2=tab==="home"?`<div class="hdr2"><div class="hl"><span class="grt">${S.set.greet?"👋 "+greet():""}</span><span class="netIn${navigator.onLine?"":" off"}">${netTxt()}</span></div>${S.set.bism?`<span class="bism" lang="ar" dir="rtl"><span>${BISM}</span></span>`:`<span style="flex:1"></span>`}<div class="hr">${bell}${tb}</div></div>`:"";
  return `<div id="hdr"><div class="hdr1"><span class="ib" onclick="drawer()">${ico("menu",22)}</span><div id="annSlot" style="flex:1;min-width:0;display:flex">${annBarHtml()}</div></div>${row2}</div>`;
}
function clockStr(d){
  let t=d.toLocaleTimeString(LANG=="en"?"en-US":"bn-BD");
  if(LANG!=="en")t=t.replace(/\s*AM$/i," এএম").replace(/\s*PM$/i," পিএম");
  return t;
}
function stAnn(){
  if(!isSuper())return "";
  return `<div class="card"><h2>📢 সকল অ্যাপে ঘোষণা</h2><p class="hint" style="margin:6px 0">এখানে যা লিখবেন তা সব প্রতিষ্ঠানের অ্যাপের ওপরের স্ক্রল বারে দেখাবে (ইন্টারনেট থাকলে, কিছুক্ষণের মধ্যে)। ইমেইল লগইন ও ইন্টারনেট লাগবে।</p><textarea id="annT" rows="3" maxlength="300" placeholder="যেমন: আগামীকাল সব মাদ্রাসা বন্ধ থাকবে...">${esc(annText())}</textarea><div style="display:flex;gap:8px;margin-top:8px"><button class="btn" style="flex:1" onclick="annSave(true)">📢 প্রকাশ করুন</button><button class="btn o" onclick="annSave(false)">বন্ধ করুন</button></div></div>`;
}
async function annSave(on){
  if(!isSuper())return;
  const t=($("annT").value||"").trim();
  if(on&&!t){alert("ঘোষণার লেখা দিন");return}
  try{
    if(!sb){alert("Supabase সংযোগ নেই");return}
    const {data:{session}}=await sb.auth.getSession();
    if(!session){alert("ইমেইল লগইন করা থাকতে হবে। লগআউট করে ইমেইল দিয়ে ঢুকুন।");return}
    const {error}=await sb.rpc("smartedu_set_broadcast",{p_text:t,p_active:!!on});
    if(error)throw error;
    localStorage.setItem("smartEduAnn",JSON.stringify({t:on?t:""}));annApply();
    alert(on?"ঘোষণা প্রকাশিত হয়েছে। সব অ্যাপে কিছুক্ষণের মধ্যে দেখাবে।":"ঘোষণা বন্ধ করা হয়েছে।");
  }catch(e){alert("ব্যর্থ: "+e.message)}
}
let _ip=null;
addEventListener("beforeinstallprompt",e=>{e.preventDefault();_ip=e});
async function installApp(){
  if(_ip){_ip.prompt();try{await _ip.userChoice}catch(e){}_ip=null;return}
  const l=S.school&&S.school.appLink;
  if(l&&/^https?:\/\//i.test(l)){window.open(l,"_blank");return}
  alert("ফোনে ইন্সটল করতে Chrome-এর ⋮ মেনু থেকে \"Install app\" বা \"Add to Home screen\" বাছুন।");
}
