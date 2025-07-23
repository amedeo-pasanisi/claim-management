import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useApp } from "@/context/AppContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Edit, Trash, File, FolderClosed, FolderOpen, Users, FolderKanban, FileText, Copy, Download } from "lucide-react";
import ReactMarkdown from 'react-markdown';
import jsPDF from 'jspdf';
import ConfirmDeleteDialog from "@/components/ConfirmDeleteDialog";
import LoadingSpinner from "@/components/LoadingSpinner";
import { claimsApi, projectsApi, contractorsApi } from "@/lib/api";
import { ClaimWithProjectContractorContextFiles, ProjectWithCountryContractorsClaimsContext, ContractorWithProjectsClaimsContext } from "@/types/api";

const ClaimDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { deleteClaim } = useApp();

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [showClaimFiles, setShowClaimFiles] = useState(false);
  const [showContractorFiles, setShowContractorFiles] = useState(false);
  const [showProjectFiles, setShowProjectFiles] = useState(false);
  const [claim, setClaim] = useState<ClaimWithProjectContractorContextFiles | null>(null);
  const [detailedProject, setDetailedProject] = useState<ProjectWithCountryContractorsClaimsContext | null>(null);
  const [detailedContractor, setDetailedContractor] = useState<ContractorWithProjectsClaimsContext | null>(null);
  const [loading, setLoading] = useState(true);
  const [projectFilesLoading, setProjectFilesLoading] = useState(false);
  const [contractorFilesLoading, setContractorFilesLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showReportGenerator, setShowReportGenerator] = useState(false);
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const [reportText, setReportText] = useState('');

  useEffect(() => {
    const fetchClaim = async () => {
      if (!id) {
        navigate("/claims");
        return;
      }

      try {
        setLoading(true);
        const claimData = await claimsApi.getById(id);
        setClaim(claimData);
      } catch (err) {
        console.error('Failed to fetch claim:', err);
        setError('Failed to load claim details');
        navigate("/claims");
      } finally {
        setLoading(false);
      }
    };

    fetchClaim();
  }, [id, navigate]);

  const fetchProjectDetails = async () => {
    if (!claim || detailedProject) return;
    
    try {
      setProjectFilesLoading(true);
      const projectData = await projectsApi.getById(claim.project.id);
      setDetailedProject(projectData);
    } catch (err) {
      console.error('Failed to fetch project details:', err);
    } finally {
      setProjectFilesLoading(false);
    }
  };

  const fetchContractorDetails = async () => {
    if (!claim || detailedContractor) return;
    
    try {
      setContractorFilesLoading(true);
      const contractorData = await contractorsApi.getById(claim.contractor.id);
      setDetailedContractor(contractorData);
    } catch (err) {
      console.error('Failed to fetch contractor details:', err);
    } finally {
      setContractorFilesLoading(false);
    }
  };

  const handleFileClick = (filePath: string) => {
    window.open(filePath, '_blank');
  };

  const handleShowProjectFiles = () => {
    if (!showProjectFiles && !detailedProject) {
      fetchProjectDetails();
    }
    setShowProjectFiles(!showProjectFiles);
  };

  const handleShowContractorFiles = () => {
    if (!showContractorFiles && !detailedContractor) {
      fetchContractorDetails();
    }
    setShowContractorFiles(!showContractorFiles);
  };

  if (!id) {
    navigate("/claims");
    return null;
  }

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error || !claim) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-red-600">{error || 'Claim not found'}</p>
      </div>
    );
  }

  const handleDelete = () => {
    deleteClaim(id);
    navigate("/claims");
  };

  const handleGenerateReport = () => {
    setIsGeneratingReport(true);
    setShowReportGenerator(true);
    
    setTimeout(() => {
      const sampleText = `**Subject:** Claim due to Stoppage RTR Installation Activity after Railway  
**References:** PTJ-SGCP-SAS-L-0639/2021  
**To:** Subcontractor  
**From:** Contractor  
Dear Sirs,  
The Contractor has reviewed the claim submitted by the Subcontractor, referenced as PTJ-SGCP-SAS-L-0639/2021, regarding compensation for standby time due to the stoppage of RTR installation activities. After thorough analysis, the Contractor has determined that the claim is **non-eligible** based on the following contractual considerations:  
1. **Failure to Provide Timely Notification of Standby Time**  
   As per the terms of the Purchase Order (_PO 1248435 Rev.01_), the Subcontractor is required to immediately notify the Contractor's Representative orally when standby time is anticipated and confirm such notification in writing as soon as practicable. The claim does not provide evidence of any timely oral or written notification regarding the anticipated standby time. In the absence of such notification, the Contractor reserves the right to reject the claim for compensation.  
2. **Lack of Substantiated Daily Time Sheets**  
   The Purchase Order (_PO 1248435 Rev.00_) explicitly requires that all requests for standby compensation be substantiated by daily time sheets prepared by the Subcontractor, stating the reasons for the standby and submitted to the Contractor's Representative for confirmation no later than the following scheduled working day. The claim does not include any evidence of such daily time sheets signed or confirmed by the Contractor's Representative, rendering the claim invalid.  
3. **Standby Time Not Verified or Approved**  
   According to the Purchase Order (_PO 1248435 Rev.00_), verified standby time will only be compensated if it occurs on a scheduled workday and is approved by the Contractor. The claim does not provide evidence that the standby time was verified or approved by the Contractor, which is a prerequisite for eligibility.  
4. **No Evidence of Inability to Reschedule Resources**  
   The Purchase Order (_PO 1248435 Rev.01_) requires the Subcontractor to justify why affected manpower and equipment could not be rescheduled for use elsewhere during the standby period. The claim does not include any explanation or evidence demonstrating that the Subcontractor was unable to reallocate resources, which is necessary to support a claim for standby compensation.  
5. **Exclusion of Standby Time for Non-Force Majeure Events**  
   The Purchase Order (_PO 1248435 Rev.01_) explicitly excludes liability for standby time caused by the Subcontractor's inability to supply materials, equipment, or personnel, or due to equipment malfunction, inclement weather, or other non-Force Majeure events. The claim does not reference any Force Majeure event or exceptional circumstance that would justify the stoppage, and therefore, the Contractor is not liable for the claimed standby costs.  
6. **No Evidence of Contractual Breach by Contractor**  
   The claim asserts that the Contractor stopped the activity "without any contractual reasons." However, no evidence is provided to substantiate this assertion. The Contractor retains the right to manage and adjust project schedules as per the terms of the Work Contract (_PO 1248435 Rev.01_), and no breach of contract has been demonstrated in the claim.  
7. **Requirement for Revision of Work Contract Amount**  
   As per the Work Contract (_4. SAS-SGCP-PTJ-L-00222-20_), any claims related to modifications or changes in work must be included in the Total Work Contract Amount through a formal revision process. The claim does not provide evidence that the claimed standby costs were included in a revised Work Contract Amount, which is a necessary condition for processing or approval.  
**Conclusion:**  
Based on the above points, the claim is deemed **non-eligible** due to the Subcontractor's failure to comply with the contractual requirements for notification, substantiation, verification, and justification of standby time.  
Sincerely,  
Contractor`;
      
      setReportText(sampleText);
      setIsGeneratingReport(false);
    }, 5000);
  };

  const handleCopyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(reportText);
      // Could add toast notification here if needed
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const handleSaveToPDF = () => {
    const doc = new jsPDF();
    const pageHeight = doc.internal.pageSize.height;
    const margin = 20;
    const lineHeight = 6;
    const maxWidth = 170;
    
    // Split text into lines
    const lines = doc.splitTextToSize(reportText, maxWidth);
    
    let y = margin;
    
    lines.forEach((line: string) => {
      if (y + lineHeight > pageHeight - margin) {
        doc.addPage();
        y = margin;
      }
      doc.text(line, margin, y);
      y += lineHeight;
    });
    
    doc.save(`claim-report-${claim.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.pdf`);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center">
          <Button
            variant="ghost"
            size="icon"
            className="mr-2"
            onClick={() => navigate("/claims")}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{claim.name}</h1>
            <p className="text-gray-500">
              Created on {new Date(claim.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>
        <div className="flex space-x-2">
          <Button
            variant="outline"
            className="flex items-center"
            onClick={() => navigate(`/claims/${id}/edit`)}
          >
            <Edit className="mr-2 h-4 w-4" />
            Edit
          </Button>
          <Button
            variant="destructive"
            className="flex items-center"
            onClick={() => setIsDeleteDialogOpen(true)}
          >
            <Trash className="mr-2 h-4 w-4" />
            Delete
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-2">
          <CardHeader>
            <div className="flex items-center">
              <FolderClosed className="h-5 w-5 mr-2 text-amber-600" />
              <CardTitle>Claim Details</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h3 className="font-medium mb-1">Title</h3>
                <p>{claim.name}</p>
              </div>

              <div>
                <h3 className="font-medium mb-1">Project</h3>
                <Link
                  to={`/projects/${claim.project.id}`}
                  className="text-blue-600 hover:text-blue-800 underline"
                >
                  {claim.project.name}
                </Link>
              </div>

              <div>
                <h3 className="font-medium mb-1">Contractor</h3>
                <Link
                  to={`/contractors/${claim.contractor.id}`}
                  className="text-blue-600 hover:text-blue-800 underline"
                >
                  {claim.contractor.name}
                </Link>
              </div>

              <div>
                <h3 className="font-medium mb-1">Main Claim File</h3>
                <div className="border rounded-md p-4">
                  <div 
                    className="flex items-center p-2 border rounded bg-gray-50 cursor-pointer hover:bg-gray-100 transition-colors"
                    onClick={() => handleFileClick(claim.claimFile.path)}
                  >
                    <FileText className="h-4 w-4 text-blue-600 mr-2" />
                    <span className="text-sm">
                      {claim.claimFile.path.split('/').pop() || claim.claimFile.path}
                    </span>
                    <Badge variant="secondary" className="ml-2 text-xs">
                      Uploaded {new Date(claim.claimFile.created_at).toLocaleDateString()}
                    </Badge>
                  </div>
                </div>
              </div>

              <div>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex items-center mb-2"
                  onClick={() => setShowClaimFiles(!showClaimFiles)}
                >
                  {showClaimFiles ? (
                    <>
                      <FolderOpen className="mr-2 h-4 w-4 text-amber-600" />
                      Hide Claim Context Files
                    </>
                  ) : (
                    <>
                      <FolderClosed className="mr-2 h-4 w-4 text-amber-600" />
                      Show Claim Context Files ({claim.contextFiles.length})
                    </>
                  )}
                </Button>

                {showClaimFiles && (
                  <div className="border rounded-md p-4 space-y-2">
                    {claim.contextFiles.length === 0 ? (
                      <p className="text-gray-500">No context files attached</p>
                    ) : (
                      claim.contextFiles.map((file) => {
                        const fileName = file.path.split('/').pop() || file.path;
                        return (
                          <div
                            key={file.id}
                            className="flex items-center p-2 border rounded bg-gray-50 cursor-pointer hover:bg-gray-100 transition-colors"
                            onClick={() => handleFileClick(file.path)}
                          >
                            <File className="h-4 w-4 text-amber-600 mr-2" />
                            <span className="text-sm">{fileName}</span>
                          </div>
                        );
                      })
                    )}
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center">
                <FolderKanban className="h-5 w-5 mr-2 text-blue-600" />
                <CardTitle>Associated Project</CardTitle>
              </div>
              <CardDescription>Project this claim belongs to</CardDescription>
            </CardHeader>
            <CardContent>
              <Link
                to={`/projects/${claim.project.id}`}
                className="block p-2 border rounded hover:bg-gray-50 mb-2"
              >
                {claim.project.name}
              </Link>

              <Button
                variant="outline"
                size="sm"
                className="flex items-center w-full"
                onClick={handleShowProjectFiles}
                disabled={projectFilesLoading}
              >
                {projectFilesLoading ? (
                  <>
                    <LoadingSpinner size="sm" className="mr-2" />
                    Loading...
                  </>
                ) : showProjectFiles ? (
                  <>
                    <FolderOpen className="mr-2 h-4 w-4 text-blue-600" />
                    Hide Project Files
                  </>
                ) : (
                  <>
                    <FolderClosed className="mr-2 h-4 w-4 text-blue-600" />
                    Show Project Files
                  </>
                )}
              </Button>

              {showProjectFiles && (
                <div className="mt-2 border rounded-md p-2 space-y-1 max-h-40 overflow-y-auto">
                  {!detailedProject?.contextFiles || detailedProject.contextFiles.length === 0 ? (
                    <p className="text-gray-500 text-sm">No project context files</p>
                  ) : (
                    detailedProject.contextFiles.map((file) => {
                      const fileName = file.path.split('/').pop() || file.path;
                      return (
                        <div 
                          key={file.id} 
                          className="flex items-center p-1 text-sm cursor-pointer hover:bg-gray-100 rounded transition-colors"
                          onClick={() => handleFileClick(file.path)}
                        >
                          <File className="h-3 w-3 text-blue-600 mr-1" />
                          <span className="truncate">{fileName}</span>
                        </div>
                      );
                    })
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center">
                <Users className="h-5 w-5 mr-2 text-green-600" />
                <CardTitle>Associated Contractor</CardTitle>
              </div>
              <CardDescription>Contractor this claim belongs to</CardDescription>
            </CardHeader>
            <CardContent>
              <Link
                to={`/contractors/${claim.contractor.id}`}
                className="block p-2 border rounded hover:bg-gray-50 mb-2"
              >
                {claim.contractor.name}
              </Link>

              <Button
                variant="outline"
                size="sm"
                className="flex items-center w-full"
                onClick={handleShowContractorFiles}
                disabled={contractorFilesLoading}
              >
                {contractorFilesLoading ? (
                  <>
                    <LoadingSpinner size="sm" className="mr-2" />
                    Loading...
                  </>
                ) : showContractorFiles ? (
                  <>
                    <FolderOpen className="mr-2 h-4 w-4 text-green-600" />
                    Hide Contractor Files
                  </>
                ) : (
                  <>
                    <FolderClosed className="mr-2 h-4 w-4 text-green-600" />
                    Show Contractor Files
                  </>
                )}
              </Button>

              {showContractorFiles && (
                <div className="mt-2 border rounded-md p-2 space-y-1 max-h-40 overflow-y-auto">
                  {!detailedContractor?.contextFiles || detailedContractor.contextFiles.length === 0 ? (
                    <p className="text-gray-500 text-sm">No contractor context files</p>
                  ) : (
                    detailedContractor.contextFiles.map((file) => {
                      const fileName = file.path.split('/').pop() || file.path;
                      return (
                        <div 
                          key={file.id} 
                          className="flex items-center p-1 text-sm cursor-pointer hover:bg-gray-100 rounded transition-colors"
                          onClick={() => handleFileClick(file.path)}
                        >
                          <File className="h-3 w-3 text-green-600 mr-1" />
                          <span className="truncate">{fileName}</span>
                        </div>
                      );
                    })
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Extracted Text and Summary Section */}
      {(claim.text || claim.summary) && (
        <Card>
          <CardHeader>
            <div className="flex items-center">
              <FileText className="h-5 w-5 mr-2 text-purple-600" />
              <CardTitle>Extracted Text</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {claim.text && (
                <div>
                  <h3 className="font-medium mb-1">Text</h3>
                  <div className="border rounded-md p-4 bg-gray-50 max-h-64 overflow-y-auto">
                    <p className="text-sm whitespace-pre-wrap">{claim.text}</p>
                  </div>
                </div>
              )}

              {claim.summary && (
                <div>
                  <h3 className="font-medium mb-1">Summary</h3>
                  <div className="border rounded-md p-4 bg-gray-50">
                    <p className="text-sm whitespace-pre-wrap">{claim.summary}</p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Report Generator Section */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col items-center space-y-4">
            <Button
              onClick={handleGenerateReport}
              size="lg"
              className="w-full max-w-md h-12 text-lg"
              disabled={isGeneratingReport}
            >
              {isGeneratingReport ? (
                <>
                  <LoadingSpinner size="sm" className="mr-2" />
                  Generating Report...
                </>
              ) : (
                <>
                  <FileText className="mr-2 h-5 w-5" />
                  Generate Claim Out
                </>
              )}
            </Button>

            {showReportGenerator && !isGeneratingReport && (
              <div className="w-full space-y-4">
                <div className="border rounded-md p-6 bg-background min-h-[400px] prose prose-sm max-w-none">
                  <ReactMarkdown>{reportText}</ReactMarkdown>
                </div>
                <div className="flex justify-center space-x-4">
                  <Button
                    onClick={handleCopyToClipboard}
                    variant="outline"
                    className="flex items-center"
                  >
                    <Copy className="mr-2 h-4 w-4" />
                    Copy to Clipboard
                  </Button>
                  <Button
                    onClick={handleSaveToPDF}
                    variant="outline"
                    className="flex items-center"
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Save as PDF
                  </Button>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <ConfirmDeleteDialog
        isOpen={isDeleteDialogOpen}
        setIsOpen={setIsDeleteDialogOpen}
        entityType="Claim"
        entityName={claim.name}
        onConfirm={handleDelete}
        cascadeMessage=""
      />
    </div>
  );
};

export default ClaimDetail;
