import {chromium} from 'playwright';
import AxeBuilder from '@axe-core/playwright';
import assert from 'node:assert/strict';
import {mkdir,writeFile,readFile} from 'node:fs/promises';
const browser=await chromium.launch({channel:'chrome',headless:true});
const context=await browser.newContext({viewport:{width:1280,height:960}}),page=await context.newPage();
const errors=[],remoteRequests=[];page.on('pageerror',e=>errors.push(e.message));page.on('request',r=>{if(!r.url().startsWith('http://127.0.0.1')&&!r.url().startsWith('blob:')&&!r.url().startsWith('data:'))remoteRequests.push(r.url());});
await mkdir('test-results',{recursive:true});
try {
 await page.goto('http://127.0.0.1:5173');
 // Render independent input fixtures, with values never passed to application code.
 const fixtures=[
  {name:'purple',values:[16,33,49,25],color:'#854cc3',width:1000,height:620},
  {name:'grayscale',values:[27,44,19,38],color:'#444444',width:900,height:580},
  {name:'relative',values:[15,30,45,60],color:'#186789',width:1050,height:650,noText:true},
 ];
 const observations=[];
 for(const fixture of fixtures){
   const png=await page.evaluate(f=>{const c=document.createElement('canvas');c.width=f.width;c.height=f.height;const ctx=c.getContext('2d');ctx.fillStyle='#fff';ctx.fillRect(0,0,c.width,c.height);ctx.fillStyle='#222';ctx.font='bold 30px Arial';ctx.fillText('Weekly workshop attendance',45,55);const base=c.height-100,max=60,step=(c.width-170)/4;for(let i=0;i<4;i++){const x=110+i*step,h=f.values[i]/max*(c.height-210);ctx.fillStyle=f.color;ctx.fillRect(x,base-h,step*.55,h);if(!f.noText){ctx.fillStyle='#222';ctx.textAlign='center';ctx.font='23px Arial';ctx.fillText(String(f.values[i]),x+step*.275,base-h-17);ctx.fillText(['East','West','North','South'][i],x+step*.275,base+35);}}return c.toDataURL().split(',')[1];},fixture);
   const path=`test-results/upload-${fixture.name}.png`;await writeFile(path,Buffer.from(png,'base64'));
   await page.locator('#file').setInputFiles(path);await page.click('#analyze');await page.waitForFunction(()=>!document.querySelector('#analyze').disabled,{},{timeout:90000});
   assert.equal(await page.locator('#output-status').textContent(),'READY TO EXPLORE');await page.click('[data-mode="table"]');
   const values=await page.locator('[data-value]').evaluateAll(ns=>ns.map(n=>Number(n.value)));
   const expected=fixture.noText?[25,50,75,100]:fixture.values;values.forEach((n,i)=>assert.ok(Math.abs(n-expected[i])<1,`${fixture.name}: ${values}`));assert.equal(values.length,4);
   if(fixture.noText){assert.match(await page.locator('#error').textContent(),/relative size/);}else assert.deepEqual(await page.locator('[data-label]').evaluateAll(ns=>ns.map(n=>n.value)),['East','West','North','South']);
   observations.push({fixture:fixture.name,expected,recovered:values});
 }
 await page.click('[data-export="html"]'); // Downloads do not navigate away.
 for(const format of ['svg','tactile','html']){const dl=page.waitForEvent('download');await page.click(`[data-export="${format}"]`);await (await dl).saveAs(`test-results/export-${format}.${format==='html'?'html':'svg'}`);}
 const report=await context.newPage();await report.goto('file://'+process.cwd()+'/test-results/export-html.html');assert.equal(await report.locator('tbody tr').count(),4);assert.match(await report.locator('svg desc').textContent(),/relative sizes/);await report.close();
 const blank=await page.evaluate(()=>{const c=document.createElement('canvas');c.width=700;c.height=500;const x=c.getContext('2d');x.fillStyle='white';x.fillRect(0,0,700,500);return c.toDataURL().split(',')[1];});
 await writeFile('test-results/blank.png',Buffer.from(blank,'base64'));await page.locator('#file').setInputFiles('test-results/blank.png');await page.click('#analyze');await page.waitForFunction(()=>!document.querySelector('#analyze').disabled);assert.match(await page.locator('#error').textContent(),/No clear/);assert.equal(await page.locator('#listen').isDisabled(),true);
 for(const view of ['guide','project']){await page.click(`[data-view="${view}"]`);const axe=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze();assert.deepEqual(axe.violations.map(v=>({id:v.id,targets:v.nodes.map(n=>n.target)})),[],`${view} accessibility`);}
 await page.click('[data-view="studio"]');await page.setViewportSize({width:390,height:844});const mobile=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze();assert.deepEqual(mobile.violations.map(v=>({id:v.id,targets:v.nodes.map(n=>n.target)})),[],'Mobile accessibility');
 await page.click('#sample-menu');const modal=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze();assert.deepEqual(modal.violations.map(v=>({id:v.id,targets:v.nodes.map(n=>n.target)})),[],'Sample dialog accessibility');await page.keyboard.press('Escape');assert.equal(await page.locator('#samples-dialog').isVisible(),false);
 assert.deepEqual(errors,[]);assert.deepEqual(remoteRequests,[],'All app assets and inference should stay on the same origin');await writeFile('test-results/upload-results.json',JSON.stringify(observations,null,2));console.log(JSON.stringify({observations,thirdPartyRequests:remoteRequests.length,errors}));console.log('Uploads, exports, error handling, and accessibility passed.');
}finally{await browser.close();}
