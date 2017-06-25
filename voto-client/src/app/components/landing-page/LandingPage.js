import React from 'react';
import './LandingPageStyles.css';
import {
  Button,
  Icon,
  Row,
  Col,
} from 'react-materialize';

export default class LandingPage extends React.Component {

  render() {
    return (
      <div className = "background white-text">
        <h1 className = "center">
          Welcome to VOTO
        </h1>
        <br />
        <h2 className = "center">
          Select an option
        </h2>
        <br />
        <Row>
          <Col s={6} className = "center">
            <Icon large>speaker_phone</Icon>
            <br />
            <Button className = "blue darken-2" large
             onClick = {this.handleClick.bind(this, "student")}>
              Student</Button>
          </Col>
          <Col s={6} className = "center">
            <Icon large>perm_identity</Icon>
            <br />
            <Button className = "blue darken-2" large
             onClick = {this.handleClick.bind(this, "teacher")}>
              Teacher</Button>
          </Col>
        </Row>
      </div>
    );
  }

  handleClick(param) {
    if(param === "student") {
      console.log("student");
    } else {
      console.log("teacher");
    }

  }
}
