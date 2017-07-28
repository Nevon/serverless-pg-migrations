const Sequelize = require("sequelize");
const Umzug = require("umzug");

module.exports = class Migration {
  constructor(connectionString) {
    this.connectionString = connectionString;
    this.close = this.init();
  }

  init() {
    this.sequelize = new Sequelize(this.connectionString, {
      pool: {
        max: 1,
        min: 0,
        idle: 5000
      }
    });

    this.umzug = new Umzug({
      storage: "sequelize",
      storageOptions: {
        sequelize: this.sequelize
      },
      migrations: {
        params: [this.sequelize.getQueryInterface(), this.sequelize.constructor]
      },
      logging: function() {
        console.log.apply(null, arguments);
      }
    });

    return () => {
      this.sequelize.close();
    };
  }

  pending() {
    return this.umzug.pending();
  }

  up() {
    return this.umzug.up();
  }

  down() {
    return this.umzug.down();
  }
};
