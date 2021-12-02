import fs from 'fs';
import readline from 'readline';

const FILE_NAME = 'data/game-bootloader.asm';

// Stream the source file one line at a time.
const streamSourceCode = () => (
  readline.createInterface({
    input: fs.createReadStream(FILE_NAME),
  })
);

// Separate an instruction into its opcode and numeric value.
const parse = (instruction) => {
  const [opcode, value] = instruction.split(' ');
  return [opcode, Number(value)];
};

// Cache the program for subsequent re-runs.
const cachedProgram = [];

// Parse each instruction and assemble the source code stream into a workable
// format.
const compile = async (sourceCode) => {
  for await (const instruction of sourceCode) {
    cachedProgram.push(parse(instruction));
  }
  return cachedProgram;
};

// Model the running process as a VM, with an inspectble framepointer and
// registers.
const vm = (program) => () => {
  let acc = 0;
  let fp = 0;
  let stack = [];

  const cpu = {
    acc: (value) => { acc += value; ++fp; },
    jmp: (value) => { fp += value; },
    nop: (value) => { ++fp; },
  };

  return {
    getAcc: () => acc,
    getFp: () => fp,
    isRunning: () => {
      const [opcode, value] = program[fp];
      if (opcode !== 'acc') {
        stack.push([fp, opcode, value]);
      }
      cpu[opcode](value);
      return fp < program.length;
    },
    dumpStack: () => stack,
  };
};

// Get the value of the acc right before an instruction is re-executed
const runUntilInfiniteLoop = (program, debug = false) => {
  const executed = new Set();
  const process = vm(program)();
  while (process.isRunning()) {
    const fp = process.getFp();
    if (executed.has(fp)) {
      return debug ? [process.getAcc(), process.dumpStack()] : process.getAcc();
    }
    executed.add(fp);
  }
  return debug ? [process.getAcc()] : process.getAcc();
};

// Capture the stack from the program where it hangs. Work backwards, changing
// jmp to nop and nop to jump, until the program completes. Return the value of
// acc once the cource code is fixed.
const runUntilBugIsFixed = (program) => {
  const [, stack] = runUntilInfiniteLoop(program, true);

  for (let i = stack.length - 1; 0 <= i; --i) {
    const [suspectFrame, suspectOp, value] = stack[i];

    const hacked = [...program];
    hacked[suspectFrame] = [ suspectOp === 'jmp' ? 'nop' : 'jmp', value];

    const [acc, dump] = runUntilInfiniteLoop(hacked, true);
    if (!dump) {
      return acc;
    }
  }
  return undefined;
};

// Just use the console
const displayAnswer = console.log;

const part1 = async () => (
  displayAnswer(
    runUntilInfiniteLoop(
      await compile(
        streamSourceCode()
      )
    )
  )
);

const part2 = async () => (
  displayAnswer(
    runUntilBugIsFixed(cachedProgram)
  )
);

const main = async () => {
  await part1();
  part2();
};

await main();
