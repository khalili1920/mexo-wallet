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
  if (!address) {
    return "";
  }

  return address.length > 18
    ? address.slice(0, 9) + "..." + address.slice(-8)
    : address;
}

async function prepareProof() {
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

async function verifyProof(wallet) {

  /*
   * TON Proof is intentionally not required
   * for the current MEXO withdrawal flow.
   */

  if (!proofStatusEl) {
    return;
  }

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


  /*
   * Save the selected wallet temporarily
   * inside the Telegram WebApp.
   */

  try {

    if (
      window.Telegram &&
      window.Telegram.WebApp
    ) {

      window.Telegram.WebApp.CloudStorage.setItem(
        "mexo_wallet_address",
        address,
        function(error) {

          if (error) {

            console.log(
              "CloudStorage error:",
              error
            );

          }

          setStatus(
            "Returning to MEXO Airdrop..."
          );

          setTimeout(() => {

            window.Telegram.WebApp.close();

          }, 300);

        }
      );

      return;
    }

  } catch (error) {

    console.error(
      "Telegram WebApp error:",
      error
    );

  }


  /*
   * Fallback
   */

  setStatus(
    "Returning to MEXO Airdrop..."
  );

});


prepareProof();
