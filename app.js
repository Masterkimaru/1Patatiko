// Global variable to hold the YouTube player instance
let player;
let ticketDialog; // Global variable to hold the reference to the ticket dialog

document.addEventListener('DOMContentLoaded', function () {
  // Function to fetch shows data from the server
  function fetchShows() {
    fetch('https://successful-sun-hat-clam.cyclic.app/shows')
      .then(response => response.json())
      .then(data => {
        const showsList = document.getElementById('shows-list');
        showsList.innerHTML = ''; // Clear existing shows
        data.forEach(show => {
          const showContainer = document.createElement('div');
          showContainer.classList.add('show-container');

          const imageContainer = document.createElement('div');
          imageContainer.classList.add('image-container');
          const image = document.createElement('img');
          image.src = show.image;
          image.alt = show.name;
          imageContainer.appendChild(image);

          const name = document.createElement('h2');
          name.textContent = show.name;

          const description = document.createElement('p');
          description.textContent = show.description;
          description.classList.add('description');

          const videoButton = document.createElement('button'); // Button for video URL
          videoButton.textContent = 'Watch Video';
          videoButton.classList.add('video-button');

          const moreInfoButton = document.createElement('button');
          moreInfoButton.textContent = 'More Info';
          moreInfoButton.classList.add('more-info-button');

          const buyTicketButton = document.createElement('button');
          buyTicketButton.textContent = 'Buy Ticket';
          buyTicketButton.classList.add('buy-ticket-button');

          showContainer.appendChild(imageContainer);
          showContainer.appendChild(name);
          showContainer.appendChild(description);
          showContainer.appendChild(videoButton); // Append video button
          showContainer.appendChild(moreInfoButton);
          showContainer.appendChild(buyTicketButton);
          showsList.appendChild(showContainer);

          moreInfoButton.addEventListener('click', function(event) {
            event.stopPropagation(); // Prevent event propagation
            showMoreInfo(show, moreInfoButton); // Pass the moreInfoButton to the function
          });

          buyTicketButton.addEventListener('click', function() {
            openTicketModal(show);
          });

          videoButton.addEventListener('click', function() {
            openVideoDialog(show.videoUrl); // Pass video URL to the function
          });

          image.addEventListener('mouseenter', function() {
            image.classList.add('hovered');
          });

          image.addEventListener('mouseleave', function() {
            image.classList.remove('hovered');
          });
        });
      })
      .catch(error => console.error('Error fetching shows:', error));
  }

  function showMoreInfo(show, moreInfoButton) { // Accept moreInfoButton as an argument
    const info = document.getElementById('info');
    let occurrencesHTML = '';
    
    // Iterate over each occurrence
    show.occurrences.forEach(occurrence => {
      // Extract start time, end time, and day of the week
      const timings = occurrence.timings.map(timing => {
        const startTime = new Date(timing.startTime);
        const endTime = new Date(timing.endTime);
        return `${startTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}-${endTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`;
      }).join(' & ');
      
      const dayOfWeek = occurrence.dayOfWeek;
      const startDate = new Date(occurrence.timings[0].startTime);
      const endDate = new Date(occurrence.timings[0].endTime);
      
      // Generate HTML for this occurrence
      const occurrenceHTML = `<p>${dayOfWeek} ${startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}: ${timings}</p>`;
      
      // Append HTML for this occurrence to the overall HTML
      occurrencesHTML += occurrenceHTML;
    });
    
    // Display show information including all occurrences
    info.innerHTML = `
      <h2>${show.name}</h2>
      <p>Cast: ${show.cast.join(', ')}</p>
      <div>
        <p><strong>Occurrences:</strong></p>
        ${occurrencesHTML}
      </div>
      <p>Venue: ${show.venue}</p>
    `;
    
    // Add 'show' class to display the info container with animation
    info.classList.add('show');
  
    // Add event listener to the document body to close the info container when clicking outside of it
    document.addEventListener('click', function(event) {
      if (!info.contains(event.target) && event.target !== moreInfoButton) {
        info.classList.remove('show'); // Hide the info container if the clicked element is not inside it
      }
    });
  }
  
  
  
  
  

  function openTicketModal(show) {
    // Check if the dialog is already open
    if (ticketDialog) {
      return; // If dialog is open, exit function
    }
  
    const dialog = document.createElement('div');
    dialog.classList.add('ticket-dialog');
  
    const closeButton = document.createElement('button');
    closeButton.textContent = 'Close';
    closeButton.classList.add('close-button');
  
    const ticketOptions = document.createElement('div');
    ticketOptions.classList.add('ticket-options');
  
    const totalAmountField = document.createElement('div');
    totalAmountField.classList.add('total-amount');
    totalAmountField.textContent = 'Total Amount: Ksh0'; // Initial total amount
  
    const completePaymentButton = document.createElement('button');
    completePaymentButton.textContent = 'Complete Payment';
    completePaymentButton.classList.add('complete-payment-button');
    completePaymentButton.disabled = true; // Disable initially
  
    const userDetailsContainer = document.createElement('div');
    userDetailsContainer.classList.add('user-details-container');
    userDetailsContainer.style.display = 'none'; // Initially hidden
  
    // Function to create ticket option
    function createTicketOption(label, priceKey) {
      const optionDiv = document.createElement('div');
      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.value = priceKey;
      const labelElement = document.createElement('label');
      labelElement.textContent = `${label} - Ksh${show[priceKey]}`;
      optionDiv.appendChild(checkbox);
      optionDiv.appendChild(labelElement);
      ticketOptions.appendChild(optionDiv);
  
      // Event listener for checkbox change
      checkbox.addEventListener('change', function() {
        if (checkbox.checked) {
          // Uncheck all other checkboxes
          const checkboxes = ticketOptions.querySelectorAll('input[type="checkbox"]');
          checkboxes.forEach(cb => {
            if (cb !== checkbox) {
              cb.checked = false;
              cb.dispatchEvent(new Event('change')); // Trigger change event for unchecked checkboxes
            }
          });
  
          // Display ticket fields for the selected option
          const ticketFields = document.createElement('div');
          ticketFields.classList.add('ticket-fields');
          ticketFields.innerHTML = `
            <label for="numberOfTickets">Number of Tickets:</label>
            <input type="number" id="numberOfTickets" value="1" min="1">
          `;
          optionDiv.appendChild(ticketFields);
  
          // Enable complete payment button
          completePaymentButton.disabled = false;
        } else {
          
          // Remove ticket fields if unchecked
          const ticketFields = optionDiv.querySelector('.ticket-fields');
          if (ticketFields) {
            ticketFields.remove();
          };
  
          // Disable complete payment button if no ticket selected
          completePaymentButton.disabled = true;
        }
      });
    }
  
    // Create ticket options
    createTicketOption('Regular', 'priceRegular');
    createTicketOption('VIP', 'priceVIP');
    createTicketOption('Group of 5', 'priceGroupOf5');
    createTicketOption('Advance', 'priceAdvance');
  
    dialog.appendChild(closeButton);
    dialog.appendChild(ticketOptions);
    dialog.appendChild(totalAmountField);
    dialog.appendChild(completePaymentButton);
    dialog.appendChild(userDetailsContainer);
  
    document.body.appendChild(dialog);
  
    // Event listener for close button
    closeButton.addEventListener('click', function() {
      dialog.remove();
      ticketDialog = null; // Reset ticketDialog reference when dialog is closed
    });
  
    // Event listener for change in number of tickets
    ticketOptions.addEventListener('change', function() {
      updateTotalAmount();
    });
  
    // Event listener for complete payment button
    completePaymentButton.addEventListener('click', function() {
      // Show user details input fields
      const nameLabel = document.createElement('label');
      nameLabel.textContent = 'Name of Ticket Owner:';
      const nameInput = document.createElement('input');
      nameInput.type = 'text';
  
      const emailLabel = document.createElement('label');
      emailLabel.textContent = 'Email:';
      const emailInput = document.createElement('input');
      emailInput.type = 'email';
  
      const phoneLabel = document.createElement('label');
      phoneLabel.textContent = 'Phone Number:';
      const phoneInput = document.createElement('input');
      phoneInput.type = 'tel';
  
      const purchaseButton = document.createElement('button');
      purchaseButton.textContent = 'Purchase';
      purchaseButton.classList.add('purchase-button');
      purchaseButton.disabled = true; // Initially disabled
  
      // Add input fields to user details container
      userDetailsContainer.appendChild(nameLabel);
      userDetailsContainer.appendChild(nameInput);
      userDetailsContainer.appendChild(emailLabel);
      userDetailsContainer.appendChild(emailInput);
      userDetailsContainer.appendChild(phoneLabel);
      userDetailsContainer.appendChild(phoneInput);
      userDetailsContainer.appendChild(purchaseButton);
  
      // Show user details container
      userDetailsContainer.style.display = 'block';
  
      // Hide complete payment button
      completePaymentButton.style.display = 'none';
  
      // Expand dialog to accommodate user details
      expandDialog();
  
      // Event listener for input fields change
      nameInput.addEventListener('input', validateInputs);
      emailInput.addEventListener('input', validateInputs);
      phoneInput.addEventListener('input', validateInputs);
  
      purchaseButton.addEventListener('click', function() {
        const name = nameInput.value;
        const email = emailInput.value;
        const phone = phoneInput.value;
      
        // Send user data to the server
        fetch('https://successful-sun-hat-clam.cyclic.app/users', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ username: name, email, phone })
        })
        .then(response => {
          if (response.ok) {
            return response.json();
          }
          throw new Error('Failed to save user data');
        })
        .then(data => {
          console.log('User data saved:', data);
          // Display thank you message
          const thankYouMessage = document.createElement('div');
          thankYouMessage.innerHTML = `Thank you very much ${name} for purchasing a ticket through PataTiko. Click on this link to pay <a href="https://www.tikohub.co.ke/resources/event.php?E_ID=160&UNQ=disabled&Promo=Faiz">www.tikohub.com</a>`;
          userDetailsContainer.appendChild(thankYouMessage);
        })
        .catch(error => {
          console.error('Error saving user data:', error);
          // Show an error message to the user
        });
      });
      
  
      // Function to validate input fields
      function validateInputs() {
        const name = nameInput.value;
        const email = emailInput.value;
        const phone = phoneInput.value;
  
        // Enable purchase button if all input fields are filled
        if (name.trim() !== '' && email.trim() !== '' && phone.trim() !== '') {
          purchaseButton.disabled = false;
        } else {
          purchaseButton.disabled = true;
        }
      }
    });
  
    // Function to update total amount
    function updateTotalAmount() {
      const checkboxes = ticketOptions.querySelectorAll('input[type="checkbox"]');
      let totalAmount = 0;
      checkboxes.forEach(cb => {
        if (cb.checked) {
          const priceKey = cb.value;
          const numberOfTickets = parseInt(dialog.querySelector('#numberOfTickets').value);
          totalAmount += show[priceKey] * numberOfTickets;
        }
      });
      totalAmountField.textContent = `Total Amount: Ksh${totalAmount}`;
    }
  
    // Function to expand dialog
    function expandDialog() {
      dialog.style.height = '450px'; // Adjust dialog height for user details
    }
  
    // Assign the dialog to the global variable
    ticketDialog = dialog;
  }
  
  
  
  
  
  

















  

  // Function to open video in dialog box
  function openVideoDialog(videoUrl) {
    const dialog = document.createElement('div');
    dialog.classList.add('video-dialog');
  
    const closeButton = document.createElement('button');
    closeButton.textContent = 'Close';
    closeButton.classList.add('close-button');
  
    const playerDiv = document.createElement('div');
    playerDiv.id = 'player';
  
    dialog.appendChild(closeButton);
    dialog.appendChild(playerDiv);
  
    document.body.appendChild(dialog);
  
    // Load YouTube Player API asynchronously
    const tag = document.createElement('script');
    tag.src = 'https://www.youtube.com/iframe_api';
    const firstScriptTag = document.getElementsByTagName('script')[0];
    firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
  
    let isDragging = false;
    let offsetX, offsetY;
  
    // Define the function to close the dialog
    function closeDialog() {
      dialog.remove();
      // Stop and destroy the player instance when closing the dialog
      if (player) {
        player.stopVideo();
        player.destroy();
        player = null;
      }
    }
  
    // Add event listener to the close button
    closeButton.addEventListener('click', closeDialog);
  
    // Callback function to create YouTube player after API loads
    window.onYouTubeIframeAPIReady = function () {
      if (!player) {
        player = new YT.Player('player', {
          height: '360',
          width: '640',
          videoId: extractVideoId(videoUrl), // Extract video ID from YouTube URL
          playerVars: {
            'controls': 1,
            'autoplay': 1
          },
          events: {
            'onReady': onPlayerReady // Call onPlayerReady when player is ready
          }
        });
      }
    };
  
    // Function to handle player ready event
    function onPlayerReady(event) {
      event.target.playVideo(); // Auto-play the video when player is ready
    }
  
    // Function to handle touch start event on the dialog
    dialog.addEventListener('touchstart', function (event) {
      const touch = event.touches[0];
      const rect = dialog.getBoundingClientRect();
      offsetX = touch.clientX - rect.left;
      offsetY = touch.clientY - rect.top;
      isDragging = true;
    });
  
    // Function to handle touch move event on the document
    document.addEventListener('touchmove', function (event) {
      if (!isDragging) return;
      const touch = event.touches[0];
      dialog.style.left = touch.clientX - offsetX + 'px';
      dialog.style.top = touch.clientY - offsetY + 'px';
      event.preventDefault(); // Prevent scrolling while dragging
    });
  
    // Function to handle touch end event on the document
    document.addEventListener('touchend', function () {
      isDragging = false;
    });
  
    // Add event listener for mouse down on the dialog
    dialog.addEventListener('mousedown', function (event) {
      const rect = dialog.getBoundingClientRect();
      offsetX = event.clientX - rect.left;
      offsetY = event.clientY - rect.top;
      isDragging = true;
    });
  
    // Add event listener for mouse move on the document
    document.addEventListener('mousemove', function (event) {
      if (!isDragging) return;
      dialog.style.left = event.clientX - offsetX + 'px';
      dialog.style.top = event.clientY - offsetY + 'px';
    });
  
    // Add event listener for mouse up on the document
    document.addEventListener('mouseup', function () {
      isDragging = false;
    });
  
    // Add event listener to reinitialize player when dialog is reopened
    dialog.addEventListener('dialogClosed', function () {
      window.onYouTubeIframeAPIReady();
    });
  }
  
  // Function to extract video ID from YouTube URL
  function extractVideoId(url) {
    // Regular expression to match YouTube video ID in various formats
    const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:.*v\/|.*\?v=))([^&]+)/);
    if (match && match[1]) {
      return match[1];
    } else {
      // If no match found or match[1] is null, handle it accordingly
      console.error('Invalid YouTube URL:', url);
      // You can return a default value or throw an error here
      return null;
    }
  }
  // Call fetchShows function when the page loads
  fetchShows();
});