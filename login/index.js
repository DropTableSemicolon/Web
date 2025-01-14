function checkSessionCookie() {
    const cookies = document.cookie.split(';');

    const sessionCookie = cookies.find(cookie => cookie.trim().startsWith('session='));

    const sessionCookieValue = sessionCookie.split('=')[1];
    if (sessionCookieValue) {
      window.location.href = 'https://helia.gg/social/';
    }
  }

      window.onload = checkSessionCookie;

      document.getElementById('loginForm').addEventListener('submit', async function (event) {
          event.preventDefault();
          const formData = new FormData(this);
          let data = Object.fromEntries(formData.entries());
          
          const responseMessage = document.getElementById('responseMessage');
          responseMessage.style.display = 'none';

          try {
              const response = await fetch('https://social.helia.gg/api/v1/auth/login', {
                  method: 'POST',
                  headers: {
                      'Content-Type': 'application/json',
                  },
                  body: JSON.stringify(data),
              });

              const result = await response.json();

              if (result.success) {
                  responseMessage.textContent = result.message;
                  responseMessage.className = 'alert alert-success';
                  responseMessage.style.display = 'block';

                  setTimeout(() => {
                      window.location.href = 'https://helia.gg/social/';
                  }, 1000);
              } else {
                  responseMessage.textContent = 'Error: ' + result.error;
                  responseMessage.className = 'alert alert-error';
                  responseMessage.style.display = 'block';
              }
          } catch (error) {
              responseMessage.textContent = 'Failed to submit the form: ' + error.message;
              responseMessage.className = 'alert alert-error';
              responseMessage.style.display = 'block';
          }
      });