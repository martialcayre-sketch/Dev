import { auth, firestore } from '@/lib/firebase';
import { collection, doc, onSnapshot, orderBy, query, updateDoc, where } from 'firebase/firestore';
import type { Timestamp } from 'firebase/firestore';
import { Bell, Check } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

type NotificationItem = {
  id: string;
  title: string;
  message?: string;
  link?: string;
  read?: boolean;
  createdAt?: Timestamp | null;
};

export function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<NotificationItem[]>([]);
  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const u = auth.currentUser;
    if (!u) return;
    const ref = collection(firestore, 'patients', u.uid, 'notifications');
    const q = query(ref, where('read', '==', false), orderBy('createdAt', 'desc'));
    const unsub = onSnapshot(q, (snap) => {
      setItems(
        snap.docs.map((d) => ({
          id: d.id,
          ...d.data(),
        })) as NotificationItem[]
      );
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('click', onDocClick);
    return () => document.removeEventListener('click', onDocClick);
  }, []);

  const unread = items.length;

  const markAsRead = async (id: string) => {
    const u = auth.currentUser;
    if (!u) return;
    try {
      await updateDoc(doc(firestore, 'patients', u.uid, 'notifications', id), { read: true });
    } catch (_) {
      /* ignore */
    }
  };

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="group relative inline-flex h-10 w-10 items-center justify-center rounded-xl border border-black/10 bg-white text-slate-700 transition hover:bg-slate-50 dark:border-white/10 dark:bg-white/5 dark:text-white dark:hover:bg-white/10"
        aria-label="Notifications"
      >
        <Bell className="h-5 w-5" />
        {unread > 0 && (
          <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-semibold text-white">
            {unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 overflow-hidden rounded-2xl border border-black/10 bg-white shadow-xl dark:border-white/10 dark:bg-slate-900">
          <div className="border-b border-black/10 px-4 py-3 text-sm font-semibold text-slate-700 dark:border-white/10 dark:text-white">
            Notifications
          </div>
          <div className="max-h-80 overflow-y-auto p-2">
            {items.length === 0 ? (
              <div className="p-4 text-sm text-slate-500 dark:text-white/60">
                Aucune notification.
              </div>
            ) : (
              items.map((n) => (
                <div
                  key={n.id}
                  className="group flex items-start gap-3 rounded-xl p-3 hover:bg-slate-50 dark:hover:bg-white/5"
                >
                  <div className="mt-0.5 h-2.5 w-2.5 rounded-full bg-rose-500" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-slate-900 dark:text-white">{n.title}</p>
                    {n.message && (
                      <p className="text-xs text-slate-600 dark:text-white/60">{n.message}</p>
                    )}
                    <div className="mt-2 flex gap-2">
                      {n.link && (
                        <a
                          href={n.link}
                          onClick={() => markAsRead(n.id)}
                          className="text-xs font-semibold text-nn-primary-600 hover:underline"
                        >
                          Ouvrir
                        </a>
                      )}
                      <button
                        onClick={() => markAsRead(n.id)}
                        className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-slate-700 dark:text-white/50 dark:hover:text-white/80"
                      >
                        <Check className="h-3.5 w-3.5" />
                        Marquer comme lu
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
