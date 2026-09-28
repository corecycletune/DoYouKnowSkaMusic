const SITE_BASE="/DoYouKnowSkaMusic/";
(function injectSitebar(){
  if(document.querySelector(".sitebar")) return;
  const bar=document.createElement("header");
  bar.className="sitebar";
  bar.innerHTML=`
    <div class="sitebar-inner">
      <a class="site-logo" href="${SITE_BASE}" aria-label="Do you know ska music? HOME"><img src="${SITE_BASE}assets/ska-logo.jpg" alt="Do you know SKA music?"></a>
      <nav class="sitebar-nav" aria-label="サイトナビ">
        <a href="${SITE_BASE}">HOME</a>
        <a href="${SITE_BASE}#timeline">TIMELINE</a>
        <a href="${SITE_BASE}genres/ska.html">GENRES</a>
        <a href="${SITE_BASE}genres/japan-ska.html">JAPAN</a>
        <a href="${SITE_BASE}#listen">LISTEN</a>
      </nav>
    </div>
  `;
  const masthead=document.querySelector(".masthead");
  const checker=document.body.querySelector(":scope > .checker");
  if(masthead) masthead.before(bar);
  else if(checker) checker.insertAdjacentElement("afterend",bar);
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
      <div class="year">${item.year%10===0?`${item.year}s`:item.year}</div>
      <div class="timeline-card">
        <div class="meta">${item.tags.map(t=>`<span class="tag ${t}">${t.toUpperCase()}</span>`).join("")}</div>
        <h3>${item.title}</h3><p>${item.text}</p>
        ${item.article?`<a class="timeline-read" href="${item.article}">${item.second?"日本のSKAを読む":"詳しく読む"} →</a>`:""}
        ${item.second?`<a class="timeline-read" href="${item.second}">日本のDubを読む →</a>`:""}
      </div>
    </article>`).join("");
}

// Give crowded late-1970s to early-1990s years more room than quiet decades.
const timeStops=[[1950,100],[1960,250],[1970,500],[1980,750],[1990,1130],[2000,1360],[2010,1540],[2020,1720],[2026,1830]];
function mapY(year){
  for(let i=1;i<timeStops.length;i++){
    const [endYear,endY]=timeStops[i];
    if(year<=endYear){const [startYear,startY]=timeStops[i-1];return startY+(year-startYear)*(endY-startY)/(endYear-startYear);}
  }
  return timeStops.at(-1)[1];
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
      <text x="760" y="28" text-anchor="middle">SKA FAMILY</text>
      <text x="970" y="28" text-anchor="middle">UK / WORLD</text>
    </g>`;
  const grid=years.map(y=>`
    <g class="lineage-year"><text x="8" y="${mapY(y)+4}">${y}</text>
    <line x1="56" y1="${mapY(y)}" x2="${MAP_W-12}" y2="${mapY(y)}"></line></g>`).join("");
  const groups=(lineage.groups||[]).map(group=>{
    const top=mapY(group.start)-28;
    const bottom=mapY(group.end)+28;
    const source=byId[group.source];
    const sourceY=source?mapY(source.year)+17:top-30;
    const inlet=source?`<path class="lineage-group-inlet" d="M ${source.x} ${sourceY} C ${source.x} ${sourceY+18}, ${group.x+group.width/2} ${top-18}, ${group.x+group.width/2} ${top}"></path>`:"";
    return `<g class="lineage-group${group.nested?" nested":""}" data-group="${group.id}"><rect x="${group.x}" y="${top}" width="${group.width}" height="${bottom-top}" rx="8"></rect><text x="${group.x+14}" y="${top+20}">${group.label}</text>${inlet}</g>`;
  }).join("");
  const edges=lineage.edges.map(edge=>{
    const a=byId[edge.from],b=byId[edge.to];
    return `<path class="lineage-edge ${edge.type}${edge.detail?" detail-only":""}" data-from="${edge.from}" data-to="${edge.to}" data-detail="${edge.detail?"1":"0"}" d="${curvePath(a,b)}" marker-end="url(#arrow-${edge.type})"></path>`;
  }).join("");
  const nodes=lineage.nodes.map(n=>{
    const y=mapY(n.year);
    const w=Math.max(86,Math.min(156,n.label.length*8.2+28));
    return `
      <g class="lineage-node${n.detail?" detail-only":""}${n.kind?` ${n.kind}`:""}" data-id="${n.id}" data-tags="${n.tags.join(" ")}" data-detail="${n.detail?"1":"0"}" tabindex="0" role="button" aria-label="${n.label}">
        <rect x="${n.x-w/2}" y="${y-17}" width="${w}" height="34" rx="3"></rect>
        <text x="${n.x}" y="${y+4}" text-anchor="middle">${n.label}</text>
      </g>`;
  }).join("");
  svg.innerHTML=`
    <defs>
      <marker id="arrow-main" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse"><path d="M0 0 L10 5 L0 10 z"></path></marker>
      <marker id="arrow-branch" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse"><path d="M0 0 L10 5 L0 10 z"></path></marker>
      <marker id="arrow-ska" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse"><path d="M0 0 L10 5 L0 10 z"></path></marker>
    </defs>${laneLabels}${grid}${groups}${edges}${nodes}`;
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
  const regionalNote=document.querySelector("#lineageRegionalNote");
  const shell=document.querySelector(".lineage-shell");
  const legend=document.querySelector(".lineage-legend");
  if(regionalNote)regionalNote.hidden=filter!=="japan";
  if(shell)shell.hidden=filter==="japan";
  if(legend)legend.hidden=filter==="japan";
  const shown=new Set();
  document.querySelectorAll(".lineage-node").forEach(el=>{
    const tags=(el.dataset.tags||"").split(" ");
    const isDetail=el.dataset.detail==="1";
    let show;
    if(filter==="all") show=!isDetail;
    else if(filter==="ska") show=tags.includes("ska");
    else if(filter==="world") show=!isDetail&&(tags.includes("world")||el.dataset.id==="reggae"||el.dataset.id==="ska");
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
  "Prince Buster – One Step Beyond":"2xcGVm06jl4",
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
  const section=anchor.closest(".listen-box, .listen-card");
  const block=anchor.closest("p, li, h2, h3, h4") || anchor.parentElement;
  let host=section?.querySelector(".inline-youtube-player") ||
    (block?.nextElementSibling?.classList.contains("inline-youtube-player")?block.nextElementSibling:null);
  if(!host && block){
    host=document.createElement("div");
    host.className="inline-youtube-player";
    if(section) section.appendChild(host);
    else block.after(host);
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

// Track names in the articles open the specific recording at the point of mention.
// Only use IDs whose artist and title have been checked; no search-result buttons.
const TRACK_VIDEOS={
  "Guns of Navarone":["DTol7Wm_NiQ","The Skatalites – Guns of Navarone"],
  "One Step Beyond":["2xcGVm06jl4","Prince Buster – One Step Beyond"],
  "Simmer Down":["7xo-BCAjMiM","The Wailing Wailers – Simmer Down"],
  "Israelites":["mxtfdH3-TQ4","Desmond Dekker – Israelites"],
  "54-46 That’s My Number":["joxAQs2DHNU","The Maytals – 54-46 That’s My Number"],
  "54-46 (That’s My Number)":["joxAQs2DHNU","The Maytals – 54-46 That’s My Number"],
  "007 (Shanty Town)":["jpwH2Y58TeI","Desmond Dekker – 007 (Shanty Town)"],
  "Ghost Town":["RZ2oXzrnti4","The Specials – Ghost Town"],
  "Gangsters":["Sn4ntpOXE6w","The Specials – Gangsters"],
  "Al Capone":["0pcwhAxMSLI","Prince Buster – Al Capone"],
  "A Message to You Rudy":["cntvEDbagAw","The Specials – A Message to You Rudy"],
  "The Prince":["9_y7gC4T58g","Madness – The Prince"],
  "Monkey Man":["DCpmJHFMNRI","The Specials – Monkey Man"],
  "On My Radio":["074AfC9tw48","The Selecter – On My Radio (1979 TV performance)"],
  "Too Much Pressure":["MJ7ifuDVHl0","The Selecter – Too Much Pressure"],
  "Mirror in the Bathroom":["O3PwyGIZxX8","The Beat – Mirror in the Bathroom"],
  "Our House":["KwIe_sjKeAY","Madness – Our House"],
  "Baggy Trousers":["Dc3AovUZgvo","Madness – Baggy Trousers"],
  "The Tide Is High":["SQXqkiKXiHc","The Paragons – The Tide Is High"],
  "Train to Skaville":["L5fJQ9DYL0k","The Ethiopians – Train to Skaville"],
  "King Tubby Meets Rockers Uptown":["ztq7-kkygZk","Augustus Pablo / King Tubby – King Tubby Meets Rockers Uptown"],
  "Under Mi Sleng Teng":["vn6CP_1xQcE","Wayne Smith – Under Mi Sleng Teng"],
  "Do the Reggay":["9eM3UlP4VNw","Toots & The Maytals – Do the Reggay"],
  "The Impression That I Get":["NIGMUAMevH0","The Mighty Mighty Bosstones – The Impression That I Get"],
  "Time Bomb":["DhKHAopx7D0","Rancid – Time Bomb"],
  "2-Tone Army":["lC6UF2Fn65A","The Toasters – 2-Tone Army"],
  "Party Time":["aMVZvjnEOXA","The Heptones – Party Time"],
  "Rivers of Babylon":["BXf1j8Hz2bU","The Melodians – Rivers of Babylon"],
  "Everything I Own":["JZHTg26q1Js","Ken Boothe – Everything I Own"],
  "Girl I’ve Got a Date":["UMd8XVEaKO4","Alton Ellis – Girl I’ve Got a Date"],
  "Take It Easy":["7pnuW8V8obc","Hopeton Lewis – Take It Easy"],
  "You Don’t Care":["jMauMXfV2A8","The Techniques – You Don’t Care"],
  "Swing and Dine":["pyy3oXnLckk","The Melodians – Swing and Dine"],
  "Little Nut Tree":["U3Hxb0ktgyQ","The Melodians – Little Nut Tree"],
  "Only a Smile":["pVA4acOeN84","The Paragons – Only a Smile"],
  "One Life to Live":["h4WXJu6sjEg","Phyllis Dillon – One Life to Live"],
  "Dance Crasher":["-Ctg1FK0sYE","Alton Ellis – Dance Crasher"],
  "Boogie in My Bones":["y067sauu7qk","Laurel Aitken – Boogie in My Bones"],
  "Pretty Looks Isn’t All":["tAHYMYBA2hY","The Heptones – Pretty Looks Isn’t All"],
  "Long Shot Kick De Bucket":["ZivevzNnZyw","The Pioneers – Long Shot Kick De Bucket"],
  "Too Hot":["XkGigEMADIc","The Specials – Too Hot"],
  "Don’t Stay Away":["YkzhkLdweao","Phyllis Dillon – Don’t Stay Away"],
  "Hold Them":["IC8R1r_FMjA","Roy Shirley – Hold Them"],
  "Silly Games":["HTp2iX6Mq7U","Janet Kay – Silly Games"],
  "LONG SEASON":["GwWv-T4rM0k","Fishmans – LONG SEASON"],
  "Little Fluffy Clouds":["2Ng9Pf_p7Fw","The Orb – Little Fluffy Clouds"],
  "Nanny Goat":["rN7_0S-7tiE","Larry Marshall – Nanny Goat"],
  "People Funny Boy":["nscYSjuAQYM","Lee Perry – People Funny Boy"],
  "Tougher Than Tough":["LU2Bt9cB6KY","Derrick Morgan – Tougher Than Tough"],
  "Tears of a Clown":["ohpAuziamMU","The Beat – Tears of a Clown"],
  "I’m Still in Love":["WQSbDBKV_GM","Alton Ellis – I’m Still in Love"],
  "The Selecter":["oeira_3fvvo","The Selecter – The Selecter"],
  "Enjoy Yourself":["roE5l5aVWs8","The Specials – Enjoy Yourself"],
  "Hands Off… She’s Mine":["CwhdNK1pWS0","The Beat – Hands Off... She's Mine"],
  "Bangarang":["nw1ECvnqlu8","Lester Sterling & Stranger Cole – Bangarang"],
  "007":["jpwH2Y58TeI","Desmond Dekker – 007 (Shanty Town)"],
  "54-46":["joxAQs2DHNU","The Maytals – 54-46 That’s My Number"],
  "Everything Crash":["IxF1pz3VrfE","The Ethiopians – Everything Crash"],
  "No More Heartaches":["8_E1biKrlw4","The Beltones – No More Heartaches"],
  "Money in My Pocket":["Ultwo-qSbfQ","Dennis Brown – Money in My Pocket"],
  "Uptown Top Ranking":["VE-A5JULvRM","Althea & Donna – Uptown Top Ranking"],
  "Return of Django":["ax5phXqMjCU","The Upsetters – Return of Django"],
  "Freedom Sounds":["w_seT2fHOI8","The Skatalites – Freedom Sounds"],
  "Eastern Standard Time":["tRTmnJ-_UnU","The Skatalites – Eastern Standard Time"],
  "Man in the Street":["Ll_5suXU_pg","The Skatalites – Man in the Street"],
  "ナイトクルージング":["ZD29iWW94yg","Fishmans – ナイトクルージング"],
  "People’s Rocksteady":["VHwU9XejwCY","The Uniques – People Rocksteady"],
  "Perfidia":["ZnXIM3yPhw4","Phyllis Dillon – Perfidia"],
  "My Conversation":["cUyJ965eHok","The Uniques – My Conversation"],
  "Baby I Love You So":["Iu5hllp7Vgo","Jacob Miller – Baby I Love You So"],
  "I’m Just a Guy":["ASLbLIb1pH8","Alton Ellis – I’m Just a Guy"]
};

function inlineTracks(){
  const main=document.querySelector("main");
  if(!main)return;
  const walker=document.createTreeWalker(main,NodeFilter.SHOW_TEXT);
  const nodes=[];
  while(walker.nextNode()){
    const n=walker.currentNode, el=n.parentElement;
    if(!el?.closest("p, li, h2, h3, h4"))continue;
    if(el.closest("a, button, .source-box, .related-links, .youtube-links, .first-listen-links"))continue;
    if(el.closest("p, li")?.querySelector(".track-inline"))continue;
    if(/[“「『]/.test(n.textContent))nodes.push(n);
  }
  for(const node of nodes){
    const source=node.textContent;
    const re=/[“「『]([^”」』]{2,70})[”」』]/g;
    let m,last=0,fragment=document.createDocumentFragment(),changed=false;
    while((m=re.exec(source))){
      const name=m[1].trim();
      const surrounding=node.parentElement.closest("p, li")?.textContent||"";
      let video=TRACK_VIDEOS[name];
      if(name==="One Step Beyond" && location.pathname.endsWith("/artists/madness.html"))
        video=["SOJSM46nWwo","Madness – One Step Beyond"];
      if(name==="A Message to You Rudy" && surrounding.includes("Dandy Livingstone"))
        video=["OXXOaecD52k","Dandy Livingstone – Rudy, A Message to You"];
      if(name==="Monkey Man" && surrounding.includes("The Maytals"))
        video=["WNRs3PTlGOU","The Maytals – Monkey Man"];
      if(!video)continue;
      fragment.append(document.createTextNode(source.slice(last,re.lastIndex)));
      const button=document.createElement("button");
      button.type="button";
      button.className="inline-listen track-inline";
      button.dataset.video=video[0];
      button.dataset.title=video[1];
      button.textContent="▶ 試聴";
      button.setAttribute("aria-label",`${video[1]}をサイト内で試聴`);
      fragment.append(button);
      last=re.lastIndex;
      changed=true;
    }
    if(changed){fragment.append(document.createTextNode(source.slice(last)));node.replaceWith(fragment);}
  }
}
inlineTracks();

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
