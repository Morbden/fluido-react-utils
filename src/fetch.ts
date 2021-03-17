import merge from 'deepmerge'

interface FetchAPIGeneric {
  [key: string]: any
}

interface FetchAPIResult<T> {
  status: number
  statusText: string
  data: T | string
}

interface FetchAPIInterface<T = FetchAPIGeneric> {
  (url: RequestInfo, options?: RequestInit): Promise<FetchAPIResult<T>>
}

interface GenDefaultFetchAPIInterface<T = FetchAPIGeneric> {
  (data: T): FetchAPIResult<T>
}

export const fetchAPI: FetchAPIInterface = async (url, options = {}) => {
  return fetch(
    url,
    merge(
      {
        headers: {
          Accept: 'application/json, text/plain',
          'Content-Type': 'application/json',
        },
        credentials: 'same-origin',
        redirect: 'follow',
      },
      options,
    ),
  ).then(async (response) => {
    const jsonType = /application\/json/g.test(
      response.headers.get('content-type'),
    )
    if (jsonType) {
      return Promise.resolve({
        status: response.status,
        statusText: response.statusText,
        data: response.json(),
      })
    } else {
      return Promise.resolve({
        status: response.status,
        statusText: response.statusText,
        data: response.text(),
      })
    }
  })
}

export const genDefaultFetchAPI: GenDefaultFetchAPIInterface = (data) => {
  return {
    status: 200,
    statusText: 'OK',
    data,
  }
}
