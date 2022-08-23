export const getException = (fn) => {
  try {
    fn();
  } catch (err) {
    return err;
  }
  throw new Error("Expected exception");
};
