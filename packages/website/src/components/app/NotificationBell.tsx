import { useState, useEffect, useRef } from "react";
import { BellIcon } from "@heroicons/react/24/outline";
import { BellIcon as BellSolid } from "@heroicons/react/24/solid";
import {
  collection,
  query,
  orderBy,
  limit,
  onSnapshot,
  doc,
  updateDoc,
  writeBatch,
  Timestamp,
  where,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/contexts/AuthContext";
import { useAppContext } from "@/contexts/AppContext";

interface Notification {
  id: string;
  title: string;
  body: string;
  type: string;
  target: string;
  imageUrl?: string;
  sentAt: Date;
  read: boolean;
  readBy?: string[];
}

const TYPE_COLORS: Record<string, string> = {
  info: "#60a5fa",
  success: "#89E900",
  warning: "#f59e0b",
  alert: "#f87171",
};

const TYPE_BG: Record<string, string> = {
  info: "rgba(96,165,250,0.12)",
  success: "rgba(137,233,0,0.10)",
  warning: "rgba(245,158,11,0.10)",
  alert: "rgba(248,113,113,0.10)",
};

function timeAgo(date: Date): string {
  const diff = Math.floor((Date.now() - date.getTime()) / 1000);
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

export function NotificationBell() {
  const { user } = useAuth();
  const { user: appUser } = useAppContext();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [open, setOpen] = useState(false);
  const popupRef = useRef<HTMLDivElement>(null);

  const userPlan = appUser?.plan || "free";

  useEffect(() => {
    const q = query(
      collection(db, "notifications"),
      orderBy("sentAt", "desc"),
      limit(20)
    );
    const unsub = onSnapshot(q, (snap) => {
      const all = snap.docs.map((d) => {
        const data = d.data();
        return {
          id: d.id,
          title: data.title || "",
          body: data.body || "",
          type: data.type || "info",
          target: data.target || "all",
          imageUrl: data.imageUrl || "",
          sentAt: data.sentAt instanceof Timestamp ? data.sentAt.toDate() : new Date(),
          read: (data.readBy || []).includes(user?.uid || ""),
          readBy: data.readBy || [],
        };
      });

      const visible = all.filter((n) => {
        if (n.target === "all") return true;
        if (n.target === "pro" && userPlan === "pro") return true;
        if (n.target === "starter" && (userPlan === "starter" || userPlan === "pro")) return true;
        if (n.target === "free" && userPlan === "free") return true;
        return false;
      });

      setNotifications(visible);
    });
    return () => unsub();
  }, [user?.uid, userPlan]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (popupRef.current && !popupRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAllRead = async () => {
    if (!user?.uid) return;
    const unread = notifications.filter((n) => !n.read);
    if (unread.length === 0) return;
    const batch = writeBatch(db);
    unread.forEach((n) => {
      batch.update(doc(db, "notifications", n.id), {
        readBy: [...(n.readBy || []), user.uid],
      });
    });
    await batch.commit().catch(() => {});
  };

  const markRead = async (n: Notification) => {
    if (!user?.uid || n.read) return;
    await updateDoc(doc(db, "notifications", n.id), {
      readBy: [...(n.readBy || []), user.uid],
    }).catch(() => {});
  };

  const handleOpen = () => {
    setOpen((o) => !o);
  };

  return (
    <div style={{ position: "relative" }} ref={popupRef}>
      <button
        onClick={handleOpen}
        className="h-8 w-8 flex items-center justify-center rounded-lg hover:bg-white/5 transition-colors relative"
        style={{ color: unreadCount > 0 ? "#89E900" : "rgba(255,255,255,0.45)" }}
        aria-label="Notifications"
      >
        {unreadCount > 0 ? (
          <BellSolid className="h-4 w-4" />
        ) : (
          <BellIcon className="h-4 w-4" />
        )}
        {unreadCount > 0 && (
          <span
            style={{
              position: "absolute",
              top: 2,
              right: 2,
              width: 14,
              height: 14,
              borderRadius: "50%",
              background: "#89E900",
              color: "#000",
              fontSize: 9,
              fontWeight: 800,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              border: "1.5px solid #111",
            }}
          >
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div
          style={{
            position: "absolute",
            right: 0,
            top: "calc(100% + 8px)",
            width: 340,
            maxHeight: 420,
            background: "rgba(14,16,22,0.98)",
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: 14,
            boxShadow: "0 24px 48px rgba(0,0,0,0.6)",
            backdropFilter: "blur(40px)",
            zIndex: 9999,
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
          }}
        >
          {/* Header */}
          <div
            style={{
              padding: "14px 16px",
              borderBottom: "1px solid rgba(255,255,255,0.07)",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 14, fontWeight: 700, color: "#fff" }}>Notifications</span>
              {unreadCount > 0 && (
                <span
                  style={{
                    background: "rgba(137,233,0,0.15)",
                    border: "1px solid rgba(137,233,0,0.3)",
                    color: "#89E900",
                    fontSize: 11,
                    fontWeight: 700,
                    padding: "1px 7px",
                    borderRadius: 20,
                  }}
                >
                  {unreadCount} new
                </span>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                onClick={markAllRead}
                style={{
                  fontSize: 12,
                  color: "#89E900",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  fontWeight: 600,
                }}
              >
                Mark all read
              </button>
            )}
          </div>

          {/* List */}
          <div style={{ overflowY: "auto", flex: 1 }}>
            {notifications.length === 0 ? (
              <div style={{ padding: "40px 20px", textAlign: "center" }}>
                <BellIcon style={{ width: 32, height: 32, color: "rgba(255,255,255,0.15)", margin: "0 auto 10px" }} />
                <p style={{ color: "rgba(255,255,255,0.35)", fontSize: 13 }}>No notifications yet</p>
              </div>
            ) : (
              notifications.map((n) => (
                <div
                  key={n.id}
                  onClick={() => markRead(n)}
                  style={{
                    padding: "12px 16px",
                    borderBottom: "1px solid rgba(255,255,255,0.05)",
                    cursor: "pointer",
                    background: n.read ? "transparent" : "rgba(137,233,0,0.03)",
                    transition: "background 0.15s",
                    display: "flex",
                    gap: 12,
                    alignItems: "flex-start",
                  }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.background = "rgba(255,255,255,0.04)"; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.background = n.read ? "transparent" : "rgba(137,233,0,0.03)"; }}
                >
                  {/* Icon or image */}
                  <div
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: 10,
                      flexShrink: 0,
                      overflow: "hidden",
                      background: TYPE_BG[n.type] || TYPE_BG.info,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {n.imageUrl ? (
                      <img src={n.imageUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    ) : (
                      <BellIcon style={{ width: 16, height: 16, color: TYPE_COLORS[n.type] || TYPE_COLORS.info }} />
                    )}
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 4 }}>
                      <p style={{ fontSize: 13, fontWeight: n.read ? 500 : 700, color: n.read ? "rgba(255,255,255,0.75)" : "#fff", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {n.title}
                      </p>
                      {!n.read && (
                        <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#89E900", flexShrink: 0 }} />
                      )}
                    </div>
                    <p style={{ fontSize: 12, color: "rgba(255,255,255,0.45)", margin: "2px 0 0", lineHeight: 1.4, overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>
                      {n.body}
                    </p>
                    <p style={{ fontSize: 11, color: "rgba(255,255,255,0.25)", margin: "4px 0 0" }}>
                      {timeAgo(n.sentAt)}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
