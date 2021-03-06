import merge from 'deepmerge'

type FetchAPIResult = { [key: string]: any }

interface FetchAPIInterface {
  (url: RequestInfo, options?: RequestInit): Promise<
    [number, FetchAPIResult | FetchAPIResult[]]
  >
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
    return Promise.all([
      response.status,
      jsonType ? response.json() : response.text(),
    ])
  })
}
