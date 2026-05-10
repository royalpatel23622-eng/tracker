'use client';
import { useState, useEffect } from 'react';
import { getSessions, getStats } from '../lib/store';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';

const COLORS = { Physics:'#5BB3E8', Chemistry:'#5BD4A4', Maths:'#E8C85B', Revision:'#C882FF', 'Mock Test':'#FF7F7F', Freelance:'#FF9B7F', 'Editing+Coding':'#79D2E6', Other:'#B0B0B0' };

function weekData(sessions) {
  const now=new Date();
  return Array.from({length:7},(_,i)=>{
    const d=new Date(now); d.setDate(d.getDate()-(6-i));
    const ds=d.toDateString();
    const h=sessions.filter(s=>new Date(s.startTime).toDateString()===ds).reduce((a,s)=>a+(s.hours||0),0);
    return {day:['Su','Mo','Tu','We','Th','Fr','Sa'][d.getDay()], hours:parseFloat(h.toFixed(2))};
  });
}
function subjectBreakdown(sessions) {
  const t={};
  sessions.forEach(s=>{ if(s.subject) t[s.subject]=(t[s.subject]||0)+(s.hours||0); });
  return Object.entries(t).map(([name,value])=>({name,value:parseFloat(value.toFixed(2))}));
}

export default function AnalysisPage() {
  const [sessions,setSessions]=useState([]);
  const [stats,   setStats]   =useState(null);
  const [view,    setView]    =useState('week');

  useEffect(()=>{ setSessions(getSessions()); setStats(getStats()); },[]);
  if(!stats) return null;

  const filtered = view==='week'
    ? sessions.filter(s=>(Date.now()-new Date(s.startTime))/86400000<=7)
    : view==='month'
    ? sessions.filter(s=>{ const d=new Date(s.startTime); const n=new Date(); return d.getFullYear()===n.getFullYear()&&d.getMonth()===n.getMonth(); })
    : sessions;

  const totalH   = filtered.reduce((a,s)=>a+(s.hours||0),0);
  const days     = view==='week'?7:view==='month'?new Date().getDate():Math.max(1,Math.ceil((Date.now()-new Date(sessions[sessions.length-1]?.startTime||Date.now()))/(86400000)));
  const avgDaily = totalH/Math.max(1,days);
  const subjData = subjectBreakdown(filtered);
  const best     = [...subjData].sort((a,b)=>b.value-a.value)[0];
  const focusPct = filtered.length ? Math.round((filtered.filter(s=>s.mood==='focused').length/filtered.length)*100) : 0;

  const card = (e,v,l,sub,col) => (
    <div style={{background:'white',borderRadius:16,padding:14,boxShadow:'0 2px 10px rgba(0,0,0,0.06)',borderLeft:`4px solid ${col}`}}>
      <div style={{fontSize:22,marginBottom:4}}>{e}</div>
      <div style={{fontFamily:'Nunito',fontWeight:900,fontSize:18,color:'#2D2D2D'}}>{v}</div>
      <div style={{fontFamily:'Nunito',fontWeight:700,fontSize:12,color:'#5D5D5D'}}>{l}</div>
      {sub&&<div style={{fontSize:11,color:'#9D9D9D'}}>{sub}</div>}
    </div>
  );

  const TT = {contentStyle:{borderRadius:12,border:'none',boxShadow:'0 4px 12px rgba(0,0,0,0.1)',fontFamily:'Nunito'},formatter:v=>[`${v}h`,'']};

  return (
    <div style={{padding:16}}>
      <div style={{fontFamily:'Nunito',fontWeight:900,fontSize:22,color:'#2D2D2D',marginBottom:3}}>📊 Analysis</div>
      <div style={{fontSize:13,color:'#9D9D9D',marginBottom:14}}>Your study trends & insights</div>

      {/* Period tabs */}
      <div style={{display:'flex',gap:8,marginBottom:14}}>
        {[['week','This Week'],['month','This Month'],['all','All Time']].map(([v,l])=>(
          <button key={v} onClick={()=>setView(v)} style={{
            flex:1,padding:'9px',borderRadius:12,border:'none',cursor:'pointer',
            fontFamily:'Nunito',fontWeight:700,fontSize:12,
            background:view===v?'#FF7F7F':'white',color:view===v?'white':'#7D7D7D',
            boxShadow:'0 2px 8px rgba(0,0,0,0.06)',
          }}>{l}</button>
        ))}
      </div>

      {/* Insight cards */}
      <div style={{display:'grid',gridTemplateColumns:'repeat(2,1fr)',gap:10,marginBottom:14}}>
        {card('⏱️',`${totalH.toFixed(1)}h`,'Total Study',`${filtered.length} sessions`,'#FFD6D6')}
        {card('📅',`${avgDaily.toFixed(1)}h`,'Daily Avg','hours/day','#C8F0D8')}
        {card('🎯',`${focusPct}%`,'Focus Rate',`focused sessions`,'#C8E8FF')}
        {card('🏆',best?.name||'—','Best Subject',best?`${best.value.toFixed(1)}h`:'start studying!','#E8D6FF')}
      </div>

      {/* Weekly bar chart */}
      <div style={{background:'white',borderRadius:20,padding:16,marginBottom:14,boxShadow:'0 2px 12px rgba(0,0,0,0.06)'}}>
        <div style={{fontFamily:'Nunito',fontWeight:800,fontSize:15,color:'#2D2D2D',marginBottom:12}}>📈 Last 7 Days</div>
        <ResponsiveContainer width="100%" height={150}>
          <BarChart data={weekData(sessions)} margin={{top:0,right:8,left:-20,bottom:0}}>
            <XAxis dataKey="day" tick={{fontSize:11,fontFamily:'Nunito',fill:'#9D9D9D'}} axisLine={false} tickLine={false}/>
            <YAxis tick={{fontSize:10,fill:'#9D9D9D'}} axisLine={false} tickLine={false}/>
            <Tooltip {...TT}/>
            <Bar dataKey="hours" radius={[8,8,0,0]} fill="#FF7F7F"/>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Subject pie */}
      {subjData.length>0&&(
        <div style={{background:'white',borderRadius:20,padding:16,marginBottom:14,boxShadow:'0 2px 12px rgba(0,0,0,0.06)'}}>
          <div style={{fontFamily:'Nunito',fontWeight:800,fontSize:15,color:'#2D2D2D',marginBottom:12}}>🥧 Subject Breakdown</div>
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie data={subjData} dataKey="value" cx="50%" cy="50%" outerRadius={70}>
                {subjData.map((e,i)=><Cell key={i} fill={COLORS[e.name]||'#B0B0B0'}/>)}
              </Pie>
              <Tooltip {...TT}/>
            </PieChart>
          </ResponsiveContainer>
          <div style={{display:'flex',flexWrap:'wrap',gap:8,marginTop:8,justifyContent:'center'}}>
            {subjData.map(s=>(
              <div key={s.name} style={{display:'flex',alignItems:'center',gap:5,fontSize:12,fontFamily:'Nunito',fontWeight:700}}>
                <div style={{width:10,height:10,borderRadius:5,background:COLORS[s.name]||'#B0B0B0'}}/>
                {s.name} {s.value.toFixed(1)}h
              </div>
            ))}
          </div>
        </div>
      )}

      {/* All-time records */}
      <div style={{background:'linear-gradient(135deg,#FFF3C8,#FFE4C8)',borderRadius:20,padding:16,marginBottom:14}}>
        <div style={{fontFamily:'Nunito',fontWeight:800,fontSize:15,color:'#2D2D2D',marginBottom:12}}>🏆 All-Time Records</div>
        {[
          {e:'📚',l:'Total Study Hours',v:`${(stats.totalHours||0).toFixed(1)}h`},
          {e:'🔥',l:'Longest Streak',v:`${stats.longestStreak||0} days`},
          {e:'📝',l:'Mock Tests',v:stats.mockTests||0},
          {e:'🎬',l:'Freelance Hours',v:`${(stats.freelanceHours||0).toFixed(1)}h`},
          {e:'✨',l:'Total XP',v:`${stats.xp||0} XP`},
        ].map(r=>(
          <div key={r.l} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'7px 0',borderBottom:'1px solid rgba(255,255,255,0.5)'}}>
            <span style={{fontSize:13,color:'#5D5D5D'}}>{r.e} {r.l}</span>
            <span style={{fontFamily:'Nunito',fontWeight:800,fontSize:15,color:'#2D2D2D'}}>{r.v}</span>
          </div>
        ))}
      </div>
      <div style={{height:16}}/>
    </div>
  );
}
