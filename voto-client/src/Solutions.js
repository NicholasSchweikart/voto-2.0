import React from 'react';

class Solutions extends React.Component{
  constructor(props) {
      super(props);
      this.state = {
        answerChosen: null,
        buttons: [],
      };
  }

  componentDidMount() {
    fetch('/choices').then((res) => res.json())
    .then((buttons) => {this.setState({ buttons })});
  }

  render() {
    const answer = this.state.answerChosen;

    let header = (answer ? <span>You have selected {answer}</span> : null);

    return (
      <div>
        {header}
        <br />
        {this.state.buttons.map((l, i) => {
          return (
            <button onClick={() => this.setState({answerChosen: l.id})}>
              {l.id}
            </button>
          );
        })}
      </div>
    );
  }
}

export default Solutions;
