import { GoogleGenerativeAI } from '@google/generative-ai';

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const genAI = process.env.GEMINI_API_KEY ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY) : null;

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
    // If Gemini is not configured, return fallback analysis
    if (!genAI) {
      return {
        riskScore: 5,
        fraudIndicators: ['Manual review required - AI analysis not available'],
        recommendedActions: ['Conduct thorough investigation', 'Verify reporter identity', 'Review evidence'],
        urgencyLevel: 'medium',
        similarPatterns: [],
        evidenceAssessment: 'AI analysis not configured - manual review recommended',
        summary: 'Gemini API not configured, manual review required',
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

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" }); // Using a specific Gemini model

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();


    let parsedResult: any;
    try {
      parsedResult = JSON.parse(text);
    } catch (parseError) {
      console.error('Gemini analysis JSON parsing failed:', parseError);
      // If JSON parsing fails, return structured data indicating the issue
      return {
        riskScore: 5,
        fraudIndicators: ['AI analysis returned non-JSON response'],
        recommendedActions: ['Manual review required', 'Check AI prompt and response format'],
        urgencyLevel: 'medium',
        similarPatterns: [],
        evidenceAssessment: 'AI analysis failed to return valid JSON',
        summary: 'Gemini analysis failed to parse JSON response',
        confidence: 0.1
      };
    }


    // Validate and sanitize the response
    return {
      riskScore: Math.max(1, Math.min(10, parsedResult.riskScore || 5)),
      fraudIndicators: Array.isArray(parsedResult.fraudIndicators) ? parsedResult.fraudIndicators.slice(0, 10) : [],
      recommendedActions: Array.isArray(parsedResult.recommendedActions) ? parsedResult.recommendedActions.slice(0, 8) : [],
      urgencyLevel: ['low', 'medium', 'high', 'critical'].includes(parsedResult.urgencyLevel) ? parsedResult.urgencyLevel : 'medium',
      similarPatterns: Array.isArray(parsedResult.similarPatterns) ? parsedResult.similarPatterns.slice(0, 5) : [],
      evidenceAssessment: parsedResult.evidenceAssessment || 'Unable to assess evidence quality',
      summary: parsedResult.summary || 'Analysis completed',
      confidence: Math.max(0, Math.min(1, parsedResult.confidence || 0.7))
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
      summary: 'Gemini analysis failed, manual review required',
      confidence: 0.1
    };
  }
}

export async function generateModerationAdvice(caseData: any, analysis: AIAnalysisResult): Promise<string> {
  try {
    // If Gemini is not configured, return fallback advice
    if (!genAI) {
      return 'AI guidance unavailable - Gemini not configured. Please conduct standard investigation procedures and manual review.';
    }
    const prompt = `
Based on this fraud analysis, provide specific moderation advice:

Case: ${caseData.title}
Risk Score: ${analysis.riskScore}/10
Urgency: ${analysis.urgencyLevel}
Confidence: ${(analysis.confidence * 100).toFixed(0)}%

Analysis Summary: ${analysis.summary}

Provide concise, actionable advice for moderators in 2-3 paragraphs.`;

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" }); // Using a specific Gemini model

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    return text || 'Manual review recommended.';
  } catch (error) {
    console.error('Failed to generate moderation advice:', error);
    return 'AI guidance unavailable. Please conduct standard investigation procedures.';
  }
}