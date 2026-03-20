// app/api/recharge/init/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST() {
  try {
    const packages = [
      { name: "10元套餐", amount: 10, bonus: 0, sortOrder: 1, description: "基础套餐" },
      { name: "30元套餐", amount: 30, bonus: 2, sortOrder: 2, description: "赠送2元" },
      { name: "50元套餐", amount: 50, bonus: 5, sortOrder: 3, description: "赠送5元" },
      { name: "100元套餐", amount: 100, bonus: 15, sortOrder: 4, description: "赠送15元" },
    ];

    for (const pkg of packages) {
      await prisma.rechargePackage.upsert({
        where: { name: pkg.name },
        update: pkg,
        create: pkg
      });
    }

    return NextResponse.json({ message: "套餐初始化成功" });
  } catch (error) {
    console.error("初始化失败:", error);
    return NextResponse.json({ error: "初始化失败" }, { status: 500 });
  }
}