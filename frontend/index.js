import { initializeBlock, useBase, useRecords } from '@airtable/blocks/ui';
import React from 'react';

function HelloWorldApp() {
    // YOUR CODE GOES HERE
    const base = useBase();
    const table = base.getTableByName('Explorer');
    const records = useRecords(table.selectRecords());

    function updateRecord(record, recordFields) {
        if (table.hasPermissionToUpdateRecord(record, recordFields)) {
            table.updateRecordAsync(record, recordFields);
        }
        // The updated values will now show in your app (eg in
        // `table.selectRecords()` result) but are still being saved to Airtable
        // servers (e.g. other users may not be able to see them yet).
    }

    updateRecord(records[0], {
        'Name': '1',
        'Notes': 'Test',
    });

    updateRecord(records[1], {
        'Name': '2',
        'Notes': 'Test2',
    });

    return <div>Hello world 🚀</div>;
}

initializeBlock(() => <HelloWorldApp />);
