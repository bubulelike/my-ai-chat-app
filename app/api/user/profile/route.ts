import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";

export async function PUT(req: Request) {
  const session = await getServerSession();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "未登录" }, { status: 401 });
  }

  try {
    const { name } = await req.json();

    const user = await prisma.user.update({
      where: { email: session.user.email },
      data: { name }
    });

    return NextResponse.json({ name: user.name });
  } catch (error) {
    return NextResponse.json({ error: "更新失败" }, { status: 500 });
  }
}