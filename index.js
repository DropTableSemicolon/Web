var devMode = false;

function logout() {
    document.cookie = 'session=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    window.location.href = 'https://social.helia.gg/login/';
}

const API_URL = 'https://social.helia.gg/api/v1/feed/posts';
const DEV_API_URL = 'https://social.helia.gg/api/dev/feed/posts';
const CREATE_POST_URL = 'https://social.helia.gg/api/v1/feed/post';
const LIKE_URL = 'https://social.helia.gg/api/v1/feed/like'
const UNLIKE_URL = 'https://social.helia.gg/api/v1/feed/unlike'

function checkSessionCookie() {

  if (devMode) {
    return;
  }

  const cookies = document.cookie.split(';');

  const sessionCookie = cookies.find(cookie => cookie.trim().startsWith('session='));
  if (!sessionCookie) {
    window.location.href = 'https://social.helia.gg/login/';
  }

  let sessionCookieValue = sessionCookie.split('=')[1];
  sessionCookieValue = sessionCookieValue.split('; expires')[0];
  if (!sessionCookieValue) {
    window.location.href = 'https://social.helia.gg/login/';
  }
}

async function loadPosts(dontDelete) {
    try {

      let response;

      if (devMode) {

        response = await fetch(DEV_API_URL, {
          method: 'GET'
        });

      } else {

        response = await fetch(API_URL, {
          method: 'GET'
        });

      }

        if (!response.ok) {
            throw response;
        }

        const posts = await response.json();
        displayPosts(posts.posts, dontDelete);
    } catch (error) {

        if (error.status === 401 && !devMode) {
            document.cookie = 'session=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
            window.location.href = 'https://social.helia.gg/login/';
        }

        console.error('Error loading posts:', error);
    }
}

function displayPosts(posts, dontDelete) {
    const feed = document.getElementById('feed');
    if (!dontDelete) {
        feed.innerHTML = '';
    }

    posts.forEach(post => {
        const postCard = document.createElement('div');
        postCard.classList.add('post-card');
        
        const heartIcon = post.liked_by_user ? 'fas' : 'far';
        const likeCount = post.like_count || 0;

        postCard.innerHTML = `
        <div class="post-header">
            <img src="${post.profile_picture}" alt="${post.username}" />
            <div>
                <strong>${post.display_name}</strong> <br/>
                @${post.username}
            </div>
        </div>
        <div class="post-content">${post.content}</div>
        <div class="post-footer">
            <div class="like-button" data-tipus="${post.liked_by_user ? 'unlike' : 'like'}" data-uuid="${post.uuid}">
                <i class="${heartIcon} fa-heart"></i>
                <span class="like-count">${likeCount}</span>
            </div>
            <span data-time="${post.created_at}">${getRelativeTime(post.created_at)}</span>
        </div>`;

        const likeButton = postCard.querySelector('.like-button');
        likeButton.addEventListener('click', async function(e) {
            const button = e.currentTarget;
            const tipus = button.getAttribute('data-tipus');
            const uuid = button.getAttribute('data-uuid');
            
            const heartIcon = button.querySelector('i');
            const likeCount = button.querySelector('.like-count');
            
            // Add animation class
            heartIcon.classList.add('heart-pulse');
            
            // Call the like function
            await Likefuggveny(tipus, uuid);
            
            // Update UI
            if (tipus === 'like') {
                heartIcon.classList.remove('far');
                heartIcon.classList.add('fas');
                button.setAttribute('data-tipus', 'unlike');
                likeCount.textContent = parseInt(likeCount.textContent) + 1;
            } else {
                heartIcon.classList.remove('fas');
                heartIcon.classList.add('far');
                button.setAttribute('data-tipus', 'like');
                likeCount.textContent = parseInt(likeCount.textContent) - 1;
            }
            
            // Remove animation class after animation completes
            setTimeout(() => {
                heartIcon.classList.remove('heart-pulse');
            }, 300);
        });

        feed.appendChild(postCard);
    });
}

async function Likefuggveny(tipus, uuid) {
    try {
        const response = await fetch(`https://api.socialo.hu/api/posts/${uuid}/${tipus}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${getCookie('session_token')}`
            }
        });

        if (!response.ok) {
            console.error('Like error:', await response.text());
            return false;
        }

        return true;
    } catch (error) {
        console.error('Like error:', error);
        return false;
    }
}

async function createPost() {
    const content = document.getElementById('post-content').value;

    if (!content) {
        alert('Please enter some content');
        return;
    }

    if (devMode) {
        alert('Cannot create post in dev mode');
        return;
    }

    try {
        const response = await fetch(CREATE_POST_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                content
            })
        });

        if (response.ok) {
            alert('Post created successfully');
            loadPosts();
        } else {
            const errorData = await response.json();
            alert('Error creating post: ' + errorData.message);
        }
    } catch (error) {
        console.error('Error creating post:', error);
    }
}

function getRelativeTime(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);

    if (diffInSeconds < 60) {
        return 'just now';
    }

    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) {
        return `${diffInMinutes}m ago`;
    }

    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) {
        return `${diffInHours}h ago`;
    }

    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) {
        return `${diffInDays}d ago`;
    }

    const diffInWeeks = Math.floor(diffInDays / 7);
    if (diffInWeeks < 4) {
        return `${diffInWeeks}w ago`;
    }

    const diffInMonths = Math.floor(diffInDays / 30);
    if (diffInMonths < 12) {
        return `${diffInMonths}mo ago`;
    }

    return `${Math.floor(diffInMonths / 12)}y ago`;
}

window.onload = function() {
    checkSessionCookie();
    loadPosts(true);
    
    // Update relative times every minute
    setInterval(() => {
        document.querySelectorAll('.post-footer span').forEach(timeSpan => {
            const postTime = timeSpan.getAttribute('data-time');
            if (postTime) {
                timeSpan.textContent = getRelativeTime(postTime);
            }
        });
    }, 60000);
}