import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import { Typography, Box } from "@material-ui/core";

const useStyles = makeStyles((theme) => ({
  root: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    marginRight: theme.spacing(),
  },
  background: {
    backgroundColor: "#3A8DFF",
    borderRadius: "50%",
    textAlign: "center",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    height: "30px",
    width: "30px",
  },
  text: {
    color: "white",
    fontSize: theme.typography,
    fontWeight: "bolder",
  },
}));

const UnreadMessegeNumber = (props) => {
  const classes = useStyles();

  return (
    <Box className={classes.root}>
      <Box className={classes.background}>
        <Typography className={classes.text}>{props.value}</Typography>
      </Box>
    </Box>
  );
};

export default UnreadMessegeNumber;
