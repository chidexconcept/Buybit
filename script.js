let userWallet = null;
let prices = { bitcoin: 0, ethereum: 0, solana: 0 };

// 1. Fetch Prices & Populate Exchange Data
async function fetchCryptoPrices() {
    const tableBody = document.getElementById('crypto-data');
    try {
        const response = await fetch('https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=bitcoin,ethereum,solana,cardano,binancecoin&order=market_cap_desc');
        const data = await response.json();

        tableBody.innerHTML = '';

        data.forEach(coin => {
            // Cache prices for the trading calculation
            if (prices.hasOwnProperty(coin.id)) {
                prices[coin.id] = coin.current_price;
            }

            const priceChangeClass = coin.price_change_percentage_24h >= 0 ? 'positive' : 'negative';
            const priceChangeSign = coin.price_change_percentage_24h >= 0 ? '+' : '';

            const row = `
                <tr>
                    <td><strong>${coin.name}</strong> (${coin.symbol.toUpperCase()})</td>
                    <td>$${coin.current_price.toLocaleString()}</td>
                    <td class="${priceChangeClass}">${priceChangeSign}${coin.price_change_percentage_24h.toFixed(2)}%</td>
                </tr>
            `;
            tableBody.innerHTML += row;
        });
        calculateReceive();
    } catch (error) {
        console.error('Error fetching crypto data:', error);
    }
}

// 2. Connect Web3 Wallet
async function connectWallet() {
    if (window.ethereum) {
        try {
            const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
            userWallet = accounts[0];
            
            const shortAccount = `${userWallet.substring(0, 6)}...${userWallet.substring(userWallet.length - 4)}`;
            document.getElementById('wallet-btn').innerText = shortAccount;
            
            // Update trade button text
            const tradeBtn = document.getElementById('trade-btn');
            tradeBtn.innerText = 'Execute Swap';
            tradeBtn.classList.add('ready');
            
            alert(`Wallet Connected: ${userWallet}`);
        } catch (error) {
            console.error('Connection rejected', error);
        }
    } else {
        alert('Web3 wallet not found. Please install MetaMask to trade on BuyBit.');
    }
}

// 3. Trade Calculator
function calculateReceive() {
    const payAmount = parseFloat(document.getElementById('pay-amount').value) || 0;
    const selectedAsset = document.getElementById('asset-select').value;
    const assetPrice = prices[selectedAsset];

    if (assetPrice > 0 && payAmount > 0) {
        const estimatedAmount = (payAmount / assetPrice).toFixed(6);
        document.getElementById('receive-amount').value = estimatedAmount;
    } else {
        document.getElementById('receive-amount').value = '0.00';
    }
}

// 4. Execute Trade Logic
function executeTrade() {
    if (!userWallet) {
        // Force wallet connection before trading
        connectWallet();
        return;
    }

    const payAmount = document.getElementById('pay-amount').value;
    const selectedAsset = document.getElementById('asset-select').value.toUpperCase();

    if (!payAmount || payAmount <= 0) {
        alert('Please enter a valid amount to trade.');
        return;
    }

    // Trigger a simulated Web3 transaction request
    alert(`Initiating transaction for ${payAmount} USD worth of ${selectedAsset} via connected wallet: ${userWallet}`);
}

// Initialize on page load
fetchCryptoPrices();
setInterval(fetchCryptoPrices, 30000);

