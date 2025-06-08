import React, { useState } from 'react';
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
                        <select
                          value={task.status}
                          onChange={(e) => updateTaskStatus(step.id, task.id, e.target.value as any)}
                        >
                          <option value="not_started">Not Started</option>
                          <option value="in_progress">In Progress</option>
                          <option value="completed">Completed</option>
                        </select>
                      </div>
                    </div>
                    <p>{task.description}</p>
                    <textarea
                      placeholder="Add notes..."
                      value={task.notes || ''}
                      onChange={(e) => updateTaskNotes(step.id, task.id, e.target.value)}
                    />
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
      </div>
    </div>
  );
} 