import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { FaCheckCircle, FaSpinner, FaStar, FaChartLine, FaUsers, FaLightbulb, FaArrowLeft, FaTimes } from 'react-icons/fa';
import { useAuth } from '../../contexts/AuthContext';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
  
  @media (max-width: 768px) {
    padding: 1rem 0.5rem;
  }
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
  
  @media (max-width: 768px) {
    padding: 1.5rem 1rem;
    margin-top: 1rem;
    border-radius: 16px;
  }
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 3px;
    background: linear-gradient(90deg, #181a1b, #4a4a4a, #181a1b);
    border-radius: 20px 20px 0 0;
    
    @media (max-width: 768px) {
      border-radius: 16px 16px 0 0;
    }
  }
`;



const PrimaryButton = styled.button`
  background: linear-gradient(135deg, #181a1b 0%, #2d2d2d 100%);
  color: #fff;
  border: none;
  border-radius: 12px;
  padding: 0.8rem 1.5rem;
  font-size: 1rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(0,0,0,0.2);
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
`;

const Title = styled.h1`
  font-family: 'Audiowide', 'Courier New', monospace;
  font-size: 2.4rem;
  font-weight: 400;
  margin-bottom: 1.2rem;
  text-align: center;
  color: #181a1b;
  letter-spacing: -0.03em;
  position: relative;
  font-display: swap;
  
  @media (max-width: 768px) {
    font-size: 2rem;
    margin-bottom: 1rem;
  }
  
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

const Meta = styled.div`
  text-align: center;
  margin-bottom: 2rem;
  color: #6c757d;
  font-size: 0.95rem;
  
  @media (max-width: 768px) {
    font-size: 0.85rem;
    margin-bottom: 1.5rem;
  }
`;

const SectionCard = styled.div`
  background: linear-gradient(135deg, #ffffff 0%, #fafbfc 100%);
  border-radius: 16px;
  padding: 1.8rem 1.5rem;
  margin-bottom: 1.5rem;
  box-shadow: 0 2px 8px rgba(0,0,0,0.06);
  border: 1px solid rgba(24, 26, 27, 0.1);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  
  @media (max-width: 768px) {
    padding: 1.5rem 1rem;
    margin-bottom: 1rem;
    border-radius: 12px;
  }
  
  &:hover {
    box-shadow: 0 4px 16px rgba(0,0,0,0.1);
    transform: translateY(-1px);
  }
`;

const SectionLabel = styled.h2`
  font-size: 1.4rem;
  font-weight: 700;
  color: #181a1b;
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  
  @media (max-width: 768px) {
    font-size: 1.2rem;
    margin-bottom: 0.8rem;
  }
`;

const SectionContent = styled.div`
  color: #333;
  line-height: 1.7;
  font-size: 1rem;
  
  @media (max-width: 768px) {
    font-size: 0.95rem;
    line-height: 1.6;
  }
`;

const MarketResearchSection = styled.div`
  display: grid;
  gap: 1.5rem;
  
  @media (max-width: 768px) {
    gap: 1rem;
  }
`;

const MarketResearchSubsection = styled.div`
  background: #f8f9fa;
  border-radius: 8px;
  padding: 1rem;
  border: 1px solid #e9ecef;
`;

const MarketResearchTitle = styled.h3`
  font-size: 1.1rem;
  font-weight: 600;
  color: #181a1b;
  margin-bottom: 0.8rem;
  
  @media (max-width: 768px) {
    font-size: 1rem;
    margin-bottom: 0.6rem;
  }
`;

const MarketResearchContent = styled.div`
  color: #333;
  line-height: 1.6;
  font-size: 0.95rem;
`;

const MarketResearchList = styled.ul`
  margin: 0;
  padding-left: 1.2rem;
  color: #333;
  line-height: 1.6;
`;

const MarketResearchListItem = styled.li`
  margin-bottom: 0.5rem;
  font-size: 0.95rem;
  
  &:last-child {
    margin-bottom: 0;
  }
`;





const LoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem;
  text-align: center;
`;

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
`;

const ModalContent = styled.div`
  background: white;
  border-radius: 16px;
  padding: 2rem;
  max-width: 500px;
  width: 100%;
  position: relative;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
  
  @media (max-width: 768px) {
    padding: 1.5rem;
    margin: 1rem;
  }
`;

const ModalClose = styled.button`
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #6b7280;
  padding: 0.5rem;
  border-radius: 50%;
  transition: all 0.2s ease;
  
  &:hover {
    background: #f3f4f6;
    color: #374151;
  }
`;

const ModalTitle = styled.h2`
  color: #181a1b;
  margin-bottom: 1rem;
  font-size: 1.5rem;
  font-weight: 700;
  text-align: center;
`;

const ModalText = styled.p`
  color: #6b7280;
  margin-bottom: 1.5rem;
  line-height: 1.6;
  text-align: center;
`;

const ModalBenefits = styled.div`
  background: #f8f9fa;
  border-radius: 8px;
  padding: 1rem;
  margin-bottom: 1.5rem;
`;

const ModalBenefitsTitle = styled.h3`
  color: #181a1b;
  margin-bottom: 0.8rem;
  font-size: 1.1rem;
  font-weight: 600;
`;

const ModalBenefitsList = styled.ul`
  margin: 0;
  padding-left: 1.2rem;
  color: #6b7280;
`;

const ModalBenefitsItem = styled.li`
  margin-bottom: 0.5rem;
  
  &:last-child {
    margin-bottom: 0;
  }
`;

const ModalActions = styled.div`
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
  
  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

const SecondaryButton = styled.button`
  background: transparent;
  color: #181a1b;
  border: 2px solid #181a1b;
  border-radius: 12px;
  padding: 0.8rem 1.5rem;
  font-size: 1rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  
  &:hover {
    background: #181a1b;
    color: white;
  }
`;



interface GeneratedBusinessPlanProps {
  idea: any;
  customer: any;
  job: any;
  solutionDescription?: string;
  competitionDescription?: string;
  problemDescription?: string;
}

export function GeneratedBusinessPlan({ 
  idea, 
  customer, 
  job, 
  solutionDescription, 
  competitionDescription, 
  problemDescription 
}: GeneratedBusinessPlanProps) {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [generatedPlan, setGeneratedPlan] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    generateBusinessPlan();
  }, []);

  const generateBusinessPlan = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`${API_URL}/business-plan/discovery`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(isAuthenticated && { 'Authorization': `Bearer ${localStorage.getItem('token')}` })
        },
        body: JSON.stringify({
          idea: {
            interests: idea.interests,
            existingIdeaText: idea.existingIdeaText,
            area: idea.area
          },
          customer: {
            title: customer.title,
            description: customer.description
          },
          job: {
            title: job.title,
            description: job.description
          },
          solutionDescription,
          competitionDescription,
          problemDescription
        })
      });

      if (!response.ok) {
        throw new Error('Failed to generate business plan');
      }

      const data = await response.json();
      setGeneratedPlan(data);
    } catch (err: any) {
      setError(err.message || 'Failed to generate business plan');
    } finally {
      setLoading(false);
    }
  };

  const handleManageHustles = () => {
    if (!isAuthenticated) {
      setShowModal(true);
    } else {
      navigate('/plans');
    }
  };

  const handleSignup = () => {
    setShowModal(false);
    window.location.href = '/app?signup=true';
  };

  const handleLogin = () => {
    setShowModal(false);
    window.location.href = '/app?login=true';
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

  if (loading) {
    return (
      <Container>
        <FormCard>
          <LoadingContainer>
            <FaSpinner className="fa-spin" style={{ fontSize: '2rem', color: '#181a1b', marginBottom: '1rem' }} />
            <h2>Generating Your Business Plan...</h2>
            <p>We're creating a comprehensive business plan based on your inputs.</p>
          </LoadingContainer>
        </FormCard>
      </Container>
    );
  }

  if (error) {
    return (
      <Container>
        <FormCard>
          <div style={{ textAlign: 'center', color: '#dc3545' }}>
            <h2>Error Generating Business Plan</h2>
            <p>{error}</p>
            <PrimaryButton onClick={generateBusinessPlan}>
              <FaSpinner /> Try Again
            </PrimaryButton>
          </div>
        </FormCard>
      </Container>
    );
  }

  return (
    <>
      <Container>
        <FormCard>
          <Title>🎉 Your Business Plan is Ready!</Title>
          <Meta>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center' }}>
              <span>Generated: {new Date().toLocaleDateString()}</span>
              <span style={{ color: '#6c757d' }}>|</span>
              <span style={{ 
                padding: '0.25rem 0.75rem',
                borderRadius: '12px',
                fontSize: '0.85rem',
                fontWeight: '600',
                background: '#d4edda',
                color: '#155724'
              }}>
                Draft
              </span>
            </div>
          </Meta>

          {generatedPlan && (
            <>
              <SectionCard>
                <SectionLabel>
                  <FaLightbulb style={{ color: '#28a745' }} />
                  Business Idea Summary
                </SectionLabel>
                <SectionContent>
                  {generatedPlan.summary || 'Your personalized side hustle opportunity based on your interests, skills, and market analysis.'}
                </SectionContent>
              </SectionCard>

              <SectionCard>
                <SectionLabel>
                  <FaUsers style={{ color: '#28a745' }} />
                  Customer Profile
                </SectionLabel>
                <SectionContent>
                  {generatedPlan.sections?.Customer || 'Detailed analysis of your ideal customer, their pain points, and how your solution addresses their needs.'}
                </SectionContent>
              </SectionCard>

              <SectionCard>
                <SectionLabel>
                  <FaUsers style={{ color: '#28a745' }} />
                  Customer Struggles
                </SectionLabel>
                <SectionContent>
                  {generatedPlan.sections?.Struggles || 'Key pain points and challenges your target customers face.'}
                </SectionContent>
              </SectionCard>

              <SectionCard>
                <SectionLabel>
                  <FaStar style={{ color: '#28a745' }} />
                  Value Proposition
                </SectionLabel>
                <SectionContent>
                  {generatedPlan.sections?.Value || 'How your solution uniquely addresses customer needs and provides value.'}
                </SectionContent>
              </SectionCard>

              <SectionCard>
                <SectionLabel>
                  <FaChartLine style={{ color: '#28a745' }} />
                  Market Research
                </SectionLabel>
                <MarketResearchSection>
                  <MarketResearchSubsection>
                    <MarketResearchTitle>Market Size</MarketResearchTitle>
                    <MarketResearchContent>
                      {generatedPlan.sections?.MarketSize || 'Market size analysis and validation strategies for your business idea.'}
                    </MarketResearchContent>
                  </MarketResearchSubsection>
                  
                  <MarketResearchSubsection>
                    <MarketResearchTitle>Market Trends</MarketResearchTitle>
                    <MarketResearchList>
                      {generatedPlan.sections?.Trends ? (
                        <MarketResearchListItem>
                          {generatedPlan.sections.Trends}
                        </MarketResearchListItem>
                      ) : (
                        <MarketResearchListItem style={{ color: '#666', fontStyle: 'italic' }}>
                          Market trends not yet analyzed.
                        </MarketResearchListItem>
                      )}
                    </MarketResearchList>
                  </MarketResearchSubsection>
                  
                  <MarketResearchSubsection>
                    <MarketResearchTitle>Competitors</MarketResearchTitle>
                    <MarketResearchList>
                      {generatedPlan.sections?.Competitors ? (
                        <MarketResearchListItem>
                          {generatedPlan.sections.Competitors}
                        </MarketResearchListItem>
                      ) : (
                        <MarketResearchListItem style={{ color: '#666', fontStyle: 'italic' }}>
                          Competitor analysis not yet completed.
                        </MarketResearchListItem>
                      )}
                    </MarketResearchList>
                  </MarketResearchSubsection>
                </MarketResearchSection>
              </SectionCard>

              <SectionCard>
                <SectionLabel>
                  <FaChartLine style={{ color: '#28a745' }} />
                  Market Validation
                </SectionLabel>
                <SectionContent>
                  {generatedPlan.sections?.Validation || 'How to validate your business idea and test market demand.'}
                </SectionContent>
              </SectionCard>

              <SectionCard>
                <SectionLabel>
                  <FaChartLine style={{ color: '#28a745' }} />
                  Financial Summary
                </SectionLabel>
                <SectionContent>
                  {generatedPlan.sections?.Financial || 'Revenue models, cost analysis, and income projections for your side hustle.'}
                </SectionContent>
              </SectionCard>
            </>
          )}

          <div style={{ textAlign: 'center', marginTop: '2rem' }}>
            <p style={{ color: '#6b7280', marginBottom: '1rem' }}>
              Ready to take your side hustle to the next level?
            </p>
            <PrimaryButton onClick={handleManageHustles}>
              Manage Your Alpha Hustles
            </PrimaryButton>
          </div>
        </FormCard>
      </Container>

      {/* Authentication Modal */}
      {showModal && (
        <ModalOverlay onClick={handleCloseModal}>
          <ModalContent onClick={(e) => e.stopPropagation()}>
            <ModalClose onClick={handleCloseModal}>
              <FaTimes />
            </ModalClose>
            
            <ModalTitle>🚀 Join Alpha Hustler Pro</ModalTitle>
            <ModalText>
              Sign up or log in to access your complete business plan dashboard and start managing your side hustles!
            </ModalText>
            
            <ModalBenefits>
              <ModalBenefitsTitle>What you'll get with Alpha Hustler Pro:</ModalBenefitsTitle>
              <ModalBenefitsList>
                <ModalBenefitsItem>Complete business plan with all sections</ModalBenefitsItem>
                <ModalBenefitsItem>AI-powered validation and scoring</ModalBenefitsItem>
                <ModalBenefitsItem>Step-by-step launch roadmap</ModalBenefitsItem>
                <ModalBenefitsItem>Expert coach consultations</ModalBenefitsItem>
                <ModalBenefitsItem>Unlimited plan iterations</ModalBenefitsItem>
                <ModalBenefitsItem>Access to your side hustle dashboard</ModalBenefitsItem>
              </ModalBenefitsList>
            </ModalBenefits>
            
            <ModalActions>
              <PrimaryButton onClick={handleSignup}>
                🚀 Sign Up
              </PrimaryButton>
              <SecondaryButton onClick={handleLogin}>
                Sign In
              </SecondaryButton>
            </ModalActions>
          </ModalContent>
        </ModalOverlay>
      )}
    </>
  );
}
