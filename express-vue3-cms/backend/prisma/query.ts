import { prisma } from "./lib";

async function main() {
  console.log('🔍 开始验证数据播种并演示 CRUD...\n');

  // ========== 1. 验证种子数据是否存在 ==========
  const userCount = await prisma.sys_user.count();
  console.log(`📊 当前数据库中共有 ${userCount} 个用户`);

  if (userCount > 0) {
    const firstUser = await prisma.sys_user.findFirst();
    console.log('👤 示例用户:', firstUser);
  } else {
    console.log('⚠️ 未发现种子数据，请先运行 `npx prisma db seed`');
  }

  // ========== 3. 读取 (Read) ==========
  const foundUser = await prisma.sys_user.findUnique({
    where: { id: 1 },
  });
  console.log('🔎 通过用户ID查找用户:', foundUser);

  // 查询所有用户（带条件排序）
  const allUsers = await prisma.sys_user.findMany({
    orderBy: { id: 'desc' },
    take: 5,
  });
  console.log('📋 最近创建的5位用户:', allUsers);


  // 再次验证数量
  const finalCount = await prisma.sys_user.count();
  console.log(`\n✅ 验证完成，最终用户数: ${finalCount}`);
}

main()
  .catch((e) => {
    console.error('❌ 错误:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });