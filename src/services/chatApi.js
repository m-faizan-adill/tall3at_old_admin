import { API_CONFIG } from '../constants/config';

const BASE = API_CONFIG.BASE_URL + '/api/admin/chat';

export async function fetchConversations(params = {}) {
  const url = new URL(BASE + '/conversations');
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== '') url.searchParams.append(k, v);
  });
  const res = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('token')}`,
      'Content-Type': 'application/json',
    },
  });
  if (!res.ok) throw new Error('فشل تحميل المحادثات');
  return res.json();
}

export async function fetchMessages(userId1, userId2, params = {}) {
  const url = new URL(BASE + '/messages');
  url.searchParams.append('userId1', userId1);
  url.searchParams.append('userId2', userId2);
  
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== '') url.searchParams.append(k, v);
  });
  
  const res = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('token')}`,
      'Content-Type': 'application/json',
    },
  });
  if (!res.ok) throw new Error('فشل تحميل الرسائل');
  return res.json();
}

export async function sendMessage(messageData) {
  const res = await fetch(BASE + '/messages', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('token')}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(messageData),
  });
  if (!res.ok) throw new Error('فشل إرسال الرسالة');
  return res.json();
}

export async function fetchStatistics(params = {}) {
  const url = new URL(BASE + '/statistics');
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== '') url.searchParams.append(k, v);
  });
  const res = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('token')}`,
      'Content-Type': 'application/json',
    },
  });
  if (!res.ok) throw new Error('فشل تحميل الإحصائيات');
  return res.json();
}

export async function searchMessages(params = {}) {
  const url = new URL(BASE + '/search');
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== '') url.searchParams.append(k, v);
  });
  const res = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('token')}`,
      'Content-Type': 'application/json',
    },
  });
  if (!res.ok) throw new Error('فشل البحث في الرسائل');
  return res.json();
} 