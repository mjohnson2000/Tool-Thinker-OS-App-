import React, { useState } from 'react';
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
        { id: 'core-value', title: 'Core Value Proposition', description: 'Describe the main value your MVP delivers', status: 'not_started' },
        { id: 'scope', title: 'Scope', description: 'List the essential features for launch', status: 'not_started' },
        { id: 'success-metrics', title: 'Success Metrics', description: 'Define how you will measure MVP success', status: 'not_started' },
      ],
    },
    {
      id: 'features',
      title: 'Feature Prioritization',
      description: 'Prioritize features for your MVP using MoSCoW or similar methods',
      status: 'not_started',
      tasks: [
        { id: 'must-have', title: 'Must-Have Features', description: 'List features that are absolutely required', status: 'not_started' },
        { id: 'should-have', title: 'Should-Have Features', description: 'List features that are important but not critical', status: 'not_started' },
        { id: 'could-have', title: 'Could-Have Features', description: 'List nice-to-have features for later', status: 'not_started' },
      ],
    },
    {
      id: 'prototyping',
      title: 'Prototyping',
      description: 'Create wireframes or clickable prototypes for your MVP',
      status: 'not_started',
      tasks: [
        { id: 'wireframes', title: 'Wireframes', description: 'Sketch or design wireframes for your MVP', status: 'not_started' },
        { id: 'prototype', title: 'Clickable Prototype', description: 'Build a simple interactive prototype', status: 'not_started' },
      ],
    },
    {
      id: 'testing',
      title: 'User Testing',
      description: 'Test your MVP with real users and gather feedback',
      status: 'not_started',
      tasks: [
        { id: 'test-plan', title: 'Test Plan', description: 'Define your user testing plan', status: 'not_started' },
        { id: 'run-tests', title: 'Run User Tests', description: 'Conduct user tests and collect feedback', status: 'not_started' },
        { id: 'analyze-results', title: 'Analyze Results', description: 'Summarize findings and next steps', status: 'not_started' },
      ],
    },
  ]);

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
                    <textarea
                      placeholder="Add notes..."
                      value={task.notes || ''}
                      onChange={e => updateTaskNotes(section.id, task.id, e.target.value)}
                    />
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