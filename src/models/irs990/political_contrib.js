module.exports = function(sequelize, DataTypes) {
    var PoliticalContrib = sequelize.define('irs990_political_contrib', {
        object_id: DataTypes.TEXT,
        tax_period: DataTypes.TEXT,
        filer_ein: DataTypes.TEXT,
        org_name: DataTypes.TEXT,
        org_street_1: DataTypes.TEXT,
        org_city: DataTypes.TEXT,
        org_state: DataTypes.TEXT,
        org_zip: DataTypes.TEXT,
        org_ein: DataTypes.TEXT,
        internal_amt: DataTypes.DECIMAL(12,2),
        passthrough_amt: DataTypes.DECIMAL(12,2)
    }, {
        indexes: [{
            fields: ['filer_ein']
        },{
            fields: ['object_id']
        }]
    });

    return PoliticalContrib;
};
