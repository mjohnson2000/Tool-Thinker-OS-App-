import React, { useState } from 'react';
import styled from 'styled-components';
import { fetchChatGPT } from '../../utils/chatgpt';

export interface BusinessArea {
  id: string;
  title: string;
  description: string;
  icon: string;
}

const defaultBusinessAreas: BusinessArea[] = [
  { id: 'education', title: 'Education', description: 'Learning and teaching', icon: '📚' },
  { id: 'health', title: 'Health', description: 'Wellness and healthcare', icon: '🏥' },
  { id: 'technology', title: 'Technology', description: 'Software and hardware', icon: '💻' },
  { id: 'creative', title: 'Creative', description: 'Arts and entertainment', icon: '🎨' },
  { id: 'finance', title: 'Finance', description: 'Money and investments', icon: '💰' },
];

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

const Subtitle = styled.p`
  color: var(--text-secondary);
  margin-bottom: 2rem;
  text-align: center;
`;

const TextArea = styled.textarea`
  width: 100%;
  height: 120px;
  padding: 1rem;
  border: 2px solid #E5E5E5;
  border-radius: 12px;
  font-size: 1rem;
  margin-bottom: 1.5rem;
  resize: none;
  &:focus {
    outline: none;
    border-color: #007AFF;
  }
`;

const Button = styled.button`
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
  &:disabled {
    background: #ccc;
    cursor: not-allowed;
  }
`;

const AreaGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 1.5rem;
  width: 100%;
  margin-top: 2rem;
`;

const AreaCard = styled.button<{ isSelected: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  background: var(--card-background);
  border: 2px solid ${props => props.isSelected ? '#007AFF' : '#E5E5E5'};
  border-radius: 16px;
  box-shadow: var(--shadow);
  padding: 2rem 1.5rem;
  cursor: pointer;
  outline: none;
  transition: border 0.2s, box-shadow 0.2s;
  &:hover, &:focus {
    border: 2px solid #007AFF;
    box-shadow: 0 6px 18px rgba(0,0,0,0.12);
  }
`;

const Icon = styled.div`
  font-size: 2.5rem;
  margin-bottom: 1rem;
`;

const AreaTitle = styled.div`
  font-weight: 600;
  font-size: 1.1rem;
  margin-bottom: 0.5rem;
`;

const AreaDescription = styled.div`
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
  background: linear-gradient(90deg, #007AFF 0%, #4FC3F7 100%);
  width: ${({ percent }) => percent}%;
  transition: width 0.4s cubic-bezier(0.4, 0, 0.2, 1);
`;

export interface IdeaSelectionProps {
  onSelect: (idea: { interests: string; area: BusinessArea }) => void;
}

export function IdeaSelection({ onSelect }: IdeaSelectionProps) {
  const [interests, setInterests] = useState('');
  const [selectedArea, setSelectedArea] = useState<BusinessArea | null>(null);
  const [showAreas, setShowAreas] = useState(false);
  const [areas, setAreas] = useState<BusinessArea[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);

  async function handleFindAreas() {
    if (!interests.trim()) return;
    setIsLoading(true);
    setProgress(0);
    setError(null);
    setShowAreas(false);
    setAreas([]);
    let progressInterval: ReturnType<typeof setInterval> | null = null;
    try {
      // Animate progress bar to 90% while loading
      progressInterval = setInterval(() => {
        setProgress(prev => (prev < 90 ? prev + 5 : 90));
      }, 200);
      const prompt = `Return ONLY a JSON array of 5 business areas for someone interested in: ${interests}. Each object must have id, title, description, and icon (as an emoji, not a name or text). No explanation, no markdown, just the JSON array.`;
      const response = await fetchChatGPT(prompt);
      let parsed: BusinessArea[] = [];
      try {
        parsed = JSON.parse(response);
      } catch {
        // fallback: try to extract the first valid JSON array from the response
        const match = response.match(/\[\s*{[\s\S]*?}\s*\]/);
        if (match) {
          try {
            parsed = JSON.parse(match[0]);
          } catch {}
        }
      }
      if (!Array.isArray(parsed) || parsed.length === 0) throw new Error('No business areas found');
      setAreas(parsed);
      setShowAreas(true);
      setProgress(100);
    } catch (err: any) {
      setError('Could not generate business areas. Showing defaults.');
      setAreas(defaultBusinessAreas);
      setShowAreas(true);
      setProgress(100);
    } finally {
      setIsLoading(false);
      if (progressInterval) clearInterval(progressInterval);
      setTimeout(() => setProgress(0), 800);
    }
  }

  function handleAreaSelect(area: BusinessArea) {
    setSelectedArea(area);
    onSelect({ interests, area });
  }

  return (
    <Container>
      <Title>What interests you?</Title>
      <Subtitle>Tell us what you like doing or what problems you've noticed</Subtitle>
      <TextArea
        value={interests}
        onChange={(e) => setInterests(e.target.value)}
        placeholder="e.g., I love teaching, I notice people struggle with time management, I'm passionate about fitness..."
      />
      <Button 
        onClick={handleFindAreas}
        disabled={!interests.trim() || isLoading}
      >
        {isLoading ? 'Finding...' : 'Find Business Areas'}
      </Button>
      {error && <Subtitle style={{ color: 'red' }}>{error}</Subtitle>}
      {isLoading && (
        <ProgressBarContainer>
          <ProgressBarFill percent={progress} />
        </ProgressBarContainer>
      )}
      {showAreas && (
        <AreaGrid>
          {(areas.length > 0 ? areas : defaultBusinessAreas).map(area => (
            <AreaCard
              key={area.id}
              isSelected={selectedArea?.id === area.id}
              onClick={() => handleAreaSelect(area)}
              aria-pressed={selectedArea?.id === area.id}
              tabIndex={0}
            >
              <Icon>{area.icon}</Icon>
              <AreaTitle>{area.title}</AreaTitle>
              <AreaDescription>{area.description}</AreaDescription>
            </AreaCard>
          ))}
        </AreaGrid>
      )}
    </Container>
  );
} 