const MANIFEST_URL =
  "https://khalili1920.github.io/mexo-wallet/tonconnect-manifest.json";

const PROOF_PAYLOAD_URL = "";
const PROOF_VERIFY_URL = "";


/* =========================================
   TELEGRAM WEB APP
========================================= */

const telegram =
  window.Telegram?.WebApp || null;

if (telegram) {

  try {
    telegram.ready();
    telegram.expand();
  } catch (error) {
    console.error(
      "Telegram WebApp initialization error:",
      error
    );
  }

}


/* =========================================
   TON CONNECT
========================================= */

const ui =
  new TON_CONNECT_UI.TonConnectUI({
    manifestUrl: MANIFEST_URL,
    buttonRootId: "ton-connect",
    restoreConnection: true
  });


/* =========================================
   ELEMENTS
========================================= */

const statusEl =
  document.getElementById("status");

const walletBox =
  document.getElementById("wallet-box");

const walletAddressEl =
  document.getElementById("wallet-address");

const proofStatusEl =
  document.getElementById("proof-status");

const useWalletButton =
  document.getElementById("use-wallet");


let connectedWallet = null;


/* =========================================
   HELPERS
========================================= */

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
    ? address.slice(0, 9) +
      "..." +
      address.slice(-8)
    : address;

}


/* =========================================
   PROOF
========================================= */

async function prepareProof() {

  if (!PROOF_PAYLOAD_URL) {

    ui.setConnectRequestParameters(null);

    return;

  }

}


async function verifyProof(wallet) {

  if (!proofStatusEl) {
    return;
  }

  proofStatusEl.textContent =
    "Wallet connected successfully.";

  setStatus(
    "Wallet connected."
  );

  if (useWalletButton) {

    useWalletButton.classList.remove(
      "hidden"
    );

  }

}


/* =========================================
   WALLET STATUS
========================================= */

ui.onStatusChange(
  async (wallet) => {

    connectedWallet = wallet;


    if (!wallet) {

      walletBox.classList.add(
        "hidden"
      );

      useWalletButton.classList.add(
        "hidden"
      );

      setStatus(
        "Connect your TON Wallet to continue."
      );

      await prepareProof();

      return;

    }


    walletBox.classList.remove(
      "hidden"
    );


    const address =
      wallet.account?.address || "";


    walletAddressEl.textContent =
      shortAddress(address);


    setStatus(
      "Wallet connected."
    );


    await verifyProof(wallet);

  }
);


/* =========================================
   USE THIS WALLET
========================================= */

useWalletButton.addEventListener(
  "click",
  () => {

    const address =
      connectedWallet?.account?.address;


    if (!address) {

      setStatus(
        "Wallet address is not available."
      );

      return;

    }


    /* =======================================
       SAVE WALLET IN TELEGRAM CLOUD STORAGE
    ======================================= */

    try {

      if (
        telegram &&
        telegram.CloudStorage
      ) {

        telegram.CloudStorage.setItem(
          "mexo_wallet_address",
          address,
          function(error) {

            if (error) {

              console.error(
                "CloudStorage error:",
                error
              );

              setStatus(
                "Could not save wallet."
              );

              return;

            }


            setStatus(
              "Returning to MEXO Airdrop..."
            );


            /* ===============================
               RETURN TO TELEGRAM BOT
            =============================== */

            setTimeout(
              () => {

                try {

                  telegram.close();

                } catch (error) {

                  console.error(
                    "Telegram close error:",
                    error
                  );

                }

              },
              300
            );

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


    setStatus(
      "Telegram WebApp is not available."
    );

  }
);


/* =========================================
   START
========================================= */

prepareProof();
