'use client';
import {useEffect,useRef,useState} from 'react';
import GiftForward from './GiftForward';
import CoinSave from './CoinSave';
const randomToken=()=>Array.from(crypto.getRandomValues(new Uint8Array(24)),x=>x.toString(16).padStart(2,'0')).join('');
export default function Experience({mode,token=''}:{mode:string,token?:string}){
 const[forwardOpen,FO]=useState(false);const forwardPending=useRef<Promise<string>|null>(null);

 const [state,S]=useState(mode==='home'||mode==='test'?mode:'loading'),[busy,B]=useState(false),[spinning,T]=useState(false),[pressed,P]=useState(false),[landed,L]=useState(false),[shareFallback,SF]=useState(false),[giftManual,GM]=useState(false),[tossed,F]=useState(false),[answer,A]=useState(''),[saved,V]=useState(''),[saveOpen,SO]=useState(false),[copied,CP]=useState(false),[manual,MA]=useState(false),[saveError,SE]=useState(false),[gift,G]=useState(''),[notice,N]=useState(''),[error,E]=useState(false);const proof=useRef(''),rot=useRef(0),coin=useRef<HTMLDivElement>(null),down=useRef(0),lock=useRef(false),install=useRef<any>(null),prepared=useRef(''),creating=useRef(false);
 const forwardKey='forward-coin:'+mode+':'+token;
 useEffect(()=>{try{const url=sessionStorage.getItem(forwardKey);if(url){prepared.current=url;G(url)}}catch{}},[]);
 const api=async(action:string,data:any={})=>{const r=await fetch('/api/'+action,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({token,proof:proof.current,permanent:mode==='coin',...data})});const j=await r.json();if(!r.ok)throw Error(j.error);return j};
 const load=async()=>{E(false);try{if(mode==='coin'){await api('coin');S('session')}else{proof.current=sessionStorage.getItem('receipt:'+token)||randomToken();sessionStorage.setItem('receipt:'+token,proof.current);const r=await api('status');S(r.state)}}catch(e:any){S(e.message==='missing'?'missing':'error')}};
 useEffect(()=>{if(mode==='gift'||mode==='coin')load();const listener=(e:any)=>{e.preventDefault();install.current=e};window.addEventListener('beforeinstallprompt',listener);return()=>window.removeEventListener('beforeinstallprompt',listener)},[]);
 const claim=async()=>{B(true);try{await api('claim');S('session')}catch(e:any){S(e.message==='claimed'?'claimed':'error')}finally{B(false)}};
 const toss=async()=>{
 if(lock.current||!coin.current)return;
 const el=coin.current;lock.current=true;P(false);L(false);T(true);N('');A('');
 const yes=(crypto.getRandomValues(new Uint32Array(1))[0]&1)===0;
 const result=yes?'ДА':'НЕТ';const resting=yes?0:180;const start=rot.current;const target=1080+resting;
 const reduced=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
 // Each flight starts from a normalized face; finished animations never retain control.
 el.getAnimations().forEach(a=>a.cancel());el.style.transform=`rotateX(${start}deg)`;
 let flight:Animation|undefined;
 try{
 flight=el.animate(reduced?[{transform:`rotateX(${target}deg)`,opacity:.65},{transform:`rotateX(${target}deg)`,opacity:1}]:[
 {transform:`translateY(0) rotateX(${start}deg) rotateZ(0)`},
 {transform:`translateY(-85px) rotateX(${start+380}deg) rotateZ(-5deg)`,offset:.28},
 {transform:`translateY(-115px) rotateX(${target-370}deg) rotateZ(3deg)`,offset:.53},
 {transform:`translateY(0) rotateX(${target}deg) rotateZ(0)`,offset:.9},
 {transform:`translateY(-6px) rotateX(${target+5}deg)`,offset:.95},
 {transform:`translateY(0) rotateX(${target}deg)`}],{duration:reduced?450:2300,easing:'cubic-bezier(.25,.5,.3,1)',fill:'forwards'});
 await flight.finished;
 }catch{}finally{
 el.style.transform=`rotateX(${resting}deg)`;rot.current=resting;flight?.cancel();
 A(result);F(true);lock.current=false;T(false);L(true);
 }
 api('event',{kind:'toss'}).catch(()=>{});
 };
 const copy=async(url:string)=>{try{await navigator.clipboard.writeText(url);N('Ссылка скопирована 🤍')}catch{N('Выдели ссылку ниже и скопируй её вручную.')}};
 const prepareForward=()=>{if(prepared.current)return Promise.resolve(prepared.current);if(!forwardPending.current){forwardPending.current=api('create',{forward:true}).then(r=>{prepared.current=r.url;G(r.url);try{sessionStorage.setItem(forwardKey,r.url)}catch{}return r.url}).catch(e=>{forwardPending.current=null;throw e})}return forwardPending.current};
 const create=async(forward=false)=>{if(forward){if(!busy)FO(true);return}if(creating.current)return;creating.current=true;B(true);E(false);try{const r=await api('create',{forward:false});G(r.url)}catch{E(true)}finally{creating.current=false;B(false)}};
 const copyGift=async()=>{try{await navigator.clipboard.writeText(gift);N('Подарочная ссылка скопирована 🤍')}catch{GM(true)}};
 const save=async()=>{SO(true);SE(false);MA(false);if(saved)return;B(true);try{const r=await api('save');V(r.url)}catch{SE(true)}finally{B(false)}};
 const copyMine=async()=>{let ok=false;try{await navigator.clipboard.writeText(saved);ok=true}catch{const field=document.createElement('textarea');field.value=saved;field.style.cssText='position:fixed;left:0;top:0;opacity:0';document.body.appendChild(field);field.focus();field.select();try{ok=document.execCommand('copy')}catch{}field.remove()}if(ok){CP(true);MA(false)}else MA(true)};
 const shareMine=async()=>{try{await navigator.share({title:'Моя монетка удачи · К СЕБЕ',url:saved})}catch(e:any){if(e.name!=='AbortError')MA(true)}};
 return <main className={state==='session'?'session-screen':'entry-screen'}><header><a href="https://archangelsguide.ru">К СЕБЕ</a><span>ПОДАРИ ЧУДО</span></header>
 {state==='loading'&&<section className="opening"><p>Твоё чудо уже близко…</p></section>}
 {(state==='created'||state==='home'||state==='test')&&<section className="opening"><p className="eyebrow">МАЛЕНЬКОЕ ТЕПЛО ДЛЯ ТЕБЯ</p><h1>{state==='test'?'Мастерская чудес':'Тебе отправили маленькое чудо'}</h1><p>{state==='test'?'Создай новую одноразовую ссылку для проверки.':'Кто-то захотел сделать твой день чуть теплее 🤍'}</p><img className="gift" src="/gift.png" alt="Закрытый жемчужный подарок"/>{state==='created'?<button disabled={busy} onClick={claim}>{busy?'Открываем…':'Открыть моё чудо'}</button>:<button disabled={busy} onClick={()=>create(false)}>Создать подарок</button>}{state==='test'&&<small>Тестовая версия · сейчас каждый подарок — монетка</small>}</section>}
 {state==='session'&&<><section className="play"><h1>Монетка удачи</h1><p className="intro">Задай мысленно вопрос.<br/>Ответ — «да» или «нет».</p><div className={'stage '+(spinning?'flying ':'')+(pressed?'pressing ':'')+(landed?'landed':'')}><div className="shadow"/><button type="button" className="touch" aria-label={answer?`Выпало ${answer}. Нажми на монетку, чтобы подбросить ещё раз`:'Нажми на монетку, чтобы подбросить'} disabled={spinning} onClick={toss} onPointerDown={e=>{down.current=e.clientY;if(!lock.current)P(true);if(!lock.current)e.currentTarget.setPointerCapture(e.pointerId)}} onPointerCancel={()=>P(false)} onLostPointerCapture={()=>P(false)} onPointerUp={e=>{P(false);if(down.current-e.clientY>20)toss()}}><div className="coin" ref={coin} data-answer={answer}><div className="face yes"/><div className="face no"/>{Array.from({length:14},(_,i)=><div key={i} className="rim" style={{transform:`translateZ(${i-7}px)`}}/>)}</div></button></div><p className="coin-hint" aria-live="polite">{spinning?'Монетка в полёте…':tossed?'Нажми ещё раз':'Нажми на монетку'}</p></section>
 {mode!=='coin'&&<section className="keep"><p>{tossed?'Теперь твоя очередь кого-то порадовать 🤍':'Монетку можно оставить себе 🤍'}</p><div className="actions"><button disabled={busy} onClick={save}>{busy?'Готовим ссылку…':'Оставить монетку себе'}</button><button className="secondary" disabled={busy} onClick={()=>create(true)}>{gift?'Отправить чудо':'Подарить маленькое чудо'}</button></div></section>}
 {saveOpen&&<CoinSave onClose={()=>SO(false)}><p className="coin-save-description">Сохрани постоянную ссылку, чтобы возвращаться к монетке и подбрасывать её в любое время.</p>{saved?<><button onClick={copyMine}>{copied?'Скопировать ссылку ещё раз':'Сохранить постоянную ссылку'}</button><p className="coin-save-note" role="status">{copied?'Ссылка скопирована. Сохрани её в заметках или отправь себе.':'Ссылка останется твоей после закрытия подарка.'}</p><a className="coin-save-open" href={saved}>Открыть мою монетку →</a>{manual&&<input aria-label="Постоянная ссылка на монетку" readOnly value={saved} onFocus={e=>e.target.select()}/>}</>:saveError?<><p>Не удалось подготовить ссылку.</p><button onClick={save}>Попробовать снова</button></>:<p role="status">Готовим постоянную ссылку…</p>}</CoinSave>}
 {mode==='coin'&&<div className="actions"><button disabled={busy} onClick={save}>Сохранить мою монетку</button><button className="secondary forward" disabled={busy} onClick={()=>create(true)}>{gift?'Отправить чудо':'Подарить маленькое чудо'}</button></div>}
 <section className="brand"><p className="eyebrow">МОНЕТКА ОТ «К СЕБЕ»</p><h2>Маленький ответ, чтобы услышать себя.</h2><p>В «К СЕБЕ» — живая колода посланий<br/>и маленькие моменты для себя.</p><a className="textlink brand-cta" href="https://archangelsguide.ru" onClick={()=>api('event',{kind:'brand'}).catch(()=>{})}>Перейти в «К СЕБЕ» →</a></section></>}
 {['missing','claimed','error'].includes(state)&&<section className="opening"><h1>{state==='missing'?'Кажется, это чудо потерялось по дороге.':state==='claimed'?'Это чудо уже открыли 🤍':'Кажется, что-то немного задержалось. Попробуем ещё раз?'}</h1>{state==='claimed'&&<p>Ты тоже можешь подарить кому-то чудо.</p>}<button disabled={busy} onClick={()=>state==='error'?load():create(true)}>{state==='error'?'Попробовать снова':'Подарить чудо'}</button></section>}
 {gift&&(state==='home'||state==='test')&&<section className="linkbox"><h2>Маленькое чудо готово 🤍</h2><input aria-label="Новая подарочная ссылка" readOnly value={gift} onFocus={e=>e.target.select()}/><button onClick={()=>copy(gift)}>Скопировать подарочную ссылку</button></section>}
 {shareFallback&&gift&&<section className="share-fallback" aria-label="Отправить подготовленное чудо"><p>Твоё чудо готово 🤍</p><button className="secondary" onClick={copyGift}>Скопировать ссылку для отправки</button>{giftManual&&<><p>Скопируй этот адрес и отправь его близкому человеку.</p><input aria-label="Подготовленная подарочная ссылка" readOnly value={gift} onFocus={e=>e.target.select()}/></>}</section>}
 {error&&<aside role="alert">Кажется, что-то немного задержалось. Попробуем ещё раз?<button onClick={()=>E(false)}>Хорошо</button></aside>}{notice&&<aside role="status">{notice}<button className="close" onClick={()=>N('')}>Закрыть</button></aside>}<footer>С ТЕПЛОМ, К СЕБЕ</footer>{forwardOpen&&<GiftForward initialUrl={prepared.current} getGift={prepareForward} onClose={()=>FO(false)} onShared={()=>{prepared.current='';G('');forwardPending.current=null;try{sessionStorage.removeItem(forwardKey)}catch{}}}/>}</main>
}
