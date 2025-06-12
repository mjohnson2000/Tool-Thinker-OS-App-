import React, { useState } from 'react';
import styled from 'styled-components';
import { Landing } from './components/idea-flow/Landing';
import { IdeaSelection } from './components/idea-flow/IdeaSelection';
import { CustomerSelection } from './components/idea-flow/CustomerSelection';
import { JobSelection } from './components/idea-flow/JobSelection';
import { Summary } from './components/idea-flow/Summary';
import './index.css';
import logo from './assets/logo.png';

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
  z-index: 100;
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

type Step = 'landing' | 'idea' | 'customer' | 'job' | 'summary';

type EntryPoint = 'idea' | 'customer';

export function App() {
  const [currentStep, setCurrentStep] = useState<Step>('landing');
  const [entryPoint, setEntryPoint] = useState<EntryPoint>('idea');
  const [idea, setIdea] = useState<{
    interests: string;
    area: { title: string; description: string; icon: string } | null;
  }>({
    interests: '',
    area: null
  });
  const [customer, setCustomer] = useState<{ title: string; description: string; icon: string } | null>(null);
  const [job, setJob] = useState<{ title: string; description: string; icon: string } | null>(null);

  function handleLandingSelect(step: EntryPoint) {
    setEntryPoint(step);
    setCurrentStep(step);
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

  function handleRestart() {
    setCurrentStep('landing');
    setIdea({ interests: '', area: null });
    setCustomer(null);
    setJob(null);
  }

  function handleBack() {
    if (currentStep === 'idea') {
      setCurrentStep('landing');
    } else if (currentStep === 'customer') {
      setCurrentStep(entryPoint === 'idea' ? 'idea' : 'landing');
    } else if (currentStep === 'job') {
      setCurrentStep('customer');
    } else if (currentStep === 'summary') {
      setCurrentStep('job');
    }
  }

  return (
    <AppContainer>
      <Logo src={logo} alt="ToolThinker Logo" onClick={() => setCurrentStep('landing')} />
      {currentStep !== 'landing' && (
        <NavBar>
          <NavButton onClick={handleBack} aria-label="Back">← Back</NavButton>
        </NavBar>
      )}
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
      {currentStep === 'summary' && (
        <Summary 
          idea={idea} 
          customer={customer} 
          job={job} 
          onRestart={handleRestart} 
        />
      )}
    </AppContainer>
  );
}

export default App;
