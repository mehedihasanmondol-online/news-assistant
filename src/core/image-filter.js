/**
 * Filters image candidates based on user settings.
 * @param {Array} candidates - Array of extracted image metadata.
 * @param {Object} settings - User settings for filtering.
 * @returns {Array} - Array of candidates that passed the filter.
 */
export function filterCandidates(candidates, settings) {
  const { minimumWidth, minimumAspectRatio } = settings;

  return candidates.filter(candidate => {
    // 1. Basic URL check
    const url = candidate.originalUrl || candidate.thumbnailUrl;
    if (!url) return false;

    // Reject obvious tracking pixels or tiny icons
    if (url.includes('favicon.ico') || url.includes('tracking_pixel')) {
      return false;
    }

    // Reject known non-images (if URL contains them, though this is basic)
    const lowerUrl = url.toLowerCase();
    if (lowerUrl.includes('.html') || lowerUrl.includes('.php')) {
      // It might be a script returning an image, but it's risky
      // We will rely on dimensions and manual scoring
    }

    const width = parseInt(candidate.width, 10) || 0;
    const height = parseInt(candidate.height, 10) || 0;

    // 2. Minimum Width Check
    // Google fallback results can omit dimensions. Treating an unknown width as
    // acceptable bypasses the user's minimum-width setting and allows small
    // images to be downloaded. Only candidates with verified dimensions pass.
    if (width < minimumWidth) {
      return false;
    }

    // 3. Aspect Ratio Check
    if (width > 0 && height > 0) {
      const aspectRatio = width / height;
      if (aspectRatio < minimumAspectRatio) {
         return false; // Reject based on aspect ratio (e.g. portraits)
      }
    }

    return true;
  });
}
