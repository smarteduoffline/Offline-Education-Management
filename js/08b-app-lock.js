/* অ্যাপ লক — ফোন হারালে বা অন্যের হাতে গেলে লগইন ছাড়া ডেটা খোলা ঠেকাতে।
   • নির্দিষ্ট সময় ব্যবহার না হলে, বা অ্যাপ ব্যাকগ্রাউন্ডে থাকলে, আবার লগইন (PIN/ইমেইল) চাওয়া হয়
   • অ্যাপ বন্ধ করে আবার খুললেও লক থাকে (আগে স্বয়ংক্রিয়ভাবে ঢুকে যেত)
   • যে ব্যবহারকারী আবার ঢুকতে পারবেন না (PIN নেই + ইন্টারনেট নেই) তাঁকে লক করা হয় না, যাতে অফলাইনে আটকে না যান
   সময় প্রতি ডিভাইসে আলাদা: সেটিংস পেজে বদলানো যায় (ডিফল্ট ১৫ মিনিট, বন্ধও করা যায়) */
(function(){
  const KA="smartEduLastActive",KM="smartEduLockMin",KL="smartEduLocked",DEFAULT=15;
  const g=k=>{try{return localStorage.getItem(k)}catch(_){return null}};
  const s=(k,v)=>{try{localStorage.setItem(k,v)}catch(_){}};
  const mins=()=>{const v=g(KM);if(v===null)return DEFAULT;const n=parseInt(v,10);return n>=0&&n<=240?n:DEFAULT};
  const last=()=>parseInt(g(KA)||"0",10)||0;
  const stamp=()=>s(KA,String(Date.now()));
  const me=()=>{try{return activeUser&&Store.users.find(x=>x.id===activeUser.id||x.identifier===activeUser.identifier)}catch(_){return null}};
  /* লক করলে ব্যবহারকারী আবার ঢুকতে পারবেন কি? PIN থাকলে হ্যাঁ; না থাকলে ইন্টারনেট (ইমেইল লগইন) লাগবে */
  const canRelogin=()=>{const u=me();if(!u)return false;return !!u.pinHash||navigator.onLine};
  let lastAct=Date.now(),lastSave=0;

  function lock(){
    if(!unlocked||!mins()||!canRelogin())return;
    s(KL,"1");unlocked=false;
    try{closeM()}catch(_){}
    try{render()}catch(_){}
  }
  const idleMs=()=>Date.now()-Math.max(lastAct,last());

  /* অ্যাপ খোলার সময়: আগে লক ছিল, বা অনেকক্ষণ অব্যবহৃত — লক অবস্থায় শুরু (প্রথম রেন্ডারের আগে) */
  try{
    if(unlocked&&mins()&&canRelogin()){
      const t=last();
      if(g(KL)==="1"||(t&&Date.now()-t>=mins()*60000)){s(KL,"1");unlocked=false}
    }
    if(unlocked)stamp();
  }catch(_){}

  /* ব্যবহারকারীর নড়াচড়া */
  const act=()=>{if(!unlocked)return;const n=Date.now();lastAct=n;if(n-lastSave>5000){lastSave=n;stamp()}};
  ["pointerdown","keydown","touchstart","scroll"].forEach(e=>document.addEventListener(e,act,{passive:true,capture:true}));

  /* ব্যাকগ্রাউন্ড/ফিরে আসা */
  document.addEventListener("visibilitychange",()=>{
    if(document.visibilityState==="hidden"){if(unlocked)stamp()}
    else if(unlocked&&mins()&&last()&&Date.now()-last()>=mins()*60000)lock();
  });
  addEventListener("pagehide",()=>{if(unlocked)stamp()});

  /* খোলা অবস্থায় নিষ্ক্রিয় থাকলে + আনলক হলে লক-চিহ্ন মোছা */
  setInterval(()=>{
    if(unlocked){
      if(g(KL)==="1")try{localStorage.removeItem(KL)}catch(_){}
      const m=mins();if(m&&Date.now()-lastAct>=m*60000)lock();
    }
  },5000);

  /* সেটিংস পেজে নিয়ন্ত্রণ */
  window.setLockMin=v=>{const n=parseInt(v,10);s(KM,String(n>=0&&n<=240?n:DEFAULT));lastAct=Date.now();if(unlocked)stamp()};
  const card=()=>{const m=mins();
    const o=[[0,"বন্ধ"],[1,"১ মিনিট"],[5,"৫ মিনিট"],[15,"১৫ মিনিট"],[30,"৩০ মিনিট"],[60,"১ ঘণ্টা"]];
    return `<div class="card" style="margin-top:14px"><div style="font-weight:700;margin-bottom:6px">🔒 অ্যাপ লক</div><div style="font-size:13px;opacity:.8;margin-bottom:10px">এই ডিভাইসে অ্যাপ এতক্ষণ ব্যবহার না হলে বা ব্যাকগ্রাউন্ডে থাকলে আবার লগইন লাগবে। ফোন হারালে ডেটা সুরক্ষিত থাকে।</div><select onchange="setLockMin(this.value)">${o.map(x=>`<option value="${x[0]}"${x[0]===m?" selected":""}>${x[1]}</option>`).join("")}</select></div>`};
  /* "আমার লগইন তথ্য": কে লগইন করা এবং সুপার অ্যাডমিন কি না — ভুল ভূমিকা ধরতে সুবিধা */
  const idCard=()=>{
    let who="—",role="—",sup="না",chk="";
    try{who=activeUser&&activeUser.identifier||"—";role=myRoleText();sup=isSuper()?"হ্যাঁ":"না";
      chk=window._supOk===true?" (সার্ভার নিশ্চিত করেছে)":window._supOk===false?" (সার্ভার নিশ্চিত করেনি)":""}catch(_){}
    return `<div class="card" style="margin-top:14px"><div style="font-weight:700;margin-bottom:6px">🔎 আমার লগইন তথ্য</div><div style="font-size:13px;line-height:1.8">লগইন: <b>${esc(who)}</b><br>ভূমিকা: <b>${esc(role)}</b><br>সুপার অ্যাডমিন: <b>${sup}</b>${chk}<br>ডেটাসেট: <b>${esc(String(typeof ACT_SID!=="undefined"?ACT_SID:""))}</b></div></div>`};
  if(typeof setng==="function"){const orig=setng;window.setng=function(){return orig.apply(this,arguments)+card()+idCard()}}
})();
