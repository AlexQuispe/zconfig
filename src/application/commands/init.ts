import { Command, Toolbox } from '../../core/models';
import { AppModule } from '../modules';

export default class Init extends Command {
  constructor(toolbox: Toolbox) {
    super({
      name: 'init',
      args: '',
      description: 'Inicializa la configuración del proyecto.',
      options: [],
      toolbox,
    });
  }

  async action(toolbox: Toolbox): Promise<void> {
    const { write } = toolbox;

    const app = new AppModule(toolbox);
    const initialized = await app.isInitialized();
    if (initialized) {
      return write('El proyecto ya se encuentra configurado');
    }

    const projectInfo = await app.getProjectInfo();
    await app.init(projectInfo);
    write('Proyecto configurado correctamente');
  }
}
