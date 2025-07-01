import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Landing } from './components/idea-flow/Landing';
import { IdeaSelection } from './components/idea-flow/IdeaSelection';
import { CustomerSelection } from './components/idea-flow/CustomerSelection';
import { JobSelection } from './components/idea-flow/JobSelection';
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
import { BrowserRouter as Router, Routes, Route, useParams, Navigate, useLocation } from 'react-router-dom';
import { DescribeCustomer } from './components/idea-flow/DescribeCustomer';
import { DescribeProblem } from './components/idea-flow/DescribeProblem';
import { DescribeSolution } from './components/idea-flow/DescribeSolution';
import { DescribeCompetition } from './components/idea-flow/DescribeCompetition';
import { Guidance } from './components/idea-flow/Guidance';
import { ProgressTracker } from './components/idea-flow/ProgressTracker';
import type { BusinessArea } from './components/idea-flow/IdeaSelection';
import type { CustomerOption } from './components/idea-flow/CustomerSelection';
import type { JobOption } from './components/idea-flow/JobSelection';
import { MarketValidationPage } from './components/idea-flow/MarketValidationPage';
import { MarketValidationScorePage } from './components/idea-flow/MarketValidationScorePage';
import { NextStepsHub } from './components/idea-flow/NextStepsHub';
import { SubscriptionPage } from './components/auth/SubscriptionPage';
import { CoachMarketplace } from './components/learning/CoachMarketplace';
import { CourseLibrary } from './components/learning/CourseLibrary';

import WebLandingPage from './components/WebLandingPage';
import { StartupPlanPageDiscovery } from './components/idea-discovery/StartupPlanPageDiscovery';
import StartupPlanDashboard from './components/business-plan/StartupPlanDashboard';
import { StartupPlanEditPage } from './components/business-plan/StartupPlanEditPage';

const AppContainer = styled.div`
  min-height: 100vh;
  background: #f5f5f7;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2.5rem 1.5rem 2.5rem 1.5rem;
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
`;

const NavButton = styled.button`
  background: none;
  border: none;
  color: var(--primary-color);
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  transition: background 0.2s;
  &:hover, &:focus {
    background: #e6f0ff;
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
  padding: 1.1rem 2.7rem 0 0;
  z-index: 1000;
`;

const TopBarRight = styled.div`
  display: flex;
  align-items: center;
  gap: 1.1rem;
`;

const AvatarButton = styled.button`
  background: none;
  border: none;
  padding: 0;
  margin-left: 1rem;
  margin-top: 0rem;
  cursor: pointer;
  border-radius: 50%;
  width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: box-shadow 0.2s;
  &:hover {
    box-shadow: 0 2px 8px rgba(0,0,0,0.12);
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
  background: #fff;
  color: #222;
  border: 1.5px solid #e5e5e5;
  border-radius: 999px;
  padding: 0.5rem 1.5rem;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  margin-left: 1rem;
  box-shadow: 0 2px 8px rgba(0,0,0,0.04);
  transition: background 0.2s, color 0.2s, border 0.2s;
  &:hover {
    background: #ededed;
    border-color: #181a1b;
    color: #181a1b;
  }
`;

const SignupFreeButton = styled.button`
  background: #000;
  color: #fff;
  border: none;
  border-radius: 999px;
  padding: 0.5rem 1.5rem;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  margin-left: 1rem;
  box-shadow: 0 2px 8px rgba(0,0,0,0.04);
  transition: background 0.2s, color 0.2s;
  &:hover {
    background: #222;
    color: #fff;
  }
`;

const ToggleTrackerButton = styled.button`
  background: #f5f5f7;
  color: #007aff;
  border: 1.5px solid #e5e5e5;
  border-radius: 8px;
  padding: 0.7rem 1.5rem;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  margin-top: 1.5rem;
  margin-bottom: 1.5rem;
  transition: background 0.2s, color 0.2s;
  &:hover, &:focus {
    background: #e6f0ff;
    color: #0056b3;
  }
`;

const TopBarAvatar = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: #007aff22;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.3rem;
  color: #007aff;
  font-weight: 700;
`;

const TopBarAvatarImg = styled.img`
  width: 42px;
  height: 42px;
  border-radius: 50%;
  object-fit: cover;
  background: #e5e5e5;
  margin-top: 1.3rem;
`;

const PlanBadge = styled.div`
  margin-top: -0.2rem;
  background: #f3f4f6;
  color: #181a1b;
  font-size: 0.82rem;
  font-weight: 600;
  border-radius: 999px;
  border: 1.5px solid #181a1b;
  padding: 0.18rem 1.1rem 0.22rem 1.1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 48px;
  min-height: 22px;
  box-shadow: 0 1px 4px rgba(0,0,0,0.06);
  letter-spacing: 0.01em;
  user-select: none;
`;

const defaultAvatar = 'https://ui-avatars.com/api/?name=User&background=007AFF&color=fff&size=128';

type Step = 'landing' | 'idea' | 'customer' | 'job' | 'summary' | 'signup' | 'login' | 'profile' | 'existingIdea' | 'describeCustomer' | 'describeProblem' | 'describeSolution' | 'describeCompetition' | 'customerGuidance' | 'problemGuidance' | 'competitionGuidance' | 'businessPlan' | 'prematureJobDiscovery' | 'marketValidation' | 'validationScore' | 'nextStepsHub' | 'startupPlan';

type EntryPoint = 'idea' | 'customer';

const PageLayout = styled.div`
  display: flex;
  width: 100%;
  max-width: 1400px;
  margin: 2rem auto;
  padding: 0 2rem;
  gap: 3rem;
`;

const MainContent = styled.main<{ isExpanded: boolean }>`
  flex: ${({ isExpanded }) => (isExpanded ? '1' : '3')};
  transition: flex 0.3s ease-in-out;
`;

const Sidebar = styled.aside`
  flex: 1;
  position: sticky;
  top: 120px;
  height: fit-content;
`;

const steps = [
  { key: 'idea', label: '1. Your Interests' },
  { key: 'customer', label: '2. Customer Persona' },
  { key: 'job', label: '3. Customer Job' },
  { key: 'summary', label: '4. Summary' },
  { key: 'businessPlan', label: '5. Business Plan' },
  { key: 'marketValidation', label: '6. Market Validation', isPremium: true },
  { key: 'validationScore', label: '7. Validation Score', isPremium: true },
  { key: 'nextStepsHub', label: '8. Next Steps Hub', isPremium: true },
];

const prematureIdeaFlowSteps = [
  { key: 'existingIdea', label: '1. Your Idea' },
  { key: 'describeCustomer', label: '2. Your Customer' },
  { key: 'describeProblem', label: '3. The Problem' },
  { key: 'prematureJobDiscovery', label: '4. Customer Job' },
  { key: 'describeSolution', label: '5. The Solution' },
  { key: 'describeCompetition', label: '6. Your Advantage' },
  { key: 'businessPlan', label: '7. Business Plan' },
  { key: 'marketValidation', label: '8. Market Validation', isPremium: true },
  { key: 'validationScore', label: '9. Validation Score', isPremium: true },
  { key: 'nextStepsHub', label: '10. Next Steps Hub', isPremium: true },
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
  customer: CustomerOption | null;
  job: JobOption | null;
  problemDescription: string | null;
  solutionDescription: string | null;
  competitionDescription: string | null;
  isTrackerVisible: boolean;
  stepBeforeAuth: Step | null;
}

export const initialAppState: AppState = {
  currentStep: 'landing',
  entryPoint: 'idea',
  idea: {
    interests: '',
    area: null,
    existingIdeaText: '',
  },
  customer: null,
  job: null,
  problemDescription: null,
  solutionDescription: null,
  competitionDescription: null,
  isTrackerVisible: true,
  stepBeforeAuth: null,
};

function ResetPasswordRoute() {
  const { token } = useParams<{ token: string }>();
  const { resetPassword } = useAuth();
  if (!token) return <Navigate to="/login" />;
  return <ResetPassword token={token} onResetPassword={resetPassword} />;
}

function AppContent() {
  const { isLoading, isAuthenticated, signup, login, user, requestPasswordReset, mockUpgradeToPremium } = useAuth();
  console.log('USER OBJECT:', user);
  const location = useLocation();
  if (isLoading) {
    return <div>Loading...</div>;
  }
  const [appState, setAppState] = useState<AppState>(() => {
    try {
      const storedState = window.localStorage.getItem('appState');
      return storedState ? JSON.parse(storedState) : initialAppState;
    } catch (error) {
      console.error("Could not load state from localStorage", error);
      return initialAppState;
    }
  });

  useEffect(() => {
    try {
      window.localStorage.setItem('appState', JSON.stringify(appState));
    } catch (error) {
      console.error("Could not save state to localStorage", error);
    }
  }, [appState]);

  const { 
    currentStep, entryPoint, idea, customer, job, problemDescription, 
    solutionDescription, competitionDescription, isTrackerVisible, stepBeforeAuth 
  } = appState;

  console.log('AppContent state:', {
    currentStep,
    entryPoint,
    idea,
    customer,
    job,
    isAuthenticated
  });

  useEffect(() => {
    if (isAuthenticated && appState.currentStep === 'summary') {
      setAppState(prev => ({ ...prev, currentStep: 'businessPlan' }));
    }
  }, [isAuthenticated, appState.currentStep]);

  const isFlowStep = flowStepKeys.includes(currentStep);
  const activeFlowSteps = entryPoint === 'idea' ? steps : prematureIdeaFlowSteps;

  function handleStepClick(step: string) {
    if (activeFlowSteps.some(s => s.key === step)) {
      setAppState(prev => ({ ...prev, currentStep: step as Step }));
    }
  }

  function handleLandingSelect(step: EntryPoint) {
    setAppState(prev => ({ ...prev, entryPoint: step, currentStep: step === 'customer' ? 'existingIdea' : step }));
  }

  function handleIdeaSelect(selectedIdea: { interests: string; area: BusinessArea }) {
    setAppState(prev => ({ ...prev, idea: selectedIdea, currentStep: 'customer' }));
  }

  function handleCustomerSelect(selectedCustomer: CustomerOption) {
    setAppState(prev => ({ ...prev, customer: selectedCustomer, currentStep: 'job' }));
  }

  function handleJobSelect(selectedJob: JobOption) {
    setAppState(prev => ({ ...prev, job: selectedJob, currentStep: 'summary' }));
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
    setAppState(prev => ({ ...prev, solutionDescription: description, currentStep: 'describeCompetition' }));
  }

  function handleDescribeCompetitionSubmit(description: string | null) {
    setAppState(prev => ({ ...prev, competitionDescription: description, currentStep: 'businessPlan' }));
  }

  function handleRestart() {
    setAppState(prev => ({
      ...initialAppState,
      isTrackerVisible: prev.isTrackerVisible
    }));
  }

  function handleBack() {
    const stepMap: Partial<Record<Step, Step>> = {
      idea: 'landing',
      customer: entryPoint === 'idea' ? 'idea' : 'landing',
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
      businessPlan: 'describeCompetition',
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

  const PLAN_DISPLAY_NAMES: Record<string, string> = {
    free: 'Free',
    basic: 'Basic',
    pro: 'Pro',
    elite: 'Elite',
  };

  // Debug: log appState before rendering
  console.log('AppContent about to render, appState:', appState);

  return (
    <>
      {/* Always render the Profile modal/page when currentStep === 'profile' */}
      {currentStep === 'profile' && (
        <Profile 
          setAppState={setAppState} 
          isTrackerVisible={appState.isTrackerVisible}
          onClose={() => setAppState(prev => ({ ...prev, currentStep: prev.stepBeforeAuth || 'landing' }))}
        />
      )}
      <Routes>
        <Route path="/" element={<WebLandingPage />} />
        <Route path="/reset-password/:token" element={<ResetPasswordRoute />} />
        <Route path="/market-validation" element={<MarketValidationPage setAppState={setAppState} currentStep={currentStep} />} />
        <Route path="/validation-score" element={<MarketValidationScorePage setAppState={setAppState} currentStep={currentStep} />} />
        <Route path="/next-steps-hub" element={<NextStepsHub setAppState={setAppState} currentStep={currentStep} />} />
        <Route path="/subscribe" element={<SubscriptionPage />} />
        <Route path="/coaches" element={<CoachMarketplace />} />
        <Route path="/courses" element={<CourseLibrary />} />
        <Route path="/plans" element={<StartupPlanDashboard setAppState={setAppState} />} />
        <Route path="/startup-plan/:id/edit" element={<StartupPlanEditPage setAppState={setAppState} />} />
        <Route path="*" element={
          <AppContainer>
            <Logo src={logo} alt="ToolThinker Logo" onClick={() => {
              setAppState(prev => ({ ...initialAppState, isTrackerVisible: prev.isTrackerVisible }));
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
                    My Startup Plans
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
            {isFlowStep ? (
              <PageLayout>
                {isTrackerVisible && (
                  <Sidebar>
                      <ProgressTracker 
                        steps={entryPoint === 'idea' ? steps : prematureIdeaFlowSteps} 
                        currentStepKey={currentStep}
                        onStepClick={handleStepClick}
                        isSubscribed={user?.isSubscribed}
                      />
                      <ToggleTrackerButton 
                        onClick={() => setAppState(prev => ({...prev, isTrackerVisible: false}))}
                        style={{ color: '#222' }}
                      >
                        Hide Tracker
                      </ToggleTrackerButton>
                  </Sidebar>
                )}
                <MainContent isExpanded={!isTrackerVisible}>
                  <>
                    {!isTrackerVisible && (
                      <ToggleTrackerButton 
                        style={{ marginTop: '4.5rem', width: 'auto', color: '#222' }}
                        onClick={() => setAppState(prev => ({...prev, isTrackerVisible: true}))}
                      >
                        Show Tracker
                      </ToggleTrackerButton>
                    )}
                    {currentStep === 'idea' && <IdeaSelection onSelect={handleIdeaSelect} />}
                    {currentStep === 'customer' && <CustomerSelection onSelect={handleCustomerSelect} businessArea={idea.area} />}
                    {currentStep === 'job' && <JobSelection onSelect={handleJobSelect} customer={customer} />}
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
                        onRestart={handleRestart} 
                        onSignup={() => {
                          setAppState(prev => ({ ...prev, stepBeforeAuth: 'summary', currentStep: 'signup' }));
                        }} 
                        onLogin={() => {
                          setAppState(prev => ({ ...prev, stepBeforeAuth: 'summary', currentStep: 'login' }));
                        }} 
                      /> )}
                    {currentStep === 'businessPlan' && job && (
                      <StartupPlanPageDiscovery
                        idea={idea}
                        customer={customer}
                        job={job}
                        onSignup={() => {
                          setAppState(prev => ({ ...prev, stepBeforeAuth: 'businessPlan', currentStep: 'signup' }));
                        }}
                        onLogin={() => {
                          setAppState(prev => ({ ...prev, stepBeforeAuth: 'businessPlan', currentStep: 'login' }));
                        }}
                        isAuthenticated={isAuthenticated}
                      />
                    )}
                    {currentStep === 'businessPlan' && !job && (
                      <div style={{ color: 'red', textAlign: 'center', marginTop: '2rem' }}>
                        Please complete all required steps before viewing your business plan.
                      </div>
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
                  </>
                </MainContent>
              </PageLayout>
            ) : (
              <>
                {currentStep === 'landing' && <Landing onSelect={handleLandingSelect} />}
                {currentStep === 'signup' && <Signup onSignup={async (email, password) => {
                  try {
                    await signup(email, password);
                    setAppState(prev => ({ ...prev, currentStep: stepBeforeAuth || 'summary' }));
                  } catch (err: any) {
                    if (err.message && err.message.toLowerCase().includes('already registered')) {
                      setAppState(prev => ({ ...prev, currentStep: 'login' }));
                      return;
                    }
                    throw err;
                  }
                }} onLogin={() => setAppState(prev => ({ ...prev, currentStep: 'login' }))} />}
                {currentStep === 'login' && (
                  <React.Suspense fallback={<div style={{textAlign: 'center', marginTop: '2rem'}}>Loading login form...</div>}>
                    <Login
                      onLogin={async (email, password) => {
                        try {
                          await login(email, password);
                          setAppState(prev => ({ ...prev, currentStep: stepBeforeAuth || 'landing' }));
                        } catch (err: any) {
                          alert(err.message || 'Failed to log in. Please try again.');
                        }
                      }}
                      onSignup={() => setAppState(prev => ({ ...prev, currentStep: 'signup' }))}
                      onRequestPasswordReset={requestPasswordReset}
                    />
                  </React.Suspense>
                )}
                {currentStep === 'customerGuidance' && ( <Guidance message="That's perfectly fine! A great business is built on a deep understanding of its customers. Let's explore some potential customer types to get you started." buttonText="Let's find my customer" onContinue={() => setAppState(prev => ({ ...prev, currentStep: 'customer' }))} /> )}
                {currentStep === 'problemGuidance' && (
                  <Guidance 
                    message="No problem at all! The best businesses solve a clear, painful problem. Let's figure out what job your customers need done." 
                    buttonText="Let's find the problem" 
                    onContinue={handleProblemGuidanceContinue} 
                  />
                )}
              </>
            )}
          </AppContainer>
        } />
      </Routes>
    </>
  );
}

export default AppContent;
