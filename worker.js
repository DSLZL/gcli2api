/**
 * Welcome to Cloudflare Workers! This is your first worker.
 *
 * - Run `npm run dev` in your terminal to start a development server
 * - Open a browser tab at http://localhost:8787/ to see your worker in action
 * - Run `npm run deploy` to publish your worker
 *
 * Learn more at https://developers.cloudflare.com/workers/
 */

// 定义目标 API 的主机名
const TARGET_HOST = 'cloudcode-pa.googleapis.com';

export default {
  async fetch(request, env, ctx) {
    // 1. URL 重构
    // 从原始请求中获取 URL 对象
    const url = new URL(request.url);

    // 使用目标主机名替换原始主机名
    url.hostname = TARGET_HOST;
    
    // 确保协议是 https
    url.protocol = 'https';

    // 2. 处理 OPTIONS 预检请求 (CORS Preflight)
    if (request.method === 'OPTIONS') {
      return handleOptions(request);
    }

    // 3. 转发请求
    // 创建一个新的请求对象，使用新的 URL，并复制原始请求的方法、头信息和请求体
    const proxyRequest = new Request(url, {
      method: request.method,
      headers: request.headers,
      body: request.body,
      redirect: 'follow' // 遵循重定向
    });

    // 将请求发送到目标服务器
    const response = await fetch(proxyRequest);

    // 4. 处理响应
    // 创建一个新的、可修改的响应对象，以便我们可以添加 CORS 头
    const newResponse = new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: new Headers(response.headers),
    });

    // 添加允许跨域的头信息
    newResponse.headers.set('Access-Control-Allow-Origin', '*');
    newResponse.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    newResponse.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    
    // 返回修改后的响应
    return newResponse;
  },
};

/**
 * 处理 CORS 预检请求
 * @param {Request} request
 * @returns {Response}
 */
function handleOptions(request) {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': request.headers.get('Access-Control-Request-Headers') || 'Content-Type, Authorization',
    'Access-Control-Max-Age': '86400', // 缓存预检请求结果 24 小时
  };
  return new Response(null, { headers });
}
