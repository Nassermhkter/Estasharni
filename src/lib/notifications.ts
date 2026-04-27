import { 
  collection, 
  addDoc, 
  query, 
  where, 
  orderBy, 
  onSnapshot, 
  updateDoc, 
  doc, 
  serverTimestamp,
  Timestamp,
  getDocs
} from 'firebase/firestore';
import { db } from './firebase';

export enum NotificationType {
  INFO = 'info',
  SUCCESS = 'success',
  WARNING = 'warning',
  ERROR = 'error',
  MESSAGE = 'message',
  APPOINTMENT = 'appointment'
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  body: string;
  type: NotificationType;
  read: boolean;
  createdAt: any;
  link?: string;
}

export const notificationService = {
  /**
   * Create a new notification for a user
   */
  async send(userId: string, title: string, body: string, type: NotificationType = NotificationType.INFO, link?: string) {
    try {
      await addDoc(collection(db, 'notifications'), {
        userId,
        title,
        body,
        type,
        read: false,
        createdAt: serverTimestamp(),
        link: link || null
      });
    } catch (error) {
      console.error('Error sending notification:', error);
    }
  },

  /**
   * Mark a notification as read
   */
  async markAsRead(notificationId: string) {
    try {
      const docRef = doc(db, 'notifications', notificationId);
      await updateDoc(docRef, { read: true });
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  },

  /**
   * Mark all notifications as read for a user
   */
  async markAllAsRead(userId: string) {
    try {
      const q = query(
        collection(db, 'notifications'),
        where('userId', '==', userId),
        where('read', '==', false)
      );
      const snapshot = await getDocs(q);
      const batches = snapshot.docs.map(d => updateDoc(doc(db, 'notifications', d.id), { read: true }));
      await Promise.all(batches);
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  },

  /**
   * Subscribe to user notifications in real-time
   */
  subscribeToUserNotifications(userId: string, callback: (notifications: Notification[]) => void) {
    const q = query(
      collection(db, 'notifications'),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );

    return onSnapshot(q, (snapshot) => {
      const notifications = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Notification[];
      callback(notifications);
    }, (error) => {
      console.error('Notification subscription error:', error);
    });
  }
};
