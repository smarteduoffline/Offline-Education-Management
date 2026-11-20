function loginView(){const has=S.users.length>0||ACT_SID!=="main";if(recoveryMode)return recoveryView();if(setupInfo)return setupView();if(loginTab==="email")return emailLoginView();return `<div class="login-box"><div class="login-card"><div style="font-size:42px">🔐</div><h1>${has?"লগইন করুন":"প্রথম অ্যাডমিন তৈরি করুন"}</h1><p>${has?"ইউজারনেম/ইমেইল ও PIN দিন":"অ্যাপ পরিচালনার জন্য প্রথম অ্যাডমিন account তৈরি করুন"}</p>${schSel()}${has?loginTabs():""}<input id="loginIdentifier" autocomplete="username" placeholder="ইউজারনেম অথবা ইমেইল"><input id="loginPin" type="password" inputmode="numeric" maxlength="6" placeholder="৪–৬ সংখ্যার PIN" onkeydown="if(event.key==='Enter')${has?"login()":"createAccount()"}"><button class="btn" style="width:100%" onclick="${has?"login()":"createAccount()"}">${has?"লগইন":"অ্যাডমিন তৈরি করুন"}</button>${has?`<button class="ob" style="width:100%;margin-top:10px" onclick="forgotLocal()">PIN ভুলে গেছেন?</button>`:`<button class="ob" style="width:100%;margin-top:10px" onclick="window._authMode='signup';setLoginTab('email')">📧 আমন্ত্রণ পেয়েছেন? ইমেইল দিয়ে অ্যাকাউন্ট খুলুন</button>`}<div id="loginError" style="color:var(--rd);font-size:12px;margin-top:10px"></div></div></div>`}
async function createAccount(){const id=loginId(),pin=String($("loginPin")?.value||"");if(S.users.length)return login();if(!validId(id)){return $("loginError").textContent="সঠিক ইউজারনেম/ইমেইল দিন"}if(!/^\d{4,6}$/.test(pin)){return $("loginError").textContent="PIN ৪–৬ সংখ্যার হতে হবে"}const ph=await hashPin(pin);const u={id:uid(),identifier:id,pinHash:ph,role:"admin",active:true,permissions:[],createdAt:Date.now()};S.users=[u];try{localStorage.setItem(AUTH_KEY,JSON.stringify(u))}catch(_){}activeUser={id:u.id,identifier:u.identifier,role:u.role};sessionStorage.setItem("smartEduUser",JSON.stringify(activeUser));unlocked=true;save();render()}
async function login(){const id=loginId(),pin=String($("loginPin")?.value||""),u=S.users.find(x=>x.identifier===id&&x.active!==false);if(u&&await verifyPin(pin,u.pinHash||u.pin)){if(u.pin&&!u.pinHash){u.pinHash=await hashPin(pin);delete u.pin;save()}activeUser={id:u.id,identifier:u.identifier,role:u.role};sessionStorage.setItem("smartEduUser",JSON.stringify(activeUser));unlocked=true;render()}else{$("loginError").textContent="ইউজারনেম/ইমেইল অথবা PIN সঠিক নয়";$('loginPin').value=""}}
function logout(){activeUser=null;unlocked=false;sessionStorage.removeItem("smartEduUser");localStorage.removeItem("smartEduRemember");applySessionSchool("");try{if(sb)sb.auth.signOut()}catch(e){}render()}
async function forgotLocal(){alert("নিরাপত্তার কারণে local PIN নিজে থেকে reset করা যায় না। পুরোনো PIN জানা থাকলে লগইন করে সেটিংস থেকে PIN পরিবর্তন করুন, অথবা encrypted backup পুনরুদ্ধার করুন।")}
function userPermissionInputs(u={}){return Object.entries(PERM_LABEL).map(([k,v])=>`<label style="display:flex;gap:8px;align-items:center;padding:6px 0;font-size:13px"><input class="cb up" type="checkbox" data-perm="${k}" ${u.permissions?.includes(k)?"checked":""}>${v}</label>`).join("")}
function userForm(id){if(!isSuper()){alert("শুধু Super Admin এই কাজ করতে পারবেন");return}const u=S.users.find(x=>x.id===id)||{role:"teacher",active:true,permissions:[...RBAC.teacher.permissions]};modal(HND+`<h2 style="font-size:16px">${id?"শিক্ষক account সম্পাদনা":"নতুন শিক্ষক account"}</h2><label class="lb">ইউজারনেম/ইমেইল *</label><input id="u_id" value="${esc(u.identifier)}" placeholder="teacher@example.com"><label class="lb">${id?"নতুন PIN (খালি রাখলে অপরিবর্তিত)":"PIN *"}</label><input id="u_pin" type="password" inputmode="numeric" maxlength="6" placeholder="৪–৬ সংখ্যা"><label class="lb">Permissions</label><div class="card" style="padding:8px;max-height:260px;overflow:auto">${userPermissionInputs(u)}</div><div class="bt"><button class="btn o" onclick="closeM()">বাতিল</button><button class="btn" onclick="saveUser('${id||""}')">সংরক্ষণ</button></div>`);$("mt").onclick=null}
async function saveUser(id){if(!isSuper()){alert("শুধু Super Admin এই কাজ করতে পারবেন");return}const identifier=$("u_id").value.trim().toLowerCase(),pin=$("u_pin").value.trim(),dup=S.users.some(x=>x.id!==id&&x.identifier===identifier);if(!validId(identifier)||dup){alert("সঠিক ও unique ইউজারনেম/ইমেইল দিন");return}if(!id&&!/^\d{4,6}$/.test(pin)){alert("PIN ৪–৬ সংখ্যার হতে হবে");return}const permissions=[...document.querySelectorAll(".up:checked")].map(x=>x.dataset.perm);if(id){const u=S.users.find(x=>x.id===id);u.identifier=identifier;if(pin){if(!/^\d{4,6}$/.test(pin)){alert("PIN ৪–৬ সংখ্যার হতে হবে");return}u.pinHash=await hashPin(pin);delete u.pin}u.permissions=permissions}else{S.users.push({id:uid(),identifier,pinHash:await hashPin(pin),role:"teacher",active:true,permissions,createdAt:Date.now()});}logA(id?"edit":"add","ব্যবহারকারী",(id?"আপডেট: ":"নতুন শিক্ষক: ")+identifier);save();closeM();render()}
function toggleUser(id){if(!isSuper()){alert("শুধু Super Admin এই কাজ করতে পারবেন");return}const u=S.users.find(x=>x.id===id);if(!u||u.id===activeUser?.id)return;u.active=u.active===false;save();render()}
function deleteUser(id){if(!isSuper()){alert("শুধু Super Admin এই কাজ করতে পারবেন");return}const u=S.users.find(x=>x.id===id);if(!u||u.id===activeUser?.id)return;if(confirm("এই account মুছবেন?")){S.users=S.users.filter(x=>x.id!==id);save();render()}}
function userPanel(){
 const rows=S.users.map(u=>{
  const status=u.active===false?"নিষ্ক্রিয়":"সক্রিয়";
  const actions=u.role!=="admin"?`<button class="ob s" onclick="userForm('${u.id}')">✏️</button><button class="ob s" onclick="toggleUser('${u.id}')">${u.active===false?"চালু":"বন্ধ"}</button><button class="btn r s" onclick="deleteUser('${u.id}')">✕</button>`:`<span class="tag g">${isSupEmail(u.identifier)?"Super Admin":"মূল অ্যাডমিন"}</span>`;
  return `<div class="row"><div class="f"><b>${esc(u.identifier)}</b><small>${isSupEmail(u.identifier)?"Super Admin":u.role==="admin"?"অ্যাডমিন":"শিক্ষক"} · ${status}</small></div>${actions}</div>`;
 }).join("");
 return `<div class="card">
  <div class="ch">
    <h2>ব্যবহারকারী ও permissions</h2>
    <button class="btn g s" onclick="userForm()">
      ＋ শিক্ষক account
    </button>
  </div>
  ${rows||'<div class="em">কোনো user নেই</div>'}
</div>
${isSuper()?`<div class="card">
  <div class="ch">
    <h2>ইমেইল ব্যবহারকারী</h2>
    <button class="btn g s" onclick="loadApprovalPanel()">
      অনুমোদন পরিচালনা
    </button>
  </div>
  <p>নতুন ব্যবহারকারীর অনুমোদন ও ব্লক করার জন্য খুলুন।</p>
</div>`:""}`;
}

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

window._remUsers=[];window._remSch={};
function schNm(id){const r=window._remSch&&window._remSch[String(id)];if(r&&r.name)return r.name;const x=id?schOf(id):null;return x?x.name:""}
function schAllR(){const a=schAll();return a.concat(Object.values(window._remSch||{}).filter(r=>!a.some(x=>String(x.id)===String(r.id))).map(r=>({id:r.id,name:r.name})))}
async function loadSchExtra(){
  try{
    const r=await sb.rpc("smartedu_list_school_extra");
    if(r.error)return;
    const m={};(r.data||[]).forEach(x=>m[String(x.school_id)]=x);window._remStats=m;
    (S.schools||[]).forEach(sc=>{const x=m[String(sc.id)];if(!x)return;if(x.logo&&!sc.logo)sc.logo=x.logo;if(x.director&&!(sc.admin&&sc.admin.name)){sc.admin=sc.admin||{};sc.admin.name=x.director}});
    if(tab==="more"&&sub==="sat"&&satT===0)render();
  }catch(e){}
}
function schBackfill(list){
  try{
    if(!isSuper()||ACT_SID!=="main"||window._bfDone||!Array.isArray(list))return;
    window._bfDone=1;
    const have=new Set(list.map(x=>String(x.id)));
    (S.schools||[]).filter(x=>x&&x.id!=null&&!have.has(String(x.id))).forEach(sc=>pushSchoolToServer(sc.id,sc));
  }catch(e){}
}
async function loadRemSch(){try{const b=await sb.rpc("smartedu_list_schools");if(!b.error){const m={};(b.data||[]).forEach(x=>m[String(x.id)]=x);window._remSch=m;mergeSchIdx((b.data||[]).map(r=>({id:r.id,name:r.name})));try{if(typeof schReconcile==="function")schReconcile(b.data||[])}catch(_){}try{schBackfill(b.data||[])}catch(_){}loadSchExtra()}}catch(e){}}
// সুপার এডমিনের তালিকায় সার্ভারে নিবন্ধিত প্রতিষ্ঠান না থাকলে (লোকাল ডেটা হারালে/নতুন ডিভাইসে) তা ফিরিয়ে আনে
function schReconcile(list){
  if(!activeUser||!isSuper()||ACT_SID!=="main"||!Array.isArray(list))return;
  let add=0;
  list.forEach(r=>{
    if(!r||r.id==null||String(r.id)==="main")return;
    if(S.schools.some(x=>String(x.id)===String(r.id)))return;
    S.schools.push({id:r.id,name:r.name||"",addr:r.addr||"",phone:r.phone||"",est:r.est||"",email:r.email||"",sub:{}});
    add++;
  });
  if(add){save();try{toast(add+"টি প্রতিষ্ঠান সার্ভার থেকে তালিকায় ফিরিয়ে আনা হয়েছে")}catch(_){}}
}
async function loadRemoteUsers(){
  if(!isSuper()||!sb||!navigator.onLine||window._remBusy)return;
  window._remBusy=1;
  try{
    const {data:{session}}=await sb.auth.getSession();if(!session)return;
    const a=await sb.rpc("smartedu_list_user_access");
    if(!a.error){
      window._apUsers=a.data||[];
      window._remUsers=(a.data||[]).filter(u=>!isSupEmail(u.email)).map(u=>({id:u.user_id,remote:1,status:u.status,name:String(u.email||"").split("@")[0],email:u.email||"",roles:Array.isArray(u.roles)?u.roles:[],sid:u.school_id||"",blocked:u.status==="blocked"?1:0}));
    }
    await loadRemSch();
    window._remAt=Date.now();
  }catch(e){}finally{window._remBusy=0;stUl();stUc();if(typeof satT!=="undefined"&&satT===7&&unlocked)render()}
}
function usRoleR(id){window._fromUsers=1;userRoleForm(id)}
function usStatR(id,st){window._fromUsers=1;changeApprovalStatus(id,st)}
function usrBack(){if(window._fromUsers){window._fromUsers=0;closeM()}else loadApprovalPanel()}
async function afterUsr(){if(window._fromUsers){window._fromUsers=0;closeM();await loadRemoteUsers()}else await loadApprovalPanel()}
async function loadApprovalPanel(){
  window._fromUsers=0;
  if(!isSuper()){
    alert("শুধু Super Admin এই কাজ করতে পারবেন।");
    return;
  }
  try{
    if(!(await needSession()))return;
    const {data:users,error}=await sb.rpc("smartedu_list_user_access");
    if(error) throw error;

    const order={pending:0,approved:1,blocked:2};
    const list=(users||[]).map(u=>isSupEmail(u.email)?{...u,status:"approved"}:u).sort(
      (a,b)=>(order[a.status]??3)-(order[b.status]??3)
    );
    await loadRemSch();
    window._apUsers=list;
    const names={pending:"অনুমোদনের অপেক্ষায়",approved:"অনুমোদিত",blocked:"ব্লক করা"};
    const cnt=k=>list.filter(u=>u.status===k).length;

    const rows=list.map(u=>{
      const isSup=SUPER_ADMIN_EMAILS.includes(String(u.email||"").toLowerCase());
      const sch={name:schNm(u.school_id)};
      const roleTxt=isSup?"Super Admin":((u.roles&&u.roles.length)?u.roles.join(", "):"ভূমিকা নির্ধারণ হয়নি");
      const info=u.status==="approved"?" · "+roleTxt+(sch.name?" · 🏛 "+sch.name:""):"";
      const ok=`<button class="btn g s" onclick="changeApprovalStatus('${u.user_id}','approved')">অনুমোদন</button>`;
      const no=`<button class="btn r s" onclick="changeApprovalStatus('${u.user_id}','blocked')">ব্লক</button>`;
      const rl=`<button class="ob s" onclick="userRoleForm('${u.user_id}')">🔖 ভূমিকা</button>`;
      const buttons=isSup?"":(u.status==="pending"?ok+no:(u.status==="approved"?rl+no:ok));
      return `<div class="row">
        <div class="f">
          <b>${esc(u.email||"ইমেইল নেই")}</b>
          <small>${esc(names[u.status]||u.status)}${esc(info)}</small>
        </div>
        <div style="display:flex;gap:5px;flex-wrap:wrap;align-items:center">${buttons}</div>
      </div>`;
    }).join("");

    modal(`<div class="card">
      <div class="ch">
        <h2>ইমেইল ব্যবহারকারী</h2>
        <button class="ob s" onclick="closeM()">বন্ধ</button>
      </div>
      <small>অপেক্ষায়: ${cnt("pending")} · অনুমোদিত: ${cnt("approved")} · ব্লক: ${cnt("blocked")}</small>
      ${rows||'<div class="em">কোনো ব্যবহারকারী নেই</div>'}
    </div>`);
  }catch(e){
    alert("ব্যবহারকারীর তালিকা আনা যায়নি: "+e.message);
  }
}

async function changeApprovalStatus(userId,status){
  if(!isSuper()){
    alert("শুধু Super Admin এই কাজ করতে পারবেন।");
    return;
  }

  if(!["approved","blocked"].includes(status)) return;

  if(!confirm(
    status==="approved"
      ? "এই ব্যবহারকারীকে অনুমোদন করবেন?"
      : "এই ব্যবহারকারীকে ব্লক করবেন?"
  )) return;

  try{
    if(!(await needSession()))return;
    const {data,error}=await sb.rpc(
      "smartedu_set_user_status",
      {
        target_user_id:userId,
        new_status:status
      }
    );

    if(error) throw error;

    if(data!==true){
      alert("ব্যবহারকারীর অবস্থা পরিবর্তন করা যায়নি।");
      return;
    }

    alert(
      status==="approved"
        ? "ব্যবহারকারী অনুমোদিত হয়েছেন।"
        : "ব্যবহারকারী ব্লক হয়েছেন।"
    );

    await afterUsr();

  }catch(e){
    alert("পরিবর্তন ব্যর্থ: "+e.message);
  }
}
const PM_TO_PERM={stu:"students",att:"attendance",exam:"exams",res:"exams",card:"reports",cal:"exams",qb:"classes",lib:"library",not:"notices",msg:"messages",slog:"messages",sdash:"messages",fee:"fees",fin:"accounting",pay:"fees",tch:"teachers",stf:"staff",set:"settings",bk:"backup"};
function pmDefault(roles){
  const o={};PMK.forEach(k=>o[k]=false);
  (roles&&roles.length?roles:[UROLES[2]]).forEach(r=>{const d=defPerm(r);PMK.forEach(k=>{if(d[k])o[k]=true})});
  return o;
}
function urSet(o){document.querySelectorAll("#ur_pm .st-sw").forEach(e=>e.classList.toggle("on",!!o[e.dataset.k]))}
function urRoles(){return UROLES.filter((r,i)=>$("ur_r"+i).checked)}
function urAll(v){const o={};PMK.forEach(k=>o[k]=!!v);urSet(o)}
function userRoleForm(id){
  const u=(window._apUsers||[]).find(x=>x.user_id===id);
  if(!u) return;
  const pm=(u.perms&&Object.keys(u.perms).length)?u.perms:pmDefault(u.roles);
  modal(`<span onclick="usrBack()" style="float:right;font-size:22px">×</span><h2>🛡️ অ্যাক্সেস পারমিশন নির্ধারণ</h2><small>${esc(u.email||"")}</small>
<label class="lb">ভূমিকা (একাধিক নির্বাচন করা যাবে)</label><div class="g2" style="margin-bottom:8px">${UROLES.map((r,i)=>`<label class="st-tg" style="margin:0"><input type="checkbox" id="ur_r${i}" style="width:auto;margin:0" onchange="urSet(pmDefault(urRoles()))" ${(u.roles||[]).includes(r)?"checked":""}>${r}</label>`).join("")}</div><div class="hint">একসাথে একাধিক ভূমিকা দিলে ঐ ব্যক্তি সবগুলো মডিউলে অ্যাক্সেস পাবেন।</div>
<div style="font-size:13px;color:var(--mu);margin:10px 0 6px">মডিউল অ্যাক্সেস</div><div style="display:flex;gap:8px;margin-bottom:8px"><button class="btn o s" style="color:var(--tx);border-color:var(--ln)" onclick="urAll(1)">সব অনুমোদন</button><button class="btn o s" style="color:var(--tx);border-color:var(--ln)" onclick="urAll(0)">সব বাতিল</button></div>
<div id="ur_pm">${PMOD.map(g=>`<div style="font-size:12px;color:var(--mu);margin:10px 0 6px">${g[0]}</div>${g[1].map(x=>`<div class="st-tg" onclick="this.querySelector('.st-sw').classList.toggle('on')"><div style="flex:1;font-weight:600;font-size:14px">${x[1]}</div><div class="st-sw ${pm[x[0]]?"on":""}" data-k="${x[0]}"><i></i></div></div>`).join("")}`).join("")}</div>
<div style="background:#fff7ed;color:#c2410c;border-radius:8px;padding:8px 10px;font-size:12px;margin:10px 0">⚠️ ভূমিকা বদলালে ডিফল্ট অ্যাক্সেস বসে যাবে; পরে প্রয়োজনমতো আলাদা মডিউল চালু/বন্ধ করুন। এই অ্যাক্সেস ইউজারের পরের লগইনে কার্যকর হবে।</div>
<label class="lb" style="color:var(--pri)">🏛 কোন প্রতিষ্ঠানে নিয়োগ হবে নির্বাচন করুন</label><select id="ur_s"><option value="">— প্রতিষ্ঠান বাছাই করুন (ঐচ্ছিক) —</option>${schAllR().map(x=>`<option value="${x.id}" ${String(u.school_id)===String(x.id)?"selected":""}>${esc(x.name)}</option>`).join("")}</select>
<div style="display:flex;gap:8px;justify-content:flex-end;margin-top:10px"><button class="btn o" onclick="usrBack()">বাতিল</button><button class="btn" onclick="saveUserRoles('${id}')">সংরক্ষণ</button></div>`);
}

async function saveUserRoles(id){
  if(!isSuper()){
    alert("শুধু Super Admin এই কাজ করতে পারবেন।");
    return;
  }
  let rs=urRoles();
  if(!rs.length) rs=[UROLES[UROLES.length-1]];
  const pm={};
  PMK.forEach(k=>{pm[k]=!!document.querySelector('#ur_pm .st-sw[data-k="'+k+'"].on')});
  if(rs.includes(UROLES[0])&&!confirm("অ্যাডমিন ভূমিকা দিলে এই ইউজার অ্যাপের সব তথ্যে পূর্ণ অ্যাক্সেস পাবেন। নিশ্চিত?")) return;
  try{
    if(!(await needSession()))return;
    const {data,error}=await sb.rpc("smartedu_set_user_roles",{
      target_user_id:id,
      new_roles:rs,
      new_school:$("ur_s").value||"",
      new_perms:pm
    });
    if(error) throw error;
    alert(data===true?"অ্যাক্সেস সংরক্ষিত হয়েছে। ইউজারের পরের লগইনে কার্যকর হবে।":"পরিবর্তন করা যায়নি।");
    await afterUsr();
  }catch(e){
    alert("পরিবর্তন ব্যর্থ: "+e.message);
  }
}

async function emailSignup(){
  if(!sb)return lerr("Supabase সংযোগ তৈরি হয়নি। ইন্টারনেট পরীক্ষা করুন।");
  const email=($("emEmail").value||"").trim().toLowerCase(),pw=$("emPass").value||"",pw2=$("emPass2").value||"";
  if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))return lerr("সঠিক ইমেইল দিন");
  if(pw.length<6)return lerr("পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে");
  if(pw!==pw2)return lerr("দুইবারের পাসওয়ার্ড মেলেনি");
  try{
    const {error}=await sb.auth.signUp({email,password:pw,options:{emailRedirectTo:SITE_URL}});
    if(error)throw error;
    lerr("");alert("নিবন্ধনের অনুরোধ সফল। ইমেইলের Inbox ও Spam ফোল্ডারে কনফার্মেশন লিংক দেখুন।");
  }catch(e){lerr("নিবন্ধন ব্যর্থ: "+e.message)}
}
var setupInfo=null;
function setupView(){
  const e=setupInfo&&setupInfo.email||"";
  return `<div class="login-box"><div class="login-card"><div style="font-size:42px">🏛</div><h1>প্রতিষ্ঠান প্রোফাইল তৈরি করুন</h1><p>আপনাকে অ্যাডমিন হিসেবে আমন্ত্রণ জানানো হয়েছে। আপনার প্রতিষ্ঠানের তথ্য দিন।</p><div style="font-size:12px;color:var(--mu);margin-bottom:8px">📧 ${esc(e)}</div><input id="sp_n" placeholder="প্রতিষ্ঠানের নাম *"><input id="sp_a" placeholder="ঠিকানা *"><input id="sp_p" type="tel" placeholder="যোগাযোগ নম্বর"><input id="sp_e" placeholder="স্থাপিত সাল (ঐচ্ছিক)"><input id="sp_d" placeholder="প্রধান/পরিচালকের নাম (ঐচ্ছিক)"><button class="btn" style="width:100%" onclick="claimInvite()">🏛 প্রতিষ্ঠান তৈরি করুন</button><button class="ob" style="width:100%;margin-top:10px" onclick="cancelSetup()">বাতিল ও লগআউট</button><div id="loginError" style="color:var(--rd);font-size:12px;margin-top:10px"></div></div></div>`;
}
async function claimInvite(){
  const g=i=>String($(i)?.value||"").trim(),n=g("sp_n"),a=g("sp_a");
  if(!n)return lerr("প্রতিষ্ঠানের নাম দিন");
  if(!a)return lerr("প্রতিষ্ঠানের ঠিকানা দিন");
  if(!sb||!setupInfo)return lerr("সংযোগ নেই। ইন্টারনেট পরীক্ষা করুন।");
  lerr("অপেক্ষা করুন...");
  try{
    const sc={name:n,addr:a,phone:g("sp_p"),est:g("sp_e"),director:g("sp_d"),email:setupInfo.email};
    const {data,error}=await sb.rpc("smartedu_claim_admin_invite",{p_name:n,p_addr:a,p_phone:sc.phone,p_est:sc.est});
    if(error)throw error;
    const sid=String(data||"");
    if(!sid)throw new Error("প্রতিষ্ঠান তৈরি করা যায়নি");
    const roles=[UROLES[0]];
    localStorage.setItem("smartEduPending",JSON.stringify({identifier:setupInfo.email,role:"admin",roleLabel:roleTxt(roles),permissions:permsFromAccess({roles,perms:{}}),sid,school:sc}));
    localStorage.setItem("smartEduActiveSid",sid);
    setupInfo=null;
    location.reload();
  }catch(e){lerr("ব্যর্থ: "+e.message)}
}
async function cancelSetup(){setupInfo=null;try{await sb.auth.signOut()}catch(_){}render()}
// ---- প্রতিষ্ঠানের প্রোফাইল: সার্ভার (smartedu_schools) থেকে প্রতিটি ডিভাইসে নামে; অ্যাডমিন বদলালে সার্ভারে যায় ----
function schSig(o){o=o||{};return JSON.stringify([o.name||"",o.addr||"",o.phone||"",String(o.est||""),o.email||"",o.director||"",String(o.year!=null&&o.year!==""?o.year:(o.syear||"")),(o.logo||"").length])}
function isSchoolAdmin(){return !!activeUser&&!isSuper()&&(activeUser.role==="admin"||myRoleList().some(r=>r==="অ্যাডমিন"||r==="সহ-অ্যাডমিন"))}
// সুপার এডমিন: প্রতিষ্ঠানের তথ্য (লোগোসহ) ও মেয়াদ সার্ভারে নিবন্ধন/হালনাগাদ করে; ইউজাররা নতুন ডিভাইসে এটাই পাবে
async function pushSchoolToServer(id,o){
  try{
    if(!sb||!navigator.onLine||!isSuper()||!id||id==="main")return;
    const sc=(S.schools||[]).find(x=>String(x.id)===String(id))||{},sub=sc.sub||{};
    let r=await _wt(sb.rpc("smartedu_admin_upsert_school",{p_id:String(id),p_name:o.name||sc.name||"",p_addr:o.addr||sc.addr||"",p_phone:o.phone||sc.phone||"",p_est:String(o.est||sc.est||""),p_email:sc.email||"",p_logo:sc.logo||"",p_director:(sc.admin&&sc.admin.name)||"",p_syear:"",p_exp:sub.exp||"",p_inactive:sub.status==="inactive"}),25000);
    if(r.error){
      const old=await _wt(sb.rpc("smartedu_update_school",{p_id:String(id),p_name:o.name||"",p_addr:o.addr||"",p_phone:o.phone||"",p_est:String(o.est||"")}),15000);
      if(old.error&&!window._schPushWarned){window._schPushWarned=1;alert("প্রতিষ্ঠানের তথ্য সার্ভারে যায়নি: "+r.error.message+"\nতাই নতুন ডিভাইসে ইউজার এই প্রতিষ্ঠানের তথ্য পাবে না। Supabase-এ supabase_school_info_setup.sql চালান।")}
    }
  }catch(e){}
}
async function pullMySchool(){
  try{
    if(!sb||!navigator.onLine||!activeUser||isSuper()||ACT_SID==="main")return;
    let r=null;
    const a=await _wt(sb.rpc("smartedu_my_school_info"),10000);
    if(!a.error)r=Array.isArray(a.data)?a.data[0]:a.data;
    else{const b=await _wt(sb.rpc("smartedu_list_schools"),10000);if(!b.error&&Array.isArray(b.data))r=b.data.find(x=>String(x.id)===String(ACT_SID))}
    if(!r||!r.name)return;
    const sc=S.school=S.school||{},srvSig=schSig(r);
    if(sc._srvSig===srvSig)return;
    sc.name=r.name;
    [["addr","addr"],["phone","phone"],["est","est"],["email","email"],["director","director"],["year","syear"],["logo","logo"]].forEach(f=>{const v=r[f[1]];if(v!=null&&String(v)!=="")sc[f[0]]=v});
    sc._srvSig=srvSig;sc._pushSig=schSig(sc);sc._init=1;
    save();
    if(unlocked)render();
  }catch(e){}
}
async function pushSchoolStats(){
  try{
    if(!sb||!navigator.onLine||!isSchoolAdmin()||ACT_SID==="main")return;
    const t=schSt({main:1}),sig=JSON.stringify(t);
    if(window._stSig===sig&&Date.now()-(window._stAt||0)<600000)return;
    window._stSig=sig;window._stAt=Date.now();
    await sb.rpc("smartedu_set_school_stats",{p_students:t.st,p_teachers:t.te,p_collect:t.col,p_due:t.dd});
  }catch(e){}
}
async function syncMySchool(){
  try{
    if(!sb||!navigator.onLine||!activeUser||isSuper()||ACT_SID==="main")return;
    const sc=S.school=S.school||{};
    // এই ডিভাইসে অ্যাডমিন প্রোফাইল বদলালে আগে সার্ভারে পাঠাও, তারপর সার্ভার থেকে নামাও
    if(isSchoolAdmin()&&sc.name&&schSig(sc)!==sc._pushSig){
      const r=await sb.rpc("smartedu_save_my_school",{p_name:sc.name,p_addr:sc.addr||"",p_phone:sc.phone||"",p_est:String(sc.est||""),p_email:sc.email||"",p_logo:sc.logo||"",p_director:sc.director||"",p_syear:String(sc.year||"")});
      if(!r.error&&r.data===true){sc._pushSig=sc._srvSig=schSig(sc)}
      else if(r.error){
        const up=await sb.rpc("smartedu_upsert_my_school",{p_name:sc.name,p_addr:sc.addr||"",p_phone:sc.phone||"",p_est:String(sc.est||"")});
        if(!up.error)sc._pushSig=schSig(sc);
      }
    }
    await pullMySchool();
    pushSchoolStats();
  }catch(e){}
}
var recoveryMode=false;
function recoveryView(){return `<div class="login-box"><div class="login-card"><div style="font-size:42px">🔑</div><h1>নতুন পাসওয়ার্ড দিন</h1><p>কমপক্ষে ৬ অক্ষরের নতুন পাসওয়ার্ড লিখুন</p><input id="emNew" type="password" autocomplete="new-password" placeholder="নতুন পাসওয়ার্ড"><input id="emNew2" type="password" autocomplete="new-password" placeholder="নতুন পাসওয়ার্ড আবার লিখুন" onkeydown="if(event.key==='Enter')saveNewPassword()"><label class="hint" style="display:flex;gap:6px;align-items:center;margin:2px 0 8px"><input type="checkbox" style="width:auto;margin:0" onchange="['emNew','emNew2'].forEach(i=>$(i).type=this.checked?'text':'password')">পাসওয়ার্ড দেখান</label><button class="btn" style="width:100%" onclick="saveNewPassword()">পাসওয়ার্ড সংরক্ষণ করুন</button><button class="ob" style="width:100%;margin-top:10px" onclick="cancelRecovery()">বাতিল</button><div id="loginError" style="color:var(--rd);font-size:12px;margin-top:10px"></div></div></div>`}
async function emailReset(){
  if(!sb)return lerr("Supabase সংযোগ তৈরি হয়নি। ইন্টারনেট পরীক্ষা করুন।");
  const email=($("emEmail").value||"").trim().toLowerCase();
  if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))return lerr("উপরের ইমেইল ঘরে আপনার ইমেইল লিখে আবার চাপুন");
  lerr("অপেক্ষা করুন...");
  try{
    const {error}=await sb.auth.resetPasswordForEmail(email,{redirectTo:SITE_URL});
    if(error)throw error;
    lerr("");alert("এই ইমেইলে account থাকলে পাসওয়ার্ড রিসেট লিংক পাঠানো হয়েছে। Inbox ও Spam ফোল্ডার দেখুন।");
  }catch(e){lerr("ব্যর্থ: "+e.message)}
}
async function saveNewPassword(){
  const p1=$("emNew").value||"",p2=$("emNew2").value||"";
  if(p1.length<6)return lerr("পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে");
  if(p1!==p2)return lerr("দুইবারের পাসওয়ার্ড মেলেনি");
  lerr("অপেক্ষা করুন...");
  try{
    const {error}=await sb.auth.updateUser({password:p1});
    if(error)throw error;
    await sb.auth.signOut();
    recoveryMode=false;loginTab="email";
    try{history.replaceState(null,"",location.pathname)}catch(_){}
    alert("পাসওয়ার্ড পরিবর্তন হয়েছে। নতুন পাসওয়ার্ড দিয়ে লগইন করুন।");render();
  }catch(e){lerr("ব্যর্থ: "+e.message)}
}
async function cancelRecovery(){
  try{await sb.auth.signOut()}catch(_){}
  recoveryMode=false;loginTab="email";
  try{history.replaceState(null,"",location.pathname)}catch(_){}
  render();
}
if(sb)sb.auth.onAuthStateChange(ev=>{if(ev==="PASSWORD_RECOVERY"){recoveryMode=true;unlocked=false;render()}});
var _mainSchool=null;
function applySessionSchool(sid){
  try{
    if(_mainSchool){S.school=_mainSchool;_mainSchool=null}
    const sc=(sid&&sid!=="main")?(S.schools||[]).find(x=>String(x.id)===String(sid)):null;
    if(!sc)return;
    _mainSchool=S.school;
    Object.defineProperty(S,"toJSON",{value:function(){return _mainSchool?Object.assign({},this,{school:_mainSchool}):this},enumerable:false,configurable:true,writable:true});
    S.school=Object.assign({},_mainSchool,{name:sc.name,logo:sc.logo,addr:sc.addr,phone:sc.phone,email:sc.email||"",est:sc.est});
  }catch(e){}
}
function permsFromAccess(access){
  const pmx=(access.perms&&Object.keys(access.perms).length)?access.perms:pmDefault(access.roles);
  return [...new Set(["dashboard"].concat(PMK.filter(k=>pmx[k]).map(k=>PM_TO_PERM[k]).filter(Boolean)))];
}
async function refreshRemembered(){
  try{
    if(!sb||!activeUser||!localStorage.getItem("smartEduRemember")||!navigator.onLine)return;
    const {data:{session}}=await sb.auth.getSession();
    if(!session)return;
    const email=String(session.user.email||"").toLowerCase();
    if(SUPER_ADMIN_EMAILS.includes(email)||email===ADMIN_AUTH_EMAIL.trim().toLowerCase())return;
    const {data:access,error}=await sb.from("smartedu_user_access")
      .select("status,roles,school_id,perms").eq("user_id",session.user.id).maybeSingle();
    if(error||!access)return;
    if(access.status!=="approved"){logout();alert("আপনার অ্যাকাউন্ট আর সক্রিয় নেই। আবার লগইন করুন।");return}
    const tsid=access.school_id||"main";
    if(tsid!==ACT_SID){
      localStorage.setItem("smartEduPending",JSON.stringify({identifier:email,role:(access.roles||[]).includes(UROLES[0])?"admin":"teacher",roleLabel:roleTxt(access.roles),permissions:permsFromAccess(access),sid:tsid}));
      localStorage.setItem("smartEduActiveSid",tsid);
      sessionStorage.removeItem("smartEduUser");localStorage.removeItem("smartEduRemember");
      location.reload();return;
    }
    const u=S.users.find(x=>x.id===activeUser.id);
    if(!u)return;
    u.role=(access.roles||[]).includes(UROLES[0])?"admin":"teacher";
    u.roleLabel=roleTxt(access.roles);
    u.permissions=permsFromAccess(access);
    save();
    activeUser.role=u.role;
    localStorage.setItem("smartEduRemember",JSON.stringify({id:u.id,identifier:u.identifier,role:u.role,sid:access.school_id||""}));
    applySessionSchool(access.school_id);
    await subFetchSrv();
    try{await _wt(pullMySchool(),9000)}catch(_){}
    render();
    syncMySchool();snapSync();try{if(isSuper()&&ACT_SID==="main"){loadRemSch().then(()=>{try{render()}catch(_){}})}}catch(_){}
  }catch(e){}
}
try{const rm=JSON.parse(localStorage.getItem("smartEduRemember")||"null");if(rm&&activeUser&&rm.id===activeUser.id)applySessionSchool(rm.sid)}catch(e){}
refreshRemembered();

function mergeSchIdx(list){
  try{
    let idx=[];try{idx=JSON.parse(localStorage.getItem("smartEduSchIdx")||"[]")}catch(e){}
    list.forEach(x=>{if(x&&x.id!=null&&!idx.some(y=>String(y.id)===String(x.id)))idx.push({id:x.id,name:x.name})});
    localStorage.setItem("smartEduSchIdx",JSON.stringify(idx));
  }catch(e){}
}
function writeSchIdx(){
  try{
    const loc=(typeof schAllR==="function"?schAllR():schAll());
    let idx=[];try{idx=JSON.parse(localStorage.getItem("smartEduSchIdx")||"[]")}catch(e){}
    const m=new Map(idx.map(x=>[String(x.id),x]));
    loc.forEach(x=>m.set(String(x.id),{id:x.id,name:x.name,addr:x.addr,phone:x.phone,email:x.email,est:x.est}));
    localStorage.setItem("smartEduSchIdx",JSON.stringify([...m.values()]));
  }catch(e){}
}
function rmSchIdx(id){try{const idx=JSON.parse(localStorage.getItem("smartEduSchIdx")||"[]").filter(x=>String(x.id)!==String(id));localStorage.setItem("smartEduSchIdx",JSON.stringify(idx))}catch(e){}}
function schSelInner(){
  let idx=[];try{idx=JSON.parse(localStorage.getItem("smartEduSchIdx")||"[]")}catch(e){}
  if(idx.length<2)return "";
  return `<select onchange="switchDataset(this.value)" style="margin:6px 0 10px">${idx.map(x=>`<option value="${x.id}" ${String(x.id)===ACT_SID?"selected":""}>🏛 ${esc(x.name)}</option>`).join("")}</select>`;
}
function schSel(){
  if(!window._lsT||Date.now()-window._lsT>60000){window._lsT=Date.now();setTimeout(loadLoginSch,0)}
  return `<div id="schSelBox">${schSelInner()}</div>`;
}
async function loadLoginSch(){
  try{
    if(!sb||!navigator.onLine||window._lsBusy)return;
    window._lsBusy=1;
    const b=await sb.rpc("smartedu_list_schools");
    if(!b.error&&b.data){mergeSchIdx(b.data.map(r=>({id:r.id,name:r.name})));const e=$("schSelBox");if(e)e.innerHTML=schSelInner()}
  }catch(e){}finally{window._lsBusy=0}
}
function switchDataset(sid){localStorage.setItem("smartEduActiveSid",sid);location.reload()}
function applyPending(){
  try{
    const p=JSON.parse(localStorage.getItem("smartEduPending")||"null");
    if(!p)return;
    localStorage.removeItem("smartEduPending");
    if(p.sid!==ACT_SID)return;
    let u=S.users.find(x=>String(x.identifier).toLowerCase()===p.identifier);
    if(!u){u={id:uid(),identifier:p.identifier,pin:uid()+uid(),role:p.role,active:true,permissions:[],createdAt:Date.now()};S.users.push(u)}
    u.role=p.role;if(p.roleLabel)u.roleLabel=p.roleLabel;u.active=true;u.permissions=p.permissions||[];
    if(p.school)S.school=Object.assign({},S.school||{},p.school,{_init:1});
    save();
    activeUser={id:u.id,identifier:u.identifier,role:u.role};
    sessionStorage.setItem("smartEduUser",JSON.stringify(activeUser));
    localStorage.setItem("smartEduRemember",JSON.stringify({id:u.id,identifier:u.identifier,role:u.role,sid:ACT_SID}));
    unlocked=true;
  }catch(e){}
}
applyPending();
if(ACT_SID==="main")writeSchIdx();
function doLogout(){closeM();if(confirm("আপনি কি লগআউট করতে চান?"))logout()}
function fitMobileZoom(){
  if(window._pdfBusy)return;
  try{
    const sw=screen.width,iw=window.innerWidth;
    const z=(iw>sw*1.25&&iw>=500)?(iw/sw):1;
    document.documentElement.style.zoom=z>1?String(z):"";
  }catch(e){}
}
fitMobileZoom();
addEventListener("resize",fitMobileZoom);
let _bkQ=false;
function fixBackBtns(){
  _bkQ=false;
  const v=$("v");if(!v)return;
  v.querySelectorAll("button").forEach(b=>{
    if(b.dataset.bk)return;
    const t=b.textContent.trim();
    if(t.startsWith("\u2190")){
      b.dataset.bk="1";
      if(/ফিরে/.test(t))b.style.display="none";
      else{b.style.display="block";b.style.marginLeft="auto"}
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
  const logo=(S.school&&S.school.logo)?`<img src="${safeDataImage(S.school.logo)}" style="width:64px;height:64px;object-fit:contain;border-radius:50%">`:`<div style="font-size:40px">🔐</div>`;
  const G='<svg width="22" height="22" viewBox="0 0 48 48"><path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/><path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/><path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/><path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/></svg>';
  const F='<svg width="22" height="22" viewBox="0 0 24 24"><circle cx="12" cy="12" r="12" fill="#1877F2"/><path fill="#fff" d="M16.67 15.47l.53-3.47h-3.33V9.75c0-.95.47-1.88 1.96-1.88h1.51V4.92s-1.37-.23-2.68-.23c-2.74 0-4.53 1.66-4.53 4.66V12H7.08v3.47h3.05v8.39a12.1 12.1 0 003.74 0v-8.39h2.8z"/></svg>';
  return `<div class="login-box"><div class="lg-card">
<div style="text-align:center;margin-bottom:14px">${logo}<div style="font-size:20px;font-weight:700;margin-top:6px">${esc((S.school&&S.school.name)||"")}</div><div style="font-size:13px;color:var(--mu)">${su?"Create your account":"Sign in to continue"}</div></div>
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
if(S.set.bism===undefined)S.set.bism=1;
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
