import { Router, Request, Response } from "express";
import axios from "axios";
import { BusinessPlan, IBusinessPlan } from "../models/BusinessPlan";
import { User } from "../models/User";
import auth from "../middleware/auth";
import PptxGenJS from 'pptxgenjs';

interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    name?: string;
    isSubscribed: boolean;
  };
}

export const businessPlanRouter = Router();

// POST /api/business-plan/discovery - Generate initial business plan
businessPlanRouter.post("/discovery", async (req: Request, res: Response) => {
  console.log("Received /api/business-plan/discovery request", req.body);
  const { idea, customer, job, prompt: customPrompt } = req.body;
  if (!idea || !customer || !job) {
    console.error("Missing required fields in /discovery:", { idea, customer, job });
    return res
      .status(400)
      .json({ error: "Missing required fields: idea, customer, job" });
  }

  const prompt = customPrompt?.trim() || `
You are a side hustle strategist AI. Given:
- Interests: ${idea.interests}
- Customer Persona: ${customer.title} (${customer.description})
- Customer Job: ${job.title} (${job.description})

Generate a comprehensive Side Hustle Business Plan with the following sections. CRITICAL: Each section must contain actual, specific content, not placeholder text.

- Business Idea Summary: 2-3 sentences summarizing the side hustle idea based on the user's interests, customer persona, and job. Focus on how this can be executed part-time.
- Customer Profile: 1-2 sentences describing the target customer.
- Customer Struggles: 2-3 bullet points listing the main struggles or pain points of the customer related to the job.
- Value Proposition: 1-2 sentences proposing a solution to the customer struggles above, describing the unique value the side hustle provides to the customer.
- Market Size: 1-2 sentences estimating the size or opportunity of the target market for a side hustle.
- Competitors: 2-3 bullet points listing main competitors or alternatives. MUST include actual competitor names or types.
- Market Trends: 2-3 bullet points describing relevant trends in the market. MUST include actual industry trends, not generic statements.
- Market Validation: 1-2 sentences on how the side hustle idea can be validated or has been validated.
- Financial Summary: 2-3 sentences summarizing the expected revenue model, main costs, and financial opportunity for this side hustle. Include realistic income expectations for part-time work.

CRITICAL REQUIREMENTS:
- Every section must contain specific, actionable content
- Market Trends must include actual industry trends, not "trends to be analyzed"
- Competitors must include actual competitor names or types, not "competitors to be identified"
- Use bullet points (•) for lists
- Make content specific to the side hustle idea
- Focus on part-time execution and realistic income expectations
- Consider time constraints and resource limitations typical of side hustles

Return as JSON:
{
  summary: string,
  sections: {
    Customer: string,
    Struggles: string, // bullet points separated by newlines
    Value: string,
    MarketSize: string,
    Competitors: string, // bullet points separated by newlines
    Trends: string, // bullet points separated by newlines
    Validation: string,
    Financial: string
  }
}
No extra text, just valid JSON.
  `.trim();

  try {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      console.error("OpenAI API key not configured");
      return res.status(500).json({ error: "OpenAI API key not configured" });
    }

    const response = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      {
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: prompt }],
        max_tokens: 600,
        temperature: 0.7,
      },
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
      },
    );

    const content =
      (response.data as any).choices?.[0]?.message?.content?.trim() || "";
    let plan;
    try {
      console.log("Prompt:", prompt);
      console.log("OpenAI raw response:", content);
      console.log("Custom prompt provided:", !!customPrompt);
      console.log("Using custom prompt:", customPrompt?.substring(0, 100) + "...");
      
      // Strip markdown code blocks if present
      let jsonContent = content;
      if (content.includes('```json')) {
        jsonContent = content.replace(/```json\n?/g, '').replace(/```\n?/g, '');
      } else if (content.includes('```')) {
        jsonContent = content.replace(/```\n?/g, '');
      }
      
      plan = JSON.parse(jsonContent);
      console.log("Parsed plan sections:", plan.sections);
      console.log("Trends section:", plan.sections?.Trends);
      console.log("Competitors section:", plan.sections?.Competitors);
    } catch (err) {
      console.error("Failed to parse AI response as JSON:", content, err);
      return res
        .status(500)
        .json({ error: "Failed to parse AI response", raw: content });
    }

    res.json(plan);
  } catch (error: any) {
    console.error("OpenAI error in /discovery:", error.response?.data || error.message);
    res
      .status(500)
      .json({
        error: "Failed to generate business plan",
        details: error.message,
      });
  }
});

// POST /api/business-plan - Create new business plan
businessPlanRouter.post("/", auth, async (req: AuthRequest, res: Response) => {
  try {
    const {
      title,
      summary,
      sections,
      idea,
      customer,
      job,
      problem,
      solution,
      tags = [],
      category = "general",
    } = req.body;

    if (!title || !summary || !sections) {
      return res
        .status(400)
        .json({ error: "Missing required fields: title, summary, sections" });
    }

    const businessPlan = new BusinessPlan({
      userId: req.user!.id,
      title: idea?.title || "Untitled Business Plan",
      summary,
      sections,
      idea,
      customer,
      job,
      problem,
      solution,
      tags,
      category,
      progress: {
        ideaDiscovery: !!idea,
        customerResearch: !!customer,
        problemDefinition: !!problem,
        solutionDesign: !!solution,
        businessPlan: true,
        marketEvaluation: false,
        nextSteps: false,
      },
      changeLog: [{
        version: 1,
        date: new Date(),
        changes: ['Initial business plan created'],
        reason: 'Original Business Plan'
      }],
    });

    await businessPlan.save();
    
    // Update the change log with content after the plan is saved
    const content = {
      businessIdeaSummary: businessPlan.businessIdeaSummary,
      customerProfile: businessPlan.customerProfile,
      customerStruggle: businessPlan.customerStruggle,
      valueProposition: businessPlan.valueProposition,
      marketInformation: businessPlan.marketInformation,
      financialSummary: businessPlan.financialSummary,
      sections: businessPlan.sections
    };
    
    businessPlan.changeLog[0].content = content;
    await businessPlan.save();
    
    res.status(201).json(businessPlan);
  } catch (error: any) {
    console.error("Create business plan error:", error);
    res.status(500).json({ error: "Failed to create business plan" });
  }
});

// GET /api/business-plan - Get user's business plans (auth required)
businessPlanRouter.get("/", auth, async (req: AuthRequest, res: Response) => {
  try {
    const { status, category, page = 1, limit = 10 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);
    const filter: any = { userId: req.user!.id };
    if (status) filter.status = status;
    if (category) filter.category = category;

    const businessPlans = await BusinessPlan.find(filter)
      .sort({ updatedAt: -1 })
      .skip(skip)
      .limit(Number(limit))
      .populate("collaborators", "name email");

    const total = await BusinessPlan.countDocuments(filter);

    if (req.baseUrl.endsWith("/startup-plan")) {
      res.json({
        startupPlans: businessPlans,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit)),
        },
      });
    } else {
      res.json({
        businessPlans,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit)),
        },
      });
    }
  } catch (error: any) {
    console.error("Get business plans error:", error);
    res.status(500).json({ error: "Failed to fetch business plans" });
  }
});

// GET /api/business-plan/:id - Get specific business plan
businessPlanRouter.get(
  "/:id",
  auth,
  async (req: AuthRequest, res: Response) => {
    try {
      const businessPlan = await BusinessPlan.findOne({
        _id: req.params.id,
        $or: [
          { userId: req.user!.id },
          { collaborators: req.user!.id },
          { isPublic: true },
        ],
      }).populate("collaborators", "name email");

      if (!businessPlan) {
        return res.status(404).json({ error: "Business plan not found" });
      }

      // Increment views if user owns the plan
      if (businessPlan.userId.toString() === req.user!.id) {
        businessPlan.views += 1;
        businessPlan.lastViewed = new Date();
        await businessPlan.save();
      }

      console.log('GET business plan response:', {
        id: businessPlan._id,
        sections: businessPlan.sections,
        businessIdeaSummary: businessPlan.businessIdeaSummary,
        customerProfile: businessPlan.customerProfile,
        customerStruggle: businessPlan.customerStruggle,
        valueProposition: businessPlan.valueProposition,
        marketInformation: businessPlan.marketInformation,
        financialSummary: businessPlan.financialSummary
      });

      res.json(businessPlan);
    } catch (error: any) {
      console.error("Get business plan error:", error);
      res.status(500).json({ error: "Failed to fetch business plan" });
    }
  },
);

// PUT /api/business-plan/:id - Update business plan
businessPlanRouter.put(
  "/:id",
  auth,
  async (req: AuthRequest, res: Response) => {
    try {
      const businessPlan = await BusinessPlan.findOne({
        _id: req.params.id,
        userId: req.user!.id,
      });

      if (!businessPlan) {
        return res.status(404).json({ error: "Business plan not found" });
      }

      const {
        title,
        summary,
        sections,
        idea,
        customer,
        job,
        problem,
        solution,
        marketEvaluation,
        tags,
        category,
        status,
        // Enhanced fields
        businessIdeaSummary,
        customerProfile,
        customerStruggle,
        valueProposition,
        marketInformation,
        financialSummary,
      } = req.body;

      // Update fields
      if (title) businessPlan.title = title;
      if (summary) businessPlan.summary = summary;
      if (sections) businessPlan.sections = sections;
      if (idea) businessPlan.idea = { ...businessPlan.idea, ...idea };
      if (customer)
        businessPlan.customer = { ...businessPlan.customer, ...customer };
      if (job) businessPlan.job = { ...businessPlan.job, ...job };
      if (problem)
        businessPlan.problem = { ...businessPlan.problem, ...problem };
      if (solution)
        businessPlan.solution = { ...businessPlan.solution, ...solution };
      if (marketEvaluation)
        businessPlan.marketEvaluation = {
          ...businessPlan.marketEvaluation,
          ...marketEvaluation,
        };
      if (tags) businessPlan.tags = tags;
      if (category) businessPlan.category = category;
      if (status) businessPlan.status = status;
      
      // Update enhanced fields
      if (businessIdeaSummary !== undefined) businessPlan.businessIdeaSummary = businessIdeaSummary;
      if (customerProfile !== undefined) businessPlan.customerProfile = customerProfile;
      if (customerStruggle !== undefined) businessPlan.customerStruggle = customerStruggle;
      if (valueProposition !== undefined) businessPlan.valueProposition = valueProposition;
      if (marketInformation !== undefined) businessPlan.marketInformation = marketInformation;
      if (financialSummary !== undefined) businessPlan.financialSummary = financialSummary;

      // Update progress based on what's being updated
      if (idea) businessPlan.progress.ideaDiscovery = true;
      if (customer) businessPlan.progress.customerResearch = true;
      if (problem) businessPlan.progress.problemDefinition = true;
      if (solution) businessPlan.progress.solutionDesign = true;
      if (marketEvaluation) businessPlan.progress.marketEvaluation = true;

      // Increment version number for edits
      console.log('Before edit - Version:', businessPlan.version);
      businessPlan.version = businessPlan.version + 1;
      console.log('After edit - Version:', businessPlan.version);

      // Store current content before making changes
      const currentContent = {
        businessIdeaSummary: businessPlan.businessIdeaSummary,
        customerProfile: businessPlan.customerProfile,
        customerStruggle: businessPlan.customerStruggle,
        valueProposition: businessPlan.valueProposition,
        marketInformation: businessPlan.marketInformation,
        financialSummary: businessPlan.financialSummary,
        sections: businessPlan.sections
      };

      // Add to change log with content
      businessPlan.changeLog.push({
        version: businessPlan.version,
        date: new Date(),
        changes: ['Business plan content updated', 'Manual edits applied'],
        reason: 'User edited business plan content',
        content: currentContent
      });
      console.log('Added to change log - Version:', businessPlan.version);

      await businessPlan.save();
      console.log('Saved business plan:', {
        id: businessPlan._id,
        businessIdeaSummary: businessPlan.businessIdeaSummary,
        customerProfile: businessPlan.customerProfile,
        customerStruggle: businessPlan.customerStruggle,
        valueProposition: businessPlan.valueProposition,
        marketInformation: businessPlan.marketInformation,
        financialSummary: businessPlan.financialSummary,
        sections: businessPlan.sections
      });
      res.json(businessPlan);
    } catch (error: any) {
      console.error("Update business plan error:", error);
      res.status(500).json({ error: "Failed to update business plan" });
    }
  },
);

// POST /api/business-plan/:id/version - Create new version
businessPlanRouter.post(
  "/:id/version",
  auth,
  async (req: AuthRequest, res: Response) => {
    try {
      const { changes, reason } = req.body;

      if (!changes || !reason) {
        return res
          .status(400)
          .json({ error: "Missing required fields: changes, reason" });
      }

      const businessPlan = await BusinessPlan.findOne({
        _id: req.params.id,
        userId: req.user!.id,
      });

      if (!businessPlan) {
        return res.status(404).json({ error: "Business plan not found" });
      }

      const planData = businessPlan.toObject();
      const newVersion = new BusinessPlan({
        ...planData,
        _id: undefined,
        version: businessPlan.version + 1,
        previousVersion: businessPlan._id,
        changeLog: [
          {
            version: businessPlan.version + 1,
            date: new Date(),
            changes,
            reason,
          },
        ],
        createdAt: undefined,
        updatedAt: undefined,
      });

      await newVersion.save();

      res.status(201).json(newVersion);
    } catch (error: any) {
      console.error("Create version error:", error);
      res.status(500).json({ error: "Failed to create new version" });
    }
  },
);

// GET /api/business-plan/:id/versions - Get version history
businessPlanRouter.get(
  "/:id/versions",
  auth,
  async (req: AuthRequest, res: Response) => {
    try {
      const businessPlan = await BusinessPlan.findOne({
        _id: req.params.id,
        userId: req.user!.id,
      });

      if (!businessPlan) {
        return res.status(404).json({ error: "Business plan not found" });
      }

      const versions = await BusinessPlan.find({
        $or: [{ _id: req.params.id }, { previousVersion: req.params.id }],
      })
        .sort({ version: -1 })
        .select("version title createdAt changeLog");

      res.json(versions);
    } catch (error: any) {
      console.error("Get versions error:", error);
      res.status(500).json({ error: "Failed to fetch versions" });
    }
  },
);

// DELETE /api/business-plan/:id - Delete business plan
businessPlanRouter.delete(
  "/:id",
  auth,
  async (req: AuthRequest, res: Response) => {
    try {
      console.log('Attempting to delete business plan', {
        userId: req.user?.id,
        planId: req.params.id
      });
      const businessPlan = await BusinessPlan.findOneAndDelete({
        _id: req.params.id,
        userId: req.user!.id,
      });

      if (!businessPlan) {
        console.warn('Business plan not found or not owned by user', {
          userId: req.user?.id,
          planId: req.params.id
        });
        return res.status(404).json({ error: "Business plan not found" });
      }

      console.log('Business plan deleted successfully', {
        userId: req.user?.id,
        planId: req.params.id
      });
      res.json({ message: "Business plan deleted successfully" });
    } catch (error: any) {
      console.error("Delete business plan error:", error);
      res.status(500).json({ error: "Failed to delete business plan" });
    }
  },
);

// POST /api/business-plan/:id/collaborators - Add collaborator
businessPlanRouter.post(
  "/:id/collaborators",
  auth,
  async (req: AuthRequest, res: Response) => {
    try {
      const { email } = req.body;

      if (!email) {
        return res.status(400).json({ error: "Email is required" });
      }

      const businessPlan = await BusinessPlan.findOne({
        _id: req.params.id,
        userId: req.user!.id,
      });

      if (!businessPlan) {
        return res.status(404).json({ error: "Business plan not found" });
      }

      const collaborator = await User.findOne({ email });
      if (!collaborator) {
        return res.status(404).json({ error: "User not found" });
      }

      if (businessPlan.collaborators.includes(collaborator._id)) {
        return res
          .status(400)
          .json({ error: "User is already a collaborator" });
      }

      businessPlan.collaborators.push(collaborator._id);
      await businessPlan.save();

      res.json(businessPlan);
    } catch (error: any) {
      console.error("Add collaborator error:", error);
      res.status(500).json({ error: "Failed to add collaborator" });
    }
  },
);

// DELETE /api/business-plan/:id/collaborators/:userId - Remove collaborator
businessPlanRouter.delete(
  "/:id/collaborators/:userId",
  auth,
  async (req: AuthRequest, res: Response) => {
    try {
      const businessPlan = await BusinessPlan.findOne({
        _id: req.params.id,
        userId: req.user!.id,
      });

      if (!businessPlan) {
        return res.status(404).json({ error: "Business plan not found" });
      }

      businessPlan.collaborators = businessPlan.collaborators.filter(
        (id) => id.toString() !== req.params.userId,
      );
      await businessPlan.save();

      res.json(businessPlan);
    } catch (error: any) {
      console.error("Remove collaborator error:", error);
      res.status(500).json({ error: "Failed to remove collaborator" });
    }
  },
);

// GET /api/business-plan/public - Get public business plans
businessPlanRouter.get("/public", async (req: Request, res: Response) => {
  try {
    const { category, page = 1, limit = 10 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const filter: any = { isPublic: true, status: "active" };
    if (category) filter.category = category;

    const businessPlans = await BusinessPlan.find(filter)
      .populate("userId", "name")
      .sort({ views: -1, createdAt: -1 })
      .skip(skip)
      .limit(Number(limit))
      .select("title summary category tags views createdAt");

    const total = await BusinessPlan.countDocuments(filter);

    res.json({
      businessPlans,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error: any) {
    console.error("Get public business plans error:", error);
    res.status(500).json({ error: "Failed to fetch public business plans" });
  }
});

// POST /api/business-plan/improve-section - Improve a section with AI
businessPlanRouter.post(
  "/improve-section",
  auth,
  async (req: AuthRequest, res: Response) => {
    const { planId, sectionKey, currentText } = req.body;
    if (!planId || !sectionKey || !currentText) {
      return res
        .status(400)
        .json({
          error: "Missing required fields: planId, sectionKey, currentText",
        });
    }
    try {
      const apiKey = process.env.OPENAI_API_KEY;
      if (!apiKey)
        return res.status(500).json({ error: "OpenAI API key not configured" });

      const prompt = `Improve this business plan section (${sectionKey}). Make it more professional, clear, and well-structured. Use proper paragraph breaks and formatting. 

IMPORTANT REQUIREMENTS:
- Keep the response to EXACTLY 100 words maximum
- Return ONLY plain text format with NO markdown formatting:
  - NO ### headers
  - NO **bold** text
  - NO *italic* text  
  - NO numbered lists (1. 2. 3.)
  - Use simple headings in Title Case
  - Use bullet points with dashes (-) and proper spacing between items
  - NO markdown symbols of any kind
- Write in professional business language
- Be concise, clear, and impactful
- Focus on essential strategic points only
- Ensure proper sentence structure and flow
- Complete all sentences properly
- Use clear, short sentences for better readability
- DO NOT repeat the section title at the beginning of the content
- Start directly with the content, not with the section name

Return only the improved text without any additional commentary:

${currentText}`;
      const response = await axios.post(
        "https://api.openai.com/v1/chat/completions",
        {
          model: "gpt-4o-mini",
          messages: [{ role: "user", content: prompt }],
          max_tokens: 300,
          temperature: 0.7,
        },
        {
          headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
          },
        },
      );
      const content =
        (response.data as any).choices?.[0]?.message?.content?.trim() || "";
      res.json({ improvedText: content });
    } catch (error: any) {
      console.error(
        "AI improve-section error:",
        error.response?.data || error.message,
      );
      res
        .status(500)
        .json({ error: "Failed to improve section", details: error.message });
    }
  },
);

// Add or update validation score for a business plan
businessPlanRouter.put("/:id/validation-score", async (req, res) => {
  try {
    const { score } = req.body;
    const plan = await BusinessPlan.findByIdAndUpdate(
      req.params.id,
      { validationScore: { score, date: new Date() } },
      { new: true },
    );
    if (!plan)
      return res.status(404).json({ message: "Business plan not found" });
    res.json({ status: "success", plan });
  } catch (err) {
    res.status(500).json({ message: "Failed to update validation score" });
  }
});

// Add or update evaluation score for a startup plan
businessPlanRouter.put(
  "/:id/evaluation-score",
  auth,
  async (req: AuthRequest, res: Response) => {
    try {
      const { score } = req.body;
      if (typeof score !== "number") {
        return res.status(400).json({ error: "Score must be a number" });
      }
      const plan = await BusinessPlan.findOne({
        _id: req.params.id,
        userId: req.user!.id,
      });
      if (!plan)
        return res.status(404).json({ error: "Startup plan not found" });
      let me = plan.marketEvaluation;
      if (!me) {
        me = {
          score,
          competitors: [],
          marketSize: "",
          customerResearch: [],
          insights: [],
        };
      } else {
        me.score = score;
      }
      plan.marketEvaluation = me;
      await plan.save();
      res.json({ status: "success", plan });
    } catch (err) {
      res.status(500).json({ error: "Failed to update evaluation score" });
    }
  },
);

// PUT /api/business-plan/:id/mvp - Save MVP data
businessPlanRouter.put(
  "/:id/mvp",
  auth,
  async (req: AuthRequest, res: Response) => {
    try {
      const { mvpData, isComplete } = req.body;
      const plan = await BusinessPlan.findOne({
        _id: req.params.id,
        userId: req.user!.id,
      });
      if (!plan) {
        return res.status(404).json({ error: "Business plan not found" });
      }
      // Save MVP data
      plan.mvp = {
        ...plan.mvp,
        ...mvpData,
        lastUpdated: new Date(),
        isComplete: isComplete || false
      };
      // Update progress if MVP is complete
      if (isComplete) {
        plan.progress.mvp = true;
      }
      await plan.save();
      // Always return the updated plan with MVP field
      res.json({ status: "success", plan });
    } catch (error: any) {
      console.error("Save MVP error:", error);
      res.status(500).json({ error: "Failed to save MVP data" });
    }
  }
);

// Generate and download a pitch deck for a business plan
businessPlanRouter.post('/:id/pitch-deck', async (req, res) => {
  try {
    const { id } = req.params;
    const customSlides = req.body && req.body.slides ? req.body.slides : {};
    const customTitle = req.body && req.body.title ? req.body.title : undefined;
    const plan = await BusinessPlan.findById(id);
    if (!plan) return res.status(404).json({ error: 'Business plan not found' });

    const getSection = (key: string) => (plan.sections && plan.sections[key]) || '';
    const bulletList = (arr: string[]) => Array.isArray(arr) && arr.length ? arr.map(item => `• ${item}`).join('\n') : '';

    const pptx = new PptxGenJS();

    // Title Slide
    pptx.addSlide().addText(customTitle || plan.title || 'Pitch Deck', { x:1, y:1, fontSize:36 });

    // Problem Slide
    pptx.addSlide().addText('Problem', { x:0.5, y:0.5, fontSize:28 });
    pptx.addSlide().addText(customSlides.problem || plan.problem?.description || getSection('Problem') || 'Describe the problem here.', { x:1, y:1, fontSize:18 });

    // Solution Slide
    pptx.addSlide().addText('Solution', { x:0.5, y:0.5, fontSize:28 });
    pptx.addSlide().addText(customSlides.solution || plan.solution?.description || getSection('Solution') || 'Describe the solution here.', { x:1, y:1, fontSize:18 });

    // Market Opportunity Slide
    pptx.addSlide().addText('Market Opportunity', { x:0.5, y:0.5, fontSize:28 });
    pptx.addSlide().addText(customSlides.market || plan.marketEvaluation?.marketSize || getSection('Market Opportunity') || 'Describe the market opportunity here.', { x:1, y:1, fontSize:18 });

    // Product Slide
    pptx.addSlide().addText('Product', { x:0.5, y:0.5, fontSize:28 });
    pptx.addSlide().addText(customSlides.product || bulletList(plan.solution?.keyFeatures || []) || plan.solution?.description || getSection('Product') || 'Describe the product here.', { x:1, y:1, fontSize:18 });

    // Business Model Slide
    pptx.addSlide().addText('Business Model', { x:0.5, y:0.5, fontSize:28 });
    pptx.addSlide().addText(customSlides.businessModel || getSection('Business Model') || 'Describe the business model here.', { x:1, y:1, fontSize:18 });

    // Go-to-Market Strategy Slide
    pptx.addSlide().addText('Go-to-Market Strategy', { x:0.5, y:0.5, fontSize:28 });
    pptx.addSlide().addText(customSlides.goToMarket || getSection('Go-to-Market') || 'Describe the go-to-market strategy here.', { x:1, y:1, fontSize:18 });

    // Competition Slide
    pptx.addSlide().addText('Competition', { x:0.5, y:0.5, fontSize:28 });
    pptx.addSlide().addText(customSlides.competition || bulletList(plan.marketEvaluation?.competitors || []) || getSection('Competition') || 'Describe the competition here.', { x:1, y:1, fontSize:18 });

    // Traction Slide
    pptx.addSlide().addText('Traction', { x:0.5, y:0.5, fontSize:28 });
    pptx.addSlide().addText(customSlides.traction || getSection('Traction') || 'Describe traction here.', { x:1, y:1, fontSize:18 });

    // Team Slide
    pptx.addSlide().addText('Team', { x:0.5, y:0.5, fontSize:28 });
    pptx.addSlide().addText(customSlides.team || getSection('Team') || 'Describe the team here.', { x:1, y:1, fontSize:18 });

    // Financials Slide
    pptx.addSlide().addText('Financials', { x:0.5, y:0.5, fontSize:28 });
    pptx.addSlide().addText(customSlides.financials || getSection('Financials') || (plan.estimatedRevenue ? `Estimated Revenue: $${plan.estimatedRevenue}` : '') || 'Describe financials here.', { x:1, y:1, fontSize:18 });

    // Ask Slide
    pptx.addSlide().addText('Ask', { x:0.5, y:0.5, fontSize:28 });
    pptx.addSlide().addText(customSlides.ask || getSection('Ask') || 'Describe your ask here.', { x:1, y:1, fontSize:18 });

    // @ts-expect-error: pptxgenjs types may not include 'nodebuffer'
    const buffer = await pptx.write('nodebuffer');
    res.setHeader('Content-Disposition', 'attachment; filename=pitch-deck.pptx');
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.presentationml.presentation');
    res.send(buffer);
  } catch (err) {
    console.error('Pitch deck generation error:', err);
    res.status(500).json({ error: 'Failed to generate pitch deck' });
  }
});

// PATCH /api/business-plan/:id/revert - Revert to a specific version
businessPlanRouter.patch("/:id/revert", auth, async (req: AuthRequest, res: Response) => {
  console.log('=== REVERT ENDPOINT CALLED ===');
  console.log('Request params:', req.params);
  console.log('Request body:', req.body);
  
  try {
    const { id } = req.params;
    const { targetVersion } = req.body;

    console.log('Revert request:', { id, targetVersion });

    if (!targetVersion) {
      return res.status(400).json({ error: "Missing targetVersion" });
    }

    const plan = await BusinessPlan.findOne({
      _id: id,
      userId: req.user!.id,
    });

    if (!plan) {
      return res.status(404).json({ error: "Business plan not found" });
    }

    console.log('Current plan version:', plan.version);
    console.log('Current plan content:', {
      businessIdeaSummary: plan.businessIdeaSummary,
      customerProfile: plan.customerProfile,
      customerStruggle: plan.customerStruggle,
      valueProposition: plan.valueProposition,
      marketInformation: plan.marketInformation,
      financialSummary: plan.financialSummary
    });
    console.log('Change log entries:', plan.changeLog.map(entry => ({
      version: entry.version,
      reason: entry.reason,
      hasContent: !!entry.content && Object.keys(entry.content).length > 0
    })));

    // Find the target version in the change log
    let targetEntry = plan.changeLog.find(entry => entry.version === targetVersion);
    
    // If version 1 is missing, create it from the current plan's sections
    if (!targetEntry && targetVersion === 1) {
      console.log('Version 1 not found, creating it from current plan sections...');
      const version1Content = {
        businessIdeaSummary: plan.businessIdeaSummary,
        customerProfile: plan.customerProfile,
        customerStruggle: plan.customerStruggle,
        valueProposition: plan.valueProposition,
        marketInformation: plan.marketInformation,
        financialSummary: plan.financialSummary,
        sections: plan.sections
      };
      
      // Create version 1 entry
      targetEntry = {
        version: 1,
        date: plan.createdAt || new Date(),
        changes: ['Original business plan content'],
        reason: 'Original Business Plan',
        content: version1Content
      };
      
      console.log('Created version 1 entry:', targetEntry);
    }
    
    if (!targetEntry) {
      return res.status(404).json({ error: "Target version not found" });
    }

    console.log('Target entry found:', targetEntry);
    console.log('Target entry content:', targetEntry.content);

    // Store current version content before reverting
    const currentContent = {
      businessIdeaSummary: plan.businessIdeaSummary,
      customerProfile: plan.customerProfile,
      customerStruggle: plan.customerStruggle,
      valueProposition: plan.valueProposition,
      marketInformation: plan.marketInformation,
      financialSummary: plan.financialSummary,
      sections: plan.sections
    };

    console.log('Current content to save:', currentContent);

    // Add current version to change log before reverting
    plan.changeLog.push({
      version: plan.version,
      date: new Date(),
      changes: ['Content saved before revert'],
      reason: `Content before reverting to version ${targetVersion}`,
      content: currentContent
    });

    // Restore content from target version
    console.log('Target entry content keys:', Object.keys(targetEntry.content || {}));
    console.log('Target entry content length:', Object.keys(targetEntry.content || {}).length);
    
    if (targetEntry.content && Object.keys(targetEntry.content).length > 0) {
      console.log('Restoring content from target version...');
      // Replace content completely, don't use fallbacks
      if (targetEntry.content.businessIdeaSummary !== undefined) {
        console.log('Restoring businessIdeaSummary from:', targetEntry.content.businessIdeaSummary);
        plan.businessIdeaSummary = targetEntry.content.businessIdeaSummary;
      }
      if (targetEntry.content.customerProfile !== undefined) {
        console.log('Restoring customerProfile from:', targetEntry.content.customerProfile);
        plan.customerProfile = targetEntry.content.customerProfile;
      }
      if (targetEntry.content.customerStruggle !== undefined) {
        console.log('Restoring customerStruggle from:', targetEntry.content.customerStruggle);
        plan.customerStruggle = targetEntry.content.customerStruggle;
      }
      if (targetEntry.content.valueProposition !== undefined) {
        console.log('Restoring valueProposition from:', targetEntry.content.valueProposition);
        plan.valueProposition = targetEntry.content.valueProposition;
      }
      if (targetEntry.content.marketInformation !== undefined) {
        console.log('Restoring marketInformation from:', targetEntry.content.marketInformation);
        plan.marketInformation = targetEntry.content.marketInformation;
      }
      if (targetEntry.content.financialSummary !== undefined) {
        console.log('Restoring financialSummary from:', targetEntry.content.financialSummary);
        plan.financialSummary = targetEntry.content.financialSummary;
      }
      if (targetEntry.content.sections !== undefined) {
        console.log('Restoring sections from:', targetEntry.content.sections);
        plan.sections = targetEntry.content.sections;
      }
      
      console.log('Content after restoration:', {
        businessIdeaSummary: plan.businessIdeaSummary,
        customerProfile: plan.customerProfile,
        customerStruggle: plan.customerStruggle,
        valueProposition: plan.valueProposition,
        marketInformation: plan.marketInformation,
        financialSummary: plan.financialSummary
      });
    } else {
      console.log('No content found in target entry, skipping restoration');
      console.log('Target entry content is:', targetEntry.content);
      // If no content is stored for this version, we can't restore it
      return res.status(400).json({ 
        error: `Version ${targetVersion} does not have content stored. Only versions created after the content storage feature was added can be reverted. Please try reverting to a more recent version.` 
      });
    }

    // Increment version and add revert entry
    plan.version = plan.version + 1;
    plan.changeLog.push({
      version: plan.version,
      date: new Date(),
      changes: [`Reverted to version ${targetVersion}`, 'Content restored from previous version'],
      reason: `User reverted to version ${targetVersion}`,
      content: targetEntry.content || {}
    });

    await plan.save();
    console.log('Plan saved successfully with new version:', plan.version);
    res.json(plan);
  } catch (error: any) {
    console.error("Revert error:", error);
    res.status(500).json({ error: "Failed to revert to previous version" });
  }
});

// PATCH /api/business-plans/:id/validate - Update plan status to validated and enhance content
businessPlanRouter.patch("/:id/validate", auth, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const { 
      status, 
      marketEvaluation, 
      businessIdeaSummary,
      customerProfile,
      customerStruggle,
      valueProposition,
      marketInformation,
      financialSummary
    } = req.body;

    const plan = await BusinessPlan.findOne({
      _id: id,
      userId: req.user!.id,
    });

    if (!plan) {
      return res.status(404).json({ error: "Business plan not found" });
    }

    // Update plan status and market evaluation
    if (status) {
      plan.status = status;
    }
    
    if (marketEvaluation) {
      plan.marketEvaluation = {
        ...plan.marketEvaluation,
        ...marketEvaluation,
      };
    }

    // Update enhanced content from validation
    if (businessIdeaSummary) {
      plan.businessIdeaSummary = businessIdeaSummary;
    }
    
    if (customerProfile) {
      plan.customerProfile = {
        ...plan.customerProfile,
        ...customerProfile,
      };
    }
    
    if (customerStruggle) {
      plan.customerStruggle = customerStruggle;
    }
    
    if (valueProposition) {
      plan.valueProposition = valueProposition;
    }
    
    if (marketInformation) {
      plan.marketInformation = {
        ...plan.marketInformation,
        ...marketInformation,
      };
    }
    
    if (financialSummary) {
      plan.financialSummary = financialSummary;
    }

    // Increment version number for validation
    plan.version = plan.version + 1;

    // Store current content before validation changes
    const currentContent = {
      businessIdeaSummary: plan.businessIdeaSummary,
      customerProfile: plan.customerProfile,
      customerStruggle: plan.customerStruggle,
      valueProposition: plan.valueProposition,
      marketInformation: plan.marketInformation,
      financialSummary: plan.financialSummary,
      sections: plan.sections
    };

    // Add to change log with content
    plan.changeLog.push({
      version: plan.version,
      date: new Date(),
      changes: ['Business plan validated by Side Hustle Coach', 'Enhanced content with coach insights', 'Updated market evaluation score'],
      reason: 'Automated validation process with AI coach analysis',
      content: currentContent
    });

    // Update progress to mark validation as complete
    plan.progress.marketEvaluation = true;
    plan.progress.nextSteps = true;

    await plan.save();

    console.log(`Plan ${id} validated and enhanced with improved content`);

    res.json({ 
      success: true, 
      message: "Plan validated and enhanced with improved content", 
      plan: {
        _id: plan._id,
        status: plan.status,
        marketEvaluation: plan.marketEvaluation,
        businessIdeaSummary: plan.businessIdeaSummary,
        customerProfile: plan.customerProfile,
        customerStruggle: plan.customerStruggle,
        valueProposition: plan.valueProposition,
        marketInformation: plan.marketInformation,
        financialSummary: plan.financialSummary
      }
    });
  } catch (error: any) {
    console.error("Plan validation update error:", error);
    res.status(500).json({ error: "Failed to update plan validation status" });
  }
});

export default businessPlanRouter;
