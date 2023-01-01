import { AppModule } from './../modules';
import { Command, Toolbox } from '../../core/models';

export default class Reset extends Command {
  constructor(toolbox: Toolbox) {
    super({
      name: 'reset',
      args: '<env>',
      description: 'Restaura el entorno seleccionado',
      options: [
        {
          description: 'Fuerza la sobreescritura',
          flags: '--hard',
          required: false,
        },
      ],
      toolbox,
    });
  }

  async action(toolbox: Toolbox, env: string, option1: { hard: string }): Promise<void> {
    const flagHard = !!option1.hard;
    const app = new AppModule(toolbox);
    await app.resetEnv(env, flagHard);
  }
}
