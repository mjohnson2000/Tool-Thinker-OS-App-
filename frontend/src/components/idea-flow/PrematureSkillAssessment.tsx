import React, { useState, useEffect } from 'react';
import styled from 'styled-components';

export interface Skill {
  id: string;
  title: string;
  description: string;
  category: 'technical' | 'soft' | 'business';
  importance: 'critical' | 'important' | 'helpful';
}

const FormCard = styled.div`
  background: linear-gradient(135deg, #ffffff 0%, #fafbfc 100%);
  border-radius: 24px;
  padding: 2.5rem;
  width: 100%;
  max-width: 700px;
  box-shadow: 
    0 20px 60px rgba(24,26,27,0.12),
    0 8px 24px rgba(24,26,27,0.08);
  border: 1px solid rgba(255,255,255,0.8);
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: linear-gradient(90deg, #181a1b, #4a4a4a, #181a1b);
    border-radius: 24px 24px 0 0;
  }
  
  @media (max-width: 768px) {
    padding: 2rem 1.5rem;
    border-radius: 20px;
  }
`;

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  max-width: 700px;
  margin: 0 auto;
  padding: 2rem;
  text-align: center;
`;

const Title = styled.h2`
  font-size: 2.4rem;
  font-weight: 800;
  color: #181a1b;
  margin-bottom: 2.5rem;
  text-align: center;
  letter-spacing: -0.03em;
  background: linear-gradient(135deg, #181a1b 0%, #4a4a4a 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  position: relative;
  
  &::after {
    content: '';
    position: absolute;
    bottom: -12px;
    left: 50%;
    transform: translateX(-50%);
    width: 60px;
    height: 3px;
    background: linear-gradient(90deg, #181a1b, #4a4a4a);
    border-radius: 2px;
  }
  
  @media (max-width: 768px) {
    font-size: 2rem;
    margin-bottom: 2rem;
  }
`;

const Subtitle = styled.p`
  font-size: 1.1rem;
  color: var(--text-secondary);
  margin-bottom: 2.5rem;
  line-height: 1.6;
  max-width: 500px;
`;

const SelectionInfo = styled.div`
  background: linear-gradient(135deg, rgba(24, 26, 27, 0.05) 0%, rgba(24, 26, 27, 0.02) 100%);
  border: 1px solid rgba(24, 26, 27, 0.1);
  border-radius: 16px;
  padding: 1.5rem;
  margin-bottom: 2rem;
  text-align: left;
  position: relative;
`;

const ProgressBar = styled.div<{ progress: number }>`
  width: 100%;
  height: 4px;
  background: #e5e5e5;
  border-radius: 2px;
  margin-top: 1rem;
  overflow: hidden;
  position: relative;
  
  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    height: 100%;
    width: ${props => props.progress}%;
    background: linear-gradient(90deg, #181a1b, #4a4a4a);
    border-radius: 2px;
    transition: width 0.3s ease;
  }
`;

const SelectionInfoTitle = styled.h3`
  font-size: 1.2rem;
  font-weight: 700;
  color: #181a1b;
  margin-bottom: 0.8rem;
  letter-spacing: -0.02em;
`;

const SelectionInfoText = styled.p`
  font-size: 1rem;
  color: var(--text-secondary);
  line-height: 1.5;
`;

const SkillsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.5rem;
  width: 100%;
  margin-bottom: 2rem;
`;

const SkillCard = styled.button<{ isSelected: boolean; category: string }>`
  padding: 1.8rem 1.5rem;
  border: 2px solid ${props => {
    if (props.isSelected) return '#181a1b';
    switch (props.category) {
      case 'critical': return '#666666';
      case 'important': return '#999999';
      case 'helpful': return '#cccccc';
      default: return 'rgba(24, 26, 27, 0.1)';
    }
  }};
  border-radius: 16px;
  background: ${props => props.isSelected ? 'linear-gradient(135deg, #f0f0f0 0%, #e8e8e8 100%)' : 'linear-gradient(135deg, #ffffff 0%, #fafbfc 100%)'};
  box-shadow: ${props => props.isSelected ? '0 4px 16px rgba(24, 26, 27, 0.15)' : '0 2px 8px rgba(0,0,0,0.06)'};
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
  width: 100%;
  text-align: left;
  outline: none;
  
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
  
  &::after {
    content: ${props => props.isSelected ? '"✓ Selected"' : '""'};
    position: absolute;
    top: 0.5rem;
    right: 0.5rem;
    font-size: 0.75rem;
    font-weight: 600;
    color: #181a1b;
    background: rgba(24, 26, 27, 0.1);
    padding: 0.25rem 0.5rem;
    border-radius: 4px;
    opacity: ${props => props.isSelected ? 1 : 0};
    transition: opacity 0.3s ease;
  }
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(0,0,0,0.12);
    background: linear-gradient(135deg, #f8f9fa 0%, #f1f3f4 100%);
  }
  
  &:focus {
    outline: 2px solid #181a1b;
    outline-offset: 2px;
  }
`;

const SkillHeader = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 0.5rem;
  position: relative;
`;

const Checkbox = styled.input`
  margin: 0;
  width: 20px;
  height: 20px;
  accent-color: #181a1b;
  cursor: pointer;
  position: absolute;
  top: 0;
  right: 0;
  z-index: 2;
  
  &:hover {
    transform: scale(1.1);
  }
`;

const SkillTitle = styled.h3`
  font-size: 1.2rem;
  font-weight: 700;
  color: #181a1b;
  margin-bottom: 0.8rem;
  letter-spacing: -0.02em;
  flex: 1;
  margin-right: 1rem;
`;

const SkillDescription = styled.p`
  font-size: 1rem;
  color: var(--text-secondary);
  line-height: 1.5;
  margin-bottom: 1rem;
`;



const ContinueButton = styled.button`
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
  
  &:hover:not(:disabled) {
    background: linear-gradient(135deg, #000 0%, #181a1b 100%);
    transform: translateY(-3px);
    box-shadow: 0 12px 32px rgba(0,0,0,0.25);
    
    &::before {
      left: 100%;
    }
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

// Dynamic skills based on business area
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
      id: 'marketing',
      title: 'Marketing & Sales',
      description: 'Ability to promote products/services and convert prospects into customers',
      category: 'business',
      importance: 'critical'
    },
    {
      id: 'communication',
      title: 'Communication',
      description: 'Clear verbal and written communication with customers, partners, and team',
      category: 'soft',
      importance: 'critical'
    },
    {
      id: 'financial-literacy',
      title: 'Financial Literacy',
      description: 'Understanding budgets, pricing, cash flow, and basic accounting',
      category: 'business',
      importance: 'critical'
    }
  ];
};

interface PrematureSkillAssessmentProps {
  onComplete: (assessment: {
    selectedSkills: string[];
    missingSkills: string[];
    recommendations: string[];
    learningPath: string[];
  }) => void;
  businessArea?: any;
  interests?: string;
  ideaType?: { id: string; title: string; description: string; icon: string; examples: string[] } | null;
  solution?: any;
  onClear?: () => void;
}

export function PrematureSkillAssessment({ onComplete, businessArea, interests, ideaType, solution, onClear }: PrematureSkillAssessmentProps) {
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [skills, setSkills] = useState<Skill[]>([]);

  useEffect(() => {
    // Get skills based on business area
    const businessAreaTitle = businessArea?.title || 'General';
    const skillsForArea = getSkillsForBusinessArea(businessAreaTitle);
    setSkills(skillsForArea);
  }, [businessArea]);

  const handleSkillToggle = (skillId: string) => {
    setSelectedSkills(prev => 
      prev.includes(skillId) 
        ? prev.filter(id => id !== skillId)
        : [...prev, skillId]
    );
  };

  const handleContinue = () => {
    const criticalSkills = skills.filter(skill => skill.importance === 'critical').map(skill => skill.id);
    const importantSkills = skills.filter(skill => skill.importance === 'important').map(skill => skill.id);
    
    const missingSkills = [
      ...criticalSkills.filter(skill => !selectedSkills.includes(skill)),
      ...importantSkills.filter(skill => !selectedSkills.includes(skill))
    ];

    const recommendations = missingSkills.length > 0 
      ? [
          'Focus on developing critical skills first, especially marketing and financial literacy',
          'Consider taking online courses or workshops for missing skills',
          'Find mentors or partners who can complement your skill gaps',
          'Start with a smaller scope that matches your current capabilities'
        ]
      : [
          'You have a strong foundation! Focus on execution and continuous improvement',
          'Consider specializing in areas where you excel',
          'Build systems and processes to leverage your skills effectively'
        ];

    const learningPath = missingSkills.length > 0 
      ? [
          'Week 1-2: Focus on marketing fundamentals and customer acquisition',
          'Week 3-4: Develop financial management and pricing strategies',
          'Week 5-6: Build customer service and communication skills',
          'Week 7-8: Implement systems and processes for scalability'
        ]
      : [
          'Week 1-2: Validate your business idea with potential customers',
          'Week 3-4: Build your MVP and launch strategy',
          'Week 5-6: Scale marketing and customer acquisition',
          'Week 7-8: Optimize operations and prepare for growth'
        ];

    onComplete({
      selectedSkills,
      missingSkills: skills.filter(skill => missingSkills.includes(skill.id)).map(skill => skill.title),
      recommendations,
      learningPath
    });
  };

  return (
    <Container>
      <Title>What skills do you have?</Title>
      <Subtitle>
        Select the skills you currently possess. This helps us identify any gaps and provide targeted recommendations for your business journey.
      </Subtitle>
      
      <FormCard>
        <SelectionInfo>
          <SelectionInfoTitle>Skill Assessment Guide</SelectionInfoTitle>
          <SelectionInfoText>
            <strong>Selected {selectedSkills.length} of {skills.length} skills</strong><br/>
            <small>Click on any skill card or checkbox to select/deselect. Don't worry if you don't have all skills - we'll suggest learning paths for missing ones</small>
          </SelectionInfoText>
          <ProgressBar progress={(selectedSkills.length / skills.length) * 100} />
        </SelectionInfo>

        <SkillsGrid>
          {skills.map((skill) => (
            <SkillCard
              key={skill.id}
              isSelected={selectedSkills.includes(skill.id)}
              category={skill.category}
              onClick={() => handleSkillToggle(skill.id)}
              aria-pressed={selectedSkills.includes(skill.id)}
              aria-label={`Select ${skill.title} skill`}
              type="button"
            >
              <SkillHeader>
                <SkillTitle>{skill.title}</SkillTitle>
                <Checkbox
                  type="checkbox"
                  checked={selectedSkills.includes(skill.id)}
                  onChange={() => handleSkillToggle(skill.id)}
                  onClick={(e) => e.stopPropagation()}
                  aria-label={`Checkbox for ${skill.title}`}
                />
              </SkillHeader>
              <SkillDescription>{skill.description}</SkillDescription>

            </SkillCard>
          ))}
        </SkillsGrid>
        
        <ContinueButton 
          onClick={handleContinue}
          disabled={selectedSkills.length === 0}
        >
          {selectedSkills.length === 0 
            ? 'Please select at least one skill to continue' 
            : `Continue (${selectedSkills.length} skills selected)`
          }
        </ContinueButton>
      </FormCard>
      
              <div style={{ textAlign: 'center', marginTop: '2rem' }}>
          <ClearButton onClick={() => window.location.reload()}>Refresh Page</ClearButton>
        </div>
    </Container>
  );
} 