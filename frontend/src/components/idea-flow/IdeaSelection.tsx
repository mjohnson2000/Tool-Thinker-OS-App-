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
  color: #181a1b;
`;

const Subtitle = styled.p`
  color: #666;
  margin-bottom: 2rem;
  text-align: center;
  font-size: 1.1rem;
`;

const TextArea = styled.textarea`
  width: 100%;
  height: 120px;
  padding: 1rem;
  border: 2px solid #E5E5E5;
  border-radius: 12px;
  font-size: 1rem;
  background: #fafbfc;
  resize: none;
  margin-bottom: 2rem;
  
  &:focus {
    outline: none;
    border-color: #181a1b;
  }
`;

const Button = styled.button`
  background: #181a1b;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 0.75rem 1.5rem;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s;
  margin-bottom: 2rem;
  
  &:hover {
    background: #000;
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
`;

const AreaCard = styled.button<{ isSelected: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 1.5rem;
  border: 2px solid ${props => props.isSelected ? '#181a1b' : '#E5E5E5'};
  border-radius: 12px;
  background: ${props => props.isSelected ? '#f0f0f0' : 'white'};
  cursor: pointer;
  transition: all 0.2s;
  text-align: center;
  
  &:hover {
    border-color: #181a1b;
    background: #f0f0f0;
  }
`;

const Icon = styled.div`
  font-size: 2rem;
  margin-bottom: 1rem;
`;

const AreaTitle = styled.div`
  font-size: 1.1rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
  color: #181a1b;
`;

const AreaDescription = styled.div`
  font-size: 1rem;
  color: var(--text-secondary);
  line-height: 1.4;
  text-align: center;
  margin-top: 0.5rem;
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

export interface IdeaSelectionProps {
  onSelect: (idea: { interests: string; area: BusinessArea }) => void;
  ideaType?: { id: string; title: string; description: string; icon: string; examples: string[] } | null;
}

export function IdeaSelection({ onSelect, ideaType }: IdeaSelectionProps) {
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
    setAreas([]);
    let progressInterval: ReturnType<typeof setInterval> | null = null;
    
    // Set a timeout to show defaults if AI request takes too long
    const timeoutFallback = setTimeout(() => {
      console.log('IdeaSelection: Timeout fallback triggered');
      setError('AI request timed out. Showing defaults.');
      setAreas(defaultBusinessAreas);
      setProgress(100);
      setIsLoading(false);
    }, 15000); // 15 second timeout
    
    try {
      // Animate progress bar to 90% while loading
      progressInterval = setInterval(() => {
        setProgress(prev => (prev < 90 ? prev + 5 : 90));
      }, 200);

      const prompt = `Generate 5 business areas for a ${ideaType?.title.toLowerCase() || 'side hustle'} based on these interests: "${interests}"

Focus on business areas that align with the user's interests and can be done as a side hustle.

Return ONLY a JSON array with exactly 5 objects. Each object must have id, title, description, and icon (emoji).

Example: [{"id": "education", "title": "Education", "description": "Learning and teaching", "icon": "📚"}]

No explanation, just the JSON array.`;

      const response = await fetchChatGPT(prompt);
      if (response && response.error) {
        console.error('ChatGPT API error:', response.error);
        throw new Error(response.error);
      }

      let parsed: BusinessArea[] = Array.isArray(response) ? response : [];
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
        console.error('Failed to parse business areas from response:', response);
        throw new Error('No business areas found');
      }

      setAreas(parsed.map(area => ({ ...area, id: String(area.id) })));
      setProgress(100);
      clearTimeout(timeoutFallback); // Clear timeout if successful
    } catch (err: any) {
      console.error('IdeaSelection error:', err);
      setError('Could not generate business areas. Showing defaults.');
      setAreas(defaultBusinessAreas);
      setProgress(100);
      clearTimeout(timeoutFallback); // Clear timeout on error
    } finally {
      setIsLoading(false);
      if (progressInterval) clearInterval(progressInterval);
      setTimeout(() => setProgress(0), 800);
    }
    
    setShowAreas(true);
  }

  function handleAreaSelect(area: BusinessArea) {
    setSelectedArea(area);
    onSelect({ interests, area });
  }

  return (
    <Container>
      <Title>What interests you in {ideaType?.title.toLowerCase() || 'side hustles'}?</Title>
      <Subtitle>
        Tell us about your interests, skills, or hobbies related to {ideaType?.title.toLowerCase() || 'side hustles'}. 
        This helps us find the perfect {ideaType?.title.toLowerCase() || 'side hustle'} opportunity for you.
      </Subtitle>
      
      <TextArea
        value={interests}
        onChange={(e) => setInterests(e.target.value)}
        placeholder="e.g., I love teaching, I notice people struggle with time management, I'm passionate about fitness..."
      />
      
      <Button 
        onClick={handleFindAreas}
        disabled={!interests.trim() || isLoading}
      >
        {isLoading ? 'Finding Business Areas...' : 'Find Business Areas'}
      </Button>
      
      {isLoading && (
        <ProgressBarContainer>
          <ProgressBarFill percent={progress} />
        </ProgressBarContainer>
      )}
      
      {error && (
        <p style={{ color: '#666', textAlign: 'center', marginBottom: '1rem' }}>
          {error}
        </p>
      )}
      
      {showAreas && (
        <AreaGrid>
          {areas.map(area => (
            <AreaCard
              key={area.id}
              isSelected={selectedArea?.id === area.id}
              onClick={() => handleAreaSelect(area)}
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