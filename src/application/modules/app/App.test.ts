import { Toolbox } from './../../../core/models/Toolbox';
import { AppModule } from './App.module';
import path from 'path';

describe('testing App.ts file', () => {
  test('isInitialized', async () => {
    const rootPath = path.resolve(__dirname);
    const toolbox = new Toolbox(rootPath);
    const app = new AppModule(toolbox);
    expect(app).toHaveProperty('isInitialized');
    const result = await app.isInitialized();
    expect(result).toBe(false);
  });
});
