/* Options finder (home page). Needs common.js. */
"use strict";
/* Faculties as South African universities commonly name them. Names differ slightly between universities. */
const FACULTIES=[
 ["ems","Economic and Management Sciences (Commerce)","Accounting, Economics, Business Management, Human Resources","Mathematics is usually required for Accounting, Economics and Actuarial Science. Some management programmes accept Mathematical Literacy."],
 ["edu","Education","Foundation Phase, Intermediate Phase and Senior and FET Phase teaching","The Funza Lushaka Bursary funds teaching degrees at public universities in exchange for teaching at a public school. You will find it under Funding."],
 ["ebe","Engineering and the Built Environment","Civil, Electrical, Mechanical and Chemical Engineering, Architecture, Quantity Surveying","Mathematics and Physical Sciences are usually required, often with high marks. Universities of technology and TVET colleges offer engineering diplomas and trades as well."],
 ["health","Health Sciences","Medicine, Nursing, Pharmacy, Physiotherapy, Radiography","Mathematics, Physical Sciences and Life Sciences are often required. Many health programmes close earlier than other programmes, so check their dates first."],
 ["hum","Humanities and Social Sciences","Psychology, Social Work, Languages, Journalism, Political Studies","Many programmes accept Mathematical Literacy. Your English mark and overall APS matter most."],
 ["ict","Information and Communication Technology","Computer Science, Information Technology, Information Systems","Most programmes require Mathematics rather than Mathematical Literacy."],
 ["law","Law","LLB and law-related diplomas","Universities usually set a minimum mark for English and a minimum APS. Many accept Mathematical Literacy."],
 ["sci","Natural and Agricultural Sciences","Biology, Chemistry, Physics, Mathematics, Agriculture, Environmental Science","Mathematics is usually required, with Physical Sciences or Life Sciences depending on the programme."],
 ["arts","Arts and Design","Visual Arts, Graphic Design, Fashion, Drama, Music, Film","Many programmes ask for a portfolio, audition or selection test, and some close earlier than the general closing date."],
 ["any","Not sure yet","See all your options first",""]
];
const FIELD_LABEL=Object.fromEntries(FACULTIES.map(f=>[f[0],f[0]==="any"?"still deciding":f[1]]));
const QS=[
 {k:"stage",t:"What is your current stage?",o:[["g12","Currently in Grade 12","Final exams in progress or results not yet released"],["done","Recently completed matric","I have my National Senior Certificate (NSC) results"],["older","Completed matric in a previous year","Looking to study, improve my results or start working"]]},
 {k:"pass",t:"Which matric pass did you achieve, or do you expect?",o:[["bach","Bachelor pass","Minimum entry for a degree: at least 50% in four high-credit subjects"],["dip","Diploma pass","Minimum entry for a diploma: at least 40% in four high-credit subjects"],["cert","Higher Certificate pass","Minimum entry for a higher certificate: at least 40% in your home language"],["fail","Did not pass, or results not yet known","Rewrites, upgrades and other routes are still open to you"]]},
 {k:"money",t:"How will you pay for your studies?",o:[["self","I can pay","My family or I can cover tuition and other study costs"],["part","I need some financial help","We can cover some costs but need help with the rest"],["none","I cannot pay and need full funding","I will need NSFAS, a bursary or a scholarship to study"]]},
 {k:"field",t:"Which faculty interests you most?",o:FACULTIES.map(f=>[f[0],f[1],f[2]])},
 {k:"province",t:"In which province would you like to study or work?",select:true}
];
const allows=(rule,v)=>rule==="any"||rule.includes(v);
let DATA=null,step=0,ans={};

function matches(a){
  return DATA.options
    .filter(o=>allows(o.passes,a.pass)&&allows(o.money,a.money)&&(o.fields==="any"||a.field==="any"||o.fields.includes(a.field)))
    .map(o=>({o,s:o.priority+(a.money!=="self"?(o.fundingBoost||0):0)}))
    .sort((x,y)=>y.s-x.s).slice(0,5).map(x=>x.o);
}

/* A live summary of the real institutions behind an option, so dates never go stale in the text. */
function directorySummary(o,province){
  const d=o.directory; if(!d)return "";
  const list=DATA.institutions.filter(i=>d.types.includes(i.type)&&(!d.subtype||i.subtype===d.subtype)&&inProvince(i,province));
  if(!list.length)return "";
  const st=list.map(statusOf);
  const live=st.filter(isLive).length,closed=st.filter(s=>s.key==="closed").length,check=st.length-live-closed;
  const parts=[];
  if(live)parts.push(live+" open for applications");
  if(closed)parts.push(closed+" past their closing date");
  if(check)parts.push(check+" not open yet or with rolling or unclear dates");
  const q=(province&&province!=="any"?"?province="+encodeURIComponent(province):"");
  return '<p class="dirsum"><strong>'+list.length+" "+esc(d.label)+" listed:</strong> "+parts.join(", ")+'.</p>'
   +'<p><a class="btn alt" href="explore.html'+q+"#"+d.tab+'">See all '+esc(d.label)+'</a></p>'
   +(closed?'<p class="muted">If a date has passed, contact the institution and ask about late applications or the next intake.</p>':"");
}

function view(name,before){
  smoothHeight(document.querySelector("#finder .panel"),()=>{if(before)before();["start","quiz","result"].forEach(id=>$(id).classList.toggle("hide",id!==name))});
  replay($(name),"fade-in");
}
let busy=false;

function ask(dir){
  smoothHeight(document.querySelector("#finder .panel"),()=>render(dir));
  bringIntoView(document.querySelector("#finder .panel"),90);
  busy=false;
}
function render(dir){
  const q=QS[step];
  $("count").textContent="Question "+(step+1)+" of "+QS.length;
  $("bar").style.width=(step/QS.length*100)+"%";
  $("q").textContent=q.t;
  const box=$("opts");box.innerHTML="";
  const next=(v,btn)=>{
    if(busy)return;busy=true;
    if(btn)btn.classList.add("chosen");
    setTimeout(()=>{ans[q.k]=v;step++;step<QS.length?ask(1):finish()},REDUCE?0:170);
  };
  if(q.select){
    const s=document.createElement("select");s.setAttribute("aria-label",q.t);
    s.innerHTML='<option value="any">Anywhere in South Africa</option>'+PROVINCES.map(p=>"<option>"+p+"</option>").join("");
    const b=document.createElement("button");b.type="button";b.className="btn";b.textContent="Show my options";
    b.onclick=()=>next(s.value,b);
    box.append(s,b);
  }else q.o.forEach(o=>{
    const b=document.createElement("button");b.type="button";b.className="opt";
    b.innerHTML=esc(o[1])+(o[2]?"<small>"+esc(o[2])+"</small>":"");
    b.onclick=()=>next(o[0],b);
    box.appendChild(b);
  });
  $("back").classList.toggle("hide",step===0);
  const stage=$("stage");stage.classList.toggle("back",dir===-1);replay(stage,"slide-in");
  $("q").focus({preventScroll:true});
}

function finish(){
  const list=matches(ans);
  let h=ans.pass==="fail"
    ?'<p class="hope">Your options are not over. Here are routes that can still get you where you want to go.</p>'
    :'<p class="hope">Here are options that fit you. Faculty of interest: '+esc(FIELD_LABEL[ans.field])+".</p>";
  const fac=FACULTIES.find(f=>f[0]===ans.field);
  if(fac&&fac[3])h+='<div class="facnote"><h3>'+esc(fac[1])+'</h3><p>'+esc(fac[3])+'</p><p class="muted">Faculty names and entry requirements differ between universities. Always check the faculty’s requirements in the prospectus.</p></div>';
  if(ans.money==="none")h+='<div class="facnote"><h3>No money to pay for studies?</h3><p>Not having money does not close the door. NSFAS can fully fund study at public universities and TVET colleges if your household income qualifies, and bursaries and scholarships are available in many fields. Learnerships pay you a monthly stipend while you train. Your funding and learnership options are listed below.</p></div>';
  else if(ans.money==="part")h+='<div class="facnote"><h3>Need some financial help?</h3><p>NSFAS, bursaries and scholarships can cover part or all of your costs. Apply to several, as early as you can. Your funding options are listed below.</p></div>';
  if(ans.stage==="g12")h+='<p class="muted">Still in Grade 12? Many closing dates come before final results, so check dates early.</p>';
  list.forEach(o=>{
    const sum=directorySummary(o,ans.province);
    h+='<article class="card"><h3>'+esc(o.name)+"</h3><p>"+esc(o.why)+"</p>"
     +"<h4>What you need</h4><ul>"+o.need.map(x=>"<li>"+esc(x)+"</li>").join("")+"</ul>"
     +"<h4>Your next steps</h4><ol>"+o.steps.map(x=>"<li>"+esc(x)+"</li>").join("")+"</ol>"
     +(sum?"<h4>Dates</h4>"+sum:"")
     +'<div class="meta">'+(o.deadline?"Deadline: "+esc(o.deadline)+"<br>":"")+"Information last updated: "+niceDate(DATA.compiled)+"<br>"+staleNote(DATA.compiled,DATA.staleDays)
     +(o.link?'<br>Official source: <a href="'+esc(o.link.url)+'" target="_blank" rel="noopener">'+esc(o.link.label)+"</a>":"")+"</div></article>";
  });
  $("cards").innerHTML=h;
  $("bar").style.width="100%";
  const online=/^https?:$/.test(location.protocol);
  const msg="I used YAZI to see my options after matric: "+list.map(o=>o.name).join(", ")+"."+(online?" Find yours: "+location.origin+location.pathname:"");
  $("wa").href="https://wa.me/?text="+encodeURIComponent(msg);
  view("result");
  busy=false;
  bringIntoView($("result"),90);
}

async function init(){
  $("year").textContent=new Date().getFullYear();
  try{DATA=await loadContent()}catch(e){
    $("intro").textContent="Sorry, the options could not be loaded. Please check your connection and refresh the page.";
    $("go").classList.add("hide");return;
  }
  $("notice").innerHTML="<strong>Information last updated "+niceDate(DATA.compiled)+".</strong> Dates and requirements change, so always confirm with the institution before you apply.";
  /* Live counts on the home page overview card */
  document.querySelectorAll("[data-count]").forEach(el=>{
    const n=DATA.institutions.filter(i=>i.type===el.dataset.count).length;
    if(n)el.textContent=n+" "+(n===1?el.dataset.one:el.dataset.many);
  });
  $("intro").textContent="Answer "+QS.length+" quick questions. We’ll show you the options that fit you and what to do next.";
  $("go").onclick=()=>{step=0;ans={};busy=false;view("quiz",()=>render(1));bringIntoView(document.querySelector("#finder .panel"),90)};
  $("back").onclick=()=>{if(step>0&&!busy){step--;ask(-1)}};
  $("again").onclick=()=>{view("start");bringIntoView($("finder"),70)};
}
init();
