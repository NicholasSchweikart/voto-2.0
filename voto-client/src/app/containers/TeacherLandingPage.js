import React from 'react';
import {
  withStyles,
  createStyleSheet
} from 'material-ui/styles';
import {
  blueGrey,
  indigo,
} from 'material-ui/colors';
import {
  Grid,
  Card,
} from 'material-ui';
import {
  CardContent,
  CardActions,
  CardMedia,
} from 'material-ui/Card';
import VotoNavBar from '../components/VotoNavBar';
import DashboardCard from '../components/DashboardCard';
import logo from '../images/logo.png'

const styleSheet = createStyleSheet('TeacherLandingPage', {
  root: {
    flex: 1,
    backgroundColor: blueGrey[500],
  },
  cardContainer: {
    padding: 16,
  },
  logo: {
    width: '100%',
  }
});

class TeacherLandingPage extends React.Component {

  render() {
    const { classes } = this.props;

    return (
      <div className={classes.root}>
        <VotoNavBar />
        <Grid container className={classes.cardContainer}>

          <DashboardCard name="CS3421" />
          <DashboardCard name="CS3422" />
          <DashboardCard name="CS3423" />
          <DashboardCard name="CS3424" />
          <DashboardCard name="CS3425" />
          <DashboardCard name="CS3426" />
          <DashboardCard name="CS3427" />
          <DashboardCard name="CS3428" />
          <DashboardCard name="CS3429" />
          <DashboardCard name="CS3425" />


        </Grid>
      </div>
    );
  }

}

export default withStyles(styleSheet)(TeacherLandingPage);