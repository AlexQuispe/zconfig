export type ProjectInfo = {
  name: string;
  version: string;
};

export type SettingData = {
  version: string;
  project: ProjectSettingData;
  environments: { [key: string]: string[] };
};

export type ProjectSettingData = {
  name: string;
  env: string | null;
};
