import { useEffect, useState } from 'react'

type RequestConfig = RequestInit & {
  token?: string
  basicToken?: string
}

type RequestHookConfig = RequestConfig & {
  blockRequest?: boolean
  dependencies?: any[]
}

type ErrorResult = {
  status?: number
  statusText?: string
  exception?: Error
}

interface TypedMap<T = any> {
  [key: string]: T
}

export function useFetch<T = any>(
  request: RequestInfo,
  config?: RequestHookConfig,
) {
  const [trigger, setTrigger] = useState(0)
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState<T | null>(null)
  const [textData, setTextData] = useState<string | null>(null)
  const [error, setError] = useState<ErrorResult | null>(null)
  const {
    blockRequest,
    headers,
    token,
    basicToken,
    dependencies = [],
    ...extraConfig
  } = config || {}

  useEffect(() => {
    setData(null)
    setTextData(null)
    setError(null)

    if (blockRequest) return

    const controller = new AbortController()

    setLoading(true)
    fetch(request, {
      signal: controller.signal,
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization:
          (token && `Bearer {token}`) ||
          (basicToken && `Basic ${basicToken}`) ||
          '',
        ...headers,
      },
      ...extraConfig,
    })
      .then(async (response) => {
        setError({
          status: response.status,
          statusText: response.statusText,
        })
        const value = await response.text()
        setTextData(value)
        try {
          const jsonValue = JSON.parse(value)
          setData(jsonValue)
        } catch (_) {}
      })
      .catch((err) => {
        console.error(err)
        setError({
          exception: err,
        })
      })
      .finally(() => {
        setLoading(false)
      })

    return () => {
      controller.abort()
    }
  }, [trigger, blockRequest].concat(dependencies))

  return {
    data,
    textData,
    error,
    loading,
    reRequest: () => setTrigger((i) => i++),
  }
}

export const fetchAPI = async (
  url: RequestInfo,
  options: RequestConfig = {},
) => {
  const { headers, token, basicToken, ...extraConfig } = options || {}

  return fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization:
        (token && `Bearer {token}`) ||
        (basicToken && `Basic ${basicToken}`) ||
        '',
      ...headers,
    },
    ...extraConfig,
  }).then(async (response) => {
    const jsonType = /application\/json/g.test(
      response.headers.get('content-type') || '',
    )
    const dataText = await response.text()

    if (jsonType) {
      return Promise.resolve({
        error: {
          status: response.status,
          statusText: response.statusText,
        },
        data: JSON.parse(dataText),
        dataText,
      })
    } else {
      return Promise.resolve({
        error: {
          status: response.status,
          statusText: response.statusText,
        },
        data: null,
        dataText,
      })
    }
  })
}

export const genDefaultFetchAPI = <T = TypedMap>(data: T) => {
  return {
    status: 200,
    statusText: 'OK',
    ...(typeof data === 'string'
      ? { dataText: data, data: null }
      : { data: data, dataText: JSON.stringify(data) }),
  }
}

export const fetcherSWR = (url: RequestInfo, options: RequestConfig = {}) =>
  fetchAPI(url, options)
