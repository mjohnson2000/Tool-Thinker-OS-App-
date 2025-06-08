import { useState, useEffect } from 'react'
import './App.css'
import IdeaStage from './IdeaStage'

interface FrameworkTool {
  id: string;
  name: string;
  description: string;
  stage: string;
  questions?: string[];
}

interface Recommendation {
  recommendedFramework: FrameworkTool;
  tip: string;
  nextSteps: string[];
}

const API_BASE = 'http://localhost:3001/api';

function App() {
  const [currentStage, setCurrentStage] = useState<string>('Idea')
  const [reflection, setReflection] = useState<string>('')
  const [frameworks, setFrameworks] = useState<FrameworkTool[]>([])
  const [recommendation, setRecommendation] = useState<Recommendation | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [saveStatus, setSaveStatus] = useState<string>('')
  const [showIdeaStage, setShowIdeaStage] = useState<boolean>(false)

  const stages = ['Idea', 'Validation', 'MVP', 'Launch']

  // Fetch initial data
  useEffect(() => {
    Promise.all([
      fetch(`${API_BASE}/frameworks`).then(res => res.json()),
      fetch(`${API_BASE}/progress`).then(res => res.json()),
      fetch(`${API_BASE}/recommendations`).then(res => res.json())
    ])
    .then(([frameworksData, progressData, recommendationData]) => {
      setFrameworks(frameworksData)
      setCurrentStage(progressData.currentStage)
      setRecommendation(recommendationData)
      setLoading(false)
    })
    .catch(err => {
      console.error('Error fetching data:', err)
      setLoading(false)
    })
  }, [])

  // Update stage and sync with backend
  const handleStageChange = async (newStage: string) => {
    setCurrentStage(newStage)
    setShowIdeaStage(false) // Close idea stage when switching stages
    
    try {
      await fetch(`${API_BASE}/progress`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentStage: newStage })
      })
      
      // Fetch new recommendations for the stage
      const recommendationResponse = await fetch(`${API_BASE}/recommendations`)
      const newRecommendation = await recommendationResponse.json()
      setRecommendation(newRecommendation)
    } catch (err) {
      console.error('Error updating stage:', err)
    }
  }

  // Save reflection to backend
  const handleSaveReflection = async () => {
    if (!reflection.trim()) return
    
    try {
      const response = await fetch(`${API_BASE}/reflections`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reflection, stage: currentStage })
      })
      
      if (response.ok) {
        setSaveStatus('Reflection saved!')
        setReflection('')
        setTimeout(() => setSaveStatus(''), 3000)
      }
    } catch (err) {
      console.error('Error saving reflection:', err)
      setSaveStatus('Error saving reflection')
    }
  }

  // Handle framework button click
  const handleFrameworkClick = () => {
    if (currentStage === 'Idea') {
      setShowIdeaStage(true)
    } else {
      // For other stages, you could navigate to their specific tools
      alert(`${currentStage} stage tools coming soon!`)
    }
  }

  const currentFramework = frameworks.find(f => f.stage === currentStage)

  if (loading) {
    return (
      <div className="thinking-os">
        <div className="loading-container">
          <h2>Loading ToolThinker...</h2>
          <p>Preparing your thinking OS for startup success</p>
        </div>
      </div>
    )
  }

  // Show Idea Stage if selected
  if (showIdeaStage) {
    return (
      <div className="thinking-os">
        <div className="back-navigation">
          <button 
            className="back-button"
            onClick={() => setShowIdeaStage(false)}
          >
            ← Back to Dashboard
          </button>
        </div>
        <IdeaStage onBack={() => setShowIdeaStage(false)} />
      </div>
    )
  }

  return (
    <div className="thinking-os">
      <header className="app-header">
        <h1>ToolThinker</h1>
        <p>Your Thinking OS for Startup Success</p>
      </header>

      {/* Stage Tracker */}
      <section className="stage-tracker">
        <h2>Startup Journey Tracker</h2>
        <div className="stages">
          {stages.map((stage, index) => (
            <div key={stage} className="stage-item">
              <button 
                className={`stage-button ${currentStage === stage ? 'active' : ''}`}
                onClick={() => handleStageChange(stage)}
              >
                {stage}
              </button>
              {index < stages.length - 1 && <span className="stage-arrow">→</span>}
            </div>
          ))}
        </div>
      </section>

      {/* AI-Recommended Framework */}
      <section className="framework-section">
        <h2>AI Recommended Framework</h2>
        <div className="framework-card">
          <h3>{recommendation?.recommendedFramework?.name || currentFramework?.name}</h3>
          <p>{recommendation?.recommendedFramework?.description || currentFramework?.description}</p>
          <p className="ai-note">🤖 {recommendation?.tip || `AI suggests this framework for your ${currentStage} stage`}</p>
          
          {recommendation?.nextSteps && (
            <div className="next-steps">
              <h4>Next Steps:</h4>
              <ul>
                {recommendation.nextSteps.map((step, index) => (
                  <li key={index}>{step}</li>
                ))}
              </ul>
            </div>
          )}
          
          <button className="cta-button" onClick={handleFrameworkClick}>
            Start {recommendation?.recommendedFramework?.name || currentFramework?.name}
          </button>
        </div>
      </section>

      {/* Tool Library */}
      <section className="tools-section">
        <h2>Framework Library</h2>
        <div className="tools-grid">
          {frameworks.map(tool => (
            <div key={tool.id} className={`tool-card ${tool.stage === currentStage ? 'highlighted' : ''}`}>
              <h4>{tool.name}</h4>
              <p>{tool.description}</p>
              <span className="tool-stage">For: {tool.stage}</span>
              
              {tool.questions && (
                <div className="tool-questions">
                  <p><strong>Key Questions:</strong></p>
                  <ul>
                    {tool.questions.slice(0, 2).map((question, index) => (
                      <li key={index}>{question}</li>
                    ))}
                  </ul>
                </div>
              )}
              
              {tool.stage === currentStage && (
                <button 
                  className="tool-action-btn"
                  onClick={handleFrameworkClick}
                >
                  Use This Tool
                </button>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Reflection Journal */}
      <section className="journal-section">
        <h2>Founder Reflection</h2>
        <div className="journal-card">
          <p>What did you learn or decide today?</p>
          <textarea
            placeholder="Reflect on your progress, assumptions tested, or key insights..."
            value={reflection}
            onChange={(e) => setReflection(e.target.value)}
            rows={4}
          />
          <div className="journal-actions">
            <button 
              className="save-button" 
              onClick={handleSaveReflection}
              disabled={!reflection.trim()}
            >
              Save Reflection
            </button>
            {saveStatus && <span className="save-status">{saveStatus}</span>}
          </div>
        </div>
      </section>

      {/* AI Coach */}
      <section className="ai-coach">
        <div className="coach-card">
          <h3>🧠 AI Thinking Coach</h3>
          <p>Need guidance? Ask about frameworks, validate assumptions, or get unstuck.</p>
          <p className="coach-tip">Current stage: <strong>{currentStage}</strong> - Focus on {recommendation?.tip?.toLowerCase() || 'building clarity through structured thinking'}</p>
          <button className="coach-button">Chat with AI Coach</button>
        </div>
      </section>
    </div>
  )
}

export default App
