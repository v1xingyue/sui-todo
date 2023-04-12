# some sui commands are useful

* sui client new-address ed25519
* sui client gas
* sui client addresses

* some

```shell
curl --location --request POST 'https://faucet.devnet.sui.io/gas' \
--header 'Content-Type: application/json' \
--data-raw '{
    "FixedAmountRequest": {
        "recipient": "0xf7593dd931f2be8bbfe1e8fabe677310cda3ad3e58b8c2178e2247a2c481851a"
    }
}'
```

<https://faucet.testnet.sui.io/gas>
