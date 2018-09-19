# Netlify Provider API as Express App

This is an example implementation of the Netlify provider API to create a Netlify addon.

## Install

Install the express dependencies

```bash
npm install
```

## Deploying


1. Allow for Heroku to build from sub directory

    ```bash
    heroku buildpacks:set https://github.com/timanovsky/subdir-heroku-buildpack
    ```

3. Add node build steps for express

    ```bash
    heroku buildpacks:add heroku/nodejs
    ```

4.  Add node build steps for express

    ```bash
    heroku config:set PROJECT_PATH=/express
    ```
