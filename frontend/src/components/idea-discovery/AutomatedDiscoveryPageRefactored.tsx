import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAutomatedDiscovery } from './hooks/useAutomatedDiscovery';
import { useValidationScore } from './hooks/useValidationScore';
import { usePersonas } from './hooks/usePersonas';
import { ProgressSidebar } from './shared/ProgressSidebar';
import { ImprovementModal } from './shared/ImprovementModal';
import { BusinessPlanModal } from './shared/BusinessPlanModal';
import { ProblemDiscoveryStage } from './stages/ProblemDiscoveryStage';
import { CustomerProfileStage } from './stages/CustomerProfileStage';
import { CustomerStruggleStage } from './stages/CustomerStruggleStage';
import { SolutionFitStage } from './stages/SolutionFitStage';
import { BusinessModelStage } from './stages/BusinessModelStage';
import { MarketValidationStage } from './stages/MarketValidationStage';

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

export function AutomatedDiscoveryPageRefactored() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  // Custom hooks for state management
  const { state, actions } = useAutomatedDiscovery();
  const { validationScore, setValidationScore } = useValidationScore();
  const { personas, setPersonas, collectiveSummary, setCollectiveSummary } = usePersonas();
  
  // Local state
  const [planData, setPlanData] = useState<any>(null);
  const [businessIdea, setBusinessIdea] = useState('');
  const [customerDescription, setCustomerDescription] = useState('');
  const [improvedSections, setImprovedSections] = useState<any>({});
  const [editableSections, setEditableSections] = useState<any>({});
  const [showImprovementModal, setShowImprovementModal] = useState(false);
  const [showBusinessPlanModal, setShowBusinessPlanModal] = useState(false);
  const [showCompletedStagesModal, setShowCompletedStagesModal] = useState(false);

  // Load initial data
  useEffect(() => {
    if (id) {
      fetchBusinessPlan();
      // Load current stage from localStorage
      const savedStage = localStorage.getItem(`automated-discovery-stage-${id}`);
      if (savedStage) {
        actions.setCurrentStage(parseInt(savedStage, 10));
      }
    }
  }, [id]);

  // Save current stage to localStorage
  useEffect(() => {
    if (id) {
      localStorage.setItem(`automated-discovery-stage-${id}`, state.currentStage.toString());
    }
  }, [state.currentStage, id]);

  const fetchBusinessPlan = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/business-plan/${id}`, {
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setPlanData(data);
        setBusinessIdea(data.businessIdea || '');
        setCustomerDescription(data.customer?.description || '');
      }
    } catch (error) {
      console.error('Error fetching business plan:', error);
    }
  };

  const handleStageComplete = (data: any) => {
    // Update completed stages
    if (!state.completedStages.includes(state.currentStage.toString())) {
      actions.setCompletedStages([...state.completedStages, state.currentStage.toString()]);
    }
    
    // Move to next stage
    if (state.currentStage < STAGES.length - 1) {
      actions.setCurrentStage(state.currentStage + 1);
    }
  };

  const handleStageUpdate = (data: any) => {
    // Update any stage-specific data
    console.log('Stage updated:', data);
  };

  const handleAutoImprove = async () => {
    try {
      actions.setIsAutoImproving(true);
      const token = localStorage.getItem('token');
      
      const response = await fetch(`${API_URL}/automated-discovery/auto-improve`, {
        method: 'POST',
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          businessPlanId: id, // <-- add this line
          businessIdea,
          customerDescription,
          planData,
          currentStage: STAGES[state.currentStage],
        }),
      });

      if (response.ok) {
        const data = await response.json();
        
        const improvedSectionsToSet = {
          problemStatement: data.improvedSections?.problemStatement || businessIdea,
          solution: data.improvedSections?.solution || planData?.solution?.description || businessIdea,
          customerPainPoints: data.improvedSections?.customerPainPoints || planData?.sections?.customerPainPoints || planData?.sections?.['Customer Struggles'] || [customerDescription],
          valueProposition: data.improvedSections?.valueProposition || planData?.sections?.valueProposition || planData?.sections?.['Value Proposition'] || 'Not yet defined',
          marketAnalysis: data.improvedSections?.marketAnalysis || planData?.sections?.marketAnalysis || planData?.sections?.['Market Size'] || 'Not yet defined',
          competitiveAnalysis: data.improvedSections?.competitiveAnalysis || planData?.sections?.competitiveAnalysis || planData?.sections?.['Competitors'] || 'Not yet defined'
        };
        
        setImprovedSections(improvedSectionsToSet);
        setEditableSections(improvedSectionsToSet);
        setShowImprovementModal(true);
      }
    } catch (error) {
      console.error('Error during auto-improve:', error);
    } finally {
      actions.setIsAutoImproving(false);
    }
  };

  const handleSaveImprovements = async (sections: any) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/business-plan/${id}`, {
        method: 'PUT',
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sections: {
            ...planData.sections,
            ...sections,
          },
        }),
      });

      if (response.ok) {
        await fetchBusinessPlan(); // Refresh data
        setShowImprovementModal(false);
      }
    } catch (error) {
      console.error('Error saving improvements:', error);
    }
  };

  const getCurrentSectionContent = (sectionKey: string) => {
    if (sectionKey === 'problemStatement') {
      return businessIdea;
    }
    
    const sectionMap: { [key: string]: string } = {
      solution: planData?.solution?.description || '',
      customerPainPoints: planData?.sections?.customerPainPoints || planData?.sections?.['Customer Struggles'] || planData?.customer?.painPoints?.join('\n• ') || '',
      valueProposition: planData?.sections?.valueProposition || planData?.sections?.['Value Proposition'] || '',
      marketAnalysis: planData?.sections?.marketAnalysis || planData?.sections?.['Market Size'] || planData?.sections?.['Market Analysis'] || '',
      competitiveAnalysis: planData?.sections?.competitiveAnalysis || planData?.sections?.['Competitors'] || planData?.sections?.['Competitive Analysis'] || ''
    };
    
    return sectionMap[sectionKey] || '';
  };

  const renderCurrentStage = () => {
    switch (state.currentStage) {
      case 0:
        return (
          <ProblemDiscoveryStage
            businessIdea={businessIdea}
            customerDescription={customerDescription}
            planData={planData}
            businessPlanId={id || ''}
            onStageComplete={handleStageComplete}
            onStageUpdate={handleStageUpdate}
          />
        );
      case 1:
        return (
          <CustomerProfileStage
            businessIdea={businessIdea}
            customerDescription={customerDescription}
            planData={planData}
            businessPlanId={id || ''}
            onStageComplete={handleStageComplete}
            onStageUpdate={handleStageUpdate}
          />
        );
      case 2:
        return (
          <CustomerStruggleStage
            businessIdea={businessIdea}
            customerDescription={customerDescription}
            planData={planData}
            businessPlanId={id || ''}
            onStageComplete={handleStageComplete}
            onStageUpdate={handleStageUpdate}
          />
        );
      case 3:
        return (
          <SolutionFitStage
            businessIdea={businessIdea}
            customerDescription={customerDescription}
            planData={planData}
            businessPlanId={id || ''}
            onStageComplete={handleStageComplete}
            onStageUpdate={handleStageUpdate}
          />
        );
      case 4:
        return (
          <BusinessModelStage
            businessIdea={businessIdea}
            customerDescription={customerDescription}
            planData={planData}
            businessPlanId={id || ''}
            onStageComplete={handleStageComplete}
            onStageUpdate={handleStageUpdate}
          />
        );
      case 5:
        return (
          <MarketValidationStage
            businessIdea={businessIdea}
            customerDescription={customerDescription}
            planData={planData}
            businessPlanId={id || ''}
            onStageComplete={handleStageComplete}
            onStageUpdate={handleStageUpdate}
          />
        );
      case 6:
        return <div>Launch Stage (Coming Soon)</div>;
      default:
        return <div>Unknown Stage</div>;
    }
  };

  return (
    <div style={{ display: 'flex', height: '100vh' }}>
      {/* Progress Sidebar */}
      <ProgressSidebar
        stages={STAGES}
        currentStage={state.currentStage}
        completedStages={state.completedStages}
        onStageClick={actions.handleStageNavigation}
        showCompletedStagesModal={showCompletedStagesModal}
        setShowCompletedStagesModal={setShowCompletedStagesModal}
      />

      {/* Main Content */}
      <div style={{ flex: 1, overflow: 'auto' }}>
        {/* Header */}
        <div style={{
          padding: '1rem 2rem',
          borderBottom: '1px solid #e5e7eb',
          background: '#fff',
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}>
            <h1 style={{ margin: 0, color: '#1f2937' }}>
              {STAGES[state.currentStage]}
            </h1>
            
            <div style={{ display: 'flex', gap: '1rem' }}>
              <button
                onClick={handleAutoImprove}
                disabled={state.isAutoImproving}
                style={{
                  padding: '0.5rem 1rem',
                  border: 'none',
                  borderRadius: '6px',
                  background: state.isAutoImproving ? '#9ca3af' : '#10b981',
                  color: '#fff',
                  cursor: state.isAutoImproving ? 'not-allowed' : 'pointer',
                  fontSize: '14px',
                }}
              >
                {state.isAutoImproving ? 'Improving...' : 'Auto Improve'}
              </button>
              
              <button
                onClick={() => setShowBusinessPlanModal(true)}
                style={{
                  padding: '0.5rem 1rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  background: '#fff',
                  color: '#374151',
                  cursor: 'pointer',
                  fontSize: '14px',
                }}
              >
                Full Business Plan
              </button>
            </div>
          </div>
        </div>

        {/* Stage Content */}
        {renderCurrentStage()}
      </div>

      {/* Modals */}
      <ImprovementModal
        isOpen={showImprovementModal}
        onClose={() => setShowImprovementModal(false)}
        improvedSections={improvedSections}
        editableSections={editableSections}
        onSave={handleSaveImprovements}
        getCurrentSectionContent={getCurrentSectionContent}
      />

      <BusinessPlanModal
        isOpen={showBusinessPlanModal}
        onClose={() => setShowBusinessPlanModal(false)}
        improvedSections={improvedSections}
        getCurrentSectionContent={getCurrentSectionContent}
      />
    </div>
  );
} 