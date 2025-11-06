import { firestore } from '@/lib/firebase';
import { collection, doc, onSnapshot, orderBy, query, updateDoc } from 'firebase/firestore';
import { Bell, Check, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: Date;
  link?: string;
}

interface NotificationBellProps {
  userId: string;
}

export function NotificationBell({ userId }: NotificationBellProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!userId) return;

    // Écouter les notifications en temps réel
    const notificationsRef = collection(firestore, 'patients', userId, 'notifications');
    const q = query(notificationsRef, orderBy('createdAt', 'desc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const notifs: Notification[] = [];
      let unread = 0;

      snapshot.forEach((doc) => {
        const data = doc.data();
        const notification: Notification = {
          id: doc.id,
          type: data.type || 'general',
          title: data.title || 'Notification',
          message: data.message || '',
          read: data.read || false,
          createdAt: data.createdAt?.toDate() || new Date(),
          link: data.link,
        };
        notifs.push(notification);
        if (!notification.read) unread++;
      });

      setNotifications(notifs);
      setUnreadCount(unread);
    });

    return () => unsubscribe();
  }, [userId]);

  const markAsRead = async (notificationId: string) => {
    try {
      const notifRef = doc(firestore, 'patients', userId, 'notifications', notificationId);
      await updateDoc(notifRef, { read: true });
    } catch (error) {
      console.error('[NotificationBell] Error marking as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const batch = notifications
        .filter((n) => !n.read)
        .map((n) => {
          const notifRef = doc(firestore, 'patients', userId, 'notifications', n.id);
          return updateDoc(notifRef, { read: true });
        });
      await Promise.all(batch);
    } catch (error) {
      console.error('[NotificationBell] Error marking all as read:', error);
    }
  };

  const handleNotificationClick = (notification: Notification) => {
    markAsRead(notification.id);
    if (notification.link) {
      navigate(notification.link);
      setIsOpen(false);
    }
  };

  const formatTime = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return "À l'instant";
    if (diffMins < 60) return `Il y a ${diffMins}min`;
    if (diffHours < 24) return `Il y a ${diffHours}h`;
    if (diffDays < 7) return `Il y a ${diffDays}j`;
    return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
  };

  return (
    <div className="relative">
      {/* Bouton cloche */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-white transition-colors hover:bg-white/10"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-nn-accent-500 text-xs font-semibold text-white shadow-lg shadow-nn-accent-500/50">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <>
          {/* Overlay */}
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />

          {/* Panel */}
          <div className="absolute right-0 top-12 z-50 w-96 rounded-2xl border border-white/10 bg-slate-950/95 shadow-2xl backdrop-blur-xl">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-white/10 p-4">
              <h3 className="text-lg font-semibold text-white">Notifications</h3>
              <div className="flex items-center gap-2">
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="flex items-center gap-1 rounded-lg bg-white/5 px-2 py-1 text-xs font-medium text-white/70 transition hover:bg-white/10 hover:text-white"
                  >
                    <Check className="h-3 w-3" />
                    Tout lire
                  </button>
                )}
                <button
                  onClick={() => setIsOpen(false)}
                  className="flex h-6 w-6 items-center justify-center rounded-lg text-white/60 transition hover:bg-white/10 hover:text-white"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Liste des notifications */}
            <div className="max-h-96 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="p-8 text-center">
                  <Bell className="mx-auto h-12 w-12 text-white/20" />
                  <p className="mt-2 text-sm text-white/60">Aucune notification</p>
                </div>
              ) : (
                <div className="divide-y divide-white/5">
                  {notifications.slice(0, 10).map((notification) => (
                    <div
                      key={notification.id}
                      onClick={() => handleNotificationClick(notification)}
                      className={`cursor-pointer p-4 transition-colors hover:bg-white/5 ${
                        !notification.read ? 'bg-nn-primary-500/5' : ''
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0">
                          {!notification.read && (
                            <div className="h-2 w-2 rounded-full bg-nn-accent-500" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-white">{notification.title}</p>
                          <p className="mt-1 text-xs text-white/60 line-clamp-2">
                            {notification.message}
                          </p>
                          <p className="mt-1 text-xs text-white/40">
                            {formatTime(notification.createdAt)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            {notifications.length > 0 && (
              <div className="border-t border-white/10 p-2">
                <button
                  onClick={() => {
                    // TODO: Créer une page dédiée aux notifications
                    setIsOpen(false);
                  }}
                  className="w-full rounded-lg py-2 text-center text-sm font-medium text-white/70 transition hover:bg-white/5 hover:text-white"
                >
                  Voir toutes les notifications
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
