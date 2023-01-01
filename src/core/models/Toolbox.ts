export class Toolbox {
  rootPath: string;

  constructor(rootPath: string) {
    this.rootPath = rootPath;
  }

  write(msg: string): void {
    process.stdout.write(`${msg}\n`);
  }
}
