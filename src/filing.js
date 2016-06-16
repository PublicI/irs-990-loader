var _ = require('lodash'),
    fs = require('fs'),
    async = require('async'),
    numeral = require('numeral'),
    models = require('./models'),
    moment = require('moment'),
    parseString = require('xml2js').parseString,
    util = require('util'),
    flat = require('flat');

function importTable(task, callback) {
    // console.log('inserting rows from ' + task.file);

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

        models.irs990_filing
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
        fs.readFile(task.file,function (err,data) {
            if (err) {
                callback(err);
            }

            parseString(data,function (err2,result) {
                if (err2) {
                    callback(err);
                }

                if (result.Return && result.Return.ReturnData &&
                    result.Return.ReturnData[0] && result.Return.ReturnData[0].IRS990ScheduleI &&
                    result.Return.ReturnData[0].IRS990ScheduleI[0].RecipientTable) {
                    result.Return.ReturnData[0].IRS990ScheduleI[0].RecipientTable.map(function (obj) {
                        obj = flat(obj);
                        var row = {};

                        row.name1 = obj['RecipientBusinessName.0.BusinessNameLine1.0'];
                        delete obj['RecipientBusinessName.0.BusinessNameLine1.0'];
                        row.name2 = obj['RecipientBusinessName.0.BusinessNameLine2.0'];
                        delete obj['RecipientBusinessName.0.BusinessNameLine2.0'];
                        row.address1 = obj['USAddress.0.AddressLine1.0'];
                        delete obj['USAddress.0.AddressLine1.0'];
                        row.address2 = obj['USAddress.0.AddressLine2.0'];
                        delete obj['USAddress.0.AddressLine2.0'];
                        row.city = obj['USAddress.0.City.0'];
                        delete obj['USAddress.0.City.0'];
                        row.city = obj['USAddress.0.State.0'];
                        delete obj['USAddress.0.State.0'];
                        row.zip = obj['USAddress.0.ZIPCode.0'];
                        delete obj['USAddress.0.ZIPCode.0'];
                        row.ein = obj['RecipientEIN.0'];
                        delete obj['RecipientEIN.0'];
                        row.section = obj['IRCSectionDesc.0'];
                        delete obj['IRCSectionDesc.0'];
                        row.cash_amt = obj['CashGrantAmt.0'];
                        delete obj['CashGrantAmt.0'];
                        row.non_cash_amt = obj['NonCashAssistanceAmt.0'];
                        delete obj['NonCashAssistanceAmt.0'];
                        row.non_cash_desc = obj['NonCashAssistanceDesc.0'];
                        delete obj['NonCashAssistanceDesc.0'];
                        row.valuation_method = obj['ValuationMethodUsedDesc.0'];
                        delete obj['ValuationMethodUsedDesc.0'];
                        row.purpose = obj['PurposeOfGrantTxt.0'];
                        delete obj['PurposeOfGrantTxt.0'];

                        if (obj['RecipientBusinessName.0.BusinessNameLine1Txt.0']) {
                            row.name1 = obj['RecipientBusinessName.0.BusinessNameLine1Txt.0'];
                            delete obj['RecipientBusinessName.0.BusinessNameLine1Txt.0'];
                        }
                        if (obj['RecipientNameBusiness.0.BusinessNameLine1.0']) {
                            row.name1 = obj['RecipientNameBusiness.0.BusinessNameLine1.0'];
                            delete obj['RecipientNameBusiness.0.BusinessNameLine1.0'];
                        }
                        if (obj['RecipientBusinessName.0.BusinessNameLine2Txt.0']) {
                            row.name2 = obj['RecipientBusinessName.0.BusinessNameLine2Txt.0'];
                            delete obj['RecipientBusinessName.0.BusinessNameLine2Txt.0'];
                        }
                        if (obj['RecipientNameBusiness.0.BusinessNameLine2.0']) {
                            row.name2 = obj['RecipientNameBusiness.0.BusinessNameLine2.0'];
                            delete obj['RecipientNameBusiness.0.BusinessNameLine2.0'];
                        }
                        if (obj['AddressUS.0.AddressLine1.0']) {
                            row.address1 = obj['AddressUS.0.AddressLine1.0'];
                            delete obj['AddressUS.0.AddressLine1.0'];
                        }
                        if (obj['USAddress.0.AddressLine1Txt.0']) {
                            row.address1 = obj['USAddress.0.AddressLine1Txt.0'];
                            delete obj['USAddress.0.AddressLine1Txt.0'];
                        }
                        if (obj['USAddress.0.CityNm.0']) {
                            row.city = obj['USAddress.0.CityNm.0'];
                            delete obj['USAddress.0.CityNm.0'];
                        }
                        if (obj['AddressUS.0.City.0']) {
                            row.city = obj['AddressUS.0.City.0'];
                            delete obj['AddressUS.0.City.0'];
                        }
                        if (obj['USAddress.0.StateAbbreviationCd.0']) {
                            row.state = obj['USAddress.0.StateAbbreviationCd.0'];
                            delete obj['USAddress.0.StateAbbreviationCd.0'];
                        }
                        if (obj['AddressUS.0.State.0']) {
                            row.state = obj['AddressUS.0.State.0'];
                            delete obj['AddressUS.0.State.0'];
                        }
                        if (obj['USAddress.0.ZIPCd.0']) {
                            row.zip = obj['USAddress.0.ZIPCd.0'];
                            delete obj['USAddress.0.ZIPCd.0'];
                        }
                        if (obj['AddressUS.0.ZIPCode.0']) {
                            row.zip = obj['AddressUS.0.ZIPCode.0'];
                            delete obj['AddressUS.0.ZIPCode.0'];
                        }
                        if (obj['EINOfRecipient.0']) {
                            row.ein = obj['EINOfRecipient.0'];
                            delete obj['EINOfRecipient.0'];
                        }
                        if (obj['IRCSection.0']) {
                            row.section = obj['IRCSection.0'];
                            delete obj['IRCSection.0'];
                        }
                        if (obj['AmountOfCashGrant.0']) {
                            row.cash_amt = obj['AmountOfCashGrant.0'];
                            delete obj['AmountOfCashGrant.0'];
                        }
                        if (obj['PurposeOfGrant.0']) {
                            row.purpose = obj['PurposeOfGrant.0'];
                            delete obj['PurposeOfGrant.0'];
                        }

                        if (Object.keys(obj).length !== 0) {
                            console.log(obj);
                        }

                        return row;
                    });
                }

                callback();
            });
        });
    }
/*
    var cargo = async.cargo(insertRows, 200);

    startTransaction(function(t) {
        transaction = t;*/

        readXml();
    //});

}

models.sync(function (err) {
    if (err) {
        throw err;
    }

    var dir = __dirname + '/data/2015';

    fs.readdir(dir,function (err,files) {
        var q = async.queue(importTable,1);

        q.push(files.map(function (file) {
            return {
                file: dir + '/' + file
            };
        }));

        q.drain = function () {
            console.log('done');
        };
    });
});
