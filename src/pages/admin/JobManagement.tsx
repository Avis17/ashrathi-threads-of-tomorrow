import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Shirt, Package, Users, DollarSign, Building2 } from 'lucide-react';
import StylesManager from '@/components/admin/jobmanagement/StylesManager';
import BatchesManager from '@/components/admin/jobmanagement/BatchesManager';
import EmployeesManager from '@/components/admin/jobmanagement/EmployeesManager';
import ExpensesManager from '@/components/admin/jobmanagement/ExpensesManager';
import ContractorsManager from '@/components/admin/jobmanagement/ContractorsManager';

const JobManagement = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const tabFromUrl = searchParams.get('tab');
  const [activeTab, setActiveTab] = useState(tabFromUrl || 'styles');

  useEffect(() => {
    if (tabFromUrl) {
      setActiveTab(tabFromUrl);
    }
  }, [tabFromUrl]);

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Job Management System
          </h1>
          <p className="text-muted-foreground mt-1">
            Complete production workflow management
          </p>
        </div>
      </div>

      {/* Tabs Navigation */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-5 h-auto p-1 bg-muted/50">
          <TabsTrigger 
            value="styles" 
            className="flex items-center gap-2 py-3 data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-secondary data-[state=active]:text-primary-foreground transition-all"
          >
            <Shirt className="h-4 w-4" />
            <span className="hidden sm:inline">Styles</span>
          </TabsTrigger>
          <TabsTrigger 
            value="batches"
            className="flex items-center gap-2 py-3 data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-secondary data-[state=active]:text-primary-foreground transition-all"
          >
            <Package className="h-4 w-4" />
            <span className="hidden sm:inline">Batches</span>
          </TabsTrigger>
          <TabsTrigger 
            value="employees"
            className="flex items-center gap-2 py-3 data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-secondary data-[state=active]:text-primary-foreground transition-all"
          >
            <Users className="h-4 w-4" />
            <span className="hidden sm:inline">Employees</span>
          </TabsTrigger>
          <TabsTrigger 
            value="expenses"
            className="flex items-center gap-2 py-3 data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-secondary data-[state=active]:text-primary-foreground transition-all"
          >
            <DollarSign className="h-4 w-4" />
            <span className="hidden sm:inline">Expenses</span>
          </TabsTrigger>
          <TabsTrigger 
            value="contractors"
            className="flex items-center gap-2 py-3 data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-secondary data-[state=active]:text-primary-foreground transition-all"
          >
            <Building2 className="h-4 w-4" />
            <span className="hidden sm:inline">Contractors</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="styles" className="mt-6">
          <StylesManager />
        </TabsContent>

        <TabsContent value="batches" className="mt-6">
          <BatchesManager />
        </TabsContent>

        <TabsContent value="employees" className="mt-6">
          <EmployeesManager />
        </TabsContent>

        <TabsContent value="expenses" className="mt-6">
          <ExpensesManager />
        </TabsContent>

        <TabsContent value="contractors" className="mt-6">
          <ContractorsManager />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default JobManagement;
