import React, { useState } from 'react';
import { 
  Activity, 
  Clock, 
  User, 
  FileEdit, 
  Trash2, 
  Plus, 
  Download,
  Eye,
  LogIn,
  Search,
  Filter,
  Calendar,
  BarChart3,
  PieChart,
  Users,
  TrendingUp,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useActivityLogs, useActivityStats, ActivityLog } from '@/hooks/useActivityLogs';
import { format, formatDistanceToNow } from 'date-fns';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart as RechartsPieChart, Pie, Cell, AreaChart, Area } from 'recharts';

const ACTION_CONFIG: Record<string, { icon: React.ElementType; color: string; label: string }> = {
  create: { icon: Plus, color: '#22c55e', label: 'Created' },
  update: { icon: FileEdit, color: '#3b82f6', label: 'Updated' },
  delete: { icon: Trash2, color: '#ef4444', label: 'Deleted' },
  view: { icon: Eye, color: '#8b5cf6', label: 'Viewed' },
  export: { icon: Download, color: '#f59e0b', label: 'Exported' },
  login: { icon: LogIn, color: '#06b6d4', label: 'Login' },
  logout: { icon: LogIn, color: '#6b7280', label: 'Logout' },
  other: { icon: Activity, color: '#6b7280', label: 'Other' },
};

const ENTITY_COLORS: Record<string, string> = {
  invoice: '#3b82f6',
  product: '#22c55e',
  customer: '#8b5cf6',
  order: '#f59e0b',
  job_order: '#ec4899',
  expense: '#ef4444',
  employee: '#06b6d4',
  batch: '#84cc16',
  settings: '#6b7280',
};

const ActivityLogs = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [actionFilter, setActionFilter] = useState('all');
  const [entityFilter, setEntityFilter] = useState('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [selectedLog, setSelectedLog] = useState<ActivityLog | null>(null);
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  const { data: logs = [], isLoading } = useActivityLogs({
    action: actionFilter,
    entityType: entityFilter,
    dateFrom,
    dateTo,
    search: searchQuery,
  });

  const { data: stats } = useActivityStats();

  const toggleRowExpand = (id: string) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedRows(newExpanded);
  };

  // Chart data
  const actionChartData = stats?.actionBreakdown
    ? Object.entries(stats.actionBreakdown).map(([key, value]) => ({
        name: ACTION_CONFIG[key]?.label || key,
        value,
        color: ACTION_CONFIG[key]?.color || '#6b7280',
      }))
    : [];

  const entityChartData = stats?.entityBreakdown
    ? Object.entries(stats.entityBreakdown)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 8)
        .map(([key, value]) => ({
          name: key.replace('_', ' '),
          count: value,
          fill: ENTITY_COLORS[key] || '#6b7280',
        }))
    : [];

  const userChartData = stats?.userActivity
    ? Object.entries(stats.userActivity)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([email, count]) => ({
          name: email.split('@')[0],
          actions: count,
        }))
    : [];

  const uniqueEntities = [...new Set(logs.map(l => l.entity_type))].sort();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Activity className="h-7 w-7 text-indigo-500" />
            Activity Logs
          </h1>
          <p className="text-gray-500 mt-1">Track all user actions and system changes</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
        <Card className="border-l-4 border-l-indigo-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500">Total Logs</p>
                <p className="text-xl font-bold text-gray-900">{stats?.totalLogs || 0}</p>
              </div>
              <Activity className="h-6 w-6 text-indigo-500 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-blue-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500">Today</p>
                <p className="text-xl font-bold text-gray-900">{stats?.todayCount || 0}</p>
              </div>
              <Clock className="h-6 w-6 text-blue-500 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-cyan-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500">This Week</p>
                <p className="text-xl font-bold text-gray-900">{stats?.weekCount || 0}</p>
              </div>
              <TrendingUp className="h-6 w-6 text-cyan-500 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500">Creates</p>
                <p className="text-xl font-bold text-gray-900">{stats?.createCount || 0}</p>
              </div>
              <Plus className="h-6 w-6 text-green-500 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-amber-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500">Updates</p>
                <p className="text-xl font-bold text-gray-900">{stats?.updateCount || 0}</p>
              </div>
              <FileEdit className="h-6 w-6 text-amber-500 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-red-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500">Deletes</p>
                <p className="text-xl font-bold text-gray-900">{stats?.deleteCount || 0}</p>
              </div>
              <Trash2 className="h-6 w-6 text-red-500 opacity-50" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <PieChart className="h-5 w-5 text-indigo-500" />
              Actions Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent>
            {actionChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={200}>
                <RechartsPieChart>
                  <Pie
                    data={actionChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={75}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {actionChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </RechartsPieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[200px] text-gray-400">
                No data available
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <BarChart3 className="h-5 w-5 text-blue-500" />
              By Entity Type
            </CardTitle>
          </CardHeader>
          <CardContent>
            {entityChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={entityChartData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis type="number" fontSize={12} />
                  <YAxis dataKey="name" type="category" fontSize={11} width={80} />
                  <Tooltip />
                  <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                    {entityChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[200px] text-gray-400">
                No data available
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Users className="h-5 w-5 text-purple-500" />
              Top Users
            </CardTitle>
          </CardHeader>
          <CardContent>
            {userChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={userChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="name" fontSize={11} />
                  <YAxis fontSize={12} />
                  <Tooltip />
                  <Bar dataKey="actions" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[200px] text-gray-400">
                No data available
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Logs Table */}
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Activity Timeline
            </CardTitle>
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input 
                  placeholder="Search..."
                  className="pl-9 w-48"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Select value={actionFilter} onValueChange={setActionFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Action" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Actions</SelectItem>
                  <SelectItem value="create">Create</SelectItem>
                  <SelectItem value="update">Update</SelectItem>
                  <SelectItem value="delete">Delete</SelectItem>
                  <SelectItem value="view">View</SelectItem>
                  <SelectItem value="export">Export</SelectItem>
                  <SelectItem value="login">Login</SelectItem>
                </SelectContent>
              </Select>
              <Select value={entityFilter} onValueChange={setEntityFilter}>
                <SelectTrigger className="w-36">
                  <SelectValue placeholder="Entity" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Entities</SelectItem>
                  {uniqueEntities.map(entity => (
                    <SelectItem key={entity} value={entity}>
                      {entity.replace('_', ' ')}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input 
                type="date"
                className="w-36"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                placeholder="From"
              />
              <Input 
                type="date"
                className="w-36"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                placeholder="To"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
            </div>
          ) : logs.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <Activity className="h-12 w-12 mx-auto mb-4 opacity-30" />
              <p>No activity logs found</p>
              <p className="text-sm">Activity will appear here as users interact with the system</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-10"></TableHead>
                    <TableHead>Timestamp</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Action</TableHead>
                    <TableHead>Entity</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead className="text-right">Details</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {logs.map((log) => {
                    const ActionIcon = ACTION_CONFIG[log.action]?.icon || Activity;
                    const actionColor = ACTION_CONFIG[log.action]?.color || '#6b7280';
                    const isExpanded = expandedRows.has(log.id);
                    
                    return (
                      <React.Fragment key={log.id}>
                        <TableRow className="hover:bg-gray-50">
                          <TableCell>
                            {(log.old_values || log.new_values) && (
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6"
                                onClick={() => toggleRowExpand(log.id)}
                              >
                                {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                              </Button>
                            )}
                          </TableCell>
                          <TableCell className="whitespace-nowrap">
                            <div className="flex flex-col">
                              <span className="text-sm font-medium">
                                {format(new Date(log.created_at), 'dd MMM yyyy')}
                              </span>
                              <span className="text-xs text-gray-500">
                                {format(new Date(log.created_at), 'HH:mm:ss')}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center">
                                <User className="h-4 w-4 text-indigo-600" />
                              </div>
                              <div className="flex flex-col">
                                <span className="text-sm font-medium truncate max-w-[120px]">
                                  {log.user_name || 'System'}
                                </span>
                                <span className="text-xs text-gray-500 truncate max-w-[120px]">
                                  {log.user_email}
                                </span>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge 
                              style={{ backgroundColor: actionColor + '20', color: actionColor, borderColor: actionColor }}
                              className="border flex items-center gap-1 w-fit"
                            >
                              <ActionIcon className="h-3 w-3" />
                              {ACTION_CONFIG[log.action]?.label || log.action}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="capitalize">
                              {log.entity_type.replace('_', ' ')}
                            </Badge>
                            {log.entity_name && (
                              <span className="ml-2 text-xs text-gray-500 truncate max-w-[100px] inline-block align-middle">
                                {log.entity_name}
                              </span>
                            )}
                          </TableCell>
                          <TableCell className="max-w-[250px]">
                            <span className="text-sm text-gray-700 truncate block">
                              {log.description}
                            </span>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setSelectedLog(log)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                        {isExpanded && (log.old_values || log.new_values) && (
                          <TableRow className="bg-gray-50">
                            <TableCell colSpan={7} className="py-4">
                              <div className="grid grid-cols-2 gap-4 px-4">
                                {log.old_values && (
                                  <div>
                                    <p className="text-xs font-medium text-gray-500 mb-2">Previous Values</p>
                                    <pre className="text-xs bg-red-50 p-3 rounded-lg overflow-auto max-h-40 border border-red-100">
                                      {JSON.stringify(log.old_values, null, 2)}
                                    </pre>
                                  </div>
                                )}
                                {log.new_values && (
                                  <div>
                                    <p className="text-xs font-medium text-gray-500 mb-2">New Values</p>
                                    <pre className="text-xs bg-green-50 p-3 rounded-lg overflow-auto max-h-40 border border-green-100">
                                      {JSON.stringify(log.new_values, null, 2)}
                                    </pre>
                                  </div>
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                        )}
                      </React.Fragment>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Detail Dialog */}
      <Dialog open={!!selectedLog} onOpenChange={() => setSelectedLog(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-indigo-500" />
              Activity Details
            </DialogTitle>
          </DialogHeader>
          {selectedLog && (
            <ScrollArea className="max-h-[70vh]">
              <div className="space-y-4 pr-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-xs text-gray-500">Timestamp</p>
                    <p className="text-sm font-medium">
                      {format(new Date(selectedLog.created_at), 'dd MMM yyyy, HH:mm:ss')}
                    </p>
                    <p className="text-xs text-gray-400">
                      {formatDistanceToNow(new Date(selectedLog.created_at), { addSuffix: true })}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-gray-500">User</p>
                    <p className="text-sm font-medium">{selectedLog.user_name || 'System'}</p>
                    <p className="text-xs text-gray-400">{selectedLog.user_email}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-xs text-gray-500">Action</p>
                    <Badge 
                      style={{ 
                        backgroundColor: ACTION_CONFIG[selectedLog.action]?.color + '20', 
                        color: ACTION_CONFIG[selectedLog.action]?.color 
                      }}
                    >
                      {ACTION_CONFIG[selectedLog.action]?.label || selectedLog.action}
                    </Badge>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-gray-500">Entity</p>
                    <p className="text-sm font-medium capitalize">
                      {selectedLog.entity_type.replace('_', ' ')}
                      {selectedLog.entity_id && (
                        <span className="text-gray-400 ml-1 text-xs">#{selectedLog.entity_id.slice(0, 8)}</span>
                      )}
                    </p>
                  </div>
                </div>

                <div className="space-y-1">
                  <p className="text-xs text-gray-500">Description</p>
                  <p className="text-sm">{selectedLog.description}</p>
                </div>

                {selectedLog.entity_name && (
                  <div className="space-y-1">
                    <p className="text-xs text-gray-500">Entity Name</p>
                    <p className="text-sm font-medium">{selectedLog.entity_name}</p>
                  </div>
                )}

                {selectedLog.old_values && (
                  <div className="space-y-1">
                    <p className="text-xs text-gray-500">Previous Values</p>
                    <pre className="text-xs bg-red-50 p-3 rounded-lg overflow-auto max-h-48 border border-red-100">
                      {JSON.stringify(selectedLog.old_values, null, 2)}
                    </pre>
                  </div>
                )}

                {selectedLog.new_values && (
                  <div className="space-y-1">
                    <p className="text-xs text-gray-500">New Values</p>
                    <pre className="text-xs bg-green-50 p-3 rounded-lg overflow-auto max-h-48 border border-green-100">
                      {JSON.stringify(selectedLog.new_values, null, 2)}
                    </pre>
                  </div>
                )}

                {selectedLog.metadata && (
                  <div className="space-y-1">
                    <p className="text-xs text-gray-500">Additional Metadata</p>
                    <pre className="text-xs bg-gray-50 p-3 rounded-lg overflow-auto max-h-32">
                      {JSON.stringify(selectedLog.metadata, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            </ScrollArea>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ActivityLogs;
