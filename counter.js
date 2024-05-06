export function setupCounter(element) {
  let counter = 0;
  const setCounter = (count) => {
    counter = count;
    element.innerHTML = `open camera`;
  };
  element.addEventListener("click", () => setCounter(counter + 1));
  setCounter(0);
}
