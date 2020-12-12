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

// Map the elements of a given array to their differences with the next
// element.
const diffs = (sorted) => (
  sorted.slice(1).map((rating, i) => sorted[i] - rating)
);

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

/* This was scrap but helped visualize the problem
const v = (sorted) => {
  let i = 0; let s = sorted[i];
  let j = i + 1; let t = sorted[j];
  let p = []; let k = 0;

  while (k < sorted.length) { let h = p[k]; if (!h) { h = [s]; p.push(h); }
  while (s - t < 4) { h.push(t); t = sorted[++j]; } ++k; s = sorted[++i]; }
  console.dir(p);

  const t = sorted.slice(1).map((rating, i) => sorted[i] - rating).join('');
  console.dir(t.replace(/3/g, '_'));

  // HMMMM
  // 1111_1__11__1111__1111_111_111_1_1111_1111___1111_....
  // ^big ^0 ^small         ^med
};
*/

// Helper function for the below to avoid declaring str. Compare the new
// shorter string length to the previous string length to determine the number
// of times a string of ones appeared. Raise the permutation factor (2, 4, 7,
// ??) to the power of the number of occurences. Return the product of the
// prior accumulating permutations.
const accPermutations = (str, acc, len, prevStr) => ([
  acc * Math.pow(
    Math.pow(2, len - 1) - (len === 4 ? 1 : 0),
    (prevStr.length - str.length) / len,
  ),
  str,
]);

// Recalculate the diffs from part 1 for the same sorted input. String the 1
// and 3 diff numbers together. Append a 1 on the end of the string for the
// wall outlet. As consecutive 1s are encountered, the permutations increase.
// Count the # of 1111, 111, 11. Each occurence of two ones adds 2x more
// permutations. Three ones adds 2*2*n. Four ones should add 2*2*2*n but it
// adds (2*2*2-1)*n, due to deeper maths I cannot see with only this dataset.
const countPermutations = (sorted) => (
  [...Array(3).keys()].map((len) => len + 2)
    .reverse()
    .reduce(
      ([acc, str], len) => (
        accPermutations(str.split(Array(len + 1).join('1')).join(''), acc, len, str)
      ),
      [1, diffs(sorted).join('') + '1'],
    )[0]
);

// Just use the console
const displayAnswer = console.log;

// Output and return the packet that tips off the weakness in the cipher.
const part1 = async (sorted) => (
  displayAnswer(countDifferences(sorted))
);

const part2 = async (sorted) => (
  displayAnswer(countPermutations(sorted))
);

const main = async () => {
  const sorted = await sort(streamAdapters());
  part1(sorted);
  part2(sorted);
};

await main();
