import fs from 'fs';
import readline from 'readline';

const FILE_NAME = 'data/jolt-adapters.txt';

const streamAdapters = () => (
  readline.createInterface({
    input: fs.createReadStream(FILE_NAME),
  })
);

// Buffer the stream and return the full list, sorted in reverse once finished.
const sort = async (adapters) => {
  const sorted = [];
  for await (const adapter of adapters) {
    sorted.push(adapter);
  }
  return new Int32Array(sorted).sort().reverse();
};

// Return the product of the number of differences equal to 3, and 1, across
// the entire list of adapters. The initial diff is one (assumed the first
// adapter is one, not checking for it), and the last diff is 3 from the
// device, hence the [1, 1] initial value.
const countDifferences = (sorted) => (
  sorted.slice(1)
    .map((rating, i) => sorted[i] - rating)
    .reduce(
      ([oneDiffs, threeDiffs], diff) => (
        [diff == 1 ? oneDiffs + 1 : oneDiffs, diff == 1 ? threeDiffs : threeDiffs + 1]
      ),
      [1, 1],
    )
    .reduce((a, b) => a * b)
);

// Just use the console
const displayAnswer = console.log;

// Output and return the packet that tips off the weakness in the cipher.
const part1 = async () => (
  displayAnswer(
    countDifferences(
      await sort(streamAdapters())
    )
  )
);

const main = async () => {
  await part1();
};

await main();
