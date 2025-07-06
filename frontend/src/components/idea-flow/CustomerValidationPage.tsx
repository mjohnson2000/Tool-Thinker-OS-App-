import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';

// ... styled components (reuse from ValidateAssumptionsPage) ...

const PageContainer = styled.div`
  max-width: 800px;
  margin: 3rem auto;
  padding: 2rem 1rem;
  background: #fff;
  border-radius: 18px;
  box-shadow: 0 4px 24px rgba(0,0,0,0.08);
`;

const StepCard = styled.div`
  background: #f8f9fa;
  border-radius: 12px;
  padding: 2rem;
  margin-bottom: 2rem;
  box-shadow: 0 2px 8px rgba(0,0,0,0.04);
`;

const StepTitle = styled.h2`
  font-size: 1.4rem;
  font-weight: 700;
  margin-bottom: 1rem;
  color: #181a1b;
`;

const StepDescription = styled.p`
  color: #666;
  margin-bottom: 1.5rem;
  line-height: 1.6;
`;

const ProgressSection = styled.div`
  background: #f6f8fa;
  border: 1.5px solid #e9ecef;
  border-radius: 12px;
  padding: 2rem 1.5rem;
  margin-bottom: 1.5rem;
  box-shadow: 0 2px 8px rgba(0,0,0,0.03);
`;

const ProgressTitle = styled.h4`
  font-size: 1rem;
  font-weight: 600;
  margin-bottom: 1rem;
  color: #181a1b;
`;

const ProgressItem = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  background: #fff;
  border-radius: 8px;
  padding: 1.1rem 1rem;
  margin-bottom: 1rem;
  border: 1px solid #e9ecef;
  transition: box-shadow 0.2s, border-color 0.2s;
  box-shadow: 0 1px 4px rgba(0,0,0,0.02);
  &:hover {
    box-shadow: 0 4px 16px rgba(0,0,0,0.06);
    border-color: #181a1b;
  }
`;

const Checkbox = styled.input`
  width: 22px;
  height: 22px;
  accent-color: #181a1b;
  margin-top: 2px;
  cursor: pointer;
`;

const ProgressLabel = styled.label`
  font-size: 1rem;
  color: #222;
  cursor: pointer;
  flex: 1;
  line-height: 1.6;
  font-weight: 500;
`;

const FeedbackSection = styled.div`
  background: #fff;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
`;

const FeedbackTitle = styled.h4`
  font-size: 1rem;
  font-weight: 600;
  margin-bottom: 1rem;
  color: #181a1b;
`;

const TextArea = styled.textarea`
  width: 100%;
  min-height: 80px;
  border: 1px solid #e5e5e5;
  border-radius: 6px;
  padding: 0.8rem;
  font-size: 0.9rem;
  resize: vertical;
  font-family: inherit;
  &:focus {
    outline: none;
    border-color: #181a1b;
  }
`;

const ButtonRow = styled.div`
  display: flex;
  gap: 1rem;
  margin-top: 2rem;
  justify-content: center;
  flex-wrap: wrap;
`;

const Button = styled.button`
  background: #181a1b;
  color: #fff;
  border: none;
  border-radius: 8px;
  padding: 0.8rem 1.5rem;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s;
  &:hover, &:focus {
    background: #222;
  }
`;

export function CustomerValidationPage() {
  const [progress, setProgress] = useState<{ [key: string]: boolean }>({});
  const [feedback, setFeedback] = useState('');
  const [completed, setCompleted] = useState(false);
  const [businessPlan, setBusinessPlan] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { planId } = useParams();

  useEffect(() => {
    async function fetchPlan() {
      if (!planId) return;
      setLoading(true);
      try {
        const res = await axios.get(`/api/business-plan/${planId}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        });
        setBusinessPlan(res.data);
      } catch (err) {
        // Optionally handle error
      } finally {
        setLoading(false);
      }
    }
    fetchPlan();
  }, [planId]);

  function handleProgressChange(key: string, checked: boolean) {
    setProgress(prev => ({ ...prev, [key]: checked }));
  }

  function handleMarkComplete() {
    setCompleted(true);
    // TODO: Save to backend
  }

  function handleMarkIncomplete() {
    setCompleted(false);
    // TODO: Save to backend
  }

  if (loading) {
    return <PageContainer>Loading...</PageContainer>;
  }

  // Copilot context
  const customer = businessPlan?.customer?.title || 'target customers';
  const solution = businessPlan?.solution?.description || 'your solution';

  const validationSteps = [
    {
      key: 'interview_results',
      title: 'Review Interview Results',
      description: `Summarize what you learned from talking to ${customer}. What patterns or objections did you hear?`
    },
    {
      key: 'test_solution',
      title: 'Test Your Solution',
      description: `Share a demo or prototype of ${solution} with real customers. Collect feedback and measure interest.`
    },
    {
      key: 'refine_offer',
      title: 'Refine Your Offer',
      description: 'Based on feedback, update your messaging, pricing, or features to better fit customer needs.'
    }
  ];

  return (
    <PageContainer>
      <h1 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '1.5rem', textAlign: 'center' }}>
        Customer Validation
      </h1>
      <StepCard>
        <StepTitle>Validate with Real Customers</StepTitle>
        <StepDescription>
          Use interviews, demos, and feedback to validate your solution and business model. Iterate based on what you learn!
        </StepDescription>
        <ProgressSection>
          <ProgressTitle>Track Your Progress</ProgressTitle>
          {validationSteps.map(step => (
            <ProgressItem key={step.key}>
              <Checkbox
                type="checkbox"
                id={step.key}
                checked={progress[step.key] || false}
                onChange={e => handleProgressChange(step.key, e.target.checked)}
              />
              <ProgressLabel htmlFor={step.key}>
                <b>{step.title}:</b> {step.description}
              </ProgressLabel>
            </ProgressItem>
          ))}
        </ProgressSection>
        <FeedbackSection>
          <FeedbackTitle>Your Notes & Insights</FeedbackTitle>
          <TextArea
            placeholder="Share what you've learned, challenges you've faced, or insights you've gained from this stage..."
            value={feedback}
            onChange={e => setFeedback(e.target.value)}
          />
        </FeedbackSection>
        <ButtonRow>
          <Button onClick={completed ? handleMarkIncomplete : handleMarkComplete}>
            {completed ? 'Mark as Incomplete' : 'Mark as Complete'}
          </Button>
          <Button onClick={() => navigate(`/next-steps-hub/${planId || ''}`)}>
            ← Back to Roadmap
          </Button>
        </ButtonRow>
      </StepCard>
    </PageContainer>
  );
} 