export const countryLevel = 3;

export const defaultPeriods = Array.from({ length: 11 }, (_, index) => {
    const year = String(new Date().getFullYear() - index);
    return { text: year, value: year };
});
