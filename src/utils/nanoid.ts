const alphabet = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';

export const nanoid = (size = 12): string => {
  let id = '';
  const cryptoObj = typeof crypto !== 'undefined' ? crypto : undefined;
  for (let i = 0; i < size; i += 1) {
    const random = cryptoObj
      ? cryptoObj.getRandomValues(new Uint32Array(1))[0] % alphabet.length
      : Math.floor(Math.random() * alphabet.length);
    id += alphabet[random];
  }
  return id;
};
