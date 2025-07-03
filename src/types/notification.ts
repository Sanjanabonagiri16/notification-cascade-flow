export type Notification = {
  id: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  type: 'message' | 'alert' | 'task' | 'update';
  priority?: 'normal' | 'high';
  pinned?: boolean;
  fromUser?: {
    name: string;
    avatarUrl?: string;
  };
  actionType?: string;
};

export interface UserOnboardingData {
  step1: {
    username: string;
    email: string;
    password: string;
  };
  step2: {
    country: string;
    gender: string;
  };
}