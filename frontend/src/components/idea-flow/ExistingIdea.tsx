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

interface ExistingIdeaProps {
  onSubmit: (ideaText: string) => void;
  initialValue?: string;
}

const businessTypes = ["SaaS", "E-commerce", "Marketplace", "Service-based", "Mobile App", "Physical Product"];

export function ExistingIdea({ onSubmit, initialValue = '' }: ExistingIdeaProps) {
  const [ideaText, setIdeaText] = useState(initialValue);
  const [isLoading, setIsLoading] = useState(false);
  const [improvedIdea, setImprovedIdea] = useState<string | null>(null);
  const [showRejectionMessage, setShowRejectionMessage] = useState(false);

  async function assessAndImproveIdea(idea: string) {
    const prompt = `Assess the following business idea. If it is specific and clear, respond with a JSON object: {"is_good": true}. If it is vague or needs improvement, respond with a JSON object: {"is_good": false, "improved_idea": "your improved version here"}. The improved idea should be a more detailed and actionable version of the original. Idea: "${idea}"`;
    
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
    setShowRejectionMessage(false);

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

  const handleReject = () => {
    setImprovedIdea(null);
    setShowRejectionMessage(true);
  };

  const handleBusinessTypeClick = (type: string) => {
    setIdeaText(prev => prev ? `${prev}, focused on being a ${type} business` : `A ${type} business that `);
  };

  return (
    <Container>
      <Title>Tell us about your idea</Title>
      <form onSubmit={handleSubmit} style={{ width: '100%' }}>
        <BusinessTypeContainer>
          {businessTypes.map(type => (
            <BusinessTypeTag key={type} onClick={() => handleBusinessTypeClick(type)}>
              {type}
            </BusinessTypeTag>
          ))}
        </BusinessTypeContainer>
        <TextArea
          value={ideaText}
          onChange={(e) => setIdeaText(e.target.value)}
          placeholder="Describe your business idea"
        />
        <Button type="submit" disabled={!ideaText.trim() || isLoading}>
          {isLoading ? 'Assessing...' : 'Continue'}
        </Button>
      </form>
      {improvedIdea && (
        <ImprovementContainer>
          <ImprovementHeader>Suggestion for Improvement:</ImprovementHeader>
          <p>{improvedIdea}</p>
          <Button onClick={handleAccept} style={{ marginRight: '1rem' }}>Accept</Button>
          <Button onClick={handleReject} style={{ background: '#c0392b' }}>Reject</Button>
        </ImprovementContainer>
      )}
      {showRejectionMessage && (
        <RejectionMessage>
          Please provide more specific information about your idea and try again.
        </RejectionMessage>
      )}
    </Container>
  );
} 