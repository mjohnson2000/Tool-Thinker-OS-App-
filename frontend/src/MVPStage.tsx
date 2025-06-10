import React, { useState, useEffect } from 'react';
import './MVPStage.css';

interface MVPSection {
  id: string;
  title: string;
  description: string;
  status: 'not_started' | 'in_progress' | 'completed';
  tasks: MVPTask[];
}

interface MVPTask {
  id: string;
  title: string;
  description: string;
  status: 'not_started' | 'in_progress' | 'completed';
  notes?: string;
  autoContent?: string;
  isManual?: boolean;
  manualContent?: string;
}

export function MVPStage() {
  const [activeSection, setActiveSection] = useState<string>('definition');
  const [sections, setSections] = useState<MVPSection[]>([
    {
      id: 'definition',
      title: 'MVP Definition',
      description: 'Define the core value and scope of your MVP',
      status: 'not_started',
      tasks: [
        { 
          id: 'core-value', 
          title: 'Core Value Proposition', 
          description: 'Describe the main value your MVP delivers', 
          status: 'not_started',
          autoContent: 'Loading synthesis...'
        },
        { 
          id: 'scope', 
          title: 'Scope', 
          description: 'List the essential features for launch', 
          status: 'not_started',
          autoContent: 'Loading synthesis...'
        },
        { 
          id: 'success-metrics', 
          title: 'Success Metrics', 
          description: 'Define how you will measure MVP success', 
          status: 'not_started',
          autoContent: 'Loading synthesis...'
        },
      ],
    },
    {
      id: 'features',
      title: 'Feature Prioritization',
      description: 'Prioritize features for your MVP using MoSCoW or similar methods',
      status: 'not_started',
      tasks: [
        { 
          id: 'must-have', 
          title: 'Must-Have Features', 
          description: 'List features that are absolutely required', 
          status: 'not_started',
          autoContent: 'Loading synthesis...'
        },
        { 
          id: 'should-have', 
          title: 'Should-Have Features', 
          description: 'List features that are important but not critical', 
          status: 'not_started',
          autoContent: 'Loading synthesis...'
        },
        { 
          id: 'could-have', 
          title: 'Could-Have Features', 
          description: 'List nice-to-have features for later', 
          status: 'not_started',
          autoContent: 'Loading synthesis...'
        },
      ],
    },
    {
      id: 'prototyping',
      title: 'Prototyping',
      description: 'Create wireframes or clickable prototypes for your MVP',
      status: 'not_started',
      tasks: [
        { 
          id: 'wireframes', 
          title: 'Wireframes', 
          description: 'Sketch or design wireframes for your MVP', 
          status: 'not_started',
          autoContent: 'Loading synthesis...'
        },
        { 
          id: 'prototype', 
          title: 'Clickable Prototype', 
          description: 'Build a simple interactive prototype', 
          status: 'not_started',
          autoContent: 'Loading synthesis...'
        },
      ],
    },
    {
      id: 'testing',
      title: 'User Testing',
      description: 'Test your MVP with real users and gather feedback',
      status: 'not_started',
      tasks: [
        { 
          id: 'test-plan', 
          title: 'Test Plan', 
          description: 'Define your user testing plan', 
          status: 'not_started',
          autoContent: 'Loading synthesis...'
        },
        { 
          id: 'run-tests', 
          title: 'Run User Tests', 
          description: 'Conduct user tests and collect feedback', 
          status: 'not_started',
          autoContent: 'Loading synthesis...'
        },
        { 
          id: 'analyze-results', 
          title: 'Analyze Results', 
          description: 'Summarize findings and next steps', 
          status: 'not_started',
          autoContent: 'Loading synthesis...'
        },
      ],
    },
  ]);

  // Auto-synthesis effect for all sections
  useEffect(() => {
    const synthesizeAllSections = async () => {
      try {
        // Get data from previous stages
        const discoveryData = localStorage.getItem('toolthinker_discovery_data');
        const ideaData = localStorage.getItem('toolthinker_idea_data');
        const validationData = localStorage.getItem('toolthinker_validation_data');

        if (discoveryData && ideaData && validationData) {
          const parsedDiscovery = JSON.parse(discoveryData);
          const parsedIdea = JSON.parse(ideaData);
          const parsedValidation = JSON.parse(validationData);

          setSections(prev => prev.map(section => {
            const updatedTasks = section.tasks.map(task => {
              let autoContent = '';
              switch (section.id) {
                case 'definition':
                  switch (task.id) {
                    case 'core-value':
                      autoContent = synthesizeCoreValue(parsedIdea, parsedValidation);
                      break;
                    case 'scope':
                      autoContent = synthesizeScope(parsedIdea, parsedValidation);
                      break;
                    case 'success-metrics':
                      autoContent = synthesizeSuccessMetrics(parsedDiscovery, parsedValidation);
                      break;
                  }
                  break;
                case 'features':
                  switch (task.id) {
                    case 'must-have':
                      autoContent = synthesizeMustHaveFeatures(parsedIdea, parsedValidation);
                      break;
                    case 'should-have':
                      autoContent = synthesizeShouldHaveFeatures(parsedIdea, parsedValidation);
                      break;
                    case 'could-have':
                      autoContent = synthesizeCouldHaveFeatures(parsedIdea, parsedValidation);
                      break;
                  }
                  break;
                case 'prototyping':
                  switch (task.id) {
                    case 'wireframes':
                      autoContent = synthesizeWireframes(parsedIdea, parsedValidation);
                      break;
                    case 'prototype':
                      autoContent = synthesizePrototype(parsedIdea, parsedValidation);
                      break;
                  }
                  break;
                case 'testing':
                  switch (task.id) {
                    case 'test-plan':
                      autoContent = synthesizeTestPlan(parsedIdea, parsedValidation);
                      break;
                    case 'run-tests':
                      autoContent = synthesizeRunTests(parsedIdea, parsedValidation);
                      break;
                    case 'analyze-results':
                      autoContent = synthesizeAnalyzeResults(parsedIdea, parsedValidation);
                      break;
                  }
                  break;
              }
              return { ...task, autoContent };
            });
            return { ...section, tasks: updatedTasks };
          }));
        }
      } catch (error) {
        console.error('Error synthesizing sections:', error);
      }
    };

    synthesizeAllSections();
  }, []);

  // Synthesis functions for MVP Definition
  const synthesizeCoreValue = (ideaData: any, validationData: any): string => {
    const jobDescription = ideaData?.jtbd?.jobDescription || '';
    const uniqueValue = validationData?.uniqueValue || '';
    const targetCustomer = validationData?.targetCustomer || '';

    return `Our MVP delivers ${jobDescription} for ${targetCustomer} by ${uniqueValue}. This core value proposition focuses on solving the most critical customer needs while maintaining simplicity and speed to market.`;
  };

  const synthesizeScope = (ideaData: any, validationData: any): string => {
    const mustHaveFeatures = validationData?.mustHaveFeatures || [];
    const shouldHaveFeatures = validationData?.shouldHaveFeatures || [];

    return `Essential MVP Features:
1. ${mustHaveFeatures[0] || 'Core functionality based on primary job-to-be-done'}
2. ${mustHaveFeatures[1] || 'Basic user interface and experience'}
3. ${mustHaveFeatures[2] || 'Key integration points'}

Nice-to-Have Features (Post-MVP):
1. ${shouldHaveFeatures[0] || 'Enhanced user experience features'}
2. ${shouldHaveFeatures[1] || 'Additional integrations'}
3. ${shouldHaveFeatures[2] || 'Advanced analytics'}`;
  };

  const synthesizeSuccessMetrics = (discoveryData: any, validationData: any): string => {
    return `Key Success Metrics:
1. User Engagement: Track active users and session duration
2. Problem-Solution Fit: Measure user satisfaction and retention
3. Market Validation: Monitor conversion rates and user feedback
4. Technical Performance: Track system stability and response times

Target Metrics:
- User Acquisition: 100+ active users in first month
- Retention: 40%+ weekly active user retention
- Satisfaction: 4.0+ average user rating
- Technical: 99%+ uptime, <2s response time`;
  };

  // Synthesis functions for Feature Prioritization
  const synthesizeMustHaveFeatures = (ideaData: any, validationData: any): string => {
    const jobDescription = ideaData?.jtbd?.jobDescription || '';
    const frustrations = ideaData?.jtbd?.frustrations || [];
    
    return `Must-Have Features (Critical for MVP Success):
1. Core functionality that directly addresses: "${jobDescription}"
2. Solution to primary frustration: "${frustrations[0] || 'Main user pain point'}"
3. Basic user authentication and data security
4. Essential user interface for core tasks
5. Basic error handling and recovery`;
  };

  const synthesizeShouldHaveFeatures = (ideaData: any, validationData: any): string => {
    const frustrations = ideaData?.jtbd?.frustrations || [];
    
    return `Should-Have Features (Important but Not Critical):
1. Solution to secondary frustration: "${frustrations[1] || 'Secondary user pain point'}"
2. Enhanced user experience features
3. Basic analytics and reporting
4. User onboarding and help documentation
5. Basic customization options`;
  };

  const synthesizeCouldHaveFeatures = (ideaData: any, validationData: any): string => {
    return `Could-Have Features (Future Enhancements):
1. Advanced analytics and insights
2. Integration with third-party services
3. Advanced customization and personalization
4. Mobile app version
5. Advanced security features`;
  };

  // Synthesis functions for Prototyping
  const synthesizeWireframes = (ideaData: any, validationData: any): string => {
    const jobDescription = ideaData?.jtbd?.jobDescription || '';
    
    return `Wireframe Requirements:
1. Main user flow for: "${jobDescription}"
2. Core screens:
   - Landing/Home page
   - Main functionality screens
   - User profile/settings
   - Error states
3. Key interactions and transitions
4. Basic responsive design considerations`;
  };

  const synthesizePrototype = (ideaData: any, validationData: any): string => {
    return `Clickable Prototype Requirements:
1. Interactive version of wireframes
2. Key user flows:
   - User onboarding
   - Core functionality
   - Error handling
3. Basic animations and transitions
4. Mobile-responsive design
5. User feedback collection points`;
  };

  // Synthesis functions for User Testing
  const synthesizeTestPlan = (ideaData: any, validationData: any): string => {
    const targetCustomer = validationData?.targetCustomer || '';
    
    return `User Testing Plan:
1. Target Users: ${targetCustomer}
2. Test Scenarios:
   - First-time user experience
   - Core functionality usage
   - Error handling
3. Success Criteria:
   - Task completion rate
   - Time to complete tasks
   - User satisfaction
4. Feedback Collection:
   - Post-task interviews
   - Usability metrics
   - User satisfaction surveys`;
  };

  const synthesizeRunTests = (ideaData: any, validationData: any): string => {
    return `User Testing Execution:
1. Recruit 5-7 target users
2. Conduct 30-45 minute sessions
3. Record sessions (with permission)
4. Observe:
   - Task completion
   - Pain points
   - User reactions
   - Time on task
5. Collect feedback through:
   - Post-task interviews
   - Satisfaction surveys
   - Open-ended questions`;
  };

  const synthesizeAnalyzeResults = (ideaData: any, validationData: any): string => {
    return `Test Results Analysis:
1. Quantitative Metrics:
   - Task completion rates
   - Time on task
   - Error rates
   - User satisfaction scores

2. Qualitative Insights:
   - User pain points
   - Feature requests
   - Usability issues
   - Positive feedback

3. Action Items:
   - Critical fixes
   - UX improvements
   - Feature prioritization
   - Next iteration planning`;
  };

  const updateTaskStatus = (sectionId: string, taskId: string, newStatus: 'not_started' | 'in_progress' | 'completed') => {
    setSections(sections =>
      sections.map(section => {
        if (section.id === sectionId) {
          const updatedTasks = section.tasks.map(task =>
            task.id === taskId ? { ...task, status: newStatus } : task
          );
          const allCompleted = updatedTasks.every(task => task.status === 'completed');
          const anyInProgress = updatedTasks.some(task => task.status === 'in_progress');
          return {
            ...section,
            tasks: updatedTasks,
            status: allCompleted ? 'completed' : anyInProgress ? 'in_progress' : 'not_started',
          };
        }
        return section;
      })
    );
  };

  const updateTaskNotes = (sectionId: string, taskId: string, notes: string) => {
    setSections(sections =>
      sections.map(section => {
        if (section.id === sectionId) {
          return {
            ...section,
            tasks: section.tasks.map(task =>
              task.id === taskId ? { ...task, notes } : task
            ),
          };
        }
        return section;
      })
    );
  };

  return (
    <div className="mvp-stage">
      <div className="mvp-header">
        <h1>MVP Development</h1>
        <p>Define, prototype, and test your Minimum Viable Product</p>
      </div>
      <div className="mvp-sections">
        {sections.map(section => (
          <div
            key={section.id}
            className={`mvp-section ${activeSection === section.id ? 'active' : ''}`}
            onClick={() => setActiveSection(section.id)}
          >
            <div className="section-header">
              <h2>{section.title}</h2>
              <span className={`status-badge ${section.status}`}>{section.status.replace('_', ' ')}</span>
            </div>
            <p>{section.description}</p>
            {activeSection === section.id && (
              <div className="section-tasks">
                {section.tasks.map(task => (
                  <div key={task.id} className="mvp-task">
                    <div className="task-header">
                      <h3>{task.title}</h3>
                      <div className="task-actions">
                        <button
                          className={`mode-toggle ${task.isManual ? 'manual' : 'auto'}`}
                          onClick={e => {
                            e.stopPropagation();
                            setSections(sections =>
                              sections.map(sectionItem => {
                                if (sectionItem.id === section.id) {
                                  return {
                                    ...sectionItem,
                                    tasks: sectionItem.tasks.map(t =>
                                      t.id === task.id
                                        ? {
                                            ...t,
                                            isManual: !t.isManual,
                                            manualContent: !t.isManual ? t.notes || '' : t.manualContent
                                          }
                                        : t
                                    ),
                                  };
                                }
                                return sectionItem;
                              })
                            );
                          }}
                        >
                          {task.isManual ? '🔄 Auto' : '✏️ Manual'}
                        </button>
                        <select
                          value={task.status}
                          onChange={e => updateTaskStatus(section.id, task.id, e.target.value as any)}
                        >
                          <option value="not_started">Not Started</option>
                          <option value="in_progress">In Progress</option>
                          <option value="completed">Completed</option>
                        </select>
                      </div>
                    </div>
                    <p>{task.description}</p>
                    <div className="task-content">
                      {task.isManual ? (
                        <textarea
                          placeholder="Add your notes or modifications..."
                          value={task.manualContent || ''}
                          onChange={e => {
                            const value = e.target.value;
                            setSections(sections =>
                              sections.map(sectionItem => {
                                if (sectionItem.id === section.id) {
                                  return {
                                    ...sectionItem,
                                    tasks: sectionItem.tasks.map(t =>
                                      t.id === task.id ? { ...t, manualContent: value } : t
                                    ),
                                  };
                                }
                                return sectionItem;
                              })
                            );
                          }}
                        />
                      ) : (
                        <div className="auto-content">
                          <div className="auto-badge">Auto-synthesized</div>
                          <div className="content">{task.autoContent}</div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
      <div className="mvp-summary">
        <h2>MVP Progress</h2>
        <div className="progress-stats">
          {sections.map(section => (
            <div key={section.id} className="progress-stat">
              <h3>{section.title}</h3>
              <div className="progress-bar">
                <div
                  className="progress-fill"
                  style={{
                    width: `${(section.tasks.filter(t => t.status === 'completed').length / section.tasks.length) * 100}%`,
                  }}
                />
              </div>
              <p>
                {section.tasks.filter(t => t.status === 'completed').length} of {section.tasks.length} tasks completed
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 