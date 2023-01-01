import { CliModule } from './core/Cli.module';

async function init(): Promise<void> {
  const cli = new CliModule(process.cwd());
  await cli.init();
  await cli.run(process.argv);
}

init()
  .then(() => ({}))
  .catch((error) => {
    process.stdout.write(error.toString());
    process.exit(1);
  });

export default init;
