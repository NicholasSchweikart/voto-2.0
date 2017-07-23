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
  PlayArrow,
} from 'material-ui-icons';

import sampleslide from '../images/sampleslide.png';

const styleSheet = createStyleSheet('SlidePreview', {
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
  }
});

const SlidePreview = (props) => {
  const { classes } = props;

  return (
    <Grid item xs={4} md={3} lg={3} style={{margin: 4}}>

      <Card className={classes.slideContainer}>
        <CardMedia style={{marginBottom: -4}}>
          <img src={sampleslide} alt="Slide" className={classes.slide} />
          {/*<IconButton className={classes.arrowButton}>*/}
            {/*<PlayArrow />*/}
          {/*</IconButton>*/}
        </CardMedia>
      </Card>

    </Grid>
  );
}

export default withStyles(styleSheet)(SlidePreview);