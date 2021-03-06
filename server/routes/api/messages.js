const router = require("express").Router();
const { Op } = require("sequelize");
const { Conversation, Message } = require("../../db/models");
const onlineUsers = require("../../onlineUsers");

// expects {recipientId, text, conversationId } in body (conversationId will be null if no conversation exists yet)
router.post("/", async (req, res, next) => {
  try {
    if (!req.user) {
      return res.sendStatus(401);
    }

    const senderId = req.user.id;
    const { recipientId, text, conversationId, sender } = req.body;

    // if we already know conversation id, we can save time and just add it to message and return
    if (conversationId) {
      // Check if conversation belongs to user
      const conversation = await Conversation.findOne({
        where: {
          id: conversationId,
          user1Id: {
            [Op.or]: [senderId, recipientId],
          },
          user2Id: {
            [Op.or]: [senderId, recipientId],
          },
        },
      });

      if (!conversation) {
        return res.sendStatus(403);
      }

      const message = await Message.create({ senderId, text, conversationId });
      return res.json({ message, sender });
    }

    // if we don't have conversation id, find a conversation to make sure it doesn't already exist
    let conversation = await Conversation.findConversation(
      senderId,
      recipientId
    );

    if (!conversation) {
      // create conversation
      conversation = await Conversation.create({
        user1Id: senderId,
        user2Id: recipientId,
      });
      if (sender.id in onlineUsers) {
        sender.online = true;
      }
    }
    const message = await Message.create({
      senderId,
      text,
      conversationId: conversation.id,
    });
    res.json({ message, sender });
  } catch (error) {
    next(error);
  }
});

// Marks all the messages in a given conversation as read
// expects { recipientId, conversationId } in body
router.patch("/read", async (req, res, next) => {
  try {
    if (!req.user) {
      return res.sendStatus(401);
    }
    const senderId = req.user.id;
    const { recipientId, conversationId } = req.body;

    // Check if conversation belongs to user;
    const conversation = await Conversation.findOne({
      where: {
        id: conversationId,
        user1Id: {
          [Op.or]: [senderId, recipientId],
        },
        user2Id: {
          [Op.or]: [senderId, recipientId],
        },
      },
    });

    if (!conversation) {
      return res.sendStatus(403);
    }

    // Update messages
    const messages = await Message.update(
      { read: true },
      {
        where: {
          conversationId,
          senderId: recipientId,
          read: false,
        },
        returning: true,
      }
    );

    if (!messages) {
      res.sendStatus(404);
    }
    let updatedMessages = messages[1].map((message) => message.dataValues);
    res.json(updatedMessages);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
