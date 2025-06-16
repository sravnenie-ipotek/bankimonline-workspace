export const generateNewId = (array) => {
    const maxId = Math.max(0, ...array.map((item) => item.id));
    return maxId + 1;
};
