import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Shirt, Package, Users, DollarSign, Factory } from 'lucide-react';
import StylesManager from '@/components/admin/jobmanagement/StylesManager';
import BatchesManager from '@/components/admin/jobmanagement/BatchesManager';
import ProductionEntry from '@/components/admin/jobmanagement/ProductionEntry';
import EmployeesManager from '@/components/admin/jobmanagement/EmployeesManager';
import ExpensesManager from '@/components/admin/jobmanagement/ExpensesManager';

const JobManagement = () => {
  const [activeTab, setActiveTab] = useState('styles');

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
            value="production"
            className="flex items-center gap-2 py-3 data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-secondary data-[state=active]:text-primary-foreground transition-all"
          >
            <Factory className="h-4 w-4" />
            <span className="hidden sm:inline">Production</span>
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
        </TabsList>

        <TabsContent value="styles" className="mt-6">
          <StylesManager />
        </TabsContent>

        <TabsContent value="batches" className="mt-6">
          <BatchesManager />
        </TabsContent>

        <TabsContent value="production" className="mt-6">
          <ProductionEntry />
        </TabsContent>

        <TabsContent value="employees" className="mt-6">
          <EmployeesManager />
        </TabsContent>

        <TabsContent value="expenses" className="mt-6">
          <ExpensesManager />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default JobManagement;
