/* eslint-disable @typescript-eslint/no-unused-expressions,@typescript-eslint/require-await */

import 'mocha'
import {
  cleanupTests,
  createUser,
  flushAndRunServer,
  ServerInfo,
  setAccessTokensToServers,
  userLogin
} from '../../../../shared/extra-utils'
import { makePostBodyRequest } from '../../../../shared/extra-utils/requests/requests'
import { HttpStatusCode } from '../../../../shared/core-utils/miscs/http-error-codes'

describe('Test bulk API validators', function () {
  let server: ServerInfo
  let userAccessToken: string

  // ---------------------------------------------------------------

  before(async function () {
    this.timeout(120000)

    server = await flushAndRunServer(1)
    await setAccessTokensToServers([ server ])

    const user = { username: 'user1', password: 'password' }
    await createUser({ url: server.url, accessToken: server.accessToken, username: user.username, password: user.password })

    userAccessToken = await userLogin(server, user)
  })

  describe('When removing comments of', function () {
    const path = '/api/v1/bulk/remove-comments-of'

    it('Should fail with an unauthenticated user', async function () {
      await makePostBodyRequest({
        url: server.url,
        path,
        fields: { accountName: 'user1', scope: 'my-videos' },
        statusCodeExpected: HttpStatusCode.UNAUTHORIZED_401
      })
    })

    it('Should fail with an unknown account', async function () {
      await makePostBodyRequest({
        url: server.url,
        token: server.accessToken,
        path,
        fields: { accountName: 'user2', scope: 'my-videos' },
        statusCodeExpected: HttpStatusCode.NOT_FOUND_404
      })
    })

    it('Should fail with an invalid scope', async function () {
      await makePostBodyRequest({
        url: server.url,
        token: server.accessToken,
        path,
        fields: { accountName: 'user1', scope: 'my-videoss' },
        statusCodeExpected: HttpStatusCode.BAD_REQUEST_400
      })
    })

    it('Should fail to delete comments of the instance without the appropriate rights', async function () {
      await makePostBodyRequest({
        url: server.url,
        token: userAccessToken,
        path,
        fields: { accountName: 'user1', scope: 'instance' },
        statusCodeExpected: HttpStatusCode.FORBIDDEN_403
      })
    })

    it('Should succeed with the correct params', async function () {
      await makePostBodyRequest({
        url: server.url,
        token: server.accessToken,
        path,
        fields: { accountName: 'user1', scope: 'instance' },
        statusCodeExpected: HttpStatusCode.NO_CONTENT_204
      })
    })
  })

  after(async function () {
    await cleanupTests([ server ])
  })
})
