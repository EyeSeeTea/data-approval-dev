import { createObjectCsvStringifier } from "csv-writer";
import { CsvDataSource, CsvData } from "./CsvDataSource";

//
export class CsvWriterDataSource implements CsvDataSource {
    toString<Field extends string>(data: CsvData<Field>): string {
        const csvStringifier = createObjectCsvStringifier({
            header: data.headers.map(headers => ({
                id: headers.id,
                title: headers.text,
            })),
        });
        const header = csvStringifier.getHeaderString();
        const rows = csvStringifier.stringifyRecords(data.rows);

        return header + rows;
    }
}
