// Auth0 cleanup script
const https = require('https');

const DOMAIN = 'dev-wcfsc26zhar6lcy7.eu.auth0.com';
const CLIENT_ID = 'yinJnU037DEYSDllwfL5SRe34YOmwFZX';
const CLIENT_SECRET = '6vj69qR5CRZphYfidqH77_uTSmqF3BsTTwmiNKkl3Ca15KzkNu8yUka-uGbLfB7O';

async function getManagementToken() {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
      audience: `https://${DOMAIN}/api/v2/`,
      grant_type: 'client_credentials'
    });

    const options = {
      hostname: DOMAIN,
      path: '/oauth/token',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length
      }
    };

    const req = https.request(options, (res) => {
      let responseData = '';
      res.on('data', (chunk) => responseData += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(responseData);
          resolve(parsed.access_token);
        } catch (e) {
          reject(e);
        }
      });
    });

    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

async function deleteAllUsers(token) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: DOMAIN,
      path: '/api/v2/users?search_engine=v3',
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    };

    const req = https.request(options, (res) => {
      let responseData = '';
      res.on('data', (chunk) => responseData += chunk);
      res.on('end', async () => {
        try {
          const users = JSON.parse(responseData);
          console.log(`🔍 Found ${users.length} users in Auth0`);

          if (users.length === 0) {
            console.log('✅ No users to delete');
            resolve();
            return;
          }

          // Delete each user
          for (const user of users) {
            await deleteUser(token, user.user_id);
            console.log(`🗑️ Deleted user: ${user.user_id}`);
          }

          console.log('✅ All users deleted from Auth0');
          resolve();
        } catch (e) {
          reject(e);
        }
      });
    });

    req.on('error', reject);
    req.end();
  });
}

async function deleteUser(token, userId) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: DOMAIN,
      path: `/api/v2/users/${encodeURIComponent(userId)}`,
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    };

    const req = https.request(options, (res) => {
      resolve();
    });

    req.on('error', reject);
    req.end();
  });
}

async function main() {
  try {
    console.log('🔐 Getting Auth0 Management Token...');
    const token = await getManagementToken();

    console.log('🧹 Cleaning up Auth0 users...');
    await deleteAllUsers(token);

    console.log('✅ Auth0 cleanup completed!');
  } catch (error) {
    console.error('❌ Cleanup failed:', error);
  }
}

main();
