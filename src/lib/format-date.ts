/**
 * 格式化时间为相对时间（如 "3小时前"）
 */
export function formatDistanceToNow(date: Date): string {
  const now = new Date();
  const diff = now.getTime() - new Date(date).getTime();
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  const months = Math.floor(days / 30);

  if (seconds < 60) return "刚刚";
  if (minutes < 60) return `${minutes}分钟前`;
  if (hours < 24) return `${hours}小时前`;
  if (days < 7) return `${days}天前`;
  if (days < 30) return `${Math.floor(days / 7)}周前`;
  if (months < 12) return `${months}个月前`;
  return new Date(date).toLocaleDateString("zh-CN", { year: "numeric", month: "long", day: "numeric" });
}
