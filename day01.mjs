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
const findTargetExpenses = async (expenseReport) => {
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

// After finding the two expenses, multiply them as requested
const answerQuestion = ([expense1, expense2]) => (
  expense1 * expense2
);

// Just use the console
const displayAnswer = console.log;

// Output the product of the two expenses that sum to the target (2020).
const main = async () => (
  displayAnswer(
    answerQuestion(
      await findTargetExpenses(
        streamExpenseReport()
      )
    )
  )
);

// Node 14.3+ has top level await now, if you name the file .mjs
await main();
