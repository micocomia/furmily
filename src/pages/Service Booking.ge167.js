import wixData from 'wix-data';
import { triggeredEmails } from 'wix-crm';
import { currentMember } from "wix-members-frontend";
import wixPaidPlans from 'wix-paid-plans';
import wixWindowFrontend from "wix-window-frontend";

$w.onReady(async function () {
    const member = await currentMember.getMember();
    
    console.log("Logged-in user ID: " + member._id);

    // Query for users pets
    const petResults = await wixData.query("Pets")
                        .eq("ownerId", member._id)  // "ownerID" is the field in your collection
                        .find();

    const petIds = petResults.items.map(item => item._id);

    const scheduleResults = await wixData.query("schedules")
                    .hasSome("petId", petIds)  // Assuming "petId" is the field in the "Schedules" collection
                    .ascending("scheduleDate")
                    .find();

    console.log(scheduleResults.items.length)

    if(scheduleResults.items.length > 0){
        wixWindowFrontend.openLightbox("Feedback");
        console.log('Opening Lightbox')
    }
    
    // Event listeners for dropdown changes
    $w("#locationPicker").onChange(loadAvailableDates);
    $w("#servicePicker").onChange(loadAvailableDates);
    $w("#datePicker").onChange(loadAvailableTimes);
    $w("#timePicker").onChange(loadUserPets);
    $w("#petDropdown").onChange(enableBook);

    // Load available dates based on selected location and service type
    async function loadAvailableDates() {
        const location = $w("#locationPicker").value;
        const serviceType = $w("#servicePicker").value;

        if (location && serviceType) {
            const today = new Date();  // Get the current date

            const results = await wixData.query("schedules")
                .eq("scheduleLocation", location)
                .eq("serviceType", serviceType)
                .isEmpty("petId")  // Only show unbooked slots
                .isEmpty("status")
                .ge("scheduleDate", today)  // Only return results where the scheduleDate is greater than or equal to today
                .ascending("scheduleDate")  // Sort by date
                .find();

            // Filter dates that have available time slots
            const availableDatesMap = {};

            // Go through each schedule item and group by date, adjusting for time zone differences
            results.items.forEach(item => {
                const scheduleDate = new Date(item.scheduleDate);

                // Convert the scheduleDate to a string with only the date part (local time)
                const localDate = scheduleDate.toLocaleDateString("en-US", {
                    timeZone: 'America/Toronto' // Adjust to your specific time zone if necessary
                });

                // Map unique dates
                if (!availableDatesMap[localDate]) {
                    availableDatesMap[localDate] = true; // Mark the date as having available slots
                }
            });

            const availableDates = Object.keys(availableDatesMap); // Get unique dates

            // Map the available dates to options for the dropdown
            const dateOptions = availableDates.map(date => ({
                label: new Date(date).toLocaleDateString("en-US"),  // Display in MM/DD/YYYY
                value: date
            }));

            if (dateOptions.length > 0) {
                $w("#datePicker").options = dateOptions;
                $w("#datePicker").enable();  // Enable date dropdown if there are available dates
            } else {
                $w("#datePrompt").text = "No available date.";
                $w("#datePrompt").show();

                $w("#datePicker").options = [];
                $w("#datePicker").disable();  // Disable date dropdown if no available dates
            }
        } else {
            $w("#datePicker").options = [];
            $w("#datePicker").disable();  // Disable date dropdown if no location or service type
        }
    }

    // Load available time slots for the selected date
    async function loadAvailableTimes() {
        const location = $w("#locationPicker").value;
        const serviceType = $w("#servicePicker").value;
        const selectedDate = $w("#datePicker").value;

        if (location && serviceType && selectedDate) {
            const startOfDay = new Date(selectedDate);
            startOfDay.setHours(0, 0, 0, 0);
            const endOfDay = new Date(selectedDate);
            endOfDay.setHours(23, 59, 59, 999);

            const results = await wixData.query("schedules")
                .eq("scheduleLocation", location)
                .eq("serviceType", serviceType)
                .between("scheduleDate", startOfDay, endOfDay)
                .isEmpty("petId")
                .isEmpty("status")
                .ascending("scheduleDate")  // Sort by date and time
                .find();

            // Only enable if there's an available timeslot
            if (results.items.length > 0) {
                const timeSlots = results.items.map(item => ({
                    label: new Date(item.scheduleDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                    value: item._id
                }));

                $w("#timePicker").options = timeSlots;
                $w("#timePicker").enable();  // Enable time slot dropdown
            } else {
                $w("#timePrompt").text = "No available time.";
                $w("#timePrompt").show();

                $w("#timePicker").options = [];
                $w("#timePicker").disable();  // Disable time slot dropdown if no available slots
            }
        } else {
            $w("#timePicker").options = [];
            $w("#timePicker").disable();  // Disable time slot dropdown if no date is selected
        }
    }

    // Load pets for the logged-in user
    async function loadUserPets() {
        const location = $w("#locationPicker").value;
        const serviceType = $w("#servicePicker").value;
        const selectedDate = $w("#datePicker").value;
        const selectedTime = $w("#timePicker").value;

        let orders = await wixPaidPlans.getCurrentMemberOrders();
        let activePlans = orders.filter(order => order.status == 'ACTIVE');
        let activePlanNames = activePlans.map(order => order.planName)
        console.log("Active Plan Names: ", activePlanNames);

        if (location && serviceType && selectedDate && selectedTime && (activePlanNames.length > 0)){
            const results = await wixData.query("Pets")
                .eq("ownerId", member._id)
                .hasSome("size", activePlanNames)
                .find();

            if (results.items.length > 0) {
                const petOptions = results.items.map(pet => ({
                    label: pet.firstName,
                    value: pet._id
                }));

                $w("#petDropdown").options = petOptions;
                $w("#petDropdown").enable();  // Enable time slot dropdown
            } else {
                $w("#planPrompt").text = "No pet with applicable subscription plan.";
                $w("#planPrompt").show();
            }
        } else {
            $w("#petDropdown").options = [];
            $w("#petDropdown").disable();  // Enable time slot dropdown

            if (activePlanNames.length == 0){
                $w("#planPrompt").text = "No applicable subscription plan.";
                $w("#planPrompt").show();
            }

        }
    }

    // Enable book button
    async function enableBook() {
        const location = $w("#locationPicker").value;
        const serviceType = $w("#servicePicker").value;
        const selectedDate = $w("#datePicker").value;
        const selectedTime = $w("#timePicker").value;
        const selectedPet = $w('#petDropdown').value;

        // All dropdowns must have a value
        if (location && serviceType && selectedDate && selectedPet && (selectedTime.length)){
            $w("#bookButton").enable()
        }else{
            $w("#bookButton").disable()
        }
    }

    // Upon button submission, do the following logic
    $w('#bookButton').onClick((event) => {
        const scheduleId = $w("#timePicker").value;

        wixData.query("schedules")
            .eq("_id", scheduleId)
            .find()
            .then((results) => {
                if (results.items.length > 0) {
                    let items = results.items[0];

                    let serviceType = items.serviceType;
                    let scheduleDate = items.scheduleDate;
                    let scheduleLocation = items.scheduleLocation;

                    let petId = $w("#petDropdown").value;
                    let status = "Booked";

                    wixData.update("schedules", {
                        _id: scheduleId,
                        scheduleId: scheduleId,
                        serviceType: serviceType,
                        scheduleDate: scheduleDate,
                        scheduleLocation: scheduleLocation,
                        petId: petId,
                        status: status
                    });

                    // Email details (reference: https://dev.wix.com/docs/develop-websites/articles/workspace-tools/developer-tools/triggered-emails/sending-a-triggered-email-to-members$0)
                    let checkbox = $w("#emailCheckbox").checked;

                    const options = {
                            variables: {
                                serviceType: serviceType,
                                scheduleDate: scheduleDate.toLocaleDateString("en-US"),
                                scheduleTime: new Date(scheduleDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                                scheduleLocation: scheduleLocation
                            }
                    }

                    // Only works in production
                    if(checkbox == true){
                        triggeredEmails.emailMember("UTMh5Cn", member._id, options);
                    }

                    // Show a confirmation message
                    $w("#confirmationText").text = "Booking confirmed!";
                    $w("#confirmationText").show();
                    $w("#bookButton").disable()
                } else {
                    $w("#confirmationText").text = "Please select a pet, date, and time slot to book.";
                    $w("#confirmationText").show();
                }
            });
    });
});