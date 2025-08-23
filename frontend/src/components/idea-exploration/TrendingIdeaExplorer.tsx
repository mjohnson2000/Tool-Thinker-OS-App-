import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaRocket, FaLightbulb } from 'react-icons/fa';

interface TrendingIdeaData {
  title: string;
  description: string;
  market: string;
  trend: string;
  difficulty: string;
  investment: string;
  timeToLaunch: string;
  potential: string;
  tags: string[];
  businessType: string;
  aiSummary: string;
  selectedBusinessType?: string;
  selectedScope?: string;
  scopeData?: {
    hoursPerWeek: number;
    incomeTarget: number;
  };
  source: string;
  sourceId: string;
}

const ExplorerContainer = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f5f7 0%, #ffffff 100%);
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 2rem 1rem;
  
  @media (max-width: 768px) {
    padding: 1rem 0.5rem;
    min-height: 100vh;
  }
`;

const ExplorerCard = styled.div`
  background: linear-gradient(135deg, #ffffff 0%, #fafbfc 100%);
  border-radius: 24px;
  padding: 3rem 2.5rem;
  box-shadow: 
    0 8px 32px rgba(0,0,0,0.08),
    0 2px 8px rgba(0,0,0,0.06);
  border: 1px solid rgba(255,255,255,0.8);
  width: 100%;
  max-width: 800px;
  margin-top: 2rem;
  position: relative;
  overflow: hidden;
  
  @media (max-width: 768px) {
    padding: 1.5rem 1rem;
    border-radius: 16px;
    margin-top: 0.5rem;
    box-shadow: 
      0 4px 16px rgba(0,0,0,0.06),
      0 1px 4px rgba(0,0,0,0.04);
  }
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: linear-gradient(90deg, #181a1b, #4a4a4a, #181a1b);
    border-radius: 24px 24px 0 0;
    
    @media (max-width: 768px) {
      border-radius: 20px 20px 0 0;
    }
  }
`;

const Header = styled.div`
  text-align: center;
  margin-bottom: 3rem;
  
  @media (max-width: 768px) {
    margin-bottom: 2rem;
  }
`;

const Title = styled.h1`
  font-family: 'Audiowide', 'Courier New', monospace;
  font-size: 2.4rem;
  font-weight: 400;
  color: #181a1b;
  margin-bottom: 1rem;
  background: linear-gradient(135deg, #181a1b 0%, #4a4a4a 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  
  @media (max-width: 768px) {
    font-size: 1.8rem;
    margin-bottom: 0.75rem;
  }
`;

const Subtitle = styled.p`
  font-size: 1.2rem;
  color: #6b7280;
  line-height: 1.6;
  max-width: 600px;
  margin: 0 auto;
  
  @media (max-width: 768px) {
    font-size: 1rem;
    line-height: 1.5;
    padding: 0 0.5rem;
  }
`;

const IdeaSection = styled.div`
  background: #f8fafc;
  border-radius: 16px;
  padding: 2rem;
  margin-bottom: 2rem;
  border: 1px solid #e5e7eb;
  
  @media (max-width: 768px) {
    padding: 1.5rem 1rem;
    margin-bottom: 1.5rem;
    border-radius: 12px;
  }
`;

const IdeaTitle = styled.h2`
  font-size: 1.8rem;
  font-weight: 700;
  color: #111827;
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  
  @media (max-width: 768px) {
    font-size: 1.3rem;
    margin-bottom: 0.75rem;
    gap: 0.5rem;
  }
`;

const IdeaDescription = styled.p`
  font-size: 1.1rem;
  color: #374151;
  line-height: 1.6;
  margin-bottom: 1.5rem;
  
  @media (max-width: 768px) {
    font-size: 0.95rem;
    line-height: 1.5;
    margin-bottom: 1rem;
  }
`;

const IdeaDetails = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 0.5rem;
  }
`;

const DetailItem = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  color: #374151;
  font-size: 1rem;
  font-weight: 500;
  padding: 1rem;
  background: #ffffff;
  border-radius: 12px;
  border: 1px solid #e5e7eb;
  box-shadow: 0 1px 3px rgba(0,0,0,0.05);
  
  svg {
    color: #059669;
    flex-shrink: 0;
    font-size: 1.1rem;
  }
  
  @media (max-width: 768px) {
    padding: 0.75rem;
    font-size: 0.9rem;
    gap: 0.5rem;
    border-radius: 8px;
    
    svg {
      font-size: 1rem;
    }
  }
`;

const DetailLabel = styled.span`
  font-weight: 600;
  color: #111827;
  
  @media (max-width: 768px) {
    font-size: 0.9rem;
  }
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 1rem;
  justify-content: center;
  margin-top: 2rem;
  
  @media (max-width: 768px) {
    flex-direction: column;
    gap: 0.75rem;
    margin-top: 1.5rem;
  }
`;

const Button = styled.button<{ $primary?: boolean }>`
  padding: 1rem 2rem;
  font-family: 'Audiowide', 'Courier New', monospace;
  font-size: 1.1rem;
  font-weight: 600;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  align-items: center;
  gap: 0.75rem;
  text-decoration: none;
  
  background: ${props => props.$primary 
    ? 'linear-gradient(135deg, #181a1b 0%, #4a4a4a 100%)' 
    : 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)'};
  color: ${props => props.$primary ? '#ffffff' : '#181a1b'};
  border: 2px solid ${props => props.$primary ? 'transparent' : '#e5e7eb'};
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(0,0,0,0.15);
    background: ${props => props.$primary 
      ? 'linear-gradient(135deg, #000000 0%, #2d2d2d 100%)' 
      : 'linear-gradient(135deg, #f8f9fa 0%, #f1f3f4 100%)'};
  }
  
  &:active {
    transform: translateY(-1px);
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
  
  @media (max-width: 768px) {
    padding: 0.875rem 1.25rem;
    font-size: 0.95rem;
    justify-content: center;
    min-height: 48px;
  }
`;

const LoadingSpinner = styled.div`
  display: inline-block;
  width: 20px;
  height: 20px;
  border: 3px solid rgba(255,255,255,.3);
  border-radius: 50%;
  border-top-color: #fff;
  animation: spin 1s ease-in-out infinite;
  
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
  
  @media (max-width: 768px) {
    width: 18px;
    height: 18px;
    border-width: 2px;
  }
`;

const ErrorMessage = styled.div`
  background: #fef2f2;
  border: 1px solid #fecaca;
  color: #dc2626;
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 1rem;
  text-align: center;
  
  @media (max-width: 768px) {
    padding: 0.75rem;
    font-size: 0.9rem;
    border-radius: 6px;
  }
`;

export function TrendingIdeaExplorer() {
  const navigate = useNavigate();
  const [ideaData, setIdeaData] = useState<TrendingIdeaData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    // Check for trending idea data
    const prefilledIdea = localStorage.getItem('prefilledIdea');
    const explorationInitiated = localStorage.getItem('ideaExplorationInitiated');
    
    if (prefilledIdea && explorationInitiated) {
      try {
        const parsedData = JSON.parse(prefilledIdea);
        setIdeaData(parsedData);
        setIsLoading(false);
      } catch (err) {
        setError('Failed to load idea data. Please try again.');
        setIsLoading(false);
      }
    } else {
      // No idea data found, redirect to landing
      navigate('/');
    }
  }, [navigate]);

  const handleExploreIdea = async () => {
    if (!ideaData) return;
    
    setIsProcessing(true);
    try {
      console.log('TrendingIdeaExplorer: Storing idea data:', ideaData);
      
      // Store the idea data for the app to process
      localStorage.setItem('prefilledIdea', JSON.stringify(ideaData));
      localStorage.setItem('ideaExplorationInitiated', 'true');
      localStorage.setItem('fromTrendingIdeas', 'true');
      
      // Clear any existing app state
      localStorage.removeItem('appState');
      
      console.log('TrendingIdeaExplorer: Data stored, navigating to /app');
      
      // Add a small delay to ensure localStorage is written
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Navigate to the app
      console.log('TrendingIdeaExplorer: About to navigate to /app');
      navigate('/app');
      console.log('TrendingIdeaExplorer: Navigation completed');
    } catch (error) {
      console.error('Error processing idea:', error);
      setError('Failed to process idea. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleGoBack = () => {
    // Clear the flags and go back to landing
    localStorage.removeItem('prefilledIdea');
    localStorage.removeItem('ideaExplorationInitiated');
    navigate('/');
  };

  if (isLoading) {
    return (
      <ExplorerContainer>
        <ExplorerCard>
          <div style={{ textAlign: 'center', padding: '3rem' }}>
            <LoadingSpinner />
            <p style={{ marginTop: '1rem', color: '#6b7280' }}>Loading your idea...</p>
          </div>
        </ExplorerCard>
      </ExplorerContainer>
    );
  }

  if (error) {
    return (
      <ExplorerContainer>
        <ExplorerCard>
          <ErrorMessage>{error}</ErrorMessage>
          <ActionButtons>
            <Button onClick={handleGoBack}>
              <FaArrowLeft />
              Go Back
            </Button>
            <Button $primary onClick={handleExploreIdea}>
              <FaRocket />
              Try Again
            </Button>
          </ActionButtons>
        </ExplorerCard>
      </ExplorerContainer>
    );
  }

  if (!ideaData) {
    return (
      <ExplorerContainer>
        <ExplorerCard>
          <ErrorMessage>No idea data found. Please try exploring an idea again.</ErrorMessage>
          <ActionButtons>
            <Button onClick={handleGoBack}>
              <FaArrowLeft />
              Go Back
            </Button>
          </ActionButtons>
        </ExplorerCard>
      </ExplorerContainer>
    );
  }

  return (
    <ExplorerContainer>
      <ExplorerCard>
        <Header>
          <Title>🚀 Explore Your Alpha Idea</Title>
          <Subtitle>
            Ready to dive deep into this trending opportunity? Let's explore how you can turn this idea into a profitable side hustle.
          </Subtitle>
        </Header>

        <IdeaSection>
          <IdeaTitle>
            <FaLightbulb />
            {ideaData.title}
          </IdeaTitle>
          
          <IdeaDescription>
            {ideaData.aiSummary || ideaData.description}
          </IdeaDescription>

          <IdeaDetails>
            <DetailItem>
              <span>🎯</span>
              <div>
                <DetailLabel>Market:</DetailLabel> {ideaData.market}
              </div>
            </DetailItem>
            <DetailItem>
              <span>📈</span>
              <div>
                <DetailLabel>Trend:</DetailLabel> {ideaData.trend}
              </div>
            </DetailItem>
            <DetailItem>
              <span>⏱️</span>
              <div>
                <DetailLabel>Launch Time:</DetailLabel> {ideaData.timeToLaunch}
              </div>
            </DetailItem>
            <DetailItem>
              <span>💰</span>
              <div>
                <DetailLabel>Potential:</DetailLabel> {ideaData.potential}
              </div>
            </DetailItem>
            <DetailItem>
              <span>💼</span>
              <div>
                <DetailLabel>Difficulty:</DetailLabel> {ideaData.difficulty}
              </div>
            </DetailItem>
            <DetailItem>
              <span>💵</span>
              <div>
                <DetailLabel>Investment:</DetailLabel> {ideaData.investment}
              </div>
            </DetailItem>
          </IdeaDetails>
        </IdeaSection>

        <ActionButtons>
          <Button onClick={handleGoBack}>
            <FaArrowLeft />
            Go Back
          </Button>
          <Button $primary onClick={handleExploreIdea} disabled={isProcessing}>
            {isProcessing ? (
              <>
                <LoadingSpinner />
                Processing...
              </>
            ) : (
              <>
                <FaRocket />
                Explore This Idea
              </>
            )}
          </Button>
        </ActionButtons>
      </ExplorerCard>
    </ExplorerContainer>
  );
}
