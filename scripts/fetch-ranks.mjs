import fs from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const outDir = path.resolve('assets/ranks');
await fs.mkdir(outDir,{recursive:true});
const urls = {
'iron1.png':'https://wiki.valorant.com/en-us/images/thumb/Iron_1_Rank.png/120px-Iron_1_Rank.png?a0496',
'iron2.png':'https://wiki.valorant.com/en-us/images/thumb/Iron_2_Rank.png/120px-Iron_2_Rank.png?650b8',
'iron3.png':'https://wiki.valorant.com/en-us/images/thumb/Iron_3_Rank.png/120px-Iron_3_Rank.png?14c95',
'bronze1.png':'https://wiki.valorant.com/en-us/images/thumb/Bronze_1_Rank.png/120px-Bronze_1_Rank.png?f51a6',
'bronze2.png':'https://wiki.valorant.com/en-us/images/thumb/Bronze_2_Rank.png/120px-Bronze_2_Rank.png?c31e6',
'bronze3.png':'https://wiki.valorant.com/en-us/images/thumb/Bronze_3_Rank.png/120px-Bronze_3_Rank.png?00125',
'silver1.png':'https://wiki.valorant.com/en-us/images/thumb/Silver_1_Rank.png/120px-Silver_1_Rank.png?ca291',
'silver2.png':'https://wiki.valorant.com/en-us/images/thumb/Silver_2_Rank.png/120px-Silver_2_Rank.png?7e41e',
'silver3.png':'https://wiki.valorant.com/en-us/images/thumb/Silver_3_Rank.png/120px-Silver_3_Rank.png?170a9',
'gold1.png':'https://wiki.valorant.com/en-us/images/thumb/Gold_1_Rank.png/120px-Gold_1_Rank.png?170a9',
'gold2.png':'https://wiki.valorant.com/en-us/images/thumb/Gold_2_Rank.png/120px-Gold_2_Rank.png?8410f',
'gold3.png':'https://wiki.valorant.com/en-us/images/thumb/Gold_3_Rank.png/120px-Gold_3_Rank.png?7c41d',
'platinum1.png':'https://wiki.valorant.com/en-us/images/thumb/Platinum_1_Rank.png/120px-Platinum_1_Rank.png?46430',
'platinum2.png':'https://wiki.valorant.com/en-us/images/thumb/Platinum_2_Rank.png/120px-Platinum_2_Rank.png?8b8bd',
'platinum3.png':'https://wiki.valorant.com/en-us/images/thumb/Platinum_3_Rank.png/120px-Platinum_3_Rank.png?b45e2',
'diamond1.png':'https://wiki.valorant.com/en-us/images/thumb/Diamond_1_Rank.png/120px-Diamond_1_Rank.png?cd057',
'diamond2.png':'https://wiki.valorant.com/en-us/images/thumb/Diamond_2_Rank.png/120px-Diamond_2_Rank.png?b23a8',
'diamond3.png':'https://wiki.valorant.com/en-us/images/thumb/Diamond_3_Rank.png/120px-Diamond_3_Rank.png?e6893',
'ascendant1.png':'https://wiki.valorant.com/en-us/images/thumb/Ascendant_1_Rank.png/120px-Ascendant_1_Rank.png?c818e',
'ascendant2.png':'https://wiki.valorant.com/en-us/images/thumb/Ascendant_2_Rank.png/120px-Ascendant_2_Rank.png?8b3d6',
'ascendant3.png':'https://wiki.valorant.com/en-us/images/thumb/Ascendant_3_Rank.png/120px-Ascendant_3_Rank.png?bc50e',
'immortal1.png':'https://wiki.valorant.com/en-us/images/thumb/Immortal_1_Rank.png/120px-Immortal_1_Rank.png?d43a7',
'immortal2.png':'https://wiki.valorant.com/en-us/images/thumb/Immortal_2_Rank.png/120px-Immortal_2_Rank.png?3db80',
'immortal3.png':'https://wiki.valorant.com/en-us/images/thumb/Immortal_3_Rank.png/120px-Immortal_3_Rank.png?db712',
'radiant.png':'https://wiki.valorant.com/en-us/images/thumb/Radiant_Rank.png/120px-Radiant_Rank.png?3abd1'
};

const hex = (r,g,b)=>`${r.toString(16).padStart(2,'0')}${g.toString(16).padStart(2,'0')}${b.toString(16).padStart(2,'0')}`;
const near=(a,b,t=28)=>Math.abs(a[0]-b[0])+Math.abs(a[1]-b[1])+Math.abs(a[2]-b[2])<=t;

for(const [name,url] of Object.entries(urls)){
  console.log(`fetch ${name}`);
  const res=await fetch(url,{headers:{'User-Agent':'DUNK-RR asset fetcher'}});
  if(!res.ok) throw new Error(`${res.status} ${url}`);
  const input=Buffer.from(await res.arrayBuffer());
  const {data,info}=await sharp(input).ensureAlpha().raw().toBuffer({resolveWithObject:true});
  const corners=[];
  for(const [x,y] of [[0,0],[info.width-1,0],[0,info.height-1],[info.width-1,info.height-1]]){
    const i=(y*info.width+x)*4; corners.push([data[i],data[i+1],data[i+2]]);
  }
  const bg=corners[0];
  const out=Buffer.from(data);
  for(let y=0;y<info.height;y++) for(let x=0;x<info.width;x++){
    const i=(y*info.width+x)*4;
    if(near([out[i],out[i+1],out[i+2]],bg,34)) out[i+3]=0;
  }
  await sharp(out,{raw:{width:info.width,height:info.height,channels:4}}).png().toFile(path.join(outDir,name));
}
console.log('Done. Exact user-supplied URLs fetched; corner-color background removed.');
