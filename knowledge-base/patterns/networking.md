# ArkTS 网络请求模式

> 适用版本: HarmonyOS NEXT (API 12+)

## 概述

HarmonyOS 提供 `@ohos.net.http` 模块进行网络请求。本文档介绍网络请求的封装模式和最佳实践。

---

## 基础 HTTP 请求

### 简单请求

```typescript
import http from '@ohos.net.http'

async function fetchData(): Promise<void> {
  // 创建 HTTP 请求对象
  let httpRequest = http.createHttp()

  try {
    // 发起请求
    let response = await httpRequest.request(
      'https://api.example.com/data',
      {
        method: http.RequestMethod.GET,
        header: {
          'Content-Type': 'application/json'
        }
      }
    )

    // 处理响应
    if (response.responseCode === 200) {
      let data = JSON.parse(response.result as string)
      console.log('Data:', data)
    }
  } catch (error) {
    console.error('Request failed:', error)
  } finally {
    // 销毁请求对象
    httpRequest.destroy()
  }
}
```

---

## HTTP 客户端封装

### 完整封装示例

```typescript
// services/http/HttpClient.ets
import http from '@ohos.net.http'

// 响应类型
export interface ApiResponse<T> {
  code: number
  message: string
  data: T
}

// 请求配置
export interface RequestConfig {
  url: string
  method?: http.RequestMethod
  data?: object
  headers?: Record<string, string>
  timeout?: number
}

// 拦截器接口
export interface RequestInterceptor {
  onRequest?(config: RequestConfig): RequestConfig
  onResponse?<T>(response: ApiResponse<T>): ApiResponse<T>
  onError?(error: Error): void
}

export class HttpClient {
  private static instance: HttpClient
  private baseURL: string = ''
  private interceptors: RequestInterceptor[] = []
  private defaultTimeout: number = 30000

  private constructor() {}

  static getInstance(): HttpClient {
    if (!HttpClient.instance) {
      HttpClient.instance = new HttpClient()
    }
    return HttpClient.instance
  }

  // 设置基础 URL
  setBaseURL(url: string): void {
    this.baseURL = url
  }

  // 添加拦截器
  addInterceptor(interceptor: RequestInterceptor): void {
    this.interceptors.push(interceptor)
  }

  // 通用请求方法
  async request<T>(config: RequestConfig): Promise<ApiResponse<T>> {
    // 应用请求拦截器
    for (const interceptor of this.interceptors) {
      if (interceptor.onRequest) {
        config = interceptor.onRequest(config)
      }
    }

    const httpRequest = http.createHttp()
    const fullUrl = this.buildUrl(config.url)

    try {
      const response = await httpRequest.request(fullUrl, {
        method: config.method || http.RequestMethod.GET,
        header: this.buildHeaders(config.headers),
        extraData: config.data ? JSON.stringify(config.data) : undefined,
        expectDataType: http.HttpDataType.STRING,
        connectTimeout: config.timeout || this.defaultTimeout,
        readTimeout: config.timeout || this.defaultTimeout
      })

      // 解析响应
      let result: ApiResponse<T>
      if (response.responseCode === 200) {
        result = JSON.parse(response.result as string)
      } else {
        result = {
          code: response.responseCode,
          message: `HTTP Error: ${response.responseCode}`,
          data: null as T
        }
      }

      // 应用响应拦截器
      for (const interceptor of this.interceptors) {
        if (interceptor.onResponse) {
          result = interceptor.onResponse(result)
        }
      }

      return result

    } catch (error) {
      const err = error as Error

      // 应用错误拦截器
      for (const interceptor of this.interceptors) {
        if (interceptor.onError) {
          interceptor.onError(err)
        }
      }

      throw err

    } finally {
      httpRequest.destroy()
    }
  }

  // GET 请求
  async get<T>(url: string, params?: Record<string, string>): Promise<ApiResponse<T>> {
    let fullUrl = url
    if (params) {
      const queryString = Object.entries(params)
        .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
        .join('&')
      fullUrl = `${url}?${queryString}`
    }

    return this.request<T>({ url: fullUrl, method: http.RequestMethod.GET })
  }

  // POST 请求
  async post<T>(url: string, data?: object): Promise<ApiResponse<T>> {
    return this.request<T>({
      url,
      method: http.RequestMethod.POST,
      data
    })
  }

  // PUT 请求
  async put<T>(url: string, data?: object): Promise<ApiResponse<T>> {
    return this.request<T>({
      url,
      method: http.RequestMethod.PUT,
      data
    })
  }

  // DELETE 请求
  async delete<T>(url: string): Promise<ApiResponse<T>> {
    return this.request<T>({ url, method: http.RequestMethod.DELETE })
  }

  // 构建完整 URL
  private buildUrl(path: string): string {
    if (path.startsWith('http')) {
      return path
    }
    return `${this.baseURL}${path}`
  }

  // 构建请求头
  private buildHeaders(customHeaders?: Record<string, string>): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    }

    // 添加 token
    const token = AppStorage.get<string>('userToken')
    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }

    // 合并自定义 headers
    if (customHeaders) {
      Object.assign(headers, customHeaders)
    }

    return headers
  }
}

// 导出单例
export const httpClient = HttpClient.getInstance()
```

### 初始化配置

```typescript
// entry/src/main/ets/entryability/EntryAbility.ets
import { httpClient } from '../services/http/HttpClient'

export default class EntryAbility extends UIAbility {
  onCreate(): void {
    // 配置 HTTP 客户端
    httpClient.setBaseURL('https://api.example.com')

    // 添加请求拦截器
    httpClient.addInterceptor({
      onRequest: (config) => {
        console.log(`[HTTP] ${config.method} ${config.url}`)
        return config
      },
      onResponse: (response) => {
        console.log(`[HTTP] Response: ${response.code}`)
        return response
      },
      onError: (error) => {
        console.error(`[HTTP] Error: ${error.message}`)
      }
    })
  }
}
```

---

## API 服务封装

### 用户服务示例

```typescript
// services/api/UserApi.ets
import { httpClient, ApiResponse } from '../http/HttpClient'

export interface User {
  id: number
  name: string
  email: string
  avatar: string
}

export interface LoginRequest {
  email: string
  password: string
}

export interface LoginResponse {
  token: string
  user: User
}

class UserApiService {
  private prefix = '/user'

  async login(data: LoginRequest): Promise<ApiResponse<LoginResponse>> {
    const response = await httpClient.post<LoginResponse>(`${this.prefix}/login`, data)

    if (response.code === 0 && response.data) {
      // 保存 token
      AppStorage.setOrCreate('userToken', response.data.token)
      AppStorage.setOrCreate('userInfo', response.data.user)
    }

    return response
  }

  async logout(): Promise<void> {
    await httpClient.post(`${this.prefix}/logout`)
    AppStorage.delete('userToken')
    AppStorage.delete('userInfo')
  }

  async getCurrentUser(): Promise<ApiResponse<User>> {
    return httpClient.get<User>(`${this.prefix}/me`)
  }

  async updateProfile(data: Partial<User>): Promise<ApiResponse<User>> {
    return httpClient.put<User>(`${this.prefix}/profile`, data)
  }
}

export const userApi = new UserApiService()
```

### 数据服务示例

```typescript
// services/api/DataApi.ets
import { httpClient, ApiResponse } from '../http/HttpClient'

export interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  pageSize: number
}

class DataApiService {
  async getList<T>(
    endpoint: string,
    page: number = 1,
    pageSize: number = 20
  ): Promise<ApiResponse<PaginatedResponse<T>>> {
    return httpClient.get<PaginatedResponse<T>>(endpoint, {
      page: page.toString(),
      pageSize: pageSize.toString()
    })
  }

  async getItem<T>(endpoint: string, id: number): Promise<ApiResponse<T>> {
    return httpClient.get<T>(`${endpoint}/${id}`)
  }

  async create<T>(endpoint: string, data: Partial<T>): Promise<ApiResponse<T>> {
    return httpClient.post<T>(endpoint, data)
  }

  async update<T>(endpoint: string, id: number, data: Partial<T>): Promise<ApiResponse<T>> {
    return httpClient.put<T>(`${endpoint}/${id}`, data)
  }

  async delete(endpoint: string, id: number): Promise<ApiResponse<void>> {
    return httpClient.delete<void>(`${endpoint}/${id}`)
  }
}

export const dataApi = new DataApiService()
```

---

## 错误处理模式

### 统一错误处理

```typescript
// services/http/ErrorHandler.ets
export class HttpError extends Error {
  code: number
  data?: any

  constructor(message: string, code: number, data?: any) {
    super(message)
    this.code = code
    this.data = data
  }
}

export class ErrorHandler {
  // 错误码映射
  private static errorMessages: Record<number, string> = {
    400: '请求参数错误',
    401: '未授权，请先登录',
    403: '没有权限访问',
    404: '请求的资源不存在',
    500: '服务器内部错误',
    502: '网关错误',
    503: '服务不可用',
    504: '网关超时'
  }

  static handle(error: Error): string {
    if (error instanceof HttpError) {
      return this.errorMessages[error.code] || error.message
    }

    // 网络错误
    if (error.message.includes('Network')) {
      return '网络连接失败，请检查网络'
    }

    // 超时错误
    if (error.message.includes('timeout')) {
      return '请求超时，请稍后重试'
    }

    return error.message || '未知错误'
  }

  static isAuthError(error: Error): boolean {
    if (error instanceof HttpError) {
      return error.code === 401
    }
    return false
  }

  static isNetworkError(error: Error): boolean {
    return error.message.includes('Network') || error.message.includes('timeout')
  }
}
```

### 在组件中使用

```typescript
// pages/UserPage.ets
import { userApi } from '../services/api/UserApi'
import { ErrorHandler } from '../services/http/ErrorHandler'

@Component
struct UserPage {
  @State user: User | null = null
  @State loading: boolean = false
  @State errorMessage: string = ''

  async aboutToAppear() {
    await this.loadUser()
  }

  async loadUser() {
    this.loading = true
    this.errorMessage = ''

    try {
      const response = await userApi.getCurrentUser()
      if (response.code === 0) {
        this.user = response.data
      } else {
        this.errorMessage = response.message
      }
    } catch (error) {
      this.errorMessage = ErrorHandler.handle(error as Error)
    } finally {
      this.loading = false
    }
  }

  build() {
    Column() {
      if (this.loading) {
        LoadingProgress()
      } else if (this.errorMessage) {
        Text(this.errorMessage)
          .fontColor(Color.Red)
        Button('重试')
          .onClick(() => this.loadUser())
      } else if (this.user) {
        Text(`Hello, ${this.user.name}`)
      }
    }
  }
}
```

---

## 重试机制

### 指数退避重试

```typescript
// services/http/RetryHandler.ets
export interface RetryConfig {
  maxRetries: number
  baseDelay: number
  maxDelay: number
  shouldRetry?: (error: Error) => boolean
}

export class RetryHandler {
  static async withRetry<T>(
    fn: () => Promise<T>,
    config: RetryConfig
  ): Promise<T> {
    let lastError: Error | null = null

    for (let attempt = 0; attempt <= config.maxRetries; attempt++) {
      try {
        return await fn()
      } catch (error) {
        lastError = error as Error

        // 检查是否应该重试
        if (config.shouldRetry && !config.shouldRetry(lastError)) {
          throw lastError
        }

        // 最后一次尝试不再等待
        if (attempt < config.maxRetries) {
          const delay = Math.min(
            config.baseDelay * Math.pow(2, attempt),
            config.maxDelay
          )
          await this.sleep(delay)
        }
      }
    }

    throw lastError
  }

  private static sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }
}

// 使用
const response = await RetryHandler.withRetry(
  () => httpClient.get('/data'),
  {
    maxRetries: 3,
    baseDelay: 1000,
    maxDelay: 10000,
    shouldRetry: (error) => ErrorHandler.isNetworkError(error)
  }
)
```

---

## 请求缓存

### 简单内存缓存

```typescript
// services/http/CacheHandler.ets
interface CacheEntry<T> {
  data: T
  timestamp: number
  ttl: number
}

export class CacheHandler {
  private static cache: Map<string, CacheEntry<any>> = new Map()

  static async getOrFetch<T>(
    key: string,
    fetchFn: () => Promise<T>,
    ttl: number = 5 * 60 * 1000 // 5 分钟
  ): Promise<T> {
    const cached = this.cache.get(key)

    if (cached && Date.now() - cached.timestamp < cached.ttl) {
      return cached.data
    }

    const data = await fetchFn()
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    })

    return data
  }

  static invalidate(key: string): void {
    this.cache.delete(key)
  }

  static clear(): void {
    this.cache.clear()
  }
}

// 使用
const user = await CacheHandler.getOrFetch(
  'current-user',
  () => userApi.getCurrentUser(),
  10 * 60 * 1000 // 缓存 10 分钟
)
```

---

## 权限配置

### 网络权限声明

```json5
// module.json5
{
  "module": {
    "requestPermissions": [
      {
        "name": "ohos.permission.INTERNET",
        "reason": "需要网络访问来获取数据"
      }
    ]
  }
}
```

---

## 快速参考

| API | 用途 |
|-----|------|
| `http.createHttp()` | 创建 HTTP 请求对象 |
| `request.request()` | 发起请求 |
| `http.destroy()` | 销毁请求对象 |
| `RequestMethod.GET/POST/PUT/DELETE` | 请求方法 |
| `responseCode` | HTTP 状态码 |
| `result` | 响应数据 |
| `header` | 请求/响应头 |
| `connectTimeout` | 连接超时 |
| `readTimeout` | 读取超时 |

| 模式 | 用途 |
|------|------|
| 单例 HttpClient | 统一管理请求 |
| 拦截器 | 请求/响应预处理 |
| API 服务类 | 封装特定业务 API |
| 错误处理器 | 统一错误处理 |
| 重试机制 | 网络不稳定时自动重试 |
| 缓存机制 | 减少重复请求 |