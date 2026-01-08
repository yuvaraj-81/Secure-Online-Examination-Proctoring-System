import "./Skeleton.css";

const Skeleton = ({
  height = 20,
  width = "100%",
  radius = 8,
  style = {},
}) => {
  return (
    <div
      className="skeleton"
      style={{
        height,
        width,
        borderRadius: radius,
        ...style,
      }}
    />
  );
};

export default Skeleton;
