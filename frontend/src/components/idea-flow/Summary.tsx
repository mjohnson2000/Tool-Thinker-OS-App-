import React from 'react';
import styled from 'styled-components';
import { fetchChatGPT } from '../../utils/chatgpt';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

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
            <SectionTitle>Executive Summary</SectionTitle>
            <SectionText>{plan.executiveSummary}</SectionText>
            {plan.visuals?.executiveSummary && typeof plan.visuals.executiveSummary === 'string' && <Visual>{plan.visuals.executiveSummary}</Visual>}
          </Section>
          <Section>
            <SectionTitle>Target Market</SectionTitle>
            <ul>{plan.targetMarket && plan.targetMarket.map((item: string, i: number) => <li key={i}>{item}</li>)}</ul>
            {plan.visuals?.targetMarket && typeof plan.visuals.targetMarket === 'string' && <Visual>{plan.visuals.targetMarket}</Visual>}
            {plan.visuals?.targetMarket && typeof plan.visuals.targetMarket === 'object' && (
              <>
                <Visual>{(plan.visuals.targetMarket as ChartVisual).description}</Visual>
                {(plan.visuals.targetMarket as ChartVisual).chartData && (
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={(plan.visuals.targetMarket as ChartVisual).chartData!.labels.map((label, i) => ({ label, value: (plan.visuals.targetMarket as ChartVisual).chartData!.values[i] }))}>
                      <XAxis dataKey="label" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="value" fill="#007AFF" />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </>
            )}
          </Section>
          <Section>
            <SectionTitle>Problem Statement</SectionTitle>
            <SectionText>{plan.problem}</SectionText>
            {plan.visuals?.problem && typeof plan.visuals.problem === 'string' && <Visual>{plan.visuals.problem}</Visual>}
          </Section>
          <Section>
            <SectionTitle>Solution Overview</SectionTitle>
            <SectionText>{plan.solution}</SectionText>
            {plan.visuals?.solution && typeof plan.visuals.solution === 'string' && <Visual>{plan.visuals.solution}</Visual>}
          </Section>
          <Section>
            <SectionTitle>Key Features & Benefits</SectionTitle>
            <ul>{plan.features && plan.features.map((item: string, i: number) => <li key={i}>{item}</li>)}</ul>
            {plan.visuals?.features && typeof plan.visuals.features === 'string' && <Visual>{plan.visuals.features}</Visual>}
          </Section>
          <Section>
            <SectionTitle>Go-to-Market Strategy</SectionTitle>
            <ul>{plan.goToMarket && plan.goToMarket.map((item: string, i: number) => <li key={i}>{item}</li>)}</ul>
            {plan.visuals?.goToMarket && typeof plan.visuals.goToMarket === 'string' && <Visual>{plan.visuals.goToMarket}</Visual>}
          </Section>
          <Section>
            <SectionTitle>Next Steps</SectionTitle>
            <ul>{plan.nextSteps && plan.nextSteps.map((item: string, i: number) => <li key={i}>{item}</li>)}</ul>
            {plan.visuals?.nextSteps && typeof plan.visuals.nextSteps === 'string' && <Visual>{plan.visuals.nextSteps}</Visual>}
          </Section>
        </>
      )}
      <RestartButton onClick={onRestart}>Start Over</RestartButton>
    </Container>
  );
} 