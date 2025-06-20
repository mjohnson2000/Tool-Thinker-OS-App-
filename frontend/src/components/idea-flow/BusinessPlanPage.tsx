import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { fetchChatGPT } from '../../utils/chatgpt'; 
import { useAuth } from '../../contexts/AuthContext';
import Confetti from 'react-confetti';

// Define the shape of your data
interface BusinessPlan {
  executiveSummary: string;
  targetMarket: string[];
  problem: string;
  solution: string;
  features: string[];
  goToMarket: string[];
  nextSteps: string[];
  [key: string]: any; // To allow for dynamic key access
}

interface Recommendation {
  id: string;
  section: keyof BusinessPlan;
  recommendationText: string;
  status: 'pending' | 'improving' | 'improved';
}

const Container = styled.div`
  display: flex;
  gap: 2rem;
  padding: 2rem;
  width: 100%;
  max-width: 1400px;
  margin: 0 auto;
`;

const MainContent = styled.div`
  flex: 3;
`;

const Sidebar = styled.div`
  flex: 1;
  background: #f8f9fa;
  padding: 1.5rem;
  border-radius: 12px;
`;

const SectionCard = styled.div`
  background: #fff;
  padding: 1.5rem;
  border-radius: 12px;
  margin-bottom: 1rem;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
`;

const RecommendationCard = styled.div`
    background: #fff;
    padding: 1rem;
    border-radius: 8px;
    margin-bottom: 1rem;
    border: 1px solid #e9ecef;
`;

const SignupPrompt = styled.div`
  background: #f8f9fa;
  border-radius: 12px;
  padding: 2rem;
  margin: 2rem 0;
  text-align: center;
  border: 2px solid #e9ecef;
`;

const SignupTitle = styled.h3`
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 1rem;
  color: #212529;
`;

const SignupText = styled.p`
  color: #6c757d;
  margin-bottom: 1.5rem;
  font-size: 1.1rem;
`;

const SignupButton = styled.button`
  background: #007AFF;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 0.75rem 1.5rem;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s;
  &:hover {
    background: #0056b3;
  }
`;

const CongratsOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  pointer-events: none;
`;

const CongratsText = styled.div`
  background: rgba(255,255,255,0.95);
  border-radius: 24px;
  box-shadow: 0 8px 32px rgba(0,0,0,0.12);
  padding: 2.5rem 3.5rem;
  font-size: 2rem;
  font-weight: 700;
  color: #007AFF;
  text-align: center;
  letter-spacing: -1px;
  animation: popIn 0.5s cubic-bezier(0.4,0,0.2,1);
  @keyframes popIn {
    0% { transform: scale(0.7); opacity: 0; }
    100% { transform: scale(1); opacity: 1; }
  }
`;

interface BusinessPlanPageProps {
    idea: any;
    customer: any;
    problemDescription: string | null;
    solutionDescription: string | null;
    competitionDescription: string | null;
    onSignup: () => void;
    onLogin: () => void;
}

export function BusinessPlanPage(props: BusinessPlanPageProps) {
    const { isAuthenticated } = useAuth();
    const [plan, setPlan] = useState<BusinessPlan | null>(null);
    const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showConfetti, setShowConfetti] = useState(false);

    const createInitialPlanPrompt = (props: BusinessPlanPageProps) => {
        const { idea, customer, problemDescription, solutionDescription, competitionDescription } = props;
        const ideaPrompt = idea.existingIdeaText ? `Business Idea: ${idea.existingIdeaText}` : `Business Area: ${idea.area.title} - ${idea.area.description}`;
        const customerPrompt = customer ? (customer.title === 'Custom Customer' ? `Customer Profile: ${customer.description}` : `Customer: ${customer.title} - ${customer.description}`) : '';
        const problemPrompt = problemDescription ? `Problem Statement: ${problemDescription}` : ``;
        const solutionPrompt = solutionDescription ? `Solution: ${solutionDescription}` : ``;
        const competitionPrompt = competitionDescription ? `Competitive Advantage: ${competitionDescription}` : ``;

        return `
Given the following:
${ideaPrompt}
${customerPrompt}
${problemPrompt}
${solutionPrompt}
${competitionPrompt}
Generate a professional business plan as a single valid JSON object with these keys ONLY: executiveSummary, targetMarket, problem, solution, features, goToMarket, nextSteps. Each value should be a string or array of strings. Do NOT include any explanation, markdown, or extra text. Only output the JSON object, nothing else.`;
    }

    const createRecommendationsPrompt = (props: BusinessPlanPageProps, plan: BusinessPlan) => {
        return `
You are an expert business consultant. Analyze the following business plan, which was generated based on the user's input. Identify the top 3-5 weakest or least specific sections.

For each of these sections, provide a concise, actionable recommendation for improvement. Your output MUST be a valid JSON array of objects, where each object has two keys: "section" (the key from the business plan to improve, e.g., 'targetMarket') and "recommendationText" (your suggestion for improvement). Do not output anything else.

Business Plan:
${JSON.stringify(plan, null, 2)}
`;
    }

    const createImprovementPrompt = (props: BusinessPlanPageProps, plan: BusinessPlan, recommendation: Recommendation) => {
        return `
You are an expert business consultant. Below is a business plan and a specific recommendation for one of its sections. Rewrite ONLY the content for the specified section ('${recommendation.section}') to incorporate the recommendation.

Your output MUST be a single JSON object containing only the key for the updated section and its new value. For example: {"${recommendation.section}": ["New improved content..."]}. Do not output the full business plan.

Business Plan:
${JSON.stringify(plan, null, 2)}

Recommendation:
${recommendation.recommendationText}
`;
    }

    useEffect(() => {
        async function generateInitialPlan() {
          const initialPlanPrompt = createInitialPlanPrompt(props);
          let planObject = null;
          try {
              const response = await fetchChatGPT(initialPlanPrompt);
              planObject = typeof response === 'string' ? JSON.parse(response) : response;
          } catch(e) {
              console.error("Failed to parse business plan", e);
              // You might want to set an error state here
          }
          
          if (!planObject) return;

          setPlan(planObject);

          if (isAuthenticated) {
            const recommendationsPrompt = createRecommendationsPrompt(props, planObject);
            const recommendationsData = await fetchChatGPT(recommendationsPrompt);
            if (Array.isArray(recommendationsData)) {
              setRecommendations(recommendationsData.map((r: any) => ({ ...r, id: Math.random().toString(), status: 'pending' })));
            }
          }
      
          setIsLoading(false);
          setShowConfetti(true);
          setTimeout(() => setShowConfetti(false), 7000);
        }
        generateInitialPlan();
      }, [props, isAuthenticated]);
      
      async function handleImproveSection(recommendationId: string) {
        const recommendation = recommendations.find(r => r.id === recommendationId);
        if (!recommendation || !plan) return;
      
        setRecommendations(prev => prev.map(r => r.id === recommendationId ? { ...r, status: 'improving' } : r));
      
        const improvementPrompt = createImprovementPrompt(props, plan, recommendation);
        const updatedSection = await fetchChatGPT(improvementPrompt);
      
        setPlan(prevPlan => ({ ...prevPlan, ...updatedSection }));
      
        setRecommendations(prev => prev.map(r => r.id === recommendationId ? { ...r, status: 'improved' } : r));
      }
    
    const displayedSections = isAuthenticated ? Object.entries(plan || {}) : Object.entries(plan || {}).slice(0, 2);

    return (
        <>
        {showConfetti && (
            <CongratsOverlay>
              <Confetti width={window.innerWidth} height={window.innerHeight} recycle={false} />
              <CongratsText>Congratulations!</CongratsText>
            </CongratsOverlay>
        )}
        <Container>
          <MainContent>
            <h1>Your Business Plan</h1>
            {isLoading && <p>Generating your initial plan...</p>}
            {plan && displayedSections.map(([section, content]) => (
              <SectionCard key={section}>
                <h2>{section}</h2>
                <p>{Array.isArray(content) ? content.join(', ') : content}</p>
              </SectionCard>
            ))}
            {!isAuthenticated && !isLoading && (
              <SignupPrompt>
                <SignupTitle>View Your Full Business Plan</SignupTitle>
                <SignupText>Sign up or log in to unlock your complete business plan, including AI-powered recommendations for improvement.</SignupText>
                <SignupButton onClick={props.onSignup}>Sign Up to Continue</SignupButton>
                <p style={{marginTop: '1rem', fontSize: '0.9rem'}}>
                    Already have an account? <a href="#" onClick={(e) => { e.preventDefault(); props.onLogin(); }}>Log In</a>
                </p>
              </SignupPrompt>
            )}
          </MainContent>
          {isAuthenticated && (
            <Sidebar>
              <h2>AI Recommendations</h2>
              {recommendations.map(rec => (
                <RecommendationCard key={rec.id}>
                  <p>{rec.recommendationText}</p>
                  <button 
                    onClick={() => handleImproveSection(rec.id)}
                    disabled={rec.status !== 'pending'}
                  >
                    {rec.status === 'pending' && 'Improve this section'}
                    {rec.status === 'improving' && 'Improving...'}
                    {rec.status === 'improved' && '✅ Improved'}
                  </button>
                </RecommendationCard>
              ))}
            </Sidebar>
          )}
        </Container>
        </>
      );
} 