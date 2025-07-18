import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/components/AuthProvider";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Wallet, 
  Receipt, 
  TrendingUp, 
  Shield,
  Clock,
  Users,
  ArrowRight,
  CheckCircle
} from "lucide-react";

const Index = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && user) {
      navigate("/dashboard");
    }
  }, [user, loading, navigate]);

  const features = [
    {
      icon: Receipt,
      title: "Easy Expense Tracking",
      description: "Upload receipts and track expenses with automatic OCR amount extraction"
    },
    {
      icon: TrendingUp,
      title: "Budget Management",
      description: "Monitor spending against budgets with real-time progress tracking"
    },
    {
      icon: Clock,
      title: "Quick Approvals",
      description: "Streamlined approval process for faster reimbursements"
    },
    {
      icon: Shield,
      title: "Secure & Private",
      description: "Your data is protected with enterprise-grade security"
    },
    {
      icon: Users,
      title: "Team Collaboration",
      description: "Perfect for student organizations and event committees"
    },
    {
      icon: CheckCircle,
      title: "Mobile Friendly",
      description: "Access your expenses anywhere with responsive design"
    }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-background flex items-center justify-center">
        <div className="animate-pulse flex items-center gap-3">
          <div className="h-8 w-8 bg-primary rounded-lg"></div>
          <div className="h-6 w-32 bg-muted rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-background">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16 lg:py-24">
        <div className="text-center space-y-8 max-w-4xl mx-auto">
          {/* Logo and Title */}
          <div className="space-y-4">
            <div className="flex justify-center">
              <div className="h-16 w-16 bg-gradient-to-r from-primary to-primary-glow rounded-2xl flex items-center justify-center shadow-[var(--shadow-elegant)]">
                <Wallet className="h-8 w-8 text-primary-foreground" />
              </div>
            </div>
            <h1 className="text-4xl lg:text-6xl font-bold">
              <span className="bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">
                ExpenseTracker
              </span>
            </h1>
            <p className="text-xl lg:text-2xl text-muted-foreground max-w-2xl mx-auto">
              Streamline expense management and reimbursements for student events and organizations
            </p>
          </div>

          {/* Call to Action */}
          <div className="space-y-4">
            <Button 
              onClick={() => navigate("/auth")}
              variant="hero"
              size="lg"
              className="text-lg px-8 py-6 h-auto"
            >
              Get Started Free
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <p className="text-sm text-muted-foreground">
              No credit card required • Start tracking expenses immediately
            </p>
          </div>
        </div>

        {/* Features Grid */}
        <div className="mt-24 max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">
              Everything you need for expense management
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Built specifically for student organizations, clubs, and event committees
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card 
                key={index} 
                className="shadow-[var(--shadow-card)] border-0 hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
              >
                <CardHeader className="text-center pb-4">
                  <div className="mx-auto mb-4 h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center">
                    <feature.icon className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <CardDescription className="text-base">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* How it Works */}
        <div className="mt-24 max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">
              How it works
            </h2>
            <p className="text-xl text-muted-foreground">
              Simple, fast, and efficient expense tracking in three steps
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                step: "1",
                title: "Upload Receipt",
                description: "Take a photo or upload an image of your receipt. Our OCR technology automatically extracts the amount."
              },
              {
                step: "2", 
                title: "Add Details",
                description: "Fill in the expense details, select a category, and add any additional notes or descriptions."
              },
              {
                step: "3",
                title: "Get Approved",
                description: "Submit for approval and track the status. Get reimbursed faster with our streamlined process."
              }
            ].map((step, index) => (
              <div key={index} className="text-center space-y-4">
                <div className="mx-auto h-16 w-16 bg-gradient-to-r from-primary to-primary-glow rounded-full flex items-center justify-center text-primary-foreground font-bold text-xl shadow-lg">
                  {step.step}
                </div>
                <h3 className="text-xl font-semibold">{step.title}</h3>
                <p className="text-muted-foreground">{step.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Final CTA */}
        <div className="mt-24 text-center">
          <Card className="max-w-2xl mx-auto shadow-[var(--shadow-elegant)] border-0 bg-gradient-to-r from-primary/5 to-primary-glow/5">
            <CardContent className="p-8">
              <h2 className="text-2xl lg:text-3xl font-bold mb-4">
                Ready to simplify your expense tracking?
              </h2>
              <p className="text-muted-foreground mb-6">
                Join thousands of students and organizations already using ExpenseTracker
              </p>
              <Button 
                onClick={() => navigate("/auth")}
                variant="hero"
                size="lg"
                className="text-lg px-8 py-6 h-auto"
              >
                Start Tracking Expenses
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Index;
