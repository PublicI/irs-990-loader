module.exports = function(sequelize, DataTypes) {
    var Org = sequelize.define('irs990_org', {
        ein: DataTypes.TEXT,
        name: DataTypes.TEXT,
        ico: DataTypes.TEXT,
        street: DataTypes.TEXT,
        city: DataTypes.TEXT,
        state: DataTypes.TEXT,
        zip: DataTypes.TEXT,
        group: DataTypes.TEXT,
        subsection: DataTypes.TEXT,
        affiliation: DataTypes.TEXT,
        classification: DataTypes.TEXT,
        ruling: DataTypes.TEXT,
        deductibility: DataTypes.TEXT,
        foundation: DataTypes.TEXT,
        activity: DataTypes.TEXT,
        organization: DataTypes.TEXT,
        status: DataTypes.TEXT,
        tax_period: DataTypes.TEXT,
        asset_cd: DataTypes.TEXT,
        income_cd: DataTypes.TEXT,
        filing_req_cd: DataTypes.TEXT,
        pf_filing_req_cd: DataTypes.TEXT,
        acct_pd: DataTypes.TEXT,
        asset_amt: DataTypes.TEXT,
        income_amt: DataTypes.TEXT,
        revenue_amt: DataTypes.TEXT,
        ntee_cd: DataTypes.TEXT,
        sort_name: DataTypes.TEXT
    });

    return Org;
};
