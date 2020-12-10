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

// Parse each instruction and assemble the source code stream into a workable
// format.
const compile = async (sourceCode) => {
  const program = [];
  for await (const instruction of sourceCode) {
    program.push(parse(instruction));
  }
  return program;
};

// Model the running process as a VM, with an inspectble framepointer and
// registers.
const vm = (program) => () => {
  let acc = 0;
  let fp = 0;

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
      cpu[opcode](value);
      return fp < program.length;
    },
  };
};

// Get the value of the acc right before an instruction is re-executed
const runUntilInfiniteLoop = (program) => {
  const executed = new Set();
  const process = vm(program)();
  while (process.isRunning()) {
    const fp = process.getFp();
    if (executed.has(fp)) {
      return process.getAcc();
    }
    executed.add(fp);
  }
  return process.acc();
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

const main = async () => {
  await part1();
};

await main();
