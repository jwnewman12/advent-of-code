import fs from 'fs';
import readline from 'readline';

const FILE_NAME = 'data/customs-declarations.txt';

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

const main = async () => {
  await part1();
};

await main();
