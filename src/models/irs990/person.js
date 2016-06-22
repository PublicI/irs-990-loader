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
        person_country: DataTypes.TEXT,
        person_ein: DataTypes.TEXT,
        person_tax_section: DataTypes.TEXT,
        person_hours: DataTypes.DECIMAL(12,2),
        person_org_compensation: DataTypes.DECIMAL(12,2),
        person_related_org_compensation: DataTypes.DECIMAL(12,2),
        person_other_compensation: 
        non_cash_desc: DataTypes.TEXT,
        valuation_method: DataTypes.TEXT,
        purpose: DataTypes.TEXT
    },{
        indexes: [{
            fields: ['filer_ein']
        },{
            fields: ['recipient_ein']
        }],
        tableName: 'irs990_people'
    });

    return Grant;
};
