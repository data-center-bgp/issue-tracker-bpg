import type { DashboardStats } from "../../lib/dashboard";
import { BusinessUnitTable } from "./BusinessUnitTable";
import { KpiBars } from "./KpiBars";
import { NeedsAttention } from "./NeedsAttention";
import { SummaryTiles } from "./SummaryTiles";

export function DashboardView({ stats }: { stats: DashboardStats }) {
  return (
    <div className="space-y-6">
      <SummaryTiles stats={stats} />
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-5">
        <div className="xl:col-span-3">
          <NeedsAttention stats={stats} />
        </div>
        <div className="xl:col-span-2">
          <KpiBars stats={stats} />
        </div>
      </div>
      <BusinessUnitTable stats={stats} />
    </div>
  );
}
