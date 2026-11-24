/* সব শ্রেণির পরীক্ষার রুটিন একসাথে (এক টেবিলে: তারিখ × শ্রেণি/সেশন)। আলাদা শ্রেণির রুটিন আগের ফরম্যাটেই (xtPdf) থাকে। */
const XT_RULES=["পরীক্ষা শুরু হওয়ার ২০ মিনিট পূর্বে হলে প্রবেশ করতে হবে।","কলম, বোর্ড ও পরীক্ষার প্রয়োজনীয় আসবাব ব্যতিত অন্য কিছু সঙ্গে আনবে না।","প্রতিষ্ঠানের নির্ধারিত পোষাক পরিধান করে হলে প্রবেশ করবে।","পরীক্ষার হলে কোন অভিভাবক প্রবেশ করতে পারবে না।","পরীক্ষা চলাকালীন কোন অবৈধ কার্যক্রম পরিলক্ষিত হলে কর্তৃপক্ষের যে কোন সিদ্ধান্ত মানতে বাধ্য থাকবে।"];
const xtSess=e=>{const h=parseInt(String(e.start||"").split(":")[0]);return isNaN(h)?"":(h<12?"সকাল":"বিকাল")};
const xtDay=d=>{try{return new Date(d+"T00:00:00").toLocaleDateString("bn-BD",{weekday:"long"})}catch(_){return ""}};
function xtAllHtml(name,cls,title,rules){
 const ps=Store.exams.filter(e=>e.name==name&&cls.includes(e.cls)&&e.date),dates=[...new Set(ps.map(e=>e.date))].sort(),cols=[],hd=[],sc=Store.school||{};
 cls.forEach(c=>{const ss=[...new Set(ps.filter(e=>e.cls==c).map(xtSess))].sort((a,b)=>(a=="সকাল"?0:1)-(b=="সকাল"?0:1));const L=ss.length?ss:[""];L.forEach(s=>cols.push({c,s}));hd.push({c,L,one:L.length==1&&L[0]===""})});
 const two=cols.some(x=>x.s),B="border:1px solid #000",th=`${B};background:#efefef;font-weight:700;text-align:center;font-size:13px;padding:`,td=`${B};padding:6px 3px;text-align:center;font-size:13px;height:32px;word-break:break-word`;
 /* rowspan ব্যবহার নেই (PDF-এ লেখা কেটে যেত); দুই সারির হেডার জোড়া দেখানো হয় বর্ডার সরিয়ে */
 const top=`${th}10px 3px 2px;border-bottom:0`,bot=`${th}2px 3px 10px;border-top:0`,flat=`${th}8px 3px`;
 const r1=`<th style="${two?top:flat};width:13%">তারিখ</th><th style="${two?top:flat};width:10%">বার</th>`+hd.map(h=>h.one?`<th style="${two?top:flat}">${esc(h.c)}</th>`:`<th style="${flat}" colspan="${h.L.length}">${esc(h.c)}</th>`).join("");
 const r2=two?`<tr><th style="${bot}">&nbsp;</th><th style="${bot}">&nbsp;</th>${hd.map(h=>h.one?`<th style="${bot}">&nbsp;</th>`:h.L.map(s=>`<th style="${flat}">${s}</th>`).join("")).join("")}</tr>`:"";
 const rows=dates.map(d=>`<tr><td style="${td}">${bn(d)}</td><td style="${td}">${esc(xtDay(d))}</td>${cols.map(x=>{const v=ps.filter(e=>e.date==d&&e.cls==x.c&&xtSess(e)==x.s).map(e=>esc(e.subject)).join(", ");return `<td style="${td}">${v||"—"}</td>`}).join("")}</tr>`).join("");
 const lg=sc.logo?`<img src="${safeDataImage(sc.logo)}" style="width:64px;height:64px;border-radius:50%;object-fit:cover">`:`<div style="width:64px;height:64px"></div>`,ic=`${B};padding:4px 6px;font-size:12px;font-weight:700`;
 const rl=String(rules||"").split("\n").map(x=>x.trim()).filter(Boolean);
 return `<div style="border:2px solid #000;padding:14px 18px;background:#fff;color:#000"><div style="display:flex;align-items:center;justify-content:space-between;gap:10px">${lg}<div style="text-align:center;flex:1"><div style="font-size:26px;font-weight:700;line-height:1.3">${esc(sc.name||"")}</div>${sc.nameEn?`<div style="font-size:14px;font-weight:700">${esc(sc.nameEn)}</div>`:""}${sc.addr?`<div style="font-size:12px;margin-top:2px">${esc(sc.addr)}</div>`:""}</div>${lg}</div>
<table style="width:100%;border-collapse:collapse;margin-top:8px;table-layout:fixed"><tr><td style="${ic}">পরিচালক: ${esc(sc.director||"—")}</td><td style="${ic};text-align:center">স্থাপিত: ${esc(sc.est||"—")} ইং | শিক্ষাবর্ষ: ${esc(sc.year||"—")} ইং</td><td style="${ic};text-align:right">মোবাইল: ${esc(sc.phone||"—")}</td></tr></table>
<div style="text-align:center;margin:10px 0 6px"><span style="display:inline-block;border:1.5px solid #000;border-radius:6px;padding:5px 18px;font-size:15px;font-weight:700">${esc(title)}</span></div>`+
 (dates.length?`<table style="width:100%;border-collapse:collapse;table-layout:fixed"><tr>${r1}</tr>${r2}${rows}</table>`:`<div class="em">কোনো তারিখসহ পরীক্ষা নেই</div>`)+
 (rl.length?`<div style="margin-top:10px;font-size:11.5px;line-height:1.75"><div style="font-weight:700;font-size:13px;text-decoration:underline">পরীক্ষার্থীদের জন্য বিশেষ নির্দেশিকা:</div>${rl.map(x=>"➤ "+esc(x)).join("<br>")}</div><div style="text-align:right;margin-top:6px"><span style="display:inline-block;border-top:1px solid #000;padding:2px 14px;font-weight:700;font-size:13px">পরীক্ষা নিয়ন্ত্রক</span></div>`:"")+`</div>`}
/* সরাসরি A4 ল্যান্ডস্কেপ, এক পেজের PDF */
async function xtPdfLand(html,fn){let w=null;
 if(!navigator.onLine&&!(await libsReady())){toast("ইন্টারনেট নেই — প্রিন্টযোগ্য ফাইল তৈরি হচ্ছে");return htmlShare(fn,`<style>@page{size:A4 landscape;margin:8mm}</style>`+html)}
 toast("⏳ PDF তৈরি হচ্ছে…",1);
 /* অ্যাপের মোবাইল-জুম থাকলে html2canvas-এ শব্দের ফাঁক ভেঙে যায় — অন্য PDF-এর মতোই জুম সরিয়ে রেন্ডার করি */
 window._pdfBusy=true;document.documentElement.style.zoom="";
 try{for(const u of PDF_LIBS)await loadLib(u);
  w=document.createElement("div");w.style.cssText="position:fixed;left:-10000px;top:0;width:1122px;background:#fff;color:#000;padding:16px;box-sizing:border-box;font-family:sans-serif";w.innerHTML=html;document.body.appendChild(w);
  await Promise.all([...w.querySelectorAll("img")].map(i=>i.complete?1:new Promise(r=>{i.onload=i.onerror=r})));await new Promise(r=>setTimeout(r,350));
  const cv=await html2canvas(w,{scale:3,backgroundColor:"#fff",useCORS:true,windowWidth:1122,scrollX:0,scrollY:0}),pdf=new window.jspdf.jsPDF({orientation:"landscape",unit:"mm",format:"a4"}),W=297,H=210,m=6,k=Math.min((W-2*m)/cv.width,(H-2*m)/cv.height),pw=cv.width*k,ph=cv.height*k;
  pdf.addImage(cv.toDataURL("image/jpeg",.95),"JPEG",(W-pw)/2,m,pw,ph);toastOff();await savePdf(pdf,fn+"-"+today()+".pdf")}
 catch(e){toastOff();toast("PDF তৈরি করা যায়নি — প্রিন্টযোগ্য ফাইল শেয়ার হচ্ছে");htmlShare(fn,`<style>@page{size:A4 landscape;margin:8mm}</style>`+html)}
 finally{if(w)w.remove();window._pdfBusy=false;try{fitMobileZoom()}catch(_){}}}
function xtAllOpen(){const names=[...new Set(Store.exams.map(e=>e.name))].filter(Boolean);if(!names.length)return alert("আগে পরীক্ষা তৈরি করুন");
 const cur=(typeof xtKey==="string"&&xtKey.includes("|"))?xtKey.slice(xtKey.indexOf("|")+1):names[0],nm=names.includes(cur)?cur:names[0];
 modal(`<h3>🗂 সব শ্রেণির রুটিন একসাথে</h3><div>পরীক্ষা<select id="xa_n" style="width:100%;padding:10px" onchange="xtAllCls()">${names.map(n=>`<option${n==nm?" selected":""}>${esc(n)}</option>`).join("")}</select></div><div style="margin-top:8px">শ্রেণি বাছুন<div id="xa_c"></div></div><div style="margin-top:8px">শিরোনাম<input id="xa_t" style="width:100%;padding:10px"></div><div style="margin-top:8px">নির্দেশিকা (প্রতি লাইনে একটি; খালি = বাদ)<textarea id="xa_r" rows="5" style="width:100%;padding:10px">${esc(XT_RULES.join("\n"))}</textarea></div><div style="display:flex;gap:8px;flex-wrap:wrap;justify-content:flex-end;margin-top:12px"><button class="btn o" onclick="closeM()">বাতিল</button><button class="btn o" onclick="xtAllGo('p')">📄 সাধারণ PDF</button><button class="btn o" onclick="xtAllGo(1)">🖨 HTML প্রিন্ট</button><button class="btn" onclick="xtAllGo('l')">🖼 ল্যান্ডস্কেপ PDF (১ পেজ)</button></div>`);xtAllCls()}
function xtAllCls(){const n=$("xa_n").value,cs=[...new Set(Store.exams.filter(e=>e.name==n).map(e=>e.cls))],ord=allCls(),sorted=[...ord.filter(c=>cs.includes(c)),...cs.filter(c=>!ord.includes(c))];
 $("xa_c").innerHTML=sorted.map(c=>`<label style="display:inline-block;margin:4px 10px 4px 0"><input type="checkbox" class="xa_k" value="${esc(c)}" checked> ${esc(c)}</label>`).join("");$("xa_t").value=n+" — পরীক্ষার রুটিন"}
function xtAllGo(land){const n=$("xa_n").value,cls=[...document.querySelectorAll(".xa_k:checked")].map(e=>e.value);if(!cls.length)return alert("অন্তত একটি শ্রেণি বাছুন");
 const h=xtAllHtml(n,cls,$("xa_t").value,$("xa_r").value);closeM();if(land==="p")printDoc("exam-routine-all",h);else if(land===1)htmlShare("exam-routine-all",`<style>@page{size:A4 landscape;margin:8mm}</style>`+h);else xtPdfLand(h,"exam-routine-all")}
(function(){const o=xt;window.xt=function(){return o.apply(this,arguments).replace('<button class="ob" onclick="xtPdf()">','<button class="ob" onclick="xtAllOpen()">🗂 সব শ্রেণি একসাথে</button><button class="ob" onclick="xtPdf()">')}})();
