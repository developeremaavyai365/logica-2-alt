import { formatProblem } from './title-formats.service';

describe('checking a title format before it is saved', () => {
  it('accepts a format with fields in braces', () => {
    expect(formatProblem('{brand} {model} ({colour}, {ram} RAM, {storage} Storage)')).toBeNull();
    expect(formatProblem('{brand} {model} {Printer Type} Printer')).toBeNull();
  });

  it('refuses one that is empty, too long, has unmatched braces or names neither brand nor model', () => {
    expect(formatProblem('  ')).toBe('Write the format.');
    expect(formatProblem(`{model} ${'x'.repeat(300)}`)).toBe('A format is at most 300 characters.');
    expect(formatProblem('{brand} {model')).toMatch(/not closed/);
    expect(formatProblem('{brand} model}')).toMatch(/one pair of braces/);
    expect(formatProblem('{{brand}}')).toMatch(/one pair of braces/);
    expect(formatProblem('{colour} {storage}')).toBe('A format needs at least {brand} or {model}.');
  });
});
