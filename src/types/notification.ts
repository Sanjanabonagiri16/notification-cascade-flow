export interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'user_onboarding' | 'general';
  title: string;
  message: string;
  timestamp: Date;
  isRead: boolean;
  actionType?: 'modal' | 'redirect' | 'user_onboarding';
  actionData?: any;
}

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