import { Command, Toolbox } from '../../core/models';
import { CalcModule } from '../modules';

export default class Calc extends Command {
  constructor(toolbox: Toolbox) {
    super({
      name: 'calc',
      args: '<numberA> <numberB>', // all args are required
      description: 'Calcula la operación de 2 números',
      options: [
        {
          defaultValue: 'suma',
          description: 'Tipo de operación (suma, resta, producto, division).',
          flags: '-o, --operation <type>',
          required: true,
        },
      ],
      toolbox,
    });
  }

  async action(toolbox: Toolbox, numberA: string, numberB: string, option1: { operation: string }): Promise<void> {
    const { write } = toolbox;

    const a = Number(numberA);
    const b = Number(numberB);
    const operation = option1.operation;

    if (operation === 'suma') {
      const calc = new CalcModule();
      const resultado = await calc.suma(a, b);
      write(String(resultado));
      return;
    }

    if (operation === 'resta') {
      const calc = new CalcModule();
      const resultado = await calc.resta(a, b);
      write(String(resultado));
      return;
    }

    if (operation === 'producto') {
      const calc = new CalcModule();
      const resultado = await calc.producto(a, b);
      write(String(resultado));
      return;
    }

    if (operation === 'division') {
      const calc = new CalcModule();
      const resultado = await calc.division(a, b);
      write(String(resultado));
      return;
    }

    write(`Error: Operation "${operation}" is not defined`);
  }

  help(): string {
    const msg = `
Example:
  $ app calc --operation producto 10 20
    `;

    return msg;
  }
}
