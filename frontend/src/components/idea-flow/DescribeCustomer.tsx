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

interface DescribeCustomerProps {
  onSubmit: (customerDescription: string | null) => void;
  initialValue?: string;
}

export function DescribeCustomer({ onSubmit, initialValue = '' }: DescribeCustomerProps) {
  const [knowsCustomer, setKnowsCustomer] = useState<boolean | null>(initialValue ? true : null);
  const [description, setDescription] = useState(initialValue || '');
  const [isLoading, setIsLoading] = useState(false);
  const [improvedDescription, setImprovedDescription] = useState<string | null>(null);
  const [showRejectionMessage, setShowRejectionMessage] = useState(false);

  async function assessAndImproveCustomer(desc: string) {
    const prompt = `Assess the following customer description. If it is specific and clear, respond with a JSON object: {"is_good": true}. If it is vague or needs improvement, respond with a JSON object: {"is_good": false, "improved_idea": "your improved version here"}. The improved version should be a more detailed and actionable description of the customer. Description: "${desc}"`;
    try {
      const response = await fetchChatGPT(prompt);
      return typeof response === 'string' ? JSON.parse(response) : response;
    } catch (error) {
      console.error("Failed to parse assessment response:", error);
      return { is_good: true }; // Failsafe
    }
  }

  const handleSelect = (knows: boolean) => {
    setKnowsCustomer(knows);
    if (!knows) {
      onSubmit(null);
    }
  };

  const handleSubmit = async () => {
    if (knowsCustomer === null) return;
    if (!description.trim()) return;

    setIsLoading(true);
    setImprovedDescription(null);
    setShowRejectionMessage(false);

    const assessment = await assessAndImproveCustomer(description);
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
      <Title>Do you know who your customer is?</Title>
      <Options>
        <OptionButton isSelected={knowsCustomer === true} onClick={() => handleSelect(true)}>
          Yes
        </OptionButton>
        <OptionButton isSelected={knowsCustomer === false} onClick={() => handleSelect(false)}>
          No
        </OptionButton>
      </Options>

      {knowsCustomer === true && (
        <>
          <TextArea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe your customer. What are their characteristics?"
          />
          <ContinueButton onClick={handleSubmit} disabled={!description.trim() || isLoading}>
            {isLoading ? 'Assessing...' : 'Continue'}
          </ContinueButton>
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
          Please provide more specific information about your customer and try again.
        </RejectionMessage>
      )}
    </Container>
  );
} 