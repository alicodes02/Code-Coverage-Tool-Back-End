export function multiply(x: number, y: number): number {
  return x * y;
}

// Function to divide two numbers
export function divide(x: number, y: number): number {
  if (y === 0) {
    throw new Error("Cannot divide by zero");
  }
  return x / y;
}