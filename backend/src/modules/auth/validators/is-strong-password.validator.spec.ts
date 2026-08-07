import { validate } from 'class-validator';
import { IsStrongPassword } from './is-strong-password.validator';

class Fixture {
  @IsStrongPassword()
  password!: string;
}

async function errorsFor(password: string) {
  const f = new Fixture();
  f.password = password;
  return validate(f);
}

describe('IsStrongPassword', () => {
  it('rejects passwords shorter than 10 characters', async () => {
    expect(await errorsFor('Aa1!aaa')).toHaveLength(1);
  });

  it('rejects passwords missing a symbol', async () => {
    expect(await errorsFor('Aaaaaaaaa1')).toHaveLength(1);
  });

  it('rejects passwords missing an uppercase letter', async () => {
    expect(await errorsFor('aaaaaaaaa1!')).toHaveLength(1);
  });

  it('rejects passwords missing a digit', async () => {
    expect(await errorsFor('Aaaaaaaaa!')).toHaveLength(1);
  });

  it('accepts a password meeting every requirement', async () => {
    expect(await errorsFor('Correct-Horse9')).toHaveLength(0);
  });
});
