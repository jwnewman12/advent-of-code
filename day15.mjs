// $ time node ./day15.mjs
// 1085
// 10652
//
// real    0m11.257s
// user    0m12.800s
// sys 0m0.361s
// Good enough. I probably won't get back to this one.

const START = [1, 20, 11, 6, 12, 0];

[2020, 30000000].map((n) => {
  const age = new Map();
  let last = 0;

  const trackAge = (i) => age.set(last, [i + 1, (age.get(last) || [undefined])[0]]);

  START.forEach((startNum, i) => {
    last = startNum;
    trackAge(i);
  });

  for (let i = START.length; i < n; ++i) {
    const lastAge = age.get(last);
    last = lastAge && lastAge[1] ? lastAge[0] - lastAge[1] : 0;
    trackAge(i);
  }
  return last;
}).forEach(console.dir);
