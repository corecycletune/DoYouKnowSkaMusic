const SITE_BASE="/DoYouKnowSkaMusic/";
(function injectSitebar(){
  if(document.querySelector(".masthead") || document.querySelector(".sitebar")) return;
  const bar=document.createElement("header");
  bar.className="sitebar";
  bar.innerHTML=`
    <div class="sitebar-inner">
      <a class="site-logo" href="${SITE_BASE}" aria-label="Do you know ska music? HOME">
        <span class="site-logo-do">Do</span> you know <span class="site-logo-ska">ska</span> music?
      </a>
      <nav class="sitebar-nav" aria-label="サイトナビ">
        <a href="${SITE_BASE}">HOME</a>
        <a href="${SITE_BASE}#timeline">HISTORY</a>
        <a href="${SITE_BASE}genres/ska.html">GENRES</a>
        <a href="${SITE_BASE}genres/japan-ska.html">JAPAN</a>
        <a href="${SITE_BASE}#listen">LISTEN</a>
      </nav>
    </div>
  `;
  const checker=document.body.querySelector(":scope > .checker");
  if(checker) checker.insertAdjacentElement("afterend",bar);
  else document.body.prepend(bar);
})();

const data=(window.SKA_TIMELINE||[]).slice().sort((a,b)=>a.year-b.year);
const list=document.querySelector("#timelineList");
const lineage=window.SKA_LINEAGE||{nodes:[],edges:[]};
const MAP_W=lineage.width||940;
const MAP_H=lineage.height||1260;
let activeFilter="all";

function render(filter="all"){
  if(!list)return;
  const rows=filter==="all"?data:data.filter(x=>x.tags.includes(filter)||x.region===filter);
  list.innerHTML=rows.map(item=>`
    <article class="timeline-item">
      <div class="year">${item.year}s</div>
      <div class="timeline-card">
        <div class="meta">${item.tags.map(t=>`<span class="tag ${t}">${t.toUpperCase()}</span>`).join("")}</div>
        <h3>${item.title}</h3><p>${item.text}</p>
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
  if(!svg||!lineage.nodes.length)return;
  svg.setAttribute("viewBox",`0 0 ${MAP_W} ${MAP_H}`);
  const byId=Object.fromEntries(lineage.nodes.map(n=>[n.id,n]));
  const years=[1950,1960,1970,1980,1990,2000,2010,2020];
  const laneLabels=`
    <g class="lineage-lanes">
      <text x="135" y="28" text-anchor="middle">ROOTS</text>
      <text x="340" y="28" text-anchor="middle">JAMAICA</text>
      <text x="515" y="28" text-anchor="middle">DUB / FUSION</text>
      <text x="765" y="28" text-anchor="middle">SKA FAMILY</text>
      <text x="965" y="28" text-anchor="middle">JAPAN</text>
    </g>`;
  const grid=years.map(y=>`
    <g class="lineage-year"><text x="8" y="${mapY(y)+4}">${y}</text>
    <line x1="56" y1="${mapY(y)}" x2="${MAP_W-12}" y2="${mapY(y)}"></line></g>`).join("");
  const edges=lineage.edges.map(edge=>{
    const a=byId[edge.from],b=byId[edge.to];
    return `<path class="lineage-edge ${edge.type}${edge.detail?" detail-only":""}" data-from="${edge.from}" data-to="${edge.to}" data-detail="${edge.detail?"1":"0"}" d="${curvePath(a,b)}" marker-end="url(#arrow-${edge.type})"></path>`;
  }).join("");
  const nodes=lineage.nodes.map(n=>{
    const y=mapY(n.year);
    const w=Math.max(86,Math.min(156,n.label.length*8.2+28));
    return `
      <g class="lineage-node${n.detail?" detail-only":""}" data-id="${n.id}" data-tags="${n.tags.join(" ")}" data-detail="${n.detail?"1":"0"}" tabindex="0" role="button" aria-label="${n.label}">
        <rect x="${n.x-w/2}" y="${y-17}" width="${w}" height="34" rx="3"></rect>
        <text x="${n.x}" y="${y+4}" text-anchor="middle">${n.label}</text>
      </g>`;
  }).join("");
  svg.innerHTML=`
    <defs>
      <marker id="arrow-main" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse"><path d="M0 0 L10 5 L0 10 z"></path></marker>
      <marker id="arrow-branch" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse"><path d="M0 0 L10 5 L0 10 z"></path></marker>
      <marker id="arrow-ska" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse"><path d="M0 0 L10 5 L0 10 z"></path></marker>
    </defs>${laneLabels}${grid}${edges}${nodes}`;
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
  if(!node||!pop)return;
  document.querySelectorAll(".lineage-node").forEach(n=>n.classList.toggle("selected",n.dataset.id===id));
  const xPct=(node.x/MAP_W)*100;
  const yPct=(mapY(node.year)/MAP_H)*100;
  const placeLeft=node.x>MAP_W*.58;
  pop.hidden=false;
  pop.style.top=`${yPct}%`;
  if(placeLeft){pop.style.right=`calc(${100-xPct}% + 18px)`;pop.style.left="auto";}
  else{pop.style.left=`calc(${xPct}% + 18px)`;pop.style.right="auto";}
  pop.innerHTML=`
    <button class="lineage-close" type="button" aria-label="閉じる">×</button>
    <p class="eyebrow">${node.year}</p><h3>${node.label}</h3>
    <p>${node.summary}</p><a class="lineage-more" href="${node.article}">詳しく読む →</a>`;
  pop.querySelector(".lineage-close").addEventListener("click",e=>{
    e.stopPropagation();pop.hidden=true;
    document.querySelectorAll(".lineage-node").forEach(n=>n.classList.remove("selected"));
  });
}

function applyLineageFilter(filter){
  const showSkaDetail=filter==="ska";
  const shown=new Set();
  document.querySelectorAll(".lineage-node").forEach(el=>{
    const tags=(el.dataset.tags||"").split(" ");
    const isDetail=el.dataset.detail==="1";
    let show;
    if(filter==="all") show=!isDetail;
    else if(filter==="ska") show=tags.includes("ska");
    else show=!isDetail&&(tags.includes(filter));
    el.classList.toggle("hidden-filter",!show);
    if(show)shown.add(el.dataset.id);
  });
  document.querySelectorAll(".lineage-edge").forEach(edge=>{
    const show=shown.has(edge.dataset.from)&&shown.has(edge.dataset.to);
    edge.classList.toggle("hidden-filter",!show);
  });
  const pop=document.querySelector("#lineagePopover");
  if(pop&&!pop.hidden)pop.hidden=true;
}

render();renderLineage();
document.querySelectorAll("[data-filter]").forEach(btn=>{
  btn.addEventListener("click",()=>{
    activeFilter=btn.dataset.filter;
    document.querySelectorAll("[data-filter]").forEach(b=>b.classList.remove("active"));
    btn.classList.add("active");
    render(activeFilter);applyLineageFilter(activeFilter);
  });
});
document.querySelectorAll("[data-jump]").forEach(btn=>{
  btn.addEventListener("click",()=>document.getElementById(btn.dataset.jump)?.scrollIntoView({behavior:"smooth"}));
});


const YT_KNOWN = {
  "The Skatalites – Guns of Navarone":"DTol7Wm_NiQ",
  "Prince Buster – One Step Beyond":"-BaMA06WRaw",
  "Desmond Dekker & The Aces – Israelites":"mxtfdH3-TQ4",
  "The Wailing Wailers – Simmer Down":"7xo-BCAjMiM",
  "The Maytals – 54-46 (That's My Number)":"joxAQs2DHNU"
};

function youtubeIdFromUrl(raw){
  try{
    const u=new URL(raw,location.href);
    if(u.hostname.includes("youtu.be")) return u.pathname.replace(/^\//,"").split("/")[0]||null;
    if(u.hostname.includes("youtube.com") && u.pathname==="/watch") return u.searchParams.get("v");
    if(u.hostname.includes("youtube.com") && u.pathname.startsWith("/embed/")) return u.pathname.split("/embed/")[1]?.split("/")[0]||null;
  }catch(_){}
  return null;
}

function ensureInlinePlayer(anchor){
  const section=anchor.closest(".listen-box") || anchor.closest(".listen-card") || anchor.parentElement;
  let host=section?.querySelector(".inline-youtube-player");
  if(!host && section){
    host=document.createElement("div");
    host.className="inline-youtube-player";
    section.appendChild(host);
  }
  return host;
}

function playInlineYouTube(trigger,id,title){
  const host=trigger.closest(".listen-card")?.querySelector("#firstListenPlayer") || ensureInlinePlayer(trigger);
  if(!host||!id)return;
  host.hidden=false;
  host.innerHTML=`
    <div class="inline-youtube-head">
      <strong>${title}</strong>
      <button class="inline-youtube-close" type="button" aria-label="プレイヤーを閉じる">×</button>
    </div>
    <iframe
      src="https://www.youtube-nocookie.com/embed/${encodeURIComponent(id)}?autoplay=1&playsinline=1"
      title="${title}"
      loading="lazy"
      allow="autoplay; encrypted-media; picture-in-picture"
      allowfullscreen
      referrerpolicy="strict-origin-when-cross-origin"></iframe>
  `;
  host.querySelector(".inline-youtube-close")?.addEventListener("click",()=>{
    host.innerHTML="";
    host.hidden=true;
  });
  host.scrollIntoView({behavior:"smooth",block:"nearest"});
}

document.querySelectorAll(".inline-listen").forEach(btn=>{
  btn.addEventListener("click",()=>{
    const id=btn.dataset.video;
    const title=btn.dataset.title||"YouTube";
    playInlineYouTube(btn,id,title);
    document.querySelectorAll(".inline-listen").forEach(b=>b.classList.toggle("active",b===btn));
  });
});

// All listening links stay inside the site. Direct YouTube watch URLs are embedded.
// Legacy search links never launch the YouTube app; they are replaced as representative IDs are curated.
document.querySelectorAll(".youtube-links a[href*='youtube.com'], .youtube-links a[href*='youtu.be']").forEach(a=>{
  a.removeAttribute("target");
  a.removeAttribute("rel");
  const initialLabel=a.textContent.replace(/\s*↗\s*$/,"").trim();
  const initialId=a.dataset.video || youtubeIdFromUrl(a.href) || YT_KNOWN[initialLabel] || null;
  a.textContent=initialLabel;
  if(!initialId){ a.hidden=true; return; }
  a.addEventListener("click",e=>{
    e.preventDefault();
    const cleanLabel=a.textContent.replace(/\s*↗\s*$/,"").trim();
    const id=a.dataset.video || youtubeIdFromUrl(a.href) || YT_KNOWN[cleanLabel] || null;
    a.textContent=cleanLabel;
    if(id){
      playInlineYouTube(a,id,cleanLabel);
      return;
    }
  });
});
