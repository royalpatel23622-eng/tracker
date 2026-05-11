'use client';
// ── NotificationEngine ────────────────────────────────────────
// Runs in background, fires browser + Telegram alerts when
// a block's end time passes and it hasn't been ticked yet.
// Also sends "starting soon" reminders 5 min before each block.
// ─────────────────────────────────────────────────────────────

import { useEffect, useRef } from 'react';
import { getTimetable, getDayDone, getSettings, sendTelegram, getMissedLine } from '../lib/store';

function toMin(t) {
  // handles times past midnight like "00:15" as next-day
  if (!t) return 0;
  const [h, m] = t.split(':').map(Number);
  return h * 60 + m;
}

function nowMin() {
  const n = new Date();
  return n.getHours() * 60 + n.getMinutes();
}

// Send a browser push notification
function pushNotif(title, body, tag) {
  if (typeof window === 'undefined') return;
  if (Notification.permission !== 'granted') return;
  try {
    new Notification(title, {
      body,
      icon: '/icon.png',
      tag: tag || 'studybuddy',
      requireInteraction: false,
    });
  } catch {}
}

// Send Telegram + browser notification for a missed block
async function fireMissed(block) {
  const line = getMissedLine(block.type);
  const title = `⚠️ Missed: ${block.label}`;

  // Browser notif
  pushNotif(title, line, `missed_${block.id}`);

  // Telegram
  const cfg = getSettings();
  if (cfg.telegramBotToken && cfg.telegramChatId) {
    try {
      await sendTelegram(
        cfg.telegramBotToken,
        cfg.telegramChatId,
        `⚠️ *Missed Block Alert!*\n\n*${block.label}* just ended without being ticked.\n\n_${line}_\n\nOpen StudyBuddy and get back on track! 🔥`,
      );
    } catch {}
  }
}

// Send "starting soon" reminder
function fireReminder(block) {
  pushNotif(
    `⏰ Starting in 5 min: ${block.label}`,
    `Get ready! ${block.start} – ${block.end}`,
    `remind_${block.id}`,
  );
}

// Track which alerts have already fired today so we don't repeat
const firedToday = new Set();

function checkNow() {
  if (typeof window === 'undefined') return;
  const cfg = getSettings();
  if (!cfg.notificationsEnabled && !cfg.telegramBotToken) return;

  const now   = new Date();
  const mins  = nowMin();
  const today = now.toDateString();
  const dayIdx = now.getDay();
  const done  = getDayDone(today);
  const tt    = getTimetable();

  tt.forEach(block => {
    if (!block.notify) return;
    if (!block.days.includes(dayIdx)) return;

    let startM = toMin(block.start);
    let endM   = toMin(block.end);

    // Handle overnight blocks (e.g. 21:15–00:15): end < start means past midnight
    // We treat them simply: if current time is past end, check missed
    // For simplicity: if endM < startM, the block crosses midnight
    // Only fire "missed" if we're past the end time (and end > 0 meaning it has an end)

    const missedKey  = `missed_${block.id}_${today}`;
    const reminderKey = `remind_${block.id}_${today}`;

    // ── "Starting soon" reminder (5 min before) ────────────
    if (
      !firedToday.has(reminderKey) &&
      cfg.notificationsEnabled &&
      mins >= startM - 5 &&
      mins < startM
    ) {
      firedToday.add(reminderKey);
      fireReminder(block);
    }

    // ── Missed block alert: fires once after block ends, stops when ticked ──
    // No time-window cap — you can tick anytime and alert stops immediately.
    const triggerMin = endM + 1;
    if (mins >= triggerMin && !done.includes(block.id)) {
      // Block has ended and not ticked yet → alert (once per session)
      if (!firedToday.has(missedKey)) {
        firedToday.add(missedKey);
        fireMissed(block);
      }
    } else if (done.includes(block.id)) {
      // You ticked it (even late) → remove from fired so no more pings
      firedToday.delete(missedKey);
    }
  });
}

// ── React hook — drop into any page layout ────────────────────
export default function NotificationEngine() {
  const ivRef = useRef(null);

  useEffect(() => {
    // Check immediately, then every 60 seconds
    checkNow();
    ivRef.current = setInterval(checkNow, 60 * 1000);
    return () => clearInterval(ivRef.current);
  }, []);

  return null; // renders nothing
}
