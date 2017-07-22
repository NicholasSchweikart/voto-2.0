import React from 'react';
import PropTypes from 'prop-types';
import {
  withStyles,
  createStyleSheet
} from 'material-ui/styles';
import {
  Drawer,
  Button,
  Divider
} from 'material-ui';
import List, {
  ListItem,
  ListItemIcon,
  ListItemText
} from 'material-ui/List';
import {
  TrendingUp,
  Autorenew
} from 'material-ui-icons';


const styleSheet = createStyleSheet('VotoNavDrawer', {

});

class VotoNavDrawer extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      open: this.props.open,
    }
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      open: nextProps.open,
    })
  }

  closeDrawer = () => {
    this.setState({
      open: false,
    });
  };

  render() {
    const { classes } = this.props;

    const listItems = (
      <div>
        <ListItem button>
          <ListItemIcon>
            <TrendingUp />
          </ListItemIcon>
          <ListItemText primary="Display Graph"/>
        </ListItem>
        <ListItem button>
          <ListItemIcon>
            <Autorenew />
          </ListItemIcon>
          <ListItemText primary="Refresh"/>
        </ListItem>
      </div>
    );

    return (
      <div>
        <Drawer
          anchor="left"
          open={this.state.open}
          onRequestClose={this.closeDrawer}
          onClick={this.closeDrawer}
        >
          {listItems}
        </Drawer>
      </div>
    )
  }
}

export default withStyles(styleSheet)(VotoNavDrawer);