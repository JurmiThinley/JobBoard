import { useState } from 'react';
import { likePost, addComment } from '../api';
import Comment from './Comment';

function Post({ post, user, onUpdate }) {
  const [commentText, setCommentText] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);
  const [liked, setLiked] = useState(post.likedBy?.includes(user._id));

  const handleLike = async () => {
    try {
      const response = await likePost(post._id);
      setLiked(response.liked);
      
      // Update the post with new like information
      const updatedPost = {
        ...post,
        likes: response.likes,
        likedBy: liked
          ? post.likedBy.filter(id => id !== user._id)
          : [...(post.likedBy || []), user._id]
      };
      
      onUpdate(updatedPost);
    } catch (error) {
      console.error('Failed to like post:', error);
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    
    if (!commentText.trim()) return;
    
    try {
      setSubmittingComment(true);
      const newComment = await addComment(post._id, commentText);
      
      // Update the post with the new comment
      const updatedPost = {
        ...post,
        comments: [...post.comments, newComment]
      };
      
      onUpdate(updatedPost);
      setCommentText('');
    } catch (error) {
      console.error('Failed to add comment:', error);
    } finally {
      setSubmittingComment(false);
    }
  };

  return (
    <div className="post">
      <div className="post-header">
        <img 
          src={post.user.avatar || "https://via.placeholder.com/40"} 
          alt={post.user.name} 
          className="post-avatar" 
        />
        <div>
          <h3>{post.user.name}</h3>
          <span className="post-time">{new Date(post.createdAt).toLocaleString()}</span>
        </div>
      </div>
      
      <p className="post-content">{post.content}</p>
      
      {post.image && (
        <img src={post.image} alt="Post content" className="post-image" />
      )}
      
      <div className="post-actions">
        <button 
          onClick={handleLike} 
          className={liked ? 'liked' : ''}
        >
          {liked ? 'Liked' : 'Like'} ({post.likes || 0})
        </button>
        <button>
          Comments ({post.comments?.length || 0})
        </button>
      </div>
      
      <div className="post-comments">
        {post.comments && post.comments.map((comment) => (
          <Comment key={comment._id} comment={comment} />
        ))}
        
        <form onSubmit={handleAddComment}>
          <input
            type="text"
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            placeholder="Write a comment..."
          />
          <button type="submit" disabled={submittingComment}>
            {submittingComment ? 'Posting...' : 'Post'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default Post;Comment, setSubmitting