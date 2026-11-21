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
