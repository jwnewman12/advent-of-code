import fs from 'fs';
import readline from 'readline';

const FILE_NAME = 'data/passwords.txt';

// Obtain an async iterator for the file
const streamPasswordRecords = () => (
  readline.createInterface({
    input: fs.createReadStream(FILE_NAME),
  })
);

const parsePasswordRecords = async function*(passwordRecords) {
  for await (const passwordRecord of passwordRecords) {
    const [policy, password] = passwordRecord.split(': ');
    const [range, letter] = policy.split(' ');
    const [min, max] = range.split('-');
    yield [min, max, letter, password];
  }
};

const passwordConforms = ([min, max, letter, password]) => {
  const letterCount = (password.match(new RegExp(letter, "g")) || []).length;
  return min <= letterCount && letterCount <= max;
};

const countValidPasswords = async (parsedPasswords) => {
  let validPasswords = 0;
  for await (const parsed of parsedPasswords) {
    if (passwordConforms(parsed)) {
      ++validPasswords;
    }
  }
  return validPasswords;
};

// Just use the console
const displayAnswer = console.log;

// Output the product of the two expenses that sum to the target (2020).
const part1 = async () => (
  displayAnswer(
    await countValidPasswords(
      parsePasswordRecords(streamPasswordRecords())
    )
  )
);

const main = async () => {
  await part1();
};

// Node 14.3+ has top level await now, if you name the file .mjs
await main();
