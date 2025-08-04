import React, { useState, useEffect } from 'react';
import styled from 'styled-components';

export interface Skill {
  id: string;
  title: string;
  description: string;
  category: 'technical' | 'soft' | 'business';
  importance: 'critical' | 'important' | 'helpful';
}

export interface SkillAssessmentResult {
  skills: Skill[];
  selectedSkills: string[];
  recommendations: string[];
  learningPath: string[];
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

const SkillsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.5rem;
  width: 100%;
  margin-bottom: 2rem;
  margin-top: 2rem;
`;

const SkillCard = styled.div<{ category: string; importance: string; isSelected: boolean }>`
  padding: 1.8rem 1.5rem;
  border: 2px solid ${props => {
    if (props.isSelected) return '#181a1b';
    if (props.importance === 'critical') return '#666666';
    if (props.importance === 'important') return '#999999';
    return '#cccccc';
  }};
  border-radius: 16px;
  background: ${props => props.isSelected ? 'linear-gradient(135deg, #f0f0f0 0%, #e8e8e8 100%)' : 'linear-gradient(135deg, #ffffff 0%, #fafbfc 100%)'};
  box-shadow: 0 2px 8px rgba(0,0,0,0.06);
  cursor: pointer;
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
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(0,0,0,0.12);
    background: linear-gradient(135deg, #f8f9fa 0%, #f1f3f4 100%);
  }
`;

const SkillHeader = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 0.5rem;
`;

const Checkbox = styled.input`
  margin: 0;
  width: 18px;
  height: 18px;
  accent-color: #181a1b;
`;

const SkillTitle = styled.h3`
  font-size: 1.1rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
  color: #181a1b;
  flex: 1;
  margin-right: 1rem;
`;

const SkillDescription = styled.p`
  font-size: 1rem;
  color: var(--text-secondary);
  line-height: 1.4;
  margin-bottom: 0.5rem;
  margin-top: 0.5rem;
`;

const SkillMeta = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.85rem;
  color: #888;
  margin-top: 1rem;
`;

const CategoryBadge = styled.span<{ category: string }>`
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 500;
  background: ${props => {
    if (props.category === 'technical') return '#f5f5f5';
    if (props.category === 'soft') return '#f0f0f0';
    return '#f8f8f8';
  }};
  color: ${props => {
    if (props.category === 'technical') return '#333333';
    if (props.category === 'soft') return '#555555';
    return '#444444';
  }};
`;

const ImportanceBadge = styled.span<{ importance: string }>`
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 500;
  background: ${props => {
    if (props.importance === 'critical') return '#e0e0e0';
    if (props.importance === 'important') return '#f0f0f0';
    return '#f8f8f8';
  }};
  color: ${props => {
    if (props.importance === 'critical') return '#181a1b';
    if (props.importance === 'important') return '#333333';
    return '#666666';
  }};
`;

const Button = styled.button`
  background: linear-gradient(135deg, #181a1b 0%, #2d2d2d 100%);
  color: white;
  border: none;
  border-radius: 16px;
  padding: 1.4rem 2rem;
  font-size: 1.3rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  margin-top: 2rem;
  width: 100%;
  position: relative;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.15), transparent);
    transition: left 0.6s ease;
  }
  
  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(135deg, rgba(255,255,255,0.1) 0%, transparent 50%, rgba(0,0,0,0.1) 100%);
    pointer-events: none;
  }
  
  &:hover {
    background: linear-gradient(135deg, #000 0%, #181a1b 100%);
    transform: translateY(-3px);
    box-shadow: 0 12px 32px rgba(0,0,0,0.25);
    
    &::before {
      left: 100%;
    }
  }
  
  &:active {
    transform: translateY(-1px);
    box-shadow: 0 6px 16px rgba(0,0,0,0.2);
  }
`;

const SelectionInfo = styled.div`
  text-align: center;
  margin-bottom: 2rem;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 8px;
  border: 1px solid #e9ecef;
`;

// Predefined skills based on business areas
const getSkillsForBusinessArea = (businessArea: string): Skill[] => {
  const skillsMap: Record<string, Skill[]> = {
    'Website Templates': [
      {
        id: 'html-css',
        title: 'HTML & CSS',
        description: 'Ability to create and style web pages with HTML and CSS',
        category: 'technical',
        importance: 'critical'
      },
      {
        id: 'javascript',
        title: 'JavaScript',
        description: 'Basic JavaScript for interactive elements and functionality',
        category: 'technical',
        importance: 'important'
      },
      {
        id: 'design-principles',
        title: 'Design Principles',
        description: 'Understanding of layout, typography, and visual hierarchy',
        category: 'technical',
        importance: 'critical'
      },
      {
        id: 'responsive-design',
        title: 'Responsive Design',
        description: 'Creating templates that work on all device sizes',
        category: 'technical',
        importance: 'important'
      },
      {
        id: 'communication',
        title: 'Communication',
        description: 'Ability to understand client needs and provide clear explanations',
        category: 'soft',
        importance: 'critical'
      },
      {
        id: 'marketing',
        title: 'Marketing',
        description: 'Understanding how to position and sell your templates',
        category: 'business',
        importance: 'important'
      }
    ],
    'Education': [
      {
        id: 'teaching',
        title: 'Teaching',
        description: 'Ability to explain complex concepts clearly and engagingly',
        category: 'soft',
        importance: 'critical'
      },
      {
        id: 'curriculum-design',
        title: 'Curriculum Design',
        description: 'Creating structured learning experiences',
        category: 'technical',
        importance: 'important'
      },
      {
        id: 'communication',
        title: 'Communication',
        description: 'Clear communication with students and parents',
        category: 'soft',
        importance: 'critical'
      }
    ],
    'Technology': [
      {
        id: 'programming',
        title: 'Programming',
        description: 'Coding skills in relevant languages and frameworks',
        category: 'technical',
        importance: 'critical'
      },
      {
        id: 'problem-solving',
        title: 'Problem Solving',
        description: 'Analytical thinking to solve technical challenges',
        category: 'soft',
        importance: 'critical'
      },
      {
        id: 'project-management',
        title: 'Project Management',
        description: 'Managing development timelines and client expectations',
        category: 'business',
        importance: 'important'
      }
    ],
    'Creative': [
      {
        id: 'creativity',
        title: 'Creativity',
        description: 'Ability to generate unique and innovative ideas',
        category: 'soft',
        importance: 'critical'
      },
      {
        id: 'design-software',
        title: 'Design Software',
        description: 'Proficiency in tools like Photoshop, Illustrator, or similar',
        category: 'technical',
        importance: 'important'
      },
      {
        id: 'branding',
        title: 'Branding',
        description: 'Understanding of brand identity and visual communication',
        category: 'business',
        importance: 'important'
      }
    ],
    'Finance': [
      {
        id: 'financial-literacy',
        title: 'Financial Literacy',
        description: 'Understanding of financial concepts and principles',
        category: 'business',
        importance: 'critical'
      },
      {
        id: 'communication',
        title: 'Communication',
        description: 'Explaining complex financial concepts simply',
        category: 'soft',
        importance: 'critical'
      },
      {
        id: 'regulations',
        title: 'Regulations',
        description: 'Knowledge of financial regulations and compliance',
        category: 'business',
        importance: 'important'
      }
    ]
  };

  return skillsMap[businessArea] || [
    {
      id: 'communication',
      title: 'Communication',
      description: 'Ability to clearly communicate with customers and stakeholders',
      category: 'soft',
      importance: 'critical'
    },
    {
      id: 'marketing',
      title: 'Marketing',
      description: 'Understanding how to reach and attract customers',
      category: 'business',
      importance: 'important'
    },
    {
      id: 'project-management',
      title: 'Project Management',
      description: 'Planning and executing projects effectively',
      category: 'business',
      importance: 'important'
    }
  ];
};

// Function to tailor skills based on the specific solution
function tailorSkillsForSolution(skills: Skill[], solution: { title: string; description: string; icon: string }): Skill[] {
  const solutionTitle = solution.title.toLowerCase();
  const solutionDescription = solution.description.toLowerCase();
  
  // Add solution-specific skills based on the solution type
  const solutionSpecificSkills: Skill[] = [];
  
  if (solutionTitle.includes('app') || solutionDescription.includes('app') || solutionTitle.includes('platform')) {
    solutionSpecificSkills.push({
      id: 'app-development',
      title: 'App Development',
      description: 'Building mobile or web applications',
      category: 'technical',
      importance: 'critical'
    });
    solutionSpecificSkills.push({
      id: 'ui-ux-design',
      title: 'UI/UX Design',
      description: 'Creating user-friendly interfaces',
      category: 'technical',
      importance: 'important'
    });
  }
  
  if (solutionTitle.includes('service') || solutionDescription.includes('service')) {
    solutionSpecificSkills.push({
      id: 'customer-service',
      title: 'Customer Service',
      description: 'Providing excellent customer support',
      category: 'soft',
      importance: 'critical'
    });
    solutionSpecificSkills.push({
      id: 'communication',
      title: 'Communication',
      description: 'Clear communication with clients',
      category: 'soft',
      importance: 'critical'
    });
  }
  
  if (solutionTitle.includes('consulting') || solutionDescription.includes('consulting')) {
    solutionSpecificSkills.push({
      id: 'consulting',
      title: 'Consulting',
      description: 'Providing expert advice and guidance',
      category: 'business',
      importance: 'critical'
    });
    solutionSpecificSkills.push({
      id: 'problem-solving',
      title: 'Problem Solving',
      description: 'Analyzing and solving complex problems',
      category: 'soft',
      importance: 'critical'
    });
  }
  
  if (solutionTitle.includes('marketing') || solutionDescription.includes('marketing')) {
    solutionSpecificSkills.push({
      id: 'digital-marketing',
      title: 'Digital Marketing',
      description: 'Online marketing and promotion',
      category: 'business',
      importance: 'critical'
    });
    solutionSpecificSkills.push({
      id: 'content-creation',
      title: 'Content Creation',
      description: 'Creating engaging content',
      category: 'business',
      importance: 'important'
    });
  }
  
  // Combine original skills with solution-specific skills
  return [...skills, ...solutionSpecificSkills];
}

export interface SkillAssessmentProps {
  businessArea: { title: string; description: string; icon: string };
  interests: string;
  ideaType?: { id: string; title: string; description: string; icon: string; examples: string[] } | null;
  solution?: { title: string; description: string; icon: string } | null;
  onComplete: (assessment: SkillAssessmentResult) => void;
}

export function SkillAssessment({ businessArea, interests, ideaType, solution, onComplete }: SkillAssessmentProps) {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);

  useEffect(() => {
    // Generate skills based on business area and solution
    let skillsForArea = getSkillsForBusinessArea(businessArea.title);
    
    // If we have a solution, tailor the skills to that specific solution
    if (solution) {
      skillsForArea = tailorSkillsForSolution(skillsForArea, solution);
    }
    
    setSkills(skillsForArea);
  }, [businessArea.title, solution]);

  function handleSkillToggle(skillId: string) {
    setSelectedSkills(prev => 
      prev.includes(skillId) 
        ? prev.filter(id => id !== skillId)
        : [...prev, skillId]
    );
  }

  function handleContinue() {
    const recommendations = [
      'Focus on building your core technical skills',
      'Practice communication and client management',
      'Learn basic marketing and sales techniques'
    ];
    const learningPath = [
      'Start with foundational skills',
      'Practice with small projects',
      'Build a portfolio of work'
    ];

    onComplete({
      skills,
      selectedSkills,
      recommendations,
      learningPath
    });
  }

  const selectedCount = selectedSkills.length;
  const totalSkills = skills.length;

  return (
    <Container>
      <Title>Select Your Skills for {solution ? solution.title : businessArea.title}</Title>
      <Subtitle>
        Check the skills you already have for this specific solution. This helps us tailor the business plan to your current capabilities.
      </Subtitle>
      
      <FormCard>
        <SelectionInfo>
          <strong>Selected {selectedCount} of {totalSkills} skills</strong>
          <br />
          <small>Don't worry if you don't have all skills - we'll suggest learning paths for missing ones</small>
        </SelectionInfo>
        
        <SkillsGrid>
          {skills.map(skill => (
            <SkillCard 
              key={skill.id} 
              category={skill.category} 
              importance={skill.importance}
              isSelected={selectedSkills.includes(skill.id)}
              onClick={() => handleSkillToggle(skill.id)}
            >
              <SkillHeader>
                <SkillTitle>{skill.title}</SkillTitle>
                <Checkbox
                  type="checkbox"
                  checked={selectedSkills.includes(skill.id)}
                  onChange={() => handleSkillToggle(skill.id)}
                  onClick={(e) => e.stopPropagation()}
                />
              </SkillHeader>
              <SkillDescription>{skill.description}</SkillDescription>
              <SkillMeta>
                <CategoryBadge category={skill.category}>
                  {skill.category.charAt(0).toUpperCase() + skill.category.slice(1)}
                </CategoryBadge>
                <ImportanceBadge importance={skill.importance}>
                  {skill.importance.charAt(0).toUpperCase() + skill.importance.slice(1)}
                </ImportanceBadge>
              </SkillMeta>
            </SkillCard>
          ))}
        </SkillsGrid>
        
        <Button onClick={handleContinue}>
          Continue to Business Plan
        </Button>
      </FormCard>
    </Container>
  );
} 