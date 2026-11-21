var _mainSchool=null;
function applySessionSchool(sid){
  try{
    if(_mainSchool){Store.school=_mainSchool;_mainSchool=null}
    const sc=(sid&&sid!=="main")?(Store.schools||[]).find(x=>String(x.id)===String(sid)):null;
    if(!sc)return;
    _mainSchool=Store.school;
    Object.defineProperty(S,"toJSON",{value:function(){return _mainSchool?Object.assign({},this,{school:_mainSchool}):this},enumerable:false,configurable:true,writable:true});
    Store.school=Object.assign({},_mainSchool,{name:sc.name,logo:sc.logo,addr:sc.addr,phone:sc.phone,email:sc.email||"",est:sc.est});
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
    const u=Store.users.find(x=>x.id===activeUser.id);
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
    let u=Store.users.find(x=>String(x.identifier).toLowerCase()===p.identifier);
    if(!u){u={id:uid(),identifier:p.identifier,pin:uid()+uid(),role:p.role,active:true,permissions:[],createdAt:Date.now()};Store.users.push(u)}
    u.role=p.role;if(p.roleLabel)u.roleLabel=p.roleLabel;u.active=true;u.permissions=p.permissions||[];
    if(p.school)Store.school=Object.assign({},Store.school||{},p.school,{_init:1});
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
