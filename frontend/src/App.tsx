import React, { useState, useEffect } from 'react';
import './App.css';
import IdeaStage from './IdeaStage';
import IdeaDiscovery from './IdeaDiscovery';
import { IdeaValidation } from './IdeaValidation';
import { MVPStage } from './MVPStage';
import { LaunchStage } from './LaunchStage';
import { SmartJourneyMap } from './SmartJourneyMap';
import './SmartJourneyMap.css';
import { WhatsNextButton } from './WhatsNextButton';
import './WhatsNextButton.css';

interface UserProgress {
  completed: boolean;
  lastUpdated: number;
}

type Stage = 'discovery' | 'idea' | 'validation' | 'mvp' | 'launch';
type AppView = 'landing' | 'stages';

// Local storage helper functions
const saveToLocalStorage = (key: string, data: any) => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.warn('Failed to save to localStorage:', error);
  }
};

const loadFromLocalStorage = (key: string, defaultValue: any = null) => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.warn('Failed to load from localStorage:', error);
    return defaultValue;
  }
};

function App() {
  // Load initial state from localStorage or use defaults
  const [currentStage, setCurrentStage] = useState<Stage>(() => 
    loadFromLocalStorage('toolthinker_current_stage', 'discovery')
  );
  const [currentView, setCurrentView] = useState<AppView>(() => 
    loadFromLocalStorage('toolthinker_onboarding_completed', false) ? 'stages' : 'landing'
  );
  const [showOnboarding, setShowOnboarding] = useState(() => 
    !loadFromLocalStorage('toolthinker_onboarding_completed', false)
  );
  const [userProgress, setUserProgress] = useState(() => 
    loadFromLocalStorage('toolthinker_user_progress', {
      discovery: { completed: false, lastUpdated: null },
      idea: { completed: false, lastUpdated: null },
      validation: { completed: false, lastUpdated: null },
      mvp: { completed: false, lastUpdated: null },
      launch: { completed: false, lastUpdated: null }
    })
  );

  // Save to localStorage whenever state changes
  useEffect(() => {
    saveToLocalStorage('toolthinker_current_stage', currentStage);
  }, [currentStage]);

  useEffect(() => {
    saveToLocalStorage('toolthinker_user_progress', userProgress);
  }, [userProgress]);

  const stages = [
    { id: 'discovery', name: 'Discovery', icon: '🔍' },
    { id: 'idea', name: 'Idea', icon: '💡' },
    { id: 'validation', name: 'Validation', icon: '✅' },
    { id: 'mvp', name: 'MVP', icon: '🛠️' },
    { id: 'launch', name: 'Launch', icon: '🚀' }
  ];



  const coachTips = {
    discovery: '🎯 Great! Let\'s help you discover your next opportunity by analyzing problems, skills, and market trends.',
    idea: '💭 Perfect! Let\'s structure your idea using proven frameworks like Jobs-to-be-Done and persona development.',
    validation: '🔬 Smart choice! Let\'s validate your assumptions and test market demand before building.',
    mvp: '⚡ Time to build! Let\'s focus on core features that solve your users\' primary job-to-be-done.',
    launch: '🌟 Launch time! Let\'s create a go-to-market strategy that reaches your target customers effectively.'
  };

  const handleStageAdvance = (nextStage: string) => {
    const newStage = nextStage as Stage;
    
    // Mark current stage as completed
    const updatedProgress = {
      ...userProgress,
      [currentStage]: { 
        completed: true, 
        lastUpdated: new Date().toISOString() 
      }
    };
    
    setUserProgress(updatedProgress);
    setCurrentStage(newStage);
  };

  const handleOnboardingChoice = (stage: string) => {
    setCurrentStage(stage as Stage);
    setCurrentView('stages');
    setShowOnboarding(false);
    saveToLocalStorage('toolthinker_onboarding_completed', true);
  };

  const goToLanding = () => {
    setCurrentView('landing');
  };

  const goToStages = () => {
    setCurrentView('stages');
  };

  const skipOnboarding = () => {
    setShowOnboarding(false);
    saveToLocalStorage('toolthinker_onboarding_completed', true);
  };

  const clearAllData = () => {
    if (window.confirm('Are you sure you want to clear all your progress? This cannot be undone.')) {
      localStorage.removeItem('toolthinker_current_stage');
      localStorage.removeItem('toolthinker_user_progress');
      localStorage.removeItem('toolthinker_onboarding_completed');
      localStorage.removeItem('toolthinker_discovery_data');
      localStorage.removeItem('toolthinker_idea_data');
      window.location.reload();
    }
  };

  const handleSuggestTask = (stage: string) => {
    alert(`Here's a key task to complete in the ${stage} stage!`);
  };

  const renderLandingPage = () => (
    <div className="landing-page">
      <div className="landing-hero">
        <div className="logo-container">
          <div className="logo">TT</div>
          <h1>ToolThinker</h1>
        </div>
        <p className="hero-subtitle">Your thinking OS for startup success</p>
        <p className="hero-description">
          Where are you in your startup journey? Choose your starting point:
        </p>
      </div>
      
      <div className="pathways-grid">
        <div className="pathway-card" onClick={() => handleOnboardingChoice('discovery')}>
          <span className="pathway-icon">🔍</span>
          <h3>I need an idea</h3>
          <p>Discover opportunities through problem analysis, skills assessment, and market trends</p>
          <div className="pathway-button">Start Discovery</div>
        </div>
        
        <div className="pathway-card" onClick={() => handleOnboardingChoice('idea')}>
          <span className="pathway-icon">💡</span>
          <h3>I have an idea</h3>
          <p>Define your concept, target personas, and validate core problems</p>
          <div className="pathway-button">Define Idea</div>
        </div>
        
        <div className="pathway-card" onClick={() => handleOnboardingChoice('validation')}>
          <span className="pathway-icon">✅</span>
          <h3>I need validation</h3>
          <p>Test market demand, gather feedback, and validate assumptions</p>
          <div className="pathway-button">Validate Concept</div>
        </div>
        
        <div className="pathway-card" onClick={() => handleOnboardingChoice('mvp')}>
          <span className="pathway-icon">🛠️</span>
          <h3>I'm building MVP</h3>
          <p>Focus on core features and build your minimum viable product</p>
          <div className="pathway-button">Build MVP</div>
        </div>
        
        <div className="pathway-card" onClick={() => handleOnboardingChoice('launch')}>
          <span className="pathway-icon">🚀</span>
          <h3>I'm ready to launch</h3>
          <p>Create go-to-market strategies and reach your target customers</p>
          <div className="pathway-button">Plan Launch</div>
        </div>
      </div>
    </div>
  );

  const renderStageContent = () => {
    switch (currentStage) {
      case 'discovery':
        return <IdeaDiscovery onAdvance={() => handleStageAdvance('idea')} />;
      case 'idea':
        return <IdeaStage onBack={() => setCurrentStage('discovery')} />;
      case 'validation':
        return <IdeaValidation />;
      case 'mvp':
        return <MVPStage />;
      case 'launch':
        return <LaunchStage />;
      default:
        return <IdeaDiscovery onAdvance={() => handleStageAdvance('idea')} />;
    }
  };

  return (
    <div className="app-root">
      {currentView === 'stages' && (
        <>
          <SmartJourneyMap
            currentStage={currentStage}
            userProgress={userProgress}
            onStageSelect={setCurrentStage}
          />
          <WhatsNextButton
            currentStage={currentStage}
            userProgress={userProgress}
            onAdvanceStage={handleStageAdvance}
            onSuggestTask={handleSuggestTask}
          />
        </>
      )}
      <div className="main-content" style={{ marginLeft: currentView === 'stages' ? 220 : 0 }}>
        {/* Stage Navigation */}
        <nav className="stage-navigation">
          <div className="nav-header">
            <button className="logo-button" onClick={goToLanding}>
              <div className="nav-logo">TT</div>
              <span className="nav-title">ToolThinker</span>
            </button>
          </div>
          <div className="nav-stages">
            {stages.map((stage) => (
              <button
                key={stage.id}
                className={`stage-item ${currentStage === stage.id ? 'active' : ''} ${
                  userProgress[stage.id as Stage]?.completed ? 'completed' : ''
                }`}
                onClick={() => setCurrentStage(stage.id as Stage)}
              >
                <span className="stage-icon">{stage.icon}</span>
                <span>{stage.name}</span>
              </button>
            ))}
          </div>
        </nav>

        {/* Main Content */}
        {currentView === 'landing' ? renderLandingPage() : renderStageContent()}
      </div>

      {/* Onboarding Overlay */}
      {showOnboarding && (
        <div className="onboarding-overlay">
          <div className="onboarding-modal">
            <h2>Welcome to ToolThinker</h2>
            <p>Where are you in your startup journey?</p>
            
            <div className="onboarding-paths">
              <div className="path-option" onClick={() => handleOnboardingChoice('discovery')}>
                <span className="path-icon">🔍</span>
                <div className="path-content">
                  <h4>I need an idea</h4>
                  <p className="path-description">Start from scratch</p>
                </div>
              </div>
              
              <div className="path-option" onClick={() => handleOnboardingChoice('idea')}>
                <span className="path-icon">💡</span>
                <div className="path-content">
                  <h4>I have an idea</h4>
                  <p className="path-description">Define and refine it</p>
                </div>
              </div>
              
              <div className="path-option" onClick={() => handleOnboardingChoice('validation')}>
                <span className="path-icon">✅</span>
                <div className="path-content">
                  <h4>I need validation</h4>
                  <p className="path-description">Test market demand</p>
                </div>
              </div>
              
              <div className="path-option" onClick={() => handleOnboardingChoice('mvp')}>
                <span className="path-icon">🛠️</span>
                <div className="path-content">
                  <h4>I'm building MVP</h4>
                  <p className="path-description">Core features ready</p>
                </div>
              </div>
              
              <div className="path-option" onClick={() => handleOnboardingChoice('launch')}>
                <span className="path-icon">🚀</span>
                <div className="path-content">
                  <h4>I'm ready to launch</h4>
                  <p className="path-description">Go-to-market time</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
