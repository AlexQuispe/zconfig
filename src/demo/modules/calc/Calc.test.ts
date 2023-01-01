import { CalcModule } from './Calc.module';
import { Message } from './types';

describe('testing Calc.ts file', () => {
  test('suma', async () => {
    const calc = new CalcModule();
    expect(calc).toHaveProperty('suma');
    const sumResult = await calc.suma(1, 2);
    expect(sumResult).toBe(3);
  });

  test('resta', async () => {
    const calc = new CalcModule();
    expect(calc).toHaveProperty('resta');
    const sumResult = await calc.resta(1, 2);
    expect(sumResult).toBe(-1);
  });

  test('producto', async () => {
    const calc = new CalcModule();
    expect(calc).toHaveProperty('producto');
    const sumResult = await calc.producto(1, 2);
    expect(sumResult).toBe(2);
  });

  test('division', async () => {
    const calc = new CalcModule();
    expect(calc).toHaveProperty('division');
    const sumResult = await calc.division(1, 2);
    expect(sumResult).toBe(0.5);
  });

  test('message', async () => {
    const message: Message = { other: 'value' };
    expect(message.other).toBe('value');
  });
});
