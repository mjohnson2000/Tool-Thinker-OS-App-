// Side Hustle Coach AI Agent
// Combines expertise of business coaches, successful entrepreneurs, and side hustlers

export interface CoachEvaluation {
  overallScore: number;
  sideHustleViability: number;
  marketOpportunity: number;
  executionFeasibility: number;
  riskAssessment: number;
  recommendations: string[];
  validationInsights: {
    strengths: string[];
    weaknesses: string[];
    opportunities: string[];
    threats: string[];
  };
  enhancedContent: {
    businessIdeaSummary?: string;
    customerProfile?: string;
    customerStruggles?: string[];
    valueProposition?: string;
    marketInformation?: {
      marketSize: string;
      trends: string[];
      competitors: string[];
    };
    financialSummary?: string;
    sideHustleStrategy?: string;
    executionPlan?: string;
  };
}

export interface CoachProfile {
  name: string;
  title: string;
  expertise: string[];
  experience: string;
  background: string;
}

export const SIDE_HUSTLE_COACH: CoachProfile = {
  name: "Alex Chen",
  title: "Side Hustle Coach & Serial Entrepreneur",
  expertise: [
    "Business Strategy & Validation",
    "Side Hustle Development",
    "Market Research & Analysis",
    "Customer Development",
    "Revenue Model Optimization",
    "Risk Assessment & Mitigation",
    "Execution Planning",
    "Scaling Strategies"
  ],
  experience: "15+ years building and scaling side hustles into successful businesses. Former startup founder, business coach, and mentor to 500+ entrepreneurs.",
  background: "Built 3 successful side hustles into 7-figure businesses. Coached hundreds of entrepreneurs from idea to profitable business. Expert in validating ideas quickly and efficiently while minimizing risk and maximizing success probability."
};

export class SideHustleCoach {
  private coachProfile: CoachProfile;

  constructor() {
    this.coachProfile = SIDE_HUSTLE_COACH;
  }

  async evaluateBusinessPlan(plan: any, userProfile?: any): Promise<CoachEvaluation> {
    console.log('Side Hustle Coach evaluating business plan...');
    
    // Simulate AI processing time
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Analyze the business plan from a side hustle perspective
    const analysis = this.analyzeFromSideHustlePerspective(plan, userProfile);
    
    // Generate enhanced content with coach's expertise
    const enhancedContent = this.generateEnhancedContent(plan, analysis);
    
    // Calculate comprehensive scores
    const scores = this.calculateScores(plan, analysis);
    
    // Generate actionable recommendations
    const recommendations = this.generateRecommendations(plan, analysis, scores);
    
    // Create SWOT analysis
    const swotAnalysis = this.performSWOTAnalysis(plan, analysis);

    return {
      overallScore: scores.overall,
      sideHustleViability: scores.sideHustleViability,
      marketOpportunity: scores.marketOpportunity,
      executionFeasibility: scores.executionFeasibility,
      riskAssessment: scores.riskAssessment,
      recommendations,
      validationInsights: swotAnalysis,
      enhancedContent
    };
  }

  private analyzeFromSideHustlePerspective(plan: any, userProfile?: any) {
    return {
      // Side hustle specific analysis
      timeCommitment: this.assessTimeCommitment(plan),
      resourceRequirements: this.assessResourceRequirements(plan),
      skillGaps: this.identifySkillGaps(plan, userProfile),
      marketTiming: this.assessMarketTiming(plan),
      competitiveAdvantage: this.assessCompetitiveAdvantage(plan),
      scalability: this.assessScalability(plan),
      riskFactors: this.identifyRiskFactors(plan),
      successProbability: this.calculateSuccessProbability(plan)
    };
  }

  private assessTimeCommitment(plan: any): string {
    const complexity = this.getPlanComplexity(plan);
    if (complexity === 'high') {
      return "This is a complex business requiring significant time investment. Consider starting with a MVP to validate before full commitment.";
    } else if (complexity === 'medium') {
      return "Moderate time commitment required. Can be managed alongside other commitments with proper planning.";
    } else {
      return "Low time commitment business model. Ideal for side hustle with gradual scaling potential.";
    }
  }

  private assessResourceRequirements(plan: any): string {
    const financialNeeds = this.estimateFinancialNeeds(plan);
    if (financialNeeds > 10000) {
      return "High initial investment required. Consider bootstrapping strategies or phased approach.";
    } else if (financialNeeds > 1000) {
      return "Moderate investment needed. Can be funded through savings or small loans.";
    } else {
      return "Low capital requirements. Perfect for bootstrapping and organic growth.";
    }
  }

  private identifySkillGaps(plan: any, userProfile?: any): string[] {
    const requiredSkills = this.getRequiredSkills(plan);
    const userSkills = userProfile?.skills || [];
    
    return requiredSkills.filter(skill => !userSkills.includes(skill));
  }

  private assessMarketTiming(plan: any): string {
    const marketTrends = plan.marketInformation?.trends || [];
    if (marketTrends.some((trend: string) => trend.toLowerCase().includes('growing'))) {
      return "Excellent market timing. Industry is growing and demand is increasing.";
    } else if (marketTrends.some((trend: string) => trend.toLowerCase().includes('stable'))) {
      return "Good market timing. Stable market with consistent demand.";
    } else {
      return "Market timing needs consideration. Industry may be declining or saturated.";
    }
  }

  private assessCompetitiveAdvantage(plan: any): string {
    const competitors = plan.marketInformation?.competitors || [];
    const valueProp = plan.valueProposition || '';
    
    if (competitors.length === 0) {
      return "First-mover advantage in untapped market. High potential but also high risk.";
    } else if (competitors.length < 5) {
      return "Moderate competition. Opportunity to differentiate and capture market share.";
    } else {
      return "High competition. Need strong differentiation and unique value proposition.";
    }
  }

  private assessScalability(plan: any): string {
    const businessModel = plan.financialSummary || '';
    if (businessModel.toLowerCase().includes('subscription') || businessModel.toLowerCase().includes('digital')) {
      return "Highly scalable business model. Can grow without proportional increase in costs.";
    } else if (businessModel.toLowerCase().includes('service')) {
      return "Moderately scalable. Limited by time and human resources.";
    } else {
      return "Low scalability. Requires significant resources to scale.";
    }
  }

  private identifyRiskFactors(plan: any): string[] {
    const risks = [];
    
    if (!plan.marketInformation?.marketSize) {
      risks.push("Market size not clearly defined");
    }
    
    if (!plan.customerStruggle || plan.customerStruggle.length === 0) {
      risks.push("Customer pain points not well understood");
    }
    
    if (!plan.valueProposition) {
      risks.push("Value proposition not clearly articulated");
    }
    
    if (!plan.financialSummary) {
      risks.push("Financial model not developed");
    }
    
    return risks;
  }

  private calculateSuccessProbability(plan: any): number {
    let probability = 70; // Base probability
    
    // Adjust based on various factors
    if (this.identifyRiskFactors(plan).length > 3) probability -= 20;
    if (this.assessCompetitiveAdvantage(plan).includes('High competition')) probability -= 15;
    if (this.assessMarketTiming(plan).includes('Excellent')) probability += 10;
    if (this.assessScalability(plan).includes('Highly scalable')) probability += 10;
    
    return Math.max(10, Math.min(95, probability));
  }

  private getPlanComplexity(plan: any): 'low' | 'medium' | 'high' {
    const factors = [
      plan.marketInformation?.competitors?.length || 0,
      plan.customerStruggle?.length || 0,
      plan.financialSummary ? 1 : 0
    ];
    
    const complexity = factors.reduce((sum, factor) => sum + factor, 0);
    
    if (complexity <= 2) return 'low';
    if (complexity <= 5) return 'medium';
    return 'high';
  }

  private estimateFinancialNeeds(plan: any): number {
    // Simple estimation based on business type
    const businessType = this.getBusinessType(plan);
    
    switch (businessType) {
      case 'digital_product': return 500;
      case 'service_business': return 2000;
      case 'physical_product': return 15000;
      case 'marketplace': return 8000;
      default: return 5000;
    }
  }

  private getBusinessType(plan: any): string {
    const summary = plan.businessIdeaSummary?.toLowerCase() || '';
    
    if (summary.includes('app') || summary.includes('software') || summary.includes('digital')) {
      return 'digital_product';
    } else if (summary.includes('service') || summary.includes('consulting')) {
      return 'service_business';
    } else if (summary.includes('product') || summary.includes('manufacturing')) {
      return 'physical_product';
    } else if (summary.includes('marketplace') || summary.includes('platform')) {
      return 'marketplace';
    }
    
    return 'service_business';
  }

  private getRequiredSkills(plan: any): string[] {
    const skills = ['Business Planning', 'Market Research'];
    const businessType = this.getBusinessType(plan);
    
    switch (businessType) {
      case 'digital_product':
        skills.push('Technical Development', 'Product Management', 'User Experience');
        break;
      case 'service_business':
        skills.push('Customer Service', 'Sales', 'Communication');
        break;
      case 'physical_product':
        skills.push('Manufacturing', 'Supply Chain', 'Quality Control');
        break;
      case 'marketplace':
        skills.push('Platform Development', 'Community Building', 'Trust & Safety');
        break;
    }
    
    return skills;
  }

  private calculateScores(plan: any, analysis: any) {
    const sideHustleViability = this.calculateSideHustleViability(plan, analysis);
    const marketOpportunity = this.calculateMarketOpportunity(plan);
    const executionFeasibility = this.calculateExecutionFeasibility(plan, analysis);
    const riskAssessment = this.calculateRiskAssessment(plan, analysis);
    
    const overall = Math.round((sideHustleViability + marketOpportunity + executionFeasibility + riskAssessment) / 4);
    
    return {
      overall,
      sideHustleViability,
      marketOpportunity,
      executionFeasibility,
      riskAssessment
    };
  }

  private calculateSideHustleViability(plan: any, analysis: any): number {
    let score = 70;
    
    if (analysis.timeCommitment.includes('Low')) score += 15;
    if (analysis.resourceRequirements.includes('Low')) score += 10;
    if (analysis.skillGaps.length === 0) score += 10;
    if (analysis.scalability.includes('Highly scalable')) score += 10;
    
    return Math.min(95, score);
  }

  private calculateMarketOpportunity(plan: any): number {
    let score = 70;
    
    const marketSize = plan.marketInformation?.marketSize || '';
    const trends = plan.marketInformation?.trends || [];
    const competitors = plan.marketInformation?.competitors || [];
    
    if (marketSize.includes('growing') || marketSize.includes('significant')) score += 15;
    if (trends.some((t: string) => t.toLowerCase().includes('growing'))) score += 10;
    if (competitors.length < 5) score += 10;
    
    return Math.min(95, score);
  }

  private calculateExecutionFeasibility(plan: any, analysis: any): number {
    let score = 70;
    
    if (analysis.skillGaps.length === 0) score += 15;
    if (analysis.resourceRequirements.includes('Low')) score += 10;
    if (plan.valueProposition) score += 10;
    if (plan.financialSummary) score += 10;
    
    return Math.min(95, score);
  }

  private calculateRiskAssessment(plan: any, analysis: any): number {
    let score = 70;
    
    const riskFactors = analysis.riskFactors;
    score -= riskFactors.length * 10;
    
    if (analysis.successProbability > 80) score += 15;
    if (analysis.competitiveAdvantage.includes('First-mover')) score += 10;
    
    return Math.max(10, Math.min(95, score));
  }

  private generateRecommendations(plan: any, analysis: any, scores: any): string[] {
    const recommendations = [];
    
    // Side hustle specific recommendations
    if (scores.sideHustleViability < 70) {
      recommendations.push("Consider starting with a simpler MVP to validate the concept before full commitment");
    }
    
    if (analysis.skillGaps.length > 0) {
      recommendations.push(`Develop skills in: ${analysis.skillGaps.join(', ')} or consider partnering with someone who has these skills`);
    }
    
    if (analysis.resourceRequirements.includes('High')) {
      recommendations.push("Explore bootstrapping strategies and phased approach to reduce initial investment");
    }
    
    if (scores.marketOpportunity < 70) {
      recommendations.push("Conduct deeper market research to identify underserved segments or pivot to a more promising market");
    }
    
    if (scores.executionFeasibility < 70) {
      recommendations.push("Break down the business into smaller, manageable phases to reduce complexity");
    }
    
    if (scores.riskAssessment < 70) {
      recommendations.push("Develop risk mitigation strategies and contingency plans for identified risk factors");
    }
    
    // General business recommendations
    recommendations.push("Start with customer interviews to validate assumptions");
    recommendations.push("Create a detailed execution timeline with milestones");
    recommendations.push("Set up key performance indicators (KPIs) to track progress");
    recommendations.push("Build a support network of mentors and advisors");
    
    return recommendations;
  }

  private performSWOTAnalysis(plan: any, analysis: any) {
    return {
      strengths: [
        "Clear business concept with defined target market",
        analysis.scalability.includes('Highly scalable') ? "Scalable business model" : "Manageable business model",
        analysis.marketTiming.includes('Excellent') ? "Good market timing" : "Stable market conditions"
      ],
      weaknesses: [
        ...analysis.skillGaps.map((gap: string) => `Lack of ${gap} expertise`),
        analysis.resourceRequirements.includes('High') ? "High resource requirements" : null,
        analysis.timeCommitment.includes('High') ? "High time commitment required" : null
      ].filter(Boolean),
      opportunities: [
        "Growing market demand",
        "Potential for automation and scaling",
        "Opportunity to build recurring revenue streams",
        "Network effects and word-of-mouth growth"
      ],
      threats: [
        ...analysis.riskFactors,
        analysis.competitiveAdvantage.includes('High competition') ? "Intense competition" : null,
        "Market volatility and economic uncertainty",
        "Regulatory changes and compliance requirements"
      ].filter(Boolean)
    };
  }

  private generateEnhancedContent(plan: any, analysis: any) {
    return {
      businessIdeaSummary: this.enhanceBusinessIdeaSummary(plan, analysis),
      customerProfile: this.enhanceCustomerProfile(plan, analysis),
      customerStruggles: this.enhanceCustomerStruggles(plan, analysis),
      valueProposition: this.enhanceValueProposition(plan, analysis),
      marketInformation: this.enhanceMarketInformation(plan, analysis),
      financialSummary: this.enhanceFinancialSummary(plan, analysis),
      sideHustleStrategy: this.generateSideHustleStrategy(plan, analysis),
      executionPlan: this.generateExecutionPlan(plan, analysis)
    };
  }

  private enhanceBusinessIdeaSummary(plan: any, analysis: any): string {
    const original = plan.businessIdeaSummary || '';
    const businessType = this.getBusinessType(plan);
    
    return `${original} This side hustle opportunity leverages ${businessType.replace('_', ' ')} principles to create a sustainable, scalable business model. The concept addresses real market needs while maintaining flexibility for gradual scaling and risk management.`;
  }

  private enhanceCustomerProfile(plan: any, analysis: any): string {
    const original = plan.customerProfile?.description || '';
    return `${original} These customers are actively seeking solutions and demonstrate willingness to pay for value. They represent a growing segment with increasing purchasing power and decision-making authority.`;
  }

  private enhanceCustomerStruggles(plan: any, analysis: any): string[] {
    const original = plan.customerStruggle || [];
    return [
      ...original,
      "Limited time to research and implement solutions",
      "Need for proven, reliable solutions with clear ROI",
      "Desire for ongoing support and continuous improvement"
    ];
  }

  private enhanceValueProposition(plan: any, analysis: any): string {
    const original = plan.valueProposition || '';
    return `${original} Our solution specifically addresses the unique challenges of side hustle entrepreneurs, offering flexible, scalable solutions that grow with their business.`;
  }

  private enhanceMarketInformation(plan: any, analysis: any): any {
    const original = plan.marketInformation || {};
    return {
      marketSize: original.marketSize || "Growing market with significant potential for side hustle entrepreneurs",
      trends: [
        ...(original.trends || []),
        "Increasing adoption of side hustle business models",
        "Growing demand for flexible, scalable solutions",
        "Rise of digital-first business approaches"
      ],
      competitors: original.competitors || ["Established players in the space", "Emerging startups with similar offerings"]
    };
  }

  private enhanceFinancialSummary(plan: any, analysis: any): string {
    const original = plan.financialSummary || '';
    return `${original} The side hustle approach allows for bootstrapped growth with minimal initial investment, focusing on revenue generation from day one while building sustainable, recurring income streams.`;
  }

  private generateSideHustleStrategy(plan: any, analysis: any): string {
    return `Phase 1 (Months 1-3): Validate concept with MVP and initial customers. Phase 2 (Months 4-6): Scale successful elements and optimize operations. Phase 3 (Months 7-12): Expand market reach and develop additional revenue streams. Focus on building sustainable, recurring revenue while maintaining flexibility for other commitments.`;
  }

  private generateExecutionPlan(plan: any, analysis: any): string {
    return `Week 1-2: Finalize business plan and set up basic infrastructure. Week 3-4: Launch MVP and gather initial customer feedback. Month 2: Iterate based on feedback and begin marketing efforts. Month 3: Scale successful channels and optimize operations. Continue this iterative approach while maintaining work-life balance and other commitments.`;
  }
}

// Export singleton instance
export const sideHustleCoach = new SideHustleCoach(); 