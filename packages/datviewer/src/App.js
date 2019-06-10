import React, { Component } from 'react';
import NavBar from './components/NavBar.js';
import DatContent from './components/ContentHandler';

// P2P
import DatHandler from './p2p/datHandler';

class App extends Component {
  render() {
    return (
      <div className="App">
        <NavBar />
        <DatContent datHandler={DatHandler} />
      </div>
    );
  }
}

export default App;
