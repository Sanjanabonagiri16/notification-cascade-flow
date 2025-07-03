import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Notification } from '@/types/notification';
import { useToast } from '@/hooks/use-toast';
import { formatDistanceToNow } from 'date-fns';
import { ToastAction } from '@/components/ui/toast';

export const useNotifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Fetch notifications
  const fetchNotifications = async () => {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formattedNotifications: Notification[] = data.map(item => ({
        id: item.id,
        type: item.type as Notification['type'],
        title: item.title,
        message: item.message,
        createdAt: item.created_at || new Date().toISOString(),
        isRead: item.is_read,
        actionType: item.action_type as Notification['actionType'],
      }));

      setNotifications(formattedNotifications);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      toast({
        title: "Error",
        description: "Failed to load notifications",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Mark notification as read
  const markAsRead = async (notificationId: string) => {
    if (!notificationId || typeof notificationId !== 'string') {
      console.warn('markAsRead called with invalid notificationId:', notificationId);
      toast({
        title: 'Error',
        description: 'Invalid notification ID',
        variant: 'destructive',
      });
      return;
    }
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', notificationId);
      if (error) {
        console.error('Supabase markAsRead error:', { notificationId, error });
        throw error;
      }
      setNotifications(prev =>
        prev.map(n =>
          n.id === notificationId ? { ...n, isRead: true } : n
        )
      );
    } catch (error) {
      console.error('Error marking notification as read:', error);
      toast({
        title: 'Error',
        description: `Failed to mark notification as read: ${error && (error.message || JSON.stringify(error))}`,
        variant: 'destructive',
      });
    }
  };

  // Mark all notifications as read
  const markAllAsRead = async () => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('is_read', false);

      if (error) throw error;

      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      
      toast({
        title: "All notifications marked as read",
      });
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      toast({
        title: "Error",
        description: "Failed to mark all notifications as read",
        variant: "destructive"
      });
    }
  };

  // Delete a notification with undo support
  const deleteNotification = async (notificationId: string) => {
    if (!notificationId || typeof notificationId !== 'string') {
      console.warn('deleteNotification called with invalid notificationId:', notificationId);
      toast({
        title: 'Error',
        description: 'Invalid notification ID',
        variant: 'destructive',
      });
      return;
    }
    try {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', notificationId);
      if (error) {
        console.error('Supabase deleteNotification error:', { notificationId, error });
        throw error;
      }
      setNotifications(prev => prev.filter(n => n.id !== notificationId));
      toast({
        title: 'Notification deleted',
        variant: 'default',
      });
    } catch (error) {
      console.error('Error deleting notification:', error);
      toast({
        title: 'Error',
        description: `Failed to delete notification: ${error && (error.message || JSON.stringify(error))}`,
        variant: 'destructive',
      });
    }
  };

  const notificationTypes = [
    {
      type: 'message',
      title: 'New Message',
      message: 'You have received a new message from John Doe.',
      fromUser: { name: 'John Doe', avatarUrl: 'https://randomuser.me/api/portraits/men/1.jpg' },
      actionType: 'view',
    },
    {
      type: 'alert',
      title: 'System Alert',
      message: 'Your account password will expire soon.',
      fromUser: { name: 'System', avatarUrl: '' },
      actionType: 'update',
    },
    {
      type: 'task',
      title: 'Task Assigned',
      message: 'You have been assigned a new task: Complete the report.',
      fromUser: { name: 'Manager', avatarUrl: 'https://randomuser.me/api/portraits/women/2.jpg' },
      actionType: 'view',
    },
    {
      type: 'update',
      title: 'App Update',
      message: 'Version 2.0 is now available. Update now for new features!',
      fromUser: { name: 'App Team', avatarUrl: '' },
      actionType: 'download',
    },
  ];

  const addSampleNotification = () => {
    const random = notificationTypes[Math.floor(Math.random() * notificationTypes.length)];
    const newNotification: Notification = {
      id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substr(2, 9),
      title: random.title,
      message: random.message,
      isRead: false,
      createdAt: new Date().toISOString(),
      type: random.type as 'message' | 'alert' | 'task' | 'update',
      priority: Math.random() > 0.7 ? 'high' : 'normal',
      fromUser: random.fromUser,
      actionType: random.actionType,
    };
    setNotifications((prev) => [newNotification, ...prev]);
    toast({
      title: random.title,
      description: random.message,
      variant: 'default',
    });
  };

  // Set up real-time subscription
  useEffect(() => {
    fetchNotifications();

    const channel = supabase
      .channel('notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications'
        },
        (payload) => {
          const newNotification: Notification = {
            id: payload.new.id,
            type: payload.new.type,
            title: payload.new.title,
            message: payload.new.message,
            createdAt: payload.new.created_at || new Date().toISOString(),
            isRead: payload.new.is_read,
            actionType: payload.new.action_type,
          };

          setNotifications(prev => [newNotification, ...prev]);
          toast({
            title: 'New notification received',
            description: newNotification.title,
            variant: 'default',
          });
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'notifications'
        },
        (payload) => {
          setNotifications(prev => {
            const idx = prev.findIndex(n => n.id === payload.new.id);
            if (idx !== -1) {
              // Update existing
              return prev.map(n => n.id === payload.new.id ? { ...n, ...payload.new } : n);
            } else {
              // Add if not found
              return [{
                id: payload.new.id,
                type: payload.new.type,
                title: payload.new.title,
                message: payload.new.message,
                createdAt: payload.new.created_at || new Date().toISOString(),
                isRead: payload.new.is_read,
                actionType: payload.new.action_type,
              }, ...prev];
            }
          });
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'notifications'
        },
        (payload) => {
          setNotifications(prev => prev.filter(n => n.id !== payload.old.id));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [toast]);

  return {
    notifications,
    loading,
    markAsRead,
    markAllAsRead,
    addSampleNotification,
    setNotifications,
    deleteNotification,
  };
};