function parseSignature(signature) {
  var r = signature.substring(0, 64);
  var s = signature.substring(64, 128);
  var v = signature.substring(128, 130);

  return {
      r: "0x" + r,
      s: "0x" + s,
      v: parseInt(v, 16)
  }
}

window.onload = function (e) {

  if (typeof window.ethereum !== 'undefined') {
    // Use MetaMask provider
    window.web3 = new Web3(window.ethereum);
    
    // Request account access if needed
    window.ethereum.enable().then(function(accounts) {
        // Accounts now exposed
    }).catch(function(error) {
        // User denied account access
        console.error('User denied account access');
    });
    } else {
        // Handle the case where MetaMask is not installed
        console.error('MetaMask is not installed. Please install MetaMask to use this feature.');
    }

  // force the user to unlock their MetaMask
  if (window.web3.eth.accounts[0] == null) {
    alert("Please unlock MetaMask first");
    window.web3.currentProvider.enable().catch(alert);
  }

  var signBtn = document.getElementById("signBtn");
  signBtn.onclick = function(e) {
    if (window.web3.eth.accounts[0] == null) {
      return;
    }

    const domain = [
      { name: "name", type: "string" },
      { name: "version", type: "string" },
      { name: "chainId", type: "uint256" },
      { name: "verifyingContract", type: "address" },
      { name: "salt", type: "bytes32" }
    ];

    const multiSigTx = [
      { name: "destination", type: "address" },
      { name: "value", type: "uint256" },
      { name: "data", type: "bytes" },
      { name: "nonce", type: "uint256" },
      { name: "executor", type: "address" },
      { name: "gasLimit", type: "uint256" }
    ];

    const domainData = {
      name: "Simple MultiSig",
      version: "1",
      chainId: parseInt(window.web3.version.network, 10),
      verifyingContract: document.getElementById("walletAddress").value,
      salt: "0x251543af6a222378665a76fe38dbceae4871a070b7fdaf5c6c30cf758dc33cc0"
    };

    var message = {
      destination: document.getElementById("destination").value,
      value: document.getElementById("value").value,
      data: document.getElementById("data").value,
      nonce: parseInt(document.getElementById("nonce").value, 10),
      executor: document.getElementById("executor").value,
      gasLimit: parseInt(document.getElementById("gasLimit").value, 10),
    };
    
    const data = JSON.stringify({
      types: {
        EIP712Domain: domain,
        MultiSigTransaction: multiSigTx
      },
      domain: domainData,
      primaryType: "MultiSigTransaction",
      message: message
    });

    console.log(data)
    
    const signer = window.web3.eth.accounts[0];

    console.log(signer)
    window.web3.currentProvider.sendAsync(
      {
        method: "eth_signTypedData_v3",
        params: [signer, data],
        from: signer
      }, 
      function(err, result) {
        if (err || result.error) {
          return console.error(result);
        }

        const signature = parseSignature(result.result.substring(2));
        document.getElementById("signedData").value = "r: " + signature.r + "\ns: " + signature.s + "\nv: " + signature.v
      }
    );
  };
}
