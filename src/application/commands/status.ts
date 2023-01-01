import { Command, Toolbox } from '../../core/models';
import { AppModule } from '../modules';

export default class Status extends Command {
  constructor(toolbox: Toolbox) {
    super({
      name: 'status',
      args: '',
      description: 'Muestra el estado de los archivos de configuración',
      options: [],
      toolbox,
    });
  }

  async action(toolbox: Toolbox): Promise<void> {
    const { write } = toolbox;

    const app = new AppModule(toolbox);

    const env = await app.getCurrentEnv();
    if (!env) {
      write(`Entorno: \x1b[33m<no definido>\x1b[0m`);
      write('');
    }

    if (env) {
      write(`Entorno: ${env}`);
      write('');
    }

    const { deleted, modified, files } = await app.getFileStatus();

    if (modified.length === 0 && deleted.length === 0) {
      if (files.length > 0) {
        files.forEach((arch, index) => {
          write(`   [${index + 1}] ${arch}`);
        });
        write('');
      }

      write('\x1b[32mSu configuración se encuentra actualizada\x1b[0m');
      write('Espacio de trabajo limpio');
      return;
    }

    if (modified.length > 0) {
      write('Cambios no registrados:');
      modified.forEach((arch) => {
        write(`\x1b[31m   modificado: ${arch}\x1b[0m`);
      });
    }

    if (deleted.length > 0) {
      deleted.forEach((arch) => {
        write(`\x1b[31m   eliminado: ${arch}\x1b[0m`);
      });
    }

    write('');
    write('Ejecute "app commit -a" para registrar los cambios');
  }
}
