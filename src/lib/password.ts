import bcrypt from "bcryptjs";

const SALT_ROUNDS = 10;

/**
 * 哈希密码（注册时调用）
 */
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

/**
 * 验证密码（登录时调用）
 * 支持明文密码的向后兼容（旧数据未哈希）
 */
export async function verifyPassword(
  inputPassword: string,
  storedPassword: string
): Promise<boolean> {
  // 如果是 bcrypt 哈希（以 $2a$ 或 $2b$ 开头），用 bcrypt 比较
  if (storedPassword.startsWith("$2a$") || storedPassword.startsWith("$2b$")) {
    return bcrypt.compare(inputPassword, storedPassword);
  }

  // 兼容旧数据：明文比较（后续应通过重新设置密码迁移为哈希）
  return inputPassword === storedPassword;
}
