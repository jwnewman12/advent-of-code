import fs from 'fs';
import readline from 'readline';

const FILE_NAME = 'data/xmas-packets.bin';

// The premble, and sliding window length.
const N = 25;

// Stream the source file one line at a time.
const streamPacketTrace = () => (
  readline.createInterface({
    input: fs.createReadStream(FILE_NAME),
  })
);

// Pre-process the packets as they come in.
const readPacketTrace = async function* (packetTrace) {
  for await (const packet of packetTrace) {
    yield Number(packet);
  }
};

// Return true if the packet is the interesting one, meaning that no two unique
// immediately prior packets in the window of length N sum to it; false if it's
// a normal packet.
const isTipPacket = (target, window) => {
  const r = new Int32Array(new Set(window)).sort().reverse();
  const mir = r.findIndex((n) => n < target / 2);
  // I'm sure there's a faster way to do this, w/e
  // At least work the list from N/2
  for (let i = 0; i < mir; ++i) {
    for (let j = mir; j < r.length; ++j) {
      if (r[i] + r[j] === target) {
        return false;
      }
    }
  }
  return true;
};

// Find the packet in the trace that tips off the weakness in the cipher.`
const findTipPacket = async (packetTrace) => {
  const window = [];
  let i = 0;
  for await (const packet of packetTrace) {
    // Use a fixed size queue instead of this growing array, sometime later
    window.push(packet);
    if (N < i) {
      if (isTipPacket(packet, window.slice(i - N, i))) {
        return packet;
      }
    }
    ++i;
  }
  return undefined;
};

// Just use the console
const displayAnswer = console.log;

// Output the packet that tips off the weakness in the cipher.
const part1 = async () => (
  displayAnswer(
    await findTipPacket(
      readPacketTrace(
        streamPacketTrace()
      )
    )
  )
);

const main = async () => {
  await part1();
};

await main();
