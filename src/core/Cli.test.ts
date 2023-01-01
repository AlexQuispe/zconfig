import { CliModule } from './Cli.module';
import { CliInfo } from './types';

describe('testing Cli.ts file', () => {
  test('run', async () => {
    const app = new CliModule(__dirname);
    expect(app).toHaveProperty('run');
  });

  test('info', async () => {
    const info: CliInfo = { name: 'MyCli', version: '1.0.0', message: 'Hi!' };
    expect(info.name).toBe('MyCli');
    expect(info.version).toBe('1.0.0');
    expect(info.message).toBe('Hi!');
  });
});
