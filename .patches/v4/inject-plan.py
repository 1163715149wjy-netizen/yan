from pathlib import Path

p=Path('src/App.tsx')
s=p.read_text(encoding='utf-8')

marker='export default function Home(){'
plan=r'''const FOUR_WEEK_PLAN:{date:string;items:{subject:Subject;text:string}[]}[]=[
{date:"2026-09-17",items:[{subject:"数学一",text:"强化：当前章节继续推进 + 对应习题（3.5~4h）"},{subject:"自动控制原理",text:"851：第1~2讲起步，累计约2.5h原视频进度 + 基础题"},{subject:"英语一",text:"单词40min + 真题阅读1篇精读"},{subject:"政治",text:"徐涛强化课约1h + 对应肖1000"}]},
{date:"2026-09-18",items:[{subject:"数学一",text:"强化：当前章节 + 对应习题，整理昨日错题"},{subject:"自动控制原理",text:"851：数学模型、拉氏变换、传递函数方向推进约2.5h原视频"},{subject:"英语一",text:"单词40min + 真题阅读1篇精读"},{subject:"政治",text:"徐涛强化课 + 对应肖1000"}]},
{date:"2026-09-19",items:[{subject:"数学一",text:"强化：当前章节做题为主（≥3.5h）"},{subject:"自动控制原理",text:"851：典型环节、结构图方向推进约2.5h原视频 + 结构图题"},{subject:"英语一",text:"单词 + 真题阅读1篇"},{subject:"政治",text:"徐涛强化课 + 对应肖1000"}]},
{date:"2026-09-20",items:[{subject:"数学一",text:"强化：当前章节 + 计算训练"},{subject:"自动控制原理",text:"851：Mason公式方向推进 + 结构图/Mason专项题"},{subject:"英语一",text:"单词 + 阅读1篇精读"},{subject:"政治",text:"徐涛强化课 + 肖1000"}]},
{date:"2026-09-21",items:[{subject:"数学一",text:"强化：当前章节 + 对应习题"},{subject:"自动控制原理",text:"851：一阶、二阶系统方向推进约2.5h原视频 + 典型题"},{subject:"英语一",text:"单词 + 阅读1篇"},{subject:"政治",text:"徐涛强化课 + 肖1000"}]},
{date:"2026-09-22",items:[{subject:"数学一",text:"强化：做题为主 + 错题回补"},{subject:"自动控制原理",text:"851：二阶动态性能、Routh判据方向推进 + 计算题"},{subject:"英语一",text:"单词 + 阅读1篇精读"},{subject:"政治",text:"徐涛强化课 + 肖1000"}]},
{date:"2026-09-23",items:[{subject:"数学一",text:"本周数学复盘：补欠账 + 错题"},{subject:"自动控制原理",text:"851缓冲复习：稳态误差 + 第1周内容查漏补缺"},{subject:"英语一",text:"单词 + 本周阅读错题回看"},{subject:"政治",text:"本周政治复盘/补课，肖1000错题回看"}]},
{date:"2026-09-24",items:[{subject:"数学一",text:"强化收尾推进 + 对应习题"},{subject:"自动控制原理",text:"851：动态误差、根轨迹基本概念方向推进"},{subject:"英语一",text:"单词 + 阅读1篇"},{subject:"政治",text:"徐涛强化课 + 肖1000"}]},
{date:"2026-09-25",items:[{subject:"数学一",text:"强化收尾：当前薄弱章节 + 做题"},{subject:"自动控制原理",text:"851：根轨迹绘制、广义根轨迹方向推进 + 绘图题"},{subject:"英语一",text:"单词 + 阅读1篇精读"},{subject:"政治",text:"徐涛强化课 + 肖1000"}]},
{date:"2026-09-26",items:[{subject:"数学一",text:"强化做题 ≥3.5h"},{subject:"自动控制原理",text:"851：根轨迹分析性能 + 根轨迹专题题"},{subject:"英语一",text:"单词 + 阅读1篇"},{subject:"政治",text:"徐涛强化课 + 肖1000"}]},
{date:"2026-09-27",items:[{subject:"数学一",text:"强化收尾 + 错题"},{subject:"自动控制原理",text:"851：频率特性、Nyquist图方向推进约2.5h原视频"},{subject:"英语一",text:"单词 + 阅读1篇精读"},{subject:"政治",text:"徐涛强化课 + 肖1000"}]},
{date:"2026-09-28",items:[{subject:"数学一",text:"强化收尾 + 对应习题"},{subject:"自动控制原理",text:"851：Bode图方向推进约2.5h原视频 + 绘图题"},{subject:"英语一",text:"单词 + 阅读1篇"},{subject:"政治",text:"徐涛强化课 + 肖1000"}]},
{date:"2026-09-29",items:[{subject:"数学一",text:"强化收尾：重点薄弱点回补"},{subject:"自动控制原理",text:"851：Nyquist稳定判据方向推进 + 判稳题"},{subject:"英语一",text:"单词 + 阅读1篇精读"},{subject:"政治",text:"徐涛强化课 + 肖1000"}]},
{date:"2026-09-30",items:[{subject:"数学一",text:"9月强化总结：整理10月真题前薄弱清单"},{subject:"自动控制原理",text:"851缓冲复习：稳定裕度 + 根轨迹/频域查漏补缺"},{subject:"英语一",text:"单词 + 9月阅读错题回看"},{subject:"政治",text:"政治进度复盘 + 肖1000错题"}]},
{date:"2026-10-01",items:[{subject:"数学一",text:"开始真题：真题训练约2~2.5h + 订正1~1.5h"},{subject:"自动控制原理",text:"851：开环频率特性分析；Nichols低优先级选择听"},{subject:"英语一",text:"单词 + 真题阅读1篇"},{subject:"政治",text:"徐涛强化课 + 肖1000"}]},
{date:"2026-10-02",items:[{subject:"数学一",text:"真题训练 + 逐题订正，标注错因"},{subject:"自动控制原理",text:"851：串联超前校正 + 对应计算题"},{subject:"英语一",text:"单词 + 阅读1篇精读"},{subject:"政治",text:"徐涛强化课 + 肖1000"}]},
{date:"2026-10-03",items:[{subject:"数学一",text:"真题训练 + 订正回补知识点"},{subject:"自动控制原理",text:"851：串联滞后校正 + 对应计算题"},{subject:"英语一",text:"单词 + 阅读1篇"},{subject:"政治",text:"徐涛强化课 + 肖1000"}]},
{date:"2026-10-04",items:[{subject:"数学一",text:"真题训练 + 订正"},{subject:"自动控制原理",text:"851：滞后-超前、PID + 校正总结"},{subject:"英语一",text:"单词 + 阅读1篇精读"},{subject:"政治",text:"徐涛强化课 + 肖1000"}]},
{date:"2026-10-05",items:[{subject:"数学一",text:"真题训练 + 错题分类"},{subject:"自动控制原理",text:"851：采样保持、Z变换方向推进约2.5h原视频"},{subject:"英语一",text:"单词 + 阅读1篇"},{subject:"政治",text:"徐涛强化课 + 肖1000"}]},
{date:"2026-10-06",items:[{subject:"数学一",text:"真题训练 + 订正"},{subject:"自动控制原理",text:"851：离散系统数学模型、稳定性分析"},{subject:"英语一",text:"单词 + 阅读1篇精读"},{subject:"政治",text:"徐涛强化课 + 肖1000"}]},
{date:"2026-10-07",items:[{subject:"数学一",text:"本周真题复盘 + 补薄弱知识点"},{subject:"自动控制原理",text:"851缓冲复习：离散稳态误差/动态性能 + 本周查漏"},{subject:"英语一",text:"单词 + 本周阅读错题回看"},{subject:"政治",text:"补课/肖1000错题回看"}]},
{date:"2026-10-08",items:[{subject:"数学一",text:"真题训练 + 订正"},{subject:"自动控制原理",text:"851：跳过第34讲离散校正；相平面法上"},{subject:"英语一",text:"单词 + 阅读1篇"},{subject:"政治",text:"徐涛强化课 + 肖1000"}]},
{date:"2026-10-09",items:[{subject:"数学一",text:"真题训练 + 订正"},{subject:"自动控制原理",text:"851：相平面法下 + 对应分析题"},{subject:"英语一",text:"单词 + 阅读1篇精读"},{subject:"政治",text:"徐涛强化课 + 肖1000"}]},
{date:"2026-10-10",items:[{subject:"数学一",text:"真题训练 + 薄弱点回补"},{subject:"自动控制原理",text:"851：描述函数法上 + 基础题"},{subject:"英语一",text:"单词 + 阅读1篇"},{subject:"政治",text:"徐涛强化课 + 肖1000"}]},
{date:"2026-10-11",items:[{subject:"数学一",text:"真题训练 + 订正"},{subject:"自动控制原理",text:"851：描述函数法下；改善非线性性能低优先级"},{subject:"英语一",text:"单词 + 阅读1篇精读"},{subject:"政治",text:"徐涛强化课 + 肖1000"}]},
{date:"2026-10-12",items:[{subject:"数学一",text:"真题训练 + 订正"},{subject:"自动控制原理",text:"851一轮复习：数学模型、时域、根轨迹"},{subject:"英语一",text:"单词 + 阅读1篇"},{subject:"政治",text:"徐涛强化课 + 肖1000"}]},
{date:"2026-10-13",items:[{subject:"数学一",text:"真题训练 + 订正"},{subject:"自动控制原理",text:"851一轮复习：频域 + 超前/滞后/PID校正"},{subject:"英语一",text:"单词 + 阅读1篇精读"},{subject:"政治",text:"徐涛强化课 + 肖1000"}]},
{date:"2026-10-14",items:[{subject:"数学一",text:"本周真题复盘 + 错题回补"},{subject:"自动控制原理",text:"851一轮收官：离散 + 非线性；39~40按薄弱点选择复习"},{subject:"英语一",text:"单词 + 四周阅读错题回顾"},{subject:"政治",text:"四周政治复盘 + 肖1000错题回看"}]}
];
'''
if 'const FOUR_WEEK_PLAN:' not in s:
    s=s.replace(marker,plan+'\n'+marker)

hook='  const [tasks,setTasks]=useSaved<Task[]>("kaoyan.tasks.v4",taskMigration);'
inject=r'''  const [tasks,setTasks]=useSaved<Task[]>("kaoyan.tasks.v4",taskMigration);
  useEffect(()=>{
    const flag="kaoyan.plan.20260917.v1";
    if(localStorage.getItem(flag))return;
    setTasks(old=>{
      const existing=new Set(old.map(x=>`${x.date}|${x.subject}|${x.text}`));
      const seeded:Task[]=[];
      FOUR_WEEK_PLAN.forEach((day,di)=>day.items.forEach((item,ii)=>{
        const key=`${day.date}|${item.subject}|${item.text}`;
        if(!existing.has(key))seeded.push({id:202609170000+di*10+ii,subject:item.subject,text:item.text,date:day.date,done:false});
      }));
      return [...seeded,...old];
    });
    localStorage.setItem(flag,"1");
  },[]);'''
if 'kaoyan.plan.20260917.v1' not in s:
    if hook not in s: raise SystemExit('task hook marker not found')
    s=s.replace(hook,inject)

p.write_text(s,encoding='utf-8')
print('28-day plan injected')
