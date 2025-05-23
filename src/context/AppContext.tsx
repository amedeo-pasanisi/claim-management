
import { createContext, useContext, useState, useEffect } from "react";
import { Project, Contractor, Claim } from "@/types";
import { useToast } from "@/components/ui/use-toast";

type AppContextType = {
  projects: Project[];
  contractors: Contractor[];
  claims: Claim[];
  addProject: (project: Omit<Project, "id" | "createdAt">) => void;
  updateProject: (project: Project) => void;
  deleteProject: (id: string) => void;
  addContractor: (contractor: Omit<Contractor, "id" | "createdAt">) => void;
  updateContractor: (contractor: Contractor) => void;
  deleteContractor: (id: string) => void;
  addClaim: (claim: Omit<Claim, "id" | "createdAt">) => void;
  updateClaim: (claim: Claim) => void;
  deleteClaim: (id: string) => void;
  getProjectById: (id: string) => Project | undefined;
  getContractorById: (id: string) => Contractor | undefined;
  getClaimById: (id: string) => Claim | undefined;
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

  // Load data from localStorage on mount
  useEffect(() => {
    const loadedProjects = localStorage.getItem("projects");
    const loadedContractors = localStorage.getItem("contractors");
    const loadedClaims = localStorage.getItem("claims");

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

  // Helper functions
  const getProjectById = (id: string) => projects.find((p) => p.id === id);
  const getContractorById = (id: string) => contractors.find((c) => c.id === id);
  const getClaimById = (id: string) => claims.find((c) => c.id === id);
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
    addProject,
    updateProject,
    deleteProject,
    addContractor,
    updateContractor,
    deleteContractor,
    addClaim,
    updateClaim,
    deleteClaim,
    getProjectById,
    getContractorById,
    getClaimById,
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
