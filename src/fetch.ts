import merge from 'deepmerge'

interface FetchAPIGeneric {
  [key: string]: any
}

export const fetchAPI = async <T = FetchAPIGeneric>(
  url: RequestInfo,
  options: RequestInit = {},
) => {
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
      response.headers.get('content-type') || '',
    )
    const text = await response.text()

    if (jsonType) {
      return Promise.resolve({
        status: response.status,
        statusText: response.statusText,
        json: JSON.parse(text),
        text,
      })
    } else {
      return Promise.resolve({
        status: response.status,
        statusText: response.statusText,
        json: null,
        text,
      })
    }
  })
}

export const genDefaultFetchAPI = <T = FetchAPIGeneric>(data: T) => {
  return {
    status: 200,
    statusText: 'OK',
    ...(typeof data === 'string' ? { text: data } : { json: data }),
  }
}

export const fetcherSWR = (url: RequestInfo, options: RequestInit = {}) =>
  fetchAPI(url, options)
