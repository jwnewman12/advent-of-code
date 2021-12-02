import fs from 'fs';
import readline from 'readline';

const FILE_NAME = 'data/passports.txt';

const EYE_COLORS = [
  'amb',
  'blu',
  'brn',
  'gry',
  'grn',
  'hzl',
  'oth',
];

const FIELDS = {
  'byr': (v) => v && v.length === 4 && 1920 <= Number(v) && Number(v) <= 2002,
  'iyr': (v) => v && v.length === 4 && 2010 <= Number(v) && Number(v) <= 2020,
  'eyr': (v) => v && v.length === 4 && 2020 <= Number(v) && Number(v) <= 2030,
  'hgt': (v) => {
    if (!v || v.length < 3) {
      return false;
    }
    const num = Number(v.substring(0, v.length - 2));
    const unit = v.substring(v.length - 2);
    return (unit === 'cm' && 150 <= num && num <= 193)
      || (unit === 'in' && 59 <= num && num <= 76);
  },
  'hcl': (v) => /^#([0-9,a-f]{6}).*$/.test(v),
  'ecl': (v) => v && EYE_COLORS.includes(v),
  'pid': (v) => v && v.length === 9 && -1 < Number(v),
  // 'cid',
};

const REQUIRED_FIELDS = Object.keys(FIELDS);

const cachedPassports = [];

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
      cachedPassports.push(passport);
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
const validatePassports = async function* (passports, validateValues = false) {
  for await (const passport of passports) {
    yield [REQUIRED_FIELDS, Object.keys(passport)].reduce((a, b) => a.filter(c => b.includes(c)))
      .length === REQUIRED_FIELDS.length &&
      (!validateValues ||
        Object.entries(FIELDS)
          .map(([field, validator]) => validator(passport[field]))
          .every(bool => bool === true));
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

// Output the number of valid passports, now considering the values of each
// field.
const part2 = async () => (
  displayAnswer(
    await countValidPassports(
      validatePassports(
        cachedPassports,
        true,
      )
    )
  )
);

const main = async () => {
  await part1();
  await part2();
};

await main();
