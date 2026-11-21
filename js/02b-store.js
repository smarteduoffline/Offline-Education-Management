/* কেন্দ্রীয় ডেটা-অ্যাক্সেস স্তর (Store)
   নতুন/সরানো মডিউলগুলো গ্লোবাল S সরাসরি না ছুঁয়ে Store.xxx ব্যবহার করবে।
   Store.replace(নতুনState) = S-এর পুরো বদল (রিসেট/রিস্টোরে)।
   Store.students ≡ S.students — একই ডেটা, তবে S পুনঃঅ্যাসাইন (রিস্টোর/রিসেট) হলেও Store সবসময় বর্তমান S-ই দেখে।
   অজানা নামে লিখলে কনসোলে সতর্কতা আসে (বানান-ভুল ধরার জন্য); আচরণ বদলায় না। */
const Store=(()=>{
  let known=null;
  const keys=()=>known||(known=new Set(Object.keys(D())));
  return new Proxy({},{
    get:(_,k)=>k==="raw"?S:k==="replace"?(v=>{S=v}):S[k],
    set:(_,k,v)=>{
      if(!keys().has(k)&&!(k in S))console.warn("Store: অজানা কী লেখা হচ্ছে →",String(k));
      S[k]=v;return true;
    },
    has:(_,k)=>k in S,
    deleteProperty:(_,k)=>delete S[k]
  });
})();
