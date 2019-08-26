const Sequelize = require('sequelize');
const lodash = require('lodash');

class Database
{

    constructor(fileName, dialect, models)
    {
        // https://sequelize.org/master/manual/getting-started.html
        this.db = new Sequelize(
            {
                dialect: dialect,
                storage: fileName,
                define: {
                    // The `timestamps` field specify whether or not the `createdAt` and `updatedAt` fields will be created.
                    // This was true by default, but now is false by default.
                    timestamps: false
                }
            }
        );
        
        this.models = lodash.toPairs(models).reduce(
            (accum, [name, modelInfo]) => {
                accum[name] = this.db.define(name, modelInfo.attributes,
                    lodash.assign({}, {
                        underscored: true,
                    }, modelInfo.options)
                );
                return accum;
            }, {}
        );
    }

    async init()
    {
        try
        {
            await this.db.authenticate();
            console.log('Connection has been established successfully.');
        }
        catch (err)
        {
            console.error('Unable to connect to the database:', err);
        }
    }

    async sync(options)
    {
        try
        {
            await this.db.sync(options);
            console.log('Database models have been synced.');
        }
        catch (err)
        {
            console.error('Unable to sync the database models:', err);
        }
    }

}

module.exports = Database;