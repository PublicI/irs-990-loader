var _ = require('lodash'),
    fs = require('fs'),
    async = require('async'),
    numeral = require('numeral'),
    models = require('../../models'),
    moment = require('moment'),
    parseString = require('xml2js').parseString,
    util = require('util'),
    flat = require('flat'),
    path = require('path'),
    rread = require('fs-readdir-recursive');

var fieldMap = {
    'ContriToEmplBenefitPlansEtc.0': 'benefit_contribution',
    'EmployeeBenefitProgramAmt.0': 'benefit_contribution',
    'BusinessName.0.BusinessNameLine1.0': 'business_name_1',
    'NameBusiness.0.BusinessNameLine1.0': 'business_name_1',
    'ContributorNameBusiness.0.BusinessNameLine1.0': 'business_name_1',
    'BusinessName.0.BusinessNameLine2.0': 'business_name_2',
    'NameBusiness.0.BusinessNameLine2.0': 'business_name_2',
    'ContributorNameBusiness.0.BusinessNameLine2.0': 'business_name_2',
    'CashGrantAmt.0': 'cash_amt',
    'Amt.0': 'cash_amt',
    'AmountOfCashGrant.0': 'cash_amt',
    'Amount.0': 'cash_amt',
    'AmtOfContribsRecdDelivered.0': 'passthrough_amt',
    'AmtPdFromInternalFunds.0': 'internal_amt',
    'NoncashContributionType.0': 'contribution_type_noncash',
    'PayrollContributionType.0': 'contribution_type_payroll',
    'PersonContributionType.0': 'contribution_type_person',
    'ExpenseAccountOtherAllowances.0': 'expenses_or_allowances',
    'ExpenseAccountOtherAllwncAmt.0': 'expenses_or_allowances',
    'Former.0': 'former',
    'FormerOfcrDirectorTrusteeInd.0': 'former',
    'HighestCompensatedEmployeeInd.0': 'highest_compensated',
    'HighestCompensatedEmployee.0': 'highest_compensated',
    'AverageHoursPerWeekRt.0': 'hours',
    'AverageHoursPerWeek.0': 'hours',
    'AverageHrsPerWkDevotedToPosRt.0': 'hours',
    'AvgHoursPerWkDevotedToPosition.0': 'hours',
    'InstitutionalTrustee.0': 'institutional_trustee',
    'InstitutionalTrusteeInd.0': 'institutional_trustee',
    'KeyEmployee.0': 'key_employee',
    'KeyEmployeeInd.0': 'key_employee',
    'NonCashAssistanceAmt.0': 'non_cash_amt',
    'AmountOfNonCashAssistance.0': 'non_cash_amt',
    'NonCashAssistanceDesc.0': 'non_cash_desc',
    'DescriptionOfNonCashAssistance.0': 'non_cash_desc',
    'OfficerInd.0': 'officer',
    'Officer.0': 'officer',
    'ReportableCompFromOrgAmt.0': 'org_compensation',
    'ReportableCompFromOrganization.0': 'org_compensation',
    'Compensation.0': 'org_compensation',
    'CompensationAmt.0': 'org_compensation',
    'OtherCompensationAmt.0': 'other_compensation',
    'OtherCompensation.0': 'other_compensation',
    'AggregateContributions.0': 'prefix_aggregate_amt',
    'USAddress.0.City.0': 'prefix_city',
    'USAddress.0.CityNm.0': 'prefix_city',
    'ForeignAddress.0.CityNm.0': 'prefix_city',
    'AddressUS.0.City.0': 'prefix_city',
    'ForeignAddress.0.City.0': 'prefix_city',
    'AddressForeign.0.City.0': 'prefix_city',
    'RecipientUSAddress.0.City.0': 'prefix_city',
    'RecipientForeignAddress.0.City.0': 'prefix_city',
    'RecipientUSAddress.0.CityNm.0': 'prefix_city',
    'RecipientForeignAddress.0.CityNm.0': 'prefix_city',
    'ContributorAddressUS.0.City.0': 'prefix_city',
    'ContributorAddressForeign.0.City.0': 'prefix_city',
    'ForeignAddress.0.CountryCd.0': 'prefix_country',
    'ForeignAddress.0.Country.0': 'prefix_country',
    'AddressForeign.0.Country.0': 'prefix_country',
    'RecipientForeignAddress.0.Country.0': 'prefix_country',
    'RecipientForeignAddress.0.CountryCd.0': 'prefix_country',
    'ContributorAddressForeign.0.Country.0': 'prefix_country',
    'RecipientEIN.0': 'prefix_ein',
    'EINOfRecipient.0': 'prefix_ein',
    'EIN.0': 'prefix_ein',
    'PersonNm.0': 'prefix_name',
    'PersonName.0._': 'prefix_name',
    'PersonName.0': 'prefix_name',
    'NamePerson.0': 'prefix_name',
    'PersonNm.0._': 'prefix_name',
    'ContributorNameIndividual.0': 'prefix_name',
    'RecipientPersonName.0': 'prefix_name_1',
    'NameOf527Organization.0.BusinessNameLine1.0': 'prefix_name_1',
    'RecipientBusinessName.0.BusinessNameLine1.0': 'prefix_name_1',
    'RecipientBusinessName.0.BusinessNameLine1Txt.0': 'prefix_name_1',
    'RecipientNameBusiness.0.BusinessNameLine1.0': 'prefix_name_1',
    'RecipientPersonNm.0': 'prefix_name_1',
    'RecipientBusinessName.0.BusinessNameLine2.0': 'prefix_name_2',
    'RecipientBusinessName.0.BusinessNameLine2Txt.0': 'prefix_name_2',
    'RecipientNameBusiness.0.BusinessNameLine2.0': 'prefix_name_2',
    'NameOf527Organization.0.BusinessNameLine2.0': 'prefix_name_2',
    'ContributorNumber.0': 'prefix_number',
    'RecipientRelationshipTxt.0': 'prefix_relationship',
    'RecipientRelationship.0': 'prefix_relationship',
    'USAddress.0.State.0': 'prefix_state',
    'AddressUS.0.State.0': 'prefix_state',
    'RecipientUSAddress.0.State.0': 'prefix_state',
    'USAddress.0.StateAbbreviationCd.0': 'prefix_state',
    'RecipientUSAddress.0.StateAbbreviationCd.0': 'prefix_state',
    'ForeignAddress.0.ProvinceOrStateNm.0': 'prefix_state',
    'RecipientForeignAddress.0.ProvinceOrState.0': 'prefix_state',
    'ForeignAddress.0.ProvinceOrState.0': 'prefix_state',
    'AddressForeign.0.ProvinceOrState.0': 'prefix_state',
    'ContributorAddressForeign.0.ProvinceOrState.0': 'prefix_state',
    'ContributorAddressUS.0.State.0': 'prefix_state',
    'USAddress.0.AddressLine1.0': 'prefix_street_1',
    'AddressUS.0.AddressLine1.0': 'prefix_street_1',
    'USAddress.0.AddressLine1Txt.0': 'prefix_street_1',
    'ForeignAddress.0.AddressLine1Txt.0': 'prefix_street_1',
    'ForeignAddress.0.AddressLine1.0': 'prefix_street_1',
    'AddressForeign.0.AddressLine1.0': 'prefix_street_1',
    'RecipientUSAddress.0.AddressLine1.0': 'prefix_street_1',
    'RecipientForeignAddress.0.AddressLine1.0': 'prefix_street_1',
    'RecipientUSAddress.0.AddressLine1Txt.0': 'prefix_street_1',
    'ContributorAddressUS.0.AddressLine1.0': 'prefix_street_1',
    'ContributorAddressForeign.0.AddressLine1.0': 'prefix_street_1',
    'ContributorAddressForeign.0.AddressLine2.0': 'prefix_street_2',
    'USAddress.0.AddressLine2.0': 'prefix_street_2',
    'AddressUS.0.AddressLine2.0': 'prefix_street_2',
    'USAddress.0.AddressLine2Txt.0': 'prefix_street_2',
    'ForeignAddress.0.AddressLine2Txt.0': 'prefix_street_2',
    'ForeignAddress.0.AddressLine2.0': 'prefix_street_2',
    'AddressForeign.0.AddressLine2.0': 'prefix_street_2',
    'RecipientForeignAddress.0.AddressLine2.0': 'prefix_street_2',
    'RecipientUSAddress.0.AddressLine2.0': 'prefix_street_2',
    'RecipientUSAddress.0.AddressLine2Txt.0': 'prefix_street_2',
    'ContributorAddressUS.0.AddressLine2.0': 'prefix_street_2',
    'IRCSectionDesc.0': 'prefix_tax_section',
    'IRCSection.0': 'prefix_tax_section',
    'RecipientFoundationStatusTxt.0': 'prefix_tax_section',
    'RecipientFoundationStatus.0': 'prefix_tax_section',
    'TitleTxt.0': 'prefix_title',
    'Title.0': 'prefix_title',
    'USAddress.0.ZIPCode.0': 'prefix_zip',
    'USAddress.0.ZIPCd.0': 'prefix_zip',
    'AddressUS.0.ZIPCode.0': 'prefix_zip',
    'RecipientUSAddress.0.ZIPCode.0': 'prefix_zip',
    'ForeignAddress.0.PostalCode.0': 'prefix_zip',
    'ForeignAddress.0.ForeignPostalCd.0': 'prefix_zip',
    'AddressForeign.0.PostalCode.0': 'prefix_zip',
    'RecipientUSAddress.0.ZIPCd.0': 'prefix_zip',
    'ContributorAddressUS.0.ZIPCode.0': 'prefix_zip',
    'RecipientForeignAddress.0.PostalCode.0': 'prefix_zip',
    'ContributorAddressForeign.0.PostalCode.0': 'prefix_zip',
    'PurposeOfGrantTxt.0': 'purpose',
    'PurposeOfGrant.0': 'purpose',
    'PurposeOfGrantOrContribution.0': 'purpose',
    'GrantOrContributionPurposeTxt.0': 'purpose',
    'PersonName.0.$.referenceDocumentId': 'reference_document_id',
    'BusinessName.0.$.referenceDocumentId': 'reference_document_id',
    'PersonName.0.$.referenceDocumentName': 'reference_document_id',
    'PersonNm.0.$.referenceDocumentId': 'reference_document_id',
    'ReportableCompFromRltdOrgAmt.0': 'related_org_compensation',
    'ReportableCompFromRelatedOrgs.0': 'related_org_compensation',
    'AverageHoursPerWeekRltdOrgRt.0': 'related_org_hours',
    'AverageHoursPerWeekRelated.0': 'related_org_hours',
    'IndividualTrusteeOrDirectorInd.0': 'trustee_or_director',
    'IndividualTrusteeOrDirector.0': 'trustee_or_director',
    'ValuationMethodUsedDesc.0': 'valuation_method',
    'MethodOfValuation.0': 'valuation_method'
};

function importFiling(task, callback) {
    // console.log('processing ' + task.file);

    var transaction = null;

    var processed = 0,
        queued = 0,
        finished = false;

    function startTransaction(cb) {
        if (models.sequelize) {
            models.sequelize.transaction()
                .then(cb)
                .catch(error);
        } else {
            // console.warn('no database connection, no transaction started');

            cb();
        }
    }

    function processRows(task, cb) {
        if (finished) {
            cb();
            return;
        }
        /*
                console.log('processing ' + numeral(processed).format() + ' - ' +
                    numeral(processed + task.rows.length).format() + ' of ' +
                    numeral(queued).format());
        */

        rows = task.rows;

        rows[0].model
            .bulkCreate(rows, {
                transaction: transaction
            })
            .then(function(instances) {
                processed += rows.length;

                cb();
            })
            .catch(error);
    }


    function queueRows(rows, cb) {
        if (finished) {
            cb();
            return;
        }

        var modelGroups = _(rows)
            .groupBy(function(row) {
                return row.model.name;
            })
            .toArray()
            .map(function(rows) {
                return {
                    rows: rows
                };
            })
            .value();

        var q = async.queue(processRows, 1);

        q.push(modelGroups, function(err) {
            if (err) {
                q.kill();

                cb(err);
            }
        });

        q.drain = cb;
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
                // console.log('commiting transaction');

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

    function truncate(model, cb) {
        if (model) {
            model.truncate({
                    transaction: transaction
                })
                .then(cb);
        }
    }

    function checkForFiling(id,cb) {
        models.irs990_filing.findById(id)
            .then(function (result) {
                if (result) {
                    //console.log('already inserted ' + filing_id);

                    callback();
                }
                else {
                    cb();
                }
            })
            .catch(error);
    }

    function mapFields(prefix, obj) {
        obj = flat(obj);
        var row = {};

        Object.keys(obj).forEach(function(key) {
            if (key in fieldMap) {
                row[fieldMap[key].replace('prefix_', prefix + '_')] = obj[key];
            } else {
                console.error('error: unknown field ' + key, ' ', obj[key]);
            }
        });

        return row;
    }

    function processPolitcalContribs(filing, result) {
        var orgs = [];

        if (result.Return.ReturnData[0].IRS990ScheduleC) {
            var schedule = result.Return.ReturnData[0].IRS990ScheduleC[0];

            if (schedule.Sec527PolOrgs || schedule.Sec527PoliticalOrgs || schedule.Section527PoliticalOrgGrp ||
                schedule.Section527PoliticalOrg || schedule.Section527PoliticalOrgs) {

                orgs = schedule.Sec527PolOrgs || schedule.Sec527PoliticalOrgs || schedule.Section527PoliticalOrgGrp ||
                            schedule.Section527PoliticalOrg || schedule.Section527PoliticalOrgs;

                orgs = orgs.map(mapFields.bind(this, 'org'))
                        .map(function (org) {
                            org.org_name = null;
                            if (org.org_name_1) {
                                org.org_name = org.org_name_1.trim();
                            }
                            if (org.org_name_2) {
                                org.org_name = ' ' + org.org_name_2.trim();
                            }

                            org.model = models.irs990_political_contrib;

                            return org;
                        });
            }
        }

        return orgs;
    }

    function processContributors(filing, result) {
        var contributors = [];

        if (result.Return.ReturnData[0].IRS990ScheduleB) {
            var schedule = result.Return.ReturnData[0].IRS990ScheduleB[0];

            if (schedule.ContributorInfo) {
                contributors = schedule.ContributorInfo
                    .map(mapFields.bind(this, 'contributor'))
                    .filter(function (contributor) {
                        var include = false;

                        Object.keys(contributor).forEach(function(key) {
                            if (contributor[key] !== 'RESTRICTED') {
                                include = true;
                            }
                        });

                        return include;
                    })
                    .map(function(contributor) {
                        contributor.model = models.irs990_contributor;

                        return contributor;
                    });
            }
        }

        return contributors;
    }

    function processPeople(filing, result) {
        var people = [];

        if (result.Return.ReturnData &&
            result.Return.ReturnData[0]) {

            var form = null;

            if (result.Return.ReturnData[0].IRS990) {
                form = result.Return.ReturnData[0].IRS990[0];
            }
            if (result.Return.ReturnData[0].IRS990EZ) {
                form = result.Return.ReturnData[0].IRS990EZ[0];
            }
            if (result.Return.ReturnData[0].IRS990PF) {
                form = result.Return.ReturnData[0].IRS990PF[0];
            }

            if (!form) {
                console.error('error: no form found in ' + task.file);
            }

            if (form.Form990PartVIISectionAGrp) {
                people = form.Form990PartVIISectionAGrp;
            }
            if (form.Form990PartVIISectionA) {
                people = form.Form990PartVIISectionA;
            }
            if (form.OfficerDirectorTrusteeKeyEmpl) {
                people = form.OfficerDirectorTrusteeKeyEmpl;
            }
            if (form.OfcrDirTrusteesOrKeyEmployee) {
                people = form.OfcrDirTrusteesOrKeyEmployee;
            }
            if (form.OfcrDirTrusteesKeyEmployeeInfo &&
                form.OfcrDirTrusteesKeyEmployeeInfo[0].OfcrDirTrusteesOrKeyEmployee) {
                people = form.OfcrDirTrusteesKeyEmployeeInfo[0].OfcrDirTrusteesOrKeyEmployee;
            }
            if (form.OfficerDirTrstKeyEmplInfoGrp &&
                form.OfficerDirTrstKeyEmplInfoGrp[0].OfficerDirTrstKeyEmplGrp) {
                people = form.OfficerDirTrstKeyEmplInfoGrp[0].OfficerDirTrstKeyEmplGrp;
            }
            if (form.OfficerDirectorTrusteeEmplGrp) {
                people = form.OfficerDirectorTrusteeEmplGrp;
            }

            people = people
                .map(mapFields.bind(this, 'person'))
                .map(function(person) {
                    if (person.person_street_1) {
                        person.person_street = person.person_street_1;
                    }

                    person.business_name = null;
                    if (person.business_name_1) {
                        person.business_name = person.business_name_1.trim();
                    }
                    if (person.business_name_2) {
                        person.business_name = ' ' + person.business_name_2.trim();
                    }

                    person.model = models.irs990_person;

                    return person;
                });

            if (people.length === 0) {
                console.error('error: no people in' + task.file);
            }
        }
        return people;
    }

    function processGrants(filing, result) {
        var grants = [];

        if (result.Return.ReturnData &&
            result.Return.ReturnData[0]) {
            var returnData = result.Return.ReturnData[0];

            if (returnData.IRS990PF) {
                if (returnData.IRS990PF[0].SupplementaryInformationGrp || returnData.IRS990PF[0].SupplementaryInformation) {
                    var group = returnData.IRS990PF[0].SupplementaryInformation || returnData.IRS990PF[0].SupplementaryInformationGrp;

                    grants = group[0].GrantOrContriPaidDuringYear || group[0].GrantOrContributionPdDurYrGrp || [];
                }
            }

            if (returnData.IRS990ScheduleI &&
                returnData.IRS990ScheduleI[0].RecipientTable) {
                grants = returnData.IRS990ScheduleI[0].RecipientTable;
            }

            grants = grants.map(mapFields.bind(this, 'recipient'))
                .map(function(grant) {
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

                    grant.model = models.irs990_grant;

                    return grant;
                });

        }
        return grants;
    }

    function processFiling(result) {
        var rows = [];

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

            filing.filer_ein = header.Filer[0].EIN[0];
            filing.object_id = fileName.replace('_public.xml', '');

            filing.model = models.irs990_filing;

            rows.push(filing);

            /*
                        var form = null;

                        if (result.Return.ReturnData[0].IRS990) {
                            form = result.Return.ReturnData[0].IRS990[0];
                        }
                        if (result.Return.ReturnData[0].IRS990EZ) {
                            form = result.Return.ReturnData[0].IRS990EZ[0];
                        }
                        if (result.Return.ReturnData[0].IRS990PF) {
                            form = result.Return.ReturnData[0].IRS990PF[0];
                        }

                        if (!form) {
                            console.error('error: no form found in ' + task.file);
                        }*/

            rows = rows.concat(processGrants(filing, result));
            rows = rows.concat(processPeople(filing, result));
            rows = rows.concat(processContributors(filing, result));
            rows = rows.concat(processPolitcalContribs(filing,result));

            rows = rows.map(function (row) {
                row.filer_ein = filing.filer_ein;
                row.object_id = filing.object_id;
                row.tax_period = filing.tax_period;

                return row;
            });

        }

        return rows;
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

                var rows = processFiling(result);

                if (rows && rows.length > 0) {
                    startTransaction(function(t) {
                        if (!t) {
                            done();

                            return;
                        }

                        transaction = t;

                        cargo.push(rows);

                        queued += rows.length;

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

    var cargo = async.cargo(queueRows, 200);

    // assume the object ID is just the numeric portion of the file name
    var object_id = path.basename(task.file,'.xml').replace(/[^0-9]+/g,'');

    checkForFiling(object_id,readXml);

}

function importDir(dir) {
    dir = dir || __dirname + '/../../data';

    var q = async.queue(importFiling, 1);

    rread(dir)
        .filter(function(file) {
            return (file.slice(-4) === '.xml');
        })
        .forEach(function(file) {
            q.push({
                file: dir + '/' + file
            });
        });

    q.drain = function() {
        console.log('done');
    };
}

var dir = __dirname + '/data';

if (models.sync) {
    models.sync(function(err) {
        if (err) {
            console.error(err);
        }

        importDir();
    });
} else {
    importDir();
}
