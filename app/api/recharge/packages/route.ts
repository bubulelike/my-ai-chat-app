// app/api/recharge/packages/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const packages = await prisma.rechargePackage.findMany({
      where: {
        isActive: true  // 只返回上架的套餐
      },
      orderBy: {
        sortOrder: 'asc'  // 按排序字段升序排列
      },
      select: {
        id: true,
        name: true,
        amount: true,
        bonus: true,
        description: true
        // 不返回敏感或不需要的字段
      }
    });

    return NextResponse.json(packages);
  } catch (error) {
    console.error("获取套餐列表失败:", error);
    return NextResponse.json(
      { error: "获取套餐列表失败" },
      { status: 500 }
    );
  }
}