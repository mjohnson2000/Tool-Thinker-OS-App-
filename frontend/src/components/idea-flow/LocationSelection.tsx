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

const PreferenceSection = styled.div`
  width: 100%;
  margin-bottom: 3rem;
  padding-bottom: 2.5rem;
  border-bottom: 2px solid #f1f3f4;
  position: relative;
  
  &::after {
    content: '';
    position: absolute;
    bottom: -2px;
    left: 0;
    width: 60px;
    height: 2px;
    background: linear-gradient(90deg, #181a1b, #4a4a4a);
    border-radius: 1px;
  }
`;

const PreferenceLabel = styled.label`
  font-weight: 700;
  font-size: 1.15rem;
  color: var(--text-primary);
  margin-bottom: 1rem;
  display: block;
  letter-spacing: -0.01em;
  position: relative;
  
  &::before {
    content: '⚙️';
    margin-right: 0.5rem;
    font-size: 1rem;
  }
`;

const PreferenceSelect = styled.select`
  width: 100%;
  padding: 1.3rem 1.5rem 1.3rem 3rem;
  border: 2px solid #E5E5E5;
  border-radius: 14px;
  font-size: 1.1rem;
  font-weight: 500;
  background: linear-gradient(135deg, #fafbfc 0%, #f8f9fa 100%);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  outline: none;
  cursor: pointer;
  appearance: none;
  color: #181a1b;
  box-shadow: 0 2px 4px rgba(0,0,0,0.04);
  position: relative;
  
  &:focus {
    border-color: #181a1b;
    box-shadow: 0 0 0 3px rgba(24, 26, 27, 0.1), 0 4px 12px rgba(0,0,0,0.08);
    background: linear-gradient(135deg, #fff 0%, #fafbfc 100%);
    transform: translateY(-1px);
  }
  
  &:hover {
    border-color: #ccc;
    background: linear-gradient(135deg, #f8f9fa 0%, #f1f3f4 100%);
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(0,0,0,0.08);
  }
  
  option {
    padding: 0.8rem;
    font-size: 1rem;
    background: #fff;
  }
`;

const SelectWrapper = styled.div`
  position: relative;
  width: 100%;
  
  &::after {
    content: '▼';
    position: absolute;
    left: 1.2rem;
    top: 50%;
    transform: translateY(-50%);
    color: #444;
    font-size: 0.8rem;
    pointer-events: none;
    z-index: 1;
    transition: color 0.3s ease;
  }
  
  &:hover::after {
    color: #666;
  }
  
  &:focus-within::after {
    color: #181a1b;
  }
`;

const LocationSection = styled.div<{ isVisible: boolean }>`
  width: 100%;
  display: ${props => props.isVisible ? 'block' : 'none'};
  margin-top: 1.5rem;
`;

const LocationFieldsGroup = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
  margin-bottom: 2rem;
  
  @media (max-width: 600px) {
    grid-template-columns: 1fr;
  }
`;

const Form = styled.form`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 0;
`;

const InputGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
`;

const InputGroupFull = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
  grid-column: 1 / -1;
`;

const Label = styled.label`
  font-weight: 600;
  font-size: 0.95rem;
  color: var(--text-primary);
  letter-spacing: 0.01em;
  display: flex;
  align-items: center;
  gap: 0.3rem;
`;

const RequiredIndicator = styled.span`
  color: #000;
  font-size: 0.8rem;
`;

const Input = styled.input`
  width: 100%;
  padding: 1.2rem 1rem 1.2rem 3.2rem;
  border: 2px solid #E5E5E5;
  border-radius: 14px;
  font-size: 1rem;
  background: linear-gradient(135deg, #fafbfc 0%, #f8f9fa 100%);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  outline: none;
  position: relative;
  box-shadow: 0 2px 4px rgba(0,0,0,0.04);
  
  &:focus {
    border-color: #181a1b;
    box-shadow: 0 0 0 3px rgba(24, 26, 27, 0.1), 0 4px 12px rgba(0,0,0,0.08);
    background: linear-gradient(135deg, #fff 0%, #fafbfc 100%);
    transform: translateY(-1px);
  }
  
  &:hover {
    border-color: #ccc;
    background: linear-gradient(135deg, #f8f9fa 0%, #f1f3f4 100%);
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(0,0,0,0.08);
  }
`;

const InputWrapper = styled.div`
  position: relative;
  width: 100%;
`;

const InputIcon = styled.div`
  position: absolute;
  left: 1.2rem;
  top: 50%;
  transform: translateY(-50%);
  color: #666;
  font-size: 1.2rem;
  pointer-events: none;
  z-index: 1;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  
  ${InputWrapper}:hover & {
    transform: translateY(-50%) scale(1.1);
    color: #181a1b;
  }
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
  margin-top: 2.5rem;
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
  
  &:disabled {
    background: linear-gradient(135deg, #ccc 0%, #ddd 100%);
    cursor: not-allowed;
    transform: none;
    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    
    &::before {
      display: none;
    }
  }
`;

const InfoText = styled.p`
  font-size: 1rem;
  color: var(--text-secondary);
  text-align: center;
  margin-top: 1.5rem;
  padding: 1rem 1.5rem;
  background: linear-gradient(135deg, #f8f9fa 0%, #f1f3f4 100%);
  border-radius: 12px;
  border: 1px solid #e9ecef;
  font-weight: 500;
  line-height: 1.5;
  opacity: 0.9;
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

const LoadingSpinner = styled.div`
  display: inline-block;
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255,255,255,0.3);
  border-radius: 50%;
  border-top-color: #fff;
  animation: spin 1s ease-in-out infinite;
  margin-right: 0.5rem;
  
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
`;

export interface LocationSelectionProps {
  onSelect: (location: LocationData) => void;
  ideaType?: { id: string; title: string; description: string; icon: string; examples: string[] } | null;
}

export function LocationSelection({ onSelect, ideaType }: LocationSelectionProps) {
  const [locationPreference, setLocationPreference] = useState<string>('local');
  const [city, setCity] = useState('');
  const [region, setRegion] = useState('');
  const [country, setCountry] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const selectedPreference = locationPreferenceOptions.find(option => option.id === locationPreference);
  const requiresLocation = selectedPreference?.requiresLocation ?? true;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);
    
    // Simulate processing time
    setTimeout(() => {
      if (requiresLocation) {
        // If location is required, validate all fields
        if (country.trim() && region.trim() && city.trim()) {
          onSelect({ city: city.trim(), region: region.trim(), country: country.trim() });
        }
      } else {
        // If location is not required (online), use default values
        onSelect({ city: 'Online', region: 'Remote', country: 'Global' });
      }
      setIsLoading(false);
    }, 800);
  }

  return (
    <Container>
      <Title>Where will you operate your business?</Title>
      <Subtitle>
        Choose how you want to serve your customers. This helps us tailor your {ideaType?.title.toLowerCase() || 'side hustle'} opportunities to your preferred operating model.
      </Subtitle>
      
      <FormCard>
        <Form onSubmit={handleSubmit}>
                  <PreferenceSection>
          <PreferenceLabel htmlFor="locationPreference">Operating Model</PreferenceLabel>
          <SelectWrapper>
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
          </SelectWrapper>
        </PreferenceSection>
          
          <LocationSection isVisible={requiresLocation}>
            <LocationFieldsGroup>
              <InputGroup>
                <Label htmlFor="country">
                  Country
                  {requiresLocation && <RequiredIndicator>*</RequiredIndicator>}
                </Label>
                <InputWrapper>
                  <InputIcon>🌍</InputIcon>
                  <Input
                    id="country"
                    type="text"
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    placeholder="e.g., United States, Canada, United Kingdom"
                    required={requiresLocation}
                  />
                </InputWrapper>
              </InputGroup>
              
              <InputGroup>
                <Label htmlFor="region">
                  State/Region
                  {requiresLocation && <RequiredIndicator>*</RequiredIndicator>}
                </Label>
                <InputWrapper>
                  <InputIcon>🗺️</InputIcon>
                  <Input
                    id="region"
                    type="text"
                    value={region}
                    onChange={(e) => setRegion(e.target.value)}
                    placeholder="e.g., California, Texas, Florida"
                    required={requiresLocation}
                  />
                </InputWrapper>
              </InputGroup>
            </LocationFieldsGroup>
            
            <InputGroupFull>
              <Label htmlFor="city">
                City
                {requiresLocation && <RequiredIndicator>*</RequiredIndicator>}
              </Label>
              <InputWrapper>
                <InputIcon>🏙️</InputIcon>
                <Input
                  id="city"
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="e.g., San Francisco, Austin, Miami"
                  required={requiresLocation}
                />
              </InputWrapper>
            </InputGroupFull>
          </LocationSection>
          
          <Button 
            type="submit"
            disabled={requiresLocation && (!country.trim() || !region.trim() || !city.trim()) || isLoading}
          >
            {isLoading ? (
              <>
                <LoadingSpinner />
                Processing...
              </>
            ) : (
              'Continue'
            )}
          </Button>
        </Form>
      </FormCard>
      
      <InfoText>
        {requiresLocation 
          ? "We'll use this to find opportunities that match your local market and community needs"
          : "You'll be able to work with customers from anywhere through online platforms"
        }
      </InfoText>
    </Container>
  );
} 