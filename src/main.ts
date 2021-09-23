import assert from "assert";
import { createHash } from "crypto";
import { readFileSync } from "fs";
import { performance } from "perf_hooks";
import process from "process";

const genHashes = (): Array<string> => {
  const NUM_HASHES = 100000;

  const hashes: Array<string> = [];
  for (let i = 0; i < NUM_HASHES; i++) {
    const hash = createHash("sha512");
    const randNum = Math.random().toString(10);
    hash.update(randNum);
    hashes.push(hash.digest("hex"));
  }

  return hashes;
};

const profileAction = <T>(action: () => T): [T, number] => {
  const before = performance.now();
  const result = action();
  const after = performance.now();
  return [result, after - before];
};

const testIncludesPerformance = () => {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const [hashesJson, timeToLoadJson] = profileAction(() => readFileSync("./hundredThousandHashes.json", "utf-8"));

  const [hashes, timeToParseJson]: [Array<string>, number] = profileAction(() => JSON.parse(hashesJson));

  const existingHash1 =
    "b328948ec393d0533d7ce0d4e31a5ab55ced06f2a77209d46f1c9210a203f1b1c1abdf8fc4d80a1a4b36eab09ebc95333f0871417e9a7d4cba8909f1dda5c578";
  const existingHash2 =
    "2380d984ce5a5a072c7a3066f18e43f3037ce528e82c0325d8deb0fd743a930cab599563322c3a5b4fa9cb63001b348ac677f30e75ad8130d8aabb607371a451";
  const nonexistentHash1 = "0".repeat(existingHash1.length);
  const nonexistentHash2 = "f".repeat(existingHash2.length);

  const [shouldBeTrue1, timeToIncludesExisting1] = profileAction(() => hashes.includes(existingHash1));
  const [shouldBeTrue2, timeToIncludesExisting2] = profileAction(() => hashes.includes(existingHash2));
  const [shouldBeFalse1, timeToIncludesNonexisting1] = profileAction(() => hashes.includes(nonexistentHash1));
  const [shouldBeFalse2, timeToIncludesNonexisting2] = profileAction(() => hashes.includes(nonexistentHash2));

  assert(shouldBeTrue1);
  assert(shouldBeTrue2);
  assert(!shouldBeFalse1);
  assert(!shouldBeFalse2);

  console.log(`Time to load JSON: ${timeToLoadJson} ms`);
  console.log(`Time to parse JSON: ${timeToParseJson} ms`);

  console.log(`Inclusion test for existing hash 1: ${timeToIncludesExisting1} ms`);
  console.log(`Inclusion test for existing hash 2: ${timeToIncludesExisting2} ms`);
  console.log(`Inclusion test for nonexistent hash 1: ${timeToIncludesNonexisting1} ms`);
  console.log(`Inclusion test for nonexistent hash 2: ${timeToIncludesNonexisting2} ms`);
};

const command = process.argv[2];

if (command === undefined) {
  throw new Error("No command");
}

if (command === "genHashes") {
  const hashArray = genHashes();
  console.log(JSON.stringify(hashArray));
} else if (command === "includesTest") {
  testIncludesPerformance();
} else {
  console.error("No command");
}
