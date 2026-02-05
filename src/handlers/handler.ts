import type { FastifyInstance, FastifyReply, FastifyRequest, RegisterOptions } from 'fastify'
import type { ApplicationResponse } from '../schemas/ApplicationResponse'
import type { ApplicationPayload } from '../schemas/ApplicationPayload'

import { ApplicationPayloadSchema } from '../schemas/ApplicationPayload'
import { EventHookSchema } from '../schemas/EventHook'

interface OktaCredential {
  id: string
  created: string
  lastUpdated: string
  status: 'ACTIVE' | 'INACTIVE' | string
  client_secret: string
  secret_hash: string
}

/**
 * DCRHandlers registers the fastify plugin for Konnect DCR handlers in the fastify instance
 * it implements all the required routes and also protects the endpoints for with the `x-api-key` header
 */
export function DCRHandlers (fastify: FastifyInstance, _: RegisterOptions, next: (err?: Error) => void): void {
  fastify.addHook('preHandler', (request, reply, done) => {
    const apiKey = request.headers['x-api-key'] as string

    if (!apiKey || !fastify.config.KONG_API_TOKENS.includes(apiKey)) {
      reply.code(401).send({ error: 'Wrong API-Key', error_description: 'wrong x-api-key header' })
    } else {
      done()
    }
  })

  fastify.route({
    url: '/',
    method: 'POST',
    schema: {
      body: ApplicationPayloadSchema
    },
    handler: async function (request: FastifyRequest<{ Body: ApplicationPayload }>, reply: FastifyReply): Promise<FastifyReply> {
      const grantTypes: string[] = []
      const responseTypes: string[] = []

      if (request.body.grant_types.includes('client_credentials') || request.body.grant_types.includes('bearer')) {
        grantTypes.push('client_credentials')
        responseTypes.push('token')
      }

      const payloadOkta = {
        client_name: request.body.client_name,
        redirect_uris: request.body.redirect_uris,
        response_types: responseTypes,
        grant_types: grantTypes,
        token_endpoint_auth_method: request.body.token_endpoint_auth_method,
        application_type: 'service'
      }

      const headers = getHeaders(fastify.config.OKTA_API_TOKEN)
      const response = await fastify.httpClient.post(
        'oauth2/v1/clients',
        payloadOkta,
        { headers }
      )

      const application: ApplicationResponse = {
        client_id: response.data.client_id,
        client_id_issued_at: response.data.client_id_issued_at,
        client_secret: response.data.client_secret,
        client_secret_expires_at: response.data.client_secret_expires_at
      }

      return reply.code(201).send(application)
    }
  })

  fastify.route({
    url: '/:client_id',
    method: 'DELETE',
    handler: async function (request: FastifyRequest<{ Params: { client_id: string } }>, reply: FastifyReply): Promise<FastifyReply> {
      const headers = getHeaders(fastify.config.OKTA_API_TOKEN)

      await fastify.httpClient.delete(
        `oauth2/v1/clients/${request.params.client_id}`,
        { headers }
      )
      return reply.code(204).send()
    }
  })

  fastify.route({
    url: '/:client_id/new-secret',
    method: 'POST',
    handler: async function (request: FastifyRequest<{ Params: { client_id: string } }>, reply: FastifyReply): Promise<FastifyReply> {
      const headers = getHeaders(fastify.config.OKTA_API_TOKEN)
      const response = await fastify.httpClient.post(
        `oauth2/v1/clients/${request.params.client_id}/lifecycle/newSecret`,
        {},
        { headers }
      )

      return reply.code(200).send({
        client_id: request.params.client_id,
        client_secret: response.data.client_secret
      })
    }
  })

  fastify.route({
    url: '/:client_id/event-hook',
    method: 'POST',
    schema: {
      body: EventHookSchema
    },
    handler: async function (request: FastifyRequest<{ Params: { client_id: string }, Body: { EventHook } }>, reply: FastifyReply): Promise<FastifyReply> {
      return reply.code(200).send()
    }
  })

  // GET /:client_id/secrets - List all secrets
  fastify.route({
    url: '/:client_id/secrets',
    method: 'GET',
    handler: async function (
      request: FastifyRequest<{ Params: { client_id: string } }>,
      reply: FastifyReply
    ): Promise<FastifyReply> {
      const headers = getHeaders(fastify.config.OKTA_API_TOKEN)

      const response = await fastify.httpClient.get(
        `/api/v1/apps/${request.params.client_id}/credentials/secrets`,
        { headers }
      )

      const secrets = response.data.map((secret: OktaCredential) => ({
        secret_id: secret.id,
        client_id: request.params.client_id,
        status: secret.status,
        created_at: secret.created,
        expires_at: null
      }))

      return reply.code(200).send({ secrets })
    }
  })

  // POST /:client_id/secrets - Create new secret
  fastify.route({
    url: '/:client_id/secrets',
    method: 'POST',
    handler: async function (
      request: FastifyRequest<{ Params: { client_id: string } }>,
      reply: FastifyReply
    ): Promise<FastifyReply> {
      const headers = getHeaders(fastify.config.OKTA_API_TOKEN)

      const response: { data: OktaCredential } = await fastify.httpClient.post(
        `/api/v1/apps/${request.params.client_id}/credentials/secrets`,
        {},
        { headers }
      )

      return reply.code(201).send({
        secret_id: response.data.id,
        client_id: request.params.client_id,
        client_secret: response.data.client_secret,
        created_at: response.data.created,
        expires_at: null
      })
    }
  })

  // DELETE /:client_id/secrets/:secret_id - Delete specific secret
  fastify.route({
    url: '/:client_id/secrets/:secret_id',
    method: 'DELETE',
    handler: async function (
      request: FastifyRequest<{ Params: { client_id: string, secret_id: string } }>,
      reply: FastifyReply
    ): Promise<FastifyReply> {
      const headers = getHeaders(fastify.config.OKTA_API_TOKEN)
      const { client_id: clientId, secret_id: secretId } = request.params

      // Step 1: Deactivate the secret (Okta requires this before deletion)
      try {
        await fastify.httpClient.post(
          `api/v1/apps/${clientId}/credentials/secrets/${secretId}/lifecycle/deactivate`,
          {},
          { headers }
        )
      } catch (error: unknown) {
        // Ignore if already inactive
        const axiosError = error as { response?: { status?: number } }
        if (axiosError.response?.status !== 400) {
          throw error
        }
      }

      // Step 2: Delete the secret
      await fastify.httpClient.delete(
        `api/v1/apps/${clientId}/credentials/secrets/${secretId}`,
        { headers }
      )

      return reply.code(204).send()
    }
  })

  next()
}

/**
 * Generates the required HTTP Headers to communicate with Okta Api
 * @param token Okta DCR token
 * @returns http headers
 */
function getHeaders (token: string) {
  return {
    Authorization: 'SSWS ' + token,
    accept: 'application/json',
    'Content-Type': 'application/json'
  }
}
