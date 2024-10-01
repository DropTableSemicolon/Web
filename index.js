var devMode = false;

function logout() {
    document.cookie = 'session=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    window.location.href = 'https://social.helia.gg/login/';
}

const API_URL = 'https://social.helia.gg/api/v1/feed/posts';
const DEV_API_URL = 'https://social.helia.gg/api/dev/feed/posts';
const CREATE_POST_URL = 'https://social.helia.gg/api/v1/feed/post';

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

async function loadPosts() {
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
        displayPosts(posts.posts);
    } catch (error) {

        if (error.status === 401 && !devMode) {
            document.cookie = 'session=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
            window.location.href = 'https://social.helia.gg/login/';
        }

        console.error('Error loading posts:', error);
    }
}

function displayPosts(posts) {
    const feed = document.getElementById('feed');
    feed.innerHTML = '';

    posts.forEach(post => {
        const postCard = document.createElement('div');
        postCard.classList.add('post-card');

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
          <span>Likes: ${post.like_count}</span>
          <span>${new Date(post.created_at).toLocaleString()}</span>
        </div>
      `;

        feed.appendChild(postCard);
    });
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

const startDate = new Date('2001-09-11T14:14:00+02:00');

function updateTimer() {
    const currentDate = new Date();
    const diffInSeconds = Math.floor((currentDate - startDate) / 1000);
    document.getElementById('timer').innerText = `${diffInSeconds} seconds since 9/11`;
}

window.onload = function() {
    //devMode = true;
    checkSessionCookie();
    loadPosts();
    setInterval(updateTimer, 1000);
    updateTimer();
}