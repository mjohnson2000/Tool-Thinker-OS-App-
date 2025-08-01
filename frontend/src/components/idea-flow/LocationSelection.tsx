import React, { useState } from 'react';
import styled from 'styled-components';

export interface LocationData {
  city: string;
  region: string;
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
`;

const Subtitle = styled.p`
  color: var(--text-secondary);
  margin-bottom: 2rem;
  text-align: center;
`;

const Form = styled.form`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const InputGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const Label = styled.label`
  font-weight: 600;
  font-size: 1rem;
  color: var(--text-primary);
`;

const Input = styled.input`
  width: 100%;
  padding: 1rem;
  border: 2px solid #E5E5E5;
  border-radius: 12px;
  font-size: 1rem;
  background: #fafbfc;
  transition: border-color 0.2s;
  outline: none;
  
  &:focus {
    border-color: #181a1b;
  }
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

const InfoText = styled.p`
  font-size: 0.9rem;
  color: var(--text-secondary);
  text-align: center;
  margin-top: 1rem;
`;

export interface LocationSelectionProps {
  onSelect: (location: LocationData) => void;
  interests?: string;
  businessArea?: { title: string; description: string; icon: string } | null;
}

export function LocationSelection({ onSelect, interests, businessArea }: LocationSelectionProps) {
  const [city, setCity] = useState('');
  const [region, setRegion] = useState('');

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (city.trim() && region.trim()) {
      onSelect({ city: city.trim(), region: region.trim() });
    }
  }

  return (
    <Container>
      <Title>Where are you located?</Title>
      <Subtitle>
        This helps us find side hustle opportunities that work well in your local area
      </Subtitle>
      
      <Form onSubmit={handleSubmit}>
        <InputGroup>
          <Label htmlFor="city">City</Label>
          <Input
            id="city"
            type="text"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            placeholder="e.g., San Francisco, Austin, Miami"
            required
          />
        </InputGroup>
        
        <InputGroup>
          <Label htmlFor="region">State/Region</Label>
          <Input
            id="region"
            type="text"
            value={region}
            onChange={(e) => setRegion(e.target.value)}
            placeholder="e.g., California, Texas, Florida"
            required
          />
        </InputGroup>
        
        <Button 
          type="submit"
          disabled={!city.trim() || !region.trim()}
        >
          Continue
        </Button>
      </Form>
      
      <InfoText>
        We'll use this to find opportunities that match your local market and community needs
      </InfoText>
    </Container>
  );
} 