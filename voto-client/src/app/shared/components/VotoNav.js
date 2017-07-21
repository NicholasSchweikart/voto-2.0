import React from 'react';
import './VotoNav.css';

import {
  Link
} from 'react-router-dom';

import {
  Icon,
} from 'react-materialize';

export default class VotoNav extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      isTeacher: this.props.teacher,

    }
  }

  render() {

    const { isTeacher } = this.state;

    return (
      <nav className='blue darken-2'>
        <div className='nav-wrapper container'>
          <span className='brand-logo center'>Voto</span>
          <ul className='right hide-on-med-and-down'>
            {isTeacher && (
              <li>
                <Link to={`/`}><Icon>trending_up</Icon></Link>
              </li>)
            }
            <li>
              <Link to={`/`}><Icon>refresh</Icon></Link>
            </li>
            <li>
              <a className='dropdown-button' data-activates='dots-dropdown'><Icon>more_vert</Icon></a>
            </li>
          </ul>

          <ul id='dots-dropdown' className='dropdown-content'>
            <li>
              <Link to={`/`}><span className='blue-text text-darken-4'>Settings</span></Link>
            </li>
            <li>
              <Link to={`/`}><span className='blue-text text-darken-4'>Legal</span></Link>
            </li>
            {isTeacher && (
              <li>
                <Link to={`/`}><span className='blue-text text-darken-4'>Logout</span></Link>
              </li>)
            }
          </ul>

          <ul id='nav-mobile' className='side-nav center'>
            {isTeacher && (
              <li>
                <Link to={`/`}>
                  <span className='blue-text text-darken-4'><Icon>trending_up</Icon></span>
                </Link>
              </li>)
            }
            <li>
              <Link to={`/`}>
                <span className='blue-text text-darken-4'><Icon>refresh</Icon></span>
              </Link>
            </li>
            <li>
              <Link to={`/`}><span className='blue-text text-darken-4'>Settings</span></Link>
            </li>
            <li>
              <Link to={`/`}><span className='blue-text text-darken-4'>Legal</span></Link>
            </li>
            {isTeacher && (
              <li>
                <Link to={`/`}><span className='blue-text text-darken-4'>Logout</span></Link>
              </li>)
            }
          </ul>

          <a className='button-collapse show-on-small' data-activates='nav-mobile'><Icon>menu</Icon></a>
        </div>
      </nav>
    );
  }

}
