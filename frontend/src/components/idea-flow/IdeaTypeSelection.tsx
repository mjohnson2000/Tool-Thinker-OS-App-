import React, { useState } from 'react';
import styled from 'styled-components';

export interface IdeaType {
  id: string;
  title: string;
  description: string;
  icon: string;
  examples: string[];
}

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  max-width: 900px;
  margin: 0 auto;
  padding: 2rem;
`;

const Title = styled.h2`
  font-size: 2rem;
  font-weight: 700;
  margin-bottom: 1rem;
  text-align: center;
`;

const Subtitle = styled.p`
  color: var(--text-secondary);
  margin-bottom: 2rem;
  text-align: center;
  font-size: 1.1rem;
  line-height: 1.5;
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.5rem;
  width: 100%;
`;

const Card = styled.button<{ isSelected: boolean }>`
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
  text-align: center;
  
  &:hover, &:focus {
    border: 2px solid #181a1b;
    box-shadow: 0 6px 18px rgba(0,0,0,0.12);
  }
`;

const Icon = styled.div`
  font-size: 3rem;
  margin-bottom: 1rem;
`;

const CardTitle = styled.h3`
  font-weight: 600;
  font-size: 1.2rem;
  margin-bottom: 0.5rem;
  color: var(--text-primary);
`;

const CardDescription = styled.p`
  color: var(--text-secondary);
  font-size: 0.95rem;
  line-height: 1.4;
  margin-bottom: 1rem;
`;

const Examples = styled.div`
  font-size: 0.85rem;
  color: var(--text-secondary);
  font-style: italic;
`;

export interface IdeaTypeSelectionProps {
  onSelect: (ideaType: IdeaType) => void;
  interests?: string;
}

const ideaTypes: IdeaType[] = [
  {
    id: 'digital-services',
    title: 'Digital Services',
    description: 'Online services you can provide remotely using technology and digital skills.',
    icon: '💻',
    examples: ['Web design', 'Social media management', 'Virtual assistance', 'Data entry', 'Online admin']
  },
  {
    id: 'local-services',
    title: 'Local Services',
    description: 'Services you provide in your local community, often in-person.',
    icon: '🏠',
    examples: ['Pet sitting', 'House cleaning', 'Handyman work', 'Delivery', 'Local errands']
  },
  {
    id: 'creative-services',
    title: 'Creative Services',
    description: 'Artistic and creative work that showcases your talents and skills.',
    icon: '🎨',
    examples: ['Photography', 'Graphic design', 'Content creation', 'Video editing', 'Writing']
  },
  {
    id: 'professional-services',
    title: 'Professional Services',
    description: 'Expert services based on your professional knowledge and experience.',
    icon: '👔',
    examples: ['Consulting', 'Tutoring', 'Coaching', 'Bookkeeping', 'Legal assistance']
  },
  {
    id: 'physical-products',
    title: 'Physical Products',
    description: 'Creating, making, or selling tangible products to customers.',
    icon: '🛍️',
    examples: ['Crafts', 'Food products', 'Handmade items', 'Reselling', 'Dropshipping']
  },
  {
    id: 'online-business',
    title: 'Online Business',
    description: 'Building digital businesses that can scale beyond local markets.',
    icon: '🌐',
    examples: ['E-commerce', 'Affiliate marketing', 'Digital products', 'Online courses', 'Membership sites']
  }
];

export function IdeaTypeSelection({ onSelect, interests }: IdeaTypeSelectionProps) {
  const [selected, setSelected] = useState<string | null>(null);

  function handleSelect(ideaType: IdeaType) {
    setSelected(ideaType.id);
    setTimeout(() => {
      onSelect(ideaType);
    }, 150); // brief highlight for a11y
  }

  return (
    <Container>
      <Title>What type of side hustle interests you?</Title>
      <Subtitle>
        Choose the category that best matches your skills and interests. 
        {interests && ` We'll focus on opportunities related to: ${interests}`}
      </Subtitle>
      
      <Grid>
        {ideaTypes.map(ideaType => (
          <Card
            key={ideaType.id}
            isSelected={selected === ideaType.id}
            onClick={() => handleSelect(ideaType)}
            aria-pressed={selected === ideaType.id}
            tabIndex={0}
          >
            <Icon>{ideaType.icon}</Icon>
            <CardTitle>{ideaType.title}</CardTitle>
            <CardDescription>{ideaType.description}</CardDescription>
            <Examples>
              Examples: {ideaType.examples.slice(0, 3).join(', ')}...
            </Examples>
          </Card>
        ))}
      </Grid>
    </Container>
  );
} 