import express from 'express';
import { z } from 'zod';
import { chatCompletion } from '../utils/openai';
import { BusinessPlan } from '../models/BusinessPlan';

const router = express.Router();

// Enhanced persona generation with behavioral patterns and validation frameworks
const ENHANCED_PERSONA_TEMPLATES = {
  earlyAdopter: {
    name: "Early Adopter",
    characteristics: [
      "Willing to try new solutions",
      "Values innovation and efficiency",
      "Has budget for new tools",
      "Influences others' decisions",
      "Provides detailed feedback"
    ],
    painPoints: [
      "Frustrated with existing solutions",
      "Wants to be ahead of the curve",
      "Needs measurable ROI",
      "Concerned about integration complexity"
    ],
    decisionFactors: [
      "Innovation potential",
      "Time savings",
      "Competitive advantage",
      "Ease of implementation"
    ]
  },
  pragmaticUser: {
    name: "Pragmatic User",
    characteristics: [
      "Waits for proven solutions",
      "Focuses on reliability and stability",
      "Cost-conscious",
      "Requires clear ROI",
      "Prefers gradual adoption"
    ],
    painPoints: [
      "Risk-averse to new solutions",
      "Needs extensive proof of value",
      "Concerned about disruption",
      "Requires strong support"
    ],
    decisionFactors: [
      "Proven track record",
      "Clear cost-benefit analysis",
      "Minimal disruption",
      "Strong customer support"
    ]
  },
  budgetConstrained: {
    name: "Budget Constrained",
    characteristics: [
      "Limited budget for new tools",
      "Focuses on essential features",
      "Values free trials",
      "Compares multiple options",
      "Negotiates pricing"
    ],
    painPoints: [
      "Cannot afford expensive solutions",
      "Needs to justify every expense",
      "Worries about hidden costs",
      "Requires flexible pricing"
    ],
    decisionFactors: [
      "Clear pricing structure",
      "Free trial availability",
      "Essential feature coverage",
      "Scalable pricing model"
    ]
  },
  enterpriseUser: {
    name: "Enterprise User",
    characteristics: [
      "Works in large organizations",
      "Requires compliance and security",
      "Needs integration capabilities",
      "Involves multiple stakeholders",
      "Long sales cycles"
    ],
    painPoints: [
      "Complex approval processes",
      "Integration with existing systems",
      "Security and compliance concerns",
      "Change management challenges"
    ],
    decisionFactors: [
      "Enterprise-grade security",
      "Integration capabilities",
      "Compliance certifications",
      "Scalability and support"
    ]
  }
};

// Industry-specific persona variations
const INDUSTRY_PERSONA_VARIATIONS = {
  saas: {
    roles: ["Product Manager", "Engineering Manager", "Operations Director", "Growth Manager"],
    companySizes: ["Startup (1-50)", "Scale-up (51-200)", "Mid-market (201-1000)", "Enterprise (1000+)"],
    decisionMakers: ["CTO", "VP Engineering", "Head of Product", "Operations Manager"]
  },
  ecommerce: {
    roles: ["E-commerce Manager", "Marketing Director", "Operations Manager", "Customer Success Manager"],
    companySizes: ["Small Business", "Mid-size Retailer", "Large E-commerce", "Marketplace"],
    decisionMakers: ["CEO", "Marketing Director", "Operations Director", "Customer Success Lead"]
  },
  fintech: {
    roles: ["Compliance Officer", "Product Manager", "Risk Manager", "Operations Director"],
    companySizes: ["Fintech Startup", "Regional Bank", "National Bank", "International Bank"],
    decisionMakers: ["CCO", "Head of Product", "Risk Director", "Operations VP"]
  },
  healthtech: {
    roles: ["Clinical Director", "IT Manager", "Operations Manager", "Quality Assurance"],
    companySizes: ["Small Practice", "Multi-location Practice", "Hospital System", "Healthcare Network"],
    decisionMakers: ["Medical Director", "CIO", "Operations Director", "Quality Manager"]
  }
};

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
    role: z.string().optional(),
    companySize: z.string().optional(),
    industry: z.string().optional(),
    age: z.string().optional(),
    experience: z.string().optional(),
    budget: z.string().optional(),
    painPoints: z.array(z.string()).optional(),
    goals: z.array(z.string()).optional(),
    decisionFactors: z.array(z.string()).optional(),
    objections: z.array(z.string()).optional(),
    communicationStyle: z.string().optional(),
    techSavviness: z.string().optional(),
    validationQuestions: z.array(z.string()).optional(),
  })),
  stage: z.string(),
  businessIdea: z.string(),
  customerDescription: z.string(),
});

const AutoImproveSchema = z.object({
  businessIdea: z.string().min(5),
  customerDescription: z.string().min(5),
  currentValidationScore: z.number().min(0).max(10),
  validationCriteria: z.object({
    // Problem Discovery criteria
    problemIdentification: z.number().optional(),
    problemValidation: z.number().optional(),
    problemScope: z.number().optional(),
    problemUrgency: z.number().optional(),
    problemImpact: z.number().optional(),
    // Customer Profile criteria
    customerClarity: z.number().optional(),
    customerSpecificity: z.number().optional(),
    customerRelevance: z.number().optional(),
    customerAccessibility: z.number().optional(),
    customerValue: z.number().optional(),
    // Customer Struggle criteria
    struggleIdentification: z.number().optional(),
    struggleValidation: z.number().optional(),
    struggleUrgency: z.number().optional(),
    struggleFrequency: z.number().optional(),
    struggleImpact: z.number().optional(),
    // Solution Fit criteria
    solutionAlignment: z.number().optional(),
    solutionEffectiveness: z.number().optional(),
    solutionDifferentiation: z.number().optional(),
    solutionValue: z.number().optional(),
    solutionFeasibility: z.number().optional(),
    // Business Model criteria
    modelViability: z.number().optional(),
    revenuePotential: z.number().optional(),
    costEfficiency: z.number().optional(),
    competitiveAdvantage: z.number().optional(),
    scalability: z.number().optional(),
    // Market Validation criteria
    marketSize: z.number().optional(),
    marketDemand: z.number().optional(),
    marketTiming: z.number().optional(),
    competitiveLandscape: z.number().optional(),
    marketAccess: z.number().optional(),
  }),
  recommendations: z.array(z.string()),
  discoveredProblems: z.array(z.string()).optional(),
  planData: z.object({
    sections: z.record(z.string()).optional(),
  }).optional(),
  businessPlanId: z.string().optional(),
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
    // Get industry context for more specific personas
    const industryContext = getIndustryContext(businessIdea, customerDescription);
    const industryKey = Object.keys(INDUSTRY_PERSONA_VARIATIONS).find(key => 
      businessIdea.toLowerCase().includes(key) || customerDescription.toLowerCase().includes(key)
    ) || 'saas';

    const industryVariations = INDUSTRY_PERSONA_VARIATIONS[industryKey as keyof typeof INDUSTRY_PERSONA_VARIATIONS];

    const enhancedPrompt = [
      { 
        role: 'system', 
        content: `You are an expert customer researcher and business strategist with deep knowledge of customer validation and market research. Your goal is to create highly realistic, detailed customer personas that would provide authentic feedback for business idea validation.

Key Principles:
1. Create personas based on REAL customer archetypes, not generic templates
2. Include specific behavioral patterns, pain points, and decision-making criteria
3. Ensure personas represent different segments of the target market
4. Make personas specific enough to provide actionable feedback
5. Include realistic constraints, budgets, and organizational contexts

Industry Context: ${industryContext.marketDynamics}
Common Challenges: ${industryContext.commonChallenges}
Validation Metrics: ${industryContext.validationMetrics}

Use these persona templates as inspiration but create unique, realistic personas:
${JSON.stringify(ENHANCED_PERSONA_TEMPLATES, null, 2)}

Industry-specific variations for ${industryKey}:
- Roles: ${industryVariations.roles.join(', ')}
- Company Sizes: ${industryVariations.companySizes.join(', ')}
- Decision Makers: ${industryVariations.decisionMakers.join(', ')}

Create ${numPersonas} diverse, realistic personas that would actually exist in this market.`
      },
      { 
        role: 'user', 
        content: `Generate ${numPersonas} highly detailed customer personas for this business idea:

Business Idea: ${businessIdea}
Customer Description: ${customerDescription}
Industry: ${industryKey}

For each persona, include:
1. id: unique identifier
2. name: realistic full name
3. role: specific job title
4. companySize: realistic company size
5. industry: specific industry or sector
6. age: realistic age range
7. experience: years of experience in role
8. budget: realistic budget constraints
9. painPoints: 3-4 specific pain points they experience
10. goals: 2-3 specific goals they're trying to achieve
11. decisionFactors: 3-4 factors that influence their decisions
12. objections: 2-3 likely objections they would have
13. communicationStyle: how they prefer to communicate
14. techSavviness: their comfort level with technology
15. summary: 2-3 sentence bio that captures their essence
16. validationQuestions: 3-4 specific questions they would ask to validate this solution

Make each persona unique and realistic. Avoid generic descriptions. Focus on specific, actionable details that would help validate the business idea.

Return ONLY a JSON array of personas.`
      },
    ];

          const aiResponse = await chatCompletion(enhancedPrompt, 'gpt-4o-mini', 0.7);
    let personas = [];
    
    try {
      let clean = aiResponse || '';
      clean = clean.replace(/```json|```/gi, '').trim();
      personas = JSON.parse(clean);
      
      // Validate and enhance personas
      personas = personas.map((p: any, i: number) => ({
        id: typeof p.id === 'string' ? p.id : String(p.id ?? (i + 1)),
        name: p.name || `Persona ${i + 1}`,
        role: p.role || 'Business Professional',
        companySize: p.companySize || 'Small to Medium',
        industry: p.industry || industryKey,
        age: p.age || '30-45',
        experience: p.experience || '5-10 years',
        budget: p.budget || 'Moderate',
        painPoints: Array.isArray(p.painPoints) ? p.painPoints : ['General frustration with current solutions'],
        goals: Array.isArray(p.goals) ? p.goals : ['Improve efficiency', 'Reduce costs'],
        decisionFactors: Array.isArray(p.decisionFactors) ? p.decisionFactors : ['ROI', 'Ease of use'],
        objections: Array.isArray(p.objections) ? p.objections : ['Cost concerns', 'Implementation time'],
        communicationStyle: p.communicationStyle || 'Direct and data-driven',
        techSavviness: p.techSavviness || 'Moderate',
        summary: p.summary || `${p.name} is a ${p.role} looking to improve their business processes.`,
        validationQuestions: Array.isArray(p.validationQuestions) ? p.validationQuestions : [
          'How does this solve my specific problem?',
          'What is the ROI and timeline?',
          'How easy is it to implement?'
        ],
        feedback: [],
        feedbackQuality: 'pending' // Track feedback quality
      }));
    } catch (e) {
      console.error('Failed to parse enhanced personas:', e);
      // Fallback to basic personas
      personas = [
        {
          id: '1',
          name: 'Sarah Chen',
          role: 'Product Manager',
          companySize: 'Scale-up (51-200)',
          industry: industryKey,
          age: '32',
          experience: '7 years',
          budget: '$10k-50k annually',
          painPoints: ['Manual processes slowing down development', 'Lack of data-driven insights', 'Team collaboration issues'],
          goals: ['Increase development velocity', 'Improve product quality', 'Better team alignment'],
          decisionFactors: ['Time to value', 'Integration ease', 'Team adoption'],
          objections: ['Learning curve for team', 'Integration complexity', 'Ongoing costs'],
          communicationStyle: 'Data-driven and collaborative',
          techSavviness: 'High',
          summary: 'Sarah is a data-driven Product Manager at a growing tech company, focused on improving team efficiency and product quality.',
          validationQuestions: [
            'How quickly can we see results?',
            'What does the implementation process look like?',
            'How does this integrate with our existing tools?'
          ],
          feedback: [],
          feedbackQuality: 'pending'
        },
        {
          id: '2',
          name: 'Michael Rodriguez',
          role: 'Operations Director',
          companySize: 'Mid-market (201-1000)',
          industry: industryKey,
          age: '45',
          experience: '15 years',
          budget: '$25k-100k annually',
          painPoints: ['Inefficient workflows', 'High operational costs', 'Difficulty scaling processes'],
          goals: ['Reduce operational costs', 'Improve efficiency', 'Scale operations'],
          decisionFactors: ['Cost savings', 'ROI timeline', 'Scalability'],
          objections: ['High upfront costs', 'Disruption to current processes', 'Training requirements'],
          communicationStyle: 'Results-oriented and direct',
          techSavviness: 'Moderate',
          summary: 'Michael is a seasoned Operations Director focused on optimizing business processes and reducing costs.',
          validationQuestions: [
            'What is the expected ROI and timeline?',
            'How disruptive is the implementation?',
            'What training and support is provided?'
          ],
          feedback: [],
          feedbackQuality: 'pending'
        },
        {
          id: '3',
          name: 'Emily Watson',
          role: 'Startup Founder',
          companySize: 'Startup (1-50)',
          industry: industryKey,
          age: '28',
          experience: '3 years',
          budget: '$5k-20k annually',
          painPoints: ['Limited resources', 'Need to move fast', 'Competitive pressure'],
          goals: ['Rapid growth', 'Market validation', 'Efficient operations'],
          decisionFactors: ['Speed of implementation', 'Cost-effectiveness', 'Competitive advantage'],
          objections: ['Limited budget', 'Time constraints', 'Risk of new solutions'],
          communicationStyle: 'Fast-paced and direct',
          techSavviness: 'High',
          summary: 'Emily is a driven startup founder looking for solutions that can help her company grow quickly and efficiently.',
          validationQuestions: [
                         'How quickly can we implement this?',
             'What is the cost vs. benefit?',
             'How does this give us a competitive edge?'
          ],
          feedback: [],
          feedbackQuality: 'pending'
        }
      ];
    }

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
    // Generate problem-focused feedback for each persona
    const feedback = await Promise.all(personas.map(async (persona) => {
      let enhancedPrompt;
      
      if (stage === 'Problem Validation') {
        // Problem Discovery Mode
        enhancedPrompt = [
          { 
            role: 'system', 
            content: `You are ${persona.name}, a ${persona.role || 'Business Professional'} at a ${persona.companySize || 'company'} in the ${persona.industry || 'business'} industry. You have ${persona.experience || 'several years'} of experience and are ${persona.age || 'in your career'}.

Your Profile:
- Budget: ${persona.budget || 'Moderate budget for business solutions'}
- Pain Points: ${persona.painPoints?.join(', ') || 'General business inefficiencies and process challenges'}
- Goals: ${persona.goals?.join(', ') || 'Improve efficiency and reduce costs'}
- Decision Factors: ${persona.decisionFactors?.join(', ') || 'ROI, ease of implementation, and team adoption'}
- Communication Style: ${persona.communicationStyle || 'Direct and results-oriented'}
- Tech Savviness: ${persona.techSavviness || 'Moderate'}

You are a PROBLEM RESEARCHER. Your job is to:
1. Identify what problems this business idea is trying to solve
2. Validate if these problems actually exist in your world
3. Discover related problems you face that aren't addressed
4. Assess the urgency and impact of these problems
5. Determine if you would pay to solve these problems

Be brutally honest about what problems you actually face vs. what the business idea assumes.`
          },
          { 
            role: 'user', 
            content: `As ${persona.name}, analyze this business idea for PROBLEM DISCOVERY:

Business Idea: "${businessIdea}"
Customer Description: "${customerDescription}"

Your task is to:
1. What specific problems do you think this business idea is trying to solve?
2. Do you actually experience these problems? (Be honest!)
3. What related problems do you face that this idea doesn't address?
4. How urgent are these problems for you? (1-10 scale)
5. How much would you pay to solve these problems?
6. What are your current workarounds for these problems?

Provide 4-5 specific insights about the problems this business idea addresses (or fails to address). Be authentic and realistic.`
          },
        ];
      } else {
        // Regular validation mode for other stages
        enhancedPrompt = [
          { 
            role: 'system', 
            content: `You are ${persona.name}, a ${persona.role || 'Business Professional'} at a ${persona.companySize || 'company'} in the ${persona.industry || 'business'} industry. You have ${persona.experience || 'several years'} of experience and are ${persona.age || 'in your career'}.

Your Profile:
- Budget: ${persona.budget || 'Moderate budget for business solutions'}
- Pain Points: ${persona.painPoints?.join(', ') || 'General business inefficiencies and process challenges'}
- Goals: ${persona.goals?.join(', ') || 'Improve efficiency and reduce costs'}
- Decision Factors: ${persona.decisionFactors?.join(', ') || 'ROI, ease of implementation, and team adoption'}
- Likely Objections: ${persona.objections?.join(', ') || 'Cost concerns and implementation time'}
- Communication Style: ${persona.communicationStyle || 'Direct and results-oriented'}
- Tech Savviness: ${persona.techSavviness || 'Moderate'}

Your Validation Questions:
${persona.validationQuestions?.map((q: string, i: number) => `${i + 1}. ${q}`).join('\n') || '1. How does this solve my specific problem?\n2. What is the ROI and timeline?\n3. How easy is it to implement?'}

You are evaluating a business idea that claims to solve problems for customers like you. Provide authentic, realistic feedback based on your specific profile, pain points, and decision-making criteria. Be honest about whether this solution would actually work for someone in your position with your constraints.

Focus on:
1. Whether this addresses YOUR specific pain points
2. Whether it fits YOUR budget and constraints
3. Whether it aligns with YOUR goals and decision factors
4. What objections YOU would have
5. What questions YOU would ask to validate this solution`
          },
          { 
            role: 'user', 
            content: `As ${persona.name}, evaluate this business idea for the "${stage}" stage:

Business Idea: "${businessIdea}"
Customer Description: "${customerDescription}"

Provide 3-4 specific, realistic feedback points based on your profile. Consider:
- Does this address your specific pain points?
- Is it within your budget and constraints?
- Does it align with your goals and decision factors?
- What objections would you have?
- What questions would you ask to validate this?

Be authentic and realistic. If you have concerns, voice them. If you see potential, explain why. Base your feedback on your specific role, company size, industry, and personal characteristics.

Return ONLY a JSON array of feedback points.`
          },
        ];
      }
      
      let feedbackArr: string[] = [];
      try {
        const aiResponse = await chatCompletion(enhancedPrompt, 'gpt-4o-mini', 0.8) || '';
        let clean = aiResponse.replace(/```json|```/gi, '').trim();
        try {
          const parsed = JSON.parse(clean);
          if (Array.isArray(parsed)) {
            feedbackArr = parsed;
          } else if (typeof parsed === 'string') {
            feedbackArr = parsed.split(/\n|•|\-/).map(s => s.trim()).filter(Boolean);
          } else {
            feedbackArr = [clean];
          }
        } catch (e) {
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

    // Generate validation scores for different stages
    let validationScore = null;
    if (stage === 'Problem Discovery') {
      const industryContext = getIndustryContext(businessIdea, customerDescription);
      
      const problemDiscoveryPrompt = [
        { 
          role: 'system', 
          content: `You are Sarah Chen, a seasoned entrepreneur and business coach with 15+ years of experience in:

ENTREPRENEURIAL EXPERTISE:
- Founded and scaled 3 successful startups (2 exits, 1 IPO)
- Coached 200+ entrepreneurs through Y Combinator, Techstars, and 500 Startups
- Expert in Lean Startup methodology and Customer Development
- Specialized in Blue Ocean Strategy and disruptive innovation
- Deep experience in startup incubation and accelerator programs

BUSINESS VALIDATION EXPERTISE:
- Jobs-to-be-Done framework implementation
- Customer pain point identification and validation
- Market research and customer interview techniques
- Problem-solution fit analysis
- Startup validation best practices
- MVP development and testing strategies

INDUSTRY KNOWLEDGE:
Industry Context: ${industryContext.marketDynamics}
Key Validation Metrics: ${industryContext.validationMetrics}
Common Challenges: ${industryContext.commonChallenges}

YOUR APPROACH:
You evaluate business ideas through the lens of an experienced entrepreneur who has:
- Built products from idea to market
- Conducted hundreds of customer interviews
- Made critical go/no-go decisions
- Seen what makes startups succeed or fail
- Understood the difference between real problems and perceived problems

Your job is to DISCOVER and VALIDATE problems, not just rate an existing problem statement.
Focus on:
- What problems does this business idea actually solve?
- Are these real problems that customers face?
- What related problems are being missed?
- How urgent and impactful are these problems?
- What evidence supports these problems exist?

Market Research Methods to Consider:
- Customer Interviews: ${MARKET_RESEARCH_METHODS.customerInterviews.description}
- Competitive Analysis: ${MARKET_RESEARCH_METHODS.competitiveAnalysis.description}
- Market Trends: ${MARKET_RESEARCH_METHODS.marketTrends.description}
- TAM/SAM/SOM: ${MARKET_RESEARCH_METHODS.tamSamSom.description}`
        },
        { 
          role: 'user', 
          content: `As an experienced entrepreneur and business coach, analyze this business idea for PROBLEM DISCOVERY:

Business Idea: "${businessIdea}"
Customer Description: "${customerDescription}"

Based on your experience building startups and coaching entrepreneurs, evaluate this business idea through the lens of:

1. Problem Identification (1-10): How clearly does this identify specific problems?
   - 1-3: Vague, unclear what problems are being solved (like most failed startups)
   - 4-6: Somewhat clear problems identified (typical early-stage confusion)
   - 7-10: Crystal clear, specific problems with evidence (like successful startups)

2. Problem Validation (1-10): How well does this validate that problems actually exist?
   - 1-3: Assumes problems exist without validation (common startup mistake)
   - 4-6: Some validation but could be stronger (needs more customer interviews)
   - 7-10: Strong evidence that problems are real and impactful (validated through customer development)

3. Problem Scope (1-10): How well does this understand the full scope of problems?
   - 1-3: Addresses surface-level problems only (missing core issues)
   - 4-6: Addresses some core problems (partial understanding)
   - 7-10: Comprehensive understanding of problem landscape (like successful founders)

4. Problem Urgency (1-10): How urgent are the problems being addressed?
   - 1-3: Low urgency, customers can wait (not a viable startup)
   - 4-6: Moderate urgency, customers want solutions soon (potential market)
   - 7-10: High urgency, customers need solutions now (strong market pull)

5. Problem Impact (1-10): How impactful are these problems on customers?
   - 1-3: Minor inconvenience, low willingness to pay (not worth building)
   - 4-6: Moderate impact, some willingness to pay (viable business)
   - 7-10: High impact, strong willingness to pay (strong business opportunity)

Also provide:
- Overall problem discovery score (average of all criteria)
- 3 specific problems discovered or validated (based on your startup experience)
- 3 recommendations for better problem discovery (as you would give to a founder)
- Confidence level (high/medium/low) - your gut feeling as an experienced entrepreneur
- Whether to proceed (score >= 7 and confidence high/medium) - your go/no-go decision

Return as JSON:
{
  "score": number,
  "criteria": {
    "problemIdentification": number,
    "problemValidation": number,
    "problemScope": number,
    "problemUrgency": number,
    "problemImpact": number
  },
  "discoveredProblems": [string],
  "recommendations": [string],
  "confidence": "high"|"medium"|"low",
  "shouldProceed": boolean
}` },
      ];
      try {
        const validationResponse = await chatCompletion(problemDiscoveryPrompt) || '';
        const cleanResponse = validationResponse.replace(/```json|```/gi, '').trim();
        validationScore = JSON.parse(cleanResponse);
      } catch (e) {
        console.error('Failed to generate validation score:', e);
      }
    } else if (stage === 'Customer Profile') {
      const industryContext = getIndustryContext(businessIdea, customerDescription);
      
      const customerProfilePrompt = [
        { 
          role: 'system', 
          content: `You are Sarah Chen, a seasoned entrepreneur and business coach with 15+ years of experience in:

ENTREPRENEURIAL EXPERTISE:
- Founded and scaled 3 successful startups (2 exits, 1 IPO)
- Coached 200+ entrepreneurs through Y Combinator, Techstars, and 500 Startups
- Expert in Lean Startup methodology and Customer Development
- Specialized in Blue Ocean Strategy and disruptive innovation
- Deep experience in startup incubation and accelerator programs

CUSTOMER DEVELOPMENT EXPERTISE:
- Customer persona development and validation
- Customer segmentation and targeting strategies
- Customer interview and research methodologies
- Customer journey mapping and optimization
- Customer acquisition and retention strategies
- Customer feedback analysis and implementation

INDUSTRY KNOWLEDGE:
Industry Context: ${industryContext.marketDynamics}
Key Validation Metrics: ${industryContext.validationMetrics}
Common Challenges: ${industryContext.commonChallenges}

YOUR APPROACH:
You evaluate customer profiles through the lens of an experienced entrepreneur who has:
- Built products from idea to market
- Conducted hundreds of customer interviews
- Made critical go/no-go decisions
- Seen what makes startups succeed or fail
- Understood the difference between real customers and assumed customers

Your job is to VALIDATE customer profiles, not just rate an existing customer description.
Focus on:
- How well is the target customer defined?
- Is this customer specific enough to be actionable?
- How relevant is this customer to the business idea?
- How accessible and reachable is this customer?
- How valuable is this customer segment?

Market Research Methods to Consider:
- Customer Interviews: ${MARKET_RESEARCH_METHODS.customerInterviews.description}
- Competitive Analysis: ${MARKET_RESEARCH_METHODS.competitiveAnalysis.description}
- Market Trends: ${MARKET_RESEARCH_METHODS.marketTrends.description}
- TAM/SAM/SOM: ${MARKET_RESEARCH_METHODS.tamSamSom.description}`
        },
        { 
          role: 'user', 
          content: `As an experienced entrepreneur and business coach, analyze this business idea for CUSTOMER PROFILE validation:

Business Idea: "${businessIdea}"
Customer Description: "${customerDescription}"

Based on your experience building startups and coaching entrepreneurs, evaluate this customer profile through the lens of:

1. Customer Clarity (1-10): How clearly and specifically is the customer defined?
   - 1-3: Vague, unclear who the customer is (like most failed startups)
   - 4-6: Somewhat clear customer identified (typical early-stage confusion)
   - 7-10: Crystal clear, specific customer with evidence (like successful startups)

2. Customer Specificity (1-10): How detailed and actionable is the customer profile?
   - 1-3: Generic customer description (common startup mistake)
   - 4-6: Some specificity but could be stronger (needs more detail)
   - 7-10: Highly specific, actionable customer profile (validated through research)

3. Customer Relevance (1-10): How relevant is this customer to the business idea?
   - 1-3: Customer doesn't align with solution (wrong target market)
   - 4-6: Some relevance but could be stronger (partial alignment)
   - 7-10: Highly relevant customer for the solution (perfect fit)

4. Customer Accessibility (1-10): How accessible and reachable is this customer?
   - 1-3: Hard to reach, expensive to acquire (not viable)
   - 4-6: Moderately accessible (viable but challenging)
   - 7-10: Highly accessible, easy to reach (ideal customer segment)

5. Customer Value (1-10): How valuable is this customer segment to the business?
   - 1-3: Low value, not worth pursuing (not viable business)
   - 4-6: Moderate value, worth pursuing (viable business)
   - 7-10: High value, strong business opportunity (ideal customer)

Also provide:
- Overall customer profile score (average of all criteria)
- 3 specific customer insights discovered (based on your startup experience)
- 3 recommendations for better customer development (as you would give to a founder)
- Confidence level (high/medium/low) - your gut feeling as an experienced entrepreneur
- Whether to proceed (score >= 7 and confidence high/medium) - your go/no-go decision

Return as JSON:
{
  "score": number,
  "criteria": {
    "customerClarity": number,
    "customerSpecificity": number,
    "customerRelevance": number,
    "customerAccessibility": number,
    "customerValue": number
  },
  "discoveredProblems": [string],
  "recommendations": [string],
  "confidence": "high"|"medium"|"low",
  "shouldProceed": boolean
}` },
      ];
      try {
        const validationResponse = await chatCompletion(customerProfilePrompt) || '';
        const cleanResponse = validationResponse.replace(/```json|```/gi, '').trim();
        validationScore = JSON.parse(cleanResponse);
      } catch (e) {
        console.error('Failed to generate customer profile validation score:', e);
      }
    } else if (stage === 'Customer Struggle') {
      const industryContext = getIndustryContext(businessIdea, customerDescription);
      
      const customerStrugglePrompt = [
        { 
          role: 'system', 
          content: `You are Sarah Chen, a seasoned entrepreneur and business coach with 15+ years of experience in:

ENTREPRENEURIAL EXPERTISE:
- Founded and scaled 3 successful startups (2 exits, 1 IPO)
- Coached 200+ entrepreneurs through Y Combinator, Techstars, and 500 Startups
- Expert in Lean Startup methodology and Customer Development
- Specialized in Blue Ocean Strategy and disruptive innovation
- Deep experience in startup incubation and accelerator programs

CUSTOMER DEVELOPMENT EXPERTISE:
- Customer pain point identification and validation
- Jobs-to-be-Done framework implementation
- Customer interview and research methodologies
- Customer journey mapping and optimization
- Customer feedback analysis and implementation
- Problem-solution fit analysis

INDUSTRY KNOWLEDGE:
Industry Context: ${industryContext.marketDynamics}
Key Validation Metrics: ${industryContext.validationMetrics}
Common Challenges: ${industryContext.commonChallenges}

YOUR APPROACH:
You evaluate customer struggles through the lens of an experienced entrepreneur who has:
- Built products from idea to market
- Conducted hundreds of customer interviews
- Made critical go/no-go decisions
- Seen what makes startups succeed or fail
- Understood the difference between real struggles and perceived struggles

Your job is to VALIDATE customer struggles, not just rate an existing struggle description.
Focus on:
- How well are the customer struggles identified?
- Are these real struggles that customers actually face?
- How urgent and frequent are these struggles?
- How impactful are these struggles on customers?
- What evidence supports these struggles exist?

Market Research Methods to Consider:
- Customer Interviews: ${MARKET_RESEARCH_METHODS.customerInterviews.description}
- Competitive Analysis: ${MARKET_RESEARCH_METHODS.competitiveAnalysis.description}
- Market Trends: ${MARKET_RESEARCH_METHODS.marketTrends.description}
- TAM/SAM/SOM: ${MARKET_RESEARCH_METHODS.tamSamSom.description}`
        },
        { 
          role: 'user', 
          content: `As an experienced entrepreneur and business coach, analyze this business idea for CUSTOMER STRUGGLE validation:

Business Idea: "${businessIdea}"
Customer Description: "${customerDescription}"

Based on your experience building startups and coaching entrepreneurs, evaluate this customer struggle through the lens of:

1. Struggle Identification (1-10): How clearly and specifically are the customer struggles identified?
   - 1-3: Vague, unclear what struggles customers face (like most failed startups)
   - 4-6: Somewhat clear struggles identified (typical early-stage confusion)
   - 7-10: Crystal clear, specific struggles with evidence (like successful startups)

2. Struggle Validation (1-10): How well does this validate that struggles actually exist?
   - 1-3: Assumes struggles exist without validation (common startup mistake)
   - 4-6: Some validation but could be stronger (needs more customer interviews)
   - 7-10: Strong evidence that struggles are real and impactful (validated through customer development)

3. Struggle Urgency (1-10): How urgent are these struggles for customers?
   - 1-3: Low urgency, customers can wait (not a viable startup)
   - 4-6: Moderate urgency, customers want solutions soon (potential market)
   - 7-10: High urgency, customers need solutions now (strong market pull)

4. Struggle Frequency (1-10): How frequently do customers experience these struggles?
   - 1-3: Rare occurrence, not worth building for (not viable)
   - 4-6: Occasional occurrence, some market potential (viable)
   - 7-10: Frequent occurrence, strong market demand (ideal opportunity)

5. Struggle Impact (1-10): How impactful are these struggles on customers?
   - 1-3: Minor inconvenience, low willingness to pay (not worth building)
   - 4-6: Moderate impact, some willingness to pay (viable business)
   - 7-10: High impact, strong willingness to pay (strong business opportunity)

Also provide:
- Overall customer struggle score (average of all criteria)
- 3 specific struggles discovered or validated (based on your startup experience)
- 3 recommendations for better struggle validation (as you would give to a founder)
- Confidence level (high/medium/low) - your gut feeling as an experienced entrepreneur
- Whether to proceed (score >= 7 and confidence high/medium) - your go/no-go decision

Return as JSON:
{
  "score": number,
  "criteria": {
    "struggleIdentification": number,
    "struggleValidation": number,
    "struggleUrgency": number,
    "struggleFrequency": number,
    "struggleImpact": number
  },
  "discoveredProblems": [string],
  "recommendations": [string],
  "confidence": "high"|"medium"|"low",
  "shouldProceed": boolean
}` },
      ];
      try {
        const validationResponse = await chatCompletion(customerStrugglePrompt) || '';
        const cleanResponse = validationResponse.replace(/```json|```/gi, '').trim();
        validationScore = JSON.parse(cleanResponse);
      } catch (e) {
        console.error('Failed to generate customer struggle validation score:', e);
      }
    } else if (stage === 'Solution Fit') {
      const industryContext = getIndustryContext(businessIdea, customerDescription);
      
      const solutionFitPrompt = [
        { 
          role: 'system', 
          content: `You are Sarah Chen, a seasoned entrepreneur and business coach with 15+ years of experience in:

ENTREPRENEURIAL EXPERTISE:
- Founded and scaled 3 successful startups (2 exits, 1 IPO)
- Coached 200+ entrepreneurs through Y Combinator, Techstars, and 500 Startups
- Expert in Lean Startup methodology and Customer Development
- Specialized in Blue Ocean Strategy and disruptive innovation
- Deep experience in startup incubation and accelerator programs

PRODUCT DEVELOPMENT EXPERTISE:
- Product-market fit analysis and validation
- Solution design and user experience optimization
- Feature prioritization and MVP development
- User testing and feedback integration
- Competitive differentiation strategies
- Value proposition development

INDUSTRY KNOWLEDGE:
Industry Context: ${industryContext.marketDynamics}
Key Validation Metrics: ${industryContext.validationMetrics}
Common Challenges: ${industryContext.commonChallenges}

YOUR APPROACH:
You evaluate solution fit through the lens of an experienced entrepreneur who has:
- Built products from idea to market
- Conducted hundreds of customer interviews
- Made critical go/no-go decisions
- Seen what makes startups succeed or fail
- Understood the difference between good solutions and great solutions

Your job is to VALIDATE solution fit, not just rate an existing solution description.
Focus on:
- How well does the solution align with customer needs?
- How effective is the solution at solving the problem?
- How differentiated is the solution from alternatives?
- How valuable is the solution to customers?
- How feasible is the solution to implement?

Market Research Methods to Consider:
- Customer Interviews: ${MARKET_RESEARCH_METHODS.customerInterviews.description}
- Competitive Analysis: ${MARKET_RESEARCH_METHODS.competitiveAnalysis.description}
- Market Trends: ${MARKET_RESEARCH_METHODS.marketTrends.description}
- TAM/SAM/SOM: ${MARKET_RESEARCH_METHODS.tamSamSom.description}`
        },
        { 
          role: 'user', 
          content: `As an experienced entrepreneur and business coach, analyze this business idea for SOLUTION FIT validation:

Business Idea: "${businessIdea}"
Customer Description: "${customerDescription}"

Based on your experience building startups and coaching entrepreneurs, evaluate this solution fit through the lens of:

1. Solution Alignment (1-10): How well does the solution align with customer needs?
   - 1-3: Poor alignment, doesn't address real needs (like most failed startups)
   - 4-6: Some alignment but could be stronger (typical early-stage confusion)
   - 7-10: Perfect alignment with customer needs (like successful startups)

2. Solution Effectiveness (1-10): How effective is the solution at solving the problem?
   - 1-3: Ineffective, doesn't solve the problem (common startup mistake)
   - 4-6: Somewhat effective but could be better (needs improvement)
   - 7-10: Highly effective, solves the problem completely (validated solution)

3. Solution Differentiation (1-10): How differentiated is the solution from alternatives?
   - 1-3: No differentiation, easily replaceable (not viable)
   - 4-6: Some differentiation but could be stronger (viable but challenging)
   - 7-10: Highly differentiated, unique value proposition (strong competitive advantage)

4. Solution Value (1-10): How valuable is the solution to customers?
   - 1-3: Low value, customers won't pay (not worth building)
   - 4-6: Moderate value, customers might pay (viable business)
   - 7-10: High value, customers will pay premium (strong business opportunity)

5. Solution Feasibility (1-10): How feasible is the solution to implement?
   - 1-3: Not feasible, too complex or expensive (not viable)
   - 4-6: Moderately feasible, some challenges (viable with effort)
   - 7-10: Highly feasible, easy to implement (ideal solution)

Also provide:
- Overall solution fit score (average of all criteria)
- 3 specific solution insights discovered (based on your startup experience)
- 3 recommendations for better solution development (as you would give to a founder)
- Confidence level (high/medium/low) - your gut feeling as an experienced entrepreneur
- Whether to proceed (score >= 7 and confidence high/medium) - your go/no-go decision

Return as JSON:
{
  "score": number,
  "criteria": {
    "solutionAlignment": number,
    "solutionEffectiveness": number,
    "solutionDifferentiation": number,
    "solutionValue": number,
    "solutionFeasibility": number
  },
  "discoveredProblems": [string],
  "recommendations": [string],
  "confidence": "high"|"medium"|"low",
  "shouldProceed": boolean
}` },
      ];
      try {
        const validationResponse = await chatCompletion(solutionFitPrompt) || '';
        const cleanResponse = validationResponse.replace(/```json|```/gi, '').trim();
        validationScore = JSON.parse(cleanResponse);
      } catch (e) {
        console.error('Failed to generate solution fit validation score:', e);
      }
    } else if (stage === 'Business Model') {
      const industryContext = getIndustryContext(businessIdea, customerDescription);
      
      const businessModelPrompt = [
        { 
          role: 'system', 
          content: `You are Sarah Chen, a seasoned entrepreneur and business coach with 15+ years of experience in:

ENTREPRENEURIAL EXPERTISE:
- Founded and scaled 3 successful startups (2 exits, 1 IPO)
- Coached 200+ entrepreneurs through Y Combinator, Techstars, and 500 Startups
- Expert in Lean Startup methodology and Customer Development
- Specialized in Blue Ocean Strategy and disruptive innovation
- Deep experience in startup incubation and accelerator programs

BUSINESS MODEL EXPERTISE:
- Revenue model design and optimization
- Pricing strategy and market positioning
- Cost structure and profitability analysis
- Competitive advantage development
- Scalability and growth planning
- Financial modeling and projections

INDUSTRY KNOWLEDGE:
Industry Context: ${industryContext.marketDynamics}
Key Validation Metrics: ${industryContext.validationMetrics}
Common Challenges: ${industryContext.commonChallenges}

YOUR APPROACH:
You evaluate business models through the lens of an experienced entrepreneur who has:
- Built products from idea to market
- Conducted hundreds of customer interviews
- Made critical go/no-go decisions
- Seen what makes startups succeed or fail
- Understood the difference between viable and scalable business models

Your job is to VALIDATE business models, not just rate an existing business model description.
Focus on:
- How viable is the business model?
- What is the revenue potential?
- How efficient is the cost structure?
- What competitive advantages exist?
- How scalable is the business model?

Market Research Methods to Consider:
- Customer Interviews: ${MARKET_RESEARCH_METHODS.customerInterviews.description}
- Competitive Analysis: ${MARKET_RESEARCH_METHODS.competitiveAnalysis.description}
- Market Trends: ${MARKET_RESEARCH_METHODS.marketTrends.description}
- TAM/SAM/SOM: ${MARKET_RESEARCH_METHODS.tamSamSom.description}`
        },
        { 
          role: 'user', 
          content: `As an experienced entrepreneur and business coach, analyze this business idea for BUSINESS MODEL validation:

Business Idea: "${businessIdea}"
Customer Description: "${customerDescription}"

Based on your experience building startups and coaching entrepreneurs, evaluate this business model through the lens of:

1. Model Viability (1-10): How viable is the overall business model?
   - 1-3: Not viable, fundamental flaws (like most failed startups)
   - 4-6: Somewhat viable but needs work (typical early-stage confusion)
   - 7-10: Highly viable, strong foundation (like successful startups)

2. Revenue Potential (1-10): What is the revenue potential of this business model?
   - 1-3: Low revenue potential, not worth pursuing (not viable)
   - 4-6: Moderate revenue potential, worth pursuing (viable business)
   - 7-10: High revenue potential, strong opportunity (ideal business model)

3. Cost Efficiency (1-10): How efficient is the cost structure?
   - 1-3: High costs, poor margins (not sustainable)
   - 4-6: Moderate costs, acceptable margins (viable with optimization)
   - 7-10: Low costs, high margins (ideal cost structure)

4. Competitive Advantage (1-10): What competitive advantages exist?
   - 1-3: No competitive advantages, easily replaceable (not viable)
   - 4-6: Some competitive advantages but could be stronger (viable but challenging)
   - 7-10: Strong competitive advantages, hard to replicate (ideal position)

5. Scalability (1-10): How scalable is the business model?
   - 1-3: Not scalable, limited growth potential (not viable)
   - 4-6: Moderately scalable, some growth potential (viable business)
   - 7-10: Highly scalable, strong growth potential (ideal model)

Also provide:
- Overall business model score (average of all criteria)
- 3 specific business model insights discovered (based on your startup experience)
- 3 recommendations for better business model development (as you would give to a founder)
- Confidence level (high/medium/low) - your gut feeling as an experienced entrepreneur
- Whether to proceed (score >= 7 and confidence high/medium) - your go/no-go decision

Return as JSON:
{
  "score": number,
  "criteria": {
    "modelViability": number,
    "revenuePotential": number,
    "costEfficiency": number,
    "competitiveAdvantage": number,
    "scalability": number
  },
  "discoveredProblems": [string],
  "recommendations": [string],
  "confidence": "high"|"medium"|"low",
  "shouldProceed": boolean
}` },
      ];
      try {
        const validationResponse = await chatCompletion(businessModelPrompt) || '';
        const cleanResponse = validationResponse.replace(/```json|```/gi, '').trim();
        validationScore = JSON.parse(cleanResponse);
      } catch (e) {
        console.error('Failed to generate business model validation score:', e);
      }
    } else if (stage === 'Market Validation') {
      const industryContext = getIndustryContext(businessIdea, customerDescription);
      
      const marketValidationPrompt = [
        { 
          role: 'system', 
          content: `You are Sarah Chen, a seasoned entrepreneur and business coach with 15+ years of experience in:

ENTREPRENEURIAL EXPERTISE:
- Founded and scaled 3 successful startups (2 exits, 1 IPO)
- Coached 200+ entrepreneurs through Y Combinator, Techstars, and 500 Startups
- Expert in Lean Startup methodology and Customer Development
- Specialized in Blue Ocean Strategy and disruptive innovation
- Deep experience in startup incubation and accelerator programs

MARKET RESEARCH EXPERTISE:
- Market size analysis and TAM/SAM/SOM calculations
- Market demand validation and customer research
- Market timing and entry strategy analysis
- Competitive landscape analysis
- Market access and distribution strategies
- Market trend analysis and forecasting

INDUSTRY KNOWLEDGE:
Industry Context: ${industryContext.marketDynamics}
Key Validation Metrics: ${industryContext.validationMetrics}
Common Challenges: ${industryContext.commonChallenges}

YOUR APPROACH:
You evaluate market validation through the lens of an experienced entrepreneur who has:
- Built products from idea to market
- Conducted hundreds of customer interviews
- Made critical go/no-go decisions
- Seen what makes startups succeed or fail
- Understood the difference between good markets and great markets

Your job is to VALIDATE market opportunities, not just rate an existing market description.
Focus on:
- What is the market size and opportunity?
- How strong is the market demand?
- What is the market timing and entry strategy?
- What is the competitive landscape?
- How accessible is the market?

Market Research Methods to Consider:
- Customer Interviews: ${MARKET_RESEARCH_METHODS.customerInterviews.description}
- Competitive Analysis: ${MARKET_RESEARCH_METHODS.competitiveAnalysis.description}
- Market Trends: ${MARKET_RESEARCH_METHODS.marketTrends.description}
- TAM/SAM/SOM: ${MARKET_RESEARCH_METHODS.tamSamSom.description}`
        },
        { 
          role: 'user', 
          content: `As an experienced entrepreneur and business coach, analyze this business idea for MARKET VALIDATION:

Business Idea: "${businessIdea}"
Customer Description: "${customerDescription}"

Based on your experience building startups and coaching entrepreneurs, evaluate this market validation through the lens of:

1. Market Size (1-10): What is the market size and opportunity?
   - 1-3: Small market, limited opportunity (not viable)
   - 4-6: Moderate market, some opportunity (viable business)
   - 7-10: Large market, significant opportunity (ideal market)

2. Market Demand (1-10): How strong is the market demand?
   - 1-3: Weak demand, customers don't want it (not viable)
   - 4-6: Moderate demand, some customer interest (viable business)
   - 7-10: Strong demand, customers actively seeking solutions (ideal market)

3. Market Timing (1-10): What is the market timing and entry strategy?
   - 1-3: Poor timing, market not ready (not viable)
   - 4-6: Moderate timing, market developing (viable with patience)
   - 7-10: Perfect timing, market ready now (ideal entry)

4. Competitive Landscape (1-10): What is the competitive landscape?
   - 1-3: Highly competitive, hard to differentiate (not viable)
   - 4-6: Moderate competition, some differentiation possible (viable business)
   - 7-10: Low competition, easy to differentiate (ideal market)

5. Market Access (1-10): How accessible is the market?
   - 1-3: Hard to access, expensive to reach (not viable)
   - 4-6: Moderately accessible, some challenges (viable business)
   - 7-10: Highly accessible, easy to reach (ideal market)

Also provide:
- Overall market validation score (average of all criteria)
- 3 specific market insights discovered (based on your startup experience)
- 3 recommendations for better market validation (as you would give to a founder)
- Confidence level (high/medium/low) - your gut feeling as an experienced entrepreneur
- Whether to proceed (score >= 7 and confidence high/medium) - your go/no-go decision

Return as JSON:
{
  "score": number,
  "criteria": {
    "marketSize": number,
    "marketDemand": number,
    "marketTiming": number,
    "competitiveLandscape": number,
    "marketAccess": number
  },
  "discoveredProblems": [string],
  "recommendations": [string],
  "confidence": "high"|"medium"|"low",
  "shouldProceed": boolean
}` },
      ];
      try {
        const validationResponse = await chatCompletion(marketValidationPrompt) || '';
        const cleanResponse = validationResponse.replace(/```json|```/gi, '').trim();
        validationScore = JSON.parse(cleanResponse);
      } catch (e) {
        console.error('Failed to generate market validation score:', e);
      }
    }

    // For Problem Discovery stage, generate additional business plan sections
    let businessPlanSections = null;
    if (stage === 'Problem Discovery') {
      try {
        const sectionsPrompt = [
          { 
            role: 'system', 
            content: `You are an expert business strategist and startup coach. Your job is to generate comprehensive business plan sections based on the problem discovery analysis.

Generate these sections:
1. Customer Pain Points: Detailed analysis of customer pain points discovered
2. Value Proposition: Clear value proposition based on the problems identified
3. Market Analysis: Initial market analysis and opportunity assessment
4. Competitive Analysis: Competitive landscape and positioning

Be specific, actionable, and based on the problem discovery insights.`
          },
          { 
            role: 'user', 
            content: `Based on this business idea and customer feedback, generate comprehensive business plan sections:

Business Idea: "${businessIdea}"
Customer Description: "${customerDescription}"
Customer Feedback Summary: "${summary}"

Generate these sections with IMPROVED versions that score higher on validation criteria:

1. Customer Pain Points (detailed analysis with bullet points):
2. Value Proposition (clear and compelling):
3. Market Analysis (opportunity assessment):
4. Competitive Analysis (landscape and positioning):

Return as JSON:
{
  "customerPainPoints": "• [Improved pain point 1]\n• [Improved pain point 2]\n• [Improved pain point 3]",
  "valueProposition": "clear value proposition",
  "marketAnalysis": "market opportunity analysis", 
  "competitiveAnalysis": "competitive landscape analysis"
}`
          }
        ];
        
        const sectionsResponse = await chatCompletion(sectionsPrompt, 'gpt-4o-mini', 0.7);
        if (sectionsResponse) {
          const cleanResponse = sectionsResponse.replace(/```json|```/gi, '').trim();
          businessPlanSections = JSON.parse(cleanResponse);
        }
      } catch (error) {
        console.error('Failed to generate business plan sections:', error);
        businessPlanSections = {
          customerPainPoints: 'Analysis pending based on customer feedback',
          valueProposition: 'Value proposition to be refined based on problem discovery',
          marketAnalysis: 'Market analysis to be developed based on customer insights',
          competitiveAnalysis: 'Competitive analysis to be completed based on market research'
        };
      }
    }



    res.json({ feedback, summary, validationScore, businessPlanSections });
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

    // Clean the improved problem statement by removing "Variation X:" prefix
    let cleanedProblemStatement = variations[0];
    if (cleanedProblemStatement.includes(':')) {
      // Remove "Variation X:" or "Variation X -" prefixes
      cleanedProblemStatement = cleanedProblemStatement.replace(/^Variation\s+\d+[:\-]?\s*/i, '').trim();
    }
    
    res.json({ improvedProblemStatement: cleanedProblemStatement, variations });
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
      { 
        role: 'system', 
        content: `You are Sarah Chen, a seasoned entrepreneur and business coach with 15+ years of experience in:

ENTREPRENEURIAL EXPERTISE:
- Founded and scaled 3 successful startups (2 exits, 1 IPO)
- Coached 200+ entrepreneurs through Y Combinator, Techstars, and 500 Startups
- Expert in Lean Startup methodology and Customer Development
- Specialized in Blue Ocean Strategy and disruptive innovation
- Deep experience in startup incubation and accelerator programs

BUSINESS VALIDATION EXPERTISE:
- Jobs-to-be-Done framework implementation
- Customer pain point identification and validation
- Market research and customer interview techniques
- Problem-solution fit analysis
- Startup validation best practices
- MVP development and testing strategies

YOUR APPROACH:
You evaluate business ideas through the lens of an experienced entrepreneur who has:
- Built products from idea to market
- Conducted hundreds of customer interviews
- Made critical go/no-go decisions
- Seen what makes startups succeed or fail
- Understood the difference between real problems and perceived problems

Rate problem statements based on your real-world startup experience.` 
      },
      { 
        role: 'user', 
        content: `As an experienced entrepreneur and business coach, rate this problem statement: "${problemStatement}" for customer: "${customerDescription}" based on these criteria:

1. Problem Identification (1-10): How clearly does this identify specific problems with evidence?
   - 1-3: Vague, unclear what problems are being solved (like most failed startups)
   - 4-6: Somewhat clear problems identified (typical early-stage confusion)
   - 7-10: Crystal clear, specific problems with evidence (like successful startups)

2. Problem Validation (1-10): How well does this validate that problems actually exist in the real world?
   - 1-3: Assumes problems exist without validation (common startup mistake)
   - 4-6: Some validation but could be stronger (needs more customer interviews)
   - 7-10: Strong evidence that problems are real and impactful (validated through customer development)

3. Problem Scope (1-10): How well does this understand the full scope of related problems?
   - 1-3: Addresses surface-level problems only (missing core issues)
   - 4-6: Addresses some core problems (partial understanding)
   - 7-10: Comprehensive understanding of problem landscape (like successful founders)

4. Problem Urgency (1-10): How urgent are these problems that customers need solutions now?
   - 1-3: Low urgency, customers can wait (not a viable startup)
   - 4-6: Moderate urgency, customers want solutions soon (potential market)
   - 7-10: High urgency, customers need solutions now (strong market pull)

5. Problem Impact (1-10): How impactful are these problems that customers will pay to solve them?
   - 1-3: Minor inconvenience, low willingness to pay (not worth building)
   - 4-6: Moderate impact, some willingness to pay (viable business)
   - 7-10: High impact, strong willingness to pay (strong business opportunity)

Also provide:
- Overall score (average of all criteria)
- 3 specific recommendations for improvement (as you would give to a founder)
- Confidence level (high/medium/low) - your gut feeling as an experienced entrepreneur
- Whether to proceed (score >= 7 and confidence high/medium) - your go/no-go decision

Return as JSON:
{
  "score": number,
  "criteria": {
    "problemIdentification": number,
    "problemValidation": number,
    "problemScope": number,
    "problemUrgency": number,
    "problemImpact": number
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

// Test endpoint to verify routing
router.get('/test', (req, res) => {
  console.log('=== TEST ENDPOINT CALLED ===');
  res.json({ message: 'Test endpoint working' });
});

// Auto-improve problem statement using AI
router.post('/auto-improve', async (req, res) => {
  console.log('=== AUTO-IMPROVE ENDPOINT CALLED ===');
  console.log('Request URL:', req.url);
  console.log('Request method:', req.method);
  console.log('Request body:', req.body);
  try {
    const { businessIdea, customerDescription, currentValidationScore, validationCriteria, recommendations, discoveredProblems, planData, businessPlanId } = AutoImproveSchema.extend({ businessPlanId: z.string() }).parse(req.body);

    // Create a comprehensive prompt for AI improvement of all sections
    const improvementPrompt = `You are an expert business consultant helping to improve a complete business plan for a startup idea.

CURRENT BUSINESS PLAN:
Business Idea: ${businessIdea}
Customer Description: ${customerDescription}

CURRENT VALIDATION SCORE: ${currentValidationScore}/10

VALIDATION CRITERIA SCORES:
- Problem Identification: ${validationCriteria.problemIdentification}/10
- Problem Validation: ${validationCriteria.problemValidation}/10
- Problem Scope: ${validationCriteria.problemScope}/10
- Problem Urgency: ${validationCriteria.problemUrgency}/10
- Problem Impact: ${validationCriteria.problemImpact}/10

SPECIFIC RECOMMENDATIONS TO ADDRESS:
${recommendations.map(rec => `- ${rec}`).join('\n')}

${discoveredProblems && discoveredProblems.length > 0 ? `DISCOVERED PROBLEMS TO INCORPORATE:
${discoveredProblems.map(prob => `- ${prob}`).join('\n')}` : ''}

EXISTING BUSINESS PLAN SECTIONS:
${planData?.sections ? Object.entries(planData.sections).map(([key, content]) => `${key}: ${content}`).join('\n') : 'No existing sections'}

TASK: Improve ALL sections of the business plan to address the validation gaps and create a cohesive, professional business plan. Focus on:

1. **Problem Statement**: Make it specific, evidence-based, and address validation gaps
2. **Solution**: Align with the improved problem statement
3. **Customer Pain Points**: Refine based on better problem understanding
4. **Value Proposition**: Enhance to match the improved problem and solution
5. **Market Analysis**: Update with new insights from improved problem scope
6. **Competitive Analysis**: Refine positioning based on better problem articulation

IMPROVEMENT GUIDELINES:
- Be specific and concrete
- Include quantifiable evidence where possible
- Address the discovered problems
- Make urgency clear
- Show business impact
- Keep sections concise but comprehensive
- Use active voice and clear language
- Ensure all sections tell a cohesive story

Provide improved versions of ALL sections in this JSON format:
{
  "problemStatement": "improved problem statement",
  "solution": "improved solution description",
  "customerPainPoints": ["pain point 1", "pain point 2", "pain point 3"],
  "valueProposition": "improved value proposition",
  "marketAnalysis": "improved market analysis",
  "competitiveAnalysis": "improved competitive analysis"
}`;

    const response = await chatCompletion([
      {
        role: 'system',
        content: 'You are an expert business consultant specializing in comprehensive business plan improvement. You help startups create cohesive, professional business plans that address validation gaps and market opportunities.'
      },
      {
        role: 'user',
        content: improvementPrompt
      }
    ], 'gpt-4', 0.7);

    if (!response) {
      return res.status(500).json({ error: 'Failed to generate improved business plan sections' });
    }

    // Parse the JSON response
    let improvedSections;
    try {
      console.log('Raw AI response:', response);
      improvedSections = JSON.parse(response);
      console.log('Parsed improvedSections:', improvedSections);
      console.log('Improved sections keys:', Object.keys(improvedSections));
    } catch (parseError) {
      console.error('JSON parsing failed:', parseError);
      console.log('Failed to parse response:', response);
      // If JSON parsing fails, create a fallback with just the problem statement
      improvedSections = {
        problemStatement: response,
        solution: "Solution will be updated based on improved problem statement",
        customerPainPoints: ["Customer pain points will be refined"],
        valueProposition: "Value proposition will be enhanced",
        marketAnalysis: "Market analysis will be updated",
        competitiveAnalysis: "Competitive analysis will be refined"
      };
    }

    // Ensure all required sections are present
    const requiredSections = ['problemStatement', 'solution', 'customerPainPoints', 'valueProposition', 'marketAnalysis', 'competitiveAnalysis'];
    const missingSections = requiredSections.filter(section => !improvedSections[section]);
    
    if (missingSections.length > 0) {
      console.log('Missing sections:', missingSections);
      // Fill in missing sections with fallback content
      missingSections.forEach(section => {
        if (section === 'problemStatement') {
          improvedSections[section] = improvedSections[section] || businessIdea;
        } else if (section === 'customerPainPoints') {
          improvedSections[section] = improvedSections[section] || ["Customer pain points will be refined"];
        } else {
          improvedSections[section] = improvedSections[section] || `${section.charAt(0).toUpperCase() + section.slice(1)} will be enhanced`;
        }
      });
    }
    
    console.log('Final improvedSections:', improvedSections);

    // After improvedSections is finalized, merge into business plan
    if (!businessPlanId) {
      return res.status(400).json({ error: 'Missing businessPlanId' });
    }
    const plan = await BusinessPlan.findById(businessPlanId);
    if (!plan) {
      return res.status(404).json({ error: 'Business plan not found' });
    }
    plan.sections = { ...plan.sections, ...improvedSections };
    await plan.save();

    res.json({
      improvedSections,
      improvements: recommendations,
      originalScore: currentValidationScore,
      expectedImprovement: 'The improved sections should address validation gaps and increase the overall score.'
    });

  } catch (error) {
    console.error('Auto-improve error:', error);
    res.status(500).json({ error: 'Failed to improve business plan sections' });
  }
});

// Problem Discovery generation endpoint
router.post('/problem-discovery', async (req, res) => {
  try {
    const { businessIdea, customerDescription, personas, stage } = req.body;
    
    if (!businessIdea || !customerDescription) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const industryContext = getIndustryContext(businessIdea, customerDescription);
    
    const problemDiscoveryPrompt = [
      {
        role: 'system',
        content: `You are an expert in problem identification and customer research. Your goal is to identify and analyze problems that can be solved by business ideas.

Key Principles:
1. Focus on real, specific customer problems
2. Identify the root causes of problems
3. Assess the urgency and impact of problems
4. Understand the scope and scale of problems
5. Provide evidence and customer insights

Industry Context: ${industryContext.marketDynamics}
Common Challenges: ${industryContext.commonChallenges}
Validation Metrics: ${industryContext.validationMetrics}

Generate comprehensive problem discovery analysis.`
      },
      {
        role: 'user',
        content: `Generate detailed problem discovery for this business idea:

Business Idea: ${businessIdea}
Customer Description: ${customerDescription}

Generate comprehensive problem analysis. Include:

1. problemStatement: clear description of the main problem
2. problemScope: how widespread this problem is
3. problemUrgency: how urgent this problem is
4. problemImpact: the impact of this problem on customers
5. problemEvidence: specific evidence or examples
6. rootCauses: underlying causes of the problem
7. customerInsights: what customers say about this problem
8. problemValidation: how to validate this problem exists

Return as JSON:
{
  "problem": {
    "statement": "string",
    "scope": "string",
    "urgency": "string",
    "impact": "string",
    "evidence": "string",
    "rootCauses": ["string"],
    "customerInsights": ["string"],
    "validation": "string"
  },
  "analysis": {
    "summary": "string",
    "recommendations": ["string"],
    "insights": ["string"]
  }
}`
      }
    ];

    const response = await chatCompletion(problemDiscoveryPrompt, 'gpt-4', 0.7);
    
    if (!response) {
      return res.status(500).json({ error: 'Failed to generate problem discovery' });
    }

    let problemDiscovery;
    try {
      const cleanedResponse = response.replace(/```json|```/gi, '').trim();
      problemDiscovery = JSON.parse(cleanedResponse);
    } catch (parseError) {
      console.error('Failed to parse problem discovery response:', parseError);
      return res.status(500).json({ error: 'Failed to parse problem discovery response' });
    }

    // Generate validation score for this stage
    let validationScore = null;
    try {
      const validationPrompt = [
        {
          role: 'system',
          content: `You are Sarah Chen, a seasoned entrepreneur evaluating problem discovery. Rate this problem analysis on a scale of 1-10.`
        },
        {
          role: 'user',
          content: `Evaluate this problem discovery:

Business Idea: ${businessIdea}
Customer Description: ${customerDescription}
Problem: ${JSON.stringify(problemDiscovery.problem)}

Rate on these criteria:
- Problem Identification (1-10)
- Problem Validation (1-10)
- Problem Scope (1-10)
- Problem Urgency (1-10)
- Problem Impact (1-10)

Return as JSON:
{
  "score": number,
  "criteria": {
    "problemIdentification": number,
    "problemValidation": number,
    "problemScope": number,
    "problemUrgency": number,
    "problemImpact": number
  },
  "recommendations": ["string"],
  "confidence": "high|medium|low",
  "shouldProceed": boolean
}`
        }
      ];
      
      const validationResponse = await chatCompletion(validationPrompt, 'gpt-4', 0.7);
      if (validationResponse) {
        const cleanResponse = validationResponse.replace(/```json|```/gi, '').trim();
        validationScore = JSON.parse(cleanResponse);
      }
    } catch (e) {
      console.error('Failed to generate problem discovery validation score:', e);
    }

    res.json({
      problem: problemDiscovery.problem || {},
      analysis: problemDiscovery.analysis || {},
      summary: problemDiscovery.analysis?.summary || 'Problem discovery analysis completed',
      validationScore
    });

  } catch (error) {
    console.error('Problem discovery generation error:', error);
    res.status(500).json({ error: 'Failed to generate problem discovery' });
  }
});

// Customer Profile generation endpoint
router.post('/customer-profiles', async (req, res) => {
  try {
    const { businessIdea, customerDescription, personas, stage } = req.body;
    
    if (!businessIdea || !customerDescription) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const industryContext = getIndustryContext(businessIdea, customerDescription);
    
    const customerProfilePrompt = [
      {
        role: 'system',
        content: `You are an expert customer researcher and market segmentation specialist. Your goal is to create detailed customer profiles and personas that help validate business ideas.

Key Principles:
1. Create specific, actionable customer segments
2. Include detailed demographics and psychographics
3. Focus on customer pain points and motivations
4. Provide clear customer accessibility information
5. Demonstrate customer value to the business

Industry Context: ${industryContext.marketDynamics}
Common Challenges: ${industryContext.commonChallenges}
Validation Metrics: ${industryContext.validationMetrics}

Generate comprehensive customer profiles that can be used for business validation.`
      },
      {
        role: 'user',
        content: `Generate detailed customer profiles for this business idea:

Business Idea: ${businessIdea}
Customer Description: ${customerDescription}

Generate 3-4 different customer profiles. For each profile, include:

1. name: descriptive name for the customer segment
2. description: detailed description of this customer type
3. demographics: age, location, income, education, etc.
4. painPoints: specific problems they face
5. goals: what they're trying to achieve
6. motivations: what drives their decisions
7. accessibility: how to reach and engage them
8. value: the business value of serving this customer
9. segments: specific sub-segments within this profile
10. objections: likely objections they would have

Return as JSON:
{
  "profiles": [
    {
      "name": "string",
      "description": "string",
      "demographics": {
        "age": "string",
        "location": "string", 
        "income": "string",
        "education": "string"
      },
      "painPoints": ["string"],
      "goals": ["string"],
      "motivations": ["string"],
      "accessibility": "string",
      "value": "string",
      "segments": ["string"],
      "objections": ["string"]
    }
  ],
  "analysis": {
    "summary": "string",
    "recommendations": ["string"],
    "customerInsights": ["string"]
  }
}`
      }
    ];

    const response = await chatCompletion(customerProfilePrompt, 'gpt-4', 0.7);
    
    if (!response) {
      return res.status(500).json({ error: 'Failed to generate customer profiles' });
    }

    let customerProfiles;
    try {
      const cleanedResponse = response.replace(/```json|```/gi, '').trim();
      customerProfiles = JSON.parse(cleanedResponse);
    } catch (parseError) {
      console.error('Failed to parse customer profiles response:', parseError);
      return res.status(500).json({ error: 'Failed to parse customer profiles response' });
    }

    // Generate validation score for this stage
    let validationScore = null;
    try {
      const validationPrompt = [
        {
          role: 'system',
          content: `You are Sarah Chen, a seasoned entrepreneur evaluating customer profiles. Rate this customer profile on a scale of 1-10.`
        },
        {
          role: 'user',
          content: `Evaluate this customer profile:

Business Idea: ${businessIdea}
Customer Description: ${customerDescription}
Customer Profiles: ${JSON.stringify(customerProfiles.profiles)}

Rate on these criteria:
- Customer Clarity (1-10)
- Customer Specificity (1-10)
- Customer Relevance (1-10)
- Customer Accessibility (1-10)
- Customer Value (1-10)

Return as JSON:
{
  "score": number,
  "criteria": {
    "customerClarity": number,
    "customerSpecificity": number,
    "customerRelevance": number,
    "customerAccessibility": number,
    "customerValue": number
  },
  "recommendations": ["string"],
  "confidence": "high|medium|low",
  "shouldProceed": boolean
}`
        }
      ];
      
      const validationResponse = await chatCompletion(validationPrompt, 'gpt-4', 0.7);
      if (validationResponse) {
        const cleanResponse = validationResponse.replace(/```json|```/gi, '').trim();
        validationScore = JSON.parse(cleanResponse);
      }
    } catch (e) {
      console.error('Failed to generate customer profile validation score:', e);
    }

    res.json({
      profiles: customerProfiles.profiles || [],
      analysis: customerProfiles.analysis || {},
      summary: customerProfiles.analysis?.summary || 'Customer profile analysis completed',
      validationScore
    });

  } catch (error) {
    console.error('Customer profiles generation error:', error);
    res.status(500).json({ error: 'Failed to generate customer profiles' });
  }
});

// Customer Struggle generation endpoint
router.post('/customer-struggles', async (req, res) => {
  try {
    const { businessIdea, customerDescription, personas, stage } = req.body;
    
    if (!businessIdea || !customerDescription) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const industryContext = getIndustryContext(businessIdea, customerDescription);
    
    const customerStrugglePrompt = [
      {
        role: 'system',
        content: `You are an expert in customer research and problem identification. Your goal is to identify and analyze customer struggles that can be solved by business ideas.

Key Principles:
1. Focus on real, specific customer problems
2. Identify the root causes of struggles
3. Assess the urgency and frequency of problems
4. Understand the impact of these struggles
5. Provide evidence and customer quotes

Industry Context: ${industryContext.marketDynamics}
Common Challenges: ${industryContext.commonChallenges}
Validation Metrics: ${industryContext.validationMetrics}

Generate comprehensive customer struggle analysis.`
      },
      {
        role: 'user',
        content: `Generate detailed customer struggles for this business idea:

Business Idea: ${businessIdea}
Customer Description: ${customerDescription}

Generate 5-7 different customer struggles. For each struggle, include:

1. title: descriptive name for the struggle
2. description: detailed description of the problem
3. evidence: specific evidence or examples
4. frequency: how often this problem occurs
5. impact: the impact on the customer's life/business
6. urgency: how urgent this problem is
7. customerQuotes: hypothetical quotes from customers
8. rootCause: underlying cause of the problem

Return as JSON:
{
  "struggles": [
    {
      "title": "string",
      "description": "string",
      "evidence": "string",
      "frequency": "string",
      "impact": "string",
      "urgency": "string",
      "customerQuotes": ["string"],
      "rootCause": "string"
    }
  ],
  "analysis": {
    "summary": "string",
    "recommendations": ["string"],
    "insights": ["string"]
  }
}`
      }
    ];

    const response = await chatCompletion(customerStrugglePrompt, 'gpt-4', 0.7);
    
    if (!response) {
      return res.status(500).json({ error: 'Failed to generate customer struggles' });
    }

    let customerStruggles;
    try {
      const cleanedResponse = response.replace(/```json|```/gi, '').trim();
      customerStruggles = JSON.parse(cleanedResponse);
    } catch (parseError) {
      console.error('Failed to parse customer struggles response:', parseError);
      return res.status(500).json({ error: 'Failed to parse customer struggles response' });
    }

    // Generate validation score for this stage
    let validationScore = null;
    try {
      const validationPrompt = [
        {
          role: 'system',
          content: `You are Sarah Chen, a seasoned entrepreneur evaluating customer struggles. Rate this customer struggle analysis on a scale of 1-10.`
        },
        {
          role: 'user',
          content: `Evaluate this customer struggle analysis:

Business Idea: ${businessIdea}
Customer Description: ${customerDescription}
Customer Struggles: ${JSON.stringify(customerStruggles.struggles)}

Rate on these criteria:
- Struggle Identification (1-10)
- Struggle Validation (1-10)
- Struggle Urgency (1-10)
- Struggle Frequency (1-10)
- Struggle Impact (1-10)

Return as JSON:
{
  "score": number,
  "criteria": {
    "struggleIdentification": number,
    "struggleValidation": number,
    "struggleUrgency": number,
    "struggleFrequency": number,
    "struggleImpact": number
  },
  "recommendations": ["string"],
  "confidence": "high|medium|low",
  "shouldProceed": boolean
}`
        }
      ];
      
      const validationResponse = await chatCompletion(validationPrompt, 'gpt-4', 0.7);
      if (validationResponse) {
        const cleanResponse = validationResponse.replace(/```json|```/gi, '').trim();
        validationScore = JSON.parse(cleanResponse);
      }
    } catch (e) {
      console.error('Failed to generate customer struggle validation score:', e);
    }

    res.json({
      struggles: customerStruggles.struggles || [],
      analysis: customerStruggles.analysis || {},
      summary: customerStruggles.analysis?.summary || 'Customer struggle analysis completed',
      validationScore
    });

  } catch (error) {
    console.error('Customer struggles generation error:', error);
    res.status(500).json({ error: 'Failed to generate customer struggles' });
  }
});

// Solution Fit generation endpoint
router.post('/solution-fit', async (req, res) => {
  try {
    const { businessIdea, customerDescription, personas, stage } = req.body;
    
    if (!businessIdea || !customerDescription) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const industryContext = getIndustryContext(businessIdea, customerDescription);
    
    const solutionFitPrompt = [
      {
        role: 'system',
        content: `You are an expert in solution design and product-market fit. Your goal is to create solutions that effectively address customer problems and provide strong value propositions.

Key Principles:
1. Focus on solutions that directly solve customer problems
2. Ensure solutions are feasible and implementable
3. Create strong value propositions
4. Consider competitive differentiation
5. Plan for implementation and scaling

Industry Context: ${industryContext.marketDynamics}
Common Challenges: ${industryContext.commonChallenges}
Validation Metrics: ${industryContext.validationMetrics}

Generate comprehensive solution fit analysis.`
      },
      {
        role: 'user',
        content: `Generate detailed solution fit for this business idea:

Business Idea: ${businessIdea}
Customer Description: ${customerDescription}

Generate a comprehensive solution analysis. Include:

1. solutionDescription: detailed description of the solution
2. keyFeatures: main features and capabilities
3. benefits: specific benefits to customers
4. competitiveAdvantages: how it's different from alternatives
5. valueProposition: clear value proposition
6. implementationRoadmap: how to implement the solution
7. technicalRequirements: technical needs
8. resourceRequirements: resources needed

Return as JSON:
{
  "solution": {
    "description": "string",
    "keyFeatures": ["string"],
    "benefits": ["string"],
    "competitiveAdvantages": ["string"],
    "valueProposition": "string",
    "implementationRoadmap": "string",
    "technicalRequirements": ["string"],
    "resourceRequirements": ["string"]
  },
  "analysis": {
    "summary": "string",
    "recommendations": ["string"],
    "insights": ["string"]
  }
}`
      }
    ];

    const response = await chatCompletion(solutionFitPrompt, 'gpt-4', 0.7);
    
    if (!response) {
      return res.status(500).json({ error: 'Failed to generate solution fit' });
    }

    let solutionFit;
    try {
      const cleanedResponse = response.replace(/```json|```/gi, '').trim();
      solutionFit = JSON.parse(cleanedResponse);
    } catch (parseError) {
      console.error('Failed to parse solution fit response:', parseError);
      return res.status(500).json({ error: 'Failed to parse solution fit response' });
    }

    // Generate validation score for this stage
    let validationScore = null;
    try {
      const validationPrompt = [
        {
          role: 'system',
          content: `You are Sarah Chen, a seasoned entrepreneur evaluating solution fit. Rate this solution on a scale of 1-10.`
        },
        {
          role: 'user',
          content: `Evaluate this solution fit:

Business Idea: ${businessIdea}
Customer Description: ${customerDescription}
Solution: ${JSON.stringify(solutionFit.solution)}

Rate on these criteria:
- Solution Alignment (1-10)
- Solution Effectiveness (1-10)
- Solution Differentiation (1-10)
- Solution Value (1-10)
- Solution Feasibility (1-10)

Return as JSON:
{
  "score": number,
  "criteria": {
    "solutionAlignment": number,
    "solutionEffectiveness": number,
    "solutionDifferentiation": number,
    "solutionValue": number,
    "solutionFeasibility": number
  },
  "recommendations": ["string"],
  "confidence": "high|medium|low",
  "shouldProceed": boolean
}`
        }
      ];
      
      const validationResponse = await chatCompletion(validationPrompt, 'gpt-4', 0.7);
      if (validationResponse) {
        const cleanResponse = validationResponse.replace(/```json|```/gi, '').trim();
        validationScore = JSON.parse(cleanResponse);
      }
    } catch (e) {
      console.error('Failed to generate solution fit validation score:', e);
    }

    res.json({
      solution: solutionFit.solution || {},
      analysis: solutionFit.analysis || {},
      summary: solutionFit.analysis?.summary || 'Solution fit analysis completed',
      validationScore
    });

  } catch (error) {
    console.error('Solution fit generation error:', error);
    res.status(500).json({ error: 'Failed to generate solution fit' });
  }
});

// Market Validation generation endpoint
router.post('/market-validation', async (req, res) => {
  try {
    const { businessIdea, customerDescription, personas, stage } = req.body;
    
    if (!businessIdea || !customerDescription) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const industryContext = getIndustryContext(businessIdea, customerDescription);
    
    const marketValidationPrompt = [
      {
        role: 'system',
        content: `You are an expert in market research and validation. Your goal is to analyze market opportunities and validate business ideas through comprehensive market research.

Key Principles:
1. Analyze market size and opportunity
2. Assess market demand and readiness
3. Evaluate competitive landscape
4. Consider market timing and entry strategy
5. Identify market access and distribution channels

Industry Context: ${industryContext.marketDynamics}
Common Challenges: ${industryContext.commonChallenges}
Validation Metrics: ${industryContext.validationMetrics}

Generate comprehensive market validation analysis.`
      },
      {
        role: 'user',
        content: `Generate detailed market validation for this business idea:

Business Idea: ${businessIdea}
Customer Description: ${customerDescription}

Generate comprehensive market analysis. Include:

1. marketSize: analysis of market size (TAM, SAM, SOM)
2. marketDemand: assessment of market demand
3. marketTiming: evaluation of market timing
4. competitors: competitive landscape analysis
5. marketEntryStrategy: how to enter the market
6. customerDemand: specific customer demand analysis
7. marketTrends: relevant market trends
8. growthPotential: market growth potential

Return as JSON:
{
  "marketData": {
    "marketSize": {
      "tam": "string",
      "sam": "string", 
      "som": "string"
    },
    "marketDemand": "string",
    "marketTiming": "string",
    "competitors": [
      {
        "name": "string",
        "strengths": ["string"],
        "weaknesses": ["string"],
        "marketShare": "string"
      }
    ],
    "marketEntryStrategy": "string",
    "customerDemand": "string",
    "marketTrends": ["string"],
    "growthPotential": "string"
  },
  "validationTests": [
    {
      "test": "string",
      "method": "string",
      "expectedOutcome": "string"
    }
  ],
  "analysis": {
    "summary": "string",
    "recommendations": ["string"],
    "insights": ["string"]
  }
}`
      }
    ];

    const response = await chatCompletion(marketValidationPrompt, 'gpt-4', 0.7);
    
    if (!response) {
      return res.status(500).json({ error: 'Failed to generate market validation' });
    }

    let marketValidation;
    try {
      const cleanedResponse = response.replace(/```json|```/gi, '').trim();
      marketValidation = JSON.parse(cleanedResponse);
    } catch (parseError) {
      console.error('Failed to parse market validation response:', parseError);
      return res.status(500).json({ error: 'Failed to parse market validation response' });
    }

    // Generate validation score for this stage
    let validationScore = null;
    try {
      const validationPrompt = [
        {
          role: 'system',
          content: `You are Sarah Chen, a seasoned entrepreneur evaluating market validation. Rate this market analysis on a scale of 1-10.`
        },
        {
          role: 'user',
          content: `Evaluate this market validation:

Business Idea: ${businessIdea}
Customer Description: ${customerDescription}
Market Data: ${JSON.stringify(marketValidation.marketData)}

Rate on these criteria:
- Market Size (1-10)
- Market Demand (1-10)
- Market Timing (1-10)
- Competitive Landscape (1-10)
- Market Access (1-10)

Return as JSON:
{
  "score": number,
  "criteria": {
    "marketSize": number,
    "marketDemand": number,
    "marketTiming": number,
    "competitiveLandscape": number,
    "marketAccess": number
  },
  "recommendations": ["string"],
  "confidence": "high|medium|low",
  "shouldProceed": boolean
}`
        }
      ];
      
      const validationResponse = await chatCompletion(validationPrompt, 'gpt-4', 0.7);
      if (validationResponse) {
        const cleanResponse = validationResponse.replace(/```json|```/gi, '').trim();
        validationScore = JSON.parse(cleanResponse);
      }
    } catch (e) {
      console.error('Failed to generate market validation score:', e);
    }

    res.json({
      marketData: marketValidation.marketData || {},
      competitors: marketValidation.marketData?.competitors || [],
      validationTests: marketValidation.validationTests || [],
      analysis: marketValidation.analysis || {},
      summary: marketValidation.analysis?.summary || 'Market validation analysis completed',
      validationScore
    });

  } catch (error) {
    console.error('Market validation generation error:', error);
    res.status(500).json({ error: 'Failed to generate market validation' });
  }
});

// Business Model generation endpoint
router.post('/business-models', async (req, res) => {
  try {
    const { businessIdea, customerDescription, personas, stage } = req.body;
    
    if (!businessIdea || !customerDescription) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const industryContext = getIndustryContext(businessIdea, customerDescription);
    
    const businessModelPrompt = [
      {
        role: 'system',
        content: `You are an expert business model strategist with deep experience in startup business models, revenue streams, and financial modeling. Your goal is to generate comprehensive business models for early-stage business ideas.

Key Principles:
1. Focus on viable, scalable business models
2. Include realistic revenue streams and pricing
3. Consider cost structure and profitability
4. Address competitive positioning
5. Plan for scalability and growth

Industry Context: ${industryContext.marketDynamics}
Common Challenges: ${industryContext.commonChallenges}
Validation Metrics: ${industryContext.validationMetrics}

Generate 3-4 different business model options that could work for this business idea.`
      },
      {
        role: 'user',
        content: `Generate comprehensive business models for this business idea:

Business Idea: ${businessIdea}
Customer Description: ${customerDescription}

Generate 3-4 different business model options. For each model, include:

1. name: descriptive name for the business model
2. description: detailed description of how the model works
3. revenueStreams: array of revenue streams with name, type, price, frequency
4. costStructure: breakdown of fixed and variable costs
5. advantages: key advantages of this model
6. challenges: potential challenges or risks
7. scalability: how this model can scale
8. targetMarket: specific market segment this model targets

Return as JSON:
{
  "models": [
    {
      "name": "string",
      "description": "string", 
      "revenueStreams": [
        {
          "name": "string",
          "type": "subscription|one-time|freemium|licensing",
          "price": number,
          "frequency": "string"
        }
      ],
      "costStructure": {
        "fixedCosts": number,
        "variableCosts": number,
        "breakdown": {}
      },
      "advantages": ["string"],
      "challenges": ["string"],
      "scalability": "string",
      "targetMarket": "string"
    }
  ],
  "analysis": {
    "summary": "string",
    "recommendations": ["string"],
    "financialProjections": {
      "monthlyRevenue": [number],
      "annualRevenue": [number],
      "grossMargin": number,
      "netMargin": number,
      "breakEvenPoint": number
    }
  }
}`
      }
    ];

    const response = await chatCompletion(businessModelPrompt, 'gpt-4', 0.7);
    
    if (!response) {
      return res.status(500).json({ error: 'Failed to generate business models' });
    }

    let businessModels;
    try {
      const cleanedResponse = response.replace(/```json|```/gi, '').trim();
      businessModels = JSON.parse(cleanedResponse);
    } catch (parseError) {
      console.error('Failed to parse business models response:', parseError);
      return res.status(500).json({ error: 'Failed to parse business models response' });
    }

    // Generate validation score for this stage
    let validationScore = null;
    try {
      const validationPrompt = [
        {
          role: 'system',
          content: `You are Sarah Chen, a seasoned entrepreneur evaluating business models. Rate this business model on a scale of 1-10.`
        },
        {
          role: 'user',
          content: `Evaluate this business model:

Business Idea: ${businessIdea}
Customer Description: ${customerDescription}
Business Models: ${JSON.stringify(businessModels.models)}

Rate on these criteria:
- Model Viability (1-10)
- Revenue Potential (1-10) 
- Cost Efficiency (1-10)
- Competitive Advantage (1-10)
- Scalability (1-10)

Return as JSON:
{
  "score": number,
  "criteria": {
    "modelViability": number,
    "revenuePotential": number,
    "costEfficiency": number,
    "competitiveAdvantage": number,
    "scalability": number
  },
  "recommendations": ["string"],
  "confidence": "high|medium|low",
  "shouldProceed": boolean
}`
        }
      ];
      
      const validationResponse = await chatCompletion(validationPrompt, 'gpt-4', 0.7);
      if (validationResponse) {
        const cleanResponse = validationResponse.replace(/```json|```/gi, '').trim();
        validationScore = JSON.parse(cleanResponse);
      }
    } catch (e) {
      console.error('Failed to generate business model validation score:', e);
    }

    res.json({
      models: businessModels.models || [],
      analysis: businessModels.analysis || {},
      financialProjections: businessModels.analysis?.financialProjections || {},
      summary: businessModels.analysis?.summary || 'Business model analysis completed',
      validationScore
    });

  } catch (error) {
    console.error('Business models generation error:', error);
    res.status(500).json({ error: 'Failed to generate business models' });
  }
});

// Customer Profile improvement endpoint
router.post('/customer-profile-improve', async (req, res) => {
  try {
    const { businessIdea, customerDescription, currentValidationScore, validationCriteria, recommendations, discoveredProblems, planData, businessPlanId } = AutoImproveSchema.extend({ businessPlanId: z.string() }).parse(req.body);

    // Create a comprehensive prompt for AI improvement of customer profile sections
    const improvementPrompt = `You are an expert business consultant helping to improve the customer profile section of a business plan.

CURRENT BUSINESS PLAN:
Business Idea: ${businessIdea}
Customer Description: ${customerDescription}

CURRENT VALIDATION SCORE: ${currentValidationScore}/10

VALIDATION CRITERIA SCORES:
- Customer Clarity: ${validationCriteria.customerClarity || validationCriteria.problemIdentification || 0}/10
- Customer Specificity: ${validationCriteria.customerSpecificity || validationCriteria.problemValidation || 0}/10
- Customer Relevance: ${validationCriteria.customerRelevance || validationCriteria.problemScope || 0}/10
- Customer Accessibility: ${validationCriteria.customerAccessibility || validationCriteria.problemUrgency || 0}/10
- Customer Value: ${validationCriteria.customerValue || validationCriteria.problemImpact || 0}/10

SPECIFIC RECOMMENDATIONS TO ADDRESS:
${recommendations.map(rec => `- ${rec}`).join('\n')}

${discoveredProblems && discoveredProblems.length > 0 ? `DISCOVERED PROBLEMS TO INCORPORATE:
${discoveredProblems.map(prob => `- ${prob}`).join('\n')}` : ''}

EXISTING BUSINESS PLAN SECTIONS:
${planData?.sections ? Object.entries(planData.sections).map(([key, content]) => `${key}: ${content}`).join('\n') : 'No existing sections'}

TASK: Improve the customer profile sections to address validation gaps and create a more specific, actionable customer description. Focus on:

1. **Customer Clarity**: Make the customer description crystal clear and unambiguous
2. **Customer Specificity**: Add specific demographics, behaviors, and characteristics
3. **Customer Relevance**: Ensure the customer description directly relates to the business idea
4. **Customer Accessibility**: Show how these customers can be reached and engaged
5. **Customer Value**: Demonstrate the value these customers bring to the business

IMPROVEMENT GUIDELINES:
- Be specific and concrete about customer characteristics
- Include quantifiable demographics where possible
- Add behavioral patterns and preferences
- Show clear customer segments if applicable
- Include customer pain points and motivations
- Demonstrate how customers can be reached
- Show the business value of serving these customers
- Use active voice and clear language
- Keep sections concise but comprehensive

Provide improved versions of the customer profile sections in this JSON format:
{
  "customerDescription": "improved customer description with specific demographics and behaviors",
  "customerSegments": ["segment 1", "segment 2", "segment 3"],
  "customerPainPoints": ["pain point 1", "pain point 2", "pain point 3"],
  "customerMotivations": ["motivation 1", "motivation 2", "motivation 3"],
  "customerAccessibility": "how to reach and engage these customers",
  "customerValue": "the business value of serving these customers"
}`;

    const response = await chatCompletion([
      {
        role: 'system',
        content: 'You are an expert business consultant specializing in customer profile development and market segmentation. You help startups create clear, specific, and actionable customer descriptions that drive business success.'
      },
      {
        role: 'user',
        content: improvementPrompt
      }
    ], 'gpt-4', 0.7);

    if (!response) {
      return res.status(500).json({ error: 'Failed to generate improved customer profile sections' });
    }

    // Parse the JSON response and clean it
    let improvedSections;
    try {
      // Clean the response to remove "Variation 1:" prefixes
      const cleanedResponse = response.replace(/^Variation\s+\d+:\s*/gi, '');
      improvedSections = JSON.parse(cleanedResponse);
    } catch (parseError) {
      // If JSON parsing fails, create a fallback with just the customer description
      improvedSections = {
        customerDescription: response.replace(/^Variation\s+\d+:\s*/gi, ''),
        customerSegments: ["Customer segments will be refined"],
        customerPainPoints: ["Customer pain points will be refined"],
        customerMotivations: ["Customer motivations will be refined"],
        customerAccessibility: "Customer accessibility will be enhanced",
        customerValue: "Customer value will be clarified"
      };
    }

    // After improvedSections is finalized, merge into business plan
    if (!businessPlanId) {
      return res.status(400).json({ error: 'Missing businessPlanId' });
    }
    const plan = await BusinessPlan.findById(businessPlanId);
    if (!plan) {
      return res.status(404).json({ error: 'Business plan not found' });
    }
    plan.sections = { ...plan.sections, ...improvedSections };
    await plan.save();

    res.json({
      improvedSections,
      improvements: recommendations,
      originalScore: currentValidationScore,
      expectedImprovement: 'The improved customer profile should address validation gaps and increase the overall score.'
    });

  } catch (error) {
    console.error('Customer profile improve error:', error);
    res.status(500).json({ error: 'Failed to improve customer profile sections' });
  }
});

// Customer Struggle improvement endpoint
router.post('/customer-struggle-improve', async (req, res) => {
  try {
    const { businessIdea, customerDescription, currentValidationScore, validationCriteria, recommendations, discoveredProblems, planData } = AutoImproveSchema.parse(req.body);

    // Create a comprehensive prompt for AI improvement of customer struggle sections
    const improvementPrompt = `You are an expert business consultant helping to improve the customer struggle section of a business plan.

CURRENT BUSINESS PLAN:
Business Idea: ${businessIdea}
Customer Description: ${customerDescription}

CURRENT VALIDATION SCORE: ${currentValidationScore}/10

VALIDATION CRITERIA SCORES:
- Struggle Identification: ${validationCriteria.struggleIdentification || 0}/10
- Struggle Validation: ${validationCriteria.struggleValidation || 0}/10
- Struggle Urgency: ${validationCriteria.struggleUrgency || 0}/10
- Struggle Frequency: ${validationCriteria.struggleFrequency || 0}/10
- Struggle Impact: ${validationCriteria.struggleImpact || 0}/10

SPECIFIC RECOMMENDATIONS TO ADDRESS:
${recommendations.map(rec => `- ${rec}`).join('\n')}

${discoveredProblems && discoveredProblems.length > 0 ? `DISCOVERED PROBLEMS TO INCORPORATE:
${discoveredProblems.map(prob => `- ${prob}`).join('\n')}` : ''}

EXISTING BUSINESS PLAN SECTIONS:
${planData?.sections ? Object.entries(planData.sections).map(([key, content]) => `${key}: ${content}`).join('\n') : 'No existing sections'}

TASK: Improve the customer struggle sections to address validation gaps and create more compelling, evidence-based customer pain points. Focus on:

1. **Struggle Identification**: Make customer struggles crystal clear and specific
2. **Struggle Validation**: Provide evidence that these struggles actually exist
3. **Struggle Urgency**: Show how urgent these problems are for customers
4. **Struggle Frequency**: Demonstrate how often customers face these problems
5. **Struggle Impact**: Show the significant impact these problems have on customers

IMPROVEMENT GUIDELINES:
- Be specific and concrete about customer struggles
- Include quantifiable evidence where possible
- Add behavioral patterns and pain point frequency
- Show clear impact on customer productivity, costs, or satisfaction
- Include customer quotes or feedback if available
- Demonstrate urgency and willingness to pay
- Use active voice and clear language
- Keep sections concise but comprehensive

Provide improved versions of the customer struggle sections in this JSON format:
{
  "customerStruggles": ["struggle 1 with evidence", "struggle 2 with evidence", "struggle 3 with evidence"],
  "struggleEvidence": ["evidence 1", "evidence 2", "evidence 3"],
  "struggleFrequency": "how often these struggles occur",
  "struggleImpact": "specific impact on customers",
  "struggleUrgency": "why customers need solutions now",
  "customerQuotes": ["quote 1", "quote 2", "quote 3"]
}`;

    const response = await chatCompletion([
      {
        role: 'system',
        content: 'You are an expert business consultant specializing in customer pain point identification and validation. You help startups create compelling, evidence-based customer struggle descriptions that drive product development and market validation.'
      },
      {
        role: 'user',
        content: improvementPrompt
      }
    ], 'gpt-4', 0.7);

    if (!response) {
      return res.status(500).json({ error: 'Failed to generate improved customer struggle sections' });
    }

    // Parse the JSON response and clean it
    let improvedSections;
    try {
      // Clean the response to remove "Variation 1:" prefixes
      const cleanedResponse = response.replace(/^Variation\s+\d+:\s*/gi, '');
      improvedSections = JSON.parse(cleanedResponse);
    } catch (parseError) {
      // If JSON parsing fails, create a fallback with just the customer struggles
      improvedSections = {
        customerStruggles: [response.replace(/^Variation\s+\d+:\s*/gi, '')],
        struggleEvidence: ["Evidence will be refined"],
        struggleFrequency: "Frequency will be clarified",
        struggleImpact: "Impact will be quantified",
        struggleUrgency: "Urgency will be demonstrated",
        customerQuotes: ["Customer quotes will be added"]
      };
    }

    res.json({
      improvedSections,
      improvements: recommendations,
      originalScore: currentValidationScore,
      expectedImprovement: 'The improved customer struggles should address validation gaps and increase the overall score.'
    });

  } catch (error) {
    console.error('Customer struggle improve error:', error);
    res.status(500).json({ error: 'Failed to improve customer struggle sections' });
  }
});

// Solution Fit improvement endpoint
router.post('/solution-fit-improve', async (req, res) => {
  try {
    const { businessIdea, customerDescription, currentValidationScore, validationCriteria, recommendations, discoveredProblems, planData } = AutoImproveSchema.parse(req.body);

    // Create a comprehensive prompt for AI improvement of solution fit sections
    const improvementPrompt = `You are an expert business consultant helping to improve the solution fit section of a business plan.

CURRENT BUSINESS PLAN:
Business Idea: ${businessIdea}
Customer Description: ${customerDescription}

CURRENT VALIDATION SCORE: ${currentValidationScore}/10

VALIDATION CRITERIA SCORES:
- Solution Alignment: ${validationCriteria.solutionAlignment || 0}/10
- Solution Effectiveness: ${validationCriteria.solutionEffectiveness || 0}/10
- Solution Differentiation: ${validationCriteria.solutionDifferentiation || 0}/10
- Solution Value: ${validationCriteria.solutionValue || 0}/10
- Solution Feasibility: ${validationCriteria.solutionFeasibility || 0}/10

SPECIFIC RECOMMENDATIONS TO ADDRESS:
${recommendations.map(rec => `- ${rec}`).join('\n')}

${discoveredProblems && discoveredProblems.length > 0 ? `DISCOVERED PROBLEMS TO INCORPORATE:
${discoveredProblems.map(prob => `- ${prob}`).join('\n')}` : ''}

EXISTING BUSINESS PLAN SECTIONS:
${planData?.sections ? Object.entries(planData.sections).map(([key, content]) => `${key}: ${content}`).join('\n') : 'No existing sections'}

TASK: Improve the solution fit sections to address validation gaps and create a more compelling, differentiated solution. Focus on:

1. **Solution Alignment**: Ensure the solution perfectly matches customer needs
2. **Solution Effectiveness**: Show how the solution effectively solves the problem
3. **Solution Differentiation**: Highlight unique advantages over alternatives
4. **Solution Value**: Demonstrate clear value proposition to customers
5. **Solution Feasibility**: Show how the solution can be implemented

IMPROVEMENT GUIDELINES:
- Be specific and concrete about the solution
- Include quantifiable benefits where possible
- Add unique features and capabilities
- Show clear competitive advantages
- Include implementation roadmap if relevant
- Demonstrate customer value clearly
- Use active voice and clear language
- Keep sections concise but comprehensive

Provide improved versions of the solution fit sections in this JSON format:
{
  "solutionDescription": "improved solution description with specific features",
  "solutionFeatures": ["feature 1", "feature 2", "feature 3"],
  "solutionBenefits": ["benefit 1", "benefit 2", "benefit 3"],
  "competitiveAdvantages": ["advantage 1", "advantage 2", "advantage 3"],
  "valueProposition": "clear value proposition for customers",
  "implementationRoadmap": "how the solution will be implemented"
}`;

    const response = await chatCompletion([
      {
        role: 'system',
        content: 'You are an expert business consultant specializing in product-market fit and solution development. You help startups create compelling, differentiated solutions that effectively address customer needs and provide clear competitive advantages.'
      },
      {
        role: 'user',
        content: improvementPrompt
      }
    ], 'gpt-4', 0.7);

    if (!response) {
      return res.status(500).json({ error: 'Failed to generate improved solution fit sections' });
    }

    // Parse the JSON response and clean it
    let improvedSections;
    try {
      // Clean the response to remove "Variation 1:" prefixes
      const cleanedResponse = response.replace(/^Variation\s+\d+:\s*/gi, '');
      improvedSections = JSON.parse(cleanedResponse);
    } catch (parseError) {
      // If JSON parsing fails, create a fallback with just the solution description
      improvedSections = {
        solutionDescription: response.replace(/^Variation\s+\d+:\s*/gi, ''),
        solutionFeatures: ["Features will be refined"],
        solutionBenefits: ["Benefits will be clarified"],
        competitiveAdvantages: ["Advantages will be highlighted"],
        valueProposition: "Value proposition will be enhanced",
        implementationRoadmap: "Implementation roadmap will be detailed"
      };
    }

    res.json({
      improvedSections,
      improvements: recommendations,
      originalScore: currentValidationScore,
      expectedImprovement: 'The improved solution fit should address validation gaps and increase the overall score.'
    });

  } catch (error) {
    console.error('Solution fit improve error:', error);
    res.status(500).json({ error: 'Failed to improve solution fit sections' });
  }
});

// Business Model improvement endpoint
router.post('/business-model-improve', async (req, res) => {
  try {
    const { businessIdea, customerDescription, currentValidationScore, validationCriteria, recommendations, discoveredProblems, planData } = AutoImproveSchema.parse(req.body);

    // Create a comprehensive prompt for AI improvement of business model sections
    const improvementPrompt = `You are an expert business consultant helping to improve the business model section of a business plan.

CURRENT BUSINESS PLAN:
Business Idea: ${businessIdea}
Customer Description: ${customerDescription}

CURRENT VALIDATION SCORE: ${currentValidationScore}/10

VALIDATION CRITERIA SCORES:
- Model Viability: ${validationCriteria.modelViability || 0}/10
- Revenue Potential: ${validationCriteria.revenuePotential || 0}/10
- Cost Efficiency: ${validationCriteria.costEfficiency || 0}/10
- Competitive Advantage: ${validationCriteria.competitiveAdvantage || 0}/10
- Scalability: ${validationCriteria.scalability || 0}/10

SPECIFIC RECOMMENDATIONS TO ADDRESS:
${recommendations.map(rec => `- ${rec}`).join('\n')}

${discoveredProblems && discoveredProblems.length > 0 ? `DISCOVERED PROBLEMS TO INCORPORATE:
${discoveredProblems.map(prob => `- ${prob}`).join('\n')}` : ''}

EXISTING BUSINESS PLAN SECTIONS:
${planData?.sections ? Object.entries(planData.sections).map(([key, content]) => `${key}: ${content}`).join('\n') : 'No existing sections'}

TASK: Improve the business model sections to address validation gaps and create a more viable, scalable business model. Focus on:

1. **Model Viability**: Ensure the business model is fundamentally sound
2. **Revenue Potential**: Show strong revenue generation capabilities
3. **Cost Efficiency**: Demonstrate efficient cost structure and margins
4. **Competitive Advantage**: Highlight sustainable competitive advantages
5. **Scalability**: Show how the model can scale effectively

IMPROVEMENT GUIDELINES:
- Be specific and concrete about revenue streams
- Include quantifiable financial projections where possible
- Add detailed cost structure analysis
- Show clear competitive positioning
- Include scalability factors and growth strategy
- Demonstrate sustainable competitive advantages
- Use active voice and clear language
- Keep sections concise but comprehensive

Provide improved versions of the business model sections in this JSON format:
{
  "revenueModel": "detailed revenue model with pricing strategy",
  "costStructure": "efficient cost structure with breakdown",
  "pricingStrategy": "competitive pricing strategy with justification",
  "competitiveAdvantages": ["advantage 1", "advantage 2", "advantage 3"],
  "scalabilityFactors": ["factor 1", "factor 2", "factor 3"],
  "growthStrategy": "how the business will scale and grow"
}`;

    const response = await chatCompletion([
      {
        role: 'system',
        content: 'You are an expert business consultant specializing in business model design and financial planning. You help startups create viable, scalable business models with strong revenue potential and sustainable competitive advantages.'
      },
      {
        role: 'user',
        content: improvementPrompt
      }
    ], 'gpt-4', 0.7);

    if (!response) {
      return res.status(500).json({ error: 'Failed to generate improved business model sections' });
    }

    // Parse the JSON response and clean it
    let improvedSections;
    try {
      // Clean the response to remove "Variation 1:" prefixes
      const cleanedResponse = response.replace(/^Variation\s+\d+:\s*/gi, '');
      improvedSections = JSON.parse(cleanedResponse);
    } catch (parseError) {
      // If JSON parsing fails, create a fallback with just the revenue model
      improvedSections = {
        revenueModel: response.replace(/^Variation\s+\d+:\s*/gi, ''),
        costStructure: "Cost structure will be detailed",
        pricingStrategy: "Pricing strategy will be refined",
        competitiveAdvantages: ["Advantages will be highlighted"],
        scalabilityFactors: ["Scalability factors will be identified"],
        growthStrategy: "Growth strategy will be developed"
      };
    }

    res.json({
      improvedSections,
      improvements: recommendations,
      originalScore: currentValidationScore,
      expectedImprovement: 'The improved business model should address validation gaps and increase the overall score.'
    });

  } catch (error) {
    console.error('Business model improve error:', error);
    res.status(500).json({ error: 'Failed to improve business model sections' });
  }
});

// Market Validation improvement endpoint
router.post('/market-validation-improve', async (req, res) => {
  try {
    const { businessIdea, customerDescription, currentValidationScore, validationCriteria, recommendations, discoveredProblems, planData } = AutoImproveSchema.parse(req.body);

    // Create a comprehensive prompt for AI improvement of market validation sections
    const improvementPrompt = `You are an expert business consultant helping to improve the market validation section of a business plan.

CURRENT BUSINESS PLAN:
Business Idea: ${businessIdea}
Customer Description: ${customerDescription}

CURRENT VALIDATION SCORE: ${currentValidationScore}/10

VALIDATION CRITERIA SCORES:
- Market Size: ${validationCriteria.marketSize || 0}/10
- Market Demand: ${validationCriteria.marketDemand || 0}/10
- Market Timing: ${validationCriteria.marketTiming || 0}/10
- Competitive Landscape: ${validationCriteria.competitiveLandscape || 0}/10
- Market Access: ${validationCriteria.marketAccess || 0}/10

SPECIFIC RECOMMENDATIONS TO ADDRESS:
${recommendations.map(rec => `- ${rec}`).join('\n')}

${discoveredProblems && discoveredProblems.length > 0 ? `DISCOVERED PROBLEMS TO INCORPORATE:
${discoveredProblems.map(prob => `- ${prob}`).join('\n')}` : ''}

EXISTING BUSINESS PLAN SECTIONS:
${planData?.sections ? Object.entries(planData.sections).map(([key, content]) => `${key}: ${content}`).join('\n') : 'No existing sections'}

TASK: Improve the market validation sections to address validation gaps and create a more compelling market opportunity. Focus on:

1. **Market Size**: Show significant market opportunity with TAM/SAM/SOM
2. **Market Demand**: Demonstrate strong customer demand and willingness to pay
3. **Market Timing**: Show why now is the right time to enter the market
4. **Competitive Landscape**: Position effectively against competition
5. **Market Access**: Show how to reach and serve the market effectively

IMPROVEMENT GUIDELINES:
- Be specific and concrete about market size
- Include quantifiable market data where possible
- Add detailed competitive analysis
- Show clear market entry strategy
- Include customer demand evidence
- Demonstrate market timing advantages
- Use active voice and clear language
- Keep sections concise but comprehensive

Provide improved versions of the market validation sections in this JSON format:
{
  "marketSize": "detailed market size analysis with TAM/SAM/SOM",
  "marketDemand": "evidence of strong customer demand",
  "marketTiming": "why now is the right time to enter",
  "competitiveAnalysis": "detailed competitive landscape analysis",
  "marketEntryStrategy": "how to enter and capture the market",
  "customerDemand": "specific evidence of customer demand"
}`;

    const response = await chatCompletion([
      {
        role: 'system',
        content: 'You are an expert business consultant specializing in market research and validation. You help startups identify compelling market opportunities with strong demand, favorable timing, and clear competitive positioning.'
      },
      {
        role: 'user',
        content: improvementPrompt
      }
    ], 'gpt-4', 0.7);

    if (!response) {
      return res.status(500).json({ error: 'Failed to generate improved market validation sections' });
    }

    // Parse the JSON response and clean it
    let improvedSections;
    try {
      // Clean the response to remove "Variation 1:" prefixes
      const cleanedResponse = response.replace(/^Variation\s+\d+:\s*/gi, '');
      improvedSections = JSON.parse(cleanedResponse);
    } catch (parseError) {
      // If JSON parsing fails, create a fallback with just the market size
      improvedSections = {
        marketSize: response.replace(/^Variation\s+\d+:\s*/gi, ''),
        marketDemand: "Market demand will be validated",
        marketTiming: "Market timing will be analyzed",
        competitiveAnalysis: "Competitive analysis will be detailed",
        marketEntryStrategy: "Market entry strategy will be developed",
        customerDemand: "Customer demand will be quantified"
      };
    }

    res.json({
      improvedSections,
      improvements: recommendations,
      originalScore: currentValidationScore,
      expectedImprovement: 'The improved market validation should address validation gaps and increase the overall score.'
    });

  } catch (error) {
    console.error('Market validation improve error:', error);
    res.status(500).json({ error: 'Failed to improve market validation sections' });
  }
});

// Save evaluation endpoint
router.post('/save-evaluation', async (req, res) => {
  try {
    const { businessPlanId, stage, score, feedback, personas } = req.body;
    
    if (!businessPlanId || stage === undefined || score === undefined) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Here you would typically save to a database
    // For now, we'll return a mock response
    const evaluation = {
      businessPlanId,
      stage: stage.toString(),
      score,
      feedback,
      personas,
      completedAt: new Date(),
      validationScore: {
        score,
        criteria: getStageCriteria(stage),
        recommendations: [],
        confidence: score >= 7 ? 'high' : score >= 4 ? 'medium' : 'low',
        shouldProceed: score >= 7
      }
    };

    // Mock database save - in real implementation, save to database
    console.log('Saving evaluation:', evaluation);

    // Determine completed stages based on the current stage
    const completedStages = [];
    for (let i = 0; i <= parseInt(stage); i++) {
      completedStages.push(i.toString());
    }

    res.json({
      success: true,
      evaluation,
      completedStages,
      currentStage: parseInt(stage)
    });

  } catch (error) {
    console.error('Save evaluation error:', error);
    res.status(500).json({ error: 'Failed to save evaluation' });
  }
});

// Load evaluation for a specific stage
router.get('/evaluation/:businessPlanId/:stage', async (req, res) => {
  try {
    const { businessPlanId, stage } = req.params;
    
    if (!businessPlanId || stage === undefined) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Mock database retrieval - in real implementation, fetch from database
    const mockEvaluation = {
      businessPlanId,
      stage: stage.toString(),
      score: Math.floor(Math.random() * 4) + 6, // Mock score between 6-9
      feedback: `Mock feedback for stage ${stage}`,
      personas: [
        {
          id: '1',
          name: 'Mock Persona',
          summary: 'This is a mock persona for testing',
          role: 'Decision Maker',
          companySize: '10-50 employees',
          industry: 'Technology',
          feedback: ['Positive feedback'],
          feedbackQuality: 'good' as const
        }
      ],
      completedAt: new Date(),
      validationScore: {
        score: Math.floor(Math.random() * 4) + 6,
        criteria: getStageCriteria(parseInt(stage)),
        recommendations: ['Mock recommendation'],
        confidence: 'medium' as const,
        shouldProceed: true
      }
    };

    res.json({
      success: true,
      evaluation: mockEvaluation
    });

  } catch (error) {
    console.error('Load evaluation error:', error);
    res.status(500).json({ error: 'Failed to load evaluation' });
  }
});

// Load all evaluations for a business plan
router.get('/load-evaluations/:businessPlanId', async (req, res) => {
  try {
    const { businessPlanId } = req.params;
    
    if (!businessPlanId) {
      return res.status(400).json({ error: 'Missing business plan ID' });
    }

    // Mock database retrieval - in real implementation, fetch from database
    // For new business plans, return empty evaluations and no completed stages
    const mockEvaluations: { [key: number]: any } = {};
    const completedStages: string[] = [];
    
    // Check if this business plan has any existing evaluations
    // In a real implementation, this would query the database
    const hasExistingEvaluations = false; // For new business plans, this should be false
    
    if (hasExistingEvaluations) {
      // Only generate mock data if the business plan has actually been evaluated
      for (let stage = 0; stage <= 6; stage++) {
        const score = Math.floor(Math.random() * 4) + 6; // Mock score between 6-9
        mockEvaluations[stage] = {
          businessPlanId,
          stage: stage.toString(),
          score,
          feedback: `Mock feedback for stage ${stage}`,
          personas: [
            {
              id: '1',
              name: `Mock Persona ${stage + 1}`,
              summary: `This is a mock persona for stage ${stage}`,
              role: 'Decision Maker',
              companySize: '10-50 employees',
              industry: 'Technology',
              feedback: ['Positive feedback'],
              feedbackQuality: 'good' as const
            }
          ],
          completedAt: new Date(),
          validationScore: {
            score,
            criteria: getStageCriteria(stage),
            recommendations: [`Mock recommendation for stage ${stage}`],
            confidence: 'medium' as const,
            shouldProceed: true
          }
        };
        completedStages.push(stage.toString());
      }
    }

    res.json({
      success: true,
      evaluations: mockEvaluations,
      completedStages,
      currentStage: 0 // Start at stage 0 for new business plans
    });

  } catch (error) {
    console.error('Load evaluations error:', error);
    res.status(500).json({ error: 'Failed to load evaluations' });
  }
});

// Re-evaluate a specific stage
router.post('/reevaluate-stage', async (req, res) => {
  try {
    const { businessPlanId, stage, businessIdea, customerDescription } = req.body;
    
    if (!businessPlanId || stage === undefined || !businessIdea || !customerDescription) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Mock re-evaluation - in real implementation, run actual evaluation
    const mockEvaluation = {
      businessPlanId,
      stage: stage.toString(),
      score: Math.floor(Math.random() * 4) + 6, // Mock score between 6-9
      feedback: `Re-evaluated feedback for stage ${stage}`,
      personas: [
        {
          id: '1',
          name: 'Re-evaluated Persona',
          summary: 'This is a re-evaluated persona',
          role: 'Decision Maker',
          companySize: '10-50 employees',
          industry: 'Technology',
          feedback: ['Updated feedback'],
          feedbackQuality: 'good' as const
        }
      ],
      completedAt: new Date(),
      validationScore: {
        score: Math.floor(Math.random() * 4) + 6,
        criteria: getStageCriteria(parseInt(stage)),
        recommendations: ['Updated recommendation'],
        confidence: 'medium' as const,
        shouldProceed: true
      }
    };

    res.json({
      success: true,
      evaluation: mockEvaluation
    });

  } catch (error) {
    console.error('Re-evaluate stage error:', error);
    res.status(500).json({ error: 'Failed to re-evaluate stage' });
  }
});

// Helper function to get stage-specific criteria
function getStageCriteria(stage: number) {
  const baseCriteria = {
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
  };

  // Set stage-specific criteria based on stage number
  switch (stage) {
    case 0: // Problem Discovery
      return {
        ...baseCriteria,
        problemIdentification: 8,
        problemValidation: 7,
        problemScope: 7,
        problemUrgency: 8,
        problemImpact: 8,
      };
    case 1: // Customer Profile
      return {
        ...baseCriteria,
        customerClarity: 8,
        customerSpecificity: 7,
        customerRelevance: 8,
        customerAccessibility: 7,
        customerValue: 8,
      };
    case 2: // Customer Struggle
      return {
        ...baseCriteria,
        struggleIdentification: 8,
        struggleValidation: 7,
        struggleUrgency: 7,
        struggleFrequency: 8,
        struggleImpact: 8,
      };
    case 3: // Solution Fit
      return {
        ...baseCriteria,
        solutionAlignment: 8,
        solutionEffectiveness: 7,
        solutionDifferentiation: 8,
        solutionValue: 8,
        solutionFeasibility: 7,
      };
    case 4: // Business Model
      return {
        ...baseCriteria,
        modelViability: 8,
        revenuePotential: 8,
        costEfficiency: 7,
        competitiveAdvantage: 8,
        scalability: 7,
      };
    case 5: // Market Validation
      return {
        ...baseCriteria,
        marketSize: 8,
        marketDemand: 8,
        marketTiming: 7,
        competitiveLandscape: 7,
        marketAccess: 8,
      };
    case 6: // Launch
      return {
        ...baseCriteria,
        // Launch stage doesn't have specific validation criteria
        // It's a summary/completion stage
        problemIdentification: 8,
        problemValidation: 8,
        problemScope: 8,
        problemUrgency: 8,
        problemImpact: 8,
      };
    default:
      return baseCriteria;
  }
}

export default router; 