var _ = require('lodash'),
    fs = require('fs'),
    async = require('async'),
    numeral = require('numeral'),
    models = require('./models'),
    moment = require('moment'),
    parseString = require('xml2js').parseString,
    util = require('util'),
    flat = require('flat'),
    path = require('path'),
    rread = require('readdir-recursive');

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
    'AddressForeign.0.AddressLine1.0': 'recipient_street_1',
    'USAddress.0.AddressLine2.0': 'recipient_street_2',
    'AddressUS.0.AddressLine2.0': 'recipient_street_2',
    'USAddress.0.AddressLine2Txt.0': 'recipient_street_2',
    'ForeignAddress.0.AddressLine2Txt.0': 'recipient_street_2',
    'ForeignAddress.0.AddressLine2.0': 'recipient_street_2',
    'AddressForeign.0.AddressLine2.0': 'recipient_street_2',
    'USAddress.0.City.0': 'recipient_city',
    'USAddress.0.CityNm.0': 'recipient_city',
    'ForeignAddress.0.CityNm.0': 'recipient_city',
    'AddressUS.0.City.0': 'recipient_city',
    'ForeignAddress.0.City.0': 'recipient_city',
    'AddressForeign.0.City.0': 'recipient_city',
    'USAddress.0.State.0': 'recipient_state',
    'AddressUS.0.State.0': 'recipient_state',
    'USAddress.0.StateAbbreviationCd.0': 'recipient_state',
    'ForeignAddress.0.ProvinceOrStateNm.0': 'recipient_state',
    'ForeignAddress.0.ProvinceOrState.0': 'recipient_state',
    'AddressForeign.0.ProvinceOrState.0': 'recipient_state',
    'ForeignAddress.0.CountryCd.0': 'recipient_country',
    'ForeignAddress.0.Country.0': 'recipient_country',
    'AddressForeign.0.Country.0': 'recipient_country',
    'USAddress.0.ZIPCode.0': 'recipient_zip',
    'USAddress.0.ZIPCd.0': 'recipient_zip',
    'AddressUS.0.ZIPCode.0': 'recipient_zip',
    'ForeignAddress.0.PostalCode.0': 'recipient_zip',
    'ForeignAddress.0.ForeignPostalCd.0': 'recipient_zip',
    'AddressForeign.0.PostalCode.0': 'recipient_zip',
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
        // console.log('inserted ' + processed + ' rows from ' + task.file);

        if (processed == queued && !finished) {
            finished = true;

            if (transaction) {
                console.log('commiting transaction');

                transaction.commit()
                    .then(function(result) {
                        callback(null, result);
                    })
                    .catch(error);
            } else {
                callback(null);
            }
        }
    }

    function truncate(cb) {
        models.irs990_grant.truncate({
                transaction: transaction
            })
            .then(cb);
    }

    function mapFields(obj) {
        obj = flat(obj);
        var row = {};

        Object.keys(obj).forEach(function(key) {
            if (key in fieldMap) {
                row[fieldMap[key]] = obj[key];
            } else {
                console.error('unknown field: ' + key, ' ', obj[key]);
            }
        });

        return row;
    }

    function processOfficers(filing, result) {
        var officers = [];

        if (result.Return.ReturnData &&
            result.Return.ReturnData[0] && (result.Return.ReturnData[0].Form990PartVIISectionAGrp ||
            result.Return.ReturnData[0].OfficerDirectorTrusteeKeyEmpl)) {

            officers = result.Return.ReturnData[0].Form990PartVIISectionAGrp || result.Return.ReturnData[0].OfficerDirectorTrusteeKeyEmpl;

            officers
                .map(mapFields)
                .map(function(officer) {
                    officer.filer_ein = filing.ein;
                    officer.tax_period = filing.tax_period;
                    officer.object_id = filing.object_id;

                    console.log(officer);

                    return officer;
                });
        }
        return officers;
    }

    function processGrants(filing, result) {
        var grants = [];

        if (result.Return.ReturnData &&
            result.Return.ReturnData[0] && result.Return.ReturnData[0].IRS990ScheduleI &&
            result.Return.ReturnData[0].IRS990ScheduleI[0].RecipientTable) {

            grants = result.Return.ReturnData[0]
                .IRS990ScheduleI[0].RecipientTable.map(mapFields)
                .map(function(grant) {
                    grant.filer_ein = filing.ein;
                    grant.tax_period = filing.tax_period;
                    grant.object_id = filing.object_id;

                    grant.recipient_name = null;
                    if (grant.recipient_name_1) {
                        grant.recipient_name = grant.recipient_name_1.trim();
                    }
                    if (grant.recipient_name_2) {
                        if (grant.recipient_name) {
                            grant.recipient_name += ' ' + grant.recipient_name_2.trim();
                        } else {
                            grant.recipient_name = grant.recipient_name_2.trim();
                        }
                    }

                    return grant;
                });
        }
        return grants;
    }

    function processFiling(result) {
        var filing = {};

        if (result.Return) {
            var fileName = path.basename(task.file);

            var header = result.Return.ReturnHeader[0];
            var endDate = null;
            if (header.TaxPeriodEndDt) {
                endDate = header.TaxPeriodEndDt[0];
            }
            if (header.TaxPeriodEndDate) {
                endDate = header.TaxPeriodEndDate[0];
            }
            if (endDate) {
                filing.tax_period = endDate.replace('-', '').substr(0, 6);
            }

            filing.ein = header.Filer[0].EIN[0];
            filing.object_id = fileName.replace('_public.xml', '');

            // filing.grants = processGrants(filing, result);
            filing.grants = [];

            filing.officers = processOfficers(filing, result);
        }

        return filing;
    }

    function readXml() {
        fs.readFile(task.file, function(err, data) {
            if (err) {
                error(err);
            }

            parseString(data, function(err2, result) {
                if (err2) {
                    error(err);
                }

                var filing = processFiling(result);

                if (filing && filing.grants.length > 0) {
                    startTransaction(function(t) {
                        transaction = t;

                        queued += filing.grants.length;

                        cargo.push(filing.grants);

                        cargo.drain = done;

                        if (queued === processed || queued === 0) {
                            done();
                        }
                    });
                } else {
                    done();
                }
            });
        });
    }


    var cargo = async.cargo(insertRows, 200);

    readXml();

}

models.sync(function(err) {
    if (err) {
        throw err;
    }

    var dir = __dirname + '/data';

    var q = async.queue(importTable, 2);

    rread
        .fileSync(dir)
        .filter(function(file) {
            return (file.slice(-4) === '.xml');
        })
        .forEach(function(file) {
            q.push({
                file: file
            });
        });

    q.drain = function() {
        console.log('done');
    };

});
