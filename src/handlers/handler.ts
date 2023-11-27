import { ApplicationResponse } from '../schemas/ApplicationResponse'
import { FastifyInstance, FastifyReply, FastifyRequest, RegisterOptions } from 'fastify'
import { ApplicationPayload, ApplicationPayloadSchema } from '../schemas/ApplicationPayload'
import { EventHookSchema } from '../schemas/EventHook'
import { join } from 'path'

export function createApplication (fastify: FastifyInstance, opts: RegisterOptions, next: (err?: Error) => void): void {
  fastify.route({
    url: '/',
    method: 'POST',
    schema: {
      body: ApplicationPayloadSchema
    },
    handler: async function (request: FastifyRequest<{ Body: ApplicationPayload }>, reply: FastifyReply): Promise<void> {
      const payloadOkta = {
        client_name: request.body.client_name,
        redirect_uris: request.body.redirect_uris,
        response_types: ['code', 'token', 'id_token'],
        grant_types: request.body.grant_types,
        token_endpoint_auth_method: request.body.token_endpoint_auth_method,
        application_type: 'web'
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

      await reply.code(201).send({ application })
    }
  })
  next()
}

export function deleteApplication (fastify: FastifyInstance, opts: RegisterOptions, next: (err?: Error) => void): void {
  fastify.route({
    url: '/:application_id',
    method: 'DELETE',
    handler: async function (request: FastifyRequest<{ Params: { application_id: string } }>, reply: FastifyReply): Promise<void> {
      const headers = getHeaders(fastify.config.OKTA_API_TOKEN)

      await fastify.httpClient.delete(
        join('oauth2/v1/clients/', request.params.application_id),
        { headers }
      )
      await reply.code(204).send()
    }
  })
  next()
}

export function refreshSecret (fastify: FastifyInstance, opts: RegisterOptions, next: (err?: Error) => void): void {
  fastify.route({
    url: '/:application_id/new-secret',
    method: 'POST',
    handler: async function (request: FastifyRequest<{ Params: { application_id: string } }>, reply: FastifyReply): Promise<void> {
      const headers = getHeaders(fastify.config.OKTA_API_TOKEN)
      const response = await fastify.httpClient.post(
        join('oauth2/v1/clients/', request.params.application_id, '/lifecycle/newSecret'),
        {},
        { headers }
      )

      await reply.code(200).send({
        client_id: request.params.application_id,
        client_secret: response.data.client_secret
      })
    }
  })

  next()
}

export function eventHook (fastify: FastifyInstance, opts: RegisterOptions, next: (err?: Error) => void): void {
  fastify.route({
    url: '/:application_id/event-hook',
    method: 'POST',
    schema: {
      body: EventHookSchema
    },
    handler: async function (request: FastifyRequest<{ Params: { application_id: string }, Body: {EventHook} }>, reply: FastifyReply): Promise<void> {
      console.log(request.body)
      await reply.code(200).send()
    }
  })

  next()
}

function getHeaders (token: string) {
  return {
    Authorization: 'SSWS ' + token,
    accept: 'application/json',
    'Content-Type': 'application/json'
  }
}
