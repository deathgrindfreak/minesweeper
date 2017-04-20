import React, { Component } from 'react';
import './App.css';
import './font-awesome-4.7.0/css/font-awesome.min.css';

class App extends Component {
  render() {
      return <Grid height={10} width={10}/>;
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
    let bombs = generateBombs();
    
    // Empty board
    let board = Array(this.props.height * this.props.width).fill(null);

    // Create the board with bomb locations
    board = board.map((cell, p) => {
      let clicked = false;
      let flag = false;
      return {
        'position': p,
        'isBomb': bombs.isBomb(p),
        'clicked': () => clicked,
        'clickedBomb': false,
        'flag': () => flag,
        'flagClicked': () => flag = !flag,
        'falseFlag': false,
        'falseFlagClicked': () => { flag = false; this.falseFlag = true; },
        'neighbors': getNeighbors(p),
        'winnerClicked': () => bombs.bombCount === unclickedCells(),
        'clickCell': () => clicked = true
      };
    });
    
    // Fill in the numbers displaying the number of adjacent bombs
    return board.map((cell) => {
      cell.displayChar = getDisplayChar(cell);
      cell.isOpen = cell.displayChar() === '';
      cell.isNum = !cell.isOpen && !cell.isBomb;
      return cell;
    });
    
    // Number of cells yet to be clicked
    function unclickedCells() {
      return board.reduce((a, c) => c.clicked() ? a : a + 1, 0);
    }
    
    // Gets the display char for the cell
    function getDisplayChar(cell) {
      return () => {
        if (cell.flag()) {
          return <Flag />;
        } else if (cell.isBomb) {
          return <Bomb />;
        } else {
          let numberOfBombs = cell.neighbors.reduce((a, n) => {
            return a + (bombs.isBomb(n) ? 1 : 0);
          }, 0);
          return numberOfBombs === 0 ? '' : numberOfBombs + "";
        }
      };
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
      let numberOfBombs = getRandomInt(median + offset, median + 3 * offset);
  
      // Array holding a number for each cell
      let pos = [];
      for (let p = 0; p < self.props.height * self.props.width; p++) { pos.push(p); }
  
      // Create map of positions for bombs
      let bombs = {};
      while (numberOfBombs-- > 0) {
        let i = getRandomInt(0, pos.length - 2);
        bombs[pos[i]] = true;
  
        // Remove selected element
        pos.splice(i, 1);
      }
      return { 
        'bombCount': Object.keys(bombs).length,
        'isBomb': (p) => p in bombs
      };
    }
  }

  handleClick(ctrlKey, cell) {
    // Ignore click if game over, cell is already clicked or flagged
    if (this.state.gameOver || cell.clicked() || (!ctrlKey && cell.flag())) return;

    // Copy the board
    let state = this.state.boardState.slice();
    
    // If control was held, the user was placing a flag
    if (ctrlKey) {
      state[cell.position].flagClicked();
      this.setState(state);
      return;
    }
    
    // Click the cell
    state[cell.position].clickCell();

    // Set the state
    if (cell.winnerClicked())
      state = this.winGame(state, cell);
    else if (cell.isBomb)
      state = this.endGame(state, cell);
    else if (cell.isOpen)
      state = this.openCells(state, cell);
    this.setState(state);
  }
  
  winGame(state, cell) {
    // End the game
    state.gameOver = true;
    
    console.log("Win!!!");
    
    return state;
  }

  endGame(state, cell) {
    // End the game
    state.gameOver = true;

    // Show all bombs
    state.map((c) => {
      if (c.position === cell.position)
        c.clickedBomb = true;
      if (c.isBomb)
        c.clickCell();
        
      // Clear flags
      if (c.flag())
        if (c.isBomb)
          c.falseFlagClicked();
        else
          c.flagClicked();
      return c;
    });

    return state;
  }

  openCells(state, cell) {
    // Get the adjacent open cells
    let adj = this.state.adjacencyList.getConnected(cell.position);
    
    // Open all adjacent open cells as well as neighboring number cells
    adj.forEach((p) => {
      state[p].clickCell();
      state[p].neighbors.forEach((np) => {
        if (state[np].isNum)
          state[np].clickCell();
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
                onClick={(ctrlKey) => this.handleClick(ctrlKey, cell)} />
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
    if (cell.clickedBomb)
      return "hit-cell";
    else if (cell.falseFlag)
      return "false-flag";
    else if (cell.clicked())
      return "mine-clicked";
    return "mine-button";
  }

  render() {
    let cell = this.props.cellState;
    let displayChar = cell.displayChar();
    return (
      <td className="mine-cell"
          id={this.getId(cell)}
          onClick={(e) => this.props.onClick(e.ctrlKey)}>
          { cell.clicked() || cell.flag() 
            ? <span id={this.getDisplayStyle(displayChar)}>{displayChar}</span>
            : '' }
      </td>
    );
  }
}

// Wrapper for Font Awesome bomb (pre-renders the component)
class Bomb extends Component {
  componentDidMount() {
    this.forceUpdate();
  }
  
  render() {
    return <i className="fa fa-bomb" aria-hidden="true"></i>;
  }
}

// Wrapper for Font Awesome flag (pre-renders the component)
class Flag extends Component {
  componentDidMount() {
    this.forceUpdate();
  }
  
  render() {
    return (
      <i className="fa fa-flag" 
         style={{color: "red"}}
         aria-hidden="true"></i>
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
      nIds.filter((nId) => nId !== cId).forEach((nId) => union(cId, nId));
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
      a.push(i === qId ? pId : i);
      return a;
    }, []);
  }
  
  // Return all connected positions (including p)
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
