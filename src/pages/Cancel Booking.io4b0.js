import wixData from 'wix-data';
import wixUsers from 'wix-users';

$w.onReady(async function () {
    let user = wixUsers.currentUser;
	$w("#scheduleDropdown").onChange(enableCancel);

    if (user.loggedIn) {
        let userId = user.id;
        console.log("Logged-in user ID: " + userId);

        // Query for users pets
		const petResults = await wixData.query("Pets")
							.eq("ownerId", userId)  // "ownerID" is the field in your collection
							.find();

		const petIds = petResults.items.map(item => item._id);

		const scheduleResults = await wixData.query("schedules")
						.hasSome("petId", petIds)  // Assuming "petId" is the field in the "Schedules" collection
						.ascending("scheduleDate")
						.find();

		const scheduleOptions = scheduleResults.items.map(schedule => ({
			label: new Date(schedule.scheduleDate).toLocaleString("en-US", {
											year: 'numeric', month: '2-digit', day: '2-digit', 
											hour: '2-digit', minute: '2-digit'
										}),
			value: schedule._id
		}));

		console.log(scheduleOptions)

		$w("#scheduleDropdown").options = scheduleOptions;
    } else {
        console.log("No user is logged in");
    }

	// Enable delete button
    async function enableCancel() {
		$w('#cancelButton').enable();
    }

	$w('#cancelButton').onClick((event) => {
		const scheduleId = $w('#scheduleDropdown').value;

		wixData.query("schedules")
				.eq("_id", scheduleId)
				.find()
				.then((results) => {
					let items = results.items[0];

					let serviceType = items.serviceType;
					let scheduleDate = items.scheduleDate;
					let scheduleLocation = items.scheduleLocation;

					wixData.update("schedules", {
						_id: scheduleId,
						scheduleId: null,
						serviceType: serviceType,
						scheduleDate: scheduleDate,
						scheduleLocation: scheduleLocation,
						petId: null,
						status: null
					});

					$w('#confirmationText').show()
					$w('#cancelButton').disable();
				});	
	});
});