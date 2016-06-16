module.exports = function(sequelize, DataTypes) {
    var Grant = sequelize.define('irs990_grant', {
        tax_year: DataTypes.STRING,
        filer_ein: DataTypes.STRING,
        recipient_name_1: DataTypes.STRING,
        recipient_name_2:  DataTypes.STRING,
        recipient_name2:  DataTypes.STRING,
        recipient_street_1: DataTypes.STRING,
        recipient_street_2: DataTypes.STRING,
        recipient_city: DataTypes.STRING,
        recipient_state: DataTypes.STRING,
        recipient_zip: DataTypes.STRING,
        recipient_country: DataTypes.STRING,
        recipient_ein: DataTypes.STRING,
        recipient_tax_section: DataTypes.STRING,
        cash_amt: DataTypes.DECIMAL(12,2),
        non_cash_amt: DataTypes.DECIMAL(12,2),
        non_cash_desc: DataTypes.STRING,
        valuation_method: DataTypes.STRING,
        purpose: DataTypes.STRING
    });

    return Grant;
};
