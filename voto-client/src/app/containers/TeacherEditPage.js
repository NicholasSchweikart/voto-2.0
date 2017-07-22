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

import slide from '../images/classroom.jpg'

const styleSheet = createStyleSheet('TeacherEditPage', {
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
    alignItems: 'center',
    borderRadius: 0,
  },
  currentSlide: {
    width: '100%',
  }
});

class TeacherEditPage extends React.Component {

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
                <IconButton aria-label="Next">
                  <ArrowForward />
                </IconButton>
              </CardActions>

            </Card>
          </Grid>

          <Grid item xs={12}>
            <Grid
              container
              gutter={8}
              direction="row"
              justify="center"
              wrap="nowrap"
              style={{ overflowX: 'auto'}}
            >

              <Grid item xs={4} sm={3} md={2} lg={1}>

                <Card className={classes.currentSlideContainer}>
                  <CardMedia>
                    <img src={slide} alt="Slide" className={classes.currentSlide} />
                  </CardMedia>
                  <CardActions>
                    <IconButton aria-label="Play this slide">
                      <PlayArrow />
                    </IconButton>
                  </CardActions>
                </Card>

              </Grid>

              <Grid item xs={4} sm={3} md={2} lg={1}>

                <Card className={classes.currentSlideContainer}>
                  <CardMedia>
                    <img src={slide} alt="Slide" className={classes.currentSlide} />
                  </CardMedia>
                  <CardActions>
                    <IconButton aria-label="Play this slide">
                      <PlayArrow />
                    </IconButton>
                  </CardActions>
                </Card>

              </Grid>

              <Grid item xs={4} sm={3} md={2} lg={1}>

                <Card className={classes.currentSlideContainer}>
                  <CardMedia>
                    <img src={slide} alt="Slide" className={classes.currentSlide} />
                  </CardMedia>
                  <CardActions>
                    <IconButton aria-label="Play this slide">
                      <PlayArrow />
                    </IconButton>
                  </CardActions>
                </Card>

              </Grid>

              <Grid item xs={4} sm={3} md={2} lg={1}>

                <Card className={classes.currentSlideContainer}>
                  <CardMedia>
                    <img src={slide} alt="Slide" className={classes.currentSlide} />
                  </CardMedia>
                  <CardActions>
                    <IconButton aria-label="Play this slide">
                      <PlayArrow />
                    </IconButton>
                  </CardActions>
                </Card>

              </Grid>

              <Grid item xs={4} sm={3} md={2} lg={1}>

                <Card className={classes.currentSlideContainer}>
                  <CardMedia>
                    <img src={slide} alt="Slide" className={classes.currentSlide} />
                  </CardMedia>
                  <CardActions>
                    <IconButton aria-label="Play this slide">
                      <PlayArrow />
                    </IconButton>
                  </CardActions>
                </Card>

              </Grid>

              <Grid item xs={4} sm={3} md={2} lg={1}>

                <Card className={classes.currentSlideContainer}>
                  <CardMedia>
                    <img src={slide} alt="Slide" className={classes.currentSlide} />
                  </CardMedia>
                  <CardActions>
                    <IconButton aria-label="Play this slide">
                      <PlayArrow />
                    </IconButton>
                  </CardActions>
                </Card>

              </Grid>

              <Grid item xs={4} sm={3} md={2} lg={1}>

                <Card className={classes.currentSlideContainer}>
                  <CardMedia>
                    <img src={slide} alt="Slide" className={classes.currentSlide} />
                  </CardMedia>
                  <CardActions>
                    <IconButton aria-label="Play this slide">
                      <PlayArrow />
                    </IconButton>
                  </CardActions>
                </Card>

              </Grid>

              <Grid item xs={4} sm={3} md={2} lg={1}>

                <Card className={classes.currentSlideContainer}>
                  <CardMedia>
                    <img src={slide} alt="Slide" className={classes.currentSlide} />
                  </CardMedia>
                  <CardActions>
                    <IconButton aria-label="Play this slide">
                      <PlayArrow />
                    </IconButton>
                  </CardActions>
                </Card>

              </Grid>

            </Grid>
          </Grid>

        </Grid>

      </div>
    );
  }


}

export default withStyles(styleSheet)(TeacherEditPage);
