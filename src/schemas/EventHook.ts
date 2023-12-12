export type EventHook = {
  event_type: 'update_application' | 'add_registration' | 'remove_registration'
  /**
   * ID of the application in the IDP. This is the ID used accross
   * the system and is unique. The format can vary between IDPs.
   *
   */
  client_id: string
  /**
   * ID of the application in the Konnect system
   *
   */
  application_id: string
  application_name: string
  application_description: string
  portal_id: string
  organization_id: string
} & (
  | {
    event_type: 'update_application'
  }
  | {
    api_product_version_id: string
    event_type: 'add_registration'
    /**
   * Application audience
   */
    audience?: string
  }
  | {
    api_product_version_id: string
    event_type: 'remove_registration'
    /**
   * Application audience
   */
    audience?: string
  }
)

export const EventHookSchema = {
  type: 'object',
  properties: {
    event_type: {
      type: 'string',
      enum: ['update_application', 'add_registration', 'remove_registration']
    },
    client_id: {
      type: 'string',
      description: 'ID of the application in the IDP. This is the ID used across the system and is unique. The format can vary between IDPs.'
    },
    application_id: {
      type: 'string',
      description: 'ID of the application in the Konnect system'
    },
    application_name: {
      type: 'string'
    },
    application_description: {
      type: 'string'
    },
    portal_id: {
      type: 'string'
    },
    organization_id: {
      type: 'string'
    },
    api_product_version_id: {
      type: 'string'
    },
    audience: {
      type: 'string',
      description: 'Application audience'
    }
  },
  required:
    [
      'event_type',
      'client_id',
      'application_id',
      'application_name',
      'application_description',
      'portal_id',
      'organization_id'
    ],
  allOf: [
    {
      oneOf: [
        {
          properties: {
            event_type: {
              const: 'update_application'
            }
          },
          required: ['event_type']
        },
        {
          properties: {
            event_type: {
              const: 'add_registration'
            },
            api_product_version_id: {
              type: 'string'
            }
          },
          required: [
            'event_type',
            'api_product_version_id'
          ]
        },
        {
          properties: {
            event_type: {
              const: 'remove_registration'
            },
            api_product_version_id: {
              type: 'string'
            }
          },
          required:
            ['event_type',
              'api_product_version_id'
            ]
        }
      ]
    }
  ]
}
