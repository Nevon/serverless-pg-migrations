# Serverless PG Migrations

Database migrations for AWS Lambda and RDS using [Sequelize Migrations](http://docs.sequelizejs.com/manual/tutorial/migrations.html).

## About

This Serverless plugin can execute and rollback database migrations after deploys. See [Usage](#usage)

> Heavily inspired by [transmogrify](https://github.com/Reckon-Limited/transmogrify). I tried to use it but encountered a lot of showstopping bugs for me, so I wrote my own, smaller and simpler version.

**Notable differences from transmogrify:**

  * This plugin does not attempt to add handlers automatically (see [Adding handlers](#adding-handlers))
  * This plugin does not create or drop databases
  * This plugin does not have a handler for checking database connection

## Migrations

The plugin assumes that migration files live in a `migrations` directory inside your project.

For details on using migrations please see the [Sequelize Migration](http://docs.sequelizejs.com/manual/tutorial/migrations.html) docs.

## Installation

`yarn add serverless-pg-migrations` OR `npm install serverless-pg-migrations`

## Usage

Define a migration handler somewhere in your project. Example:

```
// /migrations.js

const { up, down } = require("serverless-pg-migrations/handlers");

module.exports.up = up;

module.exports.down = down;
```

Add the plugin and handlers to your `serverless.yml`:

```
provider:
  name: aws

plugins:
  - serverless-pg-migrations

up:
  handler: migrations.up
  timeout: 30
  environment:
    DATABASE_URL: postgres://root:password@domain.rds.amazonaws.com:5432/Database
down:
  handler: migrations.down
  timeout: 30
  environment:
    DATABASE_URL: postgres://root:password@domain.rds.amazonaws.com:5432/Database
```

Pass the function to the serverless deploy command to have it execute after the deploy is finished:

```
sls deploy --function up
```

You can also manually invoke the functions locally:

```
sls invoke local --function up
```

Or use the plugin directly without going through your function:

```
sls migrate up
sls migrate down
```

## Configuration

The provided migration handlers can be imported with `const { up, down} = require("serverless-pg-migrations/handlers")`.

The functions need to have the environment variable `DATABASE_URL` set to a valid [pg connection uri](https://node-postgres.com/features/connecting#connection-uri).