import { add, subtract } from '../code';

      test('add', () => {
        const expectedValue = 10;
        expect(add(71, 53)).toBe(expectedValue);
      });
    

      test('subtract', () => {
        const expectedValue = 10;
        expect(subtract(75, 36)).toBe(expectedValue);
      });
    