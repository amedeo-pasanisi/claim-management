
import {
  CountryRead,
  CountryWithProjectsContext,
  ProjectRead,
  ProjectWithCountryContractorsClaimsContext,
  ContractorRead,
  ContractorWithProjectsClaimsContext,
  ClaimRead,
  ClaimWithProjectContractorContextFiles,
  CreateCountryRequest,
  UpdateCountryRequest,
  CreateProjectRequest,
  UpdateProjectRequest,
  CreateContractorRequest,
  UpdateContractorRequest,
  CreateClaimRequest,
  UpdateClaimRequest,
  HTTPValidationError,
} from "@/types/api";

// Configuration
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

class ApiError extends Error {
  constructor(public status: number, message: string, public details?: any) {
    super(message);
    this.name = 'ApiError';
  }
}

// HTTP Client
class HttpClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    
    const response = await fetch(url, {
      ...options,
      headers: {
        ...options.headers,
      },
    });

    if (!response.ok) {
      let errorDetails;
      try {
        errorDetails = await response.json();
      } catch {
        errorDetails = null;
      }
      
      throw new ApiError(
        response.status,
        `HTTP ${response.status}: ${response.statusText}`,
        errorDetails
      );
    }

    // Handle empty responses (204, DELETE responses)
    if (response.status === 204 || response.headers.get('content-length') === '0') {
      return {} as T;
    }

    return response.json();
  }

  async get<T>(endpoint: string, params?: Record<string, any>): Promise<T> {
    const url = params ? `${endpoint}?${new URLSearchParams(params)}` : endpoint;
    return this.request<T>(url);
  }

  async post<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data,
    });
  }

  async patch<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: data,
    });
  }

  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'DELETE',
    });
  }
}

const httpClient = new HttpClient(API_BASE_URL);

// Helper function to create FormData for multipart requests
function createFormData(data: Record<string, any>): FormData {
  const formData = new FormData();
  
  Object.entries(data).forEach(([key, value]) => {
    if (value === undefined || value === null) return;
    
    if (Array.isArray(value)) {
      if (value[0] instanceof File) {
        // Handle file arrays
        value.forEach((file) => formData.append(key, file));
      } else {
        // Handle other arrays (like IDs)
        value.forEach((item) => formData.append(key, item.toString()));
      }
    } else if (value instanceof File) {
      formData.append(key, value);
    } else {
      formData.append(key, value.toString());
    }
  });
  
  return formData;
}

// API Services
export const countriesApi = {
  async getAll(offset = 0, limit = 100): Promise<CountryRead[]> {
    return httpClient.get<CountryRead[]>('/api/v1/countries/', { offset, limit });
  },

  async getById(id: string): Promise<CountryWithProjectsContext> {
    return httpClient.get<CountryWithProjectsContext>(`/api/v1/countries/${id}`);
  },

  async create(data: CreateCountryRequest): Promise<CountryRead> {
    const formData = createFormData({
      contextFiles: data.contextFiles || [],
    });
    
    const url = `/api/v1/countries/?name=${encodeURIComponent(data.name)}${data.flagUrl ? `&flagUrl=${encodeURIComponent(data.flagUrl)}` : ''}`;
    return httpClient.post<CountryRead>(url, formData);
  },

  async update(id: string, data: UpdateCountryRequest): Promise<CountryWithProjectsContext> {
    const formData = createFormData({
      contextFiles: data.contextFiles,
    });
    
    const params = new URLSearchParams();
    if (data.name) params.append('name', data.name);
    if (data.flagUrl) params.append('flagUrl', data.flagUrl);
    
    const url = `/api/v1/countries/${id}?${params.toString()}`;
    return httpClient.patch<CountryWithProjectsContext>(url, formData);
  },

  async delete(id: string): Promise<void> {
    return httpClient.delete<void>(`/api/v1/countries/${id}`);
  },
};

export const projectsApi = {
  async getAll(offset = 0, limit = 100): Promise<ProjectRead[]> {
    return httpClient.get<ProjectRead[]>('/api/v1/projects/', { offset, limit });
  },

  async getById(id: string): Promise<ProjectWithCountryContractorsClaimsContext> {
    return httpClient.get<ProjectWithCountryContractorsClaimsContext>(`/api/v1/projects/${id}`);
  },

  async create(data: CreateProjectRequest): Promise<ProjectWithCountryContractorsClaimsContext> {
    const formData = createFormData({
      contextFiles: data.contextFiles || [],
    });
    
    const url = `/api/v1/projects/?name=${encodeURIComponent(data.name)}&country_id=${data.country_id}`;
    return httpClient.post<ProjectWithCountryContractorsClaimsContext>(url, formData);
  },

  async update(id: string, data: UpdateProjectRequest): Promise<ProjectWithCountryContractorsClaimsContext> {
    const formData = createFormData({
      contractorsIds: data.contractorsIds,
      contextFiles: data.contextFiles,
    });
    
    const params = new URLSearchParams();
    if (data.name) params.append('name', data.name);
    if (data.countryId) params.append('countryId', data.countryId);
    
    const url = `/api/v1/projects/${id}?${params.toString()}`;
    return httpClient.patch<ProjectWithCountryContractorsClaimsContext>(url, formData);
  },

  async delete(id: string): Promise<void> {
    return httpClient.delete<void>(`/api/v1/projects/${id}`);
  },
};

export const contractorsApi = {
  async getAll(offset = 0, limit = 100): Promise<ContractorRead[]> {
    return httpClient.get<ContractorRead[]>('/api/v1/contractors/', { offset, limit });
  },

  async getById(id: string): Promise<ContractorWithProjectsClaimsContext> {
    return httpClient.get<ContractorWithProjectsClaimsContext>(`/api/v1/contractors/${id}`);
  },

  async create(data: CreateContractorRequest): Promise<ContractorWithProjectsClaimsContext> {
    const formData = createFormData({
      projectsIds: data.projectsIds || [],
      contextFiles: data.contextFiles || [],
    });
    
    const url = `/api/v1/contractors/?name=${encodeURIComponent(data.name)}`;
    return httpClient.post<ContractorWithProjectsClaimsContext>(url, formData);
  },

  async update(id: string, data: UpdateContractorRequest): Promise<ContractorWithProjectsClaimsContext> {
    const formData = createFormData({
      projectsIds: data.projectsIds,
      contextFiles: data.contextFiles,
    });
    
    const params = new URLSearchParams();
    if (data.name) params.append('name', data.name);
    
    const url = `/api/v1/contractors/${id}?${params.toString()}`;
    return httpClient.patch<ContractorWithProjectsClaimsContext>(url, formData);
  },

  async delete(id: string): Promise<void> {
    return httpClient.delete<void>(`/api/v1/contractors/${id}`);
  },
};

export const claimsApi = {
  async getAll(offset = 0, limit = 100): Promise<ClaimRead[]> {
    return httpClient.get<ClaimRead[]>('/api/v1/claims/', { offset, limit });
  },

  async getById(id: string): Promise<ClaimWithProjectContractorContextFiles> {
    return httpClient.get<ClaimWithProjectContractorContextFiles>(`/api/v1/claims/${id}`);
  },

  async create(data: CreateClaimRequest): Promise<ClaimWithProjectContractorContextFiles> {
    const formData = createFormData({
      claimFile: data.claimFile,
      contextFiles: data.contextFiles || [],
    });
    
    const url = `/api/v1/claims/?name=${encodeURIComponent(data.name)}&contractorId=${data.contractorId}&projectId=${data.projectId}`;
    return httpClient.post<ClaimWithProjectContractorContextFiles>(url, formData);
  },

  async update(id: string, data: UpdateClaimRequest): Promise<ClaimWithProjectContractorContextFiles> {
    const formData = createFormData({
      claimFile: data.claimFile,
      contextFiles: data.contextFiles,
    });
    
    const params = new URLSearchParams();
    if (data.name) params.append('name', data.name);
    if (data.contractorId) params.append('contractorId', data.contractorId);
    if (data.projectId) params.append('projectId', data.projectId);
    
    const url = `/api/v1/claims/${id}?${params.toString()}`;
    return httpClient.patch<ClaimWithProjectContractorContextFiles>(url, formData);
  },

  async delete(id: string): Promise<void> {
    return httpClient.delete<void>(`/api/v1/claims/${id}`);
  },
};

export { ApiError };
