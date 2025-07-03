import { useState, useEffect, useRef, useCallback } from 'react';
import { Bell, BellOff, Filter, Search, Plus, LogOut, Sun, Moon } from 'lucide-react';
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
import { useNotifications } from '@/hooks/useNotifications';
import { useAuth } from '@/hooks/useAuth';
import { Toggle } from '@/components/ui/toggle';
import { AnimatePresence, motion } from 'framer-motion';

const notificationTypes = [
  { label: 'All', value: 'all' },
  { label: 'Messages', value: 'message' },
  { label: 'Alerts', value: 'alert' },
  { label: 'Tasks', value: 'task' },
  { label: 'Updates', value: 'update' },
];

const PAGE_SIZE = 10;

export const NotificationsScreen = () => {
  const [filteredNotifications, setFilteredNotifications] = useState<Notification[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'unread' | 'read'>('all');
  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isOnboardingModalOpen, setIsOnboardingModalOpen] = useState(false);
  const [category, setCategory] = useState<'all' | 'message' | 'alert' | 'task' | 'update'>('all');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const loaderRef = useRef<HTMLDivElement | null>(null);
  
  const { user, signOut } = useAuth();
  const { notifications, loading, markAsRead, markAllAsRead, addSampleNotification, setNotifications, deleteNotification } = useNotifications();
  const { toast } = useToast();

  // Filter notifications
  useEffect(() => {
    let filtered = notifications;
    // Category filter
    if (category !== 'all') {
      filtered = filtered.filter(n => n.type === category);
    }
    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(n =>
        n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        n.message.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    // Read/unread/all filter
    if (filterType === 'unread') {
      filtered = filtered.filter(n => !n.isRead);
    } else if (filterType === 'read') {
      filtered = filtered.filter(n => n.isRead);
    } // if 'all', do nothing (show all)
    // Sort: pinned > unread > high-priority > createdAt desc
    filtered = filtered.sort((a, b) => {
      if (a.pinned && !b.pinned) return -1;
      if (!a.pinned && b.pinned) return 1;
      if (!a.isRead && b.isRead) return -1;
      if (a.isRead && !b.isRead) return 1;
      if (a.priority === 'high' && b.priority !== 'high') return -1;
      if (a.priority !== 'high' && b.priority === 'high') return 1;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
    setFilteredNotifications(filtered);
  }, [notifications, searchQuery, filterType, category]);

  // Paginate filteredNotifications
  const paginatedNotifications = filteredNotifications.slice(0, page * PAGE_SIZE);

  // Infinite scroll observer
  const handleObserver = useCallback((entries: IntersectionObserverEntry[]) => {
    const target = entries[0];
    if (target.isIntersecting && hasMore) {
      if (paginatedNotifications.length < filteredNotifications.length) {
        setPage((prev) => prev + 1);
      } else {
        setHasMore(false);
      }
    }
  }, [hasMore, paginatedNotifications.length, filteredNotifications.length]);

  useEffect(() => {
    setPage(1);
    setHasMore(true);
  }, [filteredNotifications]);

  useEffect(() => {
    const option = {
      root: null,
      rootMargin: '20px',
      threshold: 1.0
    };
    const observer = new window.IntersectionObserver(handleObserver, option);
    if (loaderRef.current) observer.observe(loaderRef.current);
    return () => {
      if (loaderRef.current) observer.unobserve(loaderRef.current);
    };
  }, [handleObserver]);

  const handleNotificationClick = (notification: Notification) => {
    setSelectedNotification(notification);
    
    if (notification.actionType === 'user_onboarding') {
      setIsOnboardingModalOpen(true);
    } else {
      setIsModalOpen(true);
    }
  };

  const handleMarkAsRead = (notificationId: string) => {
    console.log('handleMarkAsRead called with notificationId:', notificationId);
    if (!notificationId || typeof notificationId !== 'string') {
      console.warn('Skipping markAsRead for invalid notificationId:', notificationId);
      return;
    }
    markAsRead(notificationId);
  };

  const handleMarkAllAsRead = () => {
    markAllAsRead();
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

  const handleSignOut = async () => {
    const { error } = await signOut();
    if (error) {
      toast({
        title: "Error",
        description: "Failed to sign out",
        variant: "destructive"
      });
    }
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const handlePinToggle = (notificationId: string) => {
    setNotifications((prev) => prev.map(n => n.id === notificationId ? { ...n, pinned: !n.pinned } : n));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-4 animate-pulse" />
          <p className="text-muted-foreground">Loading notifications...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <div className="relative">
                <Bell className="h-8 w-8 text-primary" />
                {unreadCount > 0 && (
                  <span className="absolute -top-2 -right-2 px-2 py-1 text-xs bg-destructive text-destructive-foreground rounded-full">
                    {unreadCount}
                  </span>
                )}
              </div>
              <div>
                <h1 className="text-3xl font-bold">Notifications</h1>
                <p className="text-muted-foreground">
                  Stay updated with your latest activities and important updates
                </p>
              </div>
            </div>
            {user && (
              <div className="flex items-center gap-3">
                <Toggle
                  aria-label="Toggle dark mode"
                  onClick={() => {
                    const html = document.documentElement;
                    html.classList.toggle('dark');
                  }}
                  className="h-8 w-8 flex items-center justify-center border border-input bg-background hover:bg-muted transition-colors"
                >
                  {document.documentElement.classList.contains('dark') ? (
                    <Sun className="h-5 w-5 text-primary" />
                  ) : (
                    <Moon className="h-5 w-5 text-primary" />
                  )}
                </Toggle>
                <span className="text-sm text-muted-foreground">
                  {user.email}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSignOut}
                  className="gap-2"
                >
                  <LogOut className="h-4 w-4" />
                  Sign Out
                </Button>
              </div>
            )}
          </div>
          {/* Category Tabs */}
          <div className="flex gap-2 mt-4">
            {notificationTypes.map(type => (
              <button
                key={type.value}
                className={`px-3 py-1 rounded-full text-sm font-medium transition-colors border ${category === type.value ? 'bg-primary text-primary-foreground border-primary' : 'bg-muted text-muted-foreground border-transparent'} shadow-sm`}
                onClick={() => setCategory(type.value as typeof category)}
              >
                {type.label}
              </button>
            ))}
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
              <Select value={filterType} onValueChange={(value) => setFilterType(value as 'all' | 'unread' | 'read')}>
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
              <Button
                variant="outline"
                size="sm"
                onClick={handleMarkAllAsRead}
                className="gap-2"
              >
                <BellOff className="h-4 w-4" />
                Mark All Read
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  // Remove all read notifications
                  const unread = notifications.filter(n => !n.isRead);
                  // setNotifications(unread); // implement this in your hook
                  toast({ title: 'Cleared read notifications' });
                }}
                className="gap-2"
              >
                🧹
                Clear Read
              </Button>
            </div>
          </div>
        </Card>

        {/* Debugging output */}
        <div className="text-xs text-muted-foreground mb-2">
          Filter: {filterType} | Category: {category} | Showing: {filteredNotifications.length}
        </div>

        {/* Notifications List */}
        <div className="space-y-3">
          {filteredNotifications.length === 0 ? (
            <Card className="p-8 text-center">
              <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No notifications found</h3>
              <p className="text-muted-foreground">
                {searchQuery || filterType !== 'all' || category !== 'all'
                  ? 'Try adjusting your search, filter, or category.'
                  : 'You\'re all caught up! No new notifications at the moment.'}
              </p>
            </Card>
          ) : (
            <AnimatePresence>
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 30 }}
                transition={{ duration: 0.4, ease: 'easeOut' }}
                className="space-y-3"
              >
                {filteredNotifications.filter(n => n.id && typeof n.id === 'string').map((notification) => (
                  <NotificationItem
                    key={notification.id}
                    notification={notification}
                    onClick={() => handleNotificationClick(notification)}
                    onMarkAsRead={() => handleMarkAsRead(notification.id)}
                    onPinToggle={handlePinToggle}
                    onDelete={deleteNotification}
                  />
                ))}
              </motion.div>
            </AnimatePresence>
          )}
        </div>

        {/* Summary */}
        {notifications.length > 0 && (
          <div className="mt-8 text-center text-sm text-muted-foreground">
            Showing {paginatedNotifications.length} of {notifications.length} notifications
            {unreadCount > 0 && ` • ${unreadCount} unread`}
          </div>
        )}
      </div>

      {/* Modals */}
      <NotificationModal
        notification={selectedNotification && selectedNotification.id && typeof selectedNotification.id === 'string' ? selectedNotification : null}
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