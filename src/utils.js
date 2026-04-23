// Calculate priority score and assign priority level
export function calculatePriority(candidate) {
  const score = 
    0.3 * candidate.assignment_score +
    0.25 * candidate.video_score +
    0.2 * candidate.ats_score +
    0.15 * candidate.github_score +
    0.1 * candidate.communication_score;

  let priority;
  if (score > 80) priority = 'P0';
  else if (score > 70) priority = 'P1';
  else if (score > 60) priority = 'P2';
  else priority = 'P3';

  return { score: Math.round(score), priority };
}

// Get priority color
export function getPriorityColor(priority) {
  switch (priority) {
    case 'P0': return 'text-green-400';
    case 'P1': return 'text-yellow-400';
    case 'P2': return 'text-orange-400';
    case 'P3': return 'text-red-400';
    default: return 'text-gray-400';
  }
}

// Get priority bg color
export function getPriorityBgColor(priority) {
  switch (priority) {
    case 'P0': return 'bg-green-500';
    case 'P1': return 'bg-yellow-500';
    case 'P2': return 'bg-orange-500';
    case 'P3': return 'bg-red-500';
    default: return 'bg-gray-500';
  }
}