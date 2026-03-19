import { useState, useEffect } from "react";
import { Card, Table, Tag, Typography, Select, Skeleton, Row, Col } from "antd";
import {
  CreditCardIcon,
  CurrencyRupeeIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
} from "@heroicons/react/24/outline";
import {
  collection,
  query,
  orderBy,
  limit,
  onSnapshot,
  Timestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { format } from "date-fns";

const CARD_BG = "#242424";
const BORDER = "#2e2e2e";
const ACCENT = "#89E900";

const { Title, Text } = Typography;

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  success: { label: "Paid",    color: ACCENT,    bg: "rgba(137,233,0,0.10)" },
  pending: { label: "Pending", color: "#f59e0b", bg: "rgba(245,158,11,0.10)" },
  failed:  { label: "Failed",  color: "#f87171", bg: "rgba(248,113,113,0.10)" },
};

const PLAN_COLORS: Record<string, string> = {
  pro: "#a78bfa",
  starter: "#60a5fa",
  free: "#6b7280",
};

interface Payment {
  id: string;
  userId: string;
  plan: string;
  amount: number;
  gstAmount: number;
  totalAmount: number;
  credits: number;
  bonusCredits: number;
  status: string;
  razorpayPaymentId: string;
  createdAt: Date;
}

export default function AdminBillingPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    const q = query(
      collection(db, "payments"),
      orderBy("createdAt", "desc"),
      limit(100)
    );

    const unsub = onSnapshot(q, (snap) => {
      setPayments(
        snap.docs.map((d) => {
          const data = d.data();
          const raw = data.createdAt;
          return {
            id: d.id,
            userId: data.userId || "",
            plan: data.plan || "free",
            amount: data.amount || 0,
            gstAmount: data.gstAmount || 0,
            totalAmount: data.totalAmount || 0,
            credits: data.credits || 0,
            bonusCredits: data.bonusCredits || 0,
            status: data.status || "pending",
            razorpayPaymentId: data.razorpayPaymentId || "",
            createdAt: raw instanceof Timestamp ? raw.toDate() : raw ? new Date(raw) : new Date(),
          };
        })
      );
      setLoading(false);
    }, () => setLoading(false));

    return () => unsub();
  }, []);

  const filtered = payments.filter(
    (p) => statusFilter === "all" || p.status === statusFilter
  );

  const totalRevenue = payments
    .filter((p) => p.status === "success")
    .reduce((sum, p) => sum + p.totalAmount, 0);

  const successCount = payments.filter((p) => p.status === "success").length;
  const pendingCount = payments.filter((p) => p.status === "pending").length;
  const failedCount = payments.filter((p) => p.status === "failed").length;

  const summaryCards = [
    { label: "Total Revenue", value: `₹${totalRevenue.toFixed(2)}`, icon: CurrencyRupeeIcon, color: ACCENT, bg: "rgba(137,233,0,0.10)" },
    { label: "Successful", value: successCount, icon: CheckCircleIcon, color: "#34d399", bg: "rgba(52,211,153,0.10)" },
    { label: "Pending", value: pendingCount, icon: ClockIcon, color: "#f59e0b", bg: "rgba(245,158,11,0.10)" },
    { label: "Failed", value: failedCount, icon: XCircleIcon, color: "#f87171", bg: "rgba(248,113,113,0.10)" },
  ];

  const columns = [
    {
      title: "Payment ID",
      dataIndex: "razorpayPaymentId",
      key: "razorpayPaymentId",
      render: (id: string) => (
        <Text style={{ color: "rgba(255,255,255,0.5)", fontSize: 12, fontFamily: "monospace" }}>
          {id ? id.slice(0, 20) + "…" : "—"}
        </Text>
      ),
    },
    {
      title: "Plan",
      dataIndex: "plan",
      key: "plan",
      render: (plan: string) => (
        <Tag style={{
          background: `${PLAN_COLORS[plan] || "#6b7280"}18`,
          border: `1px solid ${PLAN_COLORS[plan] || "#6b7280"}35`,
          color: PLAN_COLORS[plan] || "#6b7280",
          borderRadius: 6, fontSize: 11, fontWeight: 600,
        }}>
          {plan.charAt(0).toUpperCase() + plan.slice(1)}
        </Tag>
      ),
    },
    {
      title: "Credits",
      key: "credits",
      render: (_: any, r: Payment) => (
        <Text style={{ color: "rgba(255,255,255,0.7)", fontSize: 13 }}>
          {r.credits}{r.bonusCredits > 0 ? ` + ${r.bonusCredits}` : ""}
        </Text>
      ),
    },
    {
      title: "Amount (INR)",
      key: "amount",
      render: (_: any, r: Payment) => (
        <div>
          <Text style={{ color: "#fff", fontSize: 13, fontWeight: 600 }}>₹{r.totalAmount.toFixed(2)}</Text>
          <Text style={{ color: "rgba(255,255,255,0.35)", fontSize: 11, display: "block" }}>
            ₹{r.amount.toFixed(2)} + ₹{r.gstAmount.toFixed(2)} GST
          </Text>
        </div>
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status: string) => {
        const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.pending;
        return (
          <Tag style={{ background: cfg.bg, border: `1px solid ${cfg.color}30`, color: cfg.color, borderRadius: 20, fontSize: 11, fontWeight: 600, padding: "2px 10px" }}>
            ● {cfg.label}
          </Tag>
        );
      },
    },
    {
      title: "Date",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (d: Date) => (
        <Text style={{ color: "rgba(255,255,255,0.35)", fontSize: 12 }}>
          {format(d, "MMM d, yyyy · h:mm a")}
        </Text>
      ),
    },
  ];

  return (
    <div style={{ fontFamily: '"SF Pro Display", -apple-system, BlinkMacSystemFont, "Inter", sans-serif' }}>
      <div style={{ marginBottom: 22 }}>
        <Title level={3} style={{ color: "#fff", margin: 0, fontWeight: 700, letterSpacing: "-0.5px", fontSize: 22 }}>
          Billing & Payments
        </Title>
        <Text style={{ color: "rgba(255,255,255,0.38)", fontSize: 13 }}>
          All Razorpay transactions
        </Text>
      </div>

      <Row gutter={[14, 14]} style={{ marginBottom: 16 }}>
        {summaryCards.map((s) => (
          <Col key={s.label} xs={12} sm={12} lg={6}>
            <Card
              style={{ background: CARD_BG, border: `1px solid ${BORDER}`, borderRadius: 14 }}
              styles={{ body: { padding: "18px 20px" } }}
            >
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
                <div>
                  <Text style={{ fontSize: 12, color: "rgba(255,255,255,0.42)", display: "block", marginBottom: 8 }}>{s.label}</Text>
                  {loading ? (
                    <Skeleton.Input active style={{ width: 80, height: 24 }} />
                  ) : (
                    <div style={{ fontSize: 24, fontWeight: 700, color: "#fff", letterSpacing: "-0.5px" }}>{s.value}</div>
                  )}
                </div>
                <div style={{ width: 40, height: 40, borderRadius: 10, background: s.bg, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <s.icon style={{ width: 20, height: 20, color: s.color }} />
                </div>
              </div>
            </Card>
          </Col>
        ))}
      </Row>

      <Card style={{ background: CARD_BG, border: `1px solid ${BORDER}`, borderRadius: 14 }} styles={{ body: { padding: 0 } }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "14px 16px", borderBottom: `1px solid ${BORDER}` }}>
          <Select
            value={statusFilter}
            onChange={setStatusFilter}
            style={{ width: 140 }}
            options={[
              { label: "All Status", value: "all" },
              { label: "Paid", value: "success" },
              { label: "Pending", value: "pending" },
              { label: "Failed", value: "failed" },
            ]}
          />
          <div style={{ flex: 1 }} />
          <Text style={{ fontSize: 12, color: "rgba(255,255,255,0.35)" }}>{filtered.length} records</Text>
        </div>

        {payments.length === 0 && !loading ? (
          <div style={{ padding: "48px 20px", textAlign: "center" }}>
            <CreditCardIcon style={{ width: 40, height: 40, color: "rgba(255,255,255,0.15)", margin: "0 auto 12px" }} />
            <Text style={{ color: "rgba(255,255,255,0.35)", fontSize: 14, display: "block" }}>No payments yet</Text>
            <Text style={{ color: "rgba(255,255,255,0.2)", fontSize: 12 }}>
              Payments will appear here after Razorpay is configured and users purchase plans
            </Text>
          </div>
        ) : (
          <Table
            dataSource={filtered}
            columns={columns}
            rowKey="id"
            loading={loading}
            pagination={{ pageSize: 15, size: "small", showTotal: (total) => <Text style={{ color: "rgba(255,255,255,0.35)", fontSize: 12 }}>{total} payments</Text> }}
            style={{ background: "transparent" }}
            size="small"
          />
        )}
      </Card>
    </div>
  );
}
