import { useEffect, useState } from 'react'
import { fetchAPI } from './fetch'

interface NextStaticPropsReturn {
  props?: { [key: string]: any }
  revalidate?: number
  notFound?: boolean
}

interface JoinStaticPropsType {
  (...fns: [() => any | any]): () => Promise<NextStaticPropsReturn>
}
interface GetStaticFetchType {
  (name: string, uri: RequestInfo, opt?: RequestInit): () => Promise<{
    [key: string]: any
  }>
}
interface GetStaticInternalType {
  (name: string, fn: () => any | Promise<any>): () => Promise<{
    [key: string]: any
  }>
}
interface PromiseDelayType {
  (time: number): Promise<void>
}
interface SimplifyIdType {
  (id: string, size?: number, fill?: string | number): string
}
interface UseMediaQueryType {
  (query: string, isSSR?: boolean): boolean
}

export const joinStaticProps: JoinStaticPropsType = (...fns) => {
  let config = {}
  if (typeof fns[fns.length - 1] === 'object') {
    config = fns.pop()
  }
  return async () => {
    try {
      const results = await Promise.all(fns.map((fn) => fn()))
      return {
        props: results.reduce((prev, cur) => Object.assign(prev, cur), {}),
        revalidate: 1,
        ...config,
      }
    } catch (err) {
      console.error(err)
      return {
        revalidate: 5,
        notFound: true,
        ...config,
      }
    }
  }
}

export const getStaticFetch: GetStaticFetchType = (name, uri, opt) => {
  return async () => {
    const result = await fetchAPI(uri, opt)
    return { [name]: result[1] }
  }
}

export const getStaticInternal: GetStaticInternalType = (name, fn) => {
  return async () => ({ [name]: fn() })
}

export const promiseDelay: PromiseDelayType = (time) => {
  return new Promise((res) => {
    setTimeout(res, time)
  })
}

export const simplifyId: SimplifyIdType = (id, size = 6, fill = '0') => {
  return (
    '#' +
    id
      .substring(id.length - size)
      .toUpperCase()
      .padStart(size, fill.toString())
  )
}

export const useMediaQuery: UseMediaQueryType = (query, isSSR = false) => {
  const [val, setVal] = useState<boolean>(false)

  useEffect(() => {
    let media: MediaQueryList

    const handler = (ev: MediaQueryListEvent) => {
      setVal(ev.matches)
    }

    if (!isSSR) {
      media = window.matchMedia(query)
      if (media.matches !== val) {
        setVal(media.matches)
      }

      media.addEventListener('change', handler)
    }
    return () => {
      if (media) {
        media.removeEventListener('change', handler)
        media = null
      }
    }
  }, [isSSR, query])

  return val
}
