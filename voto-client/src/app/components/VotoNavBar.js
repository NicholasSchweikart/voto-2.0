import React from 'react';
import PropTypes from 'prop-types';
import {
  withStyles,
  createStyleSheet
} from 'material-ui/styles';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
} from 'material-ui';
import MenuIcon from 'material-ui-icons/Menu';
import VotoNavDrawer from './VotoNavDrawer';

const styleSheet = createStyleSheet('VotoNavBar', {
  root: {
    width: '100%',
  },
  flex: {
    flex: 1,
  },
});

class VotoNavBar extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      drawerOpen: false,
    };
  }

  openDrawer = () => {
    this.setState({
      drawerOpen: true,
    })
  };

  render() {
    const { classes } = this.props;

    return (
      <div className={classes.root}>
        <AppBar position="static">
          <Toolbar>
            <IconButton color="contrast" aria-label="Menu" onClick={this.openDrawer}>
              <MenuIcon />
            </IconButton>
            <Typography type="title" color="inherit" align="center" className={classes.flex}>
              Voto
            </Typography>
            <Button color="contrast">Login</Button>
          </Toolbar>
        </AppBar>
        <VotoNavDrawer open={this.state.drawerOpen}/>
      </div>
    );
  }
};

VotoNavBar.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styleSheet)(VotoNavBar);