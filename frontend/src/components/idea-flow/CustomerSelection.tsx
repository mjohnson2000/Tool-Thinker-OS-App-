import React from 'react';
import styled from 'styled-components';
import { fetchChatGPT } from '../../utils/chatgpt';

export interface CustomerOption {
  id: string;
  title: string;
  description: string;
  icon: string;
}

const customers: CustomerOption[] = [
  { id: 'busy-professionals', title: 'Busy Professionals', description: 'Time-strapped, tech-savvy', icon: '⏰' },
  { id: 'parents', title: 'Parents', description: 'Juggling family and work', icon: '👨‍👩‍👧‍👦' },
  { id: 'students', title: 'Students', description: 'Learning and growing', icon: '🎓' },
  { id: 'small-business', title: 'Small Business Owners', description: 'Running a company', icon: '🏢' },
  { id: 'health-conscious', title: 'Health-Conscious', description: 'Prioritizing wellness', icon: '💪' },
];

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

const CustomerGrid = styled.div`
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

const CustomerTitle = styled.div`
  font-weight: 600;
  font-size: 1.1rem;
  margin-bottom: 0.5rem;
`;

const CustomerDescription = styled.div`
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

export interface CustomerSelectionProps {
  onSelect: (customer: CustomerOption) => void;
  businessArea: { title: string; description: string; icon: string } | null;
  interests?: string; // Make interests optional
}

export function CustomerSelection({ onSelect, businessArea, interests }: CustomerSelectionProps) {
  const [selected, setSelected] = React.useState<string | null>(null);
  const [options, setOptions] = React.useState<CustomerOption[]>(customers);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [progress, setProgress] = React.useState(0);

  React.useEffect(() => {
    async function fetchCustomerOptions() {
      if (!businessArea) return;
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
        const prompt = interests 
          ? `Return ONLY a JSON array of 5 customer types for someone interested in: "${interests}" who wants to start a business in the area of: ${businessArea.title} - ${businessArea.description}. Focus on customers that align with the user's specific interests and observations. Each object must have id, title, description, and icon (as an emoji, not a name or text). No explanation, no markdown, just the JSON array.`
          : `Return ONLY a JSON array of 5 customer types for a business in the area of: ${businessArea.title} - ${businessArea.description}. Each object must have id, title, description, and icon (as an emoji, not a name or text). No explanation, no markdown, just the JSON array.`;
        const response = await fetchChatGPT(prompt);
        if (response && response.error) {
          console.error('ChatGPT API error:', response.error);
          throw new Error(response.error);
        }
        let parsed: CustomerOption[] = Array.isArray(response) ? response : [];
        if (!parsed.length) {
          try {
            parsed = JSON.parse(response);
          } catch {
            const match = response && response.match && response.match(/\[\s*{[\s\S]*?}\s*\]/);
            if (match) {
              try {
                parsed = JSON.parse(match[0]);
              } catch {}
            }
          }
        }
        if (!Array.isArray(parsed) || parsed.length === 0) {
          console.error('Failed to parse customer types from response:', response);
          throw new Error('No customer types found');
        }
        setOptions(parsed.map(option => ({ ...option, id: String(option.id) })));
        setProgress(100);
      } catch (err: any) {
        setError('Could not generate customer types. Showing defaults.');
        setOptions(customers);
        setProgress(100);
      } finally {
        setIsLoading(false);
        if (progressInterval) clearInterval(progressInterval);
        setTimeout(() => setProgress(0), 800);
      }
    }
    fetchCustomerOptions();
  }, [businessArea, interests]);

  function handleSelect(customer: CustomerOption) {
    console.log('CustomerSelection handleSelect:', customer);
    setSelected(customer.id);
    setTimeout(() => onSelect(customer), 150); // brief highlight for a11y
  }

  return (
    <Container>
      <Title>Who is your customer?</Title>
      <Subtitle>Select the type of customer you want to help</Subtitle>
      {isLoading && <Subtitle>Loading customer types...</Subtitle>}
      {error && <Subtitle style={{ color: 'red' }}>{error}</Subtitle>}
      {isLoading && (
        <ProgressBarContainer>
          <ProgressBarFill percent={progress} />
        </ProgressBarContainer>
      )}
      <CustomerGrid>
        {options.map(customer => (
          <OptionCard
            key={customer.id}
            isSelected={selected === customer.id}
            onClick={() => handleSelect(customer)}
            aria-pressed={selected === customer.id}
            tabIndex={0}
          >
            <Icon>{customer.icon}</Icon>
            <CustomerTitle>{customer.title}</CustomerTitle>
            <CustomerDescription>{customer.description}</CustomerDescription>
          </OptionCard>
        ))}
      </CustomerGrid>
    </Container>
  );
} 