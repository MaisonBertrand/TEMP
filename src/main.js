document.addEventListener("DOMContentLoaded", () => {
  // Fetching all necessary elements
  const loginButton = document.querySelector('.loginButton');
  const loginForm = document.querySelector("#login");
  const createAccountForm = document.querySelector("#createAccount");
  const userDashboard = document.querySelector("#userDashboard");
  const userNameSpan = document.querySelector("#userName");
  const logoutLink = document.querySelector("#logoutLink"); // Updated selector
  const bodyClass = document.querySelector("#mainBody");
  const mainContainer = document.querySelector("#mainContainer");
  const prints = document.querySelector(".prints");
  const profileIconContainer = document.querySelector(".profileIconContainer");
  const dropdownMenu = document.querySelector(".dropdownMenu");
  const printsFooter = document.querySelector(".printsFooter");
  const uploadButton = document.querySelector(".upload__button"); // Access 'Submit Photo' button

  // Swiper variable
  let swiper; // Declare swiper variable to hold the Swiper instance

  // Initially hide the logout link
  logoutLink.style.display = "none";

  // Fetch and display canvases
  fetchCanvases();

  // Initialize Swiper after fetching canvases
  function initializeSwiper() {
    swiper = new Swiper('.swiper-container', {
      slidesPerView: 4, // Number of slides per view
      spaceBetween: 10, // Space between slides in px
      slidesPerGroup: 4, // Number of slides to scroll per swipe
      loop: true,
      pagination: {
        el: '.swiper-pagination',
        clickable: true,
      },
      navigation: {
        nextEl: '.swiper-button-next',
        prevEl: '.swiper-button-prev',
      },
      grid: {
        rows: 2, // Number of rows
      },
      breakpoints: {
        320: {
          slidesPerView: 1,
          slidesPerGroup: 1,
          grid: {
            rows: 1,
          },
        },
        640: {
          slidesPerView: 2,
          slidesPerGroup: 2,
          grid: {
            rows: 2,
          },
        },
        1024: {
          slidesPerView: 4,
          slidesPerGroup: 4,
          grid: {
            rows: 2,
          },
        },
      },
    });
  }

  // Show create account form
  document.querySelector("#linkCreateAccount").addEventListener("click", e => {
    e.preventDefault();
    loginForm.classList.add("form--hidden");
    createAccountForm.classList.remove("form--hidden");
    // Hide other sections
    userDashboard.classList.add("form--hidden");
    prints.classList.add("form--hidden");
    printsFooter.classList.add("form--hidden");
  });

  // Show login form
  document.querySelector("#linkLogin").addEventListener("click", e => {
    e.preventDefault();
    createAccountForm.classList.add("form--hidden");
    loginForm.classList.remove("form--hidden");
    // Hide other sections
    userDashboard.classList.add("form--hidden");
    prints.classList.add("form--hidden");
    printsFooter.classList.add("form--hidden");
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
        mainContainer.classList.add("form--hidden"); // Hide the main container (login forms)
        printsFooter.classList.remove("form--hidden"); // Show the footer
        prints.classList.remove("form--hidden"); // Show the main content
        loginButton.textContent = 'Dashboard'; // Change 'Profile' to 'Dashboard'
        loginButton.classList.remove("loginButton");
        loginButton.classList.add("profileButton");
        userNameSpan.textContent = username;
        logoutLink.style.display = "block"; // Show the logout link
        userDashboard.classList.add("form--hidden"); // Hide the user dashboard
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
        createAccountForm.classList.add("form--hidden"); // Hide the signup form
        loginForm.classList.remove("form--hidden"); // Show the login form
        setFormMessage(loginForm, 'success', 'Account created successfully. Please log in.');
      } else {
        console.error(result.message);
        setFormMessage(createAccountForm, 'error', result.message);
      }
    } catch (error) {
      console.error('Error:', error);
      setFormMessage(createAccountForm, 'error', 'Something went wrong. Please try again.');
    }
  });

  // Handle dashboard/profile button click
  loginButton.addEventListener("click", () => {
    if (loginButton.classList.contains("profileButton")) {
      // User is logged in and clicked 'Dashboard'
      // Show user dashboard without hiding 'homePage'
      userDashboard.classList.remove("form--hidden"); // Show user dashboard
      // Optional: Hide other sections if needed
      prints.classList.add("form--hidden"); // Hide main content if desired
    } else {
      // If not logged in, show login form
      prints.classList.add("form--hidden");
      mainContainer.classList.remove("form--hidden");
      loginForm.classList.remove("form--hidden");
      createAccountForm.classList.add("form--hidden");
      printsFooter.classList.add("form--hidden");
      bodyClass.classList.add("loginMenu");
    }
  });

  // Handle logout link click
  logoutLink.addEventListener("click", () => {
    userDashboard.classList.add("form--hidden"); // Hide user dashboard
    prints.classList.add("form--hidden"); // Hide main content
    mainContainer.classList.remove("form--hidden"); // Show main container (login form)
    loginForm.classList.remove("form--hidden"); // Show login form
    logoutLink.style.display = "none"; // Hide the logout link
    loginButton.textContent = 'Login';
    loginButton.classList.remove("profileButton");
    loginButton.classList.add("loginButton");
    printsFooter.classList.add("form--hidden"); // Hide the footer
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

  // Handle 'Submit Photo' button click
  uploadButton.addEventListener("click", async (e) => {
    e.preventDefault();
    const fileInput = document.getElementById('photoFile');
    const fileName = document.getElementById('photoName').value;
    const formData = new FormData();

    // Get the username from the userNameSpan or default to 'Anonymous'
    const username = userNameSpan.textContent || 'Anonymous';

    // Check if a file has been selected
    if (!fileInput.files[0]) {
      alert('Please select a file to upload.');
      return;
    }

    formData.append('photoFile', fileInput.files[0]);
    formData.append('photoName', fileName);
    formData.append('username', username); // Include the username

    try {
      const response = await fetch('http://localhost:3001/upload', {
        method: 'POST',
        body: formData
      });

      const result = await response.json();
      if (response.ok) {
        console.log('File uploaded successfully');
        // Include 'uploadedBy' when calling displayCanvas
        displayCanvas({ imageUrl: result.filePath, description: fileName, uploadedBy: username });
        if (swiper) swiper.update(); // Update the Swiper instance if it's initialized
      } else {
        console.error(result.message);
        alert('Error uploading file: ' + result.message);
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Something went wrong. Please try again.');
    }
  });

  // Fetch and display canvases
  async function fetchCanvases() {
    try {
      const response = await fetch('http://localhost:3001/api/canvases');
      const canvases = await response.json();
      displayCanvases(canvases);
      initializeSwiper(); // Ensure Swiper is initialized after slides are added
    } catch (error) {
      console.error('Error fetching canvases:', error);
    }
  }

  // Display multiple canvases using Swiper
  function displayCanvases(canvases) {
    canvases.forEach(canvas => {
      displayCanvas(canvas);
    });
  }

  // Display a single canvas as a Swiper slide
  function displayCanvas(canvas) {
    const swiperWrapper = document.querySelector('.swiper-wrapper');
    const swiperSlide = document.createElement('div');
    swiperSlide.classList.add('swiper-slide');

    // Create a container div to wrap the content and add styles
    const contentDiv = document.createElement('div');
    contentDiv.classList.add('canvas-content'); // Add a class for styling

    // Description (name) above the image
    const description = document.createElement('p');
    description.textContent = canvas.description;
    description.classList.add('canvas-description');

    // Image
    const img = document.createElement('img');
    img.src = canvas.imageUrl;
    img.alt = 'Canvas Image';

    // Uploader's username below the image
    const uploader = document.createElement('p');
    uploader.textContent = `Uploaded by: ${canvas.uploadedBy || 'Anonymous'}`;
    uploader.classList.add('canvas-uploader');

    // Append elements to contentDiv
    contentDiv.appendChild(description);
    contentDiv.appendChild(img);
    contentDiv.appendChild(uploader);

    // Append contentDiv to the slide
    swiperSlide.appendChild(contentDiv);

    // Append the slide to the swiper wrapper
    swiperWrapper.appendChild(swiperSlide);
  }

}); // End of DOMContentLoaded event listener

// Display form messages
function setFormMessage(formElement, type, message) {
  if (formElement) { // Check to prevent errors if formElement is null
    const messageElement = formElement.querySelector(".form__message");
    if (messageElement) {
      messageElement.textContent = message;
      messageElement.classList.remove("form__message--success", "form__message--error");
      messageElement.classList.add(`form__message--${type}`);
    } else {
      alert(message); // Fallback if messageElement is not found
    }
  }
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
