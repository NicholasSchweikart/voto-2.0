import React from 'react';
import VotoNavBar from '../components/VotoNavBar';
import { VotoSideNav } from '../components/VotoSideNav';

import './styles/VotoNavWrapperStyles.css';

export default class VotoNavWrapper extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      drawSideNav: true,
    }
  }

  componentDidMount() {
    this._handleResize();
    window.addEventListener('resize', this._handleResize.bind(this));
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this._handleResize.bind(this));
  }

  _handleResize() {
    this.setState({
      drawSideNav: (window.innerWidth >= 768),
    })
  }

  render() {
    const { drawSideNav } = this.state;

    return (
      <div className="nav-wrapper">
        <VotoNavBar drawNavHeader={drawSideNav} />
        <div className="nav-bottom-wrapper">
          {drawSideNav &&
            <VotoSideNav />
          }
          {this.props.children}
        </div>
      </div>
    );
  }
}