import React from 'react';
import {
  withStyles,
  createStyleSheet
} from 'material-ui/styles';
import {
  blue
} from 'material-ui/colors';
import {
  CardContent,
  CardActions,
  CardMedia,
} from 'material-ui/Card';
import {
  Grid,
  Card,
  Typography,
  TextField,
  Button,
} from 'material-ui';
import {
  Email,
  VpnKey
} from 'material-ui-icons';

import logo from '../images/logo.png';

const styleSheet = createStyleSheet('LoginPage', {
  root: {
    flex: 1,
    backgroundColor: blue[500],
  },
  height: {
    height: '100%',
  },
  card: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    width: 300,
    padding: 32,
    boxShadow: '0 14px 28px rgba(0,0,0,0.25), 0 10px 10px rgba(0,0,0,0.22)',
  },
  logo: {
    width: 100,
    height: 100,
  },
  title: {
    color: blue[700],
  },
  input: {
    width: 250,
  }
});

class LoginPage extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      email: '',
      password: ''
    };
  }

  render() {
    const { classes } = this.props;

    return (
      <Grid container className={classes.root}>
        <Grid item xs={12}>
          <Grid
            container
            className={classes.height}
            align="center"
            direction="row"
            justify="center"
          >
            <Grid item>

              <Card className={classes.card}>
                <CardMedia>
                  <img src={logo} alt="Icon" className={classes.logo} />
                </CardMedia>

                <CardContent>
                  <Typography type="title" className={classes.title}>
                    V O T O
                  </Typography>
                </CardContent>

                <CardContent>
                  <TextField
                    id="email"
                    label="Email"
                    className={classes.input}
                  />
                </CardContent>

                <CardContent>
                  <TextField
                    id="password"
                    label="Password"
                    className={classes.input}
                  />
                </CardContent>

                <CardContent>
                  <Button raised color="primary" style={{width: 250, marginTop: 16}}>
                    L O G I N
                  </Button>
                </CardContent>
              </Card>

            </Grid>
          </Grid>
        </Grid>
      </Grid>
    );
  }
}

export default withStyles(styleSheet)(LoginPage);