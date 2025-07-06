import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useNavigate, useParams } from 'react-router-dom';

const PageContainer = styled.div`
  max-width: 800px;
  margin: 3rem auto;
  padding: 2rem 1rem;
  background: #fff;
  border-radius: 18px;
  box-shadow: 0 4px 24px rgba(0,0,0,0.08);
`;

const ProgressBar = styled.div<{ percent: number }>`
  width: 100%;
  height: 8px;
  background: #e5e5e5;
  border-radius: 4px;
  margin-bottom: 2rem;
  overflow: hidden;
  position: relative;
  &::after {
    content: '';
    display: block;
    height: 100%;
    width: ${({ percent }) => percent}%;
    background: #181a1b;
    border-radius: 4px;
    transition: width 0.3s;
    position: absolute;
    left: 0;
    top: 0;
  }
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

const ActionItem = styled.div`
  background: #fff;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  padding: 1.5rem;
  margin-bottom: 1rem;
  transition: all 0.2s;
  
  &:hover {
    border-color: #181a1b;
    box-shadow: 0 2px 8px rgba(24,26,27,0.1);
  }
`;

const ActionTitle = styled.h3`
  font-size: 1.1rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
  color: #181a1b;
`;

const ActionDescription = styled.p`
  color: #666;
  margin-bottom: 1rem;
  line-height: 1.5;
`;

const ActionDetails = styled.div`
  background: #f8f9fa;
  border-radius: 6px;
  padding: 1rem;
  margin-top: 1rem;
`;

const DetailTitle = styled.h4`
  font-size: 0.9rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
  color: #181a1b;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const DetailText = styled.p`
  color: #666;
  font-size: 0.9rem;
  line-height: 1.4;
  margin-bottom: 0.5rem;
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

const SecondaryButton = styled(Button)`
  background: #f5f5f7;
  color: #181a1b;
  border: 1.5px solid #e5e5e5;
  &:hover, &:focus {
    background: #e6e6e6;
    color: #222;
  }
`;

const SkipButton = styled(Button)`
  background: #6c757d;
  &:hover, &:focus {
    background: #5a6268;
  }
`;

const CompleteButton = styled(Button)`
  background: #28a745;
  &:hover, &:focus {
    background: #218838;
  }
`;

const ReportSection = styled.div`
  background: #fff;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
  max-height: 600px;
  overflow-y: auto;
`;

const ReportTitle = styled.h3`
  font-size: 1.2rem;
  font-weight: 600;
  margin-bottom: 1rem;
  color: #181a1b;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const ReportContent = styled.div`
  color: #444;
  line-height: 1.6;
  white-space: pre-line;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 0.9rem;
`;

const DownloadButton = styled(Button)`
  background: #28a745;
  &:hover, &:focus {
    background: #218838;
  }
`;

const StatusBadge = styled.span<{ status: 'pending' | 'completed' | 'skipped' }>`
  padding: 0.3rem 0.6rem;
  border-radius: 4px;
  font-size: 0.8rem;
  font-weight: 500;
  text-transform: uppercase;
  background: ${props => {
    switch (props.status) {
      case 'completed': return '#d4edda';
      case 'skipped': return '#f8d7da';
      default: return '#fff3cd';
    }
  }};
  color: ${props => {
    switch (props.status) {
      case 'completed': return '#155724';
      case 'skipped': return '#721c24';
      default: return '#856404';
    }
  }};
`;

interface BusinessPlan {
  _id: string;
  title: string;
  summary: string;
  sections: { [key: string]: string };
  idea: {
    interests: string[];
    existingIdeaText?: string;
  };
  customer: {
    title: string;
    description: string;
    persona?: {
      age?: string;
      location?: string;
      income?: string;
      painPoints: string[];
      goals: string[];
    };
  };
  job: {
    title: string;
    description: string;
    context?: string;
    constraints?: string[];
  };
  problem: {
    description: string;
    impact: string;
    urgency: 'low' | 'medium' | 'high';
  };
  solution: {
    description: string;
    keyFeatures: string[];
    uniqueValue: string;
  };
  marketEvaluation?: {
    score: number;
    competitors: string[];
    marketSize: string;
    customerResearch: string[];
    insights: string[];
  };
  mvp?: {
    problem?: string;
    solution?: string;
    assumptions?: string;
    test?: string;
    lastUpdated?: Date;
    isComplete?: boolean;
    userProgress?: UserProgress;
  };
}

interface MvpStep {
  key: string;
  title: string;
  description: string;
  status: 'pending' | 'completed' | 'skipped';
  progress: {
    [key: string]: boolean;
  };
  feedback: string;
  actions: {
    title: string;
    description: string;
    details?: {
      title: string;
      content: string;
    }[];
  }[];
}

interface UserProgress {
  [stepKey: string]: {
    status: 'pending' | 'completed' | 'skipped';
    progress: { [key: string]: boolean };
    feedback: string;
    completedAt?: Date;
  };
}

function generateMvpSteps(businessPlan: BusinessPlan): MvpStep[] {
  const customerName = businessPlan.customer.title;
  const problem = businessPlan.problem.description;
  const solution = businessPlan.solution.description;
  const keyFeatures = businessPlan.solution.keyFeatures;
  const marketScore = businessPlan.marketEvaluation?.score || 0;

  return [
    {
      key: 'validate',
      title: 'Validate Your Core Assumptions',
      description: `Before building anything, let's validate that ${customerName} actually has the problem you're solving and will pay for your solution.`,
      status: 'pending',
      progress: {
        'customer_interviews': false,
        'landing_page': false,
        'email_collection': false
      },
      feedback: '',
      actions: [
        {
          title: 'Conduct Customer Interviews',
          description: `Interview 5-10 ${customerName} to understand their pain points and validate your problem statement.`,
          details: [
            {
              title: 'Key Questions to Ask',
              content: `• "What's the biggest challenge you face with ${problem}?"\n• "How do you currently solve this problem?"\n• "What would you pay for a better solution?"\n• "What features would be most valuable to you?"`
            },
            {
              title: 'Interview Process',
              content: `1. Find ${customerName} through LinkedIn, industry groups, or referrals\n2. Offer a 15-minute call in exchange for feedback\n3. Record responses and look for patterns\n4. Ask for referrals to other potential customers`
            }
          ]
        },
        {
          title: 'Create a Landing Page',
          description: 'Build a simple landing page to gauge interest and collect email addresses.',
          details: [
            {
              title: 'Landing Page Elements',
              content: `• Clear headline addressing ${problem}\n• Brief description of your solution\n• Email signup form\n• Simple mockup or wireframe\n• Social proof or testimonials (if available)`
            },
            {
              title: 'Success Metrics',
              content: `• 5%+ conversion rate from visitors to email signups\n• 20+ email addresses collected\n• Positive feedback in comments or emails`
            }
          ]
        }
      ]
    },
    {
      key: 'define',
      title: 'Define Your MVP Scope',
      description: `Based on your solution "${solution}", define the absolute minimum features needed to test your core value proposition.`,
      status: 'pending',
      progress: {
        'core_features': false,
        'success_criteria': false,
        'timeline': false
      },
      feedback: '',
      actions: [
        {
          title: 'Identify Core Features',
          description: `Focus on the 1-2 most essential features that deliver your unique value: "${businessPlan.solution.uniqueValue}"`,
          details: [
            {
              title: 'MVP Feature List',
              content: keyFeatures.length > 0 
                ? keyFeatures.slice(0, 2).map(feature => `• ${feature}`).join('\n')
                : `• Core problem-solving feature\n• Basic user interface\n• Payment/onboarding flow`
            },
            {
              title: 'Features to Exclude',
              content: `• Advanced analytics\n• Complex integrations\n• Multiple user roles\n• Advanced customization\n• Mobile apps (start with web)`
            }
          ]
        },
        {
          title: 'Set Success Criteria',
          description: 'Define what success looks like for your MVP test.',
          details: [
            {
              title: 'Success Metrics',
              content: `• 10+ paying customers within 30 days\n• 70%+ customer satisfaction score\n• Clear feedback on what to improve\n• Validation of core assumptions`
            }
          ]
        }
      ]
    },
    {
      key: 'build',
      title: 'Build Your MVP',
      description: `Create the simplest version of your solution that ${customerName} can actually use and pay for.`,
      status: 'pending',
      progress: {
        'tech_stack': false,
        'development': false,
        'testing': false
      },
      feedback: '',
      actions: [
        {
          title: 'Choose Your Tech Stack',
          description: 'Select the fastest way to build your MVP based on your technical skills.',
          details: [
            {
              title: 'No-Code Options',
              content: `• Bubble.io - Full web app builder\n• Webflow - Landing pages + forms\n• Zapier - Automate workflows\n• Stripe - Payment processing\n• Airtable - Database backend`
            },
            {
              title: 'Low-Code Options',
              content: `• React + Firebase - Quick development\n• Next.js + Vercel - Modern web apps\n• Flutter - Cross-platform mobile\n• Shopify - E-commerce solutions`
            }
          ]
        },
        {
          title: 'Build Timeline',
          description: 'Set realistic timelines for your MVP development.',
          details: [
            {
              title: '2-Week Sprint',
              content: `Week 1: Core functionality\nWeek 2: User interface + payment integration\nWeek 3: Testing + bug fixes\nWeek 4: Launch + customer feedback`
            }
          ]
        }
      ]
    },
    {
      key: 'launch',
      title: 'Launch and Test',
      description: `Get your MVP in front of ${customerName} and start collecting real feedback and revenue.`,
      status: 'pending',
      progress: {
        'beta_launch': false,
        'feedback_collection': false,
        'iteration': false
      },
      feedback: '',
      actions: [
        {
          title: 'Soft Launch Strategy',
          description: 'Start with a small group of customers to test and iterate.',
          details: [
            {
              title: 'Launch Steps',
              content: `1. Invite 10-20 beta customers from your interviews\n2. Offer 50% discount for early feedback\n3. Monitor usage and collect feedback daily\n4. Iterate based on customer input\n5. Expand to broader audience`
            }
          ]
        },
        {
          title: 'Feedback Collection',
          description: 'Set up systems to collect and analyze customer feedback.',
          details: [
            {
              title: 'Feedback Channels',
              content: `• In-app feedback forms\n• Weekly customer calls\n• Usage analytics (Google Analytics, Mixpanel)\n• Email surveys\n• Social media monitoring`
            }
          ]
        }
      ]
    }
  ];
}

function generateMvpReport(businessPlan: BusinessPlan, mvpSteps: MvpStep[], userProgress: UserProgress): string {
  const completedSteps = mvpSteps.filter(step => userProgress[step.key]?.status === 'completed');
  const skippedSteps = mvpSteps.filter(step => userProgress[step.key]?.status === 'skipped');
  
  const report = `
# MVP Development Plan for ${businessPlan.title}

## Executive Summary
${businessPlan.summary}

## Target Customer
**${businessPlan.customer.title}**: ${businessPlan.customer.description}

## Core Problem
${businessPlan.problem.description}

## MVP Solution
${businessPlan.solution.description}

## Unique Value Proposition
${businessPlan.solution.uniqueValue}

## Progress Summary
- ✅ Completed Steps: ${completedSteps.length}/${mvpSteps.length}
- ⏭️ Skipped Steps: ${skippedSteps.length}/${mvpSteps.length}
- 📊 Completion Rate: ${Math.round((completedSteps.length / mvpSteps.length) * 100)}%

## MVP Development Roadmap

${mvpSteps.map(step => {
  const progress = userProgress[step.key];
  const status = progress?.status || 'pending';
  const statusIcon = status === 'completed' ? '✅' : status === 'skipped' ? '⏭️' : '⏳';
  
  return `
### ${statusIcon} ${step.title}
${step.description}

${progress?.feedback ? `**Your Notes:** ${progress.feedback}\n` : ''}

${step.actions.map(action => `
#### ${action.title}
${action.description}

${action.details?.map(detail => `
**${detail.title}**
${detail.content}
`).join('\n') || ''}
`).join('\n')}
`;
}).join('\n')}

## Success Metrics
- 10+ paying customers within 30 days
- 70%+ customer satisfaction score
- Clear feedback on what to improve
- Validation of core assumptions

## Next Steps
${completedSteps.length === mvpSteps.length ? 
  '🎉 All steps completed! Focus on executing your MVP plan and iterating based on customer feedback.' :
  'Continue with the remaining steps in your MVP development plan.'
}

## Timeline
- Week 1-2: Customer validation
- Week 3-6: MVP development
- Week 7-8: Beta launch and testing
- Week 9-12: Iteration and scaling

---
Generated by ToolThinker MVP Builder
Date: ${new Date().toLocaleDateString()}
Progress: ${completedSteps.length}/${mvpSteps.length} steps completed
  `;

  return report;
}

export function MvpBuilderPage() {
  const navigate = useNavigate();
  const { planId } = useParams<{ planId: string }>();
  const [currentStep, setCurrentStep] = useState(0);
  const [businessPlan, setBusinessPlan] = useState<BusinessPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mvpSteps, setMvpSteps] = useState<MvpStep[]>([]);
  const [userProgress, setUserProgress] = useState<UserProgress>({});
  const [completed, setCompleted] = useState(false);
  const [showReport, setShowReport] = useState(false);

  // Fetch business plan data
  useEffect(() => {
    async function fetchBusinessPlan() {
      if (!planId) {
        setError('No business plan ID provided');
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`/api/business-plan/${planId}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch business plan');
        }

        const planData = await response.json();
        setBusinessPlan(planData);
        
        // Generate MVP steps based on business plan
        const steps = generateMvpSteps(planData);
        setMvpSteps(steps);
        
        // Load existing progress if available
        if (planData.mvp) {
          setUserProgress(planData.mvp.userProgress || {});
          if (planData.mvp.isComplete) {
            setCompleted(true);
          }
        }
      } catch (err: any) {
        setError(err.message || 'Failed to load business plan');
      } finally {
        setLoading(false);
      }
    }

    fetchBusinessPlan();
  }, [planId]);

  function handleProgressChange(stepKey: string, itemKey: string, checked: boolean) {
    setUserProgress(prev => ({
      ...prev,
      [stepKey]: {
        ...prev[stepKey],
        progress: {
          ...prev[stepKey]?.progress,
          [itemKey]: checked
        }
      }
    }));
  }

  function handleFeedbackChange(stepKey: string, feedback: string) {
    setUserProgress(prev => ({
      ...prev,
      [stepKey]: {
        ...prev[stepKey],
        feedback
      }
    }));
  }

  function handleStepComplete(stepKey: string) {
    const currentStatus = userProgress[stepKey]?.status;
    const newStatus = currentStatus === 'completed' ? 'pending' : 'completed';
    const updatedProgress = {
      ...userProgress,
      [stepKey]: {
        ...userProgress[stepKey],
        status: newStatus as 'pending' | 'completed' | 'skipped',
        completedAt: newStatus === 'completed' ? new Date() : undefined,
      }
    };
    setUserProgress(updatedProgress);
    saveMvpData(false, updatedProgress);
  }

  function handleStepSkip(stepKey: string) {
    const currentStatus = userProgress[stepKey]?.status;
    const newStatus = currentStatus === 'skipped' ? 'pending' : 'skipped';
    const updatedProgress = {
      ...userProgress,
      [stepKey]: {
        ...userProgress[stepKey],
        status: newStatus as 'pending' | 'completed' | 'skipped',
        completedAt: newStatus === 'skipped' ? new Date() : undefined,
      }
    };
    setUserProgress(updatedProgress);
    saveMvpData(false, updatedProgress);
  }

  function handleNext() {
    if (currentStep < mvpSteps.length - 1) {
      setCurrentStep(s => s + 1);
    } else {
      setCompleted(true);
    }
  }

  function handleBack() {
    if (currentStep > 0) setCurrentStep(s => s - 1);
    else navigate(-1);
  }

  function handleMarkComplete() {
    // Mark all steps as completed
    const completedProgress = { ...userProgress };
    mvpSteps.forEach(step => {
      completedProgress[step.key] = {
        ...completedProgress[step.key],
        status: 'completed' as const,
        completedAt: new Date(),
        progress: Object.keys(step.progress).reduce((acc, key) => {
          acc[key] = true;
          return acc;
        }, {} as { [key: string]: boolean })
      };
    });
    setUserProgress(completedProgress);

    // Save as complete to backend and navigate to roadmap
    saveMvpData(true, completedProgress).then(() => {
      setCompleted(true);
      navigate(`/next-steps-hub/${planId}`);
    });
  }

  function handleToggleComplete() {
    if (businessPlan?.mvp?.isComplete ||
      (userProgress && mvpSteps.every(step => userProgress[step.key]?.status === 'completed'))) {
      // Un-complete: set all steps to 'pending' and isComplete to false
      const resetProgress: UserProgress = {};
      mvpSteps.forEach(step => {
        resetProgress[step.key] = {
          ...userProgress[step.key],
          status: 'pending',
          completedAt: undefined,
          progress: Object.keys(step.progress).reduce((acc, key) => {
            acc[key] = false;
            return acc;
          }, {} as { [key: string]: boolean })
        };
      });
      setUserProgress(resetProgress);
      saveMvpData(false, resetProgress).then(() => {
        setCompleted(false);
        // Optionally, show a toast/notification
      });
    } else {
      // Complete as before
      handleMarkComplete();
    }
  }

  async function saveMvpData(isComplete: boolean, progressOverride?: UserProgress) {
    if (!planId) return;
    const mvpDataToSave = {
      problem: businessPlan?.problem?.description || '',
      solution: businessPlan?.solution?.description || '',
      assumptions: 'Validated through customer interviews and landing page tests',
      test: 'MVP launched with beta customers for feedback and iteration',
      userProgress: progressOverride || userProgress,
      isComplete
    };
    await fetch(`/api/business-plan/${planId}/mvp`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({
        mvpData: mvpDataToSave,
        isComplete
      })
    });
  }

  function downloadReport() {
    if (!businessPlan || !mvpSteps) return;
    
    const report = generateMvpReport(businessPlan, mvpSteps, userProgress);
    const blob = new Blob([report], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `MVP-Plan-${businessPlan.title.replace(/[^a-z0-9]/gi, '-').toLowerCase()}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  if (loading) {
    return (
      <PageContainer>
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          <div>Loading your business idea...</div>
        </div>
      </PageContainer>
    );
  }

  if (error) {
    return (
      <PageContainer>
        <div style={{ textAlign: 'center', padding: '2rem', color: '#dc3545' }}>
          <div>Error: {error}</div>
          <SecondaryButton onClick={() => navigate(-1)} style={{ marginTop: '1rem' }}>
            Go Back
          </SecondaryButton>
        </div>
      </PageContainer>
    );
  }

  if (!businessPlan || !mvpSteps.length) {
    return (
      <PageContainer>
        <div style={{ textAlign: 'center', padding: '2rem', color: '#dc3545' }}>
          <div>Unable to generate MVP plan. Please check your business idea data.</div>
          <SecondaryButton onClick={() => navigate(-1)} style={{ marginTop: '1rem' }}>
            Go Back
          </SecondaryButton>
        </div>
      </PageContainer>
    );
  }

  const currentMvpStep = mvpSteps[currentStep];
  const currentProgress = userProgress[currentMvpStep.key];
  const progressItems = Object.entries(currentMvpStep.progress);

  const isMvpComplete = businessPlan?.mvp?.isComplete ||
    (userProgress && mvpSteps.every(step => userProgress[step.key]?.status === 'completed'));

  if (showReport) {
    const report = generateMvpReport(businessPlan, mvpSteps, userProgress);
    
    return (
      <PageContainer>
        <h1 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '1.5rem', textAlign: 'center' }}>
          Your MVP Development Report
        </h1>
        
        <ReportSection>
          <ReportTitle>📋 Complete MVP Development Plan</ReportTitle>
          <ReportContent>{report}</ReportContent>
        </ReportSection>
        
        <ButtonRow>
          <SecondaryButton onClick={() => setShowReport(false)}>
            Back to MVP Builder
          </SecondaryButton>
          <DownloadButton onClick={downloadReport}>
            📥 Download Report
          </DownloadButton>
          <Button onClick={() => navigate(-1)}>
            Return to Roadmap
          </Button>
        </ButtonRow>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <h1 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '1.5rem', textAlign: 'center' }}>
        Your MVP Development Plan
      </h1>
      
      {businessPlan && (
        <StepCard style={{ marginBottom: '1.5rem' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '0.5rem', color: '#181a1b' }}>
            Based on: {businessPlan.title}
          </h3>
          <p style={{ color: '#666', fontSize: '0.9rem', margin: 0 }}>
            {businessPlan.summary}
          </p>
        </StepCard>
      )}

      {!completed ? (
        <>
          <ProgressBar percent={((currentStep + 1) / mvpSteps.length) * 100} />
          <StepCard>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <StepTitle>{currentMvpStep.title}</StepTitle>
              <StatusBadge status={currentProgress?.status || 'pending'}>
                {currentProgress?.status || 'pending'}
              </StatusBadge>
            </div>
            <StepDescription>{currentMvpStep.description}</StepDescription>
            
            {currentMvpStep.actions.map((action, index) => (
              <ActionItem key={index}>
                <ActionTitle>{action.title}</ActionTitle>
                <ActionDescription>{action.description}</ActionDescription>
                {action.details && (
                  <ActionDetails>
                    {action.details.map((detail, detailIndex) => (
                      <div key={detailIndex}>
                        <DetailTitle>{detail.title}</DetailTitle>
                        <DetailText style={{ whiteSpace: 'pre-line' }}>{detail.content}</DetailText>
                      </div>
                    ))}
                  </ActionDetails>
                )}
              </ActionItem>
            ))}
            
            <ProgressSection>
              <ProgressTitle>Track Your Progress</ProgressTitle>
              {progressItems.map(([key, defaultChecked]) => (
                <ProgressItem key={key}>
                  <Checkbox
                    type="checkbox"
                    id={key}
                    checked={currentProgress?.progress?.[key] || false}
                    onChange={(e) => handleProgressChange(currentMvpStep.key, key, e.target.checked)}
                  />
                  <ProgressLabel htmlFor={key}>
                    {key.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                  </ProgressLabel>
                </ProgressItem>
              ))}
            </ProgressSection>
            
            <FeedbackSection>
              <FeedbackTitle>Your Notes & Insights</FeedbackTitle>
              <TextArea
                placeholder="Share what you've learned, challenges you've faced, or insights you've gained from this step..."
                value={currentProgress?.feedback || ''}
                onChange={(e) => handleFeedbackChange(currentMvpStep.key, e.target.value)}
              />
            </FeedbackSection>
            
            <ButtonRow>
              <SecondaryButton onClick={handleBack}>
                Back
              </SecondaryButton>
              <SkipButton onClick={() => handleStepSkip(currentMvpStep.key)}>
                {currentProgress?.status === 'skipped' ? 'Undo Skip' : 'Skip This Step'}
              </SkipButton>
              <CompleteButton onClick={() => handleStepComplete(currentMvpStep.key)}>
                {currentProgress?.status === 'completed' ? 'Mark as Incomplete' : 'Mark Complete'}
              </CompleteButton>
              <Button onClick={handleNext}>
                {currentStep < mvpSteps.length - 1 ? 'Next Step' : 'Complete MVP Plan'}
              </Button>
            </ButtonRow>
          </StepCard>
        </>
      ) : (
        <div style={{ textAlign: 'center', margin: '2rem 0' }}>
          <h2 style={{ color: '#28a745', marginBottom: '1rem' }}>🎉 MVP Plan Complete!</h2>
          <p style={{ color: '#444', marginBottom: '2rem' }}>
            You now have a comprehensive MVP development plan tailored to your business idea.
          </p>
          
          <ButtonRow>
            <SecondaryButton onClick={() => setShowReport(true)}>
              📋 View Complete Report
            </SecondaryButton>
            <DownloadButton onClick={downloadReport}>
              📥 Download Report
            </DownloadButton>
            <Button onClick={() => navigate(-1)}>
              Return to Roadmap
            </Button>
            <Button onClick={handleToggleComplete}>
              {isMvpComplete ? 'Mark as Incomplete' : 'Mark as Complete'}
            </Button>
          </ButtonRow>
        </div>
      )}
    </PageContainer>
  );
} 