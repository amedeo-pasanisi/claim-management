import { useState, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useApp } from "@/context/AppContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { 
  ArrowLeft, 
  Edit, 
  Trash, 
  File, 
  FolderClosed, 
  FolderOpen, 
  Users,
  FolderKanban, 
  FileText,
  RefreshCw,
  Clipboard,
  Download,
  Eye,
  ExternalLink,
  Scan,
  Type,
  ChevronDown
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import ConfirmDeleteDialog from "@/components/ConfirmDeleteDialog";

const CLAIM_RESPONSE_TEXT = `Contractor Response to Claim
 
Subject: REPLY OF NOTICE
Reference: NOC-TECNOVIA-SAIPEM-0003 | PROCUREMENT FROM CHINA, INDIA AND SOUTHEAST ASIA | GTP
 
Date: [Insert Date]
 
Dear Sirs,
 
We acknowledge receipt of your Notice of Claim dated 14th June 2023 regarding procurement restrictions and the potential impact on schedule and costs. After a thorough review of your submission and the relevant contractual provisions, we regret to inform you that your claim is not eligible.
 
Justifications for Rejection
Foreseeable Risks and Force Majeure (Clause 21.1):
The contract explicitly states that foreseeable events, including those arising from global challenges such as the COVID-19 pandemic and its related effects, shall not constitute Force Majeure or justify delays, non-performance, or additional costs. While your claim references trade challenges caused by the war in Ukraine, these are considered foreseeable risks that were to be accounted for at the time of contract execution.
 
Risk Allocation and Procurement Obligations:
The SUB-CONTRACTOR explicitly declared in Clause 21.1 that it had considered foreseeable risks, including potential regulatory or certification requirements, before entering into the WORK CONTRACT DOCUMENTS. The requirement for a 3.2 Type Certificate for materials from certain regions is consistent with standard procurement practices and does not constitute an unforeseen or extraordinary condition.
 
Fixed Contract Amount:
The contract specifies a fixed Base Amount and Maximum Amount, with no provisions for price adjustments due to procurement challenges or increased costs unless explicitly stated. There is no evidence in the contract that supports price adjustments or schedule revisions for the reasons cited in your claim.
 
Speculative Nature of the Claim:
Your claim is based on potential delays and cost increases, which are speculative and not tied to any demonstrated or actual impact on the project schedule or budget.
 
Obligation to Perform:
As per the contract, the SUB-CONTRACTOR is obligated to perform the WORKS in accordance with the agreed schedule and price. The challenges cited in your claim do not relieve you of this obligation, nor do they provide grounds for a schedule revision or price adjustment.
 
Conclusion
In light of the above, your claim is rejected. The contractual terms and conditions clearly allocate the risks associated with procurement challenges to the SUB-CONTRACTOR, and no provisions exist to support the requested adjustments.
 
We remind you of your obligation to perform the WORKS as per the agreed terms and encourage you to explore alternative sourcing strategies to mitigate any potential delays or cost increases. Should you require further clarification, please do not hesitate to contact us.
 
Yours faithfully,
[Contractor Representative Name]
For and on behalf of [Contractor Name]`

const EXTRACTED_TEXT = `NOTICE OF CLAIM  
ANGOLAN NORTHERN GAS COMPLEX  
Gas Treatment Plant (GTP) Onshore Plant  
Contract No. 1428383 CIVIL WORKS  
 
Date 14th June 2023  
NOTICE OF CLAIM | SCOPE | SITE  
NOC-TECNOVIA-SAIPEM-0003 | PROCUREMENT FROM CHINA, INDIA AND SOUTHEAST ASIA | GTP  
 
Dear Sirs,  
 
Considering:  
 
1. The procurement process and international purchases, regarding which, Contractor informed Tecnovia to exclude imports from China, India and SouthEast Asia (as noted in Meeting Minute M-TECNO-C-013, dated 9th June), or present a 3.2 Type Certificate for approval.  
 
2. International trade is currently under stress conditions due to war in Ukraine � and actual trade trend for the most attractive sourcing markets has moved East, namely the above-mentioned countries and regions.  
 
Tecnovia reserves the right to claim for potential schedule revision and price surcharge if procurement in remaining markets results in significant delay and/or overcost.  
 
Yours faithfully,  
 
(Signature)  
 
Jos� Barros da Rocha  
Tecnovia Representative  
jose.barros@tecnovianangola.com  
+244 946892550  
 
Tecnovia Angola  
Sociedade de Engenharia, Lda  `

const SUMMARIZED_TEXT = `Summary: This document presents a standard Lorem ipsum text commonly used as placeholder content in the printing and typesetting industry. The text discusses various aspects of pleasure, pain, and duty, following the classical philosophical arguments about the pursuit of pleasure and avoidance of pain.

Key Points:
• Standard placeholder text used since the 1500s
• Contains philosophical elements about pleasure and pain
• Commonly used in design and layout demonstrations
• Derived from classical Latin literature`

const ClaimDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { 
    getClaimById, 
    deleteClaim, 
    getProjectById,
    getContractorById
  } = useApp();
  
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [showClaimFiles, setShowClaimFiles] = useState(false);
  const [isGeneratingResponse, setIsGeneratingResponse] = useState(false);
  const [responseText, setResponseText] = useState("");
  const [showResponse, setShowResponse] = useState(false);
  
  // Text extraction states
  const [isExtractingText, setIsExtractingText] = useState(false);
  const [extractedText, setExtractedText] = useState("");
  const [showExtractedText, setShowExtractedText] = useState(false);
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [summarizedText, setSummarizedText] = useState("");
  const [showSummary, setShowSummary] = useState(false);

  // Collapsible states
  const [isExtractTextOpen, setIsExtractTextOpen] = useState(false);
  const [isResponseOpen, setIsResponseOpen] = useState(false);

  // References
  const responseTextareaRef = useRef<HTMLTextAreaElement>(null);

  if (!id) {
    navigate("/claims");
    return null;
  }
  
  const claim = getClaimById(id);
  
  if (!claim) {
    navigate("/claims");
    return null;
  }

  const contractor = getContractorById(claim.contractorId);
  const project = getProjectById(claim.projectId);

  const handleDelete = () => {
    deleteClaim(id);
    navigate("/claims");
  };

  const handleGenerateResponse = () => {
    setIsGeneratingResponse(true);
    setShowResponse(false);
    
    // Simulate API call with timeout
    setTimeout(() => {
      setResponseText(CLAIM_RESPONSE_TEXT);
      setIsGeneratingResponse(false);
      setShowResponse(true);
      
      toast({
        title: "Response Generated",
        description: "Claim response has been generated successfully.",
      });
    }, 2000);
  };

  const handleExtractText = () => {
    setIsExtractingText(true);
    setShowExtractedText(false);
    setShowSummary(false);
    
    // Simulate text extraction with timeout
    setTimeout(() => {
      setExtractedText(EXTRACTED_TEXT);
      setIsExtractingText(false);
      setShowExtractedText(true);
      
      toast({
        title: "Text Extracted",
        description: "Text has been extracted from the claim file successfully.",
      });
    }, 1500);
  };

  const handleSummarizeText = () => {
    setIsSummarizing(true);
    setShowSummary(false);
    
    // Simulate text summarization with timeout
    setTimeout(() => {
      setSummarizedText(SUMMARIZED_TEXT);
      setIsSummarizing(false);
      setShowSummary(true);
      
      toast({
        title: "Text Summarized",
        description: "Extracted text has been summarized successfully.",
      });
    }, 1000);
  };

  const handleCopyResponse = () => {
    if (responseText) {
      navigator.clipboard.writeText(responseText);
      toast({
        title: "Copied to Clipboard",
        description: "Response text has been copied to clipboard.",
      });
    }
  };

  const handleDownloadResponse = () => {
    if (responseText) {
      // Create a Blob with the response text
      const blob = new Blob([responseText], { type: 'text/plain' });
      // Create a download link and trigger it
      const downloadLink = document.createElement('a');
      downloadLink.href = URL.createObjectURL(blob);
      downloadLink.download = `${claim.title}_Response.txt`; // In a real app, this would be a PDF
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
      toast({
        title: "Download Started",
        description: `${claim.title}_Response.pdf is being downloaded.`,
      });
    }
  };

  const handleFilePreview = (file: File) => {
    const fileURL = URL.createObjectURL(file);
    window.open(fileURL, '_blank');
    toast({
      title: "File Opened",
      description: `${file.name} opened in new tab.`,
    });
  };

  const handleFileDownload = (file: File) => {
    const fileURL = URL.createObjectURL(file);
    const downloadLink = document.createElement('a');
    downloadLink.href = fileURL;
    downloadLink.download = file.name;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
    URL.revokeObjectURL(fileURL);
    toast({
      title: "Download Started",
      description: `${file.name} is being downloaded.`,
    });
  };

  const isPreviewableFile = (file: File) => {
    const previewableTypes = ['image/', 'text/', 'application/pdf'];
    return previewableTypes.some(type => file.type.startsWith(type));
  };

  const renderFileActions = (file: File) => (
    <div className="flex space-x-1">
      {isPreviewableFile(file) && (
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={() => handleFilePreview(file)}
          title="Preview file"
        >
          <Eye className="h-4 w-4" />
        </Button>
      )}
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8"
        onClick={() => handleFileDownload(file)}
        title="Download file"
      >
        <Download className="h-4 w-4" />
      </Button>
    </div>
  );

  // Calculate total context files count
  const getTotalContextFilesCount = () => {
    let count = claim.contextFiles.length;
    if (claim.includedProjectContext && project) {
      count += project.contextFiles.length;
    }
    if (claim.includedContractorContext && contractor) {
      count += contractor.contextFiles.length;
    }
    return count;
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
            <h1 className="text-3xl font-bold tracking-tight">{claim.title}</h1>
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

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="md:col-span-2">
          <CardHeader>
            <div className="flex items-center">
              <FileText className="h-5 w-5 mr-2 text-amber-600" />
              <CardTitle>Claim Details</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h3 className="font-medium mb-1">Title</h3>
                <p>{claim.title}</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="font-medium mb-1">Contractor</h3>
                  <Link 
                    to={`/contractors/${claim.contractorId}`}
                    className="text-blue-600 hover:underline"
                  >
                    {contractor?.name || "Unknown Contractor"}
                  </Link>
                </div>
                <div>
                  <h3 className="font-medium mb-1">Project</h3>
                  <Link 
                    to={`/projects/${claim.projectId}`}
                    className="text-blue-600 hover:underline"
                  >
                    {project?.title || "Unknown Project"}
                  </Link>
                </div>
              </div>

              <div>
                <h3 className="font-medium mb-2">Claim File</h3>
                <div className="flex items-center justify-between p-3 border rounded bg-gray-50">
                  <div className="flex items-center">
                    <File className="h-4 w-4 text-amber-600 mr-2" />
                    <span className="text-sm">{claim.claimFile?.name}</span>
                  </div>
                  {claim.claimFile && renderFileActions(claim.claimFile)}
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
                      Hide Context Files
                    </>
                  ) : (
                    <>
                      <FolderClosed className="mr-2 h-4 w-4 text-amber-600" />
                      Show Context Files ({getTotalContextFilesCount()})
                    </>
                  )}
                </Button>
                
                {showClaimFiles && (
                  <div className="border rounded-md p-4 space-y-4">
                    {/* Claim's own context files */}
                    <div>
                      <h4 className="font-medium mb-2 text-amber-600">Claim Context Files</h4>
                      {claim.contextFiles.length === 0 ? (
                        <p className="text-gray-500 text-sm">No claim context files attached</p>
                      ) : (
                        <div className="space-y-2">
                          {claim.contextFiles.map((file, index) => (
                            <div 
                              key={index} 
                              className="flex items-center justify-between p-3 border rounded bg-gray-50"
                            >
                              <div className="flex items-center">
                                <File className="h-4 w-4 text-amber-600 mr-2" />
                                <span className="text-sm">{file.name}</span>
                              </div>
                              {renderFileActions(file)}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Project context files */}
                    {claim.includedProjectContext && project && (
                      <div>
                        <h4 className="font-medium mb-2 text-blue-600">Project Context Files</h4>
                        {project.contextFiles.length === 0 ? (
                          <p className="text-gray-500 text-sm">No project context files available</p>
                        ) : (
                          <div className="space-y-2">
                            {project.contextFiles.map((file, index) => (
                              <div 
                                key={`project-${index}`} 
                                className="flex items-center justify-between p-3 border rounded bg-blue-50"
                              >
                                <div className="flex items-center">
                                  <File className="h-4 w-4 text-blue-600 mr-2" />
                                  <span className="text-sm">{file.name}</span>
                                  <Badge variant="outline" className="ml-2 text-xs">Project</Badge>
                                </div>
                                {renderFileActions(file)}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Contractor context files */}
                    {claim.includedContractorContext && contractor && (
                      <div>
                        <h4 className="font-medium mb-2 text-green-600">Contractor Context Files</h4>
                        {contractor.contextFiles.length === 0 ? (
                          <p className="text-gray-500 text-sm">No contractor context files available</p>
                        ) : (
                          <div className="space-y-2">
                            {contractor.contextFiles.map((file, index) => (
                              <div 
                                key={`contractor-${index}`} 
                                className="flex items-center justify-between p-3 border rounded bg-green-50"
                              >
                                <div className="flex items-center">
                                  <File className="h-4 w-4 text-green-600 mr-2" />
                                  <span className="text-sm">{file.name}</span>
                                  <Badge variant="outline" className="ml-2 text-xs">Contractor</Badge>
                                </div>
                                {renderFileActions(file)}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Show message if no context was included */}
                    {!claim.includedProjectContext && !claim.includedContractorContext && claim.contextFiles.length === 0 && (
                      <p className="text-gray-500 text-sm">No context files included in this claim</p>
                    )}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="font-medium mb-1">Project Context Included</h3>
                  <Badge variant={claim.includedProjectContext ? "default" : "outline"}>
                    {claim.includedProjectContext ? "Yes" : "No"}
                  </Badge>
                </div>
                <div>
                  <h3 className="font-medium mb-1">Contractor Context Included</h3>
                  <Badge variant={claim.includedContractorContext ? "default" : "outline"}>
                    {claim.includedContractorContext ? "Yes" : "No"}
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center">
                <FolderKanban className="h-5 w-5 mr-2 text-blue-600" />
                <CardTitle>Project</CardTitle>
              </div>
              <CardDescription>
                Associated project details
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <h3 className="font-medium">
                  {project?.title || "Unknown Project"}
                </h3>
                <p className="text-sm text-gray-500">
                  {project ? `${project.contextFiles.length} context files` : "No data available"}
                </p>
                <Button 
                  variant="outline" 
                  size="sm"
                  asChild
                >
                  <Link to={`/projects/${claim.projectId}`}>
                    View Project
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <div className="flex items-center">
                <Users className="h-5 w-5 mr-2 text-green-600" />
                <CardTitle>Contractor</CardTitle>
              </div>
              <CardDescription>
                Associated contractor details
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <h3 className="font-medium">
                  {contractor?.name || "Unknown Contractor"}
                </h3>
                <p className="text-sm text-gray-500">
                  {contractor ? `${contractor.contextFiles.length} context files` : "No data available"}
                </p>
                <Button 
                  variant="outline" 
                  size="sm"
                  asChild
                >
                  <Link to={`/contractors/${claim.contractorId}`}>
                    View Contractor
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Collapsible open={isExtractTextOpen} onOpenChange={setIsExtractTextOpen}>
        <Card>
          <CollapsibleTrigger asChild>
            <CardHeader className="cursor-pointer hover:bg-gray-50/50 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Scan className="h-5 w-5 mr-2 text-blue-600" />
                  <CardTitle>Extract Text from Claim File</CardTitle>
                </div>
                <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${isExtractTextOpen ? 'rotate-180' : ''}`} />
              </div>
              <CardDescription>
                Extract and analyze text content from the uploaded claim file
              </CardDescription>
            </CardHeader>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent>
              {isExtractingText ? (
                <div className="flex flex-col items-center justify-center py-10">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-700 mb-4"></div>
                  <p className="text-gray-500">Extracting text from claim file...</p>
                </div>
              ) : showExtractedText ? (
                <div className="space-y-4">
                  <div className="border rounded-md p-4 bg-gray-50">
                    <h4 className="font-medium mb-2 flex items-center">
                      <FileText className="h-4 w-4 mr-2" />
                      Extracted Text
                    </h4>
                    <div className="text-sm text-gray-700 whitespace-pre-line max-h-60 overflow-y-auto">
                      {extractedText}
                    </div>
                  </div>
                  
                  {!isSummarizing && !showSummary && (
                    <div className="flex justify-end">
                      <Button 
                        onClick={handleSummarizeText}
                        variant="outline"
                        className="flex items-center"
                      >
                        <RefreshCw className="mr-2 h-4 w-4" />
                        Summarize Text
                      </Button>
                    </div>
                  )}
                  
                  {isSummarizing && (
                    <div className="flex flex-col items-center justify-center py-6">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-700 mb-2"></div>
                      <p className="text-gray-500 text-sm">Generating summary...</p>
                    </div>
                  )}
                  
                  {showSummary && (
                    <div className="border rounded-md p-4 bg-blue-50">
                      <h4 className="font-medium mb-2 flex items-center">
                        <FileText className="h-4 w-4 mr-2 text-blue-600" />
                        Summary
                      </h4>
                      <div className="text-sm text-gray-700 whitespace-pre-line">
                        {summarizedText}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-10 text-gray-400">
                  <Scan className="h-16 w-16 mb-4" />
                  <p className="mb-2">No text extracted yet</p>
                  <p className="text-sm mb-4">Click the "Extract Text" button to extract content from the claim file</p>
                  <Button 
                    onClick={handleExtractText}
                    className="flex items-center"
                  >
                    <Type className="mr-2 h-4 w-4" />
                    Extract Text
                  </Button>
                </div>
              )}
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>
      
      <Collapsible open={isResponseOpen} onOpenChange={setIsResponseOpen}>
        <Card>
          <CollapsibleTrigger asChild>
            <CardHeader className="cursor-pointer hover:bg-gray-50/50 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <FileText className="h-5 w-5 mr-2 text-gray-600" />
                  <CardTitle>Generate Claim Response</CardTitle>
                </div>
                <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${isResponseOpen ? 'rotate-180' : ''}`} />
              </div>
              <CardDescription>
                Generate an automated response based on the claim and associated context
              </CardDescription>
            </CardHeader>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent>
              {isGeneratingResponse ? (
                <div className="flex flex-col items-center justify-center py-10">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-700 mb-4"></div>
                  <p className="text-gray-500">Generating claim response...</p>
                </div>
              ) : showResponse ? (
                <div className="space-y-4">
                  <Textarea 
                    value={responseText}
                    onChange={(e) => setResponseText(e.target.value)}
                    className="h-60 font-mono text-sm"
                    ref={responseTextareaRef}
                  />
                  <div className="flex justify-end space-x-2">
                    <Button 
                      variant="outline"
                      className="flex items-center"
                      onClick={handleCopyResponse}
                    >
                      <Clipboard className="mr-2 h-4 w-4" />
                      Copy
                    </Button>
                    <Button 
                      className="flex items-center"
                      onClick={handleDownloadResponse}
                    >
                      <Download className="mr-2 h-4 w-4" />
                      Download File
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-10 text-gray-400">
                  <FileText className="h-16 w-16 mb-4" />
                  <p className="mb-2">No response generated yet</p>
                  <p className="text-sm mb-4">Click the "Generate Response" button to create a response to this claim</p>
                  <Button 
                    onClick={handleGenerateResponse}
                    className="flex items-center"
                  >
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Generate Response
                  </Button>
                </div>
              )}
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>

      <ConfirmDeleteDialog
        isOpen={isDeleteDialogOpen}
        setIsOpen={setIsDeleteDialogOpen}
        entityType="Claim"
        entityName={claim.title}
        onConfirm={handleDelete}
      />
    </div>
  );
};

export default ClaimDetail;
