init();

async function init() {
  const accounts = await getAccounts();
  const accountsContainer = document.getElementById('accounts-container');

  displayAccounts(accounts, accountsContainer);
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
  let combinedAccountsValue = 0;

  const promises = accounts.map(async (account) => {
    return getBidAsk(`${account.currency}-GBP`)
    .then((data) => {
      // Create a div for the account
    const individualAccountContainer = createElement('DIV', null, [
      'account-container',
    ]);
    individualAccountContainer.classList.add('account-container');
    accountsContainer.appendChild(individualAccountContainer);

    // Add the currency code as a header
    const currencyHeader = createElement('H2', account.currency);
    individualAccountContainer.appendChild(currencyHeader);

    // Add the balance
    const balance = createElement(
      'p',
      `Balance: ${parseFloat(account.balance).toFixed(5)}`
    );
    individualAccountContainer.appendChild(balance);

    // Add the converted balance
    const balanceConverted = data.asks ? account.balance * data.asks[0][0] : false

    if (balanceConverted) {
      const balanceConvertedEl = createElement('p', `£ ${parseFloat(balanceConverted).toFixed(2)}`);
      individualAccountContainer.appendChild(balanceConvertedEl);

      combinedAccountsValue += balanceConverted;
    }
    })
  });

  Promise.all(promises).then(() => {
    const combinedAccountsValueEl = createElement('H1', `Portfolio Value: £ ${parseFloat(combinedAccountsValue).toFixed(2)}`)
    combinedAccountsValueEl.classList.add('total-account-value');
    accountsContainer.insertBefore(combinedAccountsValueEl, accountsContainer.firstChild);
    accountsContainer.style.opacity = 1;
    accountsContainer.style.transform = "scale(1)";
  });
  
}

/**
 * Create a DOM element with supplied values
 * @param {String} element string defining the type of element you wish to create (e.g. H1, DIV)
 * @param {String} innerText string defining the innerText value for the element
 * @return {Element} Returns a DOM element
 */
function createElement(element, innerText) {
  // Create the element with given type
  const el = document.createElement(element);

  // Set the text value for the element
  el.innerText = innerText || '';

  return el;
}

/******************************************************************************************
 * EXPRESS SERVER API CALLS
 ******************************************************************************************/
/**
 * Fetch the coinbase accounts via the server route
 */
async function getAccounts() {
  const req = await fetch('/api/accounts');
  const data = await req.json();

  return data;
}

/**
 * Get product bid ask via the server route
 */
async function getBidAsk(product) {
  const req = await fetch(`/api/products/bidask/${product}`);
  const data = await req.json();

  return data;
}
