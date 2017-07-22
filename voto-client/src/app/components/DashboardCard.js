import React from 'react';
import PropTypes from 'prop-types';
import {
  withStyles,
  createStyleSheet
} from 'material-ui/styles';
import {
  indigo,
} from 'material-ui/colors';
import {
  CardContent,
  CardActions,
  CardMedia,
  CardHeader,
} from 'material-ui/Card';
import {
  Grid,
  Card,
  Typography,
  Button,
  Avatar,
} from 'material-ui';
import {
  MoreVert,
  Slideshow
} from 'material-ui-icons';
import logo from '../images/logo.png'

const styleSheet = createStyleSheet('DashboardCard', {
  card: {
    display: 'flex',
    flexDirection: 'column',
  },
  moreVert: {
    alignSelf: 'flex-end',
    color: indigo[200],
  },
  avatar: {
    backgroundColor: indigo[900],
  },
  logo: {
    width: '100%',
    height: '100%',
    color: indigo[500],
  },
  title: {
    color: indigo[500],
  }
});

const DashboardCard = (props) => {
  const { classes, name } = props;

  return (
    <Grid item xs={6} sm={4} md={3} lg={2}>
      <Card className={classes.card}>
        <CardHeader
          avatar={
            <Avatar aria-label={name} className={classes.avatar}>
              {name.charAt(0).toUpperCase()}
            </Avatar>
          }
          title={name}
          subheader="Created on Sep. 5th"
          classes={{
            title: classes.title
          }}
        />
        <CardMedia>
          <Slideshow className={classes.logo} />
        </CardMedia>
      </Card>
    </Grid>
  );
};

DashboardCard.propTypes = {
  name: PropTypes.string.isRequired,
};

export default withStyles(styleSheet)(DashboardCard);