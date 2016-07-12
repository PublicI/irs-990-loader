var moment = require('moment');

module.exports = function(sequelize, DataTypes) {
    var FilingMeta = sequelize.define('irs990_filings_meta', {
        ObjectId: {
            type: DataTypes.TEXT,
            field: 'object_id',
            primaryKey: true
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
                    this.setDataValue('SubmittedOn', moment(val, 'YYYY-MM-DD').toDate());
                } else {
                    this.setDataValue('SubmittedOn', val);
                }
            }
        },
        TaxPeriod: {
            field: 'tax_period',
            type: DataTypes.TEXT,
        },
        DLN: {
            field: 'dln',
            type: DataTypes.TEXT
        },
        LastUpdated: {
            field: 'last_updated',
            type: DataTypes.DATE,
            set: function(val) {
                if (val && !(val instanceof Date) && val.toString().match(/^[0-9]{4}-[0-9]{1,2}-[0-9]{1,2}T[0-9]{1,2}:[0-9]{1,2}:[0-9]{1,2}$/)) {
                    this.setDataValue('LastUpdated', moment(val, 'YYYY-MM-DD[T]HH:mm:ss').toDate());
                } else {
                    this.setDataValue('LastUpdated', val);
                }
            }
        },
        URL: {
            field: 'url',
            type: DataTypes.TEXT
        },
        FormType: {
            field: 'form_type',
            type: DataTypes.TEXT
        },
        OrganizationName: {
            field: 'organization_name',
            type: DataTypes.TEXT
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
        freezeTableName: true,
        indexes: [{
            fields: ['ein']
        },{
            fields: ['object_id']
        },{
            fields: ['submitted_on']
        },{
            fields: ['tax_period']
        }]
    });

    return FilingMeta;
};
