exports.checkPriceAndYear = ({ price, publishedYear }) => {
  if (price !== undefined && (isNaN(Number(price)) || Number(price) <= 0)) {
    return 'Price must be greater than zero';
  }
  if (publishedYear !== undefined) {
    const year = Number(publishedYear);
    const currentYear = new Date().getFullYear();
    if (isNaN(year) || year < 1450 || year > currentYear) {
      return `Published year must be between 1450 and ${currentYear}`;
    }
  }
  return null;
};
