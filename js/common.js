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

/* Contact email: shown as text, plus three ways to use it (email app, Gmail in the browser, copy) */
document.querySelectorAll("[data-email-text]").forEach(el=>el.textContent=CONTACT_EMAIL);
document.querySelectorAll("[data-mailto]").forEach(a=>a.href="mailto:"+CONTACT_EMAIL+"?subject="+encodeURIComponent(a.dataset.mailto));
document.querySelectorAll("[data-gmail]").forEach(a=>a.href="https://mail.google.com/mail/?view=cm&fs=1&to="+encodeURIComponent(CONTACT_EMAIL)+"&su="+encodeURIComponent(a.dataset.gmail));
document.querySelectorAll("[data-copy-email]").forEach(btn=>btn.addEventListener("click",async()=>{
  let ok=false;
  try{if(navigator.clipboard&&window.isSecureContext){await navigator.clipboard.writeText(CONTACT_EMAIL);ok=true}}catch(e){}
  if(!ok){try{const t=document.createElement("textarea");t.value=CONTACT_EMAIL;t.setAttribute("readonly","");t.style.position="fixed";t.style.opacity="0";document.body.appendChild(t);t.select();ok=document.execCommand("copy");t.remove()}catch(e){}}
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
