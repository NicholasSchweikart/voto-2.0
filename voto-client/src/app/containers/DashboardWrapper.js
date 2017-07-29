import React from 'react';
import SideNav, {
  Nav,
  NavIcon,
  NavText
} from 'react-sidenav';
import {
  blue,
  grey,
} from 'material-ui/colors';
import {
  Avatar,
  Typography,
} from 'material-ui';
import {
  Alarm
} from 'material-ui-icons';
import VotoNavBar from '../components/VotoNavBar';
import background from '../images/background.png';

export const VotoSideNav  = (props) => (
  <div style={{display: 'flex', flex: 1, flexDirection: 'column'}}>
        <VotoNavBar />
  <div style={{ display: 'flex', flex: 1, flexDirection: 'row'}}>
  <div style={{background: '#3d464d', color: '#ada8a5', width: 256, fontSize: 16, paddingTop: 16}}>
        <SideNav highlightColor='#fff' highlightBgColor='#31383e' defaultSelected='sales'>
            <Nav id='dashboard'>
                <NavIcon style={{marginLeft: 16}}><Alarm /></NavIcon>
                <NavText> Test </NavText>
            </Nav>
            <Nav id='sales'>
                <NavIcon><Alarm /></NavIcon>
                <NavText> Sales </NavText>
            </Nav>
        </SideNav>
    </div>
        {props.children}
    </div>
    </div>
);
