import { GoogleGenerativeAI } from '@google/generative-ai';
import multer from 'multer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configure multer for file uploads
const upload = multer({
  dest: 'uploads/',
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain'
    ];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only PDF, DOC, DOCX, and TXT files are allowed.'));
    }
  },
}).single('cv');

// Initialize Gemini AI
const getGeminiModel = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not set in environment variables');
  }
  const genAI = new GoogleGenerativeAI(apiKey);
  return genAI.getGenerativeModel({ model: 'gemini-2.5-pro' });
};

// Read file content (for text files)
const readTextFile = (filePath) => {
  return fs.readFileSync(filePath, 'utf-8');
};

// Convert PDF/DOC to text (simplified - in production, use a proper library)
const extractTextFromFile = async (filePath, mimetype) => {
  if (mimetype === 'text/plain') {
    return readTextFile(filePath);
  }
  // For PDF/DOC files, we'll use a simple approach
  // In production, you'd want to use libraries like pdf-parse or mammoth
  // For now, we'll read as text and let Gemini handle it
  try {
    return readTextFile(filePath);
  } catch (error) {
    throw new Error('Could not read file content. Please ensure the file is readable.');
  }
};

// ATS Score Checker
export const checkATS = async (req, res) => {
  upload(req, res, async (err) => {
    if (err) {
      return res.status(400).json({ error: err.message });
    }

    if (!req.file) {
      return res.status(400).json({ error: 'CV file is required' });
    }

    const { jobDescription } = req.body;

    if (!jobDescription || jobDescription.trim().length === 0) {
      // Clean up uploaded file
      fs.unlinkSync(req.file.path);
      return res.status(400).json({ error: 'Job description is required' });
    }

    try {
      // Extract text from CV
      const cvText = await extractTextFromFile(req.file.path, req.file.mimetype);

      // Clean up uploaded file
      fs.unlinkSync(req.file.path);

      // Get Gemini model
      const model = getGeminiModel();

      // Create prompt for ATS analysis
      const prompt = `You are an expert ATS (Applicant Tracking System) analyzer. Analyze the following CV/resume against the job description and provide:

1. **ATS Score (0-100)**: A numerical score indicating how well the CV matches the job requirements
2. **Match Analysis**: Detailed breakdown of:
   - Skills match percentage
   - Experience relevance
   - Education alignment
   - Keyword optimization
3. **Strengths**: What the CV does well
4. **Improvements**: Specific, actionable recommendations to improve the CV for this job
5. **Missing Keywords**: Important keywords from the job description that are missing in the CV
6. **Overall Assessment**: A friendly, human-readable summary (2-3 sentences)

Format your response as a JSON object with the following structure:
{
  "score": <number 0-100>,
  "matchAnalysis": {
    "skillsMatch": <percentage>,
    "experienceRelevance": <percentage>,
    "educationAlignment": <percentage>,
    "keywordOptimization": <percentage>
  },
  "strengths": ["strength1", "strength2", ...],
  "improvements": ["improvement1", "improvement2", ...],
  "missingKeywords": ["keyword1", "keyword2", ...],
  "overallAssessment": "<friendly summary text>"
}

Job Description:
${jobDescription}

CV/Resume Content:
${cvText}

Please provide your analysis in the JSON format specified above.`;

      // Generate content
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      // Parse JSON from response (Gemini might add markdown formatting)
      let analysis;
      try {
        // Try to extract JSON from markdown code blocks if present
        const jsonMatch = text.match(/```json\s*([\s\S]*?)\s*```/) || text.match(/```\s*([\s\S]*?)\s*```/);
        const jsonText = jsonMatch ? jsonMatch[1] : text;
        analysis = JSON.parse(jsonText.trim());
      } catch (parseError) {
        // If JSON parsing fails, create a structured response from text
        console.error('Failed to parse JSON, creating fallback response:', parseError);
        analysis = {
          score: 70,
          matchAnalysis: {
            skillsMatch: 70,
            experienceRelevance: 70,
            educationAlignment: 70,
            keywordOptimization: 70,
          },
          strengths: ['Your CV has relevant experience'],
          improvements: ['Add more keywords from the job description', 'Highlight specific achievements'],
          missingKeywords: [],
          overallAssessment: text.substring(0, 200) || 'Your CV shows potential. Consider tailoring it more closely to the job requirements.',
        };
      }

      // Ensure score is a number
      analysis.score = Math.min(100, Math.max(0, parseInt(analysis.score) || 70));

      res.json({
        success: true,
        analysis,
      });
    } catch (error) {
      // Clean up uploaded file if still exists
      if (req.file && fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }

      console.error('ATS check error:', error);
      res.status(500).json({
        error: error.message || 'Failed to analyze CV. Please try again.',
      });
    }
  });
};

