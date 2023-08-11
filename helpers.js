const generateRandomString = function(length) {
  let result = '';
  let counter = 0;
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const charactersLength = characters.length - 1;
  while (counter < length) {
    result += characters.charAt(Math.random() * charactersLength);
    counter += 1;
  }
  return result;
};

const urlsForUser = function(id, database) {
  let urls = {};
  for (let [url_id, entry] of Object.entries(database)) {
    if (entry.userID === id) {
      urls[url_id] = entry.longURL;
    }
  }
  return urls;
};

const getUserByEmail = function(email, database) {
  let user = null;
  for (const [user_id, user] of Object.entries(database)) {
    if (user.email === email) {
      return user;
    }
  }
  return user;
};

module.exports = { generateRandomString, getUserByEmail, urlsForUser}