import React, { useState } from 'react';
import styled from 'styled-components';
import { fetchChatGPT } from '../../utils/chatgpt';
import type { CustomerOption } from './CustomerSelection';
import { trackDiscoveryStage } from '../../utils/analytics';

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

const OptionCard = styled.button<{ isSelected: boolean }>`
  background: ${props => props.isSelected ? '#ededed' : 'var(--card-background)'};
  border: 2px solid ${props => props.isSelected ? '#181a1b' : '#E5E5E5'};
  border-radius: 12px;
  padding: 1.5rem 1rem;
  margin-bottom: 1rem;
  cursor: pointer;
  outline: none;
  transition: border 0.2s, box-shadow 0.2s, background 0.2s;
  &:hover, &:focus {
    border: 2px solid #181a1b;
    background: #ededed;
    box-shadow: 0 4px 12px rgba(0,0,0,0.10);
  }
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
  background: #fafbfc;
  transition: border-color 0.2s;
  &:focus {
    outline: none;
    border-color: #181a1b;
    background: #fafbfc;
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

const ClearButton = styled.button`
  background: none;
  border: none;
  color: #6c757d;
  font-size: 0.9rem;
  cursor: pointer;
  margin-top: 1rem;
  padding: 0;
  text-decoration: none;

  &:hover {
    text-decoration: underline;
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
`;

const PrimaryButton = styled.button`
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

interface DescribeProblemProps {
  onSubmit: (problemDescription: string | null) => void;
  customer: CustomerOption | null;
  initialValue?: string | null;
  onClear: () => void;
}

export function DescribeProblem({ onSubmit, customer, initialValue = null, onClear }: DescribeProblemProps) {
  const [knowsProblem, setKnowsProblem] = useState<boolean | null>(initialValue ? true : null);
  const [description, setDescription] = useState(initialValue || '');
  const [isLoading, setIsLoading] = useState(false);
  const [improvedDescription, setImprovedDescription] = useState<string | null>(null);
  const [showRejectionMessage, setShowRejectionMessage] = useState(false);

  async function assessAndImproveProblem(problem: string) {
    const customerContext = customer ? ` for a customer described as: '${customer.title} - ${customer.description}'` : '';
    const prompt = `From a Jobs to be Done perspective, assess the following customer problem statement${customerContext}. If it clearly defines the job the customer is trying to get done and their struggle, respond with: {"is_good": true}. If it is vague, respond with: {"is_good": false, "improved_idea": "your improved version here"}. The improved version should reframe the input as a clear JTBD statement, focusing on the customer's goal and the obstacles. Problem: "${problem}"`;
    
    try {
      const response = await fetchChatGPT(prompt);
      return typeof response === 'string' ? JSON.parse(response) : response;
    } catch (error) {
      console.error("Failed to parse assessment response:", error);
      return { is_good: true }; // Failsafe
    }
  }

  const handleSelect = (knows: boolean) => {
    setKnowsProblem(knows);
    if (!knows) {
      onSubmit(null);
    }
  };

  const handleSubmit = async () => {
    if (knowsProblem === null || !description.trim()) return;

    setIsLoading(true);
    setImprovedDescription(null);
    setShowRejectionMessage(false);

    const assessment = await assessAndImproveProblem(description);
    setIsLoading(false);

    if (assessment.is_good) {
      // Track problem description completion
      trackDiscoveryStage('problem_description');
      onSubmit(description);
    } else {
      setImprovedDescription(assessment.improved_idea);
    }
  };

  const handleAccept = () => {
    if (improvedDescription) {
      // Track problem description completion with improvement
      trackDiscoveryStage('problem_description_improved');
      onSubmit(improvedDescription);
    }
  };

  const handleReject = () => {
    setImprovedDescription(null);
    setShowRejectionMessage(true);
  };

  return (
    <Container>
      <Title>What is your customer struggling to achieve?</Title>
      <Options>
        <OptionCard isSelected={knowsProblem === true} onClick={() => handleSelect(true)}>
          I can describe the struggle
        </OptionCard>
        <OptionCard isSelected={knowsProblem === false} onClick={() => handleSelect(false)}>
          I'm not sure
        </OptionCard>
      </Options>

      {knowsProblem === true && (
        <>
          <TextArea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe the task your customer is trying to accomplish and what makes it difficult for them. Think about the functional and emotional aspects of their struggle."
          />
          <SubmitButton onClick={handleSubmit} disabled={!description.trim() || isLoading}>
            {isLoading ? 'Assessing...' : 'Continue'}
          </SubmitButton>
          <ClearButton onClick={onClear}>Clear and restart this step</ClearButton>
        </>
      )}

      {improvedDescription && (
        <ImprovementContainer>
          <ImprovementHeader>Suggestion for Improvement:</ImprovementHeader>
          <p>{improvedDescription}</p>
          <ButtonGroup>
            <PrimaryButton onClick={handleAccept} disabled={isLoading} style={{ marginRight: '1rem' }}>Accept</PrimaryButton>
            <SecondaryButton 
              onClick={handleReject}
              disabled={isLoading}
            >
              Reject
            </SecondaryButton>
          </ButtonGroup>
        </ImprovementContainer>
      )}

      {showRejectionMessage && (
        <RejectionMessage>
          Please provide a more specific problem description and try again.
        </RejectionMessage>
      )}
    </Container>
  );
} 