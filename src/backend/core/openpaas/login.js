import fetch from 'node-fetch';

export default async function login(serverBase, username, password) {
  const queryOptions = {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ username, password })
  }
  const checkStatus = res => {
    if (res.ok) {
      // res.status >= 200 && res.status < 300
      return res;
    } else {
      throw new Error(res.statusText);
    }
  };

  const response = await fetch(`${serverBase}/api/login`, queryOptions);
  const data = checkStatus(response);
  const response = await data.json();

  return { response, res.headers };
}
