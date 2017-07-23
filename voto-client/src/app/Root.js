import React from 'react';
import VotoNavBar from './components/VotoNavBar';
import LoginPage from './containers/LoginPage';
import TeacherLandingPage from './containers/TeacherLandingPage';
import TeacherHostPage from './containers/TeacherHostPage';

export default class Root extends React.Component {

  render() {
    return (
      <TeacherHostPage />
    );
  }
}
