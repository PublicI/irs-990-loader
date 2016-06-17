var moment = require('moment');

module.exports = function(sequelize, DataTypes) {
    var Filing = sequelize.define('irs990_filing', {
        ObjectId: {
            type: DataTypes.STRING,
            field: 'object_id'
        },
        EIN: {
            type: DataTypes.TEXT,
            field: 'ein'
        },
        SubmittedOn: {
            type: DataTypes.DATEONLY,
            field: 'submitted_on',
            set: function(val) {
                if (val && !(val instanceof Date) && val.toString().match(/^[0-9]{4}-[0-9]{1,2}-[0-9]{1,2}$/)) {
                    this.setDataValue('submitted_on', moment(val, 'YYYY-MM-DD').toDate());
                } else {
                    this.setDataValue('submitted_on', val);
                }
            }
        },
        TaxPeriod: {
            field: 'tax_period',
            type: DataTypes.STRING,
        },
        DLN: {
            field: 'dln',
            type: DataTypes.STRING
        },
        LastUpdated: {
            field: 'last_updated',
            type: DataTypes.DATE,
            set: function(val) {
                if (val && !(val instanceof Date) && val.toString().match(/^[0-9]{4}-[0-9]{1,2}-[0-9]{1,2}T[0-9]{1,2}:[0-9]{1,2}:[0-9]{1,2}$/)) {
                    this.setDataValue('submitted_on', moment(val, 'YYYY-MM-DD[T]HH:mm:ss').toDate());
                } else {
                    this.setDataValue('submitted_on', val);
                }
            }
        },
        URL: {
            field: 'url',
            type: DataTypes.STRING
        },
        FormType: {
            field: 'form_type',
            type: DataTypes.STRING
        },
        OrganizationName: {
            field: 'organization_name',
            type: DataTypes.STRING
        },
        IsElectronic: {
            field: 'is_electronic',
            type: DataTypes.BOOLEAN
        },
        IsAvailable: {
            field: 'is_available',
            type: DataTypes.BOOLEAN
        }
    },{
        indexes: [{
            fields: ['ein']
        }]
    });

    return Filing;
};
