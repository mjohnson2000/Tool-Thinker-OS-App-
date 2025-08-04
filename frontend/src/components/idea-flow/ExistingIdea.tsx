import React, { useState } from 'react';
import styled from 'styled-components';
import { fetchChatGPT } from '../../utils/chatgpt';

const FormCard = styled.div`
  background: linear-gradient(135deg, #ffffff 0%, #fafbfc 100%);
  border-radius: 24px;
  padding: 2.5rem;
  width: 100%;
  max-width: 700px;
  box-shadow: 
    0 20px 60px rgba(24,26,27,0.12),
    0 8px 24px rgba(24,26,27,0.08);
  border: 1px solid rgba(255,255,255,0.8);
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: linear-gradient(90deg, #181a1b, #4a4a4a, #181a1b);
    border-radius: 24px 24px 0 0;
  }
  
  @media (max-width: 768px) {
    padding: 2rem 1.5rem;
    border-radius: 20px;
  }
`;

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  max-width: 700px;
  margin: 0 auto;
  padding: 2rem;
  text-align: center;
`;

const Title = styled.h2`
  font-size: 2.4rem;
  font-weight: 800;
  color: #181a1b;
  margin-bottom: 2.5rem;
  text-align: center;
  letter-spacing: -0.03em;
  background: linear-gradient(135deg, #181a1b 0%, #4a4a4a 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  position: relative;
  
  &::after {
    content: '';
    position: absolute;
    bottom: -12px;
    left: 50%;
    transform: translateX(-50%);
    width: 60px;
    height: 3px;
    background: linear-gradient(90deg, #181a1b, #4a4a4a);
    border-radius: 2px;
  }
  
  @media (max-width: 768px) {
    font-size: 2rem;
    margin-bottom: 2rem;
  }
`;

const TextArea = styled.textarea`
  width: 100%;
  height: 150px;
  padding: 1.2rem;
  border: 2px solid rgba(24, 26, 27, 0.1);
  border-radius: 16px;
  font-size: 1.1rem;
  margin-bottom: 1.5rem;
  resize: none;
  background: linear-gradient(135deg, #ffffff 0%, #fafbfc 100%);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 2px 8px rgba(0,0,0,0.04);
  
  &::placeholder {
    color: #9ca3af;
    font-weight: 400;
  }
  
  &:focus {
    outline: none;
    border-color: #181a1b;
    box-shadow: 0 4px 16px rgba(24,26,27,0.12);
    background: #ffffff;
    transform: translateY(-1px);
  }
  
  @media (max-width: 768px) {
    padding: 1rem;
    font-size: 1rem;
  }
`;

const SubmitButton = styled.button`
  background: linear-gradient(135deg, #181a1b 0%, #2d2d2d 100%);
  color: #fff;
  border: none;
  border-radius: 16px;
  padding: 1.2rem 2rem;
  font-size: 1.1rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 4px 12px rgba(24,26,27,0.15);
  position: relative;
  overflow: hidden;
  letter-spacing: 0.02em;
  
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
  
  &:hover:not(:disabled) {
    background: linear-gradient(135deg, #000 0%, #181a1b 100%);
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(24,26,27,0.25);
    
    &::before {
      left: 100%;
    }
  }
  
  &:focus {
    outline: none;
    box-shadow: 0 0 0 3px rgba(24, 26, 27, 0.1);
  }
  
  &:disabled {
    background: linear-gradient(135deg, #e5e5e5 0%, #d1d5db 100%);
    color: #9ca3af;
    cursor: not-allowed;
    transform: none;
    box-shadow: 0 2px 8px rgba(0,0,0,0.04);
  }
  
  @media (max-width: 768px) {
    padding: 1rem 1.5rem;
    font-size: 1rem;
  }
`;

const ImprovementContainer = styled.div`
  background: linear-gradient(135deg, #ffffff 0%, #fafbfc 100%);
  border: 1px solid rgba(24, 26, 27, 0.1);
  border-radius: 20px;
  padding: 2rem;
  margin-top: 2rem;
  width: 100%;
  text-align: left;
  box-shadow: 
    0 8px 24px rgba(24,26,27,0.08),
    0 2px 8px rgba(24,26,27,0.04);
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 3px;
    background: linear-gradient(90deg, #17a2b8, #138496);
    border-radius: 20px 20px 0 0;
  }
`;

const ImprovementHeader = styled.h4`
  font-size: 1.3rem;
  font-weight: 700;
  color: #181a1b;
  margin-bottom: 1rem;
  letter-spacing: -0.02em;
`;

const RejectionMessage = styled.p`
  color: #dc3545;
  margin-top: 1rem;
  font-weight: 500;
`;

const BusinessTypeContainer = styled.div`
  margin-bottom: 2rem;
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  justify-content: center;
`;

const BusinessTypeTag = styled.button`
  background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);
  color: #181a1b;
  border: 2px solid rgba(24, 26, 27, 0.1);
  border-radius: 20px;
  padding: 0.8rem 1.2rem;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 2px 8px rgba(0,0,0,0.04);
  letter-spacing: 0.02em;

  &:hover:not(:disabled) {
    background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
    border-color: rgba(24, 26, 27, 0.2);
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0,0,0,0.08);
  }
  
  &:focus {
    outline: none;
    box-shadow: 0 0 0 3px rgba(24, 26, 27, 0.1);
  }
`;

const ClearButton = styled.button`
  background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);
  color: #181a1b;
  border: 2px solid rgba(24, 26, 27, 0.1);
  border-radius: 16px;
  padding: 1rem 1.5rem;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  margin-top: 1.5rem;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 2px 8px rgba(0,0,0,0.04);
  letter-spacing: 0.02em;

  &:hover {
    background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
    border-color: rgba(24, 26, 27, 0.2);
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(0,0,0,0.08);
  }
  
  &:focus {
    outline: none;
    box-shadow: 0 0 0 3px rgba(24, 26, 27, 0.1);
  }
`;

const InputContainer = styled.div`
  width: 100%;
  padding: 1.5rem;
  border: 2px solid rgba(24, 26, 27, 0.1);
  border-radius: 20px;
  background: linear-gradient(135deg, #ffffff 0%, #fafbfc 100%);
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  margin-bottom: 2rem;
  min-height: 150px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 2px 8px rgba(0,0,0,0.04);

  &:focus-within {
    outline: none;
    border-color: #181a1b;
    box-shadow: 0 4px 16px rgba(24,26,27,0.12);
    transform: translateY(-1px);
  }
`;

const SelectedTypeTag = styled.div`
  background: linear-gradient(135deg, #181a1b 0%, #2d2d2d 100%);
  color: white;
  border-radius: 12px;
  padding: 0.6rem 1rem;
  font-size: 0.9rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  white-space: nowrap;
  margin-right: 0;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  letter-spacing: 0.02em;
`;

const RemoveTypeButton = styled.button`
  background: rgba(255, 255, 255, 0.2);
  border: none;
  border-radius: 50%;
  width: 22px;
  height: 22px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: white;
  font-weight: bold;
  transition: all 0.2s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.4);
    transform: scale(1.1);
  }
`;

const StyledTextArea = styled.textarea`
  width: 100%;
  height: 120px;
  padding: 1.2rem;
  border: none;
  border-radius: 16px;
  font-size: 1.1rem;
  margin-bottom: 1.5rem;
  resize: none;
  background: transparent;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  
  &::placeholder {
    color: #9ca3af;
    font-weight: 400;
  }
  
  &:focus {
    outline: none;
    background: transparent;
  }
`;

const OptionCard = styled.button<{ isSelected: boolean }>`
  background: linear-gradient(135deg, #ffffff 0%, #fafbfc 100%);
  border: 2px solid ${props => props.isSelected ? '#181a1b' : 'rgba(24, 26, 27, 0.1)'};
  border-radius: 20px;
  padding: 1.5rem 1rem;
  margin-bottom: 1rem;
  cursor: pointer;
  outline: none;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 2px 8px rgba(0,0,0,0.04);
  
  &:hover, &:focus {
    border: 2px solid #181a1b;
    box-shadow: 0 4px 16px rgba(24,26,27,0.12);
    transform: translateY(-1px);
  }
`;

const PrimaryButton = styled.button`
  background: linear-gradient(135deg, #181a1b 0%, #2d2d2d 100%);
  color: #fff;
  border: none;
  border-radius: 16px;
  padding: 1rem 1.5rem;
  font-size: 1rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 4px 12px rgba(24,26,27,0.15);
  letter-spacing: 0.02em;
  
  &:hover:not(:disabled) {
    background: linear-gradient(135deg, #000 0%, #181a1b 100%);
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(24,26,27,0.25);
  }
  
  &:focus {
    outline: none;
    box-shadow: 0 0 0 3px rgba(24, 26, 27, 0.1);
  }
  
  &:disabled {
    background: linear-gradient(135deg, #e5e5e5 0%, #d1d5db 100%);
    color: #9ca3af;
    cursor: not-allowed;
    transform: none;
    box-shadow: 0 2px 8px rgba(0,0,0,0.04);
  }
`;

const SecondaryButton = styled.button`
  background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);
  color: #181a1b;
  border: 2px solid rgba(24, 26, 27, 0.1);
  border-radius: 16px;
  padding: 1rem 1.5rem;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 2px 8px rgba(0,0,0,0.04);
  letter-spacing: 0.02em;
  
  &:hover:not(:disabled) {
    background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
    border-color: rgba(24, 26, 27, 0.2);
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0,0,0,0.08);
  }
  
  &:focus {
    outline: none;
    box-shadow: 0 0 0 3px rgba(24, 26, 27, 0.1);
  }
  
  &:disabled {
    background: linear-gradient(135deg, #e5e5e5 0%, #d1d5db 100%);
    color: #9ca3af;
    border-color: rgba(24, 26, 27, 0.1);
    cursor: not-allowed;
    transform: none;
    box-shadow: 0 2px 8px rgba(0,0,0,0.04);
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  justify-content: center;
  gap: 1rem;
  margin-top: 1.5rem;
`;

interface ExistingIdeaProps {
  onSubmit: (ideaText: string) => void;
  initialValue?: string;
  onClear: () => void;
  ideaType?: { id: string; title: string; description: string; icon: string; examples: string[] } | null;
  location?: { city: string; region: string; country: string; operatingModel?: string } | null;
  scheduleGoals?: { hoursPerWeek: number; incomeTarget: number } | null;
}

// Removed business types since we now have a dedicated Business Type stage

export function ExistingIdea({ onSubmit, initialValue = '', onClear, ideaType, location, scheduleGoals }: ExistingIdeaProps) {
  const [ideaText, setIdeaText] = useState(initialValue);
  const [isLoading, setIsLoading] = useState(false);
  const [improvedIdea, setImprovedIdea] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [promptForMoreInfo, setPromptForMoreInfo] = useState(false);

  async function assessAndImproveIdea(idea: string, isRetry = false) {
    const retryText = isRetry ? "Provide a different and unique improved version of this idea." : "";
    const prompt = `Assess the following business idea. If it is specific and clear, respond with a JSON object: {"is_good": true}. If it is vague or needs improvement, respond with a JSON object: {"is_good": false, "improved_idea": "your improved version here"}. The improved idea should be a more detailed and actionable version of the original. ${retryText} Idea: "${idea}"`;
    
    try {
      const response = await fetchChatGPT(prompt);
      return typeof response === 'string' ? JSON.parse(response) : response;
    } catch (error) {
      console.error("Failed to parse assessment response:", error);
      return { is_good: true }; // Failsafe
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ideaText.trim()) return;

    setIsLoading(true);
    setImprovedIdea(null);
    setRetryCount(0);
    setPromptForMoreInfo(false);

    const assessment = await assessAndImproveIdea(ideaText);

    setIsLoading(false);

    if (assessment.is_good) {
      onSubmit(ideaText);
    } else {
      setImprovedIdea(assessment.improved_idea);
    }
  };

  const handleAccept = () => {
    if (improvedIdea) {
      onSubmit(improvedIdea);
    }
  };

  const handleRetry = async () => {
    if (retryCount >= 2) {
      setPromptForMoreInfo(true);
      setImprovedIdea(null);
      return;
    }
    
    setIsLoading(true);
    setRetryCount(prev => prev + 1);
    
    const assessment = await assessAndImproveIdea(ideaText, true);
    
    if (!assessment.is_good && assessment.improved_idea) {
      setImprovedIdea(assessment.improved_idea);
    } else {
      setImprovedIdea("We couldn't generate a different suggestion. Your idea seems solid! You can continue or add more detail and retry.");
      setRetryCount(2);
    }
    
    setIsLoading(false);
  };

  return (
    <Container>
      <Title>
        {ideaType ? `Tell us about your ${ideaType.title.toLowerCase()} idea` : 'Tell us about your idea'}
      </Title>
      
      <FormCard>
        <form onSubmit={handleSubmit} style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <InputContainer>
             <StyledTextArea
              value={ideaText}
              onChange={(e) => {
                setIdeaText(e.target.value);
                if (promptForMoreInfo) {
                  setPromptForMoreInfo(false);
                }
              }}
              placeholder={
                ideaType 
                  ? `Describe your ${ideaType.title.toLowerCase()} business idea in detail...`
                  : "Describe your business idea"
              }
            />
          </InputContainer>
          
          <SubmitButton 
            type="submit" 
            disabled={!ideaText.trim() || isLoading || promptForMoreInfo}
          >
            {isLoading ? 'Assessing...' : 'Continue'}
          </SubmitButton>
        </form>
        
        <ClearButton onClick={onClear}>Clear and restart this step</ClearButton>
      </FormCard>
      
      {improvedIdea && !promptForMoreInfo && (
        <ImprovementContainer>
          <ImprovementHeader>Suggestion for Improvement:</ImprovementHeader>
          <p>{improvedIdea}</p>
          <ButtonGroup>
            <PrimaryButton onClick={handleAccept} disabled={isLoading}>Accept</PrimaryButton>
            <SecondaryButton 
              onClick={handleRetry}
              disabled={isLoading}
            >
              {isLoading && retryCount > 0 ? 'Retrying...' : `Retry (${retryCount}/2)`}
            </SecondaryButton>
          </ButtonGroup>
        </ImprovementContainer>
      )}
      {promptForMoreInfo && (
        <ImprovementContainer style={{
          background: 'linear-gradient(135deg, #fffbe6 0%, #fff8dc 100%)',
          borderColor: '#ffe58f',
          borderWidth: '2px'
        }}>
          <ImprovementHeader style={{color: '#d46b08'}}>Please provide more detail</ImprovementHeader>
          <p>Add more specifics to your idea above to help us generate a better suggestion.</p>
        </ImprovementContainer>
      )}
    </Container>
  );
} 