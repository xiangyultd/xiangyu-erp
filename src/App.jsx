import { useState, useEffect, useMemo, useRef } from "react";

// Supabase 初始化
const SUPABASE_URL="https://zbnijokwqjpczhmifzia.supabase.co";
const SUPABASE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inpibmlqb2t3cWpwY3pobWlmemlhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc4OTQxNjYsImV4cCI6MjA5MzQ3MDE2Nn0.vs2B3nIOIfLWadPWm5hrMvEOSAAx1GuqTxPtBMh5spI";
async function sbFetch(table,method="GET",body=null,match=null){
  let url=SUPABASE_URL+"/rest/v1/"+table;
  if(match)url+="?"+Object.entries(match).map(([k,v])=>k+"=eq."+v).join("&");
  const headers={"apikey":SUPABASE_KEY,"Authorization":"Bearer "+SUPABASE_KEY,"Content-Type":"application/json"};
  if(method==="POST")headers["Prefer"]="resolution=merge-duplicates,return=minimal";
  const res=await fetch(url,{method,headers,body:body?JSON.stringify(body):null});
  if(method==="GET")return res.json();
  return res.ok;
}
const sb={
  getAll:(table)=>sbFetch(table),
  upsert:(table,data)=>sbFetch(table,"POST",data),
  delete:(table,id)=>sbFetch(table,"DELETE",null,{id}),
};

const ff = "'Noto Sans TC','PingFang TC',sans-serif";
function onEnterNext(e){if(e.key==="Enter"){e.preventDefault();const form=e.target.closest("form,[data-form]")||document;const inputs=Array.from(form.querySelectorAll("input:not([type=checkbox]):not([type=radio]):not([type=range]),select,textarea"));const idx=inputs.indexOf(e.target);if(idx>-1&&idx<inputs.length-1)inputs[idx+1].focus();}}
const HOME_USERS=["老闆","行政A","行政B","余青陽","賴彥銘","郭師傅"];
const HOME_USER_COLORS={"老闆":"#c0392b","行政A":"#2980b9","行政B":"#8e44ad","余青陽":"#16a085","賴彥銘":"#d35400","郭師傅":"#27ae60"};
const HOME_PRIORITY={"高":"#e74c3c","中":"#f39c12","低":"#27ae60"};

function homeFormatTime(iso){const d=new Date(iso);const mm=String(d.getMonth()+1).padStart(2,"0");const dd=String(d.getDate()).padStart(2,"0");const hh=String(d.getHours()).padStart(2,"0");const mi=String(d.getMinutes()).padStart(2,"0");return`${mm}/${dd} ${hh}:${mi}`;}

const HOME_SEED_MSGS=[
  {id:1,user:"老闆",text:"系統上線囉！有問題隨時留言 💬",time:new Date(Date.now()-3600000*5).toISOString(),pinned:true},
  {id:2,user:"行政A",text:"今天余師傅新北有兩單，記得確認尺寸",time:new Date(Date.now()-3600000*2).toISOString(),pinned:false},
];
const HOME_SEED_TODOS=[
  {id:1,text:"確認本週安裝排程",done:false,priority:"高",assignee:"行政A",time:new Date().toISOString()},
  {id:2,text:"跟郭師傅確認南部備料",done:false,priority:"中",assignee:"行政B",time:new Date().toISOString()},
  {id:3,text:"整理上週報價單存檔",done:true,priority:"低",assignee:"行政A",time:new Date(Date.now()-86400000).toISOString()},
];

function HomeMsgBubble({m,currentUser,onPin,onDelete}){
  const isSelf=m.user===currentUser;
  const color=HOME_USER_COLORS[m.user]||"#555";
  return(
    <div style={{display:"flex",alignItems:"flex-start",gap:9,...(isSelf?{flexDirection:"row-reverse"}:{})}}>
      <div style={{width:32,height:32,borderRadius:"50%",background:color,display:"flex",alignItems:"center",justifyContent:"center",fontWeight:700,fontSize:13,color:"#fff",flexShrink:0}}>{m.user[0]}</div>
      <div style={{display:"flex",flexDirection:"column",gap:3,maxWidth:"72%"}}>
        {!isSelf&&<div style={{fontSize:11,fontWeight:700,color}}>{m.user}</div>}
        <div style={{background:isSelf?"#1d4ed8":"#1e2740",border:`1px solid ${isSelf?"#2563eb":"#2e3a5c"}`,borderRadius:10,padding:"8px 12px",fontSize:14,lineHeight:1.55,color:"#e2e8f0",whiteSpace:"pre-wrap",wordBreak:"break-word",textAlign:"left"}}>
          {m.text}{m.pinned&&<span style={{fontSize:12}}> 📌</span>}
        </div>
        <div style={{fontSize:10,color:"#475569",display:"flex",alignItems:"center",gap:6,...(isSelf?{justifyContent:"flex-end"}:{})}}>
          {homeFormatTime(m.time)}
          <span onClick={()=>onPin(m.id)} style={{cursor:"pointer",opacity:.5,fontSize:12,userSelect:"none"}} title={m.pinned?"取消置頂":"置頂"}>{m.pinned?"📌":"☆"}</span>
          <span onClick={()=>onDelete(m.id)} style={{cursor:"pointer",opacity:.5,fontSize:12,userSelect:"none"}}>✕</span>
        </div>
      </div>
    </div>
  );
}

function HomeCalcCard({icon,title,color,children}){
  const [open,setOpen]=useState(false);
  return(
    <div style={{background:"#1a1f2e",border:`1px solid ${open?color:"#1e2740"}`,borderRadius:12,overflow:"hidden"}}>
      <button onClick={()=>setOpen(o=>!o)} style={{display:"flex",alignItems:"center",gap:10,padding:"13px 16px",background:"transparent",border:"none",color:"#e2e8f0",cursor:"pointer",width:"100%",fontFamily:"inherit"}}>
        <div style={{width:32,height:32,borderRadius:8,background:color+"22",color,display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,flexShrink:0}}>{icon}</div>
        <span style={{flex:1,fontWeight:600,fontSize:15,textAlign:"left"}}>{title}</span>
        <span style={{fontSize:14,color:"#64748b",transform:open?"rotate(180deg)":"none",transition:"transform .2s"}}>▾</span>
      </button>
      {open&&<div style={{padding:"4px 16px 16px"}}>{children}</div>}
    </div>
  );
}

function HomeNumInput({label,unit="cm",value,onChange,hint}){
  return(
    <div style={{display:"flex",flexDirection:"column",gap:4,marginBottom:10}}>
      <label style={{fontSize:12,color:"#94a3b8"}}>{label}</label>
      <div style={{display:"flex",alignItems:"center"}}>
        <input type="number" value={value} onChange={e=>onChange(e.target.value)} placeholder="0" style={{flex:1,background:"#111827",border:"1px solid #2e3a5c",borderRadius:"7px 0 0 7px",color:"#e2e8f0",padding:"8px 12px",fontSize:16,fontFamily:"monospace",width:"100%"}}/>
        <span style={{background:"#1e2740",border:"1px solid #2e3a5c",borderLeft:"none",borderRadius:"0 7px 7px 0",padding:"8px 10px",fontSize:13,color:"#64748b"}}>{unit}</span>
      </div>
      {hint&&<div style={{fontSize:11,color:"#475569",fontStyle:"italic"}}>{hint}</div>}
    </div>
  );
}

function HomeResultRow({label,value,highlight}){
  return(
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"7px 12px",background:highlight?"#1d3557":"#111827",border:highlight?"1px solid #3b82f644":"none",borderRadius:7,marginBottom:4}}>
      <span style={{fontSize:13,color:"#94a3b8"}}>{label}</span>
      <span style={{fontFamily:"monospace",fontSize:highlight?20:15,color:highlight?"#fbbf24":"#e2e8f0",fontWeight:highlight?700:600}}>{value}</span>
    </div>
  );
}

function HomeSecretTab(){
  const calcs=[
    {icon:"🚪",title:"三門",color:"#3b82f6",comp:()=>{const[w,setW]=useState("");const r=w?((parseFloat(w)-12)/3*2-6).toFixed(1):null;return(<div><HomeNumInput label="總寬 W" value={w} onChange={setW} hint="(總W－12cm)÷3×2－6 = 出入尺寸"/>{r&&<HomeResultRow label="出入尺寸" value={`${r} cm`} highlight/>}</div>);}},
    {icon:"🚪",title:"二門",color:"#8b5cf6",comp:()=>{const[w,setW]=useState("");const r=w?((parseFloat(w)-10)/2-4).toFixed(1):null;return(<div><HomeNumInput label="總寬 W" value={w} onChange={setW} hint="(總W－10cm)÷2－4 = 出入尺寸"/>{r&&<HomeResultRow label="出入尺寸" value={`${r} cm`} highlight/>}</div>);}},
    {icon:"🔀",title:"折疊二門",color:"#06b6d4",comp:()=>{const[w,setW]=useState("");const r=w?(parseFloat(w)-19).toFixed(1):null;return(<div><HomeNumInput label="總寬 W" value={w} onChange={setW} hint="總W－19cm = 出入尺寸"/>{r&&<HomeResultRow label="出入尺寸" value={`${r} cm`} highlight/>}</div>);}},
    {icon:"🚪",title:"單門",color:"#10b981",comp:()=>{const[w,setW]=useState("");const r=w?(parseFloat(w)-14).toFixed(1):null;return(<div><HomeNumInput label="總寬 W" value={w} onChange={setW} hint="總W－14cm = 出入尺寸"/>{r&&<HomeResultRow label="出入尺寸" value={`${r} cm`} highlight/>}</div>);}},
    {icon:"⊞",title:"四門",color:"#f59e0b",comp:()=>{const[w,setW]=useState("");const wn=parseFloat(w);const t=w?(wn*2-106).toFixed(0):null;const s=t?(parseFloat(t)/4).toFixed(0):null;const x=s?(parseFloat(s)+32).toFixed(0):null;const e=w?((wn-270)/2).toFixed(0):null;return(<div><HomeNumInput label="總寬 W" unit="mm" value={w} onChange={setW}/>{t&&<><HomeResultRow label="門片總寬" value={`${t} mm`}/><HomeResultRow label="每片門尺寸" value={`${s} mm`}/><HomeResultRow label="橫支尺寸（＋32mm）" value={`${x} mm`}/><HomeResultRow label="四片活動出入空間" value={`${e} mm`} highlight/></>}</div>);}},
    {icon:"🔀",title:"折疊四門",color:"#ef4444",comp:()=>{const[w,setW]=useState("");const r=w?(parseFloat(w)-26).toFixed(1):null;return(<div><HomeNumInput label="總寬 W" value={w} onChange={setW} hint="總W－26cm = 出入空間"/>{r&&<HomeResultRow label="出入空間" value={`${r} cm`} highlight/>}</div>);}},
    {icon:"📐",title:"L型二門出入空間",color:"#ec4899",comp:()=>{const[lw,setLw]=useState("");const[rw,setRw]=useState("");const l=parseFloat(lw),r=parseFloat(rw);const lr=lw?((l-80)/2).toFixed(1):null;const rr=rw?((r-80)/2).toFixed(1):null;const diag=lw&&rw?(lw===rw?(((l-80)/2)*1.414).toFixed(1):Math.sqrt(Math.pow((l-80)/2,2)+Math.pow((r-80)/2,2)).toFixed(1)):null;return(<div><HomeNumInput label="左邊總寬 W" unit="mm" value={lw} onChange={setLw}/><HomeNumInput label="右邊總寬 W" unit="mm" value={rw} onChange={setRw}/>{lr&&<HomeResultRow label="左出入尺寸" value={`${lr} mm`}/>}{rr&&<HomeResultRow label="右出入尺寸" value={`${rr} mm`} highlight/>}{diag&&<HomeResultRow label="對角出入空間" value={`${diag} mm`} highlight/>}</div>);}},
    {icon:"⭐",title:"折門深度 & 鎖位置",color:"#f97316",comp:()=>{const[w,setW]=useState("");const d=w?((parseFloat(w)-12)/2+6).toFixed(1):null;return(<div><HomeNumInput label="總寬 W" value={w} onChange={setW} hint="(總W－12cm)÷2＋6cm = 折門深度"/>{d&&<HomeResultRow label="折門深度" value={`${d} cm`} highlight/>}<HomeResultRow label="折門鎖位置" value="從下往上 90 cm" highlight/></div>);}},
  ];
  return(
    <div style={{display:"flex",flexDirection:"column",gap:14}}>
      <div style={{display:"flex",alignItems:"center",gap:14,background:"linear-gradient(135deg,#1e3a5f,#1a1f2e)",border:"1px solid #2563eb44",borderLeft:"4px solid #3b82f6",borderRadius:12,padding:"16px 20px"}}>
        <span style={{fontSize:32}}>📐</span>
        <div><div style={{fontWeight:700,fontSize:17}}>拉門出入空間計算秘笈</div><div style={{fontSize:12,color:"#64748b",marginTop:3}}>選擇門型 → 輸入總寬 → 即時結果</div></div>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(300px,1fr))",gap:10}}>
        {calcs.map(({icon,title,color,comp:Comp})=>(
          <HomeCalcCard key={title} icon={icon} title={title} color={color}><Comp/></HomeCalcCard>
        ))}
      </div>
    </div>
  );
}

function HomePage(){
  const [currentUser,setCurrentUser]=useState("行政A");
  const [messages,setMessages]=useState([]);
  const [todos,setTodos]=useState([]);
  const [msgInput,setMsgInput]=useState("");
  const [todoInput,setTodoInput]=useState("");
  const [todoAssignee,setTodoAssignee]=useState("行政A");
  const [todoPriority,setTodoPriority]=useState("中");
  const [homeTab,setHomeTab]=useState("board");
  const [filter,setFilter]=useState("全部");
  const msgEndRef=useRef(null);

  useEffect(()=>{
    sb.getAll("messages").then(rows=>{if(rows&&rows.length)setMessages(rows.map(r=>r.data).sort((a,b)=>new Date(a.time)-new Date(b.time)));else setMessages(HOME_SEED_MSGS);});
    sb.getAll("todos").then(rows=>{if(rows&&rows.length)setTodos(rows.map(r=>r.data));else setTodos(HOME_SEED_TODOS);});
  },[]);

  useEffect(()=>{if(homeTab==="board")msgEndRef.current?.scrollIntoView({behavior:"smooth"});},[messages,homeTab]);

  function sendMsg(){const text=msgInput.trim();if(!text)return;const m={id:Math.floor(Date.now()/1000),user:currentUser,text,time:new Date().toISOString(),pinned:false};setMessages(p=>[...p,m]);setMsgInput("");sb.upsert("messages",{id:m.id,data:m});}
  function pinMsg(id){setMessages(p=>p.map(m=>{if(m.id!==id)return m;const u={...m,pinned:!m.pinned};sb.upsert("messages",{id:u.id,data:u});return u;}));}
  function deleteMsg(id){setMessages(p=>p.filter(m=>m.id!==id));sb.delete("messages",id);}
  function addTodo(){const text=todoInput.trim();if(!text)return;const t={id:Math.floor(Date.now()/1000),text,done:false,priority:todoPriority,assignee:todoAssignee,time:new Date().toISOString()};setTodos(p=>[t,...p]);setTodoInput("");sb.upsert("todos",{id:t.id,data:t});}
  function toggleTodo(id){setTodos(p=>p.map(t=>{if(t.id!==id)return t;const u={...t,done:!t.done};sb.upsert("todos",{id:u.id,data:u});return u;}));}
  function deleteTodo(id){setTodos(p=>p.filter(t=>t.id!==id));sb.delete("todos",id);}

  const pinnedMsgs=messages.filter(m=>m.pinned);
  const normalMsgs=messages.filter(m=>!m.pinned);
  const filteredTodos=filter==="全部"?todos:filter==="未完成"?todos.filter(t=>!t.done):todos.filter(t=>t.assignee===filter);
  const pendingCount=todos.filter(t=>!t.done).length;

  const dark="#0f1117";const dark2="#161b2e";const dark3="#1a1f2e";const border="#1e2740";const border2="#2e3a5c";const muted="#64748b";const text="#e2e8f0";

  return(
    <div style={{background:dark,minHeight:"100vh",color:text,fontFamily:ff}}>
      <style>{`@keyframes fadeUp{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}} .hm-bubble{animation:fadeUp .2s ease both} .hm-todo{animation:fadeUp .15s ease both} ::-webkit-scrollbar{width:5px} ::-webkit-scrollbar-track{background:${dark}} ::-webkit-scrollbar-thumb{background:#2e3650;border-radius:3px}`}</style>
      <div style={{background:dark2,borderBottom:`1px solid ${border}`,padding:"10px 20px",display:"flex",alignItems:"center",gap:10}}>
        <span style={{fontSize:12,color:muted}}>目前使用者</span>
        <select value={currentUser} onChange={e=>setCurrentUser(e.target.value)} style={{background:"#1e2740",border:`1.5px solid ${HOME_USER_COLORS[currentUser]}`,borderRadius:7,color:text,padding:"5px 10px",fontSize:13,cursor:"pointer",fontFamily:ff}}>
          {HOME_USERS.map(u=><option key={u}>{u}</option>)}
        </select>
        <div style={{width:9,height:9,borderRadius:"50%",background:HOME_USER_COLORS[currentUser]}}/>
        <div style={{marginLeft:"auto",display:"flex",gap:3}}>
          {[["board","📋 留言板",pinnedMsgs.length],["todo","✅ 代辦",pendingCount],["secret","📐 秘笈",0]].map(([k,l,c])=>(
            <button key={k} onClick={()=>setHomeTab(k)} style={{background:homeTab===k?"#1e2740":"transparent",border:"none",borderBottom:`2px solid ${homeTab===k?"#3b82f6":"transparent"}`,color:homeTab===k?text:muted,padding:"6px 14px",fontSize:13,cursor:"pointer",fontFamily:ff,borderRadius:"5px 5px 0 0",display:"flex",alignItems:"center",gap:5}}>
              {l}{c>0&&<span style={{background:k==="todo"?"#e74c3c":"#f39c12",color:"#fff",borderRadius:10,padding:"1px 5px",fontSize:10,fontWeight:700}}>{c}</span>}
            </button>
          ))}
        </div>
      </div>
      <div style={{padding:"16px 20px",maxWidth:800,margin:"0 auto"}}>
        {homeTab==="board"&&(
          <div style={{display:"flex",flexDirection:"column",gap:14}}>
            {pinnedMsgs.length>0&&(
              <div style={{background:dark3,border:"1px solid #f39c1233",borderLeft:"3px solid #f39c12",borderRadius:10,padding:14}}>
                <div style={{fontSize:11,color:muted,marginBottom:8,letterSpacing:1}}>📌 置頂訊息</div>
                {pinnedMsgs.map(m=><div key={m.id} className="hm-bubble" style={{marginBottom:8}}><HomeMsgBubble m={m} currentUser={currentUser} onPin={pinMsg} onDelete={deleteMsg}/></div>)}
              </div>
            )}
            <div style={{background:dark3,border:`1px solid ${border}`,borderRadius:10,padding:14,display:"flex",flexDirection:"column",gap:10}}>
              <div style={{fontSize:11,color:muted,letterSpacing:1}}>💬 留言板</div>
              <div style={{maxHeight:380,overflowY:"auto",display:"flex",flexDirection:"column",gap:10,paddingRight:4}}>
                {normalMsgs.map(m=><div key={m.id} className="hm-bubble"><HomeMsgBubble m={m} currentUser={currentUser} onPin={pinMsg} onDelete={deleteMsg}/></div>)}
                <div ref={msgEndRef}/>
              </div>
              <div style={{display:"flex",alignItems:"flex-end",gap:10,borderTop:`1px solid ${border}`,paddingTop:12}}>
                <div style={{width:32,height:32,borderRadius:"50%",background:HOME_USER_COLORS[currentUser],display:"flex",alignItems:"center",justifyContent:"center",fontWeight:700,fontSize:13,color:"#fff",flexShrink:0}}>{currentUser[0]}</div>
                <textarea value={msgInput} onChange={e=>setMsgInput(e.target.value)} onKeyDown={e=>{if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();sendMsg();}}} placeholder="輸入訊息… Enter 送出 / Shift+Enter 換行" rows={2} style={{flex:1,background:"#111827",border:`1px solid ${border2}`,borderRadius:8,color:text,padding:"8px 12px",fontSize:13,resize:"none",fontFamily:ff,lineHeight:1.5}}/>
                <button onClick={sendMsg} style={{background:"#1d4ed8",border:"none",borderRadius:8,color:"#fff",padding:"8px 16px",fontSize:13,cursor:"pointer",fontFamily:ff,fontWeight:600,height:36,flexShrink:0}}>送出</button>
              </div>
            </div>
          </div>
        )}
        {homeTab==="todo"&&(
          <div style={{display:"flex",flexDirection:"column",gap:14}}>
            <div style={{background:dark3,border:`1px solid ${border}`,borderRadius:10,padding:14}}>
              <div style={{fontSize:11,color:muted,marginBottom:10,letterSpacing:1}}>＋ 新增代辦</div>
              <input value={todoInput} onChange={e=>setTodoInput(e.target.value)} onKeyDown={e=>{if(e.key==="Enter")addTodo();}} placeholder="代辦事項內容…" style={{width:"100%",background:"#111827",border:`1px solid ${border2}`,borderRadius:8,color:text,padding:"9px 14px",fontSize:13,fontFamily:ff,marginBottom:10,boxSizing:"border-box"}}/>
              <div style={{display:"flex",alignItems:"center",gap:10,flexWrap:"wrap"}}>
                <div style={{display:"flex",alignItems:"center",gap:6}}><span style={{fontSize:12,color:muted}}>負責人</span><select value={todoAssignee} onChange={e=>setTodoAssignee(e.target.value)} style={{background:"#111827",border:`1px solid ${border2}`,borderRadius:6,color:text,padding:"5px 9px",fontSize:12,fontFamily:ff}}>{HOME_USERS.map(u=><option key={u}>{u}</option>)}</select></div>
                <div style={{display:"flex",alignItems:"center",gap:6}}><span style={{fontSize:12,color:muted}}>優先度</span><select value={todoPriority} onChange={e=>setTodoPriority(e.target.value)} style={{background:"#111827",border:`1px solid ${border2}`,borderRadius:6,color:HOME_PRIORITY[todoPriority],padding:"5px 9px",fontSize:12,fontFamily:ff}}>{Object.keys(HOME_PRIORITY).map(p=><option key={p}>{p}</option>)}</select></div>
                <button onClick={addTodo} style={{marginLeft:"auto",background:"#1d4ed8",border:"none",borderRadius:8,color:"#fff",padding:"7px 20px",fontSize:13,cursor:"pointer",fontFamily:ff,fontWeight:600}}>新增</button>
              </div>
            </div>
            <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
              {["全部","未完成",...HOME_USERS].map(f=>(
                <button key={f} onClick={()=>setFilter(f)} style={{background:filter===f?(HOME_USER_COLORS[f]?HOME_USER_COLORS[f]+"22":"#1e2740"):"transparent",border:`1px solid ${filter===f?(HOME_USER_COLORS[f]||"#3b82f6"):"#2e3a5c"}`,borderRadius:20,color:filter===f?(HOME_USER_COLORS[f]||text):muted,padding:"4px 12px",fontSize:12,cursor:"pointer",fontFamily:ff}}>{f}</button>
              ))}
            </div>
            <div style={{display:"flex",gap:10}}>
              {[["全部",todos.length,"#64748b"],["待完成",todos.filter(t=>!t.done).length,"#e74c3c"],["已完成",todos.filter(t=>t.done).length,"#27ae60"]].map(([l,v,c])=>(
                <div key={l} style={{flex:1,background:dark3,border:`1px solid ${c}`,borderRadius:10,padding:"12px 16px",textAlign:"center"}}>
                  <div style={{fontSize:26,fontWeight:700,color:c,fontFamily:"monospace"}}>{v}</div>
                  <div style={{fontSize:11,color:muted,marginTop:2}}>{l}</div>
                </div>
              ))}
            </div>
            <div style={{display:"flex",flexDirection:"column",gap:8}}>
              {filteredTodos.length===0&&<div style={{textAlign:"center",color:muted,padding:"40px 0",fontSize:15}}>暫無代辦事項 🎉</div>}
              {filteredTodos.map((t,i)=>(
                <div key={t.id} className="hm-todo" style={{display:"flex",alignItems:"center",gap:12,background:dark3,border:`1px solid ${border}`,borderRadius:10,padding:"12px 14px",opacity:t.done?0.55:1,animationDelay:`${i*0.04}s`}}>
                  <button onClick={()=>toggleTodo(t.id)} style={{width:22,height:22,border:`2px solid ${t.done?"#27ae60":"#2e3a5c"}`,borderRadius:6,background:t.done?"#27ae6033":"transparent",color:"#27ae60",fontSize:13,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,fontWeight:700}}>{t.done&&"✓"}</button>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{fontSize:13,lineHeight:1.4,color:t.done?"#475569":text,textDecoration:t.done?"line-through":"none",marginBottom:4}}>{t.text}</div>
                    <div style={{display:"flex",alignItems:"center",gap:6,flexWrap:"wrap"}}>
                      <span style={{fontSize:11,borderRadius:4,padding:"2px 7px",fontWeight:600,background:HOME_PRIORITY[t.priority]+"22",color:HOME_PRIORITY[t.priority]}}>{t.priority}優先</span>
                      <span style={{fontSize:11,borderRadius:4,padding:"2px 7px",fontWeight:600,background:(HOME_USER_COLORS[t.assignee]||"#555")+"22",color:HOME_USER_COLORS[t.assignee]||"#aaa"}}>{t.assignee}</span>
                      <span style={{fontSize:11,color:"#475569",fontFamily:"monospace"}}>{homeFormatTime(t.time)}</span>
                    </div>
                  </div>
                  <button onClick={()=>deleteTodo(t.id)} style={{background:"transparent",border:"none",color:"#475569",cursor:"pointer",fontSize:13,padding:"4px 6px"}}>✕</button>
                </div>
              ))}
            </div>
          </div>
        )}
        {homeTab==="secret"&&<HomeSecretTab/>}
      </div>
    </div>
  );
}

// ─── 固定片定價表 ──────────────────────────────────────────────────────────────
const FP_PS = {
  "白/牙色": {140:[2000,2000,2200,2200,2400,2400,2600,2800,3000,3200],150:[2000,2000,2200,2200,2400,2400,2600,2800,3000,3200],160:[2200,2200,2400,2400,2600,2600,2800,3000,3200,3400],170:[2200,2200,2400,2400,2600,2600,2800,3000,3200,3400],180:[2400,2400,2600,2600,2800,2800,3000,3200,3400,3600],190:[2400,2400,2600,2600,2800,2800,3000,3200,3400,4200],200:[2800,2800,3000,3000,3200,3200,3400,3600,3800,4600],210:[3000,3000,3200,3200,3400,3400,3600,4000,4200,5000]},
  "銀色": {140:[2200,2200,2400,2400,2600,2600,2800,3000,3200,3400],150:[2200,2200,2400,2400,2600,2600,2800,3000,3200,3400],160:[2400,2400,2600,2600,2800,2800,3000,3200,3400,3600],170:[2400,2400,2600,2600,2800,2800,3000,3200,3400,3600],180:[2600,2600,2800,2800,3000,3000,3200,3400,3600,3800],190:[2600,2600,2800,2800,3000,3000,3200,3400,3600,4400],200:[3000,3000,3200,3200,3400,3400,3600,3800,4000,4800],210:[3200,3200,3400,3400,3600,3600,3800,4200,4400,5200]},
  "黑色": {140:[3000,3000,3200,3200,3400,3400,3600,3800,4000,4200],150:[3000,3000,3200,3200,3400,3400,3600,3800,4000,4200],160:[3200,3200,3400,3400,3600,3600,3800,4000,4200,4400],170:[3200,3200,3400,3400,3600,3600,3800,4000,4200,4400],180:[3400,3400,3600,3600,3800,3800,4000,4200,4400,4600],190:[3400,3400,3600,3600,3800,3800,4000,4200,4400,5200],200:[3800,3800,4000,4000,4200,4200,4400,4600,4800,5600],210:[4000,4000,4200,4200,4400,4400,4600,5000,5200,6000]},
};
const FP_GLASS = {
  "白/牙色": {140:[3400,3800,4200,4600,5200,5600,6200,6800,7400,8000],150:[3600,4000,4400,4800,5400,5800,6400,7000,7600,8200],160:[4000,4400,4800,5200,5800,6400,7000,7800,8400,9000],170:[4200,4600,5000,5400,6000,6600,7200,8000,8600,9200],180:[4800,5200,5800,6200,6800,7400,8200,9000,9600,10200],190:[5000,5400,6000,6400,7000,7600,8400,9200,9800,10400],200:[5800,6200,6800,7200,8000,8600,9400,10400,11000,11800],210:[6400,6800,7400,7800,8600,9200,10000,11000,11600,12400]},
  "銀色": {140:[3600,4000,4400,4800,5400,5800,6400,7000,7600,8200],150:[3800,4200,4600,5000,5600,6000,6600,7200,7800,8400],160:[4200,4600,5000,5400,6000,6600,7200,8000,8600,9200],170:[4400,4800,5200,5600,6200,6800,7400,8200,8800,9400],180:[5000,5400,6000,6400,7000,7600,8400,9200,9800,10400],190:[5200,5600,6200,6600,7200,7800,8600,9400,10000,10600],200:[6000,6400,7000,7400,8200,8800,9600,10600,11200,12000],210:[6600,7000,7600,8000,8800,9400,10200,11200,11800,12600]},
  "黑色": {140:[4400,4800,5200,5600,6200,6600,7200,7800,8400,9000],150:[4600,5000,5400,5800,6400,6800,7400,8000,8600,9200],160:[5000,5400,5800,6200,6800,7400,8000,8800,9400,10000],170:[5200,5600,6000,6400,7000,7600,8200,9000,9600,10200],180:[5800,6200,6800,7200,7800,8400,9200,10000,10600,11200],190:[6000,6400,7000,7400,8000,8600,9400,10200,10800,11400],200:[6800,7200,7800,8200,9000,9600,10400,11400,12000,12800],210:[7400,7800,8400,8800,9600,10200,11000,12000,12600,13400]},
};
const FP_SILVERFROST = {
  "白/牙色": {140:[4200,4600,5100,5500,6200,6600,7200,7900,8600,9300],150:[4400,4800,5300,5700,6400,6800,7400,8100,8800,9500],160:[4900,5300,5800,6200,6800,7500,8200,9100,9800,10400],170:[5100,5500,6000,6400,7000,7700,8400,9300,10000,10600],180:[5800,6200,6800,7200,7900,8600,9500,10400,11000,11700],190:[6000,6400,7000,7400,8100,8800,9700,10600,11200,11900],200:[6900,7300,8000,8400,9300,10000,10800,11900,12600,13500],210:[7600,8000,8700,9100,10000,10600,11500,12600,13300,14200]},
  "銀色": {140:[4400,4800,5300,5700,6400,6800,7400,8100,8800,9500],150:[4600,5000,5500,5900,6600,7000,7600,8300,9000,9700],160:[5100,5500,6000,6400,7000,7700,8400,9300,10000,10600],170:[5300,5700,6200,6600,7200,7900,8600,9500,10200,10800],180:[6000,6400,7000,7400,8100,8800,9700,10600,11200,11900],190:[6200,6600,7200,7600,8300,9000,9900,10800,11400,12100],200:[7100,7500,8200,8600,9500,10200,11000,12100,12800,13700],210:[7800,8200,8900,9300,10200,10800,11700,12800,13500,14400]},
  "黑色": {140:[5200,5600,6100,6500,7200,7600,8200,8900,9600,10300],150:[5400,5800,6300,6700,7400,7800,8400,9100,9800,10500],160:[5900,6300,6800,7200,7800,8500,9200,10100,10800,11400],170:[6100,6500,7000,7400,8000,8700,9400,10300,11000,11600],180:[6800,7200,7800,8200,8900,9600,10500,11400,12000,12700],190:[7000,7400,8000,8400,9100,9800,10700,11600,12200,12900],200:[7900,8300,9000,9400,10300,11000,11800,12900,13600,14500],210:[8600,9000,9700,10100,11000,11600,12500,13600,14300,15200]},
};
const FP_W_KEYS=[30,40,50,60,70,80,90,100,110,120];
const FP_H_KEYS=[140,150,160,170,180,190,200,210];

function roundTen(cm){const r=cm%10;return r<5?cm-r:cm-r+10;}
function lookupFP(table,color,wCm,hCm){
  const wR=roundTen(wCm),hR=roundTen(hCm);
  const colKey=["白色","牙色"].includes(color)?"白/牙色":color;
  const rows=table[colKey];if(!rows)return null;
  const hK=FP_H_KEYS.find(k=>k>=hR)||210;
  const wIdx=FP_W_KEYS.findIndex(k=>k>=wR);
  const wK=wIdx>=0?wIdx:FP_W_KEYS.length-1;
  const row=rows[hK];if(!row)return null;
  return row[wK];
}
const FP_3PS={"白/牙色":{140:[1600,1600,1800,1800,2000,2000,2200,2400,2600,2800],150:[1600,1600,1800,1800,2000,2000,2200,2400,2600,2800],160:[1800,1800,2000,2000,2200,2200,2400,2600,2800,3000],170:[1800,1800,2000,2000,2200,2200,2400,2600,2800,3000],180:[2000,2000,2200,2200,2400,2400,2600,2800,3000,3200],190:[2000,2000,2200,2200,2400,2400,2600,2800,3000,3200],200:[2400,2400,2600,2600,2800,2800,3000,3200,3400,3600],210:[2600,2600,2800,2800,3000,3000,3200,3600,3800,4000]},"銀色":{140:[1800,1800,2000,2000,2200,2200,2400,2600,2800,3000],150:[1800,1800,2000,2000,2200,2200,2400,2600,2800,3000],160:[2000,2000,2200,2200,2400,2400,2600,2800,3000,3200],170:[2000,2000,2200,2200,2400,2400,2600,2800,3000,3200],180:[2200,2200,2400,2400,2600,2600,2800,3000,3200,3400],190:[2200,2200,2400,2400,2600,2600,2800,3000,3200,3400],200:[2600,2600,2800,2800,3000,3000,3200,3400,3600,3800],210:[2800,2800,3000,3000,3200,3200,3400,3800,4000,4200]},"黑色":{140:[2600,2600,2800,2800,3000,3000,3200,3400,3600,3800],150:[2600,2600,2800,2800,3000,3000,3200,3400,3600,3800],160:[2800,2800,3000,3000,3200,3200,3400,3600,3800,4000],170:[2800,2800,3000,3000,3200,3200,3400,3600,3800,4000],180:[3000,3000,3200,3200,3400,3400,3600,3800,4000,4200],190:[3000,3000,3200,3200,3400,3400,3600,3800,4000,4200],200:[3400,3400,3600,3600,3800,3800,4000,4200,4400,4600],210:[3600,3600,3800,3800,4000,4000,4200,4600,4800,5000]}};
const FP_5GLASS={"白/牙色":{140:[2000,2000,2200,2200,2400,2400,2600,2800,3000,3200],150:[2000,2000,2200,2200,2400,2400,2600,2800,3000,3200],160:[2200,2200,2400,2400,2600,2600,2800,3200,3400,3600],170:[2200,2200,2400,2400,2600,2600,2800,3200,3400,3600],180:[2400,2400,2600,2600,2800,2800,3000,3400,3600,3800],190:[2400,2400,2600,2600,2800,2800,3000,3400,3600,3800],200:[2800,2800,3000,3000,3200,3200,3400,3800,4000,4200],210:[3200,3200,3400,3400,3600,3600,3800,4200,4400,4600]},"銀色":{140:[2200,2200,2400,2400,2600,2600,2800,3000,3200,3400],150:[2200,2200,2400,2400,2600,2600,2800,3000,3200,3400],160:[2400,2400,2600,2600,2800,2800,3000,3400,3600,3800],170:[2400,2400,2600,2600,2800,2800,3000,3400,3600,3800],180:[2600,2600,2800,2800,3000,3000,3200,3600,3800,4000],190:[2600,2600,2800,2800,3000,3000,3200,3600,3800,4000],200:[3000,3000,3200,3200,3400,3400,3600,4000,4200,4400],210:[3400,3400,3600,3600,3800,3800,4000,4400,4600,4800]},"黑色":{140:[3000,3000,3200,3200,3400,3400,3600,3800,4000,4200],150:[3000,3000,3200,3200,3400,3400,3600,3800,4000,4200],160:[3200,3200,3400,3400,3600,3600,3800,4200,4400,4600],170:[3200,3200,3400,3400,3600,3600,3800,4200,4400,4600],180:[3400,3400,3600,3600,3800,3800,4000,4400,4600,4800],190:[3400,3400,3600,3600,3800,3800,4000,4400,4600,4800],200:[3800,3800,4000,4000,4200,4200,4400,4800,5000,5200],210:[4200,4200,4400,4400,4600,4600,4800,5200,5400,5600]}};
const FP_5SF={"白/牙色":{140:[2800,2800,3080,3080,3360,3360,3640,3920,4200,4480],150:[2800,2800,3080,3080,3360,3360,3640,3920,4200,4480],160:[3080,3080,3360,3360,3640,3640,3920,4480,4760,5040],170:[3080,3080,3360,3360,3640,3640,3920,4480,4760,5040],180:[3360,3360,3640,3640,3920,3920,4200,4760,5040,5320],190:[3360,3360,3640,3640,3920,3920,4200,4760,5040,5320],200:[3920,3920,4200,4200,4480,4480,4760,5320,5600,5880],210:[4480,4480,4760,4760,5040,5040,5320,5880,6160,6440]},"銀色":{140:[3080,3080,3360,3360,3640,3640,3920,4200,4480,4760],150:[3080,3080,3360,3360,3640,3640,3920,4200,4480,4760],160:[3360,3360,3640,3640,3920,3920,4200,4760,5040,5320],170:[3360,3360,3640,3640,3920,3920,4200,4760,5040,5320],180:[3640,3640,3920,3920,4200,4200,4480,5040,5320,5600],190:[3640,3640,3920,3920,4200,4200,4480,5040,5320,5600],200:[4200,4200,4480,4480,4760,4760,5040,5600,5880,6160],210:[4760,4760,5040,5040,5320,5320,5600,6160,6440,6720]},"黑色":{140:[4200,4200,4480,4480,4760,4760,5040,5320,5600,5880],150:[4200,4200,4480,4480,4760,4760,5040,5320,5600,5880],160:[4480,4480,4760,4760,5040,5040,5320,5880,6160,6440],170:[4480,4480,4760,4760,5040,5040,5320,5880,6160,6440],180:[4760,4760,5040,5040,5320,5320,5600,6160,6440,6720],190:[4760,4760,5040,5040,5320,5320,5600,6160,6440,6720],200:[5320,5320,5600,5600,5880,5880,6160,6720,7000,7280],210:[5880,5880,6160,6160,6440,6440,6720,7280,7560,7840]}};
function calcFixedPlate({material,color,wMm,hMm}){
  const wCm=wMm/10,hCm=hMm/10;
  const matKey=["5mmPS101","5mmPS503","5mmPS501"].includes(material)?"5PS":["3mmPS101","3mmPS503","3mmPS501"].includes(material)?"3PS":["5mm強化清玻貼清膜","5mm強化清玻貼砂膜"].includes(material)?"5GLASS":"5SF";
  const table=matKey==="5PS"?FP_PS:matKey==="3PS"?FP_3PS:matKey==="5GLASS"?FP_5GLASS:FP_5SF;
  return lookupFP(table,color,wCm,hCm);
}

const lbl = { display:"block", fontSize:12, fontWeight:600, color:"#374151", marginBottom:5 };
const inp = { width:"100%", padding:"8px 12px", borderRadius:8, border:"1.5px solid #E5E7EB", fontSize:13, outline:"none", fontFamily:ff, boxSizing:"border-box", color:"#111", background:"#fff" };
const sel = { ...inp, cursor:"pointer", background:"#fff" };
const iBtn = { width:32, height:32, borderRadius:8, border:"1px solid #E5E7EB", background:"#fff", cursor:"pointer", fontSize:16, display:"flex", alignItems:"center", justifyContent:"center" };

const MASTERS = {
  qingyang: { id:"qingyang", name:"余青陽", region:"北部", payType:"月結", color:"#3B82F6", light:"#DBEAFE", dark:"#1D4ED8", avatar:"余", payMode:"monthly",
    areas:{ 宜蘭:{delivery:500,install:2500,reinstall:4500}, 基隆:{delivery:350,install:2200,reinstall:4000}, 台北:{delivery:350,install:2000,reinstall:4000}, 新北:{delivery:350,install:2000,reinstall:4000}, 桃園:{delivery:350,install:2200,reinstall:4200} } },
  laiyanming: { id:"laiyanming", name:"賴彥銘", region:"中部", payType:"現領", color:"#059669", light:"#D1FAE5", dark:"#065F46", avatar:"賴", payMode:"perJob",
    areas:{ 新竹:{delivery:null,install:3200,reinstall:5200,noService:["竹北","湖口","新豐","尖石","五峰"]}, 苗栗:{delivery:null,install:2700,reinstall:4700,noService:["泰安","大湖","南庄","獅潭","卓蘭"]}, 台中:{delivery:500,install:2200,reinstall:4200,noService:["東勢","新社","石岡","大安","和平"]}, 南投:{delivery:800,install:2200,reinstall:4200,noService:["信義","仁愛","魚池","鹿谷"]}, 彰化:{delivery:500,install:2200,reinstall:4200,noService:["芬園","二水山區"]}, 雲林:{delivery:null,install:2700,reinstall:4700,noService:["古坑","林內","草嶺"]}, 嘉義:{delivery:null,install:3200,reinstall:5200,noService:["阿里山那邊"]} } },
  guo: { id:"guo", name:"郭師傅", region:"南部", payType:"現領", color:"#D97706", light:"#FEF3C7", dark:"#92400E", avatar:"郭", payMode:"transfer",
    areas:{ 台南:{delivery:600,install:2500,reinstall:4500}, 高雄:{delivery:400,install:2000,reinstall:4000}, 屏東:{delivery:400,install:2000,reinstall:4000} } },
  jinn: { id:"jinn", name:"進南貨運", region:"寄送", payType:"運費", color:"#6366f1", light:"#EEF2FF", dark:"#3730a3", avatar:"進", payMode:"shipping",
    areas:{ 全台:{delivery:500,install:0,reinstall:0} } },
  pickup: { id:"pickup", name:"自取", region:"自取", payType:"無", color:"#64748b", light:"#F1F5F9", dark:"#334155", avatar:"取", payMode:"none",
    areas:{ 自取:{delivery:0,install:0,reinstall:0} } },
};
const STATUS_CFG = { 待確認:{color:"#6B7280",dot:"#9CA3AF"}, 已確認:{color:"#2563EB",dot:"#3B82F6"}, 進行中:{color:"#D97706",dot:"#F59E0B"}, 完成:{color:"#059669",dot:"#10B981"}, 取消:{color:"#DC2626",dot:"#EF4444"} };

function calcWage(master, area, jobType, floor=1, hasThreshold=false, isLType=false, hasFixedPlate=false, hasThresholdReplace=false, extras=[], extraCustom=0, hasElevator=false) {
  const a = master.areas[area]; if(!a) return null;
  let base = jobType==="安裝"?a.install:jobType==="拆裝"?a.reinstall:(a.delivery??0);
  let list=[];
  if(!hasElevator&&floor>=4) list.push({label:`${floor}F樓層費`,amt:(floor-3)*300});
  if(hasThreshold&&jobType!=="純配送") list.push({label:"裝新門檻",amt:200});
  if(hasThresholdReplace&&jobType!=="純配送") list.push({label:"拆舊裝新門檻",amt:500});
  if(master.id==="qingyang"){ if(isLType)list.push({label:"L型二門",amt:200}); if(hasFixedPlate)list.push({label:"固定片",amt:200}); }
  (extras||[]).forEach(amt=>list.push({label:`加項$${amt}`,amt}));
  if(extraCustom) list.push({label:`自填$${extraCustom}`,amt:Number(extraCustom)});
  const ext=list.reduce((s,x)=>s+x.amt,0);
  return {base,extras:ext,extrasList:list,total:base+ext};
}

function detectArea(address, masterId) {
  const master=MASTERS[masterId]; const areas=Object.keys(master.areas);
  const MAP={宜蘭:["宜蘭"],基隆:["基隆"],台北:["台北"],新北:["新北","板橋","三重","中和","永和","新莊","新店","土城","蘆洲","樹林","汐止","淡水"],桃園:["桃園","中壢","平鎮","八德","楊梅","蘆竹","龜山"],新竹:["新竹","竹北","竹東"],苗栗:["苗栗","頭份","竹南"],台中:["台中","豐原","大里","太平","清水","沙鹿"],南投:["南投","埔里","草屯"],彰化:["彰化","員林","鹿港"],雲林:["雲林","斗六","虎尾"],嘉義:["嘉義","朴子","民雄"],台南:["台南","新營","善化"],高雄:["高雄","鳳山","岡山","路竹"],屏東:["屏東","潮州","東港"]};
  for(const[area,kws]of Object.entries(MAP)){if(areas.includes(area)&&kws.some(k=>address.includes(k)))return area;}
  return null;
}

function fmt(n){return"$"+(n||0).toLocaleString();}
function getDaysInMonth(y,m){return new Date(y,m+1,0).getDate();}
function getFirstDay(y,m){return new Date(y,m,1).getDay();}
function padDate(y,m,d){return`${y}-${String(m+1).padStart(2,"0")}-${String(d).padStart(2,"0")}`;}
const today=new Date();
const todayStr=padDate(today.getFullYear(),today.getMonth(),today.getDate());

const CB=({label,checked,onChange,color})=>(
  <label style={{display:"flex",alignItems:"center",gap:6,cursor:"pointer",fontSize:13,userSelect:"none"}}>
    <input type="checkbox" checked={checked} onChange={e=>onChange(e.target.checked)} style={{accentColor:color,width:15,height:15}}/>
    {label}
  </label>
);
const Chip=({children,color,bg})=>(<span style={{padding:"2px 8px",borderRadius:20,fontSize:11,fontWeight:700,color,background:bg||color+"18",border:"1px solid "+color+"40"}}>{children}</span>);

function Modal({onClose,children,width=500}){
  return(
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.45)",zIndex:500,display:"flex",alignItems:"center",justifyContent:"center",backdropFilter:"blur(4px)"}} onClick={onClose}>
      <div onClick={e=>e.stopPropagation()} style={{background:"#fff",color:"#111",borderRadius:18,width,maxWidth:"95vw",maxHeight:"88vh",display:"flex",flexDirection:"column",overflow:"hidden",boxShadow:"0 24px 60px rgba(0,0,0,0.22)",fontFamily:ff,colorScheme:"light"}}>
        {children}
      </div>
    </div>
  );
}

function PayLine({order,master,wage,onUpdate}){
  if(!wage||order.status==="取消") return null;
  if(master.payMode==="transfer") return order.transferDate?(
    <div style={{marginTop:8,display:"flex",alignItems:"center",gap:8,fontSize:11}}>
      <span style={{color:"#059669",fontWeight:700,background:"#D1FAE5",padding:"2px 8px",borderRadius:20}}>✅ 已匯款 {order.transferDate}</span>
      <button onClick={e=>{e.stopPropagation();onUpdate(order.id,{transferDate:null});}} style={{fontSize:10,color:"#9CA3AF",background:"none",border:"none",cursor:"pointer"}}>撤銷</button>
    </div>
  ):(
    <button onClick={e=>{e.stopPropagation();const date=prompt("匯款日期（YYYY/MM/DD）",new Date().toLocaleDateString("zh-TW"));if(date)onUpdate(order.id,{transferDate:date});}} style={{marginTop:8,padding:"3px 12px",borderRadius:20,border:"1.5px solid "+master.color,background:"#fff",color:master.dark,fontSize:11,fontWeight:700,cursor:"pointer",fontFamily:ff}}>💸 記錄匯款</button>
  );
  if(master.payMode==="perJob"){const paid=order.wagePayStatus==="已付清";return(<button onClick={e=>{e.stopPropagation();onUpdate(order.id,{wagePayStatus:paid?"待付":"已付清"});}} style={{marginTop:8,padding:"3px 12px",borderRadius:20,border:"1.5px solid "+(paid?"#059669":master.color),background:paid?"#D1FAE5":"#fff",color:paid?"#065F46":master.dark,fontSize:11,fontWeight:700,cursor:"pointer",fontFamily:ff,display:"block"}}>{paid?"✅ 已付清":"⏳ 標記已付"}</button>);}
  if(master.payMode==="monthly"){const d=order.date?new Date(order.date+"T00:00:00"):null;const ym=d?`${d.getFullYear()}/${String(d.getMonth()+1).padStart(2,"0")}`:"";return(<div style={{marginTop:8,fontSize:11,color:master.dark,fontWeight:700}}>📅 {ym} 月結</div>);}
  return null;
}

function roundTo100(mm){const r=mm%100;return r<45?mm-r:mm-r+100;}
function fmtMoney(n){return(n||0).toLocaleString("zh-TW");}
function getTodayStr(){return new Date().toISOString().slice(0,10).replace(/-/g,"/");}
function addDays(s,d){const dt=new Date(s.replace(/\//g,"-"));dt.setDate(dt.getDate()+d);return dt.toISOString().slice(0,10).replace(/-/g,"/");}

const FRAMED_BASE={
  "一字二門":{stdW:1500,stdH:1900,prices:{"5mmPS板":{"白/牙色":7100,"銀色":9100,"黑色":9600},"3mmPS板":{"白/牙色":6800,"銀色":8800,"黑色":9300},"5mm強化銀霞玻貼清膜":{"白/牙色":14800,"銀色":16800,"黑色":17300},"5mm強化清玻貼清膜":{"白/牙色":11800,"銀色":13800,"黑色":14300},"5mm強化清玻貼砂膜":{"白/牙色":11800,"銀色":13800,"黑色":14300}},surW:{"5mmPS板":200,"3mmPS板":200,"5mm強化銀霞玻貼清膜":400,"5mm強化清玻貼清膜":400,"5mm強化清玻貼砂膜":400},surH:{"5mmPS板":200,"3mmPS板":200,"5mm強化銀霞玻貼清膜":400,"5mm強化清玻貼清膜":400,"5mm強化清玻貼砂膜":400}},
  "一字三門":{stdW:1500,stdH:1900,prices:{"5mmPS板":{"白/牙色":7100,"銀色":9100,"黑色":9600},"3mmPS板":{"白/牙色":6800,"銀色":8800,"黑色":9300},"5mm強化銀霞玻貼清膜":{"白/牙色":14800,"銀色":16800,"黑色":17300},"5mm強化清玻貼清膜":{"白/牙色":11800,"銀色":13800,"黑色":14300},"5mm強化清玻貼砂膜":{"白/牙色":11800,"銀色":13800,"黑色":14300}},surW:{"5mmPS板":200,"3mmPS板":200,"5mm強化銀霞玻貼清膜":400,"5mm強化清玻貼清膜":400,"5mm強化清玻貼砂膜":400},surH:{"5mmPS板":200,"3mmPS板":200,"5mm強化銀霞玻貼清膜":400,"5mm強化清玻貼清膜":400,"5mm強化清玻貼砂膜":400}},
  "一字四門":{stdW:2100,stdH:1900,prices:{"5mmPS板":{"白/牙色":10600,"銀色":12600,"黑色":13100},"3mmPS板":{"白/牙色":10300,"銀色":12300,"黑色":12800},"5mm強化銀霞玻貼清膜":{"白/牙色":19400,"銀色":21400,"黑色":21900},"5mm強化清玻貼清膜":{"白/牙色":16400,"銀色":18400,"黑色":18900},"5mm強化清玻貼砂膜":{"白/牙色":16400,"銀色":18400,"黑色":18900}},surW:{"5mmPS板":200,"3mmPS板":200,"5mm強化銀霞玻貼清膜":400,"5mm強化清玻貼清膜":400,"5mm強化清玻貼砂膜":400},surH:{"5mmPS板":200,"3mmPS板":200,"5mm強化銀霞玻貼清膜":400,"5mm強化清玻貼清膜":400,"5mm強化清玻貼砂膜":400}},
  "L型二門":{stdW:900,stdH:1900,prices:{"5mmPS板":{"白/牙色":10600,"銀色":12600,"黑色":13100},"3mmPS板":{"白/牙色":10300,"銀色":12300,"黑色":12800},"5mm強化銀霞玻貼清膜":{"白/牙色":19400,"銀色":21400,"黑色":21900},"5mm強化清玻貼清膜":{"白/牙色":16400,"銀色":18400,"黑色":18900},"5mm強化清玻貼砂膜":{"白/牙色":16400,"銀色":18400,"黑色":18900}},surW:{"5mmPS板":200,"3mmPS板":200,"5mm強化銀霞玻貼清膜":400,"5mm強化清玻貼清膜":400,"5mm強化清玻貼砂膜":400},surH:{"5mmPS板":200,"3mmPS板":200,"5mm強化銀霞玻貼清膜":400,"5mm強化清玻貼清膜":400,"5mm強化清玻貼砂膜":400},isL:true},
  "摺疊二門":{stdW:900,stdH:1900,prices:{"5mmPS板":{"白/牙色":8600,"銀色":10600,"黑色":11100},"3mmPS板":{"白/牙色":8300,"銀色":10300,"黑色":10800},"5mm強化銀霞玻貼清膜":{"白/牙色":15300,"銀色":17300,"黑色":17800},"5mm強化清玻貼清膜":{"白/牙色":12300,"銀色":14300,"黑色":14800},"5mm強化清玻貼砂膜":{"白/牙色":12300,"銀色":14300,"黑色":14800}},surW:{"5mmPS板":200,"3mmPS板":200,"5mm強化銀霞玻貼清膜":400,"5mm強化清玻貼清膜":400,"5mm強化清玻貼砂膜":400},surH:{"5mmPS板":200,"3mmPS板":200,"5mm強化銀霞玻貼清膜":400,"5mm強化清玻貼清膜":400,"5mm強化清玻貼砂膜":400}},
  "圓弧型":{stdW:900,stdH:1880,prices:{"3mmPS501":{"白色":13800},"5mm強化清玻":{"白色":19800}},surW:{"3mmPS501":200,"5mm強化清玻":400},surH:{},isArc:true},
};
const FRAMELESS_PRICES={
  連動門:{byWidth:{130:{base:17000,fc:3000,fs:3000},150:{base:17000,fc:3500,fs:3500},160:{base:18000,fc:3500,fs:3500},170:{base:19000,fc:3500,fs:4000},180:{base:20000,fc:4000,fs:4000},190:{base:21000,fc:4500,fs:null},200:{base:22000,fc:4500,fs:null}}},
  橫拉門:{byWidth:{130:{base:null,fc:3000},150:{base:13500,fc:3500},160:{base:14500,fc:3500},170:{base:15500,fc:4000},180:{base:16500,fc:4000},190:{base:17500,fc:null},200:{base:18500,fc:null}}},
  開啟門:{byWidth:{130:{base:null,fc:3000},150:{base:11000,fc:3500},160:{base:12000,fc:3500},170:{base:13000,fc:4000},180:{base:14000,fc:4000},190:{base:15000,fc:null},200:{base:16000,fc:null}}},
};

function getWKey(wCm){if(wCm<=130)return 130;if(wCm<=150)return 150;if(wCm<=160)return 160;if(wCm<=170)return 170;if(wCm<=180)return 180;if(wCm<=190)return 190;if(wCm<=200)return 200;return null;}
const rh=(n)=>Math.round(n/100)*100;

const INSTALL_MAP={
  余青陽:{宜蘭:{安裝:2500,拆裝:4500},基隆:{安裝:2200,拆裝:4000},台北:{安裝:2000,拆裝:4000},新北:{安裝:2000,拆裝:4000},桃園:{安裝:2200,拆裝:4200}},
  賴彥銘:{新竹:{安裝:3200,拆裝:5200},苗栗:{安裝:2700,拆裝:4700},台中:{安裝:2200,拆裝:4200},南投:{安裝:2200,拆裝:4200},彰化:{安裝:2200,拆裝:4200},雲林:{安裝:2700,拆裝:4700},嘉義:{安裝:3200,拆裝:5200}},
  郭師傅:{台南:{安裝:2500,拆裝:4500},高雄:{安裝:2000,拆裝:4000},屏東:{安裝:2000,拆裝:4000}},
};
const MASTER_AREAS={余青陽:["宜蘭","基隆","台北","新北","桃園"],賴彥銘:["新竹","苗栗","台中","南投","彰化","雲林","嘉義"],郭師傅:["台南","高雄","屏東"]};

// 從地址抓區名（給賴彥銘用）
function getDistrict(addr){
  const m=addr.match(/[\u4e00-\u9fa5]{2,4}(?:區|鄉|鎮|市)/);
  return m?m[0].replace(/市$/,""):""
}

// 自動產生客單名稱
function genClientName(master,custName,area,addr){
  const name=custName||"";
  if(!master)return name;
  if(master==="進南貨運")return name;
  if(master==="余青陽")return `${name} 寄松成`;
  if(master==="賴彥銘"){const dist=getDistrict(addr)||area||"";return`${dist} ${name}`.trim();}
  if(master==="郭師傅"){
    if(area==="台南")return`${name} 寄台南站`;
    return`${name} 寄高雄站`;
  }
  if(master==="自取")return`${name} 載`;
  return name;
}
const FRAMED_TYPES=["一字二門","一字三門","一字四門","L型二門","摺疊二門","圓弧型","固定片"];
const FRAMELESS_TYPES=["連動門","無框橫移門","無框開啟門"];
const FRAMED_MATS={圓弧型:["3mmPS501","5mm強化清玻"],default:["5mmPS101","5mmPS503","5mmPS501","3mmPS101","3mmPS503","3mmPS501","5mm強化清玻貼清膜","5mm強化清玻貼砂膜","5mm強化銀霞玻貼清膜"]};
const FRAMED_COLS={圓弧型:["白色"],default:["白色","牙色","銀色","黑色"]};

function calcFramed({doorType,material,color,wMm,hMm,wMm2,hasThreshold,thresholdMm,towelBar,fourDoorFull,foldLock,arcShorten,floor,hasElevator,installType,fixplateFee,region,master}){
  const cfg=FRAMED_BASE[doorType];if(!cfg)return null;
  const wR=roundTo100(wMm),hR=roundTo100(hMm),wR2=wMm2?roundTo100(wMm2):null;
  const matKey=["5mmPS101","5mmPS503","5mmPS501"].includes(material)?"5mmPS板":["3mmPS101","3mmPS503","3mmPS501"].includes(material)?(doorType==="圓弧型"?material:"3mmPS板"):material==="5mm強化銀霞玻貼清膜"?"5mm強化銀霞玻貼清膜":material;
  const colKey=(["白色","牙色","白/牙色"].includes(color))&&doorType!=="圓弧型"?"白/牙色":color;
  const base=cfg.prices[matKey]?.[colKey]??0;
  const surW=cfg.surW[matKey]??0,surH=cfg.surH[matKey]??0;
  let extraW=0,extraH=0;
  if(cfg.isL){extraW=(Math.ceil(Math.max(0,wR-cfg.stdW)/100)+Math.ceil(Math.max(0,(wR2||0)-cfg.stdW)/100))*surW;}
  else{extraW=Math.ceil(Math.max(0,wR-cfg.stdW)/100)*surW;}
  if(!cfg.isArc){extraH=Math.ceil(Math.max(0,hR-cfg.stdH)/100)*surH;}
  let prod=base+extraW+extraH;
  if(fourDoorFull)prod+=500;if(foldLock)prod+=1000;
  if((arcShorten||doorType==="圓弧型"&&["3mmPS板","3mmPS501"].includes(matKey)&&hR<1880)&&doorType==="圓弧型")prod+=500;
  // 三門PS板玻璃軌道（強制）
  const isThreeDoorPS=(doorType==="一字三門"||doorType==="一字二門")&&["5mmPS板","3mmPS板"].includes(matKey);
  let glassTrackFee=0;
  if(isThreeDoorPS){if(wR>1900)glassTrackFee=800;else if(wR>1700)glassTrackFee=500;}
  prod+=glassTrackFee;
  const thrPrice=hasThreshold&&thresholdMm>0?Math.round(thresholdMm):0;
  const towelPrice=(towelBar||0)*200;
  const feeKey=installType==="含拆舊"?"拆裝":installType==="純寄送"?null:"安裝";
  const installFeeBase=feeKey?INSTALL_MAP[master]?.[region]?.[feeKey]??0:0;
  const shipSurcharge=(master==="余青陽"||master==="郭師傅")&&feeKey?500:0;
  const installFee=installFeeBase+shipSurcharge;
  const floorFee=!hasElevator&&floor>=4?(floor-3)*300:0;
  const thrInstall=hasThreshold?200:0;
  const fixFee=master==="余青陽"&&doorType==="L型二門"?200:0;
  const fp=fixplateFee||0;
  return{productPrice:prod,thresholdPrice:thrPrice,towelPrice,installFee,installFeeBase,shipSurcharge,floorFee,thresholdInstallFee:thrInstall,fixFee,fixplateFee:fp,glassTrackFee,total:prod+thrPrice+towelPrice+installFee+floorFee+thrInstall+fixFee+fp,wR,hR,wR2,extraW,extraH};
}

function calcFrameless({doorType,wMm,hMm,film,filmType,blackFrame,flatTube,floor,hasElevator,fixplateFee}){
  const wCm=Math.round(roundTo100(wMm)/10),hCm=Math.round(roundTo100(hMm)/10);
  const wk=getWKey(wCm);if(!wk)return{error:"超出寬度範圍，請洽詢"};
  const row=FRAMELESS_PRICES[doorType]?.byWidth[wk];if(!row)return{error:"查無價格"};
  if(!row.base)return{error:"此寬度無基本價，請洽詢"};
  let base=rh(row.base*1.35);
  let extraW=0,extraH=0;
  if(wCm>200)extraW=Math.ceil((wCm-200)/10)*rh(1000*1.35);
  if(hCm>190)extraH=Math.ceil((hCm-190)/10)*rh(1000*1.35);
  let filmPrice=0;
  if(film){const fc=filmType==="噴砂"?row.fs:row.fc;if(fc===null)return{error:"此寬度防爆膜需另詢"};filmPrice=rh(fc*1.35);}
  const bfp=blackFrame?rh(2000*1.35):0;
  let ftPrice=0;if(doorType==="無框開啟門"&&flatTube){ftPrice=rh(1000*1.35);if(blackFrame)ftPrice+=rh(1000*1.35);}
  const floorFee=!hasElevator&&floor>=4?(floor-3)*300:0;
  const prod=base+extraW+extraH+filmPrice+bfp+ftPrice;
  return{productPrice:prod,filmPrice,blackFramePrice:bfp,flatTubePrice:ftPrice,installFee:0,floorFee,fixplateFee:fixplateFee||0,total:prod+floorFee+(fixplateFee||0),wCm,hCm};
}

function QRow({label,children}){return(<div style={{display:"flex",alignItems:"center",gap:8,flexWrap:"wrap"}}><span style={{minWidth:90,fontSize:12,color:"#555",flexShrink:0}}>{label}</span><div style={{display:"flex",alignItems:"center",gap:8,flexWrap:"wrap"}}>{children}</div></div>);}
function QInput(props){const {style,onKeyDown,...rest}=props;return(<input {...rest} onKeyDown={onKeyDown||onEnterNext} style={{border:"1px solid #ddd",borderRadius:6,padding:"5px 10px",fontSize:13,outline:"none",...style}}/>);}
function QToggle({value,onChange,options,wrap}){return(<div style={{display:"flex",flexWrap:wrap?"wrap":"nowrap",gap:5}}>{options.map(o=><button key={o} onClick={()=>onChange(o)} style={{padding:"4px 11px",borderRadius:6,fontSize:12,cursor:"pointer",border:value===o?"2px solid #1a1a1a":"1px solid #ddd",background:value===o?"#1a1a1a":"#fff",color:value===o?"#fff":"#333",fontWeight:value===o?600:400}}>{o}</button>)}</div>);}
function QCheck({checked,onChange,label}){return(<label style={{display:"flex",alignItems:"center",gap:5,cursor:"pointer",fontSize:12}}><input type="checkbox" checked={checked} onChange={e=>onChange(e.target.checked)} style={{width:15,height:15}}/>{label}</label>);}
function QTag({children,color}){return(<span style={{background:color+"22",color,border:`1px solid ${color}`,borderRadius:4,padding:"2px 7px",fontSize:11,fontWeight:600}}>{children}</span>);}
function QSection({title,children,accent}){return(<div style={{background:"#fff",borderRadius:10,overflow:"hidden",boxShadow:"0 1px 4px rgba(0,0,0,0.08)"}}><div style={{background:accent?"#1a1a1a":"#f0efe9",color:accent?"#fff":"#1a1a1a",padding:"9px 15px",fontWeight:700,fontSize:13,letterSpacing:1}}>{title}</div><div style={{padding:"11px 15px",display:"flex",flexDirection:"column",gap:9}}>{children}</div></div>);}
function QLineItem({label,value}){return(<div style={{display:"flex",justifyContent:"space-between",fontSize:13}}><span style={{color:"#444"}}>{label}</span><span style={{fontWeight:500}}>${fmtMoney(value)}</span></div>);}

function defItem(){return{id:Date.now()+Math.random(),cat:"有框",dt:"一字二門",mat:"5mmPS101",col:"白色",wMm:1500,hMm:1900,wMm2:900,hasThr:false,thrMm:0,towel:0,fourFull:false,foldLock:false,arcShort:false,film:false,filmType:"清玻",blackF:false,flatT:false,instType:"純安裝",hasFixedPlate:false,adjust:0,fpAngle:"90度",direction:"",looseParts:false,glassTrack:false,itemShipFee:500};}

function DoorItemForm({item,idx,floor,elev,fpFee,master,region,onUpdate,onRemove,canRemove,quoteMode}){
  const s=(k,v)=>onUpdate({...item,[k]:v});
  const isThreeDoorPSAuto=(item.dt==="一字三門"||item.dt==="一字二門")&&["5mmPS101","5mmPS503","5mmPS501","3mmPS101","3mmPS503","3mmPS501"].includes(item.mat)&&roundTo100(item.wMm)>1700;
  useEffect(()=>{if(isThreeDoorPSAuto&&!item.glassTrack){s("glassTrack",true);}},[item.dt,item.mat,item.wMm]);
  const changeDt=t=>{const ms=FRAMED_MATS[t]||FRAMED_MATS.default;const defaultDir=t==="一字四門"?"雙固":t==="一字二門"||t==="一字三門"?"左開":t==="摺疊二門"?"左固":t==="L型二門"?"對開":t==="固定片"?"左固":"";const defaultFourFull=t==="一字四門"?false:false;onUpdate({...item,dt:t,mat:ms[0],col:t==="圓弧型"?FRAMED_COLS.圓弧型[0]:(quoteMode?"白/牙色":FRAMED_COLS.default[0]),direction:defaultDir,fourFull:defaultFourFull});};
  const changeCat=v=>{onUpdate({...item,cat:v,dt:v==="有框"?"一字二門":v==="無框"?"連動門":"",mat:v==="有框"?"5mmPS101":"",col:v==="有框"?(quoteMode?"白/牙色":"白色"):"",addonType:"毛巾桿"});};
  const mats=FRAMED_MATS[item.dt]||FRAMED_MATS.default;
  const cols=item.dt==="圓弧型"?FRAMED_COLS.圓弧型:(quoteMode?["白/牙色","銀色","黑色"]:FRAMED_COLS.default);
  const isFixedPlate=item.dt==="固定片";
  const result=useMemo(()=>{
    if(item.cat==="加購品"){
      const t=item.addonType||"毛巾桿";
      const inst=item.fpInstallFee||0;const ship=item.addonShip||0;
      if(t==="毛巾桿"){const prod=(item.towel||1)*200;return{productPrice:prod,installFee:inst,shipFee:ship,floorFee:0,total:prod+inst+ship};}
      if(t==="鋁門檻"){const thrPrice=Math.round(item.thrMm||0);return{productPrice:thrPrice,installFee:inst,shipFee:ship,floorFee:0,total:thrPrice+inst+ship};}
      if(t==="L型鋁門檻"){const thrPrice=Math.round((item.thrMm||0)+(item.thrMm2||0));return{productPrice:thrPrice,installFee:inst,shipFee:ship,floorFee:0,total:thrPrice+inst+ship};}
      if(t==="自填"){const prod=item.addonPrice||0;return{productPrice:prod,installFee:inst,shipFee:ship,floorFee:0,total:prod+inst+ship};}
      return{productPrice:0,installFee:0,shipFee:0,floorFee:0,total:0};
    }
    if(item.cat==="無框"&&master==="郭師傅")return{blocked:true};
    if(isFixedPlate){
      const price=calcFixedPlate({material:item.mat,color:item.col,wMm:item.wMm,hMm:item.hMm});
      if(price===null)return{pending:true};
      if(!price)return{error:"超出固定片尺寸範圍，請洽詢"};
      const installFee=item.fpInstallFee||0;
      const towelPrice=(item.towel||0)*200;
      return{productPrice:price,installFee,towelPrice,thresholdPrice:0,floorFee:0,thresholdInstallFee:0,fixFee:0,fixplateFee:0,total:price+installFee+towelPrice,wR:roundTo100(item.wMm),hR:roundTo100(item.hMm)};
    }
    if(item.cat==="有框")return calcFramed({doorType:item.dt,material:item.mat,color:item.col,wMm:item.wMm,hMm:item.hMm,wMm2:item.wMm2,hasThreshold:item.hasThr,thresholdMm:item.thrMm,towelBar:item.towelType==="內外把手"?2:item.towelType&&item.towelType!=="無"?1:0,fourDoorFull:item.fourFull,foldLock:item.foldLock,arcShorten:item.arcShort,floor,hasElevator:elev,installType:item.instType,fixplateFee:fpFee,region,master});
    return calcFrameless({doorType:item.dt,wMm:item.wMm,hMm:item.hMm,film:item.film,filmType:item.filmType,blackFrame:item.blackF,flatTube:item.flatT,floor,hasElevator:elev,fixplateFee:fpFee});
  },[item,floor,elev,fpFee,region,master,isFixedPlate]);
  const adjustedTotal=result&&!result.error&&!result.blocked?(result.total+(item.adjust||0)):null;
  return(
    <div style={{border:"1.5px solid #e0dfd9",borderRadius:10,overflow:"hidden",marginBottom:10}}>
      <div style={{background:"#f0efe9",padding:"8px 14px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <span style={{fontWeight:700,fontSize:13}}>門型 {idx+1}</span>
        <div style={{display:"flex",gap:8,alignItems:"center"}}>
          {adjustedTotal!==null&&<span style={{fontWeight:700,fontSize:14,color:"#1a1a1a"}}>${fmtMoney(adjustedTotal)}</span>}
          {canRemove&&<button onClick={onRemove} style={{padding:"2px 10px",borderRadius:6,border:"1px solid #FECACA",background:"#FEF2F2",color:"#DC2626",fontSize:11,fontWeight:700,cursor:"pointer"}}>刪除</button>}
        </div>
      </div>
      <div style={{padding:"10px 14px",display:"flex",flexDirection:"column",gap:8}}>
        <QRow label="類別"><QToggle value={item.cat} onChange={changeCat} options={["有框","無框","加購品"]}/></QRow>

        {item.cat==="加購品"&&<>
          <QRow label="品項"><QToggle value={item.addonType||"毛巾桿"} onChange={v=>s("addonType",v)} options={["毛巾桿","鋁門檻","L型鋁門檻","自填"]}/></QRow>
          {(item.addonType||"毛巾桿")==="毛巾桿"&&<>
            <QRow label="顏色"><QToggle value={item.addonCol||"白色"} onChange={v=>s("addonCol",v)} options={["白色","牙色","銀色","黑色"]}/></QRow>
            <QRow label="數量"><QInput type="number" value={item.towel||1} onChange={e=>s("towel",Number(e.target.value))} min={1} max={10} style={{width:60}}/><span style={{fontSize:11,color:"#888"}}>支×$200</span></QRow>
            <QRow label="安裝費"><QInput type="number" value={item.fpInstallFee||""} onChange={e=>s("fpInstallFee",Number(e.target.value))} placeholder="0" style={{width:100}}/><span style={{fontSize:11,color:"#888"}}>元</span></QRow>
            <QRow label="運費"><QInput type="number" value={item.addonShip||""} onChange={e=>s("addonShip",Number(e.target.value))} placeholder="0" style={{width:100}}/><span style={{fontSize:11,color:"#888"}}>元</span></QRow>
            <QRow label="備註"><QInput value={item.addonNote||""} onChange={e=>s("addonNote",e.target.value)} placeholder="備註說明" style={{width:"100%",maxWidth:280}}/></QRow>
          </>}
          {(item.addonType||"毛巾桿")==="鋁門檻"&&<>
            <QRow label="顏色"><QToggle value={item.addonCol||"白色"} onChange={v=>s("addonCol",v)} options={["白色","牙色","銀色","黑色"]}/></QRow>
            <QRow label="長度"><QInput type="number" value={item.thrMm||0} onChange={e=>s("thrMm",Number(e.target.value))} min={0} max={5000} style={{width:90}}/><span style={{fontSize:11,color:"#888"}}>mm（$10/cm）</span></QRow>
            <QRow label="安裝費"><QInput type="number" value={item.fpInstallFee||""} onChange={e=>s("fpInstallFee",Number(e.target.value))} placeholder="0" style={{width:100}}/><span style={{fontSize:11,color:"#888"}}>元</span></QRow>
            <QRow label="運費"><QInput type="number" value={item.addonShip||""} onChange={e=>s("addonShip",Number(e.target.value))} placeholder="0" style={{width:100}}/><span style={{fontSize:11,color:"#888"}}>元</span></QRow>
            <QRow label="備註"><QInput value={item.addonNote||""} onChange={e=>s("addonNote",e.target.value)} placeholder="備註說明" style={{width:"100%",maxWidth:280}}/></QRow>
          </>}
          {(item.addonType||"毛巾桿")==="L型鋁門檻"&&<>
            <QRow label="顏色"><QToggle value={item.addonCol||"白色"} onChange={v=>s("addonCol",v)} options={["白色","牙色","銀色","黑色"]}/></QRow>
            <QRow label="W1"><QInput type="number" value={item.thrMm||0} onChange={e=>s("thrMm",Number(e.target.value))} min={0} max={5000} style={{width:90}}/><span style={{fontSize:11,color:"#888"}}>mm</span></QRow>
            <QRow label="W2"><QInput type="number" value={item.thrMm2||0} onChange={e=>s("thrMm2",Number(e.target.value))} min={0} max={5000} style={{width:90}}/><span style={{fontSize:11,color:"#888"}}>mm（合計×$10/cm）</span></QRow>
            <QRow label="安裝費"><QInput type="number" value={item.fpInstallFee||""} onChange={e=>s("fpInstallFee",Number(e.target.value))} placeholder="0" style={{width:100}}/><span style={{fontSize:11,color:"#888"}}>元</span></QRow>
            <QRow label="運費"><QInput type="number" value={item.addonShip||""} onChange={e=>s("addonShip",Number(e.target.value))} placeholder="0" style={{width:100}}/><span style={{fontSize:11,color:"#888"}}>元</span></QRow>
            <QRow label="備註"><QInput value={item.addonNote||""} onChange={e=>s("addonNote",e.target.value)} placeholder="備註說明" style={{width:"100%",maxWidth:280}}/></QRow>
          </>}
          {(item.addonType||"毛巾桿")==="自填"&&<>
            <QRow label="名稱"><QInput value={item.addonName||""} onChange={e=>s("addonName",e.target.value)} placeholder="品項名稱" style={{width:180}}/></QRow>
            <QRow label="金額"><QInput type="number" value={item.addonPrice||""} onChange={e=>s("addonPrice",Number(e.target.value))} placeholder="0" style={{width:120}}/><span style={{fontSize:11,color:"#888"}}>元</span></QRow>
            <QRow label="安裝費"><QInput type="number" value={item.fpInstallFee||""} onChange={e=>s("fpInstallFee",Number(e.target.value))} placeholder="0" style={{width:100}}/><span style={{fontSize:11,color:"#888"}}>元</span></QRow>
            <QRow label="運費"><QInput type="number" value={item.addonShip||""} onChange={e=>s("addonShip",Number(e.target.value))} placeholder="0" style={{width:100}}/><span style={{fontSize:11,color:"#888"}}>元</span></QRow>
            <QRow label="備註"><QInput value={item.addonNote||""} onChange={e=>s("addonNote",e.target.value)} placeholder="備註說明" style={{width:"100%",maxWidth:280}}/></QRow>
          </>}
        </>}

        {item.cat!=="加購品"&&<>
        <QRow label="門型">{item.cat==="有框"?<QToggle value={item.dt} onChange={changeDt} options={FRAMED_TYPES} wrap/>:<QToggle value={item.dt} onChange={t=>s("dt",t)} options={FRAMELESS_TYPES} wrap/>}</QRow>
        {item.cat==="有框"&&<>
          <QRow label="材質">
            <div style={{display:"flex",flexDirection:"column",gap:5,width:"100%"}}>
              {item.dt==="圓弧型"?(
                <div style={{display:"flex",gap:5,flexWrap:"wrap"}}>
                  {mats.map(o=>(
                    <button key={o} onClick={()=>s("mat",o)} style={{padding:"4px 11px",borderRadius:6,fontSize:12,cursor:"pointer",border:item.mat===o?"2px solid #1a1a1a":"1px solid #ddd",background:item.mat===o?"#1a1a1a":"#fff",color:item.mat===o?"#fff":"#333",fontWeight:item.mat===o?600:400}}>{o}</button>
                  ))}
                </div>
              ):(
                [["5mmPS101","5mmPS503","5mmPS501"],["3mmPS101","3mmPS503","3mmPS501"],["5mm強化清玻貼清膜","5mm強化清玻貼砂膜","5mm強化銀霞玻貼清膜"]].map((group,gi)=>(
                  <div key={gi} style={{display:"flex",gap:5,flexWrap:"wrap"}}>
                    {group.map(o=>(
                      <button key={o} onClick={()=>s("mat",o)} style={{padding:"4px 11px",borderRadius:6,fontSize:12,cursor:"pointer",border:item.mat===o?"2px solid #1a1a1a":"1px solid #ddd",background:item.mat===o?"#1a1a1a":"#fff",color:item.mat===o?"#fff":"#333",fontWeight:item.mat===o?600:400}}>{o}</button>
                    ))}
                  </div>
                ))
              )}
            </div>
          </QRow>
          <QRow label="顏色"><QToggle value={item.col} onChange={v=>s("col",v)} options={cols}/></QRow>
          {(()=>{
            const dirOpts=item.dt==="一字四門"?["雙固","左固","右固","四片活動"]:item.dt==="一字二門"||item.dt==="一字三門"?["左開","右開","左固","右固"]:item.dt==="摺疊二門"?["左固","右固"]:item.dt==="L型二門"?["對開"]:item.dt==="固定片"?["左固","右固"]:null;
            if(!dirOpts)return null;
            const isThreeDoorPS2=(item.dt==="一字三門"||item.dt==="一字二門")&&["5mmPS101","5mmPS503","5mmPS501","3mmPS101","3mmPS503","3mmPS501"].includes(item.mat); const autoGlassTrack=isThreeDoorPS2&&roundTo100(item.wMm)>1700;
            return(<div><QRow label="開向"><QToggle value={item.direction||dirOpts[0]} onChange={v=>{s("direction",v);if(item.dt==="一字四門")s("fourFull",v==="四片活動");}} options={dirOpts} wrap/></QRow><QRow label=""><QCheck checked={item.looseParts||false} onChange={v=>s("looseParts",v)} label="散裝"/><QCheck checked={item.glassTrack||false} onChange={v=>s("glassTrack",v)} label="玻軌"/></QRow></div>);
          })()}
        </>}
        <QRow label="尺寸（mm）">
          {(item.dt==="L型二門"||item.dt==="圓弧型")?<><span style={{fontSize:12}}>W1</span><QInput type="number" value={item.wMm} onChange={e=>s("wMm",Number(e.target.value))} min={100} max={3000} style={{width:90}}/><span style={{fontSize:12}}>W2</span><QInput type="number" value={item.wMm2||""} onChange={e=>s("wMm2",Number(e.target.value))} min={100} max={3000} style={{width:90}}/></>:<><span style={{fontSize:12}}>W</span><QInput type="number" value={item.wMm} onChange={e=>s("wMm",Number(e.target.value))} min={100} max={3000} style={{width:90}}/></>}
          <span style={{fontSize:12}}>H</span>
          {item.dt==="圓弧型"&&item.mat==="5mm強化清玻"?<span style={{fontSize:11,color:"#888"}}>H1880（固定）</span>:<QInput type="number" value={item.hMm} onChange={e=>s("hMm",Number(e.target.value))} min={100} max={3000} style={{width:90}}/>}
        </QRow>
        {!isFixedPlate&&<QRow label="安裝類型"><QToggle value={item.instType||"純安裝"} onChange={v=>s("instType",v)} options={["純安裝","含拆舊","純寄送"]}/></QRow>}
        {!isFixedPlate&&!quoteMode&&item.instType==="純寄送"&&<QRow label="運費"><QInput type="number" value={item.itemShipFee!=null?item.itemShipFee:500} onChange={e=>s("itemShipFee",Number(e.target.value))} style={{width:90}}/><span style={{fontSize:11,color:"#888"}}>元</span></QRow>}
        {isFixedPlate&&<QRow label="角度"><QToggle value={item.fpAngle||"90度"} onChange={v=>s("fpAngle",v)} options={["45度","90度","180度"]}/></QRow>}
        <QRow label="微調金額">
          <button onClick={()=>s("adjust",(item.adjust||0)-100)} style={{width:28,height:28,borderRadius:6,border:"1px solid #ddd",background:"#fff",cursor:"pointer",fontSize:16,fontWeight:700}}>−</button>
          <span style={{minWidth:70,textAlign:"center",fontSize:13,fontWeight:600,color:(item.adjust||0)>0?"#059669":(item.adjust||0)<0?"#DC2626":"#888"}}>{(item.adjust||0)>0?`+$${fmtMoney(item.adjust||0)}`:(item.adjust||0)<0?`-$${fmtMoney(Math.abs(item.adjust||0))}`:"$0"}</span>
          <button onClick={()=>s("adjust",(item.adjust||0)+100)} style={{width:28,height:28,borderRadius:6,border:"1px solid #ddd",background:"#fff",cursor:"pointer",fontSize:16,fontWeight:700}}>＋</button>
          {(item.adjust||0)!==0&&<button onClick={()=>s("adjust",0)} style={{fontSize:10,color:"#9CA3AF",background:"none",border:"none",cursor:"pointer"}}>重置</button>}
        </QRow>
        {isFixedPlate&&<QRow label="安裝費"><QInput type="number" value={item.fpInstallFee||""} onChange={e=>s("fpInstallFee",Number(e.target.value))} placeholder="0" style={{width:100}}/><span style={{fontSize:11,color:"#888"}}>元</span></QRow>}
        {isFixedPlate&&<QRow label="毛巾桿"><QToggle value={item.towelType||"無"} onChange={v=>s("towelType",v)} options={["無","外把手","內把手","內外把手"]}/></QRow>}
        {!isFixedPlate&&item.cat==="有框"&&<>
          <QRow label="鋁門檻"><QCheck checked={item.hasThr} onChange={v=>s("hasThr",v)} label="需要"/>{item.hasThr&&<><QInput type="number" value={item.thrMm} onChange={e=>s("thrMm",Number(e.target.value))} min={0} max={5000} style={{width:80}}/><span style={{fontSize:11,color:"#888"}}>mm</span></>}</QRow>
          <QRow label="毛巾桿"><QToggle value={item.towelType||"無"} onChange={v=>s("towelType",v)} options={["無","外把手","內把手","內外把手"]}/></QRow>
        </>}
        {!isFixedPlate&&item.cat==="無框"&&<>
          <QRow label="防爆膜"><QCheck checked={item.film} onChange={v=>s("film",v)} label="需要"/>{item.film&&<QToggle value={item.filmType} onChange={v=>s("filmType",v)} options={["清玻","噴砂"]}/>}</QRow>
          <QRow label="黑色五金"><QCheck checked={item.blackF} onChange={v=>s("blackF",v)} label="+$2,000"/></QRow>
        </>}
        </>}
        {result&&!result.error&&!result.blocked&&(<div style={{background:"#f8f7f3",borderRadius:8,padding:"8px 12px",fontSize:12,display:"flex",justifyContent:"space-between"}}><span style={{color:"#666"}}>{isFixedPlate?`固定片（${item.fpAngle||"90度"}）`:item.instType==="純寄送"?`產品 $${fmtMoney(result.productPrice)}　運費 $${fmtMoney(item.itemShipFee!=null?item.itemShipFee:500)}`:`產品 $${fmtMoney(result.productPrice)}　安裝 $${fmtMoney(result.installFee||0)}${(result.shipSurcharge||0)>0?`　運費 $${fmtMoney(result.shipSurcharge)}`:""}` }</span><span style={{fontWeight:700,color:"#1a1a1a"}}>${fmtMoney(adjustedTotal)}</span></div>)}
        {result?.error&&<div style={{color:"#c0392b",fontSize:12,fontWeight:600}}>⚠️ {result.error}</div>}
        {result?.blocked&&<div style={{color:"#c0392b",fontSize:12,fontWeight:600}}>🚫 南部不販售無框產品</div>}
      </div>
    </div>
  );
}

function WorkOrderModal({items,results,custName,phone,addr,master,region,wDeduct,isShipping,clientName,shipDate,onClose}){
  const ref=useRef(null);
  const today=new Date();
  const dateStr=`${today.getFullYear()-1911}/${String(today.getMonth()+1).padStart(2,"0")}/${String(today.getDate()).padStart(2,"0")}`;
  const validItems=items.filter((_,i)=>results[i]&&!results[i].error&&!results[i].blocked&&!results[i].pending&&items[i].cat!=="加購品");
  const addonItems=items.filter(item=>item.cat==="加購品");
  const woFF="'Noto Sans TC','PingFang TC',sans-serif";

  function handleSave(){
    const el=ref.current;if(!el)return;
    const script=document.createElement("script");
    script.src="https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js";
    script.onload=()=>{
      window.html2canvas(el,{scale:3,backgroundColor:"#fff",useCORS:true}).then(canvas=>{
        const a=document.createElement("a");
        a.download=`工單_${clientName||custName}_${dateStr.replace(/\//g,"")}.png`;
        a.href=canvas.toDataURL("image/png");a.click();
      });
    };
    document.head.appendChild(script);
  }

  function getTowelText(item){
    const t=item.towelType||"";
    if(t==="外把手")return"加外把手";
    if(t==="內把手")return"加內把手";
    if(t==="內外把手")return"加內外把手";
    return"";
  }

  const shipText=master==="余青陽"?"寄松成":master==="賴彥銘"?"載":master==="郭師傅"?(region==="台南"?"寄台南站":"寄高雄站"):master==="進南貨運"?"寄進南":"";

  return(
    <Modal onClose={onClose} width={560}>
      <div style={{padding:"14px 20px 10px",borderBottom:"1px solid #F3F4F6",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <div style={{fontWeight:800,fontSize:16}}>🖨️ 工單預覽</div>
        <div style={{display:"flex",gap:8}}>
          <button onClick={handleSave} style={{padding:"7px 18px",borderRadius:8,border:"none",background:"#7c3aed",color:"#fff",fontWeight:700,fontSize:13,cursor:"pointer",fontFamily:woFF}}>💾 下載PNG</button>
          <button onClick={onClose} style={{border:"none",background:"none",fontSize:22,cursor:"pointer",color:"#9CA3AF"}}>✕</button>
        </div>
      </div>
      <div style={{flex:1,overflowY:"auto",padding:"16px 20px"}}>
        <div ref={ref} style={{background:"#fff",padding:"28px 32px",fontFamily:woFF,width:480,boxSizing:"border-box",fontSize:15,lineHeight:1.9,color:"#000",textAlign:"left"}}>

          <div style={{marginBottom:20,fontSize:14}}>
            {dateStr}　享浴　（{clientName||custName||""}）
          </div>

          {validItems.map((item,idx)=>{
            const wR=parseFloat((item.wMm/10).toFixed(1));
            const hR=parseFloat((item.hMm/10).toFixed(1));
            const wDeductVal=item.wDeductItem!=null&&item.wDeductItem!==0?item.wDeductItem:(wDeduct||0);
            const hDeductVal=item.hDeduct||0;
            const wFinal=wDeductVal>0?(wR-wDeductVal).toFixed(1):wR;
            const w2R=item.wMm2?item.wMm2/10:null;
            const w2Final=wDeductVal>0&&w2R?(w2R-wDeductVal).toFixed(1):w2R;
            const hFinal=hDeductVal>0?(hR-hDeductVal).toFixed(1):hR;
            const dir=item.direction||"";
            const towelText=getTowelText(item);
            const isFixedPlate=item.dt==="固定片";
            const thrMmVal=item.thrMm||0;
            const sizeStr=(item.dt==="L型二門"||item.dt==="圓弧型")?`W${wR}*W${w2R||wR}*H${hR}`:`W${wR}*H${hR}`;
            const looseParts=item.looseParts?"散裝":""; const glassTrackText=item.glassTrack?"改玻璃軌道":""; const sizeLine=isFixedPlate?`W${wR}*H${hR}`:[sizeStr,dir,looseParts,glassTrackText,towelText].filter(Boolean).join("  ");
            const deductLine=[wDeductVal>0?`丈量扣${wDeductVal}`:"",hDeductVal>0?`高扣${hDeductVal}`:""].filter(Boolean).join("　");

            return(
              <div key={item.id||idx}>
                {idx>0&&<div style={{borderTop:"1px solid #bbb",margin:"16px 0"}}/>}
                <div style={{fontWeight:700,fontSize:16,marginBottom:2}}>
                  {isFixedPlate?`固定片（${item.col}）${item.mat}`:`${item.dt}（${item.col}）${item.mat}`}
                </div>
                <div style={{marginBottom:2}}>{sizeLine}</div>
                {deductLine&&<div style={{marginBottom:2,color:"#333"}}>{deductLine}</div>}
                {!isFixedPlate&&item.hasThr&&thrMmVal>0&&<div style={{marginBottom:2}}>鋁門檻 W{(thrMmVal/10)} × 1支</div>}
                {isFixedPlate&&item.fpAngle&&<div style={{marginBottom:2}}>{item.fpAngle}</div>}
              </div>
            );
          })}

          {addonItems.map((item,idx)=>(
            <div key={idx} style={{marginTop:8}}>
              {item.addonType==="毛巾桿"&&<div>毛巾桿（{item.addonCol||""}）{getTowelText(item)||""}　W{(item.thrMm||0)/10} × 1支</div>}
              {item.addonType==="鋁門檻"&&<div>鋁門檻（{item.addonCol||""}）W{(item.thrMm||0)/10} × 1支</div>}
              {item.addonType==="L型鋁門檻"&&<div>L型鋁門檻（{item.addonCol||""}）W{(item.thrMm||0)/10}×W{(item.thrMm2||0)/10} × 1組</div>}
              {item.addonType==="自填"&&<div>{item.addonName||""}</div>}
            </div>
          ))}

          {(shipText||shipDate)&&<div style={{textAlign:"right",marginTop:28,fontSize:14}}>{shipDate?`${shipDate} `:""}  {shipText}</div>}
        </div>
      </div>
    </Modal>
  );
}

function QuotationSystem({onCreateOrder}){
  const [items,setItems]=useState([defItem()]);
  const [shopMode,setShopMode]=useState("官網");
  const [master,setMaster]=useState("余青陽");const [region,setRegion]=useState("台北");
  const [floor,setFloor]=useState(1);const [elev,setElev]=useState(false);
  const [fpFee,setFpFee]=useState(0);
  const [jinnExtra,setJinnExtra]=useState(0);
  const [wDeduct,setWDeduct]=useState(0);
  const [addr,setAddr]=useState("");const [custName,setCustName]=useState("");const [custPhone,setCustPhone]=useState("");const [custLine,setCustLine]=useState("");
  const [copied,setCopied]=useState(false);const [savedQuote,setSavedQuote]=useState(false);const [showWorkOrder,setShowWorkOrder]=useState(false);
  const [quotes,setQuotes]=useState([]);

  useEffect(()=>{
    sb.getAll("quotes").then(rows=>{if(rows&&rows.length)setQuotes(rows.map(r=>r.data));});
  },[]);

  function handleSaveQuote(){
    if(grandTotal===0)return;
    const itemsWithResults=items.map((it,i)=>({...it,...(results[i]&&!results[i].error&&!results[i].blocked&&!results[i].pending?{productPrice:results[i].productPrice,installFee:results[i].installFee,installFeeBase:results[i].installFeeBase,shipSurcharge:results[i].shipSurcharge,floorFee:results[i].floorFee,thresholdPrice:results[i].thresholdPrice,thresholdInstallFee:results[i].thresholdInstallFee,towelPrice:results[i].towelPrice}:{})}));
    const q={id:Math.floor(Date.now()/1000),custName,custPhone,custLine,addr,master,region,grandTotal,qDate,vDate,items:itemsWithResults,status:"有效",convertedAt:null};
    setQuotes(p=>[q,...p]);
    sb.upsert("quotes",{id:q.id,data:q});
    setSavedQuote(true);setTimeout(()=>setSavedQuote(false),2000);
  }

  function handleConvertQuote(q){
    const productDesc=q.items.map(item=>{
      if(item.cat==="加購品"){const t=item.addonType||"毛巾桿";return t==="自填"?(item.addonName||"加購品"):t;}
      if(item.dt==="固定片")return`固定片 ${item.mat||""} ${item.col||""}`.trim();
      if(item.cat==="有框")return`${item.dt}（${item.col}）${item.mat} W${Math.round(item.wMm/10)}×H${Math.round(item.hMm/10)}${item.direction?" "+item.direction:""}`;
      return`${item.dt} W${Math.round(item.wMm/10)}×H${Math.round(item.hMm/10)}`;
    }).join("、");
    const order={cust:q.custName||"",phone:q.custPhone||"",addr:q.addr||"",master:q.master,region:q.region,wDeduct:0,note:`報價金額 $${fmtMoney(q.grandTotal)}`,scheduled:false,ordered:false,product:productDesc,shipMethod:q.master==="進南貨運"?"寄進南":q.master==="自取"?"自取":q.master==="賴彥銘"?"載":q.master==="郭師傅"&&q.region==="台南"?"寄台南站址":q.master==="郭師傅"?"寄高雄站址":"寄松成",quoteItems:q.items.map(item=>({...item,cat:item.cat||"有框"})),orderDate:new Date().toISOString().slice(0,10)};
    onCreateOrder(order);
    const updated={...q,status:"已轉訂單",convertedAt:new Date().toISOString().slice(0,10)};
    setQuotes(p=>p.map(x=>x.id===q.id?updated:x));
    sb.upsert("quotes",{id:updated.id,data:updated});
  }

  function getQuoteStatus(q){
    if(q.status==="已轉訂單")return"已轉訂單";
    const today=new Date();today.setHours(0,0,0,0);
    const exp=new Date(q.vDate.replace(/\//g,"-"));exp.setHours(0,0,0,0);
    return exp<today?"已逾期":"有效";
  }
  const qDate=getTodayStr(),vDate=addDays(qDate,14);
  const changeMaster=m=>{
    setMaster(m);
    if(m==="進南貨運"||m==="自取"){
      setItems(prev=>prev.map(item=>({...item,instType:"純寄送"})));
    } else {
      setRegion(MASTER_AREAS[m][0]);
      setItems(prev=>prev.map(item=>({...item,instType:item.instType==="純寄送"?"純安裝":item.instType})));
    }
  };

  function parseAddress(addr){
    // 抓樓層：支援「4樓」「4F」「4f」「4FL」
    const floorMatch=addr.match(/(\d{1,2})\s*(?:樓|F|f|FL|fl)/);
    if(floorMatch)setFloor(Number(floorMatch[1]));
    // 抓地區並自動對應師傅
    const AREA_MASTER={宜蘭:"余青陽",基隆:"余青陽",台北:"余青陽",新北:"余青陽",桃園:"余青陽",新竹:"賴彥銘",苗栗:"賴彥銘",台中:"賴彥銘",南投:"賴彥銘",彰化:"賴彥銘",雲林:"賴彥銘",嘉義:"賴彥銘",台南:"郭師傅",高雄:"郭師傅",屏東:"郭師傅"};
    const AREA_KW={宜蘭:["宜蘭"],基隆:["基隆"],台北:["台北市","台北縣"],新北:["新北","板橋","三重","中和","永和","新莊","新店","土城","蘆洲","樹林","汐止","淡水"],桃園:["桃園","中壢","平鎮","八德","楊梅","蘆竹","龜山"],新竹:["新竹","竹北","竹東"],苗栗:["苗栗","頭份","竹南"],台中:["台中","豐原","大里","太平","清水","沙鹿"],南投:["南投","埔里","草屯"],彰化:["彰化","員林","鹿港"],雲林:["雲林","斗六","虎尾"],嘉義:["嘉義","朴子","民雄"],台南:["台南","新營","善化"],高雄:["高雄","鳳山","岡山","路竹"],屏東:["屏東","潮州","東港"]};
    for(const[area,kws]of Object.entries(AREA_KW)){
      if(kws.some(k=>addr.includes(k))){
        const m=AREA_MASTER[area];
        if(m){setMaster(m);setRegion(area);}
        break;
      }
    }
  }
  const updateItem=(idx,updated)=>setItems(prev=>prev.map((it,i)=>i===idx?updated:it));
  const removeItem=idx=>setItems(prev=>prev.filter((_,i)=>i!==idx));
  const addItem=()=>setItems(prev=>[...prev,{...defItem(),id:Date.now()}]);
  const results=items.map(item=>{
    if(item.cat==="加購品"){
      const t=item.addonType||"毛巾桿";
      const inst=item.fpInstallFee||0;const ship=item.addonShip||0;
      if(t==="毛巾桿"){const prod=(item.towel||1)*200;return{productPrice:prod,installFee:inst,shipFee:ship,floorFee:0,total:prod+inst+ship};}
      if(t==="鋁門檻"){const thrPrice=Math.round(item.thrMm||0);return{productPrice:thrPrice,installFee:inst,shipFee:ship,floorFee:0,total:thrPrice+inst+ship};}
      if(t==="L型鋁門檻"){const thrPrice=Math.round((item.thrMm||0)+(item.thrMm2||0));return{productPrice:thrPrice,installFee:inst,shipFee:ship,floorFee:0,total:thrPrice+inst+ship};}
      if(t==="自填"){const prod=item.addonPrice||0;return{productPrice:prod,installFee:inst,shipFee:ship,floorFee:0,total:prod+inst+ship};}
      return{productPrice:0,installFee:0,shipFee:0,floorFee:0,total:0};
    }
    if(item.cat==="無框"&&master==="郭師傅")return{blocked:true};
    if(item.dt==="固定片"){
      const price=calcFixedPlate({material:item.mat,color:item.col,wMm:item.wMm,hMm:item.hMm});
      if(price===null)return{pending:true};
      if(!price)return{error:"超出固定片尺寸範圍，請洽詢"};
      return{productPrice:price,installFee:item.fpInstallFee||0,floorFee:0,total:price+(item.fpInstallFee||0)+(item.towel||0)*200,wR:roundTo100(item.wMm),hR:roundTo100(item.hMm)};
    }
    if(item.cat==="有框")return calcFramed({doorType:item.dt,material:item.mat,color:item.col,wMm:item.wMm,hMm:item.hMm,wMm2:item.wMm2,hasThreshold:item.hasThr,thresholdMm:item.thrMm,towelBar:item.towelType==="內外把手"?2:item.towelType&&item.towelType!=="無"?1:0,fourDoorFull:item.fourFull,foldLock:item.foldLock,arcShorten:item.arcShort,floor,hasElevator:elev,installType:item.instType||"純安裝",fixplateFee:fpFee,region,master});
    return calcFrameless({doorType:item.dt,wMm:item.wMm,hMm:item.hMm,film:item.film,filmType:item.filmType,blackFrame:item.blackF,flatTube:item.flatT,floor,hasElevator:elev,fixplateFee:fpFee});
  });
  const shippingFee=master==="進南貨運"?500+jinnExtra:0;
  function applyShopMode(r,item){
    if(!r||r.error||r.blocked||r.pending)return 0;
    const base=r.total+(item.cat==="加購品"||item.dt==="固定片"?0:item.adjust||0);
    if(shopMode==="官網")return base;
    const mat=item.mat||"";
    const isPS=mat.includes("PS");
    const isGlass=!isPS&&item.cat!=="加購品";
    if(isPS)return base+400;
    if(isGlass)return Math.round(base+(r.productPrice||0)*0.05);
    return base;
  }
  const grandTotal=results.reduce((s,r,i)=>s+applyShopMode(r,items[i]),0)+shippingFee;
  function buildLines(){
    const lines=["享浴淋浴拉門 報價單",""];
    if(addr)lines.push(`施工地址：${addr}`);
    lines.push(`報價日期：${qDate}`);lines.push(`有效期限：${vDate}`);lines.push("");
    items.forEach((item,i)=>{
      const r=results[i];if(!r||r.error||r.blocked||r.pending)return;
      const itemTotal=(item.cat==="加購品"||item.dt==="固定片")?r.total:(r.total+(item.adjust||0));
      lines.push("──────────────────");
      if(item.cat==="加購品"){
        const t=item.addonType||"毛巾桿";
        const col=item.addonCol?`（${item.addonCol}）`:"";
        const col2=item.addonCol?`（${item.addonCol}）`:""; const name=t==="自填"?(item.addonName||"加購品"):t==="L型鋁門檻"?`L型鋁門檻${col2} W${(item.thrMm||0)/10}+W${(item.thrMm2||0)/10}`:(t+col);
        lines.push(name);
        if(item.addonNote)lines.push(`備註：${item.addonNote}`);
        lines.push(`費用：$${fmtMoney(r.productPrice)}`);
        if((r.installFee||0)>0)lines.push(`安裝費：$${fmtMoney(r.installFee)}`);
        if((r.shipFee||0)>0)lines.push(`運費：$${fmtMoney(r.shipFee)}`);
      } else if(item.dt==="固定片"){
        lines.push(`固定片／${item.mat}／${item.col}`);
        lines.push(`尺寸：W${(item.wMm/10).toFixed(1).replace(/\.0$/,"")} × H${(item.hMm/10).toFixed(1).replace(/\.0$/,"")} cm`);
        lines.push(`產品費用：$${fmtMoney(r.productPrice)}`);
        const adjAmt=item.adjust||0;const instDisplay=(r.installFeeBase||r.installFee||0)+(r.shipSurcharge||0)+adjAmt;if(instDisplay>0)lines.push(`安裝費：$${fmtMoney(instDisplay)}`);
      } else if(item.dt==="L型二門"||item.dt==="圓弧型"){
        lines.push(`${item.dt}／${item.mat}／${item.col}`);
        lines.push(`尺寸：W${(item.wMm/10).toFixed(1).replace(/\.0$/,"")} × W${((item.wMm2||item.wMm)/10).toFixed(1).replace(/\.0$/,"")} × H${(item.hMm/10).toFixed(1).replace(/\.0$/,"")} cm`);
        lines.push(`產品費用：$${fmtMoney(r.productPrice)}`);
        const adjAmt=item.adjust||0;
        const instBase=(r.installFeeBase||r.installFee||0)+(r.shipSurcharge||0)+adjAmt;
        const thrInst=item.instType!=="純寄送"&&item.hasThr?(r.thresholdInstallFee||200):0;
        const instDisplay=instBase+thrInst;
        const instLabel=item.instType==="含拆舊"?"拆裝費":"安裝費";
        if(instDisplay>0)lines.push(`${instLabel}：$${fmtMoney(instDisplay)}`);
        if(r.floorFee>0)lines.push(`樓層費（${floor}樓）：$${fmtMoney(r.floorFee)}`);
        if(r.thresholdPrice>0)lines.push(`鋁門檻（${item.thrMm/10} cm）：$${fmtMoney(r.thresholdPrice)}`);
        if(r.towelPrice>0&&item.towelType&&item.towelType!=="無")lines.push(`${item.towelType}：$${fmtMoney(r.towelPrice)}`);
      } else {
        lines.push(`${item.dt}／${item.cat==="有框"?item.mat+"／"+item.col:"8mm強化清玻"}`);
        lines.push(`尺寸：W${item.wMm/10} × H${item.hMm/10} cm`);
        if((r.glassTrackFee||0)>0)lines.push(`改玻璃軌道`);
        lines.push(`產品費用：$${fmtMoney(r.productPrice)}`);
        const adjAmt=item.adjust||0;
        const instBase2=(r.installFeeBase||r.installFee||0)+(r.shipSurcharge||0)+adjAmt;
        const thrInst2=item.instType!=="純寄送"&&item.hasThr?(r.thresholdInstallFee||200):0;
        const instDisplay=instBase2+thrInst2;
        const instLabel2=item.instType==="含拆舊"?"拆裝費":"安裝費";
        if(instDisplay>0)lines.push(`${instLabel2}：$${fmtMoney(instDisplay)}`);
        if(r.floorFee>0)lines.push(`樓層費（${floor}樓）：$${fmtMoney(r.floorFee)}`);
        if(r.thresholdPrice>0)lines.push(`鋁門檻（${item.thrMm/10} cm）：$${fmtMoney(r.thresholdPrice)}`);
        if(r.towelPrice>0&&item.towelType&&item.towelType!=="無")lines.push(`${item.towelType}：$${fmtMoney(r.towelPrice)}`);
      }
      lines.push(`小計：$${fmtMoney(itemTotal)}`);
    });
    if(shippingFee>0){
      lines.push("──────────────────");
      lines.push(`運費（進南貨運）${jinnExtra>0?`（含偏遠加價 $${fmtMoney(jinnExtra)}）`:""}`);
      lines.push(`費用：$${fmtMoney(shippingFee)}`);
    }
    lines.push("──────────────────");lines.push(`合計：$${fmtMoney(grandTotal)}`);
    lines.push("","＊此為估價，若確認施作請聯繫我們開單付款。","官網：xiangyultd.tw");
    if(shippingFee>0){
      lines.push("","⚠️ 配送說明");
      lines.push("大型物件僅配送至一樓，需有人簽收或由管理室代收。");
      lines.push("貨運司機不負責搬運上樓，若巷口較窄貨車無法進入，煩請協助司機卸貨，造成不便敬請見諒。");
    }
    return lines;
  }
  function handleCopy(){navigator.clipboard.writeText(buildLines().join("\n")).then(()=>{setCopied(true);setTimeout(()=>setCopied(false),2000);});}
  function handleConvert(){
    if(grandTotal===0)return;
    // 自動產生品項描述
    const productDesc=items.map(item=>{
      if(item.cat==="加購品"){const t=item.addonType||"毛巾桿";return t==="自填"?(item.addonName||"加購品"):t;}
      if(item.dt==="固定片")return`固定片 ${item.mat} ${item.col} W${Math.round(item.wMm/10)}×H${Math.round(item.hMm/10)}`;
      if(item.cat==="有框")return`${item.dt}（${item.col}）${item.mat} W${Math.round(item.wMm/10)}×H${Math.round(item.hMm/10)}${item.direction?" "+item.direction:""}`;
      return`${item.dt} W${Math.round(item.wMm/10)}×H${Math.round(item.hMm/10)}`;
    }).join("、");
    const order={
      cust:custName||"",phone:custPhone||"",custLine,addr:addr||"",
      master,region,wDeduct:0,
      note:`報價金額 $${fmtMoney(grandTotal)}`,
      scheduled:false,ordered:false,
      product:productDesc,
      shipDate:"",shipMethod:master==="進南貨運"?"寄進南":master==="自取"?"自取":"寄松成",
      quoteItems:items.map(item=>({...item,cat:item.cat||"有框"})),
    };
    onCreateOrder(order);setConverted(true);setTimeout(()=>setConverted(false),3000);
  }
  const qff="'Noto Sans TC',sans-serif";
  return(
    <div style={{fontFamily:qff,display:"flex",flexDirection:"column",gap:14,padding:"14px 0"}}>
      <QSection title="客戶資訊">
        <QRow label="客戶姓名"><QInput value={custName} onChange={e=>setCustName(e.target.value)} onKeyDown={e=>{if(e.key==="Enter"){e.preventDefault();document.getElementById("q_phone")?.focus();}}} placeholder="王先生" style={{width:140}} id="q_name"/></QRow>
        <QRow label="聯絡電話"><QInput value={custPhone} onChange={e=>setCustPhone(e.target.value)} onKeyDown={e=>{if(e.key==="Enter"){e.preventDefault();document.getElementById("q_line")?.focus();}}} placeholder="0912-345-678" style={{width:160}} id="q_phone"/></QRow>
        <QRow label="Line 名稱"><QInput value={custLine} onChange={e=>setCustLine(e.target.value)} onKeyDown={e=>{if(e.key==="Enter"){e.preventDefault();document.getElementById("q_addr")?.focus();}}} placeholder="@王先生" style={{width:160}} id="q_line"/></QRow>
        <QRow label="施工地址"><QInput value={addr} onChange={e=>{const v=e.target.value;setAddr(v);parseAddress(v);}} onKeyDown={e=>{if(e.key==="Enter"){e.preventDefault();document.getElementById("q_floor")?.focus();}}} placeholder="台北市信義區...4樓 無電梯" style={{width:"100%",maxWidth:340}} id="q_addr"/></QRow>
        <QRow label="樓層"><QInput type="number" value={floor} onChange={e=>setFloor(Number(e.target.value))} min={1} max={30} style={{width:70}} id="q_floor"/><QToggle value={elev?"有電梯":"無電梯"} onChange={v=>setElev(v==="有電梯")} options={["有電梯","無電梯"]}/>{!elev&&floor>=4&&<QTag color="#e67e22">樓層費 +${fmtMoney((floor-3)*300)}</QTag>}</QRow>
      </QSection>
      <QSection title="師傅 / 地區">
        <QRow label="師傅"><QToggle value={master} onChange={changeMaster} options={[...Object.keys(MASTER_AREAS),"進南貨運","自取"]} wrap/></QRow>
        {master!=="進南貨運"&&master!=="自取"&&<QRow label="地區"><QToggle value={region} onChange={setRegion} options={MASTER_AREAS[master]} wrap/></QRow>}
        {master==="進南貨運"&&<>
          <QRow label="基本運費"><span style={{fontSize:13,fontWeight:600}}>$500</span></QRow>
          <QRow label="偏遠加價"><QInput type="number" value={jinnExtra} onChange={e=>setJinnExtra(Number(e.target.value))} placeholder="0" style={{width:100}}/><span style={{fontSize:11,color:"#888"}}>元（宜花東等）</span></QRow>
        </>}
        {custName&&<QRow label="客單名稱"><span style={{fontSize:13,fontWeight:700,color:"#1a1a1a"}}>{genClientName(master,custName,region,addr)}</span></QRow>}
      </QSection>
      <div>
        <div style={{fontWeight:700,fontSize:13,marginBottom:8,color:"#374151"}}>門型明細</div>
        {items.map((item,idx)=>(<DoorItemForm key={item.id} item={item} idx={idx} floor={floor} elev={elev} fpFee={fpFee} master={master} region={region} onUpdate={updated=>updateItem(idx,updated)} onRemove={()=>removeItem(idx)} canRemove={items.length>1} quoteMode={true}/>))}
        <button onClick={addItem} style={{width:"100%",padding:"10px",borderRadius:8,border:"2px dashed #ddd",background:"#fff",cursor:"pointer",fontSize:13,fontWeight:700,color:"#888"}}>＋ 新增門型</button>
      </div>
      <QSection title={<div style={{display:"flex",alignItems:"center",gap:12}}>報價結果<div style={{display:"flex",gap:4}}>{["官網","蝦皮"].map(s=><button key={s} onClick={()=>setShopMode(s)} style={{padding:"3px 12px",borderRadius:6,fontSize:12,cursor:"pointer",border:"none",background:shopMode===s?(s==="官網"?"#1d4ed8":"#f97316"):"#e2e8f0",color:shopMode===s?"#fff":"#64748b",fontWeight:shopMode===s?700:500}}>{s}</button>)}</div></div>} accent>
        {grandTotal>0?(<>
          <div style={{fontSize:13,color:"#555"}}>報價日期：{qDate}　有效期限：{vDate}</div>
          {items.map((item,i)=>{
            const r=results[i];
            if(!r||r.error||r.blocked)return null;
            if(r.pending)return(<div key={item.id} style={{borderBottom:"1px solid #e5e5e5",paddingBottom:10,marginBottom:10}}><div style={{fontSize:13,color:"#333",marginBottom:4}}>固定片／{item.mat}／{item.col}　{item.fpAngle||"90度"}</div><div style={{fontSize:13,color:"#888",fontStyle:"italic"}}>價格後補</div></div>);
            const itemTotal=item.dt==="固定片"?r.productPrice+(item.adjust||0):r.total+(item.adjust||0);
            return(<div key={item.id} style={{borderBottom:"1px solid #e5e5e5",paddingBottom:10,marginBottom:10}}>
              <div style={{fontSize:14,color:"#111",fontWeight:700,marginBottom:2}}>
                {item.cat==="加購品"?(()=>{const t=item.addonType||"毛巾桿";const col=item.addonCol?`（${item.addonCol}）`:"";return t==="自填"?(item.addonName||"加購品"):(t+col);})():item.dt==="固定片"?`固定片／${item.mat}／${item.col}`:`${item.dt}／${item.cat==="有框"?item.mat+"／"+item.col:"8mm強化清玻"}`}
              </div>
              {item.cat!=="加購品"&&<div style={{fontSize:13,color:"#555",marginBottom:6}}>
                {(item.dt==="L型二門"||item.dt==="圓弧型")?`W${(item.wMm/10).toFixed(1).replace(/\.0$/,"")} × W${((item.wMm2||item.wMm)/10).toFixed(1).replace(/\.0$/,"")} × H${(item.hMm/10).toFixed(1).replace(/\.0$/,"")} cm`:`W${(item.wMm/10).toFixed(1).replace(/\.0$/,"")} × H${(item.hMm/10).toFixed(1).replace(/\.0$/,"")} cm`}
              </div>}
              <div style={{display:"flex",justifyContent:"space-between",fontSize:14,color:"#333",marginBottom:3}}><span>產品費用</span><span style={{fontWeight:600}}>${fmtMoney(r.productPrice)}</span></div>
              {(()=>{const instBase=(r.installFeeBase||r.installFee||0)+(r.shipSurcharge||0)+(item.cat==="加購品"?0:item.adjust||0);const thrInst=item.instType!=="純寄送"&&item.hasThr?(r.thresholdInstallFee||200):0;const instTotal=instBase+thrInst;const instLabel=item.instType==="含拆舊"?"拆裝費":"安裝費";return instTotal>0?<div style={{display:"flex",justifyContent:"space-between",fontSize:14,color:"#333",marginBottom:3}}><span>{instLabel}</span><span style={{fontWeight:600}}>${fmtMoney(instTotal)}</span></div>:null;})()}
              {(r.shipFee||0)>0&&<div style={{display:"flex",justifyContent:"space-between",fontSize:14,color:"#333",marginBottom:3}}><span>運費</span><span style={{fontWeight:600}}>${fmtMoney(r.shipFee)}</span></div>}
              {r.floorFee>0&&<div style={{display:"flex",justifyContent:"space-between",fontSize:14,color:"#333",marginBottom:3}}><span>樓層費（{floor}樓）</span><span style={{fontWeight:600}}>${fmtMoney(r.floorFee)}</span></div>}
              {r.thresholdPrice>0&&<div style={{display:"flex",justifyContent:"space-between",fontSize:14,color:"#333",marginBottom:3}}><span>鋁門檻（{(item.thrMm/10)} cm）</span><span style={{fontWeight:600}}>${fmtMoney(r.thresholdPrice)}</span></div>}
              {(r.glassTrackFee||0)>0&&<div style={{display:"flex",justifyContent:"space-between",fontSize:14,color:"#e67e22",marginBottom:3}}><span>玻璃軌道</span><span style={{fontWeight:600}}>${fmtMoney(r.glassTrackFee)}</span></div>}
              {item.dt==="圓弧型"&&["3mmPS101","3mmPS503","3mmPS501"].includes(item.mat)&&item.hMm<1880&&<div style={{display:"flex",justifyContent:"space-between",fontSize:14,color:"#e67e22",marginBottom:3}}><span>訂製費</span><span style={{fontWeight:600}}>+$500</span></div>}
              {r.towelPrice>0&&<div style={{display:"flex",justifyContent:"space-between",fontSize:14,color:"#333",marginBottom:3}}><span>{item.towelType||"毛巾桿"}</span><span style={{fontWeight:600}}>${fmtMoney(r.towelPrice)}</span></div>}
              <div style={{display:"flex",justifyContent:"space-between",fontSize:15,color:"#111",fontWeight:700,marginTop:6,paddingTop:6,borderTop:"1px solid #ddd"}}><span>小計</span><span>${fmtMoney(r.total+(item.cat==="加購品"?0:item.adjust||0))}</span></div>
            </div>);
          })}
          {shippingFee>0&&<div style={{display:"flex",justifyContent:"space-between",fontSize:14,color:"#4f46e5",fontWeight:600,marginBottom:8}}><span>🚚 進南貨運運費{jinnExtra>0?`（含偏遠 $${fmtMoney(jinnExtra)}）`:""}</span><span>${fmtMoney(shippingFee)}</span></div>}
          {shopMode==="蝦皮"&&<div style={{fontSize:11,color:"#e67e22",textAlign:"right",marginBottom:4}}>蝦皮價格（玻璃×1.05，PS+$400）</div>}
          <div style={{paddingTop:10,borderTop:"2px solid #1a1a1a",display:"flex",justifyContent:"space-between",alignItems:"center"}}><span style={{fontWeight:700,fontSize:18,color:"#111"}}>總計</span><span style={{fontWeight:800,fontSize:26,color:"#111"}}>${fmtMoney(grandTotal)}</span></div>
          <div style={{display:"flex",gap:8,marginTop:4}}>
            <button onClick={handleCopy} style={{flex:1,padding:"11px",borderRadius:8,background:copied?"#059669":"#1a1a1a",color:"#fff",border:"none",cursor:"pointer",fontSize:13,fontWeight:700,fontFamily:qff}}>{copied?"✅ 已複製！":"📋 複製報價單"}</button>
            <button onClick={handleSaveQuote} style={{flex:1,padding:"11px",borderRadius:8,background:savedQuote?"#059669":"#f59e0b",color:"#fff",border:"none",cursor:"pointer",fontSize:13,fontWeight:700,fontFamily:qff}}>{savedQuote?"✅ 已儲存！":"💾 儲存報價"}</button>
          </div>
        </>):<div style={{color:"#888",fontSize:13,padding:"8px 0"}}>請先填寫上方門型資訊</div>}
      </QSection>
      {(()=>{const isShip=master==="進南貨運";const cName=genClientName(master,custName,region,addr);return showWorkOrder&&<WorkOrderModal items={items} results={results} custName={custName} phone={custPhone} addr={addr} master={master} region={region} wDeduct={wDeduct} isShipping={isShip} clientName={cName} onClose={()=>setShowWorkOrder(false)}/>;})()}

      {/* 報價列表 */}
      {quotes.length>0&&(<div style={{marginTop:8}}>
        <div style={{fontWeight:700,fontSize:13,color:"#374151",marginBottom:8}}>報價紀錄</div>
        <div style={{display:"flex",flexDirection:"column",gap:8}}>
          {quotes.map(q=>{
            const status=getQuoteStatus(q);
            const statusColor=status==="有效"?"#059669":status==="已逾期"?"#DC2626":"#3B82F6";
            const statusBg=status==="有效"?"#D1FAE5":status==="已逾期"?"#FEF2F2":"#DBEAFE";
            return(
              <div key={q.id} style={{background:"#fff",borderRadius:12,border:"1.5px solid #E2E8F0",padding:"12px 16px",boxShadow:"0 1px 4px rgba(0,0,0,0.05)"}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:6}}>
                  <div>
                    <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:2}}>
                      <span style={{fontWeight:800,fontSize:14}}>{q.custName||"（未填姓名）"}</span>
                      {q.custLine&&<span style={{fontSize:11,color:"#0ea5e9"}}>Line: {q.custLine}</span>}
                      <span style={{fontSize:11,fontWeight:700,color:statusColor,background:statusBg,padding:"2px 8px",borderRadius:10}}>{status}</span>
                    </div>
                    <div style={{fontSize:11,color:"#9CA3AF"}}>{q.qDate} ～ {q.vDate}</div>
                    {q.addr&&<div style={{fontSize:11,color:"#6B7280",marginTop:2}}>📍 {q.addr}</div>}
                  </div>
                  <div style={{textAlign:"right"}}>
                    <div style={{fontWeight:800,fontSize:16,color:"#111"}}>${fmtMoney(q.grandTotal)}</div>
                    {q.convertedAt&&<div style={{fontSize:10,color:"#9CA3AF"}}>轉訂單 {q.convertedAt}</div>}
                  </div>
                </div>
                {status==="有效"&&<button onClick={()=>handleConvertQuote(q)} style={{width:"100%",padding:"8px",borderRadius:8,border:"none",background:"#3B82F6",color:"#fff",fontWeight:700,fontSize:12,cursor:"pointer",fontFamily:qff}}>📋 轉為訂單</button>}
              </div>
            );
          })}
        </div>
      </div>)}
    </div>
  );
}

function TTCalendar({orders,year,month,onDayClick}){
  const days=getDaysInMonth(year,month),firstDay=getFirstDay(year,month);
  const WEEK=["日","一","二","三","四","五","六"];
  const byDate=useMemo(()=>{const m={};orders.forEach(o=>{if(!m[o.date])m[o.date]=[];m[o.date].push(o);});return m;},[orders]);
  const cells=[];
  for(let i=0;i<firstDay;i++)cells.push(null);
  for(let d=1;d<=days;d++)cells.push(d);
  while(cells.length%7!==0)cells.push(null);
  return(
    <div style={{background:"#fff",borderRadius:16,overflow:"hidden",border:"1px solid #E2E8F0",boxShadow:"0 4px 16px rgba(0,0,0,0.06)"}}>
      <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",background:"#F8FAFC",borderBottom:"2px solid #E2E8F0"}}>
        {WEEK.map((w,i)=>(<div key={w} style={{textAlign:"center",padding:"11px 0",fontSize:12,fontWeight:800,color:i===0?"#EF4444":i===6?"#3B82F6":"#64748B"}}>{w}</div>))}
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)"}}>
        {cells.map((day,idx)=>{
          if(!day)return(<div key={idx} style={{minHeight:110,borderRight:"1px solid #F1F5F9",borderBottom:"1px solid #F1F5F9",background:"#FAFBFC"}}/>);
          const dateStr=padDate(year,month,day),dayOrders=byDate[dateStr]||[],isToday=dateStr===todayStr,isSun=idx%7===0,isSat=idx%7===6;
          return(
            <div key={idx} onClick={()=>onDayClick(dateStr)} style={{minHeight:110,borderRight:"1px solid #F1F5F9",borderBottom:"1px solid #F1F5F9",padding:"7px 5px 5px",cursor:"pointer",background:isToday?"#EFF6FF":"#fff",transition:"background 0.12s"}}
              onMouseEnter={e=>{if(!isToday)e.currentTarget.style.background="#F8FAFC";}}
              onMouseLeave={e=>{e.currentTarget.style.background=isToday?"#EFF6FF":"#fff";}}>
              <div style={{display:"flex",justifyContent:"center",marginBottom:5}}>
                <div style={{width:28,height:28,borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",background:isToday?"#3B82F6":"transparent",color:isToday?"#fff":isSun?"#EF4444":isSat?"#3B82F6":"#374151",fontSize:13,fontWeight:isToday?800:dayOrders.length>0?700:400,boxShadow:isToday?"0 2px 8px #3B82F680":"none"}}>{day}</div>
              </div>
              <div style={{display:"flex",flexDirection:"column",gap:2}}>
                {[...dayOrders].sort((a,b)=>(a.appointTime||"99:99").localeCompare(b.appointTime||"99:99")).slice(0,4).map(o=>{
                  const m=MASTERS[o.masterId],cancelled=o.status==="取消";
                  return(
                    <div key={o.id} style={{borderRadius:5,padding:"2px 5px",background:cancelled?"#E5E7EB":m.color,display:"flex",alignItems:"center",gap:3,opacity:cancelled?0.6:1}}>
                      <span style={{width:5,height:5,borderRadius:"50%",background:cancelled?"#9CA3AF":"rgba(255,255,255,0.7)",flexShrink:0}}/>
                      <span style={{fontSize:10,fontWeight:700,color:cancelled?"#6B7280":"#fff",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis",flex:1,lineHeight:1.4}}>{o.appointTime?o.appointTime+" ":""}{o.customer}</span>
                      <span style={{fontSize:9,color:cancelled?"#9CA3AF":"rgba(255,255,255,0.75)",flexShrink:0,fontWeight:700}}>{m.avatar}</span>
                    </div>
                  );
                })}
                {dayOrders.length>4&&<div style={{fontSize:10,color:"#94A3B8",textAlign:"center",padding:"1px 0",fontWeight:600}}>+{dayOrders.length-4} 件</div>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function WageSummary({orders,year,month,onTransferLog,onMonthlySettle}){
  const data=useMemo(()=>Object.values(MASTERS).map(master=>{
    const mo=orders.filter(o=>{if(o.masterId!==master.id||o.status==="取消"||!o.date)return false;const d=new Date(o.date+"T00:00:00");return d.getFullYear()===year&&d.getMonth()===month;});
    const total=mo.reduce((s,o)=>{const w=calcWage(master,o.area||Object.keys(master.areas)[0],o.jobType,o.floor,o.hasThreshold,o.isLType,o.hasFixedPlate,o.hasThresholdReplace,o.extras,o.extraCustom,o.hasElevator);return s+(w?.total||0);},0);
    let paid=0;
    if(master.payMode==="monthly"&&mo.length>0&&mo.every(o=>o.monthlySettled))paid=total;
    return{master,count:mo.length,total,paid};
  }),[orders,year,month]);
  const grand=data.reduce((s,d)=>s+d.total,0),grandPaid=data.reduce((s,d)=>s+d.paid,0);
  return(
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr 1fr",gap:10,marginBottom:16}}>
      {data.map(({master,count,total,paid})=>(
        <div key={master.id} onClick={()=>master.payMode==="transfer"?onTransferLog():master.payMode==="monthly"?onMonthlySettle():null}
          style={{background:"#fff",borderRadius:14,padding:"13px 15px",border:"1px solid #E2E8F0",borderTop:"4px solid "+master.color,cursor:(master.payMode==="transfer"||master.payMode==="monthly")?"pointer":"default",boxShadow:"0 2px 8px rgba(0,0,0,0.04)"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
            <div style={{display:"flex",gap:8,alignItems:"center"}}>
              <div style={{width:32,height:32,borderRadius:9,background:master.light,color:master.dark,display:"flex",alignItems:"center",justifyContent:"center",fontWeight:800,fontSize:14}}>{master.avatar}</div>
              <div><div style={{fontWeight:700,fontSize:13}}>{master.name}</div><div style={{fontSize:10,color:"#94A3B8"}}>{master.payType}</div></div>
            </div>
            <span style={{fontSize:11,fontWeight:700,color:master.color,background:master.light,padding:"2px 8px",borderRadius:10}}>{count} 單</span>
          </div>
          <div style={{fontSize:20,fontWeight:800,color:"#1E293B",marginBottom:6}}>{fmt(total)}</div>
          <div style={{marginTop:6,fontSize:10,color:master.color,fontWeight:600}}>{master.payMode==="transfer"?"點擊查看匯款紀錄 →":master.payMode==="monthly"?"點擊查看月結帳單 →":"現場付款・每單紀錄"}</div>
        </div>
      ))}
      <div style={{background:"linear-gradient(135deg,#0F172A,#1E293B,#334155)",borderRadius:14,padding:"13px 15px",color:"#fff",boxShadow:"0 2px 8px rgba(0,0,0,0.12)"}}>
        <div style={{fontSize:11,color:"#94A3B8",marginBottom:6}}>本月總工資</div>
        <div style={{fontSize:22,fontWeight:800,marginBottom:6}}>{fmt(grand)}</div>
      </div>
    </div>
  );
}

function DayPanel({date,orders,onClose,onAdd,onEdit,onUpdateOrder,pendingOrders=[],onUpdatePendingOrder}){
  if(!date)return null;
  const dt=new Date(date+"T00:00:00"),WEEK=["日","一","二","三","四","五","六"];
  const label=`${dt.getFullYear()}年${dt.getMonth()+1}月${dt.getDate()}日`,dow=WEEK[dt.getDay()];
  const tmr=new Date(dt);tmr.setDate(tmr.getDate()+1);
  const tmrStr=`${tmr.getMonth()+1}/${tmr.getDate()}`;
  const [collectOrder,setCollectOrder]=useState(null);

  function copyNotify(masterId){
    const masterOrders=orders.filter(o=>o.masterId===masterId&&o.status!=="取消");
    if(masterOrders.length===0)return;
    const masterName=MASTERS[masterId]?.name||masterId;
    const lines=[`明日行程 ${tmrStr}（${WEEK[tmr.getDay()]}）`,""];
    masterOrders.sort((a,b)=>(a.appointTime||"99:99").localeCompare(b.appointTime||"99:99")).forEach((o,i)=>{
      const linkedOrder=pendingOrders.find(p=>p.id===o.linkedOrderId);
      const balance=linkedOrder&&linkedOrder.totalAmount&&linkedOrder.depositAmount?(linkedOrder.totalAmount-linkedOrder.depositAmount):null;
      const elevator=o.hasElevator===true?"有電梯":o.hasElevator===false?"無電梯":"";
      const floorInfo=o.floor>1?`${o.floor}樓${elevator?" "+elevator:""}`:elevator;
      const mapUrl=o.mapUrl||`https://maps.google.com/?q=${encodeURIComponent(o.address||"")}`;
      lines.push(`${i+1}. ${o.customer}　${o.phone||""}`);
      if(o.appointTime)lines.push(`   🕐 ${o.appointTime}`);
      lines.push(`   ${o.jobType}${floorInfo?" ｜ "+floorInfo:""}`);
      lines.push(`   📍 ${o.address||""}`);
      lines.push(`   📦 ${o.product||""}`);
      if(balance!==null&&balance>0)lines.push(`   💰 尾款 $${balance.toLocaleString()}`);
      if(linkedOrder&&linkedOrder.payStatus==="已付清")lines.push(`   💰 已付清`);
      lines.push(`   🗺 ${mapUrl}`);
      if(o.note)lines.push(`   📝 ${o.note}`);
      lines.push("");
    });
    navigator.clipboard.writeText(lines.join("\n")).then(()=>alert(`已複製${masterName}的行程通知！`));
  }

  const masterIds=[...new Set(orders.filter(o=>o.status!=="取消").map(o=>o.masterId))];

  return(
    <div style={{position:"fixed",inset:0,zIndex:200,display:"flex",alignItems:"flex-end",justifyContent:"center"}} onClick={onClose}>
      <div onClick={e=>e.stopPropagation()} style={{background:"#fff",borderRadius:"20px 20px 0 0",width:"100%",maxWidth:520,maxHeight:"76vh",display:"flex",flexDirection:"column",boxShadow:"0 -10px 40px rgba(0,0,0,0.16)",fontFamily:ff}}>
        <div style={{display:"flex",justifyContent:"center",padding:"10px 0 2px"}}><div style={{width:36,height:4,borderRadius:2,background:"#E5E7EB"}}/></div>
        <div style={{padding:"10px 20px 10px",display:"flex",justifyContent:"space-between",alignItems:"center",borderBottom:"1px solid #F3F4F6"}}>
          <div><span style={{fontWeight:800,fontSize:16}}>{label}</span><span style={{fontWeight:500,fontSize:13,color:"#9CA3AF",marginLeft:6}}>（{dow}）</span></div>
          <div style={{display:"flex",gap:8,flexWrap:"wrap",justifyContent:"flex-end"}}>
            <span style={{fontSize:12,color:"#9CA3AF",alignSelf:"center"}}>{orders.length} 件</span>
            {masterIds.map(mid=>(
              <button key={mid} onClick={e=>{e.stopPropagation();copyNotify(mid);}} style={{padding:"5px 12px",borderRadius:20,border:"none",background:MASTERS[mid]?.color||"#888",color:"#fff",fontSize:11,fontWeight:700,cursor:"pointer",fontFamily:ff}}>📋 {MASTERS[mid]?.name||mid}</button>
            ))}
            <button onClick={()=>onAdd(date)} style={{padding:"6px 14px",borderRadius:20,border:"none",background:"#1E293B",color:"#fff",fontSize:12,fontWeight:700,cursor:"pointer",fontFamily:ff}}>＋ 新增</button>
          </div>
        </div>
        <div style={{flex:1,overflowY:"auto",padding:"10px 16px 24px"}}>
          {orders.length===0?(
            <div style={{textAlign:"center",padding:"36px 0",color:"#9CA3AF"}}><div style={{fontSize:32,marginBottom:8}}>📭</div><div style={{fontSize:14}}>這天還沒有排程</div></div>
          ):[...orders].sort((a,b)=>(a.appointTime||"99:99").localeCompare(b.appointTime||"99:99")).map(o=>{
            const master=MASTERS[o.masterId],area=o.area||Object.keys(master.areas)[0],wage=calcWage(master,area,o.jobType,o.floor,o.hasThreshold,o.isLType,o.hasFixedPlate,o.hasThresholdReplace,o.extras,o.extraCustom,o.hasElevator),cancelled=o.status==="取消";
            return(
              <div key={o.id} onClick={()=>onEdit(o)} style={{marginBottom:10,borderRadius:14,overflow:"hidden",border:"1.5px solid "+(cancelled?"#E5E7EB":master.color+"50"),cursor:"pointer",opacity:cancelled?0.55:1}}>
                <div style={{background:cancelled?"#9CA3AF":master.color,padding:"9px 14px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                  <div><div style={{color:"#fff",fontWeight:800,fontSize:14}}>{o.customer}</div>{o.phone&&<a href={`tel:${o.phone}`} onClick={e=>e.stopPropagation()} style={{color:"rgba(255,255,255,0.85)",fontSize:11,textDecoration:"none"}}>📞 {o.phone}</a>}</div>
                  <div style={{display:"flex",gap:6,alignItems:"center"}}>
                    {o.appointTime&&<span style={{fontSize:12,color:"#fff",fontWeight:800,background:"rgba(255,255,255,0.25)",padding:"1px 8px",borderRadius:10}}>🕐 {o.appointTime}</span>}
                    <span style={{fontSize:11,color:"rgba(255,255,255,0.85)"}}>{o.jobType}</span>
                  </div>
                </div>
                <div style={{padding:"10px 14px",background:cancelled?"#F9FAFB":master.light}}>
                  <div style={{display:"flex",gap:5,flexWrap:"wrap",marginBottom:6}}>
                    <Chip color={master.dark}>{master.avatar} {master.name}</Chip>
                    <Chip color={STATUS_CFG[o.status]?.color||"#6B7280"}>{o.status}</Chip>
                  </div>
                  {o.product&&<div style={{fontSize:12,color:"#374151",marginBottom:4}}>📦 {o.product}</div>}
                  {o.address&&<div style={{fontSize:11,color:"#6B7280",marginBottom:4}}>📍 {o.address}</div>}
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                    <span style={{fontSize:12,color:"#6B7280"}}>{area}</span>
                    <span style={{fontWeight:800,color:master.dark,fontSize:16}}>{fmt(wage?.total)}</span>
                  </div>
                  <PayLine order={o} master={master} wage={wage} onUpdate={onUpdateOrder}/>
                  <div style={{marginTop:8,display:"flex",gap:6}} onClick={e=>e.stopPropagation()}>
                    <button onClick={()=>setCollectOrder(o)} style={{flex:1,padding:"6px 0",borderRadius:8,border:"none",background:o.collectStatus==="已收"?"#D1FAE5":"#1E293B",color:o.collectStatus==="已收"?"#065F46":"#fff",fontSize:12,fontWeight:700,cursor:"pointer",fontFamily:ff}}>
                      {o.collectStatus==="已收"?"✅ 已收款":"💰 登記收款"}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 收款 Modal */}
      {collectOrder&&(()=>{
        const linkedOrder=pendingOrders.find(p=>p.id===collectOrder.linkedOrderId);
        const balance=linkedOrder&&linkedOrder.totalAmount&&linkedOrder.depositAmount?(linkedOrder.totalAmount-linkedOrder.depositAmount):null;
        return(
          <CollectModal
            order={collectOrder}
            balance={balance}
            onClose={()=>setCollectOrder(null)}
            onSave={(collectData)=>{
              onUpdateOrder(collectOrder.id,{collectStatus:"已收",collectedAmount:collectData.amount,collectMethod:collectData.method,collectDate:collectData.date});
              if(linkedOrder&&onUpdatePendingOrder){
                onUpdatePendingOrder(linkedOrder.id,{payStatus:"已付清",completed:true,finalMethod:collectData.method,finalDate:collectData.date});
              }
              setCollectOrder(null);
            }}
          />
        );
      })()}
    </div>
  );
}

function MonthlyModal({orders,year,month,onClose}){
  const ref=useRef(null);
  const monthOrders=orders.filter(o=>{
    if(o.masterId!=="qingyang")return false;
    if(o.status==="取消")return false;
    const d=o.date||"";
    return d.startsWith(`${year}-${String(month+1).padStart(2,"0")}`);
  }).sort((a,b)=>a.date.localeCompare(b.date));

  const mFF="'Noto Sans TC','PingFang TC',sans-serif";

  // 分類
  const collected=monthOrders.filter(o=>o.collectMethod==="師傅代收（月結）");
  const transferred=monthOrders.filter(o=>o.collectMethod==="匯款");
  const collectedTotal=collected.reduce((s,o)=>s+(o.collectedAmount||0),0);
  const wageTotal=monthOrders.reduce((s,o)=>{
    const master=MASTERS[o.masterId],area=o.area||Object.keys(master.areas)[0];
    const wage=calcWage(master,area,o.jobType,o.floor,o.hasThreshold,o.isLType,o.hasFixedPlate,o.hasThresholdReplace,o.extras,o.extraCustom,o.hasElevator);
    return s+(wage?.total||0)+(o.priceAdjust||0);
  },0);
  const netPayable=wageTotal-collectedTotal;

  function handleDownload(){
    const el=ref.current;if(!el)return;
    const s=document.createElement("script");
    s.src="https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js";
    s.onload=()=>{window.html2canvas(el,{scale:2,backgroundColor:"#fff",useCORS:true}).then(canvas=>{const a=document.createElement("a");a.download=`月結單_余青陽_${year}${String(month+1).padStart(2,"0")}.png`;a.href=canvas.toDataURL("image/png");a.click();});};
    document.head.appendChild(s);
  }

  const rowStyle={display:"grid",gridTemplateColumns:"80px 1fr 120px 80px 80px",gap:8,padding:"6px 0",borderBottom:"1px solid #f0f0f0",fontSize:13,alignItems:"center"};
  const hdStyle={...rowStyle,fontWeight:700,background:"#f5f5f5",padding:"8px 0",borderBottom:"2px solid #ddd"};

  return(
    <Modal onClose={onClose} width={680}>
      <div style={{padding:"14px 20px 10px",borderBottom:"1px solid #F3F4F6",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <div style={{fontWeight:800,fontSize:16}}>📋 余青陽月結單　{year}年{month+1}月</div>
        <div style={{display:"flex",gap:8}}>
          <button onClick={handleDownload} style={{padding:"7px 18px",borderRadius:8,border:"none",background:"#1E293B",color:"#fff",fontWeight:700,fontSize:13,cursor:"pointer",fontFamily:mFF}}>💾 下載PNG</button>
          <button onClick={onClose} style={{border:"none",background:"none",fontSize:22,cursor:"pointer",color:"#9CA3AF"}}>✕</button>
        </div>
      </div>
      <div style={{flex:1,overflowY:"auto",padding:"16px 20px"}}>
        <div ref={ref} style={{background:"#fff",padding:"24px 28px",fontFamily:mFF,fontSize:13,color:"#111",minWidth:580}}>
          <div style={{fontWeight:800,fontSize:18,marginBottom:4}}>享浴淋浴拉門　月結單</div>
          <div style={{fontSize:13,color:"#555",marginBottom:20}}>師傅：余青陽　　{year}年{month+1}月</div>

          {/* 所有案件 */}
          <div style={{fontWeight:700,fontSize:14,marginBottom:6,borderBottom:"2px solid #1E293B",paddingBottom:4}}>本月案件</div>
          <div style={{...hdStyle,padding:"8px 4px"}}>
            <span>日期</span><span>客戶／品項</span><span>安裝類型</span><span>工資</span><span>收款</span>
          </div>
          {monthOrders.map(o=>{
            const master=MASTERS[o.masterId],area=o.area||Object.keys(master.areas)[0];
            const wage=calcWage(master,area,o.jobType,o.floor,o.hasThreshold,o.isLType,o.hasFixedPlate,o.hasThresholdReplace,o.extras,o.extraCustom,o.hasElevator);
            const wageAmt=(wage?.total||0)+(o.priceAdjust||0);
            const collectTag=o.collectMethod==="師傅代收（月結）"?"代收":o.collectMethod==="匯款"?"匯款":"";
            return(
              <div key={o.id} style={{...rowStyle,padding:"6px 4px"}}>
                <span style={{color:"#555"}}>{o.date?.slice(5).replace("-","/")}</span>
                <div><div style={{fontWeight:600}}>{o.customer}</div><div style={{fontSize:11,color:"#888"}}>{o.product}</div></div>
                <span>{o.jobType}</span>
                <span style={{fontWeight:700,textAlign:"right"}}>${wageAmt.toLocaleString()}</span>
                <span style={{fontSize:11,color:o.collectMethod==="師傅代收（月結）"?"#D97706":"#059669",fontWeight:600}}>{collectTag}{o.collectedAmount?` $${o.collectedAmount.toLocaleString()}`:""}</span>
              </div>
            );
          })}

          {/* 代收明細 */}
          {collected.length>0&&<>
            <div style={{fontWeight:700,fontSize:14,marginTop:20,marginBottom:6,borderBottom:"2px solid #D97706",paddingBottom:4,color:"#D97706"}}>代收現金明細</div>
            {collected.map(o=>(
              <div key={o.id} style={{display:"flex",justifyContent:"space-between",padding:"4px 4px",fontSize:13}}>
                <span>{o.date?.slice(5).replace("-","/")}　{o.customer}</span>
                <span style={{fontWeight:700}}>${(o.collectedAmount||0).toLocaleString()}</span>
              </div>
            ))}
            <div style={{display:"flex",justifyContent:"space-between",padding:"6px 4px",fontWeight:700,borderTop:"1px solid #ddd",marginTop:4}}>
              <span>代收合計</span><span style={{color:"#D97706"}}>${collectedTotal.toLocaleString()}</span>
            </div>
          </>}

          {/* 客人直接匯款 */}
          {transferred.length>0&&<>
            <div style={{fontWeight:700,fontSize:14,marginTop:20,marginBottom:6,borderBottom:"2px solid #059669",paddingBottom:4,color:"#059669"}}>客人直接匯款</div>
            {transferred.map(o=>(
              <div key={o.id} style={{display:"flex",justifyContent:"space-between",padding:"4px 4px",fontSize:13}}>
                <span>{o.date?.slice(5).replace("-","/")}　{o.customer}</span>
                <span style={{fontWeight:700,color:"#059669"}}>已匯款</span>
              </div>
            ))}
          </>}

          {/* 結算 */}
          <div style={{marginTop:24,padding:"16px",background:"#F8FAFC",borderRadius:10,border:"1px solid #E2E8F0"}}>
            <div style={{display:"flex",justifyContent:"space-between",fontSize:14,marginBottom:6}}><span>本月工資合計</span><span style={{fontWeight:700}}>${wageTotal.toLocaleString()}</span></div>
            <div style={{display:"flex",justifyContent:"space-between",fontSize:14,marginBottom:10}}><span>代收現金（需歸還）</span><span style={{fontWeight:700,color:"#D97706"}}>- ${collectedTotal.toLocaleString()}</span></div>
            <div style={{display:"flex",justifyContent:"space-between",fontSize:16,fontWeight:800,borderTop:"2px solid #1E293B",paddingTop:10}}><span>應付余青陽</span><span style={{color:"#1E293B"}}>${netPayable.toLocaleString()}</span></div>
          </div>
        </div>
      </div>
    </Modal>
  );
}

function CollectModal({order,balance,onClose,onSave}){
  const todayISO=new Date().toISOString().slice(0,10);
  const [amount,setAmount]=useState(balance||0);
  const [method,setMethod]=useState("現金");
  const [date,setDate]=useState(todayISO);
  return(
    <div style={{position:"fixed",inset:0,zIndex:600,display:"flex",alignItems:"center",justifyContent:"center",background:"rgba(0,0,0,0.4)"}} onClick={onClose}>
      <div onClick={e=>e.stopPropagation()} style={{background:"#fff",borderRadius:16,width:340,padding:"20px 24px",fontFamily:ff,colorScheme:"light"}}>
        <div style={{fontWeight:800,fontSize:16,marginBottom:16}}>💰 登記收款</div>
        <div style={{fontSize:13,color:"#374151",marginBottom:4}}>客戶：{order.customer}</div>
        {balance!==null&&<div style={{fontSize:13,color:"#6B7280",marginBottom:16}}>應收尾款：<span style={{fontWeight:700,color:"#111"}}>${balance.toLocaleString()}</span></div>}
        <div style={{display:"grid",gap:12}}>
          <div><label style={lbl}>收款金額</label><input type="number" value={amount} onChange={e=>setAmount(Number(e.target.value))} onKeyDown={onEnterNext} style={inp}/></div>
          <div><label style={lbl}>收款方式</label>
            <div style={{display:"flex",gap:6,marginTop:4}}>
              {["師傅代收（月結）","現金","匯款"].map(m=>(
                <button key={m} onClick={()=>setMethod(m)} style={{flex:1,padding:"6px 4px",borderRadius:7,border:"2px solid",borderColor:method===m?"#1E293B":"#E5E7EB",background:method===m?"#1E293B":"#fff",color:method===m?"#fff":"#6B7280",fontSize:11,fontWeight:700,cursor:"pointer",fontFamily:ff}}>{m}</button>
              ))}
            </div>
          </div>
          <div><label style={lbl}>收款日期</label><input type="date" value={date} onChange={e=>setDate(e.target.value)} onKeyDown={onEnterNext} style={inp}/></div>
        </div>
        <div style={{display:"flex",gap:10,marginTop:20}}>
          <button onClick={onClose} style={{flex:1,padding:11,borderRadius:10,border:"1.5px solid #E5E7EB",background:"#fff",cursor:"pointer",fontFamily:ff}}>取消</button>
          <button onClick={()=>onSave({amount,method,date})} style={{flex:2,padding:11,borderRadius:10,border:"none",background:"#059669",color:"#fff",fontWeight:800,fontSize:14,cursor:"pointer",fontFamily:ff}}>✅ 確認收款</button>
        </div>
      </div>
    </div>
  );
}

function WageCalc({master,onClose}){
  const [area,setArea]=useState(Object.keys(master.areas)[0]);
  const [jt,setJt]=useState("安裝");const [fl,setFl]=useState(1);const [elev,setElev]=useState(false);const [thr,setThr]=useState(false);const [thrR,setThrR]=useState(false);const [lt,setLt]=useState(false);const [fp,setFp]=useState(false);
  const r=calcWage(master,area,jt,fl,thr,lt,fp,thrR,[],0,elev);
  return(
    <Modal onClose={onClose} width={420}>
      <div style={{padding:"16px 20px 12px",borderBottom:"1px solid #F3F4F6",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <div style={{display:"flex",gap:10,alignItems:"center"}}><div style={{width:38,height:38,borderRadius:10,background:master.light,color:master.dark,display:"flex",alignItems:"center",justifyContent:"center",fontWeight:800,fontSize:16}}>{master.avatar}</div><div><div style={{fontWeight:800,fontSize:15}}>{master.name} 工資試算</div></div></div>
        <button onClick={onClose} style={{border:"none",background:"none",fontSize:22,cursor:"pointer",color:"#9CA3AF"}}>✕</button>
      </div>
      <div style={{padding:"14px 20px 20px",display:"grid",gap:12}}>
        <div><label style={lbl}>地區</label><select value={area} onChange={e=>setArea(e.target.value)} onKeyDown={onEnterNext} style={sel}>{Object.keys(master.areas).map(a=><option key={a}>{a}</option>)}</select></div>
        <div><label style={lbl}>工作類型</label><div style={{display:"flex",gap:8}}>{["安裝","拆裝","純配送"].map(t=><button key={t} onClick={()=>setJt(t)} style={{flex:1,padding:"8px 0",borderRadius:8,border:"2px solid",borderColor:jt===t?master.color:"#E5E7EB",background:jt===t?master.light:"#fff",color:jt===t?master.dark:"#374151",fontWeight:700,fontSize:13,cursor:"pointer",fontFamily:ff}}>{t}</button>)}</div></div>
        <div><label style={lbl}>樓層：{fl}F {fl>=4&&!elev?`（+$${(fl-3)*300}）`:""}</label><input type="range" min={1} max={10} value={fl} onChange={e=>setFl(+e.target.value)} style={{width:"100%",accentColor:master.color}}/></div>
        <div style={{display:"flex",gap:12,flexWrap:"wrap"}}>
          <CB label="有電梯" checked={elev} onChange={setElev} color={master.color}/>
          <CB label="裝新門檻 (+$200)" checked={thr} onChange={setThr} color={master.color}/>
          <CB label="拆舊裝新門檻 (+$500)" checked={thrR} onChange={setThrR} color={master.color}/>
          {master.id==="qingyang"&&<><CB label="L型二門 (+$200)" checked={lt} onChange={setLt} color={master.color}/><CB label="固定片 (+$200)" checked={fp} onChange={setFp} color={master.color}/></>}
        </div>
        {r&&(<div style={{padding:16,borderRadius:12,background:master.light,border:"1.5px solid "+master.color+"40"}}>
          <div style={{display:"flex",justifyContent:"space-between",fontSize:13,marginBottom:4}}><span style={{color:"#6B7280"}}>基本工資</span><span>{fmt(r.base)}</span></div>
          {r.extras>0&&<div style={{display:"flex",justifyContent:"space-between",fontSize:13,color:"#D97706",marginBottom:4}}><span>額外</span><span>+{fmt(r.extras)}</span></div>}
          <div style={{height:1,background:master.color+"30",margin:"8px 0"}}/>
          <div style={{display:"flex",justifyContent:"space-between",fontWeight:800,color:master.dark,fontSize:22}}><span>合計</span><span>{fmt(r.total)}</span></div>
        </div>)}
      </div>
    </Modal>
  );
}

function OrderForm({order,defaultDate,pendingOrders=[],onSave,onClose,onDelete}){
  const isEdit=!!order;
  const [form,setForm]=useState(order||{customer:"",phone:"",address:"",masterId:"qingyang",area:Object.keys(MASTERS.qingyang.areas)[0],jobType:"安裝",floor:1,hasThreshold:false,hasThresholdReplace:false,isLType:false,hasFixedPlate:false,extras:[],extraCustom:0,date:defaultDate||todayStr,timeSlot:"上午",appointTime:"",status:"待確認",product:"",note:"",wagePayStatus:"待付",transferDate:null,monthlySettled:false,collectedAmount:0,collectOnSite:false,collectStatus:"待收",hasShipping:false,shipDate:"",carrier:"",trackingNo:"",shipStatus:"待寄出",hasElevator:null,mapUrl:"",priceAdjust:0,linkedOrderId:null});
  const [orderSearch,setOrderSearch]=useState("");
  const [showOrderSearch,setShowOrderSearch]=useState(!isEdit);
  const master=MASTERS[form.masterId],areas=Object.keys(master.areas);
  const wage=calcWage(master,form.area||areas[0],form.jobType,form.floor,form.hasThreshold,form.isLType,form.hasFixedPlate,form.hasThresholdReplace,form.extras,form.extraCustom,form.hasElevator);
  const set=(k,v)=>setForm(f=>({...f,[k]:v}));
  const orderedOrders=pendingOrders.filter(p=>p.ordered&&!p.completed);
  function applyOrder(p){
    const addr=p.addr||p.address||"";
    const det=detectArea(addr,"qingyang")||detectArea(addr,"laiyanming")||detectArea(addr,"guo");
    const masterId=addr.includes("台中")||addr.includes("彰化")||addr.includes("南投")?"laiyanming":addr.includes("台南")||addr.includes("高雄")||addr.includes("屏東")?"guo":"qingyang";
    setForm(f=>({...f,customer:p.cust||p.customer||"",phone:p.phone||"",address:addr,product:p.product||"",masterId,area:det||Object.keys(MASTERS[masterId].areas)[0],linkedOrderId:p.id,hasElevator:p.elev||null}));
    setShowOrderSearch(false);setOrderSearch("");
  }
  return(
    <Modal onClose={onClose}>
      <div style={{padding:"16px 20px 12px",borderBottom:"1px solid #F3F4F6",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <div style={{fontWeight:800,fontSize:16}}>{isEdit?"✏️ 編輯排程":"＋ 新增排程"}</div>
        <div style={{display:"flex",gap:8}}>
          {isEdit&&<button onClick={()=>{if(confirm("確定刪除？"))onDelete(order.id);}} style={{padding:"5px 12px",borderRadius:8,border:"1px solid #FECACA",background:"#FEF2F2",color:"#DC2626",fontSize:12,fontWeight:700,cursor:"pointer",fontFamily:ff}}>刪除</button>}
          <button onClick={onClose} style={{border:"none",background:"none",fontSize:22,cursor:"pointer",color:"#9CA3AF"}}>✕</button>
        </div>
      </div>
      <div style={{flex:1,overflowY:"auto",padding:"14px 20px"}}>
        <div style={{display:"grid",gap:12}}>
          {!isEdit&&(<div style={{marginBottom:4}}>
            <label style={lbl}>從訂單帶入（已下單）</label>
            <select onChange={e=>{const p=pendingOrders.find(x=>String(x.id)===e.target.value);if(p)applyOrder(p);}} style={sel} defaultValue="">
              <option value="">— 選擇已下單訂單 —</option>
              {orderedOrders.map(p=>(
                <option key={p.id} value={p.id}>{p.cust||p.customer||"（未填）"}{p.product?" ／ "+p.product:""}</option>
              ))}
            </select>
            {orderedOrders.length===0&&<div style={{fontSize:11,color:"#9CA3AF",marginTop:4}}>目前沒有已下單的訂單</div>}
          </div>)}
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
            <div><label style={lbl}>客戶姓名</label><input value={form.customer} onChange={e=>set("customer",e.target.value)} style={inp} placeholder="王大明"/></div>
            <div><label style={lbl}>聯絡電話</label><input value={form.phone||""} onChange={e=>set("phone",e.target.value)} style={inp} placeholder="0912-345-678"/></div>
          </div>
          <div><label style={lbl}>施工地址</label><input value={form.address} onChange={e=>{const addr=e.target.value;set("address",addr);const det=detectArea(addr,form.masterId);if(det)set("area",det);if(addr.includes("無電梯"))set("hasElevator",false);else if(addr.includes("有電梯"))set("hasElevator",true);if(!form.mapUrl||form.mapUrl===`https://maps.google.com/?q=${encodeURIComponent(form.address)}`)set("mapUrl",`https://maps.google.com/?q=${encodeURIComponent(addr)}`);}} style={inp} placeholder="台北市信義區..."/></div>
          <div><label style={lbl}>地圖連結</label><div style={{display:"flex",gap:6}}><input value={form.mapUrl||`https://maps.google.com/?q=${encodeURIComponent(form.address||"")}`} onChange={e=>set("mapUrl",e.target.value)} style={{...inp,fontSize:11}} placeholder="自動產生"/>{form.address&&<a href={form.mapUrl||`https://maps.google.com/?q=${encodeURIComponent(form.address)}`} target="_blank" rel="noreferrer" onClick={e=>e.stopPropagation()} style={{padding:"6px 10px",borderRadius:6,background:"#e0f2fe",color:"#0369a1",fontSize:11,fontWeight:600,textDecoration:"none",whiteSpace:"nowrap"}}>開啟</a>}</div></div>
          <div><label style={lbl}>產品描述</label><input value={form.product} onChange={e=>set("product",e.target.value)} style={inp} placeholder="一字三門 清玻 銀色 W150×H190"/></div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10}}>
            <div><label style={lbl}>日期</label><input type="date" value={form.date} onChange={e=>set("date",e.target.value)} onKeyDown={onEnterNext} style={inp}/></div>
            <div><label style={lbl}>預約時間</label><input type="time" value={form.appointTime||""} onChange={e=>set("appointTime",e.target.value)} onKeyDown={onEnterNext} style={inp}/></div>
            <div><label style={lbl}>狀態</label><select value={form.status} onChange={e=>set("status",e.target.value)} onKeyDown={onEnterNext} style={sel}>{Object.keys(STATUS_CFG).map(s=><option key={s}>{s}</option>)}</select></div>
          </div>
          <div>
            <label style={lbl}>指派師傅</label>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8}}>
              {Object.values(MASTERS).map(m=>(<button key={m.id} onClick={()=>{set("masterId",m.id);set("area",Object.keys(m.areas)[0]);}} style={{padding:"10px 8px",borderRadius:12,border:"2px solid",borderColor:form.masterId===m.id?m.color:"#E5E7EB",background:form.masterId===m.id?m.light:"#fff",cursor:"pointer",fontFamily:ff,textAlign:"center"}}><div style={{fontWeight:800,fontSize:18,color:m.dark}}>{m.avatar}</div><div style={{fontSize:12,fontWeight:700,color:m.dark}}>{m.name}</div></button>))}
            </div>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
            <div><label style={lbl}>地區</label><select value={form.area} onChange={e=>set("area",e.target.value)} onKeyDown={onEnterNext} style={sel}>{areas.map(a=><option key={a}>{a}</option>)}</select></div>
            <div><label style={lbl}>工作類型</label><select value={form.jobType} onChange={e=>set("jobType",e.target.value)} onKeyDown={onEnterNext} style={sel}>{["安裝","拆裝","純配送"].map(t=><option key={t}>{t}</option>)}</select></div>
          </div>
          <div><label style={lbl}>樓層：{form.floor}F {form.floor>=4?`（樓層費 +$${(form.floor-3)*300}）`:""}</label><input type="range" min={1} max={10} value={form.floor} onChange={e=>set("floor",Number(e.target.value))} style={{width:"100%",accentColor:master.color}}/></div>
          <div>
            <label style={lbl}>金額微調</label>
            <div style={{display:"flex",alignItems:"center",gap:8}}>
              <button onClick={()=>set("priceAdjust",(form.priceAdjust||0)-100)} style={{width:36,height:36,borderRadius:8,border:"1px solid #E5E7EB",background:"#fff",cursor:"pointer",fontSize:18,fontWeight:700,color:"#374151"}}>−</button>
              <span style={{minWidth:80,textAlign:"center",fontSize:14,fontWeight:600,color:(form.priceAdjust||0)>0?"#059669":(form.priceAdjust||0)<0?"#DC2626":"#888"}}>
                {(form.priceAdjust||0)>0?"+"+(form.priceAdjust||0).toLocaleString():(form.priceAdjust||0)<0?"-"+Math.abs(form.priceAdjust||0).toLocaleString():"$0"}
              </span>
              <button onClick={()=>set("priceAdjust",(form.priceAdjust||0)+100)} style={{width:36,height:36,borderRadius:8,border:"1px solid #E5E7EB",background:"#fff",cursor:"pointer",fontSize:18,fontWeight:700,color:"#374151"}}>＋</button>
              {(form.priceAdjust||0)!==0&&<button onClick={()=>set("priceAdjust",0)} style={{fontSize:11,color:"#9CA3AF",background:"none",border:"none",cursor:"pointer"}}>重置</button>}
            </div>
          </div>
          <div><label style={lbl}>備註</label><textarea value={form.note} onChange={e=>set("note",e.target.value)} onKeyDown={onEnterNext} style={{...inp,height:54,resize:"vertical"}}/></div>
        </div>
        {wage&&(<div style={{marginTop:12,padding:14,borderRadius:12,background:master.light,border:"1.5px solid "+master.color+"40"}}>
          <div style={{fontSize:11,fontWeight:700,color:master.dark,marginBottom:8}}>師傅工資預覽</div>
          <div style={{display:"flex",justifyContent:"space-between",fontWeight:800,color:master.dark,fontSize:18}}><span>合計</span><span>{fmt(wage.total+(form.priceAdjust||0))}</span></div>
          {(form.priceAdjust||0)!==0&&<div style={{fontSize:12,color:master.dark,opacity:0.7}}>基本 {fmt(wage.total)} {(form.priceAdjust||0)>0?"+":""}{(form.priceAdjust||0).toLocaleString()} 調整</div>}
        </div>)}
      </div>
      <div style={{padding:"12px 20px",borderTop:"1px solid #F3F4F6",display:"flex",gap:10}}>
        <button onClick={onClose} style={{flex:1,padding:11,borderRadius:10,border:"1.5px solid #E5E7EB",background:"#fff",cursor:"pointer",fontFamily:ff,fontWeight:600}}>取消</button>
        <button onClick={()=>onSave({...form,id:order?.id||Math.floor(Date.now()/1000)})} style={{flex:2,padding:11,borderRadius:10,border:"none",background:master.color,color:"#fff",fontWeight:800,fontSize:14,cursor:"pointer",fontFamily:ff}}>{isEdit?"儲存修改":"新增排程"}</button>
      </div>
    </Modal>
  );
}

const LOGO_B64="iVBORw0KGgoAAAANSUhEUgAABJ4AAASeCAYAAACHE+TqAAAAAXNSR0IArs4c6QAAAFBlWElmTU0AKgAAAAgAAgESAAMAAAABAAEAAIdpAAQAAAABAAAAJgAAAAAAA6ABAAMAAAABAAEAAKACAAQAAAABAAAEnqADAAQAAAABAAAEngAAAABDz/dxAABAAElEQVR4Aezd+3Yc12Enaj0CHwFriVzLf/IR8Ah8gJMc5O5xLgeT2ySZnAwmHse5EyRm4kkyOUZmxvHETmLEtiRbtsK2LIk2AIWwHVuxbAlNmaasW9Ai6eU/++wNAiRAgWBf6rIvn9aqRYpEd9f+6tdVXT/uqn7sMf8RIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQKFhge/eHF7Z376xe2/3RQsHDNDQCBAgQIECAAAECBAgQIECAAIG2BWLB9OLunaXt67c3tod3RmEZx9+3/bqenwABAgQIECBAgAABAgQIECBAoECBzd0757d2b6+Ekmlnv2iKZdP9ZWS2U4Eb3ZAIECBAgAABAgQIECBAgAABAm0JhKJpMV5CFwqm4ZGS6WjhtP/7MPtpua118LwECBAgQIAAAQIECBAgQIAAAQKFCOzfr+n6nfVQNN29hO7+rKb3FE6xjHpxeGdQyNANgwABAgQIECBAgAABAgQIECBAoGmBacumo7Of4iV4Ta+P5yNAgAABAgQIECBAgAABAgQIEMhYYJ6y6bB4ivd8ypjAqhMgQIAAAQIECBAgQIAAAQIECDQl0ETZdFg6hV93mlovz0OAAAECBAgQIECAAAECBAgQIJChQMNl0737PLnELsMwWGUCBAgQIECAAAECBAgQIECAwLwCsRSa5NvojsxeulcoTfJnLrGbdwt5PAECBAgQIECAAAECBAgQIEAgI4Fruz9aeHH3znIojoaTlEdz/IxL7DLKhVUlQIAAAQIECBAgQIAAAQIECMwkcG1370wom5ZeHN4ZzFEkTTPbaRQLrplW1oMIECBAgAABAgQIECBAgAABAgTSFwiXui1uX7+zHsqmUUeF0345FWdUpa9jDQkQIECAAAECBAgQIECAAAECBKYS6PBSupNnQF2/vTHVCvthAgQIECBAgAABAgQIECBAgACBtAXufivd7Y0uZzad8FrhEru9M2lLWTsCBAgQIECAAAECBAgQIECAAIFHCsTZTfGb40IB1PaNwk+e3TS8c+zP46V9j1xpP0CAAAECBAgQIECAAAECBAgQIJCuQCKzm46VTtu7d1bTFbNmBAgQIECAAAECBAgQIECAAAECDxWIl7ClNLvpgcvsdh664v6CAAECBAgQIECAAAECBAgQIEAgTYEj30x3fIbRA5e5PVAEdfmz4b5OP1pIU89aESBAgAABAgQIECBAgAABAgQIvEfgxd07S6FM2umxUJqsvNr94YX3rLw/IECAAAECBAgQIECAAAECBAgQSEvgyM3CR8kXTnHGlfs6pRUga0OAAAECBAgQIECAAAECBAgQeFAgg8vpTpr95L5OD25I/0+AAAECBAgQIECAAAECBAgQSEUgXk734vDOIIvZTcfvKeW+TqmEyHoQIECAAAECBAgQIECAAAECBA4F4rfThcJpOZRNwwwLp/2ZT3GG1uF4/EqAAAECBAgQIECAAAECBAgQINCzQHb3bzo+w+nepXahdFrpmdLLEyBAgAABAgQIECBAgAABAgQIRIFYOG1fv7Oe6+ymo+sdLwu0VQkQIECAAAECBAgQIECAAAECBHoWyPSG4fdmNh0tnA5+P4yXCfbM6uUJECBAgAABAgQIECBAgAABAvUKxMIp0xuGn1Y6jTZ375yvd6saOQECBAgQIECAAAECBAgQIECgR4FCC6f9Mip++16PtF6awEQCZy9trZy9vDVOYlnbWpxopf0QAQIECBAgQIAAAQIECBA4TSCWMuFStJ0TLk07bQZRPn+3e2f1tPH7OwKpCKRUPKViYj0IECBAgAABAgQIECBAIFOBg8JpWGzhFL7Vzs3EMw1npauteKp0wxs2AQIECBAgQIAAAQIEShKooXByM/GSElvPWBRP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YMCAAQMGDBgwYMCAAQMGDBgwYMCAAQMGDBgwYMCAAQMGDBgwYMCAAQMGDBgwYMCAAQMGDBgwYMCAAQMGDBgwYMCAAQMGDBgwYMCAAQMGDBgwYMCAAQMGDBgwYMCAAQMGDBgwYMCAAQMGDBgwYMCAAQMGDBgwYMCAAQMGDBgwYMCAAQMGDBgwYMCAAQMGDBgwYMCAAQMGDBgwYMCAAQMGDBgwYMCAAQMGDBgwYMCAAQMGDBgwYMCAAQMGDBgwYMCAAQMGDBgwYMCAAQMGDBgwYMCAAQMGDBgwYMCAAQMGDBgwYMCAAQMGDBgwYMCAAQMGDBgwYMCAAQMGDBgwYMCAAQMGDBgwYMCAAQMGDBgwYMCAAQMGDBgwYMCAAQMGDBgwYMCAAQMGDBgwYMCAAQMGDBgwYMCAAQMGDBgwYMCAAQMGDBgwYMCAAQMGDBgwYMCAAQMGDBgwYMCAAQMGDBgwYMCAAQMGDBgwYMCAAQMGDBgwYMCAAQMGDBgwYMCAAQMGDBgwYMCAAQMGDBgwYMCAAQMGDBgwYMCAAQMGDBgwYMCAAQMGDBgwYMCAAQMGDBgwYMCAAQMGDBgwYMCAAQMGDBgwYMCAAQMGDBgwYMCAAQMGDBgwYMCAAQMGDBgwYMCAAQMGDBgwYMCAAQMGDBgwYMCAAQMGDBgwYMCAAQMGDBgwYMCAAQMGDBgwYMCAAQMGDBgwYMCAAQMGDBgwYMCAAQMGDBgwYMCAAQMGDBgwYMCAAQMGDBgwYMCAAQMGDBgwYMCAAQMGDBgwYMCAAQMGDBgwYMCAAQMGDBgwYMCAAQMGDBgwYMCAAQMGDBgwYMCAAQMGDBgwYMCAAQMGDBgwYMCAAQMGDBgwYMCAAQMGDBgwYMCAAQMGDBgwYMCAAQMGDBgwYMCAAQMGDBgwYMCAAQMGDBgwYMCAAQMGDBgwYMCAAQMGDBgwYMCAAQMGDBgwYMCAAQMGDBgwYMCAAQMGDBgwYMCAAQMGDBgwYMCAAQMGDBgwYMCAAQMGDBgwYMCAAQMGDBgwYMCAAQMGDBgwYMCAAQMGDBgwYMCAAQMGDBgwYMCAAQMGDBgwYMCAAQMGDBgwYMCAAQMGDBgwYMCAAQMGDBgwYMCAAQMGDBgwYMCAAQMGDBgwYMCAAQMGDBgwYMCAAQMGDBgwYMCAAQMGDBgwYMCAAQMGDBgwYMCAAQMGDBgwYMCAAQMGDBgwYMCAAQMGDBgwYMCAAQMGDBgwYMCAAQMGDBgwYMCAAQMGDBgwYMCAAQMGDBgwYMCAAQMGDBgwYMCAAQMGDBgwYMCAAQMGDBgwYMCAAQMGDBgwYMCAAQMGDBgwYMCAAQMGDBgwYMCAAQMGDBgwYMCAAQMGDBgwYMCAAQMGDBgwYMCAAQMGDBgwYMCAAQMGDBgwYMCAAQMGDBgwYMCAAQMGDBgwYMCAAQMGDBgwYMCAAQMGDBgwYMCAAQMGDBgwYMCAAQMGDBgwYMCAAQMGDBgwYMCAAQMGDBgwYMCAAQMGDBgwYMCAAQMGDBgwYMCAAQMGDBgwYMCAAQMGDBgwYMCAAQMGDBgwYMCAAQMGDBgwYMCAAQMGDBgwYMCAAQMGDBgwYMCAAQMGDBgwYMCAAQMGDBgwYMCAAQMGDBgwYMCAAQMGDBgwYMCAAQMGDBgwYMCAAQMGDBgwYMCAAQMGDBgwYMCAAQMGDBgwYMCAAQMGDBgwYMCAAQMGDBgwYMCAAQMGDBgwYMCAAQMGDBgwYMCAAQMGDBgwYMCAAQMGDBgwYMCAAQMGDBgwYMCAAQMGDBgwYMCAAQMGDBgwYMCAAQMGDBgwYMCAAQMGDBgwYMCAAQMGDBgwYMCAAQMGDBgwYMCAAQMGDBgwYMCAAQMGDBgwYMCAAQMGDBgwYMCAAQMGDBgwYMCAAQMGDBgwYMCAAQMGDBgwYMCAAQMGDBgwYMCAAQMGDBgwYMCAAQMGDBgwYMCAAQMGDBgwYMCAAQMGDBgwYMCAAQMGDBgwYMCAAQMGDBgwYMCAAQMGDBgwYMCAAQMGDBgwYMCAAQMGDBgwYMCAAQMGDBgwYMCAAQMGDBgwYMCAAQMGDBgwYMCAAQMGDBgwYMCAAQMGDBgwYMCAAQMGDBgwYMCAAQMGDBgwYMCAAQMGDBgwYMCAAQMGDBgwYMCAAQMGDBgwYMCAAQMGDBgwYMCAAQMGDBgwYMCAAQMGDBgwYMCAAQMGDBgwYMCAAQMGDBgwYMCAAQMGDBgwYMCAAQMGDBgwYMCAAQMGDBgwYMCAAQMGDBgwYMCAAQMGDBgwYMCAAQMGDBgwYMCAAQMGDBgwYMCAAQMGDBgwYMCAAQMGDBgwYMCAAQMGDBgwYMCAAQMGDBgwYMCAAQMGDBgwYMCAAQMGDBgwYMCAAQMGDBgwYMCAAQMGDBgwYMCAAQMGDBgwYMCAAQMGDBgwYMCAAQMGDBgwYMCAAQMGDBgwYMCAAQMGDBgwYMCAAQMGDBgwYMCAAQMGDBgwYMCAAQMGZgMBHINsgvO4S8UAAAAASUVORK5CYII=";

// DeliveryModal v2 - 儲存出貨 + 下載PDF
function DeliveryModal({order,onClose,onShipped}){
  const ref=useRef(null);
  const todayISO=new Date().toISOString().slice(0,10);

  // 從 quoteItems 拆出品項＋安裝費＋運費
  function buildItems(order){
    const rows=[];
    const qItems=order.quoteItems||[];
    qItems.forEach((qi,i)=>{
      if(qi.cat==="加購品"){
        const t=qi.addonType||"毛巾桿";
        const name=t==="自填"?(qi.addonName||"加購品"):t;
        const price=t==="毛巾桿"?(qi.towel||1)*200:t==="鋁門檻"?Math.round(qi.thrMm||0):t==="L型鋁門檻"?Math.round((qi.thrMm||0)+(qi.thrMm2||0)):(qi.addonPrice||0);
        rows.push({id:"addon"+i,name,qty:1,unit:"項",price,note:""});
      } else {
        const name=qi.dt==="固定片"?`固定片 ${qi.mat||""} ${qi.col||""}`.trim():`${qi.dt||""} ${qi.mat||""} ${qi.col||""}`.trim()||order.product||"";
        const prodPrice=(qi.productPrice||0)+(qi.adjust||0);
        rows.push({id:"prod"+i,name:name||"門",qty:1,unit:"樘",price:prodPrice,note:""});
        // 安裝費（基本）
        const instBase=qi.installFeeBase||qi.installFee||0;
        const thrInstFee=qi.instType!=="純寄送"&&qi.hasThr?200:0; if(instBase+thrInstFee>0)rows.push({id:"inst"+i,name:qi.instType==="含拆舊"?"拆裝費":"安裝費",qty:1,unit:"式",price:instBase+thrInstFee,note:""});
        // 運費加成
        if((qi.shipSurcharge||0)>0)rows.push({id:"ship"+i,name:"運費",qty:1,unit:"式",price:qi.shipSurcharge,note:""});
        // 樓層費
        if((qi.floorFee||0)>0)rows.push({id:"floor"+i,name:"樓層費",qty:1,unit:"式",price:qi.floorFee,note:""});
        // 鋁門檻（從 thrMm 計算或用存的價格）
        const thrPrice=qi.thresholdPrice||(qi.hasThr&&qi.thrMm>0?Math.round(qi.thrMm):0);
        if(thrPrice>0)rows.push({id:"thr"+i,name:`鋁門檻（${(qi.thrMm||0)/10} cm）`,qty:1,unit:"式",price:thrPrice,note:""});
        // 門檻安裝費已合併進安裝費
        // 毛巾桿（從 towel 數量計算）
        const towelQty=qi.towel||0;
        if(towelQty>0)rows.push({id:"towel"+i,name:"毛巾桿",qty:towelQty,unit:"支",price:200,note:""});
      }
    });
    // 運費（進南）
    const ship=order.shippingFee||0;
    if(ship>0)rows.push({id:"ship",name:"運費（進南貨運）",qty:1,unit:"式",price:ship,note:""});
    return rows.length>0?rows:[{id:"default",name:order.product||"",qty:1,unit:"樘",price:0,note:""}];
  }

  const [form,setForm]=useState({
    custName:order.cust||order.customer||"",
    taxId:order.taxId||"",
    receiver:order.cust||order.customer||"",
    receiverPhone:order.phone||"",
    address:order.addr||order.address||"",
    shipMethod:order.shipMethod||"安裝",
    shipDate:todayISO,
    invoiceNo:order.invoiceNo||"",
    showPrice:false,
    taxMode:"無",
    items:buildItems(order),
    extraRows:[],
    paymentNote:(()=>{
      if(order.payStatus==="已付清")return`已付清 $${(order.totalAmount||0).toLocaleString()}`;
      if(order.payStatus==="已收定金"){
        const deposit=order.depositAmount||0;
        const balance=(order.totalAmount||0)-deposit;
        return`已收定金 $${deposit.toLocaleString()}\n尾款 $${balance.toLocaleString()}`;
      }
      return "";
    })(),
  });
  const set=(k,v)=>setForm(f=>({...f,[k]:v}));
  const setItem=(i,k,v)=>setForm(f=>({...f,items:f.items.map((it,idx)=>idx===i?{...it,[k]:v}:it)}));
  const setExtra=(i,k,v)=>setForm(f=>({...f,extraRows:f.extraRows.map((r,idx)=>idx===i?{...r,[k]:v}:r)}));
  const addItem=()=>setForm(f=>({...f,items:[...f.items,{id:Date.now(),name:"",qty:1,unit:"樘",price:0,note:""}]}));
  const removeItem=i=>setForm(f=>({...f,items:f.items.filter((_,idx)=>idx!==i)}));
  const addExtra=()=>setForm(f=>({...f,extraRows:[...f.extraRows,{id:Date.now(),name:"",qty:1,unit:"支",price:0,note:""}]}));
  const removeExtra=i=>setForm(f=>({...f,extraRows:f.extraRows.filter((_,idx)=>idx!==i)}));
  const allRows=[...form.items,...form.extraRows];
  const subtotal=form.showPrice?allRows.reduce((s,r)=>s+(Number(r.price||0)*Number(r.qty||1)),0):0;
  const tax=form.showPrice?(form.taxMode==="稅外加"?Math.round(subtotal*0.05):form.taxMode==="稅內含"?Math.round(subtotal-subtotal/1.05):0):0;
  const total=form.showPrice?(form.taxMode==="稅外加"?subtotal+tax:subtotal):0;
  const [saved,setSaved]=useState(order.shipped||false);

  function handleSave(){
    if(onShipped)onShipped(form.invoiceNo||"",form.showPrice?total:0);
    setSaved(true);
  }

  function handlePrint(){
    const el=ref.current;if(!el)return;
    const s=document.createElement("script");
    s.src="https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js";
    s.onload=()=>{
      window.html2canvas(el,{scale:2,backgroundColor:"#fff",useCORS:true,width:794,windowWidth:794}).then(canvas=>{
        const js2=document.createElement("script");
        js2.src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js";
        js2.onload=()=>{
          const pdf=new window.jspdf.jsPDF({orientation:"portrait",unit:"px",format:"a4"});
          const pgW=pdf.internal.pageSize.getWidth();
          const imgW=pgW;
          const imgH=(canvas.height/canvas.width)*imgW;
          pdf.addImage(canvas.toDataURL("image/png"),"PNG",0,0,imgW,imgH);
          pdf.save("出貨單_"+(form.custName||"客戶")+"_"+form.shipDate+".pdf");
        };
        document.head.appendChild(js2);
      });
    };
    document.head.appendChild(s);
  }

  const dff="'Noto Sans TC','PingFang TC',sans-serif";
  const cell={border:"1px solid #aaa",padding:"5px 7px",fontSize:12,verticalAlign:"middle"};
  return(
    <Modal onClose={onClose} width={660}>
      <div style={{padding:"14px 20px 10px",borderBottom:"1px solid #F3F4F6",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <div style={{fontWeight:800,fontSize:16}}>📄 出貨單{saved&&<span style={{marginLeft:8,fontSize:12,color:"#0369a1",fontWeight:600,background:"#e0f2fe",padding:"2px 10px",borderRadius:20}}>✅ 已出貨</span>}</div>
        <div style={{display:"flex",gap:8}}>
          <button onClick={handleSave} style={{padding:"7px 18px",borderRadius:8,border:"none",background:saved?"#059669":"#1E293B",color:"#fff",fontWeight:700,fontSize:13,cursor:"pointer",fontFamily:dff}}>{saved?"✅ 已儲存":"💾 儲存出貨"}</button>
          <button onClick={handlePrint} style={{padding:"7px 18px",borderRadius:8,border:"none",background:"#0ea5e9",color:"#fff",fontWeight:700,fontSize:13,cursor:"pointer",fontFamily:dff}}>⬇️ 下載PDF</button>
          <button onClick={onClose} style={{border:"none",background:"none",fontSize:22,cursor:"pointer",color:"#9CA3AF"}}>✕</button>
        </div>
      </div>

      {/* 設定區 */}
      <div style={{padding:"12px 20px",background:"#F8FAFC",borderBottom:"1px solid #E2E8F0",display:"flex",gap:12,flexWrap:"wrap",alignItems:"center"}}>
        <label style={{display:"flex",alignItems:"center",gap:6,fontSize:13,cursor:"pointer"}}>
          <input type="checkbox" checked={form.showPrice} onChange={e=>set("showPrice",e.target.checked)}/> 顯示金額
        </label>
        {form.showPrice&&<>
          <span style={{fontSize:12,color:"#64748b"}}>稅額：</span>
          {["無","稅內含","稅外加"].map(t=>(
            <button key={t} onClick={()=>set("taxMode",t)} style={{padding:"3px 10px",borderRadius:6,fontSize:12,cursor:"pointer",border:form.taxMode===t?"2px solid #0ea5e9":"1px solid #ddd",background:form.taxMode===t?"#e0f2fe":"#fff",fontWeight:form.taxMode===t?700:400}}>{t}</button>
          ))}
        </>}
      </div>

      <div style={{flex:1,overflowY:"auto",padding:"14px 20px"}}>
        {/* 表單欄位 */}
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:12}}>
          <div><label style={lbl}>客戶名稱</label><input value={form.custName} onChange={e=>set("custName",e.target.value)} onKeyDown={onEnterNext} style={inp}/></div>
          <div><label style={lbl}>統一編號</label><input value={form.taxId} onChange={e=>set("taxId",e.target.value)} style={inp} placeholder="（可空白）"/></div>
          <div><label style={lbl}>收件人</label><input value={form.receiver} onChange={e=>set("receiver",e.target.value)} onKeyDown={onEnterNext} style={inp}/></div>
          <div><label style={lbl}>收件人電話</label><input value={form.receiverPhone} onChange={e=>set("receiverPhone",e.target.value)} onKeyDown={onEnterNext} style={inp}/></div>
          <div style={{gridColumn:"1/-1"}}><label style={lbl}>送貨地址</label><input value={form.address} onChange={e=>set("address",e.target.value)} onKeyDown={onEnterNext} style={inp}/></div>
          <div><label style={lbl}>送貨方式</label><input value={form.shipMethod} onChange={e=>set("shipMethod",e.target.value)} onKeyDown={onEnterNext} style={inp}/></div>
          <div><label style={lbl}>出貨日期</label><input type="date" value={form.shipDate} onChange={e=>set("shipDate",e.target.value)} onKeyDown={onEnterNext} style={inp}/></div>
          <div style={{gridColumn:"1/-1"}}><label style={lbl}>發票號碼</label><input value={form.invoiceNo} onChange={e=>set("invoiceNo",e.target.value)} style={inp} placeholder="（手填）"/></div>
          <div style={{gridColumn:"1/-1"}}><label style={lbl}>收款備註</label><textarea value={form.paymentNote||""} onChange={e=>set("paymentNote",e.target.value)} style={{...inp,height:54,resize:"vertical",fontFamily:ff}} rows={2}/></div>
        </div>

        {/* 品項 */}
        <div style={{fontSize:12,fontWeight:700,color:"#374151",marginBottom:6}}>品項</div>
        {form.items.map((it,i)=>(
          <div key={it.id} style={{display:"grid",gridTemplateColumns:"2fr 1fr 1fr"+(form.showPrice?" 1fr":"")+" 1.5fr auto",gap:6,marginBottom:6,alignItems:"center"}}>
            <input value={it.name} onChange={e=>setItem(i,"name",e.target.value)} style={{...inp,fontSize:12}} placeholder="品名"/>
            <input type="number" value={it.qty} onChange={e=>setItem(i,"qty",e.target.value)} style={{...inp,fontSize:12}} placeholder="數量"/>
            <input value={it.unit} onChange={e=>setItem(i,"unit",e.target.value)} style={{...inp,fontSize:12}} placeholder="單位"/>
            {form.showPrice&&<input type="number" value={it.price} onChange={e=>setItem(i,"price",e.target.value)} style={{...inp,fontSize:12}} placeholder="單價"/>}
            <input value={it.note} onChange={e=>setItem(i,"note",e.target.value)} style={{...inp,fontSize:12}} placeholder="備註"/>
            <button onClick={()=>removeItem(i)} style={{background:"#FEF2F2",border:"1px solid #FECACA",borderRadius:6,color:"#DC2626",fontSize:12,cursor:"pointer",padding:"4px 8px"}}>✕</button>
          </div>
        ))}
        <button onClick={addItem} style={{fontSize:12,color:"#0ea5e9",background:"none",border:"1px dashed #0ea5e9",borderRadius:6,padding:"4px 12px",cursor:"pointer",marginBottom:10}}>＋ 新增品項</button>

        <div style={{fontSize:12,fontWeight:700,color:"#374151",marginBottom:6}}>加購品項</div>
        {form.extraRows.map((r,i)=>(
          <div key={r.id} style={{display:"grid",gridTemplateColumns:"2fr 1fr 1fr"+(form.showPrice?" 1fr":"")+" 1.5fr auto",gap:6,marginBottom:6,alignItems:"center"}}>
            <input value={r.name} onChange={e=>setExtra(i,"name",e.target.value)} style={{...inp,fontSize:12}} placeholder="品名"/>
            <input type="number" value={r.qty} onChange={e=>setExtra(i,"qty",e.target.value)} style={{...inp,fontSize:12}} placeholder="數量"/>
            <input value={r.unit} onChange={e=>setExtra(i,"unit",e.target.value)} style={{...inp,fontSize:12}} placeholder="單位"/>
            {form.showPrice&&<input type="number" value={r.price} onChange={e=>setExtra(i,"price",e.target.value)} style={{...inp,fontSize:12}} placeholder="單價"/>}
            <input value={r.note} onChange={e=>setExtra(i,"note",e.target.value)} style={{...inp,fontSize:12}} placeholder="備註"/>
            <button onClick={()=>removeExtra(i)} style={{background:"#FEF2F2",border:"1px solid #FECACA",borderRadius:6,color:"#DC2626",fontSize:12,cursor:"pointer",padding:"4px 8px"}}>✕</button>
          </div>
        ))}
        <button onClick={addExtra} style={{fontSize:12,color:"#059669",background:"none",border:"1px dashed #059669",borderRadius:6,padding:"4px 12px",cursor:"pointer",marginBottom:16}}>＋ 新增加購品項</button>

        {/* A4預覽 */}
        <div style={{fontSize:12,fontWeight:700,color:"#374151",marginBottom:8}}>預覽（A4）</div>
        <div style={{border:"1px solid #ddd",borderRadius:4,overflow:"auto"}}>
          <div ref={ref} style={{width:794,background:"#fff",padding:"40px 48px",fontFamily:dff,boxSizing:"border-box",fontSize:13,textAlign:"left"}}>
            {/* 標頭 */}
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:16}}>
              <div style={{display:"flex",alignItems:"center",gap:12}}>
                <img src={"data:image/png;base64,"+LOGO_B64} alt="logo" style={{width:56,height:56,objectFit:"contain"}}/>
                <div><div style={{fontSize:20,fontWeight:800,letterSpacing:2}}>享浴有限公司</div><div style={{fontSize:16,fontWeight:700,marginTop:2}}>出　貨　單</div></div>
              </div>
              <div style={{fontSize:12,textAlign:"right",lineHeight:1.8}}>
                <div style={{fontSize:15,fontWeight:800}}>{form.invoiceNo||"（未填發票號碼）"}</div>
                <div>出貨日期：{form.shipDate}</div>
              </div>
            </div>

            {/* 客戶資訊表格 */}
            <table style={{width:"100%",borderCollapse:"collapse",marginBottom:14}}>
              <tbody>
                <tr>
                  <td style={{...cell,background:"#f5f5f5",fontWeight:700,width:90}}>客戶名稱</td>
                  <td style={{...cell,width:200}}>{form.custName}</td>
                  <td style={{...cell,background:"#f5f5f5",fontWeight:700,width:90}}>統一編號</td>
                  <td style={cell}>{form.taxId}</td>
                </tr>
                <tr>
                  <td style={{...cell,background:"#f5f5f5",fontWeight:700}}>收件人</td>
                  <td style={cell}>{form.receiver}</td>
                  <td style={{...cell,background:"#f5f5f5",fontWeight:700}}>收件電話</td>
                  <td style={cell}>{form.receiverPhone}</td>
                </tr>
                <tr>
                  <td style={{...cell,background:"#f5f5f5",fontWeight:700}}>送貨地址</td>
                  <td colSpan={3} style={cell}>{form.address}</td>
                </tr>
                <tr>
                  <td style={{...cell,background:"#f5f5f5",fontWeight:700}}>運送方式</td>
                  <td colSpan={3} style={cell}>{form.shipMethod}</td>
                </tr>
              </tbody>
            </table>

            {/* 品項表格 */}
            <table style={{width:"100%",borderCollapse:"collapse",marginBottom:8}}>
              <thead>
                <tr style={{background:"#1a1a2e",color:"#fff"}}>
                  <th style={{...cell,fontWeight:700,textAlign:"center",width:32}}>項次</th>
                  <th style={{...cell,fontWeight:700,textAlign:"left"}}>品名</th>
                  <th style={{...cell,fontWeight:700,textAlign:"center",width:50}}>數量</th>
                  <th style={{...cell,fontWeight:700,textAlign:"center",width:50}}>單位</th>
                  {form.showPrice&&<><th style={{...cell,fontWeight:700,textAlign:"right",width:80}}>單價</th><th style={{...cell,fontWeight:700,textAlign:"right",width:80}}>金額</th></>}
                  <th style={{...cell,fontWeight:700,textAlign:"left"}}>備註</th>
                </tr>
              </thead>
              <tbody>
                {allRows.map((r,i)=>(
                  <tr key={r.id}>
                    <td style={{...cell,textAlign:"center"}}>{i+1}</td>
                    <td style={cell}>{r.name}</td>
                    <td style={{...cell,textAlign:"center"}}>{r.qty}</td>
                    <td style={{...cell,textAlign:"center"}}>{r.unit}</td>
                    {form.showPrice&&<><td style={{...cell,textAlign:"right"}}>{Number(r.price||0).toLocaleString()}</td><td style={{...cell,textAlign:"right"}}>{(Number(r.price||0)*Number(r.qty||1)).toLocaleString()}</td></>}
                    <td style={cell}>{r.note}</td>
                  </tr>
                ))}
                {/* 空行補足 */}
                {Array.from({length:Math.max(0,6-allRows.length)}).map((_,i)=>(
                  <tr key={"empty"+i}>
                    <td style={{...cell,height:26}}></td><td style={cell}></td><td style={cell}></td><td style={cell}></td>
                    {form.showPrice&&<><td style={cell}></td><td style={cell}></td></>}
                    <td style={cell}></td>
                  </tr>
                ))}
                {/* 金額列 */}
                {form.showPrice&&<>
                  <tr><td colSpan={form.showPrice?5:4} rowSpan={form.taxMode==="無"?1:2} style={{...cell,border:"none"}}></td><td style={{...cell,background:form.taxMode==="稅外加"?"#f5f5f5":"#1a1a2e",color:form.taxMode==="稅外加"?"#111":"#fff",fontWeight:700,textAlign:"right"}}>{form.taxMode==="無"?"合計金額":form.taxMode==="稅內含"?"合計金額（含稅）":"合計金額"}</td><td style={{...cell,background:form.taxMode==="稅內含"?"#1a1a2e":"inherit",color:form.taxMode==="稅內含"?"#fff":"inherit",fontWeight:form.taxMode==="稅內含"?700:400,textAlign:"right"}}>{subtotal.toLocaleString()}</td></tr>
                  {form.taxMode==="稅外加"&&<><tr><td style={{...cell,background:"#1a1a2e",color:"#fff",fontWeight:700,textAlign:"right"}}>總金額（含稅）</td><td style={{...cell,background:"#1a1a2e",color:"#fff",fontWeight:700,textAlign:"right"}}>{total.toLocaleString()}</td></tr></>}
                </>}
              </tbody>
            </table>

            {/* 收款備註 */}
            {form.paymentNote&&<div style={{marginTop:16,padding:"10px 14px",background:"#f8f7f3",borderRadius:8,fontSize:13,whiteSpace:"pre-line"}}>{form.paymentNote}</div>}
            {/* 簽收欄 */}
            <div style={{display:"flex",gap:24,marginTop:20}}>
              <div style={{flex:1,borderTop:"1.5px solid #333",paddingTop:8,fontSize:12,textAlign:"center",color:"#555"}}>客戶簽收</div>
              <div style={{flex:1,borderTop:"1.5px solid #333",paddingTop:8,fontSize:12,textAlign:"center",color:"#555"}}>收貨日期</div>
              <div style={{flex:1}}></div>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
}

// DeliveryTab - 出貨單分頁
function DeliveryTab({pendingOrders,onMarkShipped,autoOpen,onAutoOpenDone}){
  const [selectedOrder,setSelectedOrder]=useState(null);
  const [search,setSearch]=useState("");
  const [dateFrom,setDateFrom]=useState("");
  const [dateTo,setDateTo]=useState("");

  useEffect(()=>{
    if(autoOpen){setSelectedOrder(autoOpen);if(onAutoOpenDone)onAutoOpenDone();}
  },[autoOpen]);
  const shipped=pendingOrders.filter(p=>{
    if(!p.shipped&&!p.ordered)return false;
    if(search&&!(p.cust||p.customer||"").includes(search)&&!(p.addr||p.address||"").includes(search)&&!(p.product||"").includes(search)&&!(p.invoiceNo||"").includes(search))return false;
    if(dateFrom&&(p.shippedAt||"")<dateFrom)return false;
    if(dateTo&&(p.shippedAt||"")>dateTo)return false;
    return true;
  });
  const unshipped=pendingOrders.filter(p=>!p.shipped);
  const todayStr2=new Date().toISOString().slice(0,10);

  function handlePrintAll(){
    const rows=shipped.map((p,i)=>`${i+1}\t${p.shippedAt||""}\t${p.cust||p.customer||""}\t${p.invoiceNo||""}\t${p.shipMethod||""}\t${p.shippedTotal||""}`).join("\n");
    const w=window.open("","_blank");
    w.document.write("<pre style='font-family:monospace;padding:20px'>出貨單列表\n\n#\t日期\t客戶\t發票號碼\t送貨方式\t金額\n"+rows+"</pre>");
    w.print();
  }

  return(
    <div style={{fontFamily:ff}}>
      {/* 工具列 */}
      <div style={{background:"#fff",borderRadius:12,padding:"14px 16px",marginBottom:14,border:"1px solid #E2E8F0",display:"flex",gap:10,alignItems:"center",flexWrap:"wrap"}}>
        <div style={{display:"flex",alignItems:"center",gap:6}}>
          <span style={{fontSize:12,color:"#6B7280"}}>日期</span>
          <input type="date" value={dateFrom} onChange={e=>setDateFrom(e.target.value)} style={{...inp,width:130,fontSize:12}}/>
          <span style={{fontSize:12,color:"#6B7280"}}>～</span>
          <input type="date" value={dateTo} onChange={e=>setDateTo(e.target.value)} style={{...inp,width:130,fontSize:12}}/>
        </div>
        <input value={search} onChange={e=>setSearch(e.target.value)} style={{...inp,width:180,fontSize:12}} placeholder="搜尋客戶、發票號碼..."/>
        <button onClick={()=>{setDateFrom("");setDateTo("");setSearch("");}} style={{padding:"6px 14px",borderRadius:8,border:"1px solid #E5E7EB",background:"#fff",fontSize:12,cursor:"pointer",fontFamily:ff}}>清除</button>
        <button onClick={handlePrintAll} style={{padding:"6px 14px",borderRadius:8,border:"none",background:"#059669",color:"#fff",fontSize:12,fontWeight:700,cursor:"pointer",fontFamily:ff}}>🖨️ 列印</button>
      </div>

      {/* 新增出貨單 */}
      <div style={{marginBottom:14}}>
        <div style={{fontSize:12,fontWeight:700,color:"#374151",marginBottom:8}}>開新出貨單</div>
        <div style={{display:"grid",gap:8}}>
          {unshipped.length===0?<div style={{fontSize:12,color:"#9CA3AF"}}>目前沒有待出貨的訂單</div>:unshipped.map(p=>{
            const name=p.cust||p.customer||"（未填）";
            return(
              <div key={p.id} style={{background:"#fff",borderRadius:10,border:"1px solid #E2E8F0",padding:"10px 14px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                <div>
                  <span style={{fontWeight:700,fontSize:14,marginRight:10}}>{name}</span>
                  {p.phone&&<span style={{fontSize:12,color:"#6B7280",marginRight:8}}>{p.phone}</span>}
                  <span style={{fontSize:11,color:"#0369a1",background:"#e0f2fe",padding:"2px 7px",borderRadius:10}}>{p.shipMethod||"安裝"}</span>
                  {p.product&&<div style={{fontSize:12,color:"#94A3B8",marginTop:3}}>📦 {p.product}</div>}
                </div>
                <button onClick={()=>setSelectedOrder(p)} style={{padding:"7px 16px",borderRadius:8,border:"none",background:"#0ea5e9",color:"#fff",fontWeight:700,fontSize:12,cursor:"pointer",fontFamily:ff,flexShrink:0}}>📄 開出貨單</button>
              </div>
            );
          })}
        </div>
      </div>

      {/* 出貨紀錄表格 */}
      <div style={{fontSize:12,fontWeight:700,color:"#374151",marginBottom:8}}>出貨紀錄（{shipped.length} 筆）</div>
      <div style={{background:"#fff",borderRadius:12,border:"1px solid #E2E8F0",overflow:"hidden"}}>
        <table style={{width:"100%",borderCollapse:"collapse",fontSize:13}}>
          <thead>
            <tr style={{background:"#1E293B",color:"#fff"}}>
              {["日期","客戶名稱","發票號碼","送貨方式","總金額","備註"].map(h=>(
                <th key={h} style={{padding:"10px 12px",textAlign:"left",fontWeight:700,fontSize:12,whiteSpace:"nowrap"}}>{h}</th>
              ))}
              <th style={{padding:"10px 12px",width:80}}></th>
            </tr>
          </thead>
          <tbody>
            {shipped.length===0?(
              <tr><td colSpan={7} style={{textAlign:"center",padding:"40px 0",color:"#9CA3AF",fontSize:14}}>尚無出貨紀錄</td></tr>
            ):shipped.map((p,i)=>(
              <tr key={p.id} style={{borderBottom:"1px solid #F1F5F9",background:i%2===0?"#fff":"#FAFAFA"}}>
                <td style={{padding:"10px 12px",whiteSpace:"nowrap"}}>{p.shippedAt||""}</td>
                <td style={{padding:"10px 12px",fontWeight:600}}>{p.cust||p.customer||""}</td>
                <td style={{padding:"10px 12px",color:"#6B7280"}}>{p.invoiceNo||""}</td>
                <td style={{padding:"10px 12px"}}>{p.shipMethod||""}</td>
                <td style={{padding:"10px 12px",textAlign:"right",fontWeight:600}}>{p.shippedTotal?`$${Number(p.shippedTotal).toLocaleString()}`:""}</td>
                <td style={{padding:"10px 12px",fontSize:11,color:"#94A3B8",maxWidth:160,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{p.note||""}</td>
                <td style={{padding:"10px 12px"}}>
                  <button onClick={()=>setSelectedOrder(p)} style={{padding:"4px 10px",borderRadius:6,border:"1px solid #E5E7EB",background:"#fff",fontSize:11,cursor:"pointer",fontFamily:ff}}>重新開單</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selectedOrder&&<DeliveryModal order={selectedOrder} onClose={()=>setSelectedOrder(null)} onShipped={(invoiceNo,total)=>{onMarkShipped(selectedOrder.id,invoiceNo,total);setSelectedOrder(null);}}/>}
    </div>
  );
}

function PendingOrdersTab({pendingOrders,onEdit,onDelete,onToggleOrdered}){
  const [filter,setFilter]=useState("pending");const [search,setSearch]=useState("");
  const [timeFilter,setTimeFilter]=useState("all");
  const [deliveryOrder,setDeliveryOrder]=useState(null);
  const [workOrderItem,setWorkOrderItem]=useState(null);

  function getTimeRange(tf){
    const now=new Date();
    if(tf==="week"){const d=new Date(now);d.setDate(d.getDate()-d.getDay());d.setHours(0,0,0,0);return[d.toISOString().slice(0,10),null];}
    if(tf==="month"){return[`${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,"0")}-01`,null];}
    if(tf==="lastmonth"){const lm=new Date(now.getFullYear(),now.getMonth()-1,1);const lmEnd=new Date(now.getFullYear(),now.getMonth(),0);return[lm.toISOString().slice(0,10),lmEnd.toISOString().slice(0,10)];}
    return[null,null];
  }
  const [tFrom,tTo]=getTimeRange(timeFilter);

  const visible=pendingOrders.filter(p=>{
    if(filter==="pending"&&(p.scheduled||p.ordered||p.shipped||p.completed))return false;
    if(filter==="ordered"&&(!p.ordered||p.scheduled||p.shipped||p.completed))return false;
    if(filter==="scheduled"&&(!p.scheduled||p.shipped||p.completed))return false;
    if(filter==="shipped"&&(!p.shipped||p.completed))return false;
    if(filter==="completed"&&!p.completed)return false;
    if(search&&!p.customer?.includes(search)&&!(p.cust||"").includes(search)&&!p.address?.includes(search)&&!p.product?.includes(search))return false;
    if(tFrom&&(p.orderDate||"")<tFrom)return false;
    if(tTo&&(p.orderDate||"")>tTo)return false;
    return true;
  });
  const pCount=pendingOrders.filter(p=>!p.scheduled).length,sCount=pendingOrders.filter(p=>p.scheduled).length;
  return(
    <div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr 1fr 1fr 1fr",gap:8,marginBottom:14}}>
        {[{label:"待處理",count:pendingOrders.filter(p=>!p.scheduled&&!p.ordered&&!p.shipped&&!p.completed).length,color:"#D97706",bg:"#FEF3C7",f:"pending"},{label:"已下單",count:pendingOrders.filter(p=>p.ordered&&!p.scheduled&&!p.shipped&&!p.completed).length,color:"#7c3aed",bg:"#F3E8FF",f:"ordered"},{label:"已排程",count:pendingOrders.filter(p=>p.scheduled&&!p.shipped&&!p.completed).length,color:"#059669",bg:"#D1FAE5",f:"scheduled"},{label:"已出貨",count:pendingOrders.filter(p=>p.shipped&&!p.completed).length,color:"#0ea5e9",bg:"#e0f2fe",f:"shipped"},{label:"已完成",count:pendingOrders.filter(p=>p.completed).length,color:"#059669",bg:"#D1FAE5",f:"completed"},{label:"全部",count:pendingOrders.length,color:"#3B82F6",bg:"#DBEAFE",f:"all"}].map(({label,count,color,bg,f})=>(
          <div key={f} onClick={()=>setFilter(f)} style={{padding:"12px 16px",borderRadius:12,background:filter===f?bg:"#fff",border:"1.5px solid "+(filter===f?color:"#E2E8F0"),cursor:"pointer"}}>
            <div style={{fontSize:11,color:"#6B7280"}}>{label}</div><div style={{fontSize:22,fontWeight:800,color}}>{count}</div>
          </div>
        ))}
      </div>
      <div style={{display:"flex",gap:6,marginBottom:10,flexWrap:"wrap"}}>
        {[["all","全部"],["week","本週"],["month","本月"],["lastmonth","上月"]].map(([v,l])=>(
          <button key={v} onClick={()=>setTimeFilter(v)} style={{padding:"5px 14px",borderRadius:20,border:"1.5px solid "+(timeFilter===v?"#3B82F6":"#E5E7EB"),background:timeFilter===v?"#DBEAFE":"#fff",color:timeFilter===v?"#1D4ED8":"#6B7280",fontSize:12,fontWeight:timeFilter===v?700:400,cursor:"pointer",fontFamily:ff}}>{l}</button>
        ))}
      </div>
      <input value={search} onChange={e=>setSearch(e.target.value)} style={{...inp,marginBottom:12}} placeholder="搜尋客戶、地址、品項..."/>
      {visible.length===0?(<div style={{textAlign:"center",padding:60,color:"#9CA3AF"}}><div style={{fontSize:36,marginBottom:10}}>📭</div><div style={{fontSize:14}}>目前沒有符合的訂單</div></div>):(
        <div style={{display:"grid",gap:8}}>
          {[...visible].sort((a,b)=>(b.orderDate||"").localeCompare(a.orderDate||"")).map(p=>{
            const statusColor=p.completed?"#059669":p.shipped?"#0ea5e9":p.scheduled?"#22c55e":p.ordered?"#7c3aed":"#f59e0b";
            const statusLabel=p.completed?"已完成":p.shipped?"已出貨":p.scheduled?"已排程":p.ordered?"已下單":"待處理";
            const statusBg=p.completed?"#D1FAE5":p.shipped?"#e0f2fe":p.scheduled?"#dcfce7":p.ordered?"#F3E8FF":"#FEF3C7";
            const statusTextColor=p.completed?"#065F46":p.shipped?"#0369a1":p.scheduled?"#15803d":p.ordered?"#6d28d9":"#92400E";
            return(
            <div key={p.id} style={{background:"#fff",borderRadius:12,overflow:"hidden",border:"1px solid #E2E8F0",boxShadow:"0 1px 4px rgba(0,0,0,0.04)",display:"flex",textAlign:"left"}}>
              <div style={{width:5,background:statusColor,flexShrink:0,borderRadius:"12px 0 0 12px"}}/>
              <div style={{flex:1,minWidth:0}}>
                <div style={{padding:"11px 14px 8px",display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:8}}>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:4,flexWrap:"wrap"}}>
                      {p.orderDate&&<span style={{fontSize:11,color:"#94A3B8",fontFamily:"monospace"}}>{p.orderDate}</span>}
                      <span style={{fontWeight:800,fontSize:15}}>{p.cust||p.customer||"（未填姓名）"}</span>
                      {p.shopMode==="蝦皮"&&<span style={{fontSize:11,color:"#e67e22",background:"#fef3c7",padding:"2px 6px",borderRadius:4,fontWeight:700}}>蝦皮</span>}
                      {p.phone&&<span style={{fontSize:12,color:"#6B7280"}}>{p.phone}</span>}
                      <span style={{fontSize:11,fontWeight:700,color:p.shipMethod==="寄進南"?"#6366f1":"#059669",background:p.shipMethod==="寄進南"?"#EEF2FF":"#D1FAE5",padding:"2px 8px",borderRadius:10}}>{p.shipMethod==="寄進南"?"🚚 寄送":"🔧 安裝"}</span>
                    </div>
                    {(p.address||p.addr)&&<div style={{fontSize:12,color:"#6B7280",marginBottom:2}}>📍 {p.address||p.addr}</div>}
                    {p.product&&<div style={{fontSize:12,color:"#94A3B8"}}>📦 {p.product}</div>}
                    {p.note&&<div style={{fontSize:11,color:"#94A3B8",marginTop:3}}>💬 {p.note}</div>}
                  </div>
                  <div style={{display:"flex",flexDirection:"column",alignItems:"flex-end",gap:4,flexShrink:0}}>
                    <span style={{fontSize:12,fontWeight:800,color:statusTextColor,background:statusBg,padding:"4px 12px",borderRadius:20,border:`1.5px solid ${statusColor}`,whiteSpace:"nowrap"}}>{statusLabel}</span>
                    {p.payStatus==="已付清"?<span style={{fontSize:10,fontWeight:700,color:"#065F46",background:"#D1FAE5",padding:"2px 8px",borderRadius:10}}>💰 已付清</span>:p.payStatus==="已收定金"?<span style={{fontSize:10,fontWeight:700,color:"#92400E",background:"#FEF3C7",padding:"2px 8px",borderRadius:10}}>💰 定金{p.totalAmount&&p.depositAmount?` 餘$${((p.totalAmount||0)-(p.depositAmount||0)).toLocaleString()}`:""}</span>:<span style={{fontSize:10,fontWeight:700,color:"#991B1B",background:"#FEF2F2",padding:"2px 8px",borderRadius:10}}>💰 未付款</span>}
                  </div>
                </div>
                <div style={{padding:"6px 14px 10px",borderTop:"1px solid #F1F5F9",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                  <div style={{display:"flex",gap:6}}>
                    <button onClick={()=>onToggleOrdered(p.id)} style={{padding:"5px 12px",borderRadius:8,border:`1.5px solid ${p.ordered?"#a78bfa":"#E5E7EB"}`,background:p.ordered?"#F3E8FF":"#fff",color:p.ordered?"#7c3aed":"#6B7280",fontSize:11,fontWeight:600,cursor:"pointer",fontFamily:ff}}>{p.ordered?"✅ 已下單":"標記已下單"}</button>
                    {p.quoteItems&&p.quoteItems.length>0&&<button onClick={()=>setWorkOrderItem(p)} style={{padding:"5px 12px",borderRadius:8,border:"1.5px solid #7c3aed",background:"#F3E8FF",color:"#7c3aed",fontSize:11,fontWeight:600,cursor:"pointer",fontFamily:ff}}>🖨️ 工單</button>}
                    <button onClick={e=>{e.stopPropagation();setDeliveryOrder(p);}} style={{padding:"5px 12px",borderRadius:8,border:"1.5px solid #0ea5e9",background:"#e0f2fe",color:"#0369a1",fontSize:11,fontWeight:600,cursor:"pointer",fontFamily:ff}}>📄 出貨單</button>
                  </div>
                  <div style={{display:"flex",gap:5}}>
                    <button onClick={()=>onEdit(p)} style={{padding:"4px 9px",borderRadius:7,border:"1px solid #E5E7EB",background:"#fff",fontSize:12,cursor:"pointer"}}>✏️</button>
                    <button onClick={()=>{if(confirm("確定刪除？"))onDelete(p.id);}} style={{padding:"4px 9px",borderRadius:7,border:"1px solid #FECACA",background:"#FEF2F2",fontSize:12,cursor:"pointer"}}>🗑</button>
                  </div>
                </div>
              </div>
            </div>
            );
          })}
        </div>
      )}
      {deliveryOrder&&<DeliveryModal order={deliveryOrder} onClose={()=>setDeliveryOrder(null)}/>}
      {workOrderItem&&(()=>{
        const clientName=workOrderItem.clientName||genClientName(workOrderItem.master||"余青陽",workOrderItem.cust||workOrderItem.customer||"",workOrderItem.region||"",workOrderItem.addr||workOrderItem.address||"");
        const isShip=workOrderItem.master==="進南貨運";
        return<WorkOrderModal items={(workOrderItem.quoteItems||[]).map(qi=>({...qi,id:qi.wMm+qi.hMm+qi.dt,cat:qi.dt==="固定片"?"有框":qi.cat||"有框",wDeductItem:workOrderItem.wDeduct||0,hDeduct:workOrderItem.hDeduct||0}))} results={(workOrderItem.quoteItems||[]).map(()=>({productPrice:0,installFee:0,floorFee:0,total:0}))} custName={workOrderItem.cust||workOrderItem.customer||""} phone={workOrderItem.phone||""} addr={workOrderItem.addr||workOrderItem.address||""} master={workOrderItem.master||"余青陽"} region={workOrderItem.region||""} wDeduct={workOrderItem.wDeduct||0} isShipping={isShip} clientName={clientName} shipDate={workOrderItem.shipDate||""} onClose={()=>setWorkOrderItem(null)}/>;
      })()}
    </div>
  );
}

function PendingOrderForm({order,onSave,onClose}){
  const isEdit=!!order;
  const todayStr2=new Date().toISOString().slice(0,10);
  const initForm=order?{
    shopMode:order.shopMode||"官網",
    cust:order.cust||order.customer||"",
    phone:order.phone||"",
    addr:order.addr||order.address||"",
    master:order.master||"余青陽",
    region:order.region||"",
    note:order.note||"",
    product:order.product||"",
    shipDate:order.shipDate||"",
    shipMethod:order.shipMethod||"寄松成",
    wDeduct:order.wDeduct||0,
    ordered:order.ordered||false,
    orderedAt:order.orderedAt||"",
    orderDate:order.orderDate||todayStr2,
    quoteItems:order.quoteItems||[],
    scheduled:order.scheduled||false,
    totalAmount:order.totalAmount||0,
    payStatus:order.payStatus||"未付款",
    depositAmount:order.depositAmount||0,
    depositMethod:order.depositMethod||"匯款",
    depositDate:order.depositDate||"",
    finalMethod:order.finalMethod||"匯款",
    finalDate:order.finalDate||"",
    completed:order.completed||false,
    id:order.id,
  }:{cust:"",phone:"",addr:"",master:"余青陽",region:"",note:"",product:"",shipDate:"",shipMethod:"寄松成",wDeduct:0,ordered:false,orderDate:todayStr2,quoteItems:[],totalAmount:0,payStatus:"未付款",depositAmount:0,completed:false};
  const [form,setForm]=useState(initForm);
  const set=(k,v)=>setForm(f=>({...f,[k]:v}));
  const [showWO,setShowWO]=useState(false);
  const clientName=genClientName(form.master||"余青陽",form.cust||"",form.region||"",form.addr||"");
  const isShip=(form.master==="進南貨運"||form.master==="自取");
  return(
    <Modal onClose={onClose} width={680}>
      <div style={{padding:"16px 20px 12px",borderBottom:"1px solid #F3F4F6",display:"flex",justifyContent:"space-between"}}>
        <div style={{fontWeight:800,fontSize:16}}>{isEdit?"✏️ 編輯訂單":"＋ 新增待安裝訂單"}</div>
        <button onClick={onClose} style={{border:"none",background:"none",fontSize:22,cursor:"pointer",color:"#9CA3AF"}}>✕</button>
      </div>
      <div style={{flex:1,overflowY:"auto",padding:"14px 20px"}}>
        <div style={{display:"grid",gap:12}}>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
            <div><label style={lbl}>客戶姓名</label><input value={form.cust||""} onChange={e=>set("cust",e.target.value)} style={inp} placeholder="王大明"/></div>
            <div><label style={lbl}>聯絡電話</label><input value={form.phone||""} onChange={e=>set("phone",e.target.value)} style={inp} placeholder="0912-345-678"/></div>
          </div>
          <div><label style={lbl}>施工地址</label><input value={form.addr||""} onChange={e=>set("addr",e.target.value)} style={{...inp}} placeholder="台北市信義區..."/></div>
          <div>
            <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:8}}>
              <div style={{fontWeight:700,fontSize:13,color:"#374151"}}>門型品項</div>
              <div style={{display:"flex",gap:4}}>{["官網","蝦皮"].map(s=><button key={s} onClick={()=>set("shopMode",s)} style={{padding:"3px 12px",borderRadius:6,fontSize:12,cursor:"pointer",border:"none",background:form.shopMode===s?(s==="官網"?"#1d4ed8":"#f97316"):"#e2e8f0",color:form.shopMode===s?"#fff":"#64748b",fontWeight:form.shopMode===s?700:500}}>{s}</button>)}</div>
            </div>
            {(form.quoteItems&&form.quoteItems.length>0?form.quoteItems:[{...defItem(),id:Math.floor(Date.now()/1000)}]).map((item,idx)=>(
              <DoorItemForm key={item.id||idx} item={item} idx={idx}
                floor={1} elev={false} fpFee={0}
                master={form.master||"余青陽"} region={form.region||MASTER_AREAS[form.master||"余青陽"]?.[0]||""}
                onUpdate={updated=>{
                  const items=form.quoteItems&&form.quoteItems.length>0?form.quoteItems:[{...defItem(),id:Math.floor(Date.now()/1000)}];
                  const newItems=items.map((it,i)=>i===idx?updated:it);
                  set("quoteItems",newItems);
                  const desc=newItems.map(it=>{
                    if(it.cat==="加購品"){const t=it.addonType||"毛巾桿";return t==="自填"?(it.addonName||"加購品"):t;}
                    if(it.dt==="固定片")return`固定片 ${it.mat||""} ${it.col||""} W${Math.round(it.wMm/10)}×H${Math.round(it.hMm/10)}`;
                    if(it.cat==="有框")return`${it.dt}（${it.col}）${it.mat} W${(it.wMm/10).toFixed(1).replace(/\.0$/,"")}×H${(it.hMm/10).toFixed(1).replace(/\.0$/,"")}${it.direction?" "+it.direction:""}${it.looseParts?" 散裝":""}`;
                    return`${it.dt} W${Math.round(it.wMm/10)}×H${Math.round(it.hMm/10)}`;
                  }).join("、");
                  set("product",desc);
                  function applyShop(base,it){if(form.shopMode!=="蝦皮")return base;const mat=it.mat||"";const isPS=mat.includes("PS");const isGlass=!isPS&&it.cat!=="加購品";if(isPS)return base+400;if(isGlass){const r2=it.cat==="有框"?calcFramed({doorType:it.dt,material:it.mat,color:it.col,wMm:it.wMm,hMm:it.hMm,wMm2:it.wMm2,hasThreshold:it.hasThr,thresholdMm:it.thrMm,towelBar:0,fourDoorFull:it.fourFull,foldLock:it.foldLock,arcShorten:it.arcShort,floor:1,hasElevator:false,installType:it.instType||"純安裝",fixplateFee:0,region:form.region||MASTER_AREAS[form.master||"余青陽"]?.[0]||"",master:form.master||"余青陽"}):null;return base+Math.round((r2?r2.productPrice:0)*0.05);}return base;}
                  const newTotal=newItems.reduce((s,it)=>{
                    if(it.cat==="加購品"){const t=it.addonType||"毛巾桿";if(t==="毛巾桿")return s+(it.towel||1)*200;if(t==="鋁門檻")return s+Math.round(it.thrMm||0);if(t==="自填")return s+(it.addonPrice||0);return s;}
                    if(it.cat==="有框"){const r=calcFramed({doorType:it.dt,material:it.mat,color:it.col,wMm:it.wMm,hMm:it.hMm,wMm2:it.wMm2,hasThreshold:it.hasThr,thresholdMm:it.thrMm,towelBar:it.towelType==="內外把手"?2:it.towelType&&it.towelType!=="無"?1:0,fourDoorFull:it.fourFull,foldLock:it.foldLock,arcShorten:it.arcShort,floor:1,hasElevator:false,installType:it.instType||"純安裝",fixplateFee:0,region:form.region||MASTER_AREAS[form.master||"余青陽"]?.[0]||"",master:form.master||"余青陽"});const shipAdj=it.instType==="純寄送"?((it.itemShipFee!=null?it.itemShipFee:500)-(r?r.shipSurcharge||0:0)):0;const base=r?r.total+(it.adjust||0)+shipAdj:0;return s+applyShop(base,it);}
                    if(it.cat==="無框"){const r=calcFrameless({doorType:it.dt,wMm:it.wMm,hMm:it.hMm,film:it.film,filmType:it.filmType,blackFrame:it.blackF,flatTube:it.flatT,floor:1,hasElevator:false,fixplateFee:0});return s+(r&&!r.error?r.total+(it.adjust||0):0);}
                    return s;
                  },0);
                  set("totalAmount",newTotal);
                }}
                onRemove={()=>{
                  const items=form.quoteItems&&form.quoteItems.length>0?form.quoteItems:[];
                  if(items.length<=1)return;
                  const newItems=items.filter((_,i)=>i!==idx);
                  set("quoteItems",newItems);
                }}
                canRemove={(form.quoteItems||[]).length>1}
              />
            ))}
            <button onClick={()=>{
              const items=form.quoteItems&&form.quoteItems.length>0?form.quoteItems:[];
              set("quoteItems",[...items,{...defItem(),id:Math.floor(Date.now()/1000)}]);
            }} style={{width:"100%",padding:"8px",borderRadius:8,border:"2px dashed #ddd",background:"#fff",cursor:"pointer",fontSize:12,fontWeight:700,color:"#888",marginBottom:4}}>＋ 新增門型</button>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10}}>
            <div><label style={lbl}>師傅</label><select value={form.master||"余青陽"} onChange={e=>{const m=e.target.value;set("master",m);const autoShip=m==="余青陽"?"寄松成":m==="賴彥銘"?"載":m==="郭師傅"?(form.region==="台南"?"寄台南站址":"寄高雄站址"):m==="進南貨運"?"寄進南":m==="自取"?"自取":"寄松成";set("shipMethod",autoShip);}} onKeyDown={onEnterNext} style={sel}>{["余青陽","賴彥銘","郭師傅","進南貨運","自取"].map(m=><option key={m}>{m}</option>)}</select></div>
            <div><label style={lbl}>W扣尺寸</label><select value={form.wDeduct||0} onChange={e=>set("wDeduct",Number(e.target.value))} onKeyDown={onEnterNext} style={sel}>{["0","0.5","1","1.5","2"].map(v=><option key={v} value={v}>{v===0||v==="0"?"不扣":"-"+v+"cm"}</option>)}</select></div>
            <div><label style={lbl}>H扣尺寸</label><select value={form.hDeduct||0} onChange={e=>set("hDeduct",Number(e.target.value))} onKeyDown={onEnterNext} style={sel}>{["0","0.5","1","1.5","2"].map(v=><option key={v} value={v}>{v===0||v==="0"?"不扣":"-"+v+"cm"}</option>)}</select></div>
          </div>
          <div><label style={lbl}>客單名稱</label><input value={form.clientName!==undefined?form.clientName:clientName} onChange={e=>set("clientName",e.target.value)} style={inp} placeholder={clientName}/></div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
            <div><label style={lbl}>預計出貨日</label><input value={form.shipDate||""} onChange={e=>set("shipDate",e.target.value)} style={inp} placeholder="5/6"/></div>
            <div><label style={lbl}>出貨方式</label><select value={form.shipMethod||"寄松成"} onChange={e=>set("shipMethod",e.target.value)} onKeyDown={onEnterNext} style={sel}>{["寄松成","寄進南","寄台南站址","寄高雄站址","載","自取","代安裝","其他"].map(o=><option key={o}>{o}</option>)}</select></div>
          </div>
          <div><label style={lbl}>備註</label><textarea value={form.note||""} onChange={e=>set("note",e.target.value)} onKeyDown={onEnterNext} style={{...inp,height:60,resize:"vertical"}} placeholder="特殊注意事項..."/></div>
          <div style={{borderTop:"1px solid #E5E7EB",paddingTop:12}}>
            <div style={{fontWeight:700,fontSize:13,color:"#374151",marginBottom:10}}>💰 收款</div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:10}}>
              <div><label style={lbl}>應收金額</label><input type="number" value={form.totalAmount||""} onChange={e=>set("totalAmount",Number(e.target.value))} style={inp} placeholder="0"/></div>
              <div><label style={lbl}>收款狀態</label>
                <div style={{display:"flex",gap:6,marginTop:4}}>
                  {["未付款","已收定金","已付清"].map(s=>(
                    <button key={s} onClick={()=>{set("payStatus",s);if(s==="已付清")set("completed",true);else set("completed",false);}} style={{flex:1,padding:"6px 4px",borderRadius:7,border:"2px solid",borderColor:form.payStatus===s?(s==="已付清"?"#059669":s==="已收定金"?"#d97706":"#dc2626"):"#E5E7EB",background:form.payStatus===s?(s==="已付清"?"#D1FAE5":s==="已收定金"?"#FEF3C7":"#FEF2F2"):"#fff",color:form.payStatus===s?(s==="已付清"?"#065F46":s==="已收定金"?"#92400E":"#991B1B"):"#6B7280",fontSize:11,fontWeight:700,cursor:"pointer",fontFamily:ff}}>{s}</button>
                  ))}
                </div>
              </div>
            </div>
            {form.payStatus==="已收定金"&&<div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
              <div><label style={lbl}>定金金額</label><input type="number" value={form.depositAmount||""} onChange={e=>set("depositAmount",Number(e.target.value))} style={inp} placeholder="0"/></div>
              <div><label style={lbl}>剩餘尾款</label><span style={{fontSize:13,fontWeight:600,color:"#374151",display:"block",marginTop:8}}>${((form.totalAmount||0)-(form.depositAmount||0)).toLocaleString()}</span></div>
              <div><label style={lbl}>付款方式</label><select value={form.depositMethod||"匯款"} onChange={e=>set("depositMethod",e.target.value)} onKeyDown={onEnterNext} style={sel}>{["匯款","現金","刷卡"].map(m=><option key={m}>{m}</option>)}</select></div>
              <div><label style={lbl}>收款日期</label><input type="date" value={form.depositDate||""} onChange={e=>set("depositDate",e.target.value)} onKeyDown={onEnterNext} style={inp}/></div>
            </div>}
            {form.payStatus==="已付清"&&<div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
              <div><label style={lbl}>付款方式</label><select value={form.finalMethod||"匯款"} onChange={e=>set("finalMethod",e.target.value)} onKeyDown={onEnterNext} style={sel}>{["匯款","現金","刷卡"].map(m=><option key={m}>{m}</option>)}</select></div>
              <div><label style={lbl}>收款日期</label><input type="date" value={form.finalDate||""} onChange={e=>set("finalDate",e.target.value)} onKeyDown={onEnterNext} style={inp}/></div>
            </div>}
          </div>
          <div>
            <button onClick={()=>setShowWO(true)} style={{width:"100%",padding:"10px",borderRadius:8,border:"none",background:"#7c3aed",color:"#fff",fontWeight:700,fontSize:13,cursor:"pointer",fontFamily:ff}}>🖨️ 預覽工單 / 下載PNG</button>
            {form.ordered&&<div style={{marginTop:6,fontSize:12,color:"#059669",fontWeight:700}}>✅ 已下單 {form.orderedAt||""}</div>}
          </div>
        </div>
      </div>
      <div style={{padding:"12px 20px",borderTop:"1px solid #F3F4F6",display:"flex",gap:10}}>
        <button onClick={onClose} style={{flex:1,padding:11,borderRadius:10,border:"1.5px solid #E5E7EB",background:"#fff",cursor:"pointer",fontFamily:ff,fontWeight:600}}>取消</button>
        <button onClick={()=>onSave({...form,id:order?.id||Math.floor(Date.now()/1000),scheduled:order?.scheduled||false,customer:form.cust||"",address:form.addr||""})} style={{flex:2,padding:11,borderRadius:10,border:"none",background:"#1E293B",color:"#fff",fontWeight:800,fontSize:14,cursor:"pointer",fontFamily:ff}}>{isEdit?"儲存修改":"新增訂單"}</button>
      </div>
      {showWO&&(()=>{
        const woItems=(form.quoteItems&&form.quoteItems.length>0?form.quoteItems:[]).map(qi=>({...qi,id:(qi.wMm||0)+(qi.hMm||0)+(qi.dt||""),cat:qi.dt==="固定片"?"有框":qi.cat||"有框",wDeductItem:form.wDeduct||0,hDeduct:form.hDeduct||0}));
        const woResults=woItems.map(()=>({productPrice:0,installFee:0,floorFee:0,total:0}));
        const woClientName=form.clientName!==undefined?form.clientName:clientName;
        return<WorkOrderModal items={woItems} results={woResults} custName={form.cust||""} phone={form.phone||""} addr={form.addr||""} master={form.master||"余青陽"} region={form.region||""} wDeduct={form.wDeduct||0} isShipping={isShip} clientName={woClientName} shipDate={form.shipDate||""} onClose={()=>setShowWO(false)}/>;
      })()}
    </Modal>
  );
}

// ─── 主頁面切換包裝 ───────────────────────────────────────────────────────────
export default function App(){
  const [mainTab, setMainTab] = useState("erp");
  const [orders,setOrders]=useState([]);

  useEffect(()=>{
    sb.getAll("orders").then(rows=>{
      if(rows&&rows.length)setOrders(rows.map(r=>r.data));
      else setOrders([]);
    }).catch(()=>setOrders([]));
  },[]);

  function saveScheduleOrder(o){
    setOrders(p=>p.find(x=>x.id===o.id)?p.map(x=>x.id===o.id?o:x):[...p,o]);
    sb.upsert("orders",{id:o.id,data:o});
  }
  function deleteScheduleOrder(id){
    setOrders(p=>p.filter(o=>o.id!==id));
    sb.delete("orders",id);
  }
  const [pendingOrders,setPendingOrders]=useState([]);
  const [showForm,setShowForm]=useState(false);
  const [editOrder,setEditOrder]=useState(null);
  const [selectedDate,setSelectedDate]=useState(null);
  const [pendingAddDate,setPendingAddDate]=useState(null);
  const [wageCalcMaster,setWageCalcMaster]=useState(null);
  const [filterMaster,setFilterMaster]=useState("all");
  const [calYear,setCalYear]=useState(today.getFullYear());
  const [calMonth,setCalMonth]=useState(today.getMonth());
  const [tab,setTab]=useState("calendar");
  const [showPendingForm,setShowPendingForm]=useState(false);
  const [editPending,setEditPending]=useState(null);
  const [autoOpenDelivery,setAutoOpenDelivery]=useState(null);
  const [showMonthly,setShowMonthly]=useState(false);
  const [loading,setLoading]=useState(true);

  // 從 Supabase 載入訂單
  useEffect(()=>{
    sb.getAll("pending_orders").then(rows=>{
      if(rows&&rows.length)setPendingOrders(rows.map(r=>r.data));
      setLoading(false);
    }).catch(()=>setLoading(false));
  },[]);

  // 訂單操作（自動同步 Supabase）
  function savePendingOrder(order){
    const toSave={...order,id:order.id||Math.floor(Date.now()/1000),customer:order.cust||order.customer||"",address:order.addr||order.address||""};
    setPendingOrders(prev=>prev.find(x=>x.id===toSave.id)?prev.map(x=>x.id===toSave.id?toSave:x):[...prev,toSave]);
    sb.upsert("pending_orders",{id:toSave.id,data:toSave});
    return toSave;
  }
  function deletePendingOrder(id){
    setPendingOrders(p=>p.filter(x=>x.id!==id));
    sb.delete("pending_orders",id);
  }
  function updatePendingOrder(id,patch){
    setPendingOrders(p=>p.map(x=>{if(x.id!==id)return x;const u={...x,...patch};sb.upsert("pending_orders",{id:u.id,data:u});return u;}));
  }

  const filtered=useMemo(()=>orders.filter(o=>filterMaster==="all"||o.masterId===filterMaster),[orders,filterMaster]);
  const dayOrders=useMemo(()=>selectedDate?filtered.filter(o=>o.date===selectedDate):[],[selectedDate,filtered]);
  const addOrder=o=>{
    const newO={...o,id:o.id||Math.floor(Date.now()/1000)};
    saveScheduleOrder(newO);
    setShowForm(false);
    setPendingAddDate(null);
    const exists=pendingOrders.find(p=>(p.cust||p.customer||"")===(newO.customer||"")&&(p.addr||p.address||"")===(newO.address||""));
    let newPending=null;
    if(!exists&&newO.customer){
      newPending={id:Math.floor(Date.now()/1000)+1,cust:newO.customer,phone:newO.phone||"",addr:newO.address||"",master:MASTERS[newO.masterId]?.name||"余青陽",region:newO.area||"",product:newO.product||"",shipMethod:newO.jobType==="純配送"?"寄進南":"安裝",wDeduct:0,ordered:false,scheduled:true,quoteItems:[]};
      savePendingOrder(newPending);
    }
    const target=newPending||exists;
    if(target){setTab("delivery");setAutoOpenDelivery(target);}
  };
  const saveOrder=o=>{saveScheduleOrder(o);setEditOrder(null);};
  const deleteOrder=id=>{deleteScheduleOrder(id);setEditOrder(null);};
  const updateOrder=(id,patch)=>{setOrders(p=>p.map(o=>{if(o.id!==id)return o;const u={...o,...patch};sb.upsert("orders",{id:u.id,data:u});return u;}));};
  const prevMonth=()=>{let m=calMonth-1,y=calYear;if(m<0){m=11;y--;}setCalMonth(m);setCalYear(y);};
  const nextMonth=()=>{let m=calMonth+1,y=calYear;if(m>11){m=0;y++;}setCalMonth(m);setCalYear(y);};
  const pendingCount=pendingOrders.filter(p=>!p.scheduled).length;

  // Top-level tab switcher between Home (交班中心) and ERP (排程管理)
  return(
    <div style={{colorScheme:"light"}}>
      <style>{`
        input, select, textarea {
          background-color: #ffffff !important;
          color: #111111 !important;
          border-color: #E5E7EB !important;
        }
        input::placeholder, textarea::placeholder {
          color: #9CA3AF !important;
        }
      `}</style>
      {/* 頂層導覽 */}
      <div style={{background:"#0f1117",borderBottom:"1px solid #1e2740",padding:"0 20px",height:48,display:"flex",alignItems:"center",gap:16,position:"sticky",top:0,zIndex:300}}>
        <span style={{fontSize:18}}>🚿</span>
        <span style={{color:"#e2e8f0",fontWeight:800,fontSize:14,fontFamily:ff}}>享浴淋浴拉門</span>
        <div style={{display:"flex",gap:2,marginLeft:8}}>
          {[["home","🏠 交班中心"],["erp","📅 排程管理"]].map(([k,l])=>(
            <button key={k} onClick={()=>setMainTab(k)} style={{background:mainTab===k?"#1e2740":"transparent",border:"none",borderBottom:`2px solid ${mainTab===k?"#3b82f6":"transparent"}`,color:mainTab===k?"#e2e8f0":"#64748b",padding:"6px 16px",fontSize:13,cursor:"pointer",fontFamily:ff,borderRadius:"5px 5px 0 0"}}>{l}</button>
          ))}
        </div>
      </div>

      {mainTab==="home" && <HomePage/>}

      {mainTab==="erp" && (
        <div style={{minHeight:"calc(100vh - 48px)",background:"#F1F5F9",fontFamily:ff}}>
          <div style={{background:"#fff",borderBottom:"1px solid #E2E8F0",padding:"0 18px",height:50,display:"flex",alignItems:"center",justifyContent:"space-between",boxShadow:"0 1px 6px rgba(0,0,0,0.06)"}}>
            <div style={{display:"flex",alignItems:"center",gap:10}}>
              <div style={{display:"flex",background:"#F1F5F9",borderRadius:8,padding:3}}>
                {[["quote","💰 報價"],["pending","📋 訂單"+(pendingCount>0?" ("+pendingCount+")":"")],["calendar","📅 排程"],["delivery","📄 出貨單"]].map(([v,label])=>(
                  <button key={v} onClick={()=>setTab(v)} style={{padding:"5px 12px",borderRadius:6,border:"none",fontSize:12,background:tab===v?"#fff":"transparent",fontWeight:tab===v?700:500,cursor:"pointer",boxShadow:tab===v?"0 1px 3px rgba(0,0,0,0.1)":"none",fontFamily:ff,color:"#374151",whiteSpace:"nowrap"}}>{label}</button>
                ))}
              </div>
            </div>
            <div style={{display:"flex",gap:5,alignItems:"center",flexWrap:"wrap"}}>
              {tab==="calendar"&&<>
                {Object.values(MASTERS).map(m=>(<button key={m.id} onClick={()=>setFilterMaster(filterMaster===m.id?"all":m.id)} style={{padding:"4px 10px",borderRadius:20,border:"2px solid",borderColor:filterMaster===m.id?m.color:"transparent",background:filterMaster===m.id?m.color:m.light,color:filterMaster===m.id?"#fff":m.dark,fontWeight:700,fontSize:11,cursor:"pointer",fontFamily:ff,display:"flex",alignItems:"center",gap:4}}><span style={{width:6,height:6,borderRadius:"50%",background:filterMaster===m.id?"#fff":m.color,display:"inline-block"}}/>{m.name}</button>))}
                <div style={{width:1,height:20,background:"#E2E8F0",margin:"0 2px"}}/>
                {Object.values(MASTERS).map(m=>(<button key={m.id+"w"} onClick={()=>setWageCalcMaster(m)} style={{padding:"4px 9px",borderRadius:8,border:"1px solid "+m.color+"40",background:"#fff",color:m.dark,fontWeight:600,fontSize:11,cursor:"pointer",fontFamily:ff}}>{m.avatar} 試算</button>))}
                <div style={{width:1,height:20,background:"#E2E8F0",margin:"0 2px"}}/>
                <button onClick={()=>setShowForm(true)} style={{padding:"7px 14px",borderRadius:8,border:"none",background:"#1E293B",color:"#fff",fontWeight:700,fontSize:12,cursor:"pointer",fontFamily:ff}}>＋ 新增排程</button>
              </>}
              {tab==="pending"&&(<button onClick={()=>{setEditPending(null);setShowPendingForm(true);}} style={{padding:"7px 14px",borderRadius:8,border:"none",background:"#1E293B",color:"#fff",fontWeight:700,fontSize:12,cursor:"pointer",fontFamily:ff}}>＋ 新增訂單</button>)}
            </div>
          </div>

          <div style={{padding:"14px 18px",maxWidth:1080,margin:"0 auto"}}>
            {loading&&<div style={{textAlign:"center",padding:60,color:"#9CA3AF",fontSize:15}}>載入中...</div>}
            {!loading&&tab==="quote"&&(<QuotationSystem onCreateOrder={p=>{savePendingOrder({...p,id:Math.floor(Date.now()/1000),scheduled:false});setTab("pending");}}/>)}
            {!loading&&tab==="pending"&&(<PendingOrdersTab pendingOrders={pendingOrders} onEdit={p=>{setEditPending(p);setShowPendingForm(true);}} onDelete={id=>deletePendingOrder(id)} onToggleOrdered={id=>{const o=pendingOrders.find(x=>x.id===id);if(o)updatePendingOrder(id,{ordered:!o.ordered});}}/>)}
            {!loading&&tab==="delivery"&&(<DeliveryTab pendingOrders={pendingOrders} autoOpen={autoOpenDelivery} onAutoOpenDone={()=>setAutoOpenDelivery(null)} onMarkShipped={(id,invoiceNo,total)=>updatePendingOrder(id,{shipped:true,shippedAt:new Date().toISOString().slice(0,10),invoiceNo,shippedTotal:total})}/>)}
            {tab==="calendar"&&(<>
              <WageSummary orders={orders} year={calYear} month={calMonth} onTransferLog={()=>{}} onMonthlySettle={()=>{}}/>
              <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:10,flexWrap:"wrap"}}>
                <button onClick={prevMonth} style={iBtn}>‹</button>
                <span style={{fontWeight:800,fontSize:16,minWidth:100,textAlign:"center"}}>{calYear}年 {calMonth+1}月</span>
                <button onClick={nextMonth} style={iBtn}>›</button>
                <button onClick={()=>{setCalYear(today.getFullYear());setCalMonth(today.getMonth());}} style={{padding:"5px 11px",borderRadius:8,border:"1px solid #E5E7EB",background:"#fff",cursor:"pointer",fontSize:12,color:"#6B7280",fontFamily:ff}}>今天</button>
                <button onClick={()=>setShowMonthly(true)} style={{padding:"5px 14px",borderRadius:8,border:"none",background:"#1E293B",color:"#fff",cursor:"pointer",fontSize:12,fontWeight:700,fontFamily:ff}}>📋 余青陽月結單</button>
              </div>
              <TTCalendar orders={filtered} year={calYear} month={calMonth} onDayClick={setSelectedDate}/>
              {showMonthly&&<MonthlyModal orders={orders} year={calYear} month={calMonth} onClose={()=>setShowMonthly(false)}/>}
            </>)}
          </div>

          {selectedDate&&(<DayPanel date={selectedDate} orders={dayOrders} onClose={()=>setSelectedDate(null)} onAdd={date=>{setPendingAddDate(date);setSelectedDate(null);setShowForm(true);}} onEdit={o=>{setEditOrder(o);setSelectedDate(null);}} onUpdateOrder={updateOrder} pendingOrders={pendingOrders} onUpdatePendingOrder={updatePendingOrder}/>)}
          {(showForm||editOrder)&&(<OrderForm order={editOrder} defaultDate={pendingAddDate||todayStr} pendingOrders={pendingOrders.filter(p=>!p.scheduled)} onSave={o=>{if(editOrder){saveOrder(o);}else{addOrder(o);}}} onClose={()=>{setShowForm(false);setEditOrder(null);setPendingAddDate(null);}} onDelete={deleteOrder}/>)}
          {wageCalcMaster&&<WageCalc master={wageCalcMaster} onClose={()=>setWageCalcMaster(null)}/>}
          {showPendingForm&&(<PendingOrderForm order={editPending?.id?editPending:null} onSave={p=>{
            savePendingOrder({...p,id:editPending?.id||Math.floor(Date.now()/1000),scheduled:editPending?.scheduled||false});
            setShowPendingForm(false);setEditPending(null);
          }} onClose={()=>{setShowPendingForm(false);setEditPending(null);}}/>)}
        </div>
      )}
    </div>
  );
}