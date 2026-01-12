export const getExpirationDate = () => {
  const currentDate = new Date();
  currentDate.setMonth(currentDate.getMonth() + 6);
  return currentDate;
};
