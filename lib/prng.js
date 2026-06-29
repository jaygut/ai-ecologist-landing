/* Seeded, reproducible PRNG. mulberry32 + xmur3 string hash.
   Same seed -> same sequence on every load and machine. No Math.random anywhere. */
(function (global) {
  "use strict";

  function xmur3(str) {
    let h = 1779033703 ^ str.length;
    for (let i = 0; i < str.length; i++) {
      h = Math.imul(h ^ str.charCodeAt(i), 3432918353);
      h = (h << 13) | (h >>> 19);
    }
    return function () {
      h = Math.imul(h ^ (h >>> 16), 2246822507);
      h = Math.imul(h ^ (h >>> 13), 3266489909);
      h ^= h >>> 16;
      return h >>> 0;
    };
  }

  function mulberry32(a) {
    return function () {
      a |= 0;
      a = (a + 0x6d2b79f5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  // Build a PRNG from a string or number seed. Returns an object with helpers.
  function makePRNG(seed) {
    const seedStr = String(seed == null ? "graph-of-life" : seed);
    const seedFn = xmur3(seedStr);
    const rand = mulberry32(seedFn());
    return {
      // float in [0, 1)
      next: rand,
      // float in [min, max)
      range: function (min, max) {
        return min + (max - min) * rand();
      },
      // signed jitter in [-amp, amp)
      jitter: function (amp) {
        return (rand() * 2 - 1) * amp;
      },
      // integer in [min, max]
      int: function (min, max) {
        return Math.floor(min + (max - min + 1) * rand());
      },
      // approximate standard-normal via Box-Muller (deterministic)
      gauss: function () {
        const u = Math.max(1e-9, rand());
        const v = rand();
        return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
      },
      // fork a stable child stream by label (independent, reproducible)
      fork: function (label) {
        return makePRNG(seedStr + "::" + label);
      },
    };
  }

  global.makePRNG = makePRNG;
})(window);
