
export type Project = {
  id: string;
  title: string; // Keep frontend field name but map to API 'name'
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
  title: string; // Keep frontend field name but map to API 'name'
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
  code: string; // Keep for frontend compatibility
  flag: string; // Keep for frontend compatibility, maps to flagUrl
  createdAt: string;
  contextFiles: File[];
};

export type Context = {
  id: string;
  type: "project" | "contractor" | "claim" | "country";
  parentId: string;
  files: File[];
};

// Helper function to convert API types to frontend types
export function mapApiCountryToFrontend(apiCountry: any): Country {
  return {
    id: apiCountry.id,
    name: apiCountry.name,
    code: apiCountry.name.substring(0, 2).toUpperCase(), // Generate code from name
    flag: apiCountry.flagUrl || '',
    createdAt: apiCountry.createdAt,
    contextFiles: [], // Will be populated separately
  };
}

export function mapApiProjectToFrontend(apiProject: any): Project {
  return {
    id: apiProject.id,
    title: apiProject.name,
    countryId: apiProject.countryId,
    createdAt: apiProject.createdAt,
    contextFiles: [], // Will be populated separately
  };
}

export function mapApiContractorToFrontend(apiContractor: any): Contractor {
  return {
    id: apiContractor.id,
    name: apiContractor.name,
    createdAt: apiContractor.createdAt,
    projectIds: apiContractor.projects?.map((p: any) => p.id) || [],
    contextFiles: [], // Will be populated separately
  };
}

export function mapApiClaimToFrontend(apiClaim: any): Claim {
  return {
    id: apiClaim.id,
    title: apiClaim.name,
    createdAt: apiClaim.createdAt,
    contractorId: apiClaim.contractorId,
    projectId: apiClaim.projectId,
    claimFile: new File([], 'claim.pdf'), // Placeholder since API doesn't have claimFile
    contextFiles: [], // Will be populated separately
    includedProjectContext: false,
    includedContractorContext: false,
  };
}
