const MANIFEST_URL="https://khalili1920.github.io/mexo-wallet/tonconnect-manifest.json";

const PROOF_PAYLOAD_URL="";
const PROOF_VERIFY_URL="";

const ui=new TON_CONNECT_UI.TonConnectUI({
  manifestUrl:MANIFEST_URL,
  buttonRootId:"ton-connect",
  restoreConnection:true
});

const statusEl=document.getElementById("status");
const walletBox=document.getElementById("wallet-box");
const walletAddressEl=document.getElementById("wallet-address");
const proofStatusEl=document.getElementById("proof-status");
const useWalletButton=document.getElementById("use-wallet");

let connectedWallet=null;

function setStatus(t){
  statusEl.textContent=t;
}

function shortAddress(a){
  return a&&a.length>18
    ? a.slice(0,9)+"..."+a.slice(-8)
    : a||"";
}

async function prepareProof(){
  if(!PROOF_PAYLOAD_URL){
    ui.setConnectRequestParameters(null);
    return;
  }

  try{
    ui.setConnectRequestParameters({state:"loading"});

    const r=await fetch(PROOF_PAYLOAD_URL,{
      method:"POST",
      headers:{"content-type":"application/json"},
      credentials:"include"
    });

    if(!r.ok)throw new Error("payload");

    const payload=await r.text();

    ui.setConnectRequestParameters({
      state:"ready",
      value:{tonProof:payload}
    });

  }catch(e){
    ui.setConnectRequestParameters(null);
    setStatus("Wallet verification service is temporarily unavailable.");
    console.error(e);
  }
}

async function verifyProof(wallet){

  const item=wallet?.connectItems?.tonProof;

  if(!item||!("proof" in item)){
    proofStatusEl.textContent="TON proof was not returned by this wallet.";
    setStatus("Wallet ownership could not be verified.");

    /*
     * IMPORTANT:
     * Proof is not required for our current MEXO flow.
     * Therefore the wallet can still be selected.
     */
    useWalletButton.classList.remove("hidden");

    return;
  }

  if(!PROOF_VERIFY_URL){
    proofStatusEl.textContent="Wallet connected successfully.";
    setStatus("Wallet connected.");

    useWalletButton.classList.remove("hidden");

    return;
  }

  try{

    proofStatusEl.textContent="Verifying wallet ownership...";

    const r=await fetch(PROOF_VERIFY_URL,{
      method:"POST",
      headers:{"content-type":"application/json"},
      credentials:"include",
      body:JSON.stringify({
        account:wallet.account,
        proof:item.proof
      })
    });

    const result=await r.json();

    if(!r.ok||!result.verified){
      throw new Error(result.error||"verification failed");
    }

    proofStatusEl.textContent="✓ Wallet ownership verified.";
    setStatus("Wallet verified successfully.");

    useWalletButton.classList.remove("hidden");

  }catch(e){

    proofStatusEl.textContent="Wallet verification failed.";
    setStatus("Please disconnect and connect the wallet again.");

    useWalletButton.classList.add("hidden");

    console.error(e);
  }
}

ui.onStatusChange(async wallet=>{

  connectedWallet=wallet;

  if(!wallet){

    walletBox.classList.add("hidden");
    useWalletButton.classList.add("hidden");

    setStatus("Connect your TON Wallet to continue.");

    await prepareProof();

    return;
  }

  walletBox.classList.remove("hidden");

  walletAddressEl.textContent=
    shortAddress(wallet.account?.address||"");

  setStatus("Wallet connected.");

  await verifyProof(wallet);

});

useWalletButton.addEventListener("click",async()=>{

  const address=connectedWallet?.account?.address;

  if(!address){
    setStatus("Wallet address is not available.");
    return;
  }

  setStatus("Returning to MEXO Airdrop...");

  /*
   * Send the wallet address to the Telegram bot.
   */
  const botUrl=
    "https://t.me/mexoairdrop_bot?start=wallet_"+encodeURIComponent(address);

  window.location.href=botUrl;

});

prepareProof();
