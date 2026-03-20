// app/recharge/success/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/app/components/Navbar';
import { useSession } from 'next-auth/react';
import ProtectedRoute from '../../components/ProtectedRoute';

export default function RechargeSuccessPage() {
  const searchParams = useSearchParams();
  const { update: updateSession } = useSession();
  const [status, setStatus] = useState('processing');

  // useEffect(() => {
  //   // 获取所有 URL 参数
  //   const params = Object.fromEntries(searchParams.entries());
  //   console.log('同步跳转参数:', params);
  //
  //   // 更宽松的判断逻辑
  //   // 只要有以下任何一个参数，就认为是成功
  //   if (params.trade_no || params.out_trade_no || params.total_amount) {
  //     setStatus('success');
  //     // 刷新 session 获取最新余额
  //     updateSession();
  //     // 标记支付成功（供 Navbar 使用）
  //     sessionStorage.setItem('justPaid', 'true');
  //   } else {
  //     setStatus('failed');
  //   }
  // }, [searchParams, updateSession]);
   useEffect(() => {
    const params = Object.fromEntries(searchParams.entries());
    console.log('支付成功页参数:', params);

    if (params.trade_no || params.out_trade_no || params.total_amount) {
      setStatus('success');
      // 🔥 关键：强制刷新 session
      updateSession().then(() => {
        console.log('session 已刷新');
      });
      sessionStorage.setItem('justPaid', 'true');
    } else {
      setStatus('failed');
    }
  }, [searchParams, updateSession]);
  if (status === 'processing') {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gray-50 pt-16 flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">正在确认支付结果...</p>
          </div>
        </div>
      </>
    );
  }

  if (status === 'success') {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gray-50 pt-16 flex items-center justify-center">
          <div className="bg-white p-8 rounded-xl shadow-md max-w-md w-full text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold mb-2">充值成功！</h1>
            <p className="text-gray-600 mb-2">您的余额已更新</p>
            <p className="text-sm text-gray-500 mb-6">订单号：{searchParams.get('out_trade_no')}</p>
            <Link
              href="/recharge"
              className="inline-block bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
            >
              返回充值页
            </Link>
          </div>
        </div>
      </>
    );
  }

  return (
    <ProtectedRoute>
      <Navbar />
      <div className="min-h-screen bg-gray-50 pt-16 flex items-center justify-center">
        <div className="bg-white p-8 rounded-xl shadow-md max-w-md w-full text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h1 className="text-xl font-semibold mb-2">支付失败</h1>
          <p className="text-gray-600 mb-6">请重新尝试充值</p>
          <Link
            href="/recharge"
            className="inline-block bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            重新充值
          </Link>
        </div>
      </div>
    </ProtectedRoute>
  );
}