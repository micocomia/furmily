// Testing Git integration
import wixUsers from 'wix-users';

$w.onReady(function () {
    let userId = wixUsers.currentUser.id;  // Get the current user's ID

    // Access the dataset your form is connected to
    $w("#petsreg").onBeforeSave(() => {
        let currentData = $w("#petsreg").getCurrentItem();
        let petId = currentData._id

        currentData.ownerId = userId;  // Add user ID to the item being saved
        currentData.petId = petId;

        $w("#petsreg").setFieldValue('ownerId', userId);  // Set the field value to the dataset
        $w("#petsreg").setFieldValue('petId', petId)
        // You can log to verify if the userId is added correctly
        console.log('User ID added to submission:', userId);
        console.log('Pet ID added to submission:', petId);
    });
});