import React, { useState } from 'react';
import styled from 'styled-components';
import { useAuth } from '../../contexts/AuthContext';

interface LocationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
}

const ModalOverlay = styled.div<{ $isOpen: boolean }>`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: ${props => props.$isOpen ? 'flex' : 'none'};
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(4px);
`;

const ModalContent = styled.div`
  background: linear-gradient(135deg, #ffffff 0%, #fafbfc 100%);
  border-radius: 20px;
  padding: 2.5rem;
  box-shadow: 
    0 4px 20px rgba(0,0,0,0.08),
    0 1px 3px rgba(0,0,0,0.1);
  border: 1px solid rgba(255,255,255,0.8);
  width: 100%;
  max-width: 500px;
  margin: 1rem;
  position: relative;
  overflow: hidden;
  
  @media (max-width: 768px) {
    padding: 2rem 1.5rem;
    margin: 0.5rem;
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
`;

const Title = styled.h2`
  font-family: 'Audiowide', 'Courier New', monospace;
  font-size: 1.8rem;
  font-weight: 400;
  margin-bottom: 1rem;
  text-align: center;
  color: #181a1b;
  letter-spacing: -0.02em;
  
  @media (max-width: 768px) {
    font-size: 1.5rem;
  }
`;

const Subtitle = styled.p`
  text-align: center;
  color: #6b7280;
  margin-bottom: 2rem;
  font-size: 1rem;
  line-height: 1.5;
`;

const Input = styled.input`
  font-size: 1rem;
  font-weight: 500;
  margin-bottom: 1rem;
  color: #181a1b;
  width: 100%;
  text-align: left;
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  padding: 0.875rem 1rem;
  background: white;
  transition: all 0.3s ease;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
  
  &:focus {
    outline: none;
    border-color: #181a1b;
    box-shadow: 
      0 0 0 3px rgba(24, 26, 27, 0.1),
      0 4px 12px rgba(0,0,0,0.1);
    transform: translateY(-1px);
  }
  
  &::placeholder {
    color: #9ca3af;
    font-weight: 400;
  }
`;

const Button = styled.button`
  background: linear-gradient(135deg, #181a1b 0%, #4a4a4a 100%);
  color: white;
  border: none;
  border-radius: 12px;
  padding: 0.875rem 1.75rem;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  outline: none;
  box-shadow: 
    0 4px 16px rgba(24, 26, 27, 0.3),
    0 2px 8px rgba(24, 26, 27, 0.2);
  width: 100%;
  margin-top: 1rem;
  
  &:hover, &:focus {
    transform: translateY(-2px);
    box-shadow: 
      0 8px 24px rgba(24, 26, 27, 0.4),
      0 4px 12px rgba(24, 26, 27, 0.3);
  }
  
  &:active {
    transform: translateY(0);
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
`;

const ErrorMessage = styled.div`
  color: #dc2626;
  margin-bottom: 1rem;
  padding: 0.75rem 1rem;
  background: linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%);
  border: 1px solid #fecaca;
  border-radius: 12px;
  font-size: 0.9rem;
  font-weight: 500;
`;

const CloseButton = styled.button`
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: none;
  border: none;
  font-size: 1.5rem;
  color: #6b7280;
  cursor: pointer;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all 0.3s ease;
  z-index: 10;
  
  &:hover {
    background: rgba(0, 0, 0, 0.1);
    color: #374151;
    transform: scale(1.1);
  }
  
  &:focus {
    outline: none;
    box-shadow: 0 0 0 3px rgba(24, 26, 27, 0.1);
  }
  
  @media (max-width: 768px) {
    top: 0.75rem;
    right: 0.75rem;
    font-size: 1.25rem;
  }
`;

export function LocationModal({ isOpen, onClose, onSave }: LocationModalProps) {
  const { updateProfile } = useAuth();
  const [location, setLocation] = useState({
    city: '',
    region: '',
    country: '',
    zipCode: ''
  });
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSave = async () => {
    console.log('=== LocationModal: handleSave called ===');
    console.log('Location data to save:', location);
    
    if (!location.city || !location.region || !location.country) {
      setError('Please fill in City, State/Region, and Country');
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      const locationData = {
        location: {
          city: location.city.trim(),
          region: location.region.trim(),
          country: location.country.trim(),
          zipCode: location.zipCode.trim()
        }
      };
      
      console.log('Calling updateProfile with:', locationData);
      
      await updateProfile(locationData);
      
      console.log('updateProfile completed successfully');
      console.log('Calling onSave callback');
      onSave();
    } catch (err: any) {
      console.error('updateProfile failed:', err);
      setError(err.message || 'Failed to save location');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <ModalOverlay $isOpen={isOpen}>
      <ModalContent>
        <CloseButton onClick={onClose} aria-label="Close location modal">
          ×
        </CloseButton>
        <Title>📍 Add Your Location</Title>
        <Subtitle>
          To view local trending ideas, we need your location information. 
          This helps us generate opportunities specific to your area.
        </Subtitle>
        
        {error && <ErrorMessage>❌ {error}</ErrorMessage>}
        
        <Input
          type="text"
          value={location.city}
          onChange={e => setLocation(prev => ({ ...prev, city: e.target.value }))}
          placeholder="City"
          maxLength={100}
        />
        <Input
          type="text"
          value={location.region}
          onChange={e => setLocation(prev => ({ ...prev, region: e.target.value }))}
          placeholder="State/Region"
          maxLength={100}
        />
        <Input
          type="text"
          value={location.country}
          onChange={e => setLocation(prev => ({ ...prev, country: e.target.value }))}
          placeholder="Country"
          maxLength={100}
        />
        <Input
          type="text"
          value={location.zipCode}
          onChange={e => setLocation(prev => ({ ...prev, zipCode: e.target.value }))}
          placeholder="ZIP/Postal Code (optional)"
          maxLength={20}
        />
        
        <Button onClick={handleSave} disabled={isSaving}>
          {isSaving ? 'Saving...' : 'Save Location & Continue'}
        </Button>
      </ModalContent>
    </ModalOverlay>
  );
} 