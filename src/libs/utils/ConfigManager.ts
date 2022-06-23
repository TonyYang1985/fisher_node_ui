import fs from 'fs';
import { loadConfig } from './YamlUtil';

export type ConfigMap = { [key: string]: unknown };

export class ConfigManager {
  private _config: ConfigMap = {};

  static readonly nodeEnv = process.env.NODE_ENV;

  private static instance = new ConfigManager();

  private constructor() {
    //
  }

  get config(): ConfigMap {
    return this._config;
  }

  static isDevelopment(): boolean {
    return ConfigManager.nodeEnv === 'development';
  }

  static isProduction(): boolean {
    return ConfigManager.nodeEnv === 'production';
  }

  load(...files: string[]): void {
    files.forEach((f) => {
      if (!this._config[f]) {
        this._config[f] = loadConfig(f);
      }
    });
  }

  createConfig<T>(file: string): T {
    const cfg = this._config[file];
    return cfg as T;
  }

  static getInstance(): ConfigManager {
    return ConfigManager.instance;
  }

  static getConfig<T>(configFile: string): T {
    const cfgmgr = ConfigManager.getInstance();
    cfgmgr.load(configFile);
    return cfgmgr.createConfig<T>(configFile);
  }

  static getPkgVersion() {
    const appDir = process.cwd();
    const pkg = JSON.parse(fs.readFileSync(`${appDir}/package.json`, 'utf8').toString());
    const pkgVersion = pkg.version;
    return pkgVersion;
  }

  static getModuleName() {
    const appDir = process.cwd();
    const pkg = JSON.parse(fs.readFileSync(`${appDir}/package.json`, 'utf8').toString());
    const moduleName = pkg.name.substr(5);
    return moduleName;
  }

  static getBuildNumber() {
    const appDir = process.cwd();
    const pkg = JSON.parse(fs.readFileSync(`${appDir}/package.json`, 'utf8').toString());
    const buildNumber = pkg.buildNumber;
    return buildNumber;
  }
}
