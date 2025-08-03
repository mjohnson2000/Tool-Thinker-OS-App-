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
function generateFallbackSolutions(job: any, businessArea: any, customer: any, interests: string, startIndex: number) {
  const fallbackSolutions = [];
  
  // If we have specific interests, try to create relevant solutions
  if (interests && interests.toLowerCase().includes('ice cream')) {
    return [
      { id: 'ice-cream-app', title: 'Ice Cream Finder App', description: 'Help customers discover and order the best ice cream in their area', icon: '🍦' },
      { id: 'ice-cream-delivery', title: 'Ice Cream Delivery Service', description: 'Deliver premium ice cream to customers at their location', icon: '🚚' },
      { id: 'ice-cream-events', title: 'Ice Cream Event Planning', description: 'Plan and cater ice cream themed events and parties', icon: '🎉' },
      { id: 'ice-cream-reviews', title: 'Ice Cream Review Platform', description: 'Create a platform for customers to review and rate ice cream shops', icon: '⭐' },
      { id: 'ice-cream-subscription', title: 'Ice Cream Subscription Box', description: 'Curate and deliver monthly ice cream experiences', icon: '📦' }
    ];
  }

  // Generate dynamic solutions based on job description and context
  const generateDynamicSolutions = () => {
    const jobTitle = job.title.toLowerCase();
    const jobDescription = job.description.toLowerCase();
    const customerTitle = customer?.title?.toLowerCase() || '';
    const businessAreaTitle = businessArea?.title?.toLowerCase() || '';
    
    // Extract key themes from the job
    const themes = [];
    if (jobTitle.includes('time') || jobDescription.includes('time')) themes.push('time management');
    if (jobTitle.includes('child') || jobDescription.includes('child') || customerTitle.includes('parent')) themes.push('childcare');
    if (jobTitle.includes('study') || jobDescription.includes('study') || jobTitle.includes('learn')) themes.push('education');
    if (jobTitle.includes('business') || jobDescription.includes('business') || businessAreaTitle.includes('business')) themes.push('business');
    if (jobTitle.includes('fitness') || jobDescription.includes('fitness') || jobTitle.includes('health')) themes.push('fitness');
    if (jobTitle.includes('food') || jobDescription.includes('food') || interests.toLowerCase().includes('food')) themes.push('food');
    if (jobTitle.includes('tech') || jobDescription.includes('tech') || businessAreaTitle.includes('technology')) themes.push('technology');
    if (jobTitle.includes('money') || jobDescription.includes('money') || jobTitle.includes('finance')) themes.push('finance');
    if (jobTitle.includes('social') || jobDescription.includes('social') || customerTitle.includes('community')) themes.push('social');
    if (jobTitle.includes('creative') || jobDescription.includes('creative') || businessAreaTitle.includes('creative')) themes.push('creative');
    
    // If no specific themes found, use general problem-solving approach
    if (themes.length === 0) {
      themes.push('general');
    }

    // Generate solutions based on identified themes
    const solutionTypes: Record<string, Array<{ title: string; description: string; icon: string }>> = {
      'time management': [
        { title: 'Smart Scheduling System', description: 'Help customers organize their time more efficiently', icon: '📅' },
        { title: 'Priority Management Tool', description: 'Help customers focus on what matters most', icon: '🎯' },
        { title: 'Automation Service', description: 'Help customers automate repetitive tasks', icon: '⚙️' },
        { title: 'Productivity Coaching', description: 'Help customers develop better work habits', icon: '📈' },
        { title: 'Time Tracking App', description: 'Help customers understand how they spend their time', icon: '⏱️' }
      ],
      'childcare': [
        { title: 'Childcare Network Platform', description: 'Connect parents with reliable childcare providers', icon: '👶' },
        { title: 'Activity Planning Service', description: 'Help parents plan engaging activities for their children', icon: '🎨' },
        { title: 'Safety Monitoring System', description: 'Provide tools to ensure children are safe and supervised', icon: '🛡️' },
        { title: 'Educational Support Service', description: 'Help children with homework and learning activities', icon: '📚' },
        { title: 'Parenting Resource Hub', description: 'Provide guidance and resources for parenting challenges', icon: '👨‍👩‍👧‍👦' }
      ],
      'education': [
        { title: 'Learning Management Platform', description: 'Create an online platform for effective learning', icon: '💻' },
        { title: 'Study Group Organizer', description: 'Help students form and manage study groups', icon: '👥' },
        { title: 'Memory Enhancement System', description: 'Teach effective memory and retention strategies', icon: '🧠' },
        { title: 'Note-Taking Tool', description: 'Help students develop better note-taking methods', icon: '📝' },
        { title: 'Exam Preparation Service', description: 'Provide tools and resources for exam preparation', icon: '📖' }
      ],
      'business': [
        { title: 'Marketing Strategy Service', description: 'Help businesses develop effective marketing campaigns', icon: '📢' },
        { title: 'Customer Acquisition Platform', description: 'Help businesses find and retain new customers', icon: '🎯' },
        { title: 'Sales Training Program', description: 'Help businesses improve their sales processes', icon: '💰' },
        { title: 'Brand Development Service', description: 'Help businesses build strong brand identities', icon: '🏷️' },
        { title: 'Growth Consulting Service', description: 'Provide strategic advice for business expansion', icon: '📈' }
      ],
      'fitness': [
        { title: 'Personal Training Platform', description: 'Create a mobile app for personalized fitness coaching', icon: '💪' },
        { title: 'Workout Planning Service', description: 'Help people create effective workout routines', icon: '📋' },
        { title: 'Nutrition Guidance Service', description: 'Provide personalized nutrition advice and meal plans', icon: '🥗' },
        { title: 'Progress Tracking System', description: 'Help people track their fitness progress and goals', icon: '📊' },
        { title: 'Fitness Community Platform', description: 'Create fitness communities and group activities', icon: '👥' }
      ],
      'food': [
        { title: 'Food Discovery App', description: 'Help customers discover and order great food in their area', icon: '🍽️' },
        { title: 'Food Delivery Service', description: 'Deliver quality food to customers at their location', icon: '🚚' },
        { title: 'Food Event Planning', description: 'Plan and cater food-themed events and parties', icon: '🎉' },
        { title: 'Food Review Platform', description: 'Create a platform for customers to review and rate restaurants', icon: '⭐' },
        { title: 'Food Subscription Service', description: 'Curate and deliver monthly food experiences', icon: '📦' }
      ],
      'technology': [
        { title: 'Tech Support Service', description: 'Help customers with technical issues and setup', icon: '🛠️' },
        { title: 'Software Training Platform', description: 'Help customers learn and master new software', icon: '💻' },
        { title: 'Digital Transformation Service', description: 'Help businesses modernize their technology', icon: '🚀' },
        { title: 'Tech Consulting Service', description: 'Provide expert advice on technology decisions', icon: '💡' },
        { title: 'App Development Service', description: 'Create custom applications for specific needs', icon: '📱' }
      ],
      'finance': [
        { title: 'Financial Planning Service', description: 'Help customers manage their money more effectively', icon: '💰' },
        { title: 'Budget Tracking App', description: 'Help customers track and control their spending', icon: '📊' },
        { title: 'Investment Guidance Service', description: 'Help customers make smart investment decisions', icon: '📈' },
        { title: 'Debt Management Service', description: 'Help customers reduce and manage their debt', icon: '💳' },
        { title: 'Financial Education Platform', description: 'Teach customers about personal finance', icon: '📚' }
      ],
      'social': [
        { title: 'Community Building Platform', description: 'Help people connect and build meaningful relationships', icon: '🤝' },
        { title: 'Event Organization Service', description: 'Plan and organize social events and gatherings', icon: '🎪' },
        { title: 'Social Networking App', description: 'Create a platform for people to connect and network', icon: '🌐' },
        { title: 'Volunteer Coordination Service', description: 'Help organize and manage volunteer activities', icon: '❤️' },
        { title: 'Social Impact Consulting', description: 'Help organizations create positive social change', icon: '🌍' }
      ],
      'creative': [
        { title: 'Creative Portfolio Platform', description: 'Help artists showcase their work and find opportunities', icon: '🎨' },
        { title: 'Art Commission Service', description: 'Connect artists with clients for custom artwork', icon: '🖼️' },
        { title: 'Creative Workshop Service', description: 'Organize and lead creative workshops and classes', icon: '🎭' },
        { title: 'Design Consultation Service', description: 'Provide expert design advice and solutions', icon: '🎯' },
        { title: 'Creative Content Creation', description: 'Create engaging content for brands and businesses', icon: '📝' }
      ],
      'general': [
        { title: 'Problem-Solving Service', description: 'Help customers solve their specific challenges', icon: '🔧' },
        { title: 'Consultation Platform', description: 'Connect customers with expert advice and guidance', icon: '💼' },
        { title: 'Resource Hub', description: 'Create a comprehensive resource center for customers', icon: '📚' },
        { title: 'Support Network Service', description: 'Build a community of support for customers', icon: '🤗' },
        { title: 'Innovation Lab', description: 'Help customers develop new ideas and solutions', icon: '💡' }
      ]
    };

    // Get solutions for the primary theme
    const primaryTheme = themes[0];
    const solutions = solutionTypes[primaryTheme] || solutionTypes['general'];
    
    return solutions.slice(startIndex, startIndex + 5);
  };

  return generateDynamicSolutions();
}

export interface SolutionSelectionPageProps {
  job: { title: string; description: string; icon: string } | null;
  onSelect: (solution: SolutionOption) => void;
  interests?: string;
  businessArea?: { title: string; description: string; icon: string } | null;
  customer?: { title: string; description: string; icon: string } | null;
  location?: { city: string; region: string; country: string } | null;
  scheduleGoals?: { hoursPerWeek: number; incomeTarget: number } | null;
  skillAssessment?: { skills: any[]; selectedSkills: string[]; recommendations: string[]; learningPath: string[] } | null;
}

export function SolutionSelectionPage({ job, onSelect, interests, businessArea, customer, location, scheduleGoals, skillAssessment }: SolutionSelectionPageProps) {
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
        setError('AI request timed out. Showing context-aware solutions.');
        setOptions([]);
        setProgress(100);
        setIsLoading(false);
      }, 10000); // 10 second timeout
      
      try {
        // Animate progress bar to 90% while loading
        progressInterval = setInterval(() => {
          setProgress(prev => (prev < 90 ? prev + 5 : 90));
        }, 200);
        
        const prompt = `Generate 5 unique, creative business solutions for this specific problem:

PROBLEM: ${job.title}
PROBLEM DESCRIPTION: ${job.description}

CONTEXT:
- User Interests: "${interests}"
- Business Area: ${businessArea?.title || 'general'} (${businessArea?.description || ''})
- Target Customer: ${customer?.title || 'users'} (${customer?.description || ''})
${location ? `- Location: ${location.city}, ${location.region}, ${location.country}` : ''}
${scheduleGoals ? `- Availability: ${scheduleGoals.hoursPerWeek} hours/week` : ''}
${scheduleGoals ? `- Income Target: $${scheduleGoals.incomeTarget}/month` : ''}

REQUIREMENTS:
1. Solutions must be directly related to the user's interests: "${interests}"
2. Focus on practical, part-time solutions that can be implemented locally
3. Solutions should match the user's schedule (${scheduleGoals?.hoursPerWeek || 'flexible'} hours/week)
4. Solutions should be achievable with the income target of $${scheduleGoals?.incomeTarget || 'realistic'}/month
5. Each solution should be unique and different from the others
6. Solutions should be specific to the problem, not generic

Return ONLY a JSON array with exactly 5 objects. Each object must have:
- id: unique identifier (lowercase, no spaces)
- title: descriptive solution name
- description: how this solution helps solve the specific problem
- icon: relevant emoji

Example format: [{"id": "ice-cream-app", "title": "Ice Cream Finder App", "description": "Help customers discover and order the best ice cream in their area", "icon": "🍦"}]

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
        const fallbackSolutions = generateFallbackSolutions(job, businessArea, customer, interests || '', validOptions.length);
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
        setError('Could not generate AI solutions. Showing context-aware alternatives.');
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