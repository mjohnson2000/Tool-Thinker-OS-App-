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
  max-width: 700px;
  margin: 0 auto;
  padding: 2rem;
`;

const Title = styled.h2`
  font-size: 2rem;
  font-weight: 700;
  margin-bottom: 2rem;
  text-align: center;
  color: #181a1b;
`;

const Subtitle = styled.p`
  color: #666;
  margin-bottom: 2rem;
  text-align: center;
  font-size: 1.1rem;
  line-height: 1.5;
`;

const SkillsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.5rem;
  width: 100%;
  margin-bottom: 2rem;
`;

const SkillCard = styled.div<{ category: string; importance: string; isSelected: boolean }>`
  padding: 1.5rem;
  border: 2px solid ${props => {
    if (props.isSelected) return '#181a1b';
    if (props.importance === 'critical') return '#dc3545';
    if (props.importance === 'important') return '#ffc107';
    return '#28a745';
  }};
  border-radius: 12px;
  background: ${props => props.isSelected ? '#f8f9fa' : 'white'};
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
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
  font-size: 0.95rem;
  color: #666;
  line-height: 1.4;
  margin-bottom: 0.5rem;
`;

const SkillMeta = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.85rem;
  color: #888;
`;

const CategoryBadge = styled.span<{ category: string }>`
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 500;
  background: ${props => {
    if (props.category === 'technical') return '#e3f2fd';
    if (props.category === 'soft') return '#f3e5f5';
    return '#e8f5e8';
  }};
  color: ${props => {
    if (props.category === 'technical') return '#1976d2';
    if (props.category === 'soft') return '#7b1fa2';
    return '#388e3c';
  }};
`;

const ImportanceBadge = styled.span<{ importance: string }>`
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 500;
  background: ${props => {
    if (props.importance === 'critical') return '#ffebee';
    if (props.importance === 'important') return '#fff8e1';
    return '#e8f5e8';
  }};
  color: ${props => {
    if (props.importance === 'critical') return '#c62828';
    if (props.importance === 'important') return '#f57f17';
    return '#2e7d32';
  }};
`;

const Button = styled.button`
  background: #181a1b;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 0.75rem 1.5rem;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s;
  margin-top: 1rem;
  
  &:hover {
    background: #000;
  }
  
  &:disabled {
    background: #ccc;
    cursor: not-allowed;
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
    </Container>
  );
} 