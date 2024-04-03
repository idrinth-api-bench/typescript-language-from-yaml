export default (data:  object,): string[]=> {
  const output = [];
  const loadKeys = (object: object, prefix = '',) => {
    for (const key of Object.keys(object,)) {
      if (typeof object[key] === 'string') {
        output.push(prefix + key,);
      } else {
        loadKeys(
          object[key],
          prefix + key + '.',
        );
      }
    }
  };
  loadKeys(data,);
  return output;
}
