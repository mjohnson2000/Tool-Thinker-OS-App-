import React, { useState, useEffect } from 'react';
import './IdeaDiscovery.css';

interface IdeaDiscoveryProps {
  onAdvance: () => void;
}

interface Problem {
  id: string;
  description: string;
  severity: 'low' | 'medium' | 'high';
  frequency: 'rarely' | 'sometimes' | 'often' | 'daily';
}

interface Skill {
  name: string;
  level: 'beginner' | 'intermediate' | 'expert';
}

interface MarketTrend {
  id: string;
  name: string;
  selected: boolean;
}

// Local storage helpers
const saveDiscoveryData = (data: any) => {
  try {
    localStorage.setItem('toolthinker_discovery_data', JSON.stringify(data));
  } catch (error) {
    console.warn('Failed to save discovery data:', error);
  }
};

const loadDiscoveryData = () => {
  try {
    const data = localStorage.getItem('toolthinker_discovery_data');
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.warn('Failed to load discovery data:', error);
    return null;
  }
};

function IdeaDiscovery({ onAdvance }: IdeaDiscoveryProps) {
  const [activeTab, setActiveTab] = useState<'problems' | 'skills' | 'trends' | 'insights'>('problems');
  
  // Load saved data or use defaults
  const savedData = loadDiscoveryData();
  
  const [problems, setProblems] = useState<Problem[]>(savedData?.problems || []);
  const [newProblem, setNewProblem] = useState('');
  const [skills, setSkills] = useState<Skill[]>(savedData?.skills || []);
  const [newSkill, setNewSkill] = useState('');
  const [skillLevel, setSkillLevel] = useState<'beginner' | 'intermediate' | 'expert'>('intermediate');
  const [trends, setTrends] = useState<MarketTrend[]>(savedData?.trends || [
    { id: '1', name: 'AI & Machine Learning', selected: false },
    { id: '2', name: 'Remote Work & Digital Nomadism', selected: false },
    { id: '3', name: 'Sustainability & Climate Tech', selected: false },
    { id: '4', name: 'Health & Wellness', selected: false },
    { id: '5', name: 'EdTech & Online Learning', selected: false },
    { id: '6', name: 'FinTech & Digital Payments', selected: false },
    { id: '7', name: 'Creator Economy', selected: false },
    { id: '8', name: 'Web3 & Blockchain', selected: false },
    { id: '9', name: 'Mental Health & Wellbeing', selected: false },
    { id: '10', name: 'Climate Change & Green Tech', selected: false }
  ]);

  // Save data whenever state changes
  useEffect(() => {
    const dataToSave = {
      problems,
      skills,
      trends,
      lastUpdated: new Date().toISOString()
    };
    saveDiscoveryData(dataToSave);
  }, [problems, skills, trends]);

  const addProblem = () => {
    if (newProblem.trim()) {
      const problem: Problem = {
        id: Date.now().toString(),
        description: newProblem.trim(),
        severity: 'medium',
        frequency: 'sometimes'
      };
      setProblems([...problems, problem]);
      setNewProblem('');
    }
  };

  const updateProblem = (id: string, field: keyof Problem, value: string) => {
    setProblems(problems.map(p => 
      p.id === id ? { ...p, [field]: value } : p
    ));
  };

  const removeProblem = (id: string) => {
    setProblems(problems.filter(p => p.id !== id));
  };

  const addSkill = () => {
    if (newSkill.trim()) {
      const skill: Skill = {
        name: newSkill.trim(),
        level: skillLevel
      };
      setSkills([...skills, skill]);
      setNewSkill('');
    }
  };

  const removeSkill = (index: number) => {
    setSkills(skills.filter((_, i) => i !== index));
  };

  const toggleTrend = (id: string) => {
    setTrends(trends.map(t => 
      t.id === id ? { ...t, selected: !t.selected } : t
    ));
  };

  const generateInsights = () => {
    const topProblems = problems
      .filter(p => p.severity === 'high' && (p.frequency === 'often' || p.frequency === 'daily'))
      .slice(0, 3);

    const expertSkills = skills.filter(s => s.level === 'expert');
    const relevantTrends = trends.filter(t => t.selected);

    // Enhanced opportunity scoring
    const opportunityAnalysis = problems.map(problem => {
      let score = 0;
      
      // Severity scoring
      if (problem.severity === 'high') score += 40;
      else if (problem.severity === 'medium') score += 25;
      else score += 10;
      
      // Frequency scoring
      if (problem.frequency === 'daily') score += 30;
      else if (problem.frequency === 'often') score += 20;
      else if (problem.frequency === 'sometimes') score += 10;
      else score += 5;
      
      // Skills alignment bonus (check if problem relates to user skills)
      const hasRelevantSkill = skills.some(skill => 
        skill.level === 'expert' && (
          problem.description.toLowerCase().includes(skill.name.toLowerCase()) ||
          skill.name.toLowerCase().includes('business') ||
          skill.name.toLowerCase().includes('technical')
        )
      );
      if (hasRelevantSkill) score += 20;
      
      // Market trend alignment bonus
      const alignsWithTrend = relevantTrends.some(trend => 
        problem.description.toLowerCase().includes(trend.name.toLowerCase().split(' ')[0].toLowerCase())
      );
      if (alignsWithTrend) score += 15;

      return { ...problem, opportunityScore: score };
    }).sort((a, b) => b.opportunityScore - a.opportunityScore);

    // Generate personalized recommendations
    const recommendations = [];
    
    if (topProblems.length > 0) {
      recommendations.push("🔍 Interview 10-15 people who experience your top problems");
      recommendations.push("📊 Research existing solutions and their gaps");
    }
    
    if (expertSkills.length > 0) {
      recommendations.push(`💪 Leverage your ${expertSkills[0].name} expertise as a competitive advantage`);
    }
    
    if (relevantTrends.length >= 2) {
      recommendations.push("🌊 Look for problems created or amplified by your selected trends");
    }
    
    recommendations.push("💡 Create a problem statement for your top 3 opportunities");
    recommendations.push("🎯 Validate that others care about solving these problems");

    const readyToAdvance = problems.length >= 3 && skills.length >= 2 && relevantTrends.length >= 2;

    return {
      topProblems,
      expertSkills,
      relevantTrends,
      opportunityAnalysis: opportunityAnalysis.slice(0, 5),
      recommendations,
      readyToAdvance,
      totalOpportunities: problems.length,
      highImpactOpportunities: topProblems.length
    };
  };

  const insights = generateInsights();

  const renderProblemsTab = () => (
    <div className="discovery-content">
      <div className="discovery-intro">
        <h3>🎯 Problem Discovery</h3>
        <p>Great businesses solve real problems. Think about frustrations you experience daily or problems you've observed others struggling with.</p>
      </div>

      <div className="input-section">
        <label>What problems do you or others face regularly?</label>
        <div className="problem-input">
          <input
            type="text"
            value={newProblem}
            onChange={(e) => setNewProblem(e.target.value)}
            placeholder="e.g., Hard to find reliable freelancers for small projects"
            onKeyPress={(e) => e.key === 'Enter' && addProblem()}
          />
          <button onClick={addProblem} className="add-btn">+</button>
        </div>
      </div>

      <div className="problems-list">
        {problems.map((problem) => (
          <div key={problem.id} className="problem-card">
            <div className="problem-description">
              <span>{problem.description}</span>
              <button onClick={() => removeProblem(problem.id)} className="remove-btn">×</button>
            </div>
            <div className="problem-details">
              <div className="detail-group">
                <label>How severe is this problem?</label>
                <select 
                  value={problem.severity}
                  onChange={(e) => updateProblem(problem.id, 'severity', e.target.value)}
                >
                  <option value="low">Low - Minor inconvenience</option>
                  <option value="medium">Medium - Noticeable frustration</option>
                  <option value="high">High - Major pain point</option>
                </select>
              </div>
              <div className="detail-group">
                <label>How often does this occur?</label>
                <select 
                  value={problem.frequency}
                  onChange={(e) => updateProblem(problem.id, 'frequency', e.target.value)}
                >
                  <option value="rarely">Rarely</option>
                  <option value="sometimes">Sometimes</option>
                  <option value="often">Often</option>
                  <option value="daily">Daily</option>
                </select>
              </div>
            </div>
          </div>
        ))}
      </div>

      {problems.length === 0 && (
        <div className="empty-state">
          <p>💡 Start by adding problems you've personally experienced or witnessed.</p>
          <div className="example-problems">
            <strong>Examples:</strong>
            <ul>
              <li>Difficulty scheduling meetings across time zones</li>
              <li>Hard to track expenses for small businesses</li>
              <li>Finding quality childcare on short notice</li>
              <li>Keeping plants alive without gardening experience</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );

  const renderSkillsTab = () => (
    <div className="discovery-content">
      <div className="discovery-intro">
        <h3>🛠️ Skills & Expertise Assessment</h3>
        <p>Your skills and knowledge areas can guide you toward problems you're uniquely positioned to solve.</p>
      </div>

      <div className="input-section">
        <label>What are your key skills and areas of expertise?</label>
        <div className="skill-input">
          <input
            type="text"
            value={newSkill}
            onChange={(e) => setNewSkill(e.target.value)}
            placeholder="e.g., Web Development, Marketing, Design"
            onKeyPress={(e) => e.key === 'Enter' && addSkill()}
          />
          <select 
            value={skillLevel}
            onChange={(e) => setSkillLevel(e.target.value as 'beginner' | 'intermediate' | 'expert')}
          >
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="expert">Expert</option>
          </select>
          <button onClick={addSkill} className="add-btn">+</button>
        </div>
      </div>

      <div className="skills-list">
        {skills.map((skill, index) => (
          <div key={index} className="skill-card">
            <span className="skill-name">{skill.name}</span>
            <span className={`skill-level ${skill.level}`}>{skill.level}</span>
            <button onClick={() => removeSkill(index)} className="remove-btn">×</button>
          </div>
        ))}
      </div>

      {skills.length === 0 && (
        <div className="empty-state">
          <p>💡 List both technical and soft skills. Don't underestimate domain knowledge!</p>
          <div className="example-skills">
            <strong>Examples:</strong>
            <ul>
              <li>Technical: Programming, Data Analysis, Graphic Design</li>
              <li>Business: Sales, Project Management, Customer Service</li>
              <li>Domain: Healthcare, Education, Finance, Real Estate</li>
              <li>Creative: Writing, Video Production, Music</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );

  const renderTrendsTab = () => (
    <div className="discovery-content">
      <div className="discovery-intro">
        <h3>📈 Market Trends & Opportunities</h3>
        <p>Select trends and growing markets that interest you. These represent areas with increasing demand and opportunity.</p>
      </div>

      <div className="trends-grid">
        {trends.map((trend) => (
          <div 
            key={trend.id} 
            className={`trend-card ${trend.selected ? 'selected' : ''}`}
            onClick={() => toggleTrend(trend.id)}
          >
            <span>{trend.name}</span>
            {trend.selected && <span className="selected-indicator">✓</span>}
          </div>
        ))}
      </div>

      <div className="trend-insights">
        <h4>Selected Trends ({trends.filter(t => t.selected).length})</h4>
        <p>Choose 2-4 trends that align with your interests and expertise. These will help identify where your skills might create value.</p>
      </div>
    </div>
  );

  const renderInsightsTab = () => (
    <div className="discovery-content full-analysis">
      <div className="full-analysis-header">
        <button 
          className="back-to-discovery"
          onClick={() => setActiveTab('problems')}
        >
          ← Back to Discovery
        </button>
        <div className="analysis-title">
          <h3>📋 Complete Opportunity Analysis</h3>
          <p>Comprehensive insights based on your {insights.totalOpportunities} problems, {skills.length} skills, and {insights.relevantTrends.length} selected trends.</p>
        </div>
      </div>

      <div className="insights-grid">
        {/* Opportunity Scoring */}
        {insights.opportunityAnalysis.length > 0 && (
          <div className="insight-card opportunity-analysis">
            <h4>🎯 Top Opportunity Scores</h4>
            <div className="opportunity-list">
              {insights.opportunityAnalysis.map((opportunity, index) => (
                <div key={opportunity.id} className="opportunity-item">
                  <div className="opportunity-rank">#{index + 1}</div>
                  <div className="opportunity-details">
                    <div className="opportunity-problem">{opportunity.description}</div>
                    <div className="opportunity-meta">
                      <span className={`severity ${opportunity.severity}`}>{opportunity.severity} severity</span>
                      <span className={`frequency ${opportunity.frequency}`}>{opportunity.frequency}</span>
                      <span className="score">Score: {opportunity.opportunityScore}/100</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <p className="analysis-note">
              💡 Higher scores indicate better opportunities based on severity, frequency, your skills, and market trends.
            </p>
          </div>
        )}

        {/* High Priority Problems */}
        {insights.topProblems.length > 0 && (
          <div className="insight-card high-priority">
            <h4>🔥 Critical Problems ({insights.highImpactOpportunities})</h4>
            <ul>
              {insights.topProblems.map((problem) => (
                <li key={problem.id}>
                  <strong>{problem.description}</strong>
                  <span className="problem-impact">High severity • {problem.frequency} occurrence</span>
                </li>
              ))}
            </ul>
            <p>These high-severity, frequent problems represent your biggest opportunities.</p>
          </div>
        )}

        {/* Skills Advantage */}
        {insights.expertSkills.length > 0 && (
          <div className="insight-card expertise">
            <h4>🏆 Your Expertise Advantage</h4>
            <ul>
              {insights.expertSkills.map((skill, index) => (
                <li key={index}>
                  <strong>{skill.name}</strong>
                  <span className="skill-level expert">Expert Level</span>
                </li>
              ))}
            </ul>
            <p>Your expert-level skills give you a competitive advantage. Look for problems that leverage these abilities.</p>
          </div>
        )}

        {/* Market Trends */}
        {insights.relevantTrends.length > 0 && (
          <div className="insight-card trends">
            <h4>📊 Market Opportunities</h4>
            <ul>
              {insights.relevantTrends.map((trend) => (
                <li key={trend.id}>
                  <strong>{trend.name}</strong>
                  <span className="trend-indicator">Growing market</span>
                </li>
              ))}
            </ul>
            <p>These growing markets create new problems or amplify existing ones.</p>
          </div>
        )}

        {/* Personalized Recommendations */}
        <div className="insight-card recommendations">
          <h4>🎯 Your Next Steps</h4>
          <ol>
            {insights.recommendations.map((rec, index) => (
              <li key={index}>{rec}</li>
            ))}
          </ol>
          <div className="action-items">
            <h5>💪 Immediate Actions:</h5>
            <div className="quick-actions">
              <div className="action-item">
                <span className="action-icon">📝</span>
                <span>Write problem statements for your top 3 opportunities</span>
              </div>
              <div className="action-item">
                <span className="action-icon">🗣️</span>
                <span>Interview 5 people who experience your highest-scored problem</span>
              </div>
              <div className="action-item">
                <span className="action-icon">🔍</span>
                <span>Research 3 existing solutions in your top opportunity area</span>
              </div>
            </div>
          </div>
        </div>

        {/* Problem-Skill-Trend Intersections */}
        {insights.topProblems.length > 0 && insights.expertSkills.length > 0 && (
          <div className="insight-card intersections">
            <h4>✨ Golden Opportunities</h4>
            <p>Look for problems at the intersection of your expertise and market trends:</p>
            <div className="intersection-grid">
              {insights.topProblems.slice(0, 2).map((problem) => (
                <div key={problem.id} className="intersection-item">
                  <div className="intersection-problem">{problem.description}</div>
                  <div className="intersection-match">
                    {insights.expertSkills.length > 0 && (
                      <span className="match-skill">+ {insights.expertSkills[0].name}</span>
                    )}
                    {insights.relevantTrends.length > 0 && (
                      <span className="match-trend">+ {insights.relevantTrends[0].name}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {insights.readyToAdvance ? (
        <div className="advance-section">
          <div className="ready-indicator">
            <h4>🚀 Ready for Idea Validation!</h4>
            <p>You've completed your discovery with {insights.totalOpportunities} problems identified and {insights.highImpactOpportunities} high-impact opportunities scored.</p>
            <div className="next-step-preview">
              <h5>📋 What's Next:</h5>
              <ul>
                <li>Structure your top opportunity using Jobs-to-be-Done framework</li>
                <li>Define your target persona based on problem research</li>
                <li>Create validation experiments to test demand</li>
              </ul>
            </div>
            <button onClick={onAdvance} className="advance-btn">
              Continue to Idea Validation →
            </button>
          </div>
        </div>
      ) : (
        <div className="progress-indicator">
          <h4>📋 Complete Your Discovery</h4>
          <div className="progress-items">
            <div className={`progress-item ${problems.length >= 3 ? 'completed' : ''}`}>
              <span className="progress-icon">{problems.length >= 3 ? '✅' : '⏳'}</span>
              Problems: {problems.length}/3+ identified
            </div>
            <div className={`progress-item ${skills.length >= 2 ? 'completed' : ''}`}>
              <span className="progress-icon">{skills.length >= 2 ? '✅' : '⏳'}</span>
              Skills: {skills.length}/2+ listed  
            </div>
            <div className={`progress-item ${insights.relevantTrends.length >= 2 ? 'completed' : ''}`}>
              <span className="progress-icon">{insights.relevantTrends.length >= 2 ? '✅' : '⏳'}</span>
              Trends: {insights.relevantTrends.length}/2+ selected
            </div>
          </div>
          <p className="progress-note">Complete all sections to unlock personalized opportunity analysis and advance to idea validation.</p>
        </div>
      )}
    </div>
  );

  return (
    <div className="idea-discovery">
      <div className="discovery-header">
        <h2>🔍 Idea Discovery</h2>
        <p>Identify problems, assess your skills, and explore market trends to discover startup opportunities.</p>
      </div>

      {activeTab === 'insights' ? (
        renderInsightsTab()
      ) : (
        <div className="discovery-main">
          {/* Simple Tab Navigation */}
          <div className="discovery-navigation">
            <button
              className={`discovery-tab ${activeTab === 'problems' ? 'active' : ''}`}
              onClick={() => setActiveTab('problems')}
            >
              <span>🎯</span>
              <div>
                <div>Problems</div>
                <small>{problems.length} identified</small>
              </div>
            </button>
            <button
              className={`discovery-tab ${activeTab === 'skills' ? 'active' : ''}`}
              onClick={() => setActiveTab('skills')}
            >
              <span>🛠️</span>
              <div>
                <div>Skills</div>
                <small>{skills.length} listed</small>
              </div>
            </button>
            <button
              className={`discovery-tab ${activeTab === 'trends' ? 'active' : ''}`}
              onClick={() => setActiveTab('trends')}
            >
              <span>📈</span>
              <div>
                <div>Trends</div>
                <small>{trends.filter(t => t.selected).length} selected</small>
              </div>
            </button>
          </div>

          {/* Content Area */}
          <div className="discovery-content">
            {activeTab === 'problems' && renderProblemsTab()}
            {activeTab === 'skills' && renderSkillsTab()}
            {activeTab === 'trends' && renderTrendsTab()}
          </div>

          {/* Simple Progress Summary */}
          {(problems.length > 0 || skills.length > 0 || trends.filter(t => t.selected).length > 0) && (
            <div className="discovery-summary">
              <div className="summary-stats">
                <div className="stat">
                  <span className="stat-number">{problems.length}</span>
                  <span className="stat-label">Problems</span>
                </div>
                <div className="stat">
                  <span className="stat-number">{skills.length}</span>
                  <span className="stat-label">Skills</span>
                </div>
                <div className="stat">
                  <span className="stat-number">{trends.filter(t => t.selected).length}</span>
                  <span className="stat-label">Trends</span>
                </div>
              </div>
              
              {insights.readyToAdvance ? (
                <div className="ready-to-advance">
                  <h4>✨ Analysis Ready!</h4>
                  <p>You've identified {insights.opportunityAnalysis.length} potential opportunities</p>
                  <button 
                    className="view-insights-btn"
                    onClick={() => setActiveTab('insights')}
                  >
                    View Your Analysis
                  </button>
                </div>
              ) : (
                <div className="continue-discovery">
                  <h4>🎯 Keep Building Your Discovery</h4>
                  <p>Add more data to unlock personalized insights</p>
                  <div className="next-steps">
                    {problems.length < 3 && (
                      <span className="next-step">Add {3 - problems.length} more problem{3 - problems.length !== 1 ? 's' : ''}</span>
                    )}
                    {skills.length < 2 && (
                      <span className="next-step">Add {2 - skills.length} more skill{2 - skills.length !== 1 ? 's' : ''}</span>
                    )}
                    {trends.filter(t => t.selected).length < 2 && (
                      <span className="next-step">Select {2 - trends.filter(t => t.selected).length} more trend{2 - trends.filter(t => t.selected).length !== 1 ? 's' : ''}</span>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default IdeaDiscovery; 