import React from 'react';
import styled from 'styled-components';
import { fetchChatGPT } from '../../utils/chatgpt';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title as ChartTitle,
  Tooltip,
  Legend,
} from 'chart.js';
import Confetti from 'react-confetti';
import { useAuth } from '../../contexts/AuthContext';
import type { BusinessArea } from './IdeaSelection';
import type { CustomerOption } from './CustomerSelection';
import type { JobOption } from './JobSelection';

ChartJS.register(CategoryScale, LinearScale, BarElement, ChartTitle, Tooltip, Legend);

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  max-width: 700px;
  margin: 0 auto;
  padding: 2rem;
`;

const Title = styled.h2`
  font-size: 2rem;
  font-weight: 700;
  margin-bottom: 2rem;
  text-align: center;
`;

const Section = styled.div`
  background: var(--card-background);
  border-radius: 14px;
  box-shadow: var(--shadow);
  padding: 1.5rem 1.5rem 1.5rem 2rem;
  margin-bottom: 1.5rem;
  width: 100%;
`;

const SectionTitle = styled.h3`
  font-size: 1.15rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
`;

const SectionText = styled.p`
  color: var(--text-primary);
  font-size: 1rem;
  margin-bottom: 0.5rem;
`;

const Highlight = styled.span`
  color: #007AFF;
  font-weight: 600;
`;

const RestartButton = styled.button`
  margin-top: 2rem;
  background: #007AFF;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 0.75rem 1.5rem;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s;
  &:hover {
    background: #0056b3;
  }
`;

const Visual = styled.div`
  margin: 1rem 0 0.5rem 0;
  font-size: 2rem;
  text-align: center;
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

type ChartVisual = { description: string; chartData?: { labels: string[]; values: number[] } };

interface SummaryProps {
  idea: { 
    interests: string; 
    area: BusinessArea, 
    existingIdeaText?: string, 
    problemDescription?: string | null, 
    solutionDescription?: string | null,
    competitionDescription?: string | null 
  } | null;
  customer: CustomerOption | null;
  job: JobOption | null;
  onRestart: () => void;
  onSignup: () => void;
  onLogin: () => void;
}

const sectionIcons = {
  executiveSummary: '📝',
  targetMarket: '🎯',
  problem: '❗',
  solution: '💡',
  features: '✨',
  goToMarket: '🚀',
  nextSteps: '✅',
};

const NextStepsHighlight = styled.div`
  background: #e6f0ff;
  border-radius: 10px;
  padding: 1rem 1.5rem;
  margin-top: 1rem;
`;

const CongratsOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  pointer-events: none;
`;

const CongratsText = styled.div`
  background: rgba(255,255,255,0.95);
  border-radius: 24px;
  box-shadow: 0 8px 32px rgba(0,0,0,0.12);
  padding: 2.5rem 3.5rem;
  font-size: 2rem;
  font-weight: 700;
  color: #007AFF;
  text-align: center;
  letter-spacing: -1px;
  animation: popIn 0.5s cubic-bezier(0.4,0,0.2,1);
  @keyframes popIn {
    0% { transform: scale(0.7); opacity: 0; }
    100% { transform: scale(1); opacity: 1; }
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

const SignupButton = styled.button`
  background: #007AFF;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 0.75rem 1.5rem;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s;
  &:hover {
    background: #0056b3;
  }
`;

export function Summary({ idea, customer, job, onRestart, onSignup, onLogin }: SummaryProps) {
  const [plan, setPlan] = React.useState<null | {
    executiveSummary: string;
    targetMarket: string[];
    problem: string;
    solution: string;
    features: string[];
    goToMarket: string[];
    nextSteps: string[];
    visuals: {
      executiveSummary?: string | ChartVisual;
      targetMarket?: string | ChartVisual;
      problem?: string | ChartVisual;
      solution?: string | ChartVisual;
      features?: string | ChartVisual;
      goToMarket?: string | ChartVisual;
      nextSteps?: string | ChartVisual;
    };
  }>(null);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [progress, setProgress] = React.useState(0);
  const [showConfetti, setShowConfetti] = React.useState(false);
  const { isAuthenticated } = useAuth();

  React.useEffect(() => {
    async function generatePlan() {
      if (!idea?.area || !customer || !job) return;
      setIsLoading(true);
      setProgress(0);
      setError(null);
      let progressInterval: ReturnType<typeof setInterval> | null = null;
      try {
        // Animate progress bar to 90% while loading
        progressInterval = setInterval(() => {
          setProgress(prev => (prev < 90 ? prev + 5 : 90));
        }, 200);

        const ideaPrompt = idea.existingIdeaText
          ? `Business Idea: ${idea.existingIdeaText}`
          : `Business Area: ${idea.area.title} - ${idea.area.description}`;

        const customerPrompt = customer.title === 'Custom Customer'
          ? `Customer Profile: ${customer.description}`
          : `Customer: ${customer.title} - ${customer.description}`;

        const problemPrompt = idea.problemDescription
          ? `Problem Statement: ${idea.problemDescription}`
          : ``;

        const solutionPrompt = idea.solutionDescription
          ? `Solution: ${idea.solutionDescription}`
          : ``;

        const competitionPrompt = idea.competitionDescription
          ? `Competitive Advantage: ${idea.competitionDescription}`
          : ``;

        const prompt = `
Given the following:
${ideaPrompt}
${customerPrompt}
${problemPrompt}
${solutionPrompt}
${competitionPrompt}
Job: ${job.title} - ${job.description}
Generate a professional business plan as a single valid JSON object with these keys ONLY: executiveSummary, targetMarket, problem, solution, features, goToMarket, nextSteps, visuals. Each value should be a string or array as appropriate. Do NOT include any explanation, markdown, or extra text. Only output the JSON object, nothing else.`;
        const response = await fetchChatGPT(prompt);
        let parsed = typeof response === 'object' && response !== null ? response : null;
        if (!parsed) {
          try {
            parsed = JSON.parse(response);
          } catch {
            // Try to extract the largest valid JSON object from the string
            const match = response.match && response.match(/\{[\s\S]*\}/);
            if (match) {
              let jsonStr = match[0];
              jsonStr = jsonStr.replace(/,(\s*[}\]])/g, '$1');
              try {
                parsed = JSON.parse(jsonStr);
              } catch {}
            }
          }
        }
        console.log('Parsed plan:', parsed);
        if (!parsed || typeof parsed.executiveSummary !== 'string' || !parsed.executiveSummary.trim()) {
          throw new Error('No business plan generated');
        }
        setPlan(parsed);
        setProgress(100);
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 7000);
      } catch (err: any) {
        setError('Could not generate business plan. Please try again.');
        setProgress(100);
      } finally {
        setIsLoading(false);
        if (progressInterval) clearInterval(progressInterval);
        setTimeout(() => setProgress(0), 800);
      }
    }
    generatePlan();
  }, [idea, customer, job]);

  return (
    <Container>
      <Title>Your Business Plan</Title>
      {isLoading && (
        <ProgressBarContainer>
          <ProgressBarFill percent={progress} />
        </ProgressBarContainer>
      )}
      {error && <SectionText style={{ color: 'red' }}>{error}</SectionText>}
      {plan && (
        <>
          <Section>
            <SectionTitle>{sectionIcons.executiveSummary} Executive Summary</SectionTitle>
            <SectionText>{plan.executiveSummary}</SectionText>
            {plan.visuals?.executiveSummary && typeof plan.visuals.executiveSummary === 'string' && <Visual>{plan.visuals.executiveSummary}</Visual>}
          </Section>
          <Section>
            <SectionTitle>{sectionIcons.targetMarket} Target Market</SectionTitle>
            <ul>
              {Array.isArray(plan.targetMarket)
                ? plan.targetMarket.map((item: string, i: number) => <li key={i}>{item}</li>)
                : plan.targetMarket && typeof plan.targetMarket === 'object'
                  ? Object.entries(plan.targetMarket).map(([key, value], i) =>
                      Array.isArray(value)
                        ? value.map((v, j) => <li key={`${i}-${j}`}>{key}: {v}</li>)
                        : <li key={i}><strong>{key}:</strong> {String(value)}</li>
                    )
                  : null}
            </ul>
            {plan.visuals?.targetMarket && typeof plan.visuals.targetMarket === 'string' && <Visual>{plan.visuals.targetMarket}</Visual>}
            {typeof plan.targetMarket === 'object' && (plan.targetMarket as any).chartData ? (
              <div style={{ width: '100%', height: 300 }}>
                <Bar
                  data={{
                    labels: (plan.targetMarket as any).chartData.labels,
                    datasets: [
                      {
                        label: 'Market Size',
                        data: (plan.targetMarket as any).chartData.values,
                        backgroundColor: '#007AFF',
                      },
                    ],
                  }}
                  options={{
                    responsive: true,
                    plugins: {
                      legend: { display: false },
                      title: { display: false },
                    },
                    scales: {
                      y: { beginAtZero: true },
                    },
                  }}
                />
              </div>
            ) : (
              <div style={{ color: '#888', fontSize: '0.95rem', marginTop: 12 }}>No chart data available for this target market.</div>
            )}
          </Section>

          {!isAuthenticated ? (
            <SignupPrompt>
              <SignupTitle>Want to see the full business plan?</SignupTitle>
              <SignupText>
                Sign up or log in to unlock the complete business plan including:
                <br />
                • Problem Statement
                <br />
                • Solution Overview
                <br />
                • Key Features & Benefits
                <br />
                • Go-to-Market Strategy
                <br />
                • Next Steps
              </SignupText>
              <SignupButton onClick={onSignup} style={{ marginRight: 16 }}>
                Sign Up
              </SignupButton>
              <SignupButton onClick={onLogin} style={{ background: '#fff', color: '#007AFF', border: '1.5px solid #007AFF' }}>
                Log In
              </SignupButton>
            </SignupPrompt>
          ) : (
            <>
              <Section>
                <SectionTitle>{sectionIcons.problem} Problem Statement</SectionTitle>
                <SectionText>{plan.problem}</SectionText>
                {plan.visuals?.problem && typeof plan.visuals.problem === 'string' && <Visual>{plan.visuals.problem}</Visual>}
              </Section>
              <Section>
                <SectionTitle>{sectionIcons.solution} Solution Overview</SectionTitle>
                <SectionText>{plan.solution}</SectionText>
                {plan.visuals?.solution && typeof plan.visuals.solution === 'string' && <Visual>{plan.visuals.solution}</Visual>}
              </Section>
              <Section>
                <SectionTitle>{sectionIcons.features} Key Features & Benefits</SectionTitle>
                <ul>{Array.isArray(plan.features)
                  ? plan.features.map((item: string, i: number) => <li key={i}>{item}</li>)
                  : plan.features
                    ? <li>{plan.features}</li>
                    : null}
                </ul>
                {plan.visuals?.features && typeof plan.visuals.features === 'string' && <Visual>{plan.visuals.features}</Visual>}
              </Section>
              <Section>
                <SectionTitle>{sectionIcons.goToMarket} Go-to-Market Strategy</SectionTitle>
                <ul>{Array.isArray(plan.goToMarket)
                  ? plan.goToMarket.map((item: string, i: number) => <li key={i}>{item}</li>)
                  : plan.goToMarket
                    ? <li>{plan.goToMarket}</li>
                    : null}
                </ul>
                {plan.visuals?.goToMarket && typeof plan.visuals.goToMarket === 'string' && <Visual>{plan.visuals.goToMarket}</Visual>}
              </Section>
              <Section>
                <SectionTitle>{sectionIcons.nextSteps} Next Steps</SectionTitle>
                <NextStepsHighlight>
                  <ul>{Array.isArray(plan.nextSteps)
                    ? plan.nextSteps.map((item: string, i: number) => <li key={i}>{item}</li>)
                    : plan.nextSteps
                      ? <li>{plan.nextSteps}</li>
                      : null}
                  </ul>
                </NextStepsHighlight>
                {plan.visuals?.nextSteps && typeof plan.visuals.nextSteps === 'string' && <Visual>{plan.visuals.nextSteps}</Visual>}
              </Section>
            </>
          )}
        </>
      )}
      <RestartButton onClick={onRestart}>Start Over</RestartButton>
      {showConfetti && <Confetti width={window.innerWidth} height={window.innerHeight} numberOfPieces={250} recycle={false} />}
      {showConfetti && (
        <CongratsOverlay>
          <CongratsText>
            🎉 Congratulations!<br />Your business plan is ready.
          </CongratsText>
        </CongratsOverlay>
      )}
    </Container>
  );
} 