import React, { Component } from 'react';
import './App.css';

class App extends Component {
  render() {
      return <Grid height={10} width={20}/>;
  }
}

class Grid extends Component {
  constructor(props) {
    super(props);

    const bombs = this.generateBombs();
    let boardState = this.createBoard(bombs);
    this.createAdjacencyList(boardState);
    this.state = {
      bombs: bombs,
      boardState: boardState,
      gameOver: false
    };
  }

  createBoard(bombs) {
    let self = this;

    // Empty board
    let board = Array(this.props.height * this.props.width).fill(null);

    // Create the board with bomb locations
    board = board.map(function(cell, p) {
      return {
        'position': p,
        'bomb': bombs.checkBomb(p),
        'clicked': true,
        'clickedBomb': false,
        'neighbors': function() {
          let y = Math.floor(this.position /self.props.width);
          let x = this.position - y * self.props.width;
          
          return [-1, 0, 1].reduce(function(a, yo) {
              return a.concat(
                [-1, 0, 1].reduce(function(ra, xo) {
                  let xs = x + xo, ys = y + yo;
                  if ((x !== xs || y !== ys) && checkBounds(xs, ys))
                    ra.push(xs + self.props.width * ys);
                  return ra;
                }, [])
              );
          }, []);
          
          function checkBounds(x, y) {
            return x >= 0 && y >= 0 && x < self.props.width && y < self.props.height;
          }
        },
        'isNeighbor': function(p) { return p in this.neighbors(); }
      };
    });

    // Fill in the numbers displaying the number of adjacent bombs
    return board.map(function(cell) {
      cell.displayChar = getDisplayChar(cell);
      cell.isOpen = cell.displayChar === '';
      cell.isNum = !cell.isOpen && !cell.bomb;
      return cell;
    });
    
    // Gets the display char for the cell
    function getDisplayChar(cell) {
      if (bombs.checkBomb(cell.position)) {
        return 'b';
      } else {
        let numberOfBombs = cell.neighbors().reduce(function(a, n) {
          return a + (bombs.checkBomb(n) ? 1 : 0);
        }, 0);
        return numberOfBombs === 0 ? '' : numberOfBombs + "";
      }
    }
  }

  generateBombs() {
    const median = Math.max(this.props.width, this.props.height);
    const offset = Math.floor(median / 4);
    let numberOfBombs = getRandomInt(median + offset, median + 2 * offset);

    // Array holding a number for each cell
    let pos = [];
    for (let p = 0; p < this.props.height * this.props.width; p++)
      pos.push(p);

    // Create map of maps for bombs
    let bombs = {};
    while (numberOfBombs-- > 0) {
      let i = getRandomInt(0, pos.length - 2);
      bombs[pos[i]] = true;

      // Remove selected element
      pos.splice(i, 1);
    }
    
    console.log(bombs);

    return {
      bombs: bombs,
      checkBomb: function(p) { return p in bombs; }
    };
  }

  createAdjacencyList(state) {
    let self = this;

    let adj = [], indLst = {}, maxInd = 0;
    state.forEach(function(cell) {
      if (cell.isOpen) {
        // Add to the list if not in it
        if (!(cell.position in indLst)) {
          indLst[cell.position] = maxInd++;
          adj.push([cell.position]);
        }

        // Add the neighbors
        let ind = indLst[cell.position];
        cell.neighbors().forEach(function(n) {
          if (state[n].isOpen && !(n in indLst)) {
            indLst[n] = ind;
            adj[ind].push(n);
          }
        });
      }
    });

    console.log(adj, indLst);
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
      state[cell.position].clicked = true;
    this.setState(state);
  }

  endGame(state, cell) {
    // End the game
    state.gameOver = true;

    // Show all bombs
    state.map(function(c) {
      if (c.position === cell.position)
        c.clickedBomb = true;
      if (c.bomb)
        c.clicked = true;
      return c;
    });

    return state;
  }

  openCells(state, cell) {
    // Open the cell
    state[cell.position].clicked = true;
    return state;
  }

  render() {
    // Create the table body
    let rows = Array(this.props.height).fill(null).map(function(r, y) {
      let cells = Array(this.props.width).fill(null).map(function(c, x) {
        let cell = this.state.boardState[x + this.props.width * y];
        return (
          <Cell key={cell.position} 
                cellState={cell} 
                onClick={() => this.handleClick(cell)} />
        );
      }.bind(this));
      return <tr key={y}>{cells}</tr>;
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
      return "hit-cell";
    else if (cell.clicked)
      return "mine-clicked";
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
