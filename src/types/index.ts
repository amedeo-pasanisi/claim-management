import {
  CountryRead,
  ProjectRead,
  ContractorRead,
  ClaimRead,
  CountryWithProjectsContext,
  ProjectWithCountryContractorsClaimsContext,
  ContractorWithProjectsClaimsContext,
  ClaimWithProjectContractorContextFiles,
} from "@/types/api";

export interface Country {
  id: string;
  name: string;
  flag: string | null;
  contextFiles: File[];
  createdAt: string;
}

export interface Project {
  id: string;
  title: string;
  countryId: string;
  contextFiles: File[];
  createdAt: string;
}

export interface Contractor {
  id: string;
  name: string;
  projectIds: string[];
  contextFiles: File[];
  createdAt: string;
}

export interface Claim {
  id: string;
  title: string;
  contractorId: string;
  projectId: string;
  claimFile?: File;
  contextFiles: File[];
  createdAt: string;
}

export const mapApiCountryToFrontend = (apiCountry: CountryRead | CountryWithProjectsContext): Country => {
  return {
    id: apiCountry.id,
    name: apiCountry.name,
    flag: apiCountry.flagUrl || null,
    contextFiles: [], // File objects can't be retrieved from API
    createdAt: apiCountry.createdAt,
  };
};

export const mapApiProjectToFrontend = (apiProject: ProjectRead | ProjectWithCountryContractorsClaimsContext): Project => {
  return {
    id: apiProject.id,
    title: apiProject.name,
    countryId: apiProject.countryId,
    contextFiles: [], // File objects can't be retrieved from API
    createdAt: apiProject.createdAt,
  };
};

export const mapApiContractorToFrontend = (apiContractor: ContractorRead | ContractorWithProjectsClaimsContext): Contractor => {
  return {
    id: apiContractor.id,
    name: apiContractor.name,
    projectIds: [], // Assuming projectIds are not directly available here
    contextFiles: [], // File objects can't be retrieved from API
    createdAt: apiContractor.createdAt,
  };
};

// Update the mapApiClaimToFrontend function
export const mapApiClaimToFrontend = (apiClaim: ClaimRead | ClaimWithProjectContractorContextFiles): Claim => {
  return {
    id: apiClaim.id,
    title: apiClaim.name,
    contractorId: apiClaim.contractorId,
    projectId: apiClaim.projectId,
    contextFiles: [], // File objects can't be retrieved from API
    createdAt: apiClaim.createdAt,
  };
};
