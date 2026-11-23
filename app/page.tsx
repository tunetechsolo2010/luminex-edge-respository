"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  createUserWithEmailAndPassword, onAuthStateChanged, sendEmailVerification,
  signInWithEmailAndPassword, sendPasswordResetEmail, signOut, User,
} from "firebase/auth";
import { auth } from "../lib/firebase";
import AdSlot from "../components/AdSlot";

const API = "https://nsehqfhumeowwzypbozm.supabase.co/functions/v1/customer-portal";
const LGAS: Record<string, string[]> = {
  Lagos: ["Agege","Ajeromi-Ifelodun","Alimosho","Amuwo-Odofin","Apapa","Badagry","Epe","Eti-Osa","Ibeju-Lekki","Ifako-Ijaiye","Ikeja","Ikorodu","Kosofe","Lagos Island","Lagos Mainland","Mushin","Ojo","Oshodi-Isolo","Shomolu","Surulere"],
  Ogun: ["Abeokuta North","Abeokuta South","Ado-Odo/Ota","Egbado North","Egbado South","Ewekoro","Ifo","Ijebu East","Ijebu North","Ijebu North East","Ijebu Ode","Ikenne","Imeko Afon","Ipokia","Obafemi Owode","Odeda","Odogbolu","Ogun Waterside","Remo North","Shagamu"],
};
type Product = { id:string; name:string; description?:string; brand?:string; condition?:string; indicative_price?:number|null; currency?:string; category_id?:string; image_path?:string|null };
type RequestItem = { id:string; product_name:string; quantity:number; status:string; budget_amount:number|null; created_at:string; quotations?:{id:string;product_cost:number;delivery_fee:number;total_amount:number;status:string;valid_until?:string|null;notes?:string|null}[] };
type Order = { id:string; delivery_id:string; status:string; payment_status:string; payment_method:string; total_amount:number; created_at:string; quotations?:{product_cost:number;delivery_fee:number;status:string}[] };
type PortalData = { products:Product[]; requests:RequestItem[]; orders:Order[]; categories:{id:string;name:string}[]; notifications:{id:string;title:string;message:string;created_at:string}[] };

const money = (value:number|null|undefined) => value == null ? "To be quoted" : new Intl.NumberFormat("en-NG",{style:"currency",currency:"NGN",maximumFractionDigits:0}).format(Number(value));
const label = (value:string) => value.replaceAll("_"," ").replace(/\b\w/g, c=>c.toUpperCase());

export default function Home() {
  const [user,setUser]=useState<User|null>(null);
  const [email,setEmail]=useState("");
  const [password,setPassword]=useState("");
  const [mode,setMode]=useState<"signup"|"login">("signup");
  const [busy,setBusy]=useState(false);
  const [message,setMessage]=useState("");
  const [data,setData]=useState<PortalData|null>(null);
  const [publicCategories,setPublicCategories]=useState<{id:string;name:string;description?:string}[]>([]);
  const [loadingData,setLoadingData]=useState(false);
  const [tab,setTab]=useState<"catalogue"|"request"|"activity">("catalogue");
  const [search,setSearch]=useState("");
  const [selectedCategory,setSelectedCategory]=useState("");
  const [selectedProduct,setSelectedProduct]=useState<Product|null>(null);
  const [fullName,setFullName]=useState("");
  const [phone,setPhone]=useState("");
  const [productName,setProductName]=useState("");
  const [specifications,setSpecifications]=useState("");
  const [brand,setBrand]=useState("");
  const [condition,setCondition]=useState("any");
  const [quantity,setQuantity]=useState("1");
  const [budget,setBudget]=useState("");
  const [notes,setNotes]=useState("");
  const [referenceFile,setReferenceFile]=useState<File|null>(null);
  const [state,setState]=useState("Lagos");
  const [lga,setLga]=useState("");
  const [landmark,setLandmark]=useState("");
  const [street,setStreet]=useState("");
  const [houseNumber,setHouseNumber]=useState("");
  const [directions,setDirections]=useState("");
  const [coords,setCoords]=useState<{latitude:number;longitude:number}|null>(null);
  const [geoMessage,setGeoMessage]=useState("");

  useEffect(()=>{ if(!auth)return; return onAuthStateChanged(auth,setUser); },[]);
  useEffect(()=>{let active=true;fetch("https://nsehqfhumeowwzypbozm.supabase.co/functions/v1/public-catalogue").then(r=>r.ok?r.json():Promise.reject()).then(v=>{if(active)setPublicCategories(v.categories||[]);}).catch(()=>{});return()=>{active=false;};},[]);
  const loadPortal = useCallback(async (current:User) => {
    setLoadingData(true);
    try {
      const token=await current.getIdToken();
      const response=await fetch(API,{headers:{Authorization:`Bearer ${token}`}});
      const result=await response.json();
      if(!response.ok)throw new Error(result.error||"Could not load your customer dashboard.");
      setData(result);
      if(result.user?.name)setFullName(result.user.name);
    } catch(error) { setMessage(error instanceof Error?error.message:"Unable to load customer data."); }
    finally { setLoadingData(false); }
  },[]);
  useEffect(()=>{ if(user) void loadPortal(user); else setData(null); },[user,loadPortal]);

  const filteredProducts=useMemo(()=> (data?.products||[]).filter(p=>(!selectedCategory||p.category_id===selectedCategory)&&(p.name+" "+(p.brand||"")+" "+(p.description||"")).toLowerCase().includes(search.toLowerCase())),[data,search,selectedCategory]);

  async function submitAuth(e:React.FormEvent) {
    e.preventDefault(); if(!auth){setMessage("Firebase is not configured on the website yet.");return;}
    setBusy(true);setMessage("");
    try {
      if(mode==="signup") {
        const credential=await createUserWithEmailAndPassword(auth,email,password);
        await sendEmailVerification(credential.user);
        setMessage("Account created. Please check your email and verify your address. You can continue after verification.");
      } else { await signInWithEmailAndPassword(auth,email,password); setMessage("Signed in successfully."); }
    } catch(error) { setMessage(error instanceof Error?error.message:"Unable to continue."); }
    finally { setBusy(false); }
  }
  async function resetPassword() {
    if(!auth||!email){setMessage("Enter your email address first.");return;}
    try { await sendPasswordResetEmail(auth,email);setMessage("Password reset email sent. Check your inbox."); }
    catch(error){setMessage(error instanceof Error?error.message:"Could not send password reset email.");}
  }
  function startRequest(product?:Product) {
    setSelectedProduct(product||null);setProductName(product?.name||"");setBrand(product?.brand||"");setSpecifications(product?.description||"");
    setTab("request");setMessage("");
    document.getElementById("customer-workspace")?.scrollIntoView({behavior:"smooth"});
  }
  function locate() {
    if(!navigator.geolocation){setGeoMessage("This browser does not support location access. Please enter your address manually.");return;}
    setGeoMessage("Requesting your device location…");
    navigator.geolocation.getCurrentPosition(
      p=>{setCoords({latitude:p.coords.latitude,longitude:p.coords.longitude});setGeoMessage("Location captured. Please still complete every address field below.");},
      ()=>setGeoMessage("Location permission was unavailable. You can continue by entering your full address manually."),
      {enableHighAccuracy:true,timeout:12000,maximumAge:60000}
    );
  }
  async function createRequest(e:React.FormEvent) {
    e.preventDefault();if(!user)return;
    setBusy(true);setMessage("");
    try {
      const token=await user.getIdToken();
      const response=await fetch(API,{method:"POST",headers:{"Content-Type":"application/json",Authorization:`Bearer ${token}`},body:JSON.stringify({
        action:"create-request",fullName,phone,productId:selectedProduct?.id||null,productName,specifications,brand,condition,quantity,budget,
        notes,state,lga,landmark,street,houseNumber,directions,latitude:coords?.latitude??"",longitude:coords?.longitude??"",
      })});
      const result=await response.json();
      if(!response.ok)throw new Error(result.error||"Your request could not be submitted.");
      let uploadWarning="";
      if(referenceFile&&result.requestId){
        try{
          if(referenceFile.size>6*1024*1024)throw new Error("Reference file exceeds 6 MB.");
          const bytes=new Uint8Array(await referenceFile.arrayBuffer());let binary="";
          for(let i=0;i<bytes.length;i+=0x8000)binary+=String.fromCharCode(...bytes.subarray(i,i+0x8000));
          const upload=await fetch("https://nsehqfhumeowwzypbozm.supabase.co/functions/v1/customer-upload",{method:"POST",headers:{"Content-Type":"application/json",Authorization:`Bearer ${token}`},body:JSON.stringify({requestId:result.requestId,fileName:referenceFile.name,contentType:referenceFile.type,base64:btoa(binary)})});
          const uploaded=await upload.json();if(!upload.ok)throw new Error(uploaded.error||"File upload failed.");
        }catch(error){uploadWarning=error instanceof Error?error.message:"Reference file could not be uploaded.";}
      }
      setMessage((result.message||"Your request has been received.")+(uploadWarning?" Reference file note: "+uploadWarning:""));
      setProductName("");setSpecifications("");setBrand("");setBudget("");setNotes("");setQuantity("1");setSelectedProduct(null);setReferenceFile(null);
      await loadPortal(user);setTab("activity");
    } catch(error){setMessage(error instanceof Error?error.message:"Unable to submit request.");}
    finally{setBusy(false);}
  }

  async function continuePayment(orderId:string,deliveryId:string) {
    if(!user)return;setBusy(true);setMessage("");
    try{const token=await user.getIdToken();const r=await fetch("https://nsehqfhumeowwzypbozm.supabase.co/functions/v1/paystack-initialize",{method:"POST",headers:{"Content-Type":"application/json",Authorization:`Bearer ${token}`},body:JSON.stringify({orderId})});const d=await r.json();if(!r.ok||!d.authorization_url)throw new Error(d.error||"Unable to open payment checkout. Reference: "+deliveryId);window.location.assign(d.authorization_url);}
    catch(e){setMessage(e instanceof Error?e.message:"Payment could not be started.");setBusy(false);}
  }

  async function respondToQuote(quotationId:string,action:"accept"|"decline",paymentMethod:"paystack"|"pay_on_delivery"="paystack") {
    if(!user)return;
    setBusy(true);setMessage("");
    try {
      const token=await user.getIdToken();
      const response=await fetch("https://nsehqfhumeowwzypbozm.supabase.co/functions/v1/customer-quotation",{method:"POST",headers:{"Content-Type":"application/json",Authorization:`Bearer ${token}`},body:JSON.stringify({quotationId,action,paymentMethod})});
      const result=await response.json();
      if(!response.ok)throw new Error(result.error||"Unable to process this quotation.");
      if(action==="accept"&&paymentMethod==="paystack"&&result.order?.id){
        const payment=await fetch("https://nsehqfhumeowwzypbozm.supabase.co/functions/v1/paystack-initialize",{method:"POST",headers:{"Content-Type":"application/json",Authorization:`Bearer ${token}`},body:JSON.stringify({orderId:result.order.id})});
        const checkout=await payment.json();
        if(!payment.ok||!checkout.authorization_url)throw new Error(checkout.error||"Order created, but payment checkout could not be opened. Please contact support with reference "+result.order.delivery_id+".");
        window.location.assign(checkout.authorization_url);return;
      }
      setMessage(action==="accept"?"Quotation accepted. Your order reference is "+(result.order?.delivery_id||"created")+".":result.message||"Quotation declined.");
      await loadPortal(user);
    } catch(error){setMessage(error instanceof Error?error.message:"Unable to process quotation.");}
    finally{setBusy(false);}
  }

  return <main>
    <header className="shell topbar"><a className="brand" href="#"><span className="mark">L</span><span>LUMINEX EDGE<small>LOGISTICS · A SUBSIDIARY OF FERGROIND HOLDINGS</small></span></a><nav className="nav"><a href="#services">Services</a><a href="#catalogue">Catalogue</a><a href="#process">How it works</a><a href="#coverage">Coverage</a><a href="/track">Track order</a><a className="btn dark" href="#customer-workspace">{user?"My account":"Get started"}</a></nav></header>
    <section className="hero"><div className="shell"><div className="eyebrow">Product sourcing · Logistics · Delivery</div><h1>Your Product.<br/>Your Budget.<br/><span style={{color:"var(--gold)"}}>Our Responsibility.</span></h1><p>Tell us what you need and the budget you have in mind. We’ll check sourcing options, provide a clear quotation, and coordinate delivery with care.</p><div className="hero-actions"><a className="btn" href="#customer-workspace">Start a request</a><a className="btn outline" href="#process">See how it works</a></div><div className="coverage"><span>Lagos State</span><span>Ogun State</span><span>Local & international sourcing</span></div></div></section>
    <section className="section"><div className="shell"><AdSlot placement="home_top"/></div></section>
    <section className="section shell" id="services"><div className="eyebrow">What we do</div><h2>More than delivery. We help you source.</h2><p className="lead">Whether you know exactly what you want or need help finding the right option, Luminex coordinates the sourcing and delivery journey.</p><div className="grid3"><article className="tile"><div className="num">01</div><h3>Product sourcing</h3><p>Request listed products or tell us what you’re looking for. We check availability with suitable suppliers.</p></article><article className="tile"><div className="num">02</div><h3>Clear quotations</h3><p>We confirm the product cost and delivery fee separately. You review and approve the final quote before paying.</p></article><article className="tile"><div className="num">03</div><h3>Managed delivery</h3><p>Follow your order through sourcing, processing, dispatch and delivery with a unique tracking reference.</p></article></div></section>
    <section className="section"><div className="shell"><AdSlot placement="home_middle"/></div></section>
    <section className="section soft" id="process"><div className="shell"><div className="eyebrow">Simple and transparent</div><h2>From request to your doorstep</h2><div className="steps"><div className="step"><b>01 · Tell us what you need</b><p>Choose a catalogue item or submit a custom product request.</p></div><div className="step"><b>02 · Receive your quote</b><p>We check availability and send a quotation with item and delivery costs separated.</p></div><div className="step"><b>03 · Approve and pay</b><p>Accept the quote first, then choose Paystack or eligible pay-on-delivery.</p></div><div className="step"><b>04 · Track delivery</b><p>We source, process and deliver your order across our service area.</p></div></div></div></section>
    <section className="section shell" id="coverage"><div className="cta"><div><div className="eyebrow">Our initial service area</div><h2>Serving Lagos & Ogun</h2><p>More locations can be introduced as our network grows.</p></div><a className="btn" href="#customer-workspace">Create an account</a></div></section>
    <section className="section shell" id="catalogue"><div className="eyebrow">Explore our sourcing categories</div><h2>Find what you need, or ask us to find it.</h2><p className="lead">Browse our growing product categories. If the exact item is not listed, you can still request it by name or upload a reference image.</p><div className="grid3">{publicCategories.map(category=><article className="tile" key={category.id}><h3>{category.name}</h3><p>{category.description||"Ask Luminex to source products in this category."}</p></article>)}</div><p className="notice" style={{marginTop:20}}>Can't find your product? <a href="#customer-workspace">Create an account and submit a custom sourcing request.</a></p></section>
    <section className="section"><div className="shell"><AdSlot placement="home_bottom"/></div></section>
    <section className="section soft" id="customer-workspace"><div className="shell"><div className="eyebrow">Customer portal</div><h2>{user?"Your Luminex account":"Create your customer account"}</h2><p className="lead">Request products, receive quotations and keep track of your orders in one place.</p>
      {!user?<div className="tile account-card">{<form onSubmit={submitAuth} className="form-grid"><div className="auth-switch"><button type="button" className={mode==="signup"?"btn":"btn dark"} onClick={()=>setMode("signup")}>Create account</button><button type="button" className={mode==="login"?"btn":"btn dark"} onClick={()=>setMode("login")}>Sign in</button></div><label>Email address<input type="email" placeholder="you@example.com" required value={email} onChange={e=>setEmail(e.target.value)}/></label><label>Password<input type="password" placeholder="At least 6 characters" minLength={6} required value={password} onChange={e=>setPassword(e.target.value)}/></label><button className="btn" disabled={busy}>{busy?"Please wait…":mode==="signup"?"Create account":"Sign in"}</button>{mode==="login"&&<button type="button" className="text-button" onClick={resetPassword}>Forgot password?</button>}{message&&<p role="status" className="feedback">{message}</p>}</form>}</div>:<><div className="portal-head"><div><b>{user.email}</b><p className="notice">{user.emailVerified?"Email verified":"Please verify your email address to keep your account secure."}</p>{!user.emailVerified&&<button className="text-button" onClick={async()=>{try{await sendEmailVerification(user);setMessage("Verification email sent. Check your inbox.");}catch(e){setMessage(e instanceof Error?e.message:"Could not resend verification email.");}}}>Resend verification email</button>}</div><button className="btn dark" onClick={()=>signOut(auth!)}>Sign out</button></div><div className="portal-tabs">{(["catalogue","request","activity"] as const).map(t=><button key={t} className={tab===t?"active":""} onClick={()=>setTab(t)}>{t==="catalogue"?"Product catalogue":t==="request"?"New request":"My requests & orders"}</button>)}</div>
        {message&&<p className="feedback portal-message" role="status">{message}</p>}
        {loadingData?<p className="lead">Loading your account…</p>:tab==="catalogue"?<><div className="catalogue-tools"><input placeholder="Search products…" value={search} onChange={e=>setSearch(e.target.value)}/><select aria-label="Filter products by category" value={selectedCategory} onChange={e=>setSelectedCategory(e.target.value)}><option value="">All product categories</option>{(data?.categories||[]).map(category=><option key={category.id} value={category.id}>{category.name}</option>)}</select><button className="btn" onClick={()=>startRequest()}>Request an unlisted product</button></div>{filteredProducts.length?<div className="product-grid">{filteredProducts.map(p=><article className="product-card" key={p.id}>{p.image_path?<img className="product-image" src={"https://nsehqfhumeowwzypbozm.supabase.co/storage/v1/object/public/product-images/"+p.image_path} alt={p.name}/>:<div className="product-placeholder">LE</div>}<div className="product-copy"><b>{p.name}</b>{p.brand&&<small>{p.brand}</small>}<p>{p.description||"Ask us to confirm specifications and availability."}</p><strong>{p.indicative_price==null?"Price on request":"Indicative "+money(p.indicative_price)}</strong><button className="btn" onClick={()=>startRequest(p)}>Request quotation</button></div></article>)}</div>:<div className="tile empty-state"><h3>No catalogue products yet</h3><p>Our catalogue will appear here when products are published. You can still request any product from local or international suppliers.</p><button className="btn" onClick={()=>startRequest()}>Submit a custom request</button></div>}</>:tab==="request"?<form className="tile form-grid request-form" onSubmit={createRequest}><h3>Tell us what you need</h3><p className="notice">Submitting a request is free. We will confirm availability and send your quotation before asking you to pay.</p><div className="two-col"><label>Full name<input required value={fullName} onChange={e=>setFullName(e.target.value)} placeholder="Your full name"/></label><label>Phone number<input required value={phone} onChange={e=>setPhone(e.target.value)} placeholder="+234…"/></label></div><label>Product name<input required value={productName} onChange={e=>setProductName(e.target.value)} placeholder="What would you like us to source?"/></label><label>Specifications / description<textarea value={specifications} onChange={e=>setSpecifications(e.target.value)} rows={3} placeholder="Model, size, colour, features or other details"/></label><div className="two-col"><label>Preferred brand<input value={brand} onChange={e=>setBrand(e.target.value)} placeholder="Any preferred brand?"/></label><label>Condition<select value={condition} onChange={e=>setCondition(e.target.value)}><option value="any">Any condition</option><option value="new">New</option><option value="used">Used</option><option value="refurbished">Refurbished</option></select></label></div><div className="two-col"><label>Quantity<input type="number" min="1" max="10000" required value={quantity} onChange={e=>setQuantity(e.target.value)}/></label><label>Your budget (₦)<input type="number" min="0" step="1" value={budget} onChange={e=>setBudget(e.target.value)} placeholder="Optional"/></label></div><label>Additional notes<textarea value={notes} onChange={e=>setNotes(e.target.value)} rows={2} placeholder="Anything else we should know?"/></label><label>Reference image or document (optional)<input type="file" accept="image/jpeg,image/png,image/webp,application/pdf" onChange={e=>setReferenceFile(e.target.files?.[0]||null)}/><small className="notice">JPG, PNG, WebP or PDF · Maximum 6 MB</small></label><div className="form-divider"/><h3>Delivery address</h3><button type="button" className="btn dark location-button" onClick={locate}>Use my device’s current location</button>{geoMessage&&<p className="notice">{geoMessage}</p>}<div className="two-col"><label>State<select value={state} onChange={e=>{setState(e.target.value);setLga("");}}><option value="Lagos">Lagos</option><option value="Ogun">Ogun</option></select></label><label>Local Government Area<select required value={lga} onChange={e=>setLga(e.target.value)}><option value="">Select LGA</option>{LGAS[state].map(x=><option key={x}>{x}</option>)}</select></label></div><label>Bus stop / landmark<input required value={landmark} onChange={e=>setLandmark(e.target.value)} placeholder="Nearest bus stop or landmark"/></label><div className="two-col"><label>Street name<input required value={street} onChange={e=>setStreet(e.target.value)} placeholder="Street name"/></label><label>House number<input required value={houseNumber} onChange={e=>setHouseNumber(e.target.value)} placeholder="House / building number"/></label></div><label>Additional directions (optional)<textarea value={directions} onChange={e=>setDirections(e.target.value)} rows={2} placeholder="Gate colour, floor, directions…"/></label>{coords&&<p className="notice">GPS coordinates captured: {coords.latitude.toFixed(5)}, {coords.longitude.toFixed(5)}. Manual address remains required.</p>}<button className="btn" disabled={busy}>{busy?"Submitting request…":"Submit sourcing request"}</button></form>:<div className="activity-grid"><div className="tile"><h3>My sourcing requests</h3>{(data?.requests||[]).length?(data!.requests.map(r=><div className="request-activity" key={r.id}><div className="activity-item"><div><b>{r.product_name}</b><small>{new Date(r.created_at).toLocaleDateString("en-NG")} · Qty {r.quantity}</small></div><span className="status">{label(r.status)}</span></div>{(r.quotations||[]).filter(q=>q.status==="sent").map(q=><div className="quote-card" key={q.id}><b>Quotation received</b><div className="quote-lines"><span>Product cost</span><strong>{money(q.product_cost)}</strong><span>Delivery fee</span><strong>{money(q.delivery_fee)}</strong><span>Total</span><strong>{money(q.total_amount)}</strong></div>{q.notes&&<p>{q.notes}</p>}{q.valid_until&&<small>Valid until {new Date(q.valid_until).toLocaleDateString("en-NG")}</small>}<div className="quote-actions"><button className="btn" disabled={busy} onClick={()=>respondToQuote(q.id,"accept","paystack")}>Accept & pay now</button><button className="btn dark" disabled={busy} onClick={()=>respondToQuote(q.id,"accept","pay_on_delivery")}>Accept · Pay on delivery</button><button className="text-button" disabled={busy} onClick={()=>respondToQuote(q.id,"decline")}>Decline quote</button></div></div>)}</div>)):<p className="notice">You have not submitted a product request yet.</p>}</div><div className="tile"><h3>My orders & tracking</h3>{(data?.orders||[]).length?(data!.orders.map(o=><div className="activity-item" key={o.id}><div><a className="order-doc-link" href={"/order/?deliveryId="+encodeURIComponent(o.delivery_id)}><b>{o.delivery_id}</b></a><small>{new Date(o.created_at).toLocaleDateString("en-NG")} · {money(o.total_amount)}</small></div><div className="order-actions"><span className="status">{label(o.status)}</span>{o.payment_method==="paystack"&&o.payment_status!=="paid"&&<button className="btn" disabled={busy} onClick={()=>continuePayment(o.id,o.delivery_id)}>Continue payment</button>}{o.payment_method==="pay_on_delivery"&&o.payment_status!=="paid"&&<small className="notice">Pay on delivery</small>}</div></div>)):<p className="notice">Confirmed orders and tracking updates will appear here.</p>}</div><div className="tile"><h3>Notifications</h3>{(data?.notifications||[]).length?data!.notifications.map(n=><div className="notification" key={n.id}><b>{n.title}</b><p>{n.message}</p><small>{new Date(n.created_at).toLocaleString("en-NG")}</small></div>):<p className="notice">You’re all caught up.</p>}</div></div>}
      </>}
    </div></section>
    <footer className="footer"><div className="shell footerrow"><div>© {new Date().getFullYear()} Luminex Edge Logistics. A subsidiary of Fergroind Holdings.</div><div>Your Product. Your Budget. Our Responsibility.</div></div><div className="shell"><AdSlot placement="site_footer"/></div></footer>
  </main>;
}