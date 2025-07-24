import React, { useEffect, useState, useRef } from 'react';
import styled from 'styled-components';
import { FiCopy } from 'react-icons/fi';
import Confetti from 'react-confetti';
import { useAuth } from '../../contexts/AuthContext';
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

const ListContent = styled.ul`
  color: #333;
  font-size: 1.05rem;
  margin: 0;
  padding-left: 1.5rem;
`;

const ListItem = styled.li`
  margin-bottom: 0.5rem;
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
  background: linear-gradient(180deg, #5ad6ff 0%, #5a6ee6 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  text-fill-color: transparent;
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

export interface StartupPlanPageDiscoveryProps {
  context: {
    idea: any;
    customer: any;
    job: any;
    problemDescription?: string | null;
    solutionDescription?: string | null;
    competitionDescription?: string | null;
    [key: string]: any;
  };
  onSignup?: () => void;
  onLogin?: () => void;
  isAuthenticated?: boolean;
  isSubscribed?: boolean;
  onContinueToValidation?: () => void;
}

interface StartupPlan {
  summary: string;
  sections: { [key: string]: string };
}

interface NewStartupPlan {
  businessIdeaSummary: string;
  customerProfile: { description: string };
  customerStruggle: string[];
  valueProposition: string;
  marketInformation: {
    marketSize: string;
    competitors: string[];
    trends: string[];
    validation: string;
  };
  financialSummary: string;
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

export function StartupPlanPageDiscovery({ context, onSignup, onLogin, isAuthenticated, isSubscribed }: StartupPlanPageDiscoveryProps) {
  console.log('StartupPlanPageDiscovery mounted');
  console.log('Props:', context);
  const { idea, customer, job, ...rest } = context;
  if (!idea || !customer || !job) {
    return (
      <Container>
        <Title>Your Business Idea</Title>
        <CenteredText style={{ color: '#c00', marginTop: 40 }}>
          Missing required information to generate a business idea.<br />
          Please complete all previous steps.
        </CenteredText>
      </Container>
    );
  }
  const { user, mockUpgradeToPremium } = useAuth();
  const [plan, setPlan] = useState<StartupPlan | null>(null);
  const [newPlan, setNewPlan] = useState<NewStartupPlan | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [progress, setProgress] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);
  const [showMarketEvaluation, setShowMarketEvaluation] = useState(false);
  const prevPlanRef = useRef<StartupPlan | null>(null);
  const navigate = useNavigate();
  const progressInterval = useRef<ReturnType<typeof setInterval> | null>(null);
  const hasSaved = useRef(false);

  // Helper to gather all context for plan generation
  function getFullContext() {
    return {
      idea: context.idea,
      customer: context.customer,
      job: context.job,
      problemDescription: context.problemDescription,
      solutionDescription: context.solutionDescription,
      competitionDescription: context.competitionDescription,
      // Add more fields as needed
    };
  }

  useEffect(() => {
    let cancelled = false;
    // Reset the save flag when props change
    hasSaved.current = false;
    
    async function safeFetchPlan() {
      if (!cancelled) {
        await fetchPlan();
      }
    }
    safeFetchPlan();
    return () => { 
      cancelled = true;
      if (progressInterval.current) clearInterval(progressInterval.current);
    };
  }, [context.idea, context.customer, context.job]);

  async function fetchPlan() {
    console.log('fetchPlan called');
    if (isLoading) return; // Prevent duplicate triggers
    
    // Add a flag to prevent duplicate saves
    if (plan) return; // Don't regenerate if we already have a plan
    
    setIsLoading(true);
    setProgress(0);
    setError(null);
    // Animate progress bar to 90% while loading
    progressInterval.current = setInterval(() => {
      setProgress(prev => {
        const next = prev < 90 ? prev + 5 : 90;
        console.log('Progress:', next);
        return next;
      });
    }, 200);
    console.log('Progress interval started');
    try {
      // Build a detailed prompt for the AI using all user input
      const aiPrompt = `
You are a startup strategist AI. Given the following user input:
- Interests: ${context.idea?.interests || ''}
- Customer Persona: ${context.customer?.title || ''} (${context.customer?.description || ''})
- Customer Job: ${context.job?.title || ''} (${context.job?.description || ''})

      Generate a concise Business Plan with the following sections:
- Business Idea Summary: 2-3 sentences summarizing the business idea based on the user's interests, customer persona, and job.
- Customer Profile: 1-2 sentences describing the target customer.
- Customer Struggles: 2-3 bullet points listing the main struggles or pain points of the customer related to the job.
- Value Proposition: 1-2 sentences proposing a solution to the customer struggles above, describing the unique value the business provides to the customer.
- Market Size: 1-2 sentences estimating the size or opportunity of the target market.
- Competitors: 2-3 bullet points listing main competitors or alternatives.
- Market Trends: 2-3 bullet points describing relevant trends in the market.
- Market Validation: 1-2 sentences on how the business idea can be validated or has been validated.
- Financial Summary: 2-3 sentences summarizing the expected revenue model, main costs, and financial opportunity for this business idea.

Return as JSON:
{
  summary: string,
  sections: {
    Customer: string,
    Struggles: string, // bullet points separated by newlines
    Value: string,
    MarketSize: string,
    Competitors: string, // bullet points separated by newlines
    Trends: string, // bullet points separated by newlines
    Validation: string,
    Financial: string
  }
}
No extra text, just valid JSON.`;

      console.log('About to POST to /api/business-plan/discovery', { idea, customer, job, prompt: aiPrompt });
      const res = await fetch(`${API_URL}/business-plan/discovery`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idea, customer, job, prompt: aiPrompt })
      });
      if (!res.ok) throw new Error('Failed to generate business plan');
      const data = await res.json();
      console.log('API response', data);
      setPlan(data);
      setProgress(100);

      // Map to new format for display and saving
      const mappedPlan: NewStartupPlan = {
        businessIdeaSummary: data.summary || `${context.idea?.interests ? `Business idea based on your interests: ${context.idea.interests}. ` : ''}${context.customer?.description ? `Targeting customer: ${context.customer.description}. ` : ''}${context.job?.description ? `Solving job: ${context.job.description}.` : ''}`,
        customerProfile: { description: data.sections?.Customer || context.customer?.description || '' },
        customerStruggle: (data.sections?.Struggles && data.sections.Struggles.split('\n').filter(Boolean))
          || (context.job && context.job.description ? [context.job.description] : [])
          || (context.customer?.painPoints ? context.customer.painPoints : []),
        valueProposition: data.sections?.Value || context.idea?.valueProposition || '',
        marketInformation: {
          marketSize: data.sections?.MarketSize || context.idea?.marketSize || '',
          competitors: (data.sections?.Competitors && data.sections.Competitors.split('\n').filter(Boolean))
            || (context.idea && context.idea.competitors ? context.idea.competitors.split('\n').filter(Boolean) : [])
            || (context.customer?.competitors ? context.customer.competitors : ['No competitors specified.']),
          trends: data.sections?.Trends ? data.sections.Trends.split('\n').filter(Boolean) : (context.idea?.trends ? context.idea.trends.split('\n').filter(Boolean) : []),
          validation: data.sections?.Validation || context.idea?.validation || '',
        },
        financialSummary: data.sections?.Financial || '',
      };
      setNewPlan(mappedPlan);

      // Save plan to backend if authenticated
      if (user && user.email && !hasSaved.current) {
        hasSaved.current = true; // Prevent duplicate saves
        try {
          // Generate a short title from the first 6 to 8 words of the summary
          function generateShortTitle(summary: string): string {
            if (!summary) return 'Untitled Business Plan';
            const words = summary.split(/\s+/).filter(Boolean);
            const shortTitle = words.slice(0, 8).join(' ');
            return shortTitle + (words.length > 8 ? '…' : '');
          }
          const shortTitle = generateShortTitle(mappedPlan.businessIdeaSummary);
          // Compose the correct payload for the backend
          const payload = {
            title: shortTitle,
            summary: mappedPlan.businessIdeaSummary,
            sections: {
              'Customer Profile': mappedPlan.customerProfile.description,
              'Customer Struggles': Array.isArray(mappedPlan.customerStruggle) ? mappedPlan.customerStruggle.join('\n') : mappedPlan.customerStruggle,
              'Value Proposition': mappedPlan.valueProposition,
              'Market Size': mappedPlan.marketInformation.marketSize,
              'Market Trends': Array.isArray(mappedPlan.marketInformation.trends) ? mappedPlan.marketInformation.trends.join('\n') : mappedPlan.marketInformation.trends,
              'Competitors': Array.isArray(mappedPlan.marketInformation.competitors) ? mappedPlan.marketInformation.competitors.join('\n') : mappedPlan.marketInformation.competitors,
              'Financial Summary': mappedPlan.financialSummary,
            },
            // Add all nested fields for direct view rendering
            businessIdeaSummary: mappedPlan.businessIdeaSummary,
            customerProfile: mappedPlan.customerProfile,
            customerStruggle: mappedPlan.customerStruggle,
            valueProposition: mappedPlan.valueProposition,
            marketInformation: mappedPlan.marketInformation,
            financialSummary: mappedPlan.financialSummary,
            idea: {
              title: context.idea?.title || 'Untitled Idea',
              description: context.idea?.interests || 'No idea description provided.'
            },
            customer: {
              title: context.customer?.title || 'Customer',
              description: context.customer?.description || 'No customer description provided.'
            },
            job: {
              title: context.job?.title || 'Customer Job',
              description: context.job?.description || 'No job description provided.'
            },
            problem: {
              description: mappedPlan.customerStruggle && Array.isArray(mappedPlan.customerStruggle) ? mappedPlan.customerStruggle[0] : (mappedPlan.customerStruggle || 'No problem description provided.'),
              impact: 'High',
              urgency: 'medium'
            },
            solution: {
              description: mappedPlan.valueProposition || 'No solution description provided.',
              keyFeatures: [mappedPlan.valueProposition || 'Key feature'],
              uniqueValue: mappedPlan.valueProposition || 'Unique value'
            }
          };
          await fetch(`${API_URL}/business-plan`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify(payload)
          });
        } catch (saveErr) {
          // Optionally handle save error
        }
      }
    } catch (err: any) {
      setError(err.message || 'Unknown error');
      setProgress(100);
      console.error('API error', err);
    } finally {
      setIsLoading(false);
      if (progressInterval.current) clearInterval(progressInterval.current);
      setTimeout(() => setProgress(0), 800);
    }
  }

  useEffect(() => {
    if (plan && plan !== prevPlanRef.current) {
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 12500);
      prevPlanRef.current = plan;
    }
  }, [plan]);

  const renderNewPlanSections = () => {
    if (!newPlan) return null;

    const sections = [
      {
        title: 'Business Idea Summary',
        content: newPlan.businessIdeaSummary,
        type: 'text'
      },
      {
        title: 'Customer Profile',
        content: newPlan.customerProfile.description,
        type: 'text'
      },
      {
        title: 'Customer Struggles',
        content: newPlan.customerStruggle,
        type: 'list'
      },
      {
        title: 'Value Proposition',
        content: newPlan.valueProposition,
        type: 'text'
      },
      {
        title: 'Market Research',
        content: {
          marketSize: newPlan.marketInformation.marketSize,
          trends: newPlan.marketInformation.trends,
          competitors: newPlan.marketInformation.competitors,
        },
        type: 'marketResearch'
      },
      {
        title: 'Financial Summary',
        content: newPlan.financialSummary,
        type: 'text'
      },
    ];

    // Only show first 2 sections for unauthenticated users
    const visibleSections = isAuthenticated ? sections : sections.slice(0, 2);

    return (
      <>
        {visibleSections.map((section, index) => (
          <SectionCard key={index}>
            <SectionTitle>{section.title}</SectionTitle>
            {section.type === 'list' ? (
              <ListContent>
                {Array.isArray(section.content) && section.content.map((item, i) => (
                  <ListItem key={i}>{item}</ListItem>
                ))}
              </ListContent>
            ) : section.type === 'marketResearch' ? (
              (() => {
                const content = section.content as { marketSize: string; trends: string[]; competitors: string[] };
                return (
                  <>
                    <div style={{ marginBottom: 8 }}>
                      <strong>Market Size:</strong> {content.marketSize || 'N/A'}
                    </div>
                    <div style={{ marginTop: 12, marginBottom: 4 }}><strong>Market Trends:</strong></div>
                    <ListContent>
                      {Array.isArray(content.trends) && content.trends.length > 0 ? (
                        content.trends.map((trend: string, i: number) => <ListItem key={i}>{trend}</ListItem>)
                      ) : (
                        <ListItem>N/A</ListItem>
                      )}
                    </ListContent>
                    <div style={{ marginTop: 12, marginBottom: 4 }}><strong>Competitors:</strong></div>
                    <ListContent>
                      {Array.isArray(content.competitors) && content.competitors.length > 0 ? (
                        content.competitors.map((comp: string, i: number) => <ListItem key={i}>{comp}</ListItem>)
                      ) : (
                        <ListItem>N/A</ListItem>
                      )}
                    </ListContent>
                  </>
                );
              })()
            ) : (
              <SectionContent>{typeof section.content === 'string' ? section.content : ''}</SectionContent>
            )}
          </SectionCard>
        ))}
        {!isAuthenticated && (
          <SignupPrompt>
            <SignupTitle>Unlock Your Full Business Idea</SignupTitle>
            <SignupText>Sign up or log in to see the full idea and save your progress!</SignupText>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginTop: '1.5rem' }}>
              <ActionButton onClick={onSignup}>Sign Up</ActionButton>
              <ActionButton onClick={onLogin}>Log In</ActionButton>
            </div>
          </SignupPrompt>
        )}
      </>
    );
  };

  return (
    <Container>
      <Title>Your Business Idea</Title>
      {isLoading && (
        <>
          <ProgressBarContainer>
            <ProgressBarFill percent={progress} />
          </ProgressBarContainer>
          <CenteredText>Generating your business idea...</CenteredText>
        </>
      )}
      {error && <p style={{ color: 'red' }}>Error: {error}</p>}
      {newPlan && !isLoading && (
        <>
          <CongratsWrapper>
            {showConfetti && <Confetti numberOfPieces={180} recycle={false} style={{ pointerEvents: 'none' }} />}
            <Congrats>Congratulations!</Congrats>
          </CongratsWrapper>
          {renderNewPlanSections()}
          {isAuthenticated && (
            <Actions>
              <ActionButton className="centered" onClick={() => navigate('/plans')}>
                Manage Business Ideas
              </ActionButton>
            </Actions>
          )}
        </>
      )}
      {!isLoading && !newPlan && !error && (
        <CenteredText>
          Sorry, we couldn't generate your business idea. Please try again or contact support.
        </CenteredText>
      )}
    </Container>
  );
} 