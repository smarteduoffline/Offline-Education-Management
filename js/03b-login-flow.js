let hist=[],curKey="",goingBack=false;
var loginTab=(ACT_SID!=="main"||S.users.length)?"email":"pin";
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
async function completeLogin(authUser,email){
  try{
    if(!authUser){
      await sb.auth.signOut();
      return lerr("ব্যবহারকারীর তথ্য পাওয়া যায়নি।");
    }

    applySessionSchool("");
    let sidSel="";
    let u;

    if(SUPER_ADMIN_EMAILS.includes(email)){
      // সুপার এডমিন সবসময় মূল (main) ডেটাসেটে ঢুকবে। আগে লগইন পেইজের প্রতিষ্ঠান-সিলেক্টর ঠিক করে দিত; এখন সেটি নেই,
      // তাই এই ডিভাইসে শেষ ব্যবহৃত অন্য প্রতিষ্ঠানের ডেটা খুলে সুপার এডমিনের প্রতিষ্ঠান-তালিকা "হারিয়ে" যেত।
      if(ACT_SID!=="main"){
        localStorage.setItem("smartEduActiveSid","main");
        location.reload();
        return;
      }
      u=S.users.find(
        x=>String(x.identifier).toLowerCase()===email
      );

      if(!u){
        u={
          id:uid(),
          identifier:email,
          pin:uid()+uid(),
          role:"admin",
          active:true,
          permissions:[],
          createdAt:Date.now()
        };
        S.users.push(u);
      }else{
        u.role="admin";
        u.active=true;
      }

      save();
    }else{
      const {data:access,error:accessError}=await _wt(sb
        .from("smartedu_user_access")
        .select("status,roles,school_id,perms")
        .eq("user_id",authUser.id)
        .maybeSingle(),20000);

      if(accessError){
        await sb.auth.signOut();
        return lerr("অনুমোদন যাচাই করা যায়নি। আবার চেষ্টা করুন।");
      }

      if(!access || access.status!=="approved"){
        if(access?.status!=="blocked"){
          try{
            const iv=await sb.rpc("smartedu_my_admin_invite");
            if(!iv.error&&iv.data===true){setupInfo={email};unlocked=false;render();return}
          }catch(_){}
        }
        await sb.auth.signOut();
        return lerr(
          access?.status==="blocked"
            ? "আপনার অ্যাকাউন্ট ব্লক করা হয়েছে।"
            : "আপনার অ্যাকাউন্ট Super Admin-এর অনুমোদনের অপেক্ষায় আছে।"
        );
      }

      const tsid=access.school_id||"main";
      if(tsid!==ACT_SID){
        localStorage.setItem("smartEduPending",JSON.stringify({identifier:email,role:(access.roles||[]).includes(UROLES[0])?"admin":"teacher",roleLabel:roleTxt(access.roles),permissions:permsFromAccess(access),sid:tsid}));
        localStorage.setItem("smartEduActiveSid",tsid);
        location.reload();
        return;
      }

      if(email===ADMIN_AUTH_EMAIL.trim().toLowerCase()){
        // আগে "প্রথম যেকোনো অ্যাডমিন" ধরা হত — তাতে সুপার এডমিন বা অন্য ইউজারের পরিচয়ে লগইন হয়ে যেতে পারত।
        // এখন প্রথমে নিজের ইমেইলের রেকর্ড, না থাকলে সুপার এডমিন নয় এমন পুরোনো লোকাল অ্যাডমিন, না থাকলে নতুন রেকর্ড।
        u=S.users.find(x=>String(x.identifier).toLowerCase()===email)
          || S.users.find(x=>x.role==="admin" && x.active!==false && !SUPER_ADMIN_EMAILS.includes(String(x.identifier).toLowerCase()));

        if(!u){
          u={id:uid(),identifier:email,pin:uid()+uid(),role:"admin",active:true,permissions:[],createdAt:Date.now()};
          S.users.push(u);
          save();
        }
        if(u.active===false){
          await sb.auth.signOut();
          return lerr("এই অ্যাকাউন্টটি নিষ্ক্রিয়।");
        }
      }else{
        u=S.users.find(
          x=>String(x.identifier).toLowerCase()===email
        );

        if(!u){
          u={
            id:uid(),
            identifier:email,
            pin:uid()+uid(),
            role:((access.roles||[]).includes(UROLES[0])?"admin":"teacher"),
            roleLabel:roleTxt(access.roles),
            active:true,
            permissions:[],
            createdAt:Date.now()
          };
          S.users.push(u);
          save();
        }

        const wantRole=(access.roles||[]).includes(UROLES[0])?"admin":"teacher";
        if(u.role!==wantRole){u.role=wantRole;save();}
        u.roleLabel=roleTxt(access.roles);
        const pmx=(access.perms&&Object.keys(access.perms).length)?access.perms:pmDefault(access.roles);
        u.permissions=[...new Set(["dashboard"].concat(PMK.filter(k=>pmx[k]).map(k=>PM_TO_PERM[k]).filter(Boolean)))];
        save();
        applySessionSchool(access.school_id);sidSel=access.school_id||"";

        if(u.active===false){
          await sb.auth.signOut();
          return lerr("এই অ্যাকাউন্টটি নিষ্ক্রিয়।");
        }
      }
    }

    activeUser={
      id:u.id,
      identifier:u.identifier,
      role:u.role
    };

    sessionStorage.setItem(
      "smartEduUser",
      JSON.stringify(activeUser)
    );
    localStorage.setItem("smartEduRemember",JSON.stringify({id:u.id,identifier:u.identifier,role:u.role,sid:sidSel}));

    unlocked=true;
    try{await _wt(subFetchSrv(),8000)}catch(_){}
    try{await _wt(pullMySchool(),9000)}catch(_){}
    render();
    syncMySchool();snapSync();try{if(isSuper()&&ACT_SID==="main"){loadRemSch().then(()=>{try{render()}catch(_){}})}}catch(_){}

  }catch(e){lerr("লগইন ব্যর্থ: "+e.message)}
}
