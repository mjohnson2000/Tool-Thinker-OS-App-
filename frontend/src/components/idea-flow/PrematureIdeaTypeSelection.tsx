import React, { useState } from 'react';
import styled from 'styled-components';

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
  color: var(--text-primary);
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
  align-items: flex-start;
  background: linear-gradient(135deg, #ffffff 0%, #fafbfc 100%);
  border: 2px solid ${props => props.isSelected ? '#181a1b' : '#E5E5E5'};
  border-radius: 16px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.06);
  padding: 1.8rem 1.5rem;
  cursor: pointer;
  outline: none;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  text-align: left;
  position: relative;
  transform: translateY(0);
  
  &:hover, &:focus {
    border: 2px solid #181a1b;
    background: linear-gradient(135deg, #f8f9fa 0%, #f1f3f4 100%);
    box-shadow: 0 12px 32px rgba(0,0,0,0.15);
    transform: translateY(-8px) scale(1.02);
    z-index: 10;
  }
  
  &:active {
    transform: translateY(-4px) scale(1.01);
  }
  
  /* Stack effect - each card slightly offset */
  &:nth-child(1) { transform: translateY(0); }
  &:nth-child(2) { transform: translateY(2px); }
  &:nth-child(3) { transform: translateY(4px); }
  &:nth-child(4) { transform: translateY(6px); }
  
  &:nth-child(1):hover { transform: translateY(-8px) scale(1.02); }
  &:nth-child(2):hover { transform: translateY(-6px) scale(1.02); }
  &:nth-child(3):hover { transform: translateY(-4px) scale(1.02); }
  &:nth-child(4):hover { transform: translateY(-2px) scale(1.02); }
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
  transition: all 0.2s ease;
  align-self: center;
  
  ${Card}:hover & {
    transform: scale(1.05);
    background: linear-gradient(135deg, #e9ecef 0%, #dee2e6 100%);
  }
`;

const CardTitle = styled.h3`
  font-size: 1.3rem;
  font-weight: 700;
  margin-bottom: 0.8rem;
  color: var(--text-primary);
  line-height: 1.3;
`;

const CardDescription = styled.p`
  color: var(--text-secondary);
  margin-bottom: 1.2rem;
  line-height: 1.5;
  font-size: 0.95rem;
`;

const Examples = styled.div`
  margin-top: auto;
`;

const ExampleTags = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-top: 0.5rem;
`;

const ExampleTag = styled.span`
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  color: var(--text-secondary);
  font-size: 0.8rem;
  padding: 0.25rem 0.6rem;
  border-radius: 12px;
  border: 1px solid #e9ecef;
  font-weight: 500;
`;

const ideaTypes = [
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

interface PrematureIdeaTypeSelectionProps {
  onSelect: (ideaType: { id: string; title: string; description: string; icon: string; examples: string[] }) => void;
}

export function PrematureIdeaTypeSelection({ onSelect }: PrematureIdeaTypeSelectionProps) {
  const [selected, setSelected] = useState<string | null>(null);

  function handleSelect(ideaType: typeof ideaTypes[0]) {
    setSelected(ideaType.id);
    setTimeout(() => {
      onSelect(ideaType);
    }, 150); // brief highlight for a11y
  }

  return (
    <Container>
      <Title>What type of business interests you?</Title>
      <Subtitle>
        Choose the category that best matches your skills and interests. This will help us tailor the discovery process to your specific goals.
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
              Examples:
              <ExampleTags>
                {ideaType.examples.slice(0, 3).map((example, index) => (
                  <ExampleTag key={index}>{example}</ExampleTag>
                ))}
              </ExampleTags>
            </Examples>
          </Card>
        ))}
      </Grid>
    </Container>
  );
} 