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
You are a business strategist AI. Given:
- Interests: ${idea.interests}
- Customer Persona: ${customer.title} (${customer.description})
- Customer Job: ${job.title} (${job.description})

Generate a concise business plan with:
- A 2-3 sentence summary
- 3-5 sections: Market, Customer Job, Product, Go-to-Market, and one more relevant section.
- Each section should be 2-3 sentences, clear and actionable.
Return as JSON: { summary: string, sections: { [section: string]: string } }
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
        model: "gpt-4",
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
      plan = JSON.parse(content);
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
      title,
      summary,
      sections,
      idea: idea || {},
      customer: customer || {},
      job: job || {},
      problem: problem || {},
      solution: solution || {},
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
    });

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

      // Update progress based on what's being updated
      if (idea) businessPlan.progress.ideaDiscovery = true;
      if (customer) businessPlan.progress.customerResearch = true;
      if (problem) businessPlan.progress.problemDefinition = true;
      if (solution) businessPlan.progress.solutionDesign = true;
      if (marketEvaluation) businessPlan.progress.marketEvaluation = true;

      await businessPlan.save();
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

      const prompt = `Improve this business plan section (${sectionKey}):\n${currentText}`;
      const response = await axios.post(
        "https://api.openai.com/v1/chat/completions",
        {
          model: "gpt-4",
          messages: [{ role: "user", content: prompt }],
          max_tokens: 400,
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

export default businessPlanRouter;
