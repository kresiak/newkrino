import { Angular2Csv } from 'angular2-csv/Angular2-csv'

export function generateReport(data) {

    var options = {
        fieldSeparator: ';',
        quoteStrings: '"',
        decimalseparator: '.',
        showLabels: true,
        showTitle: false,
        useBom: true
    };

    new Angular2Csv(data, 'Krino report', options);
}