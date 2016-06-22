module.exports = function(sequelize, DataTypes) {
    var Grant = sequelize.define('irs990_person', {
        object_id: DataTypes.TEXT,
        tax_period: DataTypes.TEXT,
        filer_ein: DataTypes.TEXT,
        person_name: DataTypes.TEXT,
        person_title: DataTypes.TEXT,
        business_name: DataTypes.TEXT,
        person_street: DataTypes.TEXT,
        person_city: DataTypes.TEXT,
        person_state: DataTypes.TEXT,
        person_zip: DataTypes.TEXT,
        hours: DataTypes.DECIMAL(12,2),
        org_compensation: DataTypes.DECIMAL(12,2),
        related_org_compensation: DataTypes.DECIMAL(12,2),
        other_compensation: DataTypes.DECIMAL(12,2),
        benefit_contribution: DataTypes.DECIMAL(12,2),
        expenses_or_allowances: DataTypes.DECIMAL(12,2),
        trustee_or_director: DataTypes.TEXT,
        institutional_trustee: DataTypes.TEXT,
        officer: DataTypes.TEXT,
        highest_compensated: DataTypes.TEXT,
        key_employee: DataTypes.TEXT,
        former: DataTypes.TEXT
    },{
        indexes: [{
            fields: ['filer_ein']
        }],
        tableName: 'irs990_people'
    });

    return Grant;
};
