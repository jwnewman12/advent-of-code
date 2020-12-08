import fs from 'fs';
import readline from 'readline';

const FILE_NAME = 'data/passports.txt';

const REQUIRED_FIELDS = [
  'byr',
  'iyr',
  'eyr',
  'hgt',
  'hcl',
  'ecl',
  'pid',
  // 'cid',
];

// Obtain an async iterator for the file.
const streamPassports = () => (
  readline.createInterface({
    input: fs.createReadStream(FILE_NAME),
  })
);

// Build the passports in an object, until a blank line is found, then return
// the object.
const readPassports = async function* (fileStream) {
  let passport = {};
  for await (const line of fileStream) {
    if (line.length < 1) {
      yield passport;
      passport = {};
    } else {
      passport = Object.assign(passport, ...(
        line.split(' ')
          .map((entry) => entry.split(':'))
          .map(([key, value]) => ({ [key]: value }))
        )
      );
    }
  }
};

// Check that each passport has the required fields, and if requested to
// validate the values, that each value is valid.
const validatePassports = async function* (passports) {
  for await (const passport of passports) {
    yield [REQUIRED_FIELDS, Object.keys(passport)].reduce((a, b) => a.filter(c => b.includes(c)))
      .length === REQUIRED_FIELDS.length;
  }
};

// Sum the number of valid passports.
const countValidPassports = async (validatedPassports) => {
  let validPassports = 0;
  for await (const valid of validatedPassports) {
    validPassports += valid ? 1 : 0;
  }
  return validPassports;
};

// Just use the console.
const displayAnswer = console.log;

// Output the number of valid passports.
const part1 = async () => (
  displayAnswer(
    await countValidPassports(
      validatePassports(
        readPassports(
          streamPassports()
        )
      )
    )
  )
);

const main = async () => {
  await part1();
};

await main();
