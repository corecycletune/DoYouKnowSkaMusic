const data = (window.SKA_TIMELINE || []).slice().sort((a,b)=>a.year-b.year);
const list = document.querySelector("#timelineList");

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
render();

document.querySelectorAll("[data-filter]").forEach(btn=>{
  btn.addEventListener("click",()=>{
    document.querySelectorAll("[data-filter]").forEach(b=>b.classList.remove("active"));
    btn.classList.add("active");
    render(btn.dataset.filter);
  });
});
document.querySelectorAll("[data-jump]").forEach(btn=>{
  btn.addEventListener("click",()=>document.getElementById(btn.dataset.jump)?.scrollIntoView({behavior:"smooth"}));
});