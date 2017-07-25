import React from 'react';
import {
  withStyles,
  createStyleSheet
} from 'material-ui/styles';
import {
  blueGrey,
  indigo
} from 'material-ui/colors';
import {
  CardActions,
  CardMedia,
  CardContent,
  CardHeader
} from 'material-ui/Card';
import {
  Grid,
  Card,
  Typography,
  IconButton,
  Divider
} from 'material-ui';
import {
  ArrowForward,
  ArrowBack,
  Edit,
} from 'material-ui-icons';

import sampleslide from '../images/sampleslide.png';

const styleSheet = createStyleSheet('EditSlidePreview', {
  slide: {
    width: '100%',
  },
  slideContainer: {
    display: 'flex',
    flexDirection: 'column',
    borderRadius: 0,
  },
  slideBottomContainer: {
    display: 'flex',
    flex: 1,
    flexDirection: 'row',
    padding: 8,
  },
  arrowButton: {
    height: 32,
    width: 32,
  },
  actionButtonsContainer: {
    display: 'flex',
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 8,
    paddingBottom: 8,
  },
  iconButton: {
    width: '25%',
    height: '100%',
  }
});

const EditSlidePreview = (props) => {
  const { classes } = props;

  return (
    <Grid item xs={4} style={{margin: 4}}>

      <Card className={classes.slideContainer}>
        <CardMedia>
          <img src={sampleslide} alt="Slide" className={classes.slide} />
        </CardMedia>

        <div className={classes.actionButtonsContainer} >
          <IconButton className={classes.iconButton}>
            <ArrowBack />
          </IconButton>
          <IconButton className={classes.iconButton}>
            <Edit />
          </IconButton>
          <IconButton className={classes.iconButton}>
            <ArrowForward />
          </IconButton>
        </div>
      </Card>

    </Grid>
  );
}

export default withStyles(styleSheet)(EditSlidePreview);