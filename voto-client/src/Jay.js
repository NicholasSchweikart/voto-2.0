import React from 'react';

class Jay extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			count: this.props.init,
		}
	}

	render() {
		return (
			<div>
				<button onClick={() => this.setState({count: this.state.count+1})} >
					{this.props.text}
				</button>
				<span>{this.state.count}</span>
			</div>
		)
	}
}

export default Jay;