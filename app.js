const data = (window.SKA_TIMELINE || []).slice().sort((a,b)=>a.year-b.year);
const list = document.querySelector("#timelineList");
const lineage = window.SKA_LINEAGE || {nodes:[],edges:[]};
const MAP_W=lineage.width||780;
const MAP_H=lineage.height||1260;
let activeFilter = "all";

function render(filter="all"){
  if(!list) return;
  const rows = filter === "all" ? data : data.filter(x => x.tags.includes(filter) || x.region === filter);
  list.innerHTML = rows.map(item => `
    <article class="timeline-item">
      <div class="year">${item.year}s</div>
      <div class="timeline-card">
        <div class="meta">${item.tags.map(t=>`<span class="tag ${t}">${t.toUpperCase()}</span>`).join("")}</div>
        <h3>${item.title}</h3>
        <p>${item.text}</p>
      </div>
    </article>`).join("");
}

function mapY(year){
  const min=1948,max=2026,top=74,bottom=1205;
  return top+((year-min)/(max-min))*(bottom-top);
}

function curvePath(a,b){
  const y1=mapY(a.year),y2=mapY(b.year);
  const bend=Math.max(28,Math.abs(y2-y1)*.32);
  return `M ${a.x} ${y1+17} C ${a.x} ${y1+bend}, ${b.x} ${y2-bend}, ${b.x} ${y2-17}`;
}

function renderLineage(){
  const svg=document.querySelector("#lineageSvg");
  if(!svg||!lineage.nodes.length) return;
  svg.setAttribute("viewBox",`0 0 ${MAP_W} ${MAP_H}`);

  const byId=Object.fromEntries(lineage.nodes.map(n=>[n.id,n]));
  const years=[1950,1960,1970,1980,1990,2000,2010,2020];

  const laneLabels=`
    <g class="lineage-lanes">
      <text x="145" y="28" text-anchor="middle">ROOTS</text>
      <text x="360" y="28" text-anchor="middle">JAMAICA</text>
      <text x="555" y="28" text-anchor="middle">DUB / FUSION</text>
      <text x="690" y="28" text-anchor="middle">UK / USA</text>
    </g>`;

  const grid=years.map(y=>`
    <g class="lineage-year">
      <text x="8" y="${mapY(y)+4}">${y}</text>
      <line x1="56" y1="${mapY(y)}" x2="${MAP_W-12}" y2="${mapY(y)}"></line>
    </g>`).join("");

  const edges=lineage.edges.map(edge=>{
    const a=byId[edge.from],b=byId[edge.to];
    return `<path class="lineage-edge ${edge.type}" data-from="${edge.from}" data-to="${edge.to}" d="${curvePath(a,b)}" marker-end="url(#arrow-${edge.type})"></path>`;
  }).join("");

  const nodes=lineage.nodes.map(n=>{
    const y=mapY(n.year);
    const w=Math.max(86,Math.min(146,n.label.length*8.3+28));
    return `
      <g class="lineage-node" data-id="${n.id}" data-tags="${n.tags.join(" ")}" tabindex="0" role="button" aria-label="${n.label}">
        <rect x="${n.x-w/2}" y="${y-17}" width="${w}" height="34" rx="3"></rect>
        <text x="${n.x}" y="${y+4}" text-anchor="middle">${n.label}</text>
      </g>`;
  }).join("");

  svg.innerHTML=`
    <defs>
      <marker id="arrow-main" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse"><path d="M 0 0 L 10 5 L 0 10 z"></path></marker>
      <marker id="arrow-branch" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse"><path d="M 0 0 L 10 5 L 0 10 z"></path></marker>
    </defs>
    ${laneLabels}
    ${grid}
    ${edges}
    ${nodes}
  `;

  svg.querySelectorAll(".lineage-node").forEach(el=>{
    const open=()=>selectLineage(el.dataset.id);
    el.addEventListener("click",open);
    el.addEventListener("keydown",e=>{if(e.key==="Enter"||e.key===" "){e.preventDefault();open();}});
  });

  applyLineageFilter(activeFilter);
}

function selectLineage(id){
  const node=lineage.nodes.find(n=>n.id===id);
  const pop=document.querySelector("#lineagePopover");
  if(!node||!pop) return;

  document.querySelectorAll(".lineage-node").forEach(n=>n.classList.toggle("selected",n.dataset.id===id));

  const xPct=(node.x/MAP_W)*100;
  const yPct=(mapY(node.year)/MAP_H)*100;
  const placeLeft=node.x>MAP_W*.58;

  pop.hidden=false;
  pop.classList.toggle("left",placeLeft);
  pop.classList.toggle("right",!placeLeft);
  pop.style.top=`${yPct}%`;
  if(placeLeft){
    pop.style.right=`calc(${100-xPct}% + 18px)`;
    pop.style.left="auto";
  }else{
    pop.style.left=`calc(${xPct}% + 18px)`;
    pop.style.right="auto";
  }
  pop.innerHTML=`
    <button class="lineage-close" type="button" aria-label="閉じる">×</button>
    <p class="eyebrow">${node.year}</p>
    <h3>${node.label}</h3>
    <p>${node.summary}</p>
    <a class="lineage-more" href="${node.article}">詳しく読む →</a>
  `;
  pop.querySelector(".lineage-close").addEventListener("click",e=>{
    e.stopPropagation();
    pop.hidden=true;
    document.querySelectorAll(".lineage-node").forEach(n=>n.classList.remove("selected"));
  });
}

function applyLineageFilter(filter){
  const nodes=[...document.querySelectorAll(".lineage-node")];
  const visible=new Set();
  nodes.forEach(el=>{
    const tags=(el.dataset.tags||"").split(" ");
    const match=filter==="all"||tags.includes(filter);
    el.classList.toggle("muted",!match);
    if(match) visible.add(el.dataset.id);
  });
  document.querySelectorAll(".lineage-edge").forEach(edge=>{
    const match=filter==="all"||(visible.has(edge.dataset.from)&&visible.has(edge.dataset.to));
    edge.classList.toggle("muted",!match);
  });
  const pop=document.querySelector("#lineagePopover");
  if(pop&&!pop.hidden) pop.hidden=true;
}

render();
renderLineage();

document.querySelectorAll("[data-filter]").forEach(btn=>{
  btn.addEventListener("click",()=>{
    activeFilter=btn.dataset.filter;
    document.querySelectorAll("[data-filter]").forEach(b=>b.classList.remove("active"));
    btn.classList.add("active");
    render(activeFilter);
    applyLineageFilter(activeFilter);
  });
});
document.querySelectorAll("[data-jump]").forEach(btn=>{
  btn.addEventListener("click",()=>document.getElementById(btn.dataset.jump)?.scrollIntoView({behavior:"smooth"}));
});