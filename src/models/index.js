var rread = require('fs-readdir-recursive'),
    path = require('path'),
    Sequelize = require('sequelize');

function getModels (options) {
    if (!options.driver) {
        console.warn('DB_DRIVER environment variable not set, no database connection');

        return {};
    }

    var basename = path.basename(module.filename);

    var sequelize = new Sequelize(options.name, options.user, options.pass,{
        host: options.host,
        dialect: options.driver,
        port: options.port,
        define: {
            createdAt: 'created_date',
            updatedAt: 'updated_date',
            underscored: true
        },
        logging: false
    });

    var db = {};

    rread(__dirname)
        .filter(function(file) {
            file = path.basename(file);
            return (file.slice(-3) === '.js') && (file !== basename);
        })
        .forEach(function(file) {
            var model = sequelize['import'](file);
            db[model.name] = model;
        });

    Object.keys(db).forEach(function(modelName) {
        if (db[modelName].associate) {
            db[modelName].associate(db);
        }
    });

    db.sync = function (cb) {
        db.sequelize.sync()
            .then(function () {
                cb(null);
            })
            .catch(cb);
    };

    db.sequelize = sequelize;
    db.Sequelize = Sequelize;

    return db;
}

//module.exports = getModels;

module.exports = getModels({
    name: process.env.DB_NAME,
    user: process.env.DB_USER,
    pass: process.env.DB_PASS,
    host: process.env.DB_HOST,
    driver: process.env.DB_DRIVER,
    port: process.env.DB_PORT
});

