# some sui commands are useful

* sui client new-address ed25519
* sui client gas
* sui client addresses
* sui client envs`
* sui client new-env --alias testnet --rpc <https://fullnode.testnet.sui.io:443/>
* sui_config sui client active-env

```shell
curl --location --request POST 'https://faucet.devnet.sui.io/gas' \
--header 'Content-Type: application/json' \
--data-raw '{
    "FixedAmountRequest": {
        "recipient": "0xf7593dd931f2be8bbfe1e8fabe677310cda3ad3e58b8c2178e2247a2c481851a"
    }
}'


curl --location --request POST 'https://faucet.testnet.sui.io/gas' \
--header 'Content-Type: application/json' \
--data-raw '{
    "FixedAmountRequest": {
        "recipient": "0xf7593dd931f2be8bbfe1e8fabe677310cda3ad3e58b8c2178e2247a2c481851a"
    }
}'
```

<https://faucet.testnet.sui.io/gas>
