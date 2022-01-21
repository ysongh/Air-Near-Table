import { initializeBlock, useBase, useRecords } from '@airtable/blocks/ui';
import React, { useEffect, useState } from 'react';

function HelloWorldApp() {
    // YOUR CODE GOES HERE
    const [validators, setValidators] = useState([]);

    useEffect(() => {
        getData();
    }, [])

    const base = useBase();
    const table = base.getTableByName('Explorer');
    const records = useRecords(table.selectRecords());

    async function getData(){
        const response = await fetch("http://localhost:4000/current-validators");
        const data = await response.json();
        const validators = data.data;
        console.log(validators);
        setValidators(validators);

        for(let i = 0; i < validators.length; i++){
            if(i >= records.length){
                await table.createRecordAsync();
            }
        }
    }

    async function addData(){
        for(let i = 0; i < validators.length; i++){
            updateRecord(records[i], {
                'Account ID': validators[i].account_id,
                'Stake': validators[i].stake.split(".")[0] + " N",
                'Is Slashed': validators[i].is_slashed.toString(),
                'Expected Blocks': validators[i].num_expected_blocks,
                'Expected Chunks': validators[i].num_expected_chunks,
                'Produced Blocks': validators[i].num_produced_blocks,
                'Produced Chunks': validators[i].num_produced_chunks
            });
        }
    }

    async function updateRecord(record, recordFields) {
        await table.updateRecordAsync(record, recordFields);
        // The updated values will now show in your app (eg in
        // `table.selectRecords()` result) but are still being saved to Airtable
        // servers (e.g. other users may not be able to see them yet).
    }

    return <div>
        Current Validators
        {records.length}
        <button onClick={addData}>Show</button>
    </div>;
}

initializeBlock(() => <HelloWorldApp />);
