import { useState, useEffect, useMemo, useRef } from "react";

// Supabase 初始化
const SUPABASE_URL="https://zbnijokwqjpczhmifzia.supabase.co";
const SUPABASE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inpibmlqb2t3cWpwY3pobWlmemlhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc4OTQxNjYsImV4cCI6MjA5MzQ3MDE2Nn0.vs2B3nIOIfLWadPWm5hrMvEOSAAx1GuqTxPtBMh5spI";
async function sbFetch(table,method="GET",body=null,match=null){
  let url=SUPABASE_URL+"/rest/v1/"+table;
  if(match)url+="?"+Object.entries(match).map(([k,v])=>k+"=eq."+v).join("&");
  const res=await fetch(url,{method,headers:{"apikey":SUPABASE_KEY,"Authorization":"Bearer "+SUPABASE_KEY,"Content-Type":"application/json","Prefer":method==="POST"?"resolution=merge-duplicates":""},body:body?JSON.stringify(body):null});
  if(method==="GET")return res.json();
  return res.ok;
}
const sb={
  getAll:(table)=>sbFetch(table),
  upsert:(table,data)=>sbFetch(table,"POST",data),
  delete:(table,id)=>sbFetch(table,"DELETE",null,{id}),
};

const ff = "'Noto Sans TC','PingFang TC',sans-serif";
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

  function sendMsg(){const text=msgInput.trim();if(!text)return;const m={id:Date.now(),user:currentUser,text,time:new Date().toISOString(),pinned:false};setMessages(p=>[...p,m]);setMsgInput("");sb.upsert("messages",{id:m.id,data:m});}
  function pinMsg(id){setMessages(p=>p.map(m=>{if(m.id!==id)return m;const u={...m,pinned:!m.pinned};sb.upsert("messages",{id:u.id,data:u});return u;}));}
  function deleteMsg(id){setMessages(p=>p.filter(m=>m.id!==id));sb.delete("messages",id);}
  function addTodo(){const text=todoInput.trim();if(!text)return;const t={id:Date.now(),text,done:false,priority:todoPriority,assignee:todoAssignee,time:new Date().toISOString()};setTodos(p=>[t,...p]);setTodoInput("");sb.upsert("todos",{id:t.id,data:t});}
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
function calcFixedPlate({material,color,wMm,hMm}){
  // 3mm材質及5mm強化銀霞玻貼清膜固定片價格後補，暫時回傳null
  if(["3mmPS101","3mmPS503","3mmPS501","5mm強化銀霞玻貼清膜"].includes(material))return null;
  const wCm=wMm/10,hCm=hMm/10;
  const matKey=["5mmPS101","5mmPS503","5mmPS501"].includes(material)?"PS":["5mm強化清玻貼清膜","5mm強化清玻貼砂膜"].includes(material)?"GLASS":"SILVERFROST";
  const table=matKey==="PS"?FP_PS:matKey==="GLASS"?FP_GLASS:FP_SILVERFROST;
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
const FRAMELESS_TYPES=["連動門","橫拉門","開啟門"];
const FRAMED_MATS={圓弧型:["3mmPS501","5mm強化清玻"],default:["5mmPS101","5mmPS503","5mmPS501","3mmPS101","3mmPS503","3mmPS501","5mm強化清玻貼清膜","5mm強化清玻貼砂膜","5mm強化銀霞玻貼清膜"]};
const FRAMED_COLS={圓弧型:["白色"],default:["白色","牙色","銀色","黑色"]};

function calcFramed({doorType,material,color,wMm,hMm,wMm2,hasThreshold,thresholdMm,towelBar,fourDoorFull,foldLock,arcShorten,floor,hasElevator,installType,fixplateFee,region,master}){
  const cfg=FRAMED_BASE[doorType];if(!cfg)return null;
  const wR=roundTo100(wMm),hR=roundTo100(hMm),wR2=wMm2?roundTo100(wMm2):null;
  const matKey=["5mmPS101","5mmPS503","5mmPS501"].includes(material)?"5mmPS板":["3mmPS101","3mmPS503","3mmPS501"].includes(material)?"3mmPS板":material==="5mm強化銀霞玻貼清膜"?"5mm強化銀霞玻貼清膜":material;
  const colKey=["白色","牙色"].includes(color)&&doorType!=="圓弧型"?"白/牙色":color;
  const base=cfg.prices[matKey]?.[colKey]??0;
  const surW=cfg.surW[matKey]??0,surH=cfg.surH[matKey]??0;
  let extraW=0,extraH=0;
  if(cfg.isL){extraW=(Math.ceil(Math.max(0,wR-cfg.stdW)/100)+Math.ceil(Math.max(0,(wR2||0)-cfg.stdW)/100))*surW;}
  else{extraW=Math.ceil(Math.max(0,wR-cfg.stdW)/100)*surW;}
  if(!cfg.isArc){extraH=Math.ceil(Math.max(0,hR-cfg.stdH)/100)*surH;}
  let prod=base+extraW+extraH;
  if(fourDoorFull)prod+=500;if(foldLock)prod+=1000;
  if(arcShorten&&doorType==="圓弧型"&&material==="3mmPS501")prod+=500;
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
  return{productPrice:prod,thresholdPrice:thrPrice,towelPrice,installFee,installFeeBase,shipSurcharge,floorFee,thresholdInstallFee:thrInstall,fixFee,fixplateFee:fp,total:prod+thrPrice+towelPrice+installFee+floorFee+thrInstall+fixFee+fp,wR,hR,wR2,extraW,extraH};
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
  let ftPrice=0;if(doorType==="開啟門"&&flatTube){ftPrice=rh(1000*1.35);if(blackFrame)ftPrice+=rh(1000*1.35);}
  const floorFee=!hasElevator&&floor>=4?(floor-3)*300:0;
  const prod=base+extraW+extraH+filmPrice+bfp+ftPrice;
  return{productPrice:prod,filmPrice,blackFramePrice:bfp,flatTubePrice:ftPrice,installFee:0,floorFee,fixplateFee:fixplateFee||0,total:prod+floorFee+(fixplateFee||0),wCm,hCm};
}

function QRow({label,children}){return(<div style={{display:"flex",alignItems:"center",gap:8,flexWrap:"wrap"}}><span style={{minWidth:90,fontSize:12,color:"#555",flexShrink:0}}>{label}</span><div style={{display:"flex",alignItems:"center",gap:8,flexWrap:"wrap"}}>{children}</div></div>);}
function QInput(props){const {style,...rest}=props;return(<input {...rest} style={{border:"1px solid #ddd",borderRadius:6,padding:"5px 10px",fontSize:13,outline:"none",...style}}/>);}
function QToggle({value,onChange,options,wrap}){return(<div style={{display:"flex",flexWrap:wrap?"wrap":"nowrap",gap:5}}>{options.map(o=><button key={o} onClick={()=>onChange(o)} style={{padding:"4px 11px",borderRadius:6,fontSize:12,cursor:"pointer",border:value===o?"2px solid #1a1a1a":"1px solid #ddd",background:value===o?"#1a1a1a":"#fff",color:value===o?"#fff":"#333",fontWeight:value===o?600:400}}>{o}</button>)}</div>);}
function QCheck({checked,onChange,label}){return(<label style={{display:"flex",alignItems:"center",gap:5,cursor:"pointer",fontSize:12}}><input type="checkbox" checked={checked} onChange={e=>onChange(e.target.checked)} style={{width:15,height:15}}/>{label}</label>);}
function QTag({children,color}){return(<span style={{background:color+"22",color,border:`1px solid ${color}`,borderRadius:4,padding:"2px 7px",fontSize:11,fontWeight:600}}>{children}</span>);}
function QSection({title,children,accent}){return(<div style={{background:"#fff",borderRadius:10,overflow:"hidden",boxShadow:"0 1px 4px rgba(0,0,0,0.08)"}}><div style={{background:accent?"#1a1a1a":"#f0efe9",color:accent?"#fff":"#1a1a1a",padding:"9px 15px",fontWeight:700,fontSize:13,letterSpacing:1}}>{title}</div><div style={{padding:"11px 15px",display:"flex",flexDirection:"column",gap:9}}>{children}</div></div>);}
function QLineItem({label,value}){return(<div style={{display:"flex",justifyContent:"space-between",fontSize:13}}><span style={{color:"#444"}}>{label}</span><span style={{fontWeight:500}}>${fmtMoney(value)}</span></div>);}

function defItem(){return{id:Date.now()+Math.random(),cat:"有框",dt:"一字二門",mat:"5mmPS101",col:"白色",wMm:1500,hMm:1900,wMm2:900,hasThr:false,thrMm:0,towel:0,fourFull:false,foldLock:false,arcShort:false,film:false,filmType:"清玻",blackF:false,flatT:false,instType:"純安裝",hasFixedPlate:false,adjust:0,fpAngle:"90度",direction:""};}

function DoorItemForm({item,idx,floor,elev,fpFee,master,region,onUpdate,onRemove,canRemove}){
  const s=(k,v)=>onUpdate({...item,[k]:v});
  const changeDt=t=>{const ms=FRAMED_MATS[t]||FRAMED_MATS.default;onUpdate({...item,dt:t,mat:ms[0],col:t==="圓弧型"?FRAMED_COLS.圓弧型[0]:FRAMED_COLS.default[0]});};
  const changeCat=v=>{onUpdate({...item,cat:v,dt:v==="有框"?"一字二門":v==="無框"?"連動門":"",mat:v==="有框"?"5mmPS101":"",col:v==="有框"?"白色":"",addonType:"毛巾桿"});};
  const mats=FRAMED_MATS[item.dt]||FRAMED_MATS.default;
  const cols=item.dt==="圓弧型"?FRAMED_COLS.圓弧型:FRAMED_COLS.default;
  const isFixedPlate=item.dt==="固定片";
  const result=useMemo(()=>{
    if(item.cat==="加購品"){
      const t=item.addonType||"毛巾桿";
      const inst=item.fpInstallFee||0;const ship=item.addonShip||0;
      if(t==="毛巾桿"){const prod=(item.towel||1)*200;return{productPrice:prod,installFee:inst,shipFee:ship,floorFee:0,total:prod+inst+ship};}
      if(t==="鋁門檻"){const thrPrice=Math.round(item.thrMm||0);return{productPrice:thrPrice,installFee:inst,shipFee:ship,floorFee:0,total:thrPrice+inst+ship};}
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
    if(item.cat==="有框")return calcFramed({doorType:item.dt,material:item.mat,color:item.col,wMm:item.wMm,hMm:item.hMm,wMm2:item.wMm2,hasThreshold:item.hasThr,thresholdMm:item.thrMm,towelBar:item.towel,fourDoorFull:item.fourFull,foldLock:item.foldLock,arcShorten:item.arcShort,floor,hasElevator:elev,installType:item.instType,fixplateFee:fpFee,region,master});
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
          <QRow label="品項"><QToggle value={item.addonType||"毛巾桿"} onChange={v=>s("addonType",v)} options={["毛巾桿","鋁門檻","自填"]}/></QRow>
          {(item.addonType||"毛巾桿")==="毛巾桿"&&<>
            <QRow label="顏色"><QToggle value={item.addonCol||"白色"} onChange={v=>s("addonCol",v)} options={["白色","牙色","銀色","黑色"]}/></QRow>
            <QRow label="數量"><QInput type="number" value={item.towel||1} onChange={e=>s("towel",Number(e.target.value))} min={1} max={10} style={{width:60}}/><span style={{fontSize:11,color:"#888"}}>支×$200</span></QRow>
            <QRow label="安裝費"><QInput type="number" value={item.fpInstallFee||""} onChange={e=>s("fpInstallFee",Number(e.target.value))} placeholder="0" style={{width:100}}/><span style={{fontSize:11,color:"#888"}}>元</span></QRow>
            <QRow label="運費"><QInput type="number" value={item.addonShip||""} onChange={e=>s("addonShip",Number(e.target.value))} placeholder="0" style={{width:100}}/><span style={{fontSize:11,color:"#888"}}>元</span></QRow>
          </>}
          {(item.addonType||"毛巾桿")==="鋁門檻"&&<>
            <QRow label="顏色"><QToggle value={item.addonCol||"白色"} onChange={v=>s("addonCol",v)} options={["白色","牙色","銀色","黑色"]}/></QRow>
            <QRow label="長度"><QInput type="number" value={item.thrMm||0} onChange={e=>s("thrMm",Number(e.target.value))} min={0} max={5000} style={{width:90}}/><span style={{fontSize:11,color:"#888"}}>mm（$10/cm）</span></QRow>
            <QRow label="安裝費"><QInput type="number" value={item.fpInstallFee||""} onChange={e=>s("fpInstallFee",Number(e.target.value))} placeholder="0" style={{width:100}}/><span style={{fontSize:11,color:"#888"}}>元</span></QRow>
            <QRow label="運費"><QInput type="number" value={item.addonShip||""} onChange={e=>s("addonShip",Number(e.target.value))} placeholder="0" style={{width:100}}/><span style={{fontSize:11,color:"#888"}}>元</span></QRow>
          </>}
          {(item.addonType||"毛巾桿")==="自填"&&<>
            <QRow label="名稱"><QInput value={item.addonName||""} onChange={e=>s("addonName",e.target.value)} placeholder="品項名稱" style={{width:180}}/></QRow>
            <QRow label="金額"><QInput type="number" value={item.addonPrice||""} onChange={e=>s("addonPrice",Number(e.target.value))} placeholder="0" style={{width:120}}/><span style={{fontSize:11,color:"#888"}}>元</span></QRow>
            <QRow label="安裝費"><QInput type="number" value={item.fpInstallFee||""} onChange={e=>s("fpInstallFee",Number(e.target.value))} placeholder="0" style={{width:100}}/><span style={{fontSize:11,color:"#888"}}>元</span></QRow>
            <QRow label="運費"><QInput type="number" value={item.addonShip||""} onChange={e=>s("addonShip",Number(e.target.value))} placeholder="0" style={{width:100}}/><span style={{fontSize:11,color:"#888"}}>元</span></QRow>
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
            return <QRow label="開向"><QToggle value={item.direction||dirOpts[0]} onChange={v=>{s("direction",v);if(item.dt==="一字四門")s("fourFull",v==="四片活動");}} options={dirOpts} wrap/></QRow>;
          })()}
        </>}
        <QRow label="尺寸（mm）">
          {(item.dt==="L型二門"||item.dt==="圓弧型")?<><span style={{fontSize:12}}>W1</span><QInput type="number" value={item.wMm} onChange={e=>s("wMm",Number(e.target.value))} min={100} max={3000} style={{width:90}}/><span style={{fontSize:12}}>W2</span><QInput type="number" value={item.wMm2||""} onChange={e=>s("wMm2",Number(e.target.value))} min={100} max={3000} style={{width:90}}/></>:<><span style={{fontSize:12}}>W</span><QInput type="number" value={item.wMm} onChange={e=>s("wMm",Number(e.target.value))} min={100} max={3000} style={{width:90}}/></>}
          <span style={{fontSize:12}}>H</span>
          {item.dt==="圓弧型"&&item.mat==="5mm強化清玻"?<span style={{fontSize:11,color:"#888"}}>H1880（固定）</span>:<QInput type="number" value={item.hMm} onChange={e=>s("hMm",Number(e.target.value))} min={100} max={3000} style={{width:90}}/>}
        </QRow>
        {!isFixedPlate&&<QRow label="安裝類型"><QToggle value={item.instType||"純安裝"} onChange={v=>s("instType",v)} options={["純安裝","含拆舊","純寄送"]}/></QRow>}
        {isFixedPlate&&<QRow label="角度"><QToggle value={item.fpAngle||"90度"} onChange={v=>s("fpAngle",v)} options={["45度","90度","180度"]}/></QRow>}
        <QRow label="W扣尺寸"><QToggle value={String(item.wDeductItem||0)} onChange={v=>s("wDeductItem",Number(v))} options={["0","0.5","1","1.5","2"]}/><span style={{fontSize:11,color:"#888"}}>cm</span></QRow>
        <QRow label="H扣尺寸"><QCheck checked={!!item.hDeduct} onChange={v=>s("hDeduct",v?0.5:0)} label="需要"/>{!!item.hDeduct&&<><QInput type="number" value={item.hDeduct} onChange={e=>s("hDeduct",Number(e.target.value))} min={0} max={10} step={0.5} style={{width:70}}/><span style={{fontSize:11,color:"#888"}}>cm</span></>}</QRow>
        <QRow label="微調金額">
          <button onClick={()=>s("adjust",(item.adjust||0)-100)} style={{width:28,height:28,borderRadius:6,border:"1px solid #ddd",background:"#fff",cursor:"pointer",fontSize:16,fontWeight:700}}>−</button>
          <span style={{minWidth:70,textAlign:"center",fontSize:13,fontWeight:600,color:(item.adjust||0)>0?"#059669":(item.adjust||0)<0?"#DC2626":"#888"}}>{(item.adjust||0)>0?`+$${fmtMoney(item.adjust||0)}`:(item.adjust||0)<0?`-$${fmtMoney(Math.abs(item.adjust||0))}`:"$0"}</span>
          <button onClick={()=>s("adjust",(item.adjust||0)+100)} style={{width:28,height:28,borderRadius:6,border:"1px solid #ddd",background:"#fff",cursor:"pointer",fontSize:16,fontWeight:700}}>＋</button>
          {(item.adjust||0)!==0&&<button onClick={()=>s("adjust",0)} style={{fontSize:10,color:"#9CA3AF",background:"none",border:"none",cursor:"pointer"}}>重置</button>}
        </QRow>
        {isFixedPlate&&<QRow label="安裝費"><QInput type="number" value={item.fpInstallFee||""} onChange={e=>s("fpInstallFee",Number(e.target.value))} placeholder="0" style={{width:100}}/><span style={{fontSize:11,color:"#888"}}>元</span></QRow>}
        {isFixedPlate&&<QRow label="毛巾桿"><QToggle value={item.towelType||"無"} onChange={v=>s("towelType",v)} options={["無","一支把手","內外把手","內把手"]}/></QRow>}
        {!isFixedPlate&&item.cat==="有框"&&<>
          <QRow label="鋁門檻"><QCheck checked={item.hasThr} onChange={v=>s("hasThr",v)} label="需要"/>{item.hasThr&&<><QInput type="number" value={item.thrMm} onChange={e=>s("thrMm",Number(e.target.value))} min={0} max={5000} style={{width:80}}/><span style={{fontSize:11,color:"#888"}}>mm</span></>}</QRow>
          <QRow label="毛巾桿"><QToggle value={item.towelType||"無"} onChange={v=>s("towelType",v)} options={["無","一支把手","內外把手","內把手"]}/></QRow>
        </>}
        {!isFixedPlate&&item.cat==="無框"&&<>
          <QRow label="防爆膜"><QCheck checked={item.film} onChange={v=>s("film",v)} label="需要"/>{item.film&&<QToggle value={item.filmType} onChange={v=>s("filmType",v)} options={["清玻","噴砂"]}/>}</QRow>
          <QRow label="黑色五金"><QCheck checked={item.blackF} onChange={v=>s("blackF",v)} label="+$2,000"/></QRow>
        </>}
        </>}
        {result&&!result.error&&!result.blocked&&(<div style={{background:"#f8f7f3",borderRadius:8,padding:"8px 12px",fontSize:12,display:"flex",justifyContent:"space-between"}}><span style={{color:"#666"}}>{isFixedPlate?`固定片（${item.fpAngle||"90度"}）`:`產品 $${fmtMoney(result.productPrice)}　安裝 $${fmtMoney(result.installFee||0)}`}</span><span style={{fontWeight:700,color:"#1a1a1a"}}>${fmtMoney(adjustedTotal)}</span></div>)}
        {result?.error&&<div style={{color:"#c0392b",fontSize:12,fontWeight:600}}>⚠️ {result.error}</div>}
        {result?.blocked&&<div style={{color:"#c0392b",fontSize:12,fontWeight:600}}>🚫 南部不販售無框產品</div>}
      </div>
    </div>
  );
}

function WorkOrderModal({items,results,custName,phone,addr,master,region,wDeduct,isShipping,clientName,onClose}){
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
    if(t==="一支把手")return"加一支把手";
    if(t==="內外把手")return"加內外把手";
    if(t==="內把手")return"加內把手";
    return"";
  }

  const shipText=master==="余青陽"?"寄松成":master==="賴彥銘"?"自載":master==="郭師傅"?(region==="台南"?"寄台南站":"寄高雄站"):master==="進南貨運"?"寄進南":"";

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
            {dateStr}　BW0800　（{clientName||custName||""}）
          </div>

          {validItems.map((item,idx)=>{
            const wR=item.wMm/10;
            const hR=item.hMm/10;
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
            const sizeStr=(item.dt==="L型二門"||item.dt==="圓弧型")?`W${wFinal}*W${w2Final||w2R}*H${hFinal}`:`W${wFinal}*H${hFinal}`;
            const sizeLine=isFixedPlate?`W${wR}*H${hR}`:[sizeStr,dir,towelText].filter(Boolean).join("  ");
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
              {item.addonType==="自填"&&<div>{item.addonName||""}</div>}
            </div>
          ))}

          {shipText&&<div style={{textAlign:"right",marginTop:28,fontSize:14}}>{shipText}</div>}
        </div>
      </div>
    </Modal>
  );
}

function QuotationSystem({onCreateOrder}){
  const [items,setItems]=useState([defItem()]);
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
    const q={id:Date.now(),custName,custPhone,custLine,addr,master,region,grandTotal,qDate,vDate,items:itemsWithResults,status:"有效",convertedAt:null};
    setQuotes(p=>[q,...p]);
    sb.upsert("quotes",{id:q.id,data:q});
    setSavedQuote(true);setTimeout(()=>setSavedQuote(false),2000);
  }

  function handleConvertQuote(q){
    const productDesc=q.items.map(item=>{
      if(item.cat==="加購品"){const t=item.addonType||"毛巾桿";return t==="自填"?(item.addonName||"加購品"):t;}
      if(item.dt==="固定片")return`固定片 ${item.mat||""} ${item.col||""}`.trim();
      if(item.cat==="有框")return`${item.dt}（${item.col}）${item.mat} W${Math.round(item.wMm/10)}×H${Math.round(item.hMm/10)}`;
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
    if(item.cat==="有框")return calcFramed({doorType:item.dt,material:item.mat,color:item.col,wMm:item.wMm,hMm:item.hMm,wMm2:item.wMm2,hasThreshold:item.hasThr,thresholdMm:item.thrMm,towelBar:item.towel,fourDoorFull:item.fourFull,foldLock:item.foldLock,arcShorten:item.arcShort,floor,hasElevator:elev,installType:item.instType||"純安裝",fixplateFee:fpFee,region,master});
    return calcFrameless({doorType:item.dt,wMm:item.wMm,hMm:item.hMm,film:item.film,filmType:item.filmType,blackFrame:item.blackF,flatTube:item.flatT,floor,hasElevator:elev,fixplateFee:fpFee});
  });
  const shippingFee=master==="進南貨運"?500+jinnExtra:0;
  const grandTotal=results.reduce((s,r,i)=>s+(r&&!r.error&&!r.blocked&&!r.pending?(r.total+(items[i].cat==="加購品"||items[i].dt==="固定片"?0:items[i].adjust||0)):0),0)+shippingFee;
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
        const name=t==="自填"?(item.addonName||"加購品"):(t+col);
        lines.push(name);
        lines.push(`費用：$${fmtMoney(r.productPrice)}`);
      } else if(item.dt==="固定片"){
        lines.push(`固定片／${item.mat}／${item.col}`);
        lines.push(`尺寸：W${item.wMm/10} × H${item.hMm/10} cm`);
        lines.push(`產品費用：$${fmtMoney(r.productPrice)}`);
        const adjAmt=item.adjust||0;const instDisplay=(r.installFeeBase||r.installFee||0)+(r.shipSurcharge||0)+adjAmt;if(instDisplay>0)lines.push(`安裝費：$${fmtMoney(instDisplay)}`);
      } else if(item.dt==="L型二門"){
        lines.push(`${item.dt}／${item.mat}／${item.col}`);
        lines.push(`尺寸：W${item.wMm/10} × W${item.wMm2/10} × H${item.hMm/10} cm`);
        lines.push(`產品費用：$${fmtMoney(r.productPrice)}`);
        const adjAmt=item.adjust||0;const instDisplay=(r.installFeeBase||r.installFee||0)+(r.shipSurcharge||0)+adjAmt;if(instDisplay>0)lines.push(`安裝費：$${fmtMoney(instDisplay)}`);
        if(r.floorFee>0)lines.push(`樓層費（${floor}樓）：$${fmtMoney(r.floorFee)}`);
        if(r.thresholdPrice>0)lines.push(`鋁門檻（${item.thrMm/10} cm）：$${fmtMoney(r.thresholdPrice)}`);
        if(r.thresholdInstallFee>0)lines.push(`門檻安裝費：$${fmtMoney(r.thresholdInstallFee)}`);
        if(r.towelPrice>0)lines.push(`毛巾桿×${item.towel}：$${fmtMoney(r.towelPrice)}`);
      } else {
        lines.push(`${item.dt}／${item.cat==="有框"?item.mat+"／"+item.col:"8mm強化清玻"}`);
        lines.push(`尺寸：W${item.wMm/10} × H${item.hMm/10} cm`);
        lines.push(`產品費用：$${fmtMoney(r.productPrice)}`);
        const adjAmt=item.adjust||0;const instDisplay=(r.installFeeBase||r.installFee||0)+(r.shipSurcharge||0)+adjAmt;if(instDisplay>0)lines.push(`安裝費：$${fmtMoney(instDisplay)}`);
        if(r.floorFee>0)lines.push(`樓層費（${floor}樓）：$${fmtMoney(r.floorFee)}`);
        if(r.thresholdPrice>0)lines.push(`鋁門檻（${item.thrMm/10} cm）：$${fmtMoney(r.thresholdPrice)}`);
        if(r.thresholdInstallFee>0)lines.push(`門檻安裝費：$${fmtMoney(r.thresholdInstallFee)}`);
        if(r.towelPrice>0)lines.push(`毛巾桿×${item.towel}：$${fmtMoney(r.towelPrice)}`);
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
      if(item.cat==="有框")return`${item.dt}（${item.col}）${item.mat} W${Math.round(item.wMm/10)}×H${Math.round(item.hMm/10)}`;
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
        <QRow label="W扣尺寸"><QToggle value={String(wDeduct)} onChange={v=>setWDeduct(Number(v))} options={["0","0.5","1","1.5","2"]}/><span style={{fontSize:11,color:"#888"}}>cm</span></QRow>
      </QSection>
      <div>
        <div style={{fontWeight:700,fontSize:13,marginBottom:8,color:"#374151"}}>門型明細</div>
        {items.map((item,idx)=>(<DoorItemForm key={item.id} item={item} idx={idx} floor={floor} elev={elev} fpFee={fpFee} master={master} region={region} onUpdate={updated=>updateItem(idx,updated)} onRemove={()=>removeItem(idx)} canRemove={items.length>1}/>))}
        <button onClick={addItem} style={{width:"100%",padding:"10px",borderRadius:8,border:"2px dashed #ddd",background:"#fff",cursor:"pointer",fontSize:13,fontWeight:700,color:"#888"}}>＋ 新增門型</button>
      </div>
      <QSection title="報價結果" accent>
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
                {item.dt==="L型二門"?`W${item.wMm/10} × W${item.wMm2/10} × H${item.hMm/10} cm`:`W${item.wMm/10} × H${item.hMm/10} cm`}
              </div>}
              <div style={{display:"flex",justifyContent:"space-between",fontSize:14,color:"#333",marginBottom:3}}><span>產品費用</span><span style={{fontWeight:600}}>${fmtMoney(r.productPrice)}</span></div>
              {(r.installFeeBase||r.installFee||0)+(r.shipSurcharge||0)+(item.cat==="加購品"?0:item.adjust||0)>0&&<div style={{display:"flex",justifyContent:"space-between",fontSize:14,color:"#333",marginBottom:3}}><span>安裝費</span><span style={{fontWeight:600}}>${fmtMoney((r.installFeeBase||r.installFee||0)+(r.shipSurcharge||0)+(item.cat==="加購品"?0:item.adjust||0))}</span></div>}
              {(r.shipFee||0)>0&&<div style={{display:"flex",justifyContent:"space-between",fontSize:14,color:"#333",marginBottom:3}}><span>運費</span><span style={{fontWeight:600}}>${fmtMoney(r.shipFee)}</span></div>}
              {r.floorFee>0&&<div style={{display:"flex",justifyContent:"space-between",fontSize:14,color:"#333",marginBottom:3}}><span>樓層費（{floor}樓）</span><span style={{fontWeight:600}}>${fmtMoney(r.floorFee)}</span></div>}
              {r.thresholdPrice>0&&<div style={{display:"flex",justifyContent:"space-between",fontSize:14,color:"#333",marginBottom:3}}><span>鋁門檻（{(item.thrMm/10)} cm）</span><span style={{fontWeight:600}}>${fmtMoney(r.thresholdPrice)}</span></div>}
              {r.thresholdInstallFee>0&&<div style={{display:"flex",justifyContent:"space-between",fontSize:14,color:"#333",marginBottom:3}}><span>門檻安裝費</span><span style={{fontWeight:600}}>${fmtMoney(r.thresholdInstallFee)}</span></div>}
              {r.towelPrice>0&&<div style={{display:"flex",justifyContent:"space-between",fontSize:14,color:"#333",marginBottom:3}}><span>毛巾桿×{item.towel}</span><span style={{fontWeight:600}}>${fmtMoney(r.towelPrice)}</span></div>}
              <div style={{display:"flex",justifyContent:"space-between",fontSize:15,color:"#111",fontWeight:700,marginTop:6,paddingTop:6,borderTop:"1px solid #ddd"}}><span>小計</span><span>${fmtMoney(r.total+(item.cat==="加購品"?0:item.adjust||0))}</span></div>
            </div>);
          })}
          {shippingFee>0&&<div style={{display:"flex",justifyContent:"space-between",fontSize:14,color:"#4f46e5",fontWeight:600,marginBottom:8}}><span>🚚 進南貨運運費{jinnExtra>0?`（含偏遠 $${fmtMoney(jinnExtra)}）`:""}</span><span>${fmtMoney(shippingFee)}</span></div>}
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

function DayPanel({date,orders,onClose,onAdd,onEdit,onUpdateOrder}){
  if(!date)return null;
  const dt=new Date(date+"T00:00:00"),WEEK=["日","一","二","三","四","五","六"];
  const label=`${dt.getFullYear()}年${dt.getMonth()+1}月${dt.getDate()}日`,dow=WEEK[dt.getDay()];
  return(
    <div style={{position:"fixed",inset:0,zIndex:200,display:"flex",alignItems:"flex-end",justifyContent:"center"}} onClick={onClose}>
      <div onClick={e=>e.stopPropagation()} style={{background:"#fff",borderRadius:"20px 20px 0 0",width:"100%",maxWidth:520,maxHeight:"76vh",display:"flex",flexDirection:"column",boxShadow:"0 -10px 40px rgba(0,0,0,0.16)",fontFamily:ff}}>
        <div style={{display:"flex",justifyContent:"center",padding:"10px 0 2px"}}><div style={{width:36,height:4,borderRadius:2,background:"#E5E7EB"}}/></div>
        <div style={{padding:"10px 20px 10px",display:"flex",justifyContent:"space-between",alignItems:"center",borderBottom:"1px solid #F3F4F6"}}>
          <div><span style={{fontWeight:800,fontSize:16}}>{label}</span><span style={{fontWeight:500,fontSize:13,color:"#9CA3AF",marginLeft:6}}>（{dow}）</span></div>
          <div style={{display:"flex",gap:8}}><span style={{fontSize:12,color:"#9CA3AF",alignSelf:"center"}}>{orders.length} 件</span><button onClick={()=>onAdd(date)} style={{padding:"6px 14px",borderRadius:20,border:"none",background:"#1E293B",color:"#fff",fontSize:12,fontWeight:700,cursor:"pointer",fontFamily:ff}}>＋ 新增</button></div>
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
                </div>
              </div>
            );
          })}
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
        <div><label style={lbl}>地區</label><select value={area} onChange={e=>setArea(e.target.value)} style={sel}>{Object.keys(master.areas).map(a=><option key={a}>{a}</option>)}</select></div>
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
  const [form,setForm]=useState(order||{customer:"",phone:"",address:"",masterId:"qingyang",area:Object.keys(MASTERS.qingyang.areas)[0],jobType:"安裝",floor:1,hasThreshold:false,hasThresholdReplace:false,isLType:false,hasFixedPlate:false,extras:[],extraCustom:0,date:defaultDate||todayStr,timeSlot:"上午",appointTime:"",status:"待確認",product:"",note:"",wagePayStatus:"待付",transferDate:null,monthlySettled:false,collectedAmount:0,collectOnSite:false,collectStatus:"待收",hasShipping:false,shipDate:"",carrier:"",trackingNo:"",shipStatus:"待寄出",hasElevator:null,mapUrl:"",priceAdjust:0});
  const [orderSearch,setOrderSearch]=useState("");
  const [showOrderSearch,setShowOrderSearch]=useState(!isEdit);
  const master=MASTERS[form.masterId],areas=Object.keys(master.areas);
  const wage=calcWage(master,form.area||areas[0],form.jobType,form.floor,form.hasThreshold,form.isLType,form.hasFixedPlate,form.hasThresholdReplace,form.extras,form.extraCustom,form.hasElevator);
  const set=(k,v)=>setForm(f=>({...f,[k]:v}));
  const matchedOrders=orderSearch.trim()?pendingOrders.filter(p=>{const n=(p.cust||p.customer||"").includes(orderSearch);const a=(p.addr||p.address||"").includes(orderSearch);const pr=(p.product||"").includes(orderSearch);return n||a||pr;}).slice(0,5):[];
  function applyOrder(p){
    const addr=p.addr||p.address||"";
    const det=detectArea(addr,"qingyang")||detectArea(addr,"laiyanming")||detectArea(addr,"guo");
    const masterId=addr.includes("台中")||addr.includes("彰化")||addr.includes("南投")?"laiyanming":addr.includes("台南")||addr.includes("高雄")||addr.includes("屏東")?"guo":"qingyang";
    setForm(f=>({...f,customer:p.cust||p.customer||"",phone:p.phone||"",address:addr,product:p.product||"",masterId,area:det||Object.keys(MASTERS[masterId].areas)[0]}));
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
            <label style={lbl}>從訂單帶入</label>
            <select onChange={e=>{const p=pendingOrders.find(x=>String(x.id)===e.target.value);if(p)applyOrder(p);}} style={sel} defaultValue="">
              <option value="">— 選擇訂單 —</option>
              {pendingOrders.map(p=>(
                <option key={p.id} value={p.id}>{p.cust||p.customer||"（未填）"}{p.product?" ／ "+p.product:""}</option>
              ))}
            </select>
          </div>)}
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
            <div><label style={lbl}>客戶姓名</label><input value={form.customer} onChange={e=>set("customer",e.target.value)} style={inp} placeholder="王大明"/></div>
            <div><label style={lbl}>聯絡電話</label><input value={form.phone||""} onChange={e=>set("phone",e.target.value)} style={inp} placeholder="0912-345-678"/></div>
          </div>
          <div><label style={lbl}>施工地址</label><input value={form.address} onChange={e=>{const addr=e.target.value;set("address",addr);const det=detectArea(addr,form.masterId);if(det)set("area",det);if(addr.includes("無電梯"))set("hasElevator",false);else if(addr.includes("有電梯"))set("hasElevator",true);}} style={inp} placeholder="台北市信義區..."/></div>
          <div><label style={lbl}>產品描述</label><input value={form.product} onChange={e=>set("product",e.target.value)} style={inp} placeholder="一字三門 清玻 銀色 W150×H190"/></div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
            <div><label style={lbl}>日期</label><input type="date" value={form.date} onChange={e=>set("date",e.target.value)} style={inp}/></div>
            <div><label style={lbl}>狀態</label><select value={form.status} onChange={e=>set("status",e.target.value)} style={sel}>{Object.keys(STATUS_CFG).map(s=><option key={s}>{s}</option>)}</select></div>
          </div>
          <div>
            <label style={lbl}>指派師傅</label>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8}}>
              {Object.values(MASTERS).map(m=>(<button key={m.id} onClick={()=>{set("masterId",m.id);set("area",Object.keys(m.areas)[0]);}} style={{padding:"10px 8px",borderRadius:12,border:"2px solid",borderColor:form.masterId===m.id?m.color:"#E5E7EB",background:form.masterId===m.id?m.light:"#fff",cursor:"pointer",fontFamily:ff,textAlign:"center"}}><div style={{fontWeight:800,fontSize:18,color:m.dark}}>{m.avatar}</div><div style={{fontSize:12,fontWeight:700,color:m.dark}}>{m.name}</div></button>))}
            </div>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
            <div><label style={lbl}>地區</label><select value={form.area} onChange={e=>set("area",e.target.value)} style={sel}>{areas.map(a=><option key={a}>{a}</option>)}</select></div>
            <div><label style={lbl}>工作類型</label><select value={form.jobType} onChange={e=>set("jobType",e.target.value)} style={sel}>{["安裝","拆裝","純配送"].map(t=><option key={t}>{t}</option>)}</select></div>
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
          <div><label style={lbl}>備註</label><textarea value={form.note} onChange={e=>set("note",e.target.value)} style={{...inp,height:54,resize:"vertical"}}/></div>
        </div>
        {wage&&(<div style={{marginTop:12,padding:14,borderRadius:12,background:master.light,border:"1.5px solid "+master.color+"40"}}>
          <div style={{fontSize:11,fontWeight:700,color:master.dark,marginBottom:8}}>師傅工資預覽</div>
          <div style={{display:"flex",justifyContent:"space-between",fontWeight:800,color:master.dark,fontSize:18}}><span>合計</span><span>{fmt(wage.total+(form.priceAdjust||0))}</span></div>
          {(form.priceAdjust||0)!==0&&<div style={{fontSize:12,color:master.dark,opacity:0.7}}>基本 {fmt(wage.total)} {(form.priceAdjust||0)>0?"+":""}{(form.priceAdjust||0).toLocaleString()} 調整</div>}
        </div>)}
      </div>
      <div style={{padding:"12px 20px",borderTop:"1px solid #F3F4F6",display:"flex",gap:10}}>
        <button onClick={onClose} style={{flex:1,padding:11,borderRadius:10,border:"1.5px solid #E5E7EB",background:"#fff",cursor:"pointer",fontFamily:ff,fontWeight:600}}>取消</button>
        <button onClick={()=>onSave({...form,id:order?.id||Date.now()})} style={{flex:2,padding:11,borderRadius:10,border:"none",background:master.color,color:"#fff",fontWeight:800,fontSize:14,cursor:"pointer",fontFamily:ff}}>{isEdit?"儲存修改":"新增排程"}</button>
      </div>
    </Modal>
  );
}

const LOGO_B64="iVBORw0KGgoAAAANSUhEUgAABJ4AAASeCAYAAACHE+TqAAAABGdBTUEAALGPC/xhBQAAACBjSFJNAAB6JgAAgIQAAPoAAACA6AAAdTAAAOpgAAA6mAAAF3CculE8AAAAaGVYSWZNTQAqAAAACAACARIAAwAAAAEAAQAAh2kABAAAAAEAAAAmAAAAAAADoAEAAwAAAAEAAQAAoAIABAAAAAEAAASeoAMABAAAAAEAAASeAAAAIEPP93A";

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
        const price=t==="毛巾桿"?(qi.towel||1)*200:t==="鋁門檻"?Math.round(qi.thrMm||0):(qi.addonPrice||0);
        rows.push({id:"addon"+i,name,qty:1,unit:"項",price,note:""});
      } else {
        const name=qi.dt==="固定片"?`固定片 ${qi.mat||""} ${qi.col||""}`.trim():`${qi.dt||""} ${qi.mat||""} ${qi.col||""}`.trim()||order.product||"";
        const prodPrice=(qi.productPrice||0)+(qi.adjust||0);
        rows.push({id:"prod"+i,name:name||"門",qty:1,unit:"樘",price:prodPrice,note:""});
        // 安裝費（基本）
        const instBase=qi.installFeeBase||qi.installFee||0;
        if(instBase>0)rows.push({id:"inst"+i,name:"安裝費",qty:1,unit:"式",price:instBase,note:""});
        // 運費加成
        if((qi.shipSurcharge||0)>0)rows.push({id:"ship"+i,name:"運費",qty:1,unit:"式",price:qi.shipSurcharge,note:""});
        // 樓層費
        if((qi.floorFee||0)>0)rows.push({id:"floor"+i,name:"樓層費",qty:1,unit:"式",price:qi.floorFee,note:""});
        // 鋁門檻（從 thrMm 計算或用存的價格）
        const thrPrice=qi.thresholdPrice||(qi.hasThr&&qi.thrMm>0?Math.round(qi.thrMm):0);
        if(thrPrice>0)rows.push({id:"thr"+i,name:`鋁門檻（${(qi.thrMm||0)/10} cm）`,qty:1,unit:"式",price:thrPrice,note:""});
        // 門檻安裝費
        if(qi.hasThr)rows.push({id:"thrInst"+i,name:"門檻安裝費",qty:1,unit:"式",price:200,note:""});
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
          <div><label style={lbl}>客戶名稱</label><input value={form.custName} onChange={e=>set("custName",e.target.value)} style={inp}/></div>
          <div><label style={lbl}>統一編號</label><input value={form.taxId} onChange={e=>set("taxId",e.target.value)} style={inp} placeholder="（可空白）"/></div>
          <div><label style={lbl}>收件人</label><input value={form.receiver} onChange={e=>set("receiver",e.target.value)} style={inp}/></div>
          <div><label style={lbl}>收件人電話</label><input value={form.receiverPhone} onChange={e=>set("receiverPhone",e.target.value)} style={inp}/></div>
          <div style={{gridColumn:"1/-1"}}><label style={lbl}>送貨地址</label><input value={form.address} onChange={e=>set("address",e.target.value)} style={inp}/></div>
          <div><label style={lbl}>送貨方式</label><input value={form.shipMethod} onChange={e=>set("shipMethod",e.target.value)} style={inp}/></div>
          <div><label style={lbl}>出貨日期</label><input type="date" value={form.shipDate} onChange={e=>set("shipDate",e.target.value)} style={inp}/></div>
          <div style={{gridColumn:"1/-1"}}><label style={lbl}>發票號碼</label><input value={form.invoiceNo} onChange={e=>set("invoiceNo",e.target.value)} style={inp} placeholder="（手填）"/></div>
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
          <div ref={ref} style={{width:794,background:"#fff",padding:"40px 48px",fontFamily:dff,boxSizing:"border-box",fontSize:13}}>
            {/* 標頭 */}
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:16}}>
              <div style={{display:"flex",alignItems:"center",gap:12}}>
                <img src={"data:image/png;base64,"+LOGO_B64} alt="logo" style={{width:56,height:56,objectFit:"contain"}}/>
                <div><div style={{fontSize:20,fontWeight:800,letterSpacing:2}}>享浴有限公司</div><div style={{fontSize:16,fontWeight:700,marginTop:2}}>出　貨　單</div></div>
              </div>
              <div style={{fontSize:12,textAlign:"right",lineHeight:1.8}}>
                {form.invoiceNo&&<div>發票號碼：{form.invoiceNo}</div>}
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
                  <tr><td colSpan={form.showPrice?5:4} rowSpan={form.taxMode==="無"?1:3} style={{...cell,border:"none"}}></td><td style={{...cell,background:"#f5f5f5",fontWeight:700,textAlign:"right"}}>合計金額</td><td style={{...cell,textAlign:"right"}}>{subtotal.toLocaleString()}</td></tr>
                  {form.taxMode!=="無"&&<><tr><td style={{...cell,background:"#f5f5f5",fontWeight:700,textAlign:"right"}}>稅額{form.taxMode==="稅內含"?"（含）":"（加）"}</td><td style={{...cell,textAlign:"right"}}>{tax.toLocaleString()}</td></tr><tr><td style={{...cell,background:"#1a1a2e",color:"#fff",fontWeight:700,textAlign:"right"}}>總金額</td><td style={{...cell,background:"#1a1a2e",color:"#fff",fontWeight:700,textAlign:"right"}}>{total.toLocaleString()}</td></tr></>}
                </>}
              </tbody>
            </table>

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
    if(filter==="scheduled"&&(!p.scheduled||p.ordered||p.shipped||p.completed))return false;
    if(filter==="ordered"&&(!p.ordered||p.shipped||p.completed))return false;
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
        {[{label:"待排程",count:pendingOrders.filter(p=>!p.scheduled&&!p.ordered&&!p.shipped&&!p.completed).length,color:"#D97706",bg:"#FEF3C7",f:"pending"},{label:"已排程",count:pendingOrders.filter(p=>p.scheduled&&!p.ordered&&!p.shipped&&!p.completed).length,color:"#059669",bg:"#D1FAE5",f:"scheduled"},{label:"已下單",count:pendingOrders.filter(p=>p.ordered&&!p.shipped&&!p.completed).length,color:"#7c3aed",bg:"#F3E8FF",f:"ordered"},{label:"已出貨",count:pendingOrders.filter(p=>p.shipped&&!p.completed).length,color:"#0ea5e9",bg:"#e0f2fe",f:"shipped"},{label:"已完成",count:pendingOrders.filter(p=>p.completed).length,color:"#059669",bg:"#D1FAE5",f:"completed"},{label:"全部",count:pendingOrders.length,color:"#3B82F6",bg:"#DBEAFE",f:"all"}].map(({label,count,color,bg,f})=>(
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
            const statusColor=p.completed?"#059669":p.shipped?"#0ea5e9":p.ordered?"#7c3aed":p.scheduled?"#22c55e":"#f59e0b";
            const statusLabel=p.completed?"已完成":p.shipped?"已出貨":p.ordered?"已下單":p.scheduled?"已排程":"未排程";
            const statusBg=p.completed?"#D1FAE5":p.shipped?"#e0f2fe":p.ordered?"#F3E8FF":p.scheduled?"#dcfce7":"#FEF3C7";
            const statusTextColor=p.completed?"#065F46":p.shipped?"#0369a1":p.ordered?"#6d28d9":p.scheduled?"#15803d":"#92400E";
            return(
            <div key={p.id} style={{background:"#fff",borderRadius:12,overflow:"hidden",border:"1px solid #E2E8F0",boxShadow:"0 1px 4px rgba(0,0,0,0.04)",display:"flex"}}>
              <div style={{width:5,background:statusColor,flexShrink:0,borderRadius:"12px 0 0 12px"}}/>
              <div style={{flex:1,minWidth:0}}>
                <div style={{padding:"11px 14px 8px",display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:8}}>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:4,flexWrap:"wrap"}}>
                      {p.orderDate&&<span style={{fontSize:11,color:"#94A3B8",fontFamily:"monospace"}}>{p.orderDate}</span>}
                      <span style={{fontWeight:800,fontSize:15}}>{p.cust||p.customer||"（未填姓名）"}</span>
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
    </div>
  );
}

function PendingOrderForm({order,onSave,onClose}){
  const isEdit=!!order;
  const todayStr2=new Date().toISOString().slice(0,10);
  const initForm=order?{
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
    <Modal onClose={onClose} width={480}>
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
          <div><label style={lbl}>品項描述</label><input value={form.product||""} onChange={e=>set("product",e.target.value)} style={inp} placeholder="一字三門（白）5mmPS101 W150×H190"/></div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
            <div><label style={lbl}>師傅</label><select value={form.master||"余青陽"} onChange={e=>{const m=e.target.value;set("master",m);const autoShip=m==="余青陽"?"寄松成":m==="賴彥銘"?"載":m==="郭師傅"?(form.region==="台南"?"寄台南站址":"寄高雄站址"):m==="進南貨運"?"寄進南":m==="自取"?"自取":"寄松成";set("shipMethod",autoShip);}} style={sel}>{["余青陽","賴彥銘","郭師傅","進南貨運","自取"].map(m=><option key={m}>{m}</option>)}</select></div>
            <div><label style={lbl}>W扣尺寸</label><select value={form.wDeduct||0} onChange={e=>set("wDeduct",Number(e.target.value))} style={sel}>{["0","0.5","1","1.5","2"].map(v=><option key={v} value={v}>{v===0||v==="0"?"不扣":"-"+v+"cm"}</option>)}</select></div>
          </div>
          {clientName&&<div style={{padding:"8px 12px",background:"#F8FAFC",borderRadius:8,fontSize:13}}><span style={{color:"#6B7280"}}>客單名稱：</span><span style={{fontWeight:700}}>{clientName}</span></div>}
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
            <div><label style={lbl}>預計出貨日</label><input value={form.shipDate||""} onChange={e=>set("shipDate",e.target.value)} style={inp} placeholder="5/6"/></div>
            <div><label style={lbl}>出貨方式</label><select value={form.shipMethod||"寄松成"} onChange={e=>set("shipMethod",e.target.value)} style={sel}>{["寄松成","寄進南","寄台南站址","寄高雄站址","載","自取","代安裝","其他"].map(o=><option key={o}>{o}</option>)}</select></div>
          </div>
          <div><label style={lbl}>備註</label><textarea value={form.note||""} onChange={e=>set("note",e.target.value)} style={{...inp,height:60,resize:"vertical"}} placeholder="特殊注意事項..."/></div>
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
              <div><label style={lbl}>付款方式</label><select value={form.depositMethod||"匯款"} onChange={e=>set("depositMethod",e.target.value)} style={sel}>{["匯款","現金","刷卡"].map(m=><option key={m}>{m}</option>)}</select></div>
              <div><label style={lbl}>收款日期</label><input type="date" value={form.depositDate||""} onChange={e=>set("depositDate",e.target.value)} style={inp}/></div>
            </div>}
            {form.payStatus==="已付清"&&<div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
              <div><label style={lbl}>付款方式</label><select value={form.finalMethod||"匯款"} onChange={e=>set("finalMethod",e.target.value)} style={sel}>{["匯款","現金","刷卡"].map(m=><option key={m}>{m}</option>)}</select></div>
              <div><label style={lbl}>收款日期</label><input type="date" value={form.finalDate||""} onChange={e=>set("finalDate",e.target.value)} style={inp}/></div>
            </div>}
          </div>
          {isEdit&&form.quoteItems&&form.quoteItems.length>0&&(
            <div>
              <label style={lbl}>出工單</label>
              <button onClick={()=>setShowWO(true)} style={{width:"100%",padding:"10px",borderRadius:8,border:"none",background:"#7c3aed",color:"#fff",fontWeight:700,fontSize:13,cursor:"pointer",fontFamily:ff}}>🖨️ 預覽工單 / 下載PNG</button>
              {form.ordered&&<div style={{marginTop:6,fontSize:12,color:"#059669",fontWeight:700}}>✅ 已下單 {form.orderedAt||""}</div>}
            </div>
          )}
        </div>
      </div>
      <div style={{padding:"12px 20px",borderTop:"1px solid #F3F4F6",display:"flex",gap:10}}>
        <button onClick={onClose} style={{flex:1,padding:11,borderRadius:10,border:"1.5px solid #E5E7EB",background:"#fff",cursor:"pointer",fontFamily:ff,fontWeight:600}}>取消</button>
        <button onClick={()=>onSave({...form,id:order?.id||Date.now(),scheduled:order?.scheduled||false,customer:form.cust||"",address:form.addr||""})} style={{flex:2,padding:11,borderRadius:10,border:"none",background:"#1E293B",color:"#fff",fontWeight:800,fontSize:14,cursor:"pointer",fontFamily:ff}}>{isEdit?"儲存修改":"新增訂單"}</button>
      </div>
      {showWO&&(()=>{const today=new Date();const dateStr=`${today.getFullYear()-1911}.${today.getMonth()+1}.${today.getDate()}`;return<WorkOrderModal items={form.quoteItems.map(qi=>({...qi,id:qi.wMm+qi.hMm+qi.dt,cat:qi.dt==="固定片"?"有框":qi.cat||"有框",instType:"純安裝",hasThr:false,towel:0,film:false}))} results={form.quoteItems.map(()=>({productPrice:0,installFee:0,floorFee:0,total:0}))} custName={form.cust||""} phone={form.phone||""} addr={form.addr||""} master={form.master||"余青陽"} region={form.region||""} wDeduct={form.wDeduct||0} isShipping={isShip} clientName={clientName} onClose={()=>{setShowWO(false);const at=new Date().toLocaleDateString("zh-TW");onSave({...form,id:order?.id||Date.now(),scheduled:order?.scheduled||false,customer:form.cust||"",address:form.addr||"",ordered:true,orderedAt:at});}}/>;})()}
    </Modal>
  );
}

const SEED_ORDERS=[
  {id:1,masterId:"qingyang",area:"台北",jobType:"拆裝",customer:"林嘉威",phone:"0976588977",address:"台北市南港區舊莊街一段181號4樓之1 無電梯",product:"一字二門（白）5mmPS101 W148×H200 右開",date:"2026-04-11",timeSlot:"下午",appointTime:"",status:"完成",floor:4,hasThreshold:true,hasThresholdReplace:false,isLType:false,hasFixedPlate:false,extras:[],extraCustom:0,note:"無尾款。現場左伸縮料要切有水管。",hasShipping:true,carrier:"進南貨運",shipDate:"2026-04-02",shipStatus:"已到站",collectOnSite:false,collectedAmount:0,collectStatus:"已收",wagePayStatus:"待付",monthlySettled:false,hasElevator:false},
  {id:2,masterId:"qingyang",area:"新北",jobType:"安裝",customer:"王欣怡",phone:"0931-168-070",address:"新北市三重區名源街48號3樓 無電梯",product:"一字二門（黑）5mm清玻貼防爆砂膜 W128×H200",date:"2026-04-04",timeSlot:"下午",appointTime:"",status:"完成",floor:3,hasThreshold:true,hasThresholdReplace:false,isLType:false,hasFixedPlate:false,extras:[],extraCustom:0,note:"前一天電聯。",hasShipping:true,carrier:"進南貨運",shipDate:"2026-04-01",shipStatus:"已到站",collectOnSite:true,collectedAmount:8760,collectStatus:"已收",wagePayStatus:"待付",monthlySettled:false,hasElevator:false},
  {id:3,masterId:"laiyanming",area:"台中",jobType:"安裝",customer:"陳志明",phone:"0912345678",address:"台中市西屯區大墩路500號5樓",product:"一字三門（銀）5mmPS503 W150×H190",date:"2026-04-15",timeSlot:"上午",appointTime:"10:00",status:"已確認",floor:5,hasThreshold:false,hasThresholdReplace:false,isLType:false,hasFixedPlate:false,extras:[],extraCustom:0,note:"",hasShipping:true,carrier:"進南貨運",shipDate:"2026-04-13",shipStatus:"已到站",collectOnSite:true,collectedAmount:6200,collectStatus:"待收",wagePayStatus:"待付",monthlySettled:false,hasElevator:true},
  {id:4,masterId:"guo",area:"高雄",jobType:"安裝",customer:"李美華",phone:"0987654321",address:"高雄市前鎮區瑞隆路200號3樓",product:"一字三門（白）5mmPS101 W140×H185",date:"2026-04-18",timeSlot:"下午",appointTime:"",status:"待確認",floor:3,hasThreshold:false,hasThresholdReplace:false,isLType:false,hasFixedPlate:false,extras:[],extraCustom:0,note:"",hasShipping:false,carrier:"",shipDate:"",shipStatus:"待寄出",collectOnSite:false,collectedAmount:0,collectStatus:"待收",wagePayStatus:"待付",monthlySettled:false,hasElevator:false},
  {id:5,masterId:"qingyang",area:"新北",jobType:"安裝",customer:"吳懷珍",phone:"0912828870",address:"新北市中和區橋和路160巷21號6樓（有電梯）",product:"一字三門（白）PS501-5mm W128×H190",date:"2026-04-24",timeSlot:"上午",appointTime:"",status:"已確認",floor:6,hasThreshold:true,hasThresholdReplace:false,isLType:false,hasFixedPlate:false,extras:[],extraCustom:0,note:"安裝前一天通知準確時間。",hasShipping:true,carrier:"進南貨運",shipDate:"2026-04-22",shipStatus:"已寄出",collectOnSite:true,collectedAmount:5362,collectStatus:"待收",wagePayStatus:"待付",monthlySettled:false,hasElevator:true},
];

// ─── 主頁面切換包裝 ───────────────────────────────────────────────────────────
export default function App(){
  const [mainTab, setMainTab] = useState("erp");
  const [orders,setOrders]=useState(SEED_ORDERS);
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
    const toSave={...order,id:order.id||Date.now(),customer:order.cust||order.customer||"",address:order.addr||order.address||""};
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
    setOrders(p=>[...p,o]);
    setShowForm(false);
    setPendingAddDate(null);
    const exists=pendingOrders.find(p=>(p.cust||p.customer||"")===(o.customer||"")&&(p.addr||p.address||"")===(o.address||""));
    let newPending=null;
    if(!exists&&o.customer){
      newPending={id:Date.now(),cust:o.customer,phone:o.phone||"",addr:o.address||"",master:MASTERS[o.masterId]?.name||"余青陽",region:o.area||"",product:o.product||"",shipMethod:o.jobType==="純配送"?"寄進南":"安裝",wDeduct:0,ordered:false,scheduled:true,quoteItems:[]};
      savePendingOrder(newPending);
    }
    // 跳到出貨單分頁並自動開啟
    const target=newPending||exists;
    if(target){setTab("delivery");setAutoOpenDelivery(target);}
  };
  const saveOrder=o=>{setOrders(p=>p.map(x=>x.id===o.id?o:x));setEditOrder(null);};
  const deleteOrder=id=>{setOrders(p=>p.filter(o=>o.id!==id));setEditOrder(null);};
  const updateOrder=(id,patch)=>setOrders(p=>p.map(o=>o.id===id?{...o,...patch}:o));
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
            {!loading&&tab==="quote"&&(<QuotationSystem onCreateOrder={p=>{savePendingOrder({...p,id:Date.now(),scheduled:false});setTab("pending");}}/>)}
            {!loading&&tab==="pending"&&(<PendingOrdersTab pendingOrders={pendingOrders} onEdit={p=>{setEditPending(p);setShowPendingForm(true);}} onDelete={id=>deletePendingOrder(id)} onToggleOrdered={id=>{const o=pendingOrders.find(x=>x.id===id);if(o)updatePendingOrder(id,{ordered:!o.ordered});}}/>)}
            {!loading&&tab==="delivery"&&(<DeliveryTab pendingOrders={pendingOrders} autoOpen={autoOpenDelivery} onAutoOpenDone={()=>setAutoOpenDelivery(null)} onMarkShipped={(id,invoiceNo,total)=>updatePendingOrder(id,{shipped:true,shippedAt:new Date().toISOString().slice(0,10),invoiceNo,shippedTotal:total})}/>)}
            {tab==="calendar"&&(<>
              <WageSummary orders={orders} year={calYear} month={calMonth} onTransferLog={()=>{}} onMonthlySettle={()=>{}}/>
              <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:10}}>
                <button onClick={prevMonth} style={iBtn}>‹</button>
                <span style={{fontWeight:800,fontSize:16,minWidth:100,textAlign:"center"}}>{calYear}年 {calMonth+1}月</span>
                <button onClick={nextMonth} style={iBtn}>›</button>
                <button onClick={()=>{setCalYear(today.getFullYear());setCalMonth(today.getMonth());}} style={{padding:"5px 11px",borderRadius:8,border:"1px solid #E5E7EB",background:"#fff",cursor:"pointer",fontSize:12,color:"#6B7280",fontFamily:ff}}>今天</button>
              </div>
              <TTCalendar orders={filtered} year={calYear} month={calMonth} onDayClick={setSelectedDate}/>
            </>)}
          </div>

          {selectedDate&&(<DayPanel date={selectedDate} orders={dayOrders} onClose={()=>setSelectedDate(null)} onAdd={date=>{setPendingAddDate(date);setSelectedDate(null);setShowForm(true);}} onEdit={o=>{setEditOrder(o);setSelectedDate(null);}} onUpdateOrder={updateOrder}/>)}
          {(showForm||editOrder)&&(<OrderForm order={editOrder} defaultDate={pendingAddDate||todayStr} pendingOrders={pendingOrders.filter(p=>!p.scheduled)} onSave={o=>{if(editOrder){saveOrder(o);}else{addOrder(o);}}} onClose={()=>{setShowForm(false);setEditOrder(null);setPendingAddDate(null);}} onDelete={deleteOrder}/>)}
          {wageCalcMaster&&<WageCalc master={wageCalcMaster} onClose={()=>setWageCalcMaster(null)}/>}
          {showPendingForm&&(<PendingOrderForm order={editPending?.id?editPending:null} onSave={p=>{
            savePendingOrder({...p,id:editPending?.id||Date.now(),scheduled:editPending?.scheduled||false});
            setShowPendingForm(false);setEditPending(null);
          }} onClose={()=>{setShowPendingForm(false);setEditPending(null);}}/>)}
        </div>
      )}
    </div>
  );
}