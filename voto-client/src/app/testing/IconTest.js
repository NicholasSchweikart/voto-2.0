import React from 'react';

import {
  withStyles,
  createStyleSheet,
} from 'material-ui/styles';
import {
  CardActions,
} from 'material-ui/Card';
import {
  Grid,
  Card,
  IconButton
} from 'material-ui';
import {
  Image
} from 'material-ui-icons';

class IconTest extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      width: 0,
    }
  }

  _updateWidth() {
    this.setState({
      width: window.innerWidth,
    })
  }

  componentDidMount() {
    this._updateWidth();
    window.addEventListener('resize', this._updateWidth.bind(this));
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this._updateWidth.bind(this));
  }

  render() {
    return (
    <Grid
      container
    >
    <div style={{display: 'flex', width: this.state.width}}>
    <div style={{display: 'flex', flex: 1, overflowX: 'auto', flexDirection: 'row'}}>
      <Grid item xs={6} sm={4} md={3}>
        <Card>
          <CardActions>
            <IconButton>
              <Image />
            </IconButton>
            <IconButton>
              <Image />
            </IconButton>
            <IconButton>
              <Image />
            </IconButton>
          </CardActions>
        </Card>
      </Grid>
      <Grid item xs={6} sm={4} md={3}>
        <Card>
          <CardActions>
            <IconButton>
              <Image />
            </IconButton>
            <IconButton>
              <Image />
            </IconButton>
            <IconButton>
              <Image />
            </IconButton>
          </CardActions>
        </Card>
      </Grid>
      <Grid item xs={6} sm={4} md={3}>
        <Card>
          <CardActions>
            <IconButton>
              <Image />
            </IconButton>
            <IconButton>
              <Image />
            </IconButton>
            <IconButton>
              <Image />
            </IconButton>
          </CardActions>
        </Card>
      </Grid>
      <Grid item xs={6} sm={4} md={3}>
        <Card>
          <CardActions>
            <IconButton>
              <Image />
            </IconButton>
            <IconButton>
              <Image />
            </IconButton>
            <IconButton>
              <Image />
            </IconButton>
          </CardActions>
        </Card>
      </Grid>
      <Grid item xs={6} sm={4} md={3}>
        <Card>
          <CardActions>
            <IconButton>
              <Image />
            </IconButton>
            <IconButton>
              <Image />
            </IconButton>
            <IconButton>
              <Image />
            </IconButton>
          </CardActions>
        </Card>
      </Grid>
      <Grid item xs={6} sm={4} md={3}>
        <Card>
          <CardActions>
            <IconButton>
              <Image />
            </IconButton>
            <IconButton>
              <Image />
            </IconButton>
            <IconButton>
              <Image />
            </IconButton>
          </CardActions>
        </Card>
      </Grid>
      <Grid item xs={6} sm={4} md={3}>
        <Card>
          <CardActions>
            <IconButton>
              <Image />
            </IconButton>
            <IconButton>
              <Image />
            </IconButton>
            <IconButton>
              <Image />
            </IconButton>
          </CardActions>
        </Card>
      </Grid>
      <Grid item xs={6} sm={4} md={3}>
        <Card>
          <CardActions>
            <IconButton>
              <Image />
            </IconButton>
            <IconButton>
              <Image />
            </IconButton>
            <IconButton>
              <Image />
            </IconButton>
          </CardActions>
        </Card>
      </Grid>
      <Grid item xs={6} sm={4} md={3}>
        <Card>
          <CardActions>
            <IconButton>
              <Image />
            </IconButton>
            <IconButton>
              <Image />
            </IconButton>
            <IconButton>
              <Image />
            </IconButton>
          </CardActions>
        </Card>
      </Grid>
      </div>
      </div>
    </Grid>
    );
  }
}

export default IconTest;
