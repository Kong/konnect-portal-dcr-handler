import fastify from 'fastify'
import { createApplication, deleteApplication, refreshSecret, eventHook } from './handlers/handler'
import fastifyEnv from '@fastify/env'
import axios, { AxiosInstance } from 'axios'

interface serviceConfig {
  isLambda?: boolean
  httpClient?: AxiosInstance
}

// const app = fastify({ logger: true })
export async function init (config: serviceConfig) {
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
    console.log('no client')
    config.httpClient = axios.create({ baseURL: app.config.OKTA_DOMAIN })
  }

  app.decorate('httpClient', config.httpClient)

  app.register(createApplication)

  app.register(deleteApplication)

  app.register(refreshSecret)

  app.register(eventHook)

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

  if (!config.isLambda) {
    app.listen({
      port: 3000
    }, (err) => {
      if (err) console.error(err)
    }
    )
  }

  return app
}

if (require.main === module) {
  (async () => {
    try {
      const app = await init({ isLambda: false })
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
