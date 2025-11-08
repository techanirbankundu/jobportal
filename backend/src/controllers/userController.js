import { db } from '../db/index.js';
import { users, skills, userSkills } from '../db/schema.js';
import { eq, and, inArray } from 'drizzle-orm';
import { uploadToCloudinary, deleteFile } from '../utils/cloudinary.js';

// Get user profile
export const getProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    const [user] = await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        role: users.role,
        cvUrl: users.cvUrl,
        phone: users.phone,
        location: users.location,
        bio: users.bio,
        createdAt: users.createdAt,
        updatedAt: users.updatedAt,
      })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Get user skills
    const userSkillsList = await db
      .select({
        id: skills.id,
        name: skills.name,
      })
      .from(userSkills)
      .innerJoin(skills, eq(userSkills.skillId, skills.id))
      .where(eq(userSkills.userId, userId));

    res.json({
      ...user,
      skills: userSkillsList,
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Update user profile
export const updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { name, phone, location, bio } = req.body;

    const updateData = {};
    if (name) updateData.name = name;
    if (phone) updateData.phone = phone;
    if (location) updateData.location = location;
    if (bio) updateData.bio = bio;
    updateData.updatedAt = new Date();

    const [updatedUser] = await db
      .update(users)
      .set(updateData)
      .where(eq(users.id, userId))
      .returning();

    if (!updatedUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    const { password: _, ...userWithoutPassword } = updatedUser;

    res.json({
      message: 'Profile updated successfully',
      user: userWithoutPassword,
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Upload CV
export const uploadCV = async (req, res) => {
  try {
    const userId = req.user.id;

    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Get current user to check if they have an existing CV
    const [currentUser] = await db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    // Upload to Cloudinary
    const cvUrl = await uploadToCloudinary(req.file.buffer, req.file.originalname);

    // Delete old CV if exists
    if (currentUser.cvUrl) {
      await deleteFile(currentUser.cvUrl);
    }

    // Update user with new CV URL
    const [updatedUser] = await db
      .update(users)
      .set({ cvUrl, updatedAt: new Date() })
      .where(eq(users.id, userId))
      .returning();

    const { password: _, ...userWithoutPassword } = updatedUser;

    res.json({
      message: 'CV uploaded successfully',
      cvUrl,
      user: userWithoutPassword,
    });
  } catch (error) {
    console.error('Upload CV error:', error);
    res.status(500).json({ error: 'Failed to upload CV' });
  }
};

// Add skills to user
export const addSkills = async (req, res) => {
  try {
    const userId = req.user.id;
    const { skillIds } = req.body; // Array of skill IDs

    if (!skillIds || !Array.isArray(skillIds) || skillIds.length === 0) {
      return res.status(400).json({ error: 'skillIds array is required' });
    }

    // Remove existing user skills for this user
    await db.delete(userSkills).where(eq(userSkills.userId, userId));

    // Add new skills
    const skillValues = skillIds.map((skillId) => ({
      userId,
      skillId,
    }));

    await db.insert(userSkills).values(skillValues);

    // Get updated user skills
    const updatedSkills = await db
      .select({
        id: skills.id,
        name: skills.name,
      })
      .from(userSkills)
      .innerJoin(skills, eq(userSkills.skillId, skills.id))
      .where(eq(userSkills.userId, userId));

    res.json({ 
      message: 'Skills added successfully',
      skills: updatedSkills
    });
  } catch (error) {
    console.error('Add skills error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get all skills (for dropdown/selection)
export const getAllSkills = async (req, res) => {
  try {
    const allSkills = await db.select().from(skills).orderBy(skills.name);
    res.json(allSkills);
  } catch (error) {
    console.error('Get skills error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Create a new skill (if it doesn't exist)
export const createSkill = async (req, res) => {
  try {
    const { names } = req.body; // Expecting an array of skill names

    if (!Array.isArray(names) || names.length === 0) {
      return res.status(400).json({ error: 'names array is required' });
    }

    // Clean and validate names
    const skillNames = names
      .map((name) => (typeof name === 'string' ? name.trim() : ''))
      .filter((name) => name.length > 0);

    if (skillNames.length === 0) {
      return res.status(400).json({ error: 'Valid skill names are required' });
    }

    // Fetch existing skills to avoid duplicates
    const existingSkills = await db
      .select()
      .from(skills)
      .where(inArray(skills.name, skillNames));

    const existingNames = existingSkills.map((s) => s.name);

    // Filter out names that already exist
    const newNames = skillNames.filter((name) => !existingNames.includes(name));

    if (newNames.length === 0) {
      return res.status(400).json({ error: 'All skills already exist', existingSkills });
    }

    // Insert new unique skills
    const newSkills = await db
      .insert(skills)
      .values(newNames.map((name) => ({ name })))
      .returning();

    res.status(201).json({
      message: 'Skills created successfully',
      added: newSkills,
      existing: existingSkills,
    });

  } catch (error) {
    console.error('Create multiple skills error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

