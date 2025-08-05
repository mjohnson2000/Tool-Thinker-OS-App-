import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { fetchChatGPT } from '../../utils/chatgpt';

export interface PrematureJobOption {
  id: string;
  title: string;
  description: string;
  icon: string;
  problemStatement: string;
}

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
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
  font-size: 2.4rem;
  font-weight: 800;
  margin-bottom: 1.2rem;
  text-align: center;
  color: var(--text-primary);
  letter-spacing: -0.03em;
  background: linear-gradient(135deg, #181a1b 0%, #4a4a4a 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  position: relative;
  
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

const JobGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.5rem;
  width: 100%;
  max-width: 700px;
  margin-top: 2rem;
`;

const JobCard = styled.button<{ isSelected: boolean }>`
  background: ${props => props.isSelected 
    ? 'linear-gradient(135deg, #181a1b 0%, #2d2d2d 100%)' 
    : 'linear-gradient(135deg, #ffffff 0%, #fafbfc 100%)'};
  color: ${props => props.isSelected ? '#ffffff' : 'var(--text-primary)'};
  border: 2px solid ${props => props.isSelected ? '#181a1b' : '#E5E5E5'};
  border-radius: 16px;
  padding: 1.5rem;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  text-align: left;
  outline: none;
  position: relative;
  overflow: hidden;
  
  &:hover:not(:disabled) {
    border-color: #181a1b;
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(24, 26, 27, 0.15);
  }
  
  &:focus {
    outline: none;
    box-shadow: 0 0 0 3px rgba(24, 26, 27, 0.1);
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 3px;
    background: linear-gradient(90deg, #181a1b, #4a4a4a, #181a1b);
    opacity: ${props => props.isSelected ? '1' : '0'};
    transition: opacity 0.3s ease;
  }
`;

const JobIcon = styled.div`
  font-size: 2rem;
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const JobTitle = styled.h3`
  font-size: 1.2rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
  line-height: 1.3;
`;

const JobDescription = styled.p`
  font-size: 0.95rem;
  line-height: 1.5;
  margin-bottom: 1rem;
  opacity: 0.9;
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

const LoadingSpinner = styled.div`
  display: inline-block;
  width: 20px;
  height: 20px;
  border: 2px solid rgba(24, 26, 27, 0.3);
  border-radius: 50%;
  border-top-color: #181a1b;
  animation: spin 1s ease-in-out infinite;
  margin-right: 0.5rem;
  
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
`;

const ContinueButton = styled.button`
  background: linear-gradient(135deg, #181a1b 0%, #2d2d2d 100%);
  color: #ffffff;
  border: none;
  border-radius: 12px;
  padding: 1rem 2rem;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 4px 12px rgba(24, 26, 27, 0.15);
  position: relative;
  overflow: hidden;
  letter-spacing: 0.02em;
  margin-top: 2rem;
  
  &:hover:not(:disabled) {
    background: linear-gradient(135deg, #2d2d2d 0%, #181a1b 100%);
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(24, 26, 27, 0.25);
  }
  
  &:focus {
    outline: none;
    box-shadow: 0 0 0 3px rgba(24, 26, 27, 0.2);
  }
  
  &:disabled {
    background: linear-gradient(135deg, #e5e5e5 0%, #d1d5db 100%);
    color: #9ca3af;
    cursor: not-allowed;
    transform: none;
    box-shadow: 0 2px 8px rgba(0,0,0,0.04);
  }
`;

const ClearButton = styled.button`
  background: none;
  border: none;
  color: #6b7280;
  font-size: 0.9rem;
  cursor: pointer;
  text-decoration: underline;
  margin-top: 1rem;
  transition: color 0.2s;
  
  &:hover {
    color: #374151;
  }
`;

interface PrematureJobSelectionProps {
  onSelect: (job: PrematureJobOption) => void;
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

export function PrematureJobSelection({ onSelect, onClear, businessContext }: PrematureJobSelectionProps) {
  const [jobs, setJobs] = useState<PrematureJobOption[]>([]);
  const [selectedJob, setSelectedJob] = useState<PrematureJobOption | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    generateJobs();
  }, [businessContext]);

  async function generateJobs() {
    setIsLoading(true);
    setError(null);

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
          "description": "Brief description of what the customer is trying to accomplish",
          "icon": "relevant emoji",
          "problemStatement": "Clear statement of the problem or struggle customers face when trying to accomplish this job"
        }
      ]

      Make the jobs specific to this business context and diverse in their nature.`;

      const response = await fetchChatGPT(prompt);
      let generatedJobs: PrematureJobOption[] = [];

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
    } catch (error) {
      console.error("Failed to generate jobs:", error);
      setError("Failed to generate job options. Please try again.");
      setJobs(generateFallbackJobs(businessContext?.idea || 'a new business'));
    } finally {
      setIsLoading(false);
    }
  }

  function generateFallbackJobs(context: string): PrematureJobOption[] {
    return [
      {
        id: "job_1",
        title: "Simplify Complex Tasks",
        description: "Customers want to accomplish tasks that are currently too complicated or time-consuming",
        icon: "⚡",
        problemStatement: "The current process is too complex, time-consuming, or requires too much expertise"
      },
      {
        id: "job_2",
        title: "Save Time and Money",
        description: "Customers need to accomplish goals while reducing costs and time investment",
        icon: "💰",
        problemStatement: "Existing solutions are too expensive, slow, or inefficient for their needs"
      },
      {
        id: "job_3",
        title: "Access Better Information",
        description: "Customers need to find, organize, or understand information more effectively",
        icon: "📊",
        problemStatement: "Current information sources are unreliable, outdated, or difficult to navigate"
      },
      {
        id: "job_4",
        title: "Connect with Others",
        description: "Customers want to build relationships, network, or collaborate more effectively",
        icon: "🤝",
        problemStatement: "Existing platforms don't facilitate the right kind of connections or interactions"
      },
      {
        id: "job_5",
        title: "Improve Quality of Life",
        description: "Customers seek solutions that enhance their daily life, health, or well-being",
        icon: "🌟",
        problemStatement: "Current options don't address their specific lifestyle needs or preferences"
      },
      {
        id: "job_6",
        title: "Solve Unique Problems",
        description: "Customers face specific challenges that existing solutions don't address",
        icon: "🎯",
        problemStatement: "Their particular situation or requirements aren't covered by current offerings"
      }
    ];
  }

  function handleSelect(job: PrematureJobOption) {
    setSelectedJob(job);
    setTimeout(() => {
      onSelect(job);
    }, 150);
  }

  if (isLoading) {
    return (
      <Container>
        <Title>Discovering Customer Jobs</Title>
        <Subtitle>
          We're analyzing your business context to identify the most relevant customer jobs and problems.
        </Subtitle>
        <FormCard>
          <div style={{ textAlign: 'center', padding: '2rem' }}>
            <LoadingSpinner />
            Generating job options...
          </div>
        </FormCard>
      </Container>
    );
  }

  if (error) {
    return (
      <Container>
        <Title>Job Discovery</Title>
        <Subtitle>
          Let's identify what jobs your customers are trying to get done and the problems they face.
        </Subtitle>
        <FormCard>
          <div style={{ textAlign: 'center', padding: '2rem' }}>
            <p style={{ color: '#dc3545', marginBottom: '1rem' }}>{error}</p>
            <ContinueButton onClick={generateJobs}>Try Again</ContinueButton>
          </div>
        </FormCard>
      </Container>
    );
  }

  return (
    <Container>
      <Title>What Jobs Are Your Customers Trying to Get Done?</Title>
      <Subtitle>
        Select a job that best represents what your customers are trying to accomplish. This will help us identify the specific problems they face.
      </Subtitle>
      
      <FormCard>
        <JobGrid>
          {jobs.map(job => (
            <JobCard
              key={job.id}
              isSelected={selectedJob?.id === job.id}
              onClick={() => handleSelect(job)}
              aria-pressed={selectedJob?.id === job.id}
              tabIndex={0}
            >
              <JobIcon>{job.icon}</JobIcon>
              <JobTitle>{job.title}</JobTitle>
              <JobDescription>{job.description}</JobDescription>
              <ProblemStatement>
                <strong>Problem:</strong> {job.problemStatement}
              </ProblemStatement>
            </JobCard>
          ))}
        </JobGrid>
        
        {selectedJob && (
          <div style={{ textAlign: 'center', marginTop: '2rem' }}>
            <ContinueButton onClick={() => onSelect(selectedJob)}>
              Continue with "{selectedJob.title}"
            </ContinueButton>
          </div>
                  )}
          
          <ClearButton onClick={() => window.location.reload()}>Refresh Page</ClearButton>
 
        </FormCard>
    </Container>
  );
} 