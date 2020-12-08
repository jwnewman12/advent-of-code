import fs from 'fs';
import readline from 'readline';

const FILE_NAME = 'data/boarding-passes.txt';

// Obtain an async iterator for the file.
const streamBoardingPasses = () => (
  readline.createInterface({
    input: fs.createReadStream(FILE_NAME),
  })
);

// Convert the string to binary, then use number format for each part to
// determine the row and column. Multiplly the row by 8 and add the column.
const determineSeatId = (boardingPass) => {
  const [, row, col] = boardingPass.replace(/[FL]/g, '0')
      .replace(/[BR]/g, '1').match(/([01]{7})([01]{3})/);
  return 8 * Number(`0b${row}`) + Number(`0b${col}`);
};

// As the file streams, determine each seat id.
const determineSeatIds = async function* (boardingPassStream) {
  for await (const boardingPass of boardingPassStream) {
    yield determineSeatId(boardingPass);
  }
};

// As the seatIds stream in, find the largest one.
const findMax = async (seatIds) => {
  let max = 0;
  for await (const seatId of seatIds) {
    max = seatId < max ? max : seatId;
  }
  return max;
};

// Just use the console.
const displayAnswer = console.log;

// Output the highest seatId encountered.
const part1 = async () => (
  displayAnswer(
    await findMax(
      determineSeatIds(
        streamBoardingPasses()
      )
    )
  )
);

const main = async () => {
  await part1();
};

await main();
