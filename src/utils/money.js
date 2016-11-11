import defaultMoneyFormat from '../defaults/money-format';

const placeholderRegex = /\{\{\s*(\w+)\s*\}\}/;
const thousandsRegex = /(\d)(?=(\d\d\d)+(?!\d))/g;

function formatWithDelimiters(number, precision = 2, thousands = ',', decimal = '.') {
  if (isNaN(number) || number == null) {
    return 0;
  }

  const fixedNumber = (number / 100.0).toFixed(precision);
  const parts = fixedNumber.split('.');
  const dollars = parts[0].replace(thousandsRegex, `$1${thousands}`);
  const cents = parts[1] ? (decimal + parts[1]) : '';

  return dollars + cents;
}

export default function formatMoney(amount, format) {
  let cents = amount * 100;

  if (typeof cents === 'string') {
    cents = cents.replace('.', '');
  }

  let value = '';
  let formatString = format || defaultMoneyFormat;
  let placeholderMatch = formatString.match(placeholderRegex);

  if (!placeholderMatch) {
    formatString = defaultMoneyFormat;
    placeholderMatch = formatString.match(placeholderRegex);
  }

  switch (placeholderMatch[1]) {
  case 'amount':
    value = formatWithDelimiters(cents);
    break;
  case 'amount_no_decimals':
    value = formatWithDelimiters(cents, 0);
    break;
  case 'amount_with_comma_separator':
    value = formatWithDelimiters(cents, 2, '.', ',');
    break;
  case 'amount_no_decimals_with_comma_separator':
    value = formatWithDelimiters(cents, 0, '.', ',');
    break;
  case 'amount_no_decimals_with_space_separator':
    value = formatWithDelimiters(cents, 0, ' ');
    break;
  default:
    value = formatWithDelimiters(cents);
  }

  return formatString.replace(placeholderRegex, value);
}
