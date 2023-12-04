// Function to check if a string is a palindrome
export function isPalindrome(str: string): boolean {
  const cleanStr = str.toLowerCase().replace(/[^a-zA-Z0-9]/g, '');
  const reversedStr = cleanStr.split('').reverse().join('');
  return cleanStr === reversedStr;
}

// Function to generate a random number within a specified range
export function getRandomNumber(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Function to generate an array of n random numbers within a range
export function generateRandomNumbers(n: number, min: number, max: number): number[] {
  return Array.from({ length: n }, () => getRandomNumber(min, max));
}

// Function to convert temperature from Celsius to Fahrenheit
export function celsiusToFahrenheit(celsius: number): number {
  return (celsius * 9) / 5 + 32;
}

// Function to convert temperature from Fahrenheit to Celsius
export function fahrenheitToCelsius(fahrenheit: number): number {
  return ((fahrenheit - 32) * 5) / 9;
}

// Function to capitalize the first letter of a string
export function capitalizeFirstLetter(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

// Function to filter out duplicate values from an array
export function removeDuplicates<T>(arr: T[]): T[] {
  return Array.from(new Set(arr));
}

// Function to shuffle an array
export function shuffleArray<T>(arr: T[]): T[] {
  const shuffledArray = [...arr];
  for (let i = shuffledArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffledArray[i], shuffledArray[j]] = [shuffledArray[j], shuffledArray[i]];
  }
  return shuffledArray;
}
