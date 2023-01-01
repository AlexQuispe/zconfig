import { CommandParams, Option } from '../types';
import { Toolbox } from './Toolbox';

export abstract class Command {
  name: string;
  args: string;
  description: string;
  options: Option[];
  toolbox: Toolbox;

  constructor({ name, args, description, options, toolbox }: CommandParams) {
    this.name = name;
    this.args = args;
    this.description = description;
    this.options = options;
    this.toolbox = toolbox;
  }

  async action(toolbox: Toolbox, ...argsAndOptions: unknown[]): Promise<void> {
    const { write } = toolbox;
    write(`cmd: ${this.name}`);
    write(`args and options: ${JSON.stringify(argsAndOptions)}`);
    write('action success!');
  }

  help(): string {
    return `${this.name} help`;
  }
}
