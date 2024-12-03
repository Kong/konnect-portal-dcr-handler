export interface ApplicationPayload {
  redirect_uris: string[]
  client_name: string
  grant_types: string[]
  scopes: string[]
  token_endpoint_auth_method: string
  application_description: string
  portal_id: string
  organization_id: string
  developer_id: string
  auth_strategy_id: string
  dcr_provider_id: string
}

export const ApplicationPayloadSchema = {
  type: 'object',
  additionalProperties: false,
  properties: {
    redirect_uris: {
      type: 'array',
      items: {
        type: 'string'
      }
    },
    client_name: {
      type: 'string'
    },
    grant_types: {
      type: 'array',
      items: {
        type: 'string'
      }
    },
    scopes: {
      type: 'array',
      items: {
        type: 'string'
      }
    },
    token_endpoint_auth_method: {
      type: 'string'
    },
    application_description: {
      type: 'string'
    },
    portal_id: {
      type: 'string',
      format: 'uuid'
    },
    organization_id: {
      type: 'string',
      format: 'uuid'
    },
    developer_id: {
      type: 'string',
      format: 'uuid'
    },
    auth_strategy_id: {
      type: 'string',
      format: 'uuid'
    },
    dcr_provider_id: {
      type: 'string',
      format: 'uuid'
    }
  },
  required: [
    'redirect_uris',
    'client_name',
    'grant_types',
    'scopes',
    'token_endpoint_auth_method',
    'application_description',
    'portal_id',
    'organization_id',
    'developer_id',
    'auth_strategy_id',
    'dcr_provider_id'
  ]
}
