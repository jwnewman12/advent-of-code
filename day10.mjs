(([diffChainsRemoved, stdout]) => [
  ...stdout,
  ((diffChainsRemoved, shifted) => [
    diffChainsRemoved.slice(1)
      .map((removed, i) => (removed.length - shifted[i].length) / (i + 2))
      .reduce((acc, chainCount, i) => acc * Math.pow(
        [...Array(i + 2).keys()].reduce((tribAcc, tribN) => tribAcc + tribN, 1),
        chainCount,
      ), 1)
  ])(diffChainsRemoved, diffChainsRemoved),
])(
  (([diffString, stdout]) => [
    [...Array(3).keys()]
      .reverse()
      .map((i) => Array(i + 3).join('1'))
      .reduce((acc, chain, i) => [...acc, acc[i].split(chain).join('')], [diffString])
      .reverse(),
    stdout,
  ])(
    ((diffString) => [
      diffString,
      [diffString.split('3').join('').length * (diffString.split('1').join('').length + 1)],
    ])(
      ((sorted) =>
        ((sorted, shifted) =>
          sorted.slice(1).map((rating, i) => shifted[i] - rating).join('')
        )(sorted, sorted)
      )(
        new Int32Array(
          (await import ('fs')).readFileSync('data/jolt-adapters.txt', 'utf-8').split('\n')
        ).sort().reverse(),
      ),
    ),
  ),
).flat().map(console.dir);
