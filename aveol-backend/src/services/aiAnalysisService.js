const OpenAI = require('openai');
const logger = require('../utils/logger');

let openai = null;
if (process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== 'placeholder') {
  try {
    openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  } catch (err) {
    logger.warn('Failed to initialize OpenAI client. Mock responses will be used.');
  }
}

/**
 * Analyzes audit form data and returns structured AI recommendations
 * @param {Object} clientData - Client info
 * @param {Object} auditData  - Full audit form responses
 * @returns {Object} Structured analysis result
 */
const analyzeBusinessAudit = async (clientData, auditData) => {
  // If no OpenAI key, return a mock response so the platform still functions fully
  if (!openai) {
    logger.warn('No valid OPENAI_API_KEY found. Generating a standard (mocked) AI report.');
    return normalizeAnalysis({
      auditScore: 75,
      automationReadinessLevel: 'High',
      executiveSummary: `Based on your audit submission for ${clientData.companyName}, we have identified high-value automation opportunities. Replacing manual data entry and sales follow-ups with intelligent AI agents can drive significant ROI.`,
      identifiedOpportunities: [
        {
          area: 'Customer Support & Lead Capture',
          description: 'Deploy an AI chatbot on your website and WhatsApp to handle initial inquiries 24/7.',
          estimatedTimeSavedPerWeek: 15,
          priority: 'Critical'
        },
        {
          area: 'Sales CRM Automation',
          description: 'Automatically route and score leads based on customer responses.',
          estimatedTimeSavedPerWeek: 10,
          priority: 'High'
        }
      ],
      recommendedAgents: [
        {
          agentName: '24/7 AI Receptionist',
          agentType: 'Support & Lead Gen',
          description: 'Instantly responds to prospects, answers FAQs, and books calls directly to your calendar.',
          estimatedROI: 'Saves 1 full-time salary / 3x ROI in 6 months',
          implementationTime: '2-3 weeks'
        }
      ],
      estimatedAnnualSavings: {
        timeHours: 1300,
        moneyINR: 350000
      },
      recommendedStack: ['Make.com/Zapier', 'OpenAI ChatGPT API', 'WhatsApp Cloud API'],
      quickWins: ['Connect lead form directly to CRM', 'Automate immediate welcome emails for new leads'],
      longTermGoals: ['End-to-end automated invoice generation', 'AI-driven business analytics dashboard'],
      fullReportText: `This is a standard template report because a valid OpenAI API Key was not provided securely to the backend instance. Once you configure your OpenAI API Key, the system will use GPT-4 to dynamically write personalized, multi-page automation reports unique to each client's specific bottlenecks, tools, and industry context.`
    });
  }

  const prompt = buildAuditPrompt(clientData, auditData);

  const response = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      {
        role: 'system',
        content: `You are a world-class AI automation consultant specializing in business process automation for Indian companies.
Your job is to analyze a business audit submission and produce a detailed, structured automation analysis.
You MUST respond ONLY with a valid JSON object — no markdown, no commentary.
All monetary values should be in Indian Rupees (INR).
Be specific, actionable, and realistic in your recommendations.`,
      },
      {
        role: 'user',
        content: prompt,
      },
    ],
    temperature: 0.4,
    max_tokens: 3000,
    response_format: { type: 'json_object' },
  });

  const raw = response.choices[0].message.content;
  logger.debug('OpenAI raw response received');

  try {
    const analysis = JSON.parse(raw);
    return normalizeAnalysis(analysis);
  } catch (err) {
    logger.error('Failed to parse OpenAI response as JSON', err);
    throw new Error('AI analysis returned invalid JSON');
  }
};

// ── Build the prompt ──────────────────────────────────────────────────────────
const buildAuditPrompt = (client, audit) => {
  return `
Analyze this business audit submission for AVEOL AI Automation Agency.

## BUSINESS DETAILS
- Company: ${client.companyName}
- Industry: ${client.industry}
- Team Size: ${client.teamSize}
- Role: ${client.companyRole}
- Current Tools: ${(audit.currentTools || []).join(', ') || 'Not specified'}
- Other Tools: ${audit.otherTools || 'None'}

## PAIN POINTS & CHALLENGES
- Biggest Bottlenecks: ${audit.biggestBottlenecks || 'Not provided'}
- Repetitive Tasks: ${audit.repetitiveTasks || 'Not provided'}
- Sales Problems: ${audit.salesProblems || 'Not provided'}
- Customer Support Problems: ${audit.customerSupportProblems || 'Not provided'}
- Lead Generation Issues: ${audit.leadGenIssues || 'Not provided'}
- CRM Issues: ${audit.crmIssues || 'Not provided'}
- Operations Tasks: ${audit.operationsTasks || 'Not provided'}

## SCALE & BUDGET
- Monthly Volume: ${audit.monthlyBusinessVolume || 'Not specified'}
- Budget Range: ${audit.budgetRange || 'Not specified'}
- Automation Goals: ${audit.automationGoals || 'Not provided'}
- Timeline: ${audit.timeline || 'Not specified'}
- Prior Automation Experience: ${audit.previousAutomationExperience || 'None'}

## REQUIRED RESPONSE FORMAT (JSON only):
{
  "auditScore": <number 0-100>,
  "automationReadinessLevel": "<Low|Medium|High|Very High>",
  "executiveSummary": "<2-3 paragraph personalized summary>",
  "identifiedOpportunities": [
    {
      "area": "<area name>",
      "description": "<specific description>",
      "estimatedTimeSavedPerWeek": <hours>,
      "priority": "<Critical|High|Medium|Low>"
    }
  ],
  "recommendedAgents": [
    {
      "agentName": "<e.g. AI Sales Agent>",
      "agentType": "<category>",
      "description": "<what it does for this specific business>",
      "estimatedROI": "<e.g. 3x within 6 months>",
      "implementationTime": "<e.g. 2-3 weeks>"
    }
  ],
  "estimatedAnnualSavings": {
    "timeHours": <number>,
    "moneyINR": <number>
  },
  "recommendedStack": ["<tool1>", "<tool2>"],
  "quickWins": ["<action 1>", "<action 2>", "<action 3>"],
  "longTermGoals": ["<goal 1>", "<goal 2>"],
  "fullReportText": "<detailed multi-paragraph report for the PDF>"
}

Be specific to this EXACT business. Reference their actual tools, pain points, and industry.
For Indian businesses, factor in WhatsApp automation, regional market dynamics, and INR costs.
Ensure auditScore reflects genuine automation potential: higher score = more opportunity.
`;
};

// ── Normalize & validate analysis output ─────────────────────────────────────
const normalizeAnalysis = (raw) => {
  return {
    auditScore: Math.min(100, Math.max(0, Number(raw.auditScore) || 50)),
    automationReadinessLevel: raw.automationReadinessLevel || 'Medium',
    executiveSummary: raw.executiveSummary || '',
    identifiedOpportunities: Array.isArray(raw.identifiedOpportunities)
      ? raw.identifiedOpportunities.slice(0, 8)
      : [],
    recommendedAgents: Array.isArray(raw.recommendedAgents)
      ? raw.recommendedAgents.slice(0, 7)
      : [],
    estimatedAnnualSavings: {
      timeHours: Number(raw.estimatedAnnualSavings?.timeHours) || 0,
      moneyINR: Number(raw.estimatedAnnualSavings?.moneyINR) || 0,
    },
    recommendedStack: Array.isArray(raw.recommendedStack) ? raw.recommendedStack : [],
    quickWins: Array.isArray(raw.quickWins) ? raw.quickWins : [],
    longTermGoals: Array.isArray(raw.longTermGoals) ? raw.longTermGoals : [],
    fullReportText: raw.fullReportText || raw.executiveSummary || '',
  };
};

/**
 * Calculate lead score based on audit responses
 */
const calculateLeadScore = (client, audit, aiAnalysis) => {
  let score = 0;

  // Budget weight (30 pts)
  const budgetScores = {
    '₹2,00,000+': 30,
    'Depends on ROI': 25,
    '₹75,000–₹2,00,000': 20,
    '₹25,000–₹75,000': 10,
    'Under ₹25,000': 5,
  };
  score += budgetScores[audit.budgetRange] || 0;

  // Timeline weight (20 pts)
  const timelineScores = {
    'ASAP': 20,
    'Within 1 month': 16,
    '1–3 months': 10,
    '3–6 months': 5,
    'Just exploring': 0,
  };
  score += timelineScores[audit.timeline] || 0;

  // Team size weight (15 pts)
  const teamScores = { '200+': 15, '51-200': 12, '21-50': 8, '6-20': 5, '1-5': 2 };
  score += teamScores[client.teamSize] || 0;

  // AI audit score weight (20 pts)
  score += Math.floor((aiAnalysis.auditScore / 100) * 20);

  // Business volume weight (15 pts)
  const volumeScores = {
    '₹1Cr+/month': 15,
    '₹20L–₹1Cr/month': 12,
    '₹5L–₹20L/month': 7,
    'Under ₹5L/month': 3,
  };
  score += volumeScores[audit.monthlyBusinessVolume] || 0;

  return Math.min(100, score);
};

/**
 * Determine lead priority based on score
 */
const determinePriority = (score) => {
  if (score >= 80) return 'hot';
  if (score >= 60) return 'high';
  if (score >= 40) return 'medium';
  return 'low';
};

module.exports = {
  analyzeBusinessAudit,
  calculateLeadScore,
  determinePriority,
};
