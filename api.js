async function getData() {
    const url = "https://rpc.mainnet.near.org";
    const response = await fetch(url, {
        method: 'POST',
        headers: {
            "Content-Type": "application/json"
        },
        body: {
            "jsonrpc": "2.0",
            "id": "dontcare",
            "method": "validators"
        }
    });
    console.log(response);
}

getData();