const SUPABASE_URL = "https://akzlqgmxinlqiqecedom.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_h5KmWK6erDa2J9SRu8NWhw_4QDWk624";

// ইমেইল কনফার্মেশন / OAuth লিংক থেকে ফিরে এলে URL-এ টোকেন থাকে — createClient তা মুছে ফেলার আগেই ধরে রাখা
const _authRedirect = (function(){
  try{
    const u = (location.hash||"") + "&" + (location.search||"");
    return /(access_token|[?&#]code|token_hash)=/.test(u) && !/type=recovery/.test(u);
  }catch(e){return false}
})();
// কোনো অনুরোধ অনির্দিষ্টকালের জন্য ঝুলে থাকলে (অপেক্ষা করুন... আটকে গেলে) timeout দিয়ে ত্রুটি দেখাবে
function _wt(p, ms, msg){
  return Promise.race([p, new Promise((_, rej) => setTimeout(() => rej(new Error(msg || "সার্ভার সাড়া দিচ্ছে না। ইন্টারনেট পরীক্ষা করে আবার চেষ্টা করুন।")), ms || 20000))]);
}
let sb = null;
try {
  if (
    window.supabase &&
    typeof window.supabase.createClient === "function" &&
    SUPABASE_URL.startsWith("https://") &&
    !SUPABASE_URL.includes("এখানে_")
  ) {
    sb = window.supabase.createClient(
      SUPABASE_URL,
      SUPABASE_PUBLISHABLE_KEY,
      {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true,
          // Android WebView/APK-তে navigator.locks আটকে গিয়ে লগইন ঝুলে যেত; তাই lock বাইপাস করা হলো
          lock: async (name, acquireTimeout, fn) => await fn()
        }
      }
    );
  }
} catch (e) {
  console.error("Supabase initialization failed:", e);
}
  
  
const MAIN_KEY="smart-edu-v1";
const ACT_SID=localStorage.getItem("smartEduActiveSid")||"main";
const KEY=ACT_SID==="main"?MAIN_KEY:MAIN_KEY+":sch:"+ACT_SID;
let LANG="bn";
const LC=()=>LANG=="en"?"en-GB":"bn-BD";
const SCHEMA_VERSION=2;
