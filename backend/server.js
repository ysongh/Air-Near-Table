const nearAPI = require("near-api-js");
const express = require('express');
const app = express();

const { providers } = nearAPI;

// network config
const provider = new providers.JsonRpcProvider(
  "https://rpc.mainnet.near.org"
);	
  
app.get('/', (req, res) => res.send('Server Work'));

app.get('/validators', async (req, res) =>  {
  const result = await provider.validators(null);
  return res.status(200).json({
    data: result,
  });
});

const port = process.env.PORT || 4000;

app.listen(port, () => console.log(`Server running on port ${port}`)); 