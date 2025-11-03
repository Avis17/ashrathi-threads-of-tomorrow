import { Card } from "@/components/ui/card";
import { useProductionBatches } from "@/hooks/useProductionBatches";
import { formatCurrency } from "@/lib/utils";

export const ProductionAnalytics = () => {
  const { data: batches } = useProductionBatches();

  const totalBatches = batches?.length || 0;
  const totalCost = batches?.reduce((sum, b) => sum + Number(b.total_cost), 0) || 0;
  const totalSales = batches?.reduce((sum, b) => sum + Number(b.total_sales_amount), 0) || 0;
  const totalProfit = totalSales - totalCost;
  const profitMargin = totalSales > 0 ? (totalProfit / totalSales) * 100 : 0;

  const completedBatches = batches?.filter(b => 
    b.status === 'completed' || b.status === 'partially_sold' || b.status === 'fully_sold'
  ).length || 0;
  const soldBatches = batches?.filter(b => b.status === 'fully_sold').length || 0;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Production Analytics</h2>
        <p className="text-muted-foreground">
          Overview of production performance and profitability
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-6">
          <div className="text-sm text-muted-foreground">Total Batches</div>
          <div className="text-3xl font-bold">{totalBatches}</div>
          <div className="text-sm text-muted-foreground mt-1">
            {completedBatches} completed
          </div>
        </Card>

        <Card className="p-6">
          <div className="text-sm text-muted-foreground">Total Cost</div>
          <div className="text-3xl font-bold">{formatCurrency(totalCost)}</div>
          <div className="text-sm text-muted-foreground mt-1">
            All batches
          </div>
        </Card>

        <Card className="p-6">
          <div className="text-sm text-muted-foreground">Total Sales</div>
          <div className="text-3xl font-bold">{formatCurrency(totalSales)}</div>
          <div className="text-sm text-muted-foreground mt-1">
            {soldBatches} fully sold
          </div>
        </Card>

        <Card className="p-6">
          <div className="text-sm text-muted-foreground">Net Profit</div>
          <div className={`text-3xl font-bold ${totalProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {formatCurrency(totalProfit)}
          </div>
          <div className="text-sm text-muted-foreground mt-1">
            {profitMargin.toFixed(1)}% margin
          </div>
        </Card>
      </div>

      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Recent Batches</h3>
        <div className="space-y-3">
          {batches?.slice(0, 10).map((batch) => {
            const batchProfit = Number(batch.total_sales_amount) - Number(batch.total_cost);
            return (
              <div key={batch.id} className="flex justify-between items-center border-b pb-3">
                <div>
                  <div className="font-medium">{batch.batch_code}</div>
                  <div className="text-sm text-muted-foreground">{batch.product_name}</div>
                </div>
                <div className="text-right">
                  <div className="font-medium">{formatCurrency(Number(batch.total_cost))}</div>
                  <div className={`text-sm ${batchProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {batchProfit >= 0 ? '+' : ''}{formatCurrency(batchProfit)} profit
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
};
