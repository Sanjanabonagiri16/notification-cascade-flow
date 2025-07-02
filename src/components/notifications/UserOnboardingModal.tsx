import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, ArrowRight, CheckCircle, User, Mail, Lock, Globe, Users } from 'lucide-react';
import { UserOnboardingData } from '@/types/notification';

interface UserOnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: (data: UserOnboardingData) => void;
}

const countries = [
  'United States', 'United Kingdom', 'Canada', 'Australia', 'Germany', 
  'France', 'Japan', 'India', 'Brazil', 'Mexico', 'Other'
];

const genders = ['Male', 'Female', 'Non-binary', 'Prefer not to say'];

export const UserOnboardingModal = ({ isOpen, onClose, onComplete }: UserOnboardingModalProps) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<UserOnboardingData>({
    step1: { username: '', email: '', password: '' },
    step2: { country: '', gender: '' }
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateStep1 = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.step1.username.trim()) {
      newErrors.username = 'Username is required';
    } else if (formData.step1.username.length < 3) {
      newErrors.username = 'Username must be at least 3 characters';
    }
    
    if (!formData.step1.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.step1.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    if (!formData.step1.password.trim()) {
      newErrors.password = 'Password is required';
    } else if (formData.step1.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.step2.country) {
      newErrors.country = 'Please select a country';
    }
    
    if (!formData.step2.gender) {
      newErrors.gender = 'Please select a gender';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (currentStep === 1 && validateStep1()) {
      setCurrentStep(2);
    } else if (currentStep === 2 && validateStep2()) {
      setCurrentStep(3);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      setErrors({});
    }
  };

  const handleComplete = () => {
    onComplete(formData);
    onClose();
    // Reset form
    setCurrentStep(1);
    setFormData({
      step1: { username: '', email: '', password: '' },
      step2: { country: '', gender: '' }
    });
    setErrors({});
  };

  const updateStep1 = (field: keyof UserOnboardingData['step1'], value: string) => {
    setFormData(prev => ({
      ...prev,
      step1: { ...prev.step1, [field]: value }
    }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const updateStep2 = (field: keyof UserOnboardingData['step2'], value: string) => {
    setFormData(prev => ({
      ...prev,
      step2: { ...prev.step2, [field]: value }
    }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const renderStepIndicator = () => (
    <div className="flex items-center justify-center space-x-4 mb-6">
      {[1, 2, 3].map((step) => (
        <div key={step} className="flex items-center">
          <div className={`
            w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium
            ${currentStep >= step ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}
          `}>
            {step}
          </div>
          {step < 3 && (
            <div className={`w-12 h-0.5 mx-2 ${currentStep > step ? 'bg-primary' : 'bg-muted'}`} />
          )}
        </div>
      ))}
    </div>
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg mx-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center">User Onboarding</DialogTitle>
        </DialogHeader>

        {renderStepIndicator()}

        <div className="space-y-6">
          {/* Step 1: Basic Information */}
          {currentStep === 1 && (
            <Card className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <User className="h-5 w-5 text-primary" />
                <h3 className="text-lg font-semibold">Basic Information</h3>
              </div>
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="username">Username</Label>
                  <Input
                    id="username"
                    placeholder="Enter your username"
                    value={formData.step1.username}
                    onChange={(e) => updateStep1('username', e.target.value)}
                    className={errors.username ? 'border-destructive' : ''}
                  />
                  {errors.username && (
                    <p className="text-sm text-destructive mt-1">{errors.username}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="Enter your email"
                      className={`pl-10 ${errors.email ? 'border-destructive' : ''}`}
                      value={formData.step1.email}
                      onChange={(e) => updateStep1('email', e.target.value)}
                    />
                  </div>
                  {errors.email && (
                    <p className="text-sm text-destructive mt-1">{errors.email}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="password"
                      type="password"
                      placeholder="Enter your password"
                      className={`pl-10 ${errors.password ? 'border-destructive' : ''}`}
                      value={formData.step1.password}
                      onChange={(e) => updateStep1('password', e.target.value)}
                    />
                  </div>
                  {errors.password && (
                    <p className="text-sm text-destructive mt-1">{errors.password}</p>
                  )}
                </div>
              </div>
            </Card>
          )}

          {/* Step 2: Additional Details */}
          {currentStep === 2 && (
            <Card className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <Globe className="h-5 w-5 text-primary" />
                <h3 className="text-lg font-semibold">Additional Details</h3>
              </div>
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="country">Country</Label>
                  <Select
                    value={formData.step2.country}
                    onValueChange={(value) => updateStep2('country', value)}
                  >
                    <SelectTrigger className={errors.country ? 'border-destructive' : ''}>
                      <SelectValue placeholder="Select your country" />
                    </SelectTrigger>
                    <SelectContent>
                      {countries.map((country) => (
                        <SelectItem key={country} value={country}>
                          {country}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground mt-1">
                    This helps us provide location-specific features
                  </p>
                  {errors.country && (
                    <p className="text-sm text-destructive mt-1">{errors.country}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="gender">Gender</Label>
                  <Select
                    value={formData.step2.gender}
                    onValueChange={(value) => updateStep2('gender', value)}
                  >
                    <SelectTrigger className={errors.gender ? 'border-destructive' : ''}>
                      <SelectValue placeholder="Select your gender" />
                    </SelectTrigger>
                    <SelectContent>
                      {genders.map((gender) => (
                        <SelectItem key={gender} value={gender}>
                          {gender}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground mt-1">
                    Optional - helps us personalize your experience
                  </p>
                  {errors.gender && (
                    <p className="text-sm text-destructive mt-1">{errors.gender}</p>
                  )}
                </div>
              </div>
            </Card>
          )}

          {/* Step 3: Summary */}
          {currentStep === 3 && (
            <Card className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <CheckCircle className="h-5 w-5 text-success" />
                <h3 className="text-lg font-semibold">Review & Confirm</h3>
              </div>
              
              <div className="space-y-4">
                <div className="bg-muted/50 p-4 rounded-lg">
                  <h4 className="font-medium mb-2">Basic Information</h4>
                  <div className="space-y-1 text-sm">
                    <p><span className="font-medium">Username:</span> {formData.step1.username}</p>
                    <p><span className="font-medium">Email:</span> {formData.step1.email}</p>
                    <p><span className="font-medium">Password:</span> ••••••••</p>
                  </div>
                </div>

                <div className="bg-muted/50 p-4 rounded-lg">
                  <h4 className="font-medium mb-2">Additional Details</h4>
                  <div className="space-y-1 text-sm">
                    <p><span className="font-medium">Country:</span> {formData.step2.country}</p>
                    <p><span className="font-medium">Gender:</span> {formData.step2.gender}</p>
                  </div>
                </div>

                <div className="bg-primary/5 border border-primary/20 p-4 rounded-lg">
                  <p className="text-sm text-center">
                    By confirming, you agree to create your account with the information provided above.
                  </p>
                </div>
              </div>
            </Card>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between pt-4">
            {currentStep > 1 ? (
              <Button variant="outline" onClick={handleBack}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
            ) : (
              <div />
            )}

            {currentStep < 3 ? (
              <Button onClick={handleNext}>
                Next
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            ) : (
              <Button onClick={handleComplete} className="bg-success hover:bg-success/90">
                <CheckCircle className="h-4 w-4 mr-2" />
                Confirm
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};