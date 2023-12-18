export function add(a: number, b: number): number {
  return a + b;
}

// String Reversal Function
export function reverseString(input: string): string {
  return input.split('').reverse().join('');
}

// Array Filtering Function
export function filterEvenNumbers(numbers: number[]): number[] {
  return numbers.filter(num => num % 2 === 0);
}

// Async Function with Promises
export function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export async function delayedGreeting(name: string): Promise<string> {
  await delay(1000);
  return `Hello, ${name}!`;
}