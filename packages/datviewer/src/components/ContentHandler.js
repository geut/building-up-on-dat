import React, { Component } from 'react';

import { Tree } from '@latticejs/tree';
import prettyBytes from 'pretty-bytes';
// Material UI
import { withStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import Chip from '@material-ui/core/Chip';
import CircularProgress from '@material-ui/core/CircularProgress';
// ours
import InputDat from './InputDat';
import HealthBoard from './HealthBoard.js';

const styles = theme => ({
  root: {
    ...theme.mixins.gutters(),
    paddingTop: theme.spacing.unit * 2,
    paddingBottom: theme.spacing.unit * 2,
  },
  progress: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    marginLeft: 'auto',
    marginRight: 'auto'
  }
});

class DatContent extends Component {
  state = {
    datContent: [],
    parentsData: {},
    archive: undefined,
    loadingDat: false
  };

  datContentLoader = async (dat) => {
    const { content, archive, swarm } = await this.props.datHandler.loadDat(dat);
    this.setState({
      datContent: content,
      archive,
      swarm
    });
  }

  updateTreeWithChildren(tree, result, item, idx=0, original, parentIdx) {
    // inserts children into item.label (following the fullpath)
    // and updates the whole structure recursively
    if (tree[item.nativeIndex] && tree[item.nativeIndex].label === item.label){
      tree[item.nativeIndex].children = tree[item.nativeIndex].children.concat(result);
      return tree;
    }
    const deep = item.fullPath.split('/');
    const deepItem = tree.find(el => el.label === deep[idx]);
    idx = idx + 1;
    return this.updateTreeWithChildren(tree[deepItem.nativeIndex].children, result, item, idx, tree, deepItem.nativeIndex);
  }

  retrieveChildrenContent = async (item) => {
    if (!item.children) return; // has no children
    if (item.children.length) return; // children has been already loaded
    const updateParents = Object.assign({}, this.state.parentsData);
    if (!updateParents[item.label]) {
      updateParents[item.label] = {
        parents: []
      };
    }
    updateParents[item.label].parents.push(item.label);
    const result = await this.props.datHandler.getChildrens(
      { parents: updateParents[item.label].parents },
      this.state.archive,
      item
    );
    const copy = this.state.datContent.slice();
    this.updateTreeWithChildren(copy, result, item);

    this.setState({
      datContent:copy,
      parentsData: updateParents
    })
  }

  showFileInfo = ({ item }) => {
    return (
      <div key={`fileInfo__${item.label}`}>
        {item.size ? <Chip label={prettyBytes(item.size)} /> : ''}
        {item.modifiedTimestamp ? <Chip label={new Intl.DateTimeFormat().format(new Date(item.modifiedTimestamp))} /> : ''}
      </div>
    )
  }

  loadingDatUpdate = (lookingForDat) => {
    const datContent = lookingForDat ? [] : this.state.datContent
    const parentsData = lookingForDat ? {} : this.state.parentsData
    const archive = lookingForDat ? undefined : this.state.archive

    this.setState({
      loadingDat: lookingForDat,
      datContent,
      parentsData,
      archive
    })
  }

  render () {
    const { datContent, archive, swarm, loadingDat } = this.state;
    const { classes } = this.props;
    return (
      <div>
        <InputDat datLinkHandler={this.datContentLoader} onUpdate={this.loadingDatUpdate}/>

        {loadingDat ?
          <CircularProgress className={classes.progress} size={80}/>
          : ''
        }

        {datContent.length ?
          <>
            <Typography variant="h3" gutterBottom={true}>
              Content
            </Typography>
            <Tree
              treeData={datContent}
              showChecks={false}
              onUnfoldItem={this.retrieveChildrenContent}
              secondaryActions={[this.showFileInfo]}
            />
          </>
          : ''
        }

        {archive ? <HealthBoard archive={archive} swarm={swarm}/> : ''}
      </div>
    )
  }
}

export default withStyles(styles)(DatContent);
