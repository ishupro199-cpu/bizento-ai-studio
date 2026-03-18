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
  PlusIcon,
} from "@heroicons/react/24/outline";
import { BellIcon as BellSolid } from "@heroicons/react/24/solid";
import { useAuth } from "@/contexts/AuthContext";

const { Sider, Content, Header } = Layout;

const ACCENT = "#89E900";
const SIDEBAR_BG = "#191919";
const HEADER_BG = "#1e1e1e";
const CONTENT_BG = "#222222";
const CARD_BG = "#2a2a2a";
const BORDER = "#333333";

const adminTheme = {
  algorithm: theme.darkAlgorithm,
  token: {
    colorPrimary: ACCENT,
    colorBgBase: CONTENT_BG,
    colorBgContainer: CARD_BG,
    colorBgElevated: "#333",
    colorBorder: BORDER,
    colorBorderSecondary: BORDER,
    borderRadius: 10,
    fontFamily:
      '"SF Pro Display", "SF Pro Text", -apple-system, BlinkMacSystemFont, "Inter", "Segoe UI", system-ui, sans-serif',
    colorText: "rgba(255,255,255,0.92)",
    colorTextSecondary: "rgba(255,255,255,0.55)",
    fontSize: 14,
  },
  components: {
    Menu: {
      darkItemBg: "transparent",
      darkItemSelectedBg: "rgba(137,233,0,0.12)",
      darkItemSelectedColor: ACCENT,
      darkItemHoverBg: "rgba(255,255,255,0.06)",
      darkItemHoverColor: "#fff",
      itemBorderRadius: 8,
    },
    Table: {
      headerBg: "#252525",
      rowHoverBg: "rgba(255,255,255,0.04)",
    },
    Input: {
      colorBgContainer: "#2c2c2c",
    },
    Button: {
      primaryColor: "#000",
    },
  },
};

const menuItems = [
  { key: "/admin", label: "Dashboard", icon: HomeIcon },
  { key: "/admin/users", label: "Users", icon: UsersIcon },
  { key: "/admin/billing", label: "Billing & Plans", icon: CreditCardIcon },
  { key: "/admin/credits", label: "Credits", icon: BoltIcon },
  { key: "/admin/ai-tools", label: "AI Tools", icon: CpuChipIcon },
  { key: "/admin/projects", label: "Projects", icon: FolderIcon },
  { key: "/admin/analytics", label: "Analytics", icon: ChartBarIcon },
  { key: "/admin/marketing", label: "Marketing", icon: MegaphoneIcon },
  { key: "/admin/cms", label: "CMS", icon: RectangleStackIcon },
  { key: "/admin/blog", label: "Blog", icon: DocumentTextIcon },
  { key: "/admin/prompts", label: "Prompt Library", icon: BookOpenIcon },
  { key: "/admin/notifications", label: "Notifications", icon: BellIcon },
  { key: "/admin/settings", label: "Settings", icon: Cog6ToothIcon },
  { key: "/admin/support", label: "Support", icon: LifebuoyIcon },
  { key: "/admin/logs", label: "Logs", icon: ClipboardDocumentListIcon },
];

export function AdminLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { signOut, user } = useAuth();

  const activeKey =
    menuItems
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

  return (
    <ConfigProvider theme={adminTheme}>
      <Layout style={{ minHeight: "100vh", background: CONTENT_BG }}>
        <Sider
          collapsible
          collapsed={collapsed}
          trigger={null}
          width={228}
          collapsedWidth={64}
          style={{
            background: SIDEBAR_BG,
            borderRight: `1px solid ${BORDER}`,
            position: "fixed",
            left: 0,
            top: 0,
            bottom: 0,
            zIndex: 100,
            overflow: "auto",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: collapsed ? "20px 0" : "20px 16px",
              justifyContent: collapsed ? "center" : "flex-start",
              borderBottom: `1px solid ${BORDER}`,
              marginBottom: 8,
            }}
          >
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: 8,
                background: ACCENT,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <SparklesIcon style={{ width: 16, height: 16, color: "#000" }} />
            </div>
            {!collapsed && (
              <div>
                <div
                  style={{
                    fontWeight: 700,
                    fontSize: 15,
                    color: "#fff",
                    letterSpacing: "-0.3px",
                    lineHeight: 1.2,
                  }}
                >
                  Pixalera
                </div>
                <div style={{ fontSize: 10, color: ACCENT, fontWeight: 600, letterSpacing: "0.5px" }}>
                  ADMIN
                </div>
              </div>
            )}
          </div>

          <Menu
            mode="inline"
            theme="dark"
            selectedKeys={[activeKey]}
            style={{ background: "transparent", border: "none", padding: "0 8px" }}
            onClick={({ key }) => navigate(key)}
            items={menuItems.map((item) => ({
              key: item.key,
              icon: (
                <item.icon
                  style={{
                    width: 18,
                    height: 18,
                    color: activeKey === item.key ? ACCENT : "rgba(255,255,255,0.55)",
                    flexShrink: 0,
                  }}
                />
              ),
              label: (
                <span
                  style={{
                    fontSize: 13.5,
                    fontWeight: activeKey === item.key ? 600 : 400,
                    letterSpacing: "-0.1px",
                  }}
                >
                  {item.label}
                </span>
              ),
              style: { marginBottom: 2, borderRadius: 8, height: 40 },
            }))}
          />

          <div
            style={{
              position: "absolute",
              bottom: 0,
              left: 0,
              right: 0,
              padding: "12px 8px",
              borderTop: `1px solid ${BORDER}`,
            }}
          >
            <button
              onClick={() => setCollapsed(!collapsed)}
              style={{
                width: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: collapsed ? "center" : "flex-end",
                gap: 6,
                padding: "8px 12px",
                background: "transparent",
                border: "none",
                cursor: "pointer",
                color: "rgba(255,255,255,0.4)",
                borderRadius: 8,
                fontSize: 12,
                transition: "all 0.2s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.06)")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
            >
              {collapsed ? (
                <ChevronDoubleRightIcon style={{ width: 16, height: 16 }} />
              ) : (
                <>
                  <span>Collapse</span>
                  <ChevronDoubleLeftIcon style={{ width: 16, height: 16 }} />
                </>
              )}
            </button>
          </div>
        </Sider>

        <Layout style={{ marginLeft: collapsed ? 64 : 228, transition: "margin-left 0.2s", background: CONTENT_BG }}>
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
              height: 56,
            }}
          >
            <Input
              prefix={<MagnifyingGlassIcon style={{ width: 15, height: 15, color: "rgba(255,255,255,0.35)" }} />}
              placeholder="Search..."
              style={{
                maxWidth: 280,
                background: "#2c2c2c",
                border: `1px solid ${BORDER}`,
                borderRadius: 8,
                color: "#fff",
                fontSize: 13,
              }}
              variant="borderless"
            />

            <div style={{ flex: 1 }} />

            <Button
              size="small"
              icon={<PlusIcon style={{ width: 14, height: 14 }} />}
              style={{
                background: ACCENT,
                border: "none",
                color: "#000",
                fontWeight: 600,
                borderRadius: 7,
                fontSize: 12,
                height: 30,
                display: "flex",
                alignItems: "center",
                gap: 4,
              }}
            >
              Quick Action
            </Button>

            <Badge count={3} size="small">
              <button
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: 8,
                  background: "rgba(255,255,255,0.06)",
                  border: `1px solid ${BORDER}`,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <BellSolid style={{ width: 16, height: 16, color: "rgba(255,255,255,0.7)" }} />
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
                  size={26}
                  style={{ background: ACCENT, color: "#000", fontWeight: 700, fontSize: 12, flexShrink: 0 }}
                >
                  {(user?.email?.[0] || "A").toUpperCase()}
                </Avatar>
                <span style={{ fontSize: 12, color: "rgba(255,255,255,0.8)", fontWeight: 500, maxWidth: 110, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {user?.email?.split("@")[0] || "Admin"}
                </span>
              </div>
            </Dropdown>
          </Header>

          <Content style={{ padding: 24, minHeight: "calc(100vh - 56px)" }}>
            <Outlet />
          </Content>
        </Layout>
      </Layout>
    </ConfigProvider>
  );
}
