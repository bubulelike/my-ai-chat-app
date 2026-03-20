// app/api/recharge/alipay/notify/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import crypto from 'crypto';

// 验证支付宝签名
function verifyAlipaySign(params: Record<string, string>, publicKey: string): boolean {
  // 1. 取出签名
  const sign = params.sign;
  if (!sign) return false;

  // 2. 排除签名本身和sign_type（sign_type不参与签名）
  const signContent = Object.keys(params)
    .filter(key => key !== 'sign' && key !== 'sign_type')
    .sort() // 按参数名ASCII升序排序
    .map(key => `${key}=${params[key]}`)
    .join('&');

  try {
    // 3. 验证签名
    const verify = crypto.createVerify('RSA-SHA256');
    verify.update(signContent, 'utf8');
    verify.end();
    return verify.verify(publicKey, sign, 'base64');
  } catch (error) {
    console.error('签名验证失败:', error);
    return false;
  }
}

export async function POST(req: Request) {
  try {
    // 1. 获取支付宝回调参数
    const formData = await req.formData();
    const params: Record<string, string> = {};
    formData.forEach((value, key) => {
      params[key] = value.toString();
    });

    console.log("支付宝回调参数:", params);

    // 2. 验证签名（必须！）
    const isValid = verifyAlipaySign(params, process.env.ALIPAY_PUBLIC_KEY!);
    if (!isValid) {
      console.error('支付宝签名验证失败');
      return new Response('failure');
    }

    // 3. 获取关键参数
    const { out_trade_no, trade_status, trade_no, gmt_payment } = params;

    // 4. 查询订单
    const order = await prisma.order.findUnique({
      where: { orderNo: out_trade_no },
      include: { user: true }
    });

    if (!order) {
      console.error('订单不存在:', out_trade_no);
      return new Response('failure');
    }

    // 5. 防止重复处理
    if (order.status === 'SUCCESS') {
      console.log('订单已处理，忽略重复通知');
      return new Response('success');
    }

    // 6. 处理支付成功
    if (trade_status === 'TRADE_SUCCESS' || trade_status === 'TRADE_FINISHED') {
      // 使用数据库事务：同时更新订单和用户余额
      await prisma.$transaction(async (tx) => {
        // 更新订单状态
        await tx.order.update({
          where: { id: order.id },
          data: {
            status: 'SUCCESS',
            tradeNo: trade_no,
            payTime: gmt_payment ? new Date(gmt_payment) : new Date(),
          }
        });

        // 增加用户余额（金额 + 赠送）
        await tx.user.update({
          where: { id: order.userId },
          data: {
            balance: {
              increment: order.amount + order.bonus
            }
          }
        });
      });

      console.log(`用户 ${order.userId} 充值成功: +${order.amount + order.bonus}元`);
    }

    // 7. 必须返回 success 告诉支付宝收到通知了
    return new Response('success');
  } catch (error) {
    console.error('支付宝回调处理失败:', error);
    return new Response('failure');
  }
}

// 支付宝可能会用 GET 方式验证（可选）
export async function GET(req: Request) {
  return new Response('success');
}