// predictionService.js
// Enhanced with Multi-Factor ML Model & Queuing Dynamics
import { predictWaitingTimeML, CROP_PROFILES, WEATHER_CONDITIONS, DAY_FACTORS } from './mlWaitingModel';

/**
 * Estimate wait time using ML model
 * Takes into account historical arrivals, weighbridges, crop, weather, staffing
 */
export function estimateWaitTime(farmersAhead, avgProcessingMinutes = 1.5, extraParams = {}) {
  if (farmersAhead <= 0) return 0;
  
  const mlResult = predictWaitingTimeML({
    farmersAhead,
    baseAvgMinutes: avgProcessingMinutes,
    ...extraParams,
  });

  return mlResult.estimatedMinutes;
}

/**
 * Full ML Wait Time Details with transparent breakdown
 */
export function getDetailedMLPrediction(farmersAhead, avgProcessingMinutes = 1.5, extraParams = {}) {
  return predictWaitingTimeML({
    farmersAhead,
    baseAvgMinutes: avgProcessingMinutes,
    ...extraParams,
  });
}

/**
 * Calculate farmers ahead in queue
 */
export function calculateFarmersAhead(farmerToken, currentToken) {
  const ahead = farmerToken - currentToken - 1;
  return Math.max(0, ahead);
}

/**
 * Calculate recommended arrival and departure times
 */
export function calculateRecommendedArrival(
  estimatedWaitMinutes,
  travelMinutes = 25,
  now = new Date(),
  lang = typeof window !== 'undefined' ? (localStorage.getItem('bhumi_lang') || 'en') : 'en'
) {
  const minutesToDepart = Math.max(0, estimatedWaitMinutes - travelMinutes);
  const departureTime = new Date(now.getTime() + minutesToDepart * 60000);
  const arrivalTime = new Date(now.getTime() + estimatedWaitMinutes * 60000);
  
  let explanation;
  if (lang === 'hi') {
    if (estimatedWaitMinutes <= 0) {
      explanation = 'आपका टोकन आ चुका है! कृपया तुरंत मंडी पहुंचें।';
    } else if (minutesToDepart <= 5) {
      explanation = `घर से निकलने का समय हो गया है। यात्रा समय: ~${travelMinutes} मिनट।`;
    } else {
      explanation = `AI ने आने वाली भीड़, मौसम और वे-ब्रिज गति के आधार पर समय निर्धारित किया है।`;
    }
  } else {
    if (estimatedWaitMinutes <= 0) {
      explanation = 'Your turn is now! Please arrive at the mandi immediately.';
    } else if (minutesToDepart <= 5) {
      explanation = `Time to leave home. Estimated travel time: ~${travelMinutes} min.`;
    } else {
      explanation = `Optimal departure based on queue velocity, weighbridge throughput, and weather.`;
    }
  }
  
  return { departureTime, arrivalTime, explanation };
}

/**
 * Urgency level
 */
export function getUrgencyLevel(farmersAhead) {
  if (farmersAhead <= 5) return 'critical';
  if (farmersAhead <= 15) return 'urgent';
  if (farmersAhead <= 30) return 'moderate';
  return 'comfortable';
}

/**
 * Format minutes into human-readable duration
 */
export function formatWaitTime(minutes) {
  if (minutes <= 0) return 'Your turn now';
  if (minutes < 60) return `~${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (mins === 0) return `~${hours} hr`;
  return `~${hours} hr ${mins} min`;
}

/**
 * Format time to 12-hour format
 */
export function formatTime(date) {
  return date.toLocaleTimeString('en-IN', { 
    hour: '2-digit', 
    minute: '2-digit',
    hour12: true 
  });
}

export { CROP_PROFILES, WEATHER_CONDITIONS, DAY_FACTORS };
