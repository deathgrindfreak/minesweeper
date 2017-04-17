import React, { Component } from 'react';
import './App.css';

class App extends Component {
  render() {
    return <Grid height="10" width="10"/>
  }
}

class Grid extends Component {
  constructor() {
    super();
    this.state = {
      grid: this.generateGrid()
    };
  }
  
  static generateGrid() {}
  
  render() {
    // Create the table body
    let cells = [], rows = [];
    for (let i = 0; i < this.props.width; i++) {
      for (let j = 0; j < this.props.height; j++)
        cells.push(<Cell />);
      rows.push(<tr className="mine-row">{cells}</tr>);
      cells = [];
    }
    
    return (
      <table className="mine-table">
        <tbody>
          {rows}
        </tbody>
      </table>
    );
  }
}

class Cell extends Component {
  constructor() {
    super();
    this.state = {
      id: "mine-button"
    };
  }
  
  cellClicked() {
    this.setState({id: "mine-cell"});
  }
  
  render() {
    return (
      <td id={this.state.id} onClick={() => this.cellClicked()}></td>
    );
  }
}

export default App;
