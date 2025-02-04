document.addEventListener("DOMContentLoaded", () => {
    // Fetching all necessary elements
    const loginButton = document.querySelector('.loginButton');
    const loginForm = document.querySelector("#login");
    const createAccountForm = document.querySelector("#createAccount");
    const userDashboard = document.querySelector("#userDashboard");
    const userNameSpan = document.querySelector("#userName");
    const logoutLink = document.querySelector(".dropdownMenu a[href='#']:nth-of-type(3)");
    const bodyClass = document.querySelector("#mainBody");
    const mainContainer = document.querySelector("#mainContainer");
    const prints = document.querySelector(".printsMain");
    const profileIconContainer = document.querySelector(".profileIconContainer");
    const dropdownMenu = document.querySelector(".dropdownMenu");
    const loginLogoIcon = document.querySelector(".login-logoIcon")
    const printsFooter = document.querySelector(".printsFooter")
    
    // Initially hide the logout link
    logoutLink.style.display = "none";
  
    // Fetch and display canvases
    fetchCanvases();
  
    // Show create account form
    document.querySelector("#linkCreateAccount").addEventListener("click", e => {
      e.preventDefault();
      loginForm.classList.add("form--hidden");
      createAccountForm.classList.remove("form--hidden");
    });
  
    // Show login form
    document.querySelector("#linkLogin").addEventListener("click", e => {
      e.preventDefault();
      loginForm.classList.remove("form--hidden");
      createAccountForm.classList.add("form--hidden");
    });
  
    // Handle login form submission
    loginForm.addEventListener("submit", async e => {
      e.preventDefault();
      const username = document.getElementById('loginUsername').value;
      const password = document.getElementById('loginPassword').value;
      try {
        const response = await fetch('http://localhost:3001/api/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ username, password })
        });
        const result = await response.json();
        if (response.ok) {
          console.log('Login successful');
          // Update UI on successful login
          mainContainer.classList.add("form--hidden");
          //loginLogoIcon.classList.add("form--hidden");
          printsFooter.classList.remove("form--hidden");
          prints.classList.remove("form--hidden");
          loginButton.textContent = 'Profile';
          loginButton.classList.remove("loginButton");
          loginButton.classList.add("profileButton");
          userNameSpan.textContent = username;
          loginForm.classList.add("form--hidden");
          logoutLink.style.display = "block"; // Show the logout link
        } else {
          console.error(result.message);
          setFormMessage(loginForm, 'error', 'Invalid username/password combination');
        }
      } catch (error) {
        console.error('Error:', error);
        setFormMessage(loginForm, 'error', 'Something went wrong. Please try again.');
      }
    });
  
    // Handle create account form submission
    createAccountForm.addEventListener("submit", async e => {
      e.preventDefault();
      const username = document.getElementById('signupUsername').value;
      const email = document.getElementById('signupEmail').value;
      const password = document.getElementById('signupPassword').value;
      const confirmPassword = document.getElementById('signupConfirmPassword').value;
      if (password !== confirmPassword) {
        setFormMessage(createAccountForm, 'error', 'Passwords do not match');
        return;
      }
      try {
        const response = await fetch('http://localhost:3001/api/signup', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ username, email, password })
        });
        const result = await response.json();
        if (response.ok) {
          console.log('Account created successfully');
          createAccountForm.classList.add("form--hidden");
          loginForm.classList.remove("form--hidden");
        } else {
          console.error(result.message);
          setFormMessage(createAccountForm, 'error', result.message);
        }
      } catch (error) {
        console.error('Error:', error);
        setFormMessage(createAccountForm, 'error', 'Something went wrong. Please try again.');
      }
    });
  
    // Handle profile button click
    loginButton.addEventListener("click", () => {
      if (loginButton.classList.contains("profileButton")) {
        prints.classList.add("form--hidden");
        mainContainer.classList.remove("form--hidden");
        userDashboard.classList.remove("form--hidden");
      } else {
        prints.classList.add("form--hidden");
        mainContainer.classList.remove("form--hidden");
        login.classList.remove("form--hidden");
        printsFooter.classList.add("form--hidden");
        bodyClass.classList.add("loginMenu")
      }
    });
  
    // Handle logout link click
    logoutLink.addEventListener("click", () => {
      userDashboard.classList.add("form--hidden");
      loginForm.classList.remove("form--hidden");
      logoutLink.style.display = "none"; // Hide the logout link again
    });
  
    // Validate form inputs
    document.querySelectorAll(".form__input").forEach(inputElement => {
      inputElement.addEventListener("blur", e => {
        if (e.target.id === "signupUsername" && e.target.value.length > 0 && e.target.value.length < 6) {
          setInputError(inputElement, "Username must be at least 6 characters in length");
        }
      });
      inputElement.addEventListener("input", e => {
        clearInputError(inputElement);
      });
    });
  
    // Show/hide dropdown menu
    profileIconContainer.addEventListener("mouseenter", () => {
      dropdownMenu.style.display = "block";
    });
  
    profileIconContainer.addEventListener("mouseleave", () => {
      dropdownMenu.style.display = "none";
    });
  });
  
  // Display form messages
  function setFormMessage(formElement, type, message) {
    const messageElement = formElement.querySelector(".form__message");
    messageElement.textContent = message;
    messageElement.classList.remove("form__message--success", "form__message--error");
    messageElement.classList.add(`form__message--${type}`);
  }
  
  // Set input error messages
  function setInputError(inputElement, message) {
    inputElement.classList.add("form__input--error");
    inputElement.parentElement.querySelector(".form__input-error-message").textContent = message;
  }
  
  // Clear input error messages
  function clearInputError(inputElement) {
    inputElement.classList.remove("form__input--error");
    inputElement.parentElement.querySelector(".form__input-error-message").textContent = "";
  }
  
  // Fetch and display canvases
  async function fetchCanvases() {
    try {
      const response = await fetch('http://localhost:3001/api/canvases');
      const canvases = await response.json();
      displayCanvases(canvases);
    } catch (error) {
      console.error('Error fetching canvases:', error);
    }
  }
  
  // Display canvases in the main section
  function displayCanvases(canvases) {
    const printsMain = document.querySelector('.printsMain ul');
    canvases.forEach(canvas => {
      const li = document.createElement('li');
      const img = document.createElement('img');
      const p = document.createElement('p');
      img.src = canvas.imageUrl;
      img.alt = 'Canvas Image'; // Add appropriate alt text
      p.textContent = canvas.description; // Add a description if available
      li.appendChild(img);
      li.appendChild(p);
      printsMain.appendChild(li);
    });
  }
  