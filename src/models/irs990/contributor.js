module.exports = function(sequelize, DataTypes) {
    var Contributor = sequelize.define('irs990_contributor', {
        contributor_number: DataTypes.INTEGER,
        contributor_name: DataTypes.TEXT,
        contributor_street_1: DataTypes.TEXT,
        contributor_city: DataTypes.TEXT,
        contributor_state: DataTypes.TEXT,
        contributor_zip: DataTypes.TEXT,
        contributor_aggregate_amt: DataTypes.TEXT,
        contributor_type_person: DataTypes.TEXT,
        contributor_type_noncash: DataTypes.TEXT,
        contributor_type_payroll: DataTypes.TEXT
    }, {
        indexes: [{
            fields: ['filer_ein']
        }]
    });

    return Contributor;
};
