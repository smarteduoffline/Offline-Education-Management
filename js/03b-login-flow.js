let hist=[],curKey="",goingBack=false;
var loginTab=(ACT_SID!=="main"||Store.users.length)?"email":"pin";
const ADMIN_AUTH_EMAIL = "aworker247@gmail.com";
const SITE_URL="https://smarteduoffline.github.io/Offline-Education-Management/";
function loginLink(){return SITE_URL+"#invite"}
if(location.hash==="#invite"||location.hash==="#signup"){loginTab="email";window._authMode="signup";try{history.replaceState(null,"",location.pathname+location.search)}catch(e){}}
function setLoginTab(t){loginTab=t;render()}
function lerr(m){const e=$("loginError");if(e)e.textContent=m}
function loginTabs(){return `<div style="display:flex;gap:6px;margin:6px 0 12px"><button class="${loginTab==="pin"?"btn":"ob"}" style="flex:1" onclick="setLoginTab('pin')">PIN লগইন</button><button class="${loginTab==="email"?"btn":"ob"}" style="flex:1" onclick="setLoginTab('email')">ইমেইল লগইন</button></div>`}
async function emailLogin(){
  if(!sb) return lerr("Supabase সংযোগ তৈরি হয়নি।");

  const email=($("emEmail").value||"").trim().toLowerCase();
  const pw=$("emPass").value||"";

  if(!email||!pw) return lerr("ইমেইল ও পাসওয়ার্ড দিন");
  lerr("অপেক্ষা করুন...");

  try{
    const {data:authData,error}=await _wt(sb.auth.signInWithPassword({
      email,
      password:pw
    }),25000,"সার্ভারে সংযোগ হচ্ছে না। ইন্টারনেট পরীক্ষা করে আবার চেষ্টা করুন।");
    if(error) throw error;

    await completeLogin(authData.user,email);
  }catch(e){
    lerr("লগইন ব্যর্থ: "+e.message);
  }
}
/* ---- লগইন সম্পন্ন করা: ছোট ধাপে ভাগ করা (আচরণ আগের মতোই) ----
   প্রতিটি শাখা {u, sidSel} ফেরত দেয়; null মানে ব্যাপারটা সেখানেই সামলানো হয়েছে (রিলোড/অস্বীকার/সেটআপ) */
const lgLc=s=>String(s||"").toLowerCase();
const lgRole=a=>(a.roles||[]).includes(UROLES[0])?"admin":"teacher";
const lgFindUser=email=>Store.users.find(x=>lgLc(x.identifier)===email);
function lgNewUser(email,fields){const u=Object.assign({id:uid(),identifier:email,pin:uid()+uid(),active:true,permissions:[],createdAt:Date.now()},fields);Store.users.push(u);return u}
async function lgDeny(msg){await sb.auth.signOut();lerr(msg);return null}

/* সুপার এডমিন সবসময় মূল (main) ডেটাসেটে ঢুকবে, নইলে তার প্রতিষ্ঠান-তালিকা হারিয়ে যেত */
function lgSuperAdmin(email){
  if(ACT_SID!=="main"){localStorage.setItem("smartEduActiveSid","main");location.reload();return null}
  let u=lgFindUser(email);
  if(!u)u=lgNewUser(email,{role:"admin"});else{u.role="admin";u.active=true}
  save();
  return {u,sidSel:""};
}

/* মালিক-ইমেইল: নিজের রেকর্ড, না থাকলে সুপার এডমিন নয় এমন পুরোনো লোকাল অ্যাডমিন, না থাকলে নতুন রেকর্ড */
function lgOwnerAdmin(email){
  let u=lgFindUser(email)||Store.users.find(x=>x.role==="admin"&&x.active!==false&&!SUPER_ADMIN_EMAILS.includes(lgLc(x.identifier)));
  if(!u){u=lgNewUser(email,{role:"admin"});save()}
  if(u.active===false)return lgDeny("এই অ্যাকাউন্টটি নিষ্ক্রিয়।");
  return {u,sidSel:""};
}

/* সাধারণ অনুমোদিত ব্যবহারকারী: সার্ভারের ভূমিকা/অনুমতি লোকাল রেকর্ডে মিলিয়ে নেওয়া */
function lgStaff(email,access){
  const role=lgRole(access);
  let u=lgFindUser(email);
  if(!u){u=lgNewUser(email,{role,roleLabel:roleTxt(access.roles)});save()}
  if(u.role!==role){u.role=role;save()}
  u.roleLabel=roleTxt(access.roles);
  const pmx=(access.perms&&Object.keys(access.perms).length)?access.perms:pmDefault(access.roles);
  u.permissions=[...new Set(["dashboard"].concat(PMK.filter(k=>pmx[k]).map(k=>PM_TO_PERM[k]).filter(Boolean)))];
  save();
  applySessionSchool(access.school_id);
  if(u.active===false)return lgDeny("এই অ্যাকাউন্টটি নিষ্ক্রিয়।");
  return {u,sidSel:access.school_id||""};
}

/* সার্ভারে অনুমোদন যাচাই করে সঠিক শাখায় পাঠানো */
async function lgApprovedUser(authUser,email){
  const {data:access,error:accessError}=await _wt(sb.from("smartedu_user_access").select("status,roles,school_id,perms").eq("user_id",authUser.id).maybeSingle(),20000);
  if(accessError)return lgDeny("অনুমোদন যাচাই করা যায়নি। আবার চেষ্টা করুন।");
  if(!access||access.status!=="approved"){
    if(access?.status!=="blocked"){
      try{const iv=await sb.rpc("smartedu_my_admin_invite");if(!iv.error&&iv.data===true){setupInfo={email};unlocked=false;render();return null}}catch(_){}
    }
    return lgDeny(access?.status==="blocked"?"আপনার অ্যাকাউন্ট ব্লক করা হয়েছে।":"আপনার অ্যাকাউন্ট Super Admin-এর অনুমোদনের অপেক্ষায় আছে।");
  }
  const tsid=access.school_id||"main";
  if(tsid!==ACT_SID){
    localStorage.setItem("smartEduPending",JSON.stringify({identifier:email,role:lgRole(access),roleLabel:roleTxt(access.roles),permissions:permsFromAccess(access),sid:tsid}));
    localStorage.setItem("smartEduActiveSid",tsid);
    location.reload();
    return null;
  }
  return email===ADMIN_AUTH_EMAIL.trim().toLowerCase()?lgOwnerAdmin(email):lgStaff(email,access);
}

/* সেশন চালু করা ও প্রাথমিক সিঙ্ক */
async function lgStartSession(u,sidSel){
  activeUser={id:u.id,identifier:u.identifier,role:u.role};
  sessionStorage.setItem("smartEduUser",JSON.stringify(activeUser));
  localStorage.setItem("smartEduRemember",JSON.stringify({id:u.id,identifier:u.identifier,role:u.role,sid:sidSel}));
  unlocked=true;
  try{await _wt(subFetchSrv(),8000)}catch(_){}
  try{await _wt(pullMySchool(),9000)}catch(_){}
  render();
  syncMySchool();snapSync();
  try{if(isSuper()&&ACT_SID==="main"){loadRemSch().then(()=>{try{render()}catch(_){}})}}catch(_){}
}

async function completeLogin(authUser,email){
  try{
    if(!authUser){await sb.auth.signOut();return lerr("ব্যবহারকারীর তথ্য পাওয়া যায়নি।")}
    applySessionSchool("");
    const res=SUPER_ADMIN_EMAILS.includes(email)?lgSuperAdmin(email):await lgApprovedUser(authUser,email);
    if(!res)return;
    await lgStartSession(res.u,res.sidSel);
  }catch(e){lerr("লগইন ব্যর্থ: "+e.message)}
}
