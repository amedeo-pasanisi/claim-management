
// API Request/Response types based on OpenAPI schema
export interface CountryRead {
  id: string;
  name: string;
  flagUrl?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CountryWithProjectsContext extends CountryRead {
  projects: ProjectRead[];
  contextFiles: ContextFileRead[];
}

export interface ProjectRead {
  id: string;
  name: string;
  countryId: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProjectWithCountryContractorsClaimsContext extends ProjectRead {
  country: CountryRead;
  contractors: ContractorRead[];
  claims: ClaimRead[];
  contextFiles: ContextFileRead[];
}

export interface ContractorRead {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

export interface ContractorWithProjectsClaimsContext extends ContractorRead {
  projects: ProjectRead[];
  claims: ClaimRead[];
  contextFiles: ContextFileRead[];
}

export interface ClaimRead {
  id: string;
  name: string;
  contractorId: string;
  projectId: string;
  createdAt: string;
  updatedAt: string;
}

export interface ClaimWithProjectContractorContext extends ClaimRead {
  project: ProjectRead;
  contractor: ContractorRead;
  contextFiles: ContextFileRead[];
}

export interface ContextFileRead {
  id: string;
  path: string;
  created_at: string;
}

export interface HTTPValidationError {
  detail?: ValidationError[];
}

export interface ValidationError {
  loc: (string | number)[];
  msg: string;
  type: string;
}

// Create request types
export interface CreateCountryRequest {
  name: string;
  flagUrl?: string;
  contextFiles?: File[];
}

export interface UpdateCountryRequest {
  name?: string;
  flagUrl?: string;
  contextFiles?: File[];
}

export interface CreateProjectRequest {
  name: string;
  country_id: string;
  contractors_ids?: string[];
  contextFiles?: File[];
}

export interface UpdateProjectRequest {
  name?: string;
  countryId?: string;
  contractorsIds?: string[];
  contextFiles?: File[];
}

export interface CreateContractorRequest {
  name: string;
  projectsIds?: string[];
  contextFiles?: File[];
}

export interface UpdateContractorRequest {
  name?: string;
  projectsIds?: string[];
  contextFiles?: File[];
}

export interface CreateClaimRequest {
  name: string;
  contractorId: string;
  projectId: string;
  contextFiles?: File[];
}

export interface UpdateClaimRequest {
  name?: string;
  contractorId?: string;
  projectId?: string;
  contextFiles?: File[];
}
