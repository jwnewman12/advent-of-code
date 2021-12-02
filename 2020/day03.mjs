import fs from 'fs';
import readline from 'readline';

const FILE_NAME = 'data/map.txt';

const TREE = '#';
const DX = 3;
const DY = 1;

// Part 2, more slopes.
const SLOPES = [
  [1, 1],
  [3, 1],
  [5, 1],
  [7, 1],
  [1, 2],
];

// Part 2 needs to reuse the data, so we'll tee it into here while still
// streaming it for part 1.
const cachedMap = [];

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
// race condition. Tee the records to a cache for subsequent reprocessing.
const readMap = async function* (fileStream) {
  for await (const line of fileStream) {
    if (!yMax) {
      // the first record doesn't matter
      yMax = line.length;
    } else {
      cachedMap.push(line);
      yield line;
    }
  }
};

// Navigate each row as they come in, move to the right (with modulo for the
// wrap around) and return true if we land on a tree, false otherwise.
const navigateAndReportTrees = async function* (mapStream, dx = DX, dy = DY) {
  let x = 0;
  let y = 0;
  for await (const row of mapStream) {
    if (++y % dy != 0) {
      continue;
    }
    x += dx;
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

// Output the product of the number of trees encountered for each of the new
// slopes. This appears async as it reuses the generator function interfaces,
// but it just pushes the cached map right through them.
const part2 = async () => (
  displayAnswer(
    (await Promise.all(
      SLOPES.map(async ([dx, dy]) => (
        sumTreesEncountered(
          navigateAndReportTrees(cachedMap, dx, dy)
        )
      ))
    )).reduce((acc, count) => acc * count)
  )
);

const main = async () => {
  await part1();
  await part2();
};

await main();
