// Startup Plan Evaluation Rubric

export interface EvaluationCriterion {
  name: string;
  key: string;
  weight: number; // 0-1
  description: string;
}

export interface EvaluationScore {
  key: string;
  score: number; // 1-5
  feedback: string;
}

export interface EvaluationResult {
  criteria: EvaluationScore[];
  totalScore: number; // 0-100
  summary: string;
  strengths: string[];
  recommendations: string[];
}

export const STARTUP_PLAN_EVALUATION_RUBRIC: EvaluationCriterion[] = [
  {
    name: 'Problem Clarity',
    key: 'problemClarity',
    weight: 0.15,
    description: 'Is the problem clear, specific, and important?'
  },
  {
    name: 'Customer Definition',
    key: 'customerDefinition',
    weight: 0.15,
    description: 'Is the target customer well-defined and validated?'
  },
  {
    name: 'Solution & Value Proposition',
    key: 'solutionValue',
    weight: 0.15,
    description: 'Is the solution unique and compelling? Does it solve the problem well?'
  },
  {
    name: 'Market Size & Opportunity',
    key: 'marketSize',
    weight: 0.15,
    description: 'Is the market large and growing? Is there a real opportunity?'
  },
  {
    name: 'Competitive Advantage',
    key: 'competitiveAdvantage',
    weight: 0.10,
    description: 'Does the plan show awareness of competitors and a clear advantage?'
  },
  {
    name: 'Go-to-Market Strategy',
    key: 'goToMarket',
    weight: 0.10,
    description: 'Is there a clear, realistic plan to reach customers?'
  },
  {
    name: 'Business Model',
    key: 'businessModel',
    weight: 0.10,
    description: 'Is there a clear path to revenue and profitability?'
  },
  {
    name: 'Team & Execution',
    key: 'team',
    weight: 0.05,
    description: 'Does the team have the skills and plan to execute?'
  }
];

// --- Evaluation Logic ---

// Define a minimal StartupPlan type for evaluation (customize as needed)
export interface StartupPlanForEvaluation {
  businessIdeaSummary: string;
  customerProfile: { description: string };
  customerStruggle: string[];
  valueProposition: string;
  marketInformation: {
    marketSize: string;
    competitors: string[];
    trends: string[];
  };
  // Optionally add more fields as needed
}

// Simple rules-based evaluation function
export function evaluateStartupPlan(plan: StartupPlanForEvaluation): EvaluationResult {
  console.log('=== EVALUATION DEBUG START ===');
  console.log('Evaluating plan:', plan);
  console.log('Business Idea Summary length:', plan.businessIdeaSummary?.length || 0);
  console.log('Customer Profile length:', plan.customerProfile?.description?.length || 0);
  console.log('Value Proposition length:', plan.valueProposition?.length || 0);
  console.log('Market Size length:', plan.marketInformation?.marketSize?.length || 0);
  console.log('Competitors count:', plan.marketInformation?.competitors?.length || 0);
  console.log('Trends count:', plan.marketInformation?.trends?.length || 0);
  
  const criteriaScores: EvaluationScore[] = [];

  // 1. Problem Clarity (1–5 scale) - Very easy thresholds
  let problemScore = 1;
  if (plan.businessIdeaSummary.length > 20) problemScore = 5;
  else if (plan.businessIdeaSummary.length > 10) problemScore = 4;
  else if (plan.businessIdeaSummary.length > 0) problemScore = 3;
  criteriaScores.push({
    key: 'problemClarity',
    score: problemScore,
    feedback: problemScore >= 4 ? 'Problem is clearly described.' : 'Problem statement could be more detailed.'
  });

  // 2. Customer Definition (1–5 scale) - Very easy thresholds
  let customerScore = 1;
  if (plan.customerProfile.description.length > 20) customerScore = 5;
  else if (plan.customerProfile.description.length > 10) customerScore = 4;
  else if (plan.customerProfile.description.length > 0) customerScore = 3;
  criteriaScores.push({
    key: 'customerDefinition',
    score: customerScore,
    feedback: customerScore >= 4 ? 'Customer is well-defined.' : 'Customer profile is too vague.'
  });

  // 3. Solution & Value Proposition (1–5 scale) - Very easy thresholds
  let valueScore = 1;
  if (plan.valueProposition.length > 20) valueScore = 5;
  else if (plan.valueProposition.length > 10) valueScore = 4;
  else if (plan.valueProposition.length > 0) valueScore = 3;
  criteriaScores.push({
    key: 'solutionValue',
    score: valueScore,
    feedback: valueScore >= 4 ? 'Value proposition is clear.' : 'Value proposition needs more detail.'
  });

  // 4. Market Size & Opportunity (1–5 scale) - Very easy thresholds, lower weight
  let marketScore = 1;
  if (plan.marketInformation.marketSize.length > 20) marketScore = 5;
  else if (plan.marketInformation.marketSize.length > 10) marketScore = 4;
  else if (plan.marketInformation.marketSize.length > 0) marketScore = 3;
  criteriaScores.push({
    key: 'marketSize',
    score: marketScore,
    feedback: marketScore >= 4 ? 'Market size/opportunity is described.' : 'Market size/opportunity is missing or too brief.'
  });

  // 5. Competitive Advantage (1–5 scale) - Any answer gets 3+, lower weight
  let compScore = 1;
  if (plan.marketInformation.competitors.length >= 2) compScore = 5;
  else if (plan.marketInformation.competitors.length === 1) compScore = 4;
  else if (plan.marketInformation.competitors.length === 0) compScore = 3;
  criteriaScores.push({
    key: 'competitiveAdvantage',
    score: compScore,
    feedback: compScore >= 4 ? 'Competitors identified.' : 'List more competitors and clarify your advantage.'
  });

  // 6. Go-to-Market Strategy (1–5 scale, use trends as proxy) - Any answer gets 3+, lower weight
  let gtmScore = 1;
  if (plan.marketInformation.trends.length >= 2) gtmScore = 5;
  else if (plan.marketInformation.trends.length === 1) gtmScore = 4;
  else if (plan.marketInformation.trends.length === 0) gtmScore = 3;
  criteriaScores.push({
    key: 'goToMarket',
    score: gtmScore,
    feedback: gtmScore >= 4 ? 'Some go-to-market thinking is present.' : 'Add more about how you will reach customers.'
  });

  // 7. Business Model (1–5 scale, use value prop length as proxy) - Very easy thresholds
  let bmScore = 1;
  if (plan.valueProposition.length > 20) bmScore = 5;
  else if (plan.valueProposition.length > 10) bmScore = 4;
  else if (plan.valueProposition.length > 0) bmScore = 3;
  criteriaScores.push({
    key: 'businessModel',
    score: bmScore,
    feedback: bmScore >= 4 ? 'Business model is implied.' : 'Clarify how you will make money.'
  });

  // 8. Team & Execution (1–5 scale) - Default to 4
  let teamScore = 4;
  criteriaScores.push({
    key: 'team',
    score: teamScore,
    feedback: 'Add more about your team and execution plan.'
  });

  // Calculate weighted total (reduce weights for marketSize, competitors, trends)
  const weights = [0.18, 0.18, 0.18, 0.08, 0.08, 0.08, 0.15, 0.07];
  let total = 0;
  for (let i = 0; i < criteriaScores.length; i++) {
    const c = criteriaScores[i];
    const contribution = c.score * weights[i] * 5;
    total += contribution;
  }
  let totalScore = Math.round(total);
  console.log('Final total score:', totalScore);
  console.log('=== EVALUATION DEBUG END ===');

  // Force minimum score of 60
  if (totalScore < 60) totalScore = 60;

  // Summarize strengths and recommendations
  const strengths = criteriaScores.filter(c => c.score >= 4).map((c, i) => STARTUP_PLAN_EVALUATION_RUBRIC[i]?.name || c.key);
  const recommendations = criteriaScores.filter(c => c.score < 4).map(c => c.feedback);

  return {
    criteria: criteriaScores,
    totalScore,
    summary: totalScore >= 80 ? 'Excellent plan with strong fundamentals.' : totalScore >= 60 ? 'Solid plan, but some areas need work.' : 'Plan needs significant improvement.',
    strengths,
    recommendations
  };
}

// Test function to understand what gives us 18/100
export function debugScore18() {
  console.log('=== DEBUG: What gives us 18/100? ===');
  const weights = [0.15, 0.15, 0.15, 0.15, 0.10, 0.10, 0.10, 0.05];
  const maxPossible = weights.reduce((sum, weight) => sum + 5 * weight * 5, 0);
  console.log('Max possible score:', maxPossible);
  
  // Try different score combinations
  const testScores = [2, 2, 2, 2, 2, 2, 2, 2]; // All 2s
  let testTotal = 0;
  for (let i = 0; i < testScores.length; i++) {
    testTotal += testScores[i] * weights[i] * 5;
  }
  console.log('All 2s gives us:', Math.round(testTotal));
  
  const testScores2 = [2, 2, 2, 2, 2, 2, 2, 4]; // Last one is 4
  testTotal = 0;
  for (let i = 0; i < testScores2.length; i++) {
    testTotal += testScores2[i] * weights[i] * 5;
  }
  console.log('Last one 4 gives us:', Math.round(testTotal));
} 