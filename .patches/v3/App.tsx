"use client";

import { FormEvent, useEffect, useState } from "react";

type Tab = "today" | "study" | "money" | "sport" | "review";
type Task = { id:number; subject:string; text:string; done:boolean; minutes:number; date:string };
type Expense = { id:number; category:string; note:string; amount:number; date:string };
type Workout = { id:number; type:string; duration:number; distance:number; date:string; note:string };
type StudySession = { id:number; subject:string; seconds:number; date:string; note:string };
type TimeTheme = "morning" | "day" | "sunset" | "night";
type TimerState = { elapsed:number; running:boolean; startedAt:number|null };
type InstallPromptEvent = Event & { prompt:()=>Promise<void>; userChoice:Promise<{outcome:"accepted"|"dismissed"}> };

const subjects = [
  {name:"数学一",short:"数",color:"#f2a65a",plan:"概率论强化 · 典型题",goal:180},
  {name:"英语一",short:"英",color:"#6fb1b7",plan:"阅读精析 + 单词复习",goal:90},
  {name:"政治",short:"政",color:"#df7b70",plan:"核心考点梳理",goal:60},
  {name:"自动控制原理",short:"控",color:"#8fa9df",plan:"根轨迹与频域分析",goal:120},
];
const initialTasks:Task[] = [];
const iso = (date=new Date()) => new Date(date.getTime()-date.getTimezoneOffset()*60000).toISOString().slice(0,10);
const durationText = (seconds:number) => seconds>=3600?`${Math.floor(seconds/3600)}h ${Math.round(seconds%3600/60)}m`:`${Math.round(seconds/60)}m`;

function useSaved<T>(key:string, initial:T|(()=>T)){
  const [value,setValue]=useState<T>(()=>{
    try{const x=localStorage.getItem(key);if(x)return JSON.parse(x)}catch{}
    return typeof initial==="function"?(initial as ()=>T)():initial;
  });
  useEffect(()=>{try{localStorage.setItem(key,JSON.stringify(value))}catch{}},[key,value]);
  return [value,setValue] as const;
}

function yesterday(){const d=new Date();d.setDate(d.getDate()-1);return iso(d)}
function migrateTasks():Task[]{
  try{
    const old=JSON.parse(localStorage.getItem("night-tasks-v2")||"[]") as Omit<Task,"date">[];
    return old.map(t=>({...t,date:yesterday()}));
  }catch{return []}
}

export default function Home(){
  const [tab,setTab]=useState<Tab>("today");
  const [tasks,setTasks]=useSaved<Task[]>("night-tasks-v3",migrateTasks);
  const [expenses,setExpenses]=useSaved<Expense[]>("night-expenses",[]);
  const [workouts,setWorkouts]=useSaved<Workout[]>("night-workouts",[]);
  const [sessions,setSessions]=useSaved<StudySession[]>("night-study-sessions",[]);
  const [target,setTarget]=useSaved("night-target","2026-12-20");
  const [focus,setFocus]=useState("数学一");
  const [timerState,setTimerState]=useSaved<TimerState>("study-timer-v2",{elapsed:0,running:false,startedAt:null});
  const [modal,setModal]=useState<"expense"|"workout"|"task"|"study"|null>(null);
  const [editingTask,setEditingTask]=useState<Task|null>(null);
  const [editingExpense,setEditingExpense]=useState<Expense|null>(null);
  const [editingWorkout,setEditingWorkout]=useState<Workout|null>(null);
  const [editingStudy,setEditingStudy]=useState<StudySession|null>(null);
  const [taskSubject,setTaskSubject]=useState("数学一");
  const [taskDay,setTaskDay]=useState(iso());
  const [now,setNow]=useState<number|null>(null);
  const [reviewMonth,setReviewMonth]=useState(iso().slice(0,7));
  const [selectedDay,setSelectedDay]=useState(iso());
  const [installPrompt,setInstallPrompt]=useState<InstallPromptEvent|null>(null);

  useEffect(()=>{setNow(Date.now());const n=window.setInterval(()=>setNow(Date.now()),60000);return()=>window.clearInterval(n)},[]);
  useEffect(()=>{
    const fitAndroidViewport=()=>{
      const isTouch=matchMedia("(hover:none) and (pointer:coarse)").matches;
      const deviceWidth=Math.max(1,window.screen.width);
      const scale=window.innerWidth/deviceWidth;
      if(isTouch&&scale>1.25){
        document.body.classList.add("android-viewport-fix");
      }else{
        document.body.classList.remove("android-viewport-fix");
      }
    };
    fitAndroidViewport();
    window.addEventListener("orientationchange",fitAndroidViewport);
    return()=>window.removeEventListener("orientationchange",fitAndroidViewport);
  },[]);
  useEffect(()=>{
    if(!timerState.running||!timerState.startedAt)return;
    const sync=()=>setTimerState(v=>v.running&&v.startedAt?{...v,elapsed:Math.max(v.elapsed,Math.floor((Date.now()-v.startedAt)/1000))}:v);
    sync();
    const n=window.setInterval(sync,1000);
    document.addEventListener("visibilitychange",sync);
    window.addEventListener("pageshow",sync);
    return()=>{window.clearInterval(n);document.removeEventListener("visibilitychange",sync);window.removeEventListener("pageshow",sync)};
  },[timerState.running,timerState.startedAt,setTimerState]);
  const timer=timerState.elapsed;
  const running=timerState.running;
  const todayKey=iso();
  const todayTasks=tasks.filter(t=>t.date===todayKey);
  const dayTasks=tasks.filter(t=>t.date===taskDay);
  const done=todayTasks.filter(t=>t.done).length;
  const progress=todayTasks.length?Math.round(done/todayTasks.length*100):0;
  const days=now===null?0:Math.max(0,Math.ceil((new Date(target+"T00:00:00").getTime()-now)/86400000));
  const todaySpend=expenses.filter(e=>e.date===iso()).reduce((s,e)=>s+e.amount,0);
  const weekAgo=new Date();weekAgo.setDate(weekAgo.getDate()-6);
  const week=workouts.filter(w=>new Date(w.date)>=weekAgo);
  const swim=week.filter(w=>w.type==="游泳").reduce((s,w)=>s+w.distance,0);
  const thisMonth=iso().slice(0,7);
  const monthSessions=sessions.filter(s=>s.date.startsWith(reviewMonth));
  const monthWorkouts=workouts.filter(w=>w.date.startsWith(reviewMonth));
  const monthExpenses=expenses.filter(e=>e.date.startsWith(reviewMonth));
  const monthStudySeconds=monthSessions.reduce((s,x)=>s+x.seconds,0);
  const studyDates=new Set(monthSessions.map(s=>s.date));
  const [year,month]=reviewMonth.split("-").map(Number);
  const daysInMonth=new Date(year,month,0).getDate();
  const firstOffset=(new Date(year,month-1,1).getDay()+6)%7;
  const calendarCells=Array.from({length:firstOffset+daysInMonth},(_,i)=>i<firstOffset?null:i-firstOffset+1);
  const todayStudy=sessions.filter(s=>s.date===iso()).reduce((a,s)=>a+s.seconds,0);
  const currentMonthStudy=sessions.filter(s=>s.date.startsWith(thisMonth)).reduce((a,s)=>a+s.seconds,0);
  const currentMonthSport=workouts.filter(w=>w.date.startsWith(thisMonth)).length;
  const subjectTotals=subjects.map(subject=>({subject:subject.name,color:subject.color,seconds:monthSessions.filter(s=>s.subject===subject.name).reduce((a,s)=>a+s.seconds,0)}));
  const maxSubject=Math.max(1,...subjectTotals.map(s=>s.seconds));
  const selectedSessions=sessions.filter(s=>s.date===selectedDay);
  const selectedWorkouts=workouts.filter(w=>w.date===selectedDay);
  const selectedExpenses=expenses.filter(e=>e.date===selectedDay);
  const selectedTasks=tasks.filter(t=>t.date===selectedDay);
  const selectedSpend=selectedExpenses.reduce((a,e)=>a+e.amount,0);
  const streak=(()=>{const dates=new Set(sessions.map(s=>s.date));let d=new Date();if(!dates.has(iso(d)))d.setDate(d.getDate()-1);let n=0;while(dates.has(iso(d))){n++;d.setDate(d.getDate()-1)}return n})();
  const greeting=now===null?"你好":(()=>{const h=new Date(now).getHours();return h<5?"夜深了":h<11?"早上好":h<14?"中午好":h<18?"下午好":"晚上好"})();
  const timeTheme:TimeTheme=now===null?"day":(()=>{const h=new Date(now).getHours();return h<5?"night":h<11?"morning":h<15?"day":h<19?"sunset":"night"})();
  const timeSymbol={morning:"☀",day:"✦",sunset:"◐",night:"☾"}[timeTheme];
  useEffect(()=>{document.documentElement.dataset.timeTheme=timeTheme;const color={morning:"#49395d",day:"#17385d",sunset:"#4a294d",night:"#101b3b"}[timeTheme];document.querySelector('meta[name="theme-color"]')?.setAttribute("content",color)},[timeTheme]);
  const toggle=(id:number)=>setTasks(v=>v.map(t=>t.id===id?{...t,done:!t.done}:t));
  const reset=()=>setTimerState({elapsed:0,running:false,startedAt:null});
  const toggleTimer=()=>setTimerState(v=>v.running?{elapsed:v.startedAt?Math.floor((Date.now()-v.startedAt)/1000):v.elapsed,running:false,startedAt:null}:{elapsed:v.elapsed,running:true,startedAt:Date.now()-v.elapsed*1000});
  const openTask=(subject:string,task:Task|null=null,date=taskDay)=>{setTaskSubject(subject);setTaskDay(task?.date||date);setEditingTask(task);setModal("task")};
  const askRemove=(label:string,run:()=>void)=>{if(window.confirm(`确定删除这条${label}吗？`))run()};
  const removeTask=(id:number)=>askRemove("任务",()=>setTasks(v=>v.filter(t=>t.id!==id)));
  const openExpense=(item:Expense|null=null)=>{setEditingExpense(item);setModal("expense")};
  const openWorkout=(item:Workout|null=null)=>{setEditingWorkout(item);setModal("workout")};
  const openStudy=(item:StudySession|null=null,date=selectedDay||todayKey)=>{setEditingStudy(item);setSelectedDay(item?.date||date);setModal("study")};
  const finishTimer=()=>{if(timer<1)return;setSessions(v=>[{id:Date.now(),subject:focus,seconds:timer,date:iso(),note:"正向计时"},...v]);reset()};
  const installApp=async()=>{if(!installPrompt)return;await installPrompt.prompt();const choice=await installPrompt.userChoice;if(choice.outcome==="accepted")setInstallPrompt(null)};

  function saveExpense(e:FormEvent<HTMLFormElement>){e.preventDefault();const d=new FormData(e.currentTarget);const next={id:editingExpense?.id??Date.now(),category:String(d.get("category")),note:String(d.get("note")),amount:Number(d.get("amount")),date:String(d.get("date"))};setExpenses(v=>editingExpense?v.map(x=>x.id===editingExpense.id?next:x):[next,...v]);setEditingExpense(null);setModal(null)}
  function saveWorkout(e:FormEvent<HTMLFormElement>){e.preventDefault();const d=new FormData(e.currentTarget);const next={id:editingWorkout?.id??Date.now(),type:String(d.get("type")),duration:Number(d.get("duration")),distance:Number(d.get("distance"))||0,date:String(d.get("date")),note:String(d.get("note"))};setWorkouts(v=>editingWorkout?v.map(x=>x.id===editingWorkout.id?next:x):[next,...v]);setEditingWorkout(null);setModal(null)}
  function saveTask(e:FormEvent<HTMLFormElement>){e.preventDefault();const d=new FormData(e.currentTarget);const next={id:editingTask?.id??Date.now(),subject:String(d.get("subject")),text:String(d.get("text")).trim(),done:editingTask?.done??false,minutes:Number(d.get("minutes"))||0,date:String(d.get("date"))};setTasks(v=>editingTask?v.map(t=>t.id===editingTask.id?next:t):[...v,next]);setTaskDay(next.date);setModal(null);setEditingTask(null)}
  function saveStudy(e:FormEvent<HTMLFormElement>){e.preventDefault();const d=new FormData(e.currentTarget);const next={id:editingStudy?.id??Date.now(),subject:String(d.get("subject")),seconds:Number(d.get("minutes"))*60,date:String(d.get("date")),note:String(d.get("note"))};setSessions(v=>editingStudy?v.map(x=>x.id===editingStudy.id?next:x):[next,...v]);setSelectedDay(next.date);setEditingStudy(null);setModal(null)}

  return <main className={`app-shell theme-${timeTheme}`}>
    <div className="ambient a1"/><div className="ambient a2"/>
    <header><div><p className="eyebrow">考研生活簿 · 2027</p><h1>{greeting}，宝宝 <span>{timeSymbol}</span></h1><p className="subdate">{now===null?"今天":new Intl.DateTimeFormat("zh-CN",{month:"long",day:"numeric",weekday:"long"}).format(new Date(now))} · 今天也往前一点点</p></div>{installPrompt?<button className="install-app" onClick={installApp}>安装应用</button>:<button className="avatar">盐</button>}</header>
    <nav className="tabs five">{([['today','今日'],['study','学习'],['money','记账'],['sport','运动'],['review','月报']] as [Tab,string][]).map(([id,name])=><button key={id} className={tab===id?"active":""} onClick={()=>setTab(id)}>{name}</button>)}</nav>

    {tab==="today"&&<div className="page">
      <section className="card countdown"><div className="count-copy"><p className="kicker">距离初试</p><div><strong>{days}</strong><span>天</span></div><p>别盯着终点，点亮今天这一格。</p></div><div className="moon">☾<i/><i/><i/></div><label className="date-set">考试日 <input type="date" value={target} onChange={e=>setTarget(e.target.value)}/></label></section>
      <section className="card"><div className="card-head"><div><p className="kicker">TODAY&apos;S LIGHT</p><h2>今日灯火</h2></div><b>{progress}%</b></div>{todayTasks.length?<><div className="lamp-track">{todayTasks.map(t=><button key={t.id} className={t.done?"lit":""} onClick={()=>toggle(t.id)}><span/></button>)}</div><div className="lamp-label"><span>点灯</span><span>{done}/{todayTasks.length} 项完成</span><span>熄灯</span></div></>:<p className="hint">今天是新的一页，写下第一条计划吧。</p>}</section>
      <section className="card"><div className="card-head"><div><p className="kicker">TODAY&apos;S AGENDA</p><h2>今天要做</h2></div><button className="text-btn" onClick={()=>openTask("数学一",null,todayKey)}>＋ 写计划</button></div><div className="task-list">{todayTasks.length?todayTasks.map(t=><div className={t.done?"task done":"task"} key={t.id}><button className="check" onClick={()=>toggle(t.id)}>✓</button><i style={{background:subjects.find(s=>s.name===t.subject)?.color}}/><span onClick={()=>openTask(t.subject,t,t.date)}><b>{t.subject}</b><small>{t.text}</small></span>{t.minutes>0&&<em>{t.minutes}m</em>}<button className="row-more" onClick={()=>openTask(t.subject,t,t.date)}>改</button><button className="row-delete" onClick={()=>removeTask(t.id)}>删</button></div>):<div className="empty compact">今天还没有计划，昨天的任务已留在历史里。</div>}</div><button className="calendar" onClick={()=>{setTaskDay(todayKey);setTab("study")}}>▦ 查看每日任务 <span>可查看历史与补记</span></button></section>
      <div className="mini-grid"><button className="mini" onClick={()=>setTab("money")}><i className="coin">¥</i><span><small>今日支出</small><strong>¥ {todaySpend.toFixed(2)}</strong></span><em>→</em></button><button className="mini" onClick={()=>setTab("sport")}><i className="water">≈</i><span><small>本周游泳</small><strong>{swim} m</strong></span><em>→</em></button></div>
      <button className="month-glance card" onClick={()=>setTab("review")}><span><small>THIS MONTH · 本月生活</small><strong>学习 {durationText(currentMonthStudy)} <i/> 运动 {currentMonthSport} 次</strong></span><em>查看月报 →</em></button>
    </div>}

    {tab==="study"&&<div className="page">
      <section className="card focus-card"><div className="card-head"><div><p className="kicker">FOCUS ROOM</p><h2>正向专注计时</h2></div><span className="count-up">今日 {durationText(todayStudy)}</span></div><div className="pills">{subjects.map(s=><button key={s.name} className={focus===s.name?"active":""} style={{"--accent":s.color} as React.CSSProperties} onClick={()=>setFocus(s.name)}>{s.short} · {s.name}</button>)}</div><div className="timer countup" style={{"--accent":subjects.find(s=>s.name===focus)?.color} as React.CSSProperties}><div><small>{focus}</small><strong>{String(Math.floor(timer/60)).padStart(2,'0')}:{String(timer%60).padStart(2,'0')}</strong><span>{running?"息屏也会继续累计":"按开始后，时间会往上走"}</span></div></div><div className="timer-actions three"><button className="secondary" onClick={reset}>归零</button><button className="primary" onClick={toggleTimer}>{running?"暂停":"开始"}</button><button className="save-session" disabled={timer<1} onClick={finishTimer}>完成记录</button></div><button className="manual-study" onClick={()=>openStudy(null,todayKey)}>忘记计时？手动补记学习</button></section>
      <section className="card day-picker"><div><p className="kicker">DAILY PLAN</p><h2>{taskDay===todayKey?"今天的任务":"历史任务"}</h2><span>{taskDay===todayKey?"每天零点自动翻到新的一页":"以前的完成情况会一直保留"}</span></div><input type="date" value={taskDay} onChange={e=>setTaskDay(e.target.value)}/></section>
      <div className="section-title"><div><p className="kicker">MY STUDY PLAN</p><h2>{taskDay.slice(5).replace("-"," 月 ")} 日 · 四科计划</h2></div><span>{dayTasks.filter(t=>t.done).length}/{dayTasks.length} 项完成</span></div>
      <div className="plan-grid">{subjects.map(s=>{const list=dayTasks.filter(t=>t.subject===s.name);return <article className="plan-board" key={s.name} style={{"--accent":s.color} as React.CSSProperties}><div className="plan-head"><span><i>{s.short}</i><b>{s.name}</b></span><button onClick={()=>openTask(s.name,null,taskDay)}>＋ 写计划</button></div><div className="plan-list">{list.length?list.map(t=><div className={t.done?"plan-item done":"plan-item"} key={t.id}><button className="plan-check" onClick={()=>toggle(t.id)}>✓</button><span onClick={()=>openTask(s.name,t,t.date)}>{t.text}{t.minutes>0&&<small>预计 {t.minutes} 分钟</small>}</span><button className="edit" onClick={()=>openTask(s.name,t,t.date)}>改</button><button className="delete" onClick={()=>removeTask(t.id)}>删</button></div>):<p>这一天还没有计划，点右上角补一条。</p>}</div></article>})}</div>
      <section className="card list"><div className="card-head"><div><p className="kicker">STUDY LOG</p><h2>学习记录</h2></div><button className="text-btn" onClick={()=>openStudy(null,taskDay)}>＋ 补记</button></div>{sessions.length===0?<div className="empty">完成计时或手动补记后，会显示在这里。</div>:sessions.slice(0,12).map(s=><div className="record" key={s.id}><i style={{background:subjects.find(x=>x.name===s.subject)?.color}}>学</i><span><b>{s.subject} · {durationText(s.seconds)}</b><small>{s.date} · {s.note||"学习记录"}</small></span><div className="record-actions"><button onClick={()=>openStudy(s,s.date)}>修改</button><button className="danger" onClick={()=>askRemove("学习记录",()=>setSessions(v=>v.filter(x=>x.id!==s.id)))}>删除</button></div></div>)}</section>
    </div>}

    {tab==="money"&&<div className="page">
      <section className="card finance"><div><p className="kicker">DAILY SPENDING</p><h2>今天花了多少</h2><strong>¥ {todaySpend.toFixed(2)}</strong><span>记清楚就好，不需要为每一笔小钱焦虑。</span></div><button onClick={()=>openExpense()}>＋</button></section>
      <div className="stats"><article><small>本月支出</small><strong>¥ {expenses.filter(e=>e.date.slice(0,7)===iso().slice(0,7)).reduce((s,e)=>s+e.amount,0).toFixed(0)}</strong></article><article><small>记录笔数</small><strong>{expenses.length}</strong></article><article><small>日均支出</small><strong>¥ {(expenses.reduce((s,e)=>s+e.amount,0)/Math.max(1,new Set(expenses.map(e=>e.date)).size)).toFixed(0)}</strong></article></div>
      <section className="card list"><div className="card-head"><div><p className="kicker">RECENT</p><h2>全部账单</h2></div><button className="primary small" onClick={()=>openExpense()}>＋ 补记</button></div>{expenses.length===0?<div className="empty">还没有账单，第一笔从今天开始。</div>:expenses.map(e=><div className="record" key={e.id}><i>{e.category==="餐饮"?"☕":e.category==="学习"?"✎":"·"}</i><span><b>{e.note||e.category}</b><small>{e.date} · {e.category}</small></span><strong>- ¥{e.amount.toFixed(2)}</strong><div className="record-actions"><button onClick={()=>openExpense(e)}>修改</button><button className="danger" onClick={()=>askRemove("账单",()=>setExpenses(v=>v.filter(x=>x.id!==e.id)))}>删除</button></div></div>)}</section>
    </div>}

    {tab==="sport"&&<div className="page">
      <section className="card swim"><div className="waves"><i/><i/><i/></div><div><p className="kicker">KEEP MOVING</p><h2>游进自己的节奏里</h2><p>本周累计 <strong>{swim}</strong> 米 · {week.reduce((s,w)=>s+w.duration,0)} 分钟</p></div><button className="primary" onClick={()=>openWorkout()}>记录运动</button></section>
      <div className="stats"><article><small>本周次数</small><strong>{week.length}</strong></article><article><small>游泳距离</small><strong>{swim}m</strong></article><article><small>运动时长</small><strong>{week.reduce((s,w)=>s+w.duration,0)}′</strong></article></div>
      <section className="card list"><div className="card-head"><div><p className="kicker">ACTIVITY</p><h2>运动足迹</h2></div><button className="text-btn" onClick={()=>openWorkout()}>＋ 补记</button></div>{workouts.length===0?<div className="empty">下一次游完记在这里，距离不重要，出现就很棒。</div>:workouts.map(w=><div className="record" key={w.id}><i className="water">{w.type==="游泳"?"≈":"⌁"}</i><span><b>{w.type}{w.distance?` · ${w.distance} 米`:''}</b><small>{w.date} · {w.duration} 分钟 {w.note&&`· ${w.note}`}</small></span><strong>{w.duration}′</strong><div className="record-actions"><button onClick={()=>openWorkout(w)}>修改</button><button className="danger" onClick={()=>askRemove("运动记录",()=>setWorkouts(v=>v.filter(x=>x.id!==w.id)))}>删除</button></div></div>)}</section>
    </div>}

    {tab==="review"&&<div className="page review-page">
      <section className="card review-hero"><div><p className="kicker">MONTHLY REVIEW</p><h2>学习与生活月报</h2><p>把努力、运动和花销放在同一张图里看。</p></div><input aria-label="选择月份" type="month" value={reviewMonth} onChange={e=>{setReviewMonth(e.target.value);setSelectedDay(`${e.target.value}-01`)}}/></section>
      <div className="review-stats"><article><span className="stat-symbol amber">◷</span><small>学习总时长</small><strong>{durationText(monthStudySeconds)}</strong><em>{studyDates.size} 个学习日</em></article><article><span className="stat-symbol teal">≈</span><small>运动完成</small><strong>{monthWorkouts.length} 次</strong><em>{monthWorkouts.reduce((a,w)=>a+w.duration,0)} 分钟</em></article><article><span className="stat-symbol rose">↟</span><small>连续学习</small><strong>{streak} 天</strong><em>保持自己的节奏</em></article><article><span className="stat-symbol violet">¥</span><small>本月支出</small><strong>¥{monthExpenses.reduce((a,e)=>a+e.amount,0).toFixed(0)}</strong><em>{monthExpenses.length} 笔记录</em></article></div>
      <section className="card calendar-card"><div className="card-head"><div><p className="kicker">DAILY RHYTHM</p><h2>{year} 年 {month} 月</h2></div><button className="text-btn" onClick={()=>openStudy(null,selectedDay)}>＋ 补记学习</button></div><div className="weekdays">{["一","二","三","四","五","六","日"].map(x=><span key={x}>{x}</span>)}</div><div className="month-calendar">{calendarCells.map((day,i)=>{if(day===null)return <i className="blank" key={`b${i}`}/>;const date=`${reviewMonth}-${String(day).padStart(2,"0")}`;const study=sessions.filter(s=>s.date===date).reduce((a,s)=>a+s.seconds,0);const sports=workouts.filter(w=>w.date===date);const level=study===0?0:study<3600?1:study<10800?2:study<21600?3:4;return <button key={date} className={`${selectedDay===date?"selected ":""}level-${level}`} onClick={()=>setSelectedDay(date)}><b>{day}</b>{study>0&&<small>{durationText(study)}</small>}<span>{tasks.some(t=>t.date===date)&&<i className="task-dot"/>}{sports.length>0&&<i className="sport-dot"/>}{expenses.some(e=>e.date===date)&&<i className="money-dot"/>}</span></button>})}</div><div className="calendar-legend"><span><i className="study-dot"/>学习</span><span><i className="task-dot"/>任务</span><span><i className="sport-dot"/>运动</span><span><i className="money-dot"/>支出</span></div></section>
      <section className="card day-detail"><div className="card-head"><div><p className="kicker">DAY DETAIL</p><h2>{selectedDay.slice(5).replace("-"," 月 ")} 日</h2></div><span className="day-total">学习 {durationText(selectedSessions.reduce((a,s)=>a+s.seconds,0))}</span></div>{selectedSessions.length+selectedWorkouts.length+selectedExpenses.length+selectedTasks.length===0?<div className="empty compact">这一天还没有记录。</div>:<div className="day-lines">{selectedTasks.map(t=><div key={t.id}><i style={{background:subjects.find(x=>x.name===t.subject)?.color}}>任</i><span><b>{t.subject} · {t.done?"已完成":"未完成"}</b><small>{t.text}</small></span><div className="record-actions"><button onClick={()=>{setTaskDay(t.date);openTask(t.subject,t,t.date)}}>修改</button><button className="danger" onClick={()=>removeTask(t.id)}>删除</button></div></div>)}{selectedSessions.map(s=><div key={s.id}><i style={{background:subjects.find(x=>x.name===s.subject)?.color}}>学</i><span><b>{s.subject}</b><small>{s.note||"学习记录"}</small></span><strong>{durationText(s.seconds)}</strong><div className="record-actions"><button onClick={()=>openStudy(s,s.date)}>修改</button><button className="danger" onClick={()=>askRemove("学习记录",()=>setSessions(v=>v.filter(x=>x.id!==s.id)))}>删除</button></div></div>)}{selectedWorkouts.map(w=><div key={w.id}><i className="activity">动</i><span><b>{w.type}</b><small>{w.distance?`${w.distance} 米`:w.note||"运动记录"}</small></span><strong>{w.duration}m</strong><div className="record-actions"><button onClick={()=>openWorkout(w)}>修改</button><button className="danger" onClick={()=>askRemove("运动记录",()=>setWorkouts(v=>v.filter(x=>x.id!==w.id)))}>删除</button></div></div>)}{selectedExpenses.map(e=><div key={e.id}><i className="spend">¥</i><span><b>{e.note||e.category}</b><small>{e.category}</small></span><strong>¥{e.amount.toFixed(2)}</strong><div className="record-actions"><button onClick={()=>openExpense(e)}>修改</button><button className="danger" onClick={()=>askRemove("账单",()=>setExpenses(v=>v.filter(x=>x.id!==e.id)))}>删除</button></div></div>)}</div>}</section>
      <section className="card subject-breakdown"><div className="card-head"><div><p className="kicker">SUBJECT MIX</p><h2>四科学习分布</h2></div><button className="text-btn" onClick={()=>openStudy(null,selectedDay)}>手动补记</button></div><div className="subject-bars">{subjectTotals.map(s=><div key={s.subject}><span><b>{s.subject}</b><small>{durationText(s.seconds)}</small></span><i><b style={{width:`${s.seconds/maxSubject*100}%`,background:s.color}}/></i></div>)}</div></section>
      <section className="insight-card"><span>✦</span><div><b>{studyDates.size===0?"从第一条记录开始":"这个月已经留下了痕迹"}</b><p>{studyDates.size===0?"完成一次学习后点“完成记录”，月历会自动亮起来。":`你学习了 ${studyDates.size} 天，也运动了 ${monthWorkouts.length} 次。稳定比一天冲很久更珍贵。`}</p></div></section>
    </div>}

    {modal==="expense"&&<div className="backdrop" onClick={()=>{setEditingExpense(null);setModal(null)}}><form className="modal" onSubmit={saveExpense} onClick={e=>e.stopPropagation()}><div><h2>{editingExpense?"修改账单":"记一笔"}</h2><button type="button" onClick={()=>{setEditingExpense(null);setModal(null)}}>×</button></div><label>金额<input name="amount" type="number" step="0.01" required placeholder="0.00" defaultValue={editingExpense?.amount??""} autoFocus/></label><label>分类<select name="category" defaultValue={editingExpense?.category||"餐饮"}><option>餐饮</option><option>交通</option><option>学习</option><option>运动</option><option>购物</option><option>其他</option></select></label><label>备注<input name="note" placeholder="买了什么？" defaultValue={editingExpense?.note||""}/></label><label>日期<input name="date" type="date" defaultValue={editingExpense?.date||selectedDay||todayKey}/></label><button className="primary full">{editingExpense?"保存修改":"保存记录"}</button></form></div>}
    {modal==="workout"&&<div className="backdrop" onClick={()=>{setEditingWorkout(null);setModal(null)}}><form className="modal" onSubmit={saveWorkout} onClick={e=>e.stopPropagation()}><div><h2>{editingWorkout?"修改运动":"记录运动"}</h2><button type="button" onClick={()=>{setEditingWorkout(null);setModal(null)}}>×</button></div><label>运动<select name="type" defaultValue={editingWorkout?.type||"游泳"}><option>游泳</option><option>跑步</option><option>力量训练</option><option>散步</option></select></label><label>时长（分钟）<input name="duration" type="number" required placeholder="45" defaultValue={editingWorkout?.duration??""}/></label><label>距离（米）<input name="distance" type="number" placeholder="1000" defaultValue={editingWorkout?.distance||""}/></label><label>感受<input name="note" placeholder="今天状态怎么样？" defaultValue={editingWorkout?.note||""}/></label><label>日期<input name="date" type="date" defaultValue={editingWorkout?.date||selectedDay||todayKey}/></label><button className="primary full">{editingWorkout?"保存修改":"保存运动"}</button></form></div>}
    {modal==="task"&&<div className="backdrop" onClick={()=>{setEditingTask(null);setModal(null)}}><form className="modal" onSubmit={saveTask} onClick={e=>e.stopPropagation()}><div><h2>{editingTask?"修改计划":"写一条计划"}</h2><button type="button" onClick={()=>{setEditingTask(null);setModal(null)}}>×</button></div><label>科目<select name="subject" value={taskSubject} onChange={e=>setTaskSubject(e.target.value)}>{subjects.map(s=><option key={s.name}>{s.name}</option>)}</select></label><label>我要完成<input name="text" required defaultValue={editingTask?.text??""} placeholder="例如：完成概率论第三章错题" autoFocus/></label><label>预计用时（分钟，可不填）<input name="minutes" type="number" min="0" defaultValue={editingTask?.minutes||""} placeholder="60"/></label><label>任务日期<input name="date" type="date" defaultValue={editingTask?.date||taskDay}/></label><button className="primary full">{editingTask?"保存修改":"加入计划"}</button></form></div>}
    {modal==="study"&&<div className="backdrop" onClick={()=>{setEditingStudy(null);setModal(null)}}><form className="modal" onSubmit={saveStudy} onClick={e=>e.stopPropagation()}><div><h2>{editingStudy?"修改学习记录":"补记学习"}</h2><button type="button" onClick={()=>{setEditingStudy(null);setModal(null)}}>×</button></div><label>科目<select name="subject" defaultValue={editingStudy?.subject||focus}>{subjects.map(s=><option key={s.name}>{s.name}</option>)}</select></label><label>学习时长（分钟）<input name="minutes" type="number" min="1" required placeholder="90" defaultValue={editingStudy?Math.max(1,Math.round(editingStudy.seconds/60)):""} autoFocus/></label><label>学了什么<input name="note" placeholder="例如：概率论错题复盘" defaultValue={editingStudy?.note||""}/></label><label>日期<input name="date" type="date" defaultValue={editingStudy?.date||selectedDay||todayKey}/></label><button className="primary full">{editingStudy?"保存修改":"保存学习记录"}</button></form></div>}
    <footer><span>“不必一下子照亮整条路。”</span><small>数据自动保存在当前设备</small></footer>
  </main>
}
