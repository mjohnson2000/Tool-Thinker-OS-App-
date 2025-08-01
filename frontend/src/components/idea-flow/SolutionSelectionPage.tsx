import React from 'react';
import styled from 'styled-components';
import { fetchChatGPT } from '../../utils/chatgpt';

export interface SolutionOption {
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

const SolutionGrid = styled.div`
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

const SolutionTitle = styled.div`
  font-weight: 600;
  font-size: 1.1rem;
  margin-bottom: 0.5rem;
`;

const SolutionDescription = styled.div`
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

// Function to generate better fallback solutions based on job type and business area
function generateFallbackSolutions(job: any, businessArea: any, customer: any, startIndex: number) {
  const fallbackSolutions = [];
  
  // Common solution types for different job categories
  const solutionTemplates = {
    'Time Management': [
      { title: 'Digital Calendar System', description: 'Help customers organize their schedule with smart digital tools', icon: '📅' },
      { title: 'Priority Planning', description: 'Help customers focus on what matters most', icon: '🎯' },
      { title: 'Automation Services', description: 'Help customers automate repetitive tasks', icon: '⚙️' },
      { title: 'Productivity Coaching', description: 'Help customers develop better work habits', icon: '📈' },
      { title: 'Time Tracking App', description: 'Help customers understand how they spend their time', icon: '⏱️' }
    ],
    'Stress Relief': [
      { title: 'Mindfulness App', description: 'Help customers practice meditation and mindfulness', icon: '🧘' },
      { title: 'Wellness Coaching', description: 'Help customers develop stress management techniques', icon: '💆' },
      { title: 'Work-Life Balance', description: 'Help customers set healthy boundaries', icon: '⚖️' },
      { title: 'Relaxation Techniques', description: 'Help customers learn quick stress relief methods', icon: '😌' },
      { title: 'Support Community', description: 'Connect customers with others facing similar challenges', icon: '🤝' }
    ],
    'Business Growth': [
      { title: 'Marketing Strategy', description: 'Help businesses reach more customers', icon: '📢' },
      { title: 'Sales Training', description: 'Help businesses improve their sales process', icon: '💰' },
      { title: 'Customer Service', description: 'Help businesses provide better customer support', icon: '😊' },
      { title: 'Process Optimization', description: 'Help businesses work more efficiently', icon: '⚙️' },
      { title: 'Growth Planning', description: 'Help businesses plan their expansion', icon: '📈' }
    ],
    'Fitness Coaching': [
      { title: 'Personal Training', description: 'Help customers achieve their fitness goals', icon: '💪' },
      { title: 'Workout Plans', description: 'Help customers follow effective exercise routines', icon: '🏃' },
      { title: 'Nutrition Guidance', description: 'Help customers eat better for their goals', icon: '🥗' },
      { title: 'Motivation Support', description: 'Help customers stay committed to their fitness', icon: '🔥' },
      { title: 'Progress Tracking', description: 'Help customers monitor their fitness journey', icon: '📊' }
    ],
    'Study Skills': [
      { title: 'Learning Methods', description: 'Help students study more effectively', icon: '📚' },
      { title: 'Note-Taking System', description: 'Help students organize their learning', icon: '📝' },
      { title: 'Test Preparation', description: 'Help students prepare for exams', icon: '📖' },
      { title: 'Study Planning', description: 'Help students manage their academic workload', icon: '📅' },
      { title: 'Academic Coaching', description: 'Help students develop better study habits', icon: '🎓' }
    ]
  };

  // Try to match job title with templates, or use general templates
  let templates = solutionTemplates['Time Management']; // default
  for (const [key, value] of Object.entries(solutionTemplates)) {
    if (job.title.toLowerCase().includes(key.toLowerCase())) {
      templates = value;
      break;
    }
  }
  
  // Create fallback solutions starting from the given index
  for (let i = 0; i < 5 - startIndex; i++) {
    const template = templates[i] || templates[0];
    fallbackSolutions.push({
      id: `fallback-${startIndex + i + 1}`,
      title: template.title,
      description: template.description,
      icon: template.icon
    });
  }
  
  return fallbackSolutions;
}

export interface SolutionSelectionPageProps {
  job: { title: string; description: string; icon: string } | null;
  onSelect: (solution: SolutionOption) => void;
  interests?: string;
  businessArea?: { title: string; description: string; icon: string } | null;
  customer?: { title: string; description: string; icon: string } | null;
  location?: { city: string; region: string; country: string } | null;
  scheduleGoals?: { hoursPerWeek: number; incomeTarget: number } | null;
}

export function SolutionSelectionPage({ job, onSelect, interests, businessArea, customer, location, scheduleGoals }: SolutionSelectionPageProps) {
  const [selected, setSelected] = React.useState<string | null>(null);
  const [options, setOptions] = React.useState<SolutionOption[]>([]);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [progress, setProgress] = React.useState(0);

  React.useEffect(() => {
    async function fetchSolutionOptions() {
      if (!job) return;
      setIsLoading(true);
      setProgress(0);
      setError(null);
      setOptions([]);
      let progressInterval: ReturnType<typeof setInterval> | null = null;
      
      // Set a timeout to show defaults if AI request takes too long
      const timeoutFallback = setTimeout(() => {
        console.log('SolutionSelection: Timeout fallback triggered');
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
        // Build context string
        let contextString = '';
        if (interests) contextString += `User Interests: ${interests}\n`;
        if (businessArea) contextString += `Business Area: ${businessArea.title} - ${businessArea.description}\n`;
        if (customer) contextString += `Customer: ${customer.title} - ${customer.description}\n`;
        contextString += `Job/Problem: ${job.title} - ${job.description}`;
        
        const prompt = `Generate 5 creative solutions for: ${job.title}

Business area: ${businessArea?.title || 'general'}
Customer: ${customer?.title || 'users'}
Job: ${job.description}
${location ? `Location: ${location.city}, ${location.region}, ${location.country}` : ''}
${scheduleGoals ? `Availability: ${scheduleGoals.hoursPerWeek} hours/week, Target: $${scheduleGoals.incomeTarget}/month` : ''}

Focus on practical, part-time solutions that can be implemented locally and match the user's schedule and income goals.

Return ONLY a JSON array with exactly 5 objects. Each object must have id, title, description, and icon (emoji).

Example: [{"id": "digital-calendar", "title": "Digital Calendar System", "description": "Help customers organize their schedule with smart digital tools", "icon": "📅"}]

No explanation, just the JSON array.`;
        const response = await fetchChatGPT(prompt);
        let parsed: SolutionOption[] = Array.isArray(response) ? response : [];
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
        // Filter and clean up solutions, providing fallbacks for missing fields
        const validOptions = parsed
          .filter(option => option && typeof option === 'object')
          .map((option, index) => ({
            id: String(option.id || `solution-${index + 1}`),
            title: String(option.title || `Solution ${index + 1}`),
            description: String(option.description || 'No description provided'),
            icon: String(option.icon || '💡')
          }))
          .filter(option => 
            option.title.trim() !== '' && 
            option.description.trim() !== '' && 
            option.description !== 'No description provided'
          );
        
        // If we have fewer than 5 valid options, add better fallback options
        const fallbackSolutions = generateFallbackSolutions(job, businessArea, customer, validOptions.length);
        while (validOptions.length < 5) {
          const fallbackSolution = fallbackSolutions[validOptions.length] || {
            id: `fallback-${validOptions.length + 1}`,
            title: `Solve ${job.title}`,
            description: `A solution that helps address the job: ${job.title}`,
            icon: '💡'
          };
          validOptions.push(fallbackSolution);
        }
        
        if (validOptions.length === 0) throw new Error('No valid solutions found');
        setOptions(validOptions.slice(0, 5)); // Ensure exactly 5 options
        setProgress(100);
        clearTimeout(timeoutFallback); // Clear timeout if successful
      } catch (err: any) {
        console.error('SolutionSelection error:', err);
        setError('Could not generate solutions. Try again or pick a different job.');
        setOptions([]);
        setProgress(100);
        clearTimeout(timeoutFallback); // Clear timeout on error
      } finally {
        setIsLoading(false);
        if (progressInterval) clearInterval(progressInterval);
        setTimeout(() => setProgress(0), 800);
      }
    }
    fetchSolutionOptions();
  }, [job, interests, businessArea, customer, location, scheduleGoals]);

  function handleSelect(solution: SolutionOption) {
    setSelected(solution.id);
    setTimeout(() => {
      onSelect(solution);
    }, 150);
  }

  return (
    <Container>
      <Title>Pick a solution for your business</Title>
      <Subtitle>Choose one of the following solutions for the selected job:</Subtitle>
      {isLoading && (
        <ProgressBarContainer>
          <ProgressBarFill percent={progress} />
        </ProgressBarContainer>
      )}
      {error && <Subtitle style={{ color: 'red' }}>{error}</Subtitle>}
      <SolutionGrid>
        {options.map(solution => (
          <OptionCard
            key={solution.id}
            isSelected={selected === solution.id}
            onClick={() => handleSelect(solution)}
            aria-pressed={selected === solution.id}
            tabIndex={0}
          >
            <Icon>{solution.icon}</Icon>
            <SolutionTitle>{solution.title}</SolutionTitle>
            <SolutionDescription>{solution.description}</SolutionDescription>
          </OptionCard>
        ))}
      </SolutionGrid>
    </Container>
  );
} 