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

const Options = styled.div`
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
`;

const OptionButton = styled.button<{ isSelected: boolean }>`
  padding: 1rem 2rem;
  font-size: 1.1rem;
  border: 2px solid ${props => props.isSelected ? '#007AFF' : '#E5E5E5'};
  border-radius: 12px;
  background: ${props => props.isSelected ? '#e6f0ff' : 'var(--card-background)'};
  box-shadow: var(--shadow);
  color: var(--text-primary);
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s;
  &:hover {
    border-color: #007AFF;
  }
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

const SuggestionContainer = styled.div`
  background-color: #f0f8ff;
  border: 1px solid #b3d7ff;
  border-radius: 8px;
  padding: 1.5rem;
  margin-top: 1.5rem;
  width: 100%;
  text-align: left;
`;

const SuggestionHeader = styled.h4`
  color: #0056b3;
  margin-bottom: 1rem;
`;

const RejectionMessage = styled.p`
  color: #c0392b;
  margin-top: 1rem;
`;

const StrategicSuggestion = styled.div`
  background: #fff;
  border: 1px solid #e5e5e5;
  border-radius: 8px;
  padding: 1rem;
  margin-bottom: 1rem;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    border-color: #007AFF;
    box-shadow: 0 4px 12px rgba(0,0,0,0.08);
  }
`;

interface DescribeCompetitionProps {
  onSubmit: (competitionText: string | null) => void;
  solutionDescription: string | null;
  initialValue?: string | null;
}

export function DescribeCompetition({ onSubmit, solutionDescription, initialValue = null }: DescribeCompetitionProps) {
  const [isBetter, setIsBetter] = useState<boolean | null>(initialValue ? true : (initialValue === null ? null : false));
  const [description, setDescription] = useState(initialValue || '');
  const [isLoading, setIsLoading] = useState(false);
  const [improvedAdvantage, setImprovedAdvantage] = useState<string | null>(null);
  const [strategicSuggestions, setStrategicSuggestions] = useState<string[]>([]);
  const [showRejectionMessage, setShowRejectionMessage] = useState(false);

  async function assessAndImproveAdvantage(advantage: string) {
    const solutionContext = solutionDescription ? ` based on the solution: '${solutionDescription}'` : '';
    const prompt = `Assess the following competitive advantage${solutionContext}. If it is specific and strong, respond with {"is_good": true}. If it is weak or generic, respond with {"is_good": false, "improved_idea": "your improved version here"}. The improved version should be a more compelling and specific advantage. Advantage: "${advantage}"`;
    try {
      const response = await fetchChatGPT(prompt);
      return typeof response === 'string' ? JSON.parse(response) : response;
    } catch (e) {
      return { is_good: true }; // Failsafe
    }
  }

  async function generateNicheSolutions() {
    setIsLoading(true);
    const solutionContext = solutionDescription ? ` given the proposed solution: '${solutionDescription}'` : '';
    const prompt = `My business idea isn't clearly better than the competition. ${solutionContext}. Based on a "Blue Ocean Strategy", suggest 3 distinct, niche, and actionable strategic angles to make the business unique. Frame each as a short, compelling competitive advantage. Return ONLY a valid JSON array of strings.`;
    
    try {
        const response = await fetchChatGPT(prompt);
        let suggestions = typeof response === 'string' ? JSON.parse(response) : response;
        if (Array.isArray(suggestions)) {
            setStrategicSuggestions(suggestions);
        }
    } catch (e) {
        // Handle error, maybe show a default message
    } finally {
        setIsLoading(false);
    }
  }

  const handleSelect = (better: boolean) => {
    setIsBetter(better);
    setImprovedAdvantage(null);
    setShowRejectionMessage(false);
    setStrategicSuggestions([]);
    if (!better) {
      setDescription('');
      generateNicheSolutions();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) return;

    setIsLoading(true);
    setImprovedAdvantage(null);
    setShowRejectionMessage(false);

    const assessment = await assessAndImproveAdvantage(description);
    setIsLoading(false);

    if (assessment.is_good) {
      onSubmit(description);
    } else {
      setImprovedAdvantage(assessment.improved_idea);
    }
  };

  const handleAccept = () => {
    if (improvedAdvantage) onSubmit(improvedAdvantage);
  };

  const handleReject = () => {
    setImprovedAdvantage(null);
    setShowRejectionMessage(true);
  };
  
  const handleSuggestionClick = (suggestion: string) => {
    onSubmit(suggestion);
  };

  return (
    <Container>
      <Title>Is your solution better than the competition?</Title>
      <Options>
        <OptionButton isSelected={isBetter === true} onClick={() => handleSelect(true)}>
          Yes
        </OptionButton>
        <OptionButton isSelected={isBetter === false} onClick={() => handleSelect(false)}>
          No
        </OptionButton>
      </Options>

      {isBetter === true && (
        <form onSubmit={handleSubmit} style={{ width: '100%' }}>
          <TextArea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="How is your solution better? (e.g., faster, cheaper, more features, better design)"
          />
          <Button type="submit" disabled={!description.trim() || isLoading}>
            {isLoading ? 'Assessing...' : 'Continue'}
          </Button>
        </form>
      )}

      {improvedAdvantage && (
        <SuggestionContainer>
          <SuggestionHeader>Suggestion for a Stronger Advantage:</SuggestionHeader>
          <p>{improvedAdvantage}</p>
          <Button onClick={handleAccept} style={{ marginRight: '1rem' }}>Use Suggestion</Button>
          <Button onClick={handleReject} style={{ background: '#c0392b' }}>Reject</Button>
        </SuggestionContainer>
      )}

      {showRejectionMessage && (
        <RejectionMessage>
          Please describe a more specific competitive advantage.
        </RejectionMessage>
      )}

      {isLoading && strategicSuggestions.length === 0 && <p>Finding unique angles for you...</p>}
      
      {strategicSuggestions.length > 0 && (
        <SuggestionContainer>
          <SuggestionHeader>Your current idea might be in a "Red Ocean" (a crowded market). Consider a "Blue Ocean" strategy by exploring these unique angles:</SuggestionHeader>
          {strategicSuggestions.map((suggestion, index) => (
            <StrategicSuggestion key={index} onClick={() => handleSuggestionClick(suggestion)}>
              {suggestion}
            </StrategicSuggestion>
          ))}
        </SuggestionContainer>
      )}
    </Container>
  );
} 