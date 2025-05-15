import axios from "axios";
import asyncHandler from "express-async-handler";
import Conversation from "../models/ConversationModel.js";

const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;
const DEEPSEEK_API_URL = "https://api.deepseek.com/v1/chat/completions";

// Rate limiting configuration
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const RATE_LIMIT_MAX = 15; // Max requests per window
const userRequestCounts = new Map();

const chatWithDeepSeek = asyncHandler(async (req, res) => {
  const { message, conversationId } = req.body;
  const userId = req.user._id;

  // Rate limiting check
  const now = Date.now();
  const userRequests = userRequestCounts.get(userId) || [];

  // Remove old requests from the window
  const recentRequests = userRequests.filter(
    (timestamp) => now - timestamp < RATE_LIMIT_WINDOW
  );
  recentRequests.push(now);
  userRequestCounts.set(userId, recentRequests);

  if (recentRequests.length > RATE_LIMIT_MAX) {
    return res.status(429).json({
      error: `Too many requests. Please wait ${Math.ceil(
        (RATE_LIMIT_WINDOW - (now - recentRequests[0])) / 1000
      )} seconds before trying again.`,
    });
  }

  try {
    // Retrieve or create conversation
    let conversation;
    if (conversationId) {
      conversation = await Conversation.findOne({
        _id: conversationId,
        user: userId,
      });

      if (!conversation) {
        return res.status(404).json({ error: "Conversation not found" });
      }
    } else {
      conversation = new Conversation({
        user: userId,
        messages: [
          {
            role: "system",
            content:
              "You are a helpful task management assistant. Help users with their tasks, projects, and productivity questions.",
          },
        ],
      });
    }

    // Add user message to conversation
    conversation.messages.push({
      role: "user",
      content: message,
    });

    // Call DeepSeek API
    const response = await axios.post(
      DEEPSEEK_API_URL,
      {
        model: "deepseek-chat",
        messages: conversation.messages.map((msg) => ({
          role: msg.role,
          content: msg.content,
        })),
        temperature: 0.7,
        max_tokens: 1000,
        stream: false,
      },
      {
        headers: {
          Authorization: `Bearer ${DEEPSEEK_API_KEY}`,
          "Content-Type": "application/json",
        },
        timeout: 30000, // 30 seconds timeout
      }
    );

    const assistantMessage = response.data.choices[0].message.content;

    // Add assistant response to conversation
    conversation.messages.push({
      role: "assistant",
      content: assistantMessage,
    });

    // Save conversation to database
    await conversation.save();

    res.json({
      reply: assistantMessage,
      conversationId: conversation._id,
      messages: conversation.messages,
    });
  } catch (error) {
    console.error("DeepSeek API error:", error.response?.data || error.message);

    let errorMessage = "Failed to get response from chatbot";
    let statusCode = 500;

    if (error.response) {
      if (error.response.status === 401) {
        errorMessage = "Invalid API key configuration";
        statusCode = 503; // Service Unavailable
      } else if (error.response.status === 429) {
        errorMessage = "Chatbot API rate limit exceeded";
        statusCode = 429;
      }
    } else if (error.code === "ECONNABORTED") {
      errorMessage = "Chatbot response timed out";
      statusCode = 504;
    }

    res.status(statusCode).json({ error: errorMessage });
  }
});

// Get conversation history
const getConversations = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const conversations = await Conversation.find(
    { user: userId },
    {
      messages: { $slice: 1 }, // Only return first message for preview
      createdAt: 1,
      updatedAt: 1,
    }
  ).sort({ updatedAt: -1 });

  res.json(conversations);
});

// Get specific conversation
const getConversation = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user._id;

  const conversation = await Conversation.findOne({
    _id: id,
    user: userId,
  });

  if (!conversation) {
    return res.status(404).json({ error: "Conversation not found" });
  }

  res.json(conversation);
});

// Delete conversation
const deleteConversation = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user._id;

  const conversation = await Conversation.findOneAndDelete({
    _id: id,
    user: userId,
  });

  if (!conversation) {
    return res.status(404).json({ error: "Conversation not found" });
  }

  res.json({ message: "Conversation deleted successfully" });
});

export {
  chatWithDeepSeek,
  getConversations,
  getConversation,
  deleteConversation,
};
