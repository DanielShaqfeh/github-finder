// Github API 
let api = "https://api.github.com/users/"; 

// Load Axios from CDN for making API requests
let fetch = document.createElement("script");
fetch.src = 'https://cdn.jsdelivr.net/npm/axios/dist/axios.min.js';
fetch.integrity = `ha512-DZqqY3PiOvTP9HkjIWgjO6ouCbq+dxqWoJZ/Q+zPYNHmlnI2dQnbJ5bxAHpAMw+LXRm4D72EIRXzvcHQtE8/VQ==`;
fetch.crossOrigin = "anonymous";
document.head.appendChild(fetch);

// Wait for Axios to load before setting up event listeners
fetch.onload = () => {
  let main = document.getElementById("main");
  let inputForm = document.getElementById("userInput");
  let inputBox = document.getElementById("inputBox");

  const getUserAndRepos = (name) => {
    const userRequest = axios(api + name);
    const reposRequest = axios(api + name + "/repos?sort=created");

    Promise.all([userRequest, reposRequest]) // Use Promise.all to handle both requests
      .then(([userResponse, reposResponse]) => {
        userCard(userResponse.data);
        showRepos(reposResponse.data);
      })
      .catch((err) => {
        if (err.response) {
          if (err.response.status === 404) {
            showError("No profile with this username");
          } else if (err.response.status === 403) {
            showError("Number of requests limit exceeded. Please wait about 1 hour and try again.");
          } else {
            showError("An unexpected error occurred. Please try again later.");
          }
        } else {
          showError("Network error. Please check your connection and try again.");
        }
      });
  };

  const animateCount = (element, target) => {
    let count = 0;
    const duration = 1500; 
    const stepTime = Math.max(Math.floor(duration / target), 20); // interval time
    const increment = target / (duration / stepTime); //  increment per step

    const timer = setInterval(() => {
      count += increment;
      if (count >= target) {
        count = target;
        clearInterval(timer);
      }
      element.innerText = Math.floor(count);
    }, stepTime);
  };

  const userCard = (user) => {
    let id = user.name || user.login;
    let info = user.bio ? `<p>${user.bio}</p>` : "";
    let cardElement = `
      <div class="card">
        <div>
          <img src="${user.avatar_url}" 
               alt="${user.name}" 
               class="avatar">
        </div>

        <div class="user-info">
          <h2>${id}</h2>${info}
          <ul>
            <li><span class="count" data-target="${user.followers}">0</span> <strong>Followers</strong></li>
            <li><span class="count" data-target="${user.following}">0</span> <strong>Following</strong></li>
            <li><span class="count" data-target="${user.public_repos}">0</span> <strong>Repos</strong></li>
          </ul>
          <div id="repos"></div>
        </div>
      </div>`;
    main.innerHTML = cardElement;

    // Animate all counters
    const counters = main.querySelectorAll(".count");
    counters.forEach((counter) => {
      const target = +counter.getAttribute("data-target");
      animateCount(counter, target);
    });
  };

  const showError = (error) => {
    let cardHTML = `
      <div class="error-card">
        <h1>${error}</h1>
      </div>`;
    main.innerHTML = cardHTML;
  };

  const showRepos = (repos) => {
    let reposElement = document.getElementById("repos");
    reposElement.innerHTML = '';  // Clear previous repos
    for (let i = 0; i < 5 && i < repos.length; i++) { // Limit to 5 repos
      let repo = repos[i];
      let repoLink = document.createElement("a"); 
      repoLink.classList.add("repo");
      repoLink.href = repo.html_url; 
      repoLink.target = "_blank"; 
      repoLink.innerText = repo.name;
      reposElement.appendChild(repoLink);
    }
  };

  inputForm.addEventListener("submit", (e) => {
    e.preventDefault();
    let user = inputBox.value.trim();
    if (user) {
      getUserAndRepos(user);
      inputBox.value = "";
    }
  });
};
