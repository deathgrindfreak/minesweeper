import React, { Component } from 'react';
import './App.css';

class App extends Component {
  render() {
      return <Grid height={10} width={10}/>;
  }
}

class Grid extends Component {
  constructor(props) {
    super(props);
    this.state = {
      boardState: this.createBoard()
    };
  }

  createBoard() {
    const bombs = this.generateBombs();
    let board = Array(this.props.height).fill(Array(this.props.width).fill(null));
    
    return board.map(function(row, y) {
      return row.map(function(cell, x) {
        let isBomb = bombs.checkBomb(x, y);
        return {
          'x': x,
          'y': y,
          'bomb': isBomb,
          'displayChar': isBomb ? 'b' : ''
        };
      });
    });
  }
  
  generateBombs() {
    const median = Math.max(this.props.width, this.props.height);
    const offset = Math.floor(median / 4);
    let numberOfBombs = getRandomInt(median + offset, median + 2 * offset);

    // Array holding a number for each cell
    let pos = []
    for (let p = 0; p < this.props.height * this.props.height; p++)
      pos.push(p);

    // Create map of arrays for bombs
    let bombs = {};
    while (numberOfBombs-- > 0) {
      let p = getRandomInt(0, pos.length - 2);
      let y = Math.floor(pos[p] / this.props.height);
      let x = pos[p] - this.props.height * y;
      if (!(x in bombs))
        bombs[x] = {};
      bombs[x][y] = true;

      // Remove elements
      pos.splice(p, 1);
    }

    return {
      bombs: bombs,
      checkBomb: function(x, y) {
        return x in bombs && y in this.bombs[x];
      }
    };
  }

  handleClick(cell) {
    console.log(cell);
  }

  render() {
    // Create the table body
    let rows = this.state.boardState.map(function(row) {
      let cells = row.map(function(cell) {
        return <Cell cellState={cell} onClick={this.handleClick}/>;
      }.bind(this));
      return <tr>{cells}</tr>;
    }.bind(this));
    
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
      clicked: false
    };
  }

  cellClicked() {
    this.setState({clicked: true});
    this.props.onClick(this.props.cellState);
  }

  render() {
    return (
      <td className="mine-cell"
          id={this.state.clicked ? "mine-clicked" : "mine-button"}
          onClick={() => this.cellClicked()}>
        {this.props.cellState.displayChar}
      </td>
    );
  }
}

// Generate a random number from min to max
function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export default App;