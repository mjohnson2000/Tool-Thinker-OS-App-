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

export function IterateOrLaunchPage() {
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
        // Safely access mvp property
        const mvp = res.data && typeof res.data === 'object' && 'mvp' in res.data ? (res.data as any).mvp : undefined;
        const userProgress = mvp?.userProgress?.iterate;
        if (userProgress) {
          setCompleted(userProgress.status === 'completed');
          setFeedback(userProgress.feedback || '');
          setProgress(userProgress.progress || {});
        }
      } catch (err) {
        // Optionally handle error
      } finally {
        setLoading(false);
      }
    }
    fetchPlan();
  }, [planId]);

  async function saveMvpData(isComplete: boolean, progressOverride?: { [key: string]: boolean }, feedbackOverride?: string) {
    if (!planId) return;
    const plan: any = businessPlan;
    const userProgress = plan?.mvp?.userProgress || {};
    const updatedProgress = {
      ...userProgress,
      iterate: {
        status: isComplete ? 'completed' : 'pending',
        progress: progressOverride || progress,
        feedback: feedbackOverride !== undefined ? feedbackOverride : feedback,
        completedAt: isComplete ? new Date() : undefined
      }
    };
    await axios.put(`/api/business-plan/${planId}/mvp`, {
      mvpData: {
        ...plan?.mvp,
        userProgress: updatedProgress
      },
      isComplete: plan?.mvp?.isComplete || false
    }, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
  }

  function handleProgressChange(key: string, checked: boolean) {
    setProgress(prev => {
      const updated = { ...prev, [key]: checked };
      saveMvpData(completed, updated);
      return updated;
    });
  }

  function handleMarkComplete() {
    setCompleted(true);
    saveMvpData(true);
  }

  function handleMarkIncomplete() {
    setCompleted(false);
    saveMvpData(false);
  }

  if (loading) {
    return <PageContainer>Loading...</PageContainer>;
  }

  // Copilot context
  const mvpSummary = businessPlan?.mvp?.solution || businessPlan?.solution?.description || 'your MVP';
  const customer = businessPlan?.customer?.title || 'target customers';

  const iterateSteps = [
    {
      key: 'review_results',
      title: 'Review Results',
      description: `Look at your MVP and customer validation results. What worked? What didn't? What did ${customer} say?`
    },
    {
      key: 'iterate_or_launch',
      title: 'Iterate or Launch',
      description: `If you found major issues, plan your next iteration. If you have strong validation, prepare to launch ${mvpSummary} to a wider audience!`
    },
    {
      key: 'launch_plan',
      title: 'Create a Launch Plan',
      description: 'Outline your launch steps, marketing, and support for your first real customers.'
    }
  ];

  return (
    <PageContainer>
      <h1 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '1.5rem', textAlign: 'center' }}>
        Iterate or Launch
      </h1>
      <StepCard>
        <StepTitle>Final Review & Next Steps</StepTitle>
        <StepDescription>
          Use your MVP and customer validation results to decide: iterate, pivot, or launch. The process is iterative—keep learning and improving!
        </StepDescription>
        <ProgressSection>
          <ProgressTitle>Track Your Progress</ProgressTitle>
          {iterateSteps.map(step => (
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
            placeholder="Share your launch plan, next iteration, or lessons learned..."
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