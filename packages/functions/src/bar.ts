export const main = async (event) => {
  console.log({ event });
  return {
    statusCode: 200,
    body: JSON.stringify(event),
  };
};
