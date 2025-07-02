import { useState } from 'react';
import { Bell } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Notification } from '@/types/notification';
import { cn } from '@/lib/utils';

interface NotificationItemProps {
  notification: Notification;
  onClick: (notification: Notification) => void;
  onMarkAsRead: (notificationId: string) => void;
}

export const NotificationItem = ({ notification, onClick, onMarkAsRead }: NotificationItemProps) => {
  const [isHovered, setIsHovered] = useState(false);

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'success': return 'bg-success text-success-foreground';
      case 'warning': return 'bg-warning text-warning-foreground';
      case 'error': return 'bg-destructive text-destructive-foreground';
      case 'info': return 'bg-info text-info-foreground';
      case 'user_onboarding': return 'bg-primary text-primary-foreground';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getTimeAgo = (timestamp: Date) => {
    const now = new Date();
    const diff = Math.floor((now.getTime() - timestamp.getTime()) / 1000);
    
    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  };

  const handleClick = () => {
    if (!notification.isRead) {
      onMarkAsRead(notification.id);
    }
    onClick(notification);
  };

  return (
    <Card
      className={cn(
        "p-4 cursor-pointer transition-all duration-200 hover:shadow-md border-l-4 animate-fade-in",
        notification.isRead 
          ? "bg-notification-bg-read border-l-notification-read hover:bg-muted/30" 
          : "bg-notification-bg-unread border-l-notification-unread hover:bg-notification-bg-unread/70",
        isHovered && "transform hover:scale-[1.02]"
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleClick}
    >
      <div className="flex items-start gap-3">
        <div className="relative">
          <div className={cn(
            "p-2 rounded-full flex items-center justify-center",
            getTypeColor(notification.type)
          )}>
            <Bell className="h-4 w-4" />
          </div>
          {!notification.isRead && (
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-primary rounded-full animate-pulse-ring"></div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 className={cn(
                  "font-medium text-sm truncate",
                  notification.isRead ? "text-muted-foreground" : "text-foreground"
                )}>
                  {notification.title}
                </h3>
                {!notification.isRead && (
                  <Badge variant="secondary" className="text-xs px-2 py-0 bg-primary/10 text-primary border-primary/20">
                    New
                  </Badge>
                )}
              </div>
              <p className={cn(
                "text-sm line-clamp-2",
                notification.isRead ? "text-muted-foreground" : "text-foreground/80"
              )}>
                {notification.message}
              </p>
            </div>
          </div>
          
          <div className="flex items-center justify-between mt-2">
            <span className="text-xs text-muted-foreground">
              {getTimeAgo(notification.timestamp)}
            </span>
            <Badge variant="outline" className={cn("text-xs", getTypeColor(notification.type))}>
              {notification.type.replace('_', ' ')}
            </Badge>
          </div>
        </div>
      </div>
    </Card>
  );
};