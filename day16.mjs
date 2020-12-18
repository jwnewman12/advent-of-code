import fs from 'fs';

const FILE_NAME = 'data/train-station-rules.txt';

// Read the file synchronously.
const readFile = () => fs.readFileSync(FILE_NAME, 'utf-8').split('\n')

// Parse the file to the three parts.
const parse = (lines) => {
  const fields = new Map();
  const fieldEnd = lines.indexOf('');

  lines.slice(0, fieldEnd).forEach((rule) => {
    const [field, ranges] = rule.split(':');
    const [range1, range2] = ranges.split(' or ');
    const [min1, max1] = range1.split('-');
    const [min2, max2] = range2.split('-');
    fields.set(field, [min1, max1, min2, max2]);
  });

  const tickets = lines.slice(fieldEnd + 1);
  const ticketDivide = tickets.indexOf('');
  const myTicket = tickets[ticketDivide - 1];
  const nearbyTickets = tickets.slice(ticketDivide + 2)
    .map((ticket) => ticket.split(',').map(Number));

  return [fields, myTicket, nearbyTickets];
};

// There's nicer approach to index the fields, and build the chain of ranges
// that are valid, then simply check each number against that smaller dataset.
// I am not going to bother with that unless I have to.
const isInRange = (fields, n) => (
  [...fields.values()].map(([min1, max1, min2, max2]) => (
    (min1 <= n && n <= max1) || (min2 <= n && n <= max2)
  ))
);

// Return the number if it does not fall within any range ; 0 if it falls
// within at least one range.
const test = (fields, n) => (
  !isInRange(fields, n).includes(true) && n || 0
);

// Return the sum of every number of a ticket that is not valid within any range.
const sumInvalidTicketNumbers = (fields, ticket) => (
  ticket.reduce((acc, n) => acc + test(fields, n), 0)
);

// Return the sum of every number across all tickets that does not fall within
// any range.
const calculateScanningErrorRate = (fields, nearbyTickets) => (
  nearbyTickets.reduce((acc, ticket) => acc + sumInvalidTicketNumbers(fields, ticket), 0)
);

// Just use the console.
const displayAnswer = console.log;

// Output the sum of every invalid number.
const part1 = ([fields,, nearbyTickets]) => (
  displayAnswer(
    calculateScanningErrorRate(fields, nearbyTickets)
  )
);

const main = () => {
  const data = parse(readFile());
  part1(data);
};

main();
