export interface InterceptCallbackPayload<T> {
  originalResponse: string
  originalData: T
}

export type InterceptorHandler<T> = (response: InterceptCallbackPayload<T>) => void | Promise<void>

interface Interceptor<T> {
  handler: InterceptorHandler<T>
  json: boolean
}

export class ResponseInterceptor {
  private patternMap: Record<string, Interceptor<any>[]> = {}

  onRaw(pattern: string, handler: InterceptorHandler<any>) {
    this.patternMap[pattern] ||= []
    this.patternMap[pattern].push({
      handler,
      json: false,
    })

    const off = () => {
      this.patternMap[pattern] = this.patternMap[pattern].filter((c) => c.handler !== handler)
    }

    return off
  }

  on<T = any>(pattern: string, handler: InterceptorHandler<T>) {
    this.patternMap[pattern] ||= []
    this.patternMap[pattern].push({
      handler,
      json: true,
    })

    const off = () => {
      this.patternMap[pattern] = this.patternMap[pattern].filter((c) => c.handler !== handler)
    }

    return off
  }

  async intercept(buffer, proxyRes, req, res) {
    let originalResponse = await buffer.toString('utf-8')

    for (const pattern in this.patternMap) {
      if (!req.url?.includes(pattern)) {
        continue
      }

      const interceptors = this.patternMap[pattern]
      if (!interceptors || !Array.isArray(interceptors) || interceptors.length === 0) {
        continue
      }

      for (const interceptor of interceptors) {
        const payload = {
          originalData: null,
          originalResponse,
        }

        if (interceptor.json) {
          try {
            payload.originalData = JSON.parse(originalResponse)
          } catch {
            console.warn('xx', 'failed to parse json', req?.url)
            continue
          }
        }

        const mayBePromise = interceptor.handler(payload)
        // @ts-ignore
        if (mayBePromise?.then) {
          await mayBePromise
        }

        if (interceptor.json) {
          const didManuallySetStringResponse = payload.originalResponse !== originalResponse
          originalResponse = didManuallySetStringResponse
            ? payload.originalResponse
            : JSON.stringify(payload.originalData)
        } else {
          originalResponse = payload.originalResponse
        }
      }
    }

    return originalResponse
  }
}
