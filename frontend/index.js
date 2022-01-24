import { initializeBlock, useBase, useRecords } from '@airtable/blocks/ui';
import { Box, Button, Loader } from '@airtable/blocks/ui';
import React, { useEffect, useState } from 'react';

function AirNearTable({cursor}) {
    // YOUR CODE GOES HERE
    const [validators, setValidators] = useState([]);
    const [loading, setLoading] = useState(false);

    const base = useBase();
    let table = base.getTableByNameIfExists('Explorer1');

    if(!table){
        createTable();
        table = base.getTableByName('Explorer1');
    }

    const records = useRecords(table.selectRecords());

    useEffect(() => {
        getData();
    }, [])

    async function getData(){
        try{
            setLoading(true);
            const response = await fetch("http://localhost:4000/current-validators");
            const data = await response.json();
            const validators = data.data;
            console.log(validators);
            setValidators(validators);

            if(records.length < validators.length){
                for(let i = records.length; i < validators.length; i++){
                    await table.createRecordAsync();
                }
            }
            setLoading(false);
        } catch(error) {
            console.error(error);
            setLoading(false);
        }
        
    }

    async function createTable() {
        await base.createTableAsync("Explorer1", [
            {name: "Account ID", type: "singleLineText"},
            {name: "Stake", type: "singleLineText"},
            {name: "Is Slashed", type: "singleLineText"},
            {name: "Expected Blocks", type: "number", options: {precision: 0}},
            {name: "Expected Chunks", type: "number", options: {precision: 0}},
            {name: "Produced Blocks", type: "number", options: {precision: 0}},
            {name: "Produced Chunks", type: "number", options: {precision: 0}}
        ]);
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
    
    return (
        <Box padding={2}>
            <h1 style={{ fontSize: '1.4rem'}}>Current Validators: {validators.length} </h1>
            <Button onClick={addData} variant="primary">
                Show
            </Button>
            {loading && <Loader scale={1} />}
        </Box>
    );
}

initializeBlock(() => <AirNearTable />);
