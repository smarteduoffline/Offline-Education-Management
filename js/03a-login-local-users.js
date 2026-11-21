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
