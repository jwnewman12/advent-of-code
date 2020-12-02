import fs from 'fs';
import readline from 'readline';

const FILE_NAME = 'data/expense-report.txt';
const TARGET_SUM = 2020;

// Keep the state of numbers that have already been processed
const expenses = new Set();

// Obtain an async iterator for the file
const streamExpenseReport = () => (
  readline.createInterface({
    input: fs.createReadStream(FILE_NAME),
  })
);

// As lines appear in the stream, see if the current line's compliment has
// already appeared. If and when the two matches are found, return them as a
// tuple. Throw if the entire report is scanned with no match.
const findTwoTargetExpenses = async (expenseReport) => {
  for await (const expense of expenseReport) {
    if (expense < TARGET_SUM) {
      const amount = Number(expense);
      const compliment = TARGET_SUM - amount;
      if (expenses.has(compliment)) {
        return [amount, compliment];
      }
      expenses.add(amount);
    }
  }
  throw new Error(`Did not find any two expenses that sum to ${TARGET_SUM}`);
};

// Use the state from part 1 to find the triple that sums to the target value.
// Instead of N^2 behavior, we can at least get to (N/2)^2 with a slight
// optimization - two out of the three must be less than one half of the
// target. Actually further, that minus 2 as each value will be at least 1.
// There are further optimizations, and unhandled edge cases, and several
// assumptions here. This is actually somewhat of a hard problem to do really
// well. It's also late, I'll settle for two smaller nested loops.
const findThreeTargetExpenses = () => {
  const sorted = new Int16Array(expenses).sort();
  const reversed = new Int16Array(sorted).reverse();
  // I'm not going to implement a search .. this is the best the stdlib has
  const midIndexReverse = reversed.findIndex((expense) => expense < TARGET_SUM / 2);
  const midIndex = sorted.length - 1 - midIndexReverse;

  // Store the first two parts of every triple, where N < T / 2.
  // The map structure is keyed by the partial sum, with the tuple of both
  // addends as the value.
  const twoAddends = new Map();
  for (let i = 0; i <= midIndex; ++i) {
    for (let j = i + 1; j <= midIndex; ++j) {
      twoAddends.set(sorted[i] + sorted[j], [sorted[i], sorted[j]]);
    }
  }

  // The quickest way from here looks like to take the partial sums in reverse
  // and go through the original numbers after T / 2 until the triple is found.
  const partialSums = new Int16Array(twoAddends.keys()).sort().reverse();
  for (let i = 0; i < partialSums.length; ++i) {
    for (let j = midIndex + 1; j < sorted.length; ++j) {
      if (partialSums[i] + sorted[j] === TARGET_SUM) {
        const addends = twoAddends.get(partialSums[i]);
        return [sorted[j], addends[0], addends[1]];
      }
    }
  }
};

// After finding the two expenses, multiply them as requested
const answerQuestion = (expenses) => (
  expenses.reduce((acc, expense) => acc * expense)
);

// Just use the console
const displayAnswer = console.log;

// Output the product of the two expenses that sum to the target (2020).
const part1 = async () => (
  displayAnswer(
    answerQuestion(
      await findTwoTargetExpenses(
        streamExpenseReport()
      )
    )
  )
);

// Output the product of the three expenses that sum to the target (2020).
// Reuse the state from the file read in part 1.
const part2 = () => (
  displayAnswer(
    answerQuestion(
      findThreeTargetExpenses()
    )
  )
);

const main = async () => {
  await part1();
  part2();
};

// Node 14.3+ has top level await now, if you name the file .mjs
await main();
