import { db } from '../db/index.js';
import { applications, jobs, users, userSkills, skills } from '../db/schema.js';
import { eq, and, inArray } from 'drizzle-orm';

// Apply to a job
export const applyToJob = async (req, res) => {
  try {
    const candidateId = req.user.id;
    const { jobId } = req.params;

    // Check if user is a candidate
    if (req.user.role !== 'candidate') {
      return res.status(403).json({ error: 'Only candidates can apply to jobs' });
    }

    // Check if job exists
    const [job] = await db
      .select()
      .from(jobs)
      .where(and(eq(jobs.id, parseInt(jobId)), eq(jobs.isActive, true)))
      .limit(1);

    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }

    // Check if already applied
    const [existingApplication] = await db
      .select()
      .from(applications)
      .where(and(
        eq(applications.jobId, parseInt(jobId)),
        eq(applications.candidateId, candidateId)
      ))
      .limit(1);

    if (existingApplication) {
      return res.status(400).json({ error: 'You have already applied to this job' });
    }

    // Create application
    const [newApplication] = await db
      .insert(applications)
      .values({
        jobId: parseInt(jobId),
        candidateId,
        status: 'pending',
      })
      .returning();

    res.status(201).json({
      message: 'Application submitted successfully',
      application: newApplication,
    });
  } catch (error) {
    console.error('Apply to job error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get applications for a job (recruiter only)
export const getJobApplications = async (req, res) => {
  try {
    const recruiterId = req.user.id;
    const { jobId } = req.params;

    // Check if user is a recruiter
    if (req.user.role !== 'recruiter') {
      return res.status(403).json({ error: 'Only recruiters can view applications' });
    }

    // Check if job exists and belongs to recruiter
    const [job] = await db
      .select()
      .from(jobs)
      .where(and(
        eq(jobs.id, parseInt(jobId)),
        eq(jobs.recruiterId, recruiterId)
      ))
      .limit(1);

    if (!job) {
      return res.status(404).json({ error: 'Job not found or you do not have permission' });
    }

    // Get applications with candidate details
    const jobApplications = await db
      .select({
        id: applications.id,
        status: applications.status,
        createdAt: applications.createdAt,
        updatedAt: applications.updatedAt,
        candidate: {
          id: users.id,
          name: users.name,
          email: users.email,
          phone: users.phone,
          location: users.location,
          bio: users.bio,
          cvUrl: users.cvUrl,
        },
      })
      .from(applications)
      .innerJoin(users, eq(applications.candidateId, users.id))
      .where(eq(applications.jobId, parseInt(jobId)))
      .orderBy(applications.createdAt);

    // Get skills for each candidate
    const applicationsWithSkills = await Promise.all(
      jobApplications.map(async (application) => {
        const candidateSkills = await db
          .select({
            id: skills.id,
            name: skills.name,
          })
          .from(userSkills)
          .innerJoin(skills, eq(userSkills.skillId, skills.id))
          .where(eq(userSkills.userId, application.candidate.id));

        return {
          ...application,
          candidate: {
            ...application.candidate,
            skills: candidateSkills,
          },
        };
      })
    );

    res.json(applicationsWithSkills);
  } catch (error) {
    console.error('Get job applications error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get all applications for recruiter's jobs
export const getMyJobApplications = async (req, res) => {
  try {
    const recruiterId = req.user.id;

    // Check if user is a recruiter
    if (req.user.role !== 'recruiter') {
      return res.status(403).json({ error: 'Only recruiters can view applications' });
    }

    // Get all jobs by this recruiter
    const recruiterJobs = await db
      .select({ id: jobs.id })
      .from(jobs)
      .where(eq(jobs.recruiterId, recruiterId));

    const jobIds = recruiterJobs.map((job) => job.id);

    if (jobIds.length === 0) {
      return res.json([]);
    }

    // Get applications for all recruiter's jobs
    const allApplicationsFixed = await db
      .select({
        id: applications.id,
        status: applications.status,
        createdAt: applications.createdAt,
        updatedAt: applications.updatedAt,
        job: {
          id: jobs.id,
          title: jobs.title,
          company: jobs.company,
        },
        candidate: {
          id: users.id,
          name: users.name,
          email: users.email,
          phone: users.phone,
          location: users.location,
          bio: users.bio,
          cvUrl: users.cvUrl,
        },
      })
      .from(applications)
      .innerJoin(jobs, eq(applications.jobId, jobs.id))
      .innerJoin(users, eq(applications.candidateId, users.id))
      .where(inArray(applications.jobId, jobIds))
      .orderBy(applications.createdAt);

    // Get skills for each candidate
    const applicationsWithSkills = await Promise.all(
      allApplicationsFixed.map(async (application) => {
        const candidateSkills = await db
          .select({
            id: skills.id,
            name: skills.name,
          })
          .from(userSkills)
          .innerJoin(skills, eq(userSkills.skillId, skills.id))
          .where(eq(userSkills.userId, application.candidate.id));

        return {
          ...application,
          candidate: {
            ...application.candidate,
            skills: candidateSkills,
          },
        };
      })
    );

    res.json(applicationsWithSkills);
  } catch (error) {
    console.error('Get my job applications error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get candidate's applications
export const getMyApplications = async (req, res) => {
  try {
    const candidateId = req.user.id;

    // Check if user is a candidate
    if (req.user.role !== 'candidate') {
      return res.status(403).json({ error: 'Only candidates can view their applications' });
    }

    // Get applications with job details
    const myApplications = await db
      .select({
        id: applications.id,
        status: applications.status,
        createdAt: applications.createdAt,
        updatedAt: applications.updatedAt,
        job: {
          id: jobs.id,
          title: jobs.title,
          company: jobs.company,
          location: jobs.location,
          salary: jobs.salary,
          employmentType: jobs.employmentType,
        },
      })
      .from(applications)
      .innerJoin(jobs, eq(applications.jobId, jobs.id))
      .where(eq(applications.candidateId, candidateId))
      .orderBy(applications.createdAt);

    res.json(myApplications);
  } catch (error) {
    console.error('Get my applications error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Update application status (recruiter only)
export const updateApplicationStatus = async (req, res) => {
  try {
    const recruiterId = req.user.id;
    const { applicationId } = req.params;
    const { status } = req.body;

    // Check if user is a recruiter
    if (req.user.role !== 'recruiter') {
      return res.status(403).json({ error: 'Only recruiters can update application status' });
    }

    // Validate status
    if (!['pending', 'accepted', 'rejected'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status. Must be pending, accepted, or rejected' });
    }

    // Get application and verify it belongs to recruiter's job
    const [application] = await db
      .select({
        application: applications,
        job: jobs,
      })
      .from(applications)
      .innerJoin(jobs, eq(applications.jobId, jobs.id))
      .where(and(
        eq(applications.id, parseInt(applicationId)),
        eq(jobs.recruiterId, recruiterId)
      ))
      .limit(1);

    if (!application) {
      return res.status(404).json({ error: 'Application not found or you do not have permission' });
    }

    // Update application status
    const [updatedApplication] = await db
      .update(applications)
      .set({
        status,
        updatedAt: new Date(),
      })
      .where(eq(applications.id, parseInt(applicationId)))
      .returning();

    res.json({
      message: 'Application status updated successfully',
      application: updatedApplication,
    });
  } catch (error) {
    console.error('Update application status error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

