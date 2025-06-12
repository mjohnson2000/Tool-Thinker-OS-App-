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
  Tooltip as ChartTooltip,
  Legend
} from 'chart.js';
import Confetti from 'react-confetti';

ChartJS.register(CategoryScale, LinearScale, BarElement, ChartTitle, ChartTooltip, Legend);

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

export interface SummaryProps {
  idea: {
    interests: string;
    area: { title: string; description: string; icon: string } | null;
  };
  customer: { title: string; description: string; icon: string } | null;
  job: { title: string; description: string; icon: string } | null;
  onRestart: () => void;
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

export function Summary({ idea, customer, job, onRestart }: SummaryProps) {
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
        const prompt = `Given the following:\nBusiness Area: ${idea.area.title} - ${idea.area.description}\nCustomer: ${customer.title} - ${customer.description}\nJob: ${job.title} - ${job.description}\nGenerate a professional business plan with these sections:\n1. Executive Summary (2-3 sentences, clear and compelling)\n2. Target Market (bullet points, include customer persona)\n3. Problem Statement (1-2 sentences)\n4. Solution Overview (1-2 sentences)\n5. Key Features/Benefits (bullet points)\n6. Go-to-Market Strategy (bullet points)\n7. Next Steps (bullet points, actionable)\nFor each section, suggest a visual (icon, chart, or diagram) if appropriate. If a chart is appropriate, also return a chartData field as a JSON object (e.g., {labels: [...], values: [...]}) for rendering a bar chart. Return ONLY a JSON object with keys: executiveSummary, targetMarket, problem, solution, features, goToMarket, nextSteps, visuals (an object mapping section names to suggested visuals, each visual may include a chartData field). No explanation, no markdown.`;
        const response = await fetchChatGPT(prompt);
        let parsed = null;
        try {
          parsed = JSON.parse(response);
        } catch {
          const match = response.match(/\{[\s\S]*\}/);
          if (match) {
            try {
              parsed = JSON.parse(match[0]);
            } catch {}
          }
        }
        if (!parsed || !parsed.executiveSummary) throw new Error('No business plan generated');
        setPlan(parsed);
        setProgress(100);
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 7000);
      } catch (err: any) {
        setError('Could not generate business plan. Please try again.');
        setPlan(null);
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
            <ul>{plan.targetMarket && plan.targetMarket.map((item: string, i: number) => <li key={i}>{item}</li>)}</ul>
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
            <ul>{plan.features && plan.features.map((item: string, i: number) => <li key={i}>{item}</li>)}</ul>
            {plan.visuals?.features && typeof plan.visuals.features === 'string' && <Visual>{plan.visuals.features}</Visual>}
          </Section>
          <Section>
            <SectionTitle>{sectionIcons.goToMarket} Go-to-Market Strategy</SectionTitle>
            <ul>{plan.goToMarket && plan.goToMarket.map((item: string, i: number) => <li key={i}>{item}</li>)}</ul>
            {plan.visuals?.goToMarket && typeof plan.visuals.goToMarket === 'string' && <Visual>{plan.visuals.goToMarket}</Visual>}
          </Section>
          <Section>
            <SectionTitle>{sectionIcons.nextSteps} Next Steps</SectionTitle>
            <NextStepsHighlight>
              <ul>{plan.nextSteps && plan.nextSteps.map((item: string, i: number) => <li key={i}>{item}</li>)}</ul>
            </NextStepsHighlight>
            {plan.visuals?.nextSteps && typeof plan.visuals.nextSteps === 'string' && <Visual>{plan.visuals.nextSteps}</Visual>}
          </Section>
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