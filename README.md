# MEXO Wallet

Standalone MEXO TON Wallet Mini App.

The frontend uses TON Connect. Production `ton_proof` requires a backend to create a short-lived single-use payload and verify the returned proof. The current frontend deliberately does not fake that verification.

After deployment:
1. Add `icon-180.png` (PNG, 180x180).
2. Enable GitHub Pages.
3. Deploy the proof backend.
4. Put its `/payload` and `/verify` URLs into `app.js`.
5. Connect the verified wallet to the MEXO withdrawal request/session.
