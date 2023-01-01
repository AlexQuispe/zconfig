import { FileService } from '../FileService';
import path from 'path';

describe('testing FileService.ts file', () => {
  afterAll(async () => {
    const tmpPath = path.resolve(__dirname, '.tmp');
    FileService.rmdir(tmpPath);
  });

  beforeAll(async () => {
    const tmpPath = path.resolve(__dirname, '.tmp');
    FileService.rmdir(tmpPath);
  });

  test('find with ignore', async () => {
    expect(FileService).toHaveProperty('find');

    const searchPath = path.resolve(__dirname, 'sample');
    const files = await FileService.find(
      '/**/*.txt',
      {
        root: searchPath,
        ignore: ['/**/*two-?.txt'],
      },
      async (fileInfo) => {
        expect(fileInfo.dirName.startsWith(searchPath)).toBe(false);
        expect(fileInfo.dirPath.startsWith(searchPath)).toBe(true);
        expect(fileInfo.filePath.startsWith(searchPath)).toBe(true);
        expect(fileInfo.fileExt).toBe('.txt');
      },
    );

    expect(files.length).toBe(4);
    expect(files.some((f) => f.fileName === 'one')).toBe(true);
    expect(files.some((f) => f.fileName === 'two')).toBe(true);
    expect(files.some((f) => f.fileName === 'two-1')).toBe(false);
    expect(files.some((f) => f.fileName === 'two-2')).toBe(false);
    expect(files.some((f) => f.fileName === 'two-3')).toBe(false);
    expect(files.some((f) => f.fileName === 'three')).toBe(true);
    expect(files.some((f) => f.fileName === 'four')).toBe(true);
  });

  test('find gitkeep', async () => {
    const searchPath = path.resolve(__dirname, 'sample');
    const files = await FileService.find(
      '/**/.gitkeep',
      {
        root: searchPath,
      },
      async (fileInfo) => {
        expect(fileInfo.dirName.startsWith(searchPath)).toBe(false);
        expect(fileInfo.dirPath.startsWith(searchPath)).toBe(true);
        expect(fileInfo.filePath.startsWith(searchPath)).toBe(true);
        expect(fileInfo.fileExt).toBe('');
        expect(fileInfo.fileName).toBe('.gitkeep');
      },
    );
    expect(files.length).toBe(3);
  });

  test('find subfolder', async () => {
    const searchPath = path.resolve(__dirname, 'sample');
    const files = await FileService.find('/**/four.txt', { root: searchPath });
    expect(files.length).toBe(1);
    const fileInfo = files[0];
    expect(fileInfo.fileName).toBe('four');
    expect(fileInfo.fileExt).toBe('.txt');
  });

  test('isFile', async () => {
    const filePath = path.resolve(__dirname, 'sample/one.txt');
    const dirPath = path.resolve(__dirname, 'sample');
    expect(await FileService.isFile(filePath)).toBe(true);
    expect(await FileService.isFile(dirPath)).toBe(false);
  });

  test('isDirectory', async () => {
    const filePath = path.resolve(__dirname, 'sample/one.txt');
    const dirPath = path.resolve(__dirname, 'sample');
    expect(await FileService.isDirectory(filePath)).toBe(false);
    expect(await FileService.isDirectory(dirPath)).toBe(true);
  });

  test('readFile', async () => {
    const filePath = path.resolve(__dirname, 'sample/one.txt');
    expect(await FileService.readFile(filePath)).toBe('one');
  });

  test('writeFile', async () => {
    const filePath = path.resolve(__dirname, '.tmp/some.txt');

    await FileService.unlink(filePath);
    expect(await FileService.isFile(filePath)).toBe(false);

    await FileService.writeFile(filePath, 'some-content');
    expect(await FileService.isFile(filePath)).toBe(true);
    expect(await FileService.readFile(filePath)).toBe('some-content');
  });

  test('unlink', async () => {
    const filePath = path.resolve(__dirname, '.tmp/otherfile.txt');

    await FileService.writeFile(filePath, 'other-file');
    expect(await FileService.isFile(filePath)).toBe(true);

    await FileService.unlink(filePath);
    expect(await FileService.isFile(filePath)).toBe(false);
  });

  test('readdir', async () => {
    const searchPath = path.resolve(__dirname, 'sample');
    const files = await FileService.readdir(searchPath);
    expect(files.length).toBe(5);
  });

  test('mkdir', async () => {
    const dirPath = path.resolve(__dirname, '.tmp/subfolder/a/b/c');
    await FileService.rmdir(dirPath);
    expect(await FileService.isDirectory(dirPath)).toBe(false);

    await FileService.mkdir(dirPath);
    expect(await FileService.isDirectory(dirPath)).toBe(true);
  });

  test('rmdir', async () => {
    const dirPath = path.resolve(__dirname, '.tmp/subfolder/a/b/c');
    await FileService.rmdir(dirPath);
    expect(await FileService.isDirectory(dirPath)).toBe(false);

    await FileService.mkdir(dirPath);
    expect(await FileService.isDirectory(dirPath)).toBe(true);

    await FileService.rmdir(dirPath);
    expect(await FileService.isDirectory(dirPath)).toBe(false);
  });

  test('stat', async () => {
    const filePath = path.resolve(__dirname, 'sample/one.txt');
    const stat = await FileService.stat(filePath);
    expect(stat.isFile()).toBe(true);
  });

  test('copyFile', async () => {
    const sourcePath = path.resolve(__dirname, 'sample/one.txt');
    const targetPath = path.resolve(__dirname, '.tmp/one_copy.txt');

    await FileService.unlink(targetPath);
    expect(await FileService.isFile(targetPath)).toBe(false);

    await FileService.copyFile(sourcePath, targetPath);
    expect(await FileService.isFile(targetPath)).toBe(true);
  });

  test('copyDir', async () => {
    const sourcePath = path.resolve(__dirname, 'sample');
    const targetPath = path.resolve(__dirname, '.tmp/sample-copy');

    await FileService.rmdir(targetPath);
    expect(await FileService.isDirectory(targetPath)).toBe(false);

    await FileService.copyDir(sourcePath, targetPath);
    expect(await FileService.isDirectory(targetPath)).toBe(true);

    const filePath1 = path.resolve(__dirname, '.tmp/sample-copy/one.txt');
    expect(await FileService.readFile(filePath1)).toBe('one');

    const filePath2 = path.resolve(__dirname, '.tmp/sample-copy/two.txt');
    expect(await FileService.readFile(filePath2)).toBe('two');

    const filePath3 = path.resolve(__dirname, '.tmp/sample-copy/subfolder/three.txt');
    expect(await FileService.readFile(filePath3)).toBe('three');

    const filePath4 = path.resolve(__dirname, '.tmp/sample-copy/subfolder/subfolder/four.txt');
    expect(await FileService.readFile(filePath4)).toBe('four');
  });
});
