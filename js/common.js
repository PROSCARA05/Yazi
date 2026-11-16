/* Shared helpers. Content is read in one place: loadContent(). Swap it for Supabase later. */
"use strict";
/* Contact email. Every page reads it from here. */
const CONTACT_EMAIL="yaziinsight@gmail.com";
const PROVINCES=["Eastern Cape","Free State","Gauteng","KwaZulu-Natal","Limpopo","Mpumalanga","Northern Cape","North West","Western Cape"];
/* Online, the site reads data/content.json directly, so an edit on GitHub goes live without rebuilding anything.
   data/content.js is only a fallback: for opening the site from a folder, or if content.json has a mistake in it. */
async function loadContent(){
  let data=null;
  if(/^https?:$/.test(location.protocol)){
    try{const res=await fetch("data/content.json",{cache:"no-cache"});if(res.ok)data=await res.json()}
    catch(e){console.warn("data/content.json could not be read, using data/content.js instead",e)}
  }
  if(!data&&window.YAZI_CONTENT)data=window.YAZI_CONTENT;
  if(!data)throw new Error("Content could not be loaded");
  return tidyContent(data);
}
/* Hides learnerships a set number of days after they close, so expired adverts drop off by themselves. */
function tidyContent(data){
  const days=(data.settings&&Number.isFinite(data.settings.hideClosedLearnershipsAfterDays))?data.settings.hideClosedLearnershipsAfterDays:14;
  const now=Date.now();
  data.institutions=(data.institutions||[]).filter(i=>!(i.type==="learnership"&&i.closes&&now-new Date(i.closes+"T23:59:59")>days*864e5));
  return data;
}
const $=id=>document.getElementById(id);
/* Motion helpers. Everything respects the "reduce motion" setting on the visitor's device. */
const REDUCE=window.matchMedia&&matchMedia("(prefers-reduced-motion: reduce)").matches;
function replay(el,cls){if(!el||REDUCE)return;el.classList.remove(cls);void el.offsetWidth;el.classList.add(cls)}
/* Changes content inside el, and smoothly animates el's height from old to new instead of jumping. */
function smoothHeight(el,change){
  if(REDUCE||!el){change();return}
  const from=el.getBoundingClientRect().height;
  el.style.height="";change();
  const to=el.getBoundingClientRect().height;
  if(Math.abs(from-to)<2)return;
  const token=(el._sh=(el._sh||0)+1);
  el.style.transition="none";el.style.height=from+"px";el.style.overflow="hidden";void el.offsetWidth;
  el.style.transition="height .28s cubic-bezier(.2,.7,.2,1)";el.style.height=to+"px";
  const done=e=>{if(e&&e.target!==el)return;if(el._sh!==token)return;el.style.height="";el.style.overflow="";el.style.transition="";el.removeEventListener("transitionend",done)};
  el.addEventListener("transitionend",done);setTimeout(done,420);
}
/* Scrolls an element into view smoothly, but only if it is not already comfortably visible. */
function bringIntoView(el,offset){
  if(!el)return;const top=el.getBoundingClientRect().top;
  if(top<(offset||80)||top>innerHeight*0.6)window.scrollTo({top:scrollY+top-(offset||80),behavior:REDUCE?"auto":"smooth"});
}
const esc=s=>String(s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const niceDate=iso=>new Date(iso+"T12:00:00").toLocaleDateString("en-ZA",{day:"numeric",month:"long",year:"numeric"});
const inProvince=(i,p)=>!p||p==="any"||i.province===p||i.province==="National"||(Array.isArray(i.provinces)&&i.provinces.includes(p));
/* Label for the province badge. Learnerships can list several provinces. */
const provLabel=i=>Array.isArray(i.provinces)?i.provinces.join(", "):i.province;

/* Works out where an institution stands today, from its closing date. */
function statusOf(i){
  if(i.opens&&new Date(i.opens+"T00:00:00")>new Date())return{key:"check",label:"Opens "+niceDate(i.opens)};
  if(i.closes){
    const end=new Date(i.closes+"T23:59:59"),ms=end-new Date();
    if(ms<0)return{key:"closed",label:"Closing date passed"};
    const days=Math.ceil(ms/864e5);
    if(days<=30)return{key:"soon",label:"Closing soon: "+(days<=1?"today or tomorrow":days+" days left")};
    return{key:"open",label:"Open until "+niceDate(i.closes)};
  }
  if(i.rolling&&!i.checkDates)return{key:"check",label:"Rolling intake"};
  return{key:"check",label:"Check dates with the institution"};
}
const isLive=s=>s.key==="open"||s.key==="soon";

function staleNote(compiled,days){
  const age=(Date.now()-new Date(compiled+"T12:00:00"))/864e5;
  return age>(days||120)?'<span class="stale">This information may be out of date. Check the official site before you apply.</span>':"";
}

/* Mobile menu */
(function(){
  const btn=document.querySelector(".menu-btn"),nav=document.getElementById("main-nav");if(!btn||!nav)return;
  const set=o=>{btn.setAttribute("aria-expanded",o);nav.classList.toggle("open",o);btn.textContent=o?"Close":"Menu"};
  btn.addEventListener("click",()=>set(btn.getAttribute("aria-expanded")!=="true"));
  nav.addEventListener("click",e=>{if(e.target.tagName==="A")set(false)});
  document.addEventListener("keydown",e=>{if(e.key==="Escape")set(false)});
})();

/* Contact email. Every email link opens a small window with ways to send: the device's email app, Gmail, Outlook,
   Yahoo Mail, or copying the address. Without JavaScript the links still work as normal email links. */
const MAIL_SUBJECT="Enquiry from the YAZI website";
async function copyEmail(){
  try{if(navigator.clipboard&&window.isSecureContext){await navigator.clipboard.writeText(CONTACT_EMAIL);return true}}catch(e){}
  try{const t=document.createElement("textarea");t.value=CONTACT_EMAIL;t.setAttribute("readonly","");t.style.position="fixed";t.style.opacity="0";document.body.appendChild(t);t.select();const ok=document.execCommand("copy");t.remove();return ok}catch(e){return false}
}
(function(){
  const links=document.querySelectorAll("[data-email-options]");
  if(!links.length||typeof HTMLDialogElement!=="function")return;
  const to=encodeURIComponent(CONTACT_EMAIL),su=encodeURIComponent(MAIL_SUBJECT);
  const ic={
    app:'<path d="M3 6h18v12H3z"/><path d="m3 7 9 6 9-6"/>',
    web:'<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18"/>',
    copy:'<rect x="8" y="8" width="12" height="12" rx="2"/><path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2"/>',
    close:'<path d="M6 6l12 12M18 6 6 18"/>'
  };
  const svg=k=>'<svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">'+ic[k]+'</svg>';
  const opt=(href,icon,title,sub,ext)=>'<a class="mo-opt" href="'+href+'"'+(ext?' target="_blank" rel="noopener"':'')+'><span class="mo-ic">'+svg(icon)+'</span><span><strong>'+title+'</strong><small>'+sub+'</small></span></a>';
  const d=document.createElement("dialog");
  d.className="mail-dialog";d.setAttribute("aria-labelledby","mo-title");
  d.innerHTML='<div class="mo-head"><h2 id="mo-title">Email YAZI</h2><button type="button" class="mo-close" aria-label="Close">'+svg("close")+'</button></div>'
    +'<p class="mo-addr">'+CONTACT_EMAIL+'</p><p class="mo-sub">How would you like to send your email?</p>'
    +'<div class="mo-list">'
    +opt("mailto:"+CONTACT_EMAIL+"?subject="+su,"app","Email app on this device","Outlook, Mail, or the email app on your phone")
    +opt("https://mail.google.com/mail/?view=cm&fs=1&to="+to+"&su="+su,"web","Gmail","Opens Gmail in your browser",true)
    +opt("https://outlook.live.com/mail/0/deeplink/compose?to="+to+"&subject="+su,"web","Outlook.com or Hotmail","Opens Outlook in your browser",true)
    +opt("https://compose.mail.yahoo.com/?to="+to+"&subject="+su,"web","Yahoo Mail","Opens Yahoo Mail in your browser",true)
    +'<button type="button" class="mo-opt mo-copy"><span class="mo-ic">'+svg("copy")+'</span><span><strong>Copy email address</strong><small>Paste it into any email</small></span></button>'
    +'</div>';
  document.body.appendChild(d);
  const copyBtn=d.querySelector(".mo-copy");
  const close=()=>{d.classList.add("closing");setTimeout(()=>{d.classList.remove("closing");d.close()},REDUCE?0:160)};
  d.querySelector(".mo-close").addEventListener("click",close);
  d.addEventListener("click",e=>{if(e.target===d)close()});
  d.addEventListener("cancel",e=>{e.preventDefault();close()});
  d.querySelectorAll("a.mo-opt").forEach(a=>a.addEventListener("click",()=>setTimeout(close,150)));
  copyBtn.addEventListener("click",async()=>{
    const ok=await copyEmail();const s=copyBtn.querySelector("strong"),sm=copyBtn.querySelector("small");
    s.textContent=ok?"Copied":"Could not copy";sm.textContent=ok?CONTACT_EMAIL+" is ready to paste":"Select the address above and copy it";
    setTimeout(()=>{s.textContent="Copy email address";sm.textContent="Paste it into any email"},2500);
  });
  links.forEach(a=>a.addEventListener("click",e=>{e.preventDefault();d.showModal()}));
})();
document.querySelectorAll("[data-copy-email]").forEach(btn=>btn.addEventListener("click",async()=>{
  const ok=await copyEmail();
  const status=document.getElementById("copy-status");
  btn.textContent=ok?"Copied":"Copy email";
  if(status)status.textContent=ok?"Email address copied: "+CONTACT_EMAIL+". Paste it into your email.":"Could not copy automatically. Please select the address above and copy it.";
  if(ok)setTimeout(()=>{btn.textContent="Copy email"},2500);
}));

/* Light / dark switch. Follows the device until the visitor chooses; the choice is remembered on this device. */
(function(){
  const root=document.documentElement,btn=document.querySelector(".theme-btn");if(!btn)return;
  const sys=window.matchMedia?matchMedia("(prefers-color-scheme: dark)"):null;
  const current=()=>root.getAttribute("data-theme")||(sys&&sys.matches?"dark":"light");
  const label=()=>{const next=current()==="dark"?"light":"dark";const t="Switch to "+next+" mode";btn.setAttribute("aria-label",t);btn.title=t;btn.dataset.mode=current()};
  btn.addEventListener("click",()=>{
    const next=current()==="dark"?"light":"dark";
    if(!REDUCE){root.classList.add("theme-anim");setTimeout(()=>root.classList.remove("theme-anim"),350)}
    root.setAttribute("data-theme",next);
    try{localStorage.setItem("yazi-theme",next)}catch(e){}
    label();
  });
  if(sys&&sys.addEventListener)sys.addEventListener("change",label);
  label();
})();
