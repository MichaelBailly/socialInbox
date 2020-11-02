import fetch from 'node-fetch';

export async function fetchAccount(sessionUrl, token) {
  try {
    const response = await fetch(sessionUrl, {
      method: 'GET',
      headers: {
        Accept: 'application/json;jmapVersion=rfc-8621',
        Authorization: `Bearer ${token}`,
      },
    });
    const session = await response.json();
    const email = session.username;
    const account = Object.keys(session.accounts).filter(
      (a) => session.accounts[a].name === email
    ).shift();
    return account;
  } catch (e) {
    console.log('ERROR', e);
  }
}
