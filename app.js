const MANIFEST_URL =
  "https://khalili1920.github.io/mexo-wallet/tonconnect-manifest.json";

const PROOF_PAYLOAD_URL = "";
const PROOF_VERIFY_URL = "";

const ui = new TON_CONNECT_UI.TonConnectUI({
  manifestUrl: MANIFEST_URL,
  buttonRootId: "ton-connect",
  restoreConnection: true
});

const statusEl = document.getElementById("status");
const walletBox = document.getElementById("wallet-box");
const walletAddressEl = document.getElementById("wallet-address");
const proofStatusEl = document.getElementById("proof-status");
const useWalletButton = document.getElementById("use-wallet");

let connectedWallet = null;

function setStatus(text) {
  if (statusEl) {
    statusEl.textContent = text;
  }
}

function shortAddress(address) {
  if (!address) return "";

  return address.length > 18
    ? address.slice(0, 9) + "..." + address.slice(-8)
    : address;
}

async function prepareProof() {
  ui.setConnectRequestParameters(null);
}

async function verifyProof(wallet) {
  proofStatusEl.textContent =
    "Wallet connected successfully.";

  setStatus("Wallet connected.");

  useWalletButton.classList.remove("hidden");
}

ui.onStatusChange(async (wallet) => {

  connectedWallet = wallet;

  if (!wallet) {

    walletBox.classList.add("hidden");

    useWalletButton.classList.add("hidden");

    setStatus(
      "Connect your TON Wallet to continue."
    );

    await prepareProof();

    return;
  }

  walletBox.classList.remove("hidden");

  const address =
    wallet.account?.address || "";

  walletAddressEl.textContent =
    shortAddress(address);

  setStatus("Wallet connected.");

  await verifyProof(wallet);
});


/* =========================================
   USE THIS WALLET
========================================= */

useWalletButton.addEventListener("click", () => {

  const address =
    connectedWallet?.account?.address;

  if (!address) {

    setStatus(
      "Wallet address is not available."
    );

    return;
  }


  const telegram =
    window.Telegram?.WebApp;


  if (!telegram) {

    setStatus(
      "Telegram WebApp is not available."
    );

    return;
  }


  /*
   * Send Wallet Address to Telegram.
   */

  const data = JSON.stringify({

    type: "mexo_wallet_connected",

    wallet_address: address

  });


  try {

    telegram.sendData(data);

    setStatus(
      "Wallet sent to MEXO Airdrop."
    );

  } catch (error) {

    console.error(
      "sendData error:",
      error
    );

    setStatus(
      "Could not send wallet data."
    );

  }


  /*
   * Close the WebApp and return
   * to the Telegram bot.
   */

  setTimeout(() => {

    try {

      telegram.close();

    } catch (error) {

      console.error(
        "Telegram close error:",
        error
      );

    }

  }, 300);

});


prepareProof();
