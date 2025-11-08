import { db } from '../db/index.js';
import { messages, users, jobs } from '../db/schema.js';
import { eq, and, or, desc } from 'drizzle-orm';

// Send a message
export const sendMessage = async (req, res) => {
  try {
    const senderId = req.user.id;
    const { receiverId, content, jobId } = req.body;

    // Validation
    if (!receiverId || !content) {
      return res.status(400).json({ error: 'Receiver ID and content are required' });
    }

    // Check if receiver exists
    const [receiver] = await db
      .select()
      .from(users)
      .where(eq(users.id, parseInt(receiverId)))
      .limit(1);

    if (!receiver) {
      return res.status(404).json({ error: 'Receiver not found' });
    }

    // Ensure users have different roles (recruiter <-> candidate)
    if (req.user.role === receiver.role) {
      return res.status(400).json({ error: 'Cannot message users with the same role' });
    }

    // Create message
    const [newMessage] = await db
      .insert(messages)
      .values({
        senderId,
        receiverId: parseInt(receiverId),
        content: content.trim(),
        jobId: jobId ? parseInt(jobId) : null,
        isRead: false,
      })
      .returning();

    // Get receiver details
    const [receiverDetails] = await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        role: users.role,
      })
      .from(users)
      .where(eq(users.id, parseInt(receiverId)))
      .limit(1);

    // Get job details if jobId exists
    let jobDetails = null;
    if (jobId) {
      const [job] = await db
        .select({
          id: jobs.id,
          title: jobs.title,
          company: jobs.company,
        })
        .from(jobs)
        .where(eq(jobs.id, parseInt(jobId)))
        .limit(1);
      jobDetails = job;
    }

    res.status(201).json({
      message: 'Message sent successfully',
      data: {
        ...newMessage,
        sender: {
          id: req.user.id,
          name: req.user.name,
          email: req.user.email,
          role: req.user.role,
        },
        receiver: receiverDetails,
        job: jobDetails,
      },
    });
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get conversation between two users
export const getConversation = async (req, res) => {
  try {
    const userId = req.user.id;
    const { otherUserId } = req.params;

    // Get all messages between the two users
    const conversationRaw = await db
      .select({
        id: messages.id,
        content: messages.content,
        isRead: messages.isRead,
        createdAt: messages.createdAt,
        senderId: messages.senderId,
        receiverId: messages.receiverId,
        jobId: messages.jobId,
        senderId_user: users.id,
        senderName: users.name,
        senderEmail: users.email,
        senderRole: users.role,
        jobId_job: jobs.id,
        jobTitle: jobs.title,
        jobCompany: jobs.company,
      })
      .from(messages)
      .innerJoin(users, eq(messages.senderId, users.id))
      .leftJoin(jobs, eq(messages.jobId, jobs.id))
      .where(
        or(
          and(
            eq(messages.senderId, userId),
            eq(messages.receiverId, parseInt(otherUserId))
          ),
          and(
            eq(messages.senderId, parseInt(otherUserId)),
            eq(messages.receiverId, userId)
          )
        )
      )
      .orderBy(messages.createdAt);

    // Transform to the expected structure
    const conversation = conversationRaw.map((msg) => ({
      id: msg.id,
      content: msg.content,
      isRead: msg.isRead,
      createdAt: msg.createdAt,
      senderId: msg.senderId,
      receiverId: msg.receiverId,
      jobId: msg.jobId,
      sender: msg.senderId_user ? {
        id: msg.senderId_user,
        name: msg.senderName,
        email: msg.senderEmail,
        role: msg.senderRole,
      } : null,
      job: msg.jobId_job ? {
        id: msg.jobId_job,
        title: msg.jobTitle,
        company: msg.jobCompany,
      } : null,
    }));

    // Mark messages as read (only messages sent to current user) - only if there are messages
    if (conversation.length > 0) {
      await db
        .update(messages)
        .set({ isRead: true })
        .where(
          and(
            eq(messages.receiverId, userId),
            eq(messages.senderId, parseInt(otherUserId)),
            eq(messages.isRead, false)
          )
        );
    }

    res.json(conversation);
  } catch (error) {
    console.error('Get conversation error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get all conversations for a user
export const getConversations = async (req, res) => {
  try {
    const userId = req.user.id;

    // Get all messages where user is sender or receiver
    const allMessages = await db
      .select({
        id: messages.id,
        senderId: messages.senderId,
        receiverId: messages.receiverId,
        content: messages.content,
        isRead: messages.isRead,
        createdAt: messages.createdAt,
        sender: {
          id: users.id,
          name: users.name,
          email: users.email,
          role: users.role,
        },
      })
      .from(messages)
      .innerJoin(users, eq(messages.senderId, users.id))
      .where(
        or(
          eq(messages.senderId, userId),
          eq(messages.receiverId, userId)
        )
      )
      .orderBy(desc(messages.createdAt));

    // Group by other user and get last message
    const conversationMap = new Map();

    for (const msg of allMessages) {
      const otherUserId = msg.senderId === userId ? msg.receiverId : msg.senderId;
      
      if (!conversationMap.has(otherUserId)) {
        // Get other user details
        const [otherUser] = await db
          .select({
            id: users.id,
            name: users.name,
            email: users.email,
            role: users.role,
          })
          .from(users)
          .where(eq(users.id, otherUserId))
          .limit(1);

        // Count unread messages
        const unreadMessages = await db
          .select()
          .from(messages)
          .where(
            and(
              eq(messages.senderId, otherUserId),
              eq(messages.receiverId, userId),
              eq(messages.isRead, false)
            )
          );

        conversationMap.set(otherUserId, {
          userId: otherUserId,
          name: otherUser.name,
          email: otherUser.email,
          role: otherUser.role,
          lastMessage: msg.content,
          lastMessageTime: msg.createdAt,
          unreadCount: unreadMessages.length,
        });
      } else {
        const existing = conversationMap.get(otherUserId);
        // Update if this message is newer
        if (new Date(msg.createdAt) > new Date(existing.lastMessageTime)) {
          existing.lastMessage = msg.content;
          existing.lastMessageTime = msg.createdAt;
        }
      }
    }

    // Convert to array and sort by last message time
    const conversationsList = Array.from(conversationMap.values()).sort(
      (a, b) => new Date(b.lastMessageTime) - new Date(a.lastMessageTime)
    );

    res.json(conversationsList);
  } catch (error) {
    console.error('Get conversations error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Mark messages as read
export const markAsRead = async (req, res) => {
  try {
    const userId = req.user.id;
    const { otherUserId } = req.params;

    await db
      .update(messages)
      .set({ isRead: true })
      .where(
        and(
          eq(messages.senderId, parseInt(otherUserId)),
          eq(messages.receiverId, userId),
          eq(messages.isRead, false)
        )
      );

    res.json({ message: 'Messages marked as read' });
  } catch (error) {
    console.error('Mark as read error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

