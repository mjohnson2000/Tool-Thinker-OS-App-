import React, { useState, useEffect } from 'react';
import './IdeaValidation.css';

interface ValidationStep {
  id: string;
  title: string;
  description: string;
  status: 'not_started' | 'in_progress' | 'completed';
  tasks: ValidationTask[];
}

interface ValidationTask {
  id: string;
  title: string;
  description: string;
  status: 'not_started' | 'in_progress' | 'completed';
  notes?: string;
  autoContent?: string;
  isManual?: boolean;
  manualContent?: string;
}

export function IdeaValidation() {
  const [activeStep, setActiveStep] = useState<string>('market');
  const [validationSteps, setValidationSteps] = useState<ValidationStep[]>([
    {
      id: 'market',
      title: 'Market Validation',
      description: 'Research and validate your target market size and potential',
      status: 'not_started',
      tasks: [
        {
          id: 'market-size',
          title: 'Market Size Analysis',
          description: 'Calculate TAM, SAM, and SOM for your target market',
          status: 'not_started',
        },
        {
          id: 'market-trends',
          title: 'Market Trends',
          description: 'Research current and future market trends',
          status: 'not_started',
        },
        {
          id: 'market-segments',
          title: 'Market Segments',
          description: 'Identify and analyze key market segments',
          status: 'not_started',
        },
      ],
    },
    {
      id: 'users',
      title: 'User Interviews',
      description: 'Conduct interviews with potential users to validate your solution',
      status: 'not_started',
      tasks: [
        {
          id: 'interview-prep',
          title: 'Interview Preparation',
          description: 'Prepare interview questions and identify participants',
          status: 'not_started',
        },
        {
          id: 'conduct-interviews',
          title: 'Conduct Interviews',
          description: 'Interview at least 5 potential users',
          status: 'not_started',
        },
        {
          id: 'analyze-feedback',
          title: 'Analyze Feedback',
          description: 'Compile and analyze user feedback',
          status: 'not_started',
        },
      ],
    },
    {
      id: 'competitors',
      title: 'Competitor Analysis',
      description: 'Research and analyze your competitors',
      status: 'not_started',
      tasks: [
        {
          id: 'direct-competitors',
          title: 'Direct Competitors',
          description: 'Identify and analyze direct competitors',
          status: 'not_started',
        },
        {
          id: 'indirect-competitors',
          title: 'Indirect Competitors',
          description: 'Identify and analyze indirect competitors',
          status: 'not_started',
        },
        {
          id: 'competitive-advantage',
          title: 'Competitive Advantage',
          description: 'Define your unique value proposition',
          status: 'not_started',
        },
      ],
    },
  ]);

  const updateTaskStatus = (stepId: string, taskId: string, newStatus: 'not_started' | 'in_progress' | 'completed') => {
    setValidationSteps(steps => 
      steps.map(step => {
        if (step.id === stepId) {
          const updatedTasks = step.tasks.map(task => 
            task.id === taskId ? { ...task, status: newStatus } : task
          );
          const allCompleted = updatedTasks.every(task => task.status === 'completed');
          const anyInProgress = updatedTasks.some(task => task.status === 'in_progress');
          return {
            ...step,
            tasks: updatedTasks,
            status: allCompleted ? 'completed' : anyInProgress ? 'in_progress' : 'not_started'
          };
        }
        return step;
      })
    );
  };

  const updateTaskNotes = (stepId: string, taskId: string, notes: string) => {
    setValidationSteps(steps =>
      steps.map(step => {
        if (step.id === stepId) {
          return {
            ...step,
            tasks: step.tasks.map(task =>
              task.id === taskId ? { ...task, notes } : task
            )
          };
        }
        return step;
      })
    );
  };

  useEffect(() => {
    const synthesizeValidation = () => {
      const ideaData = localStorage.getItem('toolthinker_idea_data');
      const parsedIdea = ideaData ? JSON.parse(ideaData) : {};
      setValidationSteps(prev => prev.map(step => {
        if (step.id === 'market' || step.id === 'competitors') {
          const updatedTasks = step.tasks.map(task => {
            let autoContent = '';
            if (step.id === 'market') {
              switch (task.id) {
                case 'market-size':
                  autoContent = `TAM: $${parsedIdea.marketTAM || '...'}\nSAM: $${parsedIdea.marketSAM || '...'}\nSOM: $${parsedIdea.marketSOM || '...'}\n(Use research and public data to estimate)`;
                  break;
                case 'market-trends':
                  autoContent = `Key trends: ${parsedIdea.marketTrends || 'AI, automation, remote work, etc.'}`;
                  break;
                case 'market-segments':
                  autoContent = `Segments: ${parsedIdea.marketSegments || 'SMBs, Enterprises, Freelancers, etc.'}`;
                  break;
              }
            } else if (step.id === 'competitors') {
              switch (task.id) {
                case 'direct-competitors':
                  autoContent = `Direct competitors: ${parsedIdea.directCompetitors || 'Company A, Company B'}`;
                  break;
                case 'indirect-competitors':
                  autoContent = `Indirect competitors: ${parsedIdea.indirectCompetitors || 'Manual processes, spreadsheets'}`;
                  break;
                case 'competitive-advantage':
                  autoContent = `Unique value: ${parsedIdea.uniqueValue || 'Faster, cheaper, more user-friendly'}`;
                  break;
              }
            }
            return { ...task, autoContent };
          });
          return { ...step, tasks: updatedTasks };
        }
        return step;
      }));
    };
    synthesizeValidation();
  }, []);

  const allComplete = validationSteps.every(step => step.tasks.every(task => task.status === 'completed'));

  return (
    <div className="idea-validation">
      <div className="validation-header">
        <h1>Idea Validation</h1>
        <p>Validate your idea through market research, user interviews, and competitor analysis</p>
      </div>

      <div className="validation-steps">
        {validationSteps.map(step => (
          <div 
            key={step.id}
            className={`validation-step ${activeStep === step.id ? 'active' : ''}`}
            onClick={() => setActiveStep(step.id)}
          >
            <div className="step-header">
              <h2>{step.title}</h2>
              <span className={`status-badge ${step.status}`}>
                {step.status.replace('_', ' ')}
              </span>
            </div>
            <p>{step.description}</p>
            
            {activeStep === step.id && (
              <div className="step-tasks">
                {step.tasks.map(task => (
                  <div key={task.id} className="validation-task">
                    <div className="task-header">
                      <h3>{task.title}</h3>
                      <div className="task-actions">
                        {step.id !== 'users' && (
                          <button
                            className={`mode-toggle ${task.isManual ? 'manual' : 'auto'}`}
                            onClick={e => {
                              e.stopPropagation();
                              setValidationSteps(steps =>
                                steps.map(stepItem => {
                                  if (stepItem.id === step.id) {
                                    return {
                                      ...stepItem,
                                      tasks: stepItem.tasks.map(t =>
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
                                  return stepItem;
                                })
                              );
                            }}
                          >
                            {task.isManual ? '🔄 Auto' : '✏️ Manual'}
                          </button>
                        )}
                        <select
                          value={task.status}
                          onChange={e => updateTaskStatus(step.id, task.id, e.target.value as any)}
                        >
                          <option value="not_started">Not Started</option>
                          <option value="in_progress">In Progress</option>
                          <option value="completed">Completed</option>
                        </select>
                      </div>
                    </div>
                    <p>{task.description}</p>
                    <div className="task-content">
                      {step.id !== 'users' && !task.isManual ? (
                        <div className="auto-content">
                          <div className="auto-badge">Auto-synthesized</div>
                          <div className="content">{task.autoContent}</div>
                        </div>
                      ) : (
                        <textarea
                          placeholder="Add your notes or modifications..."
                          value={task.isManual ? task.manualContent || '' : task.notes || ''}
                          onChange={e => {
                            const value = e.target.value;
                            setValidationSteps(steps =>
                              steps.map(stepItem => {
                                if (stepItem.id === step.id) {
                                  return {
                                    ...stepItem,
                                    tasks: stepItem.tasks.map(t =>
                                      t.id === task.id
                                        ? step.id !== 'users' && task.isManual
                                          ? { ...t, manualContent: value }
                                          : { ...t, notes: value }
                                        : t
                                    ),
                                  };
                                }
                                return stepItem;
                              })
                            );
                          }}
                        />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="validation-summary">
        <h2>Validation Progress</h2>
        <div className="progress-stats">
          {validationSteps.map(step => (
            <div key={step.id} className="progress-stat">
              <h3>{step.title}</h3>
              <div className="progress-bar">
                <div 
                  className="progress-fill"
                  style={{
                    width: `${(step.tasks.filter(t => t.status === 'completed').length / step.tasks.length) * 100}%`
                  }}
                />
              </div>
              <p>{step.tasks.filter(t => t.status === 'completed').length} of {step.tasks.length} tasks completed</p>
            </div>
          ))}
        </div>
        <button className="continue-btn" disabled={!allComplete} onClick={() => {/* advance to MVP logic here */}}>
          Continue to MVP
        </button>
      </div>
    </div>
  );
} 