'use client';
import { useState, useEffect } from 'react';
import { getSettings, saveSettings, getStats, saveStats, sendTelegram } from '../lib/store';

export default function SettingsModal({ onClose, toast }) {
  const [cfg, setCfg] = useState(null);
  const [testing, setTesting] = useState(false);

  useEffect(() => setCfg(getSettings()), []);
  if (!cfg) return null;

  const save = () => { saveSettings(cfg); toast('✅ Settings saved!','success'); onClose(); };

  const testTelegram = async () => {
    if (!cfg.telegramBotToken||!cfg.telegramChatId){ toast('⚠️ Enter token & chat ID first','error'); return; }
    setTesting(true);
    try {
      await sendTelegram(cfg.telegramBotToken, cfg.telegramChatId,
        `✅ *StudyBuddy Connected!*\n\nHey *${cfg.userName}*! 🎉\n\nYour Telegram is now linked. You'll get:\n• 🏆 Achievement alerts\n• 📊 Daily summaries\n• ⏰ Study reminders\n\n_Let's get to IIT! 🚀_`
      );
      const st = getStats();
      saveStats({ ...st, telegramLinked: true });
      toast('🎉 Telegram connected! Check your chat.','success');
    } catch(e) {
      toast('❌ Error: ' + e.message, 'error');
    } finally { setTesting(false); }
  };

  const requestNotif = async () => {
    if (!('Notification' in window)){ toast('⚠️ Browser does not support notifications','error'); return; }
    const perm = await Notification.requestPermission();
    if (perm==='granted') {
      setCfg(c=>({...c,notificationsEnabled:true}));
      toast('🔔 Notifications enabled!','success');
      new Notification('📖 StudyBuddy',{body:'Reminders are ON!',icon:'/icon.png'});
    } else toast('⚠️ Allow notifications in browser settings','error');
  };

  const inp = {width:'100%',padding:'11px 14px',borderRadius:12,border:'1.5px solid #E8E8E8',fontFamily:'DM Sans',fontSize:14,outline:'none',boxSizing:'border-box'};
  const Section = ({title,bg,children}) => (
    <div style={{background:bg||'#F8F8F8',borderRadius:16,padding:14,marginBottom:16}}>
      <div style={{fontFamily:'Nunito',fontWeight:800,fontSize:15,marginBottom:12}}>{title}</div>
      {children}
    </div>
  );
  const Field = ({label,sub,children}) => (
    <div style={{marginBottom:12}}>
      <label style={{display:'block',fontFamily:'Nunito',fontWeight:700,fontSize:13,color:'#2D2D2D',marginBottom:sub?2:5}}>{label}</label>
      {sub&&<div style={{fontSize:11,color:'#9D9D9D',marginBottom:5}}>{sub}</div>}
      {children}
    </div>
  );

  return (
    <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.45)',zIndex:200,display:'flex',alignItems:'flex-end',justifyContent:'center'}} onClick={onClose}>
      <div style={{background:'white',borderRadius:'24px 24px 0 0',padding:'20px 20px 32px',width:'100%',maxWidth:480,maxHeight:'90vh',overflowY:'auto'}} onClick={e=>e.stopPropagation()}>

        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:20}}>
          <div style={{fontFamily:'Nunito',fontWeight:900,fontSize:22}}>⚙️ Settings</div>
          <button onClick={onClose} style={{background:'#F0F0F0',border:'none',borderRadius:10,padding:'6px 12px',cursor:'pointer',fontSize:14}}>✕</button>
        </div>

        <Section title="👤 Profile" bg="#FFF8F0">
          <Field label="Your Name">
            <input value={cfg.userName} onChange={e=>setCfg(c=>({...c,userName:e.target.value}))} style={inp}/>
          </Field>
          <Field label="Daily Study Target (hours)">
            <input type="number" min="1" max="16" step="0.5" value={cfg.dailyTargetHours} onChange={e=>setCfg(c=>({...c,dailyTargetHours:parseFloat(e.target.value)}))} style={inp}/>
          </Field>
        </Section>

        <Section title="📱 Telegram Bot Setup" bg="#EFF8FF">
          <div style={{background:'#E0F0FF',borderRadius:12,padding:12,marginBottom:12,fontSize:12,color:'#2D5D9D',lineHeight:1.7}}>
            <strong>Step 1:</strong> Open Telegram → search <strong>@BotFather</strong><br/>
            <strong>Step 2:</strong> Send <code>/newbot</code> → follow steps → copy the token<br/>
            <strong>Step 3:</strong> Search <strong>@userinfobot</strong> → send /start → copy your ID<br/>
            <strong>Step 4:</strong> Paste below → click Test!
          </div>
          <Field label="Bot Token" sub="From @BotFather (looks like 1234567:ABCdef...)">
            <input type="password" value={cfg.telegramBotToken} onChange={e=>setCfg(c=>({...c,telegramBotToken:e.target.value}))} placeholder="1234567890:AABBcc..." style={inp}/>
          </Field>
          <Field label="Your Chat ID" sub="From @userinfobot (just numbers like 123456789)">
            <input value={cfg.telegramChatId} onChange={e=>setCfg(c=>({...c,telegramChatId:e.target.value}))} placeholder="123456789" style={inp}/>
          </Field>
          <button onClick={testTelegram} disabled={testing} style={{width:'100%',padding:11,borderRadius:12,border:'none',cursor:'pointer',background:'#C8E8FF',fontFamily:'Nunito',fontWeight:700,fontSize:14,color:'#2D5D9D'}}>
            {testing?'⏳ Sending test message...':'📤 Test Telegram Connection'}
          </button>
        </Section>

        <Section title="🔔 Web Notifications" bg="#FFFBEB">
          <div style={{fontSize:12,color:'#7D6D3D',marginBottom:10,lineHeight:1.6}}>
            Get browser pop-ups as study reminders — works even when the tab is in background!
          </div>
          <button onClick={requestNotif} disabled={cfg.notificationsEnabled} style={{
            width:'100%',padding:11,borderRadius:12,border:'none',cursor:'pointer',
            background:cfg.notificationsEnabled?'#C8F0D8':'#FFE4C8',
            fontFamily:'Nunito',fontWeight:700,fontSize:14,
            color:cfg.notificationsEnabled?'#3D8D5D':'#7D4D1D',
          }}>
            {cfg.notificationsEnabled?'✅ Notifications Active':'🔔 Enable Browser Notifications'}
          </button>
        </Section>

        <button onClick={save} style={{width:'100%',padding:14,borderRadius:16,border:'none',cursor:'pointer',background:'linear-gradient(135deg,#FF7F7F,#C87FFF)',color:'white',fontFamily:'Nunito',fontWeight:900,fontSize:16}}>
          💾 Save Settings
        </button>
      </div>
    </div>
  );
}
