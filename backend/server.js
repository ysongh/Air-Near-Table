const nearAPI = require("near-api-js");
const express = require('express');
const cors = require('cors');
const app = express();

const { providers, utils } = nearAPI;
app.use(cors());

// network config
const provider = new providers.JsonRpcProvider(
  "https://rpc.mainnet.near.org"
);	
  
app.get('/', (req, res) => res.send('Server Work'));

app.get('/current-validators', async (req, res) =>  {
  const result = await provider.validators(null);
  let total = 0;

  result.current_validators.forEach(validator => {
    total += +validator.stake;
    validator.stake = utils.format.formatNearAmount(validator.stake);
  });

  return res.status(200).json({
    data: result.current_validators,
    total: total,
    all: result
  });
});

const port = process.env.PORT || 4000;

app.listen(port, () => console.log(`Server running on port ${port}`)); 