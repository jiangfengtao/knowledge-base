// 会员方案配置
export const MEMBERSHIP_PLANS = [
  { id: "monthly", name: "月度会员", tier: "premium", days: 30, price: 1900, originalPrice: 2900, badge: "" },
  { id: "yearly", name: "年度会员", tier: "premium", days: 365, price: 9900, originalPrice: 19900, badge: "推荐" },
  { id: "lifetime", name: "终身会员", tier: "vip", days: 0, price: 19900, originalPrice: 29900, badge: "最划算" },
] as const;
