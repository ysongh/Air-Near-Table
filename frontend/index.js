import { initializeBlock, useBase, useRecords, useLoadable, useWatchable, useRecordById } from '@airtable/blocks/ui';
import { Box, ChoiceToken, Button, Loader } from '@airtable/blocks/ui';
import {cursor} from '@airtable/blocks';
import React, { useEffect, useState } from 'react';

function AirNearTable() {
    // YOUR CODE GOES HERE
    const [validators, setValidators] = useState([]);
    const [selectedRecordId, setSelectedRecordId] = useState(null);
    const [selectedFieldId, setSelectedFieldId] = useState(null);
    const [isShow, setIsShow] = useState(false);
    const [loading, setLoading] = useState(false);

    const base = useBase();
    let table = base.getTableByNameIfExists('Explorer1');

    if(!table){
        createTable();
        table = base.getTableByName('Explorer1');
    }

    const records = useRecords(table.selectRecords());

    useLoadable(cursor);

    useWatchable(cursor, ['selectedRecordIds', 'selectedFieldIds'], () => {
        // If the update was triggered by a record being de-selected,
        // the current selectedRecordId will be retained.  This is
        // what enables the caching described above.
        if (cursor.selectedRecordIds.length > 0) {
            // There might be multiple selected records. We'll use the first
            // one.
            setSelectedRecordId(cursor.selectedRecordIds[0]);
        }
        if (cursor.selectedFieldIds.length > 0) {
            // There might be multiple selected fields. We'll use the first
            // one.
            setSelectedFieldId(cursor.selectedFieldIds[0]);
        }
        console.log(cursor);
    });

    const selectedRecord = useRecordById(table, selectedRecordId ? selectedRecordId : '');
    let cellValue = "";
    if(selectedRecordId){
        cellValue = selectedRecord.getCellValueAsString("Account ID");
        console.log(cellValue);
    }

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
        ]);
    }

    async function addData(){
        setIsShow(true);
        for(let i = 0; i < validators.length; i++){
            updateRecord(records[i], {
                'Account ID': validators[i].account_id,
                'Stake': validators[i].stake.split(".")[0] + " N",
                'Is Slashed': validators[i].is_slashed.toString()
            });
        }
    }

    async function updateRecord(record, recordFields) {
        await table.updateRecordAsync(record, recordFields);
        // The updated values will now show in your app (eg in
        // `table.selectRecords()` result) but are still being saved to Airtable
        // servers (e.g. other users may not be able to see them yet).
    }

    function getSelectedValidator() {
        const data = validators.filter(v => v.account_id === cellValue);
        console.log(data, "data")
        if(data.length) return <div>
            <ChoiceToken choice={{"color":"blue", "name": "Account ID"}} style={{ marginTop: "1rem"}} />
            <p style={{ marginTop: 0}}>{data[0].account_id}</p>

            <ChoiceToken choice={{"color":"blue", "name": "Stake"}} />
            <p style={{ marginTop: 0}}>{data[0].stake} N</p>

            <ChoiceToken choice={{"color":"blue", "name": "Is Slashed"}} />
            <p style={{ marginTop: 0}}>{data[0].is_slashed ? "Yes" : "No"}</p>

            <ChoiceToken choice={{"color":"blue", "name": "Expected Blocks"}} />
            <p style={{ marginTop: 0}}>{data[0].num_expected_blocks}</p>

            <ChoiceToken choice={{"color":"blue", "name": "Expected Chunks"}} />
            <p style={{ marginTop: 0}}>{data[0].num_expected_chunks}</p>

            <ChoiceToken choice={{"color":"blue", "name": "Produced Blocks"}} />
            <p style={{ marginTop: 0}}>{data[0].num_produced_blocks}</p>

            <ChoiceToken choice={{"color":"blue", "name": "Produced Chunks"}} />
            <p style={{ marginTop: 0}}>{data[0].num_produced_chunks}</p>
        </div>
    }
    
    return (
        <Box padding={2}>
            <h1 style={{ fontSize: '1.4rem'}}>Current Validators: {validators.length} </h1>
            {!isShow && <Button onClick={addData} variant="primary">
                Show
            </Button>}
            {loading && <Loader scale={1} />}
            {getSelectedValidator()}
        </Box>
    );
}

initializeBlock(() => <AirNearTable />);
