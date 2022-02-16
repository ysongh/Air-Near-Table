import React from 'react';
import { ChoiceToken, Link } from '@airtable/blocks/ui';

function ValidatorDetail({ data }) {
  return (
    <div>
        <ChoiceToken choice={{"color":"blue", "name": "Account ID"}} style={{ marginTop: "1rem"}} />
        <br />
        <Link
            href={`https://explorer.mainnet.near.org/accounts/${data[0].account_id}`}
            target="_blank"
            style={{ marginTop: 0, marginBottom: "1rem"}}
            icon="search"
        >
            {data[0].account_id}
        </Link>
        <br />
        
        <ChoiceToken choice={{"color":"blue", "name": "Stake"}} />
        <p style={{ marginTop: 0}}>{data[0].stake} N</p>

        <div style={{ display: 'flex', justifyContent: 'space-between'}}>
            <div>
                <ChoiceToken choice={{"color":"blue", "name": "Expected Blocks"}} />
                <p style={{ marginTop: 0}}>{data[0].num_expected_blocks}</p>

                <ChoiceToken choice={{"color":"blue", "name": "Expected Chunks"}} />
                <p style={{ marginTop: 0}}>{data[0].num_expected_chunks}</p>
            </div>
            
            <div>
                <ChoiceToken choice={{"color":"blue", "name": "Produced Blocks"}} />
                <p style={{ marginTop: 0}}>{data[0].num_produced_blocks}</p>

                <ChoiceToken choice={{"color":"blue", "name": "Produced Chunks"}} />
                <p style={{ marginTop: 0}}>{data[0].num_produced_chunks}</p>
            </div>
        </div>

        <ChoiceToken choice={{"color":"blue", "name": "Is Slashed"}} />
        <p style={{ marginTop: 0}}>{data[0].is_slashed ? "Yes" : "No"}</p>
    </div>
  )
}

export default ValidatorDetail;