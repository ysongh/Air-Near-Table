import { initializeBlock, useBase, useRecords } from '@airtable/blocks/ui';
import React, { useEffect } from 'react';

function HelloWorldApp() {
    // YOUR CODE GOES HERE
    useEffect(() => {
        getData();
    }, [])

    const base = useBase();
    const table = base.getTableByName('Explorer');
    const records = useRecords(table.selectRecords());

    async function getData(){
        const response = await fetch("http://localhost:4000/validators");
        const data = await response.json();
        console.log(data.data);
        const validators =  data.data.current_validators;

        for(let i = 0; i < validators.length; i++){
            if(i < records.length){
                updateRecord(records[i], {
                    'Account ID': validators[i].account_id,
                    'Stake': validators[i].stake,
                });
            }
            else{
                createRecord([
                    {fields: {'Account ID': validators[i].account_id}},
                    {fields: {'Stake': validators[i].stake}}
                ]);
            }
        }
    }

    function updateRecord(record, recordFields) {
        if (table.hasPermissionToUpdateRecord(record, recordFields)) {
            table.updateRecordAsync(record, recordFields);
        }
        // The updated values will now show in your app (eg in
        // `table.selectRecords()` result) but are still being saved to Airtable
        // servers (e.g. other users may not be able to see them yet).
    }

    function createRecord(recordFields) {
        if (table.hasPermissionToCreateRecord(record, recordFields)) {
            table.createRecordsAsync([recordFields]);
        }
        // The updated values will now show in your app (eg in
        // `table.selectRecords()` result) but are still being saved to Airtable
        // servers (e.g. other users may not be able to see them yet).
    }

    return <div>
        Current Validators
        {records.length}
    </div>;
}

initializeBlock(() => <HelloWorldApp />);
