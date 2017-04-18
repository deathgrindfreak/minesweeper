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
    const bombs = this.generateBombs();
    let boardState = this.createBoard(bombs);
    
    this.state = {
      bombs: bombs,
      boardState: boardState
    };
  }

  createBoard(bombs) {
    // Empty board
    let board = Array(this.props.height).fill(Array(this.props.width).fill(null));
    
    // Create the board with bomb locations
    board = board.map(function(row, y) {
      return row.map(function(cell, x) {
        return { 
          'x': x, 
          'y': y,
          'bomb': bombs.checkBomb(x, y)
        };
      });
    });
    
    // Fill in the numbers displaying the number of adjacent bombs
    return board.map(function(row, y) {
      return row.map(function(cell, x) {
        cell.displayChar = this.getDisplayChar(bombs, x, y);
        return cell;
      }.bind(this));
    }.bind(this));
  }
  
  getDisplayChar(bombs, x, y) {
    if (bombs.checkBomb(x, y)) {
      return 'b';
    } else {
      let numberOfBombs = [-1, 0, 1].reduce(function(numBombs, yo) {
        return numBombs + [-1, 0, 1].reduce(function(rowBombs, xo) {
          let xs = x + xo, ys = y + yo;
          if (xs !== x || ys !== y)
            return rowBombs + bombs.checkBomb(xs, ys) ? 1 : 0;
          return rowBombs;
        }, 0);
      }, 0);
      
      console.log(x, y, "numberOfBombs", numberOfBombs);
      
      return numberOfBombs === 0 ? '' : numberOfBombs + "";
    }
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
        return x in this.bombs && y in this.bombs[x];
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
  
  getDisplayStyle(char) {
    if (char === '1')
      return 'one';
    else if (char === '2')
      return 'two';
    else if (char === '3')
      return 'three';
    else if (char === '4')
      return 'four';
    else if (char === '5')
      return 'five';
    else if (char === '6')
      return 'six';
    else if (char === '7')
      return 'seven';
    else if (char === '8')
      return 'eight';
  }

  render() {
    let displayChar = this.props.cellState.displayChar;
    return (
      <td className="mine-cell"
          id={this.state.clicked ? "mine-clicked" : "mine-button"}
          onClick={() => this.cellClicked()}>
        <span id={this.getDisplayStyle(displayChar)}>
          {displayChar}
        </span>
      </td>
    );
  }
}

// Generate a random number from min to max
function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export default App;