import hyperId from 'hyperid';

const makeHyperId = hyperId({
  fixedLength: true,
  urlSafe: true,
});

export function makeUniqueId() {
  return makeHyperId();
}
