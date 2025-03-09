const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs').promises;
const ImageProcessor = require('../utils/imageProcessor');

// Middleware to check referer
const checkReferer = (req, res, next) => {
    const referer = req.get('Referer');
    const allowedDomain = process.env.FRONTEND_URL || 'http://localhost:5173';
    
    if (!referer || !referer.startsWith(allowedDomain)) {
        return res.status(403).json({ message: 'Access denied' });
    }
    next();
};

// Get protected image
router.get('/:filename', checkReferer, async (req, res) => {
    try {
        const { filename } = req.params;
        const filePath = path.join(__dirname, '../../uploads/protected', filename);
        
        // Check if file exists
        await fs.access(filePath);
        
        // Read the image
        const imageBuffer = await fs.readFile(filePath);
        
        // Check if this is a source code request (inspect element)
        const userAgent = req.get('User-Agent');
        const isInspectElement = req.get('Sec-Fetch-Dest') === 'document' || 
                                req.get('Sec-Fetch-Mode') === 'navigate';

        if (isInspectElement) {
            // Serve watermarked version for inspect element
            const watermarkedImage = await ImageProcessor.addWatermark(imageBuffer);
            res.set('Content-Type', 'image/jpeg');
            return res.send(watermarkedImage);
        }

        // Serve preview version for normal requests
        const previewImage = await ImageProcessor.createPreviewVersion(imageBuffer);
        res.set('Content-Type', 'image/jpeg');
        res.send(previewImage);
    } catch (error) {
        console.error('Error serving image:', error);
        res.status(404).json({ message: 'Image not found' });
    }
});

module.exports = router; 