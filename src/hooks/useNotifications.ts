import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Notification } from '@/types/notification';
import { useToast } from '@/hooks/use-toast';

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
        timestamp: new Date(item.created_at),
        isRead: item.is_read,
        actionType: item.action_type as Notification['actionType'],
        actionData: item.action_data
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
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', notificationId);

      if (error) throw error;

      setNotifications(prev => 
        prev.map(n => 
          n.id === notificationId ? { ...n, isRead: true } : n
        )
      );
    } catch (error) {
      console.error('Error marking notification as read:', error);
      toast({
        title: "Error",
        description: "Failed to mark notification as read",
        variant: "destructive"
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

  // Add sample notification
  const addSampleNotification = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Error",
          description: "You must be logged in to add notifications",
          variant: "destructive"
        });
        return;
      }

      const sampleNotifications = [
        {
          type: 'info',
          title: 'System Maintenance Scheduled',
          message: 'We will be performing system maintenance on Sunday from 2 AM to 4 AM EST. Services may be temporarily unavailable.'
        },
        {
          type: 'success',
          title: 'Backup Completed',
          message: 'Your data backup has been completed successfully. All your files are safe and secure.'
        },
        {
          type: 'warning',
          title: 'Security Alert',
          message: 'We detected a login from a new device. If this wasn\'t you, please secure your account immediately.'
        }
      ];

      const sample = sampleNotifications[Math.floor(Math.random() * sampleNotifications.length)];
      
      const { error } = await supabase
        .from('notifications')
        .insert({
          user_id: user.id,
          type: sample.type,
          title: sample.title,
          message: sample.message
        });

      if (error) throw error;
    } catch (error) {
      console.error('Error adding sample notification:', error);
      toast({
        title: "Error",
        description: "Failed to add sample notification",
        variant: "destructive"
      });
    }
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
            timestamp: new Date(payload.new.created_at),
            isRead: payload.new.is_read,
            actionType: payload.new.action_type,
            actionData: payload.new.action_data
          };

          setNotifications(prev => [newNotification, ...prev]);
          
          toast({
            title: "New notification received",
            description: newNotification.title,
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
          setNotifications(prev => 
            prev.map(n => 
              n.id === payload.new.id 
                ? { ...n, isRead: payload.new.is_read }
                : n
            )
          );
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
    addSampleNotification
  };
};