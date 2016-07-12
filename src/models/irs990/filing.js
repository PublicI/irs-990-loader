module.exports = function(sequelize, DataTypes) {
    var Filing = sequelize.define('irs990_filing', {
        object_id: {
            primaryKey: true,
            type: DataTypes.TEXT,
        },
        filer_ein: DataTypes.TEXT,
        tax_period: DataTypes.TEXT
    },{
        indexes: [{
            fields: ['filer_ein']
        },{
            fields: ['object_id']
        }]
    });

    return Filing;
};
