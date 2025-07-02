import { useState, useEffect } from 'react';
import { Bell, BellOff, Filter, Search, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { NotificationItem } from './NotificationItem';
import { NotificationModal } from './NotificationModal';
import { UserOnboardingModal } from './UserOnboardingModal';
import { Notification, UserOnboardingData } from '@/types/notification';
import { useToast } from '@/hooks/use-toast';

// Mock data - in a real app, this would come from an API
const generateMockNotifications = (): Notification[] => [
  {
    id: '1',
    type: 'user_onboarding',
    title: 'Complete Your Profile Setup',
    message: 'Welcome! Please complete your profile setup to get the most out of our platform. This will only take a few minutes.',
    timestamp: new Date(Date.now() - 5 * 60 * 1000), // 5 minutes ago
    isRead: false,
    actionType: 'user_onboarding'
  },
  {
    id: '2',
    type: 'success',
    title: 'Account Verified Successfully',
    message: 'Your account has been verified! You now have access to all premium features.',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    isRead: false,
    actionType: 'modal'
  },
  {
    id: '3',
    type: 'info',
    title: 'New Feature Available',
    message: 'Check out our new dashboard analytics feature. Get insights into your usage patterns and performance metrics.',
    timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
    isRead: true,
  },
  {
    id: '4',
    type: 'warning',
    title: 'Storage Almost Full',
    message: 'Your storage is 85% full. Consider upgrading your plan or cleaning up unused files.',
    timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
    isRead: true,
  },
  {
    id: '5',
    type: 'error',
    title: 'Failed to Process Payment',
    message: 'We encountered an issue processing your payment. Please update your payment method to continue using premium features.',
    timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
    isRead: false,
  }
];

export const NotificationsScreen = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [filteredNotifications, setFilteredNotifications] = useState<Notification[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'unread' | 'read'>('all');
  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isOnboardingModalOpen, setIsOnboardingModalOpen] = useState(false);
  const { toast } = useToast();

  // Initialize notifications
  useEffect(() => {
    const savedNotifications = localStorage.getItem('notifications');
    if (savedNotifications) {
      const parsed = JSON.parse(savedNotifications);
      const notificationsWithDates = parsed.map((n: any) => ({
        ...n,
        timestamp: new Date(n.timestamp)
      }));
      setNotifications(notificationsWithDates);
    } else {
      const mockData = generateMockNotifications();
      setNotifications(mockData);
      localStorage.setItem('notifications', JSON.stringify(mockData));
    }
  }, []);

  // Simulate new notifications
  useEffect(() => {
    const interval = setInterval(() => {
      if (Math.random() > 0.7) { // 30% chance every 10 seconds
        const newNotification: Notification = {
          id: Date.now().toString(),
          type: ['info', 'success', 'warning'][Math.floor(Math.random() * 3)] as any,
          title: `New Notification ${Date.now()}`,
          message: 'This is a dynamically generated notification to demonstrate real-time updates.',
          timestamp: new Date(),
          isRead: false,
        };
        
        setNotifications(prev => {
          const updated = [newNotification, ...prev];
          localStorage.setItem('notifications', JSON.stringify(updated));
          return updated;
        });

        toast({
          title: "New notification received",
          description: newNotification.title,
        });
      }
    }, 10000); // Check every 10 seconds

    return () => clearInterval(interval);
  }, [toast]);

  // Filter notifications
  useEffect(() => {
    let filtered = notifications;

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(n => 
        n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        n.message.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply type filter
    if (filterType === 'unread') {
      filtered = filtered.filter(n => !n.isRead);
    } else if (filterType === 'read') {
      filtered = filtered.filter(n => n.isRead);
    }

    setFilteredNotifications(filtered);
  }, [notifications, searchQuery, filterType]);

  const handleNotificationClick = (notification: Notification) => {
    setSelectedNotification(notification);
    
    if (notification.actionType === 'user_onboarding') {
      setIsOnboardingModalOpen(true);
    } else {
      setIsModalOpen(true);
    }
  };

  const handleMarkAsRead = (notificationId: string) => {
    setNotifications(prev => {
      const updated = prev.map(n => 
        n.id === notificationId ? { ...n, isRead: true } : n
      );
      localStorage.setItem('notifications', JSON.stringify(updated));
      return updated;
    });
  };

  const handleMarkAllAsRead = () => {
    setNotifications(prev => {
      const updated = prev.map(n => ({ ...n, isRead: true }));
      localStorage.setItem('notifications', JSON.stringify(updated));
      return updated;
    });
    toast({
      title: "All notifications marked as read",
    });
  };

  const handleOnboardingComplete = (data: UserOnboardingData) => {
    toast({
      title: "Profile setup completed!",
      description: `Welcome ${data.step1.username}! Your account is now fully configured.`,
    });
    
    // Mark the onboarding notification as read
    if (selectedNotification) {
      handleMarkAsRead(selectedNotification.id);
    }
  };

  const addSampleNotification = () => {
    const sampleNotifications = [
      {
        type: 'info' as const,
        title: 'System Maintenance Scheduled',
        message: 'We will be performing system maintenance on Sunday from 2 AM to 4 AM EST. Services may be temporarily unavailable.'
      },
      {
        type: 'success' as const,
        title: 'Backup Completed',
        message: 'Your data backup has been completed successfully. All your files are safe and secure.'
      },
      {
        type: 'warning' as const,
        title: 'Security Alert',
        message: 'We detected a login from a new device. If this wasn\'t you, please secure your account immediately.'
      }
    ];

    const sample = sampleNotifications[Math.floor(Math.random() * sampleNotifications.length)];
    const newNotification: Notification = {
      id: Date.now().toString(),
      ...sample,
      timestamp: new Date(),
      isRead: false,
    };

    setNotifications(prev => {
      const updated = [newNotification, ...prev];
      localStorage.setItem('notifications', JSON.stringify(updated));
      return updated;
    });
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="relative">
              <Bell className="h-8 w-8 text-primary" />
              {unreadCount > 0 && (
                <Badge className="absolute -top-2 -right-2 px-2 py-1 text-xs bg-destructive text-destructive-foreground">
                  {unreadCount}
                </Badge>
              )}
            </div>
            <div>
              <h1 className="text-3xl font-bold">Notifications</h1>
              <p className="text-muted-foreground">
                Stay updated with your latest activities and important updates
              </p>
            </div>
          </div>
        </div>

        {/* Controls */}
        <Card className="p-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="flex flex-col sm:flex-row gap-3 flex-1">
              {/* Search */}
              <div className="relative flex-1 min-w-0">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search notifications..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Filter */}
              <Select value={filterType} onValueChange={(value: any) => setFilterType(value)}>
                <SelectTrigger className="w-40">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="unread">Unread</SelectItem>
                  <SelectItem value="read">Read</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={addSampleNotification}
                className="gap-2"
              >
                <Plus className="h-4 w-4" />
                Add Sample
              </Button>
              {unreadCount > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleMarkAllAsRead}
                  className="gap-2"
                >
                  <BellOff className="h-4 w-4" />
                  Mark All Read
                </Button>
              )}
            </div>
          </div>
        </Card>

        {/* Notifications List */}
        <div className="space-y-3">
          {filteredNotifications.length === 0 ? (
            <Card className="p-8 text-center">
              <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No notifications found</h3>
              <p className="text-muted-foreground">
                {searchQuery || filterType !== 'all' 
                  ? 'Try adjusting your search or filter criteria'
                  : 'You\'re all caught up! No new notifications at the moment.'
                }
              </p>
            </Card>
          ) : (
            filteredNotifications.map((notification) => (
              <NotificationItem
                key={notification.id}
                notification={notification}
                onClick={handleNotificationClick}
                onMarkAsRead={handleMarkAsRead}
              />
            ))
          )}
        </div>

        {/* Summary */}
        {notifications.length > 0 && (
          <div className="mt-8 text-center text-sm text-muted-foreground">
            Showing {filteredNotifications.length} of {notifications.length} notifications
            {unreadCount > 0 && ` • ${unreadCount} unread`}
          </div>
        )}
      </div>

      {/* Modals */}
      <NotificationModal
        notification={selectedNotification}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />

      <UserOnboardingModal
        isOpen={isOnboardingModalOpen}
        onClose={() => setIsOnboardingModalOpen(false)}
        onComplete={handleOnboardingComplete}
      />
    </div>
  );
};