import React from 'react';
import logo from '../../../assets/logo.png';

interface FinancialPlanModalProps {
  isOpen: boolean;
  onClose: () => void;
  financialPlan: any;
}

export function FinancialPlanModal({ isOpen, onClose, financialPlan }: FinancialPlanModalProps) {
  console.log('FinancialPlanModal render:', { isOpen, financialPlan: !!financialPlan });
  console.log('FinancialPlanModal data:', financialPlan);
  console.log('FinancialPlanModal data structure:', {
    executiveSummary: financialPlan?.executiveSummary,
    financialProjections: financialPlan?.financialProjections,
    fundingRequirements: financialPlan?.fundingRequirements,
    financialMetrics: financialPlan?.financialMetrics
  });
  
  if (!isOpen || !financialPlan) {
    console.log('FinancialPlanModal returning null - isOpen:', isOpen, 'financialPlan:', !!financialPlan);
    return null;
  }

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

  // Helper function to safely get nested values
  const getValue = (obj: any, path: string, defaultValue: any = '') => {
    try {
      const result = path.split('.').reduce((current, key) => current?.[key], obj) ?? defaultValue;
      return result;
    } catch {
      return defaultValue;
    }
  };

  // Helper function to safely get string values for display
  const getDisplayValue = (obj: any, path: string, defaultValue: string = '') => {
    try {
      const result = path.split('.').reduce((current, key) => current?.[key], obj);
      if (result === undefined || result === null) {
        return defaultValue;
      }
      // If the result is an object, convert it to a readable string
      if (result && typeof result === 'object' && !Array.isArray(result)) {
        // Handle specific cases where we know the object structure
        if (path.includes('financialHighlights')) {
          // If financialHighlights is an object, extract key information
          if (result.year1Revenue && result.year5Revenue) {
            return `Revenue projection from $${result.year1Revenue} to $${result.year5Revenue} over 5 years.`;
          }
          if (result.year1 && result.year5) {
            return `Revenue growth from $${result.year1.revenue} to $${result.year5.revenue} with net profit improving from $${result.year1.netProfit} to $${result.year5.netProfit}.`;
          }
          return 'Professional financial projections and investment requirements for your business venture.';
        }
        if (path.includes('investmentRequirements')) {
          // If investmentRequirements is an object, extract key information
          if (result.totalFundingNeeded && result.expectedReturns) {
            return `Total funding needed: $${result.totalFundingNeeded}. ${result.expectedReturns}`;
          }
          return 'Investment requirements and funding details available.';
        }
        return JSON.stringify(result);
      }
      return String(result);
    } catch {
      return defaultValue;
    }
  };

  // Calculate totals from financial projections
  const calculateTotals = () => {
    try {
      const projections = getValue(financialPlan, 'financialProjections.revenueProjections', {});
      let totalRevenue = 0;
      let totalProfit = 0;
      
      // Ensure projections is an object and has the expected structure
      if (projections && typeof projections === 'object' && !Array.isArray(projections)) {
        Object.values(projections).forEach((yearData: any) => {
          if (yearData && typeof yearData === 'object' && typeof yearData.annual === 'number') {
            totalRevenue += yearData.annual;
          }
        });
      }

      const profitLoss = getValue(financialPlan, 'financialProjections.profitLoss', {});
      if (profitLoss && typeof profitLoss === 'object' && !Array.isArray(profitLoss)) {
        Object.values(profitLoss).forEach((yearData: any) => {
          if (yearData && typeof yearData === 'object' && typeof yearData.netProfit === 'number') {
            totalProfit += yearData.netProfit;
          }
        });
      }

      return { totalRevenue, totalProfit };
    } catch (error) {
      console.error('Error calculating totals:', error);
      return { totalRevenue: 0, totalProfit: 0 };
    }
  };

  const { totalRevenue, totalProfit } = calculateTotals();

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.7)',
      zIndex: 10000,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '12px',
        maxWidth: '90vw',
        maxHeight: '90vh',
        width: '1200px',
        overflow: 'auto',
        position: 'relative',
        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)'
      }}>
        {/* Header */}
        <div style={{
          padding: '24px 32px',
          borderBottom: '1px solid #e5e7eb',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          backgroundColor: '#f8fafc'
        }}>
          <h1 style={{
            fontSize: '24px',
            fontWeight: 700,
            color: '#1e293b',
            margin: 0
          }}>
            📊 Comprehensive Financial Plan
          </h1>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '16px'
          }}>
            <img 
              src={logo} 
              alt="ToolThinker Logo" 
              style={{
                height: '80px',
                width: 'auto',
                opacity: 0.8
              }}
            />
            <button
              onClick={onClose}
              style={{
                background: 'none',
                border: 'none',
                fontSize: '24px',
                cursor: 'pointer',
                color: '#6b7280',
                padding: '8px',
                borderRadius: '4px',
                transition: 'color 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.color = '#374151'}
              onMouseLeave={(e) => e.currentTarget.style.color = '#6b7280'}
            >
              ×
            </button>
          </div>
        </div>

        {/* Content */}
        <div style={{ padding: '32px' }}>
          {/* Executive Summary */}
          <section style={{ marginBottom: '40px' }}>
            <h2 style={{
              fontSize: '20px',
              fontWeight: 600,
              color: '#1e293b',
              marginBottom: '16px',
              borderBottom: '2px solid #3b82f6',
              paddingBottom: '8px'
            }}>
              🎯 Executive Summary
            </h2>
            <div style={{
              backgroundColor: '#f8fafc',
              padding: '20px',
              borderRadius: '8px',
              border: '1px solid #e2e8f0'
            }}>
              <div style={{ marginBottom: '16px' }}>
                <strong>Business Overview:</strong>
                <p style={{ margin: '8px 0', color: '#475569', lineHeight: '1.6' }}>
                  {getDisplayValue(financialPlan, 'executiveSummary.businessOverview', 'Comprehensive financial plan generated based on your business idea and automated discovery data.')}
                </p>
              </div>
              <div style={{ marginBottom: '16px' }}>
                <strong>Financial Highlights:</strong>
                <p style={{ margin: '8px 0', color: '#475569', lineHeight: '1.6' }}>
                  {getDisplayValue(financialPlan, 'executiveSummary.financialHighlights', 'Professional financial projections and investment requirements for your business venture.')}
                </p>
              </div>
              <div>
                <strong>Investment Requirements:</strong>
                <p style={{ margin: '8px 0', color: '#475569', lineHeight: '1.6' }}>
                  {getDisplayValue(financialPlan, 'executiveSummary.investmentRequirements', 'Funding needs and expected returns based on comprehensive market analysis.')}
                </p>
              </div>
            </div>
          </section>

          {/* Financial Projections */}
          <section style={{ marginBottom: '40px' }}>
            <h2 style={{
              fontSize: '20px',
              fontWeight: 600,
              color: '#1e293b',
              marginBottom: '16px',
              borderBottom: '2px solid #10b981',
              paddingBottom: '8px'
            }}>
              📈 Financial Projections (5 Years)
            </h2>
            
            {/* Revenue Projections */}
            <div style={{ marginBottom: '24px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#374151', marginBottom: '12px' }}>
                Revenue Projections
              </h3>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '16px',
                marginBottom: '16px'
              }}>
                {getValue(financialPlan, 'financialProjections.revenueProjections', {}) && 
                  Object.entries(getValue(financialPlan, 'financialProjections.revenueProjections', {})).map(([year, data]: [string, any]) => (
                    <div key={year} style={{
                      backgroundColor: '#f0fdf4',
                      padding: '16px',
                      borderRadius: '8px',
                      border: '1px solid #bbf7d0'
                    }}>
                      <div style={{ fontWeight: 600, color: '#166534', marginBottom: '8px' }}>
                        {year.toUpperCase()}
                      </div>
                      <div style={{ fontSize: '14px', color: '#374151' }}>
                        <div>Annual: {formatCurrency(data?.annual)}</div>
                        <div>Growth: {formatPercentage(data?.growthRate)}</div>
                      </div>
                    </div>
                  ))
                }
              </div>
            </div>

            {/* Break-even Analysis */}
            {getValue(financialPlan, 'financialProjections.breakEvenAnalysis') && (
              <div style={{ marginBottom: '24px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#374151', marginBottom: '12px' }}>
                  Break-even Analysis
                </h3>
                <div style={{
                  backgroundColor: '#fef3c7',
                  padding: '16px',
                  borderRadius: '8px',
                  border: '1px solid #fde68a'
                }}>
                  <div style={{ fontSize: '14px', color: '#92400e' }}>
                    <div><strong>Break-even Point:</strong> {getDisplayValue(financialPlan, 'financialProjections.breakEvenAnalysis.breakEvenPoint', 'Year 3, Month 8')}</div>
                    <div><strong>Break-even Revenue:</strong> {formatCurrency(getValue(financialPlan, 'financialProjections.breakEvenAnalysis.breakEvenRevenue', 315000))}</div>
                    <div><strong>Break-even Units:</strong> {getDisplayValue(financialPlan, 'financialProjections.breakEvenAnalysis.breakEvenUnits', '3150')}</div>
                  </div>
                </div>
              </div>
            )}
          </section>

          {/* Financial Summary */}
          <section style={{ marginBottom: '40px' }}>
            <h2 style={{
              fontSize: '20px',
              fontWeight: 600,
              color: '#1e293b',
              marginBottom: '16px',
              borderBottom: '2px solid #f59e0b',
              paddingBottom: '8px'
            }}>
              📊 Financial Summary
            </h2>
            
            <div style={{
              backgroundColor: '#fffbeb',
              padding: '20px',
              borderRadius: '8px',
              border: '1px solid #fed7aa'
            }}>
              <div style={{ marginBottom: '16px' }}>
                <strong>Total 5-Year Revenue:</strong> {formatCurrency(totalRevenue)}
              </div>
              <div style={{ marginBottom: '16px' }}>
                <strong>Total 5-Year Net Profit:</strong> {formatCurrency(totalProfit)}
              </div>
              <div style={{ marginBottom: '16px' }}>
                <strong>Initial Capital Required:</strong> {formatCurrency(getValue(financialPlan, 'fundingRequirements.initialCapital', 150000))}
              </div>
              <div style={{ marginBottom: '16px' }}>
                <strong>Expected ROI:</strong> {getDisplayValue(financialPlan, 'fundingRequirements.expectedROI.investorReturn', '3-5x over 5 years')}
              </div>
              <div style={{ marginBottom: '16px' }}>
                <strong>Exit Strategy:</strong> {getDisplayValue(financialPlan, 'fundingRequirements.expectedROI.exitStrategy', 'Acquisition or IPO')}
              </div>
              <div>
                <strong>Timeline:</strong> {getDisplayValue(financialPlan, 'fundingRequirements.expectedROI.timeline', '5-7 years')}
              </div>
            </div>
          </section>

          {/* Additional Financial Metrics */}
          {getValue(financialPlan, 'financialMetrics') && (
            <section style={{ marginBottom: '40px' }}>
              <h2 style={{
                fontSize: '20px',
                fontWeight: 600,
                color: '#1e293b',
                marginBottom: '16px',
                borderBottom: '2px solid #8b5cf6',
                paddingBottom: '8px'
              }}>
                📊 Key Financial Metrics
              </h2>
              
              <div style={{
                backgroundColor: '#faf5ff',
                padding: '20px',
                borderRadius: '8px',
                border: '1px solid #e9d5ff'
              }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
                  <div>
                    <strong>Customer Acquisition Cost:</strong> {formatCurrency(getValue(financialPlan, 'financialMetrics.customerAcquisitionCost', 150))}
                  </div>
                  <div>
                    <strong>Customer Lifetime Value:</strong> {formatCurrency(getValue(financialPlan, 'financialMetrics.customerLifetimeValue', 1200))}
                  </div>
                  <div>
                    <strong>Gross Margin:</strong> {formatPercentage(getValue(financialPlan, 'financialMetrics.grossMargin', 65))}
                  </div>
                  <div>
                    <strong>Net Margin:</strong> {formatPercentage(getValue(financialPlan, 'financialMetrics.netMargin', -25))}
                  </div>
                  <div>
                    <strong>Payback Period:</strong> {getDisplayValue(financialPlan, 'financialMetrics.paybackPeriod', '18 months')}
                  </div>
                  <div>
                    <strong>LTV/CAC Ratio:</strong> {getValue(financialPlan, 'financialMetrics.lifetimeValueRatio', 8.0).toFixed(1)}x
                  </div>
                </div>
              </div>
            </section>
          )}
        </div>

        {/* Footer */}
        <div style={{
          padding: '24px 32px',
          borderTop: '1px solid #e5e7eb',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          backgroundColor: '#f8fafc'
        }}>
          <div style={{ fontSize: '14px', color: '#6b7280' }}>
            Generated by Tool Thinker on {new Date().toLocaleDateString()} | Professional Financial Plan
          </div>
          <button
            onClick={onClose}
            style={{
              background: '#3b82f6',
              color: 'white',
              border: 'none',
              padding: '12px 24px',
              borderRadius: '6px',
              fontSize: '14px',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'background 0.2s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = '#2563eb'}
            onMouseLeave={(e) => e.currentTarget.style.background = '#3b82f6'}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
} 