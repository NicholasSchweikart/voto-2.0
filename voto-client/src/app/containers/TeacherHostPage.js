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
  CardContent,
  CardActions,
  CardMedia,
  CardHeader
} from 'material-ui/Card';
import {
  Grid,
  Card,
  Typography,
  IconButton,
} from 'material-ui';
import {
  ArrowBack,
  ArrowForward,
  PlayArrow,
} from 'material-ui-icons'
import VotoNavBar from '../components/VotoNavBar';
import TeacherLandingPage from './TeacherLandingPage';
import SlidePreview from '../components/SlidePreview';

import slide from '../images/classroom.jpg'
import sampleslide from '../images/sampleslide.png'

const styleSheet = createStyleSheet('TeacherHostPage', {
  root: {
    flex: 1,
    backgroundColor: blueGrey[500],
  },
  container: {
    flex: 1,
    padding: 8,
  },
  currentSlideContainer: {
    display: 'flex',
    flexDirection: 'column',
    borderRadius: 0,
  },
  currentSlide: {
    width: '100%',
  },
  slidePreviewContainer: {
    display: 'flex',
    flex: 1,
    flexDirection: 'row',
    overflowX: 'auto',
  }
});

class TeacherHostPage extends React.Component {

  render() {
    const { classes } = this.props;

    return (
      <div className={classes.root}>
        <VotoNavBar />

        <Grid
          container
          className={classes.container}
          direction="column"
          align="center"
        >

          <Grid item xs={12} md={9} lg={8}>
            <Card className={classes.currentSlideContainer}>

              <CardMedia>
                <img src={slide} alt="Current Slide" className={classes.currentSlide} />
              </CardMedia>

              <CardActions>
                <IconButton aria-label="Previous">
                  <ArrowBack />
                </IconButton>
                <div style={{flexGrow: 1}} />
                <IconButton aria-label="Start">
                  <PlayArrow />
                </IconButton>
                <div style={{flexGrow: 1}} />
                <IconButton aria-label="Next">
                  <ArrowForward />
                </IconButton>
              </CardActions>

            </Card>
          </Grid>

          <Grid item xs={12}>
            <div className={classes.slidePreviewContainer}>

              <SlidePreview />
              <SlidePreview />
              <SlidePreview />
              <SlidePreview />
              <SlidePreview />
              <SlidePreview />
              <SlidePreview />
              <SlidePreview />


            </div>
          </Grid>

        </Grid>

      </div>
    );
  }


}

export default withStyles(styleSheet)(TeacherHostPage);
