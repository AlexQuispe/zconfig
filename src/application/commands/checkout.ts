import { AppModule } from './../modules';
import { Command, Toolbox } from '../../core/models';

export default class Checkout extends Command {
  constructor(toolbox: Toolbox) {
    super({
      name: 'checkout',
      args: '<env>',
      description: 'Cambia de entorno',
      options: [
        {
          description: 'Indica que se trata de un nuevo entorno.',
          flags: '-b',
          required: false,
        },
      ],
      toolbox,
    });
  }

  async action(toolbox: Toolbox, env: string, option1: { b: string }): Promise<void> {
    const { write } = toolbox;

    const flagB = !!option1.b;

    if (flagB) {
      const app = new AppModule(toolbox);
      await app.createAndSwitchEnv(env);
      write(`Se creó el entorno ${env} y se cambió a este nuevo entorno.`);
    }

    if (!flagB) {
      const app = new AppModule(toolbox);
      await app.switchEnv(env);
      write(`Cambiado al entorno ${env}`);
    }
  }
}
