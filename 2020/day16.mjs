import fs from 'fs';

const FILE_NAME = 'data/train-station-rules.txt';

// Read the file synchronously.
const readFile = () => fs.readFileSync(FILE_NAME, 'utf-8').split('\n')

const parseTicket = (ticket) => ticket.split(',').map(Number);

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
  const myTicket = parseTicket(tickets[ticketDivide - 1]);
  const nearbyTickets = tickets.slice(ticketDivide + 2).map(parseTicket);

  return [fields, myTicket, nearbyTickets];
};

// There's nicer approach to index the fields, and build the chain of ranges
// that are valid, then simply check each number against that smaller dataset.
// I am not going to bother with that unless I have to.
const isInFieldRange = ([min1, max1, min2, max2], n) => (
  (min1 <= n && n <= max1) || (min2 <= n && n <= max2)
);

const isInAnyRange = (fields, n) => (
  [...fields.values()].map((field) => isInFieldRange(field, n))
);

const isOutOfRange = (fields, n) => (
  !isInAnyRange(fields, n).includes(true)
);

// Return the number if it does not fall within any range ; 0 if it falls
// within at least one range.
const test = (fields, n) => (
  isOutOfRange(fields, n) && n || 0
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

const generateCandidates = (fields, myTicket, nearbyTickets) => {
  const candidates = [];
  myTicket.forEach((_, i) => {
    [...fields.entries()].forEach((field) => {
      const [key, value] = field;
      let valid = true;
      // add myticket
      for (let j = 0; j < nearbyTickets.length; ++j) {
        const ticket = nearbyTickets[j];
        if (!isInFieldRange(value, ticket[i])) {
          valid = false;
          console.dir([i, j, 'no']);
          break;
        } else {
          console.dir([i, j, 'yes']);
        }
      }
      console.dir(valid);

      if (valid) {
        candidates.push([key, i]);
      } else {
        console.dir('noo');
      }
    });
  });
  return candidates;
};

const filterCandidates = (candidates, fields, myTicket) => {
  while (fields.size < candidates.length) {
    myTicket.forEach((n, i) => {
      const fieldsForPos = candidates.filter(([,pos]) => pos === i);
      if (fieldsForPos.length === 1) {
        console.dir('1');
        const [key, pos] = fieldsForPos;
        candidates = candidates.filter(([cf, cp]) => {
          if (key === cf) {
            return pos === cp;
          }
          return true;
        });
      }
    });
  }
  return candidates;
};

const f = (fields, myTicket, nearbyTickets) => {
  const candidates = generateCandidates(fields, myTicket, nearbyTickets);
  console.dir(candidates.length);
  const filtered = filterCandidates(candidates, fields, myTicket);
  console.dir(candidates.length);
  const departureFields = candidates.filter(([[key]]) => key.startsWith('departure')).map(([,pos]) => pos);
  const t = departureFields.reduce((acc, pos) => acc * myTicket[pos], 1);
  return t;
};

const part2 = ([fields, myTicket, nearbyTickets]) => (
  displayAnswer(
    f(
      fields,
      myTicket,
      nearbyTickets.filter((ticket) => !isOutOfRange(fields, ticket)),
    )
  )
);

const main = () => {
  const data = parse(readFile());
  part1(data);
  part2(data);
};

main();
