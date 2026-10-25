export type CardSpec={kind:'butterfly'|'hug'|'cookie'|'coin'|'ticket',message:string,title:string,art:string,fontFamily?:string,answer?:string};
export type CardImage={blob:Blob,text:string,inkPixels:number,width:number,height:number};
export async function renderCard(spec:CardSpec):Promise<CardImage>{
 const family=spec.fontFamily||'Cormorant';await document.fonts.load(`400 70px "${family}"`,spec.message+'К СЕБЕ');await document.fonts.ready;
 if(!document.fonts.check(`400 70px "${family}"`,spec.message))throw Error('Font unavailable');
 const load=(src:string)=>new Promise<HTMLImageElement>((resolve,reject)=>{const im=new Image();im.onload=()=>resolve(im);im.onerror=()=>reject(Error('Image unavailable'));im.src=src});
 const [world,art]=await Promise.all([load('/world.webp'),load(spec.art)]);
 const c=document.createElement('canvas');c.width=1080;c.height=1920;const x=c.getContext('2d')!;const ink='#51364f';
 if(spec.kind==='cookie'){const g=x.createLinearGradient(0,0,1080,1920);g.addColorStop(0,'#fbf7f0');g.addColorStop(.55,'#f2e8eb');g.addColorStop(1,'#ddd5e7');x.fillStyle=g;x.fillRect(0,0,1080,1920)}else{const scale=Math.max(1080/world.width,1920/world.height);x.drawImage(world,(1080-world.width*scale)/2,(1920-world.height*scale)/2,world.width*scale,world.height*scale);const g=x.createLinearGradient(0,0,0,1920);g.addColorStop(0,'#eee5e9f5');g.addColorStop(.48,'#eee5e9d9');g.addColorStop(1,'#eee5e9f5');x.fillStyle=g;x.fillRect(0,0,1080,1920)}
 function text(s:string,y:number,size:number,cx=540){x.save();x.globalAlpha=1;x.fillStyle=ink;x.shadowColor='transparent';x.shadowBlur=0;x.font=`400 ${size}px "${family}"`;x.textAlign='center';x.textBaseline='alphabetic';x.fillText(s,cx,y);x.restore()}
 function block(s:string,{cx=540,top,width,height,size=70}:{cx?:number,top:number,width:number,height:number,size?:number}){let lines:string[]=[];for(;size>=34;size-=2){x.font=`400 ${size}px "${family}"`;lines=[];let line='';for(const word of s.split(/\s+/)){const n=line?line+' '+word:word;if(x.measureText(n).width>width&&line){lines.push(line);line=word}else line=n}lines.push(line);if(lines.length*size*1.18<=height)break}if(lines.length*size*1.18>height)throw Error('Text does not fit');const first=top+(height-lines.length*size*1.18)/2+size;lines.forEach((s,i)=>text(s,first+i*size*1.18,size,cx));return {left:Math.round(cx-width/2),top,width,height}}
 let region:{left:number,top:number,width:number,height:number};
 if(spec.kind==='cookie'){
 text('К СЕБЕ',180,43);text('Твоё предсказание',555,35);region=block(spec.message,{top:650,width:860,height:450,size:88});x.drawImage(art,380,1185,320,320);
 }else if(spec.kind==='ticket'){
 text('К СЕБЕ · ПОДАРИ ЧУДО',300,38);text('Твоё маленькое',470,64);text('приключение',540,64);x.save();x.shadowColor='#77465830';x.shadowBlur=28;x.shadowOffsetY=18;x.drawImage(art,0,650,1080,560);x.restore();region=block(spec.message,{cx:445,top:735,width:600,height:360,size:51});x.save();x.translate(934,930);x.rotate(Math.PI/2);text('К СЕБЕ',0,36,0);x.restore();block('Действителен в любой день, когда захочется чего-то хорошего.',{top:1280,width:840,height:150,size:35});
 }else{
 text(spec.title,190,spec.kind==='butterfly'?35:38);
 x.save();const glow=x.createRadialGradient(540,615,5,540,615,420);glow.addColorStop(0,'#fff7ecb0');glow.addColorStop(.55,'#fbe9ed60');glow.addColorStop(1,'#fff7ec00');x.fillStyle=glow;x.fillRect(100,200,880,830);x.restore();
 x.save();x.shadowColor='#7b536d25';x.shadowBlur=40;x.shadowOffsetY=16;
 if(spec.kind==='coin'){const d=500,left=290,top=365;x.beginPath();x.arc(540,615,d/2,0,2*Math.PI);x.clip();const px=spec.answer==='НЕТ'?.86:.14;x.drawImage(art,left+(d-d*2.52)*px,top+(d-d*1.92)*.46,d*2.52,d*1.92)}else{x.drawImage(art,300,365,480,480)}x.restore();
 region=block(spec.message,{top:950,width:840,height:490,size:70});
 }
 text('К СЕБЕ',1630,48);text('archangelsguide.ru',1700,33);
 // Inspect the actual text area, catching invisible ink before offering a file.
 const data=x.getImageData(region.left,region.top,region.width,region.height).data;let inkPixels=0;for(let i=0;i<data.length;i+=4){if(data[i]<125&&data[i+1]<115&&data[i+2]<130&&data[i+3]>240)inkPixels++}if(inkPixels<300)throw Error('Text invisible');
 const blob=await new Promise<Blob>((resolve,reject)=>c.toBlob(b=>b?resolve(b):reject(Error('PNG unavailable')),'image/png'));
 return {blob,text:spec.message,inkPixels,width:1080,height:1920};
}
