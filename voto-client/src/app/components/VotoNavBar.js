import React from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
} from 'material-ui';
import {
  Menu as MenuIcon,
} from 'material-ui-icons';
import VotoNavDrawer from './VotoNavDrawer';

import './styles/VotoNavBarStyles.css';

export default class VotoNavBar extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      open: false,
      drawNavHeader: this.props.drawNavHeader,
    };
  }

  componentWillReceiveProps(nextProps) {
    this.setState(nextProps);
  }

  _handleDrawerOpen() {
    this.setState({
      open: true,
    });
  }

  _handleDrawerClose() {
    this.setState({
      open: false,
    })
  }

  render() {
    const { drawNavHeader } = this.state;

    return (
      <div className="nav-bar-container">
        <AppBar
          position="static"
          className="nav-bar-app"
        >
          <Toolbar className="no-padding">
            {drawNavHeader &&
              <div className="nav-bar-side-nav-header">
                <span className="nav-bar-side-nav-header-text">
                  voto
                </span>
              </div>
            }
            {!drawNavHeader &&
              <IconButton onClick={this._handleDrawerOpen.bind(this)}>
                <MenuIcon />
              </IconButton>
            }
          </Toolbar>
        </AppBar>
        <VotoNavDrawer
          open={this.state.open}
          onRequestClose={this._handleDrawerClose.bind(this)}
          onClick={this._handleDrawerClose.bind(this)}
        />
      </div>
    );
  }
}