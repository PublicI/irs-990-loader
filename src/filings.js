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
    'RecipientBusinessName.0.BusinessNameLine1.0': 'prefix_name_1',
    'RecipientBusinessName.0.BusinessNameLine1Txt.0': 'prefix_name_1',
    'RecipientNameBusiness.0.BusinessNameLine1.0': 'prefix_name_1',
    'RecipientBusinessName.0.BusinessNameLine2.0': 'prefix_name_2',
    'RecipientBusinessName.0.BusinessNameLine2Txt.0': 'prefix_name_2',
    'RecipientNameBusiness.0.BusinessNameLine2.0': 'prefix_name_2',
    'USAddress.0.AddressLine1.0': 'prefix_street_1',
    'AddressUS.0.AddressLine1.0': 'prefix_street_1',
    'USAddress.0.AddressLine1Txt.0': 'prefix_street_1',
    'ForeignAddress.0.AddressLine1Txt.0': 'prefix_street_1',
    'ForeignAddress.0.AddressLine1.0': 'prefix_street_1',
    'AddressForeign.0.AddressLine1.0': 'prefix_street_1',
    'USAddress.0.AddressLine2.0': 'prefix_street_2',
    'AddressUS.0.AddressLine2.0': 'prefix_street_2',
    'USAddress.0.AddressLine2Txt.0': 'prefix_street_2',
    'ForeignAddress.0.AddressLine2Txt.0': 'prefix_street_2',
    'ForeignAddress.0.AddressLine2.0': 'prefix_street_2',
    'AddressForeign.0.AddressLine2.0': 'prefix_street_2',
    'USAddress.0.City.0': 'prefix_city',
    'USAddress.0.CityNm.0': 'prefix_city',
    'ForeignAddress.0.CityNm.0': 'prefix_city',
    'AddressUS.0.City.0': 'prefix_city',
    'ForeignAddress.0.City.0': 'prefix_city',
    'AddressForeign.0.City.0': 'prefix_city',
    'USAddress.0.State.0': 'prefix_state',
    'AddressUS.0.State.0': 'prefix_state',
    'USAddress.0.StateAbbreviationCd.0': 'prefix_state',
    'ForeignAddress.0.ProvinceOrStateNm.0': 'prefix_state',
    'ForeignAddress.0.ProvinceOrState.0': 'prefix_state',
    'AddressForeign.0.ProvinceOrState.0': 'prefix_state',
    'ForeignAddress.0.CountryCd.0': 'prefix_country',
    'ForeignAddress.0.Country.0': 'prefix_country',
    'AddressForeign.0.Country.0': 'prefix_country',
    'USAddress.0.ZIPCode.0': 'prefix_zip',
    'USAddress.0.ZIPCd.0': 'prefix_zip',
    'AddressUS.0.ZIPCode.0': 'prefix_zip',
    'ForeignAddress.0.PostalCode.0': 'prefix_zip',
    'ForeignAddress.0.ForeignPostalCd.0': 'prefix_zip',
    'AddressForeign.0.PostalCode.0': 'prefix_zip',
    'RecipientEIN.0': 'prefix_ein',
    'EINOfRecipient.0': 'prefix_ein',
    'IRCSectionDesc.0': 'prefix_tax_section',
    'IRCSection.0': 'prefix_tax_section',
    'CashGrantAmt.0': 'cash_amt',
    'AmountOfCashGrant.0': 'cash_amt',
    'NonCashAssistanceAmt.0': 'non_cash_amt',
    'AmountOfNonCashAssistance.0': 'non_cash_amt',
    'NonCashAssistanceDesc.0': 'non_cash_desc',
    'DescriptionOfNonCashAssistance.0': 'non_cash_desc',
    'ValuationMethodUsedDesc.0': 'valuation_method',
    'MethodOfValuation.0': 'valuation_method',
    'PurposeOfGrantTxt.0': 'purpose',
    'PurposeOfGrant.0': 'purpose',
    'PersonNm.0': 'prefix_name',
    'PersonName.0._': 'prefix_name',
    'PersonName.0': 'prefix_name',
    'NamePerson.0': 'prefix_name',
    'BusinessName.0.BusinessNameLine1.0': 'prefix_name',
    'BusinessName.0.BusinessNameLine2.0': 'business_name',
    'NameBusiness.0.BusinessNameLine1.0': 'prefix_name',
    'NameBusiness.0.BusinessNameLine2.0': 'business_name',
    'TitleTxt.0': 'prefix_title',
    'Title.0': 'prefix_title',
    'AverageHoursPerWeekRt.0': 'hours',
    'AverageHoursPerWeek.0': 'hours',
    'AvgHoursPerWkDevotedToPosition.0': 'hours',
    'IndividualTrusteeOrDirectorInd.0': 'trustee_or_director',
    'IndividualTrusteeOrDirector.0': 'trustee_or_director',
    'OfficerInd.0': 'officer',
    'Officer.0': 'officer',
    'HighestCompensatedEmployeeInd.0': 'highest_compensated',
    'HighestCompensatedEmployee.0': 'highest_compensated',
    'KeyEmployee.0': 'key_employee',
    'ReportableCompFromOrgAmt.0': 'org_compensation',
    'ReportableCompFromOrganization.0': 'org_compensation',
    'Compensation.0': 'org_compensation',
    'ReportableCompFromRltdOrgAmt.0': 'related_org_compensation',
    'ReportableCompFromRelatedOrgs.0': 'related_org_compensation',
    'OtherCompensationAmt.0': 'other_compensation',
    'OtherCompensation.0': 'other_compensation',
    'ExpenseAccountOtherAllowances.0': 'expenses_or_allowances',
    'ContriToEmplBenefitPlansEtc.0': 'benefit_contribution',
    'InstitutionalTrustee.0': 'institutional_trustee',
    'PersonName.0.$.referenceDocumentId': 'reference_document_id',
    'BusinessName.0.$.referenceDocumentId': 'reference_document_id'
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

        models.irs990_person
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
        models.irs990_person.truncate({
                transaction: transaction
            })
            .then(cb);
    }

    function mapFields(prefix,obj) {
        obj = flat(obj);
        var row = {};

        Object.keys(obj).forEach(function(key) {
            if (key in fieldMap) {
                row[fieldMap[key].replace('prefix_',prefix + '_')] = obj[key];
            } else {
                console.error('unknown field: ' + key, ' ', obj[key]);
            }
        });

        return row;
    }

    function processPeople(filing, result) {
        var people = [];

        if (result.Return.ReturnData &&
            result.Return.ReturnData[0]) {

            if (result.Return.ReturnData[0].IRS990 &&
                    result.Return.ReturnData[0].IRS990[0].Form990PartVIISectionAGrp) {
                people = result.Return.ReturnData[0].IRS990[0].Form990PartVIISectionAGrp;
            }
            if (result.Return.ReturnData[0].IRS990 &&
                    result.Return.ReturnData[0].IRS990[0].Form990PartVIISectionA) {
                people = result.Return.ReturnData[0].IRS990[0].Form990PartVIISectionA;
            }
            if (result.Return.ReturnData[0].IRS990EZ && result.Return.ReturnData[0].IRS990EZ[0].OfficerDirectorTrusteeKeyEmpl) {
                people = result.Return.ReturnData[0].IRS990EZ[0].OfficerDirectorTrusteeKeyEmpl;
            }
            if (result.Return.ReturnData[0].IRS990PF &&
                result.Return.ReturnData[0].IRS990PF[0].OfcrDirTrusteesKeyEmployeeInfo &&
                result.Return.ReturnData[0].IRS990PF[0].OfcrDirTrusteesKeyEmployeeInfo[0].OfcrDirTrusteesOrKeyEmployee) {
                people = result.Return.ReturnData[0].IRS990PF[0].OfcrDirTrusteesKeyEmployeeInfo[0].OfcrDirTrusteesOrKeyEmployee;
            }

            people = people
                .map(mapFields.bind(this,'person'))
                .map(function(person) {
                    person.filer_ein = filing.ein;
                    person.tax_period = filing.tax_period;
                    person.object_id = filing.object_id;

                    if (person.person_street_1) {
                        person.person_street = person.person_street_1;
                    }

                    return person;
                });

            console.log(people.length);
        }
        return people;
    }

    function processGrants(filing, result) {
        var grants = [];

        if (result.Return.ReturnData &&
            result.Return.ReturnData[0] && result.Return.ReturnData[0].IRS990ScheduleI &&
            result.Return.ReturnData[0].IRS990ScheduleI[0].RecipientTable) {

            grants = result.Return.ReturnData[0]
                .IRS990ScheduleI[0].RecipientTable.map(mapFields.bind(this,'recipient'))
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

            filing.people = processPeople(filing, result);
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

                if (filing && filing.people.length > 0) {
                    startTransaction(function(t) {
                        transaction = t;

                        queued += filing.people.length;

                        cargo.push(filing.people);

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

    var q = async.queue(importTable, 1);

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
