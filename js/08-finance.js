/* ================= ফিন্যান্স ও হিসাব ================= */
const FT=["মাসিক বেতন","ভর্তি ফি","বই ফি","বিদ্যুৎ বিল","পরীক্ষা ফি","অন্যান্য ফি"],PM=["নগদ","bKash","Nagad","ব্যাংক"],INC=["দান","অনুদান","বই/সামগ্রী বিক্রয়","ভাড়া আয়","অন্যান্য"],EXC=["বেতন","বিদ্যুৎ বিল","ভাড়া","খাদ্য/রান্না","মেরামত","স্টেশনারি","যাতায়াত","অন্যান্য"],MS=["জানু","ফেব্রু","মার্চ","এপ্রি","মে","জুন","জুলা","আগ","সেপ্টে","অক্টো","নভে","ডিসে"];
let pdYm="",pyYm="",fTab="list",fQ="",fCls="",fMon="",fStat="due",trCls="",trY=new Date().getFullYear(),ieTab="sum",ieM=new Date().getMonth(),ieY=new Date().getFullYear(),slM=new Date().getMonth(),slY=new Date().getFullYear(),slTab="pay",pdTab="stu",pdQ="",pdCls="",pdType="",pdSel={},pdBulk=false,pyQ="",pySid="",pyM="নগদ",fbD={},payC={ids:[],m:"নগদ"},slC={},txD={},txId=null,txT="in",fD={};
const fym=f=>f.ym||f.auto||(f.date||"").slice(0,7),ftype=f=>f.type||String(f.title||"").split(" — ")[0],fmon=f=>MN[(+fym(f).slice(5,7)||1)-1]||"";
const fmy=f=>fmon(f)+" "+bn(fym(f).slice(0,4));
const fchip=f=>due(f)<=0?'<span class="pl g" style="margin:0">পরিশোধিত</span>':f.paid>0?'<span class="pl" style="margin:0;background:#fef3c7;color:#b45309">আংশিক</span>':'<span class="pl r" style="margin:0">বকেয়া</span>';
const rcpNo=()=>"RCP-"+Date.now()+"-"+Math.random().toString(16).slice(2,6);
function payFee(f,amt,m,d){amt=Math.min(+amt||0,due(f));if(amt<=0)return false;f.paid+=amt;f.pdate=d||today();f.method=m||f.method||"নগদ";if(!f.rcp)f.rcp=rcpNo();return true}
const sumA=l=>l.reduce((a,x)=>a+x.amt,0);
const fmtK=v=>v>=1000?bn((v/1000).toFixed(v%1000?1:0))+"K":bn(Math.round(v));
const pChips=(cur,fn)=>PM.map(m=>`<button class="chip ${cur==m?"on":""}" data-m="${m}" onclick="${fn};[...this.parentNode.children].forEach(b=>b.classList.remove('on'));this.classList.add('on')">${m}</button>`).join(" ");
function csvOut(name,head,rows,title){const c=v=>'"'+String(v??"").replace(/"/g,'""')+'"';shareFile(name,"\uFEFF"+[head.map(c).join(",")].concat(rows.map(r=>r.map(c).join(","))).join("\r\n"),title+" (Excel/CSV)")}
function tblPdf(name,title,head,rows){printDoc(name,sch()+`<style>.ptb td,.ptb th{border:1px solid #b9e6cd;font-size:12px;padding:6px 7px}.ptb th{color:#666;font-weight:500}</style><div style="text-align:center;margin-bottom:10px;font-weight:700;color:#1d4ed8">${esc(title)}</div><table class="ptb" style="border:1px solid #1d4ed8"><tr>${head.map(h=>`<th>${h}</th>`).join("")}</tr>${rows.map(r=>`<tr>${r.map(v=>`<td>${esc(typeof v=="number"?bn(v):v)}</td>`).join("")}</tr>`).join("")||`<tr><td colspan="${head.length}">কিছু নেই</td></tr>`}</table>`)}
function bars2(rows,c1,c2){
 const W=320,H=190,L=40,B=28,T=10,max=Math.max(1,...rows.flatMap(r=>[r.a,r.b||0])),n=rows.length,bw=(W-L-8)/n;let g="";
 [0,.25,.5,.75,1].forEach(k=>{const y=T+(H-T-B)*(1-k);g+=`<line x1="${L}" x2="${W-4}" y1="${y}" y2="${y}" stroke="#e5e7eb"/><text x="${L-4}" y="${y+3}" text-anchor="end" font-size="9" fill="#6b7385">${fmtK(max*k)}</text>`});
 rows.forEach((r,i)=>{const w=bw*.76/(c2?2:1),x=L+i*bw+bw*.12,h1=(H-T-B)*r.a/max,h2=(H-T-B)*(r.b||0)/max;g+=`<rect x="${x}" y="${H-B-h1}" width="${w}" height="${h1}" fill="${c1}"/>`+(c2?`<rect x="${x+w}" y="${H-B-h2}" width="${w}" height="${h2}" fill="${c2}"/>`:"")+`<text x="${L+i*bw+bw/2}" y="${H-12}" text-anchor="middle" font-size="9" fill="#6b7385">${r.l}</text>`});
 return `<svg viewBox="0 0 ${W} ${H}" width="100%" style="display:block">${g}</svg>`;
}
const allIn=()=>sumA(Store.txns.filter(t=>t.type=="in"))+Store.fees.reduce((a,f)=>a+f.paid,0),allEx=()=>sumA(Store.txns.filter(t=>t.type=="out"))+Store.sal.reduce((a,r)=>a+r.paid,0);
function fHub(){
 const td=Store.fees.reduce((a,f)=>a+due(f),0),tp=Store.fees.reduce((a,f)=>a+f.paid,0),it=[["💳","ফি ব্যবস্থাপনা","বেতন ও পেমেন্ট ট্র্যাক করুন",money(td)+" বকেয়া","nav('fee')"],["📊","আয় ও ব্যয়","মাসিক আর্থিক হিসাব ও রিপোর্ট",money(allIn()-allEx())+" ব্যালেন্স","sub='ie';render()"],["⚠️","পেমেন্ট ড্যাশবোর্ড","বকেয়া ফি ব্যবস্থাপনা ও অভিভাবক বিজ্ঞপ্তি",bn(new Set(Store.fees.filter(f=>due(f)>0).map(f=>f.sid)).size)+" জন বকেয়া","sub='pd';render()"],["👥","শিক্ষক/কর্মী বেতন","বেতন আদায়, বকেয়া, অগ্রিম ও লেনদেন",bn(Store.teachers.length+Store.staff.length)+" জন","sub='sl';render()"],["💰","পেমেন্ট","ফি আদায় ও রসিদ ইস্যু",money(tp)+" আদায়","sub='py';render()"]];
 return phdr("ফিন্যান্স ও হিসাব","ফি, আয়-ব্যয়, বেতন ও পেমেন্ট এক জায়গায়")+`<div style="margin-top:12px">${it.map(x=>`<div class="hb" onclick="${x[4]}"><div class="ic2">${x[0]}</div><div class="f"><b>${x[1]}</b><small style="color:var(--mu);font-size:12px">${x[2]}</small></div><span class="pl b">${x[3]}</span></div>`).join("")}</div>`;
}
/* ---- fee management (bottom tab) ---- */
function fList(){const q=fQ.toLowerCase();return Store.fees.filter(f=>{const x=sOf(f.sid);return x&&(!fCls||x.cls==fCls)&&(!fMon||fym(f).slice(5,7)==fMon)&&(!q||(x.name+" "+ftype(f)).toLowerCase().includes(q))&&(fStat=="all"||(fStat=="due"?due(f)>0:due(f)<=0))}).sort((a,b)=>(b.pdate||b.date||"")>(a.pdate||a.date||"")?1:-1)}
const fcard=f=>{const x=sOf(f.sid);return `<div class="card" style="padding:12px;margin-bottom:8px"><div class="ch" style="margin:0"><div><b>${esc(x.name)}</b> ${fchip(f)}</div><span onclick="fMenu('${f.id}')" style="font-size:22px;color:var(--mu);padding:0 6px">⋯</span></div><small style="color:var(--mu)">${esc(x.cls)} · ${esc(ftype(f))} · ${fmy(f)}</small><div style="color:#16a34a;font-weight:700;margin-top:2px">${money(f.amt)}${f.paid&&due(f)>0?` <small style="color:var(--gr)">(পরিশোধ ${money(f.paid)})</small>`:""}</div></div>`};
function fee(){
 const all=Store.fees.filter(f=>sOf(f.sid)),tp=Store.fees.reduce((a,f)=>a+f.paid,0),td=Store.fees.reduce((a,f)=>a+due(f),0),nd=all.filter(f=>due(f)>0).length;
 return phdr("ফি ব্যবস্থাপনা","বেতন ও পেমেন্ট ট্র্যাক করুন")
 +`<div style="display:flex;gap:6px;flex-wrap:wrap;margin:10px 0"><button class="ob" style="color:#d97706;border-color:#f59e0b" onclick="remAll()">🔔 রিমাইন্ডার</button><button class="ob" style="color:#16a34a" onclick="remMail()">✉ ইমেইল রিমাইন্ডার</button><button class="ob" onclick="fExcel()">📄 Excel</button><button class="ob" onclick="fPdf()">🗎 PDF</button><button class="ob" style="color:#d97706;border-color:#f59e0b" onclick="fbOpen()">📋 বকেয়া তৈরি করুন</button>${feeDupGroups().length?`<button class="ob" style="color:#dc2626;border-color:#fca5a5" onclick="feeDupOpen()">🧹 ডুপ্লিকেট (${bn(feeDupGroups().length)})</button>`:""}<button class="btn" onclick="feeForm()">＋ নতুন ফি</button></div>
 <div class="st" style="background:linear-gradient(135deg,#10b981,#059669);margin-bottom:10px"><span class="ic">👛</span><small>মোট আদায়</small><div>${money(tp)}</div></div><div class="st" style="background:linear-gradient(135deg,#f43f5e,#e11d48);margin-bottom:12px"><span class="ic">👛</span><small>মোট বকেয়া</small><div>${money(td)}</div></div>
 <div class="sub">${[["list","ফি তালিকা"],["track","মাসিক বেতন ট্র্যাকার"],["stu","শিক্ষার্থী-ভিত্তিক বকেয়া"]].map(t=>`<button class="${fTab==t[0]?"on":""}" onclick="fTab='${t[0]}';render()">${t[1]}</button>`).join("")}</div>`
 +(fTab=="list"?fListView(nd,all.length-nd):fTab=="track"?fTrack():duesBy(true).map(g=>stuDueCard(g)).join("")||'<div class="em">কোনো বকেয়া নেই</div>');
}
function fListView(nd,np){
 return `<div class="card"><input placeholder="🔍 অনুসন্ধান করুন..." value="${esc(fQ)}" oninput="fQ=this.value;fKeep()"><div class="g2" style="margin:0"><select onchange="fCls=this.value;render()" style="margin:0"><option value="">শ্রেণি (সব)</option>${xClsList().map(c=>`<option ${fCls==c?"selected":""}>${esc(c)}</option>`).join("")}</select><select onchange="fMon=this.value;render()" style="margin:0"><option value="">মাস (সব)</option>${MN.map((m,i)=>`<option value="${p2(i+1)}" ${fMon==p2(i+1)?"selected":""}>${m}</option>`).join("")}</select></div></div>
 <div style="display:flex;gap:6px;margin-bottom:10px">${[["due","বকেয়া",nd],["paid","পরিশোধিত",np],["all","সকল",""]].map(c=>`<button class="chip ${fStat==c[0]?"on":""}" onclick="fStat='${c[0]}';render()">${c[1]}${c[2]!==""?" "+bn(c[2]):""}</button>`).join("")}</div><div id="flst">${fList().map(fcard).join("")||'<div class="em">কোনো রেকর্ড নেই</div>'}</div>`;
}
function fKeep(){const e=$("flst");if(e)e.innerHTML=fList().map(fcard).join("")||'<div class="em">কোনো রেকর্ড নেই</div>'}
function fRows(){return fList().map(f=>{const x=sOf(f.sid);return [x.name,x.cls,ftype(f),fmy(f),f.amt,f.paid,due(f)<=0?"পরিশোধিত":f.paid>0?"আংশিক":"বকেয়া"]})}
const fHead=["শিক্ষার্থী","শ্রেণি","ফি ধরন","মাস","পরিমাণ","পরিশোধিত","অবস্থা"];
function fExcel(){csvOut("fees-"+today()+".csv",fHead,fRows(),"ফি তালিকা")}
function fPdf(){tblPdf("fee-list","ফি ব্যবস্থাপনা — "+(fStat=="due"?"বকেয়া":fStat=="paid"?"পরিশোধিত":"সকল"),fHead,fRows())}
function fMenu(id){
 const f=Store.fees.find(x=>x.id==id),x=sOf(f.sid),A=[["🧾","রসিদ প্রিন্ট",`rcptM('${id}')`],["✏️","সম্পাদনা",`feeForm('${id}')`]];if(due(f)>0)A.unshift(["💰","পরিশোধ করুন",`payM(['${id}'])`]);
 modal(HND+`<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px"><b>${esc(x.name)} — ${esc(ftype(f))}</b><span style="padding:4px 8px" onclick="closeM()">✕</span></div>`+A.map(a=>`<div class="mr" onclick="${a[2]}"><i>${a[0]}</i>${a[1]}</div>`).join("")+`<div class="mr rd" onclick="fDel('${id}')"><i>🗑</i>মুছে ফেলুন</div>`);
}
function fDel(id){if(!confirm("এই ফি রেকর্ড মুছবেন?"))return;Store.fees=Store.fees.filter(f=>f.id!=id);logA("edit","ফি","ফি রেকর্ড মুছে ফেলা হয়েছে");save();closeM();render()}
function fTrack(){
 const cl=xClsList(),Y=new Date().getFullYear();if(!trCls||!cl.includes(trCls))trCls=cl[0]||"";
 const l=activeStu(trCls),cell=(x,m)=>{const r=Store.fees.find(f=>f.sid==x.id&&ftype(f)=="মাসিক বেতন"&&fym(f)==mk(trY,m));return r?`<td style="text-align:center;font-weight:700;color:${due(r)<=0?"var(--gr)":r.paid>0?"#b45309":"var(--rd)"}" onclick="feeForm('${r.id}')">${due(r)<=0?"✓":r.paid>0?"◐":"✕"}</td>`:'<td style="text-align:center;color:var(--mu)">–</td>'};
 return `<div class="card"><div class="g2" style="margin:0"><select onchange="trCls=this.value;render()" style="margin:0">${cl.map(c=>`<option ${trCls==c?"selected":""}>${esc(c)}</option>`).join("")}</select><select onchange="trY=+this.value;render()" style="margin:0">${[Y-1,Y,Y+1].map(y=>`<option value="${y}" ${trY==y?"selected":""}>${bn(y)}</option>`).join("")}</select></div></div><div class="card ov" style="padding:6px"><table class="tb"><tr><th>শিক্ষার্থী</th>${MS.map(m=>`<th>${m}</th>`).join("")}</tr>${l.map(x=>`<tr><td><b>${esc(x.name)}</b></td>${MS.map((_,m)=>cell(x,m)).join("")}</tr>`).join("")}</table>${l.length?"":'<div class="em">কোনো শিক্ষার্থী নেই</div>'}</div><small style="color:var(--mu)">✓ পরিশোধিত · ◐ আংশিক · ✕ বকেয়া · – রেকর্ড নেই</small>`;
}
/* fee create/edit */
function feeForm(id){if(!allow("fees"))return;
 if(!Store.students.length){alert("আগে শিক্ষার্থী যোগ করুন");return}
 const o=Store.fees.find(f=>f.id==id),d=new Date();
 fD=o?{...o,type:ftype(o),mm:fym(o).slice(5,7),yy:fym(o).slice(0,4),st:due(o)<=0?"পরিশোধিত":o.paid>0?"আংশিক":"বকেয়া"}:{sid:Store.students[0].id,type:"মাসিক বেতন",mm:p2(d.getMonth()+1),yy:String(d.getFullYear()),st:"বকেয়া",paid:0};
 modal(HND+`<h2 style="text-align:center;font-size:16px;margin-bottom:6px">${id?"ফি সম্পাদনা":"নতুন ফি"}</h2>${fsel("শিক্ষার্থী","ff_s",Store.students.map(s=>[s.id,s.name+" — "+s.cls+(s.branch?" ("+s.branch+")":"")]),fD.sid,1)}
 <div class="g2" style="margin:0"><div>${fsel("ফি ধরন","ff_t",FT,fD.type,1)}</div><div>${fi("পরিমাণ (৳)","ff_a",fD.amt,"number",1,"0")}</div><div>${fsel("মাস","ff_m",MN.map((m,i)=>[p2(i+1),m]),fD.mm)}</div><div>${fi("সাল","ff_y",fD.yy,"number")}</div><div>${fi("পরিশোধের তারিখ","ff_d",fD.pdate,"date")}</div><div>${fsel("অবস্থা","ff_st",["পরিশোধিত","বকেয়া","আংশিক"],fD.st)}</div><div>${fi("পরিশোধিত (আংশিক হলে)","ff_p",fD.paid||"","number",0,"0")}</div><div>${fsel("মাধ্যম","ff_pm",PM,fD.method,0,"নির্বাচন করুন")}</div></div>${fi("রশিদ নম্বর","ff_r",fD.rcp,"text",0,"পরিশোধের পর স্বয়ংক্রিয়")}
 <div class="bt"><button class="btn o" onclick="closeM()">বাতিল</button><button class="btn" onclick="feeSave('${id||""}')">সংরক্ষণ</button></div>`);$("mt").onclick=null;
}
function feeSave(id){
 const sid=gv("ff_s"),type=gv("ff_t"),amt=+gv("ff_a"),mm=gv("ff_m")||"01",yy=gv("ff_y")||String(new Date().getFullYear()),st=gv("ff_st"),pd=gv("ff_d"),pm=gv("ff_pm");
 if(!sid||!type||!amt){alert("শিক্ষার্থী, ফি ধরন ও পরিমাণ দিন");return}
 if(type!=="অন্যান্য ফি"&&Store.fees.some(f=>f.id!=id&&f.sid==sid&&ftype(f)==type&&fym(f)==yy+"-"+mm)){alert("এই শিক্ষার্থীর "+type+" ("+MN[+mm-1]+" "+bn(yy)+") ইতিমধ্যে আছে।\nএকই মাসের একই ফি দ্বিতীয়বার তৈরি করা যাবে না — আগেরটি সম্পাদনা করুন।");return}
 let paid=st=="পরিশোধিত"?amt:st=="বকেয়া"?0:Math.min(+gv("ff_p")||0,amt);
 const o={sid,type,amt,paid,ym:yy+"-"+mm,title:type+" — "+MN[+mm-1]+" "+bn(yy),method:pm,rcp:gv("ff_r")};
 if(paid>0){o.pdate=pd||today();if(!o.rcp)o.rcp=rcpNo()}else{o.pdate="";}
 if(id)Object.assign(Store.fees.find(f=>f.id==id),o);else Store.fees.push({id:uid(),date:today(),...o});
 logA(id?"edit":"add","ফি",(id?"ফি আপডেট: ":"নতুন ফি: ")+stuName(sid)+" — "+type+" ("+money(amt)+")");save();closeM();render();
}
/* bulk dues */
const FB_MON=(y,m1,m2)=>{const o=[];for(let m=+m1;m<=+m2;m++)o.push(y+"-"+p2(m));return o};
const feeHas=(sid,type,ym)=>Store.fees.some(f=>f.sid==sid&&ftype(f)==type&&fym(f)==ym);
function fbOpen(){const d=new Date();fbD={type:"মাসিক বেতন",y:String(d.getFullYear()),m:p2(d.getMonth()+1),m2:p2(d.getMonth()+1),amt:"",cls:"",q:"",sel:{}};drawFb()}
function fbAll(){
  const mons=FB_MON(fbD.y,fbD.m,fbD.m2);
  return activeStu().map(s=>{
    const amt=fbD.amt!==""?+fbD.amt:(fbD.type=="মাসিক বেতন"?+s.monthlyFee||0:0);
    const need=mons.filter(ym=>!feeHas(s.id,fbD.type,ym));
    return {s,amt,need,ex:need.length==0};
  });
}
function fbShown(){const q=(fbD.q||"").toLowerCase();return fbAll().filter(r=>(!fbD.cls||r.s.cls==fbD.cls)&&(!q||(r.s.name+" "+(r.s.roll||"")+" "+(r.s.phone||"")).toLowerCase().includes(q)))}
function fbGrab(){fbD.type=gv("fb_t")||fbD.type;fbD.y=gv("fb_y")||fbD.y;fbD.m=gv("fb_m")||fbD.m;fbD.m2=gv("fb_m2")||fbD.m2;if(+fbD.m2<+fbD.m)fbD.m2=fbD.m;fbD.amt=gv("fb_a");fbD.cls=gv("fb_c")}
function fbRows(){
  const l=fbShown();
  return l.map(r=>`<div class="row" style="${r.ex?"opacity:.45":""}"><input type="checkbox" class="cb" ${fbD.sel[r.s.id]&&!r.ex?"checked":""} ${r.ex?"disabled":""} onchange="fbTog('${r.s.id}')"><div class="f"><b>${esc(r.s.name)}</b><small>${esc(r.s.cls)}${r.s.branch?" • "+esc(r.s.branch):""}${r.ex?" • ইতিমধ্যে আছে":r.need.length>1?" • "+bn(r.need.length)+" মাস":""}</small></div><span style="color:var(--mu)">${money(r.amt*r.need.length)}</span></div>`).join("")||'<div class="em">কোনো শিক্ষার্থী নেই</div>';
}
function fbSummary(){
  const all=fbAll(),ok=all.filter(r=>fbD.sel[r.s.id]&&!r.ex&&r.amt>0),recs=ok.reduce((a,r)=>a+r.need.length,0),tot=ok.reduce((a,r)=>a+r.amt*r.need.length,0),ex=fbShown().filter(r=>r.ex).length;
  return (ex?`<div style="font-size:12px;color:#d97706;margin:6px 0">⚠ ${bn(ex)} জনের এই মাস/ধরনে আগে থেকেই বকেয়া আছে — আবার তৈরি হবে না।</div>`:"")+`<div style="display:flex;justify-content:space-between;align-items:center;margin-top:8px;gap:8px"><small>নির্বাচিত: <b>${bn(ok.length)} জন</b> · নতুন রেকর্ড: <b>${bn(recs)}টি</b><br>মোট বকেয়া: <b style="color:#d97706">${money(tot)}</b></small><button class="btn ${ok.length?"":"o"}" onclick="fbSave()">✓ বকেয়া তৈরি করুন</button></div>`;
}
function fbRefresh(){const a=$("fbl"),b=$("fbs");if(a)a.innerHTML=fbRows();if(b)b.innerHTML=fbSummary()}
function drawFb(){
  const cl=xClsList(),re='onchange="fbGrab();drawFb()"';
  modal(HND+`<h2 style="font-size:16px">📋 বকেয়া তৈরি করুন</h2>
<div class="g2" style="margin:0"><div>${fsel("বকেয়ার ধরন","fb_t",FT,fbD.type).replace("<select ","<select "+re+" ")}</div><div>${fi("সাল","fb_y",fbD.y,"number",0,"",re)}</div><div>${fsel("মাস (থেকে)","fb_m",MN.map((m,i)=>[p2(i+1),m]),fbD.m).replace("<select ","<select "+re+" ")}</div><div>${fsel("মাস (পর্যন্ত)","fb_m2",MN.map((m,i)=>[p2(i+1),m]),fbD.m2).replace("<select ","<select "+re+" ")}</div></div>
${fi("পরিমাণ (প্রতি মাস, সবার জন্য)","fb_a",fbD.amt,"number",0,fbD.type=="মাসিক বেতন"?"ফাঁকা = প্রত্যেকের মাসিক বেতন":"পরিমাণ",re)}
${fsel("শ্রেণী ভিত্তিক","fb_c",[["","সকল শ্রেণী"],...cl.map(c=>[c,c])],fbD.cls).replace("<select ","<select "+re+" ")}
<input id="fb_q" placeholder="🔍 একক শিক্ষার্থী খুঁজুন (নাম/রোল/মোবাইল)" value="${esc(fbD.q||"")}" oninput="fbD.q=this.value;fbRefresh()" style="margin-top:8px">
<div style="display:flex;justify-content:space-between;align-items:center;margin:8px 0"><small style="color:var(--mu)">শিক্ষার্থী নির্বাচন</small><span><button class="chip" onclick="fbSel(true)">তালিকার সব</button> <button class="chip" onclick="fbSel(false)">বাতিল</button></span></div>
<div class="card" id="fbl" style="padding:4px;max-height:240px;overflow:auto">${fbRows()}</div><div id="fbs">${fbSummary()}</div><button class="btn o" style="width:100%;margin-top:8px" onclick="closeM()">বন্ধ</button>`);$("mt").onclick=null;
}
function fbTog(id){if(fbD.sel[id])delete fbD.sel[id];else fbD.sel[id]=1;fbRefresh()}
function fbSel(on){fbD.sel=on?{...fbD.sel}:{};if(on)fbShown().filter(r=>!r.ex&&r.amt>0).forEach(r=>fbD.sel[r.s.id]=1);fbRefresh();const a=$("fbl");if(a)a.scrollTop=0}
function fbSave(){
  fbGrab();const l=fbAll().filter(r=>fbD.sel[r.s.id]&&!r.ex&&r.amt>0);
  if(!l.length){alert("অন্তত একজন বৈধ শিক্ষার্থী নির্বাচন করুন (পরিমাণ শূন্য হতে পারবে না)");return}
  let n=0;
  l.forEach(r=>r.need.forEach(ym=>{if(feeHas(r.s.id,fbD.type,ym))return;const mm=+ym.slice(5,7);Store.fees.push({id:uid(),sid:r.s.id,type:fbD.type,title:fbD.type+" — "+MN[mm-1]+" "+bn(ym.slice(0,4)),amt:r.amt,paid:0,date:today(),ym});n++}));
  logA("add","ফি",bn(l.length)+" জনের "+fbD.type+" বকেয়া ("+MN[+fbD.m-1]+(fbD.m2!=fbD.m?"–"+MN[+fbD.m2-1]:"")+") — "+bn(n)+"টি রেকর্ড");
  save();closeM();fStat="due";render();toast("✅ "+bn(n)+"টি বকেয়া তৈরি হয়েছে");
}
/* duplicate dues cleanup */
function feeDupGroups(){
  const m={};
  Store.fees.forEach(f=>{const t=ftype(f);if(t==="অন্যান্য ফি"||!fym(f))return;const k=f.sid+"|"+t+"|"+fym(f);(m[k]=m[k]||[]).push(f)});
  return Object.values(m).filter(g=>g.length>1);
}
function feeDupKeep(g){return g.slice().sort((a,b)=>(+b.paid||0)-(+a.paid||0))[0]}
function feeDupInfo(){
  let del=0,manual=0,mer=0,stuck=0;const gs=feeDupGroups();
  gs.forEach(g=>{
    const keep=feeDupKeep(g);let sum=+keep.paid||0,hp=false;
    g.forEach(f=>{if(f===keep)return;if(f.paid>0){manual++;sum+=+f.paid;hp=true}else del++});
    if(hp){if(sum<=keep.amt)mer++;else stuck++}
  });
  return {del,manual,groups:gs.length,mer,stuck};
}
function feeDupList(){
  return feeDupGroups().map(g=>{
    const keep=feeDupKeep(g),f0=g[0],x=sOf(f0.sid);
    return `<div style="border:1px solid var(--ln);border-radius:10px;padding:8px;margin-bottom:6px;font-size:12px"><b>${esc(x?x.name:"?")}</b> · ${esc(ftype(f0))} · ${fmy(f0)}`+g.map(f=>{
      const st=f===keep?'<span class="pl g">রাখা হবে</span>':f.paid>0?'<span class="pl b">আদায়সহ</span>':'<span class="pl r">মুছবে</span>';
      return `<div style="display:flex;justify-content:space-between;align-items:center;gap:6px;margin-top:4px"><span>ধার্য ${money(f.amt)} · আদায় ${money(f.paid)}${f.pdate?" · "+esc(f.pdate):""}</span>${st}</div>`}).join("")+`</div>`}).join("");
}
function feeDupOpen(){
  const i=feeDupInfo();
  if(!i.groups){alert("কোনো ডুপ্লিকেট বকেয়া পাওয়া যায়নি ✅");return}
  modal(HND+`<h2 style="font-size:16px">🧹 ডুপ্লিকেট বকেয়া মেলান</h2><div style="font-size:13px;line-height:1.7">একই শিক্ষার্থীর একই ধরনের ফি একই বছর-মাসে একাধিকবার পাওয়া গেছে।<br><b>${bn(i.groups)}টি</b> ক্ষেত্রে ডুপ্লিকেট আছে।<br>• যে বাড়তি রেকর্ডে <b>কোনো টাকা আদায় হয়নি</b>: <b style="color:#dc2626">${bn(i.del)}টি মুছে যাবে</b><br>• যেগুলোতে আদায় হয়ে গেছে: <b>${bn(i.manual)}টি</b> — এগুলো "মুছে পরিষ্কার" এ অক্ষত থাকে।<br>• "আদায়সহ একত্র" করলে আদায়ের টাকা সবচেয়ে বেশি আদায়ওয়ালা রেকর্ডে যোগ হয়ে বাড়তি রেকর্ড মুছে যায়: <b style="color:#16a34a">${bn(i.mer)}টি গ্রুপে সম্ভব</b>${i.stuck?`, <b>${bn(i.stuck)}টি গ্রুপে সম্ভব নয়</b> (মোট আদায় ধার্যের বেশি হয়ে যায়, হাতে দেখতে হবে)`:""}</div><div style="max-height:36vh;overflow:auto;margin:10px 0">${feeDupList()}</div><div class="card" style="font-size:12px;margin:8px 0;background:#fffbeb;color:#78350f">মুছে ফেলার আগে ব্যাকআপ নিয়ে রাখা ভালো। একত্র করলে বাড়তি রেকর্ডের আলাদা রসিদ নম্বর আর থাকবে না।</div><div class="bt" style="flex-wrap:wrap"><button class="btn o" onclick="closeM()">বাতিল</button>${i.del?`<button class="btn" style="background:#dc2626" onclick="feeDupClean()">মুছে পরিষ্কার</button>`:""}${i.mer?`<button class="btn g" onclick="feeDupClean(true)">আদায়সহ একত্র করুন</button>`:""}</div>`);$("mt").onclick=null;
}
function feeDupClean(merge){
  let n=0,mg=0;const rm=new Set();
  feeDupGroups().forEach(g=>{
    const keep=feeDupKeep(g),pe=g.filter(f=>f!==keep&&f.paid>0);
    let sum=+keep.paid||0;pe.forEach(f=>sum+=+f.paid);
    const can=merge&&pe.length>0&&sum<=keep.amt;
    g.forEach(f=>{
      if(f===keep)return;
      if(!(f.paid>0)){rm.add(f.id);n++}
      else if(can){rm.add(f.id);mg++}
    });
    if(can){
      if(!keep.rcp){const r=pe.find(f=>f.rcp);if(r){keep.rcp=r.rcp;keep.method=keep.method||r.method}}
      const lp=pe.concat([keep]).filter(f=>f.pdate).sort((a,b)=>a.pdate<b.pdate?1:-1)[0];
      keep.paid=sum;if(lp)keep.pdate=lp.pdate;
    }
  });
  Store.fees=Store.fees.filter(f=>!rm.has(f.id));
  logA("edit","ফি","ডুপ্লিকেট বকেয়া পরিষ্কার: "+bn(n)+"টি মুছা"+(mg?", "+bn(mg)+"টি আদায়সহ একত্র":""));
  save();closeM();render();toast("✅ "+bn(n)+"টি মুছা"+(mg?", "+bn(mg)+"টি একত্র":"")+" হয়েছে");
}
/* receipt */
function rcpHtml(f){
 const x=sOf(f.sid),sc=Store.school,r=(l,v)=>`<div style="display:flex;justify-content:space-between;font-size:12px;padding:3px 0"><span style="color:#667">${l}:</span><b>${esc(v||"—")}</b></div>`;
 return `<div style="font-family:sans-serif;color:#222;background:#eefbf3;border:1px solid #cfeedd;border-radius:12px;padding:14px;max-width:380px;margin:6px auto"><div style="text-align:center;margin-bottom:8px"><b style="font-size:16px;color:#1d4ed8">${esc(sc.rcptName||sc.name)}</b><div style="font-size:12px;color:#16a34a">ফি পরিশোধের রসিদ</div></div><div style="background:#fff;border-radius:10px;padding:8px 10px;margin-bottom:10px">${r("রসিদ নং",f.rcp)}${r("শিক্ষার্থী",x.name)}${r("শ্রেণি",x.cls)}${r("ফি এর ধরন",ftype(f))}${r("মাস",fmon(f)+" "+bn(fym(f).slice(0,4)))}${r("তারিখ",bn(fdt(f.pdate||f.date)))}${f.method?r("মাধ্যম",f.method):""}</div><div style="background:#d7f7e3;border-radius:10px;text-align:center;padding:10px"><div style="font-size:11px;color:#16a34a">পরিশোধিত পরিমাণ</div><b style="font-size:24px;color:#16a34a">${money(f.paid)}</b>${due(f)>0?`<div style="font-size:11px;color:#c62828">বাকি: ${money(due(f))}</div>`:""}</div><div style="display:flex;justify-content:flex-end;margin-top:8px"><div style="text-align:center;min-width:120px;font-size:11px;color:#444"><div style="height:38px;display:flex;align-items:flex-end;justify-content:center">${sigImg(36)}</div><div style="border-top:1px solid #667;padding-top:3px">কর্তৃপক্ষের স্বাক্ষর</div></div></div></div>`;
}
function rcptM(id){
 const f=Store.fees.find(x=>x.id==id);if(!f.rcp&&f.paid>0){f.rcp=rcpNo();save()}
 modal(HND+`<h2 style="font-size:16px">✓ ফি রসিদ</h2><label class="lb">বিদ্যালয়ের নাম (কাস্টমাইজ করুন)</label><input value="${esc(Store.school.rcptName||Store.school.name)}" oninput="Store.school.rcptName=this.value;save();$('rcv').innerHTML=rcpHtml(Store.fees.find(x=>x.id=='${id}'))"><div id="rcv">${rcpHtml(f)}</div><div class="g2" style="margin:8px 0 0"><button class="btn" onclick="printDoc('fee-receipt',rcpHtml(Store.fees.find(x=>x.id=='${id}')))">🖨 প্রিন্ট</button><button class="btn o" onclick="rcpShare('${id}')">⇪ শেয়ার</button></div><button class="btn o" style="width:100%;margin-top:8px" onclick="closeM()">বন্ধ</button>`);
}
function rcpShare(id){
 const f=Store.fees.find(x=>x.id==id),x=sOf(f.sid),t=(Store.school.rcptName||Store.school.name)+"\nফি রসিদ: "+(f.rcp||"")+"\nশিক্ষার্থী: "+x.name+" ("+x.cls+")\n"+ftype(f)+" — "+fmy(f)+"\nপরিশোধিত: "+money(f.paid)+"\nতারিখ: "+(f.pdate||f.date);
 if(navigator.share){navigator.share({text:t}).catch(()=>{});return}
 if(x.phone){sendTo(x,"wa",t);return}
 try{navigator.clipboard.writeText(t);toast("রসিদের লেখা কপি হয়েছে")}catch(e){alert(t)}
}
/* pay modal (collect) */
function payM(ids){payC={ids,m:"নগদ"};drawPay()}
function drawPay(){
 const fs=payC.ids.map(id=>Store.fees.find(f=>f.id==id)).filter(f=>f&&due(f)>0);
 if(!fs.length){alert("কোনো বকেয়া নেই");return}
 modal(HND+`<h2 style="font-size:16px;margin-bottom:6px">💰 পেমেন্ট আদায়</h2>${fs.map(f=>`<div class="row"><div class="f">${esc(stuName(f.sid))}<small>${esc(ftype(f))} · ${fmy(f)} · বাকি ${money(due(f))}</small></div><input id="pa_${f.id}" type="number" value="${due(f)}" style="width:90px;margin:0"></div>`).join("")}${fi("তারিখ","pa_d",today(),"date")}<label class="lb">মাধ্যম</label><div style="display:flex;gap:6px;flex-wrap:wrap">${pChips(payC.m,"payC.m=this.dataset.m")}</div><div class="bt"><button class="btn o" onclick="closeM()">বাতিল</button><button class="btn g" onclick="paySave()">আদায় করুন</button></div>`);$("mt").onclick=null;
}
function paySave(){
 const d=gv("pa_d")||today(),done=[];
 payC.ids.forEach(id=>{const f=Store.fees.find(x=>x.id==id),el=$("pa_"+id);if(f&&payFee(f,el?+el.value:due(f),payC.m,d))done.push(f)});
 if(!done.length){alert("পরিমাণ দিন");return}
 logA("add","পেমেন্ট",bn(done.length)+"টি ফি আদায়: "+done.map(f=>stuName(f.sid)).slice(0,2).join(", "));save();closeM();render();
 if(done.length==1)rcptM(done[0].id);else toast("✅ "+bn(done.length)+"টি পেমেন্ট আদায় হয়েছে");
}
/* reminders */
function remAll(){
 const ids=[...new Set(Store.fees.filter(f=>due(f)>0).map(f=>f.sid))].filter(id=>{const x=sOf(id);return x&&x.phone});
 if(!ids.length){alert("বকেয়া শিক্ষার্থীদের কারো মোবাইল নম্বর নেই");return}
 msgM(ids,"প্রিয় অভিভাবক,\n\nআপনার সন্তান {নাম} (শ্রেণি: {শ্রেণি})-এর মোট বকেয়া ফি {বকেয়া}। অনুগ্রহ করে দ্রুত পরিশোধ করুন।\n\nধন্যবাদ\n"+Store.school.name);
}
function remMail(){
 const em=[...new Set(Store.fees.filter(f=>due(f)>0).map(f=>sOf(f.sid)).filter(x=>x&&x.email).map(x=>x.email))];
 if(!em.length){alert("বকেয়া শিক্ষার্থীদের কারো অভিভাবকের ইমেইল নেই");return}
 location.href="mailto:?bcc="+encodeURIComponent(em.join(","))+"&subject="+encodeURIComponent(Store.school.name+" — ফি বকেয়া বিজ্ঞপ্তি")+"&body="+encodeURIComponent("প্রিয় অভিভাবক,\n\nআপনার সন্তানের ফি বকেয়া আছে। অনুগ্রহ করে পরিশোধ করুন।\n"+Store.school.name);
}
/* ---- payment dashboard ---- */
function duesBy(raw){
 const q=pdQ.toLowerCase(),m={};
 Store.fees.filter(f=>due(f)>0).forEach(f=>{const x=sOf(f.sid);if(!x)return;if(!raw){if(pdCls&&x.cls!=pdCls)return;if(pdType&&ftype(f)!=pdType)return;if(pdYm&&fym(f)!=pdYm)return;if(q&&!(x.name+" "+(x.phone||"")+" "+(x.guardian||"")).toLowerCase().includes(q))return}(m[x.id]=m[x.id]||{x,fs:[]}).fs.push(f)});
 return Object.values(m).sort((a,b)=>b.fs.reduce((t,f)=>t+due(f),0)-a.fs.reduce((t,f)=>t+due(f),0));
}
function stuDueCard(g,bulk){
 const tot=g.fs.reduce((a,f)=>a+due(f),0),x=g.x;
 return `<div class="card" style="padding:12px"><div style="display:flex;gap:8px;align-items:flex-start">${bulk?`<input type="checkbox" class="cb" ${pdSel[x.id]?"checked":""} onchange="pdTog('${x.id}')">`:""}<div class="f"><b>${esc(x.name)}</b> <span class="pl b" style="margin:0">${esc(x.cls)}</span> <span class="pl r" style="margin:0;background:#fff;border:1px solid #fca5a5">${bn(g.fs.length)}টি বকেয়া</span><div style="font-size:12px;color:var(--mu);margin:4px 0">${x.guardian?"অভিভাবক: "+esc(x.guardian)+" ":""}${x.phone?"📞 "+esc(x.phone):""}</div><div>${g.fs.map(f=>`<span class="pl r" style="margin:0 4px 4px 0;font-size:10px;background:#fff1f2;cursor:pointer" onclick="fMenu('${f.id}')">${esc(ftype(f))} (${fmy(f)}) — ${money(due(f))} ⋮</span>`).join("")}</div></div></div><div style="display:flex;justify-content:space-between;align-items:center;margin-top:6px"><b style="color:var(--rd);font-size:18px">${money(tot)}</b><div style="display:flex;gap:6px"><button class="ob g" style="padding:7px 10px" onclick="pdWa('${x.id}')">💬 WhatsApp</button><button class="ob" style="padding:7px 10px" onclick="payM([${g.fs.map(f=>`'${f.id}'`).join(",")}])">✓ পরিশোধ</button></div></div></div>`;
}
function pdWa(sid){const x=sOf(sid);if(!x.phone){alert("অভিভাবকের মোবাইল নম্বর নেই");return}msgM([sid],"প্রিয় অভিভাবক,\n\nআপনার সন্তান {নাম} (শ্রেণি: {শ্রেণি})-এর মোট বকেয়া ফি {বকেয়া}। অনুগ্রহ করে দ্রুত পরিশোধ করুন।\n\nধন্যবাদ\n"+Store.school.name)}
function pdTog(id){if(pdSel[id])delete pdSel[id];else pdSel[id]=1;const y=$("v").scrollTop;render();$("v").scrollTop=y}
function pdash(){
 const dues=Store.fees.filter(f=>due(f)>0&&sOf(f.sid)),td=dues.reduce((a,f)=>a+due(f),0),sids=[...new Set(dues.map(f=>f.sid))],wp=sids.filter(id=>sOf(id).phone).length,col=Store.fees.reduce((a,f)=>a+f.paid,0);
 const tile=(c,bg,i,l,n,sb)=>`<div class="card" style="background:${bg};border-color:${c}55;margin:0;padding:12px;display:flex;gap:10px;align-items:center"><span style="font-size:24px;color:${c}">${i}</span><div><small style="color:${c};font-size:12px">${l}</small><b style="font-size:22px;color:${c};display:block">${n}</b><small style="color:${c};font-size:11px">${sb}</small></div></div>`;
 const g=duesBy(),n=Object.keys(pdSel).length;
 return phdr("পেমেন্ট ড্যাশবোর্ড","বকেয়া ফি ব্যবস্থাপনা ও অভিভাবক বিজ্ঞপ্তি")
 +`<div style="display:flex;gap:8px;margin:10px 0"><button class="ob" onclick="render()">⟳ রিফ্রেশ</button><button class="btn" style="background:#d97706" onclick="remAll()">🔔 সকলকে রিমাইন্ডার</button></div>
 <div class="g2">${tile("#dc2626","#fff1f2","⚠","মোট বকেয়া",money(td),bn(dues.length)+"টি ফি বকেয়া")}${tile("#d97706","#fffbeb","👥","বকেয়া শিক্ষার্থী",bn(sids.length),bn(wp)+" জনের ফোন আছে")}${tile("#16a34a","#f0fdf4","✓","আদায়যোগ্য",money(col),"পরিশোধিত")}${tile("#2563eb","#eff6ff","💬","WhatsApp যোগাযোগ",bn(wp),"অভিভাবকের নম্বর আছে")}</div>
 <div class="sub">${[["stu","শিক্ষার্থী-ভিত্তিক বকেয়া"],["list","বিস্তারিত ফি তালিকা"]].map(t=>`<button class="${pdTab==t[0]?"on":""}" onclick="pdTab='${t[0]}';render()">${t[1]}</button>`).join("")}</div>
 <div class="card"><input placeholder="🔍 নাম বা মোবাইল দিয়ে খুঁজুন..." value="${esc(pdQ)}" oninput="pdQ=this.value;pdKeep()"><select onchange="pdCls=this.value;render()"><option value="">সকল শ্রেণী</option>${xClsList().map(c=>`<option ${pdCls==c?"selected":""}>${esc(c)}</option>`).join("")}</select><select onchange="pdType=this.value;render()"><option value="">সকল ধরন</option>${FT.map(c=>`<option ${pdType==c?"selected":""}>${c}</option>`).join("")}</select><select onchange="pdYm=this.value;render()" style="margin:0 0 8px"><option value="">সকল মাস</option>${[...new Set(Store.fees.filter(f=>due(f)>0).map(f=>fym(f)).filter(Boolean))].sort().reverse().map(y=>`<option value="${y}" ${pdYm==y?"selected":""}>${MN[+y.slice(5,7)-1]} ${bn(y.slice(0,4))}</option>`).join("")}</select><button class="ob" style="width:100%" onclick="pdBulk=!pdBulk;if(!pdBulk)pdSel={};render()">⚲ বাল্ক নির্বাচন</button></div>
 ${pdBulk?`<div class="card" style="padding:10px;display:flex;gap:6px;align-items:center;flex-wrap:wrap"><b style="flex:1">${bn(n)} জন নির্বাচিত</b><button class="chip" onclick="pdSelAll(true)">তালিকার সব</button><button class="chip" onclick="pdSelAll(false)">বাতিল</button>${n?`<button class="btn g s" onclick="pdBulkWa()">💬 রিমাইন্ডার</button><button class="btn s" onclick="pdBulkPay()">✓ সব আদায়</button>`:""}</div>`:""}
 <div id="pdl">${pdBody(g)}</div>`;
}
function pdBody(g){
 if(pdTab=="stu")return g.map(r=>stuDueCard(r,pdBulk)).join("")||'<div class="em">কোনো বকেয়া নেই</div>';
 return `<div class="card ov" style="padding:6px"><table class="tb wr"><tr><th>শিক্ষার্থী</th><th>শ্রেণি</th><th>ফি ধরন</th><th>মাস</th><th>পরিমাণ</th><th>অবস্থা</th><th>মোবাইল</th><th>অ্যাকশন</th></tr>${g.flatMap(r=>r.fs.map(f=>`<tr><td><b>${esc(r.x.name)}</b></td><td>${esc(r.x.cls)}</td><td>${esc(ftype(f))}</td><td>${fmy(f)}</td><td style="color:var(--rd)"><b>${money(due(f))}</b></td><td>${fchip(f)}</td><td>${esc(r.x.phone||"—")}</td><td style="white-space:nowrap"><span onclick="pdWa('${r.x.id}')" style="color:var(--gr);font-size:16px;padding:4px">💬</span><span onclick="payM(['${f.id}'])" style="color:var(--gr);font-size:16px;padding:4px">✓</span></td></tr>`)).join("")}</table>${g.length?"":'<div class="em">কোনো বকেয়া নেই</div>'}</div>`;
}
function pdKeep(){const e=$("pdl");if(e)e.innerHTML=pdBody(duesBy())}
function pdBulkWa(){const ids=Object.keys(pdSel).filter(id=>sOf(id)&&sOf(id).phone);if(!ids.length){alert("নির্বাচিতদের কারো মোবাইল নম্বর নেই");return}msgM(ids,"প্রিয় অভিভাবক,\n\nআপনার সন্তান {নাম} (শ্রেণি: {শ্রেণি})-এর মোট বকেয়া ফি {বকেয়া}। অনুগ্রহ করে দ্রুত পরিশোধ করুন।\n\nধন্যবাদ\n"+Store.school.name)}
function pdSelAll(on){pdSel={};if(on)duesBy().forEach(r=>pdSel[r.x.id]=1);const y=$("v").scrollTop;render();$("v").scrollTop=y}
function pdBulkPay(){const ids=duesBy().filter(r=>pdSel[r.x.id]).flatMap(r=>r.fs.map(f=>f.id));if(!ids.length)return;pdSel={};payM(ids)}
/* ---- payment collection page ---- */
function py(){
 const q=pyQ.toLowerCase(),l=activeStu().filter(s=>!q||(s.name+" "+s.roll+" "+(s.phone||"")).toLowerCase().includes(q)).slice(0,25),x=pySid?sOf(pySid):null;
 const recent=Store.fees.filter(f=>f.paid>0&&sOf(f.sid)).sort((a,b)=>(b.pdate||"")>(a.pdate||"")?1:-1).slice(0,10);
 let body="";
 if(x){
  const dsAll=Store.fees.filter(f=>f.sid==x.id&&due(f)>0),yms=[...new Set(dsAll.map(f=>fym(f)).filter(Boolean))].sort(),ds=dsAll.filter(f=>!pyYm||fym(f)==pyYm);
  body=`<div class="card" style="border-color:#16a34a"><div style="display:flex;gap:10px;align-items:center">${avt(x,44)}<div class="f"><b>${esc(x.name)}</b><small>${esc(x.cls)} · রোল ${esc(x.roll)}${x.guardian?" · "+esc(x.guardian):""}</small></div><span onclick="pySid='';render()" style="padding:6px">✕</span></div>
  ${yms.length>1?`<select onchange="pyYm=this.value;render()" style="margin:8px 0"><option value="">সব মাসের বকেয়া (${bn(dsAll.length)}টি)</option>${yms.map(y=>`<option value="${y}" ${pyYm==y?"selected":""}>${MN[+y.slice(5,7)-1]} ${bn(y.slice(0,4))}</option>`).join("")}</select>`:""}${ds.map(f=>`<div class="row"><input type="checkbox" class="cb" id="pc_${f.id}" checked onchange="pyTot()"><div class="f">${esc(ftype(f))}<small>${fmy(f)} · বাকি ${money(due(f))}</small></div><input id="pm_${f.id}" type="number" value="${due(f)}" oninput="pyTot()" style="width:90px;margin:0"></div>`).join("")||'<div class="em">কোনো বকেয়া নেই 🎉</div>'}
  ${ds.length?`${fi("তারিখ","py_d",today(),"date")}<label class="lb">মাধ্যম</label><div style="display:flex;gap:6px;flex-wrap:wrap">${pChips(pyM,"pyM=this.dataset.m")}</div><button class="btn g" style="width:100%;margin-top:10px" onclick="pySave()">✓ আদায় করুন (<span id="pyt">${money(ds.reduce((a,f)=>a+due(f),0))}</span>)</button>`:""}</div>`;
 }else body=`<div class="card" style="padding:6px">${l.map(s=>{const d=Store.fees.filter(f=>f.sid==s.id).reduce((a,f)=>a+due(f),0);return `<div class="row" onclick="pySid='${s.id}';pyYm='';render()">${avt(s,34)}<div class="f"><b>${esc(s.name)}</b><small>${esc(s.cls)} · রোল ${esc(s.roll)}</small></div><b style="color:${d?"var(--rd)":"var(--gr)"}">${d?money(d):"✓"}</b></div>`}).join("")||'<div class="em">কোনো শিক্ষার্থী নেই</div>'}</div>`;
 return phdr("পেমেন্ট","ফি আদায় ও রসিদ ইস্যু")+`<input placeholder="🔍 শিক্ষার্থীর নাম, রোল বা মোবাইল..." value="${esc(pyQ)}" oninput="pyQ=this.value;pySid='';render()" style="margin-top:12px">${body}
 <div class="card"><b style="font-size:14px">🕘 সাম্প্রতিক পেমেন্ট</b>${recent.map(f=>`<div class="row"><div class="f"><b>${esc(stuName(f.sid))}</b><small>${esc(ftype(f))} · ${fmy(f)} · ${esc(f.method||"নগদ")} · ${bn(f.pdate||"")}</small></div><b style="color:var(--gr)">${money(f.paid)}</b><button class="ob" style="padding:5px 9px" onclick="rcptM('${f.id}')">🧾</button></div>`).join("")||'<div class="em">কোনো পেমেন্ট নেই</div>'}</div>`;
}
function pyTot(){const ds=Store.fees.filter(f=>f.sid==pySid&&due(f)>0&&(!pyYm||fym(f)==pyYm));let t=0;ds.forEach(f=>{const c=$("pc_"+f.id),m=$("pm_"+f.id);if(c&&c.checked&&m)t+=Math.min(+m.value||0,due(f))});const e=$("pyt");if(e)e.textContent=money(t)}
function pySave(){
 const d=gv("py_d")||today(),done=[];
 Store.fees.filter(f=>f.sid==pySid&&due(f)>0&&(!pyYm||fym(f)==pyYm)).forEach(f=>{const c=$("pc_"+f.id),m=$("pm_"+f.id);if(c&&c.checked&&m&&payFee(f,+m.value,pyM,d))done.push(f)});
 if(!done.length){alert("অন্তত একটি ফি বেছে পরিমাণ দিন");return}
 logA("add","পেমেন্ট",stuName(pySid)+" — "+bn(done.length)+"টি ফি আদায়");save();render();
 if(done.length==1)rcptM(done[0].id);else modal(HND+`<div style="text-align:center"><div style="font-size:40px">✅</div><h2>পেমেন্ট সম্পন্ন</h2></div>`+done.map(f=>`<div class="row"><div class="f">${esc(ftype(f))}<small>${fmy(f)}</small></div><b>${money(f.paid)}</b><button class="ob" style="padding:5px 9px" onclick="rcptM('${f.id}')">🧾 রসিদ</button></div>`).join("")+`<button class="btn o" style="width:100%;margin-top:10px" onclick="closeM()">বন্ধ</button>`);
}
/* ---- income & expense ---- */
function incOf(ym){
 const a=Store.txns.filter(t=>t.type=="in"&&(t.date||"").slice(0,7)==ym).map(t=>({id:t.id,desc:t.title,cat:t.cat||"অন্যান্য",method:t.method||"নগদ",date:t.date,amt:t.amt,src:"txn",who:t.src||""}));
 const b=Store.fees.filter(f=>f.paid>0&&(f.pdate||f.date||"").slice(0,7)==ym).map(f=>({id:f.id,desc:stuName(f.sid)+" — "+ftype(f),cat:"ফি আদায়",method:f.method||"নগদ",date:f.pdate||f.date,amt:f.paid,src:"fee",who:""}));
 return a.concat(b).sort((x,y)=>(y.date||"")>(x.date||"")?1:-1);
}
function expOf(ym){
 const a=Store.txns.filter(t=>t.type=="out"&&(t.date||"").slice(0,7)==ym).map(t=>({id:t.id,desc:t.title,cat:t.cat||"অন্যান্য",method:t.method||"নগদ",date:t.date,amt:t.amt,src:"txn",who:t.src||""}));
 const b=Store.sal.filter(r=>r.paid>0&&(r.pdate||r.ym+"-01").slice(0,7)==ym).map(r=>{const p=pOf(r.pid);return {id:r.id,desc:(p?p.name:"কর্মী")+" — "+(r.type=="adv"?"অগ্রিম বেতন":"বেতন"),cat:"বেতন",method:r.method||"নগদ",date:r.pdate||r.ym+"-01",amt:r.paid,src:"sal",who:""}});
 return a.concat(b).sort((x,y)=>(y.date||"")>(x.date||"")?1:-1);
}
const grpCat=l=>{const m={};l.forEach(x=>m[x.cat]=(m[x.cat]||0)+x.amt);return Object.entries(m).sort((a,b)=>b[1]-a[1])};
function ie(){
 const ym=mk(ieY,ieM),inc=incOf(ym),exp=expOf(ym),ti=sumA(inc),te=sumA(exp),mob=sumA(inc.filter(x=>x.method=="bKash"||x.method=="Nagad")),Y=new Date().getFullYear(),aFee=Store.fees.reduce((a,f)=>a+(+f.paid||0),0),aOi=sumA(Store.txns.filter(t=>t.type=="in")),aSal=Store.sal.reduce((a,r)=>a+(+r.paid||0),0),aOe=sumA(Store.txns.filter(t=>t.type=="out")),aIn=aFee+aOi,aEx=aSal+aOe;
 const tile=(l,n,c,bg,i,sb)=>`<div class="card" style="background:${bg};border-color:${c}44;margin:0;padding:12px"><div style="display:flex;justify-content:space-between"><small style="color:${c}">${l}</small><span style="color:${c}">${i}</span></div><b style="font-size:20px;color:${c};display:block">${n}</b>${sb?`<small style="color:${c};font-size:11px">${sb}</small>`:""}</div>`;
 const tabs=[["sum","সারসংক্ষেপ"],["inc","আয়"],["exp","ব্যয়"],["mob","bKash/Nagad"],["fee","ফি ট্র্যাকিং"],["rep","সামারি রিপোর্ট"]];
 return phdr("আয়-ব্যয় ব্যবস্থাপনা","মাসিক আর্থিক হিসাব ও রিপোর্ট")
 +`<div style="display:flex;gap:6px;flex-wrap:wrap;margin:10px 0"><button class="ob g" onclick="ieExcel()">📄 Excel</button><button class="ob" style="color:#16a34a;border-color:#16a34a" onclick="ieRepPdf()">⬇ PDF রিপোর্ট</button><button class="btn" style="background:#4f46e5" onclick="ieGen()">📄 রিপোর্ট জেনারেটর</button></div>
 <div class="g2">${tile("মোট আয় ("+MN[ieM]+")",money(ti),"#16a34a","#f0fdf4","↗")}${tile("মোট ব্যয় ("+MN[ieM]+")",money(te),"#dc2626","#fff1f2","↘")}${tile("নিট ব্যালেন্স ("+MN[ieM]+")",money(ti-te),"#2563eb","#eff6ff","👛")}${tile("bKash+Nagad",money(mob),"#7c3aed","#faf5ff","📱","অনুমোদিত")}</div>
 <div class="card" style="padding:12px"><b style="font-size:13px">📌 সর্বমোট — শুরু থেকে এখন পর্যন্ত</b><div style="font-size:11px;color:var(--mu);margin:2px 0 8px">ফি আদায়, বেতন প্রদান ও হাতে যোগ করা সব আয়-ব্যয় স্বয়ংক্রিয়ভাবে যোগ হয়</div><div class="lx-r"><span>মোট আয়</span><b style="color:var(--gr)">${money(aIn)}</b></div><small style="color:var(--mu);display:block;margin:-2px 0 6px">ফি আদায় ${money(aFee)} + অন্যান্য আয় ${money(aOi)}</small><div class="lx-r"><span>মোট ব্যয়</span><b style="color:var(--rd)">${money(aEx)}</b></div><small style="color:var(--mu);display:block;margin:-2px 0 6px">বেতন ${money(aSal)} + অন্যান্য ব্যয় ${money(aOe)}</small><div class="lx-r" style="border-top:1px solid var(--ln);padding-top:8px"><span>বর্তমান ব্যালেন্স</span><b style="color:${aIn-aEx>=0?"#2563eb":"var(--rd)"}">${money(aIn-aEx)}</b></div></div>
<div class="card" style="display:flex;gap:8px;align-items:center;flex-wrap:wrap"><span>⚲</span><select onchange="ieM=+this.value;render()" style="margin:0;width:auto;flex:1">${MN.map((m,i)=>`<option value="${i}" ${ieM==i?"selected":""}>${m}</option>`).join("")}</select><select onchange="ieY=+this.value;render()" style="margin:0;width:90px">${[Y-2,Y-1,Y,Y+1].map(y=>`<option value="${y}" ${ieY==y?"selected":""}>${bn(y)}</option>`).join("")}</select><small style="width:100%;text-align:right">নির্বাচিত মাস: <b style="color:var(--gr)">+${money(ti)}</b> | <b style="color:var(--rd)">-${money(te)}</b> | <b style="color:#2563eb">${money(ti-te)}</b></small></div>
 <div class="sub">${tabs.map(t=>`<button class="${ieTab==t[0]?"on":""}" onclick="ieTab='${t[0]}';render()">${t[1]}</button>`).join("")}</div>`
 +(ieTab=="sum"?ieSum(ym,inc,exp):ieTab=="inc"?ieList("in",inc):ieTab=="exp"?ieList("out",exp):ieTab=="mob"?ieMob(inc):ieTab=="fee"?ieFee(ym):ieReport(ym));
}
function ieSum(ym,inc,exp){
 const rows=[];for(let k=5;k>=0;k--){let m=ieM-k,y=ieY;while(m<0){m+=12;y--}const q=mk(y,m);rows.push({l:MS[m],a:sumA(incOf(q)),b:sumA(expOf(q))})}
 const cat=(t,l,c)=>`<div class="card"><b style="color:${c}">${t} — ${MN[ieM]}</b>${grpCat(l).map(([k,v])=>`<div style="margin-top:8px"><div style="display:flex;justify-content:space-between;font-size:13px"><span>${esc(k)}</span><b>${money(v)}</b></div><div style="height:5px;border-radius:3px;background:var(--ln)"><div style="height:100%;width:${v/sumA(l)*100}%;border-radius:3px;background:${c}"></div></div></div>`).join("")||`<div class="em" style="padding:12px 0">এই মাসে কোনো ${t.includes("আয়")?"আয়":"ব্যয়"} নেই</div>`}</div>`;
 return `<div class="card"><b style="font-size:13px">📊 গত ৬ মাসের আয়-ব্যয় চার্ট</b>${bars2(rows,"#10b981","#ef4444")}<div style="display:flex;gap:14px;justify-content:center;font-size:11px"><span style="color:#10b981">■ আয়</span><span style="color:#ef4444">■ ব্যয়</span></div></div>${cat("আয়ের উৎস",inc,"#16a34a")}${cat("ব্যয়ের খাত",exp,"#dc2626")}`;
}
function ieList(t,l){
 const inc=t=="in";
 return `<button class="btn ${inc?"":"r"}" style="margin-bottom:10px" onclick="txForm('${t}')">＋ নতুন ${inc?"আয়":"ব্যয়"} যোগ</button>`+(l.map(x=>`<div class="card" style="padding:12px"><div class="ch" style="margin:0"><b>${esc(x.desc)}</b><b style="color:${inc?"var(--gr)":"var(--rd)"}">${inc?"+":"−"}${money(x.amt)}</b></div><div style="margin:4px 0"><span class="pl b" style="margin:0">${esc(x.cat)}</span> <span class="pl" style="margin:0">${esc(x.method)}</span></div><div style="display:flex;justify-content:space-between;align-items:center"><small style="color:var(--mu)">${bn(x.date||"")}${x.who?" · "+esc(x.who):""}${x.src!="txn"?" · (স্বয়ংক্রিয়)":""}</small>${x.src=="txn"?`<span style="font-size:17px"><span onclick="txForm('${t}','${x.id}')" style="padding:4px 8px">✏️</span><span onclick="txDel('${x.id}')" style="padding:4px 8px;color:var(--rd)">🗑</span></span>`:x.src=="fee"?`<span onclick="rcptM('${x.id}')" style="padding:4px 8px">🧾</span>`:""}</div></div>`).join("")||`<div class="em">এই মাসে কোনো ${inc?"আয়":"ব্যয়"} নেই</div>`);
}
function ieMob(inc){const l=inc.filter(x=>x.method=="bKash"||x.method=="Nagad");return `<div class="g2"><div class="card" style="margin:0;text-align:center"><small>bKash</small><b style="display:block;color:#e2136e;font-size:20px">${money(sumA(l.filter(x=>x.method=="bKash")))}</b></div><div class="card" style="margin:0;text-align:center"><small>Nagad</small><b style="display:block;color:#f97316;font-size:20px">${money(sumA(l.filter(x=>x.method=="Nagad")))}</b></div></div>`+(l.map(x=>`<div class="card" style="padding:10px"><div class="ch" style="margin:0"><b>${esc(x.desc)}</b><b style="color:var(--gr)">${money(x.amt)}</b></div><span class="pl" style="margin:0;background:${x.method=="bKash"?"#fde4ef":"#ffedd5"};color:${x.method=="bKash"?"#e2136e":"#f97316"}">${x.method}</span> <small style="color:var(--mu)">${bn(x.date||"")}</small></div>`).join("")||'<div class="em">এই মাসে bKash/Nagad লেনদেন নেই</div>')}
function ieFee(ym){
 const rec=Store.fees.filter(f=>fym(f)==ym),tot=rec.reduce((a,f)=>a+f.amt,0),pd=rec.reduce((a,f)=>a+f.paid,0),pays=incOf(ym).filter(x=>x.src=="fee");
 return `<div class="g2"><div class="card" style="margin:0;text-align:center"><small>ধার্য</small><b style="display:block;color:#2563eb">${money(tot)}</b></div><div class="card" style="margin:0;text-align:center"><small>আদায়</small><b style="display:block;color:var(--gr)">${money(pd)}</b></div><div class="card" style="margin:0;text-align:center"><small>বকেয়া</small><b style="display:block;color:var(--rd)">${money(tot-pd)}</b></div><div class="card" style="margin:0;text-align:center"><small>আদায় হার</small><b style="display:block">${bn(tot?Math.round(pd/tot*100):0)}%</b></div></div><div class="card" style="margin-top:12px"><b style="font-size:14px">এই মাসের ফি আদায়</b>${pays.map(x=>`<div class="row" onclick="rcptM('${x.id}')"><div class="f">${esc(x.desc)}<small>${bn(x.date||"")} · ${esc(x.method)}</small></div><b style="color:var(--gr)">${money(x.amt)}</b></div>`).join("")||'<div class="em">কোনো ফি আদায় নেই</div>'}</div>`;
}
function ieReport(ym){
 const inc=incOf(ym),exp=expOf(ym),ti=sumA(inc),te=sumA(exp),bal=allIn()-allEx(),sc=Store.school,tl=(l,n,c,bg)=>`<div style="flex:1;background:${bg};border:1px solid ${c}55;border-radius:10px;text-align:center;padding:8px 2px"><div style="font-size:10px;color:${c}">${l}</div><b style="font-size:15px;color:${c}">${n}</b></div>`;
 const tb=(h,l)=>`<table style="width:100%;border-collapse:collapse;font-size:11px;margin:4px 0 10px"><tr style="background:#f3f4f6">${h.map(x=>`<th style="padding:5px;text-align:left;border-bottom:1px solid #ddd">${x}</th>`).join("")}</tr>${l.join("")||`<tr><td colspan="${h.length}" style="padding:8px;color:#888">কোনো তথ্য নেই</td></tr>`}</table>`;
 const gl=l=>grpCat(l).map(([k,v])=>`<tr><td style="padding:4px;border-bottom:1px solid #eee">${esc(k)}</td><td style="padding:4px;text-align:right;border-bottom:1px solid #eee">${money(v)}</td></tr>`);
 const dl=l=>l.map((x,i)=>`<tr><td style="padding:4px;border-bottom:1px solid #eee">${bn(i+1)}</td><td style="padding:4px;border-bottom:1px solid #eee">${esc(x.desc)}</td><td style="padding:4px;border-bottom:1px solid #eee">${esc(x.cat)}</td><td style="padding:4px;border-bottom:1px solid #eee">${esc(x.method)}</td><td style="padding:4px;border-bottom:1px solid #eee">${bn(x.date||"")}</td><td style="padding:4px;text-align:right;border-bottom:1px solid #eee">${money(x.amt)}</td></tr>`);
 return `<div style="font-family:sans-serif;color:#222;background:#fff;padding:14px;border-radius:10px;max-width:520px;margin:0 auto"><div style="text-align:center"></div>${pdfHdr("মাসিক আয়-ব্যয় সামারি রিপোর্ট",1)}<div style="text-align:center"><div style="font-size:10px;color:#777">মাস: ${MN[+ym.slice(5)-1]} ${bn(ym.slice(0,4))} &nbsp;|&nbsp; তৈরি: ${bn(today().split("-").reverse().join("/"))}</div></div><div style="border-top:3px solid #3b82f6;margin:8px 0 10px"></div>
 <div style="display:flex;gap:6px;margin-bottom:12px">${tl("মোট আয়",money(ti),"#16a34a","#f0fdf4")}${tl("মোট ব্যয়",money(te),"#dc2626","#fff1f2")}${tl("মাসিক নিট",money(ti-te),"#2563eb","#eff6ff")}${tl("বর্তমান ব্যালেন্স",money(bal),"#7c3aed","#faf5ff")}</div>
 <div style="display:flex;gap:10px"><div style="flex:1"><b style="font-size:12px">আয়ের খাত বিস্তারিত (${bn(grpCat(inc).length)}টি)</b>${tb(["খাত","পরিমাণ"],gl(inc))}</div><div style="flex:1"><b style="font-size:12px">ব্যয়ের খাত বিস্তারিত (${bn(grpCat(exp).length)}টি)</b>${tb(["খাত","পরিমাণ"],gl(exp))}</div></div>
 <b style="font-size:12px">আয়ের বিবরণ (${bn(inc.length)}টি লেনদেন)</b>${tb(["#","বিবরণ","ধরন","মাধ্যম","তারিখ","পরিমাণ"],dl(inc))}<b style="font-size:12px">ব্যয়ের বিবরণ (${bn(exp.length)}টি লেনদেন)</b>${tb(["#","বিবরণ","ধরন","মাধ্যম","তারিখ","পরিমাণ"],dl(exp))}<div style="display:flex;justify-content:space-between;gap:20px;margin-top:8px;page-break-inside:avoid"><div style="text-align:center;min-width:130px;font-size:11px"><div style="height:44px"></div><div style="border-top:1px solid #333;padding-top:3px">হিসাবরক্ষকের স্বাক্ষর</div></div><div style="text-align:center;min-width:130px;font-size:11px"><div style="height:44px;display:flex;align-items:flex-end;justify-content:center">${sigImg(42)}</div><div style="border-top:1px solid #333;padding-top:3px">পরিচালকের স্বাক্ষর</div></div></div>
<div style="font-size:9px;color:#888;display:flex;justify-content:space-between;border-top:1px solid #eee;padding-top:6px;margin-top:10px"><span>সিস্টেম কর্তৃক স্বয়ংক্রিয়ভাবে তৈরি</span><span>তৈরির তারিখ: ${bn(today().split("-").reverse().join("/"))}</span></div></div>`;
}
function ieGen(){const ym=mk(ieY,ieM);modal(HND+`<h2 style="font-size:15px;margin-bottom:8px">📄 মাসিক রিপোর্ট জেনারেটর — ${MN[ieM]} ${bn(ieY)}</h2><div class="g2" style="margin:0 0 8px"><button class="ob" onclick="ieRepPdf()">🖨 প্রিন্ট করুন</button><button class="btn" style="background:#4f46e5" onclick="ieRepPdf()">⬇ PDF ডাউনলোড</button></div><div style="background:#eef0f5;padding:6px;border-radius:12px;overflow:auto">${ieReport(ym)}</div><button class="btn o" style="width:100%;margin-top:8px" onclick="closeM()">বন্ধ</button>`)}
function ieRepPdf(){printDoc("income-expense-report",ieReport(mk(ieY,ieM)))}
function ieExcel(){const ym=mk(ieY,ieM);csvOut("income-expense-"+ym+".csv",["ধরন","বিবরণ","খাত","মাধ্যম","তারিখ","পরিমাণ"],incOf(ym).map(x=>["আয়",x.desc,x.cat,x.method,x.date,x.amt]).concat(expOf(ym).map(x=>["ব্যয়",x.desc,x.cat,x.method,x.date,x.amt])),"আয়-ব্যয় — "+MN[ieM]+" "+ieY)}
function txForm(t,id){if(!allow("accounting"))return;txT=t;txId=id||null;const o=Store.txns.find(x=>x.id==id);txD=o?{...o}:{date:today(),method:"নগদ"};drawTx()}
function drawTx(){
 const inc=txT=="in";
 modal(HND+`<h2 style="text-align:center;font-size:16px;margin-bottom:6px">${txId?(inc?"আয় সম্পাদনা":"ব্যয় সম্পাদনা"):(inc?"নতুন আয় যোগ":"নতুন ব্যয় যোগ")}</h2>${fi("বিবরণ","tx_t",txD.title,"text",1,inc?"যেমন: জানুয়ারি মাসের বেতন":"যেমন: জানুয়ারি মাসের বিদ্যুৎ বিল")}<div class="g2" style="margin:0"><div>${fsel("ধরন","tx_c",inc?INC:EXC,txD.cat,1,"নির্বাচন করুন")}</div><div>${fi("পরিমাণ (৳)","tx_a",txD.amt,"number",1,"0")}</div><div>${fi("তারিখ","tx_d",txD.date,"date",1)}</div><div>${fsel("মাধ্যম","tx_m",PM,txD.method,0,"নির্বাচন করুন")}</div></div>${fi(inc?"উৎস":"পরিশোধ করা হয়েছে","tx_s",txD.src,"text",0,inc?"যেমন: অভিভাবকের নাম":"যেমন: শিক্ষকের নাম / ঠিকাদার")}<label class="lb">নোট</label><textarea id="tx_n" rows="3">${esc(txD.note)}</textarea><div class="bt"><button class="btn o" onclick="closeM()">বাতিল</button><button class="btn ${inc?"":"r"}" onclick="txSave()">সংরক্ষণ করুন</button></div>`);$("mt").onclick=null;
}
function txSave(){
 const o={type:txT,title:gv("tx_t"),cat:gv("tx_c"),amt:+gv("tx_a"),date:gv("tx_d"),method:gv("tx_m"),src:gv("tx_s"),note:gv("tx_n")};
 if(!o.title||!o.cat||!(o.amt>0)||!o.date){alert("বিবরণ, ধরন, পরিমাণ ও তারিখ দিন");return}
 if(txId)Object.assign(Store.txns.find(x=>x.id==txId),o);else Store.txns.push({id:uid(),...o});
 logA(txId?"edit":"add",txT=="in"?"আয়":"ব্যয়",o.title+" — "+money(o.amt));save();closeM();render();
}
function txDel(id){if(!confirm("মুছে ফেলবেন?"))return;Store.txns=Store.txns.filter(x=>x.id!=id);save();render()}


/* ---- in/out time entries (teachers & staff) ---- */
const autoLateOn=()=>Store.set.autoLate!==0;
const tmin=t=>{const a=String(t).split(":").map(Number);return a[0]*60+a[1]};
const fmtT=t=>{if(!t)return"—";const a=String(t).split(":").map(Number),h=a[0];return bn(((h+11)%12)+1)+":"+bn(p2(a[1]))+" "+(h>=12?"PM":"AM")};
const minT=m=>bn(Math.floor(m/60))+" ঘ"+(m%60?" "+bn(m%60)+" মি":"");
const durT=(i,o)=>{if(!i||!o)return"—";const m=tmin(o)-tmin(i);return m>0?minT(m):"—"};
const hhmm=()=>{const x=new Date();return p2(x.getHours())+":"+p2(x.getMinutes())};
const autoSt=(st,i)=>st=="p"&&i&&autoLateOn()&&i>(Store.set.officeIn||"09:00")?"l":st;
function hrsM(id,pre){let n=0;for(const d in Store.attT){if(d.startsWith(pre)){const t=Store.attT[d][id];if(t&&t.in&&t.out){const m=tmin(t.out)-tmin(t.in);if(m>0)n+=m}}}return n?minT(n):"—"}
function dailyTbl(l,day){const tmv=attGroup!="stu",tt=Store.attT[adate]||{};
 return `<table class="tb"><tr><th>${tmv?"#":"রোল"}</th><th>নাম</th>${tmv?"<th>ইন</th><th>আউট</th><th>ঘণ্টা</th>":"<th>শ্রেণি</th>"}<th>অবস্থা</th></tr>${l.map(m=>{const t=tt[m.id]||{};return `<tr onclick="${tmv?`attEntry('${m.id}')`:`staffDel('${m.id}')`}"><td>${bn(String(m.roll).padStart(2,"0"))}</td><td>${esc(m.name)}${tmv?`<br><small style="color:var(--mu)">${esc(m.cls)}</small>`:""}</td>${tmv?`<td>${fmtT(t.in)}</td><td>${fmtT(t.out)}</td><td>${durT(t.in,t.out)}</td>`:`<td>${esc(m.cls)}</td>`}<td>${day[m.id]?`<b style="color:${ST[day[m.id]][1]}">${ST[day[m.id]][0]}</b>`:"—"}</td></tr>`}).join("")}</table>`}
function attPunch(m){const d=adate;Store.att[d]=Store.att[d]||{};Store.attT[d]=Store.attT[d]||{};const t=Store.attT[d][m.id]||{},now=hhmm();
 if(!t.in){t.in=now;Store.att[d][m.id]=autoSt("p",now);qrMsg="✅ "+m.name+" — ইন টাইম "+fmtT(now)}else{t.out=now;if(!Store.att[d][m.id]||Store.att[d][m.id]=="a")Store.att[d][m.id]="p";qrMsg="✅ "+m.name+" — আউট টাইম "+fmtT(now)}
 Store.attT[d][m.id]=t;save()}
function attEntry(id){const l=members();if(!l.length){alert("কেউ নেই। আগে শিক্ষার্থী/শিক্ষক/কর্মী যোগ করুন।");return}
 const d=adate,st=(Store.att[d]||{})[id],t=(Store.attT[d]||{})[id]||{};
 modal(`<span onclick="closeM()" style="float:right;font-size:22px">×</span><h2 style="text-align:center;font-size:16px;margin-bottom:8px">${id?"এন্ট্রি সম্পাদনা":"নতুন এন্ট্রি"}</h2>${fsel(attGroup=="tea"?"শিক্ষক":"কর্মী","ae_p",l.map(m=>[m.id,m.name]),id||"",1,id?"":"নির্বাচন করুন")}${fi("তারিখ","ae_d",d,"date")}${fsel("অবস্থা","ae_s",Object.keys(ST).map(k=>[k,ST[k][0]]),st||"p")}<div class="g2" style="margin:0"><div>${fi("ইন টাইম","ae_i",t.in||"","time")}</div><div>${fi("আউট টাইম","ae_o",t.out||"","time")}</div></div><div class="hint">উপস্থিত বাছা অবস্থায় ইন টাইম অফিস শুরুর সময়ের পরে হলে নিজে থেকে "বিলম্ব" হবে।</div><div style="display:flex;gap:8px;margin-top:8px"><button class="btn o" style="flex:1;color:var(--tx);border-color:var(--ln)" onclick="closeM()">বাতিল</button>${id?`<button class="btn o" style="flex:1;color:#dc2626;border-color:#fca5a5" onclick="attEntryDel('${id}')">মুছুন</button>`:""}<button class="btn" style="flex:1" onclick="attEntrySave()">সংরক্ষণ</button></div>`)}
function attEntrySave(){const id=gv("ae_p"),d=gv("ae_d"),st=gv("ae_s"),i=gv("ae_i"),o=gv("ae_o");
 if(!id||!d){alert("নাম ও তারিখ দিন");return}if(i&&o&&o<=i){alert("আউট টাইম ইন টাইমের পরে হতে হবে");return}
 Store.att[d]=Store.att[d]||{};Store.attT[d]=Store.attT[d]||{};
 if(st=="a"||st=="h"){Store.att[d][id]=st;delete Store.attT[d][id]}else{Store.att[d][id]=autoSt(st,i);if(i||o)Store.attT[d][id]={in:i,out:o};else delete Store.attT[d][id]}
 adate=d;logA("edit","উপস্থিতি","ইন/আউট এন্ট্রি — "+d);save();closeM();render()}
function attEntryDel(id){if(!confirm("এই দিনের এন্ট্রি মুছবেন?"))return;if(Store.att[adate])delete Store.att[adate][id];if(Store.attT[adate])delete Store.attT[adate][id];save();closeM();render()}
let abk=null;
function attBulk(){if(!members().length){alert("কেউ নেই। আগে শিক্ষার্থী/শিক্ষক/কর্মী যোগ করুন।");return}abk={d:adate,ti:Store.set.officeIn||"09:00",to:Store.set.officeOut||"17:00",rows:{}};abLoad();abDraw()}
function abLoad(){abk.rows={};members().forEach(m=>{const st=(Store.att[abk.d]||{})[m.id],t=(Store.attT[abk.d]||{})[m.id]||{};abk.rows[m.id]={s:st||"p",i:t.in||"",o:t.out||""}})}
function abDraw(){const l=members(),q=document.querySelector("#mt>div"),y=q?q.scrollTop:0;
 modal(`<span onclick="closeM()" style="float:right;font-size:22px">×</span><h2 style="text-align:center;font-size:16px;margin-bottom:8px">বাল্ক এন্ট্রি — ${attGroup=="tea"?"শিক্ষক":"কর্মী"}</h2>${fi("তারিখ","bk_d",abk.d,"date","","",'onchange="abDate(this.value)"')}<div class="g2" style="margin:0"><div><label class="lb">ইন টাইম</label><input type="time" value="${abk.ti}" oninput="abk.ti=this.value"></div><div><label class="lb">আউট টাইম</label><input type="time" value="${abk.to}" oninput="abk.to=this.value"></div></div><div style="display:flex;gap:6px;margin:4px 0 8px;flex-wrap:wrap"><button class="btn o s" onclick="abAll()">✓ সবাইকে উপস্থিত</button><button class="btn o s" onclick="abTimes()">⏱ সবার জন্য সময় প্রয়োগ</button></div>
${l.map((m,n)=>{const r=abk.rows[m.id]||{s:"p",i:"",o:""};return `<div class="ar"><div class="ah"><span class="ai">${bn(n+1)}</span><div class="f"><b>${esc(m.name)}</b><small>${esc(m.cls)}</small></div></div><div class="ab">${Object.keys(ST).map(k=>`<button class="${r.s==k?"on":""}" style="--c:${ST[k][1]}" onclick="abSet('${m.id}','${k}')">${ST[k][0]}</button>`).join("")}</div>${r.s=="a"||r.s=="h"?"":`<div class="g2" style="margin:6px 0 0"><input type="time" value="${r.i}" oninput="abk.rows['${m.id}'].i=this.value"><input type="time" value="${r.o}" oninput="abk.rows['${m.id}'].o=this.value"></div>`}</div>`}).join("")}
<div style="display:flex;gap:8px;margin-top:10px"><button class="btn o" style="flex:1;color:var(--tx);border-color:var(--ln)" onclick="closeM()">বাতিল</button><button class="btn" style="flex:2" onclick="abSave()">সংরক্ষণ করুন</button></div>`);
 const n2=document.querySelector("#mt>div");if(n2)n2.scrollTop=y;$("mt").onclick=null}
function abDate(v){if(!v)return;abk.d=v;abLoad();abDraw()}
function abSet(id,k){const r=abk.rows[id];r.s=k;if(k=="a"||k=="h"){r.i="";r.o=""}abDraw()}
function abAll(){Object.keys(abk.rows).forEach(id=>{const r=abk.rows[id];r.s="p";if(!r.i)r.i=abk.ti;if(!r.o)r.o=abk.to});abDraw()}
function abTimes(){Object.keys(abk.rows).forEach(id=>{const r=abk.rows[id];if(r.s=="p"||r.s=="l"){r.i=abk.ti;r.o=abk.to}});abDraw()}
function abSave(){const d=abk.d;let n=0;
 for(const id in abk.rows){const r=abk.rows[id];if(r.i&&r.o&&r.o<=r.i){const x=pOf(id);alert("আউট টাইম ইন টাইমের পরে হতে হবে — "+(x?x.name:""));return}}
 Store.att[d]=Store.att[d]||{};Store.attT[d]=Store.attT[d]||{};
 for(const id in abk.rows){const r=abk.rows[id];Store.att[d][id]=autoSt(r.s,r.i);if((r.s=="p"||r.s=="l")&&(r.i||r.o))Store.attT[d][id]={in:r.i,out:r.o};else delete Store.attT[d][id];n++}
 adate=d;logA("edit","উপস্থিতি","বাল্ক ইন/আউট এন্ট্রি — "+d);save();closeM();render();toast("✓ "+bn(n)+" জনের হাজিরা সংরক্ষিত হয়েছে")}

/* ---- Super Admin Tool (only the Super Admin can open it) ---- */
let satT=0;
const SAT_TABS=[["সব স্কুল","🏢"],["ব্যবহারকারী","👥"],["অ্যাকাউন্ট","🔑"],["সিঙ্ক","🔄"],["SaaS","🛡️"],["নবায়ন অনুরোধ","📩"],["ঘোষণা","📢"],["সাবস্ক্রিপশন","⏳"],["অ্যাপ তথ্য","📊"],["লগআউট","🚪"]];
function satSubs(){
  if(!isSuper())return"";
  if(!window._remAt||Date.now()-window._remAt>20000)setTimeout(loadRemoteUsers,0);
  const L=Object.values(window._remSch||{}).sort((a,b)=>String(srvCalc(a).end).localeCompare(String(srvCalc(b).end)));
  const own=id=>{const u=(window._remUsers||[]).find(x=>x.id===id);return u?u.email:""};
  const row=r=>{
    const c=srvCalc(r),d=c.end?subDays(c.end):0,bad=r.locked||c.k==="none",warn=!bad&&d<=7;
    const col=bad?"background:#ffe4e9;color:#be123c":warn?"background:#fef3c7;color:#b45309":"background:#dcfce7;color:#15803d";
    return `<div class="card"><b>🏛 ${esc(r.name)}</b><div style="font-size:12px;color:var(--mu);word-break:break-all">${esc(own(r.owner_user_id))}</div><div style="margin:6px 0"><span class="pl" style="${col}">${esc(subBadgeText(r))}</span></div><div style="font-size:12px;color:var(--mu)">ট্রায়াল শেষ: ${esc(r.trial_end||"—")} · পেইড মেয়াদ: ${esc(r.paid_end||"—")}</div><div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:10px"><button class="btn g" onclick="satExt('${r.id}',1,0)">＋ ১ মাস</button><button class="btn o" style="color:var(--tx);border-color:var(--ln)" onclick="satExt('${r.id}',0,0)">＋ দিন যোগ</button><button class="btn ${r.locked?"g":"r"}" onclick="satFlag('${r.id}',${r.locked?"false":"true"},null)">${r.locked?"🔓 আনব্লক":"🔒 ব্লক"}</button><button class="btn o" style="color:var(--tx);border-color:var(--ln)" onclick="satFlag('${r.id}',null,${r.auto_block===false?"true":"false"})">${r.auto_block===false?"অটো-ব্লক চালু করুন":"অটো-ব্লক বন্ধ করুন"}</button></div></div>`;
  };
  return `<div class="ch"><h2>⏳ প্রতিষ্ঠানের সাবস্ক্রিপশন</h2><button class="ob s" onclick="window._remAt=0;render()">🔄 রিফ্রেশ</button></div><p class="hint" style="margin:6px 0 10px">নতুন প্রতিষ্ঠান তৈরির পর ১ মাস ফ্রি। মেয়াদ শেষ হলে অটো-ব্লক চালু থাকলে ওই প্রতিষ্ঠানের সবাই লক হয়ে নবায়ন স্ক্রিনে যাবে; আপনি যেকোনো সময় নিজে ব্লক/আনব্লক বা মেয়াদ বাড়াতে পারবেন।</p>${L.length?L.map(row).join(""):'<div class="em">সার্ভারে নিবন্ধিত কোনো প্রতিষ্ঠান নেই</div>'}`;
}
async function satExt(sid,m,d){
  if(!isSuper())return;
  if(!m){const v=prompt("কত দিন মেয়াদ বাড়াবেন? (সংখ্যা লিখুন)");d=parseInt(v,10);if(!(d>0))return}
  try{
    if(!(await needSession()))return;
    const r=await sb.rpc("smartedu_extend_school",{p_sid:sid,p_months:m,p_days:d});
    if(r.error)throw r.error;
    await loadRemSch();render();
  }catch(e){alert("মেয়াদ বাড়ানো যায়নি: "+e.message)}
}
async function satFlag(sid,lk,au){
  if(!isSuper())return;
  if(lk!==null&&!confirm(lk?"এই প্রতিষ্ঠানের সবাইকে ব্লক করবেন?":"প্রতিষ্ঠানকে আনব্লক করবেন?"))return;
  try{
    if(!(await needSession()))return;
    const r=await sb.rpc("smartedu_set_school_flags",{p_sid:sid,p_locked:lk,p_auto:au});
    if(r.error)throw r.error;
    await loadRemSch();render();
  }catch(e){alert("পরিবর্তন ব্যর্থ: "+e.message)}
}
async function subExtendFromRenewal(id){
  try{
    const x=(window._renAll||[]).find(r=>String(r.id)===String(id));if(!x)return;
    const em=String(x.user_email||"").toLowerCase();
    let u=(window._apUsers||[]).find(a=>String(a.email||"").toLowerCase()===em);
    if(!u){const a=await sb.rpc("smartedu_list_user_access");if(!a.error){window._apUsers=a.data||[];u=window._apUsers.find(v=>String(v.email||"").toLowerCase()===em)}}
    const sid=u&&u.school_id;if(!sid||sid==="main")return;
    await loadRemSch();if(!window._remSch[String(sid)])return;
    const r=await sb.rpc("smartedu_extend_school",{p_sid:sid,p_months:+x.months||0,p_days:0});
    alert(r.error?"সার্ভারে প্রতিষ্ঠানের মেয়াদ বাড়ানো যায়নি: "+r.error.message+" — সাবস্ক্রিপশন ট্যাব থেকে নিজে বাড়ান।":"প্রতিষ্ঠানের মেয়াদ বাড়ানো হয়েছে।");
  }catch(e){}
}
function satApp(){
 const st=[["শিক্ষার্থী",Store.students.length],["শিক্ষক/কর্মচারী",Store.teachers.length+Store.staff.length],["ফি লেনদেন",Store.fees.length],["বই",Store.books.length]];
 return `<div class="card"><h2>📊 অ্যাপ পরিসংখ্যান</h2><div class="g2" style="margin-top:10px">${st.map(x=>`<div class="st-cn" style="background:rgba(59,91,219,.08)"><b style="color:var(--pri)">${bn(x[1])}</b><small>${x[0]}</small></div>`).join("")}</div></div><div class="card"><h2>🔗 GitHub</h2><p class="hint" style="margin:8px 0 12px">অ্যাপের সোর্স কোড ও আপডেট</p><button class="btn o" style="width:100%;color:var(--tx);border-color:var(--ln)" onclick="openExt('${GH_URL}')">GitHub খুলুন</button></div>`}
function satLogout(){return `<div class="card"><h2>🚪 লগআউট</h2><p class="hint" style="margin:8px 0 12px">বর্তমান লগইন: ${esc(activeUser?.identifier||"")} · ${esc(myRoleText())}</p><button class="btn r" style="width:100%" onclick="logout()">লগআউট করুন</button></div>`}
function superTool(){
 if(!isSuper())return `<div class="card"><h2>অনুমতি নেই</h2><p>এই পেইজ শুধু Super Admin-এর জন্য।</p></div>`;
 return `<div style="display:flex;gap:10px;align-items:center;margin-bottom:12px"><div class="st-ic">👑</div><div><div style="font-size:20px;font-weight:700">Super Admin Tool</div><div style="color:var(--mu);font-size:13px">শুধু Super Admin-এর জন্য — প্রতিষ্ঠান, ব্যবহারকারী, সাবস্ক্রিপশন, সিঙ্ক ও SaaS নিয়ন্ত্রণ</div></div></div>
${renewBanner()}<div class="st-tabs">${SAT_TABS.map((t,i)=>`<button class="${i==satT?"on":""}" onclick="satT=${i};render()">${t[1]} ${t[0]}</button>`).join("")}</div>`+[stSch,stUsr,stAcc,stSync,saasDashboard,stRen,stAnn,satSubs,satApp,satLogout][satT]()}
/* ---- attendance-based salary (teachers & staff) ---- */
const offDay=()=>Store.set.offDay==null?5:+Store.set.offDay;
function wDays(y,m){const ym=mk(y,m),o=Store.set.wd&&+Store.set.wd[ym];if(o>0)return o;const dim=new Date(y,m+1,0).getDate();let n=0;for(let d=1;d<=dim;d++){if(new Date(y,m,d).getDay()==offDay())continue;if(evOn(ym+"-"+p2(d)).some(e=>e.type=="ছুটি"))continue;n++}return n}
function salCalc(id,y,m){const c=cnt(id,mk(y,m)),wd=wDays(y,m),pr=c.p+c.l+(Store.set.paidLeave?c.h:0),ef=Math.min(pr,wd),pe=pOf(id)||{},base=+pe.salary||0,pay=wd>0?Math.round(base*ef/wd):0;return{c,wd,pr,base,pay,ded:base-pay,pct:wd?Math.round(ef/wd*1000)/10:0}}
function slBase(p,ym){const base=+p.salary||0;if(!Store.set.attSal)return base;const has=Object.keys(Store.att).some(d=>d.startsWith(ym)&&Store.att[d][p.id]);return has?salCalc(p.id,+ym.slice(0,4),+ym.slice(5)-1).pay:base}
function attCfg(k,v){Store.set[k]=v;save();render()}
function repCards(l,pre){let p=0,a=0,lt=0,h=0;l.forEach(m=>{const c=cnt(m.id,pre);p+=c.p;a+=c.a;lt+=c.l;h+=c.h});
 const t=[["মোট উপস্থিত",p,"#16a34a","#ecfdf5"],["মোট অনুপস্থিত",a,"#e11d48","#fff1f2"],["বিলম্বে",lt,"#f59e0b","#fffbeb"],["ছুটিতে",h,"#16a34a","#e6f7ee"]];
 return `<div style="font-size:13px;color:var(--mu);margin:-4px 0 8px">কর্মদিন: <b style="color:var(--tx)">${bn(wDays(attYear,attMonth))}</b></div><div class="g2" style="margin-bottom:10px">${t.map(x=>`<div style="background:${x[3]};border-radius:12px;padding:14px;text-align:center"><b style="font-size:26px;color:${x[2]};display:block">${bn(x[1])}</b><small style="color:${x[2]}">${x[0]}</small></div>`).join("")}</div>`}
function salRows(){const y=attYear,m=attMonth;return members().map(x=>({x,r:salCalc(x.id,y,m)}))}
function salTab(){
 const y=attYear,m=attMonth,ym=mk(y,m),Y=new Date().getFullYear(),rows=salRows(),wd=wDays(y,m),tb=rows.reduce((a,o)=>a+o.r.base,0),tp=rows.reduce((a,o)=>a+o.r.pay,0),td=tb-tp,lbl=MN[m]+" "+bn(y);
 const cd=(l,v,c,bg)=>`<div style="background:${bg};border-radius:12px;padding:14px;text-align:center"><b style="font-size:22px;color:${c};display:block">${money(v)}</b><small style="color:${c}">${l}</small></div>`;
 return `<div style="display:flex;gap:8px;margin-bottom:10px;flex-wrap:wrap"><select style="margin:0;flex:1;min-width:110px" onchange="attMonth=+this.value;render()">${MN.map((n,i)=>`<option value="${i}" ${m==i?"selected":""}>${n}</option>`).join("")}</select><select style="margin:0;width:90px" onchange="attYear=+this.value;render()">${[Y-1,Y,Y+1].map(v=>`<option value="${v}" ${y==v?"selected":""}>${bn(v)}</option>`).join("")}</select><button class="btn o s" style="color:#16a34a;border-color:#86efac" onclick="salXls()">Excel</button><button class="btn o s" onclick="salPdf()">⬇ PDF রিপোর্ট</button></div>
<div class="g2" style="margin-bottom:10px">${cd("মোট মূল বেতন",tb,"#2563eb","#eff6ff")}${cd("প্রযোজ্য বেতন",tp,"#059669","#ecfdf5")}${cd("কর্তন",td,"#e11d48","#fff1f2")}</div>
<div class="card"><h2>⚙️ বেতন নির্ধারণের নিয়ম</h2><div class="g2" style="margin:0"><div><label class="lb">অফিস শুরুর সময়</label><input type="time" value="${Store.set.officeIn||"09:00"}" onchange="Store.set.officeIn=this.value;save()"></div><div><label class="lb">অফিস শেষের সময়</label><input type="time" value="${Store.set.officeOut||"17:00"}" onchange="Store.set.officeOut=this.value;save()"></div></div><div class="st-tg" onclick="attCfg('autoLate',${autoLateOn()?0:1})"><div style="flex:1"><b style="font-weight:600;font-size:14px">দেরিতে এলে স্বয়ংক্রিয় 'বিলম্ব'</b><small>ইন টাইম অফিস শুরুর সময়ের পরে হলে বিলম্ব চিহ্নিত হবে</small></div><div class="st-sw ${autoLateOn()?"on":""}"><i></i></div></div><label class="lb">কর্মদিন (খালি রাখলে নিজে হিসাব হবে: ${bn(wd)})</label><input type="number" inputmode="numeric" value="${Store.set.wd&&Store.set.wd[ym]?Store.set.wd[ym]:""}" placeholder="${bn(wd)}" onchange="Store.set.wd=Store.set.wd||{};Store.set.wd['${ym}']=+this.value||0;save();render()"><label class="lb">সাপ্তাহিক ছুটির দিন</label><select onchange="attCfg('offDay',+this.value)">${[[5,"শুক্রবার"],[6,"শনিবার"],[0,"রবিবার"],[-1,"কোনো সাপ্তাহিক ছুটি নেই"]].map(x=>`<option value="${x[0]}" ${offDay()==x[0]?"selected":""}>${x[1]}</option>`).join("")}</select>${stTg("ছুটিকে বেতনসহ গণ্য করুন","'ছুটি' চিহ্নিত দিনও উপস্থিত দিন হিসেবে ধরা হবে","paidLeave")}${stTg("উপস্থিতির ভিত্তিতে বেতন নির্ধারণ","বন্ধ থাকলে বেতন তালিকায় পুরো মূল বেতন বসবে","attSal")}<button class="btn" style="width:100%" onclick="salApply()">✓ বেতন তালিকায় প্রয়োগ করুন</button><div class="hint" style="margin-top:6px">ঘোষিত ইভেন্ট ক্যালেন্ডারের "ছুটি" ধরনের দিনগুলো কর্মদিন থেকে বাদ যায়।</div></div>
<div class="card ov" style="padding:6px"><div style="padding:6px 8px;font-weight:700">💰 ${lbl} — বেতন বিবরণী</div><table class="tb"><tr><th>${attGroup=="tea"?"শিক্ষক":"কর্মী"}</th><th>উপস্থিত</th><th>কর্মদিন</th><th>হাজিরা %</th><th>মূল বেতন</th><th>কর্তন</th><th>প্রযোজ্য বেতন</th></tr>${rows.map(o=>`<tr><td><b>${esc(o.x.name)}</b><br><small style="color:var(--mu)">${esc(o.x.cls)}</small></td><td>${bn(o.r.pr)} দিন</td><td>${bn(o.r.wd)} দিন</td><td style="color:${o.r.pct>=75?"#16a34a":o.r.pct>=50?"#f59e0b":"#e11d48"};font-weight:700">${bn(o.r.pct)}%</td><td>${money(o.r.base)}</td><td style="color:#e11d48">${o.r.ded>0?"-"+money(o.r.ded):money(0)}</td><td style="color:#2563eb;font-weight:700">${money(o.r.pay)}</td></tr>`).join("")}</table>${rows.length?"":'<div class="em">কেউ নেই</div>'}<div style="font-size:12px;color:var(--mu);padding:8px">* প্রযোজ্য বেতন = (উপস্থিত দিন ÷ ${bn(wd)} কর্মদিবস) × মূল বেতন</div></div>`}
function salApply(){const y=attYear,m=attMonth,ym=mk(y,m);let n=0;salRows().forEach(o=>{const p=pOf(o.x.id);if(!p||!(+p.salary>0))return;let r=salRec(p.id,ym);const pay=o.r.pay;if(!r){Store.sal.push({id:uid(),pid:p.id,ym,type:"salary",base:pay,paid:0,att:{pr:o.r.pr,wd:o.r.wd}})}else{r.base=Math.max(pay,r.paid);r.att={pr:o.r.pr,wd:o.r.wd}}n++});
 if(!n){toast("মূল বেতন নির্ধারিত কেউ নেই");return}logA("edit","বেতন",MN[m]+" — উপস্থিতি অনুযায়ী বেতন প্রয়োগ");save();toast("✓ "+bn(n)+" জনের বেতন উপস্থিতি অনুযায়ী হালনাগাদ হয়েছে")}
function salXls(){const rows=salRows(),c=v=>'"'+String(v??"").replace(/"/g,'""')+'"',H=[attGroup=="tea"?"শিক্ষক":"কর্মী","পদ/পদবি","উপস্থিত দিন","কর্মদিন","হাজিরা %","মূল বেতন","কর্তন","প্রযোজ্য বেতন"].map(trS);
 shareFile("salary-"+attGroup+"-"+mk(attYear,attMonth)+".csv","\uFEFF"+[H.map(c).join(",")].concat(rows.map(o=>[o.x.name,o.x.cls,o.r.pr,o.r.wd,o.r.pct,o.r.base,o.r.ded,o.r.pay].map(c).join(","))).join("\r\n"),"বেতন বিবরণী (Excel/CSV)")}
function salPdf(){const rows=salRows(),y=attYear,m=attMonth,tb=rows.reduce((a,o)=>a+o.r.base,0),tp=rows.reduce((a,o)=>a+o.r.pay,0);
 printDoc("salary-"+attGroup+"-"+mk(y,m),`<style>.ptb td,.ptb th{border:1px solid #b9e6cd;font-size:12px;padding:6px 7px}.ptb th{color:#666;font-weight:500}</style>${pdfHdr()}<h2 style="text-align:center;color:#1d4ed8;margin:6px 0">${attGroup=="tea"?"শিক্ষক":"কর্মী"} বেতন বিবরণী — ${MN[m]} ${bn(y)}</h2><div style="text-align:center;font-size:11px;color:#555;margin-bottom:10px">${esc(Store.school.name)} · কর্মদিন: ${bn(wDays(y,m))} · মোট মূল বেতন ${money(tb)} · প্রযোজ্য বেতন ${money(tp)}</div><table class="ptb" style="border:1px solid #1d4ed8;width:100%"><tr>${[attGroup=="tea"?"শিক্ষক":"কর্মী","উপস্থিত","কর্মদিন","হাজিরা %","মূল বেতন","কর্তন","প্রযোজ্য বেতন"].map(h=>`<th>${h}</th>`).join("")}</tr>${rows.map(o=>`<tr><td>${esc(o.x.name)}<br><small>${esc(o.x.cls)}</small></td><td>${bn(o.r.pr)}</td><td>${bn(o.r.wd)}</td><td>${bn(o.r.pct)}%</td><td>${money(o.r.base)}</td><td>${money(o.r.ded)}</td><td><b>${money(o.r.pay)}</b></td></tr>`).join("")}</table><p style="font-size:11px;color:#555">* প্রযোজ্য বেতন = (উপস্থিত দিন ÷ ${bn(wDays(y,m))} কর্মদিবস) × মূল বেতন</p>`)}
/* ---- teacher/staff salary ---- */
const people=()=>Store.teachers.filter(t=>t.status!="নিষ্ক্রিয়").map(t=>({...t,kind:"শিক্ষক"})).concat(Store.staff.filter(t=>t.status!="নিষ্ক্রিয়").map(t=>({...t,kind:"কর্মী"})));
const slYm=()=>mk(slY,slM),salRec=(pid,ym)=>Store.sal.find(r=>r.pid==pid&&r.ym==ym&&r.type!="adv"),slDue=r=>r.base-r.paid;
function slStat(r){if(!r)return ["অপ্রদত্ত","#6b7385","var(--ln)"];return slDue(r)<=0?["পরিশোধিত","#16a34a","#dcfce7"]:r.paid>0?["আংশিক","#b45309","#fef3c7"]:["বকেয়া","#e11d48","#ffe4e9"]}
const slChip=r=>{const a=slStat(r);return `<span class="pl" style="margin:0;background:${a[2]};color:${a[1]}">${a[0]}</span>`};
const initial=n=>`<span class="av" style="width:32px;height:32px;font-size:13px;background:#d7f2e3;color:#16a34a">${esc((n||"?").trim().slice(0,1))}</span>`;
function sl(){
 const ym=slYm(),ps=people(),rec=Store.sal.filter(r=>r.ym==ym&&r.type!="adv"),base=ps.reduce((a,p)=>a+(+p.salary||0),0),paidM=rec.reduce((a,r)=>a+r.paid,0),dueM=rec.reduce((a,r)=>a+Math.max(0,slDue(r)),0),adv=Store.sal.filter(r=>r.type=="adv").reduce((a,r)=>a+r.paid,0),Y=new Date().getFullYear();
 const tile=(i,l,n,c,bg)=>`<div class="card" style="margin:0;padding:12px;display:flex;gap:10px;align-items:center"><span class="av" style="width:38px;height:38px;background:${bg};color:${c}">${i}</span><div><small style="color:var(--mu);font-size:12px">${l}</small><b style="font-size:18px;display:block">${n}</b></div></div>`;
 const yr=Array.from({length:12},(_,m)=>{const q=mk(slY,m),r=Store.sal.filter(x=>x.ym==q&&x.type!="adv");return {l:MS[m],a:r.reduce((t,x)=>t+x.base,0),b:r.reduce((t,x)=>t+x.paid,0)}});
 const dueN=rec.filter(r=>slDue(r)>0).length;
 let tab="";
 if(slTab=="pay")tab=ps.map(p=>{const r=salRec(p.id,ym);return `<div class="card" style="padding:12px"><div style="display:flex;gap:10px;align-items:center">${initial(p.name)}<div class="f"><b>${esc(p.name)}</b><small>${esc(p.desig||"")} • ${p.kind}</small></div>${slChip(r)}</div><div style="display:flex;justify-content:space-between;align-items:center;margin-top:8px"><small>মাসিক বেতন: <b style="color:#2563eb">${money(p.salary||0)}</b></small><div style="display:flex;gap:6px"><button class="btn g s" onclick="slPay('${p.id}')">✓ আদায় করুন</button><button class="ob" style="color:#d97706;border-color:#f59e0b;padding:6px 10px" onclick="slAdv('${p.id}')">➕ অগ্রিম</button></div></div></div>`}).join("")||'<div class="em">কোনো শিক্ষক/কর্মী নেই</div>';
 else if(slTab=="due")tab=Store.sal.filter(r=>r.type!="adv"&&slDue(r)>0&&pOf(r.pid)).sort((a,b)=>b.ym>a.ym?1:-1).map(r=>{const p=pOf(r.pid);return `<div class="card" style="border-left:4px solid #ef4444;padding:12px"><div class="ch" style="margin:0"><div><b>${esc(p.name)}</b><small style="display:block;color:var(--mu)">${esc(p.desig||"")} • মাসিক বেতন — ${MN[+r.ym.slice(5)-1]} ${bn(r.ym.slice(0,4))}</small></div><b style="color:var(--rd);font-size:18px">${money(slDue(r))}</b></div><div style="text-align:right;margin-top:6px"><button class="btn g s" onclick="slPay('${r.pid}','${r.id}')">✓ পরিশোধ করুন</button></div></div>`}).join("")||'<div class="em">কোনো বকেয়া নেই</div>';
 else tab=Store.sal.slice().sort((a,b)=>(b.ym+(b.pdate||""))>(a.ym+(a.pdate||""))?1:-1).map(r=>{const p=pOf(r.pid);if(!p)return "";const a=slStat(r.type=="adv"?{base:0,paid:1}:r);return `<div class="card" style="padding:12px"><div class="ch" style="margin:0"><div><b>${esc(p.name)}</b><small style="display:block;color:var(--mu)">${p.kind} • ${esc(p.desig||"")}</small></div><b style="font-size:17px">${money(r.type=="adv"?r.paid:r.base)}</b></div><div style="margin:6px 0"><span class="pl b" style="margin:0">${r.type=="adv"?"অগ্রিম":"মাসিক বেতন"}</span> ${r.type=="adv"?"":slChip(r)} <small style="color:var(--mu)">${MN[+r.ym.slice(5)-1]} ${bn(r.ym.slice(0,4))}</small><span style="float:right"><span onclick="slEdit('${r.id}')" style="padding:4px 8px">✏️</span><span onclick="slDel('${r.id}')" style="padding:4px 8px;color:var(--rd)">🗑</span></span></div><div style="font-size:12px;line-height:1.8;color:var(--mu)">${r.type=="adv"?"":`<div style="display:flex;justify-content:space-between"><span>মূল মাসিক বেতন</span><b style="color:var(--tx)">${money(r.base)}</b></div>`}<div style="display:flex;justify-content:space-between"><span>${r.type=="adv"?"অগ্রিমের পরিমাণ":"এই লেনদেনে আদায়"}</span><b style="color:var(--gr)">${money(r.paid)}</b></div><div style="display:flex;justify-content:space-between"><span>আদায়ের তারিখ</span><b style="color:var(--tx)">${r.pdate?bn(r.pdate):"—"}</b></div>${r.type=="adv"?"":`<div style="display:flex;justify-content:space-between"><span>মূল বেতন থেকে বকেয়া</span><b style="color:var(--rd)">${money(Math.max(0,slDue(r)))}</b></div>`}</div></div>`}).join("")||'<div class="em">কোনো লেনদেন নেই</div>';
 return phdr("শিক্ষক ও কর্মচারী বেতন","বেতন আদায়, বকেয়া, অগ্রিম ও লেনদেনের সকল তথ্য")
 +`<div class="card" style="margin-top:12px"><div class="g2" style="margin:0"><div><label class="lb">মাস</label><select onchange="slM=+this.value;render()" style="margin:0">${MN.map((m,i)=>`<option value="${i}" ${slM==i?"selected":""}>${m}</option>`).join("")}</select></div><div><label class="lb">সাল</label><input type="number" value="${slY}" onchange="slY=+this.value||slY;render()" style="margin:0"></div></div><button class="ob" style="width:100%;margin-top:8px" onclick="slGen()">＋ এই মাসের বকেয়া তৈরি</button></div>
 <div class="g2">${tile("👥","মোট মাসিক বেতন",money(base),"#2563eb","#dbeafe")}${tile("✓","আদায়কৃত",money(paidM),"#16a34a","#dcfce7")}${tile("⚠","বকেয়া",money(dueM),"#dc2626","#fee2e2")}${tile("💵","অগ্রিম",money(adv),"#d97706","#fef3c7")}</div>
 <div class="card"><b style="font-size:14px;color:#2563eb">◔ মাসিক বেতন সামারি — ${MN[slM]} ${bn(slY)}</b><div style="display:flex;gap:6px;margin:10px 0">${[["মোট বেতন",money(rec.reduce((a,r)=>a+r.base,0)),"#2563eb","#eff6ff"],["পরিশোধিত",money(paidM),"#16a34a","#f0fdf4"],["বকেয়া",money(dueM),"#dc2626","#fef2f2"]].map(t=>`<div style="flex:1;background:${t[3]};border-radius:10px;text-align:center;padding:8px 2px"><small style="font-size:10px;color:${t[2]}">${t[0]}</small><b style="display:block;color:${t[2]}">${t[1]}</b></div>`).join("")}</div>
 ${rec.length?donut([{v:paidM,c:"#10b981"},{v:dueM,c:"#ef4444"}],150,22,"","",""):'<div class="em" style="padding:30px 0">এই মাসের কোনো বেতন রেকর্ড নেই</div>'}
 <div style="display:flex;justify-content:space-between;font-size:13px;margin-top:8px"><span style="color:var(--mu)">আদায় হার</span><b style="color:var(--gr)">${bn(rec.length&&(paidM+dueM)?Math.round(paidM/(paidM+dueM)*100):0)}%</b></div><div style="height:8px;border-radius:4px;background:${dueM?"#ef4444":"var(--ln)"};margin:6px 0"><div style="height:100%;width:${rec.length&&(paidM+dueM)?paidM/(paidM+dueM)*100:0}%;border-radius:4px;background:#10b981"></div></div>
 ${dueN?`<button class="btn g" style="width:100%" onclick="slPayAll()">✓ সব বকেয়া পরিশোধ করুন (${bn(dueN)} জন · ${money(dueM)})</button>`:rec.length?'<div style="text-align:center;color:var(--gr);font-size:13px">✓ সকল বেতন পরিশোধিত হয়েছে</div>':""}
 <div style="font-size:12px;color:var(--mu);margin:10px 0 4px">👥 শিক্ষক ও কর্মচারী তালিকা (${bn(ps.length)})</div>${ps.map(p=>{const r=salRec(p.id,ym);return `<div class="card" style="padding:10px;margin-bottom:6px;display:flex;gap:8px;align-items:center">${initial(p.name)}<div class="f"><b style="font-size:13px">${esc(p.name)}</b><small>${esc(p.desig||"")} • ${money(p.salary||0)}</small></div>${slChip(r)}<button class="btn g s" onclick="slPay('${p.id}')">✓ আদায়</button><span onclick="${r?`slEdit('${r.id}')`:`slPay('${p.id}')`}" style="padding:4px">✏️</span></div>`}).join("")}</div>
 <div class="card"><b style="font-size:13px">↗ গত এক বছরের লেনদেন</b>${bars2(yr,"#2563eb","#10b981")}<div style="display:flex;gap:14px;justify-content:center;font-size:11px"><span style="color:#2563eb">■ ধার্য বেতন</span><span style="color:#10b981">■ আদায়</span></div></div>
 <div class="sub">${[["pay","বেতন আদায়"],["due","বকেয়া তালিকা"],["txn","লেনদেন"]].map(t=>`<button class="${slTab==t[0]?"on":""}" onclick="slTab='${t[0]}';render()">${t[1]}</button>`).join("")}</div>${tab}`;
}
function slGen(){
 const ym=slYm();let n=0;people().forEach(p=>{if(+p.salary>0&&!salRec(p.id,ym)){Store.sal.push({id:uid(),pid:p.id,ym,type:"salary",base:slBase(p,ym),paid:0});n++}});
 if(!n){toast("এই মাসের সব রেকর্ড আগেই তৈরি আছে (বা বেতন নির্ধারিত নেই)");return}
 logA("add","বেতন",bn(n)+" জনের "+MN[slM]+" মাসের বকেয়া তৈরি");save();render();toast("✅ "+bn(n)+" জনের বকেয়া তৈরি হয়েছে");
}
function slPay(pid,rid){
 const p=pOf(pid),r=rid?Store.sal.find(x=>x.id==rid):salRec(pid,slYm());slC={pid,rid:r?r.id:null,ym:r?r.ym:slYm(),m:"নগদ"};
 modal(HND+`<h2 style="font-size:16px;margin-bottom:4px">✓ বেতন আদায় — ${esc(p.name)}</h2><small style="color:var(--mu)">${MN[+slC.ym.slice(5)-1]} ${bn(slC.ym.slice(0,4))} · মূল বেতন ${money(r?r.base:p.salary||0)}</small>${fi("পরিমাণ (৳)","sp_a",r?Math.max(0,slDue(r)):(p.salary||""),"number",1)}${fi("তারিখ","sp_d",today(),"date")}<label class="lb">মাধ্যম</label><div style="display:flex;gap:6px;flex-wrap:wrap">${pChips(slC.m,"slC.m=this.dataset.m")}</div><div class="bt"><button class="btn o" onclick="closeM()">বাতিল</button><button class="btn g" onclick="slPaySave()">আদায় করুন</button></div>`);
}
function slPaySave(){
 const p=pOf(slC.pid),a=+gv("sp_a");if(!(a>0)){alert("পরিমাণ দিন");return}
 let r=slC.rid?Store.sal.find(x=>x.id==slC.rid):null;if(!r){r={id:uid(),pid:slC.pid,ym:slC.ym,type:"salary",base:slBase(p,slC.ym),paid:0};Store.sal.push(r)}
 r.paid+=a;if(r.paid>r.base)r.base=r.paid;r.pdate=gv("sp_d")||today();r.method=slC.m;
 logA("add","বেতন",p.name+" — "+money(a)+" আদায়");save();closeM();render();toast("✅ বেতন আদায় সংরক্ষিত");
}
function slPayAll(){
 const ym=slYm(),d=today();let n=0,t=0;people().forEach(p=>{let r=salRec(p.id,ym);if(!r&&+p.salary>0){r={id:uid(),pid:p.id,ym,type:"salary",base:slBase(p,ym),paid:0};Store.sal.push(r)}if(r&&slDue(r)>0){t+=slDue(r);r.paid=r.base;r.pdate=d;r.method="নগদ";n++}});
 if(!n)return;if(!confirm(bn(n)+" জনের "+money(t)+" পরিশোধ করবেন?")){return}
 logA("add","বেতন",bn(n)+" জনের বেতন পরিশোধ ("+MN[slM]+")");save();render();
}
function slAdv(pid){
 const p=pOf(pid);slC={pid,m:"নগদ"};
 modal(HND+`<h2 style="font-size:16px;margin-bottom:4px">➕ অগ্রিম — ${esc(p.name)}</h2>${fi("অগ্রিমের পরিমাণ (৳)","sp_a","","number",1)}${fi("তারিখ","sp_d",today(),"date")}<label class="lb">মাধ্যম</label><div style="display:flex;gap:6px;flex-wrap:wrap">${pChips(slC.m,"slC.m=this.dataset.m")}</div><div class="bt"><button class="btn o" onclick="closeM()">বাতিল</button><button class="btn" style="background:#d97706" onclick="slAdvSave()">সংরক্ষণ</button></div>`);
}
function slAdvSave(){const a=+gv("sp_a"),d=gv("sp_d")||today();if(!(a>0)){alert("পরিমাণ দিন");return}Store.sal.push({id:uid(),pid:slC.pid,ym:d.slice(0,7),type:"adv",base:0,paid:a,pdate:d,method:slC.m});logA("add","বেতন",pOf(slC.pid).name+" — অগ্রিম "+money(a));save();closeM();render()}
function slEdit(id){
 const r=Store.sal.find(x=>x.id==id),p=pOf(r.pid);slC={rid:id,m:r.method||"নগদ"};
 modal(HND+`<h2 style="font-size:16px;margin-bottom:4px">✏️ সম্পাদনা — ${p?esc(p.name):""}</h2>${r.type=="adv"?"":fi("মূল মাসিক বেতন (৳)","se_b",r.base,"number")}${fi(r.type=="adv"?"অগ্রিমের পরিমাণ (৳)":"আদায়কৃত (৳)","se_p",r.paid,"number")}${fi("তারিখ","se_d",r.pdate,"date")}<label class="lb">মাধ্যম</label><div style="display:flex;gap:6px;flex-wrap:wrap">${pChips(slC.m,"slC.m=this.dataset.m")}</div><div class="bt"><button class="btn o" onclick="closeM()">বাতিল</button><button class="btn" onclick="slEditSave()">সংরক্ষণ</button></div>`);
}
function slEditSave(){const r=Store.sal.find(x=>x.id==slC.rid);if(r.type!="adv")r.base=+gv("se_b")||0;r.paid=+gv("se_p")||0;if(r.type!="adv"&&r.paid>r.base)r.base=r.paid;r.pdate=gv("se_d");r.method=slC.m;save();closeM();render()}
function slDel(id){if(!confirm("এই রেকর্ড মুছবেন?"))return;Store.sal=Store.sal.filter(x=>x.id!=id);save();render()}
let reportY=new Date().getFullYear(),reportM=new Date().getMonth();
function reportsLegacy(){const y=new Date().getFullYear(),months=Array.from({length:12},(_,m)=>{const pre=mk(y,m),income=Store.fees.filter(f=>(f.date||"").startsWith(pre)).reduce((a,f)=>a+(+f.paid||0),0)+Store.txns.filter(t=>t.type==="in"&&(t.date||"").startsWith(pre)).reduce((a,t)=>a+(+t.amt||0),0),expense=Store.txns.filter(t=>t.type==="out"&&(t.date||"").startsWith(pre)).reduce((a,t)=>a+(+t.amt||0),0);return [MN[m],income,expense,income-expense]});const cls=classes().map(c=>{const ss=Store.students.filter(s=>s.cls==c),vals=ss.map(s=>pctOf([s.id],String(y)+"-" )).filter(v=>v!=null);return [c,ss.length,vals.length?Math.round(vals.reduce((a,b)=>a+b,0)/vals.length*10)/10:0]});const fees=[...Store.students].map(s=>[s.name,s.cls,Store.fees.filter(f=>f.sid==s.id).reduce((a,f)=>a+Math.max(0,(+f.amt||0)-Math.max(0,+f.paid||0)),0)]).filter(x=>x[2]>0).sort((a,b)=>b[2]-a[2]);return phdr("রিপোর্ট ও বিশ্লেষণ","মাসিক আয়-ব্যয়, বেতন/ফি, উপস্থিতি ও ফলাফল")+`<div class="card"><div class="ch"><h2>মাসিক আয়-ব্যয় — ${bn(y)}</h2><button class="ob" onclick="reportsPdf()">PDF</button></div><div class="ov"><table class="tb"><tr><th>মাস</th><th>আয়</th><th>ব্যয়</th><th>ব্যালেন্স</th></tr>${months.map(r=>`<tr><td>${r[0]}</td><td>${money(r[1])}</td><td>${money(r[2])}</td><td>${money(r[3])}</td></tr>`).join("")}</table></div></div><div class="card"><h2>শ্রেণিভিত্তিক উপস্থিতি</h2><div class="ov"><table class="tb"><tr><th>শ্রেণি</th><th>শিক্ষার্থী</th><th>গড় উপস্থিতি</th></tr>${cls.map(r=>`<tr><td>${esc(r[0])}</td><td>${bn(r[1])}</td><td>${bn(r[2])}%</td></tr>`).join("")||`<tr><td colspan="3">তথ্য নেই</td></tr>`}</table></div></div><div class="card"><h2>শিক্ষার্থীভিত্তিক বকেয়া ফি</h2><div class="ov"><table class="tb"><tr><th>নাম</th><th>শ্রেণি</th><th>বকেয়া</th></tr>${fees.slice(0,50).map(r=>`<tr><td>${esc(r[0])}</td><td>${esc(r[1])}</td><td style="color:var(--rd)">${money(r[2])}</td></tr>`).join("")||`<tr><td colspan="3">বকেয়া নেই</td></tr>`}</table></div></div>`}
function studentFeeRows(){
 const pre=mk(reportY,reportM);
 return Store.students.map(st=>{
  const fs=Store.fees.filter(f=>f.sid===st.id&&String(f.date||"").startsWith(pre)),total=fs.reduce((n,f)=>n+(Number(f.amt)||0),0),paid=fs.reduce((n,f)=>n+(Number(f.paid)||0),0),due=Math.max(0,total-paid);
  return {id:st.id,name:st.name||"",roll:st.roll||"",cls:st.cls||"",branch:st.branch||"",count:fs.length,total,paid,due,status:due<=0?"পরিশোধিত":paid>0?"আংশিক":"বকেয়া"};
 });
}
function studentFeeCsv(){
 const c=v=>'"'+String(v??"").replace(/"/g,'""')+'"',r=studentFeeRows(),H=["শিক্ষার্থী","রোল","শ্রেণি","শাখা","ফি রেকর্ড","মোট ফি","পরিশোধিত","বকেয়া","অবস্থা"];
 shareFile(`student-fee-${reportY}-${String(reportM+1).padStart(2,"0")}.csv`,"\uFEFF"+[H.map(c).join(",")].concat(r.map(x=>[x.name,x.roll,x.cls,x.branch,x.count,x.total,x.paid,x.due,x.status].map(c).join(","))).join("\r\n"),"শিক্ষার্থীভিত্তিক ফি রিপোর্ট");
}
function studentFeeReport(){
 const r=studentFeeRows(),total=r.reduce((n,x)=>n+x.total,0),paid=r.reduce((n,x)=>n+x.paid,0),due=r.reduce((n,x)=>n+x.due,0),rows=r.map(x=>`<tr><td><b>${esc(x.name)}</b><small>${esc(x.roll)}${x.branch?" · "+esc(x.branch):""}</small></td><td>${esc(x.cls)}</td><td>${bn(x.count)}</td><td>${money(x.total)}</td><td style="color:var(--gr)">${money(x.paid)}</td><td style="color:${x.due?"var(--rd)":"var(--gr)"}">${money(x.due)}</td><td><span class="tag ${x.due?"r":"g"}">${x.status}</span></td></tr>`).join("");
 return `<div class="card"><div class="ch"><div><h2>শিক্ষার্থীভিত্তিক ফি রিপোর্ট</h2><small style="color:var(--mu)">${esc(MN[reportM])} ${bn(reportY)}</small></div><button class="ob s" onclick="studentFeeCsv()">CSV</button></div><div class="g2"><div class="st" style="background:#2563eb"><small>মোট ফি</small><div>${money(total)}</div></div><div class="st" style="background:#16a34a"><small>পরিশোধিত</small><div>${money(paid)}</div></div><div class="st" style="background:#e11d48"><small>বকেয়া</small><div>${money(due)}</div></div></div><div class="ov"><table class="tb"><tr><th>শিক্ষার্থী</th><th>শ্রেণি</th><th>রেকর্ড</th><th>মোট</th><th>পরিশোধ</th><th>বকেয়া</th><th>অবস্থা</th></tr>${rows||'<tr><td colspan="7" class="em">কোনো শিক্ষার্থী নেই</td></tr>'}</table></div></div>`;
}
function classAttendanceRows(){
 const pre=mk(reportY,reportM);
 return classes().map(cls=>{const ss=Store.students.filter(s=>s.cls===cls),c=ss.reduce((a,st)=>{const x=cnt(st.id,pre);return {p:a.p+x.p,a:a.a+x.a,l:a.l+x.l,h:a.h+x.h}}, {p:0,a:0,l:0,h:0}),days=c.p+c.a+c.l+c.h;return {cls,count:ss.length,...c,days,att:days?Math.round((c.p+c.l)/days*1000)/10:null}});
}
function classAttendanceCsv(){
 const c=v=>'"'+String(v??"").replace(/"/g,'""')+'"',r=classAttendanceRows(),H=["শ্রেণি","শিক্ষার্থী","উপস্থিত","অনুপস্থিত","বিলম্বিত","ছুটি","মোট রেকর্ড","উপস্থিতি %"];
 shareFile(`class-attendance-${reportY}-${String(reportM+1).padStart(2,"0")}.csv`,"\uFEFF"+[H.map(c).join(",")].concat(r.map(x=>[x.cls,x.count,x.p,x.a,x.l,x.h,x.days,x.att==null?"":x.att].map(c).join(","))).join("\r\n"),"শ্রেণিভিত্তিক উপস্থিতি রিপোর্ট");
}
function classAttendanceReport(){
 const r=classAttendanceRows(),all=r.reduce((a,x)=>({p:a.p+x.p,a:a.a+x.a,l:a.l+x.l,h:a.h+x.h}),{p:0,a:0,l:0,h:0}),days=all.p+all.a+all.l+all.h,avg=days?Math.round((all.p+all.l)/days*1000)/10:0,rows=r.map(x=>`<tr><td><b>${esc(x.cls)}</b></td><td>${bn(x.count)}</td><td>${bn(x.p)}</td><td>${bn(x.a)}</td><td>${bn(x.l)}</td><td>${bn(x.h)}</td><td>${x.att==null?"—":bn(x.att)+"%"}</td></tr>`).join("");
 return `<div class="card"><div class="ch"><div><h2>শ্রেণিভিত্তিক উপস্থিতি রিপোর্ট</h2><small style="color:var(--mu)">${esc(MN[reportM])} ${bn(reportY)} · সামগ্রিক উপস্থিতি ${bn(avg)}%</small></div><button class="ob s" onclick="classAttendanceCsv()">CSV</button></div><div class="ov"><table class="tb"><tr><th>শ্রেণি</th><th>শিক্ষার্থী</th><th>উপস্থিত</th><th>অনুপস্থিত</th><th>বিলম্বিত</th><th>ছুটি</th><th>উপস্থিতি %</th></tr>${rows||'<tr><td colspan="7" class="em">কোনো শ্রেণির data নেই</td></tr>'}</table></div></div>`;
}
function monthlyFinanceRows(){
 const pre=mk(reportY,reportM),feeIncome=Store.fees.filter(f=>String(f.date||"").startsWith(pre)).reduce((n,f)=>n+(Number(f.paid)||0),0),income=Store.txns.filter(t=>t.type==="in"&&String(t.date||"").startsWith(pre)).reduce((n,t)=>n+(Number(t.amt)||0),0),expenseRows=Store.txns.filter(t=>t.type==="out"&&String(t.date||"").startsWith(pre)),expense=expenseRows.reduce((n,t)=>n+(Number(t.amt)||0),0),salaryPaid=expenseRows.filter(t=>t.salaryFor||/বেতন|salary/i.test(String(t.title||""))).reduce((n,t)=>n+(Number(t.amt)||0),0),salaryBudget=Store.teachers.filter(t=>(t.status||"সক্রিয়")==="সক্রিয়").reduce((n,t)=>n+(Number(t.salary)||0),0);
 return {pre,feeIncome,income,totalIncome:feeIncome+income,expenseRows,expense,salaryPaid,salaryBudget,otherExpense:expense-salaryPaid,balance:feeIncome+income-expense,budgetBalance:feeIncome+income-salaryBudget-(expense-salaryPaid)};
}
function monthlyFinanceCsv(){
 const x=monthlyFinanceRows(),c=v=>'"'+String(v??"").replace(/"/g,'""')+'"',H=["মাস","ফি আদায়","অন্যান্য আয়","মোট আয়","মোট ব্যয়","বেতন হিসেবে চিহ্নিত ব্যয়","অন্যান্য ব্যয়","বেতন বাজেট","বাস্তব ব্যালেন্স","বেতন বাজেটের পর ব্যালেন্স"];
 shareFile(`income-expense-${reportY}-${String(reportM+1).padStart(2,"0")}.csv`,"\uFEFF"+[H.map(c).join(","),[MN[reportM]+" "+reportY,x.feeIncome,x.income,x.totalIncome,x.expense,x.salaryPaid,x.otherExpense,x.salaryBudget,x.balance,x.budgetBalance].map(c).join(",")].join("\r\n"),"মাসিক আয়-ব্যয় রিপোর্ট");
}
function teacherSalaryRows(){
 const pre=mk(reportY,reportM),salaryTxns=Store.txns.filter(t=>t.type==="out"&&String(t.date||"").startsWith(pre));
 return Store.teachers.filter(t=>(t.status||"সক্রিয়")==="সক্রিয়").map(t=>{const expected=Number(t.salary)||0,paid=salaryTxns.filter(x=>x.salaryFor===t.id).reduce((n,x)=>n+(Number(x.amt)||0),0);return {id:t.id,name:t.name||"",desig:t.desig||"",expected,paid,due:Math.max(0,expected-paid),status:paid>=expected&&expected>0?"পরিশোধিত":paid>0?"আংশিক":"বকেয়া"}});
}
function teacherSalaryCsv(){
 const c=v=>'"'+String(v??"").replace(/"/g,'""')+'"',r=teacherSalaryRows(),H=["শিক্ষক","পদবি","নির্ধারিত বেতন","পরিশোধিত","বকেয়া","অবস্থা"];
 shareFile(`teacher-salary-${reportY}-${String(reportM+1).padStart(2,"0")}.csv`,"\uFEFF"+[H.map(c).join(",")].concat(r.map(x=>[x.name,x.desig,x.expected,x.paid,x.due,x.status].map(c).join(","))).join("\r\n"),"শিক্ষক বেতন রিপোর্ট");
}
function teacherSalaryReport(){
 const r=teacherSalaryRows(),expected=r.reduce((n,x)=>n+x.expected,0),paid=r.reduce((n,x)=>n+x.paid,0),due=r.reduce((n,x)=>n+x.due,0),rows=r.map(x=>`<tr><td><b>${esc(x.name)}</b></td><td>${esc(x.desig)}</td><td>${money(x.expected)}</td><td style="color:var(--gr)">${money(x.paid)}</td><td style="color:${x.due?"var(--rd)":"var(--gr)"}">${money(x.due)}</td><td><span class="tag ${x.due?"r":"g"}">${x.status}</span></td></tr>`).join("");
 return `<div class="card"><div class="ch"><div><h2>শিক্ষক বেতন রিপোর্ট</h2><small style="color:var(--mu)">${esc(MN[reportM])} ${bn(reportY)} · ${bn(r.length)} জন সক্রিয় শিক্ষক</small></div><button class="ob s" onclick="teacherSalaryCsv()">CSV</button></div><div class="g2"><div class="st" style="background:#7c3aed"><small>নির্ধারিত বেতন</small><div>${money(expected)}</div></div><div class="st" style="background:#16a34a"><small>পরিশোধিত</small><div>${money(paid)}</div></div><div class="st" style="background:#e11d48"><small>বকেয়া</small><div>${money(due)}</div></div></div><div class="ov"><table class="tb"><tr><th>শিক্ষক</th><th>পদবি</th><th>নির্ধারিত</th><th>পরিশোধিত</th><th>বকেয়া</th><th>অবস্থা</th></tr>${rows||'<tr><td colspan="6" class="em">কোনো সক্রিয় শিক্ষক নেই</td></tr>'}</table></div><small style="display:block;color:var(--mu);margin-top:7px">পরিশোধিত বেতন নির্ভুলভাবে দেখাতে transaction-এ <code>salaryFor</code> হিসেবে শিক্ষকের ID সংরক্ষণ করুন। পুরনো সাধারণ “বেতন” expense মোট আয়-ব্যয় রিপোর্টে ধরা হবে, তবে নির্দিষ্ট শিক্ষকের টেবিলে নয়।</small></div>`;
}
function monthlyFinanceReport(){
 const x=monthlyFinanceRows();
 return `<div class="card"><div class="ch"><div><h2>মাসিক আয়-ব্যয় রিপোর্ট</h2><small style="color:var(--mu)">${esc(MN[reportM])} ${bn(reportY)}</small></div><button class="ob s" onclick="monthlyFinanceCsv()">CSV</button></div><div class="g2" style="margin:8px 0"><select onchange="reportY=+this.value;render()">${[reportY-1,reportY,reportY+1].map(y=>`<option value="${y}" ${y===reportY?"selected":""}>${bn(y)}</option>`).join("")}</select><select onchange="reportM=+this.value;render()">${MN.map((m,i)=>`<option value="${i}" ${i===reportM?"selected":""}>${m}</option>`).join("")}</select></div><div class="g2"><div class="st" style="background:#2563eb"><small>ফি আদায়</small><div>${money(x.feeIncome)}</div></div><div class="st" style="background:#16a34a"><small>অন্যান্য আয়</small><div>${money(x.income)}</div></div><div class="st" style="background:#e11d48"><small>মোট ব্যয়</small><div>${money(x.expense)}</div></div><div class="st" style="background:${x.balance>=0?"#0f766e":"#be123c"}"><small>ব্যালেন্স</small><div>${money(x.balance)}</div></div></div><div class="ov"><table class="tb"><tr><th>বিবরণ</th><th>পরিমাণ</th></tr><tr><td>মোট আয়</td><td>${money(x.totalIncome)}</td></tr><tr><td>বেতন হিসেবে চিহ্নিত ব্যয়</td><td>${money(x.salaryPaid)}</td></tr><tr><td>অন্যান্য ব্যয়</td><td>${money(x.otherExpense)}</td></tr><tr><td>সক্রিয় শিক্ষকদের মাসিক বেতন বাজেট</td><td>${money(x.salaryBudget)}</td></tr><tr><td><b>বেতন বাজেট বাদে সম্ভাব্য ব্যালেন্স</b></td><td><b>${money(x.budgetBalance)}</b></td></tr></table></div></div>`;
}
function monthlyStudentRows(){
 const pre=mk(reportY,reportM);
 return Store.students.map(st=>{
  const c=cnt(st.id,pre),days=c.p+c.a+c.l+c.h,att=days?Math.round((c.p+c.l)/days*1000)/10:null;
  const fs=Store.fees.filter(f=>f.sid===st.id&&String(f.date||"").startsWith(pre));
  const billed=fs.reduce((n,f)=>n+(Number(f.amt)||0),0),paid=fs.reduce((n,f)=>n+(Number(f.paid)||0),0),due=Math.max(0,billed-paid);
  return {id:st.id,name:st.name||"",roll:st.roll||"",cls:st.cls||"",branch:st.branch||"",p:c.p,a:c.a,l:c.l,h:c.h,days,att,billed,paid,due,status:due<=0?"পরিশোধিত":paid>0?"আংশিক":"বকেয়া"};
 });
}
function monthlyStudentCsv(){
 const c=v=>'"'+String(v??"").replace(/"/g,'""')+'"',r=monthlyStudentRows(),H=["নাম","রোল","শ্রেণি","শাখা","উপস্থিত","অনুপস্থিত","বিলম্বিত","ছুটি","মোট দিন","উপস্থিতি %","মোট ফি","পরিশোধিত","বকেয়া","ফি অবস্থা"];
 shareFile(`student-monthly-${reportY}-${String(reportM+1).padStart(2,"0")}.csv`,"\uFEFF"+[H.map(c).join(",")].concat(r.map(x=>[x.name,x.roll,x.cls,x.branch,x.p,x.a,x.l,x.h,x.days,x.att==null?"":x.att,x.billed,x.paid,x.due,x.status].map(c).join(","))).join("\r\n"),"মাসভিত্তিক শিক্ষার্থী উপস্থিতি ও ফি রিপোর্ট");
}
function monthlyStudentReport(){
 const r=monthlyStudentRows(),total=r.length,attRows=r.filter(x=>x.days),avg=attRows.length?Math.round(attRows.reduce((n,x)=>n+(x.att||0),0)/attRows.length*10)/10:0;
 const billed=r.reduce((n,x)=>n+x.billed,0),paid=r.reduce((n,x)=>n+x.paid,0),due=billed-paid,pre=mk(reportY,reportM);
 const rows=r.map(x=>`<tr><td><b>${esc(x.name)}</b><small>${esc(x.roll)}${x.branch?" · "+esc(x.branch):""}</small></td><td>${esc(x.cls)}</td><td>${x.days?`${bn(x.p)}/${bn(x.a)}/${bn(x.l)}`:"—"}</td><td>${x.att==null?"—":bn(x.att)+"%"}</td><td>${money(x.billed)}</td><td style="color:var(--gr)">${money(x.paid)}</td><td style="color:${x.due?"var(--rd)":"var(--gr)"}">${money(x.due)}</td><td><span class="tag ${x.due?"r":"g"}">${x.status}</span></td></tr>`).join("");
 return `<div class="card"><div class="ch"><div><h2>মাসভিত্তিক শিক্ষার্থী রিপোর্ট</h2><small style="color:var(--mu)">${esc(MN[reportM])} ${bn(reportY)} · উপস্থিতি: ${bn(avg)}%</small></div><div style="display:flex;gap:5px"><button class="ob s" onclick="monthlyStudentCsv()">CSV</button><button class="ob s" onclick="reportsPdf()">PDF</button></div></div><div class="g2" style="margin:8px 0"><select onchange="reportY=+this.value;render()">${[reportY-1,reportY,reportY+1].map(y=>`<option value="${y}" ${y===reportY?"selected":""}>${bn(y)}</option>`).join("")}</select><select onchange="reportM=+this.value;render()">${MN.map((m,i)=>`<option value="${i}" ${i===reportM?"selected":""}>${m}</option>`).join("")}</select></div><div class="g2"><div class="st" style="background:#2563eb"><small>শিক্ষার্থী</small><div>${bn(total)}</div></div><div class="st" style="background:#16a34a"><small>মোট ফি</small><div>${money(billed)}</div></div><div class="st" style="background:#0f766e"><small>পরিশোধিত</small><div>${money(paid)}</div></div><div class="st" style="background:#e11d48"><small>বকেয়া</small><div>${money(due)}</div></div></div><div class="ov"><table class="tb"><tr><th>শিক্ষার্থী</th><th>শ্রেণি</th><th>উপ./অনু./বিল.</th><th>%</th><th>ফি</th><th>পরিশোধ</th><th>বকেয়া</th><th>অবস্থা</th></tr>${rows||'<tr><td colspan="8" class="em">কোনো শিক্ষার্থী নেই</td></tr>'}</table></div><small style="display:block;color:var(--mu);margin-top:7px">Attendance কলামে: উপস্থিত / অনুপস্থিত / বিলম্বিত। ছুটির হিসাব টেবিলের বিস্তারিত report-এ থাকে।</small></div>`;
}
function reports(){return monthlyFinanceReport()+teacherSalaryReport()+studentFeeReport()+classAttendanceReport()+monthlyStudentReport()+reportsLegacy()}
function reportsPdf(){printDoc("reports",sch()+reports().replace(/<button[^>]*>[^<]*<\/button>/g,""))}
let saasTab="overview",saasTenants=[],saasUsers=[],saasBilling=null;
function saasBase(){return syncAuthUrl()}
async function saasFetch(path,opts={}){const t=getSyncToken();if(!t)throw Error("JWT login প্রয়োজন");const h={"Content-Type":"application/json",Authorization:"Bearer "+t};const r=await fetch(saasBase()+path,{...opts,headers:{...h,...(opts.headers||{})}});const d=await r.json().catch(()=>({}));if(!r.ok)throw Error(d.error||"Request failed");return d}
let saasFor="",saasErr="";
async function saasLoad(){if(!getSyncToken()){saasErr="";return}
 try{const [a,b,c]=await Promise.all([saasFetch("/api/super/tenants"),saasFetch("/api/super/users"),saasFetch("/api/super/billing")]);saasTenants=a.tenants||[];saasUsers=b.users||[];saasBilling=c;saasErr=""}catch(e){saasErr=e.message}
 if(tab==="more"&&sub==="sat")render()}
function saasStat(n,l,c){return `<div class="st" style="background:${c}"><small>${l}</small><div>${n}</div></div>`}
function saasDashboard(){if(!isSuper())return `<div class="card"><h2>অনুমতি নেই</h2><p>এই dashboard শুধু Super Admin-এর জন্য।</p></div>`;if(!getSyncToken())return `<div class="card"><h2>🛡️ SaaS</h2><p style="font-size:14px;line-height:1.8;color:var(--mu);margin:8px 0 12px">SaaS-এর তথ্য সার্ভার থেকে আসে। এটি দেখতে আগে <b>সিঙ্ক</b> ট্যাবে সার্ভারের API URL দিয়ে JWT login করুন। লগইন ছাড়া এই অংশ ব্যবহার করা যায় না।</p><button class="btn" style="width:100%" onclick="satT=3;render()">🔄 সিঙ্ক ট্যাবে যান</button></div>`;if(saasFor!==getSyncToken()){saasFor=getSyncToken();saasLoad()}const saasNote=saasErr?`<div class="card" style="border-color:#fca5a5"><b style="color:#dc2626">SaaS data লোড হয়নি</b><div style="font-size:13px;color:var(--mu);margin:6px 0 10px">${esc(saasErr)}</div><button class="btn o s" onclick="saasFor='';render()">আবার চেষ্টা করুন</button></div>`:"";const active=saasTenants.filter(t=>t.status==="active").length,trial=saasTenants.filter(t=>t.status==="trial").length,susp=saasTenants.filter(t=>["suspended","blocked"].includes(t.status)).length,revenue=saasBilling?.summary?.revenue||0;
 const body=saasTab==="tenants"?saasTenantPanel():saasTab==="users"?saasUserPanel():saasTab==="billing"?saasBillingPanel():`<div class="g2">${saasStat(bn(saasTenants.length),"মোট প্রতিষ্ঠান","linear-gradient(135deg,#2563eb,#3b82f6)")}${saasStat(bn(active),"Active","linear-gradient(135deg,#059669,#10b981)")}${saasStat(bn(trial),"Trial","linear-gradient(135deg,#d97706,#f59e0b)")}${saasStat(bn(susp),"Suspended","linear-gradient(135deg,#dc2626,#f43f5e)")}</div><div class="card"><div class="ch"><h2>Platform overview</h2><span class="tag g">Revenue: ${money(revenue)}</span></div><p class="hint">প্রতিষ্ঠান, user, subscription এবং tenant isolation এখান থেকে পরিচালনা করুন।</p><button class="btn" onclick="saasTab='tenants';render()">প্রতিষ্ঠান পরিচালনা করুন</button></div>`;
 return saasNote+`<div class="card" style="background:linear-gradient(135deg,#172554,#3730a3);color:#fff"><div class="ch"><div><small>SUPER ADMIN CONSOLE</small><h2 style="margin-top:4px">SaaS Control Center</h2><small>সব প্রতিষ্ঠানের platform-level control</small></div><span style="font-size:32px">🛡️</span></div></div><div class="seg">${[["overview","Overview"],["tenants","Institutions"],["users","Users & Roles"],["billing","Billing"]].map(x=>`<button class="${saasTab==x[0]?"on":""}" onclick="saasTab='${x[0]}';render()">${x[1]}</button>`).join("")}</div>${body}`}
function saasTenantPanel(){return `<div class="card"><div class="ch"><h2>প্রতিষ্ঠানসমূহ</h2><button class="btn g s" onclick="saasTenantForm()">＋ প্রতিষ্ঠান</button></div><div class="ov"><table class="tb"><tr><th>নাম</th><th>Slug</th><th>Plan</th><th>Status</th><th>Expiry</th><th></th></tr>${saasTenants.map(t=>`<tr><td><b>${esc(t.name)}</b></td><td>${esc(t.slug)}</td><td>${esc(t.plan)}</td><td><span class="pl ${t.status==="active"?"g":t.status==="suspended"?"r":"b"}">${esc(t.status)}</span></td><td>${esc((t.currentPeriodEnd||t.trialEndsAt||"—").slice(0,10))}</td><td><button class="ob s" onclick="saasTenantEdit('${t.id}')">Edit</button> <button class="ob s" onclick="saasPaymentForm('${t.id}')">Stripe</button> <button class="ob s" onclick="saasBkashForm('${t.id}')">bKash</button> <button class="ob g s" onclick="saasManualPaymentForm('${t.id}')">Manual</button></td></tr>`).join("")||'<tr><td colspan="6" class="em">কোনো প্রতিষ্ঠান নেই</td></tr>'}</table></div></div>`}
function saasTenantForm(){modal(HND+`<h2>নতুন প্রতিষ্ঠান</h2><input id="stName" placeholder="প্রতিষ্ঠানের নাম"><input id="stSlug" placeholder="slug যেমন alpha-school"><input id="stPlan" placeholder="plan যেমন trial/monthly"><input id="stTrial" type="number" value="14" placeholder="Trial days"><div class="bt"><button class="btn o" onclick="closeM()">বাতিল</button><button class="btn" onclick="saasTenantCreate()">তৈরি করুন</button></div>`)}
async function saasTenantCreate(){try{await saasFetch("/api/super/tenants",{method:"POST",body:JSON.stringify({name:$("stName").value,slug:$("stSlug").value,plan:$("stPlan").value||"trial",trialDays:+$("stTrial").value||14})});closeM();await saasLoad()}catch(e){alert(e.message)}}
function saasTenantEdit(id){const t=saasTenants.find(x=>x.id===id);if(!t)return;modal(HND+`<h2>প্রতিষ্ঠান সম্পাদনা</h2><b>${esc(t.name)}</b><select id="steStatus"><option>active</option><option>trial</option><option>suspended</option><option>blocked</option></select><select id="stePlan"><option>trial</option><option>monthly</option><option>yearly</option></select><input id="steEnd" type="date" value="${esc((t.currentPeriodEnd||t.trialEndsAt||"").slice(0,10))}"><div class="bt"><button class="btn o" onclick="closeM()">বাতিল</button><button class="btn" onclick="saasTenantUpdate('${id}')">সংরক্ষণ</button></div>`);$("steStatus").value=t.status;$("stePlan").value=t.plan}
async function saasTenantUpdate(id){try{await saasFetch("/api/super/tenants/"+id,{method:"PATCH",body:JSON.stringify({status:$("steStatus").value,plan:$("stePlan").value,currentPeriodEnd:$("steEnd").value?new Date($("steEnd").value).toISOString():null})});closeM();await saasLoad()}catch(e){alert(e.message)}}
function saasUserPanel(){return `<div class="card"><div class="ch"><h2>Users & roles</h2><button class="btn g s" onclick="saasUserForm()">＋ User</button></div><div class="ov"><table class="tb"><tr><th>Identifier</th><th>Role</th><th>Institution</th><th>Permissions</th><th>Status</th><th></th></tr>${saasUsers.map(u=>`<tr><td>${esc(u.identifier)}</td><td>${esc(u.role)}</td><td>${esc((u.tenantIds||[]).map(id=>saasTenants.find(t=>t.id===id)?.slug||id).join(", ")||"Platform")}</td><td>${esc((u.permissions||[]).join(", ")||"—")}</td><td><span class="pl ${u.active===false?"r":"g"}">${u.active===false?"Blocked":"Active"}</span></td><td><button class="ob s" onclick="saasUserEdit('${u.id}')">Edit</button></td></tr>`).join("")||'<tr><td colspan="6" class="em">কোনো user নেই</td></tr>'}</table></div></div>`}
function saasUserForm(){modal(HND+`<h2>নতুন user</h2><input id="suId" type="email" placeholder="user@example.com"><input id="suPw" type="password" placeholder="কমপক্ষে ৮ অক্ষরের password"><select id="suRole">${["admin","sub_admin","accountant","teacher","guardian"].map(x=>`<option>${x}</option>`).join("")}</select><select id="suTenant"><option value="">Tenant নির্বাচন করুন</option>${saasTenants.map(t=>`<option value="${t.id}">${esc(t.name)}</option>`).join("")}</select><label class="lb">Permissions comma-separated</label><input id="suPerm" placeholder="students,attendance,reports"><div class="bt"><button class="btn o" onclick="closeM()">বাতিল</button><button class="btn" onclick="saasUserCreate()">তৈরি করুন</button></div>`)}
async function saasUserCreate(){try{await saasFetch("/api/super/users",{method:"POST",body:JSON.stringify({identifier:$("suId").value,password:$("suPw").value,role:$("suRole").value,tenantId:$("suTenant").value,permissions:$("suPerm").value.split(",").map(x=>x.trim()).filter(Boolean)})});closeM();await saasLoad()}catch(e){alert(e.message)}}
function saasUserEdit(id){const u=saasUsers.find(x=>x.id===id);if(!u)return;modal(HND+`<h2>User control</h2><b>${esc(u.identifier)}</b><select id="sueRole">${["admin","sub_admin","accountant","teacher","guardian"].map(x=>`<option>${x}</option>`).join("")}</select><label class="lb">Permissions comma-separated</label><input id="suePerm" value="${esc((u.permissions||[]).join(","))}"><label style="display:flex;gap:8px;align-items:center"><input id="sueActive" type="checkbox"> Active</label><div class="bt"><button class="btn o" onclick="closeM()">বাতিল</button><button class="btn" onclick="saasUserUpdate('${id}')">সংরক্ষণ</button></div>`);$("sueRole").value=u.role;$("sueActive").checked=u.active!==false}
async function saasUserUpdate(id){try{await saasFetch("/api/super/users/"+id,{method:"PATCH",body:JSON.stringify({role:$("sueRole").value,active:$("sueActive").checked,permissions:$("suePerm").value.split(",").map(x=>x.trim()).filter(Boolean)})});closeM();await saasLoad()}catch(e){alert(e.message)}}
function saasPaymentForm(tenantId){const t=saasTenants.find(x=>x.id===tenantId);if(!t)return;modal(HND+`<h2>Payment — ${esc(t.name)}</h2><p class="hint">Stripe Checkout-এ redirect হবে। Price ID সেট না থাকলে manual amount থেকে recurring price তৈরি হবে।</p><select id="spPlan"><option value="monthly">মাসিক</option><option value="yearly">বার্ষিক</option></select><input id="spAmount" type="number" min="1" step="0.01" placeholder="Amount (যেমন 1500)"><input id="spCurrency" value="usd" placeholder="Currency যেমন usd বা bdt"><div class="bt"><button class="btn o" onclick="closeM()">বাতিল</button><button class="btn" onclick="saasStripeCheckout('${tenantId}')">Stripe Checkout খুলুন</button></div>`)}
function saasBkashForm(tenantId){const t=saasTenants.find(x=>x.id===tenantId);if(!t)return;modal(HND+`<h2>bKash Tokenized Checkout — ${esc(t.name)}</h2><p class="hint">bKash app/page-এ payment complete করুন। Callback ও server-side query-এর পর tenant active হবে।</p><select id="bpPlan"><option value="monthly">মাসিক</option><option value="yearly">বার্ষিক</option></select><input id="bpAmount" type="number" min="1" step="0.01" placeholder="Amount (BDT)"><input id="bpPayer" placeholder="Payer reference / mobile number"><input id="bpInvoice" placeholder="Merchant invoice number"><div class="bt"><button class="btn o" onclick="closeM()">বাতিল</button><button class="btn" onclick="saasBkashCheckout('${tenantId}')">bKash Checkout খুলুন</button></div>`)}
async function saasBkashCheckout(tenantId){try{const plan=$("bpPlan").value,amount=+$('bpAmount').value,payerReference=$('bpPayer').value.trim(),merchantInvoiceNumber=$('bpInvoice').value.trim()||`INV-${Date.now()}`,d=await saasFetch("/api/payments/bkash/create",{method:"POST",headers:{"x-tenant-id":tenantId},body:JSON.stringify({plan,amount,payerReference,merchantInvoiceNumber})});if(d.bkashURL)location.href=d.bkashURL;else alert("bKash payment URL পাওয়া যায়নি")}catch(e){alert("bKash checkout তৈরি হয়নি: "+e.message)}}
async function saasStripeCheckout(tenantId){try{const plan=$("spPlan").value,amount=$("spAmount").value,currency=$("spCurrency").value.trim().toLowerCase(),d=await saasFetch("/api/payments/stripe/checkout",{method:"POST",headers:{"x-tenant-id":tenantId},body:JSON.stringify({plan,amount:+amount,currency})});if(d.url)location.href=d.url}catch(e){alert("Stripe checkout তৈরি হয়নি: "+e.message)}}
function saasManualPaymentForm(tenantId){const t=saasTenants.find(x=>x.id===tenantId);if(!t)return;modal(HND+`<h2>Manual / bKash payment — ${esc(t.name)}</h2><p class="hint">Bank, bKash, নগদ বা offline payment-এর reference manually লিখুন।</p><select id="mpPlan"><option value="monthly">মাসিক</option><option value="yearly">বার্ষিক</option></select><input id="mpAmount" type="number" min="1" step="0.01" placeholder="Amount"><input id="mpCurrency" value="BDT" placeholder="Currency"><input id="mpRef" placeholder="Payment reference / invoice number"><input id="mpNumber" placeholder="bKash/Nagad transaction number (ঐচ্ছিক)"><textarea id="mpNotes" rows="3" placeholder="Notes"></textarea><div class="bt"><button class="btn o" onclick="closeM()">বাতিল</button><button class="btn" onclick="saasManualPayment('${tenantId}')">Payment confirm করুন</button></div>`)}
async function saasManualPayment(tenantId){try{await saasFetch("/api/super/tenants/"+tenantId+"/manual-payment",{method:"POST",body:JSON.stringify({plan:$("mpPlan").value,months:$("mpPlan").value==="yearly"?12:1,amount:+$("mpAmount").value,currency:$("mpCurrency").value,reference:$("mpRef").value,paymentNumber:$("mpNumber").value,notes:$("mpNotes").value})});closeM();await saasLoad();toast("Manual payment সংরক্ষিত হয়েছে")}catch(e){alert("Payment সংরক্ষণ হয়নি: "+e.message)}}
function saasBillingPanel(){const x=saasBilling||{summary:{},payments:[]};return `<div class="g2">${saasStat(money(x.summary.revenue||0),"Total revenue","linear-gradient(135deg,#7c3aed,#a855f7)")}${saasStat(bn(x.summary.active||0),"Active subscriptions","linear-gradient(135deg,#059669,#10b981)")}${saasStat(bn(x.summary.trial||0),"Trial tenants","linear-gradient(135deg,#d97706,#f59e0b)")}</div><div class="card"><div class="ch"><h2>Payment history</h2></div><div class="ov"><table class="tb"><tr><th>Tenant</th><th>Amount</th><th>Plan</th><th>Months</th><th>Date</th></tr>${(x.payments||[]).map(p=>`<tr><td>${esc(saasTenants.find(t=>t.id===p.tenantId)?.name||p.tenantId)}</td><td>${money(p.amount)} ${esc(p.currency||"BDT")}</td><td>${esc(p.plan)}</td><td>${bn(p.months)}</td><td>${esc((p.paidAt||"").slice(0,10))}</td></tr>`).join("")||'<tr><td colspan="5" class="em">কোনো payment নেই</td></tr>'}</table></div></div>`}
const MENU=[["sat","👑","Super Admin Tool"],["reports","📊","রিপোর্ট"],["xh","📝","পরীক্ষা ও ফলাফল"],["fh","💰","ফিন্যান্স ও হিসাব"],["cp","📘","শ্রেণী ও পাঠ্য"],["lib","📖","লাইব্রেরি"],["sms","💬","SMS (অভিভাবক)"],["teach","🎓","শিক্ষক"],["staff","🧑‍💼","কর্মকর্তা/কর্মচারী"],["notice","🔔","নোটিশ বোর্ড"],["bkp","🗄","ব্যাকআপ ও রিসাইকেল বিন"],["set","⚙️","সেটিংস"]];
function more(){
 if(isParent()&&sub&&!["cp","rt","ev","hw","bk","ha"].includes(sub))return '<div class="em">এই অংশটি আপনার জন্য অনুমোদিত নয়</div>';
 if(!sub)return `<div class="g2">${MENU.filter(m=>canMenu(m[0])).concat([["ha","❓","সাহায্য"]]).map(m=>`<div class="card" style="text-align:center;margin:0" onclick="sub='${m[0]}';render()"><div style="font-size:28px">${m[1]}</div><div style="font-size:14px;margin-top:6px">${m[2]}</div></div>`).join("")}</div>`;
 return `<button class="btn o s" style="margin-bottom:12px" onclick="${sub=="exam"&&curExam?"curExam=''":["rt","ev","hw","bk"].includes(sub)?"sub='cp'":["xr","xc","xt","xs"].includes(sub)?"sub='xh'":["ie","sl","pd","py"].includes(sub)?"sub='fh'":"sub=''"};render()">← ফিরে যান</button>`+(({sat:superTool,reports,cp:clsHub,xh:xHub,xr,xc,xt,xs,rt,ev,hw,bk,fh:fHub,ie,sl,pd:pdash,py,lib,sms,teach,staff,notice,set:setng,bkp:bkPage,ha:hAbout,hg:hGuide,hf:hFeed})[sub]||(()=>'<div class="em">পেইজ পাওয়া যায়নি</div>'))();
}
let tq="",sq="",sDept="",sStat="",sView="card";
const FD=(k,l,t,o,r,p,full)=>({k,l,t,o,r,p,full});
const DESIG_T=["প্রধান শিক্ষক","সহকারী প্রধান শিক্ষক","সিনিয়র শিক্ষক","সহকারী শিক্ষক","হাফেজ","ক্বারী","মুফতি","মাওলানা","অন্যান্য"];
const DESIG_S=["ম্যানেজার","হিসাবরক্ষক","অফিস সহকারী","দারোয়ান","পিয়ন","বাবুর্চি","ড্রাইভার","ক্লিনার","অন্যান্য"];
const DEPTS=["শিক্ষাবিষয়ক","প্রশাসনিক","আর্থিক","নিরাপত্তা","স্বাস্থ্য","সহায়ক","অন্যান্য"];
const COM=[FD("status","অবস্থা","select",["সক্রিয়","নিষ্ক্রিয়"]),FD("salary","মাসিক বেতন (৳)","number",0,0,"মাসিক বেতন")];
const PF={
 tea:{t:"শিক্ষক",L:()=>Store.teachers,fs:[FD("photo","প্রোফাইল ছবি","photo",0,0,0,1),FD("name","নাম","text",0,1,"শিক্ষকের নাম"),FD("email","ইমেইল","email",0,0,"example@school.com"),FD("desig","পদবি","select",DESIG_T,1),FD("gender","লিঙ্গ","select",["পুরুষ","মহিলা"],1),FD("phone","মোবাইল","tel",0,0,"01XXXXXXXXX"),FD("joinDate","যোগদানের তারিখ","date"),...COM,FD("sub","বিষয়","text",0,1,"বিষয়/বিভাগ",1),FD("permAddr","স্থায়ী ঠিকানা","text",0,0,"স্থায়ী ঠিকানা",1),FD("curAddr","বর্তমান ঠিকানা","text",0,0,"বর্তমান ঠিকানা",1),FD("nid","এনআইডি কার্ড নম্বর","text",0,0,"এনআইডি কার্ড নম্বর",1),FD("nidPhoto","এনআইডি কার্ডের ছবি","doc",0,0,0,1),FD("cert","সার্টিফিকেট (ঐচ্ছিক)","doc",0,0,0,1),FD("note","বিশেষ নোট","area",0,0,0,1)]},
 staff:{t:"কর্মী",L:()=>Store.staff,fs:[FD("photo","প্রোফাইল ছবি","photo",0,0,0,1),FD("name","নাম","text",0,1,"কর্মীর নাম"),FD("email","ইমেইল","email",0,0,"example@school.com"),FD("desig","পদ","select",DESIG_S,1),FD("dept","বিভাগ","select",DEPTS,1),FD("phone","মোবাইল","tel",0,0,"01XXXXXXXXX"),FD("joinDate","যোগদানের তারিখ","date"),...COM,FD("permAddr","ঠিকানা","text",0,0,"ঠিকানা",1),FD("nid","এনআইডি কার্ড নম্বর","text",0,0,"এনআইডি কার্ড নম্বর",1),FD("nidPhoto","এনআইডি কার্ডের ছবি","doc",0,0,0,1),FD("note","বিশেষ নোট","area",0,0,0,1)]}
};
let pk="tea",pd={},pEdit=null;
const stPill=t=>pill(esc(t.status||"সক্রিয়"),(t.status||"সক্রিয়")=="সক্রিয়"?"g":"r");
function pForm(k,id){if(!allow(k==="tea"?"teachers":"staff"))return;pk=k;pEdit=id||null;const o=PF[k].L().find(x=>x.id==id);pd=o?{...o}:{status:"সক্রিয়",joinDate:today()};drawP()}
function pGrab(){PF[pk].fs.forEach(f=>{if(f.t=="photo"||f.t=="doc")return;const e=$("p_"+f.k);if(e)pd[f.k]=e.value.trim()})}
function pField(f){
 const lb=`<label class="lb">${f.l}${f.r?" *":""}</label>`,fu=f.full?' style="grid-column:1/-1"':"";
 if(f.t=="select")return `<div${fu}>${lb}<select id="p_${f.k}"><option value="">নির্বাচন করুন</option>${f.o.map(v=>`<option ${pd[f.k]==v?"selected":""}>${v}</option>`).join("")}</select></div>`;
 if(f.t=="area")return `<div${fu}>${lb}<textarea id="p_${f.k}" rows="3">${esc(pd[f.k])}</textarea></div>`;
 if(f.t=="photo"||f.t=="doc")return `<div${fu}>${lb}<div class="row" style="border:0;padding:2px 0">${pd[f.k]?`<img class="av" style="width:44px;height:44px;${f.t=="doc"?"border-radius:8px":""}" src="${pd[f.k]}">`:""}<button class="btn o s" onclick="pPick('${f.k}',${f.t=="doc"})">⬆ আপলোড করুন</button>${pd[f.k]?`<span onclick="pGrab();pd.${f.k}='';drawP()" style="color:var(--rd);font-size:13px">✕ সরান</span>`:""}</div></div>`;
 return `<div${fu}>${lb}<input id="p_${f.k}" type="${f.t}" placeholder="${esc(f.p||"")}" value="${esc(pd[f.k])}"></div>`;
}
function drawP(){
 const C=PF[pk];
 modal(HND+`<h2 style="text-align:center;font-size:16px;margin-bottom:8px">${pEdit?C.t+"-এর তথ্য সম্পাদনা":"নতুন "+C.t+" যোগ করুন"}</h2><div style="display:grid;grid-template-columns:1fr 1fr;gap:0 10px">${C.fs.map(pField).join("")}</div><input id="ph" type="file" accept="image/*" style="position:absolute;left:-9999px;opacity:0;width:1px;height:1px" onchange="photoFile(this.files[0]);this.value=''"><button class="btn" style="width:100%;margin-top:6px" onclick="pSave()">${pEdit?"সংরক্ষণ করুন":"যোগ করুন"}</button><button class="btn o" style="width:100%;margin-top:8px" onclick="closeM()">বাতিল করুন</button>`);
 $("mt").onclick=null;
}
function pPick(k,doc){pGrab();photoDoc=!!doc;photoCb=u=>{pd[k]=u;drawP()};pickPhoto()}
function pSave(){
 pGrab();const C=PF[pk],miss=C.fs.filter(f=>f.r&&!pd[f.k]);
 if(miss.length){alert(miss.map(f=>f.l).join(", ")+" আবশ্যক");return}
 pd.salary=+pd.salary||0;if(pk=="staff")pd.role=pd.desig;
 const L=C.L();if(pEdit)Object.assign(L.find(x=>x.id==pEdit),pd);else L.push({id:uid(),...pd});
 logA(pEdit?"edit":"add",C.t,(pEdit?"তথ্য আপডেট: ":"নতুন যোগ: ")+pd.name);save();closeM();render();
}
function pMenu(k,id){
 const t=PF[k].L().find(x=>x.id==id),A=[["👤","প্রোফাইল দেখুন",`pProfile('${k}','${id}')`],["✏️","সম্পাদনা",`pForm('${k}','${id}')`],["💬","বার্তা পাঠান",`pMsg('${id}')`],["⬇","প্রোফাইল PDF",`pProfPdf('${k}','${id}')`]];
 modal(HND+`<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px"><b>${esc(t.name)}</b><span style="padding:4px 8px" onclick="closeM()">✕</span></div>`+A.map(a=>`<div class="mr" onclick="${a[2]}"><i>${a[0]}</i>${a[1]}</div>`).join("")+`<div class="mr rd" onclick="pDel('${k}','${id}')"><i>🗑</i>মুছে ফেলুন</div>`);
}
function pMsg(id){closeM();msgM([id],"আসসালামু আলাইকুম {নাম},\n\n")}
function pDel(k,id){if(!confirm("এই তথ্য মুছে ফেলবেন?"))return;const C=PF[k],t=C.L().find(x=>x.id==id);if(k=="tea")Store.teachers=Store.teachers.filter(x=>x.id!=id);else Store.staff=Store.staff.filter(x=>x.id!=id);logA("edit",C.t,"মুছে ফেলা হয়েছে: "+t.name);save();closeM();render()}
function pRows(k,t){const m=v=>v||"";return [["নাম",t.name],["ইমেইল",t.email],["পদ/পদবি",t.desig],k=="tea"?["লিঙ্গ",t.gender]:["বিভাগ",t.dept],["মোবাইল",t.phone],["যোগদানের তারিখ",m(t.joinDate)?bn(t.joinDate):""],["অবস্থা",t.status||"সক্রিয়"],["মাসিক বেতন",t.salary?money(t.salary):""],k=="tea"?["বিষয়",t.sub]:["",""],["স্থায়ী ঠিকানা",t.permAddr],["বর্তমান ঠিকানা",t.curAddr],["এনআইডি নম্বর",t.nid],["বিশেষ নোট",t.note]].filter(r=>r[0]&&r[1])}
function pProfile(k,id){
 closeM();const t=PF[k].L().find(x=>x.id==id),img=(l,v)=>v?`<div style="margin:8px 0"><small style="color:var(--mu)">${l}</small><img src="${v}" style="width:100%;border-radius:10px;border:1px solid var(--ln);margin-top:4px"></div>`:"";
 modal(HND+`<div style="text-align:center">${avt(t,72)}<h2 style="margin-top:8px">${esc(t.name)}</h2><small style="color:var(--mu)">${esc(t.desig||"")}</small><div style="margin:8px 0">${stPill(t)}</div></div>`+pRows(k,t).map(r=>`<div class="row" style="padding:7px 0"><div class="f"><small>${r[0]}</small>${esc(r[1])}</div></div>`).join("")+img("এনআইডি কার্ডের ছবি",t.nidPhoto)+img("সার্টিফিকেট",t.cert)
 +`<div class="g2" style="margin:10px 0 0"><button class="btn o" onclick="pMsg('${id}')">💬 বার্তা</button><button class="btn o" onclick="pProfPdf('${k}','${id}')">⬇ PDF</button><button class="btn" onclick="pForm('${k}','${id}')">✏️ সম্পাদনা</button><button class="btn o" onclick="closeM()">বন্ধ</button></div>`);
}
function pProfPdf(k,id){
 closeM();const t=PF[k].L().find(x=>x.id==id);
 printDoc("profile-"+k,`${pdfHdr()}<div style="text-align:center;color:#555;font-size:12px;margin-bottom:10px">${PF[k].t} প্রোফাইল</div><div style="display:flex;gap:14px;align-items:center;margin-bottom:10px">${t.photo?`<img src="${safeDataImage(t.photo)}" style="width:90px;height:90px;border-radius:8px;object-fit:cover">`:""}<div><b style="font-size:18px">${esc(t.name)}</b><div>${esc(t.desig||"")}</div></div></div><table>${pRows(k,t).map(r=>`<tr><td style="width:35%;background:#f3f4f6">${r[0]}</td><td>${esc(r[1])}</td></tr>`).join("")}</table>${t.nidPhoto?`<p>এনআইডি কার্ড:</p><img src="${safeDataImage(t.nidPhoto)}" style="max-width:60%">`:""}`);
}
function pList(k){const q1=(k=="tea"?tq:sq).toLowerCase();return k=="tea"?Store.teachers.filter(t=>!q1||[t.name,t.sub,t.phone,t.desig].join(" ").toLowerCase().includes(q1)):Store.staff.filter(t=>(!sDept||t.dept==sDept)&&(!sStat||(t.status||"সক্রিয়")==sStat)&&(!q1||[t.name,t.desig,t.phone,t.dept].join(" ").toLowerCase().includes(q1)))}
function pExcel(k){const l=pList(k),c=v=>'"'+String(v??"").replace(/"/g,'""')+'"',H=["নাম","পদ/পদবি",k=="tea"?"বিষয়":"বিভাগ","লিঙ্গ","মোবাইল","ইমেইল","যোগদান","বেতন","অবস্থা","ঠিকানা"];shareFile((k=="tea"?"teachers-":"staff-")+today()+".csv","\uFEFF"+[H.map(c).join(",")].concat(l.map(t=>[t.name,t.desig,k=="tea"?t.sub:t.dept,t.gender,t.phone,t.email,t.joinDate,t.salary,t.status||"সক্রিয়",t.permAddr].map(c).join(","))).join("\r\n"),(k=="tea"?"শিক্ষক":"কর্মী")+" তালিকা (Excel/CSV)")}
function pPdf(k){
 const l=pList(k),d=new Date();
 printDoc(k=="tea"?"teachers-list":"staff-list",`<style>.ptb td,.ptb th{border:1px solid #b9e6cd;font-size:12px;padding:6px 7px}.ptb th{color:#666;font-weight:500}</style>${pdfHdr()}<h2 style="text-align:center;color:#1d4ed8;margin:6px 0">${k=="tea"?"শিক্ষক ব্যবস্থাপনা":"কর্মকর্তা/কর্মচারী ব্যবস্থাপনা"}</h2><div style="text-align:center;font-size:11px;color:#555;margin-bottom:10px">${esc(Store.school.name)} · তারিখ: ${bn(p2(d.getDate())+"/"+p2(d.getMonth()+1)+"/"+d.getFullYear())} · মোট ${bn(l.length)} জন</div><table class="ptb" style="border:1px solid #1d4ed8"><tr>${["নাম","পদ/পদবি",k=="tea"?"বিষয়":"বিভাগ","মোবাইল","যোগদান","বেতন","অবস্থা"].map(h=>`<th>${h}</th>`).join("")}</tr>${l.map(t=>`<tr><td>${esc(t.name)}</td><td>${esc(t.desig||"")}</td><td>${esc(k=="tea"?t.sub:t.dept)}</td><td>${esc(t.phone||"")}</td><td>${t.joinDate?bn(t.joinDate):""}</td><td>${t.salary?money(t.salary):""}</td><td>${esc(t.status||"সক্রিয়")}</td></tr>`).join("")}</table>`);
}
function pTable(k,l){
 const hd=k=="tea"?["নাম","পদবি","বিষয়","মোবাইল","যোগদান","অবস্থা"]:["নাম","পদ","বিভাগ","মোবাইল","বেতন","অবস্থা"];
 return `<table class="tb wr"><tr>${hd.map(h=>`<th>${h}</th>`).join("")}<th></th></tr>${l.map(t=>`<tr><td onclick="pProfile('${k}','${t.id}')"><b>${esc(t.name)}</b></td><td>${esc(t.desig||"")}</td><td>${esc(k=="tea"?t.sub:t.dept)}</td><td>${esc(t.phone||"")}</td><td>${k=="tea"?(t.joinDate?bn(t.joinDate):""):(t.salary?money(t.salary):"")}</td><td>${stPill(t)}</td><td onclick="pMenu('${k}','${t.id}')" style="font-size:20px;color:var(--mu)">⋯</td></tr>`).join("")}</table>${l.length?"":'<div class="em">কেউ নেই</div>'}`;
}
function keepP(k){const e=$(k=="tea"?"tlst":"slst");if(e)e.innerHTML=k=="tea"||sView=="list"?pTable(k,pList(k)):staffCards(pList(k))}
function copyLink(){const v=Store.school.appLink||"";if(!v){alert("আগে লিংক বসান");return}try{navigator.clipboard.writeText(v);toast("লিংক কপি হয়েছে")}catch(e){const i=$("al");i.select();document.execCommand("copy");toast("লিংক কপি হয়েছে")}}
function shareApp(){const l=Store.teachers.filter(t=>t.phone);if(!Store.school.appLink){alert("আগে অ্যাপের লিংক বসান");return}msgM(l.map(t=>t.id),"আসসালামু আলাইকুম {নাম},\n\n"+Store.school.name+" অ্যাপের লিংক:\n"+Store.school.appLink)}
function teach(){
 const l=pList("tea");
 return `<h1 style="font-size:22px">শিক্ষক ব্যবস্থাপনা</h1><small style="color:var(--mu)">মোট ${bn(Store.teachers.length)} জন শিক্ষক</small>
 <div style="display:flex;gap:8px;flex-wrap:wrap;margin:12px 0"><button class="ob" onclick="pPdf('tea')">🗎 PDF</button><button class="ob" onclick="pExcel('tea')">📄 Excel</button><button class="btn" onclick="pForm('tea')">＋ নতুন শিক্ষক</button></div>
 <input placeholder="🔍 নাম, বিষয় বা মোবাইল খুঁজুন..." value="${esc(tq)}" oninput="tq=this.value;keepP('tea')">
 <div class="card ov" style="padding:6px" id="tlst">${pTable("tea",l)}</div>
 <div class="card" style="background:#e6f7ee;border-color:#b9e6cd"><b style="color:#16a34a;font-size:14px">🔗 শিক্ষকদের অ্যাপ লিংক শেয়ার করুন</b><div style="font-size:12px;color:#16a34a;margin:4px 0 8px">শিক্ষক-শিক্ষিকাদের পাঠান — এই লিংক থেকে তারা অ্যাপ ডাউনলোড করতে পারবেন।</div>
 <div style="display:flex;align-items:center;gap:8px;background:var(--card);border:1px solid var(--ln);border-radius:10px;padding:2px 10px"><input id="al" placeholder="অ্যাপের ডাউনলোড লিংক বসান" value="${esc(Store.school.appLink||"")}" oninput="Store.school.appLink=this.value.trim();save()" style="margin:0;border:0;flex:1;padding:10px 0"><span onclick="copyLink()" style="font-size:18px">📋</span></div>
 <div class="g2" style="margin:8px 0 0"><button class="btn g" onclick="shareApp()">WhatsApp</button><button class="btn" onclick="shareApp()">SMS</button></div></div>
 <details class="card" style="background:#e6f7ee;border-color:#b9e6cd"><summary style="font-size:14px;color:#16a34a">📘 শিক্ষক-ব্যবহার নির্দেশিকা <span class="pl b">নতুন</span></summary><div style="font-size:13px;line-height:1.7;margin-top:8px">১. "নতুন শিক্ষক" চেপে শিক্ষকের তথ্য, ছবি ও বেতন যোগ করুন।<br>২. নামের পাশে ⋯ চেপে প্রোফাইল, সম্পাদনা, বার্তা ও PDF পাবেন।<br>৩. উপস্থিতি পেইজের "শিক্ষক" ট্যাবে প্রতিদিনের হাজিরা নিন।<br>৪. ইন্টারনেট থাকলে PDF বাটনে চাপলেই PDF ফাইল ফোনে সেভ হবে।<br>৫. ফোন বদলানোর আগে সেটিংস থেকে ব্যাকআপ নিন।</div></details>`;
}
function staffCards(l){
 const DC={"শিক্ষাবিষয়ক":"b","প্রশাসনিক":"b","আর্থিক":"g","নিরাপত্তা":"r","স্বাস্থ্য":"g","সহায়ক":"b","অন্যান্য":""};
 return l.map(t=>`<div class="card" style="background:#eef3ff;margin-bottom:10px"><div class="ch" style="margin:0"><div style="display:flex;align-items:center;gap:8px">${avt(t,32)}<b>${esc(t.name)}</b></div><span onclick="pMenu('staff','${t.id}')" style="font-size:22px;color:var(--mu);padding:0 6px">⋯</span></div>
 <div style="font-size:13px;line-height:1.8;margin-top:6px"><span class="pl b">${esc(t.desig||"")}</span><br>📞 ${esc(t.phone||"—")}<br><small style="color:var(--mu)">বেতন ${money(t.salary||0)}</small></div>
 <div style="display:flex;justify-content:space-between;margin-top:6px">${stPill(t)}<span class="pl ${DC[t.dept]||""}">${esc(t.dept||"")}</span></div></div>`).join("")||'<div class="em">কোনো কর্মী নেই</div>';
}
function staff(){
 const l=pList("staff"),act=Store.staff.filter(t=>(t.status||"সক্রিয়")=="সক্রিয়").length,sal=Store.staff.reduce((a,t)=>a+(+t.salary||0),0);
 const sc=(n,lb,bg,c)=>`<div style="background:${bg};border-radius:14px;padding:14px;text-align:center"><b style="font-size:24px;color:${c}">${n}</b><div style="font-size:12px;color:${c}">${lb}</div></div>`;
 return `<h1 style="font-size:20px">কর্মকর্তা/কর্মচারী</h1><small style="color:var(--mu)">সকল কর্মীর তথ্য ও বেতন পরিচালনা করুন</small>
 <div style="display:flex;gap:8px;flex-wrap:wrap;margin:12px 0"><button class="ob" onclick="pPdf('staff')">🗎 PDF</button><button class="ob" onclick="pExcel('staff')">📄 Excel</button><button class="btn" onclick="pForm('staff')">＋ নতুন কর্মী</button></div>
 <div class="g2">${sc(bn(Store.staff.length),"মোট কর্মী","#dbeafe","#2563eb")}${sc(bn(act),"সক্রিয়","#d1fae5","#059669")}${sc(bn(Store.staff.length-act),"নিষ্ক্রিয়","#f3e8ff","#7c3aed")}${sc(money(sal),"মাসিক মোট বেতন","#ede9fe","#6d28d9")}</div>
 <div class="card"><input placeholder="🔍 কর্মীর নাম অনুসন্ধান..." value="${esc(sq)}" oninput="sq=this.value;keepP('staff')"><select onchange="sDept=this.value;render()"><option value="">বিভাগ (সব)</option>${DEPTS.map(d=>`<option ${sDept==d?"selected":""}>${d}</option>`).join("")}</select><select onchange="sStat=this.value;render()"><option value="">অবস্থা (সব)</option>${["সক্রিয়","নিষ্ক্রিয়"].map(d=>`<option ${sStat==d?"selected":""}>${d}</option>`).join("")}</select><button class="btn o" style="width:100%" onclick="sq='';sDept='';sStat='';render()">রিসেট</button></div>
 <div class="seg" style="width:60%">${[["card","কার্ড"],["list","তালিকা"]].map(v=>`<button class="${sView==v[0]?"on":""}" onclick="sView='${v[0]}';render()">${v[1]}</button>`).join("")}</div>
 <div id="slst" ${sView=="list"?'class="card ov" style="padding:6px"':""}>${sView=="list"?pTable("staff",l):staffCards(l)}</div>`;
}
const NT_TY=["সাধারণ","পরীক্ষা","ছুটি","অনুষ্ঠান","জরুরি"],NT_AU=["সকল","শিক্ষার্থী","শিক্ষক","অভিভাবক"];
const NT_C={"সাধারণ":"background:var(--ln);color:var(--mu)","পরীক্ষা":"background:#f3e8ff;color:#7e22ce","ছুটি":"background:#dcfce7;color:#15803d","অনুষ্ঠান":"background:#fef3c7;color:#b45309","জরুরি":"background:#ffe4e9;color:#be123c"};
let nMenu="",nBoard=false,nsM=null;
const nDt=d=>d?d.slice(8,10)+"/"+d.slice(5,7)+"/"+d.slice(0,4):"";
const nText=n=>n.title+(n.body?"\n"+n.body:"")+"\n- "+Store.school.name;
function nRecip(a){const st=Store.students.filter(x=>x.status!="নিষ্ক্রিয়"&&x.phone),te=Store.teachers.filter(x=>x.phone);return(a=="শিক্ষক"?te:a=="সকল"?st.concat(te):st).map(x=>x.id)}
document.addEventListener("click",e=>{if(nMenu&&!(e.target.closest&&e.target.closest(".nt-mn,.nmb"))){nMenu="";if(tab=="more"&&sub=="notice")render()}});
function notice(){
 if(nBoard)return nBoardH();
 const L=Store.notices.slice().sort((a,b)=>(b.date||"")>(a.date||"")?1:-1);
 return `<div style="font-size:22px;font-weight:700">নোটিশ বোর্ড</div><div style="color:var(--mu);font-size:13px">ঘোষণা ও বিজ্ঞপ্তি ব্যবস্থাপনা</div>
<div style="display:flex;gap:8px;margin:12px 0;overflow-x:auto;padding-bottom:2px"><button class="btn nt-b nt-g" onclick="nBoard=true;render()">↗ নোটিশবোর্ড</button><button class="btn nt-b nt-g" onclick="nSms()">➤ SMS পাঠান</button><button class="btn nt-b" onclick="nForm()">＋ নতুন নোটিশ</button></div>
${L.length?L.map(nCard).join(""):`<div class="lx-e" style="padding:40px 10px"><div style="font-size:30px;background:var(--bg);width:56px;height:56px;border-radius:14px;margin:0 auto 10px;line-height:56px">🔔</div><b style="color:var(--tx)">কোনো নোটিশ নেই</b><br><small>নতুন নোটিশ তৈরি করুন</small></div>`}<button class="npf" onclick="nPrint()">🖨</button>`}
function nCard(n){const a=n.aud||"সকল",ty=n.ty||"সাধারণ",ids=nRecip(a),op=nMenu==n.id;
 return `<div class="card" style="position:relative"><div style="display:flex;justify-content:space-between;gap:8px;align-items:flex-start"><div style="min-width:0"><b style="font-size:16px">${esc(n.title)}</b> <span class="pl" style="${NT_C[ty]}">${ty}</span><span class="pl" style="border:1px solid var(--ln);background:var(--card);color:var(--tx)">${a}</span></div><button class="nmb" style="border:0;background:none;color:var(--mu);font-size:20px;padding:0 6px" onclick="nMenu=nMenu=='${n.id}'?'':'${n.id}';render()">⋯</button></div>
${n.body?`<div style="color:var(--mu);font-size:13px;margin:6px 0;white-space:pre-wrap">${esc(n.body)}</div>`:""}<div style="color:var(--mu);font-size:12px;margin-top:6px">📅 ${nDt(n.date)}</div>
<div style="display:flex;gap:8px;margin-top:10px"><button class="nt-wa" onclick="nSend('${n.id}')">👥 WhatsApp (${bn(ids.length)})</button><button class="nt-sm" onclick="nSend('${n.id}')">💬 SMS (${bn(ids.length)})</button></div>
${op?`<div class="nt-mn"><div onclick="nMenu='';nForm('${n.id}')">✏️ সম্পাদনা</div>${ids.slice(0,3).map(i=>{const x=pOf(i);return `<div style="color:#16a34a" onclick="nMenu='';nOne('${n.id}','${i}')">💬 ${esc(x.guardian||x.name)} কে পাঠান</div>`}).join("")}<div style="color:#dc2626" onclick="nDel('${n.id}')">🗑 মুছে ফেলুন</div></div>`:""}</div>`}
function nBoardH(){
 const L=Store.notices.slice().sort((a,b)=>(b.date||"")>(a.date||"")?1:-1);
 return `<button class="btn o s" style="margin-bottom:12px" onclick="nBoard=false;render()">← নোটিশ ম্যানেজমেন্টে ফিরুন</button><div style="text-align:center;margin:8px 0 16px"><div style="width:64px;height:64px;border-radius:16px;background:var(--pri);color:#fff;font-size:30px;line-height:64px;margin:0 auto 10px">🔔</div><div style="font-size:26px;font-weight:700">নোটিশ বোর্ড</div><div style="color:var(--mu);font-size:13px;margin-bottom:12px">${esc(Store.school.name)}</div><button class="btn" onclick="nPrint()">⬇ PDF ডাউনলোড</button></div>`+(L.map(n=>{const ty=n.ty||"সাধারণ",u=ty=="জরুরি";return `<div class="card" style="border-left:4px solid ${u?"#dc2626":"var(--pri)"}"><div style="font-weight:700">${u?"🚨 ":""}${esc(n.title)}</div><div style="margin:6px 0"><span class="pl" style="${NT_C[ty]}">${ty}</span></div>${n.body?`<div style="color:var(--mu);font-size:13px;white-space:pre-wrap">${esc(n.body)}</div>`:""}<div style="color:var(--mu);font-size:12px;margin-top:6px">📅 ${nDt(n.date)}</div></div>`}).join("")||'<div class="em">কোনো নোটিশ নেই</div>')}
function nPrint(){const L=Store.notices.slice().sort((a,b)=>(b.date||"")>(a.date||"")?1:-1);if(!L.length){alert("প্রিন্ট করার মতো কোনো নোটিশ নেই");return}
 printDoc("notice-board",`<div style="padding:24px;font-family:sans-serif">${pdfHdr()}<h2 style="text-align:center;margin:4px 0 18px">নোটিশ বোর্ড</h2>${L.map(n=>`<div style="border-left:4px solid ${n.ty=="জরুরি"?"#dc2626":"#2563eb"};padding:8px 12px;margin-bottom:12px"><b>${esc(n.title)}</b> <small>[${n.ty||"সাধারণ"} · ${n.aud||"সকল"}]</small>${n.body?`<div style="margin:4px 0;white-space:pre-wrap">${esc(n.body)}</div>`:""}<small>📅 ${nDt(n.date)}</small></div>`).join("")}</div>`)}
function nForm(id){if(!allow("notices"))return;const n=id?Store.notices.find(x=>x.id==id):{};
 modal(`<span onclick="closeM()" style="float:right;font-size:22px">×</span><h2 style="text-align:center;margin-bottom:10px">${id?"নোটিশ সম্পাদনা":"নতুন নোটিশ"}</h2>${stF("শিরোনাম *","nt_t",n.title||"")}<label class="lb">বিস্তারিত *</label><textarea id="nt_b" rows="4">${esc(n.body||"")}</textarea><div class="g2" style="margin:0"><div><label class="lb">ধরন *</label><select id="nt_y"><option value="" disabled ${n.ty?"":"selected"}>নির্বাচন</option>${NT_TY.map(x=>`<option ${n.ty==x?"selected":""}>${x}</option>`).join("")}</select></div><div><label class="lb">প্রাপক</label><select id="nt_a">${NT_AU.map(x=>`<option ${(n.aud||"সকল")==x?"selected":""}>${x}</option>`).join("")}</select></div></div><label class="lb">প্রকাশের তারিখ</label><input id="nt_d" type="date" value="${n.date||today()}"><div style="display:flex;gap:8px;justify-content:flex-end;margin-top:6px"><button class="btn o" style="color:var(--tx);border-color:var(--ln)" onclick="closeM()">বাতিল</button><button class="btn" onclick="nSave('${id||""}')">সংরক্ষণ</button></div>`)}
function nSave(id){const t=$("nt_t").value.trim(),b=$("nt_b").value.trim(),y=$("nt_y").value;if(!t||!b||!y){alert("শিরোনাম, বিস্তারিত ও ধরন দিন");return}
 const o={title:t,body:b,ty:y,aud:$("nt_a").value,date:$("nt_d").value||today()};
 if(id)Object.assign(Store.notices.find(x=>x.id==id),o);else Store.notices.push({id:uid(),...o});logA(id?"edit":"add","নোটিশ",(id?"নোটিশ আপডেট: ":"নতুন নোটিশ: ")+t);save();closeM();render()}
function nDel(id){nMenu="";if(confirm("নোটিশটি মুছে ফেলবেন?")){Store.notices=Store.notices.filter(x=>x.id!=id);save()}render()}
function nSend(id){const n=Store.notices.find(x=>x.id==id);if(n)nsOpen(nRecip(n.aud||"সকল"),nText(n))}
function nSms(){nsOpen(nRecip("সকল"),"")}
function nOne(nid,pid){const n=Store.notices.find(x=>x.id==nid);if(n)smSend([pid],nText(n),"নোটিশ")}
function nsOpen(ids,txt){if(!ids.length){alert("মোবাইল নম্বরসহ কোনো অভিভাবক/শিক্ষক নেই");return}nsM={ids,sel:Object.fromEntries(ids.map(i=>[i,1])),txt,done:{}};nsDraw()}
function nsDraw(){const l=nsM.ids.map(pOf).filter(Boolean),n=Object.keys(nsM.sel).length;
 modal(`<span onclick="closeM()" style="float:right;font-size:22px">×</span><h2 style="text-align:center;font-size:16px;margin-bottom:10px">অভিভাবকদের SMS / WhatsApp পাঠান</h2><label class="lb">বার্তা *</label><textarea rows="4" placeholder="বার্তা..." oninput="nsM.txt=this.value">${esc(nsM.txt)}</textarea>
<div style="display:flex;justify-content:space-between;align-items:center;margin:8px 0"><b style="font-size:13px">অভিভাবক নির্বাচন (${bn(n)}/${bn(l.length)})</b><span style="font-size:13px;color:var(--pri)" onclick="nsAll(${n==l.length?0:1})">${n==l.length?"সব বাতিল":"সব নির্বাচন"}</span></div>
<div class="card" style="padding:4px;max-height:34vh;overflow:auto">${l.map(x=>`<div class="row" onclick="nsTog('${x.id}')"><div class="nt-ck ${nsM.sel[x.id]?"on":""}">${nsM.sel[x.id]?"✓":""}</div><div class="f"><b style="font-weight:600">${esc(x.guardian||x.name)}</b><small>${esc(x.phone)}${x.guardian?" — "+esc(x.name):""}${nsM.done[x.id]?" ✓ পাঠানো":""}</small></div></div>`).join("")}</div>
<div style="display:flex;gap:8px;justify-content:flex-end;margin-top:10px"><button class="btn o" style="color:var(--tx);border-color:var(--ln)" onclick="closeM()">বাতিল</button><button class="btn o" style="color:#16a34a;border-color:#86efac" onclick="nsWA()">💬 WhatsApp</button><button class="btn" onclick="nsSMS()">➤ SMS পাঠান</button></div><p style="font-size:11px;color:var(--mu);text-align:center;margin-top:8px">WhatsApp চাপলে একে একে পরের জনের চ্যাট খুলবে। {নাম} লিখলে WhatsApp-এ প্রত্যেকের নাম বসবে। SMS একসাথে ফোনের মেসেজ অ্যাপে খুলবে।</p>`);$("mt").onclick=null}
function nsTog(id){if(nsM.sel[id])delete nsM.sel[id];else nsM.sel[id]=1;nsDraw()}
function nsAll(on){nsM.sel=on?Object.fromEntries(nsM.ids.map(i=>[i,1])):{};nsDraw()}
function nsWA(){if(!nsM.txt.trim()){alert("বার্তা লিখুন");return}const id=nsM.ids.find(i=>nsM.sel[i]&&!nsM.done[i]);if(!id){alert("নির্বাচিত সবাইকে পাঠানো হয়েছে");return}nsM.done[id]=1;const x=pOf(id);sendTo(x,"wa",fillT(nsM.txt,x),"নোটিশ");setTimeout(nsDraw,400)}
function nsSMS(){const t=nsM.txt.replace(/\{[^}]+\}/g,"").trim();if(!t){alert("বার্তা লিখুন");return}const xs=nsM.ids.filter(i=>nsM.sel[i]).map(pOf).filter(Boolean);if(!xs.length){alert("কাউকে নির্বাচন করা হয়নি");return}
 xs.forEach(x=>Store.smslog.unshift({t:Date.now(),sid:x.id,ch:"sms",tx:smsTx(t),ty:"নোটিশ"}));Store.smslog=Store.smslog.slice(0,SMS_KEEP);save();location.href="sms:"+xs.map(x=>x.phone).join(",")+"?body="+encodeURIComponent(t)}
const APP_VER="v2.5.0",DEV_MAIL="tofsirahmedparvez@gmail.com",DEV_PH="01918427848",GH_URL="https://github.com/smarteduoffline/Offline-Education-Management",APP_URL="https://smarteduoffline.github.io/Offline-Education-Management/";
const HTABS=[["ha","এপ সম্পর্কে"],["hg","ইউজার গাইডলাইন"],["hf","ফিডব্যাক"]];
const GCATS=["পরিচিতি","ড্যাশবোর্ড","শিক্ষার্থী","উপস্থিতি","ফি","ফাইন্যান্স","পরীক্ষা","লাইব্রেরি","মাদ্রাসা","অন্যান্য"];
const FBT=["মতামত","সমস্যা/বাগ","পরামর্শ","অন্যান্য"];
let guQ="",guC="",guPlay="",fbFiles=[];
const hTabs=()=>`<div class="st-tabs" style="margin-bottom:12px">${HTABS.map(t=>`<button class="${sub==t[0]?"on":""}" onclick="sub='${t[0]}';render()">${t[1]}</button>`).join("")}</div>`;
function helpLogin(){
 const nm=Store.school&&Store.school.name?Store.school.name:"—";
 return `<div class="card" style="margin-top:14px"><h2>👤 বর্তমান লগইন</h2><div style="margin:10px 0;font-size:14px;line-height:2"><div>📧 <b>${esc(activeUser?.identifier||"")}</b></div><div>🏛 প্রতিষ্ঠান: <b>${esc(nm)}</b></div><div>🎖 পদ/ভূমিকা: <b>${esc(myRoleText())}</b></div></div><button class="btn r" style="width:100%" onclick="logout()">🚪 লগআউট</button></div>`}
function hAbout(){
  const ft=[["👥","শিক্ষার্থী ব্যবস্থাপনা","সম্পূর্ণ ছাত্র-ছাত্রী রেকর্ড এবং তথ্য সংরক্ষণ"],["📊","ফলাফল ব্যবস্থাপনা","পরীক্ষার নম্বর এবং গ্রেড ট্র্যাকিং"],["⚡","স্বয়ংক্রিয় অ্যালার্ট","বাবা-মায়েদের জন্য স্বয়ংক্রিয় বিজ্ঞপ্তি ও SMS"],["💰","আর্থিক ব্যবস্থাপনা","বেতন, আয়-ব্যয় এবং পেমেন্ট ট্র্যাকিং"],["✅","উপস্থিতি ট্র্যাকিং","শিক্ষার্থী এবং শিক্ষক উপস্থিতি রেকর্ড"],["🤍","ব্যবহারকারী-বান্ধব","সহজ এবং আকর্ষণীয় ইন্টারফেস"]];
 return hTabs()+`<div style="font-size:20px;font-weight:700">শিক্ষা ব্যবস্থাপনা সমাধান</div><div style="color:var(--mu);font-size:13px;margin-bottom:12px">আধুনিক, নির্ভরযোগ্য এবং সম্পূর্ণ স্কুল ম্যানেজমেন্ট সিস্টেম</div>
<div style="font-weight:700;margin:14px 0 8px">প্রধান বৈশিষ্ট্য</div>${ft.map(x=>`<div class="hp-f"><i>${x[0]}</i><div><b>${x[1]}</b><small>${x[2]}</small></div></div>`).join("")}
<div class="card" style="margin-top:14px"><h2>এপটি সম্পর্কে</h2><p style="font-size:14px;line-height:1.8;color:var(--mu)">এই এপ্লিকেশনটি <b style="color:var(--tx)">আধুনিক শিক্ষা প্রতিষ্ঠানগুলির জন্য</b> একটি সম্পূর্ণ ডিজিটাল সমাধান প্রদান করে। শিক্ষক, প্রশাসক এবং অভিভাবকদের জন্য এটি একটি কেন্দ্রীভূত প্ল্যাটফর্ম।</p><p style="font-size:14px;line-height:1.8;color:var(--mu)">আমরা বিশ্বাস করি যে প্রযুক্তি শিক্ষাকে আরও সহজ, কার্যকর এবং স্বচ্ছ করতে পারে। এই লক্ষ্যে আমরা ক্রমাগত নতুন ফিচার ও উন্নতি যোগ করছি।</p><p style="font-size:14px;line-height:1.8;color:var(--mu)"><b style="color:var(--tx)">মূল লক্ষ্য:</b> প্রতিটি প্রতিষ্ঠানকে ডিজিটাল যাত্রায় সফল হতে সাহায্য করা এবং শিক্ষার মান উন্নয়নে ভূমিকা রাখা।</p></div>
<div class="hp-v"><small style="color:var(--mu)">বর্তমান সংস্করণ</small><div style="font-size:26px;font-weight:700;color:var(--pri);margin:2px 0 8px">${APP_VER}</div><div style="margin-bottom:12px">${["বাংলা সমর্থিত","অফলাইন-ভিত্তিক","মোবাইল-বান্ধব","নিরাপদ"].map(t=>`<span class="pl" style="background:var(--card);border:1px solid var(--ln);color:var(--mu)">${t}</span>`).join("")}</div><button class="btn g" style="width:100%;margin-bottom:8px" onclick="installApp()">📲 ফোনে অ্যাপ ইনস্টল করুন</button><button class="btn" style="width:100%" onclick="fbForm()">💬 Feedback / সমস্যা জানান</button></div>
<div class="card" style="margin-top:14px;background:#fef9e7;border-left:4px solid #f59e0b;color:#78350f;font-size:13px;line-height:1.7"><b>গোপনীয়তা এবং নিরাপত্তা:</b> আপনার সমস্ত তথ্য এই ডিভাইসেই সংরক্ষিত থাকে এবং আপনার অনুমতি ছাড়া কোথাও পাঠানো হয় না। নিয়মিত ব্যাকআপ রাখুন।</div>
${helpLogin()}
<div class="hp-dev"><div style="font-weight:700">App Builder</div><b>Tofsir Ahamed Parvez</b><div style="font-size:12px">mail: ${DEV_MAIL} &nbsp; Phone: ${DEV_PH}</div></div>`}
function ytId(u){const m=String(u).match(/(?:youtu\.be\/|v=|embed\/|shorts\/)([\w-]{11})/);return m?m[1]:""}
function hGuide(){
 guFetch();
 const cs=[...new Set(guList().map(g=>g.cat))];
 return hTabs()+`<div style="font-size:20px;font-weight:700">ইউজার গাইডলাইন</div><div style="color:var(--mu);font-size:13px;margin-bottom:10px">অ্যাপের পরিচিতি ও ব্যবহার সম্পর্কে ভিডিও গাইড</div>${isSuper()?`<button class="btn" style="margin-bottom:12px" onclick="guForm()">＋ নতুন গাইড</button>`:""}
<input placeholder="🔍 গাইড খুঁজুন..." value="${esc(guQ)}" oninput="guQ=this.value;guLst()"><div class="lx-f" style="margin-top:8px"><button class="${!guC?"on":""}" onclick="guC='';guLst(true)">সব</button>${cs.map(c=>`<button class="${guC==c?"on":""}" onclick="guC=this.dataset.c;guLst(true)" data-c="${esc(c)}">${esc(c)}</button>`).join("")}</div><div id="gul">${guH()}</div>`}
function guH(){
 const k=guQ.trim().toLowerCase(),L=guList().filter(g=>(!guC||g.cat==guC)&&(!k||(g.t+(g.desc||"")).toLowerCase().includes(k)));
 if(!L.length)return `<div class="lx-e" style="padding:34px 10px"><div style="font-size:34px">🎥</div><b style="color:var(--tx)">কোনো গাইড নেই</b><br>${isSuper()?`<small>নতুন গাইড যোগ করুন</small><br>`:""}${isSuper()?`<button class="btn" style="margin-top:12px" onclick="guForm()">＋ নতুন গাইড</button>`:""}</div>`;
 return L.map(g=>{const y=ytId(g.url);return `<div class="card"><div style="display:flex;justify-content:space-between;gap:8px"><div style="min-width:0"><b>${esc(g.t)}</b> <span class="lx-c">${esc(g.cat)}</span>${g.desc?`<div style="font-size:13px;color:var(--mu);margin-top:4px">${esc(g.desc)}</div>`:""}</div>${isSuper()?`<button class="lx-i x" style="border:0;background:none;padding:0 6px;display:block;font-size:20px;color:var(--mu)" onclick="guMenu('${g.id}')">⋯</button>`:""}</div>
${guPlay==g.id&&y?`<iframe src="https://www.youtube-nocookie.com/embed/${y}" style="width:100%;height:200px;border:0;border-radius:10px;margin-top:10px" allowfullscreen></iframe>`:""}<button class="btn o s" style="margin-top:10px" onclick="${y?`guPlay=guPlay=='${g.id}'?'':'${g.id}';guLst()`:`openExt(guList().find(x=>x.id=='${g.id}').url)`}">${y?(guPlay==g.id?"⏹ বন্ধ করুন":"▶ ভিডিও দেখুন"):"🔗 লিংক খুলুন"}</button></div>`}).join("")}
function guLst(full){if(full){render();return}const e=$("gul");if(e)e.innerHTML=guH()}
function guForm(id){if(!isSuper()){alert("শুধু Super Admin গাইড যোগ, সম্পাদনা বা মুছতে পারবেন");return}const g=id?Store.guides.find(x=>x.id==id):{};
 modal(`<span onclick="closeM()" style="float:right;font-size:22px">×</span><h2 style="text-align:center">${id?"গাইড সম্পাদনা":"নতুন গাইড যোগ করুন"}</h2>${stF("শিরোনাম *","gu_t",g.t||"")}${stF("ভিডিও লিংক *","gu_u",g.url||"")}<div class="hint" style="margin:-4px 0 8px">YouTube লিংক হলে সরাসরি ভেতরে প্লে হবে</div><label class="lb">বিভাগ</label><select id="gu_c">${GCATS.map(c=>`<option ${g.cat==c?"selected":""}>${c}</option>`).join("")}</select><label class="lb">বিবরণ</label><textarea id="gu_d" rows="3" placeholder="ভিডিও সম্পর্কে সংক্ষিপ্ত বিবরণ">${esc(g.desc||"")}</textarea><button class="btn" style="width:100%" onclick="guSave('${id||""}')">সংরক্ষণ</button><button class="btn o" style="width:100%;margin-top:8px;color:var(--tx);border-color:var(--ln)" onclick="closeM()">বাতিল</button>`)}
function guSave(id){if(!isSuper()){alert("শুধু Super Admin গাইড যোগ, সম্পাদনা বা মুছতে পারবেন");return}const t=$("gu_t").value.trim(),u=$("gu_u").value.trim();if(!t||!u){alert("শিরোনাম ও ভিডিও লিংক দিন");return}
 const o={t,url:/^https?:\/\//i.test(u)?u:"https://"+u,cat:$("gu_c").value,desc:$("gu_d").value.trim()};
 if(id)Object.assign(Store.guides.find(x=>x.id==id),o);else Store.guides.unshift({id:uid(),date:today(),...o});save();guPush();closeM();render()}
function guMenu(id){if(!isSuper()){alert("শুধু Super Admin গাইড যোগ, সম্পাদনা বা মুছতে পারবেন");return}const g=Store.guides.find(x=>x.id==id);if(!g)return;if(confirm("\""+g.t+"\" গাইড সম্পাদনা করবেন? (বাতিল চাপলে মুছে ফেলার অপশন আসবে)"))guForm(id);else if(confirm("গাইডটি মুছে ফেলবেন?")){Store.guides=Store.guides.filter(x=>x.id!=id);save();guPush();render()}}
/* ---- গাইড সার্ভারে শেয়ার: সুপার এডমিন যা যোগ করেন তা সব ব্যবহারকারী দেখবেন ---- */
const GU_KEY="smartEduGuidesRemote";
let guRemote=[],guLastFetch=0;
const guClean=a=>(Array.isArray(a)?a:[]).slice(0,200).map(g=>({id:String((g&&g.id)||"").replace(/[^\w-]/g,"")||uid(),t:String((g&&g.t)||"").slice(0,200),url:/^https?:\/\//i.test(String((g&&g.url)||""))?String(g.url).slice(0,500):"",cat:String((g&&g.cat)||"").slice(0,60),desc:String((g&&g.desc)||"").slice(0,500),date:String((g&&g.date)||"").slice(0,20)})).filter(g=>g.t&&g.url);
try{guRemote=guClean(JSON.parse(localStorage.getItem(GU_KEY)||"[]"))}catch(_){guRemote=[]}
const guList=()=>isSuper()?Store.guides:guRemote;
function guStore(a){guRemote=guClean(a);try{localStorage.setItem(GU_KEY,JSON.stringify(guRemote))}catch(_){}}
async function guFetch(force){
  try{
    if(!sb||!navigator.onLine)return;
    if(!force&&Date.now()-guLastFetch<30000)return;
    guLastFetch=Date.now();
    const {data,error}=await sb.rpc("smartedu_get_guides");
    if(error||!Array.isArray(data))return;
    guStore(data);
    /* সুপার এডমিনের কাছে গাইড আছে কিন্তু সার্ভারে নেই — প্রথমবার তুলে দেওয়া */
    if(isSuper()&&!guRemote.length&&Store.guides.length)guPush();
    guLst();
  }catch(_){}
}
async function guPush(){
  if(!isSuper()||!sb)return;
  try{
    const {error}=await sb.rpc("smartedu_set_guides",{p:guClean(Store.guides)});
    if(error)throw error;
    guStore(Store.guides);
  }catch(e){alert("গাইড সার্ভারে পাঠানো যায়নি: "+(e.message||e)+"\n(ইন্টারনেট ও ইমেইল লগইন লাগবে)")}
}
setTimeout(guFetch,2500);addEventListener("online",()=>guFetch(true));

function hFeed(){
 return hTabs()+`<div style="font-size:20px;font-weight:700">ফিডব্যাক</div><div style="color:var(--mu);font-size:13px;margin-bottom:10px">মতামত, সমস্যা বা পরামর্শ ডেভেলপারকে জানান</div><button class="btn" style="margin-bottom:12px" onclick="fbForm()">＋ নতুন ফিডব্যাক</button>`+(Store.feedback.map(f=>`<div class="card"><div style="display:flex;justify-content:space-between"><span class="lx-c">${esc(f.ty)}</span><small style="color:var(--mu)">${bn(f.date)}</small></div><div style="font-size:14px;margin:8px 0;white-space:pre-wrap">${esc(f.tx)}</div>${f.files&&f.files.length?`<div style="font-size:12px;color:var(--mu)">📎 ${f.files.map(esc).join("، ")}</div>`:""}<div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;margin-top:8px"><button class="btn o s" onclick="fbSend('${f.id}','m')">✉️ ইমেইল</button><button class="btn o s" style="color:#16a34a;border-color:#86efac" onclick="fbSend('${f.id}','w')">💬 WhatsApp</button><button class="btn o s" style="color:#dc2626;border-color:#fca5a5" onclick="fbDel('${f.id}')">মুছুন</button></div></div>`).join("")||'<div class="lx-e" style="padding:34px 10px"><div style="font-size:34px">💬</div><b style="color:var(--tx)">কোনো ফিডব্যাক নেই</b><br><small>নতুন ফিডব্যাক লিখুন</small></div>')}
function fbForm(){fbFiles=[];
 modal(`<span onclick="closeM()" style="float:right;font-size:22px">×</span><h2 style="text-align:center">Feedback / সমস্যা জানান</h2><label class="lb">ধরন</label><select id="fb_t">${FBT.map(x=>`<option>${x}</option>`).join("")}</select><label class="lb">বিস্তারিত *</label><textarea id="fb_x" rows="4" placeholder="আপনার মতামত, সমস্যা বা পরামর্শ এখানে লিখুন..."></textarea><label class="lb">ছবি / ভিডিও আপলোড</label><div class="g2" style="margin-bottom:6px"><button class="btn o" style="color:var(--tx);border-color:var(--ln)" onclick="$('fb_i').click()">🖼 ছবি</button><button class="btn o" style="color:var(--tx);border-color:var(--ln)" onclick="$('fb_v').click()">🎥 ভিডিও</button></div><input id="fb_i" type="file" accept="image/*" style="position:absolute;left:-9999px;width:1px;height:1px;opacity:0" onchange="fbPick(this)"><input id="fb_v" type="file" accept="video/*" style="position:absolute;left:-9999px;width:1px;height:1px;opacity:0" onchange="fbPick(this)"><div id="fb_l" class="hint" style="margin-bottom:8px">ফাইল সংযুক্ত করলে ইমেইল/WhatsApp অ্যাপে নিজে সংযুক্ত করে পাঠাতে হবে।</div><button class="btn" style="width:100%" onclick="hfSave()">পাঠান</button><button class="btn o" style="width:100%;margin-top:8px;color:var(--tx);border-color:var(--ln)" onclick="closeM()">বাতিল</button>`)}
function fbPick(el){const f=el.files[0];if(f){fbFiles.push(f.name);$("fb_l").textContent="📎 "+fbFiles.join("، ")}el.value=""}
function fbMsg(f){return "["+f.ty+"] "+Store.school.name+" ("+APP_VER+")\n\n"+f.tx+(f.files&&f.files.length?"\n\nসংযুক্তি (নিজে যুক্ত করুন): "+f.files.join(", "):"")}
function hfSave(){const tx=$("fb_x").value.trim();if(!tx){alert("বিস্তারিত লিখুন");return}const f={id:uid(),ty:$("fb_t").value,tx,files:fbFiles.slice(),date:today()};Store.feedback.unshift(f);save();closeM();sub="hf";render();fbSend(f.id,confirm("ইমেইলে পাঠাবেন? (বাতিল চাপলে WhatsApp-এ)")?"m":"w")}
function fbSend(id,ch){const f=Store.feedback.find(x=>x.id==id);if(!f)return;const m=fbMsg(f);openExt(ch=="m"?"mailto:"+DEV_MAIL+"?subject="+encodeURIComponent("Feedback — "+f.ty)+"&body="+encodeURIComponent(m):waLink(DEV_PH,m))}
function fbDel(id){if(confirm("ফিডব্যাক মুছবেন?")){Store.feedback=Store.feedback.filter(x=>x.id!=id);save();render()}}

let stT=0,stEd=false,usQ="",usR="";
let bkT=0;
function bkPage(){
  const cb=hasPerm("backup"),n=(Store.trash||[]).length;
  if(!cb)bkT=2;
  const head=cb?["ব্যাকআপ ও রিসাইকেল বিন","তথ্য সুরক্ষিত রাখুন ও মুছে যাওয়া তথ্য ফেরত আনুন","🗄"]:["অফলাইন লগইন PIN","ইন্টারনেট ছাড়া লগইনের জন্য নিজের PIN সেট করুন","🔢"];
  return `<div style="display:flex;gap:10px;align-items:center;margin-bottom:12px"><div class="st-ic">${head[2]}</div><div><div style="font-size:20px;font-weight:700">${head[0]}</div><div style="color:var(--mu);font-size:13px">${head[1]}</div></div></div>
<div class="seg">${cb?`<button class="${bkT==0?"on":""}" onclick="bkT=0;render()">🗄 ব্যাকআপ</button><button class="${bkT==1?"on":""}" onclick="bkT=1;render()">🗑 বিন${n?" ("+bn(n)+")":""}</button>`:""}<button class="${bkT==2?"on":""}" onclick="bkT=2;render()">🔢 অফলাইন PIN</button></div>`+(bkT==2?pinSec():bkT==1?stBin():stBk());
}
function myUser(){return activeUser?Store.users.find(x=>x.id===activeUser.id||x.identifier===activeUser.identifier):null}
function pinSec(){
  const u=myUser();
  if(!u)return '<div class="card"><div class="em">এই ডিভাইসে আপনার অ্যাকাউন্ট পাওয়া যায়নি। ইমেইল দিয়ে অনলাইনে লগইন করে আবার চেষ্টা করুন।</div></div>';
  return `<div class="card"><h2>🔢 অফলাইন লগইন PIN</h2><div style="font-size:13px;color:var(--mu);margin-bottom:10px;line-height:1.7">ইন্টারনেট না থাকলে লগইন পেইজের <b>"PIN দিয়ে লগইন (অফলাইন)"</b> থেকে নিচের ইউজারনেম ও এই PIN দিয়ে ঢুকতে পারবেন। এই PIN শুধু <b>এই ডিভাইসে</b> কাজ করবে।</div><div class="st-kv"><div><small>লগইন ইউজারনেম</small><b>${esc(u.identifier)}</b></div></div><div style="margin:8px 0 10px">${u.pinHash?'<span class="tag g">✔ PIN সেট আছে</span>':'<span class="tag r">PIN সেট করা হয়নি</span>'}</div>${u.pinHash?'<label class="lb">বর্তমান PIN <span style="color:var(--mu);font-weight:400">(ইমেইল দিয়ে অনলাইনে লগইন থাকলে লাগবে না)</span></label><input id="mp0" type="password" inputmode="numeric" maxlength="6" autocomplete="off">':""}<label class="lb">${u.pinHash?"নতুন PIN":"PIN সেট করুন"}</label><input id="mp1" type="password" inputmode="numeric" maxlength="6" placeholder="৪–৬ সংখ্যা (ইংরেজি)" autocomplete="off"><label class="lb">PIN আবার দিন</label><input id="mp2" type="password" inputmode="numeric" maxlength="6" autocomplete="off"><button class="btn" style="width:100%;margin-top:8px" onclick="myPinSave()">💾 PIN সংরক্ষণ করুন</button></div>`;
}
async function myPinSave(){
  const u=myUser();if(!u)return;
  const a=($("mp1").value||"").trim(),b=($("mp2").value||"").trim(),cur=$("mp0")?$("mp0").value.trim():"";
  if(!/^\d{4,6}$/.test(a)){alert("PIN ৪–৬ সংখ্যার হতে হবে (শুধু ইংরেজি সংখ্যা)");return}
  if(a!==b){alert("দুটি PIN মেলেনি");return}
  let online=false;try{if(sb){const {data:{session}}=await sb.auth.getSession();online=!!session}}catch(e){}
  if(!online){
    if(!u.pinHash){alert("প্রথমবার PIN সেট করতে ইমেইল ও পাসওয়ার্ড দিয়ে লগইন করা থাকতে হবে। লগআউট করে ইমেইল দিয়ে ঢুকুন।");return}
    if(!cur||!await verifyPin(cur,u.pinHash)){alert("বর্তমান PIN ভুল");return}
  }
  u.pinHash=await hashPin(a);delete u.pin;
  logA("edit","ব্যবহারকারী","অফলাইন PIN সেট: "+u.identifier);
  save();alert("✅ PIN সংরক্ষিত হয়েছে। এখন ইন্টারনেট ছাড়াও এই ডিভাইসে PIN দিয়ে লগইন করতে পারবেন।");render();
}
const ST_T=[["সাধারণ","⚙️"],["স্ক্রল বার","📢"],["কনফিগারেশন","🛡"],["নিরাপত্তা","🔒"],["সাবস্ক্রিপশন","💳"],["বিপজ্জনক","⚠️"]];
const isDark=()=>document.documentElement.dataset.theme=="dark";
function sysDark(){try{return !!(window.matchMedia&&matchMedia("(prefers-color-scheme: dark)").matches)}catch(e){return false}}
function applyTheme(){const t=Store.set.theme||"auto",h=new Date().getHours(),night=h<6||h>=18;
  // auto = ফোনের নিজস্ব ডার্ক/লাইট সেটিং; time = সন্ধ্যা ৬টা–সকাল ৬টা নাইট
  const dark=t=="dark"||(t=="time"&&night)||(t=="auto"&&(window.matchMedia?sysDark():night));
  const prev=document.documentElement.dataset.theme,nv=dark?"dark":"light";document.documentElement.dataset.theme=nv;
  try{document.documentElement.style.colorScheme=nv}catch(e){}const mt=document.querySelector('meta[name="theme-color"]');if(mt)mt.content=document.documentElement.dataset.theme=="dark"?"#10131c":"#d9f3e4";return prev!==nv}
function themeSync(){try{if(applyTheme()&&unlocked)render()}catch(e){}}
try{const _mq=window.matchMedia&&matchMedia("(prefers-color-scheme: dark)");if(_mq){_mq.addEventListener?_mq.addEventListener("change",themeSync):_mq.addListener(themeSync)}}catch(e){}
document.addEventListener("visibilitychange",()=>{if(document.visibilityState==="visible")themeSync()});
addEventListener("focus",themeSync);
function themeTog(){Store.set.theme=isDark()?"light":"dark";save();applyTheme();render()}
function greet(){const h=new Date().getHours();return h>=4&&h<12?"শুভ সকাল":h<15?"শুভ দুপুর":h<18?"শুভ বিকাল":h<20?"শুভ সন্ধ্যা":"শুভ রাত্রি"}
const pinH=p=>{let h=5381;for(const c of String(p))h=((h<<5)+h+c.charCodeAt(0))|0;return String(h)};
const b64u=u=>btoa(String.fromCharCode(...new Uint8Array(u)));
const hex=u=>[...new Uint8Array(u)].map(x=>x.toString(16).padStart(2,"0")).join("");
async function hashPin(pin,salt){const sa=salt||b64u(crypto.getRandomValues(new Uint8Array(16)));const key=await crypto.subtle.importKey("raw",new TextEncoder().encode(String(pin)),"PBKDF2",false,["deriveBits"]);const bits=await crypto.subtle.deriveBits({name:"PBKDF2",salt:Uint8Array.from(atob(sa),c=>c.charCodeAt(0)),iterations:120000,hash:"SHA-256"},key,256);return {salt:sa,hash:hex(bits),v:1};}
async function verifyPin(pin,stored){if(!stored)return false;if(typeof stored==="string")return(/^\d{4,6}$/.test(stored)&&stored===String(pin))||pinH(pin)===stored;try{const x=typeof stored==="string"?JSON.parse(stored):stored;const h=await hashPin(pin,x.salt);return h.hash===x.hash}catch(_){return false}}
function validBackup(d){
 if(!d||typeof d!=="object"||Array.isArray(d)||!Array.isArray(d.students))return false;
 if(d.school!==undefined&&(!d.school||typeof d.school!=="object"||Array.isArray(d.school)))return false;
 for(const k of ["set","sync","att","exg","attT"])if(d[k]!==undefined&&(!d[k]||typeof d[k]!=="object"||Array.isArray(d[k])))return false;
 const arrays=["students","teachers","fees","notices","exams","txns","books","hw","staff","log","smslog","sal","routine","events","tbooks","certs","libSales","libGoods","schools","invUsers","users","syncQueue","audit","guides","feedback"];
 for(const k of arrays)if(d[k]!==undefined&&(!Array.isArray(d[k])||d[k].length>100000))return false;
 try{return JSON.stringify(d).length<=25*1024*1024}catch(_){return false}
}
function restoreBackupData(d){
 if(!validBackup(d)){alert("ব্যাকআপের গঠন সঠিক নয় বা ফাইলটি অতিরিক্ত বড়");return false}
 if(!confirm("বর্তমান প্রতিষ্ঠানের সব তথ্য ব্যাকআপের তথ্য দিয়ে প্রতিস্থাপন হবে। আগে বর্তমান ডেটার একটি ব্যাকআপ আছে কি? চালিয়ে যাবেন?"))return false;
 const restored=migrateState(d);
 restored.sync={...restored.sync,apiKey:"",backoffMs:0,nextRetryAt:0};
 restored.syncQueue=[];
 Store.replace(restored);LANG=(Store.set&&Store.set.lang)||"bn";migrateExams();save();
 return true;
}
function stSet(k,v){Store.set[k]=v;save();applyTheme();render()}
const stTg=(l,d,k)=>`<div class="st-tg" onclick="stSet('${k}',${Store.set[k]?0:1})"><div style="flex:1"><b style="font-weight:600;font-size:14px">${l}</b><small>${d}</small></div><div class="st-sw ${Store.set[k]?"on":""}"><i></i></div></div>`;
const stF=(l,id,v,t)=>`<label class="lb">${l}</label><input id="${id}" type="${t||"text"}" value="${esc(v)}">`;
function setng(){
 return `<div style="display:flex;gap:10px;align-items:center;margin-bottom:12px"><div class="st-ic">⚙️</div><div><div style="font-size:20px;font-weight:700">সেটিংস</div><div style="color:var(--mu);font-size:13px">অ্যাপের পছন্দ ও নিরাপত্তা নিয়ন্ত্রণ করুন</div></div></div>
<div class="st-tabs">${ST_T.map((t,i)=>`<button class="${i==stT?"on":""}" onclick="stT=${i};stEd=false;render()">${t[1]} ${t[0]}</button>`).join("")}</div>`+([stGen,stBar,stCfg,stSec,stSub,stDng][stT]||stGen)()}
function stGen(){
 const th=Store.set.theme,M=[["auto","🔄","অটো (ফোনের সেটিং)"],["time","🕕","সময় অনুযায়ী"],["light","☀️","ডে মোড"],["dark","🌙","নাইট মোড"]];
 return `<div class="card"><h2>☀️ ডিসপ্লে মোড</h2><div style="font-size:13px;color:var(--mu);margin-bottom:10px">অটো: ফোনের ডার্ক/লাইট সেটিং অনুসরণ করবে। সময় অনুযায়ী: সকাল ৬টা–বিকাল ৬টা ডে, তারপর নাইট।</div><div class="st-md">${M.map(m=>`<div class="${th==m[0]?"on":""}" onclick="stSet('theme','${m[0]}')"><em>${m[1]}</em>${m[2]}${th==m[0]?"<br><u>সক্রিয়</u>":""}</div>`).join("")}</div></div>
<div class="card"><h2>🌐 ভাষা / Language</h2><div style="font-size:13px;color:var(--mu);margin-bottom:10px">অ্যাপের ভাষা নির্বাচন করুন</div><div class="st-lg">${[["bn","🇧🇩","বাংলা"],["en","🇬🇧","English"]].map(x=>`<div class="${LANG==x[0]?"on":""}" onclick="setLang('${x[0]}')"><span style="font-size:24px">${x[1]}</span><br>${x[2]}${LANG==x[0]?'<br><u style="text-decoration:none;background:var(--pri);color:#fff;border-radius:6px;font-size:10px;padding:1px 8px">সক্রিয়</u>':""}</div>`).join("")}</div></div></div>
<div class="card"><h2>📅 তারিখ প্রদর্শন</h2>${stTg("হোমে আরবি ও বাংলা তারিখ দেখান","বন্ধ থাকলে হোমে শুধু সময় ও ইংরেজি তারিখ দেখাবে","dates")}<label class="lb">হিজরী তারিখ সমন্বয় (চাঁদ দেখা অনুযায়ী)</label><select onchange="stSet('hj',+this.value)">${[[-2,"২ দিন আগে"],[-1,"১ দিন আগে"],[0,"ডিফল্ট"],[1,"১ দিন পরে"],[2,"২ দিন পরে"]].map(x=>`<option value="${x[0]}" ${(+Store.set.hj||0)==x[0]?"selected":""}>${x[1]}</option>`).join("")}</select><label class="lb">বাংলা তারিখ সমন্বয়</label><select onchange="stSet('bd',+this.value)">${[[-2,"২ দিন আগে"],[-1,"১ দিন আগে"],[0,"ডিফল্ট"],[1,"১ দিন পরে"],[2,"২ দিন পরে"]].map(x=>`<option value="${x[0]}" ${(+Store.set.bd||0)==x[0]?"selected":""}>${x[1]}</option>`).join("")}</select></div>
<div class="card"><h2>🧩 ইন্টারফেস এলিমেন্ট</h2>${stTg("গ্রিটিং মেসেজ","হোমের ওপরে শুভ সকাল/দুপুর/বিকাল/রাত্রি দেখান","greet")}${stTg("নোটিফিকেশন বেল","হোমের ওপরে নোটিশ বেল আইকন দেখান","bell")}${stTg("বিসমিল্লাহ","হেডারে আরবিতে বিসমিল্লাহির রাহমানির রাহিম দেখান","bism")}${stTg("থিম টগল","হোমের ওপরে ডার্ক/লাইট মোড টগল বাটন দেখান","tbtn")}</div>`}
function stBar(){return `<div class="card"><h2>📢 লাইভ স্ক্রল বার</h2><div style="font-size:13px;color:var(--mu);margin-bottom:10px">এখানে কিছু লিখলে তা হোমের "লাইভ" বারে নোটিশের জায়গায় ডান থেকে বামে স্ক্রল করে দেখাবে। খালি রাখলে সর্বশেষ নোটিশ দেখাবে।<br>✅ এই লেখা প্রতিষ্ঠানের সকল ইউজারের (শিক্ষক, স্টাফ ও অভিভাবক) অ্যাপে ইন্টারনেট থাকলে স্বয়ংক্রিয়ভাবে পৌঁছে যাবে।</div><label class="lb">স্কুল টেক্সট</label><textarea id="sbt" rows="3" placeholder="যেমন: আগামীকাল স্কুল বন্ধ থাকবে...">${esc(Store.set.bar)}</textarea><div style="display:flex;gap:8px"><button class="btn" style="flex:1" onclick="Store.set.bar=$('sbt').value.trim();save();snapNow();alert('সেট করা হয়েছে')">📢 সেট করুন</button><button class="btn o" onclick="Store.set.bar='';save();snapNow();render()">মুছুন</button></div></div>`}
function stCfg(){
 const sc=Store.school,tc=Store.teachers.length+Store.staff.length;
 if(stEd)return `<div class="card"><h2>প্রতিষ্ঠানের তথ্য সম্পাদনা</h2><div class="row" style="border:0" onclick="pickLogo()"><div class="av" style="width:52px;height:52px">${sc.logo?`<img class="av" style="width:52px;height:52px" src="${safeDataImage(sc.logo)}">`:"🕌"}</div><div class="f"><span style="color:var(--pri)">লোগো আপলোড করুন</span></div></div><div class="row" style="border:0"><div style="width:96px;height:52px;border:1px dashed var(--ln);border-radius:10px;background:#fff;display:flex;align-items:center;justify-content:center;overflow:hidden;flex:none" onclick="pickSig()">${sc.sig?`<img style="max-width:100%;max-height:100%;object-fit:contain" src="${safeDataImage(sc.sig)}">`:`<span style="font-size:11px;color:var(--mu)">সই</span>`}</div><div class="f" onclick="pickSig()"><span style="color:var(--pri)">পরিচালকের সইয়ের ছবি আপলোড করুন</span><small>সাদা কাগজে সই করে ছবি তুলুন (পরীক্ষার রুটিন PDF-এ বসবে)</small></div>${sc.sig?`<button class="btn r s" onclick="delSig()">মুছুন</button>`:""}</div><input id="ph" type="file" accept="image/*" style="position:absolute;left:-9999px;opacity:0;width:1px;height:1px" onchange="photoFile(this.files[0]);this.value=''">
<label class="lb">প্রতিষ্ঠানের ধরন</label><select id="cf_type">${["স্কুল/সাধারণ","মাদ্রাসা","কোচিং সেন্টার","কলেজ"].map(x=>`<option ${Store.set.stype==x?"selected":""}>${x}</option>`).join("")}</select>
${stF("নাম (বাংলা)","cf_name",sc.name)}${stF("নাম (ইংরেজি)","cf_nameEn",sc.nameEn)}<label class="lb">বিবরণ</label><textarea id="cf_desc" rows="2">${esc(sc.desc)}</textarea>${stF("ঠিকানা","cf_addr",sc.addr)}${stF("ফোন","cf_phone",sc.phone,"tel")}${stF("ইমেইল","cf_email",sc.email,"email")}${stF("প্রধান শিক্ষক/পরিচালক","cf_director",sc.director)}${stF("প্রতিষ্ঠাতা","cf_founder",sc.founder)}${stF("স্থাপিত (যেমন: ২০২৪ ইং)","cf_est",sc.est)}${stF("শিক্ষাবর্ষ","cf_year",sc.year)}${stF("bKash নম্বর","cf_bkash",sc.bkash,"tel")}${stF("Nagad নম্বর","cf_nagad",sc.nagad,"tel")}
<div style="display:flex;gap:8px;margin-top:6px"><button class="btn" style="flex:1" onclick="cfSave()">সংরক্ষণ করুন</button><button class="btn o" onclick="stEd=false;render()">বাতিল</button></div></div>`;
 const kv=(i,l,v)=>v?`<div class="st-kv"><span>${i}</span><div><small>${l}</small>${esc(v)}</div></div>`:"";
 return `<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px"><div><div style="font-size:18px;font-weight:700">${esc(sc.name)}</div><div style="color:var(--mu);font-size:12px">প্রতিষ্ঠানের সম্পূর্ণ তথ্য ও পরিচিতি</div></div><button class="btn s" onclick="stEd=true;render()">✏️ সম্পাদনা করুন</button></div>
<div class="st-ov"><div style="display:flex;gap:12px;align-items:center;margin-bottom:10px"><div class="av" style="width:64px;height:64px;border-radius:14px;background:#fff;font-size:30px">${sc.logo?`<img style="width:64px;height:64px;object-fit:contain" src="${safeDataImage(sc.logo)}">`:"🕌"}</div><span class="pl b" style="margin:0">${esc(Store.set.stype)}</span></div><div style="font-size:19px;font-weight:700;color:var(--pri)">${esc(sc.name)}</div>${sc.nameEn?`<div style="color:var(--pri);font-size:13px">${esc(sc.nameEn)}</div>`:""}${sc.desc?`<div style="font-size:13px;margin-top:6px">${esc(sc.desc)}</div>`:""}</div>
<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-bottom:12px"><div class="st-cn">🎓<b>${bn(Store.students.length)}</b><small>মোট শিক্ষার্থী</small></div><div class="st-cn">🧑‍🏫<b>${bn(tc)}</b><small>শিক্ষক/কর্মচারী</small></div><div class="st-cn">👤<b>${bn(1)}</b><small>সিস্টেম ইউজার</small></div></div>
<div class="card"><h2>প্রতিষ্ঠানের বিস্তারিত তথ্য</h2>${kv("📍","ঠিকানা",sc.addr)}${kv("📞","ফোন",sc.phone)}${kv("✉️","ইমেইল",sc.email)}${kv("👥","প্রধান শিক্ষক",sc.director)}${kv("📅","স্থাপিত",sc.est)}${kv("🏛","প্রতিষ্ঠাতা",sc.founder)}${kv("📘","শিক্ষাবর্ষ",sc.year)}${sc.bkash||sc.nagad?`<div class="st-kv"><span>💳</span><div><small>ফি গ্রহণের পেমেন্ট নম্বর</small>${sc.bkash?`<span class="pl" style="background:#fce7f3;color:#be185d">bKash: ${esc(sc.bkash)}</span>`:""}${sc.nagad?`<span class="pl" style="background:#ffedd5;color:#c2410c">Nagad: ${esc(sc.nagad)}</span>`:""}</div></div>`:""}</div>`}
function cfSave(){const g=i=>$(i).value.trim();Store.school={...Store.school,name:g("cf_name")||Store.school.name,nameEn:g("cf_nameEn"),desc:g("cf_desc"),addr:g("cf_addr"),phone:g("cf_phone"),email:g("cf_email"),director:g("cf_director"),founder:g("cf_founder"),est:g("cf_est"),year:g("cf_year"),bkash:g("cf_bkash"),nagad:g("cf_nagad")};Store.set.stype=g("cf_type");stEd=false;save();render()}
function stSec(){return stSec0()}
function stSec0(){
 if(Store.set.pin)return `<div class="card"><h2>🛡 PIN লক (২-স্তরের নিরাপত্তা)</h2><div style="color:#16a34a;font-weight:600;margin:8px 0">✔ PIN লক সক্রিয় আছে</div><div style="font-size:13px;color:var(--mu);margin-bottom:12px">অ্যাপ খোলার সময় PIN চাওয়া হবে। PIN ভুলে গেলে অ্যাপ খোলা যাবে না, তাই নিয়মিত ব্যাকআপ রাখুন।</div><div style="display:flex;gap:8px"><button class="btn o" style="flex:1" onclick="pinOff()">PIN বন্ধ করুন</button></div></div>`;
 return `<div class="card"><h2>🛡 PIN লক (২-স্তরের নিরাপত্তা)</h2><div style="font-size:13px;color:var(--mu);margin-bottom:10px">অ্যাপে প্রবেশের সময় PIN চাইবে — অতিরিক্ত নিরাপত্তা।</div><label class="lb">PIN সেট করুন</label><input id="pn1" type="password" inputmode="numeric" placeholder="কমপক্ষে ৪ সংখ্যা"><label class="lb">PIN নিশ্চিত করুন</label><input id="pn2" type="password" inputmode="numeric" placeholder="একই PIN আবার লিখুন"><button class="btn" style="width:100%" onclick="pinOn()">🛡 PIN সক্রিয় করুন</button><div class="hint" style="margin-top:8px">PIN ভুলে গেলে অ্যাপ খোলা যাবে না। এই PIN ডিভাইসে সাধারণ সুরক্ষা দেয়, ব্যাংক-মানের এনক্রিপশন নয়।</div></div>`}
async function pinOn(){const a=$("pn1").value.trim(),b=$("pn2").value.trim();if(!/^\d{4,}$/.test(a)){alert("কমপক্ষে ৪ সংখ্যার PIN দিন (শুধু ইংরেজি সংখ্যা)");return}if(a!==b){alert("দুটি PIN মেলেনি");return}Store.set.pin=await hashPin(a);sessionStorage.setItem("smartEduUnlocked","1");save();render();alert("PIN লক সক্রিয় হয়েছে")}
async function pinOff(){const v=prompt("বর্তমান PIN দিন");if(v===null)return;if(!await verifyPin(v,Store.set.pin)){alert("PIN ভুল");return}Store.set.pin="";sessionStorage.removeItem("smartEduUnlocked");save();render()}
function lockCheck(){if(!Store.set.pin||sessionStorage.getItem("smartEduUnlocked")==="1")return;const o=document.createElement("div");o.id="lk";o.style.cssText="position:fixed;inset:0;z-index:99;background:var(--bg);display:flex;flex-direction:column;align-items:center;justify-content:center;gap:12px;padding:20px";o.innerHTML=`<div style="font-size:48px">🔒</div><div style="font-weight:700;font-size:18px;text-align:center">${esc(Store.school.name)}</div><input id="lkp" type="password" inputmode="numeric" placeholder="PIN দিন" style="max-width:240px;text-align:center" onkeydown="if(event.key=='Enter')lockTry()"><button class="btn" style="width:240px" onclick="lockTry()">খুলুন</button>`;document.body.appendChild(o)}
async function lockTry(){if(await verifyPin($("lkp").value,Store.set.pin)){sessionStorage.setItem("smartEduUnlocked","1");$("lk").remove()}else{alert("PIN ভুল");$("lkp").value=""}}
let scQ="",scSel="",umT=0,schLg="";
const UROLES=["অ্যাডমিন","সহ-অ্যাডমিন","শিক্ষক","হিসাবরক্ষক","অভিভাবক","সাধারণ ইউজার"];
const UROLE_C={"Super Admin":"background:#ffe4e9;color:#be123c","অ্যাডমিন":"background:#f3e8ff;color:#7e22ce","সহ-অ্যাডমিন":"background:#e0e7ff;color:#4338ca","শিক্ষক":"background:#dbeafe;color:#1d4ed8","হিসাবরক্ষক":"background:#fef3c7;color:#b45309","অভিভাবক":"background:#dcfce7;color:#15803d","সাধারণ ইউজার":"background:var(--ln);color:var(--mu)"};
const PMOD=[["একাডেমিক",[["stu","শিক্ষার্থী ব্যবস্থাপনা"],["att","উপস্থিতি"],["exam","পরীক্ষা"],["res","ফলাফল এন্ট্রি"],["card","রিপোর্ট কার্ড"],["cal","পরীক্ষার ক্যালেন্ডার"],["qb","প্রশ্নব্যাংক"]]],["লাইব্রেরি ও যোগাযোগ",[["lib","লাইব্রেরি"],["not","নোটিশ"],["msg","মেসেজিং"],["slog","SMS লগ"],["sdash","SMS ড্যাশবোর্ড"]]],["অর্থ",[["fee","ফি ব্যবস্থাপনা"],["fin","আর্থিক প্রতিবেদন"],["pay","পেমেন্ট"]]],["কর্মী ও প্রশাসন",[["tch","শিক্ষক তালিকা"],["stf","কর্মকর্তা/কর্মচারী"],["usr","ব্যবহারকারী ব্যবস্থাপনা"],["set","সেটিংস"],["bk","ব্যাকআপ"]]]];
const PMK=PMOD.flatMap(g=>g[1].map(x=>x[0]));
function defPerm(r){const f=fn=>Object.fromEntries(PMK.map(k=>[k,fn(k)]));return r=="অ্যাডমিন"?f(()=>true):r=="সহ-অ্যাডমিন"?f(k=>!["usr","set","bk"].includes(k)):r=="শিক্ষক"?f(k=>["stu","att","exam","res","card","cal","qb","lib","not","msg"].includes(k)):r=="হিসাবরক্ষক"?f(k=>["fee","fin","pay"].includes(k)):f(()=>false)}
const schAll=()=>[{id:"main",main:1,name:Store.school.name,logo:Store.school.logo,email:Store.school.email||"",addr:Store.school.addr,phone:Store.school.phone,est:Store.school.est}].concat(Store.schools);
const schOf=id=>schAll().find(x=>x.id==id);
const kk=n=>n>=1000?"৳"+bn(+(n/1000).toFixed(n>=10000?0:1))+"k":money(n);
const addMo=(b,m)=>{const d=new Date(b+"T00:00:00"),dy=d.getDate();d.setDate(1);d.setMonth(d.getMonth()+m);d.setDate(Math.min(dy,new Date(d.getFullYear(),d.getMonth()+1,0).getDate()));return d.getFullYear()+"-"+p2(d.getMonth()+1)+"-"+p2(d.getDate())};
function schSt(sc){
  if(sc.main)return{st:Store.students.length,te:Store.teachers.length,col:Store.fees.reduce((a,f)=>a+f.paid,0),dd:Store.fees.reduce((a,f)=>a+due(f),0)};
  const x=window._remStats&&window._remStats[String(sc.id)];
  return x?{st:+x.st_students||0,te:+x.st_teachers||0,col:+x.st_collect||0,dd:+x.st_due||0}:{st:0,te:0,col:0,dd:0};
}
function schEx(sc){
  if(sc.main)return{t:"✓ অফলাইন (মেয়াদহীন)",ok:1};
  const r=window._remSch&&window._remSch[String(sc.id)];
  if(r){
    if(r.locked)return{t:"🔒 ব্লকড",ok:0};
    const c=srvCalc(r);
    if(c.k==="none")return{t:"মেয়াদ শেষ",ok:0};
    return{t:(c.k==="trial"?"ফ্রি ট্রায়াল: ":"✓ মেয়াদ: ")+bn(c.end)+" ("+bn(subDays(c.end))+" দিন বাকি)",ok:1};
  }
  const b=sc.sub||{};if(b.status=="inactive")return{t:"নিষ্ক্রিয়",ok:0};
  return !b.exp||b.exp<today()?{t:"মেয়াদ শেষ",ok:0}:{t:"✓ মেয়াদ: "+bn(b.exp),ok:1};
}
function schNoLocalH(sc){
  const t=schSt(sc),has=window._remStats&&window._remStats[String(sc.id)];
  return has?`<div class="hint">👥 শিক্ষার্থী ${bn(t.st)} জন · 🎓 শিক্ষক ${bn(t.te)} জন · 📈 সংগ্রহ ${money(t.col)}${t.dd>0?" · ⚠ বকেয়া "+money(t.dd):""}<br>নাম-পরিচয়ের বিস্তারিত তালিকা শুধু ওই প্রতিষ্ঠানের অ্যাডমিনের ডিভাইসে থাকে।</div>`:'<div class="hint">এই প্রতিষ্ঠানের শিক্ষক/শিক্ষার্থীর সংখ্যা এখনও আসেনি — প্রতিষ্ঠানের অ্যাডমিন অ্যাপে একবার লগইন করলে এখানে আসবে।</div>';
}
function stSch(){
 const all=schAll(),ss=all.map(schSt),act=all.filter(x=>schEx(x).ok).length,st=[["🏢","মোট স্কুল",all.length,"59,130,246","#2563eb"],["✔","সক্রিয়",act,"16,185,129","#059669"],["👥","মোট শিক্ষার্থী",ss.reduce((a,x)=>a+x.st,0),"99,102,241","#4f46e5"],["📈","মোট সংগ্রহ",kk(ss.reduce((a,x)=>a+x.col,0)),"16,185,129","#059669"]];
 return `<div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:10px"><div><div style="font-size:20px;font-weight:700">সব স্কুল — Overview</div><div style="color:var(--mu);font-size:13px">Super Admin কেন্দ্রীয় ড্যাশবোর্ড</div></div></div><button class="btn" style="margin-bottom:12px" onclick="schForm()">＋ নতুন প্রতিষ্ঠান</button>
<div class="g2">${st.map(x=>`<div class="st-cn" style="background:rgba(${x[3]},.12);border-color:rgba(${x[3]},.3);color:${x[4]}"><div>${x[0]}</div><b>${typeof x[2]=="number"?bn(x[2]):x[2]}</b><small style="color:${x[4]}">${x[1]}</small></div>`).join("")}</div>
<input placeholder="🔍 স্কুলের নাম বা ইমেইল দিয়ে খুঁজুন..." value="${esc(scQ)}" oninput="scQ=this.value;scLst()" style="margin-top:12px"><select onchange="scSel=this.value;scLst()"><option value="">— স্কুল বাছাই করে শিক্ষক/শিক্ষার্থী দেখুন —</option>${all.map(x=>`<option value="${x.id}" ${scSel==x.id?"selected":""}>${esc(x.name)}</option>`).join("")}</select><div id="scl">${scLstH()}</div>`}
function scLstH(){
 const k=scQ.trim().toLowerCase();let h="";
 if(scSel){const sc=schOf(scSel);if(sc){h+=`<div class="card"><h2>${esc(sc.name)}</h2>${sc.main?`<b style="font-size:13px">শিক্ষক (${bn(Store.teachers.length)})</b><div style="font-size:13px;color:var(--mu);margin:4px 0 10px">${Store.teachers.map(t=>esc(t.name)).join("، ")||"কেউ নেই"}</div><b style="font-size:13px">শিক্ষার্থী (${bn(Store.students.length)})</b><div style="font-size:13px;color:var(--mu);margin-top:4px;max-height:160px;overflow:auto">${Store.students.map(t=>esc(t.name)+" ("+esc(t.cls||"")+")").join("، ")||"কেউ নেই"}</div>`:schNoLocalH(sc)}</div>`}}
 h+=schAll().filter(x=>!k||(x.name+(x.email||"")).toLowerCase().includes(k)).map(sc=>{const t=schSt(sc),e=schEx(sc);
  return `<div class="card" style="border-width:2px"><div style="display:flex;gap:10px;align-items:center"><div class="av" style="width:44px;height:44px;border-radius:10px;background:#4f6df5;color:#fff;font-size:22px">${sc.logo?`<img style="width:44px;height:44px;object-fit:contain;background:#fff;border-radius:10px" src="${safeDataImage(sc.logo)}">`:"🏢"}</div><div style="min-width:0"><b>${esc(sc.name)}</b><div style="font-size:12px;color:var(--mu);word-break:break-all">${esc(sc.email||"")}</div><div style="font-size:12px;color:var(--mu)">${esc(sc.addr||"")}</div></div></div>
<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin:10px 0"><div class="st-cn" style="padding:8px"><b style="font-size:18px">${bn(t.st)}</b><small>শিক্ষার্থী</small></div><div class="st-cn" style="padding:8px"><b style="font-size:18px">${bn(t.te)}</b><small>শিক্ষক</small></div><div class="st-cn" style="padding:8px"><b style="font-size:18px;color:#059669">${kk(t.col)}</b><small>সংগ্রহ</small></div></div>
<span class="pl" style="${e.ok?"background:#dcfce7;color:#15803d":"background:#ffe4e9;color:#be123c"}">👑 ${e.t}</span>${t.dd>0?`<div style="background:#fef3c7;color:#b45309;border-radius:8px;padding:7px 10px;font-size:13px;margin:6px 0">⚠ বকেয়া ফি: ${money(t.dd)}</div>`:""}
<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-top:8px"><button class="btn o s" style="color:var(--tx);border-color:var(--ln)" onclick="schView('${sc.id}')">👁 বিস্তারিত</button><button class="btn o s" onclick="schForm('${sc.id}')">✏️ এডিট</button><button class="btn o s" style="color:var(--tx);border-color:var(--ln)" onclick="schSub('${sc.id}')">👑 সাবস্ক্রিপশন</button></div></div>`}).join("")||'<div class="em">কোনো প্রতিষ্ঠান পাওয়া যায়নি</div>';
 return h}
function scLst(){const e=$("scl");if(e)e.innerHTML=scLstH()}
function schView(id){if(id=="main"){tab="more";sub="set";stT=2;stEd=false;render();return}const sc=schOf(id),a=sc.admin||{},e=schEx(sc);
 modal(`<span onclick="closeM()" style="float:right;font-size:22px">×</span><h2>🏢 ${esc(sc.name)}</h2><div class="st-kv"><span>📍</span><div><small>ঠিকানা</small>${esc(sc.addr||"—")}</div></div><div class="st-kv"><span>📞</span><div><small>যোগাযোগ</small>${esc(sc.phone||"—")}</div></div><div class="st-kv"><span>📅</span><div><small>স্থাপিত</small>${esc(sc.est||"—")}</div></div><div class="st-kv"><span>👤</span><div><small>অ্যাডমিন</small>${esc(a.name||"—")}${a.email?"<br>"+esc(a.email):""}${a.phone?"<br>"+esc(a.phone):""}</div></div><div class="st-kv"><span>👑</span><div><small>সাবস্ক্রিপশন</small>${esc((sc.sub||{}).plan||"standard")} · ${e.t}</div></div><button class="btn o" style="width:100%;margin-top:10px" onclick="closeM()">বন্ধ করুন</button>`)}
function schForm(id){
 if(id=="main"){tab="more";sub="set";stT=2;stEd=true;render();return}
 const sc=id?Store.schools.find(x=>x.id==id):null,a=sc&&sc.admin||{},sb=sc&&sc.sub||{};schLg=sc?sc.logo||"":"";
 modal(`<span onclick="closeM()" style="float:right;font-size:22px">×</span><h2>🏢 ${sc?"প্রতিষ্ঠান সম্পাদনা":"নতুন প্রতিষ্ঠান তৈরি ও অ্যাডমিন নিয়োগ"}</h2>
<div class="card" style="margin:0 0 10px"><b style="font-size:13px;color:var(--pri)">🏢 প্রতিষ্ঠানের তথ্য</b><div style="display:flex;gap:10px;align-items:center;margin:8px 0"><div class="av" id="slgp" style="width:56px;height:56px;border-radius:12px;border:2px dashed var(--ln);background:none">${schLg?`<img style="width:56px;height:56px;object-fit:contain" src="${safeImageSrc(schLg)}">`:"🖼"}</div><div><small>প্রতিষ্ঠানের লোগো (ঐচ্ছিক)</small><br><button class="btn s" onclick="schPick()">⬆ লোগো আপলোড</button></div></div><input id="ph" type="file" accept="image/*" style="position:absolute;left:-9999px;opacity:0;width:1px;height:1px" onchange="photoFile(this.files[0]);this.value=''">
${stF("প্রতিষ্ঠানের নাম *","sf_n",sc?sc.name:"")}${stF("ঠিকানা","sf_a",sc?sc.addr:"")}${stF("যোগাযোগ নম্বর","sf_p",sc?sc.phone:"","tel")}${stF("স্থাপিত সাল","sf_e",sc?sc.est:"")}</div>
<div class="card" style="margin:0 0 10px;background:#fef9e7;color:#78350f;border-color:#fde68a"><b style="font-size:13px">👑 অ্যাডমিন নিয়োগ</b>${stF("অ্যাডমিনের পূর্ণ নাম","sf_an",a.name)}${stF("ইমেইল (ঐচ্ছিক)","sf_ae",a.email,"email")}${stF("WhatsApp / মোবাইল (ঐচ্ছিক)","sf_ap",a.phone,"tel")}<div style="font-size:12px">${sc?"অ্যাডমিনের তথ্য শুধু এই রেকর্ডে হালনাগাদ হবে।":"📌 নাম দিলে একটি অ্যাডমিন ইউজার রেকর্ড তৈরি হবে। খালি রাখলে পরে ব্যবহারকারী ট্যাব থেকে নিয়োগ দিতে পারবেন।"}</div></div>
<label class="lb">প্ল্যান</label><select id="sf_pl">${["standard","premium"].map(x=>`<option ${sb.plan==x?"selected":""}>${x}</option>`).join("")}</select>
<label class="lb">${sc?"মেয়াদ বাড়ান":"মাস"}</label><select id="sf_m">${sc?'<option value="0">বাড়াবেন না</option>':""}${[1,3,6,12].map(x=>`<option value="${x}">${bn(x)} মাস</option>`).join("")}</select>
<label class="lb">স্ট্যাটাস</label><select id="sf_s"><option value="active" ${sb.status!="inactive"?"selected":""}>active</option><option value="inactive" ${sb.status=="inactive"?"selected":""}>inactive</option></select>
<button class="btn" style="width:100%;margin-top:6px" onclick="schSave('${id||""}')">🏢 ${sc?"সংরক্ষণ করুন":"প্রতিষ্ঠান তৈরি করুন"}</button><button class="btn o" style="width:100%;margin-top:8px" onclick="closeM()">বাতিল</button>${sc?`<button class="btn o" style="width:100%;margin-top:8px;color:#dc2626;border-color:#fca5a5" onclick="schDel('${id}')">🗑 প্রতিষ্ঠান মুছুন</button>`:""}`)}
function schPick(){photoCb=u=>{const x=safeImageSrc(u);if(!x)return alert("শুধু বৈধ image ফাইল ব্যবহার করুন");schLg=x;const e=$("slgp");if(e)e.innerHTML=`<img style="width:56px;height:56px;object-fit:contain" src="${x}">`};pickPhoto()}
function schSave(id){const g=i=>$(i).value.trim(),n=g("sf_n");if(!n){alert("প্রতিষ্ঠানের নাম দিন");return}
 const ad={name:g("sf_an"),email:g("sf_ae"),phone:g("sf_ap")},m=+$("sf_m").value||0;let sc=id?Store.schools.find(x=>x.id==id):null;
 if(!sc){sc={id:uid(),sub:{}};Store.schools.push(sc);if(ad.name||ad.email)Store.invUsers.push({id:uid(),name:ad.name,email:ad.email,phone:ad.phone,roles:["অ্যাডমিন"],sid:sc.id,blocked:0,perms:defPerm("অ্যাডমিন"),inv:today()})}
 Object.assign(sc,{name:n,addr:g("sf_a"),phone:g("sf_p"),est:g("sf_e"),logo:schLg,admin:ad,email:ad.email||sc.email||""});
 sc.sub={plan:$("sf_pl").value,status:$("sf_s").value,exp:m?addMo(sc.sub.exp&&sc.sub.exp>today()?sc.sub.exp:today(),m):(sc.sub.exp||"")};
 pushSchoolToServer(sc.id,{name:sc.name,addr:sc.addr,phone:sc.phone,est:sc.est});
 save();closeM();render()}
function schDel(id){if(!confirm("এই প্রতিষ্ঠানের রেকর্ড মুছবেন?"))return;Store.schools=Store.schools.filter(x=>x.id!=id);rmSchIdx(id);Store.invUsers.forEach(u=>{if(u.sid==id)u.sid=""});save();closeM();render()}
function schSub(id){if(id=="main"){tab="more";sub="set";stT=4;render();return}schForm(id)}
function usBase(){const rem=window._remUsers||[],em=new Set(rem.map(u=>String(u.email||"").toLowerCase()));return rem.concat(Store.invUsers.filter(u=>!em.has(String(u.email||"").toLowerCase())))}
function usAll(){const tq=usQ.trim().toLowerCase(),me={me:1,name:Store.school.director||"আপনি (অ্যাডমিন)",email:Store.school.email||"",roles:["Super Admin"],sid:"main"};return[me].concat(usBase()).filter(u=>(!usR||u.roles.includes(usR))&&(!tq||((u.name||"")+(u.email||"")).toLowerCase().includes(tq)))}
function stUsr(){
 if(!window._remAt||Date.now()-window._remAt>20000)setTimeout(loadRemoteUsers,0);
 return `<div style="font-size:20px;font-weight:700">ইউজার ম্যানেজমেন্ট</div><div style="color:var(--mu);font-size:13px;margin-bottom:10px">ব্যবহারকারীর ভূমিকা, অ্যাক্সেস ও ব্লক নিয়ন্ত্রণ</div><button class="btn" style="margin-bottom:12px" onclick="usInv()">＋ নতুন ইউজার আমন্ত্রণ</button> <button class="btn g" style="margin-bottom:12px" onclick="loadApprovalPanel()">✅ ইমেইল ব্যবহারকারীর অনুমোদন</button>
<div class="g2" id="usc">${stUcH()}</div>
<div class="card" style="background:rgba(239,68,68,.08);border-color:#fecaca;font-size:13px"><b style="color:#dc2626">🛡 Super Admin মোড সক্রিয়</b><br><span style="color:#dc2626">আপনি যেকোনো ইউজারকে ব্লক করতে, তাদের ভূমিকা পরিবর্তন করতে এবং মডিউল অ্যাক্সেস নির্ধারণ করতে পারবেন।</span></div>
<input placeholder="🔍 নাম বা ইমেইল দিয়ে খুঁজুন..." value="${esc(usQ)}" oninput="usQ=this.value;stUl()"><select onchange="usR=this.value;stUl()"><option value="">সব ভূমিকা</option>${["Super Admin"].concat(UROLES).map(r=>`<option ${usR==r?"selected":""}>${r}</option>`).join("")}</select><div id="usl">${stUlH()}</div>`}
function stUcH(){const b=usBase(),cnt=r=>b.filter(u=>u.roles.includes(r)).length,st=[["Super Admin",1],["অ্যাডমিন",cnt("অ্যাডমিন")],["সহ-অ্যাডমিন",cnt("সহ-অ্যাডমিন")],["শিক্ষক",cnt("শিক্ষক")]];return st.map(x=>`<div class="st-cn"><b>${bn(x[1])}</b><span class="pl" style="${UROLE_C[x[0]]}">${x[0]}</span></div>`).join("")}
function stUc(){const e=$("usc");if(e)e.innerHTML=stUcH()}
function stUlH(){return usAll().map(u=>{
 const scn=u.me?"":schNm(u.sid);
 const pill=(bg,c,t)=>`<span class="pl" style="background:${bg};color:${c}">${t}</span>`;
 const stat=u.remote?(u.status==="pending"?pill("#fef3c7","#b45309","⏳ অনুমোদনের অপেক্ষায়"):u.blocked?pill("#ffe4e9","#be123c","⛔ ব্লকড"):pill("#dcfce7","#15803d","✓ সক্রিয়")):((u.newOrg&&!u.me)?pill("#e0f2fe","#0369a1","📨 আমন্ত্রিত — নিবন্ধনের অপেক্ষায়"):u.blocked?pill("#ffe4e9","#be123c","⛔ ব্লকড"):pill("#dcfce7","#15803d","✓ সক্রিয়"));
 const gb="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:10px";
 let act;
 if(u.me)act='<div style="text-align:center;color:var(--mu);border-top:1px solid var(--ln);margin-top:10px;padding-top:6px">—</div>';
 else if(u.remote&&u.status==="pending")act=`<div style="${gb}"><button class="btn g" onclick="usStatR('${u.id}','approved')">অনুমোদন</button><button class="btn r" onclick="usStatR('${u.id}','blocked')">ব্লক</button></div>`;
 else if(u.remote&&u.blocked)act=`<div style="margin-top:10px"><button class="btn g" style="width:100%" onclick="usStatR('${u.id}','approved')">আনব্লক</button></div>`;
 else if(u.remote)act=`<div style="${gb}"><button class="btn o" style="color:var(--tx);border-color:var(--ln)" onclick="usRoleR('${u.id}')">⚙ পারমিশন ও পদবী</button><button class="btn r" onclick="usStatR('${u.id}','blocked')">ব্লক</button></div>`;
 else act=`<div style="${gb}"><button class="btn o" style="color:var(--tx);border-color:var(--ln)" onclick="usPerm('${u.id}',0)">⚙ পারমিশন ও পদবী</button><button class="btn ${u.blocked?"g":"r"}" onclick="usBlk('${u.id}')">${u.blocked?"আনব্লক":"ব্লক"}</button></div>`;
 if(!u.me)act+=`<div style="margin-top:8px"><button class="btn o" style="width:100%;color:#dc2626;border-color:#fca5a5" onclick="${u.remote?"usDelR":"usDel"}('${u.id}')">🗑 মুছুন</button></div>`;
 return `<div class="card"><div style="display:flex;gap:10px;align-items:center"><div class="av">👤</div><div style="flex:1;min-width:0"><b>${esc(u.name||u.email)}</b>${u.me?' <span style="color:#16a34a;font-size:12px">● আপনি</span>':""}<div style="font-size:12px;color:var(--mu);word-break:break-all">${esc(u.email||u.phone||"")}</div><div style="margin-top:4px">${u.roles.map(r=>`<span class="pl" style="${UROLE_C[r]||""}">${r}</span>`).join("")}${stat}</div>${scn?`<div style="font-size:12px;color:var(--mu)">🏛 ${esc(scn)}${(window._remSch&&window._remSch[String(u.sid)])?" · "+esc(subBadgeText(window._remSch[String(u.sid)])):""}</div>`:""}</div></div>${act}</div>`}).join("")||'<div class="em">কেউ পাওয়া যায়নি</div>'}
function stUl(){const e=$("usl");if(e)e.innerHTML=stUlH()}
function usBlk(id){const u=Store.invUsers.find(x=>x.id==id);if(!u||!confirm(u.blocked?"ইউজারকে আনব্লক করবেন?":"ইউজারকে ব্লক করবেন?"))return;u.blocked=u.blocked?0:1;save();stUl()}
function usInv(){modal(`<span onclick="closeM()" style="float:right;font-size:22px">×</span><h2>👤 নতুন ইউজার আমন্ত্রণ</h2><label class="lb">ইমেইল ঠিকানা *</label><input id="iv_e" type="email" placeholder="example@email.com"><label class="lb" style="color:#16a34a">💬 WhatsApp / মোবাইল নম্বর (ঐচ্ছিক)</label><input id="iv_p" type="tel" placeholder="01XXXXXXXXX"><div class="hint">দিলে আমন্ত্রণ বার্তা WhatsApp-এও পাঠানো যাবে।</div><label class="lb" style="color:#2563eb">📲 অ্যাপ লিংক — লগইন/সাইন আপ পেইজ</label><input id="iv_l" type="url" placeholder="https://..." value="${esc(loginLink())}"><div class="hint">এই লিংক স্বয়ংক্রিয়ভাবে বসেছে এবং আমন্ত্রণ বার্তায় যাবে; ইউজার লিংকে ক্লিক করলে সরাসরি লগইন/সাইন আপ পেইজ খুলবে।</div>
<label class="lb">ভূমিকা (একাধিক নির্বাচন করা যাবে)</label><div class="g2" style="margin-bottom:8px">${UROLES.map((r,i)=>`<label class="st-tg" style="margin:0"><input type="checkbox" id="iv_r${i}" style="width:auto;margin:0" ${r=="শিক্ষক"?"checked":""}>${r}</label>`).join("")}</div><div class="hint">একসাথে একাধিক ভূমিকা দিলে ঐ ব্যক্তি সবগুলো মডিউলে অ্যাক্সেস পাবেন।</div>
<label class="lb" style="color:var(--pri)">🏛 কোন প্রতিষ্ঠানে নিয়োগ হবে নির্বাচন করুন</label><select id="iv_s"><option value="">— নতুন প্রতিষ্ঠান (ইউজার নিজে তৈরি করবেন) —</option>${schAllR().map(x=>`<option value="${x.id}">${esc(x.name)}</option>`).join("")}</select>
<div class="hint" style="margin-bottom:6px;color:#0369a1">👑 "অ্যাডমিন" ভূমিকা দিয়ে প্রতিষ্ঠান খালি রাখলে ইউজার এই ইমেইলে নতুন অ্যাকাউন্ট খুলে নিজের প্রতিষ্ঠান প্রোফাইল তৈরি করবেন এবং Super Admin Tool ছাড়া বাকি সব পারমিশন পাবেন।</div><div class="hint" style="margin-bottom:10px">এখানে ইউজারের রেকর্ড তৈরি হয় এবং আমন্ত্রণ বার্তা আপনার WhatsApp বা ইমেইল অ্যাপে খোলে। পারমিশন পরে "পারমিশন ও পদবী" থেকে ঠিক করুন।</div><div style="display:flex;gap:8px;justify-content:flex-end"><button class="btn o" onclick="closeM()">বাতিল</button><button class="btn" onclick="usInvSend()">আমন্ত্রণ পাঠান</button></div>`)}
async function usInvSend(){const e=$("iv_e").value.trim().toLowerCase(),ph=$("iv_p").value.trim();if(!/^\S+@\S+\.\S+$/.test(e)){alert("সঠিক ইমেইল ঠিকানা দিন");return}if(Store.invUsers.some(u=>(u.email||"").toLowerCase()==e)){alert("এই ইমেইলে আগেই ইউজার আছে");return}
 const lk=$("iv_l").value.trim();if(lk&&!/^https?:\/\/\S+$/i.test(lk)){alert("সঠিক ডাউনলোড লিংক দিন (https:// দিয়ে শুরু)");return}if(lk&&lk!==loginLink())Store.school.appLink=lk;
 let rs=UROLES.filter((r,i)=>$("iv_r"+i).checked);if(!rs.length)rs=["সাধারণ ইউজার"];const pm={};PMK.forEach(k=>pm[k]=rs.some(r=>defPerm(r)[k]));
 const sidv=$("iv_s").value,newOrg=rs.includes(UROLES[0])&&!sidv;
 if(newOrg){
  if(!(await needSession()))return;
  try{const r=await sb.rpc("smartedu_invite_admin",{p_email:e});if(r.error||r.data!==true){alert("আমন্ত্রণ নিবন্ধন করা যায়নি: "+(r.error?r.error.message:"অনুমতি নেই"));return}}catch(x){alert("আমন্ত্রণ নিবন্ধন ব্যর্থ: "+x.message);return}
 }
 Store.invUsers.push({id:uid(),name:e.split("@")[0],email:e,phone:ph,roles:rs,sid:sidv,blocked:0,perms:pm,inv:today(),newOrg:newOrg?1:0});save();closeM();render();
 const msg=newOrg?"আসসালামু আলাইকুম, আপনাকে অ্যাপে অ্যাডমিন হিসেবে আমন্ত্রণ জানানো হয়েছে।"+(lk?"\n\n১) এই লিংকে ক্লিক করে অ্যাপ খুলুন (লগইন/সাইন আপ পেইজ):\n"+lk:"\n\n১) অ্যাপটি ইন্সটল করুন")+"\n২) সাইন আপ পেইজে এই ইমেইল ("+e+") ও পাসওয়ার্ড দিয়ে নতুন অ্যাকাউন্ট তৈরি করুন এবং ইমেইল কনফার্ম করুন\n৩) লগইন করে আপনার প্রতিষ্ঠানের প্রোফাইল তৈরি করুন।":"আসসালামু আলাইকুম, "+Store.school.name+" অ্যাপে আপনাকে "+rs.join(", ")+" হিসেবে যুক্ত করা হয়েছে।"+(lk?"\n\nঅ্যাপ খুলতে (লগইন/সাইন আপ) এই লিংকে ক্লিক করুন:\n"+lk:"");
 if(ph&&confirm("WhatsApp-এ আমন্ত্রণ বার্তা পাঠাবেন?"))openExt(waLink(ph,msg));else if(!ph&&confirm("ইমেইলে আমন্ত্রণ পাঠাবেন?"))openExt("mailto:"+e+"?subject="+encodeURIComponent("আমন্ত্রণ — "+Store.school.name)+"&body="+encodeURIComponent(msg))}
function usPerm(id,t){const u=Store.invUsers.find(x=>x.id==id);if(!u)return;umT=t;u.perms=u.perms||defPerm(u.roles[0]);
 const tabs=`<div class="st-tabs" style="margin:10px 0"><button class="${t==0?"on":""}" style="flex:1" onclick="usPerm('${id}',0)">পারমিশন</button><button class="${t==1?"on":""}" style="flex:1" onclick="usPerm('${id}',1)">প্রতিষ্ঠান প্রোফাইল</button></div>`;
 let body="";
 if(t==0)body=`<div class="card" style="margin:0 0 10px;background:var(--bg)"><small style="color:var(--mu)">ভূমিকা পরিবর্তন</small><select onchange="usRole('${id}',this.value)" style="margin:6px 0 0">${UROLES.map(r=>`<option ${u.roles[0]==r?"selected":""}>${r}</option>`).join("")}</select></div><div style="font-size:13px;color:var(--mu);margin-bottom:6px">মডিউল অ্যাক্সেস</div><div style="display:flex;gap:8px;margin-bottom:8px"><button class="btn o s" style="color:var(--tx);border-color:var(--ln)" onclick="pmAll('${id}',1)">সব অনুমোদন</button><button class="btn o s" style="color:var(--tx);border-color:var(--ln)" onclick="pmAll('${id}',0)">সব বাতিল</button></div>${PMOD.map(g=>`<div style="font-size:12px;color:var(--mu);margin:10px 0 6px">${g[0]}</div>${g[1].map(x=>`<div class="st-tg" onclick="pmT('${id}','${x[0]}',this)"><div style="flex:1;font-weight:600;font-size:14px">${x[1]}</div><div class="st-sw ${u.perms[x[0]]?"on":""}" data-k="${x[0]}"><i></i></div></div>`).join("")}`).join("")}<div style="background:#fff7ed;color:#c2410c;border-radius:8px;padding:8px 10px;font-size:12px;margin:10px 0">⚠️ ভূমিকা পরিবর্তন করলে ডিফল্ট অ্যাক্সেস বসে যাবে। পরে প্রয়োজনমতো আলাদা মডিউল চালু/বন্ধ করুন। এই অ্যাক্সেস তালিকা রেকর্ড হিসেবে সংরক্ষিত হয়; এই অফলাইন অ্যাপ নিজে থেকে ইউজার অনুযায়ী পেইজ আটকায় না।</div><div style="display:flex;gap:8px"><button class="btn o" style="flex:1;color:#dc2626;border-color:#fca5a5" onclick="usDel('${id}')">🗑 ইউজার মুছুন</button><button class="btn" style="flex:1" onclick="closeM()">বন্ধ করুন</button></div>`;
 else{const sc=schOf(u.sid)||{};body=`<b style="font-size:14px;color:var(--pri)">🏛 প্রতিষ্ঠান নিয়োগ ও প্রোফাইল</b><label class="lb">প্রতিষ্ঠান নির্বাচন করুন (Super Admin)</label><select id="up_s" onchange="upFill()"><option value="">— নির্বাচন করুন —</option>${schAll().map(x=>`<option value="${x.id}" ${u.sid==x.id?"selected":""}>${esc(x.name)}</option>`).join("")}</select><div class="hint" style="margin-bottom:8px">প্রতিষ্ঠান নির্বাচন করলে ইউজারের রেকর্ডে ঐ প্রতিষ্ঠান যুক্ত হবে।</div><div style="font-size:12px;color:var(--mu);margin:6px 0">প্রতিষ্ঠানের বিস্তারিত (প্রয়োজনে সম্পাদনা করুন)</div>${stF("প্রতিষ্ঠানের নাম","up_n",sc.name||"")}<label class="lb">ঠিকানা</label><textarea id="up_a" rows="2">${esc(sc.addr||"")}</textarea>${stF("ফোন নম্বর","up_p",sc.phone||"","tel")}${stF("ইমেইল","up_e",sc.email||"","email")}<div style="display:flex;gap:8px;justify-content:flex-end"><button class="btn o" onclick="closeM()">বাতিল</button><button class="btn" onclick="upSave('${id}')">সংরক্ষণ করুন</button></div>`}
 modal(`<span onclick="closeM()" style="float:right;font-size:22px">×</span><h2>🛡 অ্যাক্সেস পারমিশন নির্ধারণ</h2><div style="font-size:13px;color:var(--mu)">${esc(u.name||u.email)} <span class="pl" style="${UROLE_C[u.roles[0]]}">${u.roles.join(", ")}</span></div>`+tabs+body)}
function pmT(id,k,el){const u=Store.invUsers.find(x=>x.id==id);u.perms[k]=!u.perms[k];el.querySelector(".st-sw").classList.toggle("on",!!u.perms[k]);save()}
function pmAll(id,v){const u=Store.invUsers.find(x=>x.id==id);PMK.forEach(k=>u.perms[k]=!!v);document.querySelectorAll("#mt .st-sw[data-k]").forEach(e=>e.classList.toggle("on",!!v));save()}
function usRole(id,r){const u=Store.invUsers.find(x=>x.id==id);u.roles=[r];u.perms=defPerm(r);save();usPerm(id,0);stUl()}
function upFill(){const sc=schOf($("up_s").value)||{};$("up_n").value=sc.name||"";$("up_a").value=sc.addr||"";$("up_p").value=sc.phone||"";$("up_e").value=sc.email||""}
function upSave(id){const u=Store.invUsers.find(x=>x.id==id),sid=$("up_s").value;u.sid=sid;const n=$("up_n").value.trim(),a=$("up_a").value.trim(),ph=$("up_p").value.trim(),em=$("up_e").value.trim();
 if(sid=="main"){if(n)Store.school.name=n;Store.school.addr=a;Store.school.phone=ph;Store.school.email=em}else if(sid){const sc=Store.schools.find(x=>x.id==sid);if(sc){if(n)sc.name=n;sc.addr=a;sc.phone=ph;sc.email=em;pushSchoolToServer(sc.id,{name:sc.name,addr:a,phone:ph,est:sc.est})}}
 save();closeM();render()}
function usDel(id){if(!confirm("এই ইউজার মুছে ফেলবেন?"))return;Store.invUsers=Store.invUsers.filter(x=>x.id!=id);save();closeM();render()}
function stAcc(){return userPanel()}
function stSync(){return `<div class="card"><h2>অনলাইন সিঙ্ক</h2><p class="hint">API URL না দিলে অ্যাপ সম্পূর্ণ offline থাকবে। API URL দিলে অনলাইন হলে queue সিঙ্ক হবে।</p><input id="syncUrl" type="url" placeholder="https://example.com/api/sync" value="${esc(Store.sync?.apiUrl||"")}"><input id="syncKey" type="password" placeholder="ঐচ্ছিক legacy API key" value="${esc(getSyncApiKey())}"><button class="btn o s" onclick="saveSyncSettings()">সেটিংস সংরক্ষণ</button> <button class="btn g s" onclick="syncNow(true)">এখন সিঙ্ক করুন</button><hr><label class="lb">Backend JWT login</label><input id="serverUser" autocomplete="username" placeholder="admin@example.com" value="${esc(sessionStorage.getItem("smartEduServerUser")||"")}"><input id="serverTenant" placeholder="Institution slug (যেমন alpha-school)"><input id="serverPass" type="password" autocomplete="current-password" placeholder="Server password (সংরক্ষণ হবে না)"><button class="btn o s" onclick="serverLogin()">JWT login</button> ${getSyncToken()?'<button class="ob s" onclick="serverLogout()">JWT logout</button>':'<small style="color:var(--mu)">JWT token শুধু এই session-এ থাকবে</small>'}<small style="display:block;color:var(--mu);margin-top:6px">Queue: ${bn((Store.syncQueue||[]).length)} · Retry: ${Store.sync.nextRetryAt?new Date(Store.sync.nextRetryAt).toLocaleTimeString("bn-BD"):"প্রস্তুত"}</small></div>`}
const SUB_PLAN={name:"Standard",price:200,features:["শিক্ষার্থী ব্যবস্থাপনা","শিক্ষক ব্যবস্থাপনা","কর্মচারী ব্যবস্থাপনা","উপস্থিতি (শিক্ষার্থী ও শিক্ষক)","ফি ব্যবস্থাপনা ও রশিদ","পরীক্ষা ও ফলাফল","রিপোর্ট কার্ড","SMS/WhatsApp নোটিফিকেশন","লাইব্রেরি ব্যবস্থাপনা","প্রশ্নব্যাংক ও AI প্রশ্ন তৈরি","অভিভাবক পোর্টাল","আয়-ব্যয় ও হিসাব","নোটিশ বোর্ড","ব্যাকআপ ও নিরাপত্তা","একাধিক ব্যবহারকারী ও ভূমিকা","সকল প্রিমিয়াম ফিচার"]};
const SUB_PAY_NO="01918427848";
function addMonths(ds,n){const d=new Date(ds+"T00:00:00");d.setMonth(d.getMonth()+n);return d.getFullYear()+"-"+p2(d.getMonth()+1)+"-"+p2(d.getDate())}
function subInit(){
  Store.sub=Store.sub||{};
  Store.sub.payments=Store.sub.payments||[];
  Store.sub.reqs=Store.sub.reqs||[];
  if(!Store.sub.trialStart||!Store.sub.iid){Store.sub.trialStart=Store.sub.trialStart||today();Store.sub.iid=Store.sub.iid||(uid()+uid());save()}
}
function subDays(end){return Math.ceil((new Date(end+"T00:00:00")-new Date(today()+"T00:00:00"))/864e5)}
function srvCalc(r){const T=today(),tE=r.trial_end||"",pE=r.paid_end||"";return{k:(pE&&pE>=T)?"paid":(tE&&tE>=T)?"trial":"none",end:[tE,pE].sort().pop()||""}}
function subBadgeText(r){
  if(r.locked)return"🔒 ব্লকড";
  const c=srvCalc(r);
  if(c.k==="none")return"⛔ মেয়াদ শেষ"+(r.auto_block===false?" (অটো-ব্লক বন্ধ)":"");
  return(c.k==="trial"?"ফ্রি ট্রায়াল":"সক্রিয়")+" — "+bn(subDays(c.end))+" দিন বাকি";
}
async function subFetchSrv(){
  try{
    if(!sb||!navigator.onLine||isSuper())return false;
    const {data:{session}}=await sb.auth.getSession();if(!session)return false;
    const {data,error}=await sb.rpc("smartedu_my_school_status");
    if(error)return false;
    const r=Array.isArray(data)?data[0]:data;
    if(r&&r.school_id){subInit();Store.sub.srv={trial_end:r.trial_end||"",paid_end:r.paid_end||"",locked:!!r.locked,auto_block:r.auto_block!==false,at:Date.now()};save();return true}
  }catch(e){}
  return false;
}
function subLocked(){
  if(!activeUser||isSuper()||ACT_SID==="main")return false;
  const sr=Store.sub&&Store.sub.srv;if(!sr)return false;
  return !!sr.locked||(sr.auto_block!==false&&srvCalc(sr).k==="none");
}
function subLockView(){
  const sr=Store.sub.srv||{},st=srvCalc(sr),adm=activeUser&&activeUser.role==="admin";
  const why=sr.locked?"আপনার প্রতিষ্ঠানের অ্যাক্সেস Super Admin বন্ধ রেখেছেন।":"সাবস্ক্রিপশনের মেয়াদ শেষ হয়েছে ("+st.end+")।";
  return `<div class="login-box"><div class="login-card"><div style="font-size:42px">🔒</div><h1>${esc(Store.school.name||"")}</h1><p style="color:#dc2626;font-weight:600">${why}</p>${sr.locked?`<p>বিস্তারিত জানতে যোগাযোগ করুন: <b>${SUB_PAY_NO}</b></p>`:`<p>অ্যাপ আবার চালু করতে সাবস্ক্রিপশন নবায়ন করুন।<br>${money(SUB_PLAN.price)}/মাস — bKash / Nagad: <b>${SUB_PAY_NO}</b></p>${adm?`<button class="btn" style="width:100%;margin-bottom:8px" onclick="subRenew()">👑 নবায়ন অনুরোধ পাঠান</button>`:`<p style="font-size:12px;color:var(--mu)">নবায়নের জন্য প্রতিষ্ঠানের অ্যাডমিনকে জানান।</p>`}`}${subReqCards()}<button class="ob" style="width:100%;margin-top:8px" onclick="subLockRefresh()">🔄 স্ট্যাটাস রিফ্রেশ</button><button class="ob" style="width:100%;margin-top:8px" onclick="logout()">🚪 লগআউট</button></div></div>`;
}
async function subLockRefresh(){await subFetchSrv();await subSync();render()}
setInterval(async()=>{try{if(!unlocked||isSuper())return;const b=subLocked();await subFetchSrv();if(b!==subLocked())render()}catch(e){}},600000);
function subState(){
  subInit();
  if(Store.sub.srv&&ACT_SID!=="main"&&!isSuper())return srvCalc(Store.sub.srv);
  const T=today(),tEnd=addMonths(Store.sub.trialStart,1),pEnd=Store.sub.end||"";
  if(pEnd&&pEnd>=T)return{k:"paid",end:pEnd};
  if(tEnd>=T)return{k:"trial",end:tEnd};
  return{k:"none",end:pEnd>tEnd?pEnd:tEnd};
}
function subEffEnd(){return subState().end}
function stSub(){
  if(!window._subT||Date.now()-window._subT>15000){window._subT=Date.now();setTimeout(subSync,0)}
  const st=subState(),P=SUB_PLAN,bad=st.k==="none";
  const chk=f=>`<div style="display:flex;gap:6px;align-items:flex-start"><span style="color:var(--gr);font-weight:700">✔</span><span>${f}</span></div>`;
  const stTxt=st.k==="paid"?"সক্রিয় — মেয়াদ: "+st.end+" ("+bn(subDays(st.end))+" দিন বাকি)":st.k==="trial"?"ফ্রি ট্রায়াল চলছে — শেষ: "+st.end+" ("+bn(subDays(st.end))+" দিন বাকি)":"কোনো সক্রিয় সাবস্ক্রিপশন নেই";
  const hist=(Store.sub.payments||[]).length?`<div class="card"><h2 style="font-size:16px;margin-bottom:6px">পেমেন্টের ইতিহাস</h2>${Store.sub.payments.map(p=>`<div class="row"><div class="f"><b>${bn(p.months)} মাস — ${money(p.paid)}</b><small style="display:block;color:var(--mu)">${bn(fdt(p.date))} · ${esc(p.method)} · TXN ${esc(p.txn)}${p.note?" · "+esc(p.note):""}</small></div></div>`).join("")}</div>`:"";
  return `<div style="margin-bottom:12px"><h2 style="font-size:24px">সাবস্ক্রিপশন</h2><p style="font-size:13px;color:var(--mu)">আপনার প্ল্যান ও পেমেন্টের তথ্য দেখুন</p></div>
<button class="btn" style="margin-bottom:14px" onclick="subRenew()">＋ নবায়ন / পেমেন্ট</button>
${subReqCards()}
<div class="card" style="border:1px solid ${bad?"#ef444455":"#16a34a55"};background:${bad?"#ef444410":"#16a34a10"}">
 <div style="display:flex;align-items:center;gap:12px;margin-bottom:12px"><div style="width:44px;height:44px;border-radius:10px;background:${bad?"#ef444422":"#16a34a22"};display:flex;align-items:center;justify-content:center;font-size:22px">${bad?"⚠️":"✅"}</div><div style="flex:1"><div style="font-size:11px;color:var(--mu)">বর্তমান প্ল্যান</div><div style="font-size:20px;font-weight:700">${P.name}</div></div><div style="font-size:12px;text-align:right;max-width:45%">${stTxt}</div></div>
 <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px 12px;font-size:12px">${P.features.map(chk).join("")}</div>
</div>
<div style="display:flex;align-items:center;gap:10px;background:#16a34a14;border:1px solid #16a34a40;border-radius:12px;padding:12px;margin:14px 0"><div style="width:40px;height:40px;border-radius:10px;background:#16a34a22;display:flex;align-items:center;justify-content:center;font-size:20px">⏱</div><div><b style="color:var(--gr)">১ মাস ফ্রি ট্রায়াল!</b><div style="font-size:12px;color:var(--mu)">নতুন একাউন্টে প্রথম ১ মাস সম্পূর্ণ বিনামূল্যে সব ফিচার ব্যবহার করুন।</div></div></div>
<div style="font-size:14px;color:var(--mu);margin:16px 0 8px">প্ল্যান সমূহ</div>
<div class="card"><span class="pl" style="background:var(--pri);color:#fff">${P.name}</span><div style="font-size:30px;font-weight:800;color:var(--pri);margin:8px 0">${money(P.price)}<span style="font-size:13px;font-weight:400;color:var(--mu)">/মাস</span></div><div style="display:grid;gap:7px;font-size:13px">${P.features.map(chk).join("")}</div></div>
${hist}
<div class="card" style="background:#16a34a10"><div style="display:flex;gap:10px;align-items:flex-start"><span style="font-size:20px">💳</span><div><b>পেমেন্ট করতে যোগাযোগ করুন</b><div style="font-size:13px;margin-top:4px">bKash / Nagad: <b>${SUB_PAY_NO}</b></div><div style="font-size:12px;color:var(--mu)">পেমেন্টের পর TXN ID দিয়ে নবায়ন বাটনে ক্লিক করুন।</div></div></div></div>`;
}
function subRenew(){
  const P=SUB_PLAN;
  modal(`<div class="ch"><h2>👑 সাবস্ক্রিপশন নবায়ন</h2><span onclick="closeM()" style="font-size:24px">×</span></div>
<div style="display:flex;justify-content:space-between;background:#16a34a14;border:1px solid #16a34a40;border-radius:10px;padding:10px 12px;margin:10px 0"><span>${P.name} প্ল্যান</span><b style="color:var(--pri)">${money(P.price)}/মাস</b></div>
<label class="lb">মাসের সংখ্যা</label><select id="sb_m" onchange="subCalc()">${[1,2,3,6,12].map(n=>`<option value="${n}">${bn(n)} মাস — ${money(P.price*n)}</option>`).join("")}</select>
<div style="display:flex;justify-content:space-between;align-items:center;background:var(--bg);border-radius:10px;padding:10px 12px;margin:10px 0"><span>মোট পরিমাণ</span><b id="sb_t" style="color:var(--pri);font-size:18px">${money(P.price)}</b></div>
<label class="lb">পেমেন্ট পদ্ধতি</label><select id="sb_pm"><option>bKash</option><option>Nagad</option><option>Rocket</option><option>ব্যাংক</option><option>নগদ টাকা</option></select>
<label class="lb">ট্রানজেকশন আইডি (TXN) *</label><input id="sb_x" placeholder="যেমন: 8N4A7KXXXXX">
<label class="lb">পরিশোধিত পরিমাণ (ঐচ্ছিক)</label><input id="sb_p" type="number" placeholder="${money(P.price)}">
<label class="lb">নোট (ঐচ্ছিক)</label><input id="sb_n" placeholder="বিশেষ কোনো তথ্য...">
<div class="hint" style="margin-top:8px">অনুরোধ জমা দিলে তা পেন্ডিং থাকবে; Super Admin অনুমোদন করলে মেয়াদ বাড়বে।</div><button class="btn" style="width:100%;margin-top:8px" onclick="subConfirm()">✔ নবায়ন নিশ্চিত করুন</button>
<button class="btn o" style="width:100%;margin-top:8px" onclick="closeM()">বাতিল</button>`);
}
function subCalc(){const n=+$("sb_m").value;$("sb_t").textContent=money(SUB_PLAN.price*n);$("sb_p").placeholder=money(SUB_PLAN.price*n)}
function applyRenewal(r){
  if(r.applied)return;
  const T=today(),base=[T,Store.sub.end||"",addMonths(Store.sub.trialStart,1)].sort().pop();
  Store.sub.end=addMonths(base,r.months);
  r.status="approved";r.applied=true;r.approvedOn=T;
  Store.sub.payments.unshift({id:r.id,date:T,months:r.months,amount:r.amount,paid:r.paid,method:r.method,txn:r.txn,note:r.note||""});
}
async function subSync(){
  try{
    subInit();
    const pend=Store.sub.reqs.filter(r=>r.status==="pending");
    if(!pend.length||!sb||!navigator.onLine)return;
    const {data:{session}}=await sb.auth.getSession();
    if(!session)return;
    const {data,error}=await sb.rpc("smartedu_renewal_status",{ids:pend.map(r=>r.id)});
    if(error||!data)return;
    let ch=false;
    data.forEach(d=>{
      const r=Store.sub.reqs.find(x=>x.id===d.id);
      if(!r||r.status!=="pending")return;
      if(d.status==="approved"){applyRenewal(r);ch=true}
      else if(d.status==="rejected"){r.status="rejected";r.decidedOn=today();ch=true}
    });
    if(ch){save();render()}
  }catch(e){}
}
setTimeout(subSync,3000);
setInterval(subSync,300000);
function subReqCards(){
  subInit();
  return Store.sub.reqs.filter(r=>r.status==="pending"||(r.status==="rejected"&&r.decidedOn&&r.decidedOn>=dayOff(-14))).map(r=>{
    const pd=r.status==="pending";
    return `<div class="card" style="border:1px solid ${pd?"#f59e0b66":"#ef444455"};background:${pd?"#f59e0b14":"#ef444410"}"><div style="display:flex;gap:10px;align-items:flex-start"><span style="font-size:22px">${pd?"⏳":"❌"}</span><div><b>${pd?"নবায়ন অনুরোধ পেন্ডিং":"নবায়ন অনুরোধ বাতিল হয়েছে"}</b><div style="font-size:12px;color:var(--mu);margin-top:4px">${bn(r.months)} মাস · ${money(r.paid)} · ${esc(r.method)} · TXN ${esc(r.txn)}</div><div style="font-size:12px;margin-top:4px">${pd?"Super Admin অনুমোদন করলে মেয়াদ বাড়বে।":"বিস্তারিত জানতে Super Admin-এর সঙ্গে যোগাযোগ করুন।"}</div></div></div></div>`;
  }).join("");
}
async function subConfirm(){
  subInit();
  const n=+$("sb_m").value,x=$("sb_x").value.trim();
  if(x.length<6){alert("সঠিক ট্রানজেকশন আইডি (TXN) দিন");return}
  if(Store.sub.reqs.some(r=>String(r.txn).toLowerCase()===x.toLowerCase()&&r.status!=="rejected")||Store.sub.payments.some(p=>String(p.txn).toLowerCase()===x.toLowerCase())){alert("এই TXN আইডি আগেই ব্যবহার করা হয়েছে");return}
  if(!sb||!navigator.onLine){alert("নবায়নের অনুরোধ পাঠাতে ইন্টারনেট সংযোগ লাগবে।");return}
  const {data:{session}}=await sb.auth.getSession();
  if(!session){alert("নবায়নের অনুরোধ পাঠাতে ইমেইল লগইন করা থাকতে হবে। লগআউট করে ইমেইল লগইন ট্যাব দিয়ে ঢুকুন।");return}
  const amt=SUB_PLAN.price*n,paid=+$("sb_p").value||amt,m=$("sb_pm").value,note=$("sb_n").value.trim();
  try{
    const {data,error}=await sb.rpc("smartedu_submit_renewal",{p_inst_id:Store.sub.iid,p_inst_name:Store.school.name||"",p_months:n,p_amount:amt,p_paid:paid,p_method:m,p_txn:x,p_note:note});
    if(error){if(error.code==="23505"){alert("এই TXN আইডি দিয়ে আগেই অনুরোধ পাঠানো হয়েছে");return}throw error}
    Store.sub.reqs.unshift({id:data,months:n,amount:amt,paid,method:m,txn:x,note,date:today(),status:"pending",applied:false});
    save();closeM();render();
    alert("নবায়নের অনুরোধ পাঠানো হয়েছে। Super Admin অনুমোদন করলে মেয়াদ বাড়বে।");
  }catch(e){alert("অনুরোধ পাঠানো যায়নি: "+e.message)}
}
function renewBanner(){
  const p=window._renPend||[];
  if(!isSuper()||!p.length)return "";
  const names=[...new Set(p.map(x=>x.inst_name||"প্রতিষ্ঠান"))].join(", ");
  return `<div class="card" style="border:1px solid #f59e0b66;background:#f59e0b14;cursor:pointer" onclick="satT=5;render()"><b>📩 নবায়নের অনুরোধ এসেছে</b><div style="font-size:13px;margin-top:4px">${esc(names)} থেকে ${bn(p.length)}টি নবায়নের রিকোয়েস্ট এসেছে। দেখতে চাপুন।</div></div>`;
}
function stRen(){
  if(!isSuper())return `<div class="card"><p class="hint">শুধু Super Admin এই পেজ দেখতে পারবেন।</p></div>`;
  if(!window._renLoaded&&!window._renLoading){
    window._renLoading=true;
    refreshPending().then(()=>{window._renLoaded=true;window._renLoading=false;render()});
  }
  const L=window._renAll||[];
  const row=x=>`<div class="row" style="align-items:flex-start;flex-wrap:wrap"><div class="f"><b>${esc(x.inst_name||"প্রতিষ্ঠান")}</b><small style="display:block;color:var(--mu)">${esc(x.user_email||"")} · ${bn(x.months)} মাস · ${money(+x.paid||+x.amount)} (${money(+x.amount)}) · ${esc(x.method||"")}</small><small style="display:block;color:var(--mu)">TXN ${esc(x.txn)}${x.note?" · "+esc(x.note):""} · ${esc(String(x.created_at||"").slice(0,10))}</small></div>${x.status==="pending"?`<div style="display:flex;gap:6px"><button class="btn g s" onclick="renDecide('${x.id}',true)">অনুমোদন</button><button class="btn r s" onclick="renDecide('${x.id}',false)">বাতিল</button></div>`:`<span class="pl">${x.status==="approved"?"✓ অনুমোদিত":"✗ বাতিল"}</span>`}</div>`;
  return `<div class="card"><div class="ch"><h2>📩 নবায়ন অনুরোধ</h2><button class="ob s" onclick="window._renLoaded=false;render()">🔄 রিফ্রেশ</button></div><p class="hint" style="margin:6px 0">অনুমোদন দিলে শুধু ওই প্রতিষ্ঠানের মেয়াদ বাড়বে। প্রতিষ্ঠান ইন্টারনেটে অ্যাপ খুললে মেয়াদ হালনাগাদ হবে।</p>${L.length?L.map(row).join(""):'<div class="em">কোনো অনুরোধ নেই</div>'}</div>`;
}
async function renDecide(id,ok){
  if(!isSuper())return;
  if(!confirm(ok?"এই নবায়ন অনুমোদন করবেন? ওই প্রতিষ্ঠানের মেয়াদ বাড়বে।":"এই অনুরোধ বাতিল করবেন?"))return;
  try{
    if(!(await needSession()))return;
    const {data,error}=await sb.rpc("smartedu_decide_renewal",{rid:id,approve:ok});
    if(error)throw error;
    if(data!==true)alert("অবস্থা পরিবর্তন করা যায়নি (আগেই সিদ্ধান্ত হয়ে থাকতে পারে)।");else if(ok)await subExtendFromRenewal(id);
    window._renLoaded=false;
    await refreshPending();
    render();
  }catch(e){alert("ব্যর্থ: "+e.message)}
}
function stBk(){
 const n=Store.students.length+Store.teachers.length+Store.staff.length+Store.fees.length+Store.books.length+Store.exams.length,kb=Math.round(JSON.stringify(Store.raw).length/1024),lb=Store.set.lastBk?new Date(Store.set.lastBk).toLocaleString(LC()):"এখনও নেওয়া হয়নি";
 return `<div class="card"><h2>🗄 ব্যাকআপ ও রিস্টোর</h2><p style="font-size:13px;color:var(--mu);margin:6px 0 10px">তথ্য এই ফোনে থাকে এবং ইন্টারনেট থাকলে স্বয়ংক্রিয়ভাবে ক্লাউডেও জমা হয়। তবুও নিয়মিত ব্যাকআপ নিন।</p><div class="st-kv"><span>🕒</span><div><small>সর্বশেষ ব্যাকআপ</small>${lb}</div></div><div class="st-kv"><span>📦</span><div><small>মোট রেকর্ড / আকার</small>${bn(n)} টি · প্রায় ${bn(kb)} KB</div></div><div class="st-kv"><span>☁️</span><div><small>ক্লাউড সিঙ্ক (Supabase)</small>${snapStatusText()}</div></div><button class="btn g" style="width:100%;margin-top:8px" onclick="snapNow()">☁️ এখনই সিঙ্ক করুন</button>${isAdm()?`<button class="btn o" style="width:100%;margin-top:8px" onclick="histOpen()">🕘 ক্লাউড ইতিহাস থেকে ফেরান</button>`:""}</div>
<div class="card"><button class="btn g" style="width:100%;margin-bottom:8px" onclick="exp();setTimeout(render,800)">⬇ ব্যাকআপ নিন</button><button class="btn o" style="width:100%;margin-bottom:8px" onclick="secureBackup()">🔒 Encrypted backup</button><button class="btn o" style="width:100%;margin-bottom:8px" onclick="pickRestore()">📂 ফাইল থেকে রিস্টোর</button><button class="btn o" style="width:100%" onclick="pasteImp()">📋 টেক্সট পেস্ট করে রিস্টোর</button><input id="rf" type="file" accept=".json,application/json,text/plain" style="position:absolute;left:-9999px;width:1px;height:1px;opacity:0" onchange="imp(this.files[0]);this.value=''"><div class="hint" style="margin-top:8px">রিস্টোর করলে বর্তমান সব তথ্য ব্যাকআপের তথ্য দিয়ে বদলে যাবে। ব্যাকআপে PIN সেটিংসও থাকে।</div></div>`}
