import React from 'react';
import SideNav, {
  Nav,
  NavIcon,
  NavText,
} from 'react-sidenav';
import {
  Home as HomeIcon,
  DataUsage,
  Folder as FolderIcon,
  FolderOpen as FolderOpenIcon,
  FolderSpecial,
} from 'material-ui-icons';

import './styles/VotoSideNavStyles.css';

export const VotoSideNav = (props) => (
  <div className="side-nav-container">
    <SideNav
      highlightColor="#fff"
      highlightBgColor="#31383e"
      defaultSelected="dashboard"
    >
      <Nav id="dashboard">
        <NavIcon><HomeIcon /></NavIcon>
        <NavText>Dashboard</NavText>
      </Nav>
      <Nav id="sessions">
        <NavIcon><FolderIcon /></NavIcon>
        <NavText>Sessions</NavText>
      </Nav>
      <Nav id="fave-sessions">
        <NavIcon><FolderSpecial /></NavIcon>
        <NavText>Favorite Sessions</NavText>
      </Nav>
      <Nav id="past-sessions">
        <NavIcon><FolderOpenIcon /></NavIcon>
        <NavText>Past Sessions</NavText>
      </Nav>
      <Nav id="data">
        <NavIcon><DataUsage /></NavIcon>
        <NavText>Data</NavText>
      </Nav>
    </SideNav>
  </div>
);