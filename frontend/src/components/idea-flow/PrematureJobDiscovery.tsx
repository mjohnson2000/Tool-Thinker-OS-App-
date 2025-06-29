import React, { useEffect, useState } from 'react';
import styled from 'styled-components';

export interface PrematureJobOption {
  id: string;
  title: string;
  description: string;
  icon: string;
}

interface PrematureJobDiscoveryProps {
  customer: { id: string; title: string; description: string; icon: string } | null;
  onSelect: (job: PrematureJobOption) => void;
}

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
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

export const PrematureJobDiscovery: React.FC<PrematureJobDiscoveryProps> = ({ customer, onSelect }) => {
  const [selected, setSelected] = useState<string | null>(null);
  const [options, setOptions] = useState<PrematureJobOption[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    async function fetchJobs() {
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
        // Simulate API call (replace with real API call as needed)
        await new Promise(res => setTimeout(res, 1200));
        // Example jobs (replace with real data)
        const jobs: PrematureJobOption[] = [
          {
            id: '1',
            title: 'Save time on meal prep',
            description: 'Find quick and healthy meal solutions for busy schedules.',
            icon: '⏰',
          },
          {
            id: '2',
            title: 'Eat healthier',
            description: 'Discover nutritious options that fit dietary preferences.',
            icon: '🥗',
          },
          {
            id: '3',
            title: 'Reduce food costs',
            description: 'Get affordable meal plans and grocery tips.',
            icon: '💸',
          },
          {
            id: '4',
            title: 'Try new recipes',
            description: 'Explore creative and easy-to-make dishes.',
            icon: '🍳',
          },
          {
            id: '5',
            title: 'Balance nutrition',
            description: 'Achieve a balanced diet with expert guidance.',
            icon: '⚖️',
          },
        ];
        setOptions(jobs);
        setProgress(100);
      } catch (err: any) {
        setError('Could not generate jobs. Try again.');
        setOptions([]);
        setProgress(100);
      }
      setIsLoading(false);
      if (progressInterval) clearInterval(progressInterval);
      setTimeout(() => setProgress(0), 800);
    }
    fetchJobs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [customer]);

  function handleSelect(job: PrematureJobOption) {
    setSelected(job.id);
    setTimeout(() => onSelect(job), 150); // brief highlight for a11y
  }

  return (
    <Container>
      <Title>What is your customer struggling to achieve?</Title>
      <Subtitle>Choose a job your customer needs done:</Subtitle>
      {isLoading && (
        <ProgressBarContainer>
          <ProgressBarFill percent={progress} />
        </ProgressBarContainer>
      )}
      {error && <Subtitle style={{ color: 'red' }}>{error}</Subtitle>}
      <JobGrid>
        {options.map(job => (
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
        ))}
      </JobGrid>
    </Container>
  );
}; 