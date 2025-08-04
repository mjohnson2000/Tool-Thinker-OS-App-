import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Landing } from './components/idea-flow/Landing';
import { IdeaSelection } from './components/idea-flow/IdeaSelection';
import { CustomerSelection } from './components/idea-flow/CustomerSelection';
import { JobSelection } from './components/idea-flow/JobSelection';
import { LocationSelection } from './components/idea-flow/LocationSelection';
import { ScheduleGoalsSelection } from './components/idea-flow/ScheduleGoalsSelection';
import { Summary } from './components/idea-flow/Summary';
import { ExistingIdea } from './components/idea-flow/ExistingIdea';
import './index.css';
import logo from './assets/logo.png';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Signup } from './components/auth/Signup';
import { Login } from './components/auth/Login';
import { Profile } from './components/auth/Profile';
import { FaUserCircle } from 'react-icons/fa';
import { ResetPassword } from './components/auth/ResetPassword';
import { Routes, Route, useParams, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { DescribeCustomer } from './components/idea-flow/DescribeCustomer';
import { DescribeProblem } from './components/idea-flow/DescribeProblem';
import { DescribeSolution } from './components/idea-flow/DescribeSolution';
import { DescribeCompetition } from './components/idea-flow/DescribeCompetition';
import { Guidance } from './components/idea-flow/Guidance';
import { ProgressTracker } from './components/idea-flow/ProgressTracker';
import type { BusinessArea } from './components/idea-flow/IdeaSelection';
import type { CustomerOption } from './components/idea-flow/CustomerSelection';
import type { JobOption } from './components/idea-flow/JobSelection';
import { NextStepsHub } from './components/idea-flow/NextStepsHub';
import { SubscriptionPage } from './components/auth/SubscriptionPage';
import { CoachMarketplace } from './components/learning/CoachMarketplace';
import { CourseLibrary } from './components/learning/CourseLibrary';

import WebLandingPage from './components/WebLandingPage';
import StartupPlanDashboard from './components/business-plan/StartupPlanDashboard';
import StartupPlanEditPage from './components/business-plan/StartupPlanEditPage';
import StartupPlanViewPage from './components/business-plan/StartupPlanViewPage';
import { StartupPlanPageDiscovery } from './components/idea-discovery/StartupPlanPageDiscovery';
import { LaunchPreparationPage } from './components/idea-flow/LaunchPreparationPage';
import { SolutionSelectionPage } from './components/idea-flow/SolutionSelectionPage';
import type { SolutionOption } from './components/idea-flow/SolutionSelectionPage';
import { IdeaTypeSelection } from './components/idea-flow/IdeaTypeSelection';
import { SkillAssessment } from './components/idea-flow/SkillAssessment';
import type { SkillAssessmentResult } from './components/idea-flow/SkillAssessment';

import { MvpBuilderPage } from './components/idea-flow/MvpBuilderPage';
import { ValidateAssumptionsPage } from './components/idea-flow/ValidateAssumptionsPage';
import { ExploreOpportunitiesPage } from './components/idea-flow/ExploreOpportunitiesPage';
import { CustomerValidationPage } from './components/idea-flow/CustomerValidationPage';
import { IterateOrLaunchPage } from './components/idea-flow/IterateOrLaunchPage';
import AdminLogsPage from './components/business-plan/AdminLogsPage';
import { AutomatedDiscoveryPage } from './components/idea-discovery/AutomatedDiscoveryPage';
import { PrematureJobDiscovery } from './components/idea-flow/PrematureJobDiscovery';
import { trackPageView, trackEvent } from './utils/analytics';
import { ErrorNotification } from './components/common/ErrorNotification';

const AppContainer = styled.div`
  min-height: 100vh;
  background: #f5f5f7;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2.5rem 1.5rem 2.5rem 1.5rem;
`;

const Footer = styled.footer`
  width: 100%;
  text-align: center;
  padding: 1.2rem 0 1.2rem 0;
  color: #888;
  font-size: 1rem;
  background: #f7f7fa;
  letter-spacing: 0.01em;
  position: fixed;
  left: 0;
  bottom: 0;
  z-index: 1000;
  box-shadow: 0 -2px 12px rgba(0,0,0,0.04);
  backdrop-filter: blur(8px);
`;

const FooterMoneyImage = styled.img`
  width: 150px;
  height: auto;
  border-radius: 6px;
  margin: 0 auto 0.8rem auto;
  opacity: 0.3;
  transition: opacity 0.3s ease;
  filter: grayscale(30%) brightness(1.2) contrast(1.3);
  display: block;
  
  &:hover {
    opacity: 0.5;
  }
`;

const NavBar = styled.div`
  width: 100%;
  max-width: 480px;
  display: flex;
  justify-content: flex-start;
  margin-bottom: 2rem;
`;

const Logo = styled.img`
  position: fixed;
  top: 24px;
  left: 24px;
  height: 80px;
  width: 80px;
  margin-right: 1rem;
  cursor: pointer;
  user-select: none;
  z-index: 1101;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  filter: drop-shadow(0 2px 8px rgba(0, 0, 0, 0.1));
  
  &:hover {
    transform: scale(1.05);
    filter: drop-shadow(0 4px 12px rgba(0, 0, 0, 0.15));
  }
  
  @media (max-width: 768px) {
    height: 70px;
    width: 70px;
    top: 20px;
    left: 20px;
  }
`;

const NavButton = styled.button`
  background: linear-gradient(135deg, #181a1b 0%, #2d2d2d 100%);
  color: #ffffff;
  border: none;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  padding: 0.7rem 1.4rem;
  border-radius: 12px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 4px 12px rgba(24, 26, 27, 0.2);
  letter-spacing: 0.02em;
  
  &:hover {
    background: linear-gradient(135deg, #2d2d2d 0%, #181a1b 100%);
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(24, 26, 27, 0.3);
  }
  
  &:active {
    transform: translateY(0px);
  }
  
  &:focus {
    outline: none;
    box-shadow: 0 0 0 3px rgba(24, 26, 27, 0.2);
  }
  
  @media (max-width: 768px) {
    padding: 0.6rem 1.2rem;
    font-size: 0.9rem;
  }
`;

const TopBar = styled.div`
  position: fixed;
  top: 0;
  right: 0;
  width: 100vw;
  display: flex;
  justify-content: flex-end;
  align-items: center;
  padding: 1.5rem 2.5rem;
  z-index: 1000;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(248, 249, 250, 0.95) 100%);
  backdrop-filter: blur(20px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  
  @media (max-width: 768px) {
    padding: 1rem 1.5rem;
  }
`;

const TopBarRight = styled.div`
  display: flex;
  align-items: center;
  gap: 1.2rem;
  padding: 0.5rem;
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.3);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  
  &:hover {
    background: rgba(255, 255, 255, 0.4);
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  }
  
  @media (max-width: 768px) {
    gap: 0.8rem;
    padding: 0.4rem;
  }
`;

const AvatarButton = styled.button`
  background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);
  border: 2px solid rgba(255, 255, 255, 0.3);
  padding: 0;
  margin-left: 0;
  cursor: pointer;
  border-radius: 50%;
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  position: relative;
  overflow: visible;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent);
    transition: left 0.5s;
  }
  
  &:hover {
    transform: scale(1.05);
    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.15);
    border-color: rgba(255, 255, 255, 0.5);
    
    &::before {
      left: 100%;
    }
  }
  
  &:focus {
    outline: none;
    box-shadow: 0 0 0 3px rgba(24, 26, 27, 0.1);
  }
  
  @media (max-width: 768px) {
    width: 44px;
    height: 44px;
  }
`;

const AvatarImg = styled.img`
  width: 36px;
  height: 36px;
  border-radius: 50%;
  object-fit: cover;
  background: #e5e5e5;
  margin-top: 0.3rem;
`;

const LoginButton = styled.button`
  background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);
  color: #181a1b;
  border: 2px solid rgba(24, 26, 27, 0.15);
  border-radius: 12px;
  padding: 0.7rem 1.4rem;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  margin-left: 0;
  box-shadow: 0 2px 8px rgba(0,0,0,0.06);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  letter-spacing: 0.02em;
  
  &:hover {
    background: linear-gradient(135deg, #f8f9fa 0%, #f1f3f4 100%);
    border-color: rgba(24, 26, 27, 0.25);
    color: #181a1b;
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  }
  
  &:focus {
    outline: none;
    box-shadow: 0 0 0 3px rgba(24, 26, 27, 0.1);
  }
  
  @media (max-width: 768px) {
    padding: 0.6rem 1.2rem;
    font-size: 0.9rem;
  }
`;

const SignupFreeButton = styled.button`
  background: linear-gradient(135deg, #181a1b 0%, #2d2d2d 100%);
  color: #ffffff;
  border: none;
  border-radius: 12px;
  padding: 0.7rem 1.4rem;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  margin-left: 1rem;
  box-shadow: 0 4px 12px rgba(24, 26, 27, 0.2);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  letter-spacing: 0.02em;
  
  &:hover {
    background: linear-gradient(135deg, #2d2d2d 0%, #181a1b 100%);
    color: #ffffff;
    transform: translateY(-1px);
    box-shadow: 0 6px 16px rgba(24, 26, 27, 0.3);
  }
  
  &:focus {
    outline: none;
    box-shadow: 0 0 0 3px rgba(24, 26, 27, 0.2);
  }
  
  @media (max-width: 768px) {
    padding: 0.6rem 1.2rem;
    font-size: 0.9rem;
  }
`;

const SidebarToggle = styled.button`
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);
  color: #181a1b;
  border: 2px solid #e9ecef;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 2px 8px rgba(0,0,0,0.06);
  z-index: 10;
  
  &:hover {
    background: linear-gradient(135deg, #f8f9fa 0%, #f1f3f4 100%);
    border-color: #d1d5db;
    transform: scale(1.1);
    box-shadow: 0 4px 12px rgba(0,0,0,0.12);
  }
  
  &:focus {
    outline: none;
    box-shadow: 0 0 0 3px rgba(24, 26, 27, 0.1);
  }
  
  @media (max-width: 1024px) {
    position: fixed;
    top: 1rem;
    right: 1rem;
    z-index: 1001;
  }
`;

const FloatingToggle = styled.button`
  position: fixed;
  top: 300px;
  left: 1rem;
  background: linear-gradient(135deg, #181a1b 0%, #2d2d2d 100%);
  color: #ffffff;
  border: 2px solid #181a1b;
  border-radius: 50%;
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 4px 16px rgba(24, 26, 27, 0.25);
  z-index: 1000;
  font-size: 1.2rem;
  font-weight: 600;
  
  &:hover {
    background: linear-gradient(135deg, #2d2d2d 0%, #181a1b 100%);
    transform: scale(1.1);
    box-shadow: 0 6px 20px rgba(24, 26, 27, 0.35);
  }
  
  &:focus {
    outline: none;
    box-shadow: 0 0 0 3px rgba(24, 26, 27, 0.2);
  }
  
  @media (max-width: 1024px) {
    top: 280px;
    left: 1rem;
    z-index: 1002;
  }
`;

const MobileOverlay = styled.div<{ $isVisible: boolean }>`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 999;
  opacity: ${({ $isVisible }) => $isVisible ? '1' : '0'};
  visibility: ${({ $isVisible }) => $isVisible ? 'visible' : 'hidden'};
  transition: all 0.3s ease;
  
  @media (min-width: 1025px) {
    display: none;
  }
`;

const TopBarAvatar = styled.div`
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: linear-gradient(135deg, #181a1b 0%, #2d2d2d 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.3rem;
  color: #ffffff;
  font-weight: 700;
  box-shadow: 0 2px 8px rgba(24, 26, 27, 0.2);
`;

const TopBarAvatarImg = styled.img`
  width: 44px;
  height: 44px;
  border-radius: 50%;
  object-fit: cover;
  background: #e5e5e5;
  border: 2px solid rgba(255, 255, 255, 0.3);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
`;

const PlanBadge = styled.div`
  background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);
  color: #181a1b;
  font-size: 0.8rem;
  font-weight: 700;
  border-radius: 12px;
  border: 2px solid rgba(24, 26, 27, 0.2);
  padding: 0.3rem 0.8rem;
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 52px;
  min-height: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  letter-spacing: 0.02em;
  user-select: none;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  
  &:hover {
    background: linear-gradient(135deg, #f8f9fa 0%, #f1f3f4 100%);
    border-color: rgba(24, 26, 27, 0.3);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
  }
`;

const defaultAvatar = 'https://ui-avatars.com/api/?name=User&background=007AFF&color=fff&size=128';

type Step = 'landing' | 'idea' | 'ideaType' | 'location' | 'skillAssessment' | 'scheduleGoals' | 'customer' | 'job' | 'summary' | 'app' | 'login' | 'signup' | 'profile' | 'existingIdea' | 'describeCustomer' | 'describeProblem' | 'describeSolution' | 'describeCompetition' | 'customerGuidance' | 'problemGuidance' | 'competitionGuidance' | 'businessPlan' | 'prematureJobDiscovery' | 'marketEvaluation' | 'evaluationScore' | 'nextStepsHub' | 'startupPlan' | 'launch' | 'solution';

type EntryPoint = 'idea' | 'customer';

const PageLayout = styled.div`
  display: flex;
  width: 100%;
  max-width: 1400px;
  margin: 6rem auto 2rem auto;
  padding: 0 2rem 200px 2rem;
  gap: 3rem;
  position: relative;
  overflow-x: hidden;
  
  &::before {
    content: '';
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: 
      radial-gradient(circle at 20% 80%, rgba(24, 26, 27, 0.03) 0%, transparent 50%),
      radial-gradient(circle at 80% 20%, rgba(24, 26, 27, 0.02) 0%, transparent 50%),
      radial-gradient(circle at 40% 40%, rgba(24, 26, 27, 0.01) 0%, transparent 50%);
    pointer-events: none;
    z-index: -1;
    animation: parallax 20s ease-in-out infinite;
  }
  
  @keyframes parallax {
    0%, 100% { transform: translateY(0px) translateX(0px); }
    25% { transform: translateY(-10px) translateX(5px); }
    50% { transform: translateY(-5px) translateX(-5px); }
    75% { transform: translateY(10px) translateX(3px); }
  }
`;

const MainContent = styled.main<{ isExpanded: boolean }>`
  flex: ${({ isExpanded }) => (isExpanded ? '1' : '3')};
  transition: flex 0.3s ease-in-out;
`;

const Sidebar = styled.aside<{ $isCollapsed: boolean }>`
  flex: ${({ $isCollapsed }) => $isCollapsed ? '0' : '1'};
  position: sticky;
  top: 158px;
  height: fit-content;
  margin-right: ${({ $isCollapsed }) => $isCollapsed ? '0' : '2rem'};
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;
  min-width: ${({ $isCollapsed }) => $isCollapsed ? '0' : '250px'};
  max-width: ${({ $isCollapsed }) => $isCollapsed ? '0' : '300px'};
  
  @media (max-width: 1024px) {
    position: fixed;
    left: ${({ $isCollapsed }) => $isCollapsed ? '-100%' : '0'};
    top: 0;
    height: 100vh;
    z-index: 1000;
    background: rgba(255, 255, 255, 0.95);
    backdrop-filter: blur(10px);
    margin-right: 0;
    min-width: 280px;
    max-width: 320px;
  }
`;

const steps = [
  { key: 'ideaType', label: 'Type' },
  { key: 'location', label: 'Location' },
  { key: 'idea', label: 'Interest' },
  { key: 'scheduleGoals', label: 'Schedule & Goals' },
  { key: 'customer', label: 'Customer' },
  { key: 'job', label: 'Problem' },
  { key: 'solution', label: 'Solution' },
  { key: 'skillAssessment', label: 'Skills' },
  { key: 'businessPlan', label: 'Ideas', isPremium: true },
  { key: 'nextStepsHub', label: 'Discovery', isPremium: true },
  { key: 'launch', label: 'Launch', isPremium: true },
];

const prematureIdeaFlowSteps = [
  { key: 'existingIdea', label: '1. Your Idea' },
  { key: 'describeCustomer', label: '2. Customer' },
  { key: 'describeProblem', label: '3. Problem' },
  { key: 'describeSolution', label: '4. Solution' },
  { key: 'businessPlan', label: '5. New Idea', isPremium: true },
  { key: 'marketEvaluation', label: '6. Market Evaluation', isPremium: true },
  { key: 'evaluationScore', label: '7. Validation Score', isPremium: true },
  { key: 'nextStepsHub', label: '8. Discovery', isPremium: true },
  { key: 'launch', label: '9. Launch', isPremium: true },
];

const flowStepKeys = [...steps.map(s => s.key), ...prematureIdeaFlowSteps.map(s => s.key)];

interface AppState {
  currentStep: Step;
  entryPoint: EntryPoint;
  idea: {
    interests: string;
    area: BusinessArea | null;
    existingIdeaText?: string;
  };
  ideaType: { id: string; title: string; description: string; icon: string; examples: string[] } | null;
  location: { city: string; region: string; country: string } | null;
  skillAssessment: SkillAssessmentResult | null;
  scheduleGoals: { hoursPerWeek: number; incomeTarget: number } | null;
  customer: CustomerOption | null;
  job: JobOption | null;
  problemDescription: string | null;
  solutionDescription: string | null;
  solution: SolutionOption | null;
  competitionDescription: string | null;
  isTrackerCollapsed: boolean;
  stepBeforeAuth: Step | null;
}

const initialAppState: AppState = {
  currentStep: 'landing',
  entryPoint: 'idea',
  idea: {
    interests: '',
    area: null,
    existingIdeaText: '',
  },
  ideaType: null,
  location: null,
  skillAssessment: null,
  scheduleGoals: null,
  customer: null,
  job: null,
  problemDescription: null,
  solutionDescription: null,
  solution: null,
  competitionDescription: null,
  isTrackerCollapsed: false,
  stepBeforeAuth: null,
};

function ResetPasswordRoute() {
  const { token } = useParams<{ token: string }>();
  const { resetPassword } = useAuth();
  if (!token) return <Navigate to="/login" />;
  return <ResetPassword token={token} onResetPassword={resetPassword} />;
}

function AppContent() {
  // All hooks must be at the top, before any conditional returns
  const { isLoading, isAuthenticated, signup, login, user, requestPasswordReset, mockUpgradeToPremium } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [appState, setAppState] = useState<AppState>(() => {
    try {
      const storedState = window.localStorage.getItem('appState');
      console.log('Loaded appState from localStorage:', storedState);
      return storedState ? JSON.parse(storedState) : initialAppState;
    } catch (error) {
      console.error("Could not load state from localStorage", error);
      return initialAppState;
    }
  });

  // Error notification state
  const [errorNotification, setErrorNotification] = useState<{
    isVisible: boolean;
    message: string;
    type: 'error' | 'warning' | 'info';
  }>({
    isVisible: false,
    message: '',
    type: 'error'
  });

  const showError = (message: string, type: 'error' | 'warning' | 'info' = 'error') => {
    setErrorNotification({
      isVisible: true,
      message,
      type
    });
  };

  const hideError = () => {
    setErrorNotification(prev => ({ ...prev, isVisible: false }));
  };

  useEffect(() => {
    console.log('Saving appState to localStorage:', appState);
    try {
      window.localStorage.setItem('appState', JSON.stringify(appState));
    } catch (error) {
      console.error("Could not save state to localStorage", error);
    }
  }, [appState]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('profile') === '1') {
      setAppState(prev => ({ ...prev, currentStep: 'profile', stepBeforeAuth: prev.currentStep }));
      // Remove ?profile=1 from the URL after opening
      params.delete('profile');
      navigate({ pathname: location.pathname, search: params.toString() }, { replace: true });
    }
  }, [location.search]);

  useEffect(() => {
    console.log('useEffect: isAuthenticated', isAuthenticated, 'currentStep', appState.currentStep);
    if (isAuthenticated && appState.currentStep === 'summary') {
      setAppState(prev => ({ ...prev, currentStep: 'businessPlan' }));
    }
  }, [isAuthenticated, appState.currentStep]);

  // Track page views when currentStep changes
  useEffect(() => {
    const pageTitles: Record<Step, string> = {
      landing: 'Landing Page',
      idea: 'Idea Selection',
      ideaType: 'Idea Type Selection',
      location: 'Location Selection',
      skillAssessment: 'Skill Assessment',
      scheduleGoals: 'Schedule & Goals',
      customer: 'Customer Selection',
      job: 'Job Selection',
      summary: 'Summary',
      app: 'App Dashboard',
      login: 'Login',
      signup: 'Sign Up',
      profile: 'Profile',
      existingIdea: 'Existing Idea',
      describeCustomer: 'Describe Customer',
      describeProblem: 'Describe Problem',
      describeSolution: 'Describe Solution',
      describeCompetition: 'Describe Competition',
      customerGuidance: 'Customer Guidance',
      problemGuidance: 'Problem Guidance',
      competitionGuidance: 'Competition Guidance',
      businessPlan: 'Business Plan',
      prematureJobDiscovery: 'Premature Job Discovery',
      marketEvaluation: 'Market Evaluation',
      evaluationScore: 'Evaluation Score',
      nextStepsHub: 'Next Steps Hub',
      startupPlan: 'Startup Plan',
      launch: 'Launch Preparation',
      solution: 'Solution Selection'
    };

    const pageTitle = pageTitles[appState.currentStep] || 'Unknown Page';
    trackPageView(pageTitle, `/${appState.currentStep}`);
  }, [appState.currentStep]);

  // Now safe to do conditional returns
  if (isLoading) {
    return <div>Loading...</div>;
  }

  const { 
    currentStep, entryPoint, idea, ideaType, location: userLocation, skillAssessment, scheduleGoals, customer, job, problemDescription, 
    solutionDescription, solution, competitionDescription, isTrackerCollapsed, stepBeforeAuth 
  } = appState;

  console.log('AppContent state:', {
    currentStep,
    entryPoint,
    idea,
    customer,
    job,
    isAuthenticated
  });

  const isFlowStep = flowStepKeys.includes(currentStep) && currentStep !== 'login' && currentStep !== 'signup';
  const activeFlowSteps = entryPoint === 'idea' ? steps : prematureIdeaFlowSteps;

  const stepsToHidePremature = ['marketEvaluation', 'evaluationScore'];

  function handleStepClick(step: string) {
    if (activeFlowSteps.some(s => s.key === step)) {
      setAppState(prev => ({ ...prev, currentStep: step as Step }));
    }
  }

  function handleLandingSelect(step: EntryPoint) {
    setAppState(prev => ({ 
      ...prev, 
      entryPoint: step, 
      currentStep: step === 'customer' ? 'existingIdea' : 'ideaType'
    }));
  }

  function handleIdeaTypeSelect(ideaType: { id: string; title: string; description: string; icon: string; examples: string[] }) {
    setAppState(prev => ({ ...prev, ideaType, currentStep: 'location' }));
  }

  function handleIdeaSelect(selectedIdea: { interests: string; area: BusinessArea }) {
    setAppState(prev => ({ ...prev, idea: selectedIdea, currentStep: 'scheduleGoals' }));
  }



  function handleLocationSelect(location: { city: string; region: string; country: string }) {
    setAppState(prev => ({ ...prev, location, currentStep: 'idea' }));
  }

  function handleSkillAssessmentComplete(assessment: SkillAssessmentResult) {
    console.log('Skill assessment completed:', assessment);
    setAppState(prev => ({ ...prev, skillAssessment: assessment, currentStep: 'businessPlan' }));
  }

  function handleScheduleGoalsSelect(scheduleGoals: { hoursPerWeek: number; incomeTarget: number }) {
    setAppState(prev => ({ ...prev, scheduleGoals, currentStep: 'customer' }));
  }

  function handleCustomerSelect(selectedCustomer: CustomerOption) {
    console.log('Customer selected:', selectedCustomer);
    setAppState(prev => ({ ...prev, customer: selectedCustomer, currentStep: 'job' }));
  }

  function handleJobSelect(selectedJob: JobOption) {
    console.log('Job selected:', selectedJob);
    setAppState(prev => {
      const newState = { ...prev, job: selectedJob, currentStep: 'solution' as Step };
      console.log('Setting appState to:', newState);
      return newState;
    });
  }

  function handleExistingIdeaSubmit(ideaText: string) {
    setAppState(prev => ({ 
      ...prev, 
      idea: { ...prev.idea, existingIdeaText: ideaText, area: { id: 'custom', title: 'Custom Idea', description: ideaText, icon: '💡' } },
      currentStep: 'describeCustomer' 
    }));
  }

  function handleDescribeCustomerSubmit(description: string | null) {
    if (description) {
      setAppState(prev => ({ 
        ...prev, 
        customer: { id: 'custom', title: 'Custom Customer', description: description, icon: '👤' },
        currentStep: 'describeProblem'
      }));
    } else {
      setAppState(prev => ({ ...prev, currentStep: 'customerGuidance' }));
    }
  }

  function handleDescribeProblemSubmit(description: string | null) {
    setAppState(prev => ({
      ...prev,
      problemDescription: description,
      job: description
        ? { id: 'custom', title: description, description, icon: '💡' }
        : null,
      currentStep: description === null ? 'problemGuidance' : 'describeSolution'
    }));
  }

  function handleDescribeSolutionSubmit(description: string) {
    setAppState(prev => ({ ...prev, solutionDescription: description, currentStep: entryPoint === 'idea' ? 'solution' : 'businessPlan' }));
  }

  function handleDescribeCompetitionSubmit(description: string | null) {
    setAppState(prev => ({ ...prev, competitionDescription: description, currentStep: 'businessPlan' }));
  }

  function handleRestart() {
    setAppState(prev => ({
      ...initialAppState,
      isTrackerCollapsed: prev.isTrackerCollapsed
    }));
  }

  function handleBack() {
    const stepMap: Partial<Record<Step, Step>> = {
      idea: 'landing',
      location: 'ideaType',
      skillAssessment: 'solution',
      scheduleGoals: 'idea',
      customer: entryPoint === 'idea' ? 'scheduleGoals' : 'landing',
      job: 'customer',
      summary: 'job',
      login: stepBeforeAuth || 'summary',
      profile: stepBeforeAuth || 'summary',
      existingIdea: 'landing',
      describeCustomer: 'existingIdea',
      describeProblem: 'describeCustomer',
      describeSolution: 'describeProblem',
      describeCompetition: 'describeSolution',
      customerGuidance: 'describeCustomer',
      businessPlan: 'skillAssessment',
    };

    if (currentStep === 'customer' && idea.existingIdeaText) {
      setAppState(prev => ({ ...prev, currentStep: 'describeCustomer' }));
      return;
    }
    if (currentStep === 'job' && customer?.title === 'Custom Customer') {
      setAppState(prev => ({ ...prev, currentStep: 'describeCustomer' }));
      return;
    }
    
    const prevStep = stepMap[currentStep];
    if (prevStep) {
      setAppState(prev => ({ ...prev, currentStep: prevStep }));
    }
  }

  function handleClearStep() {
    const stepToClear = appState.currentStep;
    const newState = { ...appState };

    switch (stepToClear) {
      case 'existingIdea':
        newState.idea.existingIdeaText = '';
        break;
      case 'describeCustomer':
        newState.customer = null;
        break;
      case 'describeProblem':
        newState.problemDescription = null;
        break;
      case 'describeSolution':
        newState.solutionDescription = null;
        break;
      case 'describeCompetition':
        newState.competitionDescription = null;
        break;
      default:
        return; 
    }
    setAppState(newState);
  }

  function handleProblemGuidanceContinue() {
    setAppState(prev => ({ ...prev, currentStep: 'prematureJobDiscovery' }));
  }

  function handleSolutionSelect(selectedSolution: SolutionOption) {
    setAppState(prev => ({ ...prev, solution: selectedSolution, solutionDescription: selectedSolution.description, currentStep: 'skillAssessment' }));
  }

  const PLAN_DISPLAY_NAMES: Record<string, string> = {
    free: 'Free',
    basic: 'Basic',
    pro: 'Pro',
    elite: 'Elite',
  };

  // Debug: log appState before rendering
  console.log('AppContent about to render, appState:', appState);
  if (currentStep === 'summary') {
    console.log('Summary render check:', { idea, customer, job });
  }

  if (currentStep === 'customer') {
    console.log('Rendering CustomerSelection with idea.area:', idea.area);
  }

  return (
    <>
      {/* Always render the Profile modal/page when currentStep === 'profile' */}
      {currentStep === 'profile' && (
        <Profile 
          setAppState={setAppState} 
          isTrackerCollapsed={appState.isTrackerCollapsed}
          onClose={() => setAppState(prev => ({ ...prev, currentStep: prev.stepBeforeAuth || 'landing' }))}
        />
      )}
      <Routes>
        <Route path="/" element={<WebLandingPage />} />
        <Route path="/app" element={
          <AppContainer>
            <Logo src={logo} alt="ToolThinker Logo" onClick={() => {
              setAppState(prev => ({ ...initialAppState, isTrackerCollapsed: prev.isTrackerCollapsed }));
              navigate('/app');
            }} />
            <TopBar>
              {!isAuthenticated ? (
                <>
                  <LoginButton onClick={() => setAppState(prev => ({...prev, currentStep: 'login'}))} aria-label="Log In">
                    Log in
                  </LoginButton>
                  <SignupFreeButton onClick={() => setAppState(prev => ({...prev, currentStep: 'signup'}))} aria-label="Sign up for free">
                    Sign up for free
                  </SignupFreeButton>
                </>
              ) : (
                <TopBarRight>
                  <NavButton 
                    onClick={() => window.location.href = '/plans'} 
                    style={{
                      background: '#000',
                      color: '#fff',
                      border: 'none',
                      fontWeight: 600
                    }}>
                    My Business Ideas
                  </NavButton>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                    <AvatarButton onClick={() => {
                      setAppState(prev => ({ ...prev, stepBeforeAuth: currentStep, currentStep: 'profile' }));
                    }} aria-label="Profile">
                      {user && user.profilePic ? (
                        <TopBarAvatarImg src={user.profilePic} alt="Profile" />
                      ) : user && user.email ? (
                        <TopBarAvatar>
                          {user.email
                            .split('@')[0]
                            .split(/[._-]/)
                            .map(part => part[0]?.toUpperCase())
                            .join('')
                            .slice(0, 2) || 'U'}
                        </TopBarAvatar>
                      ) : (
                        <AvatarImg src={defaultAvatar} alt="Avatar" />
                      )}
                    </AvatarButton>
                    {user && location.pathname !== '/' && (
                      <PlanBadge>
                        {!user?.isSubscribed
                          ? PLAN_DISPLAY_NAMES['free']
                          : PLAN_DISPLAY_NAMES[user?.subscriptionTier || 'basic']}
                      </PlanBadge>
                    )}
                  </div>
                </TopBarRight>
              )}
            </TopBar>
            {/* Always render login/signup forms when currentStep is 'login' or 'signup' */}
            {currentStep === 'login' && (
              <React.Suspense fallback={<div style={{textAlign: 'center', marginTop: '2rem'}}>Loading login form...</div>}>
                <Login
                  onLogin={async (email, password) => {
                    try {
                      await login(email, password);
                      setAppState(prev => ({ ...prev, currentStep: stepBeforeAuth || 'landing' }));
                    } catch (err: any) {
                      showError(err.message || 'Failed to log in. Please try again.');
                    }
                  }}
                  onSignup={() => setAppState(prev => ({ ...prev, currentStep: 'signup' }))}
                  onRequestPasswordReset={requestPasswordReset}
                />
              </React.Suspense>
            )}
            {currentStep === 'signup' && (
              <React.Suspense fallback={<div style={{textAlign: 'center', marginTop: '2rem'}}>Loading signup form...</div>}>
                <Signup
                  onSignup={async (email, password) => {
                    try {
                      await signup(email, password);
                      setAppState(prev => ({ ...prev, currentStep: stepBeforeAuth || 'landing' }));
                    } catch (err: any) {
                      showError(err.message || 'Failed to sign up. Please try again.');
                    }
                  }}
                  onLogin={() => setAppState(prev => ({ ...prev, currentStep: 'login' }))}
                />
              </React.Suspense>
            )}
            {/* Render flow steps or landing only if not in auth steps */}
            {!['login', 'signup'].includes(currentStep) && (
              isFlowStep ? (
                <PageLayout>
                  <Sidebar $isCollapsed={isTrackerCollapsed}>
                    <ProgressTracker 
                      steps={
                        entryPoint === 'idea'
                          ? steps
                          : prematureIdeaFlowSteps.filter(s => !stepsToHidePremature.includes(s.key))
                      }
                      currentStepKey={currentStep}
                      onStepClick={handleStepClick}
                      isSubscribed={user?.isSubscribed}
                    />
                    <SidebarToggle 
                      onClick={() => setAppState(prev => ({...prev, isTrackerCollapsed: !prev.isTrackerCollapsed}))}
                      aria-label={isTrackerCollapsed ? "Show tracker" : "Hide tracker"}
                    >
                      {isTrackerCollapsed ? '→' : '←'}
                    </SidebarToggle>
                  </Sidebar>
                  <MobileOverlay 
                    $isVisible={!isTrackerCollapsed} 
                    onClick={() => setAppState(prev => ({...prev, isTrackerCollapsed: true}))}
                  />
                  {isTrackerCollapsed && (
                    <FloatingToggle
                      onClick={() => setAppState(prev => ({...prev, isTrackerCollapsed: false}))}
                      aria-label="Show tracker"
                    >
                      →
                    </FloatingToggle>
                  )}
                  <MainContent isExpanded={isTrackerCollapsed}>
                    <>
                      {currentStep === 'ideaType' && <IdeaTypeSelection onSelect={handleIdeaTypeSelect} />}
                      {currentStep === 'location' && <LocationSelection onSelect={handleLocationSelect} ideaType={ideaType} />}
                      {currentStep === 'skillAssessment' && idea.area && (
                        <SkillAssessment 
                          businessArea={idea.area}
                          interests={idea.interests}
                          ideaType={ideaType}
                          solution={solution}
                          onComplete={handleSkillAssessmentComplete}
                        />
                      )}
                      {currentStep === 'idea' && <IdeaSelection onSelect={handleIdeaSelect} ideaType={ideaType} />}
                      {currentStep === 'scheduleGoals' && <ScheduleGoalsSelection onSelect={handleScheduleGoalsSelect} interests={idea.interests} businessArea={idea.area} location={userLocation} />}
                      {currentStep === 'customer' && <CustomerSelection onSelect={handleCustomerSelect} businessArea={idea.area} interests={entryPoint === 'idea' ? idea.interests : undefined} ideaType={ideaType} location={userLocation} skillAssessment={skillAssessment} scheduleGoals={scheduleGoals} />}
                      {currentStep === 'job' && <JobSelection onSelect={handleJobSelect} customer={customer} interests={entryPoint === 'idea' ? idea.interests : undefined} businessArea={idea.area} ideaType={ideaType} location={userLocation} skillAssessment={skillAssessment} scheduleGoals={scheduleGoals} />}
                      {currentStep === 'summary' && idea.area && customer && job && ( <Summary 
                          idea={{
                            ...idea,
                            area: idea.area,
                            problemDescription,
                            solutionDescription,
                            competitionDescription
                          }}
                          customer={customer} 
                          job={job} 
                          location={userLocation}
                          scheduleGoals={scheduleGoals}
                          onRestart={handleRestart} 
                          onSignup={() => {
                            setAppState(prev => ({
                              ...prev,
                              currentStep: 'signup',
                              stepBeforeAuth: 'summary',
                            }));
                          }} 
                          onLogin={() => {
                            setAppState(prev => ({ ...prev, stepBeforeAuth: 'summary', currentStep: 'login' }));
                          }} 
                        /> )}
                      {currentStep === 'summary' && (!idea.area || !customer || !job) && (
                        <div style={{ color: 'red', textAlign: 'center', marginTop: '2rem' }}>
                          Please complete all required steps before viewing your summary.
                        </div>
                      )}
                      {currentStep === 'businessPlan' && job && (
                        <StartupPlanPageDiscovery
                          context={{
                            idea,
                            customer,
                            job,
                            problemDescription,
                            solutionDescription,
                            competitionDescription,
                            location: userLocation,
                            scheduleGoals,
                            skillAssessment,
                          }}
                          onSignup={() => {
                            setAppState(prev => ({
                              ...prev,
                              currentStep: 'signup',
                              stepBeforeAuth: 'businessPlan',
                            }));
                          }}
                          onLogin={() => {
                            setAppState(prev => ({ ...prev, stepBeforeAuth: 'businessPlan', currentStep: 'login' }));
                          }}
                          isAuthenticated={isAuthenticated}
                          isSubscribed={user?.isSubscribed}
                        />
                      )}
                      {currentStep === 'businessPlan' && (!idea || !customer || !job) && (
                        <Navigate to="/" replace />
                      )}
                      {currentStep === 'existingIdea' && <ExistingIdea onSubmit={handleExistingIdeaSubmit} initialValue={idea.existingIdeaText} onClear={handleClearStep} />}
                      {currentStep === 'describeCustomer' && <DescribeCustomer onSubmit={handleDescribeCustomerSubmit} initialValue={customer?.description} onClear={handleClearStep} />}
                      {currentStep === 'describeProblem' && (
                        <DescribeProblem
                          onSubmit={handleDescribeProblemSubmit}
                          customer={customer}
                          initialValue={problemDescription}
                          onClear={handleClearStep}
                        />
                      )}
                      {currentStep === 'describeSolution' && <DescribeSolution onSubmit={handleDescribeSolutionSubmit} problemDescription={problemDescription} initialValue={solutionDescription} onClear={handleClearStep} />}
                      {currentStep === 'describeCompetition' && <DescribeCompetition onSubmit={handleDescribeCompetitionSubmit} solutionDescription={solutionDescription} initialValue={competitionDescription} onClear={handleClearStep} />}
                      {currentStep === 'prematureJobDiscovery' && (
                        <div style={{ color: 'red', textAlign: 'center', marginTop: '2rem' }}>
                          This step is not available in the current version.
                        </div>
                      )}
                      {currentStep === 'solution' && (
                        <SolutionSelectionPage
                          job={job}
                          onSelect={handleSolutionSelect}
                          interests={idea.interests}
                          businessArea={idea.area}
                          customer={customer}
                          location={userLocation}
                          scheduleGoals={scheduleGoals}
                        />
                      )}
                    </>
                  </MainContent>
                </PageLayout>
              ) : (
                <>
                  {currentStep === 'landing' && <Landing onSelect={handleLandingSelect} />}
                  {currentStep === 'customerGuidance' && ( <Guidance message="That's perfectly fine! A great business is built on a deep understanding of its customers. Let's explore some potential customer types to get you started." buttonText="Let's find my customer" onContinue={() => setAppState(prev => ({ ...prev, currentStep: 'customer' }))} /> )}
                  {currentStep === 'problemGuidance' && (
                    <Guidance 
                      message="No problem at all! The best businesses solve a clear, painful problem. Let's figure out what job your customers need done." 
                      buttonText="Let's find the problem" 
                      onContinue={handleProblemGuidanceContinue} 
                    />
                  )}
                  {currentStep === 'prematureJobDiscovery' && customer && (
                    <PrematureJobDiscovery 
                      customer={customer}
                      onSelect={(job) => {
                        setAppState(prev => ({ ...prev, job, currentStep: 'solution' }));
                      }}
                    />
                  )}
                  {currentStep === 'prematureJobDiscovery' && !customer && (
                    <div style={{ color: 'red', textAlign: 'center', marginTop: '2rem' }}>
                      Please select a customer before proceeding to this step.
                    </div>
                  )}
                </>
              )
            )}
          </AppContainer>
        } />
        <Route path="/reset-password/:token" element={<ResetPasswordRoute />} />
        <Route path="/next-steps-hub/:planId" element={
          <AppContainer>
            <Logo src={logo} alt="ToolThinker Logo" onClick={() => {
              setAppState(prev => ({ ...initialAppState, isTrackerCollapsed: prev.isTrackerCollapsed }));
              navigate('/app');
            }} />
            <TopBar>
              {!isAuthenticated ? (
                <>
                  <LoginButton onClick={() => setAppState(prev => ({...prev, currentStep: 'login'}))} aria-label="Log In">
                    Log in
                  </LoginButton>
                  <SignupFreeButton onClick={() => setAppState(prev => ({...prev, currentStep: 'signup'}))} aria-label="Sign up for free">
                    Sign up for free
                  </SignupFreeButton>
                </>
              ) : (
                <TopBarRight>
                  <NavButton 
                    onClick={() => window.location.href = '/plans'} 
                    style={{
                      background: '#000',
                      color: '#fff',
                      border: 'none',
                      fontWeight: 600
                    }}>
                    My Business Ideas
                  </NavButton>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                                         <AvatarButton onClick={() => {
                       setAppState(prev => ({ ...prev, stepBeforeAuth: 'nextStepsHub' as Step, currentStep: 'profile' }));
                     }} aria-label="Profile">
                      {user && user.profilePic ? (
                        <TopBarAvatarImg src={user.profilePic} alt="Profile" />
                      ) : user && user.email ? (
                        <TopBarAvatar>
                          {user.email
                            .split('@')[0]
                            .split(/[._-]/)
                            .map(part => part[0]?.toUpperCase())
                            .join('')
                            .slice(0, 2) || 'U'}
                        </TopBarAvatar>
                      ) : (
                        <AvatarImg src={defaultAvatar} alt="Avatar" />
                      )}
                    </AvatarButton>
                    {user && (
                      <PlanBadge>
                        {!user?.isSubscribed
                          ? PLAN_DISPLAY_NAMES['free']
                          : PLAN_DISPLAY_NAMES[user?.subscriptionTier || 'basic']}
                      </PlanBadge>
                    )}
                  </div>
                </TopBarRight>
              )}
            </TopBar>
            <NextStepsHub setAppState={setAppState} currentStep={currentStep} />
          </AppContainer>
        } />
        <Route path="/subscribe" element={<SubscriptionPage />} />
        <Route path="/coaches" element={
          <AppContainer>
            <Logo src={logo} alt="ToolThinker Logo" onClick={() => {
              setAppState(prev => ({ ...initialAppState, isTrackerCollapsed: prev.isTrackerCollapsed }));
              navigate('/app');
            }} />
            <TopBar>
              {!isAuthenticated ? (
                <>
                  <LoginButton onClick={() => setAppState(prev => ({...prev, currentStep: 'login'}))} aria-label="Log In">
                    Log in
                  </LoginButton>
                  <SignupFreeButton onClick={() => setAppState(prev => ({...prev, currentStep: 'signup'}))} aria-label="Sign up for free">
                    Sign up for free
                  </SignupFreeButton>
                </>
              ) : (
                <TopBarRight>
                  <NavButton 
                    onClick={() => window.location.href = '/plans'} 
                    style={{
                      background: '#000',
                      color: '#fff',
                      border: 'none',
                      fontWeight: 600
                    }}>
                    My Business Ideas
                  </NavButton>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                                         <AvatarButton onClick={() => {
                       setAppState(prev => ({ ...prev, stepBeforeAuth: 'landing' as Step, currentStep: 'profile' }));
                     }} aria-label="Profile">
                      {user && user.profilePic ? (
                        <TopBarAvatarImg src={user.profilePic} alt="Profile" />
                      ) : user && user.email ? (
                        <TopBarAvatar>
                          {user.email
                            .split('@')[0]
                            .split(/[._-]/)
                            .map(part => part[0]?.toUpperCase())
                            .join('')
                            .slice(0, 2) || 'U'}
                        </TopBarAvatar>
                      ) : (
                        <AvatarImg src={defaultAvatar} alt="Avatar" />
                      )}
                    </AvatarButton>
                    {user && (
                      <PlanBadge>
                        {!user?.isSubscribed
                          ? PLAN_DISPLAY_NAMES['free']
                          : PLAN_DISPLAY_NAMES[user?.subscriptionTier || 'basic']}
                      </PlanBadge>
                    )}
                  </div>
                </TopBarRight>
              )}
            </TopBar>
            <CoachMarketplace />
          </AppContainer>
        } />
        <Route path="/courses" element={
          <AppContainer>
            <Logo src={logo} alt="ToolThinker Logo" onClick={() => {
              setAppState(prev => ({ ...initialAppState, isTrackerCollapsed: prev.isTrackerCollapsed }));
              navigate('/app');
            }} />
            <TopBar>
              {!isAuthenticated ? (
                <>
                  <LoginButton onClick={() => setAppState(prev => ({...prev, currentStep: 'login'}))} aria-label="Log In">
                    Log in
                  </LoginButton>
                  <SignupFreeButton onClick={() => setAppState(prev => ({...prev, currentStep: 'signup'}))} aria-label="Sign up for free">
                    Sign up for free
                  </SignupFreeButton>
                </>
              ) : (
                <TopBarRight>
                  <NavButton 
                    onClick={() => window.location.href = '/plans'} 
                    style={{
                      background: '#000',
                      color: '#fff',
                      border: 'none',
                      fontWeight: 600
                    }}>
                    My Business Ideas
                  </NavButton>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                                         <AvatarButton onClick={() => {
                       setAppState(prev => ({ ...prev, stepBeforeAuth: 'landing' as Step, currentStep: 'profile' }));
                     }} aria-label="Profile">
                      {user && user.profilePic ? (
                        <TopBarAvatarImg src={user.profilePic} alt="Profile" />
                      ) : user && user.email ? (
                        <TopBarAvatar>
                          {user.email
                            .split('@')[0]
                            .split(/[._-]/)
                            .map(part => part[0]?.toUpperCase())
                            .join('')
                            .slice(0, 2) || 'U'}
                        </TopBarAvatar>
                      ) : (
                        <AvatarImg src={defaultAvatar} alt="Avatar" />
                      )}
                    </AvatarButton>
                    {user && (
                      <PlanBadge>
                        {!user?.isSubscribed
                          ? PLAN_DISPLAY_NAMES['free']
                          : PLAN_DISPLAY_NAMES[user?.subscriptionTier || 'basic']}
                      </PlanBadge>
                    )}
                  </div>
                </TopBarRight>
              )}
            </TopBar>
            <CourseLibrary />
          </AppContainer>
        } />
        <Route path="/plans" element={
          <AppContainer>
            <Logo src={logo} alt="ToolThinker Logo" onClick={() => {
              setAppState(prev => ({ ...initialAppState, isTrackerCollapsed: prev.isTrackerCollapsed }));
              navigate('/app');
            }} />
            <TopBar>
              {!isAuthenticated ? (
                <>
                  <LoginButton onClick={() => setAppState(prev => ({...prev, currentStep: 'login'}))} aria-label="Log In">
                    Log in
                  </LoginButton>
                  <SignupFreeButton onClick={() => setAppState(prev => ({...prev, currentStep: 'signup'}))} aria-label="Sign up for free">
                    Sign up for free
                  </SignupFreeButton>
                </>
              ) : (
                <TopBarRight>
                  <NavButton 
                    onClick={() => window.location.href = '/plans'} 
                    style={{
                      background: '#000',
                      color: '#fff',
                      border: 'none',
                      fontWeight: 600
                    }}>
                    My Business Ideas
                  </NavButton>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                                         <AvatarButton onClick={() => {
                       setAppState(prev => ({ ...prev, stepBeforeAuth: 'landing' as Step, currentStep: 'profile' }));
                     }} aria-label="Profile">
                      {user && user.profilePic ? (
                        <TopBarAvatarImg src={user.profilePic} alt="Profile" />
                      ) : user && user.email ? (
                        <TopBarAvatar>
                          {user.email
                            .split('@')[0]
                            .split(/[._-]/)
                            .map(part => part[0]?.toUpperCase())
                            .join('')
                            .slice(0, 2) || 'U'}
                        </TopBarAvatar>
                      ) : (
                        <AvatarImg src={defaultAvatar} alt="Avatar" />
                      )}
                    </AvatarButton>
                    {user && (
                      <PlanBadge>
                        {!user?.isSubscribed
                          ? PLAN_DISPLAY_NAMES['free']
                          : PLAN_DISPLAY_NAMES[user?.subscriptionTier || 'basic']}
                      </PlanBadge>
                    )}
                  </div>
                </TopBarRight>
              )}
            </TopBar>
            <StartupPlanDashboard setAppState={setAppState} />
          </AppContainer>
        } />
        <Route path="/startup-plan/:id/edit" element={
          <AppContainer>
            <Logo src={logo} alt="ToolThinker Logo" onClick={() => {
              setAppState(prev => ({ ...initialAppState, isTrackerCollapsed: prev.isTrackerCollapsed }));
              navigate('/app');
            }} />
            <TopBar>
              {!isAuthenticated ? (
                <>
                  <LoginButton onClick={() => setAppState(prev => ({...prev, currentStep: 'login'}))} aria-label="Log In">
                    Log in
                  </LoginButton>
                  <SignupFreeButton onClick={() => setAppState(prev => ({...prev, currentStep: 'signup'}))} aria-label="Sign up for free">
                    Sign up for free
                  </SignupFreeButton>
                </>
              ) : (
                <TopBarRight>
                  <NavButton 
                    onClick={() => window.location.href = '/plans'} 
                    style={{
                      background: '#000',
                      color: '#fff',
                      border: 'none',
                      fontWeight: 600
                    }}>
                    My Business Ideas
                  </NavButton>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                                         <AvatarButton onClick={() => {
                       setAppState(prev => ({ ...prev, stepBeforeAuth: 'landing' as Step, currentStep: 'profile' }));
                     }} aria-label="Profile">
                      {user && user.profilePic ? (
                        <TopBarAvatarImg src={user.profilePic} alt="Profile" />
                      ) : user && user.email ? (
                        <TopBarAvatar>
                          {user.email
                            .split('@')[0]
                            .split(/[._-]/)
                            .map(part => part[0]?.toUpperCase())
                            .join('')
                            .slice(0, 2) || 'U'}
                        </TopBarAvatar>
                      ) : (
                        <AvatarImg src={defaultAvatar} alt="Avatar" />
                      )}
                    </AvatarButton>
                    {user && (
                      <PlanBadge>
                        {!user?.isSubscribed
                          ? PLAN_DISPLAY_NAMES['free']
                          : PLAN_DISPLAY_NAMES[user?.subscriptionTier || 'basic']}
                      </PlanBadge>
                    )}
                  </div>
                </TopBarRight>
              )}
            </TopBar>
            <StartupPlanEditPage setAppState={setAppState} />
          </AppContainer>
        } />
        <Route path="/startup-plan/:id" element={<StartupPlanViewPage />} />
        <Route path="/launch" element={
          <AppContainer>
            <Logo src={logo} alt="ToolThinker Logo" onClick={() => {
              setAppState(prev => ({ ...initialAppState, isTrackerCollapsed: prev.isTrackerCollapsed }));
              navigate('/app');
            }} />
            <TopBar>
              {!isAuthenticated ? (
                <>
                  <LoginButton onClick={() => setAppState(prev => ({...prev, currentStep: 'login'}))} aria-label="Log In">
                    Log in
                  </LoginButton>
                  <SignupFreeButton onClick={() => setAppState(prev => ({...prev, currentStep: 'signup'}))} aria-label="Sign up for free">
                    Sign up for free
                  </SignupFreeButton>
                </>
              ) : (
                <TopBarRight>
                  <NavButton 
                    onClick={() => window.location.href = '/plans'} 
                    style={{
                      background: '#000',
                      color: '#fff',
                      border: 'none',
                      fontWeight: 600
                    }}>
                    My Business Ideas
                  </NavButton>
                  <AvatarButton onClick={() => {
                    setAppState(prev => ({ ...prev, stepBeforeAuth: 'launch', currentStep: 'profile' }));
                  }} aria-label="Profile" style={{ background: '#fff', border: '1px solid #e5e5e5', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0 }}>
                      {user && user.profilePic ? (
                        <TopBarAvatarImg src={user.profilePic} alt="Profile" />
                      ) : user && user.email ? (
                        <TopBarAvatar>
                          {user.email
                            .split('@')[0]
                            .split(/[._-]/)
                            .map(part => part[0]?.toUpperCase())
                            .join('')
                            .slice(0, 2) || 'U'}
                        </TopBarAvatar>
                      ) : (
                        <AvatarImg src={defaultAvatar} alt="Avatar" />
                      )}
                      {user && (
                        <PlanBadge>
                          {!user?.isSubscribed
                            ? PLAN_DISPLAY_NAMES['free']
                            : PLAN_DISPLAY_NAMES[user?.subscriptionTier || 'basic']}
                        </PlanBadge>
                      )}
                    </div>
                  </AvatarButton>
                </TopBarRight>
              )}
            </TopBar>
            <PageLayout>
              <Sidebar $isCollapsed={false}>
                <ProgressTracker 
                  steps={steps} 
                  currentStepKey={'launch'}
                  onStepClick={handleStepClick}
                  isSubscribed={user?.isSubscribed}
                />
              </Sidebar>
              <MainContent isExpanded={false}>
                <LaunchPreparationPage />
              </MainContent>
            </PageLayout>
          </AppContainer>
        } />
        <Route path="/mvp/:planId" element={<MvpBuilderPage />} />
        <Route path="/validate-assumptions/:planId" element={<ValidateAssumptionsPage />} />
        <Route path="/explore-opportunities/:planId" element={<ExploreOpportunitiesPage />} />
        <Route path="/customer-validation/:planId" element={<CustomerValidationPage />} />
        <Route path="/iterate-or-launch/:planId" element={<IterateOrLaunchPage />} />
        <Route path="/admin/logs" element={<AdminLogsPage />} />
        <Route path="/automated-discovery/:id" element={<AutomatedDiscoveryPage />} />
        <Route path="*" element={
          <AppContainer>
            <Logo src={logo} alt="ToolThinker Logo" onClick={() => {
              setAppState(prev => ({ ...initialAppState, isTrackerCollapsed: prev.isTrackerCollapsed }));
              navigate('/app');
            }} />
            <TopBar>
              {!isAuthenticated ? (
                <>
                  <LoginButton onClick={() => setAppState(prev => ({...prev, currentStep: 'login'}))} aria-label="Log In">
                    Log in
                  </LoginButton>
                  <SignupFreeButton onClick={() => setAppState(prev => ({...prev, currentStep: 'signup'}))} aria-label="Sign up for free">
                    Sign up for free
                  </SignupFreeButton>
                </>
              ) : (
                <TopBarRight>
                  <NavButton 
                    onClick={() => window.location.href = '/plans'} 
                    style={{
                      background: '#000',
                      color: '#fff',
                      border: 'none',
                      fontWeight: 600
                    }}>
                    My Business Ideas
                  </NavButton>
                  <AvatarButton onClick={() => {
                    setAppState(prev => ({ ...prev, stepBeforeAuth: currentStep, currentStep: 'profile' }));
                  }} aria-label="Profile" style={{ background: '#fff', border: '1px solid #e5e5e5', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0 }}>
                      {user && user.profilePic ? (
                        <TopBarAvatarImg src={user.profilePic} alt="Profile" />
                      ) : user && user.email ? (
                        <TopBarAvatar>
                          {user.email
                            .split('@')[0]
                            .split(/[._-]/)
                            .map(part => part[0]?.toUpperCase())
                            .join('')
                            .slice(0, 2) || 'U'}
                        </TopBarAvatar>
                      ) : (
                        <AvatarImg src={defaultAvatar} alt="Avatar" />
                      )}
                      {/* Only show PlanBadge if not on the landing page */}
                      {user && location.pathname !== '/' && (
                        <PlanBadge>
                          {!user?.isSubscribed
                            ? PLAN_DISPLAY_NAMES['free']
                            : PLAN_DISPLAY_NAMES[user?.subscriptionTier || 'basic']}
                        </PlanBadge>
                      )}
                    </div>
                  </AvatarButton>
                </TopBarRight>
              )}
            </TopBar>
            {/* Always render login/signup forms when currentStep is 'login' or 'signup' */}
            {currentStep === 'login' && (
              <React.Suspense fallback={<div style={{textAlign: 'center', marginTop: '2rem'}}>Loading login form...</div>}>
                <Login
                  onLogin={async (email, password) => {
                    try {
                      await login(email, password);
                      setAppState(prev => ({ ...prev, currentStep: stepBeforeAuth || 'landing' }));
                    } catch (err: any) {
                      showError(err.message || 'Failed to log in. Please try again.');
                    }
                  }}
                  onSignup={() => setAppState(prev => ({ ...prev, currentStep: 'signup' }))}
                  onRequestPasswordReset={requestPasswordReset}
                />
              </React.Suspense>
            )}
            {currentStep === 'signup' && (
              <React.Suspense fallback={<div style={{textAlign: 'center', marginTop: '2rem'}}>Loading signup form...</div>}>
                <Signup
                  onSignup={async (email, password) => {
                    try {
                      await signup(email, password);
                      setAppState(prev => ({ ...prev, currentStep: stepBeforeAuth || 'landing' }));
                    } catch (err: any) {
                      showError(err.message || 'Failed to sign up. Please try again.');
                    }
                  }}
                  onLogin={() => setAppState(prev => ({ ...prev, currentStep: 'login' }))}
                />
              </React.Suspense>
            )}
            {/* Render flow steps or landing only if not in auth steps */}
            {!['login', 'signup'].includes(currentStep) && (
              isFlowStep ? (
                <PageLayout>
                  <Sidebar $isCollapsed={isTrackerCollapsed}>
                    <ProgressTracker 
                      steps={
                        entryPoint === 'idea'
                          ? steps
                          : prematureIdeaFlowSteps.filter(s => !stepsToHidePremature.includes(s.key))
                      }
                      currentStepKey={currentStep}
                      onStepClick={handleStepClick}
                      isSubscribed={user?.isSubscribed}
                    />
                    <SidebarToggle 
                      onClick={() => setAppState(prev => ({...prev, isTrackerCollapsed: !prev.isTrackerCollapsed}))}
                      aria-label={isTrackerCollapsed ? "Show tracker" : "Hide tracker"}
                    >
                      {isTrackerCollapsed ? '→' : '←'}
                    </SidebarToggle>
                  </Sidebar>
                  <MobileOverlay 
                    $isVisible={!isTrackerCollapsed} 
                    onClick={() => setAppState(prev => ({...prev, isTrackerCollapsed: true}))}
                  />
                  {isTrackerCollapsed && (
                    <FloatingToggle
                      onClick={() => setAppState(prev => ({...prev, isTrackerCollapsed: false}))}
                      aria-label="Show tracker"
                    >
                      →
                    </FloatingToggle>
                  )}
                  <MainContent isExpanded={isTrackerCollapsed}>
                    <>
                      {currentStep === 'idea' && <IdeaSelection onSelect={handleIdeaSelect} />}
                      {currentStep === 'customer' && <CustomerSelection onSelect={handleCustomerSelect} businessArea={idea.area} interests={entryPoint === 'idea' ? idea.interests : undefined} />}
                      {currentStep === 'job' && <JobSelection onSelect={handleJobSelect} customer={customer} interests={entryPoint === 'idea' ? idea.interests : undefined} businessArea={idea.area} />}
                      {currentStep === 'summary' && idea.area && customer && job && ( <Summary 
                          idea={{
                            ...idea,
                            area: idea.area,
                            problemDescription,
                            solutionDescription,
                            competitionDescription
                          }}
                          customer={customer} 
                          job={job} 
                          location={userLocation}
                          scheduleGoals={scheduleGoals}
                          onRestart={handleRestart} 
                          onSignup={() => {
                            setAppState(prev => ({
                              ...prev,
                              currentStep: 'signup',
                              stepBeforeAuth: 'summary',
                            }));
                          }} 
                          onLogin={() => {
                            setAppState(prev => ({ ...prev, stepBeforeAuth: 'summary', currentStep: 'login' }));
                          }} 
                        /> )}
                      {currentStep === 'summary' && (!idea.area || !customer || !job) && (
                        <div style={{ color: 'red', textAlign: 'center', marginTop: '2rem' }}>
                          Please complete all required steps before viewing your summary.
                        </div>
                      )}
                      {currentStep === 'businessPlan' && job && (
                        <StartupPlanPageDiscovery
                          context={{
                            idea,
                            customer,
                            job,
                            problemDescription,
                            solutionDescription,
                            competitionDescription,
                            location: userLocation,
                            scheduleGoals,
                            skillAssessment,
                          }}
                          onSignup={() => {
                            setAppState(prev => ({
                              ...prev,
                              currentStep: 'signup',
                              stepBeforeAuth: 'businessPlan',
                            }));
                          }}
                          onLogin={() => {
                            setAppState(prev => ({ ...prev, stepBeforeAuth: 'businessPlan', currentStep: 'login' }));
                          }}
                          isAuthenticated={isAuthenticated}
                          isSubscribed={user?.isSubscribed}
                        />
                      )}
                      {currentStep === 'businessPlan' && (!idea || !customer || !job) && (
                        <Navigate to="/" replace />
                      )}
                      {currentStep === 'existingIdea' && <ExistingIdea onSubmit={handleExistingIdeaSubmit} initialValue={idea.existingIdeaText} onClear={handleClearStep} />}
                      {currentStep === 'describeCustomer' && <DescribeCustomer onSubmit={handleDescribeCustomerSubmit} initialValue={customer?.description} onClear={handleClearStep} />}
                      {currentStep === 'describeProblem' && (
                        <DescribeProblem
                          onSubmit={handleDescribeProblemSubmit}
                          customer={customer}
                          initialValue={problemDescription}
                          onClear={handleClearStep}
                        />
                      )}
                      {currentStep === 'describeSolution' && <DescribeSolution onSubmit={handleDescribeSolutionSubmit} problemDescription={problemDescription} initialValue={solutionDescription} onClear={handleClearStep} />}
                      {currentStep === 'describeCompetition' && <DescribeCompetition onSubmit={handleDescribeCompetitionSubmit} solutionDescription={solutionDescription} initialValue={competitionDescription} onClear={handleClearStep} />}
                      {currentStep === 'prematureJobDiscovery' && (
                        <div style={{ color: 'red', textAlign: 'center', marginTop: '2rem' }}>
                          This step is not available in the current version.
                        </div>
                      )}
                      {currentStep === 'solution' && (
                        <SolutionSelectionPage
                          job={job}
                          onSelect={handleSolutionSelect}
                          interests={idea.interests}
                          businessArea={idea.area}
                          customer={customer}
                          location={userLocation}
                          scheduleGoals={scheduleGoals}
                        />
                      )}
                    </>
                  </MainContent>
                </PageLayout>
              ) : (
                <>
                  {currentStep === 'landing' && <Landing onSelect={handleLandingSelect} />}
                  {currentStep === 'customerGuidance' && ( <Guidance message="That's perfectly fine! A great business is built on a deep understanding of its customers. Let's explore some potential customer types to get you started." buttonText="Let's find my customer" onContinue={() => setAppState(prev => ({ ...prev, currentStep: 'customer' }))} /> )}
                  {currentStep === 'problemGuidance' && (
                    <Guidance 
                      message="No problem at all! The best businesses solve a clear, painful problem. Let's figure out what job your customers need done." 
                      buttonText="Let's find the problem" 
                      onContinue={handleProblemGuidanceContinue} 
                    />
                  )}
                </>
              )
            )}
          </AppContainer>
        } />
      </Routes>
      
      {/* Custom Error Notification */}
      <ErrorNotification
        message={errorNotification.message}
        isVisible={errorNotification.isVisible}
        onClose={hideError}
        type={errorNotification.type}
      />
      
      <Footer>
        <FooterMoneyImage 
          src="/src/assets/Money.jpg" 
          alt="Financial success" 
        />
        &copy; {new Date().getFullYear()} Tool Thinker. All rights reserved.
      </Footer>
    </>
  );
}

export default AppContent;
