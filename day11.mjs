import fs from 'fs';
import readline from 'readline';

const FILE_NAME = 'data/airplane-layout.txt';

// Obtain an async iterator for the file.
const streamSeatLayout = () => (
  readline.createInterface({
    input: fs.createReadStream(FILE_NAME),
  })
);

// Parse each line - null for empty floor, false for unoccupied, true for
// occupied.
const parse = (line) => line.split('').map((c) => c === '.' ? null : false);

// Assemble the layout into a 2D grid.
const read = async (seatLayout) => {
  const grid = [];
  for await (const line of seatLayout) {
    grid.push(parse(line));
  }
  return grid;
};

// Given a given position in the grid, count the number of adjacent occupied seats.
// I'm not going to bother with a non-classic implementation of this.
const countNeighbors = (grid, row, col) => {
  let count = 0;

  if (0 < row) {
    grid[row - 1][col] && ++count;

    if (0 < col) {
      grid[row - 1][col - 1] && ++count;
    }
    if (col < grid[row].length - 1) {
      grid[row - 1][col + 1] && ++count;
    }
  }

  if (0 < col) {
    grid[row][col - 1] && ++count;
  }
  if (col < grid[row].length - 1) {
    grid[row][col + 1] && ++count;
  }

  if (row < grid.length - 1) {
    grid[row + 1][col] && ++count;

    if (0 < col) {
      grid[row + 1][col - 1] && ++count;
    }
    if (col < grid[row].length - 1) {
      grid[row + 1][col + 1] && ++count;
    }
  }

  return count;
};

// Progress the current grid through the next generation according to the rules
// of the game. Return a tuple indicating if the grid changed at all (is
// extinct), and the updated grid.
const generation = (grid) => {
  let extinct = true;
  const newGrid = grid.map((row, i) => {
    const newRow = [...row];
    row.map((col, j) => {
      if (col !== null) {
        const neighbors = countNeighbors(grid, i, j);
        if (col) {
          if (3 < neighbors) {
            newRow[j] = false;
            extinct = false;
          }
        } else if (0 === neighbors) {
          newRow[j] = true;
          extinct = false;
        }
      }
    });
    return newRow;
  });
  return [extinct, newGrid];
};

// Run the game until it stops changing, then return the grid in it's final
// state.
const runSimulation = (grid) => {
  let extinct = false;
  while (!extinct) {
    [extinct, grid] = generation(grid);
  };
  return grid;
};

// Traverse the grid and return the count of the occupied seats.
const countOccupiedSeats = (grid) => (
  grid.reduce((acc, row) => acc + row.reduce((acc, col) => acc + (col ? 1 : 0), 0), 0)
);

// Just use the console.
const displayAnswer = console.log;

// Output the number of occupied seats once the simulation does not change in a
// generation.
const part1 = async () => (
  displayAnswer(
    countOccupiedSeats(
      runSimulation(
        await read(
          streamSeatLayout()
        )
      )
    )
  )
);

const main = async () => {
  await part1();
};

await main();
