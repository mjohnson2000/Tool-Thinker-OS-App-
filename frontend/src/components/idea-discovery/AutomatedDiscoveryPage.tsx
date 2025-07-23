import React, { useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Lottie from 'lottie-react';
import robotLottie from '../../assets/robot-lottie.json';
import { RobotFace } from './RobotFace';
import { BusinessPlanModal } from './shared/BusinessPlanModal';

interface Persona {
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
}

interface ValidationScore {
  score: number;
  criteria: {
    problemIdentification: number;
    problemValidation: number;
    problemScope: number;
    problemUrgency: number;
    problemImpact: number;
    // Customer Profile criteria
    customerClarity: number;
    customerSpecificity: number;
    customerRelevance: number;
    customerAccessibility: number;
    customerValue: number;
    // Customer Struggle criteria
    struggleIdentification: number;
    struggleValidation: number;
    struggleUrgency: number;
    struggleFrequency: number;
    struggleImpact: number;
    // Solution Fit criteria
    solutionAlignment: number;
    solutionEffectiveness: number;
    solutionDifferentiation: number;
    solutionValue: number;
    solutionFeasibility: number;
    // Business Model criteria
    modelViability: number;
    revenuePotential: number;
    costEfficiency: number;
    competitiveAdvantage: number;
    scalability: number;
    // Market Validation criteria
    marketSize: number;
    marketDemand: number;
    marketTiming: number;
    competitiveLandscape: number;
    marketAccess: number;
  };
  discoveredProblems?: string[];
  recommendations: string[];
  confidence: 'high' | 'medium' | 'low';
  shouldProceed: boolean;
}

const STAGES = [
  'Problem Discovery',
  'Customer Profile',
  'Customer Struggle',
  'Solution Fit',
  'Business Model',
  'Market Validation',
  'Launch',
];

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

export function AutomatedDiscoveryPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [currentStage, setCurrentStage] = React.useState(() => {
    // Load current stage from localStorage, default to 0
    const savedStage = localStorage.getItem(`automated-discovery-stage-${id}`);
    return savedStage ? parseInt(savedStage, 10) : 0;
  });
  
  // Add state for re-evaluation confirmation
  const [showReevaluationModal, setShowReevaluationModal] = React.useState(false);
  const [pendingStageNavigation, setPendingStageNavigation] = React.useState<number | null>(null);
  const [hasDataForStage, setHasDataForStage] = React.useState<{ [key: number]: boolean }>({});
  const [skipReevaluation, setSkipReevaluation] = React.useState(false);
  const [isViewingPreviousResults, setIsViewingPreviousResults] = React.useState(false);
  
  // Saved evaluations state
  const [savedEvaluations, setSavedEvaluations] = React.useState<{ [key: string]: any }>({});
  const [completedStages, setCompletedStages] = React.useState<string[]>([]);
  const [currentSavedStage, setCurrentSavedStage] = React.useState(0);
  const [isLoadingSavedData, setIsLoadingSavedData] = React.useState(false);
  const [hasFetchedFeedback, setHasFetchedFeedback] = React.useState(false);
  const [showCompletedStagesModal, setShowCompletedStagesModal] = React.useState(false);

  // Custom setCurrentStage function that saves to localStorage
  const updateCurrentStage = React.useCallback((newStage: number) => {
    setCurrentStage(newStage);
    setHasFetchedFeedback(false); // Reset feedback flag when stage changes
    
    // Clear validation score when navigating to Launch stage
    if (newStage === 6) {
      setValidationScore(null);
    }
    
    localStorage.setItem(`automated-discovery-stage-${id}`, newStage.toString());
  }, [id]);

  // Function to handle stage navigation with re-evaluation confirmation
  const handleStageNavigation = React.useCallback((targetStage: number) => {
    // Special handling for Launch stage (stage 6) - always allow if all previous stages are completed
    if (targetStage === 6) {
      const allPreviousStagesCompleted = [0, 1, 2, 3, 4, 5].every(stage => 
        completedStages.includes(stage.toString())
      );
      if (allPreviousStagesCompleted) {
        updateCurrentStage(targetStage);
        return;
      }
    }

    // If navigating to a stage that has data or is completed, show confirmation
    if (hasDataForStage[targetStage] || completedStages.includes(targetStage.toString())) {
      setPendingStageNavigation(targetStage);
      setShowReevaluationModal(true);
    } else {
      // No data for this stage and not completed, proceed without confirmation
      updateCurrentStage(targetStage);
    }
  }, [currentStage, hasDataForStage, updateCurrentStage, completedStages]);

  // Function to confirm re-evaluation
  const confirmReevaluation = React.useCallback(() => {
    if (pendingStageNavigation !== null) {
      setSkipReevaluation(false);
      updateCurrentStage(pendingStageNavigation);
      setShowReevaluationModal(false);
      setPendingStageNavigation(null);
    }
  }, [pendingStageNavigation, updateCurrentStage]);



  // Load saved evaluations for this business plan
  const loadSavedEvaluations = React.useCallback(async () => {
    if (!id) return;
    
    setIsLoadingSavedData(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/automated-discovery/load-evaluations/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setSavedEvaluations(data.evaluations || {});
        setCompletedStages(data.completedStages || []);
        setCurrentSavedStage(data.currentStage || 0);
        
        // Update hasDataForStage based on saved evaluations
        const stageData: { [key: number]: boolean } = {};
        Object.keys(data.evaluations || {}).forEach(stage => {
          stageData[parseInt(stage)] = true;
        });
        setHasDataForStage(stageData);
        
        // Set feedback flag if we have data for current stage
        if (stageData[currentStage]) {
          setHasFetchedFeedback(true);
        }
        
        console.log('Loaded saved evaluations:', data);
      }
    } catch (error) {
      console.error('Error loading saved evaluations:', error);
    } finally {
      setIsLoadingSavedData(false);
    }
  }, [id]);

  // Save evaluation for current stage
  const saveEvaluation = React.useCallback(async (stage: number, score: number, feedback: string, personas: any[]) => {
    if (!id) return;
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/automated-discovery/save-evaluation`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          businessPlanId: id,
          stage: stage.toString(),
          score,
          feedback,
          personas
        })
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('Saved evaluation:', data);
        
        // Update local state
        setSavedEvaluations(prev => ({
          ...prev,
          [stage]: { score, feedback, personas, completedAt: new Date() }
        }));
        setCompletedStages(data.completedStages || []);
        setCurrentSavedStage(data.currentStage || 0);
        
        // Update hasDataForStage
        setHasDataForStage(prev => ({
          ...prev,
          [stage]: true
        }));
      }
    } catch (error) {
      console.error('Error saving evaluation:', error);
    }
  }, [id]);

  // Load evaluation for a specific stage
  const loadStageEvaluation = React.useCallback(async (stage: number) => {
    if (!id) return;
    
    // First, try to load from saved evaluations
    const savedEvaluation = savedEvaluations[stage.toString()];
    if (savedEvaluation) {
      console.log('Loading saved evaluation for stage:', stage, savedEvaluation);
    } else {
      // Try to load from localStorage as fallback
      const cachedValidationScore = localStorage.getItem(`validation-score-${id}-${stage}`);
      const cachedSummary = localStorage.getItem(`summary-${id}-${stage}`);
      const cachedPersonas = localStorage.getItem(`personas-${id}-${stage}`);
      
      if (cachedValidationScore && cachedSummary) {
        console.log('Loading cached evaluation from localStorage for stage:', stage);
        try {
          const validationScore = JSON.parse(cachedValidationScore);
          const personas = cachedPersonas ? JSON.parse(cachedPersonas) : [];
          
          setValidationScore(validationScore);
          setCollectiveSummary(cachedSummary);
          setPersonas(personas);
          
          // Mark this stage as completed when loading cached data
          setCompletedStages(prev => {
            if (!prev.includes(stage.toString())) {
              return [...prev, stage.toString()];
            }
            return prev;
          });
          
          // Mark this stage as having data
          setHasDataForStage(prev => ({ ...prev, [stage]: true }));
          
          console.log('Loaded cached evaluation for stage:', stage);
          return;
        } catch (err) {
          console.log('Could not parse cached evaluation:', err);
        }
      }
    }
    
    if (savedEvaluation) {
      
      // Load the evaluation data into the UI
      setPersonas(savedEvaluation.personas || []);
      
      // Create a proper validation score object with criteria
      const validationScoreObj = {
        score: savedEvaluation.score,
        criteria: {
          // Initialize all criteria to 0
          problemIdentification: 0,
          problemValidation: 0,
          problemScope: 0,
          problemUrgency: 0,
          problemImpact: 0,
          customerClarity: 0,
          customerSpecificity: 0,
          customerRelevance: 0,
          customerAccessibility: 0,
          customerValue: 0,
          struggleIdentification: 0,
          struggleValidation: 0,
          struggleUrgency: 0,
          struggleFrequency: 0,
          struggleImpact: 0,
          solutionAlignment: 0,
          solutionEffectiveness: 0,
          solutionDifferentiation: 0,
          solutionValue: 0,
          solutionFeasibility: 0,
          modelViability: 0,
          revenuePotential: 0,
          costEfficiency: 0,
          competitiveAdvantage: 0,
          scalability: 0,
          marketSize: 0,
          marketDemand: 0,
          marketTiming: 0,
          competitiveLandscape: 0,
          marketAccess: 0,
          // Set only the relevant criteria for the current stage
          ...(stage === 0 ? {
            problemIdentification: savedEvaluation.score >= 7 ? 8 : savedEvaluation.score >= 4 ? 6 : 4,
            problemValidation: savedEvaluation.score >= 7 ? 8 : savedEvaluation.score >= 4 ? 6 : 4,
            problemScope: savedEvaluation.score >= 7 ? 7 : savedEvaluation.score >= 4 ? 5 : 3,
            problemUrgency: savedEvaluation.score >= 7 ? 7 : savedEvaluation.score >= 4 ? 5 : 3,
            problemImpact: savedEvaluation.score >= 7 ? 8 : savedEvaluation.score >= 4 ? 6 : 4,
          } : {}),
          ...(stage === 1 ? {
            customerClarity: savedEvaluation.score >= 7 ? 8 : savedEvaluation.score >= 4 ? 6 : 4,
            customerSpecificity: savedEvaluation.score >= 7 ? 8 : savedEvaluation.score >= 4 ? 6 : 4,
            customerRelevance: savedEvaluation.score >= 7 ? 8 : savedEvaluation.score >= 4 ? 6 : 4,
            customerAccessibility: savedEvaluation.score >= 7 ? 7 : savedEvaluation.score >= 4 ? 5 : 3,
            customerValue: savedEvaluation.score >= 7 ? 8 : savedEvaluation.score >= 4 ? 6 : 4,
          } : {}),
          ...(stage === 2 ? {
            struggleIdentification: savedEvaluation.score >= 7 ? 8 : savedEvaluation.score >= 4 ? 6 : 4,
            struggleValidation: savedEvaluation.score >= 7 ? 8 : savedEvaluation.score >= 4 ? 6 : 4,
            struggleUrgency: savedEvaluation.score >= 7 ? 7 : savedEvaluation.score >= 4 ? 5 : 3,
            struggleFrequency: savedEvaluation.score >= 7 ? 7 : savedEvaluation.score >= 4 ? 5 : 3,
            struggleImpact: savedEvaluation.score >= 7 ? 8 : savedEvaluation.score >= 4 ? 6 : 4,
          } : {}),
          ...(stage === 3 ? {
            solutionAlignment: savedEvaluation.score >= 7 ? 8 : savedEvaluation.score >= 4 ? 6 : 4,
            solutionEffectiveness: savedEvaluation.score >= 7 ? 8 : savedEvaluation.score >= 4 ? 6 : 4,
            solutionDifferentiation: savedEvaluation.score >= 7 ? 7 : savedEvaluation.score >= 4 ? 5 : 3,
            solutionValue: savedEvaluation.score >= 7 ? 8 : savedEvaluation.score >= 4 ? 6 : 4,
            solutionFeasibility: savedEvaluation.score >= 7 ? 7 : savedEvaluation.score >= 4 ? 5 : 3,
          } : {}),
          ...(stage === 4 ? {
            modelViability: savedEvaluation.score >= 7 ? 8 : savedEvaluation.score >= 4 ? 6 : 4,
            revenuePotential: savedEvaluation.score >= 7 ? 8 : savedEvaluation.score >= 4 ? 6 : 4,
            costEfficiency: savedEvaluation.score >= 7 ? 7 : savedEvaluation.score >= 4 ? 5 : 3,
            competitiveAdvantage: savedEvaluation.score >= 7 ? 8 : savedEvaluation.score >= 4 ? 6 : 4,
            scalability: savedEvaluation.score >= 7 ? 7 : savedEvaluation.score >= 4 ? 5 : 3,
          } : {}),
          ...(stage === 5 ? {
            marketSize: savedEvaluation.score >= 7 ? 8 : savedEvaluation.score >= 4 ? 6 : 4,
            marketDemand: savedEvaluation.score >= 7 ? 8 : savedEvaluation.score >= 4 ? 6 : 4,
            marketTiming: savedEvaluation.score >= 7 ? 7 : savedEvaluation.score >= 4 ? 5 : 3,
            competitiveLandscape: savedEvaluation.score >= 7 ? 7 : savedEvaluation.score >= 4 ? 5 : 3,
            marketAccess: savedEvaluation.score >= 7 ? 8 : savedEvaluation.score >= 4 ? 6 : 4,
          } : {}),
        },
        recommendations: [],
        confidence: 'medium' as const,
        shouldProceed: savedEvaluation.score >= 7
      };
      
      setValidationScore(validationScoreObj);
      setCollectiveSummary(savedEvaluation.feedback || '');
      
      // Mark this stage as completed when loading saved data
      setCompletedStages(prev => {
        if (!prev.includes(stage.toString())) {
          return [...prev, stage.toString()];
        }
        return prev;
      });
      
      console.log('Loaded saved evaluation for stage:', stage, savedEvaluation);
      return savedEvaluation;
    }
    
    // If no saved evaluation, try to fetch from API
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/automated-discovery/evaluation/${id}/${stage}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        const evaluation = data.evaluation;
        
        // Load the evaluation data into the UI
        setPersonas(evaluation.personas || []);
        
        // Create a proper validation score object with criteria
        const validationScoreObj = {
          score: evaluation.score,
          criteria: {
            // Initialize all criteria to 0
            problemIdentification: 0,
            problemValidation: 0,
            problemScope: 0,
            problemUrgency: 0,
            problemImpact: 0,
            customerClarity: 0,
            customerSpecificity: 0,
            customerRelevance: 0,
            customerAccessibility: 0,
            customerValue: 0,
            struggleIdentification: 0,
            struggleValidation: 0,
            struggleUrgency: 0,
            struggleFrequency: 0,
            struggleImpact: 0,
            solutionAlignment: 0,
            solutionEffectiveness: 0,
            solutionDifferentiation: 0,
            solutionValue: 0,
            solutionFeasibility: 0,
            modelViability: 0,
            revenuePotential: 0,
            costEfficiency: 0,
            competitiveAdvantage: 0,
            scalability: 0,
            marketSize: 0,
            marketDemand: 0,
            marketTiming: 0,
            competitiveLandscape: 0,
            marketAccess: 0,
            // Set only the relevant criteria for the current stage
            ...(stage === 0 ? {
              problemIdentification: evaluation.score >= 7 ? 8 : evaluation.score >= 4 ? 6 : 4,
              problemValidation: evaluation.score >= 7 ? 8 : evaluation.score >= 4 ? 6 : 4,
              problemScope: evaluation.score >= 7 ? 7 : evaluation.score >= 4 ? 5 : 3,
              problemUrgency: evaluation.score >= 7 ? 7 : evaluation.score >= 4 ? 5 : 3,
              problemImpact: evaluation.score >= 7 ? 8 : evaluation.score >= 4 ? 6 : 4,
            } : {}),
            ...(stage === 1 ? {
              customerClarity: evaluation.score >= 7 ? 8 : evaluation.score >= 4 ? 6 : 4,
              customerSpecificity: evaluation.score >= 7 ? 8 : evaluation.score >= 4 ? 6 : 4,
              customerRelevance: evaluation.score >= 7 ? 8 : evaluation.score >= 4 ? 6 : 4,
              customerAccessibility: evaluation.score >= 7 ? 7 : evaluation.score >= 4 ? 5 : 3,
              customerValue: evaluation.score >= 7 ? 8 : evaluation.score >= 4 ? 6 : 4,
            } : {}),
            ...(stage === 2 ? {
              struggleIdentification: evaluation.score >= 7 ? 8 : evaluation.score >= 4 ? 6 : 4,
              struggleValidation: evaluation.score >= 7 ? 8 : evaluation.score >= 4 ? 6 : 4,
              struggleUrgency: evaluation.score >= 7 ? 7 : evaluation.score >= 4 ? 5 : 3,
              struggleFrequency: evaluation.score >= 7 ? 7 : evaluation.score >= 4 ? 5 : 3,
              struggleImpact: evaluation.score >= 7 ? 8 : evaluation.score >= 4 ? 6 : 4,
            } : {}),
            ...(stage === 3 ? {
              solutionAlignment: evaluation.score >= 7 ? 8 : evaluation.score >= 4 ? 6 : 4,
              solutionEffectiveness: evaluation.score >= 7 ? 8 : evaluation.score >= 4 ? 6 : 4,
              solutionDifferentiation: evaluation.score >= 7 ? 7 : evaluation.score >= 4 ? 5 : 3,
              solutionValue: evaluation.score >= 7 ? 8 : evaluation.score >= 4 ? 6 : 4,
              solutionFeasibility: evaluation.score >= 7 ? 7 : evaluation.score >= 4 ? 5 : 3,
            } : {}),
            ...(stage === 4 ? {
              modelViability: evaluation.score >= 7 ? 8 : evaluation.score >= 4 ? 6 : 4,
              revenuePotential: evaluation.score >= 7 ? 8 : evaluation.score >= 4 ? 6 : 4,
              costEfficiency: evaluation.score >= 7 ? 7 : evaluation.score >= 4 ? 5 : 3,
              competitiveAdvantage: evaluation.score >= 7 ? 8 : evaluation.score >= 4 ? 6 : 4,
              scalability: evaluation.score >= 7 ? 7 : evaluation.score >= 4 ? 5 : 3,
            } : {}),
            ...(stage === 5 ? {
              marketSize: evaluation.score >= 7 ? 8 : evaluation.score >= 4 ? 6 : 4,
              marketDemand: evaluation.score >= 7 ? 8 : evaluation.score >= 4 ? 6 : 4,
              marketTiming: evaluation.score >= 7 ? 7 : evaluation.score >= 4 ? 5 : 3,
              competitiveLandscape: evaluation.score >= 7 ? 7 : evaluation.score >= 4 ? 5 : 3,
              marketAccess: evaluation.score >= 7 ? 8 : evaluation.score >= 4 ? 6 : 4,
            } : {}),
          },
          recommendations: [],
          confidence: 'medium' as const,
          shouldProceed: evaluation.score >= 7
        };
        
        setValidationScore(validationScoreObj);
        setCollectiveSummary(evaluation.feedback || '');
        
        // Mark this stage as completed when loading saved data
        setCompletedStages(prev => {
          if (!prev.includes(stage.toString())) {
            return [...prev, stage.toString()];
          }
          return prev;
        });
        
        console.log('Loaded stage evaluation:', evaluation);
        return evaluation;
      }
    } catch (error) {
      console.error('Error loading stage evaluation:', error);
    }
    return null;
  }, [id]);

  // Function to view previous results without re-evaluation
  const viewPreviousResults = React.useCallback(() => {
    if (pendingStageNavigation !== null) {
      setSkipReevaluation(true);
      setIsViewingPreviousResults(true);
      updateCurrentStage(pendingStageNavigation);
      setShowReevaluationModal(false);
      setPendingStageNavigation(null);
      
      // Load the saved evaluation data for this stage
      loadStageEvaluation(pendingStageNavigation);
      
      // Don't trigger re-evaluation - just show existing data
      // Reset the flag after a longer delay to ensure all animations are blocked
      setTimeout(() => {
        setIsViewingPreviousResults(false);
        setSkipReevaluation(false);
      }, 3000);
    }
  }, [pendingStageNavigation, updateCurrentStage, loadStageEvaluation]);

  const [personas, setPersonas] = React.useState<Persona[]>([]);
  const [collectiveSummary, setCollectiveSummary] = React.useState('');
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [businessIdea, setBusinessIdea] = React.useState<string>('');
  const [customerDescription, setCustomerDescription] = React.useState<string>('');
  const [logs, setLogs] = React.useState<string[]>([]);
  const logRef = React.useRef<HTMLDivElement>(null);

  // Re-evaluate a specific stage
  const reevaluateStage = React.useCallback(async (stage: number) => {
    if (!id || !businessIdea || !customerDescription) return;
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/automated-discovery/reevaluate-stage`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          businessPlanId: id,
          stage: stage.toString(),
          businessIdea,
          customerDescription
        })
      });
      
      if (response.ok) {
        const data = await response.json();
        const evaluation = data.evaluation;
        
        // Update UI with new evaluation
        setPersonas(evaluation.personas || []);
        
        // Create a proper validation score object with criteria
        const validationScoreObj = {
          score: evaluation.score,
          criteria: {
            // Initialize all criteria to 0
            problemIdentification: 0,
            problemValidation: 0,
            problemScope: 0,
            problemUrgency: 0,
            problemImpact: 0,
            customerClarity: 0,
            customerSpecificity: 0,
            customerRelevance: 0,
            customerAccessibility: 0,
            customerValue: 0,
            struggleIdentification: 0,
            struggleValidation: 0,
            struggleUrgency: 0,
            struggleFrequency: 0,
            struggleImpact: 0,
            solutionAlignment: 0,
            solutionEffectiveness: 0,
            solutionDifferentiation: 0,
            solutionValue: 0,
            solutionFeasibility: 0,
            modelViability: 0,
            revenuePotential: 0,
            costEfficiency: 0,
            competitiveAdvantage: 0,
            scalability: 0,
            marketSize: 0,
            marketDemand: 0,
            marketTiming: 0,
            competitiveLandscape: 0,
            marketAccess: 0,
            // Set only the relevant criteria for the current stage
            ...(stage === 0 ? {
              problemIdentification: evaluation.score >= 7 ? 8 : evaluation.score >= 4 ? 6 : 4,
              problemValidation: evaluation.score >= 7 ? 8 : evaluation.score >= 4 ? 6 : 4,
              problemScope: evaluation.score >= 7 ? 7 : evaluation.score >= 4 ? 5 : 3,
              problemUrgency: evaluation.score >= 7 ? 7 : evaluation.score >= 4 ? 5 : 3,
              problemImpact: evaluation.score >= 7 ? 8 : evaluation.score >= 4 ? 6 : 4,
            } : {}),
            ...(stage === 1 ? {
              customerClarity: evaluation.score >= 7 ? 8 : evaluation.score >= 4 ? 6 : 4,
              customerSpecificity: evaluation.score >= 7 ? 8 : evaluation.score >= 4 ? 6 : 4,
              customerRelevance: evaluation.score >= 7 ? 8 : evaluation.score >= 4 ? 6 : 4,
              customerAccessibility: evaluation.score >= 7 ? 7 : evaluation.score >= 4 ? 5 : 3,
              customerValue: evaluation.score >= 7 ? 8 : evaluation.score >= 4 ? 6 : 4,
            } : {}),
            ...(stage === 2 ? {
              struggleIdentification: evaluation.score >= 7 ? 8 : evaluation.score >= 4 ? 6 : 4,
              struggleValidation: evaluation.score >= 7 ? 8 : evaluation.score >= 4 ? 6 : 4,
              struggleUrgency: evaluation.score >= 7 ? 7 : evaluation.score >= 4 ? 5 : 3,
              struggleFrequency: evaluation.score >= 7 ? 7 : evaluation.score >= 4 ? 5 : 3,
              struggleImpact: evaluation.score >= 7 ? 8 : evaluation.score >= 4 ? 6 : 4,
            } : {}),
            ...(stage === 3 ? {
              solutionAlignment: evaluation.score >= 7 ? 8 : evaluation.score >= 4 ? 6 : 4,
              solutionEffectiveness: evaluation.score >= 7 ? 8 : evaluation.score >= 4 ? 6 : 4,
              solutionDifferentiation: evaluation.score >= 7 ? 7 : evaluation.score >= 4 ? 5 : 3,
              solutionValue: evaluation.score >= 7 ? 8 : evaluation.score >= 4 ? 6 : 4,
              solutionFeasibility: evaluation.score >= 7 ? 7 : evaluation.score >= 4 ? 5 : 3,
            } : {}),
            ...(stage === 4 ? {
              modelViability: evaluation.score >= 7 ? 8 : evaluation.score >= 4 ? 6 : 4,
              revenuePotential: evaluation.score >= 7 ? 8 : evaluation.score >= 4 ? 6 : 4,
              costEfficiency: evaluation.score >= 7 ? 7 : evaluation.score >= 4 ? 5 : 3,
              competitiveAdvantage: evaluation.score >= 7 ? 8 : evaluation.score >= 4 ? 6 : 4,
              scalability: evaluation.score >= 7 ? 7 : evaluation.score >= 4 ? 5 : 3,
            } : {}),
            ...(stage === 5 ? {
              marketSize: evaluation.score >= 7 ? 8 : evaluation.score >= 4 ? 6 : 4,
              marketDemand: evaluation.score >= 7 ? 8 : evaluation.score >= 4 ? 6 : 4,
              marketTiming: evaluation.score >= 7 ? 7 : evaluation.score >= 4 ? 5 : 3,
              competitiveLandscape: evaluation.score >= 7 ? 7 : evaluation.score >= 4 ? 5 : 3,
              marketAccess: evaluation.score >= 7 ? 8 : evaluation.score >= 4 ? 6 : 4,
            } : {}),
          },
          recommendations: [],
          confidence: 'medium' as const,
          shouldProceed: evaluation.score >= 7
        };
        
        setValidationScore(validationScoreObj);
        setCollectiveSummary(evaluation.feedback || '');
        
        // Mark this stage as completed when re-evaluating
        setCompletedStages(prev => {
          if (!prev.includes(stage.toString())) {
            return [...prev, stage.toString()];
          }
          return prev;
        });
        
        // Update saved evaluations
        setSavedEvaluations(prev => ({
          ...prev,
          [stage]: evaluation
        }));
        
        console.log('Re-evaluated stage:', evaluation);
        return evaluation;
      }
    } catch (error) {
      console.error('Error re-evaluating stage:', error);
    }
    return null;
  }, [id, businessIdea, customerDescription]);

  // Add state to control how many feedback bubbles are visible per persona
  const [visibleFeedbackCounts, setVisibleFeedbackCounts] = React.useState<number[]>([]);
  // Add state to track expanded/collapsed personas
  const [expandedPersonas, setExpandedPersonas] = React.useState<{ [id: string]: boolean }>({});
  // Add state for collapsible summary and feedback sections
  const [showSummary, setShowSummary] = React.useState(true);
  const [showFeedback, setShowFeedback] = React.useState(true);
  
  // Add state for re-evaluation modal
  const [showReevaluateModal, setShowReevaluateModal] = React.useState(false);
  const [stageToReevaluate, setStageToReevaluate] = React.useState<number | null>(null);
  
  // Add validation scoring state
  const [validationScore, setValidationScore] = React.useState<ValidationScore | null>(null);
  const [showValidationDetails, setShowValidationDetails] = React.useState(false);
  
  // Add validation score state
  const [isGeneratingValidationScore, setIsGeneratingValidationScore] = React.useState(false);
  const [showBusinessPlanModal, setShowBusinessPlanModal] = React.useState(false);
  const [isAutoImproving, setIsAutoImproving] = React.useState(false);
  const [shouldShowProgress, setShouldShowProgress] = React.useState(false);
  const [improvedProblemStatement, setImprovedProblemStatement] = React.useState<string>('');
  const [showImprovementModal, setShowImprovementModal] = React.useState(false);
  const [improvedSections, setImprovedSections] = React.useState<{
    problemStatement: string;
    solution: string;
    customerPainPoints: string[];
    valueProposition: string;
    marketAnalysis: string;
    competitiveAnalysis: string;
  } | null>(null);
  const [editableSections, setEditableSections] = React.useState<{
    problemStatement: string;
    solution: string;
    customerPainPoints: string[];
    valueProposition: string;
    marketAnalysis: string;
    competitiveAnalysis: string;
  } | null>(null);
  const [selectedSections, setSelectedSections] = React.useState<{
    problemStatement: boolean;
    solution: boolean;
    customerPainPoints: boolean;
    valueProposition: boolean;
    marketAnalysis: boolean;
    competitiveAnalysis: boolean;
  }>({
    problemStatement: true,
    solution: false,
    customerPainPoints: false,
    valueProposition: false,
    marketAnalysis: false,
    competitiveAnalysis: false
  });
  const PITCH_DECK_SLIDES = [
    { key: 'title', label: 'Title Slide', defaultTitle: 'Title', defaultContent: '' },
    { key: 'problem', label: 'Problem', defaultTitle: 'Problem', defaultContent: '' },
    { key: 'solution', label: 'Solution', defaultTitle: 'Solution', defaultContent: '' },
    { key: 'market', label: 'Market Opportunity', defaultTitle: 'Market Opportunity', defaultContent: '' },
    { key: 'product', label: 'Product', defaultTitle: 'Product', defaultContent: '' },
    { key: 'businessModel', label: 'Business Model', defaultTitle: 'Business Model', defaultContent: '' },
    { key: 'goToMarket', label: 'Go-to-Market', defaultTitle: 'Go-to-Market', defaultContent: '' },
    { key: 'competition', label: 'Competition', defaultTitle: 'Competition', defaultContent: '' },
    { key: 'traction', label: 'Traction', defaultTitle: 'Traction', defaultContent: '' },
    { key: 'team', label: 'Team', defaultTitle: 'Team', defaultContent: '' },
    { key: 'financials', label: 'Financials', defaultTitle: 'Financials', defaultContent: '' },
    { key: 'ask', label: 'Ask', defaultTitle: 'Ask', defaultContent: '' },
  ];
  const [showPitchDeckEditor, setShowPitchDeckEditor] = useState(false);
  const [currentSlideIdx, setCurrentSlideIdx] = useState(0);
  const [pitchDeckSlides, setPitchDeckSlides] = useState(
    PITCH_DECK_SLIDES.map(slide => ({
      key: slide.key,
      title: slide.defaultTitle,
      content: '',
    }))
  );
  const [planData, setPlanData] = useState<any>(null);
  
  // Add state to track current process step
  const [currentProcessStep, setCurrentProcessStep] = useState<string>('');
  const [processSteps, setProcessSteps] = useState<string[]>([]);
  const [completedSteps, setCompletedSteps] = useState<string[]>([]);
  
  // Add ref for progress container auto-scroll
  const progressContainerRef = React.useRef<HTMLDivElement>(null);


  
  // Business Model data interface and state
  interface BusinessModelData {
    // Business Model Canvas
    keyPartners: string[];
    keyActivities: string[];
    valuePropositions: string[];
    customerRelationships: string[];
    customerSegments: string[];
    keyResources: string[];
    channels: string[];
    costStructure: {
      fixedCosts: number;
      variableCosts: number;
      costBreakdown: Record<string, number>;
    };
    revenueStreams: {
      streams: Array<{
        name: string;
        type: 'subscription' | 'one-time' | 'freemium' | 'licensing';
        price: number;
        frequency: string;
        projectedVolume: number;
      }>;
      totalProjectedRevenue: number;
    };
    
    // Financial Metrics
    financialProjections: {
      monthlyRevenue: number[];
      annualRevenue: number[];
      grossMargin: number;
      netMargin: number;
      breakEvenPoint: number;
      customerLifetimeValue: number;
      customerAcquisitionCost: number;
      paybackPeriod: number;
    };
    
    // Competitive Analysis
    competitiveLandscape: {
      competitors: Array<{
        name: string;
        pricing: number;
        features: string[];
        marketShare: number;
        strengths: string[];
        weaknesses: string[];
      }>;
      competitiveAdvantages: string[];
      differentiationStrategy: string;
    };
    
    // Risk Assessment
    riskAssessment: {
      businessModelRisks: string[];
      marketRisks: string[];
      operationalRisks: string[];
      financialRisks: string[];
      regulatoryRisks: string[];
      mitigationStrategies: Record<string, string>;
    };
    
    // Scalability & Growth
    scalabilityAnalysis: {
      marketSize: {
        tam: number; // Total Addressable Market
        sam: number; // Serviceable Addressable Market
        som: number; // Serviceable Obtainable Market
      };
      growthStrategy: string;
      expansionPlans: string[];
      scaleFactors: string[];
    };
  }
  
  const [businessModelData, setBusinessModelData] = useState<BusinessModelData | null>(null);
  const [isBusinessModelComplete, setIsBusinessModelComplete] = useState(false);

  // Helper to toggle expand/collapse
  function togglePersonaExpand(id: string) {
    setExpandedPersonas(prev => ({ ...prev, [id]: !prev[id] }));
  }

  // When personas or their feedback changes, reset and start sequential reveal
  React.useEffect(() => {
    if (personas.length === 0 || !personas.some(p => p.feedback && p.feedback.length > 0) || skipReevaluation || isViewingPreviousResults) return;
    setVisibleFeedbackCounts(Array(personas.length).fill(0));
    let personaIdx = 0;
    let feedbackIdx = 0;
    let isCancelled = false;

    function revealNext() {
      if (isCancelled) return;
      if (personaIdx >= personas.length) return;
      setVisibleFeedbackCounts((prev) => {
        const updated = [...prev];
        updated[personaIdx] = feedbackIdx + 1;
        return updated;
      });
      if (feedbackIdx + 1 < (personas[personaIdx].feedback?.length || 0)) {
        feedbackIdx++;
      } else {
        personaIdx++;
        feedbackIdx = 0;
      }
      if (personaIdx < personas.length) {
        setTimeout(revealNext, 400);
      }
    }
    setTimeout(revealNext, 400);
    return () => { isCancelled = true; };
  }, [currentStage, personas.map(p => p.feedback?.length).join(',')]);

  // Auto-scroll log area to bottom
  React.useEffect(() => {
    if (logRef.current) {
      logRef.current.scrollTop = logRef.current.scrollHeight;
    }
  }, [logs]);

  // Auto-scroll progress container to current step
  React.useEffect(() => {
    if (progressContainerRef.current && currentProcessStep) {
      const container = progressContainerRef.current;
      const currentStepElement = container.querySelector('[data-current-step="true"]') as HTMLElement;
      
      if (currentStepElement) {
        const containerRect = container.getBoundingClientRect();
        const elementRect = currentStepElement.getBoundingClientRect();
        
        // Calculate if the current step is outside the visible area
        const isAbove = elementRect.top < containerRect.top;
        const isBelow = elementRect.bottom > containerRect.bottom;
        
        if (isAbove || isBelow) {
          currentStepElement.scrollIntoView({
            behavior: 'smooth',
            block: 'center'
          });
        }
      }
    }
  }, [currentProcessStep]);

  // Ensure validation score generation state is correct when validation score exists
  React.useEffect(() => {
    if (validationScore && isGeneratingValidationScore) {
      console.log('Validation score exists but isGeneratingValidationScore is true - resetting');
      setIsGeneratingValidationScore(false);
    }
  }, [validationScore, isGeneratingValidationScore]);

  // Force reset isGeneratingValidationScore if validation score exists and we're not loading
  React.useEffect(() => {
    if (validationScore && !loading && isGeneratingValidationScore) {
      console.log('Forcing reset of isGeneratingValidationScore - validation score exists and not loading');
      setIsGeneratingValidationScore(false);
    }
  }, [validationScore, loading, isGeneratingValidationScore]);

  // Aggressive fix: Always reset isGeneratingValidationScore when validation score exists
  React.useEffect(() => {
    if (validationScore) {
      console.log('Validation score exists - ensuring isGeneratingValidationScore is false');
      setIsGeneratingValidationScore(false);
      setShouldShowProgress(false);
      setLoading(false); // Also reset the main loading state
      // Clear any remaining process steps
      setProcessSteps([]);
      setCompletedSteps([]);
      setCurrentProcessStep('');
    }
  }, [validationScore]);

  // Control progress indicator visibility
  React.useEffect(() => {
    const shouldShow = isGeneratingValidationScore && !validationScore && !loading;
    setShouldShowProgress(shouldShow);
    console.log('Progress indicator state:', { isGeneratingValidationScore, hasValidationScore: !!validationScore, loading, shouldShow });
  }, [isGeneratingValidationScore, validationScore, loading]);

  // Debug logging for loading state
  React.useEffect(() => {
    console.log('Loading state changed:', { loading, hasValidationScore: !!validationScore, isGeneratingValidationScore });
  }, [loading, validationScore, isGeneratingValidationScore]);

  // Fetch business plan on mount
  React.useEffect(() => {
    async function fetchBusinessPlan() {
      setLoading(true);
      setError(null);
      setLogs((prev) => [...prev, 'Fetching business plan...']);
      
      // Reset all cached data when loading a new business plan
      setPersonas([]);
      setCollectiveSummary('');
      setValidationScore(null);
      setIsGeneratingValidationScore(false);
      // Don't reset currentStage - preserve user's progress
      setVisibleFeedbackCounts([]);
      setExpandedPersonas({});
      setShowSummary(true);
      setShowFeedback(true);
      
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`${API_URL}/business-plan/${id}`, {
          credentials: 'include',
          headers: {
            'Authorization': token ? `Bearer ${token}` : '',
            'Content-Type': 'application/json'
          }
        });
        if (!res.ok) throw new Error('Failed to fetch business plan');
        const data = await res.json();
        setBusinessIdea(data.idea?.existingIdeaText || data.summary || '');
        setCustomerDescription(data.customer?.description || '');
        setPlanData(data);
        setLogs((prev) => [...prev, 'Business plan loaded.']);
        
        // Load saved evaluations after business plan is loaded
        await loadSavedEvaluations();
      } catch (err: any) {
        setError(err.message || 'Unknown error');
        setLogs((prev) => [...prev, 'Error loading business plan.']);
      } finally {
        setLoading(false);
      }
    }
    if (id) fetchBusinessPlan();
  }, [id]);

  // Fetch personas when businessIdea and customerDescription are loaded
  React.useEffect(() => {
    if (!businessIdea || !customerDescription || isViewingPreviousResults) return;
    async function fetchPersonas() {
      setLoading(true);
      setError(null);
      
      // Check if we have saved evaluation data for this stage
      if (savedEvaluations[currentStage.toString()] && !skipReevaluation && !isViewingPreviousResults) {
        const evaluation = savedEvaluations[currentStage.toString()];
        setPersonas(evaluation.personas || []);
        setValidationScore({ score: evaluation.score, criteria: {} as any, recommendations: [], confidence: 'medium', shouldProceed: true });
        setCollectiveSummary(evaluation.feedback || '');
        setLoading(false);
        setLogs((prev) => [...prev, 'Loaded saved evaluation for this stage.']);
        return;
      }
      
      setLogs((prev) => [...prev, 'Generating AI personas...']);
      
      // Initialize process steps for Problem Discovery (only if not viewing previous results)
      if (!isViewingPreviousResults && currentStage === 0) {
        setProcessSteps([
          'Analyzing business idea and customer description...',
          'Identifying industry context and market dynamics...',
          'Generating realistic customer personas...',
          'Creating detailed behavioral profiles...',
          'Preparing validation questions...',
          'Personas ready for feedback generation...'
        ]);
        setCompletedSteps([]);
        setCurrentProcessStep('Analyzing business idea and customer description...');
      } else if (!isViewingPreviousResults && currentStage === 1) {
        // Customer Profile stage
        setProcessSteps([
          'Analyzing customer segmentation and targeting...',
          'Identifying customer demographics and psychographics...',
          'Mapping customer journey and touchpoints...',
          'Generating detailed customer personas...',
          'Validating customer accessibility and reach...',
          'Preparing customer profile assessment...'
        ]);
        setCompletedSteps([]);
        setCurrentProcessStep('Analyzing customer segmentation and targeting...');
      } else if (!isViewingPreviousResults && currentStage === 2) {
        // Customer Struggle stage
        setProcessSteps([
          'Analyzing customer pain points and struggles...',
          'Identifying struggle patterns and frequency...',
          'Mapping customer journey touchpoints...',
          'Generating struggle-focused personas...',
          'Validating struggle urgency and impact...',
          'Preparing customer struggle assessment...'
        ]);
        setCompletedSteps([]);
        setCurrentProcessStep('Analyzing customer pain points and struggles...');
      } else if (!isViewingPreviousResults && currentStage === 3) {
        // Solution Fit stage
        setProcessSteps([
          'Analyzing solution alignment with customer needs...',
          'Evaluating solution effectiveness and impact...',
          'Assessing solution differentiation and uniqueness...',
          'Validating solution value proposition...',
          'Testing solution feasibility and implementation...',
          'Preparing solution fit assessment...'
        ]);
        setCompletedSteps([]);
        setCurrentProcessStep('Analyzing solution alignment with customer needs...');
      } else if (!isViewingPreviousResults && currentStage === 4) {
        // Business Model stage
        setProcessSteps([
          'Analyzing business model viability and sustainability...',
          'Evaluating revenue potential and pricing strategy...',
          'Assessing cost structure and profitability...',
          'Validating competitive positioning and differentiation...',
          'Testing scalability and growth potential...',
          'Preparing business model assessment...'
        ]);
        setCompletedSteps([]);
        setCurrentProcessStep('Analyzing business model viability and sustainability...');
      } else if (!isViewingPreviousResults && currentStage === 5) {
        // Market Validation stage
        setProcessSteps([
          'Analyzing market size and opportunity...',
          'Evaluating market demand and readiness...',
          'Assessing market timing and entry strategy...',
          'Validating competitive landscape...',
          'Testing market access and reach...',
          'Preparing market validation assessment...'
        ]);
        setCompletedSteps([]);
        setCurrentProcessStep('Analyzing market size and opportunity...');
      }
      
      try {
        const token = localStorage.getItem('token');
        
        // Update progress
        setCurrentProcessStep('Identifying industry context and market dynamics...');
        await new Promise(resolve => setTimeout(resolve, 800));
        
        setCompletedSteps(['Analyzing business idea and customer description...']);
        setCurrentProcessStep('Generating realistic customer personas...');
        await new Promise(resolve => setTimeout(resolve, 600));
        
        setCompletedSteps(prev => [...prev, 'Identifying industry context and market dynamics...']);
        setCurrentProcessStep('Creating detailed behavioral profiles...');
        await new Promise(resolve => setTimeout(resolve, 500));
        
        setCompletedSteps(prev => [...prev, 'Generating realistic customer personas...']);
        setCurrentProcessStep('Preparing validation questions...');
        
        // Stage-specific progress updates
        if (currentStage === 0) {
          // Problem Discovery stage
          setCurrentProcessStep('Identifying industry context and market dynamics...');
          await new Promise(resolve => setTimeout(resolve, 800));
          
          setCompletedSteps(['Analyzing business idea and customer description...']);
          setCurrentProcessStep('Generating realistic customer personas...');
          await new Promise(resolve => setTimeout(resolve, 600));
          
          setCompletedSteps(prev => [...prev, 'Identifying industry context and market dynamics...']);
          setCurrentProcessStep('Creating detailed behavioral profiles...');
          await new Promise(resolve => setTimeout(resolve, 500));
          
          setCompletedSteps(prev => [...prev, 'Generating realistic customer personas...']);
          setCurrentProcessStep('Preparing validation questions...');
        } else if (currentStage === 1) {
          // Customer Profile stage
          setCurrentProcessStep('Identifying customer demographics and psychographics...');
          await new Promise(resolve => setTimeout(resolve, 800));
          
          setCompletedSteps(['Analyzing customer segmentation and targeting...']);
          setCurrentProcessStep('Mapping customer journey and touchpoints...');
          await new Promise(resolve => setTimeout(resolve, 600));
          
          setCompletedSteps(prev => [...prev, 'Identifying customer demographics and psychographics...']);
          setCurrentProcessStep('Generating detailed customer personas...');
          await new Promise(resolve => setTimeout(resolve, 500));
          
          setCompletedSteps(prev => [...prev, 'Mapping customer journey and touchpoints...']);
          setCurrentProcessStep('Validating customer accessibility and reach...');
        } else if (currentStage === 2) {
          // Customer Struggle stage
          setCurrentProcessStep('Analyzing customer pain points and struggles...');
          await new Promise(resolve => setTimeout(resolve, 800));
          
          setCompletedSteps(['Analyzing customer pain points and struggles...']);
          setCurrentProcessStep('Identifying struggle patterns and frequency...');
          await new Promise(resolve => setTimeout(resolve, 600));
          
          setCompletedSteps(prev => [...prev, 'Analyzing customer pain points and struggles...']);
          setCurrentProcessStep('Mapping customer journey touchpoints...');
          await new Promise(resolve => setTimeout(resolve, 500));
          
          setCompletedSteps(prev => [...prev, 'Generating struggle-focused personas...']);
          setCurrentProcessStep('Validating struggle urgency and impact...');
        } else if (currentStage === 3) {
          // Solution Fit stage
          setCurrentProcessStep('Analyzing solution alignment with customer needs...');
          await new Promise(resolve => setTimeout(resolve, 800));
          
          setCompletedSteps(['Analyzing solution alignment with customer needs...']);
          setCurrentProcessStep('Evaluating solution effectiveness and impact...');
          await new Promise(resolve => setTimeout(resolve, 600));
          
          setCompletedSteps(prev => [...prev, 'Analyzing solution alignment with customer needs...']);
          setCurrentProcessStep('Assessing solution differentiation and uniqueness...');
          await new Promise(resolve => setTimeout(resolve, 500));
          
          setCompletedSteps(prev => [...prev, 'Validating solution value proposition...']);
          setCurrentProcessStep('Testing solution feasibility and implementation...');
          await new Promise(resolve => setTimeout(resolve, 400));
          
          setCompletedSteps(prev => [...prev, 'Preparing solution fit assessment...']);
          setCurrentProcessStep('Finalizing solution fit assessment...');
        } else if (currentStage === 4) {
          // Business Model stage
          setCurrentProcessStep('Analyzing business model viability and sustainability...');
          await new Promise(resolve => setTimeout(resolve, 800));
          
          setCompletedSteps(['Analyzing business model viability and sustainability...']);
          setCurrentProcessStep('Evaluating revenue potential and pricing strategy...');
          await new Promise(resolve => setTimeout(resolve, 600));
          
          setCompletedSteps(prev => [...prev, 'Analyzing business model viability and sustainability...']);
          setCurrentProcessStep('Assessing cost structure and profitability...');
          await new Promise(resolve => setTimeout(resolve, 500));
          
          setCompletedSteps(prev => [...prev, 'Validating competitive positioning and differentiation...']);
          setCurrentProcessStep('Testing scalability and growth potential...');
          await new Promise(resolve => setTimeout(resolve, 400));
          
          setCompletedSteps(prev => [...prev, 'Preparing business model assessment...']);
          setCurrentProcessStep('Finalizing business model assessment...');
        } else if (currentStage === 5) {
          // Market Validation stage
          setCurrentProcessStep('Analyzing market size and opportunity...');
          await new Promise(resolve => setTimeout(resolve, 800));
          
          setCompletedSteps(['Analyzing market size and opportunity...']);
          setCurrentProcessStep('Evaluating market demand and readiness...');
          await new Promise(resolve => setTimeout(resolve, 600));
          
          setCompletedSteps(prev => [...prev, 'Evaluating market demand and readiness...']);
          setCurrentProcessStep('Assessing market timing and entry strategy...');
          await new Promise(resolve => setTimeout(resolve, 500));
          
          setCompletedSteps(prev => [...prev, 'Validating competitive landscape...']);
          setCurrentProcessStep('Testing market access and reach...');
          await new Promise(resolve => setTimeout(resolve, 400));
          
          setCompletedSteps(prev => [...prev, 'Preparing market validation assessment...']);
          setCurrentProcessStep('Finalizing market validation assessment...');
        }
        
        const res = await fetch(`${API_URL}/automated-discovery/personas`, {
          method: 'POST',
          headers: {
            'Authorization': token ? `Bearer ${token}` : '',
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ businessIdea, customerDescription, numPersonas: 3 }),
          credentials: 'include'
        });
        
        if (!res.ok) throw new Error('Failed to fetch personas');
        const data = await res.json();
        
        setCompletedSteps(prev => [...prev, 'Creating detailed behavioral profiles...', 'Preparing validation questions...']);
        setCurrentProcessStep('Personas ready for feedback generation...');
        await new Promise(resolve => setTimeout(resolve, 400));
        
        // Stage-specific completion steps
        if (currentStage === 0) {
          setCompletedSteps(prev => [...prev, 'Creating detailed behavioral profiles...', 'Preparing validation questions...']);
          setCurrentProcessStep('Personas ready for feedback generation...');
          await new Promise(resolve => setTimeout(resolve, 400));
        } else if (currentStage === 1) {
          setCompletedSteps(prev => [...prev, 'Generating detailed customer personas...', 'Validating customer accessibility and reach...']);
          setCurrentProcessStep('Preparing customer profile assessment...');
          await new Promise(resolve => setTimeout(resolve, 400));
        } else if (currentStage === 2) {
          setCompletedSteps(prev => [...prev, 'Generating struggle-focused personas...', 'Validating struggle urgency and impact...']);
          setCurrentProcessStep('Preparing customer struggle assessment...');
          await new Promise(resolve => setTimeout(resolve, 400));
        } else if (currentStage === 3) {
          setCompletedSteps(prev => [...prev, 'Finalizing solution fit assessment...']);
          setCurrentProcessStep('Preparing recommendations and insights...');
          await new Promise(resolve => setTimeout(resolve, 300));
        } else if (currentStage === 4) {
          setCompletedSteps(prev => [...prev, 'Finalizing business model assessment...']);
          setCurrentProcessStep('Preparing recommendations and insights...');
          await new Promise(resolve => setTimeout(resolve, 300));
        } else if (currentStage === 5) {
          setCompletedSteps(prev => [...prev, 'Finalizing market validation assessment...']);
          setCurrentProcessStep('Preparing recommendations and insights...');
          await new Promise(resolve => setTimeout(resolve, 300));
        }
        
        setPersonas(data.personas.map((p: any) => ({ ...p, feedback: [] })));
        setLogs((prev) => [...prev, 'AI personas generated.']);
        
        // Clear process steps after completion
        setTimeout(() => {
          setProcessSteps([]);
          setCompletedSteps([]);
          setCurrentProcessStep('');
        }, 1000);
        
      } catch (err: any) {
        setError(err.message || 'Unknown error');
        setLogs((prev) => [...prev, 'Error generating personas.']);
        setProcessSteps([]);
        setCompletedSteps([]);
        setCurrentProcessStep('');
      } finally {
        setLoading(false);
      }
    }
    fetchPersonas();
  }, [currentStage, businessIdea, customerDescription]);

  // Fetch feedback for current stage
  React.useEffect(() => {
    if (personas.length === 0 || !businessIdea || !customerDescription) return;
    
    // Check if this stage has already been completed or if we should skip re-evaluation
    const stageCompleted = completedStages.includes(currentStage.toString());
    const shouldSkipEvaluation = skipReevaluation || isViewingPreviousResults || stageCompleted;
    
    if (shouldSkipEvaluation) {
      // Load existing validation score from localStorage or cached data
      const cachedValidationScore = localStorage.getItem(`validation-score-${id}-${currentStage}`);
      if (cachedValidationScore) {
        try {
          const score = JSON.parse(cachedValidationScore);
          setValidationScore(score);
        } catch (err) {
          console.log('Could not parse cached validation score:', err);
        }
      }
      // Also load cached personas and feedback if available
      const cachedPersonas = localStorage.getItem(`personas-${id}-${currentStage}`);
      if (cachedPersonas) {
        try {
          const personas = JSON.parse(cachedPersonas);
          setPersonas(personas);
        } catch (err) {
          console.log('Could not parse cached personas:', err);
        }
      }
      const cachedSummary = localStorage.getItem(`summary-${id}-${currentStage}`);
      if (cachedSummary) {
        setCollectiveSummary(cachedSummary);
      }
      
      // If stage is completed but we don't have cached data, try to load from saved evaluations
      if (stageCompleted && !cachedValidationScore) {
        loadStageEvaluation(currentStage);
      }
      
      return;
    }
    async function fetchFeedback() {
      setLoading(true);
      setError(null);
      setLogs((prev) => [...prev, `Getting feedback for stage: ${STAGES[currentStage]}...`]);
      try {
        const token = localStorage.getItem('token');
        // Use stage-specific endpoints for better data generation
        const endpoint = currentStage === 0 ? 'problem-discovery' :
                        currentStage === 1 ? 'customer-profiles' :
                        currentStage === 2 ? 'customer-struggles' :
                        currentStage === 3 ? 'solution-fit' :
                        currentStage === 4 ? 'business-models' :
                        currentStage === 5 ? 'market-validation' : 'feedback';
        
        const res = await fetch(`${API_URL}/automated-discovery/${endpoint}`, {
          method: 'POST',
          headers: {
            'Authorization': token ? `Bearer ${token}` : '',
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            personas: personas.map(({ id, name, summary }) => ({
              id: typeof id === 'string' ? id : String(id),
              name,
              summary
            })),
            stage: STAGES[currentStage],
            businessIdea,
            customerDescription,
            businessPlanId: id, // Pass the business plan ID for saving data
          }),
          credentials: 'include'
        });
        if (!res.ok) throw new Error('Failed to fetch feedback');
        const data = await res.json();
        console.log(`Stage ${currentStage} response data:`, data);
        
        // Handle different response formats based on stage
        if (currentStage === 0) {
          // Problem Discovery - data.problem and data.analysis
          setCollectiveSummary(data.summary || data.analysis?.summary || '');
        } else if (currentStage === 1) {
          // Customer Profile - data.profiles and data.analysis
          setCollectiveSummary(data.summary || data.analysis?.summary || '');
        } else if (currentStage === 2) {
          // Customer Struggle - data.struggles and data.analysis
          setCollectiveSummary(data.summary || data.analysis?.summary || '');
        } else if (currentStage === 3) {
          // Solution Fit - data.solutions and data.analysis
          setCollectiveSummary(data.summary || data.analysis?.summary || '');
        } else if (currentStage === 4) {
          // Business Model - data.businessModels and data.analysis
          setCollectiveSummary(data.summary || data.analysis?.summary || '');
        } else if (currentStage === 5) {
          // Market Validation - data.marketData and data.analysis
          setCollectiveSummary(data.summary || data.analysis?.summary || '');
        } else {
          // Fallback to original format for feedback endpoint
          setPersonas((prev) => {
            const updatedPersonas = prev.map((p: any) => ({ ...p, feedback: (data.feedback.find((f: any) => f.personaId === p.id)?.feedback || []) }));
            return updatedPersonas;
          });
          setCollectiveSummary(data.summary);
        }
        
        // Save evaluation to database
        if (data.validationScore) {
          const score = data.validationScore.score || 0;
          const feedback = data.summary || data.analysis?.summary || '';
          saveEvaluation(currentStage, score, feedback, []);
        }
        
        // Save stage-specific data to business plan
        await saveStageDataToBusinessPlan(currentStage, data);
        
        if (data.validationScore) {
          setValidationScore(data.validationScore);
          
          // Save to localStorage for persistence across page refreshes
          localStorage.setItem(`validation-score-${id}-${currentStage}`, JSON.stringify(data.validationScore));
          localStorage.setItem(`summary-${id}-${currentStage}`, data.summary || data.analysis?.summary || '');
          localStorage.setItem(`personas-${id}-${currentStage}`, JSON.stringify(personas));
          
          // Mark this stage as completed
          setCompletedStages(prev => {
            if (!prev.includes(currentStage.toString())) {
              return [...prev, currentStage.toString()];
            }
            return prev;
          });
        }
        // Mark this stage as having data
        setHasDataForStage(prev => ({ ...prev, [currentStage]: true }));
        setLogs((prev) => [...prev, `Feedback for stage "${STAGES[currentStage]}" loaded and saved.`]);
      } catch (err: any) {
        setError(err.message || 'Unknown error');
        setLogs((prev) => [...prev, 'Error fetching feedback.']);
      } finally {
        setLoading(false);
        // Reset skip flag after processing (but only if we're not in the middle of viewing previous results)
        if (skipReevaluation && !showReevaluationModal) {
          setSkipReevaluation(false);
        }
      }
    }
    
    // Check if all stages are completed and we have saved data for the current stage
    if (completedStages.length === STAGES.length && savedEvaluations[currentStage.toString()]) {
      // All stages are completed, just load the saved data for current stage
      console.log('All stages completed, loading saved data for current stage');
      loadStageEvaluation(currentStage);
      setLoading(false);
      return;
    }
    
    // Prevent re-fetching if we already have validation data for this stage
    if (validationScore && hasDataForStage[currentStage]) {
      console.log('Already have validation data for current stage, skipping fetchFeedback');
      return;
    }
    
    // Prevent re-fetching if we've already fetched feedback for this stage
    if (hasFetchedFeedback) {
      console.log('Already fetched feedback for current stage, skipping fetchFeedback');
      return;
    }
    
    // Prevent re-fetching if we're currently loading
    if (loading) {
      console.log('Currently loading, skipping fetchFeedback');
      return;
    }
    
    setHasFetchedFeedback(true);
    fetchFeedback();
  }, [currentStage, personas.length, businessIdea, customerDescription, id, skipReevaluation, completedStages.length, savedEvaluations, isViewingPreviousResults]);

  // Extract fetchFeedback as a standalone function
  async function fetchFeedback() {
    console.log('fetchFeedback called');
    console.log('personas.length:', personas.length);
    console.log('businessIdea:', businessIdea);
    console.log('customerDescription:', customerDescription);
    
    if (personas.length === 0 || !businessIdea || !customerDescription) {
      console.log('Early return from fetchFeedback - missing data');
      setIsGeneratingValidationScore(false);
      setLoading(false);
      return;
    }
    
    // Early return if viewing previous results or skipping re-evaluation
    if (skipReevaluation || isViewingPreviousResults) {
      console.log('Early return from fetchFeedback - viewing previous results or skipping re-evaluation');
      setIsGeneratingValidationScore(false);
      setLoading(false);
      return;
    }
    

    
    setLoading(true);
    setError(null);
    setLogs((prev) => [...prev, `Getting feedback for stage: ${STAGES[currentStage]}...`]);
    
          // Initialize feedback generation steps (only if not skipping re-evaluation)
      if (!skipReevaluation && !isViewingPreviousResults) {
        if (currentStage === 0) {
          setProcessSteps([
            'Analyzing customer personas and business context...',
            'Generating problem-focused feedback from each persona...',
            'Validating problem identification and scope...',
            'Assessing problem urgency and impact...',
            'Calculating expert validation score...',
            'Preparing recommendations and insights...'
          ]);
          setCompletedSteps([]);
          setCurrentProcessStep('Analyzing customer personas and business context...');
    } else if (currentStage === 1) {
      // Customer Profile feedback generation
      setProcessSteps([
        'Analyzing customer personas and profile data...',
        'Generating customer-focused feedback from each persona...',
        'Validating customer clarity and specificity...',
        'Assessing customer relevance and accessibility...',
        'Calculating customer profile validation score...',
        'Preparing customer development recommendations...'
      ]);
      setCompletedSteps([]);
      setCurrentProcessStep('Analyzing customer personas and profile data...');
    } else if (currentStage === 2) {
      // Customer Struggle feedback generation
      setProcessSteps([
        'Analyzing customer pain points and struggles...',
        'Generating struggle-focused feedback from each persona...',
        'Validating struggle identification and scope...',
        'Assessing struggle urgency and impact...',
        'Calculating expert validation score...',
        'Preparing recommendations and insights...'
      ]);
      setCompletedSteps([]);
      setCurrentProcessStep('Analyzing customer pain points and struggles...');
    } else if (currentStage === 3) {
      // Solution Fit feedback generation
      setProcessSteps([
        'Analyzing solution alignment with customer needs...',
        'Evaluating solution effectiveness and impact...',
        'Assessing solution differentiation and uniqueness...',
        'Validating solution value proposition...',
        'Testing solution feasibility and implementation...',
        'Preparing solution fit assessment...'
      ]);
      setCompletedSteps([]);
      setCurrentProcessStep('Analyzing solution alignment with customer needs...');
    } else if (currentStage === 4) {
      // Business Model feedback generation
      setProcessSteps([
        'Analyzing business model viability and sustainability...',
        'Evaluating revenue potential and pricing strategy...',
        'Assessing cost structure and profitability...',
        'Validating competitive positioning and differentiation...',
        'Testing scalability and growth potential...',
        'Preparing business model assessment...'
      ]);
      setCompletedSteps([]);
      setCurrentProcessStep('Analyzing business model viability and sustainability...');
    } else if (currentStage === 5) {
      // Market Validation feedback generation
      setProcessSteps([
        'Analyzing market size and opportunity...',
        'Evaluating market demand and readiness...',
        'Assessing market timing and entry strategy...',
        'Validating competitive landscape...',
        'Testing market access and reach...',
        'Preparing market validation assessment...'
      ]);
      setCompletedSteps([]);
      setCurrentProcessStep('Analyzing market size and opportunity...');
    }
    }
    
    try {
      const token = localStorage.getItem('token');
      console.log('Making feedback request to:', `${API_URL}/automated-discovery/feedback`);
      console.log('Stage being sent:', STAGES[currentStage]);
      console.log('Current stage index:', currentStage);
      
      // Update progress
      setCurrentProcessStep('Generating problem-focused feedback from each persona...');
      await new Promise(resolve => setTimeout(resolve, 600));
      
      setCompletedSteps(['Analyzing customer personas and business context...']);
      setCurrentProcessStep('Validating problem identification and scope...');
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Stage-specific progress updates
      if (currentStage === 0) {
        // Problem Discovery stage
        setCurrentProcessStep('Generating problem-focused feedback from each persona...');
        await new Promise(resolve => setTimeout(resolve, 600));
        
        setCompletedSteps(['Analyzing customer personas and business context...']);
        setCurrentProcessStep('Validating problem identification and scope...');
        await new Promise(resolve => setTimeout(resolve, 500));
      } else if (currentStage === 1) {
        // Customer Profile stage
        setCurrentProcessStep('Generating customer-focused feedback from each persona...');
        await new Promise(resolve => setTimeout(resolve, 600));
        
        setCompletedSteps(['Analyzing customer personas and profile data...']);
        setCurrentProcessStep('Validating customer clarity and specificity...');
        await new Promise(resolve => setTimeout(resolve, 500));
      } else if (currentStage === 2) {
        // Customer Struggle stage
        setCurrentProcessStep('Generating struggle-focused feedback from each persona...');
        await new Promise(resolve => setTimeout(resolve, 600));
        
        setCompletedSteps(['Analyzing customer pain points and struggles...']);
        setCurrentProcessStep('Validating struggle identification and scope...');
        await new Promise(resolve => setTimeout(resolve, 500));
      } else if (currentStage === 3) {
        // Solution Fit stage
        setCurrentProcessStep('Generating solution-focused feedback from each persona...');
        await new Promise(resolve => setTimeout(resolve, 600));
        
        setCompletedSteps(['Analyzing solution alignment with customer needs...']);
        setCurrentProcessStep('Evaluating solution effectiveness and impact...');
        await new Promise(resolve => setTimeout(resolve, 500));
        
        setCompletedSteps(prev => [...prev, 'Analyzing solution differentiation and uniqueness...']);
        setCurrentProcessStep('Validating solution value proposition...');
        await new Promise(resolve => setTimeout(resolve, 400));
        
        setCompletedSteps(prev => [...prev, 'Testing solution feasibility and implementation...']);
        setCurrentProcessStep('Preparing solution fit assessment...');
        await new Promise(resolve => setTimeout(resolve, 300));
      } else if (currentStage === 4) {
        // Business Model stage
        setCurrentProcessStep('Generating business model feedback from each persona...');
        await new Promise(resolve => setTimeout(resolve, 600));
        
        setCompletedSteps(['Analyzing business model viability and sustainability...']);
        setCurrentProcessStep('Evaluating revenue potential and pricing strategy...');
        await new Promise(resolve => setTimeout(resolve, 500));
        
        setCompletedSteps(prev => [...prev, 'Assessing cost structure and profitability...']);
        setCurrentProcessStep('Validating competitive positioning and differentiation...');
        await new Promise(resolve => setTimeout(resolve, 400));
        
        setCompletedSteps(prev => [...prev, 'Testing scalability and growth potential...']);
        setCurrentProcessStep('Preparing business model assessment...');
        await new Promise(resolve => setTimeout(resolve, 300));
      } else if (currentStage === 5) {
        // Market Validation stage
        setCurrentProcessStep('Generating market validation feedback from each persona...');
        await new Promise(resolve => setTimeout(resolve, 600));
        
        setCompletedSteps(['Analyzing market size and opportunity...']);
        setCurrentProcessStep('Evaluating market demand and readiness...');
        await new Promise(resolve => setTimeout(resolve, 500));
        
        setCompletedSteps(prev => [...prev, 'Assessing market timing and entry strategy...']);
        setCurrentProcessStep('Validating competitive landscape...');
        await new Promise(resolve => setTimeout(resolve, 400));
        
        setCompletedSteps(prev => [...prev, 'Testing market access and reach...']);
        setCurrentProcessStep('Preparing market validation assessment...');
        await new Promise(resolve => setTimeout(resolve, 300));
      }
      
      // Add timeout to prevent infinite hanging
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout
      
      const res = await fetch(`${API_URL}/automated-discovery/feedback`, {
        method: 'POST',
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          personas: personas.map(({ id, name, summary }) => ({
            id: typeof id === 'string' ? id : String(id),
            name,
            summary
          })),
          stage: STAGES[currentStage],
          businessIdea,
          customerDescription,
          businessPlanId: id, // Pass the business plan ID for saving data
        }),
        credentials: 'include',
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      console.log('Feedback response status:', res.status);
      console.log('Feedback response ok:', res.ok);
      
      if (!res.ok) {
        const errorText = await res.text();
        console.error('Feedback response error:', errorText);
        throw new Error(`Failed to fetch feedback: ${res.status} ${errorText}`);
      }
      
      const data = await res.json();
      console.log('Feedback response data:', data);
      
      setCompletedSteps(prev => [...prev, 'Generating problem-focused feedback from each persona...', 'Validating problem identification and scope...']);
      setCurrentProcessStep('Assessing problem urgency and impact...');
      await new Promise(resolve => setTimeout(resolve, 400));
      
      setCompletedSteps(prev => [...prev, 'Assessing problem urgency and impact...']);
      setCurrentProcessStep('Calculating expert validation score...');
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Stage-specific completion steps
      if (currentStage === 0) {
        // Problem Discovery stage
        setCompletedSteps(prev => [...prev, 'Generating problem-focused feedback from each persona...', 'Validating problem identification and scope...']);
        setCurrentProcessStep('Assessing problem urgency and impact...');
        await new Promise(resolve => setTimeout(resolve, 400));
        
        setCompletedSteps(prev => [...prev, 'Assessing problem urgency and impact...']);
        setCurrentProcessStep('Calculating expert validation score...');
        await new Promise(resolve => setTimeout(resolve, 300));
      } else if (currentStage === 1) {
        // Customer Profile stage
        setCompletedSteps(prev => [...prev, 'Generating customer-focused feedback from each persona...', 'Validating customer clarity and specificity...']);
        setCurrentProcessStep('Assessing customer relevance and accessibility...');
        await new Promise(resolve => setTimeout(resolve, 400));
        
        setCompletedSteps(prev => [...prev, 'Assessing customer relevance and accessibility...']);
        setCurrentProcessStep('Calculating customer profile validation score...');
        await new Promise(resolve => setTimeout(resolve, 300));
      } else if (currentStage === 2) {
        // Customer Struggle stage
        setCompletedSteps(prev => [...prev, 'Generating struggle-focused feedback from each persona...', 'Validating struggle identification and scope...']);
        setCurrentProcessStep('Assessing struggle urgency and impact...');
        await new Promise(resolve => setTimeout(resolve, 400));
        
        setCompletedSteps(prev => [...prev, 'Assessing struggle urgency and impact...']);
        setCurrentProcessStep('Calculating expert validation score...');
        await new Promise(resolve => setTimeout(resolve, 300));
      } else if (currentStage === 3) {
        // Solution Fit stage
        setCompletedSteps(prev => [...prev, 'Generating solution-focused feedback from each persona...', 'Validating solution value proposition...']);
        setCurrentProcessStep('Assessing solution fit and impact...');
        await new Promise(resolve => setTimeout(resolve, 400));
        
        setCompletedSteps(prev => [...prev, 'Assessing solution fit and impact...']);
        setCurrentProcessStep('Calculating solution fit score...');
        await new Promise(resolve => setTimeout(resolve, 300));
      } else if (currentStage === 4) {
        // Business Model stage
        setCompletedSteps(prev => [...prev, 'Generating business model feedback from each persona...', 'Validating business model viability and sustainability...']);
        setCurrentProcessStep('Assessing business model viability and sustainability...');
        await new Promise(resolve => setTimeout(resolve, 400));
        
        setCompletedSteps(prev => [...prev, 'Assessing business model viability and sustainability...']);
        setCurrentProcessStep('Calculating business model validation score...');
        await new Promise(resolve => setTimeout(resolve, 300));
      } else if (currentStage === 5) {
        // Market Validation stage
        setCompletedSteps(prev => [...prev, 'Generating market validation feedback from each persona...', 'Validating market size and opportunity...']);
        setCurrentProcessStep('Assessing market demand and readiness...');
        await new Promise(resolve => setTimeout(resolve, 400));
        
        setCompletedSteps(prev => [...prev, 'Assessing market demand and readiness...']);
        setCurrentProcessStep('Calculating market validation score...');
        await new Promise(resolve => setTimeout(resolve, 300));
      }
      
      setPersonas((prev) => prev.map((p) => ({ ...p, feedback: (data.feedback.find((f: any) => f.personaId === p.id)?.feedback || []) })));
      setCollectiveSummary(data.summary);
      if (data.validationScore) {
        console.log('Setting validation score for stage', currentStage, ':', data.validationScore);
        setValidationScore(data.validationScore);
        // Immediately stop loading when validation score is available
        setLoading(false);
        console.log('Updated validation score:', data.validationScore);
      } else {
        console.log('No validation score received for stage', currentStage);
      }
      
      setCompletedSteps(prev => [...prev, 'Calculating expert validation score...']);
      setCurrentProcessStep('Preparing recommendations and insights...');
      await new Promise(resolve => setTimeout(resolve, 200));
      
      // Stage-specific final completion step
      if (currentStage === 0) {
        setCompletedSteps(prev => [...prev, 'Calculating expert validation score...']);
        setCurrentProcessStep('Preparing recommendations and insights...');
        await new Promise(resolve => setTimeout(resolve, 200));
      } else if (currentStage === 1) {
        setCompletedSteps(prev => [...prev, 'Calculating customer profile validation score...']);
        setCurrentProcessStep('Preparing customer development recommendations...');
        await new Promise(resolve => setTimeout(resolve, 200));
      } else if (currentStage === 2) {
        setCompletedSteps(prev => [...prev, 'Calculating struggle-focused validation score...']);
        setCurrentProcessStep('Preparing recommendations and insights...');
        await new Promise(resolve => setTimeout(resolve, 200));
      } else if (currentStage === 3) {
        setCompletedSteps(prev => [...prev, 'Calculating solution fit score...']);
        setCurrentProcessStep('Preparing recommendations and insights...');
        await new Promise(resolve => setTimeout(resolve, 200));
      } else if (currentStage === 4) {
        setCompletedSteps(prev => [...prev, 'Calculating business model validation score...']);
        setCurrentProcessStep('Preparing recommendations and insights...');
        await new Promise(resolve => setTimeout(resolve, 200));
      } else if (currentStage === 5) {
        setCompletedSteps(prev => [...prev, 'Calculating market validation score...']);
        setCurrentProcessStep('Preparing recommendations and insights...');
        await new Promise(resolve => setTimeout(resolve, 200));
      }
      
      setLogs((prev) => [...prev, `Feedback for stage "${STAGES[currentStage]}" loaded.`]);
      console.log('fetchFeedback completed successfully');
      
      // Clear process steps after completion
      setTimeout(() => {
        setProcessSteps([]);
        setCompletedSteps([]);
        setCurrentProcessStep('');
        // Ensure loading is false when validation score is available
        if (validationScore) {
          setLoading(false);
        }
      }, 800);
      
    } catch (err: any) {
      console.error('Error in fetchFeedback:', err);
      if (err.name === 'AbortError') {
        setError('Request timed out. Please try again.');
        setLogs((prev) => [...prev, 'Feedback request timed out.']);
      } else {
        setError(err.message || 'Unknown error');
        setLogs((prev) => [...prev, `Error fetching feedback: ${err.message}`]);
      }
      setProcessSteps([]);
      setCompletedSteps([]);
      setCurrentProcessStep('');
    } finally {
      setLoading(false);
      setIsGeneratingValidationScore(false);
      console.log('fetchFeedback finally block - loading and validation score generation set to false');
    }
  }

  // Helper function to check if current stage criteria have been evaluated
  function hasCurrentStageCriteria(validationScore: ValidationScore) {
    // Launch stage (stage 6) doesn't have validation criteria, so always return true
    if (currentStage === 6) {
      return true;
    }
    
    const currentStageCriteria = getValidationCriteria(validationScore);
    // If no criteria exist for this stage, return false
    if (Object.keys(currentStageCriteria).length === 0) {
      return false;
    }
    return Object.values(currentStageCriteria).some(value => value !== undefined && value !== 0);
  }

  // Helper function to get validation criteria based on current stage
  function getValidationCriteria(validationScore: ValidationScore) {
    if (currentStage === 0) {
      // Problem Discovery stage
      return {
        problemIdentification: validationScore.criteria.problemIdentification,
        problemValidation: validationScore.criteria.problemValidation,
        problemScope: validationScore.criteria.problemScope,
        problemUrgency: validationScore.criteria.problemUrgency,
        problemImpact: validationScore.criteria.problemImpact,
      };
    } else if (currentStage === 1) {
      // Customer Profile stage
      return {
        customerClarity: validationScore.criteria.customerClarity,
        customerSpecificity: validationScore.criteria.customerSpecificity,
        customerRelevance: validationScore.criteria.customerRelevance,
        customerAccessibility: validationScore.criteria.customerAccessibility,
        customerValue: validationScore.criteria.customerValue,
      };
    } else if (currentStage === 2) {
      // Customer Struggle stage
      return {
        struggleIdentification: validationScore.criteria.struggleIdentification,
        struggleValidation: validationScore.criteria.struggleValidation,
        struggleUrgency: validationScore.criteria.struggleUrgency,
        struggleFrequency: validationScore.criteria.struggleFrequency,
        struggleImpact: validationScore.criteria.struggleImpact,
      };
    } else if (currentStage === 3) {
      // Solution Fit stage
      return {
        solutionAlignment: validationScore.criteria.solutionAlignment,
        solutionEffectiveness: validationScore.criteria.solutionEffectiveness,
        solutionDifferentiation: validationScore.criteria.solutionDifferentiation,
        solutionValue: validationScore.criteria.solutionValue,
        solutionFeasibility: validationScore.criteria.solutionFeasibility,
      };
    } else if (currentStage === 4) {
      // Business Model stage
      return {
        modelViability: validationScore.criteria.modelViability,
        revenuePotential: validationScore.criteria.revenuePotential,
        costEfficiency: validationScore.criteria.costEfficiency,
        competitiveAdvantage: validationScore.criteria.competitiveAdvantage,
        scalability: validationScore.criteria.scalability,
      };
    } else if (currentStage === 5) {
      // Market Validation stage
      return {
        marketSize: validationScore.criteria.marketSize,
        marketDemand: validationScore.criteria.marketDemand,
        marketTiming: validationScore.criteria.marketTiming,
        competitiveLandscape: validationScore.criteria.competitiveLandscape,
        marketAccess: validationScore.criteria.marketAccess,
      };
    } else if (currentStage === 6) {
      // Launch stage - return empty object since Launch doesn't have validation criteria
      return {};
    }
    // Default to all criteria
    return validationScore.criteria;
  }

  // Handlers for Launch stage buttons
  function handleGenerate(type: 'summary' | 'plan' | 'pitch' | 'financial' | 'businessModel') {
    // TODO: Replace with actual generation logic or API call
    alert(`Generate: ${type}`);
  }

  function openPitchDeckEditor() {
    setPitchDeckSlides(PITCH_DECK_SLIDES.map(slide => {
      let content = '';
      switch (slide.key) {
        case 'title':
          content = planData?.title || businessIdea || '';
          break;
        case 'problem':
          content = planData?.problem?.description || '';
          break;
        case 'solution':
          content = planData?.solution?.description || '';
          break;
        case 'market':
          content = planData?.marketEvaluation?.marketSize || '';
          break;
        case 'product':
          content = (planData?.solution?.keyFeatures || []).join('\n') || '';
          break;
        case 'businessModel':
          content = planData?.sections?.['Business Model'] || '';
          break;
        case 'goToMarket':
          content = planData?.sections?.['Go-to-Market'] || '';
          break;
        case 'competition':
          content = (planData?.marketEvaluation?.competitors || []).join('\n') || '';
          break;
        case 'traction':
          content = planData?.sections?.['Traction'] || '';
          break;
        case 'team':
          content = planData?.sections?.['Team'] || '';
          break;
        case 'financials':
          content = planData?.sections?.['Financials'] || '';
          break;
        case 'ask':
          content = planData?.sections?.['Ask'] || '';
          break;
        default:
          content = '';
      }
      return {
        key: slide.key,
        title: slide.defaultTitle,
        content,
      };
    }));
    setCurrentSlideIdx(0);
    setShowPitchDeckEditor(true);
  }

  function handleSlideFieldChange(idx: number, field: 'title' | 'content', value: string) {
    setPitchDeckSlides(prev => prev.map((slide, i) => i === idx ? { ...slide, [field]: value } : slide));
  }

  function downloadCustomPitchDeck() {
    if (!id) return;
    const slidesObj: Record<string, string> = {};
    pitchDeckSlides.forEach(slide => {
      if (slide.key === 'title') return; // title handled separately
      slidesObj[slide.key] = slide.content;
    });
    fetch(`${API_URL}/business-plan/${id}/pitch-deck`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': localStorage.getItem('token') ? `Bearer ${localStorage.getItem('token')}` : ''
      },
      body: JSON.stringify({
        title: pitchDeckSlides[0].content || pitchDeckSlides[0].title,
        slides: slidesObj
      })
    })
      .then(res => {
        if (!res.ok) throw new Error('Failed to generate pitch deck');
        return res.blob();
      })
      .then(blob => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'pitch-deck.pptx';
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);
        setShowPitchDeckEditor(false);
      })
      .catch(err => {
        alert('Failed to download pitch deck.');
        console.error(err);
      });
  }

  // Auto-improve function using AI
  async function handleAutoImprove() {
    if (!validationScore || !businessIdea || !customerDescription) return;
    
    setIsAutoImproving(true);
    setLogs((prev) => [...prev, 'Starting AI-powered comprehensive improvement...']);
    
    // Initialize auto-improve process steps
    setProcessSteps([
      'Analyzing current validation scores and recommendations...',
      'Identifying improvement opportunities across all sections...',
      'Generating enhanced problem statement...',
      'Creating improved solution description...',
      'Refining customer pain points and value proposition...',
      'Updating market and competitive analysis...',
      'Preparing comprehensive business plan improvements...'
    ]);
    setCompletedSteps([]);
    setCurrentProcessStep('Analyzing current validation scores and recommendations...');
    
    // Add Customer Profile specific process steps
    if (currentStage === 1) {
      setProcessSteps([
        'Analyzing current customer profile validation scores...',
        'Identifying customer profile improvement opportunities...',
        'Generating enhanced customer clarity and specificity...',
        'Creating improved customer relevance and accessibility...',
        'Refining customer value proposition and targeting...',
        'Updating customer journey and touchpoint analysis...',
        'Preparing comprehensive customer profile improvements...'
      ]);
      setCompletedSteps([]);
      setCurrentProcessStep('Analyzing current customer profile validation scores...');
    }
    
    try {
      const token = localStorage.getItem('token');
      
      // Update progress
      setCurrentProcessStep('Identifying improvement opportunities across all sections...');
      await new Promise(resolve => setTimeout(resolve, 600));
      
      setCompletedSteps(['Analyzing current validation scores and recommendations...']);
      setCurrentProcessStep('Generating enhanced problem statement...');
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setCompletedSteps(prev => [...prev, 'Identifying improvement opportunities across all sections...']);
      setCurrentProcessStep('Creating improved solution description...');
      await new Promise(resolve => setTimeout(resolve, 400));
      
      setCompletedSteps(prev => [...prev, 'Generating enhanced problem statement...']);
      setCurrentProcessStep('Refining customer pain points and value proposition...');
      await new Promise(resolve => setTimeout(resolve, 300));
      
      setCompletedSteps(prev => [...prev, 'Creating improved solution description...']);
      setCurrentProcessStep('Updating market and competitive analysis...');
      await new Promise(resolve => setTimeout(resolve, 300));
      
      setCompletedSteps(prev => [...prev, 'Refining customer pain points and value proposition...']);
      setCurrentProcessStep('Preparing comprehensive business plan improvements...');
      
      // Use different endpoint for Customer Profile stage
      const endpoint = currentStage === 1 ? 'customer-profile-improve' : 'auto-improve';
      const res = await fetch(`${API_URL}/automated-discovery/${endpoint}`, {
        method: 'POST',
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          businessIdea,
          customerDescription,
          currentValidationScore: validationScore.score,
          validationCriteria: validationScore.criteria,
          recommendations: validationScore.recommendations,
          discoveredProblems: validationScore.discoveredProblems || [],
          planData: planData, // Include current business plan sections
          businessPlanId: id // Add the business plan ID
        }),
        credentials: 'include'
      });
      
      if (!res.ok) {
        const errorText = await res.text();
        console.error('Auto-improve failed:', res.status, errorText);
        throw new Error(`Failed to improve business plan: ${res.status} ${errorText}`);
      }
      
      const data = await res.json();
      
      setCompletedSteps(prev => [...prev, 'Updating market and competitive analysis...', 'Preparing comprehensive business plan improvements...']);
      setCurrentProcessStep('Improvements ready for review...');
      await new Promise(resolve => setTimeout(resolve, 200));
      
      // Set improved sections
      setImprovedSections(data.improvedSections);
      
      // Initialize editable sections with AI suggestions
      setEditableSections({
        problemStatement: data.improvedSections.problemStatement,
        solution: data.improvedSections.solution,
        customerPainPoints: data.improvedSections.customerPainPoints,
        valueProposition: data.improvedSections.valueProposition,
        marketAnalysis: data.improvedSections.marketAnalysis,
        competitiveAnalysis: data.improvedSections.competitiveAnalysis
      });
      
      setShowImprovementModal(true);
      setLogs((prev) => [...prev, 'AI comprehensive improvement completed successfully.']);
      
      // Clear process steps after completion
      setTimeout(() => {
        setProcessSteps([]);
        setCompletedSteps([]);
        setCurrentProcessStep('');
      }, 1000);
      
    } catch (err: any) {
      setError(err.message || 'Failed to improve business plan');
      setLogs((prev) => [...prev, 'Error during AI improvement.']);
      setProcessSteps([]);
      setCompletedSteps([]);
      setCurrentProcessStep('');
    } finally {
      setIsAutoImproving(false);
    }
  }

  // Apply the improved sections selectively
  async function applyImprovement() {
    console.log('applyImprovement called');
    console.log('editableSections:', editableSections);
    console.log('id:', id);
    console.log('selectedSections:', selectedSections);
    
    if (!editableSections || !id) {
      console.log('Early return - missing editableSections or id');
      return;
    }
    
    // Initialize apply improvement process steps
    setProcessSteps([
      'Preparing selected improvements for application...',
      'Updating business plan sections...',
      'Validating data structure and format...',
      'Saving changes to database...',
      'Triggering re-validation process...',
      'Generating updated validation scores...',
      'Finalizing improvement application...'
    ]);
    setCompletedSteps([]);
    setCurrentProcessStep('Preparing selected improvements for application...');
    
    try {
      const token = localStorage.getItem('token');
      console.log('Token:', token ? 'Present' : 'Missing');
      
      // Update progress
      setCurrentProcessStep('Updating business plan sections...');
      await new Promise(resolve => setTimeout(resolve, 400));
      
      setCompletedSteps(['Preparing selected improvements for application...']);
      setCurrentProcessStep('Validating data structure and format...');
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Prepare update data based on selected sections
      const updateData: any = {};
      
      if (selectedSections.problemStatement) {
        updateData.idea = { existingIdeaText: editableSections.problemStatement };
        console.log('Adding problem statement update:', updateData.idea);
      }
      
      if (selectedSections.solution) {
        updateData.solution = { description: editableSections.solution };
        console.log('Adding solution update:', updateData.solution);
      }
      
      if (selectedSections.customerPainPoints) {
        updateData.customer = { 
          ...planData?.customer,
          painPoints: editableSections.customerPainPoints 
        };
        console.log('Adding customer pain points update:', updateData.customer);
      }
      
      // Handle sections that need to be updated in the sections object
      const sectionsToUpdate: any = {};
      if (selectedSections.valueProposition) {
        sectionsToUpdate.valueProposition = editableSections.valueProposition;
      }
      if (selectedSections.marketAnalysis) {
        sectionsToUpdate.marketAnalysis = editableSections.marketAnalysis;
      }
      if (selectedSections.competitiveAnalysis) {
        sectionsToUpdate.competitiveAnalysis = editableSections.competitiveAnalysis;
      }
      
      if (Object.keys(sectionsToUpdate).length > 0) {
        updateData.sections = {
          ...planData?.sections,
          ...sectionsToUpdate
        };
        console.log('Adding sections update:', updateData.sections);
      }
      
      setCompletedSteps(prev => [...prev, 'Updating business plan sections...', 'Validating data structure and format...']);
      setCurrentProcessStep('Saving changes to database...');
      await new Promise(resolve => setTimeout(resolve, 300));
      
      console.log('Final updateData:', updateData);
      
      const res = await fetch(`${API_URL}/business-plan/${id}`, {
        method: 'PUT',
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updateData),
        credentials: 'include'
      });
      
      console.log('Response status:', res.status);
      console.log('Response ok:', res.ok);
      
      if (!res.ok) {
        const errorText = await res.text();
        console.error('Response error:', errorText);
        throw new Error(`Failed to update business plan: ${res.status} ${errorText}`);
      }
      
      const responseData = await res.json();
      console.log('Response data:', responseData);
      
      setCompletedSteps(prev => [...prev, 'Saving changes to database...']);
      setCurrentProcessStep('Triggering re-validation process...');
      await new Promise(resolve => setTimeout(resolve, 200));
      
      // Update local state
      if (selectedSections.problemStatement) {
        setBusinessIdea(editableSections.problemStatement);
        console.log('Updated businessIdea state');
      }
      
      // Update planData state to reflect the applied improvements
      if (planData) {
        const updatedPlanData = { ...planData };
        
        if (selectedSections.problemStatement) {
          updatedPlanData.idea = { 
            ...updatedPlanData.idea, 
            existingIdeaText: editableSections.problemStatement 
          };
        }
        
        if (selectedSections.solution) {
          updatedPlanData.solution = { 
            ...updatedPlanData.solution, 
            description: editableSections.solution 
          };
        }
        
        if (selectedSections.customerPainPoints) {
          updatedPlanData.customer = { 
            ...updatedPlanData.customer, 
            painPoints: editableSections.customerPainPoints 
          };
        }
        
        if (selectedSections.valueProposition || selectedSections.marketAnalysis || selectedSections.competitiveAnalysis) {
          updatedPlanData.sections = {
            ...updatedPlanData.sections,
            ...(selectedSections.valueProposition && { valueProposition: editableSections.valueProposition }),
            ...(selectedSections.marketAnalysis && { marketAnalysis: editableSections.marketAnalysis }),
            ...(selectedSections.competitiveAnalysis && { competitiveAnalysis: editableSections.competitiveAnalysis })
          };
        }
        
        setPlanData(updatedPlanData);
        console.log('Updated planData state with improvements');
      }
      
      setCompletedSteps(prev => [...prev, 'Triggering re-validation process...']);
      setCurrentProcessStep('Generating updated validation scores...');
      
      setShowImprovementModal(false);
      setImprovedSections(null);
      setEditableSections(null);
      setSelectedSections({
        problemStatement: true,
        solution: false,
        customerPainPoints: false,
        valueProposition: false,
        marketAnalysis: false,
        competitiveAnalysis: false
      });
      
      // Trigger re-validation
      setIsGeneratingValidationScore(true);
      await fetchFeedback();
      
      setCompletedSteps(prev => [...prev, 'Generating updated validation scores...']);
      setCurrentProcessStep('Finalizing improvement application...');
      await new Promise(resolve => setTimeout(resolve, 200));
      
      setLogs((prev) => [...prev, 'Selected sections updated and re-validated.']);
      console.log('Improvement applied successfully');
      
      // Clear process steps after completion
      setTimeout(() => {
        setProcessSteps([]);
        setCompletedSteps([]);
        setCurrentProcessStep('');
      }, 800);
      
    } catch (err: any) {
      console.error('Error in applyImprovement:', err);
      setError(err.message || 'Failed to apply improvements');
      setLogs((prev) => [...prev, `Error applying improvements: ${err.message}`]);
      setProcessSteps([]);
      setCompletedSteps([]);
      setCurrentProcessStep('');
    } finally {
      // Ensure validation score generation state is reset
      setIsGeneratingValidationScore(false);
    }
  }

  // Helper function to get current section content
  function getCurrentSectionContent(sectionKey: string) {
    const sectionMap: { [key: string]: string } = {
      // Problem Discovery - Enhanced mapping for all expected fields
      problemStatement: planData?.problem?.description || planData?.idea?.existingIdeaText || planData?.summary || planData?.sections?.problemStatement || '',
      customerPainPoints: planData?.customer?.painPoints?.join('\n• ') || planData?.sections?.customerPainPoints || '',
      problemDiscovery: planData?.sections?.problemDiscovery || '',
      problemDiscoveryAnalysis: planData?.sections?.problemDiscoveryAnalysis || '',
      problemScope: planData?.sections?.problemScope || '',
      problemUrgency: planData?.sections?.problemUrgency || '',
      problemImpact: planData?.sections?.problemImpact || '',
      problemEvidence: planData?.sections?.problemEvidence || '',
      rootCauses: planData?.sections?.rootCauses || '',
      customerInsights: planData?.sections?.customerInsights || '',
      problemValidation: planData?.sections?.problemValidation || '',
      // Customer Profile - Enhanced mapping for all expected fields
      customerDescription: planData?.customer?.description || planData?.customer?.persona?.description || planData?.sections?.customerDescription || '',
      customerSegments: planData?.customer?.persona?.segments?.join('\n• ') || planData?.customer?.segments?.join('\n• ') || planData?.sections?.customerSegments || '',
      customerMotivations: planData?.customer?.persona?.motivations?.join('\n• ') || planData?.customer?.motivations?.join('\n• ') || planData?.sections?.customerMotivations || '',
      customerAccessibility: planData?.customer?.persona?.accessibility || planData?.customer?.accessibility || planData?.sections?.customerAccessibility || '',
      customerValue: planData?.customer?.persona?.value || planData?.customer?.value || planData?.sections?.customerValue || '',
      customerProfiles: planData?.sections?.customerProfiles || '',
      customerProfileAnalysis: planData?.sections?.customerProfileAnalysis || '',
      customerObjections: planData?.sections?.customerObjections || '',
      // Customer Struggle - Enhanced mapping for all expected fields
      customerStruggles: planData?.customer?.struggles?.join('\n• ') || planData?.sections?.customerStruggles || '',
      struggleEvidence: planData?.customer?.struggleEvidence?.join('\n• ') || planData?.sections?.struggleEvidence || '',
      struggleFrequency: planData?.customer?.struggleFrequency || planData?.sections?.struggleFrequency || '',
      struggleImpact: planData?.customer?.struggleImpact || planData?.sections?.struggleImpact || '',
      struggleUrgency: planData?.customer?.struggleUrgency || planData?.sections?.struggleUrgency || '',
      customerQuotes: planData?.customer?.quotes?.join('\n• ') || planData?.sections?.customerQuotes || '',
      customerStruggleAnalysis: planData?.sections?.customerStruggleAnalysis || '',
      rootCause: planData?.sections?.rootCause || '',
      // Solution Fit - Enhanced mapping for all expected fields
      solutionDescription: planData?.solution?.description || planData?.sections?.solutionDescription || '',
      solutionFeatures: planData?.solution?.keyFeatures?.join('\n• ') || planData?.sections?.keyFeatures || '',
      solutionBenefits: planData?.solution?.benefits?.join('\n• ') || planData?.sections?.benefits || '',
      competitiveAdvantages: planData?.solution?.competitiveAdvantages?.join('\n• ') || planData?.sections?.competitiveAdvantages || '',
      valueProposition: planData?.valueProposition?.description || planData?.sections?.valueProposition || '',
      implementationRoadmap: planData?.solution?.implementationRoadmap || planData?.sections?.implementationRoadmap || '',
      solutionFit: planData?.sections?.solutionFit || '',
      solutionFitAnalysis: planData?.sections?.solutionFitAnalysis || '',
      technicalRequirements: planData?.sections?.technicalRequirements || '',
      resourceRequirements: planData?.sections?.resourceRequirements || '',
      // Business Model - Enhanced mapping for all expected fields
      revenueModel: planData?.businessModel?.revenueModel || planData?.sections?.revenueStreams || '',
      costStructure: planData?.businessModel?.costStructure || planData?.sections?.costStructure || '',
      pricingStrategy: planData?.businessModel?.pricingStrategy || '',
      competitiveAdvantagesBM: planData?.businessModel?.competitiveAdvantages?.join('\n• ') || planData?.sections?.competitiveAdvantages || '',
      scalabilityFactors: planData?.businessModel?.scalabilityFactors?.join('\n• ') || planData?.sections?.scalability || '',
      growthStrategy: planData?.businessModel?.growthStrategy || '',
      businessModels: planData?.sections?.businessModels || '',
      businessModelAnalysis: planData?.sections?.businessModelAnalysis || '',
      financialProjections: planData?.sections?.financialProjections || '',
      targetMarket: planData?.sections?.targetMarket || '',
      // Market Validation - Enhanced mapping for all expected fields
      marketSize: planData?.marketEvaluation?.marketSize || planData?.sections?.marketSize || '',
      marketDemand: planData?.marketEvaluation?.marketDemand || planData?.sections?.marketDemand || '',
      marketTiming: planData?.marketEvaluation?.marketTiming || planData?.sections?.marketTiming || '',
      competitiveAnalysis: planData?.marketEvaluation?.competitors?.join('\n• ') || planData?.sections?.competitors || '',
      marketEntryStrategy: planData?.marketEvaluation?.marketEntryStrategy || planData?.sections?.marketEntryStrategy || '',
      customerDemand: planData?.marketEvaluation?.customerDemand || planData?.sections?.customerDemand || '',
      marketData: planData?.sections?.marketData || '',
      marketValidationAnalysis: planData?.sections?.marketValidationAnalysis || '',
      validationTests: planData?.sections?.validationTests || '',
      marketTrends: planData?.sections?.marketTrends || '',
      growthPotential: planData?.sections?.growthPotential || '',
      // Add more as needed
    };
    // Fallback to improvedSections if original is missing
    return sectionMap[sectionKey] || (fullPlanSections && fullPlanSections[sectionKey]) || '';
  }

  // Helper function to update editable section
  function updateEditableSection(sectionKey: string, value: string | string[]) {
    setEditableSections(prev => prev ? {
      ...prev,
      [sectionKey]: value
    } : null);
  }

  const [showFullPlanModal, setShowFullPlanModal] = React.useState(false);
  const [fullPlanSections, setFullPlanSections] = React.useState<any>({});

  async function handleViewFullPlan() {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/business-plan/${id}`, {
        credentials: 'include',
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
          'Content-Type': 'application/json'
        }
      });
      if (!res.ok) throw new Error('Failed to fetch business plan');
      const data = await res.json();
      console.log('Full business plan data:', data);
      console.log('Business plan sections:', data.sections);
      console.log('Sections keys:', Object.keys(data.sections || {}));
      setFullPlanSections(data.sections || {});
      setShowFullPlanModal(true);
    } catch (err: any) {
      setError(err.message || 'Unknown error');
    } finally {
      setLoading(false);
    }
  }

  // Function to save stage-specific data to the business plan
  // Helper function to convert arrays to readable text
  function arrayToReadableText(arr: any[]): string {
    if (!Array.isArray(arr)) return '';
    return arr.map((item, index) => `${index + 1}. ${item}`).join('\n');
  }

  // Helper function to convert objects to readable text
  function objectToReadableText(obj: any): string {
    if (!obj || typeof obj !== 'object') return '';
    if (Array.isArray(obj)) return arrayToReadableText(obj);
    
    return Object.entries(obj)
      .map(([key, value]) => `${key}: ${value}`)
      .join('\n');
  }

  async function saveStageDataToBusinessPlan(stage: number, data: any) {
    try {
      const token = localStorage.getItem('token');
      
      if (!id) {
        console.warn('No business plan ID found, skipping save');
        return;
      }

      let sectionsToSave: any = {};

      switch (stage) {
        case 0: // Problem Discovery
          sectionsToSave = {
            problemDiscovery: data.problem?.description || '',
            problemDiscoveryAnalysis: data.analysis?.summary || '',
            problemStatement: data.problem?.statement || '',
            problemScope: data.problem?.scope || '',
            problemUrgency: data.problem?.urgency || '',
            problemImpact: data.problem?.impact || '',
            problemEvidence: data.problem?.evidence || '',
            rootCauses: arrayToReadableText(data.problem?.rootCauses || []),
            customerInsights: arrayToReadableText(data.problem?.customerInsights || []),
            problemValidation: data.problem?.validation || ''
          };
          break;
        case 1: // Customer Profile
          sectionsToSave = {
            customerProfiles: objectToReadableText(data.profiles || []),
            customerProfileAnalysis: data.analysis?.summary || '',
            customerSegments: arrayToReadableText(data.profiles?.[0]?.segments || []),
            customerPainPoints: arrayToReadableText(data.profiles?.[0]?.painPoints || []),
            customerMotivations: arrayToReadableText(data.profiles?.[0]?.motivations || []),
            customerAccessibility: data.profiles?.[0]?.accessibility || '',
            customerValue: data.profiles?.[0]?.value || '',
            customerObjections: arrayToReadableText(data.profiles?.[0]?.objections || [])
          };
          break;
        case 2: // Customer Struggle
          sectionsToSave = {
            customerStruggles: objectToReadableText(data.struggles || []),
            customerStruggleAnalysis: data.analysis?.summary || '',
            struggleEvidence: data.struggles?.[0]?.evidence || '',
            struggleFrequency: data.struggles?.[0]?.frequency || '',
            struggleImpact: data.struggles?.[0]?.impact || '',
            struggleUrgency: data.struggles?.[0]?.urgency || '',
            customerQuotes: arrayToReadableText(data.struggles?.[0]?.customerQuotes || []),
            rootCause: data.analysis?.rootCause || ''
          };
          break;
        case 3: // Solution Fit
          sectionsToSave = {
            solutionFit: objectToReadableText(data.solution || {}),
            solutionFitAnalysis: data.analysis?.summary || '',
            solutionDescription: data.solution?.description || '',
            keyFeatures: arrayToReadableText(data.solution?.keyFeatures || []),
            benefits: arrayToReadableText(data.solution?.benefits || []),
            competitiveAdvantages: arrayToReadableText(data.solution?.competitiveAdvantages || []),
            valueProposition: data.solution?.valueProposition || '',
            implementationRoadmap: data.solution?.implementationRoadmap || '',
            technicalRequirements: arrayToReadableText(data.solution?.technicalRequirements || []),
            resourceRequirements: arrayToReadableText(data.solution?.resourceRequirements || [])
          };
          break;
        case 4: // Business Model
          sectionsToSave = {
            businessModels: objectToReadableText(data.models || []),
            businessModelAnalysis: data.analysis?.summary || '',
            revenueStreams: objectToReadableText(data.models?.[0]?.revenueStreams || []),
            costStructure: objectToReadableText(data.models?.[0]?.costStructure || {}),
            competitiveAdvantages: arrayToReadableText(data.models?.[0]?.advantages || []),
            scalability: data.models?.[0]?.scalability || '',
            financialProjections: objectToReadableText(data.financialProjections || {}),
            targetMarket: data.models?.[0]?.targetMarket || ''
          };
          break;
        case 5: // Market Validation
          sectionsToSave = {
            marketData: objectToReadableText(data.marketData || {}),
            marketValidationAnalysis: data.analysis?.summary || '',
            competitors: objectToReadableText(data.competitors || []),
            validationTests: objectToReadableText(data.validationTests || []),
            marketSize: data.marketData?.marketSize || '',
            marketDemand: data.marketData?.marketDemand || '',
            marketTiming: data.marketData?.marketTiming || '',
            marketEntryStrategy: data.marketData?.marketEntryStrategy || '',
            customerDemand: data.marketData?.customerDemand || '',
            marketTrends: arrayToReadableText(data.marketData?.marketTrends || []),
            growthPotential: data.marketData?.growthPotential || ''
          };
          break;
      }

      if (Object.keys(sectionsToSave).length > 0) {
        const saveResponse = await fetch(`${API_URL}/business-plan/${id}`, {
          method: 'PUT',
          headers: {
            'Authorization': token ? `Bearer ${token}` : '',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            sections: sectionsToSave
          }),
        });

        if (saveResponse.ok) {
          console.log(`Stage ${stage} data saved successfully`);
          console.log('Saved sections:', sectionsToSave);
          
          // Update plan status based on stage completion
          try {
            const statusUpdateResponse = await fetch(`${API_URL}/automated-discovery/update-status`, {
              method: 'POST',
              headers: {
                'Authorization': token ? `Bearer ${token}` : '',
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                businessPlanId: id,
                stage: stage
              }),
            });
            
            if (statusUpdateResponse.ok) {
              console.log(`Plan status updated for stage ${stage}`);
            } else {
              console.error(`Failed to update plan status for stage ${stage}`);
            }
          } catch (statusError) {
            console.error('Error updating plan status:', statusError);
          }
        } else {
          console.error(`Failed to save stage ${stage} data`);
          const errorText = await saveResponse.text();
          console.error('Save error details:', errorText);
        }
      }
    } catch (error) {
      console.error('Error saving stage data to business plan:', error);
    }
  }

  return (
    <div style={{ display: 'flex', height: '100vh', background: '#f7f8fa', position: 'relative' }}>
      {/* Back to Dashboard button in upper right */}
      {/* This button is now moved to the main section */}

      {/* Progress Sidebar */}
      <aside style={{ 
        width: 120, 
        background: '#fff', 
        borderRight: '1px solid #eee', 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        paddingTop: 32, 
        height: '100vh', 
        justifyContent: 'space-between' 
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          {STAGES.map((stage, idx) => (
            <div 
              key={stage} 
              style={{ 
                marginBottom: 32, 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center',
                cursor: (() => {
                  // Special handling for Launch stage (stage 6)
                  if (idx === 6) {
                    const allPreviousStagesCompleted = [0, 1, 2, 3, 4, 5].every(stage => 
                      completedStages.includes(stage.toString())
                    );
                    return allPreviousStagesCompleted ? 'pointer' : 'default';
                  }
                  return (idx <= currentStage || completedStages.includes(idx.toString())) ? 'pointer' : 'default';
                })(),
                opacity: (() => {
                  // Special handling for Launch stage (stage 6)
                  if (idx === 6) {
                    const allPreviousStagesCompleted = [0, 1, 2, 3, 4, 5].every(stage => 
                      completedStages.includes(stage.toString())
                    );
                    return allPreviousStagesCompleted ? 1 : 0.5;
                  }
                  return (idx <= currentStage || completedStages.includes(idx.toString())) ? 1 : 0.5;
                })(),
                transition: 'all 0.2s ease'
              }}
              onClick={() => {
                // Special handling for Launch stage (stage 6) - allow if all previous stages are completed
                if (idx === 6) {
                  const allPreviousStagesCompleted = [0, 1, 2, 3, 4, 5].every(stage => 
                    completedStages.includes(stage.toString())
                  );
                  if (allPreviousStagesCompleted) {
                    handleStageNavigation(idx);
                    return;
                  }
                }
                
                // Allow navigation to any stage that has been reached, is current, or is completed
                if (idx <= currentStage || completedStages.includes(idx.toString())) {
                  handleStageNavigation(idx);
                }
              }}
              onMouseEnter={(e) => {
                // Special handling for Launch stage (stage 6)
                if (idx === 6) {
                  const allPreviousStagesCompleted = [0, 1, 2, 3, 4, 5].every(stage => 
                    completedStages.includes(stage.toString())
                  );
                  if (allPreviousStagesCompleted) {
                    e.currentTarget.style.transform = 'scale(1.05)';
                    return;
                  }
                }
                
                if (idx <= currentStage || completedStages.includes(idx.toString())) {
                  e.currentTarget.style.transform = 'scale(1.05)';
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
              }}
              title={(() => {
                // Special handling for Launch stage (stage 6)
                if (idx === 6) {
                  const allPreviousStagesCompleted = [0, 1, 2, 3, 4, 5].every(stage => 
                    completedStages.includes(stage.toString())
                  );
                  return allPreviousStagesCompleted ? `Go to ${stage}` : `${stage} (complete all previous stages first)`;
                }
                return idx <= currentStage || completedStages.includes(idx.toString()) ? `Go to ${stage}` : `${stage} (not yet available)`;
              })()}
            >
              <div style={{
                width: 28,
                height: 28,
                borderRadius: '50%',
                background: (() => {
                  // Special handling for Launch stage (stage 6)
                  if (idx === 6) {
                    const allPreviousStagesCompleted = [0, 1, 2, 3, 4, 5].every(stage => 
                      completedStages.includes(stage.toString())
                    );
                    const launchStageCompleted = completedStages.includes('6');
                    if (launchStageCompleted) {
                      return '#232323'; // Completed - dark background
                    } else if (allPreviousStagesCompleted) {
                      return idx === currentStage 
                        ? 'linear-gradient(135deg, #5ad6ff 0%, #5a6ee6 100%)' 
                        : '#e5e5e5'; // Available but not completed
                    } else {
                      return '#e5e5e5'; // Not available
                    }
                  }
                  return (idx < currentStage || completedStages.includes(idx.toString()))
                    ? '#232323'
                    : idx === currentStage
                      ? 'linear-gradient(135deg, #5ad6ff 0%, #5a6ee6 100%)'
                      : '#e5e5e5';
                })(),
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700,
                fontSize: 16,
                marginBottom: 4,
                boxShadow: idx === currentStage ? '0 2px 8px #5ad6ff44' : undefined,
                transition: 'all 0.2s ease'
              }}>{(() => {
                // Special handling for Launch stage (stage 6)
                if (idx === 6) {
                  const launchStageCompleted = completedStages.includes('6');
                  if (launchStageCompleted) {
                    return '✓'; // Show checkmark if completed
                  }
                  return '7'; // Show number if not completed
                }
                return (idx < currentStage || completedStages.includes(idx.toString())) ? '✓' : idx + 1;
              })()}</div>
              <span style={{ 
                fontSize: 12, 
                color: (() => {
                  // Special handling for Launch stage (stage 6)
                  if (idx === 6) {
                    const launchStageCompleted = completedStages.includes('6');
                    if (launchStageCompleted) {
                      return '#666'; // Completed - darker text
                    } else if (idx === currentStage) {
                      return '#181a1b'; // Current stage - bold text
                    } else {
                      const allPreviousStagesCompleted = [0, 1, 2, 3, 4, 5].every(stage => 
                        completedStages.includes(stage.toString())
                      );
                      return allPreviousStagesCompleted ? '#666' : '#888'; // Available or not available
                    }
                  }
                  return idx === currentStage ? '#181a1b' : (idx < currentStage || completedStages.includes(idx.toString())) ? '#666' : '#888';
                })(), 
                textAlign: 'center', 
                maxWidth: 80,
                fontWeight: idx === currentStage ? 600 : 400
              }}>{stage}</span>
            </div>
          ))}
        </div>
        
        {/* Completed Stages Icon */}
        <div 
          style={{
            marginBottom: 32,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            opacity: completedStages.length > 0 ? 1 : 0.5
          }}
          onClick={() => setShowCompletedStagesModal(true)}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'scale(1.05)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1)';
          }}
          title={completedStages.length > 0 ? "View completed stages" : "No completed stages yet"}
        >
          <div style={{
            width: 28,
            height: 28,
            borderRadius: '50%',
            background: completedStages.length > 0 ? '#10b981' : '#6b7280',
            color: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 700,
            fontSize: 16,
            marginBottom: 4,
            boxShadow: completedStages.length > 0 ? '0 2px 8px #10b98144' : '0 2px 8px #6b728044',
            transition: 'all 0.2s ease'
          }}>📊</div>
          <span style={{ 
            fontSize: 10, 
            color: completedStages.length > 0 ? '#10b981' : '#6b7280', 
            textAlign: 'center', 
            maxWidth: 80,
            fontWeight: 600
          }}>Progress</span>
        </div>
      </aside>

      {/* Center Visualization */}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 0 }}>
        {/* Congratulations animation at Launch stage */}
        {currentStage === STAGES.length - 1 && (
          <div style={{
            marginBottom: 24,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            width: '100%',
            animation: 'congratsPop 1.2s cubic-bezier(.23,1,.32,1) 0s 1',
          }}>
            <span style={{
              fontSize: 36,
              fontWeight: 800,
              color: '#28a745',
              textAlign: 'center',
              marginBottom: 4,
              letterSpacing: 1,
              textShadow: '0 2px 12px #b6eabf',
            }}>
              🎉 Congratulations!
            </span>
            <span style={{
              fontSize: 18,
              color: '#181a1b',
              fontWeight: 500,
              textAlign: 'center',
              marginTop: 2,
              marginBottom: 2,
              maxWidth: 340,
            }}>
              You've completed the Automated Discovery journey. Your business idea is refined and ready for launch!
            </span>
          </div>
        )}
        {/* Back to Dashboard button aligned right above robot */}
        <div style={{ width: 420, display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
          <button
            style={{
              background: '#fff',
              color: '#181a1b',
              border: '1.5px solid #181a1b',
              borderRadius: 8,
              padding: '0.8rem 1.5rem',
              fontSize: '1rem',
              fontWeight: 600,
              cursor: 'pointer',
            }}
            onClick={() => navigate(-1)}
          >
            Back to Dashboard
          </button>
        </div>
        
        {/* Validation Score Display - Center Top */}
        {(currentStage === 0 || currentStage === 1 || currentStage === 2 || currentStage === 3 || currentStage === 4 || currentStage === 5) && (validationScore || isGeneratingValidationScore) && (
          <div style={{ 
            width: 420, 
            marginBottom: 16,
            background: validationScore?.shouldProceed ? '#f0f9ff' : '#fef2f2', 
            border: `2px solid ${validationScore?.shouldProceed ? '#0ea5e9' : '#ef4444'}`, 
            borderRadius: 12, 
            padding: 16,
            position: 'relative',
            boxShadow: '0 4px 12px rgba(0,0,0,0.08)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <h3 style={{ 
                margin: 0, 
                fontSize: 18, 
                fontWeight: 700, 
                color: validationScore?.shouldProceed ? '#0c4a6e' : '#991b1b' 
              }}>
                Expert Assessment: {(validationScore && hasCurrentStageCriteria(validationScore) && !isAutoImproving) ? `${validationScore.score}/10` : 'Updating...'}
              </h3>
              {validationScore && hasCurrentStageCriteria(validationScore) && !isAutoImproving && (
                <div style={{ 
                  padding: '6px 16px', 
                  borderRadius: 20, 
                  background: validationScore.shouldProceed ? '#0ea5e9' : '#ef4444',
                  color: 'white',
                  fontSize: 14,
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6
                }}>
                  {validationScore.shouldProceed ? '✅ PROCEED' : '▲ ITERATE'}
                </div>
              )}
              {shouldShowProgress && (
                <div style={{ 
                  padding: '6px 16px', 
                  borderRadius: 20, 
                  background: '#6b7280',
                  color: 'white',
                  fontSize: 14,
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8
                }}>
                  <div style={{
                    width: 14,
                    height: 14,
                    border: '2px solid #fff',
                    borderTop: '2px solid transparent',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite'
                  }} />
                  Updating...
                </div>
              )}
            </div>
            
            {validationScore && hasCurrentStageCriteria(validationScore) && !isAutoImproving && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                {Object.entries(getValidationCriteria(validationScore)).map(([key, value]) => (
                  <div key={key} style={{ 
                    background: '#fff', 
                    padding: '10px 12px', 
                    borderRadius: 8, 
                    border: '1px solid #e5e7eb',
                    fontSize: 13,
                    transition: 'all 0.2s ease'
                  }}>
                    <div style={{ fontWeight: 600, color: '#374151', textTransform: 'capitalize', marginBottom: 4 }}>
                      {key.replace(/([A-Z])/g, ' $1').trim()}
                    </div>
                    <div style={{ 
                      color: (value === 0 || value === undefined) ? '#000000' : value >= 7 ? '#059669' : value >= 4 ? '#d97706' : '#dc2626',
                      fontWeight: 700,
                      fontSize: 14
                    }}>
                      {(value === 0 || value === undefined) ? '/10' : `${value}/10`}
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            {shouldShowProgress && (
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: 8,
                color: '#6b7280',
                fontStyle: 'italic',
                fontSize: 13,
                justifyContent: 'center',
                padding: '8px 0'
              }}>
                <div style={{
                  width: 16,
                  height: 16,
                  border: '2px solid #e5e7eb',
                  borderTop: '2px solid #3b82f6',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite'
                }} />
                Calculating new validation score...
                <button
                  onClick={() => {
                    setIsGeneratingValidationScore(false);
                    setLoading(false);
                    setLogs((prev) => [...prev, 'Validation score calculation cancelled by user.']);
                  }}
                  style={{
                    marginLeft: '12px',
                    padding: '4px 8px',
                    background: '#ef4444',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    fontSize: '11px',
                    cursor: 'pointer',
                    fontWeight: 600
                  }}
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
        )}
        
        <div style={{ width: 420, minHeight: 340, background: '#fafbfc', borderRadius: 24, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 16px rgba(0,0,0,0.06)', flexDirection: 'column', border: '2px solid #181a1b', position: 'relative', overflow: 'hidden', padding: '20px' }}>
          {/* Animated glow/shadow under robot */}
          <div style={{
            position: 'absolute',
            bottom: 56,
            left: '50%',
            transform: 'translateX(-50%)',
            width: 140,
            height: 32,
            background: 'radial-gradient(ellipse at center, #181a1b33 0%, transparent 80%)',
            filter: 'blur(10px)',
            zIndex: 0,
            animation: 'glowPulse 2.2s infinite alternate',
            pointerEvents: 'none',
          }} />
          {/* Robot animation */}
          <div style={{
            position: 'relative',
            width: '100%',
            height: 200,
            marginBottom: 16,
            marginTop: 20,
            zIndex: 1,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center'
          }}>
            <Lottie
              animationData={robotLottie}
              loop={true}
              autoplay={true}
              style={{ 
                width: 200, 
                height: 200,
                position: 'absolute',
                left: '50%',
                top: '50%',
                transform: 'translate(-50%, -50%)'
              }}
              aria-label="AI robot animation"
            />
          </div>
          {/* Minimalist AI is Thinking animation (three animated dots) */}
          {loading && !validationScore && (
            <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', height: 24, marginBottom: 8, zIndex: 2 }}>
              <span style={{
                display: 'inline-block',
                width: 10,
                height: 10,
                borderRadius: '50%',
                background: '#181a1b',
                margin: '0 4px',
                opacity: 0.5,
                animation: 'dotPulse 1.2s infinite',
                animationDelay: '0s',
              }} />
              <span style={{
                display: 'inline-block',
                width: 10,
                height: 10,
                borderRadius: '50%',
                background: '#181a1b',
                margin: '0 4px',
                opacity: 0.5,
                animation: 'dotPulse 1.2s infinite',
                animationDelay: '0.2s',
              }} />
              <span style={{
                display: 'inline-block',
                width: 10,
                height: 10,
                borderRadius: '50%',
                background: '#181a1b',
                margin: '0 4px',
                opacity: 0.5,
                animation: 'dotPulse 1.2s infinite',
                animationDelay: '0.4s',
              }} />
            </div>
          )}
          {/* Error message UI */}
          {error && (
            <div style={{ 
              color: '#c00', 
              background: '#fff0f0', 
              border: '1px solid #c00', 
              borderRadius: 8, 
              padding: '1rem', 
              margin: '1rem 0', 
              fontWeight: 600, 
              fontSize: 16, 
              textAlign: 'center', 
              zIndex: 10,
              position: 'relative'
            }}>
              <button
                onClick={() => setError(null)}
                style={{
                  position: 'absolute',
                  top: '8px',
                  right: '8px',
                  background: 'none',
                  border: 'none',
                  fontSize: '18px',
                  cursor: 'pointer',
                  color: '#c00',
                  width: '24px',
                  height: '24px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: '50%',
                  transition: 'background 0.2s'
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(204, 0, 0, 0.1)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                title="Dismiss error"
              >
                ×
              </button>
              {error}
            </div>
          )}
          <span style={{ color: '#181a1b', fontWeight: 600, fontSize: 18 }}>
            {STAGES[currentStage]}
          </span>
          
          {/* Process Steps Progress Indicator */}
          {(processSteps.length > 0 || isAutoImproving) && (
            <div style={{
              width: '100%',
              maxWidth: 320,
              marginTop: 16,
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: 8,
              padding: '12px',
              fontSize: 13
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                marginBottom: 8,
                color: '#374151',
                fontWeight: 600
              }}>
                <div style={{
                  width: 12,
                  height: 12,
                  border: '2px solid #3b82f6',
                  borderTop: '2px solid transparent',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite'
                }} />
                {isAutoImproving ? 'Improving...' : 'Processing...'}
              </div>
              
              <div ref={progressContainerRef} style={{ maxHeight: 120, overflow: 'auto' }}>
                {processSteps.map((step, index) => {
                  const isCompleted = completedSteps.includes(step);
                  const isCurrent = currentProcessStep === step;
                  
                  return (
                    <div 
                      key={index} 
                      data-current-step={isCurrent}
                      style={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: 8,
                        marginBottom: 6,
                        opacity: isCompleted ? 0.7 : 1,
                        padding: isCurrent ? '4px 0' : '0',
                        borderRadius: isCurrent ? '4px' : '0',
                        background: isCurrent ? 'rgba(59, 130, 246, 0.1)' : 'transparent'
                      }}
                    >
                      <div style={{
                        width: 16,
                        height: 16,
                        borderRadius: '50%',
                        background: isCompleted ? '#10b981' : isCurrent ? '#3b82f6' : '#e5e7eb',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 10,
                        color: 'white',
                        fontWeight: 'bold',
                        flexShrink: 0,
                        marginTop: 1
                      }}>
                        {isCompleted ? '✓' : isCurrent ? '⟳' : index + 1}
                      </div>
                      <span style={{
                        color: isCompleted ? '#6b7280' : isCurrent ? '#1f2937' : '#9ca3af',
                        fontWeight: isCurrent ? 600 : 500,
                        fontSize: 12,
                        lineHeight: 1.4
                      }}>
                        {step}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
          
          {loading && !processSteps.length && !validationScore && !isAutoImproving && (
            <div style={{ width: 240, height: 6, background: '#e0e0e0', borderRadius: 3, overflow: 'hidden', marginTop: 18 }}>
              <div style={{
                width: '40%',
                height: '100%',
                background: '#181a1b',
                borderRadius: 3,
                animation: 'progressBarIndeterminate 1.2s infinite linear'
              }} />
              <style>{`
                @keyframes progressBarIndeterminate {
                  0% { margin-left: -40%; }
                  100% { margin-left: 100%; }
                }
              `}</style>
            </div>
          )}
        </div>
        

        
        {/* View Full Business Plan Modal Button */}
        {currentStage === 0 && businessIdea && (
          <div style={{ 
            width: 420, 
            marginTop: 16,
            marginBottom: 16
          }}>
            <button
              style={{
                width: '100%',
                background: '#f8fafc',
                color: '#374151',
                border: '1px solid #d1d5db',
                borderRadius: 8,
                padding: '12px 16px',
                fontSize: 14,
                fontWeight: 500,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                transition: 'all 0.2s ease',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
              }}
              onClick={() => setShowBusinessPlanModal(true)}
              onMouseEnter={e => {
                e.currentTarget.style.background = '#f1f5f9';
                e.currentTarget.style.borderColor = '#9ca3af';
                e.currentTarget.style.transform = 'translateY(-1px)';
                e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.15)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = '#f8fafc';
                e.currentTarget.style.borderColor = '#d1d5db';
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.1)';
              }}
            >
              <svg width="16" height="16" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" fill="currentColor"/>
                <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" fill="currentColor"/>
              </svg>
              View Full Business Plan
            </button>
          </div>
        )}
        
        {/* Continue button (hide at Launch stage) */}
        {currentStage < STAGES.length - 1 && (
          <div style={{ width: 420, marginTop: 32 }}>
            {validationScore && !validationScore.shouldProceed ? (
              <div style={{
                background: '#fef2f2',
                border: '1px solid #fecaca',
                borderRadius: 8,
                padding: '16px',
                marginBottom: 16,
                textAlign: 'center'
              }}>
                <div style={{
                  color: '#dc2626',
                  fontWeight: 600,
                  fontSize: 14,
                  marginBottom: 8
                }}>
                  ⚠️ Improvement Needed
                </div>
                <div style={{
                  color: '#6b7280',
                  fontSize: 13,
                  lineHeight: 1.4,
                  marginBottom: 12
                }}>
                  Your problem statement needs refinement before proceeding. 
                  Focus on the recommendations above to improve your score.
                </div>
                
                {/* Auto-Improve Button */}
                <button
                  onClick={handleAutoImprove}
                  disabled={isAutoImproving}
                  style={{
                    background: isAutoImproving ? '#6b7280' : '#10b981',
                    color: '#fff',
                    border: 'none',
                    borderRadius: 8,
                    padding: '10px 20px',
                    fontSize: 14,
                    fontWeight: 600,
                    cursor: isAutoImproving ? 'not-allowed' : 'pointer',
                    opacity: isAutoImproving ? 0.6 : 1,
                    transition: 'all 0.2s ease',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8,
                    margin: '0 auto'
                  }}
                >
                  {isAutoImproving ? (
                    <>
                      <div style={{
                        width: 16,
                        height: 16,
                        border: '2px solid #fff',
                        borderTop: '2px solid transparent',
                        borderRadius: '50%',
                        animation: 'spin 1s linear infinite'
                      }} />
                      AI Improving...
                    </>
                  ) : (
                    <>
                      <svg width="16" height="16" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      Auto-Improve with AI
                    </>
                  )}
                </button>
              </div>
            ) : null}
            
            <button
              style={{ 
                width: '100%',
                background: validationScore && !validationScore.shouldProceed ? '#6b7280' : '#181a1b', 
                color: '#fff', 
                border: 'none', 
                borderRadius: 8, 
                padding: '0.8rem 1.5rem', 
                fontSize: '1rem', 
                fontWeight: 600, 
                cursor: validationScore && !validationScore.shouldProceed ? 'not-allowed' : 'pointer',
                opacity: validationScore && !validationScore.shouldProceed ? 0.6 : 1,
                transition: 'all 0.2s ease'
              }}
              onClick={() => {
                if (validationScore && !validationScore.shouldProceed) {
                  return; // Prevent progression
                }
                updateCurrentStage(Math.min(currentStage + 1, STAGES.length - 1));
              }}
              disabled={validationScore ? !validationScore.shouldProceed : false}
            >
              {validationScore && !validationScore.shouldProceed 
                ? currentStage === 0 
                  ? 'Please improve your problem statement first' 
                  : currentStage === 1
                    ? 'Please improve your customer profile first'
                    : currentStage === 2
                      ? 'Please improve your customer struggles first'
                      : currentStage === 3
                        ? 'Please improve your solution fit first'
                        : 'Please improve your business model first'
                : 'Continue to Next Stage'
              }
            </button>
          </div>
        )}
        {/* Always show the View Full Business Plan button below main content */}
        <div style={{ width: 420, marginTop: 16, marginBottom: 16 }}>
          <button
            style={{
              width: '100%',
              background: '#f8fafc',
              color: '#374151',
              border: '1px solid #d1d5db',
              borderRadius: 8,
              padding: '12px 16px',
              fontSize: 14,
              fontWeight: 500,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginTop: 12
            }}
            onClick={handleViewFullPlan}
          >
            View Full Business Plan
          </button>
        </div>
      </main>

      {/* Right AI Feedback/Personas */}
      <aside style={{ width: 340, minWidth: 0, background: '#fff', borderLeft: '1px solid #eee', padding: '2rem 1.5rem', display: 'flex', flexDirection: 'column', gap: 24, overflow: 'auto' }}>
        {currentStage === STAGES.length - 1 ? (
          <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 24, alignItems: 'center', marginTop: 32 }}>
            <button
              style={{
                width: 220,
                padding: '1rem 0',
                borderRadius: 10,
                border: '2px solid #007AFF',
                background: 'linear-gradient(90deg, #e5eefa 0%, #f0f2f8 100%)',
                color: '#007AFF',
                fontWeight: 700,
                fontSize: 18,
                cursor: 'pointer',
                marginBottom: 8,
                boxShadow: '0 2px 12px rgba(0,122,255,0.08)',
                letterSpacing: 0.5,
                transition: 'background 0.2s, color 0.2s',
              }}
              onClick={() => alert('Download Certificate of Completion (stub)')}
            >
              🏆 Download Certificate
            </button>
            <button style={{ width: 200, padding: '0.9rem 0', borderRadius: 8, border: '1.5px solid #181a1b', background: '#fff', color: '#181a1b', fontWeight: 600, fontSize: 17, cursor: 'pointer' }} onClick={() => handleGenerate('summary')}>
              Business Summary
            </button>
            <button style={{ width: 200, padding: '0.9rem 0', borderRadius: 8, border: '1.5px solid #181a1b', background: '#fff', color: '#181a1b', fontWeight: 600, fontSize: 17, cursor: 'pointer' }} onClick={openPitchDeckEditor}>
              Pitch Deck
            </button>
            <button style={{ width: 200, padding: '0.9rem 0', borderRadius: 8, border: '1.5px solid #181a1b', background: '#fff', color: '#181a1b', fontWeight: 600, fontSize: 17, cursor: 'pointer' }} onClick={() => handleGenerate('plan')}>
              Business Plan
            </button>
            <button style={{ width: 200, padding: '0.9rem 0', borderRadius: 8, border: '1.5px solid #181a1b', background: '#fff', color: '#181a1b', fontWeight: 600, fontSize: 17, cursor: 'pointer' }} onClick={() => handleGenerate('financial')}>
              Financial Plan
            </button>
            <button style={{ width: 200, padding: '0.9rem 0', borderRadius: 8, border: '1.5px solid #181a1b', background: '#fff', color: '#181a1b', fontWeight: 600, fontSize: 17, cursor: 'pointer' }} onClick={() => handleGenerate('businessModel')}>
              Business Model
            </button>
          </div>
        ) : (
          <>
            {/* Collapsible Summary section */}
            <div
              style={{
                fontWeight: 600,
                fontSize: 15,
                marginBottom: 4,
                color: showSummary ? '#222' : '#444', // improved contrast
                background: showSummary ? '#f0f0f0' : '#f0f2f8',
                padding: '4px 12px',
                borderRadius: 8,
                marginRight: 0,
                marginLeft: 0,
                display: 'flex',
                alignItems: 'center',
                cursor: 'pointer',
                userSelect: 'none',
                transition: 'background 0.25s cubic-bezier(.4,0,.2,1)',
              }}
              onClick={() => setShowSummary(s => !s)}
              tabIndex={0}
              role="button"
              aria-expanded={showSummary}
              onMouseEnter={e => (e.currentTarget.style.background = '#f0f0f0')}
              onMouseLeave={e => (e.currentTarget.style.background = showSummary ? '#f0f0f0' : '#f0f2f8')}
            >
              <span style={{ marginRight: 8, display: 'inline-block', transition: 'transform 0.25s cubic-bezier(.4,0,.2,1)', transform: showSummary ? 'rotate(90deg)' : 'rotate(0deg)' }}>
                <svg width="16" height="16" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M6 8L10 12L14 8" stroke="#888" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </span>
              Summary
            </div>
            {showSummary && (
              <div className="fade-slide-in" style={{ color: '#444', fontSize: 15, marginBottom: 8 }}>{collectiveSummary}</div>
            )}
            
            {/* Problem Discovery Criteria Explanation */}
            {currentStage === 0 && (
              <div style={{ 
                background: '#f8fafc', 
                border: '1px solid #e2e8f0', 
                borderRadius: 12, 
                padding: 16, 
                marginBottom: 12,
                fontSize: 13
              }}>
                <div style={{ fontWeight: 600, marginBottom: 8, color: '#1e293b' }}>
                  🔍 Problem Discovery Assessment
                </div>
                <div style={{ color: '#475569', lineHeight: 1.5 }}>
                  <strong>Problem Identification (7-10):</strong> Clearly identifies specific problems with evidence<br/>
                  <strong>Problem Validation (7-10):</strong> Validates that problems actually exist in the real world<br/>
                  <strong>Problem Scope (6-10):</strong> Understands the full scope of related problems<br/>
                  <strong>Problem Urgency (6-10):</strong> Problems are urgent enough that customers need solutions now<br/>
                  <strong>Problem Impact (7-10):</strong> Problems are impactful enough that customers will pay to solve them
                </div>
              </div>
            )}
            
            {/* Customer Profile Criteria Explanation */}
            {currentStage === 1 && (
              <div style={{ 
                background: '#f8fafc', 
                border: '1px solid #e2e8f0', 
                borderRadius: 12, 
                padding: 16, 
                marginBottom: 12,
                fontSize: 13
              }}>
                <div style={{ fontWeight: 600, marginBottom: 8, color: '#1e293b' }}>
                  👥 Customer Profile Assessment
                </div>
                <div style={{ color: '#475569', lineHeight: 1.5 }}>
                  <strong>Customer Clarity (7-10):</strong> Clearly defines who the target customer is<br/>
                  <strong>Customer Specificity (7-10):</strong> Provides detailed, actionable customer characteristics<br/>
                  <strong>Customer Relevance (7-10):</strong> Customer is relevant to the business idea<br/>
                  <strong>Customer Accessibility (6-10):</strong> Customer segment is reachable and accessible<br/>
                  <strong>Customer Value (7-10):</strong> Customer segment has sufficient value for the business
                </div>
              </div>
            )}
            
            {/* Customer Struggle Criteria Explanation */}
            {currentStage === 2 && (
              <div style={{ 
                background: '#f8fafc', 
                border: '1px solid #e2e8f0', 
                borderRadius: 12, 
                padding: 16, 
                marginBottom: 12,
                fontSize: 13
              }}>
                <div style={{ fontWeight: 600, marginBottom: 8, color: '#1e293b' }}>
                  💪 Customer Struggle Assessment
                </div>
                <div style={{ color: '#475569', lineHeight: 1.5 }}>
                  <strong>Struggle Identification (7-10):</strong> Clearly identifies specific customer struggles<br/>
                  <strong>Struggle Validation (7-10):</strong> Validates that struggles actually exist<br/>
                  <strong>Struggle Urgency (6-10):</strong> Struggles are urgent enough to need solutions<br/>
                  <strong>Struggle Frequency (6-10):</strong> Struggles occur frequently enough to matter<br/>
                  <strong>Struggle Impact (7-10):</strong> Struggles have significant impact on customers
                </div>
              </div>
            )}
            
            {/* Solution Fit Criteria Explanation */}
            {currentStage === 3 && (
              <div style={{ 
                background: '#f8fafc', 
                border: '1px solid #e2e8f0', 
                borderRadius: 12, 
                padding: 16, 
                marginBottom: 12,
                fontSize: 13
              }}>
                <div style={{ fontWeight: 600, marginBottom: 8, color: '#1e293b' }}>
                  🎯 Solution Fit Assessment
                </div>
                <div style={{ color: '#475569', lineHeight: 1.5 }}>
                  <strong>Solution Alignment (7-10):</strong> Solution aligns well with customer struggles<br/>
                  <strong>Solution Effectiveness (7-10):</strong> Solution effectively solves identified problems<br/>
                  <strong>Solution Differentiation (6-10):</strong> Solution is unique and differentiated<br/>
                  <strong>Solution Value (7-10):</strong> Solution provides significant value to customers<br/>
                  <strong>Solution Feasibility (6-10):</strong> Solution is practical and feasible to implement
                </div>
              </div>
            )}
            
            {/* Business Model Criteria Explanation */}
            {currentStage === 4 && (
              <div style={{ 
                background: '#f8fafc', 
                border: '1px solid #e2e8f0', 
                borderRadius: 12, 
                padding: 16, 
                marginBottom: 12,
                fontSize: 13
              }}>
                <div style={{ fontWeight: 600, marginBottom: 8, color: '#1e293b' }}>
                  🏗️ Business Model Assessment
                </div>
                <div style={{ color: '#475569', lineHeight: 1.5 }}>
                  <strong>Model Viability (7-10):</strong> Business model is fundamentally sound and sustainable<br/>
                  <strong>Revenue Potential (7-10):</strong> Business model can generate significant revenue<br/>
                  <strong>Cost Efficiency (6-10):</strong> Costs are manageable and scalable<br/>
                  <strong>Competitive Advantage (6-10):</strong> Model is defensible and differentiated<br/>
                  <strong>Scalability (7-10):</strong> Business model can scale effectively
                </div>
              </div>
            )}
            
            {/* Market Validation Criteria Explanation */}
            {currentStage === 5 && (
              <div style={{ 
                background: '#f8fafc', 
                border: '1px solid #e2e8f0', 
                borderRadius: 12, 
                padding: 16, 
                marginBottom: 12,
                fontSize: 13
              }}>
                <div style={{ fontWeight: 600, marginBottom: 8, color: '#1e293b' }}>
                  📊 Market Validation Assessment
                </div>
                <div style={{ color: '#475569', lineHeight: 1.5 }}>
                  <strong>Market Size (7-10):</strong> Target market is large and accessible<br/>
                  <strong>Market Demand (7-10):</strong> Genuine demand exists for this solution<br/>
                  <strong>Market Timing (6-10):</strong> Market is ready for this solution now<br/>
                  <strong>Competitive Landscape (6-10):</strong> Competitive environment is favorable<br/>
                  <strong>Market Access (6-10):</strong> Can easily reach and serve this market
                </div>
              </div>
            )}
            
            {/* Expert Entrepreneur Assessment Display */}
            {(currentStage === 0 || currentStage === 1 || currentStage === 2 || currentStage === 3 || currentStage === 4 || currentStage === 5) && (validationScore || isGeneratingValidationScore) && (
              <div style={{ 
                background: validationScore?.shouldProceed ? '#f0f9ff' : '#fef2f2', 
                border: `2px solid ${validationScore?.shouldProceed ? '#0ea5e9' : '#ef4444'}`, 
                borderRadius: 12, 
                padding: 16, 
                marginTop: 12,
                marginBottom: 12
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                  <h3 style={{ 
                    margin: 0, 
                    fontSize: 16, 
                    fontWeight: 600, 
                    color: validationScore?.shouldProceed ? '#0c4a6e' : '#991b1b' 
                  }}>
                    Expert Assessment: {(validationScore && hasCurrentStageCriteria(validationScore) && !isAutoImproving) ? `${validationScore.score}/10` : 'Updating...'}
                  </h3>
                  {validationScore && hasCurrentStageCriteria(validationScore) && !isAutoImproving && (
                    <div style={{ 
                      padding: '4px 12px', 
                      borderRadius: 20, 
                      background: validationScore.shouldProceed ? '#0ea5e9' : '#ef4444',
                      color: 'white',
                      fontSize: 12,
                      fontWeight: 600
                    }}>
                      {validationScore.shouldProceed ? '✅ PROCEED' : '⚠️ ITERATE'}
                    </div>
                  )}
                  {isGeneratingValidationScore && !validationScore && (
                    <div style={{ 
                      padding: '4px 12px', 
                      borderRadius: 20, 
                      background: '#6b7280',
                      color: 'white',
                      fontSize: 12,
                      fontWeight: 600,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6
                    }}>
                      <div style={{
                        width: 12,
                        height: 12,
                        border: '2px solid #fff',
                        borderTop: '2px solid transparent',
                        borderRadius: '50%',
                        animation: 'spin 1s linear infinite'
                      }} />
                      Updating...
                    </div>
                  )}
                </div>
                
                {validationScore && hasCurrentStageCriteria(validationScore) && !isAutoImproving && (
                  <>
                    <div style={{ marginBottom: 12 }}>
                      <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 8, color: '#374151' }}>Expert Evaluation Criteria:</div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                        {Object.entries(getValidationCriteria(validationScore)).map(([key, value]) => (
                          <div key={key} style={{ 
                            background: '#fff', 
                            padding: '8px 12px', 
                            borderRadius: 8, 
                            border: '1px solid #e5e7eb',
                            fontSize: 13
                          }}>
                            <div style={{ fontWeight: 600, color: '#374151', textTransform: 'capitalize' }}>
                              {key.replace(/([A-Z])/g, ' $1').trim()}
                            </div>
                            <div style={{ 
                              color: (value === 0 || value === undefined) ? '#000000' : value >= 7 ? '#059669' : value >= 4 ? '#d97706' : '#dc2626',
                              fontWeight: 600
                            }}>
                              {(value === 0 || value === undefined) ? '/10' : `${value}/10`}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div style={{ marginBottom: 12 }}>
                      <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 8, color: '#374151' }}>Recommendations:</div>
                      <ul style={{ margin: 0, paddingLeft: 16, fontSize: 13, color: '#4b5563' }}>
                        {validationScore.recommendations.map((rec, idx) => (
                          <li key={idx} style={{ marginBottom: 4 }}>{rec}</li>
                        ))}
                      </ul>
                    </div>
                    
                    <div style={{ 
                      fontSize: 13, 
                      color: '#6b7280',
                      fontStyle: 'italic',
                      marginBottom: 8
                    }}>
                      Confidence: {validationScore.confidence.charAt(0).toUpperCase() + validationScore.confidence.slice(1)}
                    </div>
                    <div style={{ 
                      fontSize: 12, 
                      color: '#9ca3af',
                      fontStyle: 'italic'
                    }}>
                      Assessment by Sarah Chen, experienced entrepreneur & business coach
                    </div>
                  </>
                )}
                
                {isGeneratingValidationScore && !validationScore && (
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: 8,
                    color: '#6b7280',
                    fontStyle: 'italic',
                    fontSize: 13
                  }}>
                    <div style={{
                      width: 16,
                      height: 16,
                      border: '2px solid #e5e7eb',
                      borderTop: '2px solid #3b82f6',
                      borderRadius: '50%',
                      animation: 'spin 1s linear infinite'
                    }} />
                    Calculating new validation score...
                  </div>
                )}
              </div>
            )}
            {/* Divider between summary and feedback sections */}
            <div style={{
              width: '100%',
              height: 0,
              border: 'none',
              borderTop: '1.5px solid #e5e7eb',
              boxShadow: '0 2px 8px 0 rgba(90,110,230,0.04)',
              margin: '18px 0 -50px 0',
            }} />
            {/* Customer Feedback label above persona chat section */}
            <div
              style={{
                fontWeight: 600,
                fontSize: 15,
                margin: '16px 0 8px 0',
                color: showFeedback ? '#222' : '#444', // improved contrast
                background: showFeedback ? '#f0f0f0' : '#f0f2f8',
                padding: '4px 12px',
                borderRadius: 8,
                display: 'flex',
                alignItems: 'center',
                cursor: 'pointer',
                userSelect: 'none',
                transition: 'background 0.25s cubic-bezier(.4,0,.2,1)',
              }}
              onClick={() => setShowFeedback(f => !f)}
              tabIndex={0}
              role="button"
              aria-expanded={showFeedback}
              onMouseEnter={e => (e.currentTarget.style.background = '#f0f0f0')}
              onMouseLeave={e => (e.currentTarget.style.background = showFeedback ? '#f0f0f0' : '#f0f2f8')}
            >
              <span style={{ marginRight: 8, display: 'inline-block', transition: 'transform 0.25s cubic-bezier(.4,0,.2,1)', transform: showFeedback ? 'rotate(90deg)' : 'rotate(0deg)' }}>
                <svg width="16" height="16" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M6 8L10 12L14 8" stroke="#888" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </span>
              Customer Feedback
            </div>
            {showFeedback && (
              <div className="fade-slide-in">
                {personas.map((persona, personaIdx) => {
                  // Strong defensive: ensure feedback is always an array of strings
                  console.log('Persona feedback:', persona.feedback);
                  let feedbackArr: string[] = [];
                  if (Array.isArray(persona.feedback)) {
                    feedbackArr = persona.feedback.flatMap((item: any) =>
                      typeof item === 'string'
                        ? [item]
                        : Array.isArray(item?.feedback)
                          ? item.feedback.filter((f: any) => typeof f === 'string')
                          : []
                    );
                  } else if (
                    persona.feedback &&
                    typeof persona.feedback === 'object' &&
                    Array.isArray((persona.feedback as any).feedback)
                  ) {
                    feedbackArr = (persona.feedback as any).feedback.filter((f: any) => typeof f === 'string');
                  }
                  const feedbackCount = visibleFeedbackCounts[personaIdx] || 0;
                  const isThinking = feedbackCount < (feedbackArr.length || 0);
                  const isExpanded = expandedPersonas[persona.id] !== false; // default to expanded
                  return (
                    <div
                      key={persona.id}
                      style={{
                        marginBottom: 18,
                        borderBottom: '1px solid #f0f0f0',
                        paddingBottom: 12,
                        cursor: 'pointer',
                        transition: 'box-shadow 0.2s, transform 0.2s',
                        boxShadow: isExpanded ? '0 4px 16px rgba(90,110,230,0.08)' : 'none',
                        transform: isExpanded ? 'scale(1.02)' : 'scale(1)',
                        background: isExpanded ? '#f7f7fa' : '#fff',
                        borderRadius: 12,
                      }}
                      onClick={() => togglePersonaExpand(persona.id)}
                      onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') togglePersonaExpand(persona.id); }}
                      tabIndex={0}
                      aria-expanded={isExpanded}
                      role="button"
                    >
                      <div style={{ display: 'flex', alignItems: 'center', marginBottom: 8 }}>
                        <div style={{
                          marginRight: 10,
                          animation: isThinking ? 'pulseAvatar 1s infinite' : undefined,
                        }}>
                          <RobotFace size={32} />
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
                            <span style={{ fontWeight: 600, color: '#181a1b', fontSize: 14 }}>{persona.name}</span>
                            {persona.role && (
                              <span style={{ 
                                background: '#f3f4f6', 
                                color: '#374151', 
                                fontSize: 11, 
                                padding: '2px 6px', 
                                borderRadius: 4,
                                fontWeight: 500
                              }}>
                                {persona.role}
                              </span>
                            )}
                            {persona.companySize && (
                              <span style={{ 
                                background: '#e0f2fe', 
                                color: '#0c4a6e', 
                                fontSize: 11, 
                                padding: '2px 6px', 
                                borderRadius: 4,
                                fontWeight: 500
                              }}>
                                {persona.companySize}
                              </span>
                            )}
                          </div>
                          <div style={{ color: '#6b7280', fontSize: 12, lineHeight: 1.3 }}>
                            {persona.summary}
                          </div>
                          {persona.budget && (
                            <div style={{ 
                              color: '#059669', 
                              fontSize: 11, 
                              fontWeight: 500, 
                              marginTop: 2 
                            }}>
                              Budget: {persona.budget}
                            </div>
                          )}
                        </div>
                      </div>
                      {/* Expand/collapse feedback section */}
                      {isExpanded && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, width: '100%', maxWidth: '100%', minWidth: 0 }}>
                          {/* Persona Details Section */}
                          <div style={{ 
                            background: '#f8fafc', 
                            border: '1px solid #e2e8f0', 
                            borderRadius: 8, 
                            padding: 12, 
                            marginBottom: 8,
                            fontSize: 12
                          }}>
                            <div style={{ fontWeight: 600, marginBottom: 8, color: '#1e293b', fontSize: 13 }}>
                              📋 {persona.name}'s Profile
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 8 }}>
                              {persona.age && (
                                <div>
                                  <span style={{ fontWeight: 500, color: '#475569' }}>Age:</span> {persona.age}
                                </div>
                              )}
                              {persona.experience && (
                                <div>
                                  <span style={{ fontWeight: 500, color: '#475569' }}>Experience:</span> {persona.experience}
                                </div>
                              )}
                              {persona.techSavviness && (
                                <div>
                                  <span style={{ fontWeight: 500, color: '#475569' }}>Tech Level:</span> {persona.techSavviness}
                                </div>
                              )}
                              {persona.communicationStyle && (
                                <div>
                                  <span style={{ fontWeight: 500, color: '#475569' }}>Style:</span> {persona.communicationStyle}
                                </div>
                              )}
                            </div>
                            {persona.painPoints && persona.painPoints.length > 0 && (
                              <div style={{ marginBottom: 6 }}>
                                <span style={{ fontWeight: 500, color: '#dc2626' }}>Pain Points:</span>
                                <ul style={{ margin: '4px 0 0 16px', padding: 0, fontSize: 11, color: '#6b7280' }}>
                                  {persona.painPoints.slice(0, 2).map((point, idx) => (
                                    <li key={idx}>{point}</li>
                                  ))}
                                </ul>
                              </div>
                            )}
                            {persona.goals && persona.goals.length > 0 && (
                              <div style={{ marginBottom: 6 }}>
                                <span style={{ fontWeight: 500, color: '#059669' }}>Goals:</span>
                                <ul style={{ margin: '4px 0 0 16px', padding: 0, fontSize: 11, color: '#6b7280' }}>
                                  {persona.goals.slice(0, 2).map((goal, idx) => (
                                    <li key={idx}>{goal}</li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>
                          
                          {/* Feedback Section */}
                          <div style={{ maxHeight: 180, overflowY: 'auto' }}>
                          {feedbackArr.slice(0, feedbackCount).map((fb: string, i: number) => (
                            <div
                              key={i}
                              style={{
                                position: 'relative',
                                background: 'linear-gradient(135deg, #f0f0f0 0%, #e8e8e8 100%)', // lighter grey gradient
                                borderRadius: 16,
                                padding: '10px 16px',
                                color: '#181a1b', // improved contrast
                                fontSize: 15,
                                boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
                                width: '100%',
                                maxWidth: '100%',
                                minWidth: 0,
                                wordBreak: 'break-word',
                                overflowWrap: 'break-word',
                                boxSizing: 'border-box',
                                opacity: 0,
                                animation: `bubbleIn 0.5s cubic-bezier(.68,-0.55,.27,1.55) forwards`,
                              }}
                            >
                              {fb}
                              {/* Bubble tail */}
                              <span style={{
                                position: 'absolute',
                                left: 18,
                                bottom: -8,
                                width: 0,
                                height: 0,
                                borderLeft: '8px solid transparent',
                                borderRight: '8px solid transparent',
                                borderTop: '8px solid #f0f0f0',
                                filter: 'blur(0.5px)',
                                zIndex: 1,
                              }} />
                            </div>
                          ))}
                          {/* Typing indicator if more feedback is coming */}
                          {isThinking && (
                            <div style={{
                              background: '#f7f7fa',
                              borderRadius: 16,
                              padding: '10px 16px',
                              color: '#888',
                              fontSize: 15,
                              width: 'fit-content',
                              marginTop: 2,
                              marginBottom: 2,
                              display: 'flex',
                              alignItems: 'center',
                              gap: 2,
                            }}>
                              <span style={{ letterSpacing: 2 }}>Typing</span>
                              <span style={{ display: 'inline-block', width: 18 }}>
                                <span className="dot" style={{
                                  display: 'inline-block',
                                  width: 4,
                                  height: 4,
                                  borderRadius: '50%',
                                  background: '#888',
                                  marginRight: 2,
                                  animation: 'typingDot 1s infinite',
                                  animationDelay: '0s',
                                }} />
                                <span className="dot" style={{
                                  display: 'inline-block',
                                  width: 4,
                                  height: 4,
                                  borderRadius: '50%',
                                  background: '#888',
                                  marginRight: 2,
                                  animation: 'typingDot 1s infinite',
                                  animationDelay: '0.2s',
                                }} />
                                <span className="dot" style={{
                                  display: 'inline-block',
                                  width: 4,
                                  height: 4,
                                  borderRadius: '50%',
                                  background: '#888',
                                  animation: 'typingDot 1s infinite',
                                  animationDelay: '0.4s',
                                }} />
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}
        <style>{`
          @keyframes bubbleIn {
            0% { opacity: 0; transform: scale(0.85) translateY(16px); }
            60% { opacity: 1; transform: scale(1.05) translateY(-2px); }
            100% { opacity: 1; transform: scale(1) translateY(0); }
          }
          @keyframes pulseAvatar {
            0% { box-shadow: 0 0 0 0 rgba(90,110,230,0.3); }
            70% { box-shadow: 0 0 0 8px rgba(90,110,230,0); }
            100% { box-shadow: 0 0 0 0 rgba(90,110,230,0); }
          }
          @keyframes typingDot {
            0%, 80%, 100% { opacity: 0.2; }
            40% { opacity: 1; }
          }
          @keyframes dotPulse {
            0%, 100% { opacity: 0.5; transform: scale(1); }
            30% { opacity: 1; transform: scale(1.18); }
            60% { opacity: 0.5; transform: scale(1); }
          }
          @keyframes congratsPop {
            0% { opacity: 0; transform: scale(0.7); }
            40% { opacity: 1; transform: scale(1.12); }
            70% { opacity: 1; transform: scale(0.98); }
            100% { opacity: 1; transform: scale(1); }
          }
          .fade-slide-in {
            animation: fadeSlideIn 0.45s cubic-bezier(.4,0,.2,1);
          }
          @keyframes fadeSlideIn {
            0% { opacity: 0; transform: translateY(16px); }
            100% { opacity: 1; transform: translateY(0); }
          }
          @keyframes glowPulse {
            0% { opacity: 0.7; transform: translateX(-50%) scaleX(1) scaleY(1); }
            100% { opacity: 1; transform: translateX(-50%) scaleX(1.12) scaleY(1.18); }
          }
          /* Accessibility: Focus styles for all interactive elements */
          [tabindex]:focus, [role="button"]:focus, button:focus {
            outline: 3px solid #181a1b !important;
            outline-offset: 2px !important;
            box-shadow: 0 0 0 3px #f0f0f0 !important;
            z-index: 2;
          }
        `}</style>
      </aside>
      {/* Business Idea Modal */}
      {showBusinessPlanModal && (
        <div 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '20px'
          }}
          onClick={(e) => {
            // Close modal when clicking on the overlay (not the modal content)
            if (e.target === e.currentTarget) {
              setShowBusinessPlanModal(false);
            }
          }}
        >
          <div style={{
            background: '#fff',
            borderRadius: 12,
            padding: '24px',
            maxWidth: '600px',
            width: '100%',
            maxHeight: '80vh',
            overflow: 'auto',
            boxShadow: '0 20px 40px rgba(0,0,0,0.15)'
          }}>
            <button
              onClick={() => setShowBusinessPlanModal(false)}
              style={{
                position: 'absolute',
                top: '16px',
                right: '16px',
                background: 'none',
                border: 'none',
                fontSize: '24px',
                cursor: 'pointer',
                color: '#6b7280',
                width: '32px',
                height: '32px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '50%',
                transition: 'background 0.2s'
              }}
              onMouseEnter={e => e.currentTarget.style.background = '#f3f4f6'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              ×
            </button>
            
            <h2 style={{
              margin: '0 0 16px 0',
              fontSize: '20px',
              fontWeight: 700,
              color: '#1f2937'
            }}>
              Your Business Plan
            </h2>
            
            <div style={{ maxHeight: '60vh', overflow: 'auto' }}>
              {/* Problem Statement */}
              {planData?.idea?.existingIdeaText && (
                <div style={{
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: 12,
                  padding: '20px',
                  marginBottom: '16px'
                }}>
                  <h3 style={{
                    margin: '0 0 12px 0',
                    fontSize: 16,
                    fontWeight: 600,
                    color: '#1e293b',
                    textTransform: 'capitalize'
                  }}>
                    📄 Problem Statement
                  </h3>
                  <div style={{
                    fontSize: 15,
                    lineHeight: 1.6,
                    color: '#374151',
                    whiteSpace: 'pre-wrap'
                  }}>
                    {planData.idea.existingIdeaText}
                  </div>
                </div>
              )}

              {/* Solution */}
              {planData?.solution?.description && (
                <div style={{
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: 12,
                  padding: '20px',
                  marginBottom: '16px'
                }}>
                  <h3 style={{
                    margin: '0 0 12px 0',
                    fontSize: 16,
                    fontWeight: 600,
                    color: '#1e293b',
                    textTransform: 'capitalize'
                  }}>
                    🎯 Solution
                  </h3>
                  <div style={{
                    fontSize: 15,
                    lineHeight: 1.6,
                    color: '#374151',
                    whiteSpace: 'pre-wrap'
                  }}>
                    {planData.solution.description}
                  </div>
                </div>
              )}

              {/* Customer Pain Points */}
              {planData?.customer?.painPoints && (
                <div style={{
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: 12,
                  padding: '20px',
                  marginBottom: '16px'
                }}>
                  <h3 style={{
                    margin: '0 0 12px 0',
                    fontSize: 16,
                    fontWeight: 600,
                    color: '#1e293b',
                    textTransform: 'capitalize'
                  }}>
                    👥 Customer Pain Points
                  </h3>
                  <div style={{
                    fontSize: 15,
                    lineHeight: 1.6,
                    color: '#374151',
                    whiteSpace: 'pre-wrap'
                  }}>
                    {planData.customer.painPoints}
                  </div>
                </div>
              )}

              {/* Other sections from planData.sections */}
              {planData?.sections && Object.keys(planData.sections).length > 0 && 
                Object.entries(planData.sections).map(([sectionName, content]) => (
                  <div key={sectionName} style={{
                    background: '#f8fafc',
                    border: '1px solid #e2e8f0',
                    borderRadius: 12,
                    padding: '20px',
                    marginBottom: '16px'
                  }}>
                    <h3 style={{
                      margin: '0 0 12px 0',
                      fontSize: 16,
                      fontWeight: 600,
                      color: '#1e293b',
                      textTransform: 'capitalize'
                    }}>
                      📄 {sectionName}
                    </h3>
                    <div style={{
                      fontSize: 15,
                      lineHeight: 1.6,
                      color: '#374151'
                    }}>
                      {(() => {
                        const contentStr = content as string;
                        // Check if content contains list-like patterns
                        const lines = contentStr.split('\n');
                        const hasListItems = lines.some(line => 
                          line.trim().startsWith('-') || 
                          line.trim().startsWith('•') || 
                          line.trim().startsWith('*') ||
                          line.trim().match(/^\d+\./) ||
                          line.trim().match(/^[a-z]\./)
                        );
                        
                        if (hasListItems) {
                          return (
                            <div>
                              {lines.map((line, index) => {
                                const trimmedLine = line.trim();
                                const isListItem = trimmedLine.startsWith('-') || 
                                                  trimmedLine.startsWith('•') || 
                                                  trimmedLine.startsWith('*') ||
                                                  trimmedLine.match(/^\d+\./) ||
                                                  trimmedLine.match(/^[a-z]\./);
                                
                                if (isListItem) {
                                  // Extract the content after the list marker
                                  const listContent = trimmedLine.replace(/^[-•*]\s*/, '').replace(/^\d+\.\s*/, '').replace(/^[a-z]\.\s*/, '');
                                  return (
                                    <div key={index} style={{
                                      display: 'flex',
                                      alignItems: 'flex-start',
                                      marginBottom: '8px',
                                      paddingLeft: '0'
                                    }}>
                                      <span style={{
                                        marginRight: '8px',
                                        color: '#6b7280',
                                        fontSize: '14px',
                                        lineHeight: '1.4'
                                      }}>
                                        •
                                      </span>
                                      <span style={{
                                        flex: 1,
                                        lineHeight: '1.4'
                                      }}>
                                        {listContent}
                                      </span>
                                    </div>
                                  );
                                } else if (trimmedLine === '') {
                                  return <div key={index} style={{ height: '8px' }} />;
                                } else {
                                  return (
                                    <div key={index} style={{
                                      marginBottom: '12px',
                                      lineHeight: '1.4'
                                    }}>
                                      {line}
                                    </div>
                                  );
                                }
                              })}
                            </div>
                          );
                        } else {
                          // Regular paragraph content
                          return contentStr;
                        }
                      })()}
                    </div>
                  </div>
                ))
              }

              {/* Fallback if no sections found */}
              {(!planData?.sections || Object.keys(planData.sections).length === 0) && 
               !planData?.idea?.existingIdeaText && 
               !planData?.solution?.description && 
               !planData?.customer?.painPoints && (
                <div style={{
                  background: '#f9fafb',
                  border: '1px solid #e5e7eb',
                  borderRadius: 8,
                  padding: '16px',
                  fontSize: '14px',
                  lineHeight: 1.6,
                  color: '#374151',
                  whiteSpace: 'pre-wrap'
                }}>
                  {businessIdea || 'No business plan content available yet.'}
                </div>
              )}
            </div>
            
            <div style={{
              marginTop: '16px',
              padding: '12px',
              background: '#f0f9ff',
              border: '1px solid #bae6fd',
              borderRadius: 8,
              fontSize: '13px',
              color: '#0c4a6e'
            }}>
              💡 <strong>Tip:</strong> This is your complete business plan. The AI analyzes this content to provide personalized recommendations and validation scores for your automated discovery process.
            </div>
          </div>
        </div>
      )}

      {/* Pitch Deck Editor Modal */}
      {showPitchDeckEditor && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '20px'
        }}>
          <div style={{
            background: '#fff',
            borderRadius: 12,
            padding: '24px',
            maxWidth: '800px',
            width: '100%',
            maxHeight: '90vh',
            overflow: 'auto',
            boxShadow: '0 20px 40px rgba(0,0,0,0.15)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 700 }}>Pitch Deck Editor</h2>
              <button
                onClick={() => setShowPitchDeckEditor(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '24px',
                  cursor: 'pointer',
                  color: '#6b7280'
                }}
              >
                ×
              </button>
            </div>
            
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>Slide Title:</label>
              <input
                type="text"
                value={pitchDeckSlides[currentSlideIdx].title}
                onChange={(e) => handleSlideFieldChange(currentSlideIdx, 'title', e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: '1px solid #d1d5db',
                  borderRadius: 6,
                  fontSize: '14px'
                }}
              />
            </div>
            
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>Content:</label>
              <textarea
                value={pitchDeckSlides[currentSlideIdx].content}
                onChange={(e) => handleSlideFieldChange(currentSlideIdx, 'content', e.target.value)}
                style={{
                  width: '100%',
                  minHeight: '200px',
                  padding: '12px',
                  border: '1px solid #d1d5db',
                  borderRadius: 6,
                  fontSize: '14px',
                  resize: 'vertical'
                }}
                placeholder="Enter slide content..."
              />
            </div>
            
            <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
              {pitchDeckSlides.map((slide, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentSlideIdx(idx)}
                  style={{
                    padding: '8px 12px',
                    border: idx === currentSlideIdx ? '2px solid #007AFF' : '1px solid #d1d5db',
                    borderRadius: 6,
                    background: idx === currentSlideIdx ? '#f0f9ff' : '#fff',
                    cursor: 'pointer',
                    fontSize: '12px',
                    fontWeight: idx === currentSlideIdx ? 600 : 400
                  }}
                >
                  {slide.key}
                </button>
              ))}
            </div>
            
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setShowPitchDeckEditor(false)}
                style={{
                  padding: '8px 16px',
                  border: '1px solid #d1d5db',
                  borderRadius: 6,
                  background: '#fff',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
              <button
                onClick={downloadCustomPitchDeck}
                style={{
                  padding: '8px 16px',
                  border: 'none',
                  borderRadius: 6,
                  background: '#007AFF',
                  color: '#fff',
                  cursor: 'pointer',
                  fontWeight: 600
                }}
              >
                Download Pitch Deck
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Enhanced Improvement Modal with Preview Mode */}
      {showImprovementModal && improvedSections && editableSections && (
        <div 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '20px'
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowImprovementModal(false);
            }
          }}
        >
          <div style={{
            background: '#fff',
            borderRadius: 12,
            padding: '24px',
            maxWidth: '90vw',
            width: '100%',
            maxHeight: '90vh',
            overflow: 'auto',
            boxShadow: '0 20px 40px rgba(0,0,0,0.15)'
          }}>
            <button
              onClick={() => setShowImprovementModal(false)}
              style={{
                position: 'absolute',
                top: '16px',
                right: '16px',
                background: 'none',
                border: 'none',
                fontSize: '24px',
                cursor: 'pointer',
                color: '#6b7280',
                width: '32px',
                height: '32px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '50%',
                transition: 'background 0.2s'
              }}
              onMouseEnter={e => e.currentTarget.style.background = '#f3f4f6'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              ×
            </button>
            
            <h2 style={{
              margin: '0 0 20px 0',
              fontSize: '24px',
              fontWeight: 700,
              color: '#1f2937'
            }}>
              🤖 AI Business Plan Improvements
            </h2>
            
            {/* Section Selection */}
            <div style={{
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: 8,
              padding: '16px',
              marginBottom: '20px'
            }}>
              <h3 style={{
                margin: '0 0 12px 0',
                fontSize: '16px',
                fontWeight: 600,
                color: '#374151'
              }}>
                📋 Select Sections to Apply:
              </h3>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '12px'
              }}>
                {Object.entries(selectedSections).map(([key, selected]) => (
                  <label key={key} style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    cursor: 'pointer',
                    padding: '8px',
                    borderRadius: '6px',
                    background: selected ? '#e0f2fe' : 'transparent',
                    border: selected ? '1px solid #0284c7' : '1px solid #e5e7eb'
                  }}>
                    <input
                      type="checkbox"
                      checked={selected}
                      onChange={(e) => setSelectedSections(prev => ({
                        ...prev,
                        [key]: e.target.checked
                      }))}
                      style={{ margin: 0 }}
                    />
                    <span style={{
                      fontSize: '14px',
                      fontWeight: selected ? 600 : 500,
                      color: selected ? '#0c4a6e' : '#374151'
                    }}>
                      {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                    </span>
                  </label>
                ))}
              </div>
            </div>
            
            {/* Section Comparisons */}
            <div style={{ maxHeight: '60vh', overflow: 'auto' }}>
              {Object.entries(improvedSections).map(([sectionKey, originalContent]) => {
                const currentContent = getCurrentSectionContent(sectionKey);
                const editableContent = editableSections[sectionKey as keyof typeof editableSections];
                
                return (
                  <div key={sectionKey} style={{
                    border: '1px solid #e5e7eb',
                    borderRadius: 8,
                    marginBottom: '16px',
                    overflow: 'hidden'
                  }}>
                    <div style={{
                      background: '#f9fafb',
                      padding: '12px 16px',
                      borderBottom: '1px solid #e5e7eb',
                      fontWeight: 600,
                      color: '#374151'
                    }}>
                      {sectionKey.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                    </div>
                    
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: '1fr 1fr',
                      gap: '16px',
                      padding: '16px'
                    }}>
                      {/* Original */}
                      <div>
                        <h4 style={{
                          margin: '0 0 8px 0',
                          fontSize: '14px',
                          fontWeight: 600,
                          color: '#6b7280'
                        }}>
                          Original
                        </h4>
                        <div style={{
                          background: '#f3f4f6',
                          padding: '12px',
                          borderRadius: '6px',
                          fontSize: '13px',
                          lineHeight: 1.5,
                          color: '#6b7280',
                          minHeight: '100px'
                        }}>
                          {Array.isArray(currentContent) 
                            ? currentContent.join('\n• ')
                            : currentContent || 'No content available'
                          }
                        </div>
                      </div>
                      
                      {/* Improved */}
                      <div>
                        <h4 style={{
                          margin: '0 0 8px 0',
                          fontSize: '14px',
                          fontWeight: 600,
                          color: '#059669'
                        }}>
                          AI Improved
                        </h4>
                        {Array.isArray(editableContent) ? (
                          <div style={{
                            background: '#f0fdf4',
                            border: '1px solid #bbf7d0',
                            padding: '12px',
                            borderRadius: '6px',
                            minHeight: '100px'
                          }}>
                            {editableContent.map((item, idx) => (
                              <div key={idx} style={{
                                display: 'flex',
                                alignItems: 'flex-start',
                                marginBottom: '8px'
                              }}>
                                <span style={{
                                  marginRight: '8px',
                                  color: '#059669',
                                  fontSize: '14px'
                                }}>•</span>
                                <input
                                  type="text"
                                  value={item}
                                  onChange={(e) => {
                                    const newArray = [...editableContent];
                                    newArray[idx] = e.target.value;
                                    updateEditableSection(sectionKey, newArray);
                                  }}
                                  style={{
                                    flex: 1,
                                    border: 'none',
                                    background: 'transparent',
                                    fontSize: '13px',
                                    color: '#374151',
                                    outline: 'none'
                                  }}
                                />
                              </div>
                            ))}
                          </div>
                        ) : (
                          <textarea
                            value={editableContent as string}
                            onChange={(e) => updateEditableSection(sectionKey, e.target.value)}
                            style={{
                              width: '100%',
                              minHeight: '100px',
                              background: '#f0fdf4',
                              border: '1px solid #bbf7d0',
                              borderRadius: '6px',
                              padding: '12px',
                              fontSize: '13px',
                              lineHeight: 1.5,
                              color: '#374151',
                              resize: 'vertical',
                              outline: 'none'
                            }}
                          />
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            
            {/* Action Buttons */}
            <div style={{
              display: 'flex',
              gap: '12px',
              justifyContent: 'flex-end',
              marginTop: '20px',
              paddingTop: '16px',
              borderTop: '1px solid #e5e7eb'
            }}>
              <button
                onClick={() => setShowImprovementModal(false)}
                style={{
                  padding: '10px 20px',
                  border: '1px solid #d1d5db',
                  borderRadius: 6,
                  background: '#fff',
                  color: '#374151',
                  cursor: 'pointer',
                  fontWeight: 500
                }}
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  console.log('Button clicked!');
                  console.log('Button disabled:', !Object.values(selectedSections).some(Boolean));
                  console.log('Selected sections:', selectedSections);
                  applyImprovement();
                }}
                disabled={!Object.values(selectedSections).some(Boolean)}
                style={{
                  padding: '10px 20px',
                  border: 'none',
                  borderRadius: 6,
                  background: Object.values(selectedSections).some(Boolean) ? '#10b981' : '#6b7280',
                  color: '#fff',
                  cursor: Object.values(selectedSections).some(Boolean) ? 'pointer' : 'not-allowed',
                  fontWeight: 600
                }}
              >
                Apply Selected Improvements
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Re-evaluation Confirmation Modal */}
      {showReevaluationModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 10000,
        }}>
          <div style={{
            background: '#fff',
            borderRadius: 16,
            padding: '2rem',
            maxWidth: 480,
            width: '90%',
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.2)',
            border: '1px solid #e5e5e5',
          }}>
            <h3 style={{
              margin: '0 0 1rem 0',
              fontSize: '1.5rem',
              fontWeight: 700,
              color: '#181a1b',
            }}>
              Re-evaluate Previous Stage?
            </h3>
            <p style={{
              margin: '0 0 1.5rem 0',
              fontSize: '1rem',
              color: '#666',
              lineHeight: 1.5,
            }}>
              You're navigating back to "{STAGES[pendingStageNavigation || 0]}". This will trigger a new AI analysis and may take a few minutes. Would you like to:
            </p>
            <div style={{
              display: 'flex',
              gap: '1rem',
              justifyContent: 'flex-end',
            }}>
              <button
                onClick={() => setShowReevaluationModal(false)}
                style={{
                  background: '#fff',
                  color: '#666',
                  border: '1px solid #e5e5e5',
                  borderRadius: 8,
                  padding: '0.75rem 1.5rem',
                  fontSize: '1rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Cancel
              </button>
              <button
                onClick={viewPreviousResults}
                style={{
                  background: '#fff',
                  color: '#181a1b',
                  border: '1px solid #181a1b',
                  borderRadius: 8,
                  padding: '0.75rem 1.5rem',
                  fontSize: '1rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                View Previous Results
              </button>
              <button
                onClick={confirmReevaluation}
                style={{
                  background: '#181a1b',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 8,
                  padding: '0.75rem 1.5rem',
                  fontSize: '1rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Re-evaluate
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Completed Stages Modal */}
      {showCompletedStagesModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 10000
        }}>
          <div style={{
            background: '#fff',
            borderRadius: 12,
            padding: '2rem',
            maxWidth: 400,
            maxHeight: '80vh',
            overflow: 'auto',
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.2)',
            border: '1px solid #e5e7eb'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '1.5rem'
            }}>
              <h3 style={{
                margin: 0,
                fontSize: '1.25rem',
                fontWeight: 600,
                color: '#1f2937'
              }}>
                Completed Stages
              </h3>
              <button
                onClick={() => setShowCompletedStagesModal(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '1.5rem',
                  cursor: 'pointer',
                  color: '#6b7280',
                  padding: 0,
                  width: 24,
                  height: 24,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                ×
              </button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {completedStages.map((stage, index) => (
                <div key={index} style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.75rem',
                  background: '#f9fafb',
                  borderRadius: 8,
                  border: '1px solid #e5e7eb'
                }}>
                  <span style={{
                    fontSize: '0.875rem',
                    color: '#374151',
                    fontWeight: 500
                  }}>
                    {STAGES[parseInt(stage)]}
                  </span>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button
                      onClick={() => {
                        setStageToReevaluate(parseInt(stage));
                        setShowReevaluateModal(true);
                        setShowCompletedStagesModal(false);
                      }}
                      style={{
                        fontSize: '0.75rem',
                        padding: '0.375rem 0.75rem',
                        background: '#dbeafe',
                        color: '#1d4ed8',
                        borderRadius: 6,
                        border: 'none',
                        cursor: 'pointer',
                        fontWeight: 500,
                        transition: 'all 0.2s ease'
                      }}
                    >
                      Re-evaluate
                    </button>
                    <button
                      onClick={() => {
                        setIsViewingPreviousResults(true);
                        setSkipReevaluation(true);
                        updateCurrentStage(parseInt(stage));
                        loadStageEvaluation(parseInt(stage));
                        setShowCompletedStagesModal(false);
                        // Reset the flags after a delay to allow the data to load
                        setTimeout(() => {
                          setIsViewingPreviousResults(false);
                          setSkipReevaluation(false);
                        }, 2000);
                      }}
                      style={{
                        fontSize: '0.75rem',
                        padding: '0.375rem 0.75rem',
                        background: '#dcfce7',
                        color: '#16a34a',
                        borderRadius: 6,
                        border: 'none',
                        cursor: 'pointer',
                        fontWeight: 500,
                        transition: 'all 0.2s ease'
                      }}
                    >
                      View
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Re-evaluate Stage Modal */}
      {showReevaluateModal && stageToReevaluate !== null && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 10000,
        }}>
          <div style={{
            background: '#fff',
            borderRadius: 16,
            padding: '2rem',
            maxWidth: 480,
            width: '90%',
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.2)',
            border: '1px solid #e5e5e5',
          }}>
            <h3 style={{
              margin: '0 0 1rem 0',
              fontSize: '1.5rem',
              fontWeight: 700,
              color: '#181a1b',
            }}>
              Re-evaluate Stage
            </h3>
            <p style={{
              margin: '0 0 1.5rem 0',
              fontSize: '1rem',
              color: '#666',
              lineHeight: 1.5,
            }}>
              Are you sure you want to re-evaluate the "{STAGES[stageToReevaluate]}" stage? This will generate new personas and feedback.
            </p>
            <div style={{
              display: 'flex',
              gap: '1rem',
              justifyContent: 'flex-end',
            }}>
              <button
                onClick={() => {
                  setShowReevaluateModal(false);
                  setStageToReevaluate(null);
                }}
                style={{
                  background: '#fff',
                  color: '#666',
                  border: '1px solid #e5e5e5',
                  borderRadius: 8,
                  padding: '0.75rem 1.5rem',
                  fontSize: '1rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  setShowReevaluateModal(false);
                  setStageToReevaluate(null);
                  updateCurrentStage(stageToReevaluate);
                  await reevaluateStage(stageToReevaluate);
                }}
                style={{
                  background: '#dc2626',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 8,
                  padding: '0.75rem 1.5rem',
                  fontSize: '1rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Re-evaluate
              </button>
            </div>
          </div>
        </div>
      )}
      <BusinessPlanModal
        isOpen={showFullPlanModal}
        onClose={() => setShowFullPlanModal(false)}
        improvedSections={fullPlanSections}
        getCurrentSectionContent={getCurrentSectionContent}
      />
    </div>
  );
}

export default AutomatedDiscoveryPage; 