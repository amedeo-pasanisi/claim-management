import { createContext, useContext, useState, useEffect } from "react";
import { Project, Contractor, Claim, Country, mapApiCountryToFrontend, mapApiProjectToFrontend, mapApiContractorToFrontend, mapApiClaimToFrontend } from "@/types";
import { useToast } from "@/hooks/use-toast";
import { countriesApi, projectsApi, contractorsApi, claimsApi, ApiError } from "@/lib/api";

type AppContextType = {
  projects: Project[];
  contractors: Contractor[];
  claims: Claim[];
  countries: Country[];
  loading: boolean;
  error: string | null;
  addProject: (project: Omit<Project, "id" | "createdAt">) => Promise<void>;
  updateProject: (project: Project) => Promise<void>;
  deleteProject: (id: string) => Promise<void>;
  addContractor: (contractor: Omit<Contractor, "id" | "createdAt">) => Promise<void>;
  updateContractor: (contractor: Contractor) => Promise<void>;
  deleteContractor: (id: string) => Promise<void>;
  addClaim: (claim: Omit<Claim, "id" | "createdAt">) => Promise<void>;
  updateClaim: (claim: Claim) => Promise<void>;
  deleteClaim: (id: string) => Promise<void>;
  addCountry: (country: Omit<Country, "id" | "createdAt">) => Promise<void>;
  updateCountry: (country: Country) => Promise<void>;
  deleteCountry: (id: string) => Promise<void>;
  getProjectById: (id: string) => Project | undefined;
  getContractorById: (id: string) => Contractor | undefined;
  getClaimById: (id: string) => Claim | undefined;
  getCountryById: (id: string) => Country | undefined;
  getContractorsByProjectId: (projectId: string) => Contractor[];
  getProjectsByContractorId: (contractorId: string) => Project[];
  getClaimsByProjectId: (projectId: string) => Claim[];
  getClaimsByContractorId: (contractorId: string) => Claim[];
  refreshData: () => Promise<void>;
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider = ({ children }: { children: React.ReactNode }) => {
  const { toast } = useToast();
  const [projects, setProjects] = useState<Project[]>([]);
  const [contractors, setContractors] = useState<Contractor[]>([]);
  const [claims, setClaims] = useState<Claim[]>([]);
  const [countries, setCountries] = useState<Country[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Handle API errors
  const handleApiError = (error: any, operation: string) => {
    console.error(`${operation} failed:`, error);
    let message = `Failed to ${operation}`;
    
    if (error instanceof ApiError) {
      message = `${operation} failed: ${error.message}`;
      if (error.details?.detail) {
        const validationErrors = error.details.detail.map((e: any) => e.msg).join(', ');
        message += ` (${validationErrors})`;
      }
    } else if (error instanceof Error) {
      message = `${operation} failed: ${error.message}`;
    }
    
    setError(message);
    toast({
      title: "Error",
      description: message,
      variant: "destructive",
    });
  };

  // Load all data from API
  const loadData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const [countriesData, projectsData, contractorsData, claimsData] = await Promise.all([
        countriesApi.getAll().catch(e => { console.warn('Failed to load countries:', e); return []; }),
        projectsApi.getAll().catch(e => { console.warn('Failed to load projects:', e); return []; }),
        contractorsApi.getAll().catch(e => { console.warn('Failed to load contractors:', e); return []; }),
        claimsApi.getAll().catch(e => { console.warn('Failed to load claims:', e); return []; }),
      ]);

      setCountries(countriesData.map(mapApiCountryToFrontend));
      setProjects(projectsData.map(mapApiProjectToFrontend));
      setContractors(contractorsData.map(mapApiContractorToFrontend));
      setClaims(claimsData.map(mapApiClaimToFrontend));
    } catch (error) {
      handleApiError(error, 'load data');
    } finally {
      setLoading(false);
    }
  };

  // Load data on mount
  useEffect(() => {
    loadData();
  }, []);

  const refreshData = async () => {
    await loadData();
  };

  // Project functions
  const addProject = async (project: Omit<Project, "id" | "createdAt">) => {
    try {
      const apiProject = await projectsApi.create({
        name: project.title,
        country_id: project.countryId,
        contextFiles: project.contextFiles,
      });
      
      const newProject = mapApiProjectToFrontend(apiProject);
      setProjects((prev) => [...prev, newProject]);
      
      toast({
        title: "Project created",
        description: `${newProject.title} has been created successfully.`,
      });
    } catch (error) {
      handleApiError(error, 'create project');
    }
  };

  const updateProject = async (project: Project) => {
    try {
      const apiProject = await projectsApi.update(project.id, {
        name: project.title,
        countryId: project.countryId,
        contextFiles: project.contextFiles,
      });
      
      const updatedProject = mapApiProjectToFrontend(apiProject);
      setProjects((prev) =>
        prev.map((p) => (p.id === project.id ? updatedProject : p))
      );
      
      toast({
        title: "Project updated",
        description: `${updatedProject.title} has been updated successfully.`,
      });
    } catch (error) {
      handleApiError(error, 'update project');
    }
  };

  const deleteProject = async (id: string) => {
    const projectToDelete = projects.find((p) => p.id === id);
    if (!projectToDelete) return;

    try {
      await projectsApi.delete(id);
      setProjects((prev) => prev.filter((p) => p.id !== id));
      
      // Remove associated relationships
      setContractors((prev) =>
        prev.map((contractor) => ({
          ...contractor,
          projectIds: contractor.projectIds.filter((pid) => pid !== id),
        }))
      );
      
      setClaims((prev) => prev.filter((c) => c.projectId !== id));
      
      toast({
        title: "Project deleted",
        description: `${projectToDelete.title} has been deleted successfully.`,
      });
    } catch (error) {
      handleApiError(error, 'delete project');
    }
  };

  // Contractor functions
  const addContractor = async (contractor: Omit<Contractor, "id" | "createdAt">) => {
    try {
      const apiContractor = await contractorsApi.create({
        name: contractor.name,
        projectsIds: contractor.projectIds,
        contextFiles: contractor.contextFiles,
      });
      
      const newContractor = mapApiContractorToFrontend(apiContractor);
      setContractors((prev) => [...prev, newContractor]);
      
      toast({
        title: "Contractor created",
        description: `${newContractor.name} has been created successfully.`,
      });
    } catch (error) {
      handleApiError(error, 'create contractor');
    }
  };

  const updateContractor = async (contractor: Contractor) => {
    try {
      const apiContractor = await contractorsApi.update(contractor.id, {
        name: contractor.name,
        projectsIds: contractor.projectIds,
        contextFiles: contractor.contextFiles,
      });
      
      const updatedContractor = mapApiContractorToFrontend(apiContractor);
      setContractors((prev) =>
        prev.map((c) => (c.id === contractor.id ? updatedContractor : c))
      );
      
      toast({
        title: "Contractor updated",
        description: `${updatedContractor.name} has been updated successfully.`,
      });
    } catch (error) {
      handleApiError(error, 'update contractor');
    }
  };

  const deleteContractor = async (id: string) => {
    const contractorToDelete = contractors.find((c) => c.id === id);
    if (!contractorToDelete) return;

    try {
      await contractorsApi.delete(id);
      setContractors((prev) => prev.filter((c) => c.id !== id));
      setClaims((prev) => prev.filter((c) => c.contractorId !== id));
      
      toast({
        title: "Contractor deleted",
        description: `${contractorToDelete.name} has been deleted successfully.`,
      });
    } catch (error) {
      handleApiError(error, 'delete contractor');
    }
  };

  // Claim functions
  const addClaim = async (claim: Omit<Claim, "id" | "createdAt">) => {
    try {
      const apiClaim = await claimsApi.create({
        name: claim.title,
        contractorId: claim.contractorId,
        projectId: claim.projectId,
        contextFiles: claim.contextFiles,
      });
      
      const newClaim = mapApiClaimToFrontend(apiClaim);
      setClaims((prev) => [...prev, newClaim]);
      
      toast({
        title: "Claim created",
        description: `${newClaim.title} has been created successfully.`,
      });
    } catch (error) {
      handleApiError(error, 'create claim');
    }
  };

  const updateClaim = async (claim: Claim) => {
    try {
      const apiClaim = await claimsApi.update(claim.id, {
        name: claim.title,
        contractorId: claim.contractorId,
        projectId: claim.projectId,
        contextFiles: claim.contextFiles,
      });
      
      const updatedClaim = mapApiClaimToFrontend(apiClaim);
      setClaims((prev) => prev.map((c) => (c.id === claim.id ? updatedClaim : c)));
      
      toast({
        title: "Claim updated",
        description: `${updatedClaim.title} has been updated successfully.`,
      });
    } catch (error) {
      handleApiError(error, 'update claim');
    }
  };

  const deleteClaim = async (id: string) => {
    const claimToDelete = claims.find((c) => c.id === id);
    if (!claimToDelete) return;

    try {
      await claimsApi.delete(id);
      setClaims((prev) => prev.filter((c) => c.id !== id));
      
      toast({
        title: "Claim deleted",
        description: `${claimToDelete.title} has been deleted successfully.`,
      });
    } catch (error) {
      handleApiError(error, 'delete claim');
    }
  };

  // Country functions
  const addCountry = async (country: Omit<Country, "id" | "createdAt">) => {
    try {
      const apiCountry = await countriesApi.create({
        name: country.name,
        flagUrl: country.flag,
        contextFiles: country.contextFiles,
      });
      
      const newCountry = mapApiCountryToFrontend(apiCountry);
      setCountries((prev) => [...prev, newCountry]);
      
      toast({
        title: "Country created",
        description: `${newCountry.name} has been created successfully.`,
      });
    } catch (error) {
      handleApiError(error, 'create country');
    }
  };

  const updateCountry = async (country: Country) => {
    try {
      const apiCountry = await countriesApi.update(country.id, {
        name: country.name,
        flagUrl: country.flag,
        contextFiles: country.contextFiles,
      });
      
      const updatedCountry = mapApiCountryToFrontend(apiCountry);
      setCountries((prev) =>
        prev.map((c) => (c.id === country.id ? updatedCountry : c))
      );
      
      toast({
        title: "Country updated",
        description: `${updatedCountry.name} has been updated successfully.`,
      });
    } catch (error) {
      handleApiError(error, 'update country');
    }
  };

  const deleteCountry = async (id: string) => {
    const countryToDelete = countries.find((c) => c.id === id);
    if (!countryToDelete) return;

    try {
      await countriesApi.delete(id);
      setCountries((prev) => prev.filter((c) => c.id !== id));
      
      toast({
        title: "Country deleted",
        description: `${countryToDelete.name} has been deleted successfully.`,
      });
    } catch (error) {
      handleApiError(error, 'delete country');
    }
  };

  // Helper functions
  const getProjectById = (id: string) => projects.find((p) => p.id === id);
  const getContractorById = (id: string) => contractors.find((c) => c.id === id);
  const getClaimById = (id: string) => claims.find((c) => c.id === id);
  const getCountryById = (id: string) => countries.find((c) => c.id === id);
  const getContractorsByProjectId = (projectId: string) => 
    contractors.filter((c) => c.projectIds?.includes(projectId));
  const getProjectsByContractorId = (contractorId: string) => {
    const contractor = contractors.find((c) => c.id === contractorId);
    if (!contractor) return [];
    return projects.filter((p) => contractor.projectIds?.includes(p.id));
  };
  const getClaimsByProjectId = (projectId: string) =>
    claims.filter((c) => c.projectId === projectId);
  const getClaimsByContractorId = (contractorId: string) =>
    claims.filter((c) => c.contractorId === contractorId);

  const value = {
    projects,
    contractors,
    claims,
    countries,
    loading,
    error,
    addProject,
    updateProject,
    deleteProject,
    addContractor,
    updateContractor,
    deleteContractor,
    addClaim,
    updateClaim,
    deleteClaim,
    addCountry,
    updateCountry,
    deleteCountry,
    getProjectById,
    getContractorById,
    getClaimById,
    getCountryById,
    getContractorsByProjectId,
    getProjectsByContractorId,
    getClaimsByProjectId,
    getClaimsByContractorId,
    refreshData,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
};
