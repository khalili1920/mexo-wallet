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

    statusEl.textContent =
      text;

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

  try {

    ui.setConnectRequestParameters(null);

  } catch (error) {

    console.error(
      "Proof preparation error:",
      error
    );

  }

}


async function verifyProof(wallet) {

  if (proofStatusEl) {

    proofStatusEl.textContent =
      "Wallet connected successfully.";

  }

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

    connectedWallet =
      wallet;


    if (!wallet) {

      if (walletBox) {

        walletBox.classList.add(
          "hidden"
        );

      }

      if (useWalletButton) {

        useWalletButton.classList.add(
          "hidden"
        );

      }

      setStatus(
        "Connect your TON Wallet to continue."
      );

      await prepareProof();

      return;

    }


    if (walletBox) {

      walletBox.classList.remove(
        "hidden"
      );

    }


    const address =
      wallet.account?.address || "";


    if (walletAddressEl) {

      walletAddressEl.textContent =
        shortAddress(address);

    }


    setStatus(
      "Wallet connected."
    );


    await verifyProof(
      wallet
    );

  }
);


/* =========================================
   USE THIS WALLET
========================================= */

if (useWalletButton) {

  useWalletButton.addEventListener(
    "click",
    function () {

      console.log(
        "MEXO: USE THIS WALLET clicked"
      );


      const address =
        connectedWallet?.account?.address;


      if (!address) {

        setStatus(
          "Wallet address is not available."
        );

        return;

      }


      console.log(
        "MEXO WALLET ADDRESS:",
        address
      );


      /* =====================================
         CREATE START PARAMETER
      ===================================== */

      const startParameter =
        "wallet_" + address;


      /* =====================================
         TELEGRAM BOT
      ===================================== */

      const botUsername =
        "mexoairdrop_bot";


      const telegramUrl =
        "https://t.me/" +
        botUsername +
        "?start=" +
        encodeURIComponent(
          startParameter
        );


      console.log(
        "MEXO RETURN URL:",
        telegramUrl
      );


      setStatus(
        "Returning to MEXO Airdrop..."
      );


      /* =====================================
         CLOSE MINI APP FIRST
      ===================================== */

      try {

        if (
          telegram &&
          typeof telegram.close ===
            "function"
        ) {

          telegram.close();

        }

      } catch (error) {

        console.error(
          "Telegram close error:",
          error
        );

      }


      /* =====================================
         OPEN BOT
      ===================================== */

      setTimeout(
        function () {

          try {

            window.location.href =
              telegramUrl;

          } catch (error) {

            console.error(
              "Telegram redirect error:",
              error
            );

          }

        },
        300
      );

    }
  );

} else {

  console.error(
    "MEXO: use-wallet button not found"
  );

}


/* =========================================
   START
========================================= */

prepareProof();
