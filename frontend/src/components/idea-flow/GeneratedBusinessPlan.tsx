import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaSave, FaCheckCircle, FaSpinner, FaStar, FaChartLine, FaUsers, FaLightbulb } from 'react-icons/fa';
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

const TopActions = styled.div`
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
  flex-wrap: wrap;
  
  @media (max-width: 768px) {
    flex-direction: column;
    gap: 0.8rem;
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

const Section = styled.div`
  margin-bottom: 2rem;
  padding: 1.5rem;
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  border-radius: 12px;
  border: 1px solid #dee2e6;
`;

const SectionTitle = styled.h3`
  color: #181a1b;
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1.2rem;
  font-weight: 600;
`;

const SectionContent = styled.div`
  color: #6b7280;
  line-height: 1.6;
  font-size: 1rem;
`;

const LoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem;
  text-align: center;
`;

const SuccessMessage = styled.div`
  background: linear-gradient(135deg, #d4edda 0%, #c3e6cb 100%);
  border: 1px solid #c3e6cb;
  border-radius: 12px;
  padding: 1rem;
  margin-bottom: 1.5rem;
  color: #155724;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 0.5rem;
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
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  const handleSavePlan = async () => {
    if (!isAuthenticated) {
      // Redirect to signup if not authenticated
      navigate('/signup');
      return;
    }

    try {
      setSaving(true);
      
      const response = await fetch(`${API_URL}/business-plan`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          ...generatedPlan,
          status: 'draft'
        })
      });

      if (!response.ok) {
        throw new Error('Failed to save business plan');
      }

      setSaved(true);
      setTimeout(() => {
        navigate('/plans');
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'Failed to save business plan');
    } finally {
      setSaving(false);
    }
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
    <Container>
      <FormCard>
        <TopActions>
          <SecondaryButton onClick={() => navigate('/app')}>
            <FaArrowLeft /> Back to Ideas
          </SecondaryButton>
          <PrimaryButton onClick={handleSavePlan} disabled={saving || saved}>
            {saving ? <FaSpinner className="fa-spin" /> : saved ? <FaCheckCircle /> : <FaSave />}
            {saving ? 'Saving...' : saved ? 'Saved!' : 'Save Business Plan'}
          </PrimaryButton>
        </TopActions>

        {saved && (
          <SuccessMessage>
            <FaCheckCircle style={{ color: '#28a745' }} />
            Business plan saved successfully! Redirecting to your plans...
          </SuccessMessage>
        )}

        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ 
            background: 'linear-gradient(135deg, #28a745 0%, #20c997 100%)',
            borderRadius: '50%',
            width: '80px',
            height: '80px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1rem',
            boxShadow: '0 4px 20px rgba(40, 167, 69, 0.3)'
          }}>
            <FaStar style={{ fontSize: '2rem', color: 'white' }} />
          </div>
          <h1 style={{ color: '#181a1b', marginBottom: '0.5rem' }}>🎉 Your Business Plan is Ready!</h1>
          <p style={{ color: '#6b7280', fontSize: '1.1rem' }}>
            Based on your inputs, we've generated a comprehensive business plan for your side hustle.
          </p>
        </div>

        {generatedPlan && (
          <>
            <Section>
              <SectionTitle>
                <FaLightbulb style={{ color: '#28a745' }} />
                Business Idea Summary
              </SectionTitle>
              <SectionContent>
                {generatedPlan.summary || 'Your personalized side hustle opportunity based on your interests, skills, and market analysis.'}
              </SectionContent>
            </Section>

            {generatedPlan.sections && (
              <>
                <Section>
                  <SectionTitle>
                    <FaUsers style={{ color: '#28a745' }} />
                    Customer Profile
                  </SectionTitle>
                  <SectionContent>
                    {generatedPlan.sections.Customer || 'Detailed analysis of your ideal customer, their pain points, and how your solution addresses their needs.'}
                  </SectionContent>
                </Section>

                <Section>
                  <SectionTitle>
                    <FaUsers style={{ color: '#28a745' }} />
                    Customer Struggles
                  </SectionTitle>
                  <SectionContent>
                    {generatedPlan.sections.Struggles || 'Key pain points and challenges your target customers face.'}
                  </SectionContent>
                </Section>

                <Section>
                  <SectionTitle>
                    <FaStar style={{ color: '#28a745' }} />
                    Value Proposition
                  </SectionTitle>
                  <SectionContent>
                    {generatedPlan.sections.Value || 'How your solution uniquely addresses customer needs and provides value.'}
                  </SectionContent>
                </Section>

                <Section>
                  <SectionTitle>
                    <FaChartLine style={{ color: '#28a745' }} />
                    Market Size
                  </SectionTitle>
                  <SectionContent>
                    {generatedPlan.sections.MarketSize || 'Market size, competitor analysis, and validation strategies for your business idea.'}
                  </SectionContent>
                </Section>

                <Section>
                  <SectionTitle>
                    <FaChartLine style={{ color: '#28a745' }} />
                    Competitors
                  </SectionTitle>
                  <SectionContent>
                    {generatedPlan.sections.Competitors || 'Main competitors and alternatives in your market.'}
                  </SectionContent>
                </Section>

                <Section>
                  <SectionTitle>
                    <FaChartLine style={{ color: '#28a745' }} />
                    Market Trends
                  </SectionTitle>
                  <SectionContent>
                    {generatedPlan.sections.Trends || 'Relevant trends and opportunities in your market.'}
                  </SectionContent>
                </Section>

                <Section>
                  <SectionTitle>
                    <FaChartLine style={{ color: '#28a745' }} />
                    Market Validation
                  </SectionTitle>
                  <SectionContent>
                    {generatedPlan.sections.Validation || 'How to validate your business idea and test market demand.'}
                  </SectionContent>
                </Section>

                <Section>
                  <SectionTitle>
                    <FaChartLine style={{ color: '#28a745' }} />
                    Financial Summary
                  </SectionTitle>
                  <SectionContent>
                    {generatedPlan.sections.Financial || 'Revenue models, cost analysis, and income projections for your side hustle.'}
                  </SectionContent>
                </Section>
              </>
            )}
          </>
        )}

        <div style={{ textAlign: 'center', marginTop: '2rem' }}>
          <p style={{ color: '#6b7280', marginBottom: '1rem' }}>
            Ready to take your side hustle to the next level?
          </p>
          <PrimaryButton onClick={handleSavePlan} disabled={saving || saved}>
            {saving ? <FaSpinner className="fa-spin" /> : saved ? <FaCheckCircle /> : <FaSave />}
            {saving ? 'Saving...' : saved ? 'Saved!' : 'Save & Continue'}
          </PrimaryButton>
        </div>
      </FormCard>
    </Container>
  );
}
