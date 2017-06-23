import React, { Component } from 'react';
import './App.css';
import Solutions from './Solutions';
import Question from './Question';


class App extends Component {
    constructor(props) {
        super(props);
        this.state = {URL: "https://nesncom.files.wordpress.com/2013/07/miguel-cabrera.gif"}
        //placeholder for when url will be arbitrary
    }

    render() {
        return (
            <div className="App">
                <div className="App-header">
                    <img src='https://www.umsl.edu/technology/frc/images/student-iclicker.png' className="App-logo" alt="logo" />
                    <h2>Welcome to Jay`s Big Happy iClicker App</h2>
                </div>

                <Question url= {this.state.URL} />
                <Solutions />

            </div>
        );
    } 
}

export default App;
