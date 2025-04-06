function Comment({ comment }) {
    return (
      <div className="comment">
        <div className="comment-header">
          <img 
            src={comment.user.avatar || "https://via.placeholder.com/30"} 
            alt={comment.user.name} 
            className="comment-avatar" 
          />
          <span className="comment-author">{comment.user.name}</span>
        </div>
        <p className="comment-text">{comment.text}</p>
        <span className="comment-time">
          {new Date(comment.createdAt).toLocaleString()}
        </span>
      </div>
    );
  }
  
  export default Comment;