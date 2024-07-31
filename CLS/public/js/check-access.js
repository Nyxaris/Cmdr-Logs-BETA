// A function to get the cookie value by name
function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
    return null;
}

// A function for verifying the validity of a token
async function checkTokenValidity(token) {
    try {
        const response = await fetch('/.netlify/functions/check-token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });
        if (response.ok) {
            const result = await response.json();
            return result.valid;
        } else {
            return false;
        }
    } catch (error) {
        console.error('Error checking token validity:', error);
        return false;
    }
}

// Function for processing access
async function handleAccess() {
    const token = getCookie('access_token');
    const messageElement = document.getElementById('message');
    const loginButton = document.getElementById('auth-button');

    if (messageElement && loginButton) {
        if (token) {
            const isValid = await checkTokenValidity(token);
            if (isValid) {
                messageElement.textContent = 'Access to this site is restricted. Please contact the administrator to request permission.';
                loginButton.classList.add('hidden');
            } else {
                messageElement.textContent = 'Access to this site is restricted. Please log in to gain access.';
                loginButton.classList.remove('hidden');
            }
        } else {
            messageElement.textContent = 'Access to this site is restricted. Please log in to gain access.';
            loginButton.classList.remove('hidden');
        }
    } else {
        console.error('Required elements not found in the document.');
    }
}

// Function for getting user data
async function getUserData() {
    const token = getCookie('access_token');
    if (!token) {
        console.log('No token found in cookies');
        return;
    }

    try {
        const response = await fetch('https://discord.com/api/users/@me', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const userData = await response.json();
    } catch (error) {
        console.error('Error fetching user data:', error);
    }
}

// Function for setting cookies
function setCookie(name, value, days) {
    const date = new Date();
    date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
    const expires = "expires=" + date.toUTCString();
    document.cookie = `${name}=${value};${expires};path=/;Secure;SameSite=Lax`;
}

// The handler for the click on the authorization button
document.getElementById('auth-button').addEventListener('click', () => {
    const clientId = 'CLIENT_ID (NOT SECRET ID)';
    const redirectUri = 'YOUR_SITE_URL/.netlify/functions/callback';
    const scope = 'identify email';
    const authUrl = `https://discord.com/api/oauth2/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=${encodeURIComponent(scope)}`;
    window.location.href = authUrl;
});

// We run the functions when the page loads
document.addEventListener('DOMContentLoaded', async () => {
    await handleAccess();
    await getUserData();
});
