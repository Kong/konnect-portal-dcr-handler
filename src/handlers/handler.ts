import type { FastifyInstance, FastifyReply, FastifyRequest, RegisterOptions } from 'fastify'
import type { ApplicationResponse } from '../schemas/ApplicationResponse'
import type { ApplicationPayload } from '../schemas/ApplicationPayload'

import { ApplicationPayloadSchema } from '../schemas/ApplicationPayload'
import { EventHookSchema } from '../schemas/EventHook'

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
    url: '/:application_id',
    method: 'DELETE',
    handler: async function (request: FastifyRequest<{ Params: { application_id: string } }>, reply: FastifyReply): Promise<FastifyReply> {
      const headers = getHeaders(fastify.config.OKTA_API_TOKEN)

      await fastify.httpClient.delete(
        `oauth2/v1/clients/${request.params.application_id}`,
        { headers }
      )
      return reply.code(204).send()
    }
  })

  fastify.route({
    url: '/:application_id/new-secret',
    method: 'POST',
    handler: async function (request: FastifyRequest<{ Params: { application_id: string } }>, reply: FastifyReply): Promise<FastifyReply> {
      const headers = getHeaders(fastify.config.OKTA_API_TOKEN)
      const response = await fastify.httpClient.post(
        `oauth2/v1/clients/${request.params.application_id}/lifecycle/newSecret`,
        {},
        { headers }
      )

      return reply.code(200).send({
        client_id: request.params.application_id,
        client_secret: response.data.client_secret
      })
    }
  })

  fastify.route({
    url: '/:application_id/event-hook',
    method: 'POST',
    schema: {
      body: EventHookSchema
    },
    handler: async function (request: FastifyRequest<{ Params: { application_id: string }, Body: { EventHook } }>, reply: FastifyReply): Promise<FastifyReply> {
      return reply.code(200).send()
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
