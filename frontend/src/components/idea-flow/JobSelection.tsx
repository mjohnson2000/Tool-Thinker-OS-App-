import React from 'react';
import styled from 'styled-components';
import { fetchChatGPT } from '../../utils/chatgpt';

export interface JobOption {
  id: string;
  title: string;
  description: string;
  icon: string;
}

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const Title = styled.h2`
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 1.5rem;
`;

const Subtitle = styled.p`
  color: var(--text-secondary);
  margin-bottom: 2rem;
`;

const JobGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 1.5rem;
  width: 100%;
  max-width: 700px;
`;

const OptionCard = styled.button<{ isSelected: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  background: #fff;
  border: 2px solid ${props => props.isSelected ? '#181a1b' : '#E5E5E5'};
  border-radius: 16px;
  box-shadow: var(--shadow);
  padding: 2rem 1.5rem;
  cursor: pointer;
  outline: none;
  transition: border 0.2s, box-shadow 0.2s;
  &:hover, &:focus {
    border: 2px solid #181a1b;
    box-shadow: 0 6px 18px rgba(0,0,0,0.12);
  }
`;

const Icon = styled.div`
  font-size: 2.5rem;
  margin-bottom: 1rem;
`;

const JobTitle = styled.div`
  font-weight: 600;
  font-size: 1.1rem;
  margin-bottom: 0.5rem;
`;

const JobDescription = styled.div`
  color: var(--text-secondary);
  font-size: 0.95rem;
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

// Function to generate better fallback jobs based on customer type and business area
function generateFallbackJobs(customer: any, businessArea: any, startIndex: number) {
  const fallbackJobs = [];
  
  // Common job types for different customer types
  const jobTemplates = {
    'Busy Professionals': [
      { title: 'Time Management', description: 'Help busy professionals optimize their schedule and productivity', icon: '⏰' },
      { title: 'Stress Relief', description: 'Provide services that help reduce work-related stress', icon: '🧘' },
      { title: 'Skill Development', description: 'Help professionals learn new skills efficiently', icon: '📚' },
      { title: 'Networking', description: 'Connect professionals with valuable contacts and opportunities', icon: '🤝' },
      { title: 'Work-Life Balance', description: 'Help professionals maintain healthy work-life boundaries', icon: '⚖️' }
    ],
    'Parents': [
      { title: 'Childcare Support', description: 'Help parents with childcare and family management', icon: '👶' },
      { title: 'Meal Planning', description: 'Help parents plan and prepare healthy family meals', icon: '🍽️' },
      { title: 'Family Organization', description: 'Help parents organize family schedules and activities', icon: '📅' },
      { title: 'Parenting Guidance', description: 'Provide advice and support for parenting challenges', icon: '👨‍👩‍👧‍👦' },
      { title: 'Family Wellness', description: 'Help families maintain health and wellness routines', icon: '💪' }
    ],
    'Students': [
      { title: 'Study Skills', description: 'Help students improve their learning and study techniques', icon: '📖' },
      { title: 'Career Guidance', description: 'Help students plan their career path and goals', icon: '🎯' },
      { title: 'Time Management', description: 'Help students balance academics and personal life', icon: '⏰' },
      { title: 'Skill Building', description: 'Help students develop practical skills for their future', icon: '🔧' },
      { title: 'Academic Support', description: 'Provide tutoring and academic assistance', icon: '🎓' }
    ],
    'Small Business Owners': [
      { title: 'Business Growth', description: 'Help small businesses expand and increase revenue', icon: '📈' },
      { title: 'Marketing Support', description: 'Help businesses improve their marketing strategies', icon: '📢' },
      { title: 'Financial Management', description: 'Help businesses manage finances and cash flow', icon: '💰' },
      { title: 'Customer Service', description: 'Help businesses improve customer satisfaction', icon: '😊' },
      { title: 'Operational Efficiency', description: 'Help businesses streamline their operations', icon: '⚙️' }
    ],
    'Health-Conscious': [
      { title: 'Fitness Coaching', description: 'Help people achieve their fitness and health goals', icon: '💪' },
      { title: 'Nutrition Guidance', description: 'Help people improve their diet and nutrition', icon: '🥗' },
      { title: 'Mental Wellness', description: 'Help people maintain mental health and mindfulness', icon: '🧘' },
      { title: 'Lifestyle Coaching', description: 'Help people adopt healthier lifestyle habits', icon: '🌱' },
      { title: 'Wellness Planning', description: 'Help people create personalized wellness routines', icon: '🏃' }
    ]
  };

  // Get the appropriate job templates for this customer type
  const templates = jobTemplates[customer.title as keyof typeof jobTemplates] || jobTemplates['Busy Professionals'];
  
  // Create fallback jobs starting from the given index
  for (let i = 0; i < 5 - startIndex; i++) {
    const template = templates[i] || templates[0];
    fallbackJobs.push({
      id: `fallback-${startIndex + i + 1}`,
      title: template.title,
      description: template.description,
      icon: template.icon
    });
  }
  
  return fallbackJobs;
}

export interface JobSelectionProps {
  onSelect: (job: JobOption) => void;
  customer: { title: string; description: string; icon: string } | null;
  interests?: string; // Add interests prop
  businessArea?: { title: string; description: string; icon: string } | null; // Add business area prop
  location?: { city: string; region: string; country: string } | null;
  scheduleGoals?: { hoursPerWeek: number; incomeTarget: number } | null;
}

export function JobSelection({ onSelect, customer, interests, businessArea, location, scheduleGoals }: JobSelectionProps) {
  const [selected, setSelected] = React.useState<string | null>(null);
  const [options, setOptions] = React.useState<JobOption[]>([]);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [progress, setProgress] = React.useState(0);

  React.useEffect(() => {
    async function fetchJobOptions() {
      if (!customer) return;
      setIsLoading(true);
      setProgress(0);
      setError(null);
      setOptions([]);
      let progressInterval: ReturnType<typeof setInterval> | null = null;
      
      // Set a timeout to show defaults if AI request takes too long
      const timeoutFallback = setTimeout(() => {
        console.log('JobSelection: Timeout fallback triggered');
        setError('AI request timed out. Showing defaults.');
        setOptions([]);
        setProgress(100);
        setIsLoading(false);
      }, 15000); // 15 second timeout
      
      try {
        // Animate progress bar to 90% while loading
        progressInterval = setInterval(() => {
          setProgress(prev => (prev < 90 ? prev + 5 : 90));
        }, 200);
        
        // Build context string based on available data
        let contextString = `Customer: ${customer.title} - ${customer.description}`;
        if (businessArea) {
          contextString += `\nBusiness Area: ${businessArea.title} - ${businessArea.description}`;
        }
        if (interests) {
          contextString += `\nUser Interests: ${interests}`;
        }
        if (location) {
          contextString += `\nLocation: ${location.city}, ${location.region}`;
        }
        if (scheduleGoals) {
          contextString += `\nAvailability: ${scheduleGoals.hoursPerWeek} hours/week, Income Target: $${scheduleGoals.incomeTarget}/month`;
        }
        
        const prompt = `Generate 5 specific problems for ${customer.title} in ${location?.city || 'your area'}, ${location?.country || 'your country'}.

Business area: ${businessArea?.title || 'general'}
${interests ? `Interests: ${interests}` : ''}
${scheduleGoals ? `Availability: ${scheduleGoals.hoursPerWeek} hours/week, Target: $${scheduleGoals.incomeTarget}/month` : ''}

Focus on problems that can be solved part-time and locally.

Return ONLY a JSON array with exactly 5 objects. Each object must have id, title, description, and icon (emoji).

Example: [{"id": "time-management", "title": "Time Management", "description": "When I'm busy with work and family, I want to optimize my schedule, so I can have more free time", "icon": "⏰"}]

No explanation, just the JSON array.`;
        
        const response = await fetchChatGPT(prompt);
        let parsed: JobOption[] = Array.isArray(response) ? response : [];
        if (!parsed.length) {
          try {
            parsed = JSON.parse(response);
          } catch {
            const match = response.match && response.match(/\[\s*{[\s\S]*?}\s*\]/);
            if (match) {
              try {
                parsed = JSON.parse(match[0]);
              } catch {}
            }
          }
        }
        // Filter and clean up jobs, providing fallbacks for missing fields
        const validOptions = parsed
          .filter(option => option && typeof option === 'object')
          .map((option, index) => ({
            id: String(option.id || `job-${index + 1}`),
            title: String(option.title || `Job ${index + 1}`),
            description: String(option.description || 'No description provided'),
            icon: String(option.icon || '💼')
          }))
          .filter(option => 
            option.title.trim() !== '' && 
            option.description.trim() !== '' && 
            option.description !== 'No description provided'
          );
        
        // If we have fewer than 5 valid options, add better fallback options
        const fallbackJobs = generateFallbackJobs(customer, businessArea, validOptions.length);
        while (validOptions.length < 5) {
          const fallbackJob = fallbackJobs[validOptions.length] || {
            id: `fallback-${validOptions.length + 1}`,
            title: `Help ${customer.title}`,
            description: `Provide a service that helps ${customer.title} solve their problems`,
            icon: '💼'
          };
          validOptions.push(fallbackJob);
        }
        
        if (validOptions.length === 0) throw new Error('No valid jobs found');
        setOptions(validOptions.slice(0, 5)); // Ensure exactly 5 options
        setProgress(100);
        clearTimeout(timeoutFallback); // Clear timeout if successful
      } catch (err: any) {
        console.error('JobSelection error:', err);
        setError('Could not generate jobs. Try again or pick a different customer.');
        setOptions([]);
        setProgress(100);
        clearTimeout(timeoutFallback); // Clear timeout on error
      } finally {
        setIsLoading(false);
        if (progressInterval) clearInterval(progressInterval);
        setTimeout(() => setProgress(0), 800);
      }
    }
    fetchJobOptions();
  }, [customer, interests, businessArea, location, scheduleGoals]);

  function handleSelect(job: JobOption) {
    console.log('Job clicked in JobSelection:', job);
    setSelected(job.id);
    setTimeout(() => {
      console.log('Calling onSelect with job:', job);
      onSelect(job);
    }, 150); // brief highlight for a11y
  }

  return (
    <Container>
      <Title>Your business should help your customer</Title>
      <Subtitle>Help your customer with one of the following:</Subtitle>
      {isLoading && (
        <ProgressBarContainer>
          <ProgressBarFill percent={progress} />
        </ProgressBarContainer>
      )}
      {error && <Subtitle style={{ color: 'red' }}>{error}</Subtitle>}
      <JobGrid>
        {options.map(job => {
          console.log('Rendering job option:', job);
          return (
            <OptionCard
              key={job.id}
              isSelected={selected === job.id}
              onClick={() => handleSelect(job)}
              aria-pressed={selected === job.id}
              tabIndex={0}
            >
              <Icon>{job.icon}</Icon>
              <JobTitle>{job.title}</JobTitle>
              <JobDescription>{job.description}</JobDescription>
            </OptionCard>
          );
        })}
      </JobGrid>
    </Container>
  );
} 