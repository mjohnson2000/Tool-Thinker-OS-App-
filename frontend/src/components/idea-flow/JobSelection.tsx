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
  interests?: string; // Add interests prop
  businessArea?: { title: string; description: string; icon: string } | null; // Add business area prop
}

export function JobSelection({ onSelect, customer, interests, businessArea }: JobSelectionProps) {
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
        
        // Build context string based on available data
        let contextString = `Customer: ${customer.title} - ${customer.description}`;
        if (businessArea) {
          contextString += `\nBusiness Area: ${businessArea.title} - ${businessArea.description}`;
        }
        if (interests) {
          contextString += `\nUser Interests: ${interests}`;
        }
        
        const prompt = `Using the Job-to-be-Done framework, generate 5 specific jobs or problems that this customer wants to accomplish. 

Context:
${contextString}

Job-to-be-Done Framework: Focus on what the customer is trying to accomplish, not what they want to buy. Use the format: "When [situation], I want to [motivation], so I can [expected outcome]."

Return ONLY a JSON array of 5 jobs/problems. Each object must have:
- id: string
- title: string (the job/problem title)
- description: string (the full JTBD statement)
- icon: string (emoji)

No explanation, no markdown, just the JSON array.`;
        
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
        // Filter and clean up jobs, providing fallbacks for missing fields
        const validOptions = parsed
          .filter(option => option && typeof option === 'object')
          .map((option, index) => ({
            id: String(option.id || `job-${index + 1}`),
            title: String(option.title || `Job ${index + 1}`),
            description: String(option.description || 'No description provided'),
            icon: String(option.icon || '💼')
          }))
          .filter(option => 
            option.title.trim() !== '' && 
            option.description.trim() !== '' && 
            option.description !== 'No description provided'
          );
        
        // If we have fewer than 5 valid options, add fallback options
        while (validOptions.length < 5) {
          const fallbackIndex = validOptions.length + 1;
          validOptions.push({
            id: `fallback-${fallbackIndex}`,
            title: `Additional Job ${fallbackIndex}`,
            description: `A job that helps ${customer.title} achieve their goals`,
            icon: '💼'
          });
        }
        
        if (validOptions.length === 0) throw new Error('No valid jobs found');
        setOptions(validOptions.slice(0, 5)); // Ensure exactly 5 options
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
  }, [customer, interests, businessArea]);

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