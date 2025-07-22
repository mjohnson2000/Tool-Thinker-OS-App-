import { useState, useCallback } from 'react';

export interface ValidationScore {
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

export function useValidationScore() {
  const [validationScore, setValidationScore] = useState<ValidationScore | null>(null);

  const getValidationCriteria = useCallback((validationScore: ValidationScore, currentStage: number) => {
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
    }
    // Default to all criteria
    return validationScore.criteria;
  }, []);

  return {
    validationScore,
    setValidationScore,
    getValidationCriteria,
  };
} 