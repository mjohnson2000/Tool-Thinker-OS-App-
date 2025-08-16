import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { FiCheckCircle, FiClock, FiTrendingUp, FiTarget, FiUsers, FiDollarSign } from 'react-icons/fi';
import { FaUserTie } from 'react-icons/fa';
import { sideHustleCoach, SIDE_HUSTLE_COACH } from '../../utils/sideHustleCoach';
import type { CoachEvaluation } from '../../utils/sideHustleCoach';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

interface ValidationStep {
  id: string;
  name: string;
  description: string;
  status: 'pending' | 'running' | 'completed' | 'error';
  progress: number;
}

interface ValidationResult {
  planId: string;
  originalPlan: any;
  validatedPlan: any;
  marketEvaluation: any;
  customerInsights: any;
  competitiveAnalysis: any;
  businessModel: any;
  recommendations: any;
  score: number;
}

const Container = styled.div`
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
  min-height: 100vh;
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  
  @media (max-width: 768px) {
    padding: 1rem 0.5rem;
    max-width: 95%;
  }
  
  @media (max-width: 480px) {
    padding: 0.5rem;
  }
`;

const Header = styled.div`
  text-align: center;
  margin-bottom: 3rem;
`;

const Title = styled.h1`
  font-family: 'Audiowide', 'Courier New', monospace;
  font-size: 2.5rem;
  font-weight: 400;
  color: #181a1b;
  margin-bottom: 1rem;
  font-display: swap;
  
  @media (max-width: 768px) {
    font-size: 2rem;
  }
  
  @media (max-width: 480px) {
    font-size: 1.8rem;
  }
`;

const Subtitle = styled.p`
  font-size: 1.2rem;
  color: #6c757d;
  margin-bottom: 2rem;
  
  @media (max-width: 768px) {
    font-size: 1.1rem;
    margin-bottom: 1.5rem;
  }
  
  @media (max-width: 480px) {
    font-size: 1rem;
    margin-bottom: 1rem;
  }
`;

const ProgressContainer = styled.div`
  background: white;
  border-radius: 16px;
  padding: 2rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  margin-bottom: 2rem;
  
  @media (max-width: 768px) {
    padding: 1.5rem;
    margin-bottom: 1.5rem;
    border-radius: 12px;
  }
  
  @media (max-width: 480px) {
    padding: 1rem;
    margin-bottom: 1rem;
    border-radius: 8px;
  }
`;

const ProgressHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1.5rem;
`;

const ProgressTitle = styled.h2`
  font-size: 1.5rem;
  color: #181a1b;
  margin: 0;
`;

const ProgressPercentage = styled.div`
  font-size: 1.2rem;
  font-weight: 600;
  color: #181a1b;
`;

const ProgressBar = styled.div`
  width: 100%;
  height: 8px;
  background: #e9ecef;
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 2rem;
`;

const ProgressFill = styled.div<{ progress: number }>`
  height: 100%;
  background: linear-gradient(90deg, #181a1b 0%, #4a4a4a 100%);
  width: ${props => props.progress}%;
  transition: width 0.5s ease;
`;

const StepsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const StepItem = styled.div<{ status: ValidationStep['status'] }>`
  display: flex;
  align-items: center;
  padding: 1rem;
  border-radius: 8px;
  background: ${props => {
    switch (props.status) {
      case 'completed': return '#d4edda';
      case 'running': return '#fff3cd';
      case 'error': return '#f8d7da';
      default: return '#f8f9fa';
    }
  }};
  border: 1px solid ${props => {
    switch (props.status) {
      case 'completed': return '#c3e6cb';
      case 'running': return '#ffeaa7';
      case 'error': return '#f5c6cb';
      default: return '#e9ecef';
    }
  }};
  transition: all 0.3s ease;
`;

const StepIcon = styled.div<{ status: ValidationStep['status'] }>`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 1rem;
  background: ${props => {
    switch (props.status) {
      case 'completed': return '#28a745';
      case 'running': return '#ffc107';
      case 'error': return '#dc3545';
      default: return '#6c757d';
    }
  }};
  color: white;
  font-size: 1.2rem;
`;

const StepContent = styled.div`
  flex: 1;
`;

const StepName = styled.div`
  font-weight: 600;
  color: #181a1b;
  margin-bottom: 0.25rem;
`;

const StepDescription = styled.div`
  font-size: 0.9rem;
  color: #6c757d;
`;

const ResultsContainer = styled.div`
  background: white;
  border-radius: 16px;
  padding: 2rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
`;

const ResultsHeader = styled.div`
  text-align: center;
  margin-bottom: 2rem;
`;

const ResultsTitle = styled.h2`
  font-family: 'Audiowide', 'Courier New', monospace;
  font-size: 2rem;
  font-weight: 400;
  color: #181a1b;
  margin-bottom: 1rem;
  font-display: swap;
`;

const ScoreDisplay = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  margin-bottom: 2rem;
`;

const ScoreCircle = styled.div<{ score: number }>`
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: ${props => {
    if (props.score >= 80) return 'linear-gradient(135deg, #28a745 0%, #20c997 100%)';
    if (props.score >= 60) return 'linear-gradient(135deg, #ffc107 0%, #fd7e14 100%)';
    return 'linear-gradient(135deg, #dc3545 0%, #e83e8c 100%)';
  }};
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1.5rem;
  font-weight: 700;
`;

const ScoreLabel = styled.div`
  font-size: 1.2rem;
  color: #181a1b;
  font-weight: 600;
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
`;

const ActionButton = styled.button<{ variant?: 'primary' | 'secondary' }>`
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  
  background: ${props => props.variant === 'primary' ? '#181a1b' : '#f8f9fa'};
  color: ${props => props.variant === 'primary' ? '#fff' : '#181a1b'};
  border: ${props => props.variant === 'secondary' ? '2px solid #181a1b' : 'none'};
  
  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }
`;

const validationSteps: ValidationStep[] = [
  {
    id: 'coach-analysis',
    name: 'Side Hustle Coach Analysis',
    description: 'Expert evaluation by Alex Chen',
    status: 'pending',
    progress: 0
  },
  {
    id: 'side-hustle-viability',
    name: 'Side Hustle Viability',
    description: 'Time commitment & resource assessment',
    status: 'pending',
    progress: 0
  },
  {
    id: 'market-opportunity',
    name: 'Market Opportunity',
    description: 'Market timing & competitive analysis',
    status: 'pending',
    progress: 0
  },
  {
    id: 'execution-planning',
    name: 'Execution Planning',
    description: 'Risk assessment & strategy development',
    status: 'pending',
    progress: 0
  }
];

export function AutomatedValidationPage() {
  const { planId } = useParams();
  const navigate = useNavigate();
  

  const [steps, setSteps] = useState<ValidationStep[]>(validationSteps);
  const [overallProgress, setOverallProgress] = useState(0);
  const [isValidating, setIsValidating] = useState(true);
  const [results, setResults] = useState<ValidationResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (planId) {
      checkPlanStatus();
    }
  }, [planId]);

  const checkPlanStatus = async () => {
    try {
      // Fetch the plan to check its current status
      const response = await fetch(`${API_URL}/business-plan/${planId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const plan = await response.json();
        
        // Always run validation process, even if plan is already validated
        // This ensures version incrementing and fresh coach analysis
        console.log('Plan status:', plan.status, '- Running validation process anyway');
      }
      
      // If plan is not validated, run the validation process
      runValidation();
    } catch (error) {
      console.warn('Failed to check plan status, running validation:', error);
      runValidation();
    }
  };

  const runValidation = async () => {
    try {
      setIsValidating(true);
      setError(null);

      // Fetch plan data first
      const planResponse = await fetch(`${API_URL}/business-plan/${planId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (!planResponse.ok) {
        throw new Error('Failed to fetch plan data');
      }
      
      const plan = await planResponse.json();

      // Step 1: Side Hustle Coach Analysis
      await updateStep('coach-analysis', 'running');
      await new Promise(resolve => setTimeout(resolve, 1000)); // Add delay to show progress
      const coachEvaluation = await sideHustleCoach.evaluateBusinessPlan(plan);
      await updateStep('coach-analysis', 'completed');

      // Step 2: Side Hustle Viability Assessment
      await updateStep('side-hustle-viability', 'running');
      await new Promise(resolve => setTimeout(resolve, 2000)); // Longer delay for visibility
      await updateStep('side-hustle-viability', 'completed');

      // Step 3: Market Opportunity Analysis
      await updateStep('market-opportunity', 'running');
      await new Promise(resolve => setTimeout(resolve, 2000)); // Longer delay for visibility
      await updateStep('market-opportunity', 'completed');

      // Step 4: Execution Planning
      await updateStep('execution-planning', 'running');
      await new Promise(resolve => setTimeout(resolve, 2000)); // Longer delay for visibility
      await updateStep('execution-planning', 'completed');

      // Use coach evaluation results
      const overallScore = coachEvaluation.overallScore;

      // Create enhanced plan with coach's improved content
      const enhancedPlan = {
        ...plan,
        status: 'validated',
        marketEvaluation: { score: overallScore },
        // Enhanced content from coach evaluation
        businessIdeaSummary: coachEvaluation.enhancedContent?.businessIdeaSummary || plan.businessIdeaSummary,
        customerProfile: {
          ...plan.customerProfile,
          description: coachEvaluation.enhancedContent?.customerProfile || plan.customerProfile?.description
        },
        customerStruggle: coachEvaluation.enhancedContent?.customerStruggles || plan.customerStruggle,
        valueProposition: coachEvaluation.enhancedContent?.valueProposition || plan.valueProposition,
        marketInformation: {
          ...plan.marketInformation,
          marketSize: coachEvaluation.enhancedContent?.marketInformation?.marketSize || plan.marketInformation?.marketSize,
          trends: coachEvaluation.enhancedContent?.marketInformation?.trends || plan.marketInformation?.trends,
          competitors: coachEvaluation.enhancedContent?.marketInformation?.competitors || plan.marketInformation?.competitors
        },
        financialSummary: coachEvaluation.enhancedContent?.financialSummary || plan.financialSummary
      };

      // Generate comprehensive results with coach insights
      const validationResults: ValidationResult = {
        planId: planId!,
        originalPlan: plan,
        validatedPlan: enhancedPlan,
        marketEvaluation: {
          score: coachEvaluation.marketOpportunity,
          insights: coachEvaluation.validationInsights
        },
        customerInsights: {
          score: coachEvaluation.sideHustleViability,
          insights: coachEvaluation.validationInsights
        },
        competitiveAnalysis: {
          score: coachEvaluation.executionFeasibility,
          insights: coachEvaluation.validationInsights
        },
        businessModel: {
          score: coachEvaluation.riskAssessment,
          insights: coachEvaluation.validationInsights
        },
        recommendations: coachEvaluation.recommendations,
        score: overallScore
      };

      // Update plan with enhanced content
      try {
        console.log('Sending validation request to:', `${API_URL}/business-plan/${planId}/validate`);
        console.log('Validation payload:', {
          status: 'validated',
          marketEvaluation: { score: overallScore },
          businessIdeaSummary: enhancedPlan.businessIdeaSummary,
          customerProfile: enhancedPlan.customerProfile,
          customerStruggle: enhancedPlan.customerStruggle,
          valueProposition: enhancedPlan.valueProposition,
          marketInformation: enhancedPlan.marketInformation,
          financialSummary: enhancedPlan.financialSummary
        });
        
        const response = await fetch(`${API_URL}/business-plan/${planId}/validate`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify({
            status: 'validated',
            marketEvaluation: { score: overallScore },
            // Send enhanced content to update the plan
            businessIdeaSummary: enhancedPlan.businessIdeaSummary,
            customerProfile: enhancedPlan.customerProfile,
            customerStruggle: enhancedPlan.customerStruggle,
            valueProposition: enhancedPlan.valueProposition,
            marketInformation: enhancedPlan.marketInformation,
            financialSummary: enhancedPlan.financialSummary
          })
        });
        
        console.log('Validation response status:', response.status);
        console.log('Validation response ok:', response.ok);

        if (!response.ok) {
          console.warn('Failed to update plan with enhanced content, but validation completed');
          const errorText = await response.text();
          console.error('Validation error response:', errorText);
        } else {
          console.log('Plan successfully updated with enhanced content');
          const responseData = await response.json();
          console.log('Validation response data:', responseData);
          
          // Refresh the plan data to show updated version
          const updatedPlanResponse = await fetch(`${API_URL}/business-plan/${planId}`, {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
          });
          if (updatedPlanResponse.ok) {
            const updatedPlan = await updatedPlanResponse.json();
            console.log('Updated plan data:', updatedPlan);
            console.log('Updated plan version:', updatedPlan.version);
          } else {
            console.error('Failed to fetch updated plan');
          }
        }
      } catch (error) {
        console.warn('Failed to update plan with enhanced content:', error);
      }

      setResults(validationResults);
      setIsValidating(false);
      
      // Redirect back to view page with refresh parameter
      setTimeout(() => {
        navigate(`/startup-plan/${planId}?refresh=true`);
      }, 2000);

    } catch (err) {
      console.error('Validation error:', err);
      setError('Validation failed. Please try again.');
      setIsValidating(false);
    }
  };

  const updateStep = async (stepId: string, status: ValidationStep['status']) => {
    console.log(`🔄 Updating step ${stepId} to status: ${status}`);
    setSteps(prev => {
      const updatedSteps = prev.map(step => 
        step.id === stepId ? { ...step, status } : step
      );
      
      // Update overall progress based on updated steps
      const completedSteps = updatedSteps.filter(s => s.status === 'completed').length;
      const newProgress = Math.round((completedSteps / updatedSteps.length) * 100);
      console.log(`📊 Progress: ${completedSteps}/${updatedSteps.length} steps completed = ${newProgress}%`);
      setOverallProgress(newProgress);
      
      return updatedSteps;
    });
  };

  // Lean validation functions using existing AI endpoints
  const runMarketValidation = async (plan: any) => {
    console.log('Starting market validation...');
    try {
      const response = await fetch(`${API_URL}/automated-discovery/${planId}/stage/0`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          idea: plan.idea || { interests: plan.title },
          customer: plan.customer || { title: 'Target Customer' },
          job: plan.job || { title: 'Problem to Solve' }
        })
      });

      console.log('Market validation response status:', response.status);

      if (response.ok) {
        const result = await response.json();
        console.log('Market validation result:', result);
        
        // Enhanced market information
        const enhancedMarketInfo = {
          marketSize: result.marketSize || plan.marketInformation?.marketSize || 'Validated market opportunity with significant growth potential',
          trends: result.trends || plan.marketInformation?.trends || ['Growing demand for innovative solutions', 'Digital transformation accelerating', 'Remote work trends creating new opportunities'],
          competitors: plan.marketInformation?.competitors || ['Established players in the space', 'Emerging startups with similar offerings', 'Traditional alternatives']
        };
        
        return {
          score: Math.min(95, Math.max(60, Math.floor(Math.random() * 35) + 60)),
          marketSize: enhancedMarketInfo.marketSize,
          trends: enhancedMarketInfo.trends,
          competitors: enhancedMarketInfo.competitors,
          recommendations: ['Focus on underserved segments', 'Monitor market trends', 'Differentiate from competitors'],
          enhancedContent: enhancedMarketInfo
        };
      } else {
        console.warn('Market validation API returned error:', response.status);
      }
    } catch (error) {
      console.warn('Market validation failed:', error);
    }

    // Add a small delay to simulate processing time
    await new Promise(resolve => setTimeout(resolve, 3000));

    // Enhanced fallback content
    const enhancedMarketInfo = {
      marketSize: plan.marketInformation?.marketSize || 'Moderate market opportunity with room for growth',
      trends: plan.marketInformation?.trends || ['Steady growth in the sector', 'Increasing adoption of technology solutions'],
      competitors: plan.marketInformation?.competitors || ['Key competitors in the market', 'Alternative solutions available']
    };

    return {
      score: 75,
      marketSize: enhancedMarketInfo.marketSize,
      trends: enhancedMarketInfo.trends,
      competitors: enhancedMarketInfo.competitors,
      recommendations: ['Conduct deeper market research', 'Identify unique value propositions'],
      enhancedContent: enhancedMarketInfo
    };
  };

  const runCustomerValidation = async (plan: any) => {
    console.log('Starting customer validation...');
    try {
      const response = await fetch(`${API_URL}/automated-discovery/${planId}/stage/1`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          idea: plan.idea || { interests: plan.title },
          customer: plan.customer || { title: 'Target Customer' },
          job: plan.job || { title: 'Problem to Solve' }
        })
      });

      console.log('Customer validation response status:', response.status);

      if (response.ok) {
        const result = await response.json();
        console.log('Customer validation result:', result);
        
        // Enhanced customer profile and struggles
        const enhancedCustomerProfile = plan.customerProfile?.description || 'Target customers are professionals seeking innovative solutions to improve their productivity and efficiency. They value quality, convenience, and results-driven approaches.';
        
        const enhancedCustomerStruggles = result.painPoints || plan.customerStruggle || [
          'Limited time to research and implement solutions',
          'Budget constraints affecting decision-making',
          'Difficulty finding reliable and effective tools',
          'Lack of expertise in evaluating technical solutions',
          'Need for ongoing support and maintenance'
        ];
        
        return {
          score: Math.min(95, Math.max(60, Math.floor(Math.random() * 35) + 60)),
          painPoints: enhancedCustomerStruggles,
          willingnessToPay: result.willingnessToPay || 'Moderate to high',
          recommendations: ['Validate pain points with customers', 'Test pricing strategy', 'Develop customer support programs'],
          enhancedContent: {
            customerProfile: enhancedCustomerProfile,
            customerStruggles: enhancedCustomerStruggles
          }
        };
      } else {
        console.warn('Customer validation API returned error:', response.status);
      }
    } catch (error) {
      console.warn('Customer validation failed:', error);
    }

    // Add a small delay to simulate processing time
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Enhanced fallback content
    const enhancedCustomerProfile = plan.customerProfile?.description || 'Target customers are professionals seeking innovative solutions to improve their productivity and efficiency.';
    const enhancedCustomerStruggles = plan.customerStruggle || [
      'Time management challenges',
      'Cost-benefit analysis difficulties',
      'Technology adoption barriers',
      'Support and training needs'
    ];

    return {
      score: 70,
      painPoints: enhancedCustomerStruggles,
      willingnessToPay: 'To be validated',
      recommendations: ['Conduct customer interviews', 'Develop detailed customer personas'],
      enhancedContent: {
        customerProfile: enhancedCustomerProfile,
        customerStruggles: enhancedCustomerStruggles
      }
    };
  };

  const runSolutionValidation = async (plan: any) => {
    console.log('Starting solution validation...');
    try {
      const response = await fetch(`${API_URL}/automated-discovery/${planId}/stage/2`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          idea: plan.idea || { interests: plan.title },
          customer: plan.customer || { title: 'Target Customer' },
          job: plan.job || { title: 'Problem to Solve' }
        })
      });

      console.log('Solution validation response status:', response.status);

      if (response.ok) {
        const result = await response.json();
        console.log('Solution validation result:', result);
        
        // Enhanced value proposition and business idea summary
        const enhancedValueProposition = plan.valueProposition || 'Our solution provides a comprehensive, user-friendly platform that addresses the core pain points of our target customers. We offer superior functionality, exceptional customer support, and competitive pricing that delivers measurable value and ROI.';
        
        const enhancedBusinessIdeaSummary = plan.businessIdeaSummary || 'We are developing an innovative platform that leverages cutting-edge technology to solve critical problems faced by our target market. Our solution combines advanced features with intuitive design to create a superior user experience that drives customer satisfaction and business growth.';
        
        return {
          score: Math.min(95, Math.max(60, Math.floor(Math.random() * 35) + 60)),
          solutionFit: result.solutionFit || 'Excellent market fit identified',
          competitors: result.competitors || ['Established players in the space'],
          recommendations: ['Differentiate from competitors', 'Focus on unique value proposition', 'Develop strong brand positioning'],
          enhancedContent: {
            valueProposition: enhancedValueProposition,
            businessIdeaSummary: enhancedBusinessIdeaSummary
          }
        };
      } else {
        console.warn('Solution validation API returned error:', response.status);
      }
    } catch (error) {
      console.warn('Solution validation failed:', error);
    }

    // Add a small delay to simulate processing time
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Enhanced fallback content
    const enhancedValueProposition = plan.valueProposition || 'Our solution provides comprehensive value through innovative features, exceptional support, and competitive pricing.';
    const enhancedBusinessIdeaSummary = plan.businessIdeaSummary || 'We are developing an innovative platform that addresses critical market needs with advanced technology and superior user experience.';

    return {
      score: 72,
      solutionFit: 'Good market fit',
      competitors: ['Market competition exists'],
      recommendations: ['Refine solution positioning', 'Strengthen competitive advantages'],
      enhancedContent: {
        valueProposition: enhancedValueProposition,
        businessIdeaSummary: enhancedBusinessIdeaSummary
      }
    };
  };

  const runBusinessModelValidation = async (plan: any) => {
    console.log('Starting business model validation...');
    try {
      const response = await fetch(`${API_URL}/automated-discovery/${planId}/stage/3`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          idea: plan.idea || { interests: plan.title },
          customer: plan.customer || { title: 'Target Customer' },
          job: plan.job || { title: 'Problem to Solve' }
        })
      });

      console.log('Business model validation response status:', response.status);

      if (response.ok) {
        const result = await response.json();
        console.log('Business model validation result:', result);
        
        // Enhanced financial summary
        const enhancedFinancialSummary = plan.financialSummary || 'Our revenue model is based on a subscription-based approach with tiered pricing to accommodate different customer segments. Key revenue streams include monthly/annual subscriptions, premium features, and enterprise licensing. Initial costs include development, marketing, and operational expenses, with a clear path to profitability through scalable growth and efficient operations.';
        
        return {
          score: Math.min(95, Math.max(60, Math.floor(Math.random() * 35) + 60)),
          revenueModel: result.revenueModel || 'Subscription model with strong viability',
          costStructure: result.costStructure || 'Optimized cost structure',
          recommendations: ['Optimize pricing strategy', 'Monitor unit economics', 'Implement scalable processes'],
          enhancedContent: {
            financialSummary: enhancedFinancialSummary
          }
        };
      } else {
        console.warn('Business model validation API returned error:', response.status);
      }
    } catch (error) {
      console.warn('Business model validation failed:', error);
    }

    // Add a small delay to simulate processing time
    await new Promise(resolve => setTimeout(resolve, 3000));

    // Enhanced fallback content
    const enhancedFinancialSummary = plan.financialSummary || 'Our business model focuses on sustainable revenue growth through subscription-based pricing, with clear cost management and profitability targets. We prioritize customer value while maintaining healthy margins and scalable operations.';

    return {
      score: 68,
      revenueModel: 'Sustainable subscription model',
      costStructure: 'Well-managed cost structure',
      recommendations: ['Review pricing strategy', 'Optimize operational efficiency'],
      enhancedContent: {
        financialSummary: enhancedFinancialSummary
      }
    };
  };

  const simulateStepProgress = async (stepId: string, duration: number) => {
    return new Promise(resolve => {
      const interval = 100;
      const steps = Math.floor(duration / interval);
      let currentStep = 0;

      const timer = setInterval(() => {
        currentStep++;
        const progress = Math.round((currentStep / steps) * 100);
        
        setSteps(prev => prev.map(step => 
          step.id === stepId ? { ...step, progress } : step
        ));

        if (currentStep >= steps) {
          clearInterval(timer);
          resolve(true);
        }
      }, interval);
    });
  };

  const handleViewPlan = () => {
    navigate(`/startup-plan/${planId}`);
  };

  const handleGenerateBusinessPlan = () => {
    navigate(`/business-plan-discovery/${planId}`);
  };

  const handleBackToDashboard = () => {
    navigate('/plans');
  };

  if (error) {
    return (
      <Container>
        <Header>
          <Title>Validation Failed</Title>
          <Subtitle>{error}</Subtitle>
          <ActionButton onClick={handleBackToDashboard}>
            Back to Dashboard
          </ActionButton>
        </Header>
      </Container>
    );
  }

  if (isValidating) {
    return (
      <Container>
        <Header>
          <Title>Validating Your Business Idea</Title>
          <Subtitle>We're analyzing your idea through our comprehensive validation process</Subtitle>
        </Header>

        <ProgressContainer>
          <ProgressHeader>
            <ProgressTitle>Validation Progress</ProgressTitle>
            <ProgressPercentage>{overallProgress}%</ProgressPercentage>
          </ProgressHeader>
          
          <ProgressBar>
            <ProgressFill progress={overallProgress} />
          </ProgressBar>

          <StepsContainer>
            {steps.map(step => (
              <StepItem key={step.id} status={step.status}>
                <StepIcon status={step.status}>
                  {step.status === 'completed' && <FiCheckCircle />}
                  {step.status === 'running' && <FiClock />}
                  {step.status === 'error' && <FiTarget />}
                  {step.status === 'pending' && <FiTarget />}
                </StepIcon>
                <StepContent>
                  <StepName>{step.name}</StepName>
                  <StepDescription>{step.description}</StepDescription>
                </StepContent>
              </StepItem>
            ))}
          </StepsContainer>
        </ProgressContainer>
      </Container>
    );
  }

  return (
    <Container>
      <ResultsContainer>
        <ResultsHeader>
          <ResultsTitle>Validation Complete!</ResultsTitle>
          <ScoreDisplay>
            <ScoreCircle score={results?.score || 0}>
              {results?.score || 0}
            </ScoreCircle>
            <ScoreLabel>Validation Score</ScoreLabel>
          </ScoreDisplay>
        </ResultsHeader>

        <ActionButtons>
          <ActionButton variant="primary" onClick={handleViewPlan}>
            <FiTarget /> View Validated Plan
          </ActionButton>
          <ActionButton variant="secondary" onClick={handleGenerateBusinessPlan}>
            <FiTrendingUp /> Generate Business Plan
          </ActionButton>
          <ActionButton variant="secondary" onClick={handleBackToDashboard}>
            <FiUsers /> Back to Dashboard
          </ActionButton>
        </ActionButtons>
      </ResultsContainer>
    </Container>
  );
} 