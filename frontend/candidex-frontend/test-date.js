// Test date conversion
const date = new Date('2025-10-16');
console.log('Input date:', date);
console.log('toISOString():', date.toISOString());
console.log('Split result:', date.toISOString().split('T')[0]);

// Better approach
const year = date.getFullYear();
const month = String(date.getMonth() + 1).padStart(2, '0');
const day = String(date.getDate()).padStart(2, '0');
console.log('Correct format:', `${year}-${month}-${day}`);
