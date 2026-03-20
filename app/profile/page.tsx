'use client';

import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import ProtectedRoute from '../components/ProtectedRoute';
import Link from "next/link";
import Navbar from '../components/Navbar';

export default function ProfilePage() {
  const { data: session, status, update } = useSession();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const currentBalance = session?.user?.balance || 0;
  // 个人信息状态
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    avatar: '',
    balance: 0
  });

  // 密码修改状态
  const [passwords, setPasswords] = useState({
    current: '',
    new: '',
    confirm: ''
  });

  useEffect(() => {
    if (session?.user) {
      setProfile({
        name: session.user.name || '',
        email: session.user.email || '',
        avatar: session.user.image || '',
        balance: 10 // 这里应该从API获取真实余额
      });
    }
  }, [session]);

  if (status === "loading") {
    return <div className="min-h-screen flex items-center justify-center">加载中...</div>;
  }

  if (status === "unauthenticated") {
    router.push("/login");
    return null;
  }

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: profile.name })
      });

      if (res.ok) {
        setMessage({ type: 'success', text: '个人信息更新成功' });
        await update(); // 更新 session
      } else {
        throw new Error('更新失败');
      }
    } catch (error) {
      setMessage({ type: 'error', text: '更新失败，请稍后重试' });
    } finally {
      setLoading(false);
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwords.new !== passwords.confirm) {
      setMessage({ type: 'error', text: '新密码两次输入不一致' });
      return;
    }
    if (passwords.new.length < 6) {
      setMessage({ type: 'error', text: '新密码至少6位' });
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/user/password', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword: passwords.current,
          newPassword: passwords.new
        })
      });

      if (res.ok) {
        setMessage({ type: 'success', text: '密码修改成功' });
        setPasswords({ current: '', new: '', confirm: '' });
      } else {
        const data = await res.json();
        throw new Error(data.error || '修改失败');
      }
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message });
    } finally {
      setLoading(false);
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('avatar', file);

    setLoading(true);
    try {
      const res = await fetch('/api/user/avatar', {
        method: 'POST',
        body: formData
      });

      if (res.ok) {
        const data = await res.json();
        setProfile({ ...profile, avatar: data.avatarUrl });
        setMessage({ type: 'success', text: '头像更新成功' });
        await update();
      } else {
        throw new Error('上传失败');
      }
    } catch (error) {
      setMessage({ type: 'error', text: '头像上传失败' });
    } finally {
      setLoading(false);
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    }
  };

  return (
      <ProtectedRoute>  {/* 用 ProtectedRoute 包裹 */}
        <Navbar />
        <div className="min-h-screen bg-gray-50">
        <nav className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <Link href="/" className="text-xl font-bold text-gray-900">
                AI对话平台
              </Link>
              <Link href="/" className="text-gray-600 hover:text-gray-900">
                返回首页
              </Link>
            </div>
          </div>
        </nav>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {message.text && (
            <div className={`mb-4 p-4 rounded-lg ${
              message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
            }`}>
              {message.text}
            </div>
          )}

          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            {/* 标签页 */}
            <div className="flex border-b border-gray-200">
              <button
                onClick={() => setActiveTab('profile')}
                className={`flex-1 py-4 text-center font-medium ${
                  activeTab === 'profile'
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                个人信息
              </button>
              <button
                onClick={() => setActiveTab('security')}
                className={`flex-1 py-4 text-center font-medium ${
                  activeTab === 'security'
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                安全设置
              </button>
              <button
                onClick={() => setActiveTab('balance')}
                className={`flex-1 py-4 text-center font-medium ${
                  activeTab === 'balance'
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                余额管理
              </button>
            </div>

            {/* 个人信息标签页 */}
            {activeTab === 'profile' && (
              <div className="p-6">
                <h2 className="text-xl font-bold mb-6">个人信息</h2>

                {/* 头像上传 */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    头像
                  </label>
                  <div className="flex items-center space-x-6">
                    <div className="w-20 h-20 rounded-full bg-blue-500 flex items-center justify-center text-white text-2xl overflow-hidden">
                      {profile.avatar ? (
                        <img src={profile.avatar} alt="avatar" className="w-full h-full object-cover" />
                      ) : (
                        profile.name?.[0] || profile.email[0]
                      )}
                    </div>
                    <div>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleAvatarUpload}
                        className="hidden"
                        id="avatar-upload"
                      />
                      <label
                        htmlFor="avatar-upload"
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer"
                      >
                        上传新头像
                      </label>
                      <p className="text-sm text-gray-500 mt-2">支持 JPG、PNG 格式，建议 200x200 像素</p>
                    </div>
                  </div>
                </div>

                <form onSubmit={handleProfileUpdate} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      昵称
                    </label>
                    <input
                      type="text"
                      value={profile.name}
                      onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      邮箱
                    </label>
                    <input
                      type="email"
                      value={profile.email}
                      disabled
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 bg-gray-50 text-gray-500"
                    />
                    <p className="text-sm text-gray-500 mt-1">邮箱不可修改</p>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                  >
                    {loading ? '保存中...' : '保存修改'}
                  </button>
                </form>
              </div>
            )}

            {/* 安全设置标签页 */}
            {activeTab === 'security' && (
              <div className="p-6">
                <h2 className="text-xl font-bold mb-6">修改密码</h2>
                <form onSubmit={handlePasswordChange} className="space-y-4 max-w-md">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      当前密码
                    </label>
                    <input
                      type="password"
                      value={passwords.current}
                      onChange={(e) => setPasswords({ ...passwords, current: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      新密码
                    </label>
                    <input
                      type="password"
                      value={passwords.new}
                      onChange={(e) => setPasswords({ ...passwords, new: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      确认新密码
                    </label>
                    <input
                      type="password"
                      value={passwords.confirm}
                      onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                  >
                    {loading ? '修改中...' : '修改密码'}
                  </button>
                </form>
              </div>
            )}
            {/* 余额管理标签页 */}
            {activeTab === 'balance' && (
              <div className="p-6">
                <h2 className="text-xl font-bold mb-6">余额管理</h2>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
                  <p className="text-sm text-blue-600 mb-2">当前余额</p>
                  <p className="text-3xl font-bold text-blue-700">
                    ¥{currentBalance.toFixed(2)}  {/* 直接使用 session 的余额 */}
                  </p>
                </div>

                <h3 className="text-lg font-semibold mb-4">充值</h3>

                {/* 确保这里有跳转到充值页的按钮 */}
                <Link
                  href="/recharge"
                  className="block w-full bg-blue-600 text-white text-center py-3 rounded-lg hover:bg-blue-700 transition-colors mb-4"
                >
                  去充值
                </Link>

                <p className="text-sm text-gray-500 text-center">
                  * 充值即表示同意《充值服务协议》
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
      </ProtectedRoute>

  );
}