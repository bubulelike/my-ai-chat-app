// app/page.tsx
'use client';

import { useSession } from "next-auth/react";  // 添加这行！
import { useRouter } from "next/navigation";
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import Link from 'next/link';
import { useCallback } from 'react';

export default function HomePage() {
  const { data: session, status } = useSession();  // 现在可以正常使用了
  const router = useRouter();

  const handleFeatureClick = (e: React.MouseEvent, path: string) => {
    if (!session) {
      e.preventDefault();
      // alert("请先登录后再使用此功能");
      router.push("/login");
    }
  };

  const features = [
    {
      id: 'human-ai',
      title: 'AI-真人对话',
      description: '与AI进行一对一深度对话',
      icon: '💬',
      path: '/chat/human-ai',
      bgColor: 'bg-blue-50',
    },
    {
      id: 'ai-ai',
      title: 'AI-AI对话',
      description: '观看两个AI模型之间的对话',
      icon: '🤖',
      path: '/chat/ai-ai',
      bgColor: 'bg-purple-50',
    },
    {
      id: 'ai-ai-custom',
      title: 'AI-AI对话（自定义角色）',
      description: '为AI设置不同的角色和性格',
      icon: '🎭',
      path: '/chat/ai-ai-custom',
      bgColor: 'bg-green-50',
    },
    {
      id: 'ai-group',
      title: 'AI-AI群体对话',
      description: '多个AI同时参与的多方对话',
      icon: '👥',
      path: '/chat/ai-group',
      bgColor: 'bg-orange-50',
    },
  ];

  return (
    <ProtectedRoute>
      <Navbar />
      <main className="min-h-screen bg-gradient-to-b from-gray-50 to-white pt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* 标题区域 */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              探索AI对话的无限可能
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              {session ? '选择你感兴趣的对话模式' : '登录后即可开始体验'}
            </p>
          </div>

          {/* 功能卡片网格 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
            {features.map((feature) => (
              <a
                key={feature.id}
                href={feature.path}
                onClick={(e) => handleFeatureClick(e, feature.path)}
                className={`
                  block p-6 rounded-xl transition-all duration-300 
                  ${feature.bgColor} hover:shadow-lg hover:scale-105
                  border-2 border-gray-200 hover:border-blue-300
                  ${!session && 'opacity-75 hover:opacity-100'}
                `}
              >
                <div className="flex items-start space-x-4">
                  <div className="text-5xl">{feature.icon}</div>
                  <div className="flex-1">
                    <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                      {feature.title}
                    </h2>
                    <p className="text-gray-600 mb-4">{feature.description}</p>
                    <div className="flex items-center text-blue-600 font-medium">
                      {session ? '进入体验' : '登录后使用'}
                      <svg
                        className="w-5 h-5 ml-1 group-hover:translate-x-1 transition-transform"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    </div>
                  </div>
                </div>
              </a>
            ))}
          </div>

          {/* 底部提示 */}
          {!session && (
            <div className="mt-12 text-center">
              <p className="text-gray-500">
                已有账号？ <Link href="/login" className="text-blue-600 hover:underline">立即登录</Link>
                {' '}还没有账号？ <Link href="/register" className="text-blue-600 hover:underline">免费注册</Link>
              </p>
            </div>
          )}
        </div>
      </main>
     </ProtectedRoute>
  );
}