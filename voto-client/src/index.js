import React from 'react';
import ReactDOM from 'react-dom';
import registerServiceWorker from './registerServiceWorker';
import './index.css';
import {
  MuiThemeProvider,
} from 'material-ui/styles';
import Root from './app/Root';

const App = () => (
  <MuiThemeProvider>
    <Root />
  </MuiThemeProvider>
);


ReactDOM.render(<App />, document.getElementById('root'));
registerServiceWorker();
