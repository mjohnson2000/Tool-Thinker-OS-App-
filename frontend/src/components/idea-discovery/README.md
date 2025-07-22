# Automated Discovery Component Structure

This directory contains the refactored automated discovery components, organized for better maintainability and debugging.

## 📁 Directory Structure

```
idea-discovery/
├── hooks/                    # Custom hooks for state management
│   ├── useAutomatedDiscovery.ts
│   ├── useValidationScore.ts
│   └── usePersonas.ts
├── shared/                   # Reusable UI components
│   ├── ProgressSidebar.tsx
│   ├── ImprovementModal.tsx
│   └── BusinessPlanModal.tsx
├── stages/                   # Individual stage components
│   ├── ProblemDiscoveryStage.tsx
│   ├── CustomerProfileStage.tsx (coming soon)
│   ├── CustomerStruggleStage.tsx (coming soon)
│   ├── SolutionFitStage.tsx (coming soon)
│   ├── BusinessModelStage.tsx (coming soon)
│   └── MarketValidationStage.tsx (coming soon)
├── AutomatedDiscoveryPageRefactored.tsx  # Main orchestrator
├── AutomatedDiscoveryPage.tsx            # Original (to be replaced)
└── index.ts                             # Exports
```

## 🎣 Custom Hooks

### `useAutomatedDiscovery`
Manages the main state for the automated discovery process:
- Current stage
- Completed stages
- Loading states
- Error handling
- Process steps

### `useValidationScore`
Handles validation score state and logic:
- Score calculation
- Criteria mapping
- Stage-specific validation

### `usePersonas`
Manages customer personas:
- Persona data
- Feedback
- Collective summaries

## 🧩 Shared Components

### `ProgressSidebar`
Reusable sidebar showing stage progress and navigation.

### `ImprovementModal`
Modal for displaying and editing AI improvements.

### `BusinessPlanModal`
Modal for displaying the full business plan with original and improved content.

## 🎯 Stage Components

Each stage is now its own component with:
- **Focused responsibility**: Only handles its specific stage logic
- **Clear interfaces**: Well-defined props and callbacks
- **Isolated state**: Stage-specific state management
- **Easier testing**: Can test each stage independently

### `ProblemDiscoveryStage`
- Handles customer feedback generation
- Manages business plan section creation
- Displays validation scores
- Shows customer personas

## 🚀 Benefits of This Structure

### 1. **Easier Debugging**
- Issues are isolated to specific components
- Clear data flow between components
- Easier to trace problems

### 2. **Better Maintainability**
- Changes to one stage don't affect others
- Smaller, focused files
- Clear separation of concerns

### 3. **Improved Performance**
- Only render active stage
- Better code splitting
- Reduced re-renders

### 4. **Enhanced Developer Experience**
- Easier to understand and modify
- Better TypeScript support
- Clearer component responsibilities

## 🔄 Migration Strategy

1. **Phase 1**: Extract hooks and shared components ✅
2. **Phase 2**: Create ProblemDiscoveryStage ✅
3. **Phase 3**: Create remaining stage components
4. **Phase 4**: Replace original page with refactored version
5. **Phase 5**: Remove original file

## 🧪 Testing

Each component can now be tested independently:

```typescript
// Test a specific stage
import { ProblemDiscoveryStage } from './stages/ProblemDiscoveryStage';

// Test shared components
import { ProgressSidebar } from './shared/ProgressSidebar';

// Test hooks
import { useAutomatedDiscovery } from './hooks/useAutomatedDiscovery';
```

## 🔧 Usage

```typescript
import { AutomatedDiscoveryPageRefactored } from './idea-discovery';

// Or import specific components
import { 
  ProblemDiscoveryStage, 
  ProgressSidebar,
  useAutomatedDiscovery 
} from './idea-discovery';
```

## 🎯 Next Steps

1. **Create remaining stage components** for Customer Profile, Customer Struggle, etc.
2. **Add proper TypeScript interfaces** for each stage's data
3. **Implement stage-specific validation** logic
4. **Add comprehensive testing** for each component
5. **Replace the original page** with the refactored version

This structure makes the automated discovery process much more maintainable and easier to debug! 🎉 