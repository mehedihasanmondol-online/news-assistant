/**
 * Scores an image candidate based on its properties.
 * @param {Object} candidate - The extracted image metadata.
 * @param {Object} settings - User settings used to prioritize the chosen format.
 * @returns {number} - The score of the image (higher is better).
 */
export function scoreImage(candidate, settings = {}) {
  let score = 0;

  const width = parseInt(candidate.width, 10) || 0;
  const height = parseInt(candidate.height, 10) || 0;
  const url = candidate.originalUrl || candidate.thumbnailUrl || '';

  // Resolution bonuses
  if (width >= 2000) score += 30;
  else if (width >= 1600) score += 20;
  else if (width >= 1200) score += 10;
  else if (width >= 800) score += 5;

  // Aspect ratio and landscape orientation
  if (width > 0 && height > 0) {
    const aspectRatio = width / height;
    if (aspectRatio > 1.2) {
      score += 20; // Landscape
    } else if (aspectRatio < 0.8) {
      score -= 10; // Portrait (deprioritize for news usually)
    }

    if (aspectRatio >= 1.6) score += 15; // Wide landscape

    // Prefer images nearest to the format selected in Settings without
    // excluding useful alternatives when Google returns few exact matches.
    const preferred = parseAspectRatio(settings.preferredAspectRatio);
    if (preferred) {
      const difference = Math.abs(aspectRatio - preferred) / preferred;
      score += Math.max(0, Math.round(30 * (1 - difference)));
    }
  }

  // File type bonuses
  const lowerUrl = url.toLowerCase();
  if (lowerUrl.includes('.jpg') || lowerUrl.includes('.jpeg') || lowerUrl.includes('.webp')) {
    score += 5;
  }
  if (lowerUrl.includes('.png')) {
    score += 2;
  }
  if (lowerUrl.includes('.gif') || lowerUrl.includes('.svg')) {
    score -= 20; // Likely icons/animations
  }

  // Bonus if original URL is present and not a data URI
  if (candidate.originalUrl && !candidate.originalUrl.startsWith('data:')) {
    score += 20;
  }

  return score;
}

function parseAspectRatio(value) {
  if (!value || value === 'any') return null;
  const [width, height] = String(value).split(':').map(Number);
  return width > 0 && height > 0 ? width / height : null;
}
