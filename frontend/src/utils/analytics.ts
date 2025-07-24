// Google Analytics utility functions
declare global {
  interface Window {
    gtag: (...args: any[]) => void;
  }
}

// Track page views
export const trackPageView = (pageTitle: string, pagePath?: string) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('config', 'G-5HW5T4YR2J', {
      page_title: pageTitle,
      page_path: pagePath || window.location.pathname,
    });
  }
};

// Track custom events
export const trackEvent = (
  action: string,
  category: string,
  label?: string,
  value?: number
) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', action, {
      event_category: category,
      event_label: label,
      value: value,
    });
  }
};

// Track business plan generation
export const trackBusinessPlanGenerated = (planType: string) => {
  trackEvent('generate_business_plan', 'business_plan', planType);
};

// Track financial plan generation
export const trackFinancialPlanGenerated = () => {
  trackEvent('generate_financial_plan', 'financial_plan');
};

// Track user registration
export const trackUserRegistration = (method: string) => {
  trackEvent('sign_up', 'engagement', method);
};

// Track user login
export const trackUserLogin = (method: string) => {
  trackEvent('login', 'engagement', method);
};

// Track discovery stage completion
export const trackDiscoveryStage = (stage: string) => {
  trackEvent('complete_discovery_stage', 'discovery', stage);
};

// Track subscription events
export const trackSubscription = (plan: string, action: 'start' | 'cancel') => {
  trackEvent(`${action}_subscription`, 'subscription', plan);
};

// Track course enrollment
export const trackCourseEnrollment = (courseName: string) => {
  trackEvent('enroll_course', 'learning', courseName);
};

// Track coach booking
export const trackCoachBooking = (coachName: string) => {
  trackEvent('book_coach', 'coaching', coachName);
}; 