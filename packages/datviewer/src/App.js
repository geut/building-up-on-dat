import React, { Component } from 'react';
import Grid from '@material-ui/core/Grid';
import { withStyles } from '@material-ui/core/styles';
import NavBar from './components/NavBar.js';
import DatContent from './components/ContentHandler';

// P2P
import DatHandler from './p2p/datHandler';

const styles = theme => ({
  root: {
    flexGrow: 1,
  }
});

class App extends Component {
  render() {
    const { classes } = this.props;
    return (
      <div className={classes.root}>
        <Grid container spacing={8}>
          <NavBar />
          <Grid item xs={12}>
            <DatContent datHandler={DatHandler} />
          </Grid>
        </Grid>
      </div>
    );
  }
}

export default withStyles(styles)(App);
