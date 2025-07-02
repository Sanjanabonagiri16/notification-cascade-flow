import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Notification } from '@/types/notification';
import { X, Clock } from 'lucide-react';

interface NotificationModalProps {
  notification: Notification | null;
  isOpen: boolean;
  onClose: () => void;
}

export const NotificationModal = ({ notification, isOpen, onClose }: NotificationModalProps) => {
  if (!notification) return null;

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

  const formatTimestamp = (timestamp: Date) => {
    return timestamp.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md mx-auto">
        <DialogHeader className="space-y-4">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl font-semibold">
              {notification.title}
            </DialogTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="flex items-center gap-2">
            <Badge className={getTypeColor(notification.type)}>
              {notification.type.replace('_', ' ')}
            </Badge>
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <Clock className="h-3 w-3" />
              {formatTimestamp(notification.timestamp)}
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4">
          <div className="bg-muted/50 p-4 rounded-lg">
            <p className="text-foreground leading-relaxed">
              {notification.message}
            </p>
          </div>

          {notification.actionType && (
            <div className="bg-primary/5 border border-primary/20 p-4 rounded-lg">
              <h4 className="font-medium text-primary mb-2">Action Required</h4>
              <p className="text-sm text-muted-foreground mb-3">
                This notification requires additional action from you.
              </p>
              <Button className="w-full">
                Complete Action
              </Button>
            </div>
          )}

          <div className="flex justify-end">
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};