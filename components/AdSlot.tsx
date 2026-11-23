"use client";
import { useEffect, useState } from "react";
const CONFIG="https://nsehqfhumeowwzypbozm.supabase.co/functions/v1/public-ad-config";
type Ad={id:string;name:string;placement:string;script_url:string;script_attributes?:Record<string,string>};
export default function AdSlot({placement}:{placement:string}){
 const [ads,setAds]=useState<Ad[]>([]);
 useEffect(()=>{let live=true;fetch(CONFIG).then(r=>r.ok?r.json():Promise.reject()).then(d=>{if(live)setAds((d.ads||[]).filter((a:Ad)=>a.placement===placement&&/^https:\/\//i.test(a.script_url)));}).catch(()=>{});return()=>{live=false;};},[placement]);
 return <div className="ad-slot" aria-label="Sponsored content">{ads.map(ad=><div className="ad-slot-item" key={ad.id} data-ad-name={ad.name}><script suppressHydrationWarning dangerouslySetInnerHTML={{__html:""}}/><AdScript ad={ad}/></div>)}</div>;
}
function AdScript({ad}:{ad:Ad}){
 useEffect(()=>{const host=document.querySelector(`[data-ad-name="${CSS.escape(ad.name)}"]`);if(!host||host.querySelector("script[data-luminex-ad]"))return;const script=document.createElement("script");script.src=ad.script_url;script.async=true;script.dataset.luminexAd="true";for(const [key,value] of Object.entries(ad.script_attributes||{})){if(/^data-[a-z0-9-]{1,50}$/.test(key)&&typeof value==="string")script.setAttribute(key,value);}host.appendChild(script);return()=>{script.remove();};},[ad]);return null;
}
