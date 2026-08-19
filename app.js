const MANIFEST_URL = "https://khalili1920.github.io/mexo-wallet/tonconnect-manifest.json";

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

function getReturnToBotUrl(walletAddress) {
  const encodedWallet = encodeURIComponent(walletAddress);

  return `https://t.me/mexoairdrop_bot?start=wallet_${encodedWallet}`;
}

function showWallet(wallet) {
  connectedWallet = wallet;

  if (!wallet) {
    walletBox.classList.add("hidden");
    useWalletButton.classList.add("hidden");

    if (proofStatusEl) {
      proofStatusEl.textContent = "";
    }

    setStatus("Connect your TON Wallet to continue.");
    return;
  }

  const address = wallet.account?.address || "";

  walletBox.classList.remove("hidden");

  walletAddressEl.textContent = shortAddress(address);

  setStatus("Wallet connected.");

  if (proofStatusEl) {
    proofStatusEl.textContent =
      "Wallet connected successfully.";
  }

  useWalletButton.classList.remove("hidden");
}

ui.onStatusChange((wallet) => {
  showWallet(wallet);
});

useWalletButton.addEventListener("click", () => {
  const address = connectedWallet?.account?.address;

  if (!address) {
    setStatus("Please connect your TON Wallet first.");
    return;
  }

  setStatus("Returning to MEXO Airdrop...");

  const botUrl = getReturnToBotUrl(address);

  setTimeout(() => {
    window.location.href = botUrl;
  }, 300);
});
