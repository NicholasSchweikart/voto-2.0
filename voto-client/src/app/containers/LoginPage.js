import React from 'react';
import {
  withStyles,
  createStyleSheet
} from 'material-ui/styles';
import {
  blue,
  blueGrey,
  indigo,
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

//IMAGE IMPORTS
import logo from '../images/logo.png';

const styleSheet = createStyleSheet('LoginPage', {
  root: {
    flex: 1,
    backgroundColor: blueGrey[700],
    padding: 30,
  },
  fillHeight: {
    height: '100%',
  },
  card: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    width: 320,
    padding: 32,
    boxShadow: '0 14px 28px rgba(0,0,0,0.25), 0 10px 10px rgba(0,0,0,0.22)',
  },
  logo: {
    width: 128,
    height: 128,
  },
  title: {
    color: indigo[500],
    fontSize: 32,
  },
  field: {
    width: 256,
    fontSize: 20,
  },
  input: {
    color: indigo[700],
    textUnderlineColor: indigo[700],
  },
  label: {
    color: indigo[200],
  },
  button: {
    width: 96,
    margin: 8,
  },
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
            className={classes.fillHeight}
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
                  <Typography type="root" className={classes.title}>
                    V O T O
                  </Typography>
                </CardContent>

                <CardContent>
                  <TextField
                    id="email"
                    label="Email"
                    labelClassName={classes.label}
                    className={classes.field}
                    InputClassName={classes.input}
                  />
                </CardContent>

                <CardContent>
                  <TextField
                    id="password"
                    label="Password"
                    labelClassName={classes.label}
                    className={classes.field}
                    InputClassName={classes.input}
                  />
                </CardContent>

                <CardContent style={{paddingBottom: 0}}>
                  <Button raised color="primary"
                          className={classes.button}>
                    <Typography type="button">
                      Login
                    </Typography>
                  </Button>

                  <Button raised color="primary"
                          className={classes.button}>
                    <Typography type="button">
                      Register
                    </Typography>
                  </Button>
                </CardContent>

                <CardContent style={{paddingTop: 8}}>
                  <Button raised color="primary"
                          style={{width: 208}}>
                    <Typography type="button">
                      Students, Click Here
                    </Typography>
                  </Button>
                </CardContent>

                <CardContent>
                  <Typography type="caption">
                    Forgot Your Password?
                  </Typography>
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