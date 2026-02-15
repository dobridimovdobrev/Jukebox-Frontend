/**
 * Compress an image file using canvas before converting to base64.
 * Reduces a 2MB JPEG to ~100-300KB.
 *
 * @param {File} file - The image file to compress
 * @param {object} options - Compression options
 * @param {number} options.maxWidth - Max width in pixels (default 1200)
 * @param {number} options.maxHeight - Max height in pixels (default 1200)
 * @param {number} options.quality - JPEG quality 0-1 (default 0.7)
 * @returns {Promise<string>} - Compressed base64 data URL
 */

// questo migliora molto l'upload delle immagine per il ticket system
const compressImage = (file, { maxWidth = 1200, maxHeight = 1200, quality = 0.7 } = {}) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      let { width, height } = img;

      // scale down if larger than max dimensions
      if (width > maxWidth || height > maxHeight) {
        const ratio = Math.min(maxWidth / width, maxHeight / height);
        width = Math.round(width * ratio);
        height = Math.round(height * ratio);
      }

      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0, width, height);

      const compressed = canvas.toDataURL("image/jpeg", quality);
      resolve(compressed);
    };
    img.onerror = () => reject(new Error("Failed to load image"));
    img.src = URL.createObjectURL(file);
  });
};

export default compressImage;
