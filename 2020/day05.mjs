import fs from 'fs';
import readline from 'readline';

const FILE_NAME = 'data/boarding-passes.txt';

// Save the data for subsequent re-processing.
const cachedSeatIds = [];

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
    const seatId = determineSeatId(boardingPass);
    cachedSeatIds.push(seatId);
    yield seatId;
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

// Find the closest open seat, a given direction from the middle
const findOpenSeat = (seatIds, multiplier = 1) => {
  const mid = Math.floor(seatIds.length / 2);
  let seat = seatIds[mid];
  for (let i = 1; i < mid; i += 1) {
    let seat2 = seatIds[mid + (i * multiplier)];
    if (1 < Math.abs(seat2 - seat)) {
      return mid + i;
    }
    seat = seat2;
  }
  return undefined;
};

// Find the closest open seat from themiddle, in either direction.
const findFirstMidOpenSeat = (seatIds) => (
  [findOpenSeat(seatIds, -1), findOpenSeat(seatIds)].filter(Boolean)[0]
);

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

// Output the closest open seat from the middle of the plane.
const part2 = async () => (
  displayAnswer(
    findFirstMidOpenSeat(
      new Int32Array(cachedSeatIds).sort()
    )
  )
);

const main = async () => {
  await part1();
  part2();
};

await main();
