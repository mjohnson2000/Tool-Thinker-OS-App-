import { useState, useEffect, useCallback } from 'react';

export interface AutomatedDiscoveryState {
  currentStage: number;
  completedStages: string[];
  loading: boolean;
  error: string | null;
  logs: string[];
  processSteps: string[];
  completedSteps: string[];
  currentProcessStep: string;
  isGeneratingValidationScore: boolean;
  isAutoImproving: boolean;
}

export interface AutomatedDiscoveryActions {
  setCurrentStage: (stage: number) => void;
  setCompletedStages: (stages: string[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  addLog: (log: string) => void;
  setProcessSteps: (steps: string[]) => void;
  setCompletedSteps: (steps: string[]) => void;
  setCurrentProcessStep: (step: string) => void;
  setIsGeneratingValidationScore: (loading: boolean) => void;
  setIsAutoImproving: (loading: boolean) => void;
  handleStageNavigation: (stage: number) => void;
}

export function useAutomatedDiscovery() {
  const [currentStage, setCurrentStage] = useState(0);
  const [completedStages, setCompletedStages] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [logs, setLogs] = useState<string[]>([]);
  const [processSteps, setProcessSteps] = useState<string[]>([]);
  const [completedSteps, setCompletedSteps] = useState<string[]>([]);
  const [currentProcessStep, setCurrentProcessStep] = useState('');
  const [isGeneratingValidationScore, setIsGeneratingValidationScore] = useState(false);
  const [isAutoImproving, setIsAutoImproving] = useState(false);

  const addLog = useCallback((log: string) => {
    setLogs(prev => [...prev, log]);
  }, []);

  const handleStageNavigation = useCallback((stage: number) => {
    if (stage <= currentStage || completedStages.includes(stage.toString())) {
      setCurrentStage(stage);
    }
  }, [currentStage, completedStages]);

  const state: AutomatedDiscoveryState = {
    currentStage,
    completedStages,
    loading,
    error,
    logs,
    processSteps,
    completedSteps,
    currentProcessStep,
    isGeneratingValidationScore,
    isAutoImproving,
  };

  const actions: AutomatedDiscoveryActions = {
    setCurrentStage,
    setCompletedStages,
    setLoading,
    setError,
    addLog,
    setProcessSteps,
    setCompletedSteps,
    setCurrentProcessStep,
    setIsGeneratingValidationScore,
    setIsAutoImproving,
    handleStageNavigation,
  };

  return { state, actions };
} 