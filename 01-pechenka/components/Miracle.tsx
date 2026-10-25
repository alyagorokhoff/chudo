'use client';
import {useEffect,useRef,useState} from 'react';
import type {GiftView} from '../lib/gift-view';
import BrandIntro from './BrandIntro';
import GiftForward from './GiftForward';
import ImageSave from './ImageSave';
import {renderCard} from './card-image';
import {FORWARD_INVITATION,FORWARD_MESSAGE} from '../lib/gift-copy';
type Stage='error'|'loading'|'gift'|'cookie'|'cracking'|'unfolding'|'fortune'|'claimed'|'missing'|'home';
const receiptKey=(t:string)=>'miracle-receipt:'+t;
const random=()=>Array.from(crypto.getRandomValues(new Uint8Array(32)),b=>b.toString(16).padStart(2,'0')).join('');
export default function Miracle({token,test=false,initial}:{token?:string,test?:boolean,initial?:GiftView}){
 const [stage,setStage]=useState<Stage>(!token?'home':initial?.status==='new'?'gift':initial?.status==='owned'?'fortune':initial?.status==='missing'?'missing':'loading'),[prediction,setPrediction]=useState(initial?.prediction||''),[ready,setReady]=useState(!token),[busy,setBusy]=useState(false),[error,setError]=useState(''),[shareUrl,setShareUrl]=useState(''),[saveUrl,setSaveUrl]=useState(''),[saveOpen,setSaveOpen]=useState(false),[forwardOpen,setForwardOpen]=useState(false);const receipt=useRef(''),points=useRef(new Map<number,{x:number,y:number}>()),spread=useRef(0),lock=useRef(false),paperRef=useRef<HTMLElement>(null),saveRef=useRef<HTMLDivElement>(null),saveUrlRef=useRef(''),forwardPromise=useRef<Promise<string>|null>(null);const [nextGiftUrl,setNextGiftUrl]=useState('');
 async function request(claim=false){if(!token)return;const r=await fetch('/api/gifts/'+token,{method:claim?'POST':'GET',headers:{'X-Receipt':receipt.current},signal:AbortSignal.timeout(20000)});if(!r.ok&&r.status!==404)throw Error('Не удалось связаться с чудом. Попробуй ещё раз.');const d=await r.json() as {status:string;prediction:string};if(d.status==='owned'){setPrediction(d.prediction);setStage(claim?'cookie':'fortune')}else setStage(d.status==='new'?'gift':d.status==='missing'?'missing':'claimed');}
 useEffect(()=>{if(!token)return;let cancelled=false;try{receipt.current=localStorage.getItem(receiptKey(token))||random();localStorage.setItem(receiptKey(token),receipt.current)}catch{receipt.current=random()}
 async function prepare(){try{const font=document.fonts.load('400 30px "Cormorant Garamond"');const images=[initial?.status==='new'?'/gift.png':'/cookie.png','/world.webp'].map(src=>{const image=new Image();image.src=src;return image.decode().catch(()=>{})});await Promise.all([font,...images,(!initial||initial.status==='claimed')?request():Promise.resolve()]);if(!cancelled)setReady(true)}catch(e:any){if(!cancelled){setError(e.message);setStage('error');setReady(true)}}}
 prepare();return()=>{cancelled=true};},[token]);

 async function open(){if(lock.current)return;lock.current=true;setBusy(true);setError('');try{await request(true)}catch(e:any){setError(e.message)}finally{setBusy(false);lock.current=false}}
 function crack(){if(stage!=='cookie'||lock.current)return;lock.current=true;navigator.vibrate?.(18);setStage('cracking');const reduced=window.matchMedia('(prefers-reduced-motion: reduce)').matches;setTimeout(()=>setStage('unfolding'),reduced?20:750);setTimeout(()=>setStage('fortune'),reduced?70:2850)}
 useEffect(()=>()=>{if(saveUrlRef.current)URL.revokeObjectURL(saveUrlRef.current)},[]);

 async function createGift(){const r=await fetch('/api/gifts',{method:'POST',signal:AbortSignal.timeout(8000)});if(!r.ok)throw Error('Не получилось создать подарок. Попробуй ещё раз.');return (await r.json() as {url:string}).url;}
 function prepareForward(){if(!forwardPromise.current){const pending=createGift().then(url=>{if(forwardPromise.current===pending)setNextGiftUrl(url);return url}).catch(e=>{if(forwardPromise.current===pending)forwardPromise.current=null;throw e});forwardPromise.current=pending}return forwardPromise.current;}
 useEffect(()=>{if(['cookie','fortune','claimed','home'].includes(stage))void prepareForward().catch(()=>{});},[stage]);
 function share(){setError('');setForwardOpen(true)}
 async function testGift(){setBusy(true);try{const url=await createGift();setShareUrl(url)}catch(e:any){setError(e.message)}finally{setBusy(false)}}
 function save(){if(!busy){setError('');setSaveOpen(true)}}
 const titles:Record<Stage,string>={error:'Чудо пока не открылось',loading:'Твоё чудо уже близко',gift:'Тебе отправили маленькое чудо',cookie:'Внутри тебя ждёт предсказание',cracking:'Внутри тебя ждёт предсказание',unfolding:'Твоё предсказание',fortune:'Твоё предсказание',claimed:'Это чудо уже открыли 🤍',missing:'Кажется, это чудо не нашлось',home:test?'Создай маленькое чудо':'Подари маленькое чудо'};
 return <main className={'world state-'+stage+(ready?' entry-ready':' entry-preparing')} data-entry-ready={ready}><header><a href="https://archangelsguide.ru" className="wordmark">К СЕБЕ</a><span>ПОДАРИ ЧУДО</span></header><section className="experience" aria-live="polite"><div className="eyebrow">{stage==='fortune'?'ПУСТЬ ХОРОШЕЕ СЛУЧАЕТСЯ':'ДЛЯ КОГО-ТО ОСОБЕННОГО'}</div><h1>{titles[stage]}</h1>{stage==='gift'&&<p className="lead">Кто-то подумал о тебе с теплом и отправил маленькое чудо 🤍</p>}
 {['gift','home','claimed','missing'].includes(stage)&&<div className="gift-scene" aria-hidden="true"><div className="halo"/><img className="gift-photo" src="/gift.png" alt=""/><div className="floor-shadow"/></div>}
 {stage==='loading'&&<div className="loader"/>}
 {['cookie','cracking','unfolding','fortune'].includes(stage)&&<div className={'cookie-scene '+(stage!=='cookie'?'broken ':'')+(['unfolding','fortune'].includes(stage)?'finished':'')}>
 <div className="cookie-aura"/><div className="cookie-object" role={stage==='cookie'?'button':undefined} tabIndex={stage==='cookie'?0:-1} aria-label="Разломи печеньку" onKeyDown={e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();crack()}}} onClick={crack} onPointerDown={e=>{points.current.set(e.pointerId,{x:e.clientX,y:e.clientY});e.currentTarget.setPointerCapture(e.pointerId);if(points.current.size===2){const [a,b]=Array.from(points.current.values());spread.current=Math.hypot(a.x-b.x,a.y-b.y)}}} onPointerMove={e=>{if(!points.current.has(e.pointerId))return;points.current.set(e.pointerId,{x:e.clientX,y:e.clientY});if(points.current.size===2){const [a,b]=Array.from(points.current.values());if(Math.hypot(a.x-b.x,a.y-b.y)-spread.current>25)crack()}}} onPointerUp={e=>points.current.delete(e.pointerId)} onPointerCancel={e=>points.current.delete(e.pointerId)}><div className="cookie-half half-left"><img src="/cookie.png" alt="" draggable="false"/></div><div className="cookie-half half-right"><img src="/cookie.png" alt="" draggable="false"/></div><div className="crumb c1"/><div className="crumb c2"/><div className="crumb c3"/></div>
 {['unfolding','fortune'].includes(stage)&&<article ref={paperRef} className={'paper-rig paper-'+stage} aria-label={stage==='fortune'?'Твоё предсказание':'Сложенная бумажка с предсказанием'}>
 <div className="sheet-measure" aria-hidden="true"><p>{prediction}</p></div>
 <div className="sheet-folds" aria-hidden="true"><div className="sheet-middle"><div className="sheet-wing sheet-wing-left"/><div className="sheet-wing sheet-wing-right"/></div></div>
 <div className="sheet-ink" aria-hidden={stage!=='fortune'}><p>{prediction}</p></div>

 </article>}

 </div>}
 {stage==='cookie'&&<p className="hint">Разломи печеньку <span>коснись или разведи пальцы</span></p>}
 {['unfolding','fortune'].includes(stage)&&<><p className="after">{FORWARD_INVITATION}</p><div className="actions"><button onClick={save} disabled={busy}>Сохранить предсказание <span>↓</span></button><button className="secondary" onClick={share} disabled={busy}>Подарить чудо дальше <span>↗</span></button></div></>}
 {stage==='gift'&&<button onClick={open} disabled={busy}>{busy?'Открываем…':'Открыть моё чудо'} <span>↗</span></button>}
 {stage==='claimed'&&<><p className="lead">Но хорошего хватит на всех. Ты тоже можешь отправить кому-то маленькое чудо.</p><button onClick={share} disabled={busy}>Подарить чудо <span>↗</span></button></>}
 {stage==='home'&&<><p className="lead">{test?'Каждая новая ссылка — отдельное одноразовое чудо.':'Кому хочется отправить немного тепла?'}</p><button onClick={test?testGift:share} disabled={busy}>{busy?'Создаём…':test?'Создать новое тестовое чудо':'Подарить чудо'} <span>↗</span></button></>}
 {stage==='missing'&&<a className="button" href="/">Подарить новое чудо →</a>}
 {error&&<p role="alert" className="error">{error}</p>}{stage==='error'&&<button onClick={()=>window.location.reload()}>Попробовать ещё раз</button>}
 {test&&shareUrl&&<div className="share-panel"><p>Свежая ссылка готова</p><input aria-label="Ссылка на подарок" readOnly value={shareUrl} onFocus={e=>e.currentTarget.select()}/><a className="text-link" href={shareUrl} target="_blank">Открыть тестовое чудо ↗</a></div>}


 </section>{['unfolding','fortune'].includes(stage)&&<BrandIntro/>}{!['unfolding','fortune'].includes(stage)&&<footer>Маленькие чудеса. Большое тепло.</footer>} {forwardOpen&&<GiftForward message={FORWARD_MESSAGE} initialUrl={nextGiftUrl} getGift={prepareForward} onClose={()=>setForwardOpen(false)} onShared={()=>{setNextGiftUrl('');forwardPromise.current=null;}}/>}
 {saveOpen&&<ImageSave title="Сохрани своё предсказание" filename="k-sebe-prediction.png" makeImage={()=>renderCard({kind:"cookie",title:"Твоё предсказание",message:prediction,art:"/cookie.png",fontFamily:"Cormorant Garamond"})} onClose={()=>setSaveOpen(false)}/>}


</main>
}
