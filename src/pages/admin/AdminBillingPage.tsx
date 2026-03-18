import { useState, useEffect } from "react";
import { Card, Table, Tag, Typography, Button, Modal, Form, Input, InputNumber, Switch, message, Select } from "antd";
import {
  CreditCardIcon,
  PlusIcon,
  TrashIcon,
  PencilIcon,
  CheckCircleIcon,
} from "@heroicons/react/24/outline";
import { collection, onSnapshot, addDoc, deleteDoc, doc, setDoc, serverTimestamp, Timestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";

const ACCENT = "#89E900";
const CARD_BG = "#242424";
const BORDER = "#2e2e2e";
const { Title, Text } = Typography;

interface Plan {
  key: string;
  name: string;
  price: number;
  credits: number;
  features: string[];
  popular: boolean;
  active: boolean;
  createdAt: Date;
}

interface Transaction {
  key: string;
  userId: string;
  userEmail: string;
  plan: string;
  amount: number;
  status: string;
  createdAt: Date;
}

export default function AdminBillingPage() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [planLoading, setPlanLoading] = useState(true);
  const [txLoading, setTxLoading] = useState(true);
  const [planModal, setPlanModal] = useState<{ open: boolean; editing: Plan | null }>({ open: false, editing: null });
  const [form] = Form.useForm();
  const [saving, setSaving] = useState(false);
  const [messageApi, contextHolder] = message.useMessage();

  useEffect(() => {
    const unsub1 = onSnapshot(collection(db, "plans"), (snap) => {
      setPlans(snap.docs.map((d) => {
        const data = d.data();
        return { key: d.id, name: data.name || "", price: data.price || 0, credits: data.credits || 0, features: data.features || [], popular: data.popular || false, active: data.active ?? true, createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : new Date() };
      }));
      setPlanLoading(false);
    }, () => setPlanLoading(false));

    const unsub2 = onSnapshot(collection(db, "transactions"), (snap) => {
      setTransactions(snap.docs.map((d) => {
        const data = d.data();
        return { key: d.id, userId: data.userId || "", userEmail: data.userEmail || "", plan: data.plan || "", amount: data.amount || 0, status: data.status || "pending", createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : new Date() };
      }).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()));
      setTxLoading(false);
    }, () => setTxLoading(false));

    return () => { unsub1(); unsub2(); };
  }, []);

  const openCreate = () => {
    form.resetFields();
    setPlanModal({ open: true, editing: null });
  };

  const openEdit = (plan: Plan) => {
    form.setFieldsValue({ ...plan, features: plan.features.join("\n") });
    setPlanModal({ open: true, editing: plan });
  };

  const handleSave = async (values: any) => {
    setSaving(true);
    try {
      const data = { ...values, features: (values.features || "").split("\n").map((s: string) => s.trim()).filter(Boolean), updatedAt: serverTimestamp() };
      if (planModal.editing) {
        await setDoc(doc(db, "plans", planModal.editing.key), data, { merge: true });
        messageApi.success("Plan updated");
      } else {
        await addDoc(collection(db, "plans"), { ...data, createdAt: serverTimestamp() });
        messageApi.success("Plan created");
      }
      setPlanModal({ open: false, editing: null });
    } catch {
      messageApi.error("Failed to save plan");
    }
    setSaving(false);
  };

  const deletePlan = async (id: string) => {
    Modal.confirm({
      title: "Delete Plan",
      content: "Are you sure? This cannot be undone.",
      okText: "Delete",
      okButtonProps: { danger: true },
      onOk: async () => {
        try {
          await deleteDoc(doc(db, "plans", id));
          messageApi.success("Plan deleted");
        } catch {
          messageApi.error("Failed to delete");
        }
      },
    });
  };

  const revenue = transactions.filter((t) => t.status === "completed").reduce((sum, t) => sum + t.amount, 0);

  const planColumns = [
    {
      title: "Plan",
      key: "plan",
      render: (_: any, record: Plan) => (
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: "rgba(137,233,0,0.10)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <CreditCardIcon style={{ width: 16, height: 16, color: ACCENT }} />
          </div>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <Text style={{ color: "#fff", fontWeight: 600, fontSize: 13 }}>{record.name}</Text>
              {record.popular && <Tag style={{ background: "rgba(137,233,0,0.10)", border: "1px solid rgba(137,233,0,0.25)", color: ACCENT, borderRadius: 6, fontSize: 10, fontWeight: 700, lineHeight: "14px", padding: "1px 6px" }}>POPULAR</Tag>}
            </div>
            <Text style={{ color: "rgba(255,255,255,0.38)", fontSize: 12 }}>{record.credits} credits included</Text>
          </div>
        </div>
      ),
    },
    {
      title: "Price",
      dataIndex: "price",
      key: "price",
      render: (p: number) => <Text style={{ color: "#fff", fontWeight: 600, fontSize: 14 }}>${p}<span style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", fontWeight: 400 }}>/mo</span></Text>,
    },
    {
      title: "Status",
      dataIndex: "active",
      key: "active",
      render: (a: boolean) => (
        <Tag style={{ background: a ? "rgba(137,233,0,0.10)" : "rgba(255,255,255,0.05)", border: `1px solid ${a ? "rgba(137,233,0,0.25)" : "rgba(255,255,255,0.10)"}`, color: a ? ACCENT : "rgba(255,255,255,0.4)", borderRadius: 20, fontSize: 11, fontWeight: 600, padding: "2px 10px" }}>
          ● {a ? "Active" : "Inactive"}
        </Tag>
      ),
    },
    {
      title: "Features",
      dataIndex: "features",
      key: "features",
      render: (f: string[]) => <Text style={{ color: "rgba(255,255,255,0.45)", fontSize: 12 }}>{f.length} features</Text>,
    },
    {
      title: "",
      key: "actions",
      align: "right" as const,
      render: (_: any, record: Plan) => (
        <div style={{ display: "flex", gap: 6, justifyContent: "flex-end" }}>
          <Button type="text" size="small" icon={<PencilIcon style={{ width: 14, height: 14, color: "rgba(255,255,255,0.45)" }} />} style={{ height: 28, width: 28, padding: 0, display: "flex", alignItems: "center", justifyContent: "center" }} onClick={() => openEdit(record)} />
          <Button type="text" size="small" icon={<TrashIcon style={{ width: 14, height: 14, color: "#f87171" }} />} style={{ height: 28, width: 28, padding: 0, display: "flex", alignItems: "center", justifyContent: "center" }} onClick={() => deletePlan(record.key)} />
        </div>
      ),
    },
  ];

  const txColumns = [
    { title: "User", dataIndex: "userEmail", key: "userEmail", render: (e: string) => <Text style={{ color: "rgba(255,255,255,0.7)", fontSize: 13 }}>{e || "Anonymous"}</Text> },
    { title: "Plan", dataIndex: "plan", key: "plan", render: (p: string) => <Tag style={{ background: "rgba(167,139,250,0.10)", border: "1px solid rgba(167,139,250,0.25)", color: "#a78bfa", borderRadius: 6, fontSize: 11 }}>{p}</Tag> },
    { title: "Amount", dataIndex: "amount", key: "amount", render: (a: number) => <Text style={{ color: "#fff", fontWeight: 600, fontSize: 13 }}>${a.toFixed(2)}</Text> },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (s: string) => {
        const colors: Record<string, string> = { completed: ACCENT, pending: "#f59e0b", failed: "#f87171" };
        const c = colors[s] || "rgba(255,255,255,0.4)";
        return <Tag style={{ background: `${c}18`, border: `1px solid ${c}35`, color: c, borderRadius: 6, fontSize: 11, fontWeight: 600 }}>{s}</Tag>;
      },
    },
    { title: "Date", dataIndex: "createdAt", key: "createdAt", render: (d: Date) => <Text style={{ color: "rgba(255,255,255,0.3)", fontSize: 12 }}>{d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</Text> },
  ];

  return (
    <div style={{ fontFamily: '"SF Pro Display", -apple-system, BlinkMacSystemFont, "Inter", sans-serif' }}>
      {contextHolder}
      <div style={{ marginBottom: 22, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <Title level={3} style={{ color: "#fff", margin: 0, fontWeight: 700, letterSpacing: "-0.5px", fontSize: 22 }}>Billing & Plans</Title>
          <Text style={{ color: "rgba(255,255,255,0.38)", fontSize: 13 }}>Manage subscription plans and track transactions</Text>
        </div>
        <Button icon={<PlusIcon style={{ width: 15, height: 15 }} />} onClick={openCreate} style={{ background: ACCENT, border: "none", color: "#000", fontWeight: 600, borderRadius: 8, height: 36, display: "flex", alignItems: "center", gap: 6 }}>
          New Plan
        </Button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 18 }}>
        {[
          { label: "Total Plans", value: plans.length, color: ACCENT },
          { label: "Active Plans", value: plans.filter((p) => p.active).length, color: "#34d399" },
          { label: "Total Revenue", value: `$${revenue.toFixed(2)}`, color: "#a78bfa" },
          { label: "Transactions", value: transactions.length, color: "#60a5fa" },
        ].map((s) => (
          <Card key={s.label} style={{ background: CARD_BG, border: `1px solid ${BORDER}`, borderRadius: 14 }} styles={{ body: { padding: "16px 18px" } }}>
            <Text style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", display: "block", marginBottom: 6 }}>{s.label}</Text>
            <div style={{ fontSize: 24, fontWeight: 700, color: s.color, letterSpacing: "-0.5px" }}>{s.value}</div>
          </Card>
        ))}
      </div>

      <Card style={{ background: CARD_BG, border: `1px solid ${BORDER}`, borderRadius: 14, marginBottom: 16 }} styles={{ body: { padding: 0 } }}>
        <div style={{ padding: "14px 18px", borderBottom: `1px solid ${BORDER}` }}>
          <Text style={{ color: "#fff", fontWeight: 600, fontSize: 14 }}>Subscription Plans</Text>
        </div>
        <Table dataSource={plans} columns={planColumns} rowKey="key" loading={planLoading} pagination={false} style={{ background: "transparent" }} size="small" />
      </Card>

      <Card style={{ background: CARD_BG, border: `1px solid ${BORDER}`, borderRadius: 14 }} styles={{ body: { padding: 0 } }}>
        <div style={{ padding: "14px 18px", borderBottom: `1px solid ${BORDER}` }}>
          <Text style={{ color: "#fff", fontWeight: 600, fontSize: 14 }}>Recent Transactions</Text>
        </div>
        {transactions.length === 0 && !txLoading ? (
          <div style={{ padding: "40px 24px", textAlign: "center" }}>
            <CreditCardIcon style={{ width: 34, height: 34, color: "rgba(255,255,255,0.12)", margin: "0 auto 10px" }} />
            <Text style={{ color: "rgba(255,255,255,0.3)", fontSize: 13, display: "block" }}>No transactions yet</Text>
          </div>
        ) : (
          <Table dataSource={transactions} columns={txColumns} rowKey="key" loading={txLoading} pagination={{ pageSize: 8, size: "small" }} style={{ background: "transparent" }} size="small" />
        )}
      </Card>

      <Modal
        title={<span style={{ color: "#fff", fontSize: 15, fontWeight: 600 }}>{planModal.editing ? "Edit Plan" : "Create Plan"}</span>}
        open={planModal.open}
        onCancel={() => setPlanModal({ open: false, editing: null })}
        footer={null}
        styles={{ content: { background: "#242424", border: `1px solid ${BORDER}` }, header: { background: "#242424", borderBottom: `1px solid ${BORDER}` }, mask: { backdropFilter: "blur(4px)" } }}
      >
        <Form form={form} onFinish={handleSave} layout="vertical" style={{ marginTop: 10 }} initialValues={{ active: true, popular: false }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <Form.Item name="name" label={<span style={{ color: "rgba(255,255,255,0.55)", fontSize: 12 }}>Plan Name</span>} rules={[{ required: true }]}>
              <Input style={{ background: "#2a2a2a", border: `1px solid #383838` }} placeholder="Pro" />
            </Form.Item>
            <Form.Item name="price" label={<span style={{ color: "rgba(255,255,255,0.55)", fontSize: 12 }}>Price ($/month)</span>} rules={[{ required: true }]}>
              <InputNumber min={0} style={{ width: "100%", background: "#2a2a2a", border: `1px solid #383838` }} />
            </Form.Item>
          </div>
          <Form.Item name="credits" label={<span style={{ color: "rgba(255,255,255,0.55)", fontSize: 12 }}>Credits Included</span>} rules={[{ required: true }]}>
            <InputNumber min={0} style={{ width: "100%", background: "#2a2a2a", border: `1px solid #383838` }} />
          </Form.Item>
          <Form.Item name="features" label={<span style={{ color: "rgba(255,255,255,0.55)", fontSize: 12 }}>Features (one per line)</span>}>
            <Input.TextArea rows={4} placeholder="Unlimited generations&#10;Priority support&#10;API access" style={{ background: "#2a2a2a", border: `1px solid #383838` }} />
          </Form.Item>
          <div style={{ display: "flex", gap: 20, marginBottom: 16 }}>
            <Form.Item name="popular" valuePropName="checked" style={{ margin: 0 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <Switch size="small" />
                <Text style={{ color: "rgba(255,255,255,0.55)", fontSize: 12 }}>Mark as Popular</Text>
              </div>
            </Form.Item>
            <Form.Item name="active" valuePropName="checked" style={{ margin: 0 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <Switch size="small" defaultChecked />
                <Text style={{ color: "rgba(255,255,255,0.55)", fontSize: 12 }}>Active</Text>
              </div>
            </Form.Item>
          </div>
          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
            <Button onClick={() => setPlanModal({ open: false, editing: null })}>Cancel</Button>
            <Button htmlType="submit" loading={saving} style={{ background: ACCENT, border: "none", color: "#000", fontWeight: 600 }}>
              {planModal.editing ? "Update" : "Create"}
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
}
