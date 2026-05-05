import React, { useState, useEffect, useMemo, useRef } from "react";

const ff = "'Noto Sans TC','PingFang TC',sans-serif";
// ─── 首頁模組（交班中心）────────────────────────────────────────────────────
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
        <div style={{background:isSelf?"#1d4ed8":"#1e2740",border:`1px solid ${isSelf?"#2563eb":"#2e3a5c"}`,borderRadius:10,padding:"8px 12px",fontSize:14,lineHeight:1.55,color:"#e2e8f0"}}>
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
  const [loaded,setLoaded]=useState(false);
  const [filter,setFilter]=useState("全部");
  const msgEndRef=useRef(null);

  useEffect(()=>{(async()=>{
    try{const r1=await window.storage.get("erp-messages");setMessages(r1?JSON.parse(r1.value):HOME_SEED_MSGS);}catch{setMessages(HOME_SEED_MSGS);}
    try{const r2=await window.storage.get("erp-todos");setTodos(r2?JSON.parse(r2.value):HOME_SEED_TODOS);}catch{setTodos(HOME_SEED_TODOS);}
    setLoaded(true);
  })();},[]);

  useEffect(()=>{if(homeTab==="board")msgEndRef.current?.scrollIntoView({behavior:"smooth"});},[messages,homeTab]);
  useEffect(()=>{if(loaded)try{window.storage.set("erp-messages",JSON.stringify(messages));}catch{};},[messages,loaded]);
  useEffect(()=>{if(loaded)try{window.storage.set("erp-todos",JSON.stringify(todos));}catch{};},[todos,loaded]);

  function sendMsg(){const text=msgInput.trim();if(!text)return;setMessages(p=>[...p,{id:Date.now(),user:currentUser,text,time:new Date().toISOString(),pinned:false}]);setMsgInput("");}
  function pinMsg(id){setMessages(p=>p.map(m=>m.id===id?{...m,pinned:!m.pinned}:m));}
  function deleteMsg(id){setMessages(p=>p.filter(m=>m.id!==id));}
  function addTodo(){const text=todoInput.trim();if(!text)return;setTodos(p=>[{id:Date.now(),text,done:false,priority:todoPriority,assignee:todoAssignee,time:new Date().toISOString()},...p]);setTodoInput("");}
  function toggleTodo(id){setTodos(p=>p.map(t=>t.id===id?{...t,done:!t.done}:t));}
  function deleteTodo(id){setTodos(p=>p.filter(t=>t.id!==id));}

  const pinnedMsgs=messages.filter(m=>m.pinned);
  const normalMsgs=messages.filter(m=>!m.pinned);
  const filteredTodos=filter==="全部"?todos:filter==="未完成"?todos.filter(t=>!t.done):todos.filter(t=>t.assignee===filter);
  const pendingCount=todos.filter(t=>!t.done).length;

  const dark="#0f1117";const dark2="#161b2e";const dark3="#1a1f2e";const border="#1e2740";const border2="#2e3a5c";const muted="#64748b";const text="#e2e8f0";

  return(
    <div style={{background:dark,minHeight:"100vh",color:text,fontFamily:ff}}>
      <style>{`@keyframes fadeUp{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}} .hm-bubble{animation:fadeUp .2s ease both} .hm-todo{animation:fadeUp .15s ease both} ::-webkit-scrollbar{width:5px} ::-webkit-scrollbar-track{background:${dark}} ::-webkit-scrollbar-thumb{background:#2e3650;border-radius:3px}`}</style>

      {/* 使用者選擇 */}
      <div style={{background:dark2,borderBottom:`1px solid ${border}`,padding:"10px 20px",display:"flex",alignItems:"center",gap:10}}>
        <span style={{fontSize:12,color:muted}}>目前使用者</span>
        <select value={currentUser} onChange={e=>setCurrentUser(e.target.value)} style={{background:"#1e2740",border:`1.5px solid ${HOME_USER_COLORS[currentUser]}`,borderRadius:7,color:text,padding:"5px 10px",fontSize:13,cursor:"pointer",fontFamily:ff}}>
          {HOME_USERS.map(u=><option key={u}>{u}</option>)}
        </select>
        <div style={{width:9,height:9,borderRadius:"50%",background:HOME_USER_COLORS[currentUser]}}/>
        {/* 子頁籤 */}
        <div style={{marginLeft:"auto",display:"flex",gap:3}}>
          {[["board","📋 留言板",pinnedMsgs.length],["todo","✅ 代辦",pendingCount],["secret","📐 秘笈",0]].map(([k,l,c])=>(
            <button key={k} onClick={()=>setHomeTab(k)} style={{background:homeTab===k?"#1e2740":"transparent",border:"none",borderBottom:`2px solid ${homeTab===k?"#3b82f6":"transparent"}`,color:homeTab===k?text:muted,padding:"6px 14px",fontSize:13,cursor:"pointer",fontFamily:ff,borderRadius:"5px 5px 0 0",display:"flex",alignItems:"center",gap:5}}>
              {l}{c>0&&<span style={{background:k==="todo"?"#e74c3c":"#f39c12",color:"#fff",borderRadius:10,padding:"1px 5px",fontSize:10,fontWeight:700}}>{c}</span>}
            </button>
          ))}
        </div>
      </div>

      <div style={{padding:"16px 20px",maxWidth:800,margin:"0 auto"}}>

        {/* 留言板 */}
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
                <textarea value={msgInput} onChange={e=>setMsgInput(e.target.value)} onKeyDown={e=>{if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();sendMsg();}}} placeholder="輸入訊息…（Enter 送出，Shift+Enter 換行）" rows={2} style={{flex:1,background:"#111827",border:`1px solid ${border2}`,borderRadius:8,color:text,padding:"8px 12px",fontSize:13,resize:"none",fontFamily:ff,lineHeight:1.5}}/>
                <button onClick={sendMsg} style={{background:"#1d4ed8",border:"none",borderRadius:8,color:"#fff",padding:"8px 16px",fontSize:13,cursor:"pointer",fontFamily:ff,fontWeight:600,height:36,flexShrink:0}}>送出</button>
              </div>
            </div>
          </div>
        )}

        {/* 代辦 */}
        {homeTab==="todo"&&(
          <div style={{display:"flex",flexDirection:"column",gap:14}}>
            <div style={{background:dark3,border:`1px solid ${border}`,borderRadius:10,padding:14}}>
              <div style={{fontSize:11,color:muted,marginBottom:10,letterSpacing:1}}>＋ 新增代辦</div>
              <input value={todoInput} onChange={e=>setTodoInput(e.target.value)} onKeyDown={e=>{if(e.key==="Enter")addTodo();}} placeholder="代辦事項內容…" style={{width:"100%",background:"#111827",border:`1px solid ${border2}`,borderRadius:8,color:text,padding:"9px 14px",fontSize:13,fontFamily:ff,marginBottom:10}}/>
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

        {/* 秘笈 */}
        {homeTab==="secret"&&<HomeSecretTab/>}
      </div>
    </div>
  );
}

// ─── 固定片定價表（W/H 單位 cm，進位同門型） ──────────────────────────────────
// 圖3：5mmPS板（白/牙框、霧銀框、黑框）— 已含隔中腰
const FP_PS = {
  "白/牙色": {
    140:[2000,2000,2200,2200,2400,2400,2600,2800,3000,3200],
    150:[2000,2000,2200,2200,2400,2400,2600,2800,3000,3200],
    160:[2200,2200,2400,2400,2600,2600,2800,3000,3200,3400],
    170:[2200,2200,2400,2400,2600,2600,2800,3000,3200,3400],
    180:[2400,2400,2600,2600,2800,2800,3000,3200,3400,3600],
    190:[2400,2400,2600,2600,2800,2800,3000,3200,3400,4200],
    200:[2800,2800,3000,3000,3200,3200,3400,3600,3800,4600],
    210:[3000,3000,3200,3200,3400,3400,3600,4000,4200,5000],
  },
  "銀色": {
    140:[2200,2200,2400,2400,2600,2600,2800,3000,3200,3400],
    150:[2200,2200,2400,2400,2600,2600,2800,3000,3200,3400],
    160:[2400,2400,2600,2600,2800,2800,3000,3200,3400,3600],
    170:[2400,2400,2600,2600,2800,2800,3000,3200,3400,3600],
    180:[2600,2600,2800,2800,3000,3000,3200,3400,3600,3800],
    190:[2600,2600,2800,2800,3000,3000,3200,3400,3600,4400],
    200:[3000,3000,3200,3200,3400,3400,3600,3800,4000,4800],
    210:[3200,3200,3400,3400,3600,3600,3800,4200,4400,5200],
  },
  "黑色": {
    140:[3000,3000,3200,3200,3400,3400,3600,3800,4000,4200],
    150:[3000,3000,3200,3200,3400,3400,3600,3800,4000,4200],
    160:[3200,3200,3400,3400,3600,3600,3800,4000,4200,4400],
    170:[3200,3200,3400,3400,3600,3600,3800,4000,4200,4400],
    180:[3400,3400,3600,3600,3800,3800,4000,4200,4400,4600],
    190:[3400,3400,3600,3600,3800,3800,4000,4200,4400,5200],
    200:[3800,3800,4000,4000,4200,4200,4400,4600,4800,5600],
    210:[4000,4000,4200,4200,4400,4400,4600,5000,5200,6000],
  },
};
// 圖1：清玻貼清膜／噴砂（白/牙框、霧銀框、黑框）
const FP_GLASS = {
  "白/牙色": {
    140:[3400,3800,4200,4600,5200,5600,6200,6800,7400,8000],
    150:[3600,4000,4400,4800,5400,5800,6400,7000,7600,8200],
    160:[4000,4400,4800,5200,5800,6400,7000,7800,8400,9000],
    170:[4200,4600,5000,5400,6000,6600,7200,8000,8600,9200],
    180:[4800,5200,5800,6200,6800,7400,8200,9000,9600,10200],
    190:[5000,5400,6000,6400,7000,7600,8400,9200,9800,10400],
    200:[5800,6200,6800,7200,8000,8600,9400,10400,11000,11800],
    210:[6400,6800,7400,7800,8600,9200,10000,11000,11600,12400],
  },
  "銀色": {
    140:[3600,4000,4400,4800,5400,5800,6400,7000,7600,8200],
    150:[3800,4200,4600,5000,5600,6000,6600,7200,7800,8400],
    160:[4200,4600,5000,5400,6000,6600,7200,8000,8600,9200],
    170:[4400,4800,5200,5600,6200,6800,7400,8200,8800,9400],
    180:[5000,5400,6000,6400,7000,7600,8400,9200,9800,10400],
    190:[5200,5600,6200,6600,7200,7800,8600,9400,10000,10600],
    200:[6000,6400,7000,7400,8200,8800,9600,10600,11200,12000],
    210:[6600,7000,7600,8000,8800,9400,10200,11200,11800,12600],
  },
  "黑色": {
    140:[4400,4800,5200,5600,6200,6600,7200,7800,8400,9000],
    150:[4600,5000,5400,5800,6400,6800,7400,8000,8600,9200],
    160:[5000,5400,5800,6200,6800,7400,8000,8800,9400,10000],
    170:[5200,5600,6000,6400,7000,7600,8200,9000,9600,10200],
    180:[5800,6200,6800,7200,7800,8400,9200,10000,10600,11200],
    190:[6000,6400,7000,7400,8000,8600,9400,10200,10800,11400],
    200:[6800,7200,7800,8200,9000,9600,10400,11400,12000,12800],
    210:[7400,7800,8400,8800,9600,10200,11000,12000,12600,13400],
  },
};
// 圖2：銀霞玻貼防爆清膜（白/牙框、霧銀框、黑框）
const FP_SILVERFROST = {
  "白/牙色": {
    140:[4200,4600,5100,5500,6200,6600,7200,7900,8600,9300],
    150:[4400,4800,5300,5700,6400,6800,7400,8100,8800,9500],
    160:[4900,5300,5800,6200,6800,7500,8200,9100,9800,10400],
    170:[5100,5500,6000,6400,7000,7700,8400,9300,10000,10600],
    180:[5800,6200,6800,7200,7900,8600,9500,10400,11000,11700],
    190:[6000,6400,7000,7400,8100,8800,9700,10600,11200,11900],
    200:[6900,7300,8000,8400,9300,10000,10800,11900,12600,13500],
    210:[7600,8000,8700,9100,10000,10600,11500,12600,13300,14200],
  },
  "銀色": {
    140:[4400,4800,5300,5700,6400,6800,7400,8100,8800,9500],
    150:[4600,5000,5500,5900,6600,7000,7600,8300,9000,9700],
    160:[5100,5500,6000,6400,7000,7700,8400,9300,10000,10600],
    170:[5300,5700,6200,6600,7200,7900,8600,9500,10200,10800],
    180:[6000,6400,7000,7400,8100,8800,9700,10600,11200,11900],
    190:[6200,6600,7200,7600,8300,9000,9900,10800,11400,12100],
    200:[7100,7500,8200,8600,9500,10200,11000,12100,12800,13700],
    210:[7800,8200,8900,9300,10200,10800,11700,12800,13500,14400],
  },
  "黑色": {
    140:[5200,5600,6100,6500,7200,7600,8200,8900,9600,10300],
    150:[5400,5800,6300,6700,7400,7800,8400,9100,9800,10500],
    160:[5900,6300,6800,7200,7800,8500,9200,10100,10800,11400],
    170:[6100,6500,7000,7400,8000,8700,9400,10300,11000,11600],
    180:[6800,7200,7800,8200,8900,9600,10500,11400,12000,12700],
    190:[7000,7400,8000,8400,9100,9800,10700,11600,12200,12900],
    200:[7900,8300,9000,9400,10300,11000,11800,12900,13600,14500],
    210:[8600,9000,9700,10100,11000,11600,12500,13600,14300,15200],
  },
};

const FP_W_KEYS=[30,40,50,60,70,80,90,100,110,120]; // cm
const FP_H_KEYS=[140,150,160,170,180,190,200,210]; // cm

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
  const wCm=wMm/10,hCm=hMm/10;
  const matKey=["5mmPS101","5mmPS503","5mmPS501"].includes(material)?"PS":
    ["5mm強化清玻貼清膜","5mm強化清玻貼砂膜"].includes(material)?"GLASS":"SILVERFROST";
  const table=matKey==="PS"?FP_PS:matKey==="GLASS"?FP_GLASS:FP_SILVERFROST;
  return lookupFP(table,color,wCm,hCm);
}

const lbl = { display:"block", fontSize:12, fontWeight:600, color:"#374151", marginBottom:5 };
const inp = { width:"100%", padding:"8px 12px", borderRadius:8, border:"1.5px solid #E5E7EB", fontSize:13, outline:"none", fontFamily:ff, boxSizing:"border-box", color:"#111" };
const sel = { ...inp, cursor:"pointer", background:"#fff" };
const iBtn = { width:32, height:32, borderRadius:8, border:"1px solid #E5E7EB", background:"#fff", cursor:"pointer", fontSize:16, display:"flex", alignItems:"center", justifyContent:"center" };

const MASTERS = {
  qingyang: { id:"qingyang", name:"余青陽", region:"北部", payType:"月結", color:"#3B82F6", light:"#DBEAFE", dark:"#1D4ED8", avatar:"余", payMode:"monthly",
    areas:{ 宜蘭:{delivery:500,install:2500,reinstall:4500}, 基隆:{delivery:350,install:2200,reinstall:4000}, 台北:{delivery:350,install:2000,reinstall:4000}, 新北:{delivery:350,install:2000,reinstall:4000}, 桃園:{delivery:350,install:2200,reinstall:4200} } },
  laiyanming: { id:"laiyanming", name:"賴彥銘", region:"中部", payType:"現領", color:"#059669", light:"#D1FAE5", dark:"#065F46", avatar:"賴", payMode:"perJob",
    areas:{ 新竹:{delivery:null,install:3200,reinstall:5200,noService:["竹北","湖口","新豐","尖石","五峰"]}, 苗栗:{delivery:null,install:2700,reinstall:4700,noService:["泰安","大湖","南庄","獅潭","卓蘭"]}, 台中:{delivery:500,install:2200,reinstall:4200,noService:["東勢","新社","石岡","大安","和平"]}, 南投:{delivery:800,install:2200,reinstall:4200,noService:["信義","仁愛","魚池","鹿谷"]}, 彰化:{delivery:500,install:2200,reinstall:4200,noService:["芬園","二水山區"]}, 雲林:{delivery:null,install:2700,reinstall:4700,noService:["古坑","林內","草嶺"]}, 嘉義:{delivery:null,install:3200,reinstall:5200,noService:["阿里山那邊"]} } },
  guo: { id:"guo", name:"郭師傅", region:"南部", payType:"現領", color:"#D97706", light:"#FEF3C7", dark:"#92400E", avatar:"郭", payMode:"transfer",
    areas:{ 台南:{delivery:600,install:2500,reinstall:4500}, 高雄:{delivery:400,install:2000,reinstall:4000}, 屏東:{delivery:400,install:2000,reinstall:4000} } },
};
const JOB_TYPES = ["安裝","拆裝","純配送"];
const STATUS_CFG = { 待確認:{color:"#6B7280",dot:"#9CA3AF"}, 已確認:{color:"#2563EB",dot:"#3B82F6"}, 進行中:{color:"#D97706",dot:"#F59E0B"}, 完成:{color:"#059669",dot:"#10B981"}, 取消:{color:"#DC2626",dot:"#EF4444"} };

function calcWage(master, area, jobType, floor=1, hasThreshold=false, isLType=false, hasFixedPlate=false, hasThresholdReplace=false, extras=[], extraCustom=0, hasElevator=false) {
  const a = master.areas[area]; if(!a) return null;
  let base = jobType==="安裝"?a.install:jobType==="拆裝"?a.reinstall:(a.delivery??0);
  let list=[];
  if(!hasElevator&&floor>=4) list.push({label:`${floor}F樓層費`,amt:(floor-3)*300});
  if(hasThreshold&&jobType!=="純配送") list.push({label:"裝新門檻",amt:200});
  if(hasThresholdReplace&&jobType!=="純配送") list.push({label:"拆舊裝新門檻",amt:500});
  if(master.id==="qingyang"){ if(isLType)list.push({label:"L型對開",amt:200}); if(hasFixedPlate)list.push({label:"固定片",amt:200}); }
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
      <div onClick={e=>e.stopPropagation()} style={{background:"#fff",borderRadius:18,width,maxWidth:"95vw",maxHeight:"88vh",display:"flex",flexDirection:"column",overflow:"hidden",boxShadow:"0 24px 60px rgba(0,0,0,0.22)",fontFamily:ff}}>
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
  "一字二門":{stdW:1500,stdH:1900,prices:{"5mmPS板":{"白/牙色":7100,"銀色":9100,"黑色":9600},"5mm強化清玻貼清膜":{"白/牙色":11800,"銀色":13800,"黑色":14300},"5mm強化清玻貼砂膜":{"白/牙色":11800,"銀色":13800,"黑色":14300}},surW:{"5mmPS板":200,"5mm強化清玻貼清膜":400,"5mm強化清玻貼砂膜":400},surH:{"5mmPS板":200,"5mm強化清玻貼清膜":400,"5mm強化清玻貼砂膜":400}},
  "一字三門":{stdW:1500,stdH:1900,prices:{"5mmPS板":{"白/牙色":7100,"銀色":9100,"黑色":9600},"5mm強化清玻貼清膜":{"白/牙色":11800,"銀色":13800,"黑色":14300},"5mm強化清玻貼砂膜":{"白/牙色":11800,"銀色":13800,"黑色":14300}},surW:{"5mmPS板":200,"5mm強化清玻貼清膜":400,"5mm強化清玻貼砂膜":400},surH:{"5mmPS板":200,"5mm強化清玻貼清膜":400,"5mm強化清玻貼砂膜":400}},
  "一字四門":{stdW:2100,stdH:1900,prices:{"5mmPS板":{"白/牙色":10600,"銀色":12600,"黑色":13100},"5mm強化清玻貼清膜":{"白/牙色":16400,"銀色":18400,"黑色":18900},"5mm強化清玻貼砂膜":{"白/牙色":16400,"銀色":18400,"黑色":18900}},surW:{"5mmPS板":200,"5mm強化清玻貼清膜":400,"5mm強化清玻貼砂膜":400},surH:{"5mmPS板":200,"5mm強化清玻貼清膜":400,"5mm強化清玻貼砂膜":400}},
  "L型對開":{stdW:900,stdH:1900,prices:{"5mmPS板":{"白/牙色":10600,"銀色":12600,"黑色":13100},"5mm強化清玻貼清膜":{"白/牙色":16400,"銀色":18400,"黑色":18900},"5mm強化清玻貼砂膜":{"白/牙色":16400,"銀色":18400,"黑色":18900}},surW:{"5mmPS板":200,"5mm強化清玻貼清膜":400,"5mm強化清玻貼砂膜":400},surH:{"5mmPS板":200,"5mm強化清玻貼清膜":400,"5mm強化清玻貼砂膜":400},isL:true},
  "摺疊二門":{stdW:900,stdH:1900,prices:{"5mmPS板":{"白/牙色":8600,"銀色":10600,"黑色":11100},"5mm強化清玻貼清膜":{"白/牙色":12300,"銀色":14300,"黑色":14800},"5mm強化清玻貼砂膜":{"白/牙色":12300,"銀色":14300,"黑色":14800}},surW:{"5mmPS板":200,"5mm強化清玻貼清膜":400,"5mm強化清玻貼砂膜":400},surH:{"5mmPS板":200,"5mm強化清玻貼清膜":400,"5mm強化清玻貼砂膜":400}},
  "圓弧型":{stdW:900,stdH:1880,prices:{"3mm PS板":{"白色":13800},"5mm強化清玻":{"白色":16800}},surW:{"3mm PS板":200,"5mm強化清玻":400},surH:{},isArc:true},
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
const FRAMED_TYPES=["一字二門","一字三門","一字四門","L型對開","摺疊二門","圓弧型","固定片"];
const FRAMELESS_TYPES=["連動門","橫拉門","開啟門"];
const FRAMED_MATS={圓弧型:["3mm PS板","5mm強化清玻"],固定片:["5mmPS101","5mmPS503","5mmPS501","5mm強化清玻貼清膜","5mm強化清玻貼砂膜","銀霞玻"],default:["5mmPS101","5mmPS503","5mmPS501","5mm強化清玻貼清膜","5mm強化清玻貼砂膜"]};
const FRAMED_COLS={圓弧型:["白色"],default:["白色","牙色","銀色","黑色"]};

function calcFramed({doorType,material,color,wMm,hMm,wMm2,hasThreshold,thresholdMm,towelBar,fourDoorFull,foldLock,arcShorten,floor,hasElevator,installType,fixplateFee,region,master}){
  const cfg=FRAMED_BASE[doorType];if(!cfg)return null;
  const wR=roundTo100(wMm),hR=roundTo100(hMm),wR2=wMm2?roundTo100(wMm2):null;
  const matKey=["5mmPS101","5mmPS503","5mmPS501"].includes(material)?"5mmPS板":material;
  const colKey=["白色","牙色"].includes(color)&&doorType!=="圓弧型"?"白/牙色":color;
  const base=cfg.prices[matKey]?.[colKey]??0;
  const surW=cfg.surW[matKey]??0,surH=cfg.surH[matKey]??0;
  let extraW=0,extraH=0;
  if(cfg.isL){extraW=(Math.ceil(Math.max(0,wR-cfg.stdW)/100)+Math.ceil(Math.max(0,(wR2||0)-cfg.stdW)/100))*surW;}
  else{extraW=Math.ceil(Math.max(0,wR-cfg.stdW)/100)*surW;}
  if(!cfg.isArc){extraH=Math.ceil(Math.max(0,hR-cfg.stdH)/100)*surH;}
  let prod=base+extraW+extraH;
  if(fourDoorFull)prod+=500;if(foldLock)prod+=1000;
  if(arcShorten&&doorType==="圓弧型"&&material==="3mm PS板")prod+=500;
  const thrPrice=hasThreshold&&thresholdMm>0?Math.round(thresholdMm/10)*10:0;
  const towelPrice=(towelBar||0)*200;
  const feeKey=installType==="含拆舊"?"拆裝":"安裝";
  const installFee=INSTALL_MAP[master]?.[region]?.[feeKey]??0;
  const floorFee=!hasElevator&&floor>=4?(floor-3)*300:0;
  const thrInstall=hasThreshold?200:0;
  const fixFee=master==="余青陽"&&doorType==="L型對開"?200:0;
  const fp=fixplateFee||0;
  return{productPrice:prod,thresholdPrice:thrPrice,towelPrice,installFee,floorFee,thresholdInstallFee:thrInstall,fixFee,fixplateFee:fp,total:prod+thrPrice+towelPrice+installFee+floorFee+thrInstall+fixFee+fp,wR,hR,wR2,extraW,extraH};
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

// ─── 報價系統元件 ────────────────────────────────────────────────────────────

function QRow({label,children}){return(<div style={{display:"flex",alignItems:"center",gap:8,flexWrap:"wrap"}}><span style={{minWidth:90,fontSize:12,color:"#555",flexShrink:0}}>{label}</span><div style={{display:"flex",alignItems:"center",gap:8,flexWrap:"wrap"}}>{children}</div></div>);}
function QInput(props){const {style,...rest}=props;return(<input {...rest} style={{border:"1px solid #ddd",borderRadius:6,padding:"5px 10px",fontSize:13,outline:"none",...style}}/>);}

function QToggle({value,onChange,options,wrap}){return(<div style={{display:"flex",flexWrap:wrap?"wrap":"nowrap",gap:5}}>{options.map(o=><button key={o} onClick={()=>onChange(o)} style={{padding:"4px 11px",borderRadius:6,fontSize:12,cursor:"pointer",border:value===o?"2px solid #1a1a1a":"1px solid #ddd",background:value===o?"#1a1a1a":"#fff",color:value===o?"#fff":"#333",fontWeight:value===o?600:400}}>{o}</button>)}</div>);}
function QCheck({checked,onChange,label}){return(<label style={{display:"flex",alignItems:"center",gap:5,cursor:"pointer",fontSize:12}}><input type="checkbox" checked={checked} onChange={e=>onChange(e.target.checked)} style={{width:15,height:15}}/>{label}</label>);}
function QTag({children,color}){return(<span style={{background:color+"22",color,border:`1px solid ${color}`,borderRadius:4,padding:"2px 7px",fontSize:11,fontWeight:600}}>{children}</span>);}
function QSection({title,children,accent}){return(<div style={{background:"#fff",borderRadius:10,overflow:"hidden",boxShadow:"0 1px 4px rgba(0,0,0,0.08)"}}><div style={{background:accent?"#1a1a1a":"#f0efe9",color:accent?"#f5f4f0":"#1a1a1a",padding:"9px 15px",fontWeight:700,fontSize:13,letterSpacing:1}}>{title}</div><div style={{padding:"11px 15px",display:"flex",flexDirection:"column",gap:9}}>{children}</div></div>);}
function QLineItem({label,value}){return(<div style={{display:"flex",justifyContent:"space-between",fontSize:13}}><span style={{color:"#444"}}>{label}</span><span style={{fontWeight:500}}>${fmtMoney(value)}</span></div>);}

// 單筆門型預設值
function defItem(){
  return{id:Date.now()+Math.random(),cat:"有框",dt:"一字二門",mat:"5mmPS101",col:"白色",wMm:1500,hMm:1900,wMm2:900,hasThr:false,thrMm:0,towel:0,fourFull:false,foldLock:false,arcShort:false,film:false,filmType:"清玻",blackF:false,flatT:false,instType:"純安裝",hasFixedPlate:false,adjust:0};
}

function DoorItemForm({item,idx,floor,elev,fpFee,master,region,onUpdate,onRemove,canRemove}){
  const s=(k,v)=>onUpdate({...item,[k]:v});
  const changeDt=t=>{const ms=FRAMED_MATS[t]||FRAMED_MATS.default;onUpdate({...item,dt:t,mat:ms[0],col:t==="圓弧型"?FRAMED_COLS.圓弧型[0]:FRAMED_COLS.default[0]});};
  const changeCat=v=>{onUpdate({...item,cat:v,dt:v==="有框"?"一字二門":"連動門",mat:v==="有框"?"5mmPS101":"",col:v==="有框"?"白色":""});};
  const mats=FRAMED_MATS[item.dt]||FRAMED_MATS.default;
  const cols=item.dt==="圓弧型"?FRAMED_COLS.圓弧型:FRAMED_COLS.default;
  const isFixedPlate=item.dt==="固定片";
  const fpLookupPrice=isFixedPlate?calcFixedPlate({material:item.mat,color:item.col,wMm:item.wMm,hMm:item.hMm}):null;
  const result=useMemo(()=>{
    if(item.cat==="無框"&&master==="郭師傅")return{blocked:true};
    if(isFixedPlate){
      const price=calcFixedPlate({material:item.mat,color:item.col,wMm:item.wMm,hMm:item.hMm});
      if(!price)return{error:"超出固定片尺寸範圍，請洽詢"};
      const installFee=item.hasFPInstall?(item.fpInstallFee||0):0;
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
        <QRow label="類別"><QToggle value={item.cat} onChange={changeCat} options={["有框","無框"]}/></QRow>
        <QRow label="門型">{item.cat==="有框"?<QToggle value={item.dt} onChange={changeDt} options={FRAMED_TYPES} wrap/>:<QToggle value={item.dt} onChange={t=>s("dt",t)} options={FRAMELESS_TYPES} wrap/>}</QRow>
        {item.cat==="有框"&&<>
          <QRow label="材質"><QToggle value={item.mat} onChange={v=>s("mat",v)} options={mats} wrap/></QRow>
          <QRow label="顏色"><QToggle value={item.col} onChange={v=>s("col",v)} options={cols}/></QRow>
        </>}
        <QRow label="尺寸（mm）">
          {item.dt==="L型對開"?<>
            <span style={{fontSize:12}}>W1</span><QInput type="number" value={item.wMm} onChange={e=>s("wMm",Number(e.target.value))} min={100} max={3000} style={{width:90}}/>
            <span style={{fontSize:12}}>W2</span><QInput type="number" value={item.wMm2} onChange={e=>s("wMm2",Number(e.target.value))} min={100} max={3000} style={{width:90}}/>
          </>:<><span style={{fontSize:12}}>W</span><QInput type="number" value={item.wMm} onChange={e=>s("wMm",Number(e.target.value))} min={100} max={3000} style={{width:90}}/></>}
          <span style={{fontSize:12}}>H</span>
          {item.dt==="圓弧型"&&item.mat==="5mm強化清玻"?<span style={{fontSize:11,color:"#888"}}>H1880（固定）</span>:<QInput type="number" value={item.hMm} onChange={e=>s("hMm",Number(e.target.value))} min={100} max={3000} style={{width:90}}/>}
        </QRow>
        {!isFixedPlate&&<QRow label="安裝類型"><QToggle value={item.instType||"純安裝"} onChange={v=>s("instType",v)} options={["純安裝","含拆舊"]}/></QRow>}
        {isFixedPlate&&<QRow label="安裝費（選填）">
          <QCheck checked={!!item.hasFPInstall} onChange={v=>s("hasFPInstall",v)} label="需要"/>
          {item.hasFPInstall&&<QInput type="number" value={item.fpInstallFee||""} onChange={e=>s("fpInstallFee",Number(e.target.value)||0)} placeholder="輸入安裝費" style={{width:110}}/>}
        </QRow>}
        {isFixedPlate&&<QRow label="毛巾桿"><QInput type="number" value={item.towel||0} onChange={e=>s("towel",Number(e.target.value))} min={0} max={10} style={{width:60}}/><span style={{fontSize:11,color:"#888"}}>支×$200</span></QRow>}
        <QRow label="微調金額">
          <button onClick={()=>s("adjust",(item.adjust||0)-100)} style={{width:28,height:28,borderRadius:6,border:"1px solid #ddd",background:"#fff",cursor:"pointer",fontSize:16,fontWeight:700}}>−</button>
          <span style={{minWidth:70,textAlign:"center",fontSize:13,fontWeight:600,color:(item.adjust||0)>0?"#059669":(item.adjust||0)<0?"#DC2626":"#888"}}>{(item.adjust||0)>0?`+$${fmtMoney(item.adjust||0)}`:(item.adjust||0)<0?`-$${fmtMoney(Math.abs(item.adjust||0))}`:"$0"}</span>
          <button onClick={()=>s("adjust",(item.adjust||0)+100)} style={{width:28,height:28,borderRadius:6,border:"1px solid #ddd",background:"#fff",cursor:"pointer",fontSize:16,fontWeight:700}}>＋</button>
          {(item.adjust||0)!==0&&<button onClick={()=>s("adjust",0)} style={{fontSize:10,color:"#9CA3AF",background:"none",border:"none",cursor:"pointer"}}>重置</button>}
        </QRow>
        {!isFixedPlate&&item.cat==="有框"&&<>
          <QRow label="鋁門檻">
            <QCheck checked={item.hasThr} onChange={v=>s("hasThr",v)} label="需要"/>
            {item.hasThr&&<><QInput type="number" value={item.thrMm} onChange={e=>s("thrMm",Number(e.target.value))} min={0} max={5000} style={{width:80}}/><span style={{fontSize:11,color:"#888"}}>mm</span></>}
          </QRow>
          <QRow label="毛巾桿"><QInput type="number" value={item.towel} onChange={e=>s("towel",Number(e.target.value))} min={0} max={10} style={{width:60}}/><span style={{fontSize:11,color:"#888"}}>支×$200</span></QRow>
          {item.dt==="一字四門"&&<QRow label="四門全活動"><QCheck checked={item.fourFull} onChange={v=>s("fourFull",v)} label="+$500"/></QRow>}
          {item.dt==="摺疊二門"&&<QRow label="摺疊加鎖"><QCheck checked={item.foldLock} onChange={v=>s("foldLock",v)} label="+$1,000"/></QRow>}
          {item.dt==="圓弧型"&&item.mat==="3mm PS板"&&<QRow label="PS板改矮"><QCheck checked={item.arcShort} onChange={v=>s("arcShort",v)} label="+$500"/></QRow>}
        </>}
        {!isFixedPlate&&item.cat==="無框"&&<>
          <QRow label="防爆膜"><QCheck checked={item.film} onChange={v=>s("film",v)} label="需要"/>{item.film&&<QToggle value={item.filmType} onChange={v=>s("filmType",v)} options={["清玻","噴砂"]}/>}</QRow>
          <QRow label="黑色五金"><QCheck checked={item.blackF} onChange={v=>s("blackF",v)} label="+$2,000"/></QRow>
          {item.dt==="開啟門"&&<QRow label="扁管"><QCheck checked={item.flatT} onChange={v=>s("flatT",v)} label="+$1,000"/></QRow>}
        </>}
        {result&&!result.error&&!result.blocked&&(
          <div style={{background:"#f8f7f3",borderRadius:8,padding:"8px 12px",fontSize:12,display:"flex",justifyContent:"space-between"}}>
            <span style={{color:"#666"}}>產品 ${fmtMoney(result.productPrice)}　安裝 ${fmtMoney(result.installFee||0)}　其他 ${fmtMoney((result.thresholdPrice||0)+(result.towelPrice||0)+(result.floorFee||0)+(result.thresholdInstallFee||0)+(result.fixFee||0)+(result.fixplateFee||0))}</span>
            <span style={{fontWeight:700,color:"#1a1a1a"}}>${fmtMoney(adjustedTotal)}</span>
          </div>
        )}
        {result?.error&&<div style={{color:"#c0392b",fontSize:12,fontWeight:600}}>⚠️ {result.error}</div>}
        {result?.blocked&&<div style={{color:"#c0392b",fontSize:12,fontWeight:600}}>🚫 南部不販售無框產品</div>}
      </div>
    </div>
  );
}

function QuotationSystem({onCreateOrder}){
  const [items,setItems]=useState([defItem()]);
  const [master,setMaster]=useState("余青陽");const [region,setRegion]=useState("台北");
  const [floor,setFloor]=useState(1);const [elev,setElev]=useState(false);
  const [fpFee,setFpFee]=useState(0);
  const [addr,setAddr]=useState("");const [custName,setCustName]=useState("");const [custPhone,setCustPhone]=useState("");
  const [copied,setCopied]=useState(false);const [converted,setConverted]=useState(false);

  const qDate=getTodayStr(),vDate=addDays(qDate,14);
  const changeMaster=m=>{setMaster(m);setRegion(MASTER_AREAS[m][0]);};
  const updateItem=(idx,updated)=>setItems(prev=>prev.map((it,i)=>i===idx?updated:it));
  const removeItem=idx=>setItems(prev=>prev.filter((_,i)=>i!==idx));
  const addItem=()=>setItems(prev=>[...prev,{...defItem(),id:Date.now()}]);

  const results=items.map(item=>{
    if(item.cat==="無框"&&master==="郭師傅")return{blocked:true};
    const fpPrice=item.hasFixedPlate&&item.cat==="有框"&&item.dt!=="圓弧型"?
      (calcFixedPlate({material:item.mat,color:item.col,wMm:item.wMm,hMm:item.hMm})||0):0;
    if(item.cat==="有框")return calcFramed({doorType:item.dt,material:item.mat,color:item.col,wMm:item.wMm,hMm:item.hMm,wMm2:item.wMm2,hasThreshold:item.hasThr,thresholdMm:item.thrMm,towelBar:item.towel,fourDoorFull:item.fourFull,foldLock:item.foldLock,arcShorten:item.arcShort,floor,hasElevator:elev,installType:item.instType||"純安裝",fixplateFee:fpFee+fpPrice,region,master});
    return calcFrameless({doorType:item.dt,wMm:item.wMm,hMm:item.hMm,film:item.film,filmType:item.filmType,blackFrame:item.blackF,flatTube:item.flatT,floor,hasElevator:elev,fixplateFee:fpFee});
  });
  const grandTotal=results.reduce((s,r,i)=>s+(r&&!r.error&&!r.blocked?(r.total+(items[i].adjust||0)):0),0);

  function buildLines(){
    const lines=["享浴淋浴拉門 報價單",""];
    if(addr)lines.push(`施工地址：${addr}`);
    lines.push(`報價日期：${qDate}`);lines.push(`有效期限：${vDate}`);lines.push("");
    items.forEach((item,i)=>{
      const r=results[i];if(!r||r.error||r.blocked)return;
      const itemTotal=r.total+(item.adjust||0);
      lines.push("──────────────────");
      lines.push(`${item.dt}／${item.cat==="有框"?item.mat+"／"+item.col:"8mm強化清玻"}`);
      if(r.wR&&r.hR)lines.push(`尺寸：W${r.wR} × H${r.hR}`);
      lines.push(`費用：$${fmtMoney(itemTotal)}`);
    });
    lines.push("──────────────────");
    lines.push(`合計：$${fmtMoney(grandTotal)}`);
    lines.push("","＊此為估價，若確認施作請聯繫我們開單付款。","付款後即可安排出貨或安裝時間。","官網：xiangyultd.tw","","付款方式：信用卡／Apple Pay／Google Pay／超商代碼／銀行轉帳","","發票開立：會員載具／手機條碼／公司發票");
    return lines;
  }

  function handleCopy(){navigator.clipboard.writeText(buildLines().join("\n")).then(()=>{setCopied(true);setTimeout(()=>setCopied(false),2000);});}

  function handleConvert(){
    if(grandTotal===0)return;
    // 把每個門型轉成 SpecForm 格式
    const specs=items.map(item=>{
      if(!item.cat||item.cat==="無框")return{...ES,doorType:item.dt,material:"8mm強化清玻",sizeType:"實作",width:String(Math.round(roundTo100(item.wMm)/10)),height:String(Math.round(roundTo100(item.hMm)/10))};
      const matMap={"5mmPS101":"5mm PS板","5mmPS503":"5mm PS板","5mmPS501":"5mm PS板","5mm強化清玻貼清膜":"清玻","5mm強化清玻貼砂膜":"清玻","銀霞玻":"水玻／銀霞／噴砂","3mm PS板":"3mm PS板","5mm強化清玻":"清玻"};
      const psMap={"5mmPS101":"101","5mmPS503":"503","5mmPS501":"501"};
      const filmMap={"5mm強化清玻貼清膜":"清膜","5mm強化清玻貼砂膜":"砂膜"};
      const colMap={"白色":"白","牙色":"牙","銀色":"銀","黑色":"黑"};
      return{...ES,doorType:item.dt,color:colMap[item.col]||item.col,material:matMap[item.mat]||item.mat,ps花紋:psMap[item.mat]||"",防爆膜:filmMap[item.mat]||"",sizeType:"實作",width:String(Math.round(roundTo100(item.wMm)/10)),height:String(Math.round(roundTo100(item.hMm)/10))};
    });
    const order={cust:custName||"",phone:custPhone||"",addr:addr||"",elev,note:`報價金額 $${fmtMoney(grandTotal)}`,scheduled:false,specs,fixedPanel:null,shipDate:"",shipMethod:"寄松成",coll:false,collAmt:0,collSt:"待收",master:"余青陽",fromQuote:true};
    onCreateOrder(order);
    setConverted(true);setTimeout(()=>setConverted(false),3000);
  }

  const qff="'Noto Sans TC',sans-serif";
  return(
    <div style={{fontFamily:qff,display:"flex",flexDirection:"column",gap:14,padding:"14px 0"}}>
      <QSection title="客戶資訊">
        <QRow label="客戶姓名"><QInput value={custName} onChange={e=>setCustName(e.target.value)} placeholder="王先生" style={{width:140}}/></QRow>
        <QRow label="聯絡電話"><QInput value={custPhone} onChange={e=>setCustPhone(e.target.value)} placeholder="0912-345-678" inputMode="tel" style={{width:160}}/></QRow>
        <QRow label="施工地址"><QInput value={addr} onChange={e=>setAddr(e.target.value)} placeholder="完整地址" style={{width:"100%",maxWidth:340}}/></QRow>
        <QRow label="樓層">
          <QInput type="number" value={floor} onChange={e=>setFloor(Number(e.target.value))} min={1} max={30} style={{width:70}}/>
          <QToggle value={elev?"有電梯":"無電梯"} onChange={v=>setElev(v==="有電梯")} options={["有電梯","無電梯"]}/>
          {!elev&&floor>=4&&<QTag color="#e67e22">樓層費 +${fmtMoney((floor-3)*300)}</QTag>}
        </QRow>
      </QSection>

      <QSection title="師傅 / 地區">
        <QRow label="師傅"><QToggle value={master} onChange={changeMaster} options={Object.keys(MASTER_AREAS)}/></QRow>
        <QRow label="地區"><QToggle value={region} onChange={setRegion} options={MASTER_AREAS[master]} wrap/></QRow>
      </QSection>

      <div>
        <div style={{fontWeight:700,fontSize:13,marginBottom:8,color:"#374151"}}>門型明細</div>
        {items.map((item,idx)=>(
          <DoorItemForm key={item.id} item={item} idx={idx} floor={floor} elev={elev} fpFee={fpFee} master={master} region={region} onUpdate={updated=>updateItem(idx,updated)} onRemove={()=>removeItem(idx)} canRemove={items.length>1}/>
        ))}
        <button onClick={addItem} style={{width:"100%",padding:"10px",borderRadius:8,border:"2px dashed #ddd",background:"#fff",cursor:"pointer",fontSize:13,fontWeight:700,color:"#888"}}>＋ 新增門型</button>
      </div>

      <QSection title="報價結果" accent>
        {grandTotal>0?(<>
          <div style={{fontSize:12,color:"#888"}}>報價日期：{qDate}　有效期限：{vDate}</div>
          {items.map((item,i)=>{const r=results[i];if(!r||r.error||r.blocked)return null;return(
            <div key={item.id} style={{borderBottom:"1px solid #333",paddingBottom:8,marginBottom:8}}>
              <div style={{fontSize:12,color:"#aaa",marginBottom:4}}>門型 {i+1}：{item.dt}／{item.cat==="有框"?item.mat+"／"+item.col:"8mm強化清玻"}</div>
              <QLineItem label="產品費用" value={r.productPrice}/>
              {r.filmPrice>0&&<QLineItem label="防爆膜" value={r.filmPrice}/>}
              {r.blackFramePrice>0&&<QLineItem label="黑色五金" value={r.blackFramePrice}/>}
              {r.flatTubePrice>0&&<QLineItem label="扁管" value={r.flatTubePrice}/>}
              {r.thresholdPrice>0&&<QLineItem label={`鋁門檻（${item.thrMm}mm）`} value={r.thresholdPrice}/>}
              {r.towelPrice>0&&<QLineItem label={`毛巾桿（${item.towel}支）`} value={r.towelPrice}/>}
              {r.installFee>0&&<QLineItem label={item.instType==="含拆舊"?"拆裝費":"安裝費"} value={r.installFee}/>}
              {r.thresholdInstallFee>0&&<QLineItem label="門檻安裝工資" value={r.thresholdInstallFee}/>}
              {r.fixFee>0&&<QLineItem label="固定片工資" value={r.fixFee}/>}
              {r.fixplateFee>0&&<QLineItem label="固定片費" value={r.fixplateFee}/>}
              {r.floorFee>0&&<QLineItem label={`樓層費（${floor}樓）`} value={r.floorFee}/>}
            </div>
          );})}
          <div style={{paddingTop:8,borderTop:"2px solid #f5f4f0",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            <span style={{fontWeight:700,fontSize:16}}>總計</span>
            <span style={{fontWeight:700,fontSize:22}}>${fmtMoney(grandTotal)}</span>
          </div>
          <div style={{display:"flex",gap:8,marginTop:4}}>
            <button onClick={handleCopy} style={{flex:1,padding:"11px",borderRadius:8,background:copied?"#059669":"#1a1a1a",color:"#fff",border:"none",cursor:"pointer",fontSize:13,fontWeight:700,fontFamily:qff}}>{copied?"✅ 已複製！":"📋 複製報價單"}</button>
            <button onClick={handleConvert} style={{flex:1,padding:"11px",borderRadius:8,background:converted?"#059669":"#3B82F6",color:"#fff",border:"none",cursor:"pointer",fontSize:13,fontWeight:700,fontFamily:qff}}>{converted?"✅ 已加入！":"📋 轉為待安裝訂單"}</button>
          </div>
        </>):<div style={{color:"#888",fontSize:13,padding:"8px 0"}}>請先填寫上方門型資訊</div>}
      </QSection>
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
                      {o.collectOnSite&&<span style={{fontSize:9,flexShrink:0}}>{o.collectStatus==="已收"?"✅":"💰"}</span>}
                      {o.hasShipping&&<span style={{fontSize:9,flexShrink:0}}>{o.shipStatus==="已到站"?"📦":"🚚"}</span>}
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

function QuickCopyBar({orders}){
  const [copiedKey,setCopiedKey]=useState(null);
  const [selDate,setSelDate]=useState(todayStr);
  const dayOrders=orders.filter(o=>o.date===selDate&&o.status!=="取消");
  const masterIds=[...new Set(dayOrders.map(o=>o.masterId))];
  function buildText(masterId){
    const list=dayOrders.filter(o=>o.masterId===masterId).sort((a,b)=>(a.appointTime||"99:99").localeCompare(b.appointTime||"99:99"));
    if(!list.length)return null;
    const master=MASTERS[masterId],dt=new Date(selDate+"T00:00:00"),WEEK=["日","一","二","三","四","五","六"];
    const dateLabel=`${dt.getFullYear()}年${dt.getMonth()+1}月${dt.getDate()}日（${WEEK[dt.getDay()]}）`;
    const lines=[`📅 ${dateLabel} 安裝行程`,`👷 ${master.name}師傅`,"─────────────"];
    list.forEach((o,i)=>{
      const ts=o.appointTime?`🕐 ${o.appointTime}`:o.timeSlot==="上午"?"🌅 上午":o.timeSlot==="下午"?"🌇 下午":"📆 全天";
      lines.push(`${i+1}. ${ts}`);
      {const phonePart=o.phone?"  📞 "+o.phone:"";lines.push("   客戶："+o.customer+phonePart);};
      if(o.address)lines.push(`   地址：${o.address}${o.hasElevator===true?"（有電梯）":o.hasElevator===false?"（無電梯）":""}`);
      if(o.mapUrl)lines.push(`   🗺 導航：${o.mapUrl}`);
      if(o.product)lines.push(`   品項：${o.product}`);
      {const floorPart=o.floor>=4?"（"+o.floor+"樓）":"";lines.push("   類型："+o.jobType+floorPart);};
      if(o.collectOnSite){const amtPart=o.collectedAmount?"（$"+Number(o.collectedAmount).toLocaleString()+"）":"";lines.push("   💰 請代收尾款"+amtPart);}
      if(o.note)lines.push(`   備註：${o.note}`);
      if(i<list.length-1)lines.push("");
    });
    lines.push("─────────────");lines.push(`共 ${list.length} 件，辛苦了！`);
    return lines.join("\n");
  }
  function handleCopy(mid){const text=buildText(mid);if(!text)return;navigator.clipboard.writeText(text).then(()=>{setCopiedKey(mid);setTimeout(()=>setCopiedKey(null),2000);});}
  return(
    <div style={{background:"#fff",borderRadius:12,padding:"12px 16px",marginBottom:12,border:"1.5px solid #E2E8F0",display:"flex",alignItems:"center",gap:10,flexWrap:"wrap",boxShadow:"0 2px 8px rgba(0,0,0,0.04)"}}>
      <span style={{fontSize:13,fontWeight:700,color:"#374151",whiteSpace:"nowrap"}}>📋 傳給師傅</span>
      <input type="date" value={selDate} onChange={e=>setSelDate(e.target.value)} style={{padding:"5px 10px",borderRadius:8,border:"1.5px solid #E5E7EB",fontSize:13,fontFamily:ff,color:"#111",outline:"none",cursor:"pointer"}}/>
      {masterIds.length>0?(
        <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
          {masterIds.map(mid=>{const m=MASTERS[mid],count=dayOrders.filter(o=>o.masterId===mid).length,done=copiedKey===mid;return(
            <button key={mid} onClick={()=>handleCopy(mid)} style={{padding:"6px 16px",borderRadius:20,border:"1.5px solid "+m.color,background:done?m.color:m.light,color:done?"#fff":m.dark,fontWeight:700,fontSize:12,cursor:"pointer",fontFamily:ff,display:"flex",alignItems:"center",gap:5,transition:"all 0.15s"}}>
              {done?"✅ 已複製！":<><span style={{width:7,height:7,borderRadius:"50%",background:m.color,display:"inline-block"}}/>{m.name} · {count} 件 · 複製</>}
            </button>
          );})}
        </div>
      ):<span style={{fontSize:12,color:"#9CA3AF"}}>這天沒有排程</span>}
    </div>
  );
}

function WageSummary({orders,year,month,onTransferLog,onMonthlySettle}){
  const data=useMemo(()=>Object.values(MASTERS).map(master=>{
    const mo=orders.filter(o=>{if(o.masterId!==master.id||o.status==="取消"||!o.date)return false;const d=new Date(o.date+"T00:00:00");return d.getFullYear()===year&&d.getMonth()===month;});
    const total=mo.reduce((s,o)=>{const w=calcWage(master,o.area||Object.keys(master.areas)[0],o.jobType,o.floor,o.hasThreshold,o.isLType,o.hasFixedPlate,o.hasThresholdReplace,o.extras,o.extraCustom,o.hasElevator);return s+(w?.total||0);},0);
    let paid=0;
    if(master.payMode==="transfer")paid=mo.filter(o=>o.transferDate).reduce((s,o)=>{const w=calcWage(master,o.area||Object.keys(master.areas)[0],o.jobType,o.floor,o.hasThreshold,o.isLType,o.hasFixedPlate,o.hasThresholdReplace,o.extras,o.extraCustom,o.hasElevator);return s+(w?.total||0);},0);
    if(master.payMode==="perJob")paid=mo.filter(o=>o.wagePayStatus==="已付清").reduce((s,o)=>{const w=calcWage(master,o.area||Object.keys(master.areas)[0],o.jobType,o.floor,o.hasThreshold,o.isLType,o.hasFixedPlate,o.hasThresholdReplace,o.extras,o.extraCustom,o.hasElevator);return s+(w?.total||0);},0);
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
          {count>0&&total>0&&(<>
            <div style={{height:5,borderRadius:3,background:"#F1F5F9",overflow:"hidden"}}><div style={{height:"100%",width:Math.min(100,paid/total*100)+"%",background:paid>=total?"#059669":master.color,borderRadius:3,transition:"width 0.4s"}}/></div>
            <div style={{display:"flex",justifyContent:"space-between",marginTop:4,fontSize:10,color:"#94A3B8"}}><span>已付 {fmt(paid)}</span><span style={{color:total-paid>0?"#DC2626":"#059669"}}>未付 {fmt(total-paid)}</span></div>
          </>)}
          <div style={{marginTop:6,fontSize:10,color:master.color,fontWeight:600}}>{master.payMode==="transfer"?"點擊查看匯款紀錄 →":master.payMode==="monthly"?"點擊查看月結帳單 →":"現場付款・每單紀錄"}</div>
        </div>
      ))}
      <div style={{background:"linear-gradient(135deg,#0F172A,#1E293B,#334155)",borderRadius:14,padding:"13px 15px",color:"#fff",boxShadow:"0 2px 8px rgba(0,0,0,0.12)"}}>
        <div style={{fontSize:11,color:"#94A3B8",marginBottom:6}}>本月總工資</div>
        <div style={{fontSize:22,fontWeight:800,marginBottom:6}}>{fmt(grand)}</div>
        <div style={{height:5,borderRadius:3,background:"rgba(255,255,255,0.1)",overflow:"hidden"}}><div style={{height:"100%",width:grand>0?Math.min(100,grandPaid/grand*100)+"%":"0%",background:"#38BDF8",borderRadius:3,transition:"width 0.4s"}}/></div>
        <div style={{display:"flex",justifyContent:"space-between",marginTop:4,fontSize:10,color:"#64748B"}}><span>已付 {fmt(grandPaid)}</span><span>未付 {fmt(grand-grandPaid)}</span></div>
      </div>
    </div>
  );
}

function DayPanel({date,orders,onClose,onAdd,onEdit,onUpdateOrder}){
  if(!date)return null;
  const dt=new Date(date+"T00:00:00"),WEEK=["日","一","二","三","四","五","六"];
  const label=`${dt.getFullYear()}年${dt.getMonth()+1}月${dt.getDate()}日`,dow=WEEK[dt.getDay()];
  const [copied,setCopied]=useState(false);
  const masterIds=[...new Set(orders.filter(o=>o.status!=="取消").map(o=>o.masterId))];
  function buildText(mid){
    const list=orders.filter(o=>o.masterId===mid&&o.status!=="取消").sort((a,b)=>(a.appointTime||"99:99").localeCompare(b.appointTime||"99:99"));
    if(!list.length)return null;
    const master=MASTERS[mid],WEEK2=["日","一","二","三","四","五","六"],dt2=new Date(date+"T00:00:00");
    const lines=[`📅 ${dt2.getFullYear()}年${dt2.getMonth()+1}月${dt2.getDate()}日（${WEEK2[dt2.getDay()]}）安裝行程`,`👷 ${master.name}師傅`,"─────────────"];
    list.forEach((o,i)=>{
      const ts=o.appointTime?`🕐 ${o.appointTime}`:o.timeSlot==="上午"?"🌅 上午":o.timeSlot==="下午"?"🌇 下午":"📆 全天";
      lines.push(`${i+1}. ${ts}`);
      {const phonePart=o.phone?"  📞 "+o.phone:"";lines.push("   客戶："+o.customer+phonePart);};
      if(o.address)lines.push(`   地址：${o.address}${o.hasElevator===true?"（有電梯）":o.hasElevator===false?"（無電梯）":""}`);
      if(o.mapUrl)lines.push(`   🗺 導航：${o.mapUrl}`);
      if(o.product)lines.push(`   品項：${o.product}`);
      {const floorPart=o.floor>=4?"（"+o.floor+"樓）":"";lines.push("   類型："+o.jobType+floorPart);};
      if(o.collectOnSite){const amtPart=o.collectedAmount?"（$"+Number(o.collectedAmount).toLocaleString()+"）":"";lines.push("   💰 請代收尾款"+amtPart);}
      if(o.note)lines.push(`   備註：${o.note}`);
      if(i<list.length-1)lines.push("");
    });
    lines.push("─────────────");lines.push(`共 ${list.length} 件，辛苦了！`);return lines.join("\n");
  }
  function handleCopy(mid){const text=buildText(mid);if(!text)return;navigator.clipboard.writeText(text).then(()=>{setCopied(mid);setTimeout(()=>setCopied(false),2000);});}
  return(
    <div style={{position:"fixed",inset:0,zIndex:200,display:"flex",alignItems:"flex-end",justifyContent:"center"}} onClick={onClose}>
      <div onClick={e=>e.stopPropagation()} style={{background:"#fff",borderRadius:"20px 20px 0 0",width:"100%",maxWidth:520,maxHeight:"76vh",display:"flex",flexDirection:"column",boxShadow:"0 -10px 40px rgba(0,0,0,0.16)",fontFamily:ff}}>
        <div style={{display:"flex",justifyContent:"center",padding:"10px 0 2px"}}><div style={{width:36,height:4,borderRadius:2,background:"#E5E7EB"}}/></div>
        <div style={{padding:"10px 20px 10px",display:"flex",justifyContent:"space-between",alignItems:"center",borderBottom:"1px solid #F3F4F6"}}>
          <div><span style={{fontWeight:800,fontSize:16}}>{label}</span><span style={{fontWeight:500,fontSize:13,color:"#9CA3AF",marginLeft:6}}>（{dow}）</span></div>
          <div style={{display:"flex",gap:8}}><span style={{fontSize:12,color:"#9CA3AF",alignSelf:"center"}}>{orders.length} 件</span><button onClick={()=>onAdd(date)} style={{padding:"6px 14px",borderRadius:20,border:"none",background:"#1E293B",color:"#fff",fontSize:12,fontWeight:700,cursor:"pointer",fontFamily:ff}}>＋ 新增</button></div>
        </div>
        {orders.filter(o=>o.status!=="取消").length>0&&(
          <div style={{padding:"8px 16px",background:"#F8FAFC",borderBottom:"1px solid #F1F5F9",display:"flex",gap:6,alignItems:"center",flexWrap:"wrap"}}>
            <span style={{fontSize:11,color:"#94A3B8",fontWeight:600}}>📋 複製給師傅：</span>
            {masterIds.map(mid=>{const m=MASTERS[mid],done=copied===mid;return(
              <button key={mid} onClick={()=>handleCopy(mid)} style={{padding:"4px 12px",borderRadius:20,border:"1.5px solid "+m.color,background:done?m.color:m.light,color:done?"#fff":m.dark,fontSize:11,fontWeight:700,cursor:"pointer",fontFamily:ff,transition:"all 0.2s"}}>
                {done?"✅ 已複製！":`${m.avatar} ${m.name}`}
              </button>
            );})}
          </div>
        )}
        <div style={{flex:1,overflowY:"auto",padding:"10px 16px 24px"}}>
          {orders.length===0?(
            <div style={{textAlign:"center",padding:"36px 0",color:"#9CA3AF"}}><div style={{fontSize:32,marginBottom:8}}>📭</div><div style={{fontSize:14}}>這天還沒有排程</div></div>
          ):[...orders].sort((a,b)=>(a.appointTime||"99:99").localeCompare(b.appointTime||"99:99")).map(o=>{
            const master=MASTERS[o.masterId],area=o.area||Object.keys(master.areas)[0],wage=calcWage(master,area,o.jobType,o.floor,o.hasThreshold,o.isLType,o.hasFixedPlate,o.hasThresholdReplace,o.extras,o.extraCustom,o.hasElevator),cancelled=o.status==="取消";
            return(
              <div key={o.id} onClick={()=>onEdit(o)} style={{marginBottom:10,borderRadius:14,overflow:"hidden",border:"1.5px solid "+(cancelled?"#E5E7EB":master.color+"50"),cursor:"pointer",opacity:cancelled?0.55:1}}>
                <div style={{background:cancelled?"#9CA3AF":master.color,padding:"9px 14px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                  <div>
                    <div style={{color:"#fff",fontWeight:800,fontSize:14}}>{o.customer}</div>
                    {o.phone&&<a href={`tel:${o.phone}`} onClick={e=>e.stopPropagation()} style={{color:"rgba(255,255,255,0.85)",fontSize:11,textDecoration:"none"}}>📞 {o.phone}</a>}
                  </div>
                  <div style={{display:"flex",gap:6,alignItems:"center"}}>
                    {o.appointTime&&<span style={{fontSize:12,color:"#fff",fontWeight:800,background:"rgba(255,255,255,0.25)",padding:"1px 8px",borderRadius:10}}>🕐 {o.appointTime}</span>}
                    <span style={{fontSize:11,color:"rgba(255,255,255,0.85)",background:"rgba(255,255,255,0.2)",padding:"1px 7px",borderRadius:10}}>{o.timeSlot}</span>
                    <span style={{fontSize:11,color:"rgba(255,255,255,0.85)"}}>{o.jobType}</span>
                  </div>
                </div>
                <div style={{padding:"10px 14px",background:cancelled?"#F9FAFB":master.light}}>
                  <div style={{display:"flex",gap:5,flexWrap:"wrap",marginBottom:6}}>
                    <Chip color={master.dark}>{master.avatar} {master.name}</Chip>
                    <Chip color={STATUS_CFG[o.status]?.color||"#6B7280"}>{o.status}</Chip>
                    {o.floor>=4&&<Chip color="#D97706">{o.floor}F</Chip>}
                  </div>
                  {o.product&&<div style={{fontSize:12,color:"#374151",marginBottom:4}}>📦 {o.product}</div>}
                  {o.address&&(
                    <div style={{fontSize:11,color:"#6B7280",marginBottom:4,display:"flex",alignItems:"center",gap:5}}>
                      {o.mapUrl?<a href={o.mapUrl} target="_blank" rel="noopener noreferrer" style={{color:"#3B82F6",textDecoration:"none"}}>📍 {o.address}</a>:<span>📍 {o.address}</span>}
                      {o.hasElevator===true&&<span style={{fontSize:10,fontWeight:700,color:"#3B82F6",background:"#EFF6FF",padding:"1px 6px",borderRadius:10}}>🛗 有電梯</span>}
                      {o.hasElevator===false&&<span style={{fontSize:10,fontWeight:700,color:"#DC2626",background:"#FEF2F2",padding:"1px 6px",borderRadius:10}}>🚶 無電梯</span>}
                    </div>
                  )}
                  {o.collectOnSite&&(
                    <div style={{marginBottom:6,display:"inline-flex",alignItems:"center",gap:5,padding:"2px 8px",borderRadius:20,fontSize:11,fontWeight:700,background:o.collectStatus==="已收"?"#D1FAE5":o.collectStatus==="未收到"?"#FEE2E2":"#FEF3C7",color:o.collectStatus==="已收"?"#065F46":o.collectStatus==="未收到"?"#991B1B":"#92400E"}}>
                      {o.collectStatus==="已收"?"✅ 已代收":o.collectStatus==="未收到"?"❌ 未收到款":"💰 待代收尾款"}
                      {o.collectStatus==="已收"&&Number(o.collectedAmount)>0&&<span style={{fontWeight:800}}> {fmt(Number(o.collectedAmount))}</span>}
                    </div>
                  )}
                  {o.hasShipping&&(
                    <div style={{marginBottom:6,display:"inline-flex",alignItems:"center",gap:5,padding:"2px 8px",borderRadius:20,fontSize:11,fontWeight:700,background:o.shipStatus==="已到站"?"#DBEAFE":o.shipStatus==="已寄出"?"#D1FAE5":"#F3F4F6",color:o.shipStatus==="已到站"?"#1D4ED8":o.shipStatus==="已寄出"?"#059669":"#6B7280"}}>
                      {o.shipStatus==="已到站"?"✅ 已到站":o.shipStatus==="已寄出"?"🚚 運送中":"⏳ 待寄出"}
                      {o.carrier&&<span style={{fontWeight:400}}>・{o.carrier}</span>}
                      {o.trackingNo&&<span style={{fontWeight:400}}>・{o.trackingNo}</span>}
                    </div>
                  )}
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

function TransferLog({orders,year,month,onClose,onUpdate}){
  const master=MASTERS.guo;
  const mo=orders.filter(o=>{if(o.masterId!=="guo"||o.status==="取消"||!o.date)return false;const d=new Date(o.date+"T00:00:00");return d.getFullYear()===year&&d.getMonth()===month;});
  const getW=o=>calcWage(master,o.area||"高雄",o.jobType,o.floor,o.hasThreshold,o.isLType,o.hasFixedPlate,o.hasThresholdReplace,o.extras,o.extraCustom,o.hasElevator);
  const totalWage=mo.reduce((s,o)=>s+(getW(o)?.total||0),0),paidTotal=mo.filter(o=>o.transferDate).reduce((s,o)=>s+(getW(o)?.total||0),0);
  return(
    <Modal onClose={onClose}>
      <div style={{padding:"18px 22px 14px",borderBottom:"1px solid #F3F4F6"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:14}}>
          <div><div style={{fontWeight:800,fontSize:17}}>💸 郭師傅匯款紀錄</div><div style={{fontSize:12,color:"#6B7280"}}>{year}年{month+1}月・南部</div></div>
          <button onClick={onClose} style={{border:"none",background:"none",fontSize:22,cursor:"pointer",color:"#9CA3AF"}}>✕</button>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8}}>
          {[{l:"應付總計",v:fmt(totalWage),c:"#D97706",bg:"#FEF3C7"},{l:"已匯總計",v:fmt(paidTotal),c:"#059669",bg:"#D1FAE5"},{l:"待匯餘額",v:fmt(totalWage-paidTotal),c:totalWage-paidTotal>0?"#DC2626":"#059669",bg:totalWage-paidTotal>0?"#FEE2E2":"#D1FAE5"}].map(c=>(
            <div key={c.l} style={{padding:"10px 12px",borderRadius:10,background:c.bg}}><div style={{fontSize:10,color:"#6B7280",marginBottom:2}}>{c.l}</div><div style={{fontWeight:800,fontSize:17,color:c.c}}>{c.v}</div></div>
          ))}
        </div>
      </div>
      <div style={{flex:1,overflowY:"auto",padding:"10px 22px 20px"}}>
        {mo.length===0?<div style={{textAlign:"center",padding:40,color:"#9CA3AF"}}>本月無南部訂單</div>:mo.map(o=>{
          const w=getW(o);return(
            <div key={o.id} style={{padding:"12px 0",borderBottom:"1px solid #F3F4F6"}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
                <div><div style={{fontWeight:700,fontSize:14}}>{o.customer}</div><div style={{fontSize:11,color:"#6B7280"}}>{o.date} · {o.area} · {o.jobType}</div>{o.product&&<div style={{fontSize:11,color:"#94A3B8"}}>{o.product}</div>}</div>
                <div style={{fontWeight:800,fontSize:16,color:"#1E293B"}}>{fmt(w?.total)}</div>
              </div>
              <div style={{marginTop:8}}>
                {o.transferDate?(
                  <div style={{display:"flex",alignItems:"center",gap:8}}>
                    <span style={{fontSize:12,fontWeight:700,color:"#059669",background:"#D1FAE5",padding:"3px 10px",borderRadius:20}}>✅ {o.transferDate}</span>
                    <button onClick={()=>onUpdate(o.id,{transferDate:null})} style={{fontSize:11,color:"#9CA3AF",background:"none",border:"none",cursor:"pointer"}}>撤銷</button>
                  </div>
                ):(
                  <button onClick={()=>{const date=prompt("匯款日期（YYYY/MM/DD）",new Date().toLocaleDateString("zh-TW"));if(date)onUpdate(o.id,{transferDate:date});}} style={{padding:"5px 14px",borderRadius:20,border:"1.5px solid #D97706",background:"#FEF3C7",color:"#92400E",fontSize:12,fontWeight:700,cursor:"pointer",fontFamily:ff}}>＋ 記錄匯款</button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </Modal>
  );
}

function MonthlySettle({orders,year,month,onClose,onUpdate}){
  const master=MASTERS.qingyang;
  const [showTable,setShowTable]=useState(false);
  const [copiedTable,setCopiedTable]=useState(false);
  const mo=orders.filter(o=>{if(o.masterId!=="qingyang"||o.status==="取消"||!o.date)return false;const d=new Date(o.date+"T00:00:00");return d.getFullYear()===year&&d.getMonth()===month;}).sort((a,b)=>a.date.localeCompare(b.date));
  const getW=o=>calcWage(master,o.area||"台北",o.jobType,o.floor,o.hasThreshold,o.isLType,o.hasFixedPlate,o.hasThresholdReplace,o.extras,o.extraCustom,o.hasElevator);
  const totalWage=mo.reduce((s,o)=>s+(getW(o)?.total||0),0);
  const totalCollected=mo.reduce((s,o)=>s+(Number(o.collectedAmount)||0),0);
  const netPayable=totalWage-totalCollected;
  const allSettled=mo.length>0&&mo.every(o=>o.monthlySettled);

  function buildTableText(){
    const lines=[`享浴淋浴拉門 × 余青陽`,`${year}年${month+1}月 工資對帳表`,"═".repeat(36),"日期  客戶  地區/類型  工資  代收  淨付","─".repeat(36)];
    mo.forEach(o=>{const w=getW(o),wage=w?.total||0,col=Number(o.collectedAmount)||0;lines.push(`${o.date.slice(5)}  ${o.customer}  ${o.area}${o.jobType}  $${wage.toLocaleString()}  ${col>0?"$"+col.toLocaleString():"-"}  $${(wage-col).toLocaleString()}`);});
    lines.push("─".repeat(36));lines.push(`合計  工資 $${totalWage.toLocaleString()}  代收 $${totalCollected.toLocaleString()}`);lines.push("─".repeat(36));
    lines.push(netPayable>0?`➡ 公司匯給師傅：$${netPayable.toLocaleString()}`:netPayable<0?`➡ 師傅退回公司：$${Math.abs(netPayable).toLocaleString()}`:`➡ 剛好互抵，無需匯款`);
    return lines.join("\n");
  }
  function handleDownloadPdf(){
    const rows=mo.map(o=>{const w=getW(o),wage=w?.total||0,col=Number(o.collectedAmount)||0;return{date:o.date.slice(5),customer:o.customer,product:o.product||"—",area:o.area,jobType:o.jobType,wage,col,net:wage-col};});
    const html=`<!DOCTYPE html><html><head><meta charset="utf-8"><title>余青陽對帳表 ${year}年${month+1}月</title><style>*{box-sizing:border-box;margin:0;padding:0;}body{font-family:"PingFang TC","Noto Sans TC",sans-serif;padding:24px;color:#1E293B;font-size:13px;}h1{font-size:20px;font-weight:800;margin-bottom:2px;}.sub{color:#6B7280;font-size:12px;margin-bottom:16px;}table{width:100%;border-collapse:collapse;margin-bottom:16px;}thead tr{background:#1E293B;color:#fff;}thead th{padding:8px 10px;text-align:left;font-size:12px;}tbody tr:nth-child(even){background:#F8FAFC;}tbody td{padding:7px 10px;border-bottom:1px solid #F1F5F9;font-size:12px;}tfoot tr{background:#F1F5F9;font-weight:700;}tfoot td{padding:8px 10px;font-size:13px;}.result{border:2px solid #BFDBFE;border-radius:10px;padding:14px 18px;margin-bottom:24px;background:#EFF6FF;}.result .formula{color:#6B7280;font-size:11px;margin-bottom:4px;}.result .amount{font-size:20px;font-weight:800;color:${netPayable>0?"#1D4ED8":netPayable<0?"#D97706":"#059669"};}.sign{display:grid;grid-template-columns:1fr 1fr;gap:24px;margin-top:32px;}.sign-box{border:1px solid #CBD5E1;border-radius:8px;padding:12px 14px;min-height:70px;}.sign-label{font-size:11px;color:#94A3B8;margin-bottom:32px;}.sign-line{border-top:1px dashed #CBD5E1;}@media print{button{display:none;}}</style></head><body>
    <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:16px"><div><h1>享浴淋浴拉門 × 余青陽</h1><div class="sub">${year}年${month+1}月 工資對帳表・北部・共 ${mo.length} 筆</div></div><div style="text-align:right;font-size:12px;color:#6B7280">製表日期：${new Date().toLocaleDateString("zh-TW")}</div></div>
    <table><thead><tr><th>日期</th><th>客戶</th><th>品項</th><th>地區</th><th>類型</th><th style="text-align:right">工資</th><th style="text-align:right">代收尾款</th><th style="text-align:right">淨付</th></tr></thead><tbody>${rows.map(r=>`<tr><td>${r.date}</td><td><b>${r.customer}</b></td><td style="color:#94A3B8;font-size:11px">${r.product}</td><td>${r.area}<br/><span style="font-size:10px;color:#9CA3AF">${r.jobType}</span></td><td></td><td style="text-align:right;color:#1D4ED8;font-weight:700">$${r.wage.toLocaleString()}</td><td style="text-align:right;color:#D97706">${r.col>0?"$"+r.col.toLocaleString():"—"}</td><td style="text-align:right;font-weight:700">$${r.net.toLocaleString()}</td></tr>`).join("")}</tbody><tfoot><tr><td colspan="5">合計（${mo.length} 筆）</td><td style="text-align:right;color:#1D4ED8">$${totalWage.toLocaleString()}</td><td style="text-align:right;color:#D97706">${totalCollected>0?"$"+totalCollected.toLocaleString():"—"}</td><td style="text-align:right">$${Math.abs(netPayable).toLocaleString()}</td></tr></tfoot></table>
    <div class="result"><div class="formula">工資 $${totalWage.toLocaleString()} － 代收尾款 $${totalCollected.toLocaleString()} ＝</div><div class="amount">${netPayable>0?`公司匯給師傅 $${netPayable.toLocaleString()}`:netPayable<0?`師傅退回公司 $${Math.abs(netPayable).toLocaleString()}`:"✅ 剛好互抵，無需匯款"}</div>${mo[0]?.settleDate?`<div style="margin-top:6px;font-size:12px;color:#059669;font-weight:700">✅ 匯款日期：${mo[0].settleDate}</div>`:""}</div>
    <div class="sign"><div class="sign-box"><div class="sign-label">公司確認簽章</div><div class="sign-line"></div></div><div class="sign-box"><div class="sign-label">余青陽確認簽章</div><div class="sign-line"></div></div></div>
    <div style="margin-top:24px;font-size:10px;color:#9CA3AF;text-align:right">享浴淋浴拉門 xiangyultd.tw</div>
    <script>window.onload=function(){window.print();}</script></body></html>`;
    const win=window.open("","_blank");if(win){win.document.write(html);win.document.close();}else{alert("請允許彈出視窗");}
  }

  if(showTable) return(
    <Modal onClose={onClose} width={620}>
      <div style={{padding:"16px 22px 12px",borderBottom:"1px solid #F3F4F6",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <div><div style={{fontWeight:800,fontSize:16}}>🧾 {year}年{month+1}月 工資對帳表</div><div style={{fontSize:11,color:"#9CA3AF"}}>享浴淋浴拉門 × 余青陽</div></div>
        <div style={{display:"flex",gap:8}}>
          <button onClick={()=>{navigator.clipboard.writeText(buildTableText()).then(()=>{setCopiedTable(true);setTimeout(()=>setCopiedTable(false),2500);});}} style={{padding:"6px 14px",borderRadius:8,border:"1.5px solid #3B82F6",background:copiedTable?"#3B82F6":"#EFF6FF",color:copiedTable?"#fff":"#1D4ED8",fontWeight:700,fontSize:12,cursor:"pointer",fontFamily:ff}}>{copiedTable?"✅ 已複製！":"📋 複製文字"}</button>
          <button onClick={handleDownloadPdf} style={{padding:"6px 14px",borderRadius:8,border:"1.5px solid #059669",background:"#F0FDF4",color:"#065F46",fontWeight:700,fontSize:12,cursor:"pointer",fontFamily:ff}}>🖨 列印/PDF</button>
          <button onClick={()=>setShowTable(false)} style={{border:"none",background:"none",fontSize:22,cursor:"pointer",color:"#9CA3AF"}}>✕</button>
        </div>
      </div>
      <div style={{flex:1,overflowY:"auto",padding:"16px 22px 24px"}}>
        <div style={{display:"flex",justifyContent:"space-between",marginBottom:16,fontSize:13}}>
          <div><div style={{fontWeight:700}}>余青陽 師傅</div><div style={{color:"#6B7280"}}>北部・月結</div></div>
          <div style={{textAlign:"right"}}><div style={{fontWeight:700}}>{year}年{month+1}月 對帳</div><div style={{color:"#6B7280"}}>共 {mo.length} 筆</div></div>
        </div>
        <div style={{borderRadius:10,overflow:"hidden",border:"1.5px solid #E2E8F0"}}>
          <div style={{display:"grid",gridTemplateColumns:"70px 70px 1fr 60px 60px 70px 70px 70px",background:"#1E293B",color:"#fff",padding:"9px 12px",fontSize:11,fontWeight:700,gap:4}}>
            {["日期","客戶","品項","地區","類型","工資","代收","淨付"].map(h=><div key={h}>{h}</div>)}
          </div>
          {mo.map((o,i)=>{const w=getW(o),wage=w?.total||0,col=Number(o.collectedAmount)||0,net=wage-col;return(
            <div key={o.id} style={{display:"grid",gridTemplateColumns:"70px 70px 1fr 60px 60px 70px 70px 70px",padding:"8px 12px",gap:4,fontSize:12,background:i%2===0?"#fff":"#F8FAFC",borderBottom:"1px solid #F1F5F9",alignItems:"center"}}>
              <div style={{color:"#6B7280"}}>{o.date.slice(5)}</div>
              <div style={{fontWeight:600}}>{o.customer}</div>
              <div style={{color:"#94A3B8",fontSize:11,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{o.product||"—"}</div>
              <div>{o.area}</div><div style={{fontSize:10,color:"#94A3B8"}}>{o.jobType}</div>
              <div style={{fontWeight:700,color:"#1D4ED8"}}>${wage.toLocaleString()}</div>
              <div style={{color:col>0?"#D97706":"#CBD5E1",fontWeight:col>0?700:400}}>{col>0?`$${col.toLocaleString()}`:"—"}</div>
              <div style={{fontWeight:800,color:net<0?"#D97706":"#059669"}}>${net.toLocaleString()}</div>
            </div>
          );})}
          <div style={{display:"grid",gridTemplateColumns:"70px 70px 1fr 60px 60px 70px 70px 70px",padding:"10px 12px",gap:4,background:"#F8FAFC",borderTop:"2px solid #E2E8F0",fontSize:12,fontWeight:800}}>
            <div style={{gridColumn:"1/6",color:"#374151"}}>合計（{mo.length} 筆）</div>
            <div style={{color:"#1D4ED8"}}>${totalWage.toLocaleString()}</div>
            <div style={{color:"#D97706"}}>{totalCollected>0?`$${totalCollected.toLocaleString()}`:"—"}</div>
            <div style={{color:netPayable>0?"#059669":"#D97706"}}>${Math.abs(netPayable).toLocaleString()}</div>
          </div>
        </div>
        <div style={{marginTop:14,padding:"14px 18px",borderRadius:12,background:netPayable>0?"#EFF6FF":netPayable<0?"#FEF3C7":"#D1FAE5",border:"2px solid "+(netPayable>0?"#BFDBFE":netPayable<0?"#FDE68A":"#6EE7B7")}}>
          <div style={{fontSize:12,color:"#6B7280",marginBottom:4}}>工資 ${totalWage.toLocaleString()} － 代收 ${totalCollected.toLocaleString()} ＝</div>
          <div style={{fontSize:22,fontWeight:800,color:netPayable>0?"#1D4ED8":netPayable<0?"#D97706":"#059669"}}>{netPayable>0?`公司匯給師傅 $${netPayable.toLocaleString()}`:netPayable<0?`師傅退回公司 $${Math.abs(netPayable).toLocaleString()}`:"✅ 剛好互抵，無需匯款"}</div>
          {mo[0]?.settleDate&&<div style={{marginTop:6,fontSize:12,color:"#059669",fontWeight:700}}>✅ 匯款日期：{mo[0].settleDate}</div>}
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16,marginTop:20}}>
          {["公司確認簽章","余青陽確認簽章"].map(label=>(<div key={label} style={{border:"1.5px solid #E2E8F0",borderRadius:10,padding:"12px 14px",minHeight:60}}><div style={{fontSize:11,color:"#94A3B8",marginBottom:24}}>{label}</div><div style={{borderTop:"1px dashed #CBD5E1"}}/></div>))}
        </div>
      </div>
    </Modal>
  );

  return(
    <Modal onClose={onClose}>
      <div style={{padding:"18px 22px 14px",borderBottom:"1px solid #F3F4F6"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:14}}>
          <div><div style={{fontWeight:800,fontSize:17}}>📅 余青陽月結帳單</div><div style={{fontSize:12,color:"#6B7280"}}>{year}年{month+1}月・北部・月底互抵</div></div>
          <div style={{display:"flex",gap:8}}>
            <button onClick={()=>setShowTable(true)} style={{padding:"6px 12px",borderRadius:8,border:"1.5px solid #3B82F6",background:"#EFF6FF",color:"#1D4ED8",fontWeight:700,fontSize:12,cursor:"pointer",fontFamily:ff}}>🧾 對帳表</button>
            <button onClick={onClose} style={{border:"none",background:"none",fontSize:22,cursor:"pointer",color:"#9CA3AF"}}>✕</button>
          </div>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8,marginBottom:12}}>
          {[{l:"應付工資",v:fmt(totalWage),c:"#1D4ED8",bg:"#EFF6FF",b:"#BFDBFE"},{l:"代收尾款（抵扣）",v:fmt(totalCollected),c:"#D97706",bg:"#FEF3C7",b:"#FDE68A"},{l:netPayable>0?"需匯給師傅":netPayable<0?"師傅需退回":"剛好互抵",v:netPayable!==0?fmt(Math.abs(netPayable)):"✅ $0",c:netPayable>0?"#1D4ED8":netPayable<0?"#D97706":"#059669",bg:netPayable>0?"#EFF6FF":netPayable<0?"#FEF3C7":"#D1FAE5",b:netPayable>0?"#BFDBFE":netPayable<0?"#FDE68A":"#6EE7B7"}].map(x=>(
            <div key={x.l} style={{padding:"10px 12px",borderRadius:10,background:x.bg,border:"1.5px solid "+x.b}}><div style={{fontSize:10,color:"#64748B",marginBottom:2}}>{x.l}</div><div style={{fontWeight:800,fontSize:18,color:x.c}}>{x.v}</div></div>
          ))}
        </div>
        <div style={{fontSize:11,color:"#94A3B8",textAlign:"center",marginBottom:10,padding:"6px 0",background:"#F8FAFC",borderRadius:8}}>應付工資 {fmt(totalWage)} － 代收尾款 {fmt(totalCollected)} ＝ {netPayable>=0?"匯出":"退回"} {fmt(Math.abs(netPayable))}</div>
        {mo.length>0&&(
          <div style={{display:"grid",gridTemplateColumns:allSettled?"1fr auto":"1fr",gap:8,alignItems:"center"}}>
            {allSettled&&(<div><div style={{fontSize:10,color:"#6B7280",marginBottom:4}}>匯款日期</div><input type="date" value={mo[0]?.settleDate||""} onChange={e=>mo.forEach(o=>onUpdate(o.id,{settleDate:e.target.value}))} style={{...inp,borderColor:mo[0]?.settleDate?"#6EE7B7":"#E5E7EB",background:"#fff",fontSize:12}}/></div>)}
            <button onClick={()=>mo.forEach(o=>onUpdate(o.id,{monthlySettled:!allSettled,settleDate:!allSettled?"":o.settleDate}))} style={{padding:"11px 0",borderRadius:10,border:"none",background:allSettled?"#D1FAE5":"#3B82F6",color:allSettled?"#065F46":"#fff",fontWeight:800,fontSize:14,cursor:"pointer",fontFamily:ff,alignSelf:"flex-end"}}>{allSettled?"✅ 已結清（點擊取消）":"標記本月結清"}</button>
          </div>
        )}
      </div>
      <div style={{flex:1,overflowY:"auto",padding:"10px 22px 20px"}}>
        {mo.length===0?<div style={{textAlign:"center",padding:40,color:"#9CA3AF"}}>本月無北部訂單</div>:mo.map(o=>{
          const w=getW(o),collected=Number(o.collectedAmount)||0;return(
            <div key={o.id} style={{padding:"12px 0",borderBottom:"1px solid #F3F4F6"}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
                <div style={{flex:1}}><div style={{fontWeight:700,fontSize:14}}>{o.customer}</div><div style={{fontSize:11,color:"#6B7280"}}>{o.date} · {o.area} · {o.jobType}{o.floor>=4?` · ${o.floor}F`:""}</div>{o.product&&<div style={{fontSize:11,color:"#94A3B8"}}>{o.product}</div>}</div>
                <div style={{textAlign:"right",minWidth:80}}><div style={{fontWeight:800,fontSize:15,color:"#1D4ED8"}}>{fmt(w?.total)}</div><div style={{fontSize:10,color:"#94A3B8"}}>工資</div></div>
              </div>
              <div style={{marginTop:8,display:"flex",alignItems:"center",gap:8}}>
                <div style={{fontSize:12,color:"#D97706",fontWeight:600,whiteSpace:"nowrap"}}>💰 代收尾款</div>
                <div style={{position:"relative",flex:1}}>
                  <span style={{position:"absolute",left:9,top:"50%",transform:"translateY(-50%)",fontSize:12,color:"#94A3B8"}}>$</span>
                  <input type="number" min={0} value={o.collectedAmount||""} placeholder="0" onChange={e=>onUpdate(o.id,{collectedAmount:e.target.value===""?0:Number(e.target.value)})} style={{width:"100%",padding:"5px 8px 5px 20px",borderRadius:7,border:"1.5px solid #FDE68A",fontSize:13,fontFamily:ff,outline:"none",background:collected>0?"#FFFBEB":"#fff",boxSizing:"border-box",color:"#111"}}/>
                </div>
                {collected>0&&<div style={{fontSize:11,color:"#059669",fontWeight:700,whiteSpace:"nowrap"}}>淨付 {fmt((w?.total||0)-collected)}</div>}
              </div>
              {collected>0&&<div style={{marginTop:6,fontSize:11,padding:"4px 10px",borderRadius:6,background:"#F0FDF4",color:"#065F46",display:"inline-flex",gap:6}}><span>{fmt(w?.total)} 工資</span><span style={{color:"#94A3B8"}}>－</span><span style={{color:"#D97706"}}>{fmt(collected)} 代收</span><span style={{color:"#94A3B8"}}>＝</span><span style={{fontWeight:700}}>{fmt((w?.total||0)-collected)}</span></div>}
              {o.monthlySettled&&<div style={{marginTop:4,fontSize:10,color:"#059669",fontWeight:700}}>✅ 已列入結清</div>}
            </div>
          );
        })}
      </div>
    </Modal>
  );
}

function WageCalc({master,onClose}){
  const [area,setArea]=useState(Object.keys(master.areas)[0]);
  const [jt,setJt]=useState("安裝");const [fl,setFl]=useState(1);const [elev,setElev]=useState(false);const [thr,setThr]=useState(false);const [thrR,setThrR]=useState(false);const [lt,setLt]=useState(false);const [fp,setFp]=useState(false);
  const r=calcWage(master,area,jt,fl,thr,lt,fp,thrR,[],0,elev);
  return(
    <Modal onClose={onClose} width={420}>
      <div style={{padding:"16px 20px 12px",borderBottom:"1px solid #F3F4F6",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <div style={{display:"flex",gap:10,alignItems:"center"}}><div style={{width:38,height:38,borderRadius:10,background:master.light,color:master.dark,display:"flex",alignItems:"center",justifyContent:"center",fontWeight:800,fontSize:16}}>{master.avatar}</div><div><div style={{fontWeight:800,fontSize:15}}>{master.name} 工資試算</div><div style={{fontSize:11,color:"#94A3B8"}}>{master.region}・{master.payType}</div></div></div>
        <button onClick={onClose} style={{border:"none",background:"none",fontSize:22,cursor:"pointer",color:"#9CA3AF"}}>✕</button>
      </div>
      <div style={{padding:"14px 20px 20px",display:"grid",gap:12}}>
        <div><label style={lbl}>地區</label><select value={area} onChange={e=>setArea(e.target.value)} style={sel}>{Object.keys(master.areas).map(a=><option key={a}>{a}</option>)}</select></div>
        <div><label style={lbl}>工作類型</label><div style={{display:"flex",gap:8}}>{["安裝","拆裝","純配送"].map(t=><button key={t} onClick={()=>setJt(t)} style={{flex:1,padding:"8px 0",borderRadius:8,border:"2px solid",borderColor:jt===t?master.color:"#E5E7EB",background:jt===t?master.light:"#fff",color:jt===t?master.dark:"#374151",fontWeight:700,fontSize:13,cursor:"pointer",fontFamily:ff}}>{t}</button>)}</div></div>
        <div><label style={lbl}>樓層：{fl}F {fl>=4&&!elev?`（+$${(fl-3)*300}）`:fl>=4&&elev?"（有電梯免收）":""}</label><input type="range" min={1} max={10} value={fl} onChange={e=>setFl(+e.target.value)} style={{width:"100%",accentColor:master.color}}/></div>
        <div><label style={lbl}>電梯</label>
          <div style={{display:"flex",gap:8}}>
            {["無電梯","有電梯"].map(o=><button key={o} onClick={()=>setElev(o==="有電梯")} style={{flex:1,padding:"7px 0",borderRadius:8,border:"2px solid",borderColor:(elev?(o==="有電梯"):(o==="無電梯"))?master.color:"#E5E7EB",background:(elev?(o==="有電梯"):(o==="無電梯"))?master.light:"#fff",color:(elev?(o==="有電梯"):(o==="無電梯"))?master.dark:"#374151",fontWeight:700,fontSize:13,cursor:"pointer",fontFamily:ff}}>{o}</button>)}
          </div>
        </div>
        <div style={{display:"flex",gap:12,flexWrap:"wrap"}}>
          <CB label="裝新門檻 (+$200)" checked={thr} onChange={setThr} color={master.color}/>
          <CB label="拆舊裝新門檻 (+$500)" checked={thrR} onChange={setThrR} color={master.color}/>
          {master.id==="qingyang"&&<><CB label="L型對開 (+$200)" checked={lt} onChange={setLt} color={master.color}/><CB label="固定片 (+$200)" checked={fp} onChange={setFp} color={master.color}/></>}
        </div>
        {master.areas[area]?.noService&&<div style={{padding:"8px 12px",borderRadius:8,background:"#FEF2F2",fontSize:12,color:"#DC2626"}}>🚫 不接單：{master.areas[area].noService.join("、")}</div>}
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
  const [source,setSource]=useState("direct");
  const [search,setSearch]=useState("");
  const [form,setForm]=useState(order||{customer:"",phone:"",address:"",masterId:"qingyang",area:Object.keys(MASTERS.qingyang.areas)[0],jobType:"安裝",floor:1,hasThreshold:false,hasThresholdReplace:false,isLType:false,hasFixedPlate:false,extras:[],extraCustom:0,date:defaultDate||todayStr,timeSlot:"上午",appointTime:"",status:"待確認",product:"",note:"",wagePayStatus:"待付",transferDate:null,monthlySettled:false,collectedAmount:0,collectOnSite:false,collectStatus:"待收",hasShipping:false,shipDate:"",carrier:"",trackingNo:"",shipStatus:"待寄出",hasElevator:null,mapUrl:""});
  const master=MASTERS[form.masterId],areas=Object.keys(master.areas);
  const wage=calcWage(master,form.area||areas[0],form.jobType,form.floor,form.hasThreshold,form.isLType,form.hasFixedPlate,form.hasThresholdReplace,form.extras,form.extraCustom,form.hasElevator);
  const set=(k,v)=>setForm(f=>({...f,[k]:v}));
  const filteredPending=pendingOrders.filter(p=>!search||p.customer?.includes(search)||p.address?.includes(search)||p.product?.includes(search));

  function loadFromPending(p){
    const prodDesc=p.specs&&p.specs.length>0
      ?p.specs.map(s=>`${s.doorType}（${s.color}）${s.material}${s.width?` W${s.width}×H${s.height}`:""}`).join(" / ")
      :(p.product||"");
    // 師傅對應
    const masterMap={"余青陽":"qingyang","賴彥銘":"laiyanming","郭師傅":"guo"};
    const masterId=masterMap[p.master]||"qingyang";
    const master=MASTERS[masterId];
    const areas=Object.keys(master.areas);
    const detectedArea=detectArea(p.address||p.addr||"",masterId)||areas[0];
    setForm(f=>({...f,
      customer:p.customer||p.cust||"",
      phone:p.phone||"",
      address:p.address||p.addr||"",
      product:prodDesc,
      hasElevator:p.hasElevator??p.elev??null,
      mapUrl:p.mapUrl||"",
      collectOnSite:!!(p.collectOnSite||p.coll),
      collectedAmount:p.collectedAmount||p.collAmt||0,
      collectStatus:p.collectStatus||p.collSt||"待收",
      fromPendingId:p.id,
      masterId,
      area:detectedArea,
      floor:(()=>{const m=(p.address||p.addr||"").match(/(\d+)\s*[樓Ff]/);return m?Math.min(50,parseInt(m[1])):f.floor;})(),
    }));
    setSource("direct");
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

      {!isEdit&&(
        <div style={{padding:"10px 20px 0",display:"flex",gap:8}}>
          {[["pending","📋 從訂單帶入"+(pendingOrders.length>0?"（"+pendingOrders.length+"）":"")],["direct","✏️ 直接新增（丈量／維修）"]].map(([v,label])=>(
            <button key={v} onClick={()=>setSource(v)} style={{flex:1,padding:"8px 0",borderRadius:10,border:"2px solid",borderColor:source===v?"#3B82F6":"#E5E7EB",background:source===v?"#EFF6FF":"#fff",color:source===v?"#1D4ED8":"#6B7280",fontWeight:700,fontSize:12,cursor:"pointer",fontFamily:ff}}>{label}</button>
          ))}
        </div>
      )}

      {!isEdit&&source==="pending"&&(
        <div style={{flex:1,overflowY:"auto",padding:"12px 20px 20px"}}>
          <input value={search} onChange={e=>setSearch(e.target.value)} style={{...inp,marginBottom:10}} placeholder="搜尋客戶、地址、品項..."/>
          {filteredPending.length===0?(
            <div style={{textAlign:"center",padding:40,color:"#9CA3AF"}}><div style={{fontSize:28,marginBottom:8}}>📭</div><div>{pendingOrders.length===0?"目前沒有待安裝訂單":"找不到符合的訂單"}</div></div>
          ):filteredPending.map(p=>(
            <div key={p.id} onClick={()=>loadFromPending(p)} style={{padding:"12px 14px",borderRadius:12,marginBottom:8,border:"1.5px solid #E2E8F0",background:"#fff",cursor:"pointer"}}
              onMouseEnter={e=>{e.currentTarget.style.borderColor="#3B82F6";e.currentTarget.style.background="#EFF6FF";}}
              onMouseLeave={e=>{e.currentTarget.style.borderColor="#E2E8F0";e.currentTarget.style.background="#fff";}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
                <div>
                  <div style={{fontWeight:700,fontSize:14}}>{p.customer}{p.phone&&<span style={{fontSize:11,color:"#94A3B8",fontWeight:400,marginLeft:6}}>📞 {p.phone}</span>}</div>
                  {p.address&&<div style={{fontSize:11,color:"#6B7280",marginTop:2}}>📍 {p.address}</div>}
                  {(p.specs&&p.specs.length>0?p.specs.map(s=>s.doorType+"（"+s.color+"）"+s.material+" W"+s.width+"×H"+s.height).join(" / "):p.product)&&<div style={{fontSize:11,color:"#94A3B8",marginTop:2}}>📦 {p.specs&&p.specs.length>0?p.specs.map(s=>s.doorType+"（"+s.color+"）"+s.material+" W"+s.width+"×H"+s.height).join(" / "):p.product}</div>}
                </div>
                <span style={{fontSize:11,color:"#3B82F6",fontWeight:700,whiteSpace:"nowrap",marginLeft:8}}>帶入 →</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {(isEdit||source==="direct")&&(
        <div style={{flex:1,overflowY:"auto",padding:"14px 20px"}}>
          <div style={{display:"grid",gap:12}}>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
              <div><label style={lbl}>客戶姓名</label><input value={form.customer} onChange={e=>set("customer",e.target.value)} style={inp} placeholder="王大明"/></div>
              <div><label style={lbl}>聯絡電話</label><input value={form.phone||""} onChange={e=>set("phone",e.target.value)} style={inp} placeholder="0912-345-678" inputMode="tel"/></div>
            </div>
            <div>
              <label style={lbl}>施工地址</label>
              <div style={{display:"flex",gap:8}}>
                <input value={form.address} onChange={e=>{const addr=e.target.value;set("address",addr);const det=detectArea(addr,form.masterId);if(det)set("area",det);const fm=addr.match(/(\d+)\s*[樓Ff]/);if(fm){const fl=parseInt(fm[1]);if(fl>=1&&fl<=50)set("floor",fl);}if(addr.includes("無電梯"))set("hasElevator",false);else if(addr.includes("有電梯"))set("hasElevator",true);}} style={{...inp,flex:1}} placeholder="台北市信義區松仁路100號3樓"/>
                <button onClick={()=>set("hasElevator",form.hasElevator===true?false:form.hasElevator===false?null:true)} style={{flexShrink:0,padding:"0 14px",borderRadius:8,border:"2px solid",borderColor:form.hasElevator===true?"#3B82F6":form.hasElevator===false?"#EF4444":"#E5E7EB",background:form.hasElevator===true?"#EFF6FF":form.hasElevator===false?"#FEF2F2":"#fff",color:form.hasElevator===true?"#1D4ED8":form.hasElevator===false?"#DC2626":"#9CA3AF",fontWeight:700,fontSize:12,cursor:"pointer",fontFamily:ff,whiteSpace:"nowrap"}}>
                  {form.hasElevator===true?"🛗 有電梯":form.hasElevator===false?"🚶 無電梯":"電梯？"}
                </button>
              </div>
            </div>
            <div>
              <label style={lbl}>Google Maps 連結（選填）</label>
              <div style={{position:"relative"}}>
                <input value={form.mapUrl||""} onChange={e=>set("mapUrl",e.target.value)} onPaste={e=>{const text=e.clipboardData.getData("text");if(text.includes("maps.google")||text.includes("goo.gl/maps")||text.includes("maps.app.goo.gl")||text.includes("google.com/maps")){e.preventDefault();set("mapUrl",text.trim());}}} style={{...inp,paddingRight:36,color:form.mapUrl?"#3B82F6":"#111"}} placeholder="貼上 Google Maps 連結"/>
                {form.mapUrl&&(<div style={{position:"absolute",right:6,top:"50%",transform:"translateY(-50%)",display:"flex",gap:4}}>
                  <a href={form.mapUrl} target="_blank" rel="noopener noreferrer" style={{fontSize:16,textDecoration:"none"}} title="開啟地圖">📍</a>
                  <button onClick={()=>set("mapUrl","")} style={{fontSize:11,color:"#9CA3AF",background:"none",border:"none",cursor:"pointer"}}>✕</button>
                </div>)}
              </div>
              {form.mapUrl&&<div style={{fontSize:10,color:"#059669",marginTop:3}}>✅ 地圖連結已儲存</div>}
            </div>
            <div><label style={lbl}>產品描述</label><input value={form.product} onChange={e=>set("product",e.target.value)} style={inp} placeholder="一字三門 清玻 銀色 W150×H190"/></div>
            <div style={{display:"grid",gridTemplateColumns:"1.2fr 0.9fr 0.9fr 1fr",gap:10}}>
              <div><label style={lbl}>日期</label><input type="date" value={form.date} onChange={e=>set("date",e.target.value)} style={inp}/></div>
              <div><label style={lbl}>時段</label><select value={form.timeSlot} onChange={e=>set("timeSlot",e.target.value)} style={sel}>{["上午","下午","全天"].map(t=><option key={t}>{t}</option>)}</select></div>
              <div><label style={lbl}>預計時間</label><select value={form.appointTime||""} onChange={e=>set("appointTime",e.target.value)} style={{...sel,color:form.appointTime?"#111":"#9CA3AF"}}><option value="">不指定</option>{["07:00","07:30","08:00","08:30","09:00","09:30","10:00","10:30","11:00","11:30","12:00","12:30","13:00","13:30","14:00","14:30","15:00","15:30","16:00","16:30","17:00","17:30","18:00"].map(t=><option key={t}>{t}</option>)}</select></div>
              <div><label style={lbl}>狀態</label><select value={form.status} onChange={e=>set("status",e.target.value)} style={sel}>{Object.keys(STATUS_CFG).map(s=><option key={s}>{s}</option>)}</select></div>
            </div>
            <div>
              <label style={lbl}>指派師傅</label>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8}}>
                {Object.values(MASTERS).map(m=>(<button key={m.id} onClick={()=>{set("masterId",m.id);set("area",Object.keys(m.areas)[0]);}} style={{padding:"10px 8px",borderRadius:12,border:"2px solid",borderColor:form.masterId===m.id?m.color:"#E5E7EB",background:form.masterId===m.id?m.light:"#fff",cursor:"pointer",fontFamily:ff,textAlign:"center",boxShadow:form.masterId===m.id?"0 2px 8px "+m.color+"40":"none"}}><div style={{fontWeight:800,fontSize:18,color:m.dark}}>{m.avatar}</div><div style={{fontSize:12,fontWeight:700,color:m.dark}}>{m.name}</div><div style={{fontSize:10,color:"#94A3B8"}}>{m.region}・{m.payType}</div></button>))}
              </div>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
              <div>
                <label style={lbl}>地區 <span style={{fontSize:10,color:"#94A3B8",fontWeight:400}}>（自動判斷）</span></label>
                <select value={form.area} onChange={e=>set("area",e.target.value)} style={sel}>{areas.map(a=><option key={a}>{a}</option>)}</select>
                {master.areas[form.area]?.noService&&<div style={{fontSize:10,color:"#DC2626",marginTop:4}}>🚫 {master.areas[form.area].noService.join("、")}</div>}
              </div>
              <div><label style={lbl}>工作類型</label><select value={form.jobType} onChange={e=>set("jobType",e.target.value)} style={sel}>{["安裝","拆裝","純配送"].map(t=><option key={t}>{t}</option>)}</select></div>
            </div>
            <div><label style={lbl}>樓層：{form.floor}F {form.floor>=4?`（樓層費 +$${(form.floor-3)*300}）`:""}</label><input type="range" min={1} max={10} value={form.floor} onChange={e=>set("floor",Number(e.target.value))} style={{width:"100%",accentColor:master.color}}/></div>
            <div style={{padding:"12px 14px",borderRadius:10,background:"#F8FAFC",border:"1.5px solid #E5E7EB"}}>
              <div style={{fontSize:12,fontWeight:700,color:"#374151",marginBottom:10}}>額外工資項目</div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
                <div style={{gridColumn:"1/-1",fontSize:11,fontWeight:700,color:"#94A3B8",marginBottom:2}}>門檻</div>
                <CB label="裝新門檻 (+$200)" checked={!!form.hasThreshold} onChange={v=>set("hasThreshold",v)} color={master.color}/>
                <CB label="拆舊裝新門檻 (+$500)" checked={!!form.hasThresholdReplace} onChange={v=>set("hasThresholdReplace",v)} color={master.color}/>
                {form.masterId==="qingyang"&&<><div style={{gridColumn:"1/-1",fontSize:11,fontWeight:700,color:"#94A3B8",marginTop:6,marginBottom:2}}>青陽加項</div><CB label="L型對開 (+$200)" checked={!!form.isLType} onChange={v=>set("isLType",v)} color={master.color}/><CB label="固定片 (+$200)" checked={!!form.hasFixedPlate} onChange={v=>set("hasFixedPlate",v)} color={master.color}/></>}
                <div style={{gridColumn:"1/-1",fontSize:11,fontWeight:700,color:"#94A3B8",marginTop:6,marginBottom:2}}>其他加項</div>
                {[200,300,500].map(amt=>(<CB key={amt} label={`+$${amt}`} checked={!!(form.extras||[]).includes(amt)} onChange={v=>{const cur=form.extras||[];set("extras",v?[...cur,amt]:cur.filter(x=>x!==amt));}} color={master.color}/>))}
                <div style={{display:"flex",alignItems:"center",gap:6}}>
                  <span style={{fontSize:12,color:"#6B7280"}}>自填</span>
                  <div style={{position:"relative",flex:1}}><span style={{position:"absolute",left:8,top:"50%",transform:"translateY(-50%)",fontSize:12,color:"#94A3B8"}}>$</span><input type="number" min={0} placeholder="金額" value={form.extraCustom||""} onChange={e=>set("extraCustom",e.target.value===""?0:Number(e.target.value))} style={{...inp,paddingLeft:20,fontSize:12}}/></div>
                </div>
              </div>
              {(()=>{const t=(form.hasThreshold?200:0)+(form.hasThresholdReplace?500:0)+(form.masterId==="qingyang"?(form.isLType?200:0)+(form.hasFixedPlate?200:0):0)+((form.extras||[]).reduce((s,x)=>s+x,0))+(Number(form.extraCustom)||0);return t>0?(<div style={{marginTop:8,fontSize:12,color:master.dark,fontWeight:700,textAlign:"right"}}>額外加項合計：+${t.toLocaleString()}</div>):null;})()}
            </div>
            <div><label style={lbl}>備註</label><textarea value={form.note} onChange={e=>set("note",e.target.value)} style={{...inp,height:54,resize:"vertical"}}/></div>
            {form.masterId==="qingyang"&&(
              <div style={{padding:"12px 14px",borderRadius:10,background:form.collectOnSite?"#FFFBEB":"#F8FAFC",border:"1.5px solid "+(form.collectOnSite?"#FDE68A":"#E5E7EB"),transition:"all 0.2s"}}>
                <CB label="💰 師傅到場代收尾款" checked={!!form.collectOnSite} onChange={v=>set("collectOnSite",v)} color="#D97706"/>
                {form.collectOnSite&&(
                  <div style={{marginTop:10,display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
                    <div><label style={{...lbl,color:"#D97706"}}>代收金額</label><div style={{position:"relative"}}><span style={{position:"absolute",left:10,top:"50%",transform:"translateY(-50%)",fontSize:13,color:"#94A3B8"}}>$</span><input type="number" min={0} value={form.collectedAmount||""} placeholder="到場後填寫" onChange={e=>set("collectedAmount",e.target.value===""?0:Number(e.target.value))} style={{...inp,paddingLeft:22,background:"#fff"}}/></div></div>
                    <div><label style={{...lbl,color:"#D97706"}}>收款狀態</label><select value={form.collectStatus||"待收"} onChange={e=>set("collectStatus",e.target.value)} style={{...sel,borderColor:form.collectStatus==="已收"?"#6EE7B7":"#FDE68A"}}><option value="待收">⏳ 待收</option><option value="已收">✅ 已收到款</option><option value="未收到">❌ 到場未收到</option></select></div>
                  </div>
                )}
              </div>
            )}
            <div style={{padding:"12px 14px",borderRadius:10,background:form.hasShipping?"#F0FDF4":"#F8FAFC",border:"1.5px solid "+(form.hasShipping?"#6EE7B7":"#E5E7EB"),transition:"all 0.2s"}}>
              <CB label="📦 需要寄送貨品給師傅" checked={!!form.hasShipping} onChange={v=>set("hasShipping",v)} color="#059669"/>
              {form.hasShipping&&(
                <div style={{marginTop:10,display:"grid",gap:10}}>
                  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
                    <div><label style={{...lbl,color:"#059669"}}>寄出日期</label><input type="date" value={form.shipDate||""} onChange={e=>set("shipDate",e.target.value)} style={{...inp,borderColor:form.shipDate?"#6EE7B7":"#E5E7EB"}}/></div>
                    <div><label style={{...lbl,color:"#059669"}}>貨運公司</label><select value={form.carrier||""} onChange={e=>set("carrier",e.target.value)} style={{...sel,borderColor:form.carrier?"#6EE7B7":"#E5E7EB",color:form.carrier?"#111":"#9CA3AF"}}><option value="">選擇貨運</option>{["進南貨運","自送"].map(c=><option key={c}>{c}</option>)}</select></div>
                  </div>
                  <div><label style={{...lbl,color:"#059669"}}>追蹤單號</label><input value={form.trackingNo||""} onChange={e=>set("trackingNo",e.target.value)} style={{...inp,borderColor:form.trackingNo?"#6EE7B7":"#E5E7EB"}} placeholder="輸入貨運追蹤號碼"/></div>
                  <div><label style={{...lbl,color:"#059669"}}>寄送狀態</label>
                    <div style={{display:"flex",gap:6}}>
                      {[["待寄出","⏳","#94A3B8"],["已寄出","🚚","#059669"],["已到站","✅","#1D4ED8"]].map(([s,icon,c])=>(<button key={s} onClick={()=>set("shipStatus",s)} style={{flex:1,padding:"7px 0",borderRadius:8,border:"2px solid",borderColor:(form.shipStatus||"待寄出")===s?c:"#E5E7EB",background:(form.shipStatus||"待寄出")===s?c+"18":"#fff",color:(form.shipStatus||"待寄出")===s?c:"#6B7280",fontWeight:700,fontSize:12,cursor:"pointer",fontFamily:ff}}>{icon} {s}</button>))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
          {wage&&(<div style={{marginTop:12,padding:14,borderRadius:12,background:master.light,border:"1.5px solid "+master.color+"40"}}>
            <div style={{fontSize:11,fontWeight:700,color:master.dark,marginBottom:8}}>師傅工資預覽</div>
            <div style={{display:"flex",justifyContent:"space-between",fontSize:12,marginBottom:3}}><span style={{color:"#6B7280"}}>基本工資</span><span>{fmt(wage.base)}</span></div>
            {wage.extras>0&&<div style={{display:"flex",justifyContent:"space-between",fontSize:12,marginBottom:3}}><span style={{color:"#D97706"}}>額外加項</span><span style={{color:"#D97706"}}>+{fmt(wage.extras)}</span></div>}
            <div style={{height:1,background:master.color+"30",margin:"8px 0"}}/>
            <div style={{display:"flex",justifyContent:"space-between",fontWeight:800,color:master.dark,fontSize:18}}><span>合計</span><span>{fmt(wage.total)}</span></div>
          </div>)}
        </div>
      )}

      {(isEdit||source==="direct")&&(
        <div style={{padding:"12px 20px",borderTop:"1px solid #F3F4F6",display:"flex",gap:10}}>
          <button onClick={onClose} style={{flex:1,padding:11,borderRadius:10,border:"1.5px solid #E5E7EB",background:"#fff",cursor:"pointer",fontFamily:ff,fontWeight:600}}>取消</button>
          <button onClick={()=>onSave({...form,id:order?.id||Date.now()})} style={{flex:2,padding:11,borderRadius:10,border:"none",background:master.color,color:"#fff",fontWeight:800,fontSize:14,cursor:"pointer",fontFamily:ff}}>{isEdit?"儲存修改":"新增排程"}</button>
        </div>
      )}
    </Modal>
  );
}

function PendingOrdersTab({pendingOrders,onEdit,onDelete,onToggleScheduled,onSlip}){
  const [filter,setFilter]=useState("pending");const [search,setSearch]=useState("");
  const visible=pendingOrders.filter(p=>{if(filter==="pending"&&p.scheduled)return false;if(filter==="scheduled"&&!p.scheduled)return false;if(search&&!p.customer?.includes(search)&&!p.address?.includes(search)&&!p.product?.includes(search))return false;return true;});
  const pCount=pendingOrders.filter(p=>!p.scheduled).length,sCount=pendingOrders.filter(p=>p.scheduled).length;
  return(
    <div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10,marginBottom:14}}>
        {[{label:"待排程",count:pCount,color:"#D97706",bg:"#FEF3C7",f:"pending"},{label:"已排程",count:sCount,color:"#059669",bg:"#D1FAE5",f:"scheduled"},{label:"全部",count:pendingOrders.length,color:"#3B82F6",bg:"#DBEAFE",f:"all"}].map(({label,count,color,bg,f})=>(
          <div key={f} onClick={()=>setFilter(f)} style={{padding:"12px 16px",borderRadius:12,background:filter===f?bg:"#fff",border:"1.5px solid "+(filter===f?color:"#E2E8F0"),cursor:"pointer"}}>
            <div style={{fontSize:11,color:"#6B7280"}}>{label}</div><div style={{fontSize:22,fontWeight:800,color}}>{count}</div>
          </div>
        ))}
      </div>
      <input value={search} onChange={e=>setSearch(e.target.value)} style={{...inp,marginBottom:12}} placeholder="搜尋客戶、地址、品項..."/>
      {visible.length===0?(<div style={{textAlign:"center",padding:60,color:"#9CA3AF"}}><div style={{fontSize:36,marginBottom:10}}>📭</div><div style={{fontSize:14}}>{filter==="pending"?"目前沒有待排程訂單":"沒有符合的訂單"}</div></div>):(
        <div style={{display:"grid",gap:10}}>
          {visible.map(p=>(
            <div key={p.id} style={{background:"#fff",borderRadius:14,overflow:"hidden",border:"1.5px solid "+(p.scheduled?"#D1FAE5":"#E2E8F0"),boxShadow:"0 2px 8px rgba(0,0,0,0.04)"}}>
              <div style={{padding:"12px 16px",display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
                <div style={{flex:1}}>
                  <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:4}}>
                    <span style={{fontWeight:800,fontSize:15}}>{p.customer}</span>
                    {p.phone&&<a href={`tel:${p.phone}`} style={{fontSize:12,color:"#3B82F6",textDecoration:"none"}}>📞 {p.phone}</a>}
                    {p.scheduled?<span style={{fontSize:10,fontWeight:700,color:"#059669",background:"#D1FAE5",padding:"2px 8px",borderRadius:10}}>✅ 已排程</span>:<span style={{fontSize:10,fontWeight:700,color:"#D97706",background:"#FEF3C7",padding:"2px 8px",borderRadius:10}}>⏳ 待排程</span>}
                  </div>
                  {p.address&&<div style={{fontSize:12,color:"#6B7280",marginBottom:2}}>📍 {p.address}{p.hasElevator===true&&<span style={{marginLeft:6,fontSize:10,color:"#3B82F6",fontWeight:700}}>🛗 有電梯</span>}{p.hasElevator===false&&<span style={{marginLeft:6,fontSize:10,color:"#DC2626",fontWeight:700}}>🚶 無電梯</span>}</div>}
                  {(p.specs&&p.specs.length>0?p.specs.map(s=>s.doorType+"（"+s.color+"）"+s.material).join(" / "):p.product)&&<div style={{fontSize:12,color:"#94A3B8"}}>📦 {p.specs&&p.specs.length>0?p.specs.map(s=>s.doorType+"（"+s.color+"）"+s.material+" W"+s.width+"×H"+s.height).join(" / "):p.product}</div>}
                  {p.note&&<div style={{fontSize:11,color:"#94A3B8",marginTop:4}}>💬 {p.note}</div>}
                </div>
                <div style={{display:"flex",gap:6,marginLeft:10}}>
                  <button onClick={()=>onEdit(p)} style={{padding:"5px 10px",borderRadius:8,border:"1px solid #E5E7EB",background:"#fff",fontSize:13,cursor:"pointer"}}>✏️</button>
                  <button onClick={()=>{if(confirm("確定刪除？"))onDelete(p.id);}} style={{padding:"5px 10px",borderRadius:8,border:"1px solid #FECACA",background:"#FEF2F2",fontSize:13,cursor:"pointer"}}>🗑</button>
                </div>
              </div>
              <div style={{padding:"8px 16px 12px",borderTop:"1px solid #F1F5F9",display:"flex",gap:8}}>
                <button onClick={()=>onToggleScheduled(p.id)} style={{padding:"6px 14px",borderRadius:8,border:"1.5px solid "+(p.scheduled?"#6EE7B7":"#E5E7EB"),background:p.scheduled?"#D1FAE5":"#fff",color:p.scheduled?"#065F46":"#6B7280",fontSize:12,fontWeight:600,cursor:"pointer",fontFamily:ff}}>{p.scheduled?"✅ 已排程":"標記已排程"}</button>
                {p.specs&&p.specs.length>0&&<button onClick={()=>onSlip(p)} style={{padding:"6px 14px",borderRadius:8,border:"none",background:"#1E293B",color:"#fff",fontSize:12,fontWeight:700,cursor:"pointer",fontFamily:ff}}>🖨 工單</button>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── 訂單規格表單元件 ─────────────────────────────────────────────────────────
const ES={doorType:"一字三門",color:"白",material:"清玻",防爆膜:"",ps花紋:"",sizeType:"實作",width:"",height:"",扣:"",direction:"",handle:"",threshold:false,thresholdW:""};
const EFP={position:"上固定",color:"白",material:"清玻",防爆膜:"",pieces:[]};
const EPiece={width:"",height:"",qty:"1"};

function OLbl({children}){return(<div style={{fontSize:11,fontWeight:700,color:"#6B7280",marginBottom:4}}>{children}</div>);}

function SpecForm({value,onChange,onRemove,showRemove}){
  const s=value;
  const set=(k,v)=>onChange({...s,[k]:v});
  const isCG=s.material.includes("清玻")||s.material.includes("銀霞");
  const isPS=false; // 花紋已含在材質名稱中
  const B=(a)=>({padding:"6px 12px",borderRadius:8,fontFamily:ff,fontSize:12,fontWeight:600,cursor:"pointer",border:`1.5px solid ${a?"#1A1D23":"#E2E5EC"}`,background:a?"#1A1D23":"#fff",color:a?"#fff":"#374151"});
  return(
    <div style={{border:"1.5px solid #E2E5EC",borderRadius:10,padding:14,display:"flex",flexDirection:"column",gap:12,position:"relative",background:"#fff"}}>
      {showRemove&&<button onClick={onRemove} style={{position:"absolute",top:10,right:10,background:"none",border:"none",color:"#EF4444",fontSize:16,cursor:"pointer",fontWeight:700}}>✕</button>}
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
        <div><OLbl>門型</OLbl>
          <select style={{...sel,fontSize:12}} value={s.doorType} onChange={e=>set("doorType",e.target.value)}>
            {["一字二門","一字三門","一字四門","L型對開","摺疊二門","圓弧型","連動門","橫拉門","開啟門"].map(o=><option key={o}>{o}</option>)}
          </select>
        </div>
        <div><OLbl>顏色</OLbl>
          <select style={{...sel,fontSize:12}} value={s.color} onChange={e=>set("color",e.target.value)}>
            {["白","牙","銀","黑","霧銀","亮銀"].map(o=><option key={o}>{o}</option>)}
          </select>
        </div>
      </div>
      <div><OLbl>材質</OLbl>
        <select style={{...sel,fontSize:12}} value={s.material} onChange={e=>onChange({...s,material:e.target.value,防爆膜:"",ps花紋:""})}>
          {["5mmPS101","5mmPS503","5mmPS501","5mm強化清玻貼清膜","5mm強化清玻貼砂膜","銀霞玻","3mm PS板","8mm強化清玻"].map(o=><option key={o}>{o}</option>)}
        </select>
      </div>
      <div><OLbl>尺寸類型</OLbl>
        <div style={{display:"flex",gap:6}}>
          {["實作","丈量"].map(opt=><button key={opt} onClick={()=>set("sizeType",opt)} style={{...B(s.sizeType===opt),flex:1}}>{opt}</button>)}
        </div>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
        <div><OLbl>寬度 W（cm）</OLbl><input style={{...inp,fontSize:12}} placeholder="e.g. 142.5" value={s.width} onChange={e=>set("width",e.target.value)}/></div>
        <div><OLbl>高度 H（cm）</OLbl><input style={{...inp,fontSize:12}} placeholder="e.g. 190" value={s.height} onChange={e=>set("height",e.target.value)}/></div>
      </div>
      {s.sizeType==="丈量"&&<div><OLbl>扣（cm）</OLbl>
        <div style={{display:"flex",gap:6}}>
          {["0.5","1","1.5","2"].map(opt=><button key={opt} onClick={()=>set("扣",s.扣===opt?"":opt)} style={{...B(s.扣===opt),flex:1,fontSize:13}}>{opt}</button>)}
        </div>
      </div>}
      <div><OLbl>開門方向（可不選）</OLbl>
        <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:6}}>
          {["右開","左開","右固","左固"].map(opt=><button key={opt} onClick={()=>set("direction",s.direction===opt?"":opt)} style={B(s.direction===opt)}>{opt}</button>)}
        </div>
        <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
          {["加一支把手","加內外把手","加兩支把手"].map(opt=><button key={opt} onClick={()=>set("handle",s.handle===opt?"":opt)} style={B(s.handle===opt)}>{opt}</button>)}
        </div>
      </div>
      <div>
        <label style={{display:"flex",alignItems:"center",gap:7,cursor:"pointer",marginBottom:7,fontSize:12,fontWeight:700}}>
          <input type="checkbox" checked={s.threshold} onChange={e=>set("threshold",e.target.checked)} style={{width:15,height:15}}/>
          鋁門檻實切
        </label>
        {s.threshold&&<input style={{...inp,fontSize:12}} placeholder="實切寬度 e.g. 142" value={s.thresholdW} onChange={e=>set("thresholdW",e.target.value)}/>}
      </div>
    </div>
  );
}

function FixedPanelForm({value,onChange,onRemove}){
  const fp=value;
  const set=(k,v)=>onChange({...fp,[k]:v});
  const isCG=false; // 防爆膜已含在材質名稱中
  const B=(a)=>({padding:"6px 12px",borderRadius:8,fontFamily:ff,fontSize:12,fontWeight:600,cursor:"pointer",border:`1.5px solid ${a?"#1A1D23":"#E2E5EC"}`,background:a?"#1A1D23":"#fff",color:a?"#fff":"#374151"});
  const upd=(i,k,v)=>set("pieces",fp.pieces.map((p,idx)=>idx===i?{...p,[k]:v}:p));
  return(
    <div style={{border:"1.5px solid #8B5CF6",borderRadius:10,padding:14,display:"flex",flexDirection:"column",gap:12,background:"#FAFAFF"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <div style={{fontSize:11,fontWeight:800,color:"#8B5CF6"}}>固定片</div>
        <button onClick={onRemove} style={{background:"none",border:"none",color:"#EF4444",fontSize:12,cursor:"pointer",fontWeight:700}}>移除固定片</button>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10}}>
        <div><OLbl>位置</OLbl><select style={{...sel,fontSize:12}} value={fp.position} onChange={e=>set("position",e.target.value)}>{["上固定","下固定","左固定","右固定"].map(o=><option key={o}>{o}</option>)}</select></div>
        <div><OLbl>顏色</OLbl><select style={{...sel,fontSize:12}} value={fp.color} onChange={e=>set("color",e.target.value)}>{["白","牙","銀","黑"].map(o=><option key={o}>{o}</option>)}</select></div>
        <div><OLbl>材質</OLbl><select style={{...sel,fontSize:12}} value={fp.material} onChange={e=>onChange({...fp,material:e.target.value,防爆膜:""})}>
          {["5mmPS101","5mmPS503","5mmPS501","5mm強化清玻貼清膜","5mm強化清玻貼砂膜","銀霞玻","3mm PS板"].map(o=><option key={o}>{o}</option>)}
        </select></div>
      </div>
      {isCG&&<div><OLbl>防爆膜</OLbl>
        <div style={{display:"flex",gap:6}}>
          {["（不貼）","清膜","砂膜"].map(opt=>{const v=opt==="（不貼）"?"":opt;return(<button key={opt} onClick={()=>set("防爆膜",v)} style={B(fp.防爆膜===v)}>{opt}</button>);})}
        </div>
      </div>}
      <div><OLbl>門片尺寸</OLbl>
        {fp.pieces.map((p,i)=>(
          <div key={i} style={{display:"grid",gridTemplateColumns:"1fr 1fr 70px 30px",gap:7,marginBottom:7,alignItems:"center"}}>
            <input style={{...inp,fontSize:12}} placeholder="寬 W" value={p.width} onChange={e=>upd(i,"width",e.target.value)}/>
            <input style={{...inp,fontSize:12}} placeholder="高 H" value={p.height} onChange={e=>upd(i,"height",e.target.value)}/>
            <input style={{...inp,fontSize:12}} type="number" min="1" placeholder="數量" value={p.qty} onChange={e=>upd(i,"qty",e.target.value)}/>
            <button onClick={()=>set("pieces",fp.pieces.filter((_,idx)=>idx!==i))} style={{background:"none",border:"none",color:"#EF4444",fontSize:17,cursor:"pointer",padding:0}}>✕</button>
          </div>
        ))}
        <button onClick={()=>set("pieces",[...fp.pieces,{...EPiece}])} style={{width:"100%",padding:"7px",border:"1.5px dashed #8B5CF6",borderRadius:8,background:"none",color:"#8B5CF6",fontFamily:ff,fontSize:12,fontWeight:700,cursor:"pointer"}}>+ 新增門片</button>
      </div>
    </div>
  );
}

function PendingOrderForm({order,onSave,onClose,fromQuote}){
  const isEdit=!!order;
  const defOrder={cust:"",phone:"",addr:"",elev:null,mapUrl:"",master:"余青陽",note:"",coll:false,collAmt:0,collSt:"待收",specs:[{...ES}],fixedPanel:null,shipDate:"",shipMethod:"寄松成"};
  const [form,setForm]=useState(order||defOrder);
  const set=(k,v)=>setForm(f=>({...f,[k]:v}));
  const updSpec=(i,v)=>setForm(f=>({...f,specs:f.specs.map((s,idx)=>idx===i?v:s)}));

  return(
    <Modal onClose={onClose} width={560}>
      <div style={{padding:"16px 20px 12px",borderBottom:"1px solid #F3F4F6",display:"flex",justifyContent:"space-between"}}>
        <div>
          <div style={{fontWeight:800,fontSize:16}}>{isEdit?"✏️ 編輯訂單":"＋ 新增待安裝訂單"}</div>
          {fromQuote&&<div style={{fontSize:11,color:"#3B82F6",marginTop:2}}>📊 已從報價系統帶入</div>}
        </div>
        <button onClick={onClose} style={{border:"none",background:"none",fontSize:22,cursor:"pointer",color:"#9CA3AF"}}>✕</button>
      </div>
      <div style={{flex:1,overflowY:"auto",padding:"14px 20px"}}>
        <div style={{display:"grid",gap:12}}>
          {/* 基本資料 */}
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
            <div><label style={lbl}>客戶姓名</label><input value={form.cust||""} onChange={e=>set("cust",e.target.value)} style={inp} placeholder="王大明"/></div>
            <div><label style={lbl}>聯絡電話</label><input value={form.phone||""} onChange={e=>set("phone",e.target.value)} style={inp} placeholder="0912-345-678" inputMode="tel"/></div>
          </div>
          <div><label style={lbl}>施工地址</label>
            <div style={{display:"flex",gap:7}}>
              <input value={form.addr||""} onChange={e=>set("addr",e.target.value)} style={{...inp,flex:1}} placeholder="台北市信義區..."/>
              <button onClick={()=>set("elev",form.elev===true?false:form.elev===false?null:true)} style={{flexShrink:0,padding:"0 12px",borderRadius:8,border:"2px solid",borderColor:form.elev===true?"#3B82F6":form.elev===false?"#EF4444":"#E5E7EB",background:form.elev===true?"#EFF6FF":form.elev===false?"#FEF2F2":"#fff",color:form.elev===true?"#1D4ED8":form.elev===false?"#DC2626":"#9CA3AF",fontWeight:700,fontSize:12,cursor:"pointer",fontFamily:ff,whiteSpace:"nowrap"}}>{form.elev===true?"🛗 有電梯":form.elev===false?"🚶 無電梯":"電梯？"}</button>
            </div>
          </div>
          <div><label style={lbl}>師傅</label>
            <select value={form.master||"余青陽"} onChange={e=>set("master",e.target.value)} style={sel}>
              {["余青陽","賴彥銘","郭師傅"].map(m=><option key={m}>{m}</option>)}
            </select>
          </div>

          {/* 門型規格 */}
          <div style={{borderTop:"1px solid #F1F5F9",paddingTop:12}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
              <label style={{...lbl,marginBottom:0}}>門型規格</label>
              <button onClick={()=>setForm(f=>({...f,specs:[...f.specs,{...ES}]}))} style={{padding:"4px 11px",borderRadius:7,border:"1.5px solid #3B82F6",background:"#EFF6FF",color:"#1D4ED8",fontFamily:ff,fontSize:12,fontWeight:700,cursor:"pointer"}}>+ 新增規格</button>
            </div>
            <div style={{display:"flex",flexDirection:"column",gap:10}}>
              {(form.specs||[{...ES}]).map((spec,i)=>(
                <div key={i}>
                  {(form.specs||[]).length>1&&<div style={{fontSize:11,color:"#9CA3AF",fontWeight:700,marginBottom:5}}>規格 {i+1}</div>}
                  <SpecForm value={spec} onChange={v=>updSpec(i,v)} onRemove={()=>setForm(f=>({...f,specs:f.specs.filter((_,idx)=>idx!==i)}))} showRemove={(form.specs||[]).length>1}/>
                </div>
              ))}
            </div>
          </div>

          {/* 固定片 */}
          <div style={{borderTop:"1px solid #F1F5F9",paddingTop:12}}>
            {!form.fixedPanel
              ?<button onClick={()=>setForm(f=>({...f,fixedPanel:{...EFP,pieces:[{...EPiece}]}}))} style={{width:"100%",padding:"9px",border:"1.5px dashed #8B5CF6",borderRadius:8,background:"none",color:"#8B5CF6",fontFamily:ff,fontSize:12,fontWeight:700,cursor:"pointer"}}>+ 新增固定片</button>
              :<FixedPanelForm value={form.fixedPanel} onChange={fp=>setForm(f=>({...f,fixedPanel:fp}))} onRemove={()=>setForm(f=>({...f,fixedPanel:null}))}/>
            }
          </div>

          {/* 出貨 */}
          <div style={{borderTop:"1px solid #F1F5F9",paddingTop:12}}>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
              <div><label style={lbl}>預計出貨日</label><input value={form.shipDate||""} onChange={e=>set("shipDate",e.target.value)} style={inp} placeholder="5/6"/></div>
              <div><label style={lbl}>出貨方式</label>
                <select value={form.shipMethod||"寄松成"} onChange={e=>set("shipMethod",e.target.value)} style={sel}>
                  {["寄松成","寄","載","其他站址取"].map(o=><option key={o}>{o}</option>)}
                </select>
              </div>
            </div>
          </div>

          {/* 代收 */}
          <div>
            <CB label="💰 師傅到場代收尾款" checked={!!form.coll} onChange={v=>set("coll",v)} color="#D97706"/>
            {form.coll&&<div style={{marginTop:8,position:"relative"}}><span style={{position:"absolute",left:10,top:"50%",transform:"translateY(-50%)",fontSize:13,color:"#94A3B8"}}>$</span><input type="number" min={0} value={form.collAmt||""} placeholder="尾款金額" onChange={e=>set("collAmt",e.target.value===""?0:Number(e.target.value))} style={{...inp,paddingLeft:22}}/></div>}
          </div>

          <div><label style={lbl}>備註</label><textarea value={form.note||""} onChange={e=>set("note",e.target.value)} style={{...inp,height:60,resize:"vertical"}} placeholder="特殊注意事項..."/></div>
        </div>
      </div>
      <div style={{padding:"12px 20px",borderTop:"1px solid #F3F4F6",display:"flex",gap:10}}>
        <button onClick={onClose} style={{flex:1,padding:11,borderRadius:10,border:"1.5px solid #E5E7EB",background:"#fff",cursor:"pointer",fontFamily:ff,fontWeight:600}}>取消</button>
        <button onClick={()=>onSave({
          ...form,
          id:order?.id||Date.now(),
          scheduled:order?.scheduled||false,
          // 統一欄位名稱供其他地方使用
          customer:form.cust||form.customer||"",
          address:form.addr||form.address||"",
          hasElevator:form.elev??form.hasElevator??null,
          collectOnSite:form.coll||form.collectOnSite||false,
          collectedAmount:form.collAmt||form.collectedAmount||0,
          collectStatus:form.collSt||form.collectStatus||"待收",
        })} style={{flex:2,padding:11,borderRadius:10,border:"none",background:"#1E293B",color:"#fff",fontWeight:800,fontSize:14,cursor:"pointer",fontFamily:ff}}>{isEdit?"儲存修改":"新增訂單"}</button>
      </div>
    </Modal>
  );
}


// ─── 下單工單 ─────────────────────────────────────────────────────────────────
function toROC(s){if(!s)return"";const[y,m,d]=s.split("/");return`${Number(y)-1911}/${m}/${d}`;}

function OrderSlip({order}){
  const fp=order.fixedPanel;
  return(
    <div style={{width:480,background:"#fff",fontFamily:"'Noto Sans TC',sans-serif",color:"#000",padding:"28px 36px",fontSize:15,lineHeight:2}}>
      <div style={{marginBottom:16}}>
        <div>{toROC(order.createdAt||new Date().toISOString().slice(0,10).replace(/-/g,"/"))}</div>
        <div>BW0800　（{order.customer||order.cust}）</div>
      </div>
      <div style={{display:"flex"}}>
        <div style={{flex:1,paddingRight:fp?24:0,borderRight:fp?"1px solid #ccc":"none"}}>
          {(order.specs||[]).map((s,i)=>{
            let ml=`${s.doorType}（${s.color}）${s.material}`;
            if(s.ps花紋)ml+=`（${s.ps花紋}）`;
            if(s.防爆膜)ml+=`（貼防爆${s.防爆膜}）`;
            let sl=`W${s.width}×H${s.height}`;
            if(s.direction)sl+=`　${s.direction}`;
            if(s.handle)sl+=`　${s.handle}`;
            return(
              <div key={i} style={{marginBottom:i<order.specs.length-1?20:0}}>
                {order.specs.length>1&&<div style={{fontSize:11,color:"#888",marginBottom:2}}>規格 {i+1}</div>}
                <div>{ml}</div>
                <div>{sl}</div>
                {s.sizeType==="丈量"&&s.扣&&<div>丈量扣{s.扣}</div>}
                {s.threshold&&s.thresholdW&&<div style={{marginTop:4}}>鋁門檻實切 W{s.thresholdW}</div>}
              </div>
            );
          })}
          {!order.specs&&order.product&&<div>{order.product}</div>}
        </div>
        {fp&&(
          <div style={{flex:1,paddingLeft:24}}>
            <div style={{marginBottom:8}}>{fp.position}（{fp.color}）{fp.material}{fp.防爆膜?`（貼防爆${fp.防爆膜}）`:""}</div>
            {fp.pieces.map((p,i)=>(
              <div key={i} style={{display:"flex",alignItems:"flex-start",gap:10,marginBottom:10}}>
                <div style={{border:"1.5px solid #000",width:Math.max(28,Math.min(52,Math.round(Number(p.width)/10)+16)),height:Math.max(28,Math.min(60,Math.round(Number(p.height)/10)+16)),display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,fontSize:12,fontWeight:700}}>F</div>
                <div style={{fontSize:13,lineHeight:1.7}}><div>{p.width}</div><div>{p.height}</div><div>×{p.qty}片</div></div>
              </div>
            ))}
          </div>
        )}
      </div>
      {order.note&&<div style={{marginTop:12}}>{order.note}</div>}
      <div style={{display:"flex",justifyContent:"flex-end",marginTop:20,fontSize:14}}>{order.shipDate} {order.shipMethod}</div>
    </div>
  );
}

const STORAGE_KEY="xiangyu_orders_v1";
const PENDING_KEY="xiangyu_pending_v1";

const SEED_ORDERS=[
  {id:1,masterId:"qingyang",area:"台北",jobType:"拆裝",customer:"林嘉威",phone:"0976588977",address:"台北市南港區舊莊街一段181號4樓之1 無電梯",product:"一字二門（白）5mmPS101 W148×H200 右開 散裝 寬扣1 鋁門檻（白）W147.5實切",date:"2026-04-11",timeSlot:"下午",appointTime:"",status:"完成",floor:4,hasThreshold:true,hasThresholdReplace:false,isLType:false,hasFixedPlate:false,extras:[],extraCustom:0,note:"無尾款。現場左伸縮料要切有水管，舊門檻拆掉裝新的。前一天電聯時間。",hasShipping:true,carrier:"進南貨運",shipDate:"2026-04-02",shipStatus:"已到站",trackingNo:"BW0800",collectOnSite:false,collectedAmount:0,collectStatus:"已收",wagePayStatus:"待付",monthlySettled:false,hasElevator:false},
  {id:2,masterId:"qingyang",area:"新北",jobType:"安裝",customer:"王欣怡",phone:"0931-168-070",address:"新北市三重區名源街48號3樓 無電梯",product:"一字二門（黑）5mm清玻貼防爆砂膜 W128.2×H200 右開 丈量扣1.5 鋁門檻W1277實切",date:"2026-04-04",timeSlot:"下午",appointTime:"",status:"完成",floor:3,hasThreshold:true,hasThresholdReplace:false,isLType:false,hasFixedPlate:false,extras:[],extraCustom:0,note:"前一天電聯。呂志宏0920-221-660",hasShipping:true,carrier:"進南貨運",shipDate:"2026-04-01",shipStatus:"已到站",trackingNo:"BW0800",collectOnSite:true,collectedAmount:8760,collectStatus:"已收",wagePayStatus:"待付",monthlySettled:false,hasElevator:false},
  {id:3,masterId:"qingyang",area:"新北",jobType:"安裝",customer:"陳奕均",phone:"0909111093",address:"新北市新莊區五工三路78巷23號5樓 無電梯",product:"一字四門（白）PS101-5mm W218×H200 實作尺寸 散裝 鋁門檻（白）W222.1實切",date:"2026-04-01",timeSlot:"上午",appointTime:"",status:"完成",floor:5,hasThreshold:true,hasThresholdReplace:false,isLType:false,hasFixedPlate:false,extras:[],extraCustom:0,note:"前一天電聯她。",hasShipping:true,carrier:"進南貨運",shipDate:"2026-03-30",shipStatus:"已到站",trackingNo:"BW0800",collectOnSite:true,collectedAmount:7750,collectStatus:"已收",wagePayStatus:"待付",monthlySettled:false,hasElevator:false},
  {id:4,masterId:"qingyang",area:"台北",jobType:"拆裝",customer:"唐太太",phone:"0909882501",address:"台北市松山區光復北路182號11樓 有電梯",product:"一字三門（白）清玻（貼防爆清膜）W151.5×H200 右開 加內外把手 扣1.5",date:"2026-04-11",timeSlot:"上午",appointTime:"10:00",status:"完成",floor:11,hasThreshold:false,hasThresholdReplace:false,isLType:false,hasFixedPlate:false,extras:[],extraCustom:0,note:"客戶要用匯款，給帳號。前一天先電聯紀小姐0912672866",hasShipping:true,carrier:"進南貨運",shipDate:"2026-04-02",shipStatus:"已到站",trackingNo:"BW0800",collectOnSite:true,collectedAmount:11600,collectStatus:"已收",wagePayStatus:"待付",monthlySettled:false,hasElevator:true},
  {id:5,masterId:"qingyang",area:"台北",jobType:"拆裝",customer:"陳俞勻",phone:"0916940123",address:"台北市南港區研究院路二段34巷18號3樓 無電梯",product:"一字三門（白）5mmPS101 W146.5×H190 左開 加內外把手 扣1.5",date:"2026-04-11",timeSlot:"上午",appointTime:"12:00",status:"完成",floor:3,hasThreshold:false,hasThresholdReplace:false,isLType:false,hasFixedPlate:false,extras:[],extraCustom:0,note:"拍照他的鏡子（神祖牌）",hasShipping:true,carrier:"進南貨運",shipDate:"2026-03-31",shipStatus:"已到站",trackingNo:"BW0800",collectOnSite:true,collectedAmount:8600,collectStatus:"已收",wagePayStatus:"待付",monthlySettled:false,hasElevator:false},
  {id:6,masterId:"qingyang",area:"台北",jobType:"拆裝",customer:"盧夙敏",phone:"0983073983",address:"台北市中山區中原街22號5樓之23 有電梯",product:"一字三門（白）5mmPS101 W138×H190 左開 扣1.5",date:"2026-04-03",timeSlot:"下午",appointTime:"",status:"完成",floor:5,hasThreshold:false,hasThresholdReplace:false,isLType:false,hasFixedPlate:false,extras:[],extraCustom:0,note:"前一天電聯時間。",hasShipping:true,carrier:"進南貨運",shipDate:"2026-03-26",shipStatus:"已到站",trackingNo:"BW0800",collectOnSite:true,collectedAmount:8000,collectStatus:"已收",wagePayStatus:"待付",monthlySettled:false,hasElevator:true},
  {id:7,masterId:"qingyang",area:"新北",jobType:"安裝",customer:"吳懷珍",phone:"0912828870",address:"23557新北市中和區橋和路160巷21號6樓（有電梯）",product:"一字三門（白）PS501-5mm W128×H190 右開 丈量扣1 鋁門檻W127.5實切",date:"2026-04-24",timeSlot:"上午",appointTime:"",status:"已確認",floor:6,hasThreshold:true,hasThresholdReplace:false,isLType:false,hasFixedPlate:false,extras:[],extraCustom:0,note:"安裝前一天通知準確時間。",hasShipping:true,carrier:"進南貨運",shipDate:"2026-04-22",shipStatus:"已寄出",trackingNo:"BW0800",collectOnSite:true,collectedAmount:5362,collectStatus:"待收",wagePayStatus:"待付",monthlySettled:false,hasElevator:true},
  {id:8,masterId:"qingyang",area:"新北",jobType:"安裝",customer:"柏宗祐",phone:"0975227584",address:"新北市新店區富貴街18巷4號1F",product:"一字三門（白）5mmPS101 W144.5×H190 左開 扣1.5 鋁門檻實切W144",date:"2026-04-24",timeSlot:"上午",appointTime:"",status:"已確認",floor:1,hasThreshold:true,hasThresholdReplace:false,isLType:false,hasFixedPlate:false,extras:[],extraCustom:0,note:"前一天電聯時間。",hasShipping:true,carrier:"進南貨運",shipDate:"2026-04-22",shipStatus:"已寄出",trackingNo:"BW0800",collectOnSite:true,collectedAmount:8100,collectStatus:"待收",wagePayStatus:"待付",monthlySettled:false,hasElevator:false},
  {id:9,masterId:"qingyang",area:"桃園",jobType:"純配送",customer:"陳皇仁",phone:"0938123802",address:"桃園市楊梅區雙榮里民族路五段147巷7弄11號",product:"一字三門 白框 3mmPS503 W150×H185 右開 扣1.5",date:"2026-04-09",timeSlot:"上午",appointTime:"",status:"完成",floor:1,hasThreshold:false,hasThresholdReplace:false,isLType:false,hasFixedPlate:false,extras:[],extraCustom:0,note:"幫配送（看起來是巷子不妥想進南）。無尾款。",hasShipping:true,carrier:"進南貨運",shipDate:"2026-04-09",shipStatus:"已到站",trackingNo:"BW0800",collectOnSite:false,collectedAmount:0,collectStatus:"已收",wagePayStatus:"待付",monthlySettled:false,hasElevator:null},
  {id:10,masterId:"qingyang",area:"新北",jobType:"安裝",customer:"許巧潔",phone:"0983734804",address:"新北市永和區保福路一段35巷13號2樓",product:"一字三門（白）5mmPS101 W150×H190 右開 扣1.5 鋁門檻實切W149.5",date:"2026-04-14",timeSlot:"上午",appointTime:"11:00",status:"完成",floor:2,hasThreshold:true,hasThresholdReplace:false,isLType:false,hasFixedPlate:false,extras:[],extraCustom:0,note:"11:00～12:00完成安裝（盡量）。有跟他說拆壞毛巾架和肥皂架不負責",hasShipping:true,carrier:"進南貨運",shipDate:"2026-04-08",shipStatus:"已到站",trackingNo:"BW0800",collectOnSite:true,collectedAmount:5800,collectStatus:"已收",wagePayStatus:"待付",monthlySettled:false,hasElevator:false},
];

export default function App(){
  const [orders,setOrdersRaw]=useState(()=>{try{const s=localStorage.getItem(STORAGE_KEY);return s?JSON.parse(s):SEED_ORDERS;}catch{return SEED_ORDERS;}});
  function setOrders(updater){setOrdersRaw(prev=>{const next=typeof updater==="function"?updater(prev):updater;try{localStorage.setItem(STORAGE_KEY,JSON.stringify(next));}catch{}return next;});}
  const [pendingOrders,setPendingOrdersRaw]=useState(()=>{try{const s=localStorage.getItem(PENDING_KEY);return s?JSON.parse(s):[];}catch{return[];}});
  function setPendingOrders(updater){setPendingOrdersRaw(prev=>{const next=typeof updater==="function"?updater(prev):updater;try{localStorage.setItem(PENDING_KEY,JSON.stringify(next));}catch{}return next;});}

  function addFromQuote(order){
    setEditPending(null);
    setPendingOrdersRaw(prev=>{
      // 不直接新增，改成開啟表單帶入資料
      return prev;
    });
    // 開啟新增表單並帶入報價資料
    setEditPending({...order,id:null,fromQuote:true});
    setShowPendingForm(true);
    setTab("pending");
  }

  const [showForm,setShowForm]=useState(false);
  const [editOrder,setEditOrder]=useState(null);
  const [selectedDate,setSelectedDate]=useState(null);
  const [pendingAddDate,setPendingAddDate]=useState(null);
  const [wageCalcMaster,setWageCalcMaster]=useState(null);
  const [showTransfer,setShowTransfer]=useState(false);
  const [showMonthly,setShowMonthly]=useState(false);
  const [filterMaster,setFilterMaster]=useState("all");
  const [calYear,setCalYear]=useState(today.getFullYear());
  const [calMonth,setCalMonth]=useState(today.getMonth());
  const [tab,setTab]=useState("calendar");
  const [showPendingForm,setShowPendingForm]=useState(false);
  const [editPending,setEditPending]=useState(null);
  const [showSlip,setShowSlip]=useState(false);
  const [slipOrder,setSlipOrder]=useState(null);
  const [dlLoading,setDlLoading]=useState(false);

  const filtered=useMemo(()=>orders.filter(o=>filterMaster==="all"||o.masterId===filterMaster),[orders,filterMaster]);
  const dayOrders=useMemo(()=>selectedDate?filtered.filter(o=>o.date===selectedDate):[],[selectedDate,filtered]);
  const addOrder=o=>{setOrders(p=>[...p,o]);setShowForm(false);setPendingAddDate(null);};
  const saveOrder=o=>{setOrders(p=>p.map(x=>x.id===o.id?o:x));setEditOrder(null);};
  const deleteOrder=id=>{setOrders(p=>p.filter(o=>o.id!==id));setEditOrder(null);};
  const updateOrder=(id,patch)=>setOrders(p=>p.map(o=>o.id===id?{...o,...patch}:o));
  const prevMonth=()=>{let m=calMonth-1,y=calYear;if(m<0){m=11;y--;}setCalMonth(m);setCalYear(y);};
  const nextMonth=()=>{let m=calMonth+1,y=calYear;if(m>11){m=0;y++;}setCalMonth(m);setCalYear(y);};
  const pendingCount=pendingOrders.filter(p=>!p.scheduled).length;

  return(
    <div style={{minHeight:"100vh",background:"#F1F5F9",fontFamily:ff}}>
      <div style={{background:"#fff",borderBottom:"1px solid #E2E8F0",padding:"0 18px",height:54,display:"flex",alignItems:"center",justifyContent:"space-between",position:"sticky",top:0,zIndex:100,boxShadow:"0 1px 6px rgba(0,0,0,0.06)"}}>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <span style={{fontSize:20}}>🚿</span>
          <div><div style={{fontWeight:800,fontSize:14,lineHeight:1.2}}>享浴淋浴拉門</div><div style={{fontSize:9,color:"#94A3B8"}}>安裝排程 & 工資管理</div></div>
          <div style={{display:"flex",background:"#F1F5F9",borderRadius:8,padding:3,marginLeft:8}}>
            {[["quote","💰 報價"],["pending","📋 訂單"+(pendingCount>0?" ("+pendingCount+")":"")],["calendar","📅 排程"]].map(([v,label])=>(
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
        {tab==="quote"&&(<QuotationSystem onCreateOrder={p=>{setPendingOrders(prev=>[...prev,{...p,id:Date.now(),scheduled:false}]);setTab("pending");}}/>)}
        {tab==="pending"&&(<PendingOrdersTab pendingOrders={pendingOrders} onEdit={p=>{setEditPending(p);setShowPendingForm(true);}} onDelete={id=>setPendingOrders(p=>p.filter(x=>x.id!==id))} onToggleScheduled={id=>setPendingOrders(p=>p.map(x=>x.id===id?{...x,scheduled:!x.scheduled}:x))} onSlip={p=>{setSlipOrder(p);setShowSlip(true);}}/>)}
        {tab==="calendar"&&(<>
          <WageSummary orders={orders} year={calYear} month={calMonth} onTransferLog={()=>setShowTransfer(true)} onMonthlySettle={()=>setShowMonthly(true)}/>
          <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:10}}>
            <button onClick={prevMonth} style={iBtn}>‹</button>
            <span style={{fontWeight:800,fontSize:16,minWidth:100,textAlign:"center"}}>{calYear}年 {calMonth+1}月</span>
            <button onClick={nextMonth} style={iBtn}>›</button>
            <button onClick={()=>{setCalYear(today.getFullYear());setCalMonth(today.getMonth());}} style={{padding:"5px 11px",borderRadius:8,border:"1px solid #E5E7EB",background:"#fff",cursor:"pointer",fontSize:12,color:"#6B7280",fontFamily:ff}}>今天</button>
            <div style={{marginLeft:"auto",display:"flex",gap:6}}>
              <button onClick={()=>setShowMonthly(true)} style={{padding:"5px 12px",borderRadius:8,border:"1.5px solid #BFDBFE",background:"#EFF6FF",color:"#1D4ED8",fontSize:11,fontWeight:700,cursor:"pointer",fontFamily:ff}}>📅 月結帳單</button>
              <button onClick={()=>setShowTransfer(true)} style={{padding:"5px 12px",borderRadius:8,border:"1.5px solid #FDE68A",background:"#FEF3C7",color:"#92400E",fontSize:11,fontWeight:700,cursor:"pointer",fontFamily:ff}}>💸 匯款紀錄</button>
            </div>
          </div>
          <QuickCopyBar orders={orders}/>
          <TTCalendar orders={filtered} year={calYear} month={calMonth} onDayClick={setSelectedDate}/>
        </>)}
      </div>

      {selectedDate&&(<DayPanel date={selectedDate} orders={dayOrders} onClose={()=>setSelectedDate(null)} onAdd={date=>{setPendingAddDate(date);setSelectedDate(null);setShowForm(true);}} onEdit={o=>{setEditOrder(o);setSelectedDate(null);}} onUpdateOrder={updateOrder}/>)}
      {(showForm||editOrder)&&(<OrderForm order={editOrder} defaultDate={pendingAddDate||todayStr} pendingOrders={pendingOrders.filter(p=>!p.scheduled)} onSave={o=>{if(editOrder){saveOrder(o);}else{addOrder(o);if(o.fromPendingId)setPendingOrders(p=>p.map(x=>x.id===o.fromPendingId?{...x,scheduled:true}:x));} }} onClose={()=>{setShowForm(false);setEditOrder(null);setPendingAddDate(null);}} onDelete={deleteOrder}/>)}
      {wageCalcMaster&&<WageCalc master={wageCalcMaster} onClose={()=>setWageCalcMaster(null)}/>}
      {showTransfer&&<TransferLog orders={orders} year={calYear} month={calMonth} onClose={()=>setShowTransfer(false)} onUpdate={updateOrder}/>}
      {showMonthly&&<MonthlySettle orders={orders} year={calYear} month={calMonth} onClose={()=>setShowMonthly(false)} onUpdate={updateOrder}/>}
      {showPendingForm&&(<PendingOrderForm order={editPending?.id?editPending:null} fromQuote={!!editPending?.fromQuote} onSave={p=>{
        const toSave={...editPending,...p,id:editPending?.id||Date.now(),scheduled:editPending?.scheduled||false};
        setPendingOrders(prev=>editPending?.id?prev.map(x=>x.id===toSave.id?toSave:x):[...prev,toSave]);
        setShowPendingForm(false);setEditPending(null);
        // 新增後自動開工單
        if(!editPending?.id)setTimeout(()=>{setSlipOrder(toSave);setShowSlip(true);},100);
      }} onClose={()=>{setShowPendingForm(false);setEditPending(null);}}/>)}
      {showSlip&&slipOrder&&(
        <div onClick={()=>setShowSlip(false)} style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.6)",zIndex:600,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:14}}>
          <div onClick={e=>e.stopPropagation()} style={{display:"flex",gap:10}}>
            <button onClick={()=>{
              const el=document.getElementById("order-slip-print");
              if(!el)return;
              const go=async()=>{
                const canvas=await window.html2canvas(el,{scale:3,backgroundColor:"#fff"});
                const a=document.createElement("a");
                a.download=`工單_${slipOrder.customer||slipOrder.cust||""}.png`;
                a.href=canvas.toDataURL("image/png");a.click();
              };
              if(window.html2canvas){go();return;}
              const sc=document.createElement("script");
              sc.src="https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js";
              sc.onload=go;sc.onerror=()=>alert("下載失敗，請截圖");
              document.head.appendChild(sc);
            }} style={{padding:"10px 20px",borderRadius:8,background:"#1E293B",color:"#fff",border:"none",fontSize:14,fontWeight:700,cursor:"pointer",fontFamily:ff}}>⬇ 下載 PNG</button>
            <button onClick={()=>setShowSlip(false)} style={{padding:"10px 20px",borderRadius:8,background:"#fff",color:"#1E293B",border:"1px solid #ddd",fontSize:14,fontWeight:600,cursor:"pointer",fontFamily:ff}}>關閉</button>
          </div>
          <div id="order-slip-print" onClick={e=>e.stopPropagation()} style={{boxShadow:"0 12px 48px rgba(0,0,0,0.35)"}}>
            <OrderSlip order={slipOrder}/>
          </div>
          <div style={{fontSize:11,color:"rgba(255,255,255,0.5)"}}>點空白處關閉</div>
        </div>
      )}
    </div>
  );
}