import { init } from './app'
import { AxiosInstance } from 'axios'

const mockAxios = jest.genMockFromModule<AxiosInstance>('axios')

describe('handlers', () => {
  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('Create', () => {
    it('succeed', async () => {
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

      jest.spyOn(mockAxios, 'post').mockResolvedValueOnce({
        data: {
          client_id: 'id',
          client_id_issued_at: 1700825336,
          client_secret: 'secret',
          client_secret_expires_at: 0
        },
        status: 201
      } as any)

      const app = await init({ httpClient: mockAxios } as any)

      const resp = await app.inject({
        method: 'POST',
        url: '/',
        headers: {
          'Content-Type': 'application/json',
          'X-API-KEY': app.config.KONG_API_TOKEN
        },
        payload
      })

      expect(resp.statusCode).toEqual(201)
      expect(resp.body).toEqual(JSON.stringify({
        application: {
          client_id: 'id',
          client_id_issued_at: 1700825336,
          client_secret: 'secret',
          client_secret_expires_at: 0
        }
      }))
      expect(mockAxios.post).toHaveBeenCalledTimes(1)

      await app.close()
    })

    it('fails because of a wrong API token', async () => {
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

      const app = await init({ httpClient: mockAxios })

      const resp = await app.inject({
        method: 'POST',
        url: '/',
        headers: {
          'Content-Type': 'application/json'
        },
        payload
      })

      expect(resp.statusCode).toEqual(400)
      expect(resp.body).toEqual(JSON.stringify({ error: 'Wrong API-Key', error_description: 'wrong x-api-key header' }))
      expect(mockAxios.post).not.toHaveBeenCalled()

      await app.close()
    })

    it('fails because of a wrong payload', async () => {
      const payload = {
        client_name: 'test',
        grant_types: [
          'authorization_code', 'refresh_token', 'implicit'
        ],
        token_endpoint_auth_method: 'client_secret_post',
        application_description: 'disisatest',
        portal_id: '426ac0a7-aeb6-4043-a404-c4bfe24f2705',
        organization_id: '426ac0a7-aeb6-4043-a404-c4bfe24f2706'
      }

      const app = await init({ httpClient: mockAxios })

      const resp = await app.inject({
        method: 'POST',
        url: '/',
        headers: {
          'Content-Type': 'application/json',
          'X-API-KEY': app.config.KONG_API_TOKEN
        },
        payload
      })

      expect(resp.statusCode).toEqual(400)
      const parsedBody = JSON.parse(resp.body)
      expect(parsedBody.error_description[0].params.missingProperty).toBe('redirect_uris')
      expect(mockAxios.post).not.toHaveBeenCalled()

      await app.close()
    })
  })

  describe('Delete', () => {
    it('succeed', async () => {
      jest.spyOn(mockAxios, 'delete').mockResolvedValueOnce({ status: 200 } as any)

      const app = await init({ httpClient: mockAxios })

      const resp = await app.inject({
        method: 'DELETE',
        url: '/someId',
        headers: {
          'Content-Type': 'application/json',
          'X-API-KEY': app.config.KONG_API_TOKEN
        }
      })

      expect(resp.statusCode).toEqual(204)
      expect(mockAxios.delete).toHaveBeenCalledTimes(1)

      await app.close()
    })

    it('fails because of a wrong API token', async () => {
      const app = await init({ httpClient: mockAxios })

      const resp = await app.inject({
        method: 'DELETE',
        url: '/someId',
        headers: {
          'Content-Type': 'application/json'
        }
      })

      expect(resp.statusCode).toEqual(400)
      expect(resp.body).toEqual(JSON.stringify({ error: 'Wrong API-Key', error_description: 'wrong x-api-key header' }))
      expect(mockAxios.delete).not.toHaveBeenCalled()

      await app.close()
    })
  })

  describe('Refresh Secret', () => {
    it('succeed', async () => {
      jest.spyOn(mockAxios, 'post').mockResolvedValueOnce({
        data: {
          client_secret: 'secret'
        },
        status: 200
      } as any)

      const app = await init({ httpClient: mockAxios } as any)

      const resp = await app.inject({
        method: 'POST',
        url: '/someID/new-secret',
        headers: {
          'X-API-KEY': app.config.KONG_API_TOKEN
        }
      })

      expect(resp.statusCode).toEqual(200)
      expect(resp.body).toEqual(JSON.stringify({
        client_id: 'someID',
        client_secret: 'secret'
      }))
      expect(mockAxios.post).toHaveBeenCalledTimes(1)

      await app.close()
    })

    it('fails because of a wrong API token', async () => {
      const app = await init({ httpClient: mockAxios } as any)

      const resp = await app.inject({
        method: 'POST',
        url: '/someID/new-secret'
      })

      expect(resp.statusCode).toEqual(400)
      expect(resp.body).toEqual(JSON.stringify({ error: 'Wrong API-Key', error_description: 'wrong x-api-key header' }))
      expect(mockAxios.post).not.toHaveBeenCalled()

      await app.close()
    })
  })

  describe('EventHook', () => {
    it('succeed', async () => {
      const payload = {
        event_type: 'update_application',
        client_id: 'id',
        application_id: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
        application_name: 'name',
        application_description: 'description',
        portal_id: '3fa85f64-5717-4562-b3fc-2c963f66afa7',
        organization_id: '3fa85f64-5717-4562-b3fc-2c963f66afa8'
      }

      const app = await init({ httpClient: mockAxios })

      const resp = await app.inject({
        method: 'POST',
        url: '/someId/event-hook',
        headers: {
          'Content-Type': 'application/json',
          'X-API-KEY': app.config.KONG_API_TOKEN
        },
        payload
      })

      expect(resp.statusCode).toEqual(200)

      await app.close()
    })

    it('fails because of a wrong API token', async () => {
      const payload = {
        event_type: 'update_application',
        client_id: 'id',
        application_id: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
        application_name: 'name',
        application_description: 'description',
        portal_id: '3fa85f64-5717-4562-b3fc-2c963f66afa7',
        organization_id: '3fa85f64-5717-4562-b3fc-2c963f66afa8'
      }

      const app = await init({ httpClient: mockAxios })

      const resp = await app.inject({
        method: 'POST',
        url: '/someId/event-hook',
        headers: {
          'Content-Type': 'application/json'
        },
        payload
      })

      expect(resp.statusCode).toEqual(400)
      expect(resp.body).toEqual(JSON.stringify({ error: 'Wrong API-Key', error_description: 'wrong x-api-key header' }))

      await app.close()
    })

    it('fails because of a wrong payload', async () => {
      const payload = {
        client_id: 'id',
        application_id: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
        application_name: 'name',
        application_description: 'description',
        portal_id: '3fa85f64-5717-4562-b3fc-2c963f66afa7',
        organization_id: '3fa85f64-5717-4562-b3fc-2c963f66afa8'
      }

      const app = await init({ httpClient: mockAxios })

      const resp = await app.inject({
        method: 'POST',
        url: '/someId/event-hook',
        headers: {
          'Content-Type': 'application/json',
          'X-API-KEY': app.config.KONG_API_TOKEN
        },
        payload
      })

      expect(resp.statusCode).toEqual(400)
      const parsedBody = JSON.parse(resp.body)
      expect(parsedBody.error_description[0].params.missingProperty).toBe('event_type')

      await app.close()
    })
  })
})
