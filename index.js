/*jslint node: true, browser: true, nomen: true, todo: true */
'use strict';

var nano    = require('nano')('http://user:password@127.0.0.1:5984'),
    adb     = nano.db.use('artendb'),
    _       = require('underscore'),
    docs    = [],
    bulk    = {};

adb.view('artendb', 'all_docs', {
    'include_docs': true
}, function (err, body) {
    if (!err) {
        _.each(body.rows, function (row) {
            var doc = row.doc;
            if (doc.Eigenschaftensammlungen) {
                _.each(doc.Eigenschaftensammlungen, function (es) {
                    if (es.Eigenschaften && (es.Eigenschaften['Bindung an Flachmoore'] || es.Eigenschaften['Bindung an Flachmoore'] === 0) && (es.Eigenschaften['Artwert AP FM'] || es.Eigenschaften['Artwert AP FM'] === 0) && !es.Eigenschaften['Art ist unerwünscht']) {
                        es.Eigenschaften['Artwertberechnung verwendeter Artwert'] = es.Eigenschaften['Artwert AP FM'] - es.Eigenschaften['Bindung an Flachmoore'];
                        docs.push(doc);
                    }
                });
            }
        });
        // bulk-Format aufbauen
        bulk.docs = docs;
        // alle Updates in einem mal durchführen
        adb.bulk(bulk);
        console.log(docs.length + ' Objekte aktualisiert');
    } else {
        console.log('err: ', err);
    }
});