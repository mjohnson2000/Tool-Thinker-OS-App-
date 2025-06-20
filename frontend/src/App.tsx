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

const defaultAvatar = 'https://ui-avatars.com/api/?name=User&background=007AFF&color=fff&size=128';

type Step = 'landing' | 'idea' | 'customer' | 'job' | 'summary' | 'signup' | 'login' | 'profile' | 'existingIdea' | 'describeCustomer' | 'describeProblem' | 'describeSolution' | 'describeCompetition';

type EntryPoint = 'idea' | 'customer';

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
    area: { title: string; description: string; icon: string } | null;
    existingIdeaText?: string;
  }>({
    interests: '',
    area: null,
    existingIdeaText: '',
  });
  const [customer, setCustomer] = useState<{ title: string; description: string; icon: string } | null>(null);
  const [job, setJob] = useState<{ title: string; description: string; icon: string } | null>(null);
  const [problemDescription, setProblemDescription] = useState<string | null>(null);
  const [solutionDescription, setSolutionDescription] = useState<string | null>(null);
  const [competitionDescription, setCompetitionDescription] = useState<string | null>(null);
  const { isAuthenticated, signup, login, user, requestPasswordReset } = useAuth();

  function handleLandingSelect(step: EntryPoint) {
    setEntryPoint(step);
    if (step === 'customer') {
      setCurrentStep('existingIdea');
    } else {
      setCurrentStep(step);
    }
  }

  function handleIdeaSelect(selectedIdea: { interests: string; area: { title: string; description: string; icon: string } }) {
    setIdea(selectedIdea);
    setCurrentStep('customer');
  }

  function handleCustomerSelect(selectedCustomer: { title: string; description: string; icon: string }) {
    setCustomer(selectedCustomer);
    setCurrentStep('job');
  }

  function handleJobSelect(selectedJob: { title: string; description: string; icon: string }) {
    setJob(selectedJob);
    setCurrentStep('summary');
  }

  function handleExistingIdeaSubmit(ideaText: string) {
    setIdea(prev => ({ ...prev, existingIdeaText: ideaText, area: { title: 'Custom Idea', description: ideaText, icon: '💡' } }));
    setCurrentStep('describeCustomer');
  }

  function handleDescribeCustomerSubmit(description: string | null) {
    if (description) {
      setCustomer({ title: 'Custom Customer', description: description, icon: '👤' });
    }
    setCurrentStep('describeProblem');
  }

  function handleDescribeProblemSubmit(description: string | null) {
    setProblemDescription(description);
    setCurrentStep('describeSolution');
  }

  function handleDescribeSolutionSubmit(description: string) {
    setSolutionDescription(description);
    setCurrentStep('describeCompetition');
  }

  function handleDescribeCompetitionSubmit(description: string | null) {
    setCompetitionDescription(description);
    if (customer) {
      setCurrentStep('job');
    } else {
      setCurrentStep('customer');
    }
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
      setCurrentStep('signup');
    } else if (currentStep === 'profile') {
      setCurrentStep('summary');
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
                <AvatarButton onClick={() => setCurrentStep('profile')} aria-label="Profile" style={{ background: '#fff', border: '1px solid #e5e5e5', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
                  <AvatarImg src={defaultAvatar} alt="Avatar" />
                </AvatarButton>
              )}
            </TopBar>
            {currentStep === 'landing' && (
              <Landing onSelect={handleLandingSelect} />
            )}
            {currentStep === 'idea' && (
              <IdeaSelection onSelect={handleIdeaSelect} />
            )}
            {currentStep === 'customer' && (
              <CustomerSelection onSelect={handleCustomerSelect} businessArea={idea.area} />
            )}
            {currentStep === 'job' && (
              <JobSelection onSelect={handleJobSelect} customer={customer} />
            )}
            {currentStep === 'existingIdea' && (
              <ExistingIdea onSubmit={handleExistingIdeaSubmit} />
            )}
            {currentStep === 'describeCustomer' && (
              <DescribeCustomer onSubmit={handleDescribeCustomerSubmit} />
            )}
            {currentStep === 'describeProblem' && (
              <DescribeProblem onSubmit={handleDescribeProblemSubmit} />
            )}
            {currentStep === 'describeSolution' && (
              <DescribeSolution onSubmit={handleDescribeSolutionSubmit} />
            )}
            {currentStep === 'describeCompetition' && (
              <DescribeCompetition onSubmit={handleDescribeCompetitionSubmit} />
            )}
            {currentStep === 'summary' && (idea.area || idea.existingIdeaText) && customer && job && (
              <Summary 
                idea={{ interests: idea.interests, area: { ...idea.area, id: (idea.area as any).id || '' }, existingIdeaText: idea.existingIdeaText, problemDescription: problemDescription, solutionDescription: solutionDescription, competitionDescription: competitionDescription }}
                customer={{ ...customer, id: (customer as any).id || '' }}
                job={{ ...job, id: (job as any).id || '' }}
                onRestart={handleRestart}
                onSignup={() => setCurrentStep('signup')}
                onLogin={() => setCurrentStep('login')}
              />
            )}
            {currentStep === 'signup' && (
              <Signup 
                onSignup={async (email, password) => {
                  try {
                    await signup(email, password);
                    setCurrentStep('summary');
                  } catch (err: any) {
                    if (err.message && err.message.toLowerCase().includes('already registered')) {
                      setCurrentStep('login');
                      return;
                    }
                    throw err;
                  }
                }}
                onLogin={() => setCurrentStep('login')}
              />
            )}
            {currentStep === 'login' && (
              <Login
                onLogin={async (email, password) => {
                  await login(email, password);
                  setCurrentStep('summary');
                }}
                onSignup={() => setCurrentStep('signup')}
                onRequestPasswordReset={requestPasswordReset}
              />
            )}
            {currentStep === 'profile' && (
              <Profile />
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
