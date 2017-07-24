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
    flexDirection: 'column',
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
  chartContainer: {
    height: '100%',
    display: 'flex',
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'center',
  },
  slidePreviewContainer: {
    display: 'flex',
    flex: 1,
    flexDirection: 'row',
    overflowX: 'auto',
    marginTop: 8,
  },
  icon: {
    color: indigo[700],
  }
});

class TeacherHostPage extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      chartData: {
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
      chartOptions: {
        scales: {
          yAxes: [{
            ticks: {
              beginAtZero: true
            }
          }]
        },
        maintainAspectRatio: false,
      },
      chartWidth: 0,
      chartHeight: 0,
    }
  }

  _updateDimensions() {
    if (window.innerWidth < 360) {
      this.setState({
        chartWidth: 288,
        chartHeight: 96,
      })
    } else if (window.innerWidth < 600) {
      this.setState({
        chartWidth: window.innerWidth - 48,
        chartHeight: (window.innerWidth - 48) / 2.5,
      })
    } else {
      let gridsize = window.innerWidth * .5;

      this.setState({
        chartWidth: gridsize - 48,
        chartHeight: (gridsize - 48) * .84,
      })
    }
  }

  componentDidMount() {
    this._updateDimensions();
    window.addEventListener('resize', this._updateDimensions.bind(this));
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this._updateDimensions.bind(this));
  }

  render() {
    const { classes } = this.props;
    const { chartWidth, chartHeight, chartData, chartOptions } = this.state;

    return (
      <div className={classes.root}>
        <VotoNavBar />

        <Grid
          container
          className={classes.container}
          direction="row"
        >

          <Grid item xs={12} sm={6}>
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

          <Grid item xs={12} sm={6}>
            <Card className={classes.chartContainer}>
              <CardContent
                className={classes.chart}
                style={{
                  width: chartWidth,
                  height: chartHeight,
                  minHeight: 96,
                }}
              >
                <Bar
                  data={chartData}
                  options={chartOptions}
                />
              </CardContent>
            </Card>
          </Grid>

        </Grid>

      </div>
    );
  }


}

export default withStyles(styleSheet)(TeacherHostPage);
