// AI Service — Groq-powered intent detection and response generation
// Falls back to deterministic responses if GROQ_API_KEY is not configured
//
// Architecture: Intent → Context Fetch → Response Generation
// This keeps LLM calls minimal and prevents hallucination by grounding in real data.

import Groq from 'groq-sdk';
import { config } from 'dotenv';
config();

let groq = null;
let groqAvailable = false;

try {
  if (process.env.GROQ_API_KEY) {
    groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
    groqAvailable = true;
    console.log('✅ Groq AI: configured');
  } else {
    console.warn('⚠️  Groq AI: No API key. Using deterministic fallback.');
  }
} catch (e) {
  console.error('Groq init error:', e.message);
}

// Supported intents
const INTENTS = [
  'queue_status',
  'waiting_time', 
  'recommended_arrival',
  'procurement_status',
  'payment_status',
  'general_help',
];

/**
 * Detect intent from farmer's message
 */
function detectIntent(message) {
  const msg = message.toLowerCase();
  
  if (/payment|paisa|paise|rupay|kitna mila|payment kab|paise kab/.test(msg)) return 'payment_status';
  if (/kab jaana|kab nikalna|mandi kab|leave|departure|nikal|jaanu kab|jana/.test(msg)) return 'recommended_arrival';
  if (/wait|kitna time|kitni der|late|delay|time lagega|der/.test(msg)) return 'waiting_time';
  if (/complete|hua kya|ho gaya|procurement status|fasal/.test(msg)) return 'procurement_status';
  if (/token|number|kitne aage|ahead|queue|mera number|kab aayega|meri baari/.test(msg)) return 'queue_status';
  return 'general_help';
}

/**
 * Build farmer-friendly response using Groq or deterministic fallback
 */
export async function generateAIResponse(message, context = {}) {
  const intent = detectIntent(message);
  
  if (groqAvailable) {
    try {
      return await generateGroqResponse(message, intent, context);
    } catch (e) {
      console.warn('Groq API error, falling back:', e.message);
    }
  }
  
  return { reply: generateDeterministicResponse(intent, context), intent };
}

/**
 * Groq-powered response with structured context
 * Never sends private or unnecessary data to LLM
 */
async function generateGroqResponse(message, intent, context) {
  const {
    farmerName = 'Farmer',
    farmerToken = 247,
    currentToken = 213,
    farmersAhead = 34,
    estimatedWait = 51,
    crop = 'Wheat',
    mandiName = 'Jaipur Procurement Centre',
    amount = 26400,
    paymentStatus = 'Processing',
    procurementStatus = 'IN_QUEUE',
    arrivalTime = null,
    departureTime = null,
  } = context;

  const systemPrompt = `You are Bhumi Sahayak, an AI assistant for Indian farmers using the Bhumi Sahyog procurement platform.

RULES:
1. Respond concisely in the SAME language as the user (Hindi/Hinglish/English)
2. Use ONLY the data provided below — never invent or guess data
3. Keep responses under 5 lines — farmers prefer brief answers
4. Be warm and helpful — address farmer respectfully
5. For Hindi responses, use simple vocabulary (not complex Sanskrit words)
6. If data is missing, say so clearly

FARMER DATA (use ONLY this):
- Farmer: ${farmerName}
- Token: T-${farmerToken}
- Current token at mandi: T-${currentToken}
- Farmers ahead: ${farmersAhead}
- Estimated wait: ~${estimatedWait} minutes
- Crop: ${crop}
- Mandi: ${mandiName}
- Procurement amount: ₹${Number(amount).toLocaleString('en-IN')}
- Payment status: ${paymentStatus}
- Procurement status: ${procurementStatus}
${arrivalTime ? `- Recommended arrival time: ${arrivalTime}` : ''}
${departureTime ? `- Recommended departure time: ${departureTime}` : ''}

INTENT DETECTED: ${intent}`;

  const modelToUse = process.env.GROQ_MODEL || 'openai/gpt-oss-120b';

  const chat = await groq.chat.completions.create({
    model: modelToUse,
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: message },
    ],
    max_tokens: 150,
    temperature: 0.3, // Lower temperature for factual responses
  });

  return {
    reply: chat.choices[0]?.message?.content || generateDeterministicResponse(intent, context),
    intent,
    model: 'llama3-70b-8192',
  };
}

/**
 * Deterministic fallback — works without any API key
 * Covers all common farmer queries
 */
function generateDeterministicResponse(intent, context) {
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
    arrivalTime = null,
    departureTime = null,
  } = context;

  const amtFormatted = `₹${Number(amount).toLocaleString('en-IN')}`;

  const responses = {
    queue_status: 
      `Aapka token T-${farmerToken} hai.\n` +
      `Abhi T-${currentToken} chal raha hai.\n` +
      `Aapke aage ${farmersAhead} token hain.\n` +
      `Estimated wait: ~${estimatedWait} minute.`,

    waiting_time:
      `Aapka estimated wait time lagbhag ${estimatedWait} minute hai.\n` +
      `${farmersAhead} kisan aapke aage hain.\n` +
      `Average processing: 1.5 min/farmer.`,

    recommended_arrival:
      arrivalTime
        ? `Aapko mandi ${arrivalTime} tak pahunchna chahiye.\n` +
          `${departureTime ? `Ghar se ${departureTime} tak nikalna sahi rahega.\n` : ''}` +
          `(Travel time ~25 min + queue wait ${estimatedWait} min)`
        : `Estimated wait ${estimatedWait} min hai.\nTravel time ~25 min jod ke jald nikalna sahi rahega.`,

    procurement_status:
      `Aapka procurement status: ${
        procurementStatus === 'IN_QUEUE' ? 'Queue mein hai' :
        procurementStatus === 'PROCESSING' ? 'Processing ho raha hai' :
        procurementStatus === 'COMPLETED' ? 'Complete ho gaya ✓' : procurementStatus
      }.\n` +
      `Fasal: ${crop}\nMandi: ${mandiName}`,

    payment_status:
      `Aapka procurement amount ${amtFormatted} hai.\n` +
      `Payment status: ${paymentStatus}\n` +
      (paymentStatus === 'PAID' 
        ? '✅ Payment aapke account mein transfer ho chuki hai.'
        : paymentStatus === 'PROCESSING'
          ? '⏳ Payment process ho rahi hai. Jald transfer hogi.'
          : '⏳ Payment pending hai. Procurement complete hone ke baad process hogi.'),

    general_help:
      'Namaste! Main Bhumi Sahayak hoon.\n\nAap mujhse poochh sakte hain:\n' +
      '• "Mera token kab aayega?"\n' +
      '• "Kitne log mere aage hain?"\n' +
      '• "Mandi kab jaana chahiye?"\n' +
      '• "Meri payment kab milegi?"\n' +
      '• "Procurement complete hua kya?"',
  };

  return responses[intent] || responses.general_help;
}

export { detectIntent, groqAvailable };
