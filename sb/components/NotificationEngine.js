'use client';
// ── NotificationEngine ────────────────────────────────────────
// Schedules ALL of today's notifications via the Service Worker
// so they fire even when the app tab is closed/minimised.
// Re-schedules whenever a block is ticked (cancels its alert).
// ─────────────────────────────────────────────────────────────

import { useEffect } from 'react';
import { getTimetable, getDayDone, getSettings, getMissedLine, sendTelegram } from '../lib/store';
import { to12h } from '../lib/store';

// ── Helpers ───────────────────────────────────────────────────
function to24Min(t) {
  if (!t) return 0;
  const [h, m] = t.split(':').map(Number);
  return h * 60 + m;
}

function todayAt(hhmm) {
  // Returns a Date for today at hhmm "HH:MM"
  // If hhmm is like "00:15" and current time is past noon, treat as next day
  const [h, m] = hhmm.split(':').map(Number);
  const now = new Date();
  const d = new Date(now);
  d.setHours(h, m, 0, 0);

  // If the resulting time is more than 6 hours in the past, it's the next calendar day
  // (handles overnight blocks like 00:30 which belong to the next day slot)
  if (d.getTime() < now.getTime() - 6 * 3600 * 1000) {
    d.setDate(d.getDate() + 1);
  }
  return d;
}

async function getSW() {
  if (typeof navigator === 'undefined') return null;
  if (!('serviceWorker' in navigator)) return null;
  try {
    const reg = await navigator.serviceWorker.ready;
    return reg.active;
  } catch { return null; }
}

// ── Build today's notification schedule ───────────────────────
function buildSchedule(timetable, done, cfg) {
  const dayIdx = new Date().getDay();
  const notifications = [];

  timetable.forEach(block => {
    if (!block.notify) return;
    if (!block.days.includes(dayIdx)) return;

    const line = getMissedLine(block.type);

    // 1. "Starting in 5 min" reminder
    const remindAt = todayAt(block.start).getTime() - 5 * 60 * 1000;
    if (remindAt > Date.now()) {
      notifications.push({
        fireAt: remindAt,
        title:  `⏰ Starting soon: ${block.label}`,
        body:   `5 min to go! ${to12h(block.start)} – ${to12h(block.end)}`,
        tag:    `remind_${block.id}`,
      });
    }

    // 2. Missed-block alert (1 min after end), only if not already ticked
    if (!done.includes(block.id)) {
      const missedAt = todayAt(block.end).getTime() + 60 * 1000;
      if (missedAt > Date.now()) {
        notifications.push({
          fireAt: missedAt,
          title:  `⚠️ Missed: ${block.label}`,
          body:   line,
          tag:    `missed_${block.id}`,
        });
      }
    }
  });

  return notifications;
}

// ── Send schedule to service worker ───────────────────────────
async function scheduleAll() {
  const sw = await getSW();
  if (!sw) return;

  const cfg  = getSettings();
  if (!cfg.notificationsEnabled) return;

  const today = new Date().toDateString();
  const done  = getDayDone(today);
  const tt    = getTimetable();
  const notifs = buildSchedule(tt, done, cfg);

  sw.postMessage({ type: 'SCHEDULE_NOTIFICATIONS', notifications: notifs });
}

// ── Cancel a specific alert (called when block is ticked) ─────
export async function cancelMissedAlert(blockId) {
  const sw = await getSW();
  if (!sw) return;
  sw.postMessage({ type: 'CANCEL_NOTIFICATION', tag: `missed_${blockId}` });
}

// ── Telegram missed-block DM ──────────────────────────────────
export async function sendMissedTelegram(block) {
  const cfg = getSettings();
  if (!cfg.telegramBotToken || !cfg.telegramChatId) return;
  const line = getMissedLine(block.type);
  try {
    await sendTelegram(
      cfg.telegramBotToken,
      cfg.telegramChatId,
      `⚠️ *Missed Block!*\n\n*${block.label}* ended without being ticked.\n\n_${line}_\n\nOpen the app and get back on track! 🔥`,
    );
  } catch {}
}

// ── React hook ────────────────────────────────────────────────
export default function NotificationEngine() {
  useEffect(() => {
    // Schedule on mount
    scheduleAll();

    // Reschedule every hour (in case day rolls over or new ticks happen)
    const iv = setInterval(scheduleAll, 60 * 60 * 1000);
    return () => clearInterval(iv);
  }, []);

  return null;
}

export { scheduleAll };
