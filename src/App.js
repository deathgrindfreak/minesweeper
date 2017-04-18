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
    let adjacencyList = this.createAdjacencyList(boardState);
    this.state = {
      bombs: bombs,
      boardState: boardState,
      adjacencyList: adjacencyList,
      gameOver: false
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
          'bomb': bombs.checkBomb(x, y),
          'clicked': false,
          'clickedBomb': false
        };
      });
    });
    
    // Fill in the numbers displaying the number of adjacent bombs
    return board.map(function(row, y) {
      return row.map(function(cell, x) {
        cell.displayChar = this.getDisplayChar(bombs, x, y);
        cell.isOpen = cell.displayChar === '';
        cell.isNum = !cell.isOpen && !cell.bomb;
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
      return numberOfBombs === 0 ? '' : numberOfBombs + "";
    }
  }
  
  createAdjacencyList(state) {
    let self = this;
    
    // Array holding a number for each cell
    let pos = []
    for (let p = 0; p < this.props.height * this.props.height; p++)
      pos.push(p);
    
    // Create adjacency list
    let adj = pos.reduce(function(a, p) {
      let y = Math.floor(pos[p] / self.props.height);
      let x = pos[p] - self.props.height * y;
      let n = findOpenNeighbors(state[y][x]);
      if (n.length > 0)
        a[p] = n;
      return a;
    }, {});
    
    console.log(adj);
    
    return adj;
    
    // Returns an array of open neighbors
    function findOpenNeighbors(cell) {
      return [-1, 0, 1].reduce(function(a, yo) {
        return a.concat(
          [-1, 0, 1].reduce(function(ra, xo) {
            let xs = cell.x + xo, ys = cell.y + yo;
            if ((cell.x !== xs || cell.y !== ys) 
                && self.checkBounds(xs, ys) && state[ys][xs].isOpen)
              ra.push(xs + self.props.height * ys);
            return ra;
          }, [])
        );
      }, []);
    }
  }
  
  checkBounds(x, y) {
    return x >= 0 && y >= 0 && x < this.props.width && y < this.props.height;
  }
  
  generateBombs() {
    const median = Math.max(this.props.width, this.props.height);
    const offset = Math.floor(median / 4);
    let numberOfBombs = getRandomInt(median + offset, median + 2 * offset);

    // Array holding a number for each cell
    let pos = []
    for (let p = 0; p < this.props.height * this.props.height; p++)
      pos.push(p);

    // Create map of maps for bombs
    let bombs = {};
    while (numberOfBombs-- > 0) {
      let p = getRandomInt(0, pos.length - 2);
      let y = Math.floor(pos[p] / this.props.height);
      let x = pos[p] - this.props.height * y;
      if (!(x in bombs))
        bombs[x] = {};
      bombs[x][y] = true;

      // Remove selected element
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
    if (this.state.gameOver) return;
    
    // Copy the board
    let state = this.state.boardState.slice();
    
    // Set the state
    if (cell.bomb)
      state = this.endGame(state, cell);
    else if (cell.isOpen)
      state = this.openCells(state, cell);
    else
      state[cell.y][cell.x].clicked = true;
    this.setState(state);
  }
  
  endGame(state, cell) {
    // End the game
    state.gameOver = true;
    
    // Show all bombs
    state.map(function(r) {
      return r.map(function(c) {
        if (c.x === cell.x && c.y === cell.y)
          c.clickedBomb = true;
        if (c.bomb)
          c.clicked = true;
        return c;
      });
    });
    
    return state;
  }
  
  openCells(state, cell) {
    // Open the cell
    state[cell.y][cell.x].clicked = true;
    
    let adj = this.state.adjacencyList[cell.x + this.props.height * cell.y];
    adj.forEach(function(a) {
    state[cell.y][cell.x].clicked = true;
      let ys = Math.floor(a / this.props.height);
      let xs = a - this.props.height * ys;
      let c = state[ys][xs];
      c.clicked = true;
    }.bind(this))
    return state;
  }

  render() {
    // Create the table body
    let rows = this.state.boardState.map(function(row) {
      let cells = row.map(function(cell) {
        return <Cell cellState={cell} onClick={() => this.handleClick(cell)}/>;
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
    return null;
  }
  
  getId(cell) {
    if(cell.clickedBomb)
      return "hit-cell"
    else if (cell.clicked)
      return "mine-clicked"
    return "mine-button";
  }

  render() {
    let displayChar = this.props.cellState.displayChar;
    return (
      <td className="mine-cell"
          id={this.getId(this.props.cellState)}
          onClick={() => this.props.onClick()}>
        <span id={this.getDisplayStyle(displayChar)}>
          {this.props.cellState.clicked ? displayChar : ''}
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