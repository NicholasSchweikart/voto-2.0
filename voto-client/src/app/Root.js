import React from 'react';
import VotoNavBar from './components/VotoNavBar';
import LoginPage from './containers/LoginPage';
import TeacherLandingPage from './containers/TeacherLandingPage';

export default class Root extends React.Component {

  render() {
    return (
      <TeacherLandingPage />
    );
  }
}
