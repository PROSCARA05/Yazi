/* Browse page: every category, with name search, province and status filters. Needs common.js. */
"use strict";
const TABS={universities:{label:"Universities",types:["public"],blurb:"Public universities and universities of technology."},tvet:{label:"TVET colleges",types:["tvet"],blurb:"Public technical and vocational colleges."},private:{label:"Private",types:["private"],blurb:"Private colleges and institutes. NSFAS does not pay for private colleges."},funding:{label:"Funding",types:["funding"],blurb:"NSFAS, bursaries and scholarships."},learnerships:{label:"Learnerships",types:["learnership"],blurb:"Learnerships, internships and YES programmes. You work and learn at the same time, and many pay a monthly stipend. Read each one’s requirements carefully, as age limits and rules differ."}};
let DATA=null,tab="universities";

function card(i){
  const s=statusOf(i);
  const links=[];
  if(i.applyUrl)links.push('<a class="btn" href="'+esc(i.applyUrl)+'"'+(/^mailto:/.test(i.applyUrl)?"":' target="_blank" rel="noopener"')+'>'+(/^mailto:/.test(i.applyUrl)?"Apply by email":i.type==="funding"?"Apply or find out more":"Apply")+'</a>');
  if(i.prospectusUrl)links.push('<a class="btn alt" href="'+esc(i.prospectusUrl)+'" target="_blank" rel="noopener">Prospectus</a>');
  const notes=[];
  if(!i.applyUrl&&i.type!=="funding")notes.push("No application link has been added yet.");
  if(i.prospectusThirdParty)notes.push("The prospectus link is on a third-party site, not the institution’s own.");
  if(i.prospectusMaybeOld)notes.push("The prospectus link may be for an earlier year.");
  if(i.thirdPartyLink)notes.push("The application link is on a third-party site, not the organisation’s own.");
  if(i.checkDates)notes.push("The dates in our source need checking. Confirm with the institution.");
  return '<article class="card"><h3>'+esc(i.name)+'</h3>'
   +'<p class="badges"><span class="badge s-'+s.key+'">'+esc(s.label)+'</span><span class="badge">'+esc(provLabel(i))+'</span>'+(i.subtype==="uot"?'<span class="badge">University of technology</span>':"")+'</p>'
   +(i.kind?'<p><strong>Type:</strong> '+esc(i.kind)+'</p>':"")
   +(i.location?'<p><strong>Location:</strong> '+esc(i.location)+'</p>':"")
   +'<p><strong>Dates:</strong> '+esc(i.datesText)+'</p>'
   +(i.requirements?'<p><strong>Requirements:</strong> '+esc(i.requirements)+'</p>':"")
   +(i.howToApply?'<p><strong>How to apply:</strong> '+esc(i.howToApply)+'</p>':"")
   +(links.length?'<div class="row">'+links.join("")+'</div>':"")
   +(notes.length?'<p class="muted note">'+notes.map(esc).join(" ")+'</p>':"")
   +'<div class="meta">Information compiled: '+niceDate(i.checkedOn)+'<br>'+staleNote(i.checkedOn,DATA.staleDays)+'</div></article>';
}

function render(){
  const q=$("search").value.trim().toLowerCase(),prov=$("prov").value,st=$("stat").value;
  const all=DATA.institutions.filter(i=>TABS[tab].types.includes(i.type));
  const list=all.filter(i=>{
    const s=statusOf(i);
    return inProvince(i,prov)&&(!q||i.name.toLowerCase().includes(q))
      &&(st==="all"||(st==="live"&&isLive(s))||(st==="closed"&&s.key==="closed")||(st==="check"&&s.key==="check"));
  }).sort((a,b)=>{const r={soon:0,open:1,check:2,closed:3};return r[statusOf(a).key]-r[statusOf(b).key]||a.name.localeCompare(b.name)});
  $("blurb").textContent=TABS[tab].blurb;
  $("shown").textContent="Showing "+list.length+" of "+all.length;
  $("list").innerHTML=list.length?list.map(card).join(""):'<p>Nothing matches. Try clearing a filter.</p>';
  document.querySelectorAll(".tabs button").forEach(b=>b.setAttribute("aria-pressed",b.dataset.tab===tab));
}

function clearAll(){$("search").value="";$("prov").value="any";$("stat").value="all";render();$("search").focus()}
function setTab(t){tab=TABS[t]?t:"universities";try{if(location.hash.slice(1)!==tab)history.replaceState(null,"","#"+tab)}catch(e){}render();replay($("list"),"fade-in")}

async function init(){
  $("year").textContent=new Date().getFullYear();
  $("prov").innerHTML='<option value="any">All provinces</option>'+PROVINCES.map(p=>"<option>"+p+"</option>").join("");
  try{DATA=await loadContent()}catch(e){$("list").innerHTML="<p>Sorry, the list could not be loaded. Please refresh the page.</p>";return}
  const p=new URLSearchParams(location.search).get("province");if(p&&PROVINCES.includes(p))$("prov").value=p;
  $("tabs").innerHTML=Object.keys(TABS).map(k=>'<button type="button" data-tab="'+k+'">'+TABS[k].label+"</button>").join("");
  $("tabs").onclick=e=>{if(e.target.dataset.tab)setTab(e.target.dataset.tab)};
  ["search","prov","stat"].forEach(id=>$(id).addEventListener("input",render));
  $("clear").onclick=clearAll;
  $("asof").textContent="Status as of "+new Date().toLocaleDateString("en-ZA",{day:"numeric",month:"long",year:"numeric"})+". Information compiled "+niceDate(DATA.compiled)+".";
  tab=location.hash.slice(1);setTab(tab);
}
window.addEventListener("hashchange",()=>{const t=location.hash.slice(1);if(DATA&&TABS[t]&&t!==tab){tab=t;render();replay($("list"),"fade-in")}});
init();
