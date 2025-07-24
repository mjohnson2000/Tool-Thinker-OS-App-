import React from 'react';
import logo from '../../../assets/logo.png';

export interface ProfessionalBusinessPlanModalProps {
  isOpen: boolean;
  onClose: () => void;
  businessPlanData: any;
}

export function ProfessionalBusinessPlanModal({
  isOpen,
  onClose,
  businessPlanData,
}: ProfessionalBusinessPlanModalProps) {
  if (!isOpen) return null;

  // Debug: Log the actual data being received
  console.log('Professional Business Plan Data:', businessPlanData);

  const getValue = (obj: any, path: string, defaultValue: string = '') => {
    try {
      return path.split('.').reduce((current, key) => current?.[key], obj) || defaultValue;
    } catch {
      return defaultValue;
    }
  };

  const getDisplayValue = (obj: any, path: string, defaultValue: string = '') => {
    const result = getValue(obj, path, defaultValue);
    if (typeof result === 'object' && result !== null) {
      return JSON.stringify(result, null, 2);
    }
    return result;
  };

  const formatCurrency = (amount: number) => {
    if (!amount || isNaN(amount)) return '$0';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatPercentage = (value: number) => {
    if (!value || isNaN(value)) return '0%';
    return `${value}%`;
  };

  const renderSection = (title: string, children: React.ReactNode) => (
    <div style={{ marginBottom: '2rem' }}>
      <h2 style={{ 
        color: '#1f2937', 
        fontSize: '24px', 
        fontWeight: 'bold', 
        marginBottom: '1rem',
        borderBottom: '2px solid #059669',
        paddingBottom: '0.5rem'
      }}>
        {title}
      </h2>
      <div style={{
        background: '#f8fafc',
        padding: '1.5rem',
        borderRadius: '8px',
        border: '1px solid #e2e8f0',
      }}>
        {children}
      </div>
    </div>
  );

  const renderSubsection = (title: string, content: string, isOptional: boolean = false) => {
    // Don't render if content is empty or just default text
    if (!content || content === '') return null;
    
    return (
      <div style={{ marginBottom: '1rem' }}>
        <h3 style={{ 
          color: '#059669', 
          fontSize: '18px', 
          fontWeight: 'bold', 
          marginBottom: '0.5rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}>
          {title}
          {isOptional && (
            <span style={{ 
              fontSize: '12px', 
              color: '#6b7280', 
              fontWeight: 'normal',
              fontStyle: 'italic'
            }}>
              (optional)
            </span>
          )}
        </h3>
        <p style={{ fontSize: '16px', lineHeight: '1.6', color: '#374151', margin: 0 }}>
          {content}
        </p>
      </div>
    );
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
    }}>
      <div style={{
        background: '#fff',
        borderRadius: '12px',
        padding: '2rem',
        maxWidth: '95vw',
        maxHeight: '95vh',
        overflow: 'auto',
        width: '1200px',
      }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '2rem',
          borderBottom: '2px solid #e5e7eb',
          paddingBottom: '1rem',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <h1 style={{ margin: 0, color: '#1f2937', fontSize: '28px', fontWeight: 'bold' }}>
              Professional Business Plan
            </h1>
            <img src={logo} alt="ToolThinker Logo" style={{ height: '80px' }} />
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '24px',
              cursor: 'pointer',
              color: '#6b7280',
            }}
          >
            ×
          </button>
        </div>

        {/* 1.0 Executive Summary */}
        {renderSection('1.0 Executive Summary', (
          <>
            {renderSubsection('1.1 Company Profile Summary', 
              getDisplayValue(businessPlanData, 'executiveSummary.companyProfile', ''))}
            {renderSubsection('1.2 Market Research Summary', 
              getDisplayValue(businessPlanData, 'executiveSummary.marketResearch', ''))}
            {renderSubsection('1.3 Marketing Summary', 
              getDisplayValue(businessPlanData, 'executiveSummary.marketing', ''))}
            {renderSubsection('1.4 Finance Summary', 
              getDisplayValue(businessPlanData, 'executiveSummary.finance', ''))}
          </>
        ))}

        {/* 2.0 Company Profile */}
        {renderSection('2.0 Company Profile', (
          <>
            {renderSubsection('2.1.1 Business Description', 
              getDisplayValue(businessPlanData, 'companyDescription.businessDescription', ''))}
            {renderSubsection('2.1.2 Compelling Value', 
              getDisplayValue(businessPlanData, 'companyDescription.compellingValue', ''))}
            {renderSubsection('2.1.3 Product/Service Description', 
              getDisplayValue(businessPlanData, 'companyDescription.productService', ''))}
            {renderSubsection('2.2 Company History', 
              getDisplayValue(businessPlanData, 'companyDescription.history', ''))}
            {renderSubsection('2.3 Management', 
              getDisplayValue(businessPlanData, 'companyDescription.management', ''))}
            {renderSubsection('2.4 Location', 
              getDisplayValue(businessPlanData, 'companyDescription.location', ''))}
            {renderSubsection('2.5 Legal Structure', 
              getDisplayValue(businessPlanData, 'companyDescription.legalStructure', ''))}
            {renderSubsection('2.6 Vision & Mission', 
              getDisplayValue(businessPlanData, 'companyDescription.visionMission', ''), true)}
            {renderSubsection('2.7 Professional Advisors', 
              getDisplayValue(businessPlanData, 'companyDescription.professionalAdvisors', ''), true)}
            {renderSubsection('2.8 Goals & Objectives', 
              getDisplayValue(businessPlanData, 'companyDescription.goalsObjectives', ''), true)}
          </>
        ))}

        {/* 3.0 Market Research */}
        {renderSection('3.0 Market Research', (
          <>
            {renderSubsection('3.1 Industry Profile & Outlook', 
              getDisplayValue(businessPlanData, 'marketResearch.industryProfile', ''))}
            {renderSubsection('3.2 Local Market', 
              getDisplayValue(businessPlanData, 'marketResearch.localMarket', ''))}
            {renderSubsection('3.3 Key Competitors/SWOT Analysis', 
              getDisplayValue(businessPlanData, 'marketResearch.competitors', ''))}
            {renderSubsection('3.4 Target Market', 
              getDisplayValue(businessPlanData, 'marketResearch.targetMarket', ''))}
            {renderSubsection('3.5 Keys to Success', 
              getDisplayValue(businessPlanData, 'marketResearch.keysToSuccess', ''))}
            {renderSubsection('3.6 Customer Survey Summary', 
              getDisplayValue(businessPlanData, 'marketResearch.customerSurvey', ''), true)}
          </>
        ))}

        {/* 4.0 Sales & Marketing */}
        {renderSection('4.0 Sales & Marketing', (
          <>
            {renderSubsection('4.1 Pricing Strategy', 
              getDisplayValue(businessPlanData, 'salesMarketing.pricingStrategy', ''))}
            {renderSubsection('4.2.1 Marketing Strategy', 
              getDisplayValue(businessPlanData, 'salesMarketing.marketingStrategy', ''))}
            {renderSubsection('4.2.2 Marketing Activities', 
              getDisplayValue(businessPlanData, 'salesMarketing.marketingActivities', ''))}
            {renderSubsection('4.2.3 Marketing Objectives', 
              getDisplayValue(businessPlanData, 'salesMarketing.marketingObjectives', ''), true)}
            {renderSubsection('4.3 Positioning Statement', 
              getDisplayValue(businessPlanData, 'salesMarketing.positioningStatement', ''), true)}
            {renderSubsection('4.4 The Sales Process', 
              getDisplayValue(businessPlanData, 'salesMarketing.salesProcess', ''), true)}
            {renderSubsection('4.5 Strategic Alliances', 
              getDisplayValue(businessPlanData, 'salesMarketing.strategicAlliances', ''), true)}
          </>
        ))}

        {/* 5.0 Operations */}
        {renderSection('5.0 Operations', (
          <>
            {renderSubsection('5.1.1 Physical Location', 
              getDisplayValue(businessPlanData, 'operations.physicalLocation', ''))}
            {renderSubsection('5.1.2 Virtual Location', 
              getDisplayValue(businessPlanData, 'operations.virtualLocation', ''), true)}
            {renderSubsection('5.2 Legal Issues', 
              getDisplayValue(businessPlanData, 'operations.legalIssues', ''))}
            {renderSubsection('5.3 Insurance Issues', 
              getDisplayValue(businessPlanData, 'operations.insuranceIssues', ''))}
            {renderSubsection('5.4 Human Resources', 
              getDisplayValue(businessPlanData, 'operations.humanResources', ''))}
            {renderSubsection('5.5 Process/Production', 
              getDisplayValue(businessPlanData, 'operations.processProduction', ''))}
            {renderSubsection('5.6 Risk Assessment', 
              getDisplayValue(businessPlanData, 'operations.riskAssessment', ''))}
          </>
        ))}

        {/* 6.0 Financials */}
        {renderSection('6.0 Financials', (
          <>
            {renderSubsection('6.1.1 Past Purchases', 
              getDisplayValue(businessPlanData, 'financials.pastPurchases', ''))}
            {renderSubsection('6.1.2 Start-up Costs Sheet', 
              getDisplayValue(businessPlanData, 'financials.startupCosts', ''))}
            {renderSubsection('6.1.3 Break Even Analysis', 
              getDisplayValue(businessPlanData, 'financials.breakEvenAnalysis', ''), true)}
            {renderSubsection('6.2.1 Sales Forecast Assumptions', 
              getDisplayValue(businessPlanData, 'financials.salesForecastAssumptions', ''))}
            {renderSubsection('6.2.2 Year One Sales Forecast', 
              getDisplayValue(businessPlanData, 'financials.yearOneSalesForecast', ''))}
            {renderSubsection('6.2.3 Year Two Sales Forecast', 
              getDisplayValue(businessPlanData, 'financials.yearTwoSalesForecast', ''))}
            {renderSubsection('6.3 Cash Flow', 
              getDisplayValue(businessPlanData, 'financials.cashFlow', ''))}
            {renderSubsection('6.4 Income Statement', 
              getDisplayValue(businessPlanData, 'financials.incomeStatement', ''))}
          </>
        ))}

        {/* Financial Projections Summary */}
        <div style={{ marginBottom: '2rem' }}>
          <h2 style={{ color: '#1f2937', fontSize: '24px', fontWeight: 'bold', marginBottom: '1rem' }}>
            Financial Projections Summary
          </h2>
          <div style={{
            background: '#f8fafc',
            padding: '1.5rem',
            borderRadius: '8px',
            border: '1px solid #e2e8f0',
          }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
              <div style={{ background: '#f0fdf4', padding: '1rem', borderRadius: '6px', textAlign: 'center' }}>
                <div style={{ fontSize: '14px', color: '#059669', fontWeight: 'bold' }}>Year 1 Revenue</div>
                <div style={{ fontSize: '18px', color: '#166534', fontWeight: 'bold' }}>
                  {formatCurrency(getValue(businessPlanData, 'financialProjections.year1', '0'))}
                </div>
              </div>
              <div style={{ background: '#f0fdf4', padding: '1rem', borderRadius: '6px', textAlign: 'center' }}>
                <div style={{ fontSize: '14px', color: '#059669', fontWeight: 'bold' }}>Year 2 Revenue</div>
                <div style={{ fontSize: '18px', color: '#166534', fontWeight: 'bold' }}>
                  {formatCurrency(getValue(businessPlanData, 'financialProjections.year2', '0'))}
                </div>
              </div>
              <div style={{ background: '#f0fdf4', padding: '1rem', borderRadius: '6px', textAlign: 'center' }}>
                <div style={{ fontSize: '14px', color: '#059669', fontWeight: 'bold' }}>Year 3 Revenue</div>
                <div style={{ fontSize: '18px', color: '#166534', fontWeight: 'bold' }}>
                  {formatCurrency(getValue(businessPlanData, 'financialProjections.year3', '0'))}
                </div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
              <div style={{ background: '#fef3c7', padding: '1rem', borderRadius: '6px', textAlign: 'center' }}>
                <div style={{ fontSize: '14px', color: '#d97706', fontWeight: 'bold' }}>Break-even Point</div>
                <div style={{ fontSize: '16px', color: '#92400e', fontWeight: 'bold' }}>
                  {getDisplayValue(businessPlanData, 'financialProjections.breakEvenPoint', 'Year 2')}
                </div>
              </div>
              <div style={{ background: '#fef3c7', padding: '1rem', borderRadius: '6px', textAlign: 'center' }}>
                <div style={{ fontSize: '14px', color: '#d97706', fontWeight: 'bold' }}>Profit Margin</div>
                <div style={{ fontSize: '16px', color: '#92400e', fontWeight: 'bold' }}>
                  {formatPercentage(getValue(businessPlanData, 'financialProjections.profitMargin', '0'))}
                </div>
              </div>
              <div style={{ background: '#fef3c7', padding: '1rem', borderRadius: '6px', textAlign: 'center' }}>
                <div style={{ fontSize: '14px', color: '#d97706', fontWeight: 'bold' }}>Start-up Costs</div>
                <div style={{ fontSize: '16px', color: '#92400e', fontWeight: 'bold' }}>
                  {formatCurrency(getValue(businessPlanData, 'financialProjections.startupCosts', '0'))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 7.0 Appendix */}
        {renderSection('7.0 Appendix', (
          <>
            {renderSubsection('Supporting Documents', 
              getDisplayValue(businessPlanData, 'appendix.supportingDocuments', ''))}
            {renderSubsection('Market Research Data', 
              getDisplayValue(businessPlanData, 'appendix.marketResearchData', ''))}
            {renderSubsection('Financial Spreadsheets', 
              getDisplayValue(businessPlanData, 'appendix.financialSpreadsheets', ''))}
          </>
        ))}

        {/* Footer */}
        <div style={{
          marginTop: '2rem',
          paddingTop: '1rem',
          borderTop: '1px solid #e5e7eb',
          textAlign: 'center',
          color: '#6b7280',
          fontSize: '14px',
        }}>
          Generated by Tool Thinker on {new Date().toLocaleDateString()} | Professional Business Plan
        </div>

        {/* Close Button */}
        <div style={{
          display: 'flex',
          justifyContent: 'flex-end',
          marginTop: '2rem',
        }}>
          <button
            onClick={onClose}
            style={{
              padding: '0.75rem 1.5rem',
              border: 'none',
              borderRadius: '6px',
              background: '#6b7280',
              color: '#fff',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '600',
            }}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
} 