init()

async function init() {
  const accounts = await getAccounts()
  const accountsContainer = document.getElementById('accounts-container')

  displayAccounts(accounts, accountsContainer)
}

/******************************************************************************************
 * DISPLAY / RENDERING
 ******************************************************************************************/
/**
 * Display the accounts as elements in the DOM
 * @param {Array} accounts array of account objects
 * @param {Element} accountsContainer the target element for individual accounts to added to
 */
async function displayAccounts(accounts, accountsContainer) {
  let combinedAccountsValue = 0
  let combinedProfitAndLoss = 0

  const purchasedRates = await getPurchasedRates()

  // Per linter warning we want to avoid using await in a loop, instead we get the bid ask as a
  // promise, when resolved we populate the container for the given account
  const promises = accounts.map(async (account) => {
    return getBidAsk(`${account.currency}-GBP`).then((data) => {
      // Create a div for the account
      const individualAccountContainer = createElement('DIV', null, [
        'account-container',
      ])
      individualAccountContainer.classList.add('account-container')
      accountsContainer.appendChild(individualAccountContainer)

      // Add the currency code as a header
      const currencyHeader = createElement('H2', account.currency)
      individualAccountContainer.appendChild(currencyHeader)

      // Add the balance
      const balance = createElement(
        'p',
        `Balance: ${parseFloat(account.balance).toFixed(3)}`
      )
      individualAccountContainer.appendChild(balance)

      // Add the converted balance to GBP
      const balanceConverted = data.bids
        ? account.balance * data.bids[0][0]
        : false
      const profitAndLoss =
        balanceConverted - purchasedRates[account.currency] * account.balance

      if (balanceConverted) {
        // Created an element for the converted balance
        const balanceConvertedEl = createElement(
          'p',
          `£ ${parseFloat(balanceConverted).toFixed(2)} (${parseFloat(
            profitAndLoss
          ).toFixed(2)})`
        )
        individualAccountContainer.appendChild(balanceConvertedEl)

        // Add the converted balance amount to the total for the portfolio
        combinedAccountsValue += balanceConverted
        combinedProfitAndLoss += profitAndLoss

        // Display the bid ask values
        const bidAskEl = createElement('DIV')
        individualAccountContainer.appendChild(bidAskEl)
        bidAskEl.classList.add('bid-ask-container')

        const bidEl = createElement('DIV', data.bids[0][0])
        bidAskEl.appendChild(bidEl)
        bidEl.classList.add('bid-container')

        const askEl = createElement('DIV', data.asks[0][0])
        bidAskEl.appendChild(askEl)
        askEl.classList.add('ask-container')
      }
    })
  })

  // On resolution of all promises we render a total value for the portfolio and also apply some
  // styling to make the loading transition smooth
  Promise.all(promises).then(() => {
    const portfolioValue = parseFloat(combinedAccountsValue).toFixed(2)
    const pnl =
      parseFloat(combinedProfitAndLoss).toFixed(2) > 0
        ? `+${parseFloat(combinedProfitAndLoss).toFixed(2)}`
        : parseFloat(combinedProfitAndLoss).toFixed(2)

    const combinedAccountsValueEl = createElement(
      'H1',
      `£ ${portfolioValue} \n (${pnl})`
    )
    combinedAccountsValueEl.classList.add('total-account-value')

    accountsContainer.insertBefore(
      combinedAccountsValueEl,
      accountsContainer.firstChild
    )
    accountsContainer.style.opacity = 1
    accountsContainer.style.transform = 'scale(1)'
  })
}

/**
 * Create a DOM element with supplied values
 * @param {String} element string defining the type of element you wish to create (e.g. H1, DIV)
 * @param {String} innerText string defining the innerText value for the element
 * @return {Element} Returns a DOM element
 */
function createElement(element, innerText) {
  // Create the element with given type
  const el = document.createElement(element)

  // Set the text value for the element
  el.innerText = innerText || ''

  return el
}

/******************************************************************************************
 * EXPRESS SERVER API CALLS
 ******************************************************************************************/
/**
 * Fetch the coinbase accounts via the server route
 */
async function getAccounts() {
  const req = await fetch('/api/accounts')
  const data = await req.json()

  return data
}

/**
 * Get product bid ask via the server route
 */
async function getBidAsk(product) {
  const req = await fetch(`/api/products/bidask/${product}`)
  const data = await req.json()

  return data
}

/**
 * Get rates the user paid for each currency via the server route
 */
async function getPurchasedRates() {
  const req = await fetch('/api/user/purchased/rates')
  const data = await req.json()

  return data
}
