import path from 'path';
import { BusinessError } from '../../../common/errors';
import { Toolbox } from '../../../core/models';
import { FileService } from '../../../core/utils';
import { ProjectInfo, SettingData } from './types';
import gitDiff from 'git-diff';

export class AppModule {
  projectPath: string;
  workspacePath: string;
  settingFilePath: string;
  environmentsDirPath: string;

  constructor(toolbox: Toolbox) {
    this.projectPath = toolbox.rootPath;
    this.workspacePath = path.resolve(toolbox.rootPath, '.zconfig');
    this.settingFilePath = path.resolve(this.workspacePath, 'config.json');
    this.environmentsDirPath = path.resolve(this.workspacePath, 'environments');
  }

  async isInitialized(): Promise<boolean> {
    return await FileService.isDirectory(this.workspacePath);
  }

  async init(projectInfo: ProjectInfo) {
    await FileService.mkdir(this.workspacePath);
    const settingData: SettingData = {
      version: '1',
      project: {
        name: projectInfo.name,
        env: null,
      },
      environments: {},
    };
    await FileService.mkdir(this.environmentsDirPath);
    await this.updateSetting(settingData);
  }

  async getProjectInfo(): Promise<ProjectInfo> {
    const defaultInfo: ProjectInfo = {
      name: '<no disponible>',
      version: '0.0.0',
    };
    try {
      const packageJsonPath = path.resolve(this.projectPath, 'package.json');
      const packageJson = await import(packageJsonPath);
      return {
        name: packageJson.name,
        version: packageJson.version,
      };
    } catch (e) {
      return defaultInfo;
    }
  }

  async getSetting(): Promise<SettingData> {
    const defaultSetting: SettingData = {
      version: '1',
      project: {
        name: '<no disponible>',
        env: null,
      },
      environments: {},
    };
    try {
      const settingData = await FileService.readFile(this.settingFilePath);
      return JSON.parse(settingData);
    } catch (e) {
      return defaultSetting;
    }
  }

  async getCurrentEnv(): Promise<string | null> {
    const settingData = await this.getSetting();
    return settingData.project.env;
  }

  async getFileStatus(): Promise<{ deleted: string[]; modified: string[]; files: string[] }> {
    const currentFiles = [];
    const deletedFiles = [];
    const modifiedFiles = [];
    const settingData = await this.getSetting();
    const currentEnv = settingData.project.env;

    if (!currentEnv) {
      return { modified: [], deleted: [], files: [] };
    }

    for (const file of settingData.environments[currentEnv]) {
      const workspaceFile = path.resolve(this.environmentsDirPath, currentEnv, file);
      const projectFile = path.resolve(this.projectPath, file);

      if (!(await FileService.isFile(workspaceFile))) {
        continue;
      }

      if (!(await FileService.isFile(projectFile))) {
        deletedFiles.push(file);
        continue;
      }

      const workspaceFileContent = (await FileService.isFile(workspaceFile))
        ? await FileService.readFile(workspaceFile)
        : '';
      const projectFileContent = await FileService.readFile(projectFile);

      if (workspaceFileContent !== projectFileContent) {
        modifiedFiles.push(file);
        continue;
      }

      currentFiles.push(file);
    }

    return { deleted: deletedFiles, modified: modifiedFiles, files: currentFiles };
  }

  async createAndSwitchEnv(env: string) {
    const settingData = await this.getSetting();
    if (settingData.environments[env]) {
      throw new BusinessError(`Ya existe el entorno ${env}`);
    }

    const currentEnv = settingData.project.env;
    const newEnvironmentPath = path.resolve(this.environmentsDirPath, env);
    if (!currentEnv) {
      await FileService.mkdir(newEnvironmentPath);
      settingData.environments[env] = [];
    }
    if (currentEnv) {
      const source = path.resolve(this.environmentsDirPath, currentEnv);
      const target = newEnvironmentPath;
      await FileService.copyDir(source, target);
      settingData.environments[env] = [...settingData.environments[currentEnv]];
    }

    await this.updateSetting(settingData);

    await this.switchEnv(env);
  }

  async switchEnv(env: string) {
    const settingData = await this.getSetting();
    if (!settingData.environments[env]) {
      throw new BusinessError(`No existe el entorno ${env}`);
    }

    const { modified, deleted } = await this.getFileStatus();
    if (modified.length > 0 || deleted.length > 0) {
      throw new BusinessError('No se puede cambiar de entorno porque el espacio de trabajo no se encuentra limpio.');
    }

    const source = path.resolve(this.environmentsDirPath, env);
    const target = path.resolve(this.projectPath);
    await FileService.copyDir(source, target);

    settingData.project.env = env;
    await this.updateSetting(settingData);
  }

  async registerFile(filepath: string): Promise<void> {
    const settingData = await this.getSetting();
    const currentEnv = settingData.project.env;

    if (!currentEnv) {
      throw new BusinessError(`No se encontraron entornos sobre el cual adicionar el archivo`);
    }

    const source = path.resolve(this.projectPath, filepath);
    const target = path.resolve(this.environmentsDirPath, currentEnv, filepath);

    const existSource = await FileService.isFile(source);
    if (existSource) {
      await FileService.mkdir(path.dirname(target));
      await FileService.copyFile(source, target);

      if (!settingData.environments[currentEnv].includes(filepath)) {
        settingData.environments[currentEnv].push(filepath);
        await this.updateSetting(settingData);
      }
      return;
    }

    if (!existSource && settingData.environments[currentEnv].includes(filepath)) {
      const target = path.resolve(this.environmentsDirPath, currentEnv, filepath);
      await FileService.unlink(target);
      settingData.environments[currentEnv] = settingData.environments[currentEnv].filter((x) => x !== filepath);
      await this.updateSetting(settingData);
      return;
    }

    throw new BusinessError(`El archivo "${filepath}" no existe`);
  }

  async diff(env?: string): Promise<void> {
    const settingData = await this.getSetting();
    const currentEnv = settingData.project.env;

    if (!currentEnv) {
      throw new BusinessError(`El entorno actual aún no ha sido definido`);
    }

    if (env && !settingData.environments[env]) {
      throw new BusinessError(`No se encontró el entorno "${env}"`);
    }

    if (!env) {
      for (const file of settingData.environments[currentEnv]) {
        const existFile = await FileService.isFile(path.resolve(this.projectPath, file));
        if (existFile) {
          const oldPath = path.resolve(this.environmentsDirPath, currentEnv, file);
          const newPath = path.resolve(this.projectPath, file);
          const oldStr = await FileService.readFile(oldPath);
          const newStr = await FileService.readFile(newPath);
          const diff = this._diff(oldStr, newStr);

          if (diff) {
            process.stdout.write('\n');
            process.stdout.write(`--- a${oldPath.replace(this.environmentsDirPath, '')}`);
            process.stdout.write('\n');
            process.stdout.write(`+++ b${newPath.replace(this.projectPath, '')}`);
            process.stdout.write('\n');
            process.stdout.write(diff || '');
            process.stdout.write('\n');
          }
        }
      }
      return;
    }

    for (const file of settingData.environments[env]) {
      const existFile = await FileService.isFile(path.resolve(this.projectPath, file));
      if (existFile) {
        const oldPath = path.resolve(this.environmentsDirPath, env, file);
        const newPath = path.resolve(this.projectPath, file);
        const oldStr = await FileService.readFile(oldPath);
        const newStr = await FileService.readFile(newPath);
        const diff = this._diff(oldStr, newStr);

        if (diff) {
          process.stdout.write('\n');
          process.stdout.write(`--- a${oldPath.replace(this.environmentsDirPath, '')}`);
          process.stdout.write('\n');
          process.stdout.write(`+++ b${newPath.replace(this.projectPath, '')}`);
          process.stdout.write('\n');
          process.stdout.write(diff || '');
          process.stdout.write('\n');
        }
      }
      if (!settingData.environments[currentEnv].includes(file)) {
        const oldPath = path.resolve(this.environmentsDirPath, env, file);
        const newPath = '/dev/null';
        const oldStr = await FileService.readFile(oldPath);
        const newStr = await FileService.readFile(newPath);
        const diff = this._diff(oldStr, newStr);

        if (diff) {
          process.stdout.write('\n');
          process.stdout.write(`--- a${oldPath.replace(this.environmentsDirPath, '')}`);
          process.stdout.write('\n');
          process.stdout.write(`+++ b${newPath.replace(this.projectPath, '')}`);
          process.stdout.write('\n');
          process.stdout.write(diff || '');
          process.stdout.write('\n');
        }
      }
    }
  }

  async printEnvironments(): Promise<void> {
    const settingData = await this.getSetting();
    const currentEnv = settingData.project.env;

    for (const env of Object.keys(settingData.environments)) {
      if (env === currentEnv) {
        process.stdout.write(`\x1b[32m* ${env}\x1b[0m\n`);
      } else {
        process.stdout.write(`  ${env}\n`);
      }
    }

    process.stdout.write('\n');
  }

  private async updateSetting(settingData: SettingData): Promise<void> {
    await FileService.writeFile(this.settingFilePath, JSON.stringify(settingData, null, 2) + '\n');
  }

  private _diff(oldStr: string, newStr: string) {
    const options: gitDiff.GitDiffOptions = {
      color: true,
      flags: null,
      forceFake: false,
      noHeaders: false,
      save: false,
      wordDiff: false,
    };

    return gitDiff(oldStr.replace(/`/g, "'"), newStr.replace(/`/g, "'"), options);
  }

  async resetEnv(env: string, hard = false) {
    const settingData = await this.getSetting();
    const currentEnv = settingData.project.env;

    if (currentEnv !== env) {
      throw new BusinessError(`El entorno a restaurar es diferente al entorno actual`);
    }

    if (env && !settingData.environments[env]) {
      throw new BusinessError(`No se encontró el entorno "${env}"`);
    }

    const { modified, deleted } = await this.getFileStatus();
    if (modified.length > 0 || deleted.length > 0) {
      if (!hard) {
        throw new BusinessError(
          'No se puede restaurar de entorno porque el actual espacio de trabajo no se encuentra limpio.',
        );
      }
    }

    const source = path.resolve(this.environmentsDirPath, env);
    const target = this.projectPath;
    await FileService.copyDir(source, target);
  }

  async removeEnv(env: string) {
    const settingData = await this.getSetting();

    if (!settingData.environments[env]) {
      throw new BusinessError(`Entorno ${env} no registrado`);
    }

    delete settingData.environments[env];
    const envPath = path.resolve(this.environmentsDirPath, env);
    await FileService.rmdir(envPath);

    if (settingData.project.env === env) {
      settingData.project.env = null;
    }

    await this.updateSetting(settingData);
  }
}
