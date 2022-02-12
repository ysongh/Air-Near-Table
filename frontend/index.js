import { initializeBlock, useBase, useRecords, useLoadable, useWatchable, useRecordById } from '@airtable/blocks/ui';
import { Box, ChoiceToken, Button, Link, Loader } from '@airtable/blocks/ui';
import {FieldType} from '@airtable/blocks/models';
import {cursor} from '@airtable/blocks';
import React, { useEffect, useState } from 'react';

function AirNearTable() {
    // YOUR CODE GOES HERE
    const [validators, setValidators] = useState([]);
    const [totalStake, setTotalStake] = useState(0);
    const [selectedRecordId, setSelectedRecordId] = useState(null);
    const [selectedFieldId, setSelectedFieldId] = useState(null);
    const [isShow, setIsShow] = useState(false);
    const [loading, setLoading] = useState(false);

    const base = useBase();
    let table = base.getTableByNameIfExists('Explorer1');
    let records;

    if(!table){
        createTable();
        table = base.getTableByNameIfExists('Explorer1');
    }

    if(table){
        records = useRecords(table.selectRecords());
    }
    
    useLoadable(cursor);

    if(table){
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
    }

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
            console.log(data);
            setValidators(validators);
            setTotalStake(data.total);

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
            {name: 'Is Slashed', type: FieldType.SINGLE_SELECT, options: {
                choices: [
                    {name: 'Yes'},
                    {name: 'No'},
                ],
            }},
        ]);
    }

    async function addData(){
        setIsShow(true);
        for(let i = 0; i < validators.length; i++){
            updateRecord(records[i], {
                'Account ID': validators[i].account_id,
                'Stake': validators[i].stake.split(".")[0] + " N",
                'Is Slashed': {name: validators[i].is_slashed ? "Yes" : "No"}
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
            <br />
            <Link
                href={`https://explorer.mainnet.near.org/accounts/${data[0].account_id}`}
                target="_blank"
                style={{ marginTop: 0, marginBottom: "1rem"}}
            >
                {data[0].account_id}
            </Link>
            <br />
            
            <ChoiceToken choice={{"color":"blue", "name": "Stake"}} />
            <p style={{ marginTop: 0}}>{data[0].stake} N</p>

            <ChoiceToken choice={{"color":"blue", "name": "Expected Blocks"}} />
            <p style={{ marginTop: 0}}>{data[0].num_expected_blocks}</p>

            <ChoiceToken choice={{"color":"blue", "name": "Expected Chunks"}} />
            <p style={{ marginTop: 0}}>{data[0].num_expected_chunks}</p>

            <ChoiceToken choice={{"color":"blue", "name": "Produced Blocks"}} />
            <p style={{ marginTop: 0}}>{data[0].num_produced_blocks}</p>

            <ChoiceToken choice={{"color":"blue", "name": "Produced Chunks"}} />
            <p style={{ marginTop: 0}}>{data[0].num_produced_chunks}</p>

            <ChoiceToken choice={{"color":"blue", "name": "Is Slashed"}} />
            <p style={{ marginTop: 0}}>{data[0].is_slashed ? "Yes" : "No"}</p>
        </div>
    }
    
    return (
        <Box padding={3}>
            <Box display="flex" justifyContent="space-between"  alignItems="center">
                <h1 style={{ fontSize: '1.4rem', marginTop: '0', marginBottom: '0'}}>
                    Current Validators
                </h1>
                {!isShow && <Button onClick={addData} variant="primary">
                    Update
                </Button>}
            </Box>
            <p style={{ fontWeight: 600, marginTop: '0', marginBottom: '0'}}>
                Validators: {validators.length}
            </p>
            <p style={{ fontWeight: 600, marginTop: '0', marginBottom: '0'}}>
                Total Stake: {totalStake / 10 ** 18} Nears
            </p>
            <p style={{ marginBottom: '0'}}>Select a record to see more detail of a Validator</p>
            <center>
                {loading && <Loader scale={1} />}
            </center>
            {getSelectedValidator()}
        </Box>
    );
}

initializeBlock(() => <AirNearTable />);
