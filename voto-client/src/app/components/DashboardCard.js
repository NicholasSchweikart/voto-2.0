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
  IconButton,
} from 'material-ui';
import {
  MoreVert,
  Slideshow,
  Delete,
  Edit,
  PlayArrow,
} from 'material-ui-icons';
import slide from '../images/sampleslide.png'

const styleSheet = createStyleSheet('DashboardCard', {
  card: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    borderRadius: 0,
    boxShadow: 'none',
  },
  moreVert: {
    alignSelf: 'flex-end',
    color: indigo[200],
  },
  avatar: {
    backgroundColor: indigo[900],
  },
  header: {
    alignSelf: 'flex-start',
  },
  slide: {
    width: '100%',
  },
  icon: {
    color: indigo[500],
  }
});

const DashboardCard = (props) => {
  const { classes, name } = props;

  return (
    <Grid item xs={6} sm={6} md={4} lg={3}>
      <Card className={classes.card}>

        <CardHeader className={classes.header}
          avatar={
            <Avatar aria-label={name} className={classes.avatar}>
              {name.charAt(0).toUpperCase()}
            </Avatar>
          }
          title={name}
          subheader="Created on Sep. 5th"
        />

        <CardMedia>
          {/*<Slideshow className={classes.logo} />*/}
          <img src={slide} alt="Slide" className={classes.slide} />
        </CardMedia>

        <CardActions>
          <IconButton aria-label="Host Session">
            <PlayArrow className={classes.icon} />
          </IconButton>
          <IconButton aria-label="Edit Session">
            <Edit className={classes.icon} />
          </IconButton>
          <IconButton aria-label="Delete Session">
            <Delete className={classes.icon} />
          </IconButton>
        </CardActions>

      </Card>
    </Grid>
  );
};

DashboardCard.propTypes = {
  name: PropTypes.string.isRequired,
};

export default withStyles(styleSheet)(DashboardCard);
