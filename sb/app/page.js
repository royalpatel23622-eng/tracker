'use client';
import { useState, useEffect, useCallback } from 'react';
import Dashboard            from '../components/Dashboard';
import SchedulePage         from '../components/SchedulePage';
import TrackerPage          from '../components/TrackerPage';
import NotificationEngine   from '../components/NotificationEngine';
import BadgesPage    from '../components/BadgesPage';
import AnalysisPage  from '../components/AnalysisPage';
import SettingsModal from '../components/SettingsModal';
import { checkAchievements, saveStats, getSettings, sendTelegram } from '../lib/store';

const TABS = [
  { id:'home',     emoji:'🏠', label:'Home'     },
  { id:'schedule', emoji:'📅', label:'Schedule' },
  { id:'tracker',  emoji:'⏱️', label:'Track'    },
  { id:'badges',   emoji:'🏆', label:'Badges'   },
  { id:'analysis', emoji:'📊', label:'Analysis' },
];

export default function App() {
  const [tab,         setTab]         = useState('home');
  const [showSettings,setShowSettings]= useState(false);
  const [toasts,      setToasts]      = useState([]);

  // ── Register service worker ──────────────────────────────
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(() => {});
    }
  }, []);

  // ── Toast system ─────────────────────────────────────────
  const toast = useCallback((msg, type='info', ms=3500) => {
    const id = Date.now() + Math.random();
    setToasts(t => [...t, { id, msg, type }]);
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), ms);
  }, []);

  // ── Achievement checker called from children ─────────────
  const checkAndNotify = useCallback(async (stats) => {
    const newOnes = checkAchievements(stats);
    if (!newOnes.length) return;
    newOnes.forEach(a => toast(`${a.emoji} ${a.title} unlocked! +${a.xp} XP`, 'achievement', 5000));
    const cfg = getSettings();
    if (cfg.telegramBotToken && cfg.telegramChatId) {
      for (const a of newOnes) {
        try {
          await sendTelegram(cfg.telegramBotToken, cfg.telegramChatId,
            `🏆 *Achievement Unlocked!*\n\n${a.emoji} *${a.title}*\n_${a.desc}_\n\n+${a.xp} XP, ${cfg.userName}! 🎉`
          );
        } catch {}
      }
    }
  }, [toast]);

  const shared = { toast, checkAndNotify };

  const TOAST_COLORS = {
    success:     ['#C8F0D8','#2D7D4D','#5BD4A4'],
    error:       ['#FFD6D6','#7D2D2D','#FF7F7F'],
    info:        ['#C8E8FF','#2D4D7D','#5BB3E8'],
    achievement: ['#FFF3C8','#7D5D1D','#E8C85B'],
  };

  return (
    <div style={{ minHeight:'100dvh', display:'flex', flexDirection:'column', background:'#FFF8F0' }}>

      {/* ── Header ───────────────────────────────────────── */}
      <header style={{
        position:'sticky', top:0, zIndex:40,
        background:'rgba(255,248,240,0.9)', backdropFilter:'blur(12px)',
        borderBottom:'1px solid rgba(0,0,0,0.06)',
        padding:'12px 18px', display:'flex', alignItems:'center', justifyContent:'space-between',
      }}>
        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
          <span style={{ fontSize:28 }}>📖</span>
          <div>
            <div style={{ fontFamily:'Nunito', fontWeight:900, fontSize:18, color:'#FF7F7F', lineHeight:1 }}>StudyBuddy</div>
            <div style={{ fontSize:11, color:'#9D9D9D' }}>Study Tracker</div>
          </div>
        </div>
        <button onClick={() => setShowSettings(true)} style={{
          width:38, height:38, borderRadius:12, border:'none',
          background:'#F5F5F5', cursor:'pointer', fontSize:18,
          display:'flex', alignItems:'center', justifyContent:'center',
        }}>⚙️</button>
      </header>

      {/* ── Main ─────────────────────────────────────────── */}
      <main style={{ flex:1, overflowY:'auto', paddingBottom:72 }}>
        {tab==='home'     && <Dashboard    {...shared} />}
        {tab==='schedule' && <SchedulePage {...shared} />}
        {tab==='tracker'  && <TrackerPage  {...shared} />}
        {tab==='badges'   && <BadgesPage   {...shared} />}
        {tab==='analysis' && <AnalysisPage {...shared} />}
      </main>

      {/* ── Bottom Nav ───────────────────────────────────── */}
      <nav style={{
        position:'fixed', bottom:0, left:0, right:0, zIndex:40,
        background:'rgba(255,248,240,0.96)', backdropFilter:'blur(12px)',
        borderTop:'1px solid rgba(0,0,0,0.06)',
        display:'flex', justifyContent:'space-around', alignItems:'center',
        padding:'8px 4px env(safe-area-inset-bottom,8px)',
      }}>
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} className={`nav-btn ${tab===t.id?'active':''}`}>
            <span style={{ fontSize:22 }}>{t.emoji}</span>
            {t.label}
          </button>
        ))}
      </nav>

      {/* ── Settings ─────────────────────────────────────── */}
      <NotificationEngine />
      {showSettings && <SettingsModal onClose={() => setShowSettings(false)} toast={toast} />}

      {/* ── Toasts ───────────────────────────────────────── */}
      <div style={{ position:'fixed', top:66, right:12, zIndex:99, display:'flex', flexDirection:'column', gap:8, maxWidth:300 }}>
        {toasts.map(t => {
          const [bg, color, border] = TOAST_COLORS[t.type] || TOAST_COLORS.info;
          return (
            <div key={t.id} style={{
              background:bg, color, border:`2px solid ${border}`,
              borderRadius:14, padding:'10px 14px',
              fontFamily:'Nunito', fontWeight:700, fontSize:13,
              boxShadow:'0 4px 16px rgba(0,0,0,0.12)',
              animation:'slideIn 0.3s ease',
            }}>{t.msg}</div>
          );
        })}
      </div>
      <style>{`@keyframes slideIn{from{transform:translateX(20px);opacity:0}to{transform:translateX(0);opacity:1}}`}</style>
    </div>
  );
}
