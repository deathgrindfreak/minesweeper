import React, { Component } from 'react';
import './App.css';
import './font-awesome-4.7.0/css/font-awesome.min.css';

class App extends Component {
  render() {
      return (
        <div className="container">
          <Grid height={10} width={10} />
        </div>
      );
  }
}

class Grid extends Component {
  constructor(props) {
    super(props);
    this.state = this.createState();
  }

  createState() {
    let bombs = this.generateBombs();
    let board = this.createBoard(bombs);
    let adjacencyList = UnionFind(board);

    return {
      boardState: board,
      adjacencyList: adjacencyList,
      gameOver: false,
      gameWon: false,
      availableFlags: bombs.bombCount
    };
  }

  createBoard(bombs) {
    let self = this;

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
        'flagClicked': () => {
          let bombCount = this.state.availableFlags;
          if (flag) {
            this.setState({availableFlags: bombCount + 1});
          } else {
            if (bombCount == 0)
              return;
            this.setState({availableFlags: bombCount - 1});
          }
          flag = !flag;
        },
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
  }

  generateBombs() {
    const median = Math.max(this.props.width, this.props.height);
    const offset = Math.floor(median / 4);
    let numberOfBombs = getRandomInt(median + offset, median + 3 * offset);

    // Array holding a number for each cell
    let pos = [];
    for (let p = 0; p < this.props.height * this.props.width; p++) { pos.push(p); }

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

  resetClicked() {
    this.setState(this.createState());
  }

  handleClick(shiftKey, cell) {
    // Ignore click if game over, cell is already clicked or flagged
    if (this.state.gameOver
      || this.state.gameWon
      || cell.clicked()
      || (!shiftKey && cell.flag())) {
        return;
    }

    // Copy the board
    let state = this.state.boardState.slice();

    // If control was held, the user was placing a flag
    if (shiftKey) {
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
    this.setState({ boardState: state });
  }

  winGame(state, cell) {
    // End the game
    this.setState({gameWon: true});

    // Automatically set flags for unclicked and unflagged cells
    state.forEach((c) => {
      if (!c.clicked() && !c.flag())
        c.flagClicked();
    });

    return state;
  }

  endGame(state, cell) {
    // End the game
    this.setState({gameOver: true});

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
                onClick={(shiftKey) => this.handleClick(shiftKey, cell)} />
        );
      });
      return <tr key={y}>{cells}</tr>;
    });

    return (
      <div className="game-body">
        <div className="status-body">
          <div className="score status">{leftPad(this.state.availableFlags, 3)}</div>
          <FaceButton gameState={this.state}
                      onClick={() => this.resetClicked()} />
          <div className="time status">101</div>
        </div>
        <div className="grid-body">
          <table className="mine-table">
            <tbody>
              {rows}
            </tbody>
          </table>
        </div>
      </div>
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
          onClick={(e) => this.props.onClick(e.shiftKey)}>
          { cell.clicked() || cell.flag()
            ? <span id={this.getDisplayStyle(displayChar)}>{displayChar}</span>
            : '' }
      </td>
    );
  }
}

class FaceButton extends Component {
  getFace() {
    if (this.props.gameState.gameWon)
      return "smile";
    else if (this.props.gameState.gameOver)
      return "frown";
    return "meh";
  }

  render() {
    let smileClass = "fa fa-" + this.getFace() + "-o fa-3x";
    return (
      <button className="game-button" onClick={() => this.props.onClick()}>
        <i className={smileClass}
           id="game-button-icon"
           aria-hidden="true"></i>
      </button>
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
         id="flag-button"
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

// Left pad a number
function leftPad(num, n) {
  let str = num + '';
  if (str.length >= n)
    return str;
  while (str.length < n)
    str = "0" + str;
  return str;
}

// Generate a random number from min to max
function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export default App;
