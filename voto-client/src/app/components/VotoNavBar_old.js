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
import {
  indigo,
  blue
} from 'material-ui/colors';
import VotoNavDrawer from './VotoNavDrawer';

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
        <AppBar position="static" className={classes.indigo}>
          <Toolbar style={{padding: 0}}>
          <div style={{display: 'flex', alignItems: 'center', width: 256, height: '100%', backgroundColor: '#3185db'}}>
          <Typography type="headline" color="inherit" align="center" className={classes.flex}>
            voto
          </Typography>
          </div>
          <IconButton onClick={this.openDrawer.bind(this)}>
          <MenuIcon />
          </IconButton>
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
