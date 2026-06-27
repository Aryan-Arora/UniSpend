import { formatCurrency } from '../utils/formatCurrency';

// ─────────────────────────────────────────────────────────────
// Groq Service
//
// Calls Groq (llama-3.3-70b-versatile) via the OpenAI-compatible
// chat/completions API with the user's financial context to
// answer any financial question. Much lower latency than Gemini.
// ─────────────────────────────────────────────────────────────

// Get your free API key at: https://console.groq.com/keys
const GROQ_API_KEY = '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';
const GROQ_MODEL = 'llama-3.3-70b-versatile';
const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions';

/**
 * Build a rich system prompt with ALL the user's financial data
 */
export const buildSystemPrompt = (ctx) => {
 const {
 weeklySpend, monthlyEstimate, healthScore, spendingTrend,
 riskScore, spenderType, suggestions, investmentAdvice,
 cashflow, categoryDist, topCategory, dailySpend,
 dailyAvg, totalIncome, totalExpense, netCashflow,
 savingsRate, burnRate, runway, monthlyDisposable,
 categorySorted, categoryTotal, recentTxs, daysTracked,
 } = ctx;

 const categoryLines = categorySorted.slice(0, 10).map(([cat, amt]) => {
 const pct = categoryTotal > 0 ? ((amt / categoryTotal) * 100).toFixed(1) : 0;
 return ` - ${cat}: ${formatCurrency(amt)} (${pct}%)`;
 }).join('\n');

 const recentTxLines = recentTxs.slice(0, 8).map((tx) => {
 const amt = Math.abs(tx.amount);
 const sign = tx.amount < 0 ? 'credit' : 'debit';
 const name = tx.merchant_name || tx.category || 'Unknown';
 return ` - ${sign} ${formatCurrency(amt)} — ${name} (${tx.date})`;
 }).join('\n');

 const dailyLines = Object.entries(dailySpend || {})
 .sort(([a], [b]) => a.localeCompare(b))
 .slice(-7)
 .map(([date, amt]) => ` - ${date}: ${formatCurrency(amt)}`)
 .join('\n');

 const suggestionLines = (suggestions || []).map((s, i) => {
 const text = typeof s === 'string' ? s : s.text || String(s);
 return ` ${i + 1}. ${text}`;
 }).join('\n');

 return `You are the Unispend Co-pilot, an expert AI financial assistant embedded in the Unispend personal finance app.
You have access to the user's real financial data below. Use this data to give specific, personalized answers.

━━━ USER'S FINANCIAL DATA ━━━

SPENDING OVERVIEW:
- Weekly spend: ${formatCurrency(weeklySpend)}
- Monthly estimate: ${formatCurrency(monthlyEstimate)}
- Daily average: ${formatCurrency(Math.round(dailyAvg))}
- Spending trend: ${spendingTrend}
- Days tracked: ${daysTracked}

CATEGORY BREAKDOWN:
${categoryLines || ' No category data available'}

DAILY SPENDING (recent):
${dailyLines || ' No daily data available'}

CASHFLOW:
- Total income: ${formatCurrency(totalIncome)}
- Total expenses: ${formatCurrency(totalExpense)}
- Net cashflow: ${formatCurrency(netCashflow)}
- Savings rate: ${savingsRate ? (savingsRate * 100).toFixed(1) + '%' : 'N/A'}
- Daily burn rate: ${formatCurrency(burnRate)}
- Runway: ${runway ? Math.round(runway) + ' days' : 'N/A'}
- Monthly disposable (spare): ${formatCurrency(Math.max(monthlyDisposable, 0))}

HEALTH & RISK:
- Financial health score: ${healthScore}/100
- Risk score: ${Math.round(riskScore * 100)}%
- Spender type: ${spenderType}
- Top spending category: ${topCategory || 'N/A'}

RECENT TRANSACTIONS:
${recentTxLines || ' No recent transactions'}

AI SUGGESTIONS:
${suggestionLines || ' No suggestions available'}

INVESTMENT ADVICE:
${investmentAdvice || 'No investment advice available'}

━━━ INSTRUCTIONS ━━━

1. ALWAYS use the actual data above to give specific, numbers-backed answers. Never make up data.
2. Use Indian Rupee (₹) for all amounts. Format large amounts in lakhs/crores when appropriate.
3. Be conversational, warm, and helpful. Do NOT use any emojis — use plain text only.
4. When asked about features the app doesn't have yet, acknowledge it and still provide helpful advice.
5. For investment questions, give educational guidance but remind users that this is not licensed financial advice.
6. For questions about app features (security, UX, account), answer based on the app being a fintech personal finance tracker with bank aggregation via Plaid, AI-powered insights, investment tracking, and cashback rewards.
7. Keep responses concise but informative. Use bullet points and bold text (**bold**) for key numbers.
8. If the user's data is insufficient to answer, say so and suggest what data they should connect.
9. For goal planning, always calculate concrete numbers: monthly savings needed, timeline, gap analysis.
10. Currency: Always use ₹ (Indian Rupee). Use lakh (₹1,00,000) and crore (₹1,00,00,000) for large amounts.
11. The app features: bank connection (Plaid), spending tracking, AI insights, investment tracking (Alpaca), cashback/rewards, savings goals, financial health score.
12. For security questions: The app uses Firebase auth, encrypted data, bank-grade security via Plaid, and does not store bank credentials.`;
};

const MAX_RETRIES = 3;
const BASE_DELAY_MS = 1000;

/**
 * Send a message to Groq with conversation history + financial context.
 * Uses the OpenAI-compatible chat/completions API.
 * Automatically retries on 429 (rate-limit) with exponential backoff.
 * Returns null on any failure so the caller can fall back to the local engine.
 */
export const chatWithGroq = async (userMessage, conversationHistory, systemPrompt) => {
 // Build OpenAI-style messages array: system history current message
 const messages = [{ role: 'system', content: systemPrompt }];

 // Add conversation history (last 10 turns to stay within token limits)
 const recentHistory = conversationHistory.slice(-10);
 for (const msg of recentHistory) {
 messages.push({
 role: msg.role === 'assistant' ? 'assistant' : 'user',
 content: msg.text,
 });
 }

 // Add current user message
 messages.push({ role: 'user', content: userMessage });

 const body = {
 model: GROQ_MODEL,
 messages,
 temperature: 0.7,
 top_p: 0.9,
 max_tokens: 1024,
 };

 for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
 try {
 console.log(`[Groq] sending message${attempt > 0 ? ` (retry ${attempt}/${MAX_RETRIES})` : ''}...`);

 const response = await fetch(GROQ_URL, {
 method: 'POST',
 headers: {
 'Content-Type': 'application/json',
 Authorization: `Bearer ${GROQ_API_KEY}`,
 },
 body: JSON.stringify(body),
 });

 // ── Handle 429 rate-limit with retry ──────────────────────
 if (response.status === 429) {
 if (attempt < MAX_RETRIES) {
 const retryAfter = parseFloat(response.headers.get('retry-after')) * 1000;
 const backoff =
 !isNaN(retryAfter) && retryAfter > 0
 ? retryAfter
 : BASE_DELAY_MS * Math.pow(2, attempt);
 console.warn(`[Groq] rate-limited (429), retrying in ${backoff}ms...`);
 await new Promise((r) => setTimeout(r, backoff));
 continue;
 }

 console.warn('[Groq] rate-limit exceeded after retries, falling back to local engine');
 return null;
 }

 // ── Handle other non-OK statuses ──────────────────────────
 if (!response.ok) {
 const errText = await response.text();
 console.error('[Groq] API error:', response.status, errText);
 return null;
 }

 // ── Success ───────────────────────────────────────────────
 const data = await response.json();
 const text = data?.choices?.[0]?.message?.content;

 if (text) {
 console.log('[Groq] response received ');
 return text.trim();
 }

 console.warn('[Groq] empty response');
 return null;
 } catch (err) {
 console.error('[Groq] error:', err.message);
 return null;
 }
 }

 return null;
};

export default { buildSystemPrompt, chatWithGroq };
