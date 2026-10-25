import type {Metadata} from 'next';
import './globals.css';
export const metadata:Metadata={title:'Тебе подарили чудо 🤍 | К СЕБЕ',description:'Бесплатный интерактивный подарок. Открой прямо в браузере.',metadataBase:new URL('https://screen-hug.alya-gorokhoff.chatgpt.site'),openGraph:{title:'Тебе подарили чудо 🤍 | К СЕБЕ',description:'Бесплатный интерактивный подарок. Открой прямо в браузере.',images:['/og.png']},referrer:'no-referrer',robots:{index:false,follow:false}};
export default function Layout({children}:{children:React.ReactNode}){return <html lang="ru"><body>{children}</body></html>}
