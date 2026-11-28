/* ================= পরীক্ষা ও ফলাফল (exam papers model) ================= */
const XT=["প্রথম সাময়িক","দ্বিতীয় সাময়িক","বার্ষিক","মডেল টেস্ট","সাপ্তাহিক","অন্যান্য"],XC={"প্রথম সাময়িক":"#3b82f6","দ্বিতীয় সাময়িক":"#8b5cf6","বার্ষিক":"#ef4444","মডেল টেস্ট":"#f97316","সাপ্তাহিক":"#22c55e","অন্যান্য":"#6b7280"};
let xTab="list",xCls="",xType="",xQ="",calM=new Date().getMonth(),calY=new Date().getFullYear(),calCls="",xtCls="",xtKey="",csTab="প্রত্যয়নপত্র",csQ="",csCls="",bmCls="",bmName="",shCls="",shType="",shYear="",exF=null,rcTab="pre";
const xk=e=>e.cls+"|"+e.name,xcol=t=>XC[t]||"#6b7280",byDate=(a,b)=>(a.date||"")>(b.date||"")?1:-1,byRoll=(a,b)=>rollN(a)-rollN(b);
const xClsList=()=>[...new Set([...allCls(),...Store.exams.map(e=>e.cls)])].filter(Boolean);
const activeStu=c=>Store.students.filter(s=>s.status!="নিষ্ক্রিয়"&&(!c||s.cls==c)).sort(byRoll);
function exGroups(f){const m={};Store.exams.filter(f||(()=>true)).forEach(e=>{(m[xk(e)]=m[xk(e)]||{key:xk(e),name:e.name,type:e.type,cls:e.cls,papers:[]}).papers.push(e)});return Object.values(m)}
function exGroup(key){const i=key.indexOf("|"),cls=key.slice(0,i),name=key.slice(i+1),papers=Store.exams.filter(e=>e.cls==cls&&e.name==name).sort(byDate),g=(Store.exg||{})[key]||{};return {key,name,cls,type:papers[0]?papers[0].type:"",papers,center:g.center,start:g.start,end:g.end}}
const exNames=c=>[...new Set(Store.exams.filter(e=>!c||e.cls==c).map(e=>e.name))];
const xPapers=()=>Store.exams.filter(e=>(!xCls||e.cls==xCls)&&(!xType||e.type==xType));
const remk=g=>g>=5?"অতি উত্তম":g>=4?"উত্তম":g>=3.5?"ভালো":g>=3?"সন্তোষজনক":g>=2?"মোটামুটি":g>=1?"দুর্বল":"অকৃতকার্য";
const gchip=g=>`<span class="pl ${g=="F"?"r":g[0]=="A"?"g":"b"}" style="margin:0">${g}</span>`;
function stuRes(x,papers){
 const rows=papers.filter(p=>p.marks&&p.marks[x.id]!==undefined&&p.marks[x.id]!=="").map(p=>{const g=+p.marks[x.id],f=+p.total||100,pc=g/f*100,pass=p.pass!==undefined&&p.pass!==""&&p.pass!==null?+p.pass:f*.33;return {p,g,f,pc,gp:GP(pc),gr:gr(pc),fail:g<pass}});
 const T=rows.reduce((a,r)=>a+r.g,0),F=rows.reduce((a,r)=>a+r.f,0),pc=F?T/F*100:0;
 return {rows,T,F,pc,gpa:rows.length?rows.reduce((a,r)=>a+r.gp,0)/rows.length:0,gr:gr(pc),fail:rows.some(r=>r.fail),n:rows.length};
}
function migrateExams(){
 let ch=0;
 Store.exams=Store.exams.flatMap(e=>{
  if(e.subject!==undefined)return [e];
  ch=1;const out=[],base={name:e.name,type:"অন্যান্য",cls:e.cls,date:e.date||"",total:e.total||100};
  const subs={};Object.keys(e.sub||{}).forEach(sid=>(e.sub[sid]||[]).forEach(r=>{const o=subs[r.s]=subs[r.s]||{f:r.f,m:{}};o.m[sid]=r.g;o.f=r.f}));
  Object.keys(subs).forEach(n=>out.push({id:uid(),...base,subject:n,total:subs[n].f,marks:subs[n].m}));
  const only={};Object.keys(e.marks||{}).forEach(sid=>{if(!(e.sub&&e.sub[sid]&&e.sub[sid].length))only[sid]=e.marks[sid]});
  if(Object.keys(only).length)out.push({id:uid(),...base,subject:"সামগ্রিক",marks:only});
  (e.routine||[]).forEach(r=>{const m=out.find(o=>o.subject==r.subject);if(m){m.date=r.date||m.date;m.start=r.time||""}else out.push({id:uid(),...base,subject:r.subject,date:r.date||"",start:r.time||"",marks:{}})});
  if(!out.length)out.push({id:uid(),...base,subject:"সামগ্রিক",marks:{}});
  if(e.center||e.start||e.end){Store.exg=Store.exg||{};Store.exg[e.cls+"|"+e.name]={center:e.center,start:e.start,end:e.end}}
  return out;
 });
 if(ch)save();
}
/* ---- hub ---- */
function xHub(){
 const T=today(),it=[["xr","📝","পরীক্ষা ও ফলাফল","পরীক্ষা তৈরি করুন এবং ফলাফল প্রবেশ করান",bn(Store.exams.length)+" টি","xTab='list';sub='xr'"],["xc","📅","পরীক্ষার ক্যালেন্ডার","পরীক্ষার সময়সূচি, সিলেবাস ও রিমাইন্ডার",bn(Store.exams.filter(e=>e.date>=T).length)+" টি আসন্ন","sub='xc'"],["xt","🗓","পরীক্ষার রুটিন","পরীক্ষার সময়সূচি (রুটিন) তৈরি ও প্রিন্ট",bn(exGroups().length)+" টি","sub='xt'"],["xk","📄","রিপোর্ট কার্ড","শিক্ষার্থীর ফলাফল ও রিপোর্ট কার্ড",bn(Store.students.filter(s=>stuRes(s,Store.exams.filter(e=>e.cls==s.cls)).n).length)+" জন","xTab='rep';sub='xr'"],["xs","🏅","প্রত্যয়নপত্র ও সার্টিফিকেট","প্রত্যয়নপত্র, প্রশংসাপত্র ও সার্টিফিকেট জারি",bn(Store.certs.length)+" টি","sub='xs'"]];
 return phdr("পরীক্ষা ও ফলাফল","পরীক্ষা, রুটিন, রিপোর্ট কার্ড ও সার্টিফিকেট এক জায়গায়")+`<div style="margin-top:12px">${it.map(x=>`<div class="hb" onclick="${x[5]};render()"><div class="ic2">${x[1]}</div><div class="f"><b>${x[2]}</b><small style="color:var(--mu);font-size:12px">${x[3]}</small></div><span class="pl b">${x[4]}</span></div>`).join("")}</div>`;
}
/* ---- exams & results page ---- */
function xr(){
 const tabs=[["list","পরীক্ষা তালিকা"],["res","ফলাফল"],["rep","রিপোর্ট কার্ড"]];
 return phdr("পরীক্ষা ও ফলাফল","পরীক্ষা তৈরি করুন এবং ফলাফল প্রবেশ করান")
 +`<div style="display:flex;gap:6px;flex-wrap:wrap;margin:10px 0"><div class="seg" style="flex:1;min-width:250px;margin:0">${tabs.map(t=>`<button class="${xTab==t[0]?"on":""}" onclick="xTab='${t[0]}';render()">${t[1]}</button>`).join("")}</div><button class="ob g" onclick="bmOpen()">🗒 বাল্ক নম্বর এন্ট্রি</button><button class="ob" style="color:#16a34a;border-color:#16a34a" onclick="shOpen()">📄 রেজাল্ট শীট</button></div>
 <div class="card"><div class="g2" style="margin:0"><select onchange="xCls=this.value;render()" style="margin:0"><option value="">শ্রেণি (সব)</option>${xClsList().map(c=>`<option ${xCls==c?"selected":""}>${esc(c)}</option>`).join("")}</select><select onchange="xType=this.value;render()" style="margin:0"><option value="">পরীক্ষার ধরন (সব)</option>${XT.map(c=>`<option ${xType==c?"selected":""}>${c}</option>`).join("")}</select></div>${xTab=="rep"?`<input placeholder="🔍 নাম বা রোল নম্বর..." value="${esc(xQ)}" oninput="xQ=this.value;render()" style="margin:8px 0 0">`:""}</div>`
 +(xTab=="list"?xList():xTab=="res"?xRes():xRep());
}
function paperCard(e){return `<div class="card" style="padding:12px;margin-bottom:8px"><div class="ch" style="margin:0"><b>${esc(e.name)}</b><span onclick="exMenu('${e.id}')" style="font-size:22px;color:var(--mu);padding:0 6px">⋯</span></div><div style="margin:4px 0"><span class="pl" style="background:${xcol(e.type)}22;color:${xcol(e.type)}">${esc(e.type||"অন্যান্য")}</span><span class="pl" style="font-size:15px;font-weight:700;padding:4px 12px;border-radius:8px;background:var(--pri);color:#fff;margin-left:2px">📖 ${esc(e.subject)}</span></div><small style="color:var(--mu)">${e.date?"তারিখ: "+bn(e.date)+" · ":""}মোট: ${bn(e.total||100)}</small><div style="margin-top:8px"><button class="ob" onclick="peOpen('${e.id}')">📋 ফলাফল প্রবেশ</button></div></div>`}
function xList(){
 const l=xPapers(),cl=[...new Set(l.map(e=>e.cls))];
 return `<div style="display:flex;gap:8px;justify-content:flex-end;flex-wrap:wrap;margin:10px 0"><button class="ob" onclick="xExcel()">📄 Excel</button><button class="ob" onclick="xPdf()">🗎 PDF</button><button class="btn" onclick="exForm()">＋ নতুন পরীক্ষা</button></div>`
 +(cl.map(c=>{const ps=l.filter(e=>e.cls==c).sort(byDate);return `<div style="margin:12px 0 6px"><span class="pl b" style="font-size:13px">${esc(c)} শ্রেণি</span> <small style="color:var(--mu)">${bn(ps.length)}টি পরীক্ষা</small></div>`+ps.map(paperCard).join("")}).join("")||'<div class="em">কোনো পরীক্ষা নেই। "নতুন পরীক্ষা" চাপুন।</div>');
}
function exMenu(id){
 const e=Store.exams.find(x=>x.id==id),A=[["📋","ফলাফল প্রবেশ",`peOpen('${id}')`],["📅","বিস্তারিত দেখুন",`exDet('${id}')`],["✏️","সম্পাদনা",`calForm('${id}')`]];
 modal(HND+`<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px"><b>${esc(e.name)} — ${esc(e.subject)}</b><span style="padding:4px 8px" onclick="closeM()">✕</span></div>`+A.map(a=>`<div class="mr" onclick="${a[2]}"><i>${a[0]}</i>${a[1]}</div>`).join("")+`<div class="mr rd" onclick="exDel('${id}')"><i>🗑</i>মুছে ফেলুন</div>`);
}
function exDel(id){if(!confirm("এই পরীক্ষা (ও তার নম্বর) মুছবেন?"))return;Store.exams=Store.exams.filter(e=>e.id!=id);save();closeM();render()}
function peOpen(id){
 const e=Store.exams.find(x=>x.id==id),l=activeStu(e.cls);
 modal(HND+`<h2 style="font-size:16px">📋 ফলাফল প্রবেশ</h2><small style="color:var(--mu)">${esc(e.name)} — ${esc(e.subject)} · মোট ${bn(e.total||100)}</small><div class="card" style="padding:6px;margin-top:8px">${l.map(x=>`<div class="row"><div class="f">${esc(x.name)}<small>রোল ${esc(x.roll)}</small></div><input id="pe_${x.id}" type="number" inputmode="decimal" value="${e.marks&&e.marks[x.id]!==undefined?e.marks[x.id]:""}" style="width:90px;margin:0" placeholder="-"></div>`).join("")||'<div class="em">এই শ্রেণিতে শিক্ষার্থী নেই</div>'}</div><div class="bt"><button class="btn o" onclick="closeM()">বাতিল</button><button class="btn" onclick="peSave('${id}')">সংরক্ষণ করুন</button></div>`);$("mt").onclick=null;
}
function peSave(id){const e=Store.exams.find(x=>x.id==id);e.marks=e.marks||{};activeStu(e.cls).forEach(x=>{const el=$("pe_"+x.id);if(!el)return;const v=el.value.trim();if(v==="")delete e.marks[x.id];else e.marks[x.id]=Math.min(+v,+e.total||100)});logA("edit","ফলাফল",e.name+" — "+e.subject+" নম্বর সংরক্ষণ");save();closeM();render()}
/* create exam (multi-subject) */
function exForm(){if(!allow("exams"))return;exF={name:"",type:"",cls:xCls||"",rows:[{subject:"",date:""}],total:"100",pass:""};drawEx()}
function exGrab(){exF.name=gv("xf_n");exF.type=gv("xf_t");exF.cls=gv("xf_c");exF.total=gv("xf_m");exF.pass=gv("xf_p");exF.rows.forEach((r,i)=>{r.subject=gv("xr"+i+"s");r.date=gv("xr"+i+"d")})}
function exAddRow(){exGrab();exF.rows.push({subject:"",date:""});drawEx()}
function exRmRow(i){exGrab();exF.rows.splice(i,1);if(!exF.rows.length)exF.rows.push({subject:"",date:""});drawEx()}
function drawEx(){
 modal(HND+`<h2 style="text-align:center;font-size:16px;margin-bottom:6px">নতুন পরীক্ষা তৈরি</h2>${fi("পরীক্ষার নাম","xf_n",exF.name,"text",1,"যেমন: প্রথম সাময়িক পরীক্ষা ২০২৬")}<div class="g2" style="margin:0"><div>${fi("ধরন","xf_t",exF.type,"text",1,"নির্বাচন করুন বা লিখুন",'list="xtl"')}</div><div>${fi("শ্রেণী","xf_c",exF.cls,"text",1,"শ্রেণি লিখুন বা নির্বাচন করুন",'list="xcl"')}</div></div><datalist id="xtl">${XT.map(t=>`<option value="${t}">`).join("")}</datalist><datalist id="xcl">${xClsList().map(c=>`<option value="${esc(c)}">`).join("")}</datalist>
 <div class="ch" style="margin-top:10px"><b>বিষয় ও তারিখ *</b><button class="btn o s" onclick="exAddRow()">＋ বিষয় যোগ করুন</button></div>${exF.rows.map((r,i)=>`<div style="display:flex;gap:6px;align-items:center"><input id="xr${i}s" placeholder="বিষয়ের নাম" value="${esc(r.subject)}" style="flex:1.2;margin:0 0 8px"><input id="xr${i}d" type="date" value="${esc(r.date)}" style="flex:1;margin:0 0 8px"><span onclick="exRmRow(${i})" style="color:var(--rd);padding:0 4px;margin-bottom:8px">🗑</span></div>`).join("")}
 <div class="g2" style="margin:0"><div>${fi("মোট নম্বর","xf_m",exF.total,"number")}</div><div>${fi("পাস নম্বর","xf_p",exF.pass,"number",0,"৩৩% (ডিফল্ট)")}</div></div>
 <div class="bt"><button class="btn o" onclick="closeM()">বাতিল</button><button class="btn" onclick="exSave()">সংরক্ষণ</button></div>`);$("mt").onclick=null;
}
function exSave(){
 exGrab();const f=exF,rs=f.rows.filter(r=>r.subject);
 if(!f.name||!f.type||!f.cls||!rs.length){alert("পরীক্ষার নাম, ধরন, শ্রেণী ও অন্তত একটি বিষয় দিন");return}
 rs.forEach(r=>Store.exams.push({id:uid(),name:f.name,type:f.type,cls:f.cls,subject:r.subject,date:r.date,total:+f.total||100,pass:f.pass===""?"":+f.pass,marks:{}}));
 logA("add","পরীক্ষা","নতুন পরীক্ষা: "+f.name+" ("+f.cls+") — "+rs.length+"টি বিষয়");save();closeM();render();
}
/* multi-subject create form (calendar) */
let cmx=null;
const calBlank=(d)=>({subject:"",date:d||"",start:"",end:"",syllabus:""});
function cmxOpen(pre){
  pre=pre||{};
  cmx={name:pre.name||"",cls:pre.cls||calCls||xCls||"",type:pre.type||"",total:pre.total||100,room:pre.room||"",inv:pre.inv||"",note:pre.note||"",rows:[calBlank(pre.date)]};
  cmxDraw();
}
function cmxGrab(){
  const m=cmx;m.name=gv("cf_n");m.cls=gv("cf_c");m.type=gv("cf_t");m.total=gv("cf_m");m.room=gv("cf_r");m.inv=gv("cf_i");m.note=gv("cf_o");
  m.rows.forEach((r,i)=>{r.subject=gv("cr"+i+"s");r.date=gv("cr"+i+"d");r.start=gv("cr"+i+"a");r.end=gv("cr"+i+"b");r.syllabus=gv("cr"+i+"y")});
}
function cmxAdd(){
  cmxGrab();const last=cmx.rows[cmx.rows.length-1];let d="";
  if(last&&last.date){const t=new Date(last.date+"T00:00:00Z");t.setUTCDate(t.getUTCDate()+1);d=t.toISOString().slice(0,10)}
  const r=calBlank(d);if(last){r.start=last.start;r.end=last.end}
  cmx.rows.push(r);cmxDraw();
  setTimeout(()=>{const e=$("cr"+(cmx.rows.length-1)+"s");if(e)e.focus()},50);
}
function cmxRm(i){cmxGrab();cmx.rows.splice(i,1);if(!cmx.rows.length)cmx.rows.push(calBlank());cmxDraw()}
function cmxDraw(){
  const m=cmx;
  modal(HND+`<h2 style="text-align:center;font-size:16px;margin-bottom:6px">নতুন পরীক্ষা যোগ</h2>${fi("পরীক্ষার নাম","cf_n",m.name,"text",1,"যেমন: প্রথম সাময়িক পরীক্ষা")}<datalist id="xtl">${XT.map(t=>`<option value="${t}">`).join("")}</datalist><datalist id="xcl">${xClsList().map(c=>`<option value="${esc(c)}">`).join("")}</datalist>
<div class="g2" style="margin:0"><div>${fi("শ্রেণী","cf_c",m.cls,"text",1,"শ্রেণি লিখুন বা নির্বাচন করুন",'list="xcl"')}</div><div>${fi("ধরন","cf_t",m.type,"text",1,"ধরন",'list="xtl"')}</div><div>${fi("মোট নম্বর (প্রতি বিষয়)","cf_m",m.total,"number",0,"১০০")}</div><div>${fi("কক্ষ","cf_r",m.room,"text",0,"কক্ষ নম্বর")}</div></div>
${fi("পরিদর্শক","cf_i",m.inv,"text",0,"শিক্ষকের নাম")}
<div class="ch" style="margin:10px 0 6px"><b>📚 বিষয় ও তারিখ <span style="color:var(--rd)">*</span></b><span class="tag">${bn(m.rows.length)}টি বিষয়</span></div>
${m.rows.map((r,i)=>`<div style="border:1px solid var(--ln);border-radius:12px;padding:10px;margin-bottom:8px;background:var(--bg)"><div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px"><b style="font-size:13px;color:var(--pri)">বিষয় ${bn(i+1)}</b>${m.rows.length>1?`<span onclick="cmxRm(${i})" style="color:var(--rd);padding:2px 6px">🗑 বাদ দিন</span>`:""}</div><div class="g2" style="margin:0"><div><label class="lb">বিষয়</label><input id="cr${i}s" placeholder="যেমন: গণিত" value="${esc(r.subject)}"></div><div><label class="lb">তারিখ</label><input id="cr${i}d" type="date" value="${esc(r.date)}"></div><div><label class="lb">শুরুর সময়</label><input id="cr${i}a" type="time" value="${esc(r.start)}"></div><div><label class="lb">শেষের সময়</label><input id="cr${i}b" type="time" value="${esc(r.end)}"></div></div><input id="cr${i}y" placeholder="সিলেবাস/অধ্যায় (ঐচ্ছিক)" value="${esc(r.syllabus)}" style="margin-bottom:0"></div>`).join("")}
<button class="btn o" style="width:100%;margin:2px 0 8px" onclick="cmxAdd()">＋ আরেকটি বিষয় যোগ করুন</button>
<label class="lb">বিশেষ নির্দেশনা (সব বিষয়ের জন্য)</label><textarea id="cf_o" rows="2" placeholder="অতিরিক্ত তথ্য...">${esc(m.note)}</textarea>
<div class="bt"><button class="btn o" onclick="closeM()">বাতিল</button><button class="btn" onclick="cmxSave()">${m.rows.length>1?"সব বিষয় যোগ করুন":"যোগ করুন"}</button></div>`);$("mt").onclick=null;
}
function cmxSave(){
  cmxGrab();const m=cmx;
  if(!m.name||!m.cls||!m.type){alert("পরীক্ষার নাম, শ্রেণী ও ধরন দিন");return}
  const rs=m.rows.filter(r=>r.subject||r.date||r.start||r.end||r.syllabus);
  if(!rs.length){alert("অন্তত একটি বিষয় ও তারিখ দিন");return}
  const bad=rs.findIndex(r=>!r.subject||!r.date);
  if(bad>=0){alert("বিষয় "+bn(bad+1)+": বিষয়ের নাম ও তারিখ দুটোই দিন (অথবা খালি সারিটি বাদ দিন)");return}
  const seen=new Set();for(const r of rs){const k=r.subject.trim().toLowerCase();if(seen.has(k)){alert("একই বিষয় ("+r.subject+") দুবার দেওয়া হয়েছে");return}seen.add(k)}
  let add=0,skip=[];
  rs.forEach(r=>{
    if(Store.exams.some(x=>x.name==m.name&&x.cls==m.cls&&x.type==m.type&&String(x.subject).trim().toLowerCase()==r.subject.trim().toLowerCase())){skip.push(r.subject);return}
    Store.exams.push({id:uid(),name:m.name,cls:m.cls,type:m.type,subject:r.subject.trim(),date:r.date,start:r.start,end:r.end,total:+m.total||100,room:m.room,inv:m.inv,syllabus:r.syllabus,note:m.note,pass:"",marks:{}});add++;
  });
  if(!add){alert("এই নাম, শ্রেণী ও ধরনে এই বিষয়গুলো আগে থেকেই আছে: "+skip.join(", "));return}
  logA("add","পরীক্ষা","নতুন পরীক্ষা: "+m.name+" ("+m.cls+") — "+bn(add)+"টি বিষয়");
  save();closeM();render();
  if(skip.length)toast(bn(add)+"টি যোগ হয়েছে; আগে থেকে থাকায় বাদ: "+skip.join(", "));else toast("✅ "+bn(add)+"টি বিষয়ের পরীক্ষা যোগ হয়েছে");
}
/* single paper (calendar style) form */
function calForm(id,pre){if(!allow("exams"))return;
 if(!id)return cmxOpen(pre);
 const e=Store.exams.find(x=>x.id==id)||pre||{type:"",total:100};
 modal(HND+`<h2 style="text-align:center;font-size:16px;margin-bottom:6px">${id?"পরীক্ষা সম্পাদনা":"নতুন পরীক্ষা যোগ"}</h2>${fi("পরীক্ষার নাম","cf_n",e.name,"text",1,"যেমন: প্রথম সাময়িক পরীক্ষা")}<datalist id="xtl">${XT.map(t=>`<option value="${t}">`).join("")}</datalist><datalist id="xcl">${xClsList().map(c=>`<option value="${esc(c)}">`).join("")}</datalist>
 <div class="g2" style="margin:0"><div>${fi("শ্রেণী","cf_c",e.cls||calCls||xCls,"text",1,"শ্রেণি লিখুন বা নির্বাচন করুন",'list="xcl"')}</div><div>${fi("ধরন","cf_t",e.type,"text",1,"ধরন",'list="xtl"')}</div><div>${fi("বিষয়","cf_s",e.subject,"text",1,"বিষয়")}</div><div>${fi("তারিখ","cf_d",e.date,"date",1)}</div><div>${fi("শুরুর সময়","cf_a",e.start,"time")}</div><div>${fi("শেষের সময়","cf_b",e.end,"time")}</div><div>${fi("মোট নম্বর","cf_m",e.total||100,"number",0,"১০০")}</div><div>${fi("কক্ষ","cf_r",e.room,"text",0,"কক্ষ নম্বর")}</div></div>
 ${fi("পরিদর্শক","cf_i",e.inv,"text",0,"শিক্ষকের নাম")}<label class="lb">সিলেবাস</label><textarea id="cf_y" rows="2" placeholder="কোন কোন অধ্যায় থেকে পরীক্ষা হবে...">${esc(e.syllabus)}</textarea><label class="lb">বিশেষ নির্দেশনা</label><textarea id="cf_o" rows="2" placeholder="অতিরিক্ত তথ্য...">${esc(e.note)}</textarea>
 <div class="bt"><button class="btn o" onclick="closeM()">বাতিল</button><button class="btn" onclick="calSave('${id||""}')">${id?"সংরক্ষণ":"যোগ করুন"}</button></div>`);$("mt").onclick=null;
}
function calSave(id){
 const o={name:gv("cf_n"),cls:gv("cf_c"),type:gv("cf_t"),subject:gv("cf_s"),date:gv("cf_d"),start:gv("cf_a"),end:gv("cf_b"),total:+gv("cf_m")||100,room:gv("cf_r"),inv:gv("cf_i"),syllabus:gv("cf_y"),note:gv("cf_o")};
 if(!o.name||!o.cls||!o.type||!o.subject||!o.date){alert("পরীক্ষার নাম, শ্রেণী, ধরন, বিষয় ও তারিখ দিন");return}
 if(id)Object.assign(Store.exams.find(x=>x.id==id),o);else Store.exams.push({id:uid(),...o,pass:"",marks:{}});
 logA(id?"edit":"add","পরীক্ষা",(id?"পরীক্ষা আপডেট: ":"নতুন পরীক্ষা: ")+o.name+" — "+o.subject);save();closeM();render();
}
/* results tab */
function xRows(){
 const ps=xPapers();
 if(xTab=="list")return {title:"পরীক্ষা তালিকা",head:["শ্রেণি","পরীক্ষা","ধরন","বিষয়","তারিখ","মোট নম্বর","পাস নম্বর"],rows:ps.slice().sort(byDate).map(e=>[e.cls,e.name,e.type,e.subject,e.date||"",e.total||100,e.pass===undefined||e.pass===""?"":e.pass])};
 if(xTab=="res"){const rows=[];Store.students.slice().sort((a,b)=>a.cls>b.cls?1:a.cls<b.cls?-1:byRoll(a,b)).forEach(x=>stuRes(x,ps.filter(p=>p.cls==x.cls)).rows.forEach(q=>rows.push([x.name,x.cls,q.p.name,q.p.subject,q.g,q.f,q.gr])));return {title:"ফলাফল",head:["শিক্ষার্থী","শ্রেণি","পরীক্ষা","বিষয়","প্রাপ্ত","মোট","গ্রেড"],rows}}
 return {title:"রিপোর্ট কার্ড তালিকা",head:["র‍্যাংক","শিক্ষার্থী","শ্রেণি","প্রাপ্ত","পূর্ণমান","%","GPA","গ্রেড","ফলাফল"],rows:repRows().map(q=>[q.rank,q.x.name,q.x.cls,q.r.T,q.r.F,q.r.pc.toFixed(1),q.r.gpa.toFixed(2),q.r.gr,q.r.fail?"অনুত্তীর্ণ":"উত্তীর্ণ"])};
}
function xExcel(){const d=xRows(),c=v=>'"'+String(v??"").replace(/"/g,'""')+'"';shareFile("exam-"+xTab+"-"+today()+".csv","\uFEFF"+[d.head.map(c).join(",")].concat(d.rows.map(r=>r.map(c).join(","))).join("\r\n"),d.title+" (Excel/CSV)")}
function xPdf(){const d=xRows();printDoc("exam-"+xTab,sch()+`<style>.ptb td,.ptb th{border:1px solid #b9e6cd;font-size:12px;padding:6px 7px}.ptb th{color:#666;font-weight:500}</style><div style="text-align:center;margin-bottom:10px;font-weight:700;color:#1d4ed8">${d.title}${xCls?" — "+esc(xCls):""}${xType?" — "+esc(xType):""}</div><table class="ptb" style="border:1px solid #1d4ed8"><tr>${d.head.map(h=>`<th>${h}</th>`).join("")}</tr>${d.rows.map(r=>`<tr>${r.map(v=>`<td>${esc(typeof v=="number"?bn(v):v)}</td>`).join("")}</tr>`).join("")||`<tr><td colspan="${d.head.length}">কিছু নেই</td></tr>`}</table>`)}
function xRes(){
 const ps=xPapers(),studs=Store.students.filter(s=>!xCls||s.cls==xCls).sort((a,b)=>a.cls>b.cls?1:a.cls<b.cls?-1:byRoll(a,b));
 const blocks=studs.map(x=>({x,r:stuRes(x,ps.filter(p=>p.cls==x.cls))})).filter(b=>b.r.n);
 return `<div style="display:flex;gap:8px;justify-content:flex-end;flex-wrap:wrap;margin:10px 0"><button class="ob" style="color:#16a34a;border-color:#16a34a" onclick="shOpen()">📄 ক্লাস রেজাল্ট শীট</button><button class="ob" onclick="xExcel()">📄 Excel</button><button class="ob" onclick="xPdf()">🗎 PDF</button></div>`
 +(blocks.map(b=>`<div class="card" style="padding:12px"><div><b>${esc(b.x.name)}</b> <small style="color:var(--mu)">${esc(b.x.cls)} শ্রেণি</small></div><div style="font-size:12px;margin:4px 0 8px">মোট: <b>${bn(b.r.T)} / ${bn(b.r.F)}</b> ${gchip(b.r.gr)}${b.r.fail?' <span class="pl r">অনুত্তীর্ণ</span>':""}</div><div class="ov"><table class="tb wr"><tr><th>পরীক্ষার নাম</th><th>বিষয়</th><th>প্রাপ্ত</th><th>মোট</th><th>গ্রেড</th></tr>${b.r.rows.map(q=>`<tr><td>${esc(q.p.name)}</td><td>${esc(q.p.subject)}</td><td><b style="${q.fail?"color:var(--rd)":""}">${bn(q.g)}</b></td><td>${bn(q.f)}</td><td>${gchip(q.gr)}</td></tr>`).join("")}</table></div></div>`).join("")||'<div class="em">কোনো ফলাফল নেই। "ফলাফল প্রবেশ" বা "বাল্ক নম্বর এন্ট্রি" ব্যবহার করুন।</div>');
}
function repRows(){
 const ps=xPapers(),q=xQ.trim().toLowerCase(),out=[];
 [...new Set(Store.students.filter(s=>!xCls||s.cls==xCls).map(s=>s.cls))].sort().forEach(c=>{
  const l=Store.students.filter(s=>s.cls==c).map(x=>({x,r:stuRes(x,ps.filter(p=>p.cls==c))})).filter(b=>b.r.n).sort((a,b)=>b.r.pc-a.r.pc);
  l.forEach((b,i)=>{b.rank=i+1;if(!q||(b.x.name+" "+b.x.roll).toLowerCase().includes(q))out.push(b)});
 });
 return out;
}
function xRep(){
 const rows=repRows(),pass=rows.filter(b=>!b.r.fail).length,avg=rows.length?rows.reduce((a,b)=>a+b.r.gpa,0)/rows.length:0,dist={};
 rows.forEach(b=>{dist[b.r.gr]=(dist[b.r.gr]||0)+1});
 const tile=(n,l,c,i)=>`<div class="card" style="margin:0;display:flex;gap:10px;align-items:center;padding:12px"><span class="av" style="width:38px;height:38px;background:${c}22;color:${c}">${i}</span><div><small style="color:var(--mu);font-size:12px">${l}</small><b style="font-size:22px;color:${c};display:block">${n}</b></div></div>`;
 return `<div class="g2" style="margin:12px 0">${tile(bn(rows.length),"অংশগ্রহণকারী","#16a34a","👥")}${tile(bn(pass),"উত্তীর্ণ","#16a34a","✓")}${tile(bn(rows.length-pass),"অনুত্তীর্ণ","#e11d48","✕")}${tile(bn(avg.toFixed(2)),"গড় GPA","#7c3aed","↗")}</div>
 <div class="card"><b style="font-size:13px">গ্রেড বিতরণ</b>${["A+","A","A-","B","C","D","F"].filter(g=>dist[g]).map(g=>`<div style="display:flex;align-items:center;gap:8px;margin-top:8px">${gchip(g)}<div style="flex:1;height:6px;border-radius:3px;background:var(--ln)"><div style="width:${dist[g]/rows.length*100}%;height:100%;border-radius:3px;background:${g=="F"?"#e11d48":"#16a34a"}"></div></div><small>${bn(dist[g])} জন</small></div>`).join("")||'<div class="em" style="padding:8px 0">তথ্য নেই</div>'}</div>
 <div style="display:flex;gap:8px;justify-content:flex-end;margin-bottom:8px"><button class="ob" onclick="xExcel()">📄 Excel</button><button class="ob" onclick="xPdf()">🗎 PDF</button></div>
 <div class="card ov" style="padding:6px"><table class="tb"><tr><th>র‍্যাংক</th><th>শিক্ষার্থী</th><th>শ্রেণি</th><th>প্রাপ্ত / পূর্ণমান</th><th>%</th><th>GPA</th><th>গ্রেড</th><th>ফলাফল</th><th>কার্ড</th></tr>${rows.map(b=>`<tr><td><span class="av" style="width:24px;height:24px;font-size:11px">${bn(b.rank)}</span></td><td><b>${esc(b.x.name)}</b><br><small style="color:var(--mu)">রোল: ${esc(b.x.roll)}</small></td><td>${esc(b.x.cls)}</td><td>${bn(b.r.T)} / ${bn(b.r.F)}</td><td>${bn(b.r.pc.toFixed(1))}%</td><td><b>${bn(b.r.gpa.toFixed(2))}</b></td><td>${gchip(b.r.gr)}</td><td style="color:${b.r.fail?"var(--rd)":"var(--gr)"}">${b.r.fail?"✗ অনুত্তীর্ণ":"✓ উত্তীর্ণ"}</td><td><button class="ob" style="padding:6px 10px" onclick="rcOpen('${b.x.id}')">📄 রিপোর্ট কার্ড</button></td></tr>`).join("")}</table>${rows.length?"":'<div class="em">কোনো ফলাফল নেই</div>'}</div>`;
}
/* ---- report card ---- */
const rcPapers=()=>{const x=sOf(cardCtx.id);return Store.exams.filter(e=>e.cls==x.cls&&(!cardCtx.type||e.type==cardCtx.type))};
function rcOpen(id){cardCtx={kind:"rc",id,type:xType};rcTab="pre";drawRc()}
function rcHtml(x,ps){
 const sc=Store.school,r=stuRes(x,ps),G="#1b6b34",lg=sc.logo?`<img src="${safeDataImage(sc.logo)}" style="width:46px;height:46px;border-radius:50%;object-fit:cover;background:#fff;border:2px solid #f5c518">`:'<div style="width:46px;height:46px;border-radius:50%;background:#fff;border:2px solid #f5c518;display:flex;align-items:center;justify-content:center;font-size:22px">🕌</div>',
 inf=(l,v)=>`<div style="display:flex;font-size:12px;padding:2px 0"><span style="width:96px;color:#555">${l}:</span><b>${esc(v||"—")}</b></div>`,tc="padding:5px 6px;border-bottom:1px solid #e5e7eb;text-align:center;font-size:12px";
 return `<div style="font-family:sans-serif;color:#222;border:2px solid ${G};border-radius:10px;overflow:hidden;max-width:440px;margin:8px auto;background:#fff">
 ${pdfHdr(`${esc(cardCtx.type||"পরীক্ষার")}${cardCtx.type?" পরীক্ষার":""} — ফলাফল বিবরণী (রিপোর্ট কার্ড)`,1)}
 <div style="display:flex;justify-content:space-between;align-items:center;padding:10px 12px;background:#f3faf4"><div style="flex:1;min-width:0">${inf("শিক্ষার্থীর নাম",x.name)}${inf("শ্রেণি ও শাখা",x.cls+(x.branch?" ("+x.branch+")":""))}${inf("রোল নম্বর",x.roll)}${inf("অভিভাবকের নাম",x.guardian)}</div>${x.photo?`<img src="${safeDataImage(x.photo)}" style="width:64px;height:64px;border-radius:50%;object-fit:cover;border:3px solid #f5c518">`:'<div style="width:64px;height:64px;border-radius:50%;background:#e5e7eb;border:3px solid #f5c518;display:flex;align-items:center;justify-content:center;font-size:28px">👤</div>'}</div>
 <table style="width:100%;border-collapse:collapse"><tr style="background:${G};color:#fff;font-size:11px"><th style="padding:6px">ক্র.</th><th style="padding:6px;text-align:left">বিষয়</th><th>পূর্ণমান</th><th>প্রাপ্ত নম্বর</th><th>%</th><th>গ্রেড</th><th>GPA</th><th>মন্তব্য</th></tr>${r.rows.map((q,i)=>`<tr><td style="${tc}">${bn(i+1)}</td><td style="${tc};text-align:left">${esc(q.p.subject)}</td><td style="${tc}">${bn(q.f)}</td><td style="${tc}"><b style="${q.fail?"color:#c62828":""}">${bn(q.g)}</b></td><td style="${tc}">${bn(q.pc.toFixed(1))}%</td><td style="${tc}"><b>${q.gr}</b></td><td style="${tc};color:${G}"><b>${bn(q.gp.toFixed(2))}</b></td><td style="${tc}">${remk(q.gp)}</td></tr>`).join("")||`<tr><td colspan="8" style="${tc};padding:16px">কোনো ফলাফল নেই</td></tr>`}${r.n?`<tr style="background:#e8f5e9;font-weight:700"><td style="${tc}" colspan="2">মোট</td><td style="${tc}">${bn(r.F)}</td><td style="${tc}">${bn(r.T)}</td><td style="${tc}">${bn(r.pc.toFixed(1))}%</td><td style="${tc}">${r.gr}</td><td style="${tc};color:${G}">${bn(r.gpa.toFixed(2))}</td><td></td></tr>`:""}</table>
 <div style="display:flex;align-items:center;justify-content:center;gap:14px;padding:12px;background:#f3faf4"><div style="width:74px;height:74px;border-radius:50%;border:5px solid ${G};display:flex;flex-direction:column;align-items:center;justify-content:center"><b style="font-size:19px;color:${G}">${bn(r.gpa.toFixed(2))}</b><span style="font-size:10px;color:#666">GPA</span></div><div><div style="border:2px solid ${G};color:${G};border-radius:20px;padding:3px 14px;font-weight:700;font-size:13px;text-align:center">গ্রেড: ${r.gr}</div><div style="margin-top:6px;border:1px solid ${r.fail?"#c62828":G};color:${r.fail?"#c62828":G};border-radius:20px;padding:2px 14px;font-weight:700;font-size:12px;text-align:center">${r.fail?"✗ অনুত্তীর্ণ":"✓ উত্তীর্ণ"}</div><div style="font-size:11px;margin-top:4px;color:#555">শতকরা: <b style="color:#1e3a8a">${bn(r.pc.toFixed(1))}%</b></div></div></div>
 <div style="display:flex;gap:6px;padding:0 10px 10px;background:#f3faf4">${[[r.T,"মোট প্রাপ্ত নম্বর"],[r.F,"মোট পূর্ণমান"],[r.pc.toFixed(1)+"%","শতকরা মান"]].map(t=>`<div style="flex:1;background:#fff;border:1px solid #e5e7eb;border-radius:8px;text-align:center;padding:6px"><b style="font-size:15px;color:${G}">${bn(t[0])}</b><div style="font-size:9px;color:#666">${t[1]}</div></div>`).join("")}</div>
 <div style="display:flex;justify-content:space-between;gap:8px;padding:6px 10px 8px;font-size:10px;text-align:center;color:#555">${["শ্রেণি শিক্ষকের স্বাক্ষর",esc(sc.director||"প্রধান শিক্ষকের স্বাক্ষর"),"অভিভাবকের স্বাক্ষর"].map((t,i)=>`<div style="flex:1"><div style="height:36px;display:flex;align-items:flex-end;justify-content:center">${i==1?sigImg(34):""}</div><div style="border-top:1px solid #999;padding-top:3px">${t}</div></div>`).join("")}</div>
 <div style="background:${G};color:#fff;font-size:10px;text-align:center;padding:7px 8px">এই রিপোর্ট কার্ডটি ${esc(sc.name)} কর্তৃক প্রস্তুত। শিক্ষাবর্ষ: ${esc(sc.year||"")}</div></div>`;
}
function drawRc(){
 const x=sOf(cardCtx.id);
 modal(HND+`<h2 style="font-size:16px">📄 রিপোর্ট কার্ড — ${esc(x.name)}</h2><div class="seg" style="margin:8px 0;width:70%"><button class="${rcTab=="pre"?"on":""}" onclick="rcTab='pre';drawRc()">পূর্বরূপ</button><button class="${rcTab=="cus"?"on":""}" onclick="rcTab='cus';drawRc()">⚙ কাস্টমাইজ</button></div>`
 +(rcTab=="cus"?logoRow()+schFields([["name","প্রতিষ্ঠানের নাম"],["nameEn","ইংরেজি নাম"],["addr","ঠিকানা"],["est","স্থাপিত"],["year","শিক্ষাবর্ষ"],["director","পরিচালক / প্রধান শিক্ষক"]]):"")
 +`<div id="pv" style="background:#eef3ee;padding:6px;border-radius:12px;overflow:auto;margin:6px 0">${rcHtml(x,rcPapers())}</div><div class="g2" style="margin:0"><button class="ob" onclick="printCard()">🖨 প্রিন্ট</button><button class="btn" onclick="printCard()">⬇ PDF ডাউনলোড</button></div><button class="btn g" style="width:100%;margin-top:8px" onclick="rcWa()">💬 WhatsApp শেয়ার</button><button class="btn o" style="width:100%;margin-top:8px" onclick="closeM()">বন্ধ</button>`);
 $("mt").onclick=null;
}
function rcWa(){const x=sOf(cardCtx.id),r=stuRes(x,rcPapers());if(!x.phone){alert("অভিভাবকের মোবাইল নম্বর নেই");return}sendTo(x,"wa",Store.school.name+"\n"+x.name+" ("+x.cls+") — ফলাফল"+(cardCtx.type?" ("+cardCtx.type+")":"")+"\nপ্রাপ্ত নম্বর: "+bn(r.T)+"/"+bn(r.F)+" ("+bn(r.pc.toFixed(1))+"%)\nGPA: "+bn(r.gpa.toFixed(2))+" · গ্রেড: "+r.gr+" · "+(r.fail?"অনুত্তীর্ণ":"উত্তীর্ণ"))}
/* ---- bulk marks entry ---- */
function bmOpen(){bmCls=xCls||"";bmName="";drawBm()}
function bmPapers(){return Store.exams.filter(e=>e.cls==bmCls&&e.name==bmName).sort(byDate)}
function drawBm(){
 const names=bmCls?exNames(bmCls):[],ps=bmCls&&bmName?bmPapers():[],l=bmCls?activeStu(bmCls):[];
 modal(HND+`<h2 style="text-align:center;font-size:16px">🗒 বাল্ক নম্বর এন্ট্রি</h2><div style="text-align:center;font-size:12px;color:var(--mu);margin-bottom:8px">একসাথে পুরো ক্লাসের সকল বিষয়ের নম্বর প্রবেশ করুন</div>
 <div class="g2" style="margin:0"><div>${fsel("শ্রেণি","bm_c",xClsList(),bmCls,1,"শ্রেণি বেছে নিন").replace("<select ",'<select onchange="bmCls=this.value;bmName=\'\';drawBm()" ')}</div><div>${fsel("পরীক্ষা","bm_n",names,bmName,1,"পরীক্ষা বেছে নিন").replace("<select ",`<select onchange="bmName=this.value;drawBm()" ${bmCls?"":"disabled"} `)}</div></div>`
 +(ps.length?`<div class="card ov" style="padding:0;margin-top:8px"><table class="tb" id="bmt"><tr><th>#</th><th>শিক্ষার্থী</th>${ps.map(p=>`<th>${esc(p.subject)}<br><small>/${bn(p.total||100)}</small></th>`).join("")}</tr>${l.map((x,i)=>`<tr><td>${bn(i+1)}</td><td><b>${esc(x.name)}</b></td>${ps.map(p=>{const v=p.marks&&p.marks[x.id]!==undefined?p.marks[x.id]:"";return `<td style="text-align:center"><input id="bm_${p.id}_${x.id}" type="number" inputmode="decimal" value="${v}" placeholder="-" oninput="bmIn(this,${+p.total||100})" style="width:64px;margin:0;text-align:center"><div id="bg_${p.id}_${x.id}" style="min-height:18px">${v!==""?gchip(gr(+v/(+p.total||100)*100)):""}</div></td>`}).join("")}</tr>`).join("")}</table></div><div style="display:flex;justify-content:space-between;align-items:center;margin-top:10px"><small id="bmc"></small><div><button class="btn o s" onclick="closeM()">বাতিল</button> <button class="btn s" onclick="bmSave()">💾 সংরক্ষণ করুন</button></div></div>`:`<div class="em">${bmCls?"পরীক্ষা বেছে নিন":"শ্রেণি ও পরীক্ষা নির্বাচন করুন"}</div>`));
 $("mt").onclick=null;bmCount();
}
function bmCount(){const c=$("bmc");if(!c)return;const n=[...document.querySelectorAll("#bmt input")].filter(i=>i.value!=="").length;c.textContent=bn(n)+"টি নম্বর প্রবেশ করানো হয়েছে"}
function bmIn(el,tot){const g=$(el.id.replace("bm_","bg_"));if(g)g.innerHTML=el.value===""?"":gchip(gr(+el.value/tot*100));bmCount()}
function bmSave(){
 bmPapers().forEach(p=>{p.marks=p.marks||{};activeStu(bmCls).forEach(x=>{const el=$("bm_"+p.id+"_"+x.id);if(!el)return;const v=el.value.trim();if(v==="")delete p.marks[x.id];else p.marks[x.id]=Math.min(+v,+p.total||100)})});
 logA("edit","ফলাফল","বাল্ক নম্বর এন্ট্রি: "+bmName+" ("+bmCls+")");save();closeM();render();
}
/* ---- class result sheet ---- */
function shOpen(){shCls=xCls||xClsList()[0]||"";shType=xType||"";shYear=Store.school.year||"";cardCtx={kind:"sh"};drawSh()}
function shData(){
 const ps=Store.exams.filter(e=>e.cls==shCls&&(!shType||e.type==shType)),subs=[...new Set(ps.map(p=>p.subject))];
 const rows=Store.students.filter(s=>s.cls==shCls).map(x=>{const r=stuRes(x,ps),cells=subs.map(n=>{const a=r.rows.filter(q=>q.p.subject==n);return a.length?{v:a.reduce((t,q)=>t+q.g,0),fail:a.some(q=>q.fail)}:null});return {x,r,cells}}).filter(b=>b.r.n).sort((a,b)=>b.r.pc-a.r.pc);
 rows.forEach((b,i)=>b.rank=i+1);
 return {subs,rows,year:shYear};
}
function shHtml(d){
 const sc=Store.school,G="#1b6b34",th=`style="background:${G};color:#fff;padding:5px 3px;font-size:10px"`,td="padding:4px 3px;border-bottom:1px solid #e5e7eb;text-align:center;font-size:11px";
 const lg=sc.logo?`<img src="${safeDataImage(sc.logo)}" style="width:52px;height:52px;border-radius:50%;object-fit:cover;background:#fff;border:2px solid #f5c518">`:`<div style="width:52px;height:52px;border-radius:50%;background:#fff;border:2px solid #f5c518;display:flex;align-items:center;justify-content:center;font-size:24px">🕌</div>`;
 const dt=bn(fdt(new Date()))+" ইং";
 const tot=d.rows.length,fl=d.rows.filter(b=>b.r.fail).length,ps=tot-fl,rate=tot?(ps/tot*100).toFixed(1):"0.0";
 const stat=(l,v,c)=>`<div style="flex:1;text-align:center;border:1px solid #e5e7eb;border-radius:10px;padding:6px 4px;background:#fff"><div style="font-size:11px;color:#555">${l}</div><div style="font-size:16px;font-weight:700;color:${c||G}">${v}</div></div>`;
 const sig=(l,im)=>`<div style="flex:1;text-align:center">${im?`<div style="height:40px;display:flex;align-items:flex-end;justify-content:center">${sigImg(38)}</div>`:""}<div style="border-top:1px solid #333;margin:0 14px;padding-top:3px;font-size:11px">${l}</div></div>`;
 return `<div style="font-family:sans-serif;color:#222;background:#fff;min-width:560px;border:2px solid ${G};border-radius:10px;overflow:hidden">
${pdfHdr(`ক্লাস রেজাল্ট শীট — শ্রেণি: ${esc(shCls)}${shType?" · "+esc(shType):""} · শিক্ষাবর্ষ: ${esc(d.year||"")}`,1)}
<div style="padding:8px;background:#f3faf4"><table style="width:100%;border-collapse:collapse;background:#fff"><tr><th ${th}>মেধা</th><th ${th}>নাম</th><th ${th}>রোল</th>${d.subs.map(n=>`<th ${th}>${esc(n)}</th>`).join("")}<th ${th}>মোট</th><th ${th}>গড় নাম্বার</th><th ${th}>গ্রেড</th></tr>${d.rows.map(b=>`<tr><td style="${td};color:${G};font-weight:700">#${bn(b.rank)}</td><td style="${td};text-align:left">${esc(b.x.name)}</td><td style="${td}">${esc(b.x.roll)}</td>${b.cells.map(c=>`<td style="${td};${c&&c.fail?"color:#c62828":""}">${c?bn(c.v):"-"}</td>`).join("")}<td style="${td}"><b>${bn(b.r.T)}/${bn(b.r.F)}</b></td><td style="${td}">${bn(b.r.pc.toFixed(1))}%</td><td style="${td};${b.r.fail?"color:#c62828":""}"><b>${b.r.gr}</b></td></tr>`).join("")||`<tr><td colspan="${d.subs.length+6}" style="${td};padding:16px">কোনো ফলাফল নেই</td></tr>`}</table></div>
<div style="display:flex;gap:8px;padding:4px 8px 8px;background:#f3faf4">${stat("মোট শিক্ষার্থী",bn(tot))}${stat("উত্তীর্ণ শিক্ষার্থী",bn(ps))}${stat("অনুত্তীর্ণ শিক্ষার্থী",bn(fl),fl?"#c62828":G)}${stat("পাশের হার",bn(rate)+"%")}</div>
<div style="display:flex;align-items:flex-end;gap:10px;padding:30px 12px 6px;background:#f3faf4">${sig("শ্রেণি শিক্ষকের স্বাক্ষর")}<div style="flex:none;width:74px;height:74px;border:1.5px dashed #888;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:10px;color:#777;text-align:center;line-height:1.2">প্রতিষ্ঠানের<br>সিল</div>${sig("প্রধান শিক্ষকের স্বাক্ষর",1)}</div><div style="padding:4px 14px 12px;background:#f3faf4;font-size:11px;color:#333">তারিখ: ${dt}</div></div>`;
}
function drawSh(){
 const d=shData(),pass=d.rows.filter(b=>!b.r.fail).length,avg=d.rows.length?d.rows.reduce((a,b)=>a+b.r.gpa,0)/d.rows.length:0,tl=(n,l,c)=>`<div style="flex:1;background:var(--bg);border-radius:10px;text-align:center;padding:8px 2px"><b style="font-size:18px;color:${c}">${n}</b><div style="font-size:10px;color:var(--mu)">${l}</div></div>`;
 modal(HND+`<h2 style="text-align:center;font-size:16px">ক্লাস রেজাল্ট শীট</h2><div class="g2" style="margin:0"><div>${fsel("শ্রেণি","sh_c",xClsList(),shCls,1).replace("<select ",'<select onchange="shCls=this.value;drawSh()" ')}</div><div>${fsel("পরীক্ষার ধরন","sh_t",XT,shType,0,"সব ধরন").replace("<select ",'<select onchange="shType=this.value;drawSh()" ')}</div></div><label class="lb">শিক্ষাবর্ষ</label><input value="${esc(shYear)}" oninput="shYear=this.value;pvUp()">
 <small style="color:var(--mu)">প্রতিষ্ঠানের তথ্য (স্বয়ংক্রিয়ভাবে লোড হয়, প্রয়োজনে সম্পাদনা করুন)</small>${logoRow()}${schFields([["name","প্রতিষ্ঠানের নাম *"],["nameEn","ইংরেজি নাম"],["addr","ঠিকানা"],["phone","ফোন"],["est","স্থাপনা সাল"],["director","পরিচালক / প্রধান শিক্ষক"]])}
 <div style="display:flex;gap:6px;margin:10px 0">${tl(bn(d.rows.length),"মোট শিক্ষার্থী","#16a34a")}${tl(bn(d.subs.length),"বিষয় সংখ্যা","#7c3aed")}${tl(bn(pass),"উত্তীর্ণ","#16a34a")}${tl(bn(d.rows.length-pass),"অনুত্তীর্ণ","#e11d48")}${tl(bn(avg.toFixed(2)),"গড় GPA","#ea580c")}</div>
 <div id="pv" style="overflow:auto;border:1px solid var(--ln);border-radius:10px">${shHtml(d)}</div><div class="g2" style="margin:10px 0 0"><button class="ob" onclick="printCard()">🖨 প্রিন্ট করুন</button><button class="btn g" onclick="printCard()">⬇ PDF ডাউনলোড</button></div><button class="btn o" style="width:100%;margin-top:8px" onclick="closeM()">বন্ধ</button>`);
 $("mt").onclick=null;
}
/* ---- exam calendar ---- */
function calPapers(){return Store.exams.filter(e=>(!calCls||e.cls==calCls))}
function xc(){
 const T=today(),ps=calPapers(),first=new Date(calY,calM,1).getDay(),dim=new Date(calY,calM+1,0).getDate(),mo=mk(calY,calM);
 const cells=Array.from({length:first},()=>"<div></div>").concat(Array.from({length:dim},(_,i)=>{const d=mo+"-"+p2(i+1),es=ps.filter(e=>e.date==d);return `<div class="cd ${d==T?"td":""}" style="min-height:58px"><span>${bn(i+1)}</span>${es.slice(0,2).map(e=>`<div class="xch" style="background:${xcol(e.type)}" onclick="exDet('${e.id}')">${esc(e.subject)}</div>`).join("")}${es.length>2?`<small style="font-size:9px;color:var(--mu)" onclick="dayList('${d}')">+${bn(es.length-2)} আরও</small>`:""}</div>`}));
 const up=ps.filter(e=>e.date>=T).sort(byDate);
 return phdr("পরীক্ষার ক্যালেন্ডার","পরীক্ষার সময়সূচি, সিলেবাস ও রিমাইন্ডার ব্যবস্থাপনা")
 +`<div style="display:flex;gap:8px;margin:12px 0"><select onchange="calCls=this.value;render()" style="margin:0;flex:1"><option value="">সব শ্রেণি</option>${xClsList().map(c=>`<option ${calCls==c?"selected":""}>${esc(c)}</option>`).join("")}</select><button class="btn" onclick="calForm()">＋ পরীক্ষা যোগ</button></div>
 <div class="card" style="padding:10px"><div class="ch"><button class="ob" style="padding:4px 12px" onclick="calMv(-1)">‹</button><b>${MN[calM]} ${bn(calY)}</b><button class="ob" style="padding:4px 12px" onclick="calMv(1)">›</button></div><div class="cal">${["রবি","সোম","মঙ্গল","বুধ","বৃহস্পতি","শুক্র","শনি"].map(d=>`<div class="wd" style="font-size:9px">${d}</div>`).join("")}${cells.join("")}</div><div style="display:flex;flex-wrap:wrap;gap:8px;margin-top:10px;font-size:10px">${XT.map(t=>`<span><i style="display:inline-block;width:9px;height:9px;border-radius:2px;background:${xcol(t)};margin-right:3px"></i>${t}</span>`).join("")}</div></div>
 <div class="card"><b style="font-size:14px">📅 আসন্ন পরীক্ষা</b>${up.slice(0,5).map(e=>`<div class="row" onclick="exDet('${e.id}')"><span style="width:6px;height:30px;border-radius:3px;background:${xcol(e.type)}"></span><div class="f"><b>${esc(e.subject)}</b> <span class="pl">${esc(e.cls)}</span><small>${esc(e.name)} · ${bn(e.date)}</small></div></div>`).join("")||'<div class="em">কোনো আসন্ন পরীক্ষা নেই</div>'}</div>
 <div class="card" style="line-height:2"><div style="display:flex;justify-content:space-between">মোট পরীক্ষা <b>${bn(ps.length)}</b></div><div style="display:flex;justify-content:space-between">আসন্ন <b style="color:#16a34a">${bn(up.length)}</b></div><div style="display:flex;justify-content:space-between">রিমাইন্ডার পাঠানো <b style="color:var(--gr)">${bn(ps.filter(e=>e.reminded).length)}</b></div></div>`;
}
function calMv(n){calM+=n;if(calM<0){calM=11;calY--}if(calM>11){calM=0;calY++}render()}
function dayList(d){modal(HND+`<h2 style="font-size:16px;margin-bottom:8px">${bn(d)} — পরীক্ষা</h2>`+calPapers().filter(e=>e.date==d).map(e=>`<div class="row" onclick="exDet('${e.id}')"><span style="width:6px;height:30px;border-radius:3px;background:${xcol(e.type)}"></span><div class="f"><b>${esc(e.subject)}</b> <span class="pl">${esc(e.cls)}</span><small>${esc(e.name)}</small></div></div>`).join("")+`<button class="btn o" style="width:100%;margin-top:10px" onclick="closeM()">বন্ধ</button>`)}
function exDet(id){
 const e=Store.exams.find(x=>x.id==id),k=(l,v)=>`<div><small style="color:var(--mu)">${l}</small><div><b style="font-size:14px">${esc(v||"—")}</b></div></div>`;
 modal(HND+`<div style="display:flex;justify-content:space-between;align-items:flex-start;gap:8px;margin-bottom:10px"><b style="font-size:15px"><i style="display:inline-block;width:10px;height:10px;border-radius:50%;background:${xcol(e.type)};margin-right:6px"></i>${esc(e.name)}</b><span onclick="closeM()" style="padding:0 6px">✕</span></div>
 <div class="g2" style="gap:12px 10px">${k("বিষয়",e.subject)}${k("শ্রেণী",e.cls)}${k("তারিখ",e.date?bn(fdt(e.date)):"")}${k("ধরন",e.type)}${k("সময়",(e.start||"")+(e.end?" - "+e.end:""))}${k("মোট নম্বর",bn(e.total||100))}${k("কক্ষ",e.room)}${k("পরিদর্শক",e.inv)}</div>${e.syllabus?`<div style="margin:6px 0"><small style="color:var(--mu)">সিলেবাস</small><div style="font-size:13px">${esc(e.syllabus)}</div></div>`:""}${e.note?`<div style="margin:6px 0"><small style="color:var(--mu)">বিশেষ নির্দেশনা</small><div style="font-size:13px">${esc(e.note)}</div></div>`:""}
 <button class="btn" style="width:100%;margin-top:10px" onclick="exRemind('${id}')">🔔 রিমাইন্ডার পাঠান</button><div style="display:flex;gap:8px;margin-top:8px"><button class="btn r" style="flex:0 0 52px" onclick="exDel('${id}')">🗑</button><button class="btn o" style="flex:1" onclick="calForm('${id}')">✏️ সম্পাদনা</button></div>`);
}
function exRemind(id){
 const e=Store.exams.find(x=>x.id==id),ids=activeStu(e.cls).filter(x=>x.phone).map(x=>x.id);
 if(!ids.length){alert("এই শ্রেণিতে মোবাইল নম্বর সহ কোনো শিক্ষার্থী নেই");return}
 closeM();msgM(ids,"প্রিয় অভিভাবক,\n\nআপনার সন্তান {নাম} (শ্রেণি: {শ্রেণি})-এর "+e.name+" ("+e.subject+") পরীক্ষা "+bn(e.date)+" তারিখে"+(e.start?" "+e.start+(e.end?"-"+e.end:"")+" টায়":"")+(e.room?", কক্ষ: "+e.room:"")+" অনুষ্ঠিত হবে।\n\nধন্যবাদ\n"+Store.school.name,()=>{e.reminded=Date.now();save()});
}
/* ---- exam routine ---- */
function xt(){
 const cl=xClsList(),gs=exGroups(e=>!xtCls||e.cls==xtCls),g=gs.find(v=>v.key==xtKey)||gs[0],dy=d=>{try{return new Date(d+"T00:00:00").toLocaleDateString(LC(),{weekday:"long"})}catch(z){return ""}};
 const ps=g?g.papers:[];
 return phdr("পরীক্ষার রুটিন","পরীক্ষার সময়সূচি (রুটিন) তৈরি ও প্রিন্ট করুন")
 +`<div style="display:flex;gap:8px;flex-wrap:wrap;margin:12px 0"><button class="btn" onclick="calForm(null,${g?`{name:'${jsq(g.name)}',cls:'${jsq(g.cls)}',type:'${jsq(g.type||"")}'}`:"null"})">＋ বিষয় যোগ</button><button class="ob" onclick="xtPdf()">🗎 PDF</button></div>
 <div class="card"><div class="g2" style="margin:0"><select onchange="xtCls=this.value;xtKey='';render()" style="margin:0"><option value="">সব শ্রেণি</option>${cl.map(c=>`<option ${xtCls==c?"selected":""}>${esc(c)}</option>`).join("")}</select><select onchange="xtKey=this.value;render()" style="margin:0">${gs.map(v=>`<option value="${esc(v.key)}" ${g&&v.key==g.key?"selected":""}>${esc(v.name)}${xtCls?"":" ("+esc(v.cls)+")"}</option>`).join("")||"<option>কোনো পরীক্ষা নেই</option>"}</select></div></div>`
 +(g?`<div class="card ov" style="padding:6px"><div style="text-align:center;font-weight:700;padding:6px">${esc(g.name)} — ${esc(g.cls)}</div><table class="tb rtt"><tr><th>ক্রম</th><th>তারিখ</th><th>বার</th><th>বিষয়</th><th>সময়</th><th>কক্ষ</th></tr>${ps.map((e,i)=>`<tr onclick="calForm('${e.id}')"><td>${bn(i+1)}</td><td>${bn(e.date||"")}</td><td>${e.date?dy(e.date):""}</td><td><b>${esc(e.subject)}</b></td><td>${esc((e.start||"")+(e.end?" - "+e.end:""))}</td><td>${esc(e.room||"")}</td></tr>`).join("")}</table></div>`:'<div class="em">কোনো পরীক্ষা নেই। "＋ বিষয় যোগ" বা পরীক্ষা ও ফলাফল থেকে পরীক্ষা তৈরি করুন।</div>');
}
function xtPdf(){
 const gs=exGroups(e=>!xtCls||e.cls==xtCls),g=gs.find(v=>v.key==xtKey)||gs[0];if(!g){alert("কোনো পরীক্ষা নেই");return}
 const dy=d=>{try{return new Date(d+"T00:00:00").toLocaleDateString(LC(),{weekday:"long"})}catch(z){return ""}};
 printDoc("exam-routine",sch()+`<style>.ptb td,.ptb th{border:1px solid #b9e6cd;font-size:12px;padding:6px 7px}</style><div style="text-align:center;margin-bottom:10px;font-weight:700">${esc(g.name)} — পরীক্ষার রুটিন — শ্রেণি: ${esc(g.cls)}</div><table class="ptb" style="border:1px solid #1d4ed8"><tr><th style="background:#2563eb;color:#fff">ক্রম</th><th style="background:#2563eb;color:#fff">তারিখ</th><th style="background:#2563eb;color:#fff">বার</th><th style="background:#2563eb;color:#fff">বিষয়</th><th style="background:#2563eb;color:#fff">সময়</th><th style="background:#2563eb;color:#fff">কক্ষ</th></tr>${g.papers.map((e,i)=>`<tr><td>${bn(i+1)}</td><td>${bn(e.date||"")}</td><td>${e.date?dy(e.date):""}</td><td>${esc(e.subject)}</td><td>${esc((e.start||"")+(e.end?" - "+e.end:""))}</td><td>${esc(e.room||"")}</td></tr>`).join("")}</table>`+
    `<div style="margin-top:18px;font-size:12.5px;line-height:2;page-break-inside:avoid">${["পরীক্ষা শুরু হওয়ার ২০ মিনিট পূর্বে হলে প্রবেশ করতে হবে।","কলম, বোর্ড ও পরীক্ষার প্রয়োজনীয় আসবাব ব্যতিত অন্য কিছু সঙ্গে আনবে না।","প্রতিষ্ঠানের নির্ধারিত পোষাক পরিধান করে হলে প্রবেশ করবে।","পরীক্ষার হলে কোন অভিভাবক প্রবেশ করতে পারবে না।","পরীক্ষা চলাকালীন কোন অবৈধ কার্যক্রম পরিলক্ষিত হলে কর্তৃপক্ষের যে কোন সিদ্ধান্ত মানতে বাধ্য থাকবে।"].map((t,i)=>`<div>${bn(i+1)}। ${t}</div>`).join("")}</div>`+
    `<div style="margin-top:30px;display:flex;justify-content:flex-end;page-break-inside:avoid"><div style="min-width:170px;text-align:center"><div style="height:56px;display:flex;align-items:flex-end;justify-content:center">${sigImg(54)}</div><div style="border-top:1px solid #333;padding-top:4px;font-size:12.5px">পরিচালকের স্বাক্ষর</div></div></div>`);
}
/* ---- certificates ---- */
const CST=["প্রত্যয়নপত্র","প্রশংসা পত্র","সার্টিফিকেট"],CSP={"প্রত্যয়নপত্র":["চরিত্র প্রত্যয়নপত্র","অধ্যয়ন প্রত্যয়নপত্র","ভর্তির প্রত্যয়নপত্র","ছাড়পত্র (টিসি)"],"প্রশংসা পত্র":["প্রথম স্থান অধিকার","ভালো ফলাফল","নিয়মিত উপস্থিতি","বিশেষ কৃতিত্ব"],"সার্টিফিকেট":["হিফজ সমাপনী","শিক্ষা সমাপনী","অংশগ্রহণ সনদ","অন্যান্য"]};
let csD={},csId=null;
function xs(){
 const l=Store.certs.filter(c=>c.type==csTab&&(!csCls||c.cls==csCls)&&(!csQ||[c.name,c.roll,c.serial].join(" ").toLowerCase().includes(csQ.toLowerCase())));
 return phdr("প্রত্যয়নপত্র ও সার্টিফিকেট","শিক্ষার্থীদের জন্য প্রত্যয়নপত্র ও সার্টিফিকেট জারি, প্রিন্ট ও শেয়ার")
 +`<button class="btn g" style="margin:12px 0" onclick="csForm()">＋ নতুন জারি</button>
 <div style="display:flex;gap:6px;margin-bottom:10px">${CST.map(t=>`<button class="ob" style="flex:1;padding:10px 4px;${csTab==t?"background:#16a34a;color:#fff;border-color:#16a34a":""}" onclick="csTab='${t}';render()">${t} <span class="pl" style="margin:0;background:#fff;color:#16a34a">${bn(Store.certs.filter(c=>c.type==t).length)}</span></button>`).join("")}</div>
 <input placeholder="🔍 নাম, রোল বা ক্রমিক নম্বর দিয়ে খুঁজুন..." value="${esc(csQ)}" oninput="csQ=this.value;csKeep()"><select onchange="csCls=this.value;render()"><option value="">সকল শ্রেণি</option>${xClsList().map(c=>`<option ${csCls==c?"selected":""}>${esc(c)}</option>`).join("")}</select><div id="cslst">${csCards(l)}</div>`;
}
function csCards(l){return l.map(c=>`<div class="card" style="padding:12px"><div style="display:flex;gap:10px"><div class="av" style="width:40px;height:40px;background:#dcfce7;font-size:18px;border-radius:10px">📜</div><div class="f"><b>${esc(c.name)}</b><small style="color:var(--mu);font-size:12px">${esc(c.purpose||c.type)}</small><div style="margin-top:4px"><span class="pl b">${esc(c.cls||"")}</span><span class="pl">রোল: ${esc(c.roll||"")}</span></div></div></div><div style="display:flex;justify-content:space-between;align-items:center;border-top:1px solid var(--ln);margin-top:8px;padding-top:8px"><small style="color:var(--mu)">তারিখ: ${bn(c.date)}<br>ক্রমিক: ${bn(c.serial||"")}</small><div style="font-size:18px;display:flex;gap:14px"><span onclick="csView('${c.id}')" style="color:#16a34a">👁</span><span onclick="csForm('${c.id}')">✏️</span><span onclick="csDel('${c.id}')" style="color:var(--rd)">🗑</span></div></div></div>`).join("")||'<div class="em">কোনো নথি নেই। "নতুন জারি" চাপুন।</div>'}
function csKeep(){const e=$("cslst");if(e)e.innerHTML=csCards(Store.certs.filter(c=>c.type==csTab&&(!csCls||c.cls==csCls)&&(!csQ||[c.name,c.roll,c.serial].join(" ").toLowerCase().includes(csQ.toLowerCase()))))}
function csGrab(){["sid","name","father","mother","roll","cls","branch","type","purpose","serial","date","yFrom","yTo","remark","result","text","signer"].forEach(k=>{const e=$("cs_"+k);if(e)csD[k]=e.value.trim()})}
function csForm(id){
 csId=id||null;const o=Store.certs.find(c=>c.id==id);
 csD=o?{...o}:{type:csTab,date:today(),yFrom:String(new Date().getFullYear()-1),yTo:String(new Date().getFullYear()),signer:Store.school.director||""};drawCs();
}
function drawCs(){
 const t=csD.type||csTab,pu=CSP[t];
 modal(HND+`<h2 style="text-align:center;font-size:16px;margin-bottom:6px">${csId?"নথি সম্পাদনা":"নতুন প্রত্যয়নপত্র / সার্টিফিকেট"}</h2>${fsel("শিক্ষার্থী নির্বাচন","cs_sid",Store.students.map(s=>[s.id,s.name+" ("+s.cls+")"]),csD.sid,0,"শিক্ষার্থী বাছাই করুন").replace("<select ",'<select onchange="csFill(this.value)" ')}
 <div class="g2" style="margin:0"><div>${fi("শিক্ষার্থীর নাম","cs_name",csD.name,"text",1)}</div><div>${fi("পিতার নাম","cs_father",csD.father)}</div><div>${fi("মাতার নাম","cs_mother",csD.mother)}</div><div>${fi("রোল নম্বর","cs_roll",csD.roll)}</div><div>${fi("শ্রেণি","cs_cls",csD.cls)}</div><div>${fi("শাখা","cs_branch",csD.branch)}</div><div>${fsel("নথির ধরন","cs_type",CST,t).replace("<select ",'<select onchange="csGrab();csD.purpose=\'\';drawCs()" ')}</div><div>${fsel("প্রয়োজন","cs_purpose",pu,csD.purpose||pu[0])}</div><div>${fi("ক্রমিক নম্বর","cs_serial",csD.serial,"text",0,"যেমন: ২০২৬/০১")}</div><div>${fi("জারির তারিখ","cs_date",csD.date,"date",1)}</div><div>${fi("শিক্ষাবর্ষ (থেকে)","cs_yFrom",csD.yFrom)}</div><div>${fi("শিক্ষাবর্ষ (পর্যন্ত)","cs_yTo",csD.yTo)}</div></div>
 ${fi("চরিত্র মন্তব্য (ঐচ্ছিক)","cs_remark",csD.remark,"text",0,"যেমন: সৎ, বিনয়ী ও শৃঙ্খলাবদ্ধ")}${fi("ফলাফল সারসংক্ষেপ (ঐচ্ছিক)","cs_result",csD.result,"text",0,"যেমন: GPA 5.00, প্রথম স্থান")}<label class="lb">মূল বিবরণ (খালি রাখলে স্বয়ংক্রিয়ভাবে তৈরি হবে)</label><textarea id="cs_text" rows="3" placeholder="খালি রাখলে ডিফল্ট টেক্সট ব্যবহৃত হবে">${esc(csD.text)}</textarea>${fi("স্বাক্ষরকারী (প্রধান শিক্ষক)","cs_signer",csD.signer,"text",0,"প্রধান শিক্ষকের নাম")}
 <button class="btn g" style="width:100%;margin-top:6px" onclick="csSave()">জারি করুন</button><button class="btn o" style="width:100%;margin-top:8px" onclick="closeM()">বাতিল</button>`);$("mt").onclick=null;
}
function csFill(sid){const x=sOf(sid);if(!x)return;csGrab();Object.assign(csD,{sid,name:x.name,father:x.guardian||"",roll:x.roll||"",cls:x.cls||"",branch:x.branch||""});drawCs()}
function csSave(){
 csGrab();const d=csD;if(!d.name||!d.date){alert("শিক্ষার্থীর নাম ও জারির তারিখ দিন");return}
 if(!d.purpose)d.purpose=CSP[d.type||csTab][0];
 if(!d.serial){const y=d.date.slice(0,4);d.serial=y+"/"+p2(Store.certs.filter(c=>(c.date||"").slice(0,4)==y).length+1)}
 if(csId)Object.assign(Store.certs.find(c=>c.id==csId),d);else Store.certs.push({id:uid(),...d});
 csTab=d.type;logA(csId?"edit":"add","নথি",d.type+" জারি: "+d.name);save();closeM();render();
}
function csDel(id){if(!confirm("নথিটি মুছবেন?"))return;Store.certs=Store.certs.filter(c=>c.id!=id);save();render()}
function csText(c){
 if(c.text)return esc(c.text).replace(/\n/g,"<br>");
 const who=`<b>${esc(c.name)}</b>${c.father?", পিতা: <b>"+esc(c.father)+"</b>":""}${c.mother?", মাতা: <b>"+esc(c.mother)+"</b>":""}`,cl=`শ্রেণি: <b>${esc(c.cls||"")}${c.branch?" ("+esc(c.branch)+")":""}</b>${c.roll?", রোল: <b>"+esc(c.roll)+"</b>":""}`,yr=`শিক্ষাবর্ষ ${esc(c.yFrom||"")}${c.yTo?"–"+esc(c.yTo):""}`;
 if(c.type=="প্রশংসা পত্র")return `${who} (${cl}) — ${yr}। <b>${esc(c.purpose)}</b> উপলক্ষে তাকে এই প্রশংসাপত্র প্রদান করা হলো।${c.result?" ("+esc(c.result)+")":""}<br>আমরা তার উজ্জ্বল ভবিষ্যৎ কামনা করি।`;
 if(c.type=="সার্টিফিকেট")return `এই মর্মে প্রত্যয়ন করা যাচ্ছে যে, ${who} (${cl}) — ${yr} — <b>${esc(c.purpose)}</b> সফলভাবে সম্পন্ন করেছে।${c.result?" ফলাফল: <b>"+esc(c.result)+"</b>।":""}${c.remark?" তার চরিত্র "+esc(c.remark)+"।":""}<br>আমরা তার সর্বাঙ্গীণ সফলতা কামনা করি।`;
 return `এই মর্মে প্রত্যয়ন করা যাচ্ছে যে, ${who} (${cl}) এই প্রতিষ্ঠানের একজন নিয়মিত শিক্ষার্থী। ${yr}।<br>তার চরিত্র ${esc(c.remark||"ভালো")}।${c.result?" ফলাফল: "+esc(c.result)+"।":""} <b>${esc(c.purpose)}</b>-এর জন্য এই প্রত্যয়নপত্র প্রদান করা হলো।<br>আমি তার সর্বাঙ্গীণ উন্নতি ও মঙ্গল কামনা করি।`;
}
function csHtml(c){
 const sc=Store.school,G="#1b6b34",lg=sc.logo?`<img src="${safeDataImage(sc.logo)}" style="width:54px;height:54px;border-radius:50%;object-fit:cover">`:'<div style="font-size:34px">🕌</div>';
 return `<div style="font-family:sans-serif;color:#222;border:4px double ${G};padding:18px 16px;max-width:460px;margin:8px auto;background:#fff;text-align:center"><div style="display:flex;justify-content:center;align-items:center;gap:10px">${lg}<div><div style="font-size:20px;font-weight:700;color:${G}">${esc(sc.name)}</div><div style="font-size:12px;color:#8a6d00;font-weight:700">${esc(sc.nameEn||"")}</div><div style="font-size:11px;color:#555">${esc(sc.addr)}</div></div></div>
 <div style="display:inline-block;margin:14px 0 6px;border-bottom:2px solid ${G};padding:0 18px 3px;font-size:20px;font-weight:700;color:${G}">${esc(c.type)}</div><div style="display:flex;justify-content:space-between;font-size:11px;color:#555;margin-bottom:12px"><span>ক্রমিক নং: ${bn(c.serial||"")}</span><span>তারিখ: ${bn(c.date)}</span></div>
 <div style="font-size:14px;line-height:2;text-align:justify">${csText(c)}</div><div style="display:flex;justify-content:flex-end;margin-top:14px"><div style="text-align:center;min-width:130px"><div style="height:44px;display:flex;align-items:flex-end;justify-content:center">${!c.signer||c.signer===sc.director?sigImg(42):""}</div><div style="font-size:12px;border-top:1px solid #777;padding-top:4px"><b>${esc(c.signer||sc.director||"")}</b><br>প্রধান শিক্ষক</div></div></div></div>`;
}
function csView(id){
 const c=Store.certs.find(x=>x.id==id);window._cs=c;
 modal(HND+`<h2 style="font-size:16px;margin-bottom:6px">📜 ${esc(c.type)} — ${esc(c.name)}</h2><div style="background:#eef3ee;padding:6px;border-radius:12px;overflow:auto">${csHtml(c)}</div><div class="g2" style="margin:10px 0 0"><button class="ob" onclick="printDoc('certificate',csHtml(window._cs))">🖨 প্রিন্ট</button><button class="btn g" onclick="printDoc('certificate',csHtml(window._cs))">⬇ PDF ডাউনলোড</button></div><div class="g2" style="margin:8px 0 0"><button class="btn o" onclick="csWa()">💬 WhatsApp</button><button class="btn o" onclick="closeM();csForm('${id}')">✏️ সম্পাদনা</button></div><button class="btn o" style="width:100%;margin-top:8px" onclick="closeM()">বন্ধ</button>`);
}
function csWa(){const c=window._cs,x=c.sid?sOf(c.sid):null;if(!x||!x.phone){alert("অভিভাবকের মোবাইল নম্বর পাওয়া যায়নি (শিক্ষার্থী নির্বাচন করে জারি করলে নম্বর যুক্ত হয়)");return}sendTo(x,"wa",Store.school.name+"\n"+c.type+" — "+c.name+"\nক্রমিক: "+bn(c.serial||"")+" · তারিখ: "+bn(c.date)+"\nপ্রয়োজন: "+c.purpose)}
