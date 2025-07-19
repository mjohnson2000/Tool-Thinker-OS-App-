import express from 'express';
import { z } from 'zod';
import { chatCompletion } from '../utils/openai';

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
    problemIdentification: z.number(),
    problemValidation: z.number(),
    problemScope: z.number(),
    problemUrgency: z.number(),
    problemImpact: z.number(),
  }),
  recommendations: z.array(z.string()),
  discoveredProblems: z.array(z.string()).optional(),
  planData: z.object({
    sections: z.record(z.string()).optional(),
  }).optional(),
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

    // Generate problem discovery insights for Problem Discovery stage
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

// Auto-improve problem statement using AI
router.post('/auto-improve', async (req, res) => {
  try {
    const { businessIdea, customerDescription, currentValidationScore, validationCriteria, recommendations, discoveredProblems, planData } = AutoImproveSchema.parse(req.body);

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
      improvedSections = JSON.parse(response);
    } catch (parseError) {
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

export default router; 