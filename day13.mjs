import fs from 'fs';

const FILE_NAME = 'data/bus-schedule.txt';

// Just use the console.
const displayAnswer = console.log;

// Read the file synchronously and split the two lines as a tuple.
const readBusSchedule = () => fs.readFileSync(FILE_NAME, 'utf-8').split('\n');

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
      [Number.MAX_VALUE],
    )
    .reduce((a, b) => a * b)
);

// Display the product of the wait time and the bus id, for the bus that has
// the shortest wait time out of the set.
const part1 = () => (
  displayAnswer(
    answerQuestion(readBusSchedule())
  )
);

const main = () => {
  part1()
};

main();
