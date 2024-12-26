const CardLoader = ({ length = 6 }) => {
  return (
    <>
      {Array.from({ length: length }).map((_, index) => (
        <div
          key={index}
          className="w-full min-w-16 h-28 rounded-md bg-gray-200"
        />
      ))}
    </>
  );
};

export default CardLoader;
