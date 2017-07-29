import React from 'react';
import VotoNavBar from './components/VotoNavBar';
import LoginPage from './containers/LoginPage';
import TeacherLandingPage from './containers/TeacherLandingPage';
import TeacherHostPage from './containers/TeacherHostPage';
import TeacherEditPage from './containers/TeacherEditPage';

import { VotoSideNav } from './components/VotoSideNav'

import IconTest from './testing/IconTest';
import StateTest from './testing/StateTest';
import VotoNavWrapper from './containers/VotoNavWrapper';

export default class Root extends React.Component {

  render() {
    return (
      <VotoNavWrapper>
        <TeacherLandingPage/>
      </VotoNavWrapper>
    );
  }
}
