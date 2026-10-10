import { createWorker, PSM } from 'tesseract.js';
let workerPromise, listener=()=>{};
export async function readWords(canvas,bars,background,onProgress) {
  listener=onProgress;
  if(!workerPromise) workerPromise=createWorker('eng',1,{
    workerPath:'/ocr/worker.min.js',corePath:'/ocr/core',langPath:'/ocr/lang',
    logger:m=>listener(m.status,m.progress||0),
  }).catch(e=>{workerPromise=null;throw e;});
  const worker=await workerPromise;
  await worker.setParameters({tessedit_pageseg_mode:PSM.SPARSE_TEXT,user_defined_dpi:'150'});
  const clean=document.createElement('canvas');clean.width=canvas.width;clean.height=canvas.height;
  const ctx=clean.getContext('2d');ctx.drawImage(canvas,0,0);ctx.fillStyle=`rgb(${background.join(',')})`;
  for(const b of bars) ctx.fillRect(b.x-1,b.y-1,b.w+2,b.h+2);
  const {data}=await worker.recognize(clean,{}, {blocks:true,text:true});
  const words=[];
  for(const block of data.blocks||[]) for(const paragraph of block.paragraphs||[]) for(const line of paragraph.lines||[]) for(const word of line.words||[]) if(word.text.trim()) words.push(word);
  return {words,text:data.text};
}
