import { EventEmitter } from "events";
import { listenForEventPattern, listenForNextEventPattern } from "../utils.js";

test("listenForEventPattern", async () => {
  const event = new EventEmitter();
  let occurrences = 0;

  const unsub = listenForEventPattern(event, "data", ">", null, () => occurrences++);

  event.emit("data", "nothing");
  event.emit("data", "nothing");
  assert.equal(occurrences, 0);
  event.emit("data", ">");
  assert.equal(occurrences, 1);
  event.emit("data", "nothing");
  event.emit("data", "nothing");
  assert.equal(occurrences, 1);
  event.emit("data", "something > surely");
  assert.equal(occurrences, 2);
  unsub();
  event.emit("data", ">");
  event.emit("data", ">");
  assert.equal(occurrences, 2); // still 2 after unsub
});

test("listenForNextEventPattern", () => {
  test("can detect adjacent characters", async () => {
    const event = new EventEmitter();
    let resolved = false;

    const promise = listenForNextEventPattern(event, "data", ">>>").then(() => (resolved = true));

    event.emit("data", ">");
    event.emit("data", ">");
    event.emit("data", "just kidding");
    event.emit("data", ">");
    event.emit("data", ">");
    assert(!resolved);
    event.emit("data", ">");
    await promise;
    assert(resolved);
  });

  test("can detect string", async () => {
    const event = new EventEmitter();
    let resolved = false;

    const promise = listenForNextEventPattern(event, "data", ">>>").then(() => (resolved = true));

    event.emit("data", ">>>");
    await promise;
    assert(resolved);
  });

  test("can detect regex", async () => {
    const event = new EventEmitter();
    let resolved = false;

    const promise = listenForNextEventPattern(event, "data", />>>/, 3).then(() => (resolved = true));

    event.emit("data", ">>>");
    await promise;
    assert(resolved);
  });
});
