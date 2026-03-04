// Quick test to show the expected BigQuery parameter format
const params = [
  { name: 'selected_hotel_value', type: 'STRING', value: 'Foundation Hotel' },
  { name: 'selected_year', type: 'INT64', value: '2025' },
  { name: 'selected_month', type: 'INT64', value: '6' }
];

const paramsObject = params.reduce((acc, param) => {
  acc[param.name] = param.value;
  return acc;
}, {});

console.log('Expected params object:', JSON.stringify(paramsObject, null, 2));
