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
import { Bar } from 'react-chartjs-2';
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
  },
  icon: {
    color: indigo[700],
  }
});

class TeacherHostPage extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      data: {
        labels: ["A", "B", "C", "D", "E"],
        datasets: [{
          label: 'Number of Votes',
          data: [12, 19, 3, 5, 2, 3],
          backgroundColor: [
            'rgba(255, 99, 132, 0.2)',
            'rgba(54, 162, 235, 0.2)',
            'rgba(255, 206, 86, 0.2)',
            'rgba(75, 192, 192, 0.2)',
            'rgba(153, 102, 255, 0.2)'
          ],
          borderColor: [
            'rgba(255,99,132,1)',
            'rgba(54, 162, 235, 1)',
            'rgba(255, 206, 86, 1)',
            'rgba(75, 192, 192, 1)',
            'rgba(153, 102, 255, 1)'
          ],
          borderWidth: 1
        }]
      },
      options: {
        scales: {
          yAxes: [{
            ticks: {
              beginAtZero:true
            }
          }]
        }
      }
    }
  }

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
                <IconButton aria-label="Previous" className={classes.icon}>
                  <ArrowBack />
                </IconButton>
                <div style={{flexGrow: 1}} />
                <IconButton aria-label="Start" className={classes.icon}>
                  <PlayArrow />
                </IconButton>
                <div style={{flexGrow: 1}} />
                <IconButton aria-label="Next" className={classes.icon}>
                  <ArrowForward />
                </IconButton>
              </CardActions>

            </Card>
          </Grid>

          <Grid item xs={12} md={9} lg={8}>
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

          <Grid item xs={12}>

            <Bar
              data={this.state.data}
              width={500}
              height={250}
              options={{
                maintainAspectRatio: false
              }}
            />

          </Grid>

        </Grid>

      </div>
    );
  }


}

export default withStyles(styleSheet)(TeacherHostPage);
