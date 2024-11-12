import wixData from 'wix-data';
import { currentMember } from "wix-members-frontend";

$w.onReady(async function () {
	$w("#petDropdown").onChange(enableDelete);

    const member = await currentMember.getMember();
	const results = await wixData.query("Pets")
			.eq("ownerId", member._id)
			.find();

	const petOptions = results.items.map(pet => ({
		label: pet.firstName,
		value: pet._id
	}));

	$w("#petDropdown").options = petOptions;

    // Enable delete button
    async function enableDelete() {
		$w('#deleteButton').enable();
    }

	$w('#deleteButton').onClick((event) => {
		const selectedPet = $w('#petDropdown').value;

		wixData.remove("Pets", selectedPet)

		$w('#confirmationText').show();
		$w('#deleteButton').disable();
	});
});