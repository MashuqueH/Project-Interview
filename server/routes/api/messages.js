const router = require("express").Router();
const { Conversation, Message } = require("../../db/models");
const { Op } = require("sequelize");
const onlineUsers = require("../../onlineUsers");

// expects {recipientId, text, conversationId } in body (conversationId will be null if no conversation exists yet)
router.post("/", async (req, res, next) => {
  try {
    if (!req.user) {
      return res.sendStatus(401);
    }
    const senderId = req.user.id;
    const { recipientId, text, sender } = req.body;

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
      if (onlineUsers.includes(sender.id)) {
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
// expects { messageIds, recipientId } in body
router.patch("/read", async (req, res, next) => {
  try {
    if (!req.user) {
      return res.sendStatus(401);
    }
    const senderId = req.user.id;
    const { messageIds, recipientId, conversationId } = req.body;

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
          id: {
            [Op.in]: messageIds,
          },
        },
      }
    );

    if (!messages) {
      res.sendStatus(404);
    }
    res.sendStatus(200);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
