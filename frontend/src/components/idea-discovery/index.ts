// Hooks
export { useAutomatedDiscovery } from './hooks/useAutomatedDiscovery';
export { useValidationScore } from './hooks/useValidationScore';
export { usePersonas } from './hooks/usePersonas';

// Shared Components
export { ProgressSidebar } from './shared/ProgressSidebar';
export { ImprovementModal } from './shared/ImprovementModal';
export { BusinessPlanModal } from './shared/BusinessPlanModal';

// Stage Components
export { ProblemDiscoveryStage } from './stages/ProblemDiscoveryStage';
export { CustomerProfileStage } from './stages/CustomerProfileStage';
export { CustomerStruggleStage } from './stages/CustomerStruggleStage';
export { SolutionFitStage } from './stages/SolutionFitStage';
export { BusinessModelStage } from './stages/BusinessModelStage';
export { MarketValidationStage } from './stages/MarketValidationStage';

// Main Page (Refactored)
export { AutomatedDiscoveryPageRefactored } from './AutomatedDiscoveryPageRefactored';

// Types
export type { AutomatedDiscoveryState, AutomatedDiscoveryActions } from './hooks/useAutomatedDiscovery';
export type { ValidationScore } from './hooks/useValidationScore';
export type { Persona } from './hooks/usePersonas';
export type { ProgressSidebarProps } from './shared/ProgressSidebar';
export type { ImprovementModalProps } from './shared/ImprovementModal';
export type { BusinessPlanModalProps } from './shared/BusinessPlanModal';
export type { ProblemDiscoveryStageProps } from './stages/ProblemDiscoveryStage';
export type { CustomerProfileStageProps } from './stages/CustomerProfileStage';
export type { CustomerStruggleStageProps } from './stages/CustomerStruggleStage';
export type { SolutionFitStageProps } from './stages/SolutionFitStage';
export type { BusinessModelStageProps } from './stages/BusinessModelStage';
export type { MarketValidationStageProps } from './stages/MarketValidationStage'; 