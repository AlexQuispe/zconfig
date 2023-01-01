import { AppModule } from './../modules';
import { Command, Toolbox } from '../../core/models';

export default class Add extends Command {
  constructor(toolbox: Toolbox) {
    super({
      name: 'add',
      args: '<filepath>',
      description: 'Adiciona un nuevo archivo de configuración al entorno actual',
      options: [],
      toolbox,
    });
  }

  async action(toolbox: Toolbox, filepath: string): Promise<void> {
    const { write } = toolbox;
    const app = new AppModule(toolbox);
    await app.registerFile(filepath);
    const currentEnv = await app.getCurrentEnv();
    write(`Registro exitoso en el entorno "${currentEnv}"`);
  }
}
