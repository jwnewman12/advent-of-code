import fs from 'fs';
import readline from 'readline';

const FILE_NAME = 'data/passwords.txt';

// Obtain an async iterator for the file
const streamPasswordRecords = () => (
  readline.createInterface({
    input: fs.createReadStream(FILE_NAME),
  })
);

// Just use a series of string spits to parse it
const parsePasswordRecords = async function*(passwordRecords) {
  for await (const passwordRecord of passwordRecords) {
    const [policy, password] = passwordRecord.split(': ');
    const [range, letter] = policy.split(' ');
    const [min, max] = range.split('-');
    yield [min, max, letter, password];
  }
};

// Return true if the password meets the policy, false otherwise
const passwordConforms = ([min, max, letter, password]) => {
  const letterCount = (password.match(new RegExp(letter, "g")) || []).length;
  return min <= letterCount && letterCount <= max;
};

// Return true if the password meets the policy, false otherwise
const passwordConformsV2 = ([pos1, pos2, letter, password]) => (
  password[pos1 - 1] === letter ^ password[pos2 - 1] === letter
);

// Return the total count of valid conforming passwords in the dataset
const countValidPasswords = async (parsedPasswords, validator = passwordConforms) => {
  let validPasswords = 0;
  for await (const parsed of parsedPasswords) {
    if (validator(parsed)) {
      ++validPasswords;
    }
  }
  return validPasswords;
};

// Just use the console
const displayAnswer = console.log;

// Output the count of passwords that conform to the policy
const part1 = async () => (
  displayAnswer(
    await countValidPasswords(
      parsePasswordRecords(streamPasswordRecords())
    )
  )
);

// Output the count of passwords that conform to the new policy
const part2 = async () => (
  displayAnswer(
    await countValidPasswords(
      parsePasswordRecords(streamPasswordRecords()),
      passwordConformsV2,
    )
  )
);

const main = async () => {
  await part1();
  await part2();
};

await main();
