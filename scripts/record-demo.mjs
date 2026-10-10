import {chromium} from 'playwright';
import {readFile,writeFile} from 'node:fs/promises';
import path from 'node:path';
const out=path.resolve('../banana-sona-submission'),cues=JSON.parse(await readFile(path.join(out,'cues.json'),'utf8'));
const browser=await chromium.launch({channel:'chrome',headless:true});
const context=await browser.newContext({viewport:{width:1440,height:1050},recordVideo:{dir:out,size:{width:1440,height:1050}}});
const started=Date.now(),page=await context.newPage(),video=page.video(),timings=[];
await page.goto('http://127.0.0.1:5173');await page.evaluate(()=>document.fonts.ready);
for(const cue of cues){
 const t=Date.now();timings.push({...cue,start:(t-started)/1000});
 await page.evaluate(title=>{document.querySelector('#demo-caption')?.remove();const e=document.createElement('div');e.id='demo-caption';e.textContent=title;Object.assign(e.style,{position:'fixed',bottom:'0',left:'0',right:'0',background:'#211a31f5',color:'white',padding:'18px',font:'600 18px system-ui',textAlign:'center',zIndex:'1000',borderTop:'1px solid #84719d'});document.body.append(e);},cue.title);
 if(cue.name==='analyze'){
   await page.click('#analyze');await page.waitForFunction(()=>document.querySelector('#output-status').textContent==='READY TO EXPLORE');
   for(const n of [1,3,4]){await page.waitForTimeout(1300);await page.locator(`[data-bar="${n}"]`).focus();await page.keyboard.press('Enter');}
 }else if(cue.name==='listen'){
   await page.locator('#listen').scrollIntoViewIfNeeded();await page.waitForTimeout(cue.speechDuration*1000+600);await page.click('#listen');
 }else if(cue.name==='axis'){
   await page.click('#sample-menu');await page.click('[data-sample="2"]');await page.click('#analyze');await page.waitForFunction(()=>document.querySelector('#output-status').textContent==='READY TO EXPLORE');await page.waitForTimeout(4000);await page.click('[data-mode="table"]');
 }else if(cue.name==='review'){
   await page.locator('[data-value="0"]').fill('18');await page.locator('[data-value="0"]').press('Tab');await page.waitForTimeout(3500);await page.click('[data-mode="chart"]');
   const dl=page.waitForEvent('download');await page.click('[data-export="html"]');const download=await dl;await download.saveAs(path.join(out,'accessible-report.html'));await page.waitForTimeout(2500);await page.goto('file://'+path.join(out,'accessible-report.html'));
 }else if(cue.name==='close'){
   await page.goto('http://127.0.0.1:5173');await page.click('#analyze');await page.waitForFunction(()=>document.querySelector('#output-status').textContent==='READY TO EXPLORE');await page.click('[data-view="project"]');await page.waitForTimeout(7000);await page.click('[data-view="studio"]');await page.locator('[data-bar="4"]').click();
 }
 await page.waitForTimeout(Math.max(1200,cue.duration*1000+1200-(Date.now()-t)));
 console.log(`Recorded: ${cue.name}`);
}
await writeFile(path.join(out,'timeline.json'),JSON.stringify(timings,null,2));await context.close();await video.saveAs(path.join(out,'screen.webm'));await browser.close();console.log('Walkthrough recording saved.');
