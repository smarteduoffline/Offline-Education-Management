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
