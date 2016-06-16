var parseString = require('xml2js').parseString,
    fs = require('fs'),
    util = require('util'),
    flat = require('flat');

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

var test = fs.readFileSync(__dirname + '/data/test/201543109349301139_public.xml','utf8');

console.log(test);

parseString(test, function(err2, result) {

    if (result.Return && result.Return.ReturnData &&
        result.Return.ReturnData[0] && result.Return.ReturnData[0].IRS990ScheduleI &&
        result.Return.ReturnData[0].IRS990ScheduleI[0].RecipientTable) {
        
        var rows = result.Return.ReturnData[0].IRS990ScheduleI[0].RecipientTable.map(function (obj) {
            obj = flat(obj);
            var row = {};

            if (result.Return.ReturnHeader[0].TaxYr) {
                row.tax_year = (result.Return.ReturnHeader[0].TaxYr[0]);
            }
            if (result.Return.ReturnHeader[0].TaxYear) {
                row.tax_year = (result.Return.ReturnHeader[0].TaxYear[0]);
            }
            row.filer_ein = result.Return.ReturnHeader[0].Filer[0].EIN[0];


            Object.keys(obj).forEach(function (key) {
                if (key in fieldMap) {
                    row[fieldMap[key]] = obj[key];
                }
                else {
                    console.error('unknown field: ' + key,' ',obj[key]);
                }
            });

            return row;
        });

        console.log(rows);
    }


});
