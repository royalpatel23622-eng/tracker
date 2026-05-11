'use client';
import { useState, useEffect } from 'react';
import { cancelMissedAlert, scheduleAll } from './NotificationEngine';
import { getTimetable, saveTimetable, getDayDone, toggleDone, to12h } from '../lib/store';

const DN  = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
const TM  = {
  sleep:    { color:'#E8D6FF', emoji:'😴', label:'Sleep'    },
  class:    { color:'#C8E8FF', emoji:'📚', label:'Class'    },
  study:    { color:'#C8F0D8', emoji:'🔬', label:'Study'    },
  work:     { color:'#FFD6D6', emoji:'🎬', label:'Work'     },
  meal:     { color:'#FFE4C8', emoji:'🍽️', label:'Meal'     },
  personal: { color:'#FFF3C8', emoji:'🌟', label:'Personal' },
  break:    { color:'#DCFCE7', emoji:'☕', label:'Break'    },
};
const BLANK = { label:'', start:'09:00', end:'10:00', type:'study', days:[1,2,3,4,5], subject:'' };
function toMin(t){ if(t==='24:00')return 1440; const[h,m]=t.split(':').map(Number); return h*60+m; }
function dur(s,e){ const d=toMin(e)-toMin(s); return d>=60?`${Math.floor(d/60)}h${d%60?` ${d%60}m`:''}`:d>0?`${d}m`:'—'; }

export default function SchedulePage({ toast }) {
  const [tt,      setTt]      = useState([]);
  const [day,     setDay]     = useState(new Date().getDay());
  const [done,    setDone]    = useState([]);
  const [editing, setEditing] = useState(null);
  const [adding,  setAdding]  = useState(false);
  const [nb,      setNb]      = useState(BLANK);
  const TODAY = new Date().toDateString();

  useEffect(() => { setTt(getTimetable()); setDone(getDayDone(TODAY)); }, []);

  const save = (updated, msg='✅ Saved!') => { setTt(updated); saveTimetable(updated); toast(msg,'success'); };

  const handleTick = (block) => {
    const list = toggleDone(block.id, TODAY);
    cancelMissedAlert(block.id);
    scheduleAll();
    setDone(list);
    toast(list.includes(block.id) ? `✅ ${block.label} done!` : '↩️ Unmarked', list.includes(block.id)?'success':'info');
  };

  const blocks = tt.filter(b=>b.days.includes(day)).sort((a,b)=>toMin(a.start)-toMin(b.start));
  const mins   = new Date().getHours()*60+new Date().getMinutes();
  const trackable = blocks.filter(b=>b.type!=='sleep');
  const doneCnt   = trackable.filter(b=>done.includes(b.id)).length;

  // totals for summary
  const studyH = blocks.filter(b=>b.type==='study').reduce((a,b)=>a+(toMin(b.end)-toMin(b.start))/60,0);
  const workH  = blocks.filter(b=>b.type==='work' ).reduce((a,b)=>a+(toMin(b.end)-toMin(b.start))/60,0);
  const sleepH = blocks.filter(b=>b.type==='sleep').reduce((a,b)=>a+(toMin(b.end)-toMin(b.start))/60,0);

  return (
    <div style={{ padding:16 }}>
      <div style={{ fontFamily:'Nunito', fontWeight:900, fontSize:22, color:'#2D2D2D', marginBottom:3 }}>📅 Schedule</div>
      <div style={{ fontSize:13, color:'#9D9D9D', marginBottom:12 }}>Tap ⬜ to tick. Tap ✏️ to edit. Tap ➕ to add.</div>

      {/* Day tabs */}
      <div style={{ display:'flex', gap:6, marginBottom:12, overflowX:'auto', paddingBottom:4 }}>
        {DN.map((d,i) => (
          <button key={i} onClick={()=>setDay(i)} style={{
            flexShrink:0, padding:'7px 14px', borderRadius:12, border:'none', cursor:'pointer',
            fontFamily:'Nunito', fontWeight:700, fontSize:13,
            background: day===i ? '#FF7F7F' : 'white', color: day===i ? 'white' : '#5D5D5D',
            boxShadow:'0 2px 8px rgba(0,0,0,0.06)',
          }}>{d}</button>
        ))}
      </div>

      {/* Summary pills */}
      <div style={{ display:'flex', gap:7, marginBottom:12, flexWrap:'wrap' }}>
        {[
          {e:'✅', v:`${doneCnt}/${trackable.length}`, l:'Done'},
          {e:'📖', v:`${studyH.toFixed(1)}h`,         l:'Study'},
          {e:'🎬', v:`${workH.toFixed(1)}h`,           l:'Work'},
          {e:'😴', v:`${sleepH.toFixed(1)}h`,          l:'Sleep'},
        ].map(s=>(
          <div key={s.l} style={{ background:'white', borderRadius:12, padding:'7px 12px', boxShadow:'0 2px 8px rgba(0,0,0,0.05)', display:'flex', gap:5, alignItems:'center' }}>
            <span style={{fontSize:15}}>{s.e}</span>
            <span style={{fontFamily:'Nunito',fontWeight:800,fontSize:13}}>{s.v}</span>
            <span style={{fontSize:11,color:'#9D9D9D'}}>{s.l}</span>
          </div>
        ))}
      </div>

      {/* Add button */}
      <button onClick={()=>setAdding(true)} style={{
        width:'100%', padding:11, borderRadius:14, border:'2px dashed #FFB0B0',
        background:'rgba(255,127,127,0.05)', cursor:'pointer', marginBottom:10,
        fontFamily:'Nunito', fontWeight:700, fontSize:14, color:'#FF7F7F',
        display:'flex', alignItems:'center', justifyContent:'center', gap:6,
      }}>➕ Add Block</button>

      {/* Blocks */}
      {blocks.length===0
        ? <div style={{background:'white',borderRadius:16,padding:28,textAlign:'center',color:'#9D9D9D'}}>No blocks for {DN[day]}. Add one!</div>
        : <div style={{display:'flex',flexDirection:'column',gap:8}}>
            {blocks.map(block=>{
              const m   = TM[block.type]||TM.personal;
              const isDone = done.includes(block.id);
              const active = toMin(block.start)<=mins && mins<toMin(block.end);
              const past   = toMin(block.end)<mins;
              const canTick = block.type!=='sleep';
              return (
                <div key={block.id} style={{
                  background: isDone?'#F0FFF8':'white',
                  borderRadius:16, padding:'12px 14px',
                  display:'flex', alignItems:'center', gap:10,
                  boxShadow:'0 2px 10px rgba(0,0,0,0.05)',
                  borderLeft:`5px solid ${block.color||m.color}`,
                  border: active?`2px solid ${block.color||m.color}`:isDone?'2px solid #5BD4A4':'2px solid transparent',
                  borderLeft:`5px solid ${block.color||m.color}`,
                  opacity: past&&!isDone&&day===new Date().getDay()?0.6:1,
                  transition:'all 0.2s',
                }}>
                  <span style={{fontSize:22,flexShrink:0}}>{m.emoji}</span>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{
                      fontFamily:'Nunito',fontWeight:800,fontSize:14,
                      color:isDone?'#3D9D6D':'#2D2D2D',
                      textDecoration:isDone?'line-through':'none',
                      overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap',
                    }}>{block.label}</div>
                    <div style={{fontSize:11,color:'#9D9D9D',display:'flex',gap:8,flexWrap:'wrap',marginTop:2}}>
                      <span>{to12h(block.start)}–{to12h(block.end)}</span>
                      <span>{dur(block.start,block.end)}</span>
                      {block.subject&&<span>📘 {block.subject}</span>}
                    </div>
                    {active&&<div style={{fontSize:11,color:'#FF7F7F',fontFamily:'Nunito',fontWeight:700,marginTop:2}}>● In progress</div>}
                  </div>
                  <div style={{display:'flex',flexDirection:'column',gap:4,flexShrink:0}}>
                    {canTick&&(
                      <button onClick={()=>handleTick(block)} style={{
                        width:36,height:36,borderRadius:18,border:'none',cursor:'pointer',
                        background:isDone?'#4ECDC4':'#F5F5F5',fontSize:17,
                        display:'flex',alignItems:'center',justifyContent:'center',
                        boxShadow:isDone?'0 2px 8px rgba(78,205,196,0.4)':'none',transition:'all 0.2s',
                      }}>{isDone?'✅':'⬜'}</button>
                    )}
                    <button onClick={()=>setEditing({...block})} style={{width:36,height:36,borderRadius:10,border:'none',cursor:'pointer',background:'#F5F5F5',fontSize:14,display:'flex',alignItems:'center',justifyContent:'center'}}>✏️</button>
                    <button onClick={()=>{if(confirm('Delete this block?'))save(tt.filter(b=>b.id!==block.id),'🗑️ Deleted');}} style={{width:36,height:36,borderRadius:10,border:'none',cursor:'pointer',background:'#FFF0F0',fontSize:14,display:'flex',alignItems:'center',justifyContent:'center'}}>🗑️</button>
                  </div>
                </div>
              );
            })}
          </div>
      }

      {/* Weekly heat map */}
      <div style={{marginTop:20,background:'white',borderRadius:18,padding:14,boxShadow:'0 2px 12px rgba(0,0,0,0.06)'}}>
        <div style={{fontFamily:'Nunito',fontWeight:800,fontSize:14,marginBottom:10}}>📊 Weekly Study Hours</div>
        <div style={{display:'flex',gap:4}}>
          {DN.map((_,i)=>{
            const h=tt.filter(b=>b.days.includes(i)&&b.type==='study').reduce((a,b)=>a+(toMin(b.end)-toMin(b.start))/60,0);
            const bg=h>=6?'#4ECDC4':h>=4?'#C8F0D8':h>=2?'#FFF3C8':h>0?'#FFD6D6':'#F5F5F5';
            return(
              <div key={i} style={{flex:1,textAlign:'center'}}>
                <div style={{fontSize:10,fontFamily:'Nunito',fontWeight:700,color:'#9D9D9D',marginBottom:4}}>{DN[i]}</div>
                <div style={{background:bg,borderRadius:8,padding:'6px 2px',fontFamily:'Nunito',fontWeight:800,fontSize:12}}>{h>0?`${h.toFixed(0)}h`:'—'}</div>
              </div>
            );
          })}
        </div>
      </div>

      {editing&&<Modal title="✏️ Edit Block" block={editing} setBlock={setEditing}
        onSave={()=>{if(!editing.label){toast('⚠️ Add label','error');return;} save(tt.map(b=>b.id===editing.id?editing:b)); setEditing(null);}}
        onClose={()=>setEditing(null)} />}
      {adding&&<Modal title="➕ Add Block" block={nb} setBlock={setNb}
        onSave={()=>{if(!nb.label){toast('⚠️ Add label','error');return;} save([...tt,{...nb,id:`c_${Date.now()}`,color:TM[nb.type]?.color||'#C8F0D8'}]); setAdding(false); setNb(BLANK);}}
        onClose={()=>setAdding(false)} />}
      <div style={{height:16}}/>
    </div>
  );
}

function Modal({ title, block, setBlock, onSave, onClose }) {
  const inp = { width:'100%',padding:'10px 14px',borderRadius:12,border:'1.5px solid #E8E8E8',fontFamily:'DM Sans',fontSize:14,outline:'none',boxSizing:'border-box' };
  return (
    <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.4)',zIndex:100,display:'flex',alignItems:'flex-end',justifyContent:'center'}} onClick={onClose}>
      <div style={{background:'white',borderRadius:'24px 24px 0 0',padding:'20px 20px 30px',width:'100%',maxWidth:480,maxHeight:'85vh',overflowY:'auto'}} onClick={e=>e.stopPropagation()}>
        <div style={{fontFamily:'Nunito',fontWeight:900,fontSize:20,marginBottom:16}}>{title}</div>
        {[{l:'Label',k:'label',t:'text',p:'e.g. 📐 Maths Study'},{l:'Start',k:'start',t:'time'},{l:'End',k:'end',t:'time'},{l:'Subject (opt.)',k:'subject',t:'text',p:'Physics...'}].map(f=>(
          <div key={f.k} style={{marginBottom:12}}>
            <label style={{display:'block',fontFamily:'Nunito',fontWeight:700,fontSize:13,color:'#5D5D5D',marginBottom:4}}>{f.l}</label>
            <input type={f.t} value={block[f.k]||''} placeholder={f.p||''} onChange={e=>setBlock(b=>({...b,[f.k]:e.target.value}))} style={inp}/>
          </div>
        ))}
        <div style={{marginBottom:12}}>
          <label style={{display:'block',fontFamily:'Nunito',fontWeight:700,fontSize:13,color:'#5D5D5D',marginBottom:4}}>Type</label>
          <select value={block.type} onChange={e=>setBlock(b=>({...b,type:e.target.value}))} style={{...inp,cursor:'pointer'}}>
            {Object.entries({sleep:'😴 Sleep',class:'📚 Class',study:'🔬 Study',work:'🎬 Work',meal:'🍽️ Meal',personal:'🌟 Personal',break:'☕ Break'}).map(([k,v])=><option key={k} value={k}>{v}</option>)}
          </select>
        </div>
        <div style={{marginBottom:16}}>
          <label style={{display:'block',fontFamily:'Nunito',fontWeight:700,fontSize:13,color:'#5D5D5D',marginBottom:6}}>Days</label>
          <div style={{display:'flex',gap:5,flexWrap:'wrap'}}>
            {['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map((d,i)=>(
              <button key={i} onClick={()=>setBlock(b=>({...b,days:b.days.includes(i)?b.days.filter(x=>x!==i):[...b.days,i]}))}
                style={{padding:'6px 11px',borderRadius:10,border:'none',cursor:'pointer',fontFamily:'Nunito',fontWeight:700,fontSize:12,
                  background:block.days.includes(i)?'#FF7F7F':'#F0F0F0',color:block.days.includes(i)?'white':'#5D5D5D'}}>{d}</button>
            ))}
          </div>
        </div>
        <div style={{display:'flex',gap:8}}>
          <button onClick={onClose} style={{flex:1,padding:12,borderRadius:14,border:'none',background:'#F0F0F0',fontFamily:'Nunito',fontWeight:700,fontSize:14,cursor:'pointer'}}>Cancel</button>
          <button onClick={onSave}  style={{flex:2,padding:12,borderRadius:14,border:'none',background:'#FF7F7F',color:'white',fontFamily:'Nunito',fontWeight:700,fontSize:14,cursor:'pointer'}}>Save ✓</button>
        </div>
      </div>
    </div>
  );
}
