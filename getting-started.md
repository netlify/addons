# Getting Started

Each microservice must offer a [management API](management-api.md) that Netlify will use to provision the service for new projects, manage configuration settings and update the plans for your service. Once provisioned on a project, specific routes on that customer site will map to your API endpoints, with additional header and JWS

## Registering an Addon

Our current plan is to create a developer panel where new partners can register a new addon in our UI. It will require an application title, slug, description, icon, and an endpoint for the app's management API. For now, you can send us your management API endpoint URL and preferred slug via [Slack](https://netlify.slack.com), and we'll set things up manually.

When we register your addon, we’ll generate an addon secret. All requests from Netlify to your addon’s management API will contain an authorization header with the secret:

    Authorization: Bearer <api-secret> 

Your management API must verify this secret before accepting any requests.

[Setting up the management API →](management-api.md)