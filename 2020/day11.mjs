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

const sourceGrid = [];

// Assemble the layout into a 2D grid.
const read = async (seatLayout) => {
  for await (const line of seatLayout) {
    const parsed = parse(line)
    sourceGrid.push(parsed);
  }
  return [...sourceGrid];
};

// Given a given position in the grid, count the number of adjacent occupied seats.
// I'm not going to bother with a non-classic implementation of this.
// Still not going to bother. I've done this 400 times.
const countNeighbors = (grid, row, col, walk) => {
  let count = 0;

  if (0 < row) {
    let r = row - 1;
    while (0 <= r) {
      if (!walk || grid[r][col] !== null) {
        grid[r][col] && ++count;
        break;
      }
      --r;
    }

    if (0 < col) {
      let r = row - 1;
      let c = col - 1;
      while (0 <= r && 0 <= c) {
        if (!walk || grid[r][c] !== null) {
          grid[r][c] && ++count;
          break;
        }
        --r;
        --c;
      }
    }

    if (col < grid[row].length - 1) {
      let r = row - 1;
      let c = col + 1;
      while (0 <= r && c <= grid[r].length - 1) {
        if (!walk || grid[r][c] !== null) {
          grid[r][c] && ++count;
          break;
        }
        --r;
        ++c;
      }
    }
  }

  if (0 < col) {
    let c = col - 1;
    while (0 <= c) {
      if (!walk || grid[row][c] !== null) {
        grid[row][c] && ++count;
        break;
      }
      --c;
    }
  }

  if (col < grid[row].length - 1) {
    let c = col + 1;
    while (c <= grid[row].length - 1) {
      if (!walk || grid[row][c] !== null) {
        grid[row][c] && ++count;
        break;
      }
      ++c;
    }
  }

  if (row < grid.length - 1) {
    let r = row + 1;
    while (r <= grid.length - 1) {
      if (!walk || grid[r][col] !== null) {
        grid[r][col] && ++count;
        break;
      }
      ++r;
    }

    if (0 < col) {
      let r = row + 1;
      let c = col - 1;
      while (r <= grid.length - 1 && 0 <= c) {
        if (!walk || grid[r][c] !== null) {
          grid[r][c] && ++count;
          break;
        }
        ++r;
        --c;
      }
    }

    if (col < grid[row].length - 1) {
      let r = row + 1;
      let c = col + 1;
      while (r <= grid.length - 1 && c <= grid[r].length - 1) {
        if (!walk || grid[r][c] !== null) {
          grid[r][c] && ++count;
          break;
        }
        ++r;
        ++c;
      }
    }
  }
  return count;
};

// Progress the current grid through the next generation according to the rules
// of the game. Return a tuple indicating if the grid changed at all (is
// extinct), and the updated grid.
const generation = (grid, walk, crowdLimit) => {
  let extinct = true;
  const newGrid = grid.map((row, i) => {
    const newRow = [...row];
    row.map((col, j) => {
      if (col !== null) {
        const neighbors = countNeighbors(grid, i, j, walk);
        if (col) {
          if (crowdLimit < neighbors) {
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
const runSimulation = (grid, walk = false, crowdLimit = 3) => {
  let extinct = false;
  while (!extinct) {
    [extinct, grid] = generation(grid, walk, crowdLimit);
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

const part2 = async () => (
  displayAnswer(
    countOccupiedSeats(
      runSimulation(
        [...sourceGrid],
        true,
        4,
      )
    )
  )
);

const main = async () => {
  await part1();
  part2();
};

await main();
