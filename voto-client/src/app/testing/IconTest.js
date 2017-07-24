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

const IconTest = (props) => {
  return (
    <Grid
      container
    >
    <div style={{display: 'flex', width: 400}}>
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

export default IconTest;
