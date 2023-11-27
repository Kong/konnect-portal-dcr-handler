import fastify from 'fastify'
import { createApplication, deleteApplication, refreshSecret, eventHook } from './handlers/handler'
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
      required: ['OKTA_API_TOKEN', 'OKTA_DOMAIN', 'KONG_API_TOKEN'],
      properties: {
        KONG_API_TOKEN: { type: 'string' },
        OKTA_API_TOKEN: { type: 'string' },
        OKTA_DOMAIN: { type: 'string' }
      }
    },
    dotenv: true
  })

  if (!config.httpClient) {
    config.httpClient = axios.create({ baseURL: app.config.OKTA_DOMAIN })
  }
  console.log(app.config)

  app.decorate('httpClient', config.httpClient)

  app.register(createApplication)

  app.register(deleteApplication)

  app.register(refreshSecret)

  app.register(eventHook)

  app.addHook('preHandler', (request, reply, done) => {
    const apiKey = request.headers['x-api-key']
    if (!apiKey || apiKey !== app.config.KONG_API_TOKEN) {
      reply.code(400).send({ error: 'Wrong API-Key', error_description: 'wrong x-api-key header' })
    } else {
      done()
    }
  })

  app.setErrorHandler((error, request, reply) => {
    if (error.validation) {
      reply.status(400).send({
        error: 'Bad Request',
        error_description: error.validation
      })
    } else {
      console.log(error)
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
      console.log('Server started')
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
      KONG_API_TOKEN: string
      OKTA_API_TOKEN: string
      OKTA_DOMAIN: string
    }
  }
}
