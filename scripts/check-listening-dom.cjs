// npm install --no-save --package-lock=false linkedom
// NODE_PATH can point to a separate installation. This tests our controls, not YouTube playback.
const fs=require('fs'),path=require('path'),vm=require('vm'),assert=require('assert');
const {parseHTML}=require('linkedom');
const root=path.resolve(__dirname,'..');
const app=fs.readFileSync(path.join(root,'app.js'),'utf8');
const rows=[],errors=[];
for(const folder of ['articles','artists','genres','labels','people','studios']){
 for(const name of fs.readdirSync(path.join(root,folder)).filter(n=>n.endsWith('.html'))){
  const file=folder+'/'+name,html=fs.readFileSync(path.join(root,file),'utf8');
  const {window}=parseHTML(html),document=window.document;
  window.HTMLElement.prototype.scrollIntoView=function(){};
  const context={window,document,NodeFilter:{SHOW_TEXT:4},URL,console,location:{pathname:'/DoYouKnowSkaMusic/'+file,href:'https://corecycletune.github.io/DoYouKnowSkaMusic/'+file}};
  try{
   vm.runInNewContext(app,context);
   const controls=[...document.querySelectorAll('main .listen-track:not([hidden])')];
   const ids=controls.map(e=>e.dataset.video);
   assert.equal(new Set(ids).size,ids.length,'duplicate video controls');
   for(const el of controls){
    assert(/^[\w-]{11}$/.test(el.dataset.video),'invalid video ID');
    assert(el.closest('.listen-row'),'not in separated row');
    el.dispatchEvent(new window.Event('click',{bubbles:true,cancelable:true}));
    const host=el.closest('.listen-box,.listen-card')?.querySelector('.inline-youtube-player')||el.closest('.listen-row').nextElementSibling;
    assert(host?.querySelector('iframe')?.getAttribute('src').includes('/'+el.dataset.video+'?'),'player did not open');
    host.querySelector('button').dispatchEvent(new window.Event('click'));
    assert(!host.querySelector('iframe'),'player did not close');
   }
   const broken=[];
   for(const a of document.querySelectorAll('main a[href]')){
    const href=a.getAttribute('href');
    if(/^(https?:|mailto:|tel:)/.test(href))continue;
    const [target,fragment]=href.split('#');
    let local=target.startsWith('/DoYouKnowSkaMusic/')?path.join(root,target.slice(17)):path.resolve(root,folder,target||name);
    if(local.endsWith(path.sep))local+='index.html';
    if(!fs.existsSync(local)){broken.push(href);continue;}
    if(fragment&&local.endsWith('.html')){const d=parseHTML(fs.readFileSync(local,'utf8')).document;if(!d.getElementById(decodeURIComponent(fragment)))broken.push(href);}
   }
   assert(!broken.length,'broken internal links: '+broken.join(', '));
   rows.push({file,controls:ids.length,ids,internalLinks:document.querySelectorAll('main a[href]').length,playback:'unverified'});
  }catch(e){errors.push({file,error:e.message});}
 }
}
console.log(JSON.stringify({pages:rows.length,zero:rows.filter(x=>!x.controls).map(x=>x.file),errors},null,2));
if(process.argv.includes('--write'))fs.writeFileSync(path.join(root,'docs/listening-dom-audit.json'),JSON.stringify({checked:'2026-09-29',method:'linkedom: open/close controls, deduplication, internal targets. No real browser layout or YouTube playback verification.',rows,errors},null,2)+'\n');
if(errors.length)process.exitCode=1;
