var moment = require('moment');

module.exports = function(sequelize, DataTypes) {
    var Filing = sequelize.define('irs990_filing', {
        object_id: {
            primaryKey: true,
            type: DataTypes.TEXT,
        },
        filer_ein: DataTypes.TEXT,
        tax_period: DataTypes.TEXT,
        tax_period_begin: {
            type: DataTypes.DATEONLY,
            set: function(val) {
                if (val && !(val instanceof Date) && val.toString().match(/^[0-9]{4}-[0-9]{1,2}-[0-9]{1,2}$/)) {
                    this.setDataValue('tax_period_begin', moment(val, 'YYYY-MM-DD').toDate());
                } else {
                    this.setDataValue('tax_period_begin', val);
                }
            }
        },
        tax_period_end: {
            type: DataTypes.DATEONLY,
            set: function(val) {
                if (val && !(val instanceof Date) && val.toString().match(/^[0-9]{4}-[0-9]{1,2}-[0-9]{1,2}$/)) {
                    this.setDataValue('tax_period_end', moment(val, 'YYYY-MM-DD').toDate());
                } else {
                    this.setDataValue('tax_period_end', val);
                }
            }
        }
    },{
        indexes: [{
            fields: ['filer_ein']
        },{
            fields: ['object_id']
        }]
    });

    return Filing;
};
