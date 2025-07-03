import { useState } from 'react';
import { Bell, Pin, PinOff, Download, Eye, Users, Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Notification } from '@/types/notification';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';

interface NotificationItemProps {
  notification: Notification;
  onClick: (notification: Notification) => void;
  onMarkAsRead: (notificationId: string) => void;
  onPinToggle?: (notificationId: string) => void;
  onDelete: (notificationId: string) => void;
}

export const NotificationItem = ({ notification, onClick, onMarkAsRead, onPinToggle, onDelete }: NotificationItemProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'message': return 'bg-primary text-primary-foreground';
      case 'alert': return 'bg-destructive text-destructive-foreground';
      case 'task': return 'bg-success text-success-foreground';
      case 'update': return 'bg-info text-info-foreground';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const handleClick = () => {
    if (!notification.isRead) {
      onMarkAsRead(notification.id);
    }
    onClick(notification);
  };

  // Action button logic
  const renderActionButton = () => {
    switch (notification.actionType) {
      case 'view':
        return <button className="ml-2 text-xs text-primary hover:underline flex items-center gap-1"><Eye className="h-4 w-4" />View Details</button>;
      case 'download':
        return <button className="ml-2 text-xs text-info hover:underline flex items-center gap-1"><Download className="h-4 w-4" />Download</button>;
      case 'join':
        return <button className="ml-2 text-xs text-success hover:underline flex items-center gap-1"><Users className="h-4 w-4" />Join Meeting</button>;
      default:
        return null;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      whileHover={{ scale: 1.02, boxShadow: '0 4px 24px rgba(0,0,0,0.10)' }}
      transition={{ duration: 0.3 }}
      className={cn(
        "p-4 cursor-pointer border-l-4 relative group",
        notification.isRead 
          ? "bg-notification-bg-read border-l-notification-read hover:bg-muted/30" 
          : "bg-notification-bg-unread border-l-notification-unread hover:bg-notification-bg-unread/70"
      )}
      onMouseEnter={() => { setIsHovered(true); setShowPreview(true); }}
      onMouseLeave={() => { setIsHovered(false); setShowPreview(false); }}
      onClick={handleClick}
    >
      {/* Pin Button */}
      <div className="absolute top-2 right-2 z-10 flex gap-1">
        <button
          className="p-1 rounded-full hover:bg-muted transition-colors"
          onClick={e => { e.stopPropagation(); onPinToggle && onPinToggle(notification.id); }}
          title={notification.pinned ? 'Unpin' : 'Pin'}
        >
          <AnimatePresence mode="wait" initial={false}>
            {notification.pinned ? (
              <motion.span
                key="pinned"
                initial={{ scale: 0.7, rotate: -20 }}
                animate={{ scale: 1, rotate: 0 }}
                exit={{ scale: 0.7, rotate: 20 }}
                transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                className="inline-block"
              >
                <Pin className="h-4 w-4 text-primary" fill="currentColor" />
              </motion.span>
            ) : (
              <motion.span
                key="unpinned"
                initial={{ scale: 0.7, rotate: 20 }}
                animate={{ scale: 1, rotate: 0 }}
                exit={{ scale: 0.7, rotate: -20 }}
                transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                className="inline-block"
              >
                <PinOff className="h-4 w-4 text-muted-foreground" />
              </motion.span>
            )}
          </AnimatePresence>
        </button>
        <motion.button
          whileHover={{ scale: 1.2, rotate: -10 }}
          whileTap={{ scale: 0.95, rotate: 0 }}
          className="p-1 rounded-full hover:bg-destructive/10 transition-colors"
          onClick={e => { e.stopPropagation(); onDelete(notification.id); }}
          title="Delete"
        >
          <Trash2 className="h-4 w-4 text-destructive" />
        </motion.button>
      </div>
      <div className="flex items-start gap-3">
        {/* Avatar */}
        {notification.fromUser?.avatarUrl ? (
          <img src={notification.fromUser.avatarUrl} alt={notification.fromUser.name || 'System'} className="h-10 w-10 rounded-full object-cover border border-border" />
        ) : (
          <div className={cn(
            "h-10 w-10 rounded-full flex items-center justify-center bg-muted text-muted-foreground border border-border",
            getTypeColor(notification.type)
          )}>
            <Bell className="h-5 w-5" />
          </div>
        )}
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
                {notification.pinned && (
                  <Badge variant="secondary" className="text-xs px-2 py-0 bg-primary/10 text-primary border-primary/20">Pinned</Badge>
                )}
                {!notification.isRead && (
                  <Badge variant="secondary" className="text-xs px-2 py-0 bg-primary/10 text-primary border-primary/20">New</Badge>
                )}
                {notification.priority === 'high' && (
                  <Badge variant="destructive" className="text-xs px-2 py-0 ml-1">High</Badge>
                )}
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">
                  {notification.fromUser?.name || 'System'}
                </span>
                <span className="text-xs text-muted-foreground">
                  • {formatDistanceToNow(notification.createdAt ? new Date(notification.createdAt) : new Date(), { addSuffix: true })}
                </span>
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
            <Badge variant="outline" className={cn("text-xs", getTypeColor(notification.type))}>
              {notification.type.charAt(0).toUpperCase() + notification.type.slice(1)}
            </Badge>
            {renderActionButton()}
          </div>
        </div>
      </div>
      {/* Preview on hover */}
      {showPreview && (
        <div className="absolute left-0 top-full mt-2 w-80 z-20 bg-popover text-popover-foreground rounded-lg shadow-lg p-4 border border-border">
          <div className="font-semibold mb-1">{notification.title}</div>
          <div className="text-xs text-muted-foreground mb-2">{notification.fromUser?.name || 'System'} • {formatDistanceToNow(notification.createdAt ? new Date(notification.createdAt) : new Date(), { addSuffix: true })}</div>
          <div className="text-sm mb-2">{notification.message}</div>
          {renderActionButton()}
        </div>
      )}
    </motion.div>
  );
};