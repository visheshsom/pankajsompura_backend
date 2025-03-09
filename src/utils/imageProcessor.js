const sharp = require('sharp');
const path = require('path');

class ImageProcessor {
    static async addWatermark(inputBuffer, text = '© Protected') {
        try {
            const image = sharp(inputBuffer);
            const metadata = await image.metadata();
            
            // Create watermark
            const watermark = await sharp({
                text: {
                    text,
                    fontSize: Math.max(metadata.width, metadata.height) * 0.05,
                    rgba: true
                }
            })
            .png()
            .toBuffer();

            // Add watermark to image while maintaining quality
            return await image
                .composite([
                    {
                        input: watermark,
                        gravity: 'center',
                        opacity: 0.3
                    }
                ])
                .jpeg({ quality: 100 }) // Maximum quality
                .toBuffer();
        } catch (error) {
            console.error('Error adding watermark:', error);
            throw error;
        }
    }

    static async createPreviewVersion(inputBuffer) {
        try {
            // Just return the original image buffer without any quality reduction
            return await sharp(inputBuffer)
                .jpeg({ quality: 100 }) // Maximum quality
                .toBuffer();
        } catch (error) {
            console.error('Error creating preview:', error);
            throw error;
        }
    }
}

module.exports = ImageProcessor; 