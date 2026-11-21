window._remUsers=[];window._remSch={};
function schNm(id){const r=window._remSch&&window._remSch[String(id)];if(r&&r.name)return r.name;const x=id?schOf(id):null;return x?x.name:""}
function schAllR(){const a=schAll();return a.concat(Object.values(window._remSch||{}).filter(r=>!a.some(x=>String(x.id)===String(r.id))).map(r=>({id:r.id,name:r.name})))}
async function loadSchExtra(){
  try{
    const r=await sb.rpc("smartedu_list_school_extra");
    if(r.error)return;
    const m={};(r.data||[]).forEach(x=>m[String(x.school_id)]=x);window._remStats=m;
    (Store.schools||[]).forEach(sc=>{const x=m[String(sc.id)];if(!x)return;if(x.logo&&!sc.logo)sc.logo=x.logo;if(x.director&&!(sc.admin&&sc.admin.name)){sc.admin=sc.admin||{};sc.admin.name=x.director}});
    if(tab==="more"&&sub==="sat"&&satT===0)render();
  }catch(e){}
}
function schBackfill(list){
  try{
    if(!isSuper()||ACT_SID!=="main"||window._bfDone||!Array.isArray(list))return;
    window._bfDone=1;
    const have=new Set(list.map(x=>String(x.id)));
    (Store.schools||[]).filter(x=>x&&x.id!=null&&!have.has(String(x.id))).forEach(sc=>pushSchoolToServer(sc.id,sc));
  }catch(e){}
}
async function loadRemSch(){try{const b=await sb.rpc("smartedu_list_schools");if(!b.error){const m={};(b.data||[]).forEach(x=>m[String(x.id)]=x);window._remSch=m;mergeSchIdx((b.data||[]).map(r=>({id:r.id,name:r.name})));try{if(typeof schReconcile==="function")schReconcile(b.data||[])}catch(_){}try{schBackfill(b.data||[])}catch(_){}loadSchExtra()}}catch(e){}}
// সুপার এডমিনের তালিকায় সার্ভারে নিবন্ধিত প্রতিষ্ঠান না থাকলে (লোকাল ডেটা হারালে/নতুন ডিভাইসে) তা ফিরিয়ে আনে
function schReconcile(list){
  if(!activeUser||!isSuper()||ACT_SID!=="main"||!Array.isArray(list))return;
  let add=0;
  list.forEach(r=>{
    if(!r||r.id==null||String(r.id)==="main")return;
    if(Store.schools.some(x=>String(x.id)===String(r.id)))return;
    Store.schools.push({id:r.id,name:r.name||"",addr:r.addr||"",phone:r.phone||"",est:r.est||"",email:r.email||"",sub:{}});
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
