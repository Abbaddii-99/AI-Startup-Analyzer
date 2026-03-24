import React from 'react';
import { ComprehensiveIdeaAnalysis } from '@ai-startup-analyzer/shared';

interface IdeaAnalysisProps {
  analysis: ComprehensiveIdeaAnalysis;
}

const IdeaAnalysis: React.FC<IdeaAnalysisProps> = ({ analysis }) => {
  const renderScoreCard = (title: string, score: number, details: string) => (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">{title}</h3>
        <div className="flex items-center space-x-2">
          <div className="w-16 bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full" 
              style={{ width: `${score * 10}%` }}
            ></div>
          </div>
          <span className="text-sm font-medium text-gray-600">{score}/10</span>
        </div>
      </div>
      <p className="text-gray-700 text-sm">{details}</p>
    </div>
  );

  const renderList = (items: string[], title: string) => (
    <div className="mb-4">
      <h4 className="font-medium text-gray-900 mb-2">{title}</h4>
      <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
        {items.map((item, index) => (
          <li key={index}>{item}</li>
        ))}
      </ul>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Final Score */}
      <div className="bg-gradient-to-r from-green-500 to-blue-500 text-white rounded-lg p-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold">Final Recommendation Score</h2>
            <p className="text-green-100">Overall viability assessment</p>
          </div>
          <div className="text-right">
            <span className="text-4xl font-bold">{analysis.finalScore}</span>
            <span className="text-green-100">/10</span>
          </div>
        </div>
      </div>

      {/* Core Analysis Sections */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {renderScoreCard(
          'Overall Viability',
          analysis.overallViability.score,
          analysis.overallViability.assessment
        )}
        
        {renderScoreCard(
          'Market Opportunity',
          analysis.marketOpportunity.score,
          analysis.marketOpportunity.assessment
        )}

        {renderScoreCard(
          'Competitive Analysis',
          analysis.competitiveAnalysis.score,
          analysis.competitiveAnalysis.assessment
        )}

        {renderScoreCard(
          'Target Audience Fit',
          analysis.targetAudienceFit.score,
          analysis.targetAudienceFit.assessment
        )}

        {renderScoreCard(
          'Financial Feasibility',
          analysis.financialFeasibility.score,
          analysis.financialFeasibility.assessment
        )}

        {renderScoreCard(
          'Risk Assessment',
          analysis.riskAssessment.score,
          analysis.riskAssessment.assessment
        )}
      </div>

      {/* Detailed Analysis */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold mb-4">Detailed Analysis</h3>
        <div className="prose max-w-none">
          <pre className="whitespace-pre-wrap text-sm text-gray-700">
            {analysis.detailedAnalysis}
          </pre>
        </div>
      </div>

      {/* Key Insights */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold mb-4">Strengths & Weaknesses</h3>
          {renderList(analysis.overallViability.strengths, 'Strengths')}
          {renderList(analysis.overallViability.weaknesses, 'Weaknesses')}
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold mb-4">Market Insights</h3>
          <div className="space-y-4">
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Market Size</h4>
              <p className="text-sm text-gray-700">{analysis.marketOpportunity.marketSize}</p>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Growth Potential</h4>
              <p className="text-sm text-gray-700">{analysis.marketOpportunity.growthPotential}</p>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Timing</h4>
              <p className="text-sm text-gray-700">{analysis.marketOpportunity.timing}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold mb-4">Competitive Edge</h3>
          <div className="space-y-4">
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Competitive Advantage</h4>
              <p className="text-sm text-gray-700">{analysis.competitiveAnalysis.competitiveAdvantage}</p>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Barriers to Entry</h4>
              <p className="text-sm text-gray-700">{analysis.competitiveAnalysis.barriersToEntry}</p>
            </div>
            {renderList(analysis.competitiveAnalysis.differentiation, 'Differentiation Factors')}
          </div>
        </div>
      </div>

      {/* Recommendations */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold mb-4">Recommendations</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Priority Actions</h4>
            {renderList(analysis.recommendations.priority, '')}
          </div>
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Quick Wins</h4>
            {renderList(analysis.recommendations.quickWins, '')}
          </div>
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Long-term Strategies</h4>
            {renderList(analysis.recommendations.longTermStrategies, '')}
          </div>
        </div>
      </div>

      {/* Risk Assessment Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold mb-4">High Risk Factors</h3>
          {renderList(analysis.riskAssessment.highRiskFactors, '')}
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold mb-4">Mitigation Strategies</h3>
          {renderList(analysis.riskAssessment.mitigationStrategies, '')}
        </div>
      </div>
    </div>
  );
};

export default IdeaAnalysis;