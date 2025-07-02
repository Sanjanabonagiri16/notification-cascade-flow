-- Function to create initial notifications for new users
CREATE OR REPLACE FUNCTION public.create_initial_notifications()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert welcome notification
  INSERT INTO public.notifications (user_id, type, title, message, action_type)
  VALUES (
    NEW.id,
    'user_onboarding',
    'Complete Your Profile Setup',
    'Welcome! Please complete your profile setup to get the most out of our platform. This will only take a few minutes.',
    'user_onboarding'
  );

  -- Insert welcome success notification
  INSERT INTO public.notifications (user_id, type, title, message)
  VALUES (
    NEW.id,
    'success',
    'Welcome to the Platform!',
    'Your account has been created successfully. Explore all the features available to you.'
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to automatically create initial notifications for new users
CREATE OR REPLACE TRIGGER on_auth_user_created_notifications
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.create_initial_notifications();