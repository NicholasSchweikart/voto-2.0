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
  Button,
} from 'material-ui';
import {
  Add
} from 'material-ui-icons';
import VotoNavBar from '../components/VotoNavBar';
import DashboardCard from '../components/DashboardCard';
import logo from '../images/logo.png'

const styleSheet = createStyleSheet('TeacherLandingPage', {
  root: {
    flex: 1,
    backgroundColor: '#eee',
  },
  cardContainer: {
    padding: 8,
  },
  logo: {
    width: '100%',
  },
  fab: {
    backgroundColor: '#F44336',
    color: 'white',
    right: 24,
    bottom: 24,
    top: 'auto',
    position: 'fixed',
    zIndex: 2,
  }
});

class TeacherLandingPage extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      cards: [
        "Demo",
        "Test",
        "CS3425",
        "History",
        "CS4411",
        "UN1015",
        "Japan"
      ]
    }
  }


  render() {
    const { classes } = this.props;
    const { cards } = this.state;

    return (
      <div className={classes.root}>
        {/*<VotoNavBar />*/}
        <Grid container className={classes.cardContainer}>

          {cards.map((name, i) => (
            <DashboardCard name={name} />
          ))}

        </Grid>

        <Button fab className={classes.fab}>
          <Add />
        </Button>

      </div>
    );
  }

}

export default withStyles(styleSheet)(TeacherLandingPage);
