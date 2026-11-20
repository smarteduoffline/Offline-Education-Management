/* PIN ব্রুট-ফোর্স প্রতিরোধ: ৫ বার ভুলের পর সময় বাড়তে থাকা লক।
   মনে রাখুন: PIN শুধু অফলাইন সুবিধা। আসল নিরাপত্তা Supabase Auth + RLS (sql/rls.sql) দেয়। */
(function(){
  const K="smartEduPinLock",MAX=5;
  const get=()=>{try{return JSON.parse(localStorage.getItem(K))||{n:0,until:0}}catch(_){return{n:0,until:0}}};
  const set=v=>{try{localStorage.setItem(K,JSON.stringify(v))}catch(_){}};
  const baseLogin=login;
  window.login=async function(){
    const st=get(),now=Date.now();
    if(st.until>now){const m=Math.ceil((st.until-now)/60000);const e=$("loginError");if(e)e.textContent="অনেকবার ভুল PIN দেওয়া হয়েছে। "+m+" মিনিট পরে চেষ্টা করুন।";return}
    await baseLogin();
    if(unlocked){set({n:0,until:0});return}
    const n=st.n+1,lv=st.lockLevel||1;
    set(n>=MAX?{n:0,until:now+Math.min(30,2*lv)*60000,lockLevel:Math.min(15,lv+1)}:{n,until:0,lockLevel:lv});
  };
})();
