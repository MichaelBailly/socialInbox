import fetch from 'node-fetch';

export default async function getJWT(serverBase, cookie) {
  const queryOptions = {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Cookie: cookie,
    },
  };
  const checkStatus = res => {
    if (res.ok) {
      // res.status >= 200 && res.status < 300
      return res;
    } else {
      throw new Error(res.statusText);
    }
  };

  const response = await fetch(`${serverBase}/api/jwt/generate`, queryOptions);
  const data = checkStatus(response);
  const jwtResponse = await data.json();

  console.log('JWT', jwtResponse);

  return jwtResponse;
}
