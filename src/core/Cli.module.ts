import { CliInfo } from './types';
import { Command as Program } from 'commander';
import { Command, Toolbox } from './models';
import path from 'path';
import fs from 'fs';
import { APP_NAME, APP_VERSION } from './config';
import { BusinessError } from '../common/errors';

export class CliModule {
  private info: CliInfo;
  private commands: Command[];
  private toolbox: Toolbox;

  constructor(rootPath: string) {
    this.info = {
      name: APP_NAME,
      version: APP_VERSION,
      message: 'Hello world!',
    };
    this.commands = [];
    this.toolbox = new Toolbox(rootPath);
  }

  async init(): Promise<void> {
    const coreCommands = await this.findCommands(path.resolve(__dirname, 'commands'));
    const demoCommands = await this.findCommands(path.resolve(__dirname, '../demo/commands'));
    const appCommands = await this.findCommands(path.resolve(__dirname, '../application/commands'));
    this.commands = coreCommands.concat(demoCommands).concat(appCommands);
  }

  async run(argv: string[]): Promise<void> {
    if (argv.length === 2) {
      this.printAppInfo();
      return;
    }

    const program = new Program();
    program.version(this.info.version);

    for (const command of this.commands) {
      const cmd = program.command(command.name);

      if (command.args) {
        cmd.arguments(command.args);
      }

      if (command.description) {
        cmd.description(command.description);
      }

      for (const opt of command.options) {
        if (opt.required) {
          cmd.requiredOption(opt.flags, opt.description, opt.defaultValue);
          continue;
        }
        cmd.option(opt.flags, opt.description, opt.defaultValue);
      }

      if (command.action) {
        const { write } = this.toolbox;
        cmd.action((...argsAndOptions) =>
          command.action(this.toolbox, ...argsAndOptions).catch((error) => {
            if (error instanceof BusinessError) {
              write(`\x1b[31mError:\x1b[0m ${error.message}\n`);
              process.exit(0);
            }
            throw error;
          }),
        );
      }

      if (command.help) {
        cmd.on('--help', () => this.toolbox.write(command.help()));
      }
    }

    program.on('command:*', () => this.printCommandInvalid());
    program.parse(argv);
  }

  private async findCommands(basePath: string): Promise<Command[]> {
    const commands: Command[] = [];

    const COMMANDS_PATH = basePath;
    const allCommands = fs.readdirSync(COMMANDS_PATH);

    for (const commandPath of allCommands) {
      const CommandClass = await import(path.resolve(COMMANDS_PATH, commandPath));
      const commandInstance: Command = new CommandClass.default(this.toolbox);
      commands.push(commandInstance);
    }

    return commands;
  }

  private printCommandInvalid(): void {
    const { write } = this.toolbox;
    write('Comando inválido.\n\nUtilice la opción --help para obtener más información.\n');
  }

  private printAppInfo() {
    const { write } = this.toolbox;
    write(this.info.name);
    write(this.info.version);
    write(this.info.message);
  }
}
