function add(a, b) {
  return a + b;
}
console.log(add(3, 4)); // 7
function isEven(num) {
  return num % 2 === 0;
}
console.log(isEven(4)); // true
console.log(isEven(5)); // false

function multiplyArray(arr, multiplier) {
  return arr.map(num => num * multiplier);
}
let numbers = [1, 2, 3, 4];
console.log(multiplyArray(numbers, 2)); // [2,4,6,8]
