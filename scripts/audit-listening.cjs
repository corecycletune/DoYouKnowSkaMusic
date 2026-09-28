// Run with NODE_PATH pointing to an installation of Playwright.
// This audits rendered controls, NOT YouTube availability or editorial accuracy.
const {chromium}=require('playwright');
const fs=require('node:fs');
const path=require('node:path');
const {pathToFileURL}=require('node:url');
const root=path.resolve(__dirname,'..');
(async()=>{
  const browser=await chromium.launch({headless:true});
  const page=await browser.newPage({viewport:{width:390,height:844}});
  await page.route(/^https?:/,route=>route.abort());
  const files=['index.html',...['articles','artists','genres','labels','people','studios'].flatMap(dir=>fs.readdirSync(path.join(root,dir)).filter(f=>f.endsWith('.html')).map(f=>`${dir}/${f}`))];
  const rows=[];
  for(const file of files){
    const errors=[];
    const onError=e=>errors.push(e.message);
    page.on('pageerror',onError);
    await page.goto(pathToFileURL(path.join(root,file)).href);
    const result=await page.evaluate(()=>{
      const main=document.querySelector('main');
      const controls=[...main.querySelectorAll('.listen-track')].filter(el=>!el.hidden);
      const ids=controls.map(el=>el.dataset.video);
      return {title:document.querySelector('h1')?.textContent.trim(),characters:main.innerText.length,tracks:ids.length,duplicates:ids.length-new Set(ids).size,internalLinks:main.querySelectorAll('a[href$=".html"]').length,overflow:document.documentElement.scrollWidth>innerWidth+1,recordings:controls.map(el=>({title:el.dataset.title,id:el.dataset.video,status:'playback-unverified'}))};
    });
    rows.push({file,...result,errors});
    page.off('pageerror',onError);
  }
  const summary={pages:rows.length,withoutMusic:rows.filter(r=>!r.tracks).map(r=>r.file),underThree:rows.filter(r=>/^(artists|genres)\//.test(r.file)&&r.tracks<3).map(r=>r.file),errors:rows.filter(r=>r.errors.length||r.duplicates)};
  console.log(JSON.stringify({summary,pages:rows},null,2));
  await browser.close();
  if(summary.errors.length)process.exitCode=1;
})();
