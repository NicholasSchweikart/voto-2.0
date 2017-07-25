import React from 'react';
import {
  Button
} from 'material-ui';

export default class StateTest extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      data: [
        'First',
        'Second',
        'Third',
        'Fourth',
      ],
      index: 0,
    }
  }

  _handleButton() {
    let newIndex = this.state.index + 1;

    if (newIndex >= this.state.data.length) {
      newIndex = 0;
    }

    this.setState({
      index: newIndex,
    });
  }

  render() {
    const { data, index } = this.state

    return (
      <div>
        <span>{data[index]}</span>
        <Button onClick={this._handleButton.bind(this)}>
          Click to change the text!
        </Button>
      </div>
    );
  }
}
