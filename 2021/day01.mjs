import fs from 'fs';
import readline from 'readline';

const streamPuzzleInput = () => (
  readline.createInterface({
    input: fs.createReadStream(`data/${process.argv[1].split('/').at(-1).split('.')[0]}.txt`),
  })
);

const countDepthIncreases = async (depths, hook) => {
  let increases = 0;
  let previousDepth;
  for await (const depthString of depths) {
    const depth = Number(depthString);
    hook && hook(depth);

    if (previousDepth) {
      increases += 0 < depth - previousDepth;
    }
    previousDepth = depth;
  }
  return increases;
};

const countDepthIncreasesSlidingWindow = async (depths) => (
  await countDepthIncreases(
    depths.map((depth, i) => (
      1 < i ? [depths[i - 2], depths[i - 1], depth] : undefined
    )).filter((_) => _).map((window) => window.reduce((acc, i) => acc + i, 0))
  )
);

await (async () => {
  const cache = [];
  console.log(await countDepthIncreases(streamPuzzleInput(), (depth) => { cache.push(depth); }));
  console.log(await countDepthIncreasesSlidingWindow(cache));
})();
