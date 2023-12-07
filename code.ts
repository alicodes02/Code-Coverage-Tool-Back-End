// Function to calculate the Fibonacci sequence up to a specified term
export function fibonacci(n: number): number[] {
  function calculateFibonacci(sequence: number[], term: number): number[] {
    if (term <= 0) {
      return sequence;
    }

    const nextValue = sequence.length < 2 ? 1 : sequence[sequence.length - 1] + sequence[sequence.length - 2];
    sequence.push(nextValue);

    return calculateFibonacci(sequence, term - 1);
  }

  if (n <= 0) {
    return [];
  }

  return calculateFibonacci([], n);
}

// Example usage of the function
export function exampleUsage() {
  const term = 10;
  const fibonacciSequence = fibonacci(term);

  console.log(`Fibonacci Sequence (up to ${term} terms):`, fibonacciSequence);
}

// Call the example usage function
exampleUsage();
