/* ==================== UTILS ==================== */
const pad=(n,l)=>String(n).padStart(l,'0');
const escapeXML=s=>(s||"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");
const toWin1252=s=>escapeXML(s)
  .replace(/é/g,"&#233;").replace(/è/g,"&#232;").replace(/ê/g,"&#234;")
  .replace(/à/g,"&#224;").replace(/ù/g,"&#249;").replace(/ç/g,"&#231;");

function download(name,content){
  const a=document.createElement("a");
  a.href=URL.createObjectURL(new Blob([content],{type:"text/xml"}));
  a.download=name;a.click();
}

function clef(){
  const d=new Date();
  return `${d.getFullYear()}_${pad(d.getMonth()+1,2)}_${pad(d.getDate(),2)}_${pad(d.getHours(),2)}_${pad(d.getMinutes(),2)}_${pad(d.getSeconds(),2)}_${Math.floor(Math.random()*1e17)}`;
}

/* ==================== PIECES ==================== */
let pieces=[];

function addPiece(){
  pieces.push({clef:clef(),bat:"",loc:"",photos:[]});
  renderPieces();renderZPSOLoc();
}

function renderPieces(){
  const c=document.getElementById("pieces");
  c.innerHTML="";
  pieces.forEach((p,i)=>{
    c.innerHTML+=`
      <div class="card">
        <label>Bâtiment</label>
        <input oninput="pieces[${i}].bat=this.value">
        <label>Pièce</label>
        <input oninput="pieces[${i}].loc=this.value">
        <label>Photos</label>
        <input type="file" multiple accept="image/*"
          onchange="addPhoto(${i},this)">
      </div>`;
  });
}

function addPhoto(i,input){
  [...input.files].forEach(f=>{
    pieces[i].photos.push({file:f,name:f.name});
  });
}

/* ==================== EXPORT PIECES ==================== */
function exportPieces(){
  let x=`<?xml version="1.0" encoding="windows-1252"?><LiTable_General_Pieces_Toutes>`;
  pieces.forEach((p,i)=>{
    x+=`<LiItem_table_General_Pieces_Toutes>
      <LiColonne_id_classement_champs>${pad(i,5)}</LiColonne_id_classement_champs>
      <LiColonne_ClefComposant>${p.clef}</LiColonne_ClefComposant>
      <LiColonne_Batiment>${toWin1252(p.bat)}</LiColonne_Batiment>
      <LiColonne_Local>${toWin1252(p.loc)}</LiColonne_Local>
    </LiItem_table_General_Pieces_Toutes>`;
  });
  x+=`</LiTable_General_Pieces_Toutes>`;
  download("Table_General_Pieces_Toutes.xml",x);
}

/* ==================== ZPSO ==================== */
let norme=null,zpsos=[],zpsoIdx=1;

fetch("norme46_020.json")
  .then(r=>r.json())
  .then(j=>norme=j)
  .catch(()=>console.warn("JSON norme non chargé"));

function renderZPSOLoc(){
  const c=document.getElementById("zpsoLocalisations");
  c.innerHTML="";
  pieces.forEach((p,i)=>{
    c.innerHTML+=`<label><input type="checkbox" data-i="${i}"> ${p.bat} - ${p.loc}</label>`;
  });
}

function updateOuvrages(){
  const t=document.getElementById("zpsoType").value;
  const o=document.getElementById("zpsoOuvrage");
  o.innerHTML="<option value=''>Libre</option>";
  if(!norme||!t||!norme.typesReperage[t])return;
  norme.typesReperage[t].categories.forEach(c=>{
    o.innerHTML+=`<option>${c.libelle}</option>`;
  });
}

function updateParties(){
  const t=document.getElementById("zpsoType").value;
  const o=document.getElementById("zpsoOuvrage").value;
  const p=document.getElementById("zpsoPartie");
  p.innerHTML="<option value=''>Libre</option>";
  if(!norme||!t||!o)return;
  const cat=norme.typesReperage[t].categories.find(c=>c.libelle===o);
  if(cat)cat.composants.forEach(c=>p.innerHTML+=`<option>${c.libelle}</option>`);
}

function addZPSO(){
  const id=`ZPSO-${pad(zpsoIdx,3)}`;
  const int=pad(zpsoIdx,24);
  [...document.querySelectorAll("#zpsoLocalisations input:checked")].forEach(cb=>{
    const p=pieces[cb.dataset.i];
    zpsos.push({
      clef:clef(),
      loc:`${p.bat} - ${p.loc}`,
      id,int,
      ouvrage:document.getElementById("zpsoOuvrage").value,
      partie:document.getElementById("zpsoPartie").value,
      res:document.getElementById("zpsoResultat").value,
      jus:document.getElementById("zpsoJustification").value,
      et:document.getElementById("zpsoEtat").value,
      csp:document.getElementById("zpsoCSP").value
    });
  });
  zpsoIdx++;
}

function exportZPSO(){
  let x=`<?xml version="1.0" encoding="windows-1252"?><LiTable_Z_Amiante>`;
  zpsos.forEach((z,i)=>{
    x+=`<LiItem_table_Z_Amiante>
      <LiColonne_id_classement_champs>${pad(i,5)}</LiColonne_id_classement_champs>
      <LiColonne_ClefComposant>${z.clef}</LiColonne_ClefComposant>
      <LiColonne_Localisation>${toWin1252(z.loc)}</LiColonne_Localisation>
      <LiColonne_Ouvrages>${toWin1252(z.ouvrage)}</LiColonne_Ouvrages>
      <LiColonne_Partie_Inspectee>${toWin1252(z.partie)}</LiColonne_Partie_Inspectee>
      <LiColonne_Id_Prelevement>${z.id}</LiColonne_Id_Prelevement>
      <LiColonne_Id_Prelevement_Int_txt>${z.int}</LiColonne_Id_Prelevement_Int_txt>
      <LiColonne_Resultats>${toWin1252(z.res)}</LiColonne_Resultats>
      <LiColonne_Justification>${toWin1252(z.jus)}</LiColonne_Justification>
      <LiColonne_Etat_Conservation>${toWin1252(z.et)}</LiColonne_Etat_Conservation>
      <LiColonne_ListeCSP_amiante>${toWin1252(z.csp)}</LiColonne_ListeCSP_amiante>
      <LiColonne_Reperage_3>${z.id}</LiColonne_Reperage_3>
    </LiItem_table_Z_Amiante>`;
  });
  x+=`</LiTable_Z_Amiante>`;
  download("Table_Z_Amiante.xml",x);
}

/* ==================== UI ==================== */
function showTab(t){
  document.getElementById("tab-pieces").classList.toggle("hidden",t!=="pieces");
  document.getElementById("tab-zpso").classList.toggle("hidden",t!=="zpso");
  document.querySelectorAll(".tab").forEach(b=>b.classList.remove("active"));
  event.target.classList.add("active");
}

renderPieces();renderZPSOLoc();
