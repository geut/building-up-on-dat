import React, { Component } from 'react';
import PropTypes from 'prop-types';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import { withStyles } from '@material-ui/core/styles';

const styles = theme => ({
  container: {
    display: 'flex',
    flexWrap: 'wrap',
  },
  inputDat: {
    marginLeft: theme.spacing.unit,
    marginRight: theme.spacing.unit,
    width: 200,
  },
  button: {
    margin: theme.spacing.unit,
  }
})

class InputDat extends Component {

  state = {
    value: ''
  }

  handleChange = e => {
    const { target } = e;
    this.setState({ value: target.value });
  }

  loadDat = async (e) => {
    const { datLinkHandler, onUpdate } = this.props;
    const { value } = this.state;
    // TODO: parse value as valid dat link
    if (!value) return; // show error log
    onUpdate(true);
    await datLinkHandler({ dat: this.state.value });
    onUpdate(false);
  }

  render () {
    const { classes } = this.props;

    return (
      <form className={classes.container} noValidate autoComplete="off" onSubmit={this.loadDat}>
        <TextField
          id="standard-name"
          label="dat-url"
          className={classes.inputDat}
          value={this.state.datInput}
          onChange={this.handleChange}
          margin="normal"
        />
        <Button
          variant="contained"
          color="primary"
          className={classes.button}
          onClick={this.loadDat}
        >
          Add
        </Button>
      </form>
    )
  }
}

InputDat.propTypes = {
  datLinkHandler: PropTypes.func
};

export default withStyles(styles)(InputDat);
