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


/* ================================
   BASIC FUNCTIONS
================================ */

function setStatus(text) {
  if (statusEl) {
    statusEl.textContent = text;
  }
}

function shortAddress(address) {
  if (!address) {
    return "";
  }

  if (address.length > 18) {
    return address.slice(0, 9) + "..." + address.slice(-8);
  }

  return address;
}


/* ================================
   TON PROOF
================================ */

async function prepareProof() {

  /*
   * Proof is intentionally disabled.
   * MEXO does not currently require
   * wallet ownership verification.
   */

  if (!PROOF_PAYLOAD_URL) {

    ui.setConnectRequestParameters(null);

    return;
  }

  try {

    ui.setConnectRequestParameters({
      state: "loading"
    });

    const response = await fetch(PROOF_PAYLOAD_URL, {
      method: "POST",
      headers: {
        "content-type": "application/json"
      },
      credentials: "include"
    });

    if (!response.ok) {
      throw new Error("payload request failed");
    }

    const payload = await response.text();

    ui.setConnectRequestParameters({
      state: "ready",
      value: {
        tonProof: payload
      }
    });

  } catch (error) {

    ui.setConnectRequestParameters(null);

    setStatus(
      "Wallet verification service is temporarily unavailable."
    );

    console.error(error);
  }
}


/* ================================
   VERIFY / DISPLAY WALLET
================================ */

async function verifyProof(wallet) {

  /*
   * TON Proof is not required.
   */

  if (!proofStatusEl) {
    return;
  }

  const proofItem = wallet?.connectItems?.tonProof;

  if (!proofItem || !("proof" in proofItem)) {

    proofStatusEl.textContent =
      "Wallet connected successfully.";

    setStatus("Wallet connected.");

    useWalletButton.classList.remove("hidden");

    return;
  }


  if (!PROOF_VERIFY_URL) {

    proofStatusEl.textContent =
      "Wallet connected successfully.";

    setStatus("Wallet connected.");

    useWalletButton.classList.remove("hidden");

    return;
  }


  try {

    proofStatusEl.textContent =
      "Verifying wallet ownership...";

    const response = await fetch(PROOF_VERIFY_URL, {
      method: "POST",
      headers: {
        "content-type": "application/json"
      },
      credentials: "include",
      body: JSON.stringify({
        account: wallet.account,
        proof: proofItem.proof
      })
    });

    const result = await response.json();

    if (!response.ok || !result.verified) {
      throw new Error(
        result.error || "verification failed"
      );
    }

    proofStatusEl.textContent =
      "✓ Wallet ownership verified.";

    setStatus(
      "Wallet verified successfully."
    );

    useWalletButton.classList.remove("hidden");

  } catch (error) {

    proofStatusEl.textContent =
      "Wallet verification failed.";

    setStatus(
      "Please disconnect and connect the wallet again."
    );

    useWalletButton.classList.add("hidden");

    console.error(error);
  }
}


/* ================================
   WALLET STATUS
================================ */

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


/* ================================
   USE THIS WALLET
================================ */

useWalletButton.addEventListener("click", () => {

  const address =
    connectedWallet?.account?.address;


  if (!address) {

    setStatus(
      "Wallet address is not available."
    );

    return;
  }


  /*
   * TEST ONLY:
   * Check whether Telegram WebApp API
   * is actually available.
   */

  const telegramAvailable =
    !!(
      window.Telegram &&
      window.Telegram.WebApp
    );


  if (telegramAvailable) {

    setStatus(
      "Telegram WebApp: AVAILABLE"
    );

  } else {

    setStatus(
      "Telegram WebApp: NOT AVAILABLE"
    );

  }


  console.log(
    "MEXO Wallet Address:",
    address
  );

  console.log(
    "Telegram WebApp Available:",
    telegramAvailable
  );

});


/* ================================
   START
================================ */

prepareProof();
