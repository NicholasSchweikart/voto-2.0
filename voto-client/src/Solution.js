import React from 'react';

class Solution extends React.Component{ 
    constructor(props) {
        super(props);
        this.state = {
            clicked: false
        }
    }

    render() {
        return ( 
            <span>
                <button onClick = {() => this.setState({clicked: true})} >
                    {this.props.text}
                </button>
            </span>         
        );
    }

}

export default Solution;
