import React, { useState } from 'react';
import styled from 'styled-components';
import { fetchChatGPT } from '../../utils/chatgpt';
import type { CustomerOption } from './CustomerSelection';

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

const ImprovementContainer = styled.div`
  background-color: #f0f8ff;
  border: 1px solid #b3d7ff;
  border-radius: 8px;
  padding: 1rem;
  margin-top: 1.5rem;
  width: 100%;
  text-align: left;
`;

const ImprovementHeader = styled.h4`
  color: #0056b3;
  margin-bottom: 0.5rem;
`;

const RejectionMessage = styled.p`
  color: #c0392b;
  margin-top: 1rem;
`;

const ContinueButton = styled.button`
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
      onSubmit(description);
    } else {
      setImprovedDescription(assessment.improved_idea);
    }
  };

  const handleAccept = () => {
    if (improvedDescription) {
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
        <OptionButton isSelected={knowsProblem === true} onClick={() => handleSelect(true)}>
          I can describe the struggle
        </OptionButton>
        <OptionButton isSelected={knowsProblem === false} onClick={() => handleSelect(false)}>
          I'm not sure
        </OptionButton>
      </Options>

      {knowsProblem === true && (
        <>
          <TextArea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe the task your customer is trying to accomplish and what makes it difficult for them. Think about the functional and emotional aspects of their struggle."
          />
          <ContinueButton onClick={handleSubmit} disabled={!description.trim() || isLoading}>
            {isLoading ? 'Assessing...' : 'Continue'}
          </ContinueButton>
          <ClearButton onClick={onClear}>Clear and restart this step</ClearButton>
        </>
      )}

      {improvedDescription && (
        <ImprovementContainer>
          <ImprovementHeader>Suggestion for Improvement:</ImprovementHeader>
          <p>{improvedDescription}</p>
          <ContinueButton onClick={handleAccept} style={{ marginRight: '1rem' }}>Accept</ContinueButton>
          <ContinueButton onClick={handleReject} style={{ background: '#c0392b' }}>Reject</ContinueButton>
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