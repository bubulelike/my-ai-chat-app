'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Navbar from '@/app/components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';

interface Package {
  id: string;
  name: string;
  amount: number;
  bonus: number;
  description: string | null;
}

export default function RechargePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [packages, setPackages] = useState<Package[]>([]);
  const [selectedPackage, setSelectedPackage] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<'alipay' | 'wechat'>('alipay');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // 检查登录状态
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  // 获取套餐列表
  useEffect(() => {
    const fetchPackages = async () => {
      try {
        const res = await fetch('/api/recharge/packages');
        const data = await res.json();
        setPackages(data);
        if (data.length > 0) {
          setSelectedPackage(data[0].id);
        }
      } catch (error) {
        console.error('获取套餐失败', error);
        setError('获取套餐列表失败，请稍后重试');
      }
    };

    if (status === 'authenticated') {
      fetchPackages();
    }
  }, [status]);

 // 处理充值
  const handleRecharge = async () => {
  if (!selectedPackage) {
    setError('请选择充值套餐');
    return;
  }

  setLoading(true);
  setError('');

  try {
    const res = await fetch('/api/recharge/create-order', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        packageId: selectedPackage,
        paymentMethod
      })
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error || '创建订单失败');
    }

    // 🔥 关键修改：这里不再是 alert，而是真正的跳转！
    if (data.payUrl) {
      // 直接跳转到支付宝支付页面
      window.location.href = data.payUrl;
    } else {
      // 如果后端没有返回支付链接，显示错误
      setError('支付链接生成失败');
    }

  } catch (err: any) {
    setError(err.message || '充值失败，请稍后重试');
  } finally {
    setLoading(false);
  }
};
  // 计算选中套餐的详情
  const selectedPkg = packages.find(p => p.id === selectedPackage);

  if (status === 'loading') {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gray-50 pt-16 flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">加载中...</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <ProtectedRoute>
      <Navbar />
      <div className="min-h-screen bg-gray-50 pt-16">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <h1 className="text-2xl font-bold mb-6">账户充值</h1>

          {/* 错误提示 */}
          {error && (
            <div className="mb-6 p-4 bg-red-100 text-red-700 rounded-lg">
              {error}
            </div>
          )}

          {/* 余额显示 */}
          <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
            <p className="text-gray-600 mb-2">当前余额</p>
            <p className="text-3xl font-bold text-blue-600">
              ¥{session?.user?.balance?.toFixed(2) || '0.00'}
            </p>
          </div>

          {/* 套餐选择 */}
          <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
            <h2 className="text-lg font-semibold mb-4">选择充值套餐</h2>
            {packages.length === 0 ? (
              <p className="text-gray-500 text-center py-4">暂无充值套餐</p>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {packages.map((pkg) => (
                  <div
                    key={pkg.id}
                    onClick={() => setSelectedPackage(pkg.id)}
                    className={`
                      border-2 rounded-xl p-4 cursor-pointer transition-all
                      ${selectedPackage === pkg.id 
                        ? 'border-blue-600 bg-blue-50' 
                        : 'border-gray-200 hover:border-blue-300'}
                    `}
                  >
                    <p className="font-bold text-lg">{pkg.name}</p>
                    <p className="text-2xl font-bold text-blue-600">¥{pkg.amount}</p>
                    {pkg.bonus > 0 && (
                      <p className="text-sm text-green-600 mt-1">赠送 ¥{pkg.bonus}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 支付方式选择 */}
          <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
            <h2 className="text-lg font-semibold mb-4">支付方式</h2>
            <div className="flex space-x-6">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="radio"
                  value="alipay"
                  checked={paymentMethod === 'alipay'}
                  onChange={(e) => setPaymentMethod(e.target.value as 'alipay')}
                  className="w-4 h-4"
                />
                <span className="text-gray-700">支付宝</span>
              </label>
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="radio"
                  value="wechat"
                  checked={paymentMethod === 'wechat'}
                  onChange={(e) => setPaymentMethod(e.target.value as 'wechat')}
                  className="w-4 h-4"
                />
                <span className="text-gray-700">微信支付</span>
              </label>
            </div>
          </div>

          {/* 充值信息汇总 */}
          {selectedPkg && (
            <div className="bg-blue-50 rounded-xl p-6 mb-6">
              <p className="text-lg font-semibold mb-3">订单信息</p>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">套餐</span>
                  <span className="font-medium">{selectedPkg.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">充值金额</span>
                  <span className="font-medium">¥{selectedPkg.amount}</span>
                </div>
                {selectedPkg.bonus > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>赠送金额</span>
                    <span className="font-medium">+¥{selectedPkg.bonus}</span>
                  </div>
                )}
                <div className="border-t border-blue-200 my-3 pt-3"></div>
                <div className="flex justify-between text-lg font-bold">
                  <span>实际到账</span>
                  <span className="text-blue-600">
                    ¥{selectedPkg.amount + selectedPkg.bonus}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* 充值按钮 */}
          <button
            onClick={handleRecharge}
            disabled={loading || !selectedPackage || packages.length === 0}
            className="w-full bg-blue-600 text-white py-4 rounded-xl text-lg font-semibold
                     hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed
                     transition-colors"
          >
            {loading ? '订单创建中...' : '立即充值'}
          </button>

          {/* 提示信息 */}
          <p className="text-sm text-gray-500 text-center mt-4">
            点击充值即表示同意《充值服务协议》。充值金额不可提现。
          </p>
        </div>
      </div>
    </ProtectedRoute>
  );
}