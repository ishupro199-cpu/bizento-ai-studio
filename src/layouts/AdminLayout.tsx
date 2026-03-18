import { useState } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { ConfigProvider, Layout, Menu, Avatar, Badge, Input, Dropdown, Button, theme } from "antd";
import {
  HomeIcon,
  UsersIcon,
  CreditCardIcon,
  BoltIcon,
  CpuChipIcon,
  FolderIcon,
  ChartBarIcon,
  MegaphoneIcon,
  RectangleStackIcon,
  DocumentTextIcon,
  BookOpenIcon,
  BellIcon,
  Cog6ToothIcon,
  LifebuoyIcon,
  ClipboardDocumentListIcon,
  MagnifyingGlassIcon,
  SparklesIcon,
  ChevronDoubleLeftIcon,
  ChevronDoubleRightIcon,
  ArrowRightOnRectangleIcon,
  UserCircleIcon,
  ShieldCheckIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";
import { BellIcon as BellSolid } from "@heroicons/react/24/solid";
import { useAuth } from "@/contexts/AuthContext";

const { Sider, Content, Header } = Layout;

const ACCENT = "#89E900";
const SIDEBAR_BG = "#181818";
const HEADER_BG = "#1e1e1e";
const CONTENT_BG = "#1a1a1a";
const CARD_BG = "#242424";
const BORDER = "#2e2e2e";

const adminTheme = {
  algorithm: theme.darkAlgorithm,
  token: {
    colorPrimary: ACCENT,
    colorBgBase: CONTENT_BG,
    colorBgContainer: CARD_BG,
    colorBgElevated: "#2e2e2e",
    colorBorder: BORDER,
    colorBorderSecondary: BORDER,
    borderRadius: 10,
    fontFamily:
      '"SF Pro Display", "SF Pro Text", -apple-system, BlinkMacSystemFont, "Inter", "Segoe UI", system-ui, sans-serif',
    colorText: "rgba(255,255,255,0.90)",
    colorTextSecondary: "rgba(255,255,255,0.50)",
    fontSize: 14,
  },
  components: {
    Menu: {
      darkItemBg: "transparent",
      darkItemSelectedBg: "rgba(137,233,0,0.10)",
      darkItemSelectedColor: ACCENT,
      darkItemHoverBg: "rgba(255,255,255,0.05)",
      darkItemHoverColor: "#fff",
      itemBorderRadius: 8,
    },
    Table: {
      headerBg: "#1e1e1e",
      rowHoverBg: "rgba(255,255,255,0.03)",
      borderColor: BORDER,
    },
    Input: {
      colorBgContainer: "#242424",
    },
    Button: {
      primaryColor: "#000",
    },
    Modal: {
      contentBg: "#242424",
      headerBg: "#242424",
    },
    Select: {
      optionSelectedBg: "rgba(137,233,0,0.10)",
    },
  },
};

const menuGroups = [
  {
    label: "Overview",
    items: [
      { key: "/admin", label: "Dashboard", icon: HomeIcon },
      { key: "/admin/analytics", label: "Analytics", icon: ChartBarIcon },
    ],
  },
  {
    label: "Management",
    items: [
      { key: "/admin/users", label: "Users", icon: UsersIcon },
      { key: "/admin/billing", label: "Billing & Plans", icon: CreditCardIcon },
      { key: "/admin/credits", label: "Credits", icon: BoltIcon },
      { key: "/admin/ai-tools", label: "AI Tools", icon: CpuChipIcon },
      { key: "/admin/projects", label: "Projects", icon: FolderIcon },
    ],
  },
  {
    label: "Content",
    items: [
      { key: "/admin/marketing", label: "Marketing", icon: MegaphoneIcon },
      { key: "/admin/cms", label: "CMS", icon: RectangleStackIcon },
      { key: "/admin/blog", label: "Blog", icon: DocumentTextIcon },
      { key: "/admin/prompts", label: "Prompt Library", icon: BookOpenIcon },
    ],
  },
  {
    label: "System",
    items: [
      { key: "/admin/notifications", label: "Notifications", icon: BellIcon },
      { key: "/admin/moderation", label: "Moderation", icon: ExclamationTriangleIcon },
      { key: "/admin/support", label: "Support", icon: LifebuoyIcon },
      { key: "/admin/settings", label: "Settings", icon: Cog6ToothIcon },
      { key: "/admin/logs", label: "Admin Logs", icon: ClipboardDocumentListIcon },
      { key: "/admin/system", label: "System", icon: ShieldCheckIcon },
    ],
  },
];

const allMenuItems = menuGroups.flatMap((g) => g.items);

export function AdminLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { signOut, user } = useAuth();

  const activeKey =
    allMenuItems
      .slice()
      .reverse()
      .find((item) => location.pathname === item.key || location.pathname.startsWith(item.key + "/"))?.key ||
    "/admin";

  const profileMenuItems = [
    {
      key: "profile",
      label: "Profile",
      icon: <UserCircleIcon style={{ width: 14, height: 14 }} />,
    },
    {
      key: "logout",
      label: "Sign out",
      icon: <ArrowRightOnRectangleIcon style={{ width: 14, height: 14 }} />,
      danger: true,
    },
  ];

  const antMenuItems = menuGroups.map((group) => ({
    key: `group-${group.label}`,
    type: "group" as const,
    label: !collapsed ? (
      <span style={{ fontSize: 10, fontWeight: 600, letterSpacing: "0.8px", color: "rgba(255,255,255,0.25)", textTransform: "uppercase" }}>
        {group.label}
      </span>
    ) : null,
    children: group.items.map((item) => ({
      key: item.key,
      icon: (
        <item.icon
          style={{
            width: 17,
            height: 17,
            color: activeKey === item.key ? ACCENT : "rgba(255,255,255,0.45)",
            flexShrink: 0,
          }}
        />
      ),
      label: (
        <span
          style={{
            fontSize: 13,
            fontWeight: activeKey === item.key ? 600 : 400,
            letterSpacing: "-0.1px",
          }}
        >
          {item.label}
        </span>
      ),
      style: { marginBottom: 1, borderRadius: 8, height: 38 },
    })),
  }));

  return (
    <ConfigProvider theme={adminTheme}>
      <Layout style={{ minHeight: "100vh", background: CONTENT_BG }}>
        <Sider
          collapsible
          collapsed={collapsed}
          trigger={null}
          width={224}
          collapsedWidth={64}
          style={{
            background: SIDEBAR_BG,
            borderRight: `1px solid ${BORDER}`,
            position: "fixed",
            left: 0,
            top: 0,
            bottom: 0,
            zIndex: 100,
            display: "flex",
            flexDirection: "column",
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: collapsed ? "18px 0" : "18px 16px",
                justifyContent: collapsed ? "center" : "flex-start",
                borderBottom: `1px solid ${BORDER}`,
              }}
            >
              <div
                style={{
                  width: 30,
                  height: 30,
                  borderRadius: 8,
                  background: ACCENT,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <SparklesIcon style={{ width: 15, height: 15, color: "#000" }} />
              </div>
              {!collapsed && (
                <div>
                  <div style={{ fontWeight: 700, fontSize: 14, color: "#fff", letterSpacing: "-0.3px", lineHeight: 1.2 }}>
                    Pixalera
                  </div>
                  <div style={{ fontSize: 9, color: ACCENT, fontWeight: 700, letterSpacing: "1px" }}>ADMIN PANEL</div>
                </div>
              )}
            </div>

            {!collapsed && (
              <div
                style={{
                  margin: "10px 10px 4px",
                  padding: "10px 12px",
                  borderRadius: 10,
                  background: "rgba(255,255,255,0.04)",
                  border: `1px solid ${BORDER}`,
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                }}
              >
                <Avatar
                  size={32}
                  style={{ background: ACCENT, color: "#000", fontWeight: 700, fontSize: 12, flexShrink: 0 }}
                >
                  {(user?.email?.[0] || "A").toUpperCase()}
                </Avatar>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 12, color: "#fff", fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {user?.email?.split("@")[0] || "Admin"}
                  </div>
                  <div style={{ fontSize: 10, color: ACCENT, fontWeight: 600 }}>Super Admin</div>
                </div>
                <Cog6ToothIcon style={{ width: 14, height: 14, color: "rgba(255,255,255,0.35)", flexShrink: 0 }} />
              </div>
            )}

            <div style={{ flex: 1, overflow: "auto", paddingTop: 4 }}>
              <Menu
                mode="inline"
                theme="dark"
                selectedKeys={[activeKey]}
                style={{ background: "transparent", border: "none", padding: "0 8px" }}
                onClick={({ key }) => navigate(key)}
                items={antMenuItems}
              />
            </div>

            <div
              style={{
                borderTop: `1px solid ${BORDER}`,
                padding: "10px 8px",
              }}
            >
              <button
                onClick={() => signOut()}
                style={{
                  width: "100%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: collapsed ? "center" : "flex-start",
                  gap: 8,
                  padding: "8px 10px",
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                  color: "rgba(248,113,113,0.7)",
                  borderRadius: 8,
                  fontSize: 12,
                  transition: "all 0.2s",
                  marginBottom: 4,
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(248,113,113,0.08)")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
              >
                <ArrowRightOnRectangleIcon style={{ width: 15, height: 15, flexShrink: 0 }} />
                {!collapsed && <span>Sign out</span>}
              </button>
              <button
                onClick={() => setCollapsed(!collapsed)}
                style={{
                  width: "100%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: collapsed ? "center" : "flex-end",
                  gap: 6,
                  padding: "7px 10px",
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                  color: "rgba(255,255,255,0.3)",
                  borderRadius: 8,
                  fontSize: 11,
                  transition: "all 0.2s",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.05)")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
              >
                {collapsed ? (
                  <ChevronDoubleRightIcon style={{ width: 14, height: 14 }} />
                ) : (
                  <>
                    <span>Collapse</span>
                    <ChevronDoubleLeftIcon style={{ width: 14, height: 14 }} />
                  </>
                )}
              </button>
            </div>
          </div>
        </Sider>

        <Layout style={{ marginLeft: collapsed ? 64 : 224, transition: "margin-left 0.2s", background: CONTENT_BG }}>
          <Header
            style={{
              background: HEADER_BG,
              borderBottom: `1px solid ${BORDER}`,
              padding: "0 20px",
              display: "flex",
              alignItems: "center",
              gap: 12,
              position: "sticky",
              top: 0,
              zIndex: 50,
              height: 54,
            }}
          >
            <div style={{ flex: 1 }}>
              <Input
                prefix={<MagnifyingGlassIcon style={{ width: 14, height: 14, color: "rgba(255,255,255,0.3)" }} />}
                placeholder="Search users, generations..."
                style={{
                  maxWidth: 300,
                  background: "#242424",
                  border: `1px solid ${BORDER}`,
                  borderRadius: 8,
                  color: "#fff",
                  fontSize: 13,
                  height: 34,
                }}
                variant="borderless"
              />
            </div>

            <Badge count={3} size="small" color={ACCENT}>
              <button
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: 8,
                  background: "rgba(255,255,255,0.05)",
                  border: `1px solid ${BORDER}`,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <BellSolid style={{ width: 15, height: 15, color: "rgba(255,255,255,0.6)" }} />
              </button>
            </Badge>

            <Dropdown
              menu={{
                items: profileMenuItems,
                onClick: ({ key }) => {
                  if (key === "logout") signOut();
                },
              }}
              trigger={["click"]}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  cursor: "pointer",
                  padding: "4px 8px",
                  borderRadius: 8,
                  border: `1px solid ${BORDER}`,
                  background: "rgba(255,255,255,0.04)",
                }}
              >
                <Avatar
                  size={24}
                  style={{ background: ACCENT, color: "#000", fontWeight: 700, fontSize: 11, flexShrink: 0 }}
                >
                  {(user?.email?.[0] || "A").toUpperCase()}
                </Avatar>
                <span style={{ fontSize: 12, color: "rgba(255,255,255,0.75)", fontWeight: 500, maxWidth: 110, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {user?.email?.split("@")[0] || "Admin"}
                </span>
              </div>
            </Dropdown>
          </Header>

          <Content style={{ padding: "22px 24px", minHeight: "calc(100vh - 54px)" }}>
            <Outlet />
          </Content>
        </Layout>
      </Layout>
    </ConfigProvider>
  );
}
