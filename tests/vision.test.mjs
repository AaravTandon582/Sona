import {test} from 'node:test';
import assert from 'node:assert/strict';
import {detectBars,reconstruct,parseNumber,toSVG,toCSV} from '../src/vision.js';
function raster(bars,w=600,h=400,bg=[255,255,255]) {const data=new Uint8ClampedArray(w*h*4);for(let i=0;i<w*h;i++)data.set([...bg,255],i*4);for(const b of bars)for(let y=b.y;y<b.y+b.h;y++)for(let x=b.x;x<b.x+b.w;x++)data.set([90,70,180,255],(y*w+x)*4);return{data,width:w,height:h};}
const bars=[{x:100,y:210,w:60,h:120},{x:220,y:130,w:60,h:200},{x:340,y:70,w:60,h:260}];
const word=(text,x,y,w=30)=>({text,confidence:95,bbox:{x0:x,y0:y,x1:x+w,y1:y+16}});
test('Recovers vertical bars and rejects small visual noise',()=>{const r=detectBars(raster([...bars,{x:20,y:20,w:10,h:10}]));assert.equal(r.orientation,'vertical');assert.equal(r.bars.length,3);assert.equal(r.bars[1].h,200);});
test('Recovers horizontal baseline',()=>{const r=detectBars(raster([{x:120,y:60,w:130,h:40},{x:120,y:145,w:260,h:40},{x:120,y:230,w:320,h:40}]));assert.equal(r.orientation,'horizontal');assert.equal(r.bars.length,3);});
test('Rejects blank images',()=>assert.throws(()=>detectBars(raster([])),/No clear/));
test('Binds visible numbers and labels spatially',()=>{const result=reconstruct({bars,orientation:'vertical',width:600,height:400},[word('30',115,185),word('50',235,105),word('65',355,45),word('Apr',115,343),word('May',235,343),word('Jun',355,343)]);assert.deepEqual(result.data.map(d=>d.value),[30,50,65]);assert.equal(result.data[1].label,'May');assert.equal(result.relative,false);});
test('Fits axis calibration when labels are absent',()=>{const result=reconstruct({bars,orientation:'vertical',width:600,height:400},[word('0',55,322),word('50',55,122),word('25',55,222)]);assert.deepEqual(result.data.map(d=>d.value),[30,50,65]);assert.ok(result.data.every(d=>d.method==='axis estimate'));});
test('Never mixes original values and normalized values',()=>{const result=reconstruct({bars,orientation:'vertical',width:600,height:400},[word('50',235,105)]);assert.equal(result.relative,true);assert.ok(result.data.every(d=>d.method==='relative size'));assert.equal(result.data[2].value,100);});
test('Parses numeric units and rejects prose',()=>{assert.equal(parseNumber('1,240'),1240);assert.equal(parseNumber('2.5k'),2500);assert.equal(parseNumber('9%'),9);assert.equal(parseNumber('2026 report'),null);});
test('Nearest label row excludes footnotes',()=>{const result=reconstruct({bars,orientation:'vertical',width:600,height:400},[word('Apr',115,343),word('Source',115,370)]);assert.equal(result.data[0].label,'Apr');});
test('Negative values fail explicitly',()=>assert.throws(()=>reconstruct({bars,orientation:'vertical',width:600,height:400},[word('-25',115,185)]),/Negative values/));
test('Escapes executable content in exports and shields CSV formulas',()=>{const result={title:'<script>alert(1)</script>',relative:false,data:[{label:'=1+1',value:3,method:'printed value'},{label:'<img onerror=alert(1)>',value:2,method:'printed value'}]};assert.ok(!toSVG(result).includes('<script>'));assert.ok(toCSV(result).includes("'=1+1"));assert.ok(toSVG(result).includes('&lt;img'));});
