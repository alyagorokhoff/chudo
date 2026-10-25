'use client';
import {useEffect,useId,useRef,useState,type ReactNode} from 'react';
import {createPortal} from 'react-dom';
import './image-save.css';
export default function CoinSave({onClose,children}:{onClose:()=>void,children:ReactNode}){
 const[mounted,M]=useState(false),panel=useRef<HTMLElement>(null),id=useId();
 useEffect(()=>{M(true);const before=document.activeElement as HTMLElement|null,overflow=document.body.style.overflow;document.body.style.overflow='hidden';const key=(e:KeyboardEvent)=>{if(e.key==='Escape'){e.preventDefault();onClose()}if(e.key==='Tab'&&panel.current){const es=panel.current.querySelectorAll<HTMLElement>('a[href],button:not([disabled]),input');const first=es[0],last=es[es.length-1];if(e.shiftKey&&(document.activeElement===first||document.activeElement===panel.current)){e.preventDefault();last?.focus()}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first?.focus()}}};document.addEventListener('keydown',key);return()=>{document.body.style.overflow=overflow;document.removeEventListener('keydown',key);if(before?.isConnected)before.focus()}},[]);
 useEffect(()=>{if(mounted)panel.current?.focus()},[mounted]);
 if(!mounted)return null;
 return createPortal(<div className="wonder-save-overlay" onClick={e=>{if(e.target===e.currentTarget)onClose()}}><section className="wonder-save-dialog wonder-save-coin" role="dialog" aria-modal="true" aria-labelledby={id} ref={panel} tabIndex={-1}><button className="wonder-save-close" aria-label="Закрыть сохранение" onClick={onClose}>×</button><h2 id={id}>Оставь монетку себе</h2><div className="wonder-save-leading">{children}</div></section></div>,document.body);
}
