import express from 'express';
import { z } from 'zod';
import { chatCompletion } from '../utils/openai';

const router = express.Router();

// Industry-specific knowledge base
const INDUSTRY_CONTEXT = {
  saas: {
    marketDynamics: "SaaS markets typically have high customer acquisition costs, recurring revenue models, and network effects",
    validationMetrics: "Key metrics include CAC, LTV, churn rate, and expansion revenue",
    commonChallenges: "Sales cycles, customer onboarding, feature adoption, and competitive differentiation"
  },
  ecommerce: {
    marketDynamics: "E-commerce is highly competitive with low barriers to entry, requiring strong differentiation",
    validationMetrics: "Conversion rates, average order value, customer lifetime value, and repeat purchase rate",
    commonChallenges: "Customer acquisition costs, logistics, inventory management, and customer service"
  },
  fintech: {
    marketDynamics: "Heavily regulated with high compliance costs, but strong network effects when successful",
    validationMetrics: "Regulatory compliance, security standards, user trust, and transaction volume",
    commonChallenges: "Regulatory hurdles, security requirements, customer trust, and compliance costs"
  },
  healthtech: {
    marketDynamics: "Long sales cycles, high regulatory barriers, but strong market demand",
    validationMetrics: "FDA approval timelines, clinical validation, reimbursement pathways, and patient outcomes",
    commonChallenges: "Regulatory approval, clinical validation, insurance reimbursement, and data privacy"
  }
};

// Market research methodologies
const MARKET_RESEARCH_METHODS = {
  tamSamSom: {
    description: "Total Addressable Market (TAM), Serviceable Addressable Market (SAM), Serviceable Obtainable Market (SOM)",
    calculation: "TAM = Total market size, SAM = TAM × % you can reach, SOM = SAM × % you can capture"
  },
  customerInterviews: {
    description: "Direct customer interviews to validate pain points and willingness to pay",
    questions: "What's your biggest challenge? How do you solve this now? What would you pay for a better solution?"
  },
  competitiveAnalysis: {
    description: "Analyze competitors to understand market positioning and differentiation opportunities",
    framework: "Direct competitors, indirect competitors, potential substitutes, and market leaders"
  },
  marketTrends: {
    description: "Analyze market trends to understand growth potential and timing",
    sources: "Industry reports, Google Trends, social media sentiment, investment activity"
  }
};

// Function to get industry context
function getIndustryContext(businessIdea: string, customerDescription: string) {
  const ideaLower = businessIdea.toLowerCase();
  const customerLower = customerDescription.toLowerCase();
  
  if (ideaLower.includes('software') || ideaLower.includes('saas') || ideaLower.includes('app') || ideaLower.includes('platform')) {
    return INDUSTRY_CONTEXT.saas;
  }
  if (ideaLower.includes('ecommerce') || ideaLower.includes('marketplace') || ideaLower.includes('retail') || ideaLower.includes('shopping')) {
    return INDUSTRY_CONTEXT.ecommerce;
  }
  if (ideaLower.includes('finance') || ideaLower.includes('payment') || ideaLower.includes('banking') || ideaLower.includes('investment')) {
    return INDUSTRY_CONTEXT.fintech;
  }
  if (ideaLower.includes('health') || ideaLower.includes('medical') || ideaLower.includes('patient') || ideaLower.includes('clinical')) {
    return INDUSTRY_CONTEXT.healthtech;
  }
  
  return INDUSTRY_CONTEXT.saas; // Default
}

// Zod schemas for input validation
const PersonasSchema = z.object({
  businessIdea: z.string().min(5),
  customerDescription: z.string().min(5),
  numPersonas: z.number().min(1).max(5).default(3),
});

const FeedbackSchema = z.object({
  personas: z.array(z.object({
    id: z.string(),
    name: z.string(),
    summary: z.string(),
  })),
  stage: z.string(),
  businessIdea: z.string(),
  customerDescription: z.string(),
});

const ImproveProblemSchema = z.object({
  currentProblem: z.string(),
  customerFeedback: z.string(),
  summary: z.string(),
});

const ValidationScoreSchema = z.object({
  problemStatement: z.string(),
  customerDescription: z.string(),
});

// POST /api/automated-discovery/personas
router.post('/personas', async (req, res) => {
  const parse = PersonasSchema.safeParse(req.body);
  if (!parse.success) return res.status(400).json({ error: parse.error.errors });
  const { businessIdea, customerDescription, numPersonas } = parse.data;

  try {
    const prompt = [
      { role: 'system', content: 'You are an expert business coach and customer researcher.' },
      { role: 'user', content: `Given the following business idea and customer description, generate ${numPersonas} diverse customer personas as a JSON array. Each persona should have: id, name, summary (1-2 sentences), and a short bio.\n\nBusiness Idea: ${businessIdea}\nCustomer Description: ${customerDescription}\n\nReturn ONLY the JSON array, no explanation.` },
    ];
    const aiResponse = await chatCompletion(prompt);
    // Try to parse the JSON from the AI response
    let personas = [];
    try {
      let clean = aiResponse || '';
      clean = clean.replace(/```json|```/gi, '').trim();
      personas = JSON.parse(clean);
    } catch (e) {
      return res.status(500).json({ error: 'Failed to parse AI personas response', aiResponse });
    }
    // Add empty feedback array for each persona
    personas = personas.map((p: any, i: number) => ({
      ...p,
      id: typeof p.id === 'string' ? p.id : String(p.id ?? (i + 1)),
      feedback: []
    }));
    res.json({ personas });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'OpenAI error' });
  }
});

// POST /api/automated-discovery/feedback
router.post('/feedback', async (req, res) => {
  const parse = FeedbackSchema.safeParse(req.body);
  if (!parse.success) return res.status(400).json({ error: parse.error.errors });
  const { personas, stage, businessIdea, customerDescription } = parse.data;

  try {
    // Generate feedback for each persona
    const feedback = await Promise.all(personas.map(async (persona) => {
      const prompt = [
        { role: 'system', content: `You are acting as a customer persona for a business discovery process. Your persona: ${persona.name} - ${persona.summary}` },
        { role: 'user', content: `Given the business idea: "${businessIdea}" and customer description: "${customerDescription}", provide 2-3 bullet points of feedback for the stage: "${stage}". Be concise and realistic. Return ONLY a JSON array of bullet points.` },
      ];
      let feedbackArr: string[] = [];
      try {
        const aiResponse = await chatCompletion(prompt) || '';
        // Clean and parse the response as an array of bullet points
        let clean = aiResponse.replace(/```json|```/gi, '').trim();
        try {
          const parsed = JSON.parse(clean);
          if (Array.isArray(parsed)) {
            feedbackArr = parsed;
          } else if (typeof parsed === 'string') {
            // If it's a string, split by line breaks or bullet points
            feedbackArr = parsed.split(/\n|•|\-/).map(s => s.trim()).filter(Boolean);
          } else {
            feedbackArr = [clean];
          }
        } catch (e) {
          // If not JSON, split by line breaks or bullet points
          feedbackArr = clean.split(/\n|•|\-/).map(s => s.trim()).filter(Boolean);
        }
      } catch (e) {
        feedbackArr = ['Could not generate feedback.'];
      }
      return { personaId: persona.id, feedback: feedbackArr };
    }));

    // Generate collective summary
    const summaryPrompt = [
      { role: 'system', content: 'You are an expert business coach.' },
      { role: 'user', content: `Given the following business idea: "${businessIdea}", customer description: "${customerDescription}", and the following customer personas: ${personas.map(p => `${p.name} - ${p.summary}`).join('; ')}. For the stage: "${stage}", summarize the main feedback themes in 2-3 sentences. Be concise and actionable.` },
    ];
    let summary = '';
    try {
      summary = await chatCompletion(summaryPrompt) || '';
    } catch (e) {
      summary = 'Could not generate summary.';
    }

    // Generate validation score for Problem Validation stage
    let validationScore = null;
    if (stage === 'Problem Validation') {
      const industryContext = getIndustryContext(businessIdea, customerDescription);
      
      const validationPrompt = [
        { 
          role: 'system', 
          content: `You are an expert business validator with deep knowledge of:
          - Jobs-to-be-Done framework methodology
          - Market sizing techniques (TAM/SAM/SOM)
          - Customer pain point validation methods
          - Industry-specific market dynamics
          - Startup validation best practices
          
          Industry Context: ${industryContext.marketDynamics}
          Key Validation Metrics: ${industryContext.validationMetrics}
          Common Challenges: ${industryContext.commonChallenges}
          
          Use this knowledge to provide accurate, specific assessments. Consider:
          - Industry benchmarks and standards
          - Market maturity and competition levels
          - Customer acquisition costs and willingness to pay
          - Regulatory and technical barriers
          - Growth potential and market trends
          
          Market Research Methods to Consider:
          - TAM/SAM/SOM: ${MARKET_RESEARCH_METHODS.tamSamSom.description}
          - Customer Interviews: ${MARKET_RESEARCH_METHODS.customerInterviews.description}
          - Competitive Analysis: ${MARKET_RESEARCH_METHODS.competitiveAnalysis.description}
          - Market Trends: ${MARKET_RESEARCH_METHODS.marketTrends.description}`
        },
        { 
          role: 'user', 
          content: `Rate this problem statement: "${businessIdea}" for customer: "${customerDescription}" based on these criteria:

1. Clarity (1-10): How clear and specific is the problem statement?
   - 1-3: Vague, unclear what problem is being solved
   - 4-6: Somewhat clear but could be more specific
   - 7-10: Crystal clear, specific problem with measurable impact

2. Pain Level (1-10): How painful is this problem for the customer?
   - 1-3: Minor inconvenience, customers can work around it
   - 4-6: Moderate frustration, causes some stress
   - 7-10: Significant pain, customers actively seek solutions

3. Market Size (1-10): How many people have this problem?
   - 1-3: Very niche, limited number affected
   - 4-6: Moderate market, affects specific segment
   - 7-10: Large market, affects many people across segments

4. Urgency (1-10): How urgent is solving this problem?
   - 1-3: Low urgency, can wait for solution
   - 4-6: Moderate urgency, would like solution soon
   - 7-10: High urgency, need solution immediately

5. Specificity (1-10): How specific and actionable is the problem?
   - 1-3: Too broad, hard to build solution for
   - 4-6: Somewhat specific, could be more actionable
   - 7-10: Very specific, clear path to solution

Also provide:
- Overall score (average of all criteria)
- 3 specific recommendations for improvement
- Confidence level (high/medium/low)
- Whether to proceed (score >= 7 and confidence high/medium)

Return as JSON:
{
  "score": number,
  "criteria": {
    "clarity": number,
    "painLevel": number,
    "marketSize": number,
    "urgency": number,
    "specificity": number
  },
  "recommendations": [string],
  "confidence": "high"|"medium"|"low",
  "shouldProceed": boolean
}` },
      ];
      try {
        const validationResponse = await chatCompletion(validationPrompt) || '';
        const cleanResponse = validationResponse.replace(/```json|```/gi, '').trim();
        validationScore = JSON.parse(cleanResponse);
      } catch (e) {
        console.error('Failed to generate validation score:', e);
      }
    }

    res.json({ feedback, summary, validationScore });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'OpenAI error' });
  }
});

// POST /api/automated-discovery/improve-problem
router.post('/improve-problem', async (req, res) => {
  const parse = ImproveProblemSchema.safeParse(req.body);
  if (!parse.success) return res.status(400).json({ error: parse.error.errors });
  const { currentProblem, customerFeedback, summary } = parse.data;

  try {
    const prompt = [
      { 
        role: 'system', 
        content: `You are an expert in the Jobs-to-be-Done framework and business problem validation. Your goal is to generate diverse, high-quality problem statement variations that will score higher on validation criteria.

Use these strategies to create better variations:
- Focus on specific customer types and demographics
- Emphasize measurable pain points and costs
- Highlight urgency and time sensitivity
- Use concrete, actionable language
- Consider different market segments and use cases
- Vary the emotional and functional aspects of the problem` 
      },
      { 
        role: 'user', 
        content: `Generate 30 different improved versions of this problem statement, each optimized to maximize validation scores:

Current Problem: ${currentProblem}
Customer Feedback: ${customerFeedback}
Summary: ${summary}

IMPORTANT: Each improved version must score HIGHER on these criteria:
- Clarity (1-10): How clear and specific is the problem statement?
- Pain Level (1-10): How painful is this problem for the customer?
- Market Size (1-10): How many people have this problem?
- Urgency (1-10): How urgent is solving this problem?
- Specificity (1-10): How specific and actionable is the problem?

Generate 30 variations using these different approaches:
- Focus on PAIN and URGENCY (5 variations)
- Focus on CLARITY and SPECIFICITY (5 variations)
- Focus on MARKET SIZE and BROAD APPEAL (5 variations)
- Focus on EMOTIONAL IMPACT (5 variations)
- Focus on FUNCTIONAL EFFICIENCY (5 variations)
- Focus on COST and RESOURCE IMPACT (5 variations)

Each variation should be unique and target different aspects of the problem. Use specific customer types, measurable impacts, and concrete scenarios.

Return ONLY a JSON array of 30 problem statements:
[
  "Variation 1: [Specific customer type] struggle with [specific job/outcome]",
  "Variation 2: [Specific customer type] struggle with [specific job/outcome]",
  ...
  "Variation 30: [Specific customer type] struggle with [specific job/outcome]"
]` },
    ];
    
    const aiResponse = await chatCompletion(prompt);
    let variations: string[] = [];
    
    try {
      const cleanResponse = (aiResponse || '').replace(/```json|```/gi, '').trim();
      variations = JSON.parse(cleanResponse);
      
      // Ensure we have exactly 30 variations, pad with fallbacks if needed
      if (variations.length < 30) {
        console.log(`Generated ${variations.length} variations, padding to 30`);
        const fallbackVariations = generateFallbackVariations(currentProblem, 30 - variations.length);
        variations = [...variations, ...fallbackVariations];
      }
      
      // Limit to 30 if we got more
      variations = variations.slice(0, 30);
      
    } catch (e) {
      console.error('Failed to parse variations, using fallback:', e);
      // Fallback to single improvement
      const fallbackPrompt = [
        { role: 'system', content: 'You are an expert in the Jobs-to-be-Done framework and business problem validation.' },
        { role: 'user', content: `Improve this problem statement while ensuring it scores HIGHER on validation criteria:

Current Problem: ${currentProblem}
Customer Feedback: ${customerFeedback}
Summary: ${summary}

IMPORTANT: The improved statement must score HIGHER on these criteria:
- Clarity (1-10): How clear and specific is the problem statement?
- Pain Level (1-10): How painful is this problem for the customer?
- Market Size (1-10): How many people have this problem?
- Urgency (1-10): How urgent is solving this problem?
- Specificity (1-10): How specific and actionable is the problem?

Return ONLY a single sentence problem statement in this format:
"[Customer type] struggle with [specific job/outcome they want to achieve]."` },
      ];
      
      const fallbackResponse = await chatCompletion(fallbackPrompt);
      let improvedProblemStatement = fallbackResponse?.trim() || '';
      improvedProblemStatement = improvedProblemStatement.replace(/^["']|["']$/g, '');
      
      if (!improvedProblemStatement) {
        // Final fallback
        improvedProblemStatement = currentProblem
          .replace(/We aim to build|We aim to develop|We are building|We are developing/gi, '')
          .replace(/specifically designed for|designed for|targeting|focused on/gi, '')
          .replace(/The product will focus on|The system will|The solution will/gi, '')
          .replace(/to ensure|to provide|to deliver/gi, '')
          .replace(/\.$/, '')
          .trim();
        
        improvedProblemStatement = `People struggle with ${improvedProblemStatement.toLowerCase()}.`;
      }
      
      variations = [improvedProblemStatement];
    }

    res.json({ improvedProblemStatement: variations[0], variations });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'OpenAI error' });
  }
});

// Helper function to generate fallback variations
function generateFallbackVariations(currentProblem: string, count: number): string[] {
  const baseProblem = currentProblem
    .replace(/We aim to build|We aim to develop|We are building|We are developing/gi, '')
    .replace(/specifically designed for|designed for|targeting|focused on/gi, '')
    .replace(/The product will focus on|The system will|The solution will/gi, '')
    .replace(/to ensure|to provide|to deliver/gi, '')
    .replace(/\.$/, '')
    .trim();
  
  const customerTypes = [
    'Small business owners', 'Entrepreneurs', 'Managers', 'Professionals',
    'Startup founders', 'Team leaders', 'Individual contributors', 'Freelancers',
    'Remote workers', 'Office workers', 'Service providers', 'Consultants'
  ];
  
  const variations: string[] = [];
  for (let i = 0; i < count; i++) {
    const customerType = customerTypes[i % customerTypes.length];
    const variation = `${customerType} struggle with ${baseProblem.toLowerCase()}.`;
    variations.push(variation);
  }
  
  return variations;
}

// POST /api/automated-discovery/validation-score
router.post('/validation-score', async (req, res) => {
  const parse = ValidationScoreSchema.safeParse(req.body);
  if (!parse.success) return res.status(400).json({ error: parse.error.errors });
  const { problemStatement, customerDescription } = parse.data;

  try {
    const validationPrompt = [
      { role: 'system', content: 'You are an expert business validator. Rate problem statements on a scale of 1-10 for each criterion.' },
      { role: 'user', content: `Rate this problem statement: "${problemStatement}" for customer: "${customerDescription}" based on these criteria:
1. Clarity (1-10): How clear and specific is the problem statement?
2. Pain Level (1-10): How painful is this problem for the customer?
3. Market Size (1-10): How many people have this problem?
4. Urgency (1-10): How urgent is solving this problem?
5. Specificity (1-10): How specific and actionable is the problem?

Also provide:
- Overall score (average of all criteria)
- 3 specific recommendations for improvement
- Confidence level (high/medium/low)
- Whether to proceed (score >= 7 and confidence high/medium)

Return as JSON:
{
  "score": number,
  "criteria": {
    "clarity": number,
    "painLevel": number,
    "marketSize": number,
    "urgency": number,
    "specificity": number
  },
  "recommendations": [string],
  "confidence": "high"|"medium"|"low",
  "shouldProceed": boolean
}` },
    ];
    
    try {
      const validationResponse = await chatCompletion(validationPrompt) || '';
      const cleanResponse = validationResponse.replace(/```json|```/gi, '').trim();
      const validationScore = JSON.parse(cleanResponse);
      res.json({ validationScore });
    } catch (e) {
      console.error('Failed to generate validation score:', e);
      res.status(500).json({ error: 'Failed to generate validation score' });
    }
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'OpenAI error' });
  }
});

export default router; 