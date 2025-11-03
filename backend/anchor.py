from typing import Tuple, Optional
import hashlib, time, os

# Optional web3 anchoring if env present
try:
    from web3 import Web3
except Exception:
    Web3 = None

RPC = os.getenv('WEB3_RPC_URL')
PRIV = os.getenv('WEB3_PRIVATE_KEY')
ANCHOR_ADDR = os.getenv('WEB3_ANCHOR_ADDRESS')  # optional: contract; else send self-tx

# Replace with web3.py / Fabric SDK for real anchoring
def anchor_to_chain(vc_hash: str) -> Tuple[str, str]:
    if RPC and PRIV and Web3 is not None:
        w3 = Web3(Web3.HTTPProvider(RPC))
        acct = w3.eth.account.from_key(PRIV)
        nonce = w3.eth.get_transaction_count(acct.address)
        tx = {
            'to': acct.address,
            'value': 0,
            'gas': 21000,
            'nonce': nonce,
            'data': bytes.fromhex(vc_hash),
            'maxFeePerGas': w3.to_wei('2', 'gwei'),
            'maxPriorityFeePerGas': w3.to_wei('1', 'gwei'),
            'chainId': w3.eth.chain_id
        }
        stx = acct.sign_transaction(tx)
        txh = w3.eth.send_raw_transaction(stx.rawTransaction).hex()
        anchor_id = 'onchain_' + txh[:16]
        return txh, anchor_id
    # fallback demo anchor
    txid = hashlib.sha1((vc_hash + str(time.time())).encode()).hexdigest()
    anchor_id = 'anchor_' + txid[:16]
    return txid, anchor_id
