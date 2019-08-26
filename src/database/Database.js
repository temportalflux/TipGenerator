const Sequelize = require('sequelize');
const lodash = require('lodash');

class Database
{

    constructor(fileName, models)
    {
        this.fileName = fileName;

        // https://sequelize.org/master/manual/getting-started.html
        this.db = new Sequelize(
            {
                dialect: 'sqlite',
                storage: this.fileName,
                define: {
                    // The `timestamps` field specify whether or not the `createdAt` and `updatedAt` fields will be created.
                    // This was true by default, but now is false by default.
                    timestamps: false
                }
            }
        );
        
        this.models = lodash.toPairs(models).reduce(
            (accum, [name, attributes]) => {
                accum[name] = this.db.define(name, attributes, {});
                return accum;
            }, {}
        );

        this.init();
        this.sync();
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

    async sync()
    {
        try
        {
            await this.db.sync();
            console.log('Database models have been synced.');
        }
        catch (err)
        {
            console.error('Unable to sync the database models:', err);
        }
    }

}

module.exports = Database;