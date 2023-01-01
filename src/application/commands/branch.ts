import { BusinessError } from './../../common/errors/BusinessError';
import { AppModule } from './../modules';
import { Command, Toolbox } from '../../core/models';

export default class Branch extends Command {
  constructor(toolbox: Toolbox) {
    super({
      name: 'branch',
      args: '[env]',
      description: 'Lista todos los entornos disponibles',
      options: [
        {
          description: 'Muestra los entornos de trabajo registrados.',
          flags: '-a',
          required: false,
        },
        {
          description: 'Elimina un espacio de trabajo.',
          flags: '-d',
          required: false,
        },
      ],
      toolbox,
    });
  }

  async action(toolbox: Toolbox, env: string | undefined, option1: { a: string; d: string }): Promise<void> {
    const { write } = toolbox;
    const app = new AppModule(toolbox);

    const listarEntornos = option1.a;
    const removerEntorno = option1.d;

    if (listarEntornos) {
      await app.printEnvironments();
      return;
    }

    if (removerEntorno) {
      if (!env) {
        throw new BusinessError('Debe especificar el entorno a eliminar');
      }
      await app.removeEnv(env);
      write(`Se eliminó el entorno ${env}.`);
    }
  }
}
