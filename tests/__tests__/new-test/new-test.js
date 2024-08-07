
import { runFile, insp } from '../../helpers/testsHelper';

let pjs = runFile(import.meta.url, 'new-test.code');

test('result = 7', () => {
    expect(pjs.engine.results[0]).toBe(5);
    expect(pjs.engine.results[1]).toBe(10);
    expect(pjs.engine.results[2]).toBe(13);
  });