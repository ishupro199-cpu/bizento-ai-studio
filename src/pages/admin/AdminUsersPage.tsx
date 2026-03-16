import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useState } from "react";

const initialUsers = [
  { id: 1, name: "Jane Cooper", email: "jane@example.com", plan: "Pro", credits: 42, status: "Active" },
  { id: 2, name: "Mike Wilson", email: "mike@example.com", plan: "Starter", credits: 8, status: "Active" },
  { id: 3, name: "Alex Johnson", email: "alex@example.com", plan: "Free", credits: 1, status: "Active" },
  { id: 4, name: "Sarah Davis", email: "sarah@example.com", plan: "Pro", credits: 0, status: "Suspended" },
  { id: 5, name: "Tom Brown", email: "tom@example.com", plan: "Starter", credits: 15, status: "Active" },
  { id: 6, name: "Lisa Chen", email: "lisa@example.com", plan: "Free", credits: 3, status: "Active" },
];

export default function AdminUsersPage() {
  const [users, setUsers] = useState(initialUsers);

  const toggleStatus = (id: number) => {
    setUsers(prev => prev.map(u => u.id === id ? { ...u, status: u.status === "Active" ? "Suspended" : "Active" } : u));
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-foreground">Users</h1>
      <div className="glass rounded-xl overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-[hsl(var(--glass-border))]">
              <TableHead>User</TableHead>
              <TableHead>Plan</TableHead>
              <TableHead>Credits</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((u) => (
              <TableRow key={u.id} className="border-[hsl(var(--glass-border))]">
                <TableCell>
                  <div>
                    <p className="text-sm font-medium text-foreground">{u.name}</p>
                    <p className="text-xs text-muted-foreground">{u.email}</p>
                  </div>
                </TableCell>
                <TableCell><Badge variant="secondary" className="text-xs">{u.plan}</Badge></TableCell>
                <TableCell className="text-sm text-foreground">{u.credits}</TableCell>
                <TableCell>
                  <Badge variant={u.status === "Active" ? "default" : "destructive"} className="text-xs">
                    {u.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <Button size="sm" variant="ghost" className="text-xs h-7" onClick={() => toggleStatus(u.id)}>
                    {u.status === "Active" ? "Suspend" : "Activate"}
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
