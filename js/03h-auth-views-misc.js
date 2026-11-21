function authMode(m){window._authMode=m;render()}
async function oauthLogin(p){
  if(!sb)return lerr("Supabase সংযোগ তৈরি হয়নি।");
  try{
    const {error}=await sb.auth.signInWithOAuth({provider:p,options:{redirectTo:SITE_URL}});
    if(error)throw error;
  }catch(e){lerr("লগইন ব্যর্থ: "+e.message)}
}
function emailLoginView(){
  const su=window._authMode==="signup",go=su?"emailSignup()":"emailLogin()";
  const logo=(Store.school&&Store.school.logo)?`<img src="${safeDataImage(Store.school.logo)}" style="width:64px;height:64px;object-fit:contain;border-radius:50%">`:`<div style="font-size:40px">🔐</div>`;
  const G='<svg width="22" height="22" viewBox="0 0 48 48"><path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/><path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/><path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/><path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/></svg>';
  const F='<svg width="22" height="22" viewBox="0 0 24 24"><circle cx="12" cy="12" r="12" fill="#1877F2"/><path fill="#fff" d="M16.67 15.47l.53-3.47h-3.33V9.75c0-.95.47-1.88 1.96-1.88h1.51V4.92s-1.37-.23-2.68-.23c-2.74 0-4.53 1.66-4.53 4.66V12H7.08v3.47h3.05v8.39a12.1 12.1 0 003.74 0v-8.39h2.8z"/></svg>';
  return `<div class="login-box"><div class="lg-card">
<div style="text-align:center;margin-bottom:14px">${logo}<div style="font-size:20px;font-weight:700;margin-top:6px">${esc((Store.school&&Store.school.name)||"")}</div><div style="font-size:13px;color:var(--mu)">${su?"Create your account":"Sign in to continue"}</div></div>
<button class="lg-soc" onclick="oauthLogin('google')">${G}Continue with Google</button>
<button class="lg-soc" onclick="oauthLogin('facebook')">${F}Continue with Facebook</button>
<div class="lg-or"><span>OR</span></div>
<label class="lg-lb">Email</label><div class="lg-in"><span>✉️</span><input id="emEmail" type="email" autocomplete="email" placeholder="you@example.com"></div>
<label class="lg-lb">Password</label><div class="lg-in"><span>🔒</span><input id="emPass" type="password" autocomplete="${su?"new-password":"current-password"}" placeholder="••••••••" onkeydown="if(event.key==='Enter')${go}"><span onclick="togPw('emPass',this)" style="cursor:pointer;padding:6px 2px;font-size:18px">👁</span></div>
${su?`<label class="lg-lb">Confirm password</label><div class="lg-in"><span>🔒</span><input id="emPass2" type="password" autocomplete="new-password" placeholder="••••••••"><span onclick="togPw('emPass2',this)" style="cursor:pointer;padding:6px 2px;font-size:18px">👁</span></div>`:""}
<button class="lg-go" onclick="${go}">${su?"Create account":"Sign in"}</button>
${su?"":`<div class="lg-sub"><a onclick="emailReset()">Forgot password?</a></div>`}
<div class="lg-sub">${su?`Already have an account? <b onclick="authMode('signin')">Sign in</b>`:`Need an account? <b onclick="authMode('signup')">Sign up</b>`}</div>
<div id="loginError" style="color:var(--rd);font-size:12px;margin-top:10px;text-align:center"></div>
<div class="lg-sub"><a onclick="setLoginTab('pin')">🔢 PIN দিয়ে লগইন (অফলাইন)</a></div>
<div style="text-align:center;margin-top:12px"><span class="lg-ins" onclick="installApp()">ফোনে অ্যাপ ইন্সটল করুন</span></div>
</div></div>`;
}
(async()=>{try{
  if(!sb)return;
  if(_authRedirect){
    // নতুন ইউজার কনফার্মেশন লিংকে ক্লিক করেছেন: আগের (যেমন সুপার এডমিনের) সেশন/ইউজার বাদ দিয়ে এই ইউজারকেই যাচাই করা হবে
    activeUser=null;unlocked=false;
    try{sessionStorage.removeItem("smartEduUser");localStorage.removeItem("smartEduRemember");applySessionSchool("")}catch(_){}
    loginTab="email";
    try{history.replaceState(null,"",location.pathname)}catch(_){}
    render();
  }else if(activeUser)return;
  const {data:{session}}=await sb.auth.getSession();
  if(session&&session.user&&session.user.email)await completeLogin(session.user,String(session.user.email).toLowerCase());
}catch(e){}})();
if(Store.set.bism===undefined)Store.set.bism=1;
function clockHtml(d){
  let t=d.toLocaleTimeString(LANG=="en"?"en-US":"bn-BD");
  const m=t.match(/\s*(AM|PM)$/i);let ap="";
  if(m){t=t.slice(0,m.index);ap=LANG!=="en"?(m[1].toUpperCase()==="AM"?"এএম":"পিএম"):m[1].toUpperCase()}
  return t+(ap?` <span class="ap">${ap}</span>`:"");
}
function photoCircle(src,px){
  return new Promise(res=>{
    if(!src){res("");return}
    const img=new Image();
    img.onload=()=>{try{
      const c=document.createElement("canvas");c.width=c.height=px;
      const g=c.getContext("2d"),w=img.naturalWidth,h=img.naturalHeight,m=Math.min(w,h);
      g.beginPath();g.arc(px/2,px/2,px/2,0,Math.PI*2);g.closePath();g.clip();
      g.drawImage(img,(w-m)/2,(h-m)/2,m,m,0,0,px,px);
      res(c.toDataURL("image/png"));
    }catch(e){res("")}};
    img.onerror=()=>res("");
    img.src=src;
  });
}
async function needSession(){
  if(!sb){alert("Supabase সংযোগ নেই। ইন্টারনেট পরীক্ষা করুন।");return false}
  try{const {data:{session}}=await sb.auth.getSession();if(session)return true}catch(e){}
  alert("এই কাজের জন্য ইমেইল ও পাসওয়ার্ড দিয়ে লগইন করা থাকতে হবে। PIN দিয়ে লগইন করলে এটি কাজ করে না। লগআউট করে ইমেইল দিয়ে ঢুকুন।");
  return false;
}
function togPw(id,b){const i=$(id);if(!i)return;const h=i.type==="password";i.type=h?"text":"password";b.textContent=h?"🙈":"👁"}
async function usDelR(id){
  if(!isSuper())return;
  const u=(window._remUsers||[]).find(x=>String(x.id)===String(id))||{};
  if(!confirm("এই ইউজারকে সম্পূর্ণ মুছে ফেলবেন"+(u.email?" ("+u.email+")":"")+"?\nতার অ্যাকাউন্ট ও অনুমোদনের তথ্য সার্ভার থেকেও মুছে যাবে।"))return;
  if(!(await needSession()))return;
  try{
    const {data,error}=await sb.rpc("smartedu_delete_user",{target_user_id:id});
    if(error)throw error;
    alert(data===true?"ইউজার মুছে ফেলা হয়েছে।":"মুছে ফেলা যায়নি (Super Admin ইমেইল মোছা যায় না)।");
    window._remAt=0;await loadRemoteUsers();stUl();
  }catch(e){alert("ব্যর্থ: "+e.message)}
}
