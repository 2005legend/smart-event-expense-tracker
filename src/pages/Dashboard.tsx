import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/AuthProvider";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Plus, 
  Receipt, 
  TrendingUp, 
  AlertCircle,
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  Edit,
  Trash2
} from "lucide-react";
import Layout from "@/components/Layout";
import html2pdf from "html2pdf.js";
import { PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { Switch } from "@/components/ui/switch";

interface Expense {
  id: string;
  amount: number;
  category: string;
  description: string | null;
  receipt_url: string | null;
  status: string;
  created_at: string;
}

const Dashboard = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const budgetWarnedRef = useRef(false);
  const [eventBudget, setEventBudget] = useState<number>(50000); // ₹50,000 budget
  const [strictMode, setStrictMode] = useState(false);

  const TOTAL_BUDGET = 50000; // ₹50,000 budget

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
      return;
    }
    
    if (user) {
      fetchExpenses();
    }
  }, [user, authLoading, navigate]);

  const fetchExpenses = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("expenses")
        .select("*")
        .eq("submitted_by", user?.id)
        .order("created_at", { ascending: false });

      if (error) {
        throw error;
      }

      setExpenses(data || []);
    } catch (error: any) {
      toast({
        title: "Error loading expenses",
        description: error.message || "Failed to load your expenses",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const updateExpenseStatus = async (expenseId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from("expenses")
        .update({ status: newStatus })
        .eq("id", expenseId)
        .eq("submitted_by", user?.id);

      if (error) {
        throw error;
      }

      setExpenses(prev => 
        prev.map(expense => 
          expense.id === expenseId 
            ? { ...expense, status: newStatus }
            : expense
        )
      );

      toast({
        title: "Status updated",
        description: `Expense ${newStatus === "approved" ? "approved" : "rejected"} successfully`,
        variant: newStatus === "approved" ? "default" : "destructive"
      });
    } catch (error: any) {
      toast({
        title: "Error updating status",
        description: error.message || "Failed to update expense status",
        variant: "destructive"
      });
    }
  };

  const deleteExpense = async (expenseId: string) => {
    if (!confirm("Are you sure you want to delete this expense?")) {
      return;
    }

    try {
      const { error } = await supabase
        .from("expenses")
        .delete()
        .eq("id", expenseId)
        .eq("submitted_by", user?.id);

      if (error) {
        throw error;
      }

      setExpenses(prev => prev.filter(expense => expense.id !== expenseId));
      
      toast({
        title: "Expense deleted",
        description: "The expense has been deleted successfully"
      });
    } catch (error: any) {
      toast({
        title: "Error deleting expense",
        description: error.message || "Failed to delete the expense",
        variant: "destructive"
      });
    }
  };

  // Calculate statistics
  const totalExpenses = expenses.length;
  const approvedExpenses = expenses.filter(e => e.status === "approved");
  const totalApprovedAmount = approvedExpenses.reduce((sum, e) => sum + e.amount, 0);
  const budgetUtilization = (totalApprovedAmount / eventBudget) * 100;

  // Prepare analytics data
  const spendByCategory = Object.entries(
    approvedExpenses.reduce((acc, e) => {
      acc[e.category] = (acc[e.category] || 0) + e.amount;
      return acc;
    }, {} as Record<string, number>)
  ).map(([category, value]) => ({ name: category, value }));

  // Spend trend (by date)
  const spendTrend = approvedExpenses
    .reduce((acc, e) => {
      const date = new Date(e.created_at).toLocaleDateString();
      const found = acc.find(item => item.date === date);
      if (found) {
        found.amount += e.amount;
      } else {
        acc.push({ date, amount: e.amount });
      }
      return acc;
    }, [] as { date: string, amount: number }[])
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  // Colors for pie chart
  const pieColors = ["#6366f1", "#06b6d4", "#f59e42", "#10b981", "#f43f5e", "#a21caf", "#fbbf24"];

  // Budget warning toast
  useEffect(() => {
    if (budgetUtilization >= 90 && !budgetWarnedRef.current) {
      toast({
        title: "Budget Limit Nearing!",
        description: `You have used ${budgetUtilization.toFixed(1)}% of your budget. Consider reviewing your expenses.`,
        variant: "default"
      });
      budgetWarnedRef.current = true;
    }
  }, [budgetUtilization, toast]);

  // Budget plan template (percentages)
  const budgetPlan = {
    food: 0.25,
    logistics: 0.20,
    decoration: 0.15,
    tech: 0.20,
    guests: 0.10,
    misc: 0.10,
  };

  // Calculate spent per category (case-insensitive)
  const spentByCategory = approvedExpenses.reduce((acc, e) => {
    const key = (e.category || '').toLowerCase();
    if (budgetPlan[key] !== undefined) {
      acc[key] = (acc[key] || 0) + e.amount;
    }
    return acc;
  }, {} as Record<string, number>);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved": return "success";
      case "rejected": return "destructive";
      default: return "warning";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "approved": return <CheckCircle className="h-4 w-4" />;
      case "rejected": return <XCircle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const getBudgetColor = () => {
    if (budgetUtilization < 70) return "bg-success";
    if (budgetUtilization < 90) return "bg-warning";
    return "bg-destructive";
  };

  const handleDownloadPDF = () => {
    const element = document.getElementById("export-section");
    if (!element) {
      alert("No section found to export!");
      return;
    }

    const opt = {
      margin:       0.5,
      filename:     'my-expenses.pdf',
      image:        { type: 'jpeg', quality: 0.98 },
      html2canvas:  { scale: 2 },
      jsPDF:        { unit: 'in', format: 'letter', orientation: 'portrait' }
    };

    html2pdf().set(opt).from(element).save().then(() => {
      toast({
        title: "Download Successful!",
        description: "Your dashboard has been exported as PDF.",
        variant: "default"
      });
    });
  };

  if (authLoading || loading) {
    return (
      <Layout>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-muted rounded w-1/3"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-32 bg-muted rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              Welcome back, {user?.email?.split("@")[0]}!
            </h1>
            <p className="text-muted-foreground mt-1">
              Track and manage your event expenses
            </p>
            <div className="mt-4 flex items-center gap-2">
              <span className="font-medium">Event Budget:</span>
              <input
                type="number"
                min={1000}
                step={100}
                value={eventBudget}
                onChange={e => setEventBudget(Number(e.target.value))}
                className="border rounded px-2 py-1 w-32 text-right bg-background text-foreground"
              />
              <span className="text-muted-foreground">INR</span>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            <Button 
              onClick={() => navigate("/add-expense")}
              variant="hero"
              size="lg"
              className="w-full sm:w-auto"
            >
              <Plus className="h-5 w-5 mr-2" />
              Add Expense
            </Button>
            <button
              onClick={handleDownloadPDF}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              📄 Export as PDF
            </button>
          </div>
        </div>

        {/* Analytics Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Spend by Category Pie Chart */}
          <Card className="shadow-[var(--shadow-card)] border-0 col-span-1">
            <CardHeader>
              <CardTitle>Spend by Category</CardTitle>
              <CardDescription>Distribution of approved expenses</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={spendByCategory} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70} label>
                    {spendByCategory.map((entry, idx) => (
                      <Cell key={`cell-${idx}`} fill={pieColors[idx % pieColors.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Spend Trend Line Chart */}
          <Card className="shadow-[var(--shadow-card)] border-0 col-span-2">
            <CardHeader>
              <CardTitle>Spend Trend</CardTitle>
              <CardDescription>Approved expenses over time</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={spendTrend} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="amount" stroke="#6366f1" strokeWidth={2} dot />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Budget Planner Section */}
        <Card className="shadow-[var(--shadow-card)] border-0">
          <CardHeader>
            <CardTitle>Budget Planner</CardTitle>
            <CardDescription>Track category allocations and spending</CardDescription>
            <div className="flex items-center gap-2 mt-2">
              <Switch checked={strictMode} onCheckedChange={setStrictMode} id="strict-mode-switch" />
              <label htmlFor="strict-mode-switch" className="text-sm text-muted-foreground select-none cursor-pointer">
                Strict Mode
              </label>
              <span className="text-xs text-muted-foreground">{strictMode ? "Enforce allocation strictly" : "Suggestions only"}</span>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.entries(budgetPlan).map(([category, ratio]) => {
                const limit = eventBudget * ratio;
                const spent = spentByCategory[category] || 0;
                const percent = Math.min((spent / limit) * 100, 100);
                const overLimit = spent > limit;
                return (
                  <div key={category} className="p-4 bg-blue-50 dark:bg-gray-800 rounded-lg border">
                    <h3 className="font-semibold capitalize text-foreground mb-1">{category}</h3>
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded-full mt-2 mb-2">
                      <div
                        className={`h-3 rounded-full transition-all duration-300 ${overLimit && strictMode ? "bg-red-500" : "bg-green-500"}`}
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                    <p className="text-xs text-gray-500">
                      Ideal: ₹{(eventBudget * ratio).toFixed(0)}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Suggested: ₹{limit.toLocaleString()} &nbsp;|&nbsp; Spent: ₹{spent.toLocaleString()}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {Math.round((spent / eventBudget) * 100)}% of event budget
                    </p>
                    {overLimit && strictMode && (
                      <div className="mt-2 text-xs text-red-600 font-semibold">⚠ Over allocation!</div>
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Budget Utilization Progress Bar */}
        <Card className="shadow-[var(--shadow-card)] border-0">
          <CardHeader>
            <CardTitle>Budget Utilization</CardTitle>
            <CardDescription>How much of your budget is used</CardDescription>
          </CardHeader>
          <CardContent>
            <Progress value={budgetUtilization} className="w-full h-3" />
            <div className="flex justify-between text-sm text-muted-foreground mt-2">
              <span>₹0</span>
              <span>₹{eventBudget.toLocaleString()}</span>
            </div>
            <div className="mt-2 text-right text-xs text-muted-foreground">
              {budgetUtilization.toFixed(1)}% used
            </div>
          </CardContent>
        </Card>

        {/* Exportable Section Start */}
        <div id="export-section" className="space-y-8">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="shadow-[var(--shadow-card)] border-0">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
                <Receipt className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalExpenses}</div>
                <p className="text-xs text-muted-foreground">
                  {approvedExpenses.length} approved
                </p>
              </CardContent>
            </Card>

            <Card className="shadow-[var(--shadow-card)] border-0">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Amount</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">₹{totalApprovedAmount.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">
                  Approved expenses
                </p>
              </CardContent>
            </Card>

            <Card className="shadow-[var(--shadow-card)] border-0">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Budget Status</CardTitle>
                <AlertCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{budgetUtilization.toFixed(1)}%</div>
                <p className="text-xs text-muted-foreground">
                  of ₹{eventBudget.toLocaleString()} budget
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Budget Progress */}
          <Card className="shadow-[var(--shadow-card)] border-0">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Budget Utilization
              </CardTitle>
              <CardDescription>
                ₹{totalApprovedAmount.toLocaleString()} of ₹{eventBudget.toLocaleString()} used
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Progress 
                  value={budgetUtilization} 
                  className="w-full h-3"
                />
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>₹0</span>
                  <span>₹{eventBudget.toLocaleString()}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Expenses List */}
          <Card className="shadow-[var(--shadow-card)] border-0">
            <CardHeader>
              <CardTitle>Recent Expenses</CardTitle>
              <CardDescription>
                Manage your submitted expenses and track their status
              </CardDescription>
            </CardHeader>
            <CardContent>
              {expenses.length === 0 ? (
                <div className="text-center py-12">
                  <Receipt className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-muted-foreground mb-2">
                    No expenses yet
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    Start by adding your first expense to track your spending
                  </p>
                  <Button 
                    onClick={() => navigate("/add-expense")}
                    variant="hero"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Your First Expense
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {expenses.map((expense) => (
                    <div 
                      key={expense.id}
                      className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center gap-3">
                          <h4 className="font-medium">{expense.category}</h4>
                          <Badge 
                            variant={getStatusColor(expense.status) as any}
                            className="flex items-center gap-1"
                          >
                            {getStatusIcon(expense.status)}
                            {expense.status}
                          </Badge>
                        </div>
                        {expense.description && (
                          <p className="text-sm text-muted-foreground">
                            {expense.description}
                          </p>
                        )}
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span>₹{expense.amount.toLocaleString()}</span>
                          <span>{new Date(expense.created_at).toLocaleDateString()}</span>
                          {expense.receipt_url && (
                            <span className="flex items-center gap-1">
                              <Receipt className="h-3 w-3" />
                              Receipt attached
                            </span>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2 mt-3 sm:mt-0">
                        {expense.receipt_url && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => window.open(expense.receipt_url!, "_blank")}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        )}
                        
                        {expense.status === "pending" && (
                          <>
                            <Button
                              variant="success"
                              size="sm"
                              onClick={() => updateExpenseStatus(expense.id, "approved")}
                            >
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Approve
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => updateExpenseStatus(expense.id, "rejected")}
                            >
                              <XCircle className="h-4 w-4 mr-1" />
                              Reject
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => deleteExpense(expense.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
        {/* Exportable Section End */}
      </div>
    </Layout>
  );
};

export default Dashboard;