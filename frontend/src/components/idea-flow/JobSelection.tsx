import React from 'react';
import styled from 'styled-components';
import { fetchChatGPT } from '../../utils/chatgpt';

export interface JobOption {
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

const JobGrid = styled.div`
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

const JobTitle = styled.div`
  font-weight: 600;
  font-size: 1.1rem;
  margin-bottom: 0.5rem;
`;

const JobDescription = styled.div`
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

export interface JobSelectionProps {
  onSelect: (job: JobOption) => void;
  customer: { title: string; description: string; icon: string } | null;
}

export function JobSelection({ onSelect, customer }: JobSelectionProps) {
  const [selected, setSelected] = React.useState<string | null>(null);
  const [options, setOptions] = React.useState<JobOption[]>([]);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [progress, setProgress] = React.useState(0);

  React.useEffect(() => {
    async function fetchJobOptions() {
      if (!customer) return;
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
        const prompt = `Return ONLY a JSON array of 5 jobs or needs that a customer like: ${customer.title} - ${customer.description} might want help with. Each object must have id, title, description, and icon (as an emoji, not a name or text). No explanation, no markdown, just the JSON array.`;
        const response = await fetchChatGPT(prompt);
        let parsed: JobOption[] = Array.isArray(response) ? response : [];
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
        if (!Array.isArray(parsed) || parsed.length === 0) throw new Error('No jobs found');
        setOptions(parsed.map(option => ({ ...option, id: String(option.id) })));
        setProgress(100);
      } catch (err: any) {
        setError('Could not generate jobs. Try again or pick a different customer.');
        setOptions([]);
        setProgress(100);
      } finally {
        setIsLoading(false);
        if (progressInterval) clearInterval(progressInterval);
        setTimeout(() => setProgress(0), 800);
      }
    }
    fetchJobOptions();
  }, [customer]);

  function handleSelect(job: JobOption) {
    console.log('Job clicked in JobSelection:', job);
    setSelected(job.id);
    setTimeout(() => {
      console.log('Calling onSelect with job:', job);
      onSelect(job);
    }, 150); // brief highlight for a11y
  }

  return (
    <Container>
      <Title>Your business should help your customer</Title>
      <Subtitle>Help your customer with one of the following:</Subtitle>
      {isLoading && (
        <ProgressBarContainer>
          <ProgressBarFill percent={progress} />
        </ProgressBarContainer>
      )}
      {error && <Subtitle style={{ color: 'red' }}>{error}</Subtitle>}
      <JobGrid>
        {options.map(job => {
          console.log('Rendering job option:', job);
          return (
            <OptionCard
              key={job.id}
              isSelected={selected === job.id}
              onClick={() => handleSelect(job)}
              aria-pressed={selected === job.id}
              tabIndex={0}
            >
              <Icon>{job.icon}</Icon>
              <JobTitle>{job.title}</JobTitle>
              <JobDescription>{job.description}</JobDescription>
            </OptionCard>
          );
        })}
      </JobGrid>
    </Container>
  );
} 