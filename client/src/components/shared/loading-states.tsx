import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export function CaseCardSkeleton() {
  return (
    <Card className="bg-slate-800 border-slate-700">
      <CardHeader>
        <div className="flex items-center justify-between">
          <Skeleton className="h-4 w-24 bg-slate-600" />
          <Skeleton className="h-6 w-16 bg-slate-600" />
        </div>
        <Skeleton className="h-6 w-48 bg-slate-600" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-4 w-full bg-slate-600 mb-2" />
        <Skeleton className="h-4 w-3/4 bg-slate-600 mb-4" />
        <div className="flex gap-2">
          <Skeleton className="h-6 w-20 bg-slate-600" />
          <Skeleton className="h-6 w-16 bg-slate-600" />
        </div>
      </CardContent>
    </Card>
  );
}

export function StatsCardSkeleton() {
  return (
    <Card className="bg-slate-800 border-slate-700">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <Skeleton className="h-4 w-20 bg-slate-600 mb-2" />
            <Skeleton className="h-8 w-12 bg-slate-600" />
          </div>
          <Skeleton className="h-8 w-8 bg-slate-600 rounded" />
        </div>
      </CardContent>
    </Card>
  );
}

export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center space-x-4 p-4 bg-slate-800 rounded-lg border border-slate-700">
          <Skeleton className="h-10 w-10 rounded-full bg-slate-600" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-1/2 bg-slate-600" />
            <Skeleton className="h-3 w-1/3 bg-slate-600" />
          </div>
          <Skeleton className="h-6 w-20 bg-slate-600" />
          <Skeleton className="h-8 w-8 bg-slate-600" />
        </div>
      ))}
    </div>
  );
}

export function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      {/* Stats Grid Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCardSkeleton />
        <StatsCardSkeleton />
        <StatsCardSkeleton />
        <StatsCardSkeleton />
      </div>
      
      {/* Main Content Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <Skeleton className="h-6 w-32 bg-slate-600" />
            </CardHeader>
            <CardContent>
              <TableSkeleton rows={8} />
            </CardContent>
          </Card>
        </div>
        
        <div className="space-y-6">
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <Skeleton className="h-6 w-28 bg-slate-600" />
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="flex items-center space-x-3">
                    <Skeleton className="h-8 w-8 rounded bg-slate-600" />
                    <div className="flex-1">
                      <Skeleton className="h-4 w-3/4 bg-slate-600 mb-1" />
                      <Skeleton className="h-3 w-1/2 bg-slate-600" />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export function PageLoadingSkeleton() {
  return (
    <div className="min-h-screen bg-slate-900 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <Skeleton className="h-8 w-48 bg-slate-700 mb-2" />
          <Skeleton className="h-4 w-96 bg-slate-700" />
        </div>
        <DashboardSkeleton />
      </div>
    </div>
  );
}