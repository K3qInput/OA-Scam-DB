import OpenAI from "openai";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = process.env.OPENAI_API_KEY ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY }) : null;

export interface AIAnalysisResult {
  riskScore: number; // 1-10 scale
  fraudIndicators: string[];
  recommendedActions: string[];
  urgencyLevel: 'low' | 'medium' | 'high' | 'critical';
  similarPatterns: string[];
  evidenceAssessment: string;
  summary: string;
  confidence: number; // 0-1 scale
}

export async function analyzeCaseReport(caseData: {
  title: string;
  description: string;
  type: string;
  amountInvolved?: string;
  reportedUserId: string;
  evidenceFiles?: Array<{ name: string; description?: string }>;
}): Promise<AIAnalysisResult> {
  try {
    // If OpenAI is not configured, return fallback analysis
    if (!openai) {
      return {
        riskScore: 5,
        fraudIndicators: ['Manual review required - AI analysis not available'],
        recommendedActions: ['Conduct thorough investigation', 'Verify reporter identity', 'Review evidence'],
        urgencyLevel: 'medium',
        similarPatterns: [],
        evidenceAssessment: 'AI analysis not configured - manual review recommended',
        summary: 'OpenAI API not configured, manual review required',
        confidence: 0.1
      };
    }
    const prompt = `
You are an expert fraud analyst for OwnersAlliance. Analyze this scam report and provide a comprehensive assessment.

Case Details:
- Title: ${caseData.title}
- Type: ${caseData.type}
- Reported User: ${caseData.reportedUserId}
- Amount Involved: ${caseData.amountInvolved || 'Not specified'}
- Description: ${caseData.description}
- Evidence Files: ${caseData.evidenceFiles?.map(f => `${f.name}${f.description ? ` (${f.description})` : ''}`).join(', ') || 'None'}

Provide analysis in JSON format with:
{
  "riskScore": number (1-10),
  "fraudIndicators": string array,
  "recommendedActions": string array,
  "urgencyLevel": "low" | "medium" | "high" | "critical",
  "similarPatterns": string array,
  "evidenceAssessment": string,
  "summary": string,
  "confidence": number (0-1)
}

Focus on:
- Red flags and fraud patterns
- Evidence quality and completeness
- Recommended investigation steps
- Urgency assessment
- Similar scam tactics`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are an expert fraud analyst. Analyze scam reports and provide structured insights in JSON format."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" },
      temperature: 0.3,
    });

    const result = JSON.parse(response.choices[0].message.content || '{}');
    
    // Validate and sanitize the response
    return {
      riskScore: Math.max(1, Math.min(10, result.riskScore || 5)),
      fraudIndicators: Array.isArray(result.fraudIndicators) ? result.fraudIndicators.slice(0, 10) : [],
      recommendedActions: Array.isArray(result.recommendedActions) ? result.recommendedActions.slice(0, 8) : [],
      urgencyLevel: ['low', 'medium', 'high', 'critical'].includes(result.urgencyLevel) ? result.urgencyLevel : 'medium',
      similarPatterns: Array.isArray(result.similarPatterns) ? result.similarPatterns.slice(0, 5) : [],
      evidenceAssessment: result.evidenceAssessment || 'Unable to assess evidence quality',
      summary: result.summary || 'Analysis completed',
      confidence: Math.max(0, Math.min(1, result.confidence || 0.7))
    };
  } catch (error) {
    console.error('AI analysis failed:', error);
    // Fallback analysis
    return {
      riskScore: 5,
      fraudIndicators: ['Manual review required'],
      recommendedActions: ['Conduct thorough investigation', 'Verify reporter identity', 'Review evidence'],
      urgencyLevel: 'medium',
      similarPatterns: [],
      evidenceAssessment: 'Analysis unavailable - manual review recommended',
      summary: 'AI analysis failed, manual review required',
      confidence: 0.1
    };
  }
}

export async function generateModerationAdvice(caseData: any, analysis: AIAnalysisResult): Promise<string> {
  try {
    // If OpenAI is not configured, return fallback advice
    if (!openai) {
      return 'AI guidance unavailable - OpenAI not configured. Please conduct standard investigation procedures and manual review.';
    }
    const prompt = `
Based on this fraud analysis, provide specific moderation advice:

Case: ${caseData.title}
Risk Score: ${analysis.riskScore}/10
Urgency: ${analysis.urgencyLevel}
Confidence: ${(analysis.confidence * 100).toFixed(0)}%

Analysis Summary: ${analysis.summary}

Provide concise, actionable advice for moderators in 2-3 paragraphs.`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are a senior fraud investigation advisor. Provide practical moderation guidance."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.2,
      max_tokens: 300
    });

    return response.choices[0].message.content || 'Manual review recommended.';
  } catch (error) {
    console.error('Failed to generate moderation advice:', error);
    return 'AI guidance unavailable. Please conduct standard investigation procedures.';
  }
}