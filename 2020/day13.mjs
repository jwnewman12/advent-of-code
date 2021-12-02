import fs from 'fs';

const FILE_NAME = 'data/bus-schedule.txt';

// Just use the console.
const displayAnswer = console.log;

// Read the file synchronously and split the two lines as a tuple.
const busSchedule = fs.readFileSync(FILE_NAME, 'utf-8').split('\n');

// Return the bus id multipled by the wait time, for the bus that has the
// shortest wait from our arrival time.
const answerQuestion = ([arrival, busSchedule]) => (
  busSchedule.replace(/x/g, '')
    .match(/[^,]+/g)
    .map((busId) => ([
      (busId * (Math.floor(arrival / busId) + 1)) - arrival,
      busId,
    ]))
    .reduce(
      ([waitTime, busId], [newWaitTime, newBusId]) => (
        waitTime < newWaitTime
          ? [waitTime, busId]
          : [newWaitTime, newBusId]
      ),
      [Infinity],
    )
    .reduce((a, b) => a * b)
);

const answerQuestion2 = ([arrival, busSchedule]) => {
  const bcic = busSchedule.split(',')
    .map((busId, i) => Number(busId) && [Number(busId), i, Number(busId) + i]).filter(Boolean);

  const bcs = bcic.map(([bc, ic]) => {
    return bc;
  });

  const ics = bcic.map(([bc, ic]) => {
    return ic;
  });

  const bids = ics.slice(1).map((i, f) => {
    return i - ics[f];
  });

  // multiply all together, then divide by the largest one.
  // check if the next largest at + i % 0 == 0
  // if so, continue to check next largest
  // once fail (common), subtract largest one (next possible) and recheck.
  // probably some further pattern from there

  const m = bcs.reduce((a, b) => a * b);
  const max = bcs.reduce((a, b) => a < b ? b : a);
  const mm = m / max;
  //const next = mm % f;
  console.dir([bcic, bcs, ics, bids, m, max, mm]);

  return 0;
};

// Display the product of the wait time and the bus id, for the bus that has
// the shortest wait time out of the set.
const part1 = () => (
  displayAnswer(
    answerQuestion(busSchedule)
  )
);

const part2 = () => (
  displayAnswer(
    answerQuestion2(busSchedule)
  )
);

const main = () => {
  part1()
  part2()
};

main();
