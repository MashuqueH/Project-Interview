import React from "react";
import { Box, Avatar } from "@material-ui/core";
import { SenderBubble, OtherUserBubble } from "../ActiveChat";
import { makeStyles } from "@material-ui/core/styles";
import moment from "moment";

const useStyles = makeStyles(() => ({
  lastRead: {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-end",
  },
  avatar: {
    height: 25,
    width: 25,
    marginRight: 6,
    marginTop: 6,
  },
}));

const Messages = (props) => {
  const classes = useStyles();
  const { messages, otherUser, userId, lastRead } = props;

  return (
    <Box>
      {messages.map((message) => {
        const time = moment(message.createdAt).format("h:mm");
        return (
          <Box key={message.id} className={classes.root}>
            {message.senderId === userId ? (
              <SenderBubble
                text={message.text}
                time={time}
                otherUser={otherUser}
              />
            ) : (
              <OtherUserBubble
                text={message.text}
                time={time}
                otherUser={otherUser}
              />
            )}
            <Box className={classes.lastRead}>
              {lastRead === message.id && (
                <Avatar
                  alt={otherUser.username}
                  src={otherUser.photoUrl}
                  className={classes.avatar}
                ></Avatar>
              )}
            </Box>
          </Box>
        );
      })}
    </Box>
  );
};

export default Messages;
