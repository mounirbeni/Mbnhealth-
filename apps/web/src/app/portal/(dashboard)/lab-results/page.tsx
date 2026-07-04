"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { usePortalLabOrders, usePortalRadiologyOrders } from "@/hooks/use-portal-data";
import { STATUS_BADGE_VARIANT } from "@/lib/status-styles";
import { formatDate } from "@/lib/utils";

function OrdersTable({ orders, isLoading, testColumnLabel }: { orders: any[] | undefined; isLoading: boolean; testColumnLabel: string }) {
  return (
    <div className="rounded-xl border border-border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{testColumnLabel}</TableHead>
            <TableHead>Ordered by</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            <TableRow>
              <TableCell colSpan={4} className="py-8 text-center text-muted-foreground">
                Loading...
              </TableCell>
            </TableRow>
          ) : orders && orders.length > 0 ? (
            orders.map((o: any) => (
              <TableRow key={o.id}>
                <TableCell className="font-medium">{o.testName ?? o.examType}</TableCell>
                <TableCell>
                  Dr. {o.doctor?.user?.firstName} {o.doctor?.user?.lastName}
                </TableCell>
                <TableCell>{formatDate(o.orderedAt)}</TableCell>
                <TableCell>
                  <Badge variant={STATUS_BADGE_VARIANT[o.status] ?? "secondary"}>{o.status}</Badge>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={4} className="py-8 text-center text-muted-foreground">
                No orders found.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}

export default function PortalLabResultsPage() {
  const { data: labOrders, isLoading: labLoading } = usePortalLabOrders();
  const { data: radiologyOrders, isLoading: radiologyLoading } = usePortalRadiologyOrders();

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Lab & Radiology</h1>
        <p className="text-sm text-muted-foreground">Test orders and results from your visits</p>
      </div>

      <Tabs defaultValue="lab">
        <TabsList>
          <TabsTrigger value="lab">Laboratory</TabsTrigger>
          <TabsTrigger value="radiology">Radiology</TabsTrigger>
        </TabsList>
        <TabsContent value="lab">
          <OrdersTable orders={labOrders} isLoading={labLoading} testColumnLabel="Test" />
        </TabsContent>
        <TabsContent value="radiology">
          <OrdersTable orders={radiologyOrders} isLoading={radiologyLoading} testColumnLabel="Exam" />
        </TabsContent>
      </Tabs>
    </div>
  );
}
