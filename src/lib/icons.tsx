import {
  Building2,
  PiggyBank,
  CreditCard,
  TrendingUp,
  Wallet,
  LayoutDashboard,
  ArrowLeftRight,
  Tags,
  ChartPie,
  Trophy,
  LogOut,
  type LucideIcon,
} from "lucide-react";

export const ACCOUNT_TYPE_ICONS: Record<string, LucideIcon> = {
  checking: Building2,
  savings: PiggyBank,
  credit: CreditCard,
  investment: TrendingUp,
  cash: Wallet,
};

export const NAV_ICONS: Record<string, LucideIcon> = {
  "/dashboard": LayoutDashboard,
  "/accounts": Building2,
  "/transactions": ArrowLeftRight,
  "/categories": Tags,
  "/budgets": ChartPie,
  "/goals": Trophy,
  "/investments": TrendingUp,
};

export const EMPTY_STATE_ICONS: Record<string, LucideIcon> = {
  accounts: Building2,
  transactions: CreditCard,
  categories: Tags,
  budgets: ChartPie,
  goals: Trophy,
  investments: TrendingUp,
};

export { LogOut };
