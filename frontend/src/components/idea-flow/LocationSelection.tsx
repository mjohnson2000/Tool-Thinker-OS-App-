import React, { useState } from 'react';
import styled from 'styled-components';

export interface LocationData {
  city: string;
  region: string;
  country: string;
}

export interface LocationPreferenceOption {
  id: string;
  title: string;
  description: string;
  icon: string;
  requiresLocation: boolean;
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

const PreferenceSection = styled.div`
  width: 100%;
  margin-bottom: 2rem;
`;

const PreferenceLabel = styled.label`
  font-weight: 600;
  font-size: 1rem;
  color: var(--text-primary);
  margin-bottom: 0.5rem;
  display: block;
`;

const PreferenceSelect = styled.select`
  width: 100%;
  padding: 1rem;
  border: 2px solid #E5E5E5;
  border-radius: 12px;
  font-size: 1rem;
  background: #fafbfc;
  transition: border-color 0.2s;
  outline: none;
  cursor: pointer;
  
  &:focus {
    border-color: #181a1b;
  }
`;

const LocationSection = styled.div<{ isVisible: boolean }>`
  width: 100%;
  display: ${props => props.isVisible ? 'block' : 'none'};
  margin-top: 1rem;
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

const locationPreferenceOptions: LocationPreferenceOption[] = [
  {
    id: 'local',
    title: 'Local',
    description: 'Serve customers in my area',
    icon: '🏠',
    requiresLocation: true
  },
  {
    id: 'online',
    title: 'Online',
    description: 'Work with customers anywhere',
    icon: '🌐',
    requiresLocation: false
  },
  {
    id: 'hybrid',
    title: 'Both',
    description: 'Local and online customers',
    icon: '🔄',
    requiresLocation: true
  }
];

export interface LocationSelectionProps {
  onSelect: (location: LocationData) => void;
  ideaType?: { id: string; title: string; description: string; icon: string; examples: string[] } | null;
}

export function LocationSelection({ onSelect, ideaType }: LocationSelectionProps) {
  const [locationPreference, setLocationPreference] = useState<string>('local');
  const [city, setCity] = useState('');
  const [region, setRegion] = useState('');
  const [country, setCountry] = useState('');

  const selectedPreference = locationPreferenceOptions.find(option => option.id === locationPreference);
  const requiresLocation = selectedPreference?.requiresLocation ?? true;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    
    if (requiresLocation) {
      // If location is required, validate all fields
      if (country.trim() && region.trim() && city.trim()) {
        onSelect({ city: city.trim(), region: region.trim(), country: country.trim() });
      }
    } else {
      // If location is not required (online), use default values
      onSelect({ city: 'Online', region: 'Remote', country: 'Global' });
    }
  }

  return (
    <Container>
      <Title>Where will you operate your business?</Title>
      <Subtitle>
        Choose how you want to serve your customers. This helps us tailor your {ideaType?.title.toLowerCase() || 'side hustle'} opportunities to your preferred operating model.
      </Subtitle>
      
      <Form onSubmit={handleSubmit}>
        <PreferenceSection>
          <PreferenceLabel htmlFor="locationPreference">Operating Model</PreferenceLabel>
          <PreferenceSelect
            id="locationPreference"
            value={locationPreference}
            onChange={(e) => setLocationPreference(e.target.value)}
          >
            {locationPreferenceOptions.map(option => (
              <option key={option.id} value={option.id}>
                {option.icon} {option.title}
              </option>
            ))}
          </PreferenceSelect>
        </PreferenceSection>
        
        <LocationSection isVisible={requiresLocation}>
          <InputGroup>
            <Label htmlFor="country">Country</Label>
            <Input
              id="country"
              type="text"
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              placeholder="e.g., United States, Canada, United Kingdom"
              required={requiresLocation}
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
              required={requiresLocation}
            />
          </InputGroup>
          
          <InputGroup>
            <Label htmlFor="city">City</Label>
            <Input
              id="city"
              type="text"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="e.g., San Francisco, Austin, Miami"
              required={requiresLocation}
            />
          </InputGroup>
        </LocationSection>
        
        <Button 
          type="submit"
          disabled={requiresLocation && (!country.trim() || !region.trim() || !city.trim())}
        >
          Continue
        </Button>
      </Form>
      
      <InfoText>
        {requiresLocation 
          ? "We'll use this to find opportunities that match your local market and community needs"
          : "You'll be able to work with customers from anywhere through online platforms"
        }
      </InfoText>
    </Container>
  );
} 