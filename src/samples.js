export const samples=[
  {name:'Community garden',title:'Community garden harvest',subtitle:'Kilograms harvested by month · illustrative data',labels:['April','May','June','July','August','September'],values:[24,42,35,68,83,61],colors:['#a8b8a0','#96ad94','#b2bfa2','#889c85','#a0b39a','#91a88f'],unit:'kg'},
  {name:'Library visits',title:'A week at the library',subtitle:'Daily visitors · illustrative data',labels:['Monday','Tuesday','Wednesday','Thursday','Friday'],values:[120,185,145,230,195],colors:['#748bb0','#8b9fbb','#a0b1ca','#7c91b5','#97a9c4'],unit:'visitors',horizontal:true},
  {name:'Solar generation',title:'Solar energy generated',subtitle:'Kilowatt-hours by day · illustrative data',labels:['Mon','Tue','Wed','Thu','Fri','Sat','Sun'],values:[18,26,22,32,29,15,24],colors:['#bb9b62'],unit:'kWh',noValues:true}
];
export function drawSample(sample,{width=1200,height=720}={}) {
  const canvas=document.createElement('canvas');canvas.width=width;canvas.height=height;
  const ctx=canvas.getContext('2d');ctx.scale(width/1200,height/720);
  ctx.fillStyle='#fff';ctx.fillRect(0,0,1200,720);ctx.fillStyle='#25342d';ctx.font='bold 36px Arial';ctx.fillText(sample.title,60,70);
  ctx.font='21px Arial';ctx.fillStyle='#59645c';ctx.fillText(sample.subtitle,60,108);
  const max=Math.ceil(Math.max(...sample.values)/20)*20;
  if(sample.horizontal) {
    const x0=225,top=162,plotW=835,step=88,barH=46;
    ctx.font='22px Arial';
    for(let tick=0;tick<=max;tick+=max/4){const x=x0+tick/max*plotW;ctx.strokeStyle='#e8eae7';ctx.beginPath();ctx.moveTo(x,145);ctx.lineTo(x,610);ctx.stroke();ctx.fillStyle='#657066';ctx.textAlign='center';ctx.fillText(String(tick),x,650);}
    sample.values.forEach((v,i)=>{const y=top+i*step,w=v/max*plotW;ctx.fillStyle=sample.colors[i%sample.colors.length];ctx.fillRect(x0,y,w,barH);ctx.fillStyle='#39443c';ctx.textAlign='right';ctx.fillText(sample.labels[i],x0-18,y+31);ctx.textAlign='left';ctx.fillText(String(v),x0+w+12,y+31);});
  } else {
    const left=110,bottom=605,top=180,plotW=1020,step=plotW/sample.values.length,bw=step*.56;
    ctx.font='22px Arial';
    for(let tick=0;tick<=max;tick+=max/4){const y=bottom-tick/max*(bottom-top);ctx.strokeStyle='#e8eae7';ctx.beginPath();ctx.moveTo(left,y);ctx.lineTo(1135,y);ctx.stroke();ctx.fillStyle='#657066';ctx.textAlign='right';ctx.fillText(String(tick),left-20,y+7);}
    sample.values.forEach((v,i)=>{const x=left+step*i+(step-bw)/2,h=v/max*(bottom-top);ctx.fillStyle=sample.colors[i%sample.colors.length];ctx.fillRect(x,bottom-h,bw,h);ctx.fillStyle='#39443c';ctx.textAlign='center';if(!sample.noValues)ctx.fillText(String(v),x+bw/2,bottom-h-14);ctx.fillText(sample.labels[i],x+bw/2,bottom+42);});
  }
  ctx.textAlign='left';ctx.font='17px Arial';ctx.fillStyle='#6e756f';ctx.fillText('Sona sample collection / Synthetic chart for demonstration',60,697);
  return canvas;
}
