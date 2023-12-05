// Function to check if a number is prime
function isPrime(num: number): boolean {
  if (num <= 1) {
    return false;
  }
  for (let i = 2; i <= Math.sqrt(num); i++) {
    if (num % i === 0) {
      return false;
    }
  }
  return true;
}

// Function to generate an array of prime numbers within a range
function generatePrimesInRange(start: number, end: number): number[] {
  const primes: number[] = [];
  for (let i = start; i <= end; i++) {
    if (isPrime(i)) {
      primes.push(i);
    }
  }
  return primes;
}

// Function to calculate the Fibonacci sequence up to a specified term
function fibonacci(n: number): number[] {
  const sequence: number[] = [0, 1];
  for (let i = 2; i < n; i++) {
    sequence.push(sequence[i - 1] + sequence[i - 2]);
  }
  return sequence;
}

// Function to find the average of an array of numbers
function calculateAverage(numbers: number[]): number {
  if (numbers.length === 0) {
    return 0;
  }
  const sum = numbers.reduce((acc, num) => acc + num, 0);
  return sum / numbers.length;
}

// Generate an array of prime numbers between 10 and 50
const primesInRange = generatePrimesInRange(10, 50);
console.log('Prime Numbers between 10 and 50:', primesInRange);

// Calculate the Fibonacci sequence up to the 8th term
const fibonacciSequence = fibonacci(8);
console.log('Fibonacci Sequence (up to 8th term):', fibonacciSequence);

// Calculate the average of an array of numbers
const numbersToAverage = [15, 22, 37, 44, 56];
const average = calculateAverage(numbersToAverage);
console.log('Average of Numbers:', average);
