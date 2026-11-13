/* Shared helpers. Content is read in one place: loadContent(). Swap it for Supabase later. */
"use strict";
/* SAMPLE contact email. Replace with the real address before launch. Every page reads it from here. */
const CONTACT_EMAIL="hello@yazi.example";
const PROVINCES=["Eastern Cape","Free State","Gauteng","KwaZulu-Natal","Limpopo","Mpumalanga","Northern Cape","North West","Western Cape"];
async function loadContent(){
  if(window.YAZI_CONTENT)return window.YAZI_CONTENT;
  const res=await fetch("data/content.json",{cache:"no-cache"});
  if(!res.ok)throw new Error("Content could not be loaded");
  return res.json();
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

/* Fill in the contact email wherever the page asks for it */
document.querySelectorAll("[data-email]").forEach(a=>{
  a.textContent=CONTACT_EMAIL;
  a.href="mailto:"+CONTACT_EMAIL+(a.dataset.email?"?subject="+encodeURIComponent(a.dataset.email):"");
});
