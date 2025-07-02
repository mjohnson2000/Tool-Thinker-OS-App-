import React, { useEffect, useState, useRef } from 'react';
import styled from 'styled-components';
import { FiCopy } from 'react-icons/fi';
import Confetti from 'react-confetti';
import { useAuth } from '../../contexts/AuthContext';
import MarketEvaluation from '../idea-flow/MarketEvaluation';
import { useNavigate } from 'react-router-dom';

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
  color: #181a1b;
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
  background: #181a1b;
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
    background: #000;
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
  background: linear-gradient(90deg, #181a1b 0%, #444 100%);
  width: ${({ percent }) => percent}%;
  transition: width 0.4s cubic-bezier(0.4, 0, 0.2, 1);
`;

const CongratsWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin-bottom: 1.5rem;
`;

const Congrats = styled.div`
  font-size: 2.2rem;
  font-weight: 800;
  color: #28a745;
  text-align: center;
  margin-bottom: 0.5rem;
  animation: pulsePop 1s cubic-bezier(0.23, 1, 0.32, 1) 0s 3;
  @keyframes pulsePop {
    0% { opacity: 0; transform: scale(0.7); }
    20% { opacity: 1; transform: scale(1.1); }
    50% { opacity: 1; transform: scale(1); }
    70% { opacity: 1; transform: scale(1.1); }
    100% { opacity: 1; transform: scale(1); }
  }
`;

const CenteredText = styled.p`
  text-align: center;
  width: 100%;
  margin-top: 1rem;
`;

interface StartupPlanPageDiscoveryProps {
  idea: any;
  customer: any;
  job: any;
  onSignup: () => void;
  onLogin: () => void;
  isAuthenticated: boolean;
  onContinueToValidation?: () => void;
}

interface StartupPlan {
  summary: string;
  sections: { [key: string]: string };
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

export function StartupPlanPageDiscovery(props: StartupPlanPageDiscoveryProps) {
  const { idea, customer, job, ...rest } = props;
  const { user, mockUpgradeToPremium } = useAuth();
  const [plan, setPlan] = useState<StartupPlan | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [progress, setProgress] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);
  const [showMarketEvaluation, setShowMarketEvaluation] = useState(false);
  const prevPlanRef = useRef<StartupPlan | null>(null);
  const navigate = useNavigate();

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
        const res = await fetch('/api/startup-plan/discovery', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ idea, customer, job })
        });
        if (!res.ok) throw new Error('Failed to generate startup plan');
        const data = await res.json();
        setPlan(data);
        setProgress(100);

        // Save plan to backend if authenticated
        if (user && user.email) {
          try {
            await fetch(`${API_URL}/startup-plan`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
              },
              body: JSON.stringify({
                title: 'Untitled Startup Plan',
                summary: data.summary,
                sections: data.sections,
                idea,
                customer,
                job,
                problem: {
                  description: data.sections?.Problem || 'Problem description not provided.',
                  impact: '',
                  urgency: 'medium'
                },
                solution: {
                  description: data.sections?.Product || 'Solution description not provided.',
                  keyFeatures: [],
                  uniqueValue: ''
                }
              })
            });
          } catch (saveErr) {
            // Optionally handle save error
          }
        }
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

  useEffect(() => {
    if (plan && plan !== prevPlanRef.current) {
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 12500);
      prevPlanRef.current = plan;
    }
  }, [plan]);

  let displayedSections: [string, string][] = [];
  if (plan) {
    const entries = Object.entries(plan.sections) as [string, string][];
    displayedSections = props.isAuthenticated ? entries : entries.slice(0, 2);
  }

  return (
    <Container>
      <Title>Your Startup Plan</Title>
      {isLoading && (
        <>
          <ProgressBarContainer>
            <ProgressBarFill percent={progress} />
          </ProgressBarContainer>
          <CenteredText>Generating your startup plan...</CenteredText>
        </>
      )}
      {error && <p style={{ color: 'red' }}>Error: {error}</p>}
      {plan && !isLoading && (
        <>
          <CongratsWrapper>
            {showConfetti && <Confetti numberOfPieces={180} recycle={false} style={{ pointerEvents: 'none' }} />}
            <Congrats>Congratulations!</Congrats>
          </CongratsWrapper>
          <Summary>{plan.summary}</Summary>
          {displayedSections.map(([section, content]) => (
            <SectionCard key={section}>
              <SectionTitle>{section}</SectionTitle>
              <SectionContent>{content}</SectionContent>
            </SectionCard>
          ))}
          <Actions>
            <ActionButton className="centered" onClick={() => navigate('/plans')}>
              Manage Startup Plan
            </ActionButton>
          </Actions>
        </>
      )}
    </Container>
  );
} 