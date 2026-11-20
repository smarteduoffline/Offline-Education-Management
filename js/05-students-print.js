/* ---- PDF অপশন: রঙিন / সাদা-কালো + পেইজ নির্বাচন ---- */
const pdfSet=J=>J.gray&&J.bw?J.bw:J.col;
function pdfOpts(){
 const J=window._pdfJob;if(!J)return;
 modal(HND+`<h2 style="text-align:center;font-size:16px;margin-bottom:10px">PDF অপশন</h2>
 <label class="lb">রঙ</label><div class="seg"><button id="pdfC0" onclick="pdfGray(0)">🎨 রঙিন</button><button id="pdfC1" onclick="pdfGray(1)">⚫ সাদা-কালো</button></div>
 <div style="display:flex;justify-content:space-between;align-items:center;gap:8px"><label class="lb" style="margin:0">পেইজ — মোট ${bn(J.col.pages.length)} টি</label><span style="display:flex;gap:6px"><button class="ob" style="padding:4px 10px;font-size:12px" onclick="pdfAll(1)">সব</button><button class="ob" style="padding:4px 10px;font-size:12px" onclick="pdfAll(0)">কিছুই না</button></span></div>
 <div id="pdfPg" style="display:flex;gap:8px;overflow-x:auto;padding:10px 2px"></div>
 ${J.col.sc<1.6?`<div class="hint" style="margin:0 0 6px">⚠ বড় ডকুমেন্ট — লেখা কিছুটা ঝাপসা হতে পারে। তীক্ষ্ণ লেখার জন্য নিচের সিস্টেম প্রিন্ট ব্যবহার করুন।</div>`:""}<button class="ob" style="width:100%;margin:0 0 8px" onclick="pdfVector()">🖨 সিস্টেম প্রিন্ট (তীক্ষ্ণ টেক্সট PDF)</button>
 <div class="bt"><button class="btn o" onclick="pdfCancel()">বাতিল</button><button class="btn" id="pdfGo" onclick="pdfGo()">⬇ PDF তৈরি করুন</button></div>`);
 $("mt").onclick=null;pdfDraw();
}
function pdfDraw(){
 const J=window._pdfJob;if(!J)return;
 const c0=$("pdfC0"),c1=$("pdfC1");if(c0)c0.className=J.gray?"":"on";if(c1)c1.className=J.gray?"on":"";
 const A=pdfSet(J),box=$("pdfPg");
 if(box)box.innerHTML=A.pages.map((p,i)=>`<div class="pgc ${J.sel[i]?"on":""}" onclick="pdfTog(${i})">${J.sel[i]?"<i>✓</i>":""}<img src="${p.th}" style="filter:${J.gray?"grayscale(1)":"none"}"><b>${bn(i+1)}</b></div>`).join("");
 const n=J.sel.filter(Boolean).length,go=$("pdfGo");
 if(go){go.disabled=!n||J.busy;go.style.opacity=(n&&!J.busy)?"1":".5";go.textContent=J.busy?"⏳ অপেক্ষা করুন…":"⬇ PDF তৈরি করুন ("+bn(n)+" পেইজ)"}
}
async function pdfGray(g){
 const J=window._pdfJob;if(!J||J.busy)return;
 if(!g){J.gray=false;pdfDraw();return}
 if(!J.bw){
  J.busy=true;J.gray=true;pdfDraw();
  try{J.bw=await pdfRender(J.body,true);if(J.bw.pages.length!=J.sel.length)J.sel=J.bw.pages.map(()=>true)}
  catch(e){J.gray=false;toast("সাদা-কালো তৈরি করা যায়নি")}
  J.busy=false;
  if(window._pdfJob!==J)return;
 }else J.gray=true;
 pdfDraw();
}
function pdfVector(){
 const J=window._pdfJob;if(!J)return;const bw=J.gray,body=J.body;
 window._pdfJob=null;closeM();
 ["printRoot","printRootCss"].forEach(i=>{const o=document.getElementById(i);if(o)o.remove()});
 const r=document.createElement("div");r.id="printRoot";r.innerHTML=body;
 const st=document.createElement("style");st.id="printRootCss";
 st.textContent='#printRoot{display:none}@media print{@page{size:A4;margin:10mm}html,body{background:#fff!important;height:auto!important;overflow:visible!important}body>*:not(#printRoot){display:none!important}#printRoot{display:block!important;width:100%;color:#111;font-family:sans-serif}#printRoot table{border-collapse:collapse;width:100%}#printRoot tr{page-break-inside:avoid}#printRoot *{-webkit-print-color-adjust:exact;print-color-adjust:exact}'+(bw?'#printRoot,#printRoot *{background-color:#fff!important;color:#111!important;-webkit-text-fill-color:#111!important;border-color:#555!important;box-shadow:none!important;text-shadow:none!important}#printRoot [style*="gradient"]{background-image:none!important}#printRoot img{filter:grayscale(1)!important}':'')+'}';
 document.head.appendChild(st);document.body.appendChild(r);
 setTimeout(()=>{try{window.print()}catch(e){toast("এই ডিভাইসে সিস্টেম প্রিন্ট চালু করা যায়নি")}},200);
}
function pdfTog(i){const J=window._pdfJob;if(!J)return;J.sel[i]=!J.sel[i];pdfDraw()}
function pdfAll(on){const J=window._pdfJob;if(!J)return;J.sel=J.sel.map(()=>!!on);pdfDraw()}
function pdfCancel(){window._pdfJob=null;closeM()}
async function pdfGo(){
 const J=window._pdfJob;if(!J||J.busy||!J.sel.some(Boolean))return;
 const A=pdfSet(J);
 closeM();toast("⏳ PDF তৈরি হচ্ছে…",1);
 try{
  await new Promise(r=>setTimeout(r,60));
  const {jsPDF}=window.jspdf,pdf=new jsPDF({unit:"pt",format:"a4",compress:true});let first=true;
  for(let i=0;i<A.pages.length;i++){
   if(!J.sel[i])continue;
   const {y,end}=A.pages[i],cv=A.cv,pc=document.createElement("canvas");pc.width=cv.width;pc.height=Math.ceil(end-y);
   const g=pc.getContext("2d");g.fillStyle="#fff";g.fillRect(0,0,pc.width,pc.height);g.drawImage(cv,0,y,cv.width,end-y,0,0,cv.width,end-y);
   if(J.gray){const d=g.getImageData(0,0,pc.width,pc.height),a=d.data;for(let k=0;k<a.length;k+=4){const l=.299*a[k]+.587*a[k+1]+.114*a[k+2];a[k]=a[k+1]=a[k+2]=l}g.putImageData(d,0,0)}
   if(!first)pdf.addPage();first=false;
   pdf.addImage(pc.toDataURL("image/jpeg",.9),"JPEG",0,0,A.PW,(end-y)*A.PW/cv.width);
   await new Promise(r=>setTimeout(r,0));
  }
  const fn=J.fn;window._pdfJob=null;toastOff();await savePdf(pdf,fn);
 }catch(e){window._pdfJob=null;toastOff();alert("PDF তৈরি করা যায়নি: "+(e.message||e))}
}
async function savePdf(pdf,fn){
 const C=window.Capacitor,P=C&&C.Plugins,native=!!(C&&(C.isNativePlatform?C.isNativePlatform():(C.getPlatform&&C.getPlatform()!="web")));
 if(native&&P&&P.Filesystem){
  const b64=pdf.output("datauristring").split("base64,")[1];
  try{
   try{await P.Filesystem.requestPermissions()}catch(e){}
   const r=await P.Filesystem.writeFile({path:"MadrasaApp/"+fn,data:b64,directory:"DOCUMENTS",recursive:true});
   window._pdfUri=r.uri;
   modal(`<div style="text-align:center;padding:8px 0"><div style="font-size:42px">✅</div><h2 style="margin:6px 0">PDF ডাউনলোড হয়েছে</h2><small style="color:var(--mu)">ফাইল: Documents/MadrasaApp/${esc(fn)}</small><div style="font-size:10px;color:var(--mu);margin-top:4px">মোড: অ্যাপ</div></div><div class="g2" style="margin:10px 0 0"><button class="btn o" onclick="closeM()">বন্ধ</button><button class="btn" onclick="sharePdf()">খুলুন / শেয়ার</button></div>`);
   return;
  }catch(e){
   if(P.Share){try{const r=await P.Filesystem.writeFile({path:fn,data:b64,directory:"CACHE"});await P.Share.share({title:fn,url:r.uri,dialogTitle:"PDF সেভ করুন"});return}catch(e2){if(e2&&/cancel/i.test(e2.message||""))return}}
   alert("PDF সেভ করা যায়নি: "+(e.message||e));return;
  }
 }
 const blob=pdf.output("blob"),url=URL.createObjectURL(blob);window._pdfBlob=blob;window._pdfName=fn;
 modal(`<div style="text-align:center;padding:8px 0"><div style="font-size:42px">📄</div><h2 style="margin:6px 0">PDF প্রস্তুত</h2><small style="color:var(--mu)">${esc(fn)}</small></div>
 <a class="btn" style="display:block;text-align:center;text-decoration:none;margin-bottom:8px" href="${url}" download="${esc(fn)}">⬇ ডাউনলোড করুন</a>
 <button class="btn g" style="width:100%;margin-bottom:8px" onclick="shareBlob()">📤 শেয়ার / সেভ করুন</button>
 <a class="btn o" style="display:block;text-align:center;text-decoration:none;margin-bottom:8px" href="${url}" target="_blank" rel="noopener">🔗 নতুন ট্যাবে খুলুন</a>
 <button class="btn o" style="width:100%" onclick="closeM()">বন্ধ</button><div style="font-size:10px;color:var(--mu);text-align:center;margin-top:6px">মোড: ব্রাউজার</div>`);
}
async function shareBlob(){const f=new File([window._pdfBlob],window._pdfName,{type:"application/pdf"});try{if(navigator.canShare&&navigator.canShare({files:[f]})){await navigator.share({files:[f],title:window._pdfName});return}alert("এই ডিভাইসে শেয়ার সমর্থিত নয়। ডাউনলোড বাটন ব্যবহার করুন।")}catch(e){if(e&&e.name!="AbortError")alert("শেয়ার করা যায়নি: "+e.message)}}
async function sharePdf(){try{await Capacitor.Plugins.Share.share({url:window._pdfUri,dialogTitle:"PDF খুলুন / শেয়ার করুন"})}catch(e){if(!(e&&/cancel/i.test(e.message||"")))alert("ফাইলটি Files অ্যাপের Documents/MadrasaApp ফোল্ডারে আছে")}}
const schHdr=t=>pdfHdr(t);
function stuPdf(){
 const l=targets().slice().sort(byRollCls),d=new Date();
 printDoc("students-list",`<style>.ptb td,.ptb th{border:1px solid #b9e6cd;font-size:11px;padding:5px 5px}.ptb th{color:#666;font-weight:500}</style>${schHdr("শিক্ষার্থী ব্যবস্থাপনা")}<div style="text-align:center;font-size:11px;color:#555;margin-bottom:10px">তারিখ: ${bn(p2(d.getDate())+"/"+p2(d.getMonth()+1)+"/"+d.getFullYear())} · মোট ${bn(l.length)} জন</div><table class="ptb" style="border:1px solid #1d4ed8"><tr>${["নাম","রোল","শ্রেণি","শাখা","লিঙ্গ","অভিভাবক","মোবাইল","ঠিকানা","অবস্থা"].map(h=>`<th>${h}</th>`).join("")}</tr>${l.map(s=>`<tr><td>${esc(s.name)}</td><td>${esc(s.roll)}</td><td>${esc(s.cls)}</td><td>${esc(s.branch||"")}</td><td>${esc(s.gender||"")}</td><td>${esc(s.guardian||"")}</td><td>${esc(s.phone||"")}</td><td>${esc(s.addr||"")}</td><td>${esc(s.status||"সক্রিয়")}</td></tr>`).join("")}</table>`);
}
let profId="",profTab="info",txY=new Date().getFullYear(),txP=1,txM=true,arS={},cardCtx={},mctx={ids:[],sel:{},done:{},txt:""};
const MT="প্রিয় অভিভাবক,\n\nআপনার সন্তান {নাম} (শ্রেণি: {শ্রেণি})-এর বিষয়ে একটি গুরুত্বপূর্ণ তথ্য জানাতে চাই।\n\nধন্যবাদ\n";
const GP=p=>p>=80?5:p>=70?4:p>=60?3.5:p>=50?3:p>=40?2:p>=33?1:0;
const openExt=u=>{const a=document.createElement("a");a.href=u;a.target="_blank";a.rel="noopener";document.body.appendChild(a);a.click();a.remove()};
function waLink(ph,t){let d=String(ph||"").replace(/\D/g,"");if(d.startsWith("0"))d="88"+d;return "https://wa.me/"+d+"?text="+encodeURIComponent(t)}
function sendTo(x,ch,tx,ty){S.smslog.unshift({t:Date.now(),sid:x.id,ch,tx:smsTx(tx),ty:ty||(/বকেয়া/.test(tx)?"বকেয়া":"")});S.smslog=S.smslog.slice(0,SMS_KEEP);save();if(ch=="wa")openExt(waLink(x.phone,tx));else location.href="sms:"+x.phone+"?body="+encodeURIComponent(tx)}
const fillT=(t,x)=>t.replace(/\{ফল:([^}]+)\}/g,(m,n)=>smRes(x,n)).replace(/\{নাম\}/g,x.name).replace(/\{শ্রেণি\}/g,x.cls||"").replace(/\{বকেয়া\}/g,money(S.fees.filter(f=>f.sid==x.id).reduce((a,f)=>a+(f.amt-f.paid),0)));
const pill=(t,k)=>`<span class="pl ${k||""}">${t}</span>`;

/* ---- QR (byte mode, ECC M, v1-10) ---- */
function qrSvg(text,px){
 const enc=new TextEncoder().encode(text),ECC=[10,16,26,18,24,16,18,22,22,26],NB=[1,1,1,2,2,4,4,4,5,5];
 const raw=v=>{let r=(16*v+128)*v+64;if(v>=2){const n=Math.floor(v/7)+2;r-=(25*n-10)*n-55;if(v>=7)r-=36}return r};
 let v=1;for(;v<=10;v++){if(4+(v<10?8:16)+enc.length*8<=(Math.floor(raw(v)/8)-ECC[v-1]*NB[v-1])*8)break}
 if(v>10)return "";
 const nb=NB[v-1],el=ECC[v-1],rc=Math.floor(raw(v)/8),cap=rc-el*nb,bits=[],put=(x,n)=>{for(let i=n-1;i>=0;i--)bits.push((x>>>i)&1)};
 put(4,4);put(enc.length,v<10?8:16);enc.forEach(b=>put(b,8));
 for(let i=0;i<4&&bits.length<cap*8;i++)bits.push(0);while(bits.length%8)bits.push(0);
 for(let pd=0xEC;bits.length<cap*8;pd^=0xEC^0x11)put(pd,8);
 const dat=[];for(let i=0;i<bits.length;i+=8){let b=0;for(let j=0;j<8;j++)b=b<<1|bits[i+j];dat.push(b)}
 const mul=(x,y)=>{let z=0;for(let i=7;i>=0;i--){z=(z<<1)^((z>>>7)*0x11D);z^=((y>>>i)&1)*x}return z};
 const div=Array(el-1).fill(0).concat([1]);let root=1;
 for(let i=0;i<el;i++){for(let j=0;j<el;j++){div[j]=mul(div[j],root);if(j+1<el)div[j]^=div[j+1]}root=mul(root,2)}
 const rem=d=>{const r=Array(el).fill(0);for(const b of d){const f=b^r.shift();r.push(0);div.forEach((c,i)=>r[i]^=mul(c,f))}return r};
 const sl=Math.floor(rc/nb),ns=nb-rc%nb,blocks=[];let k=0;
 for(let i=0;i<nb;i++){const d=dat.slice(k,k+sl-el+(i<ns?0:1));k+=d.length;const e=rem(d);if(i<ns)d.push(0);blocks.push(d.concat(e))}
 const all=[];for(let i=0;i<blocks[0].length;i++)blocks.forEach((b,j)=>{if(i!=sl-el||j>=ns)all.push(b[i])});
 const size=v*4+17,m=Array.from({length:size},()=>Array(size).fill(false)),f=Array.from({length:size},()=>Array(size).fill(false));
 const setF=(x,y,d)=>{m[y][x]=d;f[y][x]=true};
 for(let i=0;i<size;i++){setF(6,i,i%2==0);setF(i,6,i%2==0)}
 const fin=(cx,cy)=>{for(let dy=-4;dy<=4;dy++)for(let dx=-4;dx<=4;dx++){const d=Math.max(Math.abs(dx),Math.abs(dy)),x=cx+dx,y=cy+dy;if(x>=0&&x<size&&y>=0&&y<size)setF(x,y,d!=2&&d!=4)}};
 fin(3,3);fin(size-4,3);fin(3,size-4);
 const na=v>1?Math.floor(v/7)+2:0,step=Math.ceil((v*4+4)/(Math.max(na,2)*2-2))*2;let ap=v>1?[6]:[];for(let q=size-7;ap.length<na;q-=step)ap.splice(1,0,q);
 for(let i=0;i<na;i++)for(let j=0;j<na;j++){if((i==0&&j==0)||(i==0&&j==na-1)||(i==na-1&&j==0))continue;for(let dy=-2;dy<=2;dy++)for(let dx=-2;dx<=2;dx++)setF(ap[i]+dx,ap[j]+dy,Math.max(Math.abs(dx),Math.abs(dy))!=1)}
 const bit=(x,i)=>((x>>>i)&1)!=0;
 const fmt=mk=>{const d=0<<3|mk;let r=d;for(let i=0;i<10;i++)r=(r<<1)^((r>>>9)*0x537);const b=(d<<10|r)^0x5412;
  for(let i=0;i<=5;i++)setF(8,i,bit(b,i));setF(8,7,bit(b,6));setF(8,8,bit(b,7));setF(7,8,bit(b,8));for(let i=9;i<15;i++)setF(14-i,8,bit(b,i));
  for(let i=0;i<8;i++)setF(size-1-i,8,bit(b,i));for(let i=8;i<15;i++)setF(8,size-15+i,bit(b,i));setF(8,size-8,true)};
 fmt(0);
 if(v>=7){let r=v;for(let i=0;i<12;i++)r=(r<<1)^((r>>>11)*0x1F25);const b=v<<12|r;for(let i=0;i<18;i++){const c=bit(b,i),a=size-11+i%3,d=Math.floor(i/3);setF(a,d,c);setF(d,a,c)}}
 let i=0;
 for(let right=size-1;right>=1;right-=2){if(right==6)right=5;for(let vert=0;vert<size;vert++)for(let j=0;j<2;j++){const x=right-j,up=((right+1)&2)==0,y=up?size-1-vert:vert;if(!f[y][x]&&i<all.length*8){m[y][x]=bit(all[i>>>3],7-(i&7));i++}}}
 const MK=[(x,y)=>(x+y)%2==0,(x,y)=>y%2==0,(x,y)=>x%3==0,(x,y)=>(x+y)%3==0,(x,y)=>(Math.floor(x/3)+Math.floor(y/2))%2==0,(x,y)=>x*y%2+x*y%3==0,(x,y)=>(x*y%2+x*y%3)%2==0,(x,y)=>((x+y)%2+x*y%3)%2==0];
 const pen=g=>{let p=0;for(let a=0;a<size;a++)for(const dr of [0,1]){let run=1;for(let b=1;b<size;b++){const c=dr?g[b][a]:g[a][b],pr=dr?g[b-1][a]:g[a][b-1];if(c==pr){run++;if(run==5)p+=3;else if(run>5)p++}else run=1}}return p};
 let best=null,bm=0,bp=1e9;
 for(let mk=0;mk<8;mk++){const g=m.map(r=>r.slice());for(let y=0;y<size;y++)for(let x=0;x<size;x++)if(!f[y][x]&&MK[mk](x,y))g[y][x]=!g[y][x];const pp=pen(g);if(pp<bp){bp=pp;best=g;bm=mk}}
 for(let y=0;y<size;y++)for(let x=0;x<size;x++)m[y][x]=best[y][x];
 fmt(bm);
 let d="";for(let y=0;y<size;y++)for(let x=0;x<size;x++)if(m[y][x])d+=`M${x} ${y}h1v1h-1z`;
 return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="-3 -3 ${size+6} ${size+6}" width="${px}" height="${px}" shape-rendering="crispEdges"><rect x="-3" y="-3" width="${size+6}" height="${size+6}" fill="#fff"/><path d="${d}" fill="#000"/></svg>`;
}

function menuS(id){
 const s=sOf(id),A=[["👤","প্রোফাইল দেখুন",`profile('${id}')`],["🎖","ফলাফল / গ্রেড",`resultsM('${id}')`],["📅","মাসিক উপস্থিতি",`stuAtt('${id}')`],["📋","প্রবেশপত্র তৈরি",`admit('${id}')`],["🪪","আইডি কার্ড",`idCard('${id}')`],["👛","লেনদেন",`stuTxn('${id}')`],["✏️","সম্পাদনা",`stuForm('${id}')`]];
 modal(HND+`<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px"><b>${esc(s.name)}</b><span style="padding:4px 8px" onclick="closeM()">✕</span></div>`+A.map(a=>`<div class="mr" onclick="${a[2]}"><i>${a[0]}</i>${a[1]}</div>`).join("")+`<div class="mr rd" onclick="stuDel('${id}')"><i>🗑</i>মুছে ফেলুন</div>`);
}
function profile(id){closeM();profId=id;profTab="info";render();$("v").scrollTop=0}

/* ---- student results (exam papers model) ---- */
function resultsM(id,key){
 const x=sOf(id),gs=exGroups(e=>e.cls==x.cls),g=gs.find(v=>v.key==key)||gs[gs.length-1],r=g?stuRes(x,g.papers):null;
 const th='style="background:#16a34a;color:#fff"';
 modal(HND+`<h2 style="font-size:16px;margin-bottom:8px">🎖 ${esc(x.name)} — ফলাফল প্রোফাইল</h2><div class="card" style="background:#e6f7ee;display:flex;gap:12px;align-items:center;padding:12px">${avt(x,48)}<div><b style="color:#1d2433">${esc(x.name)}</b><small style="color:#6b7385">${esc(x.cls)} | রোল: ${esc(x.roll)}</small></div></div>`
 +(g?`<select onchange="resultsM('${id}',this.value)">${gs.map(v=>`<option value="${esc(v.key)}" ${v.key==g.key?"selected":""}>${esc(v.name)} — ${esc(v.cls)}</option>`).join("")}</select>
 <div class="card ov" style="padding:0"><table class="tb"><tr><th ${th}>বিষয়</th><th ${th}>পূর্ণমান</th><th ${th}>প্রাপ্ত</th><th ${th}>%</th><th ${th}>গ্রেড</th><th ${th}>GPA</th><th ${th}></th></tr>
 ${r.rows.map(q=>`<tr><td>${esc(q.p.subject)}</td><td>${bn(q.f)}</td><td style="${q.fail?"color:var(--rd)":""}">${bn(q.g)}</td><td>${bn(q.pc.toFixed(0))}%</td><td>${q.gr}</td><td>${bn(q.gp.toFixed(2))}</td><td onclick="delMark('${id}','${q.p.id}','${jsq(g.key)}')" style="color:var(--rd)">✕</td></tr>`).join("")||'<tr><td colspan="7" style="text-align:center;color:var(--mu);padding:18px">কোনো ফলাফল নেই</td></tr>'}
 ${r.n?`<tr style="font-weight:700"><td>মোট</td><td>${bn(r.F)}</td><td>${bn(r.T)}</td><td>${bn(r.pc.toFixed(0))}%</td><td>${r.gr}</td><td>${bn(r.gpa.toFixed(2))}</td><td></td></tr>`:""}</table></div>
 <button class="btn o" style="width:100%" onclick="markAdd('${id}','${jsq(g.key)}')">＋ নতুন নম্বর যুক্ত করুন</button>`:'<div class="em">এই শ্রেণির কোনো পরীক্ষা নেই। আরও → পরীক্ষা ও ফলাফল থেকে পরীক্ষা যোগ করুন।</div>')
 +`<button class="btn o" style="width:100%;margin-top:8px" onclick="closeM()">বন্ধ</button>`);
}
function markAdd(id,key){
 const g=exGroup(key);if(!g.papers.length){alert("এই পরীক্ষায় কোনো বিষয় নেই");return}
 ask("নম্বর যুক্ত করুন",[["p","বিষয়","select",g.papers.map(p=>[p.id,p.subject+" (মোট "+(p.total||100)+")"])],["g","প্রাপ্ত নম্বর","number"]],v=>{
  const p=S.exams.find(e=>e.id==v[0]);if(v[1]===""||isNaN(+v[1])){alert("প্রাপ্ত নম্বর দিন");return false}
  p.marks=p.marks||{};p.marks[id]=Math.min(+v[1],+p.total||100);logA("add","ফলাফল","নম্বর যুক্ত: "+sOf(id).name+" — "+p.subject);save();resultsM(id,key);return false});
}
function delMark(id,pid,key){const p=S.exams.find(e=>e.id==pid);delete p.marks[id];save();resultsM(id,key)}

/* ---- monthly attendance report ---- */
function attText(id){const x=sOf(id),pre=mk(arS.y,arS.m),c=cnt(id,pre),pc=pctOf([id],pre)||0;return arS.sn+"\n"+x.name+" ("+x.cls+") — "+MN[arS.m]+" "+bn(arS.y)+" উপস্থিতি\nউপস্থিত: "+bn(c.p)+", অনুপস্থিত: "+bn(c.a)+", বিলম্ব: "+bn(c.l)+", ছুটি: "+bn(c.h)+"\nউপস্থিতির হার: "+bn(pc)+"%"}
function attDoc(id,m,y,sn){
 const x=sOf(id),pre=mk(y,m),c=cnt(id,pre),pc=pctOf([id],pre)||0,ds=Object.keys(S.att).filter(d=>d.startsWith(pre)&&S.att[d][id]).sort();
 return pdfHdr()+`<p><b>${esc(x.name)}</b> — শ্রেণি ${esc(x.cls)}${x.branch?" | শাখা: "+esc(x.branch):""} | রোল: ${esc(x.roll)}<br>${MN[m]} ${bn(y)} — মাসিক উপস্থিতি রিপোর্ট</p><p>উপস্থিত: ${bn(c.p)} | অনুপস্থিত: ${bn(c.a)} | বিলম্ব: ${bn(c.l)} | ছুটি: ${bn(c.h)} | হার: ${bn(pc)}%</p><table><tr><th>তারিখ</th><th>অবস্থা</th></tr>${ds.map(d=>`<tr><td>${bn(d)}</td><td>${ST[S.att[d][id]][0]}</td></tr>`).join("")||'<tr><td colspan="2">কোনো রেকর্ড নেই</td></tr>'}</table>`;
}
function attPdf(id,m,y,sn){printDoc("attendance-report",attDoc(id,m,y,sn))}
function stuAtt(id,keep){
 const x=sOf(id),Y=new Date().getFullYear();if(!keep)arS={m:new Date().getMonth(),y:Y,sn:S.school.name};
 const pre=mk(arS.y,arS.m),c=cnt(id,pre),tot=c.p+c.a+c.l+c.h,pc=pctOf([id],pre)||0;
 const bd=pc>=90?["চমৎকার","#dcfce7","#16a34a"]:pc>=75?["ভালো","#d3f1df","#16a34a"]:pc>=60?["সতর্কতা","#fef3c7","#b45309"]:["উদ্বেগজনক","#ffe4e9","#e11d48"];
 const tl=(i,l,n,col)=>`<div class="mini" style="background:var(--bg)"><div style="color:${col}">${i}</div><b style="font-size:20px;color:${col}">${bn(n)}</b>${l}</div>`;
 modal(HND+`<h2 style="font-size:16px;margin-bottom:8px">📅 মাসিক উপস্থিতি রিপোর্ট</h2><div class="g2" style="margin-bottom:8px"><select onchange="arS.m=+this.value;stuAtt('${id}',1)" style="margin:0">${MN.map((m,i)=>`<option value="${i}" ${arS.m==i?"selected":""}>${m}</option>`).join("")}</select><select onchange="arS.y=+this.value;stuAtt('${id}',1)" style="margin:0">${[Y-1,Y,Y+1].map(y=>`<option value="${y}" ${arS.y==y?"selected":""}>${bn(y)}</option>`).join("")}</select></div>
 <input value="${esc(arS.sn)}" oninput="arS.sn=this.value" placeholder="প্রতিষ্ঠানের নাম">
 <div class="card" style="background:#e6f7ee;display:flex;justify-content:space-between;align-items:center;padding:12px"><div><b style="color:#16a34a">${esc(x.name)}</b><small style="color:#6b7385">${esc(x.cls)} | শাখা: ${esc(x.branch||"—")} | রোল: ${esc(x.roll)}</small></div><span class="pl" style="background:${bd[1]};color:${bd[2]};margin:0">${bd[0]}</span></div>
 <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:6px;margin-bottom:12px">${tl("✓","উপস্থিত",c.p,"#16a34a")}${tl("✕","অনুপস্থিত",c.a,"#e11d48")}${tl("◔","বিলম্বে",c.l,"#f59e0b")}${tl("📅","ছুটি",c.h,"#16a34a")}</div>
 <div style="display:flex;justify-content:space-between;font-size:13px"><span>উপস্থিতির হার</span><b style="color:${bd[2]}">${bn(pc)}%</b></div><div style="height:8px;border-radius:4px;background:var(--ln);margin:6px 0"><div style="width:${pc}%;height:100%;border-radius:4px;background:${bd[2]}"></div></div><small style="color:var(--mu)">মোট ${bn(tot)} কার্যদিবস</small>
 ${tot?"":'<div class="em">এই মাসে কোনো উপস্থিতি রেকর্ড নেই।</div>'}
 <div class="g2" style="margin:12px 0 0"><button class="btn" onclick="attPdf('${id}',arS.m,arS.y,arS.sn)">PDF ডাউনলোড / প্রিন্ট</button><button class="btn o g" style="margin:0" onclick="sendTo(sOf('${id}'),'wa',attText('${id}'))">WhatsApp শেয়ার</button></div>`);
}

/* ---- transactions ---- */
function txnBody(id,rf){
 const x=sOf(id),fs=S.fees.filter(f=>f.sid==id),mo=f=>f.ym||f.auto||(f.date||"").slice(0,7),Y=new Date().getFullYear(),sm=(l,k)=>l.reduce((a,f)=>a+f[k],0);
 const yr=fs.filter(f=>mo(f).startsWith(txY+"-")),P=sm(yr,"paid"),D=sm(yr,"amt")-P;
 const st=(a,p)=>a-p<=0?pill("পরিশোধিত","g"):p>0?'<span class="pl" style="background:#fef3c7;color:#b45309">আংশিক</span>':pill("অপরিশোধিত","r");
 const mr=MN.map((m,i)=>{const r=fs.filter(f=>mo(f)==mk(txY,i)),a=sm(r,"amt"),p=sm(r,"paid");return r.length?`<tr><td><b>${m}</b></td><td><b>${bn(a)}</b></td><td style="color:var(--gr)">${p?bn(p):"—"}</td><td style="color:var(--rd)"><b>${a-p?bn(a-p):"—"}</b></td><td>${st(a,p)}</td></tr>`:`<tr style="color:var(--mu)"><td>${m}</td><td>—</td><td>—</td><td>—</td><td>—</td></tr>`}).join("");
 const hist=fs.slice().sort((a,b)=>(b.date||"")>(a.date||"")?1:-1),pages=Math.max(1,Math.ceil(hist.length/5));if(txP>pages)txP=pages;if(txP<1)txP=1;
 const dt=d=>bn(fdt(d));
 return `<div class="card" style="padding:10px"><div class="ch"><b>👛 একাডেমিক লেনদেন</b><select style="width:90px;margin:0" onchange="txY=+this.value;txP=1;${rf}">${[Y-2,Y-1,Y,Y+1].map(y=>`<option value="${y}" ${txY==y?"selected":""}>${bn(y)}</option>`).join("")}</select></div>
 <div style="font-size:12px;margin-bottom:8px">মোট প্রদেয় পরিমাণ/মাস : <b style="color:#16a34a">${bn((+x.monthlyFee||0)+(x.type=="আবাসিক"?(+x.boardFee||0):0))} টাকা</b> · পরিশোধিত: <b style="color:var(--gr)">${bn(P)} ৳</b> · বকেয়া: <b style="color:var(--rd)">${bn(D)} ৳</b></div>
 <div class="ov"><table class="tb"><tr><th>মাস</th><th>মোট ফি</th><th>পরিশোধিত</th><th>বকেয়া</th><th>অবস্থা</th></tr>${mr}</table></div></div>
 <div class="card" style="padding:10px"><div class="ch"><b>লেনদেনের ইতিহাস</b>${pill(bn(hist.length)+" টি","b")}</div><div class="ov"><table class="tb"><tr><th>তারিখ</th><th>ধরন</th><th>পরিমাণ</th><th>অবস্থা</th><th>কার্যক্রম</th></tr>
 ${hist.slice((txP-1)*5,txP*5).map(f=>`<tr><td onclick="feeForm('${f.id}')">${dt(f.date)}</td><td><b>${esc(f.title)}</b></td><td><b>${bn(f.amt)} ৳</b></td><td>${st(f.amt,f.paid)}</td><td onclick="delTx('${id}','${f.id}')" style="color:var(--mu)">🗑</td></tr>`).join("")||'<tr><td colspan="5" style="text-align:center;color:var(--mu)">কোনো লেনদেন নেই</td></tr>'}</table></div>
 <div style="display:flex;justify-content:space-between;align-items:center;margin-top:8px;font-size:12px;color:var(--mu)"><span>পৃষ্ঠা ${bn(txP)} / ${bn(pages)} · মোট ${bn(hist.length)} টি</span><span><button class="ob" style="padding:4px 10px" onclick="txP=Math.max(1,txP-1);${rf}">‹</button> <button class="ob" style="padding:4px 10px" onclick="txP=Math.min(${pages},txP+1);${rf}">›</button></span></div></div>`;
}
function stuTxn(id,keep){if(!keep){txY=new Date().getFullYear();txP=1}txM=true;const x=sOf(id);modal(HND+`<h2 style="font-size:16px;margin-bottom:8px">👛 ${esc(x.name)} — লেনদেন</h2>`+txnBody(id,`stuTxn('${id}',1)`)+`<button class="btn o" style="width:100%" onclick="closeM()">বন্ধ</button>`)}
function delTx(id,fid){if(!confirm("এই লেনদেনের রেকর্ড মুছবেন?"))return;S.fees=S.fees.filter(f=>f.id!=fid);logA("edit","ফি","ফি রেকর্ড মুছে ফেলা হয়েছে");save();if(txM)stuTxn(id,1);else render()}

/* ---- message ---- */
function msgM(ids,txt,cb){
 const l=ids.map(pOf).filter(x=>x&&x.phone);if(!l.length){alert("মোবাইল নম্বর সহ কোনো শিক্ষার্থী নেই");return}
 mctx={cb,ids:l.map(x=>x.id),sel:Object.fromEntries(l.map(x=>[x.id,1])),done:{},txt:txt||(l.length==1?fillT(MT,l[0]):MT)};drawMsg();
}
function drawMsg(){
 const l=mctx.ids.map(pOf),n=Object.keys(mctx.sel).length,one=l.length==1;
 modal(HND+`<h2 style="font-size:16px;margin-bottom:8px">💬 ${one?esc(l[0].guardian||l[0].name)+" -কে বার্তা পাঠান":"অভিভাবকদের বার্তা পাঠান"}</h2><label class="lb">বার্তার বিষয়বস্তু</label><textarea rows="5" oninput="mctx.txt=this.value;$('mc').textContent=bn(this.value.length)+' অক্ষর'">${esc(mctx.txt)}</textarea><small id="mc" style="color:var(--mu)">${bn(mctx.txt.length)} অক্ষর</small>
 <div style="display:flex;align-items:center;gap:8px;margin:10px 0"><input type="checkbox" class="cb" ${n==l.length?"checked":""} onchange="msgAll(this.checked)"><b style="font-size:13px;flex:1">সবাই নির্বাচন (${bn(n)} জন)</b><button class="btn g s" onclick="msgNext()">সকলকে WhatsApp</button></div>
 <div class="card" style="padding:6px">${l.map(x=>`<div class="row"><input type="checkbox" class="cb" ${mctx.sel[x.id]?"checked":""} onchange="msgTog('${x.id}')"><div class="f"><b>${esc(x.guardian||x.name)}</b>${x.guardian?` <span style="font-size:12px;color:var(--mu)">(${esc(x.name)})</span>`:""}<small>📞 ${esc(x.phone)}${mctx.done[x.id]?" ✓ পাঠানো হয়েছে":""}</small></div><button class="btn s g" onclick="msgOne('${x.id}','wa')">WA</button><button class="btn s o" onclick="msgOne('${x.id}','sms')">SMS</button></div>`).join("")}</div>
 <p style="font-size:11px;color:var(--mu);text-align:center">WhatsApp/SMS বাটনে ক্লিক করলে ফোনের অ্যাপ খুলবে — পাঠানোর পর লগ স্বয়ংক্রিয়ভাবে সংরক্ষিত হবে। "সকলকে WhatsApp" চাপলে একে একে পরের জনের চ্যাট খুলবে। {নাম} ও {শ্রেণি} লিখলে প্রত্যেকের নাম বসবে।</p>`);
 $("mt").onclick=null;
}
function msgAll(on){mctx.sel=on?Object.fromEntries(mctx.ids.map(i=>[i,1])):{};drawMsg()}
function msgTog(id){if(mctx.sel[id])delete mctx.sel[id];else mctx.sel[id]=1;drawMsg()}
function msgOne(id,ch){const x=pOf(id);mctx.done[id]=1;if(mctx.cb)mctx.cb();sendTo(x,ch,fillT(mctx.txt,x),mctx.ty);setTimeout(drawMsg,400)}
function msgNext(){const id=mctx.ids.find(i=>mctx.sel[i]&&!mctx.done[i]);if(!id){alert("নির্বাচিত সবাইকে পাঠানো হয়েছে");return}msgOne(id,"wa")}

/* ---- admit card / id card ---- */
function schFields(list){return list.map(f=>`<label class="lb">${f[1]}</label><input id="sc_${f[0]}" value="${esc(S.school[f[0]])}" oninput="schUp()">`).join("")}
function schUp(){["name","nameEn","addr","phone","est","year","director","founder"].forEach(k=>{const e=$("sc_"+k);if(e)S.school[k]=e.value});save();pvUp()}
function pvUp(){const p=$("pv");if(!p)return;const k=cardCtx.kind;p.innerHTML=k=="id"?idHtml(sOf(cardCtx.id)):k=="rc"?rcHtml(sOf(cardCtx.id),rcPapers()):k=="sh"?shHtml(shData()):admitHtml(sOf(cardCtx.id),exGroup(cardCtx.eid))}
function exUp(){S.exg=S.exg||{};S.exg[cardCtx.eid]={center:$("ex_c").value,start:$("ex_s").value,end:$("ex_e").value};save();pvUp()}
function cardLogo(){photoCb=u=>{const x=safeImageSrc(u);if(!x)return alert("শুধু বৈধ image ফাইল ব্যবহার করুন");S.school.logo=x;save();cardRedraw()};pickPhoto()}
function cardRedraw(){const k=cardCtx.kind;if(k=="id")drawId();else if(k=="rc")drawRc();else if(k=="sh")drawSh();else drawAdmit()}
function logoRow(){return `<label class="lb">প্রতিষ্ঠানের লোগো</label><div class="row" style="border:0;padding:4px 0"><div class="av" style="width:46px;height:46px;font-size:11px">${S.school.logo?`<img class="av" style="width:46px;height:46px" src="${safeImageSrc(S.school.logo)}">`:"লোগো"}</div><button class="btn o s" onclick="cardLogo()">⬆ লোগো আপলোড</button><span onclick="S.school.logo='';save();cardRedraw()" style="color:var(--rd);font-size:13px">✕ সরান</span></div><input id="ph" type="file" accept="image/*" style="position:absolute;left:-9999px;opacity:0;width:1px;height:1px" onchange="photoFile(this.files[0]);this.value=''">`}
function admit(id){
 const x=sOf(id),gs=exGroups(e=>e.cls==x.cls);
 if(!gs.length){alert("এই শ্রেণির কোনো পরীক্ষা নেই। আগে আরও → পরীক্ষা ও ফলাফল থেকে পরীক্ষা যোগ করুন।");return}
 cardCtx={kind:"admit",id,eid:gs[gs.length-1].key};drawAdmit();
}
function drawAdmit(){
 const x=sOf(cardCtx.id),gs=exGroups(e=>e.cls==x.cls),e=exGroup(cardCtx.eid),ps=e.papers,d1=ps[0]?ps[0].date:"";
 modal(HND+`<h2 style="font-size:16px">📄 প্রবেশপত্র তৈরি — ${esc(x.name)}</h2><small style="color:var(--mu)">প্রতিষ্ঠানের তথ্য (স্বয়ংক্রিয়ভাবে লোড হয়, প্রয়োজনে সম্পাদনা করুন)</small>${logoRow()}
 ${schFields([["name","প্রতিষ্ঠানের নাম *"],["nameEn","ইংরেজি নাম"],["addr","ঠিকানা"],["phone","ফোন"],["est","স্থাপন সাল"],["director","পরিচালক / প্রধান শিক্ষক"]])}
 <label class="lb">পরীক্ষা</label><select onchange="cardCtx.eid=this.value;drawAdmit()">${gs.map(v=>`<option value="${esc(v.key)}" ${v.key==e.key?"selected":""}>${esc(v.name)}</option>`).join("")}</select>
 <label class="lb">পরীক্ষার কেন্দ্র</label><input id="ex_c" value="${esc(e.center||S.school.name)}" oninput="exUp()">
 <div class="g2" style="margin:0"><div><label class="lb">পরীক্ষা শুরুর তারিখ</label><input id="ex_s" type="date" value="${esc(e.start||d1)}" onchange="exUp()"></div><div><label class="lb">পরীক্ষা শেষের তারিখ</label><input id="ex_e" type="date" value="${esc(e.end||(ps.length?ps[ps.length-1].date:""))}" onchange="exUp()"></div></div>
 <div id="pv" style="background:#eef3f3;padding:6px;border-radius:12px;overflow:auto;margin:6px 0">${admitHtml(x,e)}</div>
 <div class="card" style="background:#f0fdf4;padding:12px"><b style="color:#16a34a;font-size:14px">💬 অভিভাবককে পরীক্ষার সূচি পাঠান</b><div style="font-size:12px;margin:4px 0 8px;color:#16a34a">${esc(x.guardian||"অভিভাবক")}${x.phone?" ("+esc(x.phone)+")":""}-এর কাছে ${esc(e.name)} পরীক্ষার সময়সূচি পাঠান।</div><div class="g2" style="margin:0"><button class="btn g" onclick="admMsg('wa')">WhatsApp</button><button class="btn o g" style="margin:0" onclick="admMsg('sms')">SMS</button></div></div>
 <div class="g2" style="margin:0"><button class="ob" onclick="printCard()">🖨 প্রিন্ট করুন</button><button class="btn g" onclick="printCard()">⬇ PDF ডাউনলোড</button></div><button class="btn o" style="width:100%;margin-top:8px" onclick="closeM()">বন্ধ</button>`);
 $("mt").onclick=null;
}
function schedTxt(ps){return ps.map(r=>bn(r.date||"")+" — "+r.subject+((r.start||r.end)?" ("+(r.start||"")+(r.end?"-"+r.end:"")+")":"")).join("\n")}
function admMsg(ch){
 const x=sOf(cardCtx.id),e=exGroup(cardCtx.eid);if(!x.phone){alert("অভিভাবকের মোবাইল নম্বর নেই");return}
 sendTo(x,ch,"প্রিয় অভিভাবক,\n"+x.name+" ("+x.cls+")-এর "+e.name+" পরীক্ষার সূচি:\n"+(schedTxt(e.papers)||"পরীক্ষা শুরু: "+bn(e.start||""))+"\n— "+S.school.name);
}
function admitHtml(x,e){
 const sc=S.school,lg=sc.logo?`<img src="${safeDataImage(sc.logo)}" style="width:50px;height:50px;border-radius:50%;object-fit:cover;background:#fff">`:'<div style="width:50px;height:50px;border-radius:50%;border:2px solid #7fc8d6;color:#7fc8d6;font-size:10px;display:flex;align-items:center;justify-content:center">logo</div>',
 td="border:1px solid #ddd;padding:4px 6px",rt=e.papers||[],
 dy=d=>{try{return new Date(d+"T00:00:00").toLocaleDateString(LC(),{weekday:"long"})}catch(z){return ""}},
 row=(l,v)=>`<div style="display:flex;font-size:13px;padding:2px 0"><span style="width:62px;color:#555">${l}</span><span>: <b>${esc(v||"—")}</b></span></div>`,
 cell="flex:1;padding:5px;border:1px solid #9fd3da";
 return `<div style="font-family:sans-serif;color:#222;border:2px solid #0f4c5c;border-radius:10px;overflow:hidden;max-width:420px;margin:10px auto;background:#fff">
 <div style="background:#0f4c5c;color:#fff;padding:10px;display:flex;align-items:center;gap:8px">${lg}<div style="text-align:center;flex:1"><div style="font-size:19px;font-weight:700">${esc(sc.name)}</div><div style="color:#ffd54a;font-size:12px;font-weight:700">${esc(sc.nameEn||"")}</div></div>${lg}</div>
 <div style="background:#127a8c;color:#fff;text-align:center;font-size:12px;padding:5px">${esc(sc.addr)}</div>
 <div style="display:flex;font-size:11px;text-align:center;background:#d9f2f5;color:#0f4c5c"><div style="${cell}">পরিচালক: ${esc(sc.director||"—")}</div><div style="${cell}">স্থাপিত: ${esc(sc.est||"—")} | শিক্ষাবর্ষ: ${esc(sc.year||"—")}</div><div style="${cell}">মোবাইল: ${esc(sc.phone||"—")}</div></div>
 <div style="text-align:center;margin:8px 0"><span style="background:#e5e7eb;border-radius:20px;padding:4px 14px;font-size:12px;font-weight:700">প্রবেশ পত্র / ADMIT CARD</span></div>
 <div style="display:flex;justify-content:space-between;gap:8px;padding:0 12px 8px"><div style="flex:1;min-width:0">${row("নাম",x.name)}${row("রোল নং",x.roll)}${row("শ্রেণি",x.cls+(x.branch?" ("+x.branch+")":""))}${row("পরীক্ষা",e.name)}${row("কেন্দ্র",e.center||sc.name)}</div>${x.photo?`<img src="${safeDataImage(x.photo)}" style="width:70px;height:82px;object-fit:cover;border-radius:4px">`:'<div style="width:70px;height:82px;background:#eee;border-radius:4px;display:flex;align-items:center;justify-content:center;font-size:30px">👤</div>'}</div>
 <div style="background:#1e2a4a;color:#fff;font-size:12px;font-weight:700;padding:5px 10px">পরীক্ষার সূচি</div>
 ${rt.length?`<table style="width:100%;border-collapse:collapse;font-size:12px"><tr><th style="${td}">তারিখ</th><th style="${td}">বার</th><th style="${td}">বিষয়</th><th style="${td}">সময়</th></tr>${rt.map(r=>`<tr><td style="${td}">${bn(r.date||"")}</td><td style="${td}">${r.date?dy(r.date):""}</td><td style="${td}">${esc(r.subject)}</td><td style="${td}">${esc((r.start||"")+(r.end?" - "+r.end:""))}</td></tr>`).join("")}</table>`:`<div style="text-align:center;color:#888;font-size:12px;padding:12px">পরীক্ষার সূচি পাওয়া যায়নি। আরও → পরীক্ষা ও ফলাফল থেকে "${esc(e.name)}" পরীক্ষায় সূচি যোগ করুন।</div>`}
 <div style="margin:10px;border:1px solid #fca5a5;background:#fff5f5;border-radius:8px;padding:8px;font-size:12px"><b style="color:#c62828">⚠ গুরুত্বপূর্ণ নির্দেশনা:</b><ul style="margin:4px 0 0 16px;padding:0"><li>পরীক্ষার ৩০ মিনিট আগে কেন্দ্রে উপস্থিত থাকতে হবে।</li><li>প্রবেশপত্র ছাড়া পরীক্ষায় অংশগ্রহণ করা যাবে না।</li><li>হলে মোবাইল ফোন আনা নিষিদ্ধ।</li></ul></div><div style="display:flex;justify-content:flex-end;padding:0 14px 12px"><div style="text-align:center;font-size:11px;min-width:120px"><div style="height:38px;display:flex;align-items:flex-end;justify-content:center">${sigImg(36)}</div><div style="border-top:1px solid #333;padding-top:3px">পরিচালকের স্বাক্ষর</div></div></div></div>`;
}
function idCard(id){cardCtx={kind:"id",id};drawId()}
function drawId(){
 const x=sOf(cardCtx.id);
 modal(HND+`<h2 style="font-size:16px;text-align:center">শিক্ষার্থী আইডি কার্ড — ${esc(x.name)}</h2>${logoRow()}
 ${schFields([["name","প্রতিষ্ঠানের নাম (বাংলা)"],["nameEn","প্রতিষ্ঠানের নাম (English)"],["addr","ঠিকানা"],["est","স্থাপিত"],["year","শিক্ষাবর্ষ"],["founder","প্রতিষ্ঠাতার নাম"],["director","পরিচালকের নাম"],["phone","পরিচালকের মোবাইল"]])}
 <div id="pv" style="background:#e8eeee;padding:8px;border-radius:12px;overflow:auto;margin:10px 0">${idHtml(x)}</div>
 <div class="g2" style="margin:0"><button class="ob" onclick="printCard()">🖨 প্রিন্ট</button><button class="btn g" onclick="printCard()">⬇ ডাউনলোড</button></div><button class="btn o" style="width:100%;margin-top:8px" onclick="closeM()">বন্ধ</button>`);
 $("mt").onclick=null;
}
function idHtml(x,ph){
 const sc=S.school,lg=z=>sc.logo?`<img src="${safeDataImage(sc.logo)}" style="width:${z}px;height:${z}px;border-radius:50%;object-fit:cover;background:#fff;border:2px solid #f5c518">`:`<div style="width:${z}px;height:${z}px;border-radius:50%;background:#fff;border:2px solid #f5c518;display:flex;align-items:center;justify-content:center;font-size:${Math.round(z/2)}px">🕌</div>`,
 cl=x.cls+(x.branch?" ("+x.branch+")":""),
 r=(l,v)=>`<div style="display:flex;font-size:11px;padding:2px 0"><span style="width:56px;color:#444">${l}</span><span style="flex:1">: ${esc(v||"—")}</span></div>`,
 qr=qrSvg([sc.name,x.name,"শ্রেণি: "+cl,"রোল: "+(x.roll||""),"মোবাইল: "+(x.phone||"")].join("\n"),96),
 w="width:260px;margin:10px auto;border-radius:12px;overflow:hidden;box-shadow:0 2px 10px #0003;font-family:sans-serif;color:#222;background:#fff";
 return `<div style="${w}"><div style="background:#146c3a;color:#fff;text-align:center;padding:10px 8px 30px"><div style="display:flex;justify-content:space-between;align-items:center;gap:4px">${lg(30)}<div><b style="font-size:14px">${esc(sc.name)}</b><div style="font-size:9px;color:#ffd54a">${esc(sc.nameEn||"")}</div></div>${lg(30)}</div><div style="font-size:9px;margin-top:3px">${esc(sc.addr)}</div><div style="font-size:9px;color:#ffd54a">স্থাপিত: ${esc(sc.est||"—")} | শিক্ষাবর্ষ: ${esc(sc.year||"—")}</div><div style="color:#ffd54a;font-weight:700;font-size:13px;margin-top:4px">পরিচয়পত্র</div></div>
 <div style="background:#f5c518;height:5px"></div><div style="text-align:center;margin-top:-22px"><div style="display:inline-block;border:4px solid #f5c518;border-radius:50%;background:#fff;line-height:0">${ph?`<img src="${ph}" style="width:64px;height:64px;display:block">`:x.photo&&safeDataImage(x.photo)?`<img src="${safeDataImage(x.photo)}" style="width:64px;height:64px;border-radius:50%;object-fit:cover;display:block">`:`<div style="width:64px;height:64px;border-radius:50%;background:#d7f2e3;display:flex;align-items:center;justify-content:center;font-size:32px;line-height:1">👤</div>`}</div></div>
 <div style="text-align:center;color:#d32f2f;font-weight:700;font-size:16px;margin:4px 0">${esc(x.name)}</div><div style="padding:0 16px 8px">${r("পিতা",x.guardian)}${r("রোল",x.roll)}${r("শ্রেণি",cl)}${r("শিক্ষাবর্ষ",sc.year)}${r("মোবা",x.phone)}${r("ঠিকানা",x.addr)}</div>
 <div style="background:#d98a2b;color:#fff;text-align:right;padding:4px 12px 8px;font-size:10px"><div style="display:inline-block;text-align:center;min-width:110px"><div style="height:34px;display:flex;align-items:flex-end;justify-content:center">${sigImg(32)}</div><div style="border-top:1px solid #fff;padding-top:2px">পরিচালকের স্বাক্ষর<br><b>${esc(sc.director||"")}</b></div></div></div></div>
 <div style="${w}"><div style="background:#d98a2b;height:12px"></div><div style="text-align:center;padding:10px">${qr}<div style="font-size:9px;color:#555">শিক্ষার্থীর তথ্য স্ক্যান করুন</div><b style="font-size:13px;display:block;margin-top:6px">${esc(sc.name)}</b><div style="font-size:10px">${esc(sc.nameEn||"")}</div><div style="font-size:10px;color:#146c3a">${esc(sc.addr)}</div><div style="font-size:10px;color:#146c3a">স্থাপিত: ${esc(sc.est||"—")}</div><div style="font-size:10px;margin-top:4px">প্রতিষ্ঠাতা: ${esc(sc.founder||"—")}</div><div style="font-size:10px">পরিচালক: ${esc(sc.director||"—")}</div><b style="font-size:11px">যোগাযোগ: ${esc(sc.phone||"—")}</b><div style="margin-top:6px">${lg(34)}</div></div>
 <div style="background:#146c3a;color:#fff;font-size:9px;text-align:center;padding:10px 12px;border-top:4px solid #f5c518;line-height:1.5">এই কার্ডটি শুধু প্রতিষ্ঠানের একটি সম্পত্তি। যদি এই কার্ডটি কোথাও পাওয়া যায় তবে দয়া করে উপরের ঠিকানায় ফেরত দেওয়ার অনুরোধ রইলো।</div></div>`;
}
function printCard(){const x=cardCtx.id?sOf(cardCtx.id):null,k=cardCtx.kind;if(k=="id"){photoCircle(x&&x.photo?safeDataImage(x.photo):"",240).then(ph=>printDoc("id-card",idHtml(x,ph)))}else if(k=="rc")printDoc("report-card",rcHtml(x,rcPapers()));else if(k=="sh")printDoc("result-sheet",shHtml(shData()));else printDoc("admit-card",admitHtml(x,exGroup(cardCtx.eid)))}

/* ---- full profile page ---- */
function resDoc(id){const x=sOf(id);return pdfHdr()+`<p><b>${esc(x.name)}</b> — শ্রেণি ${esc(x.cls)} | রোল: ${esc(x.roll)} — ফলাফল</p>`+(exGroups(e=>e.cls==x.cls).map(g=>{const r=stuRes(x,g.papers);return r.n?`<h3>${esc(g.name)}</h3><table><tr><th>বিষয়</th><th>পূর্ণমান</th><th>প্রাপ্ত</th><th>%</th><th>গ্রেড</th><th>GPA</th></tr>${r.rows.map(q=>`<tr><td>${esc(q.p.subject)}</td><td>${bn(q.f)}</td><td>${bn(q.g)}</td><td>${bn(q.pc.toFixed(0))}%</td><td>${q.gr}</td><td>${bn(q.gp.toFixed(2))}</td></tr>`).join("")}</table>`:""}).join("")||"<p>কোনো ফলাফল নেই</p>")}
function profilePage(){
 const x=sOf(profId);if(!x){profId="";return stu()}
 const Y=new Date().getFullYear(),ad=Object.keys(S.att).filter(d=>S.att[d][x.id]),pcn=ad.filter(d=>S.att[d][x.id]=="p"||S.att[d][x.id]=="l").length,pr=ad.length?Math.round(pcn/ad.length*100):0,ab=ad.filter(d=>S.att[d][x.id]=="a").length;
 const subj=S.exams.reduce((a,e)=>a+(((e.sub||{})[x.id])||[]).length,0),logs=S.smslog.filter(l=>l.sid==x.id);
 const kv=(l,v)=>`<div class="row" style="padding:8px 0"><div class="f" style="color:var(--mu);font-size:13px">${l}</div><span style="text-align:right">${esc(v||"-")}</span></div>`;
 const stat=(n,l,sub,c)=>`<div class="card" style="margin:0;padding:12px"><b style="font-size:22px;color:${c}">${n}</b><div style="font-size:13px">${l}</div><small style="color:var(--mu)">${sub}</small></div>`;
 const TB=[["info","ব্যক্তিগত তথ্য"],["res","ফলাফল"],["att","উপস্থিতি"],["log","যোগাযোগ লগ"],["txn","লেনদেন"]];
 let c="";
 if(profTab=="info")c=`<div class="card"><h2>👤 ব্যক্তিগত তথ্য</h2>${kv("পূর্ণ নাম (বাংলা)",x.name)}${kv("পূর্ণ নাম (ইংরেজি)",x.nameEn)}${kv("লিঙ্গ",x.gender)}${kv("জন্ম তারিখ",x.dob?bn(fdt(x.dob)):"")}${kv("রক্তের গ্রুপ",x.blood)}${kv("ভর্তির তারিখ",x.admDate?bn(fdt(x.admDate)):"")}${kv("মাসিক বেতন",x.monthlyFee?money(x.monthlyFee):"")}</div><div class="card"><h2>📞 অভিভাবক ও যোগাযোগ</h2>${kv("অভিভাবকের নাম",x.guardian)}${kv("মোবাইল নম্বর",x.phone)}${kv("ঠিকানা",x.addr)}${kv("শ্রেণি",x.cls)}${kv("শাখা",x.branch)}${kv("রোল নম্বর",x.roll)}<div class="top" style="margin:10px 0 0"><button class="btn g s" onclick="msgM(['${x.id}'])">💬 অভিভাবককে বার্তা</button><button class="btn o s" onclick="stuForm('${x.id}')">✏️ সম্পাদনা</button></div></div>`;
 else if(profTab=="res")c=`<div class="card"><h2>ফলাফল</h2>${exGroups(e=>e.cls==x.cls).map(g=>{const r=stuRes(x,g.papers);return `<div class="row" onclick="resultsM('${x.id}','${jsq(g.key)}')"><div class="f"><b>${esc(g.name)}</b><small>${r.n?bn(r.n)+" বিষয় · মোট "+bn(r.T)+"/"+bn(r.F)+" · GPA "+bn(r.gpa.toFixed(2)):"কোনো ফলাফল নেই"}</small></div><span class="lk">খুলুন ›</span></div>`}).join("")||'<div class="em">এই শ্রেণির কোনো পরীক্ষা নেই</div>'}</div>`;
 else if(profTab=="att")c=`<div class="card ov" style="padding:6px"><table class="tb"><tr><th>মাস</th><th>উপ.</th><th>অনু.</th><th>বিল.</th><th>ছুটি</th><th>%</th></tr>${MN.map((m,i)=>{const k=cnt(x.id,mk(Y,i)),p=pctOf([x.id],mk(Y,i));return `<tr><td>${m}</td><td>${bn(k.p)}</td><td>${bn(k.a)}</td><td>${bn(k.l)}</td><td>${bn(k.h)}</td><td>${p==null?"—":bn(p)+"%"}</td></tr>`}).join("")}</table></div>`;
 else if(profTab=="log")c=`<div class="card"><h2>যোগাযোগ লগ</h2>${logs.map(l=>{const t=new Date(l.t);return `<div class="row" style="align-items:flex-start"><span class="pl ${l.ch=="wa"?"g":"b"}">${l.ch=="wa"?"WhatsApp":"SMS"}</span><div class="f" style="font-size:13px;white-space:pre-wrap">${esc(l.tx)}<small>${bn(p2(t.getDate())+"/"+p2(t.getMonth()+1)+"/"+t.getFullYear()+" "+p2(t.getHours())+":"+p2(t.getMinutes()))}</small></div></div>`}).join("")||'<div class="em">কোনো বার্তা পাঠানো হয়নি</div>'}</div>`;
 else{txM=false;c=txnBody(x.id,"render()")}
 return `<div class="lk" style="margin-bottom:10px" onclick="profId='';render()">← শিক্ষার্থী তালিকায় ফিরুন</div>
 <div class="card" style="padding:0;overflow:hidden"><div style="background:linear-gradient(135deg,#0d9488,#16a34a);color:#fff;padding:14px 14px 34px;display:flex;align-items:center;gap:8px;font-weight:600;font-size:14px"><span class="av" style="width:30px;height:30px;font-size:14px">${S.school.logo?`<img class="av" style="width:30px;height:30px" src="${safeImageSrc(S.school.logo)}">`:"🕌"}</span>${esc(S.school.name)}</div>
 <div style="padding:0 14px 14px"><div style="margin-top:-30px;display:inline-block;border:3px solid var(--card);border-radius:50%;line-height:0">${avt(x,64)}</div><div style="margin-top:6px"><b style="font-size:20px">${esc(x.name)}</b> ${pill(esc(x.status||"সক্রিয়"),(x.status||"সক্রিয়")=="সক্রিয়"?"g":"r")}</div><small style="color:var(--mu)">${esc(x.cls)} শ্রেণি${x.branch?" · "+esc(x.branch)+" শাখা":""} · রোল: ${esc(x.roll)}</small>
 <div class="top" style="margin:10px 0 0"><button class="ob" onclick="attPdf('${x.id}',new Date().getMonth(),${Y},'${jsq(S.school.name)}')">⬇ উপস্থিতি PDF</button><button class="ob" onclick="printDoc('result-report',resDoc('${x.id}'))">⬇ ফলাফল PDF</button></div></div></div>
 <div class="g2">${stat(bn(pr)+"%","উপস্থিতির হার",bn(pcn)+"/"+bn(ad.length)+" দিন","#16a34a")}${stat(bn(ab),"অনুপস্থিত দিন","মোট দিন থেকে","#e11d48")}${stat(bn(subj),"মোট বিষয়","ফলাফল প্রবেশিত","#16a34a")}${stat(bn(logs.length),"SMS লগ","পাঠানো বার্তা","#7c3aed")}</div>
 <div class="sub">${TB.map(t=>`<button class="${profTab==t[0]?"on":""}" onclick="profTab='${t[0]}';render()">${t[1]}</button>`).join("")}</div>${c}`;
}
const FEES=[["monthly","মাসিক বেতন (৳)","মাসিক বেতন"],["adm","ভর্তি ফি (৳)","ভর্তি ফি"],["book","বই ফি (৳)","বই ফি"],["elec","বিদ্যুৎ বিল (৳/মাস)","বিদ্যুৎ বিল"],["board","বোর্ডিং খরচ (৳/মাস)","বোর্ডিং খরচ"],["other","অন্যান্য ফি (৳)","অন্যান্য ফি"]];
const DIVS=["স্কুল/কিন্ডারগার্টেন","নূরানী","হিফজ","কিতাব","মক্তব"];
const TYPES={"অনাবাসিক":"সাধারণ দিবা শিক্ষার্থী","আবাসিক":"হোস্টেলে থেকে পড়ে","ডেকেয়ার":"দিনের বেলা তত্ত্বাবধানে থাকে"};
let draft={},step=1,editId=null;
function stuForm(id){if(!allow("students"))return;editId=id||null;const s=S.students.find(x=>x.id==id);draft=s?{...s}:{type:"অনাবাসিক",status:"সক্রিয়",division:DIVS[0],admDate:today(),fees:{}};step=1;drawStu()}
function grab(){
 const g=id=>{const e=$(id);return e?e.value.trim():undefined};
 if(step==1)["name","nameEn","cls","branch","division","roll","gender","dob","admDate","guardian","phone","email","status","addr","pass","monthlyFee","boardFee","blood"].forEach(k=>{const v=g("s_"+k);if(v!==undefined)draft[k]=v});
 else{draft.fees=draft.fees||{};FEES.forEach(f=>{const v=g("f_"+f[0]);if(v!==undefined)draft.fees[f[0]]=v})}
}
function setType(t){grab();draft.type=t;drawStu()}
function fld(l,k,ph,t,req,extra){return `<label class="lb">${l}${req?" *":""}</label><input id="s_${k}" type="${t||"text"}" placeholder="${ph||""}" value="${esc(draft[k])}" ${extra||""}>`}
function sel(l,k,opts,req,ph){return `<label class="lb">${l}${req?" *":""}</label><select id="s_${k}">${ph?`<option value="">${ph}</option>`:""}${opts.map(o=>`<option ${draft[k]==o?"selected":""}>${o}</option>`).join("")}</select>`}
function drawStu(){
 const isNew=!editId,old=document.querySelector("#mt>div"),y=old?old.scrollTop:0;
 let h=`<div class="tabs"><div class="${step==1?"on":""}">মূল তথ্য</div>${isNew?`<div class="${step==2?"on":""}">ফি নির্ধারণ</div>`:""}</div>`;
 if(step==1){
  h+=`<h2 style="font-size:16px;margin:4px 0">${isNew?"নতুন শিক্ষার্থী ভর্তি":"শিক্ষার্থী সম্পাদনা"}</h2>
  <label class="lb">শিক্ষার্থীর ছবি</label>
  <div class="row" style="border:0;padding:4px 0" onclick="photoCb=null;photoDoc=false;pickPhoto()"><div class="av" style="width:56px;height:56px;font-size:20px">${draft.photo?`<img class="av" style="width:56px;height:56px" src="${draft.photo}">`:"⬆️"}</div><div class="f"><span style="color:var(--pri)">ছবি আপলোড করুন</span><small>ট্যাপ করে ফাইল নির্বাচন করুন</small></div></div>
  <div class="hint">JPG, PNG (সর্বোচ্চ ৫ MB)</div>
  <input id="ph" type="file" accept="image/*" style="position:absolute;left:-9999px;opacity:0;width:1px;height:1px" onchange="photoFile(this.files[0]);this.value=''">
  <label class="lb">শিক্ষার্থীর ধরন *</label>
  <div class="ch">${Object.keys(TYPES).map(t=>`<button type="button" class="${draft.type==t?"on":""}" onclick="setType('${t}')">${t}</button>`).join("")}</div>
  <div class="hint">${TYPES[draft.type]}</div>
  ${fld("নাম (বাংলায়)","name","","text",1)}
  ${fld("Name (English)","nameEn")}
  ${fld("শ্রেণি","cls","শ্রেণি লিখুন (যেমন: পঞ্চম, হিফজ)","text",1,'list="cl"')}
  <datalist id="cl">${classes().map(c=>`<option value="${esc(c)}">`).join("")}</datalist>
  <div class="hint">তালিকা থেকে বাছুন অথবা নতুন শ্রেণি ম্যানুয়ালি লিখুন</div>
  ${fld("শাখা","branch","শাখা লিখুন (ঐচ্ছিক)")}
  ${sel("বিভাগ","division",DIVS)}
  ${fld("রোল নম্বর","roll","","text",0,'inputmode="numeric"')}
  ${sel("লিঙ্গ","gender",["ছেলে","মেয়ে"],1,"নির্বাচন করুন")}
  ${sel("রক্তের গ্রুপ","blood",["A+","A-","B+","B-","AB+","AB-","O+","O-"],0,"নির্বাচন করুন")}
  ${fld("জন্ম তারিখ","dob","","date")}
  ${fld("ভর্তির তারিখ","admDate","","date")}
  ${fld("অভিভাবকের নাম","guardian")}
  ${fld("অভিভাবকের মোবাইল","phone","","tel")}
  ${fld("অভিভাবকের ইমেইল","email","example@gmail.com","email")}
  ${sel("অবস্থা","status",["সক্রিয়","নিষ্ক্রিয়"])}
  <label class="lb">ঠিকানা</label><textarea id="s_addr" rows="3">${esc(draft.addr)}</textarea>
  ${fld("লগইন পাসওয়ার্ড","pass","শিক্ষার্থীর পাসওয়ার্ড (ঐচ্ছিক)")}
  ${isNew?"":fld("মাসিক বেতন (৳)","monthlyFee","","number")}${!isNew&&draft.type=="আবাসিক"?`<label class="lb" style="color:#15803d;font-weight:700">🏠 বোর্ডিং খরচ (৳/মাস)</label><input id="s_boardFee" type="number" inputmode="numeric" placeholder="আবাসিক শিক্ষার্থীর বোর্ডিং খরচ" style="border-color:#86efac" value="${esc(draft.boardFee)}">`:""}
  <div class="bt"><button class="btn o" onclick="closeM()">বাতিল</button><button class="btn" onclick="stuNext()">${isNew?"পরবর্তী: ফি নির্ধারণ":"সংরক্ষণ করুন"}</button></div>
  ${isNew?"":`<button class="btn r" style="width:100%;margin-top:10px" onclick="stuDel('${editId}')">মুছে ফেলুন</button>`}`;
 }else{
  h+=`<div class="card" style="padding:10px;margin-top:8px"><span class="tag">শিক্ষার্থীর ধরন: ${draft.type}</span></div>`+
  FEES.filter(f=>f[0]!="board"||draft.type=="আবাসিক").map(f=>f[0]=="board"?`<label class="lb" style="color:#15803d;font-weight:700">🏠 ${f[1]}</label><input id="f_board" type="number" inputmode="numeric" placeholder="আবাসিক শিক্ষার্থীর বোর্ডিং খরচ" style="border-color:#86efac;background:rgba(34,197,94,.06)" value="${esc((draft.fees||{}).board)}">`:`<label class="lb">${f[1]}</label><input id="f_${f[0]}" type="number" inputmode="numeric" placeholder="0" value="${esc((draft.fees||{})[f[0]])}">`).join("")+
  `<div class="bt"><button class="btn o" onclick="closeM()">বাতিল</button><button class="btn o" onclick="stuBack()">পূর্ববর্তী</button><button class="btn" onclick="stuAdmit()">ভর্তি করুন</button></div>`;
 }
 modal(h);$("mt").onclick=null;const n=document.querySelector("#mt>div");if(n)n.scrollTop=y;
}
function stuNext(){grab();if(!draft.name||!draft.cls||!draft.gender){alert("নাম, শ্রেণি ও লিঙ্গ আবশ্যক");return}if(editId)commit();else{step=2;drawStu()}}
function stuBack(){grab();step=1;drawStu()}
function stuAdmit(){grab();commit()}
function commit(){
 const {fees,...o}=draft;
 if(editId){o.monthlyFee=+o.monthlyFee||0;o.boardFee=o.type=="আবাসিক"?(+o.boardFee||0):0;Object.assign(S.students.find(x=>x.id==editId),o);logA("edit","শিক্ষার্থী","শিক্ষার্থীর তথ্য আপডেট: "+o.name)}
 else{const id=uid();S.students.push({id,...o,monthlyFee:+((fees||{}).monthly)||0,boardFee:o.type=="আবাসিক"?(+((fees||{}).board)||0):0});FEES.forEach(f=>{if(f[0]=="monthly"||f[0]=="board")return;const a=+((fees||{})[f[0]]);if(a>0)S.fees.push({id:uid(),sid:id,title:f[2],amt:a,paid:0,date:today()})});logA("add","শিক্ষার্থী","নতুন শিক্ষার্থী ভর্তি: "+o.name)}
 autoFees();save();closeM();render();
}
function shrink(url){const im=new Image();im.onload=()=>{const c=document.createElement("canvas");let u;
 if(photoDoc){photoDoc=false;const k=Math.min(1,900/Math.max(im.width,im.height));c.width=Math.round(im.width*k);c.height=Math.round(im.height*k);c.getContext("2d").drawImage(im,0,0,c.width,c.height);u=c.toDataURL("image/jpeg",.7)}
 else{c.width=c.height=160;const x=c.getContext("2d"),m=Math.min(im.width,im.height);x.drawImage(im,(im.width-m)/2,(im.height-m)/2,m,m,0,0,160,160);u=c.toDataURL("image/jpeg",.75)}
 if(photoCb){const f=photoCb;photoCb=null;f(u);return}grab();draft.photo=u;drawStu()};im.onerror=()=>alert("ছবিটি পড়া যায়নি");im.src=url}
function photoFile(f){if(!f)return;if(f.size>5*1024*1024){alert("ছবি ৫ MB-এর বেশি হতে পারবে না");return}const r=new FileReader();r.onload=()=>shrink(r.result);r.readAsDataURL(f)}
async function pickPhoto(){
 const P=window.Capacitor&&Capacitor.Plugins;let err="";
 if(P&&P.Camera){
  try{const r=await P.Camera.getPhoto({quality:70,width:(photoDoc?1200:600),resultType:"dataUrl",source:"PHOTOS"});if(r&&r.dataUrl){shrink(r.dataUrl);return}}
  catch(e){if(e&&/cancel/i.test(e.message||""))return;err="Camera: "+(e.message||e)}
 }
 if(P&&P.FilePicker&&P.FilePicker.pickImages){
  try{const r=await P.FilePicker.pickImages({limit:1,readData:true});const f=r.files&&r.files[0];if(!f)return;
   shrink("data:"+(f.mimeType||"image/jpeg")+";base64,"+f.data);return}
  catch(e){if(e&&/cancel/i.test(e.message||""))return;err+=" FilePicker: "+(e.message||e)}
 }
 if(window.Capacitor&&Capacitor.isNativePlatform&&Capacitor.isNativePlatform()&&!(P&&(P.Camera||P.FilePicker))){alert("ছবি আপলোডের প্লাগিন অ্যাপে যুক্ত নেই। @capacitor/camera যোগ করে আবার বিল্ড করুন।");return}
 if(err)alert("ছবি খোলা যায়নি: "+err);
 $("ph").click();
}
function stuDel(id){if(!confirm("এই শিক্ষার্থী ও তার ফি রেকর্ড মুছে ফেলবেন?"))return;S.students=S.students.filter(x=>x.id!=id);S.fees=S.fees.filter(f=>f.sid!=id);delete selS[id];logA("edit","শিক্ষার্থী","শিক্ষার্থী মুছে ফেলা হয়েছে");save();closeM();render()}

let attView="list",attGroup="stu",attSub="daily",attFilter="all",attYear=new Date().getFullYear(),attMonth=new Date().getMonth(),attCls="",attBr="",attDraft={},qrMsg="";
const ST={p:["উপস্থিত","#16a34a"],a:["অনুপস্থিত","#e11d48"],l:["বিলম্ব","#f59e0b"],h:["ছুটি","#6b7385"]};
const MN=["জানুয়ারি","ফেব্রুয়ারি","মার্চ","এপ্রিল","মে","জুন","জুলাই","আগস্ট","সেপ্টেম্বর","অক্টোবর","নভেম্বর","ডিসেম্বর"];
const MC=["#3b82f6","#10b981","#f59e0b","#8b5cf6","#ec4899","#06b6d4","#84cc16","#f97316","#14b8a6","#a855f7","#eab308","#ef4444"];
const mk=(y,m)=>y+"-"+String(m+1).padStart(2,"0");
function members(all){
 if(attGroup=="tea")return S.teachers.filter(t=>t.status!="নিষ্ক্রিয়").map((t,i)=>({id:t.id,name:t.name,roll:String(i+1),cls:t.sub||t.desig||""}));
 if(attGroup=="staff")return S.staff.filter(t=>t.status!="নিষ্ক্রিয়").map((t,i)=>({id:t.id,name:t.name,roll:String(i+1),cls:t.role||t.desig||""}));
 return S.students.filter(s=>s.status!="নিষ্ক্রিয়"&&(all||((!attCls||s.cls==attCls)&&(!attBr||s.branch==attBr)))).sort(byRollCls).map(s=>({id:s.id,name:s.name,roll:s.roll||"",cls:s.cls||"",br:s.branch||""}));
}
function pctOf(ids,pre){let p=0,t=0;for(const d in S.att){if(!d.startsWith(pre))continue;const r=S.att[d];ids.forEach(id=>{const v=r[id];if(v=="p"||v=="l"){p++;t++}else if(v=="a")t++})}return t?Math.round(p/t*1000)/10:null}
function cnt(id,pre){const c={p:0,a:0,l:0,h:0};for(const d in S.att){if(d.startsWith(pre)){const v=S.att[d][id];if(v)c[v]++}}return c}
function ring(p,z){if(p==null)return '<span style="color:var(--mu)">—</span>';const r=z/2-4,c=2*Math.PI*r,col=p>=75?"#16a34a":p>=50?"#f59e0b":"#e11d48";return `<svg width="${z}" height="${z}"><circle cx="${z/2}" cy="${z/2}" r="${r}" fill="none" stroke="#e3e7f0" stroke-width="5"/><circle cx="${z/2}" cy="${z/2}" r="${r}" fill="none" stroke="${col}" stroke-width="5" stroke-dasharray="${c*p/100} ${c}" transform="rotate(-90 ${z/2} ${z/2})"/><text x="50%" y="55%" text-anchor="middle" font-size="9" font-weight="700" fill="currentColor">${bn(p)}%</text></svg>`}
function fillDraft(){members().forEach(m=>{if(!attDraft[m.id])attDraft[m.id]="p"})}
function initDraft(){attDraft={...(S.att[adate]||{})};fillDraft()}
function setView(v){attView=v;attSub="daily";if(v=="take")initDraft();render()}
function setGrp(g){attGroup=g;attCls="";attBr="";if(g=="stu"&&attSub=="salary")attSub="daily";if(attView=="take")fillDraft();render()}
function setAtt(id,k){attDraft[id]=k;const y=$("v").scrollTop;render();$("v").scrollTop=y}
function saveAtt(){S.att[adate]={...(S.att[adate]||{}),...attDraft};logA("edit","উপস্থিতি","হাজিরা সংরক্ষণ — "+adate);save();alert("হাজিরা সংরক্ষিত হয়েছে");render()}
function staffAdd(){ask("কর্মী যোগ",[["n","নাম","text"],["r","পদবি","text"],["p","মোবাইল","tel"]],v=>{if(!v[0]){alert("নাম দিন");return false}S.staff.push({id:uid(),name:v[0],role:v[1],phone:v[2]})})}
function staffDel(id){if(attGroup=="staff"&&confirm("এই কর্মীকে মুছবেন?")){S.staff=S.staff.filter(x=>x.id!=id);save();render()}}
function qrIn(){
 const v=$("qr").value.trim(),m=members().filter(x=>String(x.roll)==v||x.name==v);
 if(!m.length)qrMsg="❌ পাওয়া যায়নি";
 else if(m.length>1)qrMsg="⚠️ একাধিক পাওয়া গেছে, আগে শ্রেণি বাছুন";
 else if(attGroup!="stu")attPunch(m[0]);else{const d=S.att[adate]=S.att[adate]||{};d[m[0].id]="p";save();qrMsg="✅ "+m[0].name+" — উপস্থিত"}
 render();
}
function clsSel(withBr){
 if(attGroup!="stu")return "";
 const br=[...new Set(S.students.filter(s=>!attCls||s.cls==attCls).map(s=>s.branch).filter(Boolean))];
 return `<div><label class="lb">শ্রেণি</label><select onchange="attCls=this.value;attBr='';if(attView=='take')fillDraft();render()" style="margin:0"><option value="">সব শ্রেণি</option>${classes().map(c=>`<option ${attCls==c?"selected":""}>${esc(c)}</option>`).join("")}</select></div>`+(withBr?`<div><label class="lb">শাখা</label><select onchange="attBr=this.value;fillDraft();render()" style="margin:0"><option value="">সব</option>${br.map(b=>`<option ${attBr==b?"selected":""}>${esc(b)}</option>`).join("")}</select></div>`:"");
}
function att(){
 const ids=members(true).map(m=>m.id),day=S.att[adate]||{},take=attView=="take",Y=new Date().getFullYear();
 const c3=k=>ids.filter(id=>day[id]==k).length;
 const vals=MN.map((_,i)=>pctOf(ids,mk(attYear,i))),have=vals.filter(v=>v!=null),avg=have.length?Math.round(have.reduce((a,b)=>a+b,0)/have.length*10)/10:0;
 const dots=MN.map((_,i)=>{const a=i/12*2*Math.PI-Math.PI/2,v=vals[i];return `<circle cx="${(110+82*Math.cos(a)).toFixed(1)}" cy="${(110+82*Math.sin(a)).toFixed(1)}" r="${v==null?7:5+v/100*7}" fill="${MC[i]}"/>`}).join("");
 let h=`<div class="top" style="justify-content:space-between"><div><h1 style="font-size:20px">উপস্থিতি ব্যবস্থাপনা</h1><small style="color:var(--mu)">${new Date().toLocaleDateString(LC(),{weekday:"long"})}, ${bn(fdt(new Date()))}</small></div><div style="display:flex;gap:6px"><button class="tgb ${take?"":"on"}" onclick="setView('list')">তালিকা</button><button class="tgb ${take?"on":""}" onclick="setView('take')">উপস্থিতি নিন</button></div></div>
 <div class="g3"><div class="sc" style="background:#ecfdf5"><i style="color:#16a34a">✓</i><div><b style="color:#16a34a">${bn(c3("p"))}</b><small>উপস্থিত</small></div></div><div class="sc" style="background:#fff1f2"><i style="color:#e11d48">✕</i><div><b style="color:#e11d48">${bn(c3("a"))}</b><small>অনুপস্থিত</small></div></div><div class="sc" style="background:#fffbeb"><i style="color:#f59e0b">◔</i><div><b style="color:#f59e0b">${bn(c3("l"))}</b><small>বিলম্বিত</small></div></div></div>
 <div class="card"><div style="display:flex;justify-content:space-between;align-items:flex-start;gap:8px"><div><h2 style="margin:0">মাসিক উপস্থিতির রিপোর্ট</h2><small style="color:var(--mu);font-size:12px">গত ১২ মাসের গড় উপস্থিতির শতাংশ</small></div><div style="display:flex;gap:4px">${[Y-1,Y,Y+1].map(y=>`<button class="chip ${attYear==y?"on":""}" style="padding:6px 9px;font-size:12px" onclick="attYear=${y};render()">${bn(y)}</button>`).join("")}</div></div><span class="tag" style="margin-top:8px;display:inline-block">গড় ${bn(avg)}%</span>
 ${donut(vals.map((v,k)=>({v:v||0,c:MC[k]})),210,28,bn(avg)+"%",bn(attYear)+" গড় উপস্থিতি")}
 <div class="g2" style="gap:6px 14px;margin:0">${MN.map((m,i)=>`<div style="display:flex;align-items:center;gap:6px;font-size:13px"><i style="width:8px;height:8px;border-radius:50%;background:${MC[i]};flex:none"></i><span style="flex:1">${m}</span><span style="color:var(--mu)">${vals[i]==null?"—":bn(vals[i])+"%"}</span></div>`).join("")}</div></div>
 <div class="seg">${[["stu","শিক্ষার্থী"],["tea","শিক্ষক"],["staff","কর্মী"]].map(g=>`<button class="${attGroup==g[0]?"on":""}" onclick="setGrp('${g[0]}')">${g[1]}</button>`).join("")}</div>
 ${attGroup!="stu"?`<div style="margin:6px 0 8px"><div style="font-size:20px;font-weight:700">${attGroup=="tea"?"শিক্ষক উপস্থিতি":"কর্মী উপস্থিতি"}</div><div style="color:var(--mu);font-size:13px">দৈনিক ইন/আউট টাইম ও মাসিক বেতন রিপোর্ট</div></div><div style="display:flex;gap:8px;margin-bottom:10px"><button class="btn o" style="color:var(--tx);border-color:var(--ln)" onclick="attBulk()">👥 বাল্ক এন্ট্রি</button><button class="btn" onclick="attEntry()">＋ নতুন এন্ট্রি</button></div>`:""}<div class="sub">${[["daily","দৈনিক হাজিরা"],["qr","দ্রুত চেক-ইন"],["report","মাসিক প্রতিবেদন"],["register","মাসিক রেজিস্টার"]].concat(attGroup!="stu"?[["salary","বেতন হিসাব"]]:[]).map(t=>`<button class="${attSub==t[0]?"on":""}" onclick="attSub='${t[0]}';render()">${t[1]}</button>`).join("")}</div>`;
 if(attGroup=="staff")h+=`<button class="btn o s" style="margin-bottom:10px" onclick="pForm('staff')">+ কর্মী যোগ করুন</button>`;
 if(attGroup=="stu")h+=`<div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:10px"><button class="ob g s" onclick="bulkImportOpen()">⬆ Bulk marks/attendance CSV</button><input id="bulkCsvFile" type="file" accept=".csv,text/csv" style="position:absolute;left:-9999px;width:1px;height:1px;opacity:0" onchange="bulkImportFile(this.files[0]);this.value=''"></div>`;
 if(attSub=="daily")h+=take?dailyTake():dailyList(day);
 else if(attSub=="qr")h+=qrTab();
 else if(attSub=="salary"&&attGroup!="stu")h+=salTab();
 else h+=monthTab(attSub=="report");
 return h;
}
function dailyList(day){
 const l=members().filter(m=>attFilter=="all"||day[m.id]==attFilter);
 return `<div style="display:flex;gap:6px;overflow-x:auto;margin-bottom:10px">${[["all","সব"],["p","উপস্থিত"],["a","অনুপস্থিত"],["l","বিলম্বিত"]].map(f=>`<button class="chip ${attFilter==f[0]?"on":""}" onclick="attFilter='${f[0]}';render()">${f[1]}</button>`).join("")}</div>
 <div class="g2" style="margin-bottom:10px">${clsSel(false)}<div><label class="lb">তারিখ</label><input type="date" value="${adate}" onchange="adate=this.value;render()" style="margin:0"></div></div>
 <div class="card ov" style="padding:6px">${dailyTbl(l,day)}${l.length?"":'<div class="em">কোনো তথ্য নেই</div>'}</div>`;
}
function dailyTake(){
 const l=members(),pre=adate.slice(0,7);
 return `<div class="card"><div class="g2" style="margin:0">${clsSel(true)}<div><label class="lb">তারিখ</label><input type="date" value="${adate}" onchange="adate=this.value;initDraft();render()" style="margin:0"></div></div></div>
 <div class="card"><div style="display:flex;justify-content:space-between;align-items:center;gap:8px;margin-bottom:6px"><b style="font-size:14px">${attGroup=="stu"?esc((attCls||"সব শ্রেণি")+(attBr?", "+attBr+" শাখা":"")):attGroup=="tea"?"শিক্ষক":"কর্মী"} — ${bn(l.length)} জন</b><button class="btn s" onclick="saveAtt()">সংরক্ষণ করুন</button></div>
 ${l.map((m,i)=>`<div class="ar"><div class="ah"><span class="ai">${bn(i+1)}</span><div class="f"><b>${esc(m.name)}</b><small>রোল ${esc(m.roll)}</small></div>${ring(pctOf([m.id],pre),40)}</div><div class="ab">${Object.keys(ST).map(k=>`<button class="${attDraft[m.id]==k?"on":""}" style="--c:${ST[k][1]}" onclick="setAtt('${m.id}','${k}')">${ST[k][0]}</button>`).join("")}</div></div>`).join("")||'<div class="em">কেউ নেই। আগে শিক্ষার্থী/শিক্ষক/কর্মী যোগ করুন।</div>'}</div>`;
}
function qrTab(){
 return `<div class="card"><h2>দ্রুত চেক-ইন</h2><div class="g2" style="margin-bottom:6px">${clsSel(false)}</div><label class="lb">রোল নম্বর বা নাম</label><input id="qr" inputmode="text" placeholder="যেমন: ০১" onkeydown="if(event.key=='Enter')qrIn()"><button class="btn g" style="width:100%" onclick="qrIn()">উপস্থিত করুন</button>${qrMsg?`<p style="margin-top:10px;font-size:14px">${qrMsg}</p>`:""}</div>`;
}
function regTop(rep){
 const ttl=(rep?"মাসিক প্রতিবেদন":"মাসিক উপস্থিতি রেজিস্টার")+" — "+MN[attMonth]+" "+bn(attYear);
 const lg=["p","a","l","h"].filter(k=>ST[k]).map(k=>`<span style="display:inline-flex;align-items:center;gap:4px;margin-right:10px;font-size:12px"><b style="background:${ST[k][1]};color:#fff;border-radius:4px;padding:1px 6px;font-size:11px">${({p:"প",a:"অ",l:"বি",h:"ছু"})[k]}</b>${ST[k][0]}</span>`).join("");
 return `<div style="display:flex;justify-content:space-between;align-items:center;gap:8px;margin:4px 0 8px"><b style="font-size:15px;flex:1;min-width:0">${ttl}</b><button class="ob" style="padding:8px 12px;white-space:nowrap" onclick="regPdf(${rep?"true":"false"})">⬇ ডাউনলোড / প্রিন্ট</button></div>${rep?"":`<div style="margin:0 0 8px;line-height:1.9">${lg}</div>`}`;
}
function regPdf(rep){
 const pre=mk(attYear,attMonth),l=members(),n=new Date(attYear,attMonth+1,0).getDate(),L={p:"প",a:"অ",l:"বি",h:"ছু"};
 if(!l.length){alert("কোনো তথ্য নেই");return}
 const ttl=(rep?"মাসিক প্রতিবেদন":"মাসিক উপস্থিতি রেজিস্টার")+" — "+MN[attMonth]+" "+bn(attYear);
 const b="border:1px solid #666;padding:3px 1px;font-size:8px;text-align:center;overflow:hidden",hd=b+";background:#eef3f3;font-weight:700",nm="border:1px solid #666;padding:3px 4px;font-size:9px;text-align:left";
 const sub=m=>[m.cls,m.branch,m.roll?"রোল "+m.roll:""].filter(Boolean).join(" · ");
 const who=m=>`<div style="font-weight:700">${esc(m.name)}</div>${sub(m)?`<div style="font-size:7px;color:#555">${esc(sub(m))}</div>`:""}`;
 const lgd=["p","a","l","h"].filter(k=>ST[k]).map(k=>L[k]+" = "+ST[k][0]).join("  ·  ");
 let tb;
 if(rep){
  tb=`<table style="table-layout:fixed;width:100%;border-collapse:collapse"><tr><th style="${hd};width:30%">নাম</th><th style="${hd}">উপস্থিত</th><th style="${hd}">অনুপস্থিত</th><th style="${hd}">বিলম্বে</th><th style="${hd}">ছুটি</th><th style="${hd}">হার %</th></tr>${l.map(m=>{const c=cnt(m.id,pre);return `<tr><td style="${nm}">${who(m)}</td><td style="${b}">${bn(c.p)}</td><td style="${b}">${bn(c.a)}</td><td style="${b}">${bn(c.l)}</td><td style="${b}">${bn(c.h)}</td><td style="${b}">${bn(pctOf([m.id],pre)||0)}%</td></tr>`}).join("")}</table>`;
 }else{
  tb=`<table style="table-layout:fixed;width:100%;border-collapse:collapse"><colgroup><col style="width:112px">${Array.from({length:n},()=>'<col>').join("")}<col style="width:22px"><col style="width:22px"><col style="width:22px"><col style="width:22px"></colgroup><tr><th style="${hd};text-align:left;padding-left:4px">নাম</th>${Array.from({length:n},(_,i)=>`<th style="${hd}">${bn(i+1)}</th>`).join("")}<th style="${hd}">উপ.</th><th style="${hd}">অনু.</th><th style="${hd}">বিল.</th><th style="${hd}">ছুটি</th></tr>${l.map(m=>{const c=cnt(m.id,pre);return `<tr><td style="${nm}">${who(m)}</td>${Array.from({length:n},(_,i)=>{const v=(S.att[pre+"-"+String(i+1).padStart(2,"0")]||{})[m.id];return `<td style="${b};color:${v&&ST[v]?ST[v][1]:"#999"};font-weight:700">${v&&L[v]?L[v]:""}</td>`}).join("")}<td style="${b}">${bn(c.p)}</td><td style="${b}">${bn(c.a)}</td><td style="${b}">${bn(c.l)}</td><td style="${b}">${bn(c.h)}</td></tr>`}).join("")}</table>`;
 }
 printDoc((rep?"attendance-summary-":"attendance-register-")+pre,pdfHdr(ttl)+`<div style="font-size:10px;color:#444;margin:0 0 8px;text-align:center">${rep?"":esc(lgd)+" &nbsp;|&nbsp; "}মোট ${bn(l.length)} জন</div>`+tb);
}
function monthTab(rep){
 const pre=mk(attYear,attMonth),l=members(),n=new Date(attYear,attMonth+1,0).getDate();
 let h=`<div class="g2" style="margin-bottom:10px"><div><select onchange="attMonth=+this.value;render()" style="margin:0">${MN.map((m,i)=>`<option value="${i}" ${attMonth==i?"selected":""}>${m} ${bn(attYear)}</option>`).join("")}</select></div>${clsSel(false)}</div>`;
 if(rep)return h+regTop(true)+(attGroup!="stu"?repCards(l,pre):"")+`<div class="card ov" style="padding:6px"><table class="tb"><tr><th>নাম</th><th>উপ.</th><th>অনু.</th><th>বিল.</th><th>ছুটি</th><th>%</th>${attGroup!="stu"?"<th>ঘণ্টা</th>":""}</tr>${l.map(m=>{const c=cnt(m.id,pre);return `<tr><td>${esc(m.name)}</td><td>${bn(c.p)}</td><td>${bn(c.a)}</td><td>${bn(c.l)}</td><td>${bn(c.h)}</td><td>${ring(pctOf([m.id],pre),36)}</td>${attGroup!="stu"?`<td>${hrsM(m.id,pre)}</td>`:""}</tr>`}).join("")}</table>${l.length?"":'<div class="em">কোনো তথ্য নেই</div>'}</div>`;
 const L={p:"প",a:"অ",l:"বি",h:"ছু"};
 return h+regTop(false)+`<div class="card ov" style="padding:6px"><table class="tb"><tr><th>নাম</th>${Array.from({length:n},(_,i)=>`<th>${bn(i+1)}</th>`).join("")}</tr>${l.map(m=>`<tr><td>${esc(m.name)}</td>${Array.from({length:n},(_,i)=>{const v=(S.att[pre+"-"+String(i+1).padStart(2,"0")]||{})[m.id];return `<td style="text-align:center;color:${v?ST[v][1]:"var(--mu)"}">${v?L[v]:"·"}</td>`}).join("")}</tr>`).join("")}</table>${l.length?"":'<div class="em">কোনো তথ্য নেই</div>'}</div>`;
}
let sub="",curExam="",repSid="",smsCls="",smsMsg="";
const gr=p=>p>=80?"A+":p>=70?"A":p>=60?"A-":p>=50?"B":p>=40?"C":p>=33?"D":"F";
function ask(t,fs,cb){window._cb=cb;window._fs=fs;modal(`<h2 style="margin-bottom:8px">${t}</h2>`+fs.map((f,i)=>`<label class="lb">${f[1]}</label>`+(f[2]=="select"?`<select id="q${i}">${f[3].map(o=>`<option value="${esc(o[0])}">${esc(o[1])}</option>`).join("")}</select>`:`<input id="q${i}" type="${f[2]}" value="${esc(f[3]||"")}">`)).join("")+`<button class="btn" style="width:100%;margin-top:10px" onclick="askOk()">সংরক্ষণ করুন</button>`)}
function askOk(){const v=window._fs.map((f,i)=>$("q"+i).value.trim());if(window._cb(v)!==false){save();closeM();render()}}
const fi=(l,id,v,t,r,ph,x)=>`<label class="lb">${l}${r?" *":""}</label><input id="${id}" type="${t||"text"}" value="${esc(v)}" placeholder="${esc(ph||"")}" ${x||""}>`;
const fsel=(l,id,o,v,r,ph)=>`<label class="lb">${l}${r?" *":""}</label><select id="${id}">${ph?`<option value="">${ph}</option>`:""}${o.map(x=>{const a=Array.isArray(x)?x:[x,x];return `<option value="${esc(a[0])}" ${v==a[0]?"selected":""}>${esc(a[1])}</option>`}).join("")}</select>`;
const gv=id=>{const e=$(id);return e?e.value.trim():""};
const allCls=()=>[...new Set([...classes(),...S.routine.map(r=>r.cls),...S.tbooks.map(b=>b.cls)])].filter(Boolean);
const phdr=(t,sb)=>`<h1 style="font-size:20px">${t}</h1><small style="color:var(--mu)">${sb}</small>`;
function pdfHdr(t,flat){
 const sc=S.school,B="#0f4c5c",lg=sc.logo?`<img src="${safeDataImage(sc.logo)}" style="width:50px;height:50px;border-radius:50%;object-fit:cover;background:#fff">`:'<div style="width:50px;height:50px;border-radius:50%;border:2px solid #7fc8d6;color:#7fc8d6;font-size:10px;display:flex;align-items:center;justify-content:center">logo</div>',cell="flex:1;padding:5px;border:1px solid #9fd3da";
 const head=`<div style="background:${B};color:#fff;padding:10px;display:flex;align-items:center;gap:8px">${lg}<div style="text-align:center;flex:1"><div style="font-size:19px;font-weight:700">${esc(sc.name)}</div><div style="color:#ffd54a;font-size:12px;font-weight:700">${esc(sc.nameEn||"")}</div></div>${lg}</div><div style="background:#127a8c;color:#fff;text-align:center;font-size:12px;padding:5px">${esc(sc.addr||"")}</div><div style="display:flex;font-size:11px;text-align:center;background:#d9f2f5;color:#0f4c5c"><div style="${cell}">পরিচালক: ${esc(sc.director||"—")}</div><div style="${cell}">স্থাপিত: ${esc(sc.est||"—")} | শিক্ষাবর্ষ: ${esc(sc.year||"—")}</div><div style="${cell}">মোবাইল: ${esc(sc.phone||"—")}</div></div>`;
 const chip=t?`<div style="text-align:center;margin:8px 0"><span style="background:#e5e7eb;border-radius:20px;padding:4px 14px;font-size:12px;font-weight:700;display:inline-block">${t}</span></div>`:"";
 return flat?`<div>${head}${chip}</div>`:`<div style="font-family:sans-serif;color:#222;border:2px solid ${B};border-radius:10px;overflow:hidden;margin:0 0 10px;background:#fff">${head}${chip}</div>`;
}
const sch=t=>pdfHdr(t);

/* ---- hub ---- */
function clsHub(){
 const T=today(),it=[["rt","📅","সাপ্তাহিক ক্লাস রুটিন","প্রতিটি শ্রেণীর জন্য দিন ও পিরিয়ড টাইমটেবিল",bn(S.routine.length)+" টি রুটিন"],["ev","🎉","ইভেন্ট ক্যালেন্ডার","ইভেন্ট, পরীক্ষা ও ছুটির ক্যালেন্ডার",bn(S.events.length)+" টি ইভেন্ট"],["hw","📝","পড়া ও বাড়ির কাজ",(isParent()?"দৈনিক পড়া ও বাড়ির কাজ দেখুন":"দৈনিক পড়া ও বাড়ির কাজ আপডেট করুন"),bn(S.hw.filter(h=>h.date==T).length)+" টি আজকের"],["bk","📚","শ্রেণী ও পাঠ্যবই","শ্রেণিভিত্তিক পাঠ্যবইয়ের তালিকা",bn(S.tbooks.length)+" টি বই"]];
 return phdr("শ্রেণী ও পাঠ্য","ক্লাস রুটিন, ইভেন্ট, পড়া ও পাঠ্যবই এক জায়গায়")+`<div style="margin-top:12px">${it.map(x=>`<div class="hb" onclick="sub='${x[0]}';render()"><div class="ic2">${x[1]}</div><div class="f"><b>${x[2]}</b><small style="color:var(--mu);font-size:12px">${x[3]}</small></div><span class="pl b">${x[4]}</span></div>`).join("")}</div>`;
}

/* ---- weekly routine ---- */
const DAYS=["শনিবার","রবিবার","সোমবার","মঙ্গলবার","বুধবার","বৃহস্পতিবার","শুক্রবার"],DSH=["শনি","রবি","সোম","মঙ্গল","বুধ","বৃহ","শুক্র"];
let rtE=null,rtMn="";
document.addEventListener("click",e=>{if(rtMn&&!(e.target.closest&&e.target.closest(".rtm"))){rtMn="";if(typeof sub!="undefined"&&sub=="rt")render()}});
const tm=m=>p2(Math.floor(m/60))+":"+p2(m%60);
function rtDefault(c){return {cls:c,periods:6,days:[0,1,2,3,4,5],times:Array.from({length:10},(_,i)=>({s:tm(480+i*45),e:tm(480+i*45+40)})),cells:{}}}
function rtOpen(c){if(isParent())return;const ex=S.routine.find(r=>r.cls==c);rtE=ex?JSON.parse(JSON.stringify(ex)):rtDefault(c);const d=rtDefault(c);while(rtE.times.length<10)rtE.times.push(d.times[rtE.times.length]);render()}
function rtNew(){if(isParent())return;const cl=allCls();if(!cl.length){alert("আগে শিক্ষার্থী যোগ করুন");return}rtOpen(cl.find(c=>!S.routine.some(r=>r.cls==c))||cl[0])}
const rtFilled=r=>Object.keys(r.cells).filter(k=>{const a=k.split("|");return r.days.includes(+a[0])&&+a[1]<=r.periods&&r.cells[k].s}).length;
function rt(){
 return phdr("সাপ্তাহিক ক্লাস রুটিন",isParent()?"প্রতিটি শ্রেণীর দিন ও পিরিয়ড টাইমটেবিল":"প্রতিটি শ্রেণীর জন্য দিন ও পিরিয়ড টাইমটেবিল তৈরি করুন")+(rtE?rtEditor():(isParent()?"":`<button class="btn" style="margin:12px 0" onclick="rtNew()">✎ নতুন / সম্পাদনা</button>`)+(S.routine.map(r=>`<div class="hb"><div class="ic2">📅</div><div class="f"><b>${esc(r.cls)}</b><div style="margin-top:4px"><span class="pl b">${bn(r.periods)} পিরিয়ড</span><span class="pl g">${bn(r.days.length)} দিন</span><span class="pl">${bn(rtFilled(r))} টি</span></div></div><div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;justify-content:flex-end"><div class="rtm"><button class="ob" style="padding:8px 10px" onclick="event.stopPropagation();rtMn=rtMn=='${jsq(r.cls)}'?'':'${jsq(r.cls)}';render()">🗎 PDF ${rtMn==r.cls?"▴":"▾"}</button>${rtMn==r.cls?`<div class="mn"><button onclick="rtMn='';rtView('${jsq(r.cls)}')">👁 ভিউ রুটিন</button><button onclick="rtMn='';rtPdf('${jsq(r.cls)}')">⬇ ডাউনলোড PDF</button></div>`:""}</div>${isParent()?"":`<button class="ob" style="padding:8px 10px" onclick="rtOpen('${jsq(r.cls)}')">✎ সম্পাদনা</button>`}</div></div>`).join("")||(isParent()?'<div class="em">কোনো রুটিন নেই</div>':'<div class="em">কোনো রুটিন নেই। "নতুন / সম্পাদনা" চাপুন।</div>')));
}
function rtEditor(){
 const e=rtE,tn=S.teachers.map(t=>t.name);
 const cell=(d,p)=>{const c=e.cells[d+"|"+p]||{};return `<td style="min-width:108px;vertical-align:top"><input value="${esc(c.s)}" placeholder="বিষয়" oninput="rtC(${d},${p},'s',this.value)" style="margin:0 0 4px;padding:6px;font-size:12px"><select onchange="rtC(${d},${p},'t',this.value)" style="margin:0;padding:5px;font-size:11px"><option value="">শিক্ষক</option>${tn.map(n=>`<option ${c.t==n?"selected":""}>${esc(n)}</option>`).join("")}</select></td>`};
 return `<div class="top" style="margin:12px 0"><button class="ob" onclick="rtE=null;render()">≡ তালিকা</button><button class="ob" onclick="rtPdf(rtE.cls)">🗎 PDF ডাউনলোড</button></div>
 <div class="card">${fsel("শ্রেণী","rt_c",allCls(),e.cls,1).replace("<select ",'<select onchange="rtOpen(this.value)" ')}${fi("পিরিয়ড সংখ্যা","rt_p",e.periods,"number",1,"","min=1 max=10 onchange=\"rtP(this.value)\"")}<div class="hint">প্রতিদিনের পিরিয়ড (১–১০) ও ক্লাসের দিন বেছে নিন।</div><label class="lb">ক্লাসের দিন</label><div style="display:flex;gap:6px;flex-wrap:wrap">${DSH.map((d,i)=>`<button class="chip ${e.days.includes(i)?"on":""}" onclick="rtDay(${i})">${d}</button>`).join("")}</div></div>
 <div class="card ov" style="padding:6px"><table class="tb rtt"><tr><th>পিরিয়ড</th>${e.days.map(d=>`<th>${DSH[d]}</th>`).join("")}</tr>${Array.from({length:e.periods},(_,i)=>`<tr><td style="width:96px;min-width:96px;vertical-align:top"><b>${bn(i+1)}</b><input type="time" value="${e.times[i].s}" onchange="rtT(${i},'s',this.value)" style="display:block;width:90px;margin:2px 0;padding:3px;font-size:10px"><input type="time" value="${e.times[i].e}" onchange="rtT(${i},'e',this.value)" style="display:block;width:90px;margin:0;padding:3px;font-size:10px"></td>${e.days.map(d=>cell(d,i+1)).join("")}</tr>`).join("")}</table></div>
 <button class="btn" style="width:100%" onclick="rtSave()">সংরক্ষণ করুন</button><div class="g2" style="margin:8px 0 0"><button class="btn o" onclick="rtE=null;render()">বাতিল</button><button class="btn r" onclick="rtDel(rtE.cls)">মুছে ফেলুন</button></div>`;
}
function rtC(d,p,k,v){const key=d+"|"+p;(rtE.cells[key]=rtE.cells[key]||{})[k]=v}
function rtT(i,k,v){rtE.times[i][k]=v}
function rtP(v){rtE.periods=Math.max(1,Math.min(10,+v||1));render()}
function rtDay(i){const d=rtE.days;if(d.includes(i)){if(d.length>1)rtE.days=d.filter(x=>x!=i)}else{d.push(i);d.sort((a,b)=>a-b)}render()}
function rtSave(){const e=rtE,i=S.routine.findIndex(r=>r.cls==e.cls),o={...e,times:e.times.slice(0,10)};if(i>=0)S.routine[i]=o;else S.routine.push(o);logA("add","ক্লাস রুটিন",e.cls+" শ্রেণীর রুটিন সংরক্ষিত");save();rtE=null;render()}
function rtDel(c){if(!confirm(c+" শ্রেণীর রুটিন মুছবেন?"))return;S.routine=S.routine.filter(r=>r.cls!=c);save();rtE=null;render()}
function rtTbl(r,cls){return `<table class="ptb" style="border:1px solid #1d4ed8"><tr><th style="background:#2563eb;color:#fff">পিরিয়ড</th>${r.days.map(d=>`<th style="background:#2563eb;color:#fff">${DAYS[d]}</th>`).join("")}</tr>${Array.from({length:r.periods},(_,i)=>`<tr><td><b>${bn(i+1)}</b><br><small>${bn(r.times[i].s)} - ${bn(r.times[i].e)}</small></td>${r.days.map(d=>{const c2=r.cells[d+"|"+(i+1)]||{};return `<td>${esc(c2.s||"")}${c2.t?`<br><small style="color:#555">${esc(c2.t)}</small>`:""}</td>`}).join("")}</tr>`).join("")}</table>`}
function rtDoc(r,c){return sch()+`<div style="text-align:center;margin-bottom:10px">সাপ্তাহিক ক্লাস রুটিন — শ্রেণি: <b>${esc(c)}</b></div>${rtTbl(r)}<style>.ptb td,.ptb th{border:1px solid #b9e6cd;font-size:12px;padding:6px 7px}</style>`}
function rtPdf(c){
 const r=(rtE&&rtE.cls==c)?rtE:S.routine.find(x=>x.cls==c);if(!r){alert("রুটিন পাওয়া যায়নি");return}
 printDoc("class-routine",rtDoc(r,c));
}
function rtView(c){
 const r=(rtE&&rtE.cls==c)?rtE:S.routine.find(x=>x.cls==c);if(!r){alert("রুটিন পাওয়া যায়নি");return}
 modal(HND+`<h2 style="text-align:center;font-size:16px;margin-bottom:4px">সাপ্তাহিক ক্লাস রুটিন</h2><div style="text-align:center;font-size:13px;color:var(--mu);margin-bottom:10px">শ্রেণি: <b style="color:var(--tx)">${esc(c)}</b></div><div class="ov" style="background:#fff;color:#111;border-radius:10px;padding:6px;border:1px solid var(--ln)"><style>.rtv td,.rtv th{border:1px solid #b9e6cd;font-size:12px;padding:6px 7px;text-align:center;color:#111}</style><div class="rtv">${rtTbl(r)}</div></div><div class="g2" style="margin:10px 0 0"><button class="btn o" onclick="closeM()">বন্ধ</button><button class="btn" onclick="closeM();rtPdf('${jsq(c)}')">⬇ ডাউনলোড PDF</button></div>`);
}

/* ---- events ---- */
const EVT={"ইভেন্ট":"#ec4899","ছুটি":"#ef4444","পরীক্ষা":"#10b981","সভা":"#f59e0b","অন্যান্য":"#8b5cf6"},EVI={"ইভেন্ট":"🎉","ছুটি":"🏖","পরীক্ষা":"📝","সভা":"👥","অন্যান্য":"📌"};
let evView="cal",evM=new Date().getMonth(),evY=new Date().getFullYear(),evSel=today();
const evAll=()=>S.events.concat(S.exams.filter(x=>x.date).map(x=>({id:"x"+x.id,name:x.name+" — "+(x.subject||"")+" ("+x.cls+")",type:"পরীক্ষা",start:x.date,end:x.date,auto:1})));
const evOn=d=>evAll().filter(e=>e.start<=d&&d<=(e.end||e.start));
function evCard(e){return `<div class="card" style="border-left:4px solid ${EVT[e.type]||"#8b5cf6"};padding:10px;margin-bottom:8px"><div class="ch" style="margin:0"><b>${esc(e.name)}</b>${e.auto||isParent()?"":`<span onclick="evForm('${e.id}')" style="padding:0 6px">✏️</span>`}</div><span class="pl" style="background:${EVT[e.type]||"#8b5cf6"}22;color:${EVT[e.type]||"#8b5cf6"}">${EVI[e.type]||""} ${esc(e.type)}</span><div style="font-size:12px;color:var(--mu)">📅 ${bn(e.start)}${e.end&&e.end!=e.start?" — "+bn(e.end):""}${e.place?" · 📍 "+esc(e.place):""}</div>${e.desc?`<div style="font-size:12px;margin-top:4px">${esc(e.desc)}</div>`:""}</div>`}
function ev(){
 const all=evAll(),mo=mk(evY,evM),first=(new Date(evY,evM,1).getDay()+1)%7,dim=new Date(evY,evM+1,0).getDate(),T=today();
 const cells=Array.from({length:first},()=>"<div></div>").concat(Array.from({length:dim},(_,i)=>{const d=mo+"-"+p2(i+1),es=evOn(d);return `<div class="cd ${d==evSel?"sel":""} ${d==T?"td":""}" onclick="evSel='${d}';render()"><span>${bn(i+1)}</span><div>${es.slice(0,3).map(e=>`<i style="background:${EVT[e.type]||"#8b5cf6"}"></i>`).join("")}</div></div>`}));
 const lst=all.slice().sort((a,b)=>a.start>b.start?1:-1);
 return phdr("ইভেন্ট ও ছুটির ক্যালেন্ডার","ইভেন্ট, পরীক্ষা ও ছুটির তালিকা")+`<div style="display:flex;gap:8px;flex-wrap:wrap;margin:12px 0">${isParent()?"":`<button class="btn" style="background:#f97316" onclick="evForm()">＋ নতুন ইভেন্ট</button>`}<button class="ob" onclick="evPdf()">🗎 PDF</button></div>
 <div class="g2">${["ইভেন্ট","ছুটি","পরীক্ষা","সভা"].map(t=>`<div class="sc" style="background:${EVT[t]}22"><i style="color:${EVT[t]}">${EVI[t]}</i><div><b style="color:${EVT[t]}">${bn(all.filter(e=>e.type==t).length)}</b><small>${t}</small></div></div>`).join("")}</div>
 <div class="seg" style="width:70%">${[["cal","ক্যালেন্ডার"],["list","তালিকা"]].map(v=>`<button class="${evView==v[0]?"on":""}" style="${evView==v[0]?"color:#f97316":""}" onclick="evView='${v[0]}';render()">${v[1]}</button>`).join("")}</div>`
 +(evView=="cal"?`<div class="card" style="padding:10px"><div class="ch"><button class="ob" style="padding:4px 12px" onclick="evMv(-1)">‹</button><b>${MN[evM]} ${bn(evY)}</b><button class="ob" style="padding:4px 12px" onclick="evMv(1)">›</button></div><div class="cal">${DSH.map(d=>`<div class="wd">${d}</div>`).join("")}${cells.join("")}</div></div><b style="font-size:14px">${bn(evSel)} তারিখের ইভেন্ট</b><div style="margin-top:8px">${evOn(evSel).map(evCard).join("")||'<div class="em">এই দিনে কোনো ইভেন্ট নেই</div>'}</div>`:lst.map(evCard).join("")||'<div class="em">কোনো ইভেন্ট নেই</div>');
}
function evMv(n){evM+=n;if(evM<0){evM=11;evY--}if(evM>11){evM=0;evY++}render()}
function evForm(id){if(isParent())return;if(!allow("classes"))return;
 const e=S.events.find(x=>x.id==id)||{type:"ইভেন্ট",start:evSel||today()};
 modal(HND+`<h2 style="text-align:center;font-size:16px;margin-bottom:6px">${id?"ইভেন্ট সম্পাদনা":"নতুন ইভেন্ট যোগ"}</h2>${fi("ইভেন্টের নাম","ev_n",e.name,"text",1,"ইভেন্টের নাম লিখুন")}<div class="g2" style="margin:0"><div>${fsel("ধরন","ev_t",Object.keys(EVT),e.type,1)}</div><div>${fi("স্থান","ev_p",e.place,"text",0,"স্থান")}</div><div>${fi("তারিখ","ev_s",e.start,"date",1)}</div><div>${fi("শেষ তারিখ","ev_e",e.end,"date")}</div></div><label class="lb">বিবরণ</label><textarea id="ev_d" rows="3" placeholder="বিবরণ">${esc(e.desc)}</textarea>${fi("মন্তব্য","ev_o",e.note,"text",0,"অতিরিক্ত তথ্য (ঐচ্ছিক)")}
 <div class="bt"><button class="btn o" onclick="closeM()">বাতিল</button><button class="btn" onclick="evSave('${id||""}')">সংরক্ষণ</button></div>${id?`<button class="btn r" style="width:100%;margin-top:8px" onclick="evDel('${id}')">মুছে ফেলুন</button>`:""}`);$("mt").onclick=null;
}
function evSave(id){
 const o={name:gv("ev_n"),type:gv("ev_t"),place:gv("ev_p"),start:gv("ev_s"),end:gv("ev_e"),desc:gv("ev_d"),note:gv("ev_o")};
 if(!o.name||!o.start){alert("ইভেন্টের নাম ও তারিখ দিন");return}
 if(o.end&&o.end<o.start){alert("শেষ তারিখ শুরুর আগে হতে পারে না");return}
 if(id)Object.assign(S.events.find(x=>x.id==id),o);else S.events.push({id:uid(),...o});
 logA(id?"edit":"add","ইভেন্ট",(id?"ইভেন্ট আপডেট: ":"নতুন ইভেন্ট: ")+o.name);save();closeM();render();
}
function evDel(id){if(!confirm("ইভেন্টটি মুছবেন?"))return;S.events=S.events.filter(x=>x.id!=id);save();closeM();render()}
function evPdf(){
 const mo=mk(evY,evM),l=evAll().filter(e=>e.start.slice(0,7)<=mo&&(e.end||e.start).slice(0,7)>=mo).sort((a,b)=>a.start>b.start?1:-1);
 printDoc("events",sch()+`<style>.ptb td,.ptb th{border:1px solid #b9e6cd;font-size:12px;padding:6px 7px}</style><div style="text-align:center;margin-bottom:10px">ইভেন্ট ও ছুটির ক্যালেন্ডার — ${MN[evM]} ${bn(evY)}</div><table class="ptb" style="border:1px solid #1d4ed8"><tr><th>তারিখ</th><th>ইভেন্ট</th><th>ধরন</th><th>স্থান</th><th>বিবরণ</th></tr>${l.map(e=>`<tr><td>${bn(e.start)}${e.end&&e.end!=e.start?" — "+bn(e.end):""}</td><td>${esc(e.name)}</td><td>${esc(e.type)}</td><td>${esc(e.place||"")}</td><td>${esc(e.desc||"")}</td></tr>`).join("")||'<tr><td colspan="5">কোনো ইভেন্ট নেই</td></tr>'}</table>`);
}

/* ---- homework ---- */
let hwDate=today(),hwCls="",hwF=null,hwMode="month";
const hwStart=()=>{const d=new Date(),p=n=>String(n).padStart(2,"0");d.setDate(d.getDate()-29);return d.getFullYear()+"-"+p(d.getMonth()+1)+"-"+p(d.getDate())};
const hwList=()=>{const st=hwStart(),l=S.hw.filter(h=>(hwMode=="month"?(h.date||"")>=st:(!hwDate||h.date==hwDate))&&(!hwCls||h.cls==hwCls));return hwMode=="month"?l.slice().sort((a,b)=>(b.date||"")>(a.date||"")?1:(b.date||"")<(a.date||"")?-1:String(a.cls).localeCompare(String(b.cls))):l};
const HWD=["রবিবার","সোমবার","মঙ্গলবার","বুধবার","বৃহস্পতিবার","শুক্রবার","শনিবার"];
const hwDayLbl=d=>{const x=new Date(d+"T00:00:00");return isNaN(x)?esc(d||"তারিখ নেই"):bn(fdt(d))+" · "+HWD[x.getDay()]+(d==today()?" (আজ)":"")};
const hwCard=h=>`<div class="card"><div class="ch" style="margin:0"><div><b>${esc(h.subject)}</b> <span class="pl b">${esc(h.cls)}</span></div>${isParent()?"":`<span onclick="hwForm('${h.id}')" style="padding:0 6px">✏️</span>`}</div>${h.title?`<div style="font-size:14px;margin-top:4px"><b>${esc(h.title)}</b></div>`:""}${h.lesson?`<div style="font-size:13px;margin-top:4px">📖 আজকের পড়া: ${esc(h.lesson)}</div>`:""}${(h.homework||h.text)?`<div style="font-size:13px;margin-top:4px">📝 বাড়ির কাজ: ${esc(h.homework||h.text)}</div>`:""}${h.teacher?`<small style="color:var(--mu)">👤 ${esc(h.teacher)}</small>`:""}</div>`;
function hw(){
  const l=hwList(),mo=hwMode=="month",clsSel=`<select onchange="hwCls=this.value;render()" style="margin:0"><option value="">সব শ্রেণী</option>${allCls().map(c=>`<option ${hwCls==c?"selected":""}>${esc(c)}</option>`).join("")}</select>`;
  let body;
  if(mo){
    const days=[...new Set(l.map(h=>h.date||""))];
    body=days.map(d=>`<div style="display:flex;align-items:center;gap:8px;margin:14px 2px 8px"><b style="font-size:14px;color:var(--pri)">📅 ${hwDayLbl(d)}</b><span class="tag">${bn(l.filter(h=>(h.date||"")==d).length)}টি</span></div>`+l.filter(h=>(h.date||"")==d).map(hwCard).join("")).join("");
  }else body=l.map(hwCard).join("");
  if(!body)body=`<div class="card" style="text-align:center;padding:24px"><div style="font-size:34px;color:var(--mu)">📖</div><div style="color:var(--mu);margin:8px 0">${mo?"গত ১ মাসে কোনো পড়া আপডেট করা হয়নি":"এই তারিখের পড়া এখনো আপডেট হয়নি"}</div>${isParent()?"":`<button class="btn s" onclick="hwForm()">＋ আপডেট করুন</button>`}</div>`;
  return phdr("আজকের পড়া ও বাড়ির কাজ",isParent()?"শ্রেণিভিত্তিক দৈনিক পড়া ও বাড়ির কাজ":"শ্রেণিভিত্তিক দৈনিক পড়া ও বাড়ির কাজ আপডেট করুন")+`<div style="display:flex;gap:8px;flex-wrap:wrap;margin:12px 0">${isParent()?"":`<button class="btn" onclick="hwForm()">＋ নতুন কাজ যোগ</button>`}<button class="ob" onclick="hwPdf()">🗎 PDF</button></div>
<div class="seg"><button class="${mo?"on":""}" onclick="hwMode='month';render()">🗓 গত ১ মাস</button><button class="${mo?"":"on"}" onclick="hwMode='day';render()">📅 নির্দিষ্ট দিন</button></div>
`+(mo?`<div style="display:flex;gap:8px;align-items:center;margin-bottom:4px"><div style="flex:1">${clsSel}</div></div><small style="color:var(--mu)">${bn(fdt(hwStart()))} থেকে ${bn(fdt(today()))} — মোট ${bn(l.length)}টি</small>`:`<div class="g2"><input type="date" value="${hwDate}" onchange="hwDate=this.value;render()" style="margin:0">${clsSel}</div>`)+body;
}
function hwForm(id){if(isParent())return;if(!allow("classes"))return;
 if(!allCls().length){alert("আগে শিক্ষার্থী যোগ করুন");return}
 const o=S.hw.find(x=>x.id==id);
 hwF=o?{id,date:o.date,cls:o.cls,teacher:o.teacher||"",blocks:[{subject:o.subject,title:o.title||"",lesson:o.lesson||"",homework:o.homework||o.text||""}]}:{id:null,date:hwDate||today(),cls:hwCls||allCls()[0],teacher:"",blocks:[{subject:"",title:"",lesson:"",homework:""}]};
 drawHw();
}
function hwGrab(){hwF.date=gv("hf_d");hwF.cls=gv("hf_c");hwF.teacher=gv("hf_t");hwF.blocks.forEach((b,i)=>{b.subject=gv("hb"+i+"s");b.title=gv("hb"+i+"t");b.lesson=gv("hb"+i+"l");b.homework=gv("hb"+i+"h")})}
function hwAddB(){hwGrab();hwF.blocks.push({subject:"",title:"",lesson:"",homework:""});drawHw()}
function hwRm(i){hwGrab();hwF.blocks.splice(i,1);drawHw()}
function drawHw(){
 const subs=[...new Set(S.tbooks.map(b=>b.subject).filter(Boolean).concat(S.exams.flatMap(e=>Object.values(e.sub||{}).flat().map(r=>r.s))))];
 modal(HND+`<h2 style="text-align:center;font-size:16px;margin-bottom:6px">${hwF.id?"কাজ সম্পাদনা":"নতুন পড়া ও বাড়ির কাজ"}</h2><div class="g2" style="margin:0"><div>${fi("তারিখ","hf_d",hwF.date,"date",1)}</div><div>${fsel("শ্রেণী","hf_c",allCls(),hwF.cls,1)}</div></div><datalist id="hsub">${subs.map(x=>`<option value="${esc(x)}">`).join("")}</datalist>`
 +hwF.blocks.map((b,i)=>`<div class="card" style="padding:10px;margin:8px 0"><div class="ch" style="margin:0"><b style="font-size:13px">বিষয় ${bn(i+1)}</b>${hwF.blocks.length>1?`<span onclick="hwRm(${i})" style="color:var(--rd);padding:0 6px">✕</span>`:""}</div>${fi("বিষয়","hb"+i+"s",b.subject,"text",1,"বিষয়ের নাম",'list="hsub"')}${fi("শিরোনাম","hb"+i+"t",b.title,"text",0,"পাঠের শিরোনাম")}<label class="lb">আজকের পড়া/টাস্ক (নির্দেশনা)</label><textarea id="hb${i}l" rows="2" placeholder="কোন অধ্যায়/পৃষ্ঠা পড়াতে হবে">${esc(b.lesson)}</textarea><label class="lb">বাড়ির কাজ</label><textarea id="hb${i}h" rows="2" placeholder="বাড়ির কাজ কী করতে হবে...">${esc(b.homework)}</textarea></div>`).join("")
 +(hwF.id?"":`<button class="btn o s" style="width:100%;margin-bottom:6px" onclick="hwAddB()">＋ আরও বিষয় যোগ করুন</button>`)+fi("শিক্ষকের নাম (ঐচ্ছিক)","hf_t",hwF.teacher,"text",0,"শিক্ষকের নাম")
 +`<div class="bt"><button class="btn o" onclick="closeM()">বাতিল</button><button class="btn" onclick="hwSave()">সংরক্ষণ</button></div>${hwF.id?`<button class="btn r" style="width:100%;margin-top:8px" onclick="hwDel('${hwF.id}')">মুছে ফেলুন</button>`:""}`);$("mt").onclick=null;
}
function hwSave(){
 hwGrab();const f=hwF,bl=f.blocks.filter(b=>b.subject);
 if(!f.date||!f.cls||!bl.length){alert("তারিখ, শ্রেণী ও অন্তত একটি বিষয় দিন");return}
 const mkE=b=>({cls:f.cls,date:f.date,subject:b.subject,title:b.title,lesson:b.lesson,homework:b.homework,teacher:f.teacher,text:b.homework||b.lesson||b.title});
 if(f.id)Object.assign(S.hw.find(x=>x.id==f.id),mkE(bl[0]));else bl.forEach(b=>S.hw.push({id:uid(),...mkE(b)}));
 logA(f.id?"edit":"add","পড়া ও বাড়ির কাজ",f.cls+" — "+bl.map(b=>b.subject).join(", "));hwDate=f.date;save();closeM();render();
}
function hwDel(id){if(!confirm("মুছে ফেলবেন?"))return;S.hw=S.hw.filter(x=>x.id!=id);save();closeM();render()}
function hwPdf(){
 const l=hwList(),mo=hwMode=="month";
 printDoc("homework",sch()+`<style>.ptb td,.ptb th{border:1px solid #b9e6cd;font-size:12px;padding:6px 7px}</style><div style="text-align:center;margin-bottom:10px">পড়া ও বাড়ির কাজ — ${mo?"গত ১ মাস ("+bn(fdt(hwStart()))+" থেকে "+bn(fdt(today()))+")":"তারিখ: "+bn(hwDate||"সব")}${hwCls?" · শ্রেণি: "+esc(hwCls):""}</div><table class="ptb" style="border:1px solid #1d4ed8"><tr>${mo?"<th>তারিখ</th>":""}<th>শ্রেণি</th><th>বিষয়</th><th>শিরোনাম</th><th>আজকের পড়া</th><th>বাড়ির কাজ</th><th>শিক্ষক</th></tr>${l.map(h=>`<tr>${mo?`<td style="white-space:nowrap">${bn(fdt(h.date||""))}</td>`:""}<td>${esc(h.cls)}</td><td>${esc(h.subject)}</td><td>${esc(h.title||"")}</td><td>${esc(h.lesson||"")}</td><td>${esc(h.homework||h.text||"")}</td><td>${esc(h.teacher||"")}</td></tr>`).join("")||`<tr><td colspan="${mo?7:6}">কিছু নেই</td></tr>`}</table>`);
}

/* ---- textbooks ---- */
let bkCls="",bkD={},bkId=null,pdfCb=null;
async function pickPdf(cb){
 pdfCb=cb;const P=window.Capacitor&&Capacitor.Plugins;
 if(P&&P.FilePicker){try{const r=await P.FilePicker.pickFiles({types:["application/pdf"],limit:1,readData:true});const f=r.files&&r.files[0];if(!f)return;if(f.size&&f.size>1048576){alert("PDF ১ MB-এর বেশি হতে পারবে না");return}cb("data:application/pdf;base64,"+f.data,f.name);return}catch(e){if(e&&/cancel/i.test(e.message||""))return}}
 $("pdfin").click();
}
function pdfFile(f){if(!f)return;if(f.size>1048576){alert("PDF ১ MB-এর বেশি হতে পারবে না");return}const r=new FileReader();r.onload=()=>{if(pdfCb)pdfCb(r.result,f.name)};r.readAsDataURL(f)}
function bk(){
 const cl=[...new Set(S.tbooks.map(b=>b.cls).concat(tbf().map(f=>f.cls)))].filter(Boolean),l=S.tbooks.filter(b=>!bkCls||b.cls==bkCls);
 return phdr("শ্রেণী ও পাঠ্যবই","শ্রেণিভিত্তিক পাঠ্যবইয়ের তালিকা")+`<div style="display:flex;gap:8px;flex-wrap:wrap;margin:12px 0">${isParent()?"":`<button class="btn" onclick="bkForm()">＋ নতুন পাঠ্যবই</button><button class="ob" onclick="tbfForm()">📎 তালিকা আপলোড</button>`}<button class="ob" onclick="bkPdf()">🗎 PDF</button></div>
 <div style="display:flex;gap:6px;overflow-x:auto;margin-bottom:10px"><button class="chip ${bkCls?"":"on"}" onclick="bkCls='';render()">সব (${bn(S.tbooks.length)})</button>${cl.map(c=>`<button class="chip ${bkCls==c?"on":""}" onclick="bkCls='${jsq(c)}';render()">${esc(c)} (${bn(S.tbooks.filter(b=>b.cls==c).length)})</button>`).join("")}</div>`
 +tbfSec()
 +(l.map(b=>`<div class="card"><div class="ch" style="margin:0"><div><b>${esc(b.name)}</b> <span class="pl b">${esc(b.cls)}</span></div>${isParent()?"":`<span onclick="bkForm('${b.id}')" style="padding:0 6px">✏️</span>`}</div><div style="font-size:12px;color:var(--mu);line-height:1.7;margin-top:4px">${b.subject?"বিষয়: "+esc(b.subject)+"<br>":""}${b.author?"✍ "+esc(b.author)+"<br>":""}${b.code?"বই নম্বর: "+esc(b.code):""}${b.shelf?" · তাক: "+esc(b.shelf):""}${b.copies?"<br>সংখ্যা: "+bn(b.copies):""}${b.price?" · মূল্য: "+money(b.price):""}</div>${b.syllabus?`<div style="font-size:12px;margin-top:4px">${esc(b.syllabus)}</div>`:""}${b.pdf?`<button class="btn o s" style="margin-top:8px" onclick="bkOpen('${b.id}')">📄 PDF খুলুন</button>`:""}</div>`).join("")||(isParent()?'<div class="em">কোনো পাঠ্যবই নেই</div>':'<div class="em">কোনো পাঠ্যবই নেই। "নতুন পাঠ্যবই" চাপুন।</div>'));
}
/* ---- class-wise textbook list files (PDF / image) ---- */
let tbfD={};
function tbf(){if(!Array.isArray(S.tbFiles))S.tbFiles=[];return S.tbFiles}
function tbfSec(){
  const l=tbf().filter(f=>!bkCls||f.cls==bkCls);
  return `<div class="card"><div class="ch" style="margin:0 0 6px"><b>📎 শ্রেণি অনুযায়ী পাঠ্যবইয়ের তালিকা</b>${isParent()?"":`<button class="btn o s" onclick="tbfForm()">⬆ আপলোড</button>`}</div>${l.length?l.map(f=>`<div class="row" style="align-items:center;gap:10px"><div onclick="tbfView('${f.id}')" style="width:48px;height:48px;border-radius:8px;overflow:hidden;background:#eef2ff;display:flex;align-items:center;justify-content:center;font-size:22px;flex:none">${f.type==="img"?`<img src="${f.data}" style="width:48px;height:48px;object-fit:cover">`:"📄"}</div><div class="f" style="min-width:0"><b>${esc(f.title||f.fname||"তালিকা")}</b> <span class="pl b">${esc(f.cls)}</span><small style="display:block;color:var(--mu)">${f.type==="img"?"ছবি":"PDF"} · ${bn(fdt(f.date||""))}</small></div><span onclick="tbfView('${f.id}')" style="padding:0 6px">👁</span>${isParent()?"":`<span onclick="tbfDel('${f.id}')" style="padding:0 6px;color:var(--rd)">🗑</span>`}</div>`).join(""):'<div class="hint" style="margin:6px 0">শ্রেণির নাম দিয়ে পাঠ্যবইয়ের তালিকা PDF বা ছবি আকারে আপলোড করুন।</div>'}</div>`;
}
function tbfForm(){if(isParent())return;tbfD={cls:bkCls||"",title:"",type:"",data:"",fname:""};drawTbf()}
function tbfGrab(){["cls","title"].forEach(k=>{const e=$("tbf_"+k);if(e)tbfD[k]=e.value.trim()})}
function drawTbf(){
  modal(HND+`<h2 style="text-align:center;font-size:16px;margin-bottom:6px">পাঠ্যবইয়ের তালিকা আপলোড</h2><datalist id="tbfcl">${allCls().map(c=>`<option value="${esc(c)}">`).join("")}</datalist>${fi("শ্রেণির নাম","tbf_cls",tbfD.cls,"text",1,"যেমন: প্রথম","list=\"tbfcl\"")}${fi("শিরোনাম (ঐচ্ছিক)","tbf_title",tbfD.title,"text",0,"যেমন: প্রথম শ্রেণির বই তালিকা")}<label class="lb">PDF বা ছবি</label><div class="row" style="border:0;padding:2px 0"><button class="btn o s" onclick="tbfPick()">⬆ ফাইল বাছুন</button>${tbfD.data?`<span style="font-size:12px">✓ ${esc(tbfD.fname||"ফাইল")}</span>`:""}</div>${tbfD.type==="img"?`<img src="${tbfD.data}" style="width:100%;max-height:220px;object-fit:contain;border-radius:8px;margin-top:6px">`:""}<input id="tbfin" type="file" accept="application/pdf,image/*" style="position:absolute;left:-9999px;opacity:0;width:1px;height:1px" onchange="tbfRead(this.files[0]);this.value=''"><div class="hint">PDF সর্বোচ্চ ২ MB; ছবি স্বয়ংক্রিয়ভাবে ছোট করা হবে</div><div class="bt"><button class="btn o" onclick="closeM()">বাতিল</button><button class="btn" onclick="tbfSave()">সংরক্ষণ করুন</button></div>`);$("mt").onclick=null;
}
function tbfPick(){tbfGrab();$("tbfin").click()}
function tbfRead(f){
  if(!f)return;
  const pdf=f.type==="application/pdf"||/\.pdf$/i.test(f.name),img=/^image\//.test(f.type);
  if(!pdf&&!img){alert("শুধু PDF বা ছবি আপলোড করা যাবে");return}
  if(pdf&&f.size>2*1048576){alert("PDF ২ MB-এর বেশি হতে পারবে না");return}
  if(img&&f.size>12*1048576){alert("ছবি ১২ MB-এর বেশি হতে পারবে না");return}
  const r=new FileReader();
  r.onload=()=>{
    if(pdf){tbfD.data=r.result;tbfD.type="pdf";tbfD.fname=f.name;drawTbf();return}
    const im=new Image();
    im.onload=()=>{const k=Math.min(1,1400/Math.max(im.width,im.height)),c=document.createElement("canvas");c.width=Math.round(im.width*k);c.height=Math.round(im.height*k);c.getContext("2d").drawImage(im,0,0,c.width,c.height);tbfD.data=c.toDataURL("image/jpeg",.82);tbfD.type="img";tbfD.fname=f.name;drawTbf()};
    im.onerror=()=>alert("ছবি পড়া যায়নি");
    im.src=r.result;
  };
  r.readAsDataURL(f);
}
function tbfSave(){
  tbfGrab();
  if(!tbfD.cls){alert("শ্রেণির নাম দিন");return}
  if(!tbfD.data){alert("PDF বা ছবি বাছুন");return}
  const rec={id:uid(),cls:tbfD.cls,title:tbfD.title,type:tbfD.type,data:tbfD.data,fname:tbfD.fname,date:today()};
  tbf().push(rec);
  try{logA("add","পাঠ্যবই তালিকা",rec.cls);save();closeM();render()}
  catch(e){S.tbFiles=S.tbFiles.filter(x=>x.id!==rec.id);alert("সংরক্ষণ করা যায়নি (স্টোরেজ ভরে গেছে): "+e.message)}
}
function tbfDel(id){if(isParent())return;if(!confirm("ফাইলটি মুছবেন?"))return;S.tbFiles=tbf().filter(x=>x.id!==id);save();render()}
function tbfView(id){
  const f=tbf().find(x=>x.id===id);if(!f)return;
  if(f.type==="img")modal(HND+`<h2 style="text-align:center;font-size:16px;margin-bottom:8px">${esc(f.title||f.cls)} <span class="pl b">${esc(f.cls)}</span></h2><img src="${f.data}" style="width:100%;border-radius:8px"><div class="bt"><button class="btn o" onclick="closeM()">বন্ধ</button><button class="btn" onclick="tbfOpen('${id}')">↗ বাইরে খুলুন</button></div>`);
  else tbfOpen(id);
}
async function tbfOpen(id){
  const f=tbf().find(x=>x.id===id);if(!f)return;
  const mime=f.type==="img"?"image/jpeg":"application/pdf",P=window.Capacitor&&Capacitor.Plugins,d64=f.data.split("base64,")[1];
  if(P&&P.Filesystem&&P.Share){try{const r=await P.Filesystem.writeFile({path:"tbl-"+id+(f.type==="img"?".jpg":".pdf"),data:d64,directory:"CACHE"});await P.Share.share({url:r.uri,title:f.title||f.cls});return}catch(e){if(e&&/cancel/i.test(e.message||""))return}}
  const bin=atob(d64),u8=new Uint8Array(bin.length);for(let i=0;i<bin.length;i++)u8[i]=bin.charCodeAt(i);
  openExt(URL.createObjectURL(new Blob([u8],{type:mime})));
   }
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               
