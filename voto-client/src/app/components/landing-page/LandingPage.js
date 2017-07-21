import React from 'react';
import './LandingPageStyles.css';

import VotoNav from '../../shared/components/VotoNav';

import VotoIcon from '../../shared/images/voto_icon.png';

export default class LandingPage extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      code: this.props.match.params.code,
    }
  }

  render() {
    return (
      <div>
        <div className='container center top'>
          <div className='card-panel'>
            <img src={VotoIcon} className='responsive-img' alt='' />

          </div>
        </div>
      </div>
    );
  }
}
