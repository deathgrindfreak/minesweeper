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

    let board = this.createBoard();
    let adjacencyList = UnionFind(board);
    
    this.state = {
      boardState: board,
      adjacencyList: adjacencyList,
      gameOver: false
    };
  }

  createBoard() {
    let self = this;
    
    // Generate the bombs
    let checkBomb = generateBombs();

    // Empty board
    let board = Array(this.props.height * this.props.width).fill(null);

    // Create the board with bomb locations
    board = board.map((cell, p) => {
      return {
        'position': p,
        'bomb': checkBomb(p),
        'clicked': false,
        'clickedBomb': false,
        'neighbors': getNeighbors(p),
        'isNeighbor': function(p) { return p in this.neighbors; }
      };
    });
    
    // Fill in the numbers displaying the number of adjacent bombs
    return board.map((cell) => {
      cell.displayChar = getDisplayChar(cell);
      cell.isOpen = cell.displayChar === '';
      cell.isNum = !cell.isOpen && !cell.bomb;
      return cell;
    });
    
    // Gets the display char for the cell
    function getDisplayChar(cell) {
      if (checkBomb(cell.position)) {
        return 'b';
      } else {
        let numberOfBombs = cell.neighbors.reduce((a, n) => {
          return a + (checkBomb(n) ? 1 : 0);
        }, 0);
        return numberOfBombs === 0 ? '' : numberOfBombs + "";
      }
    }
    
    // Gets the neighbors for a cell
    function getNeighbors(p) {
      let y = Math.floor(p / self.props.width);
      let x = p - y * self.props.width;
      
      return [-1, 0, 1].reduce((a, yo) => {
          return a.concat(
            [-1, 0, 1].reduce((ra, xo) => {
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
    }
    
    // Generates a list of bombs for the board
    function generateBombs() {
      const median = Math.max(self.props.width, self.props.height);
      const offset = Math.floor(median / 4);
      let numberOfBombs = getRandomInt(median + offset, median + 2 * offset);
  
      // Array holding a number for each cell
      let pos = [];
      for (let p = 0; p < self.props.height * self.props.width; p++) { pos.push(p); }
  
      // Create map of maps for bombs
      let bombs = {};
      while (numberOfBombs-- > 0) {
        let i = getRandomInt(0, pos.length - 2);
        bombs[pos[i]] = true;
  
        // Remove selected element
        pos.splice(i, 1);
      }
      return (p) => p in bombs;
    }
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
    state.map((c) => {
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
    
    // Get the adjacent open cells
    let adj = this.state.adjacencyList.getConnected(cell.position);
    
    // Open all adjacent open cells as well as neighboring number cells
    adj.forEach((p) => {
      state[p].clicked = true;
      state[p].neighbors.forEach((np) => {
        if (state[np].isNum)
          state[np].clicked = true;
      });
    });
    
    return state;
  }

  render() {
    // Create the table body
    let rows = Array(this.props.height).fill(null).map((r, y) => {
      let cells = Array(this.props.width).fill(null).map((c, x) => {
        let cell = this.state.boardState[x + this.props.width * y];
        return (
          <Cell key={cell.position} 
                cellState={cell} 
                onClick={() => this.handleClick(cell)} />
        );
      });
      return <tr key={y}>{cells}</tr>;
    });

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

// Creates an adjacency list for open board members
function UnionFind(board) {
  // Represents set of blocks based on position
  let id = [];
  for (let i = 0; i < board.length; i++) { id.push(i); }
  
  // Build the adjacency list for the board
  board.forEach((cell) => {
    if (cell.isOpen) {
      let cId = find(cell.position);
      
      // Find all ids for open neighbors
      let nIds = findAll(cell.neighbors.filter((n) => board[n].isOpen));
      
      // Find neighbors not equal to cId and perform a union
      nIds.filter((nId) => nId !== cId)
        .map((nId) => union(cId, nId));
    }
  });
  
  // Find the id of p
  function find(p) { return id[p]; }
  
  // Find all ids for ps
  function findAll(ps) { return ps.map((p) => find(p)); }
  
  // Combine two sets
  function union(p, q) {
    let pId = find(p), qId = find(q);
    
    // Return if already joined
    if (pId === qId) return;
    
    // Set all ids equal to qId to pId
    id = id.reduce((a, i) => {
      if (i === qId) a.push(pId);
      else a.push(i);
      return a;
    }, []);
  }
  
  function getConnected(p) {
    let pId = id[p];
    return id.reduce((a, cId, c) => {
      if (cId === pId) a.push(c);
      return a;
    }, []);
  }
  
  return {
    find: find,
    findAll: findAll,
    union: union,
    getConnected: getConnected
  };
}

// Generate a random number from min to max
function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export default App;
