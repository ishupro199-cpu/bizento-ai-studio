import {
  BoltIcon,
  SparklesIcon,
  BellIcon,
  ChevronDownIcon,
  Bars3Icon,
} from "@heroicons/react/24/outline";
import { BoltIcon as BoltSolid } from "@heroicons/react/24/solid";
import { ConfigProvider, Dropdown, Badge, theme } from "antd";
import { useAppContext } from "@/contexts/AppContext";

const models = [
  { id: "flash" as const, name: "Pixa Flash", desc: "Fast generation · 1 credit", icon: BoltIcon },
  { id: "pro" as const, name: "Pixa Pro", desc: "Highest quality · 2 credits", icon: SparklesIcon },
];

interface TopNavbarProps {
  onMenuToggle?: () => void;
}

export function TopNavbar({ onMenuToggle }: TopNavbarProps) {
  const { selectedModel, setSelectedModel, user, setShowUpgradeModal } = useAppContext();
  const currentModel = models.find((m) => m.id === selectedModel) || models[0];
  const isFree = user.plan === "free";

  const modelMenuItems = models.map((model) => ({
    key: model.id,
    label: (
      <div className="flex flex-col gap-0.5 py-0.5">
        <span className="flex items-center gap-1.5 text-[13px] font-semibold" style={{ color: selectedModel === model.id ? "#89E900" : "rgba(255,255,255,0.85)" }}>
          <model.icon className="h-3.5 w-3.5" />
          {model.name}
          {model.id === "pro" && <SparklesIcon className="h-3 w-3" style={{ color: "#89E900" }} />}
        </span>
        <span className="text-[12px]" style={{ color: "rgba(255,255,255,0.4)" }}>{model.desc}</span>
      </div>
    ),
  }));

  return (
    <ConfigProvider theme={{
      algorithm: theme.darkAlgorithm,
      token: { colorPrimary: "#89E900", colorBgElevated: "rgba(16,18,24,0.96)", colorBorder: "rgba(255,255,255,0.08)", borderRadius: 10, colorText: "rgba(255,255,255,0.85)" },
    }}>
      <header
        className="h-14 flex items-center justify-between px-3 sm:px-4 sticky top-0 z-20"
        style={{
          background: "transparent",
          border: "none",
        }}
      >
        <div className="flex items-center gap-2 sm:gap-3">
          {onMenuToggle && (
            <button
              onClick={onMenuToggle}
              className="h-8 w-8 flex items-center justify-center rounded-lg transition-colors sm:hidden hover:bg-white/5"
              style={{ color: "rgba(255,255,255,0.45)" }}
            >
              <Bars3Icon className="h-4 w-4" />
            </button>
          )}

          {/* Model Selector */}
          <Dropdown
            menu={{
              items: modelMenuItems,
              selectedKeys: [selectedModel],
              onClick: ({ key }) => {
                if (key === "pro" && !user.plan.match(/starter|pro/)) {
                  setShowUpgradeModal(true);
                  return;
                }
                setSelectedModel(key as "flash" | "pro");
              },
              style: {
                background: "rgba(14,16,22,0.97)",
                border: "1px solid rgba(255,255,255,0.08)",
                backdropFilter: "blur(40px)",
                borderRadius: 12,
                padding: "4px",
                minWidth: 200,
              },
            }}
            trigger={["click"]}
            placement="bottomLeft"
          >
            <button
              className="flex items-center gap-2 h-9 px-3 rounded-lg hover:bg-white/5 transition-colors outline-none"
            >
              <currentModel.icon className="h-3.5 w-3.5 shrink-0" style={{ color: "#89E900" }} />
              <span className="text-[13px] font-semibold" style={{ color: "rgba(255,255,255,0.85)" }}>
                {currentModel.name}
              </span>
              <ChevronDownIcon className="h-3.5 w-3.5 shrink-0" style={{ color: "rgba(255,255,255,0.3)" }} />
            </button>
          </Dropdown>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Credits chip */}
          <div
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm"
            style={{
              background: "rgba(137,233,0,0.08)",
              border: "1px solid rgba(137,233,0,0.15)",
            }}
          >
            <BoltSolid className="h-3.5 w-3.5" style={{ color: "#89E900" }} />
            <span className="font-semibold" style={{ color: "#89E900" }}>{user.creditsRemaining}</span>
            <span className="hidden sm:inline text-[12px]" style={{ color: "rgba(255,255,255,0.4)" }}>credits</span>
          </div>

          {/* Upgrade button — only shown for free plan users */}
          {isFree && (
            <button
              className="hidden sm:flex items-center gap-1.5 h-8 px-4 rounded-lg text-[12px] font-bold transition-all hover:scale-[1.02]"
              style={{ background: "#89E900", color: "#0D0F14" }}
              onClick={() => setShowUpgradeModal(true)}
            >
              Upgrade
            </button>
          )}

          {/* Bell */}
          <Badge dot style={{ background: "#89E900" }}>
            <button
              className="h-8 w-8 flex items-center justify-center rounded-lg hover:bg-white/5 transition-colors"
              style={{ color: "rgba(255,255,255,0.45)" }}
            >
              <BellIcon className="h-4 w-4" />
            </button>
          </Badge>
        </div>
      </header>
    </ConfigProvider>
  );
}
