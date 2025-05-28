export type Project = {
  id: string;
  title: string;
  countryId: string;
  createdAt: string;
  contextFiles: File[];
};

export type Contractor = {
  id: string;
  name: string;
  createdAt: string;
  projectIds: string[];
  contextFiles: File[];
};

export type Claim = {
  id: string;
  title: string;
  createdAt: string;
  contractorId: string;
  projectId: string;
  claimFile: File;
  contextFiles: File[];
  includedProjectContext: boolean;
  includedContractorContext: boolean;
};

export type Country = {
  id: string;
  name: string;
  code: string;
  flag: string;
  createdAt: string;
  contextFiles: File[];
};

export type Context = {
  id: string;
  type: "project" | "contractor" | "claim" | "country";
  parentId: string;
  files: File[];
};
