// AI Service — Bhumi Sahayak
// Calls backend /api/ai/chat endpoint
// Falls back to deterministic responses if backend is unavailable

const API_BASE = '/api';

/**
 * Send a message to Bhumi Sahayak AI assistant
 * @param {string} message - Farmer's question (Hindi/Hinglish/English)
 * @param {object} context - Current procurement + queue data
 * @param {string} farmerId - Farmer's ID
 * @returns {Promise<{reply: string, intent: string, error?: string}>}
 */
export async function sendMessage(message, context = {}, farmerId = null) {
  try {
    const response = await fetch(`${API_BASE}/ai/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, context, farmerId }),
      signal: AbortSignal.timeout(10000), // 10 second timeout
    });
    
    if (!response.ok) throw new Error('Server error');
    
    const data = await response.json();
    return { reply: data.reply, intent: data.intent };
  } catch (error) {
    // Fallback to deterministic responses when backend unavailable
    console.warn('AI backend unavailable, using deterministic fallback:', error.message);
    return deterministicFallback(message, context);
  }
}

/**
 * Deterministic intent-based fallback
 * Works without Groq API or backend connectivity
 */
function deterministicFallback(message, context) {
  const msg = message.toLowerCase();
  
  // Detect intent from keywords
  const intent = detectIntent(msg);
  
  const {
    farmerToken = 247,
    currentToken = 213,
    farmersAhead = 34,
    estimatedWait = 51,
    crop = 'Wheat',
    mandiName = 'Jaipur Procurement Centre',
    amount = 26400,
    paymentStatus = 'Processing',
    procurementStatus = 'IN_QUEUE',
    departureTime = null,
    arrivalTime = null,
  } = context;

  const tokenStr = `T-${farmerToken}`;
  const currentStr = `T-${currentToken}`;

  const responses = {
    queue_status: `Aapka token ${tokenStr} hai.\nAbhi ${currentStr} chal raha hai.\nAapke aage ${farmersAhead} token hain.\nCurrent processing speed ke hisaab se lagbhag ${estimatedWait} minute ka wait hai.`,
    
    waiting_time: `Aapka estimated wait time lagbhag ${estimatedWait} minute hai.\n${farmersAhead} kisan aapke aage hain.\nAverage processing rate 1.5 min/farmer hai.`,
    
    recommended_arrival: arrivalTime 
      ? `Aapko mandi ${arrivalTime} tak pahunchna chahiye.\nAbhi mandi jaana sahi rahega agar aap ${Math.max(0, estimatedWait - 25)} minute baad nikaltey hain.`
      : `Aapka estimated wait ${estimatedWait} minute hai. Travel time ~25 minute maanke, aap abse ${Math.max(0, estimatedWait - 25)} minute baad nikal sakte hain.`,
    
    procurement_status: `Aapka procurement status: ${procurementStatus === 'IN_QUEUE' ? 'Queue mein hai' : procurementStatus === 'COMPLETED' ? 'Complete ho gaya' : procurementStatus}.\nFasal: ${crop}\nMandi: ${mandiName}`,
    
    payment_status: `Aapki payment ₹${amount?.toLocaleString('en-IN')} hai.\nPayment status: ${paymentStatus}\nReference: PROC-2026-00472`,
    
    general_help: `Namaste! Main Bhumi Sahayak hoon. Aap mujhse puch sakte hain:\n• "Mera token kab aayega?"\n• "Kitne log mere aage hain?"\n• "Mandi kab jaana hai?"\n• "Meri payment kab milegi?"\n• "Procurement complete hua kya?"`,
  };

  return {
    reply: responses[intent] || responses.general_help,
    intent,
  };
}

function detectIntent(message) {
  if (/payment|paisa|paise|rupay|kitna mila|payment kab/.test(message)) return 'payment_status';
  if (/kab jaana|kab nikalna|mandi kab|leave|departure|nikal/.test(message)) return 'recommended_arrival';
  if (/wait|kitna time|kitni der|late|delay|time lagega/.test(message)) return 'waiting_time';
  if (/complete|hua kya|ho gaya|status|procurement/.test(message)) return 'procurement_status';
  if (/token|number|kitne aage|ahead|queue|mera number|kab aayega/.test(message)) return 'queue_status';
  return 'general_help';
}

export { detectIntent };
