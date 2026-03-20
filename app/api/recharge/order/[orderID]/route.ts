// app/api/recharge/order/[orderId]/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: Request,
  { params }: { params: { orderId: string } }
) {
  const session = await getServerSession();
  if (!session?.user?.email) {
    return NextResponse.json(
      { error: "请先登录" },
      { status: 401 }
    );
  }

  try {
    const order = await prisma.order.findUnique({
      where: { id: params.orderId },
      include: {
        package: true
      }
    });

    if (!order) {
      return NextResponse.json(
        { error: "订单不存在" },
        { status: 404 }
      );
    }

    // 验证订单是否属于当前用户
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (order.userId !== user?.id) {
      return NextResponse.json(
        { error: "无权查看此订单" },
        { status: 403 }
      );
    }

    return NextResponse.json({
      orderNo: order.orderNo,
      amount: order.amount,
      bonus: order.bonus,
      status: order.status,
      payTime: order.payTime,
      expireTime: order.expireTime
    });

  } catch (error) {
    console.error("查询订单失败:", error);
    return NextResponse.json(
      { error: "查询订单失败" },
      { status: 500 }
    );
  }
}