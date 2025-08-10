import React, { useState } from 'react';
import styled from 'styled-components';

export interface LocationData {
  city: string;
  region: string;
  country: string;
  operatingModel: string;
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

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 2rem;
`;

const PreferenceSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const PreferenceLabel = styled.label`
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 0.5rem;
`;

const SelectWrapper = styled.div`
  position: relative;
`;

const PreferenceSelect = styled.select`
  width: 100%;
  padding: 1rem 1.2rem;
  font-size: 1rem;
  border: 2px solid #E5E5E5;
  border-radius: 12px;
  background: linear-gradient(135deg, #ffffff 0%, #fafbfc 100%);
  color: var(--text-primary);
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  appearance: none;
  background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6,9 12,15 18,9'%3e%3c/polyline%3e%3c/svg%3e");
  background-repeat: no-repeat;
  background-position: right 1rem center;
  background-size: 1em;
  
  &:hover {
    border-color: #181a1b;
    box-shadow: 0 4px 12px rgba(24, 26, 27, 0.1);
  }
  
  &:focus {
    outline: none;
    border-color: #181a1b;
    box-shadow: 0 0 0 3px rgba(24, 26, 27, 0.1);
  }
`;

const LocationSection = styled.div<{ isVisible: boolean }>`
  display: ${props => props.isVisible ? 'flex' : 'none'};
  flex-direction: column;
  gap: 1.5rem;
  animation: ${props => props.isVisible ? 'slideDown 0.3s ease-out' : 'none'};
  
  @keyframes slideDown {
    from {
      opacity: 0;
      transform: translateY(-10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;

const LocationFieldsGroup = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const InputGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const InputGroupFull = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const Label = styled.label`
  font-size: 0.95rem;
  font-weight: 600;
  color: var(--text-primary);
  display: flex;
  align-items: center;
  gap: 0.25rem;
`;

const RequiredIndicator = styled.span`
  color: #dc3545;
  font-weight: 700;
`;

const InputWrapper = styled.div`
  position: relative;
  display: flex;
  align-items: center;
`;

const InputIcon = styled.span`
  position: absolute;
  left: 1rem;
  font-size: 1.1rem;
  color: var(--text-secondary);
  z-index: 1;
`;

const Input = styled.input`
  width: 100%;
  padding: 1rem 1rem 1rem 3rem;
  font-size: 1rem;
  border: 2px solid #E5E5E5;
  border-radius: 12px;
  background: linear-gradient(135deg, #ffffff 0%, #fafbfc 100%);
  color: var(--text-primary);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  
  &::placeholder {
    color: var(--text-secondary);
    opacity: 0.7;
  }
  
  &:hover {
    border-color: #181a1b;
    box-shadow: 0 4px 12px rgba(24, 26, 27, 0.1);
  }
  
  &:focus {
    outline: none;
    border-color: #181a1b;
    box-shadow: 0 0 0 3px rgba(24, 26, 27, 0.1);
  }
`;

const SubmitButton = styled.button`
  background: linear-gradient(135deg, #181a1b 0%, #2d2d2d 100%);
  color: #ffffff;
  border: none;
  border-radius: 12px;
  padding: 1rem 2rem;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 4px 12px rgba(24, 26, 27, 0.15);
  position: relative;
  overflow: hidden;
  letter-spacing: 0.02em;
  
  &:hover:not(:disabled) {
    background: linear-gradient(135deg, #2d2d2d 0%, #181a1b 100%);
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(24, 26, 27, 0.25);
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
  
  @media (max-width: 768px) {
    padding: 1rem 1.5rem;
    font-size: 1rem;
  }
`;

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

interface PrematureLocationSelectionProps {
  onSelect: (location: LocationData) => void;
  ideaType?: { id: string; title: string; description: string; icon: string; examples: string[] } | null;
  onClear?: () => void;
}

export function PrematureLocationSelection({ onSelect, ideaType, onClear }: PrematureLocationSelectionProps) {
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
          onSelect({ 
            city: city.trim(), 
            region: region.trim(), 
            country: country.trim(),
            operatingModel: locationPreference
          });
        }
      } else {
        // If location is not required (online), use default values
        onSelect({ 
          city: 'Online', 
          region: 'Remote', 
          country: 'Global',
          operatingModel: locationPreference
        });
      }
      setIsLoading(false);
    }, 800);
  }

  return (
    <Container>
      <Title>Where will you operate your business?</Title>
      <Subtitle>
        Choose how you want to serve your customers. This helps us tailor your {ideaType?.title.toLowerCase() || 'business'} opportunities to your preferred operating model.
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
                  placeholder="e.g., New York, Los Angeles, Chicago"
                  required={requiresLocation}
                />
              </InputWrapper>
            </InputGroupFull>
          </LocationSection>
          
          <SubmitButton type="submit" disabled={isLoading || (requiresLocation && (!country.trim() || !region.trim() || !city.trim()))}>
            {isLoading ? (
              <>
                <LoadingSpinner />
                Processing...
              </>
            ) : (
              'Continue'
            )}
          </SubmitButton>
        </Form>
      </FormCard>
      
              <div style={{ textAlign: 'center', marginTop: '2rem' }}>
          <ClearButton onClick={() => window.location.reload()}>Refresh Page</ClearButton>
        </div>
    </Container>
  );
} 