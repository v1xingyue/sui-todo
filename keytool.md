# sui keytool 操作

## 展示key 基本信息

显示 address publickey (base64)

```shell
$ sui keytool list 
                Sui Address                 |              Public Key (Base64)              | Scheme
----------------------------------------------------------------------------------------------------
0xadebd7820da439261f46e8c864df4dda6d4578ee1e1cda1b286ae0ea526a6468 | ALHxRlO8t0yVMJ6ebMqrSCdueIifQJaf0vrQTX3tkF6i  | ed25519
0xbd64ef6e7d0bfdebc3b1027d81cb833f1a3f020bf8153a25810dcde47ee7ee32 | ABFiR1RNp1tBpTylzY/bt9wr72reb2kElgm97uu/yadP  | ed25519
```

## 解压keystore 中的keypair

其中 $keypair 来自 sui.keystore
会把 keypair 输出到 $address.key 其中包含 base64 的 keypair 

```shell
$ sui keytool unpack AEsG0SwX/DEnAM84JZr/L5GzHoDQz10dxoEiUU3lx4f1 # 来自 sui.keystore
Address, keypair and key scheme written to 0xadebd7820da439261f46e8c864df4dda6d4578ee1e1cda1b286ae0ea526a6468.key
```

## 加载转化出可用的 keypair seed (base64)

```shell
Account Keypair: AEsG0SwX/DEnAM84JZr/L5GzHoDQz10dxoEiUU3lx4f1
Network Keypair: SwbRLBf8MScAzzglmv8vkbMegNDPXR3GgSJRTeXHh/U=   ## 这个是 base64 的 seed 可以用来初始化 keypair 
Worker Keypair: SwbRLBf8MScAzzglmv8vkbMegNDPXR3GgSJRTeXHh/U=
```

## 使用seed 获取 keypair ，以 javascript 代码为例

```javascript
import { JsonRpcProvider, Network, RawSigner, Ed25519Keypair } from '@mysten/sui.js';
let a = Buffer.from("SwbRLBf8MScAzzglmv8vkbMegNDPXR3GgSJRTeXHh/U=", 'base64')
const keypair = Ed25519Keypair.fromSeed(a);
console.log(keypair);
```

## 通过助记词导入

```shell

$ sui keytool import "change practice sell trip taste width buyer february shy grow upset interest" ed25519

2023-05-11T15:19:06.691814Z  INFO sui::keytool: Key imported for address [0x5d56ac37a1944e0ef01f03ed4a21cd09e990c8f99ecd9e158fea53b7d506a7f1]
```