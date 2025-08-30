import React from 'react';

const ParentAddReview = () => {
  // TODO: Implement add review form and API call
  return (
    <div className="parent-add-review">
      <h2>Add Review</h2>
      <form>
        <input type="number" placeholder="Rating (1-5)" min="1" max="5" />
        <textarea placeholder="Comment (optional)" />
        <button type="submit">Submit Review</button>
      </form>
    </div>
  );
};

export default ParentAddReview; 