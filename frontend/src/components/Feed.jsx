import { useState, useEffect, useRef } from 'react';
import { getPosts, createPost } from '../api';
import Post from './Post';

function Feed({ user }) {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [newPostContent, setNewPostContent] = useState('');
  const [newPostImage, setNewPostImage] = useState('');
  const [creatingPost, setCreatingPost] = useState(false);
  const observer = useRef(null);
  const lastPostRef = useRef(null);

  // Load initial posts
  useEffect(() => {
    loadPosts();
  }, []);

  // Set up infinite scroll observer
  useEffect(() => {
    if (loading) return;
    
    const options = {
      root: null,
      rootMargin: '20px',
      threshold: 1.0
    };
    
    observer.current = new IntersectionObserver(handleObserver, options);
    
    if (lastPostRef.current) {
      observer.current.observe(lastPostRef.current);
    }
    
    return () => {
      if (observer.current) {
        observer.current.disconnect();
      }
    };
  }, [loading, posts]);

  // Handle intersection for infinite scroll
  const handleObserver = (entries) => {
    const target = entries[0];
    if (target.isIntersecting && hasMore && !loading) {
      setPage((prevPage) => prevPage + 1);
    }
  };

  // Load more posts when page changes
  useEffect(() => {
    if (page > 1) {
      loadMorePosts();
    }
  }, [page]);

  const loadPosts = async () => {
    try {
      setLoading(true);
      const data = await getPosts(1);
      setPosts(data);
      setHasMore(data.length === 10); // Assuming 10 posts per page
    } catch (error) {
      console.error('Failed to load posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadMorePosts = async () => {
    if (loading || !hasMore) return;
    
    try {
      setLoading(true);
      const data = await getPosts(page);
      
      if (data.length === 0) {
        setHasMore(false);
      } else {
        setPosts((prevPosts) => [...prevPosts, ...data]);
        setHasMore(data.length === 10);
      }
    } catch (error) {
      console.error('Failed to load more posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePost = async (e) => {
    e.preventDefault();
    
    if (!newPostContent.trim()) return;
    
    try {
      setCreatingPost(true);
      const post = await createPost(newPostContent, newPostImage || null);
      setPosts((prevPosts) => [post, ...prevPosts]);
      setNewPostContent('');
      setNewPostImage('');
    } catch (error) {
      console.error('Failed to create post:', error);
    } finally {
      setCreatingPost(false);
    }
  };

  const handlePostUpdate = (updatedPost) => {
    setPosts((prevPosts) =>
      prevPosts.map((post) =>
        post._id === updatedPost._id ? updatedPost : post
      )
    );
  };

  return (
    <div className="feed">
      <div className="create-post">
        <h2>Create Post</h2>
        <form onSubmit={handleCreatePost}>
          <textarea
            placeholder="What's on your mind?"
            value={newPostContent}
            onChange={(e) => setNewPostContent(e.target.value)}
            required
          />
          <div className="create-post-actions">
            <input
              type="text"
              placeholder="Image URL (optional)"
              value={newPostImage}
              onChange={(e) => setNewPostImage(e.target.value)}
            />
            <button type="submit" disabled={creatingPost || !newPostContent.trim()}>
              {creatingPost ? 'Posting...' : 'Post'}
            </button>
          </div>
        </form>
      </div>

      {posts.map((post, index) => {
        if (posts.length === index + 1) {
          return (
            <div ref={lastPostRef} key={post._id}>
              <Post post={post} user={user} onUpdate={handlePostUpdate} />
            </div>
          );
        } else {
          return (
            <Post key={post._id} post={post} user={user} onUpdate={handlePostUpdate} />
          );
        }
      })}

      {loading && <div className="loading">Loading more posts...</div>}
      {!hasMore && posts.length > 0 && (
        <div className="loading">No more posts to load</div>
      )}
      {!loading && posts.length === 0 && (
        <div className="no-posts">No posts yet. Create the first one!</div>
      )}
    </div>
  );
}

export default Feed;