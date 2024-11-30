import wixWindow from 'wix-window';
import wixUsers from 'wix-users';
import wixData from 'wix-data';

$w.onReady(function () {
    $w("#button2").onClick(() => {
        let userId = wixUsers.currentUser.id;  // Get the current user's ID
        let selectedRating = $w("#ratingsInput").value; // Get the selected rating from the Wix rating input
        let message = $w('#messageBox').value;
        let consent = $w('#publicCheckbox').value;

        // Get the current date and time
        const currentDate = new Date();
        let formattedDate = currentDate.toISOString().split('T')[0]; // Formats the date as "YYYY-MM-DD"

        if (!selectedRating || selectedRating === 0) {
            // Alert the user if no rating is selected
            $w("#errorText").text = "Please select a star rating.";
            $w("#errorText").show();
            return;
        }
        console.log("Submit button clicked.");

        // Display a success message
        $w("#errorText").text = "Thank you for your feedback!";
        $w("#errorText").show(); 

        // Insert to reviews table
        wixData.insert("Reviews", {
                        reviewDate: formattedDate,
                        rating: selectedRating,
                        message: message,
                        userId: userId,
                        makePublic: consent
                    });

        setTimeout(() => {
            // Close the lightbox
            console.log("Closing lightbox...");
            wixWindow.lightbox.close();
        }, 1000); // 2000 milliseconds = 2 seconds
    });
});
