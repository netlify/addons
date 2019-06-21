# Building Add-on integrations with Netlify

A Netlify add-on is a way for Netlify users to extend their site functionality.

**Some examples of add-ons:**

- Automatically inject Sentry error tracking into your app
- Provision a new Fauna database
- Setup `env` variables in Netlify's build context for users Automatically
- ...

## Table of Contents
<!-- AUTO-GENERATED-CONTENT:START (TOC:collapse=true&collapseText=Click to expand) -->
<details>
<summary>Click to expand</summary>

- [Getting Started](#getting-started)
- [Add-on Provisioning Flow](#add-on-provisioning-flow)
- [Add-on API](#add-on-api)
  * [`GET /manifest` - Manifest Endpoint](#get-manifest---manifest-endpoint)
    + [Payload from Netlify](#payload-from-netlify)
    + [Response to Netlify](#response-to-netlify)
  * [`POST /instances` - Create Add-on Instance](#post-instances---create-add-on-instance)
    + [Payload from Netlify](#payload-from-netlify-1)
    + [Response to Netlify](#response-to-netlify-1)
  * [`PUT /instances/:id` - Updating Add-on Instance](#put-instancesid---updating-add-on-instance)
    + [Payload from Netlify](#payload-from-netlify-2)
    + [Response to Netlify](#response-to-netlify-2)
  * [`DELETE /instances/:id` - Deleting Add-on Instance](#delete-instancesid---deleting-add-on-instance)
    + [Payload from Netlify](#payload-from-netlify-3)
    + [Response to Netlify](#response-to-netlify-3)
  * [`GET /instances/:id` - Getting Add-on Instance](#get-instancesid---getting-add-on-instance)
    + [Payload from Netlify](#payload-from-netlify-4)
    + [Response to Netlify](#response-to-netlify-4)
- [Add-on Authenication](#add-on-authenication)
- [Proxied URLs](#proxied-urls)
  * [Request Headers](#request-headers)
  * [Verification with JWS](#verification-with-jws)
  * [User-Level Authentication with JWTs](#user-level-authentication-with-jwts)
- [Registering your add-on](#registering-your-add-on)
- [Example Implementations](#example-implementations)

</details>
<!-- AUTO-GENERATED-CONTENT:END -->

## Getting Started

Each netlify add-on service must offer a [management API](#add-on-api) that Netlify will use to provision the third party service for new Netlify sites.

The management API also allows for Netlify to manage configuration settings and update the plans for your third party service.

## Add-on Provisioning Flow

<img width="100%" alt="provisioning flow for repo" src="https://user-images.githubusercontent.com/532272/45775428-93c74000-bc04-11e8-9a27-084170353563.png">


## Add-on API

In order for Netlify customers to create and manage their own instances of your service, you'll need to create a management API that exposes the following endpoints:

```
GET     /manifest       # returns the manifest & configuration details for your service
POST    /instances      # create a new instance of your service
GET     /instances/:id  # get the current configuration of an instance
PUT     /instances/:id  # update the configuration of an instance
DELETE  /instances/:id  # delete an instance
```

### `GET /manifest` - Manifest Endpoint

The manifest endpoint of a Netlify add-on is used to return information about your service to the Netlify user.

#### Payload from Netlify

The body of the payload from Netlify is empty.

#### Response to Netlify

**The manifest includes:**

- `name` (required) - The name of your add-on
- `description` (required) - A brief description of your add-on
- `admin_url` (optional) - URL used for SSO when netlify users run `netlify addons:auth addonname`
- `config` (optional) - The inputs required from the user for the add-on to provision itself.

**Here is an example response to Netlify:**

```js
{
  statusCode: 200,
  body: JSON.stringify({
    name: "My Awesome Integration",
    description: "This addon does XYZ.",
    admin_url: 'https://your-admin-url.com',
    config: {
      "optionOne": {
        /* An alternate, human-friendly name. */
        "displayName": "Human friendly name",
        /*  Description of option shown to user  */
        "description": "This option does xyz. For more info see the docs http://docs.com/link",
        /*  Type of field
        "type": "string",  */
        /*  If is required or not
        "required": true,  */
      },
      "optionTwo": {
        "displayName": "Second Human friendly name",
        "type": "string"
      },
      "fooBarZaz": {
        "displayName": "Third Human friendly name",
        "description": "This option does xyz. For more info see the docs http://docs.com/link",
        "type": "string",
      },
    },
  })
}
```

Manifest values are cached by Netlify for 24 hours.

### `POST /instances` - Create Add-on Instance

When a customer adds an instance of your add-on to a site, Netlify will `POST` to `your-management-api.com/instances/`

A Netlify user can add an instance of your service by running:

```bash
netlify addons:create your-addon-namespace --valueOne xyz --otherConfigValue abc
```

That kicks off the following flow:

#### Payload from Netlify

**The `POST` request from Netlify to your service occurs**

Here is an example request body **to your management endpoint**:

```js
{
  // Unique ID generated by Netlify
  uuid: '2e65dd70-523d-48d8-8826-a93229d7ec01',
  account: '5902622bcf321c7359e97e52',
  config: {
    site_url: 'https://calling-site-from-netlify.netlify.com',
    jwt: {
      secret: 'xyz-netlify-secret'
    },
    // User defined configuration values
    config: {
      name: 'woooooo'
    },
    // Netlify Site id
    site_id: '2e65dd70-523d-48d8-8826-a93229d7ec01',
    // Your service ID slug
    service_id: 'express-example',
    service_instance: {
      config: { name: 'woooooo' }
    },
    // If your add-on needs to trigger site rebuilds we will send a build hook
    incoming_hook_url: 'https://api.netlify.com/build_hooks/123xyz'
  }
}
```

- `uuid`: Unique ID generated by Netlify.
- `config`: Fields and values you need for configuring your service for a customer.

You will want to take this data, provision your application resources and return a response.

#### Response to Netlify

**Return a `201` response from your service back to Netlify**

```js
{
  // `id` (required) - A unique ID generated by you, for reference within your own API
  id: uuid(),
  // `message` (optional) - Message back to user.
  message: 'You have created the addon. Here is link to further instructions http://link.com',
  // `endpoint` (optional) - Proxied endpoint.
  // This will be callable at https://user-netlify-site.com/.netlify/your-addon-namespace
  endpoint: "https://my-endpoint.example.com",
  /* `config` (optional) - This can return back exactly what was received in the POST request, or include additional fields or altered values. This should also be what is returned in response to a GET request to /instances/:id */
  config: {},
  // `env` (optional) - Environment Keys accessible by Netlify user in build context & in functions
  env: {
    'YOUR_SERVICE_API_SECRET': 'value'
  },
  // `snippets` (optional) - JS Snippet content to inject into the calling Netlify site
  snippets: [
    {
      title: 'Snippet From Demo App',
      position: 'head',
      html: `<script>console.log("Hello from ${logValue}")</script>`
    }
  ]
}
```

- `id` A unique ID generated by you, for reference within your own API. Any string is valid for our purposes. This will be included in the headers and JWS for all API calls from Netlify. This `id` is also what is used in all subsequent `instances/${id}` update/get/delete calls to your remote API.
- `env`: Set Environment variable for the Netlify user to access during site build or inside of their Netlify functions context.
- `snippets`: Inject javascript snippets into the header or footer of the calling Netlify Site.

Though not implemented yet, we plan to include a `state` field, which will allow your service to handle async provisioning, in case it takes some amount of time to activate the new service.

### `PUT /instances/:id` - Updating Add-on Instance

You can allow Netlify users to update your service instance.

This is achieved by the Netlify user running:

```bash
# Option 1. Run through configuration prompts from the /manifest endpoint
netlify addons:config your-addon-namespace

# Option 2. Run command with values for no prompts
netlify addons:config your-addon-namespace --valueOne xyz --otherConfigValue abc
```

#### Payload from Netlify

**The `PUT` request from Netlify to your service `/instances/${id}` occurs**

The ID of the service instance is included in the path parameters. This `id` was generated initially by your `POST` `/instances` implementation. (see "Create an Instance")

The body of the update request looks like this:

```js
{
  config: {
    name: 'noooooooo'
  }
}
```

Run your services update logic here and then return any updated values back to the Netlify site.

#### Response to Netlify

**Return a `200` response from your service back to Netlify**

Return any updated values from the users request

Here is an example response with updated `env` values and an updated `snippet`

```js
{
  env: {
    'YOUR_SERVICE_API_SECRET': 'updated-env-value'
  },
  snippets: [
    {
      title: 'Snippet From Demo App',
      position: 'head',
      html: `<script>console.log("Updated snippet content")</script>`
    }
  ]
}
```

### `DELETE /instances/:id` - Deleting Add-on Instance

When a Netlify user removes your add-on, Netlify sends a `DELETE` request to your service to handle deprovisioning.

Users can remove add-ons like so:

```bash
netlify addons:delete your-addon-namespace
```

#### Payload from Netlify

When this happens, the following occurs:

**Netlify sends a `DELETE` request from to your service `/instances/${id}`**

This request has no body but includes the `id` of the instance in the path `/instances/${id}`. This `id` was generated initially by your `POST` `/instances` implementation. (see "Create an Instance")

Run your deletion logic and optionally return data back to Netlify.

#### Response to Netlify

**Return a `204` response from your service back to Netlify to verify the deletion was successful**

```js
{
  statusCode: 204, // <-- delete must respond back with 204.
}
```

### `GET /instances/:id` - Getting Add-on Instance

Netlify users get information about your service instance like so:

```bash
netlify addons:list
```

#### Payload from Netlify

**The `GET` request from Netlify to your service `/instances/${id}` occurs**.

This request has no body but includes the `id` of the instance.

In this request you would run the logic to fetch details about your instance based on the `id` from the path `/instances/${id}` and return them back to Netlify.

#### Response to Netlify

**Return a `200` response from your service back to Netlify**

```js
{
  env: {
    'YOUR_SERVICE_API_SECRET': 'value'
  },
  snippets: [
    {
      title: 'Snippet From Demo App',
      position: 'head',
      html: '<script>console.log("Hello from App")</script>'
    }
  ]
}
```

## Add-on Authenication

Netlify users can login to your service using the `admin_url` returned from your [`/manifest` endpoint](https://github.com/netlify/addons#get-manifest---manifest-endpoint).

The `admin_url` returned from `/manifest` will be be presented to the user in the Netlify UI & via the CLI `netlify addon:auth addonName`.

The admin url will have a JWT attached to it including these values:

```json
{
  "site_id": "49360df0-2dc2-406d-9b5f-fa3beb290eed",
  "account_id": "5902622bcf321c7359e97e52",
  "remote_id": "98cd0990-24dc-11e9-bb37-5d971cb376a0"
}
```

Example:

```
https://app.com/login#eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzaXRlX2lkIjoiNDkzNjBkZjAtMmRjMi00MDZkLTliNWYtZmEzYmViMjkwZWVkIiwiYWNjb3VudF9pZCI6IjU5MDI2MjJiY2YzMjFjNzM1OWU5N2U1MiIsInJlbW90ZV9pZCI6Ijk4Y2QwOTkwLTI0ZGMtMTFlOS1iYjM3LTVkOTcxY2IzNzZhMCJ9.GKMBcj6t9HML5CVtHQSL47z_gMyfSgOQj9EuvDlFpL8
```

The `remote_id` corresponds to the `id` returned during the [creation flow](https://github.com/netlify/addons#response-to-netlify-1). You can use the `remote_id` in this URL to create a new user account for the resource or assign it to an existing user account in your service.

## Proxied URLs

When creating an add-on, if you return an `endpoint` with a URL to your service, a Netlify customer can send requests to

```
https://users-netlify-site.netlify.com/.netlify/<your-addon-namespace>/*
```

**Example:**

If a user adds the `status-page` add-on and the creation of the `status-page` add-on returns an `endpoint` url of `http://third-party-service.com/xzy123/statue-page`, that endpoint will be available at:

```
https://users-netlify-site.netlify.com/.netlify/status-page/*
```

A call to `https://users-netlify-site.netlify.com/.netlify/status-page/` will be proxied through to the original service URL of `http://third-party-service.com/xzy123/statue-page`.

### Request Headers

All requests will include the following headers:

```
X-NF-UUID: 1234-1234-1234
X-NF-ID: 5a76f-b3902
X-NF-SITE-URL: https://my-project.netlify.com
```

- `X-NF-UUID`: The unique UUID generated by Netlify and sent to your management API when provisioning the instance.
- `X-NF-ID`: The unique ID returned from your management API when provisioning the instance.
- `X-NF-SITE-URL`: The URL of the Netlify-hosted site associated with the instance.

### Verification with JWS

Though the headers above can be useful for quick troubleshooting and testing during development, they are vulnerable to impersonation attacks, and should not be used in production. Instead, use the JSON Web Signature (JWS) we'll include the header `X-NF-SIGN`. The JWS secret will match the bearer token generated when you first register your microservice on the platform, as described in [Getting started](getting-started.md). By verifying this secret, you'll know that the request is coming from Netlify. Also, because it's unique to your microservice, you can be sure that a leaked secret on another microservice will not impact the security of yours.

The JWS payload will be JSON with this format

```json
{
  "exp": epoch-seconds,
  "site_url": "https://my-project.netlify.com",
  "id": "5a76f-b3902",
  "netlify_id": "1234-1234-1234"
}
```

- `exp`: Standard JWS expiration field.
- `site_url`: The URL of the Netlify-hosted site associated with the instance, like `X-NF-SITE-URL` above.
- `id`: The unique ID returned from your management API when provisioning the instance, like `X-NF-ID` above.
- `netlify_id`: The unique UUID generated by Netlify and sent to your management API when provisioning the instance, like `X-NF-SITE-URL` above.


### User-Level Authentication with JWTs

While the JWS described above may be used to verify the origin of a request, you may also want to verify certain information about the actual site user who triggered that request. Netlify handles this with JSON Web Tokens (JWTs) as a stateless identity layer.

Netlify provides a built-in Identity service (which is actually a microservice addon itself, based on our open source [GoTrue](https://www.gotrueapi.org) project). However, any authentication service that can issue JWTs will work with Netlify's microservice gateway. Site builders can include one of these JWTs as a bearer token in the Authorization header for a site route, and Netlify will verify its signature against the site's identity secret stored in Netlify's backend. If the route points to your microservice (using the path at the beginning of this doc), Netlify will re-sign the JWT with your unique secret before passing the request on to your microservice.

## Registering your add-on

Our current plan is to create a developer panel where new partners can register a new add-on in our UI. It will require an application title, slug, description, icon, and an endpoint for the app's management API.

For now, you can register your add-on namespace/endpoint by [filling out this form](https://cli.netlify.com/register-addon) and we will get you set up in Netlify's add-on marketplace.

When we register your add-on, we’ll generate an add-on secret that is unique to your service. All requests from Netlify to your add-on’s management API will contain an `X-Nf-Sign` authorization header. You can verify request are coming from Netlify by verifying the `X-Nf-Sign` header against your add-on secret.

Your management API should verify this secret before accepting any requests.

Example:

```js
const jwt = require('jsonwebtoken')
const Your_Addon_Secret = 'generated-when-addon-registered'

// inside your request handler:
const netlifySignedToken = req.headers['X-Nf-Sign']
const fromNetlify = jwt.verify(netlifySignedToken, Your_Addon_Secret)

if (fromNetlify) {
  // do stuff
}
```

After your namespace is setup in Netlify, you will be able to run CLI command to test out your provisioning logic

```bash
netlify addons:create your-name-space
```

It’s common for add-on partners to create a `-staging` version of their add-on to test new features, like `your-addon-namespace-staging`. This gives a safe place for us to test and update changes to an addon before shipping updates to the master `your-addon-namespace` that is live for all Netlify users.

## Example Implementations

We have created a couple example implementations of how an add-on REST API should work.

- [An express app running on Heroku](./examples/express) |  [code](https://github.com/netlify/netlify-addons/blob/master/examples/express/index.js)
- [A REST API running on AWS Lambda + APIGateway](./examples/serverless) |  [code](https://github.com/netlify/netlify-addons/blob/master/examples/serverless/handler.js)
- [Using Netlify Functions](./examples/netlify-functions) |  [code](https://github.com/netlify/addons/blob/master/examples/netlify-functions/functions/addons.js#L28-L32)

Please let us know if you have any questions on how these work! Open an issue in this repo or ping us directly on slack.
