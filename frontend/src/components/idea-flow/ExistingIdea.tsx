import React, { useState } from 'react';
import styled from 'styled-components';
import { fetchChatGPT } from '../../utils/chatgpt';

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
  font-size: 2rem;
  font-weight: 700;
  margin-bottom: 2rem;
`;

const TextArea = styled.textarea`
  width: 100%;
  height: 150px;
  padding: 1rem;
  border: 2px solid #E5E5E5;
  border-radius: 12px;
  font-size: 1rem;
  margin-bottom: 1.5rem;
  resize: none;
  &:focus {
    outline: none;
    border-color: #181a1b;
  }
`;

const SubmitButton = styled.button`
  background: #181a1b;
  color: #fff;
  border: none;
  border-radius: 8px;
  padding: 0.75rem 1.5rem;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s;
  &:hover {
    background: #000;
  }
  &:disabled {
    background: #ccc;
    cursor: not-allowed;
  }
`;

const ImprovementContainer = styled.div`
  background-color: #fff;
  border: 1px solid #e5e5e5;
  border-radius: 8px;
  padding: 1rem;
  margin-top: 1.5rem;
  width: 100%;
  text-align: left;
`;

const ImprovementHeader = styled.h4`
  font-size: 1.1rem;
  font-weight: 700;
  color: #181a1b;
  margin-bottom: 0.5rem;
`;

const RejectionMessage = styled.p`
  color: #c0392b;
  margin-top: 1rem;
`;

const BusinessTypeContainer = styled.div`
  margin-bottom: 1.5rem;
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  justify-content: center;
`;

const BusinessTypeTag = styled.button`
  background-color: #e9ecef;
  color: #495057;
  border: none;
  border-radius: 16px;
  padding: 0.5rem 1rem;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background-color: #ced4da;
    transform: translateY(-2px);
  }
`;

const ClearButton = styled.button`
  background: none;
  border: none;
  color: #6c757d;
  font-size: 0.9rem;
  cursor: pointer;
  margin-top: 1rem;

  &:hover {
    text-decoration: underline;
  }
`;

const InputContainer = styled.div`
  width: 100%;
  padding: 1rem;
  border: 2px solid #E5E5E5;
  border-radius: 12px;
  background: #fff;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  margin-bottom: 1.5rem;
  min-height: 150px;
  transition: border-color 0.2s;

  &:focus-within {
    outline: none;
    border-color: #181a1b;
  }
`;

const SelectedTypeTag = styled.div`
  background-color: #181a1b;
  color: white;
  border-radius: 8px;
  padding: 0.5rem 0.8rem;
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  white-space: nowrap;
  margin-right: 0;
`;

const RemoveTypeButton = styled.button`
  background: rgba(255, 255, 255, 0.2);
  border: none;
  border-radius: 50%;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: white;
  font-weight: bold;

  &:hover {
    background: rgba(255, 255, 255, 0.4);
  }
`;

const StyledTextArea = styled.textarea`
  width: 100%;
  height: 120px;
  padding: 1rem;
  border: 2px solid #E5E5E5;
  border-radius: 12px;
  font-size: 1rem;
  margin-bottom: 1.5rem;
  resize: none;
  background: #fafbfc;
  transition: border-color 0.2s;
  &:focus {
    outline: none;
    border-color: #181a1b;
    background: #fafbfc;
  }
`;

const OptionCard = styled.button<{ isSelected: boolean }>`
  background: #fff;
  border: 2px solid ${props => props.isSelected ? '#181a1b' : '#E5E5E5'};
  border-radius: 12px;
  padding: 1.5rem 1rem;
  margin-bottom: 1rem;
  cursor: pointer;
  outline: none;
  transition: border 0.2s, box-shadow 0.2s;
  &:hover, &:focus {
    border: 2px solid #181a1b;
    box-shadow: 0 4px 12px rgba(0,0,0,0.10);
  }
`;

const PrimaryButton = styled.button`
  background: #181a1b;
  color: #fff;
  border: none;
  border-radius: 10px;
  padding: 0.7rem 1.6rem;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
  &:hover:not(:disabled) {
    background: #222;
  }
  &:active:not(:disabled) {
    background: #333;
  }
  &:disabled {
    background: #f5f5f7;
    color: #b0b0b0;
    cursor: not-allowed;
  }
`;

const SecondaryButton = styled.button`
  background: #f5f5f7;
  color: #181a1b;
  border: 1px solid #e5e5e5;
  border-radius: 10px;
  padding: 0.7rem 1.6rem;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s, border 0.2s;
  &:hover:not(:disabled) {
    background: #e5e5e5;
    border-color: #d1d1d1;
  }
  &:active:not(:disabled) {
    background: #d1d1d1;
    border-color: #b0b0b0;
  }
  &:disabled {
    background: #f5f5f7;
    color: #b0b0b0;
    border-color: #e5e5e5;
    cursor: not-allowed;
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  justify-content: center;
  margin-top: 1rem;
`;

interface ExistingIdeaProps {
  onSubmit: (ideaText: string) => void;
  initialValue?: string;
  onClear: () => void;
}

const businessTypes = ["SaaS", "E-commerce", "Marketplace", "Service-based", "Mobile App", "Physical Product"];

export function ExistingIdea({ onSubmit, initialValue = '', onClear }: ExistingIdeaProps) {
  const [selectedType, setSelectedType] = useState<string | null>(() => {
    const match = initialValue.match(/A (\w+-?\w+) business that/);
    return match ? match[1] : null;
  });
  const [ideaText, setIdeaText] = useState(() => {
     return initialValue.replace(/A \w+-?\w+ business that\s?/, '');
  });
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
    const fullIdea = selectedType ? `A ${selectedType} business that ${ideaText}` : ideaText;
    if (!fullIdea.trim()) return;

    setIsLoading(true);
    setImprovedIdea(null);
    setRetryCount(0);
    setPromptForMoreInfo(false);

    const assessment = await assessAndImproveIdea(fullIdea);

    setIsLoading(false);

    if (assessment.is_good) {
      onSubmit(fullIdea);
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
    
    const fullIdea = selectedType ? `A ${selectedType} business that ${ideaText}` : ideaText;
    const assessment = await assessAndImproveIdea(fullIdea, true);
    
    if (!assessment.is_good && assessment.improved_idea) {
      setImprovedIdea(assessment.improved_idea);
    } else {
      setImprovedIdea("We couldn't generate a different suggestion. Your idea seems solid! You can continue or add more detail and retry.");
      setRetryCount(2);
    }
    
    setIsLoading(false);
  };

  const handleBusinessTypeClick = (type: string) => {
    setSelectedType(type);
  };
  
  const handleRemoveType = () => {
    setSelectedType(null);
  }

  return (
    <Container>
      <Title>Tell us about your idea</Title>
      <form onSubmit={handleSubmit} style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <BusinessTypeContainer>
          {businessTypes.map(type => (
            <BusinessTypeTag 
              key={type} 
              type="button" 
              onClick={() => handleBusinessTypeClick(type)}
              style={{
                background: selectedType === type ? '#d3d3d3' : '#e9ecef',
                cursor: selectedType === type ? 'default' : 'pointer'
              }}
              disabled={selectedType === type}
            >
              {type}
            </BusinessTypeTag>
          ))}
        </BusinessTypeContainer>

        <InputContainer>
           <StyledTextArea
            value={ideaText}
            onChange={(e) => {
              setIdeaText(e.target.value);
              if (promptForMoreInfo) {
                setPromptForMoreInfo(false);
              }
            }}
            placeholder={"Describe your business idea and select a category"}
          />
          {selectedType && (
            <SelectedTypeTag>
              {selectedType}
              <RemoveTypeButton onClick={handleRemoveType} type="button">×</RemoveTypeButton>
            </SelectedTypeTag>
          )}
        </InputContainer>
        
        <SubmitButton 
          type="submit" 
          disabled={!ideaText.trim() || !selectedType || isLoading || promptForMoreInfo}
        >
          {isLoading ? 'Assessing...' : 'Continue'}
        </SubmitButton>
      </form>
      <SubmitButton onClick={onClear}>Clear and restart this step</SubmitButton>
      
      {improvedIdea && !promptForMoreInfo && (
        <ImprovementContainer>
          <ImprovementHeader>Suggestion for Improvement:</ImprovementHeader>
          <p>{improvedIdea}</p>
          <ButtonGroup>
            <PrimaryButton onClick={handleAccept} disabled={isLoading} style={{ marginRight: '1rem' }}>Accept</PrimaryButton>
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
        <ImprovementContainer style={{backgroundColor: '#fffbe6', borderColor: '#ffe58f'}}>
          <ImprovementHeader style={{color: '#d46b08'}}>Please provide more detail</ImprovementHeader>
          <p>Add more specifics to your idea above to help us generate a better suggestion.</p>
        </ImprovementContainer>
      )}
    </Container>
  );
} 