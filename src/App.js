import React, { Component } from 'react';
import './App.css';

class App extends Component {
  render() {
    return <Grid height="10" width="10"/>
  }
}

class Grid extends Component {
  constructor(props) {
    super(props);
    this.state = {
      bombs: this.generateBombs()
    };
  }
  
  // Generate a number of bombs randomly between 
  generateBombs() {
    const median = Math.max(this.props.width, this.props.height);
    const offset = Math.floor(median / 4);
    let numberOfBombs = getRandomInt(median - offset, median + offset);
    
    console.log(numberOfBombs);
    
    let bombs = {};
    while (numberOfBombs > 0) {
      let x = getRandomInt(0, this.props.width);
      if (!bombs[x]) {
        let y = getRandomInt(0, this.props.height);
        if (!bombs[y]) {
          bombs[x] = y;
          numberOfBombs--;
        }
      }
    }
    
    console.log(bombs);
    return bombs;
    
    function getRandomInt(min, max) {
      return Math.floor(Math.random() * (max - min + 1)) + min;
    }
  }
  
  render() {
    // Create the table body
    let cells = [], rows = [];
    for (let i = 0; i < this.props.height; i++) {
      for (let j = 0; j < this.props.width; j++)
        cells.push(<Cell />);
      rows.push(<tr>{cells}</tr>);
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
    this.setState({id: null});
  }
  
  render() {
    return (
      <td id={this.state.id} 
          className='mine-cell' 
          onClick={() => this.cellClicked()}>
      </td>
    );
  }
}

export default App;
