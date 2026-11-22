/* সুপার অ্যাডমিন যাচাই: স্ক্রিনে সুপার টুল দেখানোর আগে প্রমাণ চাওয়া হয়
   ১) ইমেইল তালিকায় থাকতে হবে (isSuper)
   ২) Supabase লগইন-সেশনের ইমেইল = অ্যাপের ব্যবহারকারীর ইমেইল হতে হবে (PIN/লোকাল নাম দিয়ে ঢুকলে সুপার নয়)
   ৩) সার্ভারের smartedu_is_super() সত্য ফেরত দিতে হবে
   অফলাইনে/সার্ভার-ত্রুটিতে অজানা থাকে (আগের মতো); স্পষ্টভাবে "না" এলে সুপার টুল বন্ধ। আসল নিয়ন্ত্রণ সবসময় সার্ভারে। */
window._supOk=undefined;
async function superVerify(){
  try{
    window._supOk=undefined;
    if(!activeUser||!isSupEmail(activeUser.identifier))return;
    if(!sb||!navigator.onLine)return;
    const {data:{session}}=await sb.auth.getSession();
    const mail=String(session&&session.user&&session.user.email||"").toLowerCase();
    if(!session||mail!==String(activeUser.identifier).toLowerCase()){window._supOk=false;try{render()}catch(_){}return}
    const {data,error}=await sb.rpc("smartedu_is_super");
    if(error)return;
    window._supOk=(data===true);
    if(window._supOk===false){try{render()}catch(_){}}
  }catch(_){}
}

/* লগইন সম্পন্ন হলে যাচাই */
(function(){
  const base=lgStartSession;
  window.lgStartSession=async function(u,sidSel){
    window._supOk=undefined;
    await base(u,sidSel);
    superVerify();
  };
})();

/* অ্যাপ খোলার সময় (সংরক্ষিত লগইন থাকলে) */
setTimeout(superVerify,1500);
addEventListener("online",()=>{setTimeout(superVerify,800)});

/* সুপার-ইমেইল দিয়ে PIN-লগইন / প্রথম অ্যাডমিন তৈরি বন্ধ — সুপার অ্যাডমিন শুধু ইমেইল-পাসওয়ার্ডে ঢুকবেন */
(function(){
  const msg="এই ইমেইল সংরক্ষিত। ইমেইল ট্যাবে ইমেইল ও পাসওয়ার্ড দিয়ে লগইন করুন।";
  const guard=fn=>function(){
    const id=(typeof loginId==="function")?loginId():"";
    if(isSupEmail(id)){const e=$("loginError");if(e)e.textContent=msg;return}
    return fn.apply(this,arguments);
  };
  window.login=guard(login);
  window.createAccount=guard(createAccount);
})();
