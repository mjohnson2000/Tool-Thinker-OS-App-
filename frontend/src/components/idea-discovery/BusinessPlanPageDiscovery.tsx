import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { FiCopy } from 'react-icons/fi';

const Container = styled.div`
  background: #fff;
  border-radius: 18px;
  box-shadow: 0 4px 24px rgba(0,0,0,0.08);
  padding: 2.5rem 2rem;
  max-width: 800px;
  margin: 2rem auto;
`;

const Title = styled.h1`
  font-size: 2.2rem;
  font-weight: 700;
  margin-bottom: 1.5rem;
  color: #222;
  text-align: center;
`;

const Summary = styled.p`
  font-size: 1.15rem;
  color: #444;
  margin-bottom: 2.5rem;
  background: #f5f7fa;
  border-radius: 8px;
  padding: 1.2rem 1rem;
`;

const SectionCard = styled.div`
  background: #f8f9fa;
  border-radius: 12px;
  padding: 1.5rem 1.2rem;
  margin-bottom: 1.5rem;
  box-shadow: 0 2px 8px rgba(0,0,0,0.04);
`;

const SectionTitle = styled.h2`
  font-size: 1.2rem;
  font-weight: 600;
  color: #007AFF;
  margin-bottom: 0.7rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const SectionContent = styled.p`
  color: #333;
  font-size: 1.05rem;
  margin: 0;
`;

const Actions = styled.div`
  display: flex;
  gap: 1rem;
  margin-top: 2.5rem;
  flex-wrap: wrap;
  justify-content: center;
`;

const ActionButton = styled.button`
  background: #007AFF;
  color: #fff;
  border: none;
  border-radius: 8px;
  padding: 0.7rem 1.5rem;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: background 0.2s;
  &:hover {
    background: #0056b3;
  }
  &.centered {
    display: block;
    margin: 0 auto;
    justify-content: center;
  }
`;

const SignupPrompt = styled.div`
  background: #f8f9fa;
  border-radius: 12px;
  padding: 2rem;
  margin: 2rem 0;
  text-align: center;
  border: 2px solid #e9ecef;
`;

const SignupTitle = styled.h3`
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 1rem;
  color: #212529;
`;

const SignupText = styled.p`
  color: #6c757d;
  margin-bottom: 1.5rem;
  font-size: 1.1rem;
`;

const ProgressBarContainer = styled.div`
  width: 100%;
  max-width: 400px;
  height: 8px;
  background: #e5e5e5;
  border-radius: 4px;
  margin: 2rem auto 1.5rem auto;
  overflow: hidden;
`;

const ProgressBarFill = styled.div<{ percent: number }>`
  height: 100%;
  background: linear-gradient(90deg, #007AFF 0%, #4FC3F7 100%);
  width: ${({ percent }) => percent}%;
  transition: width 0.4s cubic-bezier(0.4, 0, 0.2, 1);
`;

interface BusinessPlanPageDiscoveryProps {
  idea: any;
  customer: any;
  job: any;
  onSignup: () => void;
  onLogin: () => void;
  isAuthenticated: boolean;
}

interface BusinessPlan {
  summary: string;
  sections: { [key: string]: string };
}

export function BusinessPlanPageDiscovery(props: BusinessPlanPageDiscoveryProps) {
  const { idea, customer, job, ...rest } = props;
  console.log('BusinessPlanPageDiscovery received props:', { idea, customer, job, ...rest });
  if (!idea || !customer || !job) {
    return <div style={{ color: 'red', textAlign: 'center', marginTop: '2rem' }}>
      Missing required data for business plan.<br />
      idea: {JSON.stringify(idea)}<br />
      customer: {JSON.stringify(customer)}<br />
      job: {JSON.stringify(job)}
    </div>;
  }
  const [plan, setPlan] = useState<BusinessPlan | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let progressInterval: ReturnType<typeof setInterval> | null = null;
    async function fetchPlan() {
      setIsLoading(true);
      setProgress(0);
      setError(null);
      try {
        // Animate progress bar to 90% while loading
        progressInterval = setInterval(() => {
          setProgress(prev => (prev < 90 ? prev + 5 : 90));
        }, 200);
        const res = await fetch('/api/business-plan/discovery', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ idea, customer, job })
        });
        if (!res.ok) throw new Error('Failed to generate business plan');
        const data = await res.json();
        setPlan(data);
        setProgress(100);
      } catch (err: any) {
        setError(err.message || 'Unknown error');
        setProgress(100);
      } finally {
        setIsLoading(false);
        if (progressInterval) clearInterval(progressInterval);
        setTimeout(() => setProgress(0), 800);
      }
    }
    fetchPlan();
    return () => {
      if (progressInterval) clearInterval(progressInterval);
    };
  }, [idea, customer, job]);

  function handleCopy() {
    if (!plan) return;
    let text = `Summary:\n${plan.summary}\n\n` +
      displayedSections
        .map(([section, content]) => `${section}:\n${content}\n`)
        .join('\n');
    if (!props.isAuthenticated) {
      text += '\n\n[Sign up or log in to view the complete business plan]';
    }
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  let displayedSections: [string, string][] = [];
  if (plan) {
    const entries = Object.entries(plan.sections) as [string, string][];
    displayedSections = props.isAuthenticated ? entries : entries.slice(0, 2);
  }

  return (
    <Container>
      <Title>Your Business Plan</Title>
      {isLoading && (
        <>
          <ProgressBarContainer>
            <ProgressBarFill percent={progress} />
          </ProgressBarContainer>
          <p>Generating your business plan...</p>
        </>
      )}
      {error && <p style={{ color: 'red' }}>Error: {error}</p>}
      {plan && (
        <>
          <Summary>{plan.summary}</Summary>
          {displayedSections.map(([section, content]) => (
            <SectionCard key={section}>
              <SectionTitle>{section}</SectionTitle>
              <SectionContent>{content}</SectionContent>
            </SectionCard>
          ))}
          {!props.isAuthenticated && (
            <SignupPrompt>
              <SignupTitle>Unlock Your Complete Business Plan</SignupTitle>
              <SignupText>You're viewing a preview of your business plan. Sign up or log in to access the full plan with all sections and actionable insights.</SignupText>
              <ActionButton className="centered" onClick={props.onSignup}>Sign Up to Continue</ActionButton>
              <p style={{marginTop: '1rem', fontSize: '0.9rem'}}>
                Already have an account? <a href="#" onClick={e => { e.preventDefault(); props.onLogin(); }}>Log In</a>
              </p>
            </SignupPrompt>
          )}
          <Actions>
            {props.isAuthenticated && (
              <ActionButton onClick={handleCopy} aria-label="Copy business plan">
                <FiCopy /> {copied ? 'Copied!' : 'Copy Plan'}
              </ActionButton>
            )}
          </Actions>
        </>
      )}
    </Container>
  );
} 