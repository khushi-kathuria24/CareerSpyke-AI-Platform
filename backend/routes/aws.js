const express = require('express');
const { upload, s3 } = require('../utils/s3Storage');
const { TextractClient, DetectDocumentTextCommand, AnalyzeDocumentCommand } = require('@aws-sdk/client-textract');
const { RekognitionClient, DetectFacesCommand, RecognizeCelebritiesCommand } = require('@aws-sdk/client-rekognition');
require('dotenv').config();

const router = express.Router();

// Initialize AI Clients
const textractClient = new TextractClient({
    region: process.env.AWS_REGION || 'us-east-1',
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    }
});

const rekognitionClient = new RekognitionClient({
    region: process.env.AWS_REGION || 'us-east-1',
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    }
});

// Route for single file S3 Upload (Resumes/Profile Pictures)
router.post('/upload', upload.single('file'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
    }

    res.json({
        message: 'File uploaded successfully to S3',
        fileUrl: req.file.location, // S3 URL
        bucket: req.file.bucket,
        key: req.file.key,
    });
});

// Route for AWS Textract (Resume Extraction)
router.post('/analyze-resume', async (req, res) => {
    const { s3Key } = req.body; // Expecting the key from the S3 upload
    if (!s3Key) {
        return res.status(400).json({ error: 'S3 Key is required' });
    }

    try {
        const command = new AnalyzeDocumentCommand({
            Document: {
                S3Object: {
                    Bucket: process.env.AWS_S3_BUCKET_NAME || 'careerspyke-assets',
                    Name: s3Key,
                },
            },
            FeatureTypes: ['TABLES', 'FORMS', 'QUERIES'],
        });

        const data = await textractClient.send(command);

        // Process and return simplified extraction (Mocking for now, can be sophisticated)
        res.json({
            message: 'Textract analysis complete',
            analysis: data,
        });
    } catch (error) {
        console.error('Textract Error:', error);
        res.status(500).json({ error: 'Failed to analyze document with Textract' });
    }
});

// Route for AWS Rekognition (Interview Confidence/Emotion Analysis)
router.post('/analyze-face', async (req, res) => {
    const { s3Key } = req.body;
    if (!s3Key) {
        return res.status(400).json({ error: 'S3 Key is required' });
    }

    try {
        const command = new DetectFacesCommand({
            Image: {
                S3Object: {
                    Bucket: process.env.AWS_S3_BUCKET_NAME || 'careerspyke-assets',
                    Name: s3Key,
                },
            },
            Attributes: ['ALL'],
        });

        const data = await rekognitionClient.send(command);
        res.json({
            message: 'Rekognition analysis complete',
            faces: data.FaceDetails,
        });
    } catch (error) {
        console.error('Rekognition Error:', error);
        res.status(500).json({ error: 'Failed to analyze face with Rekognition' });
    }
});

module.exports = router;
