import wixData from 'wix-data';
import wixUsers from 'wix-users';

// Function to filter the repeater based on the logged-in user's ID
function filterPetsByUserID(userId) {
    // Query the collection where userID matches the logged-in user's ID
    wixData.query("Pets")
        .eq("ownerId", userId)  // "ownerID" is the field in your collection
        .ascending("size")
        .find()
        .then((results) => {
            if (results.items.length > 0) {
                $w("#box1").show();
                $w('#bookButton').enable();
                $w('#deletePet').show();

                // Disable add button if results = 4
                if (results.items.length == 4){
                    $w("#addPet").disable(); 
                }

                // Populate the repeater with filtered results
                $w("#petsRepeater").data = results.items;

                // Get an array of petIds from the results
                let petIds = results.items.map(item => item._id);

                console.log("Retrieved petIds: ", petIds);

                // Now use the petIds to filter the "Schedules" collection
                filterSchedulesByPetIds(petIds, results.items);
            } else {
                $w("#petPrompt").show();

                console.log("No items found for the logged-in user.");
                $w("#petsRepeater").data = [];  // Clear the repeater if no results
            }
        })
        .catch((err) => {
            console.error("Error filtering repeater: ", err);
        });
}

function filterSchedulesByPetIds(petIds, pets) {
    wixData.query("schedules")
        .hasSome("petId", petIds)  // Assuming "petId" is the field in the "Schedules" collection
        .ascending("scheduleDate")
        .find()
        .then((results) => {
            if (results.items.length > 0) {
                $w("#box2").show();
                $w('#cancelBooking').show();

                // Merge schedule data with pet names
                let schedulesWithPetNames = results.items.map(schedule => {
                    let pet = pets.find(p => p._id === schedule.petId); // Find the pet by petId
                    return {
                        ...schedule,
                        petName: pet ? pet.firstName : "Unknown Pet" // Add pet name or default to "Unknown Pet"
                    };
                });

                // Do something with the merged data, e.g., display in the repeater
                $w("#serviceRepeater").data = schedulesWithPetNames;
                console.log("Schedules updated with pet names.");
            } else {
                $w("#bookPrompt").show();

                console.log("No schedules found for the user's pets.");
                $w("#serviceRepeater").data = [];  // Clear the repeater if no schedules
            }
        })
        .catch((err) => {
            console.error("Error filtering schedules: ", err);
        });
}

$w.onReady(function () {
    $w("#petsRepeater").data = [];  // Clear the repeater if no schedules
    $w("#serviceRepeater").data = [];  // Clear the repeater if no schedules

    let user = wixUsers.currentUser;

    if (user.loggedIn) {
        let userId = user.id;
        console.log("Logged-in user ID: " + userId);

        // Call the function to filter the repeater for this user
        filterPetsByUserID(userId);
    } else {
        console.log("No user is logged in");
    }
});

$w("#petsRepeater").onItemReady(($item, itemData, index) => {
    // Access each item’s data and set it to elements in the repeater
    $item("#petImage").src = itemData.petImage;
    $item("#petName").text = itemData.firstName;
    $item("#petSpecies").text = itemData.species;
    $item("#petBreed").text = itemData.breed;
    $item("#petSize").text = itemData.size;
});

// Set up the schedulesRepeater onItemReady event to display each schedule's data
$w("#serviceRepeater").onItemReady(($item, itemData, index) => {
    // Access each schedule’s data and set it to elements in the repeater
    $item("#ServiceName").text = itemData.serviceType;

    // Formatting datetime
    let scheduleDateDraft = itemData.scheduleDate;
    console.log(scheduleDateDraft)

    let formattedDateTime = new Date(scheduleDateDraft).toLocaleString("en-US", {
        year: 'numeric', month: '2-digit', day: '2-digit', 
        hour: '2-digit', minute: '2-digit'
    });
    console.log(formattedDateTime)

    $item("#ServiceDate").text = formattedDateTime;
    $item("#ServiceLoc").text = itemData.scheduleLocation;
    $item("#Pet").text = itemData.petName;
    $item("#Status").text = itemData.status;
});