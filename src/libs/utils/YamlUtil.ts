import fs from 'fs';
import yaml from 'js-yaml';
import _ from 'lodash';

export const loadYaml = (path: string): any => yaml.load(fs.readFileSync(path, 'utf8'));

export const loadConfig = (name: string): any => {
  const devZone = process.env.DEV_ZONE;
  const configFile = _.isEmpty(devZone) ? `./cfg/${name}.yml` : `./cfg/${name}.${devZone}.yml`;
  let cfg = {};

  if (fs.existsSync(configFile)) {
    cfg = _.assign(cfg, loadYaml(configFile));
  }

  return cfg;
};
