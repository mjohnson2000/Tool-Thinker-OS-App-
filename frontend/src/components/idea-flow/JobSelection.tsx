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

const Subtitle = styled.p`
  color: var(--text-secondary);
  margin-bottom: 2rem;
  text-align: center;
  font-size: 1.15rem;
  line-height: 1.6;
  max-width: 550px;
  font-weight: 400;
  opacity: 0.9;
  
  @media (max-width: 768px) {
    font-size: 1rem;
    margin-bottom: 1.5rem;
    padding: 0 0.5rem;
  }
`;

const JobGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 1.5rem;
  width: 100%;
  max-width: 700px;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 1.5rem;
    padding: 0 0.5rem;
    margin-top: 1rem;
  }
`;

const OptionCard = styled.button<{ isSelected: boolean }>`
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
  
  @media (max-width: 768px) {
    padding: 2rem 1.5rem;
    min-height: 140px;
    margin: 0 0.5rem;
  }
  
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

const Icon = styled.div`
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
  
  @media (max-width: 768px) {
    width: 70px;
    height: 70px;
    font-size: 2.2rem;
    margin-bottom: 1rem;
  }
  
  ${OptionCard}:hover & {
    transform: scale(1.1);
    background: linear-gradient(135deg, #e9ecef 0%, #dee2e6 100%);
    border-color: #ced4da;
  }
`;

const JobTitle = styled.div`
  font-family: 'Audiowide', 'Courier New', monospace;
  font-weight: 400;
  font-size: 1.2rem;
  margin-bottom: 0.6rem;
  letter-spacing: -0.01em;
  color: var(--text-primary);
  font-display: swap;
  
  @media (max-width: 768px) {
    font-size: 1.2rem;
    margin-bottom: 0.8rem;
  }
`;

const JobDescription = styled.div`
  color: var(--text-secondary);
  font-size: 0.95rem;
  line-height: 1.4;
  text-align: center;
  font-weight: 400;
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
function generateFallbackJobs(customer: any, businessArea: any, interests: string, startIndex: number) {
  const fallbackJobs = [];
  
  // If we have specific interests, try to create relevant jobs
  if (interests && interests.toLowerCase().includes('ice cream')) {
    return [
      { id: 'ice-cream-quality', title: 'Ice Cream Quality', description: 'Help customers find and enjoy premium ice cream experiences', icon: '🍦' },
      { id: 'ice-cream-delivery', title: 'Ice Cream Delivery', description: 'Help customers get ice cream delivered to their location', icon: '🚚' },
      { id: 'ice-cream-events', title: 'Ice Cream Events', description: 'Help customers plan ice cream themed events and parties', icon: '🎉' },
      { id: 'ice-cream-reviews', title: 'Ice Cream Reviews', description: 'Help customers discover the best ice cream shops and flavors', icon: '⭐' },
      { id: 'ice-cream-catering', title: 'Ice Cream Catering', description: 'Help customers get ice cream for special occasions', icon: '🎂' }
    ];
  }

  // Generate dynamic jobs based on customer description and context
  const generateDynamicJobs = () => {
    const jobs = [];
    const customerTitle = customer.title.toLowerCase();
    const customerDescription = customer.description.toLowerCase();
    const businessAreaTitle = businessArea?.title?.toLowerCase() || '';
    const interestsLower = interests.toLowerCase();
    
    // Extract key themes from the customer
    const themes = [];
    if (customerTitle.includes('professional') || customerTitle.includes('busy') || customerDescription.includes('work') || customerDescription.includes('career')) themes.push('professional');
    if (customerTitle.includes('parent') || customerDescription.includes('child') || customerDescription.includes('family')) themes.push('parenting');
    if (customerTitle.includes('student') || customerDescription.includes('study') || customerDescription.includes('learn') || customerDescription.includes('academic')) themes.push('education');
    if (customerTitle.includes('business') || customerTitle.includes('owner') || customerDescription.includes('business') || businessAreaTitle.includes('business')) themes.push('business');
    if (customerTitle.includes('health') || customerDescription.includes('fitness') || customerDescription.includes('wellness') || interestsLower.includes('fitness')) themes.push('health');
    if (customerTitle.includes('food') || customerDescription.includes('food') || interestsLower.includes('food')) themes.push('food');
    if (customerTitle.includes('tech') || customerDescription.includes('tech') || businessAreaTitle.includes('technology')) themes.push('technology');
    if (customerTitle.includes('creative') || customerDescription.includes('creative') || businessAreaTitle.includes('creative')) themes.push('creative');
    if (customerTitle.includes('senior') || customerDescription.includes('elderly') || customerDescription.includes('aging')) themes.push('senior');
    if (customerTitle.includes('community') || customerDescription.includes('social') || customerDescription.includes('neighborhood')) themes.push('community');
    
    // If no specific themes found, use general problem-solving approach
    if (themes.length === 0) {
      themes.push('general');
    }

    // Generate jobs based on identified themes
    const jobTypes: Record<string, Array<{ title: string; description: string; icon: string }>> = {
      'professional': [
        { title: 'Time Management', description: 'Help busy professionals optimize their schedule and productivity', icon: '⏰' },
        { title: 'Stress Relief', description: 'Provide services that help reduce work-related stress', icon: '🧘' },
        { title: 'Skill Development', description: 'Help professionals learn new skills efficiently', icon: '📚' },
        { title: 'Networking', description: 'Connect professionals with valuable contacts and opportunities', icon: '🤝' },
        { title: 'Work-Life Balance', description: 'Help professionals maintain healthy work-life boundaries', icon: '⚖️' }
      ],
      'parenting': [
        { title: 'Childcare Support', description: 'Help parents with childcare and family management', icon: '👶' },
        { title: 'Meal Planning', description: 'Help parents plan and prepare healthy family meals', icon: '🍽️' },
        { title: 'Family Organization', description: 'Help parents organize family schedules and activities', icon: '📅' },
        { title: 'Parenting Guidance', description: 'Provide advice and support for parenting challenges', icon: '👨‍👩‍👧‍👦' },
        { title: 'Family Wellness', description: 'Help families maintain health and wellness routines', icon: '💪' }
      ],
      'education': [
        { title: 'Study Skills', description: 'Help students improve their learning and study techniques', icon: '📖' },
        { title: 'Career Guidance', description: 'Help students plan their career path and goals', icon: '🎯' },
        { title: 'Time Management', description: 'Help students balance academics and personal life', icon: '⏰' },
        { title: 'Skill Building', description: 'Help students develop practical skills for their future', icon: '🔧' },
        { title: 'Academic Support', description: 'Provide tutoring and academic assistance', icon: '🎓' }
      ],
      'business': [
        { title: 'Business Growth', description: 'Help small businesses expand and increase revenue', icon: '📈' },
        { title: 'Marketing Support', description: 'Help businesses improve their marketing strategies', icon: '📢' },
        { title: 'Financial Management', description: 'Help businesses manage finances and cash flow', icon: '💰' },
        { title: 'Customer Service', description: 'Help businesses improve customer satisfaction', icon: '😊' },
        { title: 'Operational Efficiency', description: 'Help businesses streamline their operations', icon: '⚙️' }
      ],
      'health': [
        { title: 'Fitness Coaching', description: 'Help people achieve their fitness and health goals', icon: '💪' },
        { title: 'Nutrition Guidance', description: 'Help people improve their diet and nutrition', icon: '🥗' },
        { title: 'Mental Wellness', description: 'Help people maintain mental health and mindfulness', icon: '🧘' },
        { title: 'Lifestyle Coaching', description: 'Help people adopt healthier lifestyle habits', icon: '🌱' },
        { title: 'Wellness Planning', description: 'Help people create personalized wellness routines', icon: '🏃' }
      ],
      'food': [
        { title: 'Food Discovery', description: 'Help customers discover and enjoy great food experiences', icon: '🍽️' },
        { title: 'Meal Planning', description: 'Help customers plan and prepare delicious meals', icon: '📋' },
        { title: 'Food Delivery', description: 'Help customers get quality food delivered to their location', icon: '🚚' },
        { title: 'Catering Services', description: 'Help customers get food for special occasions', icon: '🎉' },
        { title: 'Food Reviews', description: 'Help customers discover the best restaurants and dishes', icon: '⭐' }
      ],
      'technology': [
        { title: 'Tech Support', description: 'Help customers with technical issues and setup', icon: '🛠️' },
        { title: 'Software Training', description: 'Help customers learn and master new software', icon: '💻' },
        { title: 'Digital Transformation', description: 'Help businesses modernize their technology', icon: '🚀' },
        { title: 'Tech Consulting', description: 'Provide expert advice on technology decisions', icon: '💡' },
        { title: 'App Development', description: 'Create custom applications for specific needs', icon: '📱' }
      ],
      'creative': [
        { title: 'Design Services', description: 'Help customers create beautiful and effective designs', icon: '🎨' },
        { title: 'Content Creation', description: 'Help customers create engaging content', icon: '✍️' },
        { title: 'Creative Coaching', description: 'Help people develop their creative skills', icon: '🎭' },
        { title: 'Portfolio Building', description: 'Help creatives showcase their work effectively', icon: '📁' },
        { title: 'Creative Workshops', description: 'Host workshops and classes for creative skills', icon: '🎪' }
      ],
      'senior': [
        { title: 'Health Management', description: 'Help seniors maintain their health and wellness', icon: '🏥' },
        { title: 'Technology Support', description: 'Help seniors learn and use modern technology', icon: '📱' },
        { title: 'Social Connection', description: 'Help seniors stay connected with family and friends', icon: '👥' },
        { title: 'Home Assistance', description: 'Help seniors with daily living activities', icon: '🏠' },
        { title: 'Memory Support', description: 'Help seniors maintain cognitive health and memory', icon: '🧠' }
      ],
      'community': [
        { title: 'Community Building', description: 'Help people connect and build strong communities', icon: '👥' },
        { title: 'Event Planning', description: 'Help organize and manage community events', icon: '🎉' },
        { title: 'Local Networking', description: 'Help people build local connections and relationships', icon: '🤝' },
        { title: 'Community Support', description: 'Provide support and resources for local communities', icon: '❤️' },
        { title: 'Neighborhood Services', description: 'Help improve local neighborhoods and communities', icon: '🏘️' }
      ],
      'general': [
        { title: 'Problem Solving', description: 'Help customers solve their specific challenges', icon: '🔧' },
        { title: 'Consulting Services', description: 'Provide expert advice and guidance', icon: '💡' },
        { title: 'Support Network', description: 'Connect customers with the help they need', icon: '🤝' },
        { title: 'Resource Hub', description: 'Provide tools and resources for customer success', icon: '📚' },
        { title: 'Custom Services', description: 'Create tailored solutions for specific needs', icon: '⚙️' }
      ]
    };

    // Use the primary theme or mix themes for variety
    const primaryTheme = themes[0];
    const secondaryTheme = themes[1] || 'general';
    
    const primaryJobs = jobTypes[primaryTheme] || jobTypes['general'];
    const secondaryJobs = jobTypes[secondaryTheme] || jobTypes['general'];
    
    // Mix jobs from different themes for variety
    for (let i = 0; i < 5; i++) {
      const jobPool = i < 3 ? primaryJobs : secondaryJobs;
      const job = jobPool[i % jobPool.length];
      jobs.push({
        id: `dynamic-${i + 1}`,
        title: job.title,
        description: job.description,
        icon: job.icon
      });
    }
    
    return jobs;
  };

  const dynamicJobs = generateDynamicJobs();
  
  // Create fallback jobs starting from the given index
  for (let i = 0; i < 5 - startIndex; i++) {
    const job = dynamicJobs[startIndex + i] || dynamicJobs[0];
    fallbackJobs.push({
      id: `fallback-${startIndex + i + 1}`,
      title: job.title,
      description: job.description,
      icon: job.icon
    });
  }
  
  return fallbackJobs;
}

export interface JobSelectionProps {
  onSelect: (job: JobOption) => void;
  customer: { title: string; description: string; icon: string } | null;
  interests?: string; // Add interests prop
  businessArea?: { title: string; description: string; icon: string } | null; // Add business area prop
  ideaType?: { id: string; title: string; description: string; icon: string; examples: string[] } | null;
  location?: { city: string; region: string; country: string } | null;
  skillAssessment?: { skills: any[]; selectedSkills: string[]; recommendations: string[]; learningPath: string[] } | null;
  scheduleGoals?: { hoursPerWeek: number; incomeTarget: number } | null;
}

export function JobSelection({ onSelect, customer, interests, businessArea, ideaType, location, skillAssessment, scheduleGoals }: JobSelectionProps) {
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
        setError('AI request timed out. Showing context-aware alternatives.');
        setOptions([]);
        setProgress(100);
        setIsLoading(false);
      }, 12000); // 12 second timeout
      
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
        
        console.log('JobSelection context:', { customer, interests, businessArea, ideaType, location, scheduleGoals });
        console.log('JobSelection contextString:', contextString);
        
        const prompt = `You are a business problem generator. Generate exactly 5 specific problems that ${customer.title} face, related to these interests: "${interests}"

CONTEXT:
- Customer: ${customer.title} (${customer.description})
- User Interests: "${interests}"
- Business Area: ${businessArea?.title || 'general'} (${businessArea?.description || ''})
${ideaType ? `- Service Type: ${ideaType.title} (${ideaType.description})` : ''}
${location ? `- Location: ${location.city}, ${location.region}, ${location.country}` : ''}
${scheduleGoals ? `- Availability: ${scheduleGoals.hoursPerWeek} hours/week` : ''}
${scheduleGoals ? `- Income Target: $${scheduleGoals.incomeTarget}/month` : ''}

CRITICAL: You must respond with ONLY a valid JSON array containing exactly 5 objects. No explanations, no markdown, no additional text.

Each object must have these exact fields:
- "id": lowercase string with no spaces (e.g., "time-management")
- "title": string describing the problem
- "description": string starting with "When I..." describing the specific problem
- "icon": single emoji character

Example response format:
[{"id": "time-management", "title": "Time Management", "description": "When I have too many tasks, I want to prioritize effectively so I can focus on what matters most", "icon": "⏰"}, {"id": "stress-relief", "title": "Stress Relief", "description": "When I feel overwhelmed at work, I want to find ways to relax so I can maintain my mental health", "icon": "🧘"}]

Respond with ONLY the JSON array, nothing else.`;

        console.log('JobSelection - AI prompt being sent:', prompt);
        
        const response = await fetchChatGPT(prompt);
        console.log('JobSelection - Raw AI response:', response);
        console.log('JobSelection - Response type:', typeof response);
        console.log('JobSelection - Is array?', Array.isArray(response));
        
        let parsed: JobOption[] = Array.isArray(response) ? response : [];
        
        // If response is not an array, try to parse it
        if (!parsed.length && typeof response === 'string') {
          try {
            parsed = JSON.parse(response);
            console.log('JobSelection - Parsed from string:', parsed);
          } catch {
            console.error('Failed to parse job response as JSON:', response);
            // Try to extract JSON array from the string
            try {
              const jsonArrayMatch = response.match(/\[\s*\{[\s\S]*?\}\s*\]/);
              if (jsonArrayMatch) {
                parsed = JSON.parse(jsonArrayMatch[0]);
                console.log('JobSelection - Extracted JSON array from string:', jsonArrayMatch[0]);
              }
            } catch (extractErr) {
              console.error('Failed to extract JSON array from response:', extractErr);
            }
          }
        }
        
        // Ensure parsed is an array
        if (!Array.isArray(parsed)) {
          console.log('JobSelection - Parsed is not array, setting to empty:', parsed);
          parsed = [];
        }
        
        console.log('JobSelection - Final parsed array:', parsed);
        console.log('JobSelection - Parsed length:', parsed.length);
        
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
        const fallbackJobs = generateFallbackJobs(customer, businessArea, interests || '', validOptions.length);
        console.log('JobSelection - Valid options count:', validOptions.length);
        console.log('JobSelection - Using fallback jobs:', fallbackJobs);
        
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
        setError('Could not generate AI jobs. Showing context-aware alternatives.');
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
  }, [customer, interests, businessArea, ideaType, location, scheduleGoals]);

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
      <FormCard>
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
      </FormCard>
    </Container>
  );
} 