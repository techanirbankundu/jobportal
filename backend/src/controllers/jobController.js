import { db } from '../db/index.js';
import { jobs, users, skills, jobSkills, userSkills } from '../db/schema.js';
import { eq, and, desc, sql, inArray, like, or as orCondition } from 'drizzle-orm';

// Create a new job (recruiter only)
export const createJob = async (req, res) => {
  try {
    const recruiterId = req.user.id;
    const { title, description, company, location, salary, employmentType, skillIds } = req.body;

    // Validation
    if (!title || !description || !company || !location) {
      return res.status(400).json({ error: 'Title, description, company, and location are required' });
    }

    // Create job
    const [newJob] = await db
      .insert(jobs)
      .values({
        title,
        description,
        company,
        location,
        salary,
        employmentType,
        recruiterId,
      })
      .returning();

    // Add skills to job if provided
    if (skillIds && Array.isArray(skillIds) && skillIds.length > 0) {
      const jobSkillValues = skillIds.map((skillId) => ({
        jobId: newJob.id,
        skillId,
      }));
      await db.insert(jobSkills).values(jobSkillValues);
    }

    // Get job with skills
    const jobWithSkills = await getJobWithSkills(newJob.id);

    res.status(201).json({
      message: 'Job created successfully',
      job: jobWithSkills,
    });
  } catch (error) {
    console.error('Create job error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get all jobs with filters
export const getAllJobs = async (req, res) => {
  try {
    const {
      location,
      company,
      employmentType,
      minSalary,
      maxSalary,
      skillIds,
      search,
    } = req.query;

    // Build where conditions
    const conditions = [eq(jobs.isActive, true)];

    if (location) {
      conditions.push(like(jobs.location, `%${location}%`));
    }

    if (company) {
      conditions.push(like(jobs.company, `%${company}%`));
    }

    if (employmentType) {
      conditions.push(eq(jobs.employmentType, employmentType));
    }

    if (minSalary) {
      // Extract numeric value from salary string (e.g., "50000" or "₹50,000")
      conditions.push(
        sql`CAST(REGEXP_REPLACE(${jobs.salary}, '[^0-9]', '', 'g') AS INTEGER) >= ${parseInt(minSalary)}`
      );
    }

    if (maxSalary) {
      conditions.push(
        sql`CAST(REGEXP_REPLACE(${jobs.salary}, '[^0-9]', '', 'g') AS INTEGER) <= ${parseInt(maxSalary)}`
      );
    }

    if (search) {
      conditions.push(
        orCondition(
          like(jobs.title, `%${search}%`),
          like(jobs.description, `%${search}%`),
          like(jobs.company, `%${search}%`)
        )
      );
    }

    let allJobs = await db
      .select({
        id: jobs.id,
        title: jobs.title,
        description: jobs.description,
        company: jobs.company,
        location: jobs.location,
        salary: jobs.salary,
        employmentType: jobs.employmentType,
        isActive: jobs.isActive,
        createdAt: jobs.createdAt,
        recruiter: {
          id: users.id,
          name: users.name,
          email: users.email,
        },
      })
      .from(jobs)
      .innerJoin(users, eq(jobs.recruiterId, users.id))
      .where(and(...conditions))
      .orderBy(desc(jobs.createdAt));

    // Filter by skills if provided
    if (skillIds && skillIds.length > 0) {
      const skillIdArray = Array.isArray(skillIds) ? skillIds : [skillIds];
      const skillIdNumbers = skillIdArray.map((id) => parseInt(id));

      // Get jobs that have at least one of the specified skills
      const jobsWithSkills = await db
        .select({ jobId: jobSkills.jobId })
        .from(jobSkills)
        .where(inArray(jobSkills.skillId, skillIdNumbers));

      const jobIdsWithSkills = new Set(jobsWithSkills.map((j) => j.jobId));
      allJobs = allJobs.filter((job) => jobIdsWithSkills.has(job.id));
    }

    // Get skills for each job
    const jobsWithSkills = await Promise.all(
      allJobs.map(async (job) => {
        const jobSkillsList = await db
          .select({
            id: skills.id,
            name: skills.name,
          })
          .from(jobSkills)
          .innerJoin(skills, eq(jobSkills.skillId, skills.id))
          .where(eq(jobSkills.jobId, job.id));

        return {
          ...job,
          skills: jobSkillsList,
        };
      })
    );

    res.json(jobsWithSkills);
  } catch (error) {
    console.error('Get all jobs error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get single job details
export const getJobById = async (req, res) => {
  try {
    const { id } = req.params;

    const [job] = await db
      .select({
        id: jobs.id,
        title: jobs.title,
        description: jobs.description,
        company: jobs.company,
        location: jobs.location,
        salary: jobs.salary,
        employmentType: jobs.employmentType,
        isActive: jobs.isActive,
        createdAt: jobs.createdAt,
        updatedAt: jobs.updatedAt,
        recruiter: {
          id: users.id,
          name: users.name,
          email: users.email,
        },
      })
      .from(jobs)
      .innerJoin(users, eq(jobs.recruiterId, users.id))
      .where(and(eq(jobs.id, parseInt(id)), eq(jobs.isActive, true)))
      .limit(1);

    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }

    // Get job skills
    const jobSkillsList = await db
      .select({
        id: skills.id,
        name: skills.name,
      })
      .from(jobSkills)
      .innerJoin(skills, eq(jobSkills.skillId, skills.id))
      .where(eq(jobSkills.jobId, job.id));

    res.json({
      ...job,
      skills: jobSkillsList,
    });
  } catch (error) {
    console.error('Get job by ID error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get relevant jobs based on candidate skills with filters
export const getRelevantJobs = async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      location,
      company,
      employmentType,
      minSalary,
      maxSalary,
      skillIds: filterSkillIds,
      search,
    } = req.query;

    // Get user skills
    const userSkillsList = await db
      .select({ skillId: userSkills.skillId })
      .from(userSkills)
      .where(eq(userSkills.userId, userId));

    if (userSkillsList.length === 0) {
      return res.json([]);
    }

    const skillIds = userSkillsList.map((us) => us.skillId);

    // Get all job skills that match user skills
    const matchingJobSkills = await db
      .select({
        jobId: jobSkills.jobId,
        skillId: jobSkills.skillId,
      })
      .from(jobSkills)
      .where(inArray(jobSkills.skillId, skillIds));

    if (matchingJobSkills.length === 0) {
      return res.json([]);
    }

    // Count matches per job
    const jobMatchCounts = {};
    matchingJobSkills.forEach((mjs) => {
      jobMatchCounts[mjs.jobId] = (jobMatchCounts[mjs.jobId] || 0) + 1;
    });

    const jobIds = Object.keys(jobMatchCounts).map(Number);

    // Build where conditions
    const conditions = [inArray(jobs.id, jobIds), eq(jobs.isActive, true)];

    if (location) {
      conditions.push(like(jobs.location, `%${location}%`));
    }

    if (company) {
      conditions.push(like(jobs.company, `%${company}%`));
    }

    if (employmentType) {
      conditions.push(eq(jobs.employmentType, employmentType));
    }

    if (minSalary) {
      conditions.push(
        sql`CAST(REGEXP_REPLACE(${jobs.salary}, '[^0-9]', '', 'g') AS INTEGER) >= ${parseInt(minSalary)}`
      );
    }

    if (maxSalary) {
      conditions.push(
        sql`CAST(REGEXP_REPLACE(${jobs.salary}, '[^0-9]', '', 'g') AS INTEGER) <= ${parseInt(maxSalary)}`
      );
    }

    if (search) {
      conditions.push(
        orCondition(
          like(jobs.title, `%${search}%`),
          like(jobs.description, `%${search}%`),
          like(jobs.company, `%${search}%`)
        )
      );
    }

    // Get full job details for matching jobs
    let jobsList = await db
      .select({
        id: jobs.id,
        title: jobs.title,
        description: jobs.description,
        company: jobs.company,
        location: jobs.location,
        salary: jobs.salary,
        employmentType: jobs.employmentType,
        createdAt: jobs.createdAt,
        recruiter: {
          id: users.id,
          name: users.name,
          email: users.email,
        },
      })
      .from(jobs)
      .innerJoin(users, eq(jobs.recruiterId, users.id))
      .where(and(...conditions));

    // Filter by additional skills if provided
    if (filterSkillIds && filterSkillIds.length > 0) {
      const filterSkillIdArray = Array.isArray(filterSkillIds) ? filterSkillIds : [filterSkillIds];
      const filterSkillIdNumbers = filterSkillIdArray.map((id) => parseInt(id));

      const jobsWithFilterSkills = await db
        .select({ jobId: jobSkills.jobId })
        .from(jobSkills)
        .where(inArray(jobSkills.skillId, filterSkillIdNumbers));

      const jobIdsWithFilterSkills = new Set(jobsWithFilterSkills.map((j) => j.jobId));
      jobsList = jobsList.filter((job) => jobIdsWithFilterSkills.has(job.id));
    }

    // Get skills for each job and add match count
    const jobsWithSkills = await Promise.all(
      jobsList.map(async (job) => {
        const jobSkillsList = await db
          .select({
            id: skills.id,
            name: skills.name,
          })
          .from(jobSkills)
          .innerJoin(skills, eq(jobSkills.skillId, skills.id))
          .where(eq(jobSkills.jobId, job.id));

        return {
          ...job,
          skills: jobSkillsList,
          matchCount: jobMatchCounts[job.id] || 0,
        };
      })
    );

    // Sort by match count
    jobsWithSkills.sort((a, b) => b.matchCount - a.matchCount);

    res.json(jobsWithSkills);
  } catch (error) {
    console.error('Get relevant jobs error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Update job (recruiter only - own jobs)
export const updateJob = async (req, res) => {
  try {
    const recruiterId = req.user.id;
    const { id } = req.params;
    const { title, description, company, location, salary, employmentType, skillIds, isActive } = req.body;

    // Check if job exists and belongs to recruiter
    const [existingJob] = await db
      .select()
      .from(jobs)
      .where(and(eq(jobs.id, parseInt(id)), eq(jobs.recruiterId, recruiterId)))
      .limit(1);

    if (!existingJob) {
      return res.status(404).json({ error: 'Job not found or you do not have permission to update it' });
    }

    const updateData = { updatedAt: new Date() };
    if (title) updateData.title = title;
    if (description) updateData.description = description;
    if (company) updateData.company = company;
    if (location) updateData.location = location;
    if (salary !== undefined) updateData.salary = salary;
    if (employmentType) updateData.employmentType = employmentType;
    if (isActive !== undefined) updateData.isActive = isActive;

    const [updatedJob] = await db
      .update(jobs)
      .set(updateData)
      .where(eq(jobs.id, parseInt(id)))
      .returning();

    // Update skills if provided
    if (skillIds && Array.isArray(skillIds)) {
      // Delete existing job skills
      await db.delete(jobSkills).where(eq(jobSkills.jobId, parseInt(id)));

      // Add new skills
      if (skillIds.length > 0) {
        const jobSkillValues = skillIds.map((skillId) => ({
          jobId: parseInt(id),
          skillId,
        }));
        await db.insert(jobSkills).values(jobSkillValues);
      }
    }

    const jobWithSkills = await getJobWithSkills(updatedJob.id);

    res.json({
      message: 'Job updated successfully',
      job: jobWithSkills,
    });
  } catch (error) {
    console.error('Update job error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Delete job (recruiter only - own jobs)
export const deleteJob = async (req, res) => {
  try {
    const recruiterId = req.user.id;
    const { id } = req.params;

    // Check if job exists and belongs to recruiter
    const [existingJob] = await db
      .select()
      .from(jobs)
      .where(and(eq(jobs.id, parseInt(id)), eq(jobs.recruiterId, recruiterId)))
      .limit(1);

    if (!existingJob) {
      return res.status(404).json({ error: 'Job not found or you do not have permission to delete it' });
    }

    await db.delete(jobs).where(eq(jobs.id, parseInt(id)));

    res.json({ message: 'Job deleted successfully' });
  } catch (error) {
    console.error('Delete job error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Helper function to get job with skills
const getJobWithSkills = async (jobId) => {
  const [job] = await db
    .select({
      id: jobs.id,
      title: jobs.title,
      description: jobs.description,
      company: jobs.company,
      location: jobs.location,
      salary: jobs.salary,
      employmentType: jobs.employmentType,
      isActive: jobs.isActive,
      createdAt: jobs.createdAt,
      updatedAt: jobs.updatedAt,
      recruiter: {
        id: users.id,
        name: users.name,
        email: users.email,
      },
    })
    .from(jobs)
    .innerJoin(users, eq(jobs.recruiterId, users.id))
    .where(eq(jobs.id, jobId))
    .limit(1);

  if (!job) return null;

  const jobSkillsList = await db
    .select({
      id: skills.id,
      name: skills.name,
    })
    .from(jobSkills)
    .innerJoin(skills, eq(jobSkills.skillId, skills.id))
    .where(eq(jobSkills.jobId, jobId));

  return {
    ...job,
    skills: jobSkillsList,
  };
};

