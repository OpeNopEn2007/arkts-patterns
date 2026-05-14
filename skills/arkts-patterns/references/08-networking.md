# 网络通信

> HarmonyOS NEXT (API 12) 网络通信参考文档

---

## 目录

- [@ohos.net.http HTTP 请求封装](#ohosnethttp-http-请求封装)
- [WebSocket](#websocket)
- [Socket (TCP/UDP)](#socket-tcpudp)
- [RCP (Remote Communication Protocol)](#rcp-remote-communication-protocol)
- [HTTP 拦截器模式](#http-拦截器模式)
- [错误处理与重试机制](#错误处理与重试机制)
  - [类封装重试 (RetryHandler 模式)](#类封装重试-retryhandler-模式)
- [请求/响应缓存](#请求响应缓存)
- [域名解析 (DNS)](#域名解析-dns)
- [网络安全](#网络安全)
- [统一错误处理 (ErrorHandler 模式)](#统一错误处理-errorhandler-模式)
- [API 服务封装实践](#api-服务封装实践)
- [避坑指南](#避坑指南)

---

## @ohos.net.http HTTP 请求封装

### 基础 HTTP 请求

```typescript
import { http } from '@kit.NetworkKit';

async function makeRequest(url: string): Promise<string> {
  const httpRequest = http.createHttp();
  try {
    const response = await httpRequest.request(url, {
      method: http.RequestMethod.GET,
      connectTimeout: 60000,
      readTimeout: 60000,
      header: { 'Content-Type': 'application/json' }
    });
    return response.result as string;
  } catch (err) {
    console.error('HTTP Error:', JSON.stringify(err));
    throw err;
  } finally {
    httpRequest.destroy(); // 必须清理
  }
}
```

### HTTP 请求封装工具

```typescript
import { http } from '@kit.NetworkKit';

export enum HttpMethod {
  GET = 'GET',
  POST = 'POST',
  PUT = 'PUT',
  DELETE = 'DELETE',
  PATCH = 'PATCH',
  HEAD = 'HEAD',
  OPTIONS = 'OPTIONS'
}

export interface RequestConfig {
  url: string;
  method?: HttpMethod;
  headers?: Record<string, string>;
  body?: string | Object;
  connectTimeout?: number;
  readTimeout?: number;
  expectDataType?: http.HttpDataType;
}

export interface ApiResponse<T = any> {
  code: number;
  data: T;
  headers: Record<string, string>;
  cookies: string;
}

export class HttpClient {
  private baseUrl: string;
  private defaultHeaders: Record<string, string>;
  private interceptors: Array<(config: RequestConfig) => RequestConfig>;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
    this.defaultHeaders = {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    };
    this.interceptors = [];
  }

  addInterceptor(interceptor: (config: RequestConfig) => RequestConfig): void {
    this.interceptors.push(interceptor);
  }

  async request<T = any>(config: RequestConfig): Promise<ApiResponse<T>> {
    // 应用拦截器
    let finalConfig = { ...config };
    for (const interceptor of this.interceptors) {
      finalConfig = interceptor(finalConfig);
    }

    const httpRequest = http.createHttp();
    try {
      const headers = {
        ...this.defaultHeaders,
        ...finalConfig.headers
      };

      let extraData: string | undefined;
      if (finalConfig.body) {
        extraData = typeof finalConfig.body === 'string'
          ? finalConfig.body
          : JSON.stringify(finalConfig.body);
      }

      const response = await httpRequest.request(finalConfig.url, {
        method: this.getRequestMethod(finalConfig.method),
        header: headers,
        extraData: extraData,
        connectTimeout: finalConfig.connectTimeout ?? 60000,
        readTimeout: finalConfig.readTimeout ?? 60000,
        expectDataType: finalConfig.expectDataType ?? http.HttpDataType.STRING
      });

      const code = response.responseCode ?? -1;
      let data: T;
      try {
        data = JSON.parse(response.result as string) as T;
      } catch {
        data = response.result as T;
      }

      return {
        code: code,
        data: data,
        headers: response.header as Record<string, string>,
        cookies: response.cookies ?? ''
      };
    } catch (err) {
      console.error('HTTP Request Failed:', JSON.stringify(err));
      throw this.normalizeError(err);
    } finally {
      httpRequest.destroy(); // 必须清理
    }
  }

  async get<T = any>(url: string, params?: Record<string, string>): Promise<ApiResponse<T>> {
    let fullUrl = `${this.baseUrl}${url}`;
    if (params) {
      const query = Object.entries(params)
        .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
        .join('&');
      fullUrl += `?${query}`;
    }
    return this.request<T>({ url: fullUrl, method: HttpMethod.GET });
  }

  async post<T = any>(url: string, body?: Object): Promise<ApiResponse<T>> {
    return this.request<T>({
      url: `${this.baseUrl}${url}`,
      method: HttpMethod.POST,
      body
    });
  }

  async put<T = any>(url: string, body?: Object): Promise<ApiResponse<T>> {
    return this.request<T>({
      url: `${this.baseUrl}${url}`,
      method: HttpMethod.PUT,
      body
    });
  }

  async delete<T = any>(url: string): Promise<ApiResponse<T>> {
    return this.request<T>({
      url: `${this.baseUrl}${url}`,
      method: HttpMethod.DELETE
    });
  }

  private getRequestMethod(method?: HttpMethod): http.RequestMethod {
    const methodMap: Record<string, http.RequestMethod> = {
      'GET': http.RequestMethod.GET,
      'POST': http.RequestMethod.POST,
      'PUT': http.RequestMethod.PUT,
      'DELETE': http.RequestMethod.DELETE,
      'PATCH': http.RequestMethod.PATCH,
      'HEAD': http.RequestMethod.HEAD,
      'OPTIONS': http.RequestMethod.OPTIONS
    };
    return methodMap[method ?? 'GET'] || http.RequestMethod.GET;
  }

  private normalizeError(err: any): Error {
    if (err instanceof Error) return err;
    return new Error(typeof err === 'string' ? err : JSON.stringify(err));
  }
}
```

### 使用示例

```typescript
const apiClient = new HttpClient('https://api.example.com');

// GET 请求
async function fetchUsers() {
  try {
    const response = await apiClient.get<Array<User>>('/users', { page: '1', size: '20' });
    if (response.code === 200) {
      console.log('Users:', JSON.stringify(response.data));
    }
  } catch (err) {
    console.error('Failed to fetch users:', err.message);
  }
}

// POST 请求
async function createUser() {
  try {
    const response = await apiClient.post<User>('/users', {
      name: '张三',
      email: 'zhangsan@example.com'
    });
    if (response.code === 201) {
      console.log('User created:', response.data);
    }
  } catch (err) {
    console.error('Failed to create user:', err.message);
  }
}
```

---

## WebSocket

### 基础 WebSocket 连接

```typescript
import { webSocket } from '@kit.NetworkKit';

class WebSocketClient {
  private ws: webSocket.WebSocket | null = null;
  private url: string = '';
  private reconnectAttempts: number = 0;
  private maxReconnectAttempts: number = 5;
  private reconnectDelay: number = 1000;
  private onMessageCallback?: (data: string) => void;
  private onErrorCallback?: (err: Error) => void;
  private onCloseCallback?: () => void;

  connect(url: string): void {
    this.url = url;
    this.ws = webSocket.createWebSocket();

    // 设置事件监听
    this.ws.on('open', () => {
      console.log('WebSocket connected');
      this.reconnectAttempts = 0;
    });

    this.ws.on('message', (data: string | ArrayBuffer) => {
      if (typeof data === 'string') {
        this.onMessageCallback?.(data);
      }
    });

    this.ws.on('close', () => {
      console.log('WebSocket closed');
      this.onCloseCallback?.();
      this.attemptReconnect();
    });

    this.ws.on('error', (err: Error) => {
      console.error('WebSocket error:', JSON.stringify(err));
      this.onErrorCallback?.(err);
    });

    // 连接
    this.ws.connect(url, {
      header: {
        'X-Client': 'HarmonyOS'
      }
    });
  }

  send(data: string): void {
    if (this.ws && this.getReadyState() === webSocket.ReadyState.OPEN) {
      this.ws.send(data);
    } else {
      console.error('WebSocket not connected');
    }
  }

  close(): void {
    this.reconnectAttempts = this.maxReconnectAttempts; // 防止重连
    if (this.ws) {
      this.ws.close();
      this.ws.off('open');
      this.ws.off('message');
      this.ws.off('close');
      this.ws.off('error');
      this.ws = null;
    }
  }

  onMessage(callback: (data: string) => void): void {
    this.onMessageCallback = callback;
  }

  onError(callback: (err: Error) => void): void {
    this.onErrorCallback = callback;
  }

  onClose(callback: () => void): void {
    this.onCloseCallback = callback;
  }

  private getReadyState(): webSocket.ReadyState {
    // ReadyState: CONNECTING=0, OPEN=1, CLOSING=2, CLOSED=3
    return (this.ws as any).readyState ?? webSocket.ReadyState.CLOSED;
  }

  private attemptReconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.log('Max reconnect attempts reached');
      return;
    }

    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts);
    console.log(`Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts + 1})`);

    setTimeout(() => {
      this.reconnectAttempts++;
      this.connect(this.url);
    }, delay);
  }
}
```

### 使用 WebSocket

```typescript
const wsClient = new WebSocketClient();

wsClient.onMessage((data: string) => {
  const message = JSON.parse(data);
  console.log('Received:', message);
});

wsClient.onError((err) => {
  console.error('WS Error:', err.message);
});

// 连接
wsClient.connect('wss://example.com/ws');

// 发送消息
wsClient.send(JSON.stringify({
  type: 'chat',
  content: 'Hello'
}));

// 关闭
wsClient.close();
```

---

## Socket (TCP/UDP)

### TCP Socket

```typescript
import { socket } from '@kit.NetworkKit';

class TcpClient {
  private tcpSocket: socket.TcpSocket | null = null;

  async connect(host: string, port: number): Promise<void> {
    this.tcpSocket = socket.constructTcpSocket();

    // 监听事件
    this.tcpSocket.on('connect', () => {
      console.log('TCP connected');
    });

    this.tcpSocket.on('message', (data: ArrayBuffer) => {
      const decoder = new util.TextDecoder('utf-8', { ignoreBOM: true });
      const message = decoder.decodeToString(data);
      console.log('TCP received:', message);
    });

    this.tcpSocket.on('error', (err: Error) => {
      console.error('TCP error:', JSON.stringify(err));
    });

    this.tcpSocket.on('close', () => {
      console.log('TCP closed');
    });

    // 连接
    await this.tcpSocket.connect({
      address: { address: host, port: port },
      timeout: 60000
    });
  }

  async send(data: string): Promise<void> {
    if (!this.tcpSocket) {
      throw new Error('TCP not connected');
    }
    const encoder = new util.TextEncoder();
    const buffer = encoder.encodeInto(data);
    await this.tcpSocket.send({ data: buffer });
  }

  close(): void {
    if (this.tcpSocket) {
      this.tcpSocket.close();
      this.tcpSocket.off('connect');
      this.tcpSocket.off('message');
      this.tcpSocket.off('error');
      this.tcpSocket.off('close');
      this.tcpSocket = null;
    }
  }
}
```

### UDP Socket

```typescript
class UdpClient {
  private udpSocket: socket.UDPSocket | null = null;

  async create(): Promise<void> {
    this.udpSocket = socket.constructUDPSocket();

    this.udpSocket.on('message', (data: { message: ArrayBuffer, remoteInfo: socket.SocketRemoteInfo }) => {
      const decoder = new util.TextDecoder('utf-8');
      const message = decoder.decodeToString(data.message);
      console.log('UDP received:', message, 'from:', data.remoteInfo.address);
    });

    this.udpSocket.on('error', (err: Error) => {
      console.error('UDP error:', JSON.stringify(err));
    });
  }

  async bind(port: number): Promise<void> {
    if (!this.udpSocket) throw new Error('UDP not created');
    await this.udpSocket.bind({ address: '0.0.0.0', port: port });
  }

  async send(host: string, port: number, data: string): Promise<void> {
    if (!this.udpSocket) throw new Error('UDP not created');
    const encoder = new util.TextEncoder();
    const buffer = encoder.encodeInto(data);
    await this.udpSocket.send({
      data: buffer,
      address: { address: host, port: port }
    });
  }

  close(): void {
    if (this.udpSocket) {
      this.udpSocket.close();
      this.udpSocket.off('message');
      this.udpSocket.off('error');
      this.udpSocket = null;
    }
  }
}
```

---

## RCP (Remote Communication Protocol)

RCP 是 HarmonyOS NEXT 提供的远程通信 API，提供更高级的网络请求抽象。

### 基础用法

```typescript
import { rcp } from '@kit.NetworkKit';

class RcpClient {
  private session: rcp.Session;

  constructor() {
    this.session = rcp.createSession();
  }

  async getData<T = any>(url: string): Promise<T> {
    const request = new rcp.Request(url, rcp.RequestMethod.GET);
    const response = await this.session.fetch(request);

    if (response.statusCode === 200) {
      return await response.json<T>();
    }
    throw new Error(`HTTP ${response.statusCode}`);
  }

  async postData<T = any>(url: string, body: Object): Promise<T> {
    const request = new rcp.Request(url, rcp.RequestMethod.POST);
    request.setHeader('Content-Type', 'application/json');
    request.setBody(JSON.stringify(body));

    const response = await this.session.fetch(request);
    if (response.ok) {
      return await response.json<T>();
    }
    throw new Error(`HTTP ${response.statusCode}: ${response.statusText}`);
  }
}
```

### 配置 Session

```typescript
const session = rcp.createSession({
  connectTimeout: 30000,
  readTimeout: 30000,
  maxConcurrent: 6,
  retry: {
    maxRetries: 3,
    retryDelay: 1000
  },
  header: {
    'X-App-Version': '1.0.0'
  }
});

// 拦截器
session.addInterceptor({
  onRequest: (request: rcp.Request) => {
    // 在请求发送前修改
    request.setHeader('Authorization', 'Bearer token');
    return request;
  },
  onResponse: (response: rcp.Response) => {
    // 在响应返回后处理
    console.log('Response status:', response.statusCode);
    return response;
  }
});
```

> **参考**: [RCP API 参考](https://developer.huawei.com/consumer/cn/doc/harmonyos-references-V5/remote-communication-rcp-V5)

---

## HTTP 拦截器模式

### 请求拦截器

```typescript
export interface RequestInterceptor {
  onRequest(config: RequestConfig): RequestConfig | Promise<RequestConfig>;
}

// Token 拦截器
class TokenInterceptor implements RequestInterceptor {
  private getToken: () => string;

  constructor(getToken: () => string) {
    this.getToken = getToken;
  }

  onRequest(config: RequestConfig): RequestConfig {
    const token = this.getToken();
    if (token) {
      config.headers = {
        ...config.headers,
        'Authorization': `Bearer ${token}`
      };
    }
    return config;
  }
}

// 日志拦截器
class LoggingInterceptor implements RequestInterceptor {
  onRequest(config: RequestConfig): RequestConfig {
    console.log(`[HTTP] ${config.method ?? 'GET'} ${config.url}`);
    return config;
  }
}

// 签名拦截器
class SignInterceptor implements RequestInterceptor {
  onRequest(config: RequestConfig): RequestConfig {
    const timestamp = Date.now().toString();
    const nonce = Math.random().toString(36).substring(2);

    config.headers = {
      ...config.headers,
      'X-Timestamp': timestamp,
      'X-Nonce': nonce,
      'X-Sign': this.generateSign(config, timestamp, nonce)
    };
    return config;
  }

  private generateSign(config: RequestConfig, timestamp: string, nonce: string): string {
    // 签名生成逻辑
    const raw = `${config.url}|${timestamp}|${nonce}|${JSON.stringify(config.body ?? '')}`;
    // 使用哈希算法生成签名...
    return raw; // 简化示例
  }
}
```

### 响应拦截器

```typescript
export interface ResponseInterceptor {
  onResponse(response: ApiResponse): ApiResponse | Promise<ApiResponse>;
}

// 错误码拦截器
class ErrorCodeInterceptor implements ResponseInterceptor {
  onResponse(response: ApiResponse): ApiResponse {
    if (response.code === 401) {
      // Token 过期，触发重新登录
      console.log('Token expired, redirecting to login');
      // 跳转登录页面
    }
    if (response.code === 403) {
      console.log('Forbidden');
    }
    if (response.code >= 500) {
      console.error('Server error:', response.code);
    }
    return response;
  }
}
```

### 拦截器链

```typescript
class InterceptorChain {
  private requestInterceptors: RequestInterceptor[] = [];
  private responseInterceptors: ResponseInterceptor[] = [];

  addRequestInterceptor(interceptor: RequestInterceptor): void {
    this.requestInterceptors.push(interceptor);
  }

  addResponseInterceptor(interceptor: ResponseInterceptor): void {
    this.responseInterceptors.push(interceptor);
  }

  async processRequest(config: RequestConfig): Promise<RequestConfig> {
    let current = { ...config };
    for (const interceptor of this.requestInterceptors) {
      current = await interceptor.onRequest(current);
    }
    return current;
  }

  async processResponse(response: ApiResponse): Promise<ApiResponse> {
    let current = { ...response };
    for (const interceptor of this.responseInterceptors) {
      current = await interceptor.onResponse(current);
    }
    return current;
  }
}
```

---

## 错误处理与重试机制

### 指数退避策略 (Exponential Backoff)

```typescript
export interface RetryConfig {
  maxRetries: number;
  baseDelay: number;
  maxDelay: number;
  retryableStatuses: number[];
  retryableErrors: string[];
}

const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxRetries: 3,
  baseDelay: 1000,
  maxDelay: 30000,
  retryableStatuses: [408, 429, 500, 502, 503, 504],
  retryableErrors: ['ETIMEDOUT', 'ECONNRESET', 'ECONNREFUSED', 'ENETUNREACH']
};

function calculateBackoff(attempt: number, config: RetryConfig): number {
  const delay = Math.min(
    config.baseDelay * Math.pow(2, attempt),
    config.maxDelay
  );
  // 添加随机抖动 (jitter)，防止惊群效应
  return delay * (0.5 + Math.random() * 0.5);
}

function shouldRetry(error: any, statusCode: number, config: RetryConfig): boolean {
  if (config.retryableStatuses.includes(statusCode)) {
    return true;
  }
  const errorCode = error?.code ?? '';
  if (config.retryableErrors.includes(errorCode)) {
    return true;
  }
  return false;
}

async function withRetry<T>(
  fn: () => Promise<T>,
  config: RetryConfig = DEFAULT_RETRY_CONFIG
): Promise<T> {
  let lastError: any;

  for (let attempt = 0; attempt <= config.maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      const statusCode = error?.code ?? 0;

      if (attempt < config.maxRetries && shouldRetry(error, statusCode, config)) {
        const delay = calculateBackoff(attempt, config);
        console.log(
          `[Retry] Attempt ${attempt + 1}/${config.maxRetries} failed, ` +
          `retrying in ${Math.round(delay)}ms`
        );
        await new Promise(resolve => setTimeout(resolve, delay));
      } else {
        break;
      }
    }
  }

  throw lastError;
}
```

### 结合 HTTP 客户端使用

```typescript
const apiClient = new HttpClient('https://api.example.com');

async function fetchWithRetry<T>(url: string): Promise<ApiResponse<T>> {
  return withRetry(
    () => apiClient.get<T>(url),
    {
      maxRetries: 3,
      baseDelay: 1000,
      maxDelay: 10000,
      retryableStatuses: [408, 429, 500, 502, 503],
      retryableErrors: ['ETIMEDOUT']
    }
  );
}
```

### 类封装重试 (RetryHandler 模式)

另一种基于类封装的指数退避重试实现，通过 `shouldRetry` 回调提供更灵活的重试条件控制：

```typescript
export interface RetryConfig {
  maxRetries: number;
  baseDelay: number;
  maxDelay: number;
  shouldRetry?: (error: Error) => boolean;
}

export class RetryHandler {
  static async withRetry<T>(
    fn: () => Promise<T>,
    config: RetryConfig
  ): Promise<T> {
    let lastError: Error | null = null;

    for (let attempt = 0; attempt <= config.maxRetries; attempt++) {
      try {
        return await fn();
      } catch (error) {
        lastError = error as Error;

        // 检查是否应该重试
        if (config.shouldRetry && !config.shouldRetry(lastError)) {
          throw lastError;
        }

        // 最后一次尝试不再等待
        if (attempt < config.maxRetries) {
          const delay = Math.min(
            config.baseDelay * Math.pow(2, attempt),
            config.maxDelay
          );
          await this.sleep(delay);
        }
      }
    }

    throw lastError;
  }

  private static sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// 使用示例: 结合 ErrorHandler 判断网络错误
const response = await RetryHandler.withRetry(
  () => httpClient.get('/data'),
  {
    maxRetries: 3,
    baseDelay: 1000,
    maxDelay: 10000,
    shouldRetry: (error) => ErrorHandler.isNetworkError(error)
  }
);
```

---

## 请求/响应缓存

### 内存缓存

```typescript
interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

class MemoryCache {
  private cache: Map<string, CacheEntry<any>> = new Map();
  private maxEntries: number;

  constructor(maxEntries: number = 100) {
    this.maxEntries = maxEntries;
  }

  set<T>(key: string, data: T, ttl: number = 60000): void {
    if (this.cache.size >= this.maxEntries) {
      // 移除最旧的缓存
      const firstKey = this.cache.keys().next().value;
      if (firstKey) this.cache.delete(firstKey);
    }

    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    });
  }

  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return null;
    }

    return entry.data as T;
  }

  has(key: string): boolean {
    return this.get(key) !== null;
  }

  invalidate(key: string): void {
    this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }
}
```

### 缓存网络请求

```typescript
class CachedHttpClient {
  private client: HttpClient;
  private cache: MemoryCache;

  constructor(baseUrl: string, cacheMaxEntries?: number) {
    this.client = new HttpClient(baseUrl);
    this.cache = new MemoryCache(cacheMaxEntries);
  }

  async getWithCache<T>(
    url: string,
    params?: Record<string, string>,
    ttl: number = 60000
  ): Promise<ApiResponse<T>> {
    const cacheKey = this.buildCacheKey(url, params);

    // 查缓存
    const cached = this.cache.get<ApiResponse<T>>(cacheKey);
    if (cached) {
      return cached;
    }

    // 发请求
    const response = await this.client.get<T>(url, params);

    // 写缓存（仅缓存成功响应）
    if (response.code >= 200 && response.code < 300) {
      this.cache.set(cacheKey, response, ttl);
    }

    return response;
  }

  invalidateCache(url: string, params?: Record<string, string>): void {
    this.cache.invalidate(this.buildCacheKey(url, params));
  }

  private buildCacheKey(url: string, params?: Record<string, string>): string {
    if (!params) return url;
    const query = Object.entries(params)
      .map(([k, v]) => `${k}=${v}`)
      .sort()
      .join('&');
    return `${url}?${query}`;
  }
}
```

---

## 域名解析 (DNS)

### 使用系统 DNS 解析

```typescript
import { netConnection } from '@kit.NetworkKit';

async function resolveDomain(host: string): Promise<string[]> {
  try {
    const connection = netConnection.createNetConnection();
    const addresses = await connection.getAddressesByName(host);
    return addresses.map(addr => addr.address);
  } catch (err) {
    console.error('DNS resolution failed:', JSON.stringify(err));
    throw err;
  }
}

// 使用示例
async function checkDNS() {
  try {
    const ips = await resolveDomain('example.com');
    console.log('Resolved IPs:', ips);
  } catch (err) {
    console.error('DNS error:', err.message);
  }
}
```

### 自定义 DNS 配置

```typescript
interface DnsConfig {
  primaryDns: string;
  secondaryDns: string;
  timeout: number;
}

class CustomDnsResolver {
  private config: DnsConfig;

  constructor(config: DnsConfig) {
    this.config = config;
  }

  async resolve(host: string): Promise<string[]> {
    // 使用自定义 DNS 服务器进行解析
    // 可以通过 UDP 向 DNS 服务器发送查询
    console.log(`Resolving ${host} with DNS ${this.config.primaryDns}`);
    // 实现 DNS over UDP 或 DNS over HTTPS
    return [];
  }
}
```

---

## 网络安全

### HTTPS 请求

```typescript
import { http } from '@kit.NetworkKit';

// HTTPS 请求（默认使用系统证书）
const httpRequest = http.createHttp();
const response = await httpRequest.request('https://api.example.com/data', {
  method: http.RequestMethod.GET,
  // HTTPS 默认启用，无需额外配置
  // 系统会自动校验证书有效性
});
```

### 证书校验

```typescript
import { security } from '@kit.SecurityKit';
import { http } from '@kit.NetworkKit';

class SecureHttpClient {
  async requestWithCertCheck(url: string): Promise<string> {
    const httpRequest = http.createHttp();

    // 配置证书校验
    // 可以指定 CA 证书或自定义验证逻辑
    httpRequest.request(url, {
      method: http.RequestMethod.GET,
      // 配置证书信息
      certificatePinning: [
        {
          host: 'api.example.com',
          // SHA-256 公钥哈希值
          publicKeyHash: 'sha256/xxxxxxxxxxxxxxxxxxxxx'
        }
      ]
    });

    try {
      const response = await httpRequest.request(url, {
        method: http.RequestMethod.GET
      });
      return response.result as string;
    } finally {
      httpRequest.destroy();
    }
  }
}
```

### 网络安全配置 (module.json5)

```json5
{
  module: {
    // ...
    deviceTypes: ["phone", "tablet"],
    // 网络安全配置
    network: {
      // 允许明文流量（仅开发环境）
      cleartext: {
        // 允许的域名列表
        domains: ["localhost", "10.0.2.2"]
      }
    }
  }
}
```

### 安全最佳实践

```typescript
// 1. 始终使用 HTTPS 而非 HTTP
// 2. Token 存储在安全存储中
// 3. 敏感信息使用加密传输
// 4. 实现证书固定 (Certificate Pinning)
// 5. 避免在 URL 中传递敏感参数
// 6. 实现请求签名机制

// Token 安全管理
import { preferences } from '@kit.ArkData';

class SecureTokenManager {
  private static instance: SecureTokenManager;
  private storage: preferences.Preferences;

  private constructor() {}

  static getInstance(): SecureTokenManager {
    if (!this.instance) {
      this.instance = new SecureTokenManager();
    }
    return this.instance;
  }

  async saveToken(token: string): Promise<void> {
    // 使用系统安全存储保存 Token
    const store = await preferences.getPreferences(
      globalThis.abilityContext,
      'secure_store'
    );
    await store.put('auth_token', token);
    await store.flush();
  }

  async getToken(): Promise<string | null> {
    const store = await preferences.getPreferences(
      globalThis.abilityContext,
      'secure_store'
    );
    return store.get('auth_token', '');
  }

  async clearToken(): Promise<void> {
    const store = await preferences.getPreferences(
      globalThis.abilityContext,
      'secure_store'
    );
    await store.delete('auth_token');
    await store.flush();
  }
}
```

---

## 避坑指南

### 1. HTTP 请求后必须 destroy() 清理资源

```typescript
// 错误: 未清理资源，导致内存泄漏
async function badRequest(url: string) {
  const httpRequest = http.createHttp();
  const response = await httpRequest.request(url);
  return response.result; // httpRequest 未 destroy
}

// 正确: 使用 try/finally 保证清理
async function goodRequest(url: string) {
  const httpRequest = http.createHttp();
  try {
    const response = await httpRequest.request(url);
    return response.result;
  } finally {
    httpRequest.destroy(); // 无论成功失败都清理
  }
}
```

### 2. 网络请求的超时设置

```typescript
// 错误: 不设置超时，请求可能挂起
httpRequest.request(url);

// 正确: 设置合理的超时时间
httpRequest.request(url, {
  connectTimeout: 30000,  // 连接超时 30s
  readTimeout: 30000      // 读取超时 30s
});
```

### 3. 避免在组件生命周期外使用网络请求

```typescript
// 错误: 页面已销毁，但请求仍在继续
@Component
struct BadPage {
  aboutToDisappear(): void {
    // 没有取消正在进行的请求
  }

  fetchData(): void {
    this.httpClient.get('/data').then(data => {
      // 页面已销毁，但还在更新状态
      this.data = data; // 可能触发异常
    });
  }
}

// 正确: 页面销毁时取消请求
@Component
struct GoodPage {
  private isActive: boolean = false;
  private abortController: AbortController | null = null;

  aboutToAppear(): void {
    this.isActive = true;
  }

  aboutToDisappear(): void {
    this.isActive = false;
    this.abortController?.abort();
  }

  async fetchData(): Promise<void> {
    if (!this.isActive) return;

    this.abortController = new AbortController();
    try {
      const data = await this.httpClient.get('/data');
      if (this.isActive) {
        this.data = data;
      }
    } catch (err) {
      if (this.isActive) {
        this.error = err;
      }
    }
  }
}
```

### 4. 不要在循环中创建 HTTP 连接

```typescript
// 错误: 循环中重复创建 httpRequest
async function badBatchRequest(urls: string[]) {
  for (const url of urls) {
    const httpRequest = http.createHttp(); // 多次创建
    const response = await httpRequest.request(url);
    httpRequest.destroy();
  }
}

// 正确: 复用连接或使用并发控制
async function goodBatchRequest(urls: string[]) {
  // 使用 Promise.all 并发请求
  const promises = urls.map(url => makeRequest(url));
  return Promise.all(promises);
}

// 正确: 控制并发数
async function batchWithConcurrency(urls: string[], concurrency: number = 3) {
  const results = [];
  const queue = [...urls];

  async function worker() {
    while (queue.length > 0) {
      const url = queue.shift()!;
      results.push(await makeRequest(url));
    }
  }

  const workers = Array(concurrency).fill(0).map(() => worker());
  await Promise.all(workers);
  return results;
}
```

---

## 统一错误处理 (ErrorHandler 模式)

将 HTTP 错误码映射为用户可读的错误消息，并提供认证错误与网络错误的分类判断：

```typescript
export class HttpError extends Error {
  code: number;
  data?: any;

  constructor(message: string, code: number, data?: any) {
    super(message);
    this.code = code;
    this.data = data;
  }
}

export class ErrorHandler {
  // 错误码映射表
  private static errorMessages: Record<number, string> = {
    400: '请求参数错误',
    401: '未授权，请先登录',
    403: '没有权限访问',
    404: '请求的资源不存在',
    500: '服务器内部错误',
    502: '网关错误',
    503: '服务不可用',
    504: '网关超时'
  };

  /**
   * 将错误对象转换为用户可读的错误消息
   */
  static handle(error: Error): string {
    if (error instanceof HttpError) {
      return this.errorMessages[error.code] || error.message;
    }

    // 网络错误
    if (error.message.includes('Network')) {
      return '网络连接失败，请检查网络';
    }

    // 超时错误
    if (error.message.includes('timeout')) {
      return '请求超时，请稍后重试';
    }

    return error.message || '未知错误';
  }

  /**
   * 判断是否为认证错误 (HTTP 401)
   */
  static isAuthError(error: Error): boolean {
    if (error instanceof HttpError) {
      return error.code === 401;
    }
    return false;
  }

  /**
   * 判断是否为网络层面的错误（非业务错误）
   */
  static isNetworkError(error: Error): boolean {
    return error.message.includes('Network') || error.message.includes('timeout');
  }
}
```

---

## API 服务封装实践

基于 `HttpClient` 封装面向具体业务域的 API 服务类，将 API 调用的 URL 拼接、参数传递和状态管理集中处理。

### 用户服务封装

```typescript
export interface User {
  id: number;
  name: string;
  email: string;
  avatar: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: User;
}

class UserApiService {
  private prefix = '/user';

  /**
   * 登录：调用登录接口并自动保存 token 和用户信息到 AppStorage
   */
  async login(data: LoginRequest): Promise<ApiResponse<LoginResponse>> {
    const response = await httpClient.post<LoginResponse>(`${this.prefix}/login`, data);

    if (response.code === 0 && response.data) {
      // 保存 token 和用户信息到全局状态
      AppStorage.setOrCreate('userToken', response.data.token);
      AppStorage.setOrCreate('userInfo', response.data.user);
    }

    return response;
  }

  /**
   * 登出：清除本地存储的认证信息
   */
  async logout(): Promise<void> {
    await httpClient.post(`${this.prefix}/logout`);
    AppStorage.delete('userToken');
    AppStorage.delete('userInfo');
  }

  /**
   * 获取当前登录用户信息
   */
  async getCurrentUser(): Promise<ApiResponse<User>> {
    return httpClient.get<User>(`${this.prefix}/me`);
  }

  /**
   * 更新用户个人资料
   */
  async updateProfile(data: Partial<User>): Promise<ApiResponse<User>> {
    return httpClient.put<User>(`${this.prefix}/profile`, data);
  }
}

export const userApi = new UserApiService();
```

### 通用 CRUD 服务封装

适用于大多数 RESTful 资源的数据访问，封装分页查询、增删改查的标准模式：

```typescript
export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}

class DataApiService {
  /**
   * 分页列表查询
   */
  async getList<T>(
    endpoint: string,
    page: number = 1,
    pageSize: number = 20
  ): Promise<ApiResponse<PaginatedResponse<T>>> {
    return httpClient.get<PaginatedResponse<T>>(endpoint, {
      page: page.toString(),
      pageSize: pageSize.toString()
    });
  }

  /**
   * 获取单条记录
   */
  async getItem<T>(endpoint: string, id: number): Promise<ApiResponse<T>> {
    return httpClient.get<T>(`${endpoint}/${id}`);
  }

  /**
   * 创建记录
   */
  async create<T>(endpoint: string, data: Partial<T>): Promise<ApiResponse<T>> {
    return httpClient.post<T>(endpoint, data);
  }

  /**
   * 更新记录
   */
  async update<T>(endpoint: string, id: number, data: Partial<T>): Promise<ApiResponse<T>> {
    return httpClient.put<T>(`${endpoint}/${id}`, data);
  }

  /**
   * 删除记录
   */
  async delete(endpoint: string, id: number): Promise<ApiResponse<void>> {
    return httpClient.delete<void>(`${endpoint}/${id}`);
  }
}

export const dataApi = new DataApiService();
```

> **参考链接汇总**
>
> - [Network Kit 概述](https://developer.huawei.com/consumer/cn/doc/harmonyos-guides-V5/network-kit-overview-V5)
> - [RCP API 参考](https://developer.huawei.com/consumer/cn/doc/harmonyos-references-V5/remote-communication-rcp-V5)
