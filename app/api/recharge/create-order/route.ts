// app/api/recharge/create-order/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import crypto from 'crypto';

// 生成唯一订单号
function generateOrderNo(): string {
  const timestamp = Date.now().toString();
  const random = crypto.randomBytes(4).toString('hex').toUpperCase();
  const orderNo = `R${timestamp}${random}`;
  return orderNo.substring(0, 32);
}

export async function POST(req: Request) {
  // 1. 检查用户是否登录
  const session = await getServerSession();
  if (!session?.user?.email) {
    return NextResponse.json(
      { error: "请先登录" },
      { status: 401 }
    );
  }

  try {
    // 2. 解析请求参数
    const { packageId, paymentMethod } = await req.json();

    if (!packageId) {
      return NextResponse.json(
        { error: "请选择充值套餐" },
        { status: 400 }
      );
    }

    // 3. 查询套餐信息
    const pkg = await prisma.rechargePackage.findUnique({
      where: { id: packageId }
    });

    if (!pkg) {
      return NextResponse.json(
        { error: "套餐不存在" },
        { status: 404 }
      );
    }

    // 4. 查询用户信息
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      return NextResponse.json(
        { error: "用户不存在" },
        { status: 404 }
      );
    }

    // 5. 创建订单
    const order = await prisma.$transaction(async (tx) => {
      const newOrder = await tx.order.create({
        data: {
          orderNo: generateOrderNo(),
          userId: user.id,
          packageId: pkg.id,
          amount: pkg.amount,
          bonus: pkg.bonus,
          paymentMethod: paymentMethod || 'alipay',
          status: 'PENDING',
          expireTime: new Date(Date.now() + 30 * 60 * 1000)
        }
      });
      return newOrder;
    });

    // 6. 准备支付宝参数
    // 生成时间戳
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    const timestamp = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;

    // 业务参数
    const bizContent = {
      out_trade_no: order.orderNo,
      product_code: 'FAST_INSTANT_TRADE_PAY',
      total_amount: order.amount.toFixed(2),
      subject: 'AI对话平台充值'
    };

    // 1. 参数列表
    const params: Record<string, string> = {
      app_id: process.env.ALIPAY_APP_ID!,
      method: 'alipay.trade.page.pay',
      format: 'JSON',
      charset: 'utf-8',
      sign_type: 'RSA2',
      timestamp: timestamp,
      notify_url: 'https://noisier-vena-dowdily.ngrok-free.dev/api/recharge/alipay/notify', // 异步通知地址
      return_url: 'https://noisier-vena-dowdily.ngrok-free.dev/recharge/success', // 同步跳转地址
      version: '1.0',
      biz_content: JSON.stringify(bizContent)
    };

    // 2. 按参数名 ASCII 升序排序
    const sortedKeys = Object.keys(params).sort();

    // 3. 生成待签名字符串
    const signContent = sortedKeys
      .map(key => `${key}=${params[key]}`)
      .join('&');

    // 4. 生成签名
    const sign = crypto.createSign('RSA-SHA256')
      .update(signContent)
      .sign(process.env.ALIPAY_PRIVATE_KEY!, 'base64');

    // 5. 构建完整支付URL
    const queryString = sortedKeys
      .map(key => `${key}=${encodeURIComponent(params[key])}`)
      .join('&');
    const payUrl = `${process.env.ALIPAY_GATEWAY}?${queryString}&sign=${encodeURIComponent(sign)}`;

    // 6. 打印调试信息
    console.log('=== 支付宝支付参数 ===');
    console.log('待签名字符串:', signContent);
    console.log('生成的签名:', sign);
    console.log('支付URL:', payUrl);

    return NextResponse.json({
      success: true,
      orderId: order.id,
      orderNo: order.orderNo,
      amount: order.amount,
      bonus: order.bonus,
      totalAmount: order.amount + order.bonus,
      payUrl,
      expireTime: order.expireTime
    });

  } catch (error) {
    console.error("创建订单失败:", error);
    return NextResponse.json(
      { error: "创建订单失败，请稍后重试" },
      { status: 500 }
    );
  }
}