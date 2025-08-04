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

const FormCard = styled.div`
  background: linear-gradient(135deg, #ffffff 0%, #fafbfc 100%);
  border-radius: 20px;
  padding: 2.5rem;
  box-shadow: 
    0 4px 20px rgba(0,0,0,0.08),
    0 1px 3px rgba(0,0,0,0.1);
  border: 1px solid rgba(255,255,255,0.8);
  width: 100%;
  margin-top: 1.5rem;
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 3px;
    background: linear-gradient(90deg, #181a1b, #4a4a4a, #181a1b);
    border-radius: 20px 20px 0 0;
  }
  
  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(135deg, rgba(255,255,255,0.1) 0%, transparent 100%);
    pointer-events: none;
  }
`;

const Title = styled.h2`
  font-size: 2.4rem;
  font-weight: 800;
  margin-bottom: 1.2rem;
  text-align: center;
  color: var(--text-primary);
  letter-spacing: -0.03em;
  background: linear-gradient(135deg, #181a1b 0%, #4a4a4a 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  position: relative;
  
  &::after {
    content: '';
    position: absolute;
    bottom: -8px;
    left: 50%;
    transform: translateX(-50%);
    width: 60px;
    height: 3px;
    background: linear-gradient(90deg, #181a1b, #4a4a4a);
    border-radius: 2px;
  }
`;

const Subtitle = styled.p`
  color: var(--text-secondary);
  margin-bottom: 2rem;
  text-align: center;
  font-size: 1.15rem;
  line-height: 1.6;
  max-width: 550px;
  font-weight: 400;
  opacity: 0.9;
`;

const TextArea = styled.textarea`
  width: 100%;
  height: 140px;
  padding: 1.2rem 1.2rem 1.2rem 3.2rem;
  border: 2px solid #E5E5E5;
  border-radius: 14px;
  font-size: 1rem;
  background: linear-gradient(135deg, #fafbfc 0%, #f8f9fa 100%);
  resize: none;
  margin-bottom: 2rem;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 2px 4px rgba(0,0,0,0.04);
  position: relative;
  
  &:focus {
    outline: none;
    border-color: #181a1b;
    box-shadow: 0 0 0 3px rgba(24, 26, 27, 0.1), 0 4px 12px rgba(0,0,0,0.08);
    background: linear-gradient(135deg, #fff 0%, #fafbfc 100%);
    transform: translateY(-1px);
  }
  
  &:hover {
    border-color: #ccc;
    background: linear-gradient(135deg, #f8f9fa 0%, #f1f3f4 100%);
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(0,0,0,0.08);
  }
`;

const TextAreaWrapper = styled.div`
  position: relative;
  width: 100%;
  
  &::before {
    content: '💭';
    position: absolute;
    left: 1.2rem;
    top: 1.2rem;
    font-size: 1.2rem;
    pointer-events: none;
    z-index: 1;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }
  
  &:hover::before {
    transform: scale(1.1);
  }
`;

const Button = styled.button`
  background: linear-gradient(135deg, #181a1b 0%, #2d2d2d 100%);
  color: white;
  border: none;
  border-radius: 16px;
  padding: 1.4rem 2rem;
  font-size: 1.3rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  margin-bottom: 2rem;
  width: 100%;
  position: relative;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.15), transparent);
    transition: left 0.6s ease;
  }
  
  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(135deg, rgba(255,255,255,0.1) 0%, transparent 50%, rgba(0,0,0,0.1) 100%);
    pointer-events: none;
  }
  
  &:hover {
    background: linear-gradient(135deg, #000 0%, #181a1b 100%);
    transform: translateY(-3px);
    box-shadow: 0 12px 32px rgba(0,0,0,0.25);
    
    &::before {
      left: 100%;
    }
  }
  
  &:active {
    transform: translateY(-1px);
    box-shadow: 0 6px 16px rgba(0,0,0,0.2);
  }
  
  &:disabled {
    background: linear-gradient(135deg, #ccc 0%, #ddd 100%);
    cursor: not-allowed;
    transform: none;
    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    
    &::before {
      display: none;
    }
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
  padding: 1.8rem 1.5rem;
  border: 2px solid ${props => props.isSelected ? '#181a1b' : '#E5E5E5'};
  border-radius: 16px;
  background: ${props => props.isSelected ? 'linear-gradient(135deg, #f0f0f0 0%, #e8e8e8 100%)' : 'linear-gradient(135deg, #ffffff 0%, #fafbfc 100%)'};
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  text-align: center;
  box-shadow: 0 2px 8px rgba(0,0,0,0.06);
  
  &:hover {
    border-color: #181a1b;
    background: linear-gradient(135deg, #f8f9fa 0%, #f1f3f4 100%);
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(0,0,0,0.12);
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
      
      <FormCard>
        <TextAreaWrapper>
          <TextArea
            value={interests}
            onChange={(e) => setInterests(e.target.value)}
            placeholder="e.g., I love teaching, I notice people struggle with time management, I'm passionate about fitness..."
          />
        </TextAreaWrapper>
        
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
      </FormCard>
      
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