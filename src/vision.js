/** Original chart reconstruction pipeline. No sample metadata enters these functions. */
export function detectBars({ data, width, height }) {
  const n = width * height, mask = new Uint8Array(n), seen = new Uint8Array(n);
  const corner = [0, (width - 1) * 4, (n - width) * 4, (n - 1) * 4];
  const bg = [0, 1, 2].map(c => corner.map(i => data[i + c]).sort((a,b) => a-b)[2]);
  for (let i = 0; i < n; i++) {
    const p = i * 4, r = data[p], g = data[p+1], b = data[p+2];
    const distance = Math.hypot(r-bg[0], g-bg[1], b-bg[2]);
    if (data[p+3] > 180 && distance > 46) mask[i] = 1;
  }
  const stack = new Int32Array(n), components = [];
  for (let start = 0; start < n; start++) {
    if (!mask[start] || seen[start]) continue;
    let size = 0, minX = width, minY = height, maxX = 0, maxY = 0, top = 0;
    stack[top++] = start; seen[start] = 1;
    const sr = data[start*4], sg = data[start*4+1], sb = data[start*4+2];
    while (top) {
      const i = stack[--top], x = i % width, y = Math.floor(i/width);
      size++; minX=Math.min(minX,x); maxX=Math.max(maxX,x); minY=Math.min(minY,y); maxY=Math.max(maxY,y);
      const next = [x>0?i-1:-1,x<width-1?i+1:-1,y>0?i-width:-1,y<height-1?i+width:-1];
      for (const j of next) if (j>=0 && mask[j] && !seen[j]) {
        const p=j*4;
        if (Math.hypot(data[p]-sr,data[p+1]-sg,data[p+2]-sb)<65) {seen[j]=1; stack[top++]=j;}
      }
    }
    const w=maxX-minX+1,h=maxY-minY+1,fill=size/(w*h);
    if (w>=Math.max(8,width*.008) && h>=Math.max(8,height*.012) && size>n*.0007 && fill>.78 && w<width*.8 && h<height*.84) {
      components.push({x:minX,y:minY,w,h,fill,color:`rgb(${sr}, ${sg}, ${sb})`});
    }
  }
  function consensus(orientation) {
    const vertical=orientation==='vertical';
    let best=[];
    for(const seed of components) {
      const baseline=vertical?seed.y+seed.h:seed.x;
      const aligned=components.filter(c => Math.abs((vertical?c.y+c.h:c.x)-baseline)<Math.max(4,(vertical?height:width)*.012) && (vertical?c.w:c.h)>.45*(vertical?seed.w:seed.h) && (vertical?c.w:c.h)<2.2*(vertical?seed.w:seed.h));
      if(aligned.length>best.length || (aligned.length===best.length && aligned.reduce((s,c)=>s+c.w*c.h,0)>best.reduce((s,c)=>s+c.w*c.h,0))) best=aligned;
    }
    return best;
  }
  const vertical=consensus('vertical'),horizontal=consensus('horizontal');
  const orientation=horizontal.length>vertical.length?'horizontal':'vertical';
  let bars=(orientation==='vertical'?vertical:horizontal).sort((a,b)=>orientation==='vertical'?a.x-b.x:a.y-b.y);
  if(bars.length<2 || bars.length>30) throw new Error('No clear single-series bar chart found. Try a tightly cropped chart with solid bars on a plain background. Pie, line, stacked, and negative-value charts are not supported yet.');
  return {bars,orientation,width,height,background:bg};
}

export function parseNumber(text) {
  const clean=text.trim().replace(/[$€£,%]/g,'').replace(/,/g,'');
  const match=clean.match(/^(-?\d+(?:\.\d+)?)([kKmM])?$/);
  if(!match) return null;
  const number=Number(match[1])*(match[2]?.toLowerCase()==='k'?1000:match[2]?.toLowerCase()==='m'?1000000:1);
  return Number.isFinite(number)?number:null;
}

export function reconstruct(detection, words) {
  const {bars,orientation,width,height}=detection,vertical=orientation==='vertical';
  const numeric=words.map(w=>({...w,number:parseNumber(w.text)})).filter(w=>w.number!==null);
  if(numeric.some(w=>w.number<0)) throw new Error('Negative values were detected. This version supports nonnegative bar charts only.');
  const centerX=w=>(w.bbox.x0+w.bbox.x1)/2,centerY=w=>(w.bbox.y0+w.bbox.y1)/2;
  const baseline=vertical?Math.max(...bars.map(b=>b.y+b.h)):Math.min(...bars.map(b=>b.x));
  const minX=Math.min(...bars.map(b=>b.x)),maxY=Math.max(...bars.map(b=>b.y+b.h));
  const ticks=numeric.filter(w=>vertical?w.bbox.x1<minX-5 && centerY(w)>height*.12 && centerY(w)<baseline+20:w.bbox.y0>maxY+5 && centerX(w)>baseline-20);
  let scale=null;
  if(ticks.length>=2) {
    const pts=ticks.map(w=>({pixel:vertical?centerY(w):centerX(w),value:w.number}));
    const mx=pts.reduce((s,p)=>s+p.pixel,0)/pts.length,my=pts.reduce((s,p)=>s+p.value,0)/pts.length;
    const denom=pts.reduce((s,p)=>s+(p.pixel-mx)**2,0);
    const slope=denom?pts.reduce((s,p)=>s+(p.pixel-mx)*(p.value-my),0)/denom:0,intercept=my-slope*mx;
    const range=Math.max(...pts.map(p=>p.value))-Math.min(...pts.map(p=>p.value));
    const err=Math.max(...pts.map(p=>Math.abs(slope*p.pixel+intercept-p.value)));
    if(range>0 && err<range*.025 && (vertical?slope<0:slope>0)) scale={slope,intercept,error:err,tickCount:ticks.length};
  }
  const maxLength=Math.max(...bars.map(b=>vertical?b.h:b.w));
  const data=bars.map((b,i)=>{
    const cx=b.x+b.w/2,cy=b.y+b.h/2;
    const valueWords=numeric.filter(w=>vertical?Math.abs(centerX(w)-cx)<b.w*.65 && w.bbox.y1<=b.y+5 && b.y-w.bbox.y1<Math.max(48,height*.1):Math.abs(centerY(w)-cy)<b.h*.65 && w.bbox.x0>=b.x+b.w-3 && w.bbox.x0-(b.x+b.w)<width*.12);
    valueWords.sort((a,c)=>vertical?Math.abs(centerY(a)-b.y)-Math.abs(centerY(c)-b.y):Math.abs(centerX(a)-b.x-b.w)-Math.abs(centerX(c)-b.x-b.w));
    const direct=valueWords[0];
    let labelWords=words.filter(w=>vertical?centerY(w)>baseline+3 && centerY(w)<baseline+height*.13 && Math.abs(centerX(w)-cx)<Math.max(b.w*.9,width/(bars.length*2)):w.bbox.x1<b.x-4 && Math.abs(centerY(w)-cy)<b.h*.65);
    if(vertical && labelWords.length){const firstY=Math.min(...labelWords.map(w=>w.bbox.y0));labelWords=labelWords.filter(w=>Math.abs(w.bbox.y0-firstY)<Math.max(12,height*.018));}
    const label=labelWords.sort((a,c)=>a.bbox.y0-c.bbox.y0 || a.bbox.x0-c.bbox.x0).map(w=>w.text).join(' ').trim() || `Bar ${i+1}`;
    const inferred=scale?scale.slope*(vertical?b.y:b.x+b.w)+scale.intercept:100*(vertical?b.h:b.w)/maxLength;
    return {label,value:direct?.number??Math.round(inferred*10)/10,method:direct?'printed value':scale?'axis estimate':'relative size',ocrConfidence:direct?Math.round(direct.confidence):null,bbox:b,labelVerified:labelWords.length>0,originalValue:direct?.number??Math.round(inferred*10)/10};
  });
  // Never mix absolute values with normalized lengths in the same series.
  const relative=data.some(d=>d.method==='relative size');
  if(relative) data.forEach((d,i)=>{d.value=Math.round(100*(vertical?bars[i].h:bars[i].w)/maxLength*10)/10;d.originalValue=d.value;d.method='relative size';d.ocrConfidence=null;});
  const titleWords=words.filter(w=>w.bbox.y0<Math.min(...bars.map(b=>b.y))-height*.05 && w.bbox.y0<height*.15 && parseNumber(w.text)===null);
  const firstLine=titleWords.length?Math.min(...titleWords.map(w=>w.bbox.y0)):0;
  const title=titleWords.filter(w=>Math.abs(w.bbox.y0-firstLine)<20).sort((a,b)=>a.bbox.x0-b.bbox.x0).map(w=>w.text).join(' ') || 'Your recovered chart';
  return {title,data,orientation,relative,scale,width,height,wordCount:words.length,words};
}

export function summarize(result,unit='') {
  const d=result.data, max=d.reduce((a,b)=>a.value>b.value?a:b),min=d.reduce((a,b)=>a.value<b.value?a:b);
  const suffix=result.relative?' percent of the tallest bar':unit?` ${unit}`:'';
  return `${result.title}. ${d.length} categories. Highest: ${max.label}, ${max.value}${suffix}. Lowest: ${min.label}, ${min.value}${suffix}. ${d.map(x=>`${x.label}: ${x.value}${suffix}`).join('; ')}. ${result.relative?'Values are relative sizes, not the original units.':'Review extracted values against the source image before sharing.'}`;
}

export function escapeXML(s) {return String(s).replace(/[<>&"']/g,c=>({'<':'&lt;','>':'&gt;','&':'&amp;','"':'&quot;',"'":'&apos;'}[c]));}
export function toCSV(result,unit='') {
  const quote=s=>'"'+String(s).replace(/"/g,'""')+'"';
  const safeLabel=s=>/^[=+@\-\t\r]/.test(s)?`'${s}`:s;
  return ['Category,Value,Source,Units',...result.data.map(d=>[safeLabel(d.label),d.value,d.method,result.relative?'percent of tallest bar':safeLabel(unit||'source chart units')].map(quote).join(','))].join('\r\n');
}
export function toSVG(result,{tactile=false,unit=''}={}) {
  const width=900,height=180+result.data.length*70,max=Math.max(...result.data.map(d=>d.value),1),esc=escapeXML;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" role="img" aria-labelledby="title desc"><title id="title">${esc(result.title)}</title><desc id="desc">${esc(summarize(result,unit))}</desc><defs><pattern id="hatch" width="8" height="8" patternUnits="userSpaceOnUse"><path d="M0 8L8 0" stroke="#111" stroke-width="1.5"/></pattern></defs><rect width="100%" height="100%" fill="white"/><text x="36" y="48" font-family="sans-serif" font-size="26" font-weight="700">${esc(result.title)}</text><text x="36" y="78" font-family="sans-serif" font-size="14" fill="#555">${result.relative?'Relative size · tallest bar = 100':esc(unit||'Values recovered from image')} · Sona</text>${result.data.map((d,i)=>`<g role="img" aria-label="${esc(d.label)}: ${d.value}"><text x="36" y="${133+i*70}" font-family="sans-serif" font-size="17">${esc(d.label.slice(0,18))}</text><rect x="240" y="${108+i*70}" width="${Math.max(1,d.value/max*530)}" height="40" rx="${tactile?0:5}" fill="${tactile?'url(#hatch)':'#5942c4'}" stroke="${tactile?'#111':'none'}" stroke-width="2"/><text x="${250+d.value/max*530}" y="${133+i*70}" font-family="sans-serif" font-size="17" font-weight="700">${d.value}</text></g>`).join('')}<text x="36" y="${height-18}" font-family="sans-serif" font-size="12" fill="#555">${tactile?'Raised-line candidate. Requires specialist review before tactile printing.':'Review extracted values before sharing. Accessible description embedded in this SVG.'}</text></svg>`;
}
