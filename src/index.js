var _ = require('lodash'),
    fs = require('fs'),
    async = require('async'),
    numeral = require('numeral'),
    models = require('./models'),
    moment = require('moment'),
    JSONStream = require('JSONStream'),
    replaceStream = require('replacestream'),
    brake = require('brake');

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

    function readJson() {
        var i = 0;

        fs.createReadStream(task.file)
            .pipe(brake(45164*20))
            .pipe(replaceStream(/("|'|True|False)/g, function (match) {
                if (match == '"') {
                    i++;

                    return i <= 2 ? '"' : '\\"';
                }
                else if (match == '\'') {
                    return '"';
                }
                else if (match == 'True') {
                    return 'true';
                }
                else if (match == 'False') {
                    return 'false';
                }
            }))
            .pipe(JSONStream.parse('AllFilings.*'))
            .on('data', function(row) {
                queued++;

                cargo.push(row);
            })
            .on('end',function () {
                cargo.drain = done;

                if (queued === 0) {
                    done();
                }
            });
    }

    var cargo = async.cargo(insertRows, 200);

    startTransaction(function(t) {
        transaction = t;

        readJson();
    });

}

models.sync(function (err) {
    if (err) {
        throw err;
    }

    importTable({
        file: __dirname + '/data/index.json'
    },function () {

    });
});
