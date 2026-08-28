import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import wallet from "../../devnet-wallet.json";
import {
  createSignerFromKeypair,
  generateSigner,
  publicKey,
  signerIdentity,
} from "@metaplex-foundation/umi";
import { create, fetchAsset, mplCore, update } from "@metaplex-foundation/mpl-core";
import { base58 } from "@metaplex-foundation/umi/serializers";
import { irysUploader } from "@metaplex-foundation/umi-uploader-irys";

const umi = createUmi(
  process.env.SOLANA_RPC_URL ?? "https://api.devnet.solana.com",
);

const keypair = umi.eddsa.createKeypairFromSecretKey(new Uint8Array(wallet));
const signer = createSignerFromKeypair(umi, keypair);

umi.use(
  irysUploader({
    address: "https://devnet.irys.xyz/",
  }),
);

umi.use(signerIdentity(signer));

umi.use(mplCore());

(async () => {
  try {

    const assetAddress = publicKey("99A6qA9ukVkfTMXgkJcS6ou3tqLJbMgRyosJBnLn5MMd");

    const asset = await fetchAsset(umi, assetAddress);

    const image = "https://gateway.irys.xyz/BoRpXdY6rMGrhkKssZX4Mad2BuRDuorjo6Jd9mu8crQ3";

    const newMetadata = {
      name: "Generug 2",
      description: "Generug Turbin3 NFT 2",
      category: "image",
      image,
    }

    const myUri = await umi.uploader.uploadJson(newMetadata);

    console.log(`new metadata uri: ${myUri} `);

    const tx = await update(umi, {
      asset,
      name: "Updated Generug Name",
      uri: myUri,
    }).sendAndConfirm(umi);

    const signature = base58.deserialize(tx.signature)[0];

    console.log(`Successfully updated NFT!`);
    console.log(`signature ${signature} , asset : ${asset.publicKey}`);
  } catch (e) {
    console.log(`Error updating NFT: ${e}`);
  }
})();