import { AppModule } from './../modules';
import { Command, Toolbox } from '../../core/models';

export default class Merge extends Command {
  constructor(toolbox: Toolbox) {
    super({
      name: 'merge',
      args: '<env>',
      description: 'Fusiona con el entorno seleccionado',
      options: [],
      toolbox,
    });
  }

  async action(toolbox: Toolbox, env: string): Promise<void> {
    const { write } = toolbox;
    const app = new AppModule(toolbox);
    await app.mergeEnv(env);
    write(`Fusionado con el entorno ${env}`);
  }
}
