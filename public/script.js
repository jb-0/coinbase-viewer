init();

async function init() {
  const accounts = await getAccounts();
  const accountsContainer = document.getElementById('accounts-container');

  displayAccounts(accounts, accountsContainer);
}

/**
 * Fetch the coinbase accounts via the server route
 */
async function getAccounts() {
  const req = await fetch('/api/accounts');
  const data = await req.json();

  return data;
}

/**
 * Display the accounts as elements in the DOM
 * @param {Array} accounts array of account objects
 * @param {Element} accountsContainer the target element for individual accounts to added to
 */
function displayAccounts(accounts, accountsContainer) {
  console.log(accountsContainer);

  accounts.forEach((account) => {
    // Create a div for the account
    const individualAccountContainer = createElement(
      'DIV',
      null,
      ['account-container']
    );
    individualAccountContainer.classList.add('account-container');
    accountsContainer.appendChild(individualAccountContainer);

    // Add the currency code as a header
    const currencyHeader = createElement('H1', account.currency);
    individualAccountContainer.appendChild(currencyHeader);

    // Add the balance
    const balance = createElement('H2', `Balance: ${parseFloat(account.balance).toFixed(5)}`);
    individualAccountContainer.appendChild(balance);
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
