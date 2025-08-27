const express = require('express');
const router = express.Router();
const db = require('../models');
const Job = db.Job;
const CompanyProfile = db.CompanyProfile;
const { searchJobsByQuery, searchByLocation } = require('../controllers/jobSearchService');

// Model association is defined in the model file


const CATEGORIES_TAGS = {
  "Information Technology": [
    "it", "software", "developer", "engineer", "technology", "java", "python", "cloud",
    "data", "frontend", "backend", "react", "nodejs", "ai", "ml", "devops", "fullstack", "cybersecurity"
  ],

  "Marketing & Sales": [
    "marketing", "sales", "seo", "content", "branding", "digital", "customer", "lead",
    "campaign", "ads", "email", "social", "market research", "copywriting", "crm"
  ],

  "Finance & Accounting": [
    "finance", "accounting", "audit", "tax", "budget", "investment", "ledger", "payroll",
    "compliance", "invoicing", "financial analysis", "forecasting", "bookkeeping"
  ],

  "Human Resources": [
    "hr", "recruitment", "talent", "training", "employee", "relations", "onboarding",
    "payroll", "benefits", "performance", "hrms", "retention"
  ],

  "Business & Consulting": [
    "business", "consulting", "strategy", "management", "operations", "project",
    "analysis", "planning", "market research", "client", "solution design", "pmo"
  ],

  "Design & Creative": [
    "design", "creative", "graphics", "ui", "ux", "illustrator", "photoshop",
    "branding", "motion", "animation", "figma", "adobe", "wireframe", "prototyping"
  ],

  "Legal & Compliance": [
    "legal", "compliance", "contract", "law", "risk", "regulations", "policy",
    "attorney", "litigation", "intellectual property", "corporate law", "legal research"
  ],

  "Healthcare & Medical": [
    "healthcare", "medical", "nurse", "doctor", "clinic", "pharma", "patient",
    "public health", "hospital", "clinical", "lab", "radiology", "diagnosis",
    "physiotherapy", "medical assistant", "health informatics", "epidemiology", "emt", "biotech"
  ]
};
const normalize = (str) => str.toLowerCase().trim();

function assignCategory(tags) {
  if (!Array.isArray(tags) || tags.length === 0) return null;

  const normalizedTags = tags.map(normalize);
  let bestCategory = null;
  let maxMatches = 0;

  for (const [category, keywords] of Object.entries(CATEGORIES_TAGS)) {
    const normalizedKeywords = keywords.map(normalize);
    const matches = normalizedTags.filter(tag => normalizedKeywords.includes(tag)).length;

    if (matches > maxMatches) {
      maxMatches = matches;
      bestCategory = category;
    }
  }

  return maxMatches > 0 ? bestCategory : null;
}

// Create a new job
router.post('/', async (req, res) => {
  const {
  title, description, location, type, salary,
  deadline, skills, status, company_id, tags,
  benefits, education ,experience     
} = req.body;

  // Assign category
  const category = assignCategory(tags);

  try {
   const newJob = await Job.create({
  company_id,
  title,
  description,
  location,
  type,
 experience_min: experience ? Number(experience) : 0,
  salary_range: salary,
  deadline,                 // ✅
  benefits,
  education,   
  status: 'open',
  skills: JSON.stringify(skills || []),  // <--- stringified
  tags: JSON.stringify(tags || []),      // <--- stringified
  category
});


    res.status(201).json({ success: true, jobId: newJob.id, category });
  } catch (err) {
    console.error('Sequelize Insert Error:', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});


// Model association is defined in the model file

// Search jobs by query
router.get('/search', async (req, res) => {
  const query = req.query.q || '';
  try {
    const results = await searchJobsByQuery(query);
    res.json({ success: true, jobs: results });
  } catch (err) {
    console.error('Search Error:', err.message);
    res.status(500).json({ success: false, message: 'Search failed.' });
  }
});

// Get job by ID
router.get('/:id', async (req, res) => {
  const jobId = req.params.id;

  try {
    const job = await Job.findByPk(jobId, {
      include: [{
        model: CompanyProfile,
        as: 'company',
        attributes: [
          'companyName',
          'logo',
          'website',
          'description',
          'industry',
          'location'
        ]
      }]
    });

    if (!job) {
      return res.status(404).json({ success: false, error: 'Job not found' });
    }

    const jobData = job.toJSON();

    // Parse TEXT → JSON
    try {
      if (typeof jobData.skills === 'string') {
  try {
    jobData.skills = JSON.parse(jobData.skills);
  } catch {
    jobData.skills = [];
  }
}

    } catch { jobData.skills = []; }

    try {
      if (typeof jobData.tags === 'string') {
  try {
    jobData.tags = JSON.parse(jobData.tags);
  } catch {
    jobData.tags = [];
  }
}

     
    } catch { jobData.tags = []; }

    res.json({ success: true, job: jobData });
  } catch (err) {
    console.error('Error fetching job:', err.message);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});
// Get jobs by company
router.get('/company/:companyId', async (req, res) => {
  const { companyId } = req.params;

  try {
    const jobs = await Job.findAll({
      where: { company_id: companyId },
      order: [
        // Open jobs first, then closed
        ['status', 'ASC'],
        ['deadline', 'ASC'] // Optional: earliest deadline first
      ]
    });

    res.json({ success: true, jobs });
  } catch (err) {
    console.error('Error fetching jobs:', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Update job by ID
router.put('/:jobId', async (req, res) => {
  const { jobId } = req.params;
  const {
    title, description, location, type, salary,
    deadline, skills, status, tags, benefits, education, experience
  } = req.body;

  try {
    const job = await Job.findByPk(jobId);
    if (!job) return res.status(404).json({ success: false, error: 'Job not found' });

    const category = assignCategory(tags || JSON.parse(job.tags || '[]'));

    await job.update({
      title: title || job.title,
      description: description || job.description,
      location: location || job.location,
      type: type || job.type,
      experience_min: experience !== undefined ? Number(experience) : job.experience_min,
      salary_range: salary || job.salary_range,
      deadline: deadline || job.deadline,
      benefits: benefits || job.benefits,
      education: education || job.education,
      status: status || job.status,
      skills: skills ? JSON.stringify(skills) : job.skills,
      tags: tags ? JSON.stringify(tags) : job.tags,
      category
    });

    res.json({ success: true, job });
  } catch (err) {
    console.error('Error updating job:', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});
// Delete job by ID
router.delete('/:jobId', async (req, res) => {
  const { jobId } = req.params;
  try {
    const job = await Job.findByPk(jobId);
    if (!job) return res.status(404).json({ success: false, error: 'Job not found' });
    
    await job.destroy();
    res.json({ success: true, message: 'Job deleted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});
// Search jobs by location
router.get("/location/search", searchByLocation);

module.exports = router;
