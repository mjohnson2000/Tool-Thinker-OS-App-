import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { fetchChatGPT } from '../../utils/chatgpt';
import type { CustomerOption } from './CustomerSelection';
import { trackDiscoveryStage } from '../../utils/analytics';

const Container = styled.div`
  max-width: 600px;
  margin: 2rem auto;
  padding: 2rem;
  background: linear-gradient(135deg, #ffffff 0%, #fafbfc 100%);
  border-radius: 20px;
  box-shadow: 
    0 4px 20px rgba(0,0,0,0.08),
    0 1px 3px rgba(0,0,0,0.1);
  border: 1px solid rgba(255,255,255,0.8);
  text-align: center;
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 3px;
    background: linear-gradient(90deg, #181a1b, #4a4a4a, #181a1b);
    border-radius: 20px 20px 0 0;
  }
  
  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(135deg, rgba(255,255,255,0.1) 0%, transparent 100%);
    pointer-events: none;
  }
`;

const Title = styled.h2`
  font-family: 'Audiowide', 'Courier New', monospace;
  font-size: 2.4rem;
  font-weight: 400;
  margin-bottom: 1.2rem;
  text-align: center;
  color: var(--text-primary);
  letter-spacing: -0.03em;
  background: linear-gradient(135deg, #181a1b 0%, #4a4a4a 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  position: relative;
  font-display: swap;
  
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

const Subtitle = styled.p`
  color: var(--text-secondary);
  margin-bottom: 2rem;
  text-align: center;
  font-size: 1.15rem;
  line-height: 1.6;
  max-width: 550px;
  font-weight: 400;
  opacity: 0.9;
`;

const Options = styled.div`
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
  justify-content: center;
`;

const OptionCard = styled.button<{ isSelected: boolean }>`
  background: #fff;
  border: 2px solid ${props => props.isSelected ? '#181a1b' : '#E5E5E5'};
  border-radius: 12px;
  padding: 1.5rem 1rem;
  margin-bottom: 1rem;
  cursor: pointer;
  outline: none;
  transition: border 0.2s, box-shadow 0.2s;
  &:hover, &:focus {
    border: 2px solid #181a1b;
    box-shadow: 0 4px 12px rgba(0,0,0,0.10);
  }
`;

const TextArea = styled.textarea`
  width: 100%;
  height: 120px;
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

const JobGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 1.5rem;
  width: 100%;
  max-width: 700px;
`;

const JobCard = styled.button<{ isSelected: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  background: ${props => props.isSelected ? 'linear-gradient(135deg, #f0f0f0 0%, #e8e8e8 100%)' : 'linear-gradient(135deg, #ffffff 0%, #fafbfc 100%)'};
  border: 2px solid ${props => props.isSelected ? '#181a1b' : '#E5E5E5'};
  border-radius: 16px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.06);
  padding: 1.8rem 1.5rem;
  cursor: pointer;
  outline: none;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 3px;
    background: ${props => props.isSelected ? 'linear-gradient(90deg, #181a1b, #4a4a4a)' : 'transparent'};
    border-radius: 16px 16px 0 0;
  }
  
  &:hover, &:focus {
    border: 2px solid #181a1b;
    background: linear-gradient(135deg, #f8f9fa 0%, #f1f3f4 100%);
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(0,0,0,0.12);
  }
`;

const JobIcon = styled.div`
  font-size: 2.5rem;
  margin-bottom: 1rem;
  width: 80px;
  height: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  border-radius: 50%;
  border: 2px solid #f1f3f4;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  
  ${JobCard}:hover & {
    transform: scale(1.1);
    background: linear-gradient(135deg, #e9ecef 0%, #dee2e6 100%);
    border-color: #ced4da;
  }
`;

const JobTitle = styled.h3`
  font-family: 'Audiowide', 'Courier New', monospace;
  font-weight: 400;
  font-size: 1.2rem;
  margin-bottom: 0.6rem;
  letter-spacing: -0.01em;
  color: var(--text-primary);
  font-display: swap;
`;

const JobDescription = styled.p`
  color: var(--text-secondary);
  font-size: 0.95rem;
  line-height: 1.4;
  text-align: center;
  font-weight: 400;
`;

const ProblemStatement = styled.div`
  background: #f8f9fa;
  border-left: 3px solid #181a1b;
  padding: 0.75rem;
  border-radius: 8px;
  margin-top: 1rem;
  font-size: 0.9rem;
  line-height: 1.4;
  font-style: italic;
`;

const BackButton = styled.button`
  background: none;
  border: none;
  color: #6b7280;
  font-size: 0.9rem;
  cursor: pointer;
  text-decoration: underline;
  margin-bottom: 1rem;
  transition: color 0.2s;
  
  &:hover {
    color: #374151;
  }
`;

const LoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem 2rem;
  text-align: center;
`;

const ProgressBarContainer = styled.div`
  width: 100%;
  max-width: 400px;
  height: 8px;
  background: #e5e5e5;
  border-radius: 4px;
  margin: 2rem auto 1.5rem auto;
  overflow: hidden;
`;

const ProgressBarFill = styled.div<{ percent: number }>`
  height: 100%;
  background: #181a1b;
  width: ${({ percent }) => percent}%;
  transition: width 0.4s cubic-bezier(0.4, 0, 0.2, 1);
`;

const LoadingText = styled.p`
  color: var(--text-secondary);
  font-size: 1rem;
  margin: 0;
`;

const SubmitButton = styled.button`
  background: #181a1b;
  color: #fff;
  border: none;
  border-radius: 8px;
  padding: 0.75rem 1.5rem;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s;
  &:hover {
    background: #000;
  }
  &:disabled {
    background: #ccc;
    cursor: not-allowed;
  }
`;

const ClearButton = styled.button`
  background: transparent;
  border: 2px solid #e5e5e5;
  color: var(--text-secondary);
  padding: 0.75rem 1.5rem;
  border-radius: 12px;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  margin-top: 2rem;
  
  &:hover {
    border-color: #181a1b;
    color: var(--text-primary);
    background: #f8f9fa;
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
`;

const PrimaryButton = styled.button`
  background: #181a1b;
  color: #fff;
  border: none;
  border-radius: 8px;
  padding: 0.75rem 1.5rem;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s;
  &:hover {
    background: #000;
  }
  &:disabled {
    background: #ccc;
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

interface JobOption {
  id: string;
  title: string;
  description: string;
  icon: string;
  problemStatement: string;
}

interface DescribeProblemProps {
  onSubmit: (problemDescription: string | null) => void;
  customer: CustomerOption | null;
  initialValue?: string | null;
  onClear: () => void;
  businessContext?: {
    idea?: string;
    businessArea?: string;
    interests?: string;
    ideaType?: string;
    location?: { city: string; region: string; country: string; operatingModel?: string } | null;
    scheduleGoals?: { hoursPerWeek: number; incomeTarget: number } | null;
  };
}

export function DescribeProblem({ onSubmit, customer, initialValue = null, onClear, businessContext }: DescribeProblemProps) {
  const [knowsProblem, setKnowsProblem] = useState<boolean | null>(initialValue ? true : null);
  const [description, setDescription] = useState(initialValue || '');
  const [isLoading, setIsLoading] = useState(false);
  const [improvedDescription, setImprovedDescription] = useState<string | null>(null);
  const [showRejectionMessage, setShowRejectionMessage] = useState(false);
  const [showJobSelection, setShowJobSelection] = useState(false);
  const [jobs, setJobs] = useState<JobOption[]>([]);
  const [selectedJob, setSelectedJob] = useState<JobOption | null>(null);
  const [isGeneratingJobs, setIsGeneratingJobs] = useState(false);
  const [progress, setProgress] = useState(0);

  // Update local state when initialValue prop changes
  useEffect(() => {
    console.log('DescribeProblem useEffect triggered, initialValue:', initialValue);
    setDescription(initialValue || '');
    setKnowsProblem(initialValue ? true : null);
    // Also clear any improvement suggestions when clearing
    if (initialValue === null || initialValue === '') {
      setImprovedDescription(null);
      setShowRejectionMessage(false);
      setShowJobSelection(false);
      setJobs([]);
      setSelectedJob(null);
    }
  }, [initialValue]);

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

  async function generateJobs() {
    setIsGeneratingJobs(true);
    setProgress(0);
    
    // Animate progress bar to 90% while loading
    const progressInterval = setInterval(() => {
      setProgress(prev => (prev < 90 ? prev + 5 : 90));
    }, 200);
    
    try {
      const context = businessContext?.idea || businessContext?.businessArea || businessContext?.interests || 'a new business';
      const ideaType = businessContext?.ideaType || 'business';
      
      const prompt = `Based on this ${ideaType} business context: "${context}", generate 6 different jobs that customers might be trying to get done. For each job, also provide a clear problem statement that customers face when trying to accomplish this job.

      Consider jobs that are:
      - Relevant to this business type
      - Common pain points
      - Different customer segments
      - Various complexity levels
      - Both functional and emotional needs

      Return the response as a JSON array with this exact structure:
      [
        {
          "id": "job_1",
          "title": "Job Title",
          "description": "Concise 12-15 word description of what the customer is trying to accomplish",
          "icon": "relevant emoji",
          "problemStatement": "Clear statement of the problem or struggle customers face when trying to accomplish this job"
        }
      ]

      Make the jobs specific to this business context and diverse in their nature. Keep descriptions concise but informative, around 12-15 words.`;

      const response = await fetchChatGPT(prompt);
      let generatedJobs: JobOption[] = [];

      if (typeof response === 'string') {
        try {
          generatedJobs = JSON.parse(response);
        } catch (e) {
          console.error("Failed to parse jobs JSON:", e);
          generatedJobs = generateFallbackJobs(context);
        }
      } else if (Array.isArray(response)) {
        generatedJobs = response;
      } else {
        generatedJobs = generateFallbackJobs(context);
      }

      // Ensure we have exactly 6 jobs
      if (generatedJobs.length > 6) {
        generatedJobs = generatedJobs.slice(0, 6);
      } else if (generatedJobs.length < 6) {
        const fallbackJobs = generateFallbackJobs(context);
        generatedJobs = [...generatedJobs, ...fallbackJobs.slice(0, 6 - generatedJobs.length)];
      }

      setJobs(generatedJobs);
      setProgress(100);
    } catch (error) {
      console.error("Failed to generate jobs:", error);
      setJobs(generateFallbackJobs(businessContext?.idea || 'a new business'));
      setProgress(100);
    } finally {
      setIsGeneratingJobs(false);
      clearInterval(progressInterval);
      setTimeout(() => setProgress(0), 800);
    }
  }

  function generateFallbackJobs(context: string): JobOption[] {
    return [
      {
        id: "job_1",
        title: "Simplify Complex Tasks",
        description: "Customers want to accomplish tasks that are currently too complicated or time-consuming for their needs",
        icon: "⚡",
        problemStatement: "The current process is too complex, time-consuming, or requires too much expertise"
      },
      {
        id: "job_2",
        title: "Save Time and Money",
        description: "Customers need to accomplish goals while reducing costs and time investment in their daily activities",
        icon: "💰",
        problemStatement: "Existing solutions are too expensive, slow, or inefficient for their needs"
      },
      {
        id: "job_3",
        title: "Access Better Information",
        description: "Customers need to find, organize, or understand information more effectively than current methods allow",
        icon: "📊",
        problemStatement: "Current information sources are unreliable, outdated, or difficult to navigate"
      },
      {
        id: "job_4",
        title: "Connect with Others",
        description: "Customers want to build relationships, network, or collaborate more effectively than existing platforms",
        icon: "🤝",
        problemStatement: "Existing platforms don't facilitate the right kind of connections or interactions"
      },
      {
        id: "job_5",
        title: "Improve Quality of Life",
        description: "Customers seek solutions that enhance their daily life, health, or well-being in meaningful ways",
        icon: "🌟",
        problemStatement: "Current options don't address their specific lifestyle needs or preferences"
      },
      {
        id: "job_6",
        title: "Solve Unique Problems",
        description: "Customers face specific challenges that existing solutions don't address in their particular situation",
        icon: "🎯",
        problemStatement: "Their particular situation or requirements aren't covered by current offerings"
      }
    ];
  }

  const handleSelect = (knows: boolean) => {
    setKnowsProblem(knows);
    if (!knows) {
      // Show job selection for premature path
      setShowJobSelection(true);
      generateJobs();
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
      // Track problem description completion
      trackDiscoveryStage('problem_description');
      onSubmit(description);
    } else {
      setImprovedDescription(assessment.improved_idea);
    }
  };

  const handleAccept = () => {
    if (improvedDescription) {
      // Track problem description completion with improvement
      trackDiscoveryStage('problem_description_improved');
      onSubmit(improvedDescription);
    }
  };

  const handleReject = () => {
    setImprovedDescription(null);
    setShowRejectionMessage(true);
  };

  const handleJobSelect = (job: JobOption) => {
    setSelectedJob(job);
    setTimeout(() => {
      onSubmit(job.problemStatement);
    }, 150);
  };

  const handleBackToProblem = () => {
    setShowJobSelection(false);
    setSelectedJob(null);
    setJobs([]);
    setKnowsProblem(null);
  };

  return (
    <>
      {!showJobSelection ? (
        <>
          <Title>
            {businessContext?.ideaType 
              ? `What is your customer struggling to achieve with your ${businessContext.ideaType.toLowerCase()} business?`
              : 'What is your customer struggling to achieve?'
            }
          </Title>
          <Container>
            <Options>
              <OptionCard isSelected={knowsProblem === true} onClick={() => handleSelect(true)}>
                I can describe the struggle
              </OptionCard>
              <OptionCard isSelected={knowsProblem === false} onClick={() => handleSelect(false)}>
                I'm not sure
              </OptionCard>
            </Options>

            {knowsProblem === true && (
              <>
                <TextArea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe the task your customer is trying to accomplish and what makes it difficult for them. Think about the functional and emotional aspects of their struggle."
                />
                <SubmitButton onClick={handleSubmit} disabled={!description.trim() || isLoading}>
                  {isLoading ? 'Assessing...' : 'Continue'}
                </SubmitButton>
                <div style={{ marginTop: '1rem' }}>
                  <ClearButton onClick={() => window.location.reload()}>Refresh Page</ClearButton>
                </div>

              </>
            )}

            {improvedDescription && (
              <ImprovementContainer>
                <ImprovementHeader>Suggestion for Improvement:</ImprovementHeader>
                <p>{improvedDescription}</p>
                <ButtonGroup>
                  <PrimaryButton onClick={handleAccept} disabled={isLoading} style={{ marginRight: '1rem' }}>Accept</PrimaryButton>
                  <SecondaryButton 
                    onClick={handleReject}
                    disabled={isLoading}
                  >
                    Reject
                  </SecondaryButton>
                </ButtonGroup>
              </ImprovementContainer>
            )}

            {showRejectionMessage && (
              <RejectionMessage>
                Please provide a more specific problem description and try again.
              </RejectionMessage>
            )}
          </Container>
        </>
      ) : (
        <>
          <BackButton onClick={handleBackToProblem}>
            ← Back to problem options
          </BackButton>
          
          <Title>What Jobs Are Your Customers Trying to Get Done?</Title>
          <Subtitle>
            Select a job that best represents what your customers are trying to accomplish. This will help us identify the specific problems they face.
          </Subtitle>
          
          <Container>
            {isGeneratingJobs ? (
              <LoadingContainer>
                <ProgressBarContainer>
                  <ProgressBarFill percent={progress} />
                </ProgressBarContainer>
                <LoadingText>Generating job options...</LoadingText>
              </LoadingContainer>
            ) : (
              <JobGrid>
                {jobs.map(job => (
                  <JobCard
                    key={job.id}
                    isSelected={selectedJob?.id === job.id}
                    onClick={() => handleJobSelect(job)}
                    aria-pressed={selectedJob?.id === job.id}
                    tabIndex={0}
                  >
                    <JobIcon>{job.icon}</JobIcon>
                    <JobTitle>{job.title}</JobTitle>
                    <JobDescription>{job.description}</JobDescription>
                  </JobCard>
                ))}
              </JobGrid>
            )}
          </Container>
        </>
      )}
    </>
  );
} 