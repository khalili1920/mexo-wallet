const MANIFEST_URL = "https://khalili1920.github.io/mexo-wallet/tonconnect-manifest.json";

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
  statusEl.textContent = text;
}

function shortAddress(address) {
  return address && address.length > 18
    ? address.slice(0, 9) + "..." + address.slice(-8)
    : address || "";
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
      throw new Error("payload");
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

  const proofItem = wallet?.connectItems?.tonProof;

  /*
   * TON Proof is NOT required for the current MEXO flow.
   * If the wallet does not return a proof, we still allow
   * the user to use the connected wallet.
   */

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

  walletAddressEl.textContent =
    shortAddress(
      wallet.account?.address || ""
    );

  setStatus("Wallet connected.");

  await verifyProof(wallet);
});


/*
 * USE THIS WALLET
 *
 * After the wallet is connected:
 * MEXO Wallet → Telegram Bot
 */

useWalletButton.addEventListener("click", async () => {

  const address =
    connectedWallet?.account?.address;

  if (!address) {

    setStatus(
      "Wallet address is not available."
    );

    return;
  }

  setStatus(
    "Returning to MEXO Airdrop..."
  );

  const botUrl =
    "https://t.me/mexoairdrop_bot?start=wallet_" +
    encodeURIComponent(address);


  /*
   * When MEXO Wallet is opened inside Telegram,
   * use Telegram WebApp's official link handler.
   */

  if (
    window.Telegram &&
    window.Telegram.WebApp &&
    typeof window.Telegram.WebApp.openTelegramLink === "function"
  ) {

    window.Telegram.WebApp.openTelegramLink(
      botUrl
    );

    return;
  }


  /*
   * Fallback for normal browser.
   */

  window.location.href = botUrl;

});


prepareProof();
