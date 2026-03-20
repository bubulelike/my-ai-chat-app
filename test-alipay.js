// test-alipay.js
const crypto = require('crypto');
require('dotenv').config({ path: '.env' });

console.log('=== 测试私钥格式 ===');
console.log('APP_ID:', process.env.ALIPAY_APP_ID);
console.log('私钥长度:', process.env.ALIPAY_PRIVATE_KEY?.length);
console.log('私钥前50字符:', process.env.ALIPAY_PRIVATE_KEY?.substring(0, 50));

try {
  // 方法1：自动检测格式
  const privateKey1 = crypto.createPrivateKey({
    key: process.env.ALIPAY_PRIVATE_KEY,
    format: 'pem'
    // 不指定 type，让 Node.js 自动检测
  });
  console.log('✅ 方法1（自动检测）成功！');

  // 方法2：尝试 PKCS#1
  const privateKey2 = crypto.createPrivateKey({
    key: process.env.ALIPAY_PRIVATE_KEY,
    format: 'pem',
    type: 'pkcs1'
  });
  console.log('✅ 方法2（PKCS#1）成功！');

  // 方法3：尝试 PKCS#8
  const privateKey3 = crypto.createPrivateKey({
    key: process.env.ALIPAY_PRIVATE_KEY,
    format: 'pem',
    type: 'pkcs8'
  });
  console.log('✅ 方法3（PKCS#8）成功！');

} catch (e) {
  console.error('❌ 所有方法都失败:', e.message);
}