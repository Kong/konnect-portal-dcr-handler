import fastify from 'fastify'
import { DCRHandlers } from './handlers/handler'
import fastifyEnv from '@fastify/env'
import axios, { AxiosInstance } from 'axios'

interface serviceConfig {
  httpClient?: AxiosInstance
}

export async function init (config: serviceConfig = {}) {
  const app = fastify()

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
    dotenv: true
  })

  if (!config.httpClient) {
    config.httpClient = axios.create({ baseURL: app.config.OKTA_DOMAIN })
  }

  app.decorate('httpClient', config.httpClient)

  app.register(DCRHandlers)

  app.setErrorHandler((error, request, reply) => {
    if (error.validation) {
      reply.status(400).send({
        error: 'Bad Request',
        error_description: error.validation
      })
    } else {
      request.log.error(error)
      reply.status(error.statusCode || 400).send({
        error: error.name,
        error_description: error.message
      })
    }
  })

  return app
}

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
