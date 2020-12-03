import fs from 'fs';
import readline from 'readline';

const FILE_NAME = 'data/map.txt';

const TREE = '#';
const DX = 3;

// Set this lazily upon seeing the first record.
let yMax = null;

// Obtain an async iterator for the file.
const streamMap = () => (
  readline.createInterface({
    input: fs.createReadStream(FILE_NAME),
  })
);

// Yield the records as-is as they come in. Lazily set the yMax on the first
// record, and convinently skip the first record. This sneakily avoids a
// race condition.
const readMap = async function* (fileStream) {
  for await (const line of fileStream) {
    if (!yMax) {
      // the first record doesn't matter
      yMax = line.length;
    } else {
      yield line;
    }
  }
};

// Navigate each row as they come in, move to the right (with modulo for the
// wrap around) and return true if we land on a tree, false otherwise.
const navigateAndReportTrees = async function* (mapStream) {
  let x = 0;
  for await (const row of mapStream) {
    x += DX;
    yield row.charAt(x % yMax) === TREE;
  }
};

// As the map is navigated, summate the number of trees that were encountered.
const sumTreesEncountered = async (landedOnTreeStream) => {
  let treeCount = 0;
  for await (const landedOnTree of landedOnTreeStream) {
    treeCount += landedOnTree ? 1 : 0;
  }
  return treeCount;
};

// Just use the console.
const displayAnswer = console.log;

// Output the number of trees encountered.
const part1 = async () => (
  displayAnswer(
    await sumTreesEncountered(
      navigateAndReportTrees(
        readMap(
          streamMap()
        )
      )
    )
  )
);

const main = async () => {
  await part1();
};

await main();
