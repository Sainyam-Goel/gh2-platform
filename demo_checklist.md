# Demo Checklist (15-20 min)
** Setup ** 
- python 3.11+; `pip install -r backend/requirements.txt`
- Run FastAPI: `uvicorn backend.app:app --reload`
- Keep a terminal ready for `edge/simulator.py`

** Live steps **
1) Show the diagram (README)
2) Run the simulator for a single hour-equivalent burst:
   `code
  python edge/simulator.py --site IN-HRY-SON-PLANT-001 --batches 1
  `code
3) 'Verify & batch': Backend logs show batch computed
4) 'Attest': VS JSON preview; show VC (hash)
2) 'Anchor': display mock tx-id/anchor ID (can swap with web3)
3) 'Issue': Registry mints credits; balance updates
6) 'Retire': Generate retirement certificate

* *Back-tocket Q & A**
- *Why blockchain?* - Immutability + prevent super-double-count
- *Anti-greenwashing* - Signed sensors, rules, revocation
- *Public vs permissioned* - we can start on testnet and move to consortium later
