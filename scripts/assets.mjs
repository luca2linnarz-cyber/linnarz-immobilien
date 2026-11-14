import sharp from 'sharp';
import fs from 'node:fs/promises';
const source='reference/design.png';
const meta=await sharp(source).metadata();
console.log('source',meta.width,meta.height);
const scale=meta.width/1536;
async function crop(name,x,y,w,h){await sharp(source).extract({left:Math.round(x*scale),top:Math.round(y*scale),width:Math.round(w*scale),height:Math.round(h*scale)}).png().toFile('public/images/'+name+'.png')}
await crop('portrait',1160,155,318,255);
await crop('haus',78,772,461,229);
await crop('wohnung',564,772,438,229);
await crop('landhaus',1027,772,431,229);
await crop('valuation',970,1400,543,260);
const w=meta.width,h=Math.round(552*scale);
const original=await sharp(source).extract({left:0,top:Math.round(100*scale),width:w,height:h}).removeAlpha().raw().toBuffer();
const generated=await sharp('reference/reconstructed.png').resize(w,h,{fit:'fill'}).removeAlpha().raw().toBuffer();
// Overlay rectangles in source coordinates, relative to the hero crop.
// A narrow feather is necessary at reconstruction boundaries; all pixels outside it are copied exactly.
const rects=[[80,65,417,85],[80,101,608,224],[80,231,560,276],[80,299,364,351],[897,40,1162,425]];
const out=Buffer.from(original);const mask=Buffer.alloc(w*h);let retained=0;
for(let y=0;y<h;y++)for(let x=0;x<w;x++){
 let alpha=0;
 for(const [x1,y1,x2,y2] of rects){const dx=Math.max(x1-x,0,x-x2),dy=Math.max(y1-y,0,y-y2);const distance=Math.hypot(dx,dy);alpha=Math.max(alpha,Math.max(0,1-distance/(14*scale)));}
 if(alpha===0)retained++;
 const p=(y*w+x)*3;mask[y*w+x]=Math.round(alpha*255);
 for(let c=0;c<3;c++)out[p+c]=Math.round(original[p+c]*(1-alpha)+generated[p+c]*alpha);
}
await sharp(out,{raw:{width:w,height:h,channels:3}}).png().toFile('public/images/hero-castle.png');
await sharp(mask,{raw:{width:w,height:h,channels:1}}).png().toFile('reference/reconstruction-mask.png');
await fs.writeFile('reference/pixel-audit.json',JSON.stringify({width:w,height:h,unchangedPixels:retained,totalPixels:w*h,unchangedPercent:100*retained/(w*h),note:'Outside masked reconstruction and its 14px transition, original source RGB pixels are preserved exactly.'},null,2));
console.log('Original pixels preserved:',(100*retained/(w*h)).toFixed(1)+'%');
