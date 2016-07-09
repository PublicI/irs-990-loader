module.exports = function(sequelize, DataTypes) {
    var Filing = sequelize.define('irs990_filing', {
        object_id: {
            primaryKey: true,
            type: DataTypes.TEXT,
        },
        ein: {
            type: DataTypes.TEXT,
        },
        tax_period: {
            type: DataTypes.TEXT,
        }
    },{
        indexes: [{
            fields: ['ein']
        }]
    });

    return Filing;
};
