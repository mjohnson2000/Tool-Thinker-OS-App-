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
  background: #fafbfc;
  transition: border-color 0.2s;
  &:focus {
    outline: none;
    border-color: #181a1b;
    background: #fafbfc;
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

interface DescribeSolutionProps {
  onSubmit: (solutionText: string) => void;
  problemDescription: string | null;
  initialValue?: string | null;
  onClear: () => void;
}

export function DescribeSolution({ onSubmit, problemDescription, initialValue = null, onClear }: DescribeSolutionProps) {
  const [solutionText, setSolutionText] = useState(initialValue || '');
  const [isLoading, setIsLoading] = useState(false);
  const [improvedSolution, setImprovedSolution] = useState<string | null>(null);
  const [showRejectionMessage, setShowRejectionMessage] = useState(false);

  async function assessAndImproveSolution(solution: string) {
    const problemContext = problemDescription ? ` for the problem: '${problemDescription}'` : '';
    const prompt = `Assess the following solution${problemContext}. If it is specific and clearly solves the stated problem, respond with a JSON object: {"is_good": true}. If it is vague or could be improved, respond with a JSON object: {"is_good": false, "improved_idea": "your improved version here"}. The improved version should be a more detailed and actionable description of the solution. Solution: "${solution}"`;
    
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
    if (!solutionText.trim()) return;
    
    setIsLoading(true);
    setImprovedSolution(null);
    setShowRejectionMessage(false);

    const assessment = await assessAndImproveSolution(solutionText);
    setIsLoading(false);

    if (assessment.is_good) {
      onSubmit(solutionText);
    } else {
      setImprovedSolution(assessment.improved_idea);
    }
  };

  const handleAccept = () => {
    if (improvedSolution) {
      onSubmit(improvedSolution);
    }
  };

  const handleReject = () => {
    setImprovedSolution(null);
    setShowRejectionMessage(true);
  };

  return (
    <Container>
      <Title>How will your business solve your customer's struggle?</Title>
      <form onSubmit={handleSubmit} style={{ width: '100%' }}>
        <TextArea
          value={solutionText}
          onChange={(e) => setSolutionText(e.target.value)}
          placeholder="Describe how your product or service directly addresses the customer's struggle you identified. What makes your solution effective?"
        />
        <PrimaryButton type="submit" disabled={!solutionText.trim() || isLoading}>
          {isLoading ? 'Assessing...' : 'Continue'}
        </PrimaryButton>
      </form>
      {improvedSolution && (
        <ImprovementContainer>
          <ImprovementHeader>Suggestion for Improvement:</ImprovementHeader>
          <p>{improvedSolution}</p>
          <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
            <PrimaryButton onClick={handleAccept} disabled={isLoading}>Accept</PrimaryButton>
            <SecondaryButton onClick={handleReject} disabled={isLoading}>Reject</SecondaryButton>
          </div>
        </ImprovementContainer>
      )}
      {showRejectionMessage && (
        <RejectionMessage>
          Please provide a more specific solution and try again.
        </RejectionMessage>
      )}
      <ClearButton onClick={onClear}>Clear and restart this step</ClearButton>
    </Container>
  );
} 