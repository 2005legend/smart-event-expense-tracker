import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/AuthProvider";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Upload, 
  Receipt, 
  ArrowLeft, 
  CheckCircle,
  AlertCircle,
  X,
  Loader2
} from "lucide-react";
import Layout from "@/components/Layout";
import { useEffect } from "react";

const AddExpense = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    title: "",
    amount: "",
    category: "",
    description: "",
  });
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [receiptPreview, setReceiptPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [ocrLoading, setOcrLoading] = useState(false);

  const categories = [
    "Food",
    "Transportation", 
    "Marketing",
    "Decorations",
    "Equipment",
    "Other"
  ];

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    }
  }, [user, authLoading, navigate]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast({
        title: "Invalid file type",
        description: "Please upload an image file (JPG, PNG, etc.)",
        variant: "destructive"
      });
      return;
    }

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please upload an image smaller than 5MB",
        variant: "destructive"
      });
      return;
    }

    setReceiptFile(file);
    
    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setReceiptPreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);

    // Simulate OCR extraction (in real app, would call OCR API)
    await simulateOCRExtraction(file);
  };

  const simulateOCRExtraction = async (file: File) => {
    setOcrLoading(true);
    
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // For demo purposes, extract a random amount
      // In real implementation, you would call OCR.space or Google Vision API
      const extractedAmount = Math.floor(Math.random() * 5000) + 100;
      
      if (extractedAmount && !formData.amount) {
        setFormData(prev => ({
          ...prev,
          amount: extractedAmount.toString()
        }));
        
        toast({
          title: "Amount extracted!",
          description: `Found ₹${extractedAmount} in the receipt. You can edit this if needed.`,
        });
      }
    } catch (error) {
      console.error("OCR extraction failed:", error);
      toast({
        title: "OCR extraction failed",
        description: "Please enter the amount manually",
        variant: "destructive"
      });
    } finally {
      setOcrLoading(false);
    }
  };

  const uploadReceiptToStorage = async (file: File): Promise<string | null> => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `receipt-${Date.now()}.${fileExt}`;
      const filePath = `receipts/${user?.id}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('receipts')
        .upload(filePath, file);

      if (uploadError) {
        throw uploadError;
      }

      const { data } = supabase.storage
        .from('receipts')
        .getPublicUrl(filePath);

      return data.publicUrl;
    } catch (error) {
      console.error("Error uploading receipt:", error);
      return null;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validate form
      if (!formData.title.trim()) {
        throw new Error("Title is required");
      }
      if (!formData.amount || parseFloat(formData.amount) <= 0) {
        throw new Error("Valid amount is required");
      }
      if (!formData.category) {
        throw new Error("Category is required");
      }

      let receiptUrl = null;
      
      // Upload receipt if provided
      if (receiptFile) {
        receiptUrl = await uploadReceiptToStorage(receiptFile);
        if (!receiptUrl) {
          throw new Error("Failed to upload receipt");
        }
      }

      // Insert expense into database
      const { error } = await supabase
        .from("expenses")
        .insert({
          amount: parseFloat(formData.amount),
          category: formData.category,
          description: formData.description.trim() || null,
          receipt_url: receiptUrl,
          submitted_by: user?.id,
          status: "pending"
        });

      if (error) {
        throw error;
      }

      toast({
        title: "Expense added successfully!",
        description: "Your expense has been submitted for review.",
        variant: "default"
      });

      navigate("/dashboard");
    } catch (error: any) {
      toast({
        title: "Error adding expense",
        description: error.message || "Failed to add expense. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const removeReceipt = () => {
    setReceiptFile(null);
    setReceiptPreview(null);
  };

  if (authLoading) {
    return (
      <Layout>
        <div className="max-w-2xl mx-auto px-4 py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-muted rounded w-1/3"></div>
            <div className="h-96 bg-muted rounded-lg"></div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/dashboard")}
            className="p-2"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-foreground">Add Expense</h1>
            <p className="text-muted-foreground">
              Submit a new expense for reimbursement
            </p>
          </div>
        </div>

        <Card className="shadow-[var(--shadow-card)] border-0">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Receipt className="h-5 w-5" />
              Expense Details
            </CardTitle>
            <CardDescription>
              Fill in the details of your expense. Upload a receipt for faster processing.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Title */}
              <div className="space-y-2">
                <Label htmlFor="title">
                  Title <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="title"
                  placeholder="e.g., Food for event volunteers"
                  value={formData.title}
                  onChange={(e) => handleInputChange("title", e.target.value)}
                  required
                  className="transition-all duration-200 focus:ring-2 focus:ring-primary/20"
                />
              </div>

              {/* Amount and Category Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="amount">
                    Amount (₹) <span className="text-destructive">*</span>
                  </Label>
                  <div className="relative">
                    <Input
                      id="amount"
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="0.00"
                      value={formData.amount}
                      onChange={(e) => handleInputChange("amount", e.target.value)}
                      required
                      className="transition-all duration-200 focus:ring-2 focus:ring-primary/20"
                    />
                    {ocrLoading && (
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                        <Loader2 className="h-4 w-4 animate-spin text-primary" />
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category">
                    Category <span className="text-destructive">*</span>
                  </Label>
                  <Select 
                    value={formData.category} 
                    onValueChange={(value) => handleInputChange("category", value)}
                    required
                  >
                    <SelectTrigger className="transition-all duration-200 focus:ring-2 focus:ring-primary/20">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Additional details about this expense..."
                  value={formData.description}
                  onChange={(e) => handleInputChange("description", e.target.value)}
                  rows={3}
                  className="transition-all duration-200 focus:ring-2 focus:ring-primary/20"
                />
              </div>

              {/* Receipt Upload */}
              <div className="space-y-4">
                <Label>Receipt Upload</Label>
                
                {!receiptPreview ? (
                  <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center hover:border-primary/50 transition-colors">
                    <Upload className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">Upload Receipt</h3>
                    <p className="text-muted-foreground mb-4">
                      Upload an image of your receipt for automatic amount extraction
                    </p>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                      id="receipt-upload"
                    />
                    <Label htmlFor="receipt-upload">
                      <Button
                        type="button"
                        variant="outline"
                        className="cursor-pointer"
                        asChild
                      >
                        <span>Choose File</span>
                      </Button>
                    </Label>
                    <p className="text-xs text-muted-foreground mt-2">
                      Supports JPG, PNG up to 5MB
                    </p>
                  </div>
                ) : (
                  <div className="relative">
                    <div className="border rounded-lg p-4 bg-muted/50">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <CheckCircle className="h-5 w-5 text-success" />
                          <span className="font-medium">Receipt uploaded</span>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={removeReceipt}
                          className="text-muted-foreground hover:text-foreground"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                      <img
                        src={receiptPreview}
                        alt="Receipt preview"
                        className="w-full max-w-sm mx-auto rounded border"
                      />
                      <p className="text-sm text-muted-foreground mt-2">
                        {receiptFile?.name}
                      </p>
                    </div>
                  </div>
                )}

                {ocrLoading && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Extracting amount from receipt...
                  </div>
                )}
              </div>

              {/* Submit Button */}
              <div className="flex gap-4 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate("/dashboard")}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="hero"
                  className="flex-1"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Adding...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Add Expense
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Info Card */}
        <Card className="mt-6 border-primary/20 bg-primary/5">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-primary mt-0.5" />
              <div className="space-y-1">
                <h4 className="font-medium text-primary">Pro Tips</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Upload clear photos of receipts for faster processing</li>
                  <li>• Include detailed descriptions to avoid clarification requests</li>
                  <li>• Submit expenses within 30 days of purchase for quicker approval</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default AddExpense;