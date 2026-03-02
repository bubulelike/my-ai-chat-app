// src/app/page.tsx
'use client';

import Link from 'next/link';
import { useState } from 'react';

interface FeatureCard {
  id: string;
  title: string;
  description: string;
  icon: string;
  path: string;
  bgColor: string;
}

export default function HomePage() {
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);

  const features: FeatureCard[] = [
    {
      id: 'human-ai',
      title: 'AI-真人对话',
      description: '与AI进行一对一深度对话',
      icon: '💬',
      path: '/chat/human-ai',
      bgColor: 'bg-blue-50 hover:bg-blue-100',
    },
    {
      id: 'ai-ai',
      title: 'AI-AI对话',
      description: '观看两个AI模型之间的对话',
      icon: '🤖',
      path: '/chat/ai-ai',
      bgColor: 'bg-purple-50 hover:bg-purple-100',
    },
    {
      id: 'ai-ai-custom',
      title: 'AI-AI对话（自定义角色）',
      description: '为AI设置不同的角色和性格',
      icon: '🎭',
      path: '/chat/ai-ai-custom',
      bgColor: 'bg-green-50 hover:bg-green-100',
    },
    {
      id: 'ai-group',
      title: 'AI-AI群体对话',
      description: '多个AI同时参与的多方对话',
      icon: '👥',
      path: '/chat/ai-group',
      bgColor: 'bg-orange-50 hover:bg-orange-100',
    },
  ];

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* 导航栏 */}
      <nav className="border-b border-gray-200 bg-white/80 backdrop-blur-sm fixed top-0 w-full z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <span className="text-2xl font-bold text-gray-900">AI对话平台</span>
              <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                毕业设计
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <button className="text-gray-600 hover:text-gray-900">登录</button>
              <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                注册
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* 主要内容区域 */}
      <div className="pt-24 pb-12 px-4">
        <div className="max-w-7xl mx-auto">
          {/* 标题区域 */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              探索AI对话的无限可能
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              选择你感兴趣的对话模式，开始与AI的互动之旅
            </p>
          </div>

          {/* 功能卡片网格 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
            {features.map((feature) => (
              <Link
                key={feature.id}
                href={feature.path}
                className={`
                  block p-6 rounded-xl transition-all duration-300 
                  ${feature.bgColor}
                  ${hoveredCard === feature.id ? 'transform scale-105 shadow-lg' : 'shadow-md'}
                  border border-gray-200 hover:border-gray-300
                `}
                onMouseEnter={() => setHoveredCard(feature.id)}
                onMouseLeave={() => setHoveredCard(null)}
              >
                <div className="flex items-start space-x-4">
                  <div className="text-4xl">{feature.icon}</div>
                  <div className="flex-1">
                    <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                      {feature.title}
                    </h2>
                    <p className="text-gray-600 mb-4">{feature.description}</p>
                    <div className="flex items-center text-blue-600 font-medium">
                      进入
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
              </Link>
            ))}
          </div>

          {/* 底部装饰 */}
          <div className="mt-16 text-center text-gray-500 text-sm">
            <p>✨ 点击任一卡片开始体验 AI 对话 ✨</p>
          </div>
        </div>
      </div>
    </main>
  );
}