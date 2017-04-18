import React, { Component } from 'react';
import './App.css';

class App extends Component {
  render() {
      return <Grid height="5" width="5"/>;
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
    const median = Math.floor(this.props.width * this.props.height / 2);
    const offset = Math.floor(median / 8);
    let numberOfBombs = getRandomInt(median - offset, median + offset);

    console.log(median, offset, numberOfBombs);

    let xs = [], ys = [];
    for (let i = 0; i < this.props.width; i++) { xs.push(i); }
    for (let j = 0; j < this.props.height; j++) { ys.push(j); }

    let bombs = {};
    while (numberOfBombs-- > 0) {
      let x = getRandomInt(0, xs.length - 1);
      let y = getRandomInt(0, ys.length - 1);
      bombs[xs[x]] = ys[y];

      // Remove elements
      xs.splice(x, 1);
      ys.splice(y, 1);
    }

    console.log(bombs);

    return bombs;

    function getRandomInt(min, max) {
      return Math.floor(Math.random() * (max - min + 1)) + min;
    }
  }


  handleClick(position) {
    console.log(position);
  }

  render() {
    // Create the table body
    let cells = [], rows = [];
    for (let i = 0; i < this.props.height; i++) {
      for (let j = 0; j < this.props.width; j++) {
        let isBomb = this.state.bombs[j] !== undefined && this.state.bombs[j] === i;
        cells.push(
            <Cell cellState={{x: j, y: i, bomb: isBomb}}
                  onClick={this.handleClick}/>
        );
      }
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
    this.setState({id: "mine-cell"});
    this.props.onClick(this.props.cellState);
  }

  render() {
    return (
      <td id={this.state.id}
          onClick={() => this.cellClicked()}>
        {this.props.cellState.bomb ? 'b' : ''}
      </td>
    );
  }
}

export default App;
