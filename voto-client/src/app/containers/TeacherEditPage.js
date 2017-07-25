import React from 'react';

import {
  withStyles,
  createStyleSheet,
} from 'material-ui/styles';
import {
  blueGrey,
  indigo,
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
  IconButton
} from 'material-ui';
import {
  Image,
  Delete,
  Edit,
  ArrowBack,
  ArrowForward,
} from 'material-ui-icons';

import VotoNavBar from '../components/VotoNavBar';
import EditSlidePreview from '../components/EditSlidePreview';

import slide from '../images/classroom.jpg';
import sampleslide from '../images/sampleslide.png';

const styleSheet = createStyleSheet('TeacherEditPage', {
  root: {
    flex: 1,
    backgroundColor: blueGrey[500],
    flexDirection: 'column',
  },
  container: {
    flex: 1,
    padding: 8,
  },
  slidePreviewContainer: {
    display: 'flex',
    flex: 1,
    flexDirection: 'row',
    overflowX: 'auto',
  },
  selectedSlideContainer: {
    display: 'flex',
    flexDirection: 'column',
    borderRadius: 0,
  },
  selectedSlide: {
    width: '100%',
  },
  infoContainer: {
    height: '100%',
    display: 'flex',
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'center',
  }
});

class TeacherEditPage extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      width: 0,
    }
  }

  _updateWidth() {
    if (window.innerWidth >= 960) {
      this.setState({
        width: window.innerWidth / 2 - 16,
      })
    } else {
      this.setState({
        width: window.innerWidth - 16,
      })
    }
  }

  componentDidMount() {
    this._updateWidth();
    window.addEventListener('resize', this._updateWidth.bind(this));
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this._updateWidth.bind(this));
  }

  render() {

    const { classes } = this.props;

    return (
      <div className={classes.root}>
        <VotoNavBar />

        <Grid
          container
          className={classes.container}
          direction="row"
        >

          <Grid item xs={12} md={6}>

            <Grid
              container
              direction="column"
            >
              <Grid item xs={12}>
                <div className={classes.slidePreviewContainer} style={{ width: this.state.width }}>

                  <EditSlidePreview />
                  <EditSlidePreview />
                  <EditSlidePreview />
                  <EditSlidePreview />
                  <EditSlidePreview />
                  <EditSlidePreview />


                </div>
              </Grid>

              <Grid item xs={12}>
                <Card className={classes.selectedSlideContainer}>

                  <CardMedia>
                    <img src={slide} alt="Selected Slide" className={classes.selectedSlide} />
                  </CardMedia>

                  <CardActions>
                    <IconButton aria-label="Previous Slide">
                      <ArrowBack />
                    </IconButton>
                    <div style={{flexGrow: 1}} />
                    <IconButton aria-label="Select New Image">
                      <Image />
                    </IconButton>
                    <IconButton aria-label="Delete This Slide">
                      <Delete />
                    </IconButton>
                    <div style={{flexGrow: 1}} />
                    <IconButton aria-label="Forward Slide">
                      <ArrowForward />
                    </IconButton>
                  </CardActions>

                </Card>
              </Grid>
            </Grid>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card className={classes.infoContainer}>
            </Card>
          </Grid>

        </Grid>
      </div>
    );
  }

}

export default withStyles(styleSheet)(TeacherEditPage);