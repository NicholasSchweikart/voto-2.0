import React from 'react';
import {
  Drawer,
  Button,
  Divider,
} from 'material-ui';
import List, {
  ListItem,
  ListItemIcon,
  ListItemText
} from 'material-ui/List';
import {
  Home as HomeIcon,
  DataUsage,
  Folder as FolderIcon,
  FolderOpen as FolderOpenIcon,
  FolderSpecial,
} from 'material-ui-icons';

export default class VotoNavDrawer extends React.Component {

  render() {
    const listItems = (
      <div>
        <ListItem button>
          <ListItemIcon>
            <HomeIcon />
          </ListItemIcon>
          <ListItemText primary="Dashboard" />
        </ListItem>
      </div>
    );

    return (
      <div>
        <Drawer
          anchor="left"
          {...this.props}
        >
          {listItems}
        </Drawer>
      </div>
    );
  }
}