[![][kong-logo-url]][kong-url]

# Konnect Portal DCR Handler

This repository is an open source reference implementation of an HTTP DCR bridge to enable [Dynamic Client Registration][dcr-docs-url] integration between the [Konnect Dev Portal][portal-docs-url] and a third-party [Identity Provider][idp-wiki-url]. The HTTP DCR bridge acts as a proxy and translation layer between your IDP and DCR applications made in the Konnect Dev Portal.

**NOTE: This repository contains an example HTTP DCR bridge implementation and is not meant to be deployed in production. We encourage you to use this a guide to create your own implementation.**

This project is utilized within our integration tests, employing Okta as the IDP, and deployed as a serverless solution on AWS Lambda.
This design ensures that the Developer Portal remains implementation-agnostic with respect to the IDP implementation.

## Implementation

A lightweight [Fastify][fastify] HTTP Server implementing the [HTTP DCR API][openapi] is instantiated in `app.ts`.
The handlers (declared in `handlers/handler.ts`):

* Check that the calls received from Konnect are valid using the [schemas][schemas].
* Verify (in `preHandler`) that the header `X-API-KEY` is present and is one of the API Key present in the env variable `KONG_API_TOKENS`, ensuring the call is legit.
* Transform the payload and forward the call to the IDP.
* If necessary, transform the response from the IDP to comply with the specification.

### Environment configuration

The application requires specific environment variables to be set for proper functionality:

* **KONG_API_TOKENS**: is the comma-separated list of tokens used by Konnect to call the application. Konnect only supports one `DCR Token` at a time. However, if you'd like to rotate your token, we need to be able to check against multiple values to allow for rotation. To rotate your token:
  * Generate and add a new token to KONG_API_TOKENS.
  * Change the token in Konnect `Dev Portal > Settings > Application Setup > DCR Token`. Be sure to save your changes.
  * Remove the older token from KONG_API_TOKENS.
* **OKTA_DOMAIN**: is the base-url for calls to the external IDP. It's usually unique to your organization.
* **OKTA_API_TOKEN**: is the API Token to authenticate calls to the external IDP. Various IDPs may use different auth methods.

## Getting started

### Prerequisites

* Kong Konnect account
  * You can Start a Free trial at: [konghq.com][kong-konnect-register-url]
  * Documentation for Kong Konnect is available at: [docs.konghq.com][konnect-docs-url]
* Yarn [^1.22.x][yarn-install-url]

Install dependencies

```sh
yarn install --frozen-lockfile
```

Run tests with

```sh
yarn test
```

Start local instance

```sh
yarn start
```

## Deployment

This project is the lambda handler that the Konnect Portal project uses to execute synthetic tests for
the HTTP DCR integration with Okta. It is automatically updated when merged to `main` branch,
more information on the `ci` in [./github/workflows/ci.yml](./github/workflows/ci.yml).

The current deployment uses an [AWS Lambda](https://docs.aws.amazon.com/lambda/) and can be accessed via
the [Kong Lambda Plugin](https://docs.konghq.com/hub/kong-inc/aws-lambda/).

## Join the Community

* Join the Kong discussions at the Kong Nation forum: [https://discuss.konghq.com/](https://discuss.konghq.com/)
* Follow us on Twitter: [https://twitter.com/thekonginc](https://twitter.com/thekonginc)
* Check out the docs: [https://docs.konghq.com/](https://docs.konghq.com/)
* Keep updated on YouTube by subscribing: [https://www.youtube.com/c/KongInc/videos](https://www.youtube.com/c/KongInc/videos)
* Read up on the latest happenings at our blog: [https://konghq.com/blog/](https://konghq.com/blog/)
* Visit our homepage to learn more: [https://konghq.com/](https://konghq.com/)

## Contributing

Please take the time to become familiar with our standards outlined below.
First and foremost please and comply with the standards outlined in the [CODE_OF_CONDUCT](./CODE_OF_CONDUCT.md).

### Branch naming conventions

Please follow the following branch naming scheme when creating your branch:

* `feat/foo-bar` for new features
* `fix/foo-bar` for bug fixes
* `test/foo-bar` when the change concerns only the test suite
* `refactor/foo-bar` when refactoring code without any behavior change
* `style/foo-bar` when addressing some style issue
* `docs/foo-bar` for updates to the README.md, this file, or similar documents
* `ci/foo-bar` for updates to the GitHub workflows or actions

## License

```txt
Copyright 2016-2023 Kong Inc.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

   http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
```

[openapi]: ./openapi/openapi.yaml
[fastify]: https://fastify.dev/
[schemas]: ./src/schemas/
[dcr-docs-url]: https://docs.konghq.com/konnect/dev-portal/applications/dynamic-client-registration/
[portal-docs-url]: https://docs.konghq.com/konnect/dev-portal/
[idp-wiki-url]: https://en.wikipedia.org/wiki/Identity_provider
[konnect-docs-url]: https://docs.konghq.com/konnect/
[kong-konnect-register-url]: https://konghq.com/products/kong-konnect/register
[yarn-install-url]: https://classic.yarnpkg.com/lang/en/docs/install
[kong-url]: https://konghq.com/
[kong-logo-url]: https://konghq.com/wp-content/uploads/2018/05/kong-logo-github-readme.png
