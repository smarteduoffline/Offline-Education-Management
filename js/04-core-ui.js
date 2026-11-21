function render(){
 updateNet();
 if(!unlocked){$("nv").innerHTML="";$("v").innerHTML=loginView();return}
 if(subLocked()){$("nv").innerHTML="";$("v").innerHTML=subLockView();return}
 if(!canTab(tab))tab="home";
 const k=JSON.stringify([tab,sub,curExam,profId]);if(curKey&&k!==curKey&&!goingBack){hist.push(curKey);if(hist.length>60)hist.shift()}curKey=k;goingBack=false;
 $("nv").innerHTML=(isParent()?PTABS:TABS).filter(t=>canTab(t[0])).map(t=>t[0]=="back"?`<button class="bk" onclick="goBack()"><b>${t[1]}</b> ${t[2]}</button>`:`<button class="${tab==t[0]?"on":""}" onclick="go('${t[0]}')"><b>${t[1]}</b>${t[2]}</button>`).join("");
 $("v").innerHTML=safeHtml(appHeader()+({home,att,stu,fee,more,portal})[tab]());
}
function goBack(){
 if($("mt")){closeM();return}
 if(hist.length){const a=JSON.parse(hist.pop());goingBack=true;tab=a[0];sub=a[1];curExam=a[2];profId=a[3];q="";render();$("v").scrollTop=0;return}
 if(tab!="home"){go("home");return}
 toast("আপনি হোম পেইজে আছেন")
}
function go(t){if(!canTab(t)){alert("এই অংশটি আপনার role-এর জন্য অনুমোদিত নয়");return}tab=t;q="";sub="";curExam="";profId="";render();$("v").scrollTop=0}

let homeCls="",logAll=false,photoCb=null,photoDoc=false;
const p2=n=>String(n).padStart(2,"0");
function logA(ty,cat,tx){const row={t:Date.now(),ty,cat,tx,user:activeUser?.identifier||"local"};S.log.unshift(row);S.log=S.log.slice(0,60);S.audit.unshift(row);S.audit=S.audit.slice(0,200)}
function autoFees(){const d=new Date(),ym=mk(d.getFullYear(),d.getMonth()),mo=MN[d.getMonth()]+" "+bn(d.getFullYear());S.students.forEach(s=>{if(s.status=="নিষ্ক্রিয়")return;
 if(+s.monthlyFee>0&&!S.fees.some(f=>f.sid==s.id&&fym(f)==ym&&ftype(f)=="মাসিক বেতন"))S.fees.push({id:uid(),sid:s.id,title:"মাসিক বেতন — "+mo,amt:+s.monthlyFee,paid:0,date:today(),auto:ym,ym,type:"মাসিক বেতন"});
 if(s.type=="আবাসিক"&&+s.boardFee>0&&!S.fees.some(f=>f.sid==s.id&&fym(f)==ym&&ftype(f)=="বোর্ডিং খরচ"))S.fees.push({id:uid(),sid:s.id,title:"বোর্ডিং খরচ — "+mo,amt:+s.boardFee,paid:0,date:today(),auto:ym,ym,type:"বোর্ডিং খরচ"})})}
function bnDate(d){d=new Date(d.getTime()+((+(S.set&&S.set.bd)||0))*864e5);const Y=d.getFullYear(),st=new Date(d<new Date(Y,3,14)?Y-1:Y,3,14),sy=st.getFullYear(),n=Math.floor((new Date(d.getFullYear(),d.getMonth(),d.getDate())-st)/864e5),lp=(y=>y%4==0&&(y%100!=0||y%400==0))(sy+1),L=[31,31,31,31,31,30,30,30,30,30,lp?30:29,30],M=["বৈশাখ","জ্যৈষ্ঠ","আষাঢ়","শ্রাবণ","ভাদ্র","আশ্বিন","কার্তিক","অগ্রহায়ণ","পৌষ","মাঘ","ফাল্গুন","চৈত্র"];let m=0,r=n;while(m<11&&r>=L[m]){r-=L[m];m++}return bn(r+1)+" "+M[m]+", "+bn(sy-593)+" বাংলা"}
const HJM=["মুহাররম","সফর","রবিউল আউয়াল","রবিউস সানি","জমাদিউল আউয়াল","জমাদিউস সানি","রজব","শাবান","রমজান","শাওয়াল","জিলকদ","জিলহজ"];
function hjTab(d){const jdn=Math.floor(Date.UTC(d.getFullYear(),d.getMonth(),d.getDate())/864e5)+2440588;let l=jdn-1948440+10632;const n=Math.floor((l-1)/10631);l=l-10631*n+354;const j=Math.floor((10985-l)/5316)*Math.floor(50*l/17719)+Math.floor(l/5670)*Math.floor(43*l/15238);l=l-Math.floor((30-j)/15)*Math.floor(17719*j/50)-Math.floor(j/16)*Math.floor(15238*j/43)+29;const m=Math.floor(24*l/709);return[l-Math.floor(709*m/24),m,30*n+j-30]}
function hijri(d){
 const dd=new Date(d.getTime()+((+(S.set&&S.set.hj)||0))*864e5);let r=hjTab(dd);
 try{const p=new Intl.DateTimeFormat("en-u-ca-islamic-umalqura-nu-latn",{day:"numeric",month:"numeric",year:"numeric"}).formatToParts(dd),g=t=>+(p.find(x=>x.type==t)||{}).value,y=g("year"),m=g("month"),da=g("day");
  if(y==r[2]&&Math.abs(m-r[1])<=1&&da>=1&&da<=30&&Math.abs(da-r[0])<=2)r=[da,m,y]}catch(e){}
 return bn(r[0])+" "+HJM[r[1]-1]+", "+bn(r[2])+" হিজরী"}
function donut(segs,z,sw,t1,t2,c1){const r=(z-sw)/2,C=2*Math.PI*r,tot=segs.reduce((a,x)=>a+x.v,0);let off=0,cs="";
 if(!tot)cs=`<circle cx="${z/2}" cy="${z/2}" r="${r}" fill="none" stroke="#e3e7f0" stroke-width="${sw}"/>`;
 else segs.forEach(x=>{if(x.v>0){const l=C*x.v/tot;cs+=`<circle cx="${z/2}" cy="${z/2}" r="${r}" fill="none" stroke="${x.c}" stroke-width="${sw}" stroke-dasharray="${l} ${C-l}" stroke-dashoffset="${-off}" transform="rotate(-90 ${z/2} ${z/2})"/>`;off+=l}});
 return `<svg viewBox="0 0 ${z} ${z}" width="${z}" height="${z}" style="display:block;margin:4px auto">${cs}<text x="50%" y="${t2?"50%":"56%"}" text-anchor="middle" font-size="${t2?17:22}" font-weight="700" fill="${c1||"currentColor"}">${t1}</text>${t2?`<text x="50%" y="63%" text-anchor="middle" font-size="9" fill="#6b7385">${t2}</text>`:""}</svg>`}
function nav(t,sb){if(!canTab(t)){alert("এই অংশটি আপনার role-এর জন্য অনুমোদিত নয়");return}closeM();tab=t;sub=sb||"";curExam="";q="";profId="";render();$("v").scrollTop=0}
function drawer(){
 const sc=S.school,par=isParent();
 const on=(t,sb)=>tab===t&&(t!=="more"||sub===sb);
 const L=(t,sb,ic,lb)=>({t,sb,ic,lb});
 const G=par?[{items:[L("home","","home","হোম"),L("portal","","stu","অভিভাবক পোর্টাল")]}]:[
  {items:[L("home","","home","ড্যাশবোর্ড")]},
  {title:"শিক্ষার্থী ও শিক্ষক",ic:"stu",items:[L("stu","","stu","শিক্ষার্থী"),L("more","teach","teach","শিক্ষক"),L("more","staff","staff","কর্মকর্তা/কর্মচারী")]},
  {items:[L("att","","att","উপস্থিতি")]},
  {title:"একাডেমিক",ic:"book",items:[L("more","cp","book","শ্রেণী ও পাঠ্য"),L("more","xh","exam","পরীক্ষা ও ফলাফল"),L("more","reports","report","রিপোর্ট"),L("more","lib","lib","লাইব্রেরি")]},
  {title:"যোগাযোগ",ic:"sms",items:[L("more","sms","sms","SMS (অভিভাবক)"),L("more","notice","bell","নোটিশ বোর্ড")]},
  {title:"ফিন্যান্স ও হিসাব",ic:"fee",items:[L("fee","","fee","ফি"),L("more","fh","fin","ফিন্যান্স ও হিসাব")]},
  {title:"অ্যাডমিন ও টুলস",ic:"set",items:[L("more","bkp","set","ব্যাকআপ ও রিসাইকেল বিন"),L("more","set","set","সেটিংস"),L("more","sat","crown","Super Admin Tool")]},
  {title:"সাহায্য",ic:"help",items:[L("more","ha","info","এপ সম্পর্কে"),L("more","hg","video","ইউজার গাইডলাইন"),L("more","hf","sms","ফিডব্যাক")]}
 ];
 const ok=x=>x.t==="more"?(["ha","hg","hf"].includes(x.sb)||canMenu(x.sb)):canTab(x.t);
 const item=(x,sm)=>`<div class="dw-i${sm?" sm":""}${on(x.t,x.sb)?" on":""}" onclick="nav('${x.t}','${x.sb}')">${ico(x.ic,sm?19:21)}<span>${x.lb}</span></div>`;
 let first=true;
 const body=G.map(g=>{
  const its=g.items.filter(ok);
  if(!its.length)return "";
  if(!g.title||its.length===1)return item(its[0]);
  const act=its.some(x=>on(x.t,x.sb)),open=act||first;first=false;
  return `<div class="dw-g${open?" open":""}"><div class="dw-gh" onclick="this.parentElement.classList.toggle('open')">${ico(g.ic,18)}<span>${g.title}</span>${ico("chev",18)}</div><div class="dw-gb">${its.map(x=>item(x,1)).join("")}</div></div>`;
 }).join("");
 modal(`<div class="dw-h"><div class="dw-lg">${sc.logo?`<img src="${safeDataImage(sc.logo)}" alt="">`:"🕌"}</div><div class="dw-t"><b>${esc(sc.name)}</b><small>Smart Education System</small></div><button class="dw-x" onclick="closeM()" aria-label="বন্ধ করুন">${ico("x",20)}</button></div><div class="dw-b">${body}</div><div class="dw-f"><div class="dw-i out" onclick="doLogout()">${ico("out",21)}<span>লগআউট</span></div></div>`);
 const m=$("mt");if(m)m.classList.add("dw");
}
function pickSig(){photoDoc=true;photoCb=u=>{const x=safeImageSrc(u);if(!x)return alert("শুধু বৈধ image ফাইল ব্যবহার করুন");S.school.sig=x;save();render()};pickPhoto()}
function delSig(){if(!confirm("সইয়ের ছবি মুছে ফেলবেন?"))return;delete S.school.sig;save();render()}
function pickLogo(){photoCb=u=>{const x=safeImageSrc(u);if(!x)return alert("শুধু বৈধ image ফাইল ব্যবহার করুন");S.school.logo=x;save();render()};pickPhoto()}
function saveSchool(){const g=i=>$(i).value.trim();S.school={...S.school,name:g("sn"),addr:g("sa"),est:g("se"),year:g("sy"),director:g("sd"),phone:g("sp")};save();alert("সংরক্ষিত হয়েছে")}

function homeEvChart(){
 const T=today(),d=new Date(),ym=mk(d.getFullYear(),d.getMonth()),ea=evAll(),mS=ym+"-01",mE=ym+"-31",inM=ea.filter(e=>e.start<=mE&&(e.end||e.start)>=mS);
 const bs=Object.keys(EVT).map(t=>[t,inM.filter(e=>e.type==t).length,EVT[t]]),mx2=Math.max(1,...bs.map(b=>b[1]));
 const up=ea.filter(e=>(e.end||e.start)>=T).sort((a,b)=>a.start>b.start?1:-1).slice(0,3);
 const dl=e=>{if(e.start<=T)return "চলছে";const n=Math.round((new Date(e.start)-new Date(T))/864e5);return bn(n)+" দিন পরে"};
 return `<div class="card"><div class="ch"><h2>🎉 ইভেন্ট চার্ট</h2><span class="lk" onclick="nav('more','ev')">সব দেখুন →</span></div>`+(ea.length?`<small style="color:var(--mu)">${MN[d.getMonth()]} ${bn(d.getFullYear())} — ${bn(inM.length)}টি</small><div class="bars">${bs.map(b=>`<div style="background:${b[2]};height:${58+b[1]/mx2*88}px">${bn(b[1])}<br><small style="font-size:11px">${EVI[b[0]]} ${b[0]}</small></div>`).join("")}</div>`+(up.length?`<div style="margin-top:6px">${up.map(e=>`<div class="row" style="padding:8px 0"><span style="width:6px;align-self:stretch;border-radius:4px;background:${EVT[e.type]||"#8b5cf6"}"></span><div class="f">${esc(e.name)}<small>${EVI[e.type]||""} ${esc(e.type)} · ${bn(e.start)}${e.end&&e.end!=e.start?" — "+bn(e.end):""}</small></div><span class="tag">${dl(e)}</span></div>`).join("")}</div>`:'<div class="em" style="padding:10px 0">আসন্ন কোনো ইভেন্ট নেই</div>'):'<div class="em">কোনো ইভেন্ট নেই</div>')+`</div>`;
}
function home(){
 if(isParent())return parentHome();
 const T=today(),day=S.att[T]||{},ids=S.students.map(s=>s.id),pr=ids.filter(i=>day[i]=="p").length,ab=ids.filter(i=>day[i]=="a").length;
 const sc=S.school,d=new Date(),ym=mk(d.getFullYear(),d.getMonth());
 const tex=S.exams.filter(e=>e.date==T),upc=S.exams.filter(e=>e.date>T).sort((a,b)=>a.date>b.date?1:-1);
 const hw=S.hw.filter(h=>h.date==T&&(!homeCls||h.cls==homeCls));
 const stuDue=sid=>S.fees.filter(f=>f.sid==sid).reduce((a,f)=>a+due(f),0);
 const TY=[["অনাবাসিক","#3b82f6","#eff6ff","🏫"],["আবাসিক","#16a34a","#f0fdf4","🏠"],["ডেকেয়ার","#8b5cf6","#faf5ff","☺"]];
 const ty=TY.map(t=>{const ss=S.students.filter(x=>(x.type||"অনাবাসিক")==t[0]),dd=ss.map(x=>stuDue(x.id));return {t,n:ss.length,k:dd.filter(x=>x>0).length,a:dd.reduce((x,y)=>x+y,0)}});
 const totDue=S.fees.reduce((a,f)=>a+due(f),0),nDue=S.fees.filter(f=>due(f)>0).length;
 const fp=S.fees.filter(f=>f.amt>0&&f.paid>=f.amt),fd=S.fees.filter(f=>f.paid==0&&f.amt>0),fa=S.fees.filter(f=>f.paid>0&&f.paid<f.amt),sum=(l,fn)=>l.reduce((a,f)=>a+fn(f),0);
 const books=S.books.map(b=>({b,av:b.copies-b.issues.filter(i=>!i.ret).length})),copies=sum(S.books,b=>b.copies),iss=sum(S.books,b=>b.issues.filter(i=>!i.ret).length),stockOut=books.filter(x=>x.av<=0).length;
 const recs=S.fees.filter(f=>f.auto==ym&&(f.type||"মাসিক বেতন")=="মাসিক বেতন"),pend=recs.filter(f=>due(f)>0),mcount=S.students.filter(x=>+x.monthlyFee>0&&x.status!="নিষ্ক্রিয়").length;
 const pd=sum(S.fees,f=>f.paid),oi=sum(S.txns.filter(t=>t.type=="in"),t=>t.amt),eo=sum(S.txns.filter(t=>t.type=="out"),t=>t.amt)+S.sal.reduce((a,r)=>a+r.paid,0),net=pd+oi-eo;
 const done=S.exams.filter(e=>Object.keys(e.marks).length).length,bars=[["মোট",S.exams.length,"#10b981"],["আজ",tex.length,"#f59e0b"],["আসন্ন",upc.length,"#3b82f6"],["ফলাফল",done,"#8b5cf6"]],mx=Math.max(1,...bars.map(b=>b[1]));
 const lg=S.log.slice(0,logAll?30:6),nt=S.notices.slice().reverse();
 const fl=(c,l,n,a)=>`<div class="lg2"><span><i style="background:${c}"></i>${l}</span><b style="${c=="#ef4444"?"color:var(--rd)":""}">${bn(n)} — ${money(a)}</b></div>`;
 return `
 <div class="hero"><button class="hmenu" onclick="go('more')" aria-label="আরও মেনু">${ico("menu",24)}</button><div style="display:flex;gap:8px;padding-right:34px"><div class="lg">${sc.logo?`<img src="${safeDataImage(sc.logo)}">`:"🕌"}</div><div style="min-width:0;flex:1;text-align:center"><h1>${esc(LANG=="en"&&sc.nameEn?sc.nameEn:sc.name)}</h1><small>📍 ${esc(sc.addr)}</small>${sc.est||sc.year?`<small>${sc.est?"স্থাপিত: "+esc(sc.est)+" ":""}${sc.year?" শিক্ষাবর্ষ: "+esc(sc.year):""}</small>`:""}${sc.director?`<small>পরিচালক: ${esc(sc.director)}</small>`:""}${sc.phone?`<small>ফোন: ${esc(sc.phone)}</small>`:""}</div></div>
 <div style="display:flex;justify-content:space-between;margin-top:12px;gap:8px"><div><small>এখন সময়</small><div class="clk" id="clk" style="margin-top:2px">${clockHtml(d)}</div><small>📅 ${bn(fdt(d))} ইং</small></div>${S.set.dates?`<div style="text-align:right"><small>🌙 ${hijri(d).split(", ")[0]}</small><small>${hijri(d).split(", ").slice(1).join(", ")}</small><small>প্রাঃ ${bnDate(d)}</small></div>`:""}</div>
 <div class="tick"><span class="live">● লাইভ</span><div style="flex:1;min-width:0;overflow:hidden">${(t=>`<span class="mq" style="animation-duration:${Math.max(8,Math.round(t.length*.15+6))}s">${esc(t)}</span>`)(S.set.bar||(nt.length?nt[0].title:"কোনো নোটিশ নেই!"))}</div></div></div>
 <div class="g2"><div class="st" style="background:linear-gradient(135deg,#3b82f6,#2563eb)"><span class="ic">👥</span><small>মোট শিক্ষার্থী</small><div>${bn(S.students.length)}</div></div><div class="st" style="background:linear-gradient(135deg,#a855f7,#7c3aed)"><span class="ic">🎓</span><small>মোট শিক্ষক</small><div>${bn(S.teachers.length)}</div></div><div class="st" style="background:linear-gradient(135deg,#10b981,#059669)"><span class="ic">📅</span><small>আজ উপস্থিত</small><div>${bn(pr)}</div></div><div class="st" style="background:linear-gradient(135deg,#f43f5e,#e11d48)"><span class="ic">⚠️</span><small>আজ অনুপস্থিত</small><div>${bn(ab)}</div></div></div>
 <div class="g2" style="margin-bottom:6px"><div class="card" style="margin:0;background:#e0f2fe;border-left:3px solid #0ea5e9;padding:10px"><small style="color:#0369a1">📖 আজকের পরীক্ষা</small><div style="font-size:13px;margin-top:6px;text-align:center;color:#0369a1">${tex.length?tex.map(e=>esc(e.name)+" — "+esc(e.subject||"")+" ("+esc(e.cls)+")").join(", "):"আজ কোনো পরীক্ষা নেই"}</div></div><div class="card" style="margin:0;background:#e0e7ff;border-left:3px solid #4f46e5;padding:10px"><small style="color:#3730a3">আসন্ন পরীক্ষা</small><div style="font-size:13px;margin-top:6px;text-align:center">${upc.length?esc(upc[0].name)+" — "+esc(upc[0].subject||"")+" · "+bn(upc[0].date):"কোনো আসন্ন পরীক্ষা নেই"}</div></div></div>
 <div style="text-align:center;margin-bottom:12px"><span class="lk" onclick="nav('more','xr')">সব পরীক্ষা দেখুন</span></div>
 <div class="card"><div class="ch"><h2>🔔 নোটিশ</h2><span class="lk" onclick="nav('more','notice')">সব দেখুন →</span></div>${nt.slice(0,3).map(n=>`<div class="row"><div class="f">${esc(n.title)}<small>${bn(n.date)}</small></div></div>`).join("")||'<div class="em">কোনো নোটিশ নেই</div>'}</div>
 <div class="card"><div class="ch"><h2>📗 আজকের পড়া ও বাড়ির কাজ</h2><select style="width:110px;margin:0" onchange="homeCls=this.value;render()"><option value="">শ্রেণি</option>${classes().map(c=>`<option ${homeCls==c?"selected":""}>${esc(c)}</option>`).join("")}</select></div>${hw.map(h=>`<div class="row"><div class="f"><b>${esc(h.subject)}</b> <span class="tag">${esc(h.cls)}</span><small>${esc(h.text)}</small></div></div>`).join("")||'<div class="em">📖<br>আজকের পড়া এখনো আপডেট হয়নি</div>'}</div>
 <div class="card"><div class="ch"><h2>ⓘ ধরন অনুযায়ী বকেয়া ফি</h2><span class="lk" onclick="nav('fee')">সব দেখুন →</span></div>${donut(ty.map(x=>({v:x.a,c:x.t[1]})),150,18,money(totDue),"মোট বকেয়া","#e11d48")}
 <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-top:8px">${ty.map(x=>`<div class="mini" style="background:${x.t[2]};color:#333"><span style="color:${x.t[1]}">${x.t[3]} ${x.t[0]}</span><b style="color:${x.a?"var(--rd)":x.t[1]}">${x.a?money(x.a):"বকেয়া নেই"}</b><span class="tag" style="font-size:10px">${bn(x.n)} জন</span>${x.k?`<div style="color:#6b7385;margin-top:4px">${bn(x.k)} জনের বকেয়া</div>`:""}</div>`).join("")}</div></div>
 <div class="g2"><div class="card" style="margin:0;padding:10px"><b style="font-size:14px">ফি পরিস্থিতি</b>${donut([{v:fp.length,c:"#10b981"},{v:fd.length,c:"#ef4444"},{v:fa.length,c:"#f59e0b"}],120,16,bn(S.fees.length),"মোট রেকর্ড")}${fl("#10b981","পরিশোধিত",fp.length,sum(fp,f=>f.paid))}${fl("#ef4444","বকেয়া",fd.length,sum(fd,f=>due(f)))}${fl("#f59e0b","আংশিক",fa.length,sum(fa,f=>due(f)))}</div>
 <div class="card" style="margin:0;padding:10px;background:#eff6ff"><div class="ch" style="margin:0"><b style="font-size:13px">📖 লাইব্রেরি</b><span class="lk" style="font-size:11px" onclick="nav('more','lib')">যান →</span></div>${donut([{v:books.length-stockOut,c:"#10b981"},{v:stockOut,c:"#ef4444"}],120,16,bn(S.books.length),"শিরোনাম")}<div class="lg2"><span><i style="background:#10b981"></i>উপলব্ধ: ${bn(books.length-stockOut)}</span><span><i style="background:#ef4444"></i>স্টক শেষ: ${bn(stockOut)}</span></div><div style="display:flex;justify-content:space-around;font-size:11px;margin-top:6px;text-align:center"><div>মোট ভলি<b style="display:block;color:#3b82f6">${bn(copies)}</b></div><div>উপলব্ধ<b style="display:block;color:#16a34a">${bn(copies-iss)}</b></div><div>ইস্যুকৃত<b style="display:block;color:#f59e0b">${bn(iss)}</b></div></div></div></div>
 <div class="card" style="background:#f0fdf4;margin-top:12px"><div class="ch"><h2 style="font-size:14px">${MN[d.getMonth()]}, ${bn(d.getFullYear())} — স্বয়ংক্রিয় বকেয়া বেতন</h2>${mcount&&recs.length>=mcount?'<span class="tag g">তৈরি সম্পূর্ণ</span>':""}</div>
 ${mcount?`<div class="g2" style="margin-bottom:6px"><div><b style="color:#f97316;font-size:20px">${money(sum(pend,f=>due(f)))}</b><small style="display:block;color:var(--mu)">মোট বকেয়া (${bn(pend.length)} রেকর্ড)</small></div><div><b style="color:#3b82f6;font-size:20px">${bn(mcount)}</b><small style="display:block;color:var(--mu)">শিক্ষার্থীর মাসিক বেতন নির্ধারিত</small></div></div><div style="color:var(--gr);font-size:12px;margin-bottom:6px">✓ এই মাসের সকল বকেয়া বেতন স্বয়ংক্রিয়ভাবে তৈরি হয়ে গেছে।</div>${pend.slice(0,4).map(f=>`<div class="row" style="padding:6px 0;font-size:13px"><div class="f">${esc(stuName(f.sid))}</div><b style="color:var(--rd)">${money(due(f))}</b></div>`).join("")}`:'<div class="em" style="padding:8px 0">শিক্ষার্থীর ভর্তি বা সম্পাদনার সময় মাসিক বেতন দিলে প্রতি মাসে বকেয়া এখানে স্বয়ংক্রিয়ভাবে তৈরি হবে।</div>'}<div style="margin-top:8px"><span class="lk" onclick="nav('fee')">ফি পেজে দেখুন →</span></div></div>
 ${hasPerm("fees")||hasPerm("accounting")?`<div class="g2">${hasPerm("fees")?`<div class="ac" style="background:linear-gradient(135deg,#fb923c,#f97316)"><small>বকেয়া</small><b>${money(totDue)}</b><small>${bn(nDue)}টি বকেয়া রেকর্ড</small></div>`:""}${hasPerm("accounting")?`<div class="ac" style="background:linear-gradient(135deg,#34d399,#10b981)"><small>মোট আয়</small><b>${money(pd+oi)}</b><small>ফি সংগ্রহ: ${money(pd)}</small></div><div class="ac" style="background:linear-gradient(135deg,#f87171,#ef4444)"><small>মোট ব্যয়</small><b>${money(eo)}</b><small>সর্বমোট</small></div><div class="ac" style="background:linear-gradient(135deg,#a78bfa,#8b5cf6)"><small>নিট ব্যালেন্স</small><b>${money(net)}</b><small>${net>=0?"উদ্বৃত্ত":"ঘাটতি"}</small></div>`:""}</div>`:""}
 ${homeEvChart()}
<div class="card"><div class="ch"><h2>〰 সাম্প্রতিক কার্যক্রম</h2><span class="lk" onclick="logAll=!logAll;render()">${logAll?"কম দেখুন":"সব দেখুন →"}</span></div>${lg.map(x=>{const t=new Date(x.t);return `<div class="row" style="align-items:flex-start"><span class="av" style="width:30px;height:30px;font-size:14px;background:${x.ty=="add"?"#dcfce7":"#d7f2e3"}">${x.ty=="add"?"+":"✎"}</span><div class="f"><b style="font-size:13px">${esc(x.cat)}</b><small>${esc(x.tx)}</small></div><small style="font-size:10px;white-space:nowrap">${bn(p2(t.getDate())+"/"+p2(t.getMonth()+1)+"/"+t.getFullYear()+" "+p2(t.getHours())+":"+p2(t.getMinutes()))}</small></div>`}).join("")||'<div class="em">এখনো কোনো কার্যক্রম নেই</div>'}</div>
 <div class="card"><div class="ch"><h2>📅 পরীক্ষা পরিস্থিতি</h2><span class="tag">${bn(S.exams.length)}টি পরীক্ষা</span></div>${S.exams.length?`<div class="bars">${bars.map(b=>`<div style="background:${b[2]};height:${30+b[1]/mx*100}px">${bn(b[1])}<br><small style="font-size:11px">${b[0]}</small></div>`).join("")}</div><div style="text-align:center"><span class="lk" onclick="nav('more','xr')">সব পরীক্ষা দেখুন</span></div>`:'<div class="em">কোনো পরীক্ষা নেই</div>'}</div>`;
}
setInterval(()=>{const c=$("clk");if(c)c.innerHTML=clockHtml(new Date())},1000);

function classes(){return [...new Set(S.students.map(s=>s.cls).concat(isParent()?S.hw.map(h=>h.cls):[]).filter(Boolean))].sort()}
function rollN(x){const t=String(x&&x.roll!=null?x.roll:"").replace(/[০-৯]/g,d=>"০১২৩৪৫৬৭৮৯".indexOf(d)),m=t.match(/\d+/);return m?parseInt(m[0],10):1e9}
function byRollCls(a,b){return String(a.cls||"").localeCompare(String(b.cls||""),"bn")||rollN(a)-rollN(b)||String(a.name||"").localeCompare(String(b.name||""),"bn")}
function list(){return S.students.filter(s=>(!cls||s.cls==cls)&&(!q||(s.name+s.roll+s.guardian).toLowerCase().includes(q.toLowerCase()))).sort(byRollCls)}
function filt(){return `<div class="top"><input placeholder="খুঁজুন..." value="${esc(q)}" oninput="q=this.value;keep()"><select onchange="cls=this.value;render()" style="width:110px"><option value="">সব শ্রেণি</option>${classes().map(c=>`<option ${cls==c?"selected":""}>${esc(c)}</option>`).join("")}</select></div>`}
let csvImportRows=[];
function csvImportOpen(){if(!allow("students"))return;$("studentCsvFile")?.click()}
function csvNorm(v){return String(v??"").replace(/^\uFEFF/,"").toLowerCase().replace(/[\s_\-()।:]/g,"").trim()}
function csvField(h){const k=csvNorm(h),M={name:"name",নাম:"name",শিক্ষার্থীরনাম:"name",namebn:"name",nameenglish:"nameEn",ইংরেজিনাম:"nameEn",nameen:"nameEn",cls:"cls",class:"cls",শ্রেণি:"cls",শ্রেণী:"cls",branch:"branch",শাখা:"branch",roll:"roll",রোল:"roll",rollno:"roll",gender:"gender",লিঙ্গ:"gender",guardian:"guardian",অভিভাবক:"guardian",phone:"phone",mobile:"phone",মোবাইল:"phone",email:"email",ইমেইল:"email",type:"type",ধরন:"type",status:"status",অবস্থা:"status",division:"division",বিভাগ:"division",dob:"dob",জন্মতারিখ:"dob",admissiondate:"admDate",ভর্তিরতারিখ:"admDate",admdate:"admDate",address:"addr",ঠিকানা:"addr",addr:"addr",monthlyfee:"monthlyFee",মাসিকবেতন:"monthlyFee",মাসিকফি:"monthlyFee",studentid:"studentId",শিক্ষার্থীআইডি:"studentId",date:"date",তারিখ:"date",attendancedate:"attendanceDate",হাজিরাতারিখ:"attendanceDate",attendance:"attendance",উপস্থিতি:"attendance",statusattendance:"attendance",exam:"examName",examname:"examName",পরীক্ষা:"examName",subject:"subject",বিষয়:"subject",বিষয়:"subject",marks:"marks",নম্বর:"marks",fullmarks:"fullMarks",পূর্ণমান:"fullMarks",passmarks:"passMarks",পাশনম্বর:"passMarks"};return M[k]||null}
function csvParse(text){
 const rows=[],row=[];let cell="",quoted=false;
 text=String(text||"").replace(/^\uFEFF/,"");
 for(let i=0;i<text.length;i++){const ch=text[i],nx=text[i+1];if(ch==='"'){if(quoted&&nx==='"'){cell+='"';i++}else quoted=!quoted}else if(ch===','&&!quoted){row.push(cell);cell=""}else if((ch==='\n'||ch==='\r')&&!quoted){if(ch==='\r'&&nx==='\n')i++;row.push(cell);if(row.some(x=>String(x).trim()))rows.push(row.slice());row.length=0;cell=""}else cell+=ch}
 if(cell.length||row.length){row.push(cell);if(row.some(x=>String(x).trim()))rows.push(row)}
 if(!rows.length)return [];
 const keys=rows.shift().map(csvField),out=[];
 rows.forEach(r=>{const o={};keys.forEach((k,i)=>{if(k)o[k]=String(r[i]??"").trim()});out.push(o)});return out;
}
function csvDigits(v){return String(v??"").replace(/[০-৯]/g,d=>"0123456789"["০১২৩৪৫৬৭৮৯".indexOf(d)])}
function csvImportFile(file){
 if(!file)return;
 if(file.size>5*1024*1024){alert("CSV ফাইল ৫ MB-এর বেশি হতে পারবে না");return}
 const r=new FileReader();r.onload=()=>{try{const raw=csvParse(r.result);if(!raw.length)throw Error("empty");const seen=new Set(),valid=[],errors=[];
  raw.forEach((o,i)=>{const n=i+2,name=o.name?.trim(),cls=o.cls?.trim(),roll=csvDigits(o.roll).trim(),gender=o.gender?.trim()||"ছেলে",phone=csvDigits(o.phone).replace(/[\s-]/g,"");let err="";
   if(!name||!cls)err="নাম ও শ্রেণি আবশ্যক";
   else if(phone&&!/^01\d{9}$/.test(phone))err="মোবাইল নম্বর ভুল";
   else if(o.email&&!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(o.email))err="ইমেইল ভুল";
   else if(roll&&((seen.has(cls+"|"+roll))||S.students.some(x=>x.cls===cls&&String(x.roll||"").trim()===roll)))err="একই শ্রেণিতে রোল duplicate";
   else if(o.monthlyFee!==undefined&&o.monthlyFee!==""&&(!Number.isFinite(+o.monthlyFee)||+o.monthlyFee<0))err="মাসিক ফি ভুল";
   const item={...o,name,cls,roll,gender,phone,status:o.status||"সক্রিয়",type:o.type||"অনাবাসিক",division:o.division||DIVS[0],admDate:o.admDate||today(),monthlyFee:+o.monthlyFee||0,addr:o.addr||""};
   if(err)errors.push({row:n,name:name||"—",error:err});else{seen.add(cls+"|"+roll);valid.push(item)}
  });
  csvImportRows=valid;csvImportPreview(errors,raw.length);
 }catch(e){alert("CSV পড়া যায়নি। প্রথম row-তে header দিন, যেমন: name, class, roll")}};r.readAsText(file,"UTF-8")
}
function csvImportPreview(errors,total){
 const sample=csvImportRows.slice(0,12).map(x=>`<tr><td>${esc(x.name)}</td><td>${esc(x.cls)}</td><td>${esc(x.roll)}</td><td>${esc(x.phone)}</td><td>${money(x.monthlyFee)}</td></tr>`).join("");
 const er=errors.slice(0,12).map(x=>`<tr><td>${bn(x.row)}</td><td>${esc(x.name)}</td><td style="color:var(--rd)">${esc(x.error)}</td></tr>`).join("");
 modal(`<h2>CSV Import preview</h2><p class="hint">মোট row: ${bn(total)} · valid: ${bn(csvImportRows.length)} · বাদ যাবে: ${bn(errors.length)}</p><div class="ov"><table class="tb"><tr><th>নাম</th><th>শ্রেণি</th><th>রোল</th><th>মোবাইল</th><th>মাসিক ফি</th></tr>${sample||'<tr><td colspan="5">কোনো valid row নেই</td></tr>'}</table></div>${errors.length?`<p style="color:var(--rd);margin-top:8px">ভুল row (প্রথম ১২টি)</p><div class="ov"><table class="tb"><tr><th>Row</th><th>নাম</th><th>কারণ</th></tr>${er}</table></div>`:""}<div class="bt"><button class="btn o" onclick="csvImportRows=[];closeM()">বাতিল</button><button class="btn g" ${csvImportRows.length?"":"disabled"} onclick="csvImportCommit()">${bn(csvImportRows.length)} জন Import করুন</button></div>`);$("mt").onclick=null
}
let bulkRows=[],bulkValid=[],bulkErrors=[];
function bulkImportOpen(){if(!hasPerm("attendance")&&!hasPerm("exams")){alert("এই কাজের জন্য permission নেই");return;}const inp=$("bulkCsvFile");if(inp)inp.click()}
function bulkImportFile(file){if(!file)return;if(file.size>5*1024*1024){alert("CSV ফাইল ৫ MB-এর বেশি হতে পারবে না");return}const r=new FileReader();r.onload=()=>{try{bulkRows=csvParse(r.result);if(!bulkRows.length)throw Error("empty");bulkValid=[];bulkErrors=[];bulkImportPreview(false)}catch(e){alert("CSV পড়া যায়নি। header দিন: name,class,roll,date,attendance,exam,subject,marks")}};r.readAsText(file,"UTF-8")}
function bulkFindStudent(o){const id=o.studentId?.trim(),cls=o.cls?.trim(),roll=csvDigits(o.roll).trim(),name=o.name?.trim();return id?sOf(id):S.students.find(x=>(id&&x.id===id)||(!id&&cls&&roll&&x.cls===cls&&String(x.roll||"").trim()===roll)||(!id&&!roll&&cls&&name&&x.cls===cls&&x.name===name))}
function bulkStatus(v){const k=csvNorm(v);return {p:"p",উপস্থিত:"p",present:"p",a:"a",অনুপস্থিত:"a",absent:"a",l:"l",বিলম্ব:"l",late:"l",h:"h",ছুটি:"h",holiday:"h"}[k]||null}
function bulkValidate(){
 const date=$("bulkDate")?.value.trim()||today(),examName=$("bulkExam")?.value.trim(),subject=$("bulkSubject")?.value.trim(),total=+($("bulkTotal")?.value||100),pass=+($("bulkPass")?.value||33);bulkValid=[];bulkErrors=[];const seen=new Set();
 bulkRows.forEach((o,i)=>{const row=i+2,st=bulkFindStudent(o),ad=(o.attendanceDate||o.date||date).trim(),av=bulkStatus(o.attendance),en=(o.examName||examName||"").trim(),sub=(o.subject||subject||"").trim(),marks=o.marks==null?"":String(o.marks).trim(),fm=+(o.fullMarks||total||100),pm=+(o.passMarks||pass||33);let err="";
  if(!st)err="শিক্ষার্থী পাওয়া যায়নি (studentId বা name+class+roll দিন)";
  else if(o.attendance!==undefined&&o.attendance!==""&&(!ad||!av))err="attendance date/status ভুল";
  else if(marks!==""&&(!en||!sub||!Number.isFinite(+marks)||+marks<0||+marks>fm))err="exam/subject/marks/full marks ভুল";
  else if((marks!==""||en||sub)&&(!en||!sub))err="exam ও subject আবশ্যক";
  const sig=st?(st.id+"|"+ad+"|"+en+"|"+sub):"";if(!err&&sig&&seen.has(sig))err="একই row-এর duplicate";if(!err&&sig)seen.add(sig);
  if(err)bulkErrors.push({row,name:o.name||"—",error:err});else if(st)bulkValid.push({st,ad,av,en,sub,marks,fm,pm});
 });bulkImportPreview(true)
}
function bulkImportPreview(validated){
 const sample=(validated?bulkValid:bulkRows).slice(0,12).map(x=>validated?`<tr><td>${esc(x.st.name)}</td><td>${esc(x.ad)}</td><td>${x.av?ST[x.av][0]:"—"}</td><td>${esc(x.en||"—")}</td><td>${esc(x.sub||"—")}</td><td>${esc(x.marks||"—")}</td></tr>`:`<tr><td>${esc(x.name||"—")}</td><td>${esc(x.cls||"—")}</td><td>${esc(x.roll||"—")}</td><td>${esc(x.attendance||"—")}</td><td>${esc(x.marks||"—")}</td></tr>`).join("");
 const er=bulkErrors.slice(0,12).map(x=>`<tr><td>${bn(x.row)}</td><td>${esc(x.name)}</td><td style="color:var(--rd)">${esc(x.error)}</td></tr>`).join("");
 const controls=!validated?`<div class="g2"><div><label class="lb">খালি attendance date হলে</label><input id="bulkDate" type="date" value="${today()}"></div><div><label class="lb">খালি exam হলে নাম</label><input id="bulkExam" placeholder="যেমন: অর্ধবার্ষিক"></div><div><label class="lb">খালি subject হলে</label><input id="bulkSubject" placeholder="যেমন: বাংলা"></div><div><label class="lb">পূর্ণমান</label><input id="bulkTotal" type="number" value="100"></div><div><label class="lb">পাশ নম্বর</label><input id="bulkPass" type="number" value="33"></div></div>`:"";
 modal(`<h2>Bulk marks / attendance import</h2><p class="hint">CSV row: ${bn(bulkRows.length)} · ${validated?`valid: ${bn(bulkValid.length)} · বাদ: ${bn(bulkErrors.length)}`:"প্রথমে manual default পূরণ করে যাচাই করুন"}</p>${controls}<div class="ov"><table class="tb"><tr><th>নাম</th><th>${validated?"তারিখ":"শ্রেণি"}</th><th>${validated?"অবস্থা":"রোল"}</th><th>${validated?"পরীক্ষা":"attendance"}</th><th>${validated?"বিষয়":"marks"}</th><th>${validated?"নম্বর":""}</th></tr>${sample||'<tr><td colspan="6">কোনো row নেই</td></tr>'}</table></div>${validated&&bulkErrors.length?`<p style="color:var(--rd);margin-top:8px">ভুল row (প্রথম ১২টি)</p><div class="ov"><table class="tb"><tr><th>Row</th><th>নাম</th><th>কারণ</th></tr>${er}</table></div>`:""}<div class="bt"> <button class="btn o" onclick="bulkRows=[];bulkValid=[];bulkErrors=[];closeM()">বাতিল</button>${validated?`<button class="btn g" ${bulkValid.length?"":"disabled"} onclick="bulkImportCommit()">${bn(bulkValid.length)} জন/row Import করুন</button>`:`<button class="btn" onclick="bulkValidate()">যাচাই ও preview</button>`}</div>`);$("mt").onclick=null
}
function bulkImportCommit(){if(!bulkValid.length)return;let ac=0,mc=0;bulkValid.forEach(x=>{if(x.av){S.att[x.ad]={...(S.att[x.ad]||{}),[x.st.id]:x.av};ac++}if(x.marks!==""){let p=S.exams.find(e=>e.cls===x.st.cls&&e.name===x.en&&e.subject===x.sub);if(!p){p={id:uid(),name:x.en,type:"পরীক্ষা",cls:x.st.cls,subject:x.sub,total:x.fm,pass:x.pm,date:x.ad};S.exams.push(p)}p.total=+p.total||x.fm;p.pass=+p.pass||x.pm;p.marks=p.marks||{};p.marks[x.st.id]=Math.min(+x.marks,p.total);mc++}});logA("add","Bulk import",bn(ac)+" attendance, "+bn(mc)+" marks সংরক্ষণ");save();closeM();render();alert(bn(ac)+" attendance এবং "+bn(mc)+" marks import হয়েছে")}
function csvImportCommit(){if(!allow("students")||!csvImportRows.length)return;const list=csvImportRows.splice(0),now=[];list.forEach(o=>{const id=uid();S.students.push({id,...o,fees:{}});now.push(o.name);});autoFees();logA("add","শিক্ষার্থী",bn(list.length)+" জন CSV থেকে import");save();closeM();render();alert(bn(list.length)+" জন শিক্ষার্থী সফলভাবে import হয়েছে")}
function keep(){const p=$("lst");if(p)p.innerHTML=tab=="stu"?stuRows():""}

let sCls="",sGen="",sSt="",selS={};
const HND='<div style="width:40px;height:4px;border-radius:2px;background:var(--ln);margin:0 auto 12px"></div>';
const avt=(s,z)=>s.photo?`<img class="av" style="width:${z}px;height:${z}px" src="${safeDataImage(s.photo)}">`:`<div class="av" style="width:${z}px;height:${z}px;font-size:${Math.round(z/2)}px">👤</div>`;
const sOf=id=>S.students.find(x=>x.id==id);
const pOf=id=>S.students.find(x=>x.id==id)||S.teachers.find(x=>x.id==id)||S.staff.find(x=>x.id==id);
function sList(){const k=q.trim().toLowerCase();return S.students.filter(s=>(!sCls||s.cls==sCls)&&(!sGen||s.gender==sGen)&&(!sSt||(s.status||"সক্রিয়")==sSt)&&(!k||[s.name,s.nameEn,s.roll,s.guardian,s.phone].join(" ").toLowerCase().includes(k))).sort(byRollCls)}
function stuRows(){
 return sList().map(s=>`<div class="sc2"><input type="checkbox" class="cb" ${selS[s.id]?"checked":""} onchange="togS('${s.id}')"><div style="flex:1;min-width:0" onclick="profile('${s.id}')"><div style="display:flex;align-items:center;gap:10px;margin-bottom:6px">${avt(s,36)}<b style="font-size:15px">${esc(s.name)}</b></div>
 <span class="pl ${(s.status||"সক্রিয়")=="সক্রিয়"?"g":"r"}">${esc(s.status||"সক্রিয়")}</span><span class="pl b">${esc(s.type||"অনাবাসিক")}</span><span class="pl">${esc(s.cls)}${s.branch?" — "+esc(s.branch):""}</span>${s.gender?`<span class="pl">${esc(s.gender)}</span>`:""}
 <div style="font-size:12px;color:var(--mu);line-height:1.6">${s.roll?"রোল: "+esc(s.roll)+"<br>":""}${s.guardian?"অভিভাবক: "+esc(s.guardian)+"<br>":""}${s.phone?"মোবাইল: "+esc(s.phone):""}</div></div><button class="dots" onclick="menuS('${s.id}')">⋯</button></div>`).join("")||'<div class="em">কোনো শিক্ষার্থী পাওয়া যায়নি</div>';
}
function stu(){if(profId)return profilePage();
 const l=sList(),all=l.length&&l.every(s=>selS[s.id]),n=Object.keys(selS).length;
 return `<h1 style="font-size:22px">শিক্ষার্থী ব্যবস্থাপনা</h1><small style="color:var(--mu)">মোট ${bn(S.students.length)} জন শিক্ষার্থী</small>
 <div style="display:flex;gap:8px;flex-wrap:wrap;margin:12px 0"><button class="ob" onclick="stuExcel()">📄 Excel</button><button class="ob" onclick="stuPdf()">🗎 PDF</button><button class="ob g" onclick="stuSms()">💬 সকলকে SMS</button><button class="btn" onclick="stuForm()">＋ নতুন শিক্ষার্থী</button><button class="ob g" onclick="csvImportOpen()">⬆ CSV Import</button><input id="studentCsvFile" type="file" accept=".csv,text/csv" style="position:absolute;left:-9999px;width:1px;height:1px;opacity:0" onchange="csvImportFile(this.files[0]);this.value=''"></div>
 <div class="card"><input placeholder="🔍 অনুসন্ধান করুন..." value="${esc(q)}" oninput="q=this.value;keep()"><div class="g2" style="margin:0"><select onchange="sCls=this.value;render()" style="margin:0"><option value="">শ্রেণি (সব)</option>${classes().map(c=>`<option ${sCls==c?"selected":""}>${esc(c)}</option>`).join("")}</select><select onchange="sGen=this.value;render()" style="margin:0"><option value="">লিঙ্গ (সব)</option>${["ছেলে","মেয়ে"].map(c=>`<option ${sGen==c?"selected":""}>${c}</option>`).join("")}</select></div><select onchange="sSt=this.value;render()" style="margin:8px 0 0;width:50%"><option value="">অবস্থা (সব)</option>${["সক্রিয়","নিষ্ক্রিয়"].map(c=>`<option ${sSt==c?"selected":""}>${c}</option>`).join("")}</select></div>
 <label style="display:flex;align-items:center;gap:8px;font-size:13px;color:var(--mu);margin:4px 0 10px"><input type="checkbox" class="cb" ${all?"checked":""} onchange="selAll(this.checked)">সব নির্বাচন করুন</label>
 ${n?`<div class="card" style="padding:10px;display:flex;gap:8px;align-items:center;flex-wrap:wrap"><b style="flex:1">${bn(n)} জন নির্বাচিত</b><button class="btn g s" onclick="stuSms()">SMS</button><button class="btn r s" onclick="bulkDel()">মুছুন</button><button class="btn o s" onclick="selS={};render()">বাতিল</button></div>`:""}
 <div id="lst">${stuRows()}</div>`;
}
function togS(id){if(selS[id])delete selS[id];else selS[id]=1;const y=$("v").scrollTop;render();$("v").scrollTop=y}
function selAll(on){sList().forEach(s=>{if(on)selS[s.id]=1;else delete selS[s.id]});const y=$("v").scrollTop;render();$("v").scrollTop=y}
function bulkDel(){const n=Object.keys(selS).length;if(!n||!confirm(bn(n)+" জন শিক্ষার্থী ও তাদের ফি রেকর্ড মুছে ফেলবেন?"))return;S.students=S.students.filter(s=>!selS[s.id]);S.fees=S.fees.filter(f=>!selS[f.sid]);logA("edit","শিক্ষার্থী",bn(n)+" জন শিক্ষার্থী মুছে ফেলা হয়েছে");selS={};save();render()}
function targets(){const n=Object.keys(selS).length;return n?S.students.filter(s=>selS[s.id]):sList()}
function stuSms(){const t=targets().filter(x=>x.phone);if(!t.length){alert("মোবাইল নম্বর সহ কোনো শিক্ষার্থী নেই");return}msgM(t.map(x=>x.id))}
async function shareFile(name,data,title){
 const P=window.Capacitor&&Capacitor.Plugins;
 if(P&&P.Filesystem&&P.Share){try{const r=await P.Filesystem.writeFile({path:name,data:data,directory:"CACHE",encoding:"utf8"});await P.Share.share({title:title||name,url:r.uri,dialogTitle:title||name});return}catch(e){if(e&&/cancel/i.test(e.message||""))return}}
 modal(`<h2 style="margin-bottom:8px">${esc(title||name)}</h2><p style="font-size:13px;color:var(--mu);margin-bottom:8px">ফাইল শেয়ার করা যায়নি। নিচের লেখা কপি করে সেভ করুন।</p><textarea id="bk" rows="8" readonly>${esc(data)}</textarea><button class="btn" style="width:100%" onclick="$('bk').select();document.execCommand('copy');alert('কপি হয়েছে')">কপি করুন</button>`);
}
function stuExcel(){
 const l=targets(),c=v=>'"'+String(v??"").replace(/"/g,'""')+'"',H=["রোল","নাম","Name (English)","শ্রেণি","শাখা","বিভাগ","লিঙ্গ","ধরন","অবস্থা","অভিভাবক","মোবাইল","ইমেইল","জন্ম তারিখ","ভর্তির তারিখ","ঠিকানা"].map(trS);
 shareFile("students-"+today()+".csv","\uFEFF"+[H.map(c).join(",")].concat(l.map(s=>[s.roll,s.name,s.nameEn,s.cls,s.branch,s.division,s.gender,s.type,s.status||"সক্রিয়",s.guardian,s.phone,s.email,s.dob,s.admDate,s.addr].map(c).join(","))).join("\r\n"),"শিক্ষার্থী তালিকা (Excel/CSV)");
}
function htmlShare(name,body){if(LANG=="en")body=trS(body);
 shareFile(name+".html",`<!DOCTYPE html><html lang="bn"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(name)}</title><style>body{font-family:sans-serif;padding:14px}table{border-collapse:collapse;width:100%}td,th{border:1px solid #999;padding:5px 7px;font-size:13px;text-align:left}@media print{.np{display:none}}</style></head><body>${body}<p class="np"><button onclick="window.print()">প্রিন্ট / PDF সেভ করুন</button></p></body></html>`,"ব্রাউজারে খুলে প্রিন্ট → PDF সেভ করুন");
}
const LIBS={};
const LIB_CACHE="smartedu-libs-v1",PDF_LIBS=["https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js","https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"];
function runLibCode(code){const e=document.createElement("script");e.textContent=code;document.head.appendChild(e)}
function loadLib(u){return LIBS[u]||(LIBS[u]=(async()=>{
 /* ১) ক্যাশে থাকলে ইন্টারনেট ছাড়াই চলবে */
 try{if(window.caches){const c=await caches.open(LIB_CACHE),r=await c.match(u);if(r){runLibCode(await r.text());return}}}catch(e){}
 /* ২) অনলাইনে নামিয়ে ক্যাশে রাখা */
 try{const r=await fetch(u,{mode:"cors"});if(r.ok){const t=await r.clone().text();try{if(window.caches){const c=await caches.open(LIB_CACHE);await c.put(u,r)}}catch(e){}runLibCode(t);return}}catch(e){}
 /* ৩) শেষ ভরসা: সাধারণ script tag */
 await new Promise((ok,no)=>{const e=document.createElement("script");e.src=u;e.onload=ok;e.onerror=()=>no(new Error("load"));document.head.appendChild(e);setTimeout(()=>no(new Error("timeout")),15000)});
})().catch(err=>{delete LIBS[u];throw err}))}
async function libsReady(){try{if(!window.caches)return false;const c=await caches.open(LIB_CACHE);for(const u of PDF_LIBS)if(!(await c.match(u)))return false;return true}catch(e){return false}}
async function prefetchPdfLibs(){try{if(!navigator.onLine||!window.caches)return;const c=await caches.open(LIB_CACHE);for(const u of PDF_LIBS){if(await c.match(u))continue;const r=await fetch(u,{mode:"cors"});if(r.ok)await c.put(u,r)}}catch(e){}}
window.addEventListener("online",()=>setTimeout(prefetchPdfLibs,2000));setTimeout(prefetchPdfLibs,6000);
function toast(m,keep){let t=$("toast");if(!t){t=document.createElement("div");t.id="toast";t.style.cssText="position:fixed;left:50%;bottom:90px;transform:translateX(-50%);background:#1d2433;color:#fff;padding:10px 16px;border-radius:12px;font-size:14px;z-index:99;max-width:85%;text-align:center";document.body.appendChild(t)}t.textContent=m;t.style.display="block";clearTimeout(t._h);if(!keep)t._h=setTimeout(()=>{t.style.display="none"},3500)}
function toastOff(){const t=$("toast");if(t)t.style.display="none"}
async function pdfRender(body,bw){
 let wrap=null;window._pdfBusy=true;document.documentElement.style.zoom="";
 try{
  wrap=document.createElement("div");
  wrap.style.cssText="position:fixed;left:-10000px;top:0;width:794px;background:#fff;color:#111;padding:28px;box-sizing:border-box;font-family:sans-serif;--bg:#e2f6eb;--card:#fff;--tx:#111;--mu:#555;--ln:#ddd;--pri:#16a34a";
  /* সাদা-কালো: ডিজাইন একই, শুধু গাঢ় ব্যাকগ্রাউন্ড সরে কাগজের রঙ (সাদা) ও লেখা কালো হয় */
  const bwCss=bw?'.bwm,.bwm *{background-color:#fff!important;color:#111!important;-webkit-text-fill-color:#111!important;border-color:#555!important;box-shadow:none!important;text-shadow:none!important}.bwm [style*="gradient"]{background-image:none!important}':'';
  if(bw)wrap.className="bwm";
  wrap.innerHTML='<style>table{border-collapse:collapse;width:100%}td,th{border:1px solid #999;padding:5px 7px;font-size:13px;text-align:left;color:#111}.np{display:none}'+bwCss+'</style>'+body;
  document.body.appendChild(wrap);
  await new Promise(r=>setTimeout(r,400));
  await Promise.all([...wrap.querySelectorAll("img")].map(i=>(i.decode?i.decode():Promise.resolve()).catch(()=>{})));
  const sh=Math.max(1,wrap.scrollHeight),sc=sh<=3400?2.5:Math.min(2,14000/sh);
  const cv=await html2canvas(wrap,{scale:sc,backgroundColor:"#fff",useCORS:true});
  const wr=wrap.getBoundingClientRect(),cuts=[...wrap.querySelectorAll("tr,.pgb")].map(e=>(e.getBoundingClientRect().bottom-wr.top)*sc);
  wrap.remove();wrap=null;window._pdfBusy=false;fitMobileZoom();
  const PW=595,PH=842,ph=Math.floor(cv.width*PH/PW),pages=[];
  let y=0;
  while(y<cv.height-1){
   let end=Math.min(y+ph,cv.height);
   if(end<cv.height){const c=cuts.filter(v=>v>y+ph*.5&&v<=end);if(c.length)end=Math.max(...c)}
   if(end<=y)end=Math.min(y+ph,cv.height);
   const tc=document.createElement("canvas"),tw=90;tc.width=tw;tc.height=Math.max(1,Math.round(PH/PW*tw));
   const tg=tc.getContext("2d");tg.fillStyle="#fff";tg.fillRect(0,0,tc.width,tc.height);tg.drawImage(cv,0,y,cv.width,end-y,0,0,tw,(end-y)*tw/cv.width);
   pages.push({y,end,th:tc.toDataURL("image/jpeg",.7)});y=end;
  }
  return {cv,pages,PW,PH,sc};
 }finally{window._pdfBusy=false;if(wrap){wrap.remove();fitMobileZoom()}}
}
async function printDoc(name,body){if(LANG=="en")body=trS(body);
 if(!navigator.onLine&&!(await libsReady())){toast("ইন্টারনেট নেই — প্রিন্টযোগ্য ফাইল তৈরি হচ্ছে");return htmlShare(name,body)}
 const fn=name+"-"+today()+".pdf";
 toast("⏳ PDF তৈরি হচ্ছে…",1);
 try{
  await loadLib("https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js");
  await loadLib("https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js");
  const col=await pdfRender(body,false);
  toastOff();
  window._pdfJob={fn,body,col,bw:null,gray:false,busy:false,sel:col.pages.map(()=>true)};
  pdfOpts();
 }catch(e){window._pdfBusy=false;fitMobileZoom();toast("PDF তৈরি করা যায়নি — প্রিন্টযোগ্য ফাইল শেয়ার হচ্ছে");htmlShare(name,body)}
}
