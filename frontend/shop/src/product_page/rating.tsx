import { useState } from "react";
import { FaStar } from "react-icons/fa";

const StarRating = () => {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);

  return (
    <div>
      {[...Array(5)].map((_, index) => {
        const starNumber = index + 1;

        return (
          <FaStar
            key={starNumber}
            color={starNumber <= (hover || rating) ? "#ffc107" : "#e4e5e9"}
            onClick={() => setRating(starNumber)}
            onMouseEnter={() => setHover(starNumber)}
            onMouseLeave={() => setHover(rating)}
            style={{ cursor: "pointer" }}
          />
        );
      })}
    </div>
  );
};

export default StarRating;