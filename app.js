const data = (window.SKA_TIMELINE || []).slice().sort((a,b)=>a.year-b.year);
const list = document.querySelector("#timelineList");
const lineage = window.SKA_LINEAGE || {nodes:[],edges:[]};
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
  const min=1948, max=2026, top=62, bottom=1010;
  return top + ((year-min)/(max-min))*(bottom-top);
}

function curvePath(a,b){
  const y1=mapY(a.year), y2=mapY(b.year);
  const bend=Math.max(36,Math.abs(y2-y1)*0.35);
  return `M ${a.x} ${y1+18} C ${a.x} ${y1+bend}, ${b.x} ${y2-bend}, ${b.x} ${y2-18}`;
}

function renderLineage(){
  const svg=document.querySelector("#lineageSvg");
  if(!svg || !lineage.nodes.length) return;

  const byId=Object.fromEntries(lineage.nodes.map(n=>[n.id,n]));
  const years=[1950,1960,1970,1980,1990,2000,2010,2020];

  const grid=years.map(y=>`
    <g class="lineage-year">
      <text x="8" y="${mapY(y)+4}">${y}</text>
      <line x1="58" y1="${mapY(y)}" x2="885" y2="${mapY(y)}"></line>
    </g>`).join("");

  const edges=lineage.edges.map(([from,to])=>{
    const a=byId[from], b=byId[to];
    return `<path class="lineage-edge" data-from="${from}" data-to="${to}" d="${curvePath(a,b)}" marker-end="url(#arrow)"></path>`;
  }).join("");

  const nodes=lineage.nodes.map(n=>{
    const y=mapY(n.year);
    const w=Math.max(92,Math.min(160,n.label.length*9+34));
    return `
      <g class="lineage-node" data-id="${n.id}" data-tags="${n.tags.join(" ")}" tabindex="0" role="button" aria-label="${n.label}">
        <rect x="${n.x-w/2}" y="${y-19}" width="${w}" height="38" rx="4"></rect>
        <text x="${n.x}" y="${y+5}" text-anchor="middle">${n.label}</text>
      </g>`;
  }).join("");

  svg.innerHTML=`
    <defs>
      <marker id="arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
        <path d="M 0 0 L 10 5 L 0 10 z"></path>
      </marker>
    </defs>
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
  const panel=document.querySelector("#lineageDetail");
  if(!node||!panel) return;
  document.querySelectorAll(".lineage-node").forEach(n=>n.classList.toggle("selected",n.dataset.id===id));
  panel.hidden=false;
  panel.innerHTML=`
    <div>
      <p class="eyebrow">${node.year}</p>
      <h3>${node.label}</h3>
      <p>${node.summary}</p>
    </div>
    <a class="button lineage-more" href="${node.article}">詳しく読む →</a>
  `;
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
    const match=filter==="all" || (visible.has(edge.dataset.from)&&visible.has(edge.dataset.to));
    edge.classList.toggle("muted",!match);
  });
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