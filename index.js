"use strict";

const Migration = require("./migration");

const logMigrationNames = (log, migrations) =>
  migrations
    .map(migration => migration.file)
    .forEach(migration => log(migration));

class ServerlessUmzugMigrations {
  constructor(serverless, options) {
    this.serverless = serverless;
    this.log = message =>
      serverless.cli.log.bind(serverless.cli)(`Migrations - ${message}`);
    this.options = options;

    this.commands = {
      migrate: {
        usage: "Runs database migrations",
        commands: {
          up: {
            usage: "Runs forward migrations",
            lifecycleEvents: ["migrate"]
          },
          down: {
            usage: "Rolls back migration",
            lifecycleEvents: ["rollback"]
          }
        }
      }
    };

    this.hooks = {
      "after:deploy:deploy": this.afterDeploy.bind(this),
      "migrate:up:migrate": this.migrate.bind(this),
      "migrate:down:rollback": this.rollback.bind(this)
    };
  }

  afterDeploy() {
    if (this.options.function) {
      this.log(`Calling migration function: ${this.options.function}`);
      this.serverless.pluginManager.invoke(["invoke"]);
    } else {
      this.log("No migration function defined");
      this.log("Specify a function name using the --function / -f option.");
    }
  }

  migrate() {
    const migration = new Migration(this.getDatabaseConnectionString());

    return migration
      .up()
      .then(executedMigrations => {
        logMigrationNames(
          name => this.log(`Applied migration ${name}`),
          executedMigrations
        );
        migration.close();
      })
      .catch(err => {
        this.log("Failed to execute migrations.");
        this.log(err);
        migration.close();
      });
  }

  rollback() {
    const migration = new Migration(this.getDatabaseConnectionString());

    return migration
      .down()
      .then(rolledbackMigrations => {
        logMigrationNames(
          name => this.log(`Rolled back migration ${name}`),
          rolledbackMigrations
        );
        migration.close();
      })
      .catch(err => {
        this.log("Failed to roll back migrations.");
        this.log(err);
        migration.close();
      });
  }

  getDatabaseConnectionString() {
    if (!process.env.DATABASE_URL) {
      this.log("DATABASE_URL environment variable required");
      process.exit(1);
    }

    return process.env.DATABASE_URL;
  }
}

module.exports = ServerlessUmzugMigrations;
