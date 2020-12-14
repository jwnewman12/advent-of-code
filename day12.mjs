import fs from 'fs';
import readline from 'readline';

const FILE_NAME = 'data/navigation-instructions.txt';

// (10, 1) => polar in rad
const PART2_INITIAL_WAYPOINT = [10.0499, 5.7106 * (Math.PI / 180)];

// Save the parsed instructions for subsequent reprocessing.
const cachedInstructions = [];

// Stream the source file one line at a time.
const streamInstructions = () => (
  readline.createInterface({
    input: fs.createReadStream(FILE_NAME),
  })
);

// Parse each instruction into the move and the numeric value and cache them.
const readInstructions = async function* (instructions) {
  for await (const instruction of instructions) {
    const parsed = [instruction.substring(0, 1), Number(instruction.substring(1))];
    cachedInstructions.push(parsed);
    yield parsed;
  }
};

const fp = (flt) => Math.round(flt * 10e2) / 10e2;

// Convert a vector in polar coodinates to cartesian.
const ptoc = ([m, th]) => ([
  fp(m * Math.cos(th)),
  fp(m * Math.sin(th)),
]);

// Return the manhattan distance, the sum of the absolute values of the
// cartesian coordinates.
const manhattanDistance = (vect) => {
  const [cx, cy] = ptoc(vect);
  return Math.abs(cx) + Math.abs(cy);
};

// Add one vector to another, return a new vector.
// http://hyperphysics.phy-astr.gsu.edu/hbase/vect.html
const vectorAdd = (vect1, vect2) => {
  const [cx1, cy1] = ptoc(vect1);
  const [cx2, cy2] = ptoc(vect2);
  const rx = cx1 + cx2;
  const ry = cy1 + cy2;
  // important to use atan2(), not atan(). atan() does not have the needed
  // behavior here for the sign across the negative quadrant. The link
  // above eludes to this, only ONE row in the dataset showed the issue.
  return [Math.sqrt(Math.pow(rx, 2) + Math.pow(ry, 2)), Math.atan2(ry, rx)];
};

// The ship owns its vector and heading, has operations to move, and will
// announce its manhattan distance after each move.
const ship = () => {
  let vector = [0.0, 0.0];
  let heading = 0.0;

  const adjustHeading = (n) => {
    heading += n * (Math.PI / 180);
  };

  const move = (m, th = heading) => {
    vector = vectorAdd(vector, [m, th]);
  };

  const moves = {
    F: move,

    L: adjustHeading,
    R: (n) => adjustHeading(n * -1),

    E: (n) => move(n, 0),
    N: (n) => move(n, Math.PI / 2),
    W: (n) => move(n, Math.PI),
    S: (n) => move(n, 3 * Math.PI / 2),
  };

  return (([move, n]) => moves[move](n) || manhattanDistance(vector));
};

// This unfortunately is quite different than v1.
const shipV2 = (waypoint) => {
  let vector = [0.0, 0.0];
  let course = waypoint;

  const move = (n) => {
    const [m, th] = course;
    vector = vectorAdd(vector, [m * n, th]);
  };

  const rotateCourse = (n) => {
    course[1] += n * (Math.PI / 180);
  };

  const pointCourse = (m, th) => {
    course = vectorAdd(course, [m, th]);
  };

  const moves = {
    F: move,

    L: rotateCourse,
    R: (n) => rotateCourse(n * -1),

    E: (n) => pointCourse(n, 0),
    N: (n) => pointCourse(n, Math.PI / 2),
    W: (n) => pointCourse(n, Math.PI),
    S: (n) => pointCourse(n, 3 * Math.PI / 2),
  };

  return (([move, n]) => moves[move](n) || manhattanDistance(vector));
};

// As instructions come in, advise the ship to move, and echo out its current
// distance.
const navigate = async function* (instructions, waypoint) {
  const sail = waypoint ? shipV2(waypoint) : ship();
  for await (const instruction of instructions) {
    yield sail(instruction);
  }
};

// Wait for the ship to finish moving, then return its last known distance.
const reportLastDisatnce = async (distanceAnnouncements) => {
  let currentDistance;
  for await (const distance of distanceAnnouncements) {
    currentDistance = distance;
  }
  return currentDistance;
};

// Just use the console, and fix floating point precision for display.
const displayAnswer = (flt) => console.log(fp(flt));

// Output the manhattan distance of the ship after has finished navigating
// each instruction.
const part1 = async () => {
  displayAnswer(
    await reportLastDisatnce(
      navigate(
        readInstructions(
          streamInstructions()
        )
      )
    )
  );
};

// Output the manhattan distance of the ship after it has finished navigating
// each instruction, under the updated rules, starting at the requested point.
const part2 = async () => {
  displayAnswer(
    await reportLastDisatnce(
      navigate(
        cachedInstructions,
        PART2_INITIAL_WAYPOINT,
      )
    )
  );
};

const main = async () => {
  await part1()
  await part2()
};

await main();
