const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// In-memory storage (in production, use a database)
let userReflections = [];
let userProgress = {
  currentStage: 'Idea',
  completedFrameworks: [],
  lastActive: new Date()
};

// Idea stage progress storage
let ideaProgress = {
  jtbd: null,
  persona: null,
  validation: null,
  lastUpdated: null
};

// Framework data
const frameworks = [
  { 
    id: 'jtbd', 
    name: 'Jobs-to-be-Done Discovery', 
    description: 'Understand what job customers hire your product to do',
    stage: 'Idea',
    questions: [
      'What job is the customer trying to get done?',
      'What are they currently using to get this job done?',
      'What frustrations do they have with current solutions?'
    ]
  },
  { 
    id: 'lean-canvas', 
    name: 'Lean Canvas', 
    description: 'One-page business model overview',
    stage: 'Validation',
    questions: [
      'What problem are you solving?',
      'Who is your target customer?',
      'What is your unique value proposition?'
    ]
  },
  { 
    id: 'mvp-builder', 
    name: 'MVP Definition Tool', 
    description: 'Define your minimum viable product',
    stage: 'MVP',
    questions: [
      'What is the smallest version that delivers value?',
      'What assumptions are you testing?',
      'How will you measure success?'
    ]
  },
  { 
    id: 'launch-checklist', 
    name: 'Launch Readiness', 
    description: 'Pre-launch validation checklist',
    stage: 'Launch',
    questions: [
      'Have you validated your value proposition?',
      'Do you have a go-to-market strategy?',
      'Are your metrics and analytics set up?'
    ]
  }
];

// Routes
app.get('/api/test', (req, res) => {
  res.json({ message: 'ToolThinker Backend is working!' });
});

// Get all frameworks
app.get('/api/frameworks', (req, res) => {
  res.json(frameworks);
});

// Get framework by stage
app.get('/api/frameworks/stage/:stage', (req, res) => {
  const { stage } = req.params;
  const stageFrameworks = frameworks.filter(f => f.stage === stage);
  res.json(stageFrameworks);
});

// Get specific framework
app.get('/api/frameworks/:id', (req, res) => {
  const { id } = req.params;
  const framework = frameworks.find(f => f.id === id);
  
  if (!framework) {
    return res.status(404).json({ error: 'Framework not found' });
  }
  
  res.json(framework);
});

// Save user reflection
app.post('/api/reflections', (req, res) => {
  const { reflection, stage } = req.body;
  
  if (!reflection) {
    return res.status(400).json({ error: 'Reflection text is required' });
  }
  
  const newReflection = {
    id: Date.now(),
    text: reflection,
    stage: stage || userProgress.currentStage,
    timestamp: new Date()
  };
  
  userReflections.push(newReflection);
  res.json({ message: 'Reflection saved successfully', reflection: newReflection });
});

// Get user reflections
app.get('/api/reflections', (req, res) => {
  res.json(userReflections);
});

// Update user progress
app.post('/api/progress', (req, res) => {
  const { currentStage, completedFramework } = req.body;
  
  if (currentStage) {
    userProgress.currentStage = currentStage;
  }
  
  if (completedFramework && !userProgress.completedFrameworks.includes(completedFramework)) {
    userProgress.completedFrameworks.push(completedFramework);
  }
  
  userProgress.lastActive = new Date();
  
  res.json({ message: 'Progress updated', progress: userProgress });
});

// Get user progress
app.get('/api/progress', (req, res) => {
  res.json(userProgress);
});

// Save idea stage progress
app.post('/api/idea-progress', (req, res) => {
  const { jtbd, persona, validation, stage, timestamp } = req.body;
  
  ideaProgress = {
    jtbd,
    persona,
    validation,
    lastUpdated: timestamp || new Date()
  };
  
  // Update completion status
  const completedTasks = [];
  if (jtbd && jtbd.job && jtbd.outcome) completedTasks.push('jtbd');
  if (persona && persona.name && persona.demographics) completedTasks.push('persona');
  if (validation && validation.problemStatement && validation.uniqueValue) completedTasks.push('validation');
  
  res.json({ 
    message: 'Idea progress saved successfully', 
    progress: ideaProgress,
    completedTasks,
    completionPercentage: Math.round((completedTasks.length / 3) * 100)
  });
});

// Get idea stage progress
app.get('/api/idea-progress', (req, res) => {
  const completedTasks = [];
  if (ideaProgress.jtbd && ideaProgress.jtbd.job && ideaProgress.jtbd.outcome) completedTasks.push('jtbd');
  if (ideaProgress.persona && ideaProgress.persona.name && ideaProgress.persona.demographics) completedTasks.push('persona');
  if (ideaProgress.validation && ideaProgress.validation.problemStatement && ideaProgress.validation.uniqueValue) completedTasks.push('validation');
  
  res.json({
    ...ideaProgress,
    completedTasks,
    completionPercentage: Math.round((completedTasks.length / 3) * 100)
  });
});

// AI-powered recommendations
app.get('/api/recommendations', (req, res) => {
  const currentStage = userProgress.currentStage;
  const completedFrameworks = userProgress.completedFrameworks;
  
  // Simple recommendation logic
  const stageFrameworks = frameworks.filter(f => f.stage === currentStage);
  const uncompletedFrameworks = stageFrameworks.filter(f => !completedFrameworks.includes(f.id));
  
  const recommendation = uncompletedFrameworks.length > 0 
    ? uncompletedFrameworks[0]
    : stageFrameworks[0];
    
  const tips = {
    'Idea': 'Focus on understanding your customer deeply before building anything.',
    'Validation': 'Test your assumptions with real customers before investing time in development.',
    'MVP': 'Build the smallest version that lets you learn the most about your customers.',
    'Launch': 'Prepare your go-to-market strategy and success metrics before launching.'
  };
  
  res.json({
    recommendedFramework: recommendation,
    tip: tips[currentStage],
    nextSteps: [
      `Complete the ${recommendation.name}`,
      'Document your key insights',
      'Move to the next framework in your stage'
    ]
  });
});

// Get idea stage insights and tips
app.get('/api/idea-insights', (req, res) => {
  const insights = {
    jtbdTips: [
      "Focus on the job, not your solution",
      "Include functional, emotional, and social dimensions",
      "Look for jobs with existing workarounds - they're often underserved"
    ],
    personaTips: [
      "Base persona on real customer research, not assumptions",
      "Focus on behaviors and motivations, not just demographics",
      "Create one detailed persona rather than many generic ones"
    ],
    validationTips: [
      "Look for evidence in forums, social media, and competitor reviews",
      "Talk to potential customers before building anything",
      "Quantify the problem - size, frequency, and impact matter"
    ]
  };
  
  res.json(insights);
});

app.listen(port, () => {
  console.log(`ToolThinker server is running on port ${port}`);
}); 