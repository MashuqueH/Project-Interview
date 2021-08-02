import React, { useEffect, useState } from "react";
import { makeStyles } from "@material-ui/core/styles";
import { Box } from "@material-ui/core";
import { Input, Header, Messages } from "./index";
import { connect } from "react-redux";
import { readMessages } from "../../store/utils/thunkCreators";

const useStyles = makeStyles(() => ({
  root: {
    display: "flex",
    flexGrow: 8,
    flexDirection: "column",
  },
  chatContainer: {
    marginLeft: 41,
    marginRight: 41,
    display: "flex",
    flexDirection: "column",
    flexGrow: 1,
    justifyContent: "space-between",
  },
}));

const ActiveChat = (props) => {
  const classes = useStyles();
  const { user, activeConversation } = props;
  const conversation = props.conversation;

  const [currentConversation, setCurrentConversation] = useState(null);

  useEffect(() => {
    if (conversation && activeConversation === currentConversation) {
      props.readMessages(conversation);
    }
  }, [activeConversation, currentConversation, conversation, props]);

  useEffect(() => {
    setCurrentConversation(activeConversation);
  }, [activeConversation, currentConversation]);

  return (
    <Box className={classes.root}>
      {conversation?.otherUser && (
        <>
          <Header
            username={conversation.otherUser.username}
            online={conversation.otherUser.online || false}
          />
          <Box className={classes.chatContainer}>
            <Messages
              messages={conversation.messages}
              otherUser={conversation.otherUser}
              userId={user.id}
              lastRead={conversation.lastRead}
            />
            <Input
              otherUser={conversation.otherUser}
              conversationId={conversation.id}
              user={user}
            />
          </Box>
        </>
      )}
    </Box>
  );
};

const mapStateToProps = (state) => {
  return {
    user: state.user,
    activeConversation: state.activeConversation,
    conversation: state.conversations
      ? state.conversations.find(
          (conversation) =>
            conversation.otherUser.username === state.activeConversation
        )
      : {},
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    readMessages: (senderId) => {
      dispatch(readMessages(senderId));
    },
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(ActiveChat);
