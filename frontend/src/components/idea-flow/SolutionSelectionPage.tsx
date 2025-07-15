import React from 'react';
import styled from 'styled-components';
import { fetchChatGPT } from '../../utils/chatgpt';

export interface SolutionOption {
  id: string;
  title: string;
  description: string;
  icon: string;
}

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const Title = styled.h2`
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 1.5rem;
`;

const Subtitle = styled.p`
  color: var(--text-secondary);
  margin-bottom: 2rem;
`;

const SolutionGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 1.5rem;
  width: 100%;
  max-width: 700px;
`;

const OptionCard = styled.button<{ isSelected: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  background: #fff;
  border: 2px solid ${props => props.isSelected ? '#181a1b' : '#E5E5E5'};
  border-radius: 16px;
  box-shadow: var(--shadow);
  padding: 2rem 1.5rem;
  cursor: pointer;
  outline: none;
  transition: border 0.2s, box-shadow 0.2s;
  &:hover, &:focus {
    border: 2px solid #181a1b;
    box-shadow: 0 6px 18px rgba(0,0,0,0.12);
  }
`;

const Icon = styled.div`
  font-size: 2.5rem;
  margin-bottom: 1rem;
`;

const SolutionTitle = styled.div`
  font-weight: 600;
  font-size: 1.1rem;
  margin-bottom: 0.5rem;
`;

const SolutionDescription = styled.div`
  color: var(--text-secondary);
  font-size: 0.95rem;
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
  background: #181a1b;
  width: ${({ percent }) => percent}%;
  transition: width 0.4s cubic-bezier(0.4, 0, 0.2, 1);
`;

export interface SolutionSelectionPageProps {
  job: { title: string; description: string; icon: string } | null;
  onSelect: (solution: SolutionOption) => void;
  interests?: string;
  businessArea?: { title: string; description: string; icon: string } | null;
  customer?: { title: string; description: string; icon: string } | null;
}

export function SolutionSelectionPage({ job, onSelect, interests, businessArea, customer }: SolutionSelectionPageProps) {
  const [selected, setSelected] = React.useState<string | null>(null);
  const [options, setOptions] = React.useState<SolutionOption[]>([]);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [progress, setProgress] = React.useState(0);

  React.useEffect(() => {
    async function fetchSolutionOptions() {
      if (!job) return;
      setIsLoading(true);
      setProgress(0);
      setError(null);
      setOptions([]);
      let progressInterval: ReturnType<typeof setInterval> | null = null;
      try {
        // Animate progress bar to 90% while loading
        progressInterval = setInterval(() => {
          setProgress(prev => (prev < 90 ? prev + 5 : 90));
        }, 200);
        // Build context string
        let contextString = '';
        if (interests) contextString += `User Interests: ${interests}\n`;
        if (businessArea) contextString += `Business Area: ${businessArea.title} - ${businessArea.description}\n`;
        if (customer) contextString += `Customer: ${customer.title} - ${customer.description}\n`;
        contextString += `Job/Problem: ${job.title} - ${job.description}`;
        
        const prompt = `Given the following context, turn the job into a problem statement and use the How Might We framework to generate 5 creative solutions.\n\nContext:\n${contextString}\n\n1. What is the customer trying to accomplish?\n2. What obstacles are in their way?\n3. What emotional, social, or functional aspects matter?\n\nUse the format: How might we help [target customer] achieve [desired outcome] despite [obstacle]?\n\nReturn ONLY a JSON array of 5 solutions. Each object must have:\n- id: string\n- title: string (solution title)\n- description: string (the full How Might We statement)\n- icon: string (emoji)\n\nNo explanation, no markdown, just the JSON array.`;
        const response = await fetchChatGPT(prompt);
        let parsed: SolutionOption[] = Array.isArray(response) ? response : [];
        if (!parsed.length) {
          try {
            parsed = JSON.parse(response);
          } catch {
            const match = response.match && response.match(/\[\s*{[\s\S]*?}\s*\]/);
            if (match) {
              try {
                parsed = JSON.parse(match[0]);
              } catch {}
            }
          }
        }
        // Filter out any solutions missing required fields
        const validOptions = parsed.filter(
          option =>
            option &&
            typeof option.id === 'string' &&
            typeof option.title === 'string' &&
            typeof option.description === 'string' &&
            typeof option.icon === 'string' &&
            option.description.trim() !== '' &&
            option.icon.trim() !== ''
        );
        if (!Array.isArray(validOptions) || validOptions.length === 0) throw new Error('No valid solutions found');
        setOptions(validOptions.map(option => ({ ...option, id: String(option.id) })));
        setProgress(100);
      } catch (err: any) {
        setError('Could not generate solutions. Try again or pick a different job.');
        setOptions([]);
        setProgress(100);
      } finally {
        setIsLoading(false);
        if (progressInterval) clearInterval(progressInterval);
        setTimeout(() => setProgress(0), 800);
      }
    }
    fetchSolutionOptions();
  }, [job, interests, businessArea, customer]);

  function handleSelect(solution: SolutionOption) {
    setSelected(solution.id);
    setTimeout(() => {
      onSelect(solution);
    }, 150);
  }

  return (
    <Container>
      <Title>Pick a solution for your business</Title>
      <Subtitle>Choose one of the following solutions for the selected job:</Subtitle>
      {isLoading && (
        <ProgressBarContainer>
          <ProgressBarFill percent={progress} />
        </ProgressBarContainer>
      )}
      {error && <Subtitle style={{ color: 'red' }}>{error}</Subtitle>}
      <SolutionGrid>
        {options.map(solution => (
          <OptionCard
            key={solution.id}
            isSelected={selected === solution.id}
            onClick={() => handleSelect(solution)}
            aria-pressed={selected === solution.id}
            tabIndex={0}
          >
            <Icon>{solution.icon}</Icon>
            <SolutionTitle>{solution.title}</SolutionTitle>
            <SolutionDescription>{solution.description}</SolutionDescription>
          </OptionCard>
        ))}
      </SolutionGrid>
    </Container>
  );
} 