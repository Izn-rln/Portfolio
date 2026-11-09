const clone=o=>JSON.parse(JSON.stringify(o));
let D=clone(DEF),editing=false,canEdit=false,db=null,assets=null,ref=null,loaded=false,first=true,flt="All",local=false;
const $=s=>document.querySelector(s),app=$("#app"),M=$("#modal");
const esc=s=>String(s==null?"":s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const url=u=>{u=String(u||"").trim();if(!u||u==="#")return"";if(/^(https?:\/\/|\/_blob\/|mailto:|data:(image|audio|video)\/|data:application\/pdf)/i.test(u))return u;return/^[\w-]+(\.[\w-]+)+/.test(u)?"https://"+u:""};
const E=p=>editing?` contenteditable="plaintext-only" spellcheck="false" data-e="${p}" class="ed"`:"";
const sp=(p,v)=>{const k=p.split(".");let o=D;while(k.length>1)o=o[k.shift()];o[k[0]]=v};
const S=[["home","Home"],["about","About"],["skills","Skills"],["projects","Projects"],["journey","Journey"],["contact","Contact"]],ids=S.map(s=>s[0]);
$("#nav").innerHTML=S.map(([i,l])=>`<a href="#${i}">${l}</a>`).join("");
function toast(m){const t=$("#toast");t.textContent=m;t.classList.add("show");clearTimeout(toast.t);toast.t=setTimeout(()=>t.classList.remove("show"),2200)}
const setSv=m=>$("#sv").textContent=m;
// ---------- saving (shared database, editors only) ----------
let st;const idb=(m,v)=>new Promise((res,rej)=>{const r=indexedDB.open("portfolio",1);r.onupgradeneeded=()=>r.result.createObjectStore("kv");r.onerror=()=>rej(r.error);r.onsuccess=()=>{const s=r.result.transaction("kv",m==="get"?"readonly":"readwrite").objectStore("kv");const q=m==="get"?s.get("D"):m==="set"?s.put(v,"D"):s.delete("D");q.onsuccess=()=>res(q.result);q.onerror=()=>rej(q.error)}});
function save(){if(!ref&&!local)return;clearTimeout(st);setSv("Saving…");st=setTimeout(async()=>{try{if(ref)await ref.set({json:JSON.stringify(D)});else await idb("set",JSON.stringify(D));setSv(ref?"All changes saved ✓":"Saved on this device ✓")}catch(e){setSv("Couldn’t save")}},500)}
// ---------- render ----------
function render(){
 const unlocked=D.achv.filter(a=>!a[2]).length,cats=["All",...new Set(D.projects.map(p=>p.cat).filter(Boolean))];
 if(!cats.includes(flt))flt="All";
 const th=p=>p.file&&/^image\//.test(p.file.type)?`<div class="th" style="background-image:url('${esc(encodeURI(url(p.file.url)))}')"></div>`:"";
 const mk=(a,b,c)=>editing?`<div class="lk"><span${E(c+".0")}>${esc(a[0])}</span><span${E(c+".1")}>${esc(a[1])}</span><small${E(c+".2")}>${esc(a[2])}</small></div>`:`<a href="${esc(url(a[2])||"#")}" target="_blank" rel="noopener">${esc(a[0])} <span>${esc(a[1])}</span></a>`;
 app.innerHTML=`
<section id="home"><div class="eyebrow">PLAYER PROFILE</div><h1${E("name")}>${esc(D.name)}</h1><div class="role"><span id="ty"></span><span class="cur"></span></div>
<div class="cta"><a class="btn" href="#projects">Start Quest</a><button class="btn alt" id="cp">Copy Email</button></div>
<div class="stats"><div class="stat"><b>${D.projects.length}</b><span>Projects</span></div><div class="stat"><b>${D.skills.length}</b><span>Skills</span></div><div class="stat"><b>${unlocked}</b><span>Achievements</span></div><div class="stat"><b${E("gwa")}>${esc(D.gwa)}</b><span>GWA</span></div></div></section>
<section id="about" class="rv"><div class="eyebrow">CHARACTER SHEET</div><h2>About</h2><div class="about"><div class="panel">${D.about.map((p,i)=>`<p${E("about."+i)}>${esc(p)}</p>`).join("")}</div><div class="panel">${D.info.map((r,i)=>`<div class="row"><span${E(`info.${i}.0`)}>${esc(r[0])}</span><span${E(`info.${i}.1`)}>${esc(r[1])}</span></div>`).join("")}</div></div></section>
<section id="skills" class="rv"><div class="eyebrow">TALENTS</div><h2>Skills</h2><div class="panel skills">${D.skills.map((s,i)=>`<div class="sk"><div class="top"><span${E(`skills.${i}.0`)}>${esc(s[0])}</span><em>Lv.${Math.round(s[1]/10)}</em>${editing?`<button class="x2" data-act="delS" data-i="${i}">×</button>`:""}</div><div class="track"><div class="fill" data-w="${s[1]}"></div></div>${editing?`<input type="range" min="0" max="100" value="${s[1]}" data-sl="${i}" aria-label="Skill level">`:""}</div>`).join("")}${editing?`<div class="sk"><button class="chip" data-act="addS">＋ Add skill</button></div>`:""}</div></section>
<section id="projects" class="rv"><div class="eyebrow">QUEST LOG</div><h2>Projects</h2><div class="chips" id="chips">${cats.map(c=>`<button class="chip ${c===flt?'on':''}" data-act="flt" data-c="${esc(c)}">${esc(c)}</button>`).join("")}</div>
<div class="grid">${D.projects.map((p,i)=>`<div class="panel card ${flt!=="All"&&p.cat!==flt?'hide':''}" data-act="openP" data-i="${i}">${th(p)}<div class="rar">${"★".repeat(p.r)}</div><h3>${esc(p.t)}</h3><p>${esc(p.d)}</p>${p.tags.map(t=>`<span class="tag">${esc(t)}</span>`).join("")}</div>`).join("")}${editing?`<div class="panel card add" data-act="addP">＋ Add project</div>`:""}</div>
<h2 style="margin-top:56px">Achievements</h2><div class="ach">${D.achv.map((a,i)=>`<div class="panel ${a[2]?'lock':''}"><i${E(`achv.${i}.0`)}>${esc(a[0])}</i><span${E(`achv.${i}.1`)}>${esc(a[1])}</span>${editing?`<div class="mini"><button data-act="lockA" data-i="${i}">${a[2]?"Unlock":"Lock"}</button><button data-act="delA" data-i="${i}">Delete</button></div>`:""}</div>`).join("")}${editing?`<div class="panel add" data-act="addA" style="cursor:pointer">＋ Add achievement</div>`:""}</div></section>
<section id="journey" class="rv"><div class="eyebrow">STORY QUEST</div><h2>Journey</h2><div class="tl">${D.journey.map((j,i)=>`<div class="ev"><small${E(`journey.${i}.0`)}>${esc(j[0])}</small><h3${E(`journey.${i}.1`)}>${esc(j[1])}</h3><p${E(`journey.${i}.2`)}>${esc(j[2])}</p>${editing?`<button class="x2" data-act="delJ" data-i="${i}">Remove</button>`:""}</div>`).join("")}${editing?`<button class="chip" data-act="addJ">＋ Add milestone</button>`:""}</div></section>
<section id="contact" class="rv"><div class="eyebrow">SEND A MESSAGE</div><h2>Contact</h2><div class="contact"><div class="panel links">${editing?`<div class="lk"><b>Email</b><span${E("email")}>${esc(D.email)}</span></div>`:`<button id="cp2">Email <span>${esc(D.email)}</span></button>`}${D.links.map((l,i)=>mk(l,i,"links."+i)).join("")}</div>
<form class="panel" id="f"><div class="two"><input name="n" placeholder="Your name" required><input name="e" type="email" placeholder="Your email" required></div><input name="s" placeholder="Subject" required><textarea name="m" placeholder="Message" required></textarea><button class="btn" type="submit">Send Message</button></form></div></section>`;
 document.querySelectorAll(".rv").forEach(e=>{if(first)io.observe(e);else{e.classList.add("in");e.querySelectorAll(".fill").forEach(f=>f.style.width=f.dataset.w+"%")}});
 if(first){first=false}else{} sc();
}
function applyAll(){$("#logo").textContent=D.short;$("#fn").textContent=D.name;$("#yr").textContent=new Date().getFullYear();document.title=D.name+" · Portfolio";applyBg();applyMusic()}
function applyBg(){const b=$("#bgimg"),u=D.bg&&url(D.bg.url);b.style.backgroundImage=u?`linear-gradient(rgba(10,13,22,${D.dim}),rgba(10,13,22,${D.dim})),url('${encodeURI(u)}')`:"none"}
// ---------- music ----------
const au=new Audio();au.loop=true;au.volume=.4;
au.onplay=au.onpause=()=>$("#mus").textContent=au.paused?"♪":"❚❚";
function applyMusic(){const b=$("#mus"),u=D.music&&url(D.music.url);if(u){b.style.display="block";if(au.dataset.u!==u){au.dataset.u=u;au.src=u}}else{b.style.display="none";au.pause();au.removeAttribute("src");au.dataset.u=""}}
$("#mus").onclick=()=>{au.paused?au.play().catch(()=>toast("Tap again to play")):au.pause()};
// ---------- typing, scroll, reveal ----------
let ri=0,ci=0,del=false;
(function t(){const ty=$("#ty");if(!ty||!D.roles.length)return setTimeout(t,300);ri%=D.roles.length;const w=D.roles[ri];ty.textContent=w.slice(0,ci);if(!del&&ci++>=w.length){del=true;return setTimeout(t,1600)}if(del&&--ci<=0){ci=0;del=false;ri=(ri+1)%D.roles.length}setTimeout(t,del?35:70)})();
function sc(){const h=document.documentElement,p=h.scrollTop/(h.scrollHeight-h.clientHeight||1);$("#xp").style.width=(p*100)+"%";let cur=0;ids.forEach((id,i)=>{const e=$("#"+id);if(e&&e.getBoundingClientRect().top<innerHeight*.4)cur=i});$("#lv").textContent=cur+1;document.querySelectorAll("nav a").forEach((a,i)=>a.classList.toggle("on",i===cur))}
addEventListener("scroll",sc,{passive:true});
const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add("in");e.target.querySelectorAll(".fill").forEach(f=>f.style.width=f.dataset.w+"%")}}),{threshold:.15});
// ---------- uploads ----------
function pick(acc){return new Promise(r=>{const f=document.createElement("input");f.type="file";f.accept=acc;f.onchange=()=>r(f.files[0]);f.click()})}
const rd=f=>new Promise((res,rej)=>{const r=new FileReader();r.onload=()=>res(r.result);r.onerror=rej;r.readAsDataURL(f)});
async function upload(acc){if(!assets&&!local){toast("Uploads aren’t available for this account");return null}const f=await pick(acc);if(!f)return null;toast("Uploading…");try{
 if(!assets){if(f.size>25e6){toast("File too large (max ~25 MB)");return null}const u=await rd(f);toast("Added ✓");return{url:u,name:f.name,type:f.type}}const r=await assets.upload(f);toast("Uploaded ✓");return{url:r.url,name:f.name,type:f.type||r.contentType||""}}catch(e){toast("Upload failed: "+(e.message||e.code||"error"));return null}}
// ---------- modals ----------
function closeM(){M.classList.remove("open");if(editing)render()}
function openP(i){const p=D.projects[i];M.dataset.i=i;let h=`<button class="x" aria-label="Close">×</button>`;
 if(editing){h+=`<h2 style="margin:0 0 14px">Edit project</h2><div class="fm">
<label>TITLE<input data-pf="t" value="${esc(p.t)}"></label>
<label>SHORT DESCRIPTION (shown on the card)<input data-pf="d" value="${esc(p.d)}"></label>
<label>FULL DESCRIPTION<textarea data-pf="long">${esc(p.long)}</textarea></label>
<div class="two"><label>CATEGORY<input data-pf="cat" value="${esc(p.cat)}"></label><label>RATING (1–5 ★)<input data-pf="r" type="number" min="1" max="5" value="${p.r}"></label></div>
<label>TAGS (comma-separated)<input data-pf="tags" value="${esc(p.tags.join(", "))}"></label>
<label>PROJECT LINK (optional; leave empty if not deployed)<input data-pf="link" value="${esc(p.link)}" placeholder="https://…"></label>
<div>${p.file?`Attached: <b>${esc(p.file.name)}</b> `:"No file attached. "}<button class="chip" data-act="attach">Attach screenshot / video / file</button> ${p.file?`<button class="chip" data-act="detach">Remove file</button>`:""}</div>
<div class="cta"><button class="btn" data-act="done">Done</button><button class="btn alt" data-act="delP">Delete project</button></div></div>`}
 else{const f=p.file,L=url(p.link),fu=f?esc(url(f.url)):"";let m="";
  if(f){m=/^image\//.test(f.type)?`<img class="pm" src="${fu}" alt="">`:/^video\//.test(f.type)?`<video class="pm" src="${fu}" controls></video>`:/^audio\//.test(f.type)?`<audio src="${fu}" controls style="width:100%;margin-bottom:14px"></audio>`:""}
  h+=`${m}<div class="rar" style="color:var(--gold);letter-spacing:3px">${"★".repeat(p.r)}</div><h2 style="margin:6px 0 12px">${esc(p.t)}</h2><p style="color:#c3c8da;white-space:pre-line">${esc(p.long)}</p>${p.tags.map(t=>`<span class="tag">${esc(t)}</span>`).join("")}<div class="cta">${L?`<a class="btn" href="${esc(L)}" target="_blank" rel="noopener">View Project</a>`:""}${f&&!m?`<a class="btn alt" href="${fu}" target="_blank" rel="noopener">Open ${esc(f.name)}</a>`:""}${!L&&!f?`<span style="color:var(--soft)">Project link coming soon.</span>`:""}</div>`}
 $("#mbody").innerHTML=h;M.classList.add("open")}
function openSet(){$("#mbody").innerHTML=`<button class="x" aria-label="Close">×</button><h2 style="margin:0 0 14px">Background, music &amp; more</h2><div class="fm">
<label>BACKGROUND IMAGE ${D.bg?`· ${esc(D.bg.name)}`:""}</label><div><button class="chip" data-act="bgUp">Upload image</button> ${D.bg?`<button class="chip" data-act="bgDel">Remove</button>`:""}</div>
<label>DARKNESS OVER IMAGE<input type="range" min="0.1" max="0.9" step="0.05" value="${D.dim}" data-set="dim"></label>
<label>BACKGROUND MUSIC ${D.music?`· ${esc(D.music.name)}`:""}</label><div><button class="chip" data-act="muUp">Upload audio (mp3, ogg, wav)</button> ${D.music?`<button class="chip" data-act="muDel">Remove</button>`:""}</div>
<label>LOGO TAG (top left)<input data-set="short" value="${esc(D.short)}"></label>
<label>TYPING ROLES (one per line)<textarea data-set="roles" style="min-height:90px">${esc(D.roles.join("\n"))}</textarea></label>
${local?`<label>SAVE / SHARE YOUR EDITS</label><div><button class="chip" data-act="exp">Export data file</button> <button class="chip" data-act="imp">Import</button> <button class="chip" data-act="rst">Reset my edits</button></div><p style="font-size:12px;color:var(--soft);margin:0">Edits live in this browser. To publish them, click Export, then put the downloaded <b>portfolio-data.json</b> in the same folder as this HTML file before deploying.</p>`:""}
<div class="cta"><button class="btn" data-act="done">Done</button></div></div>`;M.classList.add("open")}
// ---------- actions ----------
async function act(a,e){const i=+a.dataset.i,k=a.dataset.act;
 if(k==="flt"){flt=a.dataset.c;render()}
 else if(k==="openP"){openP(i)}
 else if(k==="addP"){D.projects.push({t:"New project",d:"Short summary.",long:"Full description.",cat:"Web",tags:[],link:"",file:null,r:3});save();render();openP(D.projects.length-1)}
 else if(k==="delP"){const j=+M.dataset.i;if(confirm("Delete this project?")){D.projects.splice(j,1);save();closeM()}}
 else if(k==="attach"){const f=await upload("image/*,video/*,audio/*,.pdf,.txt,.md,.json,.csv");if(f){D.projects[+M.dataset.i].file=f;save();openP(+M.dataset.i)}}
 else if(k==="detach"){D.projects[+M.dataset.i].file=null;save();openP(+M.dataset.i)}
 else if(k==="addS"){D.skills.push(["New skill",50]);save();render()}
 else if(k==="delS"){D.skills.splice(i,1);save();render()}
 else if(k==="addA"){D.achv.push(["🏅","New achievement",0]);save();render()}
 else if(k==="delA"){D.achv.splice(i,1);save();render()}
 else if(k==="lockA"){D.achv[i][2]=D.achv[i][2]?0:1;save();render()}
 else if(k==="addJ"){D.journey.push(["Year","Title","Place"]);save();render()}
 else if(k==="delJ"){D.journey.splice(i,1);save();render()}
 else if(k==="bgUp"){const f=await upload("image/*");if(f){D.bg=f;applyBg();save();openSet()}}
 else if(k==="bgDel"){D.bg=null;applyBg();save();openSet()}
 else if(k==="muUp"){const f=await upload("audio/*");if(f){D.music=f;applyMusic();save();openSet()}}
 else if(k==="muDel"){D.music=null;applyMusic();save();openSet()}
 else if(k==="exp"){const x=document.createElement("a");x.href=URL.createObjectURL(new Blob([JSON.stringify(D)],{type:"application/json"}));x.download="portfolio-data.json";x.click();toast("Exported portfolio-data.json")}
 else if(k==="imp"){const f=await pick(".json");if(f){try{D=Object.assign(clone(DEF),JSON.parse(await f.text()));save();render();applyAll();openSet()}catch(e){toast("Invalid file")}}}
 else if(k==="rst"){if(confirm("Discard your local edits?")){try{await idb("del")}catch(e){}location.reload()}}
 else if(k==="done"){closeM()}}
app.addEventListener("click",e=>{if(editing&&e.target.closest("a"))e.preventDefault();const a=e.target.closest("[data-act]");if(a)act(a,e)});
M.addEventListener("click",e=>{if(e.target===M||e.target.classList.contains("x"))return closeM();const a=e.target.closest("[data-act]");if(a)act(a,e)});
document.addEventListener("input",e=>{const t=e.target;
 if(t.dataset.sl!==undefined){const i=+t.dataset.sl,v=+t.value,sk=t.closest(".sk");D.skills[i][1]=v;sk.querySelector(".fill").style.width=v+"%";sk.querySelector("em").textContent="Lv."+Math.round(v/10);save()}
 else if(t.dataset.pf){const p=D.projects[+M.dataset.i],f=t.dataset.pf;p[f]=f==="tags"?t.value.split(",").map(s=>s.trim()).filter(Boolean):f==="r"?Math.min(5,Math.max(1,Math.round(+t.value)||1)):t.value;save()}
 else if(t.dataset.set){const f=t.dataset.set;if(f==="roles")D.roles=t.value.split("\n").map(s=>s.trim()).filter(Boolean);else if(f==="dim"){D.dim=+t.value;applyBg()}else{D[f]=t.value;applyAll()}save()}});
document.addEventListener("focusout",e=>{const t=e.target.closest&&e.target.closest("[data-e]");if(t){sp(t.dataset.e,t.innerText.trim());applyAll();save()}});
document.addEventListener("keydown",e=>{const t=e.target;
 if(t.dataset&&t.dataset.e&&e.key==="Enter"){e.preventDefault();t.blur();return}
 if(e.key==="Escape")closeM();
 if(/INPUT|TEXTAREA/.test(t.tagName)||t.isContentEditable||e.ctrlKey||e.metaKey)return;
 const n=+e.key;if(n>=1&&n<=6)$("#"+ids[n-1]).scrollIntoView({behavior:"smooth"})});
// tilt
app.addEventListener("mousemove",e=>{const c=e.target.closest(".card:not(.add)");if(!c)return;const r=c.getBoundingClientRect(),x=(e.clientX-r.left)/r.width-.5,y=(e.clientY-r.top)/r.height-.5;c.style.transform=`perspective(700px) rotateY(${x*8}deg) rotateX(${-y*8}deg) translateY(-3px)`});
app.addEventListener("mouseout",e=>{const c=e.target.closest(".card");if(c)c.style.transform=""});
// copy + form
function cp(){try{navigator.clipboard.writeText(D.email).then(()=>toast("Email copied"),()=>toast(D.email))}catch(e){toast(D.email)}}
app.addEventListener("click",e=>{if(e.target.id==="cp"||e.target.closest("#cp2"))cp()});
app.addEventListener("submit",e=>{e.preventDefault();const f=e.target;location.href=`mailto:${D.email}?subject=${encodeURIComponent(f.s.value)}&body=${encodeURIComponent(f.m.value+"\n\n— "+f.n.value+" ("+f.e.value+")")}`;toast("Opening your email app…")});
// edit mode
$("#eb").onclick=()=>{editing=!editing;document.body.classList.toggle("editing",editing);$("#eb").textContent=editing?"✔ Finish editing":"✎ Edit portfolio";$("#gs").style.display=editing?"":"none";setSv(editing?"Click any dotted text to edit":"");render()};
$("#gs").onclick=openSet;
// constellation background
const cv=$("#bg"),cx=cv.getContext("2d");let W,H,P=[],mx=-999,my=-999;
function rs(){W=cv.width=innerWidth;H=cv.height=innerHeight;P=Array.from({length:Math.min(90,Math.floor(W*H/14000))},()=>({x:Math.random()*W,y:Math.random()*H,vx:(Math.random()-.5)*.25,vy:(Math.random()-.5)*.25,r:Math.random()*1.4+.4}))}
rs();addEventListener("resize",rs);addEventListener("mousemove",e=>{mx=e.clientX;my=e.clientY});
(function d(){cx.clearRect(0,0,W,H);for(const p of P){p.x+=p.vx;p.y+=p.vy;if(p.x<0||p.x>W)p.vx*=-1;if(p.y<0||p.y>H)p.vy*=-1;cx.fillStyle="#d8b46acc";cx.beginPath();cx.arc(p.x,p.y,p.r,0,6.3);cx.fill()}
for(let i=0;i<P.length;i++){for(let j=i+1;j<P.length;j++){const a=P[i],b=P[j],dd=Math.hypot(a.x-b.x,a.y-b.y);if(dd<120){cx.strokeStyle=`rgba(94,225,255,${.18*(1-dd/120)})`;cx.beginPath();cx.moveTo(a.x,a.y);cx.lineTo(b.x,b.y);cx.stroke()}}
const dm=Math.hypot(P[i].x-mx,P[i].y-my);if(dm<160){cx.strokeStyle=`rgba(216,180,106,${.5*(1-dm/160)})`;cx.beginPath();cx.moveTo(P[i].x,P[i].y);cx.lineTo(mx,my);cx.stroke()}}
requestAnimationFrame(d)})();
// ---------- boot ----------
async function localMode(){local=true;try{const r=await fetch("portfolio-data.json",{cache:"no-store"});if(r.ok)D=Object.assign(clone(DEF),await r.json())}catch(e){}
 try{const s=await idb("get");if(s)D=Object.assign(clone(DEF),JSON.parse(s))}catch(e){}
 let ok=!location.hostname||/^(localhost|127\.|\[::1\]|192\.168\.)/.test(location.hostname);try{if(/[?&]edit\b/.test(location.search))localStorage.setItem("pe","1");if(localStorage.getItem("pe"))ok=true}catch(e){}
 render();applyAll();if(ok)$("#dock").style.display="flex"}
render();applyAll();
(async()=>{if(!window.claude){await localMode();return}try{const c=window.claude;const [u,d,a]=await Promise.all([c.use("user"),c.use("db"),c.use("assets")]);assets=a;db=d;canEdit=!!(u&&u.canEdit()&&d);
 if(d){ref=d.doc("portfolio/main");ref.onSnapshot(s=>{if(editing&&loaded)return;if(s.exists){try{D=Object.assign(clone(DEF),JSON.parse(s.data().json))}catch(e){}}loaded=true;render();applyAll()},()=>{})}
 $("#dock").style.display=canEdit?"flex":"none"}catch(e){}})();