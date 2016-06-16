var _ = require('lodash'),
    fs = require('fs'),
    async = require('async'),
    numeral = require('numeral'),
    models = require('./models'),
    moment = require('moment'),
    parseString = require('xml2js').parseString,
    util = require('util'),
    flat = require('flat'),
    path = require('path');

var fieldMap = {
    'RecipientBusinessName.0.BusinessNameLine1.0': 'recipient_name_1',
    'RecipientBusinessName.0.BusinessNameLine1Txt.0': 'recipient_name_1',
    'RecipientNameBusiness.0.BusinessNameLine1.0': 'recipient_name_1',
    'RecipientBusinessName.0.BusinessNameLine2.0': 'recipient_name_2',
    'RecipientBusinessName.0.BusinessNameLine2Txt.0': 'recipient_name_2',
    'RecipientNameBusiness.0.BusinessNameLine2.0': 'recipient_name_2',
    'USAddress.0.AddressLine1.0': 'recipient_street_1',
    'AddressUS.0.AddressLine1.0': 'recipient_street_1',
    'USAddress.0.AddressLine1Txt.0': 'recipient_street_1',
    'ForeignAddress.0.AddressLine1Txt.0': 'recipient_street_1',
    'ForeignAddress.0.AddressLine1.0': 'recipient_street_1',
    'USAddress.0.AddressLine2.0': 'recipient_street_2',
    'AddressUS.0.AddressLine2.0': 'recipient_street_2',
    'USAddress.0.AddressLine2Txt.0': 'recipient_street_2',
    'ForeignAddress.0.AddressLine2Txt.0': 'recipient_street_2',
    'ForeignAddress.0.AddressLine2.0': 'recipient_street_2',
    'USAddress.0.City.0': 'recipient_city',
    'USAddress.0.CityNm.0': 'recipient_city',
    'ForeignAddress.0.CityNm.0': 'recipient_city',
    'AddressUS.0.City.0': 'recipient_city',
    'ForeignAddress.0.City.0': 'recipient_city',
    'USAddress.0.State.0': 'recipient_state',
    'AddressUS.0.State.0': 'recipient_state',
    'USAddress.0.StateAbbreviationCd.0': 'recipient_state',
    'ForeignAddress.0.ProvinceOrStateNm.0': 'recipient_state',
    'ForeignAddress.0.ProvinceOrState.0': 'recipient_state',
    'ForeignAddress.0.CountryCd.0': 'recipient_country',
    'ForeignAddress.0.Country.0': 'recipient_country',
    'USAddress.0.ZIPCode.0': 'recipient_zip',
    'USAddress.0.ZIPCd.0': 'recipient_zip',
    'AddressUS.0.ZIPCode.0': 'recipient_zip',
    'ForeignAddress.0.PostalCode.0': 'recipient_zip',
    'ForeignAddress.0.ForeignPostalCd.0': 'recipient_zip',
    'RecipientEIN.0': 'recipient_ein',
    'EINOfRecipient.0': 'recipient_ein',
    'IRCSectionDesc.0': 'recipient_tax_section',
    'IRCSection.0': 'recipient_tax_section',
    'CashGrantAmt.0': 'cash_amt',
    'AmountOfCashGrant.0': 'cash_amt',
    'NonCashAssistanceAmt.0': 'non_cash_amt',
    'AmountOfNonCashAssistance.0': 'non_cash_amt',
    'NonCashAssistanceDesc.0': 'non_cash_desc',
    'DescriptionOfNonCashAssistance.0': 'non_cash_desc',
    'ValuationMethodUsedDesc.0': 'valuation_method',
    'MethodOfValuation.0': 'valuation_method',
    'PurposeOfGrantTxt.0': 'purpose',
    'PurposeOfGrant.0': 'purpose'
};

function importTable(task, callback) {
    console.log('inserting rows from ' + task.file);

    var transaction = null;

    var processed = 0,
        queued = 0,
        finished = false;

    function startTransaction(cb) {
        models.sequelize.transaction()
            .then(cb)
            .catch(error);
    }

    function insertRows(tasks, cb) {
        if (finished) {
            cb();
            return;
        }

        console.log('processing ' + numeral(processed).format() + ' - ' +
            numeral(processed + tasks.length).format() + ' of ' +
            numeral(queued).format());

        models.irs990_grant
            .bulkCreate(tasks, {
                transaction: transaction
            })
            .then(function(instances) {
                processed += tasks.length;

                cb();
            })
            .catch(error);

    }

    function error(err) {
        finished = true;

        console.error(err);

        if (transaction !== null) {
            console.error('rolling back transaction');

            transaction.rollback()
                .then(callback.bind(this, err))
                .catch(function() {
                    console.error('error rolling back transaction');

                    callback(err);
                });
        } else {
            callback(err);
        }
    }

    function done() {
        console.log('inserted ' + processed + ' rows from ' + task.file);

        if (processed == queued && !finished) {
            finished = true;

            console.log('commiting transaction');

            transaction.commit()
                .then(function(result) {
                    callback(null, result);
                })
                .catch(error);
        }
    }

    function truncate(cb) {
        models.cmag_ad.truncate({
                transaction: transaction
            })
            .then(cb);
    }

    function readXml() {
        fs.readFile(task.file, function(err, data) {
            if (err) {
                callback(err);
            }

            parseString(data, function(err2, result) {
                if (err2) {
                    callback(err);
                }

                var fileName = path.basename(task.file);

                if (result.Return && result.Return.ReturnData &&
                    result.Return.ReturnData[0] && result.Return.ReturnData[0].IRS990ScheduleI &&
                    result.Return.ReturnData[0].IRS990ScheduleI[0].RecipientTable) {

                    var rows = result.Return.ReturnData[0].IRS990ScheduleI[0].RecipientTable.map(function(obj) {
                        obj = flat(obj);
                        var row = {};

                        row.file = fileName;

                        if (result.Return.ReturnHeader[0].TaxYr) {
                            row.tax_year = (result.Return.ReturnHeader[0].TaxYr[0]);
                        }
                        if (result.Return.ReturnHeader[0].TaxYear) {
                            row.tax_year = (result.Return.ReturnHeader[0].TaxYear[0]);
                        }
                        row.filer_ein = result.Return.ReturnHeader[0].Filer[0].EIN[0];


                        Object.keys(obj).forEach(function(key) {
                            if (key in fieldMap) {
                                row[fieldMap[key]] = obj[key];
                            } else {
                                console.error('unknown field: ' + key, ' ', obj[key]);
                            }
                        });

                        return row;
                    });

                    queued += rows.length;

                    cargo.push(rows);

                    cargo.drain = done;

                    if (rows.length === 0) {
                        done();
                    }
                } else {
                    done();
                }
            });
        });
    }


    var cargo = async.cargo(insertRows, 200);

    startTransaction(function(t) {
        transaction = t;

        readXml();
    });

}

models.sync(function(err) {
    if (err) {
        throw err;
    }

    var dir = __dirname + '/data/2016';

    fs.readdir(dir, function(err, files) {
        var q = async.queue(importTable, 1);
/*
        var ignore = true;

        .filter(function(file) {
            if (file == '201543109349301139_public.xml') {
                ignore = false;
            }

            return !ignore;
        })*/

        q.push(files.map(function(file) {
            return {
                file: dir + '/' + file
            };
        }));

        q.drain = function() {
            console.log('done');
        };
    });
});
