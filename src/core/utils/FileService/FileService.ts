import path from 'path';
import fs from 'fs';
import mkdirp from 'mkdirp';
import glob from 'glob';

export type FileInfo = {
  filePath: string;
  dirPath: string;
  fileName: string;
  dirName: string;
  fileExt: string;
};

export class FileService {
  /**
   * Devuelve una lista que contiene información de los archivos encontrados.
   * Adicionalmente puede ejecutar una función (async onFind) cuando encuentra un archivo.
   * @param {String}        pattern           - Expresión regular de los archivos a buscar.
   * @param {Object}        options           - Opciones de búsqueda.
   * @param {AsyncFunction} onFind            - Función asíncrona que se ejecuta cuando
   *                                            encuentra el archivo.
   * @return {Promise}
   */
  static find = async (
    pattern: string,
    options: glob.IOptions,
    onFind?: (fileInfo: FileInfo) => Promise<void>,
  ): Promise<FileInfo[]> => {
    const result: FileInfo[] = [];
    const files: string[] = await new Promise((resolve, reject) => {
      glob(pattern, options, (err, files) => {
        if (err) return reject(err);
        resolve(files);
      });
    });
    for (const file of files) {
      const filePath = path.resolve(file);
      const dirPath = path.dirname(filePath);
      const fileExt = path.extname(filePath);
      const fileName = filePath.split(path.sep).pop()?.replace(fileExt, '') || '';
      const dirName = dirPath.split(path.sep).pop() || '';
      const fileInfo: FileInfo = { filePath, dirPath, fileName, dirName, fileExt };
      if (onFind) {
        await onFind(fileInfo);
      }
      result.push(fileInfo);
    }
    return result;
  };

  /**
   * Indica si la ruta corresponde a un archivo.
   * @param {String} filePath - Ruta del archivo.
   * @return {String} contenido del archivo, cadena vacía si no existe.
   */
  static isFile = async (filePath: string): Promise<boolean> => {
    try {
      const stats: fs.Stats = await new Promise((resolve, reject) => {
        return fs.stat(filePath, (err, stats) => (err ? reject(err) : resolve(stats)));
      });
      return stats.isFile();
    } catch (e) {
      return false;
    }
  };

  /**
   * Indica si la ruta corresponde a un directorio.
   * @param {String} dirPath - Ruta del directorio
   * @return {Boolean}
   */
  static isDirectory = async (fdirPath: string): Promise<boolean> => {
    try {
      const stats: fs.Stats = await new Promise((resolve, reject) => {
        return fs.stat(fdirPath, (err, stats) => (err ? reject(err) : resolve(stats)));
      });
      return stats.isDirectory();
    } catch (e) {
      return false;
    }
  };

  /**
   * Devuelve el contenido de un archivo de texto.
   * @param {String} filePath - Ruta del archivo.
   * @return {String} contenido del archivo.
   */
  static readFile = async (filePath: string, encoding: BufferEncoding = 'utf-8'): Promise<string> => {
    return new Promise((resolve, reject) => {
      fs.readFile(filePath, { encoding }, (err, data) => (err ? reject(err) : resolve(data)));
    });
  };

  /**
   * Crea un archivo.
   * @param {String} filePath - Ruta del archivo.
   * @param {String} content  - Contenido del archivo.
   */
  static writeFile = async (filePath: string, content: string | Buffer): Promise<void> => {
    await mkdirp(path.dirname(filePath));
    await new Promise((resolve, reject) => fs.writeFile(filePath, content, (err) => (err ? reject(err) : resolve(1))));
  };

  /**
   * Elimina un archivo.
   * @param {String} filePath - Ruta del archivo.
   */
  static unlink = async (filePath: string): Promise<void> => {
    if (await FileService.isFile(filePath)) {
      await new Promise((resolve, reject) => fs.unlink(filePath, (err) => (err ? reject(err) : resolve(1))));
    }
  };

  /**
   * Devuelve una lista de archivos dentro de un directorio.
   * @param {String} dirPath - Ruta del directorio.
   */
  static readdir = async (dirPath: string): Promise<string[]> => {
    return new Promise((resolve, reject) => fs.readdir(dirPath, (err, files) => (err ? reject(err) : resolve(files))));
  };

  /**
   * Crea un directorio de manera recursiva
   * @param {String} dirPath - Ruta del directorio.
   */
  static mkdir = async (dirPath: string): Promise<void> => {
    await mkdirp(dirPath);
  };

  /**
   * Elimina un directorio recursivamente.
   * @param {String} dirPath - Ruta del directorio
   */
  static rmdir = async (dirPath: string) => {
    async function _rmdir(dirPath: string) {
      if (await FileService.isDirectory(dirPath)) {
        const files = await FileService.readdir(dirPath);
        for (const fileName of files) {
          const filePath = path.resolve(dirPath, fileName);
          if (await FileService.isDirectory(filePath)) {
            await _rmdir(filePath);
          } else {
            await FileService.unlink(filePath);
          }
        }
        await new Promise((resolve) => fs.rmdir(dirPath, () => resolve(1)));
      } else {
        await FileService.unlink(dirPath);
      }
    }
    await _rmdir(dirPath);
  };

  /**
   * Devuelve metadatos del archivo o directorio
   * @param {String} filePath - Ruta del archivo o directorio.
   */
  static stat = async (filePath: string): Promise<fs.Stats> => {
    const stats: fs.Stats = await new Promise((resolve, reject) =>
      fs.stat(filePath, (err, stats) => (err ? reject(err) : resolve(stats))),
    );
    return stats;
  };

  /**
   * Copia archivos
   * @param {String} source Ruta del archivo origen
   * @param {String} target Ruta del archivo destino
   */
  static copyFile = async (source: string, target: string): Promise<void> => {
    return new Promise((resolve, reject) => fs.copyFile(source, target, (err) => (err ? reject(err) : resolve())));
  };

  /**
   * Copia un directorio.
   * @param {String} source - Ruta de origen.
   * @param {String} target - Ruta de destino.
   */
  static copyDir = async (source: string, target: string): Promise<void> => {
    async function _copy(sourcePath: string, targetPath: string) {
      if ((await FileService.stat(sourcePath)).isDirectory()) {
        await FileService.mkdir(targetPath);
        const files = await FileService.readdir(sourcePath);
        for (const fileName of files) {
          await _copy(path.resolve(sourcePath, fileName), path.resolve(targetPath, fileName));
        }
      } else {
        await FileService.copyFile(sourcePath, targetPath);
      }
    }
    await _copy(source, target);
  };
}
