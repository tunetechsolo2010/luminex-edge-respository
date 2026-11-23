"use client";
import {useEffect,useState} from "react";
const CONFIG="https://nsehqfhumeowwzypbozm.supabase.co/functions/v1/public-ad-config";
type Ad={id:string;name:string;placement:string;script_url:string;script_attributes?:Record<string,string>};
export default function AdSlot({placement}:{placement:string}){
 const [ads,setAds]=useState<Ad[]>([]);
 useEffect(()=>{let active=true;fetch(CONFIG).then(r=>r.ok?r.json():Promise.reject()).then(d=>{if(active)setAds((d.ads||[]).filter((a:Ad)=>a.placement===placement&&/^https:\/\//i.test(a.script_url)));}).catch(()=>{});return()=>{active=false;};},[placement]);
 return <div className="ad-slot" aria-label="Sponsored content">{ads.map(ad=><AdScript key={ad.id} ad={ad}/>)}</div>;
}
function AdScript({ad}:{ad:Ad}){
 useEffect(()=>{const host=document.getElementById("luminex-ad-"+ad.id);if(!host||host.querySelector("script[data-luminex-ad]"))return;const script=document.createElement("script");script.src=ad.script_url;script.async=true;script.dataset.luminexAd="true";for(const [key,value] of Object.entries(ad.script_attributes||{})){if(/^data-[a-z0-9-]{1,50}$/.test(key)&&typeof value==="string")script.setAttribute(key,value);}host.appendChild(script);return()=>{script.remove();};},[ad]);
 return <div id={"luminex-ad-"+ad.id} className="ad-slot-item" data-ad-name={ad.name}/>;
}
