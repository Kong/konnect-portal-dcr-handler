import { init } from './app'
import t from 'tap'

t.test('Create', async (t) => {
  t.plan(2)
  const payload = {
    redirect_uris: [
      'https://example.com'
    ],
    client_name: 'test',
    grant_types: [
      'authorization_code', 'refresh_token', 'implicit'
    ],
    token_endpoint_auth_method: 'client_secret_post',
    application_description: 'disisatest',
    portal_id: '426ac0a7-aeb6-4043-a404-c4bfe24f2705',
    organization_id: '426ac0a7-aeb6-4043-a404-c4bfe24f2706'
  }

  const mockHttp = {
    baseUrl: 'https://example.com',
    post: async (url, data, config) => {
      return {
        data: {
          client_id: 'id',
          client_id_issued_at: 1700825336,
          client_secret: 'secret',
          client_secret_expires_at: 0
        },
        status: 201
      }
    }
  }


  const app = await init({ httpClient: mockHttp })
  t.teardown(async () => {
    console.log('call close')
    await app.close()
    console.log('close exited')
  })

  const resp = await app.inject({
    method: 'POST',
    url: '/',
    headers: {
      'Content-Type': 'application/json'
    },
    payload
  })

  t.equal(resp.statusCode, 201)
  t.same(resp.body, JSON.stringify({
    application: {
      client_id: 'id',
      client_id_issued_at: 1700825336,
      client_secret: 'secret',
      client_secret_expires_at: 0
    }
  }))
})

