import { useState } from "react";
import { Table, Card, Input, Button, Tag, Avatar, Space, Tooltip, Typography, Select, Dropdown } from "antd";
import {
  MagnifyingGlassIcon,
  FunnelIcon,
  UserPlusIcon,
  EllipsisVerticalIcon,
  NoSymbolIcon,
  CheckCircleIcon,
  TrashIcon,
  KeyIcon,
  ArrowRightOnRectangleIcon,
} from "@heroicons/react/24/outline";

const ACCENT = "#89E900";
const CARD_BG = "#2a2a2a";
const BORDER = "#333";

const { Title, Text } = Typography;

const initialUsers = [
  { id: 1, name: "Jane Cooper", email: "jane@example.com", plan: "Pro", credits: 42, status: "Active", joined: "Jan 12, 2025", generations: 128 },
  { id: 2, name: "Mike Wilson", email: "mike@example.com", plan: "Starter", credits: 8, status: "Active", joined: "Feb 3, 2025", generations: 34 },
  { id: 3, name: "Alex Johnson", email: "alex@example.com", plan: "Free", credits: 1, status: "Active", joined: "Mar 17, 2025", generations: 5 },
  { id: 4, name: "Sarah Davis", email: "sarah@example.com", plan: "Pro", credits: 0, status: "Suspended", joined: "Dec 8, 2024", generations: 210 },
  { id: 5, name: "Tom Brown", email: "tom@example.com", plan: "Starter", credits: 15, status: "Active", joined: "Apr 1, 2025", generations: 67 },
  { id: 6, name: "Lisa Chen", email: "lisa@example.com", plan: "Free", credits: 3, status: "Active", joined: "May 22, 2025", generations: 12 },
  { id: 7, name: "David Park", email: "david@example.com", plan: "Pro", credits: 100, status: "Active", joined: "Jun 10, 2025", generations: 345 },
  { id: 8, name: "Emma White", email: "emma@example.com", plan: "Starter", credits: 5, status: "Suspended", joined: "Jul 4, 2025", generations: 88 },
];

const planColors: Record<string, string> = {
  Pro: "#a78bfa",
  Starter: "#60a5fa",
  Free: "#9ca3af",
};

export default function AdminUsersPage() {
  const [users, setUsers] = useState(initialUsers);
  const [search, setSearch] = useState("");
  const [planFilter, setPlanFilter] = useState<string>("all");

  const toggleStatus = (id: number) => {
    setUsers((prev) =>
      prev.map((u) => (u.id === id ? { ...u, status: u.status === "Active" ? "Suspended" : "Active" } : u))
    );
  };

  const filtered = users.filter((u) => {
    const matchSearch =
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase());
    const matchPlan = planFilter === "all" || u.plan === planFilter;
    return matchSearch && matchPlan;
  });

  const columns = [
    {
      title: "User",
      dataIndex: "name",
      key: "name",
      render: (_: string, record: typeof initialUsers[0]) => (
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <Avatar
            size={34}
            style={{
              background: `hsl(${(record.name.charCodeAt(0) * 47) % 360}, 60%, 50%)`,
              fontWeight: 700,
              fontSize: 13,
              flexShrink: 0,
            }}
          >
            {record.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
          </Avatar>
          <div>
            <Text style={{ color: "#fff", fontWeight: 500, fontSize: 13, display: "block" }}>{record.name}</Text>
            <Text style={{ color: "rgba(255,255,255,0.4)", fontSize: 12 }}>{record.email}</Text>
          </div>
        </div>
      ),
    },
    {
      title: "Plan",
      dataIndex: "plan",
      key: "plan",
      render: (plan: string) => (
        <Tag
          style={{
            background: `${planColors[plan]}18`,
            border: `1px solid ${planColors[plan]}40`,
            color: planColors[plan],
            borderRadius: 6,
            fontSize: 11,
            fontWeight: 600,
          }}
        >
          {plan}
        </Tag>
      ),
    },
    {
      title: "Credits",
      dataIndex: "credits",
      key: "credits",
      render: (credits: number) => (
        <Text style={{ color: credits === 0 ? "#f87171" : "#fff", fontWeight: 500, fontSize: 13 }}>
          {credits}
        </Text>
      ),
    },
    {
      title: "Generations",
      dataIndex: "generations",
      key: "generations",
      render: (v: number) => <Text style={{ color: "rgba(255,255,255,0.7)", fontSize: 13 }}>{v}</Text>,
    },
    {
      title: "Joined",
      dataIndex: "joined",
      key: "joined",
      render: (v: string) => <Text style={{ color: "rgba(255,255,255,0.45)", fontSize: 12 }}>{v}</Text>,
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status: string) => (
        <Tag
          style={{
            background: status === "Active" ? "rgba(137,233,0,0.12)" : "rgba(248,113,113,0.12)",
            border: `1px solid ${status === "Active" ? "rgba(137,233,0,0.3)" : "rgba(248,113,113,0.3)"}`,
            color: status === "Active" ? ACCENT : "#f87171",
            borderRadius: 20,
            fontSize: 11,
            fontWeight: 600,
            padding: "2px 10px",
          }}
        >
          ● {status}
        </Tag>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      align: "right" as const,
      render: (_: unknown, record: typeof initialUsers[0]) => (
        <Dropdown
          menu={{
            items: [
              {
                key: "toggle",
                label: record.status === "Active" ? "Suspend User" : "Activate User",
                icon: record.status === "Active"
                  ? <NoSymbolIcon style={{ width: 14, height: 14 }} />
                  : <CheckCircleIcon style={{ width: 14, height: 14 }} />,
                onClick: () => toggleStatus(record.id),
              },
              {
                key: "reset",
                label: "Reset Password",
                icon: <KeyIcon style={{ width: 14, height: 14 }} />,
              },
              {
                key: "login",
                label: "Login as User",
                icon: <ArrowRightOnRectangleIcon style={{ width: 14, height: 14 }} />,
              },
              { type: "divider" as const },
              {
                key: "delete",
                label: "Delete User",
                icon: <TrashIcon style={{ width: 14, height: 14 }} />,
                danger: true,
              },
            ],
          }}
          trigger={["click"]}
        >
          <Button
            type="text"
            size="small"
            icon={<EllipsisVerticalIcon style={{ width: 16, height: 16, color: "rgba(255,255,255,0.5)" }} />}
            style={{ width: 32, height: 32, padding: 0, display: "flex", alignItems: "center", justifyContent: "center" }}
          />
        </Dropdown>
      ),
    },
  ];

  return (
    <div style={{ fontFamily: '"SF Pro Display", -apple-system, BlinkMacSystemFont, "Inter", sans-serif' }}>
      <div style={{ marginBottom: 24, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <Title level={3} style={{ color: "#fff", margin: 0, fontWeight: 700, letterSpacing: "-0.5px" }}>
            Users
          </Title>
          <Text style={{ color: "rgba(255,255,255,0.4)", fontSize: 13 }}>
            {users.length} total users · {users.filter((u) => u.status === "Active").length} active
          </Text>
        </div>
        <Button
          icon={<UserPlusIcon style={{ width: 15, height: 15 }} />}
          style={{
            background: ACCENT,
            border: "none",
            color: "#000",
            fontWeight: 600,
            borderRadius: 8,
            height: 36,
            display: "flex",
            alignItems: "center",
            gap: 6,
          }}
        >
          Add User
        </Button>
      </div>

      <Card
        style={{ background: CARD_BG, border: `1px solid ${BORDER}`, borderRadius: 12 }}
        styles={{ body: { padding: 0 } }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "14px 16px", borderBottom: `1px solid ${BORDER}` }}>
          <Input
            prefix={<MagnifyingGlassIcon style={{ width: 15, height: 15, color: "rgba(255,255,255,0.3)" }} />}
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ maxWidth: 280, background: "#333", border: `1px solid #444`, borderRadius: 8, color: "#fff" }}
            variant="borderless"
          />
          <Select
            value={planFilter}
            onChange={setPlanFilter}
            style={{ width: 120 }}
            options={[
              { label: "All Plans", value: "all" },
              { label: "Pro", value: "Pro" },
              { label: "Starter", value: "Starter" },
              { label: "Free", value: "Free" },
            ]}
          />
          <div style={{ flex: 1 }} />
          <Tooltip title="Filter">
            <Button
              type="text"
              icon={<FunnelIcon style={{ width: 16, height: 16, color: "rgba(255,255,255,0.5)" }} />}
              style={{ height: 34, width: 34, padding: 0, display: "flex", alignItems: "center", justifyContent: "center" }}
            />
          </Tooltip>
        </div>

        <Table
          dataSource={filtered}
          columns={columns}
          rowKey="id"
          pagination={{ pageSize: 8, size: "small" }}
          style={{ background: "transparent" }}
          onRow={() => ({
            style: { cursor: "pointer" },
          })}
        />
      </Card>
    </div>
  );
}
