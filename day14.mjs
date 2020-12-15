import fs from 'fs';
import readline from 'readline';

const FILE_NAME = 'data/initialization-program.bin';

// Obtain an async iterator for the file.
const streamSourceCode = () => (
  readline.createInterface({
    input: fs.createReadStream(FILE_NAME),
  })
);

// Parse each line into a small simple AST.
const parse = (line) => {
  const opParser = {
    mask: (line) => line.match(/[01X]+$/),
    mem: (line) => {
      const [offset] = line.match(/([0-9]+)/);
      const [value] = line.match(/[0-9]+$/);
      return [BigInt(offset), BigInt(value)];
    },
  };

  const { groups: { op } } = line.match(/^(?<op>mem|mask)/);
  return [op, opParser[op](line)].flat();
};

// Read the program line by line, emit each parsed line.
const read = async function* (sourceCode) {
  for await (const line of sourceCode) {
    yield parse(line);
  }
};

// Keep state of the mask and the memory, provide functions per instruction, as
// well as an accessor for the memory.
const vm = () => {
  let andMask = 0;
  let orMask = 0;
  const mem = new Map();

  const applyMask = (value) => value & andMask | orMask;

  return {
    mask: ([maskStr]) => {
      andMask = BigInt(parseInt(maskStr.replace(/X/g, '1'), 2));
      orMask = BigInt(parseInt(maskStr.replace(/X/g, '0'), 2));
    },

    mem: ([offset, value]) => mem.set(offset, applyMask(value)),

    getMem: () => mem,
  };
};

// Run the program, return the sum of each value it has in memory once
// completed.
const interpret = async (program) => {
  const process = vm();
  for await (const [op, ...next] of program) {
    process[op](next);
  }
  return [...process.getMem().values()].reduce((acc, value) => acc + value, 0n);
};

// Just use the console.
const displayAnswer = console.log;

// Output the sum of all values in memory after the program has finished.
const part1 = async () => (
  displayAnswer(
    await interpret(
      read(
        streamSourceCode()
      )
    )
  )
);

const main = async () => {
  await part1();
};

await main();
