function checkSessionCookie() {
    const cookies = document.cookie.split(';');

    const sessionCookie = cookies.find(cookie => cookie.trim().startsWith('session='));

    const sessionCookieValue = sessionCookie.split('=')[1];
    if (sessionCookieValue) {
      window.location.href = 'https://social.helia.gg/';
    }
  }

      window.onload = checkSessionCookie;

      document.getElementById('registerForm').addEventListener('submit', async function (event) {
          event.preventDefault(); // Prevent the default form submission
          const formData = new FormData(this);
          let data = Object.fromEntries(formData.entries());

          // Get the date and format it to ISO 8601 with time and timezone
          let birthday = data.birthday;
          let formattedDate = new Date(birthday).toISOString(); // Format: 2006-01-02T15:04:05Z
          data.birthday = formattedDate;

          const responseMessage = document.getElementById('responseMessage');
          responseMessage.style.display = 'none'; // Hide message box initially

          try {
              const response = await fetch('https://social.helia.gg/api/v1/auth/register', {
                  method: 'POST',
                  headers: {
                      'Content-Type': 'application/json',
                  },
                  body: JSON.stringify(data),
              });

              const result = await response.json();

              if (result.success) {
                  // Display success message
                  responseMessage.textContent = 'Registration successful!';
                  responseMessage.className = 'alert alert-success';
                  responseMessage.style.display = 'block';

                  setTimeout(() => {
                      window.location.href = 'https://social.helia.gg/login/';
                  }, 1000);
              } else {
                  // Display error message
                  responseMessage.textContent = 'Error: ' + result.error;
                  responseMessage.className = 'alert alert-error';
                  responseMessage.style.display = 'block';
              }
          } catch (error) {
              // Handle network errors
              responseMessage.textContent = 'Failed to submit the form: ' + error.message;
              responseMessage.className = 'alert alert-error';
              responseMessage.style.display = 'block';
          }
      });