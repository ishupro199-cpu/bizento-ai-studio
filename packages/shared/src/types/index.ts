export interface UserDoc {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  plan: "free" | "starter" | "pro";
  credits: number;
  role: "user" | "admin";
  referralCode: string;
  referredBy?: string;
  isActive: boolean;
  isBanned: boolean;
  createdAt: any;
}

export interface Plan {
  id: string;
  name: string;
  price: number;
  credits: number;
  features: string[];
  isActive: boolean;
}

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  coverImageURL: string;
  author: string;
  tags: string[];
  status: "draft" | "published";
  publishedAt: any;
  createdAt: any;
}

export interface SupportTicket {
  id: string;
  userId?: string;
  userEmail: string;
  subject: string;
  message: string;
  status: "open" | "replied" | "closed";
  adminReply?: string;
  createdAt: any;
  repliedAt?: any;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: "info" | "success" | "warning" | "promotional";
  isRead: boolean;
  createdAt: any;
}

export interface InspirationPrompt {
  id: string;
  title: string;
  prompt: string;
  imageURL: string;
  category: string;
  addedBy: string;
  isActive: boolean;
  createdAt: any;
}

export interface Banner {
  id: string;
  imageURL: string;
  title: string;
  link: string;
  isActive: boolean;
  displayOrder: number;
  endDate?: any;
  createdAt: any;
}
