/**
 * Sanitizes a string to be used as a valid folder or file name.
 * @param {string} name - The raw name.
 * @returns {string} - The sanitized name.
 */
export function sanitizeFilename(name) {
  if (!name) return 'Untitled';
  
  return name
    // Replace invalid characters with space
    .replace(/[<>:"/\\|?*]+/g, ' ')
    // Replace multiple spaces with a single space
    .replace(/\s+/g, ' ')
    // Trim leading and trailing spaces
    .trim()
    // Truncate to avoid path length issues (arbitrary safe limit for folder names)
    .substring(0, 150);
}

/**
 * Gets a file extension from a URL.
 * @param {string} url - The URL.
 * @returns {string} - The file extension (e.g., 'jpg', 'png', 'webp') or empty string.
 */
export function getExtensionFromUrl(url) {
  try {
    const pathname = new URL(url).pathname;
    const match = pathname.match(/\.([a-z0-9]+)$/i);
    return match ? match[1].toLowerCase() : 'jpg'; // fallback to jpg
  } catch (e) {
    return 'jpg';
  }
}
