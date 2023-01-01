import { AppModule } from './../modules';
import { Command, Toolbox } from '../../core/models';

export default class Diff extends Command {
  constructor(toolbox: Toolbox) {
    super({
      name: 'diff',
      args: '[env]',
      description: 'Muestra las diferencias con el entorno actual.',
      options: [],
      toolbox,
    });
  }

  async action(toolbox: Toolbox, env?: string): Promise<void> {
    const app = new AppModule(toolbox);
    await app.diff(env);
  }
}
