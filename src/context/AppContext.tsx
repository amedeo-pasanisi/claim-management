import { createContext, useContext, useState, useEffect } from "react";
import { Project, Contractor, Claim, Country, ApiCountry } from "@/types";
import { useToast } from "@/hooks/use-toast";
import { countryService } from "@/services/countryService";

type AppContextType = {
  projects: Project[];
  contractors: Contractor[];
  claims: Claim[];
  countries: Country[];
  isLoadingCountries: boolean;
  addProject: (project: Omit<Project, "id" | "createdAt">) => void;
  updateProject: (project: Project) => void;
  deleteProject: (id: string) => void;
  addContractor: (contractor: Omit<Contractor, "id" | "createdAt">) => void;
  updateContractor: (contractor: Contractor) => void;
  deleteContractor: (id: string) => void;
  addClaim: (claim: Omit<Claim, "id" | "createdAt">) => void;
  updateClaim: (claim: Claim) => void;
  deleteClaim: (id: string) => void;
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
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider = ({ children }: { children: React.ReactNode }) => {
  const { toast } = useToast();
  const [projects, setProjects] = useState<Project[]>([]);
  const [contractors, setContractors] = useState<Contractor[]>([]);
  const [claims, setClaims] = useState<Claim[]>([]);
  const [countries, setCountries] = useState<Country[]>([]);
  const [isLoadingCountries, setIsLoadingCountries] = useState(false);

  // Load data from localStorage on mount
  useEffect(() => {
    const loadedProjects = localStorage.getItem("projects");
    const loadedContractors = localStorage.getItem("contractors");
    const loadedClaims = localStorage.getItem("claims");
    const loadedCountries = localStorage.getItem("countries");

    if (loadedProjects) {
      try {
        setProjects(JSON.parse(loadedProjects));
      } catch (e) {
        console.error("Failed to parse projects from localStorage");
      }
    }
    
    if (loadedContractors) {
      try {
        setContractors(JSON.parse(loadedContractors));
      } catch (e) {
        console.error("Failed to parse contractors from localStorage");
      }
    }
    
    if (loadedClaims) {
      try {
        setClaims(JSON.parse(loadedClaims));
      } catch (e) {
        console.error("Failed to parse claims from localStorage");
      }
    }

    // Load countries from API instead of localStorage
    loadCountriesFromAPI();
  }, []);

  // Save data to localStorage when state changes
  useEffect(() => {
    localStorage.setItem("projects", JSON.stringify(projects));
  }, [projects]);

  useEffect(() => {
    localStorage.setItem("contractors", JSON.stringify(contractors));
  }, [contractors]);

  useEffect(() => {
    localStorage.setItem("claims", JSON.stringify(claims));
  }, [claims]);

  // Helper function to transform ApiCountry to Country
  const transformApiCountryToCountry = (apiCountry: ApiCountry): Country => ({
    id: apiCountry.id,
    name: apiCountry.name,
    code: "", // Not provided by API, will be empty
    flag: apiCountry.flagUrl,
    createdAt: new Date().toISOString(), // Not provided by API, use current time
    contextFiles: [], // Not supported by API yet
  });

  // Helper function to transform Country to API format
  const transformCountryToApiFormat = (country: Omit<Country, "id" | "createdAt">) => ({
    name: country.name.substring(0, 20), // Ensure max 20 characters
    flagUrl: country.flag,
  });

  // Load countries from API
  const loadCountriesFromAPI = async () => {
    setIsLoadingCountries(true);
    try {
      const apiCountries = await countryService.getAllCountries();
      const transformedCountries = apiCountries.map(transformApiCountryToCountry);
      setCountries(transformedCountries);
    } catch (error) {
      console.error("Failed to load countries from API:", error);
      toast({
        title: "Error loading countries",
        description: "Failed to load countries from server. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsLoadingCountries(false);
    }
  };

  // Project functions
  const addProject = (project: Omit<Project, "id" | "createdAt">) => {
    const newProject = {
      ...project,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
    };
    setProjects((prev) => [...prev, newProject]);
    toast({
      title: "Project created",
      description: `${newProject.title} has been created successfully.`,
    });
  };

  const updateProject = (project: Project) => {
    setProjects((prev) =>
      prev.map((p) => (p.id === project.id ? project : p))
    );
    toast({
      title: "Project updated",
      description: `${project.title} has been updated successfully.`,
    });
  };

  const deleteProject = (id: string) => {
    const projectToDelete = projects.find((p) => p.id === id);
    if (!projectToDelete) return;

    // Delete project
    setProjects((prev) => prev.filter((p) => p.id !== id));

    // Find contractors associated only with this project
    const contractorsToDelete: string[] = [];
    const contractorsToUpdate: Contractor[] = [];

    contractors.forEach((contractor) => {
      if (contractor.projectIds.includes(id)) {
        if (contractor.projectIds.length === 1) {
          // Contractor only has this project, so delete it
          contractorsToDelete.push(contractor.id);
        } else {
          // Contractor has other projects, so update it
          const updatedContractor = {
            ...contractor,
            projectIds: contractor.projectIds.filter((pid) => pid !== id),
          };
          contractorsToUpdate.push(updatedContractor);
        }
      }
    });

    // Update contractors that have multiple projects
    if (contractorsToUpdate.length > 0) {
      setContractors((prev) =>
        prev.map((c) => {
          const updatedContractor = contractorsToUpdate.find((uc) => uc.id === c.id);
          return updatedContractor || c;
        })
      );
    }

    // Delete contractors that only had this project
    if (contractorsToDelete.length > 0) {
      setContractors((prev) =>
        prev.filter((c) => !contractorsToDelete.includes(c.id))
      );
    }

    // Delete claims associated with this project
    const claimsToDelete = claims.filter((c) => c.projectId === id);
    if (claimsToDelete.length > 0) {
      setClaims((prev) =>
        prev.filter((c) => !claimsToDelete.map((cd) => cd.id).includes(c.id))
      );
    }

    toast({
      title: "Project deleted",
      description: `${projectToDelete.title} and all associated content has been deleted.`,
    });
  };

  // Contractor functions
  const addContractor = (contractor: Omit<Contractor, "id" | "createdAt">) => {
    const newContractor = {
      ...contractor,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
    };
    setContractors((prev) => [...prev, newContractor]);
    toast({
      title: "Contractor created",
      description: `${newContractor.name} has been created successfully.`,
    });
  };

  const updateContractor = (contractor: Contractor) => {
    setContractors((prev) =>
      prev.map((c) => (c.id === contractor.id ? contractor : c))
    );
    toast({
      title: "Contractor updated",
      description: `${contractor.name} has been updated successfully.`,
    });
  };

  const deleteContractor = (id: string) => {
    const contractorToDelete = contractors.find((c) => c.id === id);
    if (!contractorToDelete) return;

    // Delete contractor
    setContractors((prev) => prev.filter((c) => c.id !== id));

    // Delete claims associated with this contractor
    const claimsToDelete = claims.filter((c) => c.contractorId === id);
    if (claimsToDelete.length > 0) {
      setClaims((prev) =>
        prev.filter((c) => !claimsToDelete.map((cd) => cd.id).includes(c.id))
      );
    }

    toast({
      title: "Contractor deleted",
      description: `${contractorToDelete.name} and all associated claims have been deleted.`,
    });
  };

  // Claim functions
  const addClaim = (claim: Omit<Claim, "id" | "createdAt">) => {
    const newClaim = {
      ...claim,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
    };
    setClaims((prev) => [...prev, newClaim]);
    toast({
      title: "Claim created",
      description: `${newClaim.title} has been created successfully.`,
    });
  };

  const updateClaim = (claim: Claim) => {
    setClaims((prev) => prev.map((c) => (c.id === claim.id ? claim : c)));
    toast({
      title: "Claim updated",
      description: `${claim.title} has been updated successfully.`,
    });
  };

  const deleteClaim = (id: string) => {
    const claimToDelete = claims.find((c) => c.id === id);
    if (!claimToDelete) return;

    setClaims((prev) => prev.filter((c) => c.id !== id));
    toast({
      title: "Claim deleted",
      description: `${claimToDelete.title} has been deleted successfully.`,
    });
  };

  // Country functions
  const addCountry = async (country: Omit<Country, "id" | "createdAt">) => {
    try {
      const apiPayload = transformCountryToApiFormat(country);
      const apiCountry = await countryService.createCountry(apiPayload);
      const newCountry = transformApiCountryToCountry(apiCountry);
      
      // Store context files locally since API doesn't support them
      if (country.contextFiles.length > 0) {
        localStorage.setItem(`country-${apiCountry.id}-contextFiles`, JSON.stringify(country.contextFiles));
        newCountry.contextFiles = country.contextFiles;
      }
      
      setCountries((prev) => [...prev, newCountry]);
      toast({
        title: "Country created",
        description: `${newCountry.name} has been created successfully.`,
      });
    } catch (error) {
      console.error("Failed to create country:", error);
      toast({
        title: "Error creating country",
        description: "Failed to create country. Please try again.",
        variant: "destructive",
      });
    }
  };

  const updateCountry = async (country: Country) => {
    try {
      const apiPayload = transformCountryToApiFormat(country);
      const apiCountry = await countryService.updateCountry(country.id, apiPayload);
      const updatedCountry = transformApiCountryToCountry(apiCountry);
      
      // Store context files locally since API doesn't support them
      if (country.contextFiles.length > 0) {
        localStorage.setItem(`country-${country.id}-contextFiles`, JSON.stringify(country.contextFiles));
        updatedCountry.contextFiles = country.contextFiles;
      } else {
        localStorage.removeItem(`country-${country.id}-contextFiles`);
      }
      
      setCountries((prev) =>
        prev.map((c) => (c.id === country.id ? updatedCountry : c))
      );
      toast({
        title: "Country updated",
        description: `${updatedCountry.name} has been updated successfully.`,
      });
    } catch (error) {
      console.error("Failed to update country:", error);
      toast({
        title: "Error updating country",
        description: "Failed to update country. Please try again.",
        variant: "destructive",
      });
    }
  };

  const deleteCountry = async (id: string) => {
    const countryToDelete = countries.find((c) => c.id === id);
    if (!countryToDelete) return;

    try {
      await countryService.deleteCountry(id);
      localStorage.removeItem(`country-${id}-contextFiles`);
      setCountries((prev) => prev.filter((c) => c.id !== id));
      toast({
        title: "Country deleted",
        description: `${countryToDelete.name} has been deleted successfully.`,
      });
    } catch (error) {
      console.error("Failed to delete country:", error);
      toast({
        title: "Error deleting country",
        description: "Failed to delete country. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Helper functions
  const getProjectById = (id: string) => projects.find((p) => p.id === id);
  const getContractorById = (id: string) => contractors.find((c) => c.id === id);
  const getClaimById = (id: string) => claims.find((c) => c.id === id);
  const getCountryById = (id: string) => {
    const country = countries.find((c) => c.id === id);
    if (country) {
      // Load context files from localStorage
      const contextFiles = localStorage.getItem(`country-${id}-contextFiles`);
      if (contextFiles) {
        try {
          country.contextFiles = JSON.parse(contextFiles);
        } catch (e) {
          console.error("Failed to parse context files:", e);
        }
      }
    }
    return country;
  };
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
    isLoadingCountries,
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
