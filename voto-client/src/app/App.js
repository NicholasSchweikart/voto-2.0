import React from 'react';
import {
  BrowserRouter as Router,
  Route,
} from 'react-router-dom';
import {LandingPage} from './components/landing-page/index';

export default class App extends React.Component {

  render() {
    return (
      <Router>
        <div>
          <Route exact={true} path="/" component={LandingPage} />
          <Route exact={true} path="/:code" component={LandingPage} />
        </div>
      </Router>
    );
  }

}
