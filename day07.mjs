import fs from 'fs';
import readline from 'readline';

const FILE_NAME = 'data/luggage-rules.txt';

const TARGET_COLOR = 'shiny-gold';

// Obtain an async iterator for the file.
const streamLuggageRules = () => (
  readline.createInterface({
    input: fs.createReadStream(FILE_NAME),
  })
);

const sanitize = (color) => color.trim().replace(/\s/g, '-');

const parseRule = (luggageRule) => {
  const [color, contains] = luggageRule.split('bags contain');
  return [
    sanitize(color),
    contains.trim().split(', ').map((s) => {
      const [num, color1, color2] = s.split(' ');
      return num === 'no' ? [] : [
        sanitize(`${color1}-${color2}`),
        Number(num),
      ];
    }),
  ];
};

const parseRules = async function* (luggageRules) {
/*
  luggageRules = [
    'light red bags contain 1 bright white bag, 2 muted yellow bags.',
    'dark orange bags contain 3 bright white bags, 4 muted yellow bags.',
    'bright white bags contain 1 shiny gold bag.',
    'muted yellow bags contain 2 shiny gold bags, 9 faded blue bags.',
    'shiny gold bags contain 1 dark olive bag, 2 vibrant plum bags.',
    'dark olive bags contain 3 faded blue bags, 4 dotted black bags.',
    'vibrant plum bags contain 5 faded blue bags, 6 dotted black bags.',
    'faded blue bags contain no other bags.',
    'dotted black bags contain no other bags.',
  ];
*/

  for await (const luggageRule of luggageRules) {
    yield parseRule(luggageRule);
  }
};

const createNode = (graph, color) => {
  const children = new Map();
  const parents = new Map();

  return () => ({
    getColor: () => color,

    addEdge: (chNode, val) => {
      children.set(chNode, val);
      chNode.linkEdge(graph.get(color), val);
    },

    linkEdge: (pNode, val) => {
      parents.set(pNode, val);
    },

    isRoot: () => parents.size === 0,

    walkUp: (fn) => {
      parents.forEach((k, v) => {
        fn(k, v);
        v.walkUp(fn);
      });
    },
  });
};

const findOrCreateNode = (graph, color) => {
  let node = null;
  if (! graph.has(color)) {
    node = createNode(graph, color)();
    graph.set(color, node);
  } else {
    node = graph.get(color);
  }
  return node;
};

const assembleGraph = async (parsedRules) => {
  const graph = new Map();
  for await (const [color, children] of parsedRules) {
    const node = findOrCreateNode(graph, color);
    children.forEach(([chColor, num]) => {
      if (num) {
        node.addEdge(findOrCreateNode(graph, chColor), num);
      }
    });
  }
  return graph;
};

const walkParentsToRoot = (graph, targetColor) => {
  let rootNodeCount = 0;
  graph.get(targetColor).walkUp((key, value) => {
    if (value.isRoot()) {
      ++rootNodeCount;
    }
  });
  return rootNodeCount;
};

// Just use the console.
const displayAnswer = console.log;

const part1 = async () => (
  displayAnswer(
    walkParentsToRoot(
      await assembleGraph(
        parseRules(
          streamLuggageRules()
        )
      ),
      TARGET_COLOR,
    )
  )
);

const main = async () => {
  await part1();
};

await main();
