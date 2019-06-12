import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Hyperhealth from 'hyperhealth';
import prettyBytes from 'pretty-bytes';
// Material UI
import { withStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import IconButton from '@material-ui/core/IconButton';
import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';
import LinearProgress from '@material-ui/core/LinearProgress';
import Tooltip from '@material-ui/core/Tooltip';
import LinkIcon from '@material-ui/icons/Link';

const styles = theme => ({
  root: {
    flexGrow: 1,
  },
  paper: {
    padding: theme.spacing.unit * 2,
    textAlign: 'center',
    color: theme.palette.text.secondary,
  },
  progress: {
    margin: theme.spacing.unit * 2,
    padding: theme.spacing.unit
  },
  OPEN: {
    color: 'green'
  },
  CLOSED: {
    color: 'red'
  }
});

const eachWSState = (ws) => {
  return ws.map(getWSState);
}

const getWSState = (ws) => {
  let label = 'CLOSED';
  switch (ws.readyState) {
    case 0:
      label = 'CONNECTING';
      break;
    case 1:
      label = 'OPEN';
      break;
    case 2:
      label = 'CLOSING';
      break;
    case 3:
      label = 'CLOSED';
      break;
    default:
      label = 'UNKNOWN';
  }

  return {
    readystate: ws.readyState,
    label,
    url: ws.url
  }
}

class HealthBoard extends Component {

  constructor(props) {
    super(props);
    this.state = {
      intervalId: undefined,
      health: {},
      hubsState: [],
      discoveryState: []
    }
    this.hyperh = Hyperhealth(props.archive, props.options);
  }

  componentDidMount () {
    const { swarm , options, archive } = this.props;
    var intervalId = setInterval(this.check, options.checkInterval);
    // store intervalId in the state so it can be accessed later:
    this.setState({intervalId: intervalId});

    swarm.dss.on('connection', (connection, info) => {
      // get info about swarm connection
      console.log('discoverySwarmStatus:connection', connection);
      console.log('discoverySwarmStatus:info', info)
      this.setState({
        discoverySwarmStatus: {
          connection,
          info
        }
      })
    })

    // listen to websocket swarm events
    /*
    swarm.dss.on('discovery-swarm-stream-websocket:error', (err) => {
      this.setState({
        dssError: err
      })
    });


    swarm.on('discovery-swarm-web:error', (err) => {
      console.log('discovery-swarm-web:error', err)
      this.setState({
        dssError: err
      })
    })

    swarm.on('discovery-swarm-web:warn', (err) => {
      console.log('discovery-swarm-web:warn', err)
      this.setState({
        dssError: err
      })
    })

    swarm.webrtc.on('error', (err) => {
      console.log('webrtc error', err)
      this.setState({
        webrtc: err
      })
    })

    swarm.webrtc.on('warn', (err) => {
      console.log('webrtc warn', err)
      this.setState({
        webrtc: err
      })
    })

      */

    archive.on('error', (err) => {
      this.setState({
        archiveError: err
      })
    })
  }

  componentWillUnmount () {
    // use intervalId from the state to clear the interval
    clearInterval(this.state.intervalId);
  }

  check = () => {
    const { swarm } = this.props;
    const update = this.hyperh.get();
    const hubsState = eachWSState(swarm.hub.sockets);
    // const discoveryState = eachWSState([swarm.dss.connection.socket]);

    this.setState({
      health: update,
      hubsState,
    });
  }

  render() {
    const { classes, archive } = this.props;
    const { health, hubsState, discoveryState } = this.state;
    return (
      <div className={classes.root}>
        <Typography variant="h3" gutterBottom={true}>
          Hyperdrive Health ✚
        </Typography>
        <Grid container spacing={24}>
          <Grid item xs>
            <Paper className={classes.paper} elevation={1}>
              <Typography color="secondary" variant="h5" component="h3">
                Version
              </Typography>
              <Typography component="p" gutterBottom={true}>
                {archive.version}
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs>
            <Paper className={classes.paper} elevation={1}>
              <Typography color="secondary" variant="h5" component="h3">
                Public key
              </Typography>
              <Typography component="p" noWrap={true} gutterBottom={true}>
                {archive.key ? archive.key.toString('hex') : ''}
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs>
            <Paper className={classes.paper} elevation={1}>
              <Typography color="secondary" variant="h5" component="h3">
                Discovery Status
              </Typography>
              {discoveryState.map((item, i) => (
                <Typography key={`discovery_${i}`} component="p" className={classes[item.label]} noWrap={true} gutterBottom={true}>
                  {item.label}
                  <Tooltip title={item.url}>
                    <IconButton size="small" aria-label="external link">
                      <LinkIcon />
                    </IconButton>
                  </Tooltip>
                </Typography>
              ))}
            </Paper>
          </Grid>
          <Grid item xs>
            <Paper className={classes.paper} elevation={1}>
              <Typography color="secondary" variant="h5" component="h3">
                Hubs Status
              </Typography>
              {hubsState.map((item, i) => (
                <Typography key={`hubs_${i}`} component="p" className={classes[item.label]} noWrap={true} gutterBottom={true}>
                  {item.label}
                  <Tooltip title={item.url}>
                    <IconButton size="small" aria-label="external link">
                      <LinkIcon />
                    </IconButton>
                  </Tooltip>
                </Typography>
              ))}
            </Paper>
          </Grid>
          {health ?
          <>
            <Grid item xs>
              <Paper className={classes.paper} elevation={1}>
                <Typography color="secondary" variant="h5" component="h3">
                  Total Peers
                </Typography>
                <Typography component="p" gutterBottom={true}>
                  {health.peers ? health.peers.length : 0}
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs>
              <Paper className={classes.paper} elevation={1}>
                <Typography color="secondary" variant="h5" component="h3">
                  Total Bytes
                </Typography>
                <Typography component="p" gutterBottom={true}>
                  {health.bytes ? prettyBytes(health.bytes) : 0}
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs>
              <Paper className={classes.paper} elevation={1}>
                <Typography color="secondary" variant="h5" component="h3">
                  Total Length
                </Typography>
                <Typography component="p" gutterBottom={true}>
                  {health.byteLength ? prettyBytes(health.byteLength) : 0}
                </Typography>
              </Paper>
            </Grid>
          </>
          : ''}
        </Grid>
        <Grid container spacing={24}>
          {health && health.peers ?
            <Grid item xs={12}>
              <Paper className={classes.paper} elevation={1}>
                <Typography color='secondary' variant="h5" component="h3">
                  Peers Downloads
                </Typography>
                {
                  health.peers.map(p => (
                    <Tooltip title={`Peer ID: ${p.id}`} key={`peerDownload__${p.id}`}>
                      <LinearProgress
                        className={classes.progress}
                        color="secondary"
                        variant="determinate"
                        value={(p.have/p.length)*100}
                      />
                    </Tooltip>
                  ))
                }
              </Paper>
            </Grid>
            : ''
          }
        </Grid>
      </div>
    )
  }
}

HealthBoard.defaultProps = {
  options: {
    checkInterval: 2000
  }
};

HealthBoard.propTypes = {
  archive: PropTypes.object.isRequired,
  options: PropTypes.object,
  swarm: PropTypes.object
};

export default withStyles(styles)(HealthBoard);
