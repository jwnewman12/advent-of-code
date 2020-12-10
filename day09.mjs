import fs from 'fs';
import readline from 'readline';

const FILE_NAME = 'data/xmas-packets.bin';

// The premble, and sliding window length.
const N = 25;

// Cache the data for subsequent reprocessing.
const cachedPacketTrace = [];

// Stream the source file one line at a time.
const streamPacketTrace = () => (
  readline.createInterface({
    input: fs.createReadStream(FILE_NAME),
  })
);

// Pre-process the packets as they come in and cache for subsequent
// reprocessing.
const readPacketTrace = async function* (packetTrace) {
  for await (const packet of packetTrace) {
    const parsed = Number(packet);
    cachedPacketTrace.push(parsed);
    yield parsed;
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

// Find the weakness in the cipher, the min and max packets within the
// contiguous range that sums to the target tip packet. This is probaly not the
// best approach.
const findWeakness = (tipPacket, packetTrace) => {
  for (let i = 0; i < packetTrace.length; ++i) {
    let acc = 0;
    for (let j = i; j < packetTrace.length; ++j) {
      acc += packetTrace[j];

      // found the contiguous range
      if (acc === tipPacket) {
        // sort the numbers within the range, return min + max
        const range = new Int32Array(packetTrace.slice(i, j)).sort();
        return range[0] + range[range.length - 1];
      }

      // Exceeded, start over from one number up
      if (tipPacket < acc) {
        break;
      }
    }
  }
  return undefined;
};

// Just use the console
const displayAnswer = console.log;

// Output and return the packet that tips off the weakness in the cipher.
const part1 = async () => {
  const tipPacket = await findTipPacket(
    readPacketTrace(streamPacketTrace())
  );
  displayAnswer(tipPacket);
  return tipPacket;
};

// Output the sum of the min and max packets within the contiguous range that
// sums up to the tip packet.
const part2 = async (tipPacket) => (
  displayAnswer(
    findWeakness(tipPacket, cachedPacketTrace)
  )
);

const main = async () => {
  part2(
    await part1()
  );
};

await main();
