import fs from 'fs';
import readline from 'readline';

const FILE_NAME = 'data/initialization-program.bin';

// Obtain an async iterator for the file.
const streamSourceCode = () => (
  readline.createInterface({
    input: fs.createReadStream(FILE_NAME),
  })
);

// Save the program for subsequent reprocessing.
const cachedProgram = [];

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

// Read the program line by line, emit each parsed line and cache it forlater.
const read = async function* (sourceCode) {
  for await (const line of sourceCode) {
    const parsed = parse(line);
    cachedProgram.push(parsed);
    yield parsed;
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

// https://stackoverflow.com/a/43053803
const cartesianProduct = (a) => (
  a.reduce((a, b) => a.flatMap(d => b.map(e => [d, e].flat())))
);

// For the mask instruction - split it on 'X', then map each part to a tuple
// with 0|1 appended. Compute the cartesian product of every tuple, then join
// them together, to form each mask. Compute the parity across all masks to
// re-reveal the floating bits. Then run it through the right gates.
const vmV2 = () => {
  let masks = [];
  let parity = 0;
  const mem = new Map();

  const generateMasks = (parts) => (
    cartesianProduct(
      parts.map((part, i) => (
        i === parts.length - 1 ? [part] : [part + '0', part + '1']
      ))
    ).map((arr) => arr.join('')).map((str) => BigInt(parseInt(str, 2)))
  );

  // This took a little to figure out. I like these problems.
  const applyMask = (offset, mask) => (offset | mask) ^ (offset & mask & parity);

  return {
    mask: ([maskStr]) => {
      masks = generateMasks(maskStr.split('X'));
      parity = masks.slice(1).map((mask, i) => mask ^ masks[i]).reduce((a, b) => a | b);
    },

    mem: ([offset, value]) => {
      masks.forEach((mask) => {
        mem.set(applyMask(offset, mask), value);
      });
    },

    getMem: () => mem,
  };
};

// Run the program, return the sum of each value it has in memory once
// completed.
const interpret = async (program, v2 = false) => {
  const process = (v2 ? vmV2 : vm)();
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

// Output the sum of all values in memory after the second version of the
// program has finished.
const part2 = async () => (
  displayAnswer(
    await interpret(
      cachedProgram,
      true,
    )
  )
);

const main = async () => {
  await part1();
  await part2();
};

await main();
