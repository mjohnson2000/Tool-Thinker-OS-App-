import React, { useState, useEffect } from 'react';
import './IdeaStage.css';

const API_BASE = 'http://localhost:3001/api';

interface IdeaData {
  jtbd: {
    jobDescription: string;
    currentSolutions: string;
    frustrations: string[];
    idealOutcome: string;
    context: string;
  };
  persona: {
    name: string;
    title: string;
    demographics: string;
    painPoints: string[];
    goals: string[];
    currentBehavior: string;
  };
  validation: {
    problemStatement: string;
    targetCustomer: string;
    evidence: string[];
    competition: string;
    uniqueValue: string;
  };
}

interface IdeaInsights {
  validationScore: number;
  marketOpportunity: 'High' | 'Medium' | 'Low';
  keyInsights: string[];
  risks: string[];
  nextSteps: string[];
  readinessLevel: string;
}

const IdeaStage: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [activeTab, setActiveTab] = useState('persona');
  const [showInsights, setShowInsights] = useState(false);
  const [ideaData, setIdeaData] = useState<IdeaData>({
    jtbd: {
      jobDescription: '',
      currentSolutions: '',
      frustrations: [''],
      idealOutcome: '',
      context: ''
    },
    persona: {
      name: '',
      title: '',
      demographics: '',
      painPoints: [''],
      goals: [''],
      currentBehavior: ''
    },
    validation: {
      problemStatement: '',
      targetCustomer: '',
      evidence: [''],
      competition: '',
      uniqueValue: ''
    }
  });

  // Load saved data on component mount
  useEffect(() => {
    loadProgress();
  }, []);

  const loadProgress = async () => {
    try {
      const response = await fetch(`${API_BASE}/idea-progress`);
      if (response.ok) {
        const data = await response.json();
        if (data.ideaData) {
          setIdeaData(data.ideaData);
        }
      }
    } catch (error) {
      console.error('Failed to load progress:', error);
    }
  };

  const saveProgress = async () => {
    try {
      const response = await fetch(`${API_BASE}/idea-progress`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ideaData }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to save progress');
      }
      
      alert('Progress saved successfully!');
    } catch (error) {
      console.error('Failed to save progress:', error);
      alert('Failed to save progress. Please try again.');
    }
  };

  const generateInsights = (): IdeaInsights => {
    const completionScores = {
      jtbd: calculateJTBDCompletion(),
      persona: calculatePersonaCompletion(),
      validation: calculateValidationCompletion()
    };

    const averageCompletion = (completionScores.jtbd + completionScores.persona + completionScores.validation) / 3;
    
    return {
      validationScore: Math.round(averageCompletion),
      marketOpportunity: averageCompletion > 75 ? 'High' : averageCompletion > 50 ? 'Medium' : 'Low',
      keyInsights: generateKeyInsights(),
      risks: generateRisks(),
      nextSteps: generateNextSteps(),
      readinessLevel: getReadinessLevel(averageCompletion)
    };
  };

  const generateKeyInsights = (): string[] => {
    const insights: string[] = [];
    
    if (ideaData.jtbd.jobDescription && ideaData.jtbd.frustrations.filter(f => f.trim()).length > 0) {
      insights.push(`Your target customers are trying to ${ideaData.jtbd.jobDescription.toLowerCase()} but face ${ideaData.jtbd.frustrations.filter(f => f.trim()).length} key frustrations with current solutions.`);
    }

    if (ideaData.persona.painPoints.filter(p => p.trim()).length >= 2) {
      insights.push(`Your ideal customer (${ideaData.persona.name || 'target persona'}) has multiple pain points, indicating strong potential demand for a solution.`);
    }

    if (ideaData.validation.uniqueValue && ideaData.validation.competition) {
      insights.push(`You've identified a unique value proposition that differentiates you from existing competition.`);
    }

    if (ideaData.validation.evidence.filter(e => e.trim()).length >= 2) {
      insights.push(`You have ${ideaData.validation.evidence.filter(e => e.trim()).length} pieces of evidence supporting your problem hypothesis.`);
    }

    return insights.length > 0 ? insights : ['Complete more sections to generate personalized insights.'];
  };

  const generateRisks = (): string[] => {
    const risks: string[] = [];

    if (!ideaData.validation.evidence.some(e => e.trim())) {
      risks.push('Lack of concrete evidence for the problem - consider conducting customer interviews.');
    }

    if (!ideaData.validation.competition.trim()) {
      risks.push('No competitive analysis completed - understanding competition is crucial for positioning.');
    }

    if (ideaData.jtbd.frustrations.filter(f => f.trim()).length < 2) {
      risks.push('Limited understanding of customer frustrations - dig deeper into pain points.');
    }

    if (!ideaData.persona.currentBehavior.trim()) {
      risks.push('Unclear current customer behavior - understanding this is key for product adoption.');
    }

    if (!ideaData.validation.uniqueValue.trim()) {
      risks.push('No clear unique value proposition - essential for differentiation and market success.');
    }

    return risks.length > 0 ? risks : ['No major risks identified based on current inputs.'];
  };

  const generateNextSteps = (): string[] => {
    const steps: string[] = [];
    const completion = {
      jtbd: calculateJTBDCompletion(),
      persona: calculatePersonaCompletion(),
      validation: calculateValidationCompletion()
    };

    if (completion.jtbd < 80) {
      steps.push('Complete the Jobs-to-be-Done framework to better understand customer needs.');
    }

    if (completion.persona < 80) {
      steps.push('Finish developing your customer persona with demographics and behavioral insights.');
    }

    if (completion.validation < 80) {
      steps.push('Gather more evidence for problem validation through customer research.');
    }

    if (Math.min(completion.jtbd, completion.persona, completion.validation) >= 80) {
      steps.push('Conduct 5-10 customer discovery interviews to validate your assumptions.');
      steps.push('Create a simple landing page to test market interest and collect emails.');
      steps.push('Research your competition more deeply and identify your unique positioning.');
      steps.push('Define your Minimum Viable Product (MVP) based on core customer needs.');
      steps.push('Move to the Validation Stage to test your solution hypotheses.');
    }

    return steps;
  };

  const getReadinessLevel = (completion: number): string => {
    if (completion >= 80) return 'Ready for Customer Validation';
    if (completion >= 60) return 'Good Foundation - Need More Research';
    if (completion >= 40) return 'Early Stage - Continue Building Understanding';
    return 'Just Getting Started - Focus on Core Frameworks';
  };

  const calculateJTBDCompletion = (): number => {
    const jtbd = ideaData.jtbd;
    const fields = [
      jtbd.jobDescription,
      jtbd.currentSolutions,
      jtbd.idealOutcome,
      jtbd.context
    ];
    const filledFields = fields.filter(field => field.trim().length > 0).length;
    const filledFrustrations = jtbd.frustrations.filter(f => f.trim().length > 0).length;
    
    return Math.round(((filledFields + Math.min(filledFrustrations / 2, 1)) / 5) * 100);
  };

  const calculatePersonaCompletion = (): number => {
    const persona = ideaData.persona;
    const fields = [
      persona.name,
      persona.title,
      persona.demographics,
      persona.currentBehavior
    ];
    const filledFields = fields.filter(field => field.trim().length > 0).length;
    const filledPainPoints = persona.painPoints.filter(p => p.trim().length > 0).length;
    const filledGoals = persona.goals.filter(g => g.trim().length > 0).length;
    
    return Math.round(((filledFields + Math.min(filledPainPoints / 2, 1) + Math.min(filledGoals / 2, 1)) / 6) * 100);
  };

  const calculateValidationCompletion = (): number => {
    const validation = ideaData.validation;
    const fields = [
      validation.problemStatement,
      validation.targetCustomer,
      validation.competition,
      validation.uniqueValue
    ];
    const filledFields = fields.filter(field => field.trim().length > 0).length;
    const filledEvidence = validation.evidence.filter(e => e.trim().length > 0).length;
    
    return Math.round(((filledFields + Math.min(filledEvidence / 2, 1)) / 5) * 100);
  };

  const addListItem = (section: keyof IdeaData, field: string) => {
    setIdeaData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: [...(prev[section] as any)[field], '']
      }
    }));
  };

  const updateListItem = (section: keyof IdeaData, field: string, index: number, value: string) => {
    setIdeaData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: (prev[section] as any)[field].map((item: string, i: number) => i === index ? value : item)
      }
    }));
  };

  const updateField = (section: keyof IdeaData, field: string, value: string) => {
    setIdeaData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  const viewInsights = () => {
    setShowInsights(true);
  };

  if (showInsights) {
    const insights = generateInsights();
    
    return (
      <div className="idea-stage">
        <div className="back-navigation">
          <button className="back-button" onClick={() => setShowInsights(false)}>
            ← Back to Frameworks
          </button>
        </div>

        <div className="insights-container">
          <div className="insights-header">
            <h2>🎯 Your Idea Analysis & Insights</h2>
            <p>Based on your framework responses, here's what we discovered about your startup idea</p>
          </div>

          <div className="insights-grid">
            <div className="insight-card validation-score">
              <h3>📊 Validation Score</h3>
              <div className="score-display">
                <span className="score-number">{insights.validationScore}%</span>
                <span className="score-label">{insights.readinessLevel}</span>
              </div>
              <div className="score-bar">
                <div 
                  className="score-fill" 
                  style={{ width: `${insights.validationScore}%` }}
                ></div>
              </div>
            </div>

            <div className="insight-card market-opportunity">
              <h3>🎯 Market Opportunity</h3>
              <div className={`opportunity-badge ${insights.marketOpportunity.toLowerCase()}`}>
                {insights.marketOpportunity}
              </div>
              <p>Based on problem clarity, customer understanding, and competitive positioning</p>
            </div>

            <div className="insight-card key-insights">
              <h3>💡 Key Insights</h3>
              <ul>
                {insights.keyInsights.map((insight, index) => (
                  <li key={index}>{insight}</li>
                ))}
              </ul>
            </div>

            <div className="insight-card risks">
              <h3>⚠️ Risks & Gaps</h3>
              <ul>
                {insights.risks.map((risk, index) => (
                  <li key={index}>{risk}</li>
                ))}
              </ul>
            </div>

            <div className="insight-card next-steps">
              <h3>🚀 Recommended Next Steps</h3>
              <ol>
                {insights.nextSteps.map((step, index) => (
                  <li key={index}>{step}</li>
                ))}
              </ol>
            </div>

            <div className="insight-card completion-breakdown">
              <h3>📋 Framework Completion</h3>
              <div className="completion-item">
                <span>Jobs-to-be-Done</span>
                <div className="completion-bar">
                  <div 
                    className="completion-fill" 
                    style={{ width: `${calculateJTBDCompletion()}%` }}
                  ></div>
                </div>
                <span>{calculateJTBDCompletion()}%</span>
              </div>
              <div className="completion-item">
                <span>Customer Persona</span>
                <div className="completion-bar">
                  <div 
                    className="completion-fill" 
                    style={{ width: `${calculatePersonaCompletion()}%` }}
                  ></div>
                </div>
                <span>{calculatePersonaCompletion()}%</span>
              </div>
              <div className="completion-item">
                <span>Problem Validation</span>
                <div className="completion-bar">
                  <div 
                    className="completion-fill" 
                    style={{ width: `${calculateValidationCompletion()}%` }}
                  ></div>
                </div>
                <span>{calculateValidationCompletion()}%</span>
              </div>
            </div>
          </div>

          <div className="insights-actions">
            <button className="action-btn primary" onClick={() => setShowInsights(false)}>
              Continue Working on Frameworks
            </button>
            <button className="action-btn secondary" onClick={onBack}>
              Return to Dashboard
            </button>
            {insights.validationScore >= 70 && (
              <button className="action-btn success" onClick={() => alert('Validation Stage coming soon!')}>
                Advance to Validation Stage
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="idea-stage">
      <div className="back-navigation">
        <button className="back-button" onClick={onBack}>
          ← Back to Dashboard
        </button>
      </div>

      <div className="idea-header">
        <h2>🧑‍💼 Jobs Stage: Foundation Building</h2>
        <p>Let's discover the jobs your customer is hiring your product for.</p>
      </div>

      <div className="tab-navigation">
        <button 
          className={`tab ${activeTab === 'persona' ? 'active' : ''}`}
          onClick={() => setActiveTab('persona')}
        >
          Customer Persona
        </button>
        <button 
          className={`tab ${activeTab === 'jtbd' ? 'active' : ''}`}
          onClick={() => setActiveTab('jtbd')}
        >
          Jobs-to-be-Done
        </button>
        <button 
          className={`tab ${activeTab === 'validation' ? 'active' : ''}`}
          onClick={() => setActiveTab('validation')}
        >
          Problem Validation
        </button>
      </div>

      {activeTab === 'jtbd' && (
        <div className="framework-content">
          <div className="framework-intro">
            <h3>🎯 Jobs-to-be-Done Discovery</h3>
            <p>Understand the fundamental job your customers are hiring your product to do.</p>
          </div>

          <div className="form-section">
            <label>What job is the customer trying to get done?</label>
            <textarea
              value={ideaData.jtbd.jobDescription}
              onChange={(e) => updateField('jtbd', 'jobDescription', e.target.value)}
              placeholder="I don't know"
            />
            <p className="helper-text">Think about the functional, emotional, and social aspects of the job</p>
          </div>

          <div className="form-section">
            <label>What are they currently using to get this job done?</label>
            <textarea
              value={ideaData.jtbd.currentSolutions}
              onChange={(e) => updateField('jtbd', 'currentSolutions', e.target.value)}
              placeholder="e.g., 'Google searches, asking locals, Yelp reviews, food blogs'"
            />
          </div>

          <div className="form-section">
            <label>What are their frustrations with current solutions?</label>
            {ideaData.jtbd.frustrations.map((frustration, index) => (
              <div key={index} className="list-input">
                <input
                  type="text"
                  value={frustration}
                  onChange={(e) => updateListItem('jtbd', 'frustrations', index, e.target.value)}
                  placeholder="Frustration 1"
                />
                {index === ideaData.jtbd.frustrations.length - 1 && (
                  <button 
                    className="add-button"
                    onClick={() => addListItem('jtbd', 'frustrations')}
                    type="button"
                  >
                    +
                  </button>
                )}
              </div>
            ))}
          </div>

          <div className="form-section">
            <label>What would be their ideal outcome?</label>
            <textarea
              value={ideaData.jtbd.idealOutcome}
              onChange={(e) => updateField('jtbd', 'idealOutcome', e.target.value)}
              placeholder="e.g., 'Find a great restaurant that matches my preferences in under 2 minutes, with confidence it will be worth my time'"
            />
          </div>

          <div className="form-section">
            <label>In what context does this job arise?</label>
            <textarea
              value={ideaData.jtbd.context}
              onChange={(e) => updateField('jtbd', 'context', e.target.value)}
              placeholder="e.g., 'When traveling to a new city, short on time, wanting to impress a date'"
            />
          </div>
        </div>
      )}

      {activeTab === 'persona' && (
        <div className="framework-content">
          <div className="framework-intro">
            <h3>👤 Customer Persona Development</h3>
            <p>Create a detailed profile of your ideal customer to guide product decisions.</p>
          </div>

          <div className="form-section">
            <label>Name & Job Title</label>
            <input
              type="text"
              value={ideaData.persona.name}
              onChange={(e) => updateField('persona', 'name', e.target.value)}
              placeholder="e.g., Sarah Chen, Marketing Manager"
            />
          </div>

          <div className="form-section">
            <label>Key Demographics</label>
            <textarea
              value={ideaData.persona.demographics}
              onChange={(e) => updateField('persona', 'demographics', e.target.value)}
              placeholder="Age, location, income, lifestyle, tech comfort level, etc."
            />
          </div>

          <div className="form-section">
            <label>Main Pain Points</label>
            {ideaData.persona.painPoints.map((painPoint, index) => (
              <div key={index} className="list-input">
                <input
                  type="text"
                  value={painPoint}
                  onChange={(e) => updateListItem('persona', 'painPoints', index, e.target.value)}
                  placeholder="Pain point"
                />
                {index === ideaData.persona.painPoints.length - 1 && (
                  <button 
                    className="add-button"
                    onClick={() => addListItem('persona', 'painPoints')}
                    type="button"
                  >
                    +
                  </button>
                )}
              </div>
            ))}
          </div>

          <div className="form-section">
            <label>Goals & Motivations</label>
            {ideaData.persona.goals.map((goal, index) => (
              <div key={index} className="list-input">
                <input
                  type="text"
                  value={goal}
                  onChange={(e) => updateListItem('persona', 'goals', index, e.target.value)}
                  placeholder="Goal or motivation"
                />
                {index === ideaData.persona.goals.length - 1 && (
                  <button 
                    className="add-button"
                    onClick={() => addListItem('persona', 'goals')}
                    type="button"
                  >
                    +
                  </button>
                )}
              </div>
            ))}
          </div>

          <div className="form-section">
            <label>Current Behavior & Habits</label>
            <textarea
              value={ideaData.persona.currentBehavior}
              onChange={(e) => updateField('persona', 'currentBehavior', e.target.value)}
              placeholder="How do they currently solve this problem? What tools do they use? What's their typical day like?"
            />
          </div>
        </div>
      )}

      {activeTab === 'validation' && (
        <div className="framework-content">
          <div className="framework-intro">
            <h3>✅ Problem Validation</h3>
            <p>Validate that you're solving a real, significant problem for your target customer.</p>
          </div>

          <div className="form-section">
            <label>Problem Statement</label>
            <textarea
              value={ideaData.validation.problemStatement}
              onChange={(e) => updateField('validation', 'problemStatement', e.target.value)}
              placeholder="Clearly articulate the problem you're solving in 1-2 sentences"
            />
          </div>

          <div className="form-section">
            <label>Target Customer</label>
            <textarea
              value={ideaData.validation.targetCustomer}
              onChange={(e) => updateField('validation', 'targetCustomer', e.target.value)}
              placeholder="Who specifically has this problem? Be as specific as possible."
            />
          </div>

          <div className="form-section">
            <label>Evidence of the Problem</label>
            {ideaData.validation.evidence.map((evidence, index) => (
              <div key={index} className="list-input">
                <input
                  type="text"
                  value={evidence}
                  onChange={(e) => updateListItem('validation', 'evidence', index, e.target.value)}
                  placeholder="Evidence source (surveys, interviews, research, etc.)"
                />
                {index === ideaData.validation.evidence.length - 1 && (
                  <button 
                    className="add-button"
                    onClick={() => addListItem('validation', 'evidence')}
                    type="button"
                  >
                    +
                  </button>
                )}
              </div>
            ))}
          </div>

          <div className="form-section">
            <label>Competitive Analysis</label>
            <textarea
              value={ideaData.validation.competition}
              onChange={(e) => updateField('validation', 'competition', e.target.value)}
              placeholder="Who else is solving this problem? How are they doing it? What are they missing?"
            />
          </div>

          <div className="form-section">
            <label>Your Unique Value Proposition</label>
            <textarea
              value={ideaData.validation.uniqueValue}
              onChange={(e) => updateField('validation', 'uniqueValue', e.target.value)}
              placeholder="What makes your solution different and better?"
            />
          </div>
        </div>
      )}

      <div className="idea-actions">
        <button className="save-progress-btn" onClick={saveProgress}>
          💾 Save Progress
        </button>
        <button className="next-stage-btn" onClick={viewInsights}>
          📊 View Insights & Analysis
        </button>
      </div>

      <div className="progress-tracker">
        <h4>Framework Completion</h4>
        <div className="progress-items">
          <div className={`progress-item ${calculateJTBDCompletion() >= 80 ? 'completed' : ''}`}>
            Jobs-to-be-Done: {calculateJTBDCompletion()}% complete
          </div>
          <div className={`progress-item ${calculatePersonaCompletion() >= 80 ? 'completed' : ''}`}>
            Customer Persona: {calculatePersonaCompletion()}% complete
          </div>
          <div className={`progress-item ${calculateValidationCompletion() >= 80 ? 'completed' : ''}`}>
            Problem Validation: {calculateValidationCompletion()}% complete
          </div>
        </div>
      </div>
    </div>
  );
};

export default IdeaStage;