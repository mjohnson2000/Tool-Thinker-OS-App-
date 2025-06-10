import React, { useState, useEffect } from 'react';
import './LaunchStage.css';

interface LaunchSection {
  id: string;
  title: string;
  description: string;
  status: 'not_started' | 'in_progress' | 'completed';
  tasks: LaunchTask[];
}

interface LaunchTask {
  id: string;
  title: string;
  description: string;
  status: 'not_started' | 'in_progress' | 'completed';
  notes?: string;
  autoContent?: string;
  isManual?: boolean;
  manualContent?: string;
}

export function LaunchStage() {
  const [activeSection, setActiveSection] = useState<string>('planning');
  const [sections, setSections] = useState<LaunchSection[]>([
    {
      id: 'planning',
      title: 'Launch Planning',
      description: 'Prepare your launch checklist and timeline',
      status: 'not_started',
      tasks: [
        { id: 'checklist', title: 'Launch Checklist', description: 'Create a detailed launch checklist', status: 'not_started' },
        { id: 'timeline', title: 'Timeline', description: 'Set key launch dates and milestones', status: 'not_started' },
      ],
    },
    {
      id: 'gtm',
      title: 'Go-to-Market Strategy',
      description: 'Define your GTM plan and positioning',
      status: 'not_started',
      tasks: [
        { id: 'positioning', title: 'Positioning', description: 'Craft your product positioning statement', status: 'not_started' },
        { id: 'channels', title: 'Channels', description: 'Select marketing and sales channels', status: 'not_started' },
      ],
    },
    {
      id: 'marketing',
      title: 'Marketing',
      description: 'Plan your marketing campaigns and content',
      status: 'not_started',
      tasks: [
        { id: 'campaigns', title: 'Campaigns', description: 'Plan and schedule marketing campaigns', status: 'not_started' },
        { id: 'content', title: 'Content', description: 'Prepare launch content (blog, social, PR)', status: 'not_started' },
      ],
    },
    {
      id: 'metrics',
      title: 'Post-Launch Metrics',
      description: 'Track and analyze your launch performance',
      status: 'not_started',
      tasks: [
        { id: 'kpis', title: 'KPIs', description: 'Define and track key performance indicators', status: 'not_started' },
        { id: 'feedback', title: 'User Feedback', description: 'Collect and analyze user feedback', status: 'not_started' },
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

  useEffect(() => {
    const synthesizeLaunch = () => {
      const mvpData = localStorage.getItem('toolthinker_mvp_data');
      const parsedMVP = mvpData ? JSON.parse(mvpData) : {};
      setSections(prev => prev.map(section => {
        const updatedTasks = section.tasks.map(task => {
          let autoContent = '';
          switch (task.id) {
            case 'checklist':
              autoContent = `Checklist: ${parsedMVP.launchChecklist || 'Finalize MVP, prepare marketing, set launch date'}`;
              break;
            case 'timeline':
              autoContent = `Timeline: ${parsedMVP.launchTimeline || 'Week 1: Finalize MVP\nWeek 2: Marketing\nWeek 3: Launch'}`;
              break;
            case 'positioning':
              autoContent = `Positioning: ${parsedMVP.positioning || 'The only tool that...'} `;
              break;
            case 'channels':
              autoContent = `Channels: ${parsedMVP.channels || 'Email, social, PR, paid ads'}`;
              break;
            case 'campaigns':
              autoContent = `Campaigns: ${parsedMVP.campaigns || 'Pre-launch, launch, post-launch'}`;
              break;
            case 'content':
              autoContent = `Content: ${parsedMVP.content || 'Blog, social posts, press release'}`;
              break;
            case 'kpis':
              autoContent = `KPIs: ${parsedMVP.kpis || 'Signups, active users, revenue'}`;
              break;
            case 'feedback':
              autoContent = `Feedback: ${parsedMVP.feedback || 'Collect user feedback via surveys, interviews'}`;
              break;
          }
          return { ...task, autoContent };
        });
        return { ...section, tasks: updatedTasks };
      }));
    };
    synthesizeLaunch();
  }, []);

  const allComplete = sections.every(section => section.tasks.every(task => task.status === 'completed'));

  return (
    <div className="launch-stage">
      <div className="launch-header">
        <h1>Launch Strategy</h1>
        <p>Plan, execute, and measure your product launch</p>
      </div>
      <div className="launch-sections">
        {sections.map(section => (
          <div
            key={section.id}
            className={`launch-section ${activeSection === section.id ? 'active' : ''}`}
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
                  <div key={task.id} className="launch-task">
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
      <div className="launch-summary">
        <h2>Launch Progress</h2>
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
        <button className="continue-btn" disabled={!allComplete} onClick={() => {/* finish logic here */}}>
          Finish
        </button>
      </div>
    </div>
  );
} 