import { chromium } from 'playwright';
import AxeBuilder from '@axe-core/playwright';
import assert from 'node:assert/strict';
import { mkdir,writeFile } from 'node:fs/promises';
const browser=await chromium.launch({channel:'chrome',headless:true});
const context=await browser.newContext({viewport:{width:1440,height:1150}});
const page=await context.newPage();
const errors=[];page.on('pageerror',e=>errors.push(e.message));
await mkdir('test-results',{recursive:true});
try {
  await page.goto('http://127.0.0.1:5173');
  await page.screenshot({path:'test-results/studio-before.png',fullPage:true});
  for (const [index,expected] of [[0,[24,42,35,68,83,61]],[1,[120,185,145,230,195]],[2,[18,26,22,32,29,15,24]]]) {
    if(index){await page.click('#sample-menu');await page.click(`[data-sample="${index}"]`);}
    await page.click('#analyze');
    await page.waitForFunction(()=>!document.querySelector('#analyze').disabled,{},{timeout:90000});
    const error=await page.locator('#error').textContent();
    const status=await page.locator('#output-status').textContent();
    assert.equal(status,'READY TO EXPLORE',`Sample ${index}: ${error}`);
    await page.click('[data-mode="table"]');
    const values=await page.locator('[data-value]').evaluateAll(nodes=>nodes.map(n=>Number(n.value)));
    const labels=await page.locator('[data-label]').evaluateAll(nodes=>nodes.map(n=>n.value));
    console.log(JSON.stringify({sample:index,values,labels,status:await page.locator('#pipeline-status').textContent(),error}));
    assert.equal(values.length,expected.length);
    values.forEach((v,i)=>assert.ok(Math.abs(v-expected[i])<1,`Sample ${index} value ${i}: ${v} != ${expected[i]}`));
    const tableAxe=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze();
    await writeFile(`test-results/axe-table-${index}.json`,JSON.stringify(tableAxe.violations,null,2));
    assert.deepEqual(tableAxe.violations.map(v=>({id:v.id,targets:v.nodes.map(n=>n.target)})),[],`Table accessibility sample ${index}`);
    await page.click('[data-mode="chart"]');
    await page.screenshot({path:`test-results/sample-${index}.png`,fullPage:true});
    if(index===0){
      await page.locator('[data-bar="0"]').focus();await page.keyboard.press('ArrowRight');
      assert.equal(await page.locator('[data-bar="1"]').getAttribute('tabindex'),'0');
      await page.click('#listen');assert.match(await page.locator('#listen').textContent(),/Stop/);await page.click('#listen');
      await page.click('[data-mode="table"]');await page.locator('[data-value="0"]').fill('31');await page.locator('[data-value="0"]').press('Tab');
      assert.equal(await page.locator('[data-value="0"]').inputValue(),'31');
      const downloadPromise=page.waitForEvent('download');await page.click('[data-export="csv"]');const download=await downloadPromise;await download.saveAs('test-results/export.csv');
      await page.click('[data-mode="chart"]');
      const axe=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze();
      await writeFile('test-results/axe-desktop.json',JSON.stringify(axe.violations,null,2));
      assert.deepEqual(axe.violations.map(v=>({id:v.id,targets:v.nodes.map(n=>n.target)})),[],'Chart accessibility');
      await page.setViewportSize({width:390,height:844});await page.screenshot({path:'test-results/mobile.png',fullPage:true});
      assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,'Mobile overflow');
      await page.setViewportSize({width:1440,height:1150});
    }
  }
  await page.click('[data-view="guide"]');assert.equal(await page.locator('#guide').isVisible(),true);await page.locator('#guide [data-back]').click();
  assert.deepEqual(errors,[]);console.log('Browser journeys passed.');
} finally {await browser.close();}
