import { deleteToken, getMessaging, getToken, isSupported, onMessage, type MessagePayload } from 'firebase/messaging';
import { deleteDoc, doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { app, db } from './firebase';
import { firebaseConfig } from './firebase-config';

const VAPID_KEY = import.meta.env.VITE_FIREBASE_VAPID_KEY;

function enabledKey(uid: string) {
  return `lumen.push.enabled.${uid}`;
}

function tokenKey(uid: string) {
  return `lumen.push.token.${uid}`;
}

async function tokenId(token: string): Promise<string> {
  const bytes = new TextEncoder().encode(token);
  const digest = await crypto.subtle.digest('SHA-256', bytes);
  return [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, '0')).join('');
}

async function getRegistration() {
  const config = encodeURIComponent(JSON.stringify(firebaseConfig));
  return navigator.serviceWorker.register(`/firebase-messaging-sw.js?config=${config}`, { scope: '/' });
}

export function isPushConfigured() {
  return Boolean(VAPID_KEY && app && db && typeof window !== 'undefined' && 'Notification' in window);
}

export function isPushEnabled(uid: string) {
  return isPushConfigured() && Notification.permission === 'granted' && localStorage.getItem(enabledKey(uid)) === 'true';
}

export async function enablePushNotifications(uid: string): Promise<boolean> {
  if (!isPushConfigured() || !app || !db || !VAPID_KEY) return false;
  if ((await isSupported()) === false) return false;
  const permission = await Notification.requestPermission();
  if (permission !== 'granted') return false;

  const registration = await getRegistration();
  const token = await getToken(getMessaging(app), { vapidKey: VAPID_KEY, serviceWorkerRegistration: registration });
  if (!token) return false;

  const id = await tokenId(token);
  await setDoc(doc(db, 'users', uid, 'notification_tokens', id), {
    token,
    userAgent: navigator.userAgent.slice(0, 300),
    updatedAt: serverTimestamp(),
  });
  localStorage.setItem(enabledKey(uid), 'true');
  localStorage.setItem(tokenKey(uid), id);
  return true;
}

export async function disablePushNotifications(uid: string): Promise<void> {
  if (!app || !db) return;
  const id = localStorage.getItem(tokenKey(uid));
  if (id) await deleteDoc(doc(db, 'users', uid, 'notification_tokens', id));
  if (await isSupported()) await deleteToken(getMessaging(app));
  localStorage.removeItem(enabledKey(uid));
  localStorage.removeItem(tokenKey(uid));
}

export async function listenForPushMessages(handler: (payload: MessagePayload) => void) {
  if (!app || !isPushConfigured() || (await isSupported()) === false) return () => undefined;
  return onMessage(getMessaging(app), handler);
}
