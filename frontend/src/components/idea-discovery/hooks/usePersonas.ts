import { useState, useCallback } from 'react';

export interface Persona {
  id: string;
  name: string;
  avatarUrl?: string;
  summary: string;
  role?: string;
  companySize?: string;
  industry?: string;
  age?: string;
  experience?: string;
  budget?: string;
  painPoints?: string[];
  goals?: string[];
  decisionFactors?: string[];
  objections?: string[];
  communicationStyle?: string;
  techSavviness?: string;
  validationQuestions?: string[];
  feedback: string[];
  feedbackQuality?: 'pending' | 'good' | 'poor';
  expanded?: boolean;
}

export function usePersonas() {
  const [personas, setPersonas] = useState<Persona[]>([]);
  const [collectiveSummary, setCollectiveSummary] = useState('');

  const togglePersonaExpand = useCallback((id: string) => {
    setPersonas(prev => prev.map(p => 
      p.id === id ? { ...p, expanded: !p.expanded } : p
    ));
  }, []);

  const updatePersonaFeedback = useCallback((personaId: string, feedback: string[]) => {
    setPersonas(prev => prev.map(p => 
      p.id === personaId ? { ...p, feedback } : p
    ));
  }, []);

  const setPersonaFeedbackQuality = useCallback((personaId: string, quality: 'pending' | 'good' | 'poor') => {
    setPersonas(prev => prev.map(p => 
      p.id === personaId ? { ...p, feedbackQuality: quality } : p
    ));
  }, []);

  return {
    personas,
    setPersonas,
    collectiveSummary,
    setCollectiveSummary,
    togglePersonaExpand,
    updatePersonaFeedback,
    setPersonaFeedbackQuality,
  };
} 