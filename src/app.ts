import fastify from 'fastify'
import { DCRHandlers } from './handlers/handler'
import fastifyEnv from '@fastify/env'
import axios, { AxiosInstance } from 'axios'

interface serviceConfig {
  httpClient?: AxiosInstance
}

/**
 * Generating the fastify server instance for the application
 * @param config configuration of the service
 * @returns fastify instance
 */
export async function init (config: serviceConfig = {}) {
  const app = fastify({ logger: true })

  // fastifyEnv register needs to be awaited because follwing plugins
  // require the environment variables injected in `config`
  await app.register(fastifyEnv, {
    schema: {
      type: 'object',
      required: ['OKTA_API_TOKEN', 'OKTA_DOMAIN', 'KONG_API_TOKENS'],
      properties: {
        KONG_API_TOKENS: {
          type: 'string',
          separator: ','
        },
        OKTA_API_TOKEN: { type: 'string' },
        OKTA_DOMAIN: { type: 'string' }
      }
    },
    dotenv: false
  })

  if (!config.httpClient) {
    config.httpClient = axios.create({ baseURL: app.config.OKTA_DOMAIN })
  }

  app.decorate('httpClient', config.httpClient)

  app.register(DCRHandlers)

  app.setErrorHandler((error, request, reply) => {
    request.log.error(error)
    if (error.validation) {
      reply.status(400).send({
        error: 'Bad Request',
        error_description: error.validation
      })
    } else {
      reply.status(error.statusCode || 400).send({
        error: error.name,
        error_description: error.message
      })
    }
  })

  return app
}

// this is used when doing local development and calling directly
// `ts-node src/app.ts` otherwise it has no effect on the runtime when
// using lambda context
if (require.main === module) {
  (async () => {
    try {
      const app = await init()
      await app.listen({ port: 3000 })
      app.log.info('Server started')
    } catch (error) {
      console.error('Error starting the application:', error)
      process.exit(1)
    }
  })()
}

// This module declaration overrides the `FastifyInstance` with the context
// of our application.
// See more informations on: https://fastify.dev/docs/latest/Reference/TypeScript/
declare module 'fastify' {
  interface FastifyInstance {
    httpClient: AxiosInstance
    config: {
      KONG_API_TOKENS: string[]
      OKTA_API_TOKEN: string
      OKTA_DOMAIN: string
    }
  }
}
