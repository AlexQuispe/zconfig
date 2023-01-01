import { Toolbox } from '../models';

export type CliInfo = {
  name: string;
  version: string;
  message: string;
};

export type CommandParams = {
  name: string;
  args: string;
  description: string;
  options: Option[];
  toolbox: Toolbox;
};

export type Option = {
  flags: string;
  description: string;
  defaultValue?: string;
  required?: boolean;
};
