import { APP_NAME, APP_VERSION } from '../config';
import { Command, Toolbox } from '../models';

export default class Hello extends Command {
  constructor(toolbox: Toolbox) {
    super({
      name: 'hello',
      args: '',
      description: 'Mensaje de bienvenida',
      options: [],
      toolbox,
    });
  }

  async action(toolbox: Toolbox): Promise<void> {
    const { write } = toolbox;
    write(`Hi! welcome to ${APP_NAME} v${APP_VERSION}`);
    write('');
  }
}
