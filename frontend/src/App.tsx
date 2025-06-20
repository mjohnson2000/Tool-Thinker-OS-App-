import React, { useState } from 'react';
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
import { TestHooks } from './TestHooks';
import { Login } from './components/auth/Login';
import { Profile } from './components/auth/Profile';
import { FaUserCircle } from 'react-icons/fa';
import { ResetPassword } from './components/auth/ResetPassword';
import { BrowserRouter as Router, Routes, Route, useParams, Navigate } from 'react-router-dom';
import { DescribeCustomer } from './components/idea-flow/DescribeCustomer';
import { DescribeProblem } from './components/idea-flow/DescribeProblem';
import { DescribeSolution } from './components/idea-flow/DescribeSolution';
import { DescribeCompetition } from './components/idea-flow/DescribeCompetition';
import { Guidance } from './components/idea-flow/Guidance';
import { BusinessPlanPage } from './components/idea-flow/BusinessPlanPage';
import { ProgressTracker } from './components/idea-flow/ProgressTracker';
import type { BusinessArea } from './components/idea-flow/IdeaSelection';
import type { CustomerOption } from './components/idea-flow/CustomerSelection';
import type { JobOption } from './components/idea-flow/JobSelection';

const AppContainer = styled.div`
  min-height: 100vh;
  background: #f5f5f7;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
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
  padding: 2.7rem 2rem 0 0;
  z-index: 1000;
`;

const AvatarButton = styled.button`
  background: none;
  border: none;
  padding: 0;
  margin-left: 1rem;
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
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
  background: #e5e5e5;
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
    background: #f5f5f7;
    border-color: #007AFF;
    color: #007AFF;
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
  background: #fff;
  color: #555;
  border: 1px solid #e5e5e5;
  border-radius: 8px;
  padding: 0.5rem 1rem;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  margin-top: 1rem;
  width: 100%;
  transition: background 0.2s, color 0.2s;

  &:hover {
    background: #f5f5f7;
    color: #000;
  }
`;

const defaultAvatar = 'https://ui-avatars.com/api/?name=User&background=007AFF&color=fff&size=128';

type Step = 'landing' | 'idea' | 'customer' | 'job' | 'summary' | 'signup' | 'login' | 'profile' | 'existingIdea' | 'describeCustomer' | 'describeProblem' | 'describeSolution' | 'describeCompetition' | 'customerGuidance' | 'problemGuidance' | 'competitionGuidance' | 'businessPlan';

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

const ideaFlowSteps = [
    { key: 'idea', label: '1. Your Interests' },
    { key: 'customer', label: '2. Customer Persona' },
    { key: 'job', label: '3. Customer Job' },
    { key: 'summary', label: '4. Business Plan' },
];

const prematureIdeaFlowSteps = [
    { key: 'existingIdea', label: '1. Your Idea' },
    { key: 'describeCustomer', label: '2. Your Customer' },
    { key: 'describeProblem', label: '3. The Problem' },
    { key: 'describeSolution', label: '4. The Solution' },
    { key: 'describeCompetition', label: '5. Your Advantage' },
    { key: 'businessPlan', label: '6. Business Plan' },
];

const flowStepKeys = [...ideaFlowSteps.map(s => s.key), ...prematureIdeaFlowSteps.map(s => s.key)];

function ResetPasswordRoute() {
  const { token } = useParams<{ token: string }>();
  const { resetPassword } = useAuth();
  if (!token) return <Navigate to="/login" />;
  return <ResetPassword token={token} onResetPassword={resetPassword} />;
}

function AppContent() {
  const [currentStep, setCurrentStep] = useState<Step>('landing');
  const [entryPoint, setEntryPoint] = useState<EntryPoint>('idea');
  const [idea, setIdea] = useState<{
    interests: string;
    area: BusinessArea | null;
    existingIdeaText?: string;
  }>({
    interests: '',
    area: null,
    existingIdeaText: '',
  });
  const [customer, setCustomer] = useState<CustomerOption | null>(null);
  const [job, setJob] = useState<JobOption | null>(null);
  const [problemDescription, setProblemDescription] = useState<string | null>(null);
  const [solutionDescription, setSolutionDescription] = useState<string | null>(null);
  const [competitionDescription, setCompetitionDescription] = useState<string | null>(null);
  const { isAuthenticated, signup, login, user, requestPasswordReset } = useAuth();
  const [isTrackerVisible, setIsTrackerVisible] = useState(true);
  const [stepBeforeAuth, setStepBeforeAuth] = useState<Step | null>(null);

  const isFlowStep = flowStepKeys.includes(currentStep);
  const activeFlowSteps = entryPoint === 'idea' ? ideaFlowSteps : prematureIdeaFlowSteps;

  function handleStepClick(step: string) {
    if (activeFlowSteps.some(s => s.key === step)) {
      setCurrentStep(step as Step);
    }
  }

  function handleLandingSelect(step: EntryPoint) {
    setEntryPoint(step);
    if (step === 'customer') {
      setCurrentStep('existingIdea');
    } else {
      setCurrentStep(step);
    }
  }

  function handleIdeaSelect(selectedIdea: { interests: string; area: BusinessArea }) {
    setIdea(selectedIdea);
    setCurrentStep('customer');
  }

  function handleCustomerSelect(selectedCustomer: CustomerOption) {
    setCustomer(selectedCustomer);
    setCurrentStep('job');
  }

  function handleJobSelect(selectedJob: JobOption) {
    setJob(selectedJob);
    setCurrentStep('summary');
  }

  function handleExistingIdeaSubmit(ideaText: string) {
    setIdea(prev => ({ ...prev, existingIdeaText: ideaText, area: { id: 'custom', title: 'Custom Idea', description: ideaText, icon: '💡' } }));
    setCurrentStep('describeCustomer');
  }

  function handleDescribeCustomerSubmit(description: string | null) {
    if (description) {
      setCustomer({ id: 'custom', title: 'Custom Customer', description: description, icon: '👤' });
      setCurrentStep('describeProblem');
    } else {
      setCurrentStep('customerGuidance');
    }
  }

  function handleDescribeProblemSubmit(description: string | null) {
    setProblemDescription(description);
    if (description === null) {
      setCurrentStep('problemGuidance');
    } else {
      setCurrentStep('describeSolution');
    }
  }

  function handleDescribeSolutionSubmit(description: string) {
    setSolutionDescription(description);
    setCurrentStep('describeCompetition');
  }

  function handleDescribeCompetitionSubmit(description: string | null) {
    setCompetitionDescription(description);
    setCurrentStep('businessPlan');
  }

  function handleRestart() {
    setCurrentStep('landing');
    setIdea({ interests: '', area: null, existingIdeaText: '' });
    setCustomer(null);
    setProblemDescription(null);
    setSolutionDescription(null);
    setCompetitionDescription(null);
    setJob(null);
  }

  function handleBack() {
    if (currentStep === 'idea') {
      setCurrentStep('landing');
    } else if (currentStep === 'customer') {
      if (idea.existingIdeaText) {
        setCurrentStep('describeCustomer');
      } else {
        setCurrentStep(entryPoint === 'idea' ? 'idea' : 'landing');
      }
    } else if (currentStep === 'job') {
      if (customer?.title === 'Custom Customer') {
        setCurrentStep('describeCustomer');
      } else {
        setCurrentStep('customer');
      }
    } else if (currentStep === 'summary') {
      setCurrentStep('job');
    } else if (currentStep === 'signup') {
      setCurrentStep('summary');
    } else if (currentStep === 'login') {
      setCurrentStep(stepBeforeAuth || 'summary');
    } else if (currentStep === 'profile') {
      setCurrentStep(stepBeforeAuth || 'summary');
    } else if (currentStep === 'existingIdea') {
      setCurrentStep('landing');
    } else if (currentStep === 'describeCustomer') {
      setCurrentStep('existingIdea');
    } else if (currentStep === 'describeProblem') {
      setCurrentStep('describeCustomer');
    } else if (currentStep === 'describeSolution') {
      setCurrentStep('describeProblem');
    } else if (currentStep === 'describeCompetition') {
      setCurrentStep('describeSolution');
    } else if (currentStep === 'customerGuidance') {
      setCurrentStep('describeCustomer');
    } else if (currentStep === 'businessPlan') {
      setCurrentStep('describeCompetition');
    }
  }

  return (
    <Router>
      <Routes>
        <Route path="/reset-password/:token" element={<ResetPasswordRoute />} />
        <Route path="*" element={
          <AppContainer>
            <Logo src={logo} alt="ToolThinker Logo" onClick={() => {
              setCurrentStep('landing');
              setIdea({ interests: '', area: null, existingIdeaText: '' });
              setCustomer(null);
              setProblemDescription(null);
              setSolutionDescription(null);
              setCompetitionDescription(null);
              setJob(null);
            }} />
            {currentStep !== 'landing' && currentStep !== 'signup' && currentStep !== 'login' && (
              <NavBar>
                <NavButton onClick={handleBack} aria-label="Back">← Back</NavButton>
              </NavBar>
            )}
            <TopBar>
              {!isAuthenticated ? (
                <>
                  <LoginButton onClick={() => setCurrentStep('login')} aria-label="Log In">
                    Log in
                  </LoginButton>
                  <SignupFreeButton onClick={() => setCurrentStep('signup')} aria-label="Sign up for free">
                    Sign up for free
                  </SignupFreeButton>
                </>
              ) : (
                <AvatarButton onClick={() => {
                  setStepBeforeAuth(currentStep);
                  setCurrentStep('profile');
                }} aria-label="Profile" style={{ background: '#fff', border: '1px solid #e5e5e5', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
                  <AvatarImg src={defaultAvatar} alt="Avatar" />
                </AvatarButton>
              )}
            </TopBar>
            {isFlowStep ? (
              <PageLayout>
                {isTrackerVisible && (
                  <Sidebar>
                      <ProgressTracker 
                        steps={activeFlowSteps} 
                        currentStepKey={currentStep}
                        onStepClick={handleStepClick}
                      />
                      <ToggleTrackerButton onClick={() => setIsTrackerVisible(false)}>Hide Tracker</ToggleTrackerButton>
                  </Sidebar>
                )}
                <MainContent isExpanded={!isTrackerVisible}>
                  {!isTrackerVisible && (
                    <ToggleTrackerButton onClick={() => setIsTrackerVisible(true)} style={{ marginBottom: '1rem', width: 'auto' }}>Show Tracker</ToggleTrackerButton>
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
                        setStepBeforeAuth('summary');
                        setCurrentStep('signup');
                      }} 
                      onLogin={() => {
                        setStepBeforeAuth('summary');
                        setCurrentStep('login');
                      }} 
                    /> )}
                  {currentStep === 'existingIdea' && <ExistingIdea onSubmit={handleExistingIdeaSubmit} initialValue={idea.existingIdeaText} />}
                  {currentStep === 'describeCustomer' && <DescribeCustomer onSubmit={handleDescribeCustomerSubmit} initialValue={customer?.description} />}
                  {currentStep === 'describeProblem' && <DescribeProblem onSubmit={handleDescribeProblemSubmit} customer={customer} initialValue={problemDescription} />}
                  {currentStep === 'describeSolution' && <DescribeSolution onSubmit={handleDescribeSolutionSubmit} problemDescription={problemDescription} initialValue={solutionDescription} />}
                  {currentStep === 'describeCompetition' && <DescribeCompetition onSubmit={handleDescribeCompetitionSubmit} solutionDescription={solutionDescription} initialValue={competitionDescription} />}
                  {currentStep === 'businessPlan' && ( <BusinessPlanPage 
                      idea={idea} 
                      customer={customer} 
                      problemDescription={problemDescription} 
                      solutionDescription={solutionDescription} 
                      competitionDescription={competitionDescription}
                      onSignup={() => {
                        setStepBeforeAuth('businessPlan');
                        setCurrentStep('signup');
                      }}
                      onLogin={() => {
                        setStepBeforeAuth('businessPlan');
                        setCurrentStep('login');
                      }}
                    /> )}
                </MainContent>
              </PageLayout>
            ) : (
              <>
                {currentStep === 'landing' && <Landing onSelect={handleLandingSelect} />}
                {currentStep === 'signup' && <Signup onSignup={async (email, password) => {
                  try {
                    await signup(email, password);
                    setCurrentStep(stepBeforeAuth || 'summary');
                  } catch (err: any) {
                    if (err.message && err.message.toLowerCase().includes('already registered')) {
                      setCurrentStep('login');
                      return;
                    }
                    throw err;
                  }
                }} onLogin={() => setCurrentStep('login')} />}
                {currentStep === 'login' && <Login onLogin={async (email, password) => {
                  await login(email, password);
                  setCurrentStep(stepBeforeAuth || 'summary');
                }} onSignup={() => setCurrentStep('signup')} onRequestPasswordReset={requestPasswordReset} />}
                {currentStep === 'profile' && <Profile />}
                {currentStep === 'customerGuidance' && ( <Guidance message="That's perfectly fine! A great business is built on a deep understanding of its customers. Let's explore some potential customer types to get you started." buttonText="Let's find my customer" onContinue={() => setCurrentStep('customer')} /> )}
                {currentStep === 'problemGuidance' && ( <Guidance message="No problem at all! The best businesses solve a clear, painful problem. Let's figure out what job your customers need done." buttonText="Let's find the problem" onContinue={() => setCurrentStep('describeSolution')} /> )}
              </>
            )}
          </AppContainer>
        } />
      </Routes>
    </Router>
  );
}

export function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
