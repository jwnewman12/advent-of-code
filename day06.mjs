import fs from 'fs';
import readline from 'readline';

const FILE_NAME = 'data/customs-declarations.txt';

// Save the data for subsequent reprocessing.
const cachedGroups = [];

// Obtain an async iterator for the file.
const streamDeclarations = () => (
  readline.createInterface({
    input: fs.createReadStream(FILE_NAME),
  })
);

// Stream the declarations, emit a group once it is completely read.
const readDeclarations = async function* (fileStream) {
  let group = [];
  for await (const line of fileStream) {
    if (line.length < 1) {
      cachedGroups.push(group);
      yield group;
      group = [];
    } else {
      group.push(line);
    }
  }
};

// Return the number of unique answers across an entire group.
const countUniqueAnswers = async function* (groups) {
  for await (const group of groups) {
    yield new Set([...group.join('')]).size;
  }
};

// Return the number of common answers across an entire group. Set
// does not have .intersect() and .union() for some reason, so we
// have to fall down to ...spread.
const countCommonAnswers = async function* (groups) {
  for await (const group of groups) {
    yield group
      .map((person) => new Set([...person]))
      .reduce((acc, personSet) => new Set([...personSet].filter(answer => acc.has(answer))))
      .size;
  }
};

// Sum the counts of unique answers.
const sumCounts = async (counts) => {
  let sum = 0;
  for await (const groupCount of counts) {
    sum += groupCount;
  }
  return sum;
};

// Just use the console.
const displayAnswer = console.log;

// Output the sum of all of the counts of unique answers from each passenger group.
const part1 = async () => (
  displayAnswer(
    await sumCounts(
      countUniqueAnswers(
        readDeclarations(
          streamDeclarations()
        )
      )
    )
  )
);

// Output the sum of all of the counts of common answers across each passenger group.
const part2 = async () => (
  displayAnswer(
    await sumCounts(
      countCommonAnswers(
        cachedGroups
      )
    )
  )
);

const main = async () => {
  await part1();
  await part2();
};

await main();
