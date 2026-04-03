import { useState } from 'react'
import { FaStar } from 'react-icons/fa'

type StarRatingProps = {
  value?: number
  onChange?: (rating: number) => void
  readOnly?: boolean
  size?: number
}

const StarRating = ({ value, onChange, readOnly = false, size = 20 }: StarRatingProps) => {
  const [internalRating, setInternalRating] = useState(0)
  const [hover, setHover] = useState(0)

  const activeRating = value ?? internalRating

  const handleSelect = (rating: number) => {
    if (readOnly) {
      return
    }

    if (value === undefined) {
      setInternalRating(rating)
    }

    onChange?.(rating)
  }

  return (
    <div aria-label={`Rating: ${activeRating || 0} out of 5 stars`}>
      {[...Array(5)].map((_, index) => {
        const starNumber = index + 1

        return (
          <FaStar
            key={starNumber}
            color={starNumber <= (hover || activeRating) ? '#ffc107' : '#e4e5e9'}
            onClick={() => handleSelect(starNumber)}
            onMouseEnter={() => !readOnly && setHover(starNumber)}
            onMouseLeave={() => !readOnly && setHover(0)}
            style={{
              cursor: readOnly ? 'default' : 'pointer',
              fontSize: size,
              marginRight: 4,
            }}
          />
        )
      })}
    </div>
  )
}

export default StarRating
