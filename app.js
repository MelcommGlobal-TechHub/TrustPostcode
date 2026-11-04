/* TrustPostcode prototype. Demo mode is intentionally on until Supabase is configured. */
const CONFIG = {
  supabaseUrl: "",       // e.g. https://YOUR_PROJECT.supabase.co
  supabaseAnonKey: "",   // Supabase anon/publishable key only; never put NIPOST key here
  demoMode: true
};
const $ = (s, root=document) => root.querySelector(s);
const $$ = (s, root=document) => [...root.querySelectorAll(s)];
let historyItems = [];
let supabaseClient = null;
let authListenerRegistered = false;
let toastTimer;
function toast(message){const el=$("#toast");el.textContent=message;el.classList.add("show");clearTimeout(toastTimer);toastTimer=setTimeout(()=>el.classList.remove("show"),3000)}
function navigate(page){$$(".page").forEach(p=>p.classList.toggle("active",p.id===`page-${page}`));$$(".nav-link").forEach(a=>a.classList.toggle("active",a.dataset.page===page));const names={overview:"Overview",verify:"Verify postcode",history:"Verification history",integrations:"API integrations",docs:"Documentation"};$("#crumbCurrent").textContent=names[page]||"Overview";$("#sidebar").classList.remove("open");location.hash=page}
function loadHistory(){try{historyItems=JSON.parse(sessionStorage.getItem("tp_history")||"[]")}catch{historyItems=[]}renderHistory()}
function saveHistory(item){historyItems.unshift(item);historyItems=historyItems.slice(0,100);sessionStorage.setItem("tp_history",JSON.stringify(historyItems));renderHistory()}
function esc(s){return String(s??"—").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]))}
function renderHistory(){
  const ok=historyItems.filter(x=>x.valid).length, fail=historyItems.length-ok;
  $("#totalCount").textContent=historyItems.length;$("#successCount").textContent=ok;$("#failedCount").textContent=fail;
  const row=(x,full=false)=>`<tr>${full?`<td>${esc(x.reference)}</td>`:""}<td>${esc(x.postcode)}</td><td>${esc(x.location||"Not resolved")}</td><td><span class="status-badge ${x.valid?"":"invalid"}">${x.valid?"Valid":"Not verified"}</span></td><td>${esc(x.mode)}</td><td>${esc(x.time)}</td></tr>`;
  $("#recentRows").innerHTML=historyItems.length?historyItems.slice(0,5).map(x=>row(x)).join(""):`<tr><td colspan="5" class="empty">No verifications yet. Run your first postcode lookup.</td></tr>`;
  $("#historyRows").innerHTML=historyItems.length?historyItems.map(x=>row(x,true)).join(""):`<tr><td colspan="6" class="empty">No activity to display.</td></tr>`;
  $("#historySub").textContent=`${historyItems.length} verification record${historyItems.length===1?"":"s"}`;
}
function formatCode(value){return value.toUpperCase().replace(/[^A-Z0-9]/g,"").replace(/^(.{2})(.{0,2})(.{0,3})(.{0,2})(.{0,2}).*$/,(m,a,b,c,d,e)=>[a,b,c,d,e].filter(Boolean).join("-"))}
function validFormat(code){return /^[A-Z]{2}-\d{2}-[A-Z0-9]{3}-[A-Z]{2}-\d{2}$/.test(code)}
function demoLookup(code){
  if(code==="EK-01-A03-FK-01")return {data:{postcode:code,valid:true,administrative_address:{state_name:"EKITI",lga_name:"ADO EKITI",locality_name:"ADO EKITI",zone:"SOUTH WEST"},recent_house_address:{recent:"NTA ROAD, BACK OF FABIAN HOTEL, ADO EKITI"},building_use_status:"residential"},demo:true};
  return {data:{postcode:code,valid:false,message:"This is a demonstration response. Connect your NIPOST API key to verify real postcodes."},demo:true};
}
async function callLookup(code,level){
  if(CONFIG.demoMode)return demoLookup(code);
  if(!supabaseClient)throw new Error("Supabase is not configured. Add the project URL and anon key in app.js.");
  const {data:{session},error:sessionError}=await supabaseClient.auth.getSession();
  if(sessionError||!session)throw new Error("Please sign in to run live postcode verification.");
  const {data,error}=await supabaseClient.functions.invoke("trustpostcode-api",{body:{action:"lookup",code,level:Number(level)}});
  if(error)throw new Error(error.message||"The secure postcode service could not be reached.");
  return data;
}
function renderResult(payload,code,mode,reference){
  const d=payload?.data||payload;const valid=Boolean(d?.valid);const a=d?.administrative_address||{};const house=d?.recent_house_address||{};
  const loc=[a.locality_name,a.lga_name,a.state_name].filter(Boolean).join(", ")||"Location details not supplied";
  $("#resultPanel").innerHTML=`<div class="result-data"><div class="result-head"><div><h3>Lookup result</h3><p>${payload.demo?"Demonstration data":"Official NIPOST API response"}</p></div><span class="status-badge ${valid?"":"invalid"}">${valid?"✓ Valid postcode":"Not verified"}</span></div><div class="result-code"><small>POSTCODE REFERENCE</small><strong>${esc(d.postcode||code)}</strong></div><div class="detail-grid"><div class="detail-item"><small>STATE</small><b>${esc(a.state_name)}</b></div><div class="detail-item"><small>LOCAL GOVERNMENT</small><b>${esc(a.lga_name)}</b></div><div class="detail-item"><small>LOCALITY</small><b>${esc(a.locality_name)}</b></div><div class="detail-item"><small>GEOGRAPHIC ZONE</small><b>${esc(a.zone)}</b></div><div class="detail-item"><small>RECENT HOUSE ADDRESS</small><b>${esc(house.recent||"Not available at this level")}</b></div><div class="detail-item"><small>BUILDING USE</small><b>${esc(d.building_use_status||"Not supplied")}</b></div></div>${d.message?`<p class="level-note">${esc(d.message)}</p>`:""}<div class="receipt-row"><span>REFERENCE: <b>${esc(reference)}</b></span><button class="secondary" id="copyReceipt">Copy result</button></div></div>`;
  $("#copyReceipt").addEventListener("click",()=>{navigator.clipboard?.writeText(JSON.stringify(payload,null,2)).then(()=>toast("Lookup response copied")).catch(()=>toast("Copy unavailable in this browser"))});
}
$("#lookupForm").addEventListener("submit",async e=>{
  e.preventDefault();const input=$("#postcodeInput"),code=formatCode(input.value.trim());input.value=code;
  if(!validFormat(code)){toast("Enter a postcode in the format AA-99-A99-AA-99");$("#formatStatus").textContent="Check the postcode format";return}
  const btn=$("#lookupButton");btn.disabled=true;btn.textContent="Checking postcode…";$("#resultPanel").innerHTML='<div class="result-empty"><div class="empty-illustration"><span>◌</span></div><h3>Looking up postcode</h3><p>Contacting the configured verification service.</p></div>';
  const ref="TP-"+Date.now().toString(36).toUpperCase();let payload,mode=CONFIG.demoMode?"Demo":"Live";
  try{payload=await callLookup(code,$("#lookupLevel").value);const d=payload?.data||payload;const a=d?.administrative_address||{};const item={reference:ref,postcode:code,location:[a.locality_name,a.lga_name,a.state_name].filter(Boolean).join(", "),valid:Boolean(d?.valid),mode,time:new Date().toLocaleString()};saveHistory(item);renderResult(payload,code,mode,ref);toast(CONFIG.demoMode?"Demo lookup complete":"Live NIPOST lookup complete")}
  catch(err){const item={reference:ref,postcode:code,location:"Service error",valid:false,mode,time:new Date().toLocaleString()};saveHistory(item);$("#resultPanel").innerHTML=`<div class="result-empty"><div class="empty-illustration"><span>!</span></div><h3>Lookup could not complete</h3><p>${esc(err.message)}</p></div>`;toast(err.message)}
  finally{btn.disabled=false;btn.innerHTML="<span>◎</span> Verify postcode"}
});
$("#postcodeInput").addEventListener("input",e=>{const raw=e.target.value.toUpperCase().replace(/[^A-Z0-9]/g,"");$("#formatStatus").textContent=raw.length>=11?"Check segment pattern":"5 segments · 12 characters"});
$("#clearCode").addEventListener("click",()=>{$("#postcodeInput").value="";$("#formatStatus").textContent="5 segments · 12 characters";$("#postcodeInput").focus()});
$(".sample-code").addEventListener("click",()=>{$("#postcodeInput").value="EK-01-A03-FK-01";$("#formatStatus").textContent="Sample format loaded"});
$("#exportCsv").addEventListener("click",()=>{if(!historyItems.length){toast("No records to export");return}const cols=["reference","postcode","location","valid","mode","time"];const csv=[cols.join(","),...historyItems.map(x=>cols.map(k=>`"${String(x[k]??"").replace(/"/g,'""')}"`).join(","))].join("\n");const url=URL.createObjectURL(new Blob([csv],{type:"text/csv"}));const a=document.createElement("a");a.href=url;a.download="trustpostcode-history.csv";a.click();URL.revokeObjectURL(url)});
$$("[data-page]").forEach(a=>a.addEventListener("click",e=>{e.preventDefault();navigate(a.dataset.page)}));
$$("[data-go]").forEach(b=>b.addEventListener("click",()=>navigate(b.dataset.go)));
$("#mobileMenu").addEventListener("click",()=>$("#sidebar").classList.toggle("open"));
$(".notice-close").addEventListener("click",()=>$(".notice").remove());
if(location.hash&&$("#page-"+location.hash.slice(1)))navigate(location.hash.slice(1));
loadHistory();
(async function initSupabase(){
 if(!CONFIG.supabaseUrl||!CONFIG.supabaseAnonKey)return;
 try{const lib=document.createElement("script");lib.src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2";lib.onload=()=>{supabaseClient=window.supabase.createClient(CONFIG.supabaseUrl,CONFIG.supabaseAnonKey);if(!CONFIG.demoMode){$(".env-pill").innerHTML="<i></i> LIVE API CONFIGURED";$("#integrationMode").textContent="Live configured";$(".integration-status").textContent="Backend configured";$(".integration-status").style.color="#16865f";$(".integration-status").style.background="#e8f8f1";$(".integration-status").style.borderColor="#d3f0e3";}refreshAuthState();};document.head.appendChild(lib)}catch(e){console.error(e)}
})();

async function refreshAuthState(){
 if(!supabaseClient)return;
 const {data:{session}}=await supabaseClient.auth.getSession();
 $("#authStatus").textContent=session?`Signed in as ${session.user.email}`:"Not signed in";
 $("#authStatus").classList.toggle("good",!!session);
 $("#signInButton").hidden=!!session;$("#signUpButton").hidden=!!session;$("#signOutButton").hidden=!session;
 if(!authListenerRegistered){supabaseClient.auth.onAuthStateChange(()=>{const current=supabaseClient.auth.getSession();current.then(({data:{session}})=>{if(!session){$("#authStatus").textContent="Not signed in";$("#authStatus").classList.remove("good");$("#signInButton").hidden=false;$("#signUpButton").hidden=false;$("#signOutButton").hidden=true;}else{$("#authStatus").textContent=`Signed in as ${session.user.email}`;$("#authStatus").classList.add("good");$("#signInButton").hidden=true;$("#signUpButton").hidden=true;$("#signOutButton").hidden=false;}})});authListenerRegistered=true;}
}
$("#signInButton").addEventListener("click",async()=>{
 if(!supabaseClient){toast("Configure Supabase URL and anon key first");return}
 const email=$("#authEmail").value.trim(),password=$("#authPassword").value;
 if(!email||!password){toast("Enter your email and password");return}
 const {error}=await supabaseClient.auth.signInWithPassword({email,password});
 if(error){toast(error.message);return} await refreshAuthState();toast("Signed in successfully");
});
$("#signUpButton").addEventListener("click",async()=>{
 if(!supabaseClient){toast("Configure Supabase URL and anon key first");return}
 const email=$("#authEmail").value.trim(),password=$("#authPassword").value;
 if(!email||password.length<8){toast("Enter an email and password of at least 8 characters");return}
 const {data,error}=await supabaseClient.auth.signUp({email,password});
 if(error){toast(error.message);return}
 toast(data.session?"Account created and signed in":"Account created. Check your email to confirm, then sign in.");
 await refreshAuthState();
});
$("#signOutButton").addEventListener("click",async()=>{
 if(!supabaseClient)return;const {error}=await supabaseClient.auth.signOut();
 if(error){toast(error.message);return}await refreshAuthState();toast("Signed out");
});
